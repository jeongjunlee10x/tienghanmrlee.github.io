# TIẾNG HÀN MR LEE – BẢNG XẾP HẠNG +1 ĐIỂM/BÀI

## Chức năng

- Bảng xếp hạng bên phải trang chủ (desktop rộng từ 1450 px); trên màn hình hẹp, nút **🏆 Xếp hạng** luôn nằm ở mép phải để mở bảng.
- Sắp xếp **Top 10** theo điểm động lực Firebase. Học viên tự chọn biệt danh và **tự nguyện tham gia**. Không công khai tên thật, email, ảnh đại diện, lịch sử.
- Bỏ trần 200 điểm, không xóa/sửa số điểm đã tích lũy.
- **Mỗi bài Cấp 1–6 hoặc bài nói theo chủ đề: +1 điểm chỉ một lần trọn đời tài khoản**, không cộng lại khi mở trang hoặc luyện nói lại.
- Hoàn thành bài: nút +1 trong từng bài Sơ cấp 1/2 và phần chi tiết của lộ trình 1–6. Đây là điểm **tự khai hoàn thành**, không phải chứng chỉ.
- Luyện nói bình thường: điểm được chấm riêng theo phần mềm nhận diện; đạt >=60/100 có thể nhận +1 (nếu bài chưa nhận). Không trừ điểm khi không đạt. Bài phục hồi chỉ nhận +15 khi dưới 20 điểm và đạt từ 65/100.
- Đăng nhập mỗi ngày +2 và mốc streak +1/+3/+5/+8 **tiếp tục được giữ**; các khoản này tách biệt với thưởng bài học +1.
- Dữ liệu hoạt động, kết quả cũ trong Firebase và hệ thống Supabase Admin không bị xóa.

## Cài đặt Windows VS Code

1. Giải nén hoặc tải `CAI-BANG-XEP-HANG-MRLEE-VO-HAN-1-DIEM.ps1` vào thư mục website có `index.html`, `mrlee-points-core.js`.
2. Trong Terminal PowerShell chạy:

   ```powershell
   powershell -ExecutionPolicy Bypass -File ".\CAI-BANG-XEP-HANG-MRLEE-VO-HAN-1-DIEM.ps1"
   ```

3. **BẮT BUỘC**: Vào Firebase Console → Firestore Database → Rules. Sao lưu bộ Rules hiện tại. Mở `firestore-rules-MR-LEE-BXH-KHONG-GIOI-HAN.rules` từ bộ cài, so sánh/ghép nếu Rules bạn đang dùng có các thay đổi độc lập, sau đó Publish. Bản này dựa trên bộ Rules 1–6 Streak 2026. Không cài trong SQL Supabase.
4. Mở bằng Live Server, xác nhận điểm danh, bài nói, nút +1 bài học và bảng xếp hạng. Thử tài khoản đã xác minh email.
5. Đưa lên GitHub:

   ```powershell
   git add index.html so-cap-1.html so-cap-2.html lo-trinh-1-6.html
   git add mrlee-points-core.js mrlee-points-gate.js mrlee-roadmap.js mrlee-speaking-app.js
   git add mrlee-leaderboard.js mrlee-leaderboard.css mrlee-lesson-reward.js mrlee-lesson-reward.css
   git add mrlee-engagement.js
   git commit -m "Add unlimited student rankings and one point per lesson"
   git push origin main
   ```

   Nếu không có `mrlee-engagement.js`, bỏ dòng `git add mrlee-engagement.js`.

## Quyền riêng tư và bảo mật

- `mrleeLeaderboard/{uid}` chỉ chứa `{alias,points,streak,updatedAt}`. Chỉ học viên đã xác minh email tự bật tham gia mới có bản ghi công khai; bấm **Ẩn tên khỏi bảng** sẽ xóa bản ghi đó.
- Rules buộc điểm công khai đúng bằng ví điểm Firebase của cùng UID. Đây là **điểm động lực do trình duyệt ghi nhận**, vẫn có thể bị người biết kỹ thuật gian lận bằng cách giả dữ liệu học. Không dùng bảng này để cấp phần thưởng tiền mặt, quyền lợi quan trọng hay xử phạt.
- Firestore Rules `getAfter` dùng để ghi ví điểm và đánh dấu thưởng bài học trong một giao dịch, ngăn bấm lại cộng trùng. Tự chấm nội dung học bằng JavaScript không phải xác minh độc lập bởi máy chủ.
- Bảng xếp hạng công khai sử dụng Firestore onSnapshot, phát sinh lượt đọc. Gói miễn phí có hạn mức và cần theo dõi sử dụng.
- Không sửa Firebase Authentication, điểm thi chính thức, lịch sử bài làm, ảnh đại diện, banner 9 ảnh hoặc đồng bộ Firebase → Supabase.

## Khắc phục lỗi

- Bảng báo `permission-denied`: chưa Publish Rules mới, hoặc Firebase dự án sai.
- Bảng trống: chưa học viên nào tự tham gia và đặt biệt danh; không phải mất dữ liệu học viên.
- Nút +1 báo không có quyền: xác minh email, Publish Rules mới, đăng nhập lại và thử.
- Lưu điểm cũ bị lỗi: đảm bảo đã cập nhật `mrlee-points-core.js` và `mrlee-speaking-app.js` cùng lúc với Rules.
- Trên máy tính nhỏ hoặc điện thoại: dùng nút 🏆 ở mép phải để mở bảng, tránh che bài học.
