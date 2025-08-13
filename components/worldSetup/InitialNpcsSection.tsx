import React, { useState, useMemo, useEffect } from 'react';
import { CharacterProfile, WorldSettings, NewNPCFromAI, CharacterGender, MienLuc, NpcRelationship } from '../../../types';
import { FormInput, FormSelect, FormTextArea, FormLabel, RemoveIcon } from '../common';

interface InitialNpcsSectionProps {
    profile: CharacterProfile;
    worldSettings: WorldSettings;
    setProfile: React.Dispatch<React.SetStateAction<CharacterProfile>>;
}

const DetailSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-t border-slate-700 pt-4">
        <h4 className="text-md font-semibold text-amber-200 mb-2">{title}</h4>
        <div className="space-y-4">{children}</div>
    </div>
);

export const InitialNpcsSection: React.FC<InitialNpcsSectionProps> = ({ profile, worldSettings, setProfile }) => {
    const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);

    const initialNpcs = useMemo(() => profile.initialNpcs || [], [profile.initialNpcs]);

    useEffect(() => {
        if (!selectedNpcId && initialNpcs.length > 0) {
            setSelectedNpcId(initialNpcs[0].id);
        }
        if (selectedNpcId && !initialNpcs.some(n => n.id === selectedNpcId)) {
            setSelectedNpcId(initialNpcs.length > 0 ? initialNpcs[0].id : null);
        }
    }, [initialNpcs, selectedNpcId]);

    const selectedNpc = useMemo(() => initialNpcs.find(npc => npc.id === selectedNpcId), [initialNpcs, selectedNpcId]);

    const handleAddInitialNpc = () => {
        const newNpc: NewNPCFromAI = {
            id: `npc_initial_${Date.now()}`,
            name: 'NPC Mới',
            gender: CharacterGender.FEMALE,
            race: 'Nhân Tộc',
            personality: '',
            description: '',
            level: 1,
            powerSystem: profile.powerSystem,
            aptitude: worldSettings.aptitudeTiers.split(' - ')[0]?.trim() || 'Phàm Nhân',
            mienLuc: { body: 10, face: 10, aura: 10, power: 5 },
            locationId: profile.initialLocations?.[0]?.id || '',
            statusEffects: [],
            npcRelationships: [],
        };
        setProfile(prev => {
            const newNpcs = [...(prev.initialNpcs || []), newNpc];
            return { ...prev, initialNpcs: newNpcs };
        });
        setSelectedNpcId(newNpc.id);
    };

    const handleRemoveInitialNpc = (idToRemove: string) => {
        setProfile(prev => ({
            ...prev,
            initialNpcs: (prev.initialNpcs || []).filter(npc => npc.id !== idToRemove)
        }));
    };

    const handleUpdateInitialNpc = (id: string, field: string, value: any) => {
        setProfile(prev => ({
            ...prev,
            initialNpcs: (prev.initialNpcs || []).map(npc => {
                if (npc.id === id) {
                    const keys = field.split('.');
                    if (keys.length > 1) {
                        // Handle nested properties like "mienLuc.body"
                        const updatedNpc = { ...npc };
                        let currentLevel: any = updatedNpc;
                        for (let i = 0; i < keys.length - 1; i++) {
                            currentLevel[keys[i]] = { ...(currentLevel[keys[i]] || {}) };
                            currentLevel = currentLevel[keys[i]];
                        }
                        currentLevel[keys[keys.length - 1]] = value;
                        return updatedNpc;
                    }
                    return { ...npc, [field]: value };
                }
                return npc;
            })
        }));
    };

    const handleRelationshipChange = (targetNpcId: string, valueStr: string) => {
        if (!selectedNpc) return;
        const value = parseInt(valueStr, 10);
        const currentRelationships = selectedNpc.npcRelationships || [];
        let newRelationships: NpcRelationship[];

        if (isNaN(value) || value === 0) {
            newRelationships = currentRelationships.filter(r => r.targetNpcId !== targetNpcId);
        } else {
            const existingRelIndex = currentRelationships.findIndex(r => r.targetNpcId === targetNpcId);
            if (existingRelIndex > -1) {
                newRelationships = [...currentRelationships];
                newRelationships[existingRelIndex] = { ...newRelationships[existingRelIndex], value };
            } else {
                newRelationships = [...currentRelationships, { targetNpcId, value }];
            }
        }
        handleUpdateInitialNpc(selectedNpc.id, 'npcRelationships', newRelationships);
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 min-h-[500px]">
            <div className="w-full md:w-1/3 h-64 md:h-auto flex-shrink-0 bg-slate-800/50 p-2 rounded-lg border border-slate-700 flex flex-col">
                <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 space-y-1">
                    {initialNpcs.map(npc => (
                        <button
                            type="button"
                            key={npc.id}
                            onClick={() => setSelectedNpcId(npc.id)}
                            className={`w-full text-left p-2 rounded-md transition-colors flex justify-between items-center ${selectedNpcId === npc.id ? 'bg-amber-600/20' : 'hover:bg-slate-700/50'}`}
                        >
                            <span className={`font-semibold truncate ${selectedNpcId === npc.id ? 'text-amber-300' : 'text-slate-200'}`}>{npc.name || '(Chưa có tên)'}</span>
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveInitialNpc(npc.id); }} className="text-slate-500 hover:text-red-400 text-lg px-1">&times;</button>
                        </button>
                    ))}
                </div>
                <div className="flex-shrink-0 pt-2 mt-2 border-t border-slate-700">
                    <button type="button" onClick={handleAddInitialNpc} className="w-full py-2 px-4 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-amber-300 hover:border-amber-400 transition-all text-sm">
                        + Thêm NPC
                    </button>
                </div>
            </div>
            <div className="w-full md:w-2/3 flex-shrink-0 bg-slate-800/50 p-4 rounded-lg border border-slate-700 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                {selectedNpc ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><FormLabel>Tên NPC</FormLabel><FormInput value={selectedNpc.name} onChange={e => handleUpdateInitialNpc(selectedNpc.id, 'name', e.target.value)} /></div>
                            <div><FormLabel>Biệt danh</FormLabel><FormInput value={selectedNpc.aliases || ''} onChange={e => handleUpdateInitialNpc(selectedNpc.id, 'aliases', e.target.value)} /></div>
                        </div>
                        <div><FormLabel>URL ảnh đại diện</FormLabel><FormInput value={selectedNpc.avatarUrl || ''} onChange={e => handleUpdateInitialNpc(selectedNpc.id, 'avatarUrl', e.target.value)} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><FormLabel>Giới tính</FormLabel><FormSelect value={selectedNpc.gender} onChange={e => handleUpdateInitialNpc(selectedNpc.id, 'gender', e.target.value as CharacterGender)}>{Object.values(CharacterGender).map(g => <option key={g} value={g}>{g === 'male' ? 'Nam' : 'Nữ'}</option>)}</FormSelect></div>
                            <div><FormLabel>Chủng tộc</FormLabel><FormInput value={selectedNpc.race} onChange={e => handleUpdateInitialNpc(selectedNpc.id, 'race', e.target.value)} /></div>
                        </div>
                        <div><FormLabel>Mô tả</FormLabel><FormTextArea value={selectedNpc.description} onChange={e => handleUpdateInitialNpc(selectedNpc.id, 'description', e.target.value)} /></div>
                        <div><FormLabel>Tính cách</FormLabel><FormTextArea value={selectedNpc.personality} onChange={e => handleUpdateInitialNpc(selectedNpc.id, 'personality', e.target.value)} /></div>

                        <DetailSection title="Tu Luyện & Sức Mạnh">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><FormLabel>Cấp độ</FormLabel><FormInput type="number" value={selectedNpc.level} onChange={e => handleUpdateInitialNpc(selectedNpc.id, 'level', parseInt(e.target.value, 10) || 1)} /></div>
                                <div><FormLabel>Hệ thống tu luyện</FormLabel><FormSelect value={selectedNpc.powerSystem} onChange={e => handleUpdateInitialNpc(selectedNpc.id, 'powerSystem', e.target.value)}>{worldSettings.powerSystems.map(ps => <option key={ps.id} value={ps.name}>{ps.name}</option>)}</FormSelect></div>
                                <div><FormLabel>Tư Chất</FormLabel><FormSelect value={selectedNpc.aptitude} onChange={e => handleUpdateInitialNpc(selectedNpc.id, 'aptitude', e.target.value)}>{worldSettings.aptitudeTiers.split(' - ').map(q => q.trim()).filter(Boolean).map(tier => (<option key={tier} value={tier}>{tier}</option>))}</FormSelect></div>
                                <div><FormLabel>Vị trí</FormLabel><FormSelect value={selectedNpc.locationId || ''} onChange={e => handleUpdateInitialNpc(selectedNpc.id, 'locationId', e.target.value)}><option value="">-- Chọn vị trí --</option>{(profile.initialLocations || []).filter(loc => loc.name).map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}</FormSelect></div>
                            </div>
                        </DetailSection>

                        <DetailSection title="Mị Lực (Vẻ Đẹp)">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div><FormLabel>Vóc Dáng (/25)</FormLabel><FormInput type="number" value={selectedNpc.mienLuc?.body || 0} onChange={e => handleUpdateInitialNpc(selectedNpc.id, 'mienLuc.body', parseInt(e.target.value, 10) || 0)} /></div>
                                <div><FormLabel>Khuôn Mặt (/30)</FormLabel><FormInput type="number" value={selectedNpc.mienLuc?.face || 0} onChange={e => handleUpdateInitialNpc(selectedNpc.id, 'mienLuc.face', parseInt(e.target.value, 10) || 0)} /></div>
                                <div><FormLabel>Khí Chất (/25)</FormLabel><FormInput type="number" value={selectedNpc.mienLuc?.aura || 0} onChange={e => handleUpdateInitialNpc(selectedNpc.id, 'mienLuc.aura', parseInt(e.target.value, 10) || 0)} /></div>
                                <div><FormLabel>Tu Vi (/25)</FormLabel><FormInput type="number" value={selectedNpc.mienLuc?.power || 0} onChange={e => handleUpdateInitialNpc(selectedNpc.id, 'mienLuc.power', parseInt(e.target.value, 10) || 0)} /></div>
                            </div>
                        </DetailSection>

                        <DetailSection title="Đặc Điểm Bẩm Sinh">
                            <div><FormLabel>Thể Chất Đặc Biệt (Tên)</FormLabel><FormInput value={selectedNpc.specialConstitution?.name || ''} onChange={e => handleUpdateInitialNpc(selectedNpc.id, 'specialConstitution.name', e.target.value)} /></div>
                            <div><FormLabel>Thể Chất Đặc Biệt (Mô tả)</FormLabel><FormTextArea value={selectedNpc.specialConstitution?.description || ''} onChange={e => handleUpdateInitialNpc(selectedNpc.id, 'specialConstitution.description', e.target.value)} /></div>
                            <div><FormLabel>Thiên Phú (Tên)</FormLabel><FormInput value={selectedNpc.innateTalent?.name || ''} onChange={e => handleUpdateInitialNpc(selectedNpc.id, 'innateTalent.name', e.target.value)} /></div>
                            <div><FormLabel>Thiên Phú (Mô tả)</FormLabel><FormTextArea value={selectedNpc.innateTalent?.description || ''} onChange={e => handleUpdateInitialNpc(selectedNpc.id, 'innateTalent.description', e.target.value)} /></div>
                        </DetailSection>

                        <DetailSection title="Mối Quan Hệ Ban Đầu">
                            <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 pr-2">
                                {initialNpcs.filter(npc => npc.id !== selectedNpcId).map(otherNpc => {
                                    const relationship = selectedNpc.npcRelationships?.find(r => r.targetNpcId === otherNpc.id);
                                    return (
                                        <div key={otherNpc.id} className="flex items-center gap-4">
                                            <FormLabel htmlFor={`rel-${otherNpc.id}`}><span className="flex-grow">{otherNpc.name}</span></FormLabel>
                                            <FormInput 
                                                id={`rel-${otherNpc.id}`}
                                                type="number" 
                                                value={relationship?.value || ''}
                                                onChange={e => handleRelationshipChange(otherNpc.id, e.target.value)}
                                                className="w-24"
                                                placeholder="0"
                                                min="-1000" max="1000"
                                            />
                                        </div>
                                    );
                                })}
                                 {initialNpcs.length <= 1 && <p className="text-sm text-slate-500 text-center">Cần ít nhất 2 NPC để thiết lập mối quan hệ.</p>}
                            </div>
                        </DetailSection>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-500">
                        <p>Chọn một NPC từ danh sách hoặc thêm NPC mới.</p>
                    </div>
                )}
            </div>
        </div>
    );
};