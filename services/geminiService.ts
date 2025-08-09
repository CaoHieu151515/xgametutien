
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { StoryResponse, NarrativePerspective, CharacterGender, CharacterProfile, WorldSettings, SkillType, Location, LocationType, NPC, NewNPCFromAI, NPCUpdate, Skill, Choice, ItemType, EquipmentType, StoryApiResponse, WorldKnowledge } from '../types';
import { getSystemInstruction } from '../config/contentConfig';
import { log } from './logService';

const USE_DEFAULT_KEY_IDENTIFIER = '_USE_DEFAULT_KEY_';

const getFinalApiKey = (apiKey: string): string => {
    const finalKey = apiKey === USE_DEFAULT_KEY_IDENTIFIER ? process.env.API_KEY : apiKey;
    if (!finalKey) {
        log('geminiService.ts', "API Key is missing.", 'ERROR');
        throw new Error("Vui lòng cung cấp API Key của Google Gemini trong phần Cài đặt, hoặc đảm bảo API Key mặc định đã được cấu hình.");
    }
    return finalKey;
};

const statusEffectSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên của trạng thái (ví dụ: 'Trúng Độc', 'Tăng Sức Mạnh')." },
        description: { type: Type.STRING, description: "Mô tả ngắn gọn về ảnh hưởng của trạng thái." },
        duration: { type: Type.STRING, description: "Thời hạn của trạng thái (ví dụ: 'Vĩnh viễn', '3 lượt', '1 ngày')." }
    },
    required: ["name", "description", "duration"]
};

const updatedStatsSchema = {
    type: Type.OBJECT,
    description: "Một đối tượng tùy chọn chứa các chỉ số của nhân vật đã được cập nhật. Chỉ bao gồm các chỉ số đã thay đổi. Hệ thống sẽ tự xử lý việc lên cấp, bạn chỉ cần cung cấp điểm kinh nghiệm nhận được.",
    properties: {
        health: { type: Type.NUMBER, description: "Sinh lực hiện tại của nhân vật (ví dụ: sau khi chịu sát thương)." },
        mana: { type: Type.NUMBER, description: "Linh lực/Năng lượng hiện tại của nhân vật (ví dụ: sau khi dùng phép)." },
        currencyAmount: { type: Type.NUMBER, description: "Số lượng tiền tệ hiện tại của nhân vật." },
        gainedExperience: { type: Type.NUMBER, description: "Điểm kinh nghiệm nhân vật NHẬN ĐƯỢỢC từ hành động này (không phải tổng kinh nghiệm). Hệ thống sẽ tự cộng dồn." },
        newStatusEffects: {
            type: Type.ARRAY,
            description: "Một mảng các trạng thái mới được thêm cho nhân vật do sự kiện trong truyện. Bỏ qua nếu không có.",
            items: statusEffectSchema,
            nullable: true,
        },
        removedStatusEffects: {
            type: Type.ARRAY,
            description: "Một mảng tên các trạng thái cần được xóa bỏ khỏi nhân vật (do hết hạn hoặc bị giải trừ). Bỏ qua nếu không có.",
            items: { type: Type.STRING },
            nullable: true,
        }
    },
    nullable: true,
};

const newSkillSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên của kỹ năng mới." },
        type: { type: Type.STRING, enum: Object.values(SkillType), description: "Loại kỹ năng." },
        quality: { type: Type.STRING, description: "Phẩm chất khởi đầu của kỹ năng (ví dụ: Phàm Phẩm)." },
        description: { type: Type.STRING, description: "Mô tả về kỹ năng mới." },
        effect: { type: Type.STRING, description: "Hiệu ứng cụ thể của kỹ năng mới." }
    },
    required: ["name", "type", "quality", "description", "effect"]
};

const equipmentStatSchema = {
    type: Type.OBJECT,
    properties: {
        key: { type: Type.STRING, description: "Mã chỉ số. CHỈ SỬ DỤNG: 'attack', 'maxHealth', hoặc 'maxMana'.", enum: ['attack', 'maxHealth', 'maxMana'] },
        value: { type: Type.NUMBER, description: "Giá trị cộng thêm." }
    },
    required: ["key", "value"]
};

const equipmentDetailsSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: Object.values(EquipmentType), description: "Loại trang bị." },
        stats: { type: Type.ARRAY, items: equipmentStatSchema, description: "Các chỉ số mà trang bị này cộng thêm." },
        effect: { type: Type.STRING, description: "Mô tả hiệu ứng đặc biệt của trang bị.", nullable: true }
    },
    required: ["type", "stats"]
};

const itemSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất cho vật phẩm." },
        name: { type: Type.STRING, description: "Tên vật phẩm." },
        description: { type: Type.STRING, description: "Mô tả vật phẩm." },
        type: { type: Type.STRING, enum: Object.values(ItemType), description: "Loại vật phẩm." },
        quality: { type: Type.STRING, description: "Phẩm chất của vật phẩm, dựa trên worldSettings.qualityTiers." },
        quantity: { type: Type.NUMBER, description: "Số lượng vật phẩm." },
        value: { type: Type.NUMBER, description: "Giá trị tham khảo của vật phẩm bằng tiền tệ trong game.", nullable: true },
        equipmentDetails: { ...equipmentDetailsSchema, nullable: true, description: "Chi tiết nếu vật phẩm là một trang bị." },
        effectsDescription: { type: Type.STRING, description: "Mô tả hiệu ứng cụ thể của vật phẩm nếu nó là 'Dược Phẩm'. Ví dụ: 'Hồi phục 500 sinh lực', 'Tăng 10% tấn công trong 3 lượt', 'Gây trúng độc, giảm 100 sinh lực mỗi lượt trong 5 lượt.'", nullable: true }
    },
    required: ["id", "name", "description", "type", "quality", "quantity"]
};

const locationSchema = {
    type: Type.OBJECT,
    description: "Một địa điểm trong thế giới game.",
    properties: {
        id: { type: Type.STRING, description: "Một ID duy nhất cho địa điểm, ví dụ sử dụng một chuỗi ngẫu nhiên." },
        name: { type: Type.STRING, description: "Tên của địa điểm." },
        description: { type: Type.STRING, description: "Mô tả chi tiết về địa điểm." },
        type: { type: Type.STRING, enum: Object.values(LocationType), description: "Loại địa điểm." },
        coordinates: {
            type: Type.OBJECT,
            description: "Tọa độ x và y của địa điểm trên bản đồ (từ 0 đến 1000).",
            properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
            },
            required: ["x", "y"]
        },
        parentId: {
            type: Type.STRING,
            description: "ID của địa điểm cha. Null nếu là địa điểm cấp cao nhất (THẾ GIỚI).",
            nullable: true,
        },
        ownerId: {
            type: Type.STRING,
            description: "ID của nhân vật sở hữu địa điểm. Dùng giá trị 'player' nếu người chơi là chủ sở hữu. Null nếu không có chủ.",
            nullable: true,
        },
        rules: {
            type: Type.ARRAY,
            description: "Một mảng các chuỗi mô tả luật lệ hoặc đặc tính vật lý/siêu nhiên của địa điểm này (ví dụ: 'Không thể bay trong thành', 'Linh khí ở đây dày đặc gấp đôi').",
            items: { type: Type.STRING },
            nullable: true,
        },
        isDestroyed: {
            type: Type.BOOLEAN,
            description: "Đặt thành true nếu địa điểm này (và tất cả các địa điểm con của nó) đã bị phá hủy. Không thể di chuyển đến địa điểm đã bị phá hủy.",
            nullable: true,
        },
    },
    required: ["id", "name", "description", "type", "coordinates", "parentId", "ownerId", "rules"]
};

