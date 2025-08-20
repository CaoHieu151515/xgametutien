import { Type } from '@google/genai';
import { GAME_CONFIG } from '../config/gameConfig';

export const statusEffectSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên trạng thái (vd: 'Trúng Độc')." },
        description: { type: Type.STRING, description: "Mô tả ảnh hưởng." },
        duration: { type: Type.STRING, description: "Thời hạn. Định dạng: 'Vĩnh viễn' hoặc 'X lượt' (vd: '3 lượt')." }
    },
    required: ["name", "description", "duration"]
};

export const achievementSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên thành tích." },
        description: { type: Type.STRING, description: "Mô tả thành tích." },
        tier: { type: Type.STRING, description: "Cấp bậc thành tích." }
    },
    required: ["name", "description"]
};

export const updatedStatsSchema = {
    type: Type.OBJECT,
    description: "Chỉ số nhân vật đã thay đổi. Chỉ bao gồm các trường thay đổi.",
    properties: {
        health: { type: Type.NUMBER, description: "Sinh lực hiện tại." },
        mana: { type: Type.NUMBER, description: "Linh lực hiện tại." },
        currencyAmount: { type: Type.NUMBER, description: "Tiền tệ hiện tại." },
        gainedExperience: { type: Type.NUMBER, description: "EXP nhận được trong lượt này." },
        breakthroughToRealm: { type: Type.STRING, description: "Tên cảnh giới mới đột phá đến. Hệ thống sẽ tự tính EXP." },
        newStatusEffects: {
            type: Type.ARRAY,
            description: "Mảng các trạng thái mới.",
            items: statusEffectSchema,
        },
        removedStatusEffects: {
            type: Type.ARRAY,
            description: "Mảng tên các trạng thái cần xóa.",
            items: { type: Type.STRING },
        },
        newAchievements: {
            type: Type.ARRAY,
            description: "Mảng thành tích mới.",
            items: achievementSchema,
        },
        updatedAchievements: {
            type: Type.ARRAY,
            description: "Cập nhật thành tích đã có.",
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
        name: { type: Type.STRING, description: "Tên kỹ năng mới." },
        type: { type: Type.STRING, description: "Loại kỹ năng. Ví dụ: 'Công Kích', 'Phòng Ngự',..." },
        quality: { type: Type.STRING, description: "Phẩm chất khởi đầu (vd: Phàm Phẩm)." },
        description: { type: Type.STRING, description: "Mô tả kỹ năng mới." },
        effect: { type: Type.STRING, description: "Hiệu ứng cụ thể của kỹ năng mới." }
    },
    required: ["name", "type", "quality", "description", "effect"]
};

export const equipmentStatSchema = {
    type: Type.OBJECT,
    properties: {
        key: { type: Type.STRING, description: "Chỉ số. Dùng 'attack', 'maxHealth', hoặc 'maxMana'.", },
        value: { type: Type.NUMBER, description: "Giá trị cộng thêm." }
    },
    required: ["key", "value"]
};

export const equipmentDetailsSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, description: "Loại trang bị. Ví dụ: 'Vũ Khí', 'Áo',..." },
        stats: { type: Type.ARRAY, items: equipmentStatSchema, description: "Các chỉ số cộng thêm." },
        effect: { type: Type.STRING, description: "Mô tả hiệu ứng đặc biệt." }
    },
    required: ["type", "stats"]
};

export const itemSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất." },
        name: { type: Type.STRING, description: "Tên vật phẩm." },
        description: { type: Type.STRING, description: "Mô tả vật phẩm." },
        type: { type: Type.STRING, description: "Loại vật phẩm. Ví dụ: 'Trang Bị', 'Dược Phẩm',..." },
        quality: { type: Type.STRING, description: "Phẩm chất vật phẩm." },
        quantity: { type: Type.NUMBER, description: "Số lượng." },
        value: { type: Type.NUMBER, description: "Giá trị tham khảo." },
        equipmentDetails: { ...equipmentDetailsSchema, description: "Chi tiết nếu là trang bị." },
        effectsDescription: { type: Type.STRING, description: "Mô tả hiệu ứng của Dược Phẩm (vd: 'Hồi phục 500 sinh lực')." }
    },
    required: ["id", "name", "description", "type", "quality", "quantity"]
};

