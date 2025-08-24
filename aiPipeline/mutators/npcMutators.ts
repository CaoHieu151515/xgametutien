import { StoryResponse, NPC, WorldSettings, NewNPCFromAI, Skill, SkillUpdate, CharacterGender } from '../../types';
import { processNpcLevelUps, getLevelFromRealmName, calculateBaseStatsForLevel, getRealmDisplayName, processSkillLevelUps } from '../../services/progressionService';
import { findBestAvatar } from '../../services/avatarService';
import { log } from '../../services/logService';

/**
 * Xử lý hậu kỳ danh sách NPC mới để sửa lỗi logic của AI và tự động suy luận các mối quan hệ.
 * 1. Sửa lại họ của NPC cho khớp với mô tả (ví dụ: mô tả "tiểu thư Vương gia" nhưng tên là "Lý Thanh Ca" -> sửa thành "Vương Thanh Ca").
 * 2. Tự động tạo mối quan hệ hai chiều (vợ chồng, cha con, v.v.) dựa trên họ và chức danh.
 * @param newNpcs Mảng các NPC mới từ AI.
 * @returns Mảng NPC đã được xử lý.
 */
const postProcessNewNpcs = (newNpcs: NewNPCFromAI[]): NewNPCFromAI[] => {
    // Deep copy để tránh ảnh hưởng đến đối tượng gốc
    let processedNpcs: NewNPCFromAI[] = JSON.parse(JSON.stringify(newNpcs));

    // BƯỚC 1: Sửa lại họ không nhất quán dựa trên mô tả
    const familyNameRegex = /(?<surname>\p{Lu}\p{L}+)\s*(gia|phủ)/u;
    processedNpcs.forEach(npc => {
        const descriptionMatch = npc.description.match(familyNameRegex);
        if (descriptionMatch?.groups?.surname) {
            const surnameFromDesc = descriptionMatch.groups.surname;
            const nameParts = npc.name.split(' ');
            const surnameFromName = nameParts[0];

            if (surnameFromName !== surnameFromDesc) {
                const oldName = npc.name;
                const newName = `${surnameFromDesc} ${nameParts.slice(1).join(' ')}`;
                npc.name = newName;
                log('npcMutators.ts', `Hậu xử lý: Đã sửa tên NPC từ "${oldName}" thành "${newName}" dựa trên mô tả.`, 'INFO');
            }
        }
    });

    // BƯỚC 2: Suy luận và thêm mối quan hệ gia đình hai chiều
    const familyTitleMap: { [title: string]: string } = {
        'Lão Gia': 'father',
        'Phu Nhân': 'mother',
        'Công Tử': 'son',
        'Thiếu Gia': 'son',
        'Tiểu Thư': 'daughter',
    };

    const npcInfo: Map<string, { surname: string; role: string; npc: NewNPCFromAI }> = new Map();
    processedNpcs.forEach(npc => {
        const nameParts = npc.name.split(' ');
        const surname = nameParts[0];
        const restOfName = nameParts.slice(1).join(' ');

        for (const title in familyTitleMap) {
            if (restOfName.includes(title)) {
                npcInfo.set(npc.id, { surname, role: familyTitleMap[title], npc });
                break;
            }
        }
    });

    if (npcInfo.size > 1) {
        const infoArray = Array.from(npcInfo.values());
        for (let i = 0; i < infoArray.length; i++) {
            for (let j = i + 1; j < infoArray.length; j++) {
                const info1 = infoArray[i];
                const info2 = infoArray[j];

                if (info1.surname !== info2.surname) continue;

                const addRelationship = (npcSource: NewNPCFromAI, npcTarget: NewNPCFromAI, type: string, value: number = 950) => {
                    npcSource.npcRelationships = npcSource.npcRelationships || [];
                    if (!npcSource.npcRelationships.some(r => r.targetNpcId === npcTarget.id)) {
                        npcSource.npcRelationships.push({ targetNpcId: npcTarget.id, value, relationshipType: type });
                    }
                };

                const roles = [info1.role, info2.role].sort();
                
                // Vợ chồng
                if (roles[0] === 'father' && roles[1] === 'mother') {
                    addRelationship(info1.npc, info2.npc, 'Phu Thê', 1000);
                    addRelationship(info2.npc, info1.npc, 'Phu Thê', 1000);
                } 
                // Cha/Mẹ & Con
                else if (roles.includes('father') && roles.includes('daughter')) {
                    const father = info1.role === 'father' ? info1.npc : info2.npc;
                    const daughter = info1.role === 'daughter' ? info1.npc : info2.npc;
                    addRelationship(father, daughter, 'Con gái');
                    addRelationship(daughter, father, 'Phụ thân');
                } else if (roles.includes('father') && roles.includes('son')) {
                    const father = info1.role === 'father' ? info1.npc : info2.npc;
                    const son = info1.role === 'son' ? info1.npc : info2.npc;
                    addRelationship(father, son, 'Con trai');
                    addRelationship(son, father, 'Phụ thân');
                } else if (roles.includes('mother') && roles.includes('daughter')) {
                    const mother = info1.role === 'mother' ? info1.npc : info2.npc;
                    const daughter = info1.role === 'daughter' ? info1.npc : info2.npc;
                    addRelationship(mother, daughter, 'Con gái');
                    addRelationship(daughter, mother, 'Mẫu thân');
                } else if (roles.includes('mother') && roles.includes('son')) {
                    const mother = info1.role === 'mother' ? info1.npc : info2.npc;
                    const son = info1.role === 'son' ? info1.npc : info2.npc;
                    addRelationship(mother, son, 'Con trai');
                    addRelationship(son, mother, 'Mẫu thân');
                }
                // Anh chị em
                else if (roles.includes('son') && roles.includes('daughter')) {
                    addRelationship(info1.npc, info2.npc, 'Huynh muội/Tỷ đệ');
                    addRelationship(info2.npc, info1.npc, 'Huynh muội/Tỷ đệ');
                } else if (roles[0] === 'son' && roles[1] === 'son') {
                    addRelationship(info1.npc, info2.npc, 'Huynh đệ');
                    addRelationship(info2.npc, info1.npc, 'Huynh đệ');
                } else if (roles[0] === 'daughter' && roles[1] === 'daughter') {
                    addRelationship(info1.npc, info2.npc, 'Tỷ muội');
                    addRelationship(info2.npc, info1.npc, 'Tỷ muội');
                }
            }
        }
    }

    return processedNpcs;
};


