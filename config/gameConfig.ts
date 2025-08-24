import { ItemType, SkillType } from '../types';

/**
 * Tệp cấu hình trung tâm cho các tham số và "biến số ma thuật" của game.
 * Việc thay đổi các giá trị ở đây sẽ ảnh hưởng đến toàn bộ logic của trò chơi.
 */
export const GAME_CONFIG = {
    /**
     * Cấu hình liên quan đến AI
     */
    ai: {
        // Số lượng lựa chọn mà AI phải tạo ra mỗi lượt.
        numberOfChoices: 4,
        // Số lần thử lại tối đa khi gọi API thất bại.
        maxRetries: 2,
        // Số lượng token tối đa mà AI có thể tạo ra trong một phản hồi.
        // Giúp ngăn chặn việc nội dung bị cắt ngắn đột ngột.
        maxOutputTokens: 8192,
        // (Chỉ dành cho Gemini) Ngân sách token cho "suy nghĩ".
        thinkingBudget: 4096,
        /**
         * Cấu hình liên quan đến phong cách và cấu trúc kể chuyện của AI.
         */
        storytelling: {
            // Số đoạn văn TỐI THIỂU mà AI phải tạo ra trong mỗi lượt 'story' thông thường.
            minParagraphs: 4,
            // Số câu TỐI THIỂU trong mỗi đoạn văn để đảm bảo độ chi tiết.
            minSentencesPerParagraph: 2,
            /**
             * Cấu hình riêng cho các cảnh nội dung người lớn.
             */
            matureContent: {
                // Số đoạn văn TỐI THIỂU cho một cảnh 18+ để đảm bảo độ chi tiết.
                minParagraphsForScene: 6,
            }
        },
    },
    
    /**
     * Cấu hình cho Thế Giới & Sự Kiện
     */
    events: {
        // Tỷ lệ (0-1) một sự kiện ngẫu nhiên xảy ra mỗi khi người chơi thực hiện một hành động tốn thời gian.
        randomEncounterChance: 0.25, // 25%

        // Trọng số cho các sự kiện ở chế độ thường (SFW - Safe For Work)
        sfwEventWeights: {
            positive: 20,     // Gặp cơ duyên, nhặt được vật phẩm.
            negative: 40,     // Bị cướp, rơi vào bẫy, gặp yêu thú.
            neutral: 25,      // Gặp một du khách, chứng kiến một sự việc.
            lore: 15,         // Nghe được một tin đồn, một bí mật.
            sexual_opportunity: 0,
            sexual_violent: 0,
            graphic_violence: 0,
        },
        // Trọng số cho các sự kiện ở chế độ 18+ (NSFW - Not Safe For Work).
        // Sẽ được kích hoạt khi người chơi bật "Nội dung người lớn" trong Cài đặt chung.
        nsfwEventWeights: {
            positive: 10,     // Giảm
            negative: 10,     // Giảm
            neutral: 10,      // Giảm
            lore: 10,          // Giảm
            sexual_opportunity: 20,  // Tăng mạnh - Cơ hội tình dục
            sexual_violent: 20,       // Tăng - Tình dục bạo lực, cạm bẫy
            graphic_violence: 20,     // Tăng - Bạo lực đồ họa chi tiết
        },
    },

    /**
     * Cấu hình liên quan đến hệ thống tiến trình của nhân vật và kỹ năng.
     */
    progression: {
        // Mảng định nghĩa tên đầy đủ của các cảnh giới phụ trong một đại cảnh giới.
        // Thứ tự trong mảng này quyết định cấp độ (index + 1).
        subRealmLevels: ['Nhất Trọng', 'Nhị Trọng', 'Tam Trọng', 'Tứ Trọng', 'Ngũ Trọng', 'Lục Trọng', 'Thất Trọng', 'Bát Trọng', 'Cửu Trọng', 'Viên Mãn'],
        // Cấu hình kinh nghiệm cho cấp độ nhân vật
        xp: {
            base: 100, // Lượng kinh nghiệm cơ bản ở cấp 1
            exponent: 1.4, // Yếu tố quyết định mức độ tăng kinh nghiệm theo cấp số nhân
            // Hệ số thưởng EXP
            levelBonusDivisor: 50, // Hệ số chia cho cấp độ để tính thưởng
            cultivationSkillBonusMultiplier: 0.1, // Hệ số nhân cho mỗi bậc phẩm chất công pháp
        },
        // Cấu hình kinh nghiệm cho cấp độ kỹ năng
        skillXp: {
            base: 100,
            exponent: 1.5,
            qualityMultiplier: 0.75, // Mức nhân thêm cho mỗi bậc phẩm chất
        },
        // Cấu hình tiêu hao linh lực cho kỹ năng
        manaCost: {
            base: 10,
            perLevel: 5,
            qualityMultiplier: 1.8, // Cost = (base + perLevel) * (qualityMultiplier ^ qualityIndex)
            typeMultiplier: {
                [SkillType.ATTACK]: 1.2,
                [SkillType.DEFENSE]: 1.0,
                [SkillType.MOVEMENT]: 0.8,
                [SkillType.CULTIVATION]: 1.5,
                [SkillType.SUPPORT]: 1.1,
                [SkillType.SPECIAL]: 2.0,
            },
        },
        npcSkillExpPerTurn: 5, // Lượng EXP kỹ năng NPC nhận được mỗi lượt khi tua nhanh thời gian
        // Cấu hình thưởng kinh nghiệm từ tư chất
        aptitude: {
            bonusPerTier: 0.15, // 15% thưởng EXP cho mỗi bậc tư chất
        },
        // Cấu hình chỉ số cơ bản khi lên cấp
        baseStats: {
            healthPerLevel: 20000,
            healthPerRealm: 150000,
            manaPerLevel: 15000,
            manaPerRealm: 100000,
            attackPerLevel: 2000,
            attackPerRealm: 10000,
            baseLifespan: 100,
            // Thưởng thọ nguyên khi đột phá đại cảnh giới
            lifespanBonuses: [0, 50000, 100000, 200000, 500000, 1000000, 5000000, 10000000, 25000000, 50000000],
        },
    },

    /**
     * Cấu hình liên quan đến gameplay
     */
    gameplay: {
        time: {
            // Số phút trong game tương ứng với 1 lượt khi tua nhanh thời gian.
            minutesPerTurn: 480, // 8 hours
        },
        actions: {
            custom: {
                defaultSuccessChance: 99,
                defaultDurationMinutes: 10,
            },
            travel: {
                defaultDurationMinutes: 30,
            }
        }
    },
    
    /**
     * Cấu hình liên quan đến Giao diện Người dùng (UI)
     */
    ui: {
        // Thời gian hiển thị của thông báo toast (ms).
        toastDismissTimeMs: 5000,
        // Số lượt tối đa có thể quay lại trong nhật ký game.
        maxRewindableTurns: 10,
    },
    
    /**
     * Cấu hình liên quan đến NPC
     */
    npc: {
        // Cấp độ tối đa mà một NPC có thể đạt được.
        maxNpcLevel: 110,
        // Cấu hình các bậc quan hệ và màu sắc hiển thị.
        // Được sắp xếp từ cao đến thấp.
        relationshipTiers: [
            { threshold: 950, text: 'Tri Kỷ', color: 'text-pink-400' },
            { threshold: 800, text: 'Thân Thiết', color: 'text-teal-400' },
            { threshold: 500, text: 'Bằng Hữu', color: 'text-green-400' },
            { threshold: 200, text: 'Thân thiện', color: 'text-lime-400' },
            { threshold: 0, text: 'Người Quen', color: 'text-slate-300' },
            { threshold: -100, text: 'Trung Lập', color: 'text-slate-400' },
            { threshold: -400, text: 'Lạnh Nhạt', color: 'text-sky-400' },
            { threshold: -700, text: 'Chán Ghét', color: 'text-yellow-400' },
            { threshold: -900, text: 'Căm Hận', color: 'text-orange-400' },
            { threshold: -1001, text: 'Kẻ Thù Không Đội Trời Chung', color: 'text-red-500' },
        ],
        // Giá trị Mị Lực mặc định cho NPC khi được tạo thủ công.
        defaultMienLuc: { body: 15, face: 15, aura: 10, power: 5 },
    },
    
    /**
     * Cấu hình liên quan đến Kinh tế trong game
     */
    economy: {
        // Giá trị cơ bản của vật phẩm theo loại.
        baseValueByType: {
            [ItemType.TRANG_BI]: 50,
            [ItemType.DUOC_PHAM]: 15,
            [ItemType.DAC_THU]: 100,
            [ItemType.BI_KIP]: 200,
            [ItemType.NGUYEN_LIEU]: 5,
            [ItemType.KHAC]: 1,
        },
        // Hệ số nhân giá trị dựa trên phẩm chất (tương ứng với qualityTiers).
        valueMultiplierByQuality: [1, 5, 25, 125, 625, 3125],
        // Hệ số tăng trưởng cho các phẩm chất cao hơn không được định nghĩa.
        qualityMultiplierGrowthFactor: 5,
    },

    /**
     * Cấu hình liên quan đến việc tạo thế giới ban đầu.
     */
    worldGen: {
         /**
         * Cấu hình AI dành riêng cho việc tạo thế giới.
         */
        ai: {
            maxOutputTokens: 16384,
            thinkingBudget: 8192,
        },
        /**
         * Các tham số cho chức năng "Để AI Điền Giúp".
         */
        autoFill: {
            // Số lượng NPC khởi đầu AI cần tạo ra.
            npcs: 3,
            // Số lượng địa điểm khởi đầu.
            locations: 5,
            // Số lượng vật phẩm/trang bị khởi đầu.
            items: 2,
            // Số lượng sinh vật/quái vật khởi đầu.
            monsters: 2,
            // Số lượng kỹ năng khởi đầu cho nhân vật.
            skills: 3,
            // Số lượng mục tri thức thế giới khởi đầu.
            knowledge: 10,
            // Số lượng hệ thống sức mạnh khởi đầu.
            powerSystems: 2,
        },
        /**
         * Các hằng số và ràng buộc cho prompt tạo thế giới.
         */
        promptConstraints: {
            // Giới hạn ký tự tối đa cho các trường tên.
            maxNameLength: 50,
            // Giới hạn ký tự tối đa cho các trường mô tả.
            maxDescriptionLength: 300,
            // Số lượng từ mục tiêu cho trường 'context' của thế giới.
            contextWordCount: 300,
            // Số lượng cảnh giới bắt buộc cho mỗi hệ thống sức mạnh.
            realmsPerPowerSystem: 10,
            // Cấp độ khởi đầu tối thiểu cho nhân vật.
            minStartLevel: 1,
            // Cấp độ khởi đầu tối đa cho nhân vật.
            maxStartLevel: 5000,
        }
    },
};