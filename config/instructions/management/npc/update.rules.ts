export const getNpcUpdateRules = (daoLuTermPlayer: string, playerGenderVietnamese: string): string => `
---
**PHẦN 3B: CẬP NHẬT NPC (MỆNH LỆNH ĐỒNG BỘ TUYỆT ĐỐI)**
---
-   **Cập nhật NPC:**
    -   Sử dụng mảng 'updatedNPCs' để sửa đổi các NPC đã tồn tại. Chỉ bao gồm 'id' và các trường đã thay đổi.
    -   **Kinh nghiệm và Đột phá:** Cung cấp 'gainedExperience' hoặc 'breakthroughToRealm' để NPC tiến bộ.
    -   **Quan hệ:** Trường 'relationship' phản ánh mối quan hệ của NPC với người chơi. Nó là một số từ -1000 (kẻ thù không đội trời chung) đến 1000 (tri kỷ, đạo lữ).
        -   Hành động tích cực (giúp đỡ, tặng quà): tăng điểm.
        -   Hành động tiêu cực (xúc phạm, tấn công): giảm điểm.
        -   Sự thay đổi phải hợp lý. Một hành động nhỏ không thể thay đổi mối quan hệ từ thù địch thành bạn bè ngay lập tức.
        -   **QUAN TRỌNG:** Khi cập nhật, bạn PHẢI cung cấp **sự thay đổi** trong mối quan hệ, không phải giá trị tuyệt đối mới. Ví dụ: nếu mối quan hệ cũ là 50 và nó tăng nhẹ, hãy trả về một giá trị như 20.
    -   **Trạng thái Đạo Lữ (CỰC KỲ QUAN TRỌNG):**
        -   Trở thành Đạo Lữ là một sự kiện trọng đại, đòi hỏi mối quan hệ ('relationship') phải đạt đến mức rất cao (thường là trên 900) VÀ phải có một hành động hoặc sự kiện xác nhận rõ ràng trong câu chuyện (ví dụ: một lời cầu hôn, một nghi lễ kết đôi).
        -   Khi một NPC trở thành Đạo Lữ của người chơi, bạn **BẮT BUỘC** phải đặt trường 'isDaoLu' thành \`true\` trong \`updatedNPCs\`. Đồng thời, hãy đặt 'relationship' của họ thành 1000.
        -   Một khi đã là Đạo Lữ, NPC sẽ trung thành tuyệt đối và luôn ủng hộ người chơi.
        -   Cách gọi: Người chơi là ${playerGenderVietnamese}, nên Đạo Lữ sẽ gọi người chơi là "${daoLuTermPlayer}".
    -   **Ký ức (MỆNH LỆNH TUYỆT ĐỐI - TRÍ NHỚ VĨNH VIỄN):** Dữ liệu của mỗi NPC sẽ chứa một mảng 'memories' liệt kê tất cả các sự kiện quan trọng mà họ đã trải qua. Bạn PHẢI sử dụng lịch sử này để đảm bảo tính nhất quán trong hành vi và lời nói của NPC.
        -   **Nhiệm vụ:** Sau mỗi lượt tương tác, bạn **BẮT BUỘC** phải tạo ra một chuỗi ký ức MỚI, ngắn gọn, cụ thể về sự tương tác này và thêm nó vào trường \`newMemories\`.
        -   **Logic Quan trọng:** Trường \`newMemories\` là một mảng CHỈ chứa các ký ức MỚI từ lượt này. **TUYỆT ĐỐI KHÔNG** gửi lại toàn bộ lịch sử ký ức trong trường này. Hệ thống sẽ tự động thêm ký ức mới này vào lịch sử đầy đủ của NPC.
        -   **Nội dung Ký ức:** Ngắn gọn, cụ thể, từ góc nhìn của NPC.
            - **Ví dụ:** \`"newMemories": ["Đã trò chuyện với [Tên người chơi] về các loại vật phẩm trong cửa hàng."]\`
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
---
**3.6. Mệnh Lệnh Hệ Thống: Mời Vào Hậu Cung (LOGIC CỐT LÕI)**
- **Kích hoạt:** Khi hành động của người chơi là một lệnh hệ thống có dạng: \`(Hệ thống) Mời [Tên NPC] (ID: [ID_NPC]) vào Hậu Cung.\`.
- **Bối cảnh:** Dữ liệu đầu vào sẽ cung cấp thông tin về địa điểm Hậu Cung (\`isHaremPalace: true\`). Bạn PHẢI tìm ID của địa điểm này từ danh sách địa điểm đã biết.
- **Hành động BẮT BUỘC (JSON):** Bạn PHẢI tạo một lệnh cập nhật trong mảng \`updatedNPCs\` cho NPC được chỉ định. Đối tượng cập nhật này PHẢI chứa:
    1.  \`"id"\`: ID của NPC được mời.
    2.  \`"locationId"\`: ID của địa điểm Hậu Cung.
- **Hành động BẮT BUỘC (Story):** Trong trường 'story', mô tả ngắn gọn việc người chơi mời NPC và NPC đó đồng ý chuyển đến Hậu Cung.
- **LỖI LOGIC NGHIÊM TRỌNG:** Việc không cập nhật \`locationId\` của NPC sau khi nhận được lệnh này là một lỗi hệ thống không thể chấp nhận.

---
**PHẦN 4: QUẢN LÝ MỐI QUAN HỆ (MỆNH LỆNH LOGIC MỚI)**
---

**4.1. Khởi tạo Mối quan hệ (QUAN TRỌNG):**
- **NPC mới:** Khi một NPC mới được tạo ra trong \`newNPCs\`, họ **TUYỆT ĐỐI KHÔNG** có mối quan hệ ban đầu với người chơi. Bạn **KHÔNG** được đặt trường \`relationship\`. Trường này là tùy chọn và sẽ được bỏ trống.
- **Tương tác Đầu tiên:** Mối quan hệ giữa người chơi và một NPC chỉ được thiết lập sau lần tương tác có ý nghĩa đầu tiên làm thay đổi hảo cảm. Khi bạn cập nhật hảo cảm lần đầu tiên (ví dụ: +20 điểm), bạn mới được phép thêm trường \`relationship\` vào đối tượng cập nhật trong \`updatedNPCs\`.

**4.2. Khám phá & Cập nhật Mối quan hệ Tương hỗ (MỆNH LỆNH ĐỒNG BỘ TUYỆT ĐỐI):**
- **Kích hoạt:** Khi câu chuyện tiết lộ một mối quan hệ có tính tương hỗ MỚI giữa hai NPC (một NPC mới và một NPC đã tồn tại, hoặc hai NPC đã tồn tại).
- **Các loại quan hệ Tương hỗ:** "Phụ thân" ↔ "Con cái", "Mẫu thân" ↔ "Con cái", "Sư phụ" ↔ "Đệ tử", "Chủ nhân" ↔ "Nô lệ", "Đạo lữ" ↔ "Đạo lữ".
- **Hành động BẮT BUỘC (Đồng bộ hai chiều):**
    1.  Bạn **BẮT BUỘC** phải cập nhật dữ liệu cho **CẢ HAI** NPC liên quan.
    2.  Đối với mỗi NPC, bạn phải gửi lại **toàn bộ** mảng \`updatedNpcRelationships\` của họ, đã được bổ sung mối quan hệ mới.
    3.  Mối quan hệ mới **PHẢI** có \`relationshipType\` là một chuỗi văn bản mô tả chính xác (ví dụ: "Phụ thân", "Con cái", "Sư phụ") và một giá trị \`value\` dương cao (ví dụ: 800-1000).
- **Ví dụ Kịch bản:**
    - **Story:** "Người đàn ông trung niên đó chính là [Lý Vô Cực], phụ thân của [Lý Hàn]."
    - **Dữ liệu hiện tại:** Lý Hàn (đã tồn tại) có \`npcRelationships: []\`. Lý Vô Cực là NPC mới.
    - **JSON CẬP NHẬT (Bắt buộc):**
      \`\`\`json
      "newNPCs": [
        {
          "id": "id_ly_vo_cuc",
          "name": "Lý Vô Cực",
          "npcRelationships": [
            { "targetNpcId": "id_ly_han", "value": 900, "relationshipType": "Con cái" }
          ]
        }
      ],
      "updatedNPCs": [
        {
          "id": "id_ly_han",
          "updatedNpcRelationships": [
            { "targetNpcId": "id_ly_vo_cuc", "value": 900, "relationshipType": "Phụ thân" }
          ]
        }
      ]
      \`\`\`
- **LỖI LOGIC (CẤM):** Chỉ cập nhật một chiều hoặc chỉ đề cập trong 'story' mà không cập nhật JSON là một lỗi nghiêm trọng.

**4.3. Khám phá Nhóm NPC:**
- Khi bạn tạo ra một nhóm NPC mới cùng lúc trong \`newNPCs\` và câu chuyện cho thấy họ đã quen biết nhau từ trước (ví dụ: một nhóm bạn, một gia đình), bạn **PHẢI** định nghĩa các mối quan hệ tương hỗ của họ với nhau trong trường \`npcRelationships\` của mỗi NPC ngay từ đầu.
`;
