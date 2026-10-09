#Requires -Version 5.1
# Tiếng Hàn Mr Lee: bổ sung 3 chủ đề làm thêm / 60 câu.
# V3: xử lý file HTML đã nén, sửa bản V2 và chạy lại không nhân đôi dữ liệu.
# Chỉ cập nhật giao-tiep-theo-chu-de.html. Không chỉnh các trang khác/Firebase.
$ErrorActionPreference = 'Stop'

$path = Join-Path $PSScriptRoot 'giao-tiep-theo-chu-de.html'
if (-not [System.IO.File]::Exists($path)) {
  throw 'Khong tim thay giao-tiep-theo-chu-de.html. Hay de file V3.ps1 trong THU MUC GOC website.'
}
$utf8 = New-Object System.Text.UTF8Encoding($false)
$original = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# An toàn: không áp dụng lên nhầm trang.
if (-not $original.Contains('id="topicMenu"') -or -not $original.Contains('id="phraseGrid"')) {
  throw 'Khong nhan ra trang giao tiep Mr Lee (thieu topicMenu/phraseGrid). HTML khong bi sua.'
}

$startV3 = '/* MRLEE_PARTTIME_TOPICS_V3_START */'
$endV3 = '/* MRLEE_PARTTIME_TOPICS_V3_END */'
if ($original.Contains($startV3)) {
  if (-not $original.Contains($endV3)) {
    throw 'Tim thay dau V3 nhung thieu dau ket thuc. HTML khong bi sua; can kiem tra file.'
  }
  Write-Host 'Ban V3 da cai san. Khong can chay lai.' -ForegroundColor Green
  exit 0
}

# Nếu đã cài V2, thay chính đoạn V2; tuyệt đối không xóa các chủ đề gốc.
$working = $original
$hasV2 = $working.Contains('/* MRLEE_PARTTIME_TOPICS_V2_START */')
if ($hasV2) {
  if (-not $working.Contains('/* MRLEE_PARTTIME_TOPICS_V2_END */')) {
    throw 'Ban V2 bi thieu dau ket thuc. Dung an toan, HTML khong bi sua.'
  }
  $oldBlock = [regex]::Match($working, '(?s)/\* MRLEE_PARTTIME_TOPICS_V2_START \*/.*?/\* MRLEE_PARTTIME_TOPICS_V2_END \*/[ \t]*\r?\n?')
  if (-not $oldBlock.Success) {
    throw 'Khong doc duoc doan V2. HTML khong bi sua.'
  }
  $working = $working.Remove($oldBlock.Index, $oldBlock.Length)
}

