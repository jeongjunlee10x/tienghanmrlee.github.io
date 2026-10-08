/* Bộ câu hỏi trắc nghiệm theo đúng 15 chủ đề của Sách Từ Vựng Sơ Cấp (1,2) Mr Lee. */
export const LEVELS = {
  "sc1": [
    {
      "title": "Giới thiệu",
      "ko": "소개",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“베트남” có nghĩa là gì?",
          "options": [
            "Việt Nam",
            "Hàn Quốc",
            "Nhật Bản",
            "Trung Quốc"
          ],
          "answer": 0,
          "explain": "베트남 là Việt Nam."
        },
        {
          "type": "Từ vựng",
          "text": "Từ nào nghĩa là “sinh viên”?",
          "options": [
            "학교",
            "대학생",
            "회사",
            "책"
          ],
          "answer": 1,
          "explain": "대학생 = sinh viên đại học."
        },
        {
          "type": "Ngữ pháp",
          "text": "Chọn câu giới thiệu “Tôi là học sinh” đúng theo lối trang trọng.",
          "options": [
            "저는 학생을 입니다.",
            "저는 학생입니까?",
            "저는 학생입니다.",
            "저는 학생에 있습니다."
          ],
          "answer": 2,
          "explain": "Danh từ + 입니다 diễn tả “là”."
        },
        {
          "type": "Hội thoại",
          "text": "A: 한국 사람입니까?  B: 네, ____.",
          "options": [
            "없습니다",
            "갑니다",
            "아닙니까",
            "한국 사람입니다"
          ],
          "answer": 3,
          "explain": "Câu hỏi về quốc tịch, trả lời “Vâng, tôi là người Hàn Quốc”."
        },
        {
          "type": "Từ vựng",
          "text": "“아니요” được dùng để nói gì?",
          "options": [
            "Không / không phải",
            "Vâng",
            "Xin cảm ơn",
            "Xin chào"
          ],
          "answer": 0,
          "explain": "아니요 = không; 네/예 = vâng."
        }
      ]
    },
    {
      "title": "Trường học",
      "ko": "학교",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“도서관” nghĩa là gì?",
          "options": [
            "Bệnh viện",
            "Thư viện",
            "Bưu điện",
            "Khách sạn"
          ],
          "answer": 1,
          "explain": "도서관 = thư viện."
        },
        {
          "type": "Từ vựng",
          "text": "Từ nào nghĩa là “cục tẩy”?",
          "options": [
            "책",
            "공책",
            "지우개",
            "사전"
          ],
          "answer": 2,
          "explain": "지우개 = cục tẩy."
        },
        {
          "type": "Ngữ pháp",
          "text": "Chọn câu đúng: “Có sách”.",
          "options": [
            "책을 있습니다.",
            "책에 있습니다.",
            "책은 없습니다.",
            "책이 있습니다."
          ],
          "answer": 3,
          "explain": "Sự tồn tại: N이/가 있습니다."
        },
        {
          "type": "Ngữ pháp",
          "text": "“책이 책상에 있습니다.” có nghĩa là gì?",
          "options": [
            "Sách ở trên bàn.",
            "Bàn không có sách.",
            "Tôi mua một cuốn sách.",
            "Tôi đọc sách ở thư viện."
          ],
          "answer": 0,
          "explain": "N에 있습니다 chỉ vị trí tồn tại."
        },
        {
          "type": "Tình huống",
          "text": "Muốn nói “Không có bút”, chọn câu nào?",
          "options": [
            "펜이 많습니다.",
            "펜이 없습니다.",
            "펜을 읽습니다.",
            "펜에 갑니다."
          ],
          "answer": 1,
          "explain": "없습니다 là không có."
        }
      ]
    },
    {
      "title": "Sinh hoạt hằng ngày",
      "ko": "일상생활",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“자다” nghĩa là gì?",
          "options": [
            "Ăn",
            "Uống",
            "Ngủ",
            "Đọc"
          ],
          "answer": 2,
          "explain": "자다 = ngủ."
        },
        {
          "type": "Từ vựng",
          "text": "Từ nào có nghĩa “thú vị”?",
          "options": [
            "나쁘다",
            "작다",
            "적다",
            "재미있다"
          ],
          "answer": 3,
          "explain": "재미있다 = hay, thú vị."
        },
        {
          "type": "Ngữ pháp",
          "text": "Chọn câu hỏi trang trọng đúng: “Bạn học tiếng Hàn phải không?”",
          "options": [
            "한국어를 공부합니까?",
            "한국어가 공부입니다.",
            "한국어에 공부합니다.",
            "한국어를 공부입니까?"
          ],
          "answer": 0,
          "explain": "Động từ 공부하다 → 공부합니까?"
        },
        {
          "type": "Ngữ pháp",
          "text": "Điền tiểu từ: 사과___ 먹습니다.",
          "options": [
            "에",
            "를",
            "에서",
            "와"
          ],
          "answer": 1,
          "explain": "사과는 tân ngữ → 사과를 먹습니다."
        },
        {
          "type": "Từ vựng",
          "text": "“읽다” nghĩa là gì?",
          "options": [
            "Gặp",
            "Nghe",
            "Đọc",
            "Đi"
          ],
          "answer": 2,
          "explain": "읽다 = đọc; 듣다 = nghe."
        }
      ]
    },
    {
      "title": "Ngày và thứ",
      "ko": "날짜와 요일",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“월요일” là thứ mấy?",
          "options": [
            "Thứ sáu",
            "Chủ nhật",
            "Thứ tư",
            "Thứ hai"
          ],
          "answer": 3,
          "explain": "월요일 = thứ hai."
        },
        {
          "type": "Từ vựng",
          "text": "“주말” có nghĩa là gì?",
          "options": [
            "Cuối tuần",
            "Tuần sau",
            "Tuần này",
            "Ngày thường"
          ],
          "answer": 0,
          "explain": "주말 = cuối tuần."
        },
        {
          "type": "Ngữ pháp",
          "text": "Chọn cách nói “thứ ba và thứ tư”.",
          "options": [
            "화요일과 수요일",
            "화요일와 수요일",
            "화요일를 수요일",
            "화요일에 수요일"
          ],
          "answer": 1,
          "explain": "화요일 không có 받침 → 와."
        },
        {
          "type": "Đọc hiểu",
          "text": "“오늘은 금요일입니다.” Hôm nay là ngày gì?",
          "options": [
            "Chủ nhật",
            "Thứ hai",
            "Thứ sáu",
            "Thứ bảy"
          ],
          "answer": 2,
          "explain": "금요일 = thứ sáu."
        },
        {
          "type": "Từ vựng",
          "text": "“다음 주” nghĩa là gì?",
          "options": [
            "Tuần trước",
            "Tuần này",
            "Cuối tuần",
            "Tuần sau"
          ],
          "answer": 3,
          "explain": "다음 주 = tuần sau."
        }
      ]
    },
    {
      "title": "Công việc trong ngày",
      "ko": "하루 일과",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“오전” có nghĩa là gì?",
          "options": [
            "Buổi sáng (AM)",
            "Buổi chiều (PM)",
            "Ban đêm",
            "Cuối tuần"
          ],
          "answer": 0,
          "explain": "오전 = trước 12 giờ trưa."
        },
        {
          "type": "Từ vựng",
          "text": "“운전하다” nghĩa là gì?",
          "options": [
            "Học bài",
            "Lái xe",
            "Nấu ăn",
            "Đọc sách"
          ],
          "answer": 1,
          "explain": "운전하다 = lái xe."
        },
        {
          "type": "Ngữ pháp",
          "text": "Chọn dạng lịch sự của “가다”.",
          "options": [
            "가습니다",
            "가기",
            "가요",
            "가습니다요"
          ],
          "answer": 2,
          "explain": "가다 → 가요."
        },
        {
          "type": "Ngữ pháp",
          "text": "“공부하다” chia dạng -아/어요 thành gì?",
          "options": [
            "공부아요",
            "공부어요",
            "공부있어요",
            "공부해요"
          ],
          "answer": 3,
          "explain": "하다 → 해요."
        },
        {
          "type": "Đọc hiểu",
          "text": "“오후 세 시에 운동해요.” Người nói tập thể thao lúc nào?",
          "options": [
            "3 giờ chiều",
            "3 giờ sáng",
            "9 giờ sáng",
            "7 giờ tối"
          ],
          "answer": 0,
          "explain": "오후 세 시 = 3 giờ chiều."
        }
      ]
    },
    {
      "title": "Cuối tuần",
      "ko": "주말",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“등산하다” nghĩa là gì?",
          "options": [
            "Đi mua sắm",
            "Leo núi",
            "Câu cá",
            "Xem phim"
          ],
          "answer": 1,
          "explain": "등산하다 = leo núi."
        },
        {
          "type": "Từ vựng",
          "text": "“영화를 보다” nghĩa là gì?",
          "options": [
            "Đọc sách",
            "Nấu ăn",
            "Xem phim",
            "Đi bơi"
          ],
          "answer": 2,
          "explain": "영화 = phim, 보다 = xem."
        },
        {
          "type": "Ngữ pháp",
          "text": "Quá khứ đúng của “가다” là:",
          "options": [
            "가어요",
            "가고",
            "가겠습니다",
            "갔어요"
          ],
          "answer": 3,
          "explain": "가다 → 갔어요."
        },
        {
          "type": "Hội thoại",
          "text": "A: 어제 뭐 했어요? B: ____.",
          "options": [
            "영화를 봤어요.",
            "내일 갈 거예요.",
            "지금 읽어요.",
            "매일 운동해요."
          ],
          "answer": 0,
          "explain": "어제 = hôm qua, dùng thì quá khứ."
        },
        {
          "type": "Từ vựng",
          "text": "“낚시” nghĩa là gì?",
          "options": [
            "Bóng đá",
            "Câu cá",
            "Leo núi",
            "Du lịch"
          ],
          "answer": 1,
          "explain": "낚시 = câu cá."
        }
      ]
    },
    {
      "title": "Mua hàng 1",
      "ko": "물건 사기 (1)",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "Câu “이거 얼마예요?” dùng để hỏi gì?",
          "options": [
            "Cái này của ai?",
            "Cái này ở đâu?",
            "Cái này bao nhiêu tiền?",
            "Cái này có ngon không?"
          ],
          "answer": 2,
          "explain": "얼마예요? = bao nhiêu tiền?"
        },
        {
          "type": "Từ vựng",
          "text": "“바지” nghĩa là gì?",
          "options": [
            "Áo khoác",
            "Váy",
            "Giày da",
            "Quần dài"
          ],
          "answer": 3,
          "explain": "바지 = quần dài."
        },
        {
          "type": "Hội thoại",
          "text": "Tại cửa hàng, muốn xin giảm giá nói:",
          "options": [
            "깎아 주세요.",
            "물 주세요.",
            "읽어 주세요.",
            "앉으세요."
          ],
          "answer": 0,
          "explain": "깎아 주세요 = xin giảm giá."
        },
        {
          "type": "Từ vựng",
          "text": "“채소 / 야채” nghĩa là gì?",
          "options": [
            "Hoa quả",
            "Rau",
            "Thức uống",
            "Giày"
          ],
          "answer": 1,
          "explain": "채소 = 야채 = rau."
        },
        {
          "type": "Ngữ pháp",
          "text": "Điền tiểu từ chủ đề: “저___ 베트남 사람이에요.”",
          "options": [
            "가",
            "에",
            "는",
            "를"
          ],
          "answer": 2,
          "explain": "저는 = về phần tôi; 저 + 는."
        }
      ]
    },
    {
      "title": "Thức ăn",
      "ko": "음식",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“비빔밥” là món gì?",
          "options": [
            "Mì lạnh",
            "Canh tương",
            "Bánh gạo",
            "Cơm trộn"
          ],
          "answer": 3,
          "explain": "비빔밥 = cơm trộn."
        },
        {
          "type": "Từ vựng",
          "text": "“짜다” miêu tả vị gì?",
          "options": [
            "Mặn",
            "Ngọt",
            "Chua",
            "Đắng"
          ],
          "answer": 0,
          "explain": "짜다 = mặn."
        },
        {
          "type": "Ngữ pháp",
          "text": "Chọn câu phủ định “Không đắt”.",
          "options": [
            "비싸고 있어요.",
            "비싸지 않아요.",
            "비싸겠습니다.",
            "비싸 주세요."
          ],
          "answer": 1,
          "explain": "A/V-지 않다 = không."
        },
        {
          "type": "Từ vựng",
          "text": "“냉면” là món gì?",
          "options": [
            "Thịt nướng",
            "Cơm trộn",
            "Mì lạnh",
            "Kim chi"
          ],
          "answer": 2,
          "explain": "냉면 = mì lạnh."
        },
        {
          "type": "Ngữ pháp",
          "text": "“내일 한국에 가겠습니다.” diễn tả gì?",
          "options": [
            "Việc đã xảy ra",
            "Sở thích hiện tại",
            "Một câu hỏi",
            "Ý định hoặc quyết định đi Hàn Quốc"
          ],
          "answer": 3,
          "explain": "-겠- có thể biểu thị ý chí, dự định."
        }
      ]
    },
    {
      "title": "Nhà cửa",
      "ko": "집",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“왼쪽” nghĩa là gì?",
          "options": [
            "Bên trái",
            "Bên phải",
            "Phía trên",
            "Đằng sau"
          ],
          "answer": 0,
          "explain": "왼쪽 = bên trái."
        },
        {
          "type": "Từ vựng",
          "text": "“건너편” chỉ vị trí nào?",
          "options": [
            "Bên cạnh",
            "Đối diện",
            "Ở giữa",
            "Bên trong"
          ],
          "answer": 1,
          "explain": "건너편 = phía đối diện."
        },
        {
          "type": "Ngữ pháp",
          "text": "Chọn câu đúng “Đi bằng xe buýt”.",
          "options": [
            "버스에 가요.",
            "버스를 가요.",
            "버스로 가요.",
            "버스가 가요."
          ],
          "answer": 2,
          "explain": "Danh từ + (으)로 diễn tả phương tiện: 버스로."
        },
        {
          "type": "Từ vựng",
          "text": "“밖” có nghĩa là gì?",
          "options": [
            "Trong",
            "Dưới",
            "Giữa",
            "Ngoài"
          ],
          "answer": 3,
          "explain": "밖 = ngoài."
        },
        {
          "type": "Hội thoại",
          "text": "Muốn chỉ đường “Hãy đi sang bên phải”, chọn:",
          "options": [
            "오른쪽으로 가세요.",
            "오른쪽을 먹으세요.",
            "왼쪽으로 가세요.",
            "오른쪽에 마셔요."
          ],
          "answer": 0,
          "explain": "오른쪽으로 = về phía bên phải."
        }
      ]
    },
    {
      "title": "Gia đình",
      "ko": "가족",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“외할머니” chỉ ai?",
          "options": [
            "Bà nội",
            "Bà ngoại",
            "Mẹ",
            "Chị gái"
          ],
          "answer": 1,
          "explain": "외할머니 = bà ngoại."
        },
        {
          "type": "Từ vựng",
          "text": "“아버지” nghĩa là gì?",
          "options": [
            "Ông ngoại",
            "Anh trai",
            "Bố",
            "Em trai"
          ],
          "answer": 2,
          "explain": "아버지 = bố."
        },
        {
          "type": "Ngữ pháp",
          "text": "Tiểu từ chủ ngữ kính ngữ trong “선생님___ 오세요.” là gì?",
          "options": [
            "이",
            "을",
            "는",
            "께서"
          ],
          "answer": 3,
          "explain": "께서 dùng với chủ thể cần kính trọng."
        },
        {
          "type": "Ngữ pháp",
          "text": "Câu nào dùng kính ngữ đúng khi nói thầy/cô đến?",
          "options": [
            "선생님께서 오세요.",
            "선생님을 오세요.",
            "선생님에 오세요.",
            "선생님이 먹어요."
          ],
          "answer": 0,
          "explain": "선생님께서 + 오세요 là câu kính ngữ phù hợp."
        },
        {
          "type": "Từ vựng",
          "text": "“할아버지” nghĩa là gì?",
          "options": [
            "Bà",
            "Ông",
            "Bố",
            "Chú"
          ],
          "answer": 1,
          "explain": "할아버지 = ông."
        }
      ]
    },
    {
      "title": "Thời tiết",
      "ko": "날씨",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“겨울” là mùa nào?",
          "options": [
            "Xuân",
            "Hạ",
            "Đông",
            "Thu"
          ],
          "answer": 2,
          "explain": "겨울 = mùa đông."
        },
        {
          "type": "Từ vựng",
          "text": "“목도리” nghĩa là gì?",
          "options": [
            "Áo phông",
            "Mũ",
            "Ô/dù",
            "Khăn quàng cổ"
          ],
          "answer": 3,
          "explain": "목도리 = khăn quàng cổ."
        },
        {
          "type": "Ngữ pháp",
          "text": "Chọn câu “Ăn cơm rồi học”.",
          "options": [
            "밥을 먹고 공부해요.",
            "밥을 먹으러 공부해요.",
            "밥을 먹지만 공부예요.",
            "밥을 먹으니까 공부를"
          ],
          "answer": 0,
          "explain": "V-고 dùng để nối hành động."
        },
        {
          "type": "Ngữ pháp",
          "text": "“9시부터 5시까지” có nghĩa là gì?",
          "options": [
            "Trước 9 giờ",
            "Từ 9 giờ đến 5 giờ",
            "Sau 5 giờ",
            "Trong 9 giờ"
          ],
          "answer": 1,
          "explain": "부터 ~ 까지 = từ… đến…"
        },
        {
          "type": "Từ vựng",
          "text": "“가을” nghĩa là gì?",
          "options": [
            "Mùa hè",
            "Mùa xuân",
            "Mùa thu",
            "Mùa đông"
          ],
          "answer": 2,
          "explain": "가을 = mùa thu."
        }
      ]
    },
    {
      "title": "Điện thoại 1",
      "ko": "전화 (1)",
      "questions": [
        {
          "type": "Tình huống",
          "text": "Khi bắt máy điện thoại, người Hàn thường nói gì?",
          "options": [
            "축하합니다!",
            "잘 먹겠습니다!",
            "안녕히 주무세요.",
            "여보세요?"
          ],
          "answer": 3,
          "explain": "여보세요? = A lô?"
        },
        {
          "type": "Từ vựng",
          "text": "“답장을 보내다” có nghĩa là gì?",
          "options": [
            "Gửi lời/tin trả lời",
            "Nhận quà",
            "Mua điện thoại",
            "Kết thúc cuộc gọi"
          ],
          "answer": 0,
          "explain": "답장 = lời đáp, 보내다 = gửi."
        },
        {
          "type": "Ngữ pháp",
          "text": "Điền: “친구___ 선물을 줘요.”",
          "options": [
            "에서",
            "에게",
            "를",
            "부터"
          ],
          "answer": 1,
          "explain": "에게 = cho, tới một người."
        },
        {
          "type": "Ngữ pháp",
          "text": "Chọn câu “Tiếng Hàn khó nhưng thú vị”.",
          "options": [
            "한국어가 어려워서 재미없어요.",
            "한국어가 어렵고 쉬워요.",
            "한국어가 어렵지만 재미있어요.",
            "한국어를 어렵게 먹어요."
          ],
          "answer": 2,
          "explain": "-지만 = nhưng."
        },
        {
          "type": "Từ vựng",
          "text": "“전화” có nghĩa là gì?",
          "options": [
            "Bưu điện",
            "Tin nhắn",
            "Bút viết",
            "Điện thoại"
          ],
          "answer": 3,
          "explain": "전화 = điện thoại."
        }
      ]
    },
    {
      "title": "Sinh nhật",
      "ko": "생일",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“생일” nghĩa là gì?",
          "options": [
            "Sinh nhật",
            "Ngày nghỉ",
            "Kỳ thi",
            "Cuối tuần"
          ],
          "answer": 0,
          "explain": "생일 = sinh nhật."
        },
        {
          "type": "Tình huống",
          "text": "Lời chúc sinh nhật phổ biến là gì?",
          "options": [
            "맛있게 드세요.",
            "생일 축하해요!",
            "안녕히 가세요.",
            "조심히 운전하세요."
          ],
          "answer": 1,
          "explain": "생일 축하해요 = chúc mừng sinh nhật."
        },
        {
          "type": "Từ vựng",
          "text": "“선물” nghĩa là gì?",
          "options": [
            "Ngày lễ",
            "Khách mời",
            "Món quà",
            "Bánh mì"
          ],
          "answer": 2,
          "explain": "선물 = quà tặng."
        },
        {
          "type": "Hội thoại",
          "text": "A: 오늘 제 생일이에요. B: ____.",
          "options": [
            "늦었어요.",
            "길을 잃었어요.",
            "괜찮습니다.",
            "생일 축하해요!"
          ],
          "answer": 3,
          "explain": "Đáp lại tin sinh nhật bằng lời chúc mừng."
        },
        {
          "type": "Ngữ pháp",
          "text": "Chọn cách rủ bạn cùng ăn: “우리 같이 먹을까요?” có nghĩa là gì?",
          "options": [
            "Chúng ta cùng ăn nhé?",
            "Chúng tôi đã ăn rồi.",
            "Đừng ăn nữa.",
            "Bạn đã ăn chưa?"
          ],
          "answer": 0,
          "explain": "V-(으)ㄹ까요? dùng để đề nghị, hỏi ý kiến."
        }
      ]
    },
    {
      "title": "Sở thích",
      "ko": "취미",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“취미” có nghĩa là gì?",
          "options": [
            "Nghề nghiệp",
            "Sở thích",
            "Quốc tịch",
            "Lịch trình"
          ],
          "answer": 1,
          "explain": "취미 = sở thích."
        },
        {
          "type": "Từ vựng",
          "text": "“독서” nghĩa là gì?",
          "options": [
            "Mua sắm",
            "Leo núi",
            "Đọc sách",
            "Lái xe"
          ],
          "answer": 2,
          "explain": "독서 = việc đọc sách."
        },
        {
          "type": "Hội thoại",
          "text": "A: 취미가 뭐예요? B: ____.",
          "options": [
            "학생이에요.",
            "오늘은 금요일이에요.",
            "배가 아파요.",
            "제 취미는 독서예요."
          ],
          "answer": 3,
          "explain": "Hỏi sở thích, đáp “Sở thích của tôi là đọc sách”."
        },
        {
          "type": "Từ vựng",
          "text": "“운동” có nghĩa là gì?",
          "options": [
            "Thể dục / vận động",
            "Điện thoại",
            "Bức thư",
            "Vé xe"
          ],
          "answer": 0,
          "explain": "운동 = thể dục, vận động."
        },
        {
          "type": "Ngữ pháp",
          "text": "Dạng -아/어요 đúng của “걷다” (đi bộ) là gì?",
          "options": [
            "걷어요",
            "걸어요",
            "걷아요",
            "걷해요"
          ],
          "answer": 1,
          "explain": "걷다 là động từ bất quy tắc ㄷ: 걷다 → 걸어요."
        }
      ]
    },
    {
      "title": "Giao thông 1",
      "ko": "교통 (1)",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“횡단보도” nghĩa là gì?",
          "options": [
            "Bến tàu",
            "Thư viện",
            "Vạch sang đường",
            "Bưu điện"
          ],
          "answer": 2,
          "explain": "횡단보도 = lối sang đường."
        },
        {
          "type": "Từ vựng",
          "text": "“버스 정류장” có nghĩa là gì?",
          "options": [
            "Nhà ga",
            "Trạm y tế",
            "Nhà hàng",
            "Trạm xe buýt"
          ],
          "answer": 3,
          "explain": "버스 정류장 = trạm xe buýt."
        },
        {
          "type": "Ngữ pháp",
          "text": "Chọn câu “Tôi đi từ nhà đến trường”.",
          "options": [
            "집에서 학교까지 가요.",
            "집을 학교에서 가요.",
            "집부터 학교에 읽어요.",
            "집에 학교를 먹어요."
          ],
          "answer": 0,
          "explain": "N에서 N까지 chỉ điểm đầu và điểm cuối của địa điểm."
        },
        {
          "type": "Ngữ pháp",
          "text": "Chọn câu “Tôi đi gặp bạn”.",
          "options": [
            "친구에게 가세요.",
            "친구를 만나러 가요.",
            "친구를 만나서 읽어요.",
            "친구로 만나 있어요."
          ],
          "answer": 1,
          "explain": "V-(으)러 가다 = đi để thực hiện hành động."
        },
        {
          "type": "Tình huống",
          "text": "Muốn nói “Đi bằng xe buýt”, chọn cách nào?",
          "options": [
            "버스를 먹어요.",
            "버스에 읽어요.",
            "버스로 가요.",
            "버스가 책입니다."
          ],
          "answer": 2,
          "explain": "N+(으)로 chỉ phương tiện đi lại."
        },
        {
          "type": "Từ vựng",
          "text": "“교통” nghĩa là gì?",
          "options": [
            "Bộ phận cơ thể",
            "Đời sống",
            "Giao thông",
            "Gia đình"
          ],
          "answer": 2,
          "explain": "교통 = giao thông."
        },
        {
          "type": "Ngữ pháp",
          "text": "“학교에서 집까지” có nghĩa là gì?",
          "options": [
            "Từ trường đến nhà",
            "Từ nhà đến trường",
            "Ở trường và nhà",
            "Gần trường"
          ],
          "answer": 0,
          "explain": "에서 ... 까지 = từ ... đến ..."
        },
        {
          "type": "Tình huống",
          "text": "Muốn đi mua đồ, chọn câu đúng:",
          "options": [
            "우산을 읽으러 가요.",
            "물건을 사러 가요.",
            "친구를 먹으러 가요.",
            "학교를 마시러 가요."
          ],
          "answer": 1,
          "explain": "사다 → 사러 가요 = đi mua."
        },
        {
          "type": "Từ vựng",
          "text": "“오른쪽” nghĩa là gì?",
          "options": [
            "Phía dưới",
            "Phía trên",
            "Bên phải",
            "Bên trái"
          ],
          "answer": 2,
          "explain": "오른쪽 = phải."
        },
        {
          "type": "Ngữ pháp",
          "text": "Cách kết hợp đúng với “지하철” (đi bằng tàu điện ngầm) là:",
          "options": [
            "지하철이",
            "지하철에",
            "지하철을",
            "지하철로"
          ],
          "answer": 3,
          "explain": "Danh từ có 받침 ㄹ dùng -로: 지하철로."
        }
      ]
    }
  ],
  "sc2": [
    {
      "title": "Gặp gỡ",
      "ko": "만남",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“선배” nghĩa là gì?",
          "options": [
            "Hậu bối",
            "Cấp dưới",
            "Khách",
            "Tiền bối"
          ],
          "answer": 3,
          "explain": "선배 = tiền bối."
        },
        {
          "type": "Từ vựng",
          "text": "“후배” có nghĩa là gì?",
          "options": [
            "Hậu bối",
            "Tiền bối",
            "Cấp trên",
            "Chủ nhà"
          ],
          "answer": 0,
          "explain": "후배 = hậu bối."
        },
        {
          "type": "Từ vựng",
          "text": "“악수하다” nghĩa là gì?",
          "options": [
            "Gửi thư",
            "Bắt tay",
            "Nói chuyện điện thoại",
            "Đọc sách"
          ],
          "answer": 1,
          "explain": "악수하다 = bắt tay."
        },
        {
          "type": "Tình huống",
          "text": "Khi gặp khách đến thăm, câu nào phù hợp?",
          "options": [
            "맛있게 드세요.",
            "여보세요?",
            "어서 오세요.",
            "안녕히 주무세요."
          ],
          "answer": 2,
          "explain": "어서 오세요 = xin mời vào, chào mừng đến."
        },
        {
          "type": "Từ vựng",
          "text": "“방문하다” nghĩa là gì?",
          "options": [
            "Tổ chức",
            "Giúp đỡ",
            "Ghi nhớ",
            "Thăm / viếng"
          ],
          "answer": 3,
          "explain": "방문하다 = đến thăm."
        }
      ]
    },
    {
      "title": "Hẹn gặp",
      "ko": "약속",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“약속” nghĩa là gì?",
          "options": [
            "Cuộc hẹn / lời hứa",
            "Bệnh viện",
            "Giấy tờ",
            "Công việc"
          ],
          "answer": 0,
          "explain": "약속 = cuộc hẹn, lời hứa."
        },
        {
          "type": "Từ vựng",
          "text": "“시간을 정하다” nghĩa là gì?",
          "options": [
            "Bị muộn",
            "Ấn định thời gian",
            "Đi du lịch",
            "Đi mua sách"
          ],
          "answer": 1,
          "explain": "시간을 정하다 = quyết định giờ giấc."
        },
        {
          "type": "Hội thoại",
          "text": "A: 내일 두 시에 만날까요? B: ____.",
          "options": [
            "어제 만났어요.",
            "지금 밥이에요.",
            "네, 좋아요.",
            "아니요, 영화예요."
          ],
          "answer": 2,
          "explain": "Hỏi ý hẹn vào 2 giờ ngày mai, đồng ý: 네, 좋아요."
        },
        {
          "type": "Ngữ pháp",
          "text": "Điền: “오늘___ 쉬어요.” (chỉ hôm nay)",
          "options": [
            "오늘은",
            "오늘과",
            "오늘에서",
            "오늘만"
          ],
          "answer": 3,
          "explain": "N+만 diễn tả giới hạn: chỉ hôm nay."
        },
        {
          "type": "Từ vựng",
          "text": "“늦다” có nghĩa là gì?",
          "options": [
            "Muộn",
            "Nhanh",
            "Sớm",
            "Gần"
          ],
          "answer": 0,
          "explain": "늦다 = muộn."
        }
      ]
    },
    {
      "title": "Mua sắm 2",
      "ko": "물건 사기 (2)",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“할인” có nghĩa là gì?",
          "options": [
            "Thanh toán",
            "Giảm giá",
            "Đổi hàng",
            "Hoàn tiền"
          ],
          "answer": 1,
          "explain": "할인 = giảm giá."
        },
        {
          "type": "Từ vựng",
          "text": "“현금” là gì?",
          "options": [
            "Giày da",
            "Hộp quà",
            "Tiền mặt",
            "Vé xe"
          ],
          "answer": 2,
          "explain": "현금 = tiền mặt."
        },
        {
          "type": "Tình huống",
          "text": "Khi muốn thử quần áo trước khi mua, nói:",
          "options": [
            "다른 사람 주세요.",
            "물 좀 주세요.",
            "저는 학생입니다.",
            "입어 봐도 돼요?"
          ],
          "answer": 3,
          "explain": "입어 봐도 돼요? = tôi thử mặc được không?"
        },
        {
          "type": "Ngữ pháp",
          "text": "Cách diễn đạt “rẻ hơn” khi so sánh là:",
          "options": [
            "보다 싸요",
            "부터 싸요",
            "까지 싸요",
            "에서 싸요"
          ],
          "answer": 0,
          "explain": "N보다 + A diễn đạt so sánh hơn."
        },
        {
          "type": "Từ vựng",
          "text": "“교환하다” nghĩa là gì?",
          "options": [
            "Lái xe",
            "Đổi hàng",
            "Gặp mặt",
            "Đặt chỗ"
          ],
          "answer": 1,
          "explain": "교환하다 = trao đổi / đổi hàng."
        }
      ]
    },
    {
      "title": "Bệnh viện",
      "ko": "병원",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“안과” là khoa nào?",
          "options": [
            "Nha khoa",
            "Nội khoa",
            "Khoa mắt",
            "Khoa tai mũi họng"
          ],
          "answer": 2,
          "explain": "안과 = khoa mắt."
        },
        {
          "type": "Từ vựng",
          "text": "“코” nghĩa là gì?",
          "options": [
            "Tay",
            "Mắt",
            "Miệng",
            "Mũi"
          ],
          "answer": 3,
          "explain": "코 = mũi."
        },
        {
          "type": "Từ vựng",
          "text": "“머리가 아파요” có nghĩa là gì?",
          "options": [
            "Tôi đau đầu.",
            "Tôi đau chân.",
            "Tôi rất buồn ngủ.",
            "Tôi bị đói."
          ],
          "answer": 0,
          "explain": "머리 = đầu, 아프다 = đau."
        },
        {
          "type": "Ngữ pháp",
          "text": "“어제 만난 사람” có nghĩa là gì?",
          "options": [
            "Người đang gặp",
            "Người đã gặp hôm qua",
            "Người sẽ gặp ngày mai",
            "Người đang học"
          ],
          "answer": 1,
          "explain": "Định từ quá khứ V-(으)ㄴ bổ nghĩa cho danh từ."
        },
        {
          "type": "Tình huống",
          "text": "Khi có triệu chứng đau bụng, câu phù hợp nhất?",
          "options": [
            "날씨가 추워요.",
            "학교에 가요.",
            "배가 아파요.",
            "책이 있어요."
          ],
          "answer": 2,
          "explain": "배가 아파요 = tôi đau bụng."
        }
      ]
    },
    {
      "title": "Thư tín",
      "ko": "편지",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“소식” nghĩa là gì?",
          "options": [
            "Lịch trình",
            "Thói quen",
            "Cuộc hẹn",
            "Tin tức"
          ],
          "answer": 3,
          "explain": "소식 = tin tức."
        },
        {
          "type": "Từ vựng",
          "text": "“그래서” nghĩa là gì?",
          "options": [
            "Vì vậy / nên",
            "Nhưng mà",
            "Và",
            "Hoặc"
          ],
          "answer": 0,
          "explain": "그래서 = vì vậy, cho nên."
        },
        {
          "type": "Ngữ pháp",
          "text": "Chọn câu diễn đạt “Hôm nay tôi không thể đi học”.",
          "options": [
            "오늘 학교에 안 좋아요.",
            "오늘 학교에 가지 못해요.",
            "오늘 학교를 못 있어요.",
            "오늘 학교에 갈 수 없었니?"
          ],
          "answer": 1,
          "explain": "V-지 못하다 diễn tả không thể làm."
        },
        {
          "type": "Từ vựng",
          "text": "“그렇지만” thể hiện quan hệ gì?",
          "options": [
            "Nguyên nhân",
            "Lựa chọn",
            "Đối lập / nhưng",
            "Thời gian"
          ],
          "answer": 2,
          "explain": "그렇지만 = nhưng mà."
        },
        {
          "type": "Đọc hiểu",
          "text": "“비가 와요. 그래서 집에 있어요.” Vì sao người nói ở nhà?",
          "options": [
            "Vì có bài kiểm tra",
            "Vì muốn mua hàng",
            "Vì rất đói",
            "Vì trời mưa"
          ],
          "answer": 3,
          "explain": "그래서 nối nguyên nhân mưa và kết quả ở nhà."
        }
      ]
    },
    {
      "title": "Giao thông 2",
      "ko": "교통 (2)",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“셔틀버스” là gì?",
          "options": [
            "Xe buýt đưa đón",
            "Xe máy",
            "Tàu hỏa",
            "Xe đạp"
          ],
          "answer": 0,
          "explain": "셔틀버스 = xe buýt đưa đón."
        },
        {
          "type": "Từ vựng",
          "text": "“일반택시” có nghĩa là gì?",
          "options": [
            "Xe buýt làng",
            "Taxi thường",
            "Xe cứu thương",
            "Tàu điện"
          ],
          "answer": 1,
          "explain": "일반택시 = taxi thường."
        },
        {
          "type": "Ngữ pháp",
          "text": "Chọn câu đúng “Vì trời mưa nên tôi ở nhà”.",
          "options": [
            "비가 오고 집에서 가요.",
            "비가 오지만 집에 있어요.",
            "비가 와서 집에 있어요.",
            "비를 먹어서 집에 가요."
          ],
          "answer": 2,
          "explain": "-아/어서 nối nguyên nhân và kết quả."
        },
        {
          "type": "Ngữ pháp",
          "text": "“집에 가서 쉬어요” có nghĩa là gì?",
          "options": [
            "Tôi chỉ về nhà thôi.",
            "Vì tôi nghỉ nên tôi đi nhà.",
            "Tôi định mua nhà.",
            "Tôi về nhà rồi nghỉ ngơi."
          ],
          "answer": 3,
          "explain": "-아/어서 cũng diễn tả hai hành động nối tiếp."
        },
        {
          "type": "Từ vựng",
          "text": "“모퉁이를 돌다” nghĩa là gì?",
          "options": [
            "Rẽ ở góc đường",
            "Dừng ở bến xe",
            "Đón taxi",
            "Qua cầu"
          ],
          "answer": 0,
          "explain": "모퉁이를 돌다 = rẽ ở góc."
        }
      ]
    },
    {
      "title": "Điện thoại 2",
      "ko": "전화 (2)",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“국제전화” nghĩa là gì?",
          "options": [
            "Điện thoại nội hạt",
            "Cuộc gọi quốc tế",
            "Cuộc gọi nhỡ",
            "Số nội bộ"
          ],
          "answer": 1,
          "explain": "국제전화 = cuộc gọi quốc tế."
        },
        {
          "type": "Từ vựng",
          "text": "“담당자” nghĩa là gì?",
          "options": [
            "Người mua hàng",
            "Người gửi thư",
            "Người phụ trách",
            "Người bệnh"
          ],
          "answer": 2,
          "explain": "담당자 = người phụ trách."
        },
        {
          "type": "Ngữ pháp",
          "text": "Chọn câu “Tôi đến Hàn Quốc để học tiếng Hàn”.",
          "options": [
            "한국어를 배우고 한국에 왔어요.",
            "한국어를 배워서 학교가 없어요.",
            "한국어를 배웠기 때문에 왔어요.",
            "한국어를 배우려고 한국에 왔어요."
          ],
          "answer": 3,
          "explain": "V-(으)려고 diễn tả mục đích hành động."
        },
        {
          "type": "Từ vựng",
          "text": "“통화 중이다” nghĩa là gì?",
          "options": [
            "Đang bận máy / đang gọi điện",
            "Đã gửi thư",
            "Đang lái xe",
            "Đang đọc sách"
          ],
          "answer": 0,
          "explain": "통화 중이다 = đang nói chuyện điện thoại."
        },
        {
          "type": "Hội thoại",
          "text": "Muốn để lại ghi chú khi người cần gặp vắng mặt, câu phù hợp là:",
          "options": [
            "지금 영화예요.",
            "메모를 남겨 주세요.",
            "식당이 어디예요?",
            "빨리 먹으세요."
          ],
          "answer": 1,
          "explain": "메모를 남기다 = để lại lời nhắn."
        }
      ]
    },
    {
      "title": "Phim ảnh",
      "ko": "영화",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“공포 영화” là phim gì?",
          "options": [
            "Phim hài",
            "Phim hành động",
            "Phim kinh dị",
            "Phim tài liệu"
          ],
          "answer": 2,
          "explain": "공포 영화 = phim kinh dị."
        },
        {
          "type": "Từ vựng",
          "text": "“영화 감독” nghĩa là gì?",
          "options": [
            "Diễn viên",
            "Khán giả",
            "Người bán vé",
            "Đạo diễn"
          ],
          "answer": 3,
          "explain": "영화 감독 = đạo diễn."
        },
        {
          "type": "Ngữ pháp",
          "text": "“맛있겠어요.” diễn tả điều gì?",
          "options": [
            "Chắc là ngon.",
            "Không ngon.",
            "Đã ăn rồi.",
            "Ăn đi nào."
          ],
          "answer": 0,
          "explain": "-겠- diễn tả suy đoán: trông có vẻ ngon."
        },
        {
          "type": "Ngữ pháp",
          "text": "“날씨가 좋네요!” bộc lộ cảm xúc gì?",
          "options": [
            "Nghi ngờ thời tiết",
            "Thấy thời tiết đẹp / cảm thán",
            "Ra lệnh về thời tiết",
            "Kể về hôm qua"
          ],
          "answer": 1,
          "explain": "-네요 bộc lộ sự phát hiện hoặc cảm thán."
        },
        {
          "type": "Từ vựng",
          "text": "“지루하다” nghĩa là gì?",
          "options": [
            "Vui vẻ",
            "Hạnh phúc",
            "Buồn tẻ",
            "Hấp dẫn"
          ],
          "answer": 2,
          "explain": "지루하다 = buồn tẻ."
        }
      ]
    },
    {
      "title": "Ngày nghỉ",
      "ko": "휴일",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“공휴일” là gì?",
          "options": [
            "Sinh nhật",
            "Kỳ thi",
            "Ngày làm việc",
            "Ngày nghỉ lễ"
          ],
          "answer": 3,
          "explain": "공휴일 = ngày nghỉ lễ."
        },
        {
          "type": "Từ vựng",
          "text": "“소풍을 가다” có nghĩa là gì?",
          "options": [
            "Đi dã ngoại",
            "Đi làm ca đêm",
            "Đi khám bệnh",
            "Đọc sách"
          ],
          "answer": 0,
          "explain": "소풍을 가다 = đi dã ngoại."
        },
        {
          "type": "Ngữ pháp",
          "text": "Điền: “커피___ 차를 마셔요.” (hoặc)",
          "options": [
            "부터",
            "나",
            "에서",
            "에게"
          ],
          "answer": 1,
          "explain": "Danh từ không 받침 như 커피 + 나."
        },
        {
          "type": "Ngữ pháp",
          "text": "“친구가 열 명이나 왔어요.” nhấn mạnh điều gì?",
          "options": [
            "Chỉ có một bạn đến",
            "Không ai đến",
            "Có tận mười người bạn đến",
            "Sẽ có mười bạn đến"
          ],
          "answer": 2,
          "explain": "(이)나 nhấn mạnh số lượng nhiều hơn dự kiến."
        },
        {
          "type": "Từ vựng",
          "text": "“설날” có nghĩa là gì?",
          "options": [
            "Giáng sinh",
            "Tết Trung thu",
            "Ngày quốc khánh",
            "Tết Nguyên Đán"
          ],
          "answer": 3,
          "explain": "설날 = Tết Nguyên Đán."
        }
      ]
    },
    {
      "title": "Ngoại hình",
      "ko": "외모",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“단발 머리” chỉ kiểu tóc nào?",
          "options": [
            "Tóc ngắn ngang vai",
            "Tóc uốn xoăn dài",
            "Đầu trọc",
            "Tóc nhuộm đỏ"
          ],
          "answer": 0,
          "explain": "단발 머리 = tóc ngắn, tóc ngang vai."
        },
        {
          "type": "Từ vựng",
          "text": "“날씬하다” nghĩa là gì?",
          "options": [
            "To béo",
            "Thon thả",
            "Rất thấp",
            "Già"
          ],
          "answer": 1,
          "explain": "날씬하다 = thon thả."
        },
        {
          "type": "Ngữ pháp",
          "text": "“날씨가 따뜻해졌어요.” có nghĩa là gì?",
          "options": [
            "Trời sẽ lạnh đi",
            "Trời rất lạnh",
            "Thời tiết đã ấm lên",
            "Tôi đang xem thời tiết"
          ],
          "answer": 2,
          "explain": "A-아/어지다 = trở nên."
        },
        {
          "type": "Từ vựng",
          "text": "“앞머리” có nghĩa là gì?",
          "options": [
            "Tóc đuôi ngựa",
            "Tóc xoăn",
            "Tóc dài",
            "Tóc mái"
          ],
          "answer": 3,
          "explain": "앞머리 = tóc mái."
        },
        {
          "type": "Từ vựng",
          "text": "“귀엽다” nghĩa là gì?",
          "options": [
            "Dễ thương",
            "Nguy hiểm",
            "Buồn tẻ",
            "Mệt mỏi"
          ],
          "answer": 0,
          "explain": "귀엽다 = dễ thương."
        }
      ]
    },
    {
      "title": "Du lịch",
      "ko": "여행",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“배낭여행” là kiểu du lịch nào?",
          "options": [
            "Du lịch công vụ",
            "Du lịch ba lô",
            "Du lịch tuần trăng mật",
            "Du lịch y tế"
          ],
          "answer": 1,
          "explain": "배낭여행 = du lịch ba lô."
        },
        {
          "type": "Từ vựng",
          "text": "“비행기 표” nghĩa là gì?",
          "options": [
            "Vé tàu",
            "Vé xem phim",
            "Vé máy bay",
            "Hóa đơn"
          ],
          "answer": 2,
          "explain": "비행기 표 = vé máy bay."
        },
        {
          "type": "Ngữ pháp",
          "text": "Chọn câu: “Cuối tuần tôi xem phim hoặc đọc sách”.",
          "options": [
            "주말에 영화를 보고 책을 읽었어요.",
            "주말에 영화를 봐서 책을 읽어요.",
            "주말에 영화를 보면서 책을 읽었어요.",
            "주말에 영화를 보거나 책을 읽어요."
          ],
          "answer": 3,
          "explain": "V-거나 diễn tả sự lựa chọn giữa các hành động."
        },
        {
          "type": "Ngữ pháp",
          "text": "“지금 한국어를 공부하고 있어요.” nghĩa là gì?",
          "options": [
            "Tôi đang học tiếng Hàn bây giờ.",
            "Tôi đã học tiếng Hàn rồi.",
            "Tôi sẽ không học tiếng Hàn.",
            "Tôi không biết tiếng Hàn."
          ],
          "answer": 0,
          "explain": "V-고 있다 = đang làm gì."
        },
        {
          "type": "Từ vựng",
          "text": "“여권” nghĩa là gì?",
          "options": [
            "Vé tàu",
            "Hộ chiếu",
            "Khách sạn",
            "Hành lý"
          ],
          "answer": 1,
          "explain": "여권 = hộ chiếu."
        }
      ]
    },
    {
      "title": "Nơi công cộng",
      "ko": "공공장소",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“질서를 지키다” nghĩa là gì?",
          "options": [
            "Đi du lịch",
            "Gây ồn",
            "Giữ trật tự",
            "Mua vé"
          ],
          "answer": 2,
          "explain": "질서를 지키다 = giữ trật tự."
        },
        {
          "type": "Từ vựng",
          "text": "“기숙사” nghĩa là gì?",
          "options": [
            "Nhà hàng",
            "Cửa hàng",
            "Sân bay",
            "Ký túc xá"
          ],
          "answer": 3,
          "explain": "기숙사 = ký túc xá."
        },
        {
          "type": "Ngữ pháp",
          "text": "Chọn câu “Tôi vừa nghe nhạc vừa học bài”.",
          "options": [
            "음악을 들으면서 공부해요.",
            "음악을 들어서 공부할까요.",
            "음악을 듣지만 공부 안 해요.",
            "음악을 들으러 공부해요."
          ],
          "answer": 0,
          "explain": "V-(으)면서 nối hai hành động đồng thời."
        },
        {
          "type": "Từ vựng",
          "text": "“금연하다” nói về điều gì?",
          "options": [
            "Đi bộ",
            "Không hút thuốc / cấm hút thuốc",
            "Cắt tóc",
            "Dừng xe"
          ],
          "answer": 1,
          "explain": "금연하다 = không hút thuốc / cấm hút thuốc."
        },
        {
          "type": "Tình huống",
          "text": "Ở nơi công cộng cần giữ yên lặng, nên nói:",
          "options": [
            "떠드세요.",
            "크게 말하세요.",
            "조용히 해 주세요.",
            "담배를 피우세요."
          ],
          "answer": 2,
          "explain": "조용히 해 주세요 = xin hãy giữ yên lặng."
        }
      ]
    },
    {
      "title": "Đô thị",
      "ko": "도시",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“인구” nghĩa là gì?",
          "options": [
            "Khách du lịch",
            "Núi",
            "Diện tích",
            "Dân số"
          ],
          "answer": 3,
          "explain": "인구 = dân số."
        },
        {
          "type": "Từ vựng",
          "text": "“물가” nghĩa là gì?",
          "options": [
            "Giá cả / mức giá",
            "Nhà máy",
            "Khu phố",
            "Lịch sử"
          ],
          "answer": 0,
          "explain": "물가 = giá cả."
        },
        {
          "type": "Từ vựng",
          "text": "“중심지” nghĩa là gì?",
          "options": [
            "Đất sét",
            "Khu trung tâm",
            "Vùng ven biển",
            "Đồi núi"
          ],
          "answer": 1,
          "explain": "중심지 = trung tâm."
        },
        {
          "type": "Đọc hiểu",
          "text": "“서울은 인구가 많아요.” Ý nghĩa phù hợp là:",
          "options": [
            "Seoul có ít dân.",
            "Seoul ở xa.",
            "Seoul có dân số đông.",
            "Seoul có nhiều công viên."
          ],
          "answer": 2,
          "explain": "인구가 많다 = dân số đông."
        },
        {
          "type": "Từ vựng",
          "text": "“위치” nghĩa là gì?",
          "options": [
            "Kỳ nghỉ",
            "Nghệ thuật",
            "Giá cả",
            "Vị trí"
          ],
          "answer": 3,
          "explain": "위치 = vị trí."
        }
      ]
    },
    {
      "title": "Kế hoạch",
      "ko": "계획",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“변호사” là nghề gì?",
          "options": [
            "Luật sư",
            "Kỹ thuật viên",
            "Giáo viên",
            "Bác sĩ"
          ],
          "answer": 0,
          "explain": "변호사 = luật sư."
        },
        {
          "type": "Từ vựng",
          "text": "“등록금” có nghĩa là gì?",
          "options": [
            "Tiền vé",
            "Học phí",
            "Tiền thuê nhà",
            "Tiền ăn"
          ],
          "answer": 1,
          "explain": "등록금 = học phí."
        },
        {
          "type": "Ngữ pháp",
          "text": "“한국에 온 지 1년 됐어요.” nghĩa là gì?",
          "options": [
            "Tôi sẽ đến Hàn Quốc một năm nữa.",
            "Tôi đi Hàn Quốc mỗi năm.",
            "Tôi đến Hàn Quốc được một năm rồi.",
            "Tôi vừa đến Hàn Quốc hôm qua."
          ],
          "answer": 2,
          "explain": "V-(으)ㄴ 지 ... 되다 = đã được bao lâu kể từ khi."
        },
        {
          "type": "Từ vựng",
          "text": "“봉사 활동” nghĩa là gì?",
          "options": [
            "Hoạt động kinh doanh",
            "Hoạt động thể thao",
            "Đi du lịch",
            "Hoạt động tình nguyện"
          ],
          "answer": 3,
          "explain": "봉사 활동 = hoạt động tình nguyện."
        },
        {
          "type": "Từ vựng",
          "text": "“벌써” nghĩa là gì?",
          "options": [
            "Đã / rồi / nhanh thế",
            "Ngày mai",
            "Đôi khi",
            "Chưa bao giờ"
          ],
          "answer": 0,
          "explain": "벌써 = đã, đã rồi, sớm hơn dự kiến."
        }
      ]
    },
    {
      "title": "Cuộc sống tại Hàn Quốc",
      "ko": "한국 생활",
      "questions": [
        {
          "type": "Từ vựng",
          "text": "“적응하다” nghĩa là gì?",
          "options": [
            "Nghỉ việc",
            "Thích nghi",
            "Đi bộ",
            "Bị ốm"
          ],
          "answer": 1,
          "explain": "적응하다 = thích nghi."
        },
        {
          "type": "Từ vựng",
          "text": "“외국인 등록증” là giấy tờ gì?",
          "options": [
            "Hộ chiếu",
            "Vé máy bay",
            "Thẻ đăng ký người nước ngoài",
            "Hóa đơn"
          ],
          "answer": 2,
          "explain": "외국인 등록증 = thẻ đăng ký người nước ngoài."
        },
        {
          "type": "Ngữ pháp",
          "text": "“친구에게서 선물을 받았어요.” có nghĩa là gì?",
          "options": [
            "Tôi tặng quà cho bạn.",
            "Tôi mua quà giúp bạn.",
            "Tôi gửi thư cho bạn.",
            "Tôi nhận quà từ bạn."
          ],
          "answer": 3,
          "explain": "N에게서 = từ ai; 선물을 받다 = nhận quà."
        },
        {
          "type": "Từ vựng",
          "text": "“낯설다” có nghĩa là gì?",
          "options": [
            "Lạ lẫm / không quen",
            "Quen thuộc",
            "Hạnh phúc",
            "Thông minh"
          ],
          "answer": 0,
          "explain": "낯설다 = lạ lẫm, không quen."
        },
        {
          "type": "Tình huống",
          "text": "Mới sang Hàn Quốc và đang làm quen cuộc sống, câu phù hợp nhất là:",
          "options": [
            "한국 생활이 재미없습니다.",
            "한국 생활에 적응하고 있어요.",
            "비행기 표를 먹어요.",
            "친구를 병원에서 팔아요."
          ],
          "answer": 1,
          "explain": "한국 생활에 적응하고 있어요 = đang thích nghi với cuộc sống ở Hàn Quốc."
        },
        {
          "type": "Từ vựng",
          "text": "“익숙해지다” có nghĩa là gì?",
          "options": [
            "Dần trở nên quen",
            "Thật xa lạ",
            "Gây ồn ào",
            "Đổi quà"
          ],
          "answer": 0,
          "explain": "익숙해지다 = quen dần."
        },
        {
          "type": "Từ vựng",
          "text": "“불편하다” nghĩa là gì?",
          "options": [
            "Đáng yêu",
            "Bất tiện / không thoải mái",
            "Thú vị",
            "Thân thiện"
          ],
          "answer": 1,
          "explain": "불편하다 = bất tiện."
        },
        {
          "type": "Tình huống",
          "text": "Bạn muốn hỏi thông tin ở cơ quan xuất nhập cảnh, nơi phù hợp là:",
          "options": [
            "우체국",
            "미용실",
            "출입국관리사무소",
            "식당"
          ],
          "answer": 2,
          "explain": "출입국관리사무소 = cơ quan quản lý xuất nhập cảnh."
        },
        {
          "type": "Ngữ pháp",
          "text": "“선생님한테서 한국어를 배웠어요.” có nghĩa là gì?",
          "options": [
            "Tôi dạy tiếng Hàn cho giáo viên.",
            "Tôi gửi thư cho giáo viên.",
            "Tôi gặp giáo viên tối qua.",
            "Tôi học tiếng Hàn từ giáo viên."
          ],
          "answer": 3,
          "explain": "N한테서 chỉ nguồn/người mà ta nhận kiến thức."
        },
        {
          "type": "Từ vựng",
          "text": "“외롭다” diễn tả cảm giác gì?",
          "options": [
            "Cô đơn",
            "No bụng",
            "Tức giận",
            "Khát nước"
          ],
          "answer": 0,
          "explain": "외롭다 = cô đơn."
        }
      ]
    }
  ]
};
