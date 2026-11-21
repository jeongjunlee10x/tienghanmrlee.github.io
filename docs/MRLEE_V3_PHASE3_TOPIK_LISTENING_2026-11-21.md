# MR LEE V3.0 — Giai đoạn 3, Đợt 2: TOPIK 24 bài nghe

Ngày: 21/11/2026. Xuất phát từ `main` tại commit `27e51b520b8e29f2fb2ca496dcb312e12c806a0c`.

## Lỗi đã truy nguyên

Trang `topik-nghe-24-cau.html` có hai nút riêng `Nghe 1×` và `Nghe chậm 0,8×`. Script cục bộ đặt `audio.playbackRate=0.8` rồi gọi `audio.play()`. Tuy nhiên, `mrlee-listening-plus.js` cũng nâng cấp cùng phần tử `audio[controls]`, gắn listener `play` và ghi đè playbackRate theo thiết lập chung (mặc định 1). Vì thế, giao diện ghi 0,8× nhưng âm thanh có thể vẫn chạy ở tốc độ 1×; đồng thời xuất hiện điều khiển nghe trùng nhau.

## Những thay đổi có giới hạn

1. Gắn `data-no-audio-plus="1"` ở container của **riêng 24 thẻ nghe TOPIK**, dùng cơ chế opt-out vốn đã hỗ trợ trong `mrlee-listening-plus.js`. Không can thiệp thư viện âm thanh dùng chung, hệ thống TOPIK khác hoặc file MP3.
2. Giữ lại đúng hai nút tốc độ tại từng thẻ. Nút hiện hành có `aria-pressed` rõ ràng, phát tốc độ chuẩn 1× hoặc chậm 0,8× mà không bị lớp enhancer thay đổi.
3. Nút hiện/ẩn lời thoại có `aria-expanded` và `aria-controls` nối với transcript riêng của mỗi thẻ.
4. Bộ lọc Tất cả / TOPIK I / TOPIK II có trạng thái `aria-pressed` và vùng focus rõ nét.
5. Bổ sung audit tĩnh để bắt buộc có 24 thẻ độc lập, 12 TOPIK I + 12 TOPIK II, 24 file MP3 thật từ đường dẫn hiện hành, câu hỏi/lời thoại tiếng Hàn và các thành phần điều khiển.
6. Workflow Chromium thử trang thật ở Fresh/Future, mobile 390px và desktop 1440px; mô phỏng lời gọi play để kiểm tra thuộc tính tốc độ, *không* thay thế đánh giá thính giác và không phát sinh điểm.
7. Screenshots được lưu trong artifact `mrlee-v3-topik-listening`.

## Ranh giới và dữ liệu

Không xóa MP3, không tái tạo file âm thanh, không sửa câu hỏi hoặc lời thoại, không thay cách chấm TOPIK, không thay điểm Spark, Firebase/Supabase, hay tài khoản học viên. Trạng thái `Đã ôn` tiếp tục lưu localStorage và chỉ thay khi người học tự đánh dấu.

## Tiêu chí nghiệm thu

- Kiểm tra tĩnh tất cả 24 MP3 và 12/12 cấp độ, tham chiếu ảnh/JS/HTML hợp lệ.
- Chromium xác minh 0,8× không bị ghi đè, 1× bình thường, không có toolbar nghe trùng, bộ lọc + transcript + tiến độ làm việc và tồn tại sau reload.
- GitHub Actions trên head PR phải thành công trước khi merge.
- Cần kiểm chứng sản phẩm Cloudflare riêng sau merge; kiểm tra code/fixture không chứng minh giọng đọc MP3 có chất lượng như bài thi TOPIK thật. Thẩm định nội dung Hàn–Việt và chất lượng âm thanh cần nghe và đối chiếu từng câu.

## Vấn đề tiếp theo

Sau PR, có thể thực hiện kiểm tra chất lượng ngôn ngữ của TOPIK và câu trả lời mẫu theo rubric giáo viên, đánh dấu từng mục cần duyệt thay vì tự suy diễn từ kiểm thử kỹ thuật.
