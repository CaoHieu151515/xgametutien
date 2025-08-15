import { StatusEffect } from '../../types';

// Omit 'duration' as it's context-dependent.
export type PredefinedStatusEffect = Pick<StatusEffect, 'name' | 'description'>;

export const PREDEFINED_STATUS_EFFECTS: readonly PredefinedStatusEffect[] = [
    // === Negative Effects (Debuffs) ===
    { name: 'Trúng Độc', description: 'Mất sinh lực từ từ theo thời gian.' },
    { name: 'Suy Yếu', description: 'Giảm sức tấn công và phòng ngự.' },
    { name: 'Bỏng', description: 'Chịu sát thương lửa theo thời gian.' },
    { name: 'Tê Liệt', description: 'Không thể di chuyển hoặc hành động.' },
    { name: 'Choáng Váng', description: 'Giảm độ chính xác và khả năng né tránh.' },
    { name: 'Hỗn Loạn', description: 'Có thể tấn công nhầm đồng đội hoặc chính mình.' },
    { name: 'Mù Lòa', description: 'Giảm mạnh độ chính xác.' },
    { name: 'Trói Buộc', description: 'Không thể di chuyển.' },
    { name: 'Bị Bịt Mắt', description: 'Không thể nhìn thấy, giảm mạnh khả năng chiến đấu.'},
    { name: 'Bị Bịt Miệng', description: 'Không thể nói hoặc niệm chú.'},
    { name: 'Say Rượu', description: 'Hành động không chính xác, giảm chỉ số.'},
    { name: 'Trọng Thương', description: 'Bị thương nặng, các chỉ số bị giảm đáng kể.' },
    { name: 'Mất Máu', description: 'Mất máu liên tục mỗi lượt.' },
    { name: 'Bất Tỉnh', description: 'Mất đi ý thức, không thể hành động.' },
    { name: 'Bị Giam Cầm', description: 'Bị giam giữ, không thể tự do di chuyển.' },
    { name: 'Tẩu Hỏa Nhập Ma', description: 'Linh lực trong cơ thể vận hành sai lệch, gây ra sát thương nội tạng nghiêm trọng và có thể dẫn đến mất đi lý trí.' },
    { name: 'Linh Lực Hỗn Loạn', description: 'Dòng chảy linh lực trong cơ thể không ổn định, khiến việc thi triển kỹ năng trở nên khó khăn và thiếu chính xác.' },
    { name: 'Phong Bế Tu Vi', description: 'Toàn bộ tu vi đã bị niêm phong, tạm thời trở thành phàm nhân, không thể sử dụng linh lực.' },
    { name: 'Tâm Ma Quấy Nhiễu', description: 'Nội tâm bất ổn, tâm ma trỗi dậy, có thể dẫn đến hành động mất kiểm soát hoặc tẩu hỏa nhập ma.' },
    { name: 'Khí Huyết Suy Bại', description: 'Khí huyết trong cơ thể suy kiệt, sinh lực và sức mạnh giảm mạnh.' },
    { name: 'Bị Khống Chế', description: 'Tâm trí hoặc cơ thể bị người khác điều khiển, không thể hành động theo ý muốn.' },


    // === Positive Effects (Buffs) ===
    { name: 'Tăng Sức Mạnh', description: 'Tăng sức tấn công.' },
    { name: 'Phòng Ngự Kiên Cố', description: 'Tăng sức phòng ngự.' },
    { name: 'Tăng Tốc', description: 'Tăng tốc độ di chuyển và hành động.' },
    { name: 'Hồi Phục', description: 'Hồi phục sinh lực từ từ theo thời gian.' },
    { name: 'Linh Lực Dồi Dào', description: 'Hồi phục linh lực từ từ theo thời gian.' },
    { name: 'Tàng Hình', description: 'Trở nên vô hình trước kẻ địch.' },
    
    // === Special/Contextual Effects ===
    { name: 'Bị Thiến', description: 'Đã mất đi bộ phận sinh dục nam. Giọng nói trở nên thanh mảnh hơn, tính cách có thể thay đổi, không còn khả năng sinh sản hoặc thực hiện các hành vi tình dục của nam giới.' },
    { name: 'Dương Vật Bị Khóa', description: 'Dương vật đã bị khóa trong một chiếc lồng trinh tiết, không thể tự chủ cương cứng hay xuất tinh. Chìa khóa do chủ nhân nắm giữ.' },
    { name: 'Mang Thai', description: 'Đang mang trong mình một sinh mệnh mới. Cần thời gian để thai nhi phát triển.' },
    { name: 'Khế Ước Nô Lệ', description: 'Bị ràng buộc bởi một khế ước, phải tuyệt đối phục tùng chủ nhân. Trạng thái này có thể bị phá vỡ nếu ý chí đủ mạnh hoặc có sự can thiệp từ bên ngoài.' },
    { name: 'Khuyển Nô', description: 'Đã bị cải tạo hoàn toàn cả về thể chất lẫn tinh thần. Phải tuyệt đối phục tùng chủ nhân như một con vật cưng. Trạng thái này cực kỳ khó để phá vỡ.' },
    { name: 'Huyết Mạch Thức Tỉnh', description: 'Huyết mạch đặc biệt đã được kích hoạt, mang lại sức mạnh tiềm ẩn.' },
    { name: 'Trúng Xuân Dược', description: 'Cơ thể nóng như lửa đốt, lý trí dần tan rã, dục vọng nguyên thủy trỗi dậy không thể kiểm soát. Cần phải giao hợp để giải trừ.' },
    { name: 'Bị Sỉ Nhục', description: 'Trạng thái tinh thần bị ảnh hưởng tiêu cực do bị làm nhục, có thể ảnh hưởng đến khả năng tập trung.' },
    { name: 'Thân Thể Thục Tội', description: 'Đang trong thời gian phục dịch tại Phục Dịch Viện để chuộc tội. Phải phục vụ theo yêu cầu.' },
    { name: 'Long Phượng Thể Kích Hoạt', description: 'Huyết mạch Long Phượng đã được kích hoạt, có khả năng thay đổi giới tính và tăng cường sức mạnh.' },
    { name: 'Ma Đồng Khai Mở', description: 'Con mắt đặc biệt đã được khai mở, ban cho khả năng nhìn thấu ảo ảnh hoặc các năng lực đặc biệt khác.' },
    { name: 'Hưng Phấn', description: 'Cơ thể và tâm trí ở trạng thái kích thích tình dục cao độ, có thể dẫn đến hành động thiếu lý trí.' },
    { name: 'Bị Mê Hoặc', description: 'Tâm trí bị ảnh hưởng bởi một sức mạnh quyến rũ, giảm khả năng kháng cự lại các yêu cầu và đề nghị.' },
    { name: 'Tâm Thần Bị Nhiễu Loạn', description: 'Tâm trí bị xáo trộn, khó tập trung và dễ bị ảnh hưởng bởi các yếu tố bên ngoài.' }
];