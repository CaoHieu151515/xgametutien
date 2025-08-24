import { log } from '../services/logService';
import { StoryResponse, CharacterProfile, NPC, WorldSettings } from '../types';
import { getLevelFromRealmName } from '../services/progressionService';

export const parseAndValidateJson = <T>(jsonText: string): T => {
    let result: T;
    try {
        result = JSON.parse(jsonText);
    } catch (e) {
        log('validate.ts', `Failed to parse JSON: ${(e as Error).message}`, 'ERROR');
        console.error("Invalid JSON from AI:", jsonText);
        throw new Error("Phản hồi từ AI không phải là JSON hợp lệ.");
    }

    if (!result || typeof result !== 'object') {
        log('validate.ts', `Validated data is not an object: ${result}`, 'ERROR');
        throw new Error("Dữ liệu trả về từ AI không phải là một đối tượng hợp lệ.");
    }
    
    return result;
};

export const validateWorldGenResponse = (result: any): void => {
    if (!result.characterProfile || !result.worldSettings) {
        console.error("Dữ liệu AI không đầy đủ (thiếu characterProfile hoặc worldSettings):", result);
        throw new Error("Phản hồi từ AI thiếu 'characterProfile' hoặc 'worldSettings'.");
    }

    const { characterProfile, worldSettings } = result;

    const validationMap: { [key: string]: { data: any[], keys: string[] } } = {
        'worldSettings.powerSystems': { data: worldSettings.powerSystems, keys: ['id', 'name', 'realms'] },
        'worldSettings.initialKnowledge': { data: worldSettings.initialKnowledge, keys: ['id', 'title', 'content', 'category'] },
        'characterProfile.skills': { data: characterProfile.skills, keys: ['id', 'name'] },
        'characterProfile.initialItems': { data: characterProfile.initialItems, keys: ['id', 'name'] },
        'characterProfile.initialNpcs': { data: characterProfile.initialNpcs, keys: ['id', 'name'] },
        'characterProfile.initialLocations': { data: characterProfile.initialLocations, keys: ['id', 'name'] },
        'characterProfile.initialMonsters': { data: characterProfile.initialMonsters, keys: ['id', 'name'] },
    };

    for (const [arrayName, validation] of Object.entries(validationMap)) {
        if (!validation.data || !Array.isArray(validation.data)) {
            console.error(`Thuộc tính '${arrayName}' không phải là một mảng hoặc bị thiếu:`, validation.data);
            console.error("Toàn bộ dữ liệu:", result);
            throw new Error(`Thuộc tính '${arrayName}' không hợp lệ. Vui lòng kiểm tra console.`);
        }
        for (let i = 0; i < validation.data.length; i++) {
            const item = validation.data[i];
            if (!item || typeof item !== 'object') {
                console.error(`Phần tử không hợp lệ tại chỉ số ${i} trong '${arrayName}':`, item);
                console.error("Toàn bộ dữ liệu:", result);
                throw new Error(`Một phần tử trong '${arrayName}' không phải là một đối tượng hợp lệ. Vui lòng kiểm tra console.`);
            }
            for (const key of validation.keys) {
                if (item[key] === undefined || item[key] === null) {
                     console.error(`Phần tử thiếu key '${key}' tại chỉ số ${i} trong '${arrayName}':`, item);
                     console.error("Toàn bộ dữ liệu:", result);
                     throw new Error(`Một phần tử trong '${arrayName}' thiếu thuộc tính bắt buộc '${key}'. Vui lòng kiểm tra console.`);
                }
            }
        }
    }
}

/**
 * Xác minh tính nhất quán logic của phản hồi từ AI so với trạng thái game hiện tại.
 * Ném ra một lỗi nếu phát hiện sự không nhất quán.
 * @param response Phản hồi StoryResponse từ AI.
 * @param profile Trạng thái CharacterProfile hiện tại.
 * @param npcs Mảng các NPC hiện tại.
 * @param worldSettings Cài đặt thế giới hiện tại.
 */
export const verifyStoryResponse = (
    response: StoryResponse,
    profile: CharacterProfile,
    npcs: NPC[],
    worldSettings: WorldSettings
): void => {
    const verificationName = 'aiPipeline/validate.ts';

    // Kiểm tra updatedNPCs
    if (response.updatedNPCs) {
        const newNpcIdsInThisResponse = new Set((response.newNPCs || []).map(n => n.id));
        for (const update of response.updatedNPCs) {
            const existsInCurrentState = npcs.some(npc => npc.id === update.id);
            const isCreatedInThisResponse = newNpcIdsInThisResponse.has(update.id);

            if (!existsInCurrentState && !isCreatedInThisResponse) {
                const errorMsg = `AI tried to update non-existent NPC with ID: ${update.id}`;
                log(verificationName, errorMsg, 'ERROR');
                throw new Error(errorMsg);
            }
        }
    }

    // Kiểm tra updatedSkills
    if (response.updatedSkills) {
        for (const update of response.updatedSkills) {
            const isActualSkill = profile.skills.some(skill => skill.name === update.skillName);
            const isTalent = profile.talent?.name === update.skillName;
            const isSpecialConstitution = profile.specialConstitution?.name === update.skillName;

            if (!isActualSkill && !isTalent && !isSpecialConstitution) {
                const errorMsg = `AI tried to update non-existent skill/ability: "${update.skillName}"`;
                log(verificationName, errorMsg, 'ERROR');
                throw new Error(errorMsg);
            }
        }
    }

    // Kiểm tra removedItemIds
    if (response.removedItemIds) {
        for (const id of response.removedItemIds) {
            if (!profile.items.some(item => item.id === id)) {
                const errorMsg = `AI tried to remove non-existent item with ID: ${id}`;
                 log(verificationName, errorMsg, 'ERROR');
                throw new Error(errorMsg);
            }
        }
    }
    
    // Kiểm tra updatedItems
    if (response.updatedItems) {
        for (const update of response.updatedItems) {
            const existingItem = profile.items.find(item => item.name === update.name);
            if (!existingItem) {
                const errorMsg = `AI tried to update quantity of non-existent item: "${update.name}"`;
                log(verificationName, errorMsg, 'ERROR');
                throw new Error(errorMsg);
            }
        }
    }
    
    // Kiểm tra logic đột phá cho người chơi
    if (response.updatedStats?.breakthroughToRealm) {
        const currentLevel = profile.level;
        const targetLevel = getLevelFromRealmName(response.updatedStats.breakthroughToRealm, profile.powerSystem, worldSettings);
        if (targetLevel <= currentLevel) {
            const errorMsg = `AI requested player breakthrough to realm "${response.updatedStats.breakthroughToRealm}" (Lvl ${targetLevel}) which is not higher than current level (${currentLevel}).`;
            log(verificationName, errorMsg, 'ERROR');
            throw new Error(errorMsg);
        }
    }
    
    // Kiểm tra logic đột phá cho NPC
     if (response.updatedNPCs) {
        for (const update of response.updatedNPCs) {
            if (update.breakthroughToRealm) {
                const npc = npcs.find(n => n.id === update.id);
                if (npc) {
                    const currentLevel = npc.level;
                    const targetLevel = getLevelFromRealmName(update.breakthroughToRealm, npc.powerSystem, worldSettings);
                    if (targetLevel <= currentLevel) {
                        const errorMsg = `AI requested NPC "${npc.name}" breakthrough to realm "${update.breakthroughToRealm}" (Lvl ${targetLevel}) which is not higher than current level (${currentLevel}).`;
                        log(verificationName, errorMsg, 'ERROR');
                        throw new Error(errorMsg);
                    }
                }
            }
        }
    }
};