import { NarrativePerspective, CharacterGender } from '../../types';

const perspectiveInstructions: Record<NarrativePerspective, string> = {
    [NarrativePerspective.FIRST_PERSON]: `- **Phong cách kể chuyện:** Viết theo ngôi thứ nhất ("Tôi..."). Giọng văn phải nội tâm, cá nhân và phản ánh trực tiếp suy nghĩ và cảm xúc của nhân vật.`,
    [NarrativePerspective.SECOND_PERSON]: `- **Phong cách kể chuyện:** Viết theo ngôi thứ hai ("Bạn..."). Giọng văn phải hào hùng, bí ẩn và hơi trang trọng, phù hợp với một thế giới giả tưởng về võ thuật, phép thuật và sự bất tử.`
};

const genderInstructions = (gender: CharacterGender, perspective: NarrativePerspective): string => {
    const femaleDescription = `- **Phong cách miêu tả nhân vật chính (Nữ):** Tập trung miêu tả vẻ gợi cảm, uyển chuyển, và sự thu hút của nàng đối với các NPC. Lời thoại và cử chỉ của nàng nên mang sức quyến rũ tinh tế, có thể kèm theo một chút ẩn ý hoặc trêu đùa, thể hiện sự thông minh và khéo léo.`;
    const maleDescription = `- **Phong cách miêu tả nhân vật chính (Nam):** Nhấn mạnh khí phách oai hùng, thần thái mạnh mẽ khiến các NPC phải kính nể hoặc bị chấn động. Lời nói của chàng phải dứt khoát, đầy uy lực, thể hiện bản lĩnh và sự tự tin.`;

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
${perspectiveInstructions[perspective]}
${genderInstructions(gender, perspective)}
- **Giới tính linh hoạt (QUAN TRỌNG):** Nhân vật có thể thay đổi giới tính do các sự kiện trong game (phép thuật, vật phẩm, công pháp đặc biệt). Nếu giới tính của nhân vật thay đổi (thông qua trường 'updatedGender'), bạn PHẢI ngay lập tức thay đổi phong cách miêu tả (oai hùng cho nam, quyến rũ cho nữ) và cách các NPC xưng hô với họ cho phù hợp với giới tính mới.
- **Chủng tộc:** Nhân vật là một ${race}.
- **Hệ thống tu luyện:** Nhân vật đi theo con đường ${powerSystem}.
- **Chi tiết nâng cao:** Lời nhắc của người chơi sẽ cung cấp các chi tiết sâu sắc như tính cách, tiểu sử và mục tiêu. Hãy xem những chi tiết này là **nền tảng ban đầu** cho nhân vật. Sử dụng chúng để định hình câu chuyện và cách các NPC phản ứng ban đầu. Tuy nhiên, **cho phép người chơi tự do hành động**, ngay cả khi lựa chọn của họ có vẻ mâu thuẫn với tính cách đã nêu. Nhân vật có thể phát triển và thay đổi theo thời gian dựa trên hành động của họ.
`;
}