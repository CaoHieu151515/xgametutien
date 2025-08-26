import React, { useState, useMemo, useEffect } from 'react';
import { NPC, CharacterGender, StatusEffect, WorldSettings, CharacterProfile, SkillType, Skill, FullGameState } from '../../types';
import { calculateBaseStatsForLevel } from '../../services/progressionService';
import { ImageLibraryModal } from './ImageLibraryModal';
import { getRelationshipDisplay, getDefaultAvatar } from '../../utils/uiHelpers';
import { HealthBar, ManaBar, SkillExperienceBar } from './tabs/shared/Common';

interface NpcModalProps {
    isOpen: boolean;
    onClose: () => void;
    npcs: NPC[];
    onUpdateNpc: (updatedNpc: NPC) => void;
    worldSettings: WorldSettings;
    characterProfile: CharacterProfile;
    fullGameState: FullGameState;
}

const NewBadge = () => <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold text-slate-900 bg-yellow-300 rounded-full">NEW</span>;

const FistIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M15.992 5.122a.75.75 0 0 1 0 1.06l-5.992 6a.75.75 0 0 1-1.122.063l-2.5-3a.75.75 0 1 1 1.122-1.004l1.91 2.288 5.53-5.53a.75.75 0 0 1 1.054-.078Z" clipRule="evenodd" /><path d="M4.5 9.5a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" /></svg>;
const DragonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.02 6.539a1.5 1.5 0 0 0-2.04 0l-.13.13a1.5 1.5 0 0 0 0 2.04l.13.13a1.5 1.5 0 0 0 2.04 0l.13-.13a1.5 1.5 0 0 0 0-2.04l-.13-.13zM11.5 9a1.5 1.5 0 0 1 2.04 0l.13.13a1.5 1.5 0 0 1 0 2.04l-.13.13a1.5 1.5 0 0 1-2.04 0l-.13-.13a1.5 1.5 0 0 1 0-2.04l.13-.13z" /><path fillRule="evenodd" d="M15.65 4.35a8 8 0 1 0-11.3 0 8 8 0 0 0 11.3 0ZM6.53 7.89a.75.75 0 0 0-1.06-1.06L2.94 9.36a.75.75 0 0 0 0 1.06l2.53 2.53a.75.75 0 0 0 1.06-1.06L4.56 10.44l1.97-1.97v-.58ZM13.47 7.89a.75.75 0 0 1 1.06-1.06l2.53 2.53a.75.75 0 0 1 0 1.06l-2.53 2.53a.75.75 0 0 1-1.06-1.06L15.44 10.44l-1.97-1.97v-.58Z" clipRule="evenodd" /></svg>;

const getPowerTier = (level: number) => {
    if (level >= 90) {
        return {
            name: 'Ẩn Thế Cao Nhân',
            color: 'text-purple-300 border-purple-500 bg-purple-900/40',
            icon: <DragonIcon />,
            description: 'Đỉnh cao của tu luyện, một huyền thoại sống có thể thay đổi cục diện thế giới. Sự tồn tại của họ thường là bí mật.'
        };
    }
    if (level >= 70) {
        return {
            name: 'Tông Sư',
            color: 'text-amber-400 border-amber-500 bg-amber-900/40',
            icon: <FistIcon />,
            description: 'Một cường giả có thể là trưởng lão của một tông môn hạng trung hoặc một bá chủ một phương. Sở hữu sức mạnh đáng kinh ngạc.'
        };
    }
     if (level >= 40) {
        return {
            name: 'Cao Thủ',
            color: 'text-sky-400 border-sky-500 bg-sky-900/40',
            icon: null,
            description: 'Một tu sĩ có thực lực, đã có được vị thế nhất định trong giới tu luyện.'
        };
    }
    return {
        name: 'Bình Thường',
        color: 'text-slate-400 border-slate-600 bg-slate-800/40',
        icon: null,
        description: 'Tu vi không đáng kể hoặc chỉ là một phàm nhân.'
    };
};

const FormSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-slate-200 appearance-none bg-no-repeat bg-right pr-8" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`}}/>
);

const DetailCard = ({ label, value, className = '' }: { label: string, value: string | number, className?: string }) => (
    <div className={`bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50 text-center ${className}`}>
        <label className="text-xs text-slate-400 block">{label}</label>
        <p className="text-sm font-semibold text-slate-100 truncate">{value}</p>
    </div>
);

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div>
        <h4 className="text-lg font-bold text-amber-300 mb-3 tracking-wider border-b border-amber-500/20 pb-2">{title}</h4>
        <div className="text-slate-300 text-sm leading-relaxed space-y-3 whitespace-pre-wrap">
            {children}
        </div>
    </div>
);

type StatusEffectType = 'positive' | 'negative' | 'special';

const getStatusEffectType = (effect: StatusEffect): StatusEffectType => {
    const name = effect.name.toLowerCase();

    // Special keywords are very specific and take precedence
    const specialKeywords = ['trang bị:', 'huyết mạch', 'long phượng', 'khuyển nô', 'thân thể', 'sáng thế', 'bị khóa', 'bị thiến', 'mang thai'];
    if (specialKeywords.some(kw => name.includes(kw))) {
        return 'special';
    }

    // Negative keywords suggest a debuff
    const negativeKeywords = ['độc', 'suy yếu', 'giảm', 'trúng', 'thương', 'bỏng', 'tê liệt', 'choáng', 'hỗn loạn', 'mất', 'trừ', 'nguyền', 'trói', 'phế', 'trọng thương', 'suy nhược', 'ma khí', 'nhiễu loạn', 'vướng vấn', 'phản phệ', 'suy kiệt', 'ma hóa', 'khô kiệt'];
    if (negativeKeywords.some(kw => name.includes(kw))) {
        return 'negative';
    }
    
    // If it's not special or negative, it's likely positive.
    return 'positive';
};

const statusStyles: Record<StatusEffectType, { border: string; bg: string; text: string; }> = {
    positive: {
        border: 'border-green-500/30',
        bg: 'bg-green-900/30',
        text: 'text-green-300',
    },
    negative: {
        border: 'border-red-500/30',
        bg: 'bg-red-900/30',
        text: 'text-red-400',
    },
    special: {
        border: 'border-purple-500/30',
        bg: 'bg-purple-900/30',
        text: 'text-purple-300',
    }
};

type NpcModalTab = 'info' | 'skills';

