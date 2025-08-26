import React, { useState, useEffect, useMemo } from 'react';
import { CharacterProfile, NPC, WorldSettings, CharacterGender, Location, Choice, FullGameState } from '../../types';
import { ImageLibraryModal } from './ImageLibraryModal';
import { HaremTab } from './tabs/HaremTab';
import { StatsTab } from './tabs/StatsTab';
import { SkillsTab } from './tabs/SkillsTab';
import { RelationshipsTab } from './tabs/RelationshipsTab';
import { MilestonesTab } from './tabs/MilestonesTab';
import { OwnedLocationsTab } from './tabs/OwnedLocationsTab';
import { CreationTab } from './tabs/CreationTab';
import { InfoTab } from './tabs/InfoTab';
import { AccordionItem } from './tabs/shared/Common';
import { getDefaultAvatar } from '../../utils/uiHelpers';


interface PlayerInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: CharacterProfile;
    npcs: NPC[];
    onUpdateProfile: (newProfile: CharacterProfile) => void;
    worldSettings: WorldSettings; 
    onAction: (choice: Choice) => void;
    onUpdateLocation: (location: Location) => void;
    fullGameState: FullGameState;
    onUpdateFullGameState: (newGameState: FullGameState) => void;
}

type PlayerInfoTab = 'stats' | 'skills' | 'relationships' | 'milestones' | 'ownedLocations' | 'harem' | 'creation' | 'info';

