import { CharacterGender, SkillType, LocationType, ItemType, EquipmentType } from '../types';
import { Type } from '@google/genai';

export const statusEffectSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên của trạng thái (ví dụ: 'Trúng Độc', 'Tăng Sức Mạnh')." },
        description: { type: Type.STRING, description: "Mô tả ngắn gọn về ảnh hưởng của trạng thái." },
        duration: { type: Type.STRING, description: "Thời hạn của trạng thái. BẮT BUỘC phải là chuỗi 'Vĩnh viễn' hoặc một chuỗi theo định dạng 'X lượt' (ví dụ: '3 lượt', '270 lượt'). TUYỆT ĐỐI KHÔNG sử dụng các định dạng khác." }
    },
    required: ["name", "description", "duration"]
};

export const achievementSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên của thành tích hoặc danh hiệu (ví dụ: 'Đan Sư', 'Kẻ Diệt Rồng')." },
        description: { type: Type.STRING, description: "Mô tả về thành tích và các lợi ích (nếu có)." },
        tier: { type: Type.STRING, description: "Cấp bậc của thành tích nếu có thể nâng cấp (ví dụ: 'Sơ cấp', 'Trung cấp')." }
    },
    required: ["name", "description"]
};

export const updatedStatsSchema = {
    type: Type.OBJECT,
    description: "Một đối tượng tùy chọn chứa các chỉ số của nhân vật đã được cập nhật. Chỉ bao gồm các chỉ số đã thay đổi. Hệ thống sẽ tự xử lý việc lên cấp, bạn chỉ cần cung cấp điểm kinh nghiệm nhận được.",
    properties: {
        health: { type: Type.NUMBER, description: "Sinh lực hiện tại của nhân vật (ví dụ: sau khi chịu sát thương)." },
        mana: { type: Type.NUMBER, description: "Linh lực/Năng lượng hiện tại của nhân vật (ví dụ: sau khi dùng phép)." },
        currencyAmount: { type: Type.NUMBER, description: "Số lượng tiền tệ hiện tại của nhân vật." },
        gainedExperience: { type: Type.NUMBER, description: "Điểm kinh nghiệm nhân vật NHẬN ĐƯỢỢC từ hành động này (không phải tổng kinh nghiệm). Hệ thống sẽ tự cộng dồn." },
        breakthroughToRealm: { type: Type.STRING, description: "Tên cảnh giới MỚI mà nhân vật đột phá đến (ví dụ: 'Kim Đan Viên Mãn'). Hệ thống sẽ tự tính toán và cộng dồn toàn bộ kinh nghiệm cần thiết để đạt được cảnh giới này. Bỏ qua gainedExperience khi dùng trường này." },
        newStatusEffects: {
            type: Type.ARRAY,
            description: "Một mảng các trạng thái mới được thêm cho nhân vật do sự kiện trong truyện. Bỏ qua nếu không có.",
            items: statusEffectSchema,
        },
        removedStatusEffects: {
            type: Type.ARRAY,
            description: "Một mảng tên các trạng thái cần được xóa bỏ khỏi nhân vật (do hết hạn hoặc bị giải trừ). Bỏ qua nếu không có.",
            items: { type: Type.STRING },
        },
        newAchievements: {
            type: Type.ARRAY,
            description: "Một mảng các thành tích hoặc danh hiệu vĩnh viễn MỚI mà nhân vật đạt được. Bỏ qua nếu không có.",
            items: achievementSchema,
        },
        updatedAchievements: {
            type: Type.ARRAY,
            description: "Một mảng để cập nhật các thành tích đã có (ví dụ: nâng cấp 'Đan Sư Sơ Cấp' lên 'Đan Sư Trung Cấp'). Cung cấp tên và các trường cần thay đổi.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Tên chính xác của thành tích cần cập nhật." },
                    description: { type: Type.STRING, description: "Mô tả mới." },
                    tier: { type: Type.STRING, description: "Cấp bậc mới." }
                },
                required: ["name"]
            },
        }
    },
};

