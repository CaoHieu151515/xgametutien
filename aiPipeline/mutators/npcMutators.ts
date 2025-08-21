import { StoryResponse, NPC, WorldSettings, NewNPCFromAI } from '../../types';
import { processNpcLevelUps, getLevelFromRealmName, calculateBaseStatsForLevel, getRealmDisplayName } from '../../services/progressionService';
import { findBestAvatar } from '../../services/avatarService';

interface ApplyNpcMutationsParams {
    response: StoryResponse;
    npcs: NPC[];
    worldSettings: WorldSettings;
    notifications: string[];
}

export const applyNpcMutations = async ({
    response,
    npcs,
    worldSettings,
    notifications,
}: ApplyNpcMutationsParams): Promise<NPC[]> => {
    let nextNpcs = [...npcs];

    // --- New NPCs ---
    if (response.newNPCs?.length) {
        // Find avatars for all new NPCs concurrently
        const avatarUpdatePromises = response.newNPCs.map(async (newNpc) => {
            if (!newNpc.avatarUrl) {
                const allOtherNpcs = [...nextNpcs, ...response.newNPCs!].filter(n => n.id !== newNpc.id);
                const avatarUrl = await findBestAvatar(newNpc, allOtherNpcs);
                if (avatarUrl) return { ...newNpc, avatarUrl };
            }
            return newNpc;
        });
        const npcsWithAvatars = await Promise.all(avatarUpdatePromises);

        const brandNewNpcsData: NPC[] = npcsWithAvatars
            .filter((npcData): npcData is NewNPCFromAI => npcData !== null && typeof npcData === 'object')
            .map((newNpcData: NewNPCFromAI) => {
                const powerSystemForNpc = worldSettings.powerSystems.find(ps => ps.name === newNpcData.powerSystem);
                const isValidPowerSystem = !!powerSystemForNpc;
                const npcPowerSystem = isValidPowerSystem ? newNpcData.powerSystem : (worldSettings.powerSystems[0]?.name || '');
                const stats = calculateBaseStatsForLevel(newNpcData.level);

                return {
                    ...newNpcData,
                    experience: 0,
                    health: stats.maxHealth,
                    mana: stats.maxMana,
                    realm: getRealmDisplayName(newNpcData.level, npcPowerSystem, worldSettings),
                    memories: [],
                    npcRelationships: newNpcData.npcRelationships || [],
                    statusEffects: (Array.isArray(newNpcData.statusEffects) ? newNpcData.statusEffects : []),
                    isDaoLu: newNpcData.isDaoLu || false,
                    isNew: true
                };
            });
        nextNpcs = [...nextNpcs, ...brandNewNpcsData];
    }

    // --- Updated NPCs ---
    if (response.updatedNPCs?.length) {
        response.updatedNPCs.forEach(update => {
            const npcIndex = nextNpcs.findIndex(n => n.id === update.id);
            if (npcIndex !== -1) {
                let modifiedNpc = { ...nextNpcs[npcIndex] };
                const npcMaxStats = calculateBaseStatsForLevel(modifiedNpc.level);
                
                // Handle full restoration first as it's an absolute state change.
                if (update.usedFullRestoreSkill) {
                    modifiedNpc.health = npcMaxStats.maxHealth;
                    modifiedNpc.mana = npcMaxStats.maxMana;
                    notifications.push(`✨ <b>${modifiedNpc.name}</b> đã khôi phục hoàn toàn Sinh Lực và Linh Lực!`);
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

                    // Health & Mana updates are skipped if full restoration happened.
                    if (!update.usedFullRestoreSkill) {
                        const healthChangeInput = update.health;
                        if (healthChangeInput) {
                            let actualHealthChange = 0;
                            if (typeof healthChangeInput === 'string' && healthChangeInput.endsWith('%')) {
                                const percentage = parseFloat(healthChangeInput) / 100;
                                actualHealthChange = Math.round(npcMaxStats.maxHealth * percentage);
                            } else if (typeof healthChangeInput === 'number') {
                                actualHealthChange = healthChangeInput;
                            }
                            modifiedNpc.health += actualHealthChange;
                            if (actualHealthChange > 0) notifications.push(`💚 <b>${modifiedNpc.name}</b> hồi phục <b>${actualHealthChange.toLocaleString()} Sinh Lực</b>.`);
                            else if (actualHealthChange < 0) notifications.push(`🩸 <b>${modifiedNpc.name}</b> mất <b>${Math.abs(actualHealthChange).toLocaleString()} Sinh Lực</b>.`);
                        }

                        const manaChangeInput = update.mana;
                        if (manaChangeInput) {
                            let actualManaChange = 0;
                            if (typeof manaChangeInput === 'string' && manaChangeInput.endsWith('%')) {
                                const percentage = parseFloat(manaChangeInput) / 100;
                                actualManaChange = Math.round(npcMaxStats.maxMana * percentage);
                            } else if (typeof manaChangeInput === 'number') {
                                actualManaChange = manaChangeInput;
                            }
                            modifiedNpc.mana += actualManaChange;
                            if (actualManaChange > 0) notifications.push(`💧 <b>${modifiedNpc.name}</b> hồi phục <b>${actualManaChange.toLocaleString()} Linh Lực</b>.`);
                            else if (actualManaChange < 0) notifications.push(`💧 <b>${modifiedNpc.name}</b> tiêu hao <b>${Math.abs(actualManaChange).toLocaleString()} Linh Lực</b>.`);
                        }
                    }
                    
                    modifiedNpc.health = Math.max(0, Math.min(npcMaxStats.maxHealth, modifiedNpc.health));
                    modifiedNpc.mana = Math.max(0, Math.min(npcMaxStats.maxMana, modifiedNpc.mana));


                    if (update.isDaoLu && !modifiedNpc.isDaoLu) {
                        modifiedNpc.isDaoLu = true;
                        modifiedNpc.relationship = 1000;
                        notifications.push(`❤️ Bạn và <b>${modifiedNpc.name}</b> đã trở thành Đạo Lữ!`);
                    } else if (update.relationship !== undefined) {
                        const oldRel = modifiedNpc.relationship ?? 0;
                        const newRel = Math.max(-1000, Math.min(1000, oldRel + (update.relationship || 0)));
                        modifiedNpc.relationship = newRel;
                        if(newRel !== oldRel) notifications.push(`😊 Hảo cảm của <b>${modifiedNpc.name}</b> đã thay đổi ${newRel - oldRel} điểm (hiện tại: ${newRel}).`);
                    }

                    if (update.newMemories?.length) modifiedNpc.memories = Array.from(new Set([...(modifiedNpc.memories || []), ...update.newMemories]));
                    
                    let currentStatusEffects = [...(modifiedNpc.statusEffects || [])];
                    if (update.removedStatusEffects?.length) {
                        const toRemove = new Set(update.removedStatusEffects);
                        currentStatusEffects.filter(e => toRemove.has(e.name))
                            .forEach(e => notifications.push(`🍃 Trạng thái "<b>${e.name}</b>" của <b>${modifiedNpc.name}</b> đã kết thúc.`));
                        currentStatusEffects = currentStatusEffects.filter(e => !toRemove.has(e.name));
                    }
                    if (update.newStatusEffects?.length) {
                        update.newStatusEffects.forEach(newEffect => {
                            const existingIndex = currentStatusEffects.findIndex(e => e.name === newEffect.name);
                            if (existingIndex !== -1) {
                                notifications.push(`ℹ️ Trạng thái "<b>${newEffect.name}</b>" của <b>${modifiedNpc.name}</b> đã được làm mới.`);
                                currentStatusEffects[existingIndex] = newEffect;
                            } else {
                                notifications.push(`✨ <b>${modifiedNpc.name}</b> nhận được trạng thái: <b>${newEffect.name}</b>.`);
                                currentStatusEffects.push(newEffect);
                            }
                        });
                    }
                    modifiedNpc.statusEffects = currentStatusEffects;

                    // Apply other direct updates
                    Object.assign(modifiedNpc, {
                        locationId: update.locationId ?? modifiedNpc.locationId,
                        gender: update.gender ?? modifiedNpc.gender,
                        personality: update.personality ?? modifiedNpc.personality,
                        description: update.description ?? modifiedNpc.description,
                        ngoaiHinh: update.ngoaiHinh ?? modifiedNpc.ngoaiHinh,
                        aptitude: update.aptitude ?? modifiedNpc.aptitude,
                        npcRelationships: update.updatedNpcRelationships ?? modifiedNpc.npcRelationships,
                        specialConstitution: update.specialConstitution ?? modifiedNpc.specialConstitution,
                        innateTalent: update.innateTalent ?? modifiedNpc.innateTalent,
                    });
                }
                nextNpcs[npcIndex] = modifiedNpc;
            }
        });
    }

    return nextNpcs;
};