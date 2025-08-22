import {
    StoryResponse, CharacterProfile, NPC, WorldSettings, AppSettings, Choice
} from '../types';
import { preprocessStoryResponse } from './mutators/preprocessor';
import { generateNotifications } from './mutators/notificationMutator';
import { applyPlayerMutations } from './mutators/playerMutators';
import { applyNpcMutations } from './mutators/npcMutators';
import { applyWorldMutations } from './mutators/worldMutators';
import { applyEventMutations } from './mutators/eventMutator';


const USE_DEFAULT_KEY_IDENTIFIER = '_USE_DEFAULT_KEY_';

interface ApplyDiffParams {
    storyResponse: StoryResponse;
    characterProfile: CharacterProfile;
    npcs: NPC[];
    worldSettings: WorldSettings;
    settings: AppSettings;
    choice: Choice;
    turnNumber: number;
    isSuccess: boolean;
    api: any;
    apiKey: string;
}

interface ApplyDiffResult {
    nextProfile: CharacterProfile;
    nextNpcs: NPC[];
    finalWorldSettings: WorldSettings;
    notifications: string[];
}

export const applyStoryResponseToState = async ({
    storyResponse,
    characterProfile,
    npcs,
    worldSettings,
    settings,
    choice,
    turnNumber,
    isSuccess,
    api,
    apiKey,
}: ApplyDiffParams): Promise<ApplyDiffResult> => {
    // Make a mutable copy of the response to correct inconsistencies before applying
    const response: StoryResponse = JSON.parse(JSON.stringify(storyResponse)); 

    // --- STEP 0: PRE-PROCESSING ---
    // Correct AI response inconsistencies (e.g., duplicate entities). This mutates the 'response' object.
    preprocessStoryResponse(response, characterProfile, npcs);

    // --- STEP 1: NOTIFICATION GENERATION ---
    // Generate all user-facing notifications by comparing the response with the *original* state.
    const notifications = generateNotifications(response, storyResponse, characterProfile, npcs);

    // --- STEP 2: STATE MUTATION ---
    // Create clean, mutable bases for our state changes, resetting 'isNew' flags.
    let nextProfile: CharacterProfile = {
        ...characterProfile,
        items: characterProfile.items.map(i => ({ ...i, isNew: false })),
        skills: characterProfile.skills.map(s => ({ ...s, isNew: false })),
        achievements: (characterProfile.achievements || []).map(a => ({ ...a, isNew: false })),
        milestones: (characterProfile.milestones || []).map(m => ({ ...m, isNew: false })),
        events: (characterProfile.events || []).map(e => ({...e, isNew: false})),
        discoveredLocations: characterProfile.discoveredLocations.map(loc => ({ ...loc, isNew: false })),
        discoveredMonsters: characterProfile.discoveredMonsters.map(m => ({ ...m, isNew: false })),
        discoveredItems: (characterProfile.discoveredItems || []).map(i => ({ ...i, isNew: false })),
    };
    let nextNpcs: NPC[] = npcs.map(npc => ({ ...npc, isNew: false }));
    let finalWorldSettings: WorldSettings = {
        ...worldSettings,
        initialKnowledge: worldSettings.initialKnowledge.map(k => ({ ...k, isNew: false }))
    };

    // Apply mutations in a logical sequence. Each function takes the current state and returns the updated part.
    
    // Player mutations (XP, level, stats, items, skills, time, gender, milestone, locationId)
    nextProfile = await applyPlayerMutations({
        response,
        profile: nextProfile,
        originalProfile: characterProfile, // Pass original for comparison
        worldSettings: finalWorldSettings,
        settings,
        notifications, // Pass to push new notifications like level-ups
        turnNumber,
        choice,
    });
    
    // NPC mutations (new, updates, level-ups)
    nextNpcs = await applyNpcMutations({
        response,
        npcs: nextNpcs,
        worldSettings: finalWorldSettings,
        notifications,
        api,
        apiKey,
    });

    // World mutations (locations, knowledge, monsters). This can also update the player profile.
    const worldMutationResult = applyWorldMutations({
        response,
        profile: nextProfile,
        worldSettings: finalWorldSettings,
        notifications,
    });
    nextProfile = worldMutationResult.nextProfile;
    finalWorldSettings = worldMutationResult.nextWorldSettings;
    
    // Event mutations (new, update, complete)
    nextProfile = applyEventMutations({
        response,
        profile: nextProfile,
        isSuccess,
        turnNumber,
        notifications,
    });

    return { nextProfile, nextNpcs, finalWorldSettings, notifications };
};