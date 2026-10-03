/* ===== 공통 ===== */
const $=id=>document.getElementById(id);
const KAKAO_URL='https://open.kakao.com/o/sACnsFNi';
const PAGE=document.body.dataset.page||'index';
const PAGE_ORDER=['portfolio','pricing','process','contact'];

/* ===== 원본 기능 로직 (Studio Genilo) ===== */
const OPTIONS=[['section','구역 추가',33000,'제공된 글·사진으로 기존 페이지에 구성'],['page','일반 소개 페이지 추가',77000,'기존 디자인 기준, 최대 4개 구역'],['custom','별도 디자인 페이지',150000,'범위 확인 후 확정'],['revision','수정 횟수 추가',33000,'기존 구성 내 30분 이내 작업'],['copy','소개 문구 작성',55000,'고객 자료·인터뷰 기준 최대 5개 구역'],['photo','사진 보정',33000,'최대 10장, 단순 보정·크기 정리'],['banner','배너 제작',33000,'고객 문구 제공, 시안 1개·수정 1회'],['booking','외부 예약·상담 서비스 연결',33000,'링크 또는 삽입'],['form','문의폼 추가',55000,'기본 항목 5개 이내'],['domain','도메인 최초 연결 대행',22000,'도메인 구매비 별도'],['card','명함 맞춤 디자인',20000,'앞뒤 1종·수정 1회'],['print','명함 인쇄 주문 대행',11000,'인쇄비·배송비 별도']];
const money=n=>new Intl.NumberFormat('ko-KR').format(Math.round(n))+'원';
if($('optionTable'))$('optionTable').innerHTML=OPTIONS.map(o=>`<tr><td>${o[1]}</td><td>${money(o[2])}${['custom','booking','form'].includes(o[0])?'부터':''}</td><td>${o[3]}</td></tr>`).join('');

const PLAN_LABEL={budget:'실속형',basic:'기본형',premium:'프리미엄형'};
function saveQuick(q){try{localStorage.setItem('sg_quick',JSON.stringify(q))}catch{}}
function loadQuick(){try{return JSON.parse(localStorage.getItem('sg_quick')||'null')}catch{return null}}
function quickData(){
  const typeEl=document.querySelector('input[name="quickType"]:checked');if(!typeEl)return loadQuick();
  const type=typeEl.value;const features=[...document.querySelectorAll('.quickFeature:checked')].map(x=>x.value);
  let plan='budget',name='실속형 홈페이지',price='159,000원부터',desc='한 페이지로 사업 소개와 연락 방법을 빠르게 안내하는 구성입니다.';
  if(type==='multi'||features.includes('문의폼')||features.includes('예약 문의')||features.includes('게시판')){plan='basic';name='기본형 홈페이지';price='299,000원부터';desc='서비스 소개와 고객 문의 연결을 함께 정리하는 기본 구성입니다.'}
  if(features.includes('예약 문의')&&features.includes('게시판')){plan='premium';name='프리미엄형 홈페이지';price='599,000원부터';desc='여러 페이지와 추가 기능을 사업에 맞게 구성하는 상담형 제작입니다.'}
  $('quickPlanName').textContent=name;const qp=$('quickPrice');if(qp.textContent!==price){qp.classList.add('bump');setTimeout(()=>qp.classList.remove('bump'),400)}qp.textContent=price;$('quickDescription').textContent=desc;
  const q={plan,name,price,desc,type,features,industry:$('quickIndustry').value};saveQuick(q);return q}
function choosePlan(plan){const radio=document.querySelector(`input[name="quickType"][value="${plan==='budget'?'one':'multi'}"]`);if(radio)radio.checked=true;if(plan==='premium')document.querySelectorAll('.quickFeature').forEach(x=>{if(x.value==='예약 문의'||x.value==='게시판')x.checked=true});quickData()}
if($('quickIndustry')){
  document.querySelectorAll('#estimate input,#estimate select').forEach(el=>el.addEventListener('change',quickData));
  const p=new URLSearchParams(location.search).get('plan');if(p&&PLAN_LABEL[p])choosePlan(p);else quickData();
}
document.querySelectorAll('.select-quick').forEach(a=>a.addEventListener('click',()=>{if($('quickIndustry'))choosePlan(a.dataset.plan)}));
async function copyText(text){try{await navigator.clipboard.writeText(text);return true}catch{return false}}
function inquiryText(){
  const q=quickData()||{};const interest=$('interest');const company=($('company')||{}).value||'',phone=($('phone')||{}).value||'',message=($('message')||{}).value||'';
  const interestText=interest?interest.value:(PLAN_LABEL[q.plan]||'상담 전 선택');
  return `[Studio Genilo 홈페이지 제작 상담]\n업체명/이름: ${company.trim()||'미입력'}\n연락처: ${phone.trim()||'미입력'}\n관심 상품: ${interestText}\n업종: ${q.industry||'미선택'}\n홈페이지 형태: ${q.type==='one'?'한 페이지 소개형':q.type==='multi'?'여러 페이지형':q.type==='unknown'?'아직 미정':'미선택'}\n필요 기능: ${q.features&&q.features.length?q.features.join(', '):'미선택'}\n\n문의 내용:\n${message.trim()||'미입력'}`}
