# MR LEE V3.0 — Giai đoạn 3, Đợt 3: Kiểm toán sư phạm TOPIK

**Ngày:** 22/11/2026  
**Base:** `main` tại `42438558cd56570cf295c063f1390701a4ffd76f`

## Vấn đề được xác nhận từ nội dung thật

1. **5 câu nghe tiền tệ** `v8-1-l-018` đến `022`: lời giải cũ chỉ nhắc “Tổng tiền được nói sau từ 모두”, không ghi rõ số tiền và không giải thích điểm gây nhiễu “tổng giá / đơn giá”. Đã thay bằng lời giải song ngữ dựa trực tiếp trên câu nghe, nêu đúng `오천 원`, `삼천 원`, `팔천 원`, `천 원`, `육천 원`.
2. **4 câu hỏi địa điểm** `v8-1-l-023` đến `026`: lời giải cũ hướng dẫn tìm nơi đến “ngay sau 에 가요”, **sai thứ tự từ tiếng Hàn**. Đã sửa: địa điểm `우체국`, `은행`, `약국`, `서점` đứng **trước** trợ từ `에`; giải thích dùng thêm hành động trong hội thoại để đối chiếu đáp án.
3. **Bài V9 ngày 1 (TOPIK I)**: ở câu `v9-1-1-v` hỏi nghĩa của `시험`, phương án nhiễu “đáp án đúng” dễ bị đọc như nhãn meta hơn là một nghĩa độc lập. Thay bằng “luyện tập”, vốn thuộc nhóm từ vựng cùng ngày. **Đáp án vẫn là “kỳ thi” ở chỉ số 2**.

## Bảo toàn dữ liệu

- Sửa đồng bộ `assets/topik-v8/bank.json` và `assets/topik-v10/mock-bank-v8.json` cho **9 lời giải**, cả hai ngân hàng vẫn phản chiếu chính xác 170 câu.
- Không thay `id`, `level`, `kind`, `passage`, `prompt`, `choices`, `answer`, `difficulty` hoặc nguồn của 170 câu V8/V10.
- V9 giữ nguyên 90 bài, 180 bài tập và toàn bộ chỉ số đáp án. Chỉ thay một phương án gây nhiễu trong một câu.
- Không sửa dữ liệu học viên, file MP3, backend Firebase/Supabase hoặc cơ chế điểm Spark.
- **Không sửa/đọc đánh giá chuyên môn toàn bộ curriculum V10 2,9 MB** trong đợt này; nội dung đó cần audit riêng.

## Kiểm thử PR bắt buộc

`tools/audit-topik-pedagogy-v3.mjs` xác minh:
- 170 câu ở cả hai bản V8/V10 giống hệt nhau; 70 câu TOPIK I, 100 câu TOPIK II;
- 90 bài V9 (30/60) và 180 bài tập, ID duy nhất, bốn phương án không trùng, chỉ số đáp án hợp lệ;
- 9/9 câu nghe đã sửa: phương án đúng xuất hiện trong chính đoạn nghe, lời giải có dẫn chứng tiếng Hàn–Việt và không còn hướng dẫn thứ tự từ sai;
- câu `시험` có nghĩa “kỳ thi” và phương án nhiễu đã được thay;
- xuất artifact `mrlee-v3-topik-pedagogy-report` để giáo viên xem.

## Vấn đề cần giáo viên duyệt tiếp

Báo cáo phát hiện **31 cặp bài tập V9 trùng cả nội dung câu hỏi và lời giải** ở các ngày khác nhau, nhiều ví dụ ở ngày 1–30 và 31–60 TOPIK II. Có thể là chủ đích ôn tập giãn cách hoặc lặp ngoài kế hoạch. **Không xóa hay tự sinh câu thay thế** khi chưa xem vai trò của chúng trong lộ trình 30/60 ngày.

Đề xuất rubric kiểm toán tiếp theo: phù hợp trình độ TOPIK, độ tự nhiên câu Hàn, tính hợp lệ và sức phân loại của phương án nhiễu, sự tương ứng MP3–transcript, lời giải đủ lý do chọn/loại. Tách lỗi chắc chắn và khuyến nghị cần thẩm định, không tuyên bố toàn bộ ngân hàng đã đạt chuẩn chuyên gia chỉ vì QA kỹ thuật thành công.

## Cổng triển khai

Tạo PR riêng, đợi GitHub Actions trên đúng commit cuối thành công, kiểm tra diff không xóa tệp. Chỉ sau merge mới đối chiếu GitHub Pages; Cloudflare production được xác minh độc lập.
