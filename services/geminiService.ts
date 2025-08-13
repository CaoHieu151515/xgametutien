
import {
    StoryResponse, NarrativePerspective, CharacterGender, CharacterProfile, WorldSettings, Skill, StoryApiResponse, NPC
} from '../types';
import { getSystemInstruction } from '../config/instructions';
import { log } from './logService';
import {
    buildStateUpdatePrompt, buildNarrativePrompt, buildInitialStoryPrompt, buildWorldGenPrompt, buildNewSkillDescriptionPrompt
} from '../aiPipeline/prompts';
import {
    stateUpdateSchema, narrativeSchema, responseSchema, worldCreationSchema, newSkillDescriptionSchema
} from '../aiPipeline/schema';
import { callGeminiApi } from '../aiPipeline/callGemini';
import { parseAndValidateJson, validateWorldGenResponse } from '../aiPipeline/validate';


export const generateWorldFromIdea = async (storyIdea: string, openingScene: string, apiKey: string): Promise<{ characterProfile: CharacterProfile, worldSettings: WorldSettings }> => {
    log('geminiService.ts', `Generating world from idea...`, 'API');
    try {
        const prompt = buildWorldGenPrompt(storyIdea, openingScene);
        const response = await callGeminiApi({ prompt, apiKey, schema: worldCreationSchema, systemInstruction: "Bạn là một người sáng tạo thế giới và viết truyện chuyên nghiệp cho một trò chơi nhập vai tương tác. Nhiệm vụ của bạn là tạo ra một thế giới phong phú và một nhân vật chính hấp dẫn dựa trên ý tưởng của người dùng." });
        const result = parseAndValidateJson<any>(response.text.trim());
        validateWorldGenResponse(result);

        log('geminiService.ts', 'World generation successful.', 'API');
        return result as { characterProfile: CharacterProfile, worldSettings: WorldSettings };

    } catch (err) {
        log('geminiService.ts', `World generation failed: ${(err as Error).message}`, 'ERROR');
        throw err;
    }
};

export const getGameStateUpdate = async (
    historyText: string,
    actionText: string,
    isMature: boolean,
    perspective: NarrativePerspective,
    characterProfile: CharacterProfile,
    worldSettings: WorldSettings,
    npcs: NPC[],
    apiKey: string,
): Promise<StoryApiResponse> => {
    const systemInstruction = getSystemInstruction(isMature, perspective, characterProfile.gender, characterProfile.race, characterProfile.powerSystem, worldSettings);
    const logicPreamble = "You are a game logic engine. Your only task is to calculate the consequences of a player's action based on the current state. You must respond ONLY with a JSON object representing the *changes* to the game state, conforming to the provided schema. Do not write a story. Do not provide choices. Be precise and logical.";
    const prompt = buildStateUpdatePrompt(historyText, actionText, characterProfile, worldSettings, npcs);

    try {
        const response = await callGeminiApi({ systemInstruction: `${logicPreamble}\n\n${systemInstruction}`, prompt, apiKey, schema: stateUpdateSchema });
        const storyResponse = parseAndValidateJson<StoryResponse>(response.text.trim());
        return {
            storyResponse,
            usageMetadata: response.usageMetadata ? {
                totalTokenCount: response.usageMetadata.totalTokenCount,
                promptTokenCount: response.usageMetadata.promptTokenCount,
                candidatesTokenCount: response.usageMetadata.candidatesTokenCount,
            } : undefined,
        };
    } catch (e) {
        log('geminiService.ts', `State update generation failed: ${(e as Error).message}`, 'ERROR');
        throw new Error("Lỗi khi tạo bản cập nhật trạng thái từ AI (Gemini).");
    }
};

export const getNarrativeUpdate = async (
    playerAction: string,
    stateChanges: StoryResponse,
    isMature: boolean,
    perspective: NarrativePerspective,
    characterProfile: CharacterProfile,
    worldSettings: WorldSettings,
    npcs: NPC[],
    apiKey: string,
): Promise<StoryApiResponse> => {
    const baseInstruction = getSystemInstruction(isMature, perspective, characterProfile.gender, characterProfile.race, characterProfile.powerSystem, worldSettings);
    // Extract only narrative-relevant rules
    const narrativePreamble = "You are a master storyteller. A game event has occurred. Your task is to narrate this event in a compelling and detailed way, explaining how the changes happened. After the narration, provide four diverse and engaging new choices for the player's next move. You must respond ONLY with a JSON object containing the `story` and `choices`.";
    const prompt = buildNarrativePrompt(playerAction, stateChanges, characterProfile, worldSettings, npcs);
    
    try {
        const response = await callGeminiApi({ systemInstruction: `${narrativePreamble}\n\n${baseInstruction}`, prompt, apiKey, schema: narrativeSchema });
        const storyResponse = parseAndValidateJson<StoryResponse>(response.text.trim());
        return {
            storyResponse,
            usageMetadata: response.usageMetadata ? {
                totalTokenCount: response.usageMetadata.totalTokenCount,
                promptTokenCount: response.usageMetadata.promptTokenCount,
                candidatesTokenCount: response.usageMetadata.candidatesTokenCount,
            } : undefined,
        };
    } catch (e) {
        log('geminiService.ts', `Narrative generation failed: ${(e as Error).message}`, 'ERROR');
        throw new Error("Lỗi khi tạo tường thuật từ AI (Gemini).");
    }
};

