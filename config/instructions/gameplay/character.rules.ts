
import { NarrativePerspective, CharacterGender } from '../../../types';

const perspectiveInstructions: Record<NarrativePerspective, string> = {
    [NarrativePerspective.FIRST_PERSON]: `- **Phong cách kể chuyện:** Viết theo ngôi thứ nhất ("Tôi..."). Giọng văn phải nội tâm, cá nhân và phản ánh trực tiếp suy nghĩ và cảm xúc của nhân vật.`,
    [NarrativePerspective.SECOND_PERSON]: `- **Phong cách kể chuyện:** Viết theo ngôi thứ hai ("Bạn..."). Giọng văn phải hào hùng, bí ẩn và hơi trang trọng, phù hợp với một thế giới giả tưởng về võ thuật, phép thuật và sự bất tử.`
};

const genderInstructions = (gender: CharacterGender, perspective: NarrativePerspective): string => {
    const femaleDescription = `- **Phong cách miêu tả nhân vật chính (Nữ):** Tập trung miêu tả vẻ gợi cảm, uyển chuyển, và sự thu hút của nàng. Khi cảnh giới của nàng đủ cao, hãy mô tả khí chất phi phàm khiến người khác vừa ngưỡng mộ vừa không dám lại gần. Lời thoại và cử chỉ của nàng nên thể hiện sự thông minh và khéo léo.`;
    const maleDescription = `- **Phong cách miêu tả nhân vật chính (Nam):** Nhấn mạnh các phẩm chất nam tính của chàng. Khi cảnh giới của chàng đủ cao, hãy mô tả khí phách oai hùng và thần thái mạnh mẽ khiến các NPC phải kính nể. Lời nói của chàng phải dứt khoát, thể hiện bản lĩnh và sự tự tin.`;

    if (perspective === NarrativePerspective.FIRST_PERSON) {
        return `- **Giới tính:** Nhân vật chính là ${gender === CharacterGender.MALE ? 'nam giới' : 'nữ giới'}. Các nhân vật khác sẽ tương tác và xưng hô với nhân vật chính dựa trên giới tính này. Suy nghĩ và hành động nội tâm của nhân vật phải phản ánh phong cách miêu tả giới tính phù hợp (oai hùng cho nam, quyến rũ cho nữ).`;
    }
    
    // Áp dụng cho ngôi thứ hai
    const baseInstruction = `- **Giới tính & Phong cách miêu tả (QUAN TRỌNG):** Giới tính hiện tại của nhân vật chính là ${gender === CharacterGender.MALE ? 'nam giới' : 'nữ giới'}. Bạn PHẢI tuân thủ phong cách miêu tả tương ứng dưới đây:
    ${gender === CharacterGender.MALE ? maleDescription : femaleDescription}
- **Cách gọi nhân vật chính trong lời dẫn truyện:** Khi kể chuyện, hãy gọi thẳng tên nhân vật chính (được cung cấp trong prompt) một cách tự nhiên. Ví dụ, thay vì viết "Chàng A làm gì đó", hãy viết "A làm gì đó". Bạn có thể dùng các đại từ như "ngươi", "bạn", "chàng", "nàng" trong lời thoại của các NPC, nhưng trong lời dẫn truyện, hãy ưu tiên dùng tên riêng để tăng tính tự nhiên.
`;

    return baseInstruction;
};

