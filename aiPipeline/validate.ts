import { log } from '../services/logService';

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