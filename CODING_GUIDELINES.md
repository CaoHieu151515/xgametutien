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
    -   `gameConfig.ts`: **Quan trọng**. Tệp cấu hình trung tâm cho các tham số và "biến số ma thuật" của game.
-   **/hooks**: Chứa các custom React hooks để tái sử dụng logic.
    -   `useGameLogic.ts`: Hook trung tâm, quản lý gần như toàn bộ trạng thái và logic của game.
    -   `useModalManager.ts`: Hook quản lý trạng thái đóng/mở của các modal.
-   **/services**: Chứa các module tương tác với các API bên ngoài hoặc xử lý logic nghiệp vụ phức tạp.
    -   `geminiService.ts`: Logic tương tác với Google Gemini API.
    -   `openaiService.ts`: Logic tương tác với OpenAI API.
    -   `progressionService.ts`: Logic tính toán lên cấp, kinh nghiệm, chỉ số.
    -   `saveService.ts`: Logic lưu/tải game sử dụng IndexedDB.
    -   `logService.ts`: Hệ thống logging cho việc debug.
    -   `avatarService.ts`: Logic tải và tìm kiếm ảnh đại diện.
-   **/aiPipeline**: Chứa các module liên quan đến toàn bộ quy trình xử lý yêu cầu và phản hồi của AI.
    -   `prompts.ts`: Xây dựng các prompt hoàn chỉnh để gửi đến AI.
    -   `schema.ts`: Định nghĩa schema JSON cho phản hồi của AI (chủ yếu cho Gemini).
    -   `validate.ts`: Kiểm tra và xác thực dữ liệu JSON nhận được từ AI.
    -   `applyDiff.ts`: Áp dụng các thay đổi từ phản hồi của AI vào trạng thái game hiện tại.
    -   **/aiPipeline/mutators**: Chứa các hàm con, mỗi hàm chịu trách nhiệm áp dụng thay đổi cho một phần của trạng thái game (người chơi, NPC, thế giới...).

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

-   Trạng thái chính của ứng dụng (game state, characterProfile, npcs, etc.) được quản lý tập trung trong custom hook `useGameLogic.ts`.
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

---

## 9. Hệ Thống Tiến Trình (Progression System)

-   **Tệp chính:** `services/progressionService.ts`.
-   **Chức năng:** Chứa tất cả các logic tính toán liên quan đến sự phát triển của nhân vật và NPC.
-   **Các hàm cốt lõi:**
    -   `getExperienceForNextLevel`: Tính toán EXP cần thiết để nhân vật/NPC lên cấp độ tiếp theo.
    -   `getSkillExperienceForNextLevel`: Tương tự, nhưng dành cho kỹ năng, có tính đến phẩm chất.
    -   `calculateBaseStatsForLevel`: Tính toán các chỉ số cơ bản (HP, MP, Tấn công) dựa trên cấp độ.
    -   `recalculateDerivedStats`: Tính toán lại các chỉ số cuối cùng sau khi cộng thêm từ trang bị và hiệu ứng.
    -   `processLevelUps`: Xử lý toàn bộ quá trình lên cấp cho một nhân vật khi nhận được một lượng EXP.
    -   `getRealmDisplayName` / `getLevelFromRealmName`: Chuyển đổi giữa tên cảnh giới và cấp độ tương ứng.
-   **Nguồn chân lý:** Tất cả các công thức và "biến số ma thuật" (ví dụ: hệ số nhân EXP, HP mỗi cấp) đều được lấy từ `config/gameConfig.ts`. Mọi thay đổi về cân bằng game nên được thực hiện ở đó.

## 10. Hệ Thống Lưu/Tải Game (Save/Load System)

-   **Tệp chính:** `services/saveService.ts`.
-   **Công nghệ:** Sử dụng **IndexedDB** của trình duyệt để lưu trữ cục bộ, cho phép lưu trữ dung lượng lớn và hoạt động offline.
-   **Cấu trúc dữ liệu:** Toàn bộ trạng thái của một màn chơi được đóng gói trong interface `FullGameState`. Dữ liệu tóm tắt để hiển thị danh sách các bản lưu là `SaveMetadata`.
-   **Luồng hoạt động:**
    -   `useSaveLogic.ts` gọi các hàm từ `saveService.ts` để thực hiện các hành động như `saveGame`, `getGame`, `deleteSave`.
    -   Game được tự động lưu vào đầu mỗi lượt chơi.

## 11. Luồng Xử Lý AI (AI Pipeline)

Đây là "bộ não" của trò chơi, nằm trong thư mục `/aiPipeline`. Quy trình xử lý một hành động của người chơi diễn ra như sau:

1.  **Xây dựng Prompt (`promptUtils.ts`, `prompts.ts`):**
    -   `buildContextForPrompt` thu thập và tối ưu hóa toàn bộ trạng thái game hiện tại (nhân vật, NPC, thế giới, lịch sử...) thành một ngữ cảnh cô đọng.
    -   `buildUnifiedPrompt` (hoặc các hàm prompt khác) sử dụng ngữ cảnh này và "chỉ thị hệ thống" (`system instruction`) để tạo ra một prompt hoàn chỉnh, sẵn sàng gửi đến AI.

2.  **Gọi API (`callGemini.ts`, `callOpenAI.ts`):**
    -   Prompt hoàn chỉnh được gửi đến API đã chọn.
    -   Đối với Gemini, `schema.ts` được sử dụng để yêu cầu AI trả về một JSON có cấu trúc nghiêm ngặt.
    -   Đối với OpenAI, mô tả schema được nhúng vào system prompt.

