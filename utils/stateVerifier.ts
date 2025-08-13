import { StoryResponse, CharacterProfile, NPC, WorldSettings } from '../types';
import { getLevelFromRealmName } from '../services/progressionService';
import { log } from '../services/logService';

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
    const verificationName = 'stateVerifier.ts';

    // Kiểm tra updatedNPCs
    if (response.updatedNPCs) {
        for (const update of response.updatedNPCs) {
            if (!npcs.some(npc => npc.id === update.id)) {
                const errorMsg = `AI đã cố gắng cập nhật NPC không tồn tại với ID: ${update.id}`;
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
                const errorMsg = `AI đã cố gắng cập nhật kỹ năng/năng lực không tồn tại: "${update.skillName}"`;
                log(verificationName, errorMsg, 'ERROR');
                throw new Error(errorMsg);
            }
        }
    }

    // Kiểm tra removedItemIds
    if (response.removedItemIds) {
        for (const id of response.removedItemIds) {
            if (!profile.items.some(item => item.id === id)) {
                const errorMsg = `AI đã cố gắng xóa vật phẩm với ID không tồn tại: ${id}`;
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
                const errorMsg = `AI đã cố gắng cập nhật số lượng của vật phẩm không tồn tại: "${update.name}"`;
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
            const errorMsg = `AI yêu cầu người chơi đột phá đến cảnh giới "${response.updatedStats.breakthroughToRealm}" (Cấp ${targetLevel}) không cao hơn cấp độ hiện tại (${currentLevel}).`;
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
                        const errorMsg = `AI yêu cầu NPC "${npc.name}" đột phá đến cảnh giới "${update.breakthroughToRealm}" (Cấp ${targetLevel}) không cao hơn cấp độ hiện tại (${currentLevel}).`;
                        log(verificationName, errorMsg, 'ERROR');
                        throw new Error(errorMsg);
                    }
                }
            }
        }
    }
};