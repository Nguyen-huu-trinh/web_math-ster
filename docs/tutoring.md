# Đăng ký dò bài

Giáo viên mở hộp thoại lớn từ nút **Quản lý dò bài** cạnh **Thông báo học sinh** trên dashboard. Không có mục dò bài trên thanh điều hướng. Trang `/tutoring` vẫn truy cập trực tiếp được, dùng `public.profiles.role`.

Lịch giáo viên dùng cache React Query riêng theo tài khoản và tháng, giữ dữ liệu mới trong 5 phút và lưu cache không sử dụng tối đa 30 phút. Mở lại hộp thoại trong 5 phút sẽ dùng dữ liệu đã lưu; sau thời hạn này vẫn hiển thị dữ liệu cũ trong lúc cập nhật nền. Nút **Tải lại** chủ động cập nhật lịch. Các thao tác tạo, nhập Excel, khóa/mở, hủy đặt và xóa làm mất hiệu lực cache tất cả tháng của giáo viên rồi cập nhật tháng đang xem.

## Triển khai

Áp dụng migration `supabase/migrations/202610220001_tutoring_slots.sql` bằng quy trình migration Supabase của dự án trước khi mở trang. Migration chưa được chạy lên database từ xa. Không cần service-role key trên trình duyệt hoặc trong luồng đặt ca.

`month_key` dùng `extract` và `lpad` vì `to_char` không immutable. Hai unique constraint tự tạo hai B-tree index theo đúng các cặp cột yêu cầu, không tạo index trùng lặp.

## Quy tắc đang áp dụng

Áp dụng thêm migration `202610220002_tutoring_teacher_list.sql` để danh sách giáo viên hiển thị họ tên và mã học sinh. Giáo viên có thể hủy đặt chỗ của học sinh trước khi xóa ca.

## Nhập Excel

Học sinh mở lịch từ nút **Đăng ký dò bài** cạnh **Thông Báo Học Vụ Quan Trọng**. Thẻ này vẫn hiển thị khi chưa có thông báo để học sinh luôn truy cập được lịch. Hộp thoại có cùng lớp phủ làm mờ nền.

Lịch học sinh được cache trong bộ nhớ React Query theo ID tài khoản và tháng: dữ liệu mới trong 2 phút không tải lại khi mở lại; cache không sử dụng bị xóa sau 30 phút. Đổi tháng sử dụng cache riêng. Hết 2 phút, mở lại sẽ tải mới ở nền. Có nút cập nhật thủ công. Mọi lần đặt/hủy làm mất hiệu lực cache của tài khoản và tải lại tháng hiện tại, kể cả khi ca đã bị người khác đặt. Cache không tồn tại qua tải lại toàn bộ trang; database luôn kiểm tra lại tính hợp lệ của thao tác đặt/hủy.

Chọn **Nhập Excel** và tải mẫu CSV mở được bằng Excel hoặc chọn tệp `.xlsx`, `.xls`, `.csv` tối đa 5 MB. Đọc trang tính đầu tiên, tối đa 500 ca; xem trước rồi bấm **Tạo … ca**.

- `slot_date`: YYYY-MM-DD, DD/MM/YYYY hoặc ô ngày Excel (hệ 1900/1904).
- `start_time`: HH:mm hoặc ô giờ Excel.
- `end_time`, `note`: tùy chọn.

Kiểm tra dữ liệu cả trình duyệt và server. Nếu trùng lịch hiện có, toàn bộ lần nhập dừng và không ghi đè ca đã đặt. Tệp nhiều tháng được nhập đầy đủ; dùng bộ lọc để xem từng tháng.

- Giáo viên tạo ca, khóa/mở ca và xóa ca chưa có học sinh. Ca đã có người đặt được giữ lại khi khóa.
- Học sinh đặt một ca mỗi tháng, được hủy trước giờ bắt đầu và đặt lại sau khi hủy. Không đặt ca bị khóa hoặc đã bắt đầu.
- Giờ dò bài và kiểm tra thời hạn dùng múi giờ `Asia/Ho_Chi_Minh`.
- Giáo viên thấy tên học sinh; học sinh chỉ thấy thông tin định danh của chính mình. Ghi chú ca là thông tin được chia sẻ cho học sinh.
- Tài khoản bị khóa hoặc đã xóa mềm không được truy cập. ADMIN không có quyền trong tính năng này.
- `ON DELETE SET NULL` giải phóng ca khi hồ sơ bị xóa cứng; `booked_at` có thể giữ dấu thời gian cũ, trạng thái trống luôn được xác định bằng `student_id IS NULL`.

Yêu cầu ban đầu kết thúc tại mục B. Các quy tắc về hủy trước giờ bắt đầu và quản lý ca phía trên là lựa chọn triển khai cho luồng cơ bản.

## Kiểm tra

## Chọn nhiều ca

Trong bảng giáo viên, nhấn giữ chuột trái trên nội dung dòng và kéo qua các dòng khác để chọn một dải ca. Kéo từ dòng đang chọn để bỏ chọn dải. Có checkbox từng dòng và checkbox chọn tối đa 500 ca. Không bắt thao tác kéo trên nút hoặc checkbox; thiết bị cảm ứng dùng checkbox.

Thanh thao tác hỗ trợ **Khóa đã chọn**, **Hủy đặt đã chọn**, **Xóa ca trống đã chọn** và **Bỏ chọn**. Xóa bỏ qua ca đang có học sinh; hủy đặt đối chiếu mã học sinh khi chọn để không hủy nhầm đăng ký đã thay đổi. Mỗi thao tác chạy trong một RPC, báo số dòng đã xử lý và cập nhật cache. Áp dụng migration `202610220003_tutoring_bulk.sql` trước khi sử dụng; RPC có kiểm tra quyền giáo viên, RLS và GRANT tường minh.

```sh
node --test tests/tutoring.test.mjs tests/tutoring-import.test.mjs
pnpm exec tsc --noEmit --project tsconfig.tutoring.json
```

Test chạy migration thật trong PostgreSQL nhúng (PGlite), kiểm tra quyền, RLS, ẩn danh tính, giới hạn tháng, tranh chấp trạng thái ca, hủy, khóa ca và ca quá giờ. PGlite không thay thế bài kiểm tra nhiều kết nối đồng thời trên Supabase thật.
