# Supabase Logs audit — 22/10/2026

Đã quét 532 file TS/TSX trong app, components, hooks, lib, providers, services, repositories; duyệt AST của 81 useEffect/useCallback, 9 timer, các vòng lặp query, SQL migrations và cấu hình Supabase. Snapshot vị trí lúc quét ở `supabase-audit-inventory.json`. Mức độ dưới đây là ưu tiên tối ưu request; chưa đo được nguồn gây ra 1.19 GB/101.53 GB trên cloud.

## Hai chỉ số khác nhau

- Logs Ingest là log từ Gateway, Auth, Realtime, Postgres, Storage, Edge Functions… Bớt request/lỗi lặp có thể giảm ingest.
- Logs Query là lượng log bị quét khi đọc Studio/Logs Explorer/Management API/công cụ đọc log; không phải dung lượng trả về của `.from()`/`.rpc()`.
- Console ở Next.js thường vào host Next.js, không tự vào Supabase. Không có `supabase/functions` hay pipeline chuyển log Next.js sang Supabase trong repo. Bỏ debug Next.js không trực tiếp chứng minh giảm Supabase Ingest.

Nguồn: [Logs](https://supabase.com/docs/guides/platform/manage-your-usage/logs), [Ingest](https://supabase.com/docs/guides/platform/manage-your-usage/logs-ingest), [Query](https://supabase.com/docs/guides/platform/manage-your-usage/logs-query), [SSR Auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs).

## Danh sách theo mức độ

| Mức | File và vị trí hiện tại | Vấn đề, tác động, xử lý |
|---|---|---|
| Cao | `lib/supabase/middleware.ts:46`; matcher `middleware.ts:12` | Middleware gọi getUser cho mọi API, route lại xác thực riêng: thêm một Auth request/API. Đã đổi middleware sang getClaims; giữ kiểm tra đổi mật khẩu, refresh cookie và cache headers. API vẫn giữ getUser/role check. Với asymmetric signing key xác minh dùng JWKS cache; symmetric key vẫn có thể gọi Auth. Không cache phân quyền toàn cục. |
| Cao khi chấm lại nhiều bài | `services/exam.service.ts:174`; vòng lặp cũ khoảng dòng 182 | N attempt tạo N UPDATE và thêm RPC HP khi đổi pass/fail, tổng N…2N HTTP request. Đã đổi sang RPC 500 attempt/lô, giữ hàm adjust_student_points. Trong mỗi lô score/HP commit cùng nhau, snapshot cũ ngăn cập nhật/cộng điểm trùng khi tranh chấp. DB vẫn cập nhật mỗi hàng; audit SQL verbose vẫn cần kiểm tra riêng. |
| Cao khi bài nhiều câu | `services/grading.service.ts:26,60` | Insert result_details trong vòng lặp câu hỏi. Đã gom mảng và insert một lần, giữ thuật toán. N câu giảm từ N+2 xuống 3 request, chưa tính Auth/middleware. Không bỏ qua lỗi ghi như trước. Ghi chi tiết và tổng điểm vẫn là hai thao tác riêng. |
| Trung bình | `providers/auth-provider.tsx` (Presence cũ khoảng dòng 241), `providers/presence-provider.tsx:20` | Hai provider đăng ký cùng tên Presence, config khác; singleton có thể tái sử dụng channel và nhân callback/track. Đã giữ một owner ở PresenceProvider, chỉ kết nối khi đăng nhập; removeChannel một lần khi cleanup. Session-change subscription vẫn được giữ và cleanup. |
| Trung bình | `services/auth.service.ts:112`; `providers/auth-provider.tsx:407,481` | Concurrent refresh/Strict Mode có thể gọi Auth trùng; sau login đã có user nhưng lại getUser. Đã dedupe promise đang chạy, không cache kết quả hoàn thành; login dùng user từ signInWithPassword; không invalidate profile chưa có cache lúc mount; chặn forced logout trùng bằng ref. |
| Trung bình khi lỗi kéo dài | `lib/flashcards/use-star-sync.ts:20,52` | Có pending và backend lỗi thì retry mỗi 10s, tối đa 360 request/giờ/tab. Đã thêm backoff 10/20/40/80/160/300s, không gửi offline, giữ pending. Sửa mới/manual flush/online vẫn thử sớm được. |
| Thấp, log host | 24 vị trí trong inventory; nổi bật `services/exam.service.ts` cũ 111/171/213, `repositories/lesson-content.repository.ts` cũ 61/79/109/118/163/169/198, `app/api/auth/forgot-password/route.ts` cũ 40/68/73/175, `lib/exam/submit/orchestrator.ts` cũ 43 | Debug in toàn bộ attempts/answers/results/profile/email/resource. Đã bỏ 24 console.log/info/debug thực thi ở API/actions/services/repositories/lib/exam. Không bỏ log lỗi nghiệp vụ. |
| Thấp, theo dõi | `components/tutoring/student-booking-dialog.tsx:29` | Poll lịch sắp tới mỗi 2 phút: khoảng 30 lượt/giờ/tab visible. Giữ để không đổi độ trễ cập nhật lịch; React Query không poll nền theo mặc định. Có thể nâng 5 phút nếu chấp nhận cập nhật chậm hơn. Timer nhãn 1s không gọi API. |
| Thấp, code chưa được dùng | `hooks/use-dashboard.ts:23` | Poll active-student mỗi phút, nhưng hiện không có caller trong repo. Không tính đây là traffic đang xảy ra. Nếu dùng lại, cân nhắc Presence có sẵn hoặc tăng interval. |

## Các điểm đã kiểm tra nhưng không kết luận có lỗi

- Không phát hiện effect tự fetch/setState rồi phụ thuộc chính state đó thành infinite loop. Callback fetch có dependency primitive/ref ổn định. Inline queryFn trong React Query không khiến fetch mỗi render.
- Các subscription tự viết có cleanup; không có onAuthStateChange tự viết. Không bổ sung Auth subscriber không cần thiết. Thư viện có subscription nội bộ không có nghĩa component bị leak.
- touch_last_seen vẫn giới hạn một lần/2 phút theo hoạt động; RPC khi Presence reconnect đã bị bỏ cùng effect trùng. Countdown bài thi/fullscreen/dashboard/dò bài chỉ đổi state; giữ auto-submit và deadline.
- Vòng lặp ghép exam alerts, teacher-student, course detail chỉ xử lý bộ nhớ sau query `.in()`/join; notification assignment đã batch. Không phải mọi map/for là N+1.
- `services/account.service.ts:115` import tài khoản vẫn cần một auth.admin.createUser cho mỗi user; SDK không có bulk-create tương đương `.in()`. Update profile/enroll theo từng dòng giữ hành vi partial-success. Nếu tối ưu thêm, cần thiết kế batch profile/enrollment kèm báo lỗi từng dòng/cleanup tài khoản thất bại. Không thay bằng INSERT trực tiếp auth.users hoặc upsert thiếu dữ liệu bắt buộc.

## Logging

`lib/logging.ts` chỉ giữ name/message/code/status, 300 ký tự/trường, tối đa 5 đối số; không serialize payload/rows/stack. Đã áp dụng tại `lib/api/handle-error.ts`, API forgot-password, attendance-create, exam-alerts và lesson-content repository. Các console.error ở boundary khác vẫn giữ để chẩn đoán; không có bằng chứng chúng đi vào Supabase Ingest. Helper không phải bộ lọc bí mật hoàn chỉnh: không truyền token/password vào message.

## SQL, cron và Logs Query

Không tìm thấy pgaudit, log_statement=all, ngưỡng slow-query=0, pg_cron/cron.schedule, RAISE LOG/NOTICE spam, Management logs API, CLI quét logs, cron/health-check đọc logs hoặc Edge Functions trong repo. `supabase/config.toml` là local config, không phản ánh đầy đủ cloud. Bảng audit_logs là dữ liệu nghiệp vụ; không xóa audit nghiệp vụ để giảm sai chỉ số.

Chạy `docs/sql/supabase-log-settings.sql` một lần để đọc pg_settings, role/database overrides và extensions. Chỉ chạy câu cron.job đã comment nếu pg_cron tồn tại. Không in cron command vì có thể chứa API key. Chưa chạy các truy vấn này trên cloud và chưa thay đổi setting nào.

Nếu xác nhận statement logging quá rộng, cân nhắc log_statement=none/mod tùy yêu cầu audit. Nếu slow-query threshold quá thấp, cân nhắc 1000–2000ms. Kiểm tra cả pgaudit.log/role và overrides; không tự tắt audit/cron chưa rõ mục đích.

Để giảm Logs Query: bắt đầu cửa sổ 15–60 phút, lọc đúng nguồn/status trước khi query, tránh auto-refresh/cửa sổ nhiều ngày lặp lại. LIMIT không đảm bảo giảm scan. Kiểm tra cả Dashboard, CI/MCP/monitoring ngoài repo. Luồng theo dõi liên tục nên xem Log Drains thay vì poll Logs Explorer; Drains có chi phí riêng và không giảm Ingest.

Tài liệu hiện mô tả Logs Query là allowance không tính phí trực tiếp; enforcement có thể thay đổi. Đối chiếu Usage đúng project/billing cycle. Tối ưu chỉ giảm log mới, không hoàn quota đã dùng. Đợt audit này không đọc Logs Explorer hay gọi Management API.

## Triển khai và kiểm thử

- Áp dụng `202610220005_batch_exam_regrades.sql` trước/cùng lúc deploy service chấm lại; cần public.adjust_student_points(uuid, integer) mà service cũ đang gọi. Hàm mới GRANT tường minh cho authenticated/service_role nhưng runtime chỉ chấp nhận service_role. Không fallback tự động về N+1 nếu migration thiếu.
- Transaction áp dụng theo lô 500. Answer key vẫn lưu trước; nhiều lô không thuộc cùng transaction. Conflict snapshot rollback lô hiện tại; không retry mù để tránh cộng HP lặp.
- Các test mới kiểm tra Auth dedupe, Presence cleanup, batch grading, bounded error logs và RPC role/rollback/HP. Bộ regression Auth/cookie/bài thi/CRUD vẫn chạy. TypeScript toàn repo còn lỗi baseline; không tuyên bố build toàn dự án đã xanh.
- So sánh Network cùng kịch bản trước/sau và xu hướng Ingest/Query trong 24–48 giờ. Chưa có dữ liệu thực tế để cam kết mức giảm GB hoặc khẳng định đây là toàn bộ nguyên nhân vượt quota.
