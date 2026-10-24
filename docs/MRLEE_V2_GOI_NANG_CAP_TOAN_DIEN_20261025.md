# TIẾNG HÀN MR LEE — GÓI NÂNG CẤP TOÀN DIỆN V2 (R1 + R2)

**Ngày:** 25/10/2026  
**Repository:** `jeongjunlee10x/tienghanmrlee.github.io`  
**Nhánh triển khai:** `mrlee-v2-r1-admin-nav-20261025`  
**Gốc an toàn:** `main@8589aef4af8b8e4e4e62b32075910f1fe567657a`  
**Trạng thái:** Gói mã đang được kiểm thử trên nhánh, KHÔNG được gọi là triển khai xong toàn website.

## 1. Tệp mã đã có thật

| Tệp | Kết quả |
|---|---|
| `assets/mrlee-v2/primary-nav.css` | 6 chuyên mục theo đúng thứ tự, responsive, theme viễn tưởng |
| `assets/mrlee-dual-ui/theme.js` | Tải điều hướng và lớp trải nghiệm mới trên trang dùng dual theme |
| `assets/mrlee-v2/experience.css` | Font, khoảng cách, CTA, section giới thiệu, bảng, footer, focus và reduced motion |
| `assets/mrlee-v2/experience.js` | Lời dẫn theo trang, liên kết thật, footer tiện ích, nút lên đầu, điều hướng dự phòng |
| `ban-do-dai-hoc-han-quoc.html` | Nối lớp giao diện vào trang bản đồ độc lập, không sửa dữ liệu tọa độ |
| `dang-ky-tu-van.html` | Nối lớp giao diện vào trang phiếu tư vấn độc lập |
| `assets/mrlee-next/consultation.js` | Chỉ báo gửi phiếu thành công khi máy chủ cấp mã yêu cầu hợp lệ |
| `admin.html` | Sửa mojibake, bổ sung cấp học 1–6 và nhãn KPI cũ có giới hạn mẫu |
| `assets/mrlee-dual-ui/admin-charts.js` | KPI đếm từ máy chủ, biểu đồ theo giờ VN, bài có chi tiết, tư vấn cần xử lý |
| `tools/audit-mrlee-rewards.mjs` | Kiểm toán đường ghi điểm hiện có chỉ đọc, không phát thưởng |
| `tools/mrlee-next-qa.mjs` | Kiểm thử path/logo/CTA/JS và chống hồi quy |
| `.github/workflows/mrlee-next-qa.yml` | Kiểm thử trên PR, không tự merge dữ liệu sống |

## 2. Bản đồ trang & hành động

| Trang | Đích điều hướng chính | Đích phụ | Phần độc lập vẫn giữ nguyên |
|---|---|---|---|
| Trang chủ | `hoc-tieng-han.html` | `kiem-tra-dau-vao.html` | Banner, BXH, khung tìm trường |
| Học tiếng Hàn | `hoc-theo-bai.html` | `mrlee-bai-tap-pro.html` | 6 cấp, 90 bài, tiến độ hiện có |
| Giao tiếp | `hoi-thoai-tap-noi.html` | `luyen-noi-nang-cao.html` | Audio, giao tiếp theo chủ đề |
| TOPIK | `lo-trinh-topik.html` | `topik-v11.html` | Đề thi, thi thử, lịch sử |
| WORKBOOK | `hoc-theo-bai.html` | `lich-su-hoc-tap.html` | Bộ đề thật, chức năng lưu |
| Phỏng vấn | `on-luyen-phong-van.html` | `hoi-thoai-tap-noi.html` | Ngân hàng câu hỏi |
| Văn hóa | `van-hoa-bai-hoc.html` | `ban-do-han-quoc.html` | Bài chủ đề và gallery |
| Bản đồ đại học | `tim-truong.html` | `dang-ky-tu-van.html` | Dữ liệu trường, bản đồ |
| Hồ sơ học viên | `lich-su-hoc-tap.html` | `bang-xep-hang.html` | Firebase Auth, lịch sử |
| Tuyển sinh | `dang-ky-tu-van.html` | `ban-do-dai-hoc-han-quoc.html` | Thông tin du học |
| Admin | Biểu đồ ở đầu mỗi tab; số thực theo RLS | Quản lý bài làm và tư vấn | Quyền quản trị và dữ liệu cũ |

