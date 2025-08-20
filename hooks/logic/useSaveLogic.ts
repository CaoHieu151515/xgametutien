import { useState, useCallback, useEffect } from 'react';
import { GameState, CharacterProfile, WorldSettings, NPC, StoryPart, Choice, GameSnapshot, FullGameState, ToastMessage } from '../../types';
import * as saveService from '../../services/saveService';
import { log } from '../../services/logService';

interface UseSaveLogicProps {
    gameState: GameState;
    setGameState: (state: GameState) => void;
    characterProfile: CharacterProfile | null;
    worldSettings: WorldSettings | null;
    npcs: NPC[];
    history: StoryPart[];
    choices: Choice[];
    setCharacterProfile: React.Dispatch<React.SetStateAction<CharacterProfile | null>>;
    setWorldSettings: React.Dispatch<React.SetStateAction<WorldSettings | null>>;
    setNpcs: React.Dispatch<React.SetStateAction<NPC[]>>;
    setHistory: React.Dispatch<React.SetStateAction<StoryPart[]>>;
    setChoices: React.Dispatch<React.SetStateAction<Choice[]>>;
    setLastFailedCustomAction: React.Dispatch<React.SetStateAction<string | null>>;
    setToast: React.Dispatch<React.SetStateAction<ToastMessage | null>>;
}

export const useSaveLogic = (props: UseSaveLogicProps) => {
    const {
        gameState, setGameState, characterProfile, worldSettings, npcs, history, choices,
        setCharacterProfile, setWorldSettings, setNpcs, setHistory, setChoices, setLastFailedCustomAction, setToast
    } = props;

    const [hasSaves, setHasSaves] = useState<boolean>(false);
    const [gameLog, setGameLog] = useState<GameSnapshot[]>([]);
    const [isRewindAndSavePending, setIsRewindAndSavePending] = useState(false);

    useEffect(() => {
        if (gameState === GameState.HOME) {
            const checkSaves = async () => {
                try {
                    const saves = await saveService.getAllSavesMetadata();
                    setHasSaves(saves.length > 0);
                } catch (e) {
                    console.error("Could not check for saves", e);
                    setHasSaves(false);
                }
            };
            checkSaves();
        }
    }, [gameState]);
    
    const handleSave = useCallback(async () => {
        if (!characterProfile || !worldSettings) {
            log('useSaveLogic.ts', 'Save aborted: profile or world settings are null.', 'ERROR');
            return;
        }
        log('useSaveLogic.ts', 'Saving game...', 'FUNCTION');
        try {
            await saveService.saveGame(characterProfile, worldSettings, npcs, history, choices, gameLog);
            log('useSaveLogic.ts', 'Game saved successfully.', 'INFO');
            setToast({ message: 'Đã lưu game thành công!', type: 'success' });
        } catch(e) {
            setToast({ message: `Lỗi khi lưu game: ${(e as Error).message}`, type: 'error' });
        }
    }, [characterProfile, worldSettings, npcs, history, choices, gameLog, setToast]);
    
    const loadState = useCallback((state: FullGameState) => {
        if (!state.characterProfile.events) {
            state.characterProfile.events = [];
        }
        
        setCharacterProfile(state.characterProfile);
        setWorldSettings(state.worldSettings);
        setNpcs(state.npcs);
        setHistory(state.history);
        setChoices(state.choices);
        setGameLog(state.gameLog);
        setLastFailedCustomAction(null);
    }, [setCharacterProfile, setWorldSettings, setNpcs, setHistory, setChoices, setGameLog, setLastFailedCustomAction]);
    
    const handleRewind = useCallback((turnNumber: number) => {
        log('useSaveLogic.ts', `Rewinding to turn ${turnNumber}`, 'FUNCTION');
        const snapshot = gameLog.find(s => s.turnNumber === turnNumber);
        if (snapshot && snapshot.preActionState) {
            const stateToLoad: FullGameState = {
                ...snapshot.preActionState,
                id: snapshot.preActionState.characterProfile.id,
                name: snapshot.preActionState.characterProfile.name,
                lastSaved: Date.now(),
                gameLog: gameLog.filter(s => s.turnNumber < turnNumber)
            };
            loadState(stateToLoad);
            setIsRewindAndSavePending(true);
            log('useSaveLogic.ts', 'Rewind successful. Pending auto-save.', 'INFO');
        } else {
            log('useSaveLogic.ts', `Rewind failed for turn ${turnNumber}: No rewind data found.`, 'ERROR');
        }
    }, [gameLog, loadState]);

    useEffect(() => {
        if (isRewindAndSavePending && characterProfile && worldSettings) {
            const performAutoSave = async () => {
                log('useSaveLogic.ts', 'Performing auto-save after rewind...', 'FUNCTION');
                try {
                    await saveService.saveGame(characterProfile, worldSettings, npcs, history, choices, gameLog);
                    setToast({ message: 'Đã quay lại lượt và tự động lưu game!', type: 'success' });
                } catch (e) {
                    setToast({ message: `Lỗi khi tự động lưu game: ${(e as Error).message}`, type: 'error' });
                } finally {
                    setIsRewindAndSavePending(false);
                }
            };
            performAutoSave();
        }
    }, [isRewindAndSavePending, characterProfile, worldSettings, npcs, history, choices, gameLog, setToast]);

    const handleLoadGame = useCallback((saveData: FullGameState) => {
        log('useSaveLogic.ts', `Loading game: ${saveData.name}`, 'FUNCTION');
        loadState(saveData);
        setGameState(GameState.PLAYING);
    }, [loadState, setGameState]);

    const handleContinue = async () => {
        log('useSaveLogic.ts', 'Continuing last game.', 'FUNCTION');
        try {
            const saves = await saveService.getAllSavesMetadata();
            if (saves.length > 0) {
                const lastSave = await saveService.getGame(saves[0].id);
                if (lastSave) {
                    handleLoadGame(lastSave);
                } else {
                     setGameState(GameState.ERROR);
                }
            }
        } catch(e) {
            setGameState(GameState.ERROR);
        }
    };

    return {
        hasSaves,
        gameLog,
        setGameLog,
        handleSave,
        handleRewind,
        handleContinue,
        handleLoadGame
    };
};
