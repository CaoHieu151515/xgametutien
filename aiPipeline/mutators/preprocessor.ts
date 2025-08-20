import { StoryResponse, CharacterProfile, NPC, NewNPCFromAI, Location } from '../../types';

/**
 * Pre-processes the AI's story response to correct common inconsistencies
 * before applying the state changes. This function mutates the response object directly.
 * @param response The story response object from the AI.
 * @param characterProfile The current character profile.
 * @param npcs The current list of NPCs.
 */
export const preprocessStoryResponse = (
    response: StoryResponse,
    characterProfile: CharacterProfile,
    npcs: NPC[]
): void => {
    // Correct new locations that already exist to prevent duplicates and fix player location ID
    if (response.newLocations?.length) {
        const existingLocationNames = new Set(characterProfile.discoveredLocations.map(l => l.name.toLowerCase()));
        const existingLocationIds = new Set(characterProfile.discoveredLocations.map(l => l.id));
        const uniqueNewLocations: Location[] = [];

        response.newLocations.forEach((newLoc: Location) => {
            const isDuplicate = existingLocationIds.has(newLoc.id) || existingLocationNames.has(newLoc.name.toLowerCase());

            if (isDuplicate) {
                // If the AI intended to move the player to this duplicated new location,
                // we must correct the target ID to the existing location's ID.
                if (response.updatedPlayerLocationId === newLoc.id) {
                    const existingLoc = characterProfile.discoveredLocations.find(l => l.name.toLowerCase() === newLoc.name.toLowerCase());
                    if (existingLoc) {
                        response.updatedPlayerLocationId = existingLoc.id;
                    }
                }
            } else {
                uniqueNewLocations.push(newLoc);
            }
        });
        response.newLocations = uniqueNewLocations;
    }

    // Correct new NPCs that already exist to prevent duplicates
    if (response.newNPCs?.length) {
        const existingNpcNames = new Set(npcs.map(n => n.name.toLowerCase()));
        const existingNpcIds = new Set(npcs.map(n => n.id));
        const uniqueNewNpcs: NewNPCFromAI[] = [];

        response.newNPCs.forEach((newNpc: NewNPCFromAI) => {
            const isDuplicate = existingNpcIds.has(newNpc.id) || existingNpcNames.has(newNpc.name.toLowerCase());

            if (!isDuplicate) {
                uniqueNewNpcs.push(newNpc);
            }
        });
        response.newNPCs = uniqueNewNpcs;
    }
};
