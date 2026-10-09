# TIẾNG HÀN MR LEE – THÔNG BÁO MỖI NGÀY / LỘ TRÌNH 1–6 / GIAO TIẾP CAO CẤP

Phiên bản: **2026.10**. Bộ nâng cấp tạo ngày 10/10/2026.

## 1. Các tính năng

- **Mỗi ngày đăng nhập:** Tài khoản Firebase đã xác minh email sẽ nhận điểm danh qua ví điểm hiện có. Một cửa sổ giữa màn hình xuất hiện **một lần/ngày UTC trên từng trình duyệt và mỗi UID**, hiển thị **tổng số ngày điểm danh kể từ khi tính năng hoạt động**, **streak hiện tại**, **số điểm thực tế** và **thông tin phiên bản mới**. Mở lại trang cùng ngày không nhận thêm điểm.
- **Trang chủ:** thêm một bảng tên học viên phía trên banner, kèm **điểm động lực**, streak, ngày điểm danh, huy hiệu tính theo điểm. Có nút tự sao chép nội dung chia sẻ thành tích và link website, **không tự tiết lộ email hoặc tên học viên**.
- **Nút số 1 – Bài học tiếng Hàn:** vẫn mở `bai-hoc.html`, trong đó thêm bảng chọn **Cấp 1, 2, 3, 4, 5, 6** và nút đi đến luyện nói. **Không xóa** bài học đang có. Nếu các file lộ trình cấp 1–6 chưa tồn tại, bộ cài tự thêm các file nền từ bản trước.
- **Giao tiếp theo chủ đề:** giữ câu và chủ đề cũ. Thêm **12 tình huống mới** (3 chủ đề × 4 cấp), **mỗi chủ đề 20 câu = 240 câu**, chia bốn tình huống con, có Hàn–Việt, nghe, flashcard, lưu yêu thích và bộ lọc cấp 1–6. Thêm **12 bài luyện nói** (mỗi bài 5 câu, dùng hệ thống điểm đang có).
- **Điểm học tập:** dùng nguyên mô hình ví điểm hiện hành: 100 điểm ban đầu, tối đa 200; thưởng điểm danh +2, thưởng streak mốc 3/7/14/30 ngày và luyện nói đạt điểm. Không tạo bảng điểm mới, không làm thay đổi điểm lịch sử.
- **Banner:** giữ nguyên 9 ảnh và lịch đổi 2 giây theo mã hiện tại. **Không chỉnh logic slideshow, logo và ảnh nền**.

## 2. Cài đặt – một file duy nhất

1. **Sao lưu** thư mục website hiện tại. Đảm bảo có `index.html`, `bai-hoc.html`, `giao-tiep-theo-chu-de.html`, `firebase-config.js`.
2. Chép file `CAI-MRLEE-HOC-1-6-THONG-BAO-STREAK-GIAO-TIEP-V2.ps1` vào thư mục:

   `C:\Users\Surface\Documents\tienghanmrlee.github.io`

3. Mở VS Code **Terminal – PowerShell** tại thư mục đó, chạy:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\CAI-MRLEE-HOC-1-6-THONG-BAO-STREAK-GIAO-TIEP-V2.ps1
   ```

4. Nếu thấy `SUCCESS`, mở website bằng Live Server, đăng nhập tài khoản **đã xác minh email**, kiểm tra trên desktop và điện thoại.
5. Sau khi kiểm tra, chạy (chỉ trong thư mục website):

   ```powershell
   git add index.html bai-hoc.html giao-tiep-theo-chu-de.html mrlee-*.js mrlee-*.css lo-trinh-1-6.html luyen-noi-tinh-diem.html course-outline.json
   git commit -m "Upgrade study hub, daily welcome, streak and advanced conversation"
   git push origin main
   ```

   Nếu một tên file không tồn tại trong bản của bạn, bỏ tên đó khỏi lệnh `git add` và dùng `git status` kiểm tra.

6. Mở `https://jeongjunlee10x.github.io/tienghanmrlee.github.io/` và nhấn `Ctrl+F5`.

### Sao lưu, chạy lại, xử lý lỗi

