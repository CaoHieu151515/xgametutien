import { useState, useCallback } from 'react';
import { StoryPart, StoryResponse, CharacterProfile, WorldSettings, NPC, Choice, AppSettings, GameSnapshot, Item, StoryApiResponse, ToastMessage, StatusEffect } from '../../types';
import { log, startTimer, endTimer } from '../../services/logService';
import { applyStoryResponseToState } from '../../aiPipeline/applyDiff';
import { verifyStoryResponse } from '../../aiPipeline/validate';
import { findBestAvatar } from '../../services/avatarService';
import { GAME_CONFIG } from '../../config/gameConfig';
import * as saveService from '../../services/saveService';
import { calculateBaseStatsForLevel } from '../../services/progressionService';

const processTurnBasedEffects = (
    profile: CharacterProfile,
    npcs: NPC[],
): {
    updatedProfile: CharacterProfile,
    updatedNpcs: NPC[],
    notifications: string[],
    systemEventPrompt: string | null
} => {
    const notifications: string[] = [];
    let systemEventPrompt: string | null = null;
    let updatedProfile = { ...profile, statusEffects: [...profile.statusEffects] };
    let updatedNpcs = npcs.map(npc => ({ ...npc, statusEffects: [...npc.statusEffects] }));

    const processEntity = <T extends CharacterProfile | NPC>(entity: T, isPlayer: boolean): T => {
        if (!entity.statusEffects || entity.statusEffects.length === 0) return entity;
        
        const entityName = isPlayer ? 'Bạn' : `<b>${entity.name}</b>`;
        const maxStats = isPlayer ? { maxHealth: (entity as CharacterProfile).maxHealth, maxMana: (entity as CharacterProfile).maxMana } : calculateBaseStatsForLevel(entity.level);

        const nextEffects: StatusEffect[] = [];

        for (const effect of entity.statusEffects) {
            let effectExpired = false;

            // 1. Duration Countdown
            const durationMatch = effect.duration.match(/(\d+)\s*lượt/i);
            let nextDuration = effect.duration;

            if (durationMatch) {
                const turnsLeft = parseInt(durationMatch[1], 10) - 1;
                if (turnsLeft <= 0) {
                    effectExpired = true;
                    notifications.push(`🍃 Trạng thái "<b>${effect.name}</b>" của ${entityName} đã kết thúc.`);
                } else {
                    nextDuration = `${turnsLeft} lượt`;
                }
            }

            // 2. Tick Effects
            if (effect.tickEffect && !effectExpired) {
                 if (effect.tickEffect.healthChange) {
                    let actualHealthChange = 0;
                    const change = effect.tickEffect.healthChange;
                    if (typeof change === 'string' && change.endsWith('%')) {
                        actualHealthChange = Math.round(maxStats.maxHealth * (parseFloat(change) / 100));
                    } else if (typeof change === 'number') {
                        actualHealthChange = change;
                    }

                    if (actualHealthChange !== 0) {
                        entity.health = Math.max(0, Math.min(maxStats.maxHealth, entity.health + actualHealthChange));
                        if(actualHealthChange < 0) {
                           notifications.push(`🩸 ${entityName} mất <b>${Math.abs(actualHealthChange)} Sinh Lực</b> vì <i>${effect.name}</i>.`);
                        } else {
                           notifications.push(`💚 ${entityName} hồi phục <b>${actualHealthChange} Sinh Lực</b> nhờ <i>${effect.name}</i>.`);
                        }
                    }
                }
                 if (effect.tickEffect.manaChange) {
                    let actualManaChange = 0;
                    const change = effect.tickEffect.manaChange;
                    if (typeof change === 'string' && change.endsWith('%')) {
                        actualManaChange = Math.round(maxStats.maxMana * (parseFloat(change) / 100));
                    } else if (typeof change === 'number') {
                        actualManaChange = change;
                    }
                     if (actualManaChange !== 0) {
                        entity.mana = Math.max(0, Math.min(maxStats.maxMana, entity.mana + actualManaChange));
                        if(actualManaChange < 0) {
                           notifications.push(`💧 ${entityName} mất <b>${Math.abs(actualManaChange)} Linh Lực</b> vì <i>${effect.name}</i>.`);
                        } else {
                           notifications.push(`💧 ${entityName} hồi phục <b>${actualManaChange} Linh Lực</b> nhờ <i>${effect.name}</i>.`);
                        }
                    }
                }
            }

            // 3. Special Expiry Logic (e.g., Birth)
            if (effectExpired && effect.isPregnancyEffect && !systemEventPrompt) {
                 systemEventPrompt = `(Hệ thống) ${entity.name} bắt đầu chuyển dạ. Thời khắc sinh nở đã đến. Hãy mô tả sự kiện này một cách chi tiết và kết quả.`;
            }

            if (!effectExpired) {
                nextEffects.push({ ...effect, duration: nextDuration });
            }
        }

        return { ...entity, statusEffects: nextEffects };
    };

    updatedProfile = processEntity(updatedProfile, true);
    updatedNpcs = updatedNpcs.map(npc => npc.isDead ? npc : processEntity(npc, false));

    return { updatedProfile, updatedNpcs, notifications, systemEventPrompt };
};

