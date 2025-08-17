
import React, { useState, useEffect, useMemo } from 'react';
import { CharacterProfile, StatusEffect, Skill, NPC, WorldSettings, CharacterGender, Location, Choice, ItemType, Achievement, Milestone } from '../../types';
import { getExperienceForNextLevel, getSkillExperienceForNextLevel } from '../../services/progressionService';
import { ImageLibraryModal } from './ImageLibraryModal';
import { getRelationshipDisplay } from '../../utils/uiHelpers';

interface PlayerInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: CharacterProfile;
    npcs: NPC[];
    onUpdateProfile: (newProfile: CharacterProfile) => void;
    worldSettings: WorldSettings; 
    onAction: (choice: Choice) => void;
}

const NewBadge = () => <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold text-slate-900 bg-yellow-300 rounded-full">NEW</span>;

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

const AccordionItem = ({ title, name, description }: { title: string, name: string, description: string }) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasContent = (name && name.toLowerCase() !== 'null') || (description && description.toLowerCase() !== 'null');

    return (
        <div className="border-t border-slate-700/50 pt-4">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex justify-between items-center text-left text-base font-semibold text-slate-200 hover:text-amber-300 transition-colors"
            >
                <span>{title}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                 <div className="mt-2 bg-slate-800/50 p-3 rounded-lg animate-fade-in">
                    {hasContent ? (
                        <>
                            {(name && name.toLowerCase() !== 'null') && <p className="text-amber-300 font-bold">{name}</p>}
                            {(description && description.toLowerCase() !== 'null') && <p className="text-slate-300 whitespace-pre-wrap mt-1 text-sm">{description}</p>}
                        </>
                    ) : (
                        <p className="text-slate-400 italic">Chưa rõ</p>
                    )}
                 </div>
            )}
        </div>
    );
};