- Bộ cài **kiểm tra cấu trúc HTML trước khi ghi**, không chạy nếu không nhận diện đúng định dạng, để tránh hỏng website.
- File cũ được sao lưu **ngoài thư mục repository Git**, trong thư mục `.mrlee-backup-engagement-YYYYMMDD-HHMMSS` bên cạnh thư mục website.
- Chạy lại bộ cài **không thêm trùng** 240 câu, bảng chọn cấp độ hoặc đoạn gọi JS.
- Không cần chạy một lệnh SQL, tạo bảng Supabase, hoặc thay Firestore Rules mới cho bản này. Điểm danh phải sử dụng bộ **Firestore Rules 1–6/Streak** đã xuất bản thành công ở phiên bản trước. Nếu `permission-denied`, kiểm tra Rules hiện có trước khi công bố.
- Bộ mã `admin.html` / GitHub Actions Firebase→Supabase không bị chỉnh sửa. Dữ liệu điểm học tập vẫn lưu ở Firebase; trang Admin chưa có báo cáo huy hiệu/streak riêng nếu bạn chưa bổ sung phần đó.
- Nếu website có một cấu trúc `giao-tiep-theo-chu-de.html` khác, **bộ cài sẽ dừng**, khi đó cung cấp đúng HTML hiện có để sửa cho khớp, không tự ý thay bằng bản cũ.

## 3. Kiểm thử

- Tài khoản mới: login, email verified, thấy **bảng tên và điểm thật** trên trang chủ.
- Lần đầu điểm danh ngày UTC: modal giữa màn hình; refresh 2–3 lần **không cộng điểm trùng**.
- Tổng ngày và streak **chỉ tính kể từ ngày tính năng điểm danh hoạt động**, không phục hồi lịch sử đăng nhập Firebase trước đó.
- Cấp 1–6 từ `Bài học tiếng Hàn`; cấp 1–2 vẫn mở bài gốc.
- Giao tiếp → chọn `Cấp 4` → chủ đề `Xử lý khiếu nại khách hàng` → 20 câu, có nghe, flashcard và nút luyện nói.
- Trở lại trang chủ: banner `images/1.png` đến `images/9.png` vẫn chuyển **2 giây**.

## 4. Quy tắc tính điểm và giới hạn công bằng

- Hệ thống tiếp tục dùng **100–200 điểm động lực** của ví hiện có. `+2 điểm/ngày`, mốc streak **3/7/14/30** lần lượt **+1/+3/+5/+8** (nhận một lần khi đạt mốc), bài nói đạt **85–100: +10**, **60–84: +6**, dưới 60 **−3**; có điểm cộng streak nếu đạt điều kiện. **Mỗi bài chỉ tính điểm một lần/ngày**, ví không vượt 200.
- Các thành tích được **hiển thị riêng tư cho chính học viên**. Chỉ khi học viên nhấn nút Chia sẻ thành tích thì mới sao chép nội dung để đăng ở nơi khác; không công khai danh sách học viên hay email.
- Huy hiệu (`Khởi động`, `Bền bỉ`, `Tăng tốc`, `Bứt phá`) chỉ là biểu tượng động lực dựa trên ví điểm, **không phải cấp TOPIK thực tế**. Không dùng điểm trình duyệt để trao thưởng có giá trị tiền, xử lý kỷ luật hoặc cấp chứng chỉ.
- Tính ngày trên ví đang dùng **UTC** (đổi ngày vào khoảng **07:00 giờ Việt Nam**, **09:00 giờ Hàn Quốc**), vì Rules trước đang kiểm tra theo UTC. Không thay đổi kiểu ngày khi nâng cấp để tránh cộng điểm sai hoặc reset streak cũ.
- Nhận diện giọng nói miễn phí chỉ đo **mức khớp giữa câu mẫu và lời đã nhận diện**, không chấm trọn vẹn phát âm hay tranh luận cấp cao. Tính năng hỗ trợ còn tùy trình duyệt, một số thiết bị cần kết nối internet để nhận diện giọng nói.

## 5. Các file nguồn đi kèm

- `mrlee-engagement.js`, `mrlee-engagement.css`: popup, bảng điểm, huy hiệu và chia sẻ.
- `mrlee-deep-topics.js`: 240 câu được biên soạn, `mrlee-deep-topics.json`: bản dữ liệu dễ chỉnh sửa.
- `mrlee-deep-ui.js`: tình huống sử dụng và nút luyện nói trên trang giao tiếp.
- `mrlee-speaking-deep.js`: 12 bài luyện nói (60 câu mẫu).

**Lưu ý:** Đây là gói mã chưa trực tiếp cài đặt lên máy Windows hoặc dự án Firebase của bạn; bài kiểm tra trình duyệt sử dụng dữ liệu mô phỏng. Không gửi mật khẩu, khóa Firebase Admin SDK hoặc khóa Supabase secret cho bất kỳ ai để cài bản này.
