/* V31 evidence links — source transparency, not an unsupported claim that all campus records were checked. */
(()=>{'use strict';
const page=location.pathname.split('/').pop().toLowerCase();
if(!['tuyen-sinh.html','ban-do-dai-hoc-han-quoc.html','dang-ky-tu-van.html'].includes(page))return;
function build(){
 const main=document.querySelector('main');if(!main||document.getElementById('mrleeV31Sources'))return;
 const sec=document.createElement('aside');sec.id='mrleeV31Sources';sec.className='mrlee-v31-sources';sec.setAttribute('aria-label','Nguồn đối chiếu thông tin du học chính thức');
 const heading=document.createElement('h2');heading.textContent='Nguồn đối chiếu chính thức • Du học Hàn Quốc';
 const note=document.createElement('p');note.textContent='Thông tin về chỉ tiêu, học phí, ký túc xá, học bổng, lịch tuyển sinh và visa có thể thay đổi. Gợi ý trường trên MR LEE chỉ mang tính định hướng; phải kiểm tra thông báo gốc của trường và cơ quan có thẩm quyền trước khi nộp hồ sơ.';
 const ul=document.createElement('ul');
 const sources=[
 ['Study in Korea — cổng chính phủ Hàn Quốc','https://www.studyinkorea.go.kr/'],
 ['GKS — thông tin học bổng & trường tham gia','https://www.studyinkorea.go.kr/swb/plan/scholarship.do?tab=gks-tab1'],
 ['Cơ quan đại diện Hàn Quốc tại Việt Nam — thị thực','https://overseas.mofa.go.kr/vn-vi/index.do'],
 ['Thông tin loại visa D-2 và D-4 — Study in Korea','https://gks.go.kr/ko/plan/visaAndStay.do']
 ];
 for(const [label,url] of sources){const li=document.createElement('li'),a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=label;li.append(a);ul.append(li)}
 sec.append(heading,note,ul);
 const target=document.querySelector('#mrleeV31Gallery');if(target)target.before(sec);else main.append(sec);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});else build();
})();