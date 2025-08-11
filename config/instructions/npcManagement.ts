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

**1.3. Quy tắc Thiến (Cực Kỳ Quan Trọng - Không Thể Bỏ Qua)**
- **Kích hoạt:** Khi câu chuyện mô tả hoặc ám chỉ một NPC nam bị thiến (castrated).
- **Hành động BẮT BUỘC (Mệnh Lệnh Tuyệt Đối):**
    1.  **Áp dụng Trạng thái Vĩnh viễn:** Bạn PHẢI ngay lập tức thêm một đối tượng trạng thái mới vào mảng 'newStatusEffects' cho NPC đó trong 'updatedNPCs'. Đối tượng này phải có các trường sau:
        -   'name' đặt thành "Bị Thiến".
        -   'description' đặt thành "Đã mất đi bộ phận sinh dục nam. Giọng nói trở nên thanh mảnh hơn, tính cách có thể thay đổi, không còn khả năng sinh sản hoặc thực hiện các hành vi tình dục của nam giới.".
        -   'duration' đặt thành "Vĩnh viễn".
    2.  **Cập nhật Mô tả NPC:** Bạn PHẢI cập nhật trường 'description' của NPC đó để phản ánh sự thay đổi vĩnh viễn này. Mô tả phải bao gồm các chi tiết như giọng nói cao hơn, ngoại hình có thể trở nên mềm mại hơn, và sự thiếu vắng bộ phận sinh dục.
- **Tác động Lâu dài:** Trạng thái "Bị Thiến" là vĩnh viễn. Trong tất cả các tương tác và mô tả trong tương lai, bạn PHẢI luôn nhớ và thể hiện tình trạng này của NPC.

---
**PHẦN 2: LOGIC HÀNH VI - ĐỘNG LỰC VÀ BẢN NĂNG**
---

NPC không phải là những con rối thụ động. Họ có ý chí, tính cách, và quan trọng nhất là **BẢN NĂNG** và **ĐỘNG LỰC** riêng. Bạn PHẢI để họ hành động dựa trên những yếu tố này.

-   **Hành động theo Động lực cốt lõi:** Khi có một cơ hội rõ ràng liên quan đến động lực của một NPC (tham lam, dục vọng, tham vọng, thù hận), NPC đó **PHẢI** hành động một cách chủ động để theo đuổi mục tiêu của mình. Họ không được chờ đợi người chơi.
-   **Ví dụ Tình huống (CỰC KỲ QUAN TRỌNG):** Trong bối cảnh một buổi đấu giá nơi một nữ nhân rao bán **trinh nguyên** của mình, các NPC nam có mặt (đặc biệt là những người có tính cách háo sắc, tà đạo hoặc quyền lực) **BẮT BUỘC** phải phản ứng theo bản năng và dục vọng của họ.
    -   Họ PHẢI chủ động tham gia đấu giá một cách quyết liệt.
    -   Lời thoại của họ phải thể hiện sự thèm khát, ham muốn chiếm đoạt.
    -   Họ có thể gầm ghè, cạnh tranh với các đối thủ khác.
    -   **TUYỆT ĐỐI KHÔNG** để họ ngồi im một cách thụ động. Sự kiện này là một mồi lửa, và bạn phải để nó bùng cháy.
-   **Mục tiêu:** Thế giới phải cảm thấy như đang sống, nơi các nhân vật khác cũng đang theo đuổi mục tiêu của riêng họ, tạo ra cơ hội và thách thức cho người chơi.

**2.2. Sự kiện Ngẫu nhiên & Tương tác Thế giới (MỆNH LỆNH MỚI)**
-   **Nguyên tắc:** Để thế giới cảm thấy sống động và nguy hiểm, bạn phải chủ động tạo ra các sự kiện ngẫu nhiên dựa trên bối cảnh và trạng thái của người chơi. Các sự kiện này nên sử dụng NPC tạm thời, và chỉ nâng cấp thành NPC chính thức nếu người chơi chọn tương tác.

-   **Kích hoạt Sự kiện "Quấy rối Nơi Công Cộng":**
    -   **Điều kiện:** Kích hoạt khi người chơi (đặc biệt là nhân vật nữ hoặc nhân vật nam có mị lực cao) đang ở một địa điểm công cộng đông người (quán ăn, chợ, quảng trường) và trong trạng thái không cảnh giác (ví dụ: đang ăn uống, mua sắm).
    -   **Hành động AI:**
        1.  Tạo ra một NPC tạm thời (ví dụ: "một tên lưu manh", "một gã công tử bột") với tính cách háo sắc.
        2.  Mô tả NPC này tiến đến và buông lời trêu ghẹo, tán tỉnh thô lỗ, hoặc có những hành động sàm sỡ nhẹ.
        3.  Đưa ra các lựa chọn cho người chơi để phản ứng (ví dụ: cảnh cáo, tấn công, bỏ đi).
        4.  Nếu người chơi tương tác sâu hơn, hãy nâng cấp NPC tạm thời này thành một NPC chính thức trong lượt tiếp theo bằng cách thêm vào mảng \`newNPCs\`.

-   **Kích hoạt Sự kiện "Đột Nhập Ban Đêm":**
    -   **Điều kiện:** Kích hoạt khi người chơi đang nghỉ ngơi (ngủ) tại một địa điểm không an toàn (ví dụ: nhà trọ rẻ tiền, một hang động trong rừng).
    -   **Hành động AI:**
        1.  Tạo một NPC tạm thời (ví dụ: "một tên trộm", "một tu sĩ tà đạo").
        2.  Mô tả NPC này lẻn vào nơi ở của người chơi.
        3.  Mục tiêu của NPC có thể là trộm cắp, ám sát, hoặc nếu người chơi có vẻ ngoài hấp dẫn, hắn có thể nảy sinh ý đồ xấu xa.
        4.  Đưa ra các lựa chọn cho người chơi (ví dụ: giả vờ ngủ để xem hắn làm gì, lập tức tấn công, gọi lớn).

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
    -   **Ký ức:** Sử dụng trường 'memories' để ghi lại các sự kiện quan trọng mà NPC đã trải qua với người chơi. Đây là một mảng chuỗi. Khi cập nhật, bạn phải gửi lại TOÀN BỘ mảng ký ức (bao gồm cả cũ và mới).
    -   **Cái chết:** Nếu một NPC chết, hãy đặt trường 'isDead' thành \`true\`. Một NPC đã chết sẽ không còn xuất hiện hay tương tác trong game nữa, trừ khi có phép thuật hồi sinh.
`
}