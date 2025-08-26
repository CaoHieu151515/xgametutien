import {
    StoryResponse, CharacterProfile, NPC, WorldSettings, AppSettings, Choice, Identity
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
    identities: Identity[];
    activeIdentityId: string | null;
}

interface ApplyDiffResult {
    nextProfile: CharacterProfile;
    nextNpcs: NPC[];
    finalWorldSettings: WorldSettings;
    notifications: string[];
    nextIdentities: Identity[];
    nextActiveIdentityId: string | null;
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
    identities,
    activeIdentityId,
}: ApplyDiffParams): Promise<ApplyDiffResult> => {
    const applyDiffSource = 'applyDiff.ts';
    startTimer('total_apply_diff', applyDiffSource, 'Bắt đầu áp dụng các thay đổi trạng thái');

    try {
        const response: StoryResponse = JSON.parse(JSON.stringify(storyResponse)); 

        startTimer('apply_preprocess', applyDiffSource, 'Tiền xử lý phản hồi AI');
        preprocessStoryResponse(response, characterProfile, npcs);
        endTimer('apply_preprocess', applyDiffSource);

        const notifications = generateAndMergeNotifications(response, storyResponse, characterProfile, npcs, preTurnNotifications);

        startTimer('apply_identity_rels', applyDiffSource, 'Xử lý hảo cảm nhân dạng');
        let nextIdentities = [...identities];
        const identityUpdates: { npcId: string, change: number }[] = [];

        if (response.updatedNPCs && activeIdentityId) {
            response.updatedNPCs = response.updatedNPCs.map(update => {
                if (!update.updatedNpcRelationships) return update;

                const identityRelChanges = update.updatedNpcRelationships.filter(rel => rel.targetNpcId === activeIdentityId);
                const npcRelChanges = update.updatedNpcRelationships.filter(rel => rel.targetNpcId !== activeIdentityId);

                identityRelChanges.forEach(change => {
                    identityUpdates.push({ npcId: update.id, change: change.value || 0 });
                });
                
                return { ...update, updatedNpcRelationships: npcRelChanges.length > 0 ? npcRelChanges : undefined };
            }).filter(Boolean); // Remove null/undefined entries if any
        }

        if (identityUpdates.length > 0 && activeIdentityId) {
            const activeIdentityIndex = nextIdentities.findIndex(i => i.id === activeIdentityId);
            if (activeIdentityIndex > -1) {
                let activeIdentity = { ...nextIdentities[activeIdentityIndex] };
                let currentRelationships = [...(activeIdentity.npcRelationships || [])];
                const originalIdentityRels = new Map((identities[activeIdentityIndex]?.npcRelationships || []).map(r => [r.targetNpcId, r]));

                identityUpdates.forEach(({ npcId, change }) => {
                    // Logic tạo ký ức "Lần đầu gặp gỡ"
                    if (!originalIdentityRels.has(npcId)) {
                        const firstMeetingMemory = `Lần đầu gặp gỡ và làm quen với một người có tên là ${activeIdentity.name}.`;
                        const updateIndex = response.updatedNPCs?.findIndex(u => u.id === npcId);
                        if (updateIndex !== undefined && updateIndex > -1 && response.updatedNPCs) {
                             response.updatedNPCs[updateIndex].newMemories = [firstMeetingMemory, ...(response.updatedNPCs[updateIndex].newMemories || [])];
                        } else {
                            if (!response.updatedNPCs) response.updatedNPCs = [];
                            response.updatedNPCs.push({ id: npcId, newMemories: [firstMeetingMemory] });
                        }
                    }

                    const existingRelIndex = currentRelationships.findIndex(r => r.targetNpcId === npcId);
                    
                    if (existingRelIndex > -1) {
                        const oldVal = currentRelationships[existingRelIndex].value;
                        const newVal = Math.max(-1000, Math.min(1000, oldVal + change));
                        currentRelationships[existingRelIndex].value = newVal;
                    } else {
                        currentRelationships.push({
                            targetNpcId: npcId,
                            value: Math.max(-1000, Math.min(1000, change)),
                        });
                    }
                    
                    const npc = npcs.find(n => n.id === npcId);
                    if (npc) {
                        notifications.push(`🎭 Hảo cảm của <b>${npc.name}</b> với nhân dạng <b>${activeIdentity.name}</b> đã thay đổi ${change} điểm.`);
                    }
                });
                activeIdentity.npcRelationships = currentRelationships;
                nextIdentities[activeIdentityIndex] = activeIdentity;
            }
        }
        endTimer('apply_identity_rels', applyDiffSource);

        // Logic "dọn dẹp" ký ức để đảm bảo tên nhân dạng được sử dụng
        const activeIdentityForCleanup = identities.find(i => i.id === activeIdentityId);
        if (activeIdentityForCleanup && response.updatedNPCs) {
            const trueNameRegex = new RegExp(`\\b${characterProfile.name}\\b`, 'g');
            response.updatedNPCs.forEach(update => {
                if (update.newMemories) {
                    update.newMemories = update.newMemories.map(memory => 
                        memory.replace(trueNameRegex, activeIdentityForCleanup.name)
                    );
                }
            });
        }


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
        let nextActiveIdentityId = activeIdentityId;

        startTimer('apply_player', applyDiffSource, 'Áp dụng thay đổi cho người chơi');
        nextProfile = await applyPlayerMutations({
            response,
            profile: nextProfile,
            originalProfile: characterProfile,
            worldSettings: finalWorldSettings,
            settings,
            notifications,
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

        return { nextProfile, nextNpcs, finalWorldSettings, notifications, nextIdentities, nextActiveIdentityId };
    } finally {
        endTimer('total_apply_diff', applyDiffSource);
    }
};
