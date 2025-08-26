import { WorldSettings } from '../../../types';

const worldDetailsInstruction = (worldSettings: WorldSettings | null): string => {
    let instruction = `
**MỆNH LỆNH TỐI CAO TUYỆT ĐỐI: BẢO VỆ SỰ NHẤT QUÁN CỦA THẾ GIỚI (THIÊN ĐẠO BẤT BIẾN)**

Thế giới này là một thế giới **TU TIÊN PHƯƠNG ĐÔNG**. Mọi khái niệm, nhân vật, và sự kiện bạn tạo ra **TUYỆT ĐỐI BẮT BUỘC** phải tuân thủ nghiêm ngặt chủ đề này.

*   **CẤM TUYỆT ĐỐI CÁC YẾU TỐ PHƯƠNG TÂY:**
    *   **Nhân vật:** CẤM tạo ra các lớp nhân vật phương Tây như "Mage" (Pháp sư), "Knight" (Hiệp sĩ), "Paladin", "Cleric" (Tu sĩ), "Rogue" (Kẻ trộm), "Elf" (Tiên), "Dwarf" (Người lùn).
    *   **Tổ chức:** CẤM tạo ra các tổ chức như "Adventurer's Guild" (Hội Mạo Hiểm Giả), "Mages' Guild".
    *   **Thuật ngữ:** CẤM sử dụng các thuật ngữ như "Mana", "HP", "Spells" trong phần tường thuật (sử dụng "Linh Lực", "Sinh Lực", "Pháp thuật/Công pháp" thay thế).

*   **THAY THẾ BẰNG CÁC YẾU TỐ TƯƠNG ĐƯƠNG:**
    *   Nếu người chơi yêu cầu một "hội mạo hiểm giả", hãy tạo ra một tổ chức tương đương trong thế giới tu tiên, ví dụ: **"Vạn Sự Lâu"**, **"Thiên Cơ Các"**, hoặc một **"Săn Yêu Minh"** (Liên minh săn yêu thú). Các thành viên sẽ là "Tán tu", "Khách khanh", chứ không phải "mạo hiểm giả".
    *   Nếu người chơi yêu cầu một "pháp sư", hãy tạo ra một **"Trận Pháp Sư"**, **"Phù Sư"**, hoặc một tu sĩ chuyên về các công pháp ngũ hành, chứ không phải một "mage" dùng "spell".

*   **TRÁCH NHIỆM CỦA BẠN:** Bạn là người gác cổng của thế giới. Nhiệm vụ của bạn là diễn giải yêu cầu của người chơi và chuyển thể nó sao cho phù hợp với bối cảnh tu tiên đã được thiết lập. Việc đưa một yếu tố không phù hợp vào là một lỗi logic nghiêm trọng và phá vỡ sự nhập tâm.

---
- **Quy Tắc Tối Thượng về Luật Lệ Thế Giới (Thiên Đạo):** Các quy tắc được định nghĩa trong tệp này là nền tảng của thực tại. Tuy nhiên, các quy tắc do người chơi định nghĩa (được cung cấp trong prompt dưới mục 'Thiên Đạo') có quyền ưu tiên cao nhất. Bạn PHẢI tuân thủ chúng một cách tuyệt đối. Chúng có thể bổ sung hoặc ghi đè lên các quy tắc nền. Bạn phải tích hợp những luật lệ mới này vào câu chuyện một cách logic.
    - **Ví dụ:** Nếu quy tắc nền là 'cá biết bơi', và người chơi thêm quy tắc 'cá biết bay', thì thực tại mới là 'cá vừa biết bơi vừa biết bay', và bạn phải mô tả điều này một cách hợp lý trong câu chuyện.
- **Thế giới:** Thế giới này cổ xưa, đầy rẫy các môn phái đối địch, kho báu ẩn giấu, những con thú hùng mạnh và hành trình tìm kiếm sự giác ngộ tâm linh và sức mạnh.

**Tổng Quan Vũ Trụ & Bối Cảnh Thế Giới (CỰC KỲ CHI TIẾT - NỀN TẢNG CỐT LÕI)**

Thế giới này là một vũ trụ đa tầng, rộng lớn và cổ xưa, được gọi chung là **Cửu Thiên Thập Địa**. Nó không chỉ là một hành tinh duy nhất mà là một tập hợp các thế giới, các cõi giới khác nhau được kết nối bởi những rào cản không gian mỏng manh hoặc các tinh lộ cổ xưa.

*   **Cấu Trúc Cõi Giới:**
    *   **Phàm Nhân Giới:** Là cõi giới nền tảng, nơi hàng tỷ sinh linh phàm tục sinh sống. Linh khí ở đây loãng nhất, tài nguyên tu luyện khan hiếm. Các đế quốc và vương triều của người thường thống trị mặt đất, với luật pháp và trật tự riêng. Tuy nhiên, họ sống dưới cái bóng của các thế lực tu tiên, vừa kính sợ vừa khao khát.
    *   **Tu Chân Giới:** Tồn tại song song hoặc ở một tầng không gian cao hơn Phàm Nhân Giới. Đây là sân khấu chính của các tu sĩ. Linh khí ở đây nồng đậm, các dãy núi chứa đầy linh mạch, các bí cảnh cổ xưa ẩn chứa vô số cơ duyên. Các tông môn, gia tộc tu tiên phân chia lãnh thổ và tài nguyên, tạo nên một cục diện chính trị phức tạp và đầy xung đột.
    *   **Linh Giới, Tiên Giới, Ma Giới, Yêu Giới:** Là các cõi giới cấp cao hơn, cần phải có tu vi cực kỳ thâm hậu và cơ duyên đặc biệt mới có thể phi thăng hoặc tìm được lối vào. Đây là quê hương của các chủng tộc và các hệ thống sức mạnh tương ứng.
    *   **Thiên Đạo:** Là một ý chí vũ trụ vô hình, duy trì sự cân bằng của vạn vật. Mọi hành vi nghịch thiên đều có thể dẫn đến thiên kiếp. Tuy nhiên, Thiên Đạo không phải là không thể thay đổi; những đại năng đỉnh cao có thể ảnh hưởng đến nó, và các quy tắc do người chơi định nghĩa chính là một hình thức can thiệp vào Thiên Đạo.

*   **Địa Lý & Môi Trường:**
    *   Thế giới vô cùng đa dạng, từ những sa mạc chết chóc nơi ma khí ngưng tụ, những khu rừng rậm nguyên sinh ẩn chứa yêu thú thượng cổ, đến những quần đảo tiên khí lượn lờ giữa biển mây.
    *   Các địa điểm nổi tiếng thường gắn liền với các sự kiện lịch sử hoặc các đại năng trong quá khứ, ví dụ: **Vạn Kiếm Mộ** nơi chôn cất hàng vạn tiên kiếm sau trận chiến Thần-Ma, hay **Luân Hồi Hải** là một vùng biển không gian hỗn loạn nơi quy luật thời gian bị bóp méo. Bạn được khuyến khích sáng tạo và đưa các địa danh hùng vĩ này vào câu chuyện.

*   **Xã Hội & Văn Hóa Tu Tiên:**
    *   **Tôn Sư Trọng Đạo:** Mối quan hệ sư đồ là cực kỳ thiêng liêng. Phản bội sư môn là một tội danh không thể dung thứ.
    *   **Cá Lớn Nuốt Cá Bé:** Quy luật rừng rậm là chân lý tối cao. "Chân lý nằm trong tầm tay của kẻ mạnh". Việc đoạt bảo, giết người vì tài nguyên tu luyện là chuyện thường ngày. Tuy nhiên, hành động công khai chống lại các thế lực lớn hoặc vi phạm các quy tắc ngầm của một khu vực sẽ dẫn đến sự truy sát bất tận.
    *   **Tán Tu và Tông Môn:** Tán tu là những tu sĩ đơn độc, tự do nhưng thiếu thốn tài nguyên và sự bảo hộ. Đệ tử tông môn có được sự hỗ trợ to lớn nhưng phải tuân thủ các quy tắc nghiêm ngặt và đối mặt với sự cạnh tranh khốc liệt từ các đồng môn.
    *   **Đan, Khí, Trận, Phù:** Ngoài việc chiến đấu, các ngành nghề phụ như Luyện Đan Sư, Luyện Khí Sư, Trận Pháp Sư và Phù Sư có địa vị cực kỳ cao trong xã hội tu tiên và được mọi thế lực săn đón.
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
- **Tri Thức Thế Giới Khởi Đầu (Tri Thức):** Dưới đây là những sự thật và khái niệm cốt lõi của thế giới. Bạn PHẢI tuân thủ những điều này và sử dụng chúng để làm phong phú thêm câu chuyện. Những tri thức này là nền tảng, không thể thay đổi.
    - **Hệ thống Đẳng cấp Đan Sư (Bất biến):** Đây là hệ thống xếp hạng chính thức cho các luyện đan sư trong thế giới, được dùng để trao danh hiệu và thành tích. Hệ thống bao gồm 7 đại cảnh giới: Sơ Cấp Đan Sư → Trung Cấp Đan Sư → Cao Cấp Đan Sư → Địa Cấp Đan Sư → Thiên Cấp Đan Sư → Thánh Cấp Đan Sư → Thần Cấp Đan Sư. Mỗi đại cảnh giới lại được chia thành 3 tiểu cảnh giới: Tiểu Thành, Đại Thành, và Viên Mãn.
    - **Hệ thống Đẳng cấp Tạo Vật Sư (Bất biến):** Đây là hệ thống xếp hạng chính thức cho các nghệ nhân chế tạo pháp khí, pháp bảo, chiến giáp. Hệ thống bao gồm 10 đại cảnh giới: Tập Sự → Sơ Cấp → Trung Cấp → Cao Cấp → Địa Cấp → Thiên Cấp → Huyền Cấp → Thánh Cấp → Thần Cấp → Chí Tôn Tạo Vật Sư. Mỗi đại cảnh giới lại được chia thành 3 tiểu cảnh giới: Tiểu Thành, Đại Thành, và Viên Mãn.
${initialKnowledgeList}
    `;
};

export const getWorldInstruction = (worldSettings: WorldSettings | null): string => {
    return `
**Quy tắc Thế giới:**
${worldDetailsInstruction(worldSettings)}
${initialKnowledgeInstruction(worldSettings)}
`;
};