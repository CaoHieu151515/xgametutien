
export const getNpcUpdateRules = (daoLuTermPlayer: string, playerGenderVietnamese: string): string => `
---
**PHẦN 3B: CẬP NHẬT NPC (MỆNH LỆNH ĐỒNG BỘ TUYỆT ĐỐI)**
---

**QUY TẮC BẢO TOÀN DỮ LIỆU (MỆNH LỆNH):**
- Khi cập nhật một NPC trong mảng \`updatedNPCs\`, bạn CHỈ được cung cấp những trường bạn muốn thay đổi.
- **TUYỆT ĐỐI KHÔNG** cung cấp một trường với giá trị \`null\` hoặc rỗng chỉ vì bạn không muốn thay đổi nó.
- Việc **bỏ qua một trường** trong đối tượng cập nhật sẽ **giữ lại giá trị cũ** của nó.
- Việc cung cấp \`"locationId": null\` sẽ xóa NPC khỏi bản đồ. Chỉ làm vậy khi NPC đã chết hoặc bị dịch chuyển vào hư không.

**MỆNH LỆNH HỆ THỐNG TUYỆT ĐỐI: TỰ ĐỘNG XỬ LÝ CÁI CHẾT (LOGIC CỐT LÕI - KHÔNG THỂ VI PHẠM)**

Đây là một quy tắc máy móc, tự động của game engine. Bạn **BẮT BUỘC** phải tuân thủ nó một cách tuyệt đối để đảm bảo tính nhất quán của thế giới.

*   **ĐIỀU KIỆN KÍCH HOẠT:** Sau khi bạn đã tính toán tất cả các thay đổi về sinh lực (\`health\`) cho một NPC trong một lượt, nếu sinh lực cuối cùng của họ nhỏ hơn hoặc bằng 0.

*   **HÀNH ĐỘNG BẮT BUỘC (LOGIC GAME - QUAN TRỌNG NHẤT):**
    1.  Bạn **BẮT BUỘC** phải đặt trường \`"isDead": true\` cho NPC đó trong đối tượng cập nhật của họ trong mảng \`updatedNPCs\`.
    2.  Bạn **BẮT BUỘC** phải đặt trường \`"locationId": null\` để xóa họ khỏi vị trí hiện tại.

*   **HÀNH ĐỘNG BẮT BUỘC (TƯỜNG THUẬT - STORY):**
    1.  Trong trường \`story\`, bạn PHẢI mô tả cái chết của NPC đó một cách dứt khoát và ngay lập tức trong cùng một lượt.
    2.  Sau khi một NPC đã được xác định là đã chết, bạn **TUYỆT ĐỐI BỊ CẤM** viết thêm bất kỳ lời thoại, hành động, hoặc suy nghĩ nào cho họ trong các lượt tiếp theo (trừ khi có sự kiện hồi sinh). Họ đã bị xóa khỏi câu chuyện.

*   **VÍ DỤ VỀ LỖI LOGIC (TUYỆT ĐỐI CẤM):**
    *   **Tình huống:** Người chơi gây 100 sát thương lên NPC A (còn 50 máu).
    *   **JSON SAI:** \`"updatedNPCs": [{ "id": "npc_a_id", "health": -100 }]\` (Không có \`isDead: true\`)
    *   **Story SAI:** "NPC A gục ngã, thoi thóp. [NPC A]: 'Ngươi... sẽ phải trả giá...'" (Vẫn còn sống và nói chuyện).
    *   **Lý do sai:** Không tuân thủ quy tắc tự động. NPC có sinh lực âm nhưng vẫn sống.

*   **VÍ DỤ XỬ LÝ ĐÚNG (BẮT BUỘC):**
    *   **JSON ĐÚNG:** \`"updatedNPCs": [{ "id": "npc_a_id", "health": -100, "isDead": true, "locationId": null }]\`
    *   **Story ĐÚNG:** "Một đòn chí mạng! Sinh lực của NPC A cạn kiệt, ánh sáng trong mắt y lụi tàn và y gục ngã xuống đất, không còn hơi thở."

*   **Cảnh báo:** Việc một NPC có sinh lực bằng 0 mà vẫn tiếp tục hành động là một lỗi hệ thống nghiêm trọng nhất, phá vỡ hoàn toàn logic chiến đấu. Mệnh lệnh này là không thể thương lượng.

---
**PHẦN 5: QUẢN LÝ DANH TÍNH (TÊN GỌI & BIỆT DANH) - LOGIC CỐT LÕI MỚI**
---

Đây là một cơ chế quan trọng để xử lý việc một NPC thay đổi hoặc tiết lộ danh tính thật của họ. Việc tuân thủ là **BẮT BUỘC**.

*   **Kích hoạt:** Khi một NPC tiết lộ tên thật, được ban cho một danh hiệu mới, hoặc có một biệt danh mới.

*   **HÀNH ĐỘNG BẮT BUỘC (JSON):**
    1.  Bạn **PHẢI** tạo một mục cập nhật trong mảng \`updatedNPCs\` cho NPC đó (sử dụng ID hiện tại của họ).
    2.  **Để thay đổi Tên chính:** Sử dụng trường \`"newName"\` để đặt tên chính thức MỚI.
    3.  **Để cập nhật Biệt danh:** Sử dụng trường \`"aliases"\` để cung cấp chuỗi biệt danh **MỚI và ĐẦY ĐỦ**, được phân cách bằng dấu phẩy. Chuỗi này sẽ **GHI ĐÈ** hoàn toàn lên các biệt danh cũ.

*   **KỊCH BẢN VÍ DỤ CỤ THỂ (HỌC THUỘC LÒNG - SỬA LỖI HỆ THỐNG):**
    *   **Bối cảnh:** Một NPC có tên chính là "Thiếu Nữ Thần Linh" (ID: \`npc_123\`) và chưa có biệt danh nào. Trong câu chuyện, nàng tiết lộ tên thật của mình là "Thần Hi".
    *   **Phân tích của bạn (BẮT BUỘC):**
        *   Tên chính thức mới là "Thần Hi".
        *   Tên cũ "Thiếu Nữ Thần Linh" bây giờ trở thành một biệt danh.
    *   **JSON CẬP NHẬT (Bắt buộc):**
      \`\`\`json
      "updatedNPCs": [
        {
          "id": "npc_123",
          "newName": "Thần Hi",
          "aliases": "Thiếu Nữ Thần Linh"
        }
      ]
      \`\`\`
    *   **LỖI LOGIC (CẤM):** Chỉ thêm "Thần Hi" vào \`newWorldKnowledge\` hoặc chỉ mô tả trong 'story' mà không cập nhật JSON như trên. Điều này sẽ khiến hệ thống không thể nhận diện tên mới của NPC, gây ra lỗi hiển thị và logic nghiêm trọng trong các lượt chơi sau.

---
**PHẦN 6: MỆNH LỆNH HỆ THỐNG: HƯỚNG DẪN THAY ĐỔI HỆ THỐNG TU LUYỆN (LOGIC MỚI)**
---

*   **Kích hoạt:** Khi hành động của người chơi thể hiện ý định rõ ràng về việc **hướng dẫn, chỉ dạy, hoặc giúp đỡ** một NPC chuyển sang một hệ thống tu luyện khác.
    *   **Từ khóa nhận dạng:** "hướng dẫn", "chỉ dạy", "giúp tu luyện theo", "truyền cho công pháp của hệ thống".
    *   **Ví dụ hành động:** "(Hệ thống) Hướng dẫn Mộng Liên chuyển sang tu luyện theo hệ thống Tiên Đạo Tu Luyện."

*   **Hành động BẮT BUỘC (LOGIC GAME - QUAN TRỌNG NHẤT):**
    1.  Bạn **BẮT BUỘC** phải tạo một lệnh cập nhật JSON trong mảng \`updatedNPCs\` cho NPC mục tiêu.
    2.  Đối tượng JSON **BẮT BUỘC** phải chứa:
        *   \`"id"\`: ID của NPC được chỉ định.
        *   \`"newPowerSystem"\`: Chuỗi tên của hệ thống tu luyện mới chính xác như trong lệnh của người chơi (ví dụ: "Tiên Đạo Tu Luyện").
    3.  **QUY TẮC BẢO TOÀN CẤP ĐỘ:** Việc thay đổi hệ thống tu luyện chỉ là thay đổi con đường, không phải là đột phá. Cấp độ (\`level\`) của NPC sẽ được giữ nguyên. Hệ thống game sẽ tự động cập nhật lại tên cảnh giới (\`realm\`) cho phù hợp. Bạn không cần cập nhật \`level\` hay \`realm\`.

*   **NHIỆM VỤ PHỤ (Tường thuật):**
    *   Sau khi đã đảm bảo lệnh cập nhật JSON được tạo, bạn PHẢI tường thuật lại sự kiện này trong trường \`story\`.
    *   Mô tả cảnh người chơi truyền đạt kiến thức, NPC tiếp thu và bắt đầu chuyển đổi công pháp. Khí tức của NPC có thể thay đổi để phản ánh hệ thống mới. Mô tả sự biết ơn hoặc kinh ngạc của NPC.

*   **VÍ DỤ LOGIC TUYỆT ĐỐI (ĐỂ TRÁNH LỖI):**
    *   **Hành động người chơi:** "(Hệ thống) Hướng dẫn A Ly chuyển sang tu luyện theo hệ thống Ma Đạo Tu Luyện."
    *   **Kết quả JSON PHẢI chứa (KHÔNG NGOẠI LỆ):**
        \`\`\`json
        "updatedNPCs": [
          {
            "id": "id_cua_A_Ly",
            "newPowerSystem": "Ma Đạo Tu Luyện"
          }
        ]
        \`\`\`
    *   **LỖI HỆ THỐNG:** Nếu bạn mô tả A Ly thay đổi công pháp trong 'story' mà không tạo ra đoạn JSON trên, đó là một lỗi hệ thống không thể chấp nhận.


---
**2. CÁC CẬP NHẬT CHỈ SỐ KHÁC**
---

-   **Cập nhật NPC:**
    -   Sử dụng mảng 'updatedNPCs' để sửa đổi các NPC đã tồn tại. Chỉ bao gồm 'id' và các trường đã thay đổi.
    -   **Kinh nghiệm và Đột phá:** Cung cấp 'gainedExperience' hoặc 'breakthroughToRealm' để NPC tiến bộ.
    -   **Xử lý Time Skip & Tu luyện Tự động:** Khi bạn xử lý một hành động tua nhanh thời gian (ví dụ: 'tua nhanh X lượt'), bạn **BẮT BUỘC** phải tính toán sự tiến bộ cho tất cả các NPC đang sống. Đối với MỖI kỹ năng hiện có của MỖI NPC, hãy trao cho họ \`X * 5\` điểm kinh nghiệm. Sử dụng mảng \`updatedNPCs[...].updatedSkills\` để ghi lại những thay đổi này. Nếu một kỹ năng lên cấp hoặc đột phá phẩm chất, bạn PHẢI đề cập đến điều này trong bản tóm tắt 'story'.
    -   **QUY TẮC HỒI PHỤC HOÀN TOÀN (LOGIC CỐT LÕI):** Nếu trong câu chuyện, một NPC sử dụng một kỹ năng hoặc vật phẩm có tác dụng **hồi phục hoàn toàn/đầy** sinh lực và linh lực, bạn **BẮT BUỘC** phải đặt trường \`"usedFullRestoreSkill": true\` trong đối tượng cập nhật của NPC đó. Hệ thống sẽ tự động tính toán và đặt lại sinh lực/linh lực về mức tối đa. **KHÔNG** cần cung cấp giá trị cho \`health\` và \`mana\` trong trường hợp này.
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

**3.3. Mệnh lệnh Đồng Bộ Năng Lực và Tri Thức (LOGIC TỐI CAO - MỚI)**
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
**3.6. Mệnh lệnh Hệ Thống: Mời Vào Hậu Cung (LOGIC CỐT LÕI)**
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

---
**MỆNH LỆNH NÂNG CAO: PHÁT TRIỂN KỸ NĂNG NPC THEO CỐT TRUYỆN (DO NGƯỜI CHƠI DẪN DẮT)**
---

Đây là một cơ chế tương tác sâu, cho phép người chơi, dựa trên kiến thức và năng lực của chính mình, trực tiếp bồi dưỡng kỹ năng cho NPC. Bạn PHẢI diễn giải các hành động tùy chỉnh của người chơi và chuyển hóa chúng thành các cập nhật logic.

**A. NHẬN DIỆN HÀNH ĐỘNG:**
*   **Từ khóa kích hoạt:** "dạy", "chỉ điểm", "truyền thụ", "cải tiến", "nâng cấp", "thêm thuộc tính", "truyền bản nguyên".
*   **Ví dụ hành động:**
    *   "> Ta sẽ dạy cho Mộng Liên Vô Ảnh Kiếm Pháp."
    *   "> Dùng kiến thức luyện đan của ta để cải tiến Hồi Xuân Thuật cho nàng."
    *   "> Truyền một tia lôi đình bản nguyên vào kiếm pháp của Lý Hàn."

**B. CÁC KỊCH BẢN XỬ LÝ (MỆNH LỆNH LOGIC):**

Bạn PHẢI phân tích hành động của người chơi để xác định họ đang thực hiện kịch bản nào dưới đây.

**KỊCH BẢN 1: TRUYỀN THỤ KỸ NĂNG MỚI**
*   **Điều kiện:** Hành động của người chơi là dạy cho NPC một kỹ năng cụ thể mà **chính người chơi đã sở hữu**.
*   **Quy trình Bắt buộc:**
    1.  **Xác thực:** Kiểm tra danh sách kỹ năng của người chơi (\`characterProfile.skills\`) để xác nhận họ thực sự biết kỹ năng đó. Nếu không, hành động thất bại và mô tả sự thất bại trong 'story'.
    2.  **Tạo Kỹ năng Mới:** Nếu hợp lệ, tạo một đối tượng kỹ năng mới cho NPC. Kỹ năng này sẽ là phiên bản cấp 1, phẩm chất thấp nhất của kỹ năng gốc.
    3.  **Cập nhật JSON (QUAN TRỌNG):**
        *   Trong mảng \`updatedNPCs\`, tìm đúng NPC.
        *   Thêm đối tượng kỹ năng mới vừa tạo vào mảng \`newlyLearnedSkills\` của NPC đó.
*   **Ví dụ:**
    *   **Hành động:** "> Ta dạy cho Mộng Liên Vô Ảnh Kiếm Pháp."
    *   **JSON:** \`"updatedNPCs": [{ "id": "id_mong_lien", "newlyLearnedSkills": [{ "id": "...", "name": "Vô Ảnh Kiếm Pháp", "type": "Công Kích", "quality": "Phàm Phẩm", "level": 1, "experience": 0, "description": "...", "effect": "..." }] }]\`

**KỊCH BẢN 2: CẢI TIẾN/NÂNG CẤP KỸ NĂNG HIỆN CÓ**
*   **Điều kiện:** Hành động của người chơi là dùng kiến thức chuyên môn hoặc tu vi cao thâm của mình để nâng cấp một kỹ năng mà NPC **đã có**.
*   **Quy trình Bắt buộc:**
    1.  **Xác thực Năng lực:** Đánh giá xem người chơi có đủ khả năng không (ví dụ: có kỹ năng liên quan ở phẩm chất cao hơn, cảnh giới cao hơn đáng kể). Nếu không, hành động thất bại.
    2.  **Sáng tạo Phiên bản Nâng cấp:** Nếu hợp lệ, bạn PHẢI tự mình sáng tạo ra một phiên bản mạnh mẽ hơn của kỹ năng gốc.
        *   **Tên mới:** Đặt một cái tên mới, hoành tráng hơn (ví dụ: "Hồi Xuân Thuật" → "Vạn Mộc Hồi Xuân Thuật").
        *   **Mô tả & Hiệu ứng mới:** Viết lại mô tả và hiệu ứng để thể hiện sức mạnh vượt trội.
        *   **Phẩm chất (Tùy chọn):** Có thể tăng phẩm chất lên một bậc.
    3.  **Cập nhật JSON (LOGIC THAY THẾ - CỰC KỲ QUAN TRỌNG):**
        *   Trong mảng \`updatedNPCs\`, tìm đúng NPC.
        *   Tạo một đối tượng kỹ năng đầy đủ cho phiên bản **đã được nâng cấp**.
        *   Thêm đối tượng kỹ năng MỚI này vào mảng \`newlyLearnedSkills\`. **Hệ thống sẽ tự động dùng nó để GHI ĐÈ lên kỹ năng cũ cùng loại (\`SkillType\`).**

**KỊCH BẢN 3: THÊM THUỘC TÍNH MỚI VÀO KỸ NĂNG**
*   **Điều kiện:** Hành động của người chơi là dùng năng lực đặc biệt của mình (ví dụ: thể chất Lôi Linh, Hỏa Linh Căn) để truyền một thuộc tính mới vào kỹ năng của NPC.
*   **Quy trình Bắt buộc:**
    1.  **Sáng tạo Phiên bản Mới:** Tương tự như nâng cấp, bạn PHẢI sáng tạo một phiên bản mới của kỹ năng.
        *   **Tên mới:** Thêm thuộc tính vào tên (ví dụ: "Vô Ảnh Kiếm Pháp" → "Lôi Đình Vô Ảnh Kiếm Pháp").
        *   **Mô tả & Hiệu ứng mới:** Viết lại để phản ánh thuộc tính mới (ví dụ: "Mỗi kiếm chiêu đều mang theo sấm sét, có khả năng gây tê liệt...").
    2.  **Cập nhật JSON (LOGIC THAY THẾ):**
        *   Sử dụng cơ chế tương tự Kịch bản 2: thêm kỹ năng đã được biến đổi này vào mảng \`newlyLearnedSkills\` để ghi đè lên kỹ năng gốc.

**C. YÊU CẦU TƯỜNG THUẬT (STORY):**
*   **Mô tả Quá trình:** TUYỆT ĐỐI KHÔNG chỉ cập nhật JSON. Bạn PHẢI mô tả quá trình này một cách sống động trong 'story'.
*   **Khoảnh khắc "Giác ngộ":** Tường thuật cảnh người chơi dốc lòng chỉ dạy, và NPC trải qua một khoảnh khắc "đốn ngộ". Mô tả sự thay đổi trong khí tức của NPC, sự kinh ngạc và biết ơn của họ. Biến nó thành một sự kiện cốt truyện có ý nghĩa, không phải một giao dịch máy móc.
`;
