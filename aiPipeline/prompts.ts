
import { CharacterProfile, WorldSettings, NPC, Location, Skill, StoryResponse, Milestone, GameEvent, NewNPCFromAI } from '../types';
import { buildContextForPrompt } from './promptUtils';
import { GAME_CONFIG } from '../config/gameConfig';

export const buildWorldGenPrompt = (storyIdea: string, openingScene: string): string => {
    const { npcs, locations, items, monsters, skills, knowledge, powerSystems } = GAME_CONFIG.worldGen.autoFill;
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

2.  **Bối cảnh Chi tiết (\`context\`):**
    *   Dựa trên chủ đề và thể loại, hãy viết một đoạn văn **chi tiết, sống động và có chiều sâu** cho trường \`context\`.
    *   **Độ dài (QUAN TRỌNG):** Đoạn văn này PHẢI có độ dài khoảng **300 TỪ**.
    *   **Nội dung:** Mô tả bối cảnh chính của thế giới, các sự kiện lịch sử quan trọng đã định hình nó, các xung đột lớn đang diễn ra, và không khí chung của thế giới (ví dụ: đen tối, hy vọng, hỗn loạn). Đây là phần quan trọng nhất để thiết lập "tone" cho câu chuyện.

3.  **Hệ Thống Sức Mạnh (\`powerSystems\`):**
    *   Thiết kế ít nhất ${powerSystems} hệ thống sức mạnh.
    *   **Tên Hệ Thống:** Tên phải bao quát và cụ thể (ví dụ: 'Tiên Đạo Tu Luyện', 'Ma Đạo Tu Luyện').
    *   **Cảnh Giới:** Mỗi hệ thống **BẮT BUỘC** phải có chính xác MƯỜI (10) cảnh giới, được phân cách bằng ' - '. Cảnh giới đầu tiên **PHẢI** là \`Phàm Nhân\`. Ví dụ: \`Phàm Nhân - Luyện Khí - Trúc Cơ - ...\`.

4.  **Phẩm chất & Tư chất (\`qualityTiers\`, \`aptitudeTiers\`):**
    *   **MỆNH LỆNH VỀ DẤU PHÂN CÁCH:** Các bậc trong mỗi chuỗi **TUYỆT ĐỐI BẮT BUỘC** phải được phân cách bằng dấu gạch ngang có dấu cách ở hai bên (' - '). Việc sử dụng dấu phẩy hoặc các dấu khác là một lỗi hệ thống.
    *   **Nội dung:** Tạo ra một danh sách các bậc phẩm chất (cho vật phẩm/kỹ năng) và tư chất (cho nhân vật) phong phú, phù hợp với bối cảnh tu tiên. Thứ tự phải từ thấp đến cao. Ví dụ: \`Phổ Thông - Hiếm - Sử Thi - Truyền Thuyết - Thần Thoại - Thần Khí\`.

5.  **Nhân vật chính (\`characterProfile\`):**
    *   Tạo ra một nhân vật chính có tiểu sử, tính cách và mục tiêu phù hợp.
    *   **Chủng tộc (\`race\`):** Tên Chủng tộc phải ngắn gọn và mang tính thần thoại phương Đông (ví dụ: Nhân Tộc, Long Tộc, Ma Tộc).
    *   **Cấp độ khởi đầu (\`level\`):** Gán cho nhân vật một cấp độ khởi đầu từ 1 đến 5.
    *   **Kỹ năng khởi đầu (\`skills\`):** Nhân vật chính PHẢI bắt đầu với ít nhất ${skills} kỹ năng đa dạng. Mỗi kỹ năng PHẢI có một giá trị \`manaCost\` hợp lý.

6.  **Yếu tố ban đầu (\`initialNpcs\`, \`initialLocations\`, \`initialItems\`, \`initialMonsters\`):**
    *   **NPC Khởi đầu (QUAN TRỌNG):** Tạo ít nhất ${npcs} NPC có vai trò quan trọng và phù hợp. **BẮT BUỘC** phải bao gồm: một sư phụ hoặc trưởng bối, một đối thủ, và một nhân vật bí ẩn. Giới tính có thể linh hoạt.
    *   **Chủng tộc NPC:** Khi tạo NPC thuộc chủng tộc người, BẮT BUỘC sử dụng "Nhân Tộc" hoặc "Nhân Loại", TUYỆT ĐỐI KHÔNG sử dụng "Con người".
    *   **Quan hệ NPC ban đầu:** Tạo một vài mối quan hệ ban đầu giữa các NPC trong trường \`npcRelationships\`.
    *   **Sinh Vật Khởi Đầu (\`initialMonsters\`):** Tạo ít nhất ${monsters} loại sinh vật hoặc yêu thú phù hợp.
        *   **QUY TẮC ĐẶT TÊN SINH VẬT (MỆNH LỆNH TUYỆT ĐỐI):**
        *   Mỗi sinh vật PHẢI có một tên NGẮN GỌN, CỤ THỂ và ĐỘC NHẤT. Trường \`name\` là để chứa MỘT tên, không phải một danh sách.
        *   **VÍ DỤ:**
            *   \`"name": "Huyết Lang"\` -> **ĐÚNG**
            *   \`"name": "Ma Dơi"\` -> **ĐÚNG**
            *   \`"name": "Xà Tinh Địa Long Xà Hổ Mang Bạch Hổ..."\` -> **SAI (LỖI NGHIÊM TRỌNG - SẼ PHÁ HỎNG GAME!)**
    *   **Địa điểm Khởi đầu:**
        *   Tạo ít nhất ${locations} địa điểm khởi đầu đa dạng.
        *   **Bắt buộc:** PHẢI có một địa điểm gốc loại 'THẾ GIỚI' có \`parentId\` là \`null\`.
        *   **Thế Lực (Bang Phái):** Tạo ít nhất MỘT (1) địa điểm loại 'THẾ LỰC'.
        *   **Quy tắc Đặt tên (Rất Quan trọng):** Tuân thủ cấu trúc '[Tên Riêng] [Loại Địa Điểm]'. Ví dụ: 'Long Thần Thành' (ĐÚNG), không phải 'Thành Long Thần' (SAI). 'Vô Cực Tông' (ĐÚNG), không phải 'Tông Môn Vô Cực' (SAI).
        *   **Đồng bộ Tri Thức:** Với MỖI địa điểm loại 'THẾ LỰC', bạn PHẢI tạo một mục 'initialKnowledge' tương ứng với 'category' là 'Bang Phái'.
        *   **Phân bổ Tọa độ:** Phân bổ tọa độ (\`coordinates\`) trên bản đồ 1000x1000 một cách hợp lý, tránh chồng chéo.
        *   **QUAN TRỌNG VỀ DỮ LIỆU:** Đối với mỗi địa điểm, trường \`rules\` PHẢI là một mảng (có thể rỗng \`[]\`), TUYỆT ĐỐI KHÔNG được là \`null\`. Trường \`isDestroyed\` mặc định phải là \`false\` nếu không bị phá hủy, không được là \`null\`.
    *   **Trang bị khởi đầu (\`initialItems\`):** BẮT BUỘC phải tạo ít nhất ${items} vật phẩm khởi đầu phù hợp, bao gồm một vũ khí.
        *   **BẮT BUỘC:** Đối với vật phẩm có \`type\` là 'Trang Bị' hoặc 'Đặc Thù', bạn PHẢI cung cấp đầy đủ đối tượng \`equipmentDetails\`. Trường \`value\` PHẢI là một con số (có thể là 0 nếu vô giá), TUYỆT ĐỐI KHÔNG được là \`null\`. Nếu một vật phẩm không có hiệu ứng (\`effectsDescription\`), hãy **BỎ QUA HOÀN TOÀN** trường đó, không đặt là \`null\`.
        *   **QUY TẮC CHỈ SỐ (CỰC KỲ QUAN TRỌNG):** Các chỉ số trong \`stats.key\` CHỈ ĐƯỢỢC PHÉP là: \`'attack'\`, \`'maxHealth'\`, \`'maxMana'\`.
        *   **QUY TẮC PHÂN LOẠI VŨ KHÍ (CỰC KỲ QUAN TRỌNG):** Đối với bất kỳ vật phẩm nào là vũ khí (ví dụ: kiếm, đao, thương, cung, roi, trượng, búa, v.v.), trường \`equipmentDetails.type\` **BẮT BUỘC** phải được đặt là \`'Vũ Khí'\`. Việc phân loại sai (ví dụ: đặt roi là 'Phụ Kiện') là một lỗi logic hệ thống nghiêm trọng.
        *   **LOGIC QUAN TRỌNG:** Giá trị chỉ số (\`stats.value\`) của trang bị PHẢI tương xứng với phẩm chất (\`quality\`).

7.  **Tri Thức Thế Giới (\`initialKnowledge\`) - Cốt lõi:**
    *   Tạo ra ít nhất ${knowledge} mục tri thức phong phú để giải thích các khái niệm của thế giới.
    *   **Bắt buộc** phải có các mục tri thức RIÊNG BIỆT cho:
        *   Chủng tộc (\`race\`) của nhân vật chính. Mục tri thức này phải mô tả về nguồn gốc, đặc điểm và vị thế của chủng tộc đó trong thế giới.
        *   Thể Chất Đặc Biệt (\`specialConstitution\`) của nhân vật chính.
        *   Thiên Phú (\`talent\`) của nhân vật chính.
        *   Loại Tiền Tệ (\`currencyName\`).
    *   **QUY TẮC ĐỊNH DẠNG TIÊU ĐỀ (MỆNH LỆNH TUYỆT ĐỐI):**
        *   Trường \`title\` của mỗi mục tri thức **CHỈ** được chứa **TÊN GỌI** của khái niệm đó.
        *   **TUYỆT ĐỐI KHÔNG** được thêm bất kỳ dấu câu (như dấu hai chấm \`:\`) hoặc mô tả ngắn nào vào trường \`title\`.
        *   **VÍ DỤ:**
            *   \`"title": "Long Phượng Thể"\` -> **ĐÚNG**
            *   \`"title": "Chủng Tộc: Ma Tộc"\` -> **SAI** (Phải là \`"title": "Ma Tộc"\`)
            *   \`"title": "Long Phượng Thể: Bí Ẩn Song Sinh"\` -> **SAI** (Phần mô tả phải nằm trong trường \`content\`)
    *   **QUY TẮC PHÂN LOẠI TRI THỨC (MỆNH LỆNH TUYỆT ĐỐI):**
        *   Bạn PHẢI gán một \`category\` chính xác cho mỗi mục tri thức. Các loại hợp lệ là: \`'Bang Phái'\`, \`'Lịch Sử'\`, \`'Nhân Vật'\`, \`'Khác'\`.
        *   \`'Bang Phái'\`: Chỉ sử dụng cho các tổ chức, tông môn, thế lực.
        *   \`'Nhân Vật'\`: Chỉ sử dụng cho các khái niệm liên quan trực tiếp đến nhân vật như Chủng tộc, Thể chất, Thiên phú.
        *   \`'Lịch Sử'\`: Sử dụng cho các sự kiện lịch sử, truyền thuyết, nguồn gốc thế giới.
        *   \`'Khác'\`: Sử dụng cho các khái niệm còn lại như Tiền tệ, các quy tắc đặc biệt.
        *   Việc gán sai \`category\` là một lỗi logic nghiêm trọng.

8.  **Kết Nối Sâu (MỆNH LỆNH SÁNG TẠO):**
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
        milestones,
        discoveredMonsters,
        activeEvents,
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

    const milestonesContext = (milestones && milestones.length > 0) ? `
**Sổ Ký Ức (Các sự kiện lớn đã kết thúc vĩnh viễn - KHÔNG THỂ THAY ĐỔI):**
${milestones.map(m => `- Lượt ${m.turnNumber}: ${m.summary}`).join('\n')}
` : '';

    const discoveredMonstersContext = (discoveredMonsters && discoveredMonsters.length > 0) ? `
**Các Sinh Vật Đã Biết (Bách khoa toàn thư):**
\`\`\`json
${JSON.stringify(discoveredMonsters.map(m => m.name), null, 2)}
\`\`\`
` : '';

    const activeEventsContext = (activeEvents && activeEvents.length > 0) ? `
**Sự Kiện/Nhiệm Vụ Đang Diễn Ra (TRÍ NHỚ DÀI HẠN - BỐI CẢNH CHÍNH YẾU):**
\`\`\`json
${JSON.stringify(activeEvents, null, 2)}
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

${activeEventsContext}

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

${milestonesContext}

**Lịch sử câu chuyện:**
${historyText}

**Hành động và Kết quả Lượt Này:**
${actionText}
-QUY TẮC CHO LƯỢT NÀY (CỰC KỲ QUAN TRỌNG):
KHÔNG TÓM TẮT LỊCH SỬ. Tuyệt đối không mở đầu bằng "Trước đó", "Tóm tắt", "Như đã kể", "Ở lượt trước", hay các biến thể tương tự.
CHỈ viết tiếp nội dung mới phát sinh từ hành động ở lượt này và bối cảnh hiện tại.
Nếu cần chuyển cảnh, dùng tối đa 1 câu chuyển mạch không chứa chi tiết từ lịch sử.

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

export const buildNpcSkillsGenPrompt = (
    npc: NewNPCFromAI,
    worldSettings: WorldSettings
): string => {
    return `
Dựa trên thông tin chi tiết về một NPC, hãy tạo ra một bộ kỹ năng khởi đầu phù hợp cho họ.

**Thông tin NPC:**
- **Tên:** ${npc.name}
- **Chủng tộc:** ${npc.race}
- **Tính cách:** ${npc.personality || 'Chưa rõ.'}
- **Mô tả/Tiểu sử:** ${npc.description || 'Chưa rõ.'}
- **Ngoại hình:** ${npc.ngoaiHinh || 'Chưa rõ.'}
- **Cấp độ:** ${npc.level}
- **Hệ thống tu luyện:** ${npc.powerSystem}

**Thông tin Thế giới:**
- **Phẩm chất có thể có:** ${worldSettings.qualityTiers}
- **Các loại kỹ năng:** Công Kích, Phòng Ngự, Thân Pháp, Tu Luyện, Hỗ Trợ, Đặc Biệt.

**YÊU CẦU TUYỆT ĐỐI (LỖI HỆ THỐNG SẼ XẢY RA NẾU VI PHẠM):**
1.  **Số lượng:** Tạo ra từ 3 đến 6 kỹ năng.
2.  **ĐỘC NHẤT LOẠI KỸ NĂNG:** Mỗi kỹ năng trong bộ kỹ năng được tạo ra **PHẢI** có một \`type\` (loại kỹ năng) **DUY NHẤT**. **TUYỆT ĐỐI KHÔNG** được tạo ra hai kỹ năng cùng loại (ví dụ: hai kỹ năng 'Công Kích').
3.  **PHÙ HỢP LOGIC:** Các kỹ năng được tạo ra phải hoàn toàn phù hợp với bối cảnh, vai trò, và sức mạnh của NPC. Phẩm chất của kỹ năng phải tương xứng với cấp độ của NPC.
4.  **PHẢI CÓ KỸ NĂNG TU LUYỆN:** Mọi NPC là tu tiên giả PHẢI có một kỹ năng loại 'Tu Luyện'.
5.  **TIÊU HAO LINH LỰC (\`manaCost\`):** Đối với mỗi kỹ năng được tạo ra, bạn PHẢI cung cấp một giá trị \`manaCost\`. Phẩm chất càng cao, cấp độ càng cao thì \`manaCost\` càng lớn. Kỹ năng 'Công Kích' và 'Đặc Biệt' thường tốn nhiều linh lực nhất.
6.  **ĐỊNH DẠNG ĐẦU RA:** Trả về một MẢNG (ARRAY) JSON duy nhất chứa các đối tượng kỹ năng, tuân thủ nghiêm ngặt schema đã cung cấp.
`;
};