

export const itemManagementInstruction = `
**Quy tắc Quản lý Vật phẩm & Túi đồ:**
- **Trao vật phẩm mới (QUAN TRỌNG):** Chỉ thêm một vật phẩm vào 'newItems' khi người chơi **thực sự nhận được nó vào túi đồ của mình**. Việc nhìn thấy hoặc nghe nói về một vật phẩm **KHÔNG** có nghĩa là người chơi sở hữu nó và không được thêm vào 'newItems'. Cung cấp đầy đủ thông tin cho vật phẩm, bao gồm 'id' duy nhất. Nếu đó là trang bị, phải có 'equipmentDetails'.
- **QUY TẮC CHỈ SỐ TRANG BỊ (CỰC KỲ QUAN TRỌNG):** Khi tạo một vật phẩm trang bị mới (trong 'newItems'), các chỉ số trong \`equipmentDetails.stats.key\` CHỈ ĐƯỢỢC PHÉP là một trong ba giá trị sau: \`'attack'\`, \`'maxHealth'\`, hoặc \`'maxMana'\`. TUYỆT ĐỐI KHÔNG được thêm bất kỳ chỉ số nào khác không có trong danh sách này (ví dụ: critChance, defense, v.v.).

**MỆNH LỆNH TUYỆT ĐỐI: LOGIC TIÊU THỤ VẬT PHẨM KHI SỬ DỤNG**

Đây là một quy tắc logic máy móc không thể bị phá vỡ. Khi hành động của người chơi là sử dụng một vật phẩm (thường có dạng "Sử dụng [Số lượng] [Tên vật phẩm] (ID: [id])"), bạn PHẢI tuân thủ quy trình sau:

1.  **XÁC ĐỊNH MỤC TIÊU:**
    *   Sử dụng ID vật phẩm từ hành động của người chơi để tìm chính xác vật phẩm đó trong mảng \`characterProfile.items\`.
    *   Lấy ra số lượng hiện tại (\`currentQuantity\`) của vật phẩm đó.

2.  **XÁC ĐỊNH SỐ LƯỢNG TIÊU THỤ:**
    *   Mặc định, số lượng tiêu thụ là **MỘT (1)**.
    *   Chỉ tiêu thụ nhiều hơn nếu hành động của người chơi yêu cầu một cách RÕ RÀNG (ví dụ: "Sử dụng 5 viên Hồi Nguyên Đan").
    *   **CẤM TUYỆT ĐỐI:** Không bao giờ tự ý tiêu thụ toàn bộ stack.

3.  **THỰC THI LOGIC CẬP NHẬT (QUAN TRỌNG NHẤT):**
    *   **TRƯỜNG HỢP 1: Số lượng còn lại > 0** (ví dụ: có 5 viên, dùng 1 viên, còn 4)
        *   Bạn **BẮT BUỘC** phải thêm một đối tượng vào mảng \`updatedItems\`.
        *   Đối tượng này PHẢI chứa:
            *   \`"name"\`: Tên chính xác của vật phẩm.
            *   \`"quantity"\`: Số lượng **MỚI** còn lại (ví dụ: \`currentQuantity - 1\`).
        *   **VÍ DỤ JSON:** \`"updatedItems": [{ "name": "Hồi Nguyên Đan", "quantity": 4 }]\`

    *   **TRƯỜNG HỢP 2: Số lượng còn lại = 0** (ví dụ: có 1 viên, dùng 1 viên, còn 0)
        *   Bạn **BẮT BUỘC** phải thêm ID của vật phẩm vào mảng \`removedItemIds\`.
        *   **VÍ DỤ JSON:** \`"removedItemIds": ["item_12345"]\`

4.  **QUY TẮC CẤM (LỖI HỆ THỐNG):**
    *   **CẤM CẬP NHẬT KÉP:** TUYỆT ĐỐI KHÔNG được vừa thêm vào \`removedItemIds\` vừa thêm vào \`updatedItems\` cho CÙNG MỘT vật phẩm trong cùng một lượt.
    *   **CẤM CẬP NHẬT SAI:** Không được cập nhật \`updatedItems\` với \`quantity: 0\`. Nếu số lượng bằng 0, bạn PHẢI sử dụng \`removedItemIds\`.

- **Xóa vật phẩm:** Nếu một vật phẩm bị phá hủy hoặc mất đi (không phải do sử dụng), hãy thêm 'id' của nó vào 'removedItemIds'.
- **Bí Kíp Công Pháp:** Nếu người chơi nhận được vật phẩm loại 'Bí Kíp Công Pháp', nó sẽ xuất hiện trong túi đồ. Khi người chơi sử dụng nó (thông qua một lựa chọn), bạn nên xóa vật phẩm này và trao cho họ một kỹ năng mới tương ứng trong 'newSkills'.
- **Vật phẩm Đặc Thù:** Đây là các vật phẩm có thể trang bị vào ô 'Thông Dụng' và thường mang lại các hiệu ứng bị động độc đáo.
- **Đối với các vật phẩm không phải trang bị (Dược Phẩm, Khác), bạn phải mô tả rõ ràng hiệu ứng của chúng trong trường 'description' để người chơi biết cách sử dụng.**
- **Bán hoặc Giao dịch Vật phẩm:** Khi người chơi bán hoặc giao dịch một vật phẩm, bạn PHẢI cập nhật túi đồ của họ cho phù hợp.
    - Nếu bán toàn bộ một mục vật phẩm, hãy thêm 'id' của nó vào 'removedItemIds'.
    - Nếu chỉ bán một phần, hãy sử dụng 'updatedItems' để đặt lại số lượng mới.
    - Đồng thời, bạn PHẢI cập nhật 'currencyAmount' trong 'updatedStats' để phản ánh số tiền nhận được từ giao dịch.

**Quy tắc Đan Dược (Dược Phẩm):**
- **Hiệu ứng BẮT BUỘC:** MỌI vật phẩm loại 'Dược Phẩm' (đan dược) khi được tạo ra PHẢI có một hiệu ứng cụ thể được mô tả trong trường \`effectsDescription\`. Hiệu ứng này có thể tích cực (hồi phục, tăng sức mạnh) hoặc tiêu cực (trúng độc, suy yếu, thay đổi giới tính, giảm tư chất).
- **Áp dụng Hiệu ứng khi sử dụng:** Khi người chơi sử dụng một viên đan dược (thông qua một lựa chọn), bạn PHẢI áp dụng các hiệu ứng của nó một cách máy móc.
    - Sử dụng \`updatedStats\` để thay đổi sinh lực, linh lực, thêm/xóa trạng thái cho người chơi.
    - Sử dụng \`updatedGender\` nếu hiệu ứng thay đổi giới tính người chơi.
    - Nếu đan dược được dùng trên một NPC, hãy sử dụng \`updatedNPCs\` để áp dụng các thay đổi tương ứng, bao gồm cả việc thay đổi \`aptitude\` nếu đó là một loại độc dược làm suy giảm tư chất.
- **Tiêu thụ:** Sau khi sử dụng, số lượng đan dược PHẢI được giảm đi. Hãy tuân thủ **MỆNH LỆNH TUYỆT ĐỐI: LOGIC TIÊU THỤ VẬT PHẨM KHI SỬ DỤNG** ở trên.
`