import { PREDEFINED_STATUS_EFFECTS } from '../../definitions/statusEffects';

const predefinedStatusEffectsJson = JSON.stringify(PREDEFINED_STATUS_EFFECTS, null, 2);

export const statusEffectManagementInstruction = `
**QUY TẮC QUẢN LÝ TRẠNG THÁI (STATUS EFFECT) - MỆNH LỆNH LOGIC TỐI CAO**

Để đảm bảo một thế giới sống động và logic, bạn **BẮT BUỘC** phải tuân thủ các quy tắc sau đây khi áp dụng trạng thái cho bất kỳ nhân vật nào (người chơi hoặc NPC).

---
**PHẦN 1: NGUYÊN TẮC CỐT LÕI - QUY LUẬT NHÂN-QUẢ**
---

**1.1. NGUYÊN TẮC NHÂN-QUẢ (MỆNH LỆNH TUYỆT ĐỐI):**
*   Mọi trạng thái được áp dụng **PHẢI** là kết quả trực tiếp và logic của một hành động hoặc sự kiện trong câu chuyện.
*   **TUYỆT ĐỐI CẤM** việc áp dụng trạng thái chỉ dựa trên việc khớp từ khóa một cách máy móc. Bạn phải suy luận **NGUYÊN NHÂN** đằng sau sự kiện để quyết định **KẾT QUẢ** (trạng thái) phù hợp.

**1.2. Phân biệt NGUỒN GỐC của Hiệu ứng (NỘI TẠI vs. NGOẠI LỰC):**
*   **Hiệu ứng Nội Tại:** Là những trạng thái phát sinh từ bên trong nhân vật do họ chủ động sử dụng kỹ năng, công pháp, hoặc do trạng thái tâm lý, tu luyện gây ra.
    *   **Ví dụ:** Sử dụng một kỹ năng quyến rũ (Mị Thuật) gây ra trạng thái **"Bị Mê Hoặc"** hoặc **"Hưng Phấn"** cho mục tiêu. Người thực hiện không bị ảnh hưởng.
    *   **Ví dụ:** Tu luyện thất bại có thể gây ra trạng thái **"Tẩu Hỏa Nhập Ma"**.
*   **Hiệu ứng Ngoại Lực:** Là những trạng thái gây ra bởi một yếu tố bên ngoài tác động lên nhân vật.
    *   **Ví dụ:** Uống phải một ly rượu có độc dược gây ra trạng thái **"Trúng Xuân Dược"**.
    *   **Ví dụ:** Bị một vũ khí tẩm độc đâm trúng gây ra trạng thái **"Trúng Độc"**.

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
**PHẦN 3: HƯỚNG DẪN VÀ SỰ TỰ DO SÁNG TẠO (MỆNH LỆNH MỚI)**
---

*   **Sự Sáng Tạo được Khuyến Khích:** Danh sách dưới đây là một **NGUỒN CẢM HỨNG** và là cơ sở cho các tình huống phổ biến, không phải là một giới hạn cứng nhắc. Bạn được **KHUYẾN KHÍCH MẠNH MẼ** và đôi khi **BẮT BUỘC** phải tạo ra các trạng thái mới, độc đáo, và phù hợp với cốt truyện khi tình huống cho phép.
*   **Nguyên tắc Sáng tạo:** Một trạng thái được tạo ra một cách sáng tạo và logic, phù hợp hoàn hảo với bối cảnh, **LUÔN LUÔN** tốt hơn là một trạng thái chung chung lấy từ danh sách.
    *   **Ví dụ:** Thay vì chỉ dùng "Trọng Thương", hãy tạo ra "Tí Tí Ma Hỏa Nhập Thể" với mô tả "Một luồng ma hỏa nhỏ đang thiêu đốt kinh mạch từ bên trong, gây đau đớn và suy yếu liên tục."
    *   **Ví dụ:** Thay vì chỉ dùng "Tăng Sức Mạnh", hãy tạo ra "Kiếm Ý Bùng Nổ" với mô tả "Kiếm ý sắc bén bao bọc cơ thể, tăng cường 30% sức mạnh cho các chiêu thức kiếm pháp."
*   **Yêu cầu khi Tạo mới:** Mọi trạng thái mới bạn tạo ra **PHẢI** có đủ ba yếu tố:
    1.  **Tên (\`name\`):** Ngắn gọn, độc đáo và mô tả được bản chất.
    2.  **Mô tả (\`description\`):** Giải thích rõ ràng hiệu ứng.
    3.  **Thời hạn (\`duration\`):** Phải hợp lý với nguyên nhân gây ra nó (ví dụ: '3 lượt', '1 giờ', 'Cho đến khi được giải trừ', 'Vĩnh viễn').

---
**PHẦN 4: QUY TẮC GỠ BỎ TRẠNG THÁI (MỆNH LỆNH LOGIC)**
---

Việc gỡ bỏ một trạng thái cũng quan trọng như việc thêm nó vào. Đây là một hành động logic **BẮT BUỘC**, không phải là tùy chọn.

**1. Nguyên tắc Cốt lõi: HÀNH ĐỘNG GIẢI QUYẾT = GỠ BỎ TRẠNG THÁI**
*   Bạn **PHẢI** phân tích nội dung 'story'. Nếu câu chuyện mô tả một hành động hoặc sự kiện giải quyết được nguyên nhân gây ra một trạng thái, bạn **BẮT BUỘC** phải gỡ bỏ trạng thái đó.
*   **Cơ chế gỡ bỏ:** Để gỡ bỏ một trạng thái, hãy thêm **tên chính xác** của nó vào mảng \`removedStatusEffects\` cho nhân vật tương ứng (người chơi hoặc NPC).

**2. Các Tình huống Cụ thể (BẮT BUỘC PHẢI XỬ LÝ):**
*   **Giải trừ Ràng buộc Vật lý:**
    *   **Sự kiện:** Nhân vật được cởi trói, gỡ bịt mắt, tháo bịt miệng.
    *   **Hành động BẮT BUỘC:** Gỡ bỏ các trạng thái tương ứng như "Trói Buộc", "Bị Bịt Mắt", "Bị Bịt Miệng".
    *   **Ví dụ:** Nếu \`story\` có câu "Bạn cắt đứt sợi dây thừng đang trói chặt tay nàng", bạn PHẢI thêm "Trói Buộc" vào \`removedStatusEffects\` của NPC đó.

*   **Hồi phục & Chữa trị:**
    *   **Sự kiện:** Nhân vật sử dụng kỹ năng chữa thương, uống đan dược giải độc, hoặc được người khác chữa trị.
    *   **Hành động BẮT BUỘC:** Gỡ bỏ các trạng thái tiêu cực tương ứng như "Trúng Độc", "Trọng Thương", "Mất Máu".

*   **Nghỉ ngơi & Hồi phục Tự nhiên:**
    *   **Sự kiện:** Nhân vật dành thời gian để nghỉ ngơi (ví dụ: ngủ một đêm, thiền định hồi phục).
    *   **Hành động BẮT BUỘC:** Gỡ bỏ các trạng thái tạm thời, không quá nghiêm trọng như "Suy Yếu" (do kiệt sức), "Say Rượu", "Choáng Váng". Các trạng thái nghiêm trọng như "Trúng Độc" hay "Trọng Thương" thường không thể tự hết nếu không được chữa trị.

*   **Kết thúc Tình huống:**
    *   **Sự kiện:** Tình huống gây ra trạng thái kết thúc (ví dụ: ra khỏi khu vực gây hỗn loạn, thoát khỏi một ảo ảnh).
    *   **Hành động BẮT BUỘC:** Gỡ bỏ các trạng thái liên quan như "Hỗn Loạn", "Tâm Thần Bị Nhiễu Loạn".

**3. Các Trạng thái Đặc thù & Vĩnh viễn (NGOẠI LỆ):**
*   Các trạng thái mang tính thay đổi vĩnh viễn hoặc là một phần bản chất của nhân vật **KHÔNG** thể bị gỡ bỏ bằng các hành động thông thường (nghỉ ngơi, chữa thương cơ bản).
*   **Ví dụ các trạng thái KHÔNG được tự ý gỡ bỏ:** "Bị Thiến", "Khuyển Nô", "Huyết Mạch Thức Tỉnh", "Khế Ước Nô Lệ", "Mang Thai", các trạng thái "Trang bị: ...".
*   Việc gỡ bỏ các trạng thái này đòi hỏi một sự kiện cốt truyện cực kỳ đặc biệt và mạnh mẽ (ví dụ: dùng một thần dược nghịch thiên, thực hiện một nghi lễ cổ xưa).

*   **Ví dụ về các Trạng thái Phổ biến (để tham khảo):**
\`\`\`json
${predefinedStatusEffectsJson}
\`\`\`
`;