import {
    StoryResponse, CharacterProfile, NPC, WorldSettings, StatusEffect, Skill,
    NewNPCFromAI, Item, ItemType, AppSettings, ApiProvider, Achievement, SkillType, Location, Choice, LocationType
} from '../types';
import {
    processLevelUps, getRealmDisplayName, calculateBaseStatsForLevel,
    processSkillLevelUps, processNpcLevelUps, recalculateDerivedStats,
    getLevelFromRealmName, calculateExperienceForBreakthrough
} from '../services/progressionService';
import * as geminiService from '../services/geminiService';
import * as openaiService from '../services/openaiService';
import { findBestAvatar } from '../services/avatarService';
import { GAME_CONFIG } from '../config/gameConfig';

const USE_DEFAULT_KEY_IDENTIFIER = '_USE_DEFAULT_KEY_';

/**
 * Tính toán giá trị của một vật phẩm dựa trên các quy tắc trong gameConfig.
 * @param item - Vật phẩm cần tính giá trị (không cần các trường id, value, quantity).
 * @param worldSettings - Cài đặt thế giới để lấy danh sách phẩm chất.
 * @returns Giá trị được tính toán của vật phẩm.
 */
const calculateItemValue = (item: Omit<Item, 'value' | 'id' | 'quantity'>, worldSettings: WorldSettings): number => {
    const { economy } = GAME_CONFIG;
    const baseValue = economy.baseValueByType[item.type] || economy.baseValueByType[ItemType.KHAC];

    const qualityTiers = worldSettings.qualityTiers.split(' - ').map(q => q.trim()).filter(Boolean);
    const qualityIndex = qualityTiers.indexOf(item.quality);

    let qualityMultiplier = 1.0;

    if (qualityIndex === -1) {
        // Phẩm chất không tìm thấy, dùng hệ số mặc định
        qualityMultiplier = 1.0;
    } else if (qualityIndex < economy.valueMultiplierByQuality.length) {
        // Nằm trong phạm vi đã định nghĩa
        qualityMultiplier = economy.valueMultiplierByQuality[qualityIndex];
    } else {
        // Ngoại suy cho các bậc cao hơn
        const lastDefinedMultiplier = economy.valueMultiplierByQuality[economy.valueMultiplierByQuality.length - 1];
        const difference = qualityIndex - (economy.valueMultiplierByQuality.length - 1);
        qualityMultiplier = lastDefinedMultiplier * Math.pow(economy.qualityMultiplierGrowthFactor, difference);
    }

    return Math.round(baseValue * qualityMultiplier);
};


interface ApplyDiffParams {
    storyResponse: StoryResponse;
    characterProfile: CharacterProfile;
    npcs: NPC[];
    worldSettings: WorldSettings;
    settings: AppSettings;
    choice: Choice;
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
    // Make a mutable copy of the response to correct inconsistencies before applying
    const response: StoryResponse = JSON.parse(JSON.stringify(storyResponse)); 
    const notifications: string[] = [];
    const api = settings.apiProvider === ApiProvider.OPENAI ? openaiService : geminiService;
    const apiKeyForService = settings.apiProvider === ApiProvider.OPENAI
        ? settings.openaiApiKey
        : (settings.gemini.useDefault
            ? USE_DEFAULT_KEY_IDENTIFIER
            : (settings.gemini.customKeys.find(k => k.id === settings.gemini.activeCustomKeyId)?.key || ''));