const TabButton = ({ isActive, onClick, children }: { isActive: boolean, onClick: () => void, children: React.ReactNode }) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 text-sm font-medium transition-colors duration-200 focus:outline-none ${
            isActive 
                ? 'border-b-2 border-amber-400 text-amber-300' 
                : 'text-slate-400 hover:text-slate-200'
        }`}
    >
        {children}
    </button>
);

export const PlayerInfoModal: React.FC<PlayerInfoModalProps> = ({ isOpen, onClose, profile, npcs, onUpdateProfile, worldSettings, onAction, onUpdateLocation, fullGameState, onUpdateFullGameState }) => {
    const [activeTab, setActiveTab] = useState<PlayerInfoTab>('stats');
    const [localAvatarUrl, setLocalAvatarUrl] = useState('');
    const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);

    const defaultAvatar = useMemo(() => getDefaultAvatar(profile.gender), [profile.gender]);
    const canCreate = useMemo(() => profile.skills.some(skill => skill.name === 'Sáng Thế Tuyệt Đối'), [profile.skills]);
    
    const activeIdentity = useMemo(() => {
        if (!fullGameState.activeIdentityId) return null;
        return fullGameState.identities.find(id => id.id === fullGameState.activeIdentityId);
    }, [fullGameState.activeIdentityId, fullGameState.identities]);

    const displayInfo = useMemo(() => {
        if (activeIdentity) {
            return {
                name: activeIdentity.name,
                avatarUrl: activeIdentity.imageUrl,
            };
        }
        return {
            name: profile.name,
            avatarUrl: profile.avatarUrl,
        };
    }, [activeIdentity, profile]);

    const displayProfileForTabs = useMemo(() => {
        if (activeIdentity) {
            return {
                ...profile,
                name: activeIdentity.name,
                personality: activeIdentity.personality,
                backstory: activeIdentity.backstory,
                goal: activeIdentity.goal,
            };
        }
        return profile;
    }, [profile, activeIdentity]);

    const relationshipsDisplayName = activeIdentity ? activeIdentity.name : profile.name;

    const npcsForDisplay = useMemo(() => {
        if (!activeIdentity) {
            return npcs;
        }
        const identityRelMap = new Map(activeIdentity.npcRelationships.map(r => [r.targetNpcId, r.value]));
        return npcs.map(npc => ({
            ...npc,
            isDaoLu: false, 
            relationship: identityRelMap.get(npc.id),
        }));
    }, [npcs, activeIdentity]);

    useEffect(() => {
        if (isOpen) {
            setActiveTab('stats');
            setLocalAvatarUrl(displayInfo.avatarUrl || '');
        }
    }, [isOpen, displayInfo.avatarUrl]);
    
    const handleAvatarUrlUpdate = (url: string) => {
        setLocalAvatarUrl(url);
        if (activeIdentity) {
            const updatedIdentities = fullGameState.identities.map(id => 
                id.id === activeIdentity.id ? { ...id, imageUrl: url } : id
            );
            onUpdateFullGameState({ ...fullGameState, identities: updatedIdentities });
        } else {
            onUpdateProfile({ ...profile, avatarUrl: url });
        }
    };

    const handleAvatarBlur = () => {
        if (activeIdentity) {
            if (localAvatarUrl !== (activeIdentity.imageUrl || '')) {
                handleAvatarUrlUpdate(localAvatarUrl);
            }
        } else {
            if (localAvatarUrl !== (profile.avatarUrl || '')) {
                handleAvatarUrlUpdate(localAvatarUrl);
            }
        }
    };
    
    if (!isOpen) return null;
    
    const handleUpdateOwnedLocation = (updatedLocation: Location) => {
        onUpdateProfile({
            ...profile,
            discoveredLocations: profile.discoveredLocations.map(loc =>
                loc.id === updatedLocation.id ? updatedLocation : loc
            )
        });
    };

    return (
        <>
            <div 
                className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
                onClick={onClose}
            >
                <div 
                    className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-7xl m-4 flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex-shrink-0 px-6 py-4 flex justify-between items-center border-b border-slate-700">
                        <h2 id="player-info-title" className="text-2xl font-bold text-slate-100">{displayInfo.name}</h2>
                         <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Đóng">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                     {/* Main Body */}
                    <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                        {/* Left Sidebar */}
                        <div className="w-full md:w-96 flex-shrink-0 bg-slate-900/30 p-6 overflow-y-auto custom-scrollbar space-y-6">
                             <div className="flex flex-col items-center space-y-4">
                                <img 
                                    src={localAvatarUrl || defaultAvatar} 
                                    alt="Ảnh đại diện" 
                                    className="w-32 h-32 rounded-full object-cover border-4 border-slate-700 shadow-lg"
                                    onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                                />
                                 <div>
                                    <label htmlFor="avatarUrl" className="block text-xs font-medium text-slate-400 mb-1">URL ảnh đại diện</label>
                                    <input
                                        id="avatarUrl"
                                        type="text"
                                        value={localAvatarUrl}
                                        onChange={(e) => setLocalAvatarUrl(e.target.value)}
                                        onBlur={handleAvatarBlur}
                                        placeholder="https://..."
                                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-slate-200 text-sm"
                                    />
                                </div>
                                 <button onClick={() => setIsImageLibraryOpen(true)} className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg transition-colors">
                                    Chọn Từ Thư Viện
                                </button>
                            </div>

                            <div className="space-y-2 text-sm border-t border-slate-700/50 pt-4">
                                <p><span className="font-semibold text-slate-400">Giới tính:</span> {profile.gender === CharacterGender.MALE ? 'Nam' : 'Nữ'}</p>
                                <p><span className="font-semibold text-slate-400">Chủng tộc:</span> {profile.race}</p>
                                <p><span className="font-semibold text-slate-400">Hệ tu luyện:</span> {profile.powerSystem}</p>
                            </div>

                            <AccordionItem 
                                title="Thể Chất Đặc Biệt" 
                                name={profile.specialConstitution.name} 
                                description={profile.specialConstitution.description}
                            />
                            <AccordionItem 
                                title="Thiên Phú"
                                name={profile.talent.name} 
                                description={profile.talent.description}
                            />
                        </div>
                        {/* Right Content */}
                        <div className="flex-grow flex flex-col overflow-hidden">
                             <div className="flex-shrink-0 px-6 border-b border-slate-700">
                                <nav className="flex space-x-2 flex-wrap">
                                    <TabButton isActive={activeTab === 'stats'} onClick={() => setActiveTab('stats')}>Chỉ số</TabButton>
                                    <TabButton isActive={activeTab === 'skills'} onClick={() => setActiveTab('skills')}>Kỹ năng</TabButton>
                                    <TabButton isActive={activeTab === 'relationships'} onClick={() => setActiveTab('relationships')}>Quan Hệ</TabButton>
                                    <TabButton isActive={activeTab === 'milestones'} onClick={() => setActiveTab('milestones')}>Sổ Ký Ức</TabButton>
                                    <TabButton isActive={activeTab === 'ownedLocations'} onClick={() => setActiveTab('ownedLocations')}>Địa Điểm</TabButton>
                                    <TabButton isActive={activeTab === 'harem'} onClick={() => setActiveTab('harem')}>Hậu Cung</TabButton>
                                    {canCreate && <TabButton isActive={activeTab === 'creation'} onClick={() => setActiveTab('creation')}>Sáng Tạo</TabButton>}
                                    <TabButton isActive={activeTab === 'info'} onClick={() => setActiveTab('info')}>Thông tin</TabButton>
                                </nav>
                            </div>
                            <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                                {activeTab === 'stats' && <StatsTab profile={profile} />}
                                {activeTab === 'skills' && <SkillsTab profile={profile} worldSettings={worldSettings} />}
                                {activeTab === 'relationships' && <RelationshipsTab npcs={npcsForDisplay} displayName={relationshipsDisplayName} />}
                                {activeTab === 'milestones' && <MilestonesTab profile={profile} />}
                                {activeTab === 'ownedLocations' && <OwnedLocationsTab profile={profile} onUpdateLocation={handleUpdateOwnedLocation} />}
                                {activeTab === 'harem' && <HaremTab profile={profile} npcs={npcs} onUpdateLocation={onUpdateLocation} onAction={onAction} onClose={onClose} />}
                                {activeTab === 'creation' && canCreate && <CreationTab profile={displayProfileForTabs} onAction={onAction} onClose={onClose} />}
                                {activeTab === 'info' && <InfoTab profile={displayProfileForTabs} />}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 px-6 py-4 border-t border-slate-700 bg-slate-900/50 flex justify-end space-x-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors duration-300"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
            <ImageLibraryModal
                isOpen={isImageLibraryOpen}
                onClose={() => setIsImageLibraryOpen(false)}
                onSelect={handleAvatarUrlUpdate}
            />
        </>
    );
};