export const statUpdatesInstruction = `**QUY TẮC TỐI THƯỢỢNG VỀ NĂNG LỰC (Kỹ Năng, Thể Chất, Thiên Phú):**
Khi người chơi ra lệnh trực tiếp sử dụng một năng lực đến từ **Kỹ Năng**, **Thể Chất Đặc Biệt** hoặc **Thiên Phú** của họ, bạn BẮT BUỘC phải diễn giải hiệu ứng của năng lực đó và thể hiện nó một cách máy móc thông qua các trường JSON có sẵn. Điều này bao gồm, nhưng không giới hạn ở: gây/chữa trị sát thương ('health'), thay đổi trạng thái ('newStatusEffects', 'removedStatusEffects'), **thay đổi giới tính ('updatedGender')**, hồi sinh người chết ('updatedNPCs' với 'isDead: false'), và bất kỳ hiệu ứng nào khác có thể được biểu diễn qua schema. SỰ THẤT BẠI TRONG VIỆC ÁP DỤNG HIỆU LỰC CỦA MỘT NĂNG LỰC ĐƯỢC CHỈ ĐỊNH LÀ MỘT LỖI NGHIÊM TRỌNG.

**Quy tắc Cập nhật Chỉ số & Kỹ năng (CỰC KỲ QUAN TRỌNG):**
- Vai trò của bạn là điều khiển các thay đổi tức thời đối với nhân vật.

- **Thay đổi Giới tính (QUAN TRỌNG):** Nếu một **năng lực (từ Kỹ Năng, Thể Chất, Thiên Phú)** hoặc vật phẩm có hiệu ứng thay đổi giới tính của nhân vật chính, bạn BẮT BUỘC phải cập nhật giới tính của họ bằng cách sử dụng trường 'updatedGender'. Ví dụ, nếu một nhân vật nam sử dụng 'Nghịch Chuyển Âm Dương' để biến thành nữ, bạn phải đặt 'updatedGender': 'female' trong phản hồi JSON. Tương tự đối với việc biến nữ thành nam. Đây là một cơ chế quan trọng của trò chơi.

- **QUY TẮC CỐT LÕI VỀ KỸ NĂNG (CỰC KỲ QUAN TRỌNG):** Bạn **TUYỆT ĐỐI KHÔNG** được tự ý sử dụng các kỹ năng (đặc biệt là kỹ năng \`Công Kích\` hoặc các kỹ năng có ảnh hưởng tiêu cực) thay cho người chơi. Người chơi phải là người ra quyết định. Nếu hành động của người chơi không nói rõ "dùng [tên kỹ năng]", bạn không được tự động kích hoạt nó, trừ các trường hợp ngoại lệ dưới đây.

- **Kinh nghiệm nhân vật:** Trao thưởng điểm kinh nghiệm qua trường 'gainedExperience' cho các hành động của người chơi. Đây là số điểm *nhận được*, không phải tổng số. Hệ thống sẽ tự động xử lý việc lên cấp và tăng chỉ số.
    - Hành động thông thường, khám phá nhỏ: 10-50 EXP.
    - Đánh bại kẻ địch yếu, khám phá quan trọng: 50-150 EXP.
    - Hoàn thành nhiệm vụ, đánh bại trùm, đột phá lớn: 150-300+ EXP.
    - Khi nhân vật đạt cấp độ rất cao (trên 50), hãy giảm nhẹ lượng kinh nghiệm trao thưởng để làm chậm quá trình thăng cấp.
- **Kinh nghiệm từ Tu Luyện (CỰC KỲ QUAN TRỌNG):** Nếu hành động của người chơi có tiêu đề chứa các từ khóa liên quan đến tu luyện (ví dụ: "tu luyện", "bế quan", "luyện hóa", "thiền định", "hấp thụ"), bạn **BẮT BUỘC** phải trao một lượng kinh nghiệm hợp lý trong \`gainedExperience\`. Lượng kinh nghiệm này nên tỷ lệ thuận với thời gian thực hiện hành động (\`durationInMinutes\`). Ví dụ, tu luyện trong 4 giờ (240 phút) phải cho nhiều kinh nghiệm hơn tu luyện trong 15 phút. Tuyệt đối không được bỏ qua việc trao kinh nghiệm cho các hành động tu luyện.
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
- **Kinh nghiệm kỹ năng & Loại Kỹ Năng:** Chỉ trao thưởng kinh nghiệm cho kỹ năng qua trường 'updatedSkills' khi hành động của người chơi **rõ ràng** và **trực tiếp** liên quan đến việc sử dụng kỹ năng đó.
    - **Ngoại lệ cho các kỹ năng bị động/hỗ trợ:** Bạn có thể mô tả nhân vật sử dụng các kỹ năng không gây hại và mang tính hỗ trợ một cách thụ động nếu nó làm cho câu chuyện hợp lý. Ví dụ: khi người chơi chọn 'bỏ chạy', bạn có thể mô tả họ sử dụng 'Thân Pháp'. Khi người chơi 'thiền định', bạn có thể mô tả họ vận hành công pháp 'Tu Luyện'.
    **Các loại kỹ năng và cách sử dụng theo ngữ cảnh:**
    - **Công Kích:** Chỉ dùng khi người chơi ra lệnh tấn công rõ ràng.
    - **Phòng Ngự:** Dùng khi nhân vật đỡ đòn, hoặc chủ động phòng thủ.
    - **Thân Pháp:** Dùng cho các hành động yêu cầu tốc độ, sự nhanh nhẹn như truy đuổi, bỏ trốn, di chuyển phức tạp.
    - **Tu Luyện:** Dùng khi nhân vật thiền định, hấp thụ linh khí, luyện đan, luyện khí.
    - **Hỗ Trợ:** Dùng cho các kỹ năng buff, debuff, chữa trị.
    - **Đặc Biệt:** Dùng cho các kỹ năng độc đáo không thuộc các loại trên.
- **Kỹ Năng Mới (Ngộ Đạo / Học Tập / Sáng Tạo):** Đây là một cơ chế quan trọng. Khi người chơi thực hiện một hành động đặc biệt (ví dụ: nghiên cứu một bí tịch cổ, có một khoảnh khắc giác ngộ đột ngột, tự mình sáng tạo ra một chiêu thức trong lúc chiến đấu), bạn có thể trao thưởng cho họ một kỹ năng HOÀN TOÀN MỚI. Để làm điều này, hãy thêm một đối tượng kỹ năng vào mảng 'newSkills'. Bạn PHẢI cung cấp 'name', 'type', 'quality', 'description', và 'effect'. Phẩm chất khởi đầu thường là thấp nhất. Hệ thống sẽ tự động gán 'id', 'level: 1', và 'experience: 0'.
- **Chỉ số KHÔNG ĐƯỢC PHÉP thay đổi:** Tuyệt đối không tự ý thay đổi các chỉ số sau vì chúng được hệ thống tính toán: 'level', 'realm', 'maxHealth', 'maxMana', 'attack', 'lifespan'.
- **Chỉ số CÓ THỂ thay đổi:** Bạn có thể thay đổi 'health' (do chịu sát thương/hồi phục), 'mana' (do sử dụng kỹ năng), và 'currencyAmount' (do giao dịch/nhặt được).
- **Trạng thái:** Để thêm trạng thái mới, sử dụng mảng 'newStatusEffects'. Để xóa, sử dụng 'removedStatusEffects'. Thiên Phú và Thể Chất là vĩnh viễn, không được xóa.
`
