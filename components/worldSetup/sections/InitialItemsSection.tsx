
import React from 'react';
import { CharacterProfile, WorldSettings, Item, ItemType, EquipmentType, EquipmentStat, Skill, SkillType } from '../../../types';
import { FormInput, FormSelect, FormTextArea, FormLabel } from '../common';
import { GAME_CONFIG } from '../../../config/gameConfig';
import { calculateManaCost } from '../../../services/progressionService';

const GrantedSkillEditor: React.FC<{
    skill: Partial<Skill>;
    worldSettings: WorldSettings;
    onUpdate: (field: keyof Skill, value: any) => void;
}> = ({ skill, worldSettings, onUpdate }) => {
    const levelsPerRealm = GAME_CONFIG.progression.subRealmLevels.length;
    const manaCost = skill.name && skill.quality ? calculateManaCost({
        quality: skill.quality,
        level: skill.level || 1,
        type: skill.type || SkillType.ATTACK
    }, worldSettings.qualityTiers) : 0;

    return (
        <div className="border-t border-amber-500/30 pt-4 space-y-4">
            <h4 className="text-md font-semibold text-amber-200">Kỹ Năng Ban Tặng</h4>
            <div><FormLabel>Tên Kỹ Năng</FormLabel><FormInput value={skill.name || ''} onChange={e => onUpdate('name', e.target.value)} /></div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><FormLabel>Loại</FormLabel><FormSelect value={skill.type || SkillType.ATTACK} onChange={e => onUpdate('type', e.target.value as SkillType)}>{Object.values(SkillType).map(t => <option key={t} value={t}>{t}</option>)}</FormSelect></div>
                <div><FormLabel>Phẩm chất</FormLabel><FormSelect value={skill.quality || ''} onChange={e => onUpdate('quality', e.target.value)}>{worldSettings.qualityTiers.split(' - ').map(q => q.trim()).filter(Boolean).map(tier => (<option key={tier} value={tier}>{tier}</option>))}</FormSelect></div>
                <div><FormLabel>Cấp</FormLabel><FormSelect value={skill.level || 1} onChange={e => onUpdate('level', parseInt(e.target.value, 10))}>{Array.from({ length: levelsPerRealm }, (_, i) => i + 1).map(level => <option key={level} value={level}>{level}</option>)}</FormSelect></div>
                 <div><FormLabel>Tiêu hao Linh Lực</FormLabel><FormInput value={manaCost} disabled /></div>
            </div>
            <div><FormLabel>Mô tả Kỹ Năng</FormLabel><FormTextArea value={skill.description || ''} onChange={e => onUpdate('description', e.target.value)} /></div>
            <div><FormLabel>Hiệu ứng</FormLabel><FormTextArea value={skill.effect || ''} onChange={e => onUpdate('effect', e.target.value)} placeholder="Mô tả hiệu ứng kỹ năng, vd: Gây 50 sát thương Lôi..." /></div>
        </div>
    );
};


interface InitialItemsSectionProps {
    profile: CharacterProfile;
    worldSettings: WorldSettings;
    setProfile: React.Dispatch<React.SetStateAction<CharacterProfile>>;
}

