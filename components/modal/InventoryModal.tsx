
import React, { useState, useMemo, useEffect } from 'react';
import { CharacterProfile, Item, ItemType, EquipmentSlot, EquipmentType, EquipmentStat } from '../../types';
import { recalculateDerivedStats } from '../../services/progressionService';

interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: CharacterProfile;
    onUpdateProfile: (newProfile: CharacterProfile) => void;
    onUseItem: (item: Item) => void;
}

const itemTypeFilters = ['Tất cả', ...Object.values(ItemType)];

const equipmentSlotLayout: { slot: EquipmentSlot, gridArea: string, name: string }[] = [
    { slot: EquipmentSlot.HELMET, gridArea: 'helmet', name: 'Nón' },
    { slot: EquipmentSlot.WEAPON_1, gridArea: 'weapon1', name: 'Vũ Khí 1' },
    { slot: EquipmentSlot.ARMOR, gridArea: 'armor', name: 'Áo' },
    { slot: EquipmentSlot.WEAPON_2, gridArea: 'weapon2', name: 'Vũ Khí 2' },
    { slot: EquipmentSlot.BOOTS, gridArea: 'boots', name: 'Giày' },
    { slot: EquipmentSlot.ACCESSORY_1, gridArea: 'acc1', name: 'Phụ Kiện 1' },
    { slot: EquipmentSlot.ACCESSORY_2, gridArea: 'acc2', name: 'Phụ Kiện 2' },
    { slot: EquipmentSlot.ACCESSORY_3, gridArea: 'acc3', name: 'Phụ Kiện 3' },
    { slot: EquipmentSlot.ACCESSORY_4, gridArea: 'acc4', name: 'Phụ Kiện 4' },
    { slot: EquipmentSlot.COMMON_1, gridArea: 'com1', name: 'Thông Dụng 1' },
    { slot: EquipmentSlot.COMMON_2, gridArea: 'com2', name: 'Thông Dụng 2' },
];

const equipmentTypeToSlots: Record<EquipmentType, EquipmentSlot[]> = {
    [EquipmentType.VU_KHI]: [EquipmentSlot.WEAPON_1, EquipmentSlot.WEAPON_2],
    [EquipmentType.NON]: [EquipmentSlot.HELMET],
    [EquipmentType.AO]: [EquipmentSlot.ARMOR],
    [EquipmentType.GIAY]: [EquipmentSlot.BOOTS],
    [EquipmentType.PHU_KIEN]: [EquipmentSlot.ACCESSORY_1, EquipmentSlot.ACCESSORY_2, EquipmentSlot.ACCESSORY_3, EquipmentSlot.ACCESSORY_4],
    [EquipmentType.THONG_DUNG]: [EquipmentSlot.COMMON_1, EquipmentSlot.COMMON_2]
};

const NewBadge = () => <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold text-slate-900 bg-yellow-300 rounded-full">NEW</span>;

