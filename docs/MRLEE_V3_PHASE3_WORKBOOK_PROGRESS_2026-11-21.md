# MR LEE V3.0 — Giai đoạn 3, Đợt 1: Workbook 10.000 câu

Ngày kiểm toán: 21/11/2026. Nền tảng gốc: `main` tại commit `9f147ab2fd185db07e2ea104204a285deb1cbb31`.

## Phát hiện thực tế

Trong `assets/workbook-v2/practice.js`, hàm `next()` gọi `markSeen(q)` ngay khi dựng giao diện câu hỏi. Vì vậy, một câu chỉ được hiển thị nhưng học viên thoát, reload hoặc đổi bài **đã bị ghi là gặp**, dù chưa chọn đáp án. Điều này làm ngân hàng "câu chưa luyện" bị tiêu hao sai. Ngoài ra `finally` của nút Bắt đầu luôn bật lại nút, khiến một lượt mới có thể khởi động khi lượt trước chưa kết thúc; khi ngân hàng đã hết câu vẫn có lúc bật nút tạm thời.

## Sửa đổi giới hạn phạm vi

1. Chuyển `markSeen` vào callback lựa chọn đáp án: đúng hoặc sai đều tính đã luyện; câu chưa chọn đáp án không bị tiêu hao.
2. Gắn khóa lưu tiến độ với hồ sơ + cấp + bài khi **bắt đầu lượt luyện**, không tự chuyển qua hồ sơ khác nếu input bị thay đổi khi câu hỏi vẫn đang mở.
3. Nút "Bắt đầu" bị vô hiệu trong lượt đang làm; chỉ bật lại sau khi kết thúc và còn câu chưa luyện. Không mở nhiều lượt chồng nhau, không bật lại khi đã hết ngân hàng.
4. Giữ `choose()` ưu tiên câu/chủ điểm chưa gặp; không sửa, không tái sinh, không xóa bất cứ file `bank-cap-*.json` nào.
5. Làm mới cache key JS trong `mrlee-bai-tap-pro.html`, đồng thời cập nhật `tools/check-workbook-bank-v2.mjs` bắt buộc kiểm tra phiên bản thực tế.
6. Thêm bài kiểm thử browser giả lập không kết nối backend: reload khi chưa trả lời, trả lời rồi thoát, không lặp câu đã trả lời, hết câu, reset chủ động, đổi bài, đổi hồ sơ; xác nhận không gửi POST và không sửa dữ liệu điểm khác.

## Kiểm thử bắt buộc trước merge

- `node tools/check-workbook-bank-v2.mjs`: 10.000 câu khác nhau trong 90 bài/6 cấp; đáp án lựa chọn và tham chiếu nằm trong phạm vi giáo trình từng bài.
- `node tools/browser-v3-workbook-progress.mjs` trên Chromium: các tương tác giao diện bằng nút thật, localStorage ẩn danh, không đăng nhập Firebase, không gửi điểm Spark.
- Kiểm tra UI Phase 5 và MR LEE NEXT trên chính head SHA của PR.
- Sau merge mới kiểm tra deployment và chạy thử production với **tài khoản thử nghiệm**, không dùng tài khoản học viên thật.

## An toàn dữ liệu

Không đổi điều kiện nhận điểm Spark, không chỉnh Firebase/Supabase, không xóa lịch sử học tập thực hay câu hỏi. Tính năng "Mở vòng ôn lại" vốn có chỉ xóa vòng ghi nhận câu đã gặp **ở localStorage của hồ sơ/bài đang chọn**, sau khi người dùng xác nhận; không liên quan hệ thống điểm Spark. Đợt này chỉ sửa sai cách đánh dấu, tránh mất cơ hội học tập.

## Giới hạn

Bộ test trình duyệt sử dụng 3 câu giả lập và kiểm chứng logic tương tác; không chứng minh chính xác sư phạm của 10.000 câu. Kiểm định định dạng/phạm vi 10.000 câu là bài test độc lập. Thẩm định chất lượng ngôn ngữ Hàn–Việt vẫn cần giáo viên duyệt nội dung mẫu. Chưa kết luận production Cloudflare đã cập nhật cho đến khi có kiểm chứng trực tiếp.
