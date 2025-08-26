import React, { useState, useMemo } from 'react';
import { CharacterProfile, Choice, ItemType } from '../../../types';

interface CreationTabProps {
    profile: CharacterProfile;
    onAction: (choice: Choice) => void;
    onClose: () => void;
}

export const CreationTab: React.FC<CreationTabProps> = ({ profile, onAction, onClose }) => {
    const [creationType, setCreationType] = useState<'item' | 'npc' | 'world'>('item');
    const [description, setDescription] = useState('');
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

    const unequippedItems = useMemo(() => profile.items.filter(item => !item.isEquipped && item.type === ItemType.NGUYEN_LIEU), [profile.items]);

    const handleMaterialToggle = (itemId: string) => {
        setSelectedMaterials(prev => 
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    const handleSubmit = () => {
        if (!description.trim()) {
            alert('Vui lòng nhập mô tả thứ bạn muốn tạo.');
            return;
        }

        let actionTitle = '';
        switch(creationType) {
            case 'npc':
                actionTitle = `Sử dụng năng lực Sáng Thế, ${profile.name} cố gắng tạo ra một sinh mệnh mới với mô tả: "${description.trim()}"`;
                break;
            case 'world':
                actionTitle = `Sử dụng năng lực Sáng Thế, ${profile.name} tập trung sức mạnh để cố gắng tạo ra một thế giới mới với mô tả: "${description.trim()}"`;
                break;
            case 'item':
            default:
                actionTitle = `Sử dụng năng lực Sáng Thế, ${profile.name} cố gắng tạo ra một vật phẩm: "${description.trim()}"`;
        }


        if (selectedMaterials.length > 0) {
            const materialNames = selectedMaterials.map(id => {
                const item = profile.items.find(i => i.id === id);
                return item ? item.name : 'vật phẩm không rõ';
            });
            actionTitle += ` bằng cách sử dụng ${materialNames.join(', ')} làm nguyên liệu.`;
        } else {
            actionTitle += ` từ hư vô.`;
        }

        const creationChoice: Choice = {
            title: actionTitle,
            benefit: 'Nhận được sản phẩm sáng tạo.',
            risk: 'Có thể thất bại, mất nguyên liệu hoặc tạo ra sản phẩm không mong muốn.',
            successChance: 75,
            durationInMinutes: 60,
        };

        onAction(creationChoice);
        onClose();
    };
    
    const placeholderText = useMemo(() => ({
        item: "Ví dụ: Một thanh trường kiếm phát ra hàn khí, một viên đan dược chữa lành mọi vết thương...",
        npc: "Ví dụ: Một nữ kiếm linh lạnh lùng, trung thành tuyệt đối. Một tiểu yêu hồ ly tinh nghịch, có khả năng tìm kiếm thảo dược.",
        world: "Ví dụ: Một bí cảnh chứa đầy linh khí thuần khiết, phù hợp cho việc tu luyện. Một tiểu thế giới bỏ túi dùng để lưu trữ vật phẩm."
    }), []);

    const buttonText = useMemo(() => ({
        item: "Tạo Vật Phẩm",
        npc: "Tạo Sinh Mệnh",
        world: "Tạo Thế Giới"
    }), []);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-amber-300 border-b border-slate-700 pb-2 mb-4">Sáng Tạo</h3>
                <p className="text-sm text-slate-400 mb-4">Sử dụng năng lực 'Sáng Thế Tuyệt Đối' để tạo ra vật phẩm, sinh mệnh, hoặc thậm chí là cả một thế giới mới.</p>
                
                 <div className="flex justify-center gap-2 p-1 bg-slate-900/50 rounded-lg mb-4">
                    {(['item', 'npc', 'world'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setCreationType(type)}
                            className={`w-full py-2 px-3 rounded-md text-sm font-semibold transition-colors ${creationType === type ? 'bg-amber-600 text-slate-900' : 'hover:bg-slate-700/50'}`}
                        >
                            {type === 'item' ? 'Vật Phẩm' : type === 'npc' ? 'Sinh Mệnh' : 'Thế Giới'}
                        </button>
                    ))}
                </div>

                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={placeholderText[creationType]}
                    rows={4}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-slate-200 resize-y"
                />
            </div>
            <div>
                <h4 className="font-semibold text-slate-200 mb-2">Chọn Nguyên Liệu (Tùy chọn)</h4>
                <div className="max-h-48 overflow-y-auto space-y-2 p-2 bg-slate-900/50 rounded-lg border border-slate-700 custom-scrollbar">
                    {unequippedItems.length > 0 ? (
                        unequippedItems.map(item => (
                            <label key={item.id} className="flex items-center p-2 rounded-md hover:bg-slate-700/50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={selectedMaterials.includes(item.id)}
                                    onChange={() => handleMaterialToggle(item.id)}
                                    className="h-4 w-4 rounded text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500"
                                />
                                <span className="ml-3 text-slate-300">{item.name} <span className="text-slate-500 text-xs">(x{item.quantity})</span></span>
                            </label>
                        ))
                    ) : (
                        <p className="text-slate-500 text-center p-4">Không có nguyên liệu nào trong túi đồ.</p>
                    )}
                </div>
            </div>
            <button
                onClick={handleSubmit}
                disabled={!description.trim()}
                className="w-full py-3 bg-amber-600 text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50"
            >
                {buttonText[creationType]}
            </button>
        </div>
    );
};