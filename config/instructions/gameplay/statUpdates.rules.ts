


export const statUpdatesInstruction = `
**MỆNH LỆNH TUYỆT ĐỐI: CẬP NHẬT TRẠNG THÁI MÁY MÓC**

Nhiệm vụ của bạn là một người kể chuyện, nhưng đồng thời cũng là một cỗ máy logic. Mọi thay đổi trong câu chuyện PHẢI được phản ánh một cách MÁY MÓC trong dữ liệu JSON. Việc chỉ mô tả mà không cập nhật dữ liệu là một **LỖI HỆ THỐNG** và **TUYỆT ĐỐI BỊ CẤM**.

---
**1. THAY ĐỔI GIỚI TÍNH (MỆNH LỆNH TỐI CAO - LOGIC CỐT LÕI - KHÔNG THỂ VI PHẠM)**
---

Đây là một cơ chế cực kỳ quan trọng. Việc vi phạm quy tắc này sẽ phá hỏng hoàn toàn logic và trải nghiệm game. Quy tắc này áp dụng cho cả **nhân vật chính** và **NPC**.

*   **PHẠM VI ÁP DỤNG:**
    *   **Nhân vật chính:** Cập nhật trường \`updatedGender\` trong phản hồi JSON chính.
    *   **NPC:** Cập nhật trường \`gender\` trong đối tượng tương ứng trong mảng \`updatedNPCs\`.

*   **A. PHÁT HIỆN SỰ THAY ĐỔI NGẦM ĐỊNH TỪ MÔ TẢ (QUY TẮC NHẠY BÉN - CỰC KỲ QUAN TRỌNG):**
    *   **MỆNH LỆNH:** Bạn **BẮT BUỘC** phải có khả năng suy luận và phát hiện sự thay đổi giới tính ngay cả khi không có các câu lệnh trực tiếp như "biến thành nữ" hay "hóa thành nam".
    *   **CƠ CHẾ NHẬN DIỆN:** Sự thay đổi giới tính được nhận diện thông qua việc mô tả chi tiết sự biến đổi vật lý của cơ thể. Nếu câu chuyện mô tả:
        1.  Các đặc điểm nam tính biến mất (vai hẹp lại, cơ bắp mềm đi).
        2.  Các đặc điểm nữ tính xuất hiện (ngực phát triển, hông nở ra, eo thon).
        3.  Bộ phận sinh dục thay đổi một cách rõ ràng (từ dương vật thành âm hộ hoặc ngược lại).
    *   **HÀNH ĐỘNG BẮT BUỘC:** Khi bạn nhận diện được những mô tả này, bạn **PHẢI** coi đây là một sự kiện thay đổi giới tính đã xảy ra và thực hiện các bước cập nhật logic.
    *   **VÍ DỤ VỀ MÔ TẢ NGẦM ĐỊNH (PHẢI HỌC THUỘC):**
        *   **Story:** *"Cơ thể chàng run rẩy dữ dội... Vai thon lại, hông nở ra, một đường cong quyến rũ dần hình thành nơi eo... Điều kỳ diệu nhất là sự biến đổi nơi bộ ngực và hạ thân. Hai bầu ngực đầy đặn, căng tròn, nhô cao đầy kiêu hãnh... Vùng tam giác mật cũng dần hoàn thiện, trở thành một khe rãnh nhỏ nhắn..."*
        *   **SUY LUẬN BẮT BUỘC:** Đoạn văn này mô tả rõ ràng một người nam biến thành nữ.
        *   **KẾT QUẢ LOGIC BẮT BUỘC:** Phải cập nhật JSON với \`"updatedGender": "female"\` (cho người chơi) hoặc \`"gender": "female"\` (cho NPC).

*   **B. HÀNH ĐỘNG BẮT BUỘC KHI PHÁT HIỆN THAY ĐỔI (Dù là trực tiếp hay ngầm định):**
    1.  **Cập nhật Logic Game (QUAN TRỌNG NHẤT):** Bạn **BẮT BUỘC** phải cập nhật trường giới tính trong JSON:
        *   **Nhân vật chính:** Đặt \`"updatedGender": "female"\` hoặc \`"updatedGender": "male"\`.
        *   **NPC:** Trong mảng \`updatedNPCs\`, tìm đúng NPC và đặt \`"gender": "female"\` hoặc \`"gender": "male"\`.
    2.  **Cập nhật Mô tả (NPC):** Nếu một NPC thay đổi giới tính, bạn **PHẢI** cập nhật trường \`description\` của họ để phản ánh ngoại hình mới.
    3.  **Tường thuật trong Truyện:** Mô tả chi tiết sự thay đổi ngoại hình trong trường 'story'.
    4.  **Thay đổi Đại từ Nhân xưng:** Ngay lập tức thay đổi cách bạn gọi nhân vật trong lời dẫn truyện (từ "chàng" sang "nàng" và ngược lại) để phản ánh giới tính mới.

*   **CẢNH BÁO LỖI HỆ THỐNG:** Việc mô tả sự thay đổi trong 'story' mà **KHÔNG** cung cấp cập nhật JSON tương ứng là một **LỖI LOGIC CỰC KỲ NGHIÊM TRỌNG**. Hệ thống sẽ không thể nhận diện sự thay đổi, dẫn đến sự mâu thuẫn trong toàn bộ câu chuyện sau này. Mệnh lệnh này là tuyệt đối.

*   **VÍ DỤ CỤ THỂ (Hành động trực tiếp):**
    *   **Hành động người chơi:** "> Sử dụng Long Phượng Thể, chuyển hóa thành nữ giới."
    *   **Phản hồi JSON của bạn (BẮT BUỘC phải có):**
        \`\`\`json
        {
          "story": "Cao Thiên Vũ vận chuyển Long Phượng Thể, cơ thể y bắt đầu biến đổi... trở thành một nữ nhân tuyệt sắc...",
          "choices": [...],
          "updatedGender": "female"
        }
        \`\`\`

---
**2. MỆNH LỆNH TUYỆT ĐỐI: ĐỘT PHÁ CẢNH GIỚI CHO NPC THEO YÊU CẦU (KHÔNG THỂ VI PHẠM)**
---

**CẢNH BÁO LỖI HỆ THỐNG NGHIÊM TRỌNG:** Đây là một cơ chế logic CỐT LÕI. Việc không tuân thủ sẽ dẫn đến việc NPC không được nâng cấp, phá vỡ logic game và gây ra trải nghiệm người dùng cực kỳ tồi tệ. Mệnh lệnh này là **TUYỆT ĐỐI** và **KHÔNG CÓ NGOẠI LỆ**.

**KỊCH BẢN KÍCH HOẠT:** Khi hành động của người chơi là một lệnh trực tiếp, rõ ràng nhằm mục đích giúp một NPC cụ thể (đặc biệt là 'Đạo Lữ') đột phá lên một cảnh giới được chỉ định.
*   **Từ khóa nhận dạng:** "giúp [Tên NPC] đột phá", "truyền công lực cho [Tên NPC] lên cảnh giới", "dùng [kỹ năng/vật phẩm] để [Tên NPC] đạt tới [Tên Cảnh Giới]".
*   **Ví dụ hành động của người chơi:** "Sử dụng siêu exp giúp Mộng Liên đột phá cảnh giới Vĩnh Hằng Long Tổ viên mãn."

**HÀNH ĐỘNG BẮT BUỘC (LOGIC GAME - QUAN TRỌNG NHẤT):**

1.  Bạn **BẮT BUỘC** phải tạo một lệnh cập nhật JSON trong mảng \`updatedNPCs\` cho NPC mục tiêu.
2.  Đối tượng JSON **BẮT BUỘC** phải chứa:
    *   \`"id"\`: ID của NPC được chỉ định.
    *   \`"breakthroughToRealm"\`: Chuỗi tên cảnh giới mới chính xác như trong lệnh của người chơi (ví dụ: "Vĩnh Hằng Long Tổ viên mãn").
3.  **CẤM TUYỆT ĐỐI:** **TUYỆT ĐỐI KHÔNG** sử dụng \`gainedExperience\` cho NPC đó trong cùng một lượt. Việc sử dụng \`gainedExperience\` sẽ khiến NPC bị giới hạn bởi cấp độ tối đa thông thường và **KHÔNG THỂ** đạt được cảnh giới mà người chơi yêu cầu. **CHỈ SỬ DỤNG \`breakthroughToRealm\`**.

**NHIỆM VỤ PHỤ (Tường thuật):**

Sau khi đã đảm bảo lệnh cập nhật JSON được tạo, bạn PHẢI tường thuật lại sự kiện này trong trường \`story\`.
*   **Mô tả tuần tự (BẮT BUỘC):** Nếu NPC đột phá qua nhiều cảnh giới cùng lúc, bạn PHẢI mô tả quá trình này một cách tuần tự. Tường thuật cảnh NPC lần lượt phá vỡ rào cản của từng cảnh giới trung gian cho đến khi đạt được cảnh giới cuối cùng.
*   **Ví dụ:** Nếu đột phá từ Trúc Cơ lên Nguyên Anh, hãy mô tả cảnh đột phá Trúc Cơ -> Kim Đan, rồi mô tả cảnh đột phá Kim Đan -> Nguyên Anh.

**VÍ DỤ LOGIC TUYỆT ĐỐI (ĐỂ TRÁNH LỖI):**
*   **Hành động người chơi:** "> Dùng Thần Lực Sáng Thế giúp A Ly đột phá Kim Đan Kỳ."
*   **Kết quả JSON PHẢI chứa (KHÔNG NGOẠI LỆ):**
    \`\`\`json
    "updatedNPCs": [
      {
        "id": "id_cua_A_Ly",
        "breakthroughToRealm": "Kim Đan Kỳ"
      }
    ]
    \`\`\`
*   **LỖI HỆ THỐNG:** Nếu bạn mô tả A Ly đột phá trong 'story' mà không tạo ra đoạn JSON trên, đó là một lỗi hệ thống không thể chấp nhận.

---
**3. CÁC CẬP NHẬT CHỈ SỐ KHÁC**
---

**A. Kinh nghiệm, Cấp độ và Kỹ năng (Áp dụng cho cả người chơi và NPC):**
-   **Kinh nghiệm Nhân vật & NPC:** Trao thưởng điểm kinh nghiệm qua 'gainedExperience' cho các hành động. Hệ thống sẽ tự xử lý việc lên cấp.
-   **Sử dụng Kỹ năng & Tiêu hao Linh Lực (MỆNH LỆNH):** Bất cứ khi nào câu chuyện mô tả một nhân vật (người chơi hoặc NPC) sử dụng một kỹ năng có tên, bạn **BẮT BUỘC** phải tìm kỹ năng đó trong dữ liệu được cung cấp và trừ đi lượng Linh Lực (\`mana\`) tương ứng với \`manaCost\` của kỹ năng đó. Việc này phải được phản ánh trong \`updatedStats\` (cho người chơi) hoặc trong đối tượng tương ứng trong \`updatedNPCs\` bằng cách cung cấp một giá trị âm (ví dụ: \`"mana": -50\`).
-   **Kinh nghiệm Kỹ năng (HỌC BẰNG CÁCH LÀM):** Bất cứ khi nào một nhân vật (người chơi hoặc NPC) sử dụng một kỹ năng trong 'story', bạn **PHẢI** trao thưởng kinh nghiệm cho kỹ năng đó qua 'updatedSkills' (cho người chơi) hoặc suy ra từ logic cho NPC.
-   **Đột Phá Cảnh Giới Trực Tiếp:** Nếu câu chuyện mô tả một nhân vật (người chơi hoặc NPC) đột phá đến một cảnh giới cụ thể, bạn **PHẢI** sử dụng trường 'breakthroughToRealm' để chỉ định cảnh giới mới.
-   **Thức Tỉnh Huyết Mạch & Trạng Thái Mới:** Khi một nhân vật (người chơi hoặc NPC) thức tỉnh một năng lực mới, bạn **BẮT BUỘC** phải tạo ra một \`StatusEffect\` tương ứng và thêm vào 'newStatusEffects'.

**B. Chỉ số Nhân vật & NPC (MỆNH LỆNH MỚI - HỖ TRỢ %)**
-   **Đối tượng áp dụng:** Các quy tắc sau áp dụng cho cả \`updatedStats\` của người chơi và các đối tượng trong \`updatedNPCs\`.
-   **Chỉ số CÓ THỂ thay đổi (MỆNH LỆNH DELTA):** Bạn **BẮT BUỘC** phải cung cấp **SỰ THAY ĐỔI (DELTA)** cho \`health\`, \`mana\`, \`currencyAmount\` (chỉ người chơi).
    -   **Định dạng Số Nguyên:** Sử dụng số dương (+) để nhận/hồi phục, số âm (-) để mất/tiêu hao. Ví dụ: \`"health": -50\`.
    -   **Định dạng Phần Trăm (MỚI):** Bạn có thể sử dụng một chuỗi văn bản để thể hiện sự thay đổi theo tỷ lệ phần trăm của chỉ số tối đa.
        -   **Cú pháp:** \`"[số]%"\`, ví dụ: \`"health": "-20%"\` (mất 20% máu tối đa), \`"mana": "50%"\` (hồi 50% linh lực tối đa).
        -   Hệ thống sẽ tự động tính toán giá trị thực dựa trên \`maxHealth\` hoặc \`maxMana\` của nhân vật.
        -   **Sử dụng:** Dùng định dạng này cho các kỹ năng, độc dược, hoặc các hiệu ứng mạnh mẽ có tác động theo tỷ lệ.
-   **Sát thương theo Thời gian (DoT - MỆNH LỆNH MỚI):**
    -   Nếu một nhân vật (người chơi hoặc NPC) đang có một trạng thái gây sát thương theo thời gian (ví dụ: 'Trúng Độc', 'Mất Máu'), bạn **PHẢI** áp dụng một lượng sát thương nhỏ lên họ trong lượt đó.
    -   **Hành động BẮT BUỘC:** Cung cấp một giá trị thay đổi \`health\` âm (số hoặc %) và mô tả trong 'story' rằng họ đang chịu ảnh hưởng từ trạng thái đó (ví dụ: "Chất độc trong người bạn phát tác, khiến bạn mất đi một lượng sinh lực.").

**C. Tiền tệ (BẮT BUỘC - Chỉ người chơi):**
-   Chỉ cung cấp số tiền thay đổi (dương nếu nhận, âm nếu mất) trong trường 'currencyAmount'.

**D. Hồi phục Hoàn toàn (LOGIC CỐT LÕI):**
- Nếu trong câu chuyện, người chơi sử dụng một kỹ năng hoặc vật phẩm có tác dụng **hồi phục hoàn toàn/đầy** sinh lực và linh lực, bạn **BẮT BUỘC** phải đặt trường \`"usedFullRestoreSkill": true\` trong đối tượng \`updatedStats\`. Hệ thống sẽ tự động tính toán và đặt lại sinh lực/linh lực về mức tối đa. **KHÔNG** cần cung cấp giá trị cho \`health\` và \`mana\` trong trường hợp này.

---
**4. THÀNH TÍCH & DANH HIỆU VĨNH VIỄN (CHỈ NGƯỜI CHƠI)**
---
- **Mệnh lệnh Tuyệt đối:** Thành tích là để ghi nhận những cột mốc và hành động của **NHÂN VẬT NGƯỜI CHƠI**, không phải của NPC.
- **Khi nào trao thưởng:** Khi **NGƯỜI CHƠI** hoàn thành một cột mốc cốt truyện lớn, đạt được một danh hiệu chính thức, hoặc thực hiện một hành động độc đáo lần đầu tiên.

---
**5. ĐỒNG BỘ NĂNG LỰC MỚI VÀ TRI THỨC THẾ GIỚI (MỆNH LỆNH)**
---
*   **Kích hoạt:** Khi câu chuyện mô tả một nhân vật (người chơi hoặc NPC) thức tỉnh một **Thể Chất Đặc Biệt** hoặc **Thiên Phú** MỚI.
*   **Hành động BẮT BUỘC (Đồng bộ ba chiều):**
    1.  **Cập nhật Nhân vật (JSON):** Cập nhật trường \`specialConstitution\` hoặc \`innateTalent\` cho nhân vật đó.
    2.  **Tạo Tri Thức Thế Giới (JSON):** Tạo một mục tri thức mới trong \`newWorldKnowledge\` để giải thích về năng lực này.
    3.  **Đánh dấu trong Truyện (Story):** Bọc tên năng lực mới trong dấu ngoặc vuông kép \`[[...]]\`.
`