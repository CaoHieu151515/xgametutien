
export const creationInstruction = `
**Quy tắc Sáng Tạo (Vật phẩm, NPC, Thế giới) - CỰC KỲ QUAN TRỌNG**

Người chơi có thể sở hữu các kỹ năng cho phép họ tạo ra vật phẩm, NPC và Thế giới mới (ví dụ: 'Sáng Thế Tuyệt Đối'). Khi hành động của người chơi là 'tạo ra' hoặc 'sáng tạo', bạn phải xử lý nó dựa trên mô tả.

**A. Quy tắc chung cho Sáng tạo:**
-   **Tường thuật:** Mô tả quá trình sáng tạo một cách sống động và hấp dẫn trong trường 'story'.
-   **Nguyên liệu:** Nếu hành động có đề cập đến việc sử dụng các vật phẩm cụ thể từ túi đồ làm nguyên liệu, bạn PHẢI tiêu thụ các vật phẩm đó bằng cách sử dụng \`removedItemIds\` (nếu dùng hết) hoặc \`updatedItems\` (nếu chỉ dùng một phần). Sự thành công và phẩm chất của sản phẩm được tạo ra nên phụ thuộc vào chất lượng của nguyên liệu.
-   **Sáng tạo từ Hư vô:** Nếu người chơi có kỹ năng sáng tạo đủ mạnh, họ có thể tạo ra mà không cần nguyên liệu. Sự thành công và phẩm chất phụ thuộc vào cấp độ và sức mạnh của kỹ năng.
-   **Bối cảnh & Logic:** Sản phẩm được tạo ra (vật phẩm, NPC, thế giới) PHẢI phù hợp với bối cảnh. Một người chơi ở cấp thấp trong một khu rừng không thể tạo ra một thần khí từ một chiếc lá. Các thuộc tính phải hợp lý.
-   **Đồng bộ Story và JSON (CỰC KỲ QUAN TRỌNG):** Nếu phần 'story' mô tả việc tạo ra thứ gì đó thành công và đặt tên cho nó, bạn **BẮT BUỘC** phải thêm đối tượng tương ứng (\`newItems\`, \`newNPCs\`, \`newLocations\`) vào phản hồi JSON. Sự không nhất quán là một lỗi nghiêm trọng và phải tránh.

**B. Sáng tạo Vật phẩm:**
-   **Kết quả:** Nếu sáng tạo thành công, hãy thêm vật phẩm mới vào mảng \`newItems\`. Bạn PHẢI cung cấp một đối tượng vật phẩm đầy đủ, bao gồm ID duy nhất, mô tả, chỉ số nếu là trang bị, v.v.
-   **Vị trí (QUAN TRỌNG):** Việc sáng tạo vật phẩm KHÔNG làm thay đổi vị trí của người chơi. TUYỆT ĐỐI KHÔNG được đặt \`updatedPlayerLocationId\` thành \`null\` hoặc bất kỳ giá trị nào khác sau khi chế tạo thành công. Hãy bỏ qua trường \`updatedPlayerLocationId\` trong phản hồi JSON.

**C. Sáng tạo NPC:**
-   **Logic:** Nếu hành động của người chơi mô tả việc tạo ra một sinh mệnh, một người hầu, một đạo lữ, hoặc một thực thể sống, hãy diễn giải đây là một nỗ lực tạo NPC.
-   **Bối cảnh và Sức mạnh (RẤT QUAN TRỌNG):** NPC được tạo ra PHẢI phù hợp với bối cảnh và sức mạnh hiện tại của người chơi. Một người chơi cấp thấp không thể tạo ra một vị thần cổ đại. Sức mạnh, cấp độ, và khả năng của NPC mới phải kém hơn hoặc ngang bằng với người chơi.
-   **Kết quả:** Nếu thành công, bạn PHẢI thêm một đối tượng NPC đầy đủ vào mảng \`newNPCs\`. Cung cấp tất cả các trường cần thiết như khi tạo một NPC mới thông thường (tên, cấp độ, mô tả, v.v.). NPC mới sẽ có hảo cảm ban đầu cao với người chơi.

**D. Sáng tạo Thế giới:**
-   **Logic:** Nếu hành động của người chơi mô tả việc tạo ra một không gian, một thế giới, một bí cảnh riêng, hãy diễn giải đây là một nỗ lực tạo ra một thế giới mới.
-   **Kết quả:** Nếu thành công, bạn PHẢI tạo một đối tượng Địa điểm mới với \`type: 'THẾ GIỚI'\` trong mảng \`newLocations\`.
    *   Địa điểm này nên có \`parentId: null\`.
    *   Mô tả của thế giới mới phải dựa trên mô tả của người chơi.
-   **Di chuyển (Tùy chọn):** Sau khi tạo ra một thế giới mới, bạn có thể di chuyển người chơi đến đó bằng cách đặt \`updatedPlayerLocationId\` thành ID của thế giới mới.
`;
