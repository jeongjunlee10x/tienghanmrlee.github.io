# TIẾNG HÀN MR LEE — Báo cáo kiểm tra nút liên hệ và trang Admin

**Ngày kiểm tra:** 27/10/2026 (giờ Việt Nam).  
**Nguồn:** GitHub main `037c31467569c577ef5ab86329116ae63cfd1f70`, GitHub Actions, Supabase trực tiếp (truy vấn chỉ đọc).  
**Giới hạn:** Không truy cập bằng thông tin đăng nhập Admin thật; các thao tác của tài khoản quản trị được xem xét qua mã nguồn và RLS, không khẳng định đã thao tác end-to-end trên tài khoản thật.

## 1. Nút liên hệ bị mất
**Nguyên nhân:** `assets/mrlee-v2/smart-shell.css` ẩn `.contact-rail` trong giao diện Viễn tưởng có Smart Homepage. Các trang con thiếu bộ nút nổi đồng bộ.

**Sửa:** Bộ nổi `assets/branding/contact-dock.{js,css}` khởi động từ `site-logo.js` dùng chung trên mọi trang công khai. Gồm Gọi 0376991180, Zalo, Messenger, Email tienghanmrlee@gmail.com và sao chép KakaoTalk ycleeee. Desktop hiện năm biểu tượng; mobile có nút Liên hệ thu gọn; bản gốc trên MAIN chỉ ẩn sau khi bộ nổi mới đã khởi động thành công. Không chèn vào Admin.

**Lưu ý:** Liên kết Messenger hiện do nội dung website cung cấp, chưa xác minh trang đích Fanpage; không khẳng định đã kiểm tra liên kết ngoài.

## 2. Trạng thái dữ liệu Admin được xác minh trực tiếp
- `mrlee_students`: **26** hồ sơ.
- `mrlee_scores`: **78** kết quả, trong đó **19** có dữ liệu có thể xem lại; không có `max_score=0` tại thời điểm kiểm tra.
- `mrlee_learning_events`: **316** sự kiện.
- `mrlee_placement_submissions`: **3** bài (2 chờ đánh giá, 1 đã đánh giá).
- `mrlee_consultation_requests`: **1** yêu cầu.
- `mrlee_sync_runs`: **146** lượt, đều có `status=success`; lần đồng bộ thành công gần nhất **27/10/2026 22:59** giờ Việt Nam.
- `mrlee_admins`: **1** tài khoản được cấp quyền (không công bố danh tính).
- RLS hiện bật tại các bảng dữ liệu MR LEE; chính sách SELECT dành cho role đã xác thực yêu cầu tồn tại UID trong `mrlee_admins`. Đây là đối chiếu lược đồ và chính sách, **không phải thử thâm nhập**.

## 3. Lỗi mã nguồn Admin và bản sửa
1. **Quy trình đăng nhập khó sử dụng:** Admin dùng Supabase Auth riêng với Firebase Auth của học viên, nhưng lần đầu buộc nhập URL/anon key thủ công. Đã cấu hình sẵn URL và `sb_publishable_` công khai hiện hành của đúng dự án; RLS, quyền Admin và mật khẩu vẫn bắt buộc. Không đưa service_role hay backend secret vào HTML.
2. **Thống kê hoạt động sai:** chỉ cần có `last_activity_at` dù rất cũ vẫn được tính. Đã giới hạn 7 ngày và sửa nhãn.
3. **Phần trăm điểm có nguy cơ không hợp lệ:** khi dữ liệu nhập có `max_score=0`, hiển thị `Infinity%`. Đã chặn chia cho 0 và giới hạn hợp lệ, hiển thị — với dữ liệu bất thường.
4. **Xuất CSV có nguy cơ thực thi công thức khi mở bằng bảng tính:** các trường văn bản bắt đầu bằng =, +, -, @ (sau khoảng trắng) đã được tiền tố dấu nháy để coi là văn bản.
5. **Không có bản báo cáo sức khỏe dễ tìm:** thêm bảng *Báo cáo trạng thái Admin* vào **Admin → Hệ thống**, đọc số dòng thực tế và thời gian đồng bộ gần nhất, cảnh báo quá 6 giờ hoặc lỗi truy vấn.

## 4. Kiểm thử
- `tools/check-contact-admin.mjs`: kiểm tra tính nhất quán của widget, fallback trang chủ, Admin health panel, khóa công khai, kiểm tra cú pháp tất cả JavaScript inline trong `admin.html`, tiêu chí điểm và xuất CSV.
- `tools/browser-smoke.mjs`: kiểm tra nút liên hệ trên Fresh/Future ở 1440×900 và 390×844, mở/đóng trên mobile, và trang Admin ẩn dữ liệu trước khi có quyền.
- Các bộ QA hiện có (cú pháp JS, kiểm toán HTML, đường dẫn, bản đồ, ảnh TOPIK và ảnh văn hóa) tiếp tục được chạy trong workflow.

## 5. Những phần còn phải xác minh với tài khoản quản trị thật
- Đăng nhập Supabase bằng tài khoản Admin đã xác thực, trải nghiệm sau đăng nhập trên desktop/mobile.
- Kiểm tra đọc đầy đủ chi tiết 3 bài đầu vào, xuất kết quả, sửa trạng thái và lưu nhận xét.
- Kiểm tra tư vấn, báo cáo biểu đồ, nhập/xuất học viên khi có quyền Admin thật.
- Kiểm tra cơ chế thưởng, đồng bộ Firebase đến Supabase và phân quyền hiển thị phiếu nhạy cảm.
- Xác minh chính xác tài khoản Fanpage đích cho liên kết Messenger. Không coi đường dẫn có sẵn là đã được xác minh.

**Nguyên tắc:** Không thay đổi bản ghi học viên, thông tin liên hệ cá nhân, RLS, điểm thi, tài khoản hoặc backend secret trong đợt sửa này.
