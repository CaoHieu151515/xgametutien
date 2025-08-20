import { GAME_CONFIG } from '../config/gameConfig';
import { CharacterGender } from '../types';

/**
 * Lấy văn bản và màu sắc hiển thị cho một giá trị quan hệ.
 * Đọc cấu hình từ GAME_CONFIG.npc.relationshipTiers.
 * @param value - Giá trị quan hệ (-1000 đến 1000) hoặc undefined.
 * @returns Một đối tượng chứa { text, color }.
 */
export const getRelationshipDisplay = (value: number | undefined): { text: string; color: string } => {
    if (value === undefined) {
        // Tìm bậc "Trung Lập" trong config hoặc fallback
        const neutralTier = GAME_CONFIG.npc.relationshipTiers.find(tier => tier.threshold <= 0 && tier.threshold > -100);
        return neutralTier 
            ? { text: neutralTier.text, color: neutralTier.color }
            : { text: 'Trung Lập', color: 'text-slate-400' };
    }

    // Tìm bậc đầu tiên mà giá trị lớn hơn hoặc bằng ngưỡng
    for (const tier of GAME_CONFIG.npc.relationshipTiers) {
        if (value >= tier.threshold) {
            return { text: tier.text, color: tier.color };
        }
    }

    // Fallback đến bậc cuối cùng (thường là thù địch nhất)
    const lastTier = GAME_CONFIG.npc.relationshipTiers[GAME_CONFIG.npc.relationshipTiers.length - 1];
    return { text: lastTier.text, color: lastTier.color };
};

/**
 * Lấy URL ảnh đại diện mặc định dựa trên giới tính.
 * @param gender - Giới tính của nhân vật.
 * @returns URL của ảnh đại diện mặc định.
 */
export const getDefaultAvatar = (gender: CharacterGender) => {
    return gender === CharacterGender.MALE 
        ? 'https://i.imgur.com/9CXRf64.png' 
        : 'https://i.imgur.com/K8Z3w4q.png';
};
