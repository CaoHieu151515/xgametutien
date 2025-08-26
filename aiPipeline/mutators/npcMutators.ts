import { StoryResponse, NPC, WorldSettings, NewNPCFromAI, Skill, NPCUpdate, CharacterGender, NpcRelationship, CharacterProfile } from '../../types';
import { processNpcLevelUps, getLevelFromRealmName, calculateBaseStatsForLevel, getRealmDisplayName, processSkillLevelUps } from '../../services/progressionService';
import { log } from '../../services/logService';
import { findBestAvatar } from '../../services/avatarService';

const postProcessNewNpcs = async (
    newNpcs: NewNPCFromAI[],
    allExistingNpcs: NPC[],
    playerProfile: CharacterProfile,
    worldSettings: WorldSettings,
    api: any,
    apiKey: string,
    notifications: string[]
): Promise<{ processedNpcs: NewNPCFromAI[], updatesForExisting: NPCUpdate[] }> => {
    let updatesForExistingNpcs: NPCUpdate[] = [];
    const processedNpcs = [...newNpcs]; // Shallow copy of array, objects are references

    const playerEntity = {
        id: playerProfile.id,
        name: playerProfile.name,
        gender: playerProfile.gender,
        isPlayer: true
    };
    const allEntities = [...allExistingNpcs, playerEntity, ...processedNpcs];
    const allOtherNpcsForAvatar = [...allExistingNpcs, ...processedNpcs];

    for (let i = 0; i < processedNpcs.length; i++) {
        let completedNpc = processedNpcs[i]; // This is a reference to the object in the array

        if (!completedNpc.skills || completedNpc.skills.length === 0) {
            try {
                const generatedSkillsData: Omit<Skill, 'id' | 'experience' | 'level' | 'isNew'>[] = await api.generateNpcSkills(completedNpc, worldSettings, apiKey);
                const fullSkills: Skill[] = generatedSkillsData.map(s => ({ ...s, id: `npcskill_${completedNpc.id}_${Date.now()}_${s.name.replace(/\s+/g, '')}`, level: 1, experience: 0, isNew: true }));
                completedNpc.skills = fullSkills;
                notifications.push(`⚙️ Hệ thống đã tự động tạo kỹ năng cho <b>${completedNpc.name}</b>.`);
            } catch (err) {
                log('npcMutators.ts', `Failed to auto-generate skills for NPC ${completedNpc.name}: ${(err as Error).message}`, 'ERROR');
            }
        }

        if (!completedNpc.avatarUrl) {
            const avatarUrl = await findBestAvatar(completedNpc, allOtherNpcsForAvatar.filter(n => n.id !== completedNpc.id));
            if (avatarUrl) completedNpc.avatarUrl = avatarUrl;
        }
    }
    
    for (let i = 0; i < processedNpcs.length; i++) {
        let npcWithRelationships = processedNpcs[i];
        const textToScan = [npcWithRelationships.description, npcWithRelationships.specialConstitution?.description || ''].join(' ');
        
        const relationshipKeywords: { [key: string]: string } = {
            'con trai của': 'Phụ thân', 'con gái của': 'Mẫu thân',
            'phụ thân của': 'Con cái', 'mẫu thân của': 'Con cái',
            'vợ của': 'Phu quân', 'chồng của': 'Thê tử',
            'phu quân của': 'Thê tử', 'thê tử của': 'Phu quân',
            'sư phụ của': 'Đệ tử', 'đệ tử của': 'Sư phụ',
        };

        allEntities.forEach(targetEntity => {
            if (targetEntity.id === npcWithRelationships.id) return;

            const regex = new RegExp(`(con trai của|con gái của|phụ thân của|mẫu thân của|vợ của|chồng của|phu quân của|thê tử của|sư phụ của|đệ tử của)\\s+${targetEntity.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'iu');
            const match = textToScan.match(regex);

            if (match) {
                const role = match[1].toLowerCase();
                const relationshipType = relationshipKeywords[role];
                if (relationshipType) {
                    addTwoWayRelationship(npcWithRelationships, targetEntity, relationshipType, processedNpcs, updatesForExistingNpcs);
                }
            }
            
            const parentageRegex = new RegExp(`của\\s+${targetEntity.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+và\\s+([\\p{L}\\s]+)`, 'iu');
            const parentageMatch = textToScan.match(parentageRegex);
            if (parentageMatch) {
                const otherParentName = parentageMatch[1].trim();
                const otherParentEntity = allEntities.find(e => e.name === otherParentName);
                if (otherParentEntity) {
                     addTwoWayRelationship(npcWithRelationships, targetEntity, targetEntity.gender === 'male' ? 'Phụ thân' : 'Mẫu thân', processedNpcs, updatesForExistingNpcs);
                     addTwoWayRelationship(npcWithRelationships, otherParentEntity, otherParentEntity.gender === 'male' ? 'Phụ thân' : 'Mẫu thân', processedNpcs, updatesForExistingNpcs);
                }
            }
        });
    }

    return { processedNpcs, updatesForExisting: updatesForExistingNpcs };
};

const addTwoWayRelationship = (
    sourceNpc: NewNPCFromAI, 
    targetEntity: any, 
    relationshipTypeForTarget: string, 
    processedNewNpcs: NewNPCFromAI[], 
    updatesForExisting: NPCUpdate[]
) => {
    const reverseMap: Record<string, string> = {
        'Phụ thân': 'Con cái', 'Mẫu thân': 'Con cái',
        'Con cái': sourceNpc.gender === 'male' ? 'Phụ thân' : 'Mẫu thân',
        'Phu quân': 'Thê tử', 'Thê tử': 'Phu quân',
        'Sư phụ': 'Đệ tử', 'Đệ tử': 'Sư phụ',
    };
    const reverseType = reverseMap[relationshipTypeForTarget];
    if (!reverseType) return;

    if (!sourceNpc.npcRelationships) sourceNpc.npcRelationships = [];
    if (!sourceNpc.npcRelationships.some(r => r.targetNpcId === targetEntity.id)) {
        sourceNpc.npcRelationships.push({ targetNpcId: targetEntity.id, value: 950, relationshipType: relationshipTypeForTarget });
    }

    if (targetEntity.isPlayer) {
        (sourceNpc as any).relationship = 950;
        if (!(sourceNpc as any).memories) (sourceNpc as any).memories = [];
        (sourceNpc as any).memories.push(`Có mối quan hệ gia đình (${relationshipTypeForTarget}) với ${targetEntity.name}.`);
        return;
    }

    const newNpcIndex = processedNewNpcs.findIndex(n => n.id === targetEntity.id);
    if (newNpcIndex > -1) {
        const targetNpc = processedNewNpcs[newNpcIndex];
        if (!targetNpc.npcRelationships) targetNpc.npcRelationships = [];
        if (!targetNpc.npcRelationships.some(r => r.targetNpcId === sourceNpc.id)) {
            targetNpc.npcRelationships.push({ targetNpcId: sourceNpc.id, value: 950, relationshipType: reverseType });
        }
    } else {
        let update = updatesForExisting.find(u => u.id === targetEntity.id);
        if (!update) {
            update = { id: targetEntity.id, updatedNpcRelationships: [] };
            updatesForExisting.push(update);
        }
        if (!update.updatedNpcRelationships) update.updatedNpcRelationships = [];
        if (!update.updatedNpcRelationships.some(r => r.targetNpcId === sourceNpc.id)) {
            update.updatedNpcRelationships.push({ targetNpcId: sourceNpc.id, value: 950, relationshipType: reverseType });
        }
    }
};

const mergeNpcUpdates = (baseUpdates: NPCUpdate[], newUpdates: NPCUpdate[]): NPCUpdate[] => {
    const updatesMap = new Map<string, NPCUpdate>();
    const allUpdates = [...baseUpdates, ...newUpdates];

    for (const update of allUpdates) {
        const existing = updatesMap.get(update.id) || { id: update.id };
        
        // Manual merge to prevent undefined properties from overwriting existing data
        const merged: NPCUpdate = { ...existing };
        (Object.keys(update) as Array<keyof NPCUpdate>).forEach(key => {
            if (update[key] !== undefined) {
                // For non-array properties, the latest update wins
                if (!Array.isArray(update[key])) {
                     (merged as any)[key] = update[key];
                }
            }
        });

        // Combine array properties without duplicates
        merged.newMemories = [...new Set([...(existing.newMemories || []), ...(update.newMemories || [])])];
        merged.removedStatusEffects = [...new Set([...(existing.removedStatusEffects || []), ...(update.removedStatusEffects || [])])];

        // Combine and replace complex array properties based on a unique key
        const relsMap = new Map((existing.updatedNpcRelationships || []).map(r => [r.targetNpcId, r]));
        (update.updatedNpcRelationships || []).forEach(r => relsMap.set(r.targetNpcId, r));
        if (relsMap.size > 0) merged.updatedNpcRelationships = Array.from(relsMap.values());
        
        const skillsMap = new Map((existing.newlyLearnedSkills || []).map(s => [s.name, s]));
        (update.newlyLearnedSkills || []).forEach(s => skillsMap.set(s.name, s));
        if (skillsMap.size > 0) merged.newlyLearnedSkills = Array.from(skillsMap.values());
        
        const statusMap = new Map((existing.newStatusEffects || []).map(s => [s.name, s]));
        (update.newStatusEffects || []).forEach(s => statusMap.set(s.name, s));
        if (statusMap.size > 0) merged.newStatusEffects = Array.from(statusMap.values());
        
        const updatedSkillsMap = new Map((existing.updatedSkills || []).map(s => [s.skillName, s]));
        (update.updatedSkills || []).forEach(s => updatedSkillsMap.set(s.skillName, s));
        if (updatedSkillsMap.size > 0) merged.updatedSkills = Array.from(updatedSkillsMap.values());

        updatesMap.set(update.id, merged);
    }

    return Array.from(updatesMap.values());
};


interface ApplyNpcMutationsParams {
    response: StoryResponse;
    npcs: NPC[];
    worldSettings: WorldSettings;
    notifications: string[];
    api: any;
    apiKey: string;
    activeIdentityId: string | null;
    playerProfile: CharacterProfile; 
}

export const applyNpcMutations = async ({
    response,
    npcs,
    worldSettings,
    notifications,
    api,
    apiKey,
    activeIdentityId,
    playerProfile,
}: ApplyNpcMutationsParams): Promise<NPC[]> => {
    let nextNpcs = [...npcs];

    if (response.newNPCs?.length) {
        const { processedNpcs, updatesForExisting } = await postProcessNewNpcs(
            response.newNPCs,
            nextNpcs,
            playerProfile,
            worldSettings,
            api,
            apiKey,
            notifications
        );
        
        if (updatesForExisting.length > 0) {
            response.updatedNPCs = mergeNpcUpdates(response.updatedNPCs || [], updatesForExisting);
        }

        const brandNewNpcsData: NPC[] = processedNpcs.map((newNpcData: NewNPCFromAI) => {
            const powerSystemForNpc = worldSettings.powerSystems.find(ps => ps.name === newNpcData.powerSystem);
            const npcPowerSystem = powerSystemForNpc ? newNpcData.powerSystem : (worldSettings.powerSystems[0]?.name || '');
            const stats = calculateBaseStatsForLevel(newNpcData.level);
            if (newNpcData.gender) newNpcData.gender = newNpcData.gender.toLowerCase() as CharacterGender;
            return { 
                ...newNpcData, 
                powerSystem: npcPowerSystem, 
                experience: 0, 
                health: stats.maxHealth, 
                mana: stats.maxMana, 
                realm: getRealmDisplayName(newNpcData.level, npcPowerSystem, worldSettings), 
                relationship: (newNpcData as any).relationship,
                memories: (newNpcData as any).memories || [], 
                skills: newNpcData.skills || [], 
                npcRelationships: newNpcData.npcRelationships || [], 
                statusEffects: (Array.isArray(newNpcData.statusEffects) ? newNpcData.statusEffects : []), 
                isDaoLu: newNpcData.isDaoLu || false, 
                isNew: true 
            };
        });
        nextNpcs = [...nextNpcs, ...brandNewNpcsData];
    }

    if (response.updatedNPCs?.length) {
        for (const update of response.updatedNPCs) {
            const npcIndex = nextNpcs.findIndex(n => n.id === update.id);
            if (npcIndex !== -1) {
                let modifiedNpc = { ...nextNpcs[npcIndex] };
                const npcMaxStats = calculateBaseStatsForLevel(modifiedNpc.level);

                if (update.usedFullRestoreSkill) {
                    modifiedNpc.health = npcMaxStats.maxHealth;
                    modifiedNpc.mana = npcMaxStats.maxMana;
                    notifications.push(`✨ <b>${modifiedNpc.name}</b> đã khôi phục hoàn toàn Sinh Lực và Linh Lực!`);
                } else {
                    if (update.health !== undefined) {
                        let actualHealthChange = 0;
                        const change = String(update.health);
                        if (change.endsWith('%')) {
                            const percentage = parseFloat(change) / 100;
                            actualHealthChange = Math.round(npcMaxStats.maxHealth * percentage);
                        } else {
                            actualHealthChange = parseInt(change, 10) || 0;
                        }
                        modifiedNpc.health = Math.max(0, Math.min(npcMaxStats.maxHealth, modifiedNpc.health + actualHealthChange));
                    }
                    if (update.mana !== undefined) {
                        let actualManaChange = 0;
                        const change = String(update.mana);
                        if (change.endsWith('%')) {
                            const percentage = parseFloat(change) / 100;
                            actualManaChange = Math.round(npcMaxStats.maxMana * percentage);
                        } else {
                            actualManaChange = parseInt(change, 10) || 0;
                        }
                        modifiedNpc.mana = Math.max(0, Math.min(npcMaxStats.maxMana, modifiedNpc.mana + actualManaChange));
                    }
                }

                if (modifiedNpc.health <= 0) {
                    update.isDead = true;
                }

                if (update.isDead === true) {
                    modifiedNpc.isDead = true;
                    modifiedNpc.locationId = null;
                    notifications.push(`💀 <b>${modifiedNpc.name}</b> đã tử vong.`);
                } else {
                    if (update.breakthroughToRealm) {
                        const oldRealm = modifiedNpc.realm;
                        const targetLevel = getLevelFromRealmName(update.breakthroughToRealm, modifiedNpc.powerSystem, worldSettings);
                        if (targetLevel > modifiedNpc.level) {
                            modifiedNpc.level = targetLevel;
                            modifiedNpc.experience = 0;
                            const newStats = calculateBaseStatsForLevel(targetLevel);
                            modifiedNpc.health = newStats.maxHealth;
                            modifiedNpc.mana = newStats.maxMana;
                            modifiedNpc.realm = getRealmDisplayName(targetLevel, modifiedNpc.powerSystem, worldSettings);
                            notifications.push(`⚡️ **ĐỘT PHÁ!** <b>${modifiedNpc.name}</b> đã đột phá từ <b>${oldRealm}</b> lên cảnh giới <b>${modifiedNpc.realm}</b>.`);
                        }
                    } else if (update.gainedExperience) {
                        const oldLevel = modifiedNpc.level;
                        modifiedNpc = processNpcLevelUps(modifiedNpc, update.gainedExperience, worldSettings);
                        if (modifiedNpc.level > oldLevel) notifications.push(`✨ <b>${modifiedNpc.name}</b> đã đạt đến <b>cấp độ ${modifiedNpc.level}</b>!`);
                    }

                    if (update.relationship !== undefined && !activeIdentityId) {
                        const oldRel = modifiedNpc.relationship ?? 0;
                        const newRel = Math.max(-1000, Math.min(1000, oldRel + (update.relationship || 0)));
                        modifiedNpc.relationship = newRel;
                        if (newRel !== oldRel) notifications.push(`😊 Hảo cảm của <b>${modifiedNpc.name}</b> đã thay đổi ${newRel - oldRel} điểm (hiện tại: ${newRel}).`);
                    }
                    if (update.updatedNpcRelationships) {
                        let currentRelationships = [...(modifiedNpc.npcRelationships || [])];
                        update.updatedNpcRelationships.forEach(relUpdate => {
                            const existingRelIndex = currentRelationships.findIndex(r => r.targetNpcId === relUpdate.targetNpcId);
                            if (existingRelIndex > -1) {
                                currentRelationships[existingRelIndex].value = Math.max(-1000, Math.min(1000, (currentRelationships[existingRelIndex].value || 0) + (relUpdate.value || 0)));
                                if (relUpdate.relationshipType) currentRelationships[existingRelIndex].relationshipType = relUpdate.relationshipType;
                            } else {
                                currentRelationships.push({ targetNpcId: relUpdate.targetNpcId, value: Math.max(-1000, Math.min(1000, relUpdate.value || 0)), relationshipType: relUpdate.relationshipType, });
                            }
                        });
                        modifiedNpc.npcRelationships = currentRelationships;
                    }

                    if (update.newMemories?.length) modifiedNpc.memories = Array.from(new Set([...(modifiedNpc.memories || []), ...update.newMemories]));

                    Object.assign(modifiedNpc, {
                        locationId: update.locationId ?? modifiedNpc.locationId,
                        gender: (update.gender && (update.gender.toLowerCase() === 'male' || update.gender.toLowerCase() === 'female')) ? update.gender.toLowerCase() as CharacterGender : modifiedNpc.gender,
                        personality: update.personality ?? modifiedNpc.personality,
                        description: update.description ?? modifiedNpc.description,
                        ngoaiHinh: update.ngoaiHinh ?? modifiedNpc.ngoaiHinh,
                        aptitude: update.aptitude ?? modifiedNpc.aptitude,
                        specialConstitution: update.specialConstitution ?? modifiedNpc.specialConstitution,
                        innateTalent: update.innateTalent ?? modifiedNpc.innateTalent,
                        isDaoLu: update.isDaoLu !== undefined ? update.isDaoLu : modifiedNpc.isDaoLu
                    });
                }
                nextNpcs[npcIndex] = modifiedNpc;
            }
        }
    }

    return nextNpcs;
};