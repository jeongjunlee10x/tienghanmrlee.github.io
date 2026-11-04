# Script SQL MR LEE — chạy thủ công, không tự deploy

Ba file được chuyển nguyên vẹn từ thư mục gốc vào nhóm quản trị này để tránh lẫn với tài nguyên website.

| Tệp | Công dụng |
| --- | --- |
| `supabase-setup.sql` | Sơ đồ quản trị Supabase ban đầu; **không chạy lại** trên hệ thống đang có dữ liệu |
| `supabase-sync-migration.sql` | Migration đồng bộ Firebase sang Supabase; chỉ dùng sau khi đối chiếu schema và sao lưu |
| `MRLEE_REWARD_V2_SETUP.sql` | Migration bổ sung Reward V2; chưa được coi là triển khai production nếu chưa xác minh dữ liệu thực |

Các script chỉ dùng trong Supabase SQL Editor khi người quản trị chấp thuận. Không chạy tự động khi build website hoặc tạo Cloudflare Pages. Không chứa khóa `service_role` trong source công khai.

**Đường dẫn mới**: `supabase/manual-sql/`. Mã kiểm toán trong `tools/audit-mrlee-rewards.mjs` đã được cập nhật.