const mienLucSchema = {
    type: Type.OBJECT,
    description: "Thang điểm vẻ đẹp (Mị Lực) của NPC, bao gồm 4 thành phần.",
    properties: {
        body: { type: Type.NUMBER, description: "Điểm vóc dáng (tối đa 25)." },
        face: { type: Type.NUMBER, description: "Điểm khuôn mặt (tối đa 30)." },
        aura: { type: Type.NUMBER, description: "Điểm khí chất (tối đa 25)." },
        power: { type: Type.NUMBER, description: "Điểm tu vi/sức mạnh ảnh hưởng đến vẻ ngoài (tối đa 25)." }
    },
    required: ["body", "face", "aura", "power"]
};

const npcRelationshipSchema = {
    type: Type.OBJECT,
    description: "Mô tả mối quan hệ giữa một NPC với một NPC khác.",
    properties: {
        targetNpcId: { type: Type.STRING, description: "ID của NPC mục tiêu." },
        value: { type: Type.NUMBER, description: "Giá trị quan hệ, từ -1000 (kẻ thù) đến 1000 (tri kỷ)." },
        relationshipType: { type: Type.STRING, enum: ['FAMILY', 'ROMANTIC', 'FRIENDLY', 'RIVAL'], description: "Loại mối quan hệ.", nullable: true }
    },
    required: ["targetNpcId", "value"]
};

const specialConstitutionSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên thể chất đặc biệt." },
        description: { type: Type.STRING, description: "Mô tả chi tiết về thể chất." },
    },
    required: ["name", "description"],
};

const talentSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên thiên phú." },
        description: { type: Type.STRING, description: "Mô tả chi tiết về thiên phú." },
    },
    required: ["name", "description"],
};

const newNpcSchema = {
    type: Type.OBJECT,
    description: "Mô tả một Nhân Vật Phụ (NPC) trong thế giới.",
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất cho NPC." },
        name: { type: Type.STRING, description: "Tên của NPC." },
        aliases: { type: Type.STRING, description: "Các biệt danh hoặc tên gọi khác của NPC.", nullable: true },
        gender: { type: Type.STRING, enum: Object.values(CharacterGender), description: "Giới tính của NPC." },
        race: { type: Type.STRING, description: "Chủng tộc của NPC." },
        personality: { type: Type.STRING, description: "Mô tả tính cách của NPC." },
        description: { type: Type.STRING, description: "Mô tả ngoại hình và tiểu sử của NPC." },
        avatarUrl: { type: Type.STRING, description: "URL ảnh đại diện cho NPC (tùy chọn).", nullable: true },
        level: { type: Type.NUMBER, description: "Cấp độ khởi đầu của NPC." },
        powerSystem: { type: Type.STRING, description: "Tên hệ thống tu luyện NPC theo." },
        aptitude: { type: Type.STRING, description: "Tên tư chất của NPC." },
        mienLuc: { ...mienLucSchema, description: "Thang điểm vẻ đẹp (Mị Lực) của NPC." },
        locationId: { type: Type.STRING, description: "ID của địa điểm nơi NPC sinh sống ban đầu.", nullable: true },
        specialConstitution: { ...specialConstitutionSchema, nullable: true, description: "Thể chất đặc biệt của NPC (nếu có)." },
        innateTalent: { ...talentSchema, nullable: true, description: "Thiên phú bẩm sinh của NPC (nếu có)." },
        statusEffects: { type: Type.ARRAY, items: statusEffectSchema, nullable: true, description: "Các trạng thái ban đầu của NPC." },
        npcRelationships: { type: Type.ARRAY, items: npcRelationshipSchema, nullable: true, description: "Mối quan hệ ban đầu của NPC này với các NPC khác." },
        isDaoLu: { type: Type.BOOLEAN, description: "Trạng thái Đạo Lữ với người chơi (luôn là false khi khởi tạo).", nullable: true }
    },
    required: ["id", "name", "gender", "race", "personality", "description", "level", "powerSystem", "aptitude", "mienLuc", "locationId", "statusEffects"]
};

const monsterSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất cho sinh vật." },
        name: { type: Type.STRING, description: "Tên sinh vật." },
        description: { type: Type.STRING, description: "Mô tả sinh vật." }
    },
    required: ["id", "name", "description"]
};

const skillSchema = { 
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất cho kỹ năng." },
        name: { type: Type.STRING, description: "Tên kỹ năng." },
        type: { type: Type.STRING, enum: Object.values(SkillType) },
        quality: { type: Type.STRING, description: "Phẩm chất khởi đầu của kỹ năng." },
        level: { type: Type.NUMBER, description: "Cấp độ khởi đầu của kỹ năng (thường là 1)." },
        experience: { type: Type.NUMBER, description: "Kinh nghiệm khởi đầu (thường là 0)." },
        description: { type: Type.STRING, description: "Mô tả kỹ năng." },
        effect: { type: Type.STRING, description: "Hiệu ứng của kỹ năng." },
    },
    required: ["id", "name", "type", "quality", "level", "experience", "description", "effect"],
};

const characterProfileSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên nhân vật chính." },
        gender: { type: Type.STRING, enum: Object.values(CharacterGender) },
        race: { type: Type.STRING, description: "Chủng tộc của nhân vật chính." },
        powerSystem: { type: Type.STRING, description: "Tên hệ thống sức mạnh nhân vật theo." },
        level: { type: Type.NUMBER, description: "Cấp độ khởi đầu của nhân vật, từ 1 đến 5." },
        currencyName: { type: Type.STRING, description: "Tên đơn vị tiền tệ trong thế giới." },
        currencyAmount: { type: Type.NUMBER, description: "Số tiền khởi đầu." },
        personality: { type: Type.STRING, description: "Tính cách của nhân vật." },
        backstory: { type: Type.STRING, description: "Tiểu sử của nhân vật." },
        goal: { type: Type.STRING, description: "Mục tiêu chính của nhân vật." },
        specialConstitution: specialConstitutionSchema,
        talent: talentSchema,
        avatarUrl: { type: Type.STRING, nullable: true, description: "URL ảnh đại diện." },
        skills: { type: Type.ARRAY, items: skillSchema, description: "Các kỹ năng khởi đầu." },
        initialItems: { type: Type.ARRAY, items: itemSchema, description: "Các vật phẩm và trang bị khởi đầu. BẮT BUỘC phải có." },
        initialNpcs: { type: Type.ARRAY, items: newNpcSchema, description: "Danh sách NPC khởi đầu." },
        initialLocations: { type: Type.ARRAY, items: locationSchema, description: "Danh sách các địa điểm khởi đầu. Nhân vật sẽ bắt đầu tại địa điểm đầu tiên trong danh sách này." },
        initialMonsters: { type: Type.ARRAY, items: monsterSchema, description: "Danh sách các sinh vật/quái vật khởi đầu." },
    },
    required: ["name", "gender", "race", "powerSystem", "level", "currencyName", "currencyAmount", "personality", "backstory", "goal", "specialConstitution", "talent", "skills", "initialItems", "initialNpcs", "initialLocations", "initialMonsters"]
};

const powerSystemDefinitionSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất cho hệ thống sức mạnh, ví dụ: 'tu_tien_1'." },
        name: { type: Type.STRING, description: "Tên hệ thống sức mạnh, ví dụ: 'Tu Tiên'." },
        realms: { type: Type.STRING, description: "Chuỗi các cảnh giới, phân cách bởi ' - ', ví dụ: 'Luyện Khí - Trúc Cơ - Kim Đan'." },
    },
    required: ["id", "name", "realms"],
};

const worldKnowledgeSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất cho mục tri thức, ví dụ: 'lore_1'." },
        title: { type: Type.STRING, description: "Tiêu đề của mục tri thức." },
        content: { type: Type.STRING, description: "Nội dung chi tiết của tri thức." },
        category: { type: Type.STRING, enum: ['Bang Phái', 'Lịch Sử', 'Nhân Vật', 'Khác'], description: "Phân loại tri thức." }
    },
    required: ["id", "title", "content", "category"],
};

