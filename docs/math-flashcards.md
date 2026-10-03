# Math Flashcards

Module riêng dùng Next.js App Router, Server Actions, Supabase/PostgreSQL và KaTeX; không nhúng vào trang làm bài thi.

## Khởi chạy

1. Cài dependencies: `pnpm install --frozen-lockfile`.
2. Áp dụng **một lần** file `supabase/migrations/202610030001_math_flashcards.sql` vào Supabase qua quy trình migration hoặc SQL Editor. File chạy trong transaction, tạo bảng, enum, RLS, trigger và RPC. Không chạy lại trên database đã có các đối tượng này.
3. Dùng cấu hình Supabase hiện có: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Module không dùng service-role key.
4. Chạy `pnpm dev`, đăng nhập tài khoản giáo viên/học sinh có `profiles.is_active = true`.

Migration chưa được tự động áp dụng lên Supabase triển khai. Các kiểm thử chỉ dùng PostgreSQL nhúng, không truy cập database thật.

## Routes

| URL | Quyền | Chức năng |
| --- | --- | --- |
| `/teacher/flashcards` | TEACHER, ADMIN | Tạo, đếm thẻ, xuất bản/nháp, sửa và xóa bộ |
| `/teacher/flashcards/[deckId]` | TEACHER, ADMIN | Sửa thông tin, CRUD thẻ, xem trước LaTeX, sắp xếp lên/xuống |
| `/flashcards` | STUDENT | Danh mục đã xuất bản và tỷ lệ đã nhớ |
| `/flashcards/[deckId]` | STUDENT | Không gian học toàn trang, ẩn thanh điều hướng chung |

Thư viện chung cho các giáo viên/admin, không chia quyền sở hữu từng bộ. Mỗi route có loading, error, not-found và kiểm tra quyền phía server.

## Mã nguồn

- `app/actions/flashcards.ts`: các Server Actions trong đặc tả; mutation trả `{ ok: true, data }` hoặc `{ ok: false, error }` để client hiển thị toast.
- `services/flashcard.service.ts`: xác thực người dùng, role/active, đọc dữ liệu, xử lý lỗi database.
- `types/flashcards.ts`: kiểu dữ liệu chung.
- `lib/flashcards/validation.ts`: Zod kiểm tra UUID, nội dung, trạng thái, thứ tự và từ chối trường ngoài schema.
- `lib/flashcards/study.ts`: lọc, Fisher–Yates shuffle, thống kê và tìm thẻ chưa đánh giá.
- `components/flashcards/deck-catalog.tsx`: danh mục giáo viên/học sinh.
- `components/flashcards/deck-editor.tsx`: biên tập với live preview.
- `components/flashcards/study-room.tsx`: thẻ lật 3D, phím tắt, lưu tiến độ và tổng kết.
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
- Enum trạng thái `LEARNED`/`REVIEW_NEEDED`; UNIQUE(user_id, card_id). Gắn sao trước khi học tạo bản ghi với `reviewed_at = NULL`.
- RLS chặn học sinh đọc bản nháp, sửa nội dung hoặc đọc/ghi tiến độ người khác, kể cả gọi Supabase trực tiếp. Chặn anonymous và tài khoản không hoạt động.
- RPC đọc tổng hợp JSON để không bị cắt ngầm ở giới hạn hàng của PostgREST.
- RPC tạo thẻ khóa bộ trước khi cấp thứ tự. Reorder kiểm tra đủ và đúng tập ID, dùng constraint deferred và transaction để hoán đổi nguyên tử.
- RPC progress lấy `auth.uid()` từ phiên đăng nhập, cập nhật từng phần nguyên tử. Gắn sao không ghi đè trạng thái đã nhớ hoặc thời điểm ôn.
- Chuyển bộ về nháp giữ lại tiến độ; xuất bản lại cho phép đọc lại. Xóa bộ/thẻ xóa tiến độ liên quan qua cascade.

## Quy tắc buổi học

- Lật lần đầu lưu trạng thái cần ôn nếu chưa xem; không tự đánh dấu đã nhớ.
- Space lật, mũi tên chuyển thẻ, 1/2 đánh dấu chưa nhớ/đã nhớ. Bỏ qua phím tắt khi nhập liệu hoặc giữ Ctrl/Alt/Meta.
- Chỉ đánh giá lưu thành công mới tính vào tiến trình. Lỗi mạng giữ vị trí để thử lại, không báo hoàn thành giả.
- Di chuyển qua thẻ không tính hoàn thành; đánh giá xong chuyển đến thẻ chưa đánh giá tiếp theo, kể cả thẻ đã bỏ qua.
- Tổng kết khi tất cả thẻ của lượt đã đánh giá. Ôn lại chỉ lấy thẻ chưa nhớ trong lượt đó; học lại từ đầu lấy toàn bộ bộ thẻ.
- Đổi bộ lọc bắt đầu lượt mới; xáo trộn giữ đánh giá trong lượt. Bỏ sao trong bộ lọc gắn sao loại thẻ khỏi lượt.
- Trạng thái đã nhớ/gắn sao lưu bền vững. Vị trí, thứ tự xáo trộn và thống kê lượt chỉ lưu trong trang; tải lại bắt đầu lượt mới.

## Kiểm thử

```sh
pnpm test:flashcards
pnpm typecheck:flashcards
```

Tests chạy migration thật trên PostgreSQL nhúng (PGlite) với schema auth/profiles tối thiểu mô phỏng dự án. Kiểm tra RLS, bản nháp, CRUD/cascade, reorder nguyên tử, tiến độ từng phần, cách ly tài khoản, bộ trên 1.000 thẻ, validation và logic học. Không thay thế kiểm thử tích hợp với các policy profiles hiện có trên Supabase triển khai.

Kiểm tra giao diện sau migration:

1. Tạo bộ nháp, nhập `Tính $\vec{a} \cdot \vec{b}$` và `$$a_1b_1+a_2b_2+a_3b_3$$`; xem preview, lưu, sửa, đổi thứ tự.
2. Xác nhận học sinh không thấy bản nháp; xuất bản rồi mở danh mục/trang học.
3. Thử chuột/Space, mũi tên, 1/2, gắn sao, lọc, bỏ sao thẻ cuối, xáo trộn, tổng kết và ôn lại.
4. Tải lại để kiểm tra tiến độ; đăng nhập học sinh khác để kiểm tra cách ly.
5. Thử nội dung dài, công thức rộng trên mobile, focus bàn phím, reduced motion và lỗi mạng khi lưu.

Tài liệu: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [KaTeX auto-render](https://katex.org/docs/autorender.html).
