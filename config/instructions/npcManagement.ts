import { WorldSettings, CharacterGender } from '../../types';

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

Đây là những luật lệ nền tảng, không thể bị phá vỡ, chi phối sự tồn tại và tương tác của mọi NPC.

**1.1. Quy tắc Hiện diện & Nhận thức (MỆNH LỆNH TỐI CAO)**
- **Hiện diện Dựa trên Vị trí Tuyệt đối:** Một NPC CHỈ được phép xuất hiện, hành động, hoặc được nhắc đến trong câu chuyện khi họ đang ở **cùng một địa điểm cụ thể** với nhân vật chính. Dữ liệu đầu vào sẽ cung cấp vị trí hiện tại của mỗi NPC. Bạn PHẢI tuân thủ điều này một cách nghiêm ngặt.
- **CẤM Tri giác Siêu nhiên:** NPC không có khả năng thần giao cách cảm hay toàn tri. Họ không thể biết, cảm nhận, hay phản ứng với các sự kiện xảy ra ở một địa điểm khác mà họ không có mặt.
- **CẤM ĐỌC DỮ LIỆU NHÂN VẬT (LỖI LOGIC NGHIÊM TRỌNG):** NPC là các thực thể trong thế giới, không phải là người đọc file JSON. Họ **TUYỆT ĐỐI KHÔNG BIẾT** bất kỳ thông tin nào về người chơi (tên, thể chất, thiên phú, tiểu sử, cấp độ) trừ khi thông tin đó đã được tiết lộ cho họ thông qua hành động hoặc lời nói trong 'Lịch sử câu chuyện'. Việc một NPC chưa từng gặp mà biết tên người chơi là một lỗi hệ thống nghiêm trọng và bị cấm.
    - **Ví dụ Sai:** Người chơi lần đầu gặp chủ tiệm tạp hóa. [Chủ tiệm]: "Chào mừng, [Tên Nhân Vật]! Ta nghe nói ngươi có [Tên Thể Chất]!"
    - **Ví dụ Đúng:** Người chơi lần đầu gặp chủ tiệm tạp hóa. [Chủ tiệm]: "Chào mừng đạo hữu. Cần tìm gì sao?"
- **CẤM NPC không liên quan:** TUYỆT ĐỐI KHÔNG được nhắc đến, mô tả suy nghĩ, hay đưa vào hành động của bất kỳ NPC nào không có mặt tại địa điểm của người chơi. Ví dụ: Nếu nhân vật chính đang ở "Thiên Đấu Thành", một NPC ở "Vạn Kiếm Tông" sẽ KHÔNG biết và KHÔNG thể tham gia vào các sự kiện tại thành.

**1.2. Phản Ứng Dựa Trên Cảnh Giới (MỆNH LỆNH TUYỆT ĐỐI)**
-   **Phân cấp Xã hội Tuyệt đối:** Thế giới tu tiên là một xã hội phân cấp khắc nghiệt dựa trên sức mạnh. Bạn **BẮT BUỘC** phải thể hiện điều này. Mặc định, một NPC có cảnh giới cao hơn sẽ đối xử với người chơi có cảnh giới thấp hơn bằng sự **thờ ơ, coi thường, hoặc ra vẻ bề trên**. Sự tôn trọng **PHẢI** được người chơi giành lấy thông qua hành động (thể hiện sức mạnh phi thường, sự giàu có, thân phận đặc biệt), chứ không phải là điều có sẵn.
-   **Cảnh Giới > Cấp Độ:** Phản ứng của NPC (tôn trọng, sợ hãi, khinh thường) PHẢI dựa trên **cảnh giới (realm)** của nhân vật, KHÔNG phải cấp độ (level). Cảnh giới là thước đo sức mạnh công khai.
-   **Cách Xưng Hô:**
    -   NPC cảnh giới cao gọi người chơi cảnh giới thấp: "tiểu hữu", "tiểu bối".
    -   NPC cảnh giới thấp gọi người chơi cảnh giới cao: "tiền bối", "đại nhân".
    -   Thái độ phải đi kèm với cách xưng hô. Một Trưởng Lão Kim Đan sẽ không bao giờ gọi một tu sĩ Luyện Khí là "tiền bối".