# 3 chủ đề, mỗi chủ đề 20 câu. Đây là JS thuần, không cần ConvertFrom-Json PowerShell.
$topicJson = @'
[{"id":"pt-restaurant","title":"Làm thêm · Quán ăn","icon":"👩‍🍳","desc":"Nhận ca, phục vụ khách, xử lý đơn, dọn dẹp và trao đổi với quản lý","items":[{"id":"pt-restaurant-1","ko":"오늘부터 홀에서 일하게 됐습니다.","vi":"Hôm nay tôi bắt đầu làm ở khu vực phục vụ."},{"id":"pt-restaurant-2","ko":"먼저 무엇부터 하면 될까요?","vi":"Tôi nên làm việc gì trước ạ?"},{"id":"pt-restaurant-3","ko":"주문 받는 방법을 알려 주시겠어요?","vi":"Anh/chị hướng dẫn tôi cách nhận món được không ạ?"},{"id":"pt-restaurant-4","ko":"몇 번 테이블에서 주문하셨나요?","vi":"Khách gọi món ở bàn số mấy ạ?"},{"id":"pt-restaurant-5","ko":"3번 테이블에 물 좀 가져다주세요.","vi":"Vui lòng mang nước đến bàn số 3."},{"id":"pt-restaurant-6","ko":"이 음식은 어느 테이블로 가져가면 돼요?","vi":"Món này tôi cần mang đến bàn nào ạ?"},{"id":"pt-restaurant-7","ko":"손님, 주문하시겠어요?","vi":"Quý khách muốn gọi món chưa ạ?"},{"id":"pt-restaurant-8","ko":"주문하신 메뉴를 다시 확인해 드릴게요.","vi":"Tôi xin xác nhận lại món quý khách đã gọi."},{"id":"pt-restaurant-9","ko":"음식이 곧 나옵니다.","vi":"Món ăn sẽ có ngay ạ."},{"id":"pt-restaurant-10","ko":"잠시만 기다려 주세요.","vi":"Quý khách vui lòng đợi một chút."},{"id":"pt-restaurant-11","ko":"추가 주문 있으세요?","vi":"Quý khách có muốn gọi thêm món không ạ?"},{"id":"pt-restaurant-12","ko":"반찬 더 드릴까요?","vi":"Quý khách có muốn thêm món ăn kèm không ạ?"},{"id":"pt-restaurant-13","ko":"음식 알레르기가 있으세요?","vi":"Quý khách có dị ứng thực phẩm nào không ạ?"},{"id":"pt-restaurant-14","ko":"주문이 잘못 들어갔습니다.","vi":"Đơn gọi món đã bị nhập sai ạ."},{"id":"pt-restaurant-15","ko":"죄송합니다. 바로 다시 준비해 드릴게요.","vi":"Tôi xin lỗi, tôi sẽ chuẩn bị lại ngay ạ."},{"id":"pt-restaurant-16","ko":"빈 그릇 치워도 될까요?","vi":"Tôi có thể dọn bát đĩa trống được không ạ?"},{"id":"pt-restaurant-17","ko":"계산은 카운터에서 도와드리겠습니다.","vi":"Quý khách vui lòng thanh toán tại quầy ạ."},{"id":"pt-restaurant-18","ko":"설거지는 어디에서 하면 되나요?","vi":"Tôi rửa bát ở đâu ạ?"},{"id":"pt-restaurant-19","ko":"마감 청소는 무엇부터 하면 되나요?","vi":"Khi đóng ca, tôi nên bắt đầu dọn dẹp từ đâu ạ?"},{"id":"pt-restaurant-20","ko":"오늘은 몇 시까지 근무하나요?","vi":"Hôm nay tôi làm đến mấy giờ ạ?"}]},{"id":"pt-cafe","title":"Làm thêm · Quán cà phê","icon":"☕","desc":"Nhận order, pha chế, phục vụ, vệ sinh máy và bàn giao ca","items":[{"id":"pt-cafe-1","ko":"오늘부터 카페에서 아르바이트하게 됐습니다.","vi":"Hôm nay tôi bắt đầu làm thêm ở quán cà phê."},{"id":"pt-cafe-2","ko":"포스기 사용법을 알려 주시겠어요?","vi":"Anh/chị hướng dẫn tôi dùng máy POS được không ạ?"},{"id":"pt-cafe-3","ko":"주문 도와드리겠습니다.","vi":"Tôi xin nhận món của quý khách ạ."},{"id":"pt-cafe-4","ko":"매장에서 드시나요, 가져가시나요?","vi":"Quý khách dùng tại quán hay mang đi ạ?"},{"id":"pt-cafe-5","ko":"어떤 사이즈로 드릴까요?","vi":"Quý khách chọn cỡ nào ạ?"},{"id":"pt-cafe-6","ko":"아이스로 드릴까요, 따뜻하게 드릴까요?","vi":"Quý khách muốn uống đá hay nóng ạ?"},{"id":"pt-cafe-7","ko":"샷 추가하시겠어요?","vi":"Quý khách có muốn thêm một shot cà phê không ạ?"},{"id":"pt-cafe-8","ko":"시럽은 빼 드릴까요?","vi":"Quý khách có muốn bỏ si-rô không ạ?"},{"id":"pt-cafe-9","ko":"음료 나오면 불러 드릴게요.","vi":"Khi đồ uống xong tôi sẽ gọi quý khách ạ."},{"id":"pt-cafe-10","ko":"주문하신 아이스 라테 나왔습니다.","vi":"Ly latte đá quý khách gọi đã xong ạ."},{"id":"pt-cafe-11","ko":"빨대와 냅킨은 저쪽에 있습니다.","vi":"Ống hút và khăn giấy ở phía bên kia ạ."},{"id":"pt-cafe-12","ko":"컵 뚜껑이 부족해요.","vi":"Nắp ly sắp hết rồi ạ."},{"id":"pt-cafe-13","ko":"우유가 거의 다 떨어졌어요.","vi":"Sữa gần hết rồi ạ."},{"id":"pt-cafe-14","ko":"원두를 어디에 보관하나요?","vi":"Hạt cà phê được bảo quản ở đâu ạ?"},{"id":"pt-cafe-15","ko":"커피 머신 청소하는 방법을 알려 주세요.","vi":"Hãy hướng dẫn tôi cách vệ sinh máy pha cà phê ạ."},{"id":"pt-cafe-16","ko":"주문이 밀려서 조금 늦어지고 있어요.","vi":"Đơn đang dồn nên sẽ chậm một chút ạ."},{"id":"pt-cafe-17","ko":"죄송합니다. 음료를 다시 만들어 드리겠습니다.","vi":"Tôi xin lỗi, tôi sẽ pha lại đồ uống cho quý khách ạ."},{"id":"pt-cafe-18","ko":"결제는 카드로 하시겠어요?","vi":"Quý khách thanh toán bằng thẻ phải không ạ?"},{"id":"pt-cafe-19","ko":"테이블을 먼저 정리하겠습니다.","vi":"Tôi sẽ dọn bàn trước ạ."},{"id":"pt-cafe-20","ko":"마감할 때 쓰레기는 어디에 버리나요?","vi":"Khi đóng ca, tôi đổ rác ở đâu ạ?"}]},{"id":"pt-convenience","title":"Làm thêm · Cửa hàng tiện lợi","icon":"🏪","desc":"Thu ngân, nạp thẻ, kiểm tra tuổi, xếp hàng và bàn giao ca","items":[{"id":"pt-convenience-1","ko":"오늘부터 편의점에서 근무합니다.","vi":"Hôm nay tôi bắt đầu làm ở cửa hàng tiện lợi."},{"id":"pt-convenience-2","ko":"계산대 사용법을 알려 주시겠어요?","vi":"Anh/chị hướng dẫn tôi dùng quầy thu ngân được không ạ?"},{"id":"pt-convenience-3","ko":"어서 오세요.","vi":"Xin kính chào quý khách."},{"id":"pt-convenience-4","ko":"봉투 필요하세요?","vi":"Quý khách có cần túi không ạ?"},{"id":"pt-convenience-5","ko":"바코드가 잘 안 찍혀요.","vi":"Máy quét không nhận mã vạch ạ."},{"id":"pt-convenience-6","ko":"다른 상품으로 교환하시겠어요?","vi":"Quý khách muốn đổi sang sản phẩm khác không ạ?"},{"id":"pt-convenience-7","ko":"영수증 필요하세요?","vi":"Quý khách có cần hóa đơn không ạ?"},{"id":"pt-convenience-8","ko":"교통카드 충전해 드릴까요?","vi":"Quý khách có muốn nạp tiền thẻ giao thông không ạ?"},{"id":"pt-convenience-9","ko":"얼마 충전하시겠어요?","vi":"Quý khách muốn nạp bao nhiêu tiền ạ?"},{"id":"pt-convenience-10","ko":"신분증 확인 부탁드립니다.","vi":"Xin phép kiểm tra giấy tờ tùy thân ạ."},{"id":"pt-convenience-11","ko":"찾으시는 상품이 있으세요?","vi":"Quý khách đang tìm sản phẩm nào ạ?"},{"id":"pt-convenience-12","ko":"이 상품은 행사 중입니다.","vi":"Sản phẩm này đang có khuyến mãi ạ."},{"id":"pt-convenience-13","ko":"하나 더 가져오시면 할인됩니다.","vi":"Nếu lấy thêm một món nữa sẽ được giảm giá ạ."},{"id":"pt-convenience-14","ko":"유통기한을 확인해야 합니다.","vi":"Cần kiểm tra hạn sử dụng ạ."},{"id":"pt-convenience-15","ko":"새 상품은 어디에 진열하면 되나요?","vi":"Hàng mới thì tôi xếp lên kệ nào ạ?"},{"id":"pt-convenience-16","ko":"냉장고에 음료를 채워 놓겠습니다.","vi":"Tôi sẽ bổ sung đồ uống vào tủ lạnh ạ."},{"id":"pt-convenience-17","ko":"택배 접수는 어떻게 하나요?","vi":"Thủ tục nhận gửi bưu kiện thực hiện như thế nào ạ?"},{"id":"pt-convenience-18","ko":"재고가 부족해서 확인해 보겠습니다.","vi":"Hàng trong kho không đủ, tôi sẽ kiểm tra lại ạ."},{"id":"pt-convenience-19","ko":"환불은 영수증이 있어야 가능한가요?","vi":"Có phải chỉ được hoàn tiền khi có hóa đơn không ạ?"},{"id":"pt-convenience-20","ko":"교대하실 때 인수인계 부탁드립니다.","vi":"Khi đổi ca, nhờ anh/chị bàn giao công việc giúp tôi ạ."}]}]
'@
foreach ($name in @('pt-restaurant', 'pt-cafe', 'pt-convenience')) {
  $count = [regex]::Matches($topicJson, '"id"\s*:\s*"' + [regex]::Escape($name) + '-\d+"').Count
  if ($count -ne 20) { throw "Du lieu $name khong du 20 cau. HTML khong bi sua." }
}

