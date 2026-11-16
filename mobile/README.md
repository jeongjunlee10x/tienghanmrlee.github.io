# MR LEE Mobile — Android APK & iOS

## Một website, ba nền tảng

Website production: https://mrlee-b6a.pages.dev/

Thư mục này tạo hai ứng dụng **online** trực tiếp từ website đang chạy. Tài khoản, lịch sử học, điểm, G, TOPIK, workbook và game đều tiếp tục phụ thuộc các API/Firestore/Supabase đang hoạt động. **Không có cơ sở dữ liệu hoặc ví G thứ hai** và không đóng gói 14.000+ MP3 trong ứng dụng.

| Phiên bản | Mục đích | Cách lấy |
|---|---|---|
| Android APK debug | Cài trực tiếp trên Android 8+ | GitHub Actions → MR LEE Mobile → Artifacts → MR-LEE-Android-APK |
| iOS simulator unsigned | Chạy thử trên iOS Simulator của Xcode | GitHub Actions → Artifacts → MR-LEE-iOS-Simulator-Unsigned |
| iOS app thực trên iPhone | Phải ký bằng Apple trong Xcode | Mở dự án iOS theo hướng dẫn bên dưới |
| iOS web app miễn phí | Không cần App Store/Apple Developer | Safari → Share → Add to Home Screen → Open as Web App |

### Tải APK Android

GitHub → Actions → **MR LEE Mobile — Android APK + iOS Simulator** → mở workflow chạy thành công → kéo xuống **Artifacts** → tải `MR-LEE-Android-APK`. Giải nén ZIP và mở `MR-LEE-Android-1.0.0-debug.apk` trên Android. Android có thể yêu cầu cho phép nguồn cài đặt này. Chỉ cài file tải từ Actions của repository chính thức.

APK được ký bằng debug key do máy build tạo. Đây là bản thử nghiệm **không phù hợp phân phối công khai lâu dài**, và không bảo đảm có thể nâng cấp tại chỗ sang APK do CI chạy lại (debug key có thể thay đổi). Để phát hành ổn định cần cấu hình release keystore bảo mật và khóa ký cố định, kiểm tra chức năng rồi mới phát hành.

### Kiểm tra nguồn Android trên máy

- Cài Android Studio (JDK 17, Android SDK API 36), mở `mobile/android` và đồng bộ Gradle 8.13 + Android Gradle Plugin 8.13.2.
- Từ root repository chạy `python -m pip install Pillow==12.0.0` và `python mobile/tools/generate_icons.py`.
- Trong Android Studio chạy app trên điện thoại/emulator; hoặc `gradle -p mobile/android :app:assembleDebug` để xuất APK.

### Dùng iOS ngay miễn phí (không cần IPA)

1. Mở Safari trên iPhone/iPad và truy cập https://mrlee-b6a.pages.dev/.
2. Chọn biểu tượng **Chia sẻ (Share)** → **Thêm vào Màn hình chính (Add to Home Screen)**.
3. Chọn **Mở như ứng dụng (Open as Web App)** nếu được hỏi, sau đó **Thêm (Add)**.

Trang chính vẫn cần Internet. Đây là web app cài từ Safari, **không phải IPA và không phải bản App Store**.

### Tạo app iOS native trên Mac

1. Cài Xcode, XcodeGen, Python 3 + Pillow.
2. Từ root repository: `python3 mobile/tools/generate_icons.py`.
3. `cd mobile/ios && xcodegen generate` để tạo `MRLeeMobile.xcodeproj`.
4. Mở project trong Xcode, chọn scheme `MRLee`, cắm iPhone hoặc chọn simulator rồi Build/Run.
5. Với iPhone thật, chọn **Signing & Capabilities → Team** và dùng Apple ID (Personal Team) để thử trên thiết bị của chính mình; để phân phối qua TestFlight/App Store cần chương trình Apple Developer, chứng chỉ và cấu hình phù hợp.

GitHub Actions chỉ xuất **ứng dụng không ký cho iOS Simulator**, không phải IPA cài được lên iPhone. Không upload Apple private key, .p12, provisioning profile hay Apple ID password lên source code. Xuất IPA chỉ được thực hiện sau khi có signing thích hợp và quyết định phát hành.

### Bảo mật / giới hạn cần nghiệm thu

- Android native WebView và iOS WKWebView chỉ cho điều hướng trong đúng `https://mrlee-b6a.pages.dev`; URL ngoài mở trong trình duyệt hệ thống. Không chạy script có quyền native hay lộ token backend.
- Android chặn SSL không an toàn, tắt mixed content, file access và debugging; iOS ATS mặc định bật HTTPS.
- Hệ thống chỉ xin quyền **microphone khi học viên chủ động dùng luyện phát âm**; không cấp camera.
- Đăng nhập email/mật khẩu trong website cần test thực tế. Các cách **đăng nhập OAuth Google/Facebook trên WebView** có thể bị nhà cung cấp chặn, phải tích hợp luồng đăng nhập native/browser đúng quy định trước khi sử dụng.
- Các mô-đun phụ thuộc API, Cloudflare Turnstile, thanh toán, email links, tải về, game PvP, âm thanh, upload, camera, leaderboard, chấm điểm cần kiểm thử trên điện thoại thật.
- Apple có thể từ chối bản App Store nếu ứng dụng chỉ bao bọc website, vì yêu cầu chức năng/giá trị tương xứng với một ứng dụng native.
- Mỗi lần sửa website, nội dung sẽ tự cập nhật trong app theo Cloudflare. Sửa mã native phải build phiên bản app mới.

## Phạm vi & an toàn

Không sửa website đang hoạt động, không thay đổi hệ thống điểm hay cơ sở dữ liệu. Workflow chỉ đọc mã nguồn và logo gốc rồi tạo artifact thử nghiệm. Mọi công bố chính thức vẫn cần duyệt và kiểm thử.
