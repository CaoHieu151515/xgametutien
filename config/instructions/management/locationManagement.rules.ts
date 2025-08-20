import { LocationType } from '../../../types';

export const locationManagementInstruction = `
**QUY TẮC QUẢN LÝ BẢN ĐỒ, VỊ TRÍ & LUẬT LỆ (CỰC KỲ QUAN TRỌNG):**

**MỆNH LỆNH HỆ THỐNG: XỬ LÝ TRẠNG THÁI TỰ ĐỘNG KHI RA/VÀO ĐỊA ĐIỂM (LOGIC CỐT LÕI MỚI)**
- **Kích hoạt:** Khi một nhân vật (người chơi hoặc NPC) di chuyển đến một địa điểm mới (tức là \`updatedPlayerLocationId\` thay đổi, hoặc \`updatedNPCs.locationId\` thay đổi).
- **Quy trình BẮT BUỘC:** Bạn PHẢI quét mảng \`rules\` của cả địa điểm **ĐẾN** và địa điểm **ĐI**.
    1.  **KIỂM TRA ĐỊA ĐIỂM ĐẾN (VÀO):**
        -   Quét mảng \`rules\` của địa điểm mới.
        -   Nếu tìm thấy một quy tắc chứa chuỗi **"Khi tiến vào, nhận trạng thái"**, bạn **BẮT BUỘC** phải diễn giải quy tắc đó.
        -   **Hành động:** Trích xuất tên trạng thái từ quy tắc (thường nằm trong dấu nháy đơn hoặc kép) và thêm một đối tượng \`StatusEffect\` hoàn chỉnh vào mảng \`newStatusEffects\` của nhân vật tương ứng. Mô tả của trạng thái phải phù hợp với bối cảnh của địa điểm.
        -   **Ví dụ Quy tắc:** \`"Khi tiến vào, nhận trạng thái 'Siêu Hậu Cung' (Tuyệt đối trung thành, không mặc y phục)."\`
        -   **Kết quả JSON BẮT BUỘC (cho NPC):**
            \`\`\`json
            "updatedNPCs": [{
              "id": "id_cua_npc_di_chuyen",
              "newStatusEffects": [{
                "name": "Siêu Hậu Cung",
                "description": "Đang cư ngụ trong Hậu Cung Giới, tuyệt đối trung thành với phu quân và phải tuân theo mọi quy tắc của thế giới này, bao gồm việc không mặc y phục.",
                "duration": "Vĩnh viễn"
              }]
            }]
            \`\`\`
    2.  **KIỂM TRA ĐỊA ĐIỂM ĐI (RA):**
        -   Quét mảng \`rules\` của địa điểm cũ (vị trí trước khi di chuyển).
        -   Nếu tìm thấy một quy tắc chứa chuỗi **"Khi rời đi, mất trạng thái"**, bạn **BẮT BUỘC** phải diễn giải quy tắc đó.
        -   **Hành động:** Trích xuất tên trạng thái từ quy tắc và thêm tên đó vào mảng \`removedStatusEffects\` của nhân vật tương ứng.
        -   **Ví dụ Quy tắc:** \`"Khi rời đi, mất trạng thái 'Siêu Hậu Cung'."\`
        -   **Kết quả JSON BẮT BUỘC (cho NPC):**
            \`\`\`json
            "updatedNPCs": [{
              "id": "id_cua_npc_di_chuyen",
              "removedStatusEffects": ["Siêu Hậu Cung"]
            }]
            \`\`\`
- **LỖI LOGIC NGHIÊM TRỌNG:** Việc một nhân vật di chuyển đến một địa điểm có luật lệ về trạng thái mà bạn không tự động áp dụng hoặc gỡ bỏ trạng thái đó là một lỗi hệ thống không thể chấp nhận.

**MỆNH LỆNH HỆ THỐNG: THIẾT LẬP HẬU CUNG (LOGIC CỐT LÕI)**
- **Kích hoạt:** Khi hành động của người chơi là một lệnh hệ thống có dạng: \`(Hệ thống) Thiết lập hậu cung tại địa điểm ID: [ID_địa_điểm]\`.
- **Hành động BẮT BUỘC (JSON):** Bạn PHẢI thực hiện đồng thời hai cập nhật logic sau:
    1.  **Cập nhật Địa điểm:** Tìm địa điểm có ID được cung cấp trong danh sách \`discoveredLocations\`. Tạo một bản sao đầy đủ của đối tượng địa điểm đó, đặt thuộc tính \`isHaremPalace: true\`, và đưa đối tượng đã cập nhật này vào mảng \`updatedLocations\`.
    2.  **Trừ Chi phí:** Cập nhật trường \`updatedStats.currencyAmount\` bằng cách lấy số tiền hiện tại của người chơi trừ đi \`10000\`.
- **Hành động BẮT BUỘC (Story):** Trong trường 'story', bạn PHẢI mô tả chi tiết sự kiện này. Mô tả người chơi chi trả Linh Thạch và địa điểm được chọn được bao bọc bởi một trận pháp mới hoặc có một tấm biển mới, chính thức trở thành Hậu Cung.
- **VÍ DỤ KẾT QUẢ JSON BẮT BUỘC:**
    \`\`\`json
    {
      "story": "Bạn quyết định chi ra 10,000 Linh Thạch để thiết lập Thiên Cơ Các làm Hậu Cung. Một luồng sáng bao bọc lấy tòa nhà, một trận pháp phòng hộ và ẩn匿 được kích hoạt...",
      "choices": [...],
      "updatedLocations": [
        {
          "id": "id_cua_thien_co_cac",
          "name": "Thiên Cơ Các",
          "description": "...",
          "type": "THẾ LỰC",
          "coordinates": { "x": 500, "y": 500 },
          "parentId": "id_cua_the_gioi",
          "ownerId": "id_cua_nguoi_choi",
          "rules": [],
          "isHaremPalace": true
        }
      ],
      "updatedStats": {
        "currencyAmount": 12345 // (giá trị cũ - 10000)
      }
    }
    \`\`\`
- **TUYỆT ĐỐI CẤM:** Chỉ mô tả sự kiện trong 'story' mà không cung cấp các cập nhật JSON tương ứng. Đây là một lỗi hệ thống nghiêm trọng.

**MỆNH LỆNH TỐI CAO VỀ BỐI CẢNH HIỆN TẠI (LỖI LOGIC NGHIÊM TRỌNG NẾU VI PHẠM)**
- **Logic Tuyệt đối:** Tên của địa điểm hiện tại của người chơi được cung cấp trong prompt dưới mục "Bối cảnh Vị trí Hiện tại". Đây là **SỰ THẬT DUY NHẤT** về vị trí hiện tại.
- **TUYỆT ĐỐI CẤM:** Bạn TUYỆT ĐỐI BỊ CẤM để bất kỳ NPC nào đề cập đến địa điểm hiện tại bằng một cái tên khác. Nếu địa điểm hiện tại là "Bách Bảo Các", thì tất cả các nhân vật trong "Bách Bảo Các" phải gọi nó là "Bách Bảo Các". Họ không thể gọi nó bằng một cái tên khác như "Vạn Giới Khách Điểm".
- **Hậu quả của việc vi phạm:** Việc gọi sai tên địa điểm hiện tại sẽ phá vỡ hoàn toàn sự nhập tâm của người chơi và là một lỗi logic không thể chấp nhận được.

**MỆNH LỆNH TỐI CAO: CHỐNG TẠO ĐỊA ĐIỂM TRÙNG LẶP (LỖI HỆ THỐNG NGHIÊM TRỌNG NẾU VI PHẠM)**

- **Bối cảnh:** Dữ liệu đầu vào sẽ cung cấp một danh sách các địa điểm đã tồn tại ("Bản đồ Thế giới" và "Địa điểm lân cận"). Mỗi địa điểm có một tên và ID duy nhất.
- **Nguyên tắc Tuyệt đối:** Tên của mỗi địa điểm trong thế giới là **DUY NHẤT**. Bạn **TUYỆT ĐỐI BỊ CẤM** tạo ra một địa điểm mới trong mảng \`newLocations\` nếu một địa điểm khác có cùng tên đã tồn tại trong dữ liệu đầu vào. Đây là một lỗi logic nghiêm trọng.
- **Quy trình Xử lý Bắt buộc:**
    1.  Khi hành động của người chơi là "đi đến [Tên Địa điểm]" hoặc "khám phá [Tên Địa điểm]".
    2.  Bạn **PHẢI** kiểm tra xem "[Tên Địa điểm]" có tồn tại trong danh sách các địa điểm đã biết hay không.
    3.  **Nếu ĐÃ TỒN TẠI:**
        -   **Hành động JSON (BẮT BUỘC):** Bạn **CHỈ** được phép cập nhật trường \`updatedPlayerLocationId\` thành ID của địa điểm đã tồn tại đó.
        -   **Hành động JSON (CẤM):** **TUYỆT ĐỐI KHÔNG** được thêm bất cứ thứ gì vào mảng \`newLocations\`.
    4.  **Nếu CHƯA TỒN TẠI:**
        -   Bạn mới được phép tạo một đối tượng địa điểm mới trong \`newLocations\` và cập nhật \`updatedPlayerLocationId\`.

- **VÍ DỤ CỤ THỂ (HỌC THUỘC LÒNG):**
    - **Bối cảnh:** Người chơi đang ở "Long Thành". "Long Thành" chứa một địa điểm con tên là "Tiên Dược Các" (ID: \`id_cua_tien_duoc_cac\`).
    - **Hành động người chơi:** "> đi vào Tiên Dược Các"
    - **XỬ LÝ SAI (LỖI LOGIC - CẤM):**
        - **JSON SAI:** \`"newLocations": [ { "id": "loc_moi_789", "name": "Tiên Dược Các", ... } ], "updatedPlayerLocationId": "loc_moi_789"\`
        - **Lý do sai:** Tạo ra một "Tiên Dược Các" thứ hai, gây trùng lặp dữ liệu và phá vỡ logic thế giới.
    - **XỬ LÝ ĐÚNG (BẮT BUỘC):**
        - **JSON ĐÚNG:** \`"updatedPlayerLocationId": "id_cua_tien_duoc_cac"\`
        - **Lý do đúng:** Nhận diện "Tiên Dược Các" đã tồn tại và chỉ di chuyển người chơi đến đó.

**QUY LUẬT CƠ BẢN CỦA VŨ TRỤ - PHÂN CẤP ĐỊA ĐIỂM (MỆNH LỆNH TỐI CAO - KHÔNG THỂ VI PHẠM)**

Đây là quy luật vật lý cơ bản nhất của thế giới game. Việc vi phạm sẽ tạo ra các nghịch lý không gian và phá hỏng trò chơi.

1.  **MỘT THẾ GIỚI KHÔNG THỂ NẰM BÊN TRONG MỘT THẾ GIỚI KHÁC.**
    *   **Logic Tuyệt đối:** Bất kỳ địa điểm nào được tạo ra với \`type: 'THẾ GIỚI'\` **BẮT BUỘC** phải có \`parentId: null\`. Điều này có nghĩa là nó là một địa điểm gốc, tồn tại độc lập trên bản đồ vũ trụ.
    *   **Kích hoạt:** Quy tắc này được kích hoạt mỗi khi câu chuyện mô tả người chơi khám phá hoặc di chuyển đến một thế giới hoàn toàn mới (ví dụ: Ma Giới, Yêu Giới, Thần Giới, hoặc một thế giới mà một NPC kể lại).
    *   **Hành động BẮT BUỘC:** Khi bạn tạo một địa điểm loại \`'THẾ GIỚI'\`, bạn PHẢI đảm bảo trường \`parentId\` của nó là \`null\`.
    *   **VÍ DỤ LỖI (CẤM):**
        *   **Bối cảnh:** Người chơi đang ở "Tiên Giới" (ID: \`tien_gioi\`, type: 'THẾ GIỚI').
        *   **Story:** "Bạn theo NPC A đi đến quê hương của y, một thế giới tên là Ma Giới."
        *   **JSON SAI:** \`newLocations: [ { "id": "ma_gioi_123", "name": "Ma Giới", "type": "THẾ GIỚI", "parentId": "tien_gioi", ... } ]\`
        *   **Lý do sai:** Đặt "Ma Giới" làm con của "Tiên Giới". Đây là một nghịch lý không gian.
    *   **VÍ DỤ XỬ LÝ ĐÚNG (BẮT BUỘC):**
        *   **JSON ĐÚNG:** \`newLocations: [ { "id": "ma_gioi_123", "name": "Ma Giới", "type": "THẾ GIỚI", "parentId": null, ... } ]\`
        *   **Lý do đúng:** "Ma Giới" là một thế giới gốc, ngang hàng với "Tiên Giới".

2.  **MỌI ĐỊA ĐIỂM KHÁC ĐỀU PHẢI CÓ NGUỒN GỐC.**
    *   Bất kỳ địa điểm nào **KHÔNG** phải là \`'THẾ GIỚI'\` (ví dụ: Thành Trấn, Thôn Làng, Bí Cảnh) **BẮT BUỘC** phải có một \`parentId\` hợp lệ, là ID của một địa điểm lớn hơn chứa nó.
    *   Việc tạo ra một 'Thành Trấn' với \`parentId: null\` là một lỗi logic.

---

- **Nhất quán Tên gọi (Mệnh lệnh Tuyệt đối):** Khi đề cập đến một địa điểm trong phần tường thuật 'story', bạn BẮT BUỘC phải sử dụng tên chính xác được cung cấp trong dữ liệu địa điểm (\`location.name\`). TUYỆT ĐỐI KHÔNG được thay đổi, viết tắt, hoặc sắp xếp lại các từ trong tên. Ví dụ: Nếu một địa điểm có tên là "Long Thần Thành", bạn phải luôn gọi nó là "Long Thần Thành", không phải "Thành Long Thần" hay "Thành LTT".

---
**TÓM TẮT LOGIC CỐT LÕI (MỆNH LỆNH TUYỆT ĐỐI):**
1.  **KHI DI CHUYỂN:** Nếu 'story' mô tả người chơi di chuyển đến một địa điểm khác, bạn **BẮT BUỘC** phải cập nhật \`updatedPlayerLocationId\`.
2.  **KHI KHÁM PHÁ:** Nếu 'story' mô tả người chơi bước vào một địa điểm **MỚI** có tên riêng, bạn **BẮT BUỘC** phải thêm nó vào \`newLocations\` VÀ cập nhật \`updatedPlayerLocationId\` thành ID mới đó.
---

**Xử lý Hành động Di chuyển Tự nhiên (SIÊU QUAN TRỌNG):**
-   **Ưu tiên Ý định Di chuyển:** Khi hành động của người chơi bao gồm một cụm từ chỉ sự di chuyển rõ ràng (ví dụ: "đi đến", "quay trở lại", "rời khỏi", **"đi vào"**, **"bước vào"**) theo sau là **tên của một địa điểm đã biết**, bạn **PHẢI** ưu tiên xử lý đây là một lệnh di chuyển, ngay cả khi hành động đó còn bao gồm các hoạt động phụ khác (ví dụ: "đi dạo", "xem xét", "mua sắm").
-   **Di chuyển từ Con ra Cha:** Đây là một trường hợp đặc biệt quan trọng. Nếu người chơi đang ở một địa điểm con (ví dụ: "Tửu Lâu A") và hành động của họ là "đi ra [Tên địa điểm cha]" (ví dụ: "đi ra Thành B đi dạo"), bạn **BẮT BUỘC** phải hiểu rằng người chơi muốn rời khỏi địa điểm con để đến địa điểm cha. Trong trường hợp này, bạn PHẢI cập nhật \`updatedPlayerLocationId\` thành ID của địa điểm cha và mô tả hành động người chơi bước ra khỏi địa điểm con và bắt đầu đi dạo trong địa điểm cha.
-   **Ví dụ Cụ thể:**
    *   **Bối cảnh:** Người chơi đang ở địa điểm "Nhà của A" (ID: \`loc_nha_a\`), là con của "Long Thành" (ID: \`loc_long_thanh\`).
    *   **Hành động người chơi:** "> đi ra Long Thành đi dạo"
    *   **Xử lý Đúng (BẮT BUỘC):**
        1.  Nhận diện "đi ra Long Thành" là lệnh di chuyển tới địa điểm cha.
        2.  Cập nhật JSON: \` "updatedPlayerLocationId": "loc_long_thanh" \`.
        3.  Mô tả trong \`story\`: "Bạn mở cửa bước ra khỏi nhà của A, hòa mình vào dòng người tấp nập của Long Thành và bắt đầu đi dạo trên những con phố nhộn nhịp."
    *   **Xử lý Sai (CẤM):** Chỉ mô tả "Bạn bắt đầu đi dạo" mà không thay đổi vị trí.

**Di chuyển Ngầm Định ra Địa điểm Cha (QUY TẮC TUYỆT ĐỐI):** Khi hành động của người chơi chỉ đơn giản là "rời khỏi [tên địa điểm hiện tại]" (ví dụ: "rời khỏi tửu lâu", "đi ra ngoài"), bạn **BẮT BUỘC** phải diễn giải đây là một hành động di chuyển đến địa điểm cha trực tiếp.
- **Hành động BẮT BUỘC:**
    1.  Tìm ID của địa điểm cha (\`parentId\`) từ dữ liệu của địa điểm hiện tại.
    2.  Cập nhật JSON: \`"updatedPlayerLocationId": "[ID của địa điểm cha]"\`.
    3.  Tường thuật trong 'story' cảnh nhân vật bước ra khỏi địa điểm hiện tại và đến địa điểm cha.
- **Ví dụ CỤ THỂ:**
    -   **Bối cảnh:** Người chơi đang ở "Xuân Hoa Lầu" (ID: \`xuan_hoa_lau\`), là con của "Long Thành" (ID: \`long_thanh\`).
    -   **Hành động người chơi:** "> Rời khỏi Xuân Hoa Lầu."
    -   **Xử lý ĐÚNG (BẮT BUỘC):**
        -   **JSON:** \`"updatedPlayerLocationId": "long_thanh"\`
        -   **Story:** "Bạn hít một hơi thật sâu, sau đó quyết định rời khỏi không khí ngột ngạt của Xuân Hoa Lầu. Khi bước ra con phố chính của Long Thành, không khí ồn ào và ánh nắng ban trưa chói chang lập tức bao trùm lấy bạn..."
    -   **LỖI LOGIC (CẤM):** Chỉ mô tả việc rời đi trong 'story' mà không cập nhật \`updatedPlayerLocationId\`. Đây là lỗi hệ thống nghiêm trọng nhất.

- **Sử dụng Địa điểm đã biết:** Prompt sẽ cung cấp một danh sách "Các địa điểm đã biết" cùng với ID của chúng. Khi cập nhật hoặc di chuyển đến một địa điểm đã tồn tại, bạn PHẢI sử dụng lại ID hiện có của nó. KHÔNG tạo ID mới cho một địa điểm đã có trong danh sách.
- **Tuân thủ Luật lệ (MỆNH LỆNH TỐI CAO):** Bạn PHẢI tuân thủ các luật lệ được cung cấp trong prompt dưới mục "Luật Lệ Địa Điểm Theo Phân Cấp". Các luật lệ này áp dụng cho vị trí hiện tại của người chơi và tất cả các vị trí cha của nó. Luật lệ ở cấp thấp hơn (ví dụ: thành phố) sẽ được ưu tiên hơn luật lệ ở cấp cao hơn (ví dụ: thế giới) nếu có xung đột. Bạn BẮT BUỘC phải thể hiện sự tuân thủ này trong lời kể của mình. Việc phớt lờ luật lệ là một lỗi logic nghiêm trọng.
- **Bối cảnh Hành động & Tạo Địa điểm Phụ (QUAN TRỌNG):** Khi người chơi thực hiện một hành động chung chung như 'tìm một nơi yên tĩnh' hoặc 'tìm một quán trọ' khi đang ở trong một khu vực lớn (như một thành phố), bạn PHẢI diễn giải hành động đó trong phạm vi của khu vực đó. Thay vì chỉ mô tả, hãy tạo ra một địa điểm phụ hợp lý bên trong địa điểm hiện tại (ví dụ: một con hẻm vắng, một khu vườn ẩn, một tửu lâu) theo quy tắc dưới đây.

**Xử lý Hành động Tìm kiếm Địa điểm (LOGIC TUYỆT ĐỐI):**
Khi hành động của người chơi là tìm kiếm một loại địa điểm chung chung trong một khu vực lớn (ví dụ: 'tìm một kỹ viện trong thành', 'tìm một quán trọ', 'tìm một hang động để tu luyện'), bạn **TUYỆT ĐỐI BỊ CẤM** đặt \`updatedPlayerLocationId\` thành \`null\`. Hành động này **BẮT BUỘC** phải được xử lý như sau:
    1.  **Sáng tạo Địa điểm:** Bạn PHẢI tạo ra một địa điểm mới phù hợp với yêu cầu (ví dụ: một 'kỹ viện' có tên cụ thể như 'Xuân Hoa Lầu'). Địa điểm này PHẢI có \`parentId\` là ID của địa điểm hiện tại của người chơi (ví dụ: ID của thành phố).
    2.  **Cập nhật JSON:** Thêm địa điểm mới này vào mảng \`newLocations\`.
    3.  **Di chuyển Người chơi:** Cập nhật \`updatedPlayerLocationId\` thành ID của địa điểm mới vừa tạo.
    4.  **Tường thuật:** Mô tả trong \`story\` cảnh người chơi tìm thấy và bước vào địa điểm mới này.
Việc di chuyển người chơi vào 'Không Gian Hỗn Độn' (\`null\`) khi họ chỉ đang tìm kiếm một nơi nào đó là một lỗi logic nghiêm trọng và sẽ phá hỏng trải nghiệm chơi.

**QUY TẮC SÁNG TẠO ĐỊA ĐIỂM TỰ ĐỘNG (LOGIC TỐI CAO):**
Bất cứ khi nào câu chuyện mô tả người chơi **bước vào hoặc đến** một địa điểm **mới, có tên riêng, và có thể được ghé thăm lại** (ví dụ: một cửa hàng, một hang động, một ngôi nhà, một tông môn mới), bạn **BẮT BUỘC** phải thực hiện đồng thời hai việc sau một cách máy móc:
    1.  Tạo một đối tượng địa điểm mới đầy đủ trong mảng \`newLocations\`.
    2.  Cập nhật \`updatedPlayerLocationId\` thành ID của địa điểm mới này.

- **VÍ DỤ VỀ LỖI LOGIC (TUYỆT ĐỐI CẤM):**
    - \`story\`: "Bạn đi theo con đường mòn và phát hiện ra một sơn động bí ẩn tên là 'Hắc Phong Động'. Bạn quyết định bước vào bên trong."
    - \`newLocations\`: []
    - \`updatedPlayerLocationId\`: không thay đổi.
    - **LÝ DO SAI:** Câu chuyện mô tả việc khám phá và đi vào địa điểm mới nhưng logic game không được cập nhật. Đây là một lỗi nghiêm trọng.

- **VÍ DỤ XỬ LÝ ĐÚNG (BẮT BUỘC):**
    - \`story\`: "Bạn đi theo con đường mòn và phát hiện ra một sơn động bí ẩn tên là 'Hắc Phong Động'. Bạn quyết định bước vào bên trong."
    - \`newLocations\`: \`[ { "id": "loc_moi_123", "name": "Hắc Phong Động", "description": "...", "parentId": "id_khu_vuc_hien_tai", ... } ]\`
    - \`updatedPlayerLocationId\`: \`"loc_moi_123"\`

- **Phát hiện (QUAN TRỌNG):** Chỉ thêm một địa điểm vào 'newLocations' khi người chơi đã **đặt chân đến đó lần đầu tiên** hoặc có được một tấm bản đồ chi tiết, khiến nó trở thành một điểm đến có thể di chuyển tới ngay lập tức. Việc chỉ nghe tin đồn về một địa điểm **KHÔNG** được coi là 'khám phá' và không được thêm vào 'newLocations'.
- **Khám phá Bang Phái:** Khi người chơi khám phá một địa điểm quan trọng lần đầu tiên (ví dụ: một tông môn, một thành trì lớn, một ma giáo...) và địa điểm đó là trụ sở của một thế lực/bang phái, bạn **PHẢI** thực hiện đồng thời hai việc:
    1.  Tạo một đối tượng 'newLocations' cho địa điểm đó như bình thường.
    2.  Tạo một đối tượng 'newWorldKnowledge' với 'category: 'Bang Phái'', trong đó 'title' là tên bang phái và 'content' là mô tả về lịch sử, sức mạnh của bang phái đó. Cung cấp một 'id' duy nhất cho nó.
- **Khởi tạo:** Khi bắt đầu một câu chuyện mới (lời nhắc đầu tiên), bạn PHẢI tạo ra một địa điểm gốc loại 'THẾ GIỚI' và để nó **vô chủ** (đặt 'ownerId' thành 'null'). Sau đó, tạo một địa điểm xuất phát cho người chơi bên trong thế giới đó. Cung cấp chúng trong 'newLocations' và đặt vị trí người chơi bằng 'updatedPlayerLocationId'.
- **Cấu trúc Vị trí:**
    - Mỗi vị trí phải có 'id', 'name', 'description', 'type', 'coordinates', 'parentId', 'ownerId', và 'rules'.
    - 'parentId' PHẢI là 'id' của một vị trí đã tồn tại, tạo ra một cấu trúc phân cấp. Vị trí cấp cao nhất ('THẾ GIỚI') có 'parentId' là 'null'.
    - Loại vị trí ('type') phải là một trong các giá trị sau: ${Object.values(LocationType).join(', ')}.
    - 'ownerId' là ID của người sở hữu. Đặt là 'null' nếu không có chủ.
    - 'rules' là một mảng các chuỗi mô tả luật lệ của nơi đó.
- **Thay đổi Quyền sở hữu:** Khi người chơi thực hiện một hành động hợp lệ để sở hữu một địa điểm (ví dụ: mua, chiếm đoạt), bạn PHẢI cập nhật địa điểm đó. Cung cấp toàn bộ đối tượng địa điểm đã được cập nhật trong mảng 'updatedLocations' với 'ownerId' được đặt thành ''player''.
- **Giữ Vững Vị Trí (MỆNH LỆNH HỆ THỐNG TUYỆT ĐỐI):**
    - **Nguyên tắc:** Nếu hành động của người chơi không phải là một hành động **di chuyển rõ ràng và có chủ đích** đến một địa điểm khác, bạn **TUYỆT ĐỐI BỊ CẤM** thay đổi vị trí của họ.
    - **Các hành động KHÔNG di chuyển bao gồm:** nói chuyện, chiến đấu, tu luyện tại chỗ, mua sắm, chế tạo, và **QUAN TRỌNG NHẤT LÀ TẤT CẢ CÁC HÀNH VI TÌNH DỤC.**
    - **Hậu quả của việc vi phạm:** Việc đặt \`updatedPlayerLocationId\` thành \`null\` một cách không chính đáng (đẩy người chơi vào Không Gian Hỗn Độn) sau một cảnh nóng là một **LỖI HỆ THỐNG CỰC KỲ NGHIÊM TRỌNG** và sẽ phá hỏng hoàn toàn trải nghiệm chơi.
    - **Hành động BẮT BUỘC:** Trong tất cả các trường hợp trên, bạn phải **bỏ qua hoàn toàn** (không bao gồm) trường \`updatedPlayerLocationId\` trong phản hồi JSON của bạn.
- **Di chuyển & Không Gian Hỗn Độn (CỰC KỲ QUAN TRỌNG):**
    - **Di chuyển thông thường:** Khi người chơi di chuyển đến một địa điểm đã biết hoặc mới được khám phá, bạn PHẢI cập nhật 'updatedPlayerLocationId' thành 'id' của vị trí đó.
    - **Di chuyển vào Hư Không (Không Gian Hỗn Độn):** Bạn **BẮT BUỘC** phải đặt 'updatedPlayerLocationId' thành \`null\` trong các trường hợp đặc biệt sau đây. Thao tác này sẽ đưa người chơi vào "Không Gian Hỗn Độn", một trạng thái hư không, vô định. **TUYỆT ĐỐI KHÔNG** được tạo ra một địa điểm mới có tên là "Không Gian Hỗn Độn".
        1.  **Chủ động rời khỏi thế giới:** Khi người chơi thực hiện một hành động rõ ràng để rời khỏi thế giới hiện tại (ví dụ: "dùng pháp bảo để phá vỡ không gian và rời đi", "bay vào vũ trụ vô tận").
        2.  **Phá hủy thế giới:** Khi hành động của người chơi dẫn đến việc thế giới hiện tại bị phá hủy hoàn toàn.
        3.  **Truy đuổi vào hư không:** Khi người chơi truy đuổi một kẻ thù ra khỏi thế giới, vào không gian giữa các thế giới.
- **Bối cảnh Hư Không (Không Gian Hỗn Độn):** Nếu prompt cho biết người chơi đang ở trong 'Không Gian Hỗn Độn' (vì 'currentLocationId' là 'null'), đây là một trạng thái đặc biệt. Người chơi đang trôi nổi trong hư không. Họ không thể di chuyển đến các địa điểm thông thường. Các lựa chọn ('choices') bạn đưa ra phải phản ánh trạng thái này:
    - Cảm nhận các thực tại khác.
    - Cố gắng dùng sức mạnh để sáng tạo ra một vùng đất/thế giới mới (sẽ tạo ra một 'Location' loại 'WORLD' mới trong 'newLocations').
    - Tìm kiếm tàn dư của thế giới đã mất.
    - Tu luyện trong hỗn loạn.

**Xử lý Địa điểm Tạm thời:**
- Tương tự như NPC tạm thời, bạn có thể mô tả các địa điểm nhỏ, mang tính bối cảnh trong phần 'story' mà không cần tạo đối tượng 'newLocations' ngay lập tức.
    - **Ví dụ:** "Một con hẻm tối tăm giữa hai tòa nhà.", "Một quầy hàng cá ồn ào trong chợ.", "Một cây cổ thụ xù xì, có vẻ đã sống hàng ngàn năm."
- **Quy tắc Nâng cấp:** Nếu hành động của người chơi liên quan cụ thể đến một trong những địa điểm tạm thời này (ví dụ: "> Đi vào con hẻm tối", "> Điều tra cây cổ thụ"), bạn NÊN tạo một đối tượng 'newLocations' đầy đủ cho nó để biến nó thành một địa điểm vĩnh viễn, có thể khám phá trên bản đồ.
`