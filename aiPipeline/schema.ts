import { Type } from '@google/genai';
import { GAME_CONFIG } from '../config/gameConfig';

export const statusEffectSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        duration: { type: Type.STRING }
    },
    required: ["name", "description", "duration"]
};

export const achievementSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
    },
    required: ["name", "description"]
};

export const updatedStatsSchema = {
    type: Type.OBJECT,
    properties: {
        health: { type: Type.STRING },
        mana: { type: Type.STRING },
        currencyAmount: { type: Type.NUMBER },
        gainedExperience: { type: Type.NUMBER },
        breakthroughToRealm: { type: Type.STRING },
        usedFullRestoreSkill: { type: Type.BOOLEAN },
        newStatusEffects: {
            type: Type.ARRAY,
            items: statusEffectSchema,
        },
        removedStatusEffects: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
        },
        newAchievements: {
            type: Type.ARRAY,
            items: achievementSchema,
        },
        updatedAchievements: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                },
                required: ["name"]
            },
        }
    },
};

export const newSkillSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        type: { type: Type.STRING },
        quality: { type: Type.STRING },
        description: { type: Type.STRING },
        effect: { type: Type.STRING },
        manaCost: { type: Type.NUMBER },
    },
    required: ["name", "type", "quality", "description", "effect", "manaCost"]
};

export const newSkillsArraySchema = {
    type: Type.ARRAY,
    items: newSkillSchema,
};

export const equipmentStatSchema = {
    type: Type.OBJECT,
    properties: {
        key: { type: Type.STRING },
        value: { type: Type.NUMBER }
    },
    required: ["key", "value"]
};

export const equipmentDetailsSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING },
        stats: { type: Type.ARRAY, items: equipmentStatSchema },
    },
    required: ["type", "stats"]
};

export const itemSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        type: { type: Type.STRING },
        quality: { type: Type.STRING },
        quantity: { type: Type.NUMBER },
        equipmentDetails: equipmentDetailsSchema,
        grantsSkill: newSkillSchema,
    },
    required: ["id", "name", "description", "type", "quality", "quantity"]
};

export const newLocationSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        type: { type: Type.STRING },
        coordinates: {
            type: Type.OBJECT,
            properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
            },
            required: ["x", "y"]
        },
        parentId: {
            type: Type.STRING,
        },
        rules: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
        },
    },
    required: ["id", "name", "description", "type", "coordinates", "rules"]
};

export const updatedLocationSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        ownerId: { type: Type.STRING },
        rules: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
        },
        isDestroyed: { type: Type.BOOLEAN },
        isHaremPalace: { type: Type.BOOLEAN },
    },
    required: ['id']
};

export const mienLucSchema = {
    type: Type.OBJECT,
    properties: {
        body: { type: Type.NUMBER },
        face: { type: Type.NUMBER },
        aura: { type: Type.NUMBER },
        power: { type: Type.NUMBER }
    },
    required: ["body", "face", "aura", "power"]
};

export const npcRelationshipSchema = {
    type: Type.OBJECT,
    properties: {
        targetNpcId: { type: Type.STRING },
        value: { type: Type.NUMBER },
    },
    required: ["targetNpcId", "value"]
};

export const specialConstitutionSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
    },
    required: ["name", "description"],
};

export const talentSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
    },
    required: ["name", "description"],
};

export const newNpcSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        gender: { type: Type.STRING },
        race: { type: Type.STRING },
        personality: { type: Type.STRING },
        description: { type: Type.STRING },
        ngoaiHinh: { type: Type.STRING },
        level: { type: Type.NUMBER },
        powerSystem: { type: Type.STRING },
        aptitude: { type: Type.STRING },
        mienLuc: mienLucSchema,
        locationId: { type: Type.STRING },
        specialConstitution: specialConstitutionSchema,
        innateTalent: talentSchema,
        statusEffects: { type: Type.ARRAY, items: statusEffectSchema },
    },
    required: ["id", "name", "gender", "race", "personality", "description", "ngoaiHinh", "level", "powerSystem", "aptitude", "mienLuc", "statusEffects"]
};

export const monsterSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        description: { type: Type.STRING }
    },
    required: ["id", "name", "description"]
};

