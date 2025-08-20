import { StoryResponse, CharacterProfile, WorldSettings, AppSettings, ApiProvider, Skill, ItemType, Item, SkillType, Milestone, Choice } from '../../types';
import { processLevelUps, getLevelFromRealmName, calculateExperienceForBreakthrough, processSkillLevelUps, recalculateDerivedStats } from '../../services/progressionService';
import { GAME_CONFIG } from '../../config/gameConfig';
import * as geminiService from '../../services/geminiService';
import * as openaiService from '../../services/openaiService';

const USE_DEFAULT_KEY_IDENTIFIER = '_USE_DEFAULT_KEY_';

interface ApplyPlayerMutationsParams {
    response: StoryResponse;
    profile: CharacterProfile;
    originalProfile: CharacterProfile;
    worldSettings: WorldSettings;
    settings: AppSettings;
    notifications: string[];
    turnNumber: number;
    choice: Choice;
}

/**
 * Calculates the final value of an item based on game rules.
 * @param item The item to calculate the value for.
 * @param worldSettings The world settings containing quality tiers.
 * @returns The calculated value of the item.
 */
const calculateItemValue = (item: Omit<Item, 'value' | 'id' | 'quantity'>, worldSettings: WorldSettings): number => {
    const { economy } = GAME_CONFIG;
    const baseValue = economy.baseValueByType[item.type] || economy.baseValueByType[ItemType.KHAC];
    const qualityTiers = worldSettings.qualityTiers.split(' - ').map(q => q.trim()).filter(Boolean);
    const qualityIndex = qualityTiers.indexOf(item.quality);

    let qualityMultiplier = 1.0;
    if (qualityIndex === -1) {
        qualityMultiplier = 1.0;
    } else if (qualityIndex < economy.valueMultiplierByQuality.length) {
        qualityMultiplier = economy.valueMultiplierByQuality[qualityIndex];
    } else {
        const lastDefinedMultiplier = economy.valueMultiplierByQuality[economy.valueMultiplierByQuality.length - 1];
        const difference = qualityIndex - (economy.valueMultiplierByQuality.length - 1);
        qualityMultiplier = lastDefinedMultiplier * Math.pow(economy.qualityMultiplierGrowthFactor, difference);
    }
    return Math.round(baseValue * qualityMultiplier);
};

