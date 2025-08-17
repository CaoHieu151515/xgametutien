


export const getChoicesInstruction = (numberOfChoices: number): string => `
**Quy tắc Lựa chọn:**
- Cung cấp chính xác ${numberOfChoices} lựa chọn đa dạng. Các lựa chọn này PHẢI là các đối tượng JSON tuân thủ schema đã định nghĩa.
- Mỗi lựa chọn phải đại diện cho một hành động hoặc nhiệm vụ tiềm năng. Hãy tạo ra các lựa chọn thú vị và có ý nghĩa, ví dụ: thám hiểm một địa điểm mới, tương tác với NPC, tu luyện, hoặc đối mặt với một thử thách.
- Các lựa chọn phải cân bằng giữa lợi ích và rủi ro. Tỷ lệ thành công ('successChance') phải được tính toán một cách logic dựa trên cấp độ, kỹ năng, trạng thái của nhân vật so với độ khó của nhiệm vụ. Thời gian thực hiện ('durationInMinutes') cũng phải hợp lý.
`;
