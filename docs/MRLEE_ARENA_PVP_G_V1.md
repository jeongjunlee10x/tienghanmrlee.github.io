# MR LEE GAME ARENA – Phòng PvP và ví G (05/11/2026)

## Màn hình Arena
- Mở `mrlee-game-arena.html` nhìn thấy sảnh game dạng lưới; không còn hero quảng cáo dài.
- Mỗi game đang chơi được có 4 nút: **Chơi nhanh**, **Chơi với bạn**, **Chọn bàn**, **Đấu máy**. Chỉ 3 game: Cờ vua, Tiến lên, Bài Màu.
- Chơi nhanh: tìm bàn công khai đang chờ theo ngưỡng G đủ đảm bảo thanh toán, ưu tiên bàn gần đủ người; nếu chưa có thì tạo bàn công khai với mức thấp nhất đủ chi trả.
- Chơi với bạn: tạo bàn riêng / bàn công khai bằng mã 8 ký tự sinh ngẫu nhiên từ máy chủ, sao chép mã hoặc liên kết, bạn bè nhập mã để vào.
- Chọn bàn: danh sách bàn công khai đang chờ, mức G/lá, số người và nút vào bàn; bàn không đủ G không được chọn.
- Tên, trạng thái sẵn sàng, thông tin ghế và mã mời được hiển thị trong phòng chờ. Mọi người nhấn sẵn sàng khi đã đủ số ghế để bắt đầu.
- Trong trận: nút toàn màn hình từng game, thông báo ngắn ở bảng, overlay thắng/hòa/thua trên bàn. Có phương án thu gọn nếu trình duyệt không hỗ trợ Fullscreen API.

## Quy tắc G
- 1 điểm **Game Zone đã chấm và xác minh tại máy chủ** = 10G. Điểm Game Zone đã dùng đổi G không được dùng để đổi lần nữa.
- Không thay đổi điểm học tập gốc, TOPIK Spark, điểm thi, điểm số ở trường hoặc lịch sử; nguồn điểm từ bảng `mrlee_game_awards` riêng.
- Các mức G trên mỗi lá ở Tiến lên/Bài Màu: 5,10,50,100,500,1000,5000,10000,50000,100000,500000,1000000.
- Hiển thị: `50G`, `1K G`, `50K G`, `1M G`. Mỗi mức là **G/lá còn lại** chứ không phải chi phí cố định.
- Tiến lên: người thua còn 10 lá tại bàn 10G/lá mất 100G; mọi người thua chịu mất G theo lá còn lại; tổng G bị trừ của người thua được chuyển cho người về nhất.
- Cờ vua không có lá: bên thua chịu 1× mức bàn; hòa hoàn G. Bài Màu có rút bài nên giới hạn tối đa 20 lá thua được tính G.
- Máy chủ giữ trước tối đa 13× mức bàn Tiến lên, 20× mức bàn Bài Màu, 1× mức bàn Cờ vua từ **mỗi thành viên** ngay trước khi bắt đầu; nếu thiếu G thì không cho bắt đầu.
- Kết thúc: xác nhận thắng/thua tại máy chủ, thanh toán toàn bộ bằng giao dịch PostgreSQL nguyên tử. Học viên không thể tự khai thắng hoặc sửa số dư. Không có âm ví.
- G không phải tiền thật, không nạp bằng tiền, không chuyển đổi thành tiền mặt, học bổng hay quà vật chất. Không có rút G hoặc chuyển G ngoài hệ thống.
- Nếu một người rời trận đang chạy, bản này hủy ván và hoàn phần giữ trước cho mọi thành viên; phòng hết hạn cũng được hoàn G khi học viên quay lại ví. **Chưa áp dụng phạt bỏ cuộc/xếp hạng PvP**.

## Bảo mật
- Firebase ID token được xác minh bằng JWKS RS256 trên Supabase Edge; mọi thao tác người học qua `mrlee-arena-rooms`.
- Phòng, ví, ledger và escrow trong Supabase đều bật RLS, không có SELECT/INSERT/UPDATE/DELETE trực tiếp cho anon hoặc authenticated.
- Chỉ `service_role` được gọi các hàm ghi vàng: `mrlee_arena_convert`, `mrlee_arena_start_match`, `mrlee_arena_settle_match`, `mrlee_arena_abort_match`.
- Người chơi Tiến lên/Bài Màu nhận **duy nhất bài của mình** và số lá của đối thủ. Chỉ server có thể tạo/chia bộ bài và kiểm tra hành động.
- Mã phòng riêng không liệt kê công khai; danh sách Chọn bàn chỉ trả metadata bàn công khai.
- Mỗi lượt gửi kèm version để chống đụng lượt và gửi lặp; chấm thắng và thanh toán G một lần.

## Triển khai và nghiệm thu
1. SQL `supabase/manual-sql/MRLEE_ARENA_ROOMS_SETUP.sql` tạo bảng phòng; `MRLEE_ARENA_G_WALLET.sql` tạo ví G, escrow và RPC (additive).
2. Deploy function `supabase/functions/mrlee-arena-rooms/index.ts` cùng ba engine JS, `verify_jwt=false` do function tự xác minh Firebase JWT.
3. `node tools/test-arena-rooms.mjs` kiểm tra 12 mức G, tỷ giá và contract.
4. `node tools/browser-arena-rooms.mjs` Chromium kiểm tra tạo bàn, nhập mã, công khai, đổi điểm và fullscreen ở 1440px/390px × 2 giao diện.
5. SQL test 4 người (transaction rollback) đã xác minh: bàn 10G/lá, còn 10/5/2 lá thua mất 100/50/20G, người thắng được +170G, quyết toán lặp bị từ chối.
6. **Chưa nghiệm thu** vào phòng giữa hai tài khoản Firebase thật ở thiết bị khác nhau; phải thử tiếp trước khi công nhận sản phẩm PvP hoàn chỉnh hoặc xếp hạng. Không sử dụng hệ thống để đặt cược tiền thật.

## Lưu ý vận hành
- Các bản game đấu máy cũ dùng vàng/EXP demo trình duyệt riêng, không liên thông ví G PvP. Khi chơi PvP, số dư dùng để ghép bàn là số dư server, tuyệt đối không dùng `localStorage` hoặc `state.gold`.
- Không chỉnh sửa Reward V2, TOPIK Spark, bảng thưởng học bổng.
- Không tăng tỷ lệ 1:10 hoặc cho phép đổi G ngược sang điểm học tập nếu chưa đánh giá an toàn và chính sách học viên.