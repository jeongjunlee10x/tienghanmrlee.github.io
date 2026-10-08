# Kiểm thử thủ công sau triển khai

| Trường hợp | Kỳ vọng |
|---|---|
| Mở `index.html` khi chưa đăng nhập | Truy cập được trang chủ |
| Mở `so-cap-1.html` khi chưa đăng nhập | Chuyển tới `dang-nhap.html?next=so-cap-1.html` |
| Bấm TOPIK trên trang chủ | Đi qua `thi-topik-online.html`, yêu cầu tài khoản trước |
| Tạo tài khoản mới chưa xác minh email | Chưa vào được trang học |
| Xác minh email rồi bấm Tôi đã xác minh | Mở được trang học |
| Mở `noi-dung-bao-mat.html` sau khi có doc Firestore | Đọc được nội dung mẫu |
| Tài khoản chưa xác minh dùng Firestore SDK đọc `secureLessons/*` | PERMISSION_DENIED |
| Học viên A dùng SDK đọc `users/B/notes/main` | PERMISSION_DENIED |
| Học viên A tự ghi `examResults/A/attempts/anything` | PERMISSION_DENIED |
| Email đã xác minh lưu và đọc `users/A/notes/main` | Hoạt động |
| Firestore không cấu hình / mất mạng | Dữ liệu không bị hiển thị từ Firestore |

Kiểm thử chính xác Security Rules nên dùng Firestore Rules Playground / Firebase Emulator, xem https://firebase.google.com/docs/firestore/security/test-rules-emulator.

Lưu ý kiểm thử hành vi giao diện trên phiên bản local không có nghĩa quy tắc Firebase đã được triển khai. Quy tắc chỉ hiệu lực trên Firebase sau khi xuất bản.
