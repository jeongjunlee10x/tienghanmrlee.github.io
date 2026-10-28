# MR LEE — Điểm phần Học 1–6 và Workbook, ngày 28/10/2026

## Hành vi được bổ sung

- Phạm vi: `hoc-theo-bai.html` (6 cấp, 90 bài) → `mrlee-bai-tap-pro.html` (15 bộ/bài, 6 câu/bộ), tổng **1.350 bộ**; vẫn giữ các bài học Sơ cấp gốc và điểm động lực +1 cũ.
- Khi người học đăng nhập Firebase đã xác minh email, làm đủ 6 câu một bộ Workbook: **3/6 hoặc thấp hơn = 0 điểm Spark; 4/6 = 4 điểm; 5/6 = 5 điểm; 6/6 = 6 điểm.**
- Đạt ít nhất **2 bộ khác nhau** trong **cùng một bài và tuần Việt Nam** thì cộng thêm **+3 điểm hoàn thành bài** vào lần chấm bộ thứ hai. Một bài chỉ nhận khoản thưởng hoàn thành **một lần mỗi tuần**.
- Mỗi tài khoản/chủ đề/bộ Workbook chỉ nhận một lần điểm Spark trong cùng tuần. Mỗi ngày chỉ có một đơn chấm cho cùng bộ; nếu dưới ngưỡng hoặc bài bị lỗi, trạng thái thông báo rõ. Lượt luyện lại không xóa lịch sử.
- Không cộng Spark chỉ vì mở bài, đọc từ vựng, nghe audio, tải lại trang, tự bấm hoàn thành. Nút +1 cũ vẫn riêng ví động lực, không cộng hai lần vào Spark.
- Sau khi gửi bài, điểm chờ máy chủ GitHub Actions xử lý theo đợt. Mã bài và số câu đúng được xác minh bằng bộ câu hỏi gốc `mrlee-pro-lessons.json` trên GitHub runner, không tin vào `score` do trình duyệt gửi.

## Tính điểm và giới hạn kỹ thuật

- Tệp nguồn sự thật: `assets/mrlee-score-v12/points-policy.json`, phiên bản `MRLEE-SPARK-2026-10-28-LESSON`.
- Frontend: `mrlee-bai-tap-pro.js` gửi 6 mục `q1…q6` cùng lựa chọn (hoặc -1 khi bỏ qua) qua `assets/mrlee-score-v12/widget.js`; trạng thái được hiển thị tại kết quả Workbook.
- Backend: `scripts/mrlee-score-spark/runner.cjs` chấm lại từng lựa chọn từ dữ liệu thật, áp dụng chính sách trong `points-v12-core.cjs`; mỗi bản ghi thưởng có biên nhận chống cộng trùng theo `uid + week + type + item`. Điểm hoàn thành bài được quản lý bằng `mrleeV12LessonProgress/{week}/members/{uid}/lessons/{lessonId}`, chỉ Admin SDK ghi.
- Security: `firestore.rules` chỉ cho phép tài khoản email xác minh CREATE yêu cầu chấm 6 đáp án hợp lệ, không cho sửa/xóa hoặc tự ghi bảng điểm/biên nhận.
- Triển khai security rules: `.github/workflows/mrlee-firestore-rules-release.yml` chạy kiểm tra 90 bài, khởi động Firestore emulator và nếu đạt mới triển khai **duy nhất** Firestore Rules bằng service-account secret của GitHub. Không dùng Firebase Cloud Functions Blaze.
- QA: `tools/test-score-policy.cjs` kiểm tra **25 trường hợp số học**, 90 bài/1.350 bộ/8.100 câu, mẫu khóa câu hỏi, phân biệt các loại điểm và logic chống cộng trùng. CI static site và Chromium cũng được giữ.

## Rủi ro phải minh bạch

- Bộ câu hỏi và đáp án của bài tập có sẵn trong website công khai để học viên luyện tập. Do đó dù server chấm lại, điểm này là **điểm thi đua học tập tham khảo**, không thể xác minh chống gian lận hoàn toàn. **Không dùng tự động cho thưởng tiền, học bổng, cấp chứng chỉ hoặc kỷ luật**.
- Sử dụng Firebase Auth xác minh email, quyền học viên và giới hạn chống cộng trùng theo tài khoản, không tự ý cộng lại các bài đã hoàn thành trong quá khứ.
- Cần xác minh workflow deploy Firestore Rules thành công trước khi khẳng định nộp Workbook sẽ được chấp nhận trên Firebase production; nếu workflow báo lỗi phân quyền, phải kiểm tra cấu hình dịch vụ, không tự mở quyền ghi điểm ở phía client.

## Đường dẫn

- [Học 90 bài](../hoc-theo-bai.html)
- [Workbook](../mrlee-bai-tap-pro.html)
- [Quy tắc tích điểm](../quy-tac-diem-mrlee.html)
- [Bảng điểm tuần chung](../bang-diem-tuan-v12.html)