export const locationSchema = {
    type: Type.OBJECT,
    description: "Một địa điểm trong game.",
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất." },
        name: { type: Type.STRING, description: "Tên địa điểm." },
        description: { type: Type.STRING, description: "Mô tả địa điểm." },
        type: { type: Type.STRING, description: "Loại địa điểm. Ví dụ: 'THÀNH TRẤN', 'BÍ CẢNH',..." },
        coordinates: {
            type: Type.OBJECT,
            description: "Tọa độ x, y trên bản đồ (0-1000).",
            properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
            },
            required: ["x", "y"]
        },
        parentId: {
            type: Type.STRING,
            description: "ID của địa điểm cha. Null nếu là địa điểm gốc.",
        },
        ownerId: {
            type: Type.STRING,
            description: "ID của chủ sở hữu. 'player' nếu là người chơi.",
        },
        rules: {
            type: Type.ARRAY,
            description: "Mảng các luật lệ của địa điểm.",
            items: { type: Type.STRING },
        },
        isDestroyed: {
            type: Type.BOOLEAN,
            description: "True nếu địa điểm bị phá hủy.",
        },
        isHaremPalace: {
            type: Type.BOOLEAN,
            description: "True nếu là Hậu Cung.",
        },
    },
    required: ["id", "name", "description", "type", "coordinates", "rules"]
};

export const mienLucSchema = {
    type: Type.OBJECT,
    description: "Thang điểm vẻ đẹp (Mị Lực) của NPC.",
    properties: {
        body: { type: Type.NUMBER, description: "Điểm vóc dáng (/25)." },
        face: { type: Type.NUMBER, description: "Điểm khuôn mặt (/30)." },
        aura: { type: Type.NUMBER, description: "Điểm khí chất (/25)." },
        power: { type: Type.NUMBER, description: "Điểm tu vi ảnh hưởng vẻ ngoài (/25)." }
    },
    required: ["body", "face", "aura", "power"]
};

export const npcRelationshipSchema = {
    type: Type.OBJECT,
    description: "Mối quan hệ giữa một NPC với NPC khác.",
    properties: {
        targetNpcId: { type: Type.STRING, description: "ID của NPC mục tiêu." },
        value: { type: Type.NUMBER, description: "Giá trị quan hệ (-1000 đến 1000)." },
        relationshipType: { type: Type.STRING, description: "Loại quan hệ (vd: 'Phụ thân', 'Sư phụ')." }
    },
    required: ["targetNpcId", "value"]
};

export const specialConstitutionSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên thể chất đặc biệt." },
        description: { type: Type.STRING, description: "Mô tả thể chất." },
    },
    required: ["name", "description"],
};

export const talentSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên thiên phú." },
        description: { type: Type.STRING, description: "Mô tả thiên phú." },
    },
    required: ["name", "description"],
};

export const newNpcSchema = {
    type: Type.OBJECT,
    description: "Mô tả một Nhân Vật Phụ (NPC).",
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất." },
        name: { type: Type.STRING, description: "Tên NPC." },
        aliases: { type: Type.STRING, description: "Biệt danh." },
        gender: { type: Type.STRING, description: "Giới tính. Dùng 'male' hoặc 'female'." },
        race: { type: Type.STRING, description: "Chủng tộc." },
        personality: { type: Type.STRING, description: "Tính cách." },
        description: { type: Type.STRING, description: "Mô tả ngoại hình và tiểu sử." },
        ngoaiHinh: { type: Type.STRING, description: "Mô tả chi tiết ngoại hình. BẮT BUỘC bao gồm: Chức vụ, đặc điểm chủng tộc (nếu có), tóc, và số đo ba vòng (cho nữ)." },
        avatarUrl: { type: Type.STRING, description: "URL ảnh đại diện (tùy chọn)." },
        level: { type: Type.NUMBER, description: "Cấp độ khởi đầu." },
        powerSystem: { type: Type.STRING, description: "Tên hệ thống tu luyện." },
        aptitude: { type: Type.STRING, description: "Tên tư chất." },
        mienLuc: { ...mienLucSchema, description: "Thang điểm vẻ đẹp (Mị Lực)." },
        locationId: { type: Type.STRING, description: "ID địa điểm ban đầu." },
        specialConstitution: { ...specialConstitutionSchema, description: "Thể chất đặc biệt (nếu có)." },
        innateTalent: { ...talentSchema, description: "Thiên phú bẩm sinh (nếu có)." },
        statusEffects: { type: Type.ARRAY, items: statusEffectSchema, description: "Trạng thái ban đầu." },
        npcRelationships: { type: Type.ARRAY, items: npcRelationshipSchema, description: "Mối quan hệ ban đầu với NPC khác." },
        isDaoLu: { type: Type.BOOLEAN, description: "Trạng thái Đạo Lữ (luôn false khi tạo)." }
    },
    required: ["id", "name", "gender", "race", "personality", "description", "ngoaiHinh", "level", "powerSystem", "aptitude", "mienLuc", "statusEffects"]
};

