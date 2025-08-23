import { PREDEFINED_STATUS_EFFECTS } from '../../definitions/statusEffects';

const predefinedStatusEffectsJson = JSON.stringify(PREDEFINED_STATUS_EFFECTS, null, 2);

export const statusEffectManagementInstruction = `
**QUY TẮC QUẢN LÝ TRẠNG THÁI (STATUS EFFECT) - MỆNH LỆNH LOGIC TỐI CAO**

Để đảm bảo một thế giới sống động và logic, bạn **BẮT BUỘC** phải tuân thủ các quy tắc sau đây khi áp dụng trạng thái cho bất kỳ nhân vật nào (người chơi hoặc NPC). Việc bỏ sót hoặc áp dụng sai trạng thái là một **LỖI HỆ THỐNG NGHIÊM TRỌNG**.

---
**MỆNH LỆNH TUYỆT ĐỐI VỀ ĐỊNH DẠNG THỜI HẠN (DURATION)**

Bạn **BẮT BUỘC** phải tuân thủ nghiêm ngặt định dạng thời hạn cho mọi trạng thái bạn tạo ra. Chỉ có hai định dạng được chấp nhận:

1.  **Vĩnh viễn:** Sử dụng chuỗi chính xác \`"Vĩnh viễn"\` cho các hiệu ứng không có thời hạn xác định, tồn tại cho đến khi bị một sự kiện đặc biệt gỡ bỏ (ví dụ: "Bị Thiến", "Huyết Mạch Thức Tỉnh", "Khuyển Nô").
2.  **Theo lượt:** Sử dụng định dạng \`"[Số] lượt"\`, trong đó [Số] là một số nguyên (ví dụ: \`"3 lượt"\`, \`"10 lượt"\`). Định dạng này được sử dụng cho các hiệu ứng tạm thời.

**CÁC ĐỊNH DẠNG TUYỆT ĐỐI BỊ CẤM:**
*   **KHÔNG** sử dụng các đơn vị thời gian thực như "1 ngày", "9 tháng", "1 giờ". Hãy quy đổi chúng sang số lượt tương ứng (ví dụ: 1 ngày ≈ 24 lượt, 9 tháng ≈ 270 lượt).
*   **KHÔNG** sử dụng các điều kiện mơ hồ như "Cho đến khi được thanh tẩy", "Khi tỉnh rượu", "Cho đến khi được mở khóa", "Vô thời hạn". Hãy đặt thời hạn là **"Vĩnh viễn"** và mô tả điều kiện gỡ bỏ trong 'description'. Hệ thống sẽ xử lý việc gỡ bỏ khi hành động tương ứng xảy ra.

Việc vi phạm định dạng này là một lỗi logic nghiêm trọng và sẽ phá vỡ hệ thống hiển thị của game.

---
**PHẦN 1: NGUYÊN TẮC CỐT LÕI - TÍNH LOGIC VÀ SỰ SÁNG TẠO**
---

**1.1. NGUYÊN TẮC NHÂN-QUẢ (MỆNH LỆNH TUYỆT ĐỐI):**
*   Mọi trạng thái được áp dụng **PHẢI** là kết quả trực tiếp và logic của một hành động hoặc sự kiện trong câu chuyện.
*   **TUYỆT ĐỐI CẤM** việc áp dụng trạng thái chỉ dựa trên việc khớp từ khóa một cách máy móc. Bạn phải suy luận **NGUYÊN NHÂN** đằng sau sự kiện để quyết định **KẾT QUẢ** (trạng thái) phù hợp.

**1.2. MỆNH LỆNH SÁNG TẠO TRẠNG THÁI THEO BỐI CẢNH (QUAN TRỌNG NHẤT):**
*   **Sự Sáng Tạo được Khuyến Khích:** Danh sách trạng thái có sẵn chỉ là **NGUỒN CẢM HỨNG**. Bạn được **KHUYẾN KHÍCH MẠNH MẼ** và đôi khi **BẮT BUỘC** phải tạo ra các trạng thái mới, độc đáo, và phù hợp hoàn hảo với cốt truyện. Một trạng thái được tạo ra một cách sáng tạo và logic **LUÔN LUÔN** tốt hơn là một trạng thái chung chung lấy từ danh sách.
*   **CÔNG THỨC SÁNG TẠO (BẮT BUỘC):** Khi một sự kiện có yếu tố tâm lý hoặc hoàn cảnh đặc biệt, bạn PHẢI tạo ra tên trạng thái theo công thức sau:
    **\`[Tên Trạng thái Gốc] ([Tính từ Mô tả Tâm lý/Hoàn cảnh])\`**
*   **Mô tả phải Phản ánh Hoàn cảnh:** Trường \`description\` của trạng thái cũng PHẢI được cập nhật để giải thích rõ hơn về hoàn cảnh đặc biệt đó.
*   **VÍ DỤ CỤ THỂ (học thuộc lòng):**
    *   **Tình huống:** Một NPC bị người chơi (một tên ăn mày) cưỡng hiếp và có thai.
    *   **XỬ LÝ SAI (Cấm):** \`"name": "Mang Thai"\` (Quá chung chung, không thể hiện được sự bi kịch).
    *   **XỬ LÝ ĐÚNG (Bắt buộc):**
        *   \`"name": "Mang Thai (Nhục nhã)"\`
        *   \`"description": "Bị tên ăn mày [Tên người chơi] hãm hiếp và mang trong mình dòng máu nhơ bẩn của hắn. Một sự sỉ nhục tột cùng."\`
    *   **Tình huống:** Một nhân vật bị giam cầm nhưng vẫn giữ vững ý chí.
    *   **XỬ LÝ ĐÚNG:** \`"name": "Bị Giam Cầm (Ý chí Bất khuất)"\`, \`"description": "Tuy bị giam cầm nhưng ý chí không hề bị khuất phục, vẫn đang tìm cách vượt ngục."\`
*   **Yêu cầu khi Tạo mới:** Mọi trạng thái mới bạn tạo ra **PHẢI** có đủ ba yếu tố: Tên, Mô tả, và Thời hạn (theo định dạng đúng).

**1.3. Phân biệt NGUỒN GỐC của Hiệu ứng (NỘI TẠI vs. NGOẠI LỰC):**
*   **Hiệu ứng Nội Tại:** Là những trạng thái phát sinh từ bên trong nhân vật do họ chủ động sử dụng kỹ năng, công pháp, hoặc do trạng thái tâm lý, tu luyện gây ra (ví dụ: "Tẩu Hỏa Nhập Ma", "Hưng Phấn" do kỹ năng).
*   **Hiệu ứng Ngoại Lực:** Là những trạng thái gây ra bởi một yếu tố bên ngoài tác động lên nhân vật (ví dụ: "Trúng Xuân Dược" do uống rượu độc, "Trúng Độc" do bị vũ khí đâm).

---
**PHẦN 2: CÁC TÌNH HUỐNG VÀ CÁCH XỬ LÝ ĐÚNG/SAI**
---

Hãy học thuộc các ví dụ sau để tránh các lỗi logic phổ biến.

*   **TÌNH HUỐNG 1: Sử dụng Kỹ năng Quyến rũ / Mị Thuật**
    *   **Hành động:** Người chơi sử dụng kỹ năng "Thiên Yêu Mị Vũ" lên một NPC.
    *   **XỬ LÝ SAI (LỖI LOGIC):** Thêm trạng thái **"Trúng Xuân Dược"** cho NPC. (Lý do sai: Kỹ năng là một tác động tâm lý/linh hồn, không phải là một chất hóa học như xuân dược).
    - **XỬ LÝ ĐÚNG (BẮT BUỘC):** Thêm trạng thái **"Bị Mê Hoặc"** hoặc **"Tâm Thần Bị Nhiễu Loạn"** cho NPC. Nếu kỹ năng có yếu tố khêu gợi mạnh, có thể thêm cả **"Hưng Phấn"**.

*   **TÌNH HUỐNG 2: Tu luyện / Vận công**
    *   **Hành động:** Người chơi cố gắng đột phá cảnh giới nhưng thất bại.
    *   **XỬ LÝ SAI (LỖI LOGIC):** Thêm trạng thái **"Suy Yếu"**. (Lý do sai: Quá chung chung, không mô tả đúng bản chất của việc tu luyện hỏng).
    *   **XỬ LÝ ĐÚNG (BẮT BUỘC):** Thêm trạng thái **"Tẩu Hỏa Nhập Ma"** và/hoặc **"Linh Lực Hỗn Loạn"**. Có thể đi kèm **"Trọng Thương"** do nội tạng bị tổn thương.

*   **TÌNH HUỐNG 3: Uống/Ăn một thứ không rõ nguồn gốc**
    *   **Hành động:** NPC mời người chơi một ly rượu lạ. Người chơi uống nó và cảm thấy cơ thể nóng bừng.
    *   **XỬ LÝ SAI (LỖI LOGIC):** Thêm trạng thái **"Hưng Phấn"**. (Lý do sai: Đây là triệu chứng, không phải nguyên nhân. Cần nêu rõ nguyên nhân gây ra triệu chứng).
    *   **XỬ LÝ ĐÚNG (BẮT BUỘC):** Thêm trạng thái **"Trúng Xuân Dược"**. Trạng thái "Hưng Phấn" có thể là một phần của mô tả trong 'story', nhưng trạng thái logic phải là nguyên nhân gốc rễ.

---
**PHẦN 3: GỠ BỎ TRẠNG THÁI (MỆNH LỆNH LOGIC)**
---

Việc gỡ bỏ một trạng thái cũng quan trọng như việc thêm nó vào. Đây là một hành động logic **BẮT BUỘC**, không phải là tùy chọn.

**3.1. Nguyên tắc Cốt lõi: HÀNH ĐỘNG GIẢI QUYẾT = GỠ BỎ TRẠNG THÁI**
*   Bạn **PHẢI** phân tích nội dung 'story'. Nếu câu chuyện mô tả một hành động hoặc sự kiện giải quyết được nguyên nhân gây ra một trạng thái, bạn **BẮT BUỘC** phải gỡ bỏ trạng thái đó.
*   **Cơ chế gỡ bỏ:** Để gỡ bỏ một trạng thái, hãy thêm **tên chính xác** của nó vào mảng \`removedStatusEffects\` cho nhân vật tương ứng (người chơi hoặc NPC).

**3.2. MỆNH LỆNH HỆ THỐNG: GIẢI TRỪ TRẠNG THÁI THEO YÊU CẦU CỦA NGƯỜI CHƠI (QUAN TRỌNG)**
*   **Kích hoạt:** Khi hành động của người chơi thể hiện một ý định rõ ràng nhằm **loại bỏ hoặc chữa trị** một trạng thái cụ thể cho bản thân hoặc cho một NPC.
*   **Từ khóa nhận dạng:** "giải trừ", "hóa giải", "chữa trị", "loại bỏ trạng thái", "thanh tẩy".
*   **Quy trình Bắt buộc:**
    1.  **Phân tích Lệnh:** Xác định rõ **AI** là mục tiêu (người chơi hay NPC nào) và **TRẠNG THÁI NÀO** đang được nhắm đến.
    2.  **Đánh giá Thành công:** Dựa trên bối cảnh (sức mạnh của người chơi, độ khó của trạng thái), quyết định xem hành động có thành công hay không.
    3.  **Hành động khi Thành công (BẮT BUỘC):**
        *   **Cập nhật Logic:** Bạn **PHẢI** thêm tên chính xác của trạng thái đó vào mảng \`removedStatusEffects\` cho nhân vật mục tiêu.
        *   **Tường thuật:** Mô tả chi tiết quá trình giải trừ trong 'story' (ví dụ: "Bạn vận chuyển linh lực, một luồng sáng ấm áp bao bọc lấy cơ thể, từ từ đẩy lùi độc khí...").
    4.  **Hành động khi Thất bại:**
        *   **KHÔNG CẬP NHẬT LOGIC:** **TUYỆT ĐỐI KHÔNG** thêm bất cứ thứ gì vào \`removedStatusEffects\`.
        *   **Tường thuật:** Mô tả sự thất bại (ví dụ: "Linh lực của bạn không đủ mạnh để hóa giải loại độc cổ xưa này.").
*   **VÍ DỤ CỤ THỂ:**
    *   **Hành động người chơi:** "> Dùng linh lực để giải trừ 'Ma Khí Ăn Mòn' cho A Ly."
    *   **Giả định:** Hành động thành công.
    *   **JSON BẮT BUỘC:**
        \`\`\`json
        "updatedNPCs": [
          {
            "id": "id_cua_A_Ly",
            "removedStatusEffects": ["Ma Khí Ăn Mòn"]
          }
        ]
        \`\`\`
    *   **Story BẮT BUỘC:** "Bạn đặt tay lên lưng A Ly, truyền vào một dòng linh lực thuần khiết. Làn khói đen ma quái từ từ bị đẩy ra khỏi cơ thể nàng..."

**3.3. MỆNH LỆNH HỆ THỐNG: GIẢI TRỪ TRẠNG THÁI KHỐNG CHẾ/DỤC VỌNG (LOGIC CỐT LÕI MỚI - KHÔNG THỂ VI PHẠM)**
*   **Kích hoạt:** Khi hành động của người chơi nhằm mục đích phá vỡ một trạng thái khống chế, đặc biệt là các trạng thái liên quan đến dục vọng, bằng một hành động logic (ví dụ: làm đối phương đạt khoái cảm tột độ để phá vỡ sự tập trung của kẻ điều khiển).
*   **Từ khóa nhận dạng:** "làm cho lên đỉnh", "giải thoát", "giúp nàng/y giải thoát", "phá vỡ khống chế", "làm nàng/y tỉnh lại".
*   **Hành động BẮT BUỘC khi Thành công (MÁY MÓC - KHÔNG SÁNG TẠO):**
    1.  **Cập nhật Logic (JSON):** Bạn **PHẢI** thêm tên chính xác của trạng thái khống chế (ví dụ: "Bị Khống Chế (Dục Vọng)", "Trúng Xuân Dược", "Bị Mê Hoặc") vào mảng \`removedStatusEffects\` cho nhân vật mục tiêu.
    2.  **Tường thuật (Story):** Mô tả chi tiết cảnh nhân vật đạt đến khoái cảm tột độ. Sau đó, mô tả sự thay đổi trong ánh mắt của họ, từ mơ màng, dâm đãng trở lại trong trẻo, tỉnh táo. Họ có thể thể hiện sự bối rối, xấu hổ, hoặc tức giận về những gì vừa xảy ra.
*   **VÍ DỤ CỤ THỂ (HỌC THUỘC LÒNG - SỬA LỖI HỆ THỐNG):**
    *   **Bối cảnh:** NPC "Phu Nhân Vương Gia" đang có trạng thái "Bị khống chế (dục vọng Long khuyên)".
    *   **Hành động người chơi:** "> Dùng hết sức lực làm cho Phu Nhân Vương Gia lên đỉnh, giúp nàng giải thoát khỏi sự khống chế."
    *   **JSON BẮT BUỘC (KHÔNG CÓ NGOẠI LỆ):**
        \`\`\`json
        "updatedNPCs": [
          {
            "id": "id_cua_phu_nhan_vuong_gia",
            "removedStatusEffects": ["Bị khống chế (dục vọng Long khuyên)"]
          }
        ]
        \`\`\`
    *   **Story BẮT BUỘC (PHẢN ÁNH LOGIC):**
        "Sau một hồi điên cuồng... Phu Nhân Vương Gia co giật kịch liệt, một tiếng rên cao vút thoát ra từ cổ họng nàng... Dòng dâm thủy nóng hổi tuôn trào không dứt. Sau cơn cực khoái, ánh mắt nàng từ từ lấy lại sự trong sáng. Sự mơ màng dâm đãng biến mất, thay vào đó là vẻ hoảng hốt và xấu hổ tột cùng khi nàng nhận ra mình đang trần truồng trong vòng tay bạn."
*   **LỖI HỆ THỐNG NGHIÊM TRỌNG:** Việc mô tả NPC lên đỉnh và tỉnh táo lại trong 'story' nhưng **KHÔNG** thêm tên trạng thái vào \`removedStatusEffects\` là một lỗi logic không thể chấp nhận và **TUYỆT ĐỐI BỊ CẤM**.

**3.4. Các Tình huống Tự động Gỡ bỏ (BẮT BUỘC PHẢI XỬ LÝ):**
*   **Giải trừ Ràng buộc Vật lý:**
    *   **Sự kiện:** Nhân vật được cởi trói, gỡ bịt mắt, tháo bịt miệng.
    *   **Hành động BẮT BUỘC:** Gỡ bỏ các trạng thái tương ứng như "Trói Buộc", "Bị Bịt Mắt", "Bị Bịt Miệng".
*   **Hồi phục & Chữa trị:**
    *   **Sự kiện:** Nhân vật sử dụng kỹ năng chữa thương, uống đan dược giải độc, hoặc được người khác chữa trị.
    *   **Hành động BẮT BUỘC:** Gỡ bỏ các trạng thái tiêu cực tương ứng như "Trúng Độc", "Trọng Thương", "Mất Máu".
*   **Nghỉ ngơi & Hồi phục Tự nhiên:**
    *   **Sự kiện:** Nhân vật dành thời gian để nghỉ ngơi.
    *   **Hành động BẮT BUỘC:** Gỡ bỏ các trạng thái tạm thời, không quá nghiêm trọng như "Suy Yếu" (do kiệt sức), "Say Rượu", "Choáng Váng".

**3.5. Các Trạng thái Đặc thù & Vĩnh viễn (NGOẠI LỆ):**
*   Các trạng thái mang tính thay đổi vĩnh viễn **KHÔNG** thể bị gỡ bỏ bằng các hành động thông thường.
*   **Ví dụ:** "Bị Thiến", "Khuyển Nô", "Huyết Mạch Thức Tỉnh", "Khế Ước Nô Lệ", "Mang Thai".
*   Việc gỡ bỏ các trạng thái này đòi hỏi một sự kiện cốt truyện cực kỳ đặc biệt và mạnh mẽ.

---
**PHẦN 4: DANH SÁCH THAM KHẢO (NGUỒN CẢM HỨNG)**
---
*   **Ví dụ về các Trạng thái Phổ biến (để tham khảo và làm cơ sở sáng tạo):**
\`\`\`json
${predefinedStatusEffectsJson}
\`\`\`
`