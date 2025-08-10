
import { WorldSettings } from '../../types';

const worldDetailsInstruction = (worldSettings: WorldSettings | null): string => {
    let instruction = `- **Thế giới:** Thế giới này cổ xưa, đầy rẫy các môn phái đối địch, kho báu ẩn giấu, những con thú hùng mạnh và hành trình tìm kiếm sự giác ngộ tâm linh và sức mạnh.
- **Tình Cảm Gia Đình & Hiếu Đạo (QUAN TRỌNG):** Trong thế giới này, tình cảm gia đình được coi là thiêng liêng và vượt trên nhiều giá trị khác. Hiếu đạo (kính trọng và phụng dưỡng cha mẹ) là một chuẩn mực đạo đức tối cao. Bạn phải thể hiện điều này trong câu chuyện. Các nhân vật sẽ phản ứng rất tiêu cực với hành vi bất hiếu, và nó có thể dẫn đến những hậu quả nghiêm trọng như bị khai trừ khỏi gia tộc hoặc mất đi sự tôn trọng.
- **Quy tắc Kinh tế & Giá cả (CỰC KỲ QUAN TRỌNG):** Để đảm bảo tính nhất quán và thực tế, thế giới này tuân thủ các quy tắc kinh tế sau:
    - **Một loại tiền tệ chính:** Chỉ có MỘT loại tiền tệ chính thức, được định nghĩa trong \`characterProfile.currencyName\` (ví dụ: 'Linh Thạch'). Đây là đơn vị tiền tệ dùng trong giới tu luyện.
    - **Giá trị tham chiếu:** 1 đơn vị tiền tệ chính (ví dụ: 1 Linh Thạch) là một số tiền đáng kể, đủ cho một phàm nhân bình thường sinh sống trong một tuần.
    - **Tiền tệ Phàm Nhân (Tiền Đồng):**
        - Có một loại tiền tệ không chính thức cho phàm nhân gọi là "Tiền Đồng".
        - **QUAN TRỌNG:** "Tiền Đồng" KHÔNG phải là một chỉ số. Nó là một **Vật Phẩm** (Item) có \`type: 'Khác'\`. Bạn phải quản lý nó thông qua túi đồ (\`newItems\`, \`updatedItems\`).
        - **Tỷ giá quy đổi:** 1 đơn vị tiền tệ chính = 100 Tiền Đồng.
    - **Hạn chế Lạm phát (MỆNH LỆNH):** TUYỆT ĐỐI KHÔNG được tạo ra các tình huống kinh tế phi lý. Một gia tộc nhỏ hoặc một môn phái nhỏ KHÔNG THỂ có hàng triệu, hàng tỷ, hay hàng triệu tỷ Linh Thạch. Sự giàu có phải có quy mô hợp lý:
        - Một gia đình phàm nhân có thể có vài chục Tiền Đồng.
        - Một gia tộc tu luyện nhỏ có thể có vài trăm đến vài nghìn Linh Thạch.
        - Chỉ những thế lực CỰC LỚN hoặc các kho báu cổ đại mới có thể chứa hàng triệu Linh Thạch.

**Phân Bổ Tài Sản Hợp Lý (MỆNH LỆNH TUYỆT ĐỐI):**
- **Tài sản của Nhân vật Quần chúng:** Một nhân vật quần chúng như ăn mày, nông dân, tiểu thương TUYỆT ĐỐI KHÔNG được sở hữu Linh Thạch, trừ khi có một lý do cốt truyện cực kỳ đặc biệt (ví dụ: cao nhân ẩn thế) và phải được giải thích rõ. Tài sản của họ chỉ nên giới hạn ở một lượng nhỏ Tiền Đồng.
- **Tài sản của Thế lực:** Tài sản và khả năng chi tiêu của các thế lực phải tương xứng với quy mô của họ.
    - Một gia tộc nhỏ hoặc tông môn cấp thấp KHÔNG THỂ có sẵn hàng tỷ Linh Thạch. Việc chi tiêu những khoản tiền lớn (vài nghìn Linh Thạch trở lên) phải được mô tả là một quyết định trọng đại, có thể làm lung lay nền tảng kinh tế của họ.
    - Để có được số tiền lớn, họ phải trải qua quá trình thu thập, tích lũy cực khổ, chứ không phải có sẵn ngay lập tức.

**Ví dụ về Mức giá Tham khảo:**
Bạn PHẢI sử dụng các mức giá sau làm cơ sở để định giá mọi thứ trong thế giới một cách hợp lý.

*   **Mức Phàm Nhân (chủ yếu dùng Tiền Đồng):**
    *   Một bữa ăn đơn giản: 2-3 Tiền Đồng.
    *   Một bữa ăn thịnh soạn tại tửu lâu: 10-15 Tiền Đồng.
    *   Một đêm tại phòng trọ bình dân: 10 Tiền Đồng.
    *   Một bộ quần áo vải thô: 20-30 Tiền Đồng.
    *   Một con ngựa tốt: 80-100 Tiền Đồng (gần bằng 1 Linh Thạch).

*   **Mức Tu Luyện (chủ yếu dùng Linh Thạch):**
    *   **Chỗ ở:**
        *   Một đêm tại phòng trọ cao cấp (có linh khí loãng): 1-2 Linh Thạch.
        *   Thuê một động phủ tu luyện cấp thấp trong 1 tháng: 20-50 Linh Thạch.
    *   **Bí Kíp Công Pháp (Phẩm chất Phàm Phẩm):**
        *   Công pháp tu luyện cơ bản nhất: 10-50 Linh Thạch. (Đây là một tài sản lớn, có thể là cả gia tài của một gia đình nhỏ).
        *   Kỹ năng chiến đấu cấp thấp: 5-20 Linh Thạch.
    *   **Đan Dược (Thuốc):**
        *   Hồi phục đan cấp thấp (hồi phục chút ít linh lực/sinh lực): 1-3 Linh Thạch mỗi viên.
        *   Tụ Khí Đan (tăng tốc độ tu luyện Luyện Khí): 5-10 Linh Thạch mỗi viên.
    *   **Pháp Bảo (Trang bị & Vũ khí):**
        *   Vũ khí Phàm Phẩm hạ cấp: 5-15 Linh Thạch.
        *   Vũ khí Phàm Phẩm thượng cấp: 20-50 Linh Thạch.
    *   **Bất Động Sản (Nhà cửa & Động phủ):**
        *   Một căn nhà nhỏ trong thành trì của người tu luyện: Vài trăm đến vài nghìn Linh Thạch.
        *   Sở hữu một động phủ tu luyện cấp thấp (có linh mạch nhỏ): Vài nghìn đến hàng chục nghìn Linh Thạch.
        *   Sở hữu một cửa hàng trong thành: Hàng chục nghìn Linh Thạch trở lên.

**Nhận thức của NPC về Giá trị (QUAN TRỌNG):**
-   NPC PHẢI nhận thức được giá trị của tiền tệ và sự chênh lệch giàu nghèo.
    -   Một phàm nhân sẽ coi 1 Linh Thạch là một gia tài khổng lồ và sẽ có phản ứng kinh ngạc hoặc kính nể.
    -   Một tu sĩ Trúc Cơ có thể coi 10 Linh Thạch là một khoản tiền đáng kể.
    -   Một trưởng lão Kim Đan sẽ không để tâm đến vài chục Linh Thạch, nhưng sẽ quan tâm đến các giao dịch hàng nghìn Linh Thạch.
-   Lời thoại và hành động của NPC khi giao dịch PHẢI phản ánh điều này. Một chủ cửa hàng sẽ vui vẻ khi nhận được một khoản tiền lớn và có thể trở nên khó chịu nếu người chơi mặc cả quá đáng cho một món đồ rẻ tiền.`;
    
    if (worldSettings) {
         let detailsAdded = false;
         let detailsSection = "\n\nDưới đây là các chi tiết cụ thể hơn do người chơi cung cấp:\n";
        if (worldSettings.theme) {
            detailsSection += `    - **Chủ đề chính:** ${worldSettings.theme}\n`;
            detailsAdded = true;
        }
        if (worldSettings.genre) {
            detailsSection += `    - **Thể loại:** ${worldSettings.genre}\n`;
            detailsAdded = true;
        }
        if (worldSettings.context) {
            detailsSection += `    - **Bối cảnh chi tiết:** ${worldSettings.context}\n`;
            detailsAdded = true;
        }
        if(detailsAdded) {
            instruction += detailsSection;
        }
    }
    
    return instruction.trim();
};

const initialKnowledgeInstruction = (worldSettings: WorldSettings | null): string => {
    const initialKnowledgeList = worldSettings?.initialKnowledge && worldSettings.initialKnowledge.length > 0
        ? worldSettings.initialKnowledge.map(k => `    - **${k.title.trim()}:** ${k.content.trim()}`).join('\n')
        : '    - Không có tri thức khởi đầu nào được định nghĩa.';
    
    return `
- **Tri Thức Thế Giới Khởi Đầu (Lore):** Dưới đây là những sự thật và khái niệm cốt lõi của thế giới. Bạn PHẢI tuân thủ những điều này và sử dụng chúng để làm phong phú thêm câu chuyện. Những tri thức này là nền tảng, không thể thay đổi.
${initialKnowledgeList}
    `;
};

export const getWorldInstruction = (worldSettings: WorldSettings | null): string => {
    return `
**Quy tắc Thế giới:**
${worldDetailsInstruction(worldSettings)}
${initialKnowledgeInstruction(worldSettings)}
`;
}
