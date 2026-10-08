# TIẾNG HÀN MR LEE — LƯU ĐIỂM VÀ LỊCH SỬ HỌC TẬP

## 1. Chức năng

- Tự lưu điểm sau khi nộp bài `kiem-tra-dau-vao.html` (Sơ cấp 1, Sơ cấp 2, Trung cấp 1, mỗi đề 50 câu).
- Lưu điểm bài mẫu 2 câu trong `kiem-tra-online.html`.
- Lưu kết quả bài tập Bài 1 trong `so-cap-1.html` (nếu trang vẫn sử dụng mẫu bài tập hiện tại).
- Ghi nhận trang học được mở, bài học `#bai-1` đến `#bai-15`, tương tác phỏng vấn và giao tiếp.
- Trang riêng `lich-su-hoc-tap.html`: tối đa 60 lần kiểm tra và 100 hoạt động gần đây, theo UID Firebase.
- Không đưa họ tên/ngày sinh vào Firestore history; tài khoản đăng nhập dùng để xác định UID.
- Không sửa nội dung bộ đề hoặc layout hiện có. Không ghi lại lịch sử của các lượt học trước khi cài.

## 2. Cài đặt trong VS Code (Windows)

Giải nén ZIP. Sao chép 5 file vào cùng thư mục với `index.html`:

```
learning-tracker.js
learning-history.js
lich-su-hoc-tap.html
firestore.rules
CAI-LICH-SU-HOC-TAP.ps1
```

File `firestore.rules` mới thay file cùng tên cũ; bản mới giữ quy tắc cũ và bổ sung hai collection cá nhân.
Không thay `firebase-config.js`, `auth-firebase.js`, `auth-guard.js` hay `index.html` từ các gói cũ.

Chạy tại Terminal VS Code:

```powershell
powershell -ExecutionPolicy Bypass -File .\CAI-LICH-SU-HOC-TAP.ps1
```

Script tự động thêm mã ghi lịch sử vào các trang học và mã bắt sự kiện chấm điểm vào những trang mẫu hiện tại. Script tạo backup `.mrlee-backup-history/` và tránh chèn trùng khi chạy lại.

## 3. BẮT BUỘC xuất bản Firestore Rules mới

Vào: https://console.firebase.google.com/project/tieng-han-mr-lee/firestore

Chọn **Firestore Database → Rules**. Mở `firestore.rules` mới trong VS Code, copy toàn bộ và dán vào khung Rules, rồi nhấn **Publish**.

Nếu trước đây bạn đã chỉnh Rules thủ công (quyền admin, nhóm lớp...), hãy SO SÁNH và GỘP các quy tắc trước khi xuất bản, không ghi đè mù quáng.

Đường dẫn dữ liệu mới:

```
users/{uid}/learningEvents/{eventId}
users/{uid}/practiceAttempts/{attemptId}
```

Chỉ chủ tài khoản **đã xác minh email** có quyền đọc/ghi đúng dữ liệu của mình, số lượt đọc có giới hạn; người học không thể sửa/xóa bản ghi đã tạo từ Web SDK.

**Quan trọng:** học viên vẫn có thể giả mạo điểm LUYỆN TẬP bằng cách sửa mã trình duyệt và ghi bản ghi mới hợp lệ. `examResults` (điểm chính thức) vẫn chặn mọi ghi từ trình duyệt. Muốn xác nhận điểm thi thật cần backend đáng tin cậy để quản lý câu hỏi/chấm điểm.

## 4. Đẩy file mới lên GitHub

```powershell
git add .
git commit -m "Save student practice scores and study history"
git push origin main
```

Mở:
https://jeongjunlee10x.github.io/tienghanmrlee.github.io/lich-su-hoc-tap.html

**Cần tải lại trang `Ctrl+F5`**, đăng nhập và xác minh email.

## 5. Kiểm tra 2 tài khoản

1. Học viên A đăng nhập, nộp một bài 50 câu; kết quả hiện thông báo **Đã lưu điểm luyện tập**.
2. Mở `Lịch sử học tập` — thấy bài vừa nộp. Mở bài Sơ cấp 1, chọn `Bài 3`, quay về lịch sử để kiểm tra.
3. Đăng xuất; đăng nhập bằng học viên B, lịch sử phải khác hoặc rỗng. Không thể đọc trực tiếp `/users/UID_A/...` với tài khoản B vì Rules kiểm tra UID.
4. Trong Firebase Console → Firestore Database → Data, bạn (quản trị dự án) có thể xem bản ghi theo UID.

Nếu nộp bài thấy thông báo **Chưa lưu được**: kiểm tra đã Publish Rules **mới**, mạng, xác minh email, các file JS trong repo và Console F12.

## 6. Hạn mức và quyền riêng tư

Firestore Spark miễn phí trong hạn mức. Mỗi lượt nộp tạo một bản ghi kết quả, mỗi hoạt động tạo một bản ghi lịch sử. Trang lịch sử lấy tối đa 60+100 bản ghi/lần; hãy theo dõi usage trong Firebase.

Đây là nhật ký học tập, không phải bằng chứng rằng học viên đã đọc hết bài hoặc hiểu nội dung. Danh sách yêu thích/đánh dấu đã học của giao tiếp và phỏng vấn hiện còn lưu trên thiết bị, chưa được đồng bộ dữ liệu đó giữa các thiết bị.
