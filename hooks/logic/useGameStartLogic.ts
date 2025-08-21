import { useCallback } from 'react';
import { CharacterProfile, WorldSettings, GameState, AppSettings, NPC, StoryPart, NewNPCFromAI, GameSnapshot, Choice, ToastMessage } from '../../types';
import * as saveService from '../../services/saveService';
import { log } from '../../services/logService';
import { processLevelUps, calculateBaseStatsForLevel, getRealmDisplayName } from '../../services/progressionService';
import { applyStoryResponseToState } from '../../aiPipeline/applyDiff';
import { verifyStoryResponse } from '../../aiPipeline/validate';

interface UseGameStartLogicProps {
    api: any;
    apiKeyForService: string;
    settings: AppSettings;
    setCharacterProfile: React.Dispatch<React.SetStateAction<CharacterProfile | null>>;
    setWorldSettings: React.Dispatch<React.SetStateAction<WorldSettings | null>>;
    setNpcs: React.Dispatch<React.SetStateAction<NPC[]>>;
    setHistory: React.Dispatch<React.SetStateAction<StoryPart[]>>;
    setChoices: React.Dispatch<React.SetStateAction<Choice[]>>;
    setGameLog: React.Dispatch<React.SetStateAction<GameSnapshot[]>>;
    setGameState: (state: GameState) => void;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setToast: React.Dispatch<React.SetStateAction<ToastMessage | null>>;
}

export const useGameStartLogic = (props: UseGameStartLogicProps) => {
    const {
        api, apiKeyForService, settings, setCharacterProfile, setWorldSettings, setNpcs,
        setHistory, setChoices, setGameLog, setGameState, setIsLoading, setError, setToast
    } = props;

    const handleStartGame = useCallback(async (profile: CharacterProfile, worldSettings: WorldSettings) => {
        log('useGameStartLogic.ts', 'Starting new game.', 'FUNCTION');
        setIsLoading(true);
        setError(null);
    
        const newProfile: CharacterProfile = {
            ...profile,
            id: `char_${Date.now()}`,
            items: profile.initialItems || [],
            milestones: [],
            events: [],
            currentLocationId: profile.initialLocations?.[0]?.id || null,
            discoveredLocations: profile.initialLocations || [],
            discoveredMonsters: profile.initialMonsters || [],
            discoveredItems: profile.initialItems || [],
            gameTime: new Date().toISOString(),
        };
        
        const initialStats = calculateBaseStatsForLevel(newProfile.level);
        newProfile.baseMaxHealth = initialStats.maxHealth;
        newProfile.baseMaxMana = initialStats.maxMana;
        newProfile.baseAttack = initialStats.attack;
        newProfile.lifespan = initialStats.lifespan;
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
            
            verifyStoryResponse(storyResponse, finalProfile, initialNpcs, newWorldSettings);

            if (usageMetadata?.totalTokenCount) {
                setToast({
                    message: `Đã sử dụng ${usageMetadata.totalTokenCount.toLocaleString()} tokens.`,
                    type: 'info',
                });
            }

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
                },
                turnNumber: 1,
                isSuccess: true,
            });
            
            const initialStoryPart: StoryPart = { 
                id: Date.now(), 
                type: 'story', 
                text: storyResponse.story, 
                notifications: notifications 
            };
            
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
                turnContent: { storyResult: initialStoryPart },
            };
            
            const initialHistory = [initialStoryPart];
            const initialChoices = storyResponse.choices;
            const initialGameLog: GameSnapshot[] = [firstSnapshot];

            setCharacterProfile(nextProfile);
            setNpcs(nextNpcs);
            setWorldSettings(finalWorldSettings);
            setHistory(initialHistory);
            setChoices(initialChoices);
            setGameLog(initialGameLog);
            
            await saveService.saveGame(nextProfile, finalWorldSettings, nextNpcs, initialHistory, initialChoices, initialGameLog);
    
            setGameState(GameState.PLAYING);
        } catch (e: any) {
            setError(`Lỗi khi bắt đầu câu chuyện: ${e.message}`);
            setGameState(GameState.ERROR);
        } finally {
            setIsLoading(false);
        }
    }, [api, apiKeyForService, settings, setCharacterProfile, setWorldSettings, setNpcs, setHistory, setChoices, setGameLog, setGameState, setIsLoading, setError, setToast]);

    return { handleStartGame };
};