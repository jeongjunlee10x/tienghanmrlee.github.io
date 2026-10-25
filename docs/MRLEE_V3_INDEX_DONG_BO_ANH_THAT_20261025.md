# MR LEE — Gắn ảnh thật V3 với index và toàn bộ 10 trang

**Trạng thái:** Mã giao diện V3 và chức năng đọc ảnh đã được đưa lên GitHub; ảnh WebP trong gói hội thoại vẫn ở ZIP ngoài GitHub.

## Các file đã triển khai

- `assets/mrlee-ai/v3/live-mapping.js`: ánh xạ tên ảnh theo trang và theme; kiểm tra ảnh tải được rồi mới thay vào HTML (hero, card, Admin).
- `assets/mrlee-ai/v3/live-mapping.css`: phối ánh sáng và nền cho 2 chế độ, không thay logo gốc.
- 10 file HTML: `index.html`, `hoc-tieng-han.html`, `giao-tiep-theo-chu-de.html`, `kiem-tra-topik.html`, `giao-tiep-phong-van.html`, `van-hoa-han-quoc.html`, `ban-do-dai-hoc-han-quoc.html`, `mrlee-bai-tap-pro.html`, `trung-tam-hoc-vien.html`, `admin.html`.
- `tools/check-mrlee-v3-live.mjs`: kiểm tra đủ 10 trang, tính hợp lệ mã JS, đếm file WebP thật.
- `tools/PUSH_ASSETS_MRLEE_V3.ps1`: kiểm tra SHA-256 từng ảnh, kiểm tra Git sạch, đẩy tệp nhị phân lên nhánh Git riêng.

## Gói ảnh tuyển chọn đang có

Tên ZIP: `MRLEE_V3_ANH_THAT_DONG_BO_INDEX_20261025.zip`.

- **57 WebP tuyển chọn** từ các ZIP ảnh trong cuộc trò chuyện, đã kiểm tra 57 mã SHA khác nhau.
- Bao gồm 10 trang × 2 ảnh bìa Fresh/Future và các thẻ của Trang chủ, 6 cấp độ Học tiếng Hàn, 6 công cụ, giao tiếp, TOPIK, văn hóa, WORKBOOK.
- **113/170 mục V3 còn thiếu**. 20 hero là các biến thể từ 10 cảnh gốc; không tuyên bố 20 cảnh hoàn toàn độc lập.
- Kích thước hero hiện có là 1672×941, thấp hơn chuẩn 2560×1120 trong manifest, nên **chưa thể được tuyên bố đạt toàn bộ V3**.
- Một phần các thẻ là minh họa vector từ những đợt đã tạo, không phải ảnh chân thực.
- Mọi ảnh ZIP đều lưu theo đường dẫn `assets/mrlee-ai/v3/{thư_mục}/{slug}.webp`, trùng cấu trúc mã đã gắn.

## Cách đưa ảnh trong ZIP lên GitHub (chỉ 1 lệnh)

1. Tải ZIP của cuộc trò chuyện về `Downloads`. **Giữ nguyên tên** `MRLEE_V3_ANH_THAT_DONG_BO_INDEX_20261025.zip`.
2. Tại VS Code / PowerShell đang mở thư mục source website, chạy:
   ```powershell
   cd C:\Users\Surface\Documents\tienghanmrlee.github.io
   git pull --ff-only origin main
   powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\PUSH_ASSETS_MRLEE_V3.ps1"
   ```
3. Công cụ đọc `SOURCE_PROVENANCE.json`, đối chiếu SHA 57 tệp và push vào nhánh `mrlee-v3-curated-real-images-...`. Không ghi đè điểm học viên, logo hoặc MP3.
4. Kiểm tra GitHub Actions, mở PR, sau đó hợp nhất lên `main`. Mã `live-mapping.js` đã có sẽ tự nhận 57 đường dẫn vừa được tải lên.

**Tại sao cần thao tác tải ZIP?** GitHub connector hiện hỗ trợ tạo **blob nhị phân từ chuỗi base64**, nhưng không có quyền truy cập trực tiếp byte ZIP nằm trong vùng lưu trữ của cuộc trò chuyện. Chưa có nguồn binary được chuyển qua connector để gọi create_blob. Không được khẳng định ảnh trong ZIP đã ở GitHub nếu chúng chưa thực sự được tải lên.

## Kiểm tra và khôi phục

- `node tools/check-mrlee-v3-live.mjs`: không coi ảnh thiếu là ảnh đã tồn tại.
- `node tools/check-site.mjs`: kiểm tra 66 trang HTML, JS, CSS và liên kết hiện hữu.
- Nếu ảnh V3 lỗi/thiếu: trang vẫn hiện ảnh đã có từ V2 hoặc từ mã gốc; không cần chỉnh dữ liệu.
- Không chỉnh sửa `assets/branding/logo-mrlee.png`.
- Chỉ thay tài nguyên theo chủ đề, không copy ảnh cũ, ảnh mờ hoặc ảnh không đúng nội dung để lấp các mục còn thiếu.
