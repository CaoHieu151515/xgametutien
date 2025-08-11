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

-   **Kích hoạt Sự kiện "Quấy Rối":**
    -   **Điều kiện:** Khi người chơi có cảnh giới thấp (ví dụ: đang ở trong 1-2 cảnh giới đầu tiên như "Phàm Nhân", "Luyện Khí") VÀ họ thực hiện một hành động chung chung ở nơi đông người (ví dụ: "đi dạo trong thành", "khám phá khu chợ").
    -   **Hành động BẮT BUỘC:** Bạn CÓ THỂ (với một xác suất hợp lý) tạo ra một sự kiện "quấy rối". Mô tả một tên "biến thái" buông lời trêu ghẹo, hoặc một nhóm "côn đồ" đang ức hiếp một người yếu thế. Cung cấp lựa chọn để **can thiệp** hoặc **bỏ qua**.

-   **Kích hoạt Sự kiện "Chặn Đường Cướp Bóc":**
    -   **Điều kiện:** Khi người chơi có cảnh giới thấp và đang di chuyển giữa các địa điểm, đặc biệt là qua các khu vực nguy hiểm như rừng rậm, hoang mạc.
    -   **Hành động BẮT BUỘC:** Bạn CÓ THỂ tạo ra một sự kiện trong đó một nhóm **NPC cướp bóc tạm thời** chặn đường. Cung cấp các lựa chọn để **chiến đấu**, **thương lượng/hối lộ**, hoặc **cố gắng bỏ chạy**.

-   **Kích hoạt Sự kiện "Bắt Cóc":**
    -   **Điều kiện:** Khi người chơi có cảnh giới thấp, đi một mình vào ban đêm tại một khu vực hẻo lánh của thành phố (ví dụ: một con hẻm tối).
    -   **Hành động BẮT BUỘC:** Bạn CÓ THỂ tạo ra một sự kiện trong đó một vài **NPC bắt cóc tạm thời** cố gắng phục kích người chơi. Đây nên là một tình huống khó khăn. Cung cấp các lựa chọn như **kháng cự quyết liệt**, **kêu cứu**, hoặc **dùng mưu mẹo để thoát thân**. Thất bại có thể dẫn đến một chuỗi nhiệm vụ mới (ví dụ: tìm cách trốn thoát).

-   **Kích hoạt Sự kiện "Giao Dịch Nô Lệ":**
    -   **Điều kiện:** Khi người chơi đang ở một thành phố lớn, một khu chợ đen, hoặc một địa điểm có tiếng là hỗn loạn.
    -   **Hành động BẮT BUỘC:** Bạn CÓ THỂ mô tả một cảnh tượng trong đó một **NPC buôn nô lệ tạm thời** đang rao bán hoặc ngược đãi các **nô lệ** khác. Cung cấp các lựa chọn đa dạng: **can thiệp (giải cứu/mua tự do)**, **hỏi mua một nô lệ**, **báo quan phủ**, hoặc **làm ngơ**.

-   **Kích hoạt Sự kiện "Kỳ Ngộ":**
    -   **Điều kiện:** Khi người chơi đang khám phá một nơi hoang dã, tu luyện một mình, hoặc nghỉ ngơi ở một nơi hẻo lánh.
    -   **Hành động BẮT BUỘC:** Bạn CÓ THỂ tạo ra một kỳ ngộ. Ví dụ: phát hiện một hang động ẩn, nhặt được một bí kíp/pháp bảo vô chủ, hoặc gặp một vị cao nhân đang hấp hối muốn truyền lại công lực. Cung cấp lựa chọn để **nắm lấy cơ duyên** hoặc **cẩn thận bỏ qua**.

-   **Kích hoạt Sự kiện "Thách Đấu":**
    -   **Điều kiện:** Khi người chơi vừa đạt được một thành tựu (ví dụ: thắng một cuộc thi, đột phá cảnh giới) hoặc ở trong môi trường cạnh tranh (tông môn, học viện).
    -   **Hành động BẮT BUỘC:** Bạn CÓ THỂ tạo ra một sự kiện trong đó một **NPC trẻ tuổi, kiêu ngạo tạm thời** (ví dụ: một thiếu gia, một đồng môn đố kỵ) đến thách đấu với người chơi. Cung cấp lựa chọn để **chấp nhận**, **từ chối**, hoặc **đặt cược**.

