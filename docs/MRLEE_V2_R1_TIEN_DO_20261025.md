# MR LEE V2 — Bản triển khai R1 ngày 25/10/2026

## Đã thay đổi (chỉ nhánh R1, chưa phát hành production)
- Giao diện **Viễn tưởng**: thêm thanh điều hướng HTML thật cho đúng **6 chuyên mục chính**; các liên kết trỏ tới trang đang tồn tại. Có focus bằng bàn phím, trạng thái hiện tại, bố cục desktop/tablet/mobile, tôn trọng giảm chuyển động.
- Giao diện **Tươi mới**: phần điều hướng mới được ẩn bằng CSS; chưa đổi nội dung, logo hay cách truy cập trang.
- **Admin**: KPI Tổng học viên dùng `count: 'exact'` của Supabase thay vì độ dài mẫu tối đa 2.000 người; KPI học viên hoạt động 7 ngày dùng phép đếm từ máy chủ và hiển thị gạch ngang nếu truy vấn thất bại.
- Biểu đồ Admin được ghi rõ phạm vi mẫu dữ liệu 2.000 hồ sơ và 1.500 bản ghi gần nhất, tránh diễn giải là toàn bộ dữ liệu. Ngày hoạt động dùng múi giờ Việt Nam.
- Sửa một số chuỗi tiếng Việt bị lỗi mã hóa ở `admin.html`.
- CI kiểm thử cho pull request và bổ sung điều kiện chống hồi quy R1. Không sửa bảng, migrations, Firebase/Firestore Rules hay điểm học viên.

## Kiểm thử mã nguồn trong phiên làm việc
- Kiểm tra tồn tại tệp trên nhánh R1: PASS.
- Kiểm tra cú pháp JS ở các tệp đổi (parse only): PASS.
- Kiểm tra 6 liên kết HTML, trạng thái giao diện Tươi mới, nguồn KPI đếm chính xác và lỗi mã hóa tiêu đề: PASS.
- **Chưa kiểm thử thực tế:** trình duyệt responsive, đăng nhập Admin, Supabase RLS, điều hướng chạm trên điện thoại, gửi phiếu tư vấn, cộng điểm và hiệu năng.
- Chờ GitHub Actions PR workflow; **không tuyên bố release hoàn thành** khi chưa đạt checklist R6.

## Cần làm tiếp
1. R2: ảnh WebP chất lượng cao theo ngữ cảnh từng trang, có bản quyền và so sánh ảnh thật.
2. R3: hoàn thiện trang con, audio, workbook, TOPIK.
3. R4: mở rộng tab Admin bằng dữ liệu thật và kiểm thử với Admin được cấp quyền.
4. R5: audit sổ thưởng/Firebase/Supabase và quy trình phiếu tư vấn từ đầu đến cuối.
5. R6: kiểm thử browser, merge main an toàn, xác nhận Pages success và chức năng thật.

## Rollback
- Điểm xuất phát main: `8589aef4af8b8e4e4e62b32075910f1fe567657a`.
- Nhánh làm việc: `mrlee-v2-r1-admin-nav-20261025`; chỉ merge sau QA. Nếu cần hủy, đóng PR/xóa nhánh. Không dùng force push.
