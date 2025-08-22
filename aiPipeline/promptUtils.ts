import { CharacterProfile, WorldSettings, NPC, Location, Item, Achievement, Monster, LocationType, Milestone, GameEvent, ItemType, Skill } from '../../types';

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
    milestones: Milestone[];
    discoveredMonsters: Monster[];
    activeEvents: Partial<GameEvent>[];
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
    }).map(({ id, name, aliases, gender, race, personality, description, level, realm, relationship, isDaoLu, specialConstitution, innateTalent, memories, skills }) => ({
        id, name, aliases, gender, race, personality, 
        description: description.substring(0, 150) + (description.length > 150 ? '...' : ''),
        level, realm, relationship, isDaoLu,
        specialConstitution,
        innateTalent,
        memories,
        skills: skills.map(({ id, name, type, quality, level, experience, description, effect, manaCost }) => ({ id, name, type, quality, level, experience, description, effect, manaCost })),
    }));

    // 2. Lọc Địa điểm theo ngữ cảnh: địa phương và toàn cục.
    let localLocations: Partial<Location>[] = [];
    if (currentLocation) {
        const parentId = currentLocation.parentId || currentLocation.id;
        localLocations = characterProfile.discoveredLocations
            .filter(loc => loc.parentId === parentId || loc.id === parentId)
            .map(({ id, name, description, type, isDestroyed }) => ({ 
                id, name, 
                description: description.substring(0, 150) + (description.length > 150 ? '...' : ''),
                type, isDestroyed 
            }));
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
            const summarizedItem: Partial<Item> = {
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                type: item.type
            };
            if (item.type === ItemType.BI_KIP && item.grantsSkill) {
                summarizedItem.grantsSkill = item.grantsSkill;
            }
            summarizedBagItems.push(summarizedItem);
        }
    });

    // 6. Lọc các sự kiện/nhiệm vụ đang hoạt động
    const activeEvents = (characterProfile.events || [])
        .filter(event => event.status === 'active')
        .map(({ id, title, description }) => ({ id, title, description }));

    // 7. Tối giản Character Profile: loại bỏ các danh sách lớn sẽ được xử lý riêng.
    const { 
        items, equipment, discoveredLocations, discoveredMonsters, discoveredItems, 
        initialItems, initialLocations, initialNpcs, initialMonsters,
        specialConstitution,
        talent,
        achievements,
        milestones,
        skills,
        events, // exclude events from minimal profile
        ...rest 
    } = characterProfile;
    
    const minimalCharacterProfile: any = { ...rest };
    minimalCharacterProfile.skills = skills.map(({ name, type, quality, level, manaCost }) => ({ name, type, quality, level, manaCost }));


    return {
        contextualNpcs: contextualNpcs as Partial<NPC>[],
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
        milestones: milestones || [],
        discoveredMonsters: discoveredMonsters || [],
        activeEvents,
    };
};