export const applyPlayerMutations = async ({
    response,
    profile,
    originalProfile,
    worldSettings,
    settings,
    notifications,
    turnNumber,
    choice,
}: ApplyPlayerMutationsParams): Promise<CharacterProfile> => {
    let nextProfile = { ...profile };

    const api = settings.apiProvider === ApiProvider.OPENAI ? openaiService : geminiService;
    const apiKeyForService = settings.apiProvider === ApiProvider.OPENAI
        ? settings.openaiApiKey
        : (settings.gemini.useDefault
            ? USE_DEFAULT_KEY_IDENTIFIER
            : (settings.gemini.customKeys.find(k => k.id === settings.gemini.activeCustomKeyId)?.key || ''));

    // --- XP & Leveling ---
    const gainedXpFromAI = response.updatedStats?.gainedExperience ?? 0;
    let finalGainedXp = 0;
    const breakthroughRealm = response.updatedStats?.breakthroughToRealm;

    if (breakthroughRealm) {
        const targetLevel = getLevelFromRealmName(breakthroughRealm, nextProfile.powerSystem, worldSettings);
        if (targetLevel > nextProfile.level) {
            const xpForBreakthrough = calculateExperienceForBreakthrough(nextProfile.level, nextProfile.experience, targetLevel);
            finalGainedXp = gainedXpFromAI + xpForBreakthrough;
            notifications.push(`✨ **ĐỘT PHÁ THẦN TỐC!** Vận may ập đến, bạn nhận được một lượng lớn kinh nghiệm để đạt đến <b>${breakthroughRealm}</b>.`);
        }
    } else if (gainedXpFromAI > 0) {
        const { levelBonusDivisor, cultivationSkillBonusMultiplier } = GAME_CONFIG.progression.xp;
        const levelBonus = 1 + (nextProfile.level / levelBonusDivisor);
        const cultivationSkills = nextProfile.skills.filter(s => s.type === SkillType.CULTIVATION);
        const qualityTiers = worldSettings.qualityTiers.split(' - ').map(q => q.trim());
        let cultivationBonus = 1.0;
        cultivationSkills.forEach(skill => {
            const qualityIndex = qualityTiers.indexOf(skill.quality);
            if (qualityIndex !== -1) cultivationBonus += (qualityIndex + 1) * cultivationSkillBonusMultiplier;
        });
        const adjustedXp = Math.max(1, Math.round(gainedXpFromAI * levelBonus * cultivationBonus));
        finalGainedXp = adjustedXp;
        const bonusDescriptions: string[] = [];
        if (levelBonus > 1.01) bonusDescriptions.push(`nhờ Cấp độ ${nextProfile.level} (x${levelBonus.toFixed(2)})`);
        if (cultivationBonus > 1.01) bonusDescriptions.push(`nhờ Công pháp (x${cultivationBonus.toFixed(2)})`);
        if (bonusDescriptions.length > 0) {
            notifications.push(`Bạn nhận được <b>${adjustedXp.toLocaleString()} EXP</b> (gốc: ${gainedXpFromAI.toLocaleString()}, ${bonusDescriptions.join(', ')}).`);
        } else {
            notifications.push(`Bạn nhận được <b>${adjustedXp.toLocaleString()} EXP</b>.`);
        }
    }

    const oldLevel = nextProfile.level;
    const oldRealm = nextProfile.realm;
    if (finalGainedXp > 0) {
        nextProfile = processLevelUps(nextProfile, finalGainedXp, worldSettings);
        if (nextProfile.level > oldLevel) {
            notifications.push(`🎉 Chúc mừng! Bạn đã đạt đến <b>cấp độ ${nextProfile.level}</b>.`);
            if (nextProfile.realm !== oldRealm) {
                notifications.push(`⚡️ Đột phá! Bạn đã tiến vào cảnh giới <b>${nextProfile.realm}</b>.`);
            }
        }
    } else {
        nextProfile = recalculateDerivedStats(nextProfile);
    }
    const didLevelUp = finalGainedXp > 0 && nextProfile.level > originalProfile.level;

    // --- Skills ---
    if (response.updatedSkills?.length) {
        const skillUpdatePromises = nextProfile.skills.map(async (skill) => {
            const skillUpdate = response.updatedSkills!.find(su => su.skillName === skill.name);
            if (skillUpdate) {
                notifications.push(`💪 Kỹ năng "<b>${skill.name}</b>" nhận được <b>${skillUpdate.gainedExperience} EXP</b>.`);
                const { updatedSkill, breakthroughInfo } = processSkillLevelUps(skill, skillUpdate.gainedExperience, worldSettings.qualityTiers);
                if (breakthroughInfo) {
                    notifications.push(`🔥 **ĐỘT PHÁ!** Kỹ năng "<b>${skill.name}</b>" đã đột phá từ <b>${breakthroughInfo.oldQuality}</b> lên <b>${breakthroughInfo.newQuality}</b>!`);
                    try {
                        const newDetails = await api.generateNewSkillDescription(updatedSkill, breakthroughInfo.newQuality, worldSettings, apiKeyForService);
                        return { ...updatedSkill, description: newDetails.description, effect: newDetails.effect };
                    } catch (err) {
                        console.error("Lỗi khi tạo mô tả kỹ năng mới:", err);
                    }
                }
                return updatedSkill;
            }
            return skill;
        });
        nextProfile.skills = await Promise.all(skillUpdatePromises);
    }
    if (response.newSkills?.length) {
        const newlyAcquiredSkills: Skill[] = response.newSkills.map((newSkillPart, index) => ({
            ...newSkillPart, id: `${Date.now()}-${index}`, level: 1, experience: 0, isNew: true,
        }));
        nextProfile.skills = [...nextProfile.skills, ...newlyAcquiredSkills];
    }

    // --- Stats, Status Effects, Achievements ---
    if (response.updatedStats) {
        const stats = response.updatedStats;
        if (!didLevelUp) {
            nextProfile.health = stats.health ?? nextProfile.health;
            nextProfile.mana = stats.mana ?? nextProfile.mana;
        }
        nextProfile.currencyAmount = stats.currencyAmount ?? nextProfile.currencyAmount;
        
        let newStatusEffectsList = [...nextProfile.statusEffects];
        if (stats.removedStatusEffects?.length) {
            const effectsToRemove = new Set(stats.removedStatusEffects);
            newStatusEffectsList.filter(effect => effectsToRemove.has(effect.name))
                .forEach(effect => notifications.push(`🍃 Trạng thái "<b>${effect.name}</b>" của bạn đã kết thúc.`));
            newStatusEffectsList = newStatusEffectsList.filter(effect => !effectsToRemove.has(effect.name));
        }
        if (stats.newStatusEffects?.length) {
            stats.newStatusEffects.forEach(newEffect => {
                const existingIndex = newStatusEffectsList.findIndex(e => e.name === newEffect.name);
                if (existingIndex !== -1) {
                    notifications.push(`ℹ️ Trạng thái "<b>${newEffect.name}</b>" đã được làm mới.`);
                    newStatusEffectsList[existingIndex] = newEffect;
                } else {
                    notifications.push(`✨ Bạn nhận được trạng thái: <b>${newEffect.name}</b>.`);
                    newStatusEffectsList.push(newEffect);
                }
            });
        }
        nextProfile.statusEffects = newStatusEffectsList;

        if (stats.newAchievements?.length) {
            stats.newAchievements.forEach(newAch => {
                if (!nextProfile.achievements.some(a => a.name === newAch.name)) {
                    nextProfile.achievements.push({ ...newAch, isNew: true });
                    notifications.push(`🏆 Bạn đã đạt được thành tích mới: <b>${newAch.name}</b>!`);
                }
            });
        }
        if (stats.updatedAchievements?.length) {
            stats.updatedAchievements.forEach(update => {
                const achIndex = nextProfile.achievements.findIndex(a => a.name === update.name);
                if (achIndex !== -1) {
                    const oldAch = nextProfile.achievements[achIndex];
                    nextProfile.achievements[achIndex] = { ...oldAch, ...update, isNew: true };
                    notifications.push(`🏆 Thành tích "<b>${update.name}</b>" đã được cập nhật.`);
                }
            });
        }
    }

    // --- Items ---
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
            const calculatedValue = calculateItemValue(newItemFromAI, worldSettings);
            const newItem = { ...newItemFromAI, value: calculatedValue, isNew: true };
            const isEquipment = newItem.type === ItemType.TRANG_BI || newItem.type === ItemType.DAC_THU;
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
    if (response.newItems) {
        const newlyDiscovered = response.newItems
            .filter(newItem => !nextProfile.discoveredItems.some(i => i.name === newItem.name))
            .map(newItem => ({ ...newItem, isNew: true }));
        if (newlyDiscovered.length > 0) nextProfile.discoveredItems = [...nextProfile.discoveredItems, ...newlyDiscovered];
    }
    
    // --- Misc ---
    if (response.updatedGender && response.updatedGender !== nextProfile.gender) {
        nextProfile.gender = response.updatedGender;
        notifications.push(`🚻 Giới tính của bạn đã thay đổi thành <b>${response.updatedGender === 'male' ? 'Nam' : 'Nữ'}</b>!`);
    }

    const oldDate = new Date(nextProfile.gameTime);
    let newDate: Date | null = null;
    if (response.updatedGameTime) {
        newDate = new Date(response.updatedGameTime);
        const timeDiffMs = newDate.getTime() - oldDate.getTime();
        if (timeDiffMs > 0) {
            const yearsPassed = (timeDiffMs / (1000 * 60 * 60 * 24 * 365.25));
            if (yearsPassed >= 1) notifications.push(`⏳ <b>${Math.floor(yearsPassed)} năm</b> đã trôi qua.`);
        }
    } else {
        let minutesPassed = 0;
        if (choice.isTimeSkip && choice.turnsToSkip) {
            minutesPassed = choice.turnsToSkip * GAME_CONFIG.gameplay.time.minutesPerTurn;
            notifications.push(`⏳ Thời gian đã trôi qua: <b>${choice.turnsToSkip} lượt</b>.`);
        } else if (choice.durationInMinutes > 0) {
            minutesPassed = choice.durationInMinutes;
            notifications.push(`⏳ Thời gian đã trôi qua: <b>${choice.durationInMinutes} phút</b>.`);
        }
        if(minutesPassed > 0) newDate = new Date(oldDate.getTime() + minutesPassed * 60 * 1000);
    }
    if (newDate) {
        const yearsPassed = newDate.getFullYear() - oldDate.getFullYear();
        if (yearsPassed > 0) nextProfile.lifespan -= yearsPassed;
        nextProfile.gameTime = newDate.toISOString();
    }
    
    if (response.newMilestone && response.newMilestone.trim()) {
        const newMilestoneEntry: Milestone = { turnNumber, summary: response.newMilestone.trim(), isNew: true };
        nextProfile.milestones.push(newMilestoneEntry);
        notifications.push(`- **Sổ Ký Ức được cập nhật:** ${newMilestoneEntry.summary}`);
    }

    if (response.updatedPlayerLocationId !== undefined) {
        nextProfile.currentLocationId = response.updatedPlayerLocationId;
    }

    return nextProfile;
};