if($('quickConsult'))$('quickConsult').onclick=async()=>{await copyText(inquiryText());window.open(KAKAO_URL,'_blank','noopener');};
if($('interest')){const q=loadQuick();if(q&&PLAN_LABEL[q.plan])$('interest').value=PLAN_LABEL[q.plan]}
if($('kakaoInquiry'))$('kakaoInquiry').onclick=async()=>{const phone=$('phone'),message=$('message'),privacy=$('privacy'),formResult=$('formResult'),success=$('formSuccess');if(!phone.value.trim()||!message.value.trim()||!privacy.checked){success.classList.remove('show');formResult.style.color='var(--red)';formResult.textContent='연락처, 문의 내용, 개인정보 동의는 필수입니다.';return}const copied=await copyText(inquiryText());formResult.textContent='';success.classList.add('show');if(!copied)success.textContent='카카오톡 채널을 엽니다. 위 문의 내용을 직접 복사해 채팅창에 붙여넣어 보내 주세요.';window.open(KAKAO_URL,'_blank','noopener');};
const FAQ=[['159,000원에 어디까지 포함되나요?','실속형은 한 페이지·최대 5개 구역, 준비된 디자인 선택, PC·모바일 대응, 전화·카카오톡·지도 및 외부 문의 링크 연결, 검색 기본 설정, 제작 중 수정 1회, 기존 명함 틀을 활용한 인쇄용 파일 1종을 포함합니다. 고객 제공 글·사진·로고 기준으로 제작합니다.'],['도메인과 호스팅은 별도인가요?','네. 도메인, 호스팅, 홈페이지 빌더, 문자·이메일·예약 서비스 등 외부 서비스 비용은 제작비와 별도입니다. 고객 명의 계정에서 직접 결제하는 방식을 권장합니다.'],['유지보수 가입은 필수인가요?','아닙니다. 유지보수는 선택 사항이며, 미가입 상태에서도 홈페이지는 유지됩니다. 수정이 필요하면 건별로 요청할 수 있습니다.'],['모바일에서도 사용할 수 있나요?','네. 모든 제작 상품은 PC와 모바일 화면에 맞춰 사용할 수 있도록 제작합니다.'],['수정은 몇 번 가능한가요?','실속형 1회, 기본형 2회, 프리미엄형 3회입니다. 기존에 합의한 구성 안에서의 변경을 뜻하며 전체 디자인 변경과 기능 추가는 별도 견적입니다.'],['제작 기간은 얼마나 걸리나요?','실속형은 3~5영업일, 기본형은 5~10영업일, 프리미엄형은 10~15영업일이 예상됩니다. 자료와 착수금이 모두 접수된 이후부터 계산합니다.'],['검색 상위 노출을 보장하나요?','아니요. 제목·설명·공유 이미지 같은 검색 기본 설정과 등록 지원은 제공하지만, 검색 결과의 상위 노출 순위는 보장하지 않습니다.'],['결제·예약·회원가입 기능도 가능한가요?','가능 여부와 비용은 기능 범위를 확인한 뒤 별도 상담으로 안내합니다. 회원가입, 결제, 자체 예약 시스템, 관리자 페이지, 데이터베이스 구축은 고정 가격 항목이 아닙니다.']];
if($('faqList')){$('faqList').innerHTML=FAQ.map(x=>`<div class="faq-item"><button class="faq-q" type="button"><span>${x[0]}</span><span>+</span></button><div class="faq-a"><div>${x[1]}</div></div></div>`).join('');document.querySelectorAll('.faq-q').forEach(q=>q.onclick=()=>q.parentElement.classList.toggle('open'))}
const modal=$('previewModal'),previewImage=$('previewImage'),previewTitle=$('previewTitle');
function closePreview(){if(!modal)return;modal.classList.remove('open');document.body.style.overflow=''}
if(modal){document.querySelectorAll('.preview-btn').forEach(b=>b.onclick=()=>{previewImage.src=b.dataset.image;previewImage.alt=b.dataset.title+' 확대 이미지';previewTitle.textContent=b.dataset.title+' 미리보기';modal.classList.add('open');document.body.style.overflow='hidden'});$('previewClose').onclick=closePreview;modal.onclick=e=>{if(e.target===modal)closePreview()}}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closePreview();closeMenu()}});

/* ===== 헤더 / 모바일 메뉴 / 활성 메뉴 ===== */
const header=$('header'),menuBtn=$('menuBtn'),mobileMenu=$('mobileMenu');
function closeMenu(){mobileMenu.classList.remove('open');menuBtn.textContent='☰';document.body.style.overflow=''}
menuBtn.onclick=()=>{const open=!mobileMenu.classList.contains('open');mobileMenu.classList.toggle('open',open);menuBtn.textContent=open?'×':'☰';document.body.style.overflow=open?'hidden':''};
mobileMenu.querySelectorAll('a').forEach(a=>a.onclick=closeMenu);
document.querySelectorAll('#navLinks a').forEach(a=>a.classList.toggle('active',a.dataset.page===PAGE));
const pageIdx=PAGE_ORDER.indexOf(PAGE);document.querySelectorAll('#dots i').forEach((d,i)=>d.classList.toggle('on',i===pageIdx));
let lastY=0;
const themed=[...document.querySelectorAll('section[data-theme]')];const baseTheme=document.body.dataset.theme||'dark';