const worldSettingsSchema = {
    type: Type.OBJECT,
    properties: {
        theme: { type: Type.STRING, description: "Chủ đề bao quát của thế giới." },
        genre: { type: Type.STRING, description: "Thể loại của câu chuyện." },
        context: { type: Type.STRING, description: "Bối cảnh chi tiết của thế giới." },
        powerSystems: { type: Type.ARRAY, items: powerSystemDefinitionSchema, description: "Danh sách các hệ thống sức mạnh trong thế giới." },
        qualityTiers: { type: Type.STRING, description: "Chuỗi các phẩm chất, từ thấp đến cao, phân cách bởi ' - '." },
        aptitudeTiers: { type: Type.STRING, description: "Chuỗi các tư chất, từ thấp đến cao, phân cách bởi ' - '." },
        initialKnowledge: { type: Type.ARRAY, items: worldKnowledgeSchema, description: "Danh sách các tri thức nền tảng của thế giới (lore)." },
    },
    required: ["theme", "genre", "context", "powerSystems", "qualityTiers", "aptitudeTiers", "initialKnowledge"]
};

export const generateWorldFromIdea = async (storyIdea: string, openingScene: string, apiKey: string): Promise<{ characterProfile: CharacterProfile, worldSettings: WorldSettings }> => {
    log('geminiService.ts', `Generating world from idea...`, 'API');
    try {
        const finalApiKey = getFinalApiKey(apiKey);
        const ai = new GoogleGenAI({ apiKey: finalApiKey });
        const model = 'gemini-2.5-flash';

        const prompt = `
Dựa trên ý tưởng cốt truyện và bối cảnh sau đây, hãy tạo ra một thế giới hoàn chỉnh và một nhân vật chính để bắt đầu một game nhập vai tương tác.

**Ý Tưởng Cốt Truyện:**
${storyIdea}

**Cảnh Mở Đầu (tùy chọn):**
${openingScene || "Không có."}

**YÊU CẦU:**
Bạn PHẢI trả về một đối tượng JSON duy nhất tuân thủ nghiêm ngặt schema được cung cấp. Đối tượng này chứa hai khóa chính: 'characterProfile' và 'worldSettings'.

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

Hãy bắt đầu!`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        characterProfile: characterProfileSchema,
                        worldSettings: worldSettingsSchema
                    },
                    required: ["characterProfile", "worldSettings"]
                },
            },
        });
        
        const jsonText = response.text.trim();
        let result;
        try {
            result = JSON.parse(jsonText);
        } catch (e) {
            console.error("Lỗi phân tích JSON từ Gemini AI:", e);
            console.error("Dữ liệu JSON nhận được:", jsonText);
            throw new Error("Phản hồi từ AI không phải là JSON hợp lệ. Vui lòng thử lại. Chi tiết đã được ghi vào console.");
        }

        if (!result || typeof result !== 'object') {
            console.error("Phản hồi từ AI không phải là một đối tượng:", result);
            throw new Error("Dữ liệu trả về từ AI không hợp lệ.");
        }

        if (!result.characterProfile || !result.worldSettings) {
            console.error("Dữ liệu AI không đầy đủ (thiếu characterProfile hoặc worldSettings):", result);
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
                console.error(`Thuộc tính '${arrayName}' không phải là một mảng hoặc bị thiếu:`, validation.data);
                console.error("Toàn bộ dữ liệu:", result);
                throw new Error(`Thuộc tính '${arrayName}' không hợp lệ. Vui lòng kiểm tra console.`);
            }
            for (let i = 0; i < validation.data.length; i++) {
                const item = validation.data[i];
                if (!item || typeof item !== 'object') {
                    console.error(`Phần tử không hợp lệ tại chỉ số ${i} trong '${arrayName}':`, item);
                    console.error("Toàn bộ dữ liệu:", result);
                    throw new Error(`Một phần tử trong '${arrayName}' không phải là một đối tượng hợp lệ. Vui lòng kiểm tra console.`);
                }
                for (const key of validation.keys) {
                    if (item[key] === undefined || item[key] === null) {
                         console.error(`Phần tử thiếu key '${key}' tại chỉ số ${i} trong '${arrayName}':`, item);
                         console.error("Toàn bộ dữ liệu:", result);
                         throw new Error(`Một phần tử trong '${arrayName}' thiếu thuộc tính bắt buộc '${key}'. Vui lòng kiểm tra console.`);
                    }
                }
            }
        }
        log('geminiService.ts', 'World generation successful.', 'API');
        return result as { characterProfile: CharacterProfile, worldSettings: WorldSettings };
    } catch(err) {
        log('geminiService.ts', `World generation failed: ${(err as Error).message}`, 'ERROR');
        throw err;
    }
};

