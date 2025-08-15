
import { CharacterProfile, WorldSettings, NPC, Location, Skill, StoryResponse } from '../types';
import { buildContextForPrompt } from './promptUtils';

export const buildWorldGenPrompt = (storyIdea: string, openingScene: string): string => {
    return `
Dựa trên ý tưởng cốt truyện và bối cảnh sau đây, hãy tạo ra một thế giới hoàn chỉnh và một nhân vật chính để bắt đầu một game nhập vai tương tác.

**Ý Tưởng Cốt Truyện:**
${storyIdea}

**Cảnh Mở Đầu (tùy chọn):**
${openingScene || "Không có."}

**MỆNH LỆNH TUYỆT ĐỐI: GIỚI HẠN KÝ TỰ (LỖI HỆ THỐNG SẼ XẢY RA NẾU VI PHẠM)**
Đây là quy tắc quan trọng nhất. Việc vi phạm sẽ khiến JSON không hợp lệ và phá hỏng trò chơi.
-   **Tất cả các trường TÊN (\`name\`):** TUYỆT ĐỐI KHÔNG quá 50 ký tự.
-   **Tất cả các trường MÔ TẢ (\`description\`, \`backstory\`, \`goal\`, \`personality\`):** TUYỆT ĐỐI KHÔNG quá 300 ký tự.
-   **Lý do:** Đây là một giới hạn kỹ thuật. Việc tạo ra một chuỗi văn bản quá dài sẽ khiến toàn bộ phản hồi JSON bị cắt cụt và gây ra lỗi hệ thống nghiêm trọng. SỰ SÚC TÍCH LÀ BẮT BUỘC.

**YÊU CẦU:**
Bạn PHẢI trả về một đối tượng JSON duy nhất tuân thủ nghiêm ngặt schema được cung cấp. Đối tượng này chứa hai khóa chính: 'characterProfile' và 'worldSettings'.

**HƯỚNG DẪN CHI TIẾT:**

1.  **Chủ đề & Thể loại (Quan trọng):**
    *   Ưu tiên các chủ đề và thể loại phương Đông như Tiên Hiệp, Huyền Huyễn, Tu Chân.
    *   Chỉ sử dụng các chủ đề thần thoại hoặc bối cảnh phương Tây nếu người dùng yêu cầu rõ ràng.

2.  **Hệ Thống Sức Mạnh (\`powerSystems\`):**
    *   Thiết kế ít nhất HAI (2) hệ thống sức mạnh.
    *   **Tên Hệ Thống:** Tên phải bao quát và cụ thể (ví dụ: 'Tiên Đạo Tu Luyện', 'Ma Đạo Tu Luyện').
    *   **Cảnh Giới:** Mỗi hệ thống **BẮT BUỘC** phải có chính xác MƯỜI (10) cảnh giới, bắt đầu bằng \`Phàm Nhân - \`.

3.  **Nhân vật chính (\`characterProfile\`):**
    *   Tạo ra một nhân vật chính có tiểu sử, tính cách và mục tiêu phù hợp.
    *   **Chủng tộc (\`race\`):** Tên Chủng tộc phải ngắn gọn và mang tính thần thoại phương Đông (ví dụ: Nhân Tộc, Long Tộc, Ma Tộc).
    *   **Cấp độ khởi đầu (\`level\`):** Gán cho nhân vật một cấp độ khởi đầu từ 1 đến 5.
    *   **Kỹ năng khởi đầu (\`skills\`):** Nhân vật chính PHẢI bắt đầu với ít nhất BA (3) kỹ năng đa dạng.

4.  **Yếu tố ban đầu (\`initialNpcs\`, \`initialLocations\`, \`initialItems\`, \`initialMonsters\`):**
    *   **NPC Khởi đầu (QUAN TRỌNG):** Tạo ít nhất BA (3) NPC có vai trò quan trọng và phù hợp. **BẮT BUỘC** phải bao gồm: một sư phụ hoặc trưởng bối, một đối thủ, và một nhân vật bí ẩn. Giới tính có thể linh hoạt.
    *   **Chủng tộc NPC:** Khi tạo NPC thuộc chủng tộc người, BẮT BUỘC sử dụng "Nhân Tộc" hoặc "Nhân Loại", TUYỆT ĐỐI KHÔNG sử dụng "Con người".
    *   **Quan hệ NPC ban đầu:** Tạo một vài mối quan hệ ban đầu giữa các NPC trong trường \`npcRelationships\`.
    *   **Sinh Vật Khởi Đầu (\`initialMonsters\`):** Tạo ít nhất HAI (2) loại sinh vật hoặc yêu thú phù hợp.
        *   **QUY TẮC ĐẶT TÊN SINH VẬT (MỆNH LỆNH TUYỆT ĐỐI):**
        *   Mỗi sinh vật PHẢI có một tên NGẮN GỌN, CỤ THỂ và ĐỘC NHẤT. Trường \`name\` là để chứa MỘT tên, không phải một danh sách.
        *   **VÍ DỤ:**
            *   \`"name": "Huyết Lang"\` -> **ĐÚNG**
            *   \`"name": "Ma Dơi"\` -> **ĐÚNG**
            *   \`"name": "Xà Tinh Địa Long Xà Hổ Mang Bạch Hổ..."\` -> **SAI (LỖI NGHIÊM TRỌNG - SẼ PHÁ HỎNG GAME!)**
    *   **Địa điểm Khởi đầu:**
        *   Tạo ít nhất NĂM (5) địa điểm khởi đầu đa dạng.
        *   **Bắt buộc:** PHẢI có một địa điểm gốc loại 'THẾ GIỚI' có \`parentId\` là \`null\`.
        *   **Thế Lực (Bang Phái):** Tạo ít nhất MỘT (1) địa điểm loại 'THẾ LỰC'.
        *   **Quy tắc Đặt tên (Rất Quan trọng):** Tuân thủ cấu trúc '[Tên Riêng] [Loại Địa Điểm]'. Ví dụ: 'Long Thần Thành' (ĐÚNG), không phải 'Thành Long Thần' (SAI). 'Vô Cực Tông' (ĐÚNG), không phải 'Tông Môn Vô Cực' (SAI).
        *   **Đồng bộ Tri Thức:** Với MỖI địa điểm loại 'THẾ LỰC', bạn PHẢI tạo một mục 'initialKnowledge' tương ứng với 'category' là 'Bang Phái'.
        *   **Phân bổ Tọa độ:** Phân bổ tọa độ (\`coordinates\`) trên bản đồ 1000x1000 một cách hợp lý, tránh chồng chéo.
        *   **QUAN TRỌNG VỀ DỮ LIỆU:** Đối với mỗi địa điểm, trường \`rules\` PHẢI là một mảng (có thể rỗng \`[]\`), TUYỆT ĐỐI KHÔNG được là \`null\`. Trường \`isDestroyed\` mặc định phải là \`false\` nếu không bị phá hủy, không được là \`null\`.
    *   **Trang bị khởi đầu (\`initialItems\`):** BẮT BUỘC phải tạo ít nhất HAI (2) vật phẩm khởi đầu phù hợp, bao gồm một vũ khí.
        *   **BẮT BUỘC:** Đối với vật phẩm có \`type\` là 'Trang Bị' hoặc 'Đặc Thù', bạn PHẢI cung cấp đầy đủ đối tượng \`equipmentDetails\`. Trường \`value\` PHẢI là một con số (có thể là 0 nếu vô giá), TUYỆT ĐỐI KHÔNG được là \`null\`. Nếu một vật phẩm không có hiệu ứng (\`effectsDescription\`), hãy **BỎ QUA HOÀN TOÀN** trường đó, không đặt là \`null\`.
        *   **QUY TẮC CHỈ SỐ (CỰC KỲ QUAN TRỌNG):** Các chỉ số trong \`stats.key\` CHỈ ĐƯỢỢC PHÉP là: \`'attack'\`, \`'maxHealth'\`, \`'maxMana'\`.
        *   **LOGIC QUAN TRỌNG:** Giá trị chỉ số (\`stats.value\`) của trang bị PHẢI tương xứng với phẩm chất (\`quality\`).

5.  **Tri Thức Thế Giới (\`initialKnowledge\`) - Cốt lõi:**
    *   Tạo ra các mục tri thức phong phú để giải thích các khái niệm của thế giới.
    *   **Bắt buộc** phải có các mục tri thức RIÊNG BIỆT cho:
        *   Chủng tộc (\`race\`) của nhân vật chính. Mục tri thức này phải mô tả về nguồn gốc, đặc điểm và vị thế của chủng tộc đó trong thế giới.
        *   Thể Chất Đặc Biệt (\`specialConstitution\`) của nhân vật chính.
        *   Thiên Phú (\`talent\`) của nhân vật chính.
        *   Loại Tiền Tệ (\`currencyName\`).
    *   Gán một \`category\` phù hợp cho mỗi mục tri thức.

6.  **Kết Nối Sâu (MỆNH LỆNH SÁNG TẠO):**
    *   **Nguyên tắc:** Tạo ra các liên kết có ý nghĩa giữa các yếu tố.
    *   **Liên kết Tiểu sử:** Tiểu sử (\`backstory\`) của nhân vật chính **PHẢI** liên quan trực tiếp đến ít nhất **MỘT NPC** và **MỘT Địa điểm** khởi đầu.
    *   **Liên kết NPC & Địa điểm:** Ít nhất **MỘT NPC** khởi đầu phải có vai trò hoặc mối liên kết mạnh mẽ với một địa điểm khởi đầu cụ thể.
    *   **Vật phẩm Mồi truyện:** Một trong các \`initialItems\` **PHẢI** là một vật phẩm bí ẩn, đóng vai trò là mồi cho cốt truyện (plot hook).
    *   **Mục tiêu Tích hợp:** Mục tiêu (\`goal\`) của nhân vật **PHẢI** liên quan trực tiếp đến một yếu tố trong thế giới.

Hãy bắt đầu!`;
};

