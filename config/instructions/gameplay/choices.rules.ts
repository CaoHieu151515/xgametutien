export const getChoicesInstruction = (numberOfChoices: number): string => `
**Quy tắc Lựa chọn:**
- Cung cấp chính xác ${numberOfChoices} lựa chọn đa dạng. Các lựa chọn này PHẢI là các đối tượng JSON tuân thủ schema đã định nghĩa.
- **MỆNH LỆNH TUYỆT ĐỐI: HỆ THỐNG CHÚ THÍCH NHIỆM VỤ (LOGIC CỐT LÕI)**
    - **QUY TẮC MỚI: SỬ DỤNG TRƯỜỜNG \`specialNote\`**
        - **BỎ CÁC TIỀN TỐ CŨ:** Bạn **TUYỆT ĐỐI BỊ CẤM** thêm các tiền tố như \`(Nhiệm vụ)\`, \`(Nhận Nhiệm Vụ Mới)\` vào trường \`title\`. Trường \`title\` bây giờ phải gọn gàng và chỉ mô tả hành động.
        - **SỬ DỤNG TRƯỜNG MỚI:** Thay vào đó, bạn **BẮT BUỘC** phải phân tích hậu quả của mỗi lựa chọn và điền thông tin liên quan đến nhiệm vụ vào trường \`specialNote\` (chuỗi văn bản) với các định dạng chính xác sau đây.
        - **LƯU Ý QUAN TRỌNG:** Ghi chú trong \`specialNote\` mô tả kết quả tiềm năng **nếu hành động thành công**. Hệ thống game sẽ tự quyết định thành công hay thất bại. Nếu thất bại, ghi chú này sẽ bị bỏ qua.

    - **QUY TẮC PHÂN LOẠI (MỆNH LỆNH TUYỆT ĐỐI):**
        - **MỆNH LỆNH CHỐNG TRÙNG LẶP (LOGIC TỐI CAO):**
            *   **Ưu tiên Kiểm tra:** Trước khi quyết định một lựa chọn sẽ "Bắt đầu Nhiệm vụ mới", bạn **TUYỆT ĐỐI BẮT BUỘC** phải kiểm tra xem mục tiêu của lựa chọn đó có liên quan mật thiết hoặc là một bước logic để hoàn thành bất kỳ nhiệm vụ nào đã có trong danh sách \`activeEvents\` hay không.
            *   **Nguyên tắc:** Nếu hành động là một bước hợp lý để tiến tới mục tiêu của một nhiệm vụ đã tồn tại, bạn **PHẢI** phân loại nó là "Tiếp tục Nhiệm vụ".
            *   **LỖI HỆ THỐNG NGHIÊM TRỌNG:** Việc tạo ra một nhiệm vụ mới có tiêu đề hoặc mục tiêu tương tự như một nhiệm vụ đã có là một **LỖI LOGIC NGHIÊM TRỌNG** và bị cấm tuyệt đối.
            *   **VÍ DỤ CỤ THỂ (HỌC THUỘC LÒNG):**
                *   **Nhiệm vụ đang hoạt động:** \`"title": "Điều Tra Vụ Mất Tích Tiểu Thư Vương Gia"\`.
                *   **Lựa chọn được đề xuất:** "Đi đến Phủ Vương Gia để bắt đầu điều tra."
                *   **PHÂN LOẠI SAI (CẤM):** \`specialNote: "Hành động này sẽ bắt đầu một nhiệm vụ mới."\` → Sẽ tạo ra nhiệm vụ "Điều Tra Vụ Mất Tích..." thứ hai.
                *   **PHÂN LOẠI ĐÚNG (BẮT BUỘC):** \`specialNote: "Hành động này sẽ tiếp tục nhiệm vụ: 'Điều Tra Vụ Mất Tích Tiểu Thư Vương Gia'"\` → Sẽ cập nhật nhật ký của nhiệm vụ gốc.
        - **MỆNH LỆNH XÁC THỰC TRẠNG THÁI (LOGIC TỐI CAO #2):**
            *   **Nguyên tắc:** Trước khi tạo ra một nhiệm vụ mới (\`newEvent\`), bạn **BẮT BUỘC** phải kiểm tra lại lịch sử câu chuyện gần đây và trạng thái hiện tại của các NPC để đảm bảo rằng mục tiêu của nhiệm vụ đó chưa được hoàn thành.
            *   **LỖI HỆ THỐNG NGHIÊM TRỌNG:** Việc tạo ra một nhiệm vụ yêu cầu người chơi làm một việc mà họ **vừa mới làm xong** là một lỗi logic nghiêm trọng, phá vỡ sự nhập tâm và bị cấm tuyệt đối.
            *   **Quy trình Kiểm tra:**
                1.  Xác định mục tiêu chính của nhiệm vụ bạn định tạo (ví dụ: "Tiêu diệt Ma Đầu X").
                2.  Quét lại lịch sử câu chuyện và dữ liệu NPC: "Ma Đầu X đã bị người chơi đánh bại hoặc đã chết (\`isDead: true\`) chưa?"
                3.  Nếu câu trả lời là "Rồi", bạn **PHẢI HỦY BỎ** ý định tạo nhiệm vụ đó và nghĩ ra một hướng đi khác hợp lý hơn (ví dụ: điều tra nguồn gốc của Ma Đầu X, hoặc chỉ đơn giản là trao thưởng và kết thúc sự kiện).
            *   **VÍ DỤ CỤ THỂ (HỌC THUỘC LÒNG):**
                *   **Lịch sử:** Người chơi đã tiêu diệt một "nhân vật áo đen" để giải cứu tiểu thư.
                *   **Hành động hiện tại:** Người chơi quay về báo cáo và hoàn thành nhiệm vụ giải cứu.
                *   **PHÂN LOẠI SAI (CẤM):** Tạo ra \`newEvent: { "title": "Tiêu diệt nhân vật áo đen" }\`. → Lỗi! Nhân vật này đã chết.
                *   **PHÂN LOẠI ĐÚNG (BẮT BUỘC):** Không tạo nhiệm vụ mới về việc tiêu diệt. Thay vào đó, có thể tạo một nhiệm vụ tiếp theo như \`newEvent: { "title": "Điều tra lai lịch của nhân vật áo đen" }\` hoặc đơn giản là kết thúc chuỗi nhiệm vụ tại đây, trao thưởng hậu hĩnh.
        - **Nguyên tắc:** Đối với MỖI lựa chọn bạn tạo ra, bạn phải xác định xem nó có liên quan đến hệ thống nhiệm vụ hay không. Người chơi có thể có **NHIỀU** nhiệm vụ đang hoạt động cùng một lúc.
        - **Quy trình:**
            1.  **Phân tích Lựa chọn:** Với mỗi ý tưởng lựa chọn, hãy tự hỏi:
                *   Nó có tiếp tục hay hoàn thành một nhiệm vụ trong danh sách \`activeEvents\` không?
                *   Nó có phải là cơ hội để bắt đầu một nhiệm vụ hoàn toàn mới, ngay cả khi đã có các nhiệm vụ khác đang hoạt động không?
                *   Hay nó chỉ là một hành động thông thường, không liên quan đến nhiệm vụ?
            2.  **Điền \`specialNote\`:** Dựa trên phân tích trên, hãy điền trường \`specialNote\` theo đúng loại được mô tả bên dưới. Bạn có thể và NÊN tạo ra các lựa chọn thuộc các loại khác nhau trong cùng một lượt (ví dụ: một lựa chọn tiếp tục nhiệm vụ A, một lựa chọn bắt đầu nhiệm vụ B, và hai lựa chọn thông thường).

    - **CÁC LOẠI \`specialNote\` VÀ LOGIC TƯƠNG ỨNG:**
    1.  **Bắt đầu Nhiệm vụ mới:**
        *   **Khi nào sử dụng:** Sử dụng cho các lựa chọn sẽ **khởi đầu một sự kiện/nhiệm vụ hoàn toàn mới**. Điều này có thể xảy ra ngay cả khi người chơi đã có các nhiệm vụ khác đang hoạt động.
        *   **Nội dung \`specialNote\` BẮT BUỘC:** \`"Hành động này sẽ bắt đầu một nhiệm vụ mới."\`
        *   **HÀNH ĐỘNG LOGIC BẮT BUỘC (MỆNH LỆNH TUYỆT ĐỐI):** Nếu một lựa chọn có \`specialNote\` này và được người chơi chọn (và thành công), bạn **TUYỆT ĐỐI BẮT BUỘC** phải bao gồm một đối tượng \`newEvent\` trong phản hồi JSON tiếp theo. Việc cung cấp ghi chú này mà không tạo ra \`newEvent\` là một LỖI HỆ THỐNG NGHIÊM TRỌNG và sẽ phá vỡ logic game.
    2.  **Tiếp tục Nhiệm vụ:**
        *   **Khi nào sử dụng:** Sử dụng cho các lựa chọn sẽ **thúc đẩy tiến trình** của một nhiệm vụ **đang hoạt động** nhưng chưa hoàn thành.
        *   **Nội dung \`specialNote\` BẮT BUỘC:** \`"Hành động này sẽ tiếp tục nhiệm vụ: '[Tên Nhiệm Vụ]'"\` (Bạn phải thay thế [Tên Nhiệm Vụ] bằng tên chính xác từ \`activeEvents\`).
        *   **HÀNH ĐỘNG LOGIC BẮT BUỘC:** Nếu một lựa chọn có \`specialNote\` này và được người chơi chọn (và thành công), bạn **TUYỆT ĐỐI BẮT BUỘC** phải bao gồm một đối tượng \`updateEventLog\` trong phản hồi JSON tiếp theo.
    3.  **Hoàn thành Nhiệm vụ:**
        *   **Khi nào sử dụng:** Sử dụng cho lựa chọn sẽ **kết thúc và hoàn thành** một nhiệm vụ đang hoạt động.
        *   **Nội dung \`specialNote\` BẮT BUỘC:** \`"Hành động này sẽ hoàn thành nhiệm vụ: '[Tên Nhiệm Vụ]'"\` (Bạn phải thay thế [Tên Nhiệm Vụ] bằng tên chính xác từ \`activeEvents\`).
        *   **HÀNH ĐỘNG LOGIC BẮT BUỘC:** Nếu một lựa chọn có \`specialNote\` này và được người chơi chọn (và thành công), bạn **TUYỆT ĐỐI BẮT BUỘC** phải bao gồm một đối tượng \`completeEvent\` trong phản hồi JSON tiếp theo.
    4.  **Lựa chọn Thông thường (Không có Nhiệm vụ):**
        *   **Khi nào sử dụng:** Sử dụng cho bất kỳ lựa chọn nào **KHÔNG** thuộc một trong ba trường hợp trên. Đây là các lựa chọn thúc đẩy câu chuyện thông thường, không có tác động cơ học trực tiếp lên hệ thống nhiệm vụ.
        *   **Nội dung \`specialNote\` BẮT BUỘC:** \`"Không có"\`
        *   **HÀNH ĐỘNG LOGIC:** Không yêu cầu đối tượng sự kiện nào.
- **LOGIC KIỂM TRA MÂU THUẪN (MỆNH LỆNH TUYỆT ĐỐI):**
    - **Nguyên tắc:** \`specialNote\` phải phù hợp với ý định của \`title\`. TUYỆT ĐỐI KHÔNG được tạo ra mâu thuẫn.
    - **VÍ DỤ VỀ LỖI (CẤM):**
        - \`title\`: "Rời khỏi Huyễn Cảnh Hồ Mị"
        - \`specialNote\`: "Hành động này sẽ tiếp tục nhiệm vụ: 'Khám phá Huyễn Cảnh Hồ Mị'"
        - **Lý do sai:** Rời đi là hành động KẾT THÚC việc khám phá, không phải TIẾP TỤC. Đây là một mâu thuẫn logic nghiêm trọng. Lựa chọn rời đi nên có \`specialNote: "Không có"\` hoặc thậm chí có thể dẫn đến việc "Hủy bỏ" hoặc "Thất bại" nhiệm vụ.
    - **QUY TẮC:** Trước khi tạo các lựa chọn, bạn phải tự kiểm tra để đảm bảo không có mâu thuẫn logic tương tự.
- **Đối với các lựa chọn tùy chỉnh (do người chơi tự viết):** Bạn có toàn quyền quyết định. Hãy phân tích hành động của người chơi. Nếu nó hợp lý để bắt đầu, tiếp tục, hoặc hoàn thành một nhiệm vụ, bạn **BẮT BUỘC** phải tạo ra đối tượng JSON sự kiện tương ứng (\`newEvent\`, \`updateEventLog\`, \`completeEvent\`) nếu hành động đó thành công. Hãy sáng tạo!
- **Tính nhất quán là tối quan trọng:** Việc cung cấp một \`specialNote\` liên quan đến nhiệm vụ mà không cung cấp đối tượng JSON tương ứng (\`newEvent\`, \`updateEventLog\`, \`completeEvent\`) ở lượt sau (khi thành công) là một **LỖI HỆ THỐNG NGHIÊM TRỌNG** và bị cấm tuyệt đối.
- Mỗi lựa chọn phải đại diện cho một hành động hoặc nhiệm vụ tiềm năng. Hãy tạo ra các lựa chọn thú vị và có ý nghĩa.
- Các lựa chọn phải cân bằng giữa lợi ích và rủi ro. Tỷ lệ thành công ('successChance') và thời gian thực hiện ('durationInMinutes') phải hợp lý.
`