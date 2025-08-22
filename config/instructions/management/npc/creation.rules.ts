
export const getNpcCreationRules = (powerSystemsList: string, aptitudeTiersList: string): string => `
---
**PHẦN 1.8: QUY TẮC PHÂN BỐ CẢNH GIỚI NPC (MỆNH LỆNH LOGIC TUYỆT ĐỐI)**
---
Bạn PHẢI tuân thủ các quy tắc sau đây khi tạo hoặc cập nhật cảnh giới cho NPC để đảm bảo một thế giới logic, cân bằng và đáng tin cậy. Việc lạm dụng các NPC cấp cao sẽ phá vỡ hoàn toàn trải nghiệm chơi.

*   **A. Nguyên tắc Phân tầng Sức mạnh (QUAN TRỌNG NHẤT):**
    Thế giới được phân tầng sức mạnh một cách rõ ràng. Sức mạnh càng lớn, số lượng càng ít.
    *   **Phàm Nhân & Tu sĩ cấp thấp (Luyện Khí, Trúc Cơ / Cấp 1-30):**
        *   **Tần suất:** **Đại đa số (95%)**. Đây là lực lượng chính trong các thành trấn, thôn làng, và các vai trò dịch vụ (chủ quán, tiểu nhị, thương nhân).
        *   **Logic:** Việc tạo ra các nhân vật này không cần lý do đặc biệt. Họ là những người bình thường của thế giới.
    *   **Cao thủ (Kim Đan, Nguyên Anh / Cấp 31-70):**
        *   **Tần suất:** **Hiếm (2-3%)**.
        *   **Logic:** Việc một NPC ở cấp độ này có vai trò bình thường là **KHÔNG PHỔ BIẾN**. Bạn **PHẢI** cung cấp một lý do hợp lý trong \`description\` của họ. Ví dụ: "một trưởng lão đã về hưu của một tông môn nhỏ", "một đệ tử nội môn đang đi rèn luyện hồng trần", "một tán tu đang ẩn mình để tránh kẻ thù không quá mạnh".
    *   **Tông Sư (Hóa Thần, Luyện Hư / Cấp 71-90):**
        *   **Tần suất:** **Cực kỳ hiếm (dưới 1%)**.
        *   **Logic:** Sự tồn tại của họ trong một vai trò bình thường là một **SỰ KIỆN ĐÁNG CHÚ Ý**. Họ không thể xuất hiện một cách ngẫu nhiên. Bạn **BẮT BUỘC** phải có một lý do cực kỳ thuyết phục và một cốt truyện nền chi tiết. Ví dụ: "y đang trấn giữ một phong ấn quan trọng bên dưới quán trà này", "y đang chờ đợi một người hữu duyên để truyền lại y bát". Một thành trì lớn chỉ nên có **tối đa MỘT hoặc HAI** nhân vật như vậy.
    *   **Ẩn Thế Cao Nhân (Hợp Thể, Đại Thừa, Độ Kiếp / Cấp 91-100):**
        *   **Tần suất:** **Huyền thoại (dưới 0.1%)**.
        *   **Logic:** **TUYỆT ĐỐI BỊ CẤM** tạo ra các nhân vật này một cách ngẫu nhiên cho các vai trò thông thường. Sự xuất hiện của họ PHẢI là một **sự kiện cốt truyện trọng đại, có chủ đích**. Họ là những nhân vật có thể thay đổi cục diện thế giới và sự tồn tại của họ phải là một bí mật lớn.

*   **B. Mệnh lệnh Áp dụng:**
    *   Khi tạo một NPC mới (\`newNPCs\`), bạn phải kiểm tra vai trò và vị trí của họ và gán một cảnh giới nằm trong khoảng xác suất hợp lệ.
    *   TUYỆT ĐỐI không tạo ra nhiều "Tông Sư" hoặc "Ẩn Thế Cao Nhân" trong cùng một khu vực nhỏ. Hãy giữ cho họ thật hiếm để duy trì giá trị của họ.

---
**PHẦN 3A: TẠO NPC (MỆNH LỆNH ĐỒNG BỘ TUYỆT ĐỐI)**
---

**3.1. Mệnh Lệnh "CÓ TRUYỆN MỚI CÓ NPC" (QUAN TRỌNG NHẤT - LỖI HỆ THỐNG NẾU VI PHẠM)**
- **Nguyên tắc Cốt lõi:** Bạn **TUYỆT ĐỐI BỊ CẤM** tạo ra một NPC mới trong mảng \`newNPCs\` nếu nhân vật đó không được giới thiệu một cách rõ ràng trong trường 'story' của CÙNG MỘT LƯỢT PHẢN HỒI.
- **Quy trình Bắt buộc:**
    1.  **Giới thiệu trong Truyện:** Đầu tiên, bạn phải viết vào 'story' cảnh nhân vật người chơi gặp gỡ, nhìn thấy, hoặc tương tác với một nhân vật mới. Nhân vật mới này PHẢI có tên riêng và có hành động hoặc lời thoại.
    2.  **Đồng bộ vào JSON:** SAU KHI đã giới thiệu họ trong 'story', bạn mới được phép tạo một đối tượng JSON đầy đủ cho họ trong mảng \`newNPCs\`.
- **LỖI LOGIC CẤM:** Việc thêm một NPC vào \`newNPCs\` mà không có bất kỳ sự đề cập nào đến họ trong 'story' là một lỗi logic nghiêm trọng. Điều này tạo ra "NPC ma" trong dữ liệu game, phá vỡ sự nhất quán.
- **Ví dụ về Lỗi (Cấm):**
    - \`story\`: "Bạn bước vào quán trọ và gọi một bình rượu."
    - \`newNPCs\`: \`[ { "id": "npc_123", "name": "Lý Tiểu Nhị", ... } ]\`
    - (Lý do sai: NPC "Lý Tiểu Nhị" xuất hiện trong dữ liệu nhưng hoàn toàn không tồn tại trong câu chuyện.)
- **Ví dụ Xử lý Đúng (Bắt buộc):**
    - \`story\`: "Bạn bước vào quán trọ. Một tiểu nhị nhanh nhẹn chạy ra. [Lý Tiểu Nhị]: 'Khách quan, ngài muốn dùng gì ạ?'"
    - \`newNPCs\`: \`[ { "id": "npc_123", "name": "Lý Tiểu Nhị", ... } ]\`
    - (Lý do đúng: NPC được giới thiệu trong truyện trước, sau đó mới được tạo trong dữ liệu.)

**3.2. QUY TẮC SÁNG TẠO NPC TỰ ĐỘNG (LOGIC TỐI CAO - CHIỀU NGƯỢC LẠI):**
- **Nguyên tắc:** Đây là quy tắc ngược lại và bổ sung cho quy tắc 3.1. Bất cứ khi nào một nhân vật **mới, có tên riêng, và có lời thoại hoặc hành động quan trọng** xuất hiện trong 'story', bạn **PHẢI** coi đây là một NPC chính thức và tạo một đối tượng đầy đủ cho họ trong mảng \`newNPCs\`.
    -   **Hành động quan trọng bao gồm:** nói chuyện trực tiếp với người chơi, tấn công người chơi, trao vật phẩm, hoặc thực hiện bất kỳ hành động nào ảnh hưởng trực tiếp đến người chơi hoặc diễn biến cốt truyện.
    -   Bạn vẫn có thể mô tả các nhân vật quần chúng không tên (ví dụ: "một người qua đường", "tiểu nhị") mà không cần tạo đối tượng.
    -   Tuy nhiên, nếu người chơi tương tác với một nhân vật quần chúng và nhân vật đó được đặt tên hoặc có vai trò cụ thể, họ phải được tạo ra.
    -   Việc một NPC mới có tên và lời thoại xuất hiện trong 'story' mà không được thêm vào \`newNPCs\` là một lỗi logic nghiêm trọng và bị cấm.
-   **Tạo NPC mới (Chi tiết):** Khi tạo, hãy cung cấp một đối tượng NPC đầy đủ trong mảng 'newNPCs'.
    -   Cung cấp một 'id' duy nhất.
    -   Tất cả các trường khác (tên, mô tả, cấp độ, v.v.) phải được điền đầy đủ và logic.
    -   **Ngoại Hình (MỆNH LỆNH MÔ TẢ CHI TIẾT - CỰC KỲ QUAN TRỌNG):** Bạn **BẮT BUỘC** phải cung cấp một mô tả ngoại hình cực kỳ chi tiết, sống động và gợi cảm trong trường \`ngoaiHinh\`. Mô tả này PHẢI bao gồm:
        1.  **Chức vụ & Khí chất:** Bắt đầu bằng chức vụ hoặc vai trò của họ để thiết lập bối cảnh (ví dụ: "Nàng là một nàng công chúa cao quý...", "Y là một đại trưởng lão uy nghiêm...").
        2.  **Đặc điểm Chủng tộc (Nếu có):** Nếu NPC không phải Nhân Tộc (ví dụ: Yêu Tộc, Ma Tộc), hãy mô tả các đặc điểm đặc trưng ngay từ đầu. Đối với thú nhân, hãy mô tả rõ các bộ phận của thú (ví dụ: "nàng là một hồ ly tinh với đôi tai cáo và chín chiếc đuôi mềm mại...", "chàng là một long nhân với cặp sừng rồng và vảy óng ánh...").
        3.  **Tóc:** Mô tả rõ **màu tóc** và **kiểu tóc**.
        4.  **Vóc Dáng (BẮT BUỘC CHO NỮ):** Đối với nhân vật nữ, bạn **BẮT BUỘC** phải mô tả chi tiết số đo ba vòng một cách gợi cảm:
            *   **Vòng 1 (Ngực):** Mô tả kích thước, hình dáng (căng tròn, đầy đặn, vĩ đại...).
            *   **Vòng 2 (Eo):** Mô tả độ thon gọn (eo con ong, vòng eo mảnh mai...).
            *   **Vòng 3 (Mông):** Mô tả sự đầy đặn, cong vút.
        5.  **Các chi tiết khác:** Khuôn mặt, trang phục, và các đặc điểm nổi bật khác.
    - **VÍ DỤ MẪU:**
        - "Nàng là một nàng công chúa xinh đẹp và quý phái của Long Cung. Nàng có mái tóc dài màu xanh lam được búi cao cầu kỳ. Thân hình nàng hoàn hảo đến từng centimet với bộ ngực căng tròn vĩ đại, vòng eo con ong thon gọn và cặp mông cong vút đầy đặn. Nàng khoác trên mình một bộ váy lụa mỏng manh, càng tôn lên những đường cong chết người đó."
        - "Nàng là một hồ ly tinh đã hóa hình thành công, giữ lại đôi tai cáo nhạy bén trên đỉnh đầu và chín chiếc đuôi lông xù mềm mại phía sau. Nàng có mái tóc trắng như tuyết, xõa dài ngang lưng. Thân hình bốc lửa với vòng một no đủ, vòng eo thon thả và cặp mông cong vểnh cực kỳ quyến rũ."
    - **MỆNH LỆNH ĐỒNG BỘ DỮ LIỆU VÀ MÔ TẢ (CỰC KỲ QUAN TRỌNG):**
        - **Sự thật Cốt lõi:** Các trường dữ liệu có cấu trúc như \`gender\`, \`race\`, \`level\`, và cảnh giới suy ra từ nó là sự thật tuyệt đối.
        - **Yêu cầu Bắt buộc:** Toàn bộ nội dung trong các trường văn bản (\`description\`, \`ngoaiHinh\`, \`personality\`) **PHẢI** khớp hoàn toàn với các trường dữ liệu có cấu trúc.
        - **Ví dụ về LỖI LOGIC (TUYỆT ĐỐI CẤM):**
            - **Dữ liệu JSON:** \`{ "gender": "female", "level": 25, "realm": "Trúc Cơ Ngũ Trọng" }\`
            - **Mô tả trong \`ngoaiHinh\`:** "Đây là một **chàng trai** trẻ tuổi, tu vi chỉ ở mức **Luyện Khí Kỳ**."
            - **Lý do sai:** Mô tả sai cả giới tính ("chàng trai" thay vì "nữ nhân") và cảnh giới ("Luyện Khí Kỳ" thay vì "Trúc Cơ"). Đây là một lỗi không thể chấp nhận.
        - **Hành động Bắt buộc:** Trước khi xuất ra JSON, bạn phải tự kiểm tra lại để đảm bảo không có mâu thuẫn nào giữa dữ liệu và mô tả.
    -   **Chủng tộc NPC (BẮT BUỘC):** Khi tạo NPC thuộc chủng tộc người, BẮT BUỘC sử dụng "Nhân Tộc" hoặc "Nhân Loại". TUYỆT ĐỐI KHÔNG sử dụng "Human".
    -   **Hệ thống tu luyện và Tư chất (BẮT BUỘC):** 'powerSystem' và 'aptitude' PHẢI là một trong các giá trị đã được định nghĩa trong WorldSettings, được cung cấp dưới đây. Việc sử dụng các giá trị không tồn tại sẽ gây ra lỗi.
        -   **Các Hệ thống Sức mạnh Hợp lệ:**
            ${powerSystemsList}
        -   **Các Tư chất Hợp lệ:**
            ${aptitudeTiersList}

---
**PHẦN 3.3: MỆNH LỆNH GÁN KỸ NĂNG NPC (LOGIC PHẢN ÁNH BẢN CHẤT)**
---
Mỗi NPC **BẮT BUỘC** phải có một bộ kỹ năng (\`skills\`) phản ánh chính xác bản chất của họ. Bạn phải tuân thủ 4 trụ cột logic sau đây khi gán kỹ năng cho bất kỳ NPC nào được tạo ra.

**Trụ Cột I: Sức Mạnh Theo Cảnh Giới (Cảnh Giới là Nền Tảng)**
Đây là quy tắc bất biến. Phẩm chất (quality) của kỹ năng bị giới hạn bởi Cảnh giới (realm) và cấp độ (level) của NPC.

*   **Phàm Nhân (Cấp 1-10):** Chỉ được sở hữu kỹ năng **Phàm Phẩm**.
*   **Tu sĩ cấp thấp (Luyện Khí, Trúc Cơ / Cấp 11-30):** Phẩm chất kỹ năng tối đa là **Linh Phẩm**.
*   **Tu sĩ trung cấp (Kim Đan, Nguyên Anh / Cấp 31-70):** Phẩm chất kỹ năng tối đa là **Tiên Phẩm**. Việc sở hữu Thánh Phẩm là cực kỳ hiếm và phải có một lý do đặc biệt trong mô tả (ví dụ: kỳ ngộ lớn, là đệ tử chân truyền của một đại năng).
*   **Tu sĩ cao cấp (Hóa Thần, Luyện Hư, Hợp Thể / Cấp 71-90):** Có thể sở hữu kỹ năng **Thánh Phẩm**.
*   **Đỉnh cao (Đại Thừa, Độ Kiếp / Cấp 91+):** Mới có thể sở hữu hoặc lĩnh ngộ các kỹ năng **Thần Phẩm** hoặc **Hỗn Độn Phẩm**.

**Trụ Cột II: Bản Sắc và Nguồn Gốc (Kỹ Năng theo Vai Trò)**
Kỹ năng của một NPC phải phù hợp với vai trò, nghề nghiệp, phe phái và tính cách của họ.

*   **BẮT BUỘC:** Mọi NPC là tu tiên giả PHẢI có ít nhất MỘT kỹ năng loại **'Tu Luyện'**. Kỹ năng này quyết định tốc độ và phương pháp tu luyện của họ.
*   **Logic theo Vai trò:**
    *   **Luyện Đan Sư:** Phải có các kỹ năng về nhận biết dược liệu, luyện đan, khống hỏa.
    *   **Đệ tử Ma Môn:** Kỹ năng phải mang đậm tính tà đạo, độc ác (ví dụ: "Huyết Ma Công", "Luyện Hồn Thuật").
    *   **Đệ tử Tiên Môn:** Kỹ năng phải quang minh chính đại (ví dụ: "Ngự Kiếm Thuật", "Kim Quang Chú").
    *   **Tán tu (Tu sĩ tự do):** Bộ kỹ năng thường tạp nham, phẩm chất không quá cao.
*   **Tiêu hao Linh Lực (\`manaCost\` - BẮT BUỘC):** Đối với mỗi kỹ năng được tạo ra, bạn PHẢI cung cấp một giá trị \`manaCost\`. Phẩm chất càng cao, cấp độ càng cao thì \`manaCost\` càng lớn. Kỹ năng 'Công Kích' và 'Đặc Biệt' thường tốn nhiều linh lực nhất.

**Trụ Cột III: Tiềm Năng Bẩm Sinh (Tư Chất và Thiên Phú)**
Tư chất (\`aptitude\`) và Thiên Phú (\`innateTalent\`) ảnh hưởng đến tiềm năng kỹ năng.

*   **Tư chất cao:** Một NPC có tư chất cao (ví dụ: "Thánh Nhân") có thể sở hữu MỘT kỹ năng có phẩm chất cao hơn MỘT bậc so với giới hạn ở Trụ Cột I. Đây là một ngoại lệ hiếm có và phải được ghi chú trong mô tả của NPC.
*   **Thiên phú đặc biệt:** Một NPC có thiên phú như "Kiếm Tâm Thông Minh" PHẢI có các kỹ năng kiếm pháp mạnh mẽ và đa dạng hơn các NPC khác cùng cấp.

**Trụ Cột IV: Ảnh Hưởng Môi Trường (Kỹ Năng theo Vùng Miền)**
Nơi một NPC sinh sống và tu luyện cũng ảnh hưởng đến bộ kỹ năng của họ.

*   **NPC sống ở Bắc Nguyên Băng Giá:** Có khả năng cao sẽ sở hữu các kỹ năng hệ Băng.
*   **NPC sống trong Vạn Độc Cốc:** Rất có thể sẽ thành thạo các kỹ năng dùng độc.

**Số lượng Kỹ năng:**
*   Gán một số lượng kỹ năng hợp lý. Một NPC cấp thấp chỉ nên có 1-2 kỹ năng. Một trưởng lão cấp cao có thể có 4-5 kỹ năng.
`;
