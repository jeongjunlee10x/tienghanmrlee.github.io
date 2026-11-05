# MR LEE GAME ARENA — Chuyển hướng gameplay 05/11/2026

## 1. Mục tiêu
Xây khu trò chơi thực sự hấp dẫn, tách riêng Game Zone học tiếng Hàn hiện hữu. Gameplay có đối thủ, luật thắng/thua rõ, điểm kinh nghiệm game, vàng ảo, vé miễn phí, bot và phòng bạn bè về sau.

## 2. Quy mô sản phẩm
| Game | Phiên bản ưu tiên | Điều kiện nghiệm thu |
|---|---|---|
| Bài Màu Đại Chiến | MVP đấu 1 người + 3 bot, bộ 108 lá | Bốc/đánh bài, thẻ đặc biệt, chọn màu, bot, hoàn thành ván, mobile |
| Cờ vua | AI 3 mức + PvP | Kiểm tra nhập thành, bắt tốt qua đường, phong cấp, chiếu, chiếu hết, hòa, đồng hồ |
| Tiến lên miền Nam | 1 người + 3 bot; PvP 4 người | Chặt hai, tứ quý, đôi thông, thối heo, luật tới trắng/tới bụng, bỏ lượt |
| Cờ cá ngựa | 1–4 người + bot | Tung xúc xắc, ra chuồng, đá quân, vào chuồng, chống lượt bất hợp lệ |
| Cờ tướng / Cờ úp | AI + PvP | Đi quân, chiếu tướng, tướng đối mặt, quân ẩn, luật cờ úp chính xác |
| Địa Ốc Đại Chiến | Phiên bản riêng | Bàn cờ tự thiết kế, mua/thuê/nâng cấp tài sản, xử lý phá sản |

## 3. Quy tắc kinh tế
- **Không đặt cược vàng/điểm giữa học viên.** Không có nạp tiền, rút tiền, đổi quà hiện vật, chuyển tiền/vàng giữa người chơi.
- Điểm học tập/điểm thi chính thức, TOPIK Spark và bảng xếp hạng học tập không thể bị mất khi thua game.
- Điểm rèn luyện **được phép chi tiêu** (dự kiến) là số dư phụ riêng biệt do máy chủ cấp cho hoạt động học hợp lệ. Nếu hết vé, học viên có thể tự chọn dùng phần điểm rèn luyện này để đổi vé; không tự trừ điểm học tập.
- Vé giải trí bị tiêu trước ván, không phụ thuộc kết quả thắng/thua. Thắng nhận vàng/EXP game và có thể được hoàn vé (giới hạn theo ngày); thua nhận EXP tham gia nhỏ và cần vé khác nếu muốn tiếp tục.
- Ví dụ cơ chế thử: khởi đầu 3 vé/phiên (không lưu), thắng +100 vàng demo +50 EXP demo +1 vé, thua +10 EXP demo. Không phải điểm được xác minh.
- Khi backend hoàn chỉnh mới chốt tỷ lệ đổi **điểm rèn luyện phụ → vé**, giới hạn lượt/ngày, và không phát thưởng theo yếu tố may rủi kiểu xổ số.

## 4. Kiến trúc đề xuất
`assets/arena/color-engine.js` là engine thuần JS không phụ thuộc DOM; `assets/arena/app.js` làm giao diện và điều phối lượt bot; `assets/arena/arena.css` xử lý hai theme và responsive.
Game về sau dùng interface thống nhất `createMatch(seed,players)`, `legalActions(state,actor)`, `applyAction(state,action)`, `getPlayerView(state,actor)`, `isTerminal(state)`, `settleMatch(matchId)`.
Với PvP, chỉ server sinh/xáo bài, tung xúc xắc và lưu lượt; client không thể gửi điểm cộng hoặc tự khai thắng. Mỗi lượt có sequence number, idempotency key và giới hạn thời gian.
Supabase Edge Functions xác minh Firebase JWT để chuyển lượt và ghi điểm. PostgreSQL giao dịch nguyên tử khi cập nhật match state và ledger; Realtime chỉ gửi thay đổi cho người có quyền.
Với game bài, phải che bài đối thủ trong mọi kênh truy xuất dữ liệu; không để lộ bộ bài hoặc seed trên client.

## 5. Bản MVP đã có
- `mrlee-game-arena.html`: sảnh sáu game, có một game thực chơi, các game khác ghi rõ chưa phát triển.
- `assets/arena/color-engine.js`: bài số, thẻ đổi màu, +4, +2, đảo chiều, cấm lượt, 4 người, AI 3 bot, terminal cap.
- `assets/arena/app.js`: bàn chơi, chọn bài, chọn màu, nhật ký lượt, thắng/thua, vé-vàng-EXP demo phiên.
- `tools/test-arena.mjs`: luật 108 lá, luật đòn đặc biệt, kết thúc một ván, phân tách điểm demo.
- `tools/browser-arena.mjs`: Chromium 1400 px/390 px, giao diện Tươi mới/Viễn tưởng.
- Game Zone cũ thêm link tới Game Arena; không thay nội dung 10 trò học.

## 6. Điều kiện trước khi mở PvP và thưởng chính thức
1. Hoàn thiện AI/chế độ 2 người của Cờ vua và Tiến lên.
2. Thiết kế ledger vé/vàng/EXP **riêng**, bất biến, ghi bằng backend, giới hạn thưởng và chống lặp kết quả.
3. Kiểm thử bot trong 1000 ván mô phỏng; thử bỏ cuộc, treo phiên, reconnect và gian lận thao tác.
4. Kiểm thử tài khoản học viên thật, chỉ dùng bảng phụ mới; tuyệt đối không ghi vào điểm thi hoặc bảng kết quả chính.
5. Kiểm thử trên điện thoại thật và giám sát thời lượng chơi; có giới hạn phiên để game không chiếm hết thời gian học.
6. Chỉ sau đó mới mở phòng PvP và bảng xếp hạng Arena riêng.

## 7. Bản quyền và thương hiệu
Dùng cách chơi màu và hành động theo thiết kế riêng. Không dùng logo, card back, hình ảnh, nhãn 'UNO' hay 'Monopoly' như sản phẩm chính thức. Tên hiển thị là Bài Màu Đại Chiến và Địa Ốc Đại Chiến.