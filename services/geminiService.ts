import {
    StoryResponse, AppSettings, CharacterProfile, WorldSettings, Skill, StoryApiResponse, NPC, NewNPCFromAI, Identity
} from '../types';
import { getSystemInstruction } from '../config/instructions';
import { log } from './logService';
import {
    buildUnifiedPrompt, buildInitialStoryPrompt, buildWorldGenPrompt, buildNewSkillDescriptionPrompt, buildNpcSkillsGenPrompt, buildIdentityGenPrompt
} from '../aiPipeline/prompts';
import {
    responseSchema, worldCreationSchema, newSkillDescriptionSchema, newSkillsArraySchema, identityGenerationSchema
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
    settings: AppSettings,
    characterProfile: CharacterProfile,
    worldSettings: WorldSettings,
    npcs: NPC[],
    apiKey: string,
    activeIdentity: Identity | null
): Promise<StoryApiResponse> => {
    log('geminiService.ts', `Generating next story step...`, 'API');
    
    const systemInstruction = getSystemInstruction(settings, characterProfile.gender, characterProfile.race, characterProfile.powerSystem, worldSettings);
    const prompt = buildUnifiedPrompt(historyText, actionText, characterProfile, worldSettings, npcs, activeIdentity);

    try {
        const response = await callGeminiApi({ systemInstruction, prompt, apiKey, schema: responseSchema });
        const storyResponse = parseAndValidateJson<StoryResponse>((response?.text ?? '').trim());
        
        return {
            storyResponse,
            // FIX: Correctly access usageMetadata from the Gemini response object.
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
    settings: AppSettings,
    apiKey: string,
): Promise<StoryApiResponse> => {
    const systemInstruction = getSystemInstruction(settings, characterProfile.gender, characterProfile.race, characterProfile.powerSystem, worldSettings);
    const prompt = buildInitialStoryPrompt(characterProfile, worldSettings);
    try {
        const response = await callGeminiApi({ systemInstruction, prompt, apiKey, schema: responseSchema });
        const storyResponse = parseAndValidateJson<StoryResponse>((response?.text ?? '').trim());

        return {
            storyResponse,
            // FIX: Correctly access usageMetadata from the Gemini response object.
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

export const generateIdentityDetails = async (
    identityName: string,
    identityIdea: string,
    characterProfile: CharacterProfile,
    apiKey: string
): Promise<Omit<Identity, 'id' | 'npcRelationships' | 'imageUrl'>> => {
    log('geminiService.ts', `Generating details for identity: ${identityName}`, 'API');
    try {
        const prompt = buildIdentityGenPrompt(identityName, identityIdea, characterProfile);
        const response = await callGeminiApi({
            prompt,
            apiKey,
            schema: identityGenerationSchema,
            systemInstruction: "Bạn là một nhà văn sáng tạo cho một game RPG giả tưởng. Nhiệm vụ của bạn là tạo ra một nhân dạng hợp lý cho một nhân vật. Hãy trả lời bằng một đối tượng JSON hợp lệ duy nhất bằng tiếng Việt."
        });
        const result = parseAndValidateJson<Omit<Identity, 'id' | 'npcRelationships' | 'imageUrl'>>((response?.text ?? '').trim());
        log('geminiService.ts', 'Identity details generation successful.', 'API');
        return result;
    } catch (err) {
        log('geminiService.ts', `Identity details generation failed: ${(err as Error).message}`, 'ERROR');
        throw err;
    }
};