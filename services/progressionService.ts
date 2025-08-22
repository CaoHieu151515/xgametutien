
import { CharacterProfile, WorldSettings, Skill, NPC, Item, StatusEffect } from '../types';
import { log } from './logService';
import { GAME_CONFIG } from '../config/gameConfig';

export const getExperienceForNextLevel = (level: number): number => {
    const { base, exponent } = GAME_CONFIG.progression.xp;
    return Math.round(base * Math.pow(level, exponent));
};

export const getSkillExperienceForNextLevel = (level: number, quality: string, qualityTiersString: string): number => {
    const { base, exponent, qualityMultiplier } = GAME_CONFIG.progression.skillXp;
    const qualityTiers = qualityTiersString.split(' - ').map(q => q.trim()).filter(Boolean);
    const qualityIndex = qualityTiers.indexOf(quality);

    const finalQualityMultiplier = 1 + (qualityIndex > 0 ? qualityIndex * qualityMultiplier : 0);
    const baseExp = base * Math.pow(level, exponent);
    
    return Math.round(baseExp * finalQualityMultiplier);
};

export const calculateManaCost = (
    skill: Pick<Skill, 'quality' | 'level' | 'type'>, 
    qualityTiersString: string
): number => {
    const { base, perLevel, qualityMultiplier, typeMultiplier } = GAME_CONFIG.progression.manaCost;
    const qualityTiers = qualityTiersString.split(' - ').map(q => q.trim()).filter(Boolean);
    const qualityIndex = qualityTiers.indexOf(skill.quality);
    
    const finalQualityMultiplier = qualityIndex >= 0 ? Math.pow(qualityMultiplier, qualityIndex) : 1;
    const finalTypeMultiplier = typeMultiplier[skill.type] || 1.0;
    
    const cost = (base + (skill.level - 1) * perLevel) * finalQualityMultiplier * finalTypeMultiplier;
    
    return Math.max(1, Math.round(cost));
};

export const getRealmDisplayName = (level: number, powerSystemName: string, worldSettings: WorldSettings | null): string => {
    if (!worldSettings || !worldSettings.powerSystems || worldSettings.powerSystems.length === 0) return "Phàm Nhân";

    const powerSystem = worldSettings.powerSystems.find(ps => ps && ps.name === powerSystemName);

    if (!powerSystem || !powerSystem.realms.trim()) {
        const firstValidPowerSystem = worldSettings.powerSystems.find(ps => ps && ps.realms);
        const firstRealm = firstValidPowerSystem?.realms.split(' - ')[0]?.trim();
        return firstRealm || "Phàm Nhân";
    }
    
    const realms = powerSystem.realms.split(' - ').map(r => r.trim()).filter(Boolean);
    if (realms.length === 0) return "Phàm Nhân";

    if (level < 1) {
        return realms[0] || "Phàm Nhân";
    }

    const { subRealmLevels } = GAME_CONFIG.progression;
    const levelsPerRealm = subRealmLevels.length;
    const realmIndex = Math.floor((level - 1) / levelsPerRealm);
    const subLevelIndex = (level - 1) % levelsPerRealm;

    if (realmIndex >= realms.length) {
        const lastRealm = realms[realms.length - 1];
        const lastSubRealm = subRealmLevels[subRealmLevels.length - 1];
        return `${lastRealm} ${lastSubRealm}`;
    }

    const realmName = realms[realmIndex];
    const subLevelName = subRealmLevels[subLevelIndex];

    return `${realmName} ${subLevelName}`;
};

