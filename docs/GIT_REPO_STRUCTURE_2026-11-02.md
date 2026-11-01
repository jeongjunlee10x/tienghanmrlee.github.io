# Kiểm toán cuối và quy hoạch Git — 02/11/2026

## Phạm vi đã kiểm kê

- **16.844 tệp được theo dõi**, khoảng **222 tệp tại thư mục gốc** sau khi sắp xếp.
- **8.447 tệp** trong `MRLEE_AUDIO/`; **4.628 tệp** trong `MRLEE_PRO_AUDIO/`: tổng **13.075 tài nguyên âm thanh**, toàn bộ **giữ nguyên đường dẫn**.
- `archive/legacy-packages/`: **8 ZIP lịch sử**, khoảng **17,94 MiB**.
- `archive/legacy-snapshots/`: **307 tệp lịch sử**, khoảng **26,60 MiB**.
- `archive/legacy-installers/`: **35 tệp CMD, PowerShell, manifest và bộ `FILES/` liên quan**, khoảng **2,11 MiB**.
- Thư mục gốc hiện **không còn ZIP, CMD hoặc PowerShell triển khai đời cũ**.

**Lưu ý:** 46,65 MiB dữ liệu lịch sử nêu trên được **chuyển thư mục**, không được xóa hẳn và không phải số liệu tiết kiệm dung lượng lưu trữ. GitHub lưu lịch sử commit, do đó ngay cả tệp bị xóa cũng có thể khôi phục từ commit trước.

## Những phần được loại khỏi giao diện hiện hành

| Đã xử lý | Lý do |
| --- | --- |
| `index.html`: khối `#mrleeFutureStart` | Lặp lưới cấp học và menu của Home V2 |
| `index.html`: `.feature-cards` cũ | Lặp thẻ chức năng Home V2 |
| `index.html`: `.journey` cũ | Làm dài phần mở rộng; thông tin tương đương có ở Tuyển sinh |
| `assets/mrlee-v2/smart-shell.js` + `.css` | Bộ dựng menu/hero cũ không còn được nạp ở các trang V2/V3 |
| `assets/mrlee-ui2027/smart-home-v1.css` | Phiên bản V1 đã được Home V2 thay thế |
| `assets/branding/home-hero-overlay-v3.css` | Hero overlay cũ không còn là thành phần trang chủ đang sử dụng |
| `assets/branding/home-hero-split-v2.css` | Đã có hero Fresh/Future V2 |
| ZIP, snapshot, script cập nhật lịch sử | Chuyển vào `archive/` có phân nhóm; giữ khả năng tra cứu |

Phần HTML trùng lặp được rút gọn khoảng **7,7 KB**. **Không xóa** các thành phần `#schoolSearchForm`, `#ranking`, `#rankSlider`, `#contactDialog`, `#openContactHero`, nút chọn giao diện hay nút xem thêm chức năng: các mục này còn liên kết với logic đang hoạt động.

## Danh mục sử dụng và giới hạn xóa

1. **Trang HTML gốc** là URL ổn định của GitHub Pages. Di chuyển chúng sẽ gây 404 trên liên kết đã chia sẻ. Không tự đổi thư mục HTML.
2. **Kho ảnh/MP3** chứa đường dẫn trong dữ liệu và manifest JS, không phải lúc nào cũng xuất hiện trong thẻ `img` hoặc `audio` tĩnh. Không dùng phép tìm kiếm chuỗi đơn giản để xóa hàng loạt.
3. **Module V4/V5** vẫn cần cho `giao-tiep-theo-chu-de.html` (trang chưa chuyển cấu trúc V2 hoàn toàn). **Không xóa** `assets/mrlee-v4/` và `assets/mrlee-v5/` lúc này.
4. **Module tư vấn cũ** vẫn chạy trên `dang-ky-tu-van.html`: không xóa `assets/mrlee-v2/experience.js` hoặc `experience.css`.
5. **Admin, đăng nhập, điểm thưởng, placement**: không thay logic Firebase, Supabase, Firestore/Security Rules khi chỉ sắp xếp repository.
6. Đã phát hiện nhiều cặp **ảnh trùng nhị phân** ở các thư mục phiên bản/backup. Chưa xóa các ảnh còn được tham chiếu, vì việc thay đường dẫn tự động có thể làm mất ảnh trên trang con.
7. `archive/` chỉ phục vụ khôi phục. Các script trong `archive/legacy-installers/` là **bản lịch sử**, có thể chứa đường dẫn Windows cũ; **không dùng để triển khai hiện tại**.

## Quy trình thực hiện về sau

- Giao diện mới: thay trực tiếp mã trong `assets/mrlee-ui2027/`, hạn chế thêm tệp `*-override-vNN.css` hoặc menu cạnh tranh.
- Tài liệu cũ và gói cài đặt: giữ trong `archive/`, không đưa lên thư mục gốc.
- Tài liệu thiết kế và kết quả kiểm toán: lưu `docs/`.
- Kiểm thử: `node tools/audit-repo-hygiene.mjs`, `node tools/check-ui-phase5.mjs`, `node tools/check-site.mjs`.
- Trước khi công bố: kiểm tra GitHub Actions, GitHub Pages deployment, và ảnh chụp Chromium của hai giao diện. Các thao tác học sinh đăng nhập, lưu điểm, nộp bài và Admin cần kiểm tra thêm bằng tài khoản thật.

Không sử dụng `git push --force` hoặc xóa nguyên thư mục âm thanh/sao lưu trực tiếp mà không có kiểm tra đường dẫn.
