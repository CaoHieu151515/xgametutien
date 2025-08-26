

import { useState, useCallback, useMemo, useEffect } from 'react';
import { GameState, StoryPart, CharacterProfile, WorldSettings, NPC, Choice, FullGameState, Location, Identity } from '../types';
import { log } from '../services/logService';

import { useSettingsLogic } from './logic/useSettingsLogic';
import { useNotificationLogic } from './logic/useNotificationLogic';
import { useSaveLogic } from './logic/useSaveLogic';
import { useGameStartLogic } from './logic/useGameStartLogic';
import { useActionLogic } from './logic/useActionLogic';

export const useGameLogic = () => {
    // === Core Game State ===
    const [gameState, setGameState] = useState<GameState>(GameState.HOME);
    const [characterProfile, setCharacterProfile] = useState<CharacterProfile | null>(null);
    const [worldSettings, setWorldSettings] = useState<WorldSettings | null>(null);
    const [history, setHistory] = useState<StoryPart[]>([]);
    const [displayHistory, setDisplayHistory] = useState<StoryPart[]>([]);
    const [choices, setChoices] = useState<Choice[]>([]);
    const [npcs, setNpcs] = useState<NPC[]>([]);
    const [identities, setIdentities] = useState<Identity[]>([]);
    const [activeIdentityId, setActiveIdentityId] = useState<string | null>(null);

    // === UI / Interaction State ===
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastFailedCustomAction, setLastFailedCustomAction] = useState<string | null>(null);

    // === Sub-Hooks for Logic Separation ===
    const { settings, saveSettings, apiKeyForService, api } = useSettingsLogic();
    const { toast, clearToast, setToast } = useNotificationLogic();
    
    const {
        hasSaves, gameLog, setGameLog, handleSave, handleRewind, handleContinue,
        handleLoadGame
    } = useSaveLogic({
        gameState, setGameState, characterProfile, worldSettings, npcs, history, choices, identities, activeIdentityId,
        setCharacterProfile, setWorldSettings, setNpcs, setHistory, setChoices, setLastFailedCustomAction,
        setToast, setIdentities, setActiveIdentityId
    });

    const {
        handleAction, handleUseItem, handleTimeSkip
    } = useActionLogic({
        characterProfile, worldSettings, npcs, history, choices, gameLog, settings, api, apiKeyForService, identities, activeIdentityId,
        setChoices, setHistory, setCharacterProfile, setNpcs, setWorldSettings, setGameLog, setIdentities, setActiveIdentityId,
        setToast, setIsLoading, setError, setLastFailedCustomAction
    });
    
    const { handleStartGame } = useGameStartLogic({
        api, apiKeyForService, settings,
        setCharacterProfile, setWorldSettings, setNpcs, setHistory, setChoices, setGameLog, setIdentities, setActiveIdentityId,
        setGameState, setIsLoading, setError, setToast
    });
    
    const fullGameState: FullGameState | null = useMemo(() => {
        if (!characterProfile || !worldSettings) return null;
        return {
            id: characterProfile.id,
            name: characterProfile.name,
            lastSaved: 0, // This is temporary, real value is in save file
            characterProfile,
            worldSettings,
            npcs,
            history,
            choices,
            gameLog,
            identities,
            activeIdentityId,
        };
    }, [characterProfile, worldSettings, npcs, history, choices, gameLog, identities, activeIdentityId]);

    const handleUpdateFullGameState = useCallback((newGameState: FullGameState) => {
        setCharacterProfile(newGameState.characterProfile);
        setWorldSettings(newGameState.worldSettings);
        setNpcs(newGameState.npcs);
        setHistory(newGameState.history);
        setChoices(newGameState.choices);
        setGameLog(newGameState.gameLog);
        setIdentities(newGameState.identities);
        setActiveIdentityId(newGameState.activeIdentityId);
        log('useGameLogic.ts', 'Full game state updated by a child component.', 'STATE');
    }, []);

    // === High-Level Orchestration Logic ===
    useEffect(() => {
        log('useGameLogic.ts', `Game state changed to: ${GameState[gameState]}`, 'STATE');
    }, [gameState]);
    
    useEffect(() => {
        setDisplayHistory(history);
    }, [history]);

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
        setIdentities([]);
        setActiveIdentityId(null);
        setGameState(GameState.HOME);
    }, [setGameLog, setToast, setLastFailedCustomAction]);

    const handleGoHome = useCallback(() => {
        log('useGameLogic.ts', 'Going back to home screen.', 'FUNCTION');
        handleSave();
        handleRestart();
    }, [handleSave, handleRestart]);

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
    

    return {
        gameState, setGameState, hasSaves, characterProfile, setCharacterProfile, worldSettings, setWorldSettings, history, displayHistory, npcs, setNpcs, choices, gameLog, isLoading, error, settings, apiKeyForService, toast, clearToast, lastFailedCustomAction,
        handleAction, handleContinue, handleGoHome, handleLoadGame, handleRestart, saveSettings, handleStartGame, handleUpdateLocation, handleUpdateWorldSettings, handleRewind, handleSave, handleUseItem, handleTimeSkip,
        fullGameState, handleUpdateFullGameState, api
    };
};