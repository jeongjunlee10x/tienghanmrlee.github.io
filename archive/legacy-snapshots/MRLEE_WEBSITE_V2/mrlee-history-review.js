/** Tiếng Hàn Mr Lee — giao diện xem lại đáp án đã lưu theo từng lần làm bài.
 * Chỉ hiển thị dữ liệu Firestore của tài khoản đang đăng nhập do learning-history.js tải.
 * Không truy xuất/chỉnh sửa điểm và không lấy đáp án từ đề mới để giả làm bài cũ.
 */
let reviewDialog;
let activeAttempt;
let activeReview;
let filterMode = 'all';
const $el = (tag, className = '', content = '') => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== '') node.textContent = String(content);
  return node;
};
function getReview(item) {
  if (typeof item?.reviewJson !== 'string' || item.reviewJson.length > 160000) return null;
  try {
    const data = JSON.parse(item.reviewJson);
    if (data?.version !== 1 || !Array.isArray(data.questions) || !data.questions.length || data.questions.length > 100) return null;
    if (!data.questions.every(q => q && typeof q.question === 'string' && Array.isArray(q.choices) && q.choices.length >= 2 && q.choices.length <= 8 && Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < q.choices.length && Number.isInteger(q.selectedIndex) && q.selectedIndex >= -1 && q.selectedIndex < q.choices.length)) return null;
    return data.questions;
  } catch { return null; }
}
function retryHref(item) {
  const match = /^online-(sc1|sc2)-lan-([1-8])$/.exec(String(item?.examId || ''));
  return match ? `kiem-tra-online.html?level=${match[1]}&batch=${match[2]}` : null;
}
function initDialog() {
  if (reviewDialog) return reviewDialog;
  const styles = $el('style');
  styles.textContent = `
    .mrlee-review-btn,.mrlee-review-link{font:inherit;font-size:12px;font-weight:800;display:inline-flex;justify-content:center;align-items:center;border-radius:9px;padding:8px 11px;cursor:pointer;line-height:1.4;text-decoration:none}
    .mrlee-review-btn{background:#153155;color:white;border:1px solid #153155}.mrlee-review-btn:hover{background:#285780}
    .mrlee-review-link{border:1px solid #c5d4e7;background:#f5f8fc;color:#153155}.mrlee-review-link:hover{background:#e7f0fa}
    .mrlee-review-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:9px}
    .mrlee-review-old{font-size:12px;color:#6b778a;line-height:1.5}
    .mrlee-review-dialog{border:0;border-radius:18px;padding:0;width:min(840px,calc(100vw - 24px));max-height:min(92vh,980px);box-shadow:0 20px 90px #132d4b55;color:#20324b;font-family:'Be Vietnam Pro','Noto Sans KR',sans-serif}
    .mrlee-review-dialog::backdrop{background:#0e2542a8}
    .mrlee-rh{position:sticky;top:0;background:#fff;z-index:1;border-bottom:1px solid #dbe5ef;padding:19px 23px;display:flex;align-items:center;justify-content:space-between;gap:10px}
    .mrlee-rh h2{font-size:clamp(17px,3vw,22px);line-height:1.5;margin:0;color:#153155}
    .mrlee-rclose{border:1px solid #d4dfeb;background:#f3f7fc;border-radius:10px;padding:7px 14px;cursor:pointer;color:#153155;font-weight:800}
    .mrlee-rbody{padding:19px 23px 27px}.mrlee-rsummary{color:#586b83;font-size:13px;margin:0 0 14px}
    .mrlee-rfilters{display:flex;gap:7px;flex-wrap:wrap;padding-bottom:16px}.mrlee-rfilters button{font:inherit;font-size:12px;font-weight:800;cursor:pointer;border:1px solid #ccdaea;background:#fff;color:#153155;border-radius:20px;padding:7px 11px}
    .mrlee-rfilters button[aria-pressed=true]{background:#153155;color:#fff;border-color:#153155}
    .mrlee-rquestion{padding:16px 17px;border-radius:13px;border:1px solid #d7e3f0;background:#fff;margin:0 0 12px}
    .mrlee-rquestion.bad{border-left:4px solid #c14540}.mrlee-rquestion.good{border-left:4px solid #178461}.mrlee-rquestion.missed{border-left:4px solid #d19226}
    .mrlee-rqmeta{display:block;font-weight:800;font-size:11px;letter-spacing:.04em;color:#516983;margin-bottom:6px}
    .mrlee-rquestion h3{font-size:15px;margin:4px 0 12px;color:#153155;line-height:1.7;white-space:pre-wrap}
    .mrlee-roption{font-size:13px;line-height:1.7;padding:9px 12px;border:1px solid #e2e9f1;border-radius:9px;margin:6px 0;display:flex;gap:8px;align-items:flex-start;white-space:pre-wrap;overflow-wrap:anywhere}
    .mrlee-roption.right{background:#e9f8f1;border-color:#8bcab0;color:#165e43;font-weight:800}
    .mrlee-roption.wrong{background:#fff1f0;border-color:#edb7b1;color:#a02e28;font-weight:800}
    .mrlee-roption .mrlee-rbadge{font-size:11px;font-weight:800;margin-left:auto;flex-shrink:0}
    .mrlee-rexplain{font-size:12px;line-height:1.8;margin:12px 0 0;color:#3b556f;background:#f2f7fc;border-radius:8px;padding:10px 12px;white-space:pre-wrap}
    .mrlee-rempty{padding:25px;background:#f7f9fc;border-radius:12px;color:#66778a;text-align:center}
    @media(max-width:540px){.mrlee-rh{padding:14px}.mrlee-rbody{padding:15px}.mrlee-rquestion{padding:13px}}
  `;
  document.head.append(styles);
  reviewDialog = $el('dialog','mrlee-review-dialog');
  reviewDialog.setAttribute('aria-label','Xem lại bài kiểm tra');
  const header = $el('header','mrlee-rh');
  const title = $el('h2','', 'Chi tiết bài đã làm'); title.id = 'mrlee-review-title';
  reviewDialog.setAttribute('aria-labelledby',title.id);
  const close = $el('button','mrlee-rclose','Đóng ✕'); close.type='button'; close.addEventListener('click',()=>reviewDialog.close());
  header.append(title,close);
  const body = $el('div','mrlee-rbody');
  body.append($el('p','mrlee-rsummary'));
  const filters=$el('div','mrlee-rfilters'); filters.setAttribute('role','group');filters.setAttribute('aria-label','Lọc câu trả lời');
  for(const [id,label] of [['all','Tất cả'],['wrong','Câu sai'],['correct','Câu đúng'],['unanswered','Chưa trả lời']]) {
    const b=$el('button','',label); b.type='button';b.dataset.mode=id;
    b.addEventListener('click',()=>{filterMode=id;renderReview();});filters.append(b);
  }
  body.append(filters,$el('div','mrlee-review-questions'));
  reviewDialog.append(header,body);document.body.append(reviewDialog);
  return reviewDialog;
}
function renderReview() {
  const dialog=initDialog();
  dialog.querySelector('#mrlee-review-title').textContent=activeAttempt.examTitle || 'Chi tiết bài đã làm';
  const total=activeReview.length;
  const right=activeReview.filter(q=>q.selectedIndex===q.correctIndex).length;
  const wrong=activeReview.filter(q=>q.selectedIndex!==q.correctIndex && q.selectedIndex!==-1).length;
  const missed=activeReview.filter(q=>q.selectedIndex===-1).length;
  dialog.querySelector('.mrlee-rsummary').textContent=`Kết quả đã lưu: ${activeAttempt.score}/${activeAttempt.total} · ${right} đúng · ${wrong} sai · ${missed} chưa trả lời. Câu hỏi và thứ tự lựa chọn giữ nguyên như lần làm bài này.`;
  for(const b of dialog.querySelectorAll('.mrlee-rfilters button')) b.setAttribute('aria-pressed',String(b.dataset.mode===filterMode));
  const list=dialog.querySelector('.mrlee-review-questions');list.replaceChildren();
  activeReview.forEach((q,i)=>{
    const isCorrect=q.selectedIndex===q.correctIndex;
    const unanswered=q.selectedIndex===-1;
    if(filterMode==='wrong' && (isCorrect||unanswered))return;
    if(filterMode==='correct' && !isCorrect)return;
    if(filterMode==='unanswered' && !unanswered)return;
    const item=$el('article',`mrlee-rquestion ${isCorrect?'good':unanswered?'missed':'bad'}`);
    const label=`CÂU ${i+1}${Number.isInteger(q.lessonNumber)?' · BÀI '+q.lessonNumber:''} · ${isCorrect?'ĐÚNG':unanswered?'CHƯA TRẢ LỜI':'SAI'}`;
    item.append($el('span','mrlee-rqmeta',label),$el('h3','',q.question));
    q.choices.forEach((choice,j)=>{
      const isRight=j===q.correctIndex,isPicked=j===q.selectedIndex;
      const opt=$el('div','mrlee-roption'+(isRight?' right':isPicked?' wrong':''));
      const letter=$el('strong','',`${String.fromCharCode(65+j)}.`);
      const text=$el('span','',String(choice));
      opt.append(letter,text);
      if(isRight||isPicked)opt.append($el('span','mrlee-rbadge',isRight?(isPicked?'Bạn chọn · Đúng':'Đáp án đúng'):'Bạn đã chọn'));
      item.append(opt);
    });
    if(unanswered)item.append($el('p','mrlee-rexplain','Bạn chưa chọn đáp án ở câu này.'));
    if(q.explanation)item.append($el('p','mrlee-rexplain',`Giải thích: ${q.explanation}`));
    list.append(item);
  });
  if(!list.children.length)list.append($el('p','mrlee-rempty','Không có câu nào thuộc nhóm này.'));
}
function openReview(item,review){
  activeAttempt=item;activeReview=review;filterMode='all';
  renderReview();
  if(!reviewDialog.open)reviewDialog.showModal();
}
/** Hàm được gọi bởi learning-history.js sau mỗi dòng kết quả. */
export function createReviewAction(row,item) {
  if(!row||!item)return;
  const info=row.querySelector('.entry-title')?.parentElement||row;
  const actions=$el('div','mrlee-review-actions');
  const review=getReview(item);
  if(review){
    const button=$el('button','mrlee-review-btn',`Xem lại bài làm (${review.length} câu)`);
    button.type='button';button.addEventListener('click',()=>openReview(item,review));
    actions.append(button);
  }else{
    actions.append($el('span','mrlee-review-old','Lượt này chỉ lưu điểm, chưa có đáp án chi tiết.'));
  }
  const href=retryHref(item);
  if(href){const a=$el('a','mrlee-review-link','Làm lại đề');a.href=href;actions.append(a);}
  info.append(actions);
  row.style.flexWrap='wrap';
}
