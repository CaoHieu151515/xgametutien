import { CharacterProfile, WorldSettings, NPC, Location, Item, Achievement, Monster, LocationType } from '../types';

interface ContextualPromptData {
    contextualNpcs: Partial<NPC>[];
    localLocations: Partial<Location>[];
    globalLocations: Partial<Location>[];
    locationRules: string;
    minimalCharacterProfile: Partial<CharacterProfile>;
    equippedItems: Item[];
    summarizedBagItems: Partial<Item>[];
    optimizedWorldSettings: Partial<WorldSettings>;
    specialConstitution: CharacterProfile['specialConstitution'];
    talent: CharacterProfile['talent'];
    achievements: Achievement[];
    discoveredMonsters: Monster[];
}

/**
 * Lấy tất cả các địa điểm cha của một địa điểm, bao gồm cả chính nó.
 * @param locationId ID của địa điểm bắt đầu.
 * @param locationMap Một Map chứa tất cả các địa điểm đã biết.
 * @returns Một mảng các địa điểm cha, từ cấp cao nhất đến địa điểm hiện tại.
 */
const getLocationAncestors = (locationId: string | null, locationMap: Map<string, Location>): Location[] => {
    const path: Location[] = [];
    if (!locationId) return path;

    let current = locationMap.get(locationId);
    while (current) {
        path.unshift(current);
        current = current.parentId ? locationMap.get(current.parentId) : undefined;
    }
    return path;
};

/**
 * Xây dựng ngữ cảnh tối ưu hóa để gửi cho AI.
 * @param characterProfile Hồ sơ nhân vật đầy đủ.
 * @param worldSettings Cài đặt thế giới đầy đủ.
 * @param npcs Danh sách NPC đầy đủ.
 * @param historyText Lịch sử các lượt đi gần nhất.
 * @returns Một đối tượng chứa dữ liệu đã được lọc và tóm tắt.
 */
export const buildContextForPrompt = (
    characterProfile: CharacterProfile,
    worldSettings: WorldSettings,
    npcs: NPC[],
    historyText: string
): ContextualPromptData => {
    const locationMap = new Map(characterProfile.discoveredLocations.map(loc => [loc.id, loc]));
    const currentLocation = characterProfile.currentLocationId ? locationMap.get(characterProfile.currentLocationId) : null;

    // 1. Lọc NPC theo ngữ cảnh: chỉ những NPC có mặt hoặc được nhắc đến gần đây.
    const contextualNpcs = npcs.filter(npc => {
        const isPresent = npc.locationId === characterProfile.currentLocationId;
        const isMentioned = historyText.includes(npc.name) || (npc.aliases && npc.aliases.split(',').some(alias => historyText.includes(alias.trim())));
        return !npc.isDead && (isPresent || isMentioned);
    }).map(({ id, name, aliases, gender, race, personality, description, level, realm, relationship, isDaoLu }) => ({
        id, name, aliases, gender, race, personality, description, level, realm, relationship, isDaoLu
    }));

    // 2. Lọc Địa điểm theo ngữ cảnh: địa phương và toàn cục.
    let localLocations: Partial<Location>[] = [];
    if (currentLocation) {
        const parentId = currentLocation.parentId || currentLocation.id;
        localLocations = characterProfile.discoveredLocations
            .filter(loc => loc.parentId === parentId || loc.id === parentId)
            .map(({ id, name, description, type, isDestroyed }) => ({ id, name, description, type, isDestroyed }));
    }
    const globalLocations = characterProfile.discoveredLocations
        .filter(loc => loc.type === LocationType.THE_LUC || loc.type === LocationType.CITY || loc.type === LocationType.WORLD)
        .map(({ id, name }) => ({ id, name }));

    // 3. Xây dựng "Chuỗi Luật Lệ" từ vị trí hiện tại ngược lên.
    const path = getLocationAncestors(characterProfile.currentLocationId, locationMap);
    const locationRules = path.flatMap(loc => (loc.rules || []).map(rule => `(Từ ${loc.name}) ${rule}`)).join('\n');
    
    // 4. Tối ưu hóa World Settings: chỉ gửi các quy luật cốt lõi.
    const optimizedWorldSettings = {
        powerSystems: worldSettings.powerSystems,
        qualityTiers: worldSettings.qualityTiers,
        aptitudeTiers: worldSettings.aptitudeTiers,
        playerDefinedRules: worldSettings.playerDefinedRules,
    };

    // 5. Tối ưu hóa Túi đồ: chi tiết cho trang bị, tóm tắt cho vật phẩm khác.
    const equippedItems: Item[] = [];
    const summarizedBagItems: Partial<Item>[] = [];
    characterProfile.items.forEach(item => {
        if (item.isEquipped) {
            equippedItems.push(item);
        } else {
            summarizedBagItems.push({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                type: item.type
            });
        }
    });

    // 6. Tối giản Character Profile: loại bỏ các danh sách lớn sẽ được xử lý riêng.
    const { 
        items, equipment, discoveredLocations, discoveredMonsters, discoveredItems, 
        initialItems, initialLocations, initialNpcs, initialMonsters,
        specialConstitution,
        talent,
        achievements,
        ...rest 
    } = characterProfile;
    
    const minimalCharacterProfile = rest;

    return {
        contextualNpcs,
        localLocations,
        globalLocations,
        locationRules,
        minimalCharacterProfile,
        equippedItems,
        summarizedBagItems,
        optimizedWorldSettings,
        specialConstitution,
        talent,
        achievements: achievements || [],
        discoveredMonsters: discoveredMonsters || [],
    };
};