# MR LEE — Đồng bộ Firebase → Supabase

**Bản này KHÔNG tự chạy chỉ bằng việc đẩy `admin.html` lên GitHub.** Cần chạy SQL, thêm GitHub Secrets, đưa mã lên GitHub và chạy workflow lần đầu. Sau đó hệ thống tự lặp khoảng 3 giờ/lần (thời gian có thể chậm hơn do GitHub Actions).

## 1. Thành phần

| File | Vị trí / chức năng |
|---|---|
| `admin.html` | Thay trang quản trị cũ, bổ sung Hoạt động học tập, nguồn điểm, trạng thái đồng bộ |
| `supabase-sync-migration.sql` | Chạy **trong Supabase SQL Editor**, không đưa lên website |
| `.github/workflows/mrlee-firebase-supabase-sync.yml` | GitHub Actions chạy tay và theo lịch |
| `scripts/mrlee_sync.py` | Mã Python chạy ở GitHub Actions, **không chạy trong trình duyệt** |
| `scripts/requirements-mrlee-sync.txt` | Thư viện Python cho GitHub Actions |
| `CAI-DONG-BO-MR-LEE.ps1` | Bộ cài Windows tạo sao lưu và đưa các file cần thiết vào repo |

## 2. Chạy SQL trên đúng dự án Supabase

1. Vào https://supabase.com/dashboard/project/pkxqsboyotlyoizzxizb/sql/new
2. Mở `supabase-sync-migration.sql`, sao chép toàn bộ và nhấn **Run**.
3. Không xóa các bảng `mrlee_students`, `mrlee_scores`, `mrlee_admins` hiện có. SQL mới chỉ thêm cột, hai bảng mới và chính sách đọc cho Admin.
4. SQL cần các bảng gốc từ `supabase-setup.sql`. Nếu trước đây chưa tạo chúng, hãy chạy file gốc trước rồi mới chạy migration.

Kiểm tra bằng SQL:

```sql
select column_name
from information_schema.columns
where table_schema='public'
  and table_name='mrlee_students'
  and column_name in ('firebase_uid','last_activity_at','firebase_synced_at');
```

## 3. Lấy Firebase Service Account JSON (bí mật)

1. Mở https://console.firebase.google.com/project/tieng-han-mr-lee/settings/serviceaccounts/adminsdk
2. Chọn **Generate new private key** (Tạo khóa riêng tư mới), tải JSON về máy. Dùng tài khoản có quyền quản trị dự án Firebase.
3. Mở file JSON trong VS Code/Notepad. Sao chép **toàn bộ nội dung** để dán vào GitHub Secret; giữ khóa riêng tư, không tải file JSON lên website hay đẩy vào repo.
4. Vào trang GitHub repo **Settings → Secrets and variables → Actions → New repository secret**:
   - `Name`: `MRLEE_FIREBASE_SERVICE_ACCOUNT_JSON`
   - `Secret`: toàn bộ nội dung JSON, gồm dấu `{` và `}`.

Service account của JSON phải có `project_id` là `tieng-han-mr-lee`. Mã sẽ từ chối chạy nếu sai dự án.

## 4. Lấy Supabase SECRET Key (không phải Publishable key)

1. Mở https://supabase.com/dashboard/project/pkxqsboyotlyoizzxizb/settings/api-keys
2. Trong phần **Secret keys**, tạo/sao chép một key bắt đầu `sb_secret_`. Không sử dụng `sb_publishable_...` bạn đang dùng trên admin.html.
3. Trong **cùng repo GitHub**, tạo secret:
   - `Name`: `MRLEE_SUPABASE_SECRET_KEY`
   - `Secret`: khóa `sb_secret_...`.

**Không gửi service account JSON hoặc `sb_secret_` vào ChatGPT, Zalo, email hay GitHub commit.** Key này vượt qua RLS và cho quyền ghi dữ liệu trong Supabase. Nên dùng một key riêng để dễ thu hồi.

## 5. Cài vào VS Code

Giải nén ZIP vào thư mục riêng. Chép/chạy `CAI-DONG-BO-MR-LEE.ps1` ngay trong thư mục giải nén (không phải chép mỗi file .ps1 riêng):

```powershell
powershell -ExecutionPolicy Bypass -File .\CAI-DONG-BO-MR-LEE.ps1
```

Bộ cài mặc định sử dụng thư mục:

```
C:\Users\Surface\Documents\tienghanmrlee.github.io
```

Nếu project nằm nơi khác, thêm `-WebsitePath "C:\duong-dan\website"`. Bộ cài sao lưu `admin.html` trước khi sửa. Không thay `index.html`, logo, ảnh bìa, Firebase Rules hoặc bài học.

Sau đó mở Terminal trong folder website:

```powershell
git add admin.html .github/workflows/mrlee-firebase-supabase-sync.yml scripts/mrlee_sync.py scripts/requirements-mrlee-sync.txt
git commit -m "Sync Firebase students and practice history to Supabase Admin"
git push origin main
```

