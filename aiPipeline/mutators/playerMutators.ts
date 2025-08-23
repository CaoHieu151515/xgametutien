import { StoryResponse, CharacterProfile, WorldSettings, AppSettings, ApiProvider, Skill, ItemType, Item, SkillType, Milestone, Choice, CharacterGender } from '../../types';
import { processLevelUps, getLevelFromRealmName, calculateExperienceForBreakthrough, processSkillLevelUps, recalculateDerivedStats, calculateManaCost } from '../../services/progressionService';
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

    // --- Stats Update ---
    if (response.updatedStats) {
        const {
            health, mana, currencyAmount, gainedExperience, breakthroughToRealm, usedFullRestoreSkill,
            newStatusEffects, removedStatusEffects, newAchievements, updatedAchievements
        } = response.updatedStats;
        
        const maxStats = { maxHealth: nextProfile.maxHealth, maxMana: nextProfile.maxMana };

        if (usedFullRestoreSkill) {
            nextProfile.health = maxStats.maxHealth;
            nextProfile.mana = maxStats.maxMana;
            notifications.push(`✨ Bạn đã khôi phục hoàn toàn Sinh Lực và Linh Lực!`);
        } else {
            if (health !== undefined) {
                let actualHealthChange = 0;
                if (typeof health === 'string' && health.endsWith('%')) {
                    const percentage = parseFloat(health) / 100;
                    actualHealthChange = Math.round(maxStats.maxHealth * percentage);
                } else if (typeof health === 'number') {
                    actualHealthChange = health;
                }
                nextProfile.health += actualHealthChange;
                if (actualHealthChange > 0) notifications.push(`💚 Bạn hồi phục <b>${actualHealthChange.toLocaleString()} Sinh Lực</b>.`);
                else if (actualHealthChange < 0) notifications.push(`🩸 Bạn mất <b>${Math.abs(actualHealthChange).toLocaleString()} Sinh Lực</b>.`);
            }

            if (mana !== undefined) {
                let actualManaChange = 0;
                if (typeof mana === 'string' && mana.endsWith('%')) {
                    const percentage = parseFloat(mana) / 100;
                    actualManaChange = Math.round(maxStats.maxMana * percentage);
                } else if (typeof mana === 'number') {
                    actualManaChange = mana;
                }
                nextProfile.mana += actualManaChange;
                if (actualManaChange > 0) notifications.push(`💧 Bạn hồi phục <b>${actualManaChange.toLocaleString()} Linh Lực</b>.`);
                else if (actualManaChange < 0) notifications.push(`💧 Bạn tiêu hao <b>${Math.abs(actualManaChange).toLocaleString()} Linh Lực</b>.`);
            }
        }
        
        nextProfile.health = Math.max(0, Math.min(maxStats.maxHealth, nextProfile.health));
        nextProfile.mana = Math.max(0, Math.min(maxStats.maxMana, nextProfile.mana));

        if (currencyAmount) nextProfile.currencyAmount += currencyAmount;

        let totalExpGained = gainedExperience || 0;
        if (breakthroughToRealm) {
            const oldRealm = nextProfile.realm;
            const targetLevel = getLevelFromRealmName(breakthroughToRealm, nextProfile.powerSystem, worldSettings);
            const expForBreakthrough = calculateExperienceForBreakthrough(nextProfile.level, nextProfile.experience, targetLevel);
            totalExpGained += expForBreakthrough;
            notifications.push(`⚡️ **ĐỘT PHÁ!** Bạn đã đột phá từ <b>${oldRealm}</b> lên cảnh giới <b>${breakthroughToRealm}</b>.`);
        }
        
        if (totalExpGained > 0) {
            const oldLevel = nextProfile.level;
            nextProfile = processLevelUps(nextProfile, totalExpGained, worldSettings);
            if(nextProfile.level > oldLevel) {
                notifications.push(`✨ Bạn đã đạt đến <b>cấp độ ${nextProfile.level}</b>! Sinh lực và linh lực đã được hồi đầy.`);
            } else {
                 notifications.push(`🌟 Bạn nhận được <b>${totalExpGained.toLocaleString()} EXP</b>.`);
            }
        }

        let currentStatusEffects = [...nextProfile.statusEffects];
        if (removedStatusEffects?.length) {
            const toRemoveNames = removedStatusEffects.map(name => name.toLowerCase());
            const effectsBeingRemoved = currentStatusEffects.filter(effect => 
                toRemoveNames.some(removeName => effect.name.toLowerCase().startsWith(removeName))
            );
            effectsBeingRemoved.forEach(e => notifications.push(`🍃 Trạng thái "<b>${e.name}</b>" đã kết thúc.`));
            currentStatusEffects = currentStatusEffects.filter(effect => 
                !toRemoveNames.some(removeName => effect.name.toLowerCase().startsWith(removeName))
            );
        }
        if (newStatusEffects?.length) {
            newStatusEffects.forEach(newEffect => {
                const isPregnancyEffect = newEffect.name.startsWith('Mang Thai');
                const existingIndex = currentStatusEffects.findIndex(e =>
                    isPregnancyEffect ? e.name.startsWith('Mang Thai') : e.name === newEffect.name
                );
                
                if (existingIndex !== -1) {
                    notifications.push(`ℹ️ Trạng thái "<b>${currentStatusEffects[existingIndex].name}</b>" đã được cập nhật thành "<b>${newEffect.name}</b>".`);
                    currentStatusEffects[existingIndex] = newEffect;
                } else {
                    notifications.push(`✨ Bạn nhận được trạng thái: <b>${newEffect.name}</b>.`);
                    currentStatusEffects.push(newEffect);
                }
            });
        }
        nextProfile.statusEffects = currentStatusEffects;

        if (newAchievements?.length) {
            const achievementsWithNewFlag = newAchievements.map(a => ({ ...a, isNew: true }));
            achievementsWithNewFlag.forEach(a => notifications.push(`🏆 Thành tích mới: <b>${a.name}</b>!`));
            nextProfile.achievements = [...nextProfile.achievements, ...achievementsWithNewFlag];
        }

        if (updatedAchievements?.length) {
             nextProfile.achievements = nextProfile.achievements.map(ach => {
                const update = updatedAchievements.find(u => u.name === ach.name);
                if (update) {
                    notifications.push(`🏆 Thành tích "<b>${ach.name}</b>" đã được cập nhật!`);
                    return { ...ach, ...update, isNew: true };
                }
                return ach;
            });
        }
    }

    // --- Items ---
    if (response.newItems?.length) {
        const itemsWithCalculatedValue = response.newItems.map(item => ({
            ...item,
            value: calculateItemValue(item, worldSettings),
            isNew: true
        }));
        nextProfile.items = [...nextProfile.items, ...itemsWithCalculatedValue];
        nextProfile.discoveredItems = [...(nextProfile.discoveredItems || []), ...itemsWithCalculatedValue];
    }
    if (response.updatedItems?.length) {
        response.updatedItems.forEach(update => {
            const itemIndex = nextProfile.items.findIndex(i => i.name === update.name);
            if (itemIndex > -1) nextProfile.items[itemIndex].quantity = update.quantity;
        });
    }
    if (response.removedItemIds?.length) {
        const idsToRemove = new Set(response.removedItemIds);
        nextProfile.items = nextProfile.items.filter(item => !idsToRemove.has(item.id));
    }

    // --- Skills ---
    if (response.newSkills?.length) {
        const brandNewSkills: Skill[] = response.newSkills.map(s => ({
            ...s,
            id: `skill_${Date.now()}_${s.name.replace(/\s+/g, '')}`,
            level: 1,
            experience: 0,
            isNew: true,
            manaCost: calculateManaCost({ ...s, level: 1 }, worldSettings.qualityTiers)
        }));
        nextProfile.skills = [...nextProfile.skills, ...brandNewSkills];
    }
    if (response.updatedSkills?.length) {
        let skills = [...nextProfile.skills];
        const api = settings.apiProvider === ApiProvider.OPENAI ? openaiService : geminiService;
        const apiKey = settings.apiProvider === ApiProvider.OPENAI ? settings.openaiApiKey : settings.gemini.useDefault ? USE_DEFAULT_KEY_IDENTIFIER : (settings.gemini.customKeys.find(k => k.id === settings.gemini.activeCustomKeyId)?.key || '');
        
        for (const skillUpdate of response.updatedSkills) {
            const skillIndex = skills.findIndex(s => s.name === skillUpdate.skillName);
            if (skillIndex > -1) {
                const originalSkill = skills[skillIndex];
                const { updatedSkill, breakthroughInfo } = processSkillLevelUps(originalSkill, skillUpdate.gainedExperience, worldSettings.qualityTiers);
                skills[skillIndex] = updatedSkill;
                if (updatedSkill.level > originalSkill.level) {
                    notifications.push(`💪 Kỹ năng "<b>${originalSkill.name}</b>" đã tăng lên cấp ${updatedSkill.level}.`);
                }
                if (breakthroughInfo) {
                    notifications.push(`🔥 **ĐỘT PHÁ!** Kỹ năng "<b>${originalSkill.name}</b>" đã đột phá từ <b>${breakthroughInfo.oldQuality}</b> lên <b>${breakthroughInfo.newQuality}</b>!`);
                    try {
                        const { description, effect } = await api.generateNewSkillDescription(originalSkill, breakthroughInfo.newQuality, worldSettings, apiKey);
                        skills[skillIndex].description = description;
                        skills[skillIndex].effect = effect;
                        notifications.push(`✨ Kỹ năng "<b>${originalSkill.name}</b>" đã có mô tả và hiệu ứng mới!`);
                    } catch (e) {
                        notifications.push(`⚠️ Không thể tạo mô tả mới cho kỹ năng "${originalSkill.name}".`);
                    }
                }
            }
        }
        nextProfile.skills = skills;
    }

    // --- Other Profile Updates ---
    if (response.updatedGender) {
        const newGender = response.updatedGender.toLowerCase();
        if (newGender === 'male' || newGender === 'female') {
            nextProfile.gender = newGender as CharacterGender;
            notifications.push(`✨ Giới tính của bạn đã thay đổi!`);
        }
    }

    if (response.updatedGameTime) {
        nextProfile.gameTime = response.updatedGameTime;
    } else {
        const duration = choice.durationInMinutes || 0;
        if (duration > 0) {
            const newTime = new Date(nextProfile.gameTime);
            newTime.setMinutes(newTime.getMinutes() + duration);
            nextProfile.gameTime = newTime.toISOString();
            
            const formatDuration = (minutes: number): string => {
                if (minutes < 60) return `${minutes} phút`;
                if (minutes < 1440) { // Less than a day
                     const hours = Math.floor(minutes / 60);
                     const remainingMinutes = minutes % 60;
                     return `${hours} giờ` + (remainingMinutes > 0 ? ` ${remainingMinutes} phút` : '');
                }
                const days = Math.floor(minutes / 1440);
                const remainingHours = Math.floor((minutes % 1440) / 60);
                return `${days} ngày` + (remainingHours > 0 ? ` ${remainingHours} giờ` : '');
            };
            
            notifications.push(`⏳ Thời gian đã trôi qua: <b>${formatDuration(duration)}</b>.`);
        }
    }
    
    if (response.newMilestone) {
        const newMilestone: Milestone = {
            turnNumber,
            summary: response.newMilestone,
            isNew: true
        };
        nextProfile.milestones = [...(nextProfile.milestones || []), newMilestone];
        notifications.push(`⭐ Cột mốc mới được ghi nhận: <b>${response.newMilestone}</b>`);
    }

    if (response.updatedPlayerLocationId !== undefined) {
        nextProfile.currentLocationId = response.updatedPlayerLocationId;
    }
    
    // Final recalculation of derived stats from equipment
    nextProfile = recalculateDerivedStats(nextProfile);

    return nextProfile;
};