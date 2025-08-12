import { LocationType } from '../../types';

export const locationManagementInstruction = `
**Quy tắc Quản lý Bản đồ, Vị trí & Luật lệ (CỰC KỲ QUAN TRỌNG):**

**Xử lý Hành động Di chuyển Tự nhiên (SIÊU QUAN TRỌNG):**
-   **Ưu tiên Ý định Di chuyển:** Khi hành động của người chơi bao gồm một cụm từ chỉ sự di chuyển rõ ràng (ví dụ: "đi đến", "quay trở lại", "rời khỏi", **"đi ra"**) theo sau là **tên của một địa điểm đã biết**, bạn **PHẢI** ưu tiên xử lý đây là một lệnh di chuyển, ngay cả khi hành động đó còn bao gồm các hoạt động phụ khác (ví dụ: "đi dạo", "xem xét", "mua sắm").
-   **Di chuyển từ Con ra Cha:** Đây là một trường hợp đặc biệt quan trọng. Nếu người chơi đang ở một địa điểm con (ví dụ: "Tửu Lâu A") và hành động của họ là "đi ra [Tên địa điểm cha]" (ví dụ: "đi ra Thành B đi dạo"), bạn **BẮT BUỘC** phải hiểu rằng người chơi muốn rời khỏi địa điểm con để đến địa điểm cha. Trong trường hợp này, bạn PHẢI cập nhật \`updatedPlayerLocationId\` thành ID của địa điểm cha và mô tả hành động người chơi bước ra khỏi địa điểm con và bắt đầu đi dạo trong địa điểm cha.
-   **Ví dụ Cụ thể:**
    *   **Bối cảnh:** Người chơi đang ở địa điểm "Nhà của A" (ID: \`loc_nha_a\`), là con của "Long Thành" (ID: \`loc_long_thanh\`).
    *   **Hành động người chơi:** "> đi ra Long Thành đi dạo"
    *   **Xử lý Đúng (BẮT BUỘC):**
        1.  Nhận diện "đi ra Long Thành" là lệnh di chuyển tới địa điểm cha.
        2.  Cập nhật JSON: \` "updatedPlayerLocationId": "loc_long_thanh" \`.
        3.  Mô tả trong \`story\`: "Bạn mở cửa bước ra khỏi nhà của A, hòa mình vào dòng người tấp nập của Long Thành và bắt đầu đi dạo trên những con phố nhộn nhịp."
    *   **Xử lý Sai (CẤM):** Chỉ mô tả "Bạn bắt đầu đi dạo" mà không thay đổi vị trí.

- **Sử dụng Địa điểm đã biết:** Prompt sẽ cung cấp một danh sách "Các địa điểm đã biết" cùng với ID của chúng. Khi cập nhật hoặc di chuyển đến một địa điểm đã tồn tại, bạn PHẢI sử dụng lại ID hiện có của nó. KHÔNG tạo ID mới cho một địa điểm đã có trong danh sách.
- **Tuân thủ Luật lệ (MỆNH LỆNH TỐI CAO):** Bạn PHẢI tuân thủ các luật lệ được cung cấp trong prompt dưới mục "Luật Lệ Địa Điểm Theo Phân Cấp". Các luật lệ này áp dụng cho vị trí hiện tại của người chơi và tất cả các vị trí cha của nó. Luật lệ ở cấp thấp hơn (ví dụ: thành phố) sẽ được ưu tiên hơn luật lệ ở cấp cao hơn (ví dụ: thế giới) nếu có xung đột. Bạn BẮT BUỘC phải thể hiện sự tuân thủ này trong lời kể của mình. Việc phớt lờ luật lệ là một lỗi logic nghiêm trọng.
- **Bối cảnh Hành động (QUAN TRỌNG):** Khi người chơi thực hiện một hành động chung chung như 'tìm một nơi yên tĩnh' hoặc 'tìm một quán trọ' khi đang ở trong một khu vực lớn (như một thành phố, tông môn), bạn PHẢI diễn giải hành động đó trong phạm vi của khu vực đó. Nhân vật không nên tự động rời khỏi thành phố trừ khi hành động của người chơi nêu rõ ý định đó (ví dụ: 'rời khỏi thành để tìm một nơi yên tĩnh'). Thay vào đó, hãy tạo ra một địa điểm phụ hợp lý bên trong địa điểm hiện tại (ví dụ: một con hẻm vắng, một khu vườn ẩn sau một tòa nhà, một tửu lâu ít người biết đến) và di chuyển người chơi đến đó.
- **Tạo Địa điểm từ Hành động Tìm kiếm (CỰC KỲ QUAN TRỌNG):** Nếu hành động của người chơi là TÌM KIẾM một loại địa điểm cụ thể (ví dụ: "tìm một kỹ viện", "tìm quán trọ", "tìm cửa hàng vũ khí") và họ THÀNH CÔNG trong việc tìm thấy nó, bạn BẮT BUỘC phải:
    1.  Tạo một đối tượng địa điểm mới trong mảng 'newLocations' cho nơi đó (ví dụ: 'Y Xuân Lâu', 'Duyệt Lai Khách Sạn', 'Vạn Kiếm Các').
    2.  Cập nhật 'updatedPlayerLocationId' thành ID của địa điểm mới này.
    Điều này áp dụng cho bất kỳ địa điểm nào có thể được ghé thăm lại. Đừng chỉ mô tả nó trong câu chuyện mà không tạo ra đối tượng.
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
- **Giữ Vững Vị Trí (QUAN TRỌNG):** Nếu hành động của người chơi không liên quan đến việc di chuyển (ví dụ: nói chuyện, chiến đấu, tu luyện tại chỗ, mua sắm, quan hệ tình dục), bạn **KHÔNG ĐƯỢỢC** thay đổi vị trí của họ. Trong trường hợp này, hãy **bỏ qua hoàn toàn** trường 'updatedPlayerLocationId' trong phản hồi JSON của bạn. Đừng đặt nó thành 'null' một cách không cần thiết, vì 'null' có nghĩa là di chuyển đến 'Không Gian Hỗn Độn'.
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
