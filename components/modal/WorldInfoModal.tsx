import React, { useState, useMemo } from 'react';
import { WorldSettings, CharacterProfile, Location, NPC, Monster, WorldKnowledge, Skill, Item } from '../../types';

interface WorldInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    worldSettings: WorldSettings;
    characterProfile: CharacterProfile;
    onUpdateLocation: (location: Location) => void;
    onUpdateWorldSettings: (settings: WorldSettings) => void;
    npcs: NPC[];
}

type TabName = 'overview' | 'knowledge' | 'factions' | 'skills' | 'items' | 'locations' | 'bestiary' | 'npcs' | 'rules';

const NewBadge = () => <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold text-slate-900 bg-yellow-300 rounded-full">NEW</span>;

const TabButton = ({ isActive, onClick, children, count }: { isActive: boolean, onClick: () => void, children: React.ReactNode, count?: number }) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 text-sm font-medium transition-colors duration-200 focus:outline-none relative ${
            isActive 
                ? 'border-b-2 border-amber-400 text-amber-300' 
                : 'text-slate-400 hover:text-slate-200'
        }`}
    >
        {children}
        {count !== undefined && <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold text-slate-100 bg-slate-600 rounded-full">{count}</span>}
    </button>
);


const PlayerRulesManager: React.FC<{ 
    worldSettings: WorldSettings;
    onUpdateWorldSettings: (settings: WorldSettings) => void;
}> = ({ worldSettings, onUpdateWorldSettings }) => {
    const [newRule, setNewRule] = useState('');

    const handleAddRule = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRule.trim()) {
            const updatedRules = [...(worldSettings.playerDefinedRules || []), newRule.trim()];
            onUpdateWorldSettings({ ...worldSettings, playerDefinedRules: updatedRules });
            setNewRule('');
        }
    };

    const handleDeleteRule = (indexToDelete: number) => {
        const updatedRules = (worldSettings.playerDefinedRules || []).filter((_, index) => index !== indexToDelete);
        onUpdateWorldSettings({ ...worldSettings, playerDefinedRules: updatedRules });
    };

    return (
        <div className="bg-slate-900/50 p-6 rounded-lg space-y-4 border border-slate-700/50">
            <h3 className="text-lg font-bold text-amber-300">Thêm Tri Thức / Quy Tắc Mới</h3>
            <div className="space-y-4">
                <p className="text-sm text-slate-400 -mt-2">
                    Thêm các quy tắc, tri thức hoặc sự thật mới vào thế giới. AI sẽ ghi nhớ và tuân thủ những điều này trong các lượt chơi tiếp theo. Ví dụ: "Vật phẩm 'Huyết Tinh Thạch' có khả năng hấp thụ linh hồn.", "Kỹ năng 'Thiên Lý Nhãn' có thể nhìn xuyên vật thể."
                </p>
                
                <form onSubmit={handleAddRule} className="space-y-3">
                     <textarea
                        value={newRule}
                        onChange={(e) => setNewRule(e.target.value)}
                        placeholder="Nhập quy tắc hoặc tri thức mới tại đây..."
                        rows={3}
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-slate-200 resize-y text-sm"
                     />
                     <button type="submit" disabled={!newRule.trim()} className="w-full py-2.5 bg-slate-700 text-slate-100 font-bold rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50">
                        Thêm vào Thiên Đạo
                     </button>
                </form>

                <div className="border-t border-slate-700 pt-4">
                    <h4 className="font-semibold text-slate-200 mb-2">Quy tắc do người chơi định nghĩa ({(worldSettings.playerDefinedRules || []).length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 pr-2">
                         {(worldSettings.playerDefinedRules || []).length > 0 ? (
                            (worldSettings.playerDefinedRules || []).map((rule, index) => (
                                <div key={index} className="flex items-start justify-between p-2.5 bg-slate-800/70 rounded-md text-slate-300 text-sm">
                                    <p className="flex-grow pr-2">&bull; {rule}</p>
                                    <button onClick={() => handleDeleteRule(index)} className="flex-shrink-0 text-red-500 hover:text-red-400" aria-label={`Xóa quy tắc: ${rule}`}>
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-center py-2 text-sm">Chưa có quy tắc nào.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoAccordionItem = ({ title, content, isNew, titleColor = 'text-slate-200' }: { title: string; content: React.ReactNode; isNew?: boolean; titleColor?: string; }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-3 p-3 bg-slate-800/50 text-left hover:bg-slate-700/50 transition-colors ${isOpen ? 'rounded-t-md' : 'rounded-md'}`}
                aria-expanded={isOpen}
            >
                <p className={`font-semibold flex items-center ${titleColor}`}>
                    {title}
                    {isNew && <NewBadge />}
                </p>
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-4 bg-slate-800/70 rounded-b-md text-slate-300 text-sm animate-fade-in border-x border-b border-slate-700/50">
                    <div className="whitespace-pre-wrap">{content}</div>
                </div>
            )}
        </div>
    );
};


