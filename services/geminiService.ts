
import {
    StoryResponse, NarrativePerspective, CharacterGender, CharacterProfile, WorldSettings, Skill, StoryApiResponse, NPC, NewNPCFromAI
} from '../types';
import { getSystemInstruction } from '../config/instructions';
import { log } from './logService';
import {
    buildUnifiedPrompt, buildInitialStoryPrompt, buildWorldGenPrompt, buildNewSkillDescriptionPrompt, buildNpcSkillsGenPrompt
} from '../aiPipeline/prompts';
import {
    responseSchema, worldCreationSchema, newSkillDescriptionSchema, newSkillsArraySchema
} from '../aiPipeline/schema';
import { callGeminiApi } from '../aiPipeline/callGemini';
import { parseAndValidateJson, validateWorldGenResponse } from '../aiPipeline/validate';
import { GAME_CONFIG } from '../config/gameConfig';


export const generateWorldFromIdea = async (storyIdea: string, openingScene: string, apiKey: string): Promise<{ characterProfile: CharacterProfile, worldSettings: WorldSettings }> => {
    log('geminiService.ts', `Generating world from idea...`, 'API');
    try {
        const prompt = buildWorldGenPrompt(storyIdea, openingScene);
        const response = await callGeminiApi({ 
            prompt, 
            apiKey, 
            schema: worldCreationSchema, 
            systemInstruction: "Bạn là một người sáng tạo thế giới và viết truyện chuyên nghiệp cho một trò chơi nhập vai tương tác. Nhiệm vụ của bạn là tạo ra một thế giới phong phú và một nhân vật chính hấp dẫn dựa trên ý tưởng của người dùng.",
            maxOutputTokens: GAME_CONFIG.worldGen.ai.maxOutputTokens,
            thinkingBudget: GAME_CONFIG.worldGen.ai.thinkingBudget,
        });
        const result = parseAndValidateJson<any>((response?.text ?? '').trim());
        validateWorldGenResponse(result);

        log('geminiService.ts', 'World generation successful.', 'API');
        return result as { characterProfile: CharacterProfile, worldSettings: WorldSettings };

    } catch (err) {
        log('geminiService.ts', `World generation failed: ${(err as Error).message}`, 'ERROR');
        throw err;
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
    log('geminiService.ts', `Generating next story step with a unified prompt...`, 'API');
    
    const systemInstruction = getSystemInstruction(isMature, perspective, characterProfile.gender, characterProfile.race, characterProfile.powerSystem, worldSettings);
    const prompt = buildUnifiedPrompt(historyText, actionText, characterProfile, worldSettings, npcs);

    try {
        const response = await callGeminiApi({ systemInstruction, prompt, apiKey, schema: responseSchema });
        const storyResponse = parseAndValidateJson<StoryResponse>((response?.text ?? '').trim());
        
        return {
            storyResponse,
            usageMetadata: response.usageMetadata ? {
                totalTokenCount: response.usageMetadata.totalTokenCount,
                promptTokenCount: response.usageMetadata.promptTokenCount,
                candidatesTokenCount: response.usageMetadata.candidatesTokenCount,
            } : undefined,
        };
    } catch (e) {
        log('geminiService.ts', `Unified story step generation failed: ${(e as Error).message}`, 'ERROR');
        throw new Error("Lỗi khi tạo bước tiếp theo của câu chuyện từ AI (Gemini).");
    }
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
        const storyResponse = parseAndValidateJson<StoryResponse>((response?.text ?? '').trim());

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
        const result = parseAndValidateJson<{ description: string; effect: string }>((response?.text ?? '').trim());
        log('geminiService.ts', 'Skill description generation successful.', 'API');
        return result;
    } catch (err) {
        log('geminiService.ts', `Skill description generation failed: ${(err as Error).message}`, 'ERROR');
        throw err;
    }
};

export const generateNpcSkills = async (
    npc: NewNPCFromAI,
    worldSettings: WorldSettings,
    apiKey: string
): Promise<Omit<Skill, 'id' | 'experience' | 'level' | 'isNew'>[]> => {
    log('geminiService.ts', `Generating skills for NPC: ${npc.name}`, 'API');
    try {
        const prompt = buildNpcSkillsGenPrompt(npc, worldSettings);
        const response = await callGeminiApi({
            prompt,
            apiKey,
            schema: newSkillsArraySchema,
            systemInstruction: "You are a creative game designer for a fantasy RPG. Your task is to design a set of starting skills for an NPC based on their profile. Respond with a single, valid JSON array of skill objects in Vietnamese."
        });
        const result = parseAndValidateJson<Omit<Skill, 'id' | 'experience' | 'level' | 'isNew'>[]>((response?.text ?? '').trim());
        log('geminiService.ts', 'NPC skills generation successful.', 'API');
        return result;
    } catch (err) {
        log('geminiService.ts', `NPC skills generation failed: ${(err as Error).message}`, 'ERROR');
        throw err;
    }
};