export const getNextStoryStep = async (
    historyText: string,
    actionText: string,
    isMature: boolean,
    perspective: NarrativePerspective,
    characterProfile: CharacterProfile,
    worldSettings: WorldSettings,
    npcs: NPC[],
    apiKey: string,
): Promise<StoryApiResponse> => {
    // 1. Get state update
    const stateUpdate = await getGameStateUpdate(
        historyText,
        actionText,
        isMature,
        perspective,
        characterProfile,
        worldSettings,
        npcs,
        apiKey
    );

    // 2. Get narrative update based on state changes
    const narrativeUpdate = await getNarrativeUpdate(
        actionText,
        stateUpdate.storyResponse,
        isMature,
        perspective,
        characterProfile,
        worldSettings,
        npcs,
        apiKey
    );

    // 3. Combine results
    const combinedStoryResponse: StoryResponse = {
        ...stateUpdate.storyResponse,
        story: narrativeUpdate.storyResponse.story,
        choices: narrativeUpdate.storyResponse.choices,
    };

    const combinedUsageMetadata = {
        totalTokenCount: (stateUpdate.usageMetadata?.totalTokenCount || 0) + (narrativeUpdate.usageMetadata?.totalTokenCount || 0),
        promptTokenCount: (stateUpdate.usageMetadata?.promptTokenCount || 0) + (narrativeUpdate.usageMetadata?.promptTokenCount || 0),
        candidatesTokenCount: (stateUpdate.usageMetadata?.candidatesTokenCount || 0) + (narrativeUpdate.usageMetadata?.candidatesTokenCount || 0),
    };
    
    return {
        storyResponse: combinedStoryResponse,
        usageMetadata: combinedUsageMetadata
    };
};

export const getInitialStory = async (
    characterProfile: CharacterProfile,
    worldSettings: WorldSettings,
    isMature: boolean,
    perspective: NarrativePerspective,
    apiKey: string,
): Promise<StoryApiResponse> => {
    const systemInstruction = getSystemInstruction(isMature, perspective, characterProfile.gender, characterProfile.race, characterProfile.powerSystem, worldSettings);
    const prompt = buildInitialStoryPrompt(characterProfile, worldSettings);
    try {
        const response = await callGeminiApi({ systemInstruction, prompt, apiKey, schema: responseSchema });
        const storyResponse = parseAndValidateJson<StoryResponse>(response.text.trim());

        return {
            storyResponse,
            usageMetadata: response.usageMetadata ? {
                totalTokenCount: response.usageMetadata.totalTokenCount,
                promptTokenCount: response.usageMetadata.promptTokenCount,
                candidatesTokenCount: response.usageMetadata.candidatesTokenCount,
            } : undefined,
        };
    } catch (e) {
        if (e instanceof Error && e.message.includes("JSON")) {
            throw e; 
        }
        log('geminiService.ts', `Initial story generation failed: ${(e as Error).message}`, 'ERROR');
        throw new Error("Lỗi khi tạo nội dung từ AI (Gemini).");
    }
};

export const generateNewSkillDescription = async (
    skill: Skill,
    newQuality: string,
    worldSettings: WorldSettings,
    apiKey: string
): Promise<{ description: string; effect: string }> => {
    log('geminiService.ts', `Generating new skill description for ${skill.name} -> ${newQuality}`, 'API');
    try {
        const prompt = buildNewSkillDescriptionPrompt(skill, newQuality, worldSettings);
        const response = await callGeminiApi({ prompt, apiKey, schema: newSkillDescriptionSchema, systemInstruction: "You are a creative writer for a fantasy RPG. Your task is to upgrade a skill's description and effect. Respond with a single, valid JSON object in Vietnamese." });
        const result = parseAndValidateJson<{ description: string; effect: string }>(response.text.trim());
        log('geminiService.ts', 'Skill description generation successful.', 'API');
        return result;
    } catch (err) {
        log('geminiService.ts', `Skill description generation failed: ${(err as Error).message}`, 'ERROR');
        throw err;
    }
};