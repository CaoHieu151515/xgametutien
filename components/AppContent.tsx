import React from 'react';
import { GameState, CharacterProfile, WorldSettings, StoryPart, NPC, Choice, AppSettings, FullGameState } from '../types';
import { HomeScreen } from './screens/HomeScreen';
import { WorldSetup } from './worldSetup/WorldSetup';
import { GameScreen } from './screens/GameScreen';
import { ErrorScreen } from './screens/ErrorScreen';
import { SaveManagementScreen } from './SaveManagementScreen';

interface AppContentProps {
    gameState: GameState;
    setGameState: (state: GameState) => void;
    hasSaves: boolean;
    characterProfile: CharacterProfile | null;
    worldSettings: WorldSettings | null;
    displayHistory: StoryPart[];
    npcs: NPC[];
    choices: Choice[];
    isLoading: boolean;
    error: string | null;
    settings: AppSettings;
    apiKey: string;
    lastFailedCustomAction: string | null;
    fullGameState: FullGameState | null;
    handleAction: (choice: Choice) => void;
    handleContinue: () => void;
    handleGoHome: () => void;
    handleLoadGame: (saveData: FullGameState) => void;
    handleRestart: () => void;
    handleSave: () => void;
    handleStartGame: (profile: CharacterProfile, worldSettings: WorldSettings) => void;
    openSettingsModal: () => void;
    openPlayerInfoModal: () => void;
    openWorldInfoModal: () => void;
    openMapModal: () => void;
    openNpcModal: () => void;
    openGameLogModal: () => void;
    openInventoryModal: () => void;
    openTimeSkipModal: () => void;
    openEventModal: () => void;
    openSecretsModal: () => void;
    openIdentityModal: () => void;
}

export const AppContent: React.FC<AppContentProps> = (props) => {
    switch (props.gameState) {
        case GameState.HOME:
            return <HomeScreen
                        hasSaves={props.hasSaves}
                        onContinue={props.handleContinue}
                        onSetGameState={props.setGameState}
                        onOpenSettings={props.openSettingsModal}
                    />;
        case GameState.WORLD_SETUP:
            return <WorldSetup
                        onStartGame={props.handleStartGame}
                        onBackToMenu={() => props.setGameState(GameState.HOME)}
                        apiProvider={props.settings.apiProvider}
                        apiKey={props.apiKey}
                    />;
        case GameState.PLAYING:
            if (props.characterProfile && props.worldSettings && props.fullGameState) {
                return <GameScreen
                            isLoading={props.isLoading}
                            characterProfile={props.characterProfile}
                            worldSettings={props.worldSettings}
                            displayHistory={props.displayHistory}
                            npcs={props.npcs}
                            choices={props.choices}
                            lastFailedCustomAction={props.lastFailedCustomAction}
                            settings={props.settings}
                            fullGameState={props.fullGameState}
                            handleAction={props.handleAction}
                            handleGoHome={props.handleGoHome}
                            handleSave={props.handleSave}
                            openSettingsModal={props.openSettingsModal}
                            openPlayerInfoModal={props.openPlayerInfoModal}
                            openWorldInfoModal={props.openWorldInfoModal}
                            openMapModal={props.openMapModal}
                            openNpcModal={props.openNpcModal}
                            openGameLogModal={props.openGameLogModal}
                            openInventoryModal={props.openInventoryModal}
                            openTimeSkipModal={props.openTimeSkipModal}
                            openEventModal={props.openEventModal}
                            openSecretsModal={props.openSecretsModal}
                            openIdentityModal={props.openIdentityModal}
                        />;
            }
            return <ErrorScreen error="Lỗi trạng thái game: Dữ liệu nhân vật hoặc thế giới không tồn tại." onRestart={props.handleRestart} />;
        
        case GameState.SAVE_MANAGEMENT:
            return <SaveManagementScreen onLoadGame={props.handleLoadGame} onBackToMenu={() => props.setGameState(GameState.HOME)} />;
        
        case GameState.ERROR:
            return <ErrorScreen error={props.error} onRestart={props.handleRestart} />;
        
        default:
            return <ErrorScreen error="Trạng thái không xác định." onRestart={props.handleRestart} />;
    }
};