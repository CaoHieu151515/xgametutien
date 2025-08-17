import React from 'react';
import { CharacterProfile, WorldSettings, Skill, SkillType } from '../../../types';
import { getSkillExperienceForNextLevel } from '../../../services/progressionService';
import { FormInput, FormSelect, FormTextArea, FormLabel } from '../common';
import { GAME_CONFIG } from '../../../config/gameConfig';

interface InitialSkillsSectionProps {
    profile: CharacterProfile;
    worldSettings: WorldSettings;
    setProfile: React.Dispatch<React.SetStateAction<CharacterProfile>>;
}

export const InitialSkillsSection: React.FC<InitialSkillsSectionProps> = ({ profile, worldSettings, setProfile }) => {
    
    const handleAddSkill = () => {
        const newSkill: Skill = {
            id: Date.now().toString(),
            name: '',
            type: SkillType.ATTACK,
            quality: worldSettings.qualityTiers.split(' - ')[0]?.trim() || 'Phàm Phẩm',
            level: 1,
            experience: 0,
            description: '',
            effect: ''
        };
        setProfile(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
    };

    const handleRemoveSkill = (idToRemove: string) => {
        setProfile(prev => ({ ...prev, skills: prev.skills.filter(skill => skill.id !== idToRemove) }));
    };

    const handleSkillChange = (id: string, field: keyof Skill, value: any) => {
        setProfile(prev => ({
            ...prev,
            skills: prev.skills.map(skill =>
                skill.id === id ? { ...skill, [field]: value } : skill
            )
        }));
    };
    
    const levelsPerRealm = GAME_CONFIG.progression.subRealmNames.length;

    return (
        <div className="space-y-4">
            {profile.skills.map((skill, index) => (
                <div key={skill.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-amber-300">Kỹ Năng {index + 1}</h3>
                        <button type="button" onClick={() => handleRemoveSkill(skill.id)} className="px-3 py-1 bg-red-800 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors">Xóa Kỹ Năng</button>
                    </div>

                    <div><FormLabel htmlFor={`skill-name-${skill.id}`}>Tên Kỹ Năng</FormLabel><FormInput id={`skill-name-${skill.id}`} value={skill.name} onChange={(e) => handleSkillChange(skill.id, 'name', e.target.value)} /></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                            <FormLabel htmlFor={`skill-type-${skill.id}`}>Loại Kỹ Năng</FormLabel>
                            <FormSelect id={`skill-type-${skill.id}`} value={skill.type} onChange={(e) => handleSkillChange(skill.id, 'type', e.target.value as SkillType)}>{Object.values(SkillType).map(type => <option key={type} value={type}>{type}</option>)}</FormSelect>
                        </div>
                        <div>
                            <FormLabel htmlFor={`skill-quality-${skill.id}`}>Phẩm Chất</FormLabel>
                            <FormSelect id={`skill-quality-${skill.id}`} value={skill.quality} onChange={(e) => handleSkillChange(skill.id, 'quality', e.target.value)}>{worldSettings.qualityTiers.split(' - ').map(q => q.trim()).filter(Boolean).map(tier => <option key={tier} value={tier}>{tier}</option>)}</FormSelect>
                        </div>
                         <div>
                            <FormLabel htmlFor={`skill-level-${skill.id}`}>Cấp (1-{levelsPerRealm}, {levelsPerRealm} là Viên Mãn)</FormLabel>
                            <FormSelect id={`skill-level-${skill.id}`} value={skill.level} onChange={(e) => handleSkillChange(skill.id, 'level', parseInt(e.target.value, 10))}>{Array.from({ length: levelsPerRealm }, (_, i) => i + 1).map(level => <option key={level} value={level}>{level}</option>)}</FormSelect>
                        </div>
                    </div>

                    <div><FormLabel>Kinh Nghiệm (EXP)</FormLabel><FormInput value={`${skill.experience} / ${getSkillExperienceForNextLevel(skill.level, skill.quality, worldSettings.qualityTiers)}`} disabled /></div>
                    <div><FormLabel htmlFor={`skill-desc-${skill.id}`}>Mô Tả Kỹ Năng</FormLabel><FormTextArea id={`skill-desc-${skill.id}`} value={skill.description} onChange={(e) => handleSkillChange(skill.id, 'description', e.target.value)} /></div>
                    <div><FormLabel htmlFor={`skill-effect-${skill.id}`}>Hiệu ứng</FormLabel><FormTextArea id={`skill-effect-${skill.id}`} value={skill.effect} onChange={(e) => handleSkillChange(skill.id, 'effect', e.target.value)} placeholder="Mô tả hiệu ứng kỹ năng, vd: Gây 50 sát thương Lôi và có 30% khả năng Gây Tê Liệt trong 1 lượt."/></div>
                </div>
            ))}
            <button type="button" onClick={handleAddSkill} className="w-full mt-4 py-2 px-4 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-amber-300 hover:border-amber-400 transition-all">+ Thêm Kỹ Năng</button>
        </div>
    );
};