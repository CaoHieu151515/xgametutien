
import React from 'react';
import { CharacterProfile } from '../../../types';
import { HealthBar, ManaBar, ExperienceBar, NewBadge, statusStyles, getStatusEffectType } from './shared/Common';

interface StatsTabProps {
    profile: CharacterProfile;
}

export const StatsTab: React.FC<StatsTabProps> = ({ profile }) => {
    return (
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
};