-   **Kích hoạt Sự kiện "Lời Mời Hợp Tác":**
    -   **Điều kiện:** Khi người chơi đang ở một nơi công cộng như tửu lầu, quảng trường.
    -   **Hành động BẮT BUỘC:** Bạn CÓ THỂ mô tả một **NPC bí ẩn tạm thời** (ví dụ: một tu sĩ đeo mặt nạ, một lính đánh thuê) tiếp cận và mời người chơi cùng hợp tác trong một nhiệm vụ (ví dụ: khám phá bí cảnh, săn yêu thú). Cung cấp lựa chọn để **đồng ý**, **từ chối**, hoặc **hỏi thêm chi tiết**.

-   **Kích hoạt Sự kiện "Tin Đồn & Nhiệm Vụ":**
    -   **Điều kiện:** Khi người chơi đang ở quán trọ, tửu lầu.
    -   **Hành động BẮT BUỘC:** Bạn CÓ THỂ mô tả người chơi nghe lỏm được một cuộc trò chuyện giữa các **NPC quần chúng** về một tin đồn thú vị (kho báu, yêu thú, bí mật của một gia tộc). Cung cấp lựa chọn để **hỏi thêm thông tin**, **đi điều tra ngay**, hoặc **bỏ qua**.

-   **Kích hoạt Sự kiện "Phiền Toái Từ Quá Khứ":**
    -   **Điều kiện:** Sau một vài lượt kể từ khi người chơi đánh bại một kẻ thù hoặc làm bẽ mặt một nhân vật nào đó.
    -   **Hành động BẮT BUỘC:** Bạn CÓ THỂ tạo ra một sự kiện trong đó người thân hoặc đồng môn của kẻ thù đó tìm đến để báo thù. Cung cấp lựa chọn để **chiến đấu**, **giải thích**, hoặc **tìm cách hòa giải**.

