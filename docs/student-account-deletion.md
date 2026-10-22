# Xóa hẳn học sinh từ danh sách giáo viên

Luồng: `useDeleteTeacherStudent` → `DELETE /api/teachers/students/[studentId]` → service/repository → `deleteStudentAccount`.

Trước đây repository chỉ DELETE `public.profiles`, để lại tài khoản `auth.users`. Hiện tại helper kiểm tra giáo viên, UUID và vai trò STUDENT của hồ sơ đích rồi gọi `adminClient.auth.admin.deleteUser(id, false)` ở server. Không DELETE hồ sơ riêng. Khóa ngoại `profiles.id → auth.users.id ON DELETE CASCADE` trong migration gốc chịu trách nhiệm xóa hồ sơ và các dữ liệu liên quan theo cấu hình FK.

Nếu Auth API không xóa được (ví dụ Storage hoặc khóa ngoại chặn), trả lỗi và không xóa hồ sơ trước. Không cho phép dùng luồng này xóa giáo viên/admin; hồ sơ không tồn tại trả 404. Không cần migration mới, nhưng môi trường phải có `SUPABASE_SERVICE_ROLE_KEY` ở server và FK cascade đúng migration hiện có.

Sau thành công, xóa cache chi tiết học sinh, làm mới danh sách, dashboard giáo viên và ca dò bài. Thông báo thành công chỉ xuất hiện khi Auth API đã thành công.

Các tài khoản mồ côi do luồng cũ đã xóa hồ sơ không được tự động dọn dẹp: cần xác định tài khoản cụ thể trước khi xóa, vì không còn hồ sơ để kiểm chứng vai trò. API `/api/students/[id]` hiện có cơ chế xóa mềm riêng; thay đổi này chỉ sửa thao tác **Xóa hẳn** của danh sách giáo viên.

Kiểm thử:

```sh
node --test tests/delete-student-account.test.cjs tests/teacher-student-profile.test.cjs
```

Kiểm thử Auth dùng mock, cascade/rollback dùng PostgreSQL nhúng với định nghĩa bảng profiles từ migration thật. Chưa chạy xóa tài khoản thực tế trên Supabase từ xa.
