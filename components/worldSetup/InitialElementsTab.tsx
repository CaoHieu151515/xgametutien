

import React, { useState } from 'react';
import { CharacterProfile, WorldSettings, NewNPCFromAI, Location, Item, Skill } from '../../types';
import { CollapsibleSection } from '../CollapsibleSection';
import { TiersSection } from './sections/TiersSection';
import { InitialItemsSection } from './sections/InitialItemsSection';
import { InitialLocationsSection } from './sections/InitialLocationsSection';
import { InitialNpcsSection } from './sections/InitialNpcsSection';
import { InitialSkillsSection } from './sections/InitialSkillsSection';
import { InitialKnowledgeSection } from './sections/InitialKnowledgeSection';
import { InitialMonstersSection } from './sections/InitialMonstersSection';

interface InitialElementsTabProps {
    profile: CharacterProfile;
    worldSettings: WorldSettings;
    setProfile: React.Dispatch<React.SetStateAction<CharacterProfile>>;
    setWorldSettings: React.Dispatch<React.SetStateAction<WorldSettings>>;
}

export const InitialElementsTab: React.FC<InitialElementsTabProps> = ({ profile, worldSettings, setProfile, setWorldSettings }) => {
    const [openSections, setOpenSections] = useState({
        tiers: true,
        items: false,
        locations: false,
        npcs: false,
        skills: false,
        knowledge: false,
        monsters: false,
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleWorldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setWorldSettings(prev => ({ ...prev, [name]: value }));
    };
    
    return (
        <div className="space-y-4">
            <CollapsibleSection
                title="Phẩm Chất & Tư Chất"
                isOpen={openSections.tiers}
                onToggle={() => toggleSection('tiers')}
            >
                <TiersSection worldSettings={worldSettings} handleWorldChange={handleWorldChange} />
            </CollapsibleSection>

            <CollapsibleSection
                title="Vật Phẩm Khởi Đầu"
                count={(profile.initialItems || []).length}
                isOpen={openSections.items}
                onToggle={() => toggleSection('items')}
            >
                <InitialItemsSection profile={profile} worldSettings={worldSettings} setProfile={setProfile} />
            </CollapsibleSection>

            <CollapsibleSection
                title="Địa Điểm Khởi Đầu"
                count={(profile.initialLocations || []).length}
                isOpen={openSections.locations}
                onToggle={() => toggleSection('locations')}
            >
                <InitialLocationsSection profile={profile} setProfile={setProfile} />
            </CollapsibleSection>
            
            <CollapsibleSection
                title="NPC Khởi Đầu"
                count={(profile.initialNpcs || []).length}
                isOpen={openSections.npcs}
                onToggle={() => toggleSection('npcs')}
            >
                <InitialNpcsSection profile={profile} worldSettings={worldSettings} setProfile={setProfile} />
            </CollapsibleSection>
            
             <CollapsibleSection
                title="Sinh Vật Khởi Đầu"
                count={(profile.initialMonsters || []).length}
                isOpen={openSections.monsters}
                onToggle={() => toggleSection('monsters')}
            >
                <InitialMonstersSection profile={profile} setProfile={setProfile} />
            </CollapsibleSection>

            <CollapsibleSection
                title="Kỹ Năng Khởi Đầu"
                count={(profile.skills || []).length}
                isOpen={openSections.skills}
                onToggle={() => toggleSection('skills')}
            >
                <InitialSkillsSection profile={profile} worldSettings={worldSettings} setProfile={setProfile} />
            </CollapsibleSection>
            
            <CollapsibleSection
                title="Tri Thức Thế Giới Khởi Đầu"
                count={(worldSettings.initialKnowledge || []).length}
                isOpen={openSections.knowledge}
                onToggle={() => toggleSection('knowledge')}
            >
                <InitialKnowledgeSection worldSettings={worldSettings} setWorldSettings={setWorldSettings} />
            </CollapsibleSection>
        </div>
    );
};