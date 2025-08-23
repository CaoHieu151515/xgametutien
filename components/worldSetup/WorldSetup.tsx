

import React, { useState, useRef } from 'react';
import { CharacterProfile, CharacterGender, WorldSettings, PowerSystemDefinition, Skill, NewNPCFromAI, Location, Item, ApiProvider, SkillType, LocationType, ItemType } from '../../types';
import { Loader } from '../Loader';
import { getLevelFromRealmName, getRealmDisplayName, calculateManaCost } from '../../services/progressionService';
import * as geminiService from '../../services/geminiService';
import * as openaiService from '../../services/openaiService';
import { TabButton, WandIcon } from './common';
import { IdeaTab } from './IdeaTab';
import { CharacterTab } from './CharacterTab';
import { WorldTab } from './WorldTab';
import { InitialElementsTab } from './InitialElementsTab';
import { UploadIcon, DownloadIcon } from '../ui/Icons';
import { useComponentLog } from '../../hooks/useComponentLog';


interface WorldSetupProps {
    onStartGame: (profile: CharacterProfile, worldSettings: WorldSettings) => void;
    onBackToMenu: () => void;
    apiProvider: ApiProvider;
    apiKey: string;
}

const defaultPowerSystems: PowerSystemDefinition[] = [
    { id: '1', name: 'Tiên Đạo Tu Luyện', realms: 'Phàm Nhân - Luyện Khí - Trúc Cơ - Kim Đan - Nguyên Anh - Hóa Thần - Luyện Hư - Hợp Thể - Đại Thừa - Độ Kiếp' },
    { id: '2', name: 'Ma Đạo Tu Luyện', realms: 'Phàm Nhân - Luyện Tinh Hóa Khí - Luyện Khí Hóa Thần - Luyện Thần Phản Hư - Phản Hư Hợp Đạo - Ma Vương - Ma Tôn' },
    { id: '3', name: 'Yêu Tộc Tu Luyện', realms: 'Phàm Nhân - Khai Khiếu - Thông Mạch - Ngưng Đan - Yêu Anh - Hóa Hình - Quy Nhất - Đại Thành - Phi Thăng' },
];

const initialWorldSettings: WorldSettings = {
    storyIdea: '',
    openingScene: '',
    theme: '',
    genre: 'Tu Tiên (Mặc định)',
    context: '',
    powerSystems: defaultPowerSystems,
    qualityTiers: 'Phổ Thông - Hiếm - Sử Thi - Truyền Thuyết - Thần Thoại - Thần Khí',
    aptitudeTiers: 'Phàm Cốt - Linh Cốt - Tiên Cốt - Thần Cốt - Thánh Cốt - Tổ Cốt',
    playerDefinedRules: [],
    initialKnowledge: [],
};

const initialProfile: CharacterProfile = {
    id: '',
    name: '',
    gender: CharacterGender.MALE,
    race: 'Nhân Tộc',
    powerSystem: defaultPowerSystems[0]?.name ?? '',
    realm: '',
    currencyName: 'Linh Thạch',
    currencyAmount: 10,
    personality: '',
    backstory: '',
    goal: '',
    specialConstitution: { name: '', description: '' },
    talent: { name: '', description: '' },
    baseMaxHealth: 100,
    health: 100,
    maxHealth: 100,
    baseMaxMana: 100,
    mana: 100,
    maxMana: 100,
    baseAttack: 10,
    attack: 10,
    experience: 0,
    level: 1,
    lifespan: 100,
    statusEffects: [],
    achievements: [],
    milestones: [],
    events: [],
    skills: [],
    items: [],
    equipment: {},
    currentLocationId: null,
    discoveredLocations: [],
    discoveredMonsters: [],
    discoveredItems: [],
    gameTime: '',
    secrets: [],
    reputations: [],
    initialNpcs: [],
    initialLocations: [],
    initialItems: [],
    initialMonsters: [],
};