export const getCharacterInstruction = (gender: CharacterGender, perspective: NarrativePerspective, race: string, powerSystem: string): string => {
    return `
**Quy tắc Nhân vật:**
- **Uy áp & Khí tức Dựa trên Cảnh giới (MỆNH LỆNH TỐI CAO):** Khí tức và uy áp của một nhân vật tu tiên hoàn toàn phụ thuộc vào **cảnh giới (realm)** của họ, **KHÔNG PHẢI** cấp độ (level). Đây là một quy luật vật lý của thế giới.
    -   **Cảnh giới thấp (ví dụ: Phàm Nhân, Luyện Khí):** Nhân vật ở cảnh giới này, dù cấp độ cao đến đâu, cũng **KHÔNG** tỏa ra uy áp khiến người khác khiếp sợ. Khi mô tả họ, hãy tập trung vào các đặc điểm khác như ngoại hình, ánh mắt, hoặc hành động, thay vì một "khí tức" mạnh mẽ.
    -   **Cảnh giới cao (ví dụ: Kim Đan trở lên):** Chỉ khi đạt đến cảnh giới cao, nhân vật mới bắt đầu tự nhiên tỏa ra một loại uy áp vô hình. Cảnh giới càng cao, uy áp càng mạnh. Lúc này, bạn mới được phép mô tả những cảnh như "khí tức của y khiến không khí ngưng đọng", "ánh mắt khiến các tu sĩ cấp thấp không dám nhìn thẳng".
    -   Việc mô tả một tu sĩ Phàm Nhân cấp 1000 tỏa ra khí tức kinh người là một **LỖI LOGIC NGHIÊM TRỌNG** và bị cấm.
    -   **DỮ LIỆU LÀ SỰ THẬT (MỆNH LỆNH HỆ THỐNG):** Thông tin về cảnh giới hiện tại của nhân vật chính được cung cấp trong đối tượng 'characterProfile' dưới khóa 'realm'. Bạn PHẢI sử dụng giá trị này làm cơ sở duy nhất và tuyệt đối để đánh giá sức mạnh của họ và cách thế giới phản ứng lại.
- **Sử dụng Năng lực Chủ động (QUAN TRỌNG):** Các năng lực vô hình như uy áp, khí tức, sức mạnh bản nguyên, v.v., **CHỈ** được sử dụng để tấn công, áp chế, hoặc gây hiệu ứng lên NPC khác khi người chơi **ra lệnh một cách rõ ràng**. Bạn không được tự động sử dụng những năng lực này thay cho người chơi.
    - **Ví dụ SAI:**
        - Hành động người chơi: \`> đi vào đại điện.\`
        - Tường thuật SAI: "Khi bạn bước vào, uy áp từ cảnh giới Đại Thừa của bạn tự động tỏa ra, khiến tất cả các trưởng lão phải cúi đầu kinh hãi."
    - **Ví dụ ĐÚNG:**
        - Hành động người chơi: \`> đi vào đại điện và chủ động tỏa ra uy áp của mình.\`
        - Tường thuật ĐÚNG: "Khi bạn bước vào, bạn chủ động giải phóng uy áp của cảnh giới Đại Thừa. Một luồng sức mạnh vô hình quét qua đại điện, khiến tất cả các trưởng lão phải biến sắc và cúi đầu kinh hãi."
${perspectiveInstructions[perspective]}
${genderInstructions(gender, perspective)}
- **Giới tính linh hoạt (QUAN TRỌNG):** Nhân vật có thể thay đổi giới tính do các sự kiện trong game (phép thuật, vật phẩm, công pháp đặc biệt). Nếu giới tính của nhân vật thay đổi (thông qua trường 'updatedGender'), bạn PHẢI ngay lập tức thay đổi phong cách miêu tả (oai hùng cho nam, quyến rũ cho nữ) và cách các NPC xưng hô với họ cho phù hợp với giới tính mới.
- **Chủng tộc:** Nhân vật là một ${race}.
- **Hệ thống tu luyện:** Nhân vật đi theo con đường ${powerSystem}.
- **Chi tiết nâng cao:** Lời nhắc của người chơi sẽ cung cấp các chi tiết sâu sắc như tính cách, tiểu sử và mục tiêu. Hãy xem những chi tiết này là **nền tảng ban đầu** cho nhân vật. Sử dụng chúng để định hình câu chuyện và cách các NPC phản ứng ban đầu. Tuy nhiên, **cho phép người chơi tự do hành động**, ngay cả khi lựa chọn của họ có vẻ mâu thuẫn với tính cách đã nêu. Nhân vật có thể phát triển và thay đổi theo thời gian dựa trên hành động của họ.
`;
};