export const monsterSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất." },
        name: { type: Type.STRING, description: "Tên sinh vật." },
        description: { type: Type.STRING, description: "Mô tả sinh vật." }
    },
    required: ["id", "name", "description"]
};

export const skillSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất." },
        name: { type: Type.STRING, description: "Tên kỹ năng." },
        type: { type: Type.STRING, description: "Loại kỹ năng. Ví dụ: 'Công Kích', 'Phòng Ngự',..." },
        quality: { type: Type.STRING, description: "Phẩm chất khởi đầu." },
        level: { type: Type.NUMBER, description: "Cấp độ khởi đầu (thường là 1)." },
        experience: { type: Type.NUMBER, description: "Kinh nghiệm khởi đầu (thường là 0)." },
        description: { type: Type.STRING, description: "Mô tả kỹ năng." },
        effect: { type: Type.STRING, description: "Hiệu ứng kỹ năng." },
    },
    required: ["id", "name", "type", "quality", "level", "experience", "description", "effect"],
};

export const characterProfileSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên nhân vật." },
        gender: { type: Type.STRING, description: "Giới tính. Dùng 'male' hoặc 'female'." },
        race: { type: Type.STRING, description: "Chủng tộc." },
        powerSystem: { type: Type.STRING, description: "Tên hệ thống sức mạnh." },
        level: { type: Type.NUMBER, description: "Cấp độ khởi đầu (1-5)." },
        currencyName: { type: Type.STRING, description: "Tên tiền tệ." },
        currencyAmount: { type: Type.NUMBER, description: "Số tiền khởi đầu." },
        personality: { type: Type.STRING, description: "Tính cách." },
        backstory: { type: Type.STRING, description: "Tiểu sử." },
        goal: { type: Type.STRING, description: "Mục tiêu." },
        specialConstitution: specialConstitutionSchema,
        talent: talentSchema,
        avatarUrl: { type: Type.STRING, description: "URL ảnh đại diện." },
        skills: { type: Type.ARRAY, items: skillSchema, description: "Kỹ năng khởi đầu." },
        initialItems: { type: Type.ARRAY, items: itemSchema, description: "Vật phẩm/trang bị khởi đầu. BẮT BUỘC." },
        initialNpcs: { type: Type.ARRAY, items: newNpcSchema, description: "NPC khởi đầu." },
        initialLocations: { type: Type.ARRAY, items: locationSchema, description: "Địa điểm khởi đầu." },
        initialMonsters: { type: Type.ARRAY, items: monsterSchema, description: "Sinh vật/quái vật khởi đầu." },
    },
    required: ["name", "gender", "race", "powerSystem", "level", "currencyName", "currencyAmount", "personality", "backstory", "goal", "specialConstitution", "talent", "skills", "initialItems", "initialNpcs", "initialLocations", "initialMonsters"]
};

export const powerSystemDefinitionSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất." },
        name: { type: Type.STRING, description: "Tên hệ thống." },
        realms: { type: Type.STRING, description: "Chuỗi cảnh giới, phân cách bởi ' - '." },
    },
    required: ["id", "name", "realms"],
};

