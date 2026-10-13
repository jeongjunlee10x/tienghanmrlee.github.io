/* MR LEE TOPIK V7 — all question texts are independently authored learning examples.
   Not an official TOPIK paper or official audio. */
(function(global){'use strict';
const PBT={1:{listening:30,reading:40,writing:0,minutes:100},2:{listening:50,reading:50,writing:4,minutes:180}};
const IBT={1:{listening:26,reading:26,writing:0,minutes:70},2:{listening:30,reading:30,writing:3,minutes:125}};
const phases=[
{name:'Nhận diện cấu trúc & kiến thức nền',from:1,to:10},
{name:'Nắm dạng đề & kỹ thuật giải',from:11,to:20},
{name:'Suy luận và quản lý thời gian',from:21,to:30},
{name:'Chữa đề, giảm lỗi sai',from:31,to:40},
{name:'Tăng tốc, xử lý câu khó',from:41,to:50},
{name:'Tổng ôn & thi thử',from:51,to:60}];
const topicsI=[
'Kiểm tra đầu vào và nhận diện nhóm câu hỏi','Phân tích cấu trúc đề, chia thời gian','Nghe tranh, hành động và địa điểm','Nghe câu hỏi – chọn câu đáp','Đọc biển báo và thông báo ngắn','Trợ từ, thời điểm và đuôi câu','Nghe hội thoại, tìm từ khóa','Đọc điền từ thích hợp','Loại trừ đáp án gây nhiễu','Kiểm tra nhỏ và chữa lỗi',
'Nghe thời gian, địa điểm, số lượng','Nghe xác định câu đúng/sai','Đọc thông báo, quảng cáo','Đọc chọn câu phù hợp ngữ cảnh','Phân biệt đáp án gần nghĩa','Nghe đối thoại dài hơn','Đọc đoạn ngắn và ý chính','Luyện tốc độ đọc','Chữa các dạng thường sai','Kiểm tra nghe và đọc từng phần',
'Nghe tìm thông tin quyết định','Đọc tìm chủ đề và ý chính','Đoán nghĩa từ trong đoạn văn','Phân tích câu dễ nhầm','Ôn từ vựng và trợ từ','Nghe giới hạn thời gian','Đọc giới hạn thời gian','Luyện đề ngắn có chữa giải thích','Tổng hợp lỗi cá nhân','Thi thử rút gọn giữa lộ trình',
'Chữa bài đánh giá lần 1','Ôn các mẫu câu nghe sai','Ôn các đoạn đọc sai','Nghe theo điểm yếu','Đọc theo điểm yếu','Luyện theo nhịp đề nghe PBT/IBT','Luyện theo nhịp đề đọc PBT/IBT','Từ vựng qua câu đã sai','Kiểm tra tổng hợp','Thi thử rút gọn lần 2',
'Phân tích lỗi thi thử lần 2','Nghe khó và bẫy đổi ý','Đọc khó và thông tin nhiễu','Luyện đáp án đồng nghĩa','Nghe nhanh nhưng chính xác','Ôn các từ thường nhầm','Ôn các dạng ngữ pháp yếu','Nghe theo chủ đề','Đọc theo chủ đề','Đánh giá lần 3',
'Chữa sai theo nguyên nhân','Ôn nghe nhóm lỗi nhiều nhất','Ôn đọc nhóm lỗi nhiều nhất','Tổng ôn từ vựng/điểm ngữ pháp','Đề mô phỏng rút gọn','Chữa đề và sổ tay sai','Luyện đúng kỹ năng yếu','Ôn nhẹ và nhận diện từ khóa','Chuẩn bị chiến lược ngày thi','Đánh giá và tổng kết lộ trình'];
const topicsII=[
'Chẩn đoán nghe, đọc và viết','Cấu trúc đề, phân bổ thời gian','Nghe tình huống và nội dung chính','Nghe mục đích và ý định người nói','Đọc tiêu đề, quảng cáo, thông báo','Từ nối: nguyên nhân – kết quả','Nghe thái độ và lập trường','Ngữ pháp trong ngữ cảnh','Viết PBT câu 51: điền thông tin','Kiểm tra nhỏ & chữa lỗi',
'Nghe xác định quan hệ và chủ đề','Nghe quan điểm và căn cứ','Đọc xác định luận điểm chính','Sắp xếp mạch câu đúng','Phân tích bẫy từ đồng nghĩa','Nghe bài nói và phỏng vấn','Đọc suy luận thái độ tác giả','Viết PBT câu 52: logic đoạn văn','Ôn câu 51–52 theo ngữ cảnh','Kiểm tra kỹ năng tổng hợp',
'Nghe thái độ qua chuyển ý','Đọc chủ đề và câu trung tâm','Suy nghĩa từ theo văn cảnh','Đọc thứ tự câu và từ nối','Viết PBT câu 53: đọc dữ liệu','Viết câu 53: so sánh số liệu','Viết câu 53: kết luận theo chứng cứ','Viết PBT câu 54: lên dàn ý','Viết câu 54: luận cứ và ví dụ','Đánh giá giữa lộ trình',
'Chữa lỗi đánh giá giữa kỳ','Chữa câu 51–54 theo cấu trúc','Viết câu 54: mở bài đúng đề','Viết câu 54: phát triển luận điểm','Viết câu 54: phản biện và kết luận','Luyện nghe bài nói dài','Luyện đọc bài nhiều đoạn','Sửa câu 53, dùng số liệu chính xác','Sửa câu 54, liên kết logic','Đánh giá năng lực lần 2',
'Chữa lỗi năng lực lần 2','Nghe ý ngầm, phân biệt lời dẫn','Đọc đoạn dài và lập luận','Suy luận quan điểm trong bối cảnh','Viết câu 51–52 giới hạn thời gian','Viết câu 53 có đồng hồ','Viết câu 54 có đồng hồ','Chữa bài 53–54 theo rubric','Phối hợp nghe, đọc, viết','Đánh giá năng lực lần 3',
'Phân tích lỗi đánh giá lần 3','Ôn nghe nhóm lỗi nhiều nhất','Ôn đọc nhóm lỗi nhiều nhất','Tổng ôn mạch viết câu 51–54','Đề mô phỏng rút gọn','Chữa đề và sửa lập luận','Ôn chiến thuật theo kỹ năng','Luyện nhẹ bài viết yếu nhất','Tổng kết chiến thuật vào phòng thi','Đánh giá cuối lộ trình'];
// Authors' original exercises. correct: zero-based position, not exam numbering.
const IListen=[
['오늘은 월요일이에요. 내일은 화요일이에요.','내일은 무슨 요일입니까?',['일요일','화요일','목요일','토요일'],1,'내일은 화요일이에요 → ngày mai là thứ Ba.','Tìm từ 내일 trước, sau đó nghe tên thứ.'],
['여자: 사과가 얼마예요? 남자: 한 개에 이천 원이에요.','사과 한 개는 얼마입니까?',['천 원','이천 원','삼천 원','오천 원'],1,'한 개에 이천 원 nghĩa là 2.000 won một quả.','Nghe số lượng trước, đơn giá sau.'],
['여자: 어디에 가요? 남자: 도서관에 가요. 책을 빌릴 거예요.','남자는 어디에 갑니까?',['학교','은행','도서관','병원'],2,'Đến thư viện để mượn sách.','Phân biệt địa điểm và mục đích.'],
['남자: 지금 몇 시예요? 여자: 세 시 반이에요.','지금 몇 시입니까?',['두 시','세 시 반','네 시','다섯 시 반'],1,'세 시 반 = 3 giờ 30.','반 là nửa giờ; nghe giờ trước.'],
['여자: 주말에 뭐 했어요? 남자: 친구하고 영화를 봤어요.','남자는 주말에 무엇을 했습니까?',['영화를 봤어요','운동했어요','책을 샀어요','요리했어요'],0,'영화를 봤어요 = đã xem phim.','Phân biệt động từ cuối câu.'],
['남자: 여기에서 사진을 찍어도 돼요? 여자: 아니요, 사진을 찍으면 안 돼요.','이곳에서 무엇을 하면 안 됩니까?',['물 마시기','사진 찍기','책 읽기','앉기'],1,'찍으면 안 돼요 = không được chụp ảnh.','Tìm 안 돼요 (cấm).'],
['여자: 약속이 몇 시예요? 남자: 여섯 시예요. 그런데 저는 일곱 시에 도착할 것 같아요.','남자는 몇 시에 도착할 것 같습니까?',['다섯 시','여섯 시','일곱 시','여덟 시'],2,'Thời gian cuộc hẹn là 6 giờ; đến nơi dự kiến lúc 7 giờ.','Cẩn thận bẫy hai thời điểm.'],
['남자: 이 버스가 서울역에 가요? 여자: 아니요. 반대쪽에서 타세요.','여자는 남자에게 무엇을 하라고 말합니까?',['여기에서 기다리세요','반대쪽에서 타세요','택시를 타세요','걸어가세요'],1,'Đi xe buýt ở phía đối diện.','Tập trung vào câu hướng dẫn sau 아니요.'],
['여자: 감기에 걸려서 오늘 학교에 못 갔어요.','여자는 왜 학교에 못 갔습니까?',['시간이 없어서','비가 와서','아파서','시험이 있어서'],2,'감기에 걸리다 = bị cảm, nên không đi học.','Vì sao: tìm cụm -아서/어서.'],
['남자: 점심에 같이 식사할까요? 여자: 좋아요. 그런데 열두 시에는 수업이 있어요. 한 시에 만나요.','두 사람은 몇 시에 만납니까?',['열두 시','한 시','두 시','세 시'],1,'Đồng ý ăn trưa nhưng hẹn 1 giờ.','Đáp án nằm sau 그런데, không phải thời gian đầu.'],
['여자: 어제는 비가 왔지만 오늘은 날씨가 맑아요.','오늘 날씨는 어떻습니까?',['비가 와요','눈이 와요','맑아요','추워요'],2,'어제 비, 오늘 맑음.','Từ nhưng 지만 báo đổi thông tin.'],
['남자: 커피 말고 따뜻한 차를 주세요.','남자는 무엇을 주문합니까?',['커피','따뜻한 차','찬물','우유'],1,'말고 loại trừ cà phê, chọn trà nóng.','Cẩn thận thông tin bị phủ định.']];
const IRead=[
['토요일과 일요일에는 쉽니다.','이 가게는 언제 쉽니까?',['월요일','화요일','수요일','주말'],3,'토요일 + 일요일 = cuối tuần.','Nhận diện thời gian nghỉ.'],
['도서관에서는 조용히 하세요.','어떤 행동이 맞습니까?',['큰 소리로 말해요','조용히 해요','음식을 먹어요','노래해요'],1,'조용히 하세요 = hãy giữ yên lặng.','Đọc động từ yêu cầu.'],
['저는 한국어를 공부합니다. 매일 책을 읽고 단어를 외웁니다.','이 사람은 무엇을 매일 합니까?',['운전해요','단어를 외워요','여행해요','운동해요'],1,'Đoạn văn nêu mỗi ngày đọc sách và học thuộc từ.','Chỉ chọn điều xuất hiện trong đoạn.'],
['마트는 오전 아홉 시에 문을 열고 오후 아홉 시에 문을 닫습니다.','마트는 언제 문을 닫습니까?',['오전 아홉 시','정오','오후 여섯 시','오후 아홉 시'],3,'오후 아홉 시 = 9 giờ tối.','Tìm 닫습니다 chứ không phải 엽니다.'],
['친구에게 선물을 사려고 백화점에 갔어요.','왜 백화점에 갔습니까?',['선물을 사려고','운동하려고','밥을 먹으려고','영화를 보려고'],0,'-려고 diễn tả mục đích mua quà.','Khi hỏi 왜, tìm mục đích hoặc nguyên nhân.'],
['오늘은 매우 바빠서 내일 전화하겠습니다.','언제 전화할 것입니까?',['어제','오늘','내일','모레'],2,'내일 전화하겠습니다 = sẽ gọi ngày mai.','Không nhầm hôm nay bận với thời điểm gọi.'],
['약은 식사 후에 하루에 두 번 드세요.','약은 언제 먹어야 합니까?',['식사 전','식사 후','잠자기 전','운동 중'],1,'식사 후 = sau bữa ăn.','후 = sau, 전 = trước.'],
['버스 정류장은 은행 앞에 있습니다.','정류장은 어디에 있습니까?',['은행 앞','학교 뒤','병원 옆','집 안'],0,'은행 앞 = trước ngân hàng.','Địa điểm đi kèm 앞, 뒤, 옆.'],
['시험은 다음 주 금요일입니다. 신분증을 꼭 가져오세요.','시험에 필요한 것은 무엇입니까?',['우산','신분증','운동화','선물'],1,'신분증 = giấy tờ tùy thân.','Từ 꼭 nhấn mạnh yêu cầu.'],
['한국에 온 지 일 년이 되었습니다. 지금은 회사에서 일합니다.','이 사람은 지금 무엇을 합니까?',['학교에 다닙니다','회사에서 일합니다','여행 중입니다','집에 있습니다'],1,'Hiện tại làm việc tại công ty.','Tìm 지금은, tránh thông tin quá khứ.'],
['오후 두 시부터 네 시까지 회의가 있습니다.','회의는 얼마나 걸립니까?',['한 시간','두 시간','세 시간','네 시간'],1,'14:00 đến 16:00 là hai tiếng.','Phân biệt thời điểm bắt đầu và khoảng thời gian.'],
['이 식당은 음식이 맛있고 가격도 저렴해서 손님이 많습니다.','손님이 많은 이유는 무엇입니까?',['음식이 비싸서','식당이 멀어서','음식이 맛있고 싸서','메뉴가 적어서'],2,'Đồ ăn ngon, giá rẻ nên đông khách.','Tìm quan hệ -아서/어서.']];
const IIListen=[
['여자: 이번 조사는 참여율이 높아졌지만 응답 내용은 작년과 비슷했어요. 남자: 그렇군요. 수치는 늘어났어도 경향은 달라지지 않았다는 말이네요.','남자의 생각으로 알맞은 것은 무엇입니까?',['조사 참여가 줄었다','조사 경향은 변하지 않았다','조사를 취소해야 한다','지난해 자료가 없다'],1,'참여율은 늘었지만 경향은 비슷함.','Tránh đánh đồng số lượng với xu hướng.'],
['남자: 새로운 제도를 바로 도입하면 혼란이 생길 수 있습니다. 먼저 시범 운영을 해 보자는 겁니다.','남자의 주장으로 맞는 것은?',['제도를 폐지해야 한다','즉시 전국에 적용해야 한다','시범 운영이 필요하다','논의를 중단해야 한다'],2,'Đề xuất triển khai thử trước khi áp dụng.','Nghe -자는 겁니다 để tìm đề xuất.'],
['여자: 제품은 친환경적이지만 생산 비용이 너무 높다는 점이 문제입니다.','여자가 지적하는 문제는 무엇입니까?',['안전성 부족','생산비 부담','품질 불량','배송 지연'],1,'생산 비용이 높다 = chi phí sản xuất cao.','Từ 하지만 thường dẫn vào vấn đề.'],
['남자: 도시의 녹지를 늘리는 것은 주민 건강뿐 아니라 폭염 완화에도 도움이 됩니다.','이 말의 중심 내용은?',['도시 공원 폐쇄','녹지 확대의 긍정적 효과','교통 비용 증가','농촌 인구 감소'],1,'Mở rộng không gian xanh có nhiều lợi ích.','Cấu trúc 뿐 아니라: không chỉ ... mà còn.'],
['여자: 연구 결과를 해석할 때에는 평균만 보지 말고 자료가 얼마나 흩어져 있는지도 살펴야 합니다.','여자가 강조하는 것은 무엇입니까?',['평균만 확인','분포도 함께 검토','자료를 삭제','조사 시간을 줄임'],1,'Cần xem cả mức độ phân tán dữ liệu.','말고 biểu thị không chỉ lấy thông tin trước đó.'],
['남자: 계획 자체에는 찬성하지만 구체적인 재원 마련 방안이 빠져 있어 실행 가능성이 낮아 보입니다.','남자의 태도는 무엇입니까?',['전면 반대','조건 없는 찬성','부분 동의와 우려','무관심'],2,'Đồng ý với kế hoạch nhưng lo thiếu kinh phí.','Chú ý 찬성하지만, đây là thái độ có điều kiện.'],
['여자: 인공지능이 업무 효율을 높일 수는 있지만 판단의 책임까지 대신할 수는 없습니다.','여자가 주장하는 것은?',['책임을 모두 기술에 맡긴다','효율과 책임을 구분해야 한다','기술을 사용하지 않는다','사람의 판단이 불필요하다'],1,'AI cải thiện hiệu suất nhưng không thay trách nhiệm.','Đối lập 가능성 và 한계.'],
['남자: 내년부터 교통 요금이 인상됩니다. 다만 청소년과 노인에게는 기존 할인 제도가 그대로 적용됩니다.','내용과 같은 것은?',['모든 할인이 폐지된다','요금이 내려간다','일부 대상은 기존 할인이 유지된다','학생만 요금을 낸다'],2,'할인 제도 그대로 적용 = giảm giá tiếp tục.','다만 mang thông tin ngoại lệ.'],
['여자: 성과를 단기간의 수익으로만 판단하면 장기적인 신뢰 구축을 놓칠 수 있습니다.','여자가 경계하는 것은?',['장기 계획','단기 수익에만 집중','신뢰 형성','공동체 협력'],1,'Chỉ nhìn lợi nhuận ngắn hạn sẽ bỏ qua niềm tin dài hạn.','Tìm -으로만 để thấy phạm vi bị giới hạn.'],
['남자: 소비자의 선택이 달라지고 있어 기업도 기존 전략을 수정할 필요가 있습니다.','남자가 말하는 변화는 무엇입니까?',['기업의 규모 축소','고객 선택 변화에 대응','제품 수출 금지','모든 전략 유지'],1,'Do nhu cầu người tiêu dùng đổi, doanh nghiệp cần đổi chiến lược.','Tìm cặp nguyên nhân và hệ quả.'],
['여자: 이 현상은 한 가지 원인만으로 설명하기 어렵습니다. 경제와 문화적 배경을 함께 고려해야 합니다.','여자의 관점은 무엇입니까?',['단일 원인만 중요','여러 요인을 종합 고려','경제적 요인은 무관','문화는 설명 불가'],1,'Không thể giải thích bằng một nguyên nhân, cần đa yếu tố.','Phân biệt 단일 원인 và 복합 요인.'],
['남자: 결과가 예상과 달랐다고 해서 실험이 실패한 것은 아닙니다. 새로운 가설을 세울 근거가 될 수 있습니다.','남자의 의도는?',['실험 중단 요구','결과의 가치 재해석','연구비 삭감','예상 결과 조작'],1,'Kết quả bất ngờ vẫn có ích cho giả thuyết mới.','-다고 해서 … 것은 아니다: phủ định suy luận vội.']];
const IIRead=[
['환경 보호 정책의 효과는 규제의 강도뿐 아니라 시민의 참여 정도에도 달려 있다.','글의 중심 내용은?',['규제만 강하면 성공한다','시민 참여도 정책 성과에 중요하다','환경 정책을 중단해야 한다','시민은 정책과 무관하다'],1,'Bên cạnh quy định còn phải có người dân tham gia.','Tìm 뿐 아니라 để xác định hai yếu tố.'],
['원격 근무는 이동 시간을 줄이는 장점이 있다. 그러나 소통의 단절을 예방하기 위한 장치도 필요하다.','필자의 태도는?',['전면 부정','장점과 과제를 함께 인식','단점 없음','출퇴근 증가 찬성'],1,'Cân bằng lợi ích và hạn chế.','그러나 nối hai mặt của lập luận.'],
['사용자 편의만 강조한 기술은 개인정보 보호 문제를 간과하기 쉽다.','글의 주장으로 맞는 것은?',['편의성보다 속도가 전부다','개인정보 보호도 고려해야 한다','기술 사용을 금지한다','개인정보는 중요하지 않다'],1,'Bảo vệ dữ liệu cá nhân phải được tính đến.','Chú ý 간과하기 쉽다 = dễ bỏ qua.'],
['지역 축제는 관광객을 유치하는 데 도움이 된다. ( ) 지역 주민의 삶에 불편을 줄 수 있어 준비가 필요하다.','빈칸에 알맞은 표현은?',['따라서','그러나','예를 들어','게다가'],1,'Sau chỗ trống chuyển sang mặt bất lợi.','Từ nối đối lập: 그러나.'],
['고령화가 빠르게 진행되면서 돌봄 서비스 수요가 증가하고 있다. 이에 대응하여 지역 단위의 지원 체계를 강화해야 한다.','이 글의 목적은?',['관광 홍보','정책 대응의 필요성 제기','개인 일기','상품 판매'],1,'Đoạn đề xuất tăng hỗ trợ chăm sóc.','Xác định câu đề xuất cuối đoạn.'],
['연구 표본이 특정 연령대에 치우쳐 있다면 결과를 전체 인구에 일반화하는 데 주의해야 한다.','적절한 해석은?',['표본의 대표성을 점검한다','표본 크기는 언제나 충분하다','모든 결과를 즉시 일반화한다','연령대는 연구에 무관하다'],0,'Mẫu lệch tuổi khiến việc khái quát không chắc chắn.','치우치다 = thiên lệch.'],
['기술의 발전이 일자리를 없애기만 하는 것은 아니다. 새로운 직무와 산업을 만들어 내기도 한다.','필자의 관점은?',['기술은 일자리를 전부 없앤다','변화에는 부정적 효과만 있다','일자리 구조가 복합적으로 변한다','신기술 산업은 나타나지 않는다'],2,'Có mất và tạo mới công việc.','-기만 하는 것은 아니다 loại quan điểm một chiều.'],
['공공 공간의 디자인은 심미성뿐 아니라 접근성까지 고려해야 한다.','중심 주장과 가까운 것은?',['아름다움만 중요','다양한 이용자가 쉽게 접근할 수 있어야 한다','공공장소를 폐쇄','접근성을 포기'],1,'Thiết kế phải đảm bảo tiếp cận được cho nhiều người.','접근성 là từ khóa.'],
['소비자 신뢰를 회복하려면 기업은 사과에서 그칠 것이 아니라 재발 방지 대책을 구체적으로 제시해야 한다.','필자가 강조하는 것은?',['사과만으로 충분','구체적 재발 방지책 마련','문제의 은폐','광고 확대'],1,'Cần kế hoạch ngăn tái diễn, không chỉ xin lỗi.','-에서 그칠 것이 아니라 thể hiện yêu cầu bổ sung.'],
['생산성을 측정할 때 업무량만 따지면 성과의 질을 놓칠 수 있다.','글의 의미로 알맞은 것은?',['업무량만으로 판단할 수 없다','질은 중요하지 않다','숫자가 전혀 필요 없다','시간은 항상 충분하다'],0,'Hiệu quả công việc gồm cả chất lượng.','-만 따지면: hạn chế tiêu chí đơn nhất.'],
['도시 재생 사업은 건물을 새로 만드는 데 그치지 않고 기존 주민의 생활을 유지하는 방향으로 추진되어야 한다.','적절한 제목은?',['건물 철거의 필요성','주민을 고려한 도시 재생','신규 주택 가격만 상승','모든 주민의 이주'],1,'Cải tạo đô thị cần chú ý sinh kế cư dân.','Tìm yêu cầu sau -어야 한다.'],
['온라인 정보는 빠르게 확산된다. 따라서 사실 여부를 확인하지 않은 채 공유하는 행동을 경계해야 한다.','이 글의 조언은?',['바로 공유하기','출처와 사실 확인 후 공유','제목만 읽고 판단','정보를 무조건 믿기'],1,'Xác thực trước khi chia sẻ.','따라서: kết luận/hành động nên làm.']];
function normalize(raw,level,kind){return raw.map((r,i)=>({id:`${level}-${kind}-${i+1}`,level,kind,script:kind==='listening'?r[0]:null,passage:kind==='reading'?r[0]:null,question:r[1],choices:r[2],correct:r[3],why:r[4],strategy:r[5],source:'MR LEE — câu hỏi tự biên soạn'}));}
const questions=[...normalize(IListen,1,'listening'),...normalize(IRead,1,'reading'),...normalize(IIListen,2,'listening'),...normalize(IIRead,2,'reading')];
const writes=[
{no:51,format:'PBT',title:'Điền chỗ trống trong tin nhắn',task:'친구에게 보내는 문자입니다. 민수 씨, 내일 도서관에서 함께 공부할까요? 오후 두 시에 ( ㉠ ). 시간이 어려우면 ( ㉡ ).',hints:['㉠: Cần động từ hẹn gặp theo ngữ cảnh.','㉡: Cần lời đề nghị báo lại nếu không thuận tiện.'],sample:'㉠ 만나요. ㉡ 연락해 주세요.',rubric:'Đúng ý, câu hoàn chỉnh, kết hợp đuôi câu lịch sự.'},
{no:52,format:'PBT',title:'Điền vào đoạn văn logic',task:'규칙적으로 운동하면 건강을 유지하는 데 도움이 된다. 그렇지만 처음부터 무리하게 운동하면 오히려 몸에 부담을 줄 수 있다. 따라서 ( ㉠ ). 또한 ( ㉡ ).',hints:['㉠: Kết luận dựa vào việc tránh tập quá sức.','㉡: Bổ sung hành động cụ thể liên quan đến sức khỏe.'],sample:'㉠ 자신의 체력에 맞게 운동해야 한다. ㉡ 충분한 휴식도 필요하다.',rubric:'Liên kết với 따라서 / 또한; không thêm ý trái ngược.'},
{no:53,format:'PBT',title:'Mô tả bảng số liệu',task:'Khảo sát tự biên soạn về cách đến trường của 100 sinh viên: xe buýt 45%, tàu điện 30%, đi bộ 15%, phương tiện khác 10%. Viết đoạn 200–300 ký tự tiếng Hàn, mô tả tỷ lệ và so sánh nhóm cao nhất, thấp nhất.',hints:['Nêu khảo sát, đối tượng và đơn vị.','So sánh xe buýt 45% với phương tiện khác 10%.','Không tự suy đoán nguyên nhân nếu chưa có trong dữ liệu.'],sample:'대학생 100명의 통학 수단을 조사한 결과, 버스를 이용한다는 응답이 45%로 가장 많았다. 그다음은 지하철 30%, 도보 15% 순이었다. 기타 교통수단은 10%로 가장 적었다. 버스 이용 비율은 기타보다 35%포인트 높았다.',rubric:'Đúng số liệu, độ dài, tính khách quan, câu liên kết và chính tả.'},
{no:54,format:'PBT',title:'Nghị luận về học tập',task:'Đề tự biên soạn: 기술의 발전이 학습 방식에 미치는 영향. Viết 600–700 ký tự tiếng Hàn: (1) thuận lợi, (2) hạn chế, (3) quan điểm và giải pháp của bạn.',hints:['Mở bài nêu bối cảnh.','Thân bài có ít nhất hai luận điểm và ví dụ.','Kết bài nêu giải pháp phù hợp; tránh lạc đề.'],sample:'기술의 발전으로 학습 환경이 빠르게 변화하고 있다. 학습자는 다양한 자료를 쉽게 활용할 수 있지만 정보의 정확성을 확인해야 한다. 따라서 기술을 활용하되 학습 목표에 맞게 자료를 선택하고 스스로 생각하는 태도를 유지하는 것이 중요하다.',rubric:'Độ bao phủ yêu cầu, logic mở–thân–kết, từ vựng, ngữ pháp, độ dài. Bài mẫu chỉ minh họa lập luận, không phải đáp án đủ 600–700 ký tự.'},
{no:'ibt',format:'IBT',title:'Luyện gõ bài viết TOPIK II IBT (mô phỏng)',task:'Đề tự biên soạn: 원격 근무의 장단점에 대한 자신의 의견을 두 가지 근거와 함께 쓰세요. Bài luyện gõ khoảng 400–500 ký tự (không phải câu hỏi chính thức).',hints:['Nêu rõ quan điểm cá nhân.','Đưa hai lý do có ví dụ.','Kiểm tra mạch ý và lỗi chính tả.'],sample:'원격 근무는 이동 시간을 줄이고 개인의 집중력을 높일 수 있다. 그러나 팀원 사이의 소통이 부족해질 위험도 있다. 따라서 정기적인 협업 시간을 정하고 업무 성과를 명확히 관리하는 방식이 필요하다.',rubric:'Mô phỏng luyện gõ; độ dài và tiêu chí của đề thi thật phụ thuộc dạng câu cụ thể.'}
];
function makeSchedule(level,days){const source=level===1?topicsI:topicsII;return Array.from({length:days},(_,i)=>{const lesson=Math.min(60,Math.max(1,Math.ceil((i+1)*60/days)));const p=phases.find(x=>x.from<=lesson&&x.to>=lesson);const focus=(lesson%5===0)?'assessment':(lesson%3===0?'listening':lesson%3===1?'reading':'mixed');return {day:i+1,sourceDay:lesson,title:source[lesson-1],phase:p.name,focus,minutes:level===1?60:90};});}
function dailyQuestions(level,day){const listening=questions.filter(x=>x.level===level&&x.kind==='listening');const reading=questions.filter(x=>x.level===level&&x.kind==='reading');const li=Array.from({length:3},(_,i)=>listening[((day-1)*3+i)%listening.length]);const re=Array.from({length:3},(_,i)=>reading[((day-1)*3+i)%reading.length]);return [li[0],re[0],li[1],re[1],li[2],re[2]];}
global.MRLEE_TOPIK_V7={PBT,IBT,phases,questions,writes,makeSchedule,dailyQuestions};
})(window);
