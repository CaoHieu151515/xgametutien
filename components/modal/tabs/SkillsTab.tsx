
import React from 'react';
import { CharacterProfile, WorldSettings, Skill } from '../../../types';
import { SkillExperienceBar, NewBadge } from './shared/Common';

interface SkillsTabProps {
    profile: CharacterProfile;
    worldSettings: WorldSettings;
}

export const SkillsTab: React.FC<SkillsTabProps> = ({ profile, worldSettings }) => {
    return (
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
};
