# Gỡ HP và điểm danh bằng mã

Migration: `supabase/migrations/202611020001_remove_profile_points_and_code_attendance.sql`.

Code đã bỏ `profiles.points`, bảng xếp hạng/card Độ trâu, chỉnh HP trong hồ sơ/danh sách học sinh, thưởng/phạt khi thi và các API/hook/service tạo/nhập mã điểm danh. Chấm bài và chấm lại chỉ cập nhật kết quả thi. Loại bài tập `ATTENDANCE` (BTDD), ngưỡng đạt bài thi và điểm thi được giữ nguyên.

Áp dụng migration cùng đợt triển khai ứng dụng mới. Migration thay `apply_exam_regrades`, xóa các overload RPC `adjust_student_points`, `create_attendance_session`, `submit_attendance`, trigger HP trên profiles, view `v_dotrau_students`, bảng `attendance` và cột `profiles.points`. Migration không mở khóa những tài khoản đã bị khóa trước đó.

Các đối tượng HP/điểm danh mã cũ không có định nghĩa trong migration lịch sử của repo. Script tra catalog để tìm overload và trigger. Toàn bộ thay đổi nằm trong transaction, dùng RESTRICT: nếu database thực tế có view/phụ thuộc hoặc routine dùng chung chưa được khai báo trong repo, migration dừng và rollback để có thể sửa rõ từng đối tượng. Không dùng DROP CASCADE để xóa lan các chức năng khác.

Migration đã được kiểm tra bằng PostgreSQL PGlite với dữ liệu/trigger/RPC cũ và chạy lại khi các đối tượng đã vắng mặt; chưa áp dụng trên database từ xa. Lệnh đọc schema từ Supabase CLI trong môi trường này bị lỗi quyền ghi telemetry ngoài workspace.
