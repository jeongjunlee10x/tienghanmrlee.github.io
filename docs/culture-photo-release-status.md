# MR LEE — Trạng thái triển khai ảnh Văn hóa Hàn Quốc

Ngày kiểm tra: 2026-10-31. Kho GitHub: `jeongjunlee10x/tienghanmrlee.github.io`.

## Đã xuất bản
- 70 ảnh cho bảy đợt (V23–V28), theo commit 89bb8a4.
- Hai chủ đề V28 về sơ cấp cứu và số khẩn cấp sử dụng ảnh vector an toàn.

## Chưa xuất bản — không quảng cáo là đã triển khai
- **V29 / đợt 8:** 10 ảnh AI phong cách ảnh chụp, có trong gói ZIP cài đặt riêng. Bộ danh mục SHA-256 và chú thích có trong mã nguồn, nhưng 10 tệp WebP nhị phân chưa có trong kho. Không kích hoạt V29 khi chưa đủ 10 ảnh.
- **V30 / đợt 9:** đã soạn 20 cảnh cho 4 chủ đề: tàu điện ngầm, xe buýt, khám bệnh–mua thuốc, thoát hiểm khi cháy. Chưa có 20 ảnh lẻ đạt chuẩn, không thay thế bằng ảnh poster ghép.

## Quy tắc kiểm soát
1. Mỗi ảnh phải là file riêng, không lấy ảnh bé từ poster rồi phóng to.
2. 1536×1024 px tối thiểu; kiểm tra RIFF/WEBP và kích thước thực. Với V29 đối chiếu cả SHA-256/độ dài đã lưu.
3. Không xuất bản một phần đợt; không dùng ảnh trùng byte; ảnh AI không được giới thiệu là ảnh tư liệu hay bản đồ chỉ đường chính thức.
4. Giữ nguyên hệ thống học viên, Admin, Firebase, Supabase, logo và hai giao diện.
5. Sau khi tệp nhị phân được bổ sung vào repo, chạy `node tools/check-culture-photo-gate.mjs`, rồi mới sửa image engine và các trang văn hóa để kích hoạt; không bật nguồn ảnh thiếu.

**Lưu ý:** Commit đưa các tệp danh mục/QA lên GitHub không đồng nghĩa tải ảnh WebP lên GitHub.