export const worldKnowledgeSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất." },
        title: { type: Type.STRING, description: "Tiêu đề." },
        content: { type: Type.STRING, description: "Nội dung." },
        category: { type: Type.STRING, description: "Phân loại. Dùng 'Bang Phái', 'Lịch Sử', 'Nhân Vật', 'Khác'." }
    },
    required: ["id", "title", "content", "category"],
};

export const worldSettingsSchema = {
    type: Type.OBJECT,
    properties: {
        theme: { type: Type.STRING, description: "Chủ đề thế giới." },
        genre: { type: Type.STRING, description: "Thể loại." },
        context: { type: Type.STRING, description: "Bối cảnh." },
        powerSystems: { type: Type.ARRAY, items: powerSystemDefinitionSchema, description: "Danh sách hệ thống sức mạnh." },
        qualityTiers: { type: Type.STRING, description: "Chuỗi phẩm chất, từ thấp đến cao, phân cách bởi ' - '." },
        aptitudeTiers: { type: Type.STRING, description: "Chuỗi tư chất, từ thấp đến cao, phân cách bởi ' - '." },
        initialKnowledge: { type: Type.ARRAY, items: worldKnowledgeSchema, description: "Danh sách tri thức nền (lore)." },
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
    description: "Cập nhật NPC đã tồn tại. Chỉ bao gồm ID và các trường thay đổi.",
    properties: {
        id: { type: Type.STRING, description: "ID của NPC cần cập nhật." },
        gainedExperience: { type: Type.NUMBER, description: "Kinh nghiệm nhận được." },
        breakthroughToRealm: { type: Type.STRING, description: "Tên cảnh giới mới đột phá đến." },
        relationship: { type: Type.NUMBER, description: "SỰ THAY ĐỔI trong quan hệ với người chơi (+20, -50), không phải giá trị tuyệt đối." },
        newMemories: { type: Type.ARRAY, items: { type: Type.STRING }, description: "CHỈ chứa các ký ức MỚI. KHÔNG gửi lại toàn bộ ký ức." },
        health: { type: Type.NUMBER, description: "Sinh lực hiện tại." },
        mana: { type: Type.NUMBER, description: "Linh lực hiện tại." },
        gender: { type: Type.STRING, description: "Giới tính mới. Dùng 'male' hoặc 'female'." },
        personality: { type: Type.STRING, description: "Tính cách mới." },
        description: { type: Type.STRING, description: "Mô tả mới." },
        ngoaiHinh: { type: Type.STRING, description: "Mô tả ngoại hình mới." },
        locationId: { type: Type.STRING, description: "ID vị trí mới." },
        aptitude: { type: Type.STRING, description: "Tư chất mới." },
        specialConstitution: { ...specialConstitutionSchema, description: "Thể chất đặc biệt MỚI." },
        innateTalent: { ...talentSchema, description: "Thiên phú bẩm sinh MỚI." },
        updatedNpcRelationships: { type: Type.ARRAY, items: npcRelationshipSchema, description: "Toàn bộ danh sách mối quan hệ MỚI." },
        isDaoLu: { type: Type.BOOLEAN, description: "True nếu trở thành Đạo Lữ." },
        isDead: { type: Type.BOOLEAN, description: "True nếu đã chết." },
        newStatusEffects: { type: Type.ARRAY, items: statusEffectSchema },
        removedStatusEffects: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["id"]
};

export const choiceSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Tiêu đề lựa chọn (hành động)." },
        benefit: { type: Type.STRING, description: "Lợi ích nếu thành công." },
        risk: { type: Type.STRING, description: "Rủi ro nếu thất bại." },
        successChance: { type: Type.NUMBER, description: "Tỷ lệ thành công (0-100)." },
        durationInMinutes: { type: Type.NUMBER, description: "Thời gian hoàn thành (phút)." }
    },
    required: ["title", "benefit", "risk", "successChance", "durationInMinutes"]
};

export const storyWorldKnowledgeSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất." },
        title: { type: Type.STRING, description: "Tiêu đề." },
        content: { type: Type.STRING, description: "Nội dung." },
        category: { type: Type.STRING, description: "Phân loại. Dùng 'Bang Phái', 'Lịch Sử', 'Nhân Vật', 'Khác'." }
    },
    required: ["id", "title", "content", "category"]
};