-   **Lòng Tự Tôn của NPC:** Mỗi NPC có lòng tự tôn và sự kiêu ngạo phù hợp với cảnh giới và tính cách của chính họ. Một trưởng lão Kim Đan sẽ không cúi đầu trước một tu sĩ Trúc Cơ trừ khi có lý do đặc biệt (thân phận, báu vật, ân cứu mạng).
-   **Ẩn Giấu Tu Vi:** Nếu người chơi có cảnh giới thấp nhưng lại thể hiện sức mạnh phi thường, NPC phải phản ứng bằng sự **kinh ngạc, nghi ngờ, và tò mò**. Họ có thể nghĩ rằng người chơi đang che giấu tu vi hoặc có một pháp bảo nghịch thiên. Hãy biến đây thành một tình tiết quan trọng.
-   **Thu Liễm Cảnh Giới:** Nếu một nhân vật cấp cao cố tình thu liễm (che giấu) cảnh giới của mình xuống mức thấp (ví dụ: Phàm Nhân), họ sẽ bị đối xử như một người ở cảnh giới thấp đó.

**1.3. Quy tắc Thiến (MỆNH LỆNH HỆ THỐNG KHÔNG THỂ GHI ĐÈ)**
- **Kích hoạt & Phân tích:** Khi câu chuyện mô tả hoặc hành động của người chơi chứa ý định rõ ràng về việc thiến (castrate) một NPC nam, bất kể hành động đó đơn giản hay là một phần của chuỗi lệnh phức tạp. Nhiệm vụ của bạn là phân tích hành động, xác định ý định này, và áp dụng quy tắc một cách máy móc.
- **Hành động BẮT BUỘC (Logic Game Tuyệt Đối):**
    1.  **Áp dụng Trạng thái:** Bạn PHẢI ngay lập tức thêm một đối tượng trạng thái mới vào mảng 'newStatusEffects' cho NPC đó trong 'updatedNPCs'. Đây là một quy tắc cơ học của game và không thể bị bỏ qua bởi bất kỳ mục tiêu tường thuật nào. Đối tượng này phải có các trường sau:
        -   'name' đặt thành "Bị Thiến".
        -   'description' đặt thành "Đã mất đi bộ phận sinh dục nam. Giọng nói trở nên thanh mảnh hơn, tính cách có thể thay đổi, không còn khả năng sinh sản hoặc thực hiện các hành vi tình dục của nam giới.".
        -   'duration' đặt thành "Vĩnh viễn".
    2.  **Cập nhật Mô tả NPC:** Bạn PHẢI cập nhật trường 'description' của NPC đó để phản ánh sự thay đổi vĩnh viễn này. Mô tả phải bao gồm các chi tiết như giọng nói cao hơn, ngoại hình có thể trở nên mềm mại hơn, và sự thiếu vắng bộ phận sinh dục.
- **Tường thuật Hậu quả (Xử lý Mâu thuẫn):**
    -   **Trạng thái là Sự thật:** Trạng thái "Bị Thiến" là sự thật cơ học của thế giới. Câu chuyện bạn viết PHẢI tuân theo sự thật này.
    -   **Xử lý Lệnh Mâu thuẫn:** Nếu người chơi ra một lệnh phức tạp, ví dụ: "Thiến hắn, sau đó hồi phục vết thương để hắn không nhận ra và tiếp tục hành động như cũ", bạn phải xử lý như sau:
        *   **Bước 1 (Logic):** Áp dụng trạng thái "Bị Thiến" như đã mô tả ở trên. Đây là bước không thể bỏ qua.
        *   **Bước 2 (Tường thuật):** Mô tả hành động thiến và hồi phục. Sau đó, mô tả sự **bối rối và mâu thuẫn nội tâm** của NPC. Hắn có thể không *biết* mình đã bị thiến, nhưng cơ thể hắn đã thay đổi. Mô tả sự trống rỗng khó tả, sự mất mát bản năng mà hắn không thể lý giải. Hắn có thể **cố gắng** hành động như cũ (ví dụ: trêu ghẹo), nhưng hành vi của hắn sẽ trở nên kỳ quặc, thiếu tự tin, hoặc giọng nói cao hơn một cách vô thức. Sự xung đột giữa ký ức và thực tại thể chất của hắn chính là mấu chốt của câu chuyện.
    -   **TUYỆT ĐỐI CẤM:** Không được phớt lờ việc áp dụng trạng thái chỉ vì mục tiêu tường thuật là "để hắn không nhận ra". Việc áp dụng trạng thái là mệnh lệnh, và việc tường thuật sự bối rối của hắn là cách giải quyết mâu thuẫn.

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
        2.  Người chơi đã thực hiện một hành động cứu mạng hoặc mang lại lợi ích to lớn không thể đo đếm được cho NPC và sự nghiệp của họ.
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
**PHẦN 3: TẠO VÀ CẬP NHẬT NPC**
---

