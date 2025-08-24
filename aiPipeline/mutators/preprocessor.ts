import { StoryResponse, CharacterProfile, NPC, NewNPCFromAI, Location, NPCUpdate } from '../../types';

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

    // Automatically update the location of any NPC who speaks in the current story part.
    // This corrects AI errors where an NPC is present in a scene but their location isn't updated.
    if (response.story && characterProfile.currentLocationId) {
        const speakerRegex = /\[([^\]]+?)\][:：]/g;
        const matches = [...response.story.matchAll(speakerRegex)];
        
        if (matches.length > 0) {
            const speakerNames = new Set(matches.map(match => {
                // Clean up name from tags like [Lý Thanh Ca NEW]
                return match[1].trim().replace(/\s+(?:NEW|MỚI)\s*$/i, '').trim();
            }));

            // Don't update the player
            speakerNames.delete(characterProfile.name);

            const updatesToApply: Record<string, NPCUpdate> = {};

            for (const name of speakerNames) {
                const npc = npcs.find(n => n.name === name || n.aliases?.split(',').map(a => a.trim()).includes(name));
                
                if (npc && npc.locationId !== characterProfile.currentLocationId) {
                    // This NPC is speaking but their location is outdated.
                    // We need to move them to the player's current location.
                    if (!updatesToApply[npc.id]) {
                        updatesToApply[npc.id] = { id: npc.id };
                    }
                    updatesToApply[npc.id].locationId = characterProfile.currentLocationId;
                }
            }
            
            const updatesArray = Object.values(updatesToApply);

            if (updatesArray.length > 0) {
                if (!response.updatedNPCs) {
                    response.updatedNPCs = [];
                }
                
                // Merge new location updates with existing updates
                for (const update of updatesArray) {
                    const existingUpdateIndex = response.updatedNPCs.findIndex(u => u.id === update.id);
                    if (existingUpdateIndex > -1) {
                        // Merge into existing update
                        response.updatedNPCs[existingUpdateIndex] = { ...response.updatedNPCs[existingUpdateIndex], ...update };
                    } else {
                        // Add as a new update
                        response.updatedNPCs.push(update);
                    }
                }
            }
        }
    }
};