// MR LEE - Lo trinh 1-6: noi dung bien soan rieng, tham chieu Sejong/Topik
export const LEVELS = [
 {
  "level": 1,
  "name": "Sơ cấp 1",
  "ko": "초급 1",
  "band": "TOPIK I",
  "badge": "Nền tảng",
  "summary": "Hangeul, giới thiệu, gia đình, thời gian, giao tiếp sinh hoạt cơ bản.",
  "speaking": "Câu đơn 5–10 giây",
  "source": "Đã có giáo trình Mr Lee (15 bài)",
  "color": "#0a9a94"
 },
 {
  "level": 2,
  "name": "Sơ cấp 2",
  "ko": "초급 2",
  "band": "TOPIK I",
  "badge": "Giao tiếp cơ bản",
  "summary": "Tình huống công cộng, mua sắm, dịch vụ, kế hoạch và kinh nghiệm.",
  "speaking": "Câu ghép 10–20 giây",
  "source": "Đã có giáo trình Mr Lee (15 bài)",
  "color": "#2189d3"
 },
 {
  "level": 3,
  "name": "Trung cấp 1",
  "ko": "중급 1",
  "band": "TOPIK II",
  "badge": "Tự tin sinh hoạt",
  "summary": "Xử lý việc thuê nhà, bệnh viện, làm thêm, chia sẻ kinh nghiệm và đề xuất.",
  "speaking": "4 lượt nói 15–25 giây",
  "source": "Bài học biên soạn mới",
  "color": "#586bdd"
 },
 {
  "level": 4,
  "name": "Trung cấp 2",
  "ko": "중급 2",
  "band": "TOPIK II",
  "badge": "Thảo luận công việc",
  "summary": "Lập luận, báo cáo, giải quyết vấn đề, so sánh và giao tiếp chuyên nghiệp.",
  "speaking": "4 lượt nói 20–40 giây",
  "source": "Bài học biên soạn mới",
  "color": "#8564d5"
 },
 {
  "level": 5,
  "name": "Cao cấp 1",
  "ko": "고급 1",
  "band": "TOPIK II",
  "badge": "Trình bày quan điểm",
  "summary": "Phân tích dữ liệu, tranh luận vấn đề xã hội, chính sách và diễn thuyết.",
  "speaking": "4 lượt nói 30–60 giây",
  "source": "Bài học biên soạn mới",
  "color": "#cc7046"
 },
 {
  "level": 6,
  "name": "Cao cấp 2",
  "ko": "고급 2",
  "band": "TOPIK II",
  "badge": "Biện luận học thuật",
  "summary": "Phản biện nghiên cứu, hòa giải, lập luận nâng cao và phát biểu phức tạp.",
  "speaking": "4 lượt nói 45–90 giây",
  "source": "Bài học biên soạn mới",
  "color": "#bc4d83"
 }
];
export const ROADMAP_UNITS = [
 {
  "id": "sc1-01",
  "level": 1,
  "number": 1,
  "title": "소개",
  "ko": "소개",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "안녕하세요. 저는 베트남에서 왔습니다.",
    "vi": "Xin chào. Tôi đến từ Việt Nam."
   },
   {
    "ko": "저는 한국어를 공부하는 학생입니다.",
    "vi": "Tôi là học viên học tiếng Hàn."
   },
   {
    "ko": "제 이름은 민수입니다.",
    "vi": "Tên tôi là Min-su."
   },
   {
    "ko": "만나서 반갑습니다.",
    "vi": "Rất vui được gặp bạn."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-1.html#bai-1",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc1-01"
 },
 {
  "id": "sc1-02",
  "level": 1,
  "number": 2,
  "title": "학교",
  "ko": "학교",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "저는 학교에 갑니다.",
    "vi": "Tôi đến trường."
   },
   {
    "ko": "도서관이 어디에 있어요?",
    "vi": "Thư viện ở đâu ạ?"
   },
   {
    "ko": "책을 읽고 공부합니다.",
    "vi": "Tôi đọc sách và học."
   },
   {
    "ko": "이것은 제 공책입니다.",
    "vi": "Đây là quyển vở của tôi."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-1.html#bai-2",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc1-02"
 },
 {
  "id": "sc1-03",
  "level": 1,
  "number": 3,
  "title": "일상생활",
  "ko": "일상생활",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "저는 아침에 일어납니다.",
    "vi": "Tôi thức dậy vào buổi sáng."
   },
   {
    "ko": "친구와 같이 점심을 먹어요.",
    "vi": "Tôi ăn trưa cùng bạn."
   },
   {
    "ko": "저녁에는 한국어를 공부합니다.",
    "vi": "Buổi tối tôi học tiếng Hàn."
   },
   {
    "ko": "오늘은 집에서 쉽니다.",
    "vi": "Hôm nay tôi nghỉ ở nhà."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-1.html#bai-3",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc1-03"
 },
 {
  "id": "sc1-04",
  "level": 1,
  "number": 4,
  "title": "날짜와 요일",
  "ko": "날짜와 요일",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "오늘은 월요일입니다.",
    "vi": "Hôm nay là thứ Hai."
   },
   {
    "ko": "내일은 화요일입니다.",
    "vi": "Ngày mai là thứ Ba."
   },
   {
    "ko": "오늘은 몇 월 며칠이에요?",
    "vi": "Hôm nay là ngày mấy tháng mấy?"
   },
   {
    "ko": "주말에 시간이 있어요?",
    "vi": "Cuối tuần bạn có thời gian không?"
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-1.html#bai-4",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc1-04"
 },
 {
  "id": "sc1-05",
  "level": 1,
  "number": 5,
  "title": "하루 일과",
  "ko": "하루 일과",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "아침 일곱 시에 일어납니다.",
    "vi": "Tôi thức dậy lúc bảy giờ."
   },
   {
    "ko": "아홉 시에 수업을 시작합니다.",
    "vi": "Tôi bắt đầu giờ học lúc chín giờ."
   },
   {
    "ko": "점심시간에 밥을 먹습니다.",
    "vi": "Tôi ăn cơm vào giờ trưa."
   },
   {
    "ko": "밤 열한 시에 잠을 잡니다.",
    "vi": "Tôi đi ngủ lúc mười một giờ đêm."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-1.html#bai-5",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc1-05"
 },
 {
  "id": "sc1-06",
  "level": 1,
  "number": 6,
  "title": "주말",
  "ko": "주말",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "주말에 무엇을 해요?",
    "vi": "Cuối tuần bạn làm gì?"
   },
   {
    "ko": "토요일에 친구를 만납니다.",
    "vi": "Thứ Bảy tôi gặp bạn."
   },
   {
    "ko": "일요일에 영화를 봅니다.",
    "vi": "Chủ nhật tôi xem phim."
   },
   {
    "ko": "집에서 편하게 쉬고 싶어요.",
    "vi": "Tôi muốn nghỉ ngơi thoải mái ở nhà."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-1.html#bai-6",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc1-06"
 },
 {
  "id": "sc1-07",
  "level": 1,
  "number": 7,
  "title": "물건 사기 (1)",
  "ko": "물건 사기 (1)",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "이 사과는 얼마예요?",
    "vi": "Quả táo này bao nhiêu tiền?"
   },
   {
    "ko": "이거 하나 주세요.",
    "vi": "Cho tôi một cái này."
   },
   {
    "ko": "조금 깎아 주시겠어요?",
    "vi": "Anh/chị giảm giá một chút được không?"
   },
   {
    "ko": "카드로 계산할게요.",
    "vi": "Tôi sẽ thanh toán bằng thẻ."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-1.html#bai-7",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc1-07"
 },
 {
  "id": "sc1-08",
  "level": 1,
  "number": 8,
  "title": "음식",
  "ko": "음식",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "무슨 음식을 좋아해요?",
    "vi": "Bạn thích món ăn nào?"
   },
   {
    "ko": "저는 김치찌개를 좋아합니다.",
    "vi": "Tôi thích canh kimchi."
   },
   {
    "ko": "물이 좀 필요해요.",
    "vi": "Tôi cần một chút nước."
   },
   {
    "ko": "너무 맵지 않게 해 주세요.",
    "vi": "Xin đừng làm quá cay."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-1.html#bai-8",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc1-08"
 },
 {
  "id": "sc1-09",
  "level": 1,
  "number": 9,
  "title": "집",
  "ko": "집",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "우리 집은 학교 근처에 있어요.",
    "vi": "Nhà tôi ở gần trường."
   },
   {
    "ko": "방에 책상과 침대가 있어요.",
    "vi": "Trong phòng có bàn và giường."
   },
   {
    "ko": "집에 어떻게 가요?",
    "vi": "Về nhà bằng cách nào?"
   },
   {
    "ko": "제 방은 작지만 편해요.",
    "vi": "Phòng tôi nhỏ nhưng thoải mái."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-1.html#bai-9",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc1-09"
 },
 {
  "id": "sc1-10",
  "level": 1,
  "number": 10,
  "title": "가족",
  "ko": "가족",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "우리 가족은 네 명입니다.",
    "vi": "Gia đình tôi có bốn người."
   },
   {
    "ko": "아버지는 회사에 다니세요.",
    "vi": "Bố tôi đi làm ở công ty."
   },
   {
    "ko": "어머니는 요리를 잘하세요.",
    "vi": "Mẹ tôi nấu ăn giỏi."
   },
   {
    "ko": "저는 가족을 사랑합니다.",
    "vi": "Tôi yêu gia đình mình."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-1.html#bai-10",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc1-10"
 },
 {
  "id": "sc1-11",
  "level": 1,
  "number": 11,
  "title": "날씨",
  "ko": "날씨",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "오늘 날씨가 정말 좋아요.",
    "vi": "Thời tiết hôm nay rất đẹp."
   },
   {
    "ko": "밖에 비가 와요.",
    "vi": "Ngoài trời đang mưa."
   },
   {
    "ko": "겨울에는 날씨가 추워요.",
    "vi": "Mùa đông thời tiết lạnh."
   },
   {
    "ko": "내일은 맑을 거예요.",
    "vi": "Ngày mai trời sẽ quang."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-1.html#bai-11",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc1-11"
 },
 {
  "id": "sc1-12",
  "level": 1,
  "number": 12,
  "title": "전화 (1)",
  "ko": "전화 (1)",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "여보세요, 누구세요?",
    "vi": "A lô, ai đấy ạ?"
   },
   {
    "ko": "지금 통화할 수 있어요?",
    "vi": "Bây giờ có thể nói chuyện điện thoại không?"
   },
   {
    "ko": "잠깐만 기다려 주세요.",
    "vi": "Xin đợi một chút."
   },
   {
    "ko": "나중에 다시 전화할게요.",
    "vi": "Tôi sẽ gọi lại sau."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-1.html#bai-12",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc1-12"
 },
 {
  "id": "sc1-13",
  "level": 1,
  "number": 13,
  "title": "생일",
  "ko": "생일",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "생일이 언제예요?",
    "vi": "Sinh nhật bạn khi nào?"
   },
   {
    "ko": "생일 축하합니다.",
    "vi": "Chúc mừng sinh nhật."
   },
   {
    "ko": "친구에게 선물을 줬어요.",
    "vi": "Tôi đã tặng quà cho bạn."
   },
   {
    "ko": "오늘은 정말 행복한 날이에요.",
    "vi": "Hôm nay thật là ngày hạnh phúc."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-1.html#bai-13",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc1-13"
 },
 {
  "id": "sc1-14",
  "level": 1,
  "number": 14,
  "title": "취미",
  "ko": "취미",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "취미가 무엇입니까?",
    "vi": "Sở thích của bạn là gì?"
   },
   {
    "ko": "저는 음악 듣기를 좋아해요.",
    "vi": "Tôi thích nghe nhạc."
   },
   {
    "ko": "시간이 있을 때 책을 읽어요.",
    "vi": "Khi có thời gian tôi đọc sách."
   },
   {
    "ko": "주말마다 운동을 해요.",
    "vi": "Tôi tập thể dục mỗi cuối tuần."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-1.html#bai-14",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc1-14"
 },
 {
  "id": "sc1-15",
  "level": 1,
  "number": 15,
  "title": "교통 (1)",
  "ko": "교통 (1)",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "버스 정류장이 어디예요?",
    "vi": "Trạm xe buýt ở đâu?"
   },
   {
    "ko": "지하철을 타고 학교에 가요.",
    "vi": "Tôi đi tàu điện đến trường."
   },
   {
    "ko": "여기에서 내려 주세요.",
    "vi": "Xin cho tôi xuống ở đây."
   },
   {
    "ko": "이 버스는 서울역에 가나요?",
    "vi": "Xe buýt này có đến ga Seoul không?"
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-1.html#bai-15",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc1-15"
 },
 {
  "id": "sc2-01",
  "level": 2,
  "number": 1,
  "title": "만남",
  "ko": "만남",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "오랜만에 만나서 반가워요.",
    "vi": "Lâu ngày gặp lại thật vui."
   },
   {
    "ko": "요즘 어떻게 지내세요?",
    "vi": "Dạo này bạn thế nào?"
   },
   {
    "ko": "친구를 소개해 드릴게요.",
    "vi": "Tôi sẽ giới thiệu bạn của tôi."
   },
   {
    "ko": "다음에 또 만나요.",
    "vi": "Lần sau lại gặp nhau nhé."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-2.html#bai-1",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc2-01"
 },
 {
  "id": "sc2-02",
  "level": 2,
  "number": 2,
  "title": "약속",
  "ko": "약속",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "내일 오후에 만날 수 있어요?",
    "vi": "Chiều mai bạn gặp được không?"
   },
   {
    "ko": "우리 세 시에 만나기로 해요.",
    "vi": "Chúng ta hẹn gặp lúc ba giờ nhé."
   },
   {
    "ko": "약속 시간을 꼭 지킬게요.",
    "vi": "Tôi sẽ giữ đúng giờ hẹn."
   },
   {
    "ko": "늦어서 정말 죄송합니다.",
    "vi": "Tôi thật sự xin lỗi vì đến muộn."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-2.html#bai-2",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc2-02"
 },
 {
  "id": "sc2-03",
  "level": 2,
  "number": 3,
  "title": "물건 사기 (2)",
  "ko": "물건 사기 (2)",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "다른 색깔도 있나요?",
    "vi": "Có màu khác không ạ?"
   },
   {
    "ko": "한 치수 큰 것으로 주세요.",
    "vi": "Cho tôi cỡ lớn hơn một chút."
   },
   {
    "ko": "이 옷을 입어 봐도 돼요?",
    "vi": "Tôi thử mặc bộ đồ này được không?"
   },
   {
    "ko": "영수증을 받을 수 있을까요?",
    "vi": "Tôi xin hóa đơn được không ạ?"
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-2.html#bai-3",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc2-03"
 },
 {
  "id": "sc2-04",
  "level": 2,
  "number": 4,
  "title": "병원",
  "ko": "병원",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "어디가 아프세요?",
    "vi": "Bạn bị đau ở đâu?"
   },
   {
    "ko": "열이 나고 머리가 아파요.",
    "vi": "Tôi sốt và đau đầu."
   },
   {
    "ko": "언제부터 아프셨어요?",
    "vi": "Bạn đau từ khi nào?"
   },
   {
    "ko": "약을 하루에 두 번 드세요.",
    "vi": "Hãy uống thuốc hai lần một ngày."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-2.html#bai-4",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc2-04"
 },
 {
  "id": "sc2-05",
  "level": 2,
  "number": 5,
  "title": "편지",
  "ko": "편지",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "친구에게 편지를 쓰고 있어요.",
    "vi": "Tôi đang viết thư cho bạn."
   },
   {
    "ko": "이 편지를 한국으로 보내 주세요.",
    "vi": "Xin gửi lá thư này đến Hàn Quốc."
   },
   {
    "ko": "받는 사람 주소를 적어 주세요.",
    "vi": "Hãy ghi địa chỉ người nhận."
   },
   {
    "ko": "답장을 기다리고 있습니다.",
    "vi": "Tôi đang đợi thư hồi âm."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-2.html#bai-5",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc2-05"
 },
 {
  "id": "sc2-06",
  "level": 2,
  "number": 6,
  "title": "교통 (2)",
  "ko": "교통 (2)",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "가장 빠른 길이 어디예요?",
    "vi": "Đường nào nhanh nhất ạ?"
   },
   {
    "ko": "여기에서 갈아타야 합니다.",
    "vi": "Phải chuyển tuyến ở đây."
   },
   {
    "ko": "교통카드를 충전하고 싶어요.",
    "vi": "Tôi muốn nạp tiền vào thẻ giao thông."
   },
   {
    "ko": "막차가 몇 시에 출발해요?",
    "vi": "Chuyến cuối khởi hành lúc mấy giờ?"
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-2.html#bai-6",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc2-06"
 },
 {
  "id": "sc2-07",
  "level": 2,
  "number": 7,
  "title": "전화 (2)",
  "ko": "전화 (2)",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "잠시 후에 다시 연락드리겠습니다.",
    "vi": "Tôi sẽ liên lạc lại sau một lát."
   },
   {
    "ko": "담당자와 통화할 수 있을까요?",
    "vi": "Tôi có thể nói chuyện với người phụ trách không?"
   },
   {
    "ko": "메시지를 남겨 드릴까요?",
    "vi": "Tôi để lại lời nhắn giúp nhé?"
   },
   {
    "ko": "전화번호를 다시 말씀해 주세요.",
    "vi": "Xin nói lại số điện thoại."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-2.html#bai-7",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc2-07"
 },
 {
  "id": "sc2-08",
  "level": 2,
  "number": 8,
  "title": "영화",
  "ko": "영화",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "어떤 영화를 보고 싶어요?",
    "vi": "Bạn muốn xem phim nào?"
   },
   {
    "ko": "표 두 장을 예약하고 싶어요.",
    "vi": "Tôi muốn đặt hai vé."
   },
   {
    "ko": "영화가 몇 시에 시작해요?",
    "vi": "Phim bắt đầu lúc mấy giờ?"
   },
   {
    "ko": "이 영화는 정말 감동적이었어요.",
    "vi": "Bộ phim này thật cảm động."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-2.html#bai-8",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc2-08"
 },
 {
  "id": "sc2-09",
  "level": 2,
  "number": 9,
  "title": "휴일",
  "ko": "휴일",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "연휴에 어디에 갈 거예요?",
    "vi": "Dịp nghỉ dài bạn định đi đâu?"
   },
   {
    "ko": "이번 휴일에는 푹 쉬려고 해요.",
    "vi": "Kỳ nghỉ này tôi định nghỉ ngơi thật thoải mái."
   },
   {
    "ko": "가족과 시간을 보냈습니다.",
    "vi": "Tôi đã dành thời gian với gia đình."
   },
   {
    "ko": "다음 휴일이 기다려져요.",
    "vi": "Tôi mong đến kỳ nghỉ tiếp theo."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-2.html#bai-9",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc2-09"
 },
 {
  "id": "sc2-10",
  "level": 2,
  "number": 10,
  "title": "외모",
  "ko": "외모",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "키가 크고 머리가 짧아요.",
    "vi": "Người ấy cao và tóc ngắn."
   },
   {
    "ko": "안경을 쓴 사람이 제 친구예요.",
    "vi": "Người đeo kính là bạn tôi."
   },
   {
    "ko": "오늘 옷이 정말 잘 어울려요.",
    "vi": "Trang phục hôm nay rất hợp với bạn."
   },
   {
    "ko": "그 사람은 인상이 좋아 보여요.",
    "vi": "Người đó trông có ấn tượng tốt."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-2.html#bai-10",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc2-10"
 },
 {
  "id": "sc2-11",
  "level": 2,
  "number": 11,
  "title": "여행",
  "ko": "여행",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "다음 주에 부산으로 여행을 가요.",
    "vi": "Tuần sau tôi đi du lịch Busan."
   },
   {
    "ko": "숙소를 미리 예약했어요.",
    "vi": "Tôi đã đặt chỗ nghỉ trước."
   },
   {
    "ko": "여기에서 사진을 찍어도 되나요?",
    "vi": "Tôi chụp ảnh ở đây được không?"
   },
   {
    "ko": "여행이 정말 즐거웠습니다.",
    "vi": "Chuyến du lịch rất vui."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-2.html#bai-11",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc2-11"
 },
 {
  "id": "sc2-12",
  "level": 2,
  "number": 12,
  "title": "공공장소",
  "ko": "공공장소",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "여기에서 사진을 찍어도 됩니까?",
    "vi": "Tôi có được chụp ảnh tại đây không?"
   },
   {
    "ko": "도서관에서는 조용히 해 주세요.",
    "vi": "Xin giữ yên lặng trong thư viện."
   },
   {
    "ko": "쓰레기는 어디에 버려요?",
    "vi": "Rác nên bỏ ở đâu?"
   },
   {
    "ko": "출입구는 오른쪽에 있습니다.",
    "vi": "Lối ra vào ở bên phải."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-2.html#bai-12",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc2-12"
 },
 {
  "id": "sc2-13",
  "level": 2,
  "number": 13,
  "title": "도시",
  "ko": "도시",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "서울은 교통이 편리한 도시예요.",
    "vi": "Seoul là thành phố có giao thông tiện lợi."
   },
   {
    "ko": "이 동네에는 공원이 많아요.",
    "vi": "Khu phố này có nhiều công viên."
   },
   {
    "ko": "시내까지 얼마나 걸려요?",
    "vi": "Mất bao lâu để đến trung tâm?"
   },
   {
    "ko": "저는 조용한 동네에 살고 싶어요.",
    "vi": "Tôi muốn sống ở khu phố yên tĩnh."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-2.html#bai-13",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc2-13"
 },
 {
  "id": "sc2-14",
  "level": 2,
  "number": 14,
  "title": "계획",
  "ko": "계획",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "앞으로 어떤 계획이 있어요?",
    "vi": "Sắp tới bạn có kế hoạch gì?"
   },
   {
    "ko": "올해 한국어 실력을 높이고 싶어요.",
    "vi": "Năm nay tôi muốn cải thiện tiếng Hàn."
   },
   {
    "ko": "매일 한 시간씩 공부할 예정입니다.",
    "vi": "Tôi dự định học mỗi ngày một giờ."
   },
   {
    "ko": "목표를 이루기 위해 노력하겠습니다.",
    "vi": "Tôi sẽ cố gắng để đạt mục tiêu."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-2.html#bai-14",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc2-14"
 },
 {
  "id": "sc2-15",
  "level": 2,
  "number": 15,
  "title": "한국 생활",
  "ko": "한국 생활",
  "grammar": "Ôn cấu trúc và từ vựng trong bài đã có",
  "goal": "Nghe, nói theo mẫu và áp dụng trong đời sống",
  "samples": [
   {
    "ko": "한국 생활에 많이 익숙해졌어요.",
    "vi": "Tôi đã quen nhiều với cuộc sống ở Hàn."
   },
   {
    "ko": "처음에는 한국어가 어려웠어요.",
    "vi": "Ban đầu tiếng Hàn rất khó."
   },
   {
    "ko": "아르바이트를 하기 전에 허가를 확인할게요.",
    "vi": "Trước khi làm thêm tôi sẽ kiểm tra giấy phép."
   },
   {
    "ko": "한국 문화를 더 배우고 싶어요.",
    "vi": "Tôi muốn tìm hiểu thêm văn hóa Hàn Quốc."
   }
  ],
  "prompt": "Hãy sử dụng mẫu câu đã học để giới thiệu tình huống của mình.",
  "source": "existing",
  "lessonUrl": "so-cap-2.html#bai-15",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc2-15"
 },
 {
  "id": "sc3-01",
  "level": 3,
  "number": 1,
  "title": "Cuộc sống ký túc xá",
  "ko": "기숙사 생활",
  "grammar": "-아/어야 하다; -(으)면 안 되다",
  "goal": "Giải thích quy định và đề nghị thay đổi",
  "samples": [
   {
    "ko": "기숙사에서는 밤 열한 시 이후에 조용히 해야 해요.",
    "vi": "Trong ký túc xá phải giữ yên lặng sau 11 giờ đêm."
   },
   {
    "ko": "공용 주방을 사용한 후에는 깨끗이 정리해야 해요.",
    "vi": "Sau khi sử dụng bếp chung phải dọn dẹp sạch sẽ."
   },
   {
    "ko": "친구를 초대하려면 먼저 관리자에게 물어보세요.",
    "vi": "Muốn mời bạn đến thì hãy hỏi người quản lý trước."
   },
   {
    "ko": "규칙을 잘 몰랐으니 다시 한번 설명해 주시겠어요?",
    "vi": "Tôi chưa hiểu rõ nội quy nên xin giải thích lại được không?"
   }
  ],
  "prompt": "새 룸메이트에게 기숙사 규칙을 설명해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=3&lesson=1",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc3-01"
 },
 {
  "id": "sc3-02",
  "level": 3,
  "number": 2,
  "title": "Sắp xếp ca làm thêm",
  "ko": "아르바이트 일정",
  "grammar": "-(으)ㄹ 수 있다; -기 때문에",
  "goal": "Thảo luận lịch làm và lý do",
  "samples": [
   {
    "ko": "수업이 끝나는 시간이 달라서 금요일에는 늦게 출근할 수 있어요.",
    "vi": "Giờ tan học khác nhau nên thứ Sáu tôi có thể đi làm muộn."
   },
   {
    "ko": "이번 주 토요일에 제 근무 시간을 바꿀 수 있을까요?",
    "vi": "Thứ Bảy tuần này tôi có thể đổi ca làm không?"
   },
   {
    "ko": "시험 기간이기 때문에 다음 주에는 시간을 조금 줄이고 싶어요.",
    "vi": "Vì đang trong kỳ thi nên tuần sau tôi muốn giảm giờ làm một chút."
   },
   {
    "ko": "대신 일할 수 있는 동료에게 미리 부탁하겠습니다.",
    "vi": "Tôi sẽ nhờ trước đồng nghiệp có thể làm thay."
   }
  ],
  "prompt": "사장님에게 다음 주 근무 변경을 정중히 요청해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=3&lesson=2",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc3-02"
 },
 {
  "id": "sc3-03",
  "level": 3,
  "number": 3,
  "title": "Khám bệnh và triệu chứng",
  "ko": "병원에서 증상 설명",
  "grammar": "-은/는 것 같다; -아/어 보다",
  "goal": "Mô tả triệu chứng và lịch sử sức khỏe",
  "samples": [
   {
    "ko": "어제부터 목이 아프고 열이 나는 것 같아요.",
    "vi": "Từ hôm qua tôi đau họng và hình như bị sốt."
   },
   {
    "ko": "이 약을 먹어 봤지만 아직 낫지 않았어요.",
    "vi": "Tôi đã thử uống thuốc này nhưng vẫn chưa khỏi."
   },
   {
    "ko": "음식을 먹을 때마다 속이 불편합니다.",
    "vi": "Mỗi lần ăn tôi đều cảm thấy khó chịu trong bụng."
   },
   {
    "ko": "언제 다시 병원에 와야 하는지 알려 주세요.",
    "vi": "Xin cho biết khi nào tôi cần quay lại bệnh viện."
   }
  ],
  "prompt": "의사에게 증상과 복용한 약을 설명해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=3&lesson=3",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc3-03"
 },
 {
  "id": "sc3-04",
  "level": 3,
  "number": 4,
  "title": "Tìm thuê phòng",
  "ko": "방 구하기",
  "grammar": "-(으)려고 하다; -는 동안",
  "goal": "Hỏi điều kiện thuê nhà",
  "samples": [
   {
    "ko": "학교 근처에서 지낼 수 있는 방을 구하려고 해요.",
    "vi": "Tôi định tìm phòng có thể ở gần trường."
   },
   {
    "ko": "계약하는 동안 주의해야 할 점이 무엇인가요?",
    "vi": "Trong lúc ký hợp đồng cần chú ý điều gì?"
   },
   {
    "ko": "관리비에 인터넷 요금도 포함되어 있나요?",
    "vi": "Phí quản lý có bao gồm tiền Internet không?"
   },
   {
    "ko": "방을 직접 본 뒤에 결정하고 싶습니다.",
    "vi": "Tôi muốn quyết định sau khi trực tiếp xem phòng."
   }
  ],
  "prompt": "집주인에게 보증금과 관리비를 질문해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=3&lesson=4",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc3-04"
 },
 {
  "id": "sc3-05",
  "level": 3,
  "number": 5,
  "title": "Bưu điện và chuyển phát",
  "ko": "우체국과 택배",
  "grammar": "-(으)ㄹ 때; -아/어 주다",
  "goal": "Gửi bưu kiện và hỏi thời gian",
  "samples": [
   {
    "ko": "베트남으로 소포를 보낼 때 어떤 서류가 필요해요?",
    "vi": "Khi gửi bưu kiện về Việt Nam cần giấy tờ nào?"
   },
   {
    "ko": "깨지기 쉬운 물건이라서 조심해서 포장해 주세요.",
    "vi": "Vì là đồ dễ vỡ nên xin gói cẩn thận."
   },
   {
    "ko": "배송이 언제 도착하는지 확인해 주시겠어요?",
    "vi": "Anh/chị có thể kiểm tra khi nào hàng đến không?"
   },
   {
    "ko": "주소를 잘못 썼는데 지금 수정할 수 있을까요?",
    "vi": "Tôi viết nhầm địa chỉ, bây giờ có sửa được không?"
   }
  ],
  "prompt": "직원에게 배송 지연 상황을 설명해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=3&lesson=5",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc3-05"
 },
 {
  "id": "sc3-06",
  "level": 3,
  "number": 6,
  "title": "Sự cố giao thông",
  "ko": "교통 문제 해결",
  "grammar": "-느라고; -는 바람에",
  "goal": "Giải thích đi muộn và tìm giải pháp",
  "samples": [
   {
    "ko": "버스를 기다리느라고 약속 시간에 늦었어요.",
    "vi": "Vì đợi xe buýt nên tôi đến muộn giờ hẹn."
   },
   {
    "ko": "지하철이 고장 나는 바람에 다른 노선으로 갈아탔어요.",
    "vi": "Vì tàu điện bị hỏng nên tôi đã chuyển sang tuyến khác."
   },
   {
    "ko": "가장 빨리 갈 수 있는 방법을 알려 주시겠어요?",
    "vi": "Xin chỉ giúp cách đi nhanh nhất được không?"
   },
   {
    "ko": "다음부터는 교통 상황을 미리 확인하겠습니다.",
    "vi": "Từ lần sau tôi sẽ kiểm tra tình hình giao thông trước."
   }
  ],
  "prompt": "지각한 이유와 다음 계획을 설명해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=3&lesson=6",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc3-06"
 },
 {
  "id": "sc3-07",
  "level": 3,
  "number": 7,
  "title": "Đổi trả và bảo hành",
  "ko": "교환과 환불",
  "grammar": "-았/었는데; -아/어도 되다",
  "goal": "Trình bày lỗi hàng hóa lịch sự",
  "samples": [
   {
    "ko": "어제 이 옷을 샀는데 크기가 맞지 않아요.",
    "vi": "Hôm qua tôi mua áo này nhưng kích cỡ không phù hợp."
   },
   {
    "ko": "영수증이 있으면 다른 상품으로 교환해도 되나요?",
    "vi": "Nếu có hóa đơn tôi đổi sang sản phẩm khác được không?"
   },
   {
    "ko": "제품이 처음부터 작동하지 않았습니다.",
    "vi": "Sản phẩm ngay từ đầu đã không hoạt động."
   },
   {
    "ko": "환불 절차가 얼마나 걸리는지 알려 주세요.",
    "vi": "Xin cho biết thủ tục hoàn tiền mất bao lâu."
   }
  ],
  "prompt": "불량 상품에 대해 차분히 설명해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=3&lesson=7",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc3-07"
 },
 {
  "id": "sc3-08",
  "level": 3,
  "number": 8,
  "title": "Mời bạn và từ chối khéo",
  "ko": "초대와 거절",
  "grammar": "-(으)ㄹ까 하다; -기는 하지만",
  "goal": "Gợi ý kế hoạch và từ chối tế nhị",
  "samples": [
   {
    "ko": "이번 주말에 친구들과 같이 등산을 갈까 해요.",
    "vi": "Cuối tuần này tôi định đi leo núi cùng bạn."
   },
   {
    "ko": "가고 싶기는 하지만 그날은 아르바이트가 있어요.",
    "vi": "Tôi muốn đi nhưng hôm đó có lịch làm thêm."
   },
   {
    "ko": "다음 주에 시간이 괜찮다면 함께 가요.",
    "vi": "Nếu tuần sau có thời gian thì đi cùng nhau nhé."
   },
   {
    "ko": "초대해 줘서 고마워요. 다음에는 꼭 참석할게요.",
    "vi": "Cảm ơn vì đã mời. Lần sau tôi nhất định tham gia."
   }
  ],
  "prompt": "친구의 초대를 정중하게 거절해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=3&lesson=8",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc3-08"
 },
 {
  "id": "sc3-09",
  "level": 3,
  "number": 9,
  "title": "Kể lại trải nghiệm",
  "ko": "경험 이야기",
  "grammar": "-(으)ㄴ 적이 있다; -더라고요",
  "goal": "Tường thuật trải nghiệm thực tế",
  "samples": [
   {
    "ko": "지난 겨울에 제주도에 가 본 적이 있어요.",
    "vi": "Mùa đông trước tôi từng đến đảo Jeju."
   },
   {
    "ko": "직접 가 보니까 사진보다 훨씬 아름답더라고요.",
    "vi": "Khi đến thực tế tôi thấy đẹp hơn ảnh rất nhiều."
   },
   {
    "ko": "날씨가 갑자기 추워져서 따뜻한 옷이 필요했어요.",
    "vi": "Thời tiết đột nhiên lạnh nên tôi cần quần áo ấm."
   },
   {
    "ko": "그 경험 덕분에 여행 준비의 중요성을 알게 됐어요.",
    "vi": "Nhờ trải nghiệm đó tôi hiểu tầm quan trọng của việc chuẩn bị du lịch."
   }
  ],
  "prompt": "한국에서 기억에 남는 경험을 이야기해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=3&lesson=9",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc3-09"
 },
 {
  "id": "sc3-10",
  "level": 3,
  "number": 10,
  "title": "Lập kế hoạch học tập",
  "ko": "학습 계획",
  "grammar": "-(으)ㄹ 계획이다; -도록 하다",
  "goal": "Đặt mục tiêu và cam kết",
  "samples": [
   {
    "ko": "다음 달까지 한국어 단어를 오백 개 외울 계획이에요.",
    "vi": "Tôi định học thuộc 500 từ tiếng Hàn trước tháng sau."
   },
   {
    "ko": "매일 조금씩 복습하도록 하겠습니다.",
    "vi": "Tôi sẽ cố gắng ôn tập một chút mỗi ngày."
   },
   {
    "ko": "어려운 문법은 예문을 만들어 보면서 연습해요.",
    "vi": "Tôi luyện ngữ pháp khó bằng cách thử đặt câu ví dụ."
   },
   {
    "ko": "계획을 지키지 못하면 이유를 기록하고 다시 시작해요.",
    "vi": "Nếu không giữ được kế hoạch tôi ghi lại lý do rồi bắt đầu lại."
   }
  ],
  "prompt": "한 달 동안 실천할 공부 계획을 말해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=3&lesson=10",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc3-10"
 },
 {
  "id": "sc3-11",
  "level": 3,
  "number": 11,
  "title": "So sánh lựa chọn",
  "ko": "선택 비교",
  "grammar": "-보다; -(으)ㄴ/는 편이다",
  "goal": "So sánh ưu nhược điểm",
  "samples": [
   {
    "ko": "버스보다 지하철이 빠른 편이에요.",
    "vi": "Tàu điện thường nhanh hơn xe buýt."
   },
   {
    "ko": "이 식당은 가격이 저렴한 대신 사람이 많아요.",
    "vi": "Quán này giá rẻ nhưng bù lại đông người."
   },
   {
    "ko": "저는 조용한 곳에서 공부하는 편입니다.",
    "vi": "Tôi thường học ở nơi yên tĩnh."
   },
   {
    "ko": "두 가지 방법을 비교해 보고 선택하겠습니다.",
    "vi": "Tôi sẽ so sánh hai cách rồi lựa chọn."
   }
  ],
  "prompt": "한국에서 생활할 때 유용한 두 선택지를 비교해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=3&lesson=11",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc3-11"
 },
 {
  "id": "sc3-12",
  "level": 3,
  "number": 12,
  "title": "Giải thích sự thay đổi",
  "ko": "생활의 변화",
  "grammar": "-게 되다; -아/어지다",
  "goal": "Mô tả những thay đổi theo thời gian",
  "samples": [
   {
    "ko": "한국에 온 뒤로 아침에 일찍 일어나게 됐어요.",
    "vi": "Sau khi đến Hàn tôi đã quen dậy sớm."
   },
   {
    "ko": "한국어로 대화하는 일이 점점 자연스러워졌어요.",
    "vi": "Việc nói chuyện bằng tiếng Hàn ngày càng tự nhiên."
   },
   {
    "ko": "처음에는 어려웠지만 이제는 혼자 은행에 갈 수 있어요.",
    "vi": "Lúc đầu khó nhưng nay tôi có thể tự đi ngân hàng."
   },
   {
    "ko": "새로운 환경 덕분에 자신감이 많이 생겼습니다.",
    "vi": "Nhờ môi trường mới tôi tự tin hơn nhiều."
   }
  ],
  "prompt": "유학 후 달라진 생활 습관을 설명해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=3&lesson=12",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc3-12"
 },
 {
  "id": "sc3-13",
  "level": 3,
  "number": 13,
  "title": "Góp ý tại nơi làm việc",
  "ko": "직장 내 의견",
  "grammar": "-(으)면 좋겠다; -는 게 어때요",
  "goal": "Đề xuất cải thiện công việc",
  "samples": [
   {
    "ko": "주문이 많을 때는 직원이 한 명 더 있으면 좋겠어요.",
    "vi": "Khi nhiều đơn hàng thì tốt hơn nếu có thêm một nhân viên."
   },
   {
    "ko": "업무 순서를 먼저 정리하는 게 어때요?",
    "vi": "Hay là chúng ta sắp xếp thứ tự công việc trước?"
   },
   {
    "ko": "고객이 기다리지 않도록 미리 준비해야 합니다.",
    "vi": "Chúng ta nên chuẩn bị sẵn để khách không phải đợi."
   },
   {
    "ko": "제 의견을 들어 주셔서 감사합니다.",
    "vi": "Cảm ơn anh/chị đã lắng nghe ý kiến của tôi."
   }
  ],
  "prompt": "매장 일을 개선할 방법을 제안해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=3&lesson=13",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc3-13"
 },
 {
  "id": "sc3-14",
  "level": 3,
  "number": 14,
  "title": "Tin tức và thông báo",
  "ko": "안내와 뉴스",
  "grammar": "-다고 하다; -에 따르면",
  "goal": "Thuật lại nguồn thông tin",
  "samples": [
   {
    "ko": "학교 공지에 따르면 다음 주 수업 시간이 바뀐다고 해요.",
    "vi": "Theo thông báo trường, giờ học sẽ thay đổi tuần sau."
   },
   {
    "ko": "친구가 오늘부터 도서관 이용 시간이 늘어난다고 했어요.",
    "vi": "Bạn tôi nói từ hôm nay giờ mở cửa thư viện tăng lên."
   },
   {
    "ko": "정확한 내용은 공식 홈페이지에서 확인했어요.",
    "vi": "Tôi đã kiểm tra nội dung chính xác trên trang chính thức."
   },
   {
    "ko": "확인되지 않은 소문은 다른 사람에게 전달하지 않아요.",
    "vi": "Tôi không truyền đi tin đồn chưa được xác minh."
   }
  ],
  "prompt": "학교 공지를 친구에게 전달해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=3&lesson=14",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc3-14"
 },
 {
  "id": "sc3-15",
  "level": 3,
  "number": 15,
  "title": "Thuyết trình kế hoạch cá nhân",
  "ko": "개인 계획 발표",
  "grammar": "-기 위해서; -(으)ㄹ 예정이다",
  "goal": "Trình bày kế hoạch mạch lạc",
  "samples": [
   {
    "ko": "한국어 실력을 높이기 위해서 매일 말하기를 연습하고 있습니다.",
    "vi": "Để nâng cao tiếng Hàn tôi luyện nói mỗi ngày."
   },
   {
    "ko": "우선 기본 표현을 복습한 뒤에 토론 연습을 할 예정입니다.",
    "vi": "Trước hết tôi sẽ ôn biểu đạt cơ bản rồi tập thảo luận."
   },
   {
    "ko": "한 달 후에는 스스로 발전한 점을 평가해 보겠습니다.",
    "vi": "Một tháng sau tôi sẽ tự đánh giá những tiến bộ."
   },
   {
    "ko": "작은 목표를 꾸준히 실천하는 것이 가장 중요하다고 생각합니다.",
    "vi": "Tôi cho rằng kiên trì thực hiện mục tiêu nhỏ là quan trọng nhất."
   }
  ],
  "prompt": "앞으로의 한국어 학습 계획을 1분 발표해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=3&lesson=15",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc3-15"
 },
 {
  "id": "sc4-01",
  "level": 4,
  "number": 1,
  "title": "Giải quyết yêu cầu khách",
  "ko": "고객 요청 대응",
  "grammar": "-(으)ㄹ 경우; -도록",
  "goal": "Đề xuất phương án xử lý chuyên nghiệp",
  "samples": [
   {
    "ko": "주문이 잘못 들어간 경우에는 먼저 고객에게 사과해야 합니다.",
    "vi": "Nếu đơn bị nhập sai, trước tiên phải xin lỗi khách."
   },
   {
    "ko": "같은 문제가 반복되지 않도록 주문 내용을 다시 확인하겠습니다.",
    "vi": "Tôi sẽ xác nhận lại đơn để lỗi không lặp lại."
   },
   {
    "ko": "고객의 요청을 충분히 듣고 가능한 해결책을 제시하겠습니다.",
    "vi": "Tôi sẽ lắng nghe kỹ yêu cầu và đề xuất giải pháp có thể."
   },
   {
    "ko": "추가 비용이 발생한다면 결제 전에 안내드리겠습니다.",
    "vi": "Nếu có chi phí bổ sung tôi sẽ báo trước khi thanh toán."
   }
  ],
  "prompt": "불만이 있는 손님에게 해결 방안을 제시해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=4&lesson=1",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc4-01"
 },
 {
  "id": "sc4-02",
  "level": 4,
  "number": 2,
  "title": "Họp nhóm và phân công",
  "ko": "팀 회의와 역할 분담",
  "grammar": "-기로 하다; -는 데에",
  "goal": "Phân công và xác nhận tiến độ",
  "samples": [
   {
    "ko": "이번 프로젝트에서는 제가 자료 조사를 맡기로 했습니다.",
    "vi": "Trong dự án này tôi nhận phụ trách nghiên cứu tài liệu."
   },
   {
    "ko": "결과를 정리하는 데에 예상보다 많은 시간이 필요합니다.",
    "vi": "Việc tổng hợp kết quả cần nhiều thời gian hơn dự kiến."
   },
   {
    "ko": "서로의 역할을 명확히 하면 업무가 더 효율적입니다.",
    "vi": "Nếu phân vai rõ ràng công việc sẽ hiệu quả hơn."
   },
   {
    "ko": "다음 회의 전까지 초안을 공유하겠습니다.",
    "vi": "Tôi sẽ chia sẻ bản nháp trước cuộc họp tới."
   }
  ],
  "prompt": "팀원들에게 업무 일정을 보고해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=4&lesson=2",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc4-02"
 },
 {
  "id": "sc4-03",
  "level": 4,
  "number": 3,
  "title": "Thuyết phục bằng lý do",
  "ko": "근거를 들어 설득하기",
  "grammar": "-기 마련이다; -(으)므로",
  "goal": "Nêu quan điểm có dẫn chứng",
  "samples": [
   {
    "ko": "새로운 제도를 도입하면 처음에는 혼란이 생기기 마련입니다.",
    "vi": "Khi áp dụng chế độ mới ban đầu thường có xáo trộn."
   },
   {
    "ko": "장기적인 효과가 더 크므로 시범 운영을 제안합니다.",
    "vi": "Vì lợi ích dài hạn lớn hơn nên tôi đề xuất thí điểm."
   },
   {
    "ko": "비용뿐 아니라 직원의 만족도도 고려해야 합니다.",
    "vi": "Cần cân nhắc cả mức hài lòng nhân viên chứ không chỉ chi phí."
   },
   {
    "ko": "실제 사례를 바탕으로 제 의견을 설명하겠습니다.",
    "vi": "Tôi sẽ giải thích quan điểm dựa trên ví dụ thực tế."
   }
  ],
  "prompt": "한 가지 개선안을 이유와 함께 제안해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=4&lesson=3",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc4-03"
 },
 {
  "id": "sc4-04",
  "level": 4,
  "number": 4,
  "title": "Nhận xét dịch vụ",
  "ko": "서비스 평가",
  "grammar": "-에 비해; -는 반면",
  "goal": "Nhận xét ưu nhược điểm cân bằng",
  "samples": [
   {
    "ko": "이 서비스는 가격에 비해 품질이 좋은 편입니다.",
    "vi": "Dịch vụ này có chất lượng khá tốt so với giá."
   },
   {
    "ko": "예약 과정은 편리한 반면 고객 상담은 다소 느립니다.",
    "vi": "Quy trình đặt lịch thuận tiện nhưng tư vấn khách hơi chậm."
   },
   {
    "ko": "이용자의 의견을 정기적으로 조사할 필요가 있습니다.",
    "vi": "Cần khảo sát ý kiến người dùng định kỳ."
   },
   {
    "ko": "개선할 부분을 구체적으로 정리해 전달하겠습니다.",
    "vi": "Tôi sẽ tổng hợp cụ thể điểm cần cải thiện để gửi."
   }
  ],
  "prompt": "자주 이용하는 서비스를 평가해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=4&lesson=4",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc4-04"
 },
 {
  "id": "sc4-05",
  "level": 4,
  "number": 5,
  "title": "Giải quyết bất đồng",
  "ko": "의견 충돌 해결",
  "grammar": "-더라도; -는 대신",
  "goal": "Hòa giải và thương lượng",
  "samples": [
   {
    "ko": "서로 생각이 다르더라도 끝까지 존중해야 합니다.",
    "vi": "Dù suy nghĩ khác nhau cũng phải tôn trọng nhau đến cùng."
   },
   {
    "ko": "바로 결론을 내리는 대신 서로의 이유부터 들어 봅시다.",
    "vi": "Thay vì kết luận ngay, hãy nghe lý do hai bên trước."
   },
   {
    "ko": "공통된 목표를 확인하면 타협점을 찾기가 쉬워집니다.",
    "vi": "Nếu xác nhận mục tiêu chung sẽ dễ tìm điểm thỏa hiệp."
   },
   {
    "ko": "상대방의 말을 끝까지 듣고 차분하게 답하겠습니다.",
    "vi": "Tôi sẽ nghe hết lời đối phương và trả lời bình tĩnh."
   }
  ],
  "prompt": "동료와 의견이 다를 때 해결 과정을 말해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=4&lesson=5",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc4-05"
 },
 {
  "id": "sc4-06",
  "level": 4,
  "number": 6,
  "title": "Văn hóa công sở",
  "ko": "직장 문화",
  "grammar": "-에 따라; -는 편이다",
  "goal": "Giải thích khác biệt văn hóa",
  "samples": [
   {
    "ko": "회사에 따라 회의 문화와 의사소통 방식이 다를 수 있습니다.",
    "vi": "Tùy công ty, văn hóa họp và giao tiếp có thể khác."
   },
   {
    "ko": "한국에서는 직급에 따라 사용하는 표현이 달라지는 편입니다.",
    "vi": "Ở Hàn cách nói thường thay đổi theo chức vụ."
   },
   {
    "ko": "상대방에게 불편함을 주지 않도록 예의를 지키겠습니다.",
    "vi": "Tôi sẽ giữ phép lịch sự để không gây khó chịu cho người khác."
   },
   {
    "ko": "모르는 관습이 있다면 먼저 질문하는 것이 좋습니다.",
    "vi": "Nếu có tập quán chưa biết nên hỏi trước."
   }
  ],
  "prompt": "베트남과 한국의 직장 문화를 비교해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=4&lesson=6",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc4-06"
 },
 {
  "id": "sc4-07",
  "level": 4,
  "number": 7,
  "title": "Ứng phó sự cố công việc",
  "ko": "업무 문제 보고",
  "grammar": "-는 즉시; -아/어 놓다",
  "goal": "Báo cáo sự cố đúng quy trình",
  "samples": [
   {
    "ko": "문제가 발생하는 즉시 담당자에게 보고하겠습니다.",
    "vi": "Ngay khi sự cố xảy ra tôi sẽ báo người phụ trách."
   },
   {
    "ko": "고객에게 설명할 내용을 미리 정리해 놓았습니다.",
    "vi": "Tôi đã chuẩn bị trước nội dung giải thích cho khách."
   },
   {
    "ko": "원인을 파악하기 전에는 추측을 사실처럼 말하지 않겠습니다.",
    "vi": "Trước khi xác định nguyên nhân tôi không nói suy đoán như sự thật."
   },
   {
    "ko": "처리 결과를 문서로 남겨 다시 확인할 수 있게 하겠습니다.",
    "vi": "Tôi sẽ lưu kết quả xử lý thành văn bản để kiểm tra lại."
   }
  ],
  "prompt": "매장에서 발생한 문제를 관리자에게 보고해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=4&lesson=7",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc4-07"
 },
 {
  "id": "sc4-08",
  "level": 4,
  "number": 8,
  "title": "Sức khỏe tinh thần",
  "ko": "정신 건강과 휴식",
  "grammar": "-는 동안; -고 나면",
  "goal": "Diễn giải cách cân bằng thời gian",
  "samples": [
   {
    "ko": "시험을 준비하는 동안 스트레스를 적절히 관리해야 합니다.",
    "vi": "Trong thời gian ôn thi cần quản lý căng thẳng phù hợp."
   },
   {
    "ko": "잠깐 산책하고 나면 집중력이 좋아지는 것 같습니다.",
    "vi": "Sau khi đi dạo một chút tôi thấy tập trung tốt hơn."
   },
   {
    "ko": "무리한 계획보다 실천 가능한 습관이 오래 유지됩니다.",
    "vi": "Thói quen khả thi duy trì lâu hơn kế hoạch quá sức."
   },
   {
    "ko": "힘들 때는 혼자 참지 말고 주변에 도움을 요청하세요.",
    "vi": "Khi khó khăn hãy nhờ hỗ trợ thay vì chịu một mình."
   }
  ],
  "prompt": "자신에게 맞는 스트레스 관리법을 설명해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=4&lesson=8",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc4-08"
 },
 {
  "id": "sc4-09",
  "level": 4,
  "number": 9,
  "title": "Bảo vệ môi trường",
  "ko": "환경 보호 실천",
  "grammar": "-(으)ㄹ수록; -아/어야 한다",
  "goal": "Trình bày hành động có ích",
  "samples": [
   {
    "ko": "일회용품을 줄일수록 쓰레기 배출량도 감소합니다.",
    "vi": "Càng giảm đồ dùng một lần lượng rác càng giảm."
   },
   {
    "ko": "환경 보호는 개인뿐 아니라 기업도 함께 참여해야 합니다.",
    "vi": "Không chỉ cá nhân mà doanh nghiệp cũng cần tham gia bảo vệ môi trường."
   },
   {
    "ko": "작은 실천이 모이면 사회적인 변화를 만들 수 있습니다.",
    "vi": "Hành động nhỏ tích lũy có thể tạo ra thay đổi xã hội."
   },
   {
    "ko": "분리배출 방법을 모를 때는 지침을 확인하는 습관이 필요합니다.",
    "vi": "Khi chưa biết cách phân loại rác cần thói quen xem hướng dẫn."
   }
  ],
  "prompt": "학교에서 실천할 환경 보호 활동을 제안해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=4&lesson=9",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc4-09"
 },
 {
  "id": "sc4-10",
  "level": 4,
  "number": 10,
  "title": "Ứng xử trên mạng",
  "ko": "온라인 의사소통",
  "grammar": "-는 듯하다; -아/어서는 안 되다",
  "goal": "Thảo luận văn hóa trực tuyến",
  "samples": [
   {
    "ko": "짧은 메시지는 감정을 정확하게 전달하지 못하는 듯합니다.",
    "vi": "Tin nhắn ngắn dường như không truyền tải chính xác cảm xúc."
   },
   {
    "ko": "확인되지 않은 개인정보를 온라인에 올려서는 안 됩니다.",
    "vi": "Không được đăng thông tin cá nhân chưa được xác nhận lên mạng."
   },
   {
    "ko": "오해가 생기면 공개적으로 다투기보다 직접 설명하는 편이 좋습니다.",
    "vi": "Khi hiểu lầm, giải thích trực tiếp tốt hơn cãi nhau công khai."
   },
   {
    "ko": "상대방의 입장을 고려해 표현을 선택하겠습니다.",
    "vi": "Tôi sẽ cân nhắc góc nhìn đối phương khi chọn cách diễn đạt."
   }
  ],
  "prompt": "온라인에서 생긴 오해를 해결하는 방법을 설명해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=4&lesson=10",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc4-10"
 },
 {
  "id": "sc4-11",
  "level": 4,
  "number": 11,
  "title": "Học qua dự án",
  "ko": "프로젝트 학습",
  "grammar": "-(으)면서; -도록 하다",
  "goal": "Miêu tả quá trình phối hợp",
  "samples": [
   {
    "ko": "자료를 수집하면서 예상하지 못한 문제를 발견했습니다.",
    "vi": "Khi thu thập dữ liệu tôi đã phát hiện vấn đề không ngờ."
   },
   {
    "ko": "조원들이 의견을 자유롭게 제시하도록 분위기를 만들었습니다.",
    "vi": "Chúng tôi tạo không khí để thành viên nêu ý kiến tự do."
   },
   {
    "ko": "진행 상황을 정기적으로 점검하면 지연을 줄일 수 있습니다.",
    "vi": "Kiểm tra tiến độ định kỳ giúp giảm chậm trễ."
   },
   {
    "ko": "이번 경험을 다음 프로젝트의 개선에 활용하겠습니다.",
    "vi": "Tôi sẽ vận dụng kinh nghiệm lần này vào dự án tiếp theo."
   }
  ],
  "prompt": "협력 프로젝트를 진행한 경험을 말해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=4&lesson=11",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc4-11"
 },
 {
  "id": "sc4-12",
  "level": 4,
  "number": 12,
  "title": "Xu hướng tiêu dùng",
  "ko": "소비 경향 분석",
  "grammar": "-에 따르면; -는 경향이 있다",
  "goal": "Tóm tắt xu hướng có căn cứ",
  "samples": [
   {
    "ko": "최근 조사에 따르면 온라인 구매가 증가하는 경향이 있습니다.",
    "vi": "Theo khảo sát gần đây, mua sắm online có xu hướng tăng."
   },
   {
    "ko": "소비자들은 가격뿐 아니라 배송 속도도 중요하게 생각합니다.",
    "vi": "Người tiêu dùng coi trọng không chỉ giá mà cả tốc độ giao hàng."
   },
   {
    "ko": "다만 모든 연령층에서 같은 결과가 나타나지는 않습니다.",
    "vi": "Tuy nhiên không phải nhóm tuổi nào cũng có kết quả giống nhau."
   },
   {
    "ko": "자료를 비교할 때는 조사 방법과 표본도 확인해야 합니다.",
    "vi": "Khi so sánh dữ liệu cần xem cả phương pháp và mẫu khảo sát."
   }
  ],
  "prompt": "소비 습관 변화를 근거와 함께 설명해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=4&lesson=12",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc4-12"
 },
 {
  "id": "sc4-13",
  "level": 4,
  "number": 13,
  "title": "Giải thích quy trình",
  "ko": "절차 설명",
  "grammar": "-에 앞서; -고 나서",
  "goal": "Hướng dẫn quy trình nhiều bước",
  "samples": [
   {
    "ko": "신청서를 제출하기에 앞서 필요한 서류를 확인하세요.",
    "vi": "Trước khi nộp đơn hãy kiểm tra giấy tờ cần thiết."
   },
   {
    "ko": "모든 정보를 입력하고 나서 내용을 다시 검토합니다.",
    "vi": "Sau khi nhập tất cả thông tin hãy rà soát lại."
   },
   {
    "ko": "승인이 완료되면 담당자에게 결과를 알려 주세요.",
    "vi": "Khi phê duyệt hoàn tất hãy thông báo cho người phụ trách."
   },
   {
    "ko": "과정 중에 문제가 생기면 즉시 지원 센터에 문의하세요.",
    "vi": "Nếu có vấn đề trong quá trình hãy hỏi trung tâm hỗ trợ ngay."
   }
  ],
  "prompt": "신청 절차를 처음 이용하는 사람에게 안내해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=4&lesson=13",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc4-13"
 },
 {
  "id": "sc4-14",
  "level": 4,
  "number": 14,
  "title": "Tóm tắt và báo cáo",
  "ko": "요약 보고",
  "grammar": "-을/를 중심으로; -다고 볼 수 있다",
  "goal": "Tóm tắt một sự kiện có kết luận",
  "samples": [
   {
    "ko": "이번 발표는 조사 결과를 중심으로 정리했습니다.",
    "vi": "Bài trình bày này tập trung tổng hợp kết quả khảo sát."
   },
   {
    "ko": "응답자의 절반 이상이 변화에 긍정적이었다고 볼 수 있습니다.",
    "vi": "Có thể thấy hơn một nửa người trả lời đánh giá tích cực về thay đổi."
   },
   {
    "ko": "하지만 몇 가지 한계가 있으므로 해석에 주의해야 합니다.",
    "vi": "Tuy nhiên có vài hạn chế nên cần thận trọng khi diễn giải."
   },
   {
    "ko": "마지막으로 개선 방향을 세 가지로 나누어 제안하겠습니다.",
    "vi": "Cuối cùng tôi đề xuất hướng cải tiến theo ba phần."
   }
  ],
  "prompt": "읽은 기사 하나를 1분 안에 요약해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=4&lesson=14",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc4-14"
 },
 {
  "id": "sc4-15",
  "level": 4,
  "number": 15,
  "title": "Thuyết trình tổng hợp",
  "ko": "종합 발표",
  "grammar": "-는 반면; -기 위해",
  "goal": "Trình bày lập luận mạch lạc",
  "samples": [
   {
    "ko": "저는 오늘 청년의 시간 관리에 대해 말씀드리겠습니다.",
    "vi": "Hôm nay tôi xin trình bày về quản lý thời gian của người trẻ."
   },
   {
    "ko": "기술은 효율을 높이는 반면 새로운 부담을 만들기도 합니다.",
    "vi": "Công nghệ tăng hiệu suất nhưng cũng tạo gánh nặng mới."
   },
   {
    "ko": "균형을 유지하기 위해 개인과 조직의 노력이 모두 필요합니다.",
    "vi": "Để giữ cân bằng cần nỗ lực cả cá nhân lẫn tổ chức."
   },
   {
    "ko": "이러한 이유로 실천 가능한 계획부터 시작할 것을 제안합니다.",
    "vi": "Vì vậy tôi đề xuất bắt đầu từ kế hoạch có thể thực hiện."
   }
  ],
  "prompt": "주제를 정해 도입, 근거, 결론 순서로 발표해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=4&lesson=15",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc4-15"
 },
 {
  "id": "sc5-01",
  "level": 5,
  "number": 1,
  "title": "Tranh luận giáo dục số",
  "ko": "디지털 교육 토론",
  "grammar": "-다는 점에서; -지 않을 수 없다",
  "goal": "Lập luận cân bằng về đổi mới giáo dục",
  "samples": [
   {
    "ko": "온라인 교육은 접근성을 높인다는 점에서 긍정적으로 평가할 수 있습니다.",
    "vi": "Giáo dục trực tuyến tích cực ở khía cạnh tăng khả năng tiếp cận."
   },
   {
    "ko": "그러나 학습 격차가 확대될 가능성을 무시할 수는 없습니다.",
    "vi": "Tuy nhiên không thể bỏ qua khả năng khoảng cách học tập tăng lên."
   },
   {
    "ko": "기술 도입의 효과를 판단하려면 장기적인 자료가 필요합니다.",
    "vi": "Muốn đánh giá hiệu quả áp dụng công nghệ cần dữ liệu dài hạn."
   },
   {
    "ko": "따라서 효율성과 형평성을 함께 고려한 정책이 바람직합니다.",
    "vi": "Vì vậy chính sách cân nhắc cả hiệu quả và công bằng là phù hợp."
   }
  ],
  "prompt": "디지털 교육의 장단점을 근거와 함께 토론해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=5&lesson=1",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc5-01"
 },
 {
  "id": "sc5-02",
  "level": 5,
  "number": 2,
  "title": "Xác minh thông tin",
  "ko": "정보의 신뢰성",
  "grammar": "-에 불과하다; -다는 사실",
  "goal": "Đánh giá độ tin cậy của nguồn",
  "samples": [
   {
    "ko": "조회 수가 많다는 사실만으로 정보의 정확성을 보장할 수는 없습니다.",
    "vi": "Nhiều lượt xem không đảm bảo tính chính xác của thông tin."
   },
   {
    "ko": "일부 사례는 전체 현상을 보여 주는 자료에 불과할 수 있습니다.",
    "vi": "Một số ví dụ có thể chỉ là tư liệu không phản ánh toàn bộ hiện tượng."
   },
   {
    "ko": "주장의 근거와 조사 방식을 동시에 검토해야 합니다.",
    "vi": "Cần đánh giá đồng thời bằng chứng và phương pháp khảo sát."
   },
   {
    "ko": "출처가 불분명한 정보는 공유하기 전에 재확인하겠습니다.",
    "vi": "Tôi sẽ kiểm tra lại thông tin không rõ nguồn trước khi chia sẻ."
   }
  ],
  "prompt": "온라인 기사 한 편의 신뢰도를 평가해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=5&lesson=2",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc5-02"
 },
 {
  "id": "sc5-03",
  "level": 5,
  "number": 3,
  "title": "Quyền lợi lao động",
  "ko": "노동 권익",
  "grammar": "-도록 보장하다; -는 한",
  "goal": "Đề xuất cải thiện điều kiện làm việc",
  "samples": [
   {
    "ko": "근로자가 충분히 휴식할 수 있도록 제도적으로 보장해야 합니다.",
    "vi": "Cần bảo đảm bằng thể chế để người lao động được nghỉ đầy đủ."
   },
   {
    "ko": "계약 내용이 명확하지 않은 한 분쟁이 반복될 수 있습니다.",
    "vi": "Nếu hợp đồng không rõ, tranh chấp có thể lặp lại."
   },
   {
    "ko": "합리적인 기준은 사업주와 근로자 모두에게 도움이 됩니다.",
    "vi": "Tiêu chuẩn hợp lý có lợi cho cả chủ và người lao động."
   },
   {
    "ko": "구체적인 사례를 토대로 실현 가능한 대안을 제시하겠습니다.",
    "vi": "Tôi sẽ đưa ra phương án khả thi dựa trên tình huống cụ thể."
   }
  ],
  "prompt": "공정한 근무 환경을 위한 제도를 제안해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=5&lesson=3",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc5-03"
 },
 {
  "id": "sc5-04",
  "level": 5,
  "number": 4,
  "title": "Đô thị và giao thông",
  "ko": "도시 교통 정책",
  "grammar": "-에 기여하다; -에도 불구하고",
  "goal": "Phân tích chính sách công",
  "samples": [
   {
    "ko": "대중교통 확대는 교통 혼잡 완화에 기여할 수 있습니다.",
    "vi": "Mở rộng giao thông công cộng có thể góp phần giảm ùn tắc."
   },
   {
    "ko": "예산 부족에도 불구하고 단계적인 투자가 필요합니다.",
    "vi": "Mặc dù thiếu ngân sách vẫn cần đầu tư theo giai đoạn."
   },
   {
    "ko": "정책 효과를 평가할 때 시민의 이동권도 고려해야 합니다.",
    "vi": "Khi đánh giá chính sách cần cân nhắc quyền đi lại của công dân."
   },
   {
    "ko": "장기적인 비용과 환경적 영향을 함께 비교하겠습니다.",
    "vi": "Tôi sẽ so sánh đồng thời chi phí dài hạn và tác động môi trường."
   }
  ],
  "prompt": "도시 교통 문제를 해결할 정책을 논의해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=5&lesson=4",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc5-04"
 },
 {
  "id": "sc5-05",
  "level": 5,
  "number": 5,
  "title": "Bảo tồn văn hóa",
  "ko": "문화유산 보존",
  "grammar": "-의 관점에서; -는 데 그치지 않다",
  "goal": "Đánh giá bảo tồn và phát triển",
  "samples": [
   {
    "ko": "문화유산은 관광 자원의 관점에서만 이해해서는 안 됩니다.",
    "vi": "Không nên hiểu di sản văn hóa chỉ ở góc độ tài nguyên du lịch."
   },
   {
    "ko": "보존은 건물을 유지하는 데 그치지 않고 공동체의 기억을 지키는 일입니다.",
    "vi": "Bảo tồn không dừng ở giữ công trình mà còn giữ ký ức cộng đồng."
   },
   {
    "ko": "지역 주민의 참여가 지속 가능한 관리의 핵심이라고 생각합니다.",
    "vi": "Tôi cho rằng cư dân tham gia là trọng tâm của quản lý bền vững."
   },
   {
    "ko": "전통과 현대적 활용이 조화를 이루도록 방안을 마련해야 합니다.",
    "vi": "Cần đề ra phương án hài hòa truyền thống và công dụng hiện đại."
   }
  ],
  "prompt": "문화유산 활용 방안을 비판적으로 발표해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=5&lesson=5",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc5-05"
 },
 {
  "id": "sc5-06",
  "level": 5,
  "number": 6,
  "title": "Đạo đức AI",
  "ko": "인공지능 윤리",
  "grammar": "-는 반면; -지 않도록",
  "goal": "Thảo luận trách nhiệm công nghệ",
  "samples": [
   {
    "ko": "인공지능은 작업 효율을 높이는 반면 편향을 확대할 위험도 있습니다.",
    "vi": "AI nâng hiệu suất nhưng cũng có nguy cơ khuếch đại thiên kiến."
   },
   {
    "ko": "개인정보가 무단으로 활용되지 않도록 관리 체계가 필요합니다.",
    "vi": "Cần hệ thống quản lý để dữ liệu cá nhân không bị dùng trái phép."
   },
   {
    "ko": "기술의 결정 과정을 설명할 책임이 누구에게 있는지 논의해야 합니다.",
    "vi": "Cần thảo luận ai có trách nhiệm giải thích quyết định của công nghệ."
   },
   {
    "ko": "혁신의 속도와 사회적 안전 사이에서 균형을 찾아야 합니다.",
    "vi": "Phải tìm cân bằng giữa tốc độ đổi mới và an toàn xã hội."
   }
  ],
  "prompt": "인공지능 활용에 필요한 윤리 원칙을 제시해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=5&lesson=6",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc5-06"
 },
 {
  "id": "sc5-07",
  "level": 5,
  "number": 7,
  "title": "Biến đổi khí hậu",
  "ko": "기후 변화 대응",
  "grammar": "-에 따른; -을/를 비롯한",
  "goal": "Liên kết vấn đề và giải pháp",
  "samples": [
   {
    "ko": "기후 변화에 따른 위험은 지역과 계층에 따라 다르게 나타납니다.",
    "vi": "Nguy cơ do biến đổi khí hậu khác nhau theo vùng và tầng lớp."
   },
   {
    "ko": "에너지 전환을 비롯한 다양한 정책을 동시에 추진해야 합니다.",
    "vi": "Cần đồng thời triển khai nhiều chính sách gồm chuyển đổi năng lượng."
   },
   {
    "ko": "취약한 집단의 피해를 줄이는 것이 중요한 과제입니다.",
    "vi": "Giảm thiệt hại cho nhóm dễ tổn thương là nhiệm vụ quan trọng."
   },
   {
    "ko": "정책의 성과를 측정할 지표도 명확히 설정해야 합니다.",
    "vi": "Cần xác định rõ chỉ số đo lường hiệu quả chính sách."
   }
  ],
  "prompt": "기후 위기 대응을 위한 우선 과제를 논의해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=5&lesson=7",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc5-07"
 },
 {
  "id": "sc5-08",
  "level": 5,
  "number": 8,
  "title": "Dân số già hóa",
  "ko": "고령화 사회",
  "grammar": "-에 대비하다; -을/를 둘러싸고",
  "goal": "Thuyết trình vấn đề dân số",
  "samples": [
   {
    "ko": "고령화에 대비해 의료와 돌봄 체계를 함께 개선해야 합니다.",
    "vi": "Để ứng phó già hóa cần cải thiện y tế và chăm sóc cùng lúc."
   },
   {
    "ko": "세대 간 부담 분담을 둘러싸고 다양한 의견이 제기되고 있습니다.",
    "vi": "Có nhiều ý kiến về phân chia gánh nặng giữa các thế hệ."
   },
   {
    "ko": "정책을 설계할 때 당사자의 목소리를 반영하는 것이 중요합니다.",
    "vi": "Khi thiết kế chính sách cần phản ánh tiếng nói người liên quan."
   },
   {
    "ko": "단기적인 지원과 장기적인 구조 개혁을 병행해야 합니다.",
    "vi": "Cần song hành hỗ trợ ngắn hạn và cải cách cơ cấu dài hạn."
   }
  ],
  "prompt": "고령화 사회의 문제와 대안을 설명해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=5&lesson=8",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc5-08"
 },
 {
  "id": "sc5-09",
  "level": 5,
  "number": 9,
  "title": "Tiêu dùng bền vững",
  "ko": "지속 가능한 소비",
  "grammar": "-을/를 감안하면; -뿐만 아니라",
  "goal": "Thảo luận lựa chọn tiêu dùng",
  "samples": [
   {
    "ko": "생산 과정의 환경 비용을 감안하면 가격만으로 상품을 비교하기 어렵습니다.",
    "vi": "Tính cả chi phí môi trường trong sản xuất thì khó so hàng chỉ bằng giá."
   },
   {
    "ko": "기업뿐만 아니라 소비자도 책임 있는 선택을 해야 합니다.",
    "vi": "Không chỉ doanh nghiệp mà người tiêu dùng cũng phải chọn lựa có trách nhiệm."
   },
   {
    "ko": "친환경 표시가 실제 기준을 충족하는지 검증할 필요가 있습니다.",
    "vi": "Cần xác minh nhãn thân thiện môi trường có đạt tiêu chuẩn thật không."
   },
   {
    "ko": "정보 공개가 확대되면 소비자의 판단도 합리적일 수 있습니다.",
    "vi": "Minh bạch thông tin hơn sẽ giúp quyết định tiêu dùng hợp lý hơn."
   }
  ],
  "prompt": "지속 가능한 소비를 확대할 방안을 발표해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=5&lesson=9",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc5-09"
 },
 {
  "id": "sc5-10",
  "level": 5,
  "number": 10,
  "title": "Tranh luận với số liệu",
  "ko": "자료 기반 토론",
  "grammar": "-에서 알 수 있듯이; -다고 단정하다",
  "goal": "Lập luận không suy diễn quá mức",
  "samples": [
   {
    "ko": "이 그래프에서 알 수 있듯이 최근 이용률이 꾸준히 높아졌습니다.",
    "vi": "Như có thể thấy từ biểu đồ, tỷ lệ sử dụng gần đây tăng đều."
   },
   {
    "ko": "하지만 한 가지 수치만으로 원인을 단정해서는 안 됩니다.",
    "vi": "Tuy nhiên không được kết luận nguyên nhân chỉ từ một chỉ số."
   },
   {
    "ko": "대상 집단의 특성을 고려하면 다른 해석도 가능합니다.",
    "vi": "Xét đặc điểm nhóm đối tượng có thể có cách diễn giải khác."
   },
   {
    "ko": "추가 자료를 확보한 뒤에 결론을 수정할 수 있습니다.",
    "vi": "Có thể sửa kết luận sau khi có thêm dữ liệu."
   }
  ],
  "prompt": "그래프를 해석하고 한계를 함께 설명해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=5&lesson=10",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc5-10"
 },
 {
  "id": "sc5-11",
  "level": 5,
  "number": 11,
  "title": "Đàm phán và nhượng bộ",
  "ko": "협상과 양보",
  "grammar": "-을/를 전제로; -는 대신",
  "goal": "Tìm phương án thỏa thuận",
  "samples": [
   {
    "ko": "상호 신뢰를 전제로 할 때 협상이 원활하게 진행될 수 있습니다.",
    "vi": "Đàm phán thuận lợi khi đặt trên nền tảng tin cậy lẫn nhau."
   },
   {
    "ko": "일정을 연장하는 대신 품질 기준을 유지하는 방안을 제안합니다.",
    "vi": "Tôi đề nghị gia hạn tiến độ thay vì hạ tiêu chuẩn chất lượng."
   },
   {
    "ko": "일방적인 요구보다 공동의 이익을 확인하는 것이 중요합니다.",
    "vi": "Xác nhận lợi ích chung quan trọng hơn yêu cầu một chiều."
   },
   {
    "ko": "합의한 내용은 오해가 없도록 문서로 남기겠습니다.",
    "vi": "Tôi sẽ ghi lại thỏa thuận để tránh hiểu lầm."
   }
  ],
  "prompt": "근무 조건을 둘러싼 협상 상황을 연습해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=5&lesson=11",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc5-11"
 },
 {
  "id": "sc5-12",
  "level": 5,
  "number": 12,
  "title": "Chính sách giáo dục",
  "ko": "교육 정책 비교",
  "grammar": "-에 비추어 볼 때; -라는 점에서",
  "goal": "Đưa ra đánh giá chính sách",
  "samples": [
   {
    "ko": "학습 성과에 비추어 볼 때 제도의 장단점을 다시 검토할 필요가 있습니다.",
    "vi": "Xét kết quả học tập cần xem lại ưu nhược của chế độ."
   },
   {
    "ko": "교육 기회의 균등이라는 점에서 지역 간 격차를 줄여야 합니다.",
    "vi": "Ở góc độ bình đẳng giáo dục cần giảm chênh lệch vùng miền."
   },
   {
    "ko": "교사의 업무 부담도 제도 평가의 중요한 기준입니다.",
    "vi": "Gánh nặng công việc giáo viên cũng là tiêu chí quan trọng."
   },
   {
    "ko": "실행 가능성과 공정성을 함께 반영한 대안을 제시하겠습니다.",
    "vi": "Tôi đề xuất giải pháp phản ánh cả tính khả thi và công bằng."
   }
  ],
  "prompt": "두 교육 정책의 효과를 비교해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=5&lesson=12",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc5-12"
 },
 {
  "id": "sc5-13",
  "level": 5,
  "number": 13,
  "title": "Bài trình bày học thuật",
  "ko": "학술 발표 구성",
  "grammar": "-에 관한; -을/를 바탕으로",
  "goal": "Thiết kế bài nói học thuật",
  "samples": [
   {
    "ko": "오늘은 외국인 유학생의 적응 경험에 관한 연구를 소개하겠습니다.",
    "vi": "Hôm nay tôi giới thiệu nghiên cứu về trải nghiệm thích nghi của du học sinh."
   },
   {
    "ko": "설문 결과를 바탕으로 주요 요인을 세 가지로 정리했습니다.",
    "vi": "Dựa vào khảo sát tôi tổng hợp ba yếu tố chính."
   },
   {
    "ko": "연구 대상이 제한적이라는 점은 한계로 남아 있습니다.",
    "vi": "Giới hạn đối tượng nghiên cứu vẫn là một hạn chế."
   },
   {
    "ko": "끝으로 후속 연구의 방향을 제안하겠습니다.",
    "vi": "Cuối cùng tôi đề xuất hướng nghiên cứu tiếp theo."
   }
  ],
  "prompt": "연구 발표의 서론과 결론을 연습해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=5&lesson=13",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc5-13"
 },
 {
  "id": "sc5-14",
  "level": 5,
  "number": 14,
  "title": "Phản biện lập luận",
  "ko": "논리적 반박",
  "grammar": "-다고 보기 어렵다; -라는 근거",
  "goal": "Phản bác có cơ sở",
  "samples": [
   {
    "ko": "제시된 자료만으로 그 주장이 타당하다고 보기는 어렵습니다.",
    "vi": "Chỉ với số liệu nêu ra khó cho rằng lập luận đó thỏa đáng."
   },
   {
    "ko": "일부 사례만 있다는 근거로 전체를 일반화할 수는 없습니다.",
    "vi": "Không thể khái quát toàn thể chỉ từ vài trường hợp."
   },
   {
    "ko": "상대방의 문제 제기를 인정하면서도 다른 설명을 제시할 수 있습니다.",
    "vi": "Có thể thừa nhận vấn đề đối phương nêu mà vẫn đưa ra giải thích khác."
   },
   {
    "ko": "논쟁에서는 표현의 강도보다 근거의 정확성이 더 중요합니다.",
    "vi": "Trong tranh luận, độ chính xác bằng chứng quan trọng hơn lời lẽ mạnh."
   }
  ],
  "prompt": "상대 의견을 예의 있게 반박해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=5&lesson=14",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc5-14"
 },
 {
  "id": "sc5-15",
  "level": 5,
  "number": 15,
  "title": "Diễn thuyết về thay đổi xã hội",
  "ko": "사회 변화 발표",
  "grammar": "-를 계기로; -도록 하다",
  "goal": "Thuyết trình quan điểm nhiều chiều",
  "samples": [
   {
    "ko": "이번 경험을 계기로 사회 변화의 원인을 다시 생각하게 되었습니다.",
    "vi": "Nhờ trải nghiệm này tôi suy ngẫm lại nguyên nhân thay đổi xã hội."
   },
   {
    "ko": "다양한 세대의 관점이 논의에 반영되도록 해야 합니다.",
    "vi": "Cần phản ánh góc nhìn các thế hệ khác nhau vào thảo luận."
   },
   {
    "ko": "변화가 모두에게 같은 기회를 제공하는 것은 아닙니다.",
    "vi": "Thay đổi không mang lại cơ hội như nhau cho mọi người."
   },
   {
    "ko": "공동체의 신뢰를 높이는 방향으로 정책을 설계해야 합니다.",
    "vi": "Nên thiết kế chính sách hướng đến tăng niềm tin cộng đồng."
   }
  ],
  "prompt": "사회 문제 한 가지를 선정해 발표해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=5&lesson=15",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc5-15"
 },
 {
  "id": "sc6-01",
  "level": 6,
  "number": 1,
  "title": "Bảo vệ đề cương nghiên cứu",
  "ko": "연구 계획 방어",
  "grammar": "-에 입각하여; -는 데 목적이 있다",
  "goal": "Bảo vệ mục tiêu và phương pháp",
  "samples": [
   {
    "ko": "본 연구는 장기적인 관찰 결과에 입각하여 가설을 검토하는 데 목적이 있습니다.",
    "vi": "Nghiên cứu này nhằm kiểm tra giả thuyết dựa trên quan sát dài hạn."
   },
   {
    "ko": "선행 연구와 비교해 분석 틀을 확장했다는 점에서 의의가 있습니다.",
    "vi": "Ý nghĩa ở việc mở rộng khung phân tích so với nghiên cứu trước."
   },
   {
    "ko": "표본의 대표성에 관한 우려를 고려해 추가 검증을 실시하겠습니다.",
    "vi": "Tôi sẽ kiểm chứng thêm xét lo ngại về tính đại diện của mẫu."
   },
   {
    "ko": "결론을 일반화하는 과정에서는 연구의 한계를 명확히 밝히겠습니다.",
    "vi": "Khi khái quát kết luận tôi sẽ nêu rõ giới hạn nghiên cứu."
   }
  ],
  "prompt": "연구 방법을 선택한 이유를 논리적으로 방어해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=6&lesson=1",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc6-01"
 },
 {
  "id": "sc6-02",
  "level": 6,
  "number": 2,
  "title": "Phân tích chính sách sâu",
  "ko": "정책 영향 분석",
  "grammar": "-에 비추어; -과/와 맞물리다",
  "goal": "Đánh giá hệ quả đa chiều",
  "samples": [
   {
    "ko": "정책의 효과는 경제적 지표뿐 아니라 사회적 신뢰에 비추어 평가해야 합니다.",
    "vi": "Hiệu quả chính sách cần đánh giá theo cả niềm tin xã hội chứ không chỉ chỉ số kinh tế."
   },
   {
    "ko": "제도 변화는 기존의 이해관계와 맞물리면서 예상하지 못한 결과를 낳기도 합니다.",
    "vi": "Thay đổi thể chế tương tác lợi ích sẵn có và có thể tạo hệ quả ngoài dự kiến."
   },
   {
    "ko": "수혜 집단과 부담 집단을 구분하면 분배 효과를 더 정확히 이해할 수 있습니다.",
    "vi": "Phân tách nhóm hưởng lợi và chịu gánh nặng giúp hiểu hiệu ứng phân phối chính xác hơn."
   },
   {
    "ko": "평가 결과에 따라 보완 정책을 유연하게 조정할 필요가 있습니다.",
    "vi": "Cần linh hoạt điều chỉnh chính sách bổ trợ theo kết quả đánh giá."
   }
  ],
  "prompt": "정책의 의도와 실제 결과 사이의 차이를 분석해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=6&lesson=2",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc6-02"
 },
 {
  "id": "sc6-03",
  "level": 6,
  "number": 3,
  "title": "Hòa giải đa văn hóa",
  "ko": "문화 간 갈등 중재",
  "grammar": "-을/를 매개로; -을/를 존중하되",
  "goal": "Đàm phán giữa các hệ giá trị",
  "samples": [
   {
    "ko": "갈등을 중재할 때는 공동의 목표를 매개로 대화를 시작하는 것이 효과적입니다.",
    "vi": "Khi hòa giải, mở đầu đối thoại qua mục tiêu chung là hiệu quả."
   },
   {
    "ko": "각자의 문화적 배경을 존중하되 책임 소재는 분명히 해야 합니다.",
    "vi": "Tôn trọng nền văn hóa mỗi bên nhưng cần làm rõ trách nhiệm."
   },
   {
    "ko": "오해의 원인을 개인의 태도만으로 환원해서는 안 됩니다.",
    "vi": "Không nên quy nguyên nhân hiểu lầm chỉ về thái độ cá nhân."
   },
   {
    "ko": "지속적인 협의를 통해 모두가 수용할 수 있는 원칙을 마련하겠습니다.",
    "vi": "Qua thảo luận liên tục sẽ xây dựng nguyên tắc các bên chấp nhận."
   }
  ],
  "prompt": "두 문화권 사이의 오해를 조정하는 발언을 해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=6&lesson=3",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc6-03"
 },
 {
  "id": "sc6-04",
  "level": 6,
  "number": 4,
  "title": "Đọc phê phán số liệu",
  "ko": "비판적 자료 해석",
  "grammar": "-라고 해서; -을/를 뒷받침하다",
  "goal": "Phát hiện giới hạn suy luận",
  "samples": [
   {
    "ko": "두 변수가 함께 변한다고 해서 직접적인 인과관계가 성립하는 것은 아닙니다.",
    "vi": "Hai biến cùng thay đổi không có nghĩa tồn tại quan hệ nhân quả trực tiếp."
   },
   {
    "ko": "추가 분석이 주장을 뒷받침하는지 확인할 필요가 있습니다.",
    "vi": "Cần xem phân tích bổ sung có ủng hộ luận điểm không."
   },
   {
    "ko": "자료가 수집된 맥락을 무시하면 해석이 왜곡될 수 있습니다.",
    "vi": "Bỏ qua bối cảnh thu thập dữ liệu có thể làm sai lệch diễn giải."
   },
   {
    "ko": "불확실성을 인정하는 태도가 오히려 논의의 신뢰성을 높입니다.",
    "vi": "Thừa nhận bất định lại nâng độ tin cậy thảo luận."
   }
  ],
  "prompt": "통계 해석에서 주의할 오류를 설명해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=6&lesson=4",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc6-04"
 },
 {
  "id": "sc6-05",
  "level": 6,
  "number": 5,
  "title": "Thương lượng phức hợp",
  "ko": "복합적 이해관계 협상",
  "grammar": "-을/를 조건으로; -을/를 감수하다",
  "goal": "Thuyết phục nhiều bên",
  "samples": [
   {
    "ko": "일정 조정을 조건으로 추가 자원을 제공하는 방안을 검토할 수 있습니다.",
    "vi": "Có thể cân nhắc hỗ trợ nguồn lực thêm với điều kiện điều chỉnh lịch."
   },
   {
    "ko": "단기적인 손실을 감수하더라도 장기적 신뢰를 지키는 것이 중요합니다.",
    "vi": "Dù chịu tổn thất ngắn hạn, giữ niềm tin dài hạn vẫn quan trọng."
   },
   {
    "ko": "각 이해관계자의 우선순위를 파악해야 현실적인 합의가 가능합니다.",
    "vi": "Phải hiểu ưu tiên của các bên mới có thỏa thuận khả thi."
   },
   {
    "ko": "합의 이후의 점검 절차까지 구체적으로 명시하겠습니다.",
    "vi": "Tôi sẽ nêu cụ thể cả quy trình theo dõi sau thỏa thuận."
   }
  ],
  "prompt": "세 이해관계자가 있는 협상안을 제시해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=6&lesson=5",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc6-05"
 },
 {
  "id": "sc6-06",
  "level": 6,
  "number": 6,
  "title": "Phân tích ngụy biện",
  "ko": "논증의 오류 분석",
  "grammar": "-에 지나지 않다; -을/를 혼동하다",
  "goal": "Chỉ ra sai lệch lập luận",
  "samples": [
   {
    "ko": "개별 사례를 전체의 경향으로 해석하는 것은 성급한 일반화에 지나지 않습니다.",
    "vi": "Diễn giải một trường hợp thành xu hướng chung chỉ là khái quát vội."
   },
   {
    "ko": "상관관계와 인과관계를 혼동하면 잘못된 결론에 도달하기 쉽습니다.",
    "vi": "Nhầm tương quan và nhân quả dễ đưa tới kết luận sai."
   },
   {
    "ko": "상대 주장의 의도를 추측하기보다 논리 구조를 검토해야 합니다.",
    "vi": "Nên xem cấu trúc logic thay vì đoán ý đồ bên kia."
   },
   {
    "ko": "반론을 제시할 때는 대안적인 설명도 함께 제안하겠습니다.",
    "vi": "Khi phản biện tôi cũng sẽ đề xuất giải thích thay thế."
   }
  ],
  "prompt": "토론에서 나타나는 논리 오류를 예로 들어 설명해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=6&lesson=6",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc6-06"
 },
 {
  "id": "sc6-07",
  "level": 6,
  "number": 7,
  "title": "Đạo đức nghiên cứu",
  "ko": "연구 윤리와 책임",
  "grammar": "-를 명분으로; -을/를 전제하다",
  "goal": "Trình bày quyết định đạo đức",
  "samples": [
   {
    "ko": "연구 성과를 명분으로 참여자의 동의를 생략해서는 안 됩니다.",
    "vi": "Không được bỏ qua đồng ý của người tham gia lấy cớ vì kết quả nghiên cứu."
   },
   {
    "ko": "개인정보 보호를 전제하지 않은 분석은 정당성을 얻기 어렵습니다.",
    "vi": "Phân tích không đặt bảo vệ dữ liệu cá nhân làm tiền đề khó có tính chính đáng."
   },
   {
    "ko": "이해 충돌이 발생할 가능성은 사전에 공개해야 합니다.",
    "vi": "Khả năng xung đột lợi ích cần công khai trước."
   },
   {
    "ko": "윤리적 기준을 지키는 일은 연구의 신뢰성을 확보하는 과정입니다.",
    "vi": "Tuân thủ đạo đức là quá trình bảo đảm độ tin cậy nghiên cứu."
   }
  ],
  "prompt": "연구 과정의 윤리적 갈등을 해결하는 원칙을 발표해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=6&lesson=7",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc6-07"
 },
 {
  "id": "sc6-08",
  "level": 6,
  "number": 8,
  "title": "Diễn ngôn và sắc thái",
  "ko": "담화와 뉘앙스",
  "grammar": "-기 십상이다; -고자 하다",
  "goal": "Điều chỉnh sắc thái trong bối cảnh",
  "samples": [
   {
    "ko": "직접적인 비판은 상황에 따라 관계를 악화시키기 십상입니다.",
    "vi": "Phê bình trực diện tùy tình huống dễ làm xấu quan hệ."
   },
   {
    "ko": "제 의견을 강요하기보다 공동의 이해를 넓히고자 합니다.",
    "vi": "Tôi muốn mở rộng hiểu biết chung hơn là áp đặt quan điểm."
   },
   {
    "ko": "동일한 사실도 어떤 표현을 택하느냐에 따라 다르게 받아들여집니다.",
    "vi": "Cùng một sự thật nhưng được tiếp nhận khác nhau theo cách diễn đạt."
   },
   {
    "ko": "상대의 체면을 고려하면서도 핵심 메시지는 분명하게 전달해야 합니다.",
    "vi": "Cần truyền đạt ý chính rõ ràng nhưng vẫn giữ thể diện cho đối phương."
   }
  ],
  "prompt": "같은 거절을 세 가지 높임 수준으로 표현해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=6&lesson=8",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc6-08"
 },
 {
  "id": "sc6-09",
  "level": 6,
  "number": 9,
  "title": "Xử lý khủng hoảng truyền thông",
  "ko": "위기 소통",
  "grammar": "-을/를 계기로; -에 대비하여",
  "goal": "Phát biểu trách nhiệm trước công chúng",
  "samples": [
   {
    "ko": "이번 사태를 계기로 내부 점검 체계를 전면 재검토하겠습니다.",
    "vi": "Nhân sự việc lần này chúng tôi sẽ rà soát toàn diện hệ thống kiểm tra nội bộ."
   },
   {
    "ko": "추가 피해에 대비하여 관련 정보를 투명하게 공개하겠습니다.",
    "vi": "Để phòng thiệt hại thêm, chúng tôi sẽ công khai thông tin minh bạch."
   },
   {
    "ko": "원인 규명 이전에 확인되지 않은 내용을 단정하지 않겠습니다.",
    "vi": "Trước khi xác minh nguyên nhân chúng tôi không khẳng định thông tin chưa chắc chắn."
   },
   {
    "ko": "이해당사자의 우려를 경청하고 시정 계획을 발표하겠습니다.",
    "vi": "Chúng tôi sẽ lắng nghe lo ngại của các bên và công bố kế hoạch khắc phục."
   }
  ],
  "prompt": "문제가 발생한 조직의 공식 입장을 발표해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=6&lesson=9",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc6-09"
 },
 {
  "id": "sc6-10",
  "level": 6,
  "number": 10,
  "title": "Bình luận văn học",
  "ko": "문학 작품 비평",
  "grammar": "-에 투영되다; -을/를 드러내다",
  "goal": "Phân tích biểu tượng và bối cảnh",
  "samples": [
   {
    "ko": "작품 속 공간에는 인물의 불안과 시대적 상황이 함께 투영되어 있습니다.",
    "vi": "Không gian trong tác phẩm phản ánh cả nỗi bất an nhân vật và thời đại."
   },
   {
    "ko": "반복되는 이미지가 주인공의 내적 갈등을 드러낸다고 해석할 수 있습니다.",
    "vi": "Có thể diễn giải hình ảnh lặp lại bộc lộ mâu thuẫn nội tâm nhân vật."
   },
   {
    "ko": "해석의 설득력을 높이려면 구체적인 문장에 근거해야 합니다.",
    "vi": "Muốn tăng sức thuyết phục cần dựa trên câu văn cụ thể."
   },
   {
    "ko": "독자의 경험에 따라 작품의 의미가 다르게 형성될 수 있습니다.",
    "vi": "Ý nghĩa tác phẩm có thể hình thành khác nhau theo trải nghiệm người đọc."
   }
  ],
  "prompt": "선택한 작품의 상징 하나를 분석해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=6&lesson=10",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc6-10"
 },
 {
  "id": "sc6-11",
  "level": 6,
  "number": 11,
  "title": "Đánh giá chiến lược giáo dục",
  "ko": "교육 전략 평가",
  "grammar": "-에 근거하다; -과/와 상충하다",
  "goal": "Đề xuất giải pháp chiến lược",
  "samples": [
   {
    "ko": "개편안의 타당성은 단기 성과보다 장기적인 학습 지표에 근거해 판단해야 합니다.",
    "vi": "Tính hợp lý cải cách phải dựa vào chỉ số học tập dài hạn thay vì kết quả ngắn hạn."
   },
   {
    "ko": "효율성 목표가 교육의 공정성과 상충할 가능성도 검토해야 합니다.",
    "vi": "Cần xét khả năng mục tiêu hiệu quả xung đột với công bằng giáo dục."
   },
   {
    "ko": "다양한 집단의 경험을 반영하지 않으면 정책의 수용성이 떨어질 수 있습니다.",
    "vi": "Không phản ánh trải nghiệm nhiều nhóm có thể giảm mức chấp nhận chính sách."
   },
   {
    "ko": "시범 사업의 결과를 토대로 단계적으로 확대할 것을 권고합니다.",
    "vi": "Tôi khuyến nghị mở rộng theo giai đoạn dựa trên kết quả thí điểm."
   }
  ],
  "prompt": "교육 전략을 평가하고 수정안을 제안해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=6&lesson=11",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc6-11"
 },
 {
  "id": "sc6-12",
  "level": 6,
  "number": 12,
  "title": "Vai trò lãnh đạo",
  "ko": "조직 리더십",
  "grammar": "-은/는커녕; -에 달려 있다",
  "goal": "Trình bày lãnh đạo có trách nhiệm",
  "samples": [
   {
    "ko": "성과만 강조해서는 신뢰는커녕 구성원의 자발적인 참여도 얻기 어렵습니다.",
    "vi": "Chỉ nhấn mạnh thành tích thì khó nhận cả niềm tin lẫn sự tự nguyện."
   },
   {
    "ko": "리더십의 성패는 책임을 나누는 방식에 달려 있습니다.",
    "vi": "Thành bại lãnh đạo phụ thuộc cách chia sẻ trách nhiệm."
   },
   {
    "ko": "의사결정 과정의 투명성이 조직 문화의 기반이 됩니다.",
    "vi": "Minh bạch quá trình quyết định là nền tảng văn hóa tổ chức."
   },
   {
    "ko": "실패의 원인을 개인에게 전가하지 않는 태도가 필요합니다.",
    "vi": "Cần thái độ không đổ lỗi thất bại cho cá nhân."
   }
  ],
  "prompt": "좋은 리더가 갖추어야 할 조건을 설명해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=6&lesson=12",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc6-12"
 },
 {
  "id": "sc6-13",
  "level": 6,
  "number": 13,
  "title": "Công nghệ và công bằng",
  "ko": "기술과 형평성",
  "grammar": "-을/를 전제로 하다; -을/를 간과하다",
  "goal": "Đánh giá tác động xã hội công nghệ",
  "samples": [
   {
    "ko": "디지털 전환은 모든 사람이 기술에 접근할 수 있다는 전제를 경계해야 합니다.",
    "vi": "Chuyển đổi số cần tránh giả định ai cũng tiếp cận được công nghệ."
   },
   {
    "ko": "취약 집단의 경험을 간과하면 새로운 불평등이 나타날 수 있습니다.",
    "vi": "Nếu xem nhẹ nhóm yếu thế có thể xuất hiện bất bình đẳng mới."
   },
   {
    "ko": "효율성 지표뿐 아니라 실질적인 접근성을 평가해야 합니다.",
    "vi": "Cần đánh giá tiếp cận thực chất chứ không chỉ chỉ số hiệu quả."
   },
   {
    "ko": "설계 단계부터 다양한 사용자의 의견을 반영할 필요가 있습니다.",
    "vi": "Cần phản ánh ý kiến nhiều người dùng ngay từ bước thiết kế."
   }
  ],
  "prompt": "기술 발전과 사회적 평등의 관계를 논의해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=6&lesson=13",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc6-13"
 },
 {
  "id": "sc6-14",
  "level": 6,
  "number": 14,
  "title": "Tổng kết bài học từ thất bại",
  "ko": "실패 경험의 재해석",
  "grammar": "-음을 인정하다; -을/를 토대로",
  "goal": "Đưa ra phân tích phản tư",
  "samples": [
   {
    "ko": "초기 판단에 한계가 있었음을 인정하는 것이 개선의 출발점입니다.",
    "vi": "Thừa nhận hạn chế của đánh giá ban đầu là điểm khởi đầu cải tiến."
   },
   {
    "ko": "실패 원인을 개인적 실수로만 환원하지 않겠습니다.",
    "vi": "Tôi không quy nguyên nhân thất bại chỉ cho sai sót cá nhân."
   },
   {
    "ko": "분석 결과를 토대로 향후 절차를 체계적으로 보완하겠습니다.",
    "vi": "Dựa vào phân tích tôi sẽ bổ sung có hệ thống quy trình tương lai."
   },
   {
    "ko": "경험에서 얻은 교훈을 조직 차원에서 공유할 필요가 있습니다.",
    "vi": "Cần chia sẻ bài học kinh nghiệm ở cấp tổ chức."
   }
  ],
  "prompt": "실패 경험에서 도출한 교훈을 발표해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=6&lesson=14",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc6-14"
 },
 {
  "id": "sc6-15",
  "level": 6,
  "number": 15,
  "title": "Bảo vệ quan điểm cuối khóa",
  "ko": "종합 논증 발표",
  "grammar": "-에 반하여; -음을 시사하다",
  "goal": "Bảo vệ lập luận học thuật hoàn chỉnh",
  "samples": [
   {
    "ko": "일반적인 예상에 반하여 조사 결과는 다른 방향의 변화를 보여 주었습니다.",
    "vi": "Trái dự đoán thông thường, kết quả khảo sát cho thấy hướng thay đổi khác."
   },
   {
    "ko": "이러한 차이는 기존 설명의 한계를 시사한다고 볼 수 있습니다.",
    "vi": "Khác biệt này có thể chỉ ra hạn chế của cách giải thích trước."
   },
   {
    "ko": "저는 두 가지 대안 중 실행 가능성이 높은 방안을 제안하고자 합니다.",
    "vi": "Tôi muốn đề xuất phương án khả thi hơn trong hai lựa chọn."
   },
   {
    "ko": "제 발표의 결론은 추가 검증의 필요성을 부정하지 않는다는 점을 강조합니다.",
    "vi": "Tôi nhấn mạnh kết luận không phủ nhận nhu cầu kiểm chứng thêm."
   }
  ],
  "prompt": "하나의 사회 문제를 근거, 반론, 대안 순서로 발표해 보세요.",
  "source": "original",
  "lessonUrl": "lo-trinh-1-6.html?level=6&lesson=15",
  "speakingUrl": "luyen-noi-tinh-diem.html?task=sc6-15"
 }
];