const EquipmentSlotDisplay: React.FC<{
    slot: EquipmentSlot,
    name: string,
    gridArea: string,
    item: Item | undefined,
    onClick: () => void,
    isSelected: boolean
}> = ({ slot, name, gridArea, item, onClick, isSelected }) => {
    
    return (
        <button 
            style={{ gridArea }}
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 min-w-0 ${isSelected ? 'bg-amber-600/30 border-amber-400' : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'}`}
        >
            {item ? (
                <>
                    <span className="font-semibold text-amber-300 text-sm truncate w-full text-center flex items-center justify-center">
                        {item.name}
                        {item.isNew && <NewBadge />}
                    </span>
                    <span className="text-xs text-slate-400">{item.quality}</span>
                </>
            ) : (
                <span className="text-slate-500 text-xs">{name}</span>
            )}
        </button>
    );
};

const statTranslations: Record<EquipmentStat['key'], string> = {
    attack: 'Tấn Công',
    maxHealth: 'Sinh Lực Tối Đa',
    maxMana: 'Linh Lực Tối Đa',
};

export const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, profile, onUpdateProfile, onUseItem }) => {
    const [itemTypeFilter, setItemTypeFilter] = useState('Tất cả');
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setItemTypeFilter('Tất cả');
            setSelectedItemId(null);
        }
    }, [isOpen]);
    
    const selectedItem = useMemo(() => profile.items.find(i => i.id === selectedItemId), [profile.items, selectedItemId]);
    const isSelectedItemEquipped = selectedItem?.isEquipped || false;

    const itemsByType = useMemo(() => {
        const unequipped = profile.items.filter(i => !i.isEquipped);
        if (itemTypeFilter === 'Tất cả') return unequipped;
        return unequipped.filter(item => item.type === itemTypeFilter);
    }, [profile.items, itemTypeFilter]);

    const handleEquipItem = (itemToEquip: Item, slot: EquipmentSlot) => {
        if (!itemToEquip.equipmentDetails) return;

        let newProfile = { ...profile };
        const currentItemIdInSlot = newProfile.equipment[slot];
        
        // Unequip current item in target slot
        if (currentItemIdInSlot) {
            newProfile.items = newProfile.items.map(i =>
                i.id === currentItemIdInSlot ? { ...i, isEquipped: false } : i
            );
        }
        
        // Remove item from any other slot it might be in
        const newEquipment = { ...newProfile.equipment };
        for (const s in newEquipment) {
            if (newEquipment[s as EquipmentSlot] === itemToEquip.id) {
                delete newEquipment[s as EquipmentSlot];
            }
        }

        newEquipment[slot] = itemToEquip.id;
        newProfile.equipment = newEquipment;
        
        newProfile.items = newProfile.items.map(i =>
            i.id === itemToEquip.id ? { ...i, isEquipped: true } : i
        );

        const finalProfile = recalculateDerivedStats(newProfile);
        onUpdateProfile(finalProfile);
        setSelectedItemId(itemToEquip.id);
    };

    const handleUnequip = (itemToUnequip: Item) => {
        const slot = Object.entries(profile.equipment).find(([, itemId]) => itemId === itemToUnequip.id)?.[0];
        if (!slot) return;
        
        let newProfile = { ...profile };
        const newEquipment = { ...newProfile.equipment };
        delete newEquipment[slot as EquipmentSlot];
        newProfile.equipment = newEquipment;
        
        newProfile.items = newProfile.items.map(i => i.id === itemToUnequip.id ? { ...i, isEquipped: false } : i);
        
        const finalProfile = recalculateDerivedStats(newProfile);
        onUpdateProfile(finalProfile);
        setSelectedItemId(itemToUnequip.id);
    };

    const handleUse = (item: Item) => {
        onUseItem(item);
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-6xl m-4 flex flex-col max-h-[90vh] h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-shrink-0 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-amber-300">Túi Đồ & Trang Bị</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Đóng">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="flex-grow flex flex-col lg:flex-row p-4 gap-4 overflow-hidden">
                    {/* Left Panel: Equipment */}
                    <div className="w-full lg:w-2/5 h-2/5 lg:h-full flex-shrink-0">
                        <div 
                            className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 grid gap-3 h-full"
                            style={{
                                gridTemplateAreas: `
                                    ". helmet ."
                                    "weapon1 armor weapon2"
                                    ". boots ."
                                    "acc1 acc2 acc3"
                                    "acc4 com1 com2"
                                `,
                                gridTemplateRows: 'repeat(5, 1fr)',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                            }}
                        >
                           {equipmentSlotLayout.map(({ slot, gridArea, name }) => {
                                const item = profile.items.find(i => i.id === profile.equipment[slot]);
                                return (
                                    <EquipmentSlotDisplay
                                        key={slot}
                                        slot={slot}
                                        name={name}
                                        gridArea={gridArea}
                                        item={item}
                                        onClick={() => setSelectedItemId(item?.id || null)}
                                        isSelected={selectedItem?.id === item?.id}
                                    />
                                );
                           })}
                        </div>
                    </div>

                    {/* Right Panel: Bag & Details */}
                    <div className="w-full lg:w-3/5 h-3/5 lg:h-full flex-shrink-0 flex flex-col gap-4">
                        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 flex flex-col flex-1 min-h-0">
                            <div className="flex-shrink-0 p-2 border-b border-slate-700/50 flex flex-wrap gap-1">
                                {itemTypeFilters.map(type => (
                                    <button 
                                        key={type} 
                                        onClick={() => setItemTypeFilter(type)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${itemTypeFilter === type ? 'bg-amber-600/80 text-white' : 'bg-slate-700/50 hover:bg-slate-700'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                            <div className="flex-grow p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50 flex flex-col gap-1">
                               {itemsByType.map(item => (
                                    <button 
                                        key={item.id}
                                        onClick={() => setSelectedItemId(item.id)}
                                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-left border-2 transition-colors ${selectedItemId === item.id ? 'bg-amber-600/20 border-amber-500' : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'}`}
                                    >
                                        <div className="flex-grow min-w-0">
                                            <p className="font-semibold text-slate-200 text-sm truncate flex items-center">
                                                {item.name}
                                                {item.isNew && <NewBadge />}
                                            </p>
                                            <p className="text-xs text-slate-400">{item.type}</p>
                                        </div>
                                        {item.quantity > 1 && (
                                            <span className="flex-shrink-0 text-xs font-semibold text-slate-300 bg-slate-700 px-2 py-0.5 rounded-full">
                                                x{item.quantity}
                                            </span>
                                        )}
                                    </button>
                               ))}
                               {itemsByType.length === 0 && <p className="text-slate-500 text-center self-center pt-10">Trống</p>}
                            </div>
                        </div>

                        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 flex flex-col flex-1 min-h-0 p-4">
                            {selectedItem ? (
                                <div className="flex flex-col h-full animate-fade-in">
                                    <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50 pr-2 -mr-2 space-y-3">
                                        <h3 className="text-xl font-bold text-amber-300 flex items-center">
                                            {selectedItem.name}
                                            {selectedItem.isNew && <NewBadge />}
                                        </h3>
                                        <div className="flex items-baseline space-x-4 text-sm text-slate-400 border-b border-slate-700/50 pb-3">
                                            <span>Phẩm chất: <span className="font-semibold text-slate-200">{selectedItem.quality}</span></span>
                                            <span>Loại: <span className="font-semibold text-slate-200">{selectedItem.equipmentDetails?.type || selectedItem.type}</span></span>
                                        </div>
                                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{selectedItem.description}</p>
                                        {selectedItem.equipmentDetails && (
                                            <div className="border-t border-slate-700 pt-3 space-y-1">
                                                {selectedItem.equipmentDetails.stats.map((stat, i) => (
                                                    <p key={i} className="text-sm text-green-400 font-semibold">{(statTranslations as any)[stat.key] || stat.key}: +{stat.value.toLocaleString()}</p>
                                                ))}
                                                {selectedItem.equipmentDetails.effect && (
                                                     <p className="text-sm text-cyan-300"><span className="font-bold">Hiệu ứng:</span> {selectedItem.equipmentDetails.effect}</p>
                                                )}
                                            </div>
                                        )}
                                        {selectedItem.effectsDescription && (
                                            <div className="border-t border-slate-700 pt-3 space-y-1">
                                                <p className="text-sm text-cyan-300"><span className="font-bold">Hiệu ứng:</span> {selectedItem.effectsDescription}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-shrink-0 pt-4 border-t border-slate-700 space-y-2">
                                        {isSelectedItemEquipped && (
                                             <button onClick={() => handleUnequip(selectedItem)} className="w-full py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors text-sm">Gỡ Trang Bị</button>
                                        )}
                                        {(!isSelectedItemEquipped && selectedItem.equipmentDetails) && (
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-bold text-center text-slate-300">Trang bị vào ô:</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {(equipmentTypeToSlots[selectedItem.equipmentDetails.type] || []).map(slot => (
                                                        <button 
                                                            key={slot}
                                                            onClick={() => handleEquipItem(selectedItem, slot)} 
                                                            className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors text-sm"
                                                        >
                                                           {equipmentSlotLayout.find(s => s.slot === slot)?.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {selectedItem.type === ItemType.DUOC_PHAM && (
                                            <button onClick={() => handleUse(selectedItem)} className="w-full py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors text-sm">Sử Dụng</button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500">Chọn một vật phẩm để xem chi tiết</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
