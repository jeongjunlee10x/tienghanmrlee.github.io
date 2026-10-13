# TIẾNG HÀN MR LEE – LỘ TRÌNH 1–6 & STREAK 2026

## 1. Nội dung

- **Cấp 1–2:** giữ nguyên 30 bài Sơ cấp 1 và Sơ cấp 2; liên kết về `so-cap-1.html`, `so-cap-2.html` cùng 4 mẫu nói/bài đã có.
- **Cấp 3–6:** 60 bài học mới (15 bài/cấp), có chủ đề, mục tiêu, trọng tâm ngữ pháp, 4 câu Hàn–Việt, câu hỏi phản xạ tự do. Tổng mới **240 câu luyện nói**.
- **Tổng lộ trình:** 6 cấp × 15 bài = **90 bài**. Bộ luyện nói có **109 bài theo cấp & chủ đề** (90 giáo trình + 19 giao tiếp), **455 câu nhận diện theo mẫu** (360 theo giáo trình + 95 theo chủ đề), cộng hai bài phục hồi.
- **Điểm:** khởi đầu 100, tối đa 200; thưởng login +2 UTC/ngày, thưởng mốc 3/7/14/30 ngày: +1/+3/+5/+8. Khi streak 7/14/30+ ngày, **bài luyện nói từ 60/100** được tăng +1/+2/+3 điểm, ngoài thưởng +6/+10 theo mức đạt. Dưới 60: −3; phục hồi đạt ≥65: +15 (tối đa mỗi bài/ngày).
- Trang `lo-trinh-1-6.html` và `luyen-noi-tinh-diem.html` hoạt động trên GitHub Pages dùng Firebase hiện tại. Bài cấp 3–6 được biên soạn mới, không phải sao chép sách Sejong.

## 2. Cài đặt trong VS Code — Một file PS1

1. Sao lưu website/Git hiện tại, đặc biệt `mrlee-points-core.js` và Rules đang dùng.
2. Chép `CAI-LO-TRINH-1-6-STREAK.ps1` **vào đúng thư mục gốc website** chứa `index.html`.
3. Trong VS Code Terminal chạy:

```powershell
powershell -ExecutionPolicy Bypass -File .\CAI-LO-TRINH-1-6-STREAK.ps1
```

Bộ cài kiểm tra `index.html`, sao lưu file bị thay trong `../.mrlee-backup-roadmap-…/` (nằm bên ngoài thư mục Git), tạo 2 trang/nhóm JS/CSS và bổ sung liên kết lộ trình. Không đụng đến 9 ảnh banner, logo, trang đề TOPIK, file Firebase config hoặc mã đồng bộ Supabase. Bản cài **không tự Publish Firestore Rules**.

## 3. Firestore Rules — Bước bắt buộc

Mở https://console.firebase.google.com/project/tieng-han-mr-lee/firestore/rules. **Sao lưu Rules đang chạy**. File `firestore-rules-1-6-streak.rules` được xây dựng bằng cách tích hợp vào mẫu Rules từ bộ điểm trước, không đại diện chắc chắn cho Rules tùy chỉnh hiện tại của bạn. Vì vậy **chỉ ghép các thay đổi cần thiết**, không dán đè nếu có quyền/collection khác:

1. Trong `match /users/{uid}`, thay khối `match /studyPoints/{pointsId}` cũ bằng khối mới (gồm các helper `walletKeys`, `walletShape`, `stageBonus` và các helper khác).
2. Thêm `match /dailyCheckins/{dayId}` cũng bên trong `match /users/{uid}`.
3. Trong `match /speakingAttempts/{attemptId}`, nới regex `taskId` từ sơ cấp 1–2 sang `sc[1-6]` (đã thể hiện trong file mẫu).
4. Trong `match /practiceAttempts/{attemptId}`, nới `level` sang sc3/sc4/sc5/sc6 để lịch sử và đồng bộ hoạt động.
5. Giữ nguyên Rules ảnh đại diện, sổ tay, examResults, adminUsers v.v. của bạn nếu đang có.
6. Nhấn **Publish** và kiểm tra bằng tài khoản học viên đã xác minh email. Nếu thấy `permission-denied`, mở Rules Playground/Simulator kiểm tra đường dẫn `/users/{uid}/studyPoints/wallet`, `/users/{uid}/dailyCheckins/YYYY-MM-DD`, `/users/{uid}/speakingAttempts/...`.

