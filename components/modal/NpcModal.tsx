

import React, { useState, useMemo, useEffect } from 'react';
import { NPC, CharacterGender, StatusEffect, WorldSettings, CharacterProfile } from '../../types';
import { calculateBaseStatsForLevel } from '../../services/progressionService';
import { ImageLibraryModal } from './ImageLibraryModal';

interface NpcModalProps {
    isOpen: boolean;
    onClose: () => void;
    npcs: NPC[];
    onUpdateNpc: (updatedNpc: NPC) => void;
    worldSettings: WorldSettings;
    characterProfile: CharacterProfile;
}

const NewBadge = () => <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold text-slate-900 bg-yellow-300 rounded-full">NEW</span>;

const getRelationshipText = (value: number) => {
    if (value <= -750) return { text: 'Kẻ Thù', color: 'text-red-500' };
    if (value <= -250) return { text: 'Ghét Bỏ', color: 'text-red-400' };
    if (value < 250) return { text: 'Trung Lập', color: 'text-slate-400' };
    if (value < 750) return { text: 'Thân Thiện', color: 'text-green-400' };
    return { text: 'Tôn Trọng', color: 'text-green-300' };
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

const HealthBar = ({ value, maxValue }: { value: number; maxValue: number; }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <div className="w-full">
            <div className="flex justify-between items-baseline mb-1 text-xs">
                <span className="text-slate-300 font-medium">Sinh Lực</span>
                <span className="font-semibold text-red-400">{Math.round(value).toLocaleString()} / {maxValue.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-red-600 to-red-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const ManaBar = ({ value, maxValue }: { value: number; maxValue: number; }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <div className="w-full">
            <div className="flex justify-between items-baseline mb-1 text-xs">
                <span className="text-slate-300 font-medium">Linh Lực</span>
                <span className="font-semibold text-blue-400">{Math.round(value).toLocaleString()} / {maxValue.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const getDefaultAvatar = (gender: CharacterGender) => {
    return gender === CharacterGender.MALE 
        ? 'https://i.imgur.com/9CXRf64.png' 
        : 'https://i.imgur.com/K8Z3w4q.png';
};

export const NpcModal: React.FC<NpcModalProps> = ({ isOpen, onClose, npcs, onUpdateNpc, worldSettings, characterProfile }) => {
    const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);
    const [raceFilter, setRaceFilter] = useState('all');
    const [genderFilter, setGenderFilter] = useState('all');
    const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);

    useEffect(() => {
        const filtered = filterNpcs(npcs, raceFilter, genderFilter);
        if (isOpen && filtered.length > 0 && (!selectedNpcId || !filtered.some(n => n.id === selectedNpcId))) {
            setSelectedNpcId(filtered[0].id);
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
        if (!selectedNpc || !characterProfile) return [];
        
        const relationships: { targetId: string; targetName: string; value: number; isPlayer: boolean; avatarUrl?: string; gender: CharacterGender; }[] = [];

        relationships.push({
            targetId: 'player', 
            targetName: characterProfile.name,
            value: selectedNpc.relationship,
            isPlayer: true,
            avatarUrl: characterProfile.avatarUrl,
            gender: characterProfile.gender
        });

        if (selectedNpc.npcRelationships) {
            selectedNpc.npcRelationships.forEach(rel => {
                const targetNpc = npcs.find(n => n.id === rel.targetNpcId);
                if (targetNpc) {
                    relationships.push({
                        targetId: targetNpc.id,
                        targetName: targetNpc.name,
                        value: rel.value,
                        isPlayer: false,
                        avatarUrl: targetNpc.avatarUrl,
                        gender: targetNpc.gender
                    });
                }
            });
        }
        return relationships.sort((a, b) => b.value - a.value);
    }, [selectedNpc, npcs, characterProfile]);

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
                             <h2 className="text-xl font-bold text-slate-100">Thông tin Nhân vật</h2>
                             <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Đóng">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                            {selectedNpc && npcStats ? (
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
                                            <div>
                                                <h2 className="text-3xl font-bold text-amber-300 flex items-center justify-center md:justify-start">
                                                    {selectedNpc.name}
                                                    {selectedNpc.isNew && <NewBadge />}
                                                </h2>
                                                {selectedNpc.aliases && <p className="text-sm text-slate-400">Biệt danh: {selectedNpc.aliases}</p>}
                                            </div>
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
                                        <Section title="Tổng Quan & Đặc Điểm">
                                            <p className="font-bold text-amber-200">Mô tả</p>
                                            <p>{selectedNpc.description || 'Chưa có mô tả.'}</p>
                                            
                                            <p className="font-bold text-amber-200 mt-4">Tính cách</p>
                                            <p>{selectedNpc.personality || 'Chưa có mô tả.'}</p>
                                            
                                            {selectedNpc.innateTalent?.name && <p className="mt-4"><span className="font-bold text-amber-200">Thiên phú:</span> {selectedNpc.innateTalent.name} - {selectedNpc.innateTalent.description}</p>}
                                            {selectedNpc.specialConstitution?.name && <p className="mt-2"><span className="font-bold text-amber-200">Thể chất:</span> {selectedNpc.specialConstitution.name} - {selectedNpc.specialConstitution.description}</p>}
                                        </Section>

                                        <Section title="Trạng Thái Hiện Tại">
                                            {selectedNpc.statusEffects.length > 0 ? (
                                                <div className="space-y-2">
                                                    {selectedNpc.statusEffects.map((effect, index) => (
                                                        <div key={index} className="p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
                                                            <div className="flex justify-between items-center font-bold text-green-300">
                                                                <span>{effect.name}</span>
                                                                <span className="text-xs font-normal text-slate-400">{effect.duration}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-300 mt-1">{effect.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : <p className="text-slate-500 text-center py-4">Không có trạng thái nào.</p>}
                                        </Section>

                                        <Section title="Tất Cả Mối Quan Hệ">
                                            {allRelationships.length > 0 ? (
                                                <div className="space-y-2">
                                                    {allRelationships.map((rel, index) => {
                                                        const isDaoLuWithPlayer = rel.isPlayer && selectedNpc?.isDaoLu;
                                                        const relationship = isDaoLuWithPlayer
                                                            ? { text: '❤️ Đạo Lữ', color: 'text-pink-400' }
                                                            : getRelationshipText(rel.value);
                                                        
                                                        const valueText = isDaoLuWithPlayer ? '1000' : rel.value;
                                                        
                                                        const defaultAvatarForRel = getDefaultAvatar(rel.gender);

                                                        return (
                                                            <div key={rel.targetId + index} className="flex justify-between items-center p-2.5 bg-slate-800/50 rounded-lg text-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <img src={rel.avatarUrl || defaultAvatarForRel} className="w-8 h-8 rounded-full object-cover" onError={(e) => { e.currentTarget.src = defaultAvatarForRel; }}/>
                                                                    <span className={`font-semibold ${rel.isPlayer ? 'text-amber-300' : 'text-white'}`}>{rel.targetName}</span>
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
                                                <ul className="list-disc list-inside space-y-2 text-slate-300">
                                                    {selectedNpc.memories.map((mem, i) => <li key={i}>{mem}</li>)}
                                                </ul>
                                            ) : <p className="text-slate-500 text-center py-4">Chưa có ký ức đáng nhớ nào.</p>}
                                        </Section>
                                    </div>
                                </div>
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