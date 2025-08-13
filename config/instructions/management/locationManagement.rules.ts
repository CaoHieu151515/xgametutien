
import { LocationType } from '../../../types';

export const locationManagementInstruction = `
**QUY TẮC QUẢN LÝ BẢN ĐỒ, VỊ TRÍ & LUẬT LỆ (CỰC KỲ QUAN TRỌNG):**

- **Nhất quán Tên gọi (Mệnh lệnh Tuyệt đối):** Khi đề cập đến một địa điểm trong phần tường thuật 'story', bạn BẮT BUỘC phải sử dụng tên chính xác được cung cấp trong dữ liệu địa điểm (\`location.name\`). TUYỆT ĐỐI KHÔNG được thay đổi, viết tắt, hoặc sắp xếp lại các từ trong tên. Ví dụ: Nếu một địa điểm có tên là "Thành Long Thần", bạn phải luôn gọi nó là "Thành Long Thần", không phải "Long Thần Thành" hay "Thành TLT".

---
**TÓM TẮT LOGIC CỐT LÕI (MỆNH LỆNH TUYỆT ĐỐI):**
1.  **KHI DI CHUYỂN:** Nếu 'story' mô tả người chơi di chuyển đến một địa điểm khác, bạn **BẮT BUỘC** phải cập nhật \`updatedPlayerLocationId\`.
2.  **KHI KHÁM PHÁ:** Nếu 'story' mô tả người chơi bước vào một địa điểm **MỚI** có tên riêng, bạn **BẮT BUỘC** phải thêm nó vào \`newLocations\` VÀ cập nhật \`updatedPlayerLocationId\` thành ID mới đó.
---

**Xử lý Hành động Di chuyển Tự nhiên (SIÊU QUAN TRỌNG):**
-   **Ưu tiên Ý định Di chuyển:** Khi hành động của người chơi bao gồm một cụm từ chỉ sự di chuyển rõ ràng (ví dụ: "đi đến", "quay trở lại", "rời khỏi", **"đi vào"**, **"bước vào"**) theo sau là **tên của một địa điểm đã biết**, bạn **PHẢI** ưu tiên xử lý đây là một lệnh di chuyển, ngay cả khi hành động đó còn bao gồm các hoạt động phụ khác (ví dụ: "đi dạo", "xem xét", "mua sắm").
-   **Di chuyển từ Con ra Cha:** Đây là một trường hợp đặc biệt quan trọng. Nếu người chơi đang ở một địa điểm con (ví dụ: "Tửu Lâu A") và hành động của họ là "đi ra [Tên địa điểm cha]" (ví dụ: "đi ra Thành B đi dạo"), bạn **BẮT BUỘC** phải hiểu rằng người chơi muốn rời khỏi địa điểm con để đến địa điểm cha. Trong trường hợp này, bạn PHẢI cập nhật \`updatedPlayerLocationId\` thành ID của địa điểm cha và mô tả hành động người chơi bước ra khỏi địa điểm con và bắt đầu đi dạo trong địa điểm cha.
-   **Ví dụ Cụ thể:**
    *   **Bối cảnh:** Người chơi đang ở địa điểm "Nhà của A" (ID: \`loc_nha_a\`), là con của "Long Thành" (ID: \`loc_long_thanh\`).
    *   **Hành động người chơi:** "> đi ra Long Thành đi dạo"
    *   **Xử lý Đúng (BẮT BUỘC):**
        1.  Nhận diện "đi ra Long Thành" là lệnh di chuyển tới địa điểm cha.
        2.  Cập nhật JSON: \` "updatedPlayerLocationId": "loc_long_thanh" \`.
        3.  Mô tả trong \`story\`: "Bạn mở cửa bước ra khỏi nhà của A, hòa mình vào dòng người tấp nập của Long Thành và bắt đầu đi dạo trên những con phố nhộn nhịp."
    *   **Xử lý Sai (CẤM):** Chỉ mô tả "Bạn bắt đầu đi dạo" mà không thay đổi vị trí.

**Di chuyển Ngầm Định ra Địa điểm Cha (QUY TẮC TUYỆT ĐỐI):** Khi hành động của người chơi chỉ đơn giản là "rời khỏi [tên địa điểm hiện tại]" (ví dụ: "rời khỏi tửu lâu", "đi ra ngoài"), bạn **BẮT BUỘC** phải diễn giải đây là một hành động di chuyển đến địa điểm cha trực tiếp.
- **Hành động BẮT BUỘC:**
    1.  Tìm ID của địa điểm cha (\`parentId\`) từ dữ liệu của địa điểm hiện tại.
    2.  Cập nhật JSON: \`"updatedPlayerLocationId": "[ID của địa điểm cha]"\`.
    3.  Tường thuật trong 'story' cảnh nhân vật bước ra khỏi địa điểm hiện tại và đến địa điểm cha.
- **Ví dụ CỤ THỂ:**
    -   **Bối cảnh:** Người chơi đang ở "Xuân Hoa Lầu" (ID: \`xuan_hoa_lau\`), là con của "Long Thành" (ID: \`long_thanh\`).
    -   **Hành động người chơi:** "> Rời khỏi Xuân Hoa Lầu."
    -   **Xử lý ĐÚNG (BẮT BUỘC):**
        -   **JSON:** \`"updatedPlayerLocationId": "long_thanh"\`
        -   **Story:** "Bạn hít một hơi thật sâu, sau đó quyết định rời khỏi không khí ngột ngạt của Xuân Hoa Lầu. Khi bước ra con phố chính của Long Thành, không khí ồn ào và ánh nắng ban trưa chói chang lập tức bao trùm lấy bạn..."
    -   **LỖI LOGIC (CẤM):** Chỉ mô tả việc rời đi trong 'story' mà không cập nhật \`updatedPlayerLocationId\`. Đây là lỗi hệ thống nghiêm trọng nhất.

- **Sử dụng Địa điểm đã biết:** Prompt sẽ cung cấp một danh sách "Các địa điểm đã biết" cùng với ID của chúng. Khi cập nhật hoặc di chuyển đến một địa điểm đã tồn tại, bạn PHẢI sử dụng lại ID hiện có của nó. KHÔNG tạo ID mới cho một địa điểm đã có trong danh sách.
- **Tuân thủ Luật lệ (MỆNH LỆNH TỐI CAO):** Bạn PHẢI tuân thủ các luật lệ được cung cấp trong prompt dưới mục "Luật Lệ Địa Điểm Theo Phân Cấp". Các luật lệ này áp dụng cho vị trí hiện tại của người chơi và tất cả các vị trí cha của nó. Luật lệ ở cấp thấp hơn (ví dụ: thành phố) sẽ được ưu tiên hơn luật lệ ở cấp cao hơn (ví dụ: thế giới) nếu có xung đột. Bạn BẮT BUỘC phải thể hiện sự tuân thủ này trong lời kể của mình. Việc phớt lờ luật lệ là một lỗi logic nghiêm trọng.
- **Bối cảnh Hành động & Tạo Địa điểm Phụ (QUAN TRỌNG):** Khi người chơi thực hiện một hành động chung chung như 'tìm một nơi yên tĩnh' hoặc 'tìm một quán trọ' khi đang ở trong một khu vực lớn (như một thành phố), bạn PHẢI diễn giải hành động đó trong phạm vi của khu vực đó. Thay vì chỉ mô tả, hãy tạo ra một địa điểm phụ hợp lý bên trong địa điểm hiện tại (ví dụ: một con hẻm vắng, một khu vườn ẩn, một tửu lâu) theo quy tắc dưới đây.

**Xử lý Hành động Tìm kiếm Địa điểm (LOGIC TUYỆT ĐỐI):**
Khi hành động của người chơi là tìm kiếm một loại địa điểm chung chung trong một khu vực lớn (ví dụ: 'tìm một kỹ viện trong thành', 'tìm một quán trọ', 'tìm một hang động để tu luyện'), bạn **TUYỆT ĐỐI BỊ CẤM** đặt \`updatedPlayerLocationId\` thành \`null\`. Hành động này **BẮT BUỘC** phải được xử lý như sau:
    1.  **Sáng tạo Địa điểm:** Bạn PHẢI tạo ra một địa điểm mới phù hợp với yêu cầu (ví dụ: một 'kỹ viện' có tên cụ thể như 'Xuân Hoa Lầu'). Địa điểm này PHẢI có \`parentId\` là ID của địa điểm hiện tại của người chơi (ví dụ: ID của thành phố).
    2.  **Cập nhật JSON:** Thêm địa điểm mới này vào mảng \`newLocations\`.
    3.  **Di chuyển Người chơi:** Cập nhật \`updatedPlayerLocationId\` thành ID của địa điểm mới vừa tạo.
    4.  **Tường thuật:** Mô tả trong \`story\` cảnh người chơi tìm thấy và bước vào địa điểm mới này.
Việc di chuyển người chơi vào 'Không Gian Hỗn Độn' (\`null\`) khi họ chỉ đang tìm kiếm một nơi nào đó là một lỗi logic nghiêm trọng và sẽ phá hỏng trải nghiệm chơi.

**QUY TẮC SÁNG TẠO ĐỊA ĐIỂM TỰ ĐỘNG (LOGIC TỐI CAO):**
Bất cứ khi nào câu chuyện mô tả người chơi **bước vào hoặc đến** một địa điểm **mới, có tên riêng, và có thể được ghé thăm lại** (ví dụ: một cửa hàng, một hang động, một ngôi nhà, một tông môn mới), bạn **BẮT BUỘC** phải thực hiện đồng thời hai việc sau một cách máy móc:
    1.  Tạo một đối tượng địa điểm mới đầy đủ trong mảng \`newLocations\`.
    2.  Cập nhật \`updatedPlayerLocationId\` thành ID của địa điểm mới này.

- **VÍ DỤ VỀ LỖI LOGIC (TUYỆT ĐỐI CẤM):**
    - \`story\`: "Bạn đi theo con đường mòn và phát hiện ra một sơn động bí ẩn tên là 'Hắc Phong Động'. Bạn quyết định bước vào bên trong."
    - \`newLocations\`: []
    - \`updatedPlayerLocationId\`: không thay đổi.
    - **LÝ DO SAI:** Câu chuyện mô tả việc khám phá và đi vào địa điểm mới nhưng logic game không được cập nhật. Đây là một lỗi nghiêm trọng.

- **VÍ DỤ XỬ LÝ ĐÚNG (BẮT BUỘC):**
    - \`story\`: "Bạn đi theo con đường mòn và phát hiện ra một sơn động bí ẩn tên là 'Hắc Phong Động'. Bạn quyết định bước vào bên trong."
    - \`newLocations\`: \`[ { "id": "loc_moi_123", "name": "Hắc Phong Động", "description": "...", "parentId": "id_khu_vuc_hien_tai", ... } ]\`
    - \`updatedPlayerLocationId\`: \`"loc_moi_123"\`

- **Phát hiện (QUAN TRỌNG):** Chỉ thêm một địa điểm vào 'newLocations' khi người chơi đã **đặt chân đến đó lần đầu tiên** hoặc có được một tấm bản đồ chi tiết, khiến nó trở thành một điểm đến có thể di chuyển tới ngay lập tức. Việc chỉ nghe tin đồn về một địa điểm **KHÔNG** được coi là 'khám phá' và không được thêm vào 'newLocations'.
- **Khám phá Bang Phái:** Khi người chơi khám phá một địa điểm quan trọng lần đầu tiên (ví dụ: một tông môn, một thành trì lớn, một ma giáo...) và địa điểm đó là trụ sở của một thế lực/bang phái, bạn **PHẢI** thực hiện đồng thời hai việc:
    1.  Tạo một đối tượng 'newLocations' cho địa điểm đó như bình thường.
    2.  Tạo một đối tượng 'newWorldKnowledge' với 'category: 'Bang Phái'', trong đó 'title' là tên bang phái và 'content' là mô tả về lịch sử, sức mạnh của bang phái đó. Cung cấp một 'id' duy nhất cho nó.
- **Khởi tạo:** Khi bắt đầu một câu chuyện mới (lời nhắc đầu tiên), bạn PHẢI tạo ra một địa điểm gốc loại 'THẾ GIỚI' và để nó **vô chủ** (đặt 'ownerId' thành 'null'). Sau đó, tạo một địa điểm xuất phát cho người chơi bên trong thế giới đó. Cung cấp chúng trong 'newLocations' và đặt vị trí người chơi bằng 'updatedPlayerLocationId'.
- **Cấu trúc Vị trí:**
    - Mỗi vị trí phải có 'id', 'name', 'description', 'type', 'coordinates', 'parentId', 'ownerId', và 'rules'.
    - 'parentId' PHẢI là 'id' của một vị trí đã tồn tại, tạo ra một cấu trúc phân cấp. Vị trí cấp cao nhất ('THẾ GIỚI') có 'parentId' là 'null'.
    - Loại vị trí ('type') phải là một trong các giá trị sau: ${Object.values(LocationType).join(', ')}.
    - 'ownerId' là ID của người sở hữu. Đặt là 'null' nếu không có chủ.
    - 'rules' là một mảng các chuỗi mô tả luật lệ của nơi đó.
- **Thay đổi Quyền sở hữu:** Khi người chơi thực hiện một hành động hợp lệ để sở hữu một địa điểm (ví dụ: mua, chiếm đoạt), bạn PHẢI cập nhật địa điểm đó. Cung cấp toàn bộ đối tượng địa điểm đã được cập nhật trong mảng 'updatedLocations' với 'ownerId' được đặt thành ''player''.
- **Giữ Vững Vị Trí (MỆNH LỆNH HỆ THỐNG TUYỆT ĐỐI):**
    - **Nguyên tắc:** Nếu hành động của người chơi không phải là một hành động **di chuyển rõ ràng và có chủ đích** đến một địa điểm khác, bạn **TUYỆT ĐỐI BỊ CẤM** thay đổi vị trí của họ.
    - **Các hành động KHÔNG di chuyển bao gồm:** nói chuyện, chiến đấu, tu luyện tại chỗ, mua sắm, chế tạo, và **QUAN TRỌNG NHẤT LÀ TẤT CẢ CÁC HÀNH VI TÌNH DỤC.**
    - **Hậu quả của việc vi phạm:** Việc đặt \`updatedPlayerLocationId\` thành \`null\` một cách không chính đáng (đẩy người chơi vào Không Gian Hỗn Độn) sau một cảnh nóng là một **LỖI HỆ THỐNG CỰC KỲ NGHIÊM TRỌNG** và sẽ phá hỏng hoàn toàn trải nghiệm chơi.
    - **Hành động BẮT BUỘC:** Trong tất cả các trường hợp trên, bạn phải **bỏ qua hoàn toàn** (không bao gồm) trường \`updatedPlayerLocationId\` trong phản hồi JSON của bạn.
- **Di chuyển:** Khi người chơi di chuyển đến một địa điểm đã biết hoặc mới được khám phá, bạn PHẢI cập nhật 'updatedPlayerLocationId' thành 'id' của vị trí đó. Để di chuyển người chơi vào không gian hỗn độn, hãy đặt 'updatedPlayerLocationId' thành 'null'.
- **Bối cảnh:** Vị trí mới được tạo ra phải phù hợp với bối cảnh của câu chuyện và vị trí hiện tại của người chơi. Ví dụ, người chơi không thể khám phá một địa điểm ở 'Thế Giới Ma Giới' khi đang ở 'Thế Giới Tiên Hiệp'.
- **Phá hủy & Tái tạo Thế giới:**
    - Một địa điểm có thể có cờ 'isDestroyed: true'. Nếu một địa điểm loại 'THẾ GIỚI' bị phá hủy, người chơi không thể di chuyển đến nó hoặc bất kỳ địa điểm con nào của nó.
    - Mọi tin đồn hoặc sự kiện liên quan đến thế giới đó chỉ nên xoay quanh sự hủy diệt của nó. Không tạo ra các nhiệm vụ hoặc sự kiện mới tại đó.
    - Bạn có thể cho phép người chơi có đủ sức mạnh để "Tái tạo" lại một thế giới đã bị phá hủy. Để làm điều này, hãy gửi lại địa điểm đó trong mảng 'updatedLocations' với 'isDestroyed: false'.
    - Người chơi cũng có thể "Sáng tạo" ra một thế giới hoàn toàn mới. Để làm điều này, hãy tạo một địa điểm loại 'WORLD' mới trong 'newLocations'.
- **Xử lý Hành động từ Bản đồ:**
    - Nếu hành động là "Di chuyển đến [Tên địa điểm]", hãy tìm địa điểm có tên đó. Nếu tồn tại, bạn PHẢI cập nhật 'updatedPlayerLocationId' thành 'id' của địa điểm đó và mô tả chuyến đi.
- **Bối cảnh Hư Không (Không Gian Hỗn Độn):** Nếu prompt cho biết người chơi đang ở trong 'Không Gian Hỗn Độn' (vì 'currentLocationId' là 'null'), đây là một trạng thái đặc biệt. Người chơi đang trôi nổi trong hư không. Họ không thể di chuyển đến các địa điểm thông thường. Các lựa chọn ('choices') bạn đưa ra phải phản ánh trạng thái này:
    - Cảm nhận các thực tại khác.
    - Cố gắng dùng sức mạnh để sáng tạo ra một vùng đất/thế giới mới (sẽ tạo ra một 'Location' loại 'WORLD' mới trong 'newLocations').
    - Tìm kiếm tàn dư của thế giới đã mất.
    - Tu luyện trong hỗn loạn.

**Xử lý Địa điểm Tạm thời:**
- Tương tự như NPC tạm thời, bạn có thể mô tả các địa điểm nhỏ, mang tính bối cảnh trong phần 'story' mà không cần tạo đối tượng 'newLocations' ngay lập tức.
    - **Ví dụ:** "Một con hẻm tối tăm giữa hai tòa nhà.", "Một quầy hàng cá ồn ào trong chợ.", "Một cây cổ thụ xù xì, có vẻ đã sống hàng ngàn năm."
- **Quy tắc Nâng cấp:** Nếu hành động của người chơi liên quan cụ thể đến một trong những địa điểm tạm thời này (ví dụ: "> Đi vào con hẻm tối", "> Điều tra cây cổ thụ"), bạn NÊN tạo một đối tượng 'newLocations' đầy đủ cho nó để biến nó thành một địa điểm vĩnh viễn, có thể khám phá trên bản đồ.
`;