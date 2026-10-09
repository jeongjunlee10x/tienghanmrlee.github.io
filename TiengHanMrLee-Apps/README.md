# Tiếng Hàn Mr Lee — ứng dụng trực tuyến

Website đã cấu hình: **https://tienghanmrlee.github.io/**

Gói này chứa **mã nguồn và quy trình tạo ứng dụng**, chưa chứa EXE/APK đã biên dịch.
Ngày chuẩn bị: 08/10/2026. Kiểm tra tại thời điểm này: địa chỉ website trả về HTTP 404 của GitHub Pages.
Môi trường soạn thảo không có .NET SDK/Android SDK và không tải được chúng, nên chưa chạy biên dịch hoặc kiểm thử trên thiết bị.

## 1. Bật website trước

1. Đăng nhập GitHub và mở kho **tienghanmrlee.github.io** của thầy.
2. Kiểm tra có file **index.html** ở thư mục gốc. Tên file phải đúng chữ thường.
3. Vào **Settings → Pages**.
4. Nếu website HTML/CSS/JavaScript tĩnh thông thường: chọn **Deploy from a branch**, chọn nhánh chứa website (thường là **main**) và thư mục **/(root)**, rồi **Save**.
5. Chờ tác vụ Pages hoàn tất, mở lại https://tienghanmrlee.github.io/ để kiểm tra.

Nếu website dùng một quy trình build riêng, chọn nguồn triển khai phù hợp với dự án đó. Khi website mở được bài học, ứng dụng sẽ dùng cùng nội dung.

## 2. Đưa bộ ứng dụng lên GitHub bằng VS Code

Tạo kho mới tên **tienghanmrlee-apps** cho bộ ứng dụng.

1. Giải nén ZIP, mở thư mục **TiengHanMrLee-Apps** bằng **File → Open Folder** trong VS Code.
2. Kiểm tra thấy `windows`, `android`, `README.md` và `.github/workflows/build-apps.yml` ngay trong thư mục đang mở.
3. Bấm **Ctrl+Shift+G → Initialize Repository**.
4. Stage tất cả tệp bằng dấu **+** cạnh Changes; nhập nội dung commit **Tao ung dung Mr Lee**, rồi **Commit**.
5. Chọn **Publish Branch / Publish to GitHub**, đăng nhập khi được yêu cầu, đặt tên kho **tienghanmrlee-apps**. Có thể chọn kho riêng tư; kiểm tra hạn mức Actions của tài khoản.

Nếu VS Code báo thiếu Git, cài Git từ https://git-scm.com/downloads rồi mở lại VS Code. Nếu báo thiếu tên/email tác giả, điền tên/email của thầy theo thông báo. Không cần nhập mật khẩu GitHub vào mã nguồn.

## 3. Tạo EXE và APK trên GitHub

1. Trên GitHub, mở kho **tienghanmrlee-apps → Actions**.
2. Chọn **Tao ung dung Windows va Android**.
3. Bấm **Run workflow → Run workflow** trên nhánh mặc định.
4. Chờ các tác vụ hoàn tất. Nếu tác vụ thất bại, mở bước màu đỏ để xem lỗi; chỉ tải bản có bước build thành công.
5. Mở lần chạy đó, kéo tới **Artifacts**, tải các gói cần dùng:

| Tệp tải về | Dùng cho |
| --- | --- |
| TiengHanMrLee-Windows-win-x64 | Windows 64 bit dùng Intel/AMD |
| TiengHanMrLee-Windows-win-arm64 | Windows ARM, như một số mẫu Surface |
| TiengHanMrLee-Android-APK-thu-nghiem | APK để cài thử trên Android |
| Android-lint-report | Báo cáo kiểm tra Android |

Artifacts tải về là ZIP. Giải nén bản Windows và chạy **TiengHanMrLee.exe**. Đây là ứng dụng chạy trực tiếp, không có trình cài đặt Setup.

Trên Surface, xem **Settings → System → About → System type** để chọn x64 hay ARM64. Windows cần **Microsoft Edge WebView2 Runtime**; nếu thiếu, ứng dụng đưa ra thông báo và liên kết tải chính thức. Bản EXE kèm .NET nên không yêu cầu thầy cài .NET để chạy.

Với Android, giải nén gói APK, chuyển **app-debug.apk** sang điện thoại, mở tệp và cho phép cài từ nguồn đang dùng khi Android yêu cầu. Yêu cầu Android 8.0 trở lên; máy cần có Android System WebView hoặc Chrome đang hoạt động.

## 4. Nội dung và giới hạn của bản đầu

- Bài học tải trực tiếp từ website. Sau khi thầy cập nhật và triển khai website, tải lại trang trong ứng dụng để nhận nội dung mới; bộ nhớ đệm của website có thể ảnh hưởng thời điểm cập nhật.
- Có nút quay lại, trang chủ, tải lại và thông báo lỗi kết nối/404.
- Liên kết tới website khác mở bằng ứng dụng/trình duyệt hệ thống.
- Android có xử lý chọn tệp và video toàn màn hình trong mã nguồn; cần thử với bài học thực tế. Tệp tải xuống chuyển sang trình duyệt; tệp yêu cầu đăng nhập có thể cần đăng nhập lại. Tệp dạng `blob:` chưa được hỗ trợ tải trực tiếp.
- Cookie và dữ liệu học tập được lưu riêng cho từng ứng dụng. Dữ liệu đang có trong trình duyệt không tự chuyển sang ứng dụng.
- Chưa bổ sung quyền micro/camera cho Android. Ghi âm, chấm phát âm, đăng nhập OAuth và tính năng đặc thù cần được kiểm tra/bổ sung sau khi truy cập được website.
- APK tạo bằng quy trình này là **bản debug để thử nghiệm**. Không dùng bản này để đưa lên Google Play hoặc phát hành chính thức. Khóa debug trên máy build mới có thể khác lần trước; khi không cập nhật đè được, gỡ bản cũ sẽ xóa dữ liệu ứng dụng. Để phát hành và cập nhật ổn định cần APK release ký bằng một khóa riêng được giữ lâu dài.
- EXE chưa được ký số. Chưa kiểm tra thời gian chạy hay khả năng tương thích của từng bài học.

## 5. Nếu muốn build trên máy của thầy

**Windows:** cài .NET 8 SDK và WebView2 Runtime. Trong thư mục `windows`, mở PowerShell rồi chạy:

```powershell
.\BUILD-WINDOWS.ps1
# Hoặc cho Windows ARM:
.\BUILD-WINDOWS.ps1 -Architecture win-arm64
```

**Android:** cài Android Studio, JDK 17, SDK Platform 35, Build Tools 35.0.0 và Gradle 8.11.1. Dự án chưa kèm Gradle Wrapper; trong thư mục `android` chạy:

```text
gradle wrapper --gradle-version 8.11.1
```

Sau đó mở thư mục `android` trong Android Studio, sync và build APK. Trên Windows có thể dùng `gradlew.bat assembleDebug lintDebug` sau khi tạo Wrapper. Không đưa keystore phát hành hoặc mật khẩu vào GitHub.

## Tài liệu tham khảo chính thức

- GitHub Pages: https://docs.github.com/en/pages/quickstart
- VS Code và Git: https://code.visualstudio.com/docs/sourcecontrol/quickstart
- Chạy workflow: https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow
- WebView2: https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/distribution
- Android WebView: https://developer.android.com/develop/ui/views/layout/webapps/webview
- Tương thích AGP 8.9: https://developer.android.com/build/releases/agp-8-9-0-release-notes
- Ký ứng dụng Android: https://developer.android.com/studio/publish/app-signing
