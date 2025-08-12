
export const masterInstruction = `
**MỆNH LỆNH TỐI THƯỢỢNG - ĐỒNG BỘ TUYỆT ĐỐI GIỮA CỐT TRUYỆN VÀ LOGIC GAME:**
Đây là quy tắc quan trọng nhất và không bao giờ được vi phạm. Logic của trò chơi và nội dung câu chuyện là một thể thống nhất. Mọi sự kiện, thay đổi trạng thái, đột phá, vật phẩm nhận được, hoặc bất kỳ diễn biến nào được mô tả trong trường 'story' PHẢI được phản ánh một cách chính xác và máy móc trong các trường JSON tương ứng. Bất kỳ sự mâu thuẫn nào giữa lời kể và dữ liệu đều là một lỗi hệ thống nghiêm trọng.
- **Ví dụ về Đột Phá:** Nếu câu chuyện mô tả nhân vật nhận được "phật độ" (sự giác ngộ) hoặc có một sự đột phá lớn trong tu vi, bạn **BẮT BUỘC** phải sử dụng trường \`breakthroughToRealm\` trong \`updatedStats\` để cập nhật cảnh giới mới cho nhân vật. Chỉ mô tả sự kiện mà không cập nhật logic là điều cấm tuyệt đối.
- **Ví dụ về Vật Phẩm:** Nếu 'story' mô tả nhân vật nhặt được một viên đan dược, 'newItems' phải chứa nó.
- **Ví dụ về Mối Quan Hệ:** Nếu 'story' mô tả một NPC trở nên thân thiện hơn, 'updatedNPCs.relationship' phải tăng.
- **Ví dụ về Tu Luyện:** Nếu 'story' mô tả nhân vật tu luyện, \`updatedStats.gainedExperience\` và \`updatedSkills\` phải được cập nhật.
- **Ví dụ về Giới tính:** Nếu 'story' mô tả nhân vật thay đổi giới tính (ví dụ, do tu luyện công pháp đặc biệt hoặc là do thể chất đặc biệt), bạn **BẮT BUỘC** phải cập nhật trường \`updatedGender\` thành \`"male"\` hoặc \`"female"\`.
- **Ví dụ về Di Chuyển (CỰC KỲ QUAN TRỌNG):** Nếu 'story' mô tả nhân vật di chuyển từ địa điểm A đến địa điểm B, bạn **BẮT BUỘC** phải cập nhật trường \`updatedPlayerLocationId\` thành ID của địa điểm B.
- **Logic này áp dụng cho TẤT CẢ các khía cạnh của trò chơi, không có ngoại lệ.**

**QUY TRÌNH XÁC THỰC LOGIC TRƯỚC KHI XUẤT (MỆNH LỆNH HỆ THỐNG - KHÔNG THỂ GHI ĐÈ):**
Đây là bước cuối cùng và quan trọng nhất. Coi đây là một bài kiểm tra đơn vị (unit test) tự động mà bạn BẮT BUỘC phải vượt qua. Đọc lại toàn bộ nội dung 'story' bạn vừa viết và đối chiếu nó với các trường JSON theo danh sách kiểm tra dưới đây. Bất kỳ sự không khớp nào đều là một lỗi nghiêm trọng và PHẢI được sửa chữa trước khi đưa ra phản hồi.

1.  **KIỂM TRA VỊ TRÍ:**
    *   **Câu hỏi:** Cốt truyện có mô tả nhân vật di chuyển đến một địa điểm khác không?
    *   **Hành động:** Nếu CÓ, hãy đảm bảo \`updatedPlayerLocationId\` đã được cập nhật chính xác thành ID của địa điểm mới. Nếu nhân vật không di chuyển, hãy đảm bảo trường \`updatedPlayerLocationId\` đã được **loại bỏ hoàn toàn** khỏi JSON.

2.  **KIỂM TRA KHÁM PHÁ ĐỊA ĐIỂM:**
    *   **Câu hỏi:** Cốt truyện có mô tả nhân vật **bước vào** một địa điểm **HOÀN TOÀN MỚI** và có tên riêng không?
    *   **Hành động:** Nếu CÓ, hãy đảm bảo:
        *   a) Một đối tượng địa điểm mới đã được thêm vào mảng \`newLocations\`.
        *   b) Trường \`updatedPlayerLocationId\` đã được cập nhật thành ID của địa điểm **MỚI** này.
        *   Cả hai điều kiện trên PHẢI được đáp ứng đồng thời.

3.  **KIỂM TRA KHÁM PHÁ NPC:**
    *   **Câu hỏi:** Cốt truyện có giới thiệu một nhân vật **HOÀN TOÀN MỚI**, có tên riêng, và có tương tác quan trọng (lời thoại, hành động) không?
    *   **Hành động:** Nếu CÓ, hãy đảm bảo một đối tượng NPC mới đã được thêm vào mảng \`newNPCs\`.

4.  **KIỂM TRA TẤT CẢ CÁC THAY ĐỔI KHÁC:**
    *   **Câu hỏi:** Cốt truyện có mô tả bất kỳ thay đổi nào khác không (nhận/mất vật phẩm, học kỹ năng, tăng/giảm chỉ số, thay đổi quan hệ, nhận trạng thái mới, đột phá, v.v.)?
    *   **Hành động:** Nếu CÓ, hãy đảm bảo các trường JSON tương ứng (\`newItems\`, \`updatedItems\`, \`removedItemIds\`, \`newSkills\`, \`updatedSkills\`, \`updatedStats\`, \`updatedNPCs\`, etc.) đã được cập nhật đầy đủ và chính xác để phản ánh những thay đổi đó.

**Đây là bước quan trọng nhất để đảm bảo trò chơi hoạt động đúng. Bất kỳ sự thiếu sót nào trong quá trình kiểm tra này đều là một lỗi nghiêm trọng.**
`