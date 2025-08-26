import React, { useState, useEffect } from 'react';
import { SettingsModal } from './components/modal/SettingsModal';
import { PlayerInfoModal } from './components/modal/PlayerInfoModal';
import { WorldInfoModal } from './components/modal/WorldInfoModal';
import { MapModal } from './components/modal/MapModal';
import { NpcModal } from './components/modal/NpcModal';
import { GameLogModal } from './components/modal/GameLogModal';
import { InventoryModal } from './components/modal/InventoryModal';
import { TimeSkipModal } from './components/modal/TimeSkipModal';
import { EventModal } from './components/modal/EventModal';
import { SecretsModal } from './components/modal/SecretsModal';
import { IdentityModal } from './components/modal/IdentityModal';
import { log } from './services/logService';
import { DebugLogPanel } from './components/DebugLogPanel';
import { useComponentLog } from './hooks/useComponentLog';
import { useGameLogic } from './hooks/useGameLogic';
import { useModalManager } from './hooks/useModalManager';
import { AppContent } from './components/AppContent';
import { Toast } from './components/Toast';

const App: React.FC = () => {
    useComponentLog('App.tsx');
    
    const {
        gameState, setGameState, hasSaves, characterProfile, setCharacterProfile, worldSettings, displayHistory, npcs, setNpcs, choices, gameLog, isLoading, error, settings, apiKeyForService, toast, clearToast, lastFailedCustomAction,
        handleAction, handleContinue, handleGoHome, handleLoadGame, handleRestart, saveSettings, handleStartGame, handleUpdateLocation, handleUpdateWorldSettings, handleRewind, handleSave, handleUseItem, handleTimeSkip,
        fullGameState, handleUpdateFullGameState, api
    } = useGameLogic();
    
    const { modals, openModal, closeModal } = useModalManager();

    const [isDebugLogVisible, setIsDebugLogVisible] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === '\\') {
                e.preventDefault();
                setIsDebugLogVisible(prev => !prev);
                log('App.tsx', `Debug panel ${!isDebugLogVisible ? 'shown' : 'hidden'}.`, 'INFO');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDebugLogVisible]);

    useEffect(() => {
        const size = settings.storyFontSize || 18; // Fallback to default
        document.documentElement.style.setProperty('--story-font-size', `${size}px`);
        document.documentElement.style.setProperty('--story-font-size-large', `${Math.round(size * 1.1)}px`);
        document.documentElement.style.setProperty('--story-font-size-xl', `${Math.round(size * 1.2)}px`);
        log('App.tsx', `Story font size set to ${size}px`, 'STATE');
    }, [settings.storyFontSize]);

    useEffect(() => {
        const storyBgOpacity = (settings.storyBackgroundOpacity ?? 70) / 100;
        // slate-900 is rgb(15, 23, 42)
        document.documentElement.style.setProperty('--story-bg-color', `rgba(15, 23, 42, ${storyBgOpacity})`);
        log('App.tsx', `Story background opacity set to ${storyBgOpacity}`, 'STATE');
    }, [settings.storyBackgroundOpacity]);


    const appContentProps = {
        gameState,
        setGameState,
        hasSaves,
        characterProfile,
        worldSettings,
        displayHistory,
        npcs,
        choices,
        isLoading,
        error,
        settings,
        apiKey: apiKeyForService,
        lastFailedCustomAction,
        fullGameState,
        handleAction,
        handleContinue,
        handleGoHome,
        handleLoadGame,
        handleRestart,
        handleSave,
        handleStartGame,
        openSettingsModal: () => openModal('settings'),
        openPlayerInfoModal: () => openModal('playerInfo'),
        openWorldInfoModal: () => openModal('worldInfo'),
        openMapModal: () => openModal('map'),
        openNpcModal: () => openModal('npc'),
        openGameLogModal: () => openModal('gameLog'),
        openInventoryModal: () => openModal('inventory'),
        openTimeSkipModal: () => openModal('timeSkip'),
        openEventModal: () => openModal('event'),
        openSecretsModal: () => openModal('secrets'),
        openIdentityModal: () => openModal('identity'),
    };

    return (
        <main className="h-full w-full bg-slate-900 text-slate-200 font-sans overflow-hidden relative">
            <AppContent {...appContentProps} />
            
            {toast && <Toast toast={toast} onClose={clearToast} />}

            {modals.settings && (
                <SettingsModal 
                    isOpen={modals.settings}
                    onClose={() => closeModal('settings')}
                    onSave={saveSettings}
                    initialSettings={settings}
                />
            )}
            {characterProfile && modals.playerInfo && worldSettings && fullGameState && (
                 <PlayerInfoModal
                    isOpen={modals.playerInfo}
                    onClose={() => closeModal('playerInfo')}
                    profile={characterProfile}
                    npcs={npcs}
                    onUpdateProfile={setCharacterProfile}
                    worldSettings={worldSettings}
                    onAction={handleAction}
                    onUpdateLocation={handleUpdateLocation}
                    fullGameState={fullGameState}
                    onUpdateFullGameState={handleUpdateFullGameState}
                />
            )}
            {characterProfile && worldSettings && modals.worldInfo && (
                <WorldInfoModal
                    isOpen={modals.worldInfo}
                    onClose={() => closeModal('worldInfo')}
                    worldSettings={worldSettings}
                    characterProfile={characterProfile}
                    onUpdateLocation={handleUpdateLocation}
                    onUpdateWorldSettings={handleUpdateWorldSettings}
                    npcs={npcs}
                />
            )}
            {characterProfile && worldSettings && modals.map && (
                <MapModal
                    isOpen={modals.map}
                    onClose={() => closeModal('map')}
                    locations={characterProfile.discoveredLocations}
                    currentLocationId={characterProfile.currentLocationId}
                    characterProfile={characterProfile}
                    onAction={handleAction}
                    onUpdateLocation={handleUpdateLocation}
                    isLoading={isLoading}
                    worldSettings={worldSettings}
                />
            )}
            {worldSettings && characterProfile && fullGameState && modals.npc && (
                <NpcModal
                    isOpen={modals.npc}
                    onClose={() => closeModal('npc')}
                    npcs={npcs}
                    onUpdateNpc={(npc) => setNpcs(prev => prev.map(n => n.id === npc.id ? npc : n))}
                    worldSettings={worldSettings}
                    characterProfile={characterProfile}
                    fullGameState={fullGameState}
                />
            )}
            {modals.gameLog && (
                <GameLogModal 
                    isOpen={modals.gameLog}
                    onClose={() => closeModal('gameLog')}
                    log={gameLog}
                    onRewind={handleRewind}
                />
            )}
            {characterProfile && modals.inventory && (
                 <InventoryModal
                    isOpen={modals.inventory}
                    onClose={() => closeModal('inventory')}
                    profile={characterProfile}
                    onUpdateProfile={setCharacterProfile}
                    onUseItem={handleUseItem}
                    npcs={npcs}
                    onAction={handleAction}
                />
            )}
            {characterProfile && npcs && modals.timeSkip && (
                <TimeSkipModal
                    isOpen={modals.timeSkip}
                    onClose={() => closeModal('timeSkip')}
                    onTimeSkip={handleTimeSkip}
                    characterProfile={characterProfile}
                    npcs={npcs}
                />
            )}
            {characterProfile && modals.event && (
                <EventModal
                    isOpen={modals.event}
                    onClose={() => closeModal('event')}
                    events={characterProfile.events}
                />
            )}
            {characterProfile && npcs && modals.secrets && (
                <SecretsModal
                    isOpen={modals.secrets}
                    onClose={() => closeModal('secrets')}
                    profile={characterProfile}
                    npcs={npcs}
                    onUpdateProfile={setCharacterProfile}
                />
            )}
             {fullGameState && modals.identity && (
                <IdentityModal
                    isOpen={modals.identity}
                    onClose={() => closeModal('identity')}
                    fullGameState={fullGameState}
                    onUpdateGameState={handleUpdateFullGameState}
                    npcs={npcs}
                    api={api}
                    apiKeyForService={apiKeyForService}
                />
            )}
            {isDebugLogVisible && <DebugLogPanel onClose={() => setIsDebugLogVisible(false)} />}
        </main>
    );
};

export default App;