export const WorldInfoModal: React.FC<WorldInfoModalProps> = ({ isOpen, onClose, worldSettings, characterProfile, onUpdateLocation, onUpdateWorldSettings, npcs }) => {
    const [activeTab, setActiveTab] = useState<TabName>('overview');

    const factions = useMemo(() => 
        [...(worldSettings.initialKnowledge || [])].filter(k => k.category === 'Bang Phái').sort((a, b) => a.title.localeCompare(b.title)), 
    [worldSettings.initialKnowledge]);

    const otherKnowledge = useMemo(() => 
        [...(worldSettings.initialKnowledge || [])].filter(k => k.category !== 'Bang Phái').sort((a, b) => a.title.localeCompare(b.title)), 
    [worldSettings.initialKnowledge]);
    
    const sortedSkills = useMemo(() =>
        [...characterProfile.skills].sort((a, b) => a.name.localeCompare(b.name)),
        [characterProfile.skills]
    );

    const sortedDiscoveredItems = useMemo(() =>
        [...(characterProfile.discoveredItems || [])].sort((a, b) => a.name.localeCompare(b.name)),
        [characterProfile.discoveredItems]
    );

    const sortedLocations = useMemo(() =>
        [...characterProfile.discoveredLocations].sort((a, b) => a.name.localeCompare(b.name)),
        [characterProfile.discoveredLocations]
    );
    
    const sortedMonsters = useMemo(() =>
        [...characterProfile.discoveredMonsters].sort((a, b) => a.name.localeCompare(b.name)),
        [characterProfile.discoveredMonsters]
    );
    
    const sortedNpcs = useMemo(() =>
        [...npcs].sort((a, b) => a.name.localeCompare(b.name)),
        [npcs]
    );

    if (!isOpen) return null;
    
    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                     <div className="bg-slate-900/50 p-6 rounded-lg space-y-6 border border-slate-700/50">
                        <div>
                            <h3 className="text-lg font-bold text-amber-300 mb-3">Hệ Thống Sức Mạnh</h3>
                            <div className="space-y-4">
                                {worldSettings.powerSystems.map(system => (
                                    <div key={system.id}>
                                        <h4 className="font-semibold text-amber-400 mb-1">{system.name}</h4>
                                        <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
                                            {system.realms.split(' - ').join(' → ')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-slate-700 pt-6">
                            <h3 className="text-lg font-bold text-amber-300 mb-2">Phẩm chất</h3>
                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {worldSettings.qualityTiers.split(' - ').join(' → ')}
                            </p>
                        </div>

                         <div className="border-t border-slate-700 pt-6">
                            <h3 className="text-lg font-bold text-amber-300 mb-2">Tư chất</h3>
                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {worldSettings.aptitudeTiers.split(' - ').join(' → ')}
                            </p>
                        </div>
                    </div>
                );
            case 'knowledge':
                return (
                     <div className="bg-slate-900/50 p-6 rounded-lg space-y-4 border border-slate-700/50">
                        <h3 className="text-lg font-bold text-amber-300 mb-2">Tri Thức Thế Giới</h3>
                        {otherKnowledge.length > 0 ? (
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                {otherKnowledge.map(knowledge => (
                                    <InfoAccordionItem key={knowledge.id} title={knowledge.title} content={knowledge.content} isNew={knowledge.isNew}/>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-4">Không có tri thức nào được định nghĩa.</p>
                        )}
                    </div>
                );
            case 'factions':
                return (
                    <div className="bg-slate-900/50 p-6 rounded-lg space-y-4 border border-slate-700/50">
                        <h3 className="text-lg font-bold text-yellow-400 mb-2">Thế Lực & Bang Phái</h3>
                        {factions.length > 0 ? (
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                {factions.map(faction => (
                                    <InfoAccordionItem key={faction.id} title={faction.title} content={faction.content} isNew={faction.isNew} titleColor="text-yellow-400" />
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-4">Chưa khám phá ra thế lực nào.</p>
                        )}
                    </div>
                );
            case 'skills':
                 return (
                    <div className="bg-slate-900/50 p-6 rounded-lg space-y-4 border border-slate-700/50">
                        <h3 className="text-lg font-bold text-amber-300 mb-2">Kỹ Năng Đã Học</h3>
                        {sortedSkills.length > 0 ? (
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                {sortedSkills.map(skill => (
                                    <InfoAccordionItem 
                                        key={skill.id}
                                        title={skill.name}
                                        content={skill.description}
                                        isNew={skill.isNew}
                                        titleColor="text-amber-300"
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-4">Chưa học được kỹ năng nào.</p>
                        )}
                    </div>
                );
             case 'items':
                return (
                    <div className="bg-slate-900/50 p-6 rounded-lg space-y-4 border border-slate-700/50">
                        <h3 className="text-lg font-bold text-lime-300 mb-2">Vật Phẩm Đã Khám Phá</h3>
                        {sortedDiscoveredItems.length > 0 ? (
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                {sortedDiscoveredItems.map(item => (
                                    <InfoAccordionItem 
                                        key={item.id}
                                        title={item.name}
                                        content={item.description}
                                        isNew={item.isNew}
                                        titleColor="text-lime-300"
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-4">Chưa khám phá vật phẩm nào.</p>
                        )}
                    </div>
                );
            case 'locations':
                 return (
                    <div className="bg-slate-900/50 p-6 rounded-lg space-y-4 border border-slate-700/50">
                        <h3 className="text-lg font-bold text-cyan-300 mb-2">Địa Điểm Đã Khám Phá</h3>
                        {sortedLocations.length > 0 ? (
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                {sortedLocations.map(location => (
                                    <InfoAccordionItem 
                                        key={location.id}
                                        title={location.name}
                                        content={location.description}
                                        isNew={location.isNew}
                                        titleColor="text-cyan-300"
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-4">Chưa khám phá ra địa điểm nào.</p>
                        )}
                    </div>
                );
            case 'rules':
                return <PlayerRulesManager worldSettings={worldSettings} onUpdateWorldSettings={onUpdateWorldSettings} />;
            case 'bestiary':
                return (
                    <div className="bg-slate-900/50 p-6 rounded-lg space-y-4 border border-slate-700/50">
                        <h3 className="text-lg font-bold text-green-300 mb-2">Sinh Vật Đã Biết</h3>
                        <p className="text-sm text-slate-400 -mt-2 mb-4">Danh sách các yêu thú, ma vật và các sinh vật khác bạn đã chạm trán.</p>
                        {sortedMonsters.length > 0 ? (
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                {sortedMonsters.map(monster => (
                                    <InfoAccordionItem key={monster.id} title={monster.name} content={monster.description} isNew={monster.isNew} titleColor="text-green-300" />
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-4">Chưa gặp gỡ sinh vật nào.</p>
                        )}
                    </div>
                );
            case 'npcs':
                return (
                    <div className="bg-slate-900/50 p-6 rounded-lg space-y-4 border border-slate-700/50">
                        <h3 className="text-lg font-bold text-purple-300 mb-2">Nhân Vật Đã Gặp</h3>
                        {sortedNpcs.length > 0 ? (
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                {sortedNpcs.map(npc => (
                                    <InfoAccordionItem 
                                        key={npc.id}
                                        title={npc.name}
                                        content={
                                            <>
                                                <p className="font-semibold">{npc.realm}</p>
                                                <p className="mt-2">{npc.description}</p>
                                            </>
                                        }
                                        isNew={npc.isNew}
                                        titleColor="text-purple-300"
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-4">Chưa gặp gỡ nhân vật nào.</p>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="world-info-title"
        >
            <div
                className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-3xl m-4 flex flex-col h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 px-6 py-4 flex justify-between items-center border-b border-slate-700">
                    <h2 id="world-info-title" className="text-xl font-bold text-slate-100">Thông Tin Thế Giới</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Đóng">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                 {/* Tabs */}
                 <div className="flex-shrink-0 px-4 border-b border-slate-700">
                    <nav className="flex space-x-1 flex-wrap">
                        <TabButton isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Tổng Quan</TabButton>
                        <TabButton isActive={activeTab === 'knowledge'} onClick={() => setActiveTab('knowledge')} count={otherKnowledge.length}>Tri Thức</TabButton>
                        <TabButton isActive={activeTab === 'factions'} onClick={() => setActiveTab('factions')} count={factions.length}>Thế Lực</TabButton>
                        <TabButton isActive={activeTab === 'skills'} onClick={() => setActiveTab('skills')} count={characterProfile.skills.length}>Kỹ Năng</TabButton>
                        <TabButton isActive={activeTab === 'items'} onClick={() => setActiveTab('items')} count={(characterProfile.discoveredItems || []).length}>Vật phẩm</TabButton>
                        <TabButton isActive={activeTab === 'locations'} onClick={() => setActiveTab('locations')} count={characterProfile.discoveredLocations.length}>Địa Điểm</TabButton>
                        <TabButton isActive={activeTab === 'bestiary'} onClick={() => setActiveTab('bestiary')} count={characterProfile.discoveredMonsters.length}>Sinh Vật</TabButton>
                        <TabButton isActive={activeTab === 'npcs'} onClick={() => setActiveTab('npcs')} count={npcs.length}>NPC</TabButton>
                        <TabButton isActive={activeTab === 'rules'} onClick={() => setActiveTab('rules')}>Quy Tắc</TabButton>
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