export const NpcModal: React.FC<NpcModalProps> = ({ isOpen, onClose, npcs, onUpdateNpc, worldSettings, characterProfile, fullGameState }) => {
    const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);
    const [raceFilter, setRaceFilter] = useState('all');
    const [genderFilter, setGenderFilter] = useState('all');
    const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<NpcModalTab>('info');

    useEffect(() => {
        const filtered = filterNpcs(npcs, raceFilter, genderFilter);
        if (isOpen) {
            setActiveTab('info');
            if(filtered.length > 0 && (!selectedNpcId || !filtered.some(n => n.id === selectedNpcId))) {
                setSelectedNpcId(filtered[0].id);
            }
        }
        if (!isOpen) {
            setSelectedNpcId(null);
            setIsImageLibraryOpen(false);
        }
    }, [isOpen, npcs, selectedNpcId, raceFilter, genderFilter]);
    
    const races = useMemo(() => ['all', ...Array.from(new Set(npcs.map(npc => npc.race)))], [npcs]);
    
    const filterNpcs = (npcList: NPC[], race: string, gender: string) => {
        return npcList.filter(npc => {
            const raceMatch = race === 'all' || npc.race === race;
            const genderMatch = gender === 'all' || npc.gender === gender;
            return raceMatch && genderMatch;
        });
    };
    
    const filteredNpcs = useMemo(() => {
        return filterNpcs(npcs, raceFilter, genderFilter);
    }, [npcs, raceFilter, genderFilter]);

    const selectedNpc = useMemo(() => npcs.find(n => n.id === selectedNpcId), [npcs, selectedNpcId]);

    const allRelationships = useMemo(() => {
        if (!selectedNpc || !characterProfile || !fullGameState) return [];
        
        type RelationshipDisplay = {
            targetId: string;
            targetName: string;
            value: number | undefined;
            relationshipType?: string;
            isPlayer: boolean;
            avatarUrl?: string;
            gender: CharacterGender;
        };
        
        const relationships: RelationshipDisplay[] = [];

        // 1. Relationship with Player's True Self
        relationships.push({
            targetId: 'player_true_self',
            targetName: `${characterProfile.name} (Bản Thể Thật)`,
            value: selectedNpc.relationship,
            relationshipType: selectedNpc.isDaoLu ? 'Đạo lữ' : undefined,
            isPlayer: true,
            avatarUrl: characterProfile.avatarUrl,
            gender: characterProfile.gender
        });

        // 2. Relationships with Player's Identities
        fullGameState.identities.forEach(identity => {
            const rel = identity.npcRelationships.find(r => r.targetNpcId === selectedNpc.id);
            // Only display if a relationship exists
            if (rel && rel.value !== 0) {
                relationships.push({
                    targetId: identity.id,
                    targetName: `${identity.name} (Nhân Dạng)`,
                    value: rel.value,
                    relationshipType: undefined, // Identities can't be Dao Lu
                    isPlayer: true,
                    avatarUrl: identity.imageUrl,
                    gender: characterProfile.gender // Identities share player's gender
                });
            }
        });

        // 3. Relationships with other NPCs
        if (selectedNpc.npcRelationships) {
            selectedNpc.npcRelationships.forEach(rel => {
                const targetNpc = npcs.find(n => n.id === rel.targetNpcId);
                if (targetNpc) {
                    relationships.push({
                        targetId: targetNpc.id,
                        targetName: targetNpc.name,
                        value: rel.value,
                        relationshipType: rel.relationshipType,
                        isPlayer: false,
                        avatarUrl: targetNpc.avatarUrl,
                        gender: targetNpc.gender
                    });
                }
            });
        }
        
        const filteredRelationships = relationships.filter(r => r.value !== undefined || r.relationshipType === 'Đạo lữ');

        return filteredRelationships.sort((a, b) => (b.value ?? -Infinity) - (a.value ?? -Infinity));

    }, [selectedNpc, npcs, characterProfile, fullGameState]);

    const handleAvatarUrlUpdate = (url: string) => {
        if (selectedNpc) {
            onUpdateNpc({ ...selectedNpc, avatarUrl: url });
        }
    };
    
    const totalMienLuc = selectedNpc?.mienLuc 
        ? selectedNpc.mienLuc.body + selectedNpc.mienLuc.face + selectedNpc.mienLuc.aura + selectedNpc.mienLuc.power 
        : 0;
        
    const npcStats = useMemo(() => {
        if (!selectedNpc) return null;
        return calculateBaseStatsForLevel(selectedNpc.level);
    }, [selectedNpc]);
    
    const powerTier = useMemo(() => selectedNpc ? getPowerTier(selectedNpc.level) : null, [selectedNpc]);

    if (!isOpen) return null;

    return (
        <>
            <div 
                className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
                onClick={onClose}
            >
                <div 
                    className="bg-slate-800 border border-slate-700/50 rounded-lg shadow-2xl w-full max-w-7xl m-4 flex flex-col md:flex-row max-h-[90vh] h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Left Sidebar */}
                    <div className="w-full md:w-1/3 md:max-w-sm h-1/3 md:h-full bg-slate-900/40 rounded-t-lg md:rounded-l-lg md:rounded-tr-none flex flex-col">
                        <div className="p-4 border-b border-slate-700/50">
                            <h3 className="text-lg font-bold text-slate-100">Bộ Lọc NPC</h3>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-300 mb-1 block">Chủng tộc</label>
                                    <FormSelect value={raceFilter} onChange={e => setRaceFilter(e.target.value)}>
                                        {races.map(race => <option key={race} value={race}>{race === 'all' ? 'Tất cả' : race}</option>)}
                                    </FormSelect>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-300 mb-1 block">Giới tính</label>
                                    <FormSelect value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
                                        <option value="all">Tất cả</option>
                                        <option value={CharacterGender.MALE}>Nam</option>
                                        <option value={CharacterGender.FEMALE}>Nữ</option>
                                    </FormSelect>
                                </div>
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto custom-scrollbar p-2">
                            {filteredNpcs.map(npc => (
                                <button
                                    key={npc.id}
                                    onClick={() => setSelectedNpcId(npc.id)}
                                    className={`w-full text-left p-2 rounded-lg transition-colors flex items-center gap-3 border-l-2 ${selectedNpcId === npc.id ? 'bg-slate-700/50 border-amber-400' : 'border-transparent hover:bg-slate-700/30'} ${npc.isDead ? 'opacity-40' : ''}`}
                                >
                                    <img src={npc.avatarUrl || getDefaultAvatar(npc.gender)} alt={npc.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className={`font-bold truncate flex items-center ${selectedNpcId === npc.id ? 'text-amber-300' : 'text-slate-200'}`}>
                                            {npc.isDead && '💀 '}
                                            {npc.name}
                                            {npc.isNew && <NewBadge />}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate">{npc.realm}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="flex-grow flex flex-col overflow-hidden">
                        <div className="p-4 flex-shrink-0 border-b border-slate-700/50 flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                {selectedNpc && (
                                    <>
                                        <button onClick={() => setActiveTab('info')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'info' ? 'bg-amber-600/20 text-amber-300' : 'text-slate-400 hover:bg-slate-700/50'}`}>Thông Tin</button>
                                        <button onClick={() => setActiveTab('skills')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'skills' ? 'bg-amber-600/20 text-amber-300' : 'text-slate-400 hover:bg-slate-700/50'}`}>Kỹ Năng</button>
                                    </>
                                )}
                             </div>
                             <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Đóng">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                            {selectedNpc && npcStats && powerTier ? (
                                activeTab === 'info' ? (
                                    <div className="relative animate-fade-in space-y-6">
                                        {selectedNpc.isDead && (
                                            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                                                <span className="text-4xl font-bold text-red-500 transform -rotate-12 border-4 border-red-500 p-4">ĐÃ TỬ VONG</span>
                                            </div>
                                        )}
                                        {/* Hero Section */}
                                        <div className="flex flex-col md:flex-row gap-6 items-start">
                                            <div className="flex-shrink-0 flex flex-col items-center gap-2 w-40 mx-auto md:mx-0">
                                                <img 
                                                    src={selectedNpc.avatarUrl || getDefaultAvatar(selectedNpc.gender)} 
                                                    alt={`Ảnh đại diện của ${selectedNpc.name}`}
                                                    className="w-40 h-40 rounded-full object-cover border-4 border-slate-700 shadow-lg"
                                                    onError={(e) => { e.currentTarget.src = getDefaultAvatar(selectedNpc.gender); }}
                                                />
                                                <button onClick={() => setIsImageLibraryOpen(true)} className="w-full mt-2 py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-md text-sm transition-colors" disabled={selectedNpc.isDead}>
                                                    Chọn Từ Thư Viện
                                                </button>
                                            </div>
                                            <div className="flex-grow space-y-4 text-center md:text-left">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center md:justify-start gap-x-4 gap-y-2">
                                                    <h2 className="text-3xl font-bold text-amber-300 flex items-center justify-center md:justify-start">
                                                        {selectedNpc.name}
                                                        {selectedNpc.isNew && <NewBadge />}
                                                    </h2>
                                                    {powerTier.name !== 'Bình Thường' && (
                                                        <div className={`flex items-center gap-2 px-3 py-1 border rounded-full text-sm font-semibold ${powerTier.color} ${powerTier.name === 'Ẩn Thế Cao Nhân' ? 'shadow-[0_0_15px_rgba(192,132,252,0.5)]' : ''}`}>
                                                            {powerTier.icon}
                                                            <span>{powerTier.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-400">Biệt danh: {(selectedNpc.aliases && selectedNpc.aliases.toLowerCase() !== 'null') ? selectedNpc.aliases : 'Chưa rõ'}</p>
                                            
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                                    <DetailCard label="Giới tính" value={selectedNpc.gender === CharacterGender.MALE ? 'Nam' : 'Nữ'} />
                                                    <DetailCard label="Chủng Tộc" value={selectedNpc.race} />
                                                    <DetailCard label="Cảnh giới" value={selectedNpc.realm} />
                                                    <DetailCard label="Tư chất" value={selectedNpc.aptitude} />
                                                </div>
                                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 space-y-3">
                                                    <HealthBar value={selectedNpc.health} maxValue={npcStats.maxHealth} />
                                                    <ManaBar value={selectedNpc.mana} maxValue={npcStats.maxMana} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <DetailCard label="Sức Tấn Công" value={npcStats.attack.toLocaleString()} />
                                                    <DetailCard label="Tổng Mị Lực" value={totalMienLuc} />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* MERGED CONTENT */}
                                        <div className="border-t border-slate-700/50 pt-6 space-y-8">
                                            <Section title="Đánh giá sức mạnh">
                                                <p>{powerTier.description}</p>
                                            </Section>

                                            <Section title="Tổng Quan & Đặc Điểm">
                                                <p className="font-bold text-amber-200">Mô tả</p>
                                                <p>{selectedNpc.description || 'Chưa có mô tả.'}</p>
                                                
                                                <p className="font-bold text-amber-200 mt-4">Ngoại hình</p>
                                                <p>{(selectedNpc.ngoaiHinh && selectedNpc.ngoaiHinh.toLowerCase() !== 'null') ? selectedNpc.ngoaiHinh : 'Chưa rõ'}</p>

                                                <p className="font-bold text-amber-200 mt-4">Tính cách</p>
                                                <p>{selectedNpc.personality || 'Chưa có mô tả.'}</p>
                                                
                                                <p className="mt-4"><span className="font-bold text-amber-200">Thiên phú:</span> {(selectedNpc.innateTalent?.name && selectedNpc.innateTalent.name.toLowerCase() !== 'null') ? `${selectedNpc.innateTalent.name} - ${selectedNpc.innateTalent.description}` : 'Chưa rõ'}</p>
                                                <p className="mt-2"><span className="font-bold text-amber-200">Thể chất:</span> {(selectedNpc.specialConstitution?.name && selectedNpc.specialConstitution.name.toLowerCase() !== 'null') ? `${selectedNpc.specialConstitution.name} - ${selectedNpc.specialConstitution.description}` : 'Chưa rõ'}</p>
                                            </Section>

                                            <Section title="Trạng Thái Hiện Tại">
                                                {selectedNpc.statusEffects.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {selectedNpc.statusEffects.map((effect, index) => {
                                                            const style = statusStyles[getStatusEffectType(effect)];
                                                            return (
                                                                <div key={index} className={`p-3 ${style.bg} border ${style.border} rounded-lg`}>
                                                                    <div className={`flex justify-between items-center font-bold ${style.text}`}>
                                                                        <span>{effect.name}</span>
                                                                        <span className="text-xs font-normal text-slate-400">{effect.duration}</span>
                                                                    </div>
                                                                    <p className="text-xs text-slate-300 mt-1">{effect.description}</p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : <p className="text-slate-500 text-center py-4">Không có trạng thái nào.</p>}
                                            </Section>

                                            <Section title="Tất Cả Mối Quan Hệ">
                                                {allRelationships.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {allRelationships.map((rel, index) => {
                                                            const score = rel.isPlayer && rel.relationshipType === 'Đạo lữ' ? 1000 : rel.value;
                                                            const relationship = getRelationshipDisplay(score);
                                                            const valueText = rel.isPlayer && rel.relationshipType === 'Đạo lữ' ? '1000' : (rel.value !== undefined ? rel.value : '???');
                                                            const defaultAvatarForRel = getDefaultAvatar(rel.gender);
                                                            const isDaoLuRel = rel.relationshipType === 'Đạo lữ';

                                                            return (
                                                                <div key={rel.targetId + index} className="flex justify-between items-center p-2.5 bg-slate-800/50 rounded-lg text-sm">
                                                                    <div className="flex items-center gap-3">
                                                                        <img src={rel.avatarUrl || defaultAvatarForRel} className="w-8 h-8 rounded-full object-cover" onError={(e) => { e.currentTarget.src = defaultAvatarForRel; }}/>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`font-semibold ${rel.isPlayer ? 'text-amber-300' : 'text-white'}`}>{rel.targetName}</span>
                                                                            {isDaoLuRel && (
                                                                                <span className="text-xs text-pink-300 bg-pink-900/50 px-2 py-0.5 rounded-full">❤️ Đạo lữ</span>
                                                                            )}
                                                                            {rel.relationshipType && !isDaoLuRel && (
                                                                                <span className="text-xs text-cyan-300 bg-cyan-900/50 px-2 py-0.5 rounded-full">{rel.relationshipType}</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className={`font-bold ${relationship.color}`}>{relationship.text}</span>
                                                                        <p className="text-xs text-slate-500">{valueText}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : <p className="text-slate-500 text-center py-4">Không có mối quan hệ nào được ghi nhận.</p>}
                                            </Section>

                                            <Section title="Ký Ức">
                                                {selectedNpc.memories.length > 0 ? (
                                                    <ul className="list-disc list-inside space-y-2 text-slate-300 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                                        {selectedNpc.memories.map((mem, i) => <li key={i}>{mem}</li>)}
                                                    </ul>
                                                ) : <p className="text-slate-500 text-center py-4">Chưa có ký ức đáng nhớ nào.</p>}
                                            </Section>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                        {[
                                            SkillType.ATTACK, SkillType.DEFENSE,
                                            SkillType.MOVEMENT, SkillType.CULTIVATION,
                                            SkillType.SUPPORT, SkillType.SPECIAL,
                                        ].map(skillType => {
                                            const skill = selectedNpc.skills?.find(s => s.type === skillType);
                                            return (
                                                <div key={skillType} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 min-h-[180px] flex flex-col">
                                                    <h5 className="font-bold text-cyan-300 mb-2">{skillType}</h5>
                                                    {skill ? (
                                                        <div className="space-y-3 flex-grow flex flex-col">
                                                            <div className="flex-grow space-y-2">
                                                                <h3 className="text-lg font-bold text-amber-300">{skill.name}</h3>
                                                                <div className="flex items-baseline space-x-4 text-xs text-slate-400 border-b border-slate-700/50 pb-2">
                                                                    <span>Phẩm chất: <span className="font-semibold text-slate-200">{skill.quality}</span></span>
                                                                    <span>Cấp: <span className="font-semibold text-slate-200">{skill.level}</span></span>
                                                                    <span>Tiêu hao: <span className="font-semibold text-blue-300">{skill.manaCost} MP</span></span>
                                                                </div>
                                                                <p className="text-sm text-slate-400 whitespace-pre-wrap">{skill.description}</p>
                                                            </div>
                                                            <div className="flex-shrink-0">
                                                                <SkillExperienceBar 
                                                                    value={skill.experience} 
                                                                    level={skill.level}
                                                                    quality={skill.quality}
                                                                    qualityTiersString={worldSettings.qualityTiers}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full">
                                                            <p className="text-slate-500 italic">Chưa tu luyện</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500">
                                    <p>Chọn một nhân vật từ danh sách để xem chi tiết.</p>
                                </div>
                            )}
                        </div>
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