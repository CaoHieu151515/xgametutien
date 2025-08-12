import { useState, useCallback, useMemo, useEffect } from 'react';
import * as geminiService from '../services/geminiService';
import * as openaiService from '../services/openaiService';
import * as saveService from '../services/saveService';
import { StoryPart, StoryResponse, GameState, NarrativePerspective, CharacterProfile, WorldSettings, StatusEffect, Skill, Location, NPC, NewNPCFromAI, WorldKnowledge, Choice, ApiProvider, AppSettings, GameSnapshot, Item, ItemType, FullGameState, StoryApiResponse, CharacterGender, ToastMessage } from '../types';
import { processLevelUps, getRealmDisplayName, calculateBaseStatsForLevel, getLevelFromRealmName } from '../services/progressionService';
import { log } from '../services/logService';
import { applyStoryResponseToState } from '../aiPipeline/applyDiff';

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
        log('useGameLogic.ts', `Player action: "${choice.title}"`, 'FUNCTION');

        setIsLoading(true);
        setError(null);
        setToast(null);
        setLastFailedCustomAction(null);

        const preActionState = { characterProfile, worldSettings, npcs, history, choices };

        const newActionPart: StoryPart = {
            id: Date.now(),
            type: 'action',
            text: choice.title
        };

        setChoices([]);
        
        const historySize = settings.historyContextSize;
        const historyPartsToTake = historySize > 0 ? (historySize * 2) : 0;
        const relevantHistory = historySize > 0 ? history.slice(-historyPartsToTake) : [];

        const historyText = relevantHistory
            .map(part => `${part.type === 'story' ? 'Bối cảnh' : 'Người chơi'}: ${part.text}`)
            .join('\n');
            
        try {
            const { storyResponse, usageMetadata } = await api.getNextStoryStep(historyText, choice.title, settings.isMature, settings.perspective, characterProfile, worldSettings, npcs, apiKeyForService);
            log('useGameLogic.ts', 'Received story response from API.', 'INFO');
            
            let { nextProfile, nextNpcs, finalWorldSettings, notifications } = await applyStoryResponseToState({
                storyResponse,
                characterProfile,
                npcs,
                worldSettings,
                settings,
                choice
            });
            
            if (usageMetadata?.totalTokenCount) {
                notifications.unshift(`✨ Đã sử dụng <b>${usageMetadata.totalTokenCount.toLocaleString()} tokens</b> cho lượt này.`);
            }

            // Apply turn-based status effect duration updates
            nextProfile = updateStatusEffectDurations(nextProfile);
            nextNpcs = nextNpcs.map(npc => updateStatusEffectDurations(npc));

            const newStoryPart: StoryPart = {
                id: Date.now() + 1,
                type: 'story',
                text: storyResponse.story,
                notifications,
            };

            const newTurnNumber = (gameLog[gameLog.length - 1]?.turnNumber || 0) + 1;
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
            const maxRewindableTurns = 10;
            
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
            const errorMessage = `Lỗi khi tạo bước tiếp theo của câu chuyện: ${e.message}`;
            setToast({ message: errorMessage, type: 'error' });
            // Restore previous state
            setChoices(preActionState.choices);
            if (choice.isCustom) {
                setLastFailedCustomAction(choice.title);
            }
        } finally {
            setIsLoading(false);
        }
    }, [characterProfile, worldSettings, npcs, history, gameLog, settings, api, apiKeyForService]);
    
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
            log('useGameLogic.ts', 'Rewind successful.', 'INFO');
        } else {
            log('useGameLogic.ts', `Rewind failed for turn ${turnNumber}: No rewind data found.`, 'ERROR');
        }
    }, [gameLog, loadState]);

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
                relationship: 0,
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
            
            const notifications: string[] = [];
            if (usageMetadata?.totalTokenCount) {
                notifications.push(`✨ Đã sử dụng <b>${usageMetadata.totalTokenCount.toLocaleString()} tokens</b> cho lượt này.`);
            }
            
            const initialStoryPart: StoryPart = { id: Date.now(), type: 'story', text: storyResponse.story, notifications };
            
            const preActionState = {
                characterProfile: finalProfile,
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
    
            setHistory(initialHistory);
            setChoices(initialChoices);
            setGameLog(initialGameLog);
            
            await saveService.saveGame(
                finalProfile,
                newWorldSettings,
                initialNpcs,
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
    }, [api, apiKeyForService, settings.isMature, settings.perspective]);

    return {
        gameState, setGameState, hasSaves, characterProfile, setCharacterProfile, worldSettings, setWorldSettings, history, displayHistory, npcs, setNpcs, choices, gameLog, isLoading, error, settings, toast, clearToast, lastFailedCustomAction,
        handleAction, handleContinue, handleGoHome, handleLoadGame, handleRestart, saveSettings, handleStartGame, handleUpdateLocation, handleUpdateWorldSettings, handleRewind, handleSave, handleUseItem
    };
};
