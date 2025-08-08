
import React, { useMemo } from 'react';
import { GameState, CharacterProfile, WorldSettings, StoryPart, NPC, Choice } from '../../types';
import { Loader } from '../Loader';
import { StoryDisplay } from '../StoryDisplay';
import { CustomInput } from '../CustomInput';
import { AdventureCard } from '../AdventureCard';
import { 
    HomeIcon, PlayerIcon, NpcsIcon, WorldIcon, MapIcon, 
    GameLogIcon, BagIcon, LocationIcon, SettingsIcon, SaveIcon 
} from '../ui/Icons';
import { useComponentLog } from '../../hooks/useComponentLog';


interface GameScreenProps {
    isLoading: boolean;
    characterProfile: CharacterProfile;
    worldSettings: WorldSettings;
    displayHistory: StoryPart[];
    npcs: NPC[];
    choices: Choice[];
    handleAction: (choice: Choice) => void;
    handleGoHome: () => void;
    handleSave: () => void;
    openSettingsModal: () => void;
    openPlayerInfoModal: () => void;
    openWorldInfoModal: () => void;
    openMapModal: () => void;
    openNpcModal: () => void;
    openGameLogModal: () => void;
    openInventoryModal: () => void;
}

const getFormattedGameTime = (isoString: string | null): string => {
    if (!isoString) return 'Thời gian không xác định';

    const date = new Date(isoString);
    const hours = date.getHours();
    
    let timeOfDay = '';
    if (hours >= 5 && hours < 11) timeOfDay = 'Buổi sáng';
    else if (hours >= 11 && hours < 13) timeOfDay = 'Buổi trưa';
    else if (hours >= 13 && hours < 18) timeOfDay = 'Buổi chiều';
    else if (hours >= 18 && hours < 22) timeOfDay = 'Buổi tối';
    else timeOfDay = 'Ban đêm';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const displayHours = String(hours).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `Ngày ${day}/${month}/${year} (${displayHours}:${minutes}-${timeOfDay})`;
};

const HeaderButton: React.FC<{
    label: string;
    onClick: () => void;
    children: React.ReactNode;
    disabled?: boolean;
}> = ({ label, onClick, children, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 p-1 text-slate-300 hover:bg-slate-700/50 hover:text-amber-300 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title={label}
    >
        {children}
        <span className="text-xs mt-1 text-center truncate w-full">{label}</span>
    </button>
);

const NewBadge = () => <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold text-slate-900 bg-yellow-300 rounded-full align-middle">NEW</span>;

export const GameScreen: React.FC<GameScreenProps> = ({
    isLoading,
    characterProfile,
    worldSettings,
    displayHistory,
    npcs,
    choices,
    handleAction,
    handleGoHome,
    handleSave,
    openSettingsModal,
    openPlayerInfoModal,
    openWorldInfoModal,
    openMapModal,
    openNpcModal,
    openGameLogModal,
    openInventoryModal
}) => {
    useComponentLog('GameScreen.tsx');
    
    const currentLocation = useMemo(() => {
        if (!characterProfile.currentLocationId) return null;
        return characterProfile.discoveredLocations.find(loc => loc.id === characterProfile.currentLocationId);
    }, [characterProfile]);

    const voidKnowledgeTitle = "Không Gian Hỗn Độn";
    const voidKnowledgeName = worldSettings?.initialKnowledge.find(k => k.title === voidKnowledgeTitle)?.title || voidKnowledgeTitle;
    const formattedGameTime = getFormattedGameTime(characterProfile.gameTime);
    
    return (
        <div className="h-full flex flex-col relative">
            {isLoading && <Loader />}
            <div className="flex-shrink-0 px-2 sm:px-6 py-2 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 gap-2 sm:gap-4">
                
                {/* Left Icons */}
                <div className="flex items-center gap-1 flex-wrap justify-start">
                    <HeaderButton label="Hồ Sơ" onClick={openPlayerInfoModal} disabled={isLoading}>
                        <PlayerIcon />
                    </HeaderButton>
                    <HeaderButton label="Túi Đồ" onClick={openInventoryModal} disabled={isLoading}>
                        <BagIcon />
                    </HeaderButton>
                    <HeaderButton label="NPC" onClick={openNpcModal} disabled={isLoading}>
                        <NpcsIcon />
                    </HeaderButton>
                    <HeaderButton label="Thế Giới" onClick={openWorldInfoModal} disabled={isLoading}>
                        <WorldIcon />
                    </HeaderButton>
                     <HeaderButton label="Bản Đồ" onClick={openMapModal} disabled={isLoading}>
                        <MapIcon />
                    </HeaderButton>
                </div>

                {/* Center Info */}
                <div className="hidden sm:flex flex-col justify-center items-center text-center flex-grow min-w-0">
                    <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-700/50">
                        <LocationIcon />
                        <span className="text-sm font-medium text-slate-300 truncate">
                            Vị trí: {currentLocation ? currentLocation.name : voidKnowledgeName}
                        </span>
                        {currentLocation?.isNew && <NewBadge />}
                    </div>
                    <div className="text-xs text-slate-400 mt-1.5">
                        {formattedGameTime}
                    </div>
                </div>

                {/* Right Icons */}
                <div className="flex items-center gap-1 flex-wrap justify-end">
                    <HeaderButton label="Nhật Ký" onClick={openGameLogModal} disabled={isLoading}>
                        <GameLogIcon />
                    </HeaderButton>
                    <HeaderButton label="Lưu" onClick={handleSave} disabled={isLoading}>
                        <SaveIcon />
                    </HeaderButton>
                     <HeaderButton label="Cài Đặt" onClick={openSettingsModal} disabled={isLoading}>
                        <SettingsIcon />
                    </HeaderButton>
                    <HeaderButton label="Trang Chủ" onClick={handleGoHome} disabled={isLoading}>
                        <HomeIcon />
                    </HeaderButton>
                </div>
            </div>
            <StoryDisplay 
                history={displayHistory} 
                characterProfile={characterProfile}
                worldSettings={worldSettings}
                npcs={npcs}
            />
            <div className="flex-shrink-0 p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {choices.map((choice, index) => (
                        <AdventureCard key={index} choice={choice} onClick={() => handleAction(choice)} disabled={isLoading} />
                    ))}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <CustomInput onSubmit={(text) => handleAction({ title: text, benefit: 'Không xác định', risk: 'Không xác định', successChance: 50, durationInMinutes: 10 })} disabled={isLoading} />
                </div>
            </div>
        </div>
    );
};
