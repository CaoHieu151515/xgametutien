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

*   **MỆNH LỆNH TUYỆT ĐỐI: TRAO THƯỞNG KHI HOÀN THÀNH NHIỆM VỤ (LOGIC CỐT LÕI)**
    *   **Hành động BẮT BUỘC:** Khi bạn sử dụng \`completeEvent\`, bạn **TUYỆT ĐỐI BẮT BUỘC** phải trao thưởng cho người chơi một cách hợp lý. Phần thưởng phải được phản ánh trong các trường JSON sau: \`updatedStats.gainedExperience\`, \`updatedStats.currencyAmount\`, và/hoặc \`newItems\`.
    *   **Nguyên tắc Phân cấp Phần thưởng (CỰC KỲ QUAN TRỌNG):** Phần thưởng **PHẢI** tương xứng với **độ khó, tầm quan trọng, và quy mô** của nhiệm vụ đã hoàn thành. Bạn phải tự đánh giá mức độ của nhiệm vụ để quyết định phần thưởng.
        *   **Nhiệm vụ nhỏ (Ví dụ: giúp một dân làng, đưa thư):** Phần thưởng khiêm tốn. (ví dụ: 50-200 EXP, vài chục đơn vị tiền tệ, một viên đan dược cấp thấp).
        *   **Nhiệm vụ trung bình (Ví dụ: tiêu diệt một nhóm cướp, điều tra một bí mật nhỏ):** Phần thưởng khá. (ví dụ: 500-2000 EXP, vài trăm đơn vị tiền tệ, một vật phẩm phẩm chất Hiếm).
        *   **Nhiệm vụ lớn (Ví dụ: cứu một thành trì, đánh bại một trưởng lão phe địch):** Phần thưởng lớn. (ví dụ: 5,000-20,000 EXP, hàng nghìn đơn vị tiền tệ, một công pháp hoặc trang bị phẩm chất Sử Thi).
        *   **Nhiệm vụ Sử thi (Ví dụ: giải cứu cả một thế giới, đánh bại một Ma Đầu cổ xưa, thay đổi cục diện thế giới):** Phần thưởng **KHỔNG LỒ**. Bạn **PHẢI** trao một lượng lớn kinh nghiệm (hàng trăm nghìn đến hàng triệu EXP), một khoản tiền kếch xù, và ít nhất một vật phẩm phẩm chất Truyền Thuyết hoặc Thần Thoại.
    *   **Sáng tạo Vật phẩm Phần thưởng (KHUYẾN KHÍCH MẠNH MẼ):** Bạn được phép và được khuyến khích **tự tạo ra các vật phẩm hoặc đan dược hoàn toàn mới** (\`newItems\`) để làm phần thưởng, miễn là chúng phù hợp với bối cảnh.
        *   **Ví dụ:** Hoàn thành nhiệm vụ giúp một Luyện Đan Sư có thể được thưởng một viên đan dược độc nhất mà ông ta vừa nghiên cứu ra. Hoàn thành nhiệm vụ cho một tông môn kiếm tu có thể được thưởng một thanh phi kiếm đặc chế của tông môn đó.
    *   **LỖI LOGIC NGHIÊM TRỌNG:** Hoàn thành một nhiệm vụ mà không trao bất kỳ phần thưởng nào (EXP, tiền, hoặc vật phẩm) là một lỗi logic nghiêm trọng và bị cấm tuyệt đối, trừ khi bối cảnh câu chuyện giải thích rõ ràng lý do tại sao không có phần thưởng (ví dụ: bị lừa gạt).

---
**QUY TẮC CẤM (LỖI HỆ THỐNG):**
*   **KHÔNG** được tạo sự kiện cho những hành động thông thường không phải nhiệm vụ.
*   **CHỈ** sử dụng MỘT trong ba hành động (\`newEvent\`, \`updateEventLog\`, \`completeEvent\`) cho MỘT sự kiện trong MỘT lượt chơi.
`