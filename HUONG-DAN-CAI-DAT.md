# MR LEE – GÓI NÂNG CẤP TOÀN DIỆN 2026

## Mục tiêu và phạm vi

Nâng cấp giao diện, tốc độ tìm chức năng, khả năng đọc bài trên điện thoại và bảng tổng quan học viên. **Không** đụng đến dữ liệu Firebase, không sửa Firestore Security Rules, không thay kho 160 câu kiểm tra, không chuyển website khỏi GitHub Pages. Tất cả tính năng mới dùng trình duyệt và Firestore đã thiết lập, **không cần API AI trả phí**.

## 1. Lắp đặt (Windows/VS Code)

1. Trước hết sao lưu thư mục `C:\Users\Surface\Documents\tienghanmrlee.github.io` hoặc commit tất cả các thay đổi của bạn.
2. Mở file ZIP, **chép các file ở thư mục gốc trong ZIP** vào thư mục website, cùng cấp với `index.html`. **Đừng xóa file HTML/JS sẵn có.**
3. Trong VS Code, Terminal → New Terminal, chạy:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\CAI-NANG-CAP.ps1
   ```

4. Lệnh tự gắn `mrlee-core.css`, `mrlee-core.js` vào các trang HTML hiện có. Nó **không ghi đè `index.html`**, chỉ chèn hai thẻ tham chiếu. Nếu `mrlee-i18n.js` có sẵn, lệnh thêm thanh chọn 3 ngôn ngữ vào các trang còn thiếu (giao diện menu, không dịch nội dung học).
5. Chạy:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\KIEM-TRA-WEBSITE.ps1
   ```

6. Dùng **Live Server** (localhost HTTP, không mở `file://`) thử các trang. Nhấn Ctrl+K để kiểm tra tìm kiếm, mở trang học để xem nút lên đầu trang. Đăng nhập tài khoản đã xác minh email và mở `trung-tam-hoc-vien.html` để xem số liệu Firestore thật.
7. Chỉ khi mọi thứ hoạt động ổn, chạy:

   ```powershell
   git status
   git add .
   git commit -m "Upgrade Mr Lee site navigation and student dashboard"
   git push origin main
   ```

8. Mở `https://jeongjunlee10x.github.io/tienghanmrlee.github.io/` và `Ctrl + F5`.

## 2. Các chức năng mới

- **Tìm kiếm nhanh**: nút kính lúp ở góc, hoặc Ctrl+K/Cmd+K, lọc các chức năng theo tiếng Việt, Hàn, Anh.
- **Tiếp tục học**: mục vừa mở gần nhất, lưu *trên thiết bị* bằng localStorage; **không phải học xong bài**.
- **Trung tâm học viên**: trang `trung-tam-hoc-vien.html` xem điểm luyện tập và hoạt động của **đúng UID đang đăng nhập** từ Firestore, tổng hợp những bản ghi mới nhất.
- **Thanh tiến độ đọc** và nút quay về đầu trang.
- **Font Việt–Hàn–Anh** và hỗ trợ tập trung bàn phím, giao diện điện thoại.

## 3. Trạng thái 3 ngôn ngữ

Bộ mã dùng ngôn ngữ đã chọn trong `mrlee-i18n.js` (`mrlee-language`). Trang chủ có dịch giao diện; trang học chỉ dịch menu/tiện ích, **không tự động dịch câu hỏi hoặc bài học**, nhằm tránh sửa sai ngữ pháp, đáp án.

## 4. Điều kiện để trung tâm học viên có dữ liệu

Bạn phải đã cài `learning-tracker.js` trên các trang học/kiểm tra; `firebase-config.js` và `auth-firebase.js` đang hoạt động. Firestore Rules cần cho phép chủ sở hữu đọc `/users/{uid}/practiceAttempts` và `/users/{uid}/learningEvents`.

Nếu Firebase chưa có dữ liệu: trang hiển thị **0 hoặc chưa có lịch sử**, không tạo số liệu giả. Lượt đọc bị giới hạn ở 60 kết quả và 80 hoạt động mới nhất; các số đếm là số của bản ghi tải về, **không phải tổng số toàn thời gian**.

## 5. Bảo mật và điều cần tránh

- Không ghi API secret, token quản trị, password, service-account JSON lên GitHub. Firebase web config không phải quyền quản trị.
- Không đổi `firestore.rules` theo gói này; chính sách phải kiểm tra ở Firebase Console.
- Tất cả HTML trên GitHub Pages là file công khai; nút đăng nhập bảo vệ giao diện chứ không giấu file đã xuất bản.
- Điểm luyện tập ghi từ browser **có thể bị giả mạo**; không dùng để cấp chứng chỉ hoặc xếp loại chính thức.
- Công cụ tìm kiếm chạy tại trình duyệt, không ghi lịch sử tìm kiếm lên Firebase.
- Không tạo service worker lưu cache trang riêng tư, tránh cache nhầm dữ liệu cá nhân trên thiết bị chung.

## 6. Trở về bản cũ

Tệp HTML được sao lưu trong `.mrlee-backups/<ngày-giờ>/`. Muốn gỡ: khôi phục các file HTML từ thư mục sao lưu, sau đó xóa `mrlee-core.js`, `mrlee-core.css`, `mrlee-student.js`, `trung-tam-hoc-vien.html` nếu không còn dùng. Thư mục sao lưu đã được thêm vào `.gitignore` để không đẩy lên GitHub.

## 7. Những việc chưa được thực hiện

- Chưa kiểm tra trực tiếp repo GitHub hiện tại hoặc phiên đăng nhập Firebase của bạn.
- Chưa tích hợp chấm phát âm AI chuyên sâu hay chống gian lận máy chủ.
- Chưa triển khai trang Admin có quyền quản trị thực sự.
- Chưa đồng bộ dịch thuật đầy đủ từng bài học, câu hỏi và bài kiểm tra sang Anh/Hàn.
