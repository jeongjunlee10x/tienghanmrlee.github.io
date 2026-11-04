# TIẾNG HÀN MR LEE — Website học tiếng Hàn và du học Hàn Quốc

Website chính thức: **https://jeongjunlee10x.github.io/tienghanmrlee.github.io/**

## Các khu vực đang sử dụng

| Khu vực | Trang |
| --- | --- |
| Trang chủ, chọn giao diện Tươi mới / Viễn tưởng | [index.html](index.html) |
| Học tiếng Hàn từ cấp 1–6 | [hoc-tieng-han.html](hoc-tieng-han.html) |
| Học và luyện tập theo bài | [hoc-theo-bai.html](hoc-theo-bai.html) |
| Giao tiếp / Phỏng vấn | [giao-tiep-phong-van.html](giao-tiep-phong-van.html) |
| TOPIK I / TOPIK II | [kiem-tra-topik.html](kiem-tra-topik.html) |
| Workbook | [mrlee-bai-tap-pro.html](mrlee-bai-tap-pro.html) |
| Văn hóa Hàn Quốc — 22 chủ đề | [van-hoa-han-quoc.html](van-hoa-han-quoc.html) |
| Bản đồ trường đại học Hàn Quốc | [ban-do-dai-hoc-han-quoc.html](ban-do-dai-hoc-han-quoc.html) |
| Tuyển sinh, định hướng du học | [tuyen-sinh.html](tuyen-sinh.html) |
| Hồ sơ học viên | [trung-tam-hoc-vien.html](trung-tam-hoc-vien.html) |
| Admin (cần xác thực) | [admin.html](admin.html) |

## Cấu trúc Git cần giữ

| Thư mục / nhóm | Vai trò | Nguyên tắc |
| --- | --- | --- |
| `*.html` tại thư mục gốc | Các URL GitHub Pages đang hoạt động | **Không đổi tên hoặc chuyển** nếu chưa sửa toàn bộ liên kết |
| `assets/mrlee-ui2027/` | Giao diện thống nhất V2/V3, 2 theme | Ưu tiên sửa ở đây, tránh viết thêm lớp override mới |
| `assets/branding/`, `assets/images/`, `assets/v306/` | Logo, ảnh hero, ảnh thẻ | Giữ tên tệp đang được HTML/CSS/JS sử dụng |
| `images/` | Ảnh văn hóa/địa danh và nội dung chi tiết | Giữ nguồn, chú thích và thông tin bản quyền |
| `MRLEE_AUDIO/`, `MRLEE_PRO_AUDIO/` | MP3 học bài, Workbook và TOPIK | **Không đổi đường dẫn** khi chưa cập nhật manifest và kiểm thử 404 |
| `assets/topik-v10/`, các tệp `mrlee-topik-*` | Dữ liệu và chức năng TOPIK | Không xóa dữ liệu khi chỉ dọn giao diện |
| `supabase/`, `functions/`, `firestore.rules`, `firebase*.json` | Backend, bảo mật và cấu hình dịch vụ | Không đưa khóa bí mật vào Git hoặc JavaScript phía client |
| `supabase/manual-sql/` | Script SQL thao tác thủ công, **không tự chạy** | Không đưa vào Cloudflare Pages; không chạy lại trên production nếu chưa nghiệm thu |
| `tools/` | Kiểm thử và kiểm toán mã nguồn | Chạy kiểm tra trước khi push |
| `.github/workflows/` | Các bước QA, build, triển khai | Dùng workflow hiện hành; không tự động force-push |
| `docs/` | Tài liệu thiết kế, kiểm toán, hướng dẫn | Tài liệu kỹ thuật lâu dài |
| `archive/legacy-packages/` | Gói ZIP ngày 13/10/2026 | **Lưu trữ lịch sử, không phải tài nguyên live** |
| `archive/legacy-snapshots/` | Các phiên bản website/bài học trước đây | Chỉ tham khảo/khôi phục, không nhúng vào trang hiện hành |
| `archive/legacy-installers/` | Bộ CMD/PowerShell + `FILES/` + manifest cũ | Giữ cùng thư mục để không phá đường dẫn tương đối |

Chi tiết kiểm kê, các thay đổi dọn dẹp và những thứ **không được xóa**: [docs/GIT_REPO_STRUCTURE_2026-11-02.md](docs/GIT_REPO_STRUCTURE_2026-11-02.md).

## Triển khai song song Cloudflare Pages (không thay GitHub Pages)

- Tên miền dự kiến: `https://mrlee.pages.dev/`. Chỉ được xem là hoạt động sau khi tạo project và kiểm thử thực tế.
- Kết nối repository hiện tại với Cloudflare Pages: production branch `main`; build command `node tools/build-cloudflare-pages.mjs && node tools/check-cloudflare-pages-build.mjs`; output directory `dist`; root `/`; Node.js 22+.
- `dist/` chỉ sinh lúc build, nằm trong `.gitignore`, **không commit**, không xóa hay thay đường dẫn GitHub Pages cũ.
- Xem [hướng dẫn thiết lập Cloudflare Pages](docs/CLOUDFLARE_PAGES_DEPLOY.md) và [các script SQL quản trị thủ công](supabase/manual-sql/README.md).

## Chạy QA trước khi đẩy GitHub

Yêu cầu **Node.js 22+**. Không yêu cầu Firebase Blaze hoặc phần mềm có phí.

```powershell
node tools/audit-repo-hygiene.mjs
node tools/check-ui-phase5.mjs
node tools/check-site.mjs
```

Kiểm tra trực quan được thực hiện bởi các GitHub Actions: `mrlee-home-rebuild-v2.yml`, `mrlee-learning-hubs-v2.yml`, `mrlee-workspaces-v3.yml`, `mrlee-ui-phase5.yml`. Kiểm thử tài khoản thật/Firebase/Supabase phải nghiệm thu riêng, không dùng ảnh chụp browser để kết luận an toàn dữ liệu.

## Nguyên tắc cập nhật

1. Ưu tiên **sửa và tái sử dụng mã hiện tại**, không tạo CSS/JS ghi đè phiên bản mới nếu vấn đề giải quyết được trong một tệp.
2. Trước khi xóa tài nguyên, kiểm tra tham chiếu trong HTML, JS, CSS, manifest, GitHub Actions và các đường dẫn sinh động.
3. Không đặt backup/ZIP/công cụ triển khai cũ ở thư mục gốc. Không commit `.env`, khóa dịch vụ, `node_modules`, kết quả kiểm thử hoặc tệp log.
4. Sau khi đổi đường dẫn CSS/JS ảnh, cập nhật cache version, kiểm tra cả hai giao diện và desktop/mobile.
5. Không dùng `git push --force` vào `main`. GitHub Pages và các bài kiểm thử phải đạt trước khi công bố nghiệm thu.

© 2026 TIẾNG HÀN MR LEE.
