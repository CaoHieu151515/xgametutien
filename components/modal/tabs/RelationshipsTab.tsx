import React from 'react';
import { NPC, CharacterGender } from '../../../types';
import { NewBadge } from './shared/Common';
import { getRelationshipDisplay, getDefaultAvatar } from '../../../utils/uiHelpers';

interface RelationshipsTabProps {
    npcs: NPC[];
    displayName: string;
    playerId: string;
    playerGender: CharacterGender;
}

export const RelationshipsTab: React.FC<RelationshipsTabProps> = ({ npcs, displayName, playerId, playerGender }) => {
    const reverseRelationshipMap: Record<string, string> = {
        'Phụ thân': 'Con cái', 'Mẫu thân': 'Con cái',
        'Con cái': playerGender === CharacterGender.MALE ? 'Phụ thân' : 'Mẫu thân',
        'Phu quân': 'Thê tử', 'Thê tử': 'Phu quân',
        'Sư phụ': 'Đệ tử', 'Đệ tử': 'Sư phụ',
    };
    
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

                    const relationshipFromNpcToPlayer = npc.npcRelationships?.find(r => r.targetNpcId === playerId);
                    const relationshipTypeFromNpc = relationshipFromNpcToPlayer?.relationshipType;
                    const relationshipTypeFromPlayer = relationshipTypeFromNpc ? reverseRelationshipMap[relationshipTypeFromNpc] : undefined;


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
                                    {!npc.isDaoLu && relationshipTypeFromPlayer && (
                                        <span className="ml-2 text-xs text-cyan-300 bg-cyan-900/50 px-2 py-0.5 rounded-full">{relationshipTypeFromPlayer}</span>
                                    )}
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