export const buildUnifiedPrompt = (
    historyText: string,
    actionText: string,
    characterProfile: CharacterProfile,
    worldSettings: WorldSettings,
    npcs: NPC[]
): string => {
    const {
        contextualNpcs,
        localLocations,
        globalLocations,
        locationRules,
        minimalCharacterProfile,
        equippedItems,
        summarizedBagItems,
        optimizedWorldSettings,
        specialConstitution,
        talent,
        achievements,
        discoveredMonsters,
    } = buildContextForPrompt(characterProfile, worldSettings, npcs, historyText);

    const locationMap = new Map(characterProfile.discoveredLocations.map(loc => [loc.id, loc]));
    const currentLocation = characterProfile.currentLocationId ? locationMap.get(characterProfile.currentLocationId) : null;
    let locationContext: string;

    const voidKnowledgeTitle = "Không Gian Hỗn Độn";

    if (!currentLocation) {
        const voidKnowledge = worldSettings.initialKnowledge.find(k => k.title === voidKnowledgeTitle);
        locationContext = `
**Bối cảnh Vị trí Hiện tại:**
Nhân vật đang ở trong ${voidKnowledge?.title || 'Không Gian Hỗn Độn'}.
${voidKnowledge?.content || 'Đây là một không gian trống rỗng, vô định nằm giữa các thế giới. Nơi đây không có thời gian, không gian, chỉ có năng lượng nguyên thủy cuộn chảy.'}
`;
    } else {
        locationContext = `
**Bối cảnh Vị trí Hiện tại: ${currentLocation.name}**
${currentLocation.description}
`;
    }

    const innateAbilitiesContext = `
**Năng Lực Bẩm Sinh (Thể chất & Thiên phú):**
- **${specialConstitution.name}:** ${specialConstitution.description}
- **${talent.name}:** ${talent.description}
`;

    const achievementsContext = (achievements && achievements.length > 0) ? `
**Thành Tích Đã Đạt Được:**
\`\`\`json
${JSON.stringify(achievements.map(({ name, tier }) => ({ name, tier })), null, 2)}
\`\`\`
` : '';

    const discoveredMonstersContext = (discoveredMonsters && discoveredMonsters.length > 0) ? `
**Các Sinh Vật Đã Biết (Bách khoa toàn thư):**
\`\`\`json
${JSON.stringify(discoveredMonsters.map(m => m.name), null, 2)}
\`\`\`
` : '';

    return `
**Bối cảnh nhân vật (Tối ưu hóa):**
\`\`\`json
${JSON.stringify(minimalCharacterProfile, null, 2)}
\`\`\`

${(specialConstitution.name || talent.name) ? innateAbilitiesContext : ''}

${achievementsContext}

**Trang bị đang mặc:**
\`\`\`json
${JSON.stringify(equippedItems, null, 2)}
\`\`\`

**Vật phẩm trong túi (Tóm tắt):**
\`\`\`json
${JSON.stringify(summarizedBagItems, null, 2)}
\`\`\`

**Các NPC có liên quan trong ngữ cảnh:**
\`\`\`json
${JSON.stringify(contextualNpcs, null, 2)}
\`\`\`

**Quy luật Thế giới (Cốt lõi):**
\`\`\`json
${JSON.stringify(optimizedWorldSettings, null, 2)}
\`\`\`

${locationContext}

**Địa điểm lân cận (Chi tiết):**
\`\`\`json
${JSON.stringify(localLocations, null, 2)}
\`\`\`

**Bản đồ Thế giới (Tổng quan):**
\`\`\`json
${JSON.stringify(globalLocations, null, 2)}
\`\`\`

**Luật Lệ Địa Điểm Theo Phân Cấp (từ cụ thể đến chung):**
${locationRules || "Không có luật lệ nào tại địa điểm này."}

${discoveredMonstersContext}

**Lịch sử câu chuyện:**
${historyText}

**Hành động mới nhất của người chơi:**
${actionText}

**NHIỆM VỤ:**
Dựa trên hành động của người chơi và toàn bộ bối cảnh, hãy thực hiện ĐỒNG THỜI hai việc sau:
1.  **Tính toán Logic:** Xác định tất cả các thay đổi logic của game (chỉ số, vật phẩm, NPC, vị trí, v.v.).
2.  **Viết Câu chuyện:** Viết phần tiếp theo của câu chuyện một cách hấp dẫn, tường thuật lại hành động của người chơi và các kết quả logic đã xảy ra.
3.  **Tạo Lựa chọn:** Đưa ra BỐN (4) lựa chọn mới đa dạng và hấp dẫn.

**KẾT QUẢ:**
Trả về MỘT đối tượng JSON DUY NHẤT chứa tất cả các trường cần thiết theo schema.
`;
};


