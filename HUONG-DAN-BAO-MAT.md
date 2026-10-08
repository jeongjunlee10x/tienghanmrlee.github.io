# Hệ thống bảo mật Tiếng Hàn Mr Lee — Bản 2

Dự án Firebase: `tieng-han-mr-lee`. Website GitHub Pages: `https://jeongjunlee10x.github.io/tienghanmrlee.github.io/`.

## 1. Mức bảo vệ thực tế

- **Giao diện**: `auth-guard.js` yêu cầu Firebase Auth + email đã xác minh, cố ý ẩn giao diện khi xác minh thất bại.
- **Dữ liệu thực**: Firestore Rules bảo vệ dữ liệu trên máy chủ. Không học viên nào được sửa điểm thi qua SDK trình duyệt.
- **Tài liệu riêng**: chỉ những nội dung chuyển vào `secureLessons` của Firestore và KHÔNG sao chép tại thư mục GitHub Pages mới có phân quyền thực sự.
- **Không thể bảo vệ tuyệt đối**: mã HTML/JS, ảnh/PDF/ZIP nằm trong repository GitHub Pages công khai; nội dung trong Google Drive chia sẻ công khai; đề thi gửi cho học viên đọc vẫn có thể bị sao chép. Cổng JavaScript không thay thế backend.

## 2. Sao chép file vào VS Code

Giải nén ZIP. Sao chép các file trong cùng cấp với `index.html` vào:
`C:\Users\Surface\Documents\tienghanmrlee.github.io`

**Không thay `index.html` hiện tại**, bộ này dùng script cài đặt để giữ nguyên giao diện trang chủ của bạn.

Những file cần chép: `auth-guard.js`, `auth-status.js`, `auth-firebase.js`, `firebase-config.js`, `dang-nhap.html`, `thi-topik-online.html`, `noi-dung-bao-mat.html`, `secure-content.js`, `so-tay-rieng.html`, `secure-notes.js`, `CAI-BAO-MAT.ps1` và `firestore.rules`.

Trong VS Code → Terminal (PowerShell):

```powershell
powershell -ExecutionPolicy Bypass -File .\CAI-BAO-MAT.ps1
```

Lệnh tự thêm / cập nhật đoạn bảo vệ cho các trang HTML (trừ `index.html`, `dang-nhap.html`, `404.html`). Tạo bản sao gốc ở `.mrlee-backup` và tự ghi vào `.gitignore` để không đẩy bản sao lên mạng. Script có thể chạy lại sau khi thêm bài học.

## 3. Firebase Authentication

Trong Firebase Console → **Authentication → Sign-in method/Connection method**:
- Enable: `Email/Password`.
- Không cần Phone/SMS.

Trong **Authentication → Settings → Authorized domains**: thêm `jeongjunlee10x.github.io` (KHÔNG thêm `https://` và không thêm `/tienghanmrlee.github.io`).

Trong **Authentication → Settings → Password policy**: dùng tối thiểu **10 ký tự**, yêu cầu chữ hoa, chữ thường và số để khớp với biểu mẫu đăng ký; ký tự đặc biệt là tùy chọn. Khi thay đổi chính sách, đối chiếu yêu cầu hiển thị trên mẫu đăng ký.

Trong **Authentication → Settings → User actions**, kiểm tra **email enumeration protection** đã bật. Nên giới hạn đăng ký tự động nếu xuất hiện spam.

## 4. Firestore — phân quyền máy chủ (bắt buộc để bảo vệ dữ liệu)

1. Firebase Console → **Build / Databases and storage → Firestore Database**.
2. Bấm **Create database** nếu chưa có. Chọn vị trí, **Production mode** (khóa mặc định).
3. Vào tab **Rules**.
4. Dán **TOÀN BỘ** nội dung file `firestore.rules`, thay quy tắc đang có (chỉ làm vậy nếu bạn chưa xây dựng quy tắc riêng cần giữ).
5. Nhấn **Publish**.
6. Trên Firestore, **không bật quy tắc** `allow read, write: if true;` hoặc chỉ `request.auth != null` nếu có dữ liệu cá nhân.

### Phân quyền trong firestore.rules

