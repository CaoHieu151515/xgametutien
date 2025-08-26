import React, { useState, useMemo, useEffect } from 'react';
import { FullGameState, Identity, NPC, NewNPCFromAI, CharacterProfile } from '../../types';
import { FormInput, FormTextArea, FormLabel, WandIcon } from '../worldSetup/common';
import { ImageLibraryModal } from './ImageLibraryModal';
import { findBestAvatar } from '../../services/avatarService';
import { Loader } from '../Loader';

interface IdentityModalProps {
    isOpen: boolean;
    onClose: () => void;
    fullGameState: FullGameState;
    onUpdateGameState: (newGameState: FullGameState) => void;
    npcs: NPC[];
    api: any;
    apiKeyForService: string;
}

const defaultIdentity: Omit<Identity, 'id'> = {
    name: '',
    goal: '',
    backstory: '',
    personality: '',
    appearance: '',
    imageUrl: '',
    npcRelationships: [],
};

export const IdentityModal: React.FC<IdentityModalProps> = ({ isOpen, onClose, fullGameState, onUpdateGameState, npcs, api, apiKeyForService }) => {
    const [selectedId, setSelectedId] = useState<string | 'true_self' | null>(null);
    const [formData, setFormData] = useState<Omit<Identity, 'id' | 'npcRelationships'>>(defaultIdentity);
    const [trueSelfFormData, setTrueSelfFormData] = useState({
        appearance: fullGameState.characterProfile.appearance,
        personality: fullGameState.characterProfile.personality,
        backstory: fullGameState.characterProfile.backstory,
        goal: fullGameState.characterProfile.goal,
    });
    const [identityIdea, setIdentityIdea] = useState('');
    const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const identities = useMemo(() => fullGameState.identities || [], [fullGameState.identities]);

    useEffect(() => {
        if (isOpen) {
            setSelectedId(fullGameState.activeIdentityId || 'true_self');
        } else {
            setSelectedId(null);
            setIsImageLibraryOpen(false);
            setIsLoadingAI(false);
        }
    }, [isOpen, fullGameState.activeIdentityId]);

    useEffect(() => {
        setIsEditing(false); // Reset edit mode when selection changes
        if (typeof selectedId === 'string') {
            const identity = identities.find(i => i.id === selectedId);
            if (identity) {
                const { id, npcRelationships, ...data } = identity;
                setFormData(data);
            }
        }
    }, [selectedId, identities]);

    const handleSelect = (id: string | 'true_self') => {
        setSelectedId(id);
        setIdentityIdea('');
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleTrueSelfFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTrueSelfFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddIdentity = () => {
        const newIdentity: Identity = {
            ...defaultIdentity,
            id: `identity_${Date.now()}`,
            name: 'Nhân Dạng Mới',
        };
        const newGameState = { ...fullGameState, identities: [...identities, newIdentity] };
        onUpdateGameState(newGameState);
        setSelectedId(newIdentity.id);
        setIsEditing(true); // Automatically enter edit mode for new identity
    };
    
    const handleSaveChanges = () => {
        if (typeof selectedId !== 'string') return;
        const newIdentities = identities.map(i => {
            if (i.id === selectedId) {
                return { ...i, ...formData };
            }
            return i;
        });
        onUpdateGameState({ ...fullGameState, identities: newIdentities });
        setIsEditing(false);
        alert('Đã lưu thay đổi!');
    };
    
    const handleSaveTrueSelf = () => {
        const newProfile: CharacterProfile = {
            ...fullGameState.characterProfile,
            ...trueSelfFormData,
        };
        onUpdateGameState({ ...fullGameState, characterProfile: newProfile });
        setIsEditing(false);
        alert('Đã lưu thay đổi cho bản thể thật!');
    };

    const handleDelete = () => {
        if (typeof selectedId !== 'string' || !window.confirm('Bạn có chắc chắn muốn xóa nhân dạng này không? Thao tác này không thể hoàn tác.')) return;
        
        const newIdentities = identities.filter(i => i.id !== selectedId);
        let newActiveId = fullGameState.activeIdentityId;
        if (newActiveId === selectedId) {
            newActiveId = null; // Revert to true self if active identity is deleted
        }
        
        onUpdateGameState({ ...fullGameState, identities: newIdentities, activeIdentityId: newActiveId });
        setSelectedId('true_self'); // Select true self after deletion
    };

    const handleActivate = () => {
        if (typeof selectedId !== 'string') return;
        onUpdateGameState({ ...fullGameState, activeIdentityId: selectedId });
    };
    
    const handleDeactivate = () => {
        onUpdateGameState({ ...fullGameState, activeIdentityId: null });
    };
    
    const handleStartEditTrueSelf = () => {
        setTrueSelfFormData({
            appearance: fullGameState.characterProfile.appearance,
            personality: fullGameState.characterProfile.personality,
            backstory: fullGameState.characterProfile.backstory,
            goal: fullGameState.characterProfile.goal,
        });
        setIsEditing(true);
    };

    const handleAutoFill = async () => {
        if (!selectedIdentity) {
            alert("Vui lòng chọn một nhân dạng để tự động điền.");
            return;
        }
        setIsLoadingAI(true);
        try {
            const details = await api.generateIdentityDetails(selectedIdentity.name, identityIdea, fullGameState.characterProfile, apiKeyForService);
            const updatedFormData = { ...formData, ...details };
            setFormData(updatedFormData);

            // Now, find an avatar
            const fakeNpcProfile: NewNPCFromAI = {
                id: `fake_${selectedIdentity.id}`,
                name: selectedIdentity.name,
                gender: fullGameState.characterProfile.gender,
                race: fullGameState.characterProfile.race,
                personality: details.personality,
                description: details.backstory,
                ngoaiHinh: details.appearance,
                level: 1, // Assume low level for avatar search
                powerSystem: fullGameState.characterProfile.powerSystem,
                aptitude: '', // Not relevant for avatar
                mienLuc: { body: 15, face: 15, aura: 10, power: 5 },
                locationId: '',
                statusEffects: [],
            };
            
            const bestUrl = await findBestAvatar(fakeNpcProfile, npcs);
            if (bestUrl) {
                setFormData(prev => ({ ...prev, imageUrl: bestUrl }));
            }
            
            alert('Đã điền tự động thông tin nhân dạng!');
        } catch (error) {
            console.error("Lỗi khi tự động điền nhân dạng:", error);
            alert(`Đã xảy ra lỗi: ${(error as Error).message}`);
        } finally {
            setIsLoadingAI(false);
        }
    };


    if (!isOpen) return null;

    const selectedIdentity = typeof selectedId === 'string' ? identities.find(i => i.id === selectedId) : null;
    const isTrueSelfSelected = selectedId === 'true_self';
    const isSelectedActive = selectedId === fullGameState.activeIdentityId || (isTrueSelfSelected && fullGameState.activeIdentityId === null);


    return (
        <>
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
                <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-5xl m-4 flex flex-col max-h-[90vh] h-[90vh]" onClick={e => e.stopPropagation()}>
                    {isLoadingAI && <Loader />}
                    <div className="flex-shrink-0 px-6 py-4 flex justify-between items-center border-b border-slate-700">
                        <h2 className="text-2xl font-bold text-amber-300">Quản Lý Nhân Dạng</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Đóng"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>

                    <div className="flex-grow flex overflow-hidden">
                        {/* Left Panel: List */}
                        <div className="w-1/3 h-full bg-slate-900/40 flex flex-col p-2">
                            <div className="flex-grow overflow-y-auto custom-scrollbar space-y-1">
                                <button onClick={() => handleSelect('true_self')} className={`w-full text-left p-2 rounded-md transition-colors flex justify-between items-center ${isTrueSelfSelected ? 'bg-amber-600/20' : 'hover:bg-slate-700/50'}`}>
                                    <span className={`font-semibold truncate ${isTrueSelfSelected ? 'text-amber-300' : 'text-slate-200'}`}>{fullGameState.characterProfile.name} (Bản Thể Thật)</span>
                                    {fullGameState.activeIdentityId === null && <span className="text-xs text-green-400 font-bold">Đang dùng</span>}
                                </button>
                                {identities.map(id => (
                                    <button key={id.id} onClick={() => handleSelect(id.id)} className={`w-full text-left p-2 rounded-md transition-colors flex justify-between items-center ${selectedId === id.id ? 'bg-amber-600/20' : 'hover:bg-slate-700/50'}`}>
                                        <span className={`font-semibold truncate ${selectedId === id.id ? 'text-amber-300' : 'text-slate-200'}`}>{id.name || '(Chưa có tên)'}</span>
                                        {fullGameState.activeIdentityId === id.id && <span className="text-xs text-green-400 font-bold">Đang dùng</span>}
                                    </button>
                                ))}
                            </div>
                            <div className="flex-shrink-0 pt-2 mt-2 border-t border-slate-700">
                                <button onClick={handleAddIdentity} className="w-full py-2 px-4 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-amber-300 hover:border-amber-400 transition-all text-sm">
                                    + Tạo Nhân Dạng Mới
                                </button>
                            </div>
                        </div>
                        {/* Right Panel: Editor */}
                        <div className="w-2/3 h-full p-6 overflow-y-auto custom-scrollbar">
                            {selectedIdentity ? (
                                <div className="space-y-4">
                                    {isEditing ? (
                                        <div className="border-b border-slate-700 pb-4 flex flex-col sm:flex-row gap-2">
                                            <button onClick={handleSaveChanges} className="w-full sm:w-auto flex-grow px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors">Lưu Thay Đổi</button>
                                            <button onClick={handleAutoFill} disabled={isLoadingAI} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50">
                                                <WandIcon />
                                                Tự Động Điền
                                            </button>
                                             <button onClick={() => setIsEditing(false)} className="w-full sm:w-auto px-4 py-2 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500 transition-colors">Hủy</button>
                                        </div>
                                    ) : (
                                        <div className="border-b border-slate-700 pb-4 flex flex-col sm:flex-row gap-2">
                                            <button onClick={handleActivate} disabled={isSelectedActive} className="w-full sm:w-auto flex-grow px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50">
                                                {isSelectedActive ? 'Đang Kích Hoạt' : 'Kích Hoạt'}
                                            </button>
                                            <button onClick={() => setIsEditing(true)} className="w-full sm:w-auto px-4 py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-500 transition-colors">Chỉnh sửa</button>
                                            <button onClick={handleDelete} className="w-full sm:w-auto px-4 py-2 bg-red-700 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">Xóa</button>
                                        </div>
                                    )}

                                    <div>
                                        <FormLabel htmlFor="name">Tên Nhân Dạng</FormLabel>
                                        <FormInput id="name" name="name" value={formData.name} onChange={handleFormChange} disabled={!isEditing} />
                                    </div>
                                    <div>
                                        <FormLabel htmlFor="imageUrl">URL Ảnh Đại Diện</FormLabel>
                                        <div className="flex items-center gap-2">
                                            <FormInput id="imageUrl" name="imageUrl" value={formData.imageUrl || ''} onChange={handleFormChange} disabled={!isEditing} />
                                            <button onClick={() => setIsImageLibraryOpen(true)} className="p-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-md transition-colors flex-shrink-0" disabled={!isEditing}>Thư Viện</button>
                                        </div>
                                    </div>
                                    {isEditing && (
                                        <div>
                                            <FormLabel htmlFor="identityIdea">Ý Tưởng Nhân Dạng (AI sẽ dựa vào đây)</FormLabel>
                                            <FormTextArea 
                                                id="identityIdea" 
                                                name="identityIdea" 
                                                value={identityIdea} 
                                                onChange={e => setIdentityIdea(e.target.value)} 
                                                rows={3} 
                                                placeholder="Ví dụ: Một thư sinh yếu đuối nhưng có kiến thức uyên bác về lịch sử cổ đại, đang tìm kiếm một cuốn sách bị thất lạc..."
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <FormLabel htmlFor="goal">Mục Tiêu</FormLabel>
                                        <FormTextArea id="goal" name="goal" value={formData.goal} onChange={handleFormChange} rows={3} disabled={!isEditing} />
                                    </div>
                                    <div>
                                        <FormLabel htmlFor="appearance">Mô Tả Ngoại Hình</FormLabel>
                                        <FormTextArea id="appearance" name="appearance" value={formData.appearance} onChange={handleFormChange} rows={4} disabled={!isEditing} />
                                    </div>
                                    <div>
                                        <FormLabel htmlFor="personality">Tính Cách</FormLabel>
                                        <FormTextArea id="personality" name="personality" value={formData.personality} onChange={handleFormChange} rows={4} disabled={!isEditing} />
                                    </div>
                                    <div>
                                        <FormLabel htmlFor="backstory">Tiểu Sử / Bối Cảnh Giả</FormLabel>
                                        <FormTextArea id="backstory" name="backstory" value={formData.backstory} onChange={handleFormChange} rows={6} disabled={!isEditing} />
                                    </div>
                                </div>
                            ) : isTrueSelfSelected ? (
                                <div className="space-y-4">
                                    {isEditing ? (
                                        <div className="border-b border-slate-700 pb-4 flex flex-col sm:flex-row gap-2">
                                            <button onClick={handleSaveTrueSelf} className="w-full sm:w-auto flex-grow px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors">Lưu Thay Đổi</button>
                                            <button onClick={() => setIsEditing(false)} className="w-full sm:w-auto px-4 py-2 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500 transition-colors">Hủy</button>
                                        </div>
                                    ) : (
                                        <div className="border-b border-slate-700 pb-4 flex flex-col sm:flex-row gap-2">
                                            <button onClick={handleDeactivate} disabled={isSelectedActive} className="w-full sm:w-auto flex-grow px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50">
                                                {isSelectedActive ? 'Đang Kích Hoạt' : 'Kích Hoạt Bản Thể Thật'}
                                            </button>
                                            <button onClick={handleStartEditTrueSelf} className="w-full sm:w-auto px-4 py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-500 transition-colors">Chỉnh sửa</button>
                                        </div>
                                    )}
                                    <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                                        <h3 className="text-2xl font-bold text-slate-100">{fullGameState.characterProfile.name}</h3>
                                        <p className="text-sm text-slate-400 mt-1">Đây là bản thể thật của bạn. Mọi sức mạnh và mối quan hệ gốc đều bắt nguồn từ đây.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <FormLabel htmlFor="true-appearance">Ngoại Hình</FormLabel>
                                            <FormTextArea id="true-appearance" name="appearance" value={isEditing ? trueSelfFormData.appearance : fullGameState.characterProfile.appearance} onChange={handleTrueSelfFormChange} disabled={!isEditing} rows={4} />
                                        </div>
                                        <div>
                                            <FormLabel htmlFor="true-personality">Tính Cách</FormLabel>
                                            <FormTextArea id="true-personality" name="personality" value={isEditing ? trueSelfFormData.personality : fullGameState.characterProfile.personality} onChange={handleTrueSelfFormChange} disabled={!isEditing} rows={4} />
                                        </div>
                                        <div>
                                            <FormLabel htmlFor="true-backstory">Tiểu Sử</FormLabel>
                                            <FormTextArea id="true-backstory" name="backstory" value={isEditing ? trueSelfFormData.backstory : fullGameState.characterProfile.backstory} onChange={handleTrueSelfFormChange} disabled={!isEditing} rows={6} />
                                        </div>
                                         <div>
                                            <FormLabel htmlFor="true-goal">Mục Tiêu</FormLabel>
                                            <FormTextArea id="true-goal" name="goal" value={isEditing ? trueSelfFormData.goal : fullGameState.characterProfile.goal} onChange={handleTrueSelfFormChange} disabled={!isEditing} rows={3} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500 text-center">
                                    <p>Chọn một nhân dạng từ danh sách hoặc tạo một nhân dạng mới.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ImageLibraryModal 
                isOpen={isImageLibraryOpen}
                onClose={() => setIsImageLibraryOpen(false)}
                onSelect={(url) => setFormData(prev => ({...prev, imageUrl: url}))}
            />
        </>
    );
};