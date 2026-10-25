# MR LEE — Direct installation of categorized visual library

Date: 25 October 2026. Deployed through connected GitHub app, not by editing the user's Windows source.

**Assets actually included:** 10 real, distinct WebP binaries already available on GitHub, copied into dedicated `assets/mrlee-ai/v2/{folder}/hero/` folders by Git blob reference. These images are not the same as the 30 image variants in the previously generated ZIP. Original ZIP variants are **not uploaded** due to the binary bridge limitation between conversation sandbox and GitHub app.

**User experience:** image swaps only on a successful load, preserving original media when an asset is absent. Original logo `assets/branding/logo-mrlee.png`, both Fresh/Future palettes, and existing forms/scores remain unchanged. Every page points to a distinct source blob, not repeated image bytes across topics.

**10 routes:**
- Trang chủ: `index.html` → `assets/mrlee-ai/v2/01_trang_chu/hero/hero-desktop.webp` (original `assets/v303/hero-glasses.webp`)
- Học tiếng Hàn: `hoc-tieng-han.html` → `assets/mrlee-ai/v2/02_hoc_tieng_han/hero/hero-desktop.webp` (original `assets/v306/images/feature-5-hoc-tieng-han.webp`)
- Giao tiếp: `giao-tiep-theo-chu-de.html` → `assets/mrlee-ai/v2/03_giao_tiep/hero/hero-desktop.webp` (original `assets/v306/images/learning-cap-2.webp`)
- TOPIK: `kiem-tra-topik.html` → `assets/mrlee-ai/v2/04_topik/hero/hero-desktop.webp` (original `assets/v306/images/feature-6-thi-topik.webp`)
- Phỏng vấn: `giao-tiep-phong-van.html` → `assets/mrlee-ai/v2/05_phong_van/hero/hero-desktop.webp` (original `assets/v306/images/step-1-tu-van.webp`)
- Văn hóa: `van-hoa-han-quoc.html` → `assets/mrlee-ai/v2/06_van_hoa/hero/hero-desktop.webp` (original `assets/v306/images/culture.webp`)
- Bản đồ đại học: `ban-do-dai-hoc-han-quoc.html` → `assets/mrlee-ai/v2/07_ban_do_dai_hoc/hero/hero-desktop.webp` (original `assets/v306/images/feature-2-ban-do.webp`)
- WORKBOOK: `mrlee-bai-tap-pro.html` → `assets/mrlee-ai/v2/08_workbook/hero/hero-desktop.webp` (original `assets/v306/images/learning-books.webp`)
- Hồ sơ học viên: `trung-tam-hoc-vien.html` → `assets/mrlee-ai/v2/09_ho_so_hoc_vien/hero/hero-desktop.webp` (original `assets/v306/images/learning-roadmap.webp`)
- Admin: `admin.html` → `assets/mrlee-ai/v2/10_admin/hero/hero-desktop.webp` (original `assets/v306/images/step-2-ho-so.webp`)

**Need remaining work:** transfer original 30 high-resolution WebP variants from `MRLEE_AI_V2_PHAN_THU_MUC_CO_ANH.zip` into matching folders through binary-enabled upload, replace existing originals, and test visual similarity. Do not report that exact ZIP images were deployed.