## 3. Dữ liệu thật, không ngụy tạo

Đã đối chiếu cấu trúc live Supabase dự án `pkxqsboyotlyoizzxizb` ở chế độ chỉ đọc:
- Các bảng `mrlee_students`, `mrlee_scores`, `mrlee_learning_events`, `mrlee_placement_submissions`, `mrlee_consultation_requests` tồn tại.
- Những bảng trên có RLS bật. Việc RLS bật không tự chứng minh phân quyền thực thi đúng với mọi vai trò.
- Bảng `mrlee_reward_v2_awards` và `mrlee_reward_v2_claims` **không hiện diện** ở lần kiểm tra; file `MRLEE_REWARD_V2_SETUP.sql` ở GitHub chỉ là script, không có nghĩa đã chạy trên máy chủ.
- Biểu đồ hoạt động xem lịch sử tối đa 1.500 bản ghi mỗi loại và hồ sơ mẫu tối đa 2.000; KPI count chính dùng `count: exact` theo quyền RLS.
- Không chép dữ liệu cá nhân ra bản báo cáo này.

## 4. Hệ thống điểm thưởng: tạm khóa thay đổi hệ thống

Hệ thống đang có **ít nhất hai nguồn điểm khác nhau**:
- `mrlee-points-core.js` — điểm động lực trên trình duyệt/Firebase `studyPoints/wallet`, có `lessonRewards` một lần mỗi ID.
- `scripts/mrlee-score-spark/runner.cjs` — chấm TOPIK Spark bằng GitHub Actions, ghi sổ kết quả server-side.
- Reward V2 được mô tả trong SQL và Edge Function nhưng chưa xác nhận bảng live.

**Chưa triển khai tự động hợp nhất các sổ điểm, cộng lại, nâng/hạ số dư, hoặc quyền đổi thưởng.** Việc đó chỉ thực hiện sau kiểm toán event, UID, claim idempotency, test đồng thời và xác nhận quyền admin.

Lệnh kiểm toán an toàn:
```powershell
node tools/audit-mrlee-rewards.mjs
node tools/audit-mrlee-rewards.mjs --json
```

## 5. Công bố & khôi phục

- Không sửa `.git` hay chạy `git reset --hard`, không xóa tài nguyên lịch sử.
- PR phải vượt qua QA, kiểm tra theme trên 390/768/1440 px, xác thực Admin và thử phiếu tư vấn trước khi merge.
- Không thay đổi Supabase schema, Firestore rules hay Audio trong gói R2 này.
- Khi có lỗi, đóng PR/chuyển lại nhánh `main`; không `force push`.
- Trước khi cập nhật nguồn local, kiểm tra `git status` sạch và sao lưu thư mục quan trọng; không tự chạy installer bằng quyền Admin Windows.

## 6. Phần chưa hoàn thành

- Tạo bộ ảnh WebP/AVIF riêng cho tất cả trang con và đối chiếu mockup bằng ảnh chụp giao diện.
- Kiểm thử duyệt hình ảnh thực tế, responsive, tương phản và tất cả nút bằng browser.
- Bổ sung 15 WORKBOOK/bài và soát 90 bài học, audio không đọc “여자 / 남자”.
- Tất cả route sâu chưa được kiểm thử end-to-end.
- Thực thi hoàn chỉnh điểm thưởng server v3, điểm TOPIK đã xác minh, chặn gian lận và chính sách đổi thưởng.
- Xác nhận gửi phiếu tới Admin bằng giao dịch thật, kiểm thử phân quyền RLS cả user/non-admin, sau đó mới merge `main`.

**Không dùng ghi chú này để khẳng định đã nâng cấp đầy đủ production.**