# Phải chèn trước khi ALL được tạo từ TOPICS, để các nút lọc/nghe/flashcard cùng nhận dữ liệu.
$topicsMatch = [regex]::Match($working, '(?s)\b(?:const|let|var)\s+TOPICS\s*=')
if (-not $topicsMatch.Success) {
  throw 'Khong thay bien TOPICS trong HTML. Da dung de bao ve du lieu. Hay gui file giao-tiep-theo-chu-de.html.'
}

# Hỗ trợ cả const ALL ngay đầu dòng lẫn file nén: ...;const ALL=TOPICS.flatMap(...)
$allMatch = [regex]::Match($working, '\b(?:const|let|var)\s+ALL\s*=\s*TOPICS\s*\.\s*flatMap\s*\(')
$insertAt = -1
if ($allMatch.Success -and $allMatch.Index -gt $topicsMatch.Index) {
  $insertAt = $allMatch.Index
} else {
  # Fallback: TOPICS là JSON mảng trên một dòng, như các bản Mr Lee 130/320 câu.
  $arrayMatch = [regex]::Match($working, '(?:const|let|var)\s+TOPICS\s*=\s*\[[^\r\n]*\]\s*;')
  if ($arrayMatch.Success) { $insertAt = $arrayMatch.Index + $arrayMatch.Length }
}
if ($insertAt -lt 0) {
  throw 'Khong xac dinh duoc vi tri them chu de. Chua sua HTML. Hay gui file giao-tiep-theo-chu-de.html.'
}

