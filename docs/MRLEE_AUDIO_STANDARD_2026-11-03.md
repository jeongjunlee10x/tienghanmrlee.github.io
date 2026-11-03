# Chuẩn âm thanh MR LEE — 03/11/2026

## Phạm vi
- Âm thanh của website gồm `MRLEE_AUDIO/`, `MRLEE_PRO_AUDIO/`, `assets/topik-v10/` và giọng đọc trực tiếp trong các trang học.
- Công cụ V1 `tools/mrlee-audio-v1.py` **chỉ đọc các CSV `MRLEE_AUDIO/**/DANH_SACH.csv`**. Chưa thay thế binary MP3 đã xuất bản và chưa sửa các kho còn lại.
- Cấu trúc hiện có được ghi nhận: 8.447 tệp dưới `MRLEE_AUDIO/`; 4.628 tệp dưới `MRLEE_PRO_AUDIO/`, không đồng nghĩa tất cả đều có đủ transcript.

## Nguyên tắc tạo giọng
1. Giọng nam: `ko-KR-InJoonNeural`; giọng nữ: `ko-KR-SunHiNeural`.
2. `남자:`, `여자:`, `남성:`, `여성:` là nhãn metadata, **không đưa vào âm thanh**.
3. Nhiều lượt hội thoại: giữ đúng thứ tự và giọng theo vai.
4. Bài nghe TOPIK có mẫu filename `listening-NNN`: đọc `N번` rồi phát câu thoại 2 lần; khoảng nghỉ 1,5 giây giữa hai lượt.
5. Các mục từ/câu mẫu không có vai: công cụ V1 phân phối luân phiên nam/nữ theo số thứ tự tệp; các dòng đã ghi vai phải ưu tiên vai đó.
6. Không có file / lỗi giải mã / giọng sai: báo lỗi, không tự đánh dấu đạt hoặc âm thầm dùng giọng trình duyệt thay thế.
7. **Không xóa hoặc đổi tên file MP3 cũ** nếu chưa đối chiếu manifest/URL.

## Lệnh vận hành trên máy có clone Git

```powershell
cd G:\tienghanmrlee.github.io
python tools/test-mrlee-audio-v1.py
python tools/mrlee-audio-v1.py audit --section 03_TOPIK
python tools/mrlee-audio-v1.py build --section 03_TOPIK --limit 20
```

Để tạo **sau khi sao lưu MP3 cũ và kiểm tra 20 mẫu bằng tai**, cài `pip install edge-tts`, FFmpeg trên PATH và chạy:

```powershell
python tools/mrlee-audio-v1.py build --section 03_TOPIK --limit 20 --apply --confirm-replace
git status --short
```

Công cụ chỉ thay MP3 trong clone cục bộ; **không tự push**. Chỉ push khi đã nghe kiểm tra, chạy QA site, kiểm tra đường dẫn và chọn đúng các MP3 cần đưa lên server.

## Chưa được xác nhận
- Chưa chạy audit thực tế trên toàn bộ 13.075 tệp và chưa thẩm định nội dung nghe từng file.
- Chưa tái tạo MP3 trên GitHub; repository connector chỉ cập nhật mã nguồn và tài liệu trong đợt này.
- Chưa bảo đảm tất cả data TOPIK/V10/Workbook/PRO có text script hợp lệ; cần lập manifest riêng cho nguồn chưa có CSV.
- Những nhãn nằm **giữa cùng một dòng** không có ngắt dòng cần phân đoạn thủ công hoặc chuẩn hóa dữ liệu trước để tránh giọng bị trộn.
