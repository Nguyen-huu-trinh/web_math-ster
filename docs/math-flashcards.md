# Math Flashcards

Module riêng dùng Next.js App Router, Server Actions, Supabase/PostgreSQL và KaTeX; không nhúng vào trang làm bài thi.

## Khởi chạy

1. Cài dependencies: `pnpm install --frozen-lockfile`.
2. Áp dụng **một lần** file `supabase/migrations/202610030001_math_flashcards.sql` vào Supabase qua quy trình migration hoặc SQL Editor. File chạy trong transaction, tạo bảng, enum, RLS, trigger và RPC. Không chạy lại trên database đã có các đối tượng này.
3. Áp dụng tiếp `supabase/migrations/202610030002_flashcard_stars.sql` để thêm RPC lưu sao theo nhóm. Database đã có migration đầu chỉ cần chạy migration mới. Dùng cấu hình Supabase hiện có: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Module không dùng service-role key.
4. Áp dụng tiếp `supabase/migrations/202610030003_flashcard_catalog_stars.sql` để danh mục trả số sao của học sinh, thay cho số đã nhớ cũ.
5. Áp dụng tiếp `supabase/migrations/202610040001_flashcard_deck_order.sql` trước khi triển khai giao diện mới để thêm thứ tự hiển thị bộ thẻ.
6. Chạy `pnpm dev`, đăng nhập tài khoản giáo viên/học sinh có `profiles.is_active = true`.

Ngày 04/10/2026 đã xác minh Supabase liên kết có cột, constraint, index và RPC của migration `202610040001_flashcard_deck_order.sql`. Với môi trường khác, áp dụng các migration theo thứ tự trên. Các kiểm thử tự động chỉ dùng PostgreSQL nhúng, không truy cập database thật.

## Routes

| URL | Quyền | Chức năng |
| --- | --- | --- |
| `/teacher/flashcards` | TEACHER, ADMIN | Tạo, đếm thẻ, xuất bản/nháp, sửa và xóa bộ |
| `/teacher/flashcards/[deckId]` | TEACHER, ADMIN | Sửa thông tin, CRUD thẻ, xem trước LaTeX, sắp xếp lên/xuống |
| `/flashcards` | STUDENT | Danh mục đã xuất bản, tiến độ đã nhớ = (tổng thẻ − thẻ gắn sao) / tổng thẻ |
| `/flashcards/[deckId]` | STUDENT | Giữ thanh điều hướng chung; thanh công cụ gọn gồm quay lại, tên bộ, bộ lọc và xáo trộn |

Thư viện chung cho các giáo viên/admin, không chia quyền sở hữu từng bộ. Mỗi route có loading, error, not-found và kiểm tra quyền phía server.

## Mã nguồn

- `app/actions/flashcards.ts`: các Server Actions trong đặc tả; mutation trả `{ ok: true, data }` hoặc `{ ok: false, error }` để client hiển thị toast.
- `services/flashcard.service.ts`: xác thực người dùng, role/active, đọc dữ liệu, xử lý lỗi database.
- `types/flashcards.ts`: kiểu dữ liệu chung.
- `lib/flashcards/validation.ts`: Zod kiểm tra UUID, nội dung, nhóm thay đổi sao, thứ tự và từ chối trường ngoài schema.
- `lib/flashcards/study.ts`: lọc, Fisher–Yates shuffle, thống kê và tìm thẻ chưa học trong lượt.
- `lib/flashcards/use-star-sync.ts`: cập nhật sao tức thì, gom thay đổi và lưu nền tuần tự, giữ thay đổi chưa lưu để thử lại.
- `components/flashcards/deck-catalog.tsx`: danh mục giáo viên/học sinh.
- `components/flashcards/deck-editor.tsx`: biên tập với live preview.
- `components/flashcards/study-room.tsx`: thẻ lật 3D khi chạm, phím tắt, sao cần xem lại và tổng kết lượt học.
- `components/flashcards/math-text.tsx`: dùng chung cho câu hỏi, đáp án, ghi chú và live preview; import CSS KaTeX, render cả phía server và khi nội dung thay đổi.
- `lib/flashcards/math.ts`: nhận `$...$`, `$$...$$`, `\(...\)`, `\[...\]` và tự nhận diện các cụm có lệnh LaTeX chưa bọc dấu. Văn bản thường được escape HTML; chỉ KaTeX sinh HTML với `trust: false` và giới hạn mở rộng macro.

