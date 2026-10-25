# MR LEE V3 — kế hoạch thay toàn bộ thư viện ảnh mới

> **Trạng thái:** Bộ prompt V3 đã hoàn thiện thành ZIP 170 tệp prompt trong cuộc trò chuyện. **Chưa có ảnh V3 nào được render hoặc đưa lên GitHub**, vì vậy tuyệt đối không trỏ các trang production đến tệp V3 chưa tồn tại.

## Phong cách phải khớp hai ảnh duyệt

- **Tươi mới:** nền trắng ngà / xanh sapphire / tím pastel, ánh sáng ban ngày, Seoul và hoa anh đào, thẻ có ảnh, chữ rõ. Màu chủ đạo `#F7FBFF`, `#147BF1`, `#DDF4FF`, `#112F5B`.
- **Viễn tưởng:** đen xanh navy, Seoul về đêm, neon cyan / blue / violet, độ tương phản mạnh nhưng chữ và hành động đủ rõ. Màu chủ đạo `#03102B`, `#37EAFF`, `#157BFF`, `#9862FF`.
- Cấu trúc, thứ tự menu, liên kết và dữ liệu giống nhau giữa 2 theme. Logo gốc luôn cùng file. Không tách hệ thống điểm / người dùng theo theme.
- **Không thể dựng website pixel-perfect chỉ bằng ảnh AI ghép chữ**: tạo phông nền/ảnh chủ đề riêng, còn các lớp chữ, chỉ số, CTA, logo vector và đồ thị dựng bằng HTML/CSS/SVG.
- Không dùng kho ảnh V1/V2 cho V3; những hình V3 chưa hoàn thiện phải không được đưa vào production.

## 170 prompt mới chia 13 nhóm

| Thư mục | Số prompt | Mục đích |
|---|---:|---|
| `01_trang_chu` | 12 | 2 hero + 10 ảnh chức năng |
| `02_hoc_tieng_han` | 17 | 2 hero + 6 cấp + 6 chức năng + 3 banner |
| `03_giao_tiep` | 15 | 2 hero + 8 tình huống + 5 cách luyện |
| `04_topik` | 11 | 2 hero + 5 khu thi + 4 chủ đề |
| `05_phong_van` | 12 | 2 hero + 6 chủ đề + 4 công cụ |
| `06_van_hoa` | 18 | 2 hero + 8 chủ đề + 8 gallery |
| `07_ban_do_dai_hoc` | 18 | 2 hero + minh họa bản đồ + 7 khu campus + 8 vùng |
| `08_workbook` | 13 | 2 hero + 7 dạng bài + 4 chương trình |
| `09_ho_so_hoc_vien` | 8 | 2 hero + 6 nội dung cá nhân |
| `10_admin` | 8 | 2 hero + 6 module quản lý |
| `11_logo_va_nhan_dien` | 26 | 4 phương án biểu tượng logo + 22 icon riêng |
| `12_banner_phu_tro` | 6 | 6 banner CTA riêng |
| `13_nen_va_hieu_ung` | 6 | 6 phông nền riêng |

**Tổng = 170 ảnh độc lập.** Mỗi prompt file `*.prompt.txt` trong ZIP có ảnh chủ đề, ánh sáng, bố cục, độ phân giải, vùng an toàn đặt chữ, negative prompt và đường dẫn đích.

## Thư mục sản xuất

```text
assets/mrlee-ai/v3/
  01_trang_chu/
  02_hoc_tieng_han/
  03_giao_tiep/
  04_topik/
  05_phong_van/
  06_van_hoa/
  07_ban_do_dai_hoc/
  08_workbook/
  09_ho_so_hoc_vien/
  10_admin/
  11_logo_va_nhan_dien/
  12_banner_phu_tro/
  13_nen_va_hieu_ung/
  14_manifest_va_QA/
```

Ảnh hero dùng `hero-fresh.webp` và `hero-future.webp` tương ứng. Thẻ cấp độ có `level-01.webp` … `level-06.webp`; ảnh đơn khác theo tên slug đúng manifest. Chưa được copy ảnh cũ sang tên mới chỉ để vượt kiểm tra.

## Điều kiện trước khi đưa vào site

1. Sinh ảnh master mới từ từng prompt; không copy ảnh từ bản mẫu, không dùng một ảnh cho nhiều card.
2. Tách riêng logo và 22 icon; thiết kế logo phải duyệt, không tự thay file gốc `assets/branding/logo-mrlee.png`.
3. QA kiểm tra ảnh 2560×1120 cho hero, 1000×640 cho card, pHash/tương đồng cảnh, hình mờ và ảnh thiếu; xem lại bằng mắt để loại ảnh lặp về bố cục.
4. HTML text và số liệu Admin/TOPIK/học viên chỉ từ dữ liệu xác thực. Không dùng con số minh họa như 50.000 học viên, 96%, 4.9/5 khi không có nguồn.
5. Bản đồ AI chỉ là **minh họa**; toạ độ, vị trí và thông tin đại học phải lấy từ dữ liệu GIS/trường chính thức.
6. Thử theme trên 390 / 768 / 1440px, kiểm tra không cần cuộn để chọn các nút chính khi desktop đủ không gian; không thu quá nhỏ nút trên mobile.
7. Chạy kiểm tra nguồn đang có `node tools/check-site.mjs` và QA hình trong ZIP. Thay ảnh từng phần trên nhánh phát triển có rollback, không tắt QA cho đủ số lượng.

## Tệp gốc trao đổi

Tệp `MRLEE_V3_170_PROMPT_ANH_RIENG_THEO_THU_MUC.zip` được xuất trong cuộc trò chuyện. Nội dung gồm 170 prompt và `manifest.json`, `manifest.csv`, `README.md`, `design-tokens-v3.css`, `tools/qa_assets_v3.py`. Chưa được chuyển trực tiếp thành 170 ảnh WebP trên repository.

**Giai đoạn này là triển khai đặc tả và hệ thống lưu trữ, không phải bản production đã đổi ảnh.**