export const getLevelFromRealmName = (realmInput: string, powerSystemName: string, worldSettings: WorldSettings | null): number => {
    if (!realmInput.trim() || !worldSettings || !worldSettings.powerSystems || !worldSettings.powerSystems.length) return 1;

    const powerSystem = worldSettings.powerSystems.find(ps => ps && ps.name === powerSystemName);
    if (!powerSystem || !powerSystem.realms.trim()) return 1;

    const realms = powerSystem.realms.split(' - ').map(r => r.trim());
    const normalizedInput = realmInput.trim().toLowerCase();
    const { subRealmLevels } = GAME_CONFIG.progression;
    const levelsPerRealm = subRealmLevels.length;

    let bestMatch: { realmName: string; realmIndex: number; } | null = null;

    // Iterate through all main realms to find the longest prefix match.
    // This handles cases where one realm name is a substring of another (e.g., "Tiên" and "Chân Tiên").
    for (let i = 0; i < realms.length; i++) {
        const realmName = realms[i].toLowerCase();
        
        if (normalizedInput.startsWith(realmName)) {
             // To be a valid prefix, it must be the full string or be followed by a space.
             // This prevents "Tiên" from matching "Tiên Nhân".
            if (normalizedInput.length === realmName.length || normalizedInput[realmName.length] === ' ') {
                if (!bestMatch || realmName.length > bestMatch.realmName.length) {
                    bestMatch = {
                        realmName: realmName,
                        realmIndex: i,
                    };
                }
            }
        }
    }

    if (bestMatch) {
        const baseLevel = bestMatch.realmIndex * levelsPerRealm;
        const afterRealm = normalizedInput.substring(bestMatch.realmName.length).trim();

        if (afterRealm === '') {
            return baseLevel + 1; // Default to the first sub-level of the realm.
        }
        
        // Sort sub-realms by length descending to match longer names first (e.g. "Viên Mãn" before "Mãn")
        const sortedSubRealms = [...subRealmLevels].sort((a, b) => b.length - a.length);
        
        for (const subRealm of sortedSubRealms) {
            if (afterRealm === subRealm.toLowerCase()) {
                const originalIndex = subRealmLevels.findIndex(r => r.toLowerCase() === subRealm.toLowerCase());
                if (originalIndex !== -1) {
                    return baseLevel + originalIndex + 1;
                }
            }
        }
    }

    log('progressionService.ts', `Could not parse realm name "${realmInput}" for power system "${powerSystemName}". Defaulting to level 1.`, 'ERROR');
    return 1;
};

export const calculateBaseStatsForLevel = (level: number) => {
    const { 
        healthPerLevel, healthPerRealm, manaPerLevel, manaPerRealm, 
        attackPerLevel, attackPerRealm, baseLifespan, lifespanBonuses 
    } = GAME_CONFIG.progression.baseStats;
    const { subRealmLevels } = GAME_CONFIG.progression;
    const levelsPerRealm = subRealmLevels.length;
    
    const realmIndex = Math.floor((level - 1) / levelsPerRealm);
    
    const maxHealth = 100 + ((level - 1) * healthPerLevel) + (realmIndex * healthPerRealm);
    const maxMana = 100 + ((level - 1) * manaPerLevel) + (realmIndex * manaPerRealm);
    const attack = 10 + ((level - 1) * attackPerLevel) + (realmIndex * attackPerRealm);

    let lifespan = baseLifespan;
    for (let i = 1; i <= realmIndex; i++) {
        lifespan += lifespanBonuses[i] || (i * lifespanBonuses[lifespanBonuses.length - 1]);
    }

    return { maxHealth, maxMana, attack, lifespan };
};

export const recalculateDerivedStats = <T extends CharacterProfile>(profile: T): T => {
    const newProfile = { ...profile };

    newProfile.maxHealth = newProfile.baseMaxHealth;
    newProfile.maxMana = newProfile.baseMaxMana;
    newProfile.attack = newProfile.baseAttack;

    newProfile.statusEffects = newProfile.statusEffects.filter(e => e.duration !== 'Trang bị');
    
    const equippedItems = Object.values(newProfile.equipment)
        .map(itemId => newProfile.items.find(i => i.id === itemId))
        .filter((item): item is Item => !!item);

    for (const item of equippedItems) {
        if (item.equipmentDetails) {
            for (const stat of item.equipmentDetails.stats) {
                if (stat.key === 'maxHealth') newProfile.maxHealth += stat.value;
                else if (stat.key === 'maxMana') newProfile.maxMana += stat.value;
                else if (stat.key === 'attack') newProfile.attack += stat.value;
            }
            if (item.equipmentDetails.effect) {
                const newEffect: StatusEffect = {
                    name: `Trang bị: ${item.name}`,
                    description: item.equipmentDetails.effect,
                    duration: 'Trang bị'
                };
                newProfile.statusEffects.push(newEffect);
            }
        }
    }
    
    newProfile.health = Math.min(newProfile.health, newProfile.maxHealth);
    newProfile.mana = Math.min(newProfile.mana, newProfile.maxMana);
    
    return newProfile;
};


