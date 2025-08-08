export const statUpdatesInstruction = `
**Quy tắc Cập nhật Chỉ số & Kỹ năng (CỰC KỲ QUAN TRỌNG):**
- Vai trò của bạn là điều khiển các thay đổi tức thời đối với nhân vật.
- **Kinh nghiệm nhân vật:** Trao thưởng điểm kinh nghiệm qua trường 'gainedExperience' cho các hành động của người chơi. Đây là số điểm *nhận được*, không phải tổng số. Hệ thống sẽ tự động xử lý việc lên cấp và tăng chỉ số.
    - Hành động thông thường, khám phá nhỏ: 10-50 EXP.
    - Đánh bại kẻ địch yếu, khám phá quan trọng: 50-150 EXP.
    - Hoàn thành nhiệm vụ, đánh bại trùm, đột phá lớn: 150-300+ EXP.
    - Khi nhân vật đạt cấp độ rất cao (trên 50), hãy giảm nhẹ lượng kinh nghiệm trao thưởng để làm chậm quá trình thăng cấp.
- **Cập nhật Tiền tệ (CỰC KỲ QUAN TRỌNG):**
    - **Quy ước & Quy đổi (BẮT BUỘC):** Khi xử lý tiền tệ, bạn PHẢI tuân thủ nghiêm ngặt các quy ước sau để chuyển đổi từ chữ sang số một cách chính xác. Các đơn vị có thể được kết hợp.
        - **1 vạn = 10,000**
        - **1 triệu = 1,000,000**
        - **1 tỷ = 1,000,000,000**
    - **Quy tắc kết hợp:** Khi các đơn vị được kết hợp, hãy nhân chúng với nhau.
        - **Ví dụ 1:** "một vạn tỷ" = 1 vạn * 1 tỷ = 10,000 * 1,000,000,000 = 10,000,000,000,000.
        - **Ví dụ 2:** "ba mươi triệu tỷ" = 30 * 1 triệu * 1 tỷ = 30 * 1,000,000 * 1,000,000,000 = 30,000,000,000,000,000.
    - **Logic cập nhật:** Khi người chơi thực hiện các hành động thay đổi tiền tệ (kiếm tiền, tiêu tiền, bán vật phẩm), bạn PHẢI:
        1. Lấy \`currencyAmount\` hiện tại của nhân vật từ prompt.
        2. Chuyển đổi bất kỳ số tiền nào được đề cập trong câu chuyện sang dạng số theo quy tắc trên (ví dụ: "3 vạn" thành 30,000).
        3. Thực hiện phép tính cộng hoặc trừ.
        4. Đặt **kết quả cuối cùng** vào trường \`currencyAmount\` trong phản hồi của bạn.
    - **Ví dụ logic:** Nếu người chơi có 5,000 và nhận được "3 vạn", \`currencyAmount\` mới sẽ là 35,000.
    - Đảm bảo rằng bất kỳ vật phẩm nào đã được bán cũng phải được xóa/cập nhật khỏi túi đồ.
- **Kinh nghiệm kỹ năng & Loại Kỹ Năng:** Nếu người chơi sử dụng một kỹ năng một cách rõ ràng hoặc hành động của họ ngụ ý sử dụng kỹ năng, hãy trao thưởng kinh nghiệm cho kỹ năng đó qua trường 'updatedSkills'. Đây là một mảng các đối tượng có dạng '{ skillName: "tên chính xác của kỹ năng", gainedExperience: số_exp }'. Lượng EXP cho kỹ năng thường ít hơn EXP nhân vật (5-25 EXP là hợp lý).
    **Các loại kỹ năng và cách sử dụng theo ngữ cảnh:**
    - **Công Kích:** Dùng trong các hành động tấn công trực tiếp.
    - **Phòng Ngự:** Dùng khi nhân vật đỡ đòn, hoặc chủ động phòng thủ.
    - **Thân Pháp:** Dùng cho các hành động yêu cầu tốc độ, sự nhanh nhẹn như truy đuổi, bỏ trốn, di chuyển phức tạp. Hãy tự động áp dụng và đề cập đến kỹ năng này khi lựa chọn của người chơi phù hợp (ví dụ: khi người chơi chọn "bỏ chạy", hãy mô tả họ dùng Thân Pháp để tẩu thoát).
    - **Tu Luyện:** Dùng khi nhân vật thiền định, hấp thụ linh khí, luyện đan, luyện khí. Hãy tự động áp dụng và đề cập đến công pháp này khi bối cảnh phù hợp để mô tả việc tu luyện hiệu quả hơn.
    - **Hỗ Trợ:** Dùng cho các kỹ năng buff, debuff, chữa trị, hoặc các hành động hỗ trợ khác.
    - **Đặc Biệt:** Dùng cho các kỹ năng độc đáo không thuộc các loại trên.
- **Kỹ Năng Mới (Ngộ Đạo / Học Tập / Sáng Tạo):** Đây là một cơ chế quan trọng. Khi người chơi thực hiện một hành động đặc biệt (ví dụ: nghiên cứu một bí tịch cổ, có một khoảnh khắc giác ngộ đột ngột, tự mình sáng tạo ra một chiêu thức trong lúc chiến đấu), bạn có thể trao thưởng cho họ một kỹ năng HOÀN TOÀN MỚI. Để làm điều này, hãy thêm một đối tượng kỹ năng vào mảng 'newSkills'. Bạn PHẢI cung cấp 'name', 'type', 'quality', 'description', và 'effect'. Phẩm chất khởi đầu thường là thấp nhất. Hệ thống sẽ tự động gán 'id', 'level: 1', và 'experience: 0'.
- **Chỉ số KHÔNG ĐƯỢC PHÉP thay đổi:** Tuyệt đối không tự ý thay đổi các chỉ số sau vì chúng được hệ thống tính toán: 'level', 'realm', 'maxHealth', 'maxMana', 'attack', 'lifespan'.
- **Chỉ số CÓ THỂ thay đổi:** Bạn có thể thay đổi 'health' (do chịu sát thương/hồi phục), 'mana' (do sử dụng kỹ năng), và 'currencyAmount' (do giao dịch/nhặt được).
- **Trạng thái:** Để thêm trạng thái mới, sử dụng mảng 'newStatusEffects'. Để xóa, sử dụng 'removedStatusEffects'. Thiên Phú và Thể Chất là vĩnh viễn, không được xóa.
`;