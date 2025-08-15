import { AvatarData, NewNPCFromAI, CharacterGender } from '../types';

/**
 * Tải thư viện ảnh đại diện, ưu tiên từ localStorage rồi đến file mặc định.
 * @returns {Promise<AvatarData[]>} Một mảng các đối tượng AvatarData.
 */
export const loadAvatarLibrary = async (): Promise<AvatarData[]> => {
    try {
        const customDataString = localStorage.getItem('custom_avatar_data');
        if (customDataString) {
            const customData: AvatarData[] = JSON.parse(customDataString);
            if (Array.isArray(customData) && customData.length > 0) {
                return customData;
            }
        }
    } catch (error) {
        console.error("Lỗi khi tải thư viện ảnh tùy chỉnh từ localStorage, sẽ dùng file mặc định.", error);
    }
    
    // Fallback to default if no custom data is found or if it fails to load
    try {
        const response = await fetch('/generated_avatar_data.json');
        if (!response.ok) {
            console.error(`Không thể tải file generated_avatar_data.json: ${response.statusText}`);
            return [];
        }
        const data: AvatarData[] = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("Lỗi khi tải thư viện ảnh mặc định.", err);
        return [];
    }
};

/**
 * Tìm ảnh đại diện phù hợp nhất cho một NPC từ thư viện.
 * @param {NewNPCFromAI} targetNpc - NPC cần tìm ảnh.
 * @param {NewNPCFromAI[]} otherNpcs - Danh sách các NPC khác để tránh trùng lặp ảnh.
 * @returns {Promise<string | null>} URL của ảnh phù hợp nhất, hoặc null nếu không tìm thấy.
 */
export const findBestAvatar = async (targetNpc: NewNPCFromAI, otherNpcs: NewNPCFromAI[]): Promise<string | null> => {
    const library = await loadAvatarLibrary();
    if (library.length === 0) {
        return null;
    }

    const usedUrls = new Set(otherNpcs.map(npc => npc.avatarUrl).filter(Boolean));

    const availableAvatars = library.filter(avatar => !usedUrls.has(avatar.url));

    if (availableAvatars.length === 0) {
        return null;
    }

    const keywords = [
        targetNpc.gender,
        targetNpc.race,
        ...(targetNpc.personality?.split(/[,.\s]+/) || []),
        ...(targetNpc.ngoaiHinh?.split(/[,.\s]+/) || []),
        ...(targetNpc.description?.split(/[,.\s]+/) || []),
    ].map(kw => kw.toLowerCase().trim()).filter(Boolean);

    let bestMatch: { url: string; score: number } | null = null;

    for (const avatar of availableAvatars) {
        // Gender match is very important
        if (targetNpc.gender === CharacterGender.MALE && avatar.gender === 'female') continue;
        if (targetNpc.gender === CharacterGender.FEMALE && avatar.gender === 'male') continue;

        let score = 0;
        const avatarTags = avatar.tags.map(t => t.toLowerCase());

        // Exact gender match gets a high score
        if (avatar.gender === targetNpc.gender) {
            score += 10;
        }

        for (const keyword of keywords) {
            for (const tag of avatarTags) {
                if (tag.includes(keyword)) {
                    score += 5; // Strong match for partial inclusion
                }
                if (tag === keyword) {
                    score += 10; // Very strong match for exact word
                }
            }
        }
        
        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
            bestMatch = { url: avatar.url, score };
        }
    }
    
    return bestMatch ? bestMatch.url : null;
};
