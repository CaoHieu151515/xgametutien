
import React from 'react';
import { CharacterProfile, Milestone } from '../../../types';
import { NewBadge } from './shared/Common';

interface MilestonesTabProps {
    profile: CharacterProfile;
}

export const MilestonesTab: React.FC<MilestonesTabProps> = ({ profile }) => {
    return (
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
};
