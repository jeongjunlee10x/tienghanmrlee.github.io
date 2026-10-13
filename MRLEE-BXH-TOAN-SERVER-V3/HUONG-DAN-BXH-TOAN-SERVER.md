# Nâng cấp bảng xếp hạng toàn server MR LEE — V3

Bản này được làm theo mã nguồn trong ZIP thầy gửi ngày 10/10/2026. Đây là gói nâng cấp; không cần thay toàn bộ website.

## Kết quả sau khi cài đầy đủ

- Trang `bang-xep-hang.html` công khai, xem được khi chưa đăng nhập.
- Mọi học viên **đã có ví điểm trên Firestore** đều được đưa vào bảng, không cần bấm tham gia, kể cả học viên đang offline sau bước đồng bộ dữ liệu cũ.
- Xếp điểm cao xuống thấp; hiển thị thứ hạng bằng số, tên và điểm. Bằng điểm cùng hạng: 1, 1, 3. Người bằng điểm được sắp ổn định theo mã tài khoản.
- Tìm tên có/không dấu; 50 người mỗi trang; thứ hạng giữ nguyên khi tìm kiếm. Khung bên phải hiển thị 10 người đầu và liên kết đến toàn bộ danh sách.
- Tự cập nhật khi ví điểm hoặc tên hồ sơ đổi, có thể trễ vài giây. Tài khoản mới chưa có ví điểm chưa xuất hiện; học/điểm danh để tạo ví theo cơ chế hiện có.
- Điểm là `users/{uid}/studyPoints/wallet.balance`, bao gồm điểm ban đầu và các loại thưởng hiện có. Không đổi công thức cộng điểm, không đặt trần điểm, không cộng thêm khi đồng bộ.
- Tên lấy từ `users/{uid}.displayName`, nếu thiếu dùng biệt danh cũ, rồi tên dự phòng. Công khai tên, điểm, streak; không chép email, sổ tay hoặc lịch sử làm bài. Mã tài khoản vẫn là ID bản ghi công khai.

## 1. Cài tệp vào website

Giải nén toàn bộ ZIP thành một thư mục. Trong VS Code, mở Terminal tại thư mục website chứa `index.html`. Chạy (đổi đường dẫn đến file vừa giải nén):

```powershell
powershell -ExecutionPolicy Bypass -File "C:\duong-dan\MRLEE-BXH-TOAN-SERVER-V3\CAI-BXH-TOAN-SERVER.ps1" -WebsitePath "."
```

Bộ cài sao lưu các tệp bị thay bên ngoài thư mục website, cập nhật giao diện và thêm mã server. Thông báo SUCCESS chỉ có nghĩa cài tệp thành công, chưa phải server đã chạy.

## 2. Mở quyền xem bảng chung

Vào Firebase Console → dự án `tieng-han-mr-lee` → Firestore Database → Rules. Sao lưu nội dung đang chạy. Mở `FIRESTORE-BXH-TOAN-SERVER.txt` ở thư mục website và chèn khối `match /mrleePublicLeaderboard/{uid}` bên trong `match /databases/{database}/documents { ... }`, rồi Publish.

**Giữ nguyên Rules hiện tại. Không dán fragment thay toàn bộ Rules. Không deploy `firestore.rules` cũ trong ZIP:** file đó thiếu nhiều quyền ví điểm và bài học mà các bản Rules nâng cấp khác có. Bộ cài không ghi đè Rules hay `firebase.json`.

Nếu hiện có quy tắc rộng `allow write: if true` hoặc cho phép mọi người ghi mọi đường dẫn, cần bỏ quyền rộng đó: một câu `allow ...: if false` riêng không phủ định quyền được cho phép ở nơi khác.

## 3. Triển khai đồng bộ server (bắt buộc)

Cần quyền quản trị dự án Firebase, Node.js 22 và Firebase CLI. Cloud Functions cần dự án dùng gói Blaze; chi phí theo sử dụng. Không có thao tác tự bật thanh toán trong bộ cài. Chỉ tiếp tục bước triển khai khi thầy chấp nhận dùng gói này.

Trong Terminal tại thư mục website:

```powershell
npm install -g firebase-tools
firebase login
npm --prefix leaderboard-functions ci
firebase deploy --config firebase.leaderboard.json --project tieng-han-mr-lee --only functions:mrlee-rankings
```

Dừng nếu có lệnh báo lỗi. Cấu hình riêng chỉ triển khai codebase `mrlee-rankings`, không triển khai hosting hoặc Rules cũ. Hai hàm được tạo: `mrleeWalletRanking`, `mrleeProfileRanking`. Mặc định vùng `asia-southeast1`; nếu cơ sở dữ liệu ở vùng khác, cân nhắc chọn vùng Functions gần Firestore trước lần triển khai đầu.

