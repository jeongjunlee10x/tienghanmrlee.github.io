# MR LEE — nâng cấp âm thanh và hình ảnh 08/11/2026

## Kết quả kiểm toán trực tiếp

Nguồn: GitHub Actions PR #63, workflow `MR LEE - Media integrity and audio/image quality`.

- **14.454 MP3** được kiểm tra header; **0** file định dạng bị lỗi ở mức kiểm tra chữ ký.
- **888 ảnh** thuộc các thư mục phát hành (không tính thư mục archive) được quét; **0** header ảnh hỏng.
- **33 ảnh > 450 KB** cần xem danh sách trong artifact `artifacts/media-integrity/report.json`.
- **62** trường hợp trùng nhị phân, không xóa tự động vì có thể nhiều mục dẫn tới cùng hình.
- **0** ảnh hero/cover bị đánh dấu dưới ngưỡng kích thước quy định bởi bộ kiểm tra hiện hành; không có nghĩa tất cả ảnh đều sắc nét về mặt thẩm mỹ.
- **24/24 MP3** trong trang `topik-nghe-24-cau.html` có mặt và lớn hơn 1000 byte.

> Kiểm tra chữ ký và kích thước KHÔNG xác nhận âm thanh không nhiễu, cắt chữ, phân vai chính xác ở mọi clip hay ảnh đúng nội dung từng bài. Cần nghe và xem mẫu bằng người trước khi ghi đè media.

## Nội dung đã sửa ở PR #63

1. Công cụ `tools/mrlee-audio-v1.py` tạo **giọng Hàn +0%** khi dựng mới và có tùy chọn `--strict-exam` cho đoạn nghe đánh số theo nhịp chuẩn.
2. `mrlee-listening-plus.js` loại nhãn vai `남자:/여자:` khỏi phần TTS trình duyệt; giao diện tải lỗi và chờ âm thanh rõ ràng hơn.
3. `assets/branding/media-quality-v3.js` được kích hoạt trong 7 trang quan trọng. Trang chủ ưu tiên hero theo theme đang chọn, không đổi logo và bố cục.
4. Bộ `tools/audit-media-integrity.mjs`, `tools/test-media-browser.mjs` và GitHub Actions kiểm thử cả file và script, lưu artifact JSON.

## Kế hoạch thay thế file media nhị phân — theo từng đợt

**A. Âm thanh, không thay thế hàng loạt ngay**

- Chọn từng nhóm có mapping CSV rõ ràng: Sơ cấp 1 → Sơ cấp 2 → giao tiếp → TOPIK.
- Nghe trực tiếp mẫu tiếng Hàn nam/nữ và phát hiện clipping, âm lượng lệch, quá nhanh/chậm.
- Gói đề nghe đúng nhịp 3s / 3s / 0,5s / 4s, lời `다시 들으십시오.`, giọng đọc +0%. Phần mở đầu song ngữ Hàn–Việt nằm ở **đề hoàn chỉnh**, không trộn vào từng file câu.
- Chỉ ghép/ghi đè file sau khi đối chiếu đáp án và người duyệt nghe thử. Backup SHA và đường dẫn cũ để rollback.

**B. Hình ảnh, chỉ tối ưu sau khi đối chiếu**

- Phân nhóm 33 ảnh nặng: logo, hero, địa danh, trường học, gallery văn hóa; logo và ảnh chứa chữ không nén lossy máy móc.
- Đề xuất tạo ảnh responsive 640/960/1440 px bằng WebP cho hero và thẻ lớn; bản gốc giữ nguyên, khung hình và nhân vật không bị crop.
- Thẩm định 62 trường hợp trùng: trùng nhị phân không nhất thiết là lỗi vì có thể là thumbnail/ảnh dùng trong hai bài.
- Kiểm ảnh theo 22 chủ đề văn hóa, mỗi chủ đề đúng 4–5 ảnh minh họa và chú thích/credit. Không tự lấy ảnh từ nguồn chưa rõ quyền sử dụng.

**C. Điều kiện xuất bản**

- PR CI media PASS, build Cloudflare PASS, kiểm thử hai theme trên mobile/desktop.
- Mẫu nghe có đủ tiếng và vai, không đọc nhãn nam/nữ, không sai nhịp, không trùng nội dung.
- Sau khi merge cần kiểm tra Cloudflare Production cùng Safari/Chrome, đặc biệt micro và MP3 trên iOS.
- Giữ nguyên URL cũ hoặc bổ sung redirect/manifests tương ứng. Không để lộ dữ liệu học viên.

## Lưu ý kiểm thử khác

Hai workflow cũ `MRLEE V31 QA` và `MR LEE NEXT` báo các lỗi về thiếu module gallery/brand ở một số trang. Các vấn đề này không xuất phát từ chữ ký media; cần theo dõi ở PR UI riêng, tránh can thiệp quá phạm vi PR #63.
