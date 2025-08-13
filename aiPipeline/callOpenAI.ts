
import { log } from '../services/logService';

const API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = 'gpt-4o';

const getJsonSchemaDescription = (isWorldGen: boolean, isStateUpdate: boolean, isNarrativeUpdate: boolean): string => {
    if (isStateUpdate) {
        return `Your response MUST be a single, valid JSON object representing ONLY the CHANGES to the game state. DO NOT include 'story' or 'choices'. The object can contain any of the following optional fields: updatedStats, updatedGameTime, updatedGender, newSkills, updatedSkills, newLocations, updatedLocations, updatedPlayerLocationId, newNPCs, updatedNPCs, newItems, updatedItems, removedItemIds, newWorldKnowledge.`;
    }

    if (isNarrativeUpdate) {
        return `Your response MUST be a single, valid JSON object with EXACTLY two keys: "story" (string) and "choices" (an array of 4 choice objects).`;
    }

    const storyResponseSchema = `
        "story": A string containing the next part of the story.
        "choices": An array of EXACTLY FOUR choice objects. Each object must have:
            - "title": (string) A short, compelling action for the player.
            - "benefit": (string) The potential benefit of the choice.
            - "risk": (string) The potential risk.
            - "successChance": (number) Success chance from 0-100.
            - "durationInMinutes": (number) Estimated time in minutes.
        "updatedStats": (optional object) Contains updated character stats. ONLY include changed stats.
            - "health", "mana", "currencyAmount", "gainedExperience": (numbers)
            - "breakthroughToRealm": (optional string) The NEW realm name the character breaks through to. The system will auto-calculate XP. Omit gainedExperience if used.
            - "newStatusEffects": (optional array of objects) Each object: {"name": string, "description": string, "duration": string}.
            - "removedStatusEffects": (optional array of strings) Names of effects to remove.
        "updatedGameTime": (optional string) An ISO 8601 string for the new game time. Use ONLY for significant time skips (e.g., 'cultivate for 100 years', 'wait until the child is born'). This overrides 'durationInMinutes' from the choice. Omit for short actions.
        "updatedGender": (optional string 'male' or 'female') The player's new gender if it changed.
        "newSkills": (optional array of objects) For newly learned skills. Each object: {"name": string, "type": string (from SkillType enum), "quality": string, "description": string, "effect": string}.
        "updatedSkills": (optional array of objects) For existing skills that gained XP. Each object: {"skillName": string, "gainedExperience": number}.
        "newLocations": (optional array of Location objects) For newly discovered locations.
        "updatedLocations": (optional array of Location objects) For existing locations that have changed.
        "updatedPlayerLocationId": (optional string or null) The player's new location ID.
        "newNPCs": (optional array of NewNPCFromAI objects) For newly encountered NPCs. Each 'npcRelationships' object can optionally have a "relationshipType" ('FAMILY' | 'ROMANTIC' | 'FRIENDLY' | 'RIVAL').
        "updatedNPCs": (optional array of NPCUpdate objects) For existing NPCs that have changed. Can include "isDead": (boolean), "gender": ('male' | 'female'), "aptitude": (string), "breakthroughToRealm": (string). Each 'updatedNpcRelationships' object can optionally have a "relationshipType".
        "newItems": (optional array of Item objects) for newly acquired items. If the item type is 'Dược Phẩm', you MUST provide an 'effectsDescription' field detailing its effect.
        "updatedItems": (optional array of {name: string, quantity: number}) for updating item quantities.
        "removedItemIds": (optional array of strings) IDs of items to remove.
        "newWorldKnowledge": (optional array of WorldKnowledge objects) For newly discovered lore/factions. Each object: {"id": string, "title": string, "content": string, "category": string ('Bang Phái' | 'Lịch Sử', 'Nhân Vật', 'Khác')}.
    `;

    const worldGenSchema = `
        "characterProfile": An object describing the main character, including required fields like 'name', 'gender', 'race', 'skills', 'initialItems', 'initialNpcs', 'initialLocations', 'initialMonsters'. The 'initialItems' field is REQUIRED. Each 'npcRelationships' object can optionally have a "relationshipType".
        "worldSettings": An object describing the game world, including 'theme', 'powerSystems', 'initialKnowledge'. Each knowledge item MUST have a 'category'.
    `;

    return `Your response MUST be a single, valid JSON object with the following structure: {${isWorldGen ? worldGenSchema : storyResponseSchema}}`;
};

interface CallParams {
    systemInstruction: string;
    prompt: string;
    apiKey: string;
    isWorldGen?: boolean;
    isStateUpdate?: boolean;
    isNarrativeUpdate?: boolean;
}

export const callOpenAiApi = async ({ systemInstruction, prompt, apiKey, isWorldGen = false, isStateUpdate = false, isNarrativeUpdate = false }: CallParams): Promise<any> => {
    log('callOpenAI.ts', `Calling OpenAI API (${isWorldGen ? 'WorldGen' : isStateUpdate ? 'StateUpdate' : isNarrativeUpdate ? 'Narrative' : 'Content'})...`, 'API');
    if (!apiKey) {
        log('callOpenAI.ts', 'OpenAI API Key is missing.', 'ERROR');
        throw new Error("Vui lòng cung cấp API Key của OpenAI trong phần Cài đặt.");
    }

    const fullSystemInstruction = `${systemInstruction}\n\n${getJsonSchemaDescription(isWorldGen, isStateUpdate, isNarrativeUpdate)}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: "system", content: fullSystemInstruction },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                max_tokens: 4096
            })
        });

        if (!response.ok) {
            let errorDetails = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorBody = await response.json();
                console.error("OpenAI API Error:", errorBody);
                if (errorBody.error && errorBody.error.message) {
                    errorDetails = typeof errorBody.error.message === 'string'
                        ? errorBody.error.message
                        : JSON.stringify(errorBody.error.message);
                } else {
                    errorDetails = JSON.stringify(errorBody);
                }
            } catch (e) {
                // The response body was not valid JSON or another error occurred.
            }
            throw new Error(`Lỗi từ OpenAI API: ${errorDetails}`);
        }

        const data = await response.json();
        log('callOpenAI.ts', 'OpenAI API call successful.', 'API');
        return data; // Return full data to get usage stats

    } catch (e) {
        const err = e as Error;
        log('callOpenAI.ts', `OpenAI API call failed: ${err.message}`, 'ERROR');
        throw err;
    }
};