export const newSkillSchema = {
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

export const equipmentStatSchema = {
    type: Type.OBJECT,
    properties: {
        key: { type: Type.STRING, description: "Mã chỉ số. CHỈ SỬ DỤNG: 'attack', 'maxHealth', hoặc 'maxMana'.", enum: ['attack', 'maxHealth', 'maxMana'] },
        value: { type: Type.NUMBER, description: "Giá trị cộng thêm." }
    },
    required: ["key", "value"]
};

export const equipmentDetailsSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: Object.values(EquipmentType), description: "Loại trang bị." },
        stats: { type: Type.ARRAY, items: equipmentStatSchema, description: "Các chỉ số mà trang bị này cộng thêm." },
        effect: { type: Type.STRING, description: "Mô tả hiệu ứng đặc biệt của trang bị." }
    },
    required: ["type", "stats"]
};

export const itemSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất cho vật phẩm." },
        name: { type: Type.STRING, description: "Tên vật phẩm." },
        description: { type: Type.STRING, description: "Mô tả vật phẩm." },
        type: { type: Type.STRING, enum: Object.values(ItemType), description: "Loại vật phẩm." },
        quality: { type: Type.STRING, description: "Phẩm chất của vật phẩm, dựa trên worldSettings.qualityTiers." },
        quantity: { type: Type.NUMBER, description: "Số lượng vật phẩm." },
        value: { type: Type.NUMBER, description: "Giá trị tham khảo của vật phẩm bằng tiền tệ trong game." },
        equipmentDetails: { ...equipmentDetailsSchema, description: "Chi tiết nếu vật phẩm là một trang bị." },
        effectsDescription: { type: Type.STRING, description: "Mô tả hiệu ứng cụ thể của vật phẩm nếu nó là 'Dược Phẩm'. Ví dụ: 'Hồi phục 500 sinh lực', 'Tăng 10% tấn công trong 3 lượt', 'Gây trúng độc, giảm 100 sinh lực mỗi lượt trong 5 lượt.'" }
    },
    required: ["id", "name", "description", "type", "quality", "quantity"]
};

export const locationSchema = {
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
        },
        ownerId: {
            type: Type.STRING,
            description: "ID của nhân vật sở hữu địa điểm. Dùng giá trị 'player' nếu người chơi là chủ sở hữu. Null nếu không có chủ.",
        },
        rules: {
            type: Type.ARRAY,
            description: "Một mảng các chuỗi mô tả luật lệ hoặc đặc tính vật lý/siêu nhiên của địa điểm này (ví dụ: 'Không thể bay trong thành', 'Linh khí ở đây dày đặc gấp đôi').",
            items: { type: Type.STRING },
        },
        isDestroyed: {
            type: Type.BOOLEAN,
            description: "Đặt thành true nếu địa điểm này (và tất cả các địa điểm con của nó) đã bị phá hủy. Không thể di chuyển đến địa điểm đã bị phá hủy.",
        },
    },
    required: ["id", "name", "description", "type", "coordinates", "rules"]
};

export const mienLucSchema = {
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

export const npcRelationshipSchema = {
    type: Type.OBJECT,
    description: "Mô tả mối quan hệ giữa một NPC với một NPC khác.",
    properties: {
        targetNpcId: { type: Type.STRING, description: "ID của NPC mục tiêu." },
        value: { type: Type.NUMBER, description: "Giá trị quan hệ, từ -1000 (kẻ thù) đến 1000 (tri kỷ)." },
        relationshipType: { type: Type.STRING, description: "Loại mối quan hệ cụ thể (ví dụ: 'Phụ thân', 'Mẫu thân', 'Sư phụ', 'Nô lệ', 'Đạo lữ')." }
    },
    required: ["targetNpcId", "value"]
};

export const specialConstitutionSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên thể chất đặc biệt." },
        description: { type: Type.STRING, description: "Mô tả chi tiết về thể chất." },
    },
    required: ["name", "description"],
};

export const talentSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên thiên phú." },
        description: { type: Type.STRING, description: "Mô tả chi tiết về thiên phú." },
    },
    required: ["name", "description"],
};