interface ApplyNpcMutationsParams {
    response: StoryResponse;
    npcs: NPC[];
    worldSettings: WorldSettings;
    notifications: string[];
    api: any;
    apiKey: string;
}

export const applyNpcMutations = async ({
    response,
    npcs,
    worldSettings,
    notifications,
    api,
    apiKey,
}: ApplyNpcMutationsParams): Promise<NPC[]> => {
    let nextNpcs = [...npcs];
    let newNpcIds = new Set<string>();

    // --- New NPCs ---
    if (response.newNPCs?.length) {
        // Step 1: Auto-generate skills for any new NPC that doesn't have them.
        const skillGenerationPromises = response.newNPCs.map(async (newNpc) => {
            if (!newNpc.skills || newNpc.skills.length === 0) {
                try {
                    const generatedSkillsData: Omit<Skill, 'id' | 'experience' | 'level' | 'isNew'>[] = await api.generateNpcSkills(newNpc, worldSettings, apiKey);
                    
                    const fullSkills: Skill[] = generatedSkillsData.map(s => ({
                        ...s,
                        id: `npcskill_${newNpc.id}_${Date.now()}_${s.name.replace(/\s+/g, '')}`,
                        level: 1,
                        experience: 0,
                        isNew: true, // Mark as new for UI highlight
                    }));

                    notifications.push(`⚙️ Hệ thống đã tự động tạo kỹ năng cho <b>${newNpc.name}</b>.`);
                    return { ...newNpc, skills: fullSkills };
                } catch (err) {
                    log('npcMutators.ts', `Failed to auto-generate skills for NPC ${newNpc.name}: ${(err as Error).message}`, 'ERROR');
                    notifications.push(`⚠️ Không thể tự động tạo kỹ năng cho <b>${newNpc.name}</b>.`);
                    return newNpc; // Return the NPC without skills if generation fails
                }
            }
            return newNpc;
        });
        const npcsWithSkills = await Promise.all(skillGenerationPromises);

        // Step 2: Find avatars for all new NPCs concurrently
        const avatarUpdatePromises = npcsWithSkills.map(async (newNpc) => {
            if (!newNpc.avatarUrl) {
                const allOtherNpcs = [...nextNpcs, ...npcsWithSkills].filter(n => n.id !== newNpc.id);
                const avatarUrl = await findBestAvatar(newNpc, allOtherNpcs);
                if (avatarUrl) return { ...newNpc, avatarUrl };
            }
            return newNpc;
        });
        const npcsWithAvatars = await Promise.all(avatarUpdatePromises);
        
        // Step 3: Post-process for name correction and relationship inference
        const postProcessedNpcsData = postProcessNewNpcs(npcsWithAvatars);
        
        const brandNewNpcsData: NPC[] = postProcessedNpcsData
            .filter((npcData): npcData is NewNPCFromAI => npcData !== null && typeof npcData === 'object')
            .map((newNpcData: NewNPCFromAI) => {
                newNpcIds.add(newNpcData.id); // Track newly created NPC IDs
                const powerSystemForNpc = worldSettings.powerSystems.find(ps => ps.name === newNpcData.powerSystem);
                const isValidPowerSystem = !!powerSystemForNpc;
                const npcPowerSystem = isValidPowerSystem ? newNpcData.powerSystem : (worldSettings.powerSystems[0]?.name || '');
                const stats = calculateBaseStatsForLevel(newNpcData.level);

                // FIX: Normalize gender for new NPCs during gameplay to prevent case-sensitivity issues.
                if (newNpcData.gender) {
                    newNpcData.gender = newNpcData.gender.toLowerCase() as CharacterGender;
                }

                return {
                    ...newNpcData,
                    powerSystem: npcPowerSystem,
                    experience: 0,
                    health: stats.maxHealth,
                    mana: stats.maxMana,
                    realm: getRealmDisplayName(newNpcData.level, npcPowerSystem, worldSettings),
                    memories: [],
                    skills: newNpcData.skills || [],
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
        // *** BUG FIX ***: Filter out updates for NPCs that were just created in this turn.
        const updatesForExistingNpcs = response.updatedNPCs.filter(update => {
            if (newNpcIds.has(update.id)) {
                log('npcMutators.ts', `Skipping update for newly created NPC to prevent conflicts: ${update.id}`, 'INFO');
                return false;
            }
            return true;
        });

        for (const update of updatesForExistingNpcs) {
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
                        const toRemoveNames = update.removedStatusEffects.map(name => name.toLowerCase());
                        const effectsBeingRemoved = currentStatusEffects.filter(effect => 
                            toRemoveNames.some(removeName => effect.name.toLowerCase().startsWith(removeName))
                        );
                        effectsBeingRemoved.forEach(e => notifications.push(`🍃 Trạng thái "<b>${e.name}</b>" của <b>${modifiedNpc.name}</b> đã kết thúc.`));
                        currentStatusEffects = currentStatusEffects.filter(effect => 
                            !toRemoveNames.some(removeName => effect.name.toLowerCase().startsWith(removeName))
                        );
                    }
                    if (update.newStatusEffects?.length) {
                        update.newStatusEffects.forEach(newEffect => {
                            const isPregnancyEffect = newEffect.name.startsWith('Mang Thai');
                            const existingIndex = currentStatusEffects.findIndex(e =>
                                isPregnancyEffect ? e.name.startsWith('Mang Thai') : e.name === newEffect.name
                            );
                    
                            if (existingIndex !== -1) {
                                notifications.push(`ℹ️ Trạng thái "<b>${currentStatusEffects[existingIndex].name}</b>" của <b>${modifiedNpc.name}</b> đã được cập nhật thành "<b>${newEffect.name}</b>".`);
                                currentStatusEffects[existingIndex] = newEffect;
                            } else {
                                notifications.push(`✨ <b>${modifiedNpc.name}</b> nhận được trạng thái: <b>${newEffect.name}</b>.`);
                                currentStatusEffects.push(newEffect);
                            }
                        });
                    }
                    modifiedNpc.statusEffects = currentStatusEffects;

                    // NPC Skill Progression
                    if(update.updatedSkills) {
                        const currentSkills = [...modifiedNpc.skills];
                        for(const skillUpdate of update.updatedSkills) {
                            const skillIndex = currentSkills.findIndex(s => s.name === skillUpdate.skillName);
                            if (skillIndex > -1) {
                                const originalSkill = currentSkills[skillIndex];
                                const { updatedSkill, breakthroughInfo } = processSkillLevelUps(originalSkill, skillUpdate.gainedExperience, worldSettings.qualityTiers);
                                currentSkills[skillIndex] = updatedSkill;
                                if(updatedSkill.level > originalSkill.level) {
                                    notifications.push(`💪 Kỹ năng "<b>${originalSkill.name}</b>" của <b>${modifiedNpc.name}</b> đã tăng lên cấp ${updatedSkill.level}.`);
                                }
                                if (breakthroughInfo) {
                                     notifications.push(`🔥 **ĐỘT PHÁ!** Kỹ năng "<b>${originalSkill.name}</b>" của <b>${modifiedNpc.name}</b> đã đột phá từ <b>${breakthroughInfo.oldQuality}</b> lên <b>${breakthroughInfo.newQuality}</b>!`);
                                }
                            }
                        }
                        modifiedNpc.skills = currentSkills;
                    }

                    if(update.newlyLearnedSkills) {
                        let currentSkills = [...modifiedNpc.skills];
                        for(const newSkill of update.newlyLearnedSkills) {
                            const existingSkillIndex = currentSkills.findIndex(s => s.type === newSkill.type);
                            const finalNewSkill = { ...newSkill, id: `npcskill_${modifiedNpc.id}_${Date.now()}`, isNew: true };
                            if (existingSkillIndex > -1) {
                                notifications.push(`📖 <b>${modifiedNpc.name}</b> đã thay thế kỹ năng "<b>${currentSkills[existingSkillIndex].name}</b>" bằng kỹ năng mới: <b>${finalNewSkill.name}</b>!`);
                                currentSkills[existingSkillIndex] = finalNewSkill;
                            } else {
                                notifications.push(`📖 <b>${modifiedNpc.name}</b> đã học được kỹ năng mới: <b>${finalNewSkill.name}</b>!`);
                                currentSkills.push(finalNewSkill);
                            }
                        }
                        modifiedNpc.skills = currentSkills;
                    }

                    // Apply other direct updates
                    Object.assign(modifiedNpc, {
                        locationId: update.locationId ?? modifiedNpc.locationId,
                        gender: (update.gender && (update.gender.toLowerCase() === 'male' || update.gender.toLowerCase() === 'female')) 
                            ? update.gender.toLowerCase() as CharacterGender 
                            : modifiedNpc.gender,
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
        }
    }

    return nextNpcs;
};
