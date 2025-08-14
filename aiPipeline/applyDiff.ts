import {
    StoryResponse, CharacterProfile, NPC, WorldSettings, StatusEffect, Skill,
    NewNPCFromAI, Item, ItemType, AppSettings, ApiProvider, Achievement, SkillType, LocationType
} from '../types';
import {
    processLevelUps, getRealmDisplayName, calculateBaseStatsForLevel,
    processSkillLevelUps, processNpcLevelUps, recalculateDerivedStats,
    getLevelFromRealmName, calculateExperienceForBreakthrough
} from '../services/progressionService';
import * as geminiService from '../services/geminiService';
import * as openaiService from '../services/openaiService';

const USE_DEFAULT_KEY_IDENTIFIER = '_USE_DEFAULT_KEY_';

interface ApplyDiffParams {
    storyResponse: StoryResponse;
    characterProfile: CharacterProfile;
    npcs: NPC[];
    worldSettings: WorldSettings;
    settings: AppSettings;
    choice: { durationInMinutes: number };
}

interface ApplyDiffResult {
    nextProfile: CharacterProfile;
    nextNpcs: NPC[];
    finalWorldSettings: WorldSettings;
    notifications: string[];
}

export const applyStoryResponseToState = async ({
    storyResponse,
    characterProfile,
    npcs,
    worldSettings,
    settings,
    choice
}: ApplyDiffParams): Promise<ApplyDiffResult> => {
    const response = storyResponse;
    const notifications: string[] = [];
    const api = settings.apiProvider === ApiProvider.OPENAI ? openaiService : geminiService;
    const apiKeyForService = settings.apiProvider === ApiProvider.OPENAI
        ? settings.openaiApiKey
        : (settings.gemini.useDefault
            ? USE_DEFAULT_KEY_IDENTIFIER
            : (settings.gemini.customKeys.find(k => k.id === settings.gemini.activeCustomKeyId)?.key || ''));

    let nextProfile: CharacterProfile = {
        ...characterProfile,
        items: characterProfile.items.map(i => ({ ...i, isNew: false })),
        skills: characterProfile.skills.map(s => ({ ...s, isNew: false })),
        achievements: (characterProfile.achievements || []).map(a => ({ ...a, isNew: false })),
        discoveredLocations: characterProfile.discoveredLocations.map(loc => ({ ...loc, isNew: false })),
        discoveredMonsters: characterProfile.discoveredMonsters.map(m => ({ ...m, isNew: false })),
        discoveredItems: (characterProfile.discoveredItems || []).map(i => ({ ...i, isNew: false })),
    };
    let nextNpcs: NPC[] = npcs.map(npc => ({ ...npc, isNew: false }));
    let finalWorldSettings: WorldSettings = {
        ...worldSettings,
        initialKnowledge: worldSettings.initialKnowledge.map(k => ({ ...k, isNew: false }))
    };

    if (response.updatedSkills?.length) {
        let tempSkills = [...nextProfile.skills];
        const skillUpdatePromises = response.updatedSkills.map(async (skillUpdate) => {
            const skillIndex = tempSkills.findIndex(s => s.name === skillUpdate.skillName);
            if (skillIndex !== -1) {
                const originalSkill = tempSkills[skillIndex];
                notifications.push(`💪 Kỹ năng "<b>${originalSkill.name}</b>" nhận được <b>${skillUpdate.gainedExperience} EXP</b>.`);

                const { updatedSkill, breakthroughInfo } = processSkillLevelUps(
                    originalSkill,
                    skillUpdate.gainedExperience,
                    finalWorldSettings.qualityTiers
                );

                tempSkills[skillIndex] = updatedSkill;

                if (breakthroughInfo) {
                    notifications.push(`🔥 **ĐỘT PHÁ!** Kỹ năng "<b>${originalSkill.name}</b>" đã đột phá từ <b>${breakthroughInfo.oldQuality}</b> lên <b>${breakthroughInfo.newQuality}</b>!`);

                    try {
                        const newDetails = await api.generateNewSkillDescription(updatedSkill, breakthroughInfo.newQuality, finalWorldSettings, apiKeyForService);
                        // This update needs to be applied carefully to avoid race conditions.
                        // We'll apply it to the `tempSkills` array directly.
                        tempSkills[skillIndex] = { ...updatedSkill, description: newDetails.description, effect: newDetails.effect };
                    } catch (err) {
                        console.error("Lỗi khi tạo mô tả kỹ năng mới:", err);
                    }
                }
            }
        });
        await Promise.all(skillUpdatePromises);
        nextProfile.skills = tempSkills;
    }

    // Process all other state changes...
    if (response.updatedStats?.currencyAmount !== undefined && response.updatedStats.currencyAmount !== characterProfile.currencyAmount) {
        const change = response.updatedStats.currencyAmount - characterProfile.currencyAmount;
        const currencyName = characterProfile.currencyName || 'tiền';
        if (change > 0) {
            notifications.push(`💰 Bạn nhận được <b>${change.toLocaleString()} ${currencyName}</b>.`);
        } else if (change < 0) {
            notifications.push(`💸 Bạn đã tiêu <b>${Math.abs(change).toLocaleString()} ${currencyName}</b>.`);
        }
    }

    if (response.removedItemIds?.length) {
        response.removedItemIds.forEach(itemId => {
            const removedItem = characterProfile.items.find(i => i.id === itemId);
            if (removedItem) {
                notifications.push(`🎒 Đã sử dụng <b>[${removedItem.quality}] ${removedItem.name}</b> (x${removedItem.quantity}).`);
            }
        });
    }
    if (response.updatedItems?.length) {
        response.updatedItems.forEach(update => {
            const originalItem = characterProfile.items.find(i => i.name === update.name);
            if (originalItem && update.quantity < originalItem.quantity) {
                const quantityUsed = originalItem.quantity - update.quantity;
                notifications.push(`🎒 Đã sử dụng <b>${quantityUsed} [${originalItem.quality}] ${originalItem.name}</b>.`);
            }
        });
    }

    response.newItems?.forEach(item => notifications.push(`✨ Bạn nhận được vật phẩm: <b>${item.name}</b> (x${item.quantity}).`));
    response.newSkills?.forEach(s => notifications.push(`📖 Bạn đã lĩnh ngộ kỹ năng mới: <b>${s.name}</b>.`));
    response.newLocations?.forEach(l => notifications.push(`🗺️ Bạn đã khám phá ra địa điểm mới: <b>${l.name}</b>.`));
    response.newNPCs?.forEach(n => notifications.push(`👥 Bạn đã gặp gỡ <b>${n.name}</b>.`));
    response.newMonsters?.forEach(m => notifications.push(`🐾 Bạn đã phát hiện ra sinh vật mới: <b>${m.name}</b>.`));

    if (response.newWorldKnowledge?.length) {
        const uniqueNewKnowledge = response.newWorldKnowledge.filter(
            newK => !finalWorldSettings.initialKnowledge.some(existing => existing.title.toLowerCase() === newK.title.toLowerCase())
        ).map(k => ({ ...k, isNew: true }));

        uniqueNewKnowledge.forEach(k => {
            if (k.category === 'Bang Phái') {
                notifications.push(`🌍 Bạn đã khám phá ra thế lực mới: <b>${k.title}</b>.`);
            } else {
                notifications.push(`🧠 Phát hiện tri thức mới: <b>${k.title}</b>.`);
            }
        });

        finalWorldSettings.initialKnowledge = [...finalWorldSettings.initialKnowledge, ...uniqueNewKnowledge];
    }

    if (response.newMonsters?.length) {
        const newDiscoveredMonsters = response.newMonsters
            .filter(newMonster => !nextProfile.discoveredMonsters.some(existing => existing.name === newMonster.name))
            .map(newMonster => ({
                id: `monster_${Date.now()}_${newMonster.name.replace(/\s+/g, '')}`,
                name: newMonster.name,
                description: newMonster.description,
                isNew: true,
            }));
        nextProfile.discoveredMonsters = [...nextProfile.discoveredMonsters, ...newDiscoveredMonsters];
    }

    if (response.updatedPlayerLocationId !== undefined && response.updatedPlayerLocationId !== characterProfile.currentLocationId) {
        let newLocName = 'Không Gian Hỗn Độn';
        if (response.updatedPlayerLocationId !== null) {
            const allKnownLocations = [...nextProfile.discoveredLocations, ...(response.newLocations || []), ...(response.updatedLocations || [])];
            const newLoc = allKnownLocations.find(l => l.id === response.updatedPlayerLocationId);
            if (newLoc) newLocName = newLoc.name;
        }
        notifications.push(`🚶 Bạn đã di chuyển đến <b>${newLocName}</b>.`);
    }

    if (response.newNPCs?.length) {
        const brandNewNpcs: NPC[] = response.newNPCs.map((newNpcData: NewNPCFromAI) => {
            const isValidPowerSystem = finalWorldSettings.powerSystems.some(ps => ps.name === newNpcData.powerSystem);
            const npcLevel = isValidPowerSystem ? newNpcData.level : 1;
            const npcPowerSystem = isValidPowerSystem
                ? newNpcData.powerSystem
                : (finalWorldSettings.powerSystems[0]?.name || '');

            const stats = calculateBaseStatsForLevel(npcLevel);

            const uniqueInitialEffects: StatusEffect[] = [];
            if (newNpcData.statusEffects) {
                const seenNames = new Set<string>();
                newNpcData.statusEffects.forEach(effect => {
                    if (!seenNames.has(effect.name)) {
                        uniqueInitialEffects.push(effect);
                        seenNames.add(effect.name);
                    }
                });
            }

            return {
                ...newNpcData,
                level: npcLevel,
                powerSystem: npcPowerSystem,
                experience: 0,
                health: stats.maxHealth,
                mana: stats.maxMana,
                realm: getRealmDisplayName(npcLevel, npcPowerSystem, finalWorldSettings),
                memories: [],
                npcRelationships: newNpcData.npcRelationships || [],
                statusEffects: uniqueInitialEffects,
                isDaoLu: newNpcData.isDaoLu || false,
                isNew: true,
            };
        });
        nextNpcs = [...nextNpcs, ...brandNewNpcs];
    }

    if (response.updatedNPCs?.length) {
        const npcsToUpdateMap = new Map(nextNpcs.map(n => [n.id, n]));
        response.updatedNPCs.forEach(update => {
            const existingNpc = npcsToUpdateMap.get(update.id);
            if (existingNpc) {
                let modifiedNpc = { ...existingNpc };

                 if (update.specialConstitution && update.specialConstitution.name !== existingNpc.specialConstitution?.name) {
                    notifications.push(`✨ Phát hiện thể chất đặc biệt trên <b>${existingNpc.name}</b>: <b>${update.specialConstitution.name}</b>.`);
                    modifiedNpc.specialConstitution = update.specialConstitution;
                }
                 if (update.innateTalent && update.innateTalent.name !== existingNpc.innateTalent?.name) {
                    notifications.push(`🌟 <b>${existingNpc.name}</b> đã thức tỉnh thiên phú: <b>${update.innateTalent.name}</b>.`);
                    modifiedNpc.innateTalent = update.innateTalent;
                }

                if (update.isDead === true) {
                    modifiedNpc.isDead = true;
                    modifiedNpc.locationId = null;
                    notifications.push(`💀 <b>${modifiedNpc.name}</b> đã tử vong.`);
                } else if (update.isDead === false && existingNpc.isDead) { // Revival logic
                    modifiedNpc.isDead = false;
                    const stats = calculateBaseStatsForLevel(modifiedNpc.level);
                    modifiedNpc.health = stats.maxHealth;
                    modifiedNpc.mana = stats.maxMana;
                    notifications.push(`✨ <b>${modifiedNpc.name}</b> đã được hồi sinh!`);
                }

                if (!modifiedNpc.isDead) {
                    if (update.breakthroughToRealm) {
                        const oldRealm = modifiedNpc.realm;
                        const targetLevel = getLevelFromRealmName(update.breakthroughToRealm, modifiedNpc.powerSystem, finalWorldSettings);
                        if (targetLevel > modifiedNpc.level) {
                            modifiedNpc.level = targetLevel;
                            modifiedNpc.experience = 0;

                            const newStats = calculateBaseStatsForLevel(targetLevel);
                            modifiedNpc.health = newStats.maxHealth;
                            modifiedNpc.mana = newStats.maxMana;
                            modifiedNpc.realm = getRealmDisplayName(targetLevel, modifiedNpc.powerSystem, finalWorldSettings);

                            notifications.push(`⚡️ **ĐỘT PHÁ!** <b>${modifiedNpc.name}</b> đã đột phá từ <b>${oldRealm}</b> lên cảnh giới <b>${modifiedNpc.realm}</b>.`);
                        }
                    } else if (update.gainedExperience) {
                        const oldLevel = modifiedNpc.level;
                        const oldRealm = modifiedNpc.realm;
                        modifiedNpc = processNpcLevelUps(modifiedNpc, update.gainedExperience, finalWorldSettings);
                        if (modifiedNpc.level > oldLevel) {
                            notifications.push(`✨ <b>${modifiedNpc.name}</b> đã đạt đến <b>cấp độ ${modifiedNpc.level}</b>!`);
                            if (modifiedNpc.realm !== oldRealm) {
                                notifications.push(`⚡️ **ĐỘT PHÁ!** <b>${modifiedNpc.name}</b> đã tiến vào cảnh giới <b>${modifiedNpc.realm}</b>.`);
                            }
                        }
                    }

                    if (update.isDaoLu && !existingNpc.isDaoLu) {
                        modifiedNpc.isDaoLu = true;
                        modifiedNpc.relationship = 1000;
                        notifications.push(`❤️ Bạn và <b>${modifiedNpc.name}</b> đã trở thành Đạo Lữ!`);
                    } else if (existingNpc.isDaoLu) {
                        modifiedNpc.relationship = 1000;
                    } else if (update.relationship !== undefined) {
                        const oldRelationship = existingNpc.relationship ?? 0;
                        const newRelationship = Math.max(-1000, Math.min(1000, oldRelationship + (update.relationship || 0) ));
                        modifiedNpc.relationship = newRelationship;
                        const change = newRelationship - oldRelationship;

                        if (change !== 0) {
                            const changeText = change > 0
                                ? `<span class='text-green-400'>tăng ${Math.round(change)}</span>`
                                : `<span class='text-red-400'>giảm ${Math.round(Math.abs(change))}</span>`;
                            notifications.push(`😊 Hảo cảm của <b>${modifiedNpc.name}</b> đã ${changeText} điểm (hiện tại: ${newRelationship}).`);
                        }
                    }

                    if (update.gender !== undefined && update.gender !== existingNpc.gender) {
                        modifiedNpc.gender = update.gender;
                        notifications.push(`🚻 Giới tính của <b>${modifiedNpc.name}</b> đã thay đổi thành <b>${update.gender === 'male' ? 'Nam' : 'Nữ'}</b>!`);
                    }
                    if (update.memories !== undefined) modifiedNpc.memories = update.memories;
                    if (update.health !== undefined) modifiedNpc.health = update.health;
                    if (update.mana !== undefined) modifiedNpc.mana = update.mana;
                    if (update.personality !== undefined) modifiedNpc.personality = update.personality;
                    if (update.description !== undefined) modifiedNpc.description = update.description;
                    if (update.locationId !== undefined) modifiedNpc.locationId = update.locationId;
                    if (update.aptitude !== undefined) modifiedNpc.aptitude = update.aptitude;
                    if (update.updatedNpcRelationships !== undefined) modifiedNpc.npcRelationships = update.updatedNpcRelationships || [];

                    let currentStatusEffects = modifiedNpc.statusEffects;
                    if (update.removedStatusEffects?.length) {
                        const effectsToRemove = new Set(update.removedStatusEffects);
                        const removedEffects = currentStatusEffects.filter(effect => effectsToRemove.has(effect.name));
                        removedEffects.forEach(effect => {
                            notifications.push(`🍃 Trạng thái "<b>${effect.name}</b>" của <b>${modifiedNpc.name}</b> đã kết thúc.`);
                        });
                        currentStatusEffects = currentStatusEffects.filter(effect => !effectsToRemove.has(effect.name));
                    }
                    if (update.newStatusEffects?.length) {
                        const existingEffectNames = new Set(currentStatusEffects.map(effect => effect.name));
                        update.newStatusEffects.forEach(effect => {
                            if (!existingEffectNames.has(effect.name)) {
                                notifications.push(`✨ <b>${modifiedNpc.name}</b> nhận được trạng thái: <b>${effect.name}</b>.`);
                                currentStatusEffects.push(effect);
                                existingEffectNames.add(effect.name);
                            } else {
                                notifications.push(`ℹ️ <b>${modifiedNpc.name}</b> đã có trạng thái "<b>${effect.name}</b>", không thể nhận thêm.`);
                            }
                        });
                    }
                    modifiedNpc.statusEffects = currentStatusEffects;
                }

                npcsToUpdateMap.set(update.id, modifiedNpc);
            }
        });
        nextNpcs = Array.from(npcsToUpdateMap.values());
    }

    let newItems = [...nextProfile.items];
    if (response.removedItemIds) {
        const idsToRemove = new Set(response.removedItemIds);
        newItems = newItems.filter(item => !idsToRemove.has(item.id));
    }
    if (response.updatedItems) {
        response.updatedItems.forEach(update => {
            const itemIndex = newItems.findIndex(i => i.name === update.name);
            if (itemIndex > -1) {
                newItems[itemIndex].quantity = update.quantity;
            }
        });
        newItems = newItems.filter(item => item.quantity > 0);
    }
    if (response.newItems) {
        response.newItems.forEach(newItem => {
            const existingItemIndex = newItems.findIndex(i => i.name === newItem.name);
            const isEquipment = newItem.type === ItemType.TRANG_BI || newItem.type === ItemType.DAC_THU;
            if (existingItemIndex > -1 && !isEquipment) {
                newItems[existingItemIndex].quantity += newItem.quantity;
                newItems[existingItemIndex].isNew = true;
            } else {
                newItems.push({ ...newItem, isNew: true });
            }
        });
    }
    nextProfile.items = newItems;

    if (response.newItems) {
        const existingDiscovered = nextProfile.discoveredItems || [];
        const discoveredNames = new Set(existingDiscovered.map(i => i.name));

        const newlyDiscovered = response.newItems
            .filter(newItem => !discoveredNames.has(newItem.name))
            .map(newItem => ({ ...newItem, isNew: true }));

        if (newlyDiscovered.length > 0) {
            nextProfile.discoveredItems = [...existingDiscovered, ...newlyDiscovered];
        }
    }

    if (response.newSkills?.length) {
        const newlyAcquiredSkills: Skill[] = response.newSkills.map((newSkillPart, index) => ({
            ...newSkillPart,
            id: `${Date.now()}-${index}`,
            level: 1,
            experience: 0,
            isNew: true,
        }));
        nextProfile.skills = [...nextProfile.skills, ...newlyAcquiredSkills];
    }

    if (response.newLocations?.length) {
        const existingLocationIds = new Set(nextProfile.discoveredLocations.map(l => l.id));
        const uniqueNewLocations = response.newLocations
            .filter(l => !existingLocationIds.has(l.id))
            .map(l => ({
                ...(l.ownerId === 'player' ? { ...l, ownerId: nextProfile.id } : l),
                isNew: true
            }));

        uniqueNewLocations.forEach(newLoc => {
            if (newLoc.ownerId === nextProfile.id) {
                notifications.push(`👑 Bây giờ bạn là chủ sở hữu của <b>${newLoc.name}</b>.`);
            }
        });

        nextProfile.discoveredLocations = [...nextProfile.discoveredLocations, ...uniqueNewLocations];
    }

    if (response.updatedLocations?.length) {
        const updatedLocationsWithPlayerId = response.updatedLocations.map(l =>
            l.ownerId === 'player' ? { ...l, ownerId: nextProfile.id } : l
        );
        const updatedLocationsMap = new Map(updatedLocationsWithPlayerId.map(l => [l.id, l]));

        nextProfile.discoveredLocations.forEach(oldLoc => {
            const updatedData = updatedLocationsMap.get(oldLoc.id);
            if (updatedData) {
                if (updatedData.ownerId === nextProfile.id && oldLoc.ownerId !== nextProfile.id) {
                    notifications.push(`👑 Bây giờ bạn là chủ sở hữu của <b>${updatedData.name}</b>.`);
                }
                // Check for world revival
                if (updatedData.isDestroyed === false && oldLoc.isDestroyed === true && oldLoc.type === LocationType.WORLD) {
                    notifications.push(`🌍 Thế Giới <b>${oldLoc.name}</b> đã được hồi sinh!`);
                }
            }
        });

        nextProfile.discoveredLocations = nextProfile.discoveredLocations.map(loc => {
            const updatedData = updatedLocationsMap.get(loc.id);
            if (updatedData) {
                return { ...loc, ...updatedData, isNew: loc.isNew };
            }
            return loc;
        });
    }

    if (response.updatedStats) {
        const stats = response.updatedStats;
        nextProfile.health = stats.health ?? nextProfile.health;
        nextProfile.mana = stats.mana ?? nextProfile.mana;
        nextProfile.currencyAmount = stats.currencyAmount ?? nextProfile.currencyAmount;

        let currentStatusEffects = nextProfile.statusEffects.filter(e => e.duration !== 'Trang bị');
        if (stats.removedStatusEffects?.length) {
            const effectsToRemove = new Set(stats.removedStatusEffects);
            const removedEffects = currentStatusEffects.filter(effect => effectsToRemove.has(effect.name));
            removedEffects.forEach(effect => {
                notifications.push(`🍃 Trạng thái "<b>${effect.name}</b>" của bạn đã kết thúc.`);
            });
            currentStatusEffects = currentStatusEffects.filter(effect => !effectsToRemove.has(effect.name));
        }
        if (stats.newStatusEffects?.length) {
            const existingEffectNames = new Set(currentStatusEffects.map(effect => effect.name));
            stats.newStatusEffects.forEach(effect => {
                if (!existingEffectNames.has(effect.name)) {
                    notifications.push(`✨ Bạn nhận được trạng thái: <b>${effect.name}</b>.`);
                    currentStatusEffects.push(effect);
                    existingEffectNames.add(effect.name);
                } else {
                    notifications.push(`ℹ️ Bạn đã có trạng thái "<b>${effect.name}</b>", không thể nhận thêm.`);
                }
            });
        }
        nextProfile.statusEffects = currentStatusEffects;

        if (stats.newAchievements?.length) {
            if (!nextProfile.achievements) {
                nextProfile.achievements = [];
            }
            const existingAchievementNames = new Set(nextProfile.achievements.map(a => a.name));
            stats.newAchievements.forEach(newAchievement => {
                if (!existingAchievementNames.has(newAchievement.name)) {
                    nextProfile.achievements.push({ ...newAchievement, isNew: true });
                    notifications.push(`🏆 Bạn đã đạt được thành tích mới: <b>${newAchievement.name}</b>!`);
                }
            });
        }

        if (stats.updatedAchievements?.length) {
            if (!nextProfile.achievements) {
                nextProfile.achievements = [];
            }
            stats.updatedAchievements.forEach(update => {
                const achievementIndex = nextProfile.achievements.findIndex(a => a.name === update.name);
                if (achievementIndex !== -1) {
                    const oldAchievement = nextProfile.achievements[achievementIndex];
                    const updatedAchievement = { ...oldAchievement, ...update, isNew: true };
                    nextProfile.achievements[achievementIndex] = updatedAchievement;
                    
                    if (update.tier && oldAchievement.tier !== update.tier) {
                         notifications.push(`🏆 Thành tích "<b>${update.name}</b>" đã được nâng cấp lên bậc <b>${update.tier}</b>!`);
                    } else {
                         notifications.push(`🏆 Thành tích "<b>${update.name}</b>" đã được cập nhật.`);
                    }
                } else {
                    // If AI tries to update a non-existent achievement, add it as a new one.
                    const newAchievement: Achievement = {
                        name: update.name,
                        description: update.description || 'Thành tích đã được cập nhật.',
                        tier: update.tier,
                        isNew: true,
                    };
                    nextProfile.achievements.push(newAchievement);
                    notifications.push(`🏆 Bạn đã đạt được thành tích mới: <b>${newAchievement.name}</b>!`);
                }
            });
        }
    }

    const gainedXpFromAI = response.updatedStats?.gainedExperience ?? 0;
    let finalGainedXp = 0;
    const breakthroughRealm = response.updatedStats?.breakthroughToRealm;

    if (breakthroughRealm) {
        const targetLevel = getLevelFromRealmName(breakthroughRealm, nextProfile.powerSystem, finalWorldSettings);
        if (targetLevel > nextProfile.level) {
            const xpForBreakthrough = calculateExperienceForBreakthrough(
                nextProfile.level,
                nextProfile.experience,
                targetLevel
            );
            finalGainedXp = gainedXpFromAI + xpForBreakthrough;
            notifications.push(`✨ **ĐỘT PHÁ THẦN TỐC!** Vận may ập đến, bạn nhận được một lượng lớn kinh nghiệm để đạt đến <b>${breakthroughRealm}</b>.`);
        }
    } else if (gainedXpFromAI > 0) {
        // Level Bonus: Càng cao cấp, nhận càng nhiều EXP.
        const levelBonus = 1 + (nextProfile.level / 50); // +2% EXP mỗi cấp
        
        // Cultivation Technique Bonus
        const cultivationSkills = nextProfile.skills.filter(s => s.type === SkillType.CULTIVATION);
        const qualityTiers = finalWorldSettings.qualityTiers.split(' - ').map(q => q.trim());
        let cultivationBonus = 1.0;
        
        cultivationSkills.forEach(skill => {
            const qualityIndex = qualityTiers.indexOf(skill.quality);
            if (qualityIndex !== -1) {
                // Mỗi công pháp tu luyện sẽ cộng thêm bonus dựa trên phẩm chất của nó
                // Phàm Phẩm (index 0) +0.1, Linh Phẩm (index 1) +0.2, ...
                cultivationBonus += (qualityIndex + 1) * 0.1;
            }
        });
        
        const adjustedXp = Math.max(1, Math.round(gainedXpFromAI * levelBonus * cultivationBonus));
        finalGainedXp = adjustedXp;
        
        const bonusDescriptions: string[] = [];
        if (levelBonus > 1.01) { // Only show bonus if it's significant
            bonusDescriptions.push(`nhờ Cấp độ ${nextProfile.level} (x${levelBonus.toFixed(2)})`);
        }
        if (cultivationBonus > 1.01) {
            bonusDescriptions.push(`nhờ Công pháp (x${cultivationBonus.toFixed(2)})`);
        }

        if (bonusDescriptions.length > 0) {
            notifications.push(`Bạn nhận được <b>${adjustedXp.toLocaleString()} EXP</b> (gốc: ${gainedXpFromAI.toLocaleString()}, ${bonusDescriptions.join(', ')}).`);
        } else {
             notifications.push(`Bạn nhận được <b>${adjustedXp.toLocaleString()} EXP</b>.`);
        }
    }

    if (finalGainedXp > 0) {
        const oldLevel = nextProfile.level;
        const oldRealm = nextProfile.realm;
        nextProfile = processLevelUps(nextProfile, finalGainedXp, finalWorldSettings);
        if (nextProfile.level > oldLevel) {
            notifications.push(`🎉 Chúc mừng! Bạn đã đạt đến <b>cấp độ ${nextProfile.level}</b>.`);
            if (nextProfile.realm !== oldRealm) {
                notifications.push(`⚡️ Đột phá! Bạn đã tiến vào cảnh giới <b>${nextProfile.realm}</b>.`);
            }
        }
    } else {
        nextProfile = recalculateDerivedStats(nextProfile);
    }


    if (response.updatedGender && response.updatedGender !== nextProfile.gender) {
        nextProfile.gender = response.updatedGender;
        notifications.push(`🚻 Giới tính của bạn đã thay đổi thành <b>${response.updatedGender === 'male' ? 'Nam' : 'Nữ'}</b>!`);
    }

    if (response.updatedPlayerLocationId !== undefined) {
        nextProfile.currentLocationId = response.updatedPlayerLocationId;
    }

    const oldDate = new Date(nextProfile.gameTime);
    let newDate: Date | null = null;

    if (response.updatedGameTime) {
        newDate = new Date(response.updatedGameTime);
        const timeDiffMs = newDate.getTime() - oldDate.getTime();

        if (timeDiffMs > 0) {
            const minutesPassed = timeDiffMs / (1000 * 60);
            const daysPassed = minutesPassed / (60 * 24);
            const yearsPassed = daysPassed / 365.25;

            let timeString = '';
            if (yearsPassed >= 1) {
                timeString = `<b>${Math.floor(yearsPassed)} năm</b> đã trôi qua.`;
            } else if (daysPassed >= 1) {
                timeString = `<b>${Math.floor(daysPassed)} ngày</b> đã trôi qua.`;
            } else {
                const hours = Math.floor(minutesPassed / 60);
                const minutes = Math.round(minutesPassed % 60);
                let durationStr = '';
                if (hours > 0) durationStr += `${hours} giờ `;
                if (minutes > 0) durationStr += `${minutes} phút`;
                timeString = `<b>${durationStr.trim()}</b> đã trôi qua.`;
            }
            notifications.push(`⏳ ${timeString}`);
        }
    } else if (choice.durationInMinutes > 0) {
        newDate = new Date(oldDate.getTime() + choice.durationInMinutes * 60 * 1000);

        const hours = Math.floor(choice.durationInMinutes / 60);
        const minutes = choice.durationInMinutes % 60;
        let timeString = '';
        if (hours > 0) timeString += `${hours} giờ `;
        if (minutes > 0) timeString += `${minutes} phút`;
        notifications.push(`⏳ Thời gian đã trôi qua: <b>${timeString.trim()}</b>.`);
    }

    if (newDate) {
        const yearsPassed = newDate.getFullYear() - oldDate.getFullYear();
        if (yearsPassed > 0) {
            nextProfile.lifespan -= yearsPassed;
        }
        nextProfile.gameTime = newDate.toISOString();
    }
    
    return {
        nextProfile,
        nextNpcs,
        finalWorldSettings,
        notifications
    };
};
