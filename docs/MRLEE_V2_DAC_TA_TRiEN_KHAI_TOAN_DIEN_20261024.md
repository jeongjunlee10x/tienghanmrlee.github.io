# TIẾNG HÀN MR LEE — ĐẶC TẢ TRIỂN KHAI TOÀN DIỆN V2
**Ngày lập:** 24/10/2026 • **Phạm vi:** Trang chủ, toàn bộ trang con, hồ sơ học viên, tuyển sinh/tư vấn, điểm thưởng, Admin.  
**Mục đích:** Chuyển bộ mockup Viễn tưởng đã duyệt thành HTML/CSS/JS có thật và chức năng thật. Giữ nguyên logo chính thức \`assets/branding/logo-mrlee.png\`, dữ liệu và chế độ Tươi mới.  
**Trạng thái tài liệu:** ĐẶC TẢ + QUY TẮC NGHIỆM THU. **Không đồng nghĩa tất cả hạng mục đã triển khai xong hoặc ảnh mockup là giao diện đang chạy.**

## 1. Yêu cầu không được vi phạm
1. **Hai giao diện, một hệ chức năng:** Tươi mới (mặc định/cũ) và Viễn tưởng (mới). Chuyển ngay trên bất cứ trang chính nào, lưu lựa chọn \`MRLEE.THEME.V1\` của người học. Cùng URL, cùng quyền truy cập, cùng dữ liệu điểm/bài làm.
2. **Giữ logo gốc:** logo trong header, footer, trang học, Admin phải trỏ đến \`assets/branding/logo-mrlee.png\`. Không vẽ lại logo, không đổi chữ, không lấy logo trong ảnh AI vì ảnh sinh có thể làm sai nhận diện.
3. **Không dùng ảnh chụp nguyên mockup làm giao diện:** mẫu có chữ giả, số liệu giả và nút không thể nhấn. Phải tách/generate các ảnh minh họa không chữ theo từng ngữ cảnh; HTML thật dựng các thẻ, tiêu đề, biểu đồ, menu.
4. **Không nhầm thống kê ví dụ với thực tế:** không công bố các số như “50.000 học viên”, “96% hoàn thành”, “TOP 1”, “điểm AI 100%” nếu không có nguồn dữ liệu được kiểm chứng.
5. **Không xóa lịch sử:** giữ nguyên Firebase UID, điểm cũ, bài làm, bảng Supabase, MP3, dữ liệu giáo trình, liên kết học viên, lịch sử đồng bộ. Không tự gộp hoặc cộng lại điểm.
6. **Mọi nút phải có tác dụng:** mở đúng trang / tab / form / bài học / chức năng. Không dựng các khối “AI phân tích”, “Video bài giảng” giả khi backend hoặc nội dung chưa tồn tại. Nếu chưa có phải ghi rõ trạng thái và đưa đường dẫn hợp lệ.
7. **Miễn phí:** ưu tiên GitHub Pages, Firebase Spark đã dùng, Supabase Free, Cloudflare Turnstile Free; không tự kích hoạt gói trả phí.
8. **Riêng tư:** bài làm, email, số điện thoại, thông tin liên hệ, nhận xét giảng viên chỉ được truy cập theo phân quyền đã kiểm tra; không đưa secret key vào GitHub hoặc frontend.

## 2. Kết quả rà soát repo trước khi soạn
- GitHub: \`jeongjunlee10x/tienghanmrlee.github.io\` / \`main\`.
- Theme đang hoạt động: \`assets/mrlee-dual-ui/theme.js\`, \`theme.css\`, \`cinematic-v2.css\`; ảnh chủ đề \`assets/mrlee-next/scenes/*.svg\` (11 cảnh), ảnh cũ \`assets/v306/images/*.webp\`.
- Admin hiện có \`admin.html\`, \`assets/mrlee-dual-ui/admin-charts.js\`, chức năng quản lý bài làm và đăng ký tư vấn.
- Tư vấn dùng \`dang-ky-tu-van.html\` → \`assets/mrlee-next/consultation.js\` → Edge Function \`mrlee-consultation-submit\` → bảng \`mrlee_consultation_requests\`.
- Kiểm tra đầu vào dùng \`kiem-tra-dau-vao.html\` → Edge Function \`mrlee-placement-submit\` → \`mrlee_placement_submissions\`.
- Điểm luyện tập và phần thưởng đang có nhiều cơ chế Firebase/GitHub/Supabase; phải lập ma trận điểm và rà soát trước khi thay đổi.
- Đã đối chiếu 96 đường dẫn HTML trong \`theme.js\` với cây GitHub: không phát hiện đích HTML thiếu trong phạm vi đó. Đây **không phải** kiểm thử mọi đường dẫn website.

## 3. Thiết kế chung áp dụng theo đúng bộ ảnh được duyệt
### 3.1. Các thành phần của giao diện Viễn tưởng
- Nền: deep space navy, ánh xanh cyan và tím violet có chiều sâu, lớp lưới mỏng/HUD tinh tế, không phủ hiệu ứng vào nội dung dài.
- Header: logo thật trái; 6 nút chính theo đúng thứ tự Học tiếng Hàn → Giao tiếp → TOPIK → Phỏng vấn → Văn hóa → Bản đồ ĐH Hàn Quốc; tìm kiếm; hồ sơ/đăng nhập; công tắc 2 giao diện.
- Hero: ảnh điện ảnh riêng cho **từng** trang, tách lớp chữ HTML; tiêu đề nổi bật, mô tả thực tế, tối đa 2 CTA thật; ảnh sinh không được có chữ/logo giả.
- Thẻ chức năng: ảnh minh họa chuyên biệt, gradient phủ để chữ dễ đọc, biểu tượng thống nhất, CTA có đường dẫn xác nhận; hover/focus rõ, phím Tab dùng được.
- Panel/hồ sơ: kính mờ có kiểm soát (backdrop filter fallback), biểu đồ là HTML/SVG từ dữ liệu, không dựng số trong ảnh.
- Footer: logo gốc, liên kết thật, kênh liên hệ chính thức đã được xác minh và quyền riêng tư.
- Không làm trang Tươi mới bị đổi màu, mất layout hoặc chậm do tải hình viễn tưởng khi không chọn theme.

### 3.2. Design tokens (đích khi triển khai)
| Nhóm | Thiết lập |
| --- | --- |
| Navy nền | \`#050B1B\` / lớp cao \`#0B1933\` |
| Cyan chủ đạo | \`#5CEBFF\` |
| Violet nhấn | \`#A58AFF\` |
| Text chính | \`#F4FAFF\` |
| Text phụ | \`#B5C8DD\` |
| Border ánh sáng | \`rgba(88,203,255,.35)\` |
| Radius | 12 / 18 / 24 px |
| Khoảng cách | thang 4, 8, 12, 16, 24, 32, 48, 64 px |
| Font Việt | ưu tiên Be Vietnam Pro (đúng giấy phép OFL) hoặc system sans |
| Font Hàn | Noto Sans KR (đúng giấy phép OFL) hoặc fallback hệ thống |
| Cỡ nội dung | 16 px desktop; tối thiểu 14 px mobile, line-height ≥ 1.55 |
| Container | tối đa 1360–1440 px, responsive 390/768/1024/1440/1920 |
| Chuyển động | 160–260 ms, có \`prefers-reduced-motion\` |
| Mục tiêu truy cập | WCAG 2.2 AA với chữ, nút và tương phản |

**Không tải font không có giấy phép, không công khai font trả phí.** Thư mục font nội bộ chỉ gồm font được phép nhúng.

### 3.3. Quy tắc pixel-match
1. Lập screenshot đối chiếu mockup được duyệt ở 1440px desktop, 768px tablet, 390px mobile.
2. Chia mockup thành các khối: header, hero, dải chỉ số, 6 cấp độ, chức năng, dashboard, footer.
3. So khớp kích thước khối, khoảng thở, hệ chữ, phân cấp màu, cường độ ánh sáng và nội dung.
4. **Ảnh mẫu không thể biến “100% y hệt” thành website thực nếu giữ nguyên chữ bị vẽ vào ảnh**, vì vậy nguyên tắc là bám sát bố cục/hình ảnh, dựng lại chữ và nút thật; phần chênh lệch phải có ảnh trước-sau để duyệt, không nói “giống 100%” khi chưa đối chiếu.

## 4. Bản đồ trang — mỗi trang có layout và asset riêng
| Mục | File vận hành | Hero / visual phải tạo riêng | Chức năng được nối |
| --- | --- | --- | --- |
| Trang chủ | \`index.html\` | Seoul đêm, đôi học viên, học tập, hanok, HUD; bỏ mọi số KPI bịa | 6 nút chính, tìm trường, tài khoản, TOPIK, tư vấn, bảng xếp hạng |
| Học tiếng Hàn | \`hoc-tieng-han.html\`, \`hoc-theo-bai.html\` | Lộ trình 6 cấp, lớp học Hàn Quốc, flashcard, sách, 6 ảnh cấp riêng | SC1/SC2/TC1/TC2/CC1/CC2, từ vựng, ngữ pháp, nghe, nói, workbook |
| Giao tiếp | \`giao-tiep-theo-chu-de.html\` | Seoul phố đêm, 2 người hội thoại, nhà hàng, mua sắm | Chủ đề, hội thoại mẫu, nghe/nói, phản xạ, lộ trình tình huống |
| TOPIK | \`kiem-tra-topik.html\`, \`topik-v11.html\` | Bàn học TOPIK, đề thi, phòng thi máy, HUD tiến bộ | 5 nút: đầu vào, lộ trình, luyện đề I/II, thi thử PBT/IBT, lịch sử |
| Phỏng vấn | \`giao-tiep-phong-van.html\` | Phòng phỏng vấn Hàn Quốc, sinh viên và người phỏng vấn | Tự giới thiệu, mô phỏng, câu hỏi, luyện phát âm, hướng dẫn |
| Văn hóa | \`van-hoa-han-quoc.html\` | Cung điện/hanbok/ẩm thực/lễ hội/kỹ năng sống | Nội dung thật, ảnh + chú thích, bài theo chủ đề, liên kết khám phá |
| Bản đồ ĐH | \`ban-do-dai-hoc-han-quoc.html\` | 3D Korea + Seoul/Busan, trường đại học, cảnh campus | Tìm kiếm, bộ lọc, bản đồ có dữ liệu trường thật, xem chi tiết |
| WORKBOOK | \`mrlee-bai-tap-pro.html\` | Bàn học, workbook, bài tập ngữ pháp và nghe | 15 bộ/bài, 6 cấp, lưu lựa chọn/đáp án/câu bỏ trống |
| Hồ sơ | \`trung-tam-hoc-vien.html\` | Learner cockpit, tiến độ cá nhân và thành tích | Điểm đã xác thực/tự chấm tách biệt, bài đã học, lịch sử, mục tiêu |
| Đăng ký tư vấn | \`dang-ky-tu-van.html\`, \`tuyen-sinh.html\` | Tư vấn du học, trường, checklist; không gây hiểu nhầm về visa | Form có consent, Turnstile, mã phiếu, hiển thị tại Admin |
| Admin | \`admin.html\` | Dashboard công nghệ + dữ liệu biểu đồ thực | Tổng quan, học viên, bài làm, đầu vào, tư vấn, thưởng, tiến độ |

**Các trang con sâu** như bài ngữ pháp, nghe, điền trợ từ, TOPIK 51–54 và tình huống văn hóa dùng cùng tokens nhưng phải có thành phần thích hợp nội dung, không sao chép hero marketing vào trang thi hoặc làm bài.

## 5. Chi tiết nội dung và nút từng khu vực
### 5.1. Trang chủ
- H1: **TIẾNG HÀN MR LEE — Học tiếng Hàn hôm nay, mở tương lai Hàn Quốc**.
- Mô tả: **Từ bảng chữ cái, từ vựng, ngữ pháp đến giao tiếp, TOPIK và định hướng du học — một lộ trình rõ ràng để bạn tiến bộ từng ngày.**
- CTA chính: **Bắt đầu học** → \`hoc-tieng-han.html\`.
- CTA phụ: **Kiểm tra đầu vào** → \`kiem-tra-dau-vao.html\`.
- 6 chuyên mục đúng tên. WORKBOOK, Hồ sơ và Admin là tiện ích/đường dẫn có phân quyền, không âm thầm đổi thứ tự 6 nút chính.
- KPI chỉ dùng số thực có truy vấn, kèm nguồn và thời điểm; nếu chưa có, thay bằng giá trị mô tả **6 cấp độ**, **Bài học có thực**, **Luyện TOPIK I/II**, không thổi phồng số lượng.

### 5.2. Học tiếng Hàn / WORKBOOK
- H1: **Học tiếng Hàn từ nền tảng đến thành thạo.** Bộ thẻ 6 cấp độ có nội dung giáo trình thực tế.
- Một bài có: mục tiêu, từ vựng, ngữ pháp, ví dụ, phát âm/audio, luyện nghe/nói, 15 bộ workbook, lịch sử.
- Audio tránh đọc “여자/남자” nếu là nhãn nhân vật; thay bằng tên/xưng hô phù hợp. Không trộn nghĩa Việt vào phần đọc tiếng Hàn.
- Dùng kiểm tra đúng, sai, giải thích; không cấp điểm thưởng chỉ bởi F5 hoặc nhấn lại nút.
- Tách bài tự luận khỏi trắc nghiệm; chấm tự động không được tự nhận là chấm giáo viên khi chỉ so khớp ký tự.

### 5.3. TOPIK
- **Kiểm tra đầu vào:** 50 câu/30 phút; kết quả có phiếu + 50 lựa chọn; Admin duyệt và xếp lớp.
- **Lộ trình:** TOPIK I/II theo cấp, ngày học, bài tập và kết quả thực.
- **Luyện đề:** phân loại nghe, đọc, viết; phương pháp làm bài và chữa lỗi.
- **Thi thử PBT/IBT:** kiểm soát thời gian và trả lời; thi thử không được gọi là kết quả TOPIK chính thức.
- **Lịch sử:** cho phép học viên xem đúng dữ liệu của mình; Admin có quyền xem theo vai trò.

### 5.4. Giao tiếp / phỏng vấn / văn hóa / bản đồ
- Giao tiếp: bộ lọc chủ đề (ăn uống, mua sắm, giao thông, bệnh viện, du học, công sở); audio tốc độ phù hợp; transcript, luyện nói.
- Phỏng vấn: phân nhóm tự giới thiệu, kế hoạch học tập, ngành học, lý do chọn trường, câu hỏi tình huống; gợi ý câu trả lời và tiêu chí đánh giá.
- Văn hóa: bài theo chủ đề phải có giải thích, hình minh họa đúng nội dung, chú thích, nguồn/quyền sử dụng; không chỉ hiển thị từ vựng.
- Bản đồ: giữ tọa độ và đường dẫn từ dữ liệu trường thật, không lấy map vẽ bằng AI để thay bản đồ tương tác; kiểm tra năm và nguồn học phí/xếp hạng nếu công bố.

## 6. Admin bắt buộc: số liệu và dashboard trên **mọi đầu trang**
### 6.1. Bộ KPI hàng đầu
- Tổng học viên (\`mrlee_students\`).
- Hoạt động trong 7 ngày (\`mrlee_learning_events\` hoặc \`last_activity_at\` nếu có ý nghĩa).
- Bài luyện tập có điểm (\`mrlee_scores\`).
- Bài làm có chi tiết (\`review_snapshot\` tồn tại).
- Bài kiểm tra đầu vào (\`mrlee_placement_submissions\`).
- Phiếu tư vấn (\`mrlee_consultation_requests\`).
- Phiếu mới/chưa xử lý của tư vấn; bài tự luận chờ giáo viên khi có trường trạng thái rõ ràng.

### 6.2. Biểu đồ bắt buộc
- Lượt hoạt động ngày (7/14/30 ngày): line chart, từ dấu thời gian thật.
- Phân bố học viên theo 6 cấp độ: horizontal bar hoặc donut, từ \`mrlee_students.level\`; nhóm “chưa xác định” riêng.
- Kết quả học tập: biểu đồ điểm theo môn/loại đề; nhãn rõ **điểm luyện tập tự chấm**, không phải điểm TOPIK thật.
- **Tiến độ học tập:** hiển thị số bài đã hoàn tất / số bài có thể học **chỉ khi cả tử số và mẫu số có dữ liệu hợp lệ**. Nếu chưa có, hiển thị “lượt hoạt động, chưa phải % hoàn thành”.
- Hoạt động mới, top phần cần chữa, nhóm bài có tỷ lệ sai cao.
- Khi đổi tab: biểu đồ xuất hiện ở trên cùng đúng tab đó; nút tải lại, bộ lọc thời gian, trạng thái rỗng/lỗi.

### 6.3. Quy trình Admin
- **Học viên:** tìm/lọc, hồ sơ, lớp/cấp độ, điểm, tiến độ.
- **Bài làm toàn website:** xem từng câu, phương án chọn, đáp án tham khảo, thời gian, đánh dấu bài chỉ có điểm, xuất/In, nhận xét.
- **Kiểm tra đầu vào:** duyệt toàn bộ bài, chọn trạng thái, xếp lớp, lưu nhận xét.
- **Tư vấn:** mã phiếu, ngày tạo, trạng thái mới/đang liên hệ/đã tư vấn/đóng; ghi chú, lọc/chuyển người phụ trách; thông tin nhạy cảm chỉ Admin.
- **Điểm thưởng:** sổ giao dịch, lý do cộng/trừ, mã bài, thời điểm, chống trùng, đối soát điểm máy chủ.
- **Hệ thống:** lần sync cuối, lỗi, số lượng bản ghi đã đồng bộ; không tự hiển thị xanh “100% ổn định” khi chưa đo.

## 7. Thiết kế lại hệ thống điểm thưởng
- **Phân lớp:** (A) điểm luyện tập/động lực trên trình duyệt, (B) điểm có xác minh bằng đáp án máy chủ, (C) thưởng xếp hạng, (D) giao dịch đổi thưởng. Không cộng lẫn các loại thành “điểm thi chính thức”.
- **Chỉ cộng 1 lần cho một bài duy nhất** theo UID + loại đề + mã bài + phiên bản nội dung + chu kỳ quy định. Lần luyện lại có thể lưu lịch sử, không tự nhân thưởng.
- **Không tính thưởng**: mở trang, refresh, truy cập URL, nghe nhạc/audio vô điều kiện, tạo tài khoản ảo, click xem đáp án, kết quả tự nhập, điểm sinh từ client chưa được kiểm chứng.
- **Có thể xét thưởng**: hoàn tất bài hợp lệ đã xác thực, streak đã chống gian lận, thành tích TOPIK thử có chuẩn server, mốc giáo viên phê duyệt — với trần ngày/tuần.
- **Không sửa thẳng số dư hiện tại khi chưa audit**. Đối soát các tập Firebase \`lessonRewards\`, \`studyPoints/wallet\`, TOPIK score-spark và Edge Function \`mrlee-reward-v2\`; kiểm tra một bài có thể bị cộng từ hai nơi.
- Quy trình điểm v3 phải có \`event_id\` chống ghi đôi, bản ghi không sửa, truy vết, replay và rollback có phê duyệt; chỉ Admin được xác nhận thưởng thật.
- Hiển thị rõ **“Điểm động lực”** và **“Điểm đã xác minh”**, không tạo cảm giác học viên có quyền rút/đổi tiền nếu chưa được công ty phê duyệt.

## 8. Kênh đăng ký tư vấn: chức năng đầu-cuối
**Hiện tại có:** \`dang-ky-tu-van.html\` và chức năng ghi vào Admin qua Cloudflare Turnstile/Supabase.
- Từ mọi hero, footer, thẻ tuyển sinh: CTA vào \`dang-ky-tu-van.html\` nếu không có cơ chế mở modal phù hợp.
- Biểu mẫu: họ tên, điện thoại, email (nếu cần), mục tiêu, trình độ, khu vực, nội dung, kênh liên lạc mong muốn; hạn chế trường không cần thiết.
- Đồng ý xử lý thông tin minh bạch; kiểm tra đồng ý phụ huynh/người giám hộ với người chưa đủ 18 tuổi.
- Validate server-side; chống spam Turnstile; duplicate/rate-limit hợp lý; không gửi secret về client.
- **Chỉ báo thành công sau khi nhận mã phiếu từ server**; lỗi mạng có thông báo và nút thử lại, không làm người dùng hiểu đã gửi.
- Admin thấy/đánh dấu/ghi chú phiếu; ưu tiên không gửi email tự động khi chưa có kênh giao hàng được xác thực.
- Không phát tán số điện thoại/email khách hàng trong bảng xếp hạng hoặc báo cáo công khai.

## 9. Tài nguyên ảnh phải tự thiết kế — không dùng asset “mặc định” để thay thế
### 9.1. Bộ bắt buộc
- 1 hero **Trang chủ**: người học + Seoul hiện đại + hanok/hoa anh đào, không chữ trong ảnh.
- 10 hero **trang con**: học tiếng Hàn, giao tiếp, TOPIK, phỏng vấn, văn hóa, đại học, workbook, hồ sơ, Admin, tư vấn.
- 6 key visual cho cấp độ; tối thiểu 24 thumbnail chuyên đề: nói/nghe, nhà hàng, mua sắm, TOPIK I/II, viết 51–54, phỏng vấn, lễ hội, ẩm thực, ký túc xá, campus, bản đồ, hồ sơ, thành tích.
- Icon set thống nhất nét/khung; không trộn emoji với biểu tượng 3D tại mọi nơi.
- Ảnh phải tách khỏi chữ: HTML chịu trách nhiệm tiêu đề, nhãn, giá trị và CTA.
- Tài nguyên sinh bằng AI có bản quyền sử dụng phù hợp; không dán ảnh lấy từ công cụ/tác giả bên ngoài nếu thiếu quyền công khai.

### 9.2. Quy cách phát hành
- Dùng WebP/AVIF tối ưu, ưu tiên responsive \`srcset\`; hero mục tiêu ≤650 KB ở desktop, thumbnail ≤180 KB (ngân sách đề xuất, điều chỉnh theo chất lượng).
- Đặt tên theo nội dung \`assets/mrlee-next/visuals/<page>/<subject>-<size>.webp\` và manifest JSON mô tả nguồn/tác quyền.
- Lười tải ảnh dưới nếp gấp đầu; ảnh hero chính preload hoặc fetchpriority high đúng trang; giữ width/height tránh nhảy bố cục.
- Không thay đổi/chèn file ảnh nếu chưa thực sự tồn tại trên Github; fallback mang tính thiết kế, không tạo khối vỡ hình.

## 10. Bảng nâng cấp kỹ thuật theo cấp
| Tầng | Công việc | Các tệp/nhóm tệp chính | Nghiệm thu |
| --- | --- | --- | --- |
| Nhỏ | Tokens, typography, bộ nút, layout, icon, responsive | \`theme.css\`, \`cinematic-v2.css\`, CSS từng trang | Chuyển theme không lỗi; font rõ; mobile không tràn |
| Trung | Hero, cảnh riêng, câu chữ, chuyên mục, CTA, nguồn ảnh | \`theme.js\`, \`assets/mrlee-next/scenes/*\`, trang HTML | So ảnh duyệt; không có CTA giả; link đúng |
| Cao 1 | Admin số liệu, lọc, nhận xét và tiến độ | \`admin.html\`, \`admin-charts.js\`, admin module | Đầu mọi tab có biểu đồ; đọc đúng RLS; không số mẫu |
| Cao 2 | Lưu bài, xem chi tiết, giám sát học | \`learning-tracker.js\`, quiz/workbook/TOPIK | Mỗi bài gửi một bản ghi đúng; không mất bài cũ |
| Cao 3 | Điểm thưởng, xếp hạng server, chống gian lận | Firebase rules/score-spark/Supabase reward | Audit ledger và kiểm thử cộng 1 lần |
| Cao 4 | Đăng ký tư vấn và Admin CRM | \`dang-ky-tu-van.html\`, Edge Function, Admin leads | Gửi → mã phiếu → Admin → cập nhật trạng thái |
| Ổn định | Performance, accessibility, QA, khôi phục | \`tools/\`, workflow, backup, release notes | QA và rollback xác nhận |

## 11. Kế hoạch release, không xóa cũ
**Mốc R0 — Audit và snapshot (bắt buộc trước code lớn):** lưu SHA nhánh main, danh mục assets, kiểm thử ảnh/link/JS, thống kê Supabase chỉ đọc.  
**Mốc R1 — Design system:** tạo tệp CSS mới, HTML demo của từng layout; không chạm theme Tươi mới.  
**Mốc R2 — Ảnh riêng và homepage:** export ảnh thật, duyệt screenshot desktop/mobile so với mockup.  
**Mốc R3 — Trang con:** từng chuyên mục, kiểm tra route, audio, bài tập; chỉ chạm file liên quan.  
**Mốc R4 — Admin:** dashboard ở mọi tab, dữ liệu thật, chống rò rỉ; test với Admin được cấp quyền.  
**Mốc R5 — Điểm thưởng và tư vấn:** migration/Edge Functions riêng và QA đầy đủ, không trộn với đợt giao diện.  
**Mốc R6 — Công bố:** staging/branch → Node syntax QA → kiểm tra link/logo → review screenshot → merge \`main\` không \`force\` → xác nhận Pages \`success\` → thử website thật.

**Rollback:** giữ SHA trước triển khai, revert từng commit/nhóm file bằng Git, không force push; database migration phải có kế hoạch tiến lên an toàn thay vì giả định có thể undo khi có dữ liệu thật.

## 12. Checklist nghiệm thu trước khi nói “ĐÃ HOÀN THÀNH”
- [ ] Logo nguyên bản trên tất cả trang, kể cả đăng nhập Admin.
- [ ] Hai giao diện hoạt động trên desktop/mobile và cùng dữ liệu.
- [ ] Ảnh độc lập theo từng trang, chất lượng đủ lớn, không watermark/chữ rác.
- [ ] Layout được đối chiếu với ảnh mockup đã duyệt bằng screenshot; không dùng ảnh mockup làm giao diện.
- [ ] Tất cả liên kết quan trọng không 404.
- [ ] Mọi nút / modal / biểu mẫu có hành vi và phản hồi thật.
- [ ] 6 cấp độ, TOPIK, phỏng vấn, văn hóa, bản đồ, workbook không mất học liệu.
- [ ] Audio phát đúng thứ tự, không đọc nhãn nhân vật sai.
- [ ] Điểm và bài làm mới được lưu; bài cũ không bị xóa/ghi đè.
- [ ] Admin có thống kê **thật** trên mỗi tab và phân biệt hoạt động / % hoàn thành.
- [ ] Gửi phiếu tư vấn thật có mã đối chiếu, Admin quản lý được.
- [ ] Chống cộng trùng, hiển thị minh bạch các loại điểm.
- [ ] CSS/JS kiểm tra cú pháp, không lỗi Console nghiêm trọng.
- [ ] Bảo mật: anon không xem bài làm/phiếu tư vấn, không lộ khóa API mật.
- [ ] Hiệu năng smartphone và khả năng truy cập đáp ứng mục tiêu.
- [ ] GitHub Pages có workflow success và đã được kiểm tra trên URL công khai.
- [ ] Có release note: **Đã làm / Chưa làm / Chưa kiểm thử / Hạn chế**.

## 13. Trạng thái chính xác tại thời điểm viết
- **Đã tồn tại trong repo:** 2 theme, các trang HTML, 11 scene SVG, hệ thống Admin biểu đồ, bài làm, form tư vấn, Edge Function, cơ chế điểm hiện có.
- **Chưa thể kết luận đạt mockup:** trang hiện có vẫn chưa qua đối chiếu 1:1 với toàn bộ bộ ảnh đã duyệt; ảnh cảnh hiện tại là SVG, không thể coi là thay thế đầy đủ các cảnh chất lượng cao trong mockup.
- **Chưa thực hiện trong tài liệu này:** thay hàng loạt mã giao diện production, chấm điểm thưởng v3 hoặc cập nhật dữ liệu của học viên.
- Các mục [ ] ở phần 12 là tiêu chuẩn nghiệm thu **cần làm và kiểm thử**, không phải lời khẳng định đã hoàn tất.

**Đề xuất ưu tiên:** R0 → R1 → R2 (giao diện thật) → R4 (Admin) → R3 (các trang con) → R5 (điểm/tư vấn) → R6; không đánh đổi ổn định chỉ để đưa mockup lên trang chủ.