export const processLevelUps = <T extends CharacterProfile>(
    profile: T, 
    addedExperience: number,
    worldSettings: WorldSettings | null
): T => {
    log('progressionService.ts', `Processing level up for ${profile.name} with ${addedExperience} EXP.`, 'FUNCTION');
    
    let updatedProfile = { ...profile };
    let currentExperience = profile.experience + addedExperience;
    let xpForNextLevel = getExperienceForNextLevel(updatedProfile.level);
    let hasLeveledUp = false;

    while (currentExperience >= xpForNextLevel) {
        currentExperience -= xpForNextLevel;
        updatedProfile.level += 1;
        hasLeveledUp = true;
        log('progressionService.ts', `${profile.name} leveled up to ${updatedProfile.level}!`, 'INFO');
        xpForNextLevel = getExperienceForNextLevel(updatedProfile.level);
    }
    
    updatedProfile.experience = currentExperience;

    if (hasLeveledUp) {
        const newBaseStats = calculateBaseStatsForLevel(updatedProfile.level);
        updatedProfile.baseMaxHealth = newBaseStats.maxHealth;
        updatedProfile.baseMaxMana = newBaseStats.maxMana;
        updatedProfile.baseAttack = newBaseStats.attack;
        updatedProfile.lifespan = newBaseStats.lifespan;
    }

    updatedProfile = recalculateDerivedStats(updatedProfile);

    if (hasLeveledUp) {
        updatedProfile.health = updatedProfile.maxHealth;
        updatedProfile.mana = updatedProfile.maxMana;
    }

    updatedProfile.realm = getRealmDisplayName(updatedProfile.level, updatedProfile.powerSystem, worldSettings);

    return updatedProfile;
};

export const processSkillLevelUps = (
    skill: Skill,
    addedExperience: number,
    qualityTiersString: string
): { updatedSkill: Skill; breakthroughInfo: { oldQuality: string; newQuality: string } | null } => {
    let updatedSkill = { ...skill };
    let breakthroughInfo: { oldQuality: string; newQuality: string } | null = null;
    const { subRealmLevels } = GAME_CONFIG.progression;
    const levelsPerRealm = subRealmLevels.length;
    
    updatedSkill.experience += addedExperience;
    let xpForNextLevel = getSkillExperienceForNextLevel(updatedSkill.level, updatedSkill.quality, qualityTiersString);
    const qualityTiers = qualityTiersString.split(' - ').map(q => q.trim()).filter(Boolean);

    while (updatedSkill.experience >= xpForNextLevel && updatedSkill.level < levelsPerRealm) {
        updatedSkill.experience -= xpForNextLevel;
        updatedSkill.level += 1;
        xpForNextLevel = getSkillExperienceForNextLevel(updatedSkill.level, updatedSkill.quality, qualityTiersString);
        log('progressionService.ts', `Skill "${skill.name}" leveled up to ${updatedSkill.level}.`, 'INFO');
    }

    if (updatedSkill.level === levelsPerRealm && updatedSkill.experience >= xpForNextLevel) {
        const currentQualityIndex = qualityTiers.indexOf(updatedSkill.quality);
        if (currentQualityIndex !== -1 && currentQualityIndex < qualityTiers.length - 1) {
            const newQuality = qualityTiers[currentQualityIndex + 1];
            breakthroughInfo = { oldQuality: updatedSkill.quality, newQuality };
            log('progressionService.ts', `Skill "${skill.name}" broke through to ${newQuality}!`, 'INFO');
            
            updatedSkill.quality = newQuality;
            updatedSkill.level = 1;
            updatedSkill.experience = 0;
        } else {
            updatedSkill.experience = xpForNextLevel;
        }
    }

    updatedSkill.manaCost = calculateManaCost(updatedSkill, qualityTiersString);

    return { updatedSkill, breakthroughInfo };
};


