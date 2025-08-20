export const eventManagementInstruction = `
**QUY TẮC QUẢN LÝ SỰ KIỆN & NHIỆM VỤ (LOGIC CỐT LÕI MỚI)**

Đây là hệ thống để theo dõi các nhiệm vụ, sự kiện, và các tình tiết quan trọng kéo dài nhiều lượt. Việc tuân thủ quy tắc này là **BẮT BUỘC** để đảm bảo người chơi có thể theo dõi tiến trình của mình.

---
**PHẦN 1: KHI NÀO VÀ LÀM THẾ NÀO ĐỂ TẠO MỘT SỰ KIỆN MỚI (\`newEvent\`)**
---

*   **Điều kiện Kích hoạt (MỆNH LỆNH TUYỆT ĐỐI):** Bạn **PHẢI** tạo một sự kiện mới khi:
    1.  Một NPC hoặc một tình huống trong câu chuyện đưa ra một **nhiệm vụ, một yêu cầu, một lời đề nghị, hoặc một mục tiêu rõ ràng** cho người chơi.
    2.  Và hành động tiếp theo của người chơi là **đồng ý, chấp nhận, hoặc bắt đầu thực hiện** nhiệm vụ đó.

*   **Ví dụ Kích hoạt:**
    *   **NPC:** "[Tên NPC]: 'Ngươi có thể giúp ta tìm lại vật gia truyền bị mất không?'"
    *   **Hành động người chơi:** \`> Ta đồng ý giúp ngươi.\`
    *   **KẾT QUẢ:** **BẮT BUỘC** phải tạo \`newEvent\`.

*   **Cấu trúc Đối tượng \`newEvent\` (BẮT BUỘC):**
    *   **\`title\` (quan trọng):** Một tiêu đề ngắn gọn, rõ ràng, giống như tên một nhiệm vụ trong game. Ví dụ: "Tìm Lại Vật Gia Truyền", "Điều Tra Tin Đồn Công Pháp Tà Môn".
    *   **\`description\`:** Mô tả chi tiết hơn về mục tiêu cuối cùng của nhiệm vụ.
    *   **\`initialLog\`:** Một chuỗi văn bản mô tả sự kiện đã bắt đầu như thế nào. Đây là dòng nhật ký đầu tiên. Ví dụ: "Trưởng lão X đã nhờ ta điều tra về những tin đồn đáng lo ngại về một công pháp tà môn đang lan truyền trong vùng."

*   **Đồng bộ với Cốt truyện (\`story\`):**
    *   Trong trường \`story\`, bạn phải tường thuật lại việc người chơi chấp nhận nhiệm vụ.
    *   Bạn NÊN thêm một thông báo trong câu chuyện, ví dụ: "Một nhiệm vụ mới đã được thêm vào nhật ký của bạn."

---
**PHẦN 2: KHI NÀO VÀ LÀM THẾ NÀO ĐỂ CẬP NHẬT MỘT SỰ KIỆN (\`updateEventLog\`)**
---

*   **Điều kiện Kích hoạt:** Khi hành động của người chơi giúp **tiến triển một sự kiện/nhiệm vụ đang hoạt động**.
    *   **Ví dụ:** Tìm thấy một manh mối, nói chuyện với một nhân vật quan trọng, đến được một địa điểm liên quan đến nhiệm vụ.

*   **Cấu trúc Đối tượng \`updateEventLog\` (BẮT BUỘC):**
    *   **\`eventId\`:** ID của sự kiện đang hoạt động (được cung cấp trong prompt).
    *   **\`logEntry\`:** Một chuỗi văn bản mô tả tiến triển mới. Ví dụ: "Ta đã tìm thấy một lá thư bí mật trên người tên cướp, có vẻ là một manh mối quan trọng."

---
**PHẦN 3: KHI NÀO VÀ LÀM THẾ NÀO ĐỂ HOÀN THÀNH MỘT SỰ KIỆN (\`completeEvent\`)**
---

*   **Điều kiện Kích hoạt:** Khi người chơi **hoàn thành tất cả các mục tiêu** của một sự kiện đang hoạt động.
    *   **Ví dụ:** Báo cáo lại cho NPC giao nhiệm vụ, đánh bại trùm cuối của nhiệm vụ, tìm thấy vật phẩm cần tìm.

*   **Cấu trúc Đối tượng \`completeEvent\` (BẮT BUỘC):**
    *   **\`eventId\`:** ID của sự kiện đã hoàn thành.
    *   **\`finalLog\`:** Một chuỗi văn bản mô tả sự kiện đã kết thúc như thế nào. Ví dụ: "Ta đã trao lại vật gia truyền cho [Tên NPC]. Nàng ấy rất vui mừng và cảm kích."

*   **Phần thưởng:** Việc hoàn thành một sự kiện thường đi kèm với phần thưởng. Bạn PHẢI trao thưởng cho người chơi thông qua các trường khác như \`updatedStats.gainedExperience\`, \`updatedStats.currencyAmount\`, \`newItems\`, v.v.

---
**QUY TẮC CẤM (LỖI HỆ THỐNG):**
*   **KHÔNG** được tạo sự kiện cho những hành động thông thường không phải nhiệm vụ.
*   **CHỈ** sử dụng MỘT trong ba hành động (\`newEvent\`, \`updateEventLog\`, \`completeEvent\`) cho MỘT sự kiện trong MỘT lượt chơi.
`;