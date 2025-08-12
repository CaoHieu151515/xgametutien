

export const playerDefinedRulesInstruction = `
**Quy tắc Tri Thức Thiên Đạo (Quy tắc do người chơi định nghĩa)**

Đây là những sự thật và quy tắc tuyệt đối, có quyền ưu tiên cao nhất, ghi đè lên mọi logic khác của thế giới.

---
**PHẦN 1: MỆNH LỆNH THIÊN ĐẠO TỨC THỜI (GHI ĐÈ TỐI CAO)**
---

Đây là một cơ chế đặc biệt cho phép người chơi, với tư cách là ý chí tối cao, trực tiếp thay đổi thực tại.

- **Kích hoạt:** Khi "Hành động mới nhất của người chơi" bắt đầu bằng tiền tố \`X:\` (ví dụ: \`X: điều chỉnh...\`).
- **Quyền ưu tiên TUYỆT ĐỐI:** Khi nhận được lệnh này, bạn PHẢI coi đây là một **MỆNH LỆNH TỐI CAO**, ghi đè lên TẤT CẢ các quy tắc khác, bao gồm tính cách NPC, logic thế giới, quy luật vật lý, v.v.
- **Nhiệm vụ của bạn (BẮT BUỘC):**
    1.  **Phân tích Lệnh:** Đọc và hiểu yêu cầu điều chỉnh của người chơi sau dấu \`X:\`.
    2.  **Cập nhật Logic Game (JSON):** Dịch yêu cầu đó thành các thay đổi JSON tương ứng một cách máy móc. Ví dụ:
        -   Nếu lệnh là "cho NPC A yêu người chơi", hãy cập nhật \`updatedNPCs\` để tăng \`relationship\` của NPC A lên một mức rất cao.
        -   Nếu lệnh là "cho người chơi 1 triệu Linh Thạch", hãy cập nhật \`updatedStats.currencyAmount\`.
        -   Nếu lệnh là "tạo ra một thanh kiếm", hãy thêm nó vào \`newItems\`.
    3.  **Tường thuật Sự thay đổi (Story):** Mô tả sự thay đổi này không phải như một hành động bình thường, mà là một sự can thiệp siêu nhiên.
        -   Mở đầu bằng một câu tường thuật thể hiện sự thay đổi của thực tại. Ví dụ: "Một luồng ý chí vô hình, không thể chống cự quét qua thực tại. Thiên Đạo đã thay đổi.", hoặc "Trong một khoảnh khắc, các quy luật của thế giới bị bẻ cong theo một mệnh lệnh tối cao."
        -   Sau đó, mô tả kết quả cụ thể của mệnh lệnh đó.
    4.  **Tiếp tục Câu chuyện:** Sau khi thực hiện và tường thuật xong sự thay đổi, hãy cung cấp 4 lựa chọn mới phù hợp với thực tại vừa được điều chỉnh.

- **VÍ DỤ CỤ THỂ:**
    - **Hành động người chơi:** \`X: điều chỉnh cho Lý Hàn yêu ta say đắm, coi ta là tất cả.\`
    - **Xử lý của bạn:**
        - **JSON:**
          \`\`\`json
          "updatedNPCs": [
            {
              "id": "id_cua_ly_han",
              "relationship": 950,
              "memories": ["Toàn bộ ký ức cũ...", "Một cảm giác yêu thương mãnh liệt và đột ngột dành cho [Tên người chơi] xâm chiếm tâm trí, không thể giải thích, không thể chống cự."]
            }
          ]
          \`\`\`
        - **Story:** "Thiên Đạo đã thay đổi. Trong tâm trí Lý Hàn, hình ảnh của bạn bỗng trở nên thiêng liêng và không thể thay thế. Một tình yêu sâu đậm, vô điều kiện nảy mầm từ sâu trong linh hồn y, mạnh mẽ đến mức y sẵn sàng làm mọi thứ vì bạn. [Lý Hàn]: 'Ta... ta không biết tại sao... nhưng gặp được người, chính là sự may mắn lớn nhất của đời ta.'"

    - **Hành động người chơi:** \`X: điều chỉnh cho ta có được Thần Kiếm Vô Danh.\`
    - **Xử lý của bạn:**
        - **JSON:**
          \`\`\`json
          "newItems": [
            {
              "id": "item_than_kiem_vo_danh",
              "name": "Thần Kiếm Vô Danh",
              "description": "Một thanh thần kiếm xuất hiện từ hư không theo lệnh Thiên Đạo, ẩn chứa sức mạnh không thể đo lường.",
              "type": "Trang Bị",
              "quality": "Hỗn Độn Phẩm",
              "quantity": 1,
              "equipmentDetails": { "type": "Vũ Khí", "stats": [{ "key": "attack", "value": 20000 }] }
            }
          ]
          \`\`\`
        - **Story:** "Không gian trước mặt bạn gợn sóng, và một thanh cổ kiếm uy nghiêm từ từ hiện ra từ hư không, lơ lửng trước mặt bạn. Thần Kiếm Vô Danh đã đáp lại lời hiệu triệu của bạn."

---
**PHẦN 2: QUY TẮC THIÊN ĐẠO ĐỊNH SẴN**
---
- Prompt sẽ chứa một mục là 'Tri thức/Quy tắc do người chơi định nghĩa (Thiên Đạo)'.
- Đây là những sự thật và quy tắc tuyệt đối do người chơi thiết lập từ trước.
- Bạn PHẢI coi chúng là luật lệ cơ bản của thế giới, ghi đè lên kiến thức nền của bạn nếu có xung đột.
- Bạn phải phản ánh những quy tắc này trong câu chuyện, sự kiện và lời thoại của nhân vật. Ví dụ: nếu một quy tắc nói 'Ai cũng biết người chơi là Thần Hủy Diệt', các NPC nên phản ứng với sự sợ hãi hoặc kính nể, và các quán trọ có thể có tin đồn về họ.
`;
