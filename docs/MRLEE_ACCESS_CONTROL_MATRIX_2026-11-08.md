# MR LEE — Ma trận phân quyền và kiểm thử bảo mật (08/11/2026)

> Đã đối chiếu trực tiếp mã GitHub `main` và Supabase production qua công cụ chỉ đọc. Các lệnh kiểm tra SQL đều là `SELECT`; không chạy migration, không cập nhật học viên, điểm, ví G hoặc phiếu tư vấn.

## Phạm vi đã xác minh

| Thành phần | Xác thực/cấp quyền | Bằng chứng | Rủi ro cần tiếp tục kiểm tra |
|---|---|---|---|
| Đăng nhập học viên | Firebase email/password; kiểm tra `emailVerified` | `auth-firebase.js`, `auth-guard.js` | Giao diện guard không bảo vệ HTML/JS công khai; dữ liệu riêng phải nằm sau API/Rules |
| Game Zone - dữ liệu cá nhân và chấm XP | Edge Function xác minh Firebase JWT với chữ ký, issuer, audience, `email_verified`; RPC chấm phía server | Edge `mrlee-game-zone` và `assets/game-zone/verified.js` | Kiểm thử truy cập trái phép, đua phiên, thao tác ngắt giữa chừng |
| Arena - PvP / G / bảng trạng thái | Edge Function xác minh Firebase JWT, DB RPC xử lý giao dịch; RLS khóa bảng Game Arena với client | Edge `mrlee-arena-rooms`, `assets/arena/room-api.js`, SQL grants | Kiểm thử race condition, nhận thưởng lặp, cược theo số lá, sự cố rời phòng |
| Nhận thưởng học tập | Firebase JWT và DB RPC kiểm tra điều kiện thưởng | Edge `mrlee-reward-v2` | Kiểm thử trùng yêu cầu và phân biệt điểm tuần / G |
| Phiếu tư vấn | Origin allowlist + Turnstile server-side | Edge `mrlee-consultation-submit` | Kiểm thử gửi trùng, rate limit, dữ liệu cá nhân trong email |
| Kiểm tra đầu vào | Origin allowlist + Turnstile, đáp án chấm phía server | Edge `mrlee-placement-submit` | Kiểm thử gian lận, bảo toàn bài làm và danh sách Admin |
| Admin | Chính sách Supabase RLS tham chiếu `mrlee_admins` | `pg_policies` qua kiểm tra chỉ đọc | Cần thử bằng tài khoản admin/test user, không suy luận chỉ từ HTML |

## Quyền database xác minh ngày 08/11/2026

- **18 bảng public** có bật Row Level Security (RLS).
- 5 bảng Arena `mrlee_arena_rooms`, `mrlee_arena_wallets`, `mrlee_arena_wallet_ledger`, `mrlee_arena_escrows`, `mrlee_arena_daily_rewards` **không có RLS policy**. Với mô hình API service-role kiểm soát, điều này có thể là chủ đích; **không tự tạo policy đọc/ghi công khai**.
- Truy vấn `pg_proc` xác nhận **14 hàm `mrlee_*` đang xét**: role `anon` và `authenticated` đều **không có quyền EXECUTE**. Trong đó các RPC đổi G, quyết toán, bắt đầu/tiếp tục phòng, finish quiz đều không thể gọi trực tiếp bằng role công khai.
- Supabase Security Advisor còn nhắc `auth_leaked_password_protection`, cần đối chiếu có dùng Supabase Auth password không vì giao diện học viên hiện dùng Firebase Auth.
- Cảnh báo index không sử dụng **không** phải chỉ dẫn xóa index trước khi đo hiệu năng.

## Kiểm thử HTTP tự động bổ sung

`tools/check-api-auth-boundaries.mjs` chỉ dùng **GET không token** tới 5 Edge Functions, kiểm tra:
1. Không thể xem ví Arena, điểm Game Zone của cá nhân hoặc phiếu thưởng khi chưa đăng nhập.
2. Phiếu tư vấn và kiểm tra đầu vào từ chối GET.
3. Game Zone public status phản hồi JSON hợp lệ.
4. 5 function từ chối yêu cầu từ Origin không được cho phép.
5. Không lộ khóa dịch vụ trong body phản hồi.

**Giới hạn:** Kiểm tra này không chứng minh an toàn IDOR/BOLA giữa hai tài khoản đăng nhập, không kiểm tra thay đổi dữ liệu, không mô phỏng Firebase JWT hết hạn. Không được dùng tài khoản học viên thật cho thử nghiệm ghi dữ liệu.

## Trước khi triển khai production

- Duyệt PR và xác nhận CI `MR LEE - Public API auth boundary checks (read-only)` PASS.
- Dùng tài khoản giả lập để kiểm tra Admin xem bài thi/phân quyền; thử không thể xem dữ liệu của học viên khác.
- Dùng test database/staging cho trường hợp hai người vào bàn đồng thời, settle hai lần, rời bàn, mất kết nối, đút 3 bích x3.
- Sau khi staging đạt mới triển khai Edge Function hoặc migration; kiểm tra advisor lần cuối.
- Riêng CORS: các response lỗi Origin không được phép ở consultation/placement hiện có thể phản chiếu Origin của yêu cầu trong header dù trả HTTP 403; đây là điểm **cần hardening**, chưa phải bằng chứng lộ dữ liệu và chưa đổi production.

Tài liệu tham khảo: https://supabase.com/docs/guides/database/postgres/row-level-security , https://supabase.com/docs/guides/functions/auth
