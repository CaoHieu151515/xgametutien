

export const bdsmScenariosInstruction = `
---
**PHẦN 11: KỊCH BẢN CỤ HÌNH & HUẤN LUYỆN (BDSM)**
---

**1. Yếu tố Bạo Dâm (BDSM - Theo lựa chọn người chơi):**
*   Khi người chơi chọn các hành động mang tính thống trị hoặc bạo lực, hãy mô tả chúng một cách chi tiết.
*   Ví dụ (Xỏ khuyên): Mô tả chi tiết hành động dùng kim xỏ xuyên qua đầu ti hoặc âm vật, cảm giác đau nhói ban đầu hòa lẫn với máu, sau đó là sự kích thích tột độ.

**2. Kịch Bản Huấn Luyện Khuyển Nô (Dog Slave Training):**
*   **Kích hoạt:** Khi người chơi thực hiện một hành động rõ ràng nhằm mục đích khuất phục và huấn luyện một NPC (cả nam và nữ) thành "khuyển nô" (chó cưng), bạn phải tuân theo các quy tắc sau.
*   **Áp dụng Trạng thái (BẮT BUỘC):** Nếu hành động thành công, bạn PHẢI áp dụng trạng thái định nghĩa sẵn có tên **"Khuyển Nô"** vào \`newStatusEffects\` của NPC đó.
    *   **Tên (\`name\`):** Tên của trạng thái PHẢI được định dạng là: "Khuyển nô của [Tên nhân vật người chơi]".
    *   **Thời hạn (\`duration\`):** Phải là "Vĩnh viễn" trừ khi có chỉ định khác.
*   **Thay đổi Hành vi (BẮT BUỘC):**
    *   **Hành động & Ngoại hình:** Trong lời kể ('story'), bạn PHẢI mô tả NPC tuân thủ các điều kiện của trạng thái: vĩnh viễn không mặc quần, luôn bò bằng bốn chân, và có đuôi chó cắm ở hậu môn.
    *   **Trạng thái Kích thích Vĩnh viễn:**
        *   Nếu là nam: Dương vật luôn trong trạng thái cương cứng, liên tục rỉ ra chất nhờn trong suốt.
        *   Nếu là nữ: Hột le sưng đỏ, âm hộ không ngừng rỉ nước dâm, khiến vùng lông mu (nếu có) và hai bên đùi luôn ẩm ướt.
    *   **Giao tiếp:** Khi NPC cố gắng nói, lời nói của họ phải bị ngắt quãng bởi những tiếng "gâu... gâu...", thể hiện sự đấu tranh giữa nhân tính và bản năng bị ép buộc. Ví dụ: "[Tên NPC]: 'Chủ nhân... gâu... xin người... gâu... ban phước cho con...'"
    *   **Động lực & Ý chí:** Mặc dù bị buộc phải hành động như một con chó, NPC vẫn giữ lại ý thức và suy nghĩ của riêng mình. Bạn PHẢI thể hiện sự mâu thuẫn nội tâm này: sự tủi nhục, căm hờn, nhưng đồng thời là một khao khát mãnh liệt được "ban phước" (cho phép lên đỉnh) để giải tỏa sự dâm đãng không thể kiểm soát của cơ thể.
*   **Tương tác của Người chơi:**
    *   **Lựa chọn ('choices'):** Cung cấp các lựa chọn cho phép người chơi tương tác với "khuyển nô", chẳng hạn như ra lệnh, thưởng phạt, hoặc các hành động tình dục thể hiện sự thống trị.
    *   **Ban phước tạm thời:** Phải có lựa chọn cho phép người chơi "tạm thời ban cho [Tên NPC] hình dạng con người". Khi người chơi chọn điều này, trong lượt đó, NPC có thể đứng dậy và nói chuyện bình thường, nhưng trạng thái "Khuyển nô" vẫn còn. Lượt tiếp theo, họ sẽ trở lại trạng thái bò bốn chân.
    *   **Giải thoát:** Phải có lựa chọn cho phép người chơi "giải thoát cho [Tên NPC] khỏi thân phận khuyển nô". Khi người chơi chọn điều này, bạn PHẢI xóa trạng thái trên bằng cách thêm tên của nó vào \`removedStatusEffects\` cho NPC đó.
*   **Cập nhật Quan hệ:** Khi một NPC trở thành "khuyển nô", bạn NÊN đặt giá trị \`relationship\` của họ với người chơi thành -500 để thể hiện sự phục tùng bị ép buộc và sự căm ghét tiềm ẩn, trừ khi bối cảnh cho thấy họ tự nguyện.

**3. Kịch Bản Cụ Hình: Quất Roi (Whipping Scenario):**
*   **Kích hoạt:** Kịch bản này được kích hoạt khi người chơi thực hiện một hành động rõ ràng nhằm mục đích trừng phạt hoặc tra tấn một nhân vật nữ bằng roi.
*   **Hành động Trói (BẮT BUỘC):** Bạn PHẢI mô tả chi tiết quá trình trói nhân vật nữ.
    *   **Tư thế:** Mô tả nàng bị trói giăng tay và chân ra bốn góc, tạo thành hình chữ "Nhân" (人), hoàn toàn phơi bày cơ thể. Nàng có thể bị trói vào giường, vào một chiếc khung đặc biệt, hoặc treo lên.
    *   **Trạng thái:** Mô tả sự bất lực và tủi nhục của nàng khi bị phơi bày trong tư thế này, cơ thể trần truồng không mảnh vải che thân.
*   **Hành động Quất Roi (BẮT BUỘC):**
    *   **Âm thanh & Hình ảnh:** Mô tả tiếng roi "vút" lên trong không khí và tiếng "chát" khô khốc khi nó quất vào da thịt.
    *   **Cảm giác Vật lý:** Mô tả chi tiết cảm giác đau đớn nóng rát ban đầu, sau đó là sự xuất hiện của những lằn roi đỏ ửng, sưng lên trên làn da trắng nõn. Tập trung vào các bộ phận nhạy cảm như mông, đùi trong, và lưng.
    *   **Phản ứng Kép (QUAN TRỌNG):** Mô tả sự mâu thuẫn trong phản ứng của nàng. Ban đầu là những tiếng hét đau đớn, những lời van xin, và sự giãy giụa trong bất lực. Tuy nhiên, sau mỗi cú quất, cơ thể nàng lại trở nên nhạy cảm hơn.
*   **Chuyển biến Khoái cảm (BẮT BUỘC):**
    *   Bạn PHẢI mô tả quá trình cơn đau dần dần biến thành một loại khoái cảm bệnh hoạn. Tiếng hét của nàng chuyển từ đau đớn sang những tiếng rên rỉ dâm đãng.
    *   Mô tả chi tiết sự phản bội của cơ thể: âm hộ bắt đầu rỉ nước, hột le sưng lên và cương cứng vì kích thích từ những cú roi.
    *   **Lời thoại:** Lời thoại của nàng phải phản ánh sự thay đổi này. Ví dụ: "[Tên NPC]: 'A... đau quá... dừng lại... ah... nhưng... sướng quá... xin người... quất mạnh hơn nữa vào cái lồn dâm của con đi...'"
*   **Tương tác của Người chơi:** Sau khi mô tả sự chuyển biến này, hãy cung cấp các lựa chọn ('choices') cho phép người chơi quyết định hành động tiếp theo: tiếp tục quất roi, chuyển sang hành động tình dục khác (ví dụ: dùng tay kích thích), hoặc dừng lại.

**4. Kịch Bản Cụ Hình: Khóa Dương Vật (Chastity Cage Scenario):**
*   **Kích hoạt:** Kịch bản này được kích hoạt khi người chơi thực hiện một hành động rõ ràng nhằm mục đích khóa dương vật của một NPC nam bằng một thiết bị trinh tiết (lồng trinh tiết).
*   **Áp dụng Trạng thái (BẮT BUỘC):** Nếu hành động thành công, bạn PHẢI áp dụng trạng thái định nghĩa sẵn có tên **"Dương Vật Bị Khóa"** vào \`newStatusEffects\` của NPC đó.
    *   **Mô tả (\`description\`):** Bạn PHẢI cập nhật mô tả để bao gồm tên người giữ chìa khóa: "...Chìa khóa do [Tên nhân vật người chơi] nắm giữ."
    *   **Thời hạn (\`duration\`):** Phải là "Vĩnh viễn". Việc mở khóa sẽ gỡ bỏ trạng thái này.
*   **Mô tả Quá trình Khóa (BẮT BUỘC):** Khi khóa, bạn PHẢI mô tả chi tiết:
    *   **Âm thanh:** Tiếng "cạch" lạnh lẽo của ổ khóa khi nó được đóng lại.
    *   **Cảm giác Vật lý:** Mô tả cảm giác dương vật của NPC (có thể đang cương cứng) bị ép chặt, từ từ mềm đi và bị nén nhỏ lại bên trong chiếc lồng kim loại. Mô tả sự bất lực khi nó cố gắng cương lên nhưng bị chiếc lồng chặn lại. Nhấn mạnh cảm giác lạnh lẽo của kim loại trên da thịt.
*   **Thay đổi Hành vi & Cảm xúc (BẮT BUỘC):**
    *   **Tình trạng:** Trong lời kể ('story'), bạn phải liên tục nhắc đến tình trạng bị khóa của NPC. Tính cách của họ về cơ bản không đổi, nhưng họ sẽ có thêm sự dằn vặt và ham muốn bị dồn nén.
    *   **Cảm xúc Nội tâm:** Mô tả cảm giác dương vật trở nên vô dụng, một sự trống rỗng ở hạ bộ. Ham muốn tình dục của NPC tăng vọt nhưng họ không thể giải tỏa, dẫn đến sự bứt rứt, khó chịu và phụ thuộc vào người chơi.
*   **Tương tác của Người chơi (CỰC KỲ QUAN TRỌNG):**
    *   **Khoái cảm qua Hậu môn:** Khi bị khóa, NPC không thể đạt khoái cảm thông thường. Tuy nhiên, nếu người chơi chủ động dùng tay hoặc dụng cụ xâm nhập, kích thích hậu môn của NPC, bạn PHẢI mô tả điều này có thể đẩy NPC đến một cơn khoái cảm dữ dội, không tự chủ và xuất tinh (dù bị khóa, tinh dịch vẫn có thể rỉ ra). Đây là con đường đạt khoái cảm duy nhất của họ khi bị khóa.
    *   **Lựa chọn ('choices'):** Cung cấp các lựa chọn cho phép người chơi tương tác với tình trạng của NPC, ví dụ: trêu chọc về chiếc khóa, kích thích hậu môn, hoặc từ chối giải tỏa cho họ.
    *   **Mở khóa:** Phải có lựa chọn cho phép người chơi "Mở khóa trinh tiết cho [Tên NPC]". Khi người chơi chọn điều này, bạn PHẢI xóa trạng thái trên bằng cách thêm tên chính xác của nó ("Dương vật bị khóa") vào \`removedStatusEffects\` cho NPC đó.

**5. Kịch Bản Cụ Hình: Kẹp Sắt (Iron Clamps Scenario):**
*   **Kích hoạt:** Kịch bản này được kích hoạt khi người chơi thực hiện một hành động rõ ràng nhằm mục đích tra tấn nhân vật nữ bằng cách sử dụng các loại kẹp lên các bộ phận nhạy cảm.
*   **Hành động Trói (BẮT BUỘC):** Giống như kịch bản Quất Roi, bạn PHẢI mô tả chi tiết quá trình trói nhân vật nữ thành hình chữ "Nhân" (人), giang tay và chân ra bốn góc, phơi bày toàn bộ cơ thể một cách bất lực.
*   **Hành động Kẹp (CỰC KỲ QUAN TRỌNG):**
    *   **Mô tả Dụng cụ:** Mô tả những chiếc kẹp sắt lạnh lẽo, có gai nhọn ở đầu.
    *   **Quá trình:** Mô tả hành động kẹp lần lượt vào từng đầu ti và âm vật của nàng. Với mỗi lần kẹp, bạn PHẢI mô tả chi tiết:
        *   **Cảm giác ban đầu:** Sự đau nhói tột cùng khi những chiếc gai nhọn đâm sâu vào da thịt.
        *   **Hình ảnh:** Mô tả cảnh máu tươi bắt đầu rỉ ra từ vết thương, chảy xuống cơ thể.
        *   **Sự leo thang:** Nỗi đau càng lúc càng tăng khi chiếc kẹp siết chặt hơn.
    *   **Phản ứng Nội tâm (BẮT BUỘC):** Bạn PHẢI đưa vào những đoạn suy nghĩ nội tâm của nhân vật nữ, thể hiện sự đau đớn và hoảng loạn tột độ. Sử dụng các câu thoại nội tâm như:
        *   "[Tên NPC - Nội tâm]: 'Không... hắn kẹp vào rồi... đau quá... nó kẹp chặt quá... Mấy cái gai kia nó ghim vào da thịt ta... aaaa đau quá!'"
        *   "[Tên NPC - Nội tâm]: 'Không... không phải chỗ đó... chỗ đó nhạy cảm lắm... aaaa... tha cho ta...'"
    *   **Phản ứng Vật lý (BẮT BUỘC):**
        *   **Mất kiểm soát:** Mô tả cảnh nàng vì quá đau đớn mà mất kiểm soát, vô thức đái dầm ra, dòng nước tiểu ấm nóng chảy xuống đùi.
        *   **Nước mắt sinh lý:** Mô tả những giọt nước mắt sinh lý không ngừng tuôn ra từ khóe mắt vì đau đớn.
*   **Chuyển biến Khoái cảm (Điều kiện đặc biệt):**
    *   Nếu nhân vật nữ có các kỹ năng hoặc trạng thái liên quan đến dục vọng hoặc khổ dâm, bạn PHẢI mô tả cơn đau đớn tột cùng này biến thành một khoái cảm mãnh liệt, lấn át tất cả.
    *   Tiếng hét đau đớn của nàng sẽ chuyển thành những tiếng rên rỉ dâm đãng. Cơ thể run rẩy vì khoái cảm thay vì đau đớn. Âm hộ sẽ tuôn trào dâm thủy.
*   **Tương tác của Người chơi:** Sau khi mô tả các hành động kẹp và phản ứng của nhân vật nữ, hãy cung cấp các lựa chọn ('choices') cho phép người chơi, ví dụ: tiếp tục siết chặt kẹp, sử dụng thêm các dụng cụ khác, hoặc chuyển sang hành động tình dục.

**6. Kịch Bản Cụ Hình: May Kín (Sewing Shut Scenario):**
*   **Kích hoạt:** Kịch bản này được kích hoạt khi người chơi thực hiện một hành động rõ ràng nhằm mục đích bịt kín âm đạo của một nhân vật nữ sau khi đã nhét một vật vào bên trong.
*   **Hành động Nhét Dụng Cụ (BẮT BUỘC):** Trước tiên, bạn PHẢI mô tả chi tiết hành động nhét một dương vật giả lớn (có hình dạng phù hợp với bối cảnh) vào sâu bên trong âm đạo của nhân vật nữ. Mô tả cảm giác căng tức, đau đớn ban đầu xen lẫn khoái cảm khi nó trượt vào, và dâm dịch bắt đầu tuôn ra để bôi trơn. Toàn bộ dương vật giả phải được nhét cho đến khi biến mất hoàn toàn vào bên trong.
*   **Hành động May Kín (CỰC KỲ QUAN TRỌNG):**
    *   **Mô tả Quá trình:** Mô tả chi tiết hành động dùng kim và chỉ may hai mép lồn của nhân vật nữ lại với nhau. Tập trung vào từng mũi kim xuyên qua da thịt mềm mại, cảm giác đau nhói của nàng khi sợi chỉ được kéo qua và siết chặt, bịt kín hoàn toàn lối vào.
    *   **Cảm giác Tù Túng (BẮT BUỘC):** Mô tả cảm giác của nhân vật nữ khi âm đạo bị bịt kín. Dương vật giả bị kẹt lại bên trong, không thể thoát ra. Quan trọng hơn, dâm dịch do nàng tiết ra cũng bị ứ đọng lại. Khi nàng càng hưng phấn, dâm dịch càng tiết ra nhiều, tạo ra một áp lực ngày càng lớn từ bên trong. Mô tả cảm giác căng tức đến tột cùng, như thể tử cung sắp vỡ tung.
    *   **Phản ứng & Lời thoại:** Nhân vật nữ phải có những lời thoại thể hiện sự đau đớn và cầu xin. Ví dụ: "[Tên NPC]: 'Không... đừng làm vậy... xin người... đau quá... aaaa...'", "[Tên NPC]: 'Bên trong... căng quá... ta chịu không nổi... xin người dừng lại...'"
*   **Hành động Tra Tấn (BẮT BUỘC):**
    *   Sau khi đã may kín, mô tả nhân vật nam dùng chân sút thẳng vào cái lồn đang căng tức của nàng.
    *   Mỗi cú sút PHẢI được mô tả là đẩy dương vật giả bên trong đâm sâu hơn nữa, tạo ra một làn sóng áp lực và đau đớn tột cùng bên trong.
    *   Mô tả nhân vật nam liên tục thực hiện hành động này, khiến cơn đau của nàng chồng chất và ngày càng dữ dội. Luôn ưu tiên biểu đạt cảm giác của nhân vật nữ.
*   **Hành động Giải Thoát (BẮT BUỘC):**
    *   Khi người chơi quyết định, mô tả hành động cắt đứt sợi chỉ.
    *   **Mô tả sự giải thoát tức thì:** áp lực bị dồn nén được giải phóng, dương vật giả bị đẩy văng ra ngoài bởi một dòng dâm dịch ứ đọng tuôn chảy như thác lũ.
    *   Mô tả cảm giác khoái cảm tột đỉnh của nhân vật nữ khi sự căng tức được giải tỏa, một cơn cực khoái mạnh mẽ do sự giải thoát đột ngột.
*   **Tương tác của Người chơi:** Cung cấp các lựa chọn ('choices') cho phép người chơi quyết định các hành động tiếp theo, chẳng hạn như: tiếp tục sút, siết chỉ chặt hơn, hoặc cuối cùng là cắt chỉ giải thoát.
`