| Đường dẫn | Đọc | Ghi |
|---|---|---|
| `users/{uid}` | Chủ tài khoản đã xác minh | Chỉ được chỉnh họ tên đúng định dạng |
| `users/{uid}/notes/{id}` | Chủ tài khoản đã xác minh | Chỉ chủ tài khoản, giới hạn 2.000 ký tự |
| `secureLessons/{id}` | Email đã xác minh | Chặn mọi ghi từ trình duyệt |
| `secureExams/{id}` | Email đã xác minh | Chặn mọi ghi từ trình duyệt |
| `examResults/{uid}/attempts/{id}` | Chủ tài khoản đã xác minh | Chặn ghi từ trình duyệt: điểm chính thức do backend ghi |
| Tất cả đường dẫn khác | Từ chối | Từ chối |

## 5. Thử nội dung được bảo vệ bằng Firestore

Trong Firestore → **Data → Start collection**:

- Collection ID: `secureLessons`
- Document ID: `sc1-bai-01`
- Tạo các trường String:
  - `title` = `Bài 1 – Giới thiệu`
  - `level` = `Sơ cấp 1`
  - `contentVi` = `Xin chào. Tôi là học viên.`
  - `contentKo` = `안녕하세요. 저는 학생입니다.`

Sau khi bấm **Save**: mở `noi-dung-bao-mat.html`, đăng nhập và nhập mã `sc1-bai-01`. Khi tài khoản chưa xác minh, Firestore sẽ từ chối đọc ngay cả nếu ai đó bỏ qua giao diện HTML.

## 6. Kiểm tra ghi chú riêng có phân quyền thật

Mở `so-tay-rieng.html`: ghi vài câu rồi nhấn **Lưu ghi chú**. Firestore lưu tại `users/<UID>/notes/main`. Đăng xuất, đăng nhập bằng tài khoản khác: sẽ không đọc được ghi chú UID cũ.

Đây là minh họa quản lý dữ liệu riêng thật sự; các bài học HTML cũ chỉ mới được bảo vệ ở giao diện.

## 7. Cập nhật GitHub

```powershell
git add .
git status
git commit -m "Add Firebase data security rules and verified login"
git push origin main
```

**Chú ý**: `git push` chỉ triển khai HTML/JS lên GitHub Pages; **không tự xuất bản Security Rules**. Phải nhấn **Publish** ở Firebase Console hoặc triển khai Rules bằng Firebase CLI (`firebase deploy --only firestore:rules`) sau khi kiểm tra dự án đúng.

## 8. Kiểm tra an ninh trước khi dùng thật

- Chưa đăng nhập → không sử dụng được trang học.
- Đăng nhập nhưng email chưa xác minh → không đọc được `secureLessons`.
- Email đã xác minh → đọc được `secureLessons`.
- Tài khoản A không đọc / sửa được `users/B/notes/main`.
- Không tài khoản học viên nào ghi được `examResults`.
- Dữ liệu nhạy cảm không chứa trong mã JS/HTML/PDF công khai.
- Mật khẩu không bao giờ đặt trong source, không lưu vào Firestore.
- Kiểm tra **App Check** sau khi mọi thứ chạy ổn định; App Check hỗ trợ chống lạm dụng nhưng không thay thế Security Rules. Không bật enforcement trước khi app đã đăng ký và thử kỹ.

## 9. Giới hạn phí

Firebase Authentication Email/Password và Cloud Firestore có hạn mức miễn phí trên Spark. Theo thay đổi hiện hành, **Cloud Storage for Firebase yêu cầu Blaze** (dù có hạn mức sử dụng miễn phí). File `storage.rules` là mẫu TÙY CHỌN cho tương lai, **không cần bật** để cài bản này. Không gửi SMS.

## 10. Điều cần tránh

- Không đẩy Service Account Key, tệp JSON khóa riêng, mật khẩu, dữ liệu học viên lên GitHub.
- Web `firebaseConfig` bình thường có thể hiển thị trên trang client; đó KHÔNG phải khóa quản trị.
- Không dựa vào JavaScript để quyết định tài khoản nào được ghi điểm: dùng backend và server-side authorization.
- Google Drive/PDF hiện đang chia sẻ công khai cần chuyển nơi lưu hoặc điều chỉnh quyền chia sẻ nếu muốn giới hạn truy cập.
- Nếu sử dụng dữ liệu học viên chưa thành niên, cần thông báo quyền riêng tư phù hợp và chỉ thu thập dữ liệu thật sự cần.