/* ===== 스크롤: 미터, 헤더 숨김, 테마 전환, 프로세스 진행선, 마퀴 ===== */
const tick=$('tick'),pct=$('scrollPct');
function onScroll(){
  const y=scrollY,max=document.documentElement.scrollHeight-innerHeight,p=max>0?Math.min(1,y/max):0;
  tick.style.top=(p*58)+'px';pct.textContent=String(Math.round(p*100)).padStart(3,'0')+'%';
  header.classList.toggle('hide',y>lastY&&y>300&&!mobileMenu.classList.contains('open'));lastY=y;
  if(themed.length){const probe=y+innerHeight*.45;let theme=baseTheme;for(const s of themed){if(s.offsetTop<=probe)theme=s.dataset.theme}if(document.body.dataset.theme!==theme)document.body.dataset.theme=theme}
  const rail=$('processRail');if(rail){const r=rail.getBoundingClientRect();const prog=Math.min(1,Math.max(0,(innerHeight*.8-r.top)/(r.height+innerHeight*.3)));$('processFill').style.width=(prog*100)+'%';const steps=rail.querySelectorAll('.step');steps.forEach((s,i)=>s.classList.toggle('done',(i+1)/steps.length<=prog+.02))}
  const track=$('marqueeTrack');if(track){track.style.transform=`translateX(${-(y*.35)%(track.scrollWidth/2||1)}px)`}
}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);

/* ===== 마퀴 ===== */
(function(){const t=$('marqueeTrack');if(!t)return;const words=['Studio Genilo','AI STUDIO GENILO','웹 앱 제작','AI × WEB APP','기획 · 디자인 · 개발','제작 사례','간단 견적','카카오톡 상담'];let html='';for(let r=0;r<4;r++)words.forEach(w=>html+=`<span>${w}</span>`);t.innerHTML=html})();

/* ===== 리빌 / 스크램블 ===== */
const GLYPHS='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/|[]{}#%&*+=~가나다라마바사아자차카타파하ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ';
function scramble(el){if(el.dataset.done)return;el.dataset.done=1;const final=el.textContent;const len=final.length;const start=performance.now(),dur=900+len*25;el.style.minWidth=el.offsetWidth+'px';(function frame(now){const t=Math.min(1,(now-start)/dur);let out='';for(let i=0;i<len;i++){const c=final[i];if(c===' '||c==='·'){out+=c;continue}out+=(i/len<t)?c:GLYPHS[Math.floor(Math.random()*GLYPHS.length)]}el.textContent=out;if(t<1)requestAnimationFrame(frame);else{el.textContent=final;el.style.minWidth=''}})(start)}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');e.target.querySelectorAll('.scramble').forEach(scramble);if(e.target.classList.contains('scramble'))scramble(e.target);io.unobserve(e.target)}}),{threshold:.12});
(window.SG_READY||Promise.resolve()).then(()=>document.querySelectorAll('.reveal,.stagger,.hero .scramble').forEach(el=>io.observe(el)));

/* ===== 히어로 단어 등장 ===== */
(function(){const h=$('heroTitle');if(!h)return;const parts=h.innerHTML.split('<br>');let i=0;h.innerHTML=parts.map(line=>line.trim().split(' ').map(w=>`<span class="word" style="animation-delay:${.8+i++*.09}s">${w}</span>`).join(' ')).join('<br>')})();

/* ===== 카드 스포트라이트 & 커서 글로우 ===== */
const cursor=$('cursor');
document.addEventListener('pointermove',e=>{cursor.style.transform=`translate(${e.clientX-180}px,${e.clientY-180}px)`;const el=e.target.closest('.card');if(el){const r=el.getBoundingClientRect();el.style.setProperty('--mx',(e.clientX-r.left)+'px');el.style.setProperty('--my',(e.clientY-r.top)+'px')}},{passive:true});
document.addEventListener('pointerleave',()=>cursor.style.opacity=0);document.addEventListener('pointerenter',()=>cursor.style.opacity=1);
if(matchMedia('(hover:none)').matches)cursor.style.display='none';

