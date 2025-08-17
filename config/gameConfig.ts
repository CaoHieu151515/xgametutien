import { ItemType } from '../types';

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
        // Mảng định nghĩa tên và số lượng các cảnh giới phụ trong một đại cảnh giới.
        // Ví dụ: ['Sơ Kỳ', 'Trung Kỳ', 'Hậu Kỳ', 'Viên Mãn']
        subRealmNames: ['Nhất', 'Nhị', 'Tam', 'Tứ', 'Ngũ', 'Lục', 'Thất', 'Bát', 'Cửu', 'Viên Mãn'],
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
            lifespanBonuses: [0, 50000, 100000, 200000, 500000, 1000000, 5000000, 10000000, 25000000, 50000000, 100000000],
        }
    },

    /**
     * Cấu hình liên quan đến cơ chế gameplay.
     */
    gameplay: {
        time: {
            // Số phút trong game tương ứng với 1 lượt khi tua nhanh
            minutesPerTurn: 480, // 8 giờ
        },
        // Cấu hình cho các hành động mặc định của người chơi
        actions: {
            custom: {
                defaultSuccessChance: 100,
                defaultDurationMinutes: 10,
            },
            travel: {
                defaultDurationMinutes: 30,
            }
        }
    },
    
    /**
     * Cấu hình liên quan đến giao diện người dùng.
     */
    ui: {
        // Số lượt tối đa có thể quay lại trong Nhật Ký
        maxRewindableTurns: 10,
        // Thời gian (ms) để một thông báo (toast) tự động đóng lại.
        toastDismissTimeMs: 5000,
    },
    
    /**
     * Cấu hình liên quan đến các Nhân vật không phải người chơi (NPC).
     */
    npc: {
        // Cấp độ tối đa mà một NPC có thể đạt được, bất kể hệ thống tu luyện của họ.
        maxNpcLevel: 100,
        // Các giá trị Mị Lực mặc định khi tạo NPC mới.
        defaultMienLuc: { 
            body: 10, 
            face: 10, 
            aura: 10, 
            power: 5 
        },
        // Các ngưỡng và tên gọi cho mức độ quan hệ. Sắp xếp từ cao đến thấp.
        relationshipTiers: [
            { threshold: Infinity, text: 'Tri Kỷ', color: 'text-pink-400' },
            { threshold: 999, text: 'Tin Tưởng Tuyệt Đối', color: 'text-pink-300' },
            { threshold: 500, text: 'Tin tưởng', color: 'text-emerald-400' },
            { threshold: 300, text: 'Cảm Mến', color: 'text-emerald-300' },
            { threshold: 100, text: 'Thân Thiện', color: 'text-green-300' },
            { threshold: -99, text: 'Trung Lập', color: 'text-slate-400' },
            { threshold: -299, text: 'Lạnh Nhạt', color: 'text-sky-400' },
            { threshold: -599, text: 'Chán Ghét', color: 'text-yellow-500' },
            { threshold: -999, text: 'Căm Hận', color: 'text-red-400' },
            { threshold: -Infinity, text: 'Kẻ Thù', color: 'text-red-500' },
        ]
    },

    /**
     * Cấu hình liên quan đến hệ thống kinh tế và giá trị vật phẩm.
     */
    economy: {
        /**
         * Định nghĩa giá trị "sàn" cho mỗi loại vật phẩm.
         * Đây là giá của một vật phẩm loại đó ở phẩm chất thấp nhất.
         */
        baseValueByType: {
            [ItemType.TRANG_BI]: 50,
            [ItemType.BI_KIP]: 40,
            [ItemType.DUOC_PHAM]: 15,
            [ItemType.DAC_THU]: 25,
            [ItemType.NGUYEN_LIEU]: 5,
            [ItemType.KHAC]: 1,
        },

        /**
         * HỆ SỐ NHÂN THEO PHẨM CHẤT.
         * Mảng này chứa các hệ số nhân tương ứng với vị trí (index) của phẩm chất
         * trong chuỗi `worldSettings.qualityTiers`.
         */
        valueMultiplierByQuality: [
            1.0,     // Bậc 1 (index 0)
            5.0,     // Bậc 2 (index 1)
            25.0,    // Bậc 3 (index 2)
            125.0,   // Bậc 4 (index 3)
            625.0,   // Bậc 5 (index 4)
            3125.0   // Bậc 6 (index 5)
        ],

        /**
         * Hệ số nhân tăng trưởng cho các bậc phẩm chất vượt ra ngoài
         * phạm vi được định nghĩa sẵn trong 'valueMultiplierByQuality'.
         * Mỗi bậc "thừa" sẽ được tính bằng cách lấy giá trị của bậc cao nhất
         * nhân với (hệ số này ^ số bậc chênh lệch).
         */
        qualityMultiplierGrowthFactor: 5.0,
        /**
         * Giá dịch vụ cơ bản (để tham khảo, chưa dùng trong code)
         */
        servicePrices: {
            innStay_normal: 10, // Tiền Đồng
            innStay_cultivator: 1, // Linh Thạch
            meal_simple: 2, // Tiền Đồng
            meal_lavish: 15, // Tiền Đồng
        }
    }
};