Nếu không chạy PowerShell, chép 4 file ở bảng Mục 1 thủ công đúng thư mục. Không cần đưa `supabase-sync-migration.sql` lên GitHub.

## 6. Chạy đồng bộ lần đầu

1. Vào https://github.com/jeongjunlee10x/tienghanmrlee.github.io/actions
2. Chọn workflow **MR LEE - Firebase to Supabase Sync** (bên trái).
3. Chọn **Run workflow → Branch: main → Run workflow**.
4. Mở lượt chạy, tìm dòng `Sync success: ... students (...) ...` trong log. Không có dòng này nghĩa là chưa đồng bộ thành công.
5. Mở https://jeongjunlee10x.github.io/tienghanmrlee.github.io/admin.html và nhấn **Ctrl+F5**. Trang mới có dòng **Đồng bộ Firebase lần cuối**.

GitHub sẽ chạy lại khoảng **3 giờ/lần**. Bạn có thể bấm Run workflow bất kỳ lúc nào khi muốn cập nhật ngay. GitHub Actions có thể trễ lịch; với repo công khai, nếu không có hoạt động trong 60 ngày, workflow lịch có thể tự tắt.

## 7. Những gì được đồng bộ

- **Firebase Authentication:** UID, email, tên, ngày đăng ký, trạng thái email verified.
- **Firestore `users/{uid}`:** `displayName` nếu tồn tại.
- **Firestore `users/{uid}/learningEvents`:** trang, bài học/chủ đề, loại hoạt động, thời điểm.
- **Firestore `users/{uid}/practiceAttempts`:** tên đề, điểm, tổng điểm, ngày làm bài. Đây là **điểm luyện tập tự chấm**.

**Không** sao chép: mật khẩu, ảnh đại diện, sổ tay/ghi chú cá nhân, toàn bộ câu trả lời/đáp án trong `reviewJson`, điểm thi chính thức. Không ghi từ Supabase trở lại Firebase.

- Hồ sơ và điểm nhập thủ công trên Supabase **được giữ nguyên**.
- Hệ thống dùng `firebase_uid`, mã sự kiện và mã lượt kiểm tra để **tránh nhân bản khi chạy lại**.
- Không tự ghép hồ sơ tạo thủ công theo email để tránh nhầm dữ liệu. Một người có thể tạm thời có hai hồ sơ nếu bạn từng thêm thủ công. Việc liên kết phải được quyết định rõ ràng.
- Không xóa bản sao Supabase khi tài khoản Firebase bị xóa. Nếu có yêu cầu xóa dữ liệu cá nhân, người quản trị cần xử lý cả hai hệ thống theo chính sách hiện hành.
- Một sự kiện `visit` chỉ thể hiện **mở trang**, không chứng minh đã học xong. 
- Những bài làm đã không lưu được vào Firestore trước đó (ví dụ do `permission-denied`) sẽ không thể được phục hồi bằng đồng bộ.

## 8. Lỗi thường gặp

- **Missing required secret:** sai tên hoặc chưa thêm GitHub Secrets.
- **Firebase service account belongs to a different project:** bạn tải JSON từ dự án Firebase khác.
- **Supabase HTTP 404 / column not found:** chưa chạy SQL migration hoặc chạy nhầm dự án.
- **Supabase HTTP 401:** dùng sai key; cần `sb_secret_...`, không phải `sb_publishable_...`.
- **No permissions / FIREBASE auth list_users:** Service account không đủ quyền đọc danh sách Firebase Authentication.
- **Events = 0:** học viên chưa tạo sự kiện hoặc Firestore Rules đã chặn ghi. Kiểm tra Firestore Database → `users/{uid}/learningEvents`.
- **Không thấy workflow ở Actions:** kiểm tra tệp `.github/workflows/mrlee-firebase-supabase-sync.yml` có trên nhánh mặc định `main` và Actions đã bật cho repo.
- **Có học viên nhưng không có điểm:** kiểm tra `users/{uid}/practiceAttempts` có tài liệu đã lưu thành công.
- **Không hiện học viên:** chạy workflow lần đầu, chờ `Sync success`, mở lại trang Admin bằng Ctrl+F5; nếu vẫn chưa có, kiểm tra SQL và kết quả Actions.

## 9. Chi phí và bảo mật

Phương án này không yêu cầu thuê máy chủ thường trực nhưng vẫn tiêu thụ số lượt chạy GitHub Actions, lượt đọc Firestore và tài nguyên Supabase; chỉ miễn phí trong hạn mức từng dịch vụ. Với nhiều học viên, bạn có thể giảm lịch từ 3 giờ thành 6/12 giờ bằng sửa cron trong workflow. Tất cả khóa bí mật chỉ nằm ở GitHub Secrets và trong quá trình thực thi trên runner, không xuất hiện trong trang HTML.
