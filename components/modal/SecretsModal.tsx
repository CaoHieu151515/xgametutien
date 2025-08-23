import React, { useState, useMemo } from 'react';
import { CharacterProfile, NPC, Secret, Reputation } from '../../types';

interface SecretsModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: CharacterProfile;
    npcs: NPC[];
    onUpdateProfile: (newProfile: CharacterProfile) => void;
}

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

export const SecretsModal: React.FC<SecretsModalProps> = ({ isOpen, onClose, profile, npcs, onUpdateProfile }) => {
    const [activeTab, setActiveTab] = useState<'secrets' | 'reputation'>('secrets');
    
    // State for creating a new secret
    const [newSecretTitle, setNewSecretTitle] = useState('');
    const [newSecretContent, setNewSecretContent] = useState('');
    const [newSecretKnownBy, setNewSecretKnownBy] = useState<string[]>([]);
    
    // State for creating a new reputation
    const [newReputationSummary, setNewReputationSummary] = useState('');

    const livingNpcs = useMemo(() => npcs.filter(npc => !npc.isDead).sort((a,b) => a.name.localeCompare(b.name)), [npcs]);

    const handleAddSecret = () => {
        if (!newSecretTitle.trim() || !newSecretContent.trim()) return;
        const newSecret: Secret = {
            id: `secret_${Date.now()}`,
            title: newSecretTitle.trim(),
            content: newSecretContent.trim(),
            knownByNpcIds: newSecretKnownBy,
        };
        onUpdateProfile({ ...profile, secrets: [...(profile.secrets || []), newSecret] });
        setNewSecretTitle('');
        setNewSecretContent('');
        setNewSecretKnownBy([]);
    };

    const handleDeleteSecret = (id: string) => {
        onUpdateProfile({ ...profile, secrets: (profile.secrets || []).filter(s => s.id !== id) });
    };

    const handleAddReputation = () => {
        if (!newReputationSummary.trim()) return;
        const newReputation: Reputation = {
            id: `rep_${Date.now()}`,
            summary: newReputationSummary.trim(),
        };
        onUpdateProfile({ ...profile, reputations: [...(profile.reputations || []), newReputation] });
        setNewReputationSummary('');
    };

    const handleDeleteReputation = (id: string) => {
        onUpdateProfile({ ...profile, reputations: (profile.reputations || []).filter(r => r.id !== id) });
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-4xl m-4 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-shrink-0 px-6 py-4 flex justify-between items-center border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-amber-300">Bí Mật & Tiếng Vang</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Đóng">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                 <div className="flex-shrink-0 px-4 border-b border-slate-700">
                    <nav className="flex space-x-1">
                        <TabButton isActive={activeTab === 'secrets'} onClick={() => setActiveTab('secrets')} count={(profile.secrets || []).length}>Bí Mật</TabButton>
                        <TabButton isActive={activeTab === 'reputation'} onClick={() => setActiveTab('reputation')} count={(profile.reputations || []).length}>Tiếng Vang</TabButton>
                    </nav>
                </div>

                <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                    {activeTab === 'secrets' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
                                <h3 className="text-lg font-bold text-slate-100">Thêm Bí Mật Mới</h3>
                                <input type="text" value={newSecretTitle} onChange={e => setNewSecretTitle(e.target.value)} placeholder="Tóm tắt bí mật..." className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400" />
                                <textarea value={newSecretContent} onChange={e => setNewSecretContent(e.target.value)} placeholder="Nội dung chi tiết bí mật..." rows={3} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y" />
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">NPC biết bí mật này (để trống nếu chỉ mình bạn biết):</label>
                                    <select multiple value={newSecretKnownBy} onChange={e => setNewSecretKnownBy(Array.from(e.target.selectedOptions, option => option.value))} className="w-full h-24 p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400">
                                        {livingNpcs.map(npc => <option key={npc.id} value={npc.id}>{npc.name}</option>)}
                                    </select>
                                </div>
                                <button onClick={handleAddSecret} disabled={!newSecretTitle.trim() || !newSecretContent.trim()} className="w-full py-2 bg-amber-600 text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50">Thêm Bí Mật</button>
                            </div>
                             <div className="space-y-3">
                                {(profile.secrets || []).map(secret => (
                                    <div key={secret.id} className="p-3 bg-slate-900/30 rounded-lg border border-slate-700/50">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-md font-semibold text-amber-300 flex-grow">{secret.title}</h4>
                                            <button onClick={() => handleDeleteSecret(secret.id)} className="text-red-500 hover:text-red-400 text-sm font-bold">Xóa</button>
                                        </div>
                                        <p className="text-sm text-slate-300 mt-1 whitespace-pre-wrap">{secret.content}</p>
                                        <p className="text-xs text-slate-500 mt-2"><b>Người biết:</b> {secret.knownByNpcIds.length > 0 ? secret.knownByNpcIds.map(id => npcs.find(n=>n.id===id)?.name || 'Không rõ').join(', ') : 'Chỉ mình bạn'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'reputation' && (
                         <div className="space-y-6">
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
                                <h3 className="text-lg font-bold text-slate-100">Thêm Tiếng Vang / Tin Đồn Mới</h3>
                                <textarea value={newReputationSummary} onChange={e => setNewReputationSummary(e.target.value)} placeholder="Nội dung tiếng vang hoặc tin đồn..." rows={3} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y" />
                                <button onClick={handleAddReputation} disabled={!newReputationSummary.trim()} className="w-full py-2 bg-amber-600 text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50">Thêm Tiếng Vang</button>
                            </div>
                             <div className="space-y-3">
                                {(profile.reputations || []).map(rep => (
                                    <div key={rep.id} className="flex justify-between items-center p-3 bg-slate-900/30 rounded-lg border border-slate-700/50">
                                        <p className="text-sm text-slate-200 flex-grow pr-4">📢 {rep.summary}</p>
                                        <button onClick={() => handleDeleteReputation(rep.id)} className="text-red-500 hover:text-red-400 text-sm font-bold">Xóa</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
