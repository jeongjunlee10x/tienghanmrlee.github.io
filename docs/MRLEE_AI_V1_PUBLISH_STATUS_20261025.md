# MR LEE · Artwork AI đợt 1 · 25/10/2026

## Trạng thái minh bạch

Nhánh này chứa **mã tích hợp và kiểm tra hình ảnh**, nhưng **KHÔNG chứa 20 tệp WebP nhị phân** cho tới khi xác thực chúng xuất hiện trong thư mục `assets/mrlee-ai/v1/`.

Gói WebP thật đã được tạo và đóng gói riêng trong cuộc trò chuyện dưới tên **MRLEE_AI_10_ANH_V1_CAI_WEBSITE.zip**. 10 ảnh desktop 1599×900 và 10 ảnh mobile 900×507. Công cụ GitHub trong phiên này có thể sửa text/manifest nhưng chưa nhận trực tiếp byte nhị phân từ ZIP nội bộ, nên không được báo sai là đã upload.

## Bản đồ hình ảnh (không lặp file)

| Ảnh | Trang dùng |
|---|---|
| home | Trang chủ |
| learning | Học tiếng Hàn / 90 bài |
| speaking | Giao tiếp |
| topik | TOPIK |
| workbook | WORKBOOK |
| interview | Phỏng vấn |
| culture | Văn hóa |
| universities | Bản đồ đại học |
| profile | Hồ sơ học viên |
| admin | Admin dashboard |

Từng ảnh dùng bản desktop và mobile độc lập. Mã giao diện **chỉ gắn hình khi tải thành công và có kích thước thật**. Nếu chưa có ảnh, giữ hình SVG đã có, không để ô rỗng hoặc biểu tượng lỗi ảnh.

Các tập tin cần thiết trước khi công bố: `assets/mrlee-ai/v1/{home,learning,speaking,topik,workbook,interview,culture,universities,profile,admin}.webp` và `*-mobile.webp`. SHA-256 kỳ vọng được khóa tại `tools/verify-mrlee-ai-assets.mjs`.

### Kiểm tra trước khi đẩy

```powershell
node tools/verify-mrlee-ai-assets.mjs
node --check assets/mrlee-ai/v1/visuals.js
node tools/mrlee-next-qa.mjs
```

**Chưa có đủ WebP thì tuyệt đối không thể tuyên bố tất cả ảnh AI đã lên GitHub.** Một ảnh cùng phong cách có thể còn giống về bố cục; cần kiểm tra trực quan thủ công, vì SHA khác nhau không đủ chứng minh nội dung khác nhau.

Không thay logo `assets/branding/logo-mrlee.png`, tài nguyên âm thanh, quyền Admin, bảng học viên, Firestore hoặc Supabase.
