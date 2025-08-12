
import {
    StoryResponse, NarrativePerspective, CharacterGender, CharacterProfile, WorldSettings, Skill, StoryApiResponse, NPC
} from '../types';
import { getSystemInstruction } from '../config/instructions';
import { log } from './logService';
import {
    buildNextStepPrompt, buildInitialStoryPrompt, buildWorldGenPrompt, buildNewSkillDescriptionPrompt
} from '../aiPipeline/prompts';
import {
    responseSchema, worldCreationSchema, newSkillDescriptionSchema
} from '../aiPipeline/schema';
import { callGeminiApi } from '../aiPipeline/callGemini';
import { parseAndValidateJson, validateWorldGenResponse } from '../aiPipeline/validate';


export const generateWorldFromIdea = async (storyIdea: string, openingScene: string, apiKey: string): Promise<{ characterProfile: CharacterProfile, worldSettings: WorldSettings }> => {
    log('geminiService.ts', `Generating world from idea...`, 'API');
    try {
        const prompt = buildWorldGenPrompt(storyIdea, openingScene);
        const response = await callGeminiApi({ prompt, apiKey, schema: worldCreationSchema });
        const result = parseAndValidateJson<any>(response.text.trim());
        validateWorldGenResponse(result);

        log('geminiService.ts', 'World generation successful.', 'API');
        return result as { characterProfile: CharacterProfile, worldSettings: WorldSettings };

    } catch (err) {
        log('geminiService.ts', `World generation failed: ${(err as Error).message}`, 'ERROR');
        throw err;
    }
};

const generateContent = async (
    systemInstruction: string,
    prompt: string,
    apiKey: string
): Promise<StoryApiResponse> => {
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
            throw e; // Re-throw JSON parsing error to be handled by the caller
        }
        log('geminiService.ts', `Content generation failed: ${(e as Error).message}`, 'ERROR');
        throw new Error("Lỗi khi tạo nội dung từ AI (Gemini).");
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
    const systemInstruction = getSystemInstruction(isMature, perspective, characterProfile.gender, characterProfile.race, characterProfile.powerSystem, worldSettings);
    const prompt = buildNextStepPrompt(historyText, actionText, characterProfile, worldSettings, npcs);
    return generateContent(systemInstruction, prompt, apiKey);
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
    return generateContent(systemInstruction, prompt, apiKey);
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
        const response = await callGeminiApi({ prompt, apiKey, schema: newSkillDescriptionSchema });
        const result = parseAndValidateJson<{ description: string; effect: string }>(response.text.trim());
        log('geminiService.ts', 'Skill description generation successful.', 'API');
        return result;
    } catch (err) {
        log('geminiService.ts', `Skill description generation failed: ${(err as Error).message}`, 'ERROR');
        throw err;
    }
};