export const newNpcSchema = {
    type: Type.OBJECT,
    description: "Mô tả một Nhân Vật Phụ (NPC) trong thế giới.",
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất cho NPC." },
        name: { type: Type.STRING, description: "Tên của NPC." },
        aliases: { type: Type.STRING, description: "Các biệt danh hoặc tên gọi khác của NPC." },
        gender: { type: Type.STRING, enum: Object.values(CharacterGender), description: "Giới tính của NPC." },
        race: { type: Type.STRING, description: "Chủng tộc của NPC." },
        personality: { type: Type.STRING, description: "Mô tả tính cách của NPC." },
        description: { type: Type.STRING, description: "Mô tả ngoại hình và tiểu sử của NPC." },
        ngoaiHinh: { type: Type.STRING, description: "Mô tả chi tiết ngoại hình của NPC, bao gồm khuôn mặt, mái tóc, vóc dáng, trang phục. Trường này là BẮT BUỘC." },
        avatarUrl: { type: Type.STRING, description: "URL ảnh đại diện cho NPC (tùy chọn)." },
        level: { type: Type.NUMBER, description: "Cấp độ khởi đầu của NPC." },
        powerSystem: { type: Type.STRING, description: "Tên hệ thống tu luyện NPC theo." },
        aptitude: { type: Type.STRING, description: "Tên tư chất của NPC." },
        mienLuc: { ...mienLucSchema, description: "Thang điểm vẻ đẹp (Mị Lực) của NPC." },
        locationId: { type: Type.STRING, description: "ID của địa điểm nơi NPC sinh sống ban đầu." },
        specialConstitution: { ...specialConstitutionSchema, description: "Thể chất đặc biệt của NPC (nếu có)." },
        innateTalent: { ...talentSchema, description: "Thiên phú bẩm sinh của NPC (nếu có)." },
        statusEffects: { type: Type.ARRAY, items: statusEffectSchema, description: "Các trạng thái ban đầu của NPC." },
        npcRelationships: { type: Type.ARRAY, items: npcRelationshipSchema, description: "Mối quan hệ ban đầu của NPC này với các NPC khác." },
        isDaoLu: { type: Type.BOOLEAN, description: "Trạng thái Đạo Lữ với người chơi (luôn là false khi khởi tạo)." }
    },
    required: ["id", "name", "gender", "race", "personality", "description", "ngoaiHinh", "level", "powerSystem", "aptitude", "mienLuc", "statusEffects"]
};

export const monsterSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất cho sinh vật." },
        name: { type: Type.STRING, description: "Tên sinh vật." },
        description: { type: Type.STRING, description: "Mô tả sinh vật." }
    },
    required: ["id", "name", "description"]
};

export const skillSchema = {
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

export const characterProfileSchema = {
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
        avatarUrl: { type: Type.STRING, description: "URL ảnh đại diện." },
        skills: { type: Type.ARRAY, items: skillSchema, description: "Các kỹ năng khởi đầu." },
        initialItems: { type: Type.ARRAY, items: itemSchema, description: "Các vật phẩm và trang bị khởi đầu. BẮT BUỘC phải có." },
        initialNpcs: { type: Type.ARRAY, items: newNpcSchema, description: "Danh sách NPC khởi đầu." },
        initialLocations: { type: Type.ARRAY, items: locationSchema, description: "Danh sách các địa điểm khởi đầu. Nhân vật sẽ bắt đầu tại địa điểm đầu tiên trong danh sách này." },
        initialMonsters: { type: Type.ARRAY, items: monsterSchema, description: "Danh sách các sinh vật/quái vật khởi đầu." },
    },
    required: ["name", "gender", "race", "powerSystem", "level", "currencyName", "currencyAmount", "personality", "backstory", "goal", "specialConstitution", "talent", "skills", "initialItems", "initialNpcs", "initialLocations", "initialMonsters"]
};

export const powerSystemDefinitionSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất cho hệ thống sức mạnh, ví dụ: 'tu_tien_1'." },
        name: { type: Type.STRING, description: "Tên hệ thống sức mạnh, ví dụ: 'Tu Tiên'." },
        realms: { type: Type.STRING, description: "Chuỗi các cảnh giới, phân cách bởi ' - ', ví dụ: 'Luyện Khí - Trúc Cơ - Kim Đan'." },
    },
    required: ["id", "name", "realms"],
};

