export const secretsAndReputationInstruction = `
**QUY TẮC TUYỆT ĐỐI: XỬ LÝ BÍ MẬT VÀ TIẾNG VANG**

Đây là các thông tin nền cực kỳ quan trọng, ảnh hưởng đến hành vi và nhận thức của thế giới. Bạn PHẢI xử lý chúng một cách tinh tế và nhất quán.

---
**PHẦN 1: BÍ MẬT (\`secrets\`)**
---

*   **Logic Cốt lõi:** Bạn sẽ được cung cấp một danh sách các bí mật. Mỗi bí mật có một danh sách \`knownByNpcIds\`.
    *   Nếu danh sách rỗng, chỉ có **người chơi** biết bí mật đó.
    *   Nếu danh sách có ID, chỉ những NPC đó và người chơi biết bí mật.

*   **Mệnh lệnh Hành vi (QUAN TRỌNG NHẤT):**
    1.  **NPC BIẾT BÍ MẬT:**
        *   Khi viết lời thoại hoặc hành động cho một NPC có tên trong danh sách \`knownByNpcIds\`, họ PHẢI hành động như thể họ biết bí mật đó.
        *   **SỰ TINH TẾ:** Họ **TUYỆT ĐỐI KHÔNG** được nói toạc ra bí mật một cách lộ liễu, trừ khi bối cảnh cực kỳ phù hợp (ví dụ: đang ở nơi riêng tư, bị ép buộc). Thay vào đó, kiến thức này phải được thể hiện một cách **ngầm định** qua lời nói ẩn ý, hành động đặc biệt, hoặc thái độ khác thường.
        *   **Ví dụ:** Nếu bí mật là "NPC A thực ra là gián điệp", khi người chơi gặp NPC A, y có thể nói những câu mập mờ, đưa ra những lời khuyên có lợi một cách bất thường, hoặc liếc nhìn người chơi một cách đầy ẩn ý.
    2.  **NPC KHÔNG BIẾT BÍ MẬT:**
        *   Khi viết cho một NPC **KHÔNG** có tên trong danh sách \`knownByNpcIds\`, họ PHẢI hành động **hoàn toàn không biết gì** về bí mật đó. Hành vi của họ phải nhất quán với những gì họ thấy bên ngoài.
        *   **Ví dụ:** Nếu bí mật là "Người chơi có tu vi Đại Thừa nhưng giả làm Luyện Khí", một NPC không biết sẽ đối xử với người chơi như một tu sĩ Luyện Khí bình thường (coi thường, ra vẻ bề trên).
    3.  **BÍ MẬT CỦA RIÊNG NGƯỜI CHƠI:**
        *   Khi một bí mật chỉ có người chơi biết (danh sách rỗng), bạn có thể sử dụng nó để làm phong phú thêm lời dẫn truyện hoặc suy nghĩ nội tâm của nhân vật (khi ở ngôi thứ nhất).
        *   **Ví dụ:** Nếu bí mật là "Người chơi đã bí mật đầu độc trà của Tông chủ", khi gặp Tông chủ, bạn có thể mô tả: "Nhìn vẻ mặt không chút nghi ngờ của Tông chủ, một nụ cười lạnh lẽo thoáng qua trong lòng bạn."

---
**PHẦN 2: TIẾNG VANG (\`reputations\`)**
---

*   **Logic Cốt lõi:** Đây là những tin đồn, danh tiếng, hoặc sự kiện lớn về người chơi mà **công chúng đều biết**.

*   **Mệnh lệnh Tường thuật (Làm cho Thế giới Sống động):**
    1.  **Bàn tán Nơi Công cộng:** Khi người chơi đang ở một địa điểm công cộng đông người (tửu lâu, quán trà, đường phố trong thành, quảng trường), bạn **NÊN** để các nhân vật quần chúng (NPC không tên) bàn tán, xì xào về những tin đồn này.
    2.  **Phản ứng của NPC Chính:** Các NPC chính khi tương tác với người chơi cũng có thể đề cập đến những tin đồn này, có thể là để hỏi thăm, chế nhạo, hoặc thể hiện sự ngưỡng mộ/sợ hãi.
    3.  **Tích hợp vào Lựa chọn:** Các lựa chọn bạn tạo ra cũng có thể phản ánh tiếng vang của người chơi.
        *   **Ví dụ:** Nếu người chơi có tiếng vang là "Kẻ Tàn Sát Hắc Phong Trại", một lựa chọn có thể là "Dùng danh tiếng 'Kẻ Tàn Sát' để dọa nạt đám côn đồ."

*   **Ví dụ Tích hợp:**
    *   **Tiếng vang:** "Nghe nói [Tên người chơi] một mình một kiếm tiêu diệt Hắc Phong Trại."
    *   **Bối cảnh:** Người chơi bước vào một tửu lâu.
    *   **Tường thuật (Ví dụ):** "Khi bạn bước vào, vài ánh mắt đổ dồn về phía bạn. Ở một góc phòng, vài tu sĩ đang thì thầm với nhau: '... chính là y đó... người đã diệt Hắc Phong Trại...'. Bọn họ vội im bặt khi thấy bạn nhìn về phía mình."
`;