3.  **Xác thực Phản hồi (`validate.ts`):**
    -   Dữ liệu văn bản từ AI được parse thành đối tượng JSON.
    -   `verifyStoryResponse` thực hiện các kiểm tra logic sâu hơn để đảm bảo AI không tạo ra các mâu thuẫn (ví dụ: cập nhật một NPC không tồn tại).

4.  **Áp dụng Thay đổi (`applyDiff.ts` và `/mutators`):**
    -   Đây là bước quan trọng nhất. `applyStoryResponseToState` nhận phản hồi đã được xác thực từ AI và áp dụng nó vào trạng thái game hiện tại.
    -   **Nguyên tắc "Diff":** Phản hồi của AI được coi là một "bản vá" hoặc "diff". Nó chỉ chứa những gì đã thay đổi.
    -   **Mutators:** Logic áp dụng được chia thành các module nhỏ trong thư mục `/mutators`, mỗi module chịu trách nhiệm cho một phần của trạng thái:
        -   `notificationMutator.ts`: Tạo ra các thông báo cho người dùng ("Bạn nhận được 100 EXP", "Vật phẩm đã được sử dụng").
        -   `playerMutators.ts`: Áp dụng thay đổi cho `characterProfile`.
        -   `npcMutators.ts`: Áp dụng thay đổi cho mảng `npcs`.
        -   `worldMutators.ts`: Áp dụng thay đổi cho `worldSettings` và các thuộc tính liên quan đến thế giới trong `characterProfile`.
        -   `eventMutator.ts`: Cập nhật trạng thái các nhiệm vụ.

## 12. Hệ Thống Nhiệm Vụ (Event System)

-   **Kiểu dữ liệu chính:** `GameEvent` trong `types.ts`.
-   **Vòng đời:** Một nhiệm vụ được quản lý thông qua 3 hành động chính từ AI:
    1.  **`newEvent`**: Khi người chơi chấp nhận một nhiệm vụ mới. AI sẽ cung cấp tiêu đề, mô tả và dòng nhật ký đầu tiên.
    2.  **`updateEventLog`**: Khi người chơi thực hiện một hành động thúc đẩy tiến trình của nhiệm vụ. AI sẽ cung cấp một dòng nhật ký mới.
    3.  **`completeEvent`**: Khi người chơi hoàn thành nhiệm vụ. AI sẽ cung cấp dòng nhật ký cuối cùng và đánh dấu nhiệm vụ là `completed`.
-   **Trạng thái:** Mỗi `GameEvent` có một `status` là `'active'` hoặc `'completed'`.
-   **Giao diện:** `EventModal.tsx` hiển thị các sự kiện đang hoạt động và đã hoàn thành cho người chơi.

## 13. Tệp Cấu Hình Trung Tâm (`config/gameConfig.ts`)

-   **Vai trò:** Đây là tệp duy nhất chứa các "biến số ma thuật" và các tham số cân bằng game.
-   **Mục đích:** Giúp việc điều chỉnh và cân bằng game trở nên dễ dàng mà không cần phải tìm kiếm và thay đổi các giá trị được hardcode trong code.
-   **Các khu vực chính:**
    -   `ai`: Cấu hình cho AI (số lựa chọn, token tối đa...).
    -   `progression`: Tất cả các hằng số cho công thức tính EXP, chỉ số, v.v.
    -   `economy`: Giá trị cơ bản của vật phẩm.
    -   `npc`: Ngưỡng mối quan hệ.
    -   `worldGen`: Cấu hình cho chức năng tự động tạo thế giới.
-   **Quy tắc:** Khi cần một giá trị hằng số cho logic game, hãy kiểm tra xem nó có nên được thêm vào `GAME_CONFIG` hay không.

## 14. Quản Lý Modal

-   **Hook chính:** `hooks/useModalManager.ts`.
-   **Cách hoạt động:** Cung cấp một trạng thái tập trung để quản lý việc đóng/mở tất cả các modal trong ứng dụng. Điều này giúp tránh việc mỗi modal phải tự quản lý trạng thái `isOpen` của riêng mình và đơn giản hóa logic trong `App.tsx`.

## 15. Hệ Thống Ảnh Đại Diện (Avatar System)

-   **Tệp chính:** `services/avatarService.ts`.
-   **Chức năng:** Cung cấp logic để tải thư viện ảnh và tự động tìm ảnh đại diện phù hợp nhất cho NPC.
-   **Luồng hoạt động:**
    1.  `loadAvatarLibrary`: Cố gắng tải thư viện ảnh từ `localStorage` (`custom_avatar_data`). Nếu không có, nó sẽ tải từ tệp mặc định `generated_avatar_data.json`.
    2.  `findBestAvatar`: Nhận một NPC và danh sách các NPC khác làm đầu vào. Nó chấm điểm các ảnh đại diện có sẵn dựa trên sự trùng khớp về từ khóa (giới tính, chủng tộc, tính cách, ngoại hình) và chọn ảnh có điểm cao nhất chưa được sử dụng.
-   **Tương tác người dùng:** Màn hình chính (`HomeScreen.tsx`) cho phép người dùng nhập thư viện ảnh tùy chỉnh từ file JSON hoặc tải từ một nguồn web định sẵn.