export const skillSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        type: { type: Type.STRING },
        quality: { type: Type.STRING },
        level: { type: Type.NUMBER },
        experience: { type: Type.NUMBER },
        description: { type: Type.STRING },
        effect: { type: Type.STRING },
        manaCost: { type: Type.NUMBER },
    },
    required: ["id", "name", "type", "quality", "level", "experience", "description", "effect", "manaCost"],
};

export const characterProfileSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        gender: { type: Type.STRING },
        race: { type: Type.STRING },
        appearance: { type: Type.STRING },
        powerSystem: { type: Type.STRING },
        level: { type: Type.NUMBER },
        currencyName: { type: Type.STRING },
        currencyAmount: { type: Type.NUMBER },
        personality: { type: Type.STRING },
        backstory: { type: Type.STRING },
        goal: { type: Type.STRING },
        specialConstitution: specialConstitutionSchema,
        talent: talentSchema,
        skills: { type: Type.ARRAY, items: skillSchema },
        initialItems: { type: Type.ARRAY, items: itemSchema },
        initialNpcs: { type: Type.ARRAY, items: newNpcSchema },
        initialLocations: { type: Type.ARRAY, items: newLocationSchema },
        initialMonsters: { type: Type.ARRAY, items: monsterSchema },
    },
    required: ["name", "gender", "race", "appearance", "powerSystem", "level", "currencyName", "currencyAmount", "personality", "backstory", "goal", "specialConstitution", "talent", "skills", "initialItems", "initialNpcs", "initialLocations", "initialMonsters"]
};

export const powerSystemDefinitionSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        realms: { type: Type.STRING },
    },
    required: ["id", "name", "realms"],
};

export const worldKnowledgeSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        content: { type: Type.STRING },
        category: { type: Type.STRING }
    },
    required: ["id", "title", "content", "category"],
};

export const worldSettingsSchema = {
    type: Type.OBJECT,
    properties: {
        theme: { type: Type.STRING },
        genre: { type: Type.STRING },
        context: { type: Type.STRING },
        powerSystems: { type: Type.ARRAY, items: powerSystemDefinitionSchema },
        qualityTiers: { type: Type.STRING },
        aptitudeTiers: { type: Type.STRING },
        initialKnowledge: { type: Type.ARRAY, items: worldKnowledgeSchema },
    },
    required: ["theme", "genre", "context", "powerSystems", "qualityTiers", "aptitudeTiers", "initialKnowledge"]
};

export const worldCreationSchema = {
    type: Type.OBJECT,
    properties: {
        characterProfile: characterProfileSchema,
        worldSettings: worldSettingsSchema
    },
    required: ["characterProfile", "worldSettings"]
};

export const updatedNpcSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        newName: { type: Type.STRING },
        aliases: { type: Type.STRING },
        gainedExperience: { type: Type.NUMBER },
        breakthroughToRealm: { type: Type.STRING },
        relationship: { type: Type.NUMBER },
        newMemories: { type: Type.ARRAY, items: { type: Type.STRING } },
        health: { type: Type.STRING },
        mana: { type: Type.STRING },
        gender: { type: Type.STRING },
        personality: { type: Type.STRING },
        description: { type: Type.STRING },
        ngoaiHinh: { type: Type.STRING },
        locationId: { type: Type.STRING },
        aptitude: { type: Type.STRING },
        specialConstitution: specialConstitutionSchema,
        innateTalent: talentSchema,
        updatedNpcRelationships: { type: Type.ARRAY, items: npcRelationshipSchema },
        isDaoLu: { type: Type.BOOLEAN },
        isDead: { type: Type.BOOLEAN },
        usedFullRestoreSkill: { type: Type.BOOLEAN },
        newStatusEffects: { type: Type.ARRAY, items: statusEffectSchema },
        removedStatusEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
        updatedSkills: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    skillName: { type: Type.STRING },
                    gainedExperience: { type: Type.NUMBER }
                },
                required: ["skillName", "gainedExperience"]
            },
        },
        newlyLearnedSkills: { type: Type.ARRAY, items: skillSchema },
    },
    required: ["id"]
};

export const choiceSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        benefit: { type: Type.STRING },
        risk: { type: Type.STRING },
        successChance: { type: Type.NUMBER },
        durationInMinutes: { type: Type.NUMBER },
        specialNote: { type: Type.STRING },
    },
    required: ["title", "benefit", "risk", "successChance", "durationInMinutes", "specialNote"]
};

