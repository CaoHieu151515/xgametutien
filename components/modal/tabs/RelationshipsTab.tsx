import React from 'react';
import { NPC } from '../../../types';
import { NewBadge } from './shared/Common';
import { getRelationshipDisplay, getDefaultAvatar } from '../../../utils/uiHelpers';

interface RelationshipsTabProps {
    npcs: NPC[];
    displayName: string;
}

export const RelationshipsTab: React.FC<RelationshipsTabProps> = ({ npcs, displayName }) => {
    return (
        <div className="space-y-3">
             <h3 className="text-xl font-bold text-amber-300 border-b border-slate-700 pb-2 mb-4">Mối quan hệ của: <span className="text-white">{displayName}</span></h3>
             {npcs.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-slate-500">Chưa gặp gỡ nhân vật nào.</p>
                </div>
            ) : (
                npcs.map((npc) => {
                    const relationship = getRelationshipDisplay(npc.isDaoLu ? 1000 : npc.relationship);
                    const relationshipValue = npc.isDaoLu ? 1000 : (npc.relationship !== undefined ? npc.relationship : '???');
                    const defaultNpcAvatar = getDefaultAvatar(npc.gender);

                    return (
                        <div key={npc.id} className="flex items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                            <img 
                                src={npc.avatarUrl || defaultNpcAvatar}
                                alt={npc.name}
                                className="w-12 h-12 rounded-full object-cover mr-4"
                                onError={(e) => { e.currentTarget.src = defaultNpcAvatar; }}
                            />
                            <div className="flex-grow">
                                <p className="font-bold text-slate-200 flex items-center">
                                    {npc.name}
                                    {npc.isDaoLu && <span className="ml-2 text-xs text-pink-300 bg-pink-900/50 px-2 py-0.5 rounded-full">❤️ Đạo lữ</span>}
                                    {npc.isNew && <NewBadge />}
                                </p>
                                <p className="text-sm text-slate-400">{npc.realm}</p>
                            </div>
                            <div className="text-right">
                                <p className={`font-semibold text-lg ${relationship.color}`}>{relationship.text}</p>
                                <p className="text-sm text-slate-500">{relationshipValue}</p>
                            </div>
                        </div>
                    )
                })
            )}
        </div>
    );
};