export const buildInitialStoryPrompt = (
    characterProfile: CharacterProfile,
    worldSettings: WorldSettings,
): string => {
    // Đối với lượt đi đầu tiên, chưa có NPC hay lịch sử.
    const npcs: NPC[] = []; 
    const {
        minimalCharacterProfile,
        equippedItems,
        summarizedBagItems,
        optimizedWorldSettings,
        specialConstitution,
        talent,
    } = buildContextForPrompt(characterProfile, worldSettings, npcs, "");

    const innateAbilitiesContext = `
**Năng Lực Bẩm Sinh (Thể chất & Thiên phú):**
- **${specialConstitution.name}:** ${specialConstitution.description}
- **${talent.name}:** ${talent.description}
`;

    return `
Hãy bắt đầu một câu chuyện mới cho nhân vật sau đây.

**Bối cảnh nhân vật (Tối ưu hóa):**
\`\`\`json
${JSON.stringify(minimalCharacterProfile, null, 2)}
\`\`\`

${(specialConstitution.name || talent.name) ? innateAbilitiesContext : ''}

**Trang bị đang mặc:**
\`\`\`json
${JSON.stringify(equippedItems, null, 2)}
\`\`\`

**Vật phẩm trong túi (Tóm tắt):**
\`\`\`json
${JSON.stringify(summarizedBagItems, null, 2)}
\`\`\`

**Quy luật Thế giới (Cốt lõi):**
\`\`\`json
${JSON.stringify(optimizedWorldSettings, null, 2)}
\`\`\`

Bạn PHẢI bắt đầu câu chuyện tại vị trí hiện tại của nhân vật ('currentLocationId'), được cung cấp trong Bối cảnh nhân vật. Hãy viết đoạn mở đầu thật hấp dẫn, giới thiệu nhân vật và thế giới tại địa điểm đó.
Sau đó, cung cấp chính xác BỐN (4) lựa chọn hành động đầu tiên cho người chơi theo định dạng đã được chỉ định trong schema.
`;
};

export const buildNewSkillDescriptionPrompt = (
    skill: Skill,
    newQuality: string,
    worldSettings: WorldSettings
): string => {
    return `
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
};