**Không sử dụng `allow read, write: if true`.**

## 4. Đưa lên GitHub

```powershell
git add index.html dang-nhap.html bai-hoc.html so-cap-1.html so-cap-2.html giao-tiep-theo-chu-de.html lo-trinh-1-6.html luyen-noi-tinh-diem.html mrlee-roadmap*.js mrlee-roadmap.css mrlee-speaking*.js mrlee-points*.js mrlee-points.css mrlee-daily-boot.js
# Nếu một file có tên không tồn tại, chỉ add những file website thực sự có.
git commit -m "Add Korean levels 1-6 curriculum speaking and daily streak rewards"
git push origin main
```

Các file `firestore-*.rules` chỉ cần nhập vào Firebase Console; không cần đưa lên GitHub Pages.

Sau đó mở: `https://jeongjunlee10x.github.io/tienghanmrlee.github.io/lo-trinh-1-6.html`. Đăng nhập và thử F5 2 lần trong cùng ngày UTC — không được cộng điểm lần hai; thử mở lộ trình cấp 3, một bài rồi nút nói.

## 5. Nguyên tắc điểm & giới hạn

**Điểm được tính bởi trình duyệt**, và micro qua Web Speech Recognition (tùy trình duyệt, có thể gửi âm thanh tới dịch vụ nhận diện). Chỉ là điểm khuyến khích; không xác thực chất lượng phát âm, ngữ điệu hay mức TOPIK chính thức, không sử dụng để tính học phí, kỷ luật hoặc chứng chỉ. Với câu trả lời mở cấp cao, người học nên tự luyện/nhờ giáo viên phản hồi; so khớp câu mẫu không đánh giá tư duy tranh luận.

**Streak dùng ngày UTC** để giữ cùng quy tắc cho mọi học viên. Ở Việt Nam/Hàn Quốc, ngày UTC chuyển lần lượt lúc 07:00/09:00 sáng địa phương. Phần điểm thưởng cần người học vào website có gắn script điểm danh ít nhất một lần/ngày UTC, duy trì trên Firebase; không tự cộng khi không truy cập. Nếu bỏ qua ngày thì streak quay về 1, nhưng `bestStreak` và điểm đã thưởng không mất. Thời gian được kiểm tra qua Firebase `request.time`, không chỉ ngày do máy khách tự đặt. Học viên cũ giữ nguyên điểm cũ, lần đầu vào sau nâng cấp sẽ bắt đầu streak = 1.

Một số lần luyện nói cũ tính theo ngày địa phương; mã mới dùng UTC để tránh tranh chấp ngày khi đăng nhập. Cần chú ý có thể chênh lệch ở ngày chuyển đổi. Điểm chỉ thưởng một lần cho mỗi cặp bài+ngày UTC.

## 6. Nguồn chương trình tham khảo

- NIIED TOPIK I/II: https://www.niied.go.kr/web/NIIED/contents/niiedEng/eng_topikOverview
- Online King Sejong Institute 6 cấp: https://www.iksi.or.kr/lms/main/curriculum.do
- King Sejong Institute Foundation textbooks 1A–6B: https://www.ksif.or.kr/com/cmm/EgovContentView.do?lang=eng&menuNo=31101310
- MDN Web Speech Recognition – giới hạn hỗ trợ: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition

## 7. Quy trình kiểm thử trước khi công bố

- Đăng nhập email đã xác minh → ví cũ không mất, streak nhận thưởng +2 hoặc mốc.
- Reload 2–3 lần cùng ngày UTC → không cộng trùng.
- Lộ trình có đủ 6 cấp, mỗi cấp 15 bài; bài 1/2 mở trang cũ, bài 3–6 hiển thị nội dung mới.
- Luyện nói cấp 3–6 → nhận diện tiếng Hàn, chấm điểm và lưu `speakingAttempts`, `practiceAttempts`.
- Nếu không có micro hỗ trợ: vẫn đọc/nghe câu, không giả mạo điểm.
- Sau sync GitHub Actions Firebase→Supabase: kiểm tra điểm luyện tập cấp 3–6 xuất hiện trong danh sách kết quả; nếu dashboard lọc trình độ chưa hiện cấp mới, cần mở rộng mapping cấp trong script đồng bộ.