## Nhập công thức

- Ví dụ đáp án: `$$M\left(\frac{x_A+x_B}{2},\frac{y_A+y_B}{2}\right)$$`.
- Có thể nhập trực tiếp `\frac{x_A+x_B}{2}`; nên dùng dấu bao khi xen công thức phức tạp với lời giải để xác định chính xác ranh giới toán/văn bản.
- Nhập một dấu `\` trước lệnh trong textarea. JSON tự escape dấu này khi truyền dữ liệu; Server Actions và database giữ nguyên nội dung, không stringify/parse lại từng trường.
- Lớp hiển thị sửa dấu backslash bị lặp trước lệnh/dấu bao do sao chép. Không thay thế toàn bộ `\\` vì đây cũng là ký hiệu xuống dòng hợp lệ. Nội dung trong `\begin{...}...\end{...}` được giữ nguyên để bảo toàn ma trận/aligned; dữ liệu nguồn không bị ghi đè.
- Công thức chưa hoàn chỉnh hoặc sai cú pháp không làm hỏng form; KaTeX hiển thị lỗi để giáo viên sửa trong preview.

## Database và phân quyền

- Ba bảng: `flashcard_decks`, `flashcards`, `flashcard_student_progress`. FK học sinh trỏ tới `profiles`, theo cấu trúc hiện có của dự án.
- `flashcard_decks.order_index`: số nguyên từ 0 đến 2147483647, mặc định 0 cho cả bộ cũ và bộ mới. Danh mục giáo viên/học sinh xếp tăng dần theo cột này, rồi `created_at DESC, id ASC` khi trùng thứ tự. Giáo viên/admin nhập trong form tạo hoặc biên tập; danh mục quản lý hiển thị giá trị hiện tại. Sửa tên/mô tả mà không gửi thứ tự sẽ giữ giá trị đã lưu. Migration giữ nguyên dữ liệu và cách xếp cũ cho đến khi giáo viên đổi thứ tự.
- UNIQUE(user_id, card_id). Các cột trạng thái và RPC tiến độ cũ được giữ để tương thích, không được luồng học mới sử dụng. Không xóa lịch sử hoặc sao có sẵn. Bản ghi sao mới có `reviewed_at = NULL`; trạng thái mặc định cũ không mang ý nghĩa trong giao diện mới.
- RLS chặn học sinh đọc bản nháp, sửa nội dung hoặc đọc/ghi tiến độ người khác, kể cả gọi Supabase trực tiếp. Chặn anonymous và tài khoản không hoạt động.
- RPC đọc tổng hợp JSON để không bị cắt ngầm ở giới hạn hàng của PostgREST.
- RPC tạo thẻ khóa bộ trước khi cấp thứ tự. Reorder kiểm tra đủ và đúng tập ID, dùng constraint deferred và transaction để hoán đổi nguyên tử.
- RPC `update_flashcard_stars` lấy `auth.uid()` từ phiên đăng nhập, kiểm tra toàn bộ nhóm thuộc bộ thẻ được phép đọc, cập nhật tối đa 200 thẻ trong một transaction. Chỉ thay đổi sao, không ghi thời điểm ôn hoặc trạng thái học. Giá trị sao không đổi không gây UPDATE.
- Chuyển bộ về nháp giữ lại tiến độ; xuất bản lại cho phép đọc lại. Xóa bộ/thẻ xóa tiến độ liên quan qua cascade.

## Quy tắc buổi học

- Chạm thẻ hoặc Space để xem đáp án; không có nút lật riêng và không gọi database.
- Tiếp tục/mũi tên phải tính thẻ là đã học trong lượt rồi chuyển đến thẻ chưa học. Thẻ cuối hoàn thành lượt, kể cả bộ chỉ có một thẻ. Quay lại không tăng số đã học.
- Gắn sao/S đánh dấu cần xem lại; không còn nút hoặc phím 1/2 nhớ/chưa nhớ. Bỏ qua phím tắt khi nhập liệu hoặc giữ Ctrl/Alt/Meta.
- Đã học là số thẻ đã đi qua, không phải đánh giá mức ghi nhớ. Thẻ đã học vẫn có thể được gắn sao để xem lại.
- Đổi bộ lọc bắt đầu lượt mới; xáo trộn giữ số đã học. Bỏ sao giữ nguyên hàng đợi hiện tại, lượt ôn sau dùng danh sách sao mới nhất.
- Chỉ sao lưu bền vững. Tiến trình, vị trí và thứ tự của lượt học nằm trong bộ nhớ trang; tải lại bắt đầu lượt mới.
- Thanh tiến độ danh mục tính thẻ không gắn sao là đã nhớ; không dùng trạng thái học cũ. Bộ chưa có sao hiển thị 100% kể cả chưa học, bộ rỗng hiển thị 0%. Lưu sao thành công làm mới cache danh mục để khi quay lại hiển thị số mới.
- Gom thay đổi sao sau 1 giây ngừng thao tác; tối đa 10 giây sẽ thử lưu khi còn thay đổi. Các request chạy tuần tự, giữ thay đổi mới phát sinh trong lúc lưu. Không khóa nút học và không toast thành công sau mỗi thao tác.
- Khi hoàn thành, đổi bộ lọc, ẩn trang hoặc rời trang sẽ thử lưu. Nút Bộ thẻ đợi lưu xong trước khi chuyển. Lỗi có nút thử lại, tự thử khi có mạng trở lại; đóng/tải lại trang khi còn thay đổi sẽ có cảnh báo của trình duyệt. Đóng cưỡng bức vẫn có thể mất các sao chưa lưu.

## Kiểm thử

```sh
pnpm test:flashcards
pnpm typecheck:flashcards
```

Tests chạy các migration Flashcard thật trên PostgreSQL nhúng (PGlite) với schema auth/profiles tối thiểu mô phỏng dự án. Kiểm tra RLS, bản nháp, CRUD/cascade, reorder nguyên tử, tương thích dữ liệu cũ, thứ tự danh mục và phân quyền sửa thứ tự, nhóm cập nhật sao nguyên tử, cách ly tài khoản, bộ trên 1.000 thẻ, validation và logic học. Không thay thế kiểm thử tích hợp với các policy profiles hiện có trên Supabase triển khai.

Kiểm tra giao diện sau migration:

1. Tạo bộ nháp, nhập `Tính $\vec{a} \cdot \vec{b}$` và `$$a_1b_1+a_2b_2+a_3b_3$$`; xem preview, lưu, sửa, đổi thứ tự.
2. Xác nhận học sinh không thấy bản nháp; xuất bản rồi mở danh mục/trang học.
3. Thử chuột/Space, mũi tên, S, gắn sao liên tiếp, lọc, bỏ sao thẻ cuối, bộ một thẻ, xáo trộn, tổng kết và ôn lại.
4. Tải lại để kiểm tra sao được giữ và lượt học bắt đầu mới; đăng nhập học sinh khác để kiểm tra cách ly.
5. Thử nội dung dài, công thức rộng trên mobile, focus bàn phím, reduced motion và lỗi mạng khi lưu.

Tài liệu: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [KaTeX auto-render](https://katex.org/docs/autorender.html).