    // Create a mutable base for our state changes
    let intermediateProfile: CharacterProfile = {
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

    // --- PRE-PROCESSING STEP: Correct AI response inconsistencies ---
    
    // Correct new locations that already exist to prevent duplicates and fix player location ID
    if (response.newLocations?.length) {
        const existingLocationNames = new Set(intermediateProfile.discoveredLocations.map(l => l.name.toLowerCase()));
        const existingLocationIds = new Set(intermediateProfile.discoveredLocations.map(l => l.id));
        const uniqueNewLocations: Location[] = [];

        response.newLocations.forEach((newLoc: Location) => {
            const isDuplicate = existingLocationIds.has(newLoc.id) || existingLocationNames.has(newLoc.name.toLowerCase());

            if (isDuplicate) {
                notifications.push(`ℹ️ Hệ thống đã bỏ qua việc tạo lại 1 địa điểm đã tồn tại: <b>${newLoc.name}</b>.`);
                
                // If the AI intended to move the player to this duplicated new location,
                // we must correct the target ID to the existing location's ID.
                if (response.updatedPlayerLocationId === newLoc.id) {
                    const existingLoc = intermediateProfile.discoveredLocations.find(l => l.name.toLowerCase() === newLoc.name.toLowerCase());
                    if (existingLoc) {
                        response.updatedPlayerLocationId = existingLoc.id;
                    }
                }
            } else {
                uniqueNewLocations.push(newLoc);
            }
        });
        response.newLocations = uniqueNewLocations;
    }

    // Correct new NPCs that already exist to prevent duplicates
    if (response.newNPCs?.length) {
        const existingNpcNames = new Set(nextNpcs.map(n => n.name.toLowerCase()));
        const existingNpcIds = new Set(nextNpcs.map(n => n.id));
        const uniqueNewNpcs: NewNPCFromAI[] = [];

        response.newNPCs.forEach((newNpc: NewNPCFromAI) => {
            const isDuplicate = existingNpcIds.has(newNpc.id) || existingNpcNames.has(newNpc.name.toLowerCase());

            if (isDuplicate) {
                notifications.push(`ℹ️ Hệ thống đã bỏ qua việc tạo lại 1 NPC đã tồn tại: <b>${newNpc.name}</b>.`);
            } else {
                uniqueNewNpcs.push(newNpc);
            }
        });
        response.newNPCs = uniqueNewNpcs;
    }


    // --- STEP 1: Generate all notifications by comparing the response with the original state ---
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

    if (response.updatedPlayerLocationId !== undefined && response.updatedPlayerLocationId !== characterProfile.currentLocationId) {
        let newLocName = 'Không Gian Hỗn Độn';
        if (response.updatedPlayerLocationId !== null) {
            const allPossibleLocations = [...intermediateProfile.discoveredLocations, ...(response.newLocations || []), ...(response.updatedLocations || [])];
            const newLoc = allPossibleLocations.find(l => l.id === response.updatedPlayerLocationId);
            if (newLoc) newLocName = newLoc.name;
        }
        notifications.push(`🚶 Bạn đã di chuyển đến <b>${newLocName}</b>.`);
    }

    if (response.updatedNPCs?.length) {
        response.updatedNPCs.forEach(update => {
            const originalNpc = npcs.find(n => n.id === update.id);
            if (!originalNpc) return;
    
            // Check for new special constitution
            if (update.specialConstitution && 
                (!originalNpc.specialConstitution || originalNpc.specialConstitution.name !== update.specialConstitution.name)) {
                notifications.push(`🌟 <b>${originalNpc.name}</b> đã thức tỉnh thể chất đặc biệt: <b>${update.specialConstitution.name}</b>!`);
            }
    
            // Check for new innate talent
            if (update.innateTalent &&
                (!originalNpc.innateTalent || originalNpc.innateTalent.name !== update.innateTalent.name)) {
                notifications.push(`🌟 <b>${originalNpc.name}</b> đã thức tỉnh thiên phú bẩm sinh: <b>${update.innateTalent.name}</b>!`);
            }
        });
    }

    // --- STEP 2: Calculate XP and get the definitive new profile object ---
    const gainedXpFromAI = response.updatedStats?.gainedExperience ?? 0;
    let finalGainedXp = 0;
    const breakthroughRealm = response.updatedStats?.breakthroughToRealm;

    if (breakthroughRealm) {
        const targetLevel = getLevelFromRealmName(breakthroughRealm, intermediateProfile.powerSystem, finalWorldSettings);
        if (targetLevel > intermediateProfile.level) {
            const xpForBreakthrough = calculateExperienceForBreakthrough(
                intermediateProfile.level, intermediateProfile.experience, targetLevel
            );
            finalGainedXp = gainedXpFromAI + xpForBreakthrough;
            notifications.push(`✨ **ĐỘT PHÁ THẦN TỐC!** Vận may ập đến, bạn nhận được một lượng lớn kinh nghiệm để đạt đến <b>${breakthroughRealm}</b>.`);
        }
    } else if (gainedXpFromAI > 0) {
        const { levelBonusDivisor, cultivationSkillBonusMultiplier } = GAME_CONFIG.progression.xp;
        const levelBonus = 1 + (intermediateProfile.level / levelBonusDivisor);
        const cultivationSkills = intermediateProfile.skills.filter(s => s.type === SkillType.CULTIVATION);
        const qualityTiers = finalWorldSettings.qualityTiers.split(' - ').map(q => q.trim());
        let cultivationBonus = 1.0;
        cultivationSkills.forEach(skill => {
            const qualityIndex = qualityTiers.indexOf(skill.quality);
            if (qualityIndex !== -1) cultivationBonus += (qualityIndex + 1) * cultivationSkillBonusMultiplier;
        });
        const adjustedXp = Math.max(1, Math.round(gainedXpFromAI * levelBonus * cultivationBonus));
        finalGainedXp = adjustedXp;
        const bonusDescriptions: string[] = [];
        if (levelBonus > 1.01) bonusDescriptions.push(`nhờ Cấp độ ${intermediateProfile.level} (x${levelBonus.toFixed(2)})`);
        if (cultivationBonus > 1.01) bonusDescriptions.push(`nhờ Công pháp (x${cultivationBonus.toFixed(2)})`);
        if (bonusDescriptions.length > 0) {
            notifications.push(`Bạn nhận được <b>${adjustedXp.toLocaleString()} EXP</b> (gốc: ${gainedXpFromAI.toLocaleString()}, ${bonusDescriptions.join(', ')}).`);
        } else {
            notifications.push(`Bạn nhận được <b>${adjustedXp.toLocaleString()} EXP</b>.`);
        }
    }

    let nextProfile: CharacterProfile;
    if (finalGainedXp > 0) {
        const oldLevel = intermediateProfile.level;
        const oldRealm = intermediateProfile.realm;
        nextProfile = processLevelUps(intermediateProfile, finalGainedXp, finalWorldSettings);
        if (nextProfile.level > oldLevel) {
            notifications.push(`🎉 Chúc mừng! Bạn đã đạt đến <b>cấp độ ${nextProfile.level}</b>.`);
            if (nextProfile.realm !== oldRealm) {
                notifications.push(`⚡️ Đột phá! Bạn đã tiến vào cảnh giới <b>${nextProfile.realm}</b>.`);
            }
        }
    } else {
        nextProfile = recalculateDerivedStats(intermediateProfile);
    }
    const didLevelUp = finalGainedXp > 0 && nextProfile.level > characterProfile.level;

    // --- STEP 3: Apply all other state mutations to the new objects ---

    // Apply skill EXP and potential breakthroughs (async)
    if (response.updatedSkills?.length) {
        let tempSkills = [...nextProfile.skills];
        const skillUpdatePromises = response.updatedSkills.map(async (skillUpdate) => {
            const skillIndex = tempSkills.findIndex(s => s.name === skillUpdate.skillName);
            if (skillIndex !== -1) {
                const originalSkill = tempSkills[skillIndex];
                notifications.push(`💪 Kỹ năng "<b>${originalSkill.name}</b>" nhận được <b>${skillUpdate.gainedExperience} EXP</b>.`);
                const { updatedSkill, breakthroughInfo } = processSkillLevelUps(originalSkill, skillUpdate.gainedExperience, finalWorldSettings.qualityTiers);
                tempSkills[skillIndex] = updatedSkill;
                if (breakthroughInfo) {
                    notifications.push(`🔥 **ĐỘT PHÁ!** Kỹ năng "<b>${originalSkill.name}</b>" đã đột phá từ <b>${breakthroughInfo.oldQuality}</b> lên <b>${breakthroughInfo.newQuality}</b>!`);
                    try {
                        const newDetails = await api.generateNewSkillDescription(updatedSkill, breakthroughInfo.newQuality, finalWorldSettings, apiKeyForService);
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

    // Apply other stat changes
    if (response.updatedStats) {
        const stats = response.updatedStats;
        if (!didLevelUp) {
            nextProfile.health = stats.health ?? nextProfile.health;
            nextProfile.mana = stats.mana ?? nextProfile.mana;
        }
        nextProfile.currencyAmount = stats.currencyAmount ?? nextProfile.currencyAmount;
        
        // --- START: Status Effect Logic Overhaul ---
        let newStatusEffectsList = [...nextProfile.statusEffects];

        // Process removals first
        if (stats.removedStatusEffects?.length) {
            const effectsToRemove = new Set(stats.removedStatusEffects);
            const effectsThatWereRemoved = newStatusEffectsList.filter(effect => effectsToRemove.has(effect.name));
            effectsThatWereRemoved.forEach(effect => notifications.push(`🍃 Trạng thái "<b>${effect.name}</b>" của bạn đã kết thúc.`));
            newStatusEffectsList = newStatusEffectsList.filter(effect => !effectsToRemove.has(effect.name));
        }

        // Process additions and updates
        if (stats.newStatusEffects?.length) {
            stats.newStatusEffects.forEach(newEffect => {
                if (newEffect.name.startsWith('Mang Thai')) {
                    const existingPregnancyEffect = newStatusEffectsList.find(e => e.name.startsWith('Mang Thai'));
                    if (existingPregnancyEffect) {
                        newEffect.duration = existingPregnancyEffect.duration;
                        newStatusEffectsList = newStatusEffectsList.filter(e => !e.name.startsWith('Mang Thai'));
                        newStatusEffectsList.push(newEffect);
                        notifications.push(`ℹ️ Trạng thái mang thai của bạn đã được cập nhật thành: <b>${newEffect.name}</b>. Thời gian còn lại không đổi.`);
                    } else {
                        notifications.push(`✨ Bạn nhận được trạng thái: <b>${newEffect.name}</b>.`);
                        newStatusEffectsList.push(newEffect);
                    }
                } else {
                    const existingEffectIndex = newStatusEffectsList.findIndex(e => e.name === newEffect.name);
                    if (existingEffectIndex !== -1) {
                        notifications.push(`ℹ️ Trạng thái "<b>${newEffect.name}</b>" đã được làm mới.`);
                        newStatusEffectsList[existingEffectIndex] = newEffect;
                    } else {
                        notifications.push(`✨ Bạn nhận được trạng thái: <b>${newEffect.name}</b>.`);
                        newStatusEffectsList.push(newEffect);
                    }
                }
            });
        }
        nextProfile.statusEffects = newStatusEffectsList;
        // --- END: Status Effect Logic Overhaul ---


        if (stats.newAchievements?.length) {
            if (!nextProfile.achievements) nextProfile.achievements = [];
            stats.newAchievements.forEach(newAchievement => {
                if (!nextProfile.achievements.some(a => a.name === newAchievement.name)) {
                    nextProfile.achievements.push({ ...newAchievement, isNew: true });
                    notifications.push(`🏆 Bạn đã đạt được thành tích mới: <b>${newAchievement.name}</b>!`);
                }
            });
        }
        if (stats.updatedAchievements?.length) {
            if (!nextProfile.achievements) nextProfile.achievements = [];
            stats.updatedAchievements.forEach(update => {
                const achievementIndex = nextProfile.achievements.findIndex(a => a.name === update.name);
                if (achievementIndex !== -1) {
                    const oldAchievement = nextProfile.achievements[achievementIndex];
                    nextProfile.achievements[achievementIndex] = { ...oldAchievement, ...update, isNew: true };
                    if (update.tier && oldAchievement.tier !== update.tier) notifications.push(`🏆 Thành tích "<b>${update.name}</b>" đã được nâng cấp lên bậc <b>${update.tier}</b>!`);
                    else notifications.push(`🏆 Thành tích "<b>${update.name}</b>" đã được cập nhật.`);
                } else {
                    nextProfile.achievements.push({ name: update.name, description: update.description || '', tier: update.tier, isNew: true });
                    notifications.push(`🏆 Bạn đã đạt được thành tích mới: <b>${update.name}</b>!`);
                }
            });
        }
    }

    // Apply item changes
    let newItems = [...nextProfile.items];
    if (response.removedItemIds) newItems = newItems.filter(item => !response.removedItemIds?.includes(item.id));
    if (response.updatedItems) {
        response.updatedItems.forEach(update => {
            const itemIndex = newItems.findIndex(i => i.name === update.name);
            if (itemIndex > -1) newItems[itemIndex].quantity = update.quantity;
        });
        newItems = newItems.filter(item => item.quantity > 0);
    }
    if (response.newItems) {
        response.newItems.forEach(newItemFromAI => {
            const calculatedValue = calculateItemValue(newItemFromAI, finalWorldSettings);
            const newItem = { ...newItemFromAI, value: calculatedValue, isNew: true };

            const isEquipment = newItem.type === ItemType.TRANG_BI || newItem.type === ItemType.DAC_THU;
            // Chỉ cộng dồn các vật phẩm không phải trang bị và có cùng phẩm chất.
            const existingItemIndex = isEquipment ? -1 : newItems.findIndex(i => i.name === newItem.name && i.quality === newItem.quality);

            if (existingItemIndex > -1) {
                newItems[existingItemIndex].quantity += newItem.quantity;
                newItems[existingItemIndex].isNew = true;
            } else {
                newItems.push(newItem);
            }
        });
    }
    nextProfile.items = newItems;

    // Update discovered items encyclopedia
    if (response.newItems) {
        const existingDiscovered = nextProfile.discoveredItems || [];
        const newlyDiscovered = response.newItems
            .filter(newItem => !existingDiscovered.some(i => i.name === newItem.name))
            .map(newItem => ({ ...newItem, isNew: true }));
        if (newlyDiscovered.length > 0) nextProfile.discoveredItems = [...existingDiscovered, ...newlyDiscovered];
    }
    
    // Apply new skills
    if (response.newSkills?.length) {
        const newlyAcquiredSkills: Skill[] = response.newSkills.map((newSkillPart, index) => ({
            ...newSkillPart, id: `${Date.now()}-${index}`, level: 1, experience: 0, isNew: true,
        }));
        nextProfile.skills = [...nextProfile.skills, ...newlyAcquiredSkills];
    }

    // Apply location changes (using pre-processed response)
    if (response.newLocations?.length) {
        // DEFENSIVE CODING: Correct missing parent IDs from AI response
        const correctedNewLocations = response.newLocations.map((loc: Location) => {
            // A location that is NOT a WORLD type MUST have a parent.
            if (loc.type !== LocationType.WORLD && !loc.parentId) {
                // The parent should be the location the player was in when they discovered this new place.
                loc.parentId = characterProfile.currentLocationId;
            }
            return loc;
        });
    
        const mappedNewLocations = correctedNewLocations
            .map((l: Location) => ({ ...(l.ownerId === 'player' ? { ...l, ownerId: nextProfile.id } : l), isNew: true }));
    
        mappedNewLocations.forEach(newLoc => {
            if (newLoc.ownerId === nextProfile.id) {
                notifications.push(`👑 Bây giờ bạn là chủ sở hữu của <b>${newLoc.name}</b>.`);
            }
        });
        nextProfile.discoveredLocations = [...nextProfile.discoveredLocations, ...mappedNewLocations];
    }

    if (response.updatedLocations?.length) {
        const validUpdatedLocations = response.updatedLocations.filter(l => l && typeof l === 'object');
        const updatedLocationsWithPlayerId = validUpdatedLocations.map(l => (l.ownerId === 'player' ? { ...l, ownerId: nextProfile.id } : l));
        const updatedLocationsMap = new Map(updatedLocationsWithPlayerId.map(l => [l.id, l]));

        nextProfile.discoveredLocations = nextProfile.discoveredLocations.map(loc => {
            const updatedData = updatedLocationsMap.get(loc.id);
            if (updatedData) {
                // Merge to prevent data loss, especially for fields AI might forget like 'rules'
                const mergedLocation = { ...loc, ...updatedData };
                
                // Notification logic
                if (mergedLocation.ownerId === nextProfile.id && loc.ownerId !== nextProfile.id) {
                    notifications.push(`👑 Bây giờ bạn là chủ sở hữu của <b>${mergedLocation.name}</b>.`);
                }
                if (mergedLocation.isDestroyed === false && loc.isDestroyed === true && loc.type === LocationType.WORLD) {
                    notifications.push(`🌍 Thế Giới <b>${loc.name}</b> đã được hồi sinh!`);
                }
                return mergedLocation;
            }
            return loc;
        });
    }

    // This is the critical update for player movement (using corrected ID)
    if (response.updatedPlayerLocationId !== undefined) {
        nextProfile.currentLocationId = response.updatedPlayerLocationId;
    }

    // Apply NPC changes (using pre-processed response)
    if (response.newNPCs?.length) {
        const brandNewNpcsData: NPC[] = response.newNPCs
            .filter((npcData): npcData is NewNPCFromAI => npcData !== null && typeof npcData === 'object')
            .map((newNpcData: NewNPCFromAI) => {
                const powerSystemForNpc = finalWorldSettings.powerSystems.find(ps => ps.name === newNpcData.powerSystem);
                const isValidPowerSystem = !!powerSystemForNpc;
                const npcPowerSystem = isValidPowerSystem ? newNpcData.powerSystem : (finalWorldSettings.powerSystems[0]?.name || '');
                const maxLevel = powerSystemForNpc ? (powerSystemForNpc.realms.split(' - ').filter(r => r.trim()).length * 10) || 1 : 1;
                const npcLevel = isValidPowerSystem ? Math.min(newNpcData.level, maxLevel) : 1;
                const stats = calculateBaseStatsForLevel(npcLevel);

                const npc: NPC = {
                    ...newNpcData,
                    level: npcLevel,
                    powerSystem: npcPowerSystem,
                    experience: 0,
                    health: stats.maxHealth,
                    mana: stats.maxMana,
                    realm: getRealmDisplayName(npcLevel, npcPowerSystem, finalWorldSettings),
                    memories: [],
                    npcRelationships: newNpcData.npcRelationships || [],
                    statusEffects: (Array.isArray(newNpcData.statusEffects) ? newNpcData.statusEffects : [])
                        .filter((v, i, a) => a.findIndex(t => t.name === v.name) === i),
                    isDaoLu: newNpcData.isDaoLu || false,
                    isNew: true
                };
                return npc;
            });
        nextNpcs = [...nextNpcs, ...brandNewNpcsData];
    }
    if (response.updatedNPCs?.length) {
        const npcsToUpdateMap = new Map(nextNpcs.map(n => [n.id, n]));
        response.updatedNPCs.forEach(update => {
            const existingNpc = npcsToUpdateMap.get(update.id);
            if (existingNpc) {
                let modifiedNpc = { ...existingNpc };
                if (update.isDead === true) {
                    modifiedNpc.isDead = true;
                    modifiedNpc.locationId = null;
                    notifications.push(`💀 <b>${modifiedNpc.name}</b> đã tử vong.`);
                } else {
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
                        modifiedNpc = processNpcLevelUps(modifiedNpc, update.gainedExperience, finalWorldSettings);
                        if (modifiedNpc.level > oldLevel) notifications.push(`✨ <b>${modifiedNpc.name}</b> đã đạt đến <b>cấp độ ${modifiedNpc.level}</b>!`);
                    }
                    if (update.isDaoLu && !existingNpc.isDaoLu) {
                        modifiedNpc.isDaoLu = true;
                        modifiedNpc.relationship = 1000;
                        notifications.push(`❤️ Bạn và <b>${modifiedNpc.name}</b> đã trở thành Đạo Lữ!`);
                    } else if (update.relationship !== undefined) {
                        const oldRel = existingNpc.relationship ?? 0;
                        const newRel = Math.max(-1000, Math.min(1000, oldRel + (update.relationship || 0)));
                        modifiedNpc.relationship = newRel;
                        if(newRel !== oldRel) notifications.push(`😊 Hảo cảm của <b>${modifiedNpc.name}</b> đã thay đổi ${newRel - oldRel} điểm (hiện tại: ${newRel}).`);
                    }
                    if (update.newMemories?.length) modifiedNpc.memories = Array.from(new Set([...(modifiedNpc.memories || []), ...update.newMemories]));
                    
                    // --- START: NPC Status Effect Logic Overhaul ---
                    let currentNpcStatusEffects = [...(modifiedNpc.statusEffects || [])];

                    // Process removals first
                    if (update.removedStatusEffects?.length) {
                        const effectsToRemove = new Set(update.removedStatusEffects);
                        const effectsThatWereRemoved = currentNpcStatusEffects.filter(effect => effectsToRemove.has(effect.name));
                        effectsThatWereRemoved.forEach(effect => notifications.push(`🍃 Trạng thái "<b>${effect.name}</b>" của <b>${modifiedNpc.name}</b> đã kết thúc.`));
                        currentNpcStatusEffects = currentNpcStatusEffects.filter(effect => !effectsToRemove.has(effect.name));
                    }

                    // Process additions and updates
                    if (update.newStatusEffects?.length) {
                        update.newStatusEffects.forEach(newEffect => {
                             if (newEffect.name.startsWith('Mang Thai')) {
                                const existingPregnancyEffect = currentNpcStatusEffects.find(e => e.name.startsWith('Mang Thai'));
                                if (existingPregnancyEffect) {
                                    newEffect.duration = existingPregnancyEffect.duration;
                                    currentNpcStatusEffects = currentNpcStatusEffects.filter(e => !e.name.startsWith('Mang Thai'));
                                    currentNpcStatusEffects.push(newEffect);
                                    notifications.push(`ℹ️ Trạng thái mang thai của <b>${modifiedNpc.name}</b> đã được cập nhật thành: <b>${newEffect.name}</b>. Thời gian còn lại không đổi.`);
                                } else {
                                    notifications.push(`✨ <b>${modifiedNpc.name}</b> nhận được trạng thái: <b>${newEffect.name}</b>.`);
                                    currentNpcStatusEffects.push(newEffect);
                                }
                            } else {
                                const existingEffectIndex = currentNpcStatusEffects.findIndex(e => e.name === newEffect.name);
                                if (existingEffectIndex !== -1) {
                                    notifications.push(`ℹ️ Trạng thái "<b>${newEffect.name}</b>" của <b>${modifiedNpc.name}</b> đã được làm mới.`);
                                    currentNpcStatusEffects[existingEffectIndex] = newEffect;
                                } else {
                                    notifications.push(`✨ <b>${modifiedNpc.name}</b> nhận được trạng thái: <b>${newEffect.name}</b>.`);
                                    currentNpcStatusEffects.push(newEffect);
                                }
                            }
                        });
                    }
                    modifiedNpc.statusEffects = currentNpcStatusEffects;
                    // --- END: NPC Status Effect Logic Overhaul ---


                    // Apply other direct updates
                    Object.assign(modifiedNpc, {
                        health: update.health ?? modifiedNpc.health,
                        mana: update.mana ?? modifiedNpc.mana,
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
                npcsToUpdateMap.set(update.id, modifiedNpc);
            }
        });
        nextNpcs = Array.from(npcsToUpdateMap.values());
    }

    // Apply world knowledge and monster encyclopedia updates
    if (response.newWorldKnowledge?.length) {
        const uniqueNewKnowledge = response.newWorldKnowledge.filter(k => !finalWorldSettings.initialKnowledge.some(ek => ek.title === k.title)).map(k => ({ ...k, isNew: true }));
        uniqueNewKnowledge.forEach(k => notifications.push(`🧠 Phát hiện tri thức mới: <b>${k.title}</b>.`));
        finalWorldSettings.initialKnowledge = [...finalWorldSettings.initialKnowledge, ...uniqueNewKnowledge];
    }
    if (response.newMonsters?.length) {
        const newDiscoveredMonsters = response.newMonsters
            .filter(nm => !nextProfile.discoveredMonsters.some(dm => dm.name === nm.name))
            .map(nm => ({ id: `monster_${Date.now()}_${nm.name.replace(/\s+/g, '')}`, name: nm.name, description: nm.description, isNew: true, }));
        nextProfile.discoveredMonsters = [...nextProfile.discoveredMonsters, ...newDiscoveredMonsters];
    }
    
    // Apply gender change
    if (response.updatedGender && response.updatedGender !== nextProfile.gender) {
        nextProfile.gender = response.updatedGender;
        notifications.push(`🚻 Giới tính của bạn đã thay đổi thành <b>${response.updatedGender === 'male' ? 'Nam' : 'Nữ'}</b>!`);
    }

    // Apply time changes
    const oldDate = new Date(nextProfile.gameTime);
    let newDate: Date | null = null;

    if (response.updatedGameTime) {
        newDate = new Date(response.updatedGameTime);
        const timeDiffMs = newDate.getTime() - oldDate.getTime();
        if (timeDiffMs > 0) {
            const yearsPassed = (timeDiffMs / (1000 * 60 * 60 * 24 * 365.25));
            if (yearsPassed >= 1) {
                notifications.push(`⏳ <b>${Math.floor(yearsPassed)} năm</b> đã trôi qua.`);
            }
        }
    } else {
        let minutesPassed = 0;
        if (choice.isTimeSkip && choice.turnsToSkip) {
            // 1 lượt = 8 giờ = 480 phút
            minutesPassed = choice.turnsToSkip * 480;
            notifications.push(`⏳ Thời gian đã trôi qua: <b>${choice.turnsToSkip} lượt</b>.`);
        } else if (choice.durationInMinutes > 0) {
            minutesPassed = choice.durationInMinutes;
            notifications.push(`⏳ Thời gian đã trôi qua: <b>${choice.durationInMinutes} phút</b>.`);
        }
        
        if(minutesPassed > 0) {
            newDate = new Date(oldDate.getTime() + minutesPassed * 60 * 1000);
        }
    }
    
    if (newDate) {
        const yearsPassed = newDate.getFullYear() - oldDate.getFullYear();
        if (yearsPassed > 0) nextProfile.lifespan -= yearsPassed;
        nextProfile.gameTime = newDate.toISOString();
    }
    
    return { nextProfile, nextNpcs, finalWorldSettings, notifications };
};