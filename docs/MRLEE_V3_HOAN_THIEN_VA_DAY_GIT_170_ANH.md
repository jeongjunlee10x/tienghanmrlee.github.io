# MR LEE V3 — Quy trình tạo và xuất bản thư viện ảnh mới hoàn chỉnh

## Đã có trên GitHub
- `assets/mrlee-ai/v3/14_manifest_va_QA/manifest.json`: 170 vị trí ảnh cụ thể, đúng 13 thư mục nội dung.
- `tools/mrlee-v3-assets.py`: nhập và kiểm tra ảnh mới bằng Pillow; chống lặp chính xác, cảnh báo gần trùng, ảnh độ phân giải thấp, ảnh cùng byte với V1/V2.
- `tools/PUSH_MRLEE_V3.ps1`: nhập ảnh + 170 prompt gốc rồi Git push sang nhánh duyệt.
- `.github/workflows/mrlee-v3-170-images.yml`: GitHub CI. **Chỉ đạt đủ ảnh khi thực tế có cả 170 file**.

## Hiện trạng
- 170 prompt có trong ZIP gốc của hội thoại, có thể dùng từng cái để sinh ảnh mới.
- 170 ảnh độc lập **chưa được tạo**. GitHub hiện chỉ có manifest và công cụ, chưa phải thư viện hình ảnh mới đã xuất bản.
- Website production vẫn dùng kho cũ, cố ý tránh ảnh lỗi và không giả mạo ảnh mới.

## Sơ đồ sản xuất
1. Giữ ảnh tham chiếu Fresh và Future làm chuẩn bố cục. Không cắt từ mockup để dùng lại.
2. Tạo **20 hero mới** (10 trang × Fresh/Future), mỗi ảnh riêng 2560×1120, không có chữ/logo trong ảnh.
3. Tạo **92 card mới**, **16 ảnh gallery**, **9 banner**, **6 nền**, **1 minh họa bản đồ**, **4 logo concept** và **22 icon**. Đây là 170 tài nguyên độc lập; logo concept không thay logo chính thức khi chưa được duyệt.
4. Mỗi file lưu đúng `folder/slug.png` trong thư mục ảnh master, ví dụ:
   `D:\MRLEE_V3_ANH_MOI\01_trang_chu\hero-fresh.png`
   `D:\MRLEE_V3_ANH_MOI\02_hoc_tieng_han\level-01.png`
   `D:\MRLEE_V3_ANH_MOI\11_logo_va_nhan_dien\icon-workbook.png`
5. Kiểm tra bằng mắt toàn bộ bộ ảnh (mặt, tay, tiếng Hàn vô tình xuất hiện, cảnh Seoul, ánh sáng, trùng nội dung).
6. Mở PowerShell:
   ```powershell
   cd C:\Users\Surface\Documents\tienghanmrlee.github.io
   git pull --ff-only origin main
   powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\PUSH_MRLEE_V3.ps1" -ImageSource "D:\MRLEE_V3_ANH_MOI" -PromptZip "$env:USERPROFILE\Downloads\MRLEE_V3_170_PROMPT_ANH_RIENG_THEO_THU_MUC.zip"
   ```
   Hệ thống sẽ chuyển 144 ảnh sang WebP, giữ 26 PNG icon/logo concept, kiểm tra đủ 170, chặn bản chất lượng thấp, chặn ảnh cũ và ảnh trùng. Script **không tự đẩy vào main**.
7. Trên GitHub, chạy CI, mở PR từ nhánh `mrlee-v3-real-assets-...`. Tiếp tục review và chạy browser smoke trên 10 trang để xác nhận hiển thị 2 theme với dữ liệu thật.
8. Sau QA và phê duyệt: bổ sung component ảnh `picture` / CSS `background-image` mapping theo manifest, kiểm tra menu 6 cấp và Admin. Hợp nhất vào main, xác nhận GitHub Pages Success.

## Nguyên tắc an toàn
- Không ép hiển thị toàn bộ ảnh dọc trên điện thoại trong một màn hình — ưu tiên thao tác rõ.
- Không dán số liệu giả (ví dụ 50.000 học viên) lên ảnh nền.
- Không làm ảnh bản đồ thay dữ liệu tọa độ đại học thật.
- Không copy kho ảnh v303/v306/v1/v2 chỉ để đủ manifest V3.
- Không thay `assets/branding/logo-mrlee.png` trước khi concept mới được duyệt.
- Nếu thiếu dù chỉ 1 ảnh, không được nói rằng thư viện V3 hoàn chỉnh.

## Cách kiểm tra trạng thái bất cứ lúc nào

```powershell
py -3.12 -m pip install --user Pillow
py -3.12 tools\mrlee-v3-assets.py --root . --strict
```
Máy trả về báo cáo `assets/mrlee-ai/v3/14_manifest_va_QA/qa-result.json` cho biết file nào thiếu, độ phân giải nào sai, ảnh cũ/trùng nhau và ảnh cần xem lại.
