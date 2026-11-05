# MR LEE — Cloudflare Pages miễn phí (song song GitHub Pages)

Tình trạng cập nhật 05/11/2026: Pages project `mrlee` đã kết nối GitHub; tên miền thực tế `https://mrlee-b6a.pages.dev/`. Backend CORS đã cập nhật; Firebase/Turnstile/D1 cần nghiệm thu riêng.

## Dữ liệu gốc (GitHub main, 04/11/2026)

- 16.861 tệp, 547,1 MiB; gồm 14.454 MP3.
- Cloudflare Pages Free: tối đa 20.000 tệp/site; 25 MiB/tệp; 500 build/tháng.
- Bộ lọc tĩnh của MR LEE ước tính 16.309 tệp, 499,4 MiB trước khi chạy CI chính xác.
- Không sao chép thư mục archive, .github, docs, tools, functions, supabase, scripts, SQL, ZIP, secret, service-account.
- **Không xóa** bất kỳ tệp hay kho dữ liệu nào ở GitHub.

## 1. Kết nối Cloudflare (thao tác chủ tài khoản)

1. Vào https://dash.cloudflare.com/ và đăng nhập/đăng ký tài khoản Free.
2. Mở **Workers & Pages → Create application → Pages → Connect to Git**.
3. Chọn **GitHub**; chỉ cấp quyền cho repository `jeongjunlee10x/tienghanmrlee.github.io`.
4. Chọn **Project name**: `mrlee` nếu tên chưa có người sử dụng, để nhận `https://mrlee-b6a.pages.dev`.
   - Nếu tên đã có chủ: cân nhắc `mrleevn` hoặc `tienghanmrlee`; đừng coi `mrlee.pages.dev` là đã đăng ký trước khi dashboard xác nhận.
5. Thiết lập:
   - Git repository: `jeongjunlee10x/tienghanmrlee.github.io`
   - Production branch: `main`
   - Framework preset: `None` / `No framework`
   - Root directory: để trống (gốc repository)
   - **Build command**: `node tools/build-cloudflare-pages.mjs`
   - **Build output directory**: `dist`
   - Build environment: `NODE_VERSION=22` nếu cần; Node.js 22+.
   - **Không** điền GitHub token, Supabase service-role key, Firebase secret hoặc Turnstile secret vào frontend/biến build.
6. Chọn **Save and Deploy**. Xem log trong Deployments → Build log.
7. Sau khi tạo, mở `https://<actual-name>.pages.dev/` và thử tải ảnh, MP3, từng trang con.
8. Giữ nguyên GitHub Pages cũ. Không đổi tên repo, không tạo `CNAME`, không chỉnh DNS và không đặt redirect ở domain cũ.

## 2. Hai URL chạy song song

- Cũ (giữ nguyên): https://jeongjunlee10x.github.io/tienghanmrlee.github.io/
- Mới: `https://<actual-name>.pages.dev/` — chỉ có sau khi Cloudflare xác nhận tên.
- `tools/build-cloudflare-pages.mjs` tạo `dist/` (đã bỏ qua bởi .gitignore).
- Mã nguồn website không bị sửa bởi build; chuyển link tuyệt đối `...github.io/tienghanmrlee.github.io/` sang `CF_PAGES_URL` **chỉ trong dist**.
- `/tienghanmrlee.github.io/*` được chuyển về đường dẫn mới qua quy tắc `_redirects` trong dist.
- Cloudflare git integration dùng nhánh `main`; mỗi push có thể tự build và deploy. Giới hạn Free 500 build/tháng.
- Nếu muốn ngừng deploy, tắt auto production deployments trong Cloudflare (không ảnh hưởng GitHub Pages).

## 3. Kiểm tra hệ thống quan trọng trước khi giới thiệu link mới

### Firebase Authentication
Firebase Console → Authentication → Settings → **Authorized domains** → thêm `<actual-name>.pages.dev`.
Giữ nguyên `jeongjunlee10x.github.io`; sau đó thử đăng ký, đăng nhập, đăng xuất và đăng nhập bằng Google (nếu có).

### Cloudflare Turnstile
Cloudflare Dashboard → **Turnstile** → widget đang dùng → Settings → Hostname Management → thêm `<actual-name>.pages.dev`. Giữ nguyên GitHub hostname. Có tối đa 10 hostname/widget trong gói Free.
Thử trang kiểm tra đầu vào và đăng ký tư vấn thực sự gửi thành công qua Supabase.

### Supabase CORS / điểm thưởng
Supabase Reward V2 đã cập nhật v4 để cho phép cả GitHub cũ và `https://mrlee-b6a.pages.dev` theo danh sách origin chặt chẽ; vẫn cần xác minh cơ sở dữ liệu Reward V2 và RLS.
Trước khi chuyển khách truy cập, **cập nhật và triển khai Edge Function** để allowlist đồng thời cả `https://jeongjunlee10x.github.io` và `https://<actual-name>.pages.dev`; sau đó thử tính điểm, lịch sử và bảng xếp hạng. Không thay đổi trực tiếp production khi tên miền mới chưa xác định.

### Đối chiếu hành vi và đường dẫn
- Trang chủ và 8 chuyên mục không phát sinh 404.
- Học 90 bài (6 cấp), workbook, MP3 nghe, bài ghi âm và TOPIK.
- 22 chủ đề văn hóa, ảnh và video.
- Tuyển sinh, kiểm tra đầu vào, đăng ký tư vấn; kiểm tra Turnstile và email/ghi dữ liệu.
- Hồ sơ, đăng nhập, điểm thưởng, BXH và Admin.
- Màn hình desktop 1440px, mobile 390px; cả Fresh/Future.
- Bản cũ GitHub vẫn truy cập được trong suốt quá trình kiểm thử.

## 4. Lệnh tự kiểm tra trước khi deploy

```bash
node --check tools/build-cloudflare-pages.mjs
node tools/build-cloudflare-pages.mjs
node tools/check-cloudflare-pages-build.mjs
```

GitHub Actions: `.github/workflows/mrlee-cloudflare-preflight.yml` chạy đóng gói **không triển khai**, xác minh giới hạn tệp và các thư mục được bỏ qua.

## 5. Khôi phục tức thì khi site mới gặp lỗi

**Không cần rollback GitHub Pages** vì chưa bao giờ thay đổi domain cũ.
Tạm ngừng chia sẻ link mới, kiểm tra Deployments/Build log của Cloudflare,
hoặc tắt automatic deployments; học viên tiếp tục dùng link GitHub cũ.