## 4. Đưa điểm cũ lên bảng chung một lần

Bước này chỉ tạo/cập nhật bản sao công khai, không sửa ví điểm. Phải chạy sau khi Functions triển khai thành công. Cần Google Cloud CLI và tài khoản quản trị có quyền đọc/ghi Firestore. `firebase login` không thay thế bước xác thực Admin SDK này.

```powershell
gcloud auth application-default login
gcloud auth application-default set-quota-project tieng-han-mr-lee
node leaderboard-functions/backfill.cjs --apply
```

Phải thấy `DONE`. Nếu lỗi quyền hoặc mạng, khắc phục rồi chạy lại: thao tác có thể lặp lại, không cộng điểm trùng. Không đưa khóa quản trị lên GitHub hoặc gửi vào hội thoại. Bộ đồng bộ đọc cả ví có tài liệu cha không tồn tại, xử lý từng trang 200 bản ghi, và dọn bản xếp hạng không còn ví.

## 5. Đẩy giao diện lên GitHub

Kiểm tra các tệp thay đổi rồi chạy tại thư mục website:

```powershell
git status --short
git add -- bang-xep-hang.html mrlee-leaderboard.js mrlee-leaderboard.css mrlee-ranking-utils.mjs
```

Dùng `git add -- ten-trang.html` cho từng trang HTML hiện có mà bộ cài đã đổi tham số phiên bản (như `index.html`, `so-cap-1.html`, `so-cap-2.html`, `lo-trinh-1-6.html`). Không dùng `git add .` khi có dữ liệu/khóa quản trị chưa kiểm tra. Mã `leaderboard-functions` chỉ cần cho triển khai Firebase, không cần xuất bản lên GitHub Pages.

```powershell
git diff --cached --stat
git commit -m "Add public server-wide leaderboard"
git push origin main
```

Đợi GitHub Pages cập nhật rồi mở `bang-xep-hang.html` trên website, hoặc bấm “Xem tất cả học viên” ở khung xếp hạng. Dùng Ctrl+F5 nếu trình duyệt vẫn giữ bản cũ.

## 6. Kiểm tra bằng tài khoản thật

1. Cửa sổ ẩn danh chưa đăng nhập vẫn xem được bảng.
2. Tên và điểm của ít nhất hai học viên khớp ví trên Firebase.
3. Học viên nhận điểm ở trang khác, bảng đang mở cập nhật sau vài giây.
4. Học viên offline có ví vẫn hiện sau backfill; tìm tên không đổi hạng.
5. Trình duyệt không được tự ghi/sửa/xóa `mrleePublicLeaderboard`.
6. Kiểm tra học bài, điểm danh, sổ tay và lịch sử vẫn hoạt động vì giữ Rules cũ.

## Phạm vi kiểm thử và giới hạn

Đã có kiểm thử tự động logic đồng hạng, tìm kiếm, đồng bộ không đổi điểm, xử lý sự kiện lặp, xóa ví, và giao diện bằng dữ liệu giả lập. Xem `KET-QUA-KIEM-TRA.txt` trong gói. Chưa triển khai hoặc kiểm thử trên Firebase của thầy; chưa chạy bộ cài trên Windows PowerShell thực.

Giao diện nhận toàn bộ danh sách công khai để tính thứ hạng và tìm kiếm chính xác, chỉ phân trang phần hiển thị. Phù hợp hệ thống lớp học; khi số học viên rất lớn cần phân trang/tổng hợp thứ hạng phía server để giảm lượt đọc. Đây vẫn là điểm luyện tập theo cơ chế hiện tại; đồng bộ trên server không xác thực được việc học thật ở trình duyệt.

## Khôi phục

Khôi phục các tệp cũ từ thư mục `MRLEE-BACKUP-BXH-...` mà bộ cài in ra; `manifest.json` ghi tệp nào đã có trước. Xóa các tệp mới có `Existed: false` nếu cần gỡ nâng cấp. Nếu đã push, commit và push bản khôi phục. Việc khôi phục giao diện không tự xóa Functions: có thể giữ server để không mất đồng bộ, hoặc gỡ hai hàm trong Firebase Console khi quyết định ngừng tính năng. Không xóa ví điểm.

Tài liệu Firebase:
- https://firebase.google.com/docs/functions/get-started
- https://firebase.google.com/docs/functions/firestore-events
- https://firebase.google.com/docs/admin/setup
