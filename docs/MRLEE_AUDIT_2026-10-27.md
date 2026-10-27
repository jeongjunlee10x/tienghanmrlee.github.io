# TIẾNG HÀN MR LEE — biên bản kiểm toán kỹ thuật ngày 27/10/2026

## Phạm vi và giới hạn
- Nguồn: mã nguồn công khai tại GitHub nhánh main; GitHub Actions QA, Chromium smoke trên runner; đọc cấu hình Supabase production theo quyền kết nối.
- **Không** thay đổi dữ liệu học viên, lịch sử, điểm số, tài khoản, khóa API hoặc quy tắc Firebase.
- Đã kiểm tra bằng bộ QA sẵn có: các trang HTML, cú pháp JavaScript, đường dẫn, logo, tài nguyên ảnh, TOPIK MP3, bản đồ và trình duyệt desktop/mobile Fresh/Future.
- Không có thông tin đăng nhập thử nghiệm; một số trang sau Firebase Auth chỉ được xác minh mã nguồn/tuyến đường, **không** phải kiểm thử thao tác E2E học viên/giáo viên.

## Lỗi đã phát hiện và khắc phục
1. **Lọc bản đồ Gwangju/Jeonnam:** hai đa giác V-World 2023 ánh xạ về `gwangju` và `jeonnam` trong khi bộ dữ liệu trường năm 2026 dùng `jeonnam-gwangju`. Nhấp hình bản đồ không lọc đúng. Đã sửa cả hai ánh xạ và bổ sung QA click trên Chromium.
2. **Mô tả đơn vị hành chính:** địa giới hình học đầu vào có 17 đa giác năm 2023, nhưng danh mục logic hiện hành từ 01/07/2026 có 16 đơn vị do hợp nhất Gwangju/Jeonnam. Đã chỉnh nhãn và mô tả để không gọi 17 đa giác là 17 đơn vị hiện hành. Giữ nguyên 17 hình gốc, không giả tọa độ.
3. **Ảnh thẻ chuyên mục đổi theo giao diện:** bộ theme và bộ V3 cùng cập nhật `src`; một số ảnh bị thay khi chọn Fresh/Future. Đã giữ hình card bất biến giữa hai theme, bảo lưu nguồn ảnh gốc V3 khi tái chạy và loại bỏ ghi đè bất đồng bộ.
4. **Dò điểm Firebase cũ:** widget V12 không hủy listener ví điểm `users/{uid}/studyPoints/wallet` khi đổi tài khoản, dễ gây listener rò rỉ và dữ liệu điểm cũ xuất hiện trễ. Đã bổ sung `stopOld` và kiểm thử hồi quy.
5. **Supabase function quyền cao có thể bị gọi công khai:** `public.rls_auto_enable()` là `SECURITY DEFINER` event-trigger function, bị lộ EXECUTE cho `anon` và `authenticated`. Đã áp dụng migration `harden_rls_auto_enable_execute_20261027`:
   ```sql
   REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
   ```
   Đã xác minh hai vai trò `anon`/`authenticated` có `EXECUTE=false`, vai trò `postgres` vẫn true, event trigger `ensure_rls` còn active. Supabase Security Advisor không còn hai cảnh báo thực thi hàm này.

## Mức độ đã xác minh
- GitHub repo có hơn 60 tuyến HTML; quá trình kiểm thử gần nhất trước cập nhật đạt 65 tuyến có thương hiệu và 1 redirect.
- QA ảnh văn hóa V19 kiểm tra đủ **22 chủ đề / 110 ảnh WebP**; bài kiểm tra TOPIK 24 audio native đều tồn tại trên repository (24/24).
- Dữ liệu bản đồ `university-map/universities.json` công bố 633 trường, 666 campus được nhập, và **0 tọa độ campus xác minh**. Không nên quảng cáo là bản đồ pin campus chính xác toàn quốc.
- Tại thời điểm kiểm toán, bảy bảng ứng dụng MR LEE của schema `public` trên Supabase bật RLS; vai trò `anon` không được SELECT trực tiếp các bảng này.
- CI có thể đạt khi người dùng chưa đăng nhập; kiểm thử trang giới hạn vẫn cần tài khoản thử nghiệm đã xác minh email.

## Cảnh báo còn tồn tại / quyết định triển khai sau
- Supabase Advisor vẫn có cảnh báo `Leaked Password Protection Disabled`. Chưa đổi vì cần xác định việc Supabase Auth có thật sự quản lý người dùng so với Firebase Auth; tránh thay đổi hành vi đăng nhập ngoài phạm vi đã kiểm chứng. Tham khảo: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- Audit ảnh ghi nhận **14 tệp ảnh có nội dung nhị phân trùng nhau** trong các thư mục được quét; chưa xóa tệp vì có thể còn được các trang legacy tham chiếu.
- Audit HTML cảnh báo 7 fragment URL trong `van-hoa-bai-hoc.html`: thực tế các ID được tạo lúc chạy trong `mrlee-culture-v13.js`, nên báo cáo tĩnh không đủ để kết luận lỗi.
- Thiếu kiểm thử quyền xác thực thật trên Firebase, chấm điểm Spark đồng thời bằng emulator, nghiệp vụ Admin placement ở tài khoản thực, và giấy phép tất cả video nhúng.
- Bảo vệ hiển thị từ `auth-guard.js` trên GitHub Pages **không khóa tệp HTML/JS tải trực tiếp**. Nếu yêu cầu bảo mật nội dung khóa học thực sự, cần lưu nội dung riêng sau backend có xác thực và rules máy chủ; không thể thay bằng CSS hoặc kiểm tra frontend.

## Phục hồi an toàn
- Các thay đổi mã nguồn được tách ở PR kiểm toán rồi kiểm thử trước merge. Nếu phát sinh lỗi giao diện, revert commit merge tại GitHub, không động đến dữ liệu sinh viên.
- Supabase migration chỉ thu hồi quyền gọi RPC đối với một event trigger bảo vệ RLS. **Không** tự ý mở lại quyền công khai khi rollback; cần điều tra lý do nghiệp vụ hợp lệ trước khi GRANT.
