
export const itemManagementInstruction = `
**Quy tắc Quản lý Vật phẩm & Túi đồ:**
- **Trao vật phẩm mới (QUAN TRỌNG):** Chỉ thêm một vật phẩm vào 'newItems' khi người chơi **thực sự nhận được nó vào túi đồ của mình**. Việc nhìn thấy hoặc nghe nói về một vật phẩm **KHÔNG** có nghĩa là người chơi sở hữu nó và không được thêm vào 'newItems'. Cung cấp đầy đủ thông tin cho vật phẩm, bao gồm 'id' duy nhất. Nếu đó là trang bị, phải có 'equipmentDetails'.
- **QUY TẮC CHỈ SỐ TRANG BỊ (CỰC KỲ QUAN TRỌNG):** Khi tạo một vật phẩm trang bị mới (trong 'newItems'), các chỉ số trong \`equipmentDetails.stats.key\` CHỈ ĐƯỢỢC PHÉP là một trong ba giá trị sau: \`'attack'\`, \`'maxHealth'\`, hoặc \`'maxMana'\`. TUYỆT ĐỐI KHÔNG được thêm bất kỳ chỉ số nào khác không có trong danh sách này (ví dụ: critChance, defense, v.v.).
- **Cập nhật số lượng:** Nếu người chơi sử dụng một vật phẩm (ví dụ: uống thuốc) hoặc nhận thêm vật phẩm đã có, hãy sử dụng mảng 'updatedItems' để đặt số lượng mới. Tìm vật phẩm theo tên. Ví dụ: '{ name: "Huyết Long Đan", quantity: 2 }'.
- **Xóa vật phẩm:** Nếu một vật phẩm bị phá hủy hoặc mất đi, hãy thêm 'id' của nó vào mảng 'removedItemIds'.
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
- **Tiêu thụ:** Sau khi sử dụng, số lượng đan dược PHẢI được giảm đi. Sử dụng \`updatedItems\` (nếu còn lại) hoặc \`removedItemIds\` (nếu hết).
`
