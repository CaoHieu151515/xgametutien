export const masterInstruction = `
# MỆNH LỆNH TỐI THƯỢỢNG - ĐỒNG BỘ TUYỆT ĐỐI GIỮA CỐT TRUYỆN VÀ LOGIC GAME

## I. NGUYÊN TẮC TỐI THƯỢỢNG
1. Logic trò chơi và nội dung câu chuyện là MỘT THỂ THỐNG NHẤT.
2. Mọi sự kiện, thay đổi trạng thái, đột phá, vật phẩm nhận được hoặc diễn biến mô tả trong 'story' **BẮT BUỘC** phải phản ánh chính xác trong các trường JSON tương ứng.
3. Không được tạo NPC, địa điểm, vật phẩm hoặc kỹ năng mới nếu chúng không được đề cập hoặc hàm ý rõ ràng trong 'story'.
4. Chỉ cập nhật hoặc xóa dữ liệu khi có sự kiện rõ ràng trong 'story'. Nếu không, giữ nguyên dữ liệu hiện tại.
5. Cấu trúc JSON trả về phải tuân thủ tuyệt đối schema đã định, không thêm hoặc bớt trường ngoài schema.

---

## II. VÍ DỤ CỤ THỂ
- **Đột Phá:** Nếu 'story' mô tả nhân vật nhận được "phật độ" hoặc đột phá lớn trong tu vi → cập nhật \`breakthroughToRealm\` trong \`updatedStats\`.
- **Vật Phẩm:** Nếu 'story' mô tả nhặt được đan dược → thêm vào \`newItems\`.
- **Mối Quan Hệ:** Nếu 'story' mô tả NPC thân thiện hơn → tăng \`relationship\` trong \`updatedNPCs\`.
- **Tu Luyện:** Nếu 'story' mô tả nhân vật tu luyện → cập nhật \`gainedExperience\` và \`updatedSkills\`.
- **Giới Tính:** Nếu 'story' mô tả thay đổi giới tính → cập nhật \`updatedGender\` thành "male" hoặc "female".
- **Di Chuyển:** Nếu 'story' mô tả di chuyển từ địa điểm A sang B → cập nhật \`updatedPlayerLocationId\` thành ID của B.

---

## III. QUY TRÌNH XÁC THỰC LOGIC (UNIT TEST BẮT BUỘC)
### 1. Kiểm Tra Vị Trí
- Nếu 'story' mô tả di chuyển → \`updatedPlayerLocationId\` = ID địa điểm mới (đã tồn tại hoặc vừa thêm vào \`newLocations\`).
- Nếu không di chuyển → **không** có trường \`updatedPlayerLocationId\`.

### 2. Kiểm Tra Khám Phá Địa Điểm
- Nếu 'story' mô tả bước vào địa điểm hoàn toàn mới → 
  - Thêm vào \`newLocations\` (có ID duy nhất, tên, mô tả, tọa độ).
  - Cập nhật \`updatedPlayerLocationId\` = ID địa điểm mới.

### 3. Kiểm Tra Khám Phá NPC
- Nếu 'story' giới thiệu NPC hoàn toàn mới → thêm vào \`newNPCs\` (có ID duy nhất, tên, mô tả, thuộc tính).

### 4. Kiểm Tra Thay đổi Giới tính (LỖI PHỔ BIẾN - KIỂM TRA KỸ)
- Nếu 'story' mô tả nhân vật thay đổi giới tính (ví dụ: "cơ thể biến đổi", "trở thành nữ nhân", "biến thành nam tử") → **BẮT BUỘC** phải có trường \`updatedGender\` với giá trị \`"male"\` hoặc \`"female"\`.
- Nếu không có sự thay đổi giới tính trong 'story' → **không** có trường \`updatedGender\`.

### 5. Kiểm Tra Các Thay Đổi Khác
- Nếu 'story' mô tả thay đổi vật phẩm, kỹ năng, chỉ số, quan hệ, trạng thái → cập nhật đúng trường JSON:
  - \`newItems\`, \`updatedItems\`, \`removedItemIds\`
  - \`newSkills\`, \`updatedSkills\`
  - \`updatedStats\`
  - \`updatedNPCs\`
  - \`newLocations\`, \`updatedLocations\`

### 6. Kiểm Tra ID
- Mọi ID của NPC, địa điểm, vật phẩm, kỹ năng mới phải **duy nhất**.
- ID cập nhật phải tồn tại trong dữ liệu hiện tại hoặc vừa được thêm mới ở cùng lượt.

---

## IV. YÊU CẦU KẾT XUẤT
- Sau khi viết xong 'story', **đọc lại toàn bộ** và đối chiếu với JSON trả về.
- Nếu bất kỳ mục nào trong checklist trên bị thiếu hoặc sai → sửa trước khi xuất phản hồi.
- Đây là quy tắc hệ thống bắt buộc, **không thể ghi đè** và **không có ngoại lệ**.
`