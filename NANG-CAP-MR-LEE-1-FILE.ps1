#Requires -Version 5.1
<#
  TIENG HAN MR LEE - ONE-FILE UPGRADE
  - Giu nguyen images/logo.png cho logo/menu/favicon.
  - Doi anh bia trang chu thanh images/logo2.png.
  - Bo phong van: it nhat 100 cau (44 + 56 cau moi).
  - Giao tiep: moi chu de it nhat 20 cau (16 chu de, 320 cau).
  - Khong sua Firebase, Firestore, lich su hoc tap hoac bo de TOPIK.
  - Tu sao luu HTML truoc khi sua; co the chay lai, khong chen trung.
  Mo Terminal VS Code tai thu muc website, chay:
  powershell -ExecutionPolicy Bypass -File .\NANG-CAP-MR-LEE-1-FILE.ps1
#>

$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $MyInvocation.MyCommand.Path
$utf8 = New-Object System.Text.UTF8Encoding($false)
$homePath = Join-Path $project 'index.html'
$interviewPath = Join-Path $project 'on-luyen-phong-van.html'
$conversationPath = Join-Path $project 'giao-tiep-theo-chu-de.html'

foreach ($file in @($homePath, $interviewPath, $conversationPath)) {
  if (-not (Test-Path -LiteralPath $file -PathType Leaf)) {
    throw "Khong tim thay file: $file. Dat script trong thu muc goc website roi chay lai."
  }
}

