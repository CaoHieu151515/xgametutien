import { CharacterProfile, Identity, WorldSettings, CharacterGender, NewNPCFromAI, NPC } from '../../types';
import { findBestAvatar } from '../../services/avatarService';
import { log } from '../../services/logService';

interface HandleGenderSwapParams {
    profile: CharacterProfile;
    identities: Identity[];
    activeIdentityId: string | null;
    worldSettings: WorldSettings;
    api: any;
    apiKey: string;
    notifications: string[];
}

interface HandleGenderSwapResult {
    nextIdentities: Identity[];
    nextActiveIdentityId: string | null;
}

/**
 * Creates a new, detailed gender-swapped identity using the AI.
 * @returns A new Identity object, or null if creation fails.
 */
async function createNewGenderSwapIdentity(
    profile: CharacterProfile,
    worldSettings: WorldSettings,
    api: any,
    apiKey: string,
    notifications: string[]
): Promise<Identity | null> {
    const targetGender = profile.gender === CharacterGender.MALE ? CharacterGender.FEMALE : CharacterGender.MALE;
    const targetGenderName = targetGender === CharacterGender.FEMALE ? 'Nữ' : 'Nam';

    const identityName = `${profile.name} (${targetGenderName} Thân)`;
    const identityIdea = `Đây là nhân dạng ${targetGenderName.toLowerCase()} của ${profile.name}, được tạo ra từ một công pháp chuyển đổi giới tính. Ngoại hình và khí chất thay đổi hoàn toàn để phù hợp với giới tính mới, nhưng bản chất linh hồn vẫn là ${profile.name}.`;

    try {
        log('identityMutator.ts', `Generating new gender-swap identity: ${identityName}`, 'API');
        const details = await api.generateIdentityDetails(identityName, identityIdea, profile, apiKey);
        
        const newIdentity: Identity = {
            id: `identity_genderswap_${profile.id}`, // predictable ID
            ...details,
            name: identityName,
            imageUrl: '',
            gender: targetGender,
            isGenderSwap: true,
            npcRelationships: [],
        };

        // Find avatar for the new identity
        const fakeNpcProfile: NewNPCFromAI = {
            id: `fake_${newIdentity.id}`, name: newIdentity.name, gender: newIdentity.gender, race: profile.race,
            personality: newIdentity.personality, description: newIdentity.backstory, ngoaiHinh: newIdentity.appearance,
            level: profile.level, powerSystem: profile.powerSystem, aptitude: '', mienLuc: { body: 15, face: 15, aura: 10, power: 5 },
            locationId: profile.currentLocationId || '', statusEffects: [],
        };
        const bestUrl = await findBestAvatar(fakeNpcProfile, []);
        if (bestUrl) {
            newIdentity.imageUrl = bestUrl;
        }

        notifications.push(`🎭 Bạn đã tạo và biến đổi thành nhân dạng mới: <b>${newIdentity.name}</b>.`);
        return newIdentity;

    } catch (e) {
        log('identityMutator.ts', `Failed to generate gender-swap identity: ${(e as Error).message}`, 'ERROR');
        notifications.push(`⚠️ Không thể tạo nhân dạng chuyển giới: ${(e as Error).message}`);
        return null;
    }
}


/**
 * Handles the logic for activating a gender-swap identity.
 * It follows the user's specified flow: find existing, or create new.
 * It also handles toggling back to the true self if already swapped.
 */
export const handleGenderSwapActivation = async ({
    profile,
    identities,
    activeIdentityId,
    worldSettings,
    api,
    apiKey,
    notifications,
}: HandleGenderSwapParams): Promise<HandleGenderSwapResult> => {
    
    const activeIdentity = identities.find(i => i.id === activeIdentityId);

    // Case 1: Currently gender-swapped -> Revert to true self (toggle behavior)
    if (activeIdentity && activeIdentity.isGenderSwap) {
        notifications.push(`🎭 Bạn đã trở lại hình dạng ban đầu của <b>${profile.name}</b>.`);
        return { nextIdentities: identities, nextActiveIdentityId: null };
    }

    // Case 2: In true-self form, attempting to swap.
    // Step 1: Find an existing gender-swap identity
    let swapIdentity = identities.find(i => i.isGenderSwap);
    
    if (swapIdentity) {
        // If found, activate it
        notifications.push(`🎭 Bạn đã biến đổi thành nhân dạng <b>${swapIdentity.name}</b>.`);
        return { nextIdentities: identities, nextActiveIdentityId: swapIdentity.id };
    } else {
        // Step 2: If not found, create a new one
        const newSwapIdentity = await createNewGenderSwapIdentity(profile, worldSettings, api, apiKey, notifications);
        if (newSwapIdentity) {
            const nextIdentities = [...identities, newSwapIdentity];
            return { nextIdentities, nextActiveIdentityId: newSwapIdentity.id };
        } else {
            // Creation failed, return original state without swapping
            return { nextIdentities: identities, nextActiveIdentityId: activeIdentityId };
        }
    }
};
