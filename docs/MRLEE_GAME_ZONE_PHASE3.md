# MR LEE GAME ZONE — Giai đoạn 3

## Nội dung
- Đủ 10 trò chơi: TOPIK Battle có giới hạn thời gian; Korean Travel chọn địa điểm đã học.
- Các trò chơi cơ bản chỉ có XP luyện tập trong phiên, không cộng với TOPIK Spark hoặc ví điểm cũ.
- Thử thách riêng 5 câu đã duyệt được chấm trực tiếp tại PostgreSQL và mới đủ điều kiện nhận XP xác minh.

## Xác thực
- Học viên dùng Firebase Authentication hiện hữu, tài khoản Admin dùng Supabase Auth riêng.
- SQL bổ sung: supabase/manual-sql/MRLEE_GAME_ZONE_SETUP.sql — chỉ chạy sau kiểm tra quyền và schema; không được tự chạy qua Cloudflare/GitHub Pages.
- Edge Function: supabase/functions/mrlee-game-zone/index.ts, triển khai verify_jwt=false bởi vì hàm tự xác minh Firebase RS256.
- Không trả khóa đáp án ra client, không tiết lộ service_role. RPC độc quyền service_role chấm và ghi XP trong một giao dịch.
- RLS cho mọi bảng; chỉ Admin Supabase có quyền nhập và duyệt ngân hàng.

## Quy tắc XP riêng
- Tối đa 15 lần lấy đề trong 24 giờ, thời hạn nộp 10 phút, đúng tối thiểu 3/5 để nhận thưởng.
- Mỗi bài đã đủ điều kiện nhận tối đa 20 XP một lần/tuần Việt Nam; tổng tối đa 100 XP/ngày.
- Thang điểm Game Zone không chuyển đổi thành TOPIK Spark, học bổng, tiền, giấy chứng nhận hay kỷ luật.
- Ngay cả máy chủ chấm đáp án cũng không chống được mọi gian lận; điểm là thành tích học tập tham khảo.

## Ngân hàng câu hỏi
1. Truy cập admin.html và đăng nhập Admin Supabase đã được cấp quyền.
2. Chọn Quản trị Game Zone — quan-tri-tro-choi.html.
3. Nhập JSON Lines, tối đa 50 dòng/lượt. Mỗi dòng cần cap 1–6, bai 1–15, kind thuộc vocabulary/grammar/reading, prompt, options gồm 4 lựa chọn, answer_index 0–3, explanation.
4. Mỗi câu được nhập trong trạng thái CHƯA duyệt; giáo viên kiểm tra phạm vi bài, chính tả, ý nghĩa và duyệt từng câu.
5. Chỉ bài có ít nhất 5 câu được duyệt mới mở thử thách nhận XP xác minh.
6. Không commit kho câu có đáp án lên GitHub công khai. Không nhầm kho Workbook 10k câu với ngân hàng đã được giáo viên thẩm định.

## Trước khi công bố điểm xác minh
- Kiểm tra backup/schema Supabase, RLS và quyền Admin.
- Deploy Edge Function và xác thực tài khoản Firebase thật, bao gồm gửi một đề trùng, gửi thiếu câu, quá hạn, tài khoản không xác minh email.
- Thử giới hạn ngày/tuần bằng các tài khoản thử nghiệm; kiểm tra dữ liệu lịch sử đã giữ nguyên.
- Nếu backend chưa sẵn sàng hoặc chưa đủ câu đã duyệt, 10 trò chơi vẫn hoạt động; khu vực điểm xác minh sẽ hiển thị trạng thái phù hợp.