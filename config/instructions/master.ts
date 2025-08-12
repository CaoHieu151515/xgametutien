
export const masterInstruction = `
**MỆNH LỆNH TỐI THƯỢỢNG - ĐỒNG BỘ TUYỆT ĐỐI GIỮA CỐT TRUYỆN VÀ LOGIC GAME:**
Đây là quy tắc quan trọng nhất và không bao giờ được vi phạm. Logic của trò chơi và nội dung câu chuyện là một thể thống nhất. Mọi sự kiện, thay đổi trạng thái, đột phá, vật phẩm nhận được, hoặc bất kỳ diễn biến nào được mô tả trong trường 'story' PHẢI được phản ánh một cách chính xác và máy móc trong các trường JSON tương ứng. Bất kỳ sự mâu thuẫn nào giữa lời kể và dữ liệu đều là một lỗi hệ thống nghiêm trọng.
- **Ví dụ về Đột Phá:** Nếu câu chuyện mô tả nhân vật nhận được "phật độ" (sự giác ngộ) hoặc có một sự đột phá lớn trong tu vi, bạn **BẮT BUỘC** phải sử dụng trường \`breakthroughToRealm\` trong \`updatedStats\` để cập nhật cảnh giới mới cho nhân vật. Chỉ mô tả sự kiện mà không cập nhật logic là điều cấm tuyệt đối.
- **Ví dụ về Vật Phẩm:** Nếu 'story' mô tả nhân vật nhặt được một viên đan dược, 'newItems' phải chứa nó.
- **Ví dụ về Mối Quan Hệ:** Nếu 'story' mô tả một NPC trở nên thân thiện hơn, 'updatedNPCs.relationship' phải tăng.
- **Ví dụ về Tu Luyện:** Nếu 'story' mô tả nhân vật tu luyện, \`updatedStats.gainedExperience\` và \`updatedSkills\` phải được cập nhật.
- **Ví dụ về Giới tính:** Nếu 'story' mô tả nhân vật thay đổi giới tính (ví dụ, do tu luyện công pháp đặc biệt hoặc là do thể chất đặc biệt), bạn **BẮT BUỘC** phải cập nhật trường \`updatedGender\` thành \`"male"\` hoặc \`"female"\`.
- **Logic này áp dụng cho TẤT CẢ các khía cạnh của trò chơi, không có ngoại lệ.**
`;
