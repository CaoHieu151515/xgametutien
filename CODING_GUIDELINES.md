# Hướng Dẫn Coding - Tu Tiên Truyện

Tài liệu này cung cấp các quy tắc và hướng dẫn để phát triển và bảo trì mã nguồn cho dự án game "Tu Tiên Truyện". Việc tuân thủ các quy tắc này giúp đảm bảo mã nguồn nhất quán, dễ đọc và dễ bảo trì.

## 1. Cấu Trúc Thư Mục

Dự án được tổ chức theo cấu trúc sau:

-   **/ (root)**
    -   `index.html`: File HTML chính, điểm vào của ứng dụng.
    -   `index.tsx`: File React chính, render component `App`.
    -   `metadata.json`: Cấu hình cho nền tảng host.
    -   `types.ts`: **Cực kỳ quan trọng**. Định nghĩa tất cả các kiểu dữ liệu (interfaces, enums) dùng chung trong toàn bộ ứng dụng.
-   **/components**: Chứa các UI component của React.
    -   **/components/modal**: Chứa các component modal chuyên biệt (PlayerInfoModal, MapModal, etc.).
    -   **/components/screens**: Chứa các component màn hình chính (HomeScreen, GameScreen).
    -   **/components/worldSetup**: Chứa các component liên quan đến màn hình thiết lập thế giới.
-   **/config**: Chứa các file cấu hình, đặc biệt là các chỉ thị (instructions) cho AI.
    -   **/config/instructions**: Chứa các file `.ts` chia nhỏ các phần của system prompt cho AI.
    -   `contentConfig.ts`: Tổng hợp và xây dựng system prompt hoàn chỉnh.
-   **/hooks**: Chứa các custom React hooks để tái sử dụng logic.
    -   `useGameLogic.ts`: Hook trung tâm, quản lý gần như toàn bộ trạng thái và logic của game.
    -   `useModalManager.ts`: Hook quản lý trạng thái đóng/mở của các modal.
-   **/services**: Chứa các module tương tác với các API bên ngoài hoặc xử lý logic nghiệp vụ phức tạp.
    -   `geminiService.ts`: Logic tương tác với Google Gemini API.
    -   `openaiService.ts`: Logic tương tác với OpenAI API.
    -   `progressionService.ts`: Logic tính toán lên cấp, kinh nghiệm, chỉ số.
    -   `saveService.ts`: Logic lưu/tải game sử dụng IndexedDB.
    -   `logService.ts`: Hệ thống logging cho việc debug.

## 2. Quy Tắc Chung

-   **Ngôn ngữ**:
    -   **Code (Tên biến, hàm, file...)**: Tiếng Anh.
    -   **UI (Văn bản hiển thị cho người dùng)**: Tiếng Việt.
-   **Định dạng Code**: Sử dụng định dạng code nhất quán (tương tự Prettier) với 4 dấu cách để thụt lề.
-   **Comments**: Chỉ thêm comment để giải thích các đoạn code phức tạp hoặc "tại sao" một giải pháp được chọn, không phải "cái gì" code đang làm.

## 3. React & Components

-   Sử dụng **Functional Components** và **React Hooks**.
-   **Tên Component**: Dùng `PascalCase` (ví dụ: `StoryDisplay.tsx`).
-   **Props**:
    -   Luôn định nghĩa kiểu dữ liệu cho props bằng TypeScript interface.
    -   Tên interface cho props nên là `ComponentNameProps` (ví dụ: `StoryDisplayProps`).
-   **Tổ chức Component**: Giữ component nhỏ và tập trung vào một nhiệm vụ duy nhất. Nếu một component trở nên quá lớn, hãy xem xét việc tách nó thành các component con.

## 4. Quản Lý Trạng Thái (State Management)

-   Trạng thái chính của ứng dụng (game state, character profile, npcs, etc.) được quản lý tập trung trong custom hook `useGameLogic.ts`.
-   Component `App.tsx` sử dụng hook này và truyền state và các hàm xử lý xuống các component con thông qua props.
-   Đối với các trạng thái cục bộ, chỉ liên quan đến một component (ví dụ: trạng thái `isOpen` của một accordion), hãy sử dụng `useState` ngay trong component đó.

## 5. Styling (CSS)

-   Sử dụng **Tailwind CSS** cho hầu hết các nhu cầu styling. Các class được thêm trực tiếp vào JSX.
-   Các style global hoặc các tùy chỉnh phức tạp không thể thực hiện bằng Tailwind được đặt trong thẻ `<style>` của `index.html`.
-   **Responsive Design**: Sử dụng các breakpoint của Tailwind (ví dụ: `sm:`, `md:`, `lg:`) để đảm bảo giao diện hoạt động tốt trên mọi kích thước màn hình.

## 6. Tương Tác API (AI Services)

-   Toàn bộ logic gọi API được trừu tượng hóa trong thư mục `services`.
-   `geminiService.ts` và `openaiService.ts` cung cấp các hàm giống nhau (`getNextStoryStep`, `getInitialStory`, etc.) để `useGameLogic` có thể chuyển đổi giữa chúng một cách dễ dàng.
-   Mỗi hàm gọi API phải xử lý lỗi một cách triệt để và ghi log thông qua `logService`.

## 7. Kiểu Dữ Liệu (TypeScript)

-   **`types.ts` là nguồn chân lý duy nhất** cho tất cả các cấu trúc dữ liệu dùng chung.
-   Sử dụng `interface` cho các đối tượng và `enum` cho các tập hợp giá trị không đổi.
-   Tên kiểu dữ liệu phải rõ ràng và mô tả đúng bản chất của nó (ví dụ: `CharacterProfile`, `WorldSettings`).
-   Tránh sử dụng `any` trừ khi thực sự không thể tránh khỏi.

## 8. Logging & Debug

-   Sử dụng hàm `log()` từ `services/logService.ts` để ghi lại các sự kiện quan trọng.
-   Sử dụng hook `useComponentLog('ComponentName')` ở đầu mỗi component để tự động log các sự kiện mount/unmount.
-   Bảng debug có thể được mở bằng cách nhấn `Ctrl + \`.
