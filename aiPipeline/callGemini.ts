import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { log } from '../services/logService';
import { GAME_CONFIG } from "../config/gameConfig";

const USE_DEFAULT_KEY_IDENTIFIER = '_USE_DEFAULT_KEY_';

const getFinalApiKey = (apiKey: string): string => {
    const finalKey = apiKey === USE_DEFAULT_KEY_IDENTIFIER ? process.env.API_KEY : apiKey;
    if (!finalKey) {
        log('callGemini.ts', "API Key is missing.", 'ERROR');
        throw new Error("Vui lòng cung cấp API Key của Google Gemini trong phần Cài đặt, hoặc đảm bảo API Key mặc định đã được cấu hình.");
    }
    return finalKey;
};

interface CallParams {
    systemInstruction?: string;
    prompt: string;
    apiKey: string;
    schema: any;
    maxOutputTokens?: number;
    thinkingBudget?: number;
}

export const callGeminiApi = async ({ systemInstruction, prompt, apiKey, schema, maxOutputTokens, thinkingBudget }: CallParams): Promise<GenerateContentResponse> => {
    log('callGemini.ts', `Calling Gemini API... Prompt (start): ${prompt.substring(0, 150)}...`, 'API');
    try {
        const finalApiKey = getFinalApiKey(apiKey);
        const ai = new GoogleGenAI({ apiKey: finalApiKey });
        const model = 'gemini-2.5-flash';

        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                ...(systemInstruction && { systemInstruction }),
                responseMimeType: "application/json",
                responseSchema: schema,
                maxOutputTokens: maxOutputTokens ?? GAME_CONFIG.ai.maxOutputTokens,
                thinkingConfig: { thinkingBudget: thinkingBudget ?? GAME_CONFIG.ai.thinkingBudget },
            },
        });
        
        log('callGemini.ts', 'Gemini API call successful.', 'API');
        return response;
    } catch (e) {
        const err = e as Error;
        log('callGemini.ts', `Gemini API call failed: ${err.message}`, 'ERROR');
        console.error("Gemini API Error:", err);
        throw err;
    }
};