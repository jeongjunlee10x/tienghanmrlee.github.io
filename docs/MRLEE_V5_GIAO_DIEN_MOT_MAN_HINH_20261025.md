# MR LEE V5 — Giao diện tất cả nút trong một màn hình

**Ngày:** 25/10/2026  
**Phạm vi:** 8 trang con sử dụng `assets/mrlee-v4/page-system.js`.  
**Mục tiêu:** Khi học viên chọn chuyên mục, thấy toàn bộ các nút điều hướng chính ngay tại màn hình đầu, **không phải cuộn xuống để tìm nút**.

## Bố cục tính theo viewport thật

Hệ thống đo `window.innerHeight`, kích thước màn hình và vị trí khối giao diện. Chỉ bật chế độ **một màn hình** trên desktop rộng từ 980px, cao từ 650px, **và** còn tối thiểu 475px dưới header thật.

Thay vì chiều cao cố định làm vỡ bố cục, CSS chia diện tích còn lại thành:

1. Ảnh bìa + tên + tối đa hai CTA: `minmax(130px,1.4fr)`
2. Nút chuyên mục hoặc cấp độ: `minmax(147px,1fr)`
3. Các nút công cụ học: `minmax(64px,.5fr)`
4. Nút **Mở nội dung học tập**: `38px`

Khoảng cách 8px, áp dụng `--v5-height` đo theo chiều cao thực (giới hạn tối đa 820px). Cột được tự động thiết lập theo **số nút**; không cần thêm chiều dài trang cho những lựa chọn cơ bản.

### Cụ thể trang Học tiếng Hàn

- **6 thẻ cấp độ** Sơ cấp 1–2, Trung cấp 1–2, Cao cấp 1–2.
- **6 nút chức năng khác đích**: Từ vựng & ngữ pháp, Luyện nghe, Luyện hội thoại, Luyện nói nâng cao, WORKBOOK, Sách & tài liệu.
- Ảnh WebP đã có trong GitHub; không tạo thêm hình trùng.
- Thao tác học bài, lưu lịch sử, nghe, điểm, Admin và dữ liệu hiện có **không bị thay thế**.

## Cơ chế mở chức năng thật

Nội dung dài vốn có trên từng trang được **ẩn hiển thị, không bị xóa** theo `data-mrlee-v4-folded`.

- Nhấn **Mở nội dung học tập**: khôi phục ngay tất cả form, bộ lọc, bản đồ, thẻ câu hỏi và nội dung gốc.
- Nhấn nút trỏ vào `#topicMenu`, `#universitySearch`, `#workLevel`, `#topicSection`...: tự mở phần gốc trước khi cuộn đúng chức năng.
- Điều hướng trực tiếp vào `page.html#anchor`: tự mở phần gốc.
- Nhấn **Thu gọn về một màn hình**: trở lại bảng điều khiển.
- Không giả lập biểu đồ, điểm, xếp hạng hoặc tạo dữ liệu học viên.

## Hai giao diện và thiết bị nhỏ

- Giao diện **Viễn tưởng** dùng nền dark/neon hiện có.
- Giao diện **Tươi mới** dùng nền sáng và đường viền dịu hơn; cùng thứ tự nút/chức năng.
- Trên màn hình nhỏ hoặc cửa sổ quá thấp, không cưỡng ép tất cả nút vào một màn hình rồi làm chữ không đọc được. Lưới thu xuống 3 hoặc 2 cột; nội dung chính vẫn thu gọn và mở theo nhu cầu.
- Chỉ khóa cuộn trang khi đã đo được đủ không gian desktop để thao tác an toàn.

## Kiểm thử

```powershell
node tools/check-mrlee-v5.mjs
node tools/check-mrlee-v4.mjs
node tools/mrlee-next-qa.mjs
```

Cần kiểm thử trực quan bổ sung các kích thước **1920×1080, 1366×768, 1024×768 và 390×844** trong Chrome/Edge, và hành vi mở khu vực bài tập/bản đồ khi đăng nhập thực tế. Kiểm thử mã/đường dẫn thành công không đồng nghĩa đã đạt chính xác từng pixel.

**Không thay đổi Git history, logo chính thức `assets/branding/logo-mrlee.png`, máy chủ, database hoặc quy tắc điểm thưởng.**
