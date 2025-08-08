
import React from 'react';
import { WorldSettings, WorldKnowledge } from '../../../types';
import { FormInput, FormSelect, FormTextArea, FormLabel } from '../common';

interface InitialKnowledgeSectionProps {
    worldSettings: WorldSettings;
    setWorldSettings: React.Dispatch<React.SetStateAction<WorldSettings>>;
}

const knowledgeCategories: WorldKnowledge['category'][] = ['Bang Phái', 'Lịch Sử', 'Nhân Vật', 'Khác'];

export const InitialKnowledgeSection: React.FC<InitialKnowledgeSectionProps> = ({ worldSettings, setWorldSettings }) => {

    const handleAddInitialKnowledge = () => {
        setWorldSettings(prev => ({ ...prev, initialKnowledge: [...(prev.initialKnowledge || []), { id: Date.now().toString(), title: '', content: '', category: 'Khác' }] }));
    };

    const handleRemoveInitialKnowledge = (id: string) => {
        setWorldSettings(prev => ({ ...prev, initialKnowledge: (prev.initialKnowledge || []).filter(k => k.id !== id) }));
    };

    const handleUpdateInitialKnowledge = (id: string, field: 'title' | 'content' | 'category', value: string) => {
        setWorldSettings(prev => ({
            ...prev,
            initialKnowledge: (prev.initialKnowledge || []).map(k => k.id === id ? { ...k, [field]: value } : k)
        }));
    };

    return (
        <>
            <p className="text-sm text-slate-400 mb-4">Định nghĩa các khái niệm cốt lõi của thế giới như nguồn gốc các chủng tộc, các loại thể chất đặc biệt, các sự kiện lịch sử... AI sẽ sử dụng tri thức này để làm cho câu chuyện trở nên nhất quán và có chiều sâu hơn.</p>
            <div className="space-y-4">
                {(worldSettings.initialKnowledge || []).map((knowledge, index) => (
                    <div key={knowledge.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-cyan-300">Mục Tri Thức {index + 1}</h3>
                            <button type="button" onClick={() => handleRemoveInitialKnowledge(knowledge.id)} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-500 transition-colors">Xóa</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <FormLabel htmlFor={`k-title-${knowledge.id}`}>Tiêu đề</FormLabel>
                                <FormInput id={`k-title-${knowledge.id}`} value={knowledge.title} onChange={e => handleUpdateInitialKnowledge(knowledge.id, 'title', e.target.value)} placeholder="Vd: Nguồn gốc của Ma Tộc" />
                            </div>
                            <div>
                                <FormLabel htmlFor={`k-category-${knowledge.id}`}>Phân loại</FormLabel>
                                <FormSelect id={`k-category-${knowledge.id}`} value={knowledge.category} onChange={e => handleUpdateInitialKnowledge(knowledge.id, 'category', e.target.value)}>
                                    {knowledgeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </FormSelect>
                            </div>
                        </div>
                        <div>
                            <FormLabel htmlFor={`k-content-${knowledge.id}`}>Nội dung</FormLabel>
                            <FormTextArea id={`k-content-${knowledge.id}`} value={knowledge.content} onChange={e => handleUpdateInitialKnowledge(knowledge.id, 'content', e.target.value)} placeholder="Vd: Ma Tộc là một chủng tộc cổ xưa bị trục xuất khỏi Tiên Giới..." rows={4} />
                        </div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={handleAddInitialKnowledge} className="w-full mt-4 py-2 px-4 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-amber-300 hover:border-amber-400 transition-all">+ Thêm Tri Thức</button>
        </>
    );
};