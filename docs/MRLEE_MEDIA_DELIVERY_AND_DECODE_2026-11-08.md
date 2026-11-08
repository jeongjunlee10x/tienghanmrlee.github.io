# MR LEE — Báo cáo nâng cấp Media đợt 2 (08/11/2026)

## Kết quả GitHub Actions PR #65

| Thử nghiệm | Kết quả đo thực tế |
|---|---:|
| Cloudflare safe build | PASS |
| Dung lượng ảnh nguồn không còn đóng gói lên Cloudflare | **20,78 MiB** |
| Dung lượng `dist` theo builder | **483,39 MiB** |
| PNG cũ không còn trong bản `dist` | **10 tệp** |
| MP3 trong bản build | **14.454** (giữ nguyên) |
| MP3 được giải mã đầy đủ bằng FFmpeg | **70/70**, phủ 14 nhóm học |
| Ảnh được giải mã pixel đầy đủ bằng Pillow | **888/888** |
| File ảnh hỏng phát hiện | **0** |
| Tệp âm thanh mẫu không giải mã được | **0** |
| TOPIK MP3 24 câu (file tồn tại / kích thước) | **24/24** |
| Ảnh nặng trên ngưỡng 450 KB | **33** |
| Trùng ảnh nguyên file | **62** |

Bằng chứng CI:
- Cloudflare preflight: https://github.com/jeongjunlee10x/tienghanmrlee.github.io/actions/runs/42498844406
- Media integrity + decode: https://github.com/jeongjunlee10x/tienghanmrlee.github.io/actions/runs/42498844403

## Cách xử lý

- Giữ các tệp `images/1.png` … `images/9.png` cùng `images/tourism-map/source/mrlee-korea-tourism-map-original.png` trong **GitHub**. Chúng là nguồn lưu trữ, không cần tải bởi khách truy cập trong bản Cloudflare.
- Công cụ build **chặn loại bỏ** nếu phát hiện bất kỳ HTML, JS, CSS, JSON, SVG hoặc TXT công khai nào trỏ đến 10 đường dẫn trên.
- Giữ ảnh bản đồ WebP đang sử dụng tại `images/tourism-map/mrlee-korea-tourism-map.webp`.
- `tools/check-mp3-decode-sample.mjs` chọn mẫu MP3 phân tán từ 14 nhóm, phát hiện file không có codec MP3 hoặc không thể giải mã hoàn chỉnh.
- `tools/check-image-decoding.py` xác thực ảnh bằng Pillow `verify()` và `load()`; kiểm tra cấu trúc và giải mã hoàn chỉnh pixel.

## Giới hạn / việc tiếp theo

Các kiểm thử kỹ thuật chỉ xác thực tính toàn vẹn của mã hóa, **không** thay thế việc nghe tiếng Hàn để đánh giá tốc độ, phát âm, giọng nam/nữ, nhịp nghỉ hoặc đối chiếu nội dung học; cũng không chứng minh từng ảnh minh họa khớp bài học.

Nên ưu tiên các ảnh hơn 450KB đang được sử dụng thật, tạo biến thể WebP tối ưu nhưng giữ nguyên thiết kế, nét mặt và bố cục; duyệt ảnh trước khi thay thế.

**Trạng thái:** PR #65 chưa merge; kiểm thử Cloudflare/Media đều PASS. Không có file MP3 hay ảnh gốc nào bị ghi đè, không chỉnh Supabase/điểm/ví vàng.