const newMonsterStorySchema = {
    type: Type.OBJECT,
    description: "Một sinh vật/quái vật MỚI. KHÔNG dùng cho nhân vật có tri giác.",
    properties: {
        name: { type: Type.STRING, description: "Tên sinh vật." },
        description: { type: Type.STRING, description: "Mô tả ngắn gọn." }
    },
    required: ["name", "description"]
};

const fullResponseProperties = {
    story: { type: Type.STRING, description: "Phần tiếp theo của câu chuyện." },
    choices: {
        type: Type.ARRAY,
        description: `Một mảng gồm chính xác ${GAME_CONFIG.ai.numberOfChoices} lựa chọn.`,
        items: choiceSchema
    },
    updatedStats: updatedStatsSchema,
    updatedGameTime: {
        type: Type.STRING,
        description: "Chuỗi ISO 8601 cho thời gian mới. Chỉ dùng cho time skip dài.",
    },
    updatedGender: { type: Type.STRING, description: "Giới tính mới của người chơi. Dùng 'male' hoặc 'female'." },
    newSkills: {
        type: Type.ARRAY,
        description: "Mảng kỹ năng MỚI.",
        items: newSkillSchema,
    },
    updatedSkills: {
        type: Type.ARRAY,
        description: "Mảng kỹ năng đã có nhận được kinh nghiệm.",
        items: {
            type: Type.OBJECT,
            properties: {
                skillName: { type: Type.STRING, description: "Tên chính xác của kỹ năng." },
                gainedExperience: { type: Type.NUMBER, description: "Lượng kinh nghiệm nhận được." }
            },
            required: ["skillName", "gainedExperience"]
        },
    },
    newLocations: {
        type: Type.ARRAY,
        description: "Địa điểm mới được khám phá.",
        items: locationSchema,
    },
    updatedLocations: {
        type: Type.ARRAY,
        description: "Địa điểm đã tồn tại có thay đổi.",
        items: locationSchema,
    },
    updatedPlayerLocationId: {
        type: Type.STRING,
        description: "ID vị trí mới của người chơi. Null nếu vào không gian hỗn độn.",
    },
    newNPCs: {
        type: Type.ARRAY,
        description: "NPC mới gặp.",
        items: newNpcSchema,
    },
    updatedNPCs: {
        type: Type.ARRAY,
        description: "NPC đã tồn tại có thay đổi.",
        items: updatedNpcSchema,
    },
    newItems: {
        type: Type.ARRAY,
        description: "Vật phẩm mới nhận được.",
        items: itemSchema,
    },
    updatedItems: {
        type: Type.ARRAY,
        description: "Cập nhật số lượng vật phẩm đã có.",
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "Tên chính xác của vật phẩm." },
                quantity: { type: Type.NUMBER, description: "Số lượng MỚI." },
            },
            required: ["name", "quantity"],
        },
    },
    removedItemIds: {
        type: Type.ARRAY,
        description: "ID của vật phẩm bị xóa.",
        items: { type: Type.STRING },
    },
    newMonsters: {
        type: Type.ARRAY,
        description: "Sinh vật/quái vật MỚI. KHÔNG dùng cho nhân vật có tri giác.",
        items: newMonsterStorySchema,
    },
    newWorldKnowledge: {
        type: Type.ARRAY,
        description: "Tri thức mới được khám phá.",
        items: storyWorldKnowledgeSchema,
    },
    newMilestone: {
        type: Type.STRING,
        description: "Tóm tắt ngắn gọn nếu một sự kiện/chương truyện kết thúc VĨNH VIỄN."
    },
};

const stateUpdateProperties = { ...fullResponseProperties };
// @ts-ignore
delete stateUpdateProperties.story;
// @ts-ignore
delete stateUpdateProperties.choices;

export const responseSchema = {
    type: Type.OBJECT,
    properties: {
        ...stateUpdateProperties,
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
        description: { type: Type.STRING, description: "Mô tả mới, hoành tráng hơn." },
        effect: { type: Type.STRING, description: "Hiệu ứng mới, mạnh mẽ hơn." }
    },
    required: ["description", "effect"]
};
