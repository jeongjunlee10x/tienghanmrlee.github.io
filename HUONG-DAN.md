# Tiếng Hàn Mr Lee — TOPIK I / TOPIK II, 12 kỳ (24 phòng luyện)

## Đã làm
- Trang `de-thi-topik.html`: 2 danh mục TOPIK I và II; 12 kỳ mỗi danh mục (35, 36, 37, 41, 47, 52, 60, 64, 83, 91, 96, 102).
- Trang `topik-luyen-de.html`: đồng hồ 100/180 phút; phiếu 4 lựa chọn cho toàn bộ câu nghe, đọc; ô soạn bài Viết cho TOPIK II; tự động nộp khi hết giờ; giữ tiến độ tại trình duyệt.
- Link tới trang nguồn tài liệu cho cả 12 kỳ; kỳ 35 có thêm liên kết trực tiếp tới bản PDF câu hỏi.
- **Chỉ kỳ 35** đã có khóa chấm điểm thực từ tài liệu được đối chiếu: TOPIK I 200 điểm, TOPIK II nghe + đọc 200 điểm. Phần Viết TOPIK II chưa chấm tự động.
- Các kỳ khác: đã có phòng luyện và đồng hồ nhưng KHÔNG giả lập đáp án, KHÔNG hiện điểm tự động.
- Khi chấm phần trắc nghiệm kỳ 35, phát sự kiện tích hợp với `learning-tracker.js` đã có sẵn, để ghi kết quả luyện tập theo tài khoản nếu Firebase Rules cho phép. Lịch sử lưu **số câu đúng**, còn điểm theo thang TOPIK hiển thị trên trang.

## Các file
- `de-thi-topik.html`
- `topik-luyen-de.html`
- `topik-bank.js`
- `mrlee-topik.js`
- `mrlee-topik.css`

## Cài đặt
1. Sao lưu `de-thi-topik.html` đang có.
2. Chép 5 file này vào **cùng thư mục** với `index.html`, `auth-guard.js`, `firebase-config.js` và `learning-tracker.js`.
3. Không sửa hoặc thay `thi-topik-online.html` (nút dẫn đến website TOPIK chính thức, chức năng riêng).
4. Chạy `git add de-thi-topik.html topik-luyen-de.html topik-bank.js mrlee-topik.js mrlee-topik.css`, commit và push.
5. Mở `.../de-thi-topik.html`. Đăng nhập và xác minh email trước khi truy cập nếu website đang bảo vệ quyền bằng `auth-guard.js`.

## Hoàn thành 22 đề còn lại như thế nào?
Cần đối chiếu **đúng phiên bản đề – đáp án – số điểm từng câu** của mỗi kỳ. Chèn các cặp `[đáp án, điểm]` vào `VERIFIED_KEYS` của `topik-bank.js`, ví dụ khóa `I-36`, `II-36` v.v. KHÔNG dùng bảng đáp án khác kỳ, khác loại đề. Kiểm tra mỗi phần đủ số câu và tổng điểm đúng 100.

*Bản này liên kết đến nguồn tài liệu, không chép lại câu hỏi/audio của bên thứ ba. Nếu muốn mọi câu hỏi và audio nằm ngay trên website, cần có bộ đề hợp pháp/được phép sử dụng và chuyển nội dung thành dữ liệu có cấu trúc.*

## Giới hạn cần biết
- TOPIK II Viết là bài tự luận nên chưa có chấm AI/giám khảo. Không xếp cấp 3–6 từ 200 điểm trắc nghiệm.
- Kết quả gửi từ trình duyệt chỉ là **luyện tập**, không chống gian lận. Không được coi là điểm TOPIK chính thức.
- GitHub Pages công khai HTML/JS, Firebase guard chỉ kiểm soát giao diện; đáp án trong JS không phải bí mật an toàn.
- Đồng hồ luyện đề chạy liên tục theo tổng phút, không mô phỏng thời gian nghỉ giữa hai ca TOPIK II.
- Tự động lưu đáp án vào trình duyệt này, không đồng bộ phiếu trả lời qua nhiều thiết bị.
- Link bên ngoài có thể thay đổi; kiểm tra định kỳ.
