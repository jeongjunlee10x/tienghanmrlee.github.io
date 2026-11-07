# TIẾNG HÀN MR LEE — Ứng dụng Windows (.exe)

Ứng dụng desktop sử dụng **Electron** và mở website đang hoạt động:
https://mrlee-b6a.pages.dev/

Đây là bản **online**, không phải bản sao website hoạt động ngoại tuyến. Chọn cách này để giữ nguyên giao diện, nội dung, âm thanh, tài khoản, điểm học tập, TOPIK, game và backend hiện có; tránh đóng gói hàng chục nghìn tệp MP3 và tạo một cơ sở dữ liệu riêng.

## Tạo ứng dụng Windows miễn phí bằng GitHub Actions

1. Mở mục **Actions** của repository GitHub và chọn workflow **MR LEE Windows EXE**.
2. Khi PR được tạo, workflow tự chạy với các thay đổi trong `desktop/`. Hoặc sau khi hợp nhất lên `main`, chọn **Run workflow** để chủ động tạo lại bản EXE.
3. Mở workflow run thành công → **Artifacts** → tải `MR-LEE-Windows-EXE.zip`, giải nén trên Windows.
4. Có hai loại tệp .exe:
   - **Setup**: trình cài đặt MR LEE có shortcut ngoài Desktop/Start Menu.
   - **Portable**: chạy trực tiếp, không cần cài đặt.

Build chạy trên `windows-latest`, không thay đổi Cloudflare Pages, GitHub Pages, Supabase hoặc Firebase, và không tự phát hành bản exe lên Internet.

## Chạy thử trực tiếp trên máy Windows có Node.js

```powershell
cd desktop
python -m pip install Pillow==12.0.0
python tools/make_icon.py ../assets/branding/logo-mrlee.png build
npm install
npm test
npm start
npm run build:win
```

Ứng dụng lưu phiên đăng nhập trong vùng dữ liệu người dùng của Electron. Nội dung website tự cập nhật theo bản Cloudflare đang hoạt động; **thay đổi mã ứng dụng desktop** thì phải xây dựng bản EXE mới. Hai nguồn dữ liệu không bị sao chép hoặc đồng bộ tách biệt.

## Bảo mật

- Mọi trang MR LEE tải từ đúng `https://mrlee-b6a.pages.dev/`.
- Chặn `file:`, `http:`, `javascript:`, hostname giả mạo; liên kết HTTPS ngoài website sẽ mở trong trình duyệt mặc định.
- Tắt Node integration, không dùng preload đặc quyền, bật context isolation/sandbox/web security.
- Microphone chỉ được cho phép nếu chính website MR LEE yêu cầu ghi âm luyện nói; không cho phép camera.
- Không có token, service account hoặc secret backend trong EXE.
- Bản build miễn phí **chưa ký mã (code signing)** nên Windows SmartScreen có thể cảnh báo. Nếu phát hành cho học viên rộng rãi, nên ký mã và kiểm thử trên Windows trước.

## Giới hạn cần kiểm tra thực tế

- Yêu cầu Internet. Khi không kết nối được, app hiển thị trang thử lại thay vì các bài học ngoại tuyến.
- Đăng nhập bằng email/mật khẩu dự kiến giữ nguyên nhờ website có cùng origin. Nếu dùng Google/Facebook OAuth hoặc các popup từ domain khác, cần kiểm thử/cấu hình riêng; popup bên ngoài hiện được chuyển sang trình duyệt mặc định.
- Hãy nghiệm thu: Đăng nhập, Admin, TOPIK, MP3 nghe, phát âm bằng micro, Workbook, bảng xếp hạng/điểm, Game Zone và fullscreen.
- Tệp .exe chưa được chứng nhận tương thích/kiểm thử thủ công trên Windows; bước build trong Actions là điều kiện trước khi phát hành.

## Phạm vi thay đổi

Toàn bộ mã ứng dụng nằm ở `desktop/`. Bản xuất tĩnh Cloudflare bỏ qua thư mục này. Website và backend đang dùng không phải di chuyển hay chỉnh sửa dữ liệu.
