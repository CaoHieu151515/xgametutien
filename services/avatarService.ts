import { AvatarData, NewNPCFromAI, CharacterGender, NPC } from '../types';

/**
 * Loads the avatar library, prioritizing localStorage over the default file.
 * @returns {Promise<AvatarData[]>} An array of AvatarData objects.
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
        console.error("Error loading custom avatar library from localStorage, falling back to default.", error);
    }
    
    // Fallback to default
    try {
        const response = await fetch('/generated_avatar_data.json');
        if (!response.ok) {
            console.error(`Failed to load generated_avatar_data.json: ${response.statusText}`);
            return [];
        }
        const data: AvatarData[] = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("Error loading default avatar library.", err);
        return [];
    }
};

/**
 * Finds the best matching avatar for an NPC from the library based on scoring keywords.
 * @param {NewNPCFromAI} targetNpc - The NPC to find an avatar for.
 * @param {Array<NewNPCFromAI | NPC>} allOtherNpcs - A list of all other NPCs to avoid duplicate avatars.
 * @returns {Promise<string | null>} The URL of the best matching avatar, or null if not found.
 */
export const findBestAvatar = async (targetNpc: NewNPCFromAI, allOtherNpcs: (NewNPCFromAI | NPC)[]): Promise<string | null> => {
    const library = await loadAvatarLibrary();
    if (library.length === 0) {
        return null;
    }

    const usedUrls = new Set(allOtherNpcs.map(npc => npc.avatarUrl).filter(Boolean));
    const availableAvatars = library.filter(avatar => !usedUrls.has(avatar.url));

    if (availableAvatars.length === 0) {
        return null;
    }

    const keywords = [
        targetNpc.gender,
        targetNpc.race,
        ...(targetNpc.personality?.split(/[,.\s「」]+/) || []),
        ...(targetNpc.ngoaiHinh?.split(/[,.\s「」]+/) || []),
        ...(targetNpc.description?.split(/[,.\s「」]+/) || []),
    ].map(kw => kw.toLowerCase().trim()).filter(Boolean);

    let bestMatch: { url: string; score: number } | null = null;

    for (const avatar of availableAvatars) {
        // Gender mismatch is heavily penalized
        if (targetNpc.gender === CharacterGender.MALE && avatar.gender === 'female') continue;
        if (targetNpc.gender === CharacterGender.FEMALE && avatar.gender === 'male') continue;

        let score = 0;
        const avatarTags = avatar.tags.map(t => t.toLowerCase());

        // Exact gender match gets a high score
        if (avatar.gender === targetNpc.gender) {
            score += 15;
        }

        for (const keyword of keywords) {
            if (keyword.length < 2) continue; // Ignore very short keywords
            for (const tag of avatarTags) {
                if (tag === keyword) {
                    score += 10; // Strongest match for exact tag
                } else if (tag.includes(keyword) || keyword.includes(tag)) {
                    score += 3; // Weaker match for partial inclusion
                }
            }
        }
        
        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
            bestMatch = { url: avatar.url, score };
        }
    }
    
    // If no match was found, pick a random one that matches gender if possible.
    if (!bestMatch) {
        const genderMatchedAvatars = availableAvatars.filter(a => a.gender === targetNpc.gender);
        if (genderMatchedAvatars.length > 0) {
            return genderMatchedAvatars[Math.floor(Math.random() * genderMatchedAvatars.length)].url;
        }
        if (availableAvatars.length > 0) {
            return availableAvatars[Math.floor(Math.random() * availableAvatars.length)].url;
        }
    }
    
    return bestMatch ? bestMatch.url : null;
};