# MR LEE V3.0 — Giai đoạn 2, Đợt 2: Trình chiếu 45 slide văn hóa

Ngày 21/11/2026. Base nhánh `main` đã bao gồm PR #79.

## Mục tiêu

Đưa khung trình chiếu của các chủ đề Văn hóa & Kỹ năng sống về tỷ lệ gần 16:9 trên desktop/máy chiếu; trên mobile ưu tiên bố cục thích nghi chiều cao viewport để nội dung không bị nén quá nhỏ. Giữ nguyên 45 slide × 60 phút của mỗi chủ đề, nội dung đã duyệt, điểm, tài khoản và liên kết ảnh gốc.

## Đã thay đổi

1. `assets/culture-lesson-v1.js`: Dialog trình chiếu dùng khung 16:9 desktop (có giới hạn 90dvh và 96vw); trên điện thoại <=720px sử dụng gần toàn bộ khung màn hình, có vùng nội dung cuộn riêng.
2. Nút trước/sau/đóng/toàn màn hình có vùng chạm tối thiểu 44px; cỡ chữ tiêu đề, khoảng đệm thích nghi mobile; ảnh bìa vẫn `object-fit:contain` để không bị méo/cắt.
3. Ảnh lớn ở slide hiện hành được ưu tiên `loading=eager` và `fetchpriority=high` (ảnh thư viện còn lại được tải lười). Giữ nguyên WebP/JPG và ảnh gốc.
4. `van-hoa-bai-hoc.html`: thay cache key script để người xem nhận mã trình chiếu V3 mới.
5. `tools/browser-v3-culture-slides.mjs`: mở bài `xe-buyt` và `tau-dien-ngam` với `mode=slides`; đo kích thước khung, ảnh, chức năng Next/Previous, phím trái/phải, slide 45/45 và nút đóng; 4 viewport × 2 theme (8 tình huống).
6. `.github/workflows/mrlee-v3-culture-slide-qa.yml`: đưa kiểm thử Chromium vào cổng PR, lưu ảnh chụp minh chứng.

## Tiêu chí nghiệm thu

- Các workflow có liên quan phải thành công trên commit cuối cùng của PR, không chỉ trên commit trung gian.
- Không hủy/đổi dữ liệu bài học, tiêu đề, ảnh gốc, bộ câu hỏi, điểm thưởng hoặc Firebase/Supabase.
- Desktop tỷ lệ 16:9 trong sai số trình duyệt, mobile không tràn khung, ảnh tải được và không chồng lên chữ.
- Trình chiếu mở đúng slide 1/45 và 45/45; điều hướng nút/bàn phím, đóng modal đúng.
- Sau merge cần kiểm tra Cloudflare production riêng; việc CI thành công chưa chứng minh production đã triển khai hoặc ảnh luôn tải nhanh trên mạng thực.

## Giới hạn

Đây là cải thiện **khung trình chiếu văn hóa**, không tự động nâng cấp 40–50 slide cho mọi môn khác. Chưa đo thực tế LCP/INP trên Cloudflare; không đưa tuyên bố cải thiện hiệu năng khi chưa có số liệu.