/* ===== 지구본 (홈) · AI 네트워크 홀로그램 ===== */
(function(){
  const cv=$('globe');if(!cv)return;
  const LAND_B64='AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADf//8AAf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////D//////n/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/gf/x////////wAAAAAbgAAB4AAAAAAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAf//8A///////+AAAAB/ngAAAAAAAAAAH8AAAAAAAAAAAAAAAAAAAAAAAAcH3Hv/5////////8AAAAA/gAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAcIAAQP/AH///////+AAAAAPCAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAADwDAc+f+AP///////4AAAAAAAAAAAAAB4AAAAB/8AAAAAAAAAAAAAAAAAAAAAH9wc374AAAf/////8AAAAAAAAAAAAH4AAAA////AAAB/gAAAAAAAAAAAAAAAAwAAA/QAAAH/////8AAAAAAAAAAAAOAAAAP///wAAAAAAAAAAAAAAAAAAAAP8AYe+c3AAAD/////4AAAAAAAAAAAA4AAAH////++HgAOAAAAAAAAAAAAAAAfv+4+w/4gAAB/////wAAAAAAAAAAADwAHgH///////4AfgAAAAAgAAAAAAAAPf/4O4//9AAB/////wAAAAAAAAAAADwAPb////////4m//gAAAAAAAf+AAAAAA/+A8f//4AB////8gAAAAAAA/gAAAAAfv/////////////8AAAAAB///+H//H/+PeDwf+AA3////AAAAAAA//4AAAA8fv///////////////P8gAf////////A4CPz4H8AAP///wAAAAAAD///wADH/n3/////////////////8AD////////////34Z/wA///4AAAAAAAP///+M////n/////////////////+4E/////////////gD/8Af//gAAAAAAAf//5+P////f/////////////////fw/////////////6AD8YAf/wAAf8AAAA/8f+D///////////////////////AgEf///////////zw7/AAP/gAAP4AAAB/4/+f//////////////////////8AMAf//////////+DIA/gAH/gAAAAAAAH/z/////////////////////////+AAH///////////8AwgOAAD+AAAAAAAA//H/////////////////////////6AAP///////////wAA/AAAB+AAAAAAAB/+H//////////////////////nP+AAAH//z////////wAA/wAAAOAAAAAAAB//D/////////////////////+A/4AAAA/zAD///////gAA/4wAAAAAAAAAAB//Ab///////////////////+eDgAAAAABwAA///////4AA/94AAAAAAAAAYA5+A///////////////////4AAHAAAAAADcAAD//////4AAf/8AAAAAAAAA8AC+C///////////////////wAAfgAAAAAMAAAA///////wAf/8AAAAAAAAA4AO8H///////////////////AAA/gAAAABgAAAA///////8A///AAAAAAAAA8ANwH//////////////////8AAB/AAAAAEAAAAAf///////z///4AAAAAAAHOAEDv//////////////////+AAA+AAAAAAAAAABH///////x///8AAAAAAAHHAf/////////////////////6AA8AAAAAAAAAAAD///////x///8AAAAAAAGPz//////////////////////6AAwAAAAAAAAAAAD///////9///6AAAAAAAAPj//////////////////////6AAQAAAAAAAAAAAC///////////MAAAAAAAAYf//////////////////////7AAAAAAAAAAAAAABv////////+MNAAAAAAAAD///////////////////////zAAAAAAAAAAAAAAAH////////7gfgAAAAAAAf///////////////////////yAAAAAAAAAAAAAAAL/////////gCgAAAAAAAH///////////////////////iAAAAAAAAAAAAAAAP/////////pAAAAAAAAAD/////uP/x//////////////DAAAAAAAAAAAAAAAP/////////+AAAAAAAAAB//v//Gf/B/////////////+AAAAAAAAAAAAAAAAP////////8wAAAAAAAAAB//H/+AP+P/////////////8CAAAAAAAAAAAAAAAP////////wAAAAAAAAADj/jz/8AD/H/////////////4HgAAAAAAAAAAAAAAP////////gAAAAAAAAAH/4Bw/8AA/B////////////+APAAAAAAAAAAAAAAAP////////gAAAAAAAAAH/wA8f8Ph/g////////////8AAAAAAAAAAAAAAAAAP///////8AAAAAAAAAAH/gMHfJ///x///////////v4AMAAAAAAAAAAAAAAAP///////8AAAAAAAAAAH/AMCOP///h//////////+JwAMAAAAAAAAAAAAAAAH///////4AAAAAAAAAAH/AAAHH///g//////////8BwAIAAAAAAAAAAAAAAAH///////wAAAAAAAAAAH+AAYGH///w//////////+w4A4AAAAAAAAAAAAAAAD///////wAAAAAAAAAAAgf+ACBs//////////////g4D4AAAAAAAAAAAAAAAB///////wAAAAAAAAAAAj/+AAAA//////////////AYf4AAAAAAAAAAAAAAAA///////gAAAAAAAAAAB//8AAAA//////////////Ah2AAAAAAAAAAAAAAAAAP/////+AAAAAAAAAAAD//+AAAB//////////////gDwAAAAAAAAAAAAAAAAAH/////8AAAAAAAAAAAH///4GAB//////////////gDAAAAAAAAAAAAAAAAAAG/////4AAAAAAAAAAAP///8P4h//////////////wCAAAAAAAAAAAAAAAAAACf////4AAAAAAAAAAAP////v////////////////gAAAAAAAAAAAAAAAAAAABP//hgYAAAAAAAAAAAP//////3//P///////////wAAAAAAAAAAAAAAAAAAAAv//AAYAAAAAAAAAAAf//////9//H///////////wAAAAAAAAAAAAAAAAAAAB3/+AAcAAAAAAAAAAB///////4//h///////////gAAAAAAAAAAAAAAAAAAAAR/+AANAAAAAAAAAAD///////8//wH//////////AAAAAAAAAAAAAAAAAAAAAJ/+AAEAAAAAAAAAAH///////+f/0B/////////+AAAAAAAAAAAAAAAAAAAAAI/8AAAAAAAAAAAAAH///////+f/44Af///////+QAAAAAAAAAAAAAAAAAAAAAf8AAAAAAAAAAAAAP////////H//+AP///////4gAAAAAAAAAAAAAAAAAAAAAP8AAuAAAAAAAAAAP////////H///AD///v///ggAAAAAAAAAAAAAAAAAAAAAH+AABgAAAAAAAAAf////////n//+AD//4P//YAAAAAAAAAAAAAAAAAAAAAAAP+A4AYAAAAAAAAAP////////j//+AAf/4H/+AAAAAAAAAAAAAAAAgAAAAAAAH/B4ABwAAAAAAAAP////////h//8AAf/gD/8YAAAAAAAAAAAAAAAAAAAAAAAD/nwAD9AAAAAAAAP////////x//4AAf/AD/8QAAAAAAAAAAAAAAAAAAAAAAAAf/wAAAAAAAAAAAP////////4//gAAf+AD/+AAwAAAAAAAAAAAAAAAAAAAAAAH/wAAAAAAAAAAAf////////4f+AAAf8AD//AAwAAAAAAAAAAAAAAAAAAAAAAAH/AAAAAAAAAAAf////////8f8AAAPwAAP/gAwAAAAAAAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAf////////+fgAAAPwAAP/gAwAAAAAAAAAAAAAAAAAAAAAAAA/AAAAAAAAAAAf/////////eAAAAHwAAP/gAMAAAAAAAAAAAAAAAAAAAAAAAAHgAAAAAAAAAAf/////////gAAAAHwAAM/gACAAAAAAAAAAAAAAAAAAAAAAAADABAAAAAAAAAP/////////gYAAADwAAEfgAJAAAAAAAAAAAAAAAAAAAAAAAADgPfKAAAAAAAH/////////34AAADwAAIOABAAAAAAAAAAAAAAAAAAAAAAAAAAyPf+AAAAAAAD//////////4AAADoAAIEACBAAAAAAAAAAAAAAAAAAAAAAAAA8///AAAAAAAB//////////wAAABIAAMAAAFAAAAAAAAAAAAAAAAAAAAAAAAAE///gAAAAAAB//////////wAAAAMAAEAAALgAAAAAAAAAAAAAAAAAAAAAAAAAf//wAAAAAAAf/////////gAAAAMAADAAMCAAAAAAAAAAAAAAAAAAAAAAAAAA////gAAAAAAP/B///////gAAAAAAADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAf///wAAAAAACAA///////AAAAAAAAxgA+AAAAAAAAAAAAAAAAAAAAAAAAAAAf///4AAAAAAAAAD/////+AAAAAAAAZgB4AAAAAAAAAAAAAAAAAAAAAAAAAAB////4AAAAAAAAAD/////8AAAAAAAAMwH8AAAAAAAAAAAAAAAAAAAAAAAAAAB////8AAAAAAAAAH/////4AAAAAAAAHQf8AIAAAAAAAAAAAAAAAAAAAAAAAAD////8AAAAAAAAAH/////gAAAAAAAAHgf88IAAAAAAAAAAAAAAAAAAAAAAAAD////+AAAAAAAAAH/////AAAAAAAAADwf8AAgAAAAAAAAAAAAAAAAAAAAAAAH/////4AAAAAAAAH/////AAAAAAAAABwP5wBwAAAAAAAAAAAAAAAAAAAAAAAH/////6AAAAAAAAD////+AAAAAAAAAB8P5wATwAAAAAAAAAAAAAAAAAAAAAAD//////4AAAAAAAB////8AAAAAAAAAA8AxQif+AAAAAAAAAAAAAAAAAAAAAAH//////8AAAAAAAB////4AAAAAAAAAAcAAIAD/gAAAAAAAAAAAAAAAAAAAAAH///////gAAAAAAA////4AAAAAAAAAAMAAIAI/ywAAAAAAAAAAAAAAAAAAAAH///////gAAAAAAA////4AAAAAAAAAADgAAAI/8BAAAAAAAAAAAAAAAAAAAAD///////gAAAAAAAf///4AAAAAAAAAAB+AAAA/4AIAAAAAAAAAAAAAAAAAAAB///////gAAAAAAAf///4AAAAAAAAAAAAmogAOMAAAAAAAAAAAAAAAAAAAAAB///////AAAAAAAAf///8AAAAAAAAAAAABCAAAGADAAAAAAAAAAAAAAAAAAAA///////AAAAAAAAf///8AAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAf/////+AAAAAAAAP///8AAAAAAAAAAAAAAAgCAAAAAAAAAAAAAAAAAAAAAAAf/////8AAAAAAAAf///+AQAAAAAAAAAAAAB+CAAAAAAAAAAAAAAAAAAAAAAAP/////4AAAAAAAAf///+AQAAAAAAAAAAAAD8DAAAAAAAAAAAAAAAAAAAAAAAP/////4AAAAAAAA////+AwAAAAAAAAAAAA38DgAAAAAAAAAAAAAAAAAAAAAAH/////4AAAAAAAA////8BwAAAAAAAAAAAD/8DgAAAAAAAAAAAAAAAAAAAAAAB/////4AAAAAAAA////8PwAAAAAAAAAAAD//HwAABABAAAAAAAAAAAAAAAAAAf////4AAAAAAAA////wPgAAAAAAAAAAAP//3wAAAACAAAAAAAAAAAAAAAAAAP////wAAAAAAAA////APgAAAAAAAAAAAP///wAAAAAAAAAAAAAAAAAAAAAAAP////wAAAAAAAAf//+APgAAAAAAAAAAAf///4AAAAAAAAAAAAAAAAAAAAAAAP////wAAAAAAAAf//+APgAAAAAAAAAAD////+AAIAAAAAAAAAAAAAAAAAAAAP////gAAAAAAAAP//+AfAAAAAAAAAAAf////+AAEAAAAAAAAAAAAAAAAAAAAP////AAAAAAAAAP///AfAAAAAAAAAAA//////AAAAAAAAAAAAAAAAAAAAAAAP///4AAAAAAAAAP//+APAAAAAAAAAAA//////gAAAAAAAAAAAAAAAAAAAAAAf///gAAAAAAAAAH//+AOAAAAAAAAAAB//////wAAAAAAAAAAAAAAAAAAAAAAf///AAAAAAAAAAH//4AEAAAAAAAAAAA//////4AAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAH//4AAAAAAAAAAAAB//////4AAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAH//4AAAAAAAAAAAAA//////4AAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAD//wAAAAAAAAAAAAAf/////8AAAAAAAAAAAAAAAAAAAAAAf//8AAAAAAAAAAB//gAAAAAAAAAAAAAf/////4AAAAAAAAAAAAAAAAAAAAAA///8AAAAAAAAAAB//gAAAAAAAAAAAAAf/////4AAAAAAAAAAAAAAAAAAAAAA///4AAAAAAAAAAA//AAAAAAAAAAAAAAP/////4AAAAAAAAAAAAAAAAAAAAAAf//wAAAAAAAAAAA/+AAAAAAAAAAAAAAP/AP//wAAAAAAAAAAAAAAAAAAAAAA///gAAAAAAAAAAA/4AAAAAAAAAAAAAAf8AG//gAAAAAAAAAAAAAAAAAAAAAA//3AAAAAAAAAAAAYAAAAAAAAAAAAAAAOAAF//gAAAAAAAAAAAAAAAAAAAAAB//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AAABAAAAAAAAAAAAAAAAAAB//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAgAAAAAAAAAAAAAAAAAD//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAQAAAAAAAAAAAAAAAAAB//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYAAAAcAAAAAAAAAAAAAAAAAB/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAADQAAAAAAAAAAAAAAAAAD/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAHAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAOAAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAH/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAAAAAAAAAAH4AAAAAAB4HgAD8AAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAA//AAAD//////////wAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAf///4Af///////////AAAAAAAAAAAAAAAAAAAAAAAz4AAAAAAAAAAAAAAAPz////8B/////////////wAAAAAAAAAAAAAAAAAAAAA78AAAAAAAAAAA8/8///////wf/////////////+AAAAAAAAAAAAAAAAAAAAH9+AAAAAAAAZ////////////w////////////////4AAAAAAAAAAAAAAAAAAAB+AAAAAAAB//////////////////////////////4AAAAAAAAABmAAB8f+HB/+AAAAAAAP//////////////////////////////gAAAAAAAAP/c/oAf/////4AAAAAAAP/////////////////////////////8AAAAAAAD/////////////gAAAAAAB//////////////////////////////wAAAAAAAD////////////wAAAAAAP///////////////////////////////wAAAAAD/////////////4AAAAAAD////////////////////////////////wAAAADh/////////////AAAAB8A/////////////////////////////////+AAAAA4Af///////////gAAAH+AA///////////////////////////////+AAAAAAAAH///////////+A/A/wAA///////////////////////////////8AAAAAAAf//////////////gAAAf////////////////////////////////+AAAAAAAH///////////////h////////////////////////////////////wAAAAAAP/////////////////////////////////////////////////////gA+/gAAH/////////////////////////////////////////////////////8/////v//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////';
  const W=360,H=180;const raw=atob(LAND_B64);const land=new Uint8Array(W*H);for(let i=0;i<raw.length;i++){const b=raw.charCodeAt(i);for(let k=0;k<8;k++)land[i*8+k]=(b>>(7-k))&1}
  const isLand=(lat,lon)=>{const px=Math.floor((lon+180)/360*W)%W,py=Math.min(H-1,Math.floor((90-lat)/180*H));return land[py*W+px]};
  const pts=[];const STEP=2.4;
  for(let lat=-88;lat<=88;lat+=STEP){const cos=Math.cos(lat*Math.PI/180);const n=Math.max(1,Math.round(360/STEP*cos));for(let i=0;i<n;i++){const lon=-180+i*360/n+(lat/STEP%2?180/n:0);if(isLand(lat,lon)){const la=lat*Math.PI/180,lo=lon*Math.PI/180;pts.push([Math.cos(la)*Math.cos(lo),Math.sin(la),Math.cos(la)*Math.sin(lo)])}}}
  const toV=(lat,lon)=>{const la=lat*Math.PI/180,lo=lon*Math.PI/180;return [Math.cos(la)*Math.cos(lo),Math.sin(la),Math.cos(la)*Math.sin(lo)]};
  const HOME=[37.548,126.957];const CITIES=[[35.68,139.69],[1.35,103.82],[-33.87,151.21],[25.2,55.27],[51.5,-.12],[40.71,-74.0],[34.05,-118.24],[-23.55,-46.63],[19.43,-99.13],[55.75,37.62]];
  const arcs=CITIES.map((c,i)=>({a:toV(HOME[0],HOME[1]),b:toV(c[0],c[1]),phase:i*.37}));
  /* 뉴럴 노드/링크: 대륙 점 중 일부를 결정적으로 선택 */
  let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  const nodes=[];while(nodes.length<110&&pts.length)nodes.push(pts[Math.floor(rnd()*pts.length)]);
  const links=[];for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j];const d=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);if(d<.36&&rnd()<.6)links.push([i,j,rnd()*Math.PI*2])}
  const RINGS=[{tilt:1.15,spin:.35,phase:0},{tilt:-.6,spin:-.25,phase:2}];
  const wrap=$('globeWrap'),online=$('online');const ctx=cv.getContext('2d');
  let size=0,dpr=1;function resize(){const r=wrap.getBoundingClientRect();size=r.width;dpr=Math.min(2,devicePixelRatio||1);cv.width=size*dpr;cv.height=size*dpr}resize();addEventListener('resize',resize);
  let rot=-2.2,vel=.0022,tilt=.32,drag=null,hover=false;
  wrap.addEventListener('pointerdown',e=>{drag={x:e.clientX,r:rot};wrap.setPointerCapture(e.pointerId)});
  wrap.addEventListener('pointermove',e=>{if(drag){const d=(e.clientX-drag.x)/size*3;rot=drag.r+d;vel=0}});
  wrap.addEventListener('pointerup',()=>{drag=null;vel=.0022});wrap.addEventListener('pointercancel',()=>{drag=null;vel=.0022});
  wrap.addEventListener('pointerenter',()=>hover=true);wrap.addEventListener('pointerleave',()=>hover=false);
  const light=()=>document.body.dataset.theme==='light';
  function project(v){const [x,y,z]=v;const cr=Math.cos(rot),sr=Math.sin(rot);let x1=x*cr-z*sr,z1=x*sr+z*cr;const ct=Math.cos(tilt),st=Math.sin(tilt);let y2=y*ct-z1*st,z2=y*st+z1*ct;return [x1,y2,z2]}
  function slerp(a,b,t){let d=a[0]*b[0]+a[1]*b[1]+a[2]*b[2];d=Math.max(-1,Math.min(1,d));const o=Math.acos(d),so=Math.sin(o)||1e-6;const k1=Math.sin((1-t)*o)/so,k2=Math.sin(t*o)/so;return [a[0]*k1+b[0]*k2,a[1]*k1+b[1]*k2,a[2]*k1+b[2]*k2]}
  function ringPoint(ring,a,ang){const x=Math.cos(a)*1.28,z=Math.sin(a)*1.28;const y1=-z*Math.sin(ring.tilt),z1=z*Math.cos(ring.tilt);return [x*Math.cos(ang)-z1*Math.sin(ang),y1,x*Math.sin(ang)+z1*Math.cos(ang)]}
  let last=performance.now(),visible=true;new IntersectionObserver(es=>{visible=es[0].isIntersecting},{threshold:0}).observe(wrap);
  function frame(now){const dt=now-last;last=now;if(!visible){requestAnimationFrame(frame);return}if(!drag)rot+=vel*(hover?.35:1)*dt/16;
    const R=size*.38,cx=size/2,cy=size/2;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,size,size);
    const fg=light()?'23,23,23':'240,240,248';const t0=now/1000;
    /* HUD 다이얼 */
    ctx.save();ctx.translate(cx,cy);ctx.rotate(t0*.05);
    ctx.beginPath();ctx.arc(0,0,R*1.08,0,Math.PI*2);ctx.setLineDash([2,9]);ctx.strokeStyle='rgba(210,76,255,.3)';ctx.lineWidth=1;ctx.stroke();ctx.setLineDash([]);
    for(let i=0;i<72;i++){const a=i/72*Math.PI*2,l=i%6===0?9:4,r0=R*1.115;ctx.beginPath();ctx.moveTo(Math.cos(a)*r0,Math.sin(a)*r0);ctx.lineTo(Math.cos(a)*(r0+l),Math.sin(a)*(r0+l));ctx.strokeStyle=i%6===0?'rgba(210,76,255,.55)':`rgba(${fg},.2)`;ctx.stroke()}
    ctx.restore();
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-t0*.12);ctx.strokeStyle='rgba(210,76,255,.6)';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(0,0,R*1.2,0,Math.PI*.32);ctx.stroke();ctx.beginPath();ctx.arc(0,0,R*1.2,Math.PI,Math.PI*1.32);ctx.stroke();ctx.restore();
    /* 뒷면 점 */
    ctx.fillStyle=`rgba(${fg},.06)`;for(const p of pts){const [x,y,z]=project(p);if(z<0)ctx.fillRect(cx+x*R-.6,cy-y*R-.6,1.2,1.2)}
    /* 구 외곽선 + 홀로그램 글로우 */
    ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.strokeStyle='rgba(210,76,255,.28)';ctx.lineWidth=1;ctx.stroke();
    const g=ctx.createRadialGradient(cx,cy,R*.55,cx,cy,R);g.addColorStop(0,'rgba(210,76,255,0)');g.addColorStop(1,'rgba(210,76,255,.13)');ctx.fillStyle=g;ctx.fill();
    /* 경위선 와이어프레임 (앞면만) */
    ctx.lineWidth=1;ctx.strokeStyle='rgba(210,76,255,.11)';
    for(let lat=-60;lat<=60;lat+=30){ctx.beginPath();let st=false;for(let i=0;i<=90;i++){const [x,y,z]=project(toV(lat,-180+i*4));if(z<0){st=false;continue}const px=cx+x*R,py=cy-y*R;if(!st){ctx.moveTo(px,py);st=true}else ctx.lineTo(px,py)}ctx.stroke()}
    for(let lon=0;lon<360;lon+=30){ctx.beginPath();let st=false;for(let i=0;i<=45;i++){const [x,y,z]=project(toV(-90+i*4,lon));if(z<0){st=false;continue}const px=cx+x*R,py=cy-y*R;if(!st){ctx.moveTo(px,py);st=true}else ctx.lineTo(px,py)}ctx.stroke()}
    /* 앞면 점 */
    for(const p of pts){const [x,y,z]=project(p);if(z>=0){const a=.16+.8*z;ctx.fillStyle=`rgba(${fg},${a})`;const s=1.2+z*1.2;ctx.fillRect(cx+x*R-s/2,cy-y*R-s/2,s,s)}}
    /* 뉴럴 링크 + 패킷 */
    for(const [i,j,ph] of links){const A=project(nodes[i]),B=project(nodes[j]);if(A[2]<.05||B[2]<.05)continue;const vis=Math.min(A[2],B[2]);const pulse=.5+.5*Math.sin(t0*1.6+ph);
      ctx.beginPath();ctx.moveTo(cx+A[0]*R,cy-A[1]*R);ctx.lineTo(cx+B[0]*R,cy-B[1]*R);ctx.strokeStyle=`rgba(210,76,255,${(.08+.3*pulse)*vis})`;ctx.lineWidth=1;ctx.stroke();
      const k=(t0*.22+ph/6.283)%1;const px=cx+(A[0]+(B[0]-A[0])*k)*R,py=cy-(A[1]+(B[1]-A[1])*k)*R;ctx.beginPath();ctx.arc(px,py,1.3,0,Math.PI*2);ctx.fillStyle=`rgba(220,140,255,${.9*vis})`;ctx.fill()}
    for(let i=0;i<nodes.length;i++){const [x,y,z]=project(nodes[i]);if(z<.05)continue;const px=cx+x*R,py=cy-y*R;const pulse=.5+.5*Math.sin(t0*2+i);
      ctx.beginPath();ctx.arc(px,py,1.6+pulse*1.2,0,Math.PI*2);ctx.fillStyle=`rgba(210,76,255,${(.45+.55*pulse)*z})`;ctx.fill();
      if(i%9===0){ctx.beginPath();ctx.arc(px,py,5+pulse*4,0,Math.PI*2);ctx.strokeStyle=`rgba(210,76,255,${.25*z})`;ctx.lineWidth=1;ctx.stroke()}}
    /* 스캔 스윕 */
    ctx.save();ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.clip();const sy=cy-R+((t0*.2)%1)*R*2;const sg=ctx.createLinearGradient(0,sy-44,0,sy+4);sg.addColorStop(0,'rgba(210,76,255,0)');sg.addColorStop(1,'rgba(210,76,255,.2)');ctx.fillStyle=sg;ctx.fillRect(cx-R,sy-44,R*2,48);ctx.fillStyle='rgba(224,150,255,.55)';ctx.fillRect(cx-R,sy,R*2,1);ctx.restore();
    /* 궤도 링 + 위성 */
    for(const ring of RINGS){const ang=t0*ring.spin;const N=120;ctx.beginPath();let st=false;
      for(let i=0;i<=N;i++){const [x,y,z]=ringPoint(ring,i/N*Math.PI*2,ang);const px=cx+x*R,py=cy-y*R;if(z<0&&Math.hypot(px-cx,py-cy)<R){st=false;continue}if(!st){ctx.moveTo(px,py);st=true}else ctx.lineTo(px,py)}
      ctx.strokeStyle='rgba(210,76,255,.32)';ctx.lineWidth=1;ctx.stroke();
      const [sx,syy,sz]=ringPoint(ring,t0*.55+ring.phase,ang);const px=cx+sx*R,py=cy-syy*R;
      if(!(sz<0&&Math.hypot(px-cx,py-cy)<R)){ctx.beginPath();ctx.arc(px,py,2.4,0,Math.PI*2);ctx.fillStyle='#e08cff';ctx.fill();ctx.beginPath();ctx.arc(px,py,7,0,Math.PI*2);ctx.strokeStyle='rgba(210,76,255,.45)';ctx.stroke()}}
    /* 연결 아크 */
    for(const arc of arcs){const prog=((t0*.18+arc.phase)%1);const head=prog*1.35;const N=48;ctx.beginPath();let started=false;
      for(let i=0;i<=N;i++){const t=i/N;if(t>head)break;const v=slerp(arc.a,arc.b,t);const lift=1+Math.sin(t*Math.PI)*.28;const [x,y,z]=project([v[0]*lift,v[1]*lift,v[2]*lift]);if(z<-.15){started=false;continue}const px=cx+x*R,py=cy-y*R;if(!started){ctx.moveTo(px,py);started=true}else ctx.lineTo(px,py)}
      const fade=head>1?Math.max(0,1-(head-1)/.35):1;ctx.strokeStyle=`rgba(210,76,255,${.6*fade})`;ctx.lineWidth=1;ctx.stroke();
      if(head<1){const v=slerp(arc.a,arc.b,head);const lift=1+Math.sin(head*Math.PI)*.28;const [x,y,z]=project([v[0]*lift,v[1]*lift,v[2]*lift]);if(z>-.15){ctx.beginPath();ctx.arc(cx+x*R,cy-y*R,2,0,Math.PI*2);ctx.fillStyle='#e08cff';ctx.fill()}}}
    /* 홈 마커 */
    const [hx,hy,hz]=project(arcs[0].a);const px=cx+hx*R,py=cy-hy*R;
    if(hz>0){ctx.beginPath();ctx.arc(px,py,3.5,0,Math.PI*2);ctx.fillStyle='#d24cff';ctx.fill();ctx.beginPath();ctx.arc(px,py,9+Math.sin(t0*3)*3,0,Math.PI*2);ctx.strokeStyle='rgba(210,76,255,.5)';ctx.stroke();
      ctx.beginPath();ctx.moveTo(px-14,py);ctx.lineTo(px-6,py);ctx.moveTo(px+6,py);ctx.lineTo(px+14,py);ctx.moveTo(px,py-14);ctx.lineTo(px,py-6);ctx.moveTo(px,py+6);ctx.lineTo(px,py+14);ctx.strokeStyle='rgba(210,76,255,.7)';ctx.stroke()}
    online.style.opacity=hz>.15?1:0;online.style.left=px+'px';online.style.top=py+'px';
    requestAnimationFrame(frame)}
  requestAnimationFrame(frame);
})();
onScroll();
