import { endTimer, log, startTimer } from '../services/logService';
import {
    AppSettings,
    CharacterProfile,
    Choice, Identity,
    NPC,
    StoryResponse,
    WorldSettings
} from '../types';
import { applyEventMutations } from './mutators/eventMutator';
import { handleGenderSwapActivation } from './mutators/identityMutator';
import { generateAndMergeNotifications } from './mutators/notificationMutator';
import { applyNpcMutations } from './mutators/npcMutators';
import { applyPlayerMutations } from './mutators/playerMutators';
import { preprocessStoryResponse } from './mutators/preprocessor';
import { applyWorldMutations } from './mutators/worldMutators';


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

        if (response.updatedGender && !response.activateGenderSwapIdentity) {
            log(applyDiffSource, "AI used 'updatedGender'. Intercepting to trigger gender-swap identity system.", 'INFO');
            response.activateGenderSwapIdentity = true;
            delete response.updatedGender;
        }

        startTimer('apply_preprocess', applyDiffSource, 'Tiền xử lý phản hồi AI');
        preprocessStoryResponse(response, characterProfile, npcs);
        endTimer('apply_preprocess', applyDiffSource);

        const notifications = generateAndMergeNotifications(response, storyResponse, characterProfile, npcs, preTurnNotifications);

        let nextIdentities = [...identities];
        let nextActiveIdentityId = activeIdentityId;

        if (response.activateGenderSwapIdentity) {
            startTimer('apply_gender_swap', applyDiffSource, 'Xử lý chuyển đổi giới tính');
            const swapResult = await handleGenderSwapActivation({
                profile: characterProfile,
                identities: nextIdentities,
                activeIdentityId: nextActiveIdentityId,
                worldSettings,
                api,
                apiKey,
                notifications,
            });
            nextIdentities = swapResult.nextIdentities;
            nextActiveIdentityId = swapResult.nextActiveIdentityId;
            endTimer('apply_gender_swap', applyDiffSource);
        }

        startTimer('apply_identity_rels', applyDiffSource, 'Xử lý hảo cảm nhân dạng');
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
            }).filter(Boolean); 
        }

        if (identityUpdates.length > 0 && activeIdentityId) {
            const activeIdentityIndex = nextIdentities.findIndex(i => i.id === activeIdentityId);
            if (activeIdentityIndex > -1) {
                let activeIdentity = { ...nextIdentities[activeIdentityIndex] };
                let currentRelationships = [...(activeIdentity.npcRelationships || [])];
                const originalIdentityRels = new Map((identities[activeIdentityIndex]?.npcRelationships || []).map(r => [r.targetNpcId, r]));

                identityUpdates.forEach(({ npcId, change }) => {
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
        const activeIdentityObject = identities.find(id => id.id === activeIdentityId) || null;
        const npcMutationResult = await applyNpcMutations({
            response,
            npcs: nextNpcs,
            worldSettings: finalWorldSettings,
            notifications,
            api,
            apiKey,
            activeIdentity: activeIdentityObject,
            playerProfile: nextProfile,
        });
        nextNpcs = npcMutationResult.nextNpcs;
        
        if (npcMutationResult.identityUpdates.length > 0) {
            npcMutationResult.identityUpdates.forEach(update => {
                const identityIndex = nextIdentities.findIndex(i => i.id === update.identityId);
                if (identityIndex > -1) {
                    const identity = nextIdentities[identityIndex];
                    if (!identity.npcRelationships) identity.npcRelationships = [];
                    
                    const existingRelIndex = identity.npcRelationships.findIndex(r => r.targetNpcId === update.newRelationship.targetNpcId);
                    if (existingRelIndex > -1) {
                        identity.npcRelationships[existingRelIndex] = update.newRelationship;
                    } else {
                        identity.npcRelationships.push(update.newRelationship);
                    }
                    notifications.push(`🎭 Nhân dạng <b>${identity.name}</b> đã thiết lập mối quan hệ mới.`);
                }
            });
        }
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