const findInconsistentNewEntities = (response: StoryResponse, profile: CharacterProfile, npcs: NPC[], worldSettings: WorldSettings): string[] => {
    const { story, choices = [], newNPCs = [], newLocations = [], newItems = [], newSkills = [], newWorldKnowledge = [] } = response;
    
    // Scan story and all text fields from choices
    const textToScan = [
        story,
        ...choices.map(c => c.title),
        ...choices.map(c => c.benefit),
        ...choices.map(c => c.risk),
        ...choices.map(c => c.specialNote || ''),
    ].join(' ');

    if (!textToScan.trim()) {
        return [];
    }
    
    const newNounRegex = /\[\[(.*?)\]\]/g;
    const mentionedNewNouns = new Set<string>();
    let match;
    while ((match = newNounRegex.exec(textToScan)) !== null) {
        mentionedNewNouns.add(match[1].trim());
    }
    if (mentionedNewNouns.size === 0) return [];

    const allKnownNames = new Set<string>();
    npcs.forEach(n => { allKnownNames.add(n.name); if(n.aliases) n.aliases.split(',').forEach(a => allKnownNames.add(a.trim())); });
    profile.discoveredLocations.forEach(l => allKnownNames.add(l.name));
    profile.skills.forEach(s => allKnownNames.add(s.name));
    (profile.discoveredItems || []).forEach(i => allKnownNames.add(i.name));
    worldSettings.initialKnowledge.forEach(k => allKnownNames.add(k.title));
    allKnownNames.add(profile.name);
    if (profile.talent.name) allKnownNames.add(profile.talent.name);
    if (profile.specialConstitution.name) allKnownNames.add(profile.specialConstitution.name);
    (profile.achievements || []).forEach(a => allKnownNames.add(a.name));

    const newNamesInResponse = new Set<string>();
    newNPCs.forEach(n => newNamesInResponse.add(n.name));
    newLocations.forEach(l => newNamesInResponse.add(l.name));
    newItems.forEach(i => newNamesInResponse.add(i.name));
    newSkills.forEach(s => newNamesInResponse.add(s.name));
    newWorldKnowledge.forEach(k => newNamesInResponse.add(k.title));

    const ghosts: string[] = [];
    for (const noun of mentionedNewNouns) {
        if (!allKnownNames.has(noun) && !newNamesInResponse.has(noun)) {
            ghosts.push(noun);
        }
    }
    return ghosts;
};


