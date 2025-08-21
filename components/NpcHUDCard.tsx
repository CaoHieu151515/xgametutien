
import React from 'react';
import { NPC } from '../types';
import { HealthBar, ManaBar, NewBadge } from './modal/tabs/shared/Common';
import { getDefaultAvatar } from '../utils/uiHelpers';
import { calculateBaseStatsForLevel } from '../services/progressionService';

interface NpcHUDCardProps {
    npc: NPC;
}

export const NpcHUDCard: React.FC<NpcHUDCardProps> = ({ npc }) => {
    const defaultAvatar = getDefaultAvatar(npc.gender);
    const maxStats = calculateBaseStatsForLevel(npc.level);

    return (
        <div className="w-64 flex-shrink-0 p-3 bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-lg relative">
            <div className="flex items-center gap-4">
                <img
                    src={npc.avatarUrl || defaultAvatar}
                    alt={`${npc.name}'s Avatar`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-600"
                    onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                />
                <div className="flex-grow min-w-0">
                    <h3 className="text-lg font-bold text-slate-200 truncate flex items-center">
                        {npc.name}
                        {npc.isNew && <NewBadge />}
                    </h3>
                    <p className="text-sm text-slate-400 truncate">{npc.realm}</p>
                </div>
            </div>
            <div className="mt-3 space-y-2">
                <HealthBar value={npc.health} maxValue={maxStats.maxHealth} />
                <ManaBar value={npc.mana} maxValue={maxStats.maxMana} />
            </div>
        </div>
    );
};