export const calculateAptitudeExpBonus = (aptitude: string, aptitudeTiersString: string): number => {
    const { bonusPerTier } = GAME_CONFIG.progression.aptitude;
    if (!aptitudeTiersString) return 1.0;
    const tiers = aptitudeTiersString.split(' - ').map(t => t.trim()).filter(Boolean);
    if (tiers.length === 0) return 1.0;
    
    const index = tiers.indexOf(aptitude);
    if (index === -1) return 1.0;

    return 1.0 + (index * bonusPerTier);
};


export const processNpcLevelUps = <T extends NPC>(
    npc: T,
    addedExperience: number,
    worldSettings: WorldSettings | null
): T => {
    let updatedNpc = { ...npc };
    if (!worldSettings) return updatedNpc;
    
    log('progressionService.ts', `Processing level up for NPC ${npc.name} with ${addedExperience} EXP.`, 'FUNCTION');
    
    const powerSystem = worldSettings.powerSystems.find(ps => ps && ps.name === npc.powerSystem);
    if (!powerSystem) return updatedNpc;

    const systemMaxLevel = (powerSystem.realms.split(' - ').filter(r => r.trim()).length * GAME_CONFIG.progression.subRealmLevels.length) || updatedNpc.level;
    const absoluteMaxLevel = GAME_CONFIG.npc.maxNpcLevel;
    const maxLevel = Math.min(systemMaxLevel, absoluteMaxLevel);

    if (updatedNpc.level >= maxLevel) {
        if (updatedNpc.experience !== 0) {
            return { ...updatedNpc, level: maxLevel, experience: 0 };
        }
        return updatedNpc;
    }
    
    const aptitudeBonus = calculateAptitudeExpBonus(npc.aptitude, worldSettings.aptitudeTiers || '');
    const finalExperience = Math.round(addedExperience * aptitudeBonus);
    
    let currentExperience = npc.experience + finalExperience;
    let xpForNextLevel = getExperienceForNextLevel(updatedNpc.level);
    let hasLeveledUp = false;

    while (currentExperience >= xpForNextLevel && updatedNpc.level < maxLevel) {
        currentExperience -= xpForNextLevel;
        updatedNpc.level += 1;
        hasLeveledUp = true;
        log('progressionService.ts', `NPC ${npc.name} leveled up to ${updatedNpc.level}.`, 'INFO');
        xpForNextLevel = getExperienceForNextLevel(updatedNpc.level);
    }
    
    updatedNpc.experience = currentExperience;
    
    if (updatedNpc.level >= maxLevel) {
        updatedNpc.level = maxLevel;
        updatedNpc.experience = 0;
        hasLeveledUp = true; 
    }
    
    if (hasLeveledUp) {
        const newStats = calculateBaseStatsForLevel(updatedNpc.level);
        updatedNpc.health = newStats.maxHealth;
        updatedNpc.mana = newStats.maxMana;
    }

    updatedNpc.realm = getRealmDisplayName(updatedNpc.level, updatedNpc.powerSystem, worldSettings);

    return updatedNpc;
};

export const calculateExperienceForBreakthrough = (
    currentLevel: number,
    currentExperience: number,
    targetLevel: number
): number => {
    if (targetLevel <= currentLevel) {
        log('progressionService.ts', `Target level ${targetLevel} is not higher than current level ${currentLevel}. No XP calculated.`, 'INFO');
        return 0;
    }

    let totalExperienceNeeded = 0;

    // First, add XP needed to level up from the current level
    const xpForCurrentLevel = getExperienceForNextLevel(currentLevel);
    totalExperienceNeeded += (xpForCurrentLevel - currentExperience);

    // Then, add XP for all intermediate levels
    for (let level = currentLevel + 1; level < targetLevel; level++) {
        totalExperienceNeeded += getExperienceForNextLevel(level);
    }

    log('progressionService.ts', `Calculated ${totalExperienceNeeded} EXP needed to go from Lvl ${currentLevel} to ${targetLevel}.`, 'FUNCTION');
    return totalExperienceNeeded > 0 ? Math.ceil(totalExperienceNeeded) : 0; // Ensure non-negative and integer
};
