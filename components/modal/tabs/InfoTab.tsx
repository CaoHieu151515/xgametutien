
import React from 'react';
import { CharacterProfile } from '../../../types';

interface InfoTabProps {
    profile: CharacterProfile;
}

export const InfoTab: React.FC<InfoTabProps> = ({ profile }) => (
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
