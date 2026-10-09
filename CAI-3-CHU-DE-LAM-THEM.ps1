#Requires -Version 5.1
# Tiếng Hàn Mr Lee - thêm 3 chủ đề giao tiếp làm thêm, 20 câu / chủ đề.
# Một file; chạy từ thư mục website, không ảnh hưởng Firebase và các trang khác.
$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $MyInvocation.MyCommand.Path
$path = Join-Path $project 'giao-tiep-theo-chu-de.html'
if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
  throw 'Khong tim thay giao-tiep-theo-chu-de.html. Hay chep file .ps1 vao thu muc website va chay lai.'
}
# Đọc/ghi UTF-8 không BOM cho HTML. Hỗ trợ PowerShell 5.1 trên Windows.
$utf8 = New-Object System.Text.UTF8Encoding($false)
$html = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
# Trang hiện tại dùng TOPICS = một mảng JSON trên một dòng.
$pattern = 'const\s+TOPICS\s*=\s*(\[[^\r\n]*\])\s*;'
$match = [regex]::Match($html, $pattern)
if (-not $match.Success) {
  throw 'Khong tim thay const TOPICS=[...] trong trang giao tiep. Da dung an toan, khong ghi de.'
}
$topics = @($match.Groups[1].Value | ConvertFrom-Json)
if ($topics.Count -lt 10) { throw 'Du lieu chu de khong dung dinh dang mong doi. Khong sua file.' }
$newJson = @'
[{"id":"pt-restaurant","title":"Làm thêm · Quán ăn","icon":"👩‍🍳","desc":"Nhận ca, phục vụ khách, xử lý đơn, dọn dẹp và trao đổi với quản lý","items":[{"id":"pt-restaurant-1","ko":"오늘부터 홀에서 일하게 됐습니다.","vi":"Hôm nay tôi bắt đầu làm ở khu vực phục vụ."},{"id":"pt-restaurant-2","ko":"먼저 무엇부터 하면 될까요?","vi":"Tôi nên làm việc gì trước ạ?"},{"id":"pt-restaurant-3","ko":"주문 받는 방법을 알려 주시겠어요?","vi":"Anh/chị hướng dẫn tôi cách nhận món được không ạ?"},{"id":"pt-restaurant-4","ko":"몇 번 테이블에서 주문하셨나요?","vi":"Khách gọi món ở bàn số mấy ạ?"},{"id":"pt-restaurant-5","ko":"3번 테이블에 물 좀 가져다주세요.","vi":"Vui lòng mang nước đến bàn số 3."},{"id":"pt-restaurant-6","ko":"이 음식은 어느 테이블로 가져가면 돼요?","vi":"Món này tôi cần mang đến bàn nào ạ?"},{"id":"pt-restaurant-7","ko":"손님, 주문하시겠어요?","vi":"Quý khách muốn gọi món chưa ạ?"},{"id":"pt-restaurant-8","ko":"주문하신 메뉴를 다시 확인해 드릴게요.","vi":"Tôi xin xác nhận lại món quý khách đã gọi."},{"id":"pt-restaurant-9","ko":"음식이 곧 나옵니다.","vi":"Món ăn sẽ có ngay ạ."},{"id":"pt-restaurant-10","ko":"잠시만 기다려 주세요.","vi":"Quý khách vui lòng đợi một chút."},{"id":"pt-restaurant-11","ko":"추가 주문 있으세요?","vi":"Quý khách có muốn gọi thêm món không ạ?"},{"id":"pt-restaurant-12","ko":"반찬 더 드릴까요?","vi":"Quý khách có muốn thêm món ăn kèm không ạ?"},{"id":"pt-restaurant-13","ko":"음식 알레르기가 있으세요?","vi":"Quý khách có dị ứng thực phẩm nào không ạ?"},{"id":"pt-restaurant-14","ko":"주문이 잘못 들어갔습니다.","vi":"Đơn gọi món đã bị nhập sai ạ."},{"id":"pt-restaurant-15","ko":"죄송합니다. 바로 다시 준비해 드릴게요.","vi":"Tôi xin lỗi, tôi sẽ chuẩn bị lại ngay ạ."},{"id":"pt-restaurant-16","ko":"빈 그릇 치워도 될까요?","vi":"Tôi có thể dọn bát đĩa trống được không ạ?"},{"id":"pt-restaurant-17","ko":"계산은 카운터에서 도와드리겠습니다.","vi":"Quý khách vui lòng thanh toán tại quầy ạ."},{"id":"pt-restaurant-18","ko":"설거지는 어디에서 하면 되나요?","vi":"Tôi rửa bát ở đâu ạ?"},{"id":"pt-restaurant-19","ko":"마감 청소는 무엇부터 하면 되나요?","vi":"Khi đóng ca, tôi nên bắt đầu dọn dẹp từ đâu ạ?"},{"id":"pt-restaurant-20","ko":"오늘은 몇 시까지 근무하나요?","vi":"Hôm nay tôi làm đến mấy giờ ạ?"}]},{"id":"pt-cafe","title":"Làm thêm · Quán cà phê","icon":"☕","desc":"Nhận order, pha chế, phục vụ, vệ sinh máy và bàn giao ca","items":[{"id":"pt-cafe-1","ko":"오늘부터 카페에서 아르바이트하게 됐습니다.","vi":"Hôm nay tôi bắt đầu làm thêm ở quán cà phê."},{"id":"pt-cafe-2","ko":"포스기 사용법을 알려 주시겠어요?","vi":"Anh/chị hướng dẫn tôi dùng máy POS được không ạ?"},{"id":"pt-cafe-3","ko":"주문 도와드리겠습니다.","vi":"Tôi xin nhận món của quý khách ạ."},{"id":"pt-cafe-4","ko":"매장에서 드시나요, 가져가시나요?","vi":"Quý khách dùng tại quán hay mang đi ạ?"},{"id":"pt-cafe-5","ko":"어떤 사이즈로 드릴까요?","vi":"Quý khách chọn cỡ nào ạ?"},{"id":"pt-cafe-6","ko":"아이스로 드릴까요, 따뜻하게 드릴까요?","vi":"Quý khách muốn uống đá hay nóng ạ?"},{"id":"pt-cafe-7","ko":"샷 추가하시겠어요?","vi":"Quý khách có muốn thêm một shot cà phê không ạ?"},{"id":"pt-cafe-8","ko":"시럽은 빼 드릴까요?","vi":"Quý khách có muốn bỏ si-rô không ạ?"},{"id":"pt-cafe-9","ko":"음료 나오면 불러 드릴게요.","vi":"Khi đồ uống xong tôi sẽ gọi quý khách ạ."},{"id":"pt-cafe-10","ko":"주문하신 아이스 라테 나왔습니다.","vi":"Ly latte đá quý khách gọi đã xong ạ."},{"id":"pt-cafe-11","ko":"빨대와 냅킨은 저쪽에 있습니다.","vi":"Ống hút và khăn giấy ở phía bên kia ạ."},{"id":"pt-cafe-12","ko":"컵 뚜껑이 부족해요.","vi":"Nắp ly sắp hết rồi ạ."},{"id":"pt-cafe-13","ko":"우유가 거의 다 떨어졌어요.","vi":"Sữa gần hết rồi ạ."},{"id":"pt-cafe-14","ko":"원두를 어디에 보관하나요?","vi":"Hạt cà phê được bảo quản ở đâu ạ?"},{"id":"pt-cafe-15","ko":"커피 머신 청소하는 방법을 알려 주세요.","vi":"Hãy hướng dẫn tôi cách vệ sinh máy pha cà phê ạ."},{"id":"pt-cafe-16","ko":"주문이 밀려서 조금 늦어지고 있어요.","vi":"Đơn đang dồn nên sẽ chậm một chút ạ."},{"id":"pt-cafe-17","ko":"죄송합니다. 음료를 다시 만들어 드리겠습니다.","vi":"Tôi xin lỗi, tôi sẽ pha lại đồ uống cho quý khách ạ."},{"id":"pt-cafe-18","ko":"결제는 카드로 하시겠어요?","vi":"Quý khách thanh toán bằng thẻ phải không ạ?"},{"id":"pt-cafe-19","ko":"테이블을 먼저 정리하겠습니다.","vi":"Tôi sẽ dọn bàn trước ạ."},{"id":"pt-cafe-20","ko":"마감할 때 쓰레기는 어디에 버리나요?","vi":"Khi đóng ca, tôi đổ rác ở đâu ạ?"}]},{"id":"pt-convenience","title":"Làm thêm · Cửa hàng tiện lợi","icon":"🏪","desc":"Thu ngân, nạp thẻ, kiểm tra tuổi, xếp hàng và bàn giao ca","items":[{"id":"pt-convenience-1","ko":"오늘부터 편의점에서 근무합니다.","vi":"Hôm nay tôi bắt đầu làm ở cửa hàng tiện lợi."},{"id":"pt-convenience-2","ko":"계산대 사용법을 알려 주시겠어요?","vi":"Anh/chị hướng dẫn tôi dùng quầy thu ngân được không ạ?"},{"id":"pt-convenience-3","ko":"어서 오세요.","vi":"Xin kính chào quý khách."},{"id":"pt-convenience-4","ko":"봉투 필요하세요?","vi":"Quý khách có cần túi không ạ?"},{"id":"pt-convenience-5","ko":"바코드가 잘 안 찍혀요.","vi":"Máy quét không nhận mã vạch ạ."},{"id":"pt-convenience-6","ko":"다른 상품으로 교환하시겠어요?","vi":"Quý khách muốn đổi sang sản phẩm khác không ạ?"},{"id":"pt-convenience-7","ko":"영수증 필요하세요?","vi":"Quý khách có cần hóa đơn không ạ?"},{"id":"pt-convenience-8","ko":"교통카드 충전해 드릴까요?","vi":"Quý khách có muốn nạp tiền thẻ giao thông không ạ?"},{"id":"pt-convenience-9","ko":"얼마 충전하시겠어요?","vi":"Quý khách muốn nạp bao nhiêu tiền ạ?"},{"id":"pt-convenience-10","ko":"신분증 확인 부탁드립니다.","vi":"Xin phép kiểm tra giấy tờ tùy thân ạ."},{"id":"pt-convenience-11","ko":"찾으시는 상품이 있으세요?","vi":"Quý khách đang tìm sản phẩm nào ạ?"},{"id":"pt-convenience-12","ko":"이 상품은 행사 중입니다.","vi":"Sản phẩm này đang có khuyến mãi ạ."},{"id":"pt-convenience-13","ko":"하나 더 가져오시면 할인됩니다.","vi":"Nếu lấy thêm một món nữa sẽ được giảm giá ạ."},{"id":"pt-convenience-14","ko":"유통기한을 확인해야 합니다.","vi":"Cần kiểm tra hạn sử dụng ạ."},{"id":"pt-convenience-15","ko":"새 상품은 어디에 진열하면 되나요?","vi":"Hàng mới thì tôi xếp lên kệ nào ạ?"},{"id":"pt-convenience-16","ko":"냉장고에 음료를 채워 놓겠습니다.","vi":"Tôi sẽ bổ sung đồ uống vào tủ lạnh ạ."},{"id":"pt-convenience-17","ko":"택배 접수는 어떻게 하나요?","vi":"Thủ tục nhận gửi bưu kiện thực hiện như thế nào ạ?"},{"id":"pt-convenience-18","ko":"재고가 부족해서 확인해 보겠습니다.","vi":"Hàng trong kho không đủ, tôi sẽ kiểm tra lại ạ."},{"id":"pt-convenience-19","ko":"환불은 영수증이 있어야 가능한가요?","vi":"Có phải chỉ được hoàn tiền khi có hóa đơn không ạ?"},{"id":"pt-convenience-20","ko":"교대하실 때 인수인계 부탁드립니다.","vi":"Khi đổi ca, nhờ anh/chị bàn giao công việc giúp tôi ạ."}]}]
'@
$newTopics = @($newJson | ConvertFrom-Json)
# Gộp vào danh sách hiện có, không mất câu cũ và không thêm trùng khi chạy lại.
$added = 0
foreach ($topic in $newTopics) {
  $existing = $null
  foreach ($t in $topics) { if ($t.id -eq $topic.id) { $existing = $t; break } }
  if ($null -eq $existing) {
    $topics += $topic
    $added++
  } else {
    $oldItems = @($existing.items)
    $ids = @{}; foreach ($it in $oldItems) { $ids[[string]$it.id] = $true }
    foreach ($it in $topic.items) {
      if (-not $ids.ContainsKey([string]$it.id)) {
        $oldItems += $it
        $ids[[string]$it.id] = $true
      }
    }
    $existing.items = @($oldItems)
  }
}
# Không chỉnh localStorage / nút nghe / flashcard / login / script hiện có.
$json = ConvertTo-Json -InputObject @($topics) -Depth 30 -Compress
$updated = $html.Remove($match.Groups[1].Index, $match.Groups[1].Length).Insert($match.Groups[1].Index, $json)
if ($updated -ne $html) {
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $backup = "$path.backup-$stamp"
  [System.IO.File]::Copy($path, $backup, $false)
  [System.IO.File]::WriteAllText($path, $updated, $utf8)
  Write-Host "Da sao luu: $backup"
}
Write-Host "Da them $added chu de moi. Tong: $($topics.Count) chu de."
foreach ($t in $topics) {
  if ([string]$t.id -like 'pt-*') { Write-Host "$($t.title): $(@($t.items).Count) cau" }
}
Write-Host 'Hoan tat. Thu voi Live Server va chay: git add giao-tiep-theo-chu-de.html'
