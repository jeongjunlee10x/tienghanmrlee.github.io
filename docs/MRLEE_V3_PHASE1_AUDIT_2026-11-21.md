# TIẾNG HÀN MR LEE V3.0 — Giai đoạn 1: audit & regression fixes (21/11/2026)

## Phạm vi và ranh giới

- Nguồn: `jeongjunlee10x/tienghanmrlee.github.io`, nhánh `main`, tại commit gốc `f851537436fef544449e2f7b0e878daebe80e329` (18/11/2026).
- Chỉ sửa mã HTML/JS kiểm thử/branding, CI và tài liệu trên nhánh riêng. **Không sửa điểm, cơ sở dữ liệu, Firebase, Supabase, Cloudflare production hoặc âm thanh/hình ảnh. Không xóa tệp.**
- PR phải được kiểm thử trước khi merge; không tự động nhập vào `main`.

## Kết quả xác minh qua GitHub API và logs

- 100 workflow runs gần nhất tại thời điểm rà soát: 88 `success`, 8 `failure`, 4 `cancelled`. Chỉ là một cửa sổ mẫu, không thể suy ra phần trăm lỗi website.
- Workflow [MR LEE NEXT run 44351087679](https://github.com/jeongjunlee10x/tienghanmrlee.github.io/actions/runs/44351087679) lỗi tại `node tools/check-brand-consistency.mjs`: 4 lỗi thiếu CSS/JS logo dùng chung trên `game-goose-mystery.html` và `game-goose-pvp.html`. Các kiểm tra phía sau bị **skipped**, không được coi là pass.
- Workflow [UI Phase 5 run 44351088019](https://github.com/jeongjunlee10x/tienghanmrlee.github.io/actions/runs/44351088019) lỗi tại `node tools/check-lesson-directory-first.mjs`: assertion `Lesson renderer cache is stale`. Bài học đã dùng `?v=20261117-lesson-v1`, trong khi bộ test vẫn khóa `?v=20261104-speaking-v3`; CSS font cũng đã đổi sang `font-v3`.
- Log trước bước thất bại cho biết `mrlee-next-qa.mjs` đã xác minh 10.000 câu hỏi khác biệt, 90 bài học, trong phạm vi kiểm tra của công cụ. `audit-image-quality.mjs` báo 110 ảnh được kiểm tra, 14 trường hợp trùng binary, 0 cảnh báo độ phân giải. **Không xóa ảnh trùng** khi chưa rà tham chiếu.
- `robots.txt` và `sitemap.xml` trong GitHub cùng trỏ về `https://mrlee-b6a.pages.dev/`; sitemap gốc có 21 mục. Kết quả kiểm tra production/Search Console **chưa được xác nhận trong phiên audit này**; workflow SEO live có cơ chế kiểm tra riêng.
- Repo đang có PR Cloudflare sửa 404/headers đang mở (PR #60 và #72). Không chồng thay đổi lên các PR này.

## Sửa chữa trong PR V3.0 Giai đoạn 1

1. **Brand assets:** thêm hai liên kết `assets/branding/site-logo.css` và `assets/branding/site-logo.js` cho cả hai trang Goose. Không thay engine game, luật chơi, đồ họa map hoặc dữ liệu phòng.
2. **Hạn chế floating contact menu trên game/Admin:** helper `isGameOrAdminPage()` nhận diện cả `/game-foo.html`, `/game-foo`, `/admin.html`, `/admin`, kể cả site con đường dẫn của GitHub Pages. Tránh chèn giao diện liên hệ lên game và Admin khi Cloudflare sử dụng URL không phần mở rộng.
3. **Khôi phục kiểm thử bài học:** đảm bảo `mrlee-lesson-page.js` và `mrlee-listening-plus.js` có `?v=` và dùng **cùng cache key**; kiểm tra CSS font có query version, không cố định vào cache key lịch sử đã bị thay.
4. **PR pre-merge gate:** cho `mrlee-ui-phase5.yml` chạy trên `pull_request` nhắm `main`, với cùng bộ path hiện tại. Phân tách concurrency theo `github.ref` để PR không hủy các lượt chạy của `main`.

## Lệnh QA để chạy trước khi merge

```bash
node --check assets/branding/site-logo.js
node --check tools/check-lesson-directory-first.mjs
node tools/check-brand-consistency.mjs
node tools/check-lesson-directory-first.mjs
node tools/check-ui-phase5.mjs
node tools/mrlee-next-qa.mjs
node tools/audit-repo-hygiene.mjs
```

Theo dõi hai CI jobs khi PR được mở: `MR LEE NEXT — Kiểm tra giao diện và liên kết`, `MR LEE UI 2027 - Phase 5 Visual QA`. Workflow thứ hai còn dùng headless Chromium để chụp Fresh/Future trên desktop/mobile; đừng tuyên bố hoàn thành giao diện nếu nó chưa chạy thành công.

## Phát hiện thêm khi chạy PR #78 bằng Chromium

- Lượt chạy đầu của [UI Phase 5 trên PR #78](https://github.com/jeongjunlee10x/tienghanmrlee.github.io/actions/runs/44907194315) vượt qua kiểm thử tĩnh, sau đó kiểm tra thành công 29 trường hợp hiển thị đầu tiên nhưng **thất bại tại Workbook mobile Fresh**: `Photo overlaps mobile text mrlee-bai-tap-pro.html mobile`.
- Phân tích CSS cho thấy ảnh Workbook bị `display:none!important` tại breakpoint mobile, trong khi ở desktop dùng `position:absolute!important`. Trên mobile, ảnh ẩn không có hộp bố cục nên Chromium không thể xác minh ảnh nằm dưới đoạn chữ.
- Đã sửa trực tiếp `assets/mrlee-ui2027/learning-hubs-v2.css`: ở mobile, ảnh nằm hàng thứ hai của grid, đặt `position:relative` và chiều cao 150px thay vì bị ẩn; đổi cache key CSS trong `mrlee-bai-tap-pro.html`. Tác động chỉ đến hero Workbook ở màn hình hẹp.
- Cần chạy lại workflow để xác minh cả Fresh/Future desktop/mobile và các trang còn lại. **Không coi sửa CSS là đạt nếu CI sau sửa chưa báo success.**

## Rủi ro tồn đọng và quyết định tiếp theo

- **P0:** Chờ kết quả test PR; chỉ merge sau khi kiểm thử thành công hoặc phân loại chi tiết các lỗi ngoài phạm vi thay đổi.
- **P1:** Kiểm tra thực tế production Cloudflare, UI Fresh/Future, icon/overlay game, Admin, lưu điểm và màn hình mobile; không dùng kết quả kiểm thử tĩnh thay cho kiểm thử người dùng.
- **P1:** Rà trùng lặp của PR #60/#72 trước khi quyết định headers/404 nào sẽ hợp nhất.
- **P2:** Kiểm kê phụ thuộc nhiều đời CSS/JS, tải ảnh thực, tài liệu 22 chủ đề và chất lượng slide 40–50 trang trên từng bài.
- **P2:** Kiểm tra realtime PvP (2 trình duyệt, nhiều người chơi, quyền truy cập backend) bằng tài khoản test; không thao tác dữ liệu học viên thật.

**Nguyên tắc:** Giai đoạn 1 chỉ đưa vào PR, không merge, không deploy production, không xóa dữ liệu. Trạng thái CI được cập nhật từ GitHub Actions sau khi PR được mở.