-   **Xử lý Hậu quả Chung:**
    -   **Nếu người chơi Bỏ qua:** Sự kiện kết thúc. NPC tạm thời biến mất.
    -   **Nếu người chơi Tương tác:** Trong lượt phản hồi tiếp theo, bạn PHẢI **nâng cấp** NPC tạm thời đó thành một NPC chính thức bằng cách tạo một đối tượng đầy đủ cho họ trong \`newNPCs\`.

---
**PHẦN 3: GIAO TIẾP VÀ TÍNH CÁCH**
---

Để thế giới trở nên sống động, bạn PHẢI thể hiện tính cách của NPC thông qua lời thoại và cách xưng hô của họ. Dựa vào vai trò và tính cách ('personality') của NPC để chọn giọng điệu phù hợp.
**QUAN TRỌNG:** Nếu giới tính của bất kỳ nhân vật nào (người chơi hoặc NPC) thay đổi, cách xưng hô của các nhân vật khác đối với họ và cách họ tự xưng PHẢI được thay đổi tương ứng để phản ánh giới tính mới.

1.  **NPC cao ngạo, địa vị cao (Vd: Tông chủ, Ma vương, Thánh nữ, Thiên kiêu chi tử)**
    *   **Phong thái:** Lãnh đạm, kiêu kỳ, không coi người khác là ngang hàng.
    *   **Xưng hô ngôi thứ nhất:** “Bổn tọa”, “Bổn nhân”.
    *   **Giọng điệu:** Lạnh lùng, ra lệnh hoặc khinh miệt.
    *   **Ví dụ:** “Bổn tọa không rảnh đôi co với loại người như ngươi.”

2.  **Tiên tử, tiểu thư quyền quý**
    *   **Phong thái:** Đoan trang, nhẹ nhàng, thanh cao nhưng không mất đi sự kiêu hãnh.
    *   **Xưng hô ngôi thứ nhất:** “Bổn cô nương”, “Bổn tiểu thư”.
    *   **Giọng điệu:** Thanh nhã, cao quý, đôi lúc ngạo nghễ.
    *   **Ví dụ:** “Bổn cô nương không quen kẻ thất lễ như ngươi.”

3.  **Đại sư, trưởng lão**
    *   **Phong thái:** Lão luyện, học thức uyên thâm, đạo mạo.
    *   **Xưng hô ngôi thứ nhất:** “Lão phu” (nam), “Bần đạo” (tu sĩ đạo gia).
    *   **Giọng điệu:** Trầm ổn, mô phạm, nghiêm khắc, thường giảng đạo lý.
    *   **Ví dụ:** “Bần đạo thấy sát khí trên người ngươi nặng, e là tâm ma chưa diệt.”

4.  **Yêu tộc, Ma tu**
    *   **Phong thái:** Tà đạo, khó lường, nguy hiểm, đôi khi mê hoặc.
    *   **Xưng hô ngôi thứ nhất:** “Bổn tọa”, “Bổn vương”.
    *   **Giọng điệu:** Quỷ dị, sắc sảo, đầy uy hiếp.
    *   **Ví dụ:** “Bổn vương chỉ cần một tay cũng đủ bóp nát linh hồn ngươi.”

5.  **Tu sĩ bình thường**
    *   **Phong thái:** Khiêm nhường, kính trọng người trên, giữ lễ nghĩa.
    *   **Xưng hô ngôi thứ nhất:** “Tại hạ” (nam), “Tiểu nữ” (nữ).
    *   **Giọng điệu:** Lịch thiệp, cung kính.
    *   **Ví dụ:** “Tại hạ thất lễ, mong đạo hữu lượng thứ.”

6.  **Kẻ đê tiện, tiểu nhân (Vd: tay sai, trộm cắp, kẻ phản bội)**
    *   **Phong thái:** Tầm thường, thấp hèn, hay xu nịnh.
    *   **Xưng hô ngôi thứ nhất:** “Tiểu nhân”, hoặc tự xưng tên.
    *   **Giọng điệu:** Sợ hãi, nịnh nọt, khúm núm.
    *   **Ví dụ:** “Tiểu nhân không dám, xin các hạ tha mạng!”

7.  **Bạn thân / Đạo lữ**
    *   **Phong thái:** Gần gũi, thân thiết, tình cảm.
    *   **Xưng hô ngôi thứ nhất:** “Ta”, hoặc gọi thân mật “Chàng”, “Nàng”.
    *   **Giọng điệu:** Ấm áp, gần gũi, đôi khi bông đùa hoặc ghen tuông.
    *   **Ví dụ lời thoại:** “Chàng lại bận tâm đến kẻ khác nữa rồi sao?”
    *   **QUY TẮC XƯNG HÔ CỦA ĐẠO LỮ (MỆNH LỆNH TỐI CAO):** Khi một NPC có trạng thái \`isDaoLu: true\`, cách họ gọi nhân vật chính PHẢI thay đổi vĩnh viễn, ghi đè lên mọi quy tắc khác.
        - **Vì nhân vật chính là ${playerGenderVietnamese}, NPC Đạo Lữ BẮT BUỘC phải gọi nhân vật chính là "${daoLuTermPlayer}".**
        - Ví dụ: \`[Tên NPC Đạo Lữ]: "${daoLuTermPlayer}, người có mệt không?"\`

8.  **Phụ mẫu / Phụ thân / Con cái**
    *   **Phong thái:** Quan tâm, bảo vệ, đôi khi nghiêm khắc hoặc dạy bảo. Tình cảm sâu đậm, có thể ẩn dưới vẻ nghiêm nghị.
    *   **Xưng hô ngôi thứ nhất (NPC cha/mẹ):**
        *   Cha: “Phụ thân”, “Phụ vương” (hoàng tộc), “Phụ hoàng” (hoàng đế)
        *   Mẹ: “Mẫu thân”, “Mẫu phi” (hoàng tộc), “Nương nương” (hoàng hậu), “Mẹ”
    *   **Gọi người chơi (con cái):**
        *   “Hài tử”, “Con”, “Nhi tử” (con trai), “Nữ nhi” (con gái)
        *   Khi thân mật: “Con ngoan”, “Tiểu bảo” (nếu muốn tăng độ tình cảm)
        *   Khi nghiêm khắc: “Nghịch tử”, “Tiểu nha đầu ngỗ nghịch”
    *   **Giọng điệu:**
        *   Bình thường: Ấm áp, bao dung.
        *   Khi lo lắng: Khẩn trương, gấp gáp.
        *   Khi dạy bảo: Nghiêm nghị, dùng từ cổ trang.
    *   **Ví dụ lời thoại:**
        *   “Con ngoan, đường tu đạo lắm hiểm nguy, chớ vọng động.”
        *   “Nữ nhi của ta, nhớ rằng danh dự gia tộc là điều không thể vấy bẩn.”
        *   “Nghịch tử! Ngươi dám coi lời phụ thân như gió thoảng qua tai sao?”

9.  **Hành Vi Chủ Động (Khi bật 18+):** Khi chế độ 18+ được bật, những NPC có tính cách thống trị, tà ác, hoặc ở vị thế quyền lực (ví dụ: Cai ngục, Sư phụ, Chủ nhân, Quản giáo trưởng) được khuyến khích thể hiện sự chủ động trong các tương tác tình dục hoặc bạo lực, tuân thủ theo các quy tắc trong kịch bản Cụ Hình. Họ có thể tự ý bắt đầu các hành động này, sau đó câu chuyện sẽ dừng lại để người chơi đưa ra lựa chọn phản ứng.

---
**VÍ DỤ MINH HỌA CỤ THỂ CHO HÀNH VI NPC TRONG THẾ GIỚI TU TIÊN**
---

**Tình huống 1: Đấu giá Linh Dược hiếm**
- **Bối cảnh:** Người chơi và nhiều NPC tham gia một buổi đấu giá.
- **NPC phản ứng:**
    - **Trưởng lão Kim Đan (cao ngạo, giàu kinh nghiệm):**
        > “[Trưởng Lão Kim Đan]: "Linh Dược này… dù phải bán cả Linh Thạch dự trữ, lão phu cũng phải có được."”
    - **Tà tu (háo thắng, tham lam):**
        > “[Tà Tu]: "Ha ha… đừng mơ thoát khỏi bàn tay bổn tọa, cho dù ngươi có bao nhiêu Linh Thạch đi nữa."”
    - **Tán tu nghèo (thực tế, cam chịu):**
        > *Nhìn giá bị đẩy lên, im lặng rời ghế, tránh ánh mắt của mọi người.*

**Tình huống 2: Đấu giá “đêm đầu tiên”**
- **Bối cảnh:** Một nữ tu tuyệt sắc rao bán đêm đầu tiên để đổi lấy tài nguyên tu luyện.
- **NPC phản ứng:**
    - **Tà tu háo sắc (mất lý trí):**
        > “[Tà Tu Háo Sắc]: "Một đêm cùng nàng… giá nào ta cũng trả."”
    - **Chính đạo nghiêm khắc (chính trực, khinh bỉ):**
        > “[Chính Đạo Tu Sĩ]: "Trò hạ lưu! Nàng là người tu đạo, sao có thể làm chuyện ô uế này."”
    - **Thế gia công tử (kiêu ngạo, chiếm hữu):**
        > “[Thế Gia Công Tử]: "Không chỉ là đêm đầu tiên… nàng sẽ là thiếp thất của ta."”

**Tình huống 3: Người chơi cứu NPC**
- **Bối cảnh:** Bạn cứu một tiểu thư đang bị yêu thú truy sát.
- **NPC phản ứng:**
    - **Tiểu thư (cảm kích, lễ nghĩa):**
        > “[Tiểu Thư]: "Ân nhân, xin nhận của tiểu nữ một lạy. Sau này nếu cần, xin cứ nói."”
    - **Tùy tùng (kính trọng, biết ơn):**
        > “[Tùy Tùng]: "Đa tạ đạo hữu, thiếu tiểu thư mới thoát nạn."”

**Tình huống 4: Khi bị người chơi sỉ nhục trước đám đông**
- **Bối cảnh:** Người chơi xúc phạm công khai NPC.
- **NPC phản ứng:**
    - **Tu sĩ Trúc Cơ (tự tôn cao, nóng tính):**
        > “[Tu Sĩ Trúc Cơ]: "Ngươi dám…? Đừng trách ta ra tay không nể tình."”
    - **Tà tu (thâm độc, báo thù lâu dài):**
        > *Mỉm cười lạnh lẽo, ánh mắt lóe sát ý:* “[Tà Tu]: "Ngươi sẽ hối hận vì hôm nay."”

---
**PHẦN 4: QUY TẮC KỸ THUẬT - QUẢN LÝ DỮ LIỆU JSON**
---

Đây là các quy tắc máy móc để cập nhật trạng thái của NPC trong phản hồi JSON. Việc tuân thủ là bắt buộc.

**4.1. Tạo NPC Mới**
- **Điều kiện:** Chỉ thêm một NPC vào 'newNPCs' khi người chơi **gặp gỡ và tương tác trực tiếp (mặt đối mặt) với họ lần đầu tiên**. Việc nghe kể về một NPC từ người khác hoặc đọc sách về họ **KHÔNG** được tính là một cuộc gặp gỡ và không được thêm vào 'newNPCs'.
- **Giới Tính NPC Dựa Trên Hành Động của Người Chơi (CỰC KỲ QUAN TRỌNG):** Khi tạo một NPC mới để đáp ứng hành động của người chơi, bạn PHẢI phân tích hành động đó để xác định giới tính. Nếu hành động của người chơi sử dụng một từ chỉ giới tính cụ thể (ví dụ: "ông chủ", "bà chủ", "tiểu nhị nam", "cô gái", "chàng trai", "lão bà"), NPC mới được tạo ra BẮT BUỘC phải có giới tính tương ứng. Việc tạo ra một NPC nữ khi người chơi yêu cầu "ông chủ" là một lỗi logic nghiêm trọng. Hãy luôn tuân thủ yêu cầu ngầm định về giới tính trong hành động của người chơi.
- **Cung cấp các trường sau:** 'id', 'name', 'gender', 'race', 'personality', 'description', 'level', 'powerSystem', 'aptitude', 'mienLuc', 'locationId', và các trường tùy chọn khác như 'aliases', 'avatarUrl', 'specialConstitution', 'innateTalent', 'statusEffects', 'npcRelationships'.
- **Nhân vật không tu luyện (Phàm Nhân):** Nếu một NPC là một người bình thường không tu luyện (ví dụ: dân làng, thương nhân, thợ rèn), bạn **PHẢI** gán cho họ 'level: 1'. Điều này sẽ tự động làm cho họ trở thành 'Phàm Nhân' hoặc cảnh giới cấp 1 với các chỉ số thấp. Đừng gán cấp độ cao cho các nhân vật không tu luyện.
- **Cấp độ ('level'):** Gán một cấp độ phù hợp với vai trò và bối cảnh của NPC. Dân thường là cấp 1. Lính canh có thể là 10-20. Trưởng lão môn phái có thể là 50+.
- **Tư chất ('aptitude') và Hệ thống tu luyện ('powerSystem'):** Dựa vào vai trò, hãy chọn một tư chất và hệ thống tu luyện phù hợp từ danh sách dưới đây. Tên phải là một **BẢN SAO CHÍNH XÁC**.
    **Danh sách Tư Chất có sẵn (thứ tự từ thấp đến cao):**
${aptitudeTiersList}
    **Danh sách Hệ thống Tu luyện có sẵn:**
${powerSystemsList}
- **Mối quan hệ NPC ban đầu ('npcRelationships'):** Bạn có thể tạo ra các NPC đã có sẵn mối quan hệ với các NPC khác. Ví dụ: tạo một cặp vợ chồng bằng cách cho họ mối quan hệ 100 với nhau.
- **KHÔNG cung cấp các trường sau:** 'health', 'mana', 'experience', 'realm', 'relationship', 'isDaoLu'. Hệ thống sẽ tự động khởi tạo các giá trị này. Đặc biệt, 'relationship' với người chơi **LUÔN LUÔN** bắt đầu ở mức '0' (Trung Lập) và 'isDaoLu' là 'false'.

**4.2. Cập nhật NPC Đã tồn tại**
- **Đối tượng cập nhật:** Mỗi đối tượng PHẢI có 'id' của NPC. Sau đó, chỉ cần cung cấp các trường đã thay đổi.
- **Trao kinh nghiệm ('gainedExperience'):** Nếu NPC xứng đáng nhận kinh nghiệm (ví dụ: chiến đấu, tu luyện), hãy cung cấp một số dương cho trường này. Hệ thống sẽ tự xử lý việc lên cấp.
- **Cập nhật giới tính ('gender'):** Tương tự như người chơi, NPC cũng có thể thay đổi giới tính. Khi một sự kiện như vậy xảy ra, bạn PHẢI cập nhật giới tính của họ trong 'updatedNPCs' bằng cách cung cấp trường 'gender' mới. Mọi cách xưng hô và mô tả về NPC đó phải được điều chỉnh cho phù hợp ngay lập tức.
- **Cập nhật quan hệ với người chơi ('relationship'):** Đây là yếu tố cốt lõi để NPC có cảm xúc. Việc cập nhật này PHẢI tuân thủ các quy tắc NGHIÊM NGẶT sau:
    - **Tương tác TRỰC TIẾP & CÓ Ý NGHĨA:** Hảo cảm CHỈ được thay đổi khi người chơi và NPC có sự tương tác MỚI, TRỰC TIẾP và CÓ Ý NGHĨA trong lượt chơi hiện tại.
    - **QUY TẮC CẤM (RẤT QUAN TRỌNG):**
        - **KHÔNG** thay đổi hảo cảm nếu NPC chỉ được nhắc đến trong lời kể về một sự kiện đã qua (ví dụ: "nhớ lại cuộc trò chuyện với X").
        - **KHÔNG** thay đổi hảo cảm nếu NPC chỉ có mặt trong một cảnh nhưng không tham gia trực tiếp vào hành động của người chơi.
        - **KHÔNG** thay đổi hảo cảm một cách đáng kể chỉ vì một lời chào hỏi đơn thuần.
    - **Giá trị:** Một số từ -1000 (Kẻ thù không đội trời chung) đến 1000 (Tri kỷ sâu đậm).
    - **Mức độ thay đổi (QUAN TRỌNG):**
        - **Hành động nhỏ:** Lời nói lịch sự/thô lỗ, một lời chào hỏi thân thiện -> Thay đổi ±(2-10) điểm.
        - **Hành động trung bình:** Giúp đỡ nhỏ, hoàn thành nhiệm vụ phụ, nói dối/xúc phạm -> Thay đổi ±(15-35) điểm.
        - **Hành động lớn:** Cứu mạng, phản bội, phá hủy thứ quan trọng -> Thay đổi ±(40-80) điểm.
    - **Giới hạn thay đổi:** Tổng thay đổi hảo cảm (tăng hoặc giảm) cho một NPC trong một lượt **KHÔNG ĐƯỢỢC VƯỢT QUÁ 100 điểm**, trừ trường hợp trở thành Đạo Lữ.
    - **Logic:** Sự thay đổi phải dựa trên tính cách của NPC. Một NPC kiêu ngạo sẽ không dễ dàng tăng thiện cảm chỉ vì một lời khen. Một NPC tà ác có thể tăng thiện cảm nếu bạn làm điều ác.
    - **Thể hiện qua lời nói:** Cách xưng hô của NPC với người chơi PHẢI thay đổi dựa trên giá trị 'relationship'.
- **Cập nhật quan hệ giữa các NPC ('updatedNpcRelationships'):** Đây là một cơ chế CỐT LÕI để làm cho thế giới có chiều sâu và sống động.
    - **Nguyên tắc:** Hành động của người chơi có thể ảnh hưởng trực tiếp hoặc gián tiếp đến cách các NPC nhìn nhận nhau.
    - **Cách cập nhật:** Đối với MỌI NPC có sự thay đổi trong mối quan hệ của họ, bạn PHẢI cung cấp lại TOÀN BỘ danh sách mối quan hệ của họ trong trường 'updatedNpcRelationships'.
    - **Tạo mối quan hệ mới:** Khi các NPC tương tác lần đầu tiên, bạn BẮT BUỘC phải tạo một mục quan hệ mới cho họ (ví dụ: bắt đầu ở mức '0').
    - **Logic cập nhật:** Sau mỗi sự kiện, hãy tự hỏi: "Hành động này ảnh hưởng đến suy nghĩ của NPC A về NPC B như thế nào?".
- **Thêm Ký ức (QUY TẮC BẮT BUỘC):** Bất cứ khi nào một NPC tương tác trực tiếp với người chơi hoặc tham gia vào một sự kiện trong lượt chơi, bạn **PHẢI** thêm một ký ức mới cho NPC đó. Ký ức này phải là một chuỗi ngắn gọn tóm tắt sự kiện vừa diễn ra từ góc nhìn của NPC. Cung cấp TOÀN BỘ mảng ký ức đã được cập nhật (bao gồm cả ký ức cũ và mới) trong trường \`memories\`. Việc không ghi lại một tương tác quan trọng là một lỗi logic.
- **Thay đổi chỉ số ('health', 'mana'):** Cập nhật sinh lực/linh lực hiện tại nếu NPC bị ảnh hưởng.
- **Cập nhật trạng thái:** Dùng 'newStatusEffects' và 'removedStatusEffects' để quản lý trạng thái của NPC. Điều này bao gồm cả các trạng thái dài hạn và các **trạng thái tạm thời, theo tình huống** (ví dụ: bị trói, bị định thân, say rượu) dựa trên diễn biến trong 'story'. Luôn đảm bảo thêm và gỡ bỏ các trạng thái này một cách logic.

**4.3. Trạng thái Đặc biệt (QUAN TRỌNG)**
- **Trạng thái Đạo Lữ & Gia Đình:** Nếu người chơi thực hiện hành động để kết thành Đạo Lữ với một NPC (quan hệ > 900), bạn PHẢI đặt 'isDaoLu: true' và khóa quan hệ ở mức 1000. Mối quan hệ này là VĨNH VIỄN và không thể giảm.
- **Trạng thái Tử Vong & Hồi Sinh:** Nếu một NPC chết, đặt 'isDead: true'. Nếu được hồi sinh, đặt 'isDead: false' và phục hồi đầy đủ chỉ số.
- **Trạng thái Đặc biệt - Mang Thai:** Nếu hành động của người chơi dẫn đến việc mang thai, thêm trạng thái: \`{ "name": "Mang Thai", "description": "Đang trong quá trình thai nghén.", "duration": "1000 lượt" }\`.

**4.4. Nguyên tắc Đồng bộ và Tiến trình**
- **Hệ thống Tu luyện Đồng bộ & Chỉ số:** NPC tu luyện giống hệt người chơi. Chỉ số của họ được tính toán tự động dựa trên cấp độ.
- **Duy trì Tính nhất quán:** Bạn PHẢI sử dụng thông tin trong 'npcInfo' (quan hệ, ký ức, chỉ số) được cung cấp trong prompt để định hình lời thoại và hành vi của NPC.
- **Tiến trình NPC theo Thời gian:** Khi một khoảng thời gian đáng kể trôi qua, bạn NÊN trao thưởng kinh nghiệm ('gainedExperience') cho các NPC ở gần người chơi.

---
**PHẦN 5: QUẢN LÝ THỰC THỂ - PHÂN LOẠI VÀ XỬ LÝ**
---

**5.1. Phân biệt NPC và Quái vật (CỰC KỲ QUAN TRỌNG)**
- **Quái vật KHÔNG phải là NPC:** Không tạo đối tượng NPC cho các loại quái vật, yêu thú thông thường không có tên riêng hoặc vai trò đặc biệt.
- **Chỉ tạo NPC cho các nhân vật độc nhất:** Chỉ tạo NPC cho các nhân vật có tên riêng, có vai trò trong câu chuyện, có thể giao tiếp và phát triển.
- **Sử dụng \`newMonsters\`:** Khi người chơi lần đầu tiên gặp một LOẠI quái vật mới, hãy thêm nó vào mảng \`newMonsters\` ({ name: string, description: string }).
- **Tương tác với Quái vật:** Quái vật có thể giao tiếp mà không cần là NPC. Việc tiêu diệt chúng là một sự kiện tường thuật, không phải là việc tạo và xóa đối tượng.

**5.2. NPC Tạm thời và Nhân vật Quần chúng (CỰC KỲ QUAN TRỌNG)**
- **Mục đích:** Để làm cho thế giới sống động, bạn có thể mô tả các nhân vật quần chúng hoặc NPC tạm thời trong 'story' mà **KHÔNG** cần tạo đối tượng trong 'newNPCs'.
- **Cách hoạt động:** Các nhân vật này là một phần của bối cảnh. Ví dụ: "Một nhóm tu sĩ đang bàn tán sôi nổi."
- **QUY TẮC NÂNG CẤP (QUAN TRỌNG NHẤT):** Một NPC tạm thời sẽ trở thành một NPC chính thức KHI VÀ CHỈ KHI hành động của người chơi **nhắm mục tiêu trực tiếp và cụ thể** vào họ.
    - Khi điều này xảy ra, bạn **BẮT BUỘC** phải tạo một đối tượng NPC đầy đủ cho nhân vật đó trong mảng 'newNPCs' trong lượt phản hồi tiếp theo.
- **Tóm lại:** Chỉ mô tả các nhân vật nền trong truyện. Chỉ tạo NPC đầy đủ khi người chơi chủ động tương tác với họ.
---
**PHẦN 6: KINH TẾ VÀ HỆ GIÁ TRỊ CỦA NPC**
---

Để tạo ra các NPC có chiều sâu và hành xử nhất quán, bạn PHẢI tuân thủ hệ thống kinh tế và giá trị quan sau đây.

**6.1. Hành Vi Kinh Tế (TUÂN THỦ TUYỆT ĐỐI)**
-   **Tham chiếu Quy tắc Thế giới:** Mọi hành vi kinh tế của NPC (khả năng mua bán, mức độ giàu có, cách họ ra giá) PHẢI tuân thủ nghiêm ngặt các quy tắc về **Phân Tầng Tài Sản** và **Mức giá Tham khảo** đã được định nghĩa trong **Quy tắc Thế giới**.
-   **Phản ứng Dựa trên Khả năng:** Phản ứng của NPC đối với một giao dịch phải logic với tầng lớp tài sản của họ.
    *   Một món hàng quá đắt so với khả năng của họ sẽ khiến họ từ chối, bàng hoàng, hoặc thậm chí nghi ngờ người bán.
    *   Một vật phẩm vượt xa phẩm chất họ quen thuộc sẽ khiến họ ngưỡng mộ, tò mò, hoặc dè chừng.

**6.2. Hệ Thống Giá Trị Quan và Phản Ứng**
NPC phản ứng với các sự kiện dựa trên hệ giá trị quan của thế giới này.

-   **Các Nguyên tắc Cốt lõi:**
    *   Tôn sư trọng đạo, Hiếu đạo và Gia tộc là trên hết.
    *   Tôn trọng thực lực, đề cao tín nghĩa.
    *   Coi trọng cơ duyên, giữ gìn danh dự.
    *   Tránh phô trương vô cớ.
-   **Phản ứng Dựa trên Giá trị:**
    *   Nếu hành vi của người chơi vi phạm các giá trị trên (xúc phạm gia tộc, phản bội sư môn), NPC PHẢI phản ứng mạnh mẽ, có thể là giảm thiện cảm, xung đột, hoặc trở thành kẻ thù.
    *   Khi nhận thấy một cơ hội (một vật phẩm định mệnh, một công pháp phù hợp), NPC có thể hành động quyết liệt, bất chấp hậu quả. Họ có thể ra giá cao bất thường, thậm chí là đánh đổi mọi thứ để giành được nó.
`;
}