export const InitialItemsSection: React.FC<InitialItemsSectionProps> = ({ profile, worldSettings, setProfile }) => {
    const availableStats: Array<EquipmentStat['key']> = ['attack', 'maxHealth', 'maxMana'];
    const statTranslations: Record<EquipmentStat['key'], string> = {
        attack: 'Tấn Công',
        maxHealth: 'Sinh Lực Tối Đa',
        maxMana: 'Linh Lực Tối Đa',
    };

    const handleAddInitialItem = () => {
        const newItem: Item = {
            id: `item_initial_${Date.now()}`,
            name: '',
            description: '',
            type: ItemType.KHAC,
            quality: worldSettings.qualityTiers.split(' - ')[0]?.trim() || 'Phàm Phẩm',
            quantity: 1,
            value: 0
        };
        setProfile(prev => ({
            ...prev,
            initialItems: [...(prev.initialItems || []), newItem]
        }));
    };

    const handleRemoveInitialItem = (id: string) => {
        setProfile(prev => ({
            ...prev,
            initialItems: (prev.initialItems || []).filter(item => item.id !== id)
        }));
    };

    const handleUpdateInitialItem = (id: string, field: keyof Item, value: any) => {
        setProfile(prev => ({
            ...prev,
            initialItems: (prev.initialItems || []).map(item => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };
                    // Handle special logic for item type changes
                    if (field === 'type') {
                        if ((value === ItemType.TRANG_BI || value === ItemType.DAC_THU) && !updatedItem.equipmentDetails) {
                            updatedItem.equipmentDetails = { type: EquipmentType.VU_KHI, stats: [], effect: '' };
                        } else if (value !== ItemType.TRANG_BI && value !== ItemType.DAC_THU) {
                            delete updatedItem.equipmentDetails;
                        }

                        if (value === ItemType.BI_KIP && !updatedItem.grantsSkill) {
                            updatedItem.grantsSkill = { name: '', type: SkillType.ATTACK, quality: worldSettings.qualityTiers.split(' - ')[0]?.trim() || 'Phàm Phẩm', level: 1, description: '', effect: '', manaCost: 0 };
                        } else if (value !== ItemType.BI_KIP) {
                            delete updatedItem.grantsSkill;
                        }
                    }
                    return updatedItem;
                }
                return item;
            })
        }));
    };

    const handleUpdateEquipmentDetail = (itemId: string, field: keyof NonNullable<Item['equipmentDetails']>, value: any) => {
        setProfile(prev => ({
            ...prev,
            initialItems: (prev.initialItems || []).map(item => {
                if (item.id === itemId && item.equipmentDetails) {
                    return { ...item, equipmentDetails: { ...item.equipmentDetails, [field]: value } };
                }
                return item;
            })
        }));
    };

    const handleUpdateGrantedSkill = (itemId: string, field: keyof Skill, value: any) => {
        setProfile(prev => ({
            ...prev,
            initialItems: (prev.initialItems || []).map(item => {
                if (item.id === itemId && item.grantsSkill) {
                    return { ...item, grantsSkill: { ...item.grantsSkill, [field]: value } };
                }
                return item;
            })
        }));
    };

    const handleAddEquipmentStat = (itemId: string) => {
        setProfile(prev => ({
            ...prev,
            initialItems: (prev.initialItems || []).map(item => {
                if (item.id === itemId && item.equipmentDetails) {
                    const usedStats = item.equipmentDetails.stats.map(s => s.key);
                    const firstAvailableStat = availableStats.find(s => !usedStats.includes(s));
                    
                    if (firstAvailableStat) {
                        const newStat: EquipmentStat = { key: firstAvailableStat, value: 0 };
                        return { ...item, equipmentDetails: { ...item.equipmentDetails, stats: [...item.equipmentDetails.stats, newStat] } };
                    }
                }
                return item;
            })
        }));
    };

    const handleRemoveEquipmentStat = (itemId: string, statIndex: number) => {
        setProfile(prev => ({
            ...prev,
            initialItems: (prev.initialItems || []).map(item => {
                if (item.id === itemId && item.equipmentDetails) {
                    return { ...item, equipmentDetails: { ...item.equipmentDetails, stats: item.equipmentDetails.stats.filter((_, i) => i !== statIndex) } };
                }
                return item;
            })
        }));
    };

    const handleUpdateEquipmentStat = (itemId: string, statIndex: number, field: 'key' | 'value', value: any) => {
        setProfile(prev => ({
            ...prev,
            initialItems: (prev.initialItems || []).map(item => {
                if (item.id === itemId && item.equipmentDetails) {
                    const newStats = [...item.equipmentDetails.stats];
                    newStats[statIndex] = { ...newStats[statIndex], [field]: value };
                    return { ...item, equipmentDetails: { ...item.equipmentDetails, stats: newStats } };
                }
                return item;
            })
        }));
    };

    return (
        <div className="space-y-4">
            {(profile.initialItems || []).map((item, index) => (
                <div key={item.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-amber-300">Vật Phẩm {index + 1}</h3>
                        <button type="button" onClick={() => handleRemoveInitialItem(item.id)} className="px-3 py-1 bg-red-800 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors">Xóa Vật Phẩm</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><FormLabel>Tên Vật Phẩm</FormLabel><FormInput value={item.name} onChange={e => handleUpdateInitialItem(item.id, 'name', e.target.value)} /></div>
                        <div><FormLabel>Số lượng</FormLabel><FormInput type="number" value={item.quantity} onChange={e => handleUpdateInitialItem(item.id, 'quantity', parseInt(e.target.value, 10) || 1)} /></div>
                        <div><FormLabel>Loại</FormLabel><FormSelect value={item.type} onChange={e => handleUpdateInitialItem(item.id, 'type', e.target.value as ItemType)}>{Object.values(ItemType).map(t => <option key={t} value={t}>{t}</option>)}</FormSelect></div>
                        <div><FormLabel>Phẩm chất</FormLabel><FormSelect value={item.quality} onChange={e => handleUpdateInitialItem(item.id, 'quality', e.target.value)}>{worldSettings.qualityTiers.split(' - ').map(q => q.trim()).filter(Boolean).map(tier => (<option key={tier} value={tier}>{tier}</option>))}</FormSelect></div>
                    </div>
                    <div><FormLabel>Mô tả</FormLabel><FormTextArea value={item.description} onChange={e => handleUpdateInitialItem(item.id, 'description', e.target.value)} /></div>
                    <div><FormLabel>Giá trị tham khảo</FormLabel><FormInput type="number" value={item.value || 0} onChange={e => handleUpdateInitialItem(item.id, 'value', parseInt(e.target.value, 10) || 0)} /></div>
                    
                    {(item.type === ItemType.TRANG_BI || item.type === ItemType.DAC_THU) && item.equipmentDetails && (
                        <div className="border-t border-amber-500/30 pt-4 space-y-4">
                            <h4 className="text-md font-semibold text-amber-200">Thuộc tính Trang Bị</h4>
                            <div><FormLabel>Loại trang bị</FormLabel><FormSelect value={item.equipmentDetails?.type || ''} onChange={e => handleUpdateEquipmentDetail(item.id, 'type', e.target.value)}>{Object.values(EquipmentType).map(t => <option key={t} value={t}>{t}</option>)}</FormSelect></div>
                            <div>
                                <FormLabel>Chỉ số cộng thêm</FormLabel>
                                <div className="space-y-2">
                                    {(item.equipmentDetails?.stats || []).map((stat, statIndex) => {
                                        const usedStats = (item.equipmentDetails?.stats || []).map(s => s.key);
                                        const availableOptionsForStat = availableStats.filter(s => s === stat.key || !usedStats.includes(s));
                                        
                                        return (
                                            <div key={statIndex} className="flex items-center gap-2">
                                                <FormSelect value={stat.key} onChange={e => handleUpdateEquipmentStat(item.id, statIndex, 'key', e.target.value as EquipmentStat['key'])} className="w-1/2">
                                                    {availableOptionsForStat.map(s => <option key={s} value={s}>{statTranslations[s]}</option>)}
                                                </FormSelect>
                                                <FormInput type="number" value={stat.value} onChange={e => handleUpdateEquipmentStat(item.id, statIndex, 'value', parseInt(e.target.value, 10) || 0)} className="w-1/2" />
                                                <button type="button" onClick={() => handleRemoveEquipmentStat(item.id, statIndex)} className="text-red-500 hover:text-red-400 font-bold text-lg px-2 flex-shrink-0">&times;</button>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleAddEquipmentStat(item.id)}
                                    disabled={(item.equipmentDetails?.stats || []).length >= availableStats.length}
                                    className="mt-2 text-sm text-amber-300 hover:text-amber-200 disabled:text-slate-500 disabled:cursor-not-allowed"
                                >
                                    + Thêm chỉ số
                                </button>
                            </div>
                            <div><FormLabel>Hiệu ứng khi trang bị</FormLabel><FormTextArea value={item.equipmentDetails?.effect || ''} onChange={e => handleUpdateEquipmentDetail(item.id, 'effect', e.target.value)} /></div>
                        </div>
                    )}
                    
                    {item.type === ItemType.BI_KIP && item.grantsSkill && (
                        <GrantedSkillEditor 
                            skill={item.grantsSkill}
                            worldSettings={worldSettings}
                            onUpdate={(field, value) => handleUpdateGrantedSkill(item.id, field, value)}
                        />
                    )}
                </div>
            ))}
            <button type="button" onClick={handleAddInitialItem} className="w-full mt-4 py-2 px-4 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-amber-300 hover:border-amber-400 transition-all">
                + Thêm Vật Phẩm
            </button>
        </div>
    );
};
