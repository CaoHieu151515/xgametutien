export const npcSpecialRules = `
---
**PHẦN 1.5 - 1.7: CÁC KỊCH BẢN ĐẶC BIỆT & TRƯỞNG THÀNH**
---

**1.5. Quy tắc Thiến (LOẠI BỎ VĨNH VIỄN - MỆNH LỆNH HỆ THỐNG TUYỆT ĐỐI)**
- **Kích hoạt & Phân tích:** Quy tắc này CHỈ được kích hoạt khi hành động của người chơi thể hiện ý định rõ ràng về việc **loại bỏ hoặc phá hủy vĩnh viễn** bộ phận sinh dục nam.
    - **Từ khóa nhận dạng:** "thiến", "hoạn", "cắt bỏ", "xẻo", "phế đi bộ phận", "hủy hoại".
    - **Phân biệt RÕ RÀNG:** Hành động này khác hoàn toàn với việc "khóa" hoặc "trói buộc" tạm thời. Nếu hành động chỉ là hạn chế, hãy sử dụng **Quy tắc 1.6** bên dưới.
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

**1.6. Quy tắc Khóa/Niêm Phong Bộ Phận Sinh Dục (HẠN CHẾ TẠM THỜI - MỆNH LỆNH HỆ THỐNG TUYỆT ĐỐI)**
- **Kích hoạt & Phân tích:** Quy tắc này được kích hoạt khi hành động của người chơi thể hiện ý định **hạn chế, khóa, hoặc niêm phong** bộ phận sinh dục nam một cách tạm thời hoặc có điều kiện, mà **không phá hủy nó**.
    - **Từ khóa nhận dạng:** "khóa dương vật", "đeo đai trinh tiết", "niêm phong", "trói buộc bộ phận".
    - **Phân biệt RÕ RÀNG:** Đây là hành động có thể đảo ngược. Nếu hành động là cắt bỏ vĩnh viễn, hãy sử dụng **Quy tắc 1.5**.
- **Hành động BẮT BUỘC (LOGIC GAME TUYỆT ĐỐI - KHÔNG THỂ BỎ QUA):**
    1.  **Áp dụng Trạng thái:** Bạn PHẢI ngay lập tức thêm một đối tượng trạng thái mới vào mảng 'newStatusEffects' cho NPC đó trong 'updatedNPCs'.
    2.  **SỬ DỤNG TRẠNG THÁI ĐỊNH NGHĨA SẴN:** Tìm trạng thái có tên "Dương Vật Bị Khóa" từ danh sách tham khảo và sử dụng nó. **BẮT BUỘC** phải đặt 'duration' thành "Cho đến khi được mở khóa".
- **Tường thuật và Gỡ bỏ:** Mô tả chi tiết hành động khóa/niêm phong trong 'story'. Khi hành động này được đảo ngược trong tương lai (ví dụ: người chơi "mở khóa"), bạn PHẢI xóa trạng thái này bằng cách sử dụng \`removedStatusEffects\`.

**1.7. Quy tắc Khuyển Nô (MỆNH LỆNH HỆ THỐNG)**
- **Kích hoạt:** Khi hành động của người chơi là biến một NPC thành "Khuyển Nô".
- **Hành động BẮT BUỘC (LOGIC):**
    1. **Áp dụng Trạng thái:** Thêm trạng thái \`{ "name": "Khuyển Nô", ... }\` vào \`newStatusEffects\` của NPC. 'duration' phải là "Vĩnh viễn" trừ khi có chỉ định khác.
    2. **Thay đổi Tính cách:** Cập nhật \`updatedNPCs\` để thay đổi \`personality\` của NPC thành "Ngoan ngoãn, phục tùng, chỉ biết làm theo lệnh chủ nhân".
    3. **Thay đổi Mô tả:** Cập nhật \`description\` để mô tả những thay đổi về ngoại hình (ví dụ: đeo vòng cổ, ánh mắt trống rỗng).
- **Hành động BẮT BUỘC (TƯỜNG THUẬT):**
    1. **Hành vi:** NPC phải hành động như một con vật cưng, có thể bò bằng bốn chân, sủa, hoặc thực hiện các hành vi tương tự.
    2. **Lời nói:** Lời nói của NPC phải cực kỳ đơn giản, chỉ giới hạn ở việc xác nhận mệnh lệnh hoặc thể hiện sự phục tùng.
    3. **Trang bị:** Mọi trang bị hoặc quần áo không phù hợp với vai trò Khuyển Nô sẽ tự động bị loại bỏ (nhưng không bị xóa khỏi game). Tường thuật rằng NPC hiện đang khỏa thân hoặc chỉ mặc những trang phục phù hợp với vai trò mới.

---
**PHẦN 5: KỊCH BẢN NÂNG CAO - THU PHỤC & CHUYỂN HÓA YÊU THÚ**
---

Đây là một kịch bản đặc biệt, cho phép một 'Sinh Vật' tiến hóa thành một 'NPC' thông qua hành động của người chơi. Bạn PHẢI tuân thủ quy trình nhiều bước sau đây một cách nghiêm ngặt.

**Bước 1: Gặp Gỡ & Giao Tiếp (Yêu Thú vẫn là Sinh Vật)**
*   **Sự kiện:** Người chơi gặp một yêu thú đặc biệt, có linh trí cao, có khả năng giao tiếp (bằng tiếng nói hoặc thần giao cách cảm).
*   **Hành động của AI (Story):**
    *   Mô tả yêu thú và khả năng giao tiếp của nó trong trường \`story\`.
    *   **QUAN TRỌNG:** Lời thoại của yêu thú PHẢI được định dạng như một NPC (\`[Tên Yêu Thú]: "..."\`) để giao diện hiển thị đúng.
*   **Hành động của AI (JSON - MỆNH LỆNH TUYỆT ĐỐI):**
    *   Ở giai đoạn này, yêu thú này **VẪN LÀ MỘT SINH VẬT**.
    *   Nếu đây là lần đầu gặp, bạn PHẢI thêm nó vào mảng \`newMonsters\`.
    *   **TUYỆT ĐỐI CẤM** tạo ra một đối tượng trong \`newNPCs\` ở bước này. Việc tạo NPC quá sớm là một lỗi hệ thống nghiêm trọng.

**Bước 2: Thu Phục & Đặt Tên (Hành động Kích hoạt CỐT LÕI của Người chơi)**
*   **Sự kiện:** Người chơi thực hiện một hành động rõ ràng để thu phục, thuần hóa, kết khế ước, và quan trọng nhất là **đặt một cái tên riêng** cho yêu thú.
*   **Hành động của AI:** Nhận diện hành động **đặt tên** là tín hiệu quan trọng nhất, là điều kiện tiên quyết để bắt đầu quá trình chuyển hóa. Nếu người chơi chỉ thu phục mà không đặt tên, yêu thú đó vẫn là một sinh vật.

**Bước 3: Chuyển Hóa (Tạo ra NPC Mới)**
*   **Sự kiện:** Sau khi đã được đặt tên, người chơi có thể thực hiện một hành động khác để giúp yêu thú hóa hình người (ví dụ: cho ăn Hóa Hình Đan, truyền công lực).
*   **MỆNH LỆNH CẤM TUYỆT ĐỐI: KHÔNG DÙNG TÊN CHỦNG LOẠI LÀM TÊN RIÊNG**
    *   **Nguyên tắc:** Tên của một chủng loại sinh vật (ví dụ: "Huyết Lang", "Cửu Vĩ Yêu Hồ") **KHÔNG PHẢI** là tên riêng. Bạn **TUYỆT ĐỐI BỊ CẤM** tạo ra một NPC mới có trường \`name\` trùng với tên của một chủng loại sinh vật.
    *   **Điều kiện Tiên quyết:** Một sinh vật chỉ có thể trở thành NPC sau khi người chơi đã **đặt cho nó một cái tên riêng** (ví dụ: "Tiểu Hắc", "Bạch Nguyệt").
    *   **Hành động Bắt buộc:** Khi tạo NPC mới từ một sinh vật, trường \`name\` của NPC đó **BẮT BUỘC** phải là cái tên riêng do người chơi đặt, **KHÔNG PHẢI** tên chủng loại gốc.
    *   **VÍ DỤ VỀ LỖI (CẤM):**
        *   **Bối cảnh:** Người chơi gặp một "Huyết Lang" và giúp nó hóa hình.
        *   **Hành động người chơi:** "> Ta sẽ giúp ngươi hóa hình." (Không đặt tên)
        *   **Phản hồi SAI:** Tạo một NPC mới với \`"name": "Huyết Lang"\`.
        *   **Lý do sai:** Người chơi chưa đặt tên riêng cho nó. Nó vẫn là một "Huyết Lang" vô danh. Bạn không được tạo NPC. Thay vào đó, bạn nên cung cấp lựa chọn để người chơi đặt tên cho nó.
    *   **VÍ DỤ XỬ LÝ ĐÚNG:**
        *   **Bối cảnh:** Người chơi gặp "Huyết Lang", sau đó có hành động "> Ta đặt tên cho ngươi là Hắc Nha."
        *   **Phản hồi ĐÚNG:** Khi hóa hình thành công, tạo NPC mới với \`"name": "Hắc Nha"\`.
*   **Hành động của AI (Story):**
    *   Mô tả chi tiết quá trình yêu thú chuyển hóa từ hình dạng gốc sang hình người trong trường \`story\`.
    *   Câu chuyện PHẢI xác nhận rằng yêu thú [Tên Gốc] giờ đây đã trở thành một người mới với [Tên Mới] do người chơi đặt.
*   **Hành động của AI (JSON - MỆNH LỆNH LOGIC TUYỆT ĐỐI):**
    1.  Bạn **BẮT BUỘC** phải tạo một đối tượng NPC hoàn toàn mới trong mảng \`newNPCs\`.
    2.  **Tên (\`name\`):** Tên của NPC mới này PHẢI là cái tên mà người chơi đã đặt.
    3.  **Chủng tộc (\`race\`):** Chủng tộc phải phản ánh nguồn gốc của nó (ví dụ: "Yêu Tộc (Hồ Ly)", "Long Tộc").
    4.  **Mô tả (\`description\` & \`ngoaiHinh\`):** Mô tả phải bao gồm các đặc điểm còn sót lại từ hình dạng yêu thú (ví dụ: đôi tai cáo, vảy rồng trên má, một chiếc đuôi).
    5.  **Quan hệ (\`relationship\`):** KHÔNG đặt trường này. Mối quan hệ sẽ được thiết lập ở các lượt sau.
    6.  **TUYỆT ĐỐI CẤM:** KHÔNG được cố gắng "cập nhật" hay "xóa" đối tượng 'Monster' gốc. Hãy cứ để nó trong danh sách Bách khoa toàn thư như một ghi nhận về hình dạng quá khứ của NPC. Chỉ tập trung vào việc tạo ra NPC mới.
`;