export const WorldSetup: React.FC<WorldSetupProps> = ({ onStartGame, onBackToMenu, apiProvider, apiKey }) => {
    useComponentLog('WorldSetup.tsx');
    const [activeTab, setActiveTab] = useState('idea');
    const [profile, setProfile] = useState<CharacterProfile>(initialProfile);
    const [startingLevelOrRealm, setStartingLevelOrRealm] = useState('');
    const [worldSettings, setWorldSettings] = useState<WorldSettings>(initialWorldSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumber = (e.target as HTMLInputElement).type === 'number';

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setProfile(prev => ({
                ...prev,
                [parent]: {
                    // @ts-ignore
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
             setProfile(prev => ({ ...prev, [name]: isNumber ? parseInt(value, 10) || 0 : value }));
        }
    };
    
    const handleWorldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setWorldSettings(prev => ({ ...prev, [name]: value }));
    };

    const handlePowerSystemChange = (id: string, field: 'name' | 'realms', value: string) => {
        const oldName = worldSettings.powerSystems.find(s => s.id === id)?.name;
        
        setWorldSettings(prev => ({
            ...prev,
            powerSystems: prev.powerSystems.map(system =>
                system.id === id ? { ...system, [field]: value } : system
            )
        }));

        if (field === 'name' && profile.powerSystem === oldName) {
            setProfile(p => ({ ...p, powerSystem: value }));
        }
    };

    const handleAddPowerSystem = () => {
        setWorldSettings(prev => ({
            ...prev,
            powerSystems: [
                ...prev.powerSystems,
                { id: Date.now().toString(), name: ``, realms: 'Phàm Nhân - ' }
            ]
        }));
    };

    const handleRemovePowerSystem = (idToRemove: string) => {
        const systemToRemove = worldSettings.powerSystems.find(s => s.id === idToRemove);
        const newSystems = worldSettings.powerSystems.filter(system => system.id !== idToRemove);

        setWorldSettings(prev => ({
            ...prev,
            powerSystems: newSystems
        }));
        
        if (systemToRemove && profile.powerSystem === systemToRemove.name) {
            setProfile(p => ({ ...p, powerSystem: newSystems.length > 0 ? newSystems[0].name : '' }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile.name.trim()) {
            setError('Tên nhân vật không được để trống.');
            setActiveTab('character');
            return;
        }
        setError('');
        setIsLoading(true);

        let finalProfile = { ...profile };

        const input = startingLevelOrRealm.trim();
        if (input) {
            const levelAsNumber = parseInt(input, 10);
            if (!isNaN(levelAsNumber) && levelAsNumber > 0) {
                finalProfile.level = levelAsNumber;
            } else {
                finalProfile.level = getLevelFromRealmName(input, profile.powerSystem, worldSettings);
            }
        } else {
            finalProfile.level = profile.level > 1 ? profile.level : 1;
        }

        finalProfile.realm = '';

        // Calculate mana cost for all initial skills
        const calculateSkillManaCost = (skill: Skill | Partial<Skill> | undefined) => {
            if (skill) {
                // @ts-ignore
                skill.manaCost = calculateManaCost(skill, worldSettings.qualityTiers);
            }
            return skill;
        };
        // @ts-ignore
        finalProfile.skills = finalProfile.skills.map(calculateSkillManaCost);
        finalProfile.initialNpcs = (finalProfile.initialNpcs || []).map(npc => ({
            ...npc,
            skills: (npc.skills || []).map(calculateSkillManaCost as (skill: Skill) => Skill)
        }));
        finalProfile.initialItems = (finalProfile.initialItems || []).map(item => ({
            ...item,
            grantsSkill: calculateSkillManaCost(item.grantsSkill) as Omit<Skill, 'id' | 'experience' | 'isNew'> | undefined
        }));

        onStartGame(finalProfile, worldSettings);
    };

    const handleExport = () => {
        const profileToExport: Partial<CharacterProfile> = {
            name: profile.name,
            gender: profile.gender,
            race: profile.race,
            powerSystem: profile.powerSystem,
            level: profile.level,
            currencyName: profile.currencyName,
            currencyAmount: profile.currencyAmount,
            personality: profile.personality,
            backstory: profile.backstory,
            goal: profile.goal,
            specialConstitution: profile.specialConstitution,
            talent: profile.talent,
            avatarUrl: profile.avatarUrl,
            skills: profile.skills,
            achievements: profile.achievements,
            milestones: profile.milestones,
            events: profile.events,
            secrets: profile.secrets,
            reputations: profile.reputations,
            initialItems: profile.initialItems,
            initialNpcs: profile.initialNpcs,
            initialLocations: profile.initialLocations,
            initialMonsters: profile.initialMonsters,
        };

        const dataToExport = {
            version: 2,
            worldSettings,
            profile: profileToExport,
            startingLevelOrRealm: startingLevelOrRealm
        };
        
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const now = new Date();
        const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
        const safeCharacterName = (profile.name.trim() || 'NhanVat').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_');

        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeCharacterName}_${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("Không thể đọc tệp.");
                const data = JSON.parse(text);

                if (data && typeof data === 'object' && data.worldSettings && data.profile) {
                    const completeProfile: CharacterProfile = { 
                        ...initialProfile, 
                        ...data.profile, 
                        events: data.profile.events || [], // Backward compatibility for events
                        secrets: data.profile.secrets || [],
                        reputations: data.profile.reputations || [],
                    };
                    const completeWorldSettings: WorldSettings = { ...initialWorldSettings, ...data.worldSettings };
                    
                    setWorldSettings(completeWorldSettings);
                    setProfile(completeProfile);
                    
                    const realmInput = data.startingLevelOrRealm || getRealmDisplayName(completeProfile.level, completeProfile.powerSystem, completeWorldSettings);
                    setStartingLevelOrRealm(realmInput);

                    alert("Đã nhập thiết lập thành công!");
                } else {
                    throw new Error("Tệp không có định dạng hợp lệ.");
                }
            } catch (err) {
                alert(`Lỗi khi nhập tệp: ${(err as Error).message}`);
            } finally {
                if (event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleGenerateWorld = async () => {
        if (!worldSettings.storyIdea.trim()) {
            setError('Vui lòng nhập ý tưởng cốt truyện.');
            setActiveTab('idea');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            const generateWorldFromIdea = apiProvider === ApiProvider.OPENAI ? openaiService.generateWorldFromIdea : geminiService.generateWorldFromIdea;
            const { characterProfile, worldSettings: newWorldSettings } = await generateWorldFromIdea(worldSettings.storyIdea, worldSettings.openingScene, apiKey);
    
            // FIX: Normalize gender from AI response to prevent case-sensitivity issues.
            if (characterProfile.gender) {
                characterProfile.gender = characterProfile.gender.toLowerCase() as CharacterGender;
            }

            // FIX: Normalize gender for initial NPCs from AI response.
            if (characterProfile.initialNpcs && Array.isArray(characterProfile.initialNpcs)) {
                characterProfile.initialNpcs.forEach((npc: NewNPCFromAI) => {
                    if (npc.gender) {
                        npc.gender = npc.gender.toLowerCase() as CharacterGender;
                    }
                });
            }

            const mergedProfile: CharacterProfile = { 
                ...initialProfile, 
                ...characterProfile, 
                events: characterProfile.events || [], // Ensure events array exists
                discoveredLocations: [], 
                discoveredMonsters: characterProfile.initialMonsters || [], 
                discoveredItems: characterProfile.initialItems || [] 
            };
            const mergedWorldSettings = { ...initialWorldSettings, ...newWorldSettings, storyIdea: worldSettings.storyIdea, openingScene: worldSettings.openingScene };
    
            setProfile(mergedProfile);
            setWorldSettings(mergedWorldSettings);
            setStartingLevelOrRealm(getRealmDisplayName(mergedProfile.level, mergedProfile.powerSystem, mergedWorldSettings));

            alert('AI đã điền xong thông tin! Vui lòng kiểm tra các tab Thế giới, Nhân vật và Yếu tố ban đầu.');
            setActiveTab('world');
        } catch (err) {
            const error = err as Error;
            console.error("Lỗi chi tiết khi tạo thế giới:", error);
            setError(`Lỗi khi tạo thế giới bằng AI: ${error.message}. Vui lòng kiểm tra console (F12) để xem chi tiết.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAiFillNpcSkills = async (npcId: string) => {
        const targetNpc = profile.initialNpcs?.find(n => n.id === npcId);
        if (!targetNpc) {
            setError('Không tìm thấy NPC để điền kỹ năng.');
            return;
        }
        
        setError('');
        setIsLoading(true);
        try {
            const generateSkills = apiProvider === ApiProvider.OPENAI ? openaiService.generateNpcSkills : geminiService.generateNpcSkills;
            const newSkillsData = await generateSkills(targetNpc, worldSettings, apiKey);
            
            const newSkills: Skill[] = newSkillsData.map(s => ({
                ...s,
                id: `npcskill_${npcId}_${Date.now()}_${s.name.replace(/\s+/g, '')}`,
                level: 1,
                experience: 0,
                isNew: true,
                manaCost: 0, // Will be calculated later
            }));
            
            setProfile(prev => ({
                ...prev,
                initialNpcs: (prev.initialNpcs || []).map(npc => 
                    npc.id === npcId ? { ...npc, skills: newSkills } : npc
                )
            }));
            
            alert(`AI đã tạo ${newSkills.length} kỹ năng cho ${targetNpc.name}.`);

        } catch (err) {
            const error = err as Error;
            console.error("Lỗi khi AI tạo kỹ năng cho NPC:", error);
            setError(`Lỗi khi AI tạo kỹ năng: ${error.message}.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl h-full mx-auto flex flex-col bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl animate-fade-in">
            {isLoading && <Loader />}
            <div className="flex-shrink-0 px-6 pt-4 flex justify-between items-center border-b border-slate-700">
                <h1 className="text-2xl text-amber-300 font-bold">Thiết Lập Thế Giới</h1>
                <button type="button" onClick={onBackToMenu} className="text-sm text-slate-400 hover:text-amber-400 transition-colors">&larr; Quay lại Menu</button>
            </div>
            <div className="flex-shrink-0 px-6 border-b border-slate-700">
                <nav className="flex space-x-4">
                    <TabButton isActive={activeTab === 'idea'} onClick={() => setActiveTab('idea')}>Ý Tưởng & AI</TabButton>
                    <TabButton isActive={activeTab === 'world'} onClick={() => setActiveTab('world')}>Thế Giới</TabButton>
                    <TabButton isActive={activeTab === 'character'} onClick={() => setActiveTab('character')}>Nhân Vật</TabButton>
                    <TabButton isActive={activeTab === 'elements'} onClick={() => setActiveTab('elements')}>Yếu Tố Ban Đầu</TabButton>
                </nav>
            </div>
            <div className="flex-grow p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                 <form onSubmit={handleSubmit} id="world-setup-form">
                    {activeTab === 'idea' && <IdeaTab worldSettings={worldSettings} handleWorldChange={handleWorldChange} handleGenerateWorld={handleGenerateWorld} isLoading={isLoading} error={error} />}
                    {activeTab === 'character' && <CharacterTab profile={profile} worldSettings={worldSettings} handleProfileChange={handleProfileChange} startingLevelOrRealm={startingLevelOrRealm} setStartingLevelOrRealm={setStartingLevelOrRealm} error={error} />}
                    {activeTab === 'world' && <WorldTab worldSettings={worldSettings} handleWorldChange={handleWorldChange} handlePowerSystemChange={handlePowerSystemChange} handleAddPowerSystem={handleAddPowerSystem} handleRemovePowerSystem={handleRemovePowerSystem} />}
                    {activeTab === 'elements' && <InitialElementsTab profile={profile} worldSettings={worldSettings} setProfile={setProfile} setWorldSettings={setWorldSettings} onAiFillSkills={handleAiFillNpcSkills} isAiLoading={isLoading} />}
                </form>
            </div>
            <div className="flex-shrink-0 p-4 border-t border-slate-700 bg-slate-900/50 flex justify-between items-center">
                <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept="application/json" />
                    <button type="button" onClick={handleImportClick} className="px-4 py-2 flex items-center gap-2 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 transition-colors" aria-label="Nhập thiết lập từ file">
                        <UploadIcon /> Nhập File
                    </button>
                    <button type="button" onClick={handleExport} className="px-4 py-2 flex items-center gap-2 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 transition-colors" aria-label="Xuất thiết lập ra file">
                        <DownloadIcon /> Xuất File
                    </button>
                </div>
                 <button type="submit" form="world-setup-form" className="px-8 py-2 bg-amber-600 text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50" disabled={isLoading}>
                    Bắt Đầu
                </button>
            </div>
        </div>
    );
};