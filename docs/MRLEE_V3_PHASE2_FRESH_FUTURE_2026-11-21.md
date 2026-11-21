# MR LEE V3.0 — Giai đoạn 2 / Đợt 1: Fresh/Future responsive & accessibility

Ngày: 21/11/2026. Base: `main` sau khi PR #78 đã merge ở commit `be290eed4b9779e449592ab6decdd0621fed50ce`.

## Mục tiêu của đợt này

Củng cố cơ chế chọn một trong hai giao diện tại trang chủ (Fresh/Future), khắc phục vấn đề cập nhật cache tài nguyên và mở rộng các viewport được kiểm thử. Đây là **đợt 1 của Giai đoạn 2**, chưa phải nghiệm thu toàn bộ 6 gói V3.0.

### Thay đổi

1. `assets/mrlee-dual-ui/theme.js`: hỗ trợ phím mũi tên, Home/End để di chuyển focus giữa hai lựa chọn trong popup; Enter/Space giữ cơ chế button bản địa. Khi mở lại qua `?select-theme=1`, nhãn `aria-pressed` mô tả giao diện đang dùng. Phiên chọn của tab khác không bị áp đặt.
2. `assets/mrlee-dual-ui/entry-picker.css`: trạng thái đã chọn dễ nhận diện, kích cỡ chữ và vùng chạm trên điện thoại được tăng; điều chỉnh bố cục cho 320px và màn hình ngang có chiều cao thấp; tôn trọng `prefers-reduced-motion`.
3. `assets/mrlee-dual-ui/theme.js`: ảnh hero thuộc giao diện đang chọn được `loading=eager` và `fetchpriority=high`, ảnh không thuộc giao diện được `loading=lazy` và `fetchpriority=low`. Không đổi URL hay xóa ảnh HD gốc; đây là **ưu tiên tài nguyên**, không phải cam kết cải thiện LCP khi chưa đo.
4. `index.html`: thay cache key script để production nhận JS mới. Script gắn stylesheet popup dùng cache key mới tương ứng.
5. `tools/check-theme-entry.mjs`: kiểm tra hợp đồng source mới, giữ yêu cầu một lần chọn/tab, không có nút chuyển theme trùng trên header.
6. `tools/browser-v3-theme-responsive.mjs` và `mrlee-browser-smoke.yml`: test thực bằng Chromium ở 320×568, 390×844, 667×375, 768×1024 và 1440×900, Fresh/Future; kiểm tra popup, thao tác bàn phím, theme đang chọn, ảnh hero, vị trí ảnh và nội dung, cập nhật cache, URL sau khi mở lại. Ghi ảnh chụp trong artifact `mrlee-v3-theme-responsive`.

## Cổng nghiệm thu

- `MR LEE — Remaining browser workflows (theme, admissions, contrast)`: bao gồm bộ test đã có và 10 bài test mới (5 viewport × 2 giao diện).
- `MR LEE NEXT` và các workflow UI có phạm vi tương ứng phải thành công.
- Nếu Chromium phát hiện tràn màn hình, ảnh/tiêu đề chồng nhau, hoặc lỗi keyboard, cần sửa lại trên nhánh rồi đợi kết quả CI commit mới nhất.
- Không khẳng định cải thiện Core Web Vitals nếu chưa đo trên production thực tế.

## Bảo vệ dữ liệu

Không thay schema, khóa dịch vụ, Admin/điểm thưởng, luật PvP, hình ảnh/MP3, URL bài học hoặc nội dung TOPIK. Không xóa tệp. PR không tự merge. Production chỉ thay đổi sau khi review/merge và deployment thành công.

## Việc còn lại trong Giai đoạn 2

Đánh giá tiếp bảng màu chữ ở các trang con, các breakpoint dưới 360px, sự tương thích của nhiều stylesheet cũ và tốc độ tải ảnh thực. Tiếp tục theo từng PR kiểm thử thay vì thay toàn bộ giao diện không có cơ sở nghiệm thu.