const HealthBar = ({ value, maxValue }: { value: number; maxValue: number; }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-slate-300 font-medium">Sinh Lực</span>
                <span className="font-semibold text-red-400">{Math.round(value)} / {maxValue}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-red-600 to-red-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const ManaBar = ({ value, maxValue }: { value: number; maxValue: number; }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-slate-300 font-medium">Linh Lực</span>
                <span className="font-semibold text-blue-400">{Math.round(value)} / {maxValue}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const ExperienceBar = ({ value, level }: { value: number, level: number }) => {
    const requiredXp = getExperienceForNextLevel(level);
    const percentage = requiredXp > 0 ? (value / requiredXp) * 100 : 0;
    return (
        <div>
             <div className="flex justify-between items-baseline mb-1">
                <span className="text-slate-300 font-medium">Kinh Nghiệm</span>
                <span className="font-semibold text-green-400">{Math.round(value)} / {requiredXp} EXP</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const SkillExperienceBar = ({ value, level, quality, qualityTiersString }: { value: number; level: number; quality: string; qualityTiersString: string }) => {
    const requiredXp = getSkillExperienceForNextLevel(level, quality, qualityTiersString);
    const percentage = (level === 10 && value >= requiredXp) ? 100 : (requiredXp > 0 ? (value / requiredXp) * 100 : 0);
    const displayValue = Math.min(value, requiredXp);

    return (
        <div>
            <div className="flex justify-between items-baseline text-xs mb-1">
                <span className="text-slate-400 font-medium">Kinh Nghiệm Kỹ Năng</span>
                <span className="font-semibold text-amber-400">{Math.round(displayValue)} / {requiredXp} EXP</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-amber-600 to-yellow-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

type StatusEffectType = 'positive' | 'negative' | 'special';

const getStatusEffectType = (effect: StatusEffect): StatusEffectType => {
    const name = effect.name.toLowerCase();

    // Special keywords are very specific and take precedence
    const specialKeywords = ['trang bị:', 'huyết mạch', 'long phượng', 'khuyển nô', 'thân thể', 'sáng thế', 'bị khóa', 'bị thiến', 'mang thai'];
    if (specialKeywords.some(kw => name.includes(kw))) {
        return 'special';
    }

    // Negative keywords suggest a debuff
    const negativeKeywords = ['độc', 'suy yếu', 'giảm', 'trúng', 'thương', 'bỏng', 'tê liệt', 'choáng', 'hỗn loạn', 'mất', 'trừ', 'nguyền', 'trói', 'phế', 'trọng thương', 'suy nhược'];
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

const RulesEditor: React.FC<{ 
    location: Location; 
    onUpdateLocation: (location: Location) => void;
    title?: string;
}> = ({ location, onUpdateLocation, title }) => {
    const [newRule, setNewRule] = useState('');

    const handleAddRule = () => {
        if (newRule.trim()) {
            const updatedRules = [...(location.rules || []), newRule.trim()];
            onUpdateLocation({ ...location, rules: updatedRules });
            setNewRule('');
        }
    };

    const handleDeleteRule = (indexToDelete: number) => {
        const updatedRules = (location.rules || []).filter((_, index) => index !== indexToDelete);
        onUpdateLocation({ ...location, rules: updatedRules });
    };

    return (
        <div className="mt-4 border-t border-slate-700 pt-4 space-y-3">
            <h5 className="font-semibold text-amber-200">{title || 'Quản Lý Luật Lệ'}</h5>
            <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 pr-2">
                {(location.rules || []).length > 0 ? (
                    (location.rules || []).map((rule, index) => (
                        <div key={index} className="flex items-start justify-between p-2 bg-slate-800/50 rounded-md text-slate-300 text-sm">
                            <p className="flex-grow pr-2">&bull; {rule}</p>
                            <button onClick={() => handleDeleteRule(index)} className="flex-shrink-0 text-red-500 hover:text-red-400 font-bold text-lg transition-colors" aria-label={`Xóa quy tắc: ${rule}`}>&times;</button>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-500 text-center py-2 text-sm">Chưa có luật lệ nào được định nghĩa.</p>
                )}
            </div>
             <div className="flex gap-2">
                <input
                    type="text"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="Thêm luật lệ mới..."
                    className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-slate-200 text-sm"
                />
                <button onClick={handleAddRule} disabled={!newRule.trim()} className="px-4 bg-amber-600 text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors text-sm disabled:opacity-50">Thêm</button>
            </div>
        </div>
    );
};

const LocationAccordionItem = ({ location, onUpdateLocation }: { location: Location, onUpdateLocation: (location: Location) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="bg-slate-900/50 rounded-lg border border-slate-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left"
                aria-expanded={isOpen}
            >
                <p className="font-semibold text-slate-200">{location.name}</p>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-700/50 animate-fade-in">
                    <p className="text-sm text-slate-400 whitespace-pre-wrap mb-4">{location.description}</p>
                    <RulesEditor 
                        location={location} 
                        onUpdateLocation={onUpdateLocation}
                        title={`Luật Lệ cho '${location.name}'`}
                    />
                </div>
            )}
        </div>
    );
};

const getDefaultAvatar = (gender: CharacterGender) => {
    return gender === CharacterGender.MALE 
        ? 'https://i.imgur.com/9CXRf64.png' 
        : 'https://i.imgur.com/K8Z3w4q.png';
};

const CreationTab: React.FC<{
    profile: CharacterProfile;
    onAction: (choice: Choice) => void;
    onClose: () => void;
}> = ({ profile, onAction, onClose }) => {
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


export const PlayerInfoModal: React.FC<PlayerInfoModalProps> = ({ isOpen, onClose, profile, npcs, onUpdateProfile, worldSettings, onAction }) => {
    const [activeTab, setActiveTab] = useState('stats');
    const [localAvatarUrl, setLocalAvatarUrl] = useState(profile.avatarUrl || '');
    const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);

    const defaultAvatar = useMemo(() => getDefaultAvatar(profile.gender), [profile.gender]);
    const canCreate = useMemo(() => profile.skills.some(skill => skill.name === 'Sáng Thế Tuyệt Đối'), [profile.skills]);

    // On open, reset the tab to stats. This avoids resetting on profile updates.
    useEffect(() => {
        if (isOpen) {
            setActiveTab('stats');
        }
    }, [isOpen]);
    
    useEffect(() => {
        if (isOpen) {
            // When the modal opens or the avatar URL changes, update the local state for the input field.
            setLocalAvatarUrl(profile.avatarUrl || '');
        }
    }, [isOpen, profile.avatarUrl]);
    
    if (!isOpen) return null;

    const handleAvatarUrlUpdate = (url: string) => {
        setLocalAvatarUrl(url);
        onUpdateProfile({ ...profile, avatarUrl: url });
    };

    const handleAvatarBlur = () => {
        if (localAvatarUrl !== (profile.avatarUrl || '')) {
            handleAvatarUrlUpdate(localAvatarUrl);
        }
    };

    const handleUpdateLocation = (updatedLocation: Location) => {
        onUpdateProfile({
            ...profile,
            discoveredLocations: profile.discoveredLocations.map(loc =>
                loc.id === updatedLocation.id ? updatedLocation : loc
            )
        });
    };
    
    const renderInfoTab = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-amber-300 border-b border-slate-700 pb-2 mb-4">Thông Tin Chung</h3>
                <div className="space-y-4">
                    {profile.personality && (
                        <div>
                            <p className="font-semibold text-amber-300">Tính cách:</p>
                            <p className="text-slate-300 whitespace-pre-wrap">{profile.personality}</p>
                        </div>
                    )}
                    {profile.backstory && (
                         <div>
                            <p className="font-semibold text-amber-300">Tiểu sử:</p>
                            <p className="text-slate-300 whitespace-pre-wrap">{profile.backstory}</p>
                        </div>
                    )}
                    {profile.goal && (
                         <div>
                            <p className="font-semibold text-amber-300">Mục tiêu:</p>
                            <p className="text-slate-300 whitespace-pre-wrap">{profile.goal}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
    
     const renderStatsTab = () => (
        <div>
            <h3 className="text-xl font-bold text-amber-300 border-b border-slate-700 pb-2 mb-6">Chỉ Số Cơ Bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <HealthBar value={profile.health} maxValue={profile.maxHealth} /> 
                    <ManaBar value={profile.mana} maxValue={profile.maxMana} />
                    <ExperienceBar value={profile.experience} level={profile.level} />
                </div>
                <div className="space-y-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex flex-col justify-between">
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                            <span className="text-slate-300 font-medium">Cấp Độ</span>
                            <span className="font-semibold text-cyan-300">{profile.level}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-slate-300 font-medium flex-shrink-0 pr-4">Cảnh giới hiện tại</span>
                            <span className="font-semibold text-yellow-300 text-right">{profile.realm || "Phàm Nhân"}</span>
                        </div>
                        <div className="border-t border-slate-700/50 my-3"></div>
                         <div className="flex justify-between items-baseline">
                            <span className="text-slate-300 font-medium">Sức Tấn Công</span>
                            <span className="font-semibold text-orange-400">{profile.attack}</span>
                        </div>
                         <div className="flex justify-between items-baseline">
                            <span className="text-slate-300 font-medium">Thọ Nguyên</span>
                            <span className="font-semibold text-purple-300">{profile.lifespan.toLocaleString()} năm</span>
                        </div>
                    </div>
                    <div>
                         <span className="text-slate-300 font-medium">{profile.currencyName}</span>
                         <p className="font-semibold text-yellow-400 text-2xl mt-1">{profile.currencyAmount.toLocaleString()}</p>
                    </div>
                </div>
            </div>
             <div className="border-t border-slate-700/50 pt-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1: Status Effects */}
                    <div>
                        <h3 className="text-xl font-bold text-amber-300 pb-2 mb-2 border-b border-amber-500/20">
                            Trạng Thái ({profile.statusEffects.length})
                        </h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                            {profile.statusEffects.length > 0 ? (
                                profile.statusEffects.map((effect, index) => {
                                    const style = statusStyles[getStatusEffectType(effect)];
                                    return (
                                        <div key={index} className={`${style.bg} border ${style.border} rounded-lg p-3 animate-fade-in`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`font-bold text-sm ${style.text}`}>{effect.name}</h4>
                                                <span className="text-xs text-slate-400 flex-shrink-0 ml-4">{effect.duration}</span>
                                            </div>
                                            <p className="text-xs text-slate-300 whitespace-pre-wrap">{effect.description}</p>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-slate-500 text-center py-4 text-sm">Nhân vật không có trạng thái nào.</p>
                            )}
                        </div>
                    </div>

                    {/* Column 2: Achievements */}
                    <div>
                        <h3 className="text-xl font-bold text-purple-300 pb-2 mb-2 border-b border-purple-500/20">
                            Thành Tích ({(profile.achievements || []).length})
                        </h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                            {(profile.achievements || []).length > 0 ? (
                                (profile.achievements || []).map((achievement, index) => (
                                    <div key={index} className="bg-slate-900/40 border border-purple-500/30 rounded-lg p-3 animate-fade-in">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-sm text-purple-300 flex items-center">
                                                {achievement.name}
                                                {achievement.isNew && <NewBadge />}
                                            </h4>
                                            {achievement.tier && (
                                                <span className="text-xs text-slate-300 bg-purple-900/50 px-2 py-0.5 rounded-full flex-shrink-0 ml-4">{achievement.tier}</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-300 whitespace-pre-wrap">{achievement.description}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 text-center py-4 text-sm">Chưa đạt được thành tích nào.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSkillsTab = () => (
        <div className="space-y-4">
            {profile.skills.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-slate-500">Chưa học được kỹ năng nào.</p>
                </div>
            ) : (
                profile.skills.map((skill: Skill) => (
                    <div key={skill.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-3 animate-fade-in">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-amber-300 flex items-center">
                                {skill.name}
                                {skill.isNew && <NewBadge />}
                            </h3>
                            <span className="text-sm text-cyan-300 bg-cyan-900/50 px-2 py-1 rounded-md flex-shrink-0 ml-2">{skill.type}</span>
                        </div>
                        <div className="flex items-baseline space-x-4 text-sm text-slate-400 border-b border-slate-700/50 pb-3">
                            <span>Phẩm chất: <span className="font-semibold text-slate-200">{skill.quality}</span></span>
                            <span>Cấp: <span className="font-semibold text-slate-200">{skill.level} {skill.level === 10 ? '(Viên Mãn)' : ''}</span></span>
                        </div>

                        <SkillExperienceBar 
                            value={skill.experience} 
                            level={skill.level}
                            quality={skill.quality}
                            qualityTiersString={worldSettings.qualityTiers}
                        />

                        <div className="pt-2">
                            <h4 className="font-semibold text-slate-300 mb-1">Mô tả</h4>
                            <p className="text-sm text-slate-400 whitespace-pre-wrap">{skill.description}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-300 mb-1">Hiệu ứng</h4>
                            <p className="text-sm text-slate-400 whitespace-pre-wrap">{skill.effect}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
    
    const renderRelationshipsTab = () => (
        <div className="space-y-3">
             {npcs.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-slate-500">Chưa gặp gỡ nhân vật nào.</p>
                </div>
            ) : (
                npcs.map((npc) => {
                    const relationship = getRelationshipDisplay(npc.isDaoLu ? 1000 : npc.relationship);
                    const relationshipValue = npc.isDaoLu ? 1000 : (npc.relationship !== undefined ? npc.relationship : '???');
                    const defaultNpcAvatar = getDefaultAvatar(npc.gender);

                    return (
                        <div key={npc.id} className="flex items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                            <img 
                                src={npc.avatarUrl || defaultNpcAvatar}
                                alt={npc.name}
                                className="w-12 h-12 rounded-full object-cover mr-4"
                                onError={(e) => { e.currentTarget.src = defaultNpcAvatar; }}
                            />
                            <div className="flex-grow">
                                <p className="font-bold text-slate-200 flex items-center">
                                    {npc.name}
                                    {npc.isDaoLu && <span className="ml-2 text-xs text-pink-300 bg-pink-900/50 px-2 py-0.5 rounded-full">❤️ Đạo lữ</span>}
                                    {npc.isNew && <NewBadge />}
                                </p>
                                <p className="text-sm text-slate-400">{npc.realm}</p>
                            </div>
                            <div className="text-right">
                                <p className={`font-semibold text-lg ${relationship.color}`}>{relationship.text}</p>
                                <p className="text-sm text-slate-500">{relationshipValue}</p>
                            </div>
                        </div>
                    )
                })
            )}
        </div>
    );

    const renderOwnedLocationsTab = () => {
        const ownedLocations = profile.discoveredLocations.filter(loc => loc.ownerId === profile.id && !loc.isDestroyed);

        return (
            <div className="space-y-4">
                {ownedLocations.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-slate-500">Bạn chưa sở hữu địa điểm nào.</p>
                    </div>
                ) : (
                    ownedLocations.map((loc) => (
                        <LocationAccordionItem key={loc.id} location={loc} onUpdateLocation={handleUpdateLocation} />
                    ))
                )}
            </div>
        );
    };

    const renderMilestonesTab = () => (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-amber-300 border-b border-slate-700 pb-2 mb-4">Sổ Ký Ức</h3>
            <p className="text-sm text-slate-400">Đây là những cột mốc quan trọng và các sự kiện lớn đã kết thúc vĩnh viễn trong cuộc đời tu tiên của bạn. Chúng là lịch sử không thể thay đổi.</p>
            {(profile.milestones || []).length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-slate-500">Sổ Ký Ức còn trống.</p>
                </div>
            ) : (
                <div className="relative border-l-2 border-slate-700 ml-4 pl-8 py-4 space-y-8">
                    {[...(profile.milestones || [])].reverse().map((milestone: Milestone, index) => (
                        <div key={index} className="relative animate-fade-in">
                            <div className="absolute -left-[38px] top-1 h-4 w-4 bg-amber-400 rounded-full border-4 border-slate-800"></div>
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                <div className="flex justify-between items-start">
                                    <p className="text-slate-200 font-semibold flex items-center pr-4">
                                        {milestone.summary}
                                        {milestone.isNew && <NewBadge />}
                                    </p>
                                    <span className="text-xs text-slate-500 flex-shrink-0 whitespace-nowrap bg-slate-700 px-2 py-1 rounded-md">Lượt {milestone.turnNumber}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

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
                        <h2 id="player-info-title" className="text-2xl font-bold text-slate-100">{profile.name}</h2>
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
                                    {canCreate && <TabButton isActive={activeTab === 'creation'} onClick={() => setActiveTab('creation')}>Sáng Tạo</TabButton>}
                                    <TabButton isActive={activeTab === 'info'} onClick={() => setActiveTab('info')}>Thông tin</TabButton>
                                </nav>
                            </div>
                            <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                                {activeTab === 'stats' && renderStatsTab()}
                                {activeTab === 'skills' && renderSkillsTab()}
                                {activeTab === 'relationships' && renderRelationshipsTab()}
                                {activeTab === 'milestones' && renderMilestonesTab()}
                                {activeTab === 'ownedLocations' && renderOwnedLocationsTab()}
                                {activeTab === 'creation' && canCreate && <CreationTab profile={profile} onAction={onAction} onClose={onClose} />}
                                {activeTab === 'info' && renderInfoTab()}
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
