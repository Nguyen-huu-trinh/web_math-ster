# Khôi phục nộp bài khi token xoay vòng

Luồng thực tế: `useExamSubmit` → API POST `/api/students/attempts/[id]/submit`
→ `requireStudent` → orchestrator → lưu attempt → cập nhật điểm.
API dùng cookie SSR, không dùng access token được giữ trong React state.
Log Supabase không đủ để xác nhận race condition: lỗi fetch, auth SDK bị kẹt,
middleware hoặc API trả 401 trước truy vấn đều có thể không tạo log PATCH.

## Các thay đổi

- Browser client dùng singleton của `@supabase/ssr`; đọc session ở thời điểm nộp.
- Lưu snapshot payload vào `exam-submit:v1:<attemptId>` trước mọi await.
  Đáp án được lưu khi chỉnh sửa và khôi phục sau mount nếu đúng cấu trúc đề.
  Chế độ review dùng đáp án server, không đọc bản nháp.
- Session còn dưới 60 giây được refresh trước khi gửi. Auth await giới hạn 15 giây;
  API fetch giới hạn 30 giây. Timeout auth không hủy được lock nội bộ SDK.
  Promise refresh được dùng chung đến khi thực sự kết thúc để tránh refresh chồng.
- Tổng cộng tối đa 3 lần thử ở client, refresh trước lần gửi lại. Retry lỗi mạng,
  timeout, 401, 408, 429 và 5xx; không retry 400/403 thông thường.
  Giữ nguyên snapshot giữa các lần thử và chỉ xóa backup khi API xác nhận success
  với đúng attemptId. Storage đầy/bị chặn được ghi log và không chặn nộp online.
- Server giữ xác thực `getUser()`; `getSession()` trước ghi chỉ dùng đồng bộ token,
  không dùng làm quyết định phân quyền. Conditional PATCH có retry tối đa 3 lần;
  refresh khi bị từ chối JWT. Mỗi lần PATCH có deadline 15 giây.
- Hai middleware được hợp nhất; cookie mới được đưa vào request và response.
  Giữ các cache headers do SSR cung cấp và thêm matcher `/student-exams`.
  Route submit luôn trả private/no-store; Next.js Route Handler chuyển các cookie
  được đặt qua `cookies().set()` của helper server vào response.
- Giữ nguyên logic cộng/trừ điểm và RPC `adjust_student_points` hiện có.
  RPC điểm không được tự retry vì chưa có khóa chống cộng/trừ trùng.
  Không trả success dựa trên việc so khớp chuỗi lỗi “already submitted”.

## Triển khai

Không cần chạy SQL migration, tạo bảng hoặc đổi quyền database cho bản sửa này.
Phần receipt/RPC điểm mới đã được bỏ theo yêu cầu; giữ nguyên cơ chế điểm hiện có.
Retry submit không chấm lại attempt đã nộp và không gọi lại RPC điểm cho attempt đó.
Nếu bài đã lưu nhưng cập nhật điểm thất bại, retry không tự sửa điểm; đây là giới
hạn của luồng cũ được giữ lại khi không dùng receipt.

## Kiểm tra

```sh
node --test tests/exam-submit-recovery.test.cjs tests/exam-answer-submission.test.cjs tests/exam-fullscreen-grace.test.cjs tests/exam-server-retry.test.cjs tests/exam-auth-cookies.test.cjs
```

Kiểm thử bao gồm auth timeout, 401, lỗi mạng, giữ/đọc bản nháp, retry PATCH và
chuyển cookie mới qua middleware. Cần kiểm tra thêm trên staging với session sắp
hết hạn, hai tab, mạng chập chờn và bài thi trên 60 phút. Chưa tái hiện lỗi dài hạn
trên môi trường production.
