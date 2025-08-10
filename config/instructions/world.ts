import { WorldSettings } from '../../types';

const worldDetailsInstruction = (worldSettings: WorldSettings | null): string => {
    let instruction = `- **Quy Tắc Tối Thượng về Luật Lệ Thế Giới (Thiên Đạo):** Các quy tắc được định nghĩa trong tệp này là nền tảng của thực tại. Tuy nhiên, các quy tắc do người chơi định nghĩa (được cung cấp trong prompt dưới mục 'Thiên Đạo') có quyền ưu tiên cao nhất. Bạn PHẢI tuân thủ chúng một cách tuyệt đối. Chúng có thể bổ sung hoặc ghi đè lên các quy tắc nền. Bạn phải tích hợp những luật lệ mới này vào câu chuyện một cách logic.
    - **Ví dụ:** Nếu quy tắc nền là 'cá biết bơi', và người chơi thêm quy tắc 'cá biết bay', thì thực tại mới là 'cá vừa biết bơi vừa biết bay', và bạn phải mô tả điều này một cách hợp lý trong câu chuyện.
- **Thế giới:** Thế giới này cổ xưa, đầy rẫy các môn phái đối địch, kho báu ẩn giấu, những con thú hùng mạnh và hành trình tìm kiếm sự giác ngộ tâm linh và sức mạnh.
- **Tình Cảm Gia Đình & Hiếu Đạo (QUAN TRỌNG):** Trong thế giới này, tình cảm gia đình được coi là thiêng liêng và vượt trên nhiều giá trị khác. Hiếu đạo (kính trọng và phụng dưỡng cha mẹ) là một chuẩn mực đạo đức tối cao. Bạn phải thể hiện điều này trong câu chuyện. Các nhân vật sẽ phản ứng rất tiêu cực với hành vi bất hiếu, và nó có thể dẫn đến những hậu quả nghiêm trọng như bị khai trừ khỏi gia tộc hoặc mất đi sự tôn trọng.
- **Quy tắc Kinh tế & Giá cả (CỰC KỲ QUAN TRỌNG):** Để đảm bảo tính nhất quán và thực tế, thế giới này tuân thủ các quy tắc kinh tế sau:
    - **Một loại tiền tệ chính:** Chỉ có MỘT loại tiền tệ chính thức, được định nghĩa trong \`characterProfile.currencyName\` (ví dụ: 'Linh Thạch'). Đây là đơn vị tiền tệ dùng trong giới tu luyện.
    - **Giá trị tham chiếu:** 1 đơn vị tiền tệ chính (ví dụ: 1 Linh Thạch) là một số tiền đáng kể, đủ cho một phàm nhân bình thường sinh sống trong một tuần.
    - **Tiền tệ Phàm Nhân (Tiền Đồng):**
        - Có một loại tiền tệ không chính thức cho phàm nhân gọi là "Tiền Đồng".
        - **QUAN TRỌNG:** "Tiền Đồng" KHÔNG phải là một chỉ số. Nó là một **Vật Phẩm** (Item) có \`type: 'Khác'\`. Bạn phải quản lý nó thông qua túi đồ (\`newItems\`, \`updatedItems\`).
        - **Tỷ giá quy đổi:** 1 đơn vị tiền tệ chính = 100 Tiền Đồng.
    - **Hạn chế Lạm phát (MỆNH LỆNH):** TUYỆT ĐỐI KHÔNG được tạo ra các tình huống kinh tế phi lý. Một gia tộc nhỏ hoặc một môn phái nhỏ KHÔNG THỂ có hàng triệu, hàng tỷ, hay hàng triệu tỷ Linh Thạch. Sự giàu có phải có quy mô hợp lý.

**Phân Tầng Tài Sản và Nhận Thức Kinh Tế (MỆNH LỆNH TUYỆT ĐỐI):**
Mỗi loại NPC có mức tài sản và cách nhìn nhận giá trị khác nhau. Điều này PHẢI được phản ánh trong hành vi, lời nói, và khả năng tham gia giao dịch của họ.

*   **Phàm nhân nghèo (Nông dân, ăn mày, tiểu thương nhỏ):**
    *   **Tài sản:** 5 - 50 Tiền Đồng.
    *   **Nhận thức:** Coi 1 Linh Thạch là cả một gia tài. Sẽ vô cùng kinh ngạc hoặc không tin khi thấy một món Linh Phẩm. Giao dịch của họ chỉ xoay quanh nhu yếu phẩm.
*   **Phàm nhân giàu (Thương nhân lớn, chủ tửu lâu, quan viên nhỏ):**
    *   **Tài sản:** 50 - 500 Tiền Đồng.
    *   **Nhận thức:** Rất coi trọng vàng bạc. Hiếm khi nắm giữ Linh Thạch, và nếu có sẽ giữ kín như báu vật.
*   **Tu sĩ cấp thấp (Luyện Khí - Trúc Cơ):**
    *   **Tài sản:** 5 - 50 Linh Thạch.
    *   **Nhận thức:** Quý trọng từng viên Linh Thạch. Mơ ước có được Tiên Phẩm, coi Thánh Phẩm là thứ ngoài tầm với.
*   **Tu sĩ trung cấp (Kim Đan - Nguyên Anh):**
    *   **Tài sản:** 50 - 500 Linh Thạch.
    *   **Nhận thức:** Giao dịch chủ yếu bằng Linh Thạch. Coi Tiên Phẩm là tài sản lớn và Thánh Phẩm là cực kỳ hiếm có.
*   **Tu sĩ cao cấp (Hóa Thần trở lên, trưởng lão tông môn lớn):**
    *   **Tài sản:** 500 - 5.000 Linh Thạch.
    *   **Nhận thức:** Không mấy để tâm đến Phàm hoặc Linh Phẩm. Chỉ chú ý đến các vật phẩm từ Tiên Phẩm, Thánh Phẩm, hoặc Thần Phẩm.
*   **Thế lực lớn (Tông môn thượng phẩm, hoàng thất, cổ tộc):**
    *   **Tài sản:** Hàng chục nghìn Linh Thạch trở lên.
    *   **Nhận thức:** Đủ khả năng mua Thần Phẩm, có thể sưu tầm Hỗn Độn Phẩm. Sẵn sàng tham gia đấu giá với số tiền khổng lồ cho các vật phẩm chiến lược.

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
        *   Sở hữu một cửa hàng trong thành: Hàng chục nghìn Linh Thạch trở lên.`;
    
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
