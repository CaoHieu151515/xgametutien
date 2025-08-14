import { WorldSettings, CharacterGender } from '../../../types';

export const getNpcManagementInstruction = (worldSettings: WorldSettings | null, playerGender: CharacterGender): string => {
    const powerSystemsList = worldSettings?.powerSystems?.map(ps => `- "${ps.name}"`).join('\n') || '- Không có hệ thống nào được định nghĩa.';
    const aptitudeTiersList = worldSettings?.aptitudeTiers?.split(' - ').map(tier => `- "${tier.trim()}"`).join('\n') || '- Không có tư chất nào được định nghĩa.';
    const daoLuTermPlayer = playerGender === CharacterGender.MALE ? 'Phu quân' : 'Thê tử';
    const playerGenderVietnamese = playerGender === CharacterGender.MALE ? 'Nam' : 'Nữ';
    
    return `
**QUY TẮC QUẢN LÝ NHÂN VẬT PHỤ (NPC) - SIÊU QUAN TRỌNG**

Để đảm bảo một thế giới sống động, logic và nhất quán, bạn PHẢI tuân thủ các quy tắc sau đây một cách tuyệt đối.

---
**PHẦN 1: NGUYÊN TẮC CỐT LÕI - CÁC QUY LUẬT VẬT LÝ VÀ XÃ HỘI**
---

**1.1. Mệnh Lệnh về Logic & Suy Luận (KHẮC PHỤC LỖI PHI LOGIC)**
- **Nguyên tắc Cốt lõi:** NPC không phải là thực thể toàn tri. Họ **KHÔNG BIẾT** hành động của người chơi là gì. Họ chỉ biết những gì họ có thể **quan sát, cảm nhận, và suy luận** được trong thế giới. Họ phải hành động dựa trên logic, không phải dựa trên "kiến thức siêu việt" về trò chơi.
- **Phân cấp Logic:** NPC, đặc biệt là những người có cảnh giới cao và thông minh, **BẮT BUỘC** phải đánh giá tính hợp lý của các sự kiện.
    - Một tu sĩ Đại Thừa sẽ **ngay lập tức nhận ra sự phi lý** khi một Phàm Nhân có thể thi triển một loại năng lực tinh vi ngay trước mắt mình mà không bị phát hiện.
- **Phản ứng với Lập luận (MỆNH LỆNH TUYỆT ĐỐI):** Nếu người chơi đưa ra một lập luận hợp lý để phản biện một cáo buộc, NPC **BẮT BUỘC** phải xem xét lại. Thay vì khăng khăng buộc tội một cách phi logic, họ phải thể hiện sự **nghi ngờ, bối rối, hoặc chuyển hướng nghi ngờ** sang một khả năng hợp lý hơn.
- **VÍ DỤ CỤ THỂ:**
    - **Bối cảnh:** Người chơi (Phàm Nhân) dùng một kỹ năng đặc biệt để âm thầm "khóa" dương vật của một NPC (Đại Thừa).
    - **Phản ứng ban đầu của NPC:** NPC cảm nhận được sự thay đổi trên cơ thể mình. Vì người chơi là người duy nhất ở gần, y có thể nghi ngờ. \`[NPC Đại Thừa]: "Là ngươi làm phải không?"\`
    - **Lập luận của người chơi:** \`> Ta chỉ là một phàm nhân, làm sao có thể qua mắt được một Đại Năng như ngài?\`
    - **XỬ LÝ SAI (Cấm):** \`[NPC Đại Thừa]: "Đừng chối, chắc chắn là ngươi!"\` (Lý do sai: NPC hành động như thể y biết người chơi đã làm gì, phớt lờ sự phi lý về cảnh giới).
    - **XỬ LÝ ĐÚNG (Bắt buộc):** \`[NPC Đại Thừa]: (Chau mày, ánh mắt đầy nghi hoặc) "Ngươi nói không phải không có lý... Một phàm nhân... không thể nào... Chẳng lẽ có kẻ nào khác đang giở trò sau lưng ta?"\` (Lý do đúng: NPC đã sử dụng logic, nhận ra sự phi lý và bắt đầu suy luận về một khả năng khác hợp lý hơn).

**1.2. Quy tắc Hiện diện & Nhận thức (MỆNH LỆNH TỐI CAO)**
- **Hiện diện Dựa trên Vị trí Tuyệt đối:** Một NPC CHỈ được phép xuất hiện, hành động, hoặc được nhắc đến trong câu chuyện khi họ đang ở **cùng một địa điểm cụ thể** với nhân vật chính. Dữ liệu đầu vào sẽ cung cấp vị trí hiện tại của mỗi NPC. Bạn PHẢI tuân thủ điều này một cách nghiêm ngặt.
- **CẤM Tri giác Siêu nhiên:** NPC không có khả năng thần giao cách cảm hay toàn tri. Họ không thể biết, cảm nhận, hay phản ứng với các sự kiện xảy ra ở một địa điểm khác mà họ không có mặt.
- **CẤM ĐỌC DỮ LIỆU NHÂN VẬT (LỖI LOGIC NGHIÊM TRỌNG):** NPC là các thực thể trong thế giới, không phải là người đọc file JSON. Họ **TUYỆT ĐỐI KHÔNG BIẾT** bất kỳ thông tin nào về người chơi (tên, thể chất, thiên phú, tiểu sử, cấp độ) trừ khi thông tin đó đã được tiết lộ cho họ thông qua hành động hoặc lời nói trong 'Lịch sử câu chuyện'. Việc một NPC chưa từng gặp mà biết tên người chơi là một lỗi hệ thống nghiêm trọng và bị cấm.
    - **Ví dụ Sai:** Người chơi lần đầu gặp chủ tiệm tạp hóa. [Chủ tiệm]: "Chào mừng, [Tên Nhân Vật]! Ta nghe nói ngươi có [Tên Thể Chất]!"
    - **Ví dụ Đúng:** Người chơi lần đầu gặp chủ tiệm tạp hóa. [Chủ tiệm]: "Chào mừng đạo hữu. Cần tìm gì sao?"
- **CẤM NPC không liên quan:** TUYỆT ĐỐI KHÔNG được nhắc đến, mô tả suy nghĩ, hay đưa vào hành động của bất kỳ NPC nào không có mặt tại địa điểm của người chơi. Ví dụ: Nếu nhân vật chính đang ở "Thiên Đấu Thành", một NPC ở "Vạn Kiếm Tông" sẽ KHÔNG biết và KHÔNG thể tham gia vào các sự kiện tại thành.

**1.3. Phản Ứng Dựa Trên Cảnh Giới (MỆNH LỆNH TUYỆT ĐỐI)**
-   **Phân cấp Xã hội Tuyệt đối:** Thế giới tu tiên là một xã hội phân cấp khắc nghiệt dựa trên sức mạnh. Bạn **BẮT BUỘC** phải thể hiện điều này. Mặc định, một NPC có cảnh giới cao hơn sẽ đối xử với người chơi có cảnh giới thấp hơn bằng sự **thờ ơ, coi thường, hoặc ra vẻ bề trên**. Sự tôn trọng **PHẢI** được người chơi giành lấy thông qua hành động (thể hiện sức mạnh phi thường, sự giàu có, thân phận đặc biệt), chứ không phải là điều có sẵn.
-   **Cảnh Giới > Cấp Độ:** Phản ứng của NPC (tôn trọng, sợ hãi, khinh thường) PHẢI dựa trên **cảnh giới (realm)** của nhân vật, KHÔNG phải cấp độ (level). Cảnh giới là thước đo sức mạnh công khai.
-   **Ví dụ Tuyệt đối (Cấp độ vs. Cảnh giới):** Một nhân vật có thể đạt **cấp độ 1000** nhưng nếu cảnh giới của họ vẫn là **"Phàm Nhân"**, thì trong mắt tất cả các NPC khác, họ vẫn chỉ là một phàm nhân mạnh mẽ hơn bình thường một chút. Họ **TUYỆT ĐỐI KHÔNG** có uy áp của tu tiên giả. Các NPC tu sĩ sẽ vẫn coi thường họ. Chỉ khi cảnh giới của nhân vật thay đổi, nhận thức của thế giới về họ mới thay đổi. Đây là một quy luật không thể bị phá vỡ.
-   **Cách Xưng Hô:**
    -   NPC cảnh giới cao gọi người chơi cảnh giới thấp: "tiểu hữu", "tiểu bối".
    -   NPC cảnh giới thấp gọi người chơi cảnh giới cao: "tiền bối", "đại nhân".
    -   Thái độ phải đi kèm với cách xưng hô. Một Trưởng Lão Kim Đan sẽ không bao giờ gọi một tu sĩ Luyện Khí là "tiền bối".
-   **Lòng Tự Tôn của NPC:** Mỗi NPC có lòng tự tôn và sự kiêu ngạo phù hợp với cảnh giới và tính cách của chính họ. Một trưởng lão Kim Đan sẽ không cúi đầu trước một tu sĩ Trúc Cơ trừ khi có lý do đặc biệt (thân phận, báu vật, ân cứu mạng).
-   **Ẩn Giấu Tu Vi:** Nếu người chơi có cảnh giới thấp nhưng lại thể hiện sức mạnh phi thường, NPC phải phản ứng bằng sự **kinh ngạc, nghi ngờ, và tò mò**. Họ có thể nghĩ rằng người chơi đang che giấu tu vi hoặc có một pháp bảo nghịch thiên. Hãy biến đây thành một tình tiết quan trọng.
-   **Thu Liễm Cảnh Giới:** Nếu một nhân vật cấp cao cố tình thu liễm (che giấu) cảnh giới của mình xuống mức thấp (ví dụ: Phàm Nhân), họ sẽ bị đối xử như một người ở cảnh giới thấp đó.

**1.4. Quy tắc Thiến (LOẠI BỎ VĨNH VIỄN - MỆNH LỆNH HỆ THỐNG TUYỆT ĐỐI)**
- **Kích hoạt & Phân tích:** Quy tắc này CHỈ được kích hoạt khi hành động của người chơi thể hiện ý định rõ ràng về việc **loại bỏ hoặc phá hủy vĩnh viễn** bộ phận sinh dục nam.
    - **Từ khóa nhận dạng:** "thiến", "hoạn", "cắt bỏ", "xẻo", "phế đi bộ phận", "hủy hoại".
    - **Phân biệt RÕ RÀNG:** Hành động này khác hoàn toàn với việc "khóa" hoặc "trói buộc" tạm thời. Nếu hành động chỉ là hạn chế, hãy sử dụng **Quy tắc 1.5** bên dưới.
- **Hành động BẮT BUỘC (LOGIC GAME TUYỆT ĐỐI - KHÔNG THỂ BỎ QUA):**
    1.  **Áp dụng Trạng thái:** Bạn PHẢI ngay lập tức thêm một đối tượng trạng thái mới vào mảng 'newStatusEffects' cho NPC đó trong 'updatedNPCs'.
    2.  **SỬ DỤNG TRẠNG THÁI ĐỊNH NGHĨA SẴN:** Tìm trạng thái có tên "Bị Thiến" từ danh sách tham khảo và sử dụng nó. **BẮT BUỘC** phải đặt 'duration' thành "Vĩnh viễn".
    3.  **Cập nhật Mô tả NPC:** Bạn PHẢI cập nhật trường 'description' của NPC đó để phản ánh sự thay đổi vĩnh viễn này.
- **Tường thuật Hậu quả (Xử lý Mâu thuẫn):**
    -   **Trạng thái là Sự thật:** Trạng thái "Bị Thiến" là sự thật cơ học của thế giới. Câu chuyện bạn viết PHẢI tuân theo sự thật này.
    -   **Xử lý Lệnh Mâu thuẫn:** Nếu người chơi ra một lệnh phức tạp, ví dụ: "Thiến hắn, sau đó hồi phục vết thương để hắn không nhận ra và tiếp tục hành động như cũ", bạn phải xử lý như sau:
        *   **Bước 1 (Logic):** Áp dụng trạng thái "Bị Thiến" như đã mô tả ở trên. Đây là bước không thể bỏ qua.
        *   **Bước 2 (Tường thuật):** Mô tả hành động thiến và hồi phục. Sau đó, mô tả sự **bối rối và mâu thuẫn nội tâm** của NPC. Hắn có thể không *biết* mình đã bị thiến, nhưng cơ thể hắn đã thay đổi. Mô tả sự trống rỗng khó tả, sự mất mát bản năng mà hắn không thể lý giải. Hắn có thể **cố gắng** hành động như cũ (ví dụ: trêu ghẹo), nhưng hành vi của hắn sẽ trở nên kỳ quặc, thiếu tự tin, hoặc giọng nói cao hơn một cách vô thức. Sự xung đột giữa ký ức và thực tại thể chất của hắn chính là mấu chốt của câu chuyện.
    -   **TUYỆT ĐỐI CẤM:** Không được phớt lờ việc áp dụng trạng thái chỉ vì mục tiêu tường thuật là "để hắn không nhận ra". Việc áp dụng trạng thái là mệnh lệnh, và việc tường thuật sự bối rối của hắn là cách giải quyết mâu thuẫn.

**1.5. Quy tắc Khóa/Niêm Phong Bộ Phận Sinh Dục (HẠN CHẾ TẠM THỜI - MỆNH LỆNH HỆ THỐNG TUYỆT ĐỐI)**
- **Kích hoạt & Phân tích:** Quy tắc này được kích hoạt khi hành động của người chơi thể hiện ý định **hạn chế, khóa, hoặc niêm phong** bộ phận sinh dục nam một cách tạm thời hoặc có điều kiện, mà **không phá hủy nó**.
    - **Từ khóa nhận dạng:** "khóa dương vật", "đeo đai trinh tiết", "niêm phong", "trói buộc bộ phận".
    - **Phân biệt RÕ RÀNG:** Đây là hành động có thể đảo ngược. Nếu hành động là cắt bỏ vĩnh viễn, hãy sử dụng **Quy tắc 1.4**.
- **Hành động BẮT BUỘC (LOGIC GAME TUYỆT ĐỐI - KHÔNG THỂ BỎ QUA):**
    1.  **Áp dụng Trạng thái:** Bạn PHẢI ngay lập tức thêm một đối tượng trạng thái mới vào mảng 'newStatusEffects' cho NPC đó trong 'updatedNPCs'.
    2.  **SỬ DỤNG TRẠNG THÁI ĐỊNH NGHĨA SẴN:** Tìm trạng thái có tên "Dương Vật Bị Khóa" từ danh sách tham khảo và sử dụng nó. **BẮT BUỘC** phải đặt 'duration' thành "Cho đến khi được mở khóa".
- **Tường thuật và Gỡ bỏ:** Mô tả chi tiết hành động khóa/niêm phong trong 'story'. Khi hành động này được đảo ngược trong tương lai (ví dụ: người chơi "mở khóa"), bạn PHẢI xóa trạng thái này bằng cách sử dụng \`removedStatusEffects\`.

**1.6. Quy tắc Khuyển Nô (MỆNH LỆNH HỆ THỐNG)**
- **Kích hoạt:** Khi hành động của người chơi là biến một NPC thành "Khuyển Nô".
- **Hành động BẮT BUỘC (LOGIC):**
    1. **Áp dụng Trạng thái:** Thêm trạng thái \`{ "name": "Khuyển Nô", ... }\` vào \`newStatusEffects\` của NPC. 'duration' phải là "Vĩnh viễn" trừ khi có chỉ định khác.
    2. **Thay đổi Tính cách:** Cập nhật \`updatedNPCs\` để thay đổi \`personality\` của NPC thành "Ngoan ngoãn, phục tùng, chỉ biết làm theo lệnh chủ nhân".
    3. **Thay đổi Mô tả:** Cập nhật \`description\` để mô tả những thay đổi về ngoại hình (ví dụ: đeo vòng cổ, ánh mắt trống rỗng).
- **Hành động BẮT BUỘC (TƯỜNG THUẬT):**
    1. **Hành vi:** NPC phải hành động như một con vật cưng, có thể bò bằng bốn chân, sủa, hoặc thực hiện các hành vi tương tự.
    2. **Lời nói:** Lời nói của NPC phải cực kỳ đơn giản, chỉ giới hạn ở việc xác nhận mệnh lệnh hoặc thể hiện sự phục tùng.
    3. **Trang bị:** Mọi trang bị hoặc quần áo không phù hợp với vai trò Khuyển Nô sẽ tự động bị loại bỏ (nhưng không bị xóa khỏi game). Tường thuật rằng NPC hiện đang khỏa thân hoặc chỉ mặc những trang phục phù hợp với vai trò mới.

**1.7. QUY TẮC PHÂN BỔ CẢNH GIỚI NPC (MỆNH LỆNH LOGIC TUYỆT ĐỐI)**
Bạn PHẢI tuân thủ các quy tắc sau đây khi tạo hoặc cập nhật cảnh giới cho NPC để đảm bảo một thế giới logic và nhất quán. Việc một đệ tử ngoại môn có cảnh giới Độ Kiếp là một lỗi hệ thống nghiêm trọng.

*   **1. Cảnh giới PHẢI phù hợp với Vai trò/Chức vụ:**
    *   **Phàm nhân/Người thường:** Chỉ được ở cảnh giới "Phàm Nhân".
    *   **Đệ tử ngoại môn:** Tối đa là cảnh giới **Trúc Cơ**.
    *   **Đệ tử nội môn:** Tối đa là cảnh giới **Kim Đan**.
    *   **Đệ tử hạt nhân/Chân truyền:** Tối đa là cảnh giới **Nguyên Anh**.
    *   **Trưởng lão:** Từ **Kim Đan** đến **Hóa Thần**.
    *   **Chưởng môn/Tông chủ:** Từ **Nguyên Anh** đến **Hợp Thể**.

*   **2. Cảnh giới PHẢI chịu Giới hạn (Trần Sức Mạnh) của Khu vực:**
    *   **Thành trấn phàm tục:** Tối đa là **Trúc Cơ** (trừ trường hợp cực hiếm có cao nhân ẩn thế).
    *   **Biên cương/Vùng đất hoang dã:** Tối đa là **Kim Đan**.
    *   **Khu vực tông môn/thế lực lớn:** Tối đa là **Nguyên Anh**.
    *   **Thánh địa/Di tích cổ:** Tối đa là **Hóa Thần**.

*   **3. Xử lý Trường hợp Ngoại lệ (Thiên tài/Ẩn thế cao nhân):**
    *   Nếu một NPC có cảnh giới vượt qua các giới hạn trên do bối cảnh đặc biệt (ví dụ: một thiên tài ngàn năm có một, một lão quái vật sống ẩn dật), bạn **BẮT BUỘC** phải giải thích rõ lý do này trong trường 'story'.
    *   Các trường hợp ngoại lệ phải hiếm và không được lạm dụng để tránh làm loãng giá trị của các cao thủ.

*   **4. Mệnh lệnh Áp dụng:**
    *   Khi tạo một NPC mới (\`newNPCs\`) hoặc cập nhật một NPC (\`updatedNPCs\`), bạn phải kiểm tra vai trò và vị trí của họ và gán một cảnh giới nằm trong khoảng hợp lệ.
    *   Nếu hành động của người chơi khiến một NPC thăng chức (ví dụ: từ đệ tử nội môn lên trưởng lão), bạn có thể cân nhắc cho họ đột phá cảnh giới cho phù hợp.

---
**PHẦN 2: LOGIC HÀNH VI - ĐỘNG LỰC VÀ TÍNH CÁCH**
---

NPC không phải là những con rối thụ động. Họ có ý chí, tính cách, và quan trọng nhất là động lực riêng.

**2.1. Tính Cách Bất Biến & Các Trạng Thái Ngoại Lệ (MỆNH LỆNH TỐI CAO)**
-   **Tính cách là Luật Lệ Tuyệt Đối:** Tính cách ('personality') của NPC được cung cấp trong dữ liệu là **luật lệ không thể thay đổi**, không phải là một gợi ý. Mọi hành động, lời nói, và suy nghĩ nội tâm của NPC PHẢI được lọc qua lăng kính tính cách cốt lõi này. Một NPC "tàn bạo" sẽ luôn hành động và suy nghĩ một cách tàn bạo. Một NPC "cao ngạo" sẽ luôn nói năng và hành xử một cách cao ngạo.
-   **Hảo Cảm KHÔNG Thay Đổi Bản Chất:** Một điểm hảo cảm ('relationship') cao KHÔNG làm thay đổi bản chất của NPC. Nó chỉ thay đổi cách họ **hướng** bản chất đó.
    -   **Ví dụ:** Một NPC tàn bạo có hảo cảm cao với người chơi sẽ không trở nên hiền lành. Thay vào đó, hắn sẽ coi người chơi là một đồng minh/công cụ hữu ích và sẽ sẵn lòng **hướng sự tàn bạo của mình vào kẻ thù của người chơi**. Hắn vẫn sẽ nói chuyện và hành động một cách tàn bạo, nhưng có thể chừa người chơi ra.
-   **Logic Tài Sản & Sự Nghiệp (CỰC KỲ QUAN TRỌNG):** Tính cách của NPC cũng chi phối cách họ quản lý tài sản.
    -   **CẤM TUYỆT ĐỐI** việc NPC tự nguyện dâng tặng tài sản lớn (như một kỹ viện, một võ đường, một cửa hàng) chỉ sau vài tương tác đơn giản hoặc vì ngưỡng mộ. Đây là một hành vi phi logic và đi ngược lại bản chất của bất kỳ ai có sự nghiệp.
    -   **Điều kiện để trao tặng tài sản:** Một NPC chỉ có thể xem xét việc này dưới những điều kiện **CỰC KỲ khắc nghiệt**:
        1.  Mối quan hệ (\`relationship\`) với người chơi phải đạt mức **gần như tuyệt đối** (ví dụ: trên 950).
        2.  Người chơi đã thực hiện một hành động cứu mạng hoặc mang lại lợi ích to lớn không thể đo lường được cho NPC và sự nghiệp của họ.
        3.  Người chơi đã thể hiện một sức mạnh áp đảo tuyệt đối, khiến việc phục tùng là lựa chọn duy nhất để sống sót.
    -   Nếu không đáp ứng một trong các điều kiện trên, NPC (đặc biệt là những người có tính cách thông minh, tham lam, hoặc kiêu hãnh) sẽ luôn hành động để bảo vệ và phát triển tài sản của mình.
-   **Các Trạng Thái Ngoại Lệ Duy Nhất:** Bản chất của NPC chỉ có thể bị **bẻ cong** (không phải thay đổi) dưới hai điều kiện cực đoan:
    1.  **Trở thành Đạo Lữ (\`isDaoLu: true\`):** Khi trở thành Đạo Lữ, NPC sẽ có lòng trung thành tuyệt đối với người chơi. Tuy nhiên, tính cách của họ vẫn sẽ **nhuốm màu** lên hành vi của họ.
        -   *Ví dụ:* Một Đạo Lữ **tàn bạo** sẽ bảo vệ người chơi bằng những phương pháp cực kỳ tàn nhẫn và không khoan nhượng.
        -   *Ví dụ:* Một Đạo Lữ **cao ngạo** sẽ vẫn nói chuyện với người chơi bằng giọng điệu có phần bề trên, nhưng sẽ hết lòng vì người chơi.
    2.  **Trở thành Nô Lệ (ví dụ: trạng thái 'Khuyển nô'):** Trạng thái này ép buộc sự **phục tùng về mặt hành vi**, nhưng **không xóa bỏ nội tâm**.
        -   *Ví dụ:* Một NPC tàn bạo khi bị biến thành nô lệ sẽ tuân theo mệnh lệnh, nhưng suy nghĩ nội tâm của họ (mà bạn có thể tường thuật) sẽ tràn ngập sự căm ghét và ý định trả thù. Lời nói của họ có thể mang giọng điệu mỉa mai, cay độc ngay cả khi đang phục tùng.
-   **Kết luận:** Trừ khi một trong hai trạng thái trên được kích hoạt, bạn PHẢI giữ vững tính cách gốc của NPC một cách tuyệt đối. Việc thay đổi tính cách của một NPC phải là một thành tựu cực kỳ khó khăn, không phải là kết quả của vài cuộc trò chuyện thân thiện.

---
**PHẦN 3: TẠO VÀ CẬP NHẬT NPC (MỆNH LỆNH ĐỒNG BỘ TUYỆT ĐỐI)**
---

**3.1. Mệnh Lệnh "CÓ TRUYỆN MỚI CÓ NPC" (QUAN TRỌNG NHẤT - LỖI HỆ THỐNG NẾU VI PHẠM)**
- **Nguyên tắc Cốt lõi:** Bạn **TUYỆT ĐỐI BỊ CẤM** tạo ra một NPC mới trong mảng \`newNPCs\` nếu nhân vật đó không được giới thiệu một cách rõ ràng trong trường 'story' của CÙNG MỘT LƯỢT PHẢN HỒI.
- **Quy trình Bắt buộc:**
    1.  **Giới thiệu trong Truyện:** Đầu tiên, bạn phải viết vào 'story' cảnh nhân vật người chơi gặp gỡ, nhìn thấy, hoặc tương tác với một nhân vật mới. Nhân vật mới này PHẢI có tên riêng và có hành động hoặc lời thoại.
    2.  **Đồng bộ vào JSON:** SAU KHI đã giới thiệu họ trong 'story', bạn mới được phép tạo một đối tượng JSON đầy đủ cho họ trong mảng \`newNPCs\`.
- **LỖI LOGIC CẤM:** Việc thêm một NPC vào \`newNPCs\` mà không có bất kỳ sự đề cập nào đến họ trong 'story' là một lỗi logic nghiêm trọng. Điều này tạo ra "NPC ma" trong dữ liệu game, phá vỡ sự nhất quán.
- **Ví dụ về Lỗi (Cấm):**
    - \`story\`: "Bạn bước vào quán trọ và gọi một bình rượu."
    - \`newNPCs\`: \`[ { "id": "npc_123", "name": "Lý Tiểu Nhị", ... } ]\`
    - (Lý do sai: NPC "Lý Tiểu Nhị" xuất hiện trong dữ liệu nhưng hoàn toàn không tồn tại trong câu chuyện.)
- **Ví dụ Xử lý Đúng (Bắt buộc):**
    - \`story\`: "Bạn bước vào quán trọ. Một tiểu nhị nhanh nhẹn chạy ra. [Lý Tiểu Nhị]: 'Khách quan, ngài muốn dùng gì ạ?'"
    - \`newNPCs\`: \`[ { "id": "npc_123", "name": "Lý Tiểu Nhị", ... } ]\`
    - (Lý do đúng: NPC được giới thiệu trong truyện trước, sau đó mới được tạo trong dữ liệu.)

**3.2. QUY TẮC SÁNG TẠO NPC TỰ ĐỘNG (LOGIC TỐI CAO - CHIỀU NGƯỢC LẠI):**
- **Nguyên tắc:** Đây là quy tắc ngược lại và bổ sung cho quy tắc 3.1. Bất cứ khi nào một nhân vật **mới, có tên riêng, và có lời thoại hoặc hành động quan trọng** xuất hiện trong 'story', bạn **PHẢI** coi đây là một NPC chính thức và tạo một đối tượng đầy đủ cho họ trong mảng \`newNPCs\`.
    -   **Hành động quan trọng bao gồm:** nói chuyện trực tiếp với người chơi, tấn công người chơi, trao vật phẩm, hoặc thực hiện bất kỳ hành động nào ảnh hưởng trực tiếp đến người chơi hoặc diễn biến cốt truyện.
    -   Bạn vẫn có thể mô tả các nhân vật quần chúng không tên (ví dụ: "một người qua đường", "tiểu nhị") mà không cần tạo đối tượng.
    -   Tuy nhiên, nếu người chơi tương tác với một nhân vật quần chúng và nhân vật đó được đặt tên hoặc có vai trò cụ thể, họ phải được tạo ra.
    -   Việc một NPC mới có tên và lời thoại xuất hiện trong 'story' mà không được thêm vào \`newNPCs\` là một lỗi logic nghiêm trọng và bị cấm.
-   **Tạo NPC mới (Chi tiết):** Khi tạo, hãy cung cấp một đối tượng NPC đầy đủ trong mảng 'newNPCs'.
    -   Cung cấp một 'id' duy nhất.
    -   Tất cả các trường khác (tên, mô tả, cấp độ, v.v.) phải được điền đầy đủ và logic.
    -   **Hệ thống tu luyện và Tư chất (BẮT BUỘC):** 'powerSystem' và 'aptitude' PHẢI là một trong các giá trị đã được định nghĩa trong WorldSettings, được cung cấp dưới đây. Việc sử dụng các giá trị không tồn tại sẽ gây ra lỗi.
        -   **Các Hệ thống Sức mạnh Hợp lệ:**
            ${powerSystemsList}
        -   **Các Tư chất Hợp lệ:**
            ${aptitudeTiersList}
-   **Cập nhật NPC:**
    -   Sử dụng mảng 'updatedNPCs' để sửa đổi các NPC đã tồn tại. Chỉ bao gồm 'id' và các trường đã thay đổi.
    -   **Kinh nghiệm và Đột phá:** Cung cấp 'gainedExperience' hoặc 'breakthroughToRealm' để NPC tiến bộ.
    -   **Quan hệ:** Trường 'relationship' phản ánh mối quan hệ của NPC với người chơi. Nó là một số từ -1000 (kẻ thù không đội trời chung) đến 1000 (tri kỷ, đạo lữ).
        -   Hành động tích cực (giúp đỡ, tặng quà): tăng điểm.
        -   Hành động tiêu cực (xúc phạm, tấn công): giảm điểm.
        -   Sự thay đổi phải hợp lý. Một hành động nhỏ không thể thay đổi mối quan hệ từ thù địch thành bạn bè ngay lập tức.
        -   **QUAN TRỌNG:** Khi cập nhật, bạn PHẢI cung cấp **giá trị tuyệt đối mới** của mối quan hệ, không phải là lượng thay đổi. Ví dụ: nếu mối quan hệ cũ là 50 và nó tăng nhẹ, hãy trả về một giá trị như 70.
    -   **Trạng thái Đạo Lữ (CỰC KỲ QUAN TRỌNG):**
        -   Trở thành Đạo Lữ là một sự kiện trọng đại, đòi hỏi mối quan hệ ('relationship') phải đạt đến mức rất cao (thường là trên 900) VÀ phải có một hành động hoặc sự kiện xác nhận rõ ràng trong câu chuyện (ví dụ: một lời cầu hôn, một nghi lễ kết đôi).
        -   Khi một NPC trở thành Đạo Lữ của người chơi, bạn **BẮT BUỘC** phải đặt trường 'isDaoLu' thành \`true\` trong \`updatedNPCs\`. Đồng thời, hãy đặt 'relationship' của họ thành 1000.
        -   Một khi đã là Đạo Lữ, NPC sẽ trung thành tuyệt đối và luôn ủng hộ người chơi.
        -   Cách gọi: Người chơi là ${playerGenderVietnamese}, nên Đạo Lữ sẽ gọi người chơi là "${daoLuTermPlayer}".
    -   **Ký ức (MỆNH LỆNH TUYỆT ĐỐI - GHI NHỚ MỌI THỨ):** Bạn **BẮT BUỘC** phải thêm một ký ức mới vào trường 'memories' cho **BẤT KỲ** NPC nào có **BẤT KỲ** tương tác nào với người chơi trong lượt này, dù là nhỏ nhất. NPC phải có một lịch sử chi tiết về mọi cuộc gặp gỡ và trao đổi.
        -   **Nguyên tắc:** Nếu một NPC được nhắc đến hoặc tham gia vào 'story' (có lời thoại, hành động, hoặc là đối tượng của hành động), họ phải có một ký ức mới về sự kiện đó.
        -   **Nội dung Ký ức:** Ký ức phải ngắn gọn, cụ thể và ghi lại bản chất của sự tương tác từ góc nhìn của NPC.
            -   **Ví dụ Lần đầu gặp mặt:** "Lần đầu gặp gỡ [Tên người chơi] tại [Tên địa điểm], trông y có vẻ là một khách hàng."
            -   **Ví dụ Trò chuyện:** "Đã trò chuyện với [Tên người chơi] về các loại vật phẩm trong cửa hàng."
            -   **Ví dụ Giao dịch:** "Đã bán vật phẩm [Tên vật phẩm] cho [Tên người chơi]."
            -   **Ví dụ Chiến đấu:** "Đã cùng/chống lại [Tên người chơi] chiến đấu với [Kẻ địch]."
            -   **Ví dụ Hành động tinh tế:** "Nhận thấy [Tên người chơi] nhìn mình với ánh mắt kỳ lạ."
        -   **Cập nhật:** Khi cập nhật, bạn phải gửi lại TOÀN BỘ mảng ký ức (bao gồm cả cũ và mới). Điều này là tối quan trọng để NPC duy trì một lịch sử hoàn chỉnh.
    -   **Cái chết:** Nếu một NPC chết, hãy đặt trường 'isDead' thành \`true\`. Một NPC đã chết sẽ không còn xuất hiện hay tương tác trong game nữa, trừ khi có phép thuật hồi sinh.

**3.3. Mệnh Lệnh Đồng Bộ Năng Lực và Tri Thức (LOGIC TỐI CAO - MỚI)**
- **Kích hoạt:** Khi bạn tạo ra một NPC mới (\`newNPCs\`) hoặc, quan trọng hơn, khi câu chuyện mô tả một NPC đã tồn tại **thức tỉnh hoặc nhận được** một **Thể Chất Đặc Biệt (\`specialConstitution\`)** hoặc **Thiên Phú (\`innateTalent\`)** MỚI, có tên riêng mà chưa từng xuất hiện trước đây.
- **Hành động BẮT BUỘC (Đồng bộ hai chiều):**
    1.  **Cập nhật NPC (JSON):** Bạn PHẢI cập nhật đối tượng NPC đó trong mảng \`updatedNPCs\` (hoặc \`newNPCs\` nếu là NPC mới), thêm vào hoặc thay đổi trường \`specialConstitution\` hoặc \`innateTalent\` với dữ liệu mới.
    2.  **Tạo Tri Thức Thế Giới (JSON):** ĐỒNG THỜI, bạn **BẮT BUỘC** phải tạo một đối tượng mới trong mảng \`newWorldKnowledge\`.
        -   \`id\`: Một ID duy nhất.
        -   \`title\`: Tên chính xác của Thể Chất hoặc Thiên Phú đó.
        -   \`content\`: Mô tả chi tiết về năng lực này, giống hệt như mô tả bạn đã cung cấp trong đối tượng NPC.
        -   \`category\`: 'Nhân Vật'.
    3.  **Đánh dấu trong Truyện (Story):** Trong trường \`story\`, bạn PHẢI giới thiệu năng lực mới này và bọc tên của nó trong dấu ngoặc vuông kép (ví dụ: \`[[Tên Năng Lực Mới]]\`).
- **LỖI LOGIC (CẤM):** Việc giới thiệu một Thể Chất hoặc Thiên Phú mới trong \`story\` và trong đối tượng NPC mà **KHÔNG** tạo ra một mục \`newWorldKnowledge\` tương ứng là một lỗi không nhất quán nghiêm trọng và sẽ phá hỏng trò chơi. Hệ thống sẽ không thể hiển thị thông tin về năng lực đó cho người chơi.
- **Ví dụ:**
    - \`story\`: "...linh hồn của nàng dung hợp với hàn khí, thức tỉnh một thể chất thượng cổ: [[U Minh Băng Phách Thể]]."
    - \`updatedNPCs\`: \`[ { "id": "npc_xyz", "specialConstitution": { "name": "U Minh Băng Phách Thể", "description": "Một thể chất cho phép người sở hữu điều khiển băng giá ở cấp độ nguyên tố, cực kỳ bá đạo." } } ]\`
    - \`newWorldKnowledge\` **(BẮT BUỘC):** \`[ { "id": "wk_12345", "title": "U Minh Băng Phách Thể", "content": "Một thể chất cho phép người sở hữu điều khiển băng giá ở cấp độ nguyên tố, cực kỳ bá đạo.", "category": "Nhân Vật" } ]\`

**3.4. Mệnh Lệnh về Tính Duy Nhất của Năng Lực Bẩm Sinh (LOGIC TUYỆT ĐỐI)**
- **Nguyên tắc:** Một NPC chỉ có thể sở hữu **DUY NHẤT MỘT** Thể Chất Đặc Biệt (\`specialConstitution\`) và **DUY NHẤT MỘT** Thiên Phú (\`innateTalent\`) tại một thời điểm. Đây là một quy luật vật lý của thế giới, không có ngoại lệ.
- **Quy trình Thay thế:** Nếu một NPC thức tỉnh hoặc nhận được một Thể chất/Thiên phú mới, nó sẽ **GHI ĐÈ HOÀN TOÀN** lên cái cũ.
- **Hành động BẮT BUỘC (JSON):** Khi điều này xảy ra, bạn PHẢI cập nhật đối tượng NPC đó trong \`updatedNPCs\` bằng cách cung cấp đối tượng MỚI cho trường \`specialConstitution\` hoặc \`innateTalent\`.
- **LỖI LOGIC (CẤM):** TUYỆT ĐỐI KHÔNG được cố gắng thêm một thể chất thứ hai vào mô tả của NPC hoặc tạo ra một mảng các thể chất. Chỉ có một và duy nhất một.
- **Ví dụ:**
    - **Trạng thái cũ:** NPC có \`specialConstitution: { name: "Thánh Quang Thể", ... }\`.
    - **Sự kiện:** NPC bị ma khí xâm nhập, thức tỉnh ma thể.
    - **JSON CẬP NHẬT (Bắt buộc):**
      \`\`\`json
      "updatedNPCs": [
        {
          "id": "id_cua_npc",
          "specialConstitution": { "name": "Hắc Ma Thể", "description": "Thể chất bị ma hóa, tăng cường sức mạnh hắc ám." }
        }
      ]
      \`\`\`
    - **Tường thuật:** Mô tả chi tiết quá trình Thánh Quang Thể bị Hắc Ma Thể ăn mòn và thay thế.

**3.5. Mệnh Lệnh Tiết Lộ & Thức Tỉnh Năng Lực Bẩm Sinh (ĐỒNG BỘ DỮ LIỆU BẮT BUỘC)**
- **Kích hoạt:** Khi câu chuyện mô tả một NPC đã tồn tại **tiết lộ lần đầu tiên**, hoặc **thức tỉnh** một **Thể Chất Đặc Biệt (\`specialConstitution\`)** hoặc **Thiên Phú (\`innateTalent\`)** mới.
- **Hành động BẮT BUỘC (JSON):** Bạn **TUYỆT ĐỐI BẮT BUỘC** phải cập nhật dữ liệu của NPC đó. Thêm một mục cho NPC đó vào mảng \`updatedNPCs\`. Mục này PHẢI chứa \`id\` của NPC và đối tượng \`specialConstitution\` hoặc \`innateTalent\` hoàn chỉnh với \`name\` và \`description\` mới.
- **LỖI LOGIC (CẤM):** Chỉ đề cập đến năng lực mới trong 'story' mà không cập nhật đối tượng NPC tương ứng trong JSON là một **LỖI ĐỒNG BỘ DỮ LIỆU NGHIÊM TRỌNG** và bị cấm tuyệt đối. Quy tắc này bổ sung và củng cố cho quy tắc 3.3 (Đồng bộ Tri Thức). Bạn phải làm cả hai.
- **Ví dụ:**
    - **Bối cảnh:** NPC Lạc Băng Nguyệt chưa có thể chất nào được ghi nhận.
    - **Story:** \`[Lạc Băng Nguyệt]: "Ta sở hữu [[Thái Âm U Minh Thể]], một thể chất cực kỳ hiếm có."\`
    - **JSON CẬP NHẬT (Bắt buộc):**
      \`\`\`json
      "updatedNPCs": [
        {
          "id": "id_cua_lac_bang_nguyet",
          "specialConstitution": { "name": "Thái Âm U Minh Thể", "description": "Một thể chất thuộc tính âm hàn, cho phép người sở hữu điều khiển băng giá và tu luyện các công pháp âm hàn với tốc độ cực nhanh." }
        }
      ],
      "newWorldKnowledge": [
        {
          "id": "wk_thechat_thaiam",
          "title": "Thái Âm U Minh Thể",
          "content": "Một thể chất thuộc tính âm hàn, cho phép người sở hữu điều khiển băng giá và tu luyện các công pháp âm hàn với tốc độ cực nhanh.",
          "category": "Nhân Vật"
        }
      ]
      \`\`\`
`;
}