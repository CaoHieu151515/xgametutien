
import {
    StoryResponse, NarrativePerspective, CharacterGender, CharacterProfile,
    WorldSettings, NPC, Skill, StoryApiResponse
} from '../types';
import { getSystemInstruction } from '../config/instructions';
import { log } from './logService';
import {
    buildStateUpdatePrompt, buildNarrativePrompt, buildInitialStoryPrompt, buildWorldGenPrompt, buildNewSkillDescriptionPrompt
} from '../aiPipeline/prompts';
import { callOpenAiApi } from '../aiPipeline/callOpenAI';
import { parseAndValidateJson, validateWorldGenResponse } from '../aiPipeline/validate';

const getApiResponse = (data: any): StoryApiResponse => {
    const storyResponse = parseAndValidateJson<StoryResponse>(data.choices[0].message.content);
    const usage = data.usage;
    return {
        storyResponse,
        usageMetadata: usage ? {
            totalTokenCount: usage.total_tokens,
            promptTokenCount: usage.prompt_tokens,
            candidatesTokenCount: usage.completion_tokens,
        } : undefined
    };
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
    const prompt = buildStateUpdatePrompt(historyText, actionText, characterProfile, worldSettings, npcs);
    const data = await callOpenAiApi({ systemInstruction, prompt, apiKey, isStateUpdate: true });
    return getApiResponse(data);
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
     const systemInstruction = getSystemInstruction(isMature, perspective, characterProfile.gender, characterProfile.race, characterProfile.powerSystem, worldSettings);
     const prompt = buildNarrativePrompt(playerAction, stateChanges, characterProfile, worldSettings, npcs);
     const data = await callOpenAiApi({ systemInstruction, prompt, apiKey, isNarrativeUpdate: true });
     return getApiResponse(data);
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
    apiKey: string
): Promise<StoryApiResponse> => {
    const systemInstruction = getSystemInstruction(isMature, perspective, characterProfile.gender, characterProfile.race, characterProfile.powerSystem, worldSettings);
    const prompt = buildInitialStoryPrompt(characterProfile, worldSettings);
    const data = await callOpenAiApi({ systemInstruction, prompt, apiKey });
    return getApiResponse(data);
};

export const generateWorldFromIdea = async (storyIdea: string, openingScene: string, apiKey: string): Promise<{ characterProfile: CharacterProfile, worldSettings: WorldSettings }> => {
    const systemInstruction = `Bạn là một người sáng tạo thế giới và viết truyện chuyên nghiệp cho một trò chơi nhập vai tương tác. Nhiệm vụ của bạn là tạo ra một thế giới phong phú và một nhân vật chính hấp dẫn dựa trên ý tưởng của người dùng.`;
    const prompt = buildWorldGenPrompt(storyIdea, openingScene);
    const data = await callOpenAiApi({ systemInstruction, prompt, apiKey, isWorldGen: true });
    const result = parseAndValidateJson<any>(data.choices[0].message.content);
    validateWorldGenResponse(result);
    return result as { characterProfile: CharacterProfile, worldSettings: WorldSettings };
};

export const generateNewSkillDescription = async (
    skill: Skill,
    newQuality: string,
    worldSettings: WorldSettings,
    apiKey: string
): Promise<{ description: string; effect: string }> => {
    log('openaiService.ts', `Generating new skill description for ${skill.name} -> ${newQuality}`, 'API');
    const systemInstruction = `You are a creative writer for a fantasy RPG. Your task is to upgrade a skill's description and effect when it has a quality breakthrough. You MUST respond with a single, valid JSON object with the following structure: {"description": "new, more powerful description in Vietnamese", "effect": "new, more powerful effect in Vietnamese"}. The language of the response MUST be Vietnamese.`;
    const prompt = buildNewSkillDescriptionPrompt(skill, newQuality, worldSettings);
    
    try {
        const data = await callOpenAiApi({ systemInstruction, prompt, apiKey });
        const jsonContent = parseAndValidateJson<{ description: string; effect: string }>(data.choices[0].message.content);
        log('openaiService.ts', `Skill description generation successful for ${skill.name}.`, 'API');
        return jsonContent;

    } catch (e) {
        const err = e as Error;
        if (err.message.includes("JSON")) {
             console.error("Failed to parse JSON response from OpenAI for skill description:", err);
             throw new Error("Lỗi phân tích phản hồi từ AI (OpenAI). Phản hồi không phải là một JSON hợp lệ.");
        }
        throw err;
    }
};