export const worldKnowledgeSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất cho mục tri thức, ví dụ: 'lore_1'." },
        title: { type: Type.STRING, description: "Tiêu đề của mục tri thức." },
        content: { type: Type.STRING, description: "Nội dung chi tiết của tri thức." },
        category: { type: Type.STRING, enum: ['Bang Phái', 'Lịch Sử', 'Nhân Vật', 'Khác'], description: "Phân loại tri thức." }
    },
    required: ["id", "title", "content", "category"],
};

export const worldSettingsSchema = {
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

export const worldCreationSchema = {
    type: Type.OBJECT,
    properties: {
        characterProfile: characterProfileSchema,
        worldSettings: worldSettingsSchema
    },
    required: ["characterProfile", "worldSettings"]
};

export const updatedNpcSchema = {
    type: Type.OBJECT,
    description: "Các trường để cập nhật một NPC đã tồn tại. Chỉ bao gồm ID và các trường đã thay đổi.",
    properties: {
        id: { type: Type.STRING, description: "ID của NPC cần cập nhật." },
        gainedExperience: { type: Type.NUMBER, description: "Kinh nghiệm NPC nhận được. Hệ thống sẽ tự xử lý việc lên cấp." },
        breakthroughToRealm: { type: Type.STRING, description: "Tên cảnh giới MỚI mà NPC đột phá đến. Hệ thống sẽ tự tính toán và cộng dồn toàn bộ kinh nghiệm. Bỏ qua gainedExperience khi dùng trường này." },
        relationship: { type: Type.NUMBER, description: "SỰ THAY ĐỔI trong quan hệ với người chơi (ví dụ: +20, -50), không phải giá trị tuyệt đối mới." },
        newMemories: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Một mảng CHỈ chứa các ký ức MỚI mà NPC có được trong lượt này. KHÔNG gửi lại toàn bộ lịch sử ký ức." },
        health: { type: Type.NUMBER, description: "Sinh lực hiện tại của NPC." },
        mana: { type: Type.NUMBER, description: "Linh lực hiện tại của NPC." },
        gender: { type: Type.STRING, enum: Object.values(CharacterGender), description: "Giới tính mới của NPC nếu bị thay đổi bởi phép thuật hoặc sự kiện." },
        personality: { type: Type.STRING, description: "Tính cách mới của NPC nếu có sự thay đổi lớn." },
        description: { type: Type.STRING, description: "Mô tả mới của NPC nếu có sự thay đổi." },
        ngoaiHinh: { type: Type.STRING, description: "Mô tả ngoại hình mới của NPC nếu có thay đổi." },
        locationId: { type: Type.STRING, description: "ID vị trí mới của NPC." },
        aptitude: { type: Type.STRING, description: "Tư chất mới của NPC nếu bị thay đổi bởi độc dược hoặc sự kiện." },
        updatedNpcRelationships: { type: Type.ARRAY, items: npcRelationshipSchema, description: "Toàn bộ danh sách mối quan hệ MỚI của NPC này với các NPC khác." },
        isDaoLu: { type: Type.BOOLEAN, description: "Đặt thành true nếu NPC trở thành Đạo Lữ của người chơi." },
        isDead: { type: Type.BOOLEAN, description: "Đặt thành true nếu NPC đã chết." },
        newStatusEffects: { type: Type.ARRAY, items: statusEffectSchema },
        removedStatusEffects: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["id"]
};

export const choiceSchema = {
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

export const storyWorldKnowledgeSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất cho mục tri thức." },
        title: { type: Type.STRING, description: "Tiêu đề của mục tri thức." },
        content: { type: Type.STRING, description: "Nội dung chi tiết của tri thức." },
        category: { type: Type.STRING, enum: ['Bang Phái', 'Lịch Sử', 'Nhân Vật', 'Khác'], description: "Phân loại tri thức." }
    },
    required: ["id", "title", "content", "category"]
};

const fullResponseProperties = {
    story: { type: Type.STRING, description: "Phần tiếp theo của câu chuyện, được viết theo phong cách đã chọn." },
    choices: {
        type: Type.ARRAY,
        description: "Một mảng gồm chính xác BỐN (4) đối tượng lựa chọn, mỗi lựa chọn đại diện cho một hành động/nhiệm vụ mà người chơi có thể thực hiện. Các lựa chọn phải đa dạng và hấp dẫn.",
        items: choiceSchema
    },
    updatedStats: updatedStatsSchema,
    updatedGameTime: {
        type: Type.STRING,
        description: "Một chuỗi ISO 8601 cho thời gian mới trong game, chỉ sử dụng cho các bước nhảy thời gian dài hoặc không xác định (ví dụ: 'tu luyện trăm năm', 'chờ đến khi con sinh ra'). Bỏ qua trường này cho các hành động ngắn. Nếu được cung cấp, nó sẽ ghi đè 'durationInMinutes' từ lựa chọn.",
    },
    updatedGender: { type: Type.STRING, enum: Object.values(CharacterGender), description: "Giới tính mới của nhân vật chính nếu có sự thay đổi." },
    newSkills: {
        type: Type.ARRAY,
        description: "Một mảng các kỹ năng MỚI mà nhân vật đã học được hoặc ngộ ra. Bỏ qua nếu không có.",
        items: newSkillSchema,
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
    },
    newLocations: {
        type: Type.ARRAY,
        description: "Các địa điểm mới được khám phá trong lượt này. Chỉ bao gồm nếu có.",
        items: locationSchema,
    },
    updatedLocations: {
        type: Type.ARRAY,
        description: "Các địa điểm đã tồn tại nhưng có sự thay đổi (ví dụ: thay đổi chủ sở hữu, thêm luật lệ, bị phá hủy). Chỉ bao gồm nếu có.",
        items: locationSchema,
    },
    updatedPlayerLocationId: {
        type: Type.STRING,
        description: "ID của địa điểm mới của người chơi nếu họ đã di chuyển. Cung cấp giá trị null nếu người chơi di chuyển vào không gian hỗn độn.",
    },
    newNPCs: {
        type: Type.ARRAY,
        description: "Các NPC mới mà người chơi gặp trong lượt này. Chỉ bao gồm nếu có.",
        items: newNpcSchema,
    },
    updatedNPCs: {
        type: Type.ARRAY,
        description: "Các NPC đã tồn tại có sự thay đổi (kinh nghiệm, quan hệ, ký ức...). Chỉ bao gồm nếu có.",
        items: updatedNpcSchema,
    },
    newItems: {
        type: Type.ARRAY,
        description: "Vật phẩm mới nhận được.",
        items: itemSchema,
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
    },
    removedItemIds: {
        type: Type.ARRAY,
        description: "ID của các vật phẩm bị xóa hoàn toàn khỏi túi đồ.",
        items: { type: Type.STRING },
    },
    newWorldKnowledge: {
        type: Type.ARRAY,
        description: "Các tri thức mới được khám phá trong lượt này (ví dụ: một Bang Phái mới). Chỉ bao gồm nếu có.",
        items: storyWorldKnowledgeSchema,
    },
};

const stateUpdateProperties = { ...fullResponseProperties };
delete stateUpdateProperties.story;
delete stateUpdateProperties.choices;

export const responseSchema = {
    type: Type.OBJECT,
    properties: {
        ...stateUpdateProperties,
        // The full response schema for initial story generation still needs story/choices
        story: fullResponseProperties.story,
        choices: fullResponseProperties.choices,
    },
    required: ["story", "choices"]
};

export const stateUpdateSchema = {
    type: Type.OBJECT,
    properties: stateUpdateProperties,
};

export const narrativeSchema = {
    type: Type.OBJECT,
    properties: {
        story: fullResponseProperties.story,
        choices: fullResponseProperties.choices,
    },
    required: ["story", "choices"],
};


export const newSkillDescriptionSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: "Mô tả mới, hoành tráng hơn cho kỹ năng." },
        effect: { type: Type.STRING, description: "Hiệu ứng mới, mạnh mẽ hơn cho kỹ năng." }
    },
    required: ["description", "effect"]
};