export const storyWorldKnowledgeSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        content: { type: Type.STRING },
        category: { type: Type.STRING }
    },
    required: ["id", "title", "content", "category"]
};

const newMonsterStorySchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING }
    },
    required: ["name", "description"]
};

const eventRewardsSchema = {
    type: Type.OBJECT,
    properties: {
        experience: { type: Type.NUMBER },
        currency: { type: Type.NUMBER },
        items: { type: Type.ARRAY, items: itemSchema }
    }
};

const newEventSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        initialLog: { type: Type.STRING }
    },
    required: ['title', 'description', 'initialLog']
};

const updateEventLogSchema = {
    type: Type.OBJECT,
    properties: {
        eventId: { type: Type.STRING },
        logEntry: { type: Type.STRING }
    },
    required: ['eventId', 'logEntry']
};

const completeEventSchema = {
    type: Type.OBJECT,
    properties: {
        eventId: { type: Type.STRING },
        finalLog: { type: Type.STRING }
    },
    required: ['eventId', 'finalLog']
};


const fullResponseProperties = {
    story: { type: Type.STRING },
    choices: {
        type: Type.ARRAY,
        items: choiceSchema
    },
    updatedStats: updatedStatsSchema,
    updatedGameTime: {
        type: Type.STRING,
    },
    updatedGender: { type: Type.STRING },
    newSkills: {
        type: Type.ARRAY,
        items: newSkillSchema,
    },
    updatedSkills: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                skillName: { type: Type.STRING },
                gainedExperience: { type: Type.NUMBER }
            },
            required: ["skillName", "gainedExperience"]
        },
    },
    newLocations: {
        type: Type.ARRAY,
        items: newLocationSchema,
    },
    updatedLocations: {
        type: Type.ARRAY,
        items: updatedLocationSchema,
    },
    updatedPlayerLocationId: {
        type: Type.STRING,
    },
    newNPCs: {
        type: Type.ARRAY,
        items: newNpcSchema,
    },
    updatedNPCs: {
        type: Type.ARRAY,
        items: updatedNpcSchema,
    },
    newItems: {
        type: Type.ARRAY,
        items: itemSchema,
    },
    updatedItems: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
            },
            required: ["name", "quantity"],
        },
    },
    removedItemIds: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
    },
    newMonsters: {
        type: Type.ARRAY,
        items: newMonsterStorySchema,
    },
    newWorldKnowledge: {
        type: Type.ARRAY,
        items: storyWorldKnowledgeSchema,
    },
    newMilestone: {
        type: Type.STRING,
    },
    // Event System
    newEvent: newEventSchema,
    updateEventLog: updateEventLogSchema,
    completeEvent: completeEventSchema,
    // Identity System
    activateGenderSwapIdentity: { type: Type.BOOLEAN },
};

const stateUpdateProperties = { ...fullResponseProperties };
// @ts-ignore
delete stateUpdateProperties.story;
// @ts-ignore
delete stateUpdateProperties.choices;
// @ts-ignore
delete stateUpdateProperties.activateGenderSwapIdentity; // Remove from state-only updates as well

export const responseSchema = {
    type: Type.OBJECT,
    properties: {
        ...stateUpdateProperties,
        story: fullResponseProperties.story,
        choices: fullResponseProperties.choices,
    },
    required: ["story", "choices"]
};

export const stateUpdateSchema = {
    type: Type.OBJECT,
    properties: stateUpdateProperties,
};

export const narrativeSchema = {
    type: Type.OBJECT,
    properties: {
        story: fullResponseProperties.story,
        choices: fullResponseProperties.choices,
    },
    required: ["story", "choices"],
};


export const newSkillDescriptionSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING },
        effect: { type: Type.STRING }
    },
    required: ["description", "effect"]
};

export const identityGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        appearance: { type: Type.STRING, description: "Mô tả ngoại hình chi tiết cho nhân dạng mới." },
        personality: { type: Type.STRING, description: "Các đặc điểm tính cách của nhân dạng mới này." },
        backstory: { type: Type.STRING, description: "Một tiểu sử hợp lý cho nhân dạng này, phù hợp với thế giới game." },
        goal: { type: Type.STRING, description: "Mục tiêu hoặc nhiệm vụ chính của nhân dạng này." }
    },
    required: ["appearance", "personality", "backstory", "goal"]
};
