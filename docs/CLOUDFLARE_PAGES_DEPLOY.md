# TIẾNG HÀN MR LEE — kết nối Cloudflare Pages miễn phí

Trạng thái cập nhật 05/11/2026: dự án Pages đã được tạo và deployment đầu tiên thành công theo Dashboard. Bản mới nhất cần kiểm tra lại sau mỗi commit.

## Nguồn và mục tiêu

- Repo: `jeongjunlee10x/tienghanmrlee.github.io`
- GitHub Pages cũ (giữ nguyên): `https://jeongjunlee10x.github.io/tienghanmrlee.github.io/`
- Cloudflare Pages project: `mrlee`; tên miền được cấp thực tế: `https://mrlee-b6a.pages.dev/`.
- Production branch: `main`

## Thiết lập trong Cloudflare Dashboard

1. Đăng nhập Cloudflare → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git** / import repository (tên nút có thể thay đổi).
2. Cấp quyền Cloudflare GitHub App cho repository `jeongjunlee10x/tienghanmrlee.github.io` (nên chỉ chọn repository này).
3. Chọn project name `mrlee` nếu còn khả dụng; framework preset `None`.
4. Production branch: `main`. Root directory: `/`.
5. Build command: `node tools/build-cloudflare-pages.mjs && node tools/check-cloudflare-pages-build.mjs`
6. Build output directory: `dist`.
7. Environment variables: `NODE_VERSION=22` và `MRLEE_SITE_ORIGIN=https://mrlee-b6a.pages.dev`.
8. Deploy. Đợi Cloudflare báo thành công rồi thử domain thực tế; **không** đổi cài đặt GitHub Pages.

## Kiểm thử trước khi công bố

- Build độc lập đã chạy thành công trên GitHub Actions ngày 04/11/2026: **16.310 tệp, 14.454 MP3, ~499,4 MiB**, không chứa `archive/`, `docs/`, `tools/`, `supabase/`, ZIP/SQL/backend.
- Lệnh kiểm thử lại: `node tools/build-cloudflare-pages.mjs && node tools/check-cloudflare-pages-build.mjs`.
- Giới hạn Pages Free được đối chiếu: **20.000 tệp**, tối đa **25 MiB/tệp**. Quy mô lớn vẫn cần xác nhận build trực tiếp trong Cloudflare vì còn các hạn chế khác.
- Kiểm thử trang chủ hai giao diện, ảnh bìa, bộ ảnh văn hóa, đường dẫn trang con, mẫu nghe TOPIK và phân vai âm thanh, login, Admin, điểm thưởng, tuyển sinh, kiểm tra đầu vào và link liên hệ.
- **Firebase Authentication**: thêm `mrlee-b6a.pages.dev` vào Authorized domains, đồng thời kiểm tra nhà cung cấp đăng nhập/redirect; không gỡ domain cũ.
- **Cloudflare Turnstile**: thêm `mrlee-b6a.pages.dev` vào hostnames của widget đang dùng; không đưa secret key vào HTML/JS.
- **Supabase Edge Function**: xác minh CORS và phản hồi submit từ origin mới; cần thử với tài khoản thử nghiệm.
- Chỉ sau khi chạy thử và xác minh mới thông báo đường dẫn mới cho học viên.

## Không di chuyển mã nguồn live hàng loạt

Các file `*.html`, JS/CSS root, `assets/`, `images/`, `MRLEE_AUDIO/`, `MRLEE_PRO_AUDIO/` giữ nguyên đường dẫn để bảo toàn GitHub Pages và dữ liệu học tập. Các SQL thủ công được xếp trong `supabase/manual-sql/`. Kết quả `dist/` tự sinh và bị `.gitignore` loại khỏi Git.

## Tham khảo

- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/configuration/build-configuration/
- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/

## Cập nhật 05/11/2026

- Đã triển khai trực tiếp CORS cho Supabase Edge Functions `mrlee-placement-submit` v2, `mrlee-consultation-submit` v3, `mrlee-reward-v2` v4, cho phép cả GitHub cũ và `mrlee-b6a.pages.dev` (giữ kiểm tra Turnstile hostname theo Origin).
- Bộ xuất tĩnh tự sửa biến `MRLEE_SITE_ORIGIN` cũ `https://mrlee.pages.dev` nếu vẫn còn trong Dashboard. **Vẫn nên sửa biến ở Dashboard** để đồng bộ nguồn cấu hình.
- Cần chủ tài khoản thêm tên miền mới vào **Firebase Authentication → Authorized domains** và **Cloudflare Turnstile → Hostnames**; hai thay đổi này không thể được xác nhận chỉ qua GitHub.
- Nếu dùng API `/api/mrlee-online`, cần secret `QUIZ_SIGNING_SECRET` có độ dài tối thiểu 32 ký tự. Nếu dùng chấm TOPIK `/api/mrlee-topik`, cần D1 binding `MRLEE_QUIZ_DB` với schema `topik_attempts`. Không cam kết hai API hoạt động khi chưa kiểm thử thực tế.
- **Không** chạy migration Reward V2 chỉ để làm mất cảnh báo. Cần xem lại các bảng, RLS, và quy trình cấp thưởng trước.
