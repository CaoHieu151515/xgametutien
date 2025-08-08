
import React from 'react';
import { CharacterProfile, Monster } from '../../../types';
import { FormInput, FormTextArea, FormLabel } from '../common';

interface InitialMonstersSectionProps {
    profile: CharacterProfile;
    setProfile: React.Dispatch<React.SetStateAction<CharacterProfile>>;
}

export const InitialMonstersSection: React.FC<InitialMonstersSectionProps> = ({ profile, setProfile }) => {

    const handleAddInitialMonster = () => {
        const newMonster: Monster = {
            id: `monster_initial_${Date.now()}`,
            name: '',
            description: ''
        };
        setProfile(prev => ({ ...prev, initialMonsters: [...(prev.initialMonsters || []), newMonster] }));
    };

    const handleRemoveInitialMonster = (id: string) => {
        setProfile(prev => ({ ...prev, initialMonsters: (prev.initialMonsters || []).filter(m => m.id !== id) }));
    };

    const handleUpdateInitialMonster = (id: string, field: 'name' | 'description', value: string) => {
        setProfile(prev => ({
            ...prev,
            initialMonsters: (prev.initialMonsters || []).map(m => m.id === id ? { ...m, [field]: value } : m)
        }));
    };

    return (
        <>
            <p className="text-sm text-slate-400 mb-4">Định nghĩa các loại sinh vật, quái vật hoặc yêu thú tồn tại trong thế giới của bạn. AI sẽ sử dụng danh sách này để làm cho thế giới trở nên đa dạng hơn.</p>
            <div className="space-y-4">
                {(profile.initialMonsters || []).map((monster, index) => (
                    <div key={monster.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-green-300">Sinh Vật {index + 1}</h3>
                            <button type="button" onClick={() => handleRemoveInitialMonster(monster.id)} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-500 transition-colors">Xóa</button>
                        </div>
                        <div>
                            <FormLabel htmlFor={`m-name-${monster.id}`}>Tên</FormLabel>
                            <FormInput id={`m-name-${monster.id}`} value={monster.name} onChange={e => handleUpdateInitialMonster(monster.id, 'name', e.target.value)} placeholder="Vd: Huyết Lang, Ma Dơi..." />
                        </div>
                        <div>
                            <FormLabel htmlFor={`m-desc-${monster.id}`}>Mô tả</FormLabel>
                            <FormTextArea id={`m-desc-${monster.id}`} value={monster.description} onChange={e => handleUpdateInitialMonster(monster.id, 'description', e.target.value)} placeholder="Vd: Một loài sói khát máu với bộ lông đỏ rực, thường đi săn theo bầy..." rows={3} />
                        </div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={handleAddInitialMonster} className="w-full mt-4 py-2 px-4 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-amber-300 hover:border-amber-400 transition-all">+ Thêm Sinh Vật</button>
        </>
    );
};
