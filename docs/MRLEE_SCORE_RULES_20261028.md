# Quy tắc điểm MR LEE — bản cập nhật 28/10/2026

## Nguồn sự thật của thang điểm
- `assets/mrlee-score-v12/points-policy.json`: quy tắc JSON công khai có phiên bản; cả chương trình chấm `scripts/mrlee-score-spark/points-v12-core.cjs` và giao diện `quy-tac-diem-mrlee.html` đọc file này.
- Mỗi lượt cộng thành công mới lưu `policyVersion` trong `mrleeV12Ledger/{uid}/events/{eventId}` và trạng thái yêu cầu chấm. Không tính lại lịch sử hoặc gộp ví cũ.
- GitHub Actions trên Firebase Spark: `.github/workflows/mrlee-score-spark.yml`. Chạy hai lần/giờ (phụ thuộc lịch chạy thực tế), không dùng Cloud Functions Blaze.

## Bảng TOPIK Spark — điểm có máy chủ tính
| Bài | Ngưỡng đạt | Công thức tối đa |
|---|---:|---:|
| Quiz TOPIK ngày | 60% | round(12 × đúng/tổng), không quá 12 |
| Nghe TOPIK ngày | 60% | round(20 × đúng/tổng), không quá 20 |
| Thi thử tổng hợp | 50% | round(40 × đúng/tổng), không quá 40 |
| Thi thử riêng nghe | 60% | round(12 × đúng/tổng), không quá 12 |
| Thi thử riêng đọc | 60% | round(12 × đúng/tổng), không quá 12 |
| Mở trang/điểm danh Spark | không tính | 0 |

Dưới ngưỡng: **0 điểm**; không thưởng do mở trang, video, ảnh, truy vấn AI, chỉ tải audio, tự bấm hoàn thành. Dạng viết và Workbook chưa có chấm máy chủ được kiểm chứng sẽ không tự ghi thêm điểm Spark.

## Định danh chống cộng trùng
- Server cấp biên nhận theo `uid + week + type + item` (mã bài/đề), giao dịch Firestore nguyên tử. Một bài đã nhận điểm trong tuần không thể nhận tiếp ở cùng loại/mã dù luyện lại.
- Mỗi yêu cầu chấm trong một ngày Việt Nam được tạo tối đa một lần cho `uid + day + activityKey`. Nộp không đạt trong ngày không được ghi lại ngay; có thể thử lại ngày khác, vẫn một điểm thưởng/tuần nếu đạt.
- Tuần 00:00 thứ Hai — 23:59:59 Chủ nhật (Asia/Ho_Chi_Minh); qua tuần, điểm tuần mới bắt đầu 0, điểm tích lũy và lịch sử vẫn giữ.

## Ví cũ — điểm động lực không xác minh độc lập
- Số dư mở ví: 100; đăng nhập ngày UTC +2; milestone liên tục ngày 3 +1, 7 +3, 14 +5, 30 +8.
- Hoàn thành bài hoặc luyện nói đủ điều kiện +1 **một lần/mã bài** (có cơ chế tự xác nhận bài học). Bài phục hồi ≥65% khi ví dưới 20 được +15.
- Điểm ví cũ và bảng công khai `bang-xep-hang.html` khác biệt hoàn toàn so với TOPIK Spark `bang-diem-tuan-v12.html`. Không cộng gộp/đổi ví tự động.

## Kiểm toán bảo mật & giới hạn
- **Cảnh báo nghiêm trọng:** bộ đáp án `scripts/mrlee-score-spark/v12-answer-keys.json` hiện tồn tại trong repository công khai. Chấm máy chủ có kiểm tra đáp án nhưng **không đủ chống gian lận** nếu đáp án có thể bị tra cứu. Vì vậy không dùng bảng điểm Spark hiện tại để tự động trao tiền, phạt, cấp chứng chỉ hoặc xếp lớp.
- Khắc phục triệt để sau này: thiết kế bộ đề/bộ đáp án mới không thể tra cứu công khai, triển khai khóa và nội dung máy chủ riêng, kiểm thử chống gian lận bằng Firebase Emulator, và cấp quyền Admin kiểm duyệt. Không đăng khóa service account hay đáp án bí mật lên GitHub Pages.
- `mrlee_reward_v2_awards` và `mrlee_reward_v2_claims` không tồn tại trên Supabase production trong lần kiểm toán gần nhất; đây **không phải** hệ thống tiền thưởng đang hoạt động.
- Kiểm thử nền: `node tools/test-score-policy.cjs`; kiểm thử trình duyệt trong `tools/browser-smoke.mjs`. Cần có tài khoản thử đã xác minh để kiểm thử nộp/chấm và Firebase security rules trên hệ thống thực.
