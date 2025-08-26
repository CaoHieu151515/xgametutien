
import { FullGameState, Identity, NPC, GameSnapshot } from '../types';
import { log } from '../services/logService';

export const migrateGameState = (data: any): FullGameState => {
    // Tạo bản sao sâu để tránh thay đổi đối tượng gốc từ cache của IndexedDB
    const migratedData: FullGameState = JSON.parse(JSON.stringify(data));

    // --- Di trú cấp cao nhất của FullGameState ---
    if (migratedData.identities === undefined) {
        migratedData.identities = [];
    }
    if (migratedData.activeIdentityId === undefined) {
        migratedData.activeIdentityId = null;
    }

    // --- Di trú cho CharacterProfile ---
    if (migratedData.characterProfile) {
        const profile = migratedData.characterProfile;
        if (profile.appearance === undefined) profile.appearance = '';
        if (profile.secrets === undefined) profile.secrets = [];
        if (profile.reputations === undefined) profile.reputations = [];
        if (profile.events === undefined) profile.events = [];
        if (profile.achievements === undefined) profile.achievements = [];
        if (profile.milestones === undefined) profile.milestones = [];
        if (profile.discoveredItems === undefined) profile.discoveredItems = [];
        if (profile.goal === undefined) profile.goal = '';
        // Các trường thiết lập thế giới, phòng trường hợp
        if (profile.initialNpcs === undefined) profile.initialNpcs = [];
        if (profile.initialLocations === undefined) profile.initialLocations = [];
        if (profile.initialItems === undefined) profile.initialItems = [];
        if (profile.initialMonsters === undefined) profile.initialMonsters = [];
    }
    
    // --- Di trú cho Identity ---
    if (migratedData.identities && Array.isArray(migratedData.identities)) {
        migratedData.identities.forEach((identity: Identity) => {
            if (identity.goal === undefined) {
                identity.goal = '';
            }
        });
    }

    // --- Di trú cho NPC ---
    if (migratedData.npcs && Array.isArray(migratedData.npcs)) {
        migratedData.npcs.forEach((npc: NPC) => {
            if (npc.isDaoLu === undefined) npc.isDaoLu = false;
            if (npc.npcRelationships === undefined) npc.npcRelationships = [];
            if (npc.skills === undefined) npc.skills = [];
            
            // LOGIC DI TRÚ MỚI: Chuyển đổi trạng thái mang thai đã hết hạn thành sự kiện chờ
            if (npc.pendingEvent === undefined) {
                npc.pendingEvent = null;
            }

            if (npc.statusEffects && npc.statusEffects.length > 0) {
                const pregnancyEffect = npc.statusEffects.find(e => e.isPregnancyEffect);
                if (pregnancyEffect) {
                    const durationMatch = pregnancyEffect.duration.match(/(\d+)\s*lượt/i);
                    if (durationMatch && parseInt(durationMatch[1], 10) <= 0) {
                        log('migrationService.ts', `Migrating expired pregnancy for ${npc.name} to a pending event.`, 'INFO');
                        
                        npc.pendingEvent = {
                            type: 'BIRTH',
                            triggerOnLocationId: npc.locationId,
                            priority: 'HIGH',
                            prompt: `(Hệ thống) Khi bạn vừa đến gần nơi ở của ${npc.name}, bạn nghe thấy những tiếng la hét và sự hối hả. Có vẻ như ${npc.name} đang chuyển dạ. Hãy mô tả sự kiện này.`
                        };

                        npc.statusEffects = npc.statusEffects.filter(e => e.name !== pregnancyEffect.name);
                    }
                }
            }
        });
    }
    
    // --- Di trú cho GameLog (GameSnapshot) ---
    if (migratedData.gameLog && Array.isArray(migratedData.gameLog)) {
        migratedData.gameLog.forEach((snapshot: GameSnapshot) => {
            if (snapshot.preActionState) {
                if (snapshot.preActionState.identities === undefined) {
                    snapshot.preActionState.identities = [];
                }
                 if (snapshot.preActionState.activeIdentityId === undefined) {
                    snapshot.preActionState.activeIdentityId = null;
                }
            }
        });
    }

    return migratedData;
};
