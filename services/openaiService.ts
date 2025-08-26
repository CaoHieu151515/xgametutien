
import {
    StoryResponse, AppSettings, CharacterProfile,
    WorldSettings, NPC, Skill, StoryApiResponse, NewNPCFromAI, Identity
} from '../types';
import { getSystemInstruction } from '../config/instructions';
import { log } from './logService';
import {
    buildUnifiedPrompt, buildInitialStoryPrompt, buildWorldGenPrompt, buildNewSkillDescriptionPrompt, buildNpcSkillsGenPrompt, buildIdentityGenPrompt
} from '../aiPipeline/prompts';
import { callOpenAiApi } from '../aiPipeline/callOpenAI';
import { parseAndValidateJson, validateWorldGenResponse } from '../aiPipeline/validate';
import { GAME_CONFIG } from '../config/gameConfig';

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
    log('openaiService.ts', `Generating next story step...`, 'API');
    const systemInstruction = getSystemInstruction(settings, characterProfile.gender, characterProfile.race, characterProfile.powerSystem, worldSettings);
    const prompt = buildUnifiedPrompt(historyText, actionText, characterProfile, worldSettings, npcs, activeIdentity);
    try {
        const data = await callOpenAiApi({ systemInstruction, prompt, apiKey });
        return getApiResponse(data);
    } catch (e) {
        log('openaiService.ts', `Unified story step generation failed: ${(e as Error).message}`, 'ERROR');
        throw new Error("Lỗi khi tạo bước tiếp theo của câu chuyện từ AI (OpenAI).");
    }
};

export const getInitialStory = async (
    characterProfile: CharacterProfile,
    worldSettings: WorldSettings,
    settings: AppSettings,
    apiKey: string
): Promise<StoryApiResponse> => {
    const systemInstruction = getSystemInstruction(settings, characterProfile.gender, characterProfile.race, characterProfile.powerSystem, worldSettings);
    const prompt = buildInitialStoryPrompt(characterProfile, worldSettings);
    const data = await callOpenAiApi({ systemInstruction, prompt, apiKey });
    return getApiResponse(data);
};

export const generateWorldFromIdea = async (storyIdea: string, openingScene: string, apiKey: string): Promise<{ characterProfile: CharacterProfile, worldSettings: WorldSettings }> => {
    const systemInstruction = `Bạn là một người sáng tạo thế giới và viết truyện chuyên nghiệp cho một trò chơi nhập vai tương tác. Nhiệm vụ của bạn là tạo ra một thế giới phong phú và một nhân vật chính hấp dẫn dựa trên ý tưởng của người dùng.`;
    const prompt = buildWorldGenPrompt(storyIdea, openingScene);
    const data = await callOpenAiApi({ 
        systemInstruction, 
        prompt, 
        apiKey, 
        isWorldGen: true, 
        maxTokens: GAME_CONFIG.worldGen.ai.maxOutputTokens 
    });
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
        log('openaiService.ts', `Skill description generation failed for ${skill.name}: ${err.message}`, 'ERROR');
        if (err.message.includes("JSON")) {
             console.error("Failed to parse JSON response from OpenAI for skill description:", err);
        }
        throw err;
    }
};

// FIX: Add missing generateNpcSkills function to align with geminiService and fix compilation error.
export const generateNpcSkills = async (
    npc: NewNPCFromAI,
    worldSettings: WorldSettings,
    apiKey: string
): Promise<Omit<Skill, 'id' | 'experience' | 'level' | 'isNew'>[]> => {
    log('openaiService.ts', `Generating skills for NPC: ${npc.name}`, 'API');
    const systemInstruction = `You are a creative game designer for a fantasy RPG. Your task is to design a set of starting skills for an NPC based on their profile. You MUST respond with a single, valid JSON array of skill objects in Vietnamese.`;
    const prompt = buildNpcSkillsGenPrompt(npc, worldSettings);

    try {
        const data = await callOpenAiApi({ systemInstruction, prompt, apiKey });
        const result = parseAndValidateJson<Omit<Skill, 'id' | 'experience' | 'level' | 'isNew'>[]>(data.choices[0].message.content);
        log('openaiService.ts', 'NPC skills generation successful.', 'API');
        return result;
    } catch (e) {
        log('openaiService.ts', `NPC skills generation failed: ${(e as Error).message}`, 'ERROR');
        throw e;
    }
};

// FIX: Add missing generateIdentityDetails function to align with geminiService.
export const generateIdentityDetails = async (
    identityName: string,
    identityIdea: string,
    characterProfile: CharacterProfile,
    apiKey: string
): Promise<Omit<Identity, 'id' | 'npcRelationships' | 'imageUrl'>> => {
    log('openaiService.ts', `Generating details for identity: ${identityName}`, 'API');
    const systemInstruction = `Bạn là một nhà văn sáng tạo cho một game RPG giả tưởng. Nhiệm vụ của bạn là tạo ra một nhân dạng hợp lý cho một nhân vật. Hãy trả lời bằng một đối tượng JSON hợp lệ duy nhất bằng tiếng Việt.`;
    const prompt = buildIdentityGenPrompt(identityName, identityIdea, characterProfile);
    try {
        const data = await callOpenAiApi({ systemInstruction, prompt, apiKey });
        const result = parseAndValidateJson<Omit<Identity, 'id' | 'npcRelationships' | 'imageUrl'>>(data.choices[0].message.content);
        log('openaiService.ts', 'Identity details generation successful.', 'API');
        return result;
    } catch (e) {
        log('openaiService.ts', `Identity details generation failed: ${(e as Error).message}`, 'ERROR');
        throw e;
    }
};