$interviewExtra = @'
[
  {
    "id": "iv45",
    "group": "Giới thiệu bản thân",
    "level": "Cơ bản",
    "ko": "생일이 언제예요?",
    "vi": "Sinh nhật của bạn là khi nào?",
    "answer": "제 생일은 5월 10일입니다.",
    "meaning": "Sinh nhật của tôi là ngày 10 tháng 5.",
    "tip": "Thay ngày tháng bằng thông tin thật."
  },
  {
    "id": "iv46",
    "group": "Giới thiệu bản thân",
    "level": "Cơ bản",
    "ko": "지금 어디에 살고 있어요?",
    "vi": "Hiện bạn đang sống ở đâu?",
    "answer": "지금은 베트남에 살고 있습니다.",
    "meaning": "Hiện tôi đang sống ở Việt Nam.",
    "tip": "Chọn câu trả lời theo nơi cư trú thực tế."
  },
  {
    "id": "iv47",
    "group": "Giới thiệu bản thân",
    "level": "Cơ bản",
    "ko": "형제자매가 있어요?",
    "vi": "Bạn có anh chị em không?",
    "answer": "네, 여동생이 한 명 있습니다.",
    "meaning": "Vâng, tôi có một em gái.",
    "tip": "Đếm số người với 명."
  },
  {
    "id": "iv48",
    "group": "Giới thiệu bản thân",
    "level": "Cơ bản",
    "ko": "평소에 성격이 어때요?",
    "vi": "Bình thường tính cách bạn thế nào?",
    "answer": "저는 차분하고 성실한 편입니다.",
    "meaning": "Tôi khá điềm tĩnh và chăm chỉ.",
    "tip": "Nêu hai đặc điểm phù hợp."
  },
  {
    "id": "iv49",
    "group": "Giới thiệu bản thân",
    "level": "Cơ bản",
    "ko": "여가 시간에는 주로 무엇을 해요?",
    "vi": "Khi rảnh bạn thường làm gì?",
    "answer": "시간이 있을 때 책을 읽거나 운동을 합니다.",
    "meaning": "Khi có thời gian, tôi đọc sách hoặc tập thể dục.",
    "tip": "Luyện mẫu -거나 để liệt kê lựa chọn."
  },
  {
    "id": "iv50",
    "group": "Giới thiệu bản thân",
    "level": "Trung cấp",
    "ko": "주변 사람들은 당신을 어떤 사람이라고 하나요?",
    "vi": "Người xung quanh nhận xét bạn là người thế nào?",
    "answer": "친구들은 제가 약속을 잘 지키는 사람이라고 합니다.",
    "meaning": "Bạn bè nói tôi là người giữ lời hứa.",
    "tip": "Dùng mẫu -(이)라고 하다 để thuật lại."
  },
  {
    "id": "iv51",
    "group": "Giới thiệu bản thân",
    "level": "Trung cấp",
    "ko": "살면서 가장 중요하게 생각하는 것은 무엇인가요?",
    "vi": "Bạn coi điều gì quan trọng nhất trong cuộc sống?",
    "answer": "저는 건강과 가족, 그리고 책임감을 중요하게 생각합니다.",
    "meaning": "Tôi coi trọng sức khỏe, gia đình và tinh thần trách nhiệm.",
    "tip": "Nói rõ ưu tiên và lý do."
  },
  {
    "id": "iv52",
    "group": "Giới thiệu bản thân",
    "level": "Trung cấp",
    "ko": "최근에 스스로 자랑스럽게 느낀 일이 있나요?",
    "vi": "Gần đây có điều gì khiến bạn tự hào về bản thân không?",
    "answer": "매일 꾸준히 공부해서 목표를 이룬 일이 가장 뿌듯했습니다.",
    "meaning": "Tôi tự hào nhất về việc học đều đặn và đạt mục tiêu.",
    "tip": "Đưa một ví dụ có thật và kết quả cụ thể."
  },
  {
    "id": "iv53",
    "group": "Học tập & tiếng Hàn",
    "level": "Cơ bản",
    "ko": "한국어 수업은 일주일에 몇 번 있어요?",
    "vi": "Bạn học tiếng Hàn mấy buổi một tuần?",
    "answer": "일주일에 세 번 한국어 수업을 듣습니다.",
    "meaning": "Tôi tham gia lớp tiếng Hàn ba buổi mỗi tuần.",
    "tip": "Dùng 번 cho số lần."
  },
  {
    "id": "iv54",
    "group": "Học tập & tiếng Hàn",
    "level": "Cơ bản",
    "ko": "어떤 한국어 교재를 사용하고 있어요?",
    "vi": "Bạn đang dùng giáo trình tiếng Hàn nào?",
    "answer": "지금은 초급 한국어 교재로 공부하고 있습니다.",
    "meaning": "Hiện tôi đang học bằng giáo trình tiếng Hàn sơ cấp.",
    "tip": "Nói tên sách thật nếu có."
  },
  {
    "id": "iv55",
    "group": "Học tập & tiếng Hàn",
    "level": "Cơ bản",
    "ko": "한국어 발음을 어떻게 연습해요?",
    "vi": "Bạn luyện phát âm tiếng Hàn thế nào?",
    "answer": "한국어를 듣고 따라 말하면서 연습합니다.",
    "meaning": "Tôi luyện bằng cách nghe và nói theo tiếng Hàn.",
    "tip": "Nêu cách luyện nghe và lặp lại."
  },
  {
    "id": "iv56",
    "group": "Học tập & tiếng Hàn",
    "level": "Cơ bản",
    "ko": "한국어 시험을 본 적이 있어요?",
    "vi": "Bạn từng thi tiếng Hàn chưa?",
    "answer": "네, 모의시험을 본 적이 있습니다.",
    "meaning": "Vâng, tôi từng làm bài thi thử.",
    "tip": "Phân biệt thi thử và thi chính thức."
  },
  {
    "id": "iv57",
    "group": "Học tập & tiếng Hàn",
    "level": "Trung cấp",
    "ko": "듣기 실력이 부족할 때 어떻게 공부하나요?",
    "vi": "Khi kỹ năng nghe yếu, bạn học ra sao?",
    "answer": "짧은 대화를 반복해서 듣고 내용을 정리합니다.",
    "meaning": "Tôi nghe lặp lại hội thoại ngắn và tóm tắt nội dung.",
    "tip": "Trả lời bằng các bước cụ thể."
  },
  {
    "id": "iv58",
    "group": "Học tập & tiếng Hàn",
    "level": "Trung cấp",
    "ko": "모르는 단어가 나오면 어떻게 하시나요?",
    "vi": "Khi gặp từ không biết, bạn làm gì?",
    "answer": "먼저 문맥으로 뜻을 추측하고 사전에서 확인합니다.",
    "meaning": "Trước tiên tôi đoán nghĩa qua ngữ cảnh rồi kiểm tra từ điển.",
    "tip": "Nêu hai bước liên tiếp."
  },
  {
    "id": "iv59",
    "group": "Học tập & tiếng Hàn",
    "level": "Trung cấp",
    "ko": "한국어로 발표해야 한다면 어떻게 준비하겠습니까?",
    "vi": "Nếu phải thuyết trình bằng tiếng Hàn, bạn chuẩn bị ra sao?",
    "answer": "핵심 내용을 정리하고 여러 번 소리 내어 연습하겠습니다.",
    "meaning": "Tôi sẽ tóm tắt ý chính rồi tập nói thành tiếng nhiều lần.",
    "tip": "Dùng lời hứa ở đuôi -겠습니다."
  },
  {
    "id": "iv60",
    "group": "Học tập & tiếng Hàn",
    "level": "Trung cấp",
    "ko": "한국어 실력이 늘었다고 느끼는 순간은 언제인가요?",
    "vi": "Khi nào bạn cảm thấy tiếng Hàn của mình tiến bộ?",
    "answer": "상대방의 말을 이해하고 자연스럽게 대답할 때입니다.",
    "meaning": "Đó là khi tôi hiểu lời người đối diện và trả lời tự nhiên.",
    "tip": "Dùng mẫu -을 때 để chỉ thời điểm."
  },
  {
    "id": "iv61",
    "group": "Học tập & tiếng Hàn",
    "level": "Trung cấp",
    "ko": "혼자 공부할 때 집중력을 어떻게 유지하나요?",
    "vi": "Bạn duy trì tập trung khi tự học thế nào?",
    "answer": "공부 시간을 정해 놓고 휴대전화를 멀리 둡니다.",
    "meaning": "Tôi đặt thời gian học cố định và để điện thoại xa.",
    "tip": "Gợi ý một thói quen học tập thực tế."
  },
  {
    "id": "iv62",
    "group": "Kinh nghiệm & công việc",
    "level": "Cơ bản",
    "ko": "하루에 몇 시간 일할 수 있어요?",
    "vi": "Bạn có thể làm việc mấy tiếng mỗi ngày?",
    "answer": "근무 조건에 맞춰 성실하게 일하겠습니다.",
    "meaning": "Tôi sẽ làm việc chăm chỉ theo điều kiện làm việc.",
    "tip": "Không cam kết thời lượng không phù hợp sức khỏe."
  },
  {
    "id": "iv63",
    "group": "Kinh nghiệm & công việc",
    "level": "Cơ bản",
    "ko": "컴퓨터를 사용할 줄 알아요?",
    "vi": "Bạn có biết sử dụng máy tính không?",
    "answer": "네, 기본적인 문서 작성과 인터넷 사용을 할 수 있습니다.",
    "meaning": "Vâng, tôi có thể soạn văn bản cơ bản và dùng Internet.",
    "tip": "Nói đúng kỹ năng thật của mình."
  },
  {
    "id": "iv64",
    "group": "Kinh nghiệm & công việc",
    "level": "Cơ bản",
    "ko": "어떤 업무를 가장 잘해요?",
    "vi": "Bạn làm tốt nhất công việc nào?",
    "answer": "저는 자료 정리와 일정 관리에 자신이 있습니다.",
    "meaning": "Tôi tự tin trong việc sắp xếp tài liệu và quản lý lịch trình.",
    "tip": "Chọn thế mạnh phù hợp vị trí ứng tuyển."
  },
  {
    "id": "iv65",
    "group": "Kinh nghiệm & công việc",
    "level": "Cơ bản",
    "ko": "전에 일한 곳은 어디예요?",
    "vi": "Bạn từng làm việc ở đâu?",
    "answer": "전에 작은 회사에서 일한 경험이 있습니다.",
    "meaning": "Trước đây tôi từng làm ở một công ty nhỏ.",
    "tip": "Nếu chưa có kinh nghiệm, nói thật."
  },
  {
    "id": "iv66",
    "group": "Kinh nghiệm & công việc",
    "level": "Trung cấp",
    "ko": "업무를 정확하게 처리하기 위해 무엇을 하나요?",
    "vi": "Bạn làm gì để xử lý công việc chính xác?",
    "answer": "시작하기 전에 지시 사항을 확인하고 끝난 뒤에 다시 점검합니다.",
    "meaning": "Tôi xác nhận chỉ dẫn trước khi bắt đầu và kiểm tra lại sau khi xong.",
    "tip": "Cấu trúc trước–sau giúp câu trả lời rõ ràng."
  },
  {
    "id": "iv67",
    "group": "Kinh nghiệm & công việc",
    "level": "Trung cấp",
    "ko": "반복적인 업무에도 집중할 수 있나요?",
    "vi": "Bạn có tập trung được với công việc lặp lại không?",
    "answer": "네, 작은 실수가 없도록 체크리스트를 사용합니다.",
    "meaning": "Có, tôi dùng danh sách kiểm tra để hạn chế lỗi nhỏ.",
    "tip": "Nêu biện pháp chống sai sót."
  },
  {
    "id": "iv68",
    "group": "Kinh nghiệm & công việc",
    "level": "Trung cấp",
    "ko": "야근이 필요하면 어떻게 하시겠어요?",
    "vi": "Nếu cần làm thêm giờ, bạn xử lý thế nào?",
    "answer": "근무 규정과 제 상황을 확인한 후 상의하겠습니다.",
    "meaning": "Tôi sẽ kiểm tra quy định và tình hình của mình rồi trao đổi.",
    "tip": "Không cần hứa làm thêm vô điều kiện."
  },
  {
    "id": "iv69",
    "group": "Kinh nghiệm & công việc",
    "level": "Trung cấp",
    "ko": "고객이 불만을 제기하면 어떻게 대응하나요?",
    "vi": "Nếu khách hàng phàn nàn, bạn xử lý thế nào?",
    "answer": "먼저 불편한 점을 듣고 해결 방법을 안내하겠습니다.",
    "meaning": "Tôi sẽ lắng nghe điều khách không hài lòng rồi hướng dẫn cách giải quyết.",
    "tip": "Luyện thứ tự lắng nghe–giải quyết."
  },
  {
    "id": "iv70",
    "group": "Điểm mạnh & kế hoạch",
    "level": "Cơ bản",
    "ko": "새로운 환경에 잘 적응하는 편인가요?",
    "vi": "Bạn có dễ thích nghi môi trường mới không?",
    "answer": "네, 먼저 규칙을 배우고 주변 사람들에게 질문합니다.",
    "meaning": "Có, tôi học quy định trước và hỏi những người xung quanh.",
    "tip": "Nêu hành động thực tế."
  },
  {
    "id": "iv71",
    "group": "Điểm mạnh & kế hoạch",
    "level": "Cơ bản",
    "ko": "시간 약속을 잘 지켜요?",
    "vi": "Bạn có giữ đúng giờ không?",
    "answer": "네, 약속 시간보다 조금 일찍 도착하려고 노력합니다.",
    "meaning": "Có, tôi cố gắng đến sớm hơn giờ hẹn một chút.",
    "tip": "Luyện -려고 노력하다."
  },
  {
    "id": "iv72",
    "group": "Điểm mạnh & kế hoạch",
    "level": "Cơ bản",
    "ko": "목표를 이루기 위해 매일 무엇을 해요?",
    "vi": "Mỗi ngày bạn làm gì để đạt mục tiêu?",
    "answer": "매일 작은 목표를 세우고 실천합니다.",
    "meaning": "Tôi lập mục tiêu nhỏ mỗi ngày và thực hiện.",
    "tip": "Nêu việc làm lặp lại."
  },
  {
    "id": "iv73",
    "group": "Điểm mạnh & kế hoạch",
    "level": "Trung cấp",
    "ko": "어려운 문제를 끝까지 해결한 경험이 있나요?",
    "vi": "Bạn từng kiên trì giải quyết vấn đề khó chưa?",
    "answer": "문제를 나누어 해결하면서 끝까지 포기하지 않았습니다.",
    "meaning": "Tôi chia nhỏ vấn đề để giải quyết và không bỏ cuộc.",
    "tip": "Thêm ví dụ cá nhân nếu có."
  },
  {
    "id": "iv74",
    "group": "Điểm mạnh & kế hoạch",
    "level": "Trung cấp",
    "ko": "자신의 실수를 인정하기 어려울 때 어떻게 하나요?",
    "vi": "Khi khó thừa nhận lỗi của mình, bạn làm gì?",
    "answer": "사실을 먼저 확인하고 잘못한 부분은 솔직하게 인정합니다.",
    "meaning": "Tôi kiểm tra sự thật trước và thẳng thắn nhận phần mình sai.",
    "tip": "Giọng bình tĩnh, trách nhiệm."
  },
  {
    "id": "iv75",
    "group": "Điểm mạnh & kế hoạch",
    "level": "Trung cấp",
    "ko": "동기 부여가 떨어질 때 어떻게 극복하나요?",
    "vi": "Khi thiếu động lực, bạn vượt qua thế nào?",
    "answer": "처음 목표를 떠올리고 작은 일부터 다시 시작합니다.",
    "meaning": "Tôi nhớ lại mục tiêu ban đầu và bắt đầu lại từ việc nhỏ.",
    "tip": "Dùng cụm -부터 다시 시작하다."
  },
  {
    "id": "iv76",
    "group": "Điểm mạnh & kế hoạch",
    "level": "Trung cấp",
    "ko": "어떤 분야에서 전문성을 키우고 싶으세요?",
    "vi": "Bạn muốn phát triển chuyên môn trong lĩnh vực nào?",
    "answer": "저는 언어 능력과 실무 능력을 함께 키우고 싶습니다.",
    "meaning": "Tôi muốn phát triển cả năng lực ngôn ngữ và công việc.",
    "tip": "Điều chỉnh theo ngành nghề."
  },
  {
    "id": "iv77",
    "group": "Điểm mạnh & kế hoạch",
    "level": "Trung cấp",
    "ko": "계획대로 일이 진행되지 않으면 어떻게 합니까?",
    "vi": "Khi công việc không diễn ra theo kế hoạch, bạn làm gì?",
    "answer": "원인을 확인하고 우선순위를 다시 정하겠습니다.",
    "meaning": "Tôi sẽ kiểm tra nguyên nhân và sắp xếp lại ưu tiên.",
    "tip": "Đề cập hành động điều chỉnh hợp lý."
  },
  {
    "id": "iv78",
    "group": "Tình huống tại nơi làm việc",
    "level": "Cơ bản",
    "ko": "작업 도구가 고장 나면 어떻게 하겠어요?",
    "vi": "Nếu dụng cụ làm việc hỏng, bạn sẽ làm gì?",
    "answer": "사용을 멈추고 담당자에게 바로 알리겠습니다.",
    "meaning": "Tôi sẽ ngừng sử dụng và báo ngay cho người phụ trách.",
    "tip": "Luôn ưu tiên an toàn."
  },
  {
    "id": "iv79",
    "group": "Tình huống tại nơi làm việc",
    "level": "Cơ bản",
    "ko": "보호 장비가 없으면 작업을 시작하겠습니까?",
    "vi": "Nếu thiếu đồ bảo hộ, bạn có bắt đầu làm không?",
    "answer": "아니요. 먼저 필요한 보호 장비를 요청하겠습니다.",
    "meaning": "Không. Tôi sẽ yêu cầu trang bị bảo hộ cần thiết trước.",
    "tip": "Không khuyến khích làm việc nguy hiểm."
  },
  {
    "id": "iv80",
    "group": "Tình huống tại nơi làm việc",
    "level": "Cơ bản",
    "ko": "동료가 도움을 요청하면 어떻게 해요?",
    "vi": "Nếu đồng nghiệp nhờ giúp, bạn làm gì?",
    "answer": "제 일을 확인한 후 도울 수 있는 부분을 돕겠습니다.",
    "meaning": "Tôi sẽ xem công việc của mình rồi giúp trong khả năng.",
    "tip": "Cân đối nhiệm vụ được giao."
  },
  {
    "id": "iv81",
    "group": "Tình huống tại nơi làm việc",
    "level": "Cơ bản",
    "ko": "근무 중 몸 상태가 좋지 않으면 어떻게 해요?",
    "vi": "Nếu không khỏe trong giờ làm, bạn làm gì?",
    "answer": "관리자에게 알리고 필요한 경우 진료를 받겠습니다.",
    "meaning": "Tôi sẽ báo quản lý và đi khám nếu cần.",
    "tip": "Không cố làm việc khi không an toàn."
  },
  {
    "id": "iv82",
    "group": "Tình huống tại nơi làm việc",
    "level": "Trung cấp",
    "ko": "상사가 서로 다른 지시를 내리면 어떻게 하시겠습니까?",
    "vi": "Nếu cấp trên đưa ra chỉ dẫn mâu thuẫn, bạn xử lý sao?",
    "answer": "지시 내용을 확인하고 우선순위를 여쭤보겠습니다.",
    "meaning": "Tôi sẽ xác nhận nội dung rồi hỏi thứ tự ưu tiên.",
    "tip": "Hỏi lại rõ ràng trước khi hành động."
  },
  {
    "id": "iv83",
    "group": "Tình huống tại nơi làm việc",
    "level": "Trung cấp",
    "ko": "안전사고를 목격하면 가장 먼저 무엇을 하겠습니까?",
    "vi": "Nếu chứng kiến tai nạn lao động, bạn làm gì đầu tiên?",
    "answer": "먼저 안전을 확보하고 즉시 관리자에게 알리겠습니다.",
    "meaning": "Trước tiên tôi bảo đảm an toàn và báo ngay cho quản lý.",
    "tip": "Thực hiện quy trình ứng cứu tại nơi làm việc."
  },
  {
    "id": "iv84",
    "group": "Tình huống tại nơi làm việc",
    "level": "Trung cấp",
    "ko": "작업 마감 시간에 맞추기 어려우면 어떻게 하나요?",
    "vi": "Nếu khó hoàn thành đúng hạn, bạn xử lý thế nào?",
    "answer": "진행 상황을 미리 알리고 도움이나 일정 조정을 요청합니다.",
    "meaning": "Tôi báo tiến độ sớm và đề nghị hỗ trợ hoặc điều chỉnh lịch.",
    "tip": "Báo sớm thay vì để quá hạn."
  },
  {
    "id": "iv85",
    "group": "Tình huống tại nơi làm việc",
    "level": "Trung cấp",
    "ko": "고객 정보가 잘못 전달되었다면 어떻게 바로잡겠습니까?",
    "vi": "Nếu thông tin khách hàng được truyền đạt sai, bạn sửa thế nào?",
    "answer": "잘못된 내용을 확인하고 담당자에게 즉시 정정하겠습니다.",
    "meaning": "Tôi sẽ xác nhận nội dung sai và đính chính ngay với người phụ trách.",
    "tip": "Tránh tiết lộ thông tin cá nhân không cần thiết."
  },
  {
    "id": "iv86",
    "group": "Cuộc sống tại Hàn Quốc",
    "level": "Cơ bản",
    "ko": "한국에 가면 어디에서 살고 싶어요?",
    "vi": "Nếu đến Hàn Quốc, bạn muốn sống ở đâu?",
    "answer": "회사나 학교와 가까운 곳에서 살고 싶습니다.",
    "meaning": "Tôi muốn ở gần công ty hoặc trường học.",
    "tip": "Trình bày tiêu chí thay vì địa điểm tùy tiện."
  },
  {
    "id": "iv87",
    "group": "Cuộc sống tại Hàn Quốc",
    "level": "Cơ bản",
    "ko": "한국 겨울 날씨를 알고 있어요?",
    "vi": "Bạn biết thời tiết mùa đông Hàn Quốc không?",
    "answer": "네, 겨울에는 추우니까 따뜻한 옷을 준비하겠습니다.",
    "meaning": "Có, mùa đông lạnh nên tôi sẽ chuẩn bị áo ấm.",
    "tip": "Nêu cách chuẩn bị phù hợp."
  },
  {
    "id": "iv88",
    "group": "Cuộc sống tại Hàn Quốc",
    "level": "Cơ bản",
    "ko": "한국에서 아플 때 어떻게 하겠어요?",
    "vi": "Khi bị ốm ở Hàn Quốc, bạn sẽ làm gì?",
    "answer": "병원에 가서 진료를 받겠습니다.",
    "meaning": "Tôi sẽ đến bệnh viện khám bệnh.",
    "tip": "Học thêm cách nói triệu chứng."
  },
  {
    "id": "iv89",
    "group": "Cuộc sống tại Hàn Quốc",
    "level": "Cơ bản",
    "ko": "한국 교통수단을 이용할 수 있어요?",
    "vi": "Bạn biết sử dụng phương tiện giao thông ở Hàn Quốc không?",
    "answer": "지하철과 버스 이용 방법을 배우고 있습니다.",
    "meaning": "Tôi đang học cách sử dụng tàu điện và xe buýt.",
    "tip": "Có thể kể phương tiện đã từng sử dụng."
  },
  {
    "id": "iv90",
    "group": "Cuộc sống tại Hàn Quốc",
    "level": "Trung cấp",
    "ko": "문화 차이 때문에 오해가 생기면 어떻게 하시겠습니까?",
    "vi": "Nếu xảy ra hiểu lầm do khác biệt văn hóa, bạn làm gì?",
    "answer": "상대방의 설명을 듣고 제 생각도 정중하게 말씀드리겠습니다.",
    "meaning": "Tôi lắng nghe giải thích của họ và trình bày ý mình một cách lịch sự.",
    "tip": "Tập dùng kính ngữ."
  },
  {
    "id": "iv91",
    "group": "Cuộc sống tại Hàn Quốc",
    "level": "Trung cấp",
    "ko": "한국에서 외로울 때 어떻게 극복할 생각인가요?",
    "vi": "Khi cô đơn ở Hàn Quốc, bạn dự định vượt qua thế nào?",
    "answer": "가족과 연락하고 취미 활동을 하면서 마음을 돌보겠습니다.",
    "meaning": "Tôi sẽ liên lạc gia đình và chăm sóc tinh thần bằng sở thích.",
    "tip": "Trả lời với thói quen lành mạnh."
  },
  {
    "id": "iv92",
    "group": "Cuộc sống tại Hàn Quốc",
    "level": "Trung cấp",
    "ko": "한국 생활에서 꼭 지키고 싶은 규칙은 무엇인가요?",
    "vi": "Quy tắc nào bạn muốn tuân thủ khi sống ở Hàn Quốc?",
    "answer": "교통 규칙과 공동생활 예절을 잘 지키고 싶습니다.",
    "meaning": "Tôi muốn tuân thủ luật giao thông và phép lịch sự chung.",
    "tip": "Nêu ví dụ cụ thể."
  },
  {
    "id": "iv93",
    "group": "Cuộc sống tại Hàn Quốc",
    "level": "Trung cấp",
    "ko": "한국인 친구를 사귀려면 어떤 노력이 필요할까요?",
    "vi": "Theo bạn cần cố gắng gì để kết bạn với người Hàn?",
    "answer": "한국어로 먼저 인사하고 서로의 문화를 존중해야 합니다.",
    "meaning": "Nên chủ động chào bằng tiếng Hàn và tôn trọng văn hóa nhau.",
    "tip": "Dùng -아/어야 하다 để nêu điều cần."
  },
  {
    "id": "iv94",
    "group": "Phỏng vấn EPS (tham khảo)",
    "level": "Cơ bản",
    "ko": "한국에서 맡은 일을 성실히 할 수 있습니까?",
    "vi": "Bạn có thể chăm chỉ làm công việc được giao ở Hàn Quốc không?",
    "answer": "네, 규칙을 지키며 책임감 있게 일하겠습니다.",
    "meaning": "Có, tôi sẽ tuân thủ quy tắc và làm việc có trách nhiệm.",
    "tip": "Chỉ cam kết trong phạm vi năng lực thực tế."
  },
  {
    "id": "iv95",
    "group": "Phỏng vấn EPS (tham khảo)",
    "level": "Cơ bản",
    "ko": "작업장에서는 어떤 보호 장비를 착용해야 합니까?",
    "vi": "Ở nơi làm việc phải mặc thiết bị bảo hộ nào?",
    "answer": "작업에 맞는 안전모와 보호 장비를 착용해야 합니다.",
    "meaning": "Phải đội mũ và mang thiết bị bảo hộ phù hợp công việc.",
    "tip": "Tuân thủ hướng dẫn của nơi làm việc."
  },
  {
    "id": "iv96",
    "group": "Phỏng vấn EPS (tham khảo)",
    "level": "Cơ bản",
    "ko": "근로계약서를 읽고 이해하겠습니까?",
    "vi": "Bạn sẽ đọc và hiểu hợp đồng lao động chứ?",
    "answer": "네, 중요한 조건을 확인하고 모르면 질문하겠습니다.",
    "meaning": "Vâng, tôi sẽ kiểm tra điều khoản quan trọng và hỏi khi chưa hiểu.",
    "tip": "Không ký khi chưa hiểu điều khoản."
  },
  {
    "id": "iv97",
    "group": "Phỏng vấn EPS (tham khảo)",
    "level": "Cơ bản",
    "ko": "일하다가 다치면 어떻게 하겠습니까?",
    "vi": "Nếu bị thương khi làm việc, bạn sẽ làm gì?",
    "answer": "즉시 일을 멈추고 관리자에게 알린 뒤 치료를 받겠습니다.",
    "meaning": "Tôi sẽ ngừng làm, báo quản lý ngay rồi điều trị.",
    "tip": "Ưu tiên an toàn và sơ cứu phù hợp."
  },
  {
    "id": "iv98",
    "group": "Phỏng vấn EPS (tham khảo)",
    "level": "Trung cấp",
    "ko": "한국의 산업안전 규정을 왜 알아야 합니까?",
    "vi": "Vì sao cần biết quy định an toàn lao động Hàn Quốc?",
    "answer": "사고를 예방하고 모두의 안전을 지키기 위해서입니다.",
    "meaning": "Để phòng tai nạn và bảo đảm an toàn cho mọi người.",
    "tip": "Nêu mục đích phòng ngừa."
  },
  {
    "id": "iv99",
    "group": "Phỏng vấn EPS (tham khảo)",
    "level": "Trung cấp",
    "ko": "업무 내용을 한국어로 이해하지 못하면 어떻게 하겠습니까?",
    "vi": "Nếu không hiểu công việc được giao bằng tiếng Hàn, bạn làm sao?",
    "answer": "정중하게 다시 설명해 달라고 요청하고 확인하겠습니다.",
    "meaning": "Tôi sẽ lịch sự nhờ giải thích lại và xác nhận nội dung.",
    "tip": "Không đoán mò khi có rủi ro an toàn."
  },
  {
    "id": "iv100",
    "group": "Phỏng vấn EPS (tham khảo)",
    "level": "Trung cấp",
    "ko": "한국에서 법과 규칙을 지키는 것이 왜 중요합니까?",
    "vi": "Vì sao việc tuân thủ luật và quy định ở Hàn Quốc quan trọng?",
    "answer": "안전하고 책임감 있게 생활하고 일하기 위해서입니다.",
    "meaning": "Để sống và làm việc an toàn, có trách nhiệm.",
    "tip": "Trả lời ngắn, rõ nguyên nhân."
  }
]
'@ | ConvertFrom-Json

$conversationExtra = @'
{
  "greetings": [
    {
      "ko": "오랜만이에요.",
      "vi": "Lâu rồi không gặp."
    },
    {
      "ko": "잘 지냈어요?",
      "vi": "Dạo này bạn khỏe không?"
    },
    {
      "ko": "덕분에 잘 지냈어요.",
      "vi": "Nhờ bạn mà tôi vẫn khỏe."
    },
    {
      "ko": "오늘 기분이 어때요?",
      "vi": "Hôm nay tâm trạng bạn thế nào?"
    },
    {
      "ko": "좋은 아침이에요.",
      "vi": "Chào buổi sáng."
    },
    {
      "ko": "편안한 밤 보내세요.",
      "vi": "Chúc bạn một đêm bình yên."
    },
    {
      "ko": "실례합니다.",
      "vi": "Xin phép / làm phiền một chút."
    },
    {
      "ko": "별말씀을요.",
      "vi": "Không có gì đâu ạ."
    },
    {
      "ko": "다음에 또 봐요.",
      "vi": "Hẹn gặp lại lần sau."
    },
    {
      "ko": "정말 반가워요.",
      "vi": "Thật vui khi gặp bạn."
    },
    {
      "ko": "조심해서 가세요.",
      "vi": "Bạn về cẩn thận nhé."
    }
  ],
  "self": [
    {
      "ko": "어디에서 오셨어요?",
      "vi": "Bạn đến từ đâu ạ?"
    },
    {
      "ko": "저는 스물다섯 살이에요.",
      "vi": "Tôi 25 tuổi."
    },
    {
      "ko": "제 직업은 회사원이에요.",
      "vi": "Nghề của tôi là nhân viên công ty."
    },
    {
      "ko": "한국에 온 지 한 달 됐어요.",
      "vi": "Tôi đến Hàn Quốc được một tháng rồi."
    },
    {
      "ko": "제 전공은 경영학이에요.",
      "vi": "Chuyên ngành của tôi là quản trị kinh doanh."
    },
    {
      "ko": "저는 음악 듣는 것을 좋아해요.",
      "vi": "Tôi thích nghe nhạc."
    },
    {
      "ko": "저는 가족과 함께 살아요.",
      "vi": "Tôi sống cùng gia đình."
    },
    {
      "ko": "저는 한국 문화를 좋아해요.",
      "vi": "Tôi yêu thích văn hóa Hàn Quốc."
    },
    {
      "ko": "휴일에는 운동을 해요.",
      "vi": "Ngày nghỉ tôi tập thể dục."
    },
    {
      "ko": "아직 한국어를 잘 못해요.",
      "vi": "Tôi chưa giỏi tiếng Hàn."
    },
    {
      "ko": "잘 부탁드려요.",
      "vi": "Mong bạn giúp đỡ."
    },
    {
      "ko": "제 소개는 여기까지입니다.",
      "vi": "Phần giới thiệu của tôi đến đây là hết."
    }
  ],
  "restaurant": [
    {
      "ko": "몇 분이세요?",
      "vi": "Quý khách đi mấy người ạ?"
    },
    {
      "ko": "두 명이에요.",
      "vi": "Chúng tôi có hai người."
    },
    {
      "ko": "자리 있어요?",
      "vi": "Còn chỗ ngồi không?"
    },
    {
      "ko": "예약했어요.",
      "vi": "Tôi đã đặt bàn."
    },
    {
      "ko": "추천 메뉴가 뭐예요?",
      "vi": "Món được đề xuất là món gì?"
    },
    {
      "ko": "이 음식에 고기가 들어가요?",
      "vi": "Món này có thịt không?"
    },
    {
      "ko": "알레르기가 있어서요.",
      "vi": "Vì tôi bị dị ứng."
    },
    {
      "ko": "반찬 좀 더 주세요.",
      "vi": "Cho tôi xin thêm món ăn kèm."
    },
    {
      "ko": "젓가락 하나 더 주세요.",
      "vi": "Cho tôi thêm một đôi đũa."
    },
    {
      "ko": "음식은 언제 나와요?",
      "vi": "Khi nào món ăn được mang ra?"
    },
    {
      "ko": "따로 계산할 수 있어요?",
      "vi": "Chúng tôi có thể thanh toán riêng không?"
    }
  ],
  "cafe": [
    {
      "ko": "주문하시겠어요?",
      "vi": "Quý khách muốn gọi món chứ ạ?"
    },
    {
      "ko": "라테 한 잔 주세요.",
      "vi": "Cho tôi một ly latte."
    },
    {
      "ko": "디카페인 커피 있어요?",
      "vi": "Có cà phê không caffeine không?"
    },
    {
      "ko": "샷 하나 추가해 주세요.",
      "vi": "Thêm cho tôi một shot espresso."
    },
    {
      "ko": "시럽은 조금만 넣어 주세요.",
      "vi": "Cho ít siro thôi nhé."
    },
    {
      "ko": "우유 대신 두유로 바꿀 수 있어요?",
      "vi": "Có thể đổi sữa thành sữa đậu nành không?"
    },
    {
      "ko": "얼음은 적게 넣어 주세요.",
      "vi": "Cho ít đá giúp tôi."
    },
    {
      "ko": "빨대 좀 주세요.",
      "vi": "Cho tôi xin ống hút."
    },
    {
      "ko": "주문한 음료가 아직 안 나왔어요.",
      "vi": "Đồ uống tôi gọi vẫn chưa ra."
    },
    {
      "ko": "매장에서 드시나요?",
      "vi": "Bạn dùng tại quán phải không?"
    },
    {
      "ko": "포장 부탁드려요.",
      "vi": "Nhờ đóng gói mang đi."
    },
    {
      "ko": "화장실은 어디에 있어요?",
      "vi": "Nhà vệ sinh ở đâu ạ?"
    }
  ],
  "shopping": [
    {
      "ko": "이거 입어 볼 수 있어요?",
      "vi": "Tôi có thể thử món này không?"
    },
    {
      "ko": "탈의실이 어디예요?",
      "vi": "Phòng thử đồ ở đâu?"
    },
    {
      "ko": "조금 작은 것 같아요.",
      "vi": "Có vẻ hơi nhỏ."
    },
    {
      "ko": "다른 사이즈를 보여 주세요.",
      "vi": "Cho tôi xem cỡ khác."
    },
    {
      "ko": "할인 중인가요?",
      "vi": "Món này đang giảm giá phải không?"
    },
    {
      "ko": "이건 새 상품인가요?",
      "vi": "Đây có phải hàng mới không?"
    },
    {
      "ko": "환불할 수 있어요?",
      "vi": "Tôi có thể hoàn tiền không?"
    },
    {
      "ko": "교환하고 싶어요.",
      "vi": "Tôi muốn đổi hàng."
    },
    {
      "ko": "현금으로 계산할게요.",
      "vi": "Tôi sẽ trả bằng tiền mặt."
    },
    {
      "ko": "영수증을 받을 수 있을까요?",
      "vi": "Tôi có thể lấy hóa đơn không?"
    },
    {
      "ko": "재고가 더 있나요?",
      "vi": "Còn hàng trong kho không?"
    },
    {
      "ko": "그냥 구경하고 있어요.",
      "vi": "Tôi chỉ đang xem thôi."
    }
  ],
  "directions": [
    {
      "ko": "실례지만 길 좀 물어볼게요.",
      "vi": "Xin lỗi, cho tôi hỏi đường một chút."
    },
    {
      "ko": "가장 가까운 역은 어디예요?",
      "vi": "Ga gần nhất ở đâu?"
    },
    {
      "ko": "이쪽으로 가면 돼요?",
      "vi": "Tôi đi hướng này có đúng không?"
    },
    {
      "ko": "횡단보도를 건너세요.",
      "vi": "Hãy qua vạch sang đường."
    },
    {
      "ko": "두 번째 골목에서 오른쪽으로 도세요.",
      "vi": "Rẽ phải ở ngõ thứ hai."
    },
    {
      "ko": "건물 바로 앞에 있어요.",
      "vi": "Nó nằm ngay trước tòa nhà."
    },
    {
      "ko": "반대편으로 가야 해요.",
      "vi": "Bạn phải đi về phía đối diện."
    },
    {
      "ko": "지도에서 보여 주실 수 있어요?",
      "vi": "Bạn có thể chỉ trên bản đồ không?"
    },
    {
      "ko": "걸어가도 돼요?",
      "vi": "Đi bộ tới đó được không?"
    },
    {
      "ko": "택시를 타는 게 빨라요?",
      "vi": "Đi taxi có nhanh hơn không?"
    },
    {
      "ko": "어느 출구로 나가야 해요?",
      "vi": "Tôi nên ra cửa số mấy?"
    },
    {
      "ko": "덕분에 찾았어요.",
      "vi": "Nhờ bạn mà tôi tìm được rồi."
    }
  ],
  "transport": [
    {
      "ko": "한 장 주세요.",
      "vi": "Cho tôi một vé."
    },
    {
      "ko": "어디에서 표를 사요?",
      "vi": "Mua vé ở đâu?"
    },
    {
      "ko": "막차가 몇 시예요?",
      "vi": "Chuyến cuối lúc mấy giờ?"
    },
    {
      "ko": "첫차가 언제 출발해요?",
      "vi": "Chuyến đầu khởi hành lúc nào?"
    },
    {
      "ko": "여기에서 갈아타나요?",
      "vi": "Tôi chuyển tuyến ở đây phải không?"
    },
    {
      "ko": "얼마나 기다려야 해요?",
      "vi": "Tôi phải chờ bao lâu?"
    },
    {
      "ko": "이번 역에서 내려야 해요.",
      "vi": "Tôi phải xuống ga này."
    },
    {
      "ko": "지하철이 많이 붐벼요.",
      "vi": "Tàu điện ngầm đông quá."
    },
    {
      "ko": "안전벨트를 매 주세요.",
      "vi": "Xin thắt dây an toàn."
    },
    {
      "ko": "기사님, 여기 세워 주세요.",
      "vi": "Bác tài, cho tôi dừng ở đây."
    },
    {
      "ko": "교통카드 잔액이 부족해요.",
      "vi": "Thẻ giao thông của tôi không đủ tiền."
    },
    {
      "ko": "표를 잘못 샀어요.",
      "vi": "Tôi mua nhầm vé rồi."
    }
  ],
  "everyday": [
    {
      "ko": "오늘 몇 시에 출근해요?",
      "vi": "Hôm nay bạn đi làm lúc mấy giờ?"
    },
    {
      "ko": "아직 아침을 안 먹었어요.",
      "vi": "Tôi vẫn chưa ăn sáng."
    },
    {
      "ko": "지금 출근 준비 중이에요.",
      "vi": "Tôi đang chuẩn bị đi làm."
    },
    {
      "ko": "빨래를 해야 해요.",
      "vi": "Tôi phải giặt đồ."
    },
    {
      "ko": "설거지는 제가 할게요.",
      "vi": "Để tôi rửa bát."
    },
    {
      "ko": "잠깐 산책할래요?",
      "vi": "Đi dạo một chút không?"
    },
    {
      "ko": "오늘은 일찍 잘 거예요.",
      "vi": "Hôm nay tôi sẽ ngủ sớm."
    },
    {
      "ko": "집에 가는 중이에요.",
      "vi": "Tôi đang trên đường về nhà."
    },
    {
      "ko": "오늘 저녁에 시간 있어요?",
      "vi": "Tối nay bạn có thời gian không?"
    },
    {
      "ko": "내일은 쉬는 날이에요.",
      "vi": "Ngày mai là ngày nghỉ."
    },
    {
      "ko": "너무 피곤해서 쉬고 싶어요.",
      "vi": "Tôi mệt quá nên muốn nghỉ."
    },
    {
      "ko": "이따가 연락할게요.",
      "vi": "Lát nữa tôi liên lạc nhé."
    }
  ],
  "school": [
    {
      "ko": "오늘 수업은 몇 시에 시작해요?",
      "vi": "Hôm nay lớp bắt đầu lúc mấy giờ?"
    },
    {
      "ko": "교실이 어디에 있어요?",
      "vi": "Phòng học ở đâu?"
    },
    {
      "ko": "책 몇 쪽을 펴야 해요?",
      "vi": "Phải mở sách trang mấy?"
    },
    {
      "ko": "칠판을 봐 주세요.",
      "vi": "Xin hãy nhìn lên bảng."
    },
    {
      "ko": "이 문장을 읽어 보세요.",
      "vi": "Hãy thử đọc câu này."
    },
    {
      "ko": "제 답이 맞아요?",
      "vi": "Đáp án của em đúng không ạ?"
    },
    {
      "ko": "발음을 고쳐 주세요.",
      "vi": "Xin sửa phát âm cho em."
    },
    {
      "ko": "친구와 같이 연습해요.",
      "vi": "Hãy luyện tập cùng bạn."
    },
    {
      "ko": "시험이 언제예요?",
      "vi": "Khi nào có bài kiểm tra?"
    },
    {
      "ko": "오늘 배운 문법이 어려워요.",
      "vi": "Ngữ pháp học hôm nay khó quá."
    },
    {
      "ko": "예문을 하나 더 보여 주세요.",
      "vi": "Cho xem thêm một câu ví dụ."
    },
    {
      "ko": "수업 끝나고 질문해도 돼요?",
      "vi": "Em hỏi sau giờ học được không ạ?"
    }
  ],
  "work": [
    {
      "ko": "오늘 회의는 몇 시예요?",
      "vi": "Cuộc họp hôm nay lúc mấy giờ?"
    },
    {
      "ko": "작업을 시작해도 될까요?",
      "vi": "Tôi bắt đầu công việc được chưa ạ?"
    },
    {
      "ko": "먼저 무엇을 해야 하나요?",
      "vi": "Tôi nên làm gì trước?"
    },
    {
      "ko": "이 부분을 확인해 주세요.",
      "vi": "Xin kiểm tra phần này."
    },
    {
      "ko": "작업이 조금 늦어지고 있어요.",
      "vi": "Công việc đang bị chậm một chút."
    },
    {
      "ko": "잠시 쉬어도 될까요?",
      "vi": "Tôi nghỉ một lát được không ạ?"
    },
    {
      "ko": "문제가 생겼습니다.",
      "vi": "Đã phát sinh vấn đề."
    },
    {
      "ko": "필요한 물건이 부족해요.",
      "vi": "Thiếu vật dụng cần thiết."
    },
    {
      "ko": "이 장비는 어떻게 사용해요?",
      "vi": "Thiết bị này dùng thế nào?"
    },
    {
      "ko": "오늘까지 끝내겠습니다.",
      "vi": "Tôi sẽ hoàn thành trong hôm nay."
    },
    {
      "ko": "퇴근해도 될까요?",
      "vi": "Tôi có thể tan làm được chưa?"
    },
    {
      "ko": "수고하셨습니다.",
      "vi": "Anh/chị đã vất vả rồi ạ."
    }
  ],
  "phone": [
    {
      "ko": "누구를 찾으세요?",
      "vi": "Bạn muốn gặp ai qua điện thoại?"
    },
    {
      "ko": "잠시 바꿔 드릴게요.",
      "vi": "Tôi sẽ chuyển máy cho bạn một lát."
    },
    {
      "ko": "지금 자리에 안 계세요.",
      "vi": "Hiện người ấy không có mặt."
    },
    {
      "ko": "전화 잘못 거셨어요.",
      "vi": "Bạn gọi nhầm số rồi."
    },
    {
      "ko": "다시 말씀해 주시겠어요?",
      "vi": "Bạn nói lại giúp tôi được không?"
    },
    {
      "ko": "끊지 말고 기다려 주세요.",
      "vi": "Xin đừng cúp máy, hãy chờ một chút."
    },
    {
      "ko": "통화 중이에요.",
      "vi": "Máy đang bận."
    },
    {
      "ko": "목소리가 끊겨요.",
      "vi": "Giọng bị ngắt quãng."
    },
    {
      "ko": "나중에 연락드리겠습니다.",
      "vi": "Tôi sẽ liên lạc lại sau ạ."
    },
    {
      "ko": "메시지를 남겨 주세요.",
      "vi": "Xin để lại lời nhắn."
    },
    {
      "ko": "영상 통화할까요?",
      "vi": "Chúng ta gọi video nhé?"
    },
    {
      "ko": "전화 주셔서 감사합니다.",
      "vi": "Cảm ơn bạn đã gọi điện."
    }
  ],
  "home": [
    {
      "ko": "이 집은 몇 평이에요?",
      "vi": "Căn nhà này rộng bao nhiêu pyeong?"
    },
    {
      "ko": "관리비가 포함되어 있나요?",
      "vi": "Đã bao gồm phí quản lý chưa?"
    },
    {
      "ko": "전기 요금은 따로 내나요?",
      "vi": "Tiền điện trả riêng phải không?"
    },
    {
      "ko": "인터넷이 설치되어 있어요?",
      "vi": "Đã lắp Internet chưa?"
    },
    {
      "ko": "언제 입주할 수 있어요?",
      "vi": "Khi nào tôi có thể chuyển vào?"
    },
    {
      "ko": "집주인과 이야기하고 싶어요.",
      "vi": "Tôi muốn trao đổi với chủ nhà."
    },
    {
      "ko": "난방이 잘 안 돼요.",
      "vi": "Hệ thống sưởi không hoạt động tốt."
    },
    {
      "ko": "수도꼭지가 새요.",
      "vi": "Vòi nước bị rò rỉ."
    },
    {
      "ko": "문이 잘 안 잠겨요.",
      "vi": "Cửa không khóa được tốt."
    },
    {
      "ko": "택배가 도착했어요.",
      "vi": "Bưu kiện đã được giao đến."
    },
    {
      "ko": "집을 청소해야 해요.",
      "vi": "Tôi phải dọn nhà."
    },
    {
      "ko": "옆집이 너무 시끄러워요.",
      "vi": "Nhà bên cạnh ồn quá."
    }
  ],
  "hospital": [
    {
      "ko": "어디가 아프세요?",
      "vi": "Bạn đau ở đâu ạ?"
    },
    {
      "ko": "목이 아파요.",
      "vi": "Tôi bị đau họng."
    },
    {
      "ko": "기침이 계속 나요.",
      "vi": "Tôi ho liên tục."
    },
    {
      "ko": "어제부터 아팠어요.",
      "vi": "Tôi đau từ hôm qua."
    },
    {
      "ko": "약을 먹어도 낫지 않아요.",
      "vi": "Uống thuốc rồi vẫn không đỡ."
    },
    {
      "ko": "진료를 받고 싶어요.",
      "vi": "Tôi muốn được khám bệnh."
    },
    {
      "ko": "보험이 적용되나요?",
      "vi": "Có được áp dụng bảo hiểm không?"
    },
    {
      "ko": "약은 하루에 몇 번 먹어요?",
      "vi": "Mỗi ngày uống thuốc mấy lần?"
    },
    {
      "ko": "부작용이 있나요?",
      "vi": "Có tác dụng phụ không?"
    },
    {
      "ko": "식사 후에 먹어야 해요?",
      "vi": "Có phải uống sau bữa ăn không?"
    },
    {
      "ko": "응급실이 어디예요?",
      "vi": "Phòng cấp cứu ở đâu?"
    },
    {
      "ko": "조금 나아졌어요.",
      "vi": "Tôi đã đỡ hơn một chút."
    }
  ],
  "travel": [
    {
      "ko": "예약 번호를 알려 드릴게요.",
      "vi": "Tôi sẽ cung cấp mã đặt phòng."
    },
    {
      "ko": "조식이 포함되어 있나요?",
      "vi": "Đã bao gồm bữa sáng chưa?"
    },
    {
      "ko": "방을 바꿀 수 있을까요?",
      "vi": "Tôi có thể đổi phòng không?"
    },
    {
      "ko": "와이파이는 무료예요?",
      "vi": "Wi-Fi có miễn phí không?"
    },
    {
      "ko": "짐을 잠깐 맡아 주세요.",
      "vi": "Xin giữ hộ hành lý một chút."
    },
    {
      "ko": "관광안내소가 어디예요?",
      "vi": "Trung tâm thông tin du lịch ở đâu?"
    },
    {
      "ko": "이곳은 몇 시까지 열어요?",
      "vi": "Chỗ này mở đến mấy giờ?"
    },
    {
      "ko": "사진을 찍어도 돼요?",
      "vi": "Có được chụp ảnh không?"
    },
    {
      "ko": "한국어 안내문이 어려워요.",
      "vi": "Bảng hướng dẫn tiếng Hàn khó hiểu."
    },
    {
      "ko": "근처 맛집을 추천해 주세요.",
      "vi": "Giới thiệu quán ăn ngon gần đây giúp tôi."
    },
    {
      "ko": "버스 투어를 예약하고 싶어요.",
      "vi": "Tôi muốn đặt tour xe buýt."
    },
    {
      "ko": "정말 좋은 여행이었어요.",
      "vi": "Đó là một chuyến đi rất tuyệt."
    }
  ],
  "interview": [
    {
      "ko": "지원하신 이유가 무엇입니까?",
      "vi": "Lý do bạn ứng tuyển là gì?"
    },
    {
      "ko": "이 일을 배우고 싶어서 지원했습니다.",
      "vi": "Tôi ứng tuyển vì muốn học công việc này."
    },
    {
      "ko": "언제부터 근무할 수 있습니까?",
      "vi": "Bạn có thể đi làm từ khi nào?"
    },
    {
      "ko": "저는 다음 주부터 일할 수 있습니다.",
      "vi": "Tôi có thể bắt đầu làm từ tuần sau."
    },
    {
      "ko": "자신의 단점은 무엇인가요?",
      "vi": "Điểm yếu của bạn là gì?"
    },
    {
      "ko": "모르는 것은 바로 질문하겠습니다.",
      "vi": "Điều gì không biết tôi sẽ hỏi ngay."
    },
    {
      "ko": "협업 경험이 있습니까?",
      "vi": "Bạn có kinh nghiệm làm việc nhóm không?"
    },
    {
      "ko": "책임감을 가지고 일하겠습니다.",
      "vi": "Tôi sẽ làm việc có trách nhiệm."
    },
    {
      "ko": "어려운 상황을 어떻게 해결했나요?",
      "vi": "Bạn đã xử lý tình huống khó thế nào?"
    },
    {
      "ko": "항상 시간을 잘 지킵니다.",
      "vi": "Tôi luôn giữ đúng giờ."
    },
    {
      "ko": "질문이 있으십니까?",
      "vi": "Bạn có câu hỏi nào không ạ?"
    },
    {
      "ko": "배울 기회를 주시면 감사하겠습니다.",
      "vi": "Tôi rất biết ơn nếu được trao cơ hội học hỏi."
    }
  ],
  "bank": [
    {
      "ko": "현금을 인출하고 싶어요.",
      "vi": "Tôi muốn rút tiền mặt."
    },
    {
      "ko": "여기에서 환전할 수 있어요?",
      "vi": "Có thể đổi ngoại tệ ở đây không?"
    },
    {
      "ko": "송금 확인서를 받을 수 있어요?",
      "vi": "Tôi có thể lấy giấy xác nhận chuyển tiền không?"
    },
    {
      "ko": "카드를 잃어버렸어요.",
      "vi": "Tôi làm mất thẻ rồi."
    },
    {
      "ko": "카드를 정지해 주세요.",
      "vi": "Xin khóa thẻ giúp tôi."
    },
    {
      "ko": "인터넷뱅킹을 신청하고 싶어요.",
      "vi": "Tôi muốn đăng ký ngân hàng trực tuyến."
    },
    {
      "ko": "우편번호가 뭐예요?",
      "vi": "Mã bưu chính là gì?"
    },
    {
      "ko": "등기로 보내 주세요.",
      "vi": "Xin gửi thư bảo đảm."
    },
    {
      "ko": "배송 조회를 하고 싶어요.",
      "vi": "Tôi muốn tra cứu vận chuyển."
    },
    {
      "ko": "주소를 잘못 적었어요.",
      "vi": "Tôi ghi sai địa chỉ rồi."
    },
    {
      "ko": "해외로 보낼 수 있어요?",
      "vi": "Có gửi ra nước ngoài được không?"
    },
    {
      "ko": "얼마나 걸릴까요?",
      "vi": "Sẽ mất khoảng bao lâu?"
    }
  ]
}
'@ | ConvertFrom-Json

function Read-Utf8([string]$path) {
  return [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
}
function Write-IfChanged([string]$path, [string]$newText) {
  $before = Read-Utf8 $path
  if ($before -ceq $newText) {
    Write-Host "Da dung, khong thay doi: $(Split-Path $path -Leaf)"
    return
  }
  $backup = "$path.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
  [System.IO.File]::Copy($path, $backup, $false)
  [System.IO.File]::WriteAllText($path, $newText, $utf8)
  Write-Host "Da cap nhat: $(Split-Path $path -Leaf); sao luu: $(Split-Path $backup -Leaf)"
}

# Home: chi thay anh trong .hero-banner, khong thay logo o header/favicon.
$homeHtml = Read-Utf8 $homePath
$coverPattern = '(?s)(<div\s+class=["'']hero-banner["''][^>]*>.*?<img\s+[^>]*?src=["''])[^"'']+(["''])'
if (-not [regex]::IsMatch($homeHtml, $coverPattern)) {
  throw 'Khong tim thay anh bia trong .hero-banner cua index.html. Khong sua de tranh thay nham logo.'
}
$homeHtml = [regex]::Replace($homeHtml, $coverPattern, '${1}images/logo2.png${2}', [System.Text.RegularExpressions.RegexOptions]::None)
# Giu nguyen logo dau trang va favicon la logo.png.
$homeHtml = [regex]::Replace($homeHtml, '(<link[^>]*rel=["'']icon["''][^>]*href=["''])images/logo2\.(png|webp|jpg)(["''])', '${1}images/logo.png${3}', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$homeHtml = [regex]::Replace($homeHtml, '(<a\s+class=["'']brand["''][^>]*>\s*<img\s+[^>]*?src=["''])images/logo2\.(png|webp|jpg)(["''])', '${1}images/logo.png${3}', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
# Bo kich thuoc 1536x592 cu tren anh bia moi (chi image logo2), de anh giu ty le goc.
$homeHtml = [regex]::Replace($homeHtml, '(src=["'']images/logo2\.png["''])\s+width=["'']\d+["'']\s+height=["'']\d+["'']', '${1}', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
Write-IfChanged $homePath $homeHtml
$logo2 = Join-Path $project 'images\logo2.png'
if (-not (Test-Path -LiteralPath $logo2 -PathType Leaf)) {
  Write-Warning 'Chua co images/logo2.png. Hay chep anh bia logo2.png vao thu muc images truoc khi git push.'
}

# Interview: preserve existing questions, append only missing Korean questions.
$intHtml = Read-Utf8 $interviewPath
$pattern = 'const\s+BANK\s*=\s*(\[[^\r\n]*\])\s*;'
$match = [regex]::Match($intHtml, $pattern)
if (-not $match.Success) { throw 'Khong tim thay const BANK=[...] trong on-luyen-phong-van.html; khong sua.' }
$bank = @($match.Groups[1].Value | ConvertFrom-Json)
$known = @{}
foreach ($q in $bank) { $known[[string]$q.ko] = $true }
foreach ($q in $interviewExtra) {
  if (-not $known.ContainsKey([string]$q.ko) -and $bank.Count -lt 100) {
    $ids = @{}; foreach($old in $bank) { $ids[[string]$old.id] = $true }
    $id = [string]$q.id
    if ($ids.ContainsKey($id)) {
      $candidate = 101
      while($ids.ContainsKey("iv$candidate")) { $candidate++ }
      $id = "iv$candidate"
    }
    $fresh = [pscustomobject]@{ id=$id; group=$q.group; level=$q.level; ko=$q.ko; vi=$q.vi; answer=$q.answer; meaning=$q.meaning; tip=$q.tip }
    $bank += $fresh
    $known[[string]$q.ko] = $true
  }
}
if ($bank.Count -lt 100) { throw "Ngan hang phong van chi co $($bank.Count) cau; giu nguyen de tranh sai du lieu." }
$bankJson = ConvertTo-Json -InputObject @($bank) -Depth 12 -Compress
$intHtml = $intHtml.Remove($match.Groups[1].Index, $match.Groups[1].Length).Insert($match.Groups[1].Index, $bankJson)
# Make correct total count dynamic in existing counters, if such text exists.
$intHtml = $intHtml.Replace('44 câu hỏi', '100 câu hỏi').Replace('44 câu', '100 câu').Replace('0/44', '0/100').Replace('1/44', '1/100')
Write-IfChanged $interviewPath $intHtml
Write-Host "Phong van: $($bank.Count) cau."

# Conversation: each of the existing 16 topic groups gets at least 20 phrases.
$convHtml = Read-Utf8 $conversationPath
$pattern2 = 'const\s+TOPICS\s*=\s*(\[[^\r\n]*\])\s*;'
$match2 = [regex]::Match($convHtml, $pattern2)
if (-not $match2.Success) { throw 'Khong tim thay const TOPICS=[...] trong giao-tiep-theo-chu-de.html; khong sua.' }
$topics = @($match2.Groups[1].Value | ConvertFrom-Json)
if ($topics.Count -lt 16) { throw "Thieu chu de: $($topics.Count)/16. Khong sua de tranh loi." }
foreach ($topic in $topics) {
  $items = @($topic.items)
  $knownPhrases = @{}
  foreach ($item in $items) { $knownPhrases[[string]$item.ko] = $true }
  $extra = $conversationExtra.($topic.id)
  if ($null -eq $extra) { continue }
  $nextNumber = $items.Count + 1
  foreach ($entry in $extra) {
    if ($items.Count -ge 20) { break }
    if ($knownPhrases.ContainsKey([string]$entry.ko)) { continue }
    $items += [pscustomobject]@{ id = "$($topic.id)-$nextNumber"; ko = [string]$entry.ko; vi = [string]$entry.vi }
    $knownPhrases[[string]$entry.ko] = $true
    $nextNumber++
  }
  if ($items.Count -lt 20) { throw "Chu de $($topic.id) chi co $($items.Count) cau; giu nguyen de tranh sai." }
  $topic.items = @($items)
}
$topicsJson = ConvertTo-Json -InputObject @($topics) -Depth 15 -Compress
$convHtml = $convHtml.Remove($match2.Groups[1].Index, $match2.Groups[1].Length).Insert($match2.Groups[1].Index, $topicsJson)
Write-IfChanged $conversationPath $convHtml
$totalPhrases = 0; foreach($t in $topics) { $totalPhrases += @($t.items).Count }
Write-Host "Giao tiep: $($topics.Count) chu de, $totalPhrases mau cau."
Write-Host ''
Write-Host 'HOAN TAT! Da giu images/logo.png; doi anh bia sang images/logo2.png.'
Write-Host 'Chay Live Server de kiem tra. Sau do: git add index.html on-luyen-phong-van.html giao-tiep-theo-chu-de.html images/logo2.png'