interface UseActionLogicProps {
    characterProfile: CharacterProfile | null;
    worldSettings: WorldSettings | null;
    npcs: NPC[];
    history: StoryPart[];
    choices: Choice[];
    gameLog: GameSnapshot[];
    settings: AppSettings;
    api: any;
    apiKeyForService: string;
    setChoices: React.Dispatch<React.SetStateAction<Choice[]>>;
    setHistory: React.Dispatch<React.SetStateAction<StoryPart[]>>;
    setCharacterProfile: React.Dispatch<React.SetStateAction<CharacterProfile | null>>;
    setNpcs: React.Dispatch<React.SetStateAction<NPC[]>>;
    setWorldSettings: React.Dispatch<React.SetStateAction<WorldSettings | null>>;
    setGameLog: React.Dispatch<React.SetStateAction<GameSnapshot[]>>;
    setToast: React.Dispatch<React.SetStateAction<ToastMessage | null>>;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setLastFailedCustomAction: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useActionLogic = (props: UseActionLogicProps) => {
    const {
        characterProfile, worldSettings, npcs, history, choices, gameLog, settings, api, apiKeyForService,
        setChoices, setHistory, setCharacterProfile, setNpcs, setWorldSettings, setGameLog, setToast,
        setIsLoading, setError, setLastFailedCustomAction
    } = props;

    const handleAction = useCallback(async (choice: Choice) => {
        if (!characterProfile || !worldSettings) return;
        
        const actionLogicSource = 'useActionLogic.ts';
        startTimer('total_action_logic', actionLogicSource, 'Xử lý hành động của người chơi');

        // --- STEP 1: Process turn-based effects BEFORE doing anything else ---
        startTimer('process_turn_effects', actionLogicSource, 'Xử lý hiệu ứng theo lượt');
        const { updatedProfile, updatedNpcs, notifications: preTurnNotifications, systemEventPrompt } = processTurnBasedEffects(characterProfile, npcs);
        endTimer('process_turn_effects', actionLogicSource);
        
        const currentProfile = updatedProfile;
        const currentNpcs = updatedNpcs;

        try {
            startTimer('autosave', actionLogicSource, 'Tự động lưu đầu lượt');
            await saveService.saveGame(currentProfile, worldSettings, currentNpcs, history, choices, gameLog);
            endTimer('autosave', actionLogicSource);
        } catch(e) {
            endTimer('autosave', actionLogicSource, 'Thất bại');
            log('useActionLogic.ts', `Autosave failed: ${(e as Error).message}`, 'ERROR');
            setToast({ message: `Lỗi tự động lưu game: ${(e as Error).message}`, type: 'error' });
        }

        log('useActionLogic.ts', `Player action: "${choice.title}"`, 'FUNCTION');

        setIsLoading(true);
        setError(null);
        setToast(null);
        setLastFailedCustomAction(null);
        
        const isSuccess = Math.random() * 100 < choice.successChance;
        const successText = isSuccess ? '(Thành công)' : '(Thất bại)';
        let actionPromptText = systemEventPrompt || `${successText} Người chơi đã chọn hành động: "${choice.title}" (Thời gian thực hiện ước tính: ${choice.durationInMinutes} phút). Ghi chú đặc biệt của hành động này là: "${choice.specialNote || 'Không có'}".`;
        if (systemEventPrompt) {
            log('useActionLogic.ts', `System event triggered, overriding player action: "${systemEventPrompt}"`, 'INFO');
            setToast({ message: 'Một sự kiện quan trọng đã xảy ra!', type: 'info' });
        }

        const { randomEncounterChance, sfwEventWeights, nsfwEventWeights } = GAME_CONFIG.events;
        if (!choice.isTimeSkip && choice.durationInMinutes > 0 && Math.random() < randomEncounterChance) {
            const weights = settings.isMature ? nsfwEventWeights : sfwEventWeights;
            const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
            let random = Math.random() * totalWeight;
            for (const [type, weight] of Object.entries(weights)) {
                if (random < weight) {
                    const eventType = type.replace(/_/g, ' ');
                    actionPromptText = `(Hệ thống) Trong lúc nhân vật đang hành động, một sự kiện ngẫu nhiên thuộc loại '${eventType}' đã xảy ra. Hãy mô tả chi tiết sự kiện này và kết hợp nó một cách liền mạch với hành động gốc của người chơi.\n\nHành động và kết quả gốc:\n${actionPromptText}`;
                    log('useActionLogic.ts', `Triggered random event of type: ${type}`, 'INFO');
                    setToast({ message: 'Một sự kiện bất ngờ đã xảy ra!', type: 'info' });
                    break;
                }
                random -= weight;
            }
        }

        const preActionState = { characterProfile: currentProfile, worldSettings, npcs: currentNpcs, history, choices };
        const newActionPart: StoryPart = { id: Date.now(), type: 'action', text: choice.title };

        setChoices([]);
        
        let historyText = 'Chưa có lịch sử.';
        const historySize = settings.historyContextSize;
        if (historySize > 0 && gameLog.length > 0) {
            const relevantSnapshots = gameLog.slice(-historySize);
            const numFullTurns = 5; // The number of most recent turns to show in full detail.

            historyText = relevantSnapshots.map((snapshot, index) => {
                const isFullTurn = index >= relevantSnapshots.length - numFullTurns;

                const action = snapshot.turnContent.playerAction
                    ? `> Hành động: ${snapshot.turnContent.playerAction.text}`
                    : '> Bắt đầu câu chuyện.';
                
                let result;
                if (isFullTurn) {
                    // Full content for recent turns
                    result = `>> Kết quả: ${snapshot.turnContent.storyResult.text}`;
                } else {
                    // Summarized/filtered content for older turns
                    const notifications = snapshot.turnContent.storyResult.notifications;
                    if (notifications && notifications.length > 0) {
                        // Strip HTML tags for the prompt
                        const cleanNotifications = notifications.map(n => n.replace(/<[^>]*>?/gm, ''));
                        result = `>> Diễn biến chính:\n- ${cleanNotifications.join('\n- ')}`;
                    } else {
                        // If no notifications, provide a very short summary of the text
                        const storyText = snapshot.turnContent.storyResult.text;
                        const firstSentence = storyText.split(/[.!?]/)[0];
                        result = `>> Diễn biến chính: ${firstSentence}.`;
                    }
                }

                return `Lượt ${snapshot.turnNumber}\n${action}\n${result}`;
            }).join('\n\n');
        }
            
        const MAX_RETRIES = GAME_CONFIG.ai.maxRetries;
        let storyResponse: StoryResponse | null = null;
        let usageMetadata: StoryApiResponse['usageMetadata'] | undefined;
        let lastErrorReason = '';

        for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
            try {
                let currentActionText = actionPromptText;
                if(choice.isTimeSkip && choice.turnsToSkip) {
                    currentActionText = `(Hệ thống) Người chơi quyết định bỏ qua thời gian. Hãy tua nhanh ${choice.turnsToSkip} lượt và tóm tắt những sự kiện chính đã xảy ra.`
                } else if (attempt > 1 && lastErrorReason) {
                    currentActionText = `**System Correction (Attempt ${attempt}):** Your previous response was invalid due to: "${lastErrorReason}". YOU MUST FIX THIS. If you mention a new entity using [[...]] syntax in the story or choices, you MUST define it in the appropriate array (newNPCs, newLocations, newItems, newSkills, or newWorldKnowledge). Do not update NPCs that are not in the provided context.\n\n**Original Action & Result:**\n${actionPromptText}`;
                }
                
                startTimer('ai_call', actionLogicSource, `Gọi API AI (lần thử ${attempt})`);
                const apiResponse = await api.getNextStoryStep(historyText, currentActionText, settings, currentProfile, worldSettings, currentNpcs, apiKeyForService);
                endTimer('ai_call', actionLogicSource);
                
                log('useActionLogic.ts', `[Attempt ${attempt}] Received story response from API.`, 'API');

                storyResponse = apiResponse.storyResponse;
                usageMetadata = apiResponse.usageMetadata;
                
                // FIX+: Trim recap/duplicate content from AI response
                if (storyResponse?.story) {
                    let cleaned = storyResponse.story.trim();
                    const recapOpeners = [/^tóm\stắt/i, /^trước\sđó/i, /^như\sđã/i, /^ở\slượt\strước/i, /^sau\snhững\sgì/i, /^từ\snhững\sdiễn\sbiến\s*trước/i];
                    const lines = cleaned.split(/\n+/);
                    while (lines.length > 0 && recapOpeners.some(rx => rx.test(lines[0].trim()))) {
                        lines.shift();
                    }
                    cleaned = lines.join('\n').trim();
                    cleaned = cleaned.replace(/(^|\n)---\sLượt\s\d+\s*---[\s\S]?(?=\n---\sLượt\s*\d+\s*---|\n*$)/g, '').trim();
                    storyResponse.story = cleaned;
                }

                // Structural and logical verification
                verifyStoryResponse(storyResponse, currentProfile, currentNpcs, worldSettings);

                // Self-correction verification for ghost entities
                const ghostEntityNames = findInconsistentNewEntities(storyResponse, currentProfile, currentNpcs, worldSettings);
                if (ghostEntityNames.length > 0) {
                    throw new Error(`AI mentioned new entities [[...]] but did not define them: ${ghostEntityNames.join(', ')}.`);
                }
                
                log('useActionLogic.ts', `[Attempt ${attempt}] AI response passed all verifications.`, 'INFO');
                break; // Success

            } catch (e) {
                lastErrorReason = (e as Error).message;
                endTimer('ai_call', actionLogicSource, 'Thất bại');
                log('useActionLogic.ts', `[Attempt ${attempt}] Failed. Reason: ${lastErrorReason}. Retrying...`, 'ERROR');
                if (attempt > MAX_RETRIES) {
                    const errorMessage = `Lỗi khi xử lý bước tiếp theo sau ${attempt} lần thử: ${lastErrorReason}`;
                    log('useActionLogic.ts', errorMessage, 'ERROR');
                    setToast({ message: `Lỗi khi tạo bước tiếp theo của câu chuyện: ${lastErrorReason}`, type: 'error' });
                    setChoices(preActionState.choices);
                    if (choice.isCustom) setLastFailedCustomAction(choice.title);
                    setIsLoading(false);
                    return;
                }
            }
        }
        
        if (!storyResponse) {
             const finalError = "Không nhận được phản hồi hợp lệ từ AI sau nhiều lần thử.";
             log('useActionLogic.ts', finalError, 'ERROR');
             setToast({ message: finalError, type: 'error' });
             setChoices(preActionState.choices);
             setIsLoading(false);
             return;
        }

        if (storyResponse.newNPCs?.length) {
            const allNpcsForContext = [...currentNpcs, ...storyResponse.newNPCs];
            const avatarUpdatePromises = storyResponse.newNPCs.map(async (newNpc) => {
                if (!newNpc.avatarUrl) {
                    const allOtherNpcs = allNpcsForContext.filter(n => n.id !== newNpc.id);
                    const avatarUrl = await findBestAvatar(newNpc, allOtherNpcs);
                    if (avatarUrl) return { ...newNpc, avatarUrl };
                }
                return newNpc;
            });
            storyResponse.newNPCs = await Promise.all(avatarUpdatePromises);
        }

        if (usageMetadata?.totalTokenCount) {
            setToast({ message: `Đã sử dụng ${usageMetadata.totalTokenCount.toLocaleString()} tokens.`, type: 'info' });
        }

        const newTurnNumber = (gameLog[gameLog.length - 1]?.turnNumber || 0) + 1;
        
        try {
            startTimer('apply_state', actionLogicSource, 'Áp dụng các thay đổi trạng thái');
            let { nextProfile, nextNpcs, finalWorldSettings, notifications } = await applyStoryResponseToState({
                storyResponse, characterProfile: currentProfile, npcs: currentNpcs, worldSettings, settings, choice, turnNumber: newTurnNumber, isSuccess,
                api, apiKey: apiKeyForService, preTurnNotifications,
            });
            endTimer('apply_state', actionLogicSource);

            if (!choice.isTimeSkip && !systemEventPrompt) {
                // Duration countdowns were already handled at the start. No need to do it again.
            }

            const newStoryPart: StoryPart = { id: Date.now() + 1, type: 'story', text: storyResponse.story, notifications };
            const newSnapshot: GameSnapshot = { turnNumber: newTurnNumber, preActionState, turnContent: { playerAction: newActionPart, storyResult: newStoryPart } };
            
            const finalHistory = [...history, newActionPart, newStoryPart];
            const finalChoices = storyResponse.choices;
            
            let logWithNewTurn = [...gameLog, newSnapshot];
            const maxRewindableTurns = GAME_CONFIG.ui.maxRewindableTurns;
            const finalGameLog = logWithNewTurn.map((snapshot, index, arr) => {
                if (arr.length > maxRewindableTurns && index < arr.length - maxRewindableTurns) {
                    const { preActionState, ...prunedSnapshot } = snapshot;
                    return prunedSnapshot as GameSnapshot;
                }
                return snapshot;
            });

            setGameLog(finalGameLog);
            setHistory(finalHistory);
            setChoices(finalChoices);
            setCharacterProfile(nextProfile);
            setNpcs(nextNpcs);
            setWorldSettings(finalWorldSettings);

        } catch (e: any) {
            const errorMessage = `Lỗi khi áp dụng trạng thái: ${e.message}`;
            endTimer('apply_state', actionLogicSource, 'Thất bại');
            log('useActionLogic.ts', errorMessage, 'ERROR');
            setToast({ message: `Lỗi khi xử lý câu chuyện: ${e.message}`, type: 'error' });
            setChoices(preActionState.choices);
            if (choice.isCustom) setLastFailedCustomAction(choice.title);
        } finally {
            setIsLoading(false);
            endTimer('total_action_logic', actionLogicSource);
        }
    }, [characterProfile, worldSettings, npcs, history, choices, gameLog, settings, api, apiKeyForService, setChoices, setHistory, setCharacterProfile, setNpcs, setWorldSettings, setGameLog, setToast, setIsLoading, setError, setLastFailedCustomAction]);
    
