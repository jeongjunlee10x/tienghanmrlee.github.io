# Kiểm toán website MR LEE — 08/11/2026

> Phạm vi: kiểm tra kết nối GitHub, GitHub Actions logs, Google Search Console tab được chia sẻ và Supabase. Chưa chạy thao tác thay đổi cơ sở dữ liệu hoặc triển khai production.

## Kết quả xác minh

| Mục | Kết quả |
|---|---|
| Repo / commit | `jeongjunlee10x/tienghanmrlee.github.io` / `97cc5da7f6d6fbdc1bc115cb7548422c0cd88a1a` |
| Tệp Git | 17.052 (579 MB, 14.454 MP3, 845 WEBP, 234 CSS, 313 JS, 159 HTML) |
| Preflight Cloudflare | PASS, 16.424 tệp, 14.454 MP3, ~504 MiB; **không deploy**, [log](https://github.com/jeongjunlee10x/tienghanmrlee.github.io/actions/runs/42466003188) |
| Live SEO probe | PASS, 23 requests, 0 errors lúc khoảng 09:13 UTC ngày 08/11; [log](https://github.com/jeongjunlee10x/tienghanmrlee.github.io/actions/runs/42465967705) |
| Google Search Console | Sitemap `/sitemap.xml`: **Không thể tìm nạp**; 0 URL phát hiện trong giao diện ngày 08/11 |
| Supabase | 18 bảng public đều bật RLS; 5 Edge Functions ACTIVE |
| Security Advisor | 5 bảng Arena RLS không có policy — có thể là cố ý chặn truy cập trực tiếp; Auth cảnh báo Leaked Password Protection Disabled |
| Performance Advisor | 7 index chưa được sử dụng — không nên xóa chưa kiểm tra thực tế |
| Game Zone question bank | 24 câu approved, chỉ vocabulary SC1 bài 1 và 2; không đại diện tổng Workbook |
| Auth frontend | `auth-guard.js` không bảo vệ HTML/JS nguồn công khai. Phải bảo vệ thao tác riêng tư phía server |

## Danh mục việc cần xử lý theo thứ tự

1. **P0 — Search Console:** Đối chiếu Cloudflare Production deployment SHA với commit mới nhất; chạy URL Inspection Live Test cho trang chủ, sitemap và hướng dẫn TOPIK. Khảo sát Crawl Stats. Không nộp lại sitemap liên tục khi chưa biết nguyên nhân.
2. **P0 — Phân quyền:** Test quyền admin/student, Firebase JWT hết hạn, RLS, IDOR, thưởng điểm, vàng G, phiên PvP và khóa bàn. Dùng tài khoản test; không ảnh hưởng dữ liệu thật.
3. **P1 — Theo dõi SEO:** Bổ sung lịch kiểm tra read-only hằng ngày vào workflow hiện hữu; artifact JSON lưu 14 ngày. Nếu workflow đỏ, đọc HTTP status và đường dẫn bị lỗi.
4. **P1 — Ngân hàng câu hỏi:** Lập ma trận 6 cấp × 15 bài × loại câu. Bổ sung câu hỏi có kiểm duyệt, không trùng ngữ nghĩa, không vượt phạm vi bài; không nhập hàng loạt vào production.
5. **P1 — Chức năng:** Smoke test login/admin/placement/consultation/TOPIK/workbook/audio/gamezone/Arena trên desktop và mobile.
6. **P1 — Header & 404:** Thiết kế `404.html` và `dist/_headers` thông qua Cloudflare build script; thử trước để không phá mic, Firebase, Turnstile, API và media. CSP chỉ bật sau rà soát nguồn ngoài.
7. **P2 — Hiệu năng & giao diện:** Lighthouse mobile, loading MP3 theo bài, cân đối WebP, 2 giao diện 8 nút, animation Tiến lên, responsive. Không đổi tên file âm thanh khi chưa cập nhật manifest.
8. **P2 — Dọn code:** Phân loại 66 workflow và CSS/JS có còn được tham chiếu trước khi hợp nhất; giữ `archive/`, `supabase/`, bản sao và dữ liệu học viên.

## File đề xuất

- **Trong PR này:** `.github/workflows/mrlee-seo-live-check.yml`, `docs/MRLEE_WEBSITE_AUDIT_2026-11-08.md`.
- **Sau khi QA:** `404.html`, `dist/_headers` (generated), `tests/e2e/critical-path.spec.*`, `docs/ACCESS_CONTROL_MATRIX.md`, `docs/CONTENT_COVERAGE.md`.
- **Tùy chọn PWA:** `manifest.webmanifest`, `sw.js` nếu có chiến lược offline, không cache toàn bộ MP3.

## Giới hạn cần giữ rõ

- GSC báo không thể tìm nạp **không chứng minh** HTTP sitemap lỗi; live probe từ GitHub Actions đã thành công. Google có thể chưa đọc lại sau PR #58.
- Chưa xác minh Cloudflare Dashboard deployment SHA, Firebase Authorized Domains, Turnstile hostnames hoặc API thực thi đủ luồng.
- Tính năng Supabase **Leaked Password Protection** yêu cầu plan Pro theo tài liệu; cần xem có dùng Supabase Auth mật khẩu hay chủ yếu Firebase Auth.
- Cảnh báo RLS no-policy có thể là thiết kế chỉ cho backend (service role) nên **không tự tạo policy mở đọc**.
- Không thay đổi/ghi dữ liệu điểm, ví G, submission, bảng xếp hạng từ quá trình kiểm toán.

**Liên kết:** [PR #58](https://github.com/jeongjunlee10x/tienghanmrlee.github.io/pull/58) · [Google sitemap](https://search.google.com/search-console/sitemaps?resource_id=https%3A%2F%2Fmrlee-b6a.pages.dev%2F) · [Supabase RLS](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
