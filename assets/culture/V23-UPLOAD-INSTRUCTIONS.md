# V23 — 20 ảnh AI mới, chủ đề 1–4

Đã tạo **20 WebP 1536 × 1024** từ các ảnh AI riêng của đợt 1–2. Ảnh gốc nằm trong ZIP do ChatGPT cung cấp: **MRLEE_CULTURE_AI_BATCH_01_02.zip** (~7.6 MB). Không đóng gói ZIP nhị phân vào GitHub vì đây là phiên GitHub connector chỉ hỗ trợ ghi nội dung UTF-8 và Git objects không có quyền đọc sandbox.

## Cài đặt hoàn tất

Giải nén ZIP vào một thư mục riêng, mở PowerShell, chạy script kèm theo:

```powershell
powershell -ExecutionPolicy Bypass -File .\MRLEE_CULTURE_IMPORT_B1B2.ps1 -Root 'G:\tienghanmrlee.github.io'
```

Script xác minh 20 mã SHA-256, kiểm tra repo sạch, pull --ff-only, chép WebP vào `images/culture-v23-ai/{le-hoi,am-thuc,truyen-thong,doi-song}/01..05.webp`, commit và push `main`.

Website dùng hình V23 tại 4 chủ đề này sau khi ảnh hiện diện. Trước khi upload, bộ nạp sẽ **tự lui về ảnh V21** (không trắng ảnh). 18 chủ đề còn lại không thay đổi. Hình AI chỉ là minh họa, không phải ảnh chụp thực tế.

## QA

Sau khi cài, kiểm tra đường dẫn ảnh GitHub Pages, ví dụ: `/images/culture-v23-ai/am-thuc/01.webp`. Mở trang Văn hóa với Ctrl + F5 để làm mới cache. Không tính lần cài đặt mã nạp hình là ảnh đã phát hành.
