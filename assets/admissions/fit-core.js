/* MR LEE | Non-binding school discovery from the local public school catalog.
   No eligibility, tuition, degree majors, school-language programs, or visa predictions.
   No names, phone numbers, birthdays or personal identifiers in this profile. */
(function(scope,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(scope)scope.MRLEE_ADMISSIONS_FIT=api;
})(typeof window!=='undefined'?window:undefined,function(){
  'use strict';
  const regions={
    all:'Toàn Hàn Quốc',seoul:'Seoul',busan:'Busan',gyeonggi:'Gyeonggi',
    incheon:'Incheon',daegu:'Daegu',daejeon:'Daejeon',
    'jeonnam-gwangju':'Jeonnam · Gwangju',chungbuk:'Chungbuk',chungnam:'Chungnam',
    gangwon:'Gangwon',gyeongbuk:'Gyeongbuk',gyeongnam:'Gyeongnam',
    jeonbuk:'Jeonbuk',ulsan:'Ulsan',jeju:'Jeju',sejong:'Sejong'
  };
  const goals={language:'Học tiếng',college:'Cao đẳng',university:'Đại học',graduate:'Sau đại học',undecided:'Cần định hướng'};
  const stages={highschool:'Đang học THPT',graduated:'Đã tốt nghiệp THPT',undergrad:'Đang học CĐ/ĐH',degree:'Đã tốt nghiệp CĐ/ĐH'};
  const korean={none:'Chưa học',beginner:'Mới bắt đầu',topik12:'TOPIK 1–2',topik34:'TOPIK 3–4',topik56:'TOPIK 5–6',unknown:'Chưa rõ'};
  const fields={undecided:'Chưa chọn ngành',business:'Kinh tế / quản trị',technology:'Công nghệ / kỹ thuật',design:'Thiết kế / nghệ thuật',health:'Y tế / sức khỏe',language:'Ngôn ngữ / xã hội'};
  const pick=(values,value,def)=>Object.hasOwn(values,String(value))?String(value):def;
  function normalizeProfile(p){
    const x=p&&typeof p==='object'?p:{};
    return {
      goal:pick(goals,x.goal,'undecided'),
      stage:pick(stages,x.stage,'highschool'),
      korean:pick(korean,x.korean,'unknown'),
      region:pick(regions,x.region,'all'),
      field:pick(fields,x.field,'undecided')
    };
  }
  function classify(s){
    const str=String(s?.ko||'')+' '+String(s?.en||'');
    if(/대학원|Graduate School|Law School|School of Medicine|Theological Seminary|Professional Graduate|전문대학원/i.test(str))return null;
    if(s?.type==='university')return 'university';
    if(s?.type==='college'&&/전문대학|대학교|대학|College|Institute|Polytech|University/i.test(str))return 'college';
    return null;
  }
  function regionFor(s){
    const r=String(s?.campuses?.[0]?.region||'');
    if(r==='jeonnam'||r==='gwangju')return 'jeonnam-gwangju';
    return Object.hasOwn(regions,r)?r:'';
  }
  function nameFor(s){return String(s?.vi||s?.en||s?.ko||'').trim()}
  function recommend(catalog,raw,limit=6){
    const profile=normalizeProfile(raw),schools=Array.isArray(catalog)?catalog:[];
    // The source type data mislabels independent graduate schools as colleges.
    // Never recommend those as junior colleges, and do not infer majors or admission.
    const allowed=profile.goal==='college'?['college']:
      ['university','graduate','language'].includes(profile.goal)?['university']:
      ['university','college'];
    const candidates=schools.map(s=>({school:s,kind:classify(s),region:regionFor(s)}))
      .filter(x=>x.kind&&allowed.includes(x.kind)&&x.region&&nameFor(x.school))
      .filter(x=>!/(?:deprecated|closed)/i.test(String(x.school?.status||'')));
    const score=x=>{
      let n=0;
      if(profile.region!=='all'&&x.region===profile.region)n+=100;
      if(profile.goal==='undecided'&&x.kind==='university')n+=2;
      if(/사이버|Cyber University|원격대학/i.test(x.school.ko+' '+x.school.en))n-=15;
      if(/국립|National University/i.test(x.school.ko+' '+x.school.en))n+=1;
      return n;
    };
    // Include both degree tiers for undecided visitors instead of reporting only universities.
    candidates.sort((a,b)=>score(b)-score(a)||
      nameFor(a.school).localeCompare(nameFor(b.school),'vi'));
    const uniq=new Set(),items=[];
    const push=x=>{
      const key=String(x.school.ko||x.school.en||'').normalize('NFKC').toLowerCase();
      if(uniq.has(key))return;
      uniq.add(key);items.push({
        id:String(x.school.id||''),name:nameFor(x.school),ko:String(x.school.ko||''),
        type:x.kind,region:x.region,regionLabel:regions[x.region]||x.region,
        website:/^https:\/\/[a-z\d.-]+(?:\/|$)/i.test(String(x.school.website||''))?String(x.school.website):'',
        note:x.kind==='college'?'Trường thuộc nhóm cao đẳng trong dữ liệu tham khảo':
          'Trường thuộc nhóm đại học trong dữ liệu tham khảo'
      });
    };
    if(profile.goal==='undecided'){
      for(const kind of ['college','university']){
        for(const x of candidates.filter(y=>y.kind===kind).slice(0,Math.min(3,limit)))push(x);
      }
    }
    for(const x of candidates)if(items.length<limit)push(x);
    return {profile,total:candidates.length,items:items.slice(0,limit),source:'university-map/universities.json'};
  }
  return {normalizeProfile,recommend,classify,regions,goals,stages,korean,fields};
});
