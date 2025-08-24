import {
    StoryResponse, CharacterProfile, NPC, WorldSettings, AppSettings, Choice
} from '../types';
import { preprocessStoryResponse } from './mutators/preprocessor';
import { generateAndMergeNotifications } from './mutators/notificationMutator';
import { applyPlayerMutations } from './mutators/playerMutators';
import { applyNpcMutations } from './mutators/npcMutators';
import { applyWorldMutations } from './mutators/worldMutators';
import { applyEventMutations } from './mutators/eventMutator';
import { startTimer, endTimer } from '../services/logService';


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
    preTurnNotifications: string[];
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
    preTurnNotifications,
}: ApplyDiffParams): Promise<ApplyDiffResult> => {
    const applyDiffSource = 'applyDiff.ts';
    startTimer('total_apply_diff', applyDiffSource, 'Bắt đầu áp dụng các thay đổi trạng thái');

    try {
        // Make a mutable copy of the response to correct inconsistencies before applying
        const response: StoryResponse = JSON.parse(JSON.stringify(storyResponse)); 

        // --- STEP 0: PRE-PROCESSING ---
        startTimer('apply_preprocess', applyDiffSource, 'Tiền xử lý phản hồi AI');
        preprocessStoryResponse(response, characterProfile, npcs);
        endTimer('apply_preprocess', applyDiffSource);

        // --- STEP 1: NOTIFICATION GENERATION ---
        startTimer('apply_notifications', applyDiffSource, 'Tạo thông báo');
        const notifications = generateAndMergeNotifications(response, storyResponse, characterProfile, npcs, preTurnNotifications);
        endTimer('apply_notifications', applyDiffSource);

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
        
        startTimer('apply_player', applyDiffSource, 'Áp dụng thay đổi cho người chơi');
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
        endTimer('apply_player', applyDiffSource);
        
        startTimer('apply_npcs', applyDiffSource, 'Áp dụng thay đổi cho NPC');
        nextNpcs = await applyNpcMutations({
            response,
            npcs: nextNpcs,
            worldSettings: finalWorldSettings,
            notifications,
            api,
            apiKey,
        });
        endTimer('apply_npcs', applyDiffSource);

        startTimer('apply_world', applyDiffSource, 'Áp dụng thay đổi cho thế giới');
        const worldMutationResult = applyWorldMutations({
            response,
            profile: nextProfile,
            worldSettings: finalWorldSettings,
            notifications,
        });
        nextProfile = worldMutationResult.nextProfile;
        finalWorldSettings = worldMutationResult.nextWorldSettings;
        endTimer('apply_world', applyDiffSource);
        
        startTimer('apply_events', applyDiffSource, 'Áp dụng thay đổi cho sự kiện');
        nextProfile = applyEventMutations({
            response,
            profile: nextProfile,
            isSuccess,
            turnNumber,
            notifications,
        });
        endTimer('apply_events', applyDiffSource);

        return { nextProfile, nextNpcs, finalWorldSettings, notifications };
    } finally {
        endTimer('total_apply_diff', applyDiffSource);
    }
};