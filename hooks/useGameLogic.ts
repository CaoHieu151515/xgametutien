import { useState, useCallback, useMemo, useEffect } from 'react';
import * as geminiService from '../services/geminiService';
import * as openaiService from '../services/openaiService';
import * as saveService from '../services/saveService';
import { StoryPart, StoryResponse, GameState, NarrativePerspective, CharacterProfile, WorldSettings, StatusEffect, Skill, Location, NPC, NewNPCFromAI, WorldKnowledge, Choice, ApiProvider, AppSettings, GameSnapshot, Item, ItemType, FullGameState, StoryApiResponse, CharacterGender, ToastMessage } from '../types';
import { processLevelUps, getRealmDisplayName, calculateBaseStatsForLevel, getLevelFromRealmName } from '../services/progressionService';
import { log } from '../services/logService';
import { applyStoryResponseToState } from '../aiPipeline/applyDiff';
import { verifyStoryResponse } from '../utils/stateVerifier';
import { findBestAvatar } from '../services/avatarService';
import { GAME_CONFIG } from '../config/gameConfig';

const SETTINGS_KEY = 'tuTienTruyenSettings_v2';
const USE_DEFAULT_KEY_IDENTIFIER = '_USE_DEFAULT_KEY_';

const parseTurnDuration = (duration: string): number | null => {
    const match = duration.match(/(\d+)\s*lượt/i);
    return match ? parseInt(match[1], 10) : null;
};

const updateStatusEffectDurations = <T extends CharacterProfile | NPC>(entity: T): T => {
    if (!entity.statusEffects || entity.statusEffects.length === 0) {
        return entity;
    }

    const updatedEffects = entity.statusEffects.map(effect => {
        const turns = parseTurnDuration(effect.duration);
        if (turns !== null && turns > 0) {
            const newTurns = turns - 1;
            if (newTurns > 0) {
                return { ...effect, duration: `${newTurns} lượt` };
            }
            return null;
        }
        return effect;
    }).filter((effect): effect is StatusEffect => effect !== null);

    return { ...entity, statusEffects: updatedEffects };
};

/**
 * Finds inconsistencies in the AI's response regarding new entities.
 * Checks for proper nouns marked with [[...]] in the story that are not defined
 * in the response's new entity lists (NPCs, locations, items, etc.).
 * @param response The story response from the AI.
 * @param profile The current character profile.
 * @param npcs The current list of NPCs.
 * @param worldSettings The current world settings.
 * @returns An array of names of "ghost" entities.
 */
const findInconsistentNewEntities = (
    response: StoryResponse,
    profile: CharacterProfile,
    npcs: NPC[],
    worldSettings: WorldSettings
): string[] => {
    const { story, newNPCs = [], newLocations = [], newItems = [], newSkills = [], newWorldKnowledge = [] } = response;
    if (!story) return [];

    // 1. Find all nouns marked as new by the AI
    const newNounRegex = /\[\[(.*?)\]\]/g;
    const mentionedNewNouns = new Set<string>();
    let match;
    while ((match = newNounRegex.exec(story)) !== null) {
        mentionedNewNouns.add(match[1].trim());
    }
    if (mentionedNewNouns.size === 0) return [];

    // 2. Build a set of all known names (current state)
    const allKnownNames = new Set<string>();
    npcs.forEach(n => { allKnownNames.add(n.name); if(n.aliases) n.aliases.split(',').forEach(a => allKnownNames.add(a.trim())); });
    profile.discoveredLocations.forEach(l => allKnownNames.add(l.name));
    profile.skills.forEach(s => allKnownNames.add(s.name));
    (profile.discoveredItems || []).forEach(i => allKnownNames.add(i.name));
    worldSettings.initialKnowledge.forEach(k => allKnownNames.add(k.title));
    allKnownNames.add(profile.name);
    // Add character's talent and constitution names to known entities
    if (profile.talent.name) {
        allKnownNames.add(profile.talent.name);
    }
    if (profile.specialConstitution.name) {
        allKnownNames.add(profile.specialConstitution.name);
    }
    (profile.achievements || []).forEach(a => allKnownNames.add(a.name));

    // 3. Build a set of all new names defined in the response
    const newNamesInResponse = new Set<string>();
    newNPCs.forEach(n => newNamesInResponse.add(n.name));
    newLocations.forEach(l => newNamesInResponse.add(l.name));
    newItems.forEach(i => newNamesInResponse.add(i.name));
    newSkills.forEach(s => newNamesInResponse.add(s.name));
    newWorldKnowledge.forEach(k => newNamesInResponse.add(k.title));

    // 4. Find inconsistencies
    const ghosts: string[] = [];
    for (const noun of mentionedNewNouns) {
        // A ghost is a noun marked as new, that is NOT in the current known names, AND is NOT in the newly defined names.
        if (!allKnownNames.has(noun) && !newNamesInResponse.has(noun)) {
            ghosts.push(noun);
        }
    }
    return ghosts;
};


export const useGameLogic = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.HOME);
    const [hasSaves, setHasSaves] = useState<boolean>(false);
    const [characterProfile, setCharacterProfile] = useState<CharacterProfile | null>(null);
    const [worldSettings, setWorldSettings] = useState<WorldSettings | null>(null);
    const [settings, setSettings] = useState<AppSettings>(() => {
        const defaultSettings: AppSettings = {
            isMature: false,
            perspective: NarrativePerspective.SECOND_PERSON,
            apiProvider: ApiProvider.GEMINI,
            openaiApiKey: '',
            gemini: {
                useDefault: true,
                customKeys: [],
                activeCustomKeyId: null
            },
            historyContextSize: 10,
            storyFontSize: 18,
            avatarBackgroundOpacity: 50,
            storyBackgroundOpacity: 70,
        };
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                log('useGameLogic.ts', 'Loaded settings from localStorage.', 'STATE');
                return { ...defaultSettings, ...parsed, gemini: { ...defaultSettings.gemini, ...(parsed.gemini || {}) } };
            }
            return defaultSettings;
        } catch {
            return defaultSettings;
        }
    });

    const api = useMemo(() => {
        if (settings.apiProvider === ApiProvider.OPENAI) {
            return openaiService; 
        }
        return geminiService;
    }, [settings.apiProvider]);

    const apiKeyForService = useMemo(() => {
        if (settings.apiProvider === ApiProvider.OPENAI) {
            return settings.openaiApiKey;
        }
        // For Gemini
        if (settings.gemini.useDefault) {
            return USE_DEFAULT_KEY_IDENTIFIER;
        }
        const activeKey = settings.gemini.customKeys.find(k => k.id === settings.gemini.activeCustomKeyId);
        return activeKey ? activeKey.key : '';

    }, [settings]);

    const [history, setHistory] = useState<StoryPart[]>([]);
    const [displayHistory, setDisplayHistory] = useState<StoryPart[]>([]);
    const [choices, setChoices] = useState<Choice[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<ToastMessage | null>(null);
    const [lastFailedCustomAction, setLastFailedCustomAction] = useState<string | null>(null);
    const [npcs, setNpcs] = useState<NPC[]>([]);
    const [gameLog, setGameLog] = useState<GameSnapshot[]>([]);
    const [isRewindAndSavePending, setIsRewindAndSavePending] = useState(false);


    const clearToast = useCallback(() => setToast(null), []);

    useEffect(() => {
        log('useGameLogic.ts', `Game state changed to: ${GameState[gameState]}`, 'STATE');
        if (gameState === GameState.HOME) {
            const checkSaves = async () => {
                setIsLoading(true);
                try {
                    const saves = await saveService.getAllSavesMetadata();
                    setHasSaves(saves.length > 0);
                } catch (e) {
                    console.error("Could not check for saves", e);
                    setHasSaves(false);
                } finally {
                    setIsLoading(false);
                }
            };
            checkSaves();
        }
    }, [gameState]);
    
    const handleUpdateLocation = useCallback((updatedLocation: Location) => {
        log('useGameLogic.ts', `Updating location: ${updatedLocation.name}`, 'FUNCTION');
        setCharacterProfile(prev => {
            if (!prev) return null;
            return {
                ...prev,
                discoveredLocations: prev.discoveredLocations.map(loc => 
                    loc.id === updatedLocation.id ? updatedLocation : loc
                )
            };
        });
    }, []);

    const handleUpdateWorldSettings = useCallback((newSettings: WorldSettings) => {
        log('useGameLogic.ts', 'Updating world settings.', 'FUNCTION');
        setWorldSettings(newSettings);
    }, []);

    const handleAction = useCallback(async (choice: Choice) => {
        if (!characterProfile || !worldSettings) return;

        // TỰ ĐỘNG LƯU VÀO ĐẦU LƯỢT CHƠI
        try {
            await saveService.saveGame(
                characterProfile,
                worldSettings,
                npcs,
                history,
                choices, // Lưu các lựa chọn có sẵn tại thời điểm bắt đầu lượt
                gameLog
            );
            log('useGameLogic.ts', 'Autosave successful at turn start.', 'INFO');
        } catch(e) {
            log('useGameLogic.ts', `Autosave failed: ${(e as Error).message}`, 'ERROR');
            setToast({ message: `Lỗi tự động lưu game: ${(e as Error).message}`, type: 'error' });
            // Không dừng game, chỉ thông báo lỗi
        }
        // KẾT THÚC TỰ ĐỘNG LƯU

        log('useGameLogic.ts', `Player action: "${choice.title}"`, 'FUNCTION');

        setIsLoading(true);
        setError(null);
        setToast(null);
        setLastFailedCustomAction(null);
        
        let modifiedActionText = choice.title;

        // --- START: Random Event Logic ---
        const { randomEncounterChance, sfwEventWeights, nsfwEventWeights } = GAME_CONFIG.events;
        // Chỉ kích hoạt sự kiện cho các hành động có tốn thời gian
        if (!choice.isTimeSkip && choice.durationInMinutes > 0 && Math.random() < randomEncounterChance) {
            const weights = settings.isMature ? nsfwEventWeights : sfwEventWeights;
            const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
            let random = Math.random() * totalWeight;

            for (const [type, weight] of Object.entries(weights)) {
                if (random < weight) {
                    const eventType = type.replace(/_/g, ' '); // e.g., sexual_opportunity -> sexual opportunity
                    modifiedActionText = `(Hệ thống) Trong lúc nhân vật đang hành động, một sự kiện ngẫu nhiên thuộc loại '${eventType}' đã xảy ra. Hãy mô tả chi tiết sự kiện này và kết hợp nó một cách liền mạch với hành động gốc của người chơi.\n\nHành động gốc của người chơi:\n${choice.title}`;
                    log('useGameLogic.ts', `Triggered random event of type: ${type}`, 'INFO');
                    setToast({ message: 'Một sự kiện bất ngờ đã xảy ra!', type: 'info' });
                    break;
                }
                random -= weight;
            }
        }
        // --- END: Random Event Logic ---

        const preActionState = { characterProfile, worldSettings, npcs, history, choices };

        const newActionPart: StoryPart = {
            id: Date.now(),
            type: 'action',
            text: choice.title // Ghi lại hành động gốc, không phải hành động đã sửa đổi
        };

        setChoices([]);
        
        let historyText = '';
        const historySize = settings.historyContextSize;
        if (historySize > 0 && history.length > 0) {
            const verbatimTurns = 3;
            const historyPartsToTake = historySize * 2;
            const relevantHistory = history.slice(-historyPartsToTake);
        
            const verbatimPartsCount = Math.min(relevantHistory.length, verbatimTurns * 2);
            const verbatimHistory = relevantHistory.slice(-verbatimPartsCount);
            const summaryHistory = relevantHistory.slice(0, relevantHistory.length - verbatimPartsCount);
        
            const summaryLines: string[] = [];
            if (summaryHistory.length > 0) {
                summaryLines.push("Tóm tắt các sự kiện trước đó:");
                
                let startIndex = 0;
                // If the summary part starts with a story (S0), skip it and start pairing from A1.
                if (summaryHistory.length > 0 && summaryHistory[0].type === 'story') {
                    startIndex = 1;
                }
        
                for (let i = startIndex; i < summaryHistory.length; i += 2) {
                    const actionPart = summaryHistory[i];
                    const storyPart = summaryHistory[i + 1];
        
                    if (actionPart && actionPart.type === 'action' && storyPart && storyPart.type === 'story') {
                        const firstSentenceMatch = storyPart.text.match(/[^.!?]+[.!?]/);
                        const storySummary = (firstSentenceMatch ? firstSentenceMatch[0] : (storyPart.text.substring(0, 150) + '...')).replace(/\s+/g, ' ').trim();
                        summaryLines.push(`- Người chơi: ${actionPart.text}. Kết quả: ${storySummary}`);
                    }
                }
            }
        
            const summaryText = summaryLines.join('\n');
        
            const verbatimText = verbatimHistory
                .map(part => `${part.type === 'story' ? 'Bối cảnh' : 'Người chơi'}: ${part.text}`)
                .join('\n');
        
            if (summaryText) {
                historyText = `${summaryText}\n\n---\n\nLịch sử gần đây (chi tiết):\n${verbatimText}`;
            } else {
                historyText = verbatimText;
            }
        }
            
        const MAX_RETRIES = GAME_CONFIG.ai.maxRetries;
        let storyResponse: StoryResponse | null = null;
        let usageMetadata: StoryApiResponse['usageMetadata'] | undefined;
        let lastErrorReason = '';


        for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
            try {
                let currentActionText = modifiedActionText; // Sử dụng hành động đã có thể được sửa đổi
                if(choice.isTimeSkip && choice.turnsToSkip) {
                    currentActionText = `(Hệ thống) Người chơi quyết định bỏ qua thời gian. Hãy tua nhanh ${choice.turnsToSkip} lượt và tóm tắt những sự kiện chính đã xảy ra.`
                }
                else if (attempt > 1 && lastErrorReason) {
                    currentActionText = `**System Correction (Attempt ${attempt}):** Your previous response was invalid due to: "${lastErrorReason}". YOU MUST FIX THIS. If you mention a new NPC, you MUST define them in 'newNPCs'. Do not update NPCs that are not in the provided context.\n\n**Original Action:**\n${modifiedActionText}`;
                }

                const apiResponse = await api.getNextStoryStep(historyText, currentActionText, settings.isMature, settings.perspective, characterProfile, worldSettings, npcs, apiKeyForService);
                log('useGameLogic.ts', `[Attempt ${attempt}] Received story response from API.`, 'API');

                // --- START OF VERIFICATION LOGIC ---
                let isConsistent = true;
                let errorReason = '';

                // 1. Check for ghost updates (updating non-existent NPCs)
                if (apiResponse.storyResponse.updatedNPCs) {
                    const currentNpcIds = new Set(npcs.map(n => n.id));
                    const newNpcIdsInThisResponse = new Set((apiResponse.storyResponse.newNPCs || []).map(n => n.id));
                    
                    const ghostUpdateIds = apiResponse.storyResponse.updatedNPCs
                        .filter(update => !currentNpcIds.has(update.id) && !newNpcIdsInThisResponse.has(update.id))
                        .map(update => update.id);
                    
                    if (ghostUpdateIds.length > 0) {
                        isConsistent = false;
                        errorReason = `AI tried to update non-existent NPC IDs: ${ghostUpdateIds.join(', ')}. An NPC must be in the current context or created in 'newNPCs' in the SAME response before it can be updated.`;
                    }
                }

                // 2. Check for ghost entities ([[...]])
                if (isConsistent) {
                    const ghostEntityNames = findInconsistentNewEntities(apiResponse.storyResponse, characterProfile, npcs, worldSettings);
                    if (ghostEntityNames.length > 0) {
                        isConsistent = false;
                        errorReason = `AI mentioned new entities [[...]] but did not define them: ${ghostEntityNames.join(', ')}.`;
                    }
                }
                // --- END OF VERIFICATION LOGIC ---
                
                if (!isConsistent) {
                    lastErrorReason = errorReason;
                    log('useGameLogic.ts', `[Attempt ${attempt}] Inconsistent response: ${lastErrorReason} Retrying...`, 'ERROR');
                    if (attempt > MAX_RETRIES) {
                        throw new Error(`AI liên tục tạo ra phản hồi không nhất quán: ${lastErrorReason}`);
                    }
                    continue; // Loop will continue to the next attempt
                }
                
                // If consistent, proceed
                log('useGameLogic.ts', `[Attempt ${attempt}] AI response is consistent.`, 'INFO');
                storyResponse = apiResponse.storyResponse;
                usageMetadata = apiResponse.usageMetadata;
                break; // Success, exit the retry loop

            } catch (e) {
                if (attempt > MAX_RETRIES) {
                    const errorMessage = `Lỗi khi xử lý bước tiếp theo sau ${attempt} lần thử: ${(e as Error).message}`;
                    log('useGameLogic.ts', errorMessage, 'ERROR');
                    setToast({ message: `Lỗi khi tạo bước tiếp theo của câu chuyện: ${(e as Error).message}`, type: 'error' });
                    setChoices(preActionState.choices);
                    if (choice.isCustom) {
                        setLastFailedCustomAction(choice.title);
                    }
                    setIsLoading(false);
                    return;
                }
            }
        }
        
        if (!storyResponse) {
             const finalError = "Không nhận được phản hồi hợp lệ từ AI sau nhiều lần thử.";
             log('useGameLogic.ts', finalError, 'ERROR');
             setToast({ message: finalError, type: 'error' });
             setChoices(preActionState.choices);
             setIsLoading(false);
             return;
        }

        // Find avatars for new NPCs before applying state changes
        if (storyResponse.newNPCs?.length) {
            const allNpcsForContext = [...npcs, ...storyResponse.newNPCs];
            const avatarUpdatePromises = storyResponse.newNPCs.map(async (newNpc) => {
                if (!newNpc.avatarUrl) {
                    const allOtherNpcs = allNpcsForContext.filter(n => {
                        if (!n.id || !newNpc.id) return true;
                        return n.id !== newNpc.id;
                    });
                    const avatarUrl = await findBestAvatar(newNpc, allOtherNpcs);
                    if (avatarUrl) {
                        return { ...newNpc, avatarUrl };
                    }
                }
                return newNpc;
            });
            storyResponse.newNPCs = await Promise.all(avatarUpdatePromises);
        }

        if (usageMetadata?.totalTokenCount) {
            setToast({
                message: `Đã sử dụng ${usageMetadata.totalTokenCount.toLocaleString()} tokens.`,
                type: 'info',
            });
        }

        const newTurnNumber = (gameLog[gameLog.length - 1]?.turnNumber || 0) + 1;

        try {
            // Xác minh tính nhất quán logic của phản hồi AI trước khi áp dụng
            verifyStoryResponse(storyResponse, characterProfile, npcs, worldSettings);
            log('useGameLogic.ts', 'AI response passed final verification.', 'INFO');
            
            let { nextProfile, nextNpcs, finalWorldSettings, notifications } = await applyStoryResponseToState({
                storyResponse,
                characterProfile,
                npcs,
                worldSettings,
                settings,
                choice,
                turnNumber: newTurnNumber,
            });

            // Apply turn-based status effect duration updates only for non-time-skip actions
            if (!choice.isTimeSkip) {
                nextProfile = updateStatusEffectDurations(nextProfile);
                nextNpcs = nextNpcs.map(npc => updateStatusEffectDurations(npc));
            }

            const newStoryPart: StoryPart = {
                id: Date.now() + 1,
                type: 'story',
                text: storyResponse.story,
                notifications,
            };

            
            const newSnapshot: GameSnapshot = {
                turnNumber: newTurnNumber,
                preActionState,
                turnContent: {
                    playerAction: newActionPart,
                    storyResult: newStoryPart,
                },
            };
            
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
            log('useGameLogic.ts', errorMessage, 'ERROR');
            setToast({ message: `Lỗi khi xử lý câu chuyện: ${e.message}`, type: 'error' });
            setChoices(preActionState.choices);
            if (choice.isCustom) {
                setLastFailedCustomAction(choice.title);
            }
        } finally {
            setIsLoading(false);
        }
    }, [characterProfile, worldSettings, npcs, history, choices, gameLog, settings, api, apiKeyForService]);
    
    const handleUseItem = useCallback((item: Item) => {
        log('useGameLogic.ts', `Player uses item: "${item.name}"`, 'FUNCTION');
        
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
        log('useGameLogic.ts', `Player skips time: ${turns} turns`, 'FUNCTION');
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

    useEffect(() => {
        if (history.length === 0) {
            setDisplayHistory([]);
        } else {
            // Always show only the last part of the history.
            // This is either the initial story part, or the result of a player action.
            setDisplayHistory(history.slice(-1)); 
        }
    }, [history]);

    const handleSave = useCallback(async () => {
        if (!characterProfile || !worldSettings) {
            log('useGameLogic.ts', 'Save aborted: profile or world settings are null.', 'ERROR');
            return;
        }
        log('useGameLogic.ts', 'Saving game...', 'FUNCTION');
        setIsLoading(true);
        try {
            await saveService.saveGame(
                characterProfile,
                worldSettings,
                npcs,
                history,
                choices,
                gameLog
            );
            log('useGameLogic.ts', 'Game saved successfully.', 'INFO');
            setToast({ message: 'Đã lưu game thành công!', type: 'success' });
        } catch(e) {
            setToast({ message: `Lỗi khi lưu game: ${(e as Error).message}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [characterProfile, worldSettings, npcs, history, choices, gameLog]);

    const loadState = useCallback((state: {
        characterProfile: CharacterProfile;
        worldSettings: WorldSettings;
        npcs: NPC[];
        history: StoryPart[];
        choices: Choice[];
        gameLog: GameSnapshot[];
    }) => {
        setCharacterProfile(state.characterProfile);
        setWorldSettings(state.worldSettings);
        setNpcs(state.npcs);
        setHistory(state.history);
        setChoices(state.choices);
        setGameLog(state.gameLog);
        setLastFailedCustomAction(null);
    }, []);

    const handleRewind = useCallback((turnNumber: number) => {
        log('useGameLogic.ts', `Rewinding to turn ${turnNumber}`, 'FUNCTION');
        const snapshot = gameLog.find(s => s.turnNumber === turnNumber);
        if (snapshot && snapshot.preActionState) {
            const stateToLoad = {
                ...snapshot.preActionState,
                gameLog: gameLog.filter(s => s.turnNumber < turnNumber)
            };
            loadState(stateToLoad);
            setIsRewindAndSavePending(true); // Flag for auto-save
            log('useGameLogic.ts', 'Rewind successful. Pending auto-save.', 'INFO');
        } else {
            log('useGameLogic.ts', `Rewind failed for turn ${turnNumber}: No rewind data found.`, 'ERROR');
        }
    }, [gameLog, loadState]);

    useEffect(() => {
        if (isRewindAndSavePending && characterProfile && worldSettings) {
            const performAutoSave = async () => {
                log('useGameLogic.ts', 'Performing auto-save after rewind...', 'FUNCTION');
                try {
                    await saveService.saveGame(
                        characterProfile,
                        worldSettings,
                        npcs,
                        history,
                        choices,
                        gameLog
                    );
                    setToast({ message: 'Đã quay lại lượt và tự động lưu game!', type: 'success' });
                } catch (e) {
                    setToast({ message: `Lỗi khi tự động lưu game: ${(e as Error).message}`, type: 'error' });
                } finally {
                    setIsRewindAndSavePending(false);
                }
            };
            performAutoSave();
        }
    }, [isRewindAndSavePending, characterProfile, worldSettings, npcs, history, choices, gameLog]);

    const handleContinue = async () => {
        log('useGameLogic.ts', 'Continuing last game.', 'FUNCTION');
        setIsLoading(true);
        try {
            const saves = await saveService.getAllSavesMetadata();
            if (saves.length > 0) {
                const lastSave = await saveService.getGame(saves[0].id);
                if (lastSave) {
                    handleLoadGame(lastSave);
                } else {
                     setError("Không thể tải bản lưu cuối cùng.");
                     setGameState(GameState.ERROR);
                }
            }
        } catch(e) {
            setError(`Không thể tải bản lưu: ${(e as Error).message}`);
            setGameState(GameState.ERROR);
        }
    };
    
    const handleRestart = useCallback(() => {
        log('useGameLogic.ts', 'Restarting game.', 'FUNCTION');
        setCharacterProfile(null);
        setWorldSettings(null);
        setHistory([]);
        setDisplayHistory([]);
        setChoices([]);
        setNpcs([]);
        setGameLog([]);
        setError(null);
        setToast(null);
        setLastFailedCustomAction(null);
        setGameState(GameState.HOME);
    }, []);
    
    const handleLoadGame = useCallback((saveData: FullGameState) => {
        log('useGameLogic.ts', `Loading game: ${saveData.name}`, 'FUNCTION');
        loadState(saveData);
        setGameState(GameState.PLAYING);
        setIsLoading(false);
    }, [loadState]);
    
    const handleGoHome = useCallback(() => {
        log('useGameLogic.ts', 'Going back to home screen.', 'FUNCTION');
        handleSave();
        handleRestart();
    }, [handleSave, handleRestart]);

    const saveSettings = useCallback((newSettings: AppSettings) => {
        log('useGameLogic.ts', 'Saving settings.', 'FUNCTION');
        setSettings(newSettings);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    }, []);

    const handleStartGame = useCallback(async (profile: CharacterProfile, worldSettings: WorldSettings) => {
        log('useGameLogic.ts', 'Starting new game.', 'FUNCTION');
        setIsLoading(true);
        setError(null);
    
        const newProfile: CharacterProfile = {
            ...profile,
            id: `char_${Date.now()}`,
            items: profile.initialItems || [],
            milestones: [],
            currentLocationId: profile.initialLocations?.[0]?.id || null,
            discoveredLocations: profile.initialLocations || [],
            discoveredMonsters: profile.initialMonsters || [],
            discoveredItems: profile.initialItems || [],
            gameTime: new Date().toISOString(),
        };
        
        // Calculate and set initial stats based on starting level
        const initialStats = calculateBaseStatsForLevel(newProfile.level);
        newProfile.baseMaxHealth = initialStats.maxHealth;
        newProfile.baseMaxMana = initialStats.maxMana;
        newProfile.baseAttack = initialStats.attack;
        newProfile.lifespan = initialStats.lifespan;
        // Set current health/mana to max for a new character
        newProfile.health = initialStats.maxHealth;
        newProfile.mana = initialStats.maxMana;

        const newWorldSettings = { ...worldSettings };
        
        const finalProfile = processLevelUps(newProfile, 0, newWorldSettings);
    
        const initialNpcs: NPC[] = (finalProfile.initialNpcs || []).map((newNpcData: NewNPCFromAI) => {
             const isValidPowerSystem = newWorldSettings.powerSystems.some(ps => ps.name === newNpcData.powerSystem);
             const npcPowerSystem = isValidPowerSystem ? newNpcData.powerSystem : (newWorldSettings.powerSystems[0]?.name || '');
             const stats = calculateBaseStatsForLevel(newNpcData.level);
             return {
                ...newNpcData,
                powerSystem: npcPowerSystem,
                experience: 0,
                health: stats.maxHealth,
                mana: stats.maxMana,
                realm: getRealmDisplayName(newNpcData.level, npcPowerSystem, newWorldSettings),
                memories: [],
                npcRelationships: newNpcData.npcRelationships || [],
                isDaoLu: false,
             };
        });
        
        setCharacterProfile(finalProfile);
        setWorldSettings(newWorldSettings);
        setNpcs(initialNpcs);
    
        try {
            const { storyResponse, usageMetadata } = await api.getInitialStory(finalProfile, newWorldSettings, settings.isMature, settings.perspective, apiKeyForService);
            
            if (usageMetadata?.totalTokenCount) {
                setToast({
                    message: `Đã sử dụng ${usageMetadata.totalTokenCount.toLocaleString()} tokens.`,
                    type: 'info',
                });
            }

            // Unify the logic by using applyStoryResponseToState for the initial turn as well.
            const { nextProfile, nextNpcs, finalWorldSettings, notifications } = await applyStoryResponseToState({
                storyResponse,
                characterProfile: finalProfile,
                npcs: initialNpcs,
                worldSettings: newWorldSettings,
                settings,
                choice: { 
                    title: 'Bắt đầu câu chuyện', 
                    benefit: 'Khởi đầu một cuộc phiêu lưu mới.', 
                    risk: 'Không xác định.', 
                    successChance: 100, 
                    durationInMinutes: 0 
                }, // Dummy choice for initialization
                turnNumber: 1,
            });
            
            const initialStoryPart: StoryPart = { 
                id: Date.now(), 
                type: 'story', 
                text: storyResponse.story, 
                notifications: notifications 
            };
            
            const preActionState = {
                characterProfile: finalProfile, // The state *before* the first story response is applied
                worldSettings: newWorldSettings,
                npcs: initialNpcs,
                history: [],
                choices: [],
            };

            const firstSnapshot: GameSnapshot = {
                turnNumber: 1,
                preActionState,
                turnContent: {
                    storyResult: initialStoryPart,
                },
            };
            
            const initialHistory = [initialStoryPart];
            const initialChoices = storyResponse.choices;
            const initialGameLog: GameSnapshot[] = [firstSnapshot];

            // Set state with the processed data from applyStoryResponseToState
            setCharacterProfile(nextProfile);
            setNpcs(nextNpcs);
            setWorldSettings(finalWorldSettings);
            setHistory(initialHistory);
            setChoices(initialChoices);
            setGameLog(initialGameLog);
            
            // Save the processed initial state
            await saveService.saveGame(
                nextProfile,
                finalWorldSettings,
                nextNpcs,
                initialHistory,
                initialChoices,
                initialGameLog
            );
    
            setGameState(GameState.PLAYING);
        } catch (e: any) {
            setError(`Lỗi khi bắt đầu câu chuyện: ${e.message}`);
            setGameState(GameState.ERROR);
        } finally {
            setIsLoading(false);
        }
    }, [api, apiKeyForService, settings.isMature, settings.perspective, settings]);

    return {
        gameState, setGameState, hasSaves, characterProfile, setCharacterProfile, worldSettings, setWorldSettings, history, displayHistory, npcs, setNpcs, choices, gameLog, isLoading, error, settings, apiKeyForService, toast, clearToast, lastFailedCustomAction,
        handleAction, handleContinue, handleGoHome, handleLoadGame, handleRestart, saveSettings, handleStartGame, handleUpdateLocation, handleUpdateWorldSettings, handleRewind, handleSave, handleUseItem, handleTimeSkip
    };
};