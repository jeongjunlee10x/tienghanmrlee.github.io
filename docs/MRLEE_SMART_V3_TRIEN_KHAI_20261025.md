# MR LEE SMART V3 — giao diện dựa trên ảnh tham chiếu (25/10/2026)

## Cần sửa từ ảnh chụp thực tế

- Trang chủ: hero đẹp nhưng ảnh quá nhạt vì quá nhiều lớp phủ; nhiều lớp portal/quick link/bài học trùng nhau và đẩy thông tin xuống nhiều màn hình.
- Admin: thanh sidebar bị co thành chữ dọc, vừa có ảnh logo vừa có khối chữ dài và nhiều icon lỗi mã hóa; dashboard có hai lớp KPI cũ và mới lặp nhau.
- Các ô khám phá có đường viền nhưng không có ảnh nhìn thấy rõ.

## Các thay đổi đã viết

| File | Nâng cấp |
|---|---|
| `assets/mrlee-v2/smart-shell.css` | Thanh sidebar Admin cỡ hợp lý, logo giữ tỷ lệ; cover main rõ; lưới ảnh lớn; KPI mới; mobile |
| `assets/mrlee-v2/smart-shell.js` | 7 liên kết chuyên mục thật có 7 WebP riêng + WORKBOOK, tư vấn, kiểm tra và BXH; panel mở rộng khi cần; shortcut Admin gọi đúng navigation cũ |
| `index.html` | Tải bộ giao diện Smart, không sửa router hay nội dung cũ |
| `admin.html` | Tải giao diện Smart; sửa vài icon mojibake rõ ràng |
| `tools/check-mrlee-smart.mjs` | QA ảnh, liên kết, logo, cú pháp và trạng thái Fresh |
| `.github/workflows/mrlee-next-qa.yml` | Kiểm tra tự động Smart V3 trong pull request và main |

## Giao diện

- `fresh`: **không** hiển thị các khung Smart V3; giữ nguyên giao diện Tươi mới đã có.
- `future`: trang chủ ưu tiên cover nhân vật có sẵn `assets/v303/hero-glasses.webp` và 7 thẻ ảnh chủ đề riêng trong `assets/v306/images/`.
- `future`: các block nội dung dài cũ được ẩn mặc định trên trang chủ **nhưng không bị xóa**; nút “Xem toàn bộ nội dung” hiện lại nguyên vẹn.
- WORKBOOK, kiểm tra đầu vào, tư vấn và BXH có đường dẫn trực tiếp phía dưới thẻ ảnh, tránh lặp thành hàng chục ô card.
- Admin: không viết số liệu tĩnh; dùng chart có dữ liệu Supabase hiện hữu theo RLS; ẩn 4 KPI mẫu cũ ở Tổng quan, không xóa quyền quản trị hoặc dữ liệu.
- Chức năng thêm học viên, bài làm, tư vấn, kiểm tra đầu vào vẫn điều hướng tới các tab/hành vi hiện có.
- Logo luôn là `assets/branding/logo-mrlee.png`.

## Hạn chế cần nêu rõ

- Thiết kế là **bản HTML/CSS/JS triển khai bám sát mẫu**, không phải chép toàn bộ pixel của ảnh mockup.
- Ảnh nền WebP dùng tài nguyên **đã có sẵn** trong repository; không giả vờ các ảnh AI trong ZIP ở cuộc trò chuyện đã được đẩy lên Git.
- Kiểm thử GitHub Actions chỉ xác nhận mã và đường dẫn; chưa xác nhận thao tác đăng nhập Admin thực, trạng thái hồ sơ theo RLS hay ảnh chụp browser 390/768/1440px.
- Phần nội dung dài vẫn cần cuộn khi người dùng tự chọn mở ra (hoặc trên màn hình nhỏ).
- Không viết Firestore, Supabase, ngân hàng thưởng, điểm số hay thay đổi audio.