const updatedNpcSchema = {
    type: Type.OBJECT,
    description: "Các trường để cập nhật một NPC đã tồn tại. Chỉ bao gồm ID và các trường đã thay đổi.",
    properties: {
        id: { type: Type.STRING, description: "ID của NPC cần cập nhật." },
        gainedExperience: { type: Type.NUMBER, description: "Kinh nghiệm NPC nhận được. Hệ thống sẽ tự xử lý việc lên cấp.", nullable: true },
        relationship: { type: Type.NUMBER, description: "Giá trị quan hệ mới với người chơi. Chỉ cung cấp nếu có thay đổi.", nullable: true },
        memories: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Toàn bộ danh sách ký ức MỚI của NPC (bao gồm cả cũ và mới).", nullable: true },
        health: { type: Type.NUMBER, description: "Sinh lực hiện tại của NPC.", nullable: true },
        mana: { type: Type.NUMBER, description: "Linh lực hiện tại của NPC.", nullable: true },
        gender: { type: Type.STRING, enum: Object.values(CharacterGender), description: "Giới tính mới của NPC nếu bị thay đổi bởi phép thuật hoặc sự kiện.", nullable: true },
        personality: { type: Type.STRING, description: "Tính cách mới của NPC nếu có sự thay đổi lớn.", nullable: true },
        description: { type: Type.STRING, description: "Mô tả mới của NPC nếu có sự thay đổi.", nullable: true },
        locationId: { type: Type.STRING, description: "ID vị trí mới của NPC.", nullable: true },
        aptitude: { type: Type.STRING, description: "Tư chất mới của NPC nếu bị thay đổi bởi độc dược hoặc sự kiện.", nullable: true },
        updatedNpcRelationships: { type: Type.ARRAY, items: npcRelationshipSchema, description: "Toàn bộ danh sách mối quan hệ MỚI của NPC này với các NPC khác.", nullable: true },
        isDaoLu: { type: Type.BOOLEAN, description: "Đặt thành true nếu NPC trở thành Đạo Lữ của người chơi.", nullable: true },
        isDead: { type: Type.BOOLEAN, description: "Đặt thành true nếu NPC đã chết.", nullable: true },
        newStatusEffects: { type: Type.ARRAY, items: statusEffectSchema, nullable: true },
        removedStatusEffects: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true }
    },
    required: ["id"]
};

const choiceSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Tiêu đề của lựa chọn, ngắn gọn, hấp dẫn và là hành động người chơi sẽ thực hiện (ví dụ: 'Thám hiểm hang động')." },
        benefit: { type: Type.STRING, description: "Lợi ích chính nếu thành công (ví dụ: 'Linh thạch, pháp bảo')." },
        risk: { type: Type.STRING, description: "Rủi ro chính nếu thất bại hoặc trong quá trình thực hiện (ví dụ: 'Gặp yêu thú, cạm bẫy')." },
        successChance: { type: Type.NUMBER, description: "Tỷ lệ thành công (0-100), dựa trên cấp độ và trang bị của người chơi so với độ khó của nhiệm vụ." },
        durationInMinutes: { type: Type.NUMBER, description: "Thời gian ước tính để hoàn thành (tính bằng phút). Ví dụ: khám phá nhỏ 15 phút, vào bí cảnh 240 phút (4 giờ)." }
    },
    required: ["title", "benefit", "risk", "successChance", "durationInMinutes"]
};

const storyWorldKnowledgeSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất cho mục tri thức." },
        title: { type: Type.STRING, description: "Tiêu đề của mục tri thức." },
        content: { type: Type.STRING, description: "Nội dung chi tiết của tri thức." },
        category: { type: Type.STRING, enum: ['Bang Phái', 'Lịch Sử', 'Nhân Vật', 'Khác'], description: "Phân loại tri thức." }
    },
    required: ["id", "title", "content", "category"]
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        story: { type: Type.STRING, description: "Phần tiếp theo của câu chuyện, được viết theo phong cách đã chọn." },
        choices: {
            type: Type.ARRAY,
            description: "Một mảng gồm chính xác BỐN (4) đối tượng lựa chọn, mỗi lựa chọn đại diện cho một hành động/nhiệm vụ mà người chơi có thể thực hiện. Các lựa chọn phải đa dạng và hấp dẫn.",
            items: choiceSchema
        },
        updatedStats: updatedStatsSchema,
        updatedGender: { type: Type.STRING, enum: Object.values(CharacterGender), description: "Giới tính mới của nhân vật chính nếu có sự thay đổi.", nullable: true },
        newSkills: {
            type: Type.ARRAY,
            description: "Một mảng các kỹ năng MỚI mà nhân vật đã học được hoặc ngộ ra. Bỏ qua nếu không có.",
            items: newSkillSchema,
            nullable: true,
        },
        updatedSkills: {
            type: Type.ARRAY,
            description: "Một mảng các kỹ năng đã tồn tại nhận được kinh nghiệm. Chỉ bao gồm các kỹ năng đã được sử dụng hoặc có liên quan.",
            items: {
                type: Type.OBJECT,
                properties: {
                    skillName: { type: Type.STRING, description: "Tên chính xác của kỹ năng đã được sử dụng." },
                    gainedExperience: { type: Type.NUMBER, description: "Lượng kinh nghiệm kỹ năng nhận được." }
                },
                required: ["skillName", "gainedExperience"]
            },
            nullable: true,
        },
        newLocations: {
            type: Type.ARRAY,
            description: "Các địa điểm mới được khám phá trong lượt này. Chỉ bao gồm nếu có.",
            items: locationSchema,
            nullable: true,
        },
        updatedLocations: {
            type: Type.ARRAY,
            description: "Các địa điểm đã tồn tại nhưng có sự thay đổi (ví dụ: thay đổi chủ sở hữu, thêm luật lệ, bị phá hủy). Chỉ bao gồm nếu có.",
            items: locationSchema,
            nullable: true,
        },
        updatedPlayerLocationId: {
            type: Type.STRING,
            description: "ID của địa điểm mới của người chơi nếu họ đã di chuyển. Cung cấp giá trị null nếu người chơi di chuyển vào không gian hỗn độn.",
            nullable: true,
        },
        newNPCs: {
            type: Type.ARRAY,
            description: "Các NPC mới mà người chơi gặp trong lượt này. Chỉ bao gồm nếu có.",
            items: newNpcSchema,
            nullable: true,
        },
        updatedNPCs: {
            type: Type.ARRAY,
            description: "Các NPC đã tồn tại có sự thay đổi (kinh nghiệm, quan hệ, ký ức...). Chỉ bao gồm nếu có.",
            items: updatedNpcSchema,
            nullable: true,
        },
        newItems: {
            type: Type.ARRAY,
            description: "Vật phẩm mới nhận được.",
            items: itemSchema,
            nullable: true,
        },
        updatedItems: {
            type: Type.ARRAY,
            description: "Cập nhật số lượng vật phẩm đã có. Tìm vật phẩm theo tên và ghi đè số lượng.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Tên chính xác của vật phẩm cần cập nhật." },
                    quantity: { type: Type.NUMBER, description: "Số lượng mới của vật phẩm." },
                },
                required: ["name", "quantity"],
            },
            nullable: true,
        },
        removedItemIds: {
            type: Type.ARRAY,
            description: "ID của các vật phẩm bị xóa hoàn toàn khỏi túi đồ.",
            items: { type: Type.STRING },
            nullable: true,
        },
        newWorldKnowledge: {
            type: Type.ARRAY,
            description: "Các tri thức mới được khám phá trong lượt này (ví dụ: một Bang Phái mới). Chỉ bao gồm nếu có.",
            items: storyWorldKnowledgeSchema,
            nullable: true,
        },
    },
    required: ["story", "choices"]
};