    const handleUseItem = useCallback((item: Item) => {
        log('useActionLogic.ts', `Player uses item: "${item.name}"`, 'FUNCTION');
        const useChoice: Choice = {
            title: `Sử dụng 1 vật phẩm "${item.name}" (ID: ${item.id}).`,
            benefit: item.effectsDescription || 'Chưa rõ',
            risk: 'Có thể có tác dụng phụ',
            successChance: 95,
            durationInMinutes: 0,
        };
        handleAction(useChoice);
    }, [handleAction]);

    const handleTimeSkip = useCallback((turns: number) => {
        log('useActionLogic.ts', `Player skips time: ${turns} turns`, 'FUNCTION');
        const timeSkipChoice: Choice = {
            title: `(Hệ thống) Người chơi quyết định bỏ qua ${turns} lượt.`,
            benefit: 'Thời gian trôi qua, các sự kiện dài hạn có thể được giải quyết.',
            risk: 'Thế giới vận động không thể lường trước.',
            successChance: 100,
            durationInMinutes: turns * GAME_CONFIG.gameplay.time.minutesPerTurn,
            isTimeSkip: true,
            turnsToSkip: turns
        };
        handleAction(timeSkipChoice);
    }, [handleAction]);

    return {
        handleAction,
        handleUseItem,
        handleTimeSkip
    };
};