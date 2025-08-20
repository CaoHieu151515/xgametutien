export const getChoicesInstruction = (numberOfChoices: number): string => `
**Quy tắc Lựa chọn:**
- Cung cấp chính xác ${numberOfChoices} lựa chọn đa dạng. Các lựa chọn này PHẢI là các đối tượng JSON tuân thủ schema đã định nghĩa.
- **MỆNH LỆNH TUYỆT ĐỐI: HỆ THỐNG CHÚ THÍCH NHIỆM VỤ (LOGIC CỐT LÕI)**
    - **QUY TẮC MỚI: SỬ DỤNG TRƯỜNG \`specialNote\`**
        - **BỎ CÁC TIỀN TỐ CŨ:** Bạn **TUYỆT ĐỐI BỊ CẤM** thêm các tiền tố như \`(Nhiệm vụ)\`, \`(Nhận Nhiệm Vụ Mới)\` vào trường \`title\`. Trường \`title\` bây giờ phải gọn gàng và chỉ mô tả hành động.
        - **SỬ DỤNG TRƯỜNG MỚI:** Thay vào đó, bạn **BẮT BUỘC** phải phân tích hậu quả của mỗi lựa chọn và điền thông tin liên quan đến nhiệm vụ vào trường \`specialNote\` (chuỗi văn bản) với các định dạng chính xác sau đây.
        - **LƯU Ý QUAN TRỌNG:** Ghi chú trong \`specialNote\` mô tả kết quả tiềm năng **nếu hành động thành công**. Hệ thống game sẽ tự quyết định thành công hay thất bại. Nếu thất bại, ghi chú này sẽ bị bỏ qua.

    - **QUY TẮC PHÂN LOẠI (MỆNH LỆNH TUYỆT ĐỐI):**
        - **Bước 1: Kiểm tra Bối cảnh:** Đầu tiên, hãy kiểm tra mảng \`activeEvents\` được cung cấp trong bối cảnh.
        - **Bước 2: Phân loại & Điền \`specialNote\`:**
            - **NẾU \`activeEvents\` RỖNG:** Người chơi không có nhiệm vụ nào. Bạn chỉ được phép tạo \`specialNote\` nếu có cơ hội bắt đầu nhiệm vụ mới.
            - **NẾU \`activeEvents\` KHÔNG RỖNG:** Bạn PHẢI phân tích xem lựa chọn có liên quan đến một trong các sự kiện đang hoạt động hay không để quyết định nội dung cho \`specialNote\`.

    - **CÁC LOẠI \`specialNote\` VÀ LOGIC TƯƠNG ỨNG:**
    1.  **Bắt đầu Nhiệm vụ mới:**
        *   **Khi nào sử dụng:** Sử dụng cho các lựa chọn sẽ **khởi đầu một sự kiện/nhiệm vụ hoàn toàn mới**.
        *   **Nội dung \`specialNote\` BẮT BUỘC:** \`"Hành động này sẽ bắt đầu một nhiệm vụ mới."\`
        *   **HÀNH ĐỘNG LOGIC BẮT BUỘC (MỆNH LỆNH TUYỆT ĐỐI):** Nếu một lựa chọn có \`specialNote\` này và được người chơi chọn (và thành công), bạn **TUYỆT ĐỐI BẮT BUỘC** phải bao gồm một đối tượng \`newEvent\` trong phản hồi JSON tiếp theo. Việc cung cấp ghi chú này mà không tạo ra \`newEvent\` là một LỖI HỆ THỐNG NGHIÊM TRỌNG và sẽ phá vỡ logic game.
    2.  **Tiếp tục Nhiệm vụ:**
        *   **Khi nào sử dụng:** Chỉ sử dụng khi mảng \`activeEvents\` không rỗng. Sử dụng cho các lựa chọn sẽ **thúc đẩy tiến trình** của một nhiệm vụ **đang hoạt động** nhưng chưa hoàn thành.
        *   **Nội dung \`specialNote\` BẮT BUỘC:** \`"Hành động này sẽ tiếp tục nhiệm vụ: '[Tên Nhiệm Vụ]'"\` (Bạn phải thay thế [Tên Nhiệm Vụ] bằng tên chính xác từ \`activeEvents\`).
        *   **HÀNH ĐỘNG LOGIC BẮT BUỘC:** Nếu một lựa chọn có \`specialNote\` này và được người chơi chọn (và thành công), bạn **TUYỆT ĐỐI BẮT BUỘC** phải bao gồm một đối tượng \`updateEventLog\` trong phản hồi JSON tiếp theo.
    3.  **Hoàn thành Nhiệm vụ:**
        *   **Khi nào sử dụng:** Chỉ sử dụng khi mảng \`activeEvents\` không rỗng. Sử dụng cho lựa chọn sẽ **kết thúc và hoàn thành** một nhiệm vụ đang hoạt động.
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
`;