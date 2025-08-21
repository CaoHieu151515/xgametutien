
import React from 'react';
import { CharacterProfile } from '../types';
import { HealthBar, ManaBar } from './modal/tabs/shared/Common';
import { getDefaultAvatar } from '../utils/uiHelpers';

interface PlayerHUDProps {
    profile: CharacterProfile;
}

export const PlayerHUD: React.FC<PlayerHUDProps> = ({ profile }) => {
    const defaultAvatar = getDefaultAvatar(profile.gender);

    return (
        <div className="w-64 flex-shrink-0 p-3 bg-slate-900/70 backdrop-blur-sm border-2 border-amber-500/50 rounded-lg shadow-lg">
            <div className="flex items-center gap-4">
                <img 
                    src={profile.avatarUrl || defaultAvatar} 
                    alt="Player Avatar" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-600"
                    onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                />
                <div className="flex-grow min-w-0">
                    <h3 className="text-lg font-bold text-amber-300 truncate">{profile.name}</h3>
                    <p className="text-sm text-slate-300 truncate">{profile.realm}</p>
                </div>
            </div>
            <div className="mt-3 space-y-2">
                <HealthBar value={profile.health} maxValue={profile.maxHealth} />
                <ManaBar value={profile.mana} maxValue={profile.maxMana} />
            </div>
        </div>
    );
};
