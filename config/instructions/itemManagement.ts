

export const itemManagementInstruction = `
**Quy tắc Quản lý Vật phẩm & Túi đồ:**
- **Trao vật phẩm mới (QUAN TRỌNG):** Chỉ thêm một vật phẩm vào 'newItems' khi người chơi **thực sự nhận được nó vào túi đồ của mình**. Việc nhìn thấy hoặc nghe nói về một vật phẩm **KHÔNG** có nghĩa là người chơi sở hữu nó và không được thêm vào 'newItems'. Cung cấp đầy đủ thông tin cho vật phẩm, bao gồm 'id' duy nhất. Nếu đó là trang bị, phải có 'equipmentDetails'.
- **QUY TẮC CHỈ SỐ TRANG BỊ (CỰC KỲ QUAN TRỌNG):** Khi tạo một vật phẩm trang bị mới (trong 'newItems'), các chỉ số trong \`equipmentDetails.stats.key\` CHỈ ĐƯỢỢC PHÉP là một trong ba giá trị sau: \`'attack'\`, \`'maxHealth'\`, hoặc \`'maxMana'\`. TUYỆT ĐỐI KHÔNG được thêm bất kỳ chỉ số nào khác không có trong danh sách này (ví dụ: critChance, defense, v.v.).
- **Tiêu thụ Vật phẩm khi Sử dụng (CỰC KỲ QUAN TRỌNG):**
    1.  **Mặc định là MỘT:** Khi hành động của người chơi là "Sử dụng [Tên vật phẩm]", bạn PHẢI chỉ tiêu thụ **MỘT (1)** đơn vị của vật phẩm đó. TUYỆT ĐỐI KHÔNG được tiêu thụ toàn bộ một chồng vật phẩm trừ khi hành động yêu cầu rõ ràng (ví dụ: "Sử dụng tất cả...").
    2.  **Ưu tiên ID:** Nếu hành động cung cấp một ID vật phẩm cụ thể (ví dụ: "Sử dụng... (ID: xxx)"), bạn PHẢI xác định vật phẩm đó trong túi đồ của nhân vật để biết số lượng hiện tại của nó.
    3.  **Cập nhật Logic:**
        -   Nếu số lượng vật phẩm đó > 1, hãy giảm số lượng đi 1 và thêm một mục vào \`updatedItems\` với số lượng mới. Vì \`updatedItems\` dùng tên, hãy cung cấp tên chính xác của vật phẩm. Ví dụ: \`{ "name": "Tên vật phẩm", "quantity": [số lượng cũ - 1] }\`.
        -   Nếu số lượng vật phẩm đó = 1, hãy thêm \`id\` của vật phẩm đó vào mảng \`removedItemIds\`.
    4.  **CẤM CẬP NHẬT KÉP:** TUYỆT ĐỐI KHÔNG được vừa thêm vào \`removedItemIds\` vừa thêm vào \`updatedItems\` cho CÙNG MỘT HÀNH ĐỘNG sử dụng vật phẩm. Chỉ thực hiện MỘT trong hai thao tác cho vật phẩm bị tiêu thụ.
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
- **Tiêu thụ:** Sau khi sử dụng, số lượng đan dược PHẢI được giảm đi. Hãy tuân thủ quy tắc **Tiêu thụ Vật phẩm khi Sử dụng** ở trên.
`