# Kiểm tra điểm chèn nằm trong thẻ <script> nội tuyến, không phải phần CSS/HTML khác.
$scriptStart = $working.LastIndexOf('<script', $insertAt, [StringComparison]::OrdinalIgnoreCase)
$scriptEndBefore = $working.LastIndexOf('</script', $insertAt, [StringComparison]::OrdinalIgnoreCase)
$scriptEndAfter = $working.IndexOf('</script', $insertAt, [StringComparison]::OrdinalIgnoreCase)
if ($scriptStart -lt 0 -or $scriptEndBefore -gt $scriptStart -or $scriptEndAfter -lt 0) {
  throw 'Vi tri chen khong nam trong JavaScript. Chua sua file.'
}

$addition = @'

/* MRLEE_PARTTIME_TOPICS_V3_START */
// 3 chu de (quan an / cafe / tien loi), 20 cau/chu de.
// Bao toan chu de va trang thai yeu thich hien co.
(() => {
  const newTopics = __TOPICS_JSON__;
  for (const incoming of newTopics) {
    const existing = TOPICS.find(t => t.id === incoming.id);
    if (!existing) {
      TOPICS.push(incoming);
    } else {
      const ids = new Set(existing.items.map(x => x.id));
      for (const sentence of incoming.items) {
        if (!ids.has(sentence.id)) {
          existing.items.push(sentence);
          ids.add(sentence.id);
        }
      }
    }
  }
})();
/* MRLEE_PARTTIME_TOPICS_V3_END */

'@
$addition = $addition.Replace('__TOPICS_JSON__', $topicJson)
$updated = $working.Insert($insertAt, $addition)
if ($updated -eq $original) {
  Write-Host 'Khong co thay doi nao.' -ForegroundColor Yellow
  exit 0
}
if (-not ($updated.Contains($startV3) -and $updated.Contains($endV3))) {
  throw 'Loi kiem tra noi dung sau sua. HTML goc duoc giu nguyen.'
}

# Sao lưu rồi ghi an toàn: nếu ghi thất bại, bản gốc vẫn ở file backup.
$stamp = Get-Date -Format 'yyyyMMdd-HHmmssfff'
$backup = "$path.backup-$stamp"
$tmp = "$path.tmp-$stamp"
try {
  [System.IO.File]::WriteAllText($tmp, $updated, $utf8)
  [System.IO.File]::Copy($path, $backup, $false)
  [System.IO.File]::Copy($tmp, $path, $true)
} finally {
  if ([System.IO.File]::Exists($tmp)) { [System.IO.File]::Delete($tmp) }
}
Write-Host 'THANH CONG: da bo sung 3 chu de lam them / 60 cau.' -ForegroundColor Green
Write-Host "Sao luu file cu: $backup" -ForegroundColor Yellow
Write-Host 'Hay mo Live Server kiem tra 3 chu de, sau do git add giao-tiep-theo-chu-de.html.'