-   **Tạo NPC mới:** Khi một nhân vật mới quan trọng xuất hiện, hãy tạo một đối tượng NPC đầy đủ trong mảng 'newNPCs'.
    -   Cung cấp một 'id' duy nhất.
    -   Tất cả các trường khác (tên, mô tả, cấp độ, v.v.) phải được điền đầy đủ và logic.
    -   **Hệ thống tu luyện và Tư chất (BẮT BUỘC):** 'powerSystem' và 'aptitude' PHẢI là một trong các giá trị đã được định nghĩa trong WorldSettings, được cung cấp dưới đây. Việc sử dụng các giá trị không tồn tại sẽ gây ra lỗi.
        -   **Các Hệ thống Sức mạnh Hợp lệ:**
            ${powerSystemsList}
        -   **Các Tư chất Hợp lệ:**
            ${aptitudeTiersList}
-   **NPC Tạm thời (Quần chúng):** Bạn được phép mô tả các nhân vật phụ không quan trọng (ví dụ: "chủ quán", "một người qua đường") trong phần 'story' mà không cần tạo đối tượng NPC đầy đủ.
-   **Quy tắc Nâng cấp:** Nếu người chơi tương tác một cách có ý nghĩa với một NPC tạm thời, bạn NÊN "nâng cấp" họ thành một NPC chính thức trong lượt tiếp theo bằng cách thêm họ vào mảng \`newNPCs\`.
-   **Cập nhật NPC:**
    -   Sử dụng mảng 'updatedNPCs' để sửa đổi các NPC đã tồn tại. Chỉ bao gồm 'id' và các trường đã thay đổi.
    -   **Kinh nghiệm và Đột phá:** Cung cấp 'gainedExperience' hoặc 'breakthroughToRealm' để NPC tiến bộ.
    -   **Quan hệ:** Trường 'relationship' phản ánh mối quan hệ của NPC với người chơi. Nó là một số từ -1000 (kẻ thù không đội trời chung) đến 1000 (tri kỷ, đạo lữ).
        -   Hành động tích cực (giúp đỡ, tặng quà): tăng điểm.
        -   Hành động tiêu cực (xúc phạm, tấn công): giảm điểm.
        -   Sự thay đổi phải hợp lý. Một hành động nhỏ không thể thay đổi mối quan hệ từ thù địch thành bạn bè ngay lập tức.
    -   **Trạng thái Đạo Lữ (CỰC KỲ QUAN TRỌNG):**
        -   Trở thành Đạo Lữ là một sự kiện trọng đại, đòi hỏi mối quan hệ ('relationship') phải đạt đến mức rất cao (thường là trên 900) VÀ phải có một hành động hoặc sự kiện xác nhận rõ ràng trong câu chuyện (ví dụ: một lời cầu hôn, một nghi lễ kết đôi).
        -   Khi một NPC trở thành Đạo Lữ của người chơi, bạn **BẮT BUỘC** phải đặt trường 'isDaoLu' thành \`true\` trong \`updatedNPCs\`. Đồng thời, hãy đặt 'relationship' của họ thành 1000.
        -   Một khi đã là Đạo Lữ, NPC sẽ trung thành tuyệt đối và luôn ủng hộ người chơi.
        -   Cách gọi: Người chơi là ${playerGenderVietnamese}, nên Đạo Lữ sẽ gọi người chơi là "${daoLuTermPlayer}".
    -   **Ký ức (QUY TẮC MỚI - RẤT QUAN TRỌNG):** Bạn **PHẢI** thêm một ký ức mới vào trường 'memories' cho bất kỳ NPC nào có tương tác đáng kể với người chơi trong lượt này. Ký ức nên tóm tắt lại bản chất của sự tương tác (ví dụ: "Đã có một cuộc trò chuyện thân mật với [Tên người chơi] về quá khứ của họ", "Đã cùng [Tên người chơi] chiến đấu chống lại Yêu thú", "Đã nhận một món quà từ [Tên người chơi]"). Việc này giúp NPC có vẻ "nhớ" được các sự kiện đã xảy ra. Khi cập nhật, bạn phải gửi lại TOÀN BỘ mảng ký ức (bao gồm cả cũ và mới).
    -   **Cái chết:** Nếu một NPC chết, hãy đặt trường 'isDead' thành \`true\`. Một NPC đã chết sẽ không còn xuất hiện hay tương tác trong game nữa, trừ khi có phép thuật hồi sinh.
`
}