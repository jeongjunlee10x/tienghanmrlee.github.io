# TIẾNG HÀN MR LEE — V3.0 Unified Fresh/Future UI

**Date:** 22/11/2026  
**Starting base:** `main` at `43b19d04dab8dc7561b6808625aece7c4905fc4a`.

## Phạm vi thực sự triển khai

- **89/89 trang HTML chính tại root** (không tính tệp xác minh Google, bản snapshot trong `archive/` và `desktop/offline.html`) được cài stylesheet `assets/mrlee-ui2027/v3-unified.css` và controller `assets/mrlee-ui2027/v3-runtime.js`.
- Hai bảng màu: **Fresh** trắng/lam nhạt/xanh biển, **Future** xanh đêm/cyan; hệ thống token, viền, đổ bóng, typography Việt–Hàn, spacing, vùng nút, focus và responsive.
- Các cụm theo chức năng gồm trang chủ, học tập 6 cấp, Workbook, TOPIK I/II, văn hóa, tuyển sinh, tra cứu trường, game, hồ sơ và Admin.
- **Game Zone** chỉ làm mới sảnh, thẻ game, thanh điều hướng, popup; không thay camera, kích thước bàn cờ, animation lá bài, bộ đếm hoặc luật chơi.
- **Admin** giữ nguyên phân quyền, đăng nhập, biểu đồ, logic điểm; chỉ làm mới vùng thống kê/thẻ/nút/bảng.
- **Trang chủ** giữ nguyên hai ảnh hero 16:9 và vị trí các CTA bên vùng chữ, không chồng lên nhân vật.
- Trang không tải `theme.js` dùng `localStorage.getItem('MRLEE.THEME.V1')` (chỉ đọc) để đồng bộ sắc thái. Trang có shared controller dùng shared controller làm nguồn thật.
- Không thêm menu theme trùng trên header. Popup chọn Fresh/Future ban đầu được giữ đúng hành vi cũ.

## Lý do triển khai qua stylesheet dùng chung

Repository trước nâng cấp có trên 200 CSS chứa nhiều thế hệ layout, chủ yếu là quy tắc đặc thù. Không xóa hoặc viết lại hàng loạt các asset cũ vì có thể phá vỡ bài học, game multiplayer, popup tuyển sinh và Admin. V3 tạo một lớp thiết kế được scope rõ `data-mrlee-v3-scope`: `site`, `admin`, `game` để thống nhất mà vẫn cho phép tiếp tục nâng cấp cấu trúc từng module sau khi có ảnh chụp và thử nghiệm.

## An toàn và khả năng quay lại

- Tất cả cập nhật nằm trên nhánh `upgrade/v3-unified-visual-system-20261122`, hợp nhất bằng PR khi CI đạt.
- **Không xóa tệp**, không chỉnh MP3/ảnh gốc, ngân hàng 10K, điểm Spark, Firebase/Supabase, Admin auth hoặc dữ liệu game.
- Xóa lớp thay đổi V3 có thể thực hiện bằng revert PR/commit từ GitHub, không cần khôi phục dữ liệu học viên.

## QA trước merge

- `tools/check-v3-unified-ui.mjs`: kiểm tra đủ 89 HTML chính, chỉ một CSS/script cho mỗi trang, đúng phân loại game/admin/site, giữ file Google verification, không chạm board/slide.
- `tools/browser-v3-unified-ui.mjs`: thử 13 trang đại diện × Fresh/Future × mobile 390 và desktop 1440 = **52 trường hợp**; kiểm tra stylesheet parse, màu theme, lớp thiết kế, hình chụp và báo cáo ngang màn hình.
- Kiểm thử hiện hành: UI Phase 5, 15 bài học, brand, Workbook 10K, TOPIK, media, các bài kiểm thử game/browser liên quan.
- Ảnh chụp trên workflow artifact `mrlee-v3-unified-sitewide-screenshots` để đối chiếu trực quan.
- Nghiệm thu trên production riêng; GitHub Pages và Cloudflare Pages deploy status không đảm bảo mọi CSS/JS đều được trình duyệt khách hàng nạp đúng.

## Giới hạn minh bạch

Đây là **lượt đầu triển khai toàn bộ hệ thống giao diện/đồ họa CSS**, không khẳng định 89 trang đã được thay đổi cấu trúc DOM 100% hoặc tất cả trạng thái chức năng được nghiệm thu khi mới chỉ có bộ browser representative. Những module đặc biệt (game PvP nhiều người, iframe/map, đăng nhập Admin, form dữ liệu thực) cần chạy bài kiểm tra riêng sau khi PR tổng thể đạt.

## Tiếp tục sau CI

1. Đánh giá screenshot desktop/mobile, phân loại các lỗi tương phản/overflow/ảnh/CTA.
2. Sửa những selector đặc thù trên PR trước khi merge.
3. Nghiệm thu Cloudflare production, so sánh Fresh/Future, rồi tinh chỉnh module theo mức độ ưu tiên.
