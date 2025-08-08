
import { WorldSettings } from '../../types';

const worldDetailsInstruction = (worldSettings: WorldSettings | null): string => {
    let instruction = `- **Thế giới:** Thế giới này cổ xưa, đầy rẫy các môn phái đối địch, kho báu ẩn giấu, những con thú hùng mạnh và hành trình tìm kiếm sự giác ngộ tâm linh và sức mạnh.
- **Tình Cảm Gia Đình & Hiếu Đạo (QUAN TRỌNG):** Trong thế giới này, tình cảm gia đình được coi là thiêng liêng và vượt trên nhiều giá trị khác. Hiếu đạo (kính trọng và phụng dưỡng cha mẹ) là một chuẩn mực đạo đức tối cao. Bạn phải thể hiện điều này trong câu chuyện. Các nhân vật sẽ phản ứng rất tiêu cực với hành vi bất hiếu, và nó có thể dẫn đến những hậu quả nghiêm trọng như bị khai trừ khỏi gia tộc hoặc mất đi sự tôn trọng.`;
    
    if (worldSettings) {
         let detailsAdded = false;
         let detailsSection = "\n\nDưới đây là các chi tiết cụ thể hơn do người chơi cung cấp:\n";
        if (worldSettings.theme) {
            detailsSection += `    - **Chủ đề chính:** ${worldSettings.theme}\n`;
            detailsAdded = true;
        }
        if (worldSettings.genre) {
            detailsSection += `    - **Thể loại:** ${worldSettings.genre}\n`;
            detailsAdded = true;
        }
        if (worldSettings.context) {
            detailsSection += `    - **Bối cảnh chi tiết:** ${worldSettings.context}\n`;
            detailsAdded = true;
        }
        if(detailsAdded) {
            instruction += detailsSection;
        }
    }
    
    return instruction.trim();
};

const initialKnowledgeInstruction = (worldSettings: WorldSettings | null): string => {
    const initialKnowledgeList = worldSettings?.initialKnowledge && worldSettings.initialKnowledge.length > 0
        ? worldSettings.initialKnowledge.map(k => `    - **${k.title.trim()}:** ${k.content.trim()}`).join('\n')
        : '    - Không có tri thức khởi đầu nào được định nghĩa.';
    
    return `
- **Tri Thức Thế Giới Khởi Đầu (Lore):** Dưới đây là những sự thật và khái niệm cốt lõi của thế giới. Bạn PHẢI tuân thủ những điều này và sử dụng chúng để làm phong phú thêm câu chuyện. Những tri thức này là nền tảng, không thể thay đổi.
${initialKnowledgeList}
    `;
};

export const getWorldInstruction = (worldSettings: WorldSettings | null): string => {
    return `
**Quy tắc Thế giới:**
${worldDetailsInstruction(worldSettings)}
${initialKnowledgeInstruction(worldSettings)}
`;
}