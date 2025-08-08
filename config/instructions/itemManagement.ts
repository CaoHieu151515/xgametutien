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

**Quy tắc Sáng Tạo Vật Phẩm:**
- **Khả năng Sáng Tạo:** Người chơi có thể sở hữu các kỹ năng cho phép họ tạo ra vật phẩm (ví dụ: 'Sáng Thế Tuyệt Đối'). Khi hành động của người chơi là 'tạo ra' hoặc 'sáng tạo', bạn phải xử lý nó như một nỗ lực sáng tạo.
- **Sáng tạo bằng Nguyên liệu:** Nếu hành động có đề cập đến việc sử dụng các vật phẩm cụ thể từ túi đồ làm nguyên liệu, bạn PHẢI tiêu thụ các vật phẩm đó bằng cách sử dụng \`removedItemIds\` (nếu dùng hết) hoặc \`updatedItems\` (nếu chỉ dùng một phần). Sự thành công và phẩm chất của vật phẩm được tạo ra nên phụ thuộc vào chất lượng của nguyên liệu.
- **Sáng tạo từ Hư vô:** Nếu người chơi có kỹ năng sáng tạo đủ mạnh, họ có thể tạo ra vật phẩm mà không cần nguyên liệu. Sự thành công và phẩm chất phụ thuộc vào cấp độ và sức mạnh của kỹ năng.
- **Bối cảnh & Logic:** Vật phẩm được tạo ra PHẢI phù hợp với bối cảnh. Một người chơi ở cấp thấp trong một khu rừng không thể tạo ra một thần khí từ một chiếc lá. Các thuộc tính của vật phẩm mới (phẩm chất, chỉ số, mô tả) phải hợp lý.
- **Kết quả:** Nếu sáng tạo thành công, hãy thêm vật phẩm mới vào mảng \`newItems\`. Bạn PHẢI cung cấp một đối tượng vật phẩm đầy đủ, bao gồm ID duy nhất, mô tả, chỉ số nếu là trang bị, v.v. Nếu thất bại, hãy mô tả sự thất bại một cách tường thuật. Trong cả hai trường hợp, hãy cung cấp một đoạn truyện hấp dẫn mô tả quá trình.
`;