const generateContent = async (
    systemInstruction: string,
    prompt: string,
    apiKey: string
): Promise<StoryApiResponse> => {
    log('geminiService.ts', `Generating content... Prompt (start): ${prompt.substring(0, 150)}...`, 'API');
    try {
        const finalApiKey = getFinalApiKey(apiKey);
        const ai = new GoogleGenAI({ apiKey: finalApiKey });
        const model = 'gemini-2.5-flash';

        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        log('geminiService.ts', 'Content generation successful.', 'API');

        return {
            storyResponse: data as StoryResponse,
            usageMetadata: response.usageMetadata ? {
                totalTokenCount: response.usageMetadata.totalTokenCount,
                promptTokenCount: response.usageMetadata.promptTokenCount,
                candidatesTokenCount: response.usageMetadata.candidatesTokenCount,
            } : undefined,
        };
    } catch (e) {
        log('geminiService.ts', `Content generation failed: ${(e as Error).message}`, 'ERROR');
        console.error("Failed to parse JSON response:", e);
        throw new Error("Lỗi phân tích phản hồi từ AI. Phản hồi không phải là một JSON hợp lệ.");
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

    const systemInstruction = getSystemInstruction(
        isMature,
        perspective,
        characterProfile.gender,
        characterProfile.race,
        characterProfile.powerSystem,
        worldSettings
    );

    const prompt = buildPrompt(historyText, actionText, characterProfile, worldSettings, npcs);
    return generateContent(systemInstruction, prompt, apiKey);
};


export const getInitialStory = async (
    characterProfile: CharacterProfile,
    worldSettings: WorldSettings,
    isMature: boolean,
    perspective: NarrativePerspective,
    apiKey: string,
): Promise<StoryApiResponse> => {
    const systemInstruction = getSystemInstruction(
        isMature,
        perspective,
        characterProfile.gender,
        characterProfile.race,
        characterProfile.powerSystem,
        worldSettings
    );

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
Sau đó, cung cấp chính xác BỐN (4) lựa chọn hành động đầu tiên cho người chơi theo định dạng đã được chỉ định trong schema.
`;

    return generateContent(systemInstruction, initialPrompt, apiKey);
};

export const generateNewSkillDescription = async (
    skill: Skill,
    newQuality: string,
    worldSettings: WorldSettings,
    apiKey: string
): Promise<{ description: string; effect: string }> => {
    log('geminiService.ts', `Generating new skill description for ${skill.name} -> ${newQuality}`, 'API');
    try {
        const finalApiKey = getFinalApiKey(apiKey);
        const ai = new GoogleGenAI({ apiKey: finalApiKey });
        const model = 'gemini-2.5-flash';

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

        const schema = {
            type: Type.OBJECT,
            properties: {
                description: { type: Type.STRING, description: "Mô tả mới, hoành tráng hơn cho kỹ năng." },
                effect: { type: Type.STRING, description: "Hiệu ứng mới, mạnh mẽ hơn cho kỹ năng." }
            },
            required: ["description", "effect"]
        };

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        log('geminiService.ts', 'Skill description generation successful.', 'API');
        return result;
    } catch(err) {
        log('geminiService.ts', `Skill description generation failed: ${(err as Error).message}`, 'ERROR');
        throw err;
    }
};
