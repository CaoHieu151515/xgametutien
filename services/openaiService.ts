
import { StoryResponse, NarrativePerspective, CharacterGender, CharacterProfile, WorldSettings, NPC, Location, Skill, StoryApiResponse } from '../types';
import { getSystemInstruction } from '../config/contentConfig';
import { log } from './logService';

const API_URL = "https://api.openai.com/v1/chat/completions";
const model = 'gpt-4o';

const getJsonSchemaDescription = (forWorldGen: boolean): string => {
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
            - "newStatusEffects": (optional array of objects) Each object: {"name": string, "description": string, "duration": string}.
            - "removedStatusEffects": (optional array of strings) Names of effects to remove.
        "updatedGender": (optional string 'male' or 'female') The player's new gender if it changed.
        "newSkills": (optional array of objects) For newly learned skills. Each object: {"name": string, "type": string (from SkillType enum), "quality": string, "description": string, "effect": string}.
        "updatedSkills": (optional array of objects) For existing skills that gained XP. Each object: {"skillName": string, "gainedExperience": number}.
        "newLocations": (optional array of Location objects) For newly discovered locations.
        "updatedLocations": (optional array of Location objects) For existing locations that have changed.
        "updatedPlayerLocationId": (optional string or null) The player's new location ID.
        "newNPCs": (optional array of NewNPCFromAI objects) For newly encountered NPCs. Each 'npcRelationships' object can optionally have a "relationshipType" ('FAMILY' | 'ROMANTIC' | 'FRIENDLY' | 'RIVAL').
        "updatedNPCs": (optional array of NPCUpdate objects) For existing NPCs that have changed. Can include "isDead": (boolean), "gender": ('male' | 'female'), "aptitude": (string). Each 'updatedNpcRelationships' object can optionally have a "relationshipType".
        "newItems": (optional array of Item objects) for newly acquired items. If the item type is 'Dược Phẩm', you MUST provide an 'effectsDescription' field detailing its effect.
        "updatedItems": (optional array of {name: string, quantity: number}) for updating item quantities.
        "removedItemIds": (optional array of strings) IDs of items to remove.
        "newWorldKnowledge": (optional array of WorldKnowledge objects) For newly discovered lore/factions. Each object: {"id": string, "title": string, "content": string, "category": string ('Bang Phái' | 'Lịch Sử' | 'Nhân Vật' | 'Khác')}.
    `;

    const worldGenSchema = `
        "characterProfile": An object describing the main character, including required fields like 'name', 'gender', 'race', 'skills', 'initialItems', 'initialNpcs', 'initialLocations', 'initialMonsters'. The 'initialItems' field is REQUIRED. Each 'npcRelationships' object can optionally have a "relationshipType".
        "worldSettings": An object describing the game world, including 'theme', 'powerSystems', 'initialKnowledge'. Each knowledge item MUST have a 'category'.
    `;

    return `Your response MUST be a single, valid JSON object with the following structure: {${forWorldGen ? worldGenSchema : storyResponseSchema}}`;
};

const generateOpenAiContent = async (
    systemInstruction: string,
    prompt: string,
    apiKey: string,
    isWorldGen: boolean = false
): Promise<any> => {
    log('openaiService.ts', `Calling OpenAI API (${isWorldGen ? 'WorldGen' : 'Content'})...`, 'API');
    if (!apiKey) {
        log('openaiService.ts', 'OpenAI API Key is missing.', 'ERROR');
        throw new Error("Vui lòng cung cấp API Key của OpenAI trong phần Cài đặt.");
    }

    const fullSystemInstruction = `${systemInstruction}\n\n${getJsonSchemaDescription(isWorldGen)}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: fullSystemInstruction },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
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
        log('openaiService.ts', 'OpenAI API call successful.', 'API');
        return data; // Return full data to get usage stats

    } catch (e) {
        const err = e as Error;
        log('openaiService.ts', `OpenAI API call failed: ${err.message}`, 'ERROR');
        if (err.message.includes("JSON")) {
             console.error("Failed to parse JSON response from OpenAI:", err);
             throw new Error("Lỗi phân tích phản hồi từ AI (OpenAI). Phản hồi không phải là một JSON hợp lệ.");
        }
        throw err;
    }
};

const buildPrompt = (
    historyText: string,
    actionText: string,
    characterProfile: CharacterProfile,
    worldSettings: WorldSettings,
    npcs: NPC[]
): string => {
    
    const locationMap = new Map(characterProfile.discoveredLocations.map(loc => [loc.id, loc]));
    let locationContext: string;
    let inheritedRules: string;
    
    const voidKnowledgeTitle = "Không Gian Hỗn Độn";

    if (characterProfile.currentLocationId === null) {
        const voidKnowledge = worldSettings.initialKnowledge.find(k => k.title === voidKnowledgeTitle);
        locationContext = `
**Bối cảnh Vị trí Hiện tại:**
Nhân vật đang ở trong ${voidKnowledge?.title || 'Không Gian Hỗn Độn'}.
${voidKnowledge?.content || 'Đây là một không gian trống rỗng, vô định nằm giữa các thế giới. Nơi đây không có thời gian, không gian, chỉ có năng lượng nguyên thủy cuộn chảy.'}
`;
        inheritedRules = "Không có luật lệ nào trong hư không.";
    } else {
        const path: Location[] = [];
        let currentLoc = locationMap.get(characterProfile.currentLocationId);
        while (currentLoc) {
            path.unshift(currentLoc);
            currentLoc = currentLoc.parentId ? locationMap.get(currentLoc.parentId) : null;
        }

        const currentLocationDetails = characterProfile.discoveredLocations.find(loc => loc.id === characterProfile.currentLocationId);
        
        locationContext = `
**Bối cảnh Vị trí Hiện tại: ${currentLocationDetails?.name || 'Không rõ'}**
${currentLocationDetails?.description || ''}
`;
        inheritedRules = path.flatMap(loc => (loc.rules || []).map(rule => `(Từ ${loc.name}) ${rule}`)).join('\n');
    }

    const discoveredLocationsForPrompt = characterProfile.discoveredLocations.map(
        ({ id, name, type, parentId, isDestroyed }) => ({ id, name, type, parentId, isDestroyed })
    );

    const profileForPrompt = { ...characterProfile };
    // @ts-ignore
    delete profileForPrompt.discoveredLocations;
    // @ts-ignore
    delete profileForPrompt.initialNpcs;
    // @ts-ignore
    delete profileForPrompt.initialLocations;
    // @ts-ignore
    delete profileForPrompt.initialItems;
    // @ts-ignore
    delete profileForPrompt.initialMonsters;
    
    return `
**Bối cảnh nhân vật:**
\`\`\`json
${JSON.stringify(profileForPrompt, null, 2)}
\`\`\`

**Các địa điểm đã biết:**
\`\`\`json
${JSON.stringify(discoveredLocationsForPrompt, null, 2)}
\`\`\`

${locationContext}

**Thông tin các NPC đã biết:**
\`\`\`json
${JSON.stringify(npcs.filter(npc => !npc.isDead), null, 2)}
\`\`\`

**Luật Lệ Địa Điểm Theo Phân Cấp (từ cụ thể đến chung):**
${inheritedRules || "Không có luật lệ nào tại địa điểm này."}

**Tri thức/Quy tắc do người chơi định nghĩa (Thiên Đạo):**
${worldSettings.playerDefinedRules.length > 0 ? worldSettings.playerDefinedRules.map(r => `- ${r}`).join('\n') : "Không có."}

**Lịch sử câu chuyện:**
${historyText}

**Hành động mới nhất của người chơi:**
${actionText}

Bây giờ, hãy tiếp tục câu chuyện.
`;
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
    const prompt = buildPrompt(historyText, actionText, characterProfile, worldSettings, npcs);
    const data = await generateOpenAiContent(systemInstruction, prompt, apiKey, false);
    const storyResponse = JSON.parse(data.choices[0].message.content);
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

export const getInitialStory = async (
    characterProfile: CharacterProfile,
    worldSettings: WorldSettings,
    isMature: boolean,
    perspective: NarrativePerspective,
    apiKey: string
): Promise<StoryApiResponse> => {
    const systemInstruction = getSystemInstruction(isMature, perspective, characterProfile.gender, characterProfile.race, characterProfile.powerSystem, worldSettings);
    const profileForPrompt = { ...characterProfile };
    // @ts-ignore
    delete profileForPrompt.discoveredLocations;
    // @ts-ignore
    delete profileForPrompt.initialLocations;
    // @ts-ignore
    delete profileForPrompt.initialNpcs;
    // @ts-ignore
    delete profileForPrompt.initialItems;
    // @ts-ignore
    delete profileForPrompt.initialMonsters;

    const initialPrompt = `
Hãy bắt đầu một câu chuyện mới cho nhân vật sau đây.

**Bối cảnh nhân vật:**
\`\`\`json
${JSON.stringify(profileForPrompt, null, 2)}
\`\`\`

**Tri thức/Quy tắc do người chơi định nghĩa (Thiên Đạo):**
${worldSettings.playerDefinedRules.length > 0 ? worldSettings.playerDefinedRules.map(r => `- ${r}`).join('\n') : "Không có."}

Bạn PHẢI bắt đầu câu chuyện tại vị trí hiện tại của nhân vật ('currentLocationId'), được cung cấp trong Bối cảnh nhân vật. Hãy viết đoạn mở đầu thật hấp dẫn, giới thiệu nhân vật và thế giới tại địa điểm đó.
Sau đó, cung cấp chính xác BỐN (4) lựa chọn hành động đầu tiên cho người chơi.
`;

    const data = await generateOpenAiContent(systemInstruction, initialPrompt, apiKey, false);
    const storyResponse = JSON.parse(data.choices[0].message.content);
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

export const generateWorldFromIdea = async (storyIdea: string, openingScene: string, apiKey: string): Promise<{ characterProfile: CharacterProfile, worldSettings: WorldSettings }> => {
    const systemInstruction = `Bạn là một người sáng tạo thế giới và viết truyện chuyên nghiệp cho một trò chơi nhập vai tương tác. Nhiệm vụ của bạn là tạo ra một thế giới phong phú và một nhân vật chính hấp dẫn dựa trên ý tưởng của người dùng.`;
    const prompt = `
Dựa trên ý tưởng cốt truyện và bối cảnh sau đây, hãy tạo ra một thế giới hoàn chỉnh và một nhân vật chính để bắt đầu một game nhập vai tương tác.

**Ý Tưởng Cốt Truyện:**
${storyIdea}

**Cảnh Mở Đầu (tùy chọn):**
${openingScene || "Không có."}

**YÊU CẦU:**
Bạn PHẢI trả về một đối tượng JSON duy nhất. Đối tượng này chứa hai khóa chính: 'characterProfile' và 'worldSettings'.

**HƯỚNG DẪN CHI TIẾT:**

1.  **Chủ đề & Thể loại (Quan trọng):**
    *   Ưu tiên các chủ đề và thể loại phương Đông như Tiên Hiệp, Huyền Huyễn, Tu Chân.
    *   Chỉ sử dụng các chủ đề thần thoại hoặc bối cảnh phương Tây (ví dụ: fantasy trung cổ, thần thoại Hy Lạp) nếu người dùng yêu cầu rõ ràng trong **Ý Tưởng Cốt Truyện**.

2.  **Hệ Thống Sức Mạnh (\`powerSystems\`):**
    *   Thiết kế ít nhất BA (3) hệ thống sức mạnh.
    *   **Tên Hệ Thống:** Tên phải bao quát và cụ thể về bản chất của nó (ví dụ: 'Tiên Đạo Tu Luyện', 'Ma Đạo Tu Luyện', 'Thần Đạo Tu Luyện', 'Dục Đạo Tu Luyện').
    *   **Cảnh Giới:** Mỗi hệ thống sức mạnh **BẮT BUỘC** phải có chính xác MƯỜI (10) cảnh giới. Chuỗi cảnh giới (\`realms\`) cho mọi hệ thống **BẮT BUỘC** phải bắt đầu bằng \`Phàm Nhân - \`. Tổng cộng sẽ có 10 tên cảnh giới, được phân cách bởi ' - '.
    *   Các hệ thống này phải đồng bộ với chủ đề chính. Ví dụ, nếu là thế giới phương Đông, hãy tạo các hệ thống như 'Tiên Đạo Tu Luyện', 'Ma Đạo Tu Luyện', 'Yêu Tộc Tu Luyện', 'Kiếm Đạo Tu Luyện'.
    *   Không kết hợp các hệ thống phương Đông và phương Tây trừ khi được yêu cầu.

3.  **Nhân vật chính (\`characterProfile\`):**
    *   Tạo ra một nhân vật chính có tiểu sử, tính cách và mục tiêu phù hợp với cốt truyện.
    *   **Chủng tộc (\`race\`):** Tên Chủng tộc của nhân vật chính phải ngắn gọn và mang tính thần thoại phương Đông (ví dụ: Nhân Tộc, Long Tộc, Thần Tộc, Ma Tộc, Tiên Tộc, Yêu Tộc).
    *   **Cấp độ khởi đầu (\`level\`):** Gán cho nhân vật một cấp độ khởi đầu từ 1 đến 5. Cấp độ này sẽ tự động đặt nhân vật vào cảnh giới đầu tiên (Phàm Nhân).
    *   **Kỹ năng khởi đầu (\`skills\`):** Nhân vật chính PHẢI bắt đầu với ít nhất SÁU (6) kỹ năng, mỗi kỹ năng thuộc một loại khác nhau (Công Kích, Phòng Ngự, Thân Pháp, Tu Luyện, Hỗ Trợ, Đặc Biệt).

4.  **Yếu tố ban đầu (\`initialNpcs\`, \`initialLocations\`, \`initialItems\`, \`initialMonsters\`):**
    *   **NPC Khởi đầu:** Tạo ít nhất NĂM (5) NPC nữ và HAI (2) NPC nam phù hợp với cốt truyện.
    *   **Quan hệ NPC ban đầu (Mới):** Hãy tạo ra một vài mối quan hệ ban đầu giữa các NPC bạn tạo ra (ví dụ: một cặp sư đồ, hai người là đối thủ, một gia đình). Thể hiện điều này trong trường \`npcRelationships\` của mỗi NPC liên quan. Cung cấp 'id' của NPC mục tiêu và một giá trị quan hệ từ -100 đến 100.
    *   **Sinh Vật Khởi Đầu (\`initialMonsters\`):** Tạo ít nhất NĂM (5) loại sinh vật, yêu thú hoặc quái vật phù hợp với bối cảnh và chủ đề của thế giới.
    *   **Địa điểm Khởi đầu:**
        *   Tạo ít nhất MƯỜI (10) địa điểm khởi đầu.
        *   **Bắt buộc:** PHẢI có một địa điểm gốc loại 'THẾ GIỚI' làm cấp cao nhất (có \`parentId\` là \`null\`). Đây là nền tảng của toàn bộ bản đồ.
        *   **Thế Lực (Bang Phái):** Tạo ít nhất HAI (2) địa điểm loại 'THẾ LỰC'. Đây là các tông môn, hoàng triều, giáo phái, v.v.
        *   **Đồng bộ Tri Thức (Quan trọng):** Với MỖI địa điểm loại 'THẾ LỰC' bạn tạo, bạn PHẢI tạo một mục 'initialKnowledge' tương ứng với 'category' là 'Bang Phái'. Tiêu đề của tri thức phải là tên của thế lực, và nội dung mô tả về thế lực đó.
        *   Xây dựng một cấu trúc phân cấp (đa tầng) hợp lý cho các địa điểm còn lại (ví dụ: thành phố trong thế giới, cửa hàng trong thành phố).
        *   **Phân bổ Tọa độ (Rất Quan Trọng):** Tọa độ (\`coordinates\`) là một điểm trên bản đồ 1000x1000. Khi tạo các địa điểm, hãy đảm bảo các địa điểm trong cùng một khu vực (có cùng \`parentId\`) được phân bổ cách xa nhau một cách hợp lý. Tăng khoảng cách cho các địa điểm ở cấp cao hơn. Ví dụ: Các thành phố (con của THẾ GIỚI) nên cách nhau 150-250 đơn vị. Các cửa hàng (con của một THÀNH PHỐ) nên cách nhau 30-60 đơn vị. Mục tiêu là tạo một bản đồ rõ ràng, không bị chồng chéo.
        *   **Vị trí bắt đầu:** Địa điểm đầu tiên trong mảng \`initialLocations\` phải là nơi nhân vật bắt đầu.
    *   **Trang bị khởi đầu (\`initialItems\`):** BẮT BUỘC phải tạo ít nhất BA (3) trang bị khởi đầu. Các trang bị này phải **phù hợp tuyệt đối** với bối cảnh, tiểu sử, và hệ thống sức mạnh của nhân vật mà bạn cũng đang tạo ra. Ví dụ, một nhân vật tu tiên không nên bắt đầu với một khẩu súng laser. Bao gồm ít nhất một vũ khí. Trường này là bắt buộc.
        *   **BẮT BUỘC:** Đối với mỗi vật phẩm có \`type\` là 'Trang Bị' hoặc 'Đặc Thù', bạn PHẢI cung cấp đầy đủ đối tượng \`equipmentDetails\`.
        *   **QUY TẮC CHỈ SỐ (CỰC KỲ QUAN TRỌNG):** Các chỉ số trong \`stats.key\` CHỈ ĐƯỢỢC PHÉP là một trong ba giá trị sau: \`'attack'\`, \`'maxHealth'\`, \`'maxMana'\`. Tuyệt đối KHÔNG được thêm bất kỳ chỉ số nào khác (ví dụ: critChance, defense, v.v.).
        *   **LOGIC QUAN TRỌNG:** Giá trị chỉ số (\`stats.value\`) của trang bị PHẢI tương xứng với phẩm chất (\`quality\`) của nó. Hãy sử dụng chuỗi \`qualityTiers\` làm thang đo.
            *   Ví dụ cho chỉ số 'attack' của một vũ khí:
                *   Phàm Phẩm: +5 đến +20
                *   Linh Phẩm: +25 đến +100
                *   Tiên Phẩm: +120 đến +500
                *   Thánh Phẩm: +600 đến +2000
                *   Thần Phẩm: +2500 đến +10000
                *   Hỗn Độn Phẩm: +12000 trở lên
            *   Hãy áp dụng logic tương tự cho các chỉ số khác như 'maxHealth', 'maxMana'. Chỉ số phải tăng mạnh theo mỗi bậc phẩm chất.

5.  **Tri Thức Thế Giới (\`initialKnowledge\`) - Cốt lõi:**
    *   Tạo ra các mục tri thức phong phú để giải thích các khái niệm của thế giới.
    *   **Bắt buộc** phải có các mục tri thức RIÊNG BIỆT cho:
        *   Thể Chất Đặc Biệt (\`specialConstitution\`) của nhân vật chính.
        *   Thiên Phú (\`talent\`) của nhân vật chính.
        *   Loại Tiền Tệ (\`currencyName\`).
        *   Hệ Thống Năng Lượng cốt lõi của thế giới (ví dụ: Linh Khí, Ma Khí, Nguyên Tố...).
    *   **MỚI:** Với mỗi mục tri thức, hãy gán một \`category\` phù hợp ('Bang Phái', 'Lịch Sử', 'Nhân Vật', 'Khác').
    *   Thêm các mục tri thức khác để làm rõ về lịch sử, chủng tộc, địa lý, hoặc các yếu tố độc đáo.

Hãy bắt đầu!
`;

    const data = await generateOpenAiContent(systemInstruction, prompt, apiKey, true);
    const result = JSON.parse(data.choices[0].message.content);
    
    if (!result || typeof result !== 'object') {
        throw new Error("Dữ liệu trả về từ AI không hợp lệ.");
    }

    if (!result.characterProfile || !result.worldSettings) {
        throw new Error("Phản hồi từ AI thiếu 'characterProfile' hoặc 'worldSettings'.");
    }

    const { characterProfile, worldSettings } = result;

    const validationMap: { [key: string]: { data: any[], keys: string[] } } = {
        'worldSettings.powerSystems': { data: worldSettings.powerSystems, keys: ['id', 'name', 'realms'] },
        'worldSettings.initialKnowledge': { data: worldSettings.initialKnowledge, keys: ['id', 'title', 'content', 'category'] },
        'characterProfile.skills': { data: characterProfile.skills, keys: ['id', 'name'] },
        'characterProfile.initialItems': { data: characterProfile.initialItems, keys: ['id', 'name'] },
        'characterProfile.initialNpcs': { data: characterProfile.initialNpcs, keys: ['id', 'name'] },
        'characterProfile.initialLocations': { data: characterProfile.initialLocations, keys: ['id', 'name'] },
        'characterProfile.initialMonsters': { data: characterProfile.initialMonsters, keys: ['id', 'name'] },
    };

    for (const [arrayName, validation] of Object.entries(validationMap)) {
        if (!validation.data || !Array.isArray(validation.data)) {
            throw new Error(`Thuộc tính '${arrayName}' không hợp lệ. Vui lòng kiểm tra console.`);
        }
        for (let i = 0; i < validation.data.length; i++) {
            const item = validation.data[i];
            if (!item || typeof item !== 'object') {
                throw new Error(`Một phần tử trong '${arrayName}' không phải là một đối tượng hợp lệ. Vui lòng kiểm tra console.`);
            }
            for (const key of validation.keys) {
                if (item[key] === undefined || item[key] === null) {
                     throw new Error(`Một phần tử trong '${arrayName}' thiếu thuộc tính bắt buộc '${key}'. Vui lòng kiểm tra console.`);
                }
            }
        }
    }
    
    return result as { characterProfile: CharacterProfile, worldSettings: WorldSettings };
};

export const generateNewSkillDescription = async (
    skill: Skill,
    newQuality: string,
    worldSettings: WorldSettings,
    apiKey: string
): Promise<{ description: string; effect: string }> => {
    log('openaiService.ts', `Generating new skill description for ${skill.name} -> ${newQuality}`, 'API');
    if (!apiKey) {
        log('openaiService.ts', 'OpenAI API Key is missing.', 'ERROR');
        throw new Error("Vui lòng cung cấp API Key của OpenAI trong phần Cài đặt.");
    }
    
    const systemInstruction = `You are a creative writer for a fantasy RPG. Your task is to upgrade a skill's description and effect when it has a quality breakthrough. You MUST respond with a single, valid JSON object with the following structure: {"description": "new, more powerful description in Vietnamese", "effect": "new, more powerful effect in Vietnamese"}. The language of the response MUST be Vietnamese.`;
    
    const prompt = `
Một kỹ năng đã đột phá và cần được nâng cấp.

**Bối cảnh thế giới:** ${worldSettings.theme}, ${worldSettings.genre}.

**Kỹ năng gốc:**
- **Tên:** ${skill.name}
- **Phẩm chất cũ:** ${skill.quality}
- **Mô tả cũ:** ${skill.description}
- **Hiệu ứng cũ:** ${skill.effect}

**Phẩm chất mới:** ${newQuality}

**Yêu cầu:**
Dựa trên thông tin trên, hãy sáng tạo ra một **MÔ TẢ** và **HIỆU ỨNG** mới cho kỹ năng này.
- **Mô tả mới:** Phải hoành tráng và mạnh mẽ hơn, phản ánh đúng sự đột phá về phẩm chất.
- **Hiệu ứng mới:** Phải là một phiên bản nâng cấp rõ rệt của hiệu ứng cũ (ví dụ: sát thương cao hơn, thêm hiệu ứng phụ, giảm thời gian hồi chiêu, v.v.).

Trả về một đối tượng JSON duy nhất.
`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: systemInstruction },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
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
            } catch (e) { }
            throw new Error(`Lỗi từ OpenAI API khi tạo mô tả kỹ năng: ${errorDetails}`);
        }

        const data = await response.json();
        const jsonContent = JSON.parse(data.choices[0].message.content);
        log('openaiService.ts', `Skill description generation successful for ${skill.name}.`, 'API');
        return jsonContent as { description: string; effect: string };

    } catch (e) {
        const err = e as Error;
        log('openaiService.ts', `Skill description generation failed: ${err.message}`, 'ERROR');
        if (err.message.includes("JSON")) {
            console.error("Failed to parse JSON response from OpenAI for skill description:", err);
            throw new Error("Lỗi phân tích phản hồi từ AI (OpenAI). Phản hồi không phải là một JSON hợp lệ.");
        }
        throw err;
    }
};
