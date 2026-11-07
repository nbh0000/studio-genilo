import { guideHeaders, guideContext, renderGuide, initGuide } from './seo-guide.js?v=20261108-guideaccess';
(async function(){
  const API=(location.hostname==='localhost'||location.hostname==='127.0.0.1')?'http://127.0.0.1:8787':'https://api.genilo.kr';
  const $=id=>document.getElementById(id);
  const form=$('chkForm'),input=$('chkUrl'),btn=$('chkBtn'),quota=$('chkQuota');
  const progress=$('chkProgress'),stages=[...$('chkStages').children],progressUrl=$('chkProgressUrl');
  const errorBox=$('chkError'),result=$('chkResult'),searchInput=$('chkSearch'),categorySelect=$('chkCategory'),toggleAll=$('chkToggleAll');
  const STATUS={pass:'잘됨',warn:'주의',fail:'개선필요',unknown:'미확인',notApplicable:'해당 없음'};
  const CAT_ORDER=['naver','google','aeo','geo'];
  const NO_IMPROVEMENT_SCORE=100;
  let current=null,filter='all';
  let categoryFilter='all',stageTimer=null,running=false;
  let openSections=new Set(CAT_ORDER);
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number=new Intl.NumberFormat('ko-KR');

  const recentList=$('chkRecentList'),recentState=$('chkRecentState'),recentStatus=$('chkRecentStatus');
  const recentPrev=$('chkRecentPrev'),recentNext=$('chkRecentNext'),recentRetry=$('chkRecentRetry');
  const recentLabels={naver:'네이버',google:'Google',aeo:'AEO',geo:'GEO'};
  const recentScore=new Intl.NumberFormat('ko-KR',{maximumFractionDigits:1});
  const recentDate=new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});
  let recentSequence=0,recentFrame=0;
  function publicRecentItem(raw){
    if(!raw||typeof raw!=='object'||typeof raw.url!=='string'||raw.url.length>2048)return null;
    let url;try{url=new URL(raw.url);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)return null;url.search='';url.hash='';}catch{return null;}
    const title=typeof raw.title==='string'?raw.title.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,180):'';
    const date=typeof raw.checkedAt==='string'&&raw.checkedAt.length<80?new Date(raw.checkedAt):null;
    return {url:url.href,title:title||url.hostname,checkedAt:date&&Number.isFinite(date.getTime())?date:null,
      scores:Object.fromEntries(CAT_ORDER.map(key=>{const value=raw.scores?.[key];return[key,typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=100?value:null]}))};
  }
  function recentNode(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!=null)node.textContent=text;return node;}
  function updateRecentNavigation(){
    recentFrame=0;
    const end=Math.max(0,recentList.scrollWidth-recentList.clientWidth);
    recentPrev.disabled=recentList.hidden||recentList.scrollLeft<=2;
    recentNext.disabled=recentList.hidden||recentList.scrollLeft>=end-2;
  }
  function scheduleRecentNavigation(){if(!recentFrame)recentFrame=requestAnimationFrame(updateRecentNavigation);}
  function moveRecent(direction){
    const card=recentList.firstElementChild;if(!card)return;
    const gap=parseFloat(getComputedStyle(recentList).gap)||16;
    recentList.scrollBy({left:direction*(card.getBoundingClientRect().width+gap),behavior:'auto'});
    scheduleRecentNavigation();
  }
  recentPrev.addEventListener('click',()=>moveRecent(-1));
  recentNext.addEventListener('click',()=>moveRecent(1));
  recentList.addEventListener('scroll',scheduleRecentNavigation,{passive:true});
  recentList.addEventListener('keydown',event=>{
    if(event.target!==recentList||event.altKey||event.ctrlKey||event.metaKey)return;
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();moveRecent(event.key==='ArrowLeft'?-1:1);}
    else if(event.key==='Home'||event.key==='End'){event.preventDefault();recentList.scrollTo({left:event.key==='Home'?0:recentList.scrollWidth,behavior:'auto'});scheduleRecentNavigation();}
  });
  if(typeof ResizeObserver==='function')new ResizeObserver(scheduleRecentNavigation).observe(recentList);
  else window.addEventListener('resize',scheduleRecentNavigation);
  function renderRecent(items,totals){
    const activeLink=recentList.contains(document.activeElement)?document.activeElement.closest('a'):null;
    const activeUrl=activeLink?.href;
    const fragment=document.createDocumentFragment();
    items.forEach(item=>{
      const card=recentNode('li','recent-card'),link=recentNode('a','recent-link');
      link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';
      const title=recentNode('h3','',item.title);title.title=item.title;
      const address=recentNode('span','recent-url',item.url);address.title=item.url;
      link.append(title,address,recentNode('span','visually-hidden','새 탭에서 열기'));
      const scores=recentNode('dl','recent-scores');
      CAT_ORDER.forEach(key=>{
        const value=item.scores[key],score=recentNode('div','recent-score'+(value===null?' is-unavailable':''));
        score.dataset.category=key;
        const label=recentNode('dt','',recentLabels[key]),amount=recentNode('dd','',value===null?'—':recentScore.format(value));
        amount.setAttribute('aria-label',value===null?'측정 불가':recentScore.format(value)+'점, 100점 만점');
        score.append(label,amount);scores.append(score);
      });
      const checked=recentNode('p','recent-checked');
      if(item.checkedAt){const time=recentNode('time','',recentDate.format(item.checkedAt));time.dateTime=item.checkedAt.toISOString();checked.append('진단 ',time);}
      else checked.textContent='진단 시점 미확인';
      card.append(link,scores,checked);fragment.append(card);
    });
    recentList.replaceChildren(fragment);recentList.hidden=!items.length;
    const validTotals=totals&&['scans','sites'].every(key=>Number.isSafeInteger(totals[key])&&totals[key]>=0);
    $('chkRecentTotals').hidden=!validTotals;
    if(validTotals){$('chkRecentScans').textContent=number.format(totals.scans);$('chkRecentSites').textContent=number.format(totals.sites);}
    recentState.classList.remove('is-compact');recentState.hidden=Boolean(items.length);recentRetry.hidden=true;
    recentStatus.textContent=items.length?'최근 공개 진단 '+number.format(items.length)+'개를 불러왔습니다.':'아직 공개된 진단이 없습니다. 위에서 첫 페이지를 점검해 보세요.';
    $('chkRecentAnnounce').textContent=items.length?recentStatus.textContent:'';
    if(activeUrl){const replacement=[...recentList.querySelectorAll('a')].find(link=>link.href===activeUrl);(replacement||recentList).focus({preventScroll:true});}
    scheduleRecentNavigation();
  }
  async function loadRecent(){
    const request=++recentSequence,hadItems=recentList.childElementCount>0,fromRetry=document.activeElement===recentRetry;
    recentList.setAttribute('aria-busy','true');recentRetry.disabled=true;
    if(!hadItems){recentState.hidden=false;recentStatus.textContent='최근 진단을 불러오는 중…';recentRetry.hidden=true;}
    try{
      const response=await fetch(API+'/seo-check/recent',{credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(10000)});
      const data=await response.json();
      if(request!==recentSequence)return;
      if(!response.ok||data?.available!==true||!Array.isArray(data.items))throw new Error('RECENT_UNAVAILABLE');
      const items=data.items.slice(0,20).map(publicRecentItem).filter(Boolean);
      if(data.items.length&&!items.length)throw new Error('RECENT_INVALID');
      renderRecent(items,data.totals);
      if(fromRetry){if(items.length)recentList.focus({preventScroll:true});else recentStatus.setAttribute('tabindex','-1'),recentStatus.focus({preventScroll:true});}
    }catch{
      if(request!==recentSequence)return;
      recentState.hidden=false;recentState.classList.toggle('is-compact',hadItems);
      recentStatus.textContent=hadItems?'최근 진단 기록을 새로 불러오지 못했습니다. 이전에 불러온 기록을 표시하고 있습니다.':'최근 진단 기록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
      recentRetry.hidden=false;
      if(!hadItems)$('chkRecentTotals').hidden=true;
    }finally{
      if(request===recentSequence){recentList.setAttribute('aria-busy','false');recentRetry.disabled=false;if(fromRetry&&!recentRetry.hidden)recentRetry.focus({preventScroll:true});scheduleRecentNavigation();}
    }
  }
  recentRetry.addEventListener('click',()=>loadRecent());

  function setProgress(on,url){
    clearInterval(stageTimer);stageTimer=null;
    progress.hidden=!on;
    if(!on)return;
    progressUrl.textContent=url;

  }
  function showError(msg,help){
    errorBox.innerHTML='<b>점검하지 못했습니다</b>'+esc(msg);
    if(help?.detail){const detail=document.createElement('p');detail.textContent=help.detail;errorBox.append(detail);}
    if(help?.sourceUrl){try{const url=new URL(help.sourceUrl);if(url.protocol==='https:'&&url.hostname==='developers.google.com'){const link=document.createElement('a');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=help.title||'공식 문제 해결 문서';errorBox.append(link);}}catch{}}
    errorBox.hidden=false;
  }
  function setQuota(q){if(!q||q.remaining==null){quota.textContent='';return}quota.textContent='오늘 남은 점검 '+q.remaining+'회 / '+q.limit+'회';}
  function issuePriority(it){return(it.status==='fail'?20:it.status==='warn'?10:0)+(it.weight||0)}
  function sortedIssues(items){return items.filter(it=>['fail','warn'].includes(it.status)).sort((a,b)=>issuePriority(b)-issuePriority(a))}
  function top(items,status,count=3){return items.filter(it=>it.status===status).sort((a,b)=>(b.weight||0)-(a.weight||0)).slice(0,count)}
  function list(items,empty){return items.length?'<ul>'+items.map(it=>'<li>'+esc(it.label)+'</li>').join('')+'</ul>':'<p class="empty">'+esc(empty)+'</p>'}
  function groupedChecks(category){
    const groups=[];
    category.items.forEach(item=>{const name=item.group||'기타 진단';let group=groups.find(entry=>entry.name===name);if(!group){group={name,items:[]};groups.push(group)}group.items.push(item)});
    return groups.map(group=>'<section class="check-group" data-group="'+esc(group.name)+'"><div class="check-group-head"><h3>'+esc(group.name)+'</h3><span>'+number.format(group.items.length)+'개 항목</span></div>'+group.items.map(it=>'<article class="chk-row" id="check-'+esc(it.id)+'" data-status="'+esc(it.status)+'" data-category="'+esc(category.key)+'" data-search="'+esc((group.name+' '+it.label+' '+(STATUS[it.status]||'')).toLowerCase())+'"><span class="chip '+esc(it.status)+'">'+esc(STATUS[it.status]||'미확인')+'</span><div class="row-copy"><h4>'+esc(it.label)+'</h4></div></article>').join('')+'</section>').join('');
  }

  function syncOpenParam(){
    const q=new URL(location.href),keys=CAT_ORDER.filter(key=>openSections.has(key));
    keys.length?q.searchParams.set('open',keys.join(',')):q.searchParams.delete('open');
    history.replaceState(null,'',q);
  }
  function updateToggleAll(){
    const sections=[...document.querySelectorAll('.chk-section:not([hidden])')];
    const allOpen=sections.length>0&&sections.every(section=>section.classList.contains('is-open'));
    toggleAll.textContent=allOpen?'모두 접기':'전체 펼치기';
    toggleAll.setAttribute('aria-pressed',String(allOpen));
  }
  function setSectionOpen(section,open,{animate=true,sync=true}={}){
    if(!section)return;
    const button=section.querySelector('.chk-section-toggle'),panel=section.querySelector('.chk-section-panel');
    if(!button||!panel)return;
    const key=section.dataset.category;
    clearTimeout(panel._settleTimer);
    const animationId=(Number(panel.dataset.animationId)||0)+1;
    panel.dataset.animationId=animationId;
    button.setAttribute('aria-expanded',String(open));
    button.setAttribute('aria-label',button.dataset.label+' 결과 '+(open?'접기':'펼치기'));
    const stateLabel=button.querySelector('.toggle-label');if(stateLabel)stateLabel.textContent=open?'접기':'펼치기';
    section.classList.toggle('is-open',open);
    open?openSections.add(key):openSections.delete(key);
    const instant=!animate||reducedMotion.matches;
    if(open){
      panel.hidden=false;
      if(instant){panel.style.height='auto';panel.style.opacity='1'}
      else{panel.style.height='0px';panel.style.opacity='0';panel.getBoundingClientRect();requestAnimationFrame(()=>{if(Number(panel.dataset.animationId)!==animationId)return;panel.style.height=panel.scrollHeight+'px';panel.style.opacity='1'});panel._settleTimer=setTimeout(()=>{if(Number(panel.dataset.animationId)===animationId)panel.style.height='auto'},230)}
    }else if(instant){panel.hidden=true;panel.style.height='0px';panel.style.opacity='0'}
    else{panel.style.height=panel.scrollHeight+'px';panel.style.opacity='1';panel.getBoundingClientRect();requestAnimationFrame(()=>{if(Number(panel.dataset.animationId)!==animationId)return;panel.style.height='0px';panel.style.opacity='0'});panel._settleTimer=setTimeout(()=>{if(Number(panel.dataset.animationId)===animationId)panel.hidden=true},230)}
    updateToggleAll();if(sync)syncOpenParam();
  }

  function render(data){
    result.dataset.reportOnly=String(!data?.summary);
    if(!data?.summary){current=null;return;}
    current=data;
    filter='all';categoryFilter='all';openSections=new Set(CAT_ORDER);
    $('chkOfficial').replaceChildren();$('chkOfficial').hidden=true;
    data.categories.sort((a,b)=>CAT_ORDER.indexOf(a.key)-CAT_ORDER.indexOf(b.key));
    const s=data.summary;
    $('chkSummary').innerHTML=
      '<div class="cell"><i>점검 대상</i><b>'+esc(s.finalUrl)+'</b><small>'+esc(s.title)+'</small></div>'+
      '<div class="cell"><i>응답 코드</i><b>'+esc(s.status)+'</b><small>점검 시 수신한 응답</small></div>';
    const counts=data.overall.counts||data.categories.reduce((a,c)=>{a.pass+=c.counts.pass;a.warn+=c.counts.warn;a.fail+=c.counts.fail;return a},{pass:0,warn:0,fail:0});
    const priorities=(data.overall.topImprovements||data.categories.flatMap(c=>c.items.map(it=>({...it,category:c.label,categoryKey:c.key})))).slice(0,5);
    const blockerIds=new Set((data.blockers||[]).map(item=>item.id));
    $('chkOutcome').innerHTML='<div class="outcome-copy"><p>이번 진단에서 확인한 내용</p><h2 id="chkOutcomeTitle">먼저 고칠 점 '+number.format(counts.fail)+'개, 살펴볼 점 '+number.format(counts.warn)+'개</h2><div class="outcome-counts"><span class="good">잘된 점 <b>'+number.format(counts.pass)+'</b></span><span class="warn">주의 <b>'+number.format(counts.warn)+'</b></span><span class="bad">개선필요 <b>'+number.format(counts.fail)+'</b></span></div><p class="outcome-help">네이버·구글·GEO는 기술 항목, AEO는 확인 가능한 콘텐츠 구조 항목의 충족도입니다. 100점도 검색 순위를 보장하지 않습니다. 미확인·해당 없음은 통과에 포함하지 않습니다.</p></div><div class="outcome-priority"><h3>가장 먼저 확인할 항목</h3>'+(priorities.length?'<ol>'+priorities.map(it=>'<li><button type="button" data-check="'+(blockerIds.has(it.id)?'blocker-':'check-')+esc(it.id)+'"><span>'+esc(it.category)+'</span><b>'+esc(it.label)+'</b></button></li>').join('')+'</ol>':'<p>즉시 고칠 항목이 없습니다. 잘된 점을 유지하면서 주의 항목을 확인해 주세요.</p>')+'</div>';
    if(data.blockers?.length){$('chkOutcome').insertAdjacentHTML('afterbegin','<div class="guide-blockers"><h3>검색 접근 차단 항목</h3><ul>'+data.blockers.map(b=>'<li id="blocker-'+esc(b.id)+'" tabindex="-1"><b>'+esc(b.label)+'</b></li>').join('')+'</ul></div>')}
    $('chkOutcome').insertAdjacentHTML('beforeend','<p class="guide-measurement">미확인 '+Number(counts.unknown||0)+'개 · 해당 없음 '+Number(counts.notApplicable||0)+'개 · 확인된 기술·콘텐츠 구조 범위의 진단입니다.</p>');
    $('chkScores').innerHTML=data.categories.map(c=>{
      const good=top(c.items,'pass',1)[0],bad=sortedIssues(c.items)[0];
      const issueLabel=bad?bad.label:'개선 필요 판정 항목 없음';
      const scoreLabel=c.key==='aeo'?'콘텐츠 진단':'기술 진단';
      return '<button type="button" class="card chk-cat" data-go="sec-'+c.key+'"><div class="cat-head"><span class="label">'+esc(c.label)+'</span><span>'+number.format(c.totalItems||c.items.length)+'항목 점검</span></div><div class="cat-score"><b>'+(Number.isFinite(c.score)?number.format(c.score):'—')+'</b><span>'+esc(Number.isFinite(c.score)?'/ 100 · '+scoreLabel:'측정 불가')+'</span></div><div class="counts"><span>잘됨 '+c.counts.pass+'</span><span class="w">주의 '+c.counts.warn+'</span><span class="f">개선필요 '+c.counts.fail+'</span></div><div class="cat-signal good"><span>잘된 점</span><b>'+esc(good?good.label:'확인된 강점 없음')+'</b></div><div class="cat-signal issue"><span>우선 개선</span><b>'+esc(issueLabel)+'</b></div></button>';
    }).join('');
    const seoIssues=data.categories.filter(c=>c.key==='naver'||c.key==='google').reduce((sum,c)=>sum+c.counts.warn+c.counts.fail,0);
    const allIssues=counts.warn+counts.fail;
    const noImprovement=CAT_ORDER.every(key=>data.categories.find(category=>category.key===key)?.score===NO_IMPROVEMENT_SCORE)
      &&s.status===200&&!s.truncated&&!(data.blockers?.length)&&!(data.indexing?.observedBlockers>0)
      &&!(counts.fail>0)&&!data.categories.some(category=>category.counts?.fail>0||category.items.some(item=>item.status==='fail'));
    $('chkNoImprovement').hidden=!noImprovement;
    $('chkQuotes').hidden=noImprovement;
    $('chkConsult').hidden=noImprovement;
    $('quoteSeoCount').textContent='현재 SEO 개선 대상 '+number.format(seoIssues)+'개';
    $('quoteAllCount').textContent='현재 전체 개선 대상 '+number.format(allIssues)+'개';
    categorySelect.innerHTML='<option value="all">모든 영역</option>'+data.categories.map(c=>'<option value="'+c.key+'">'+esc(c.label)+'</option>').join('');
    if(!data.categories.some(c=>c.key===categoryFilter))categoryFilter='all';
    categorySelect.value=categoryFilter;
    $('chkSections').innerHTML=data.categories.map(c=>{
      const scoreExplanation=c.key==='aeo'&&c.scoreExplanation?'<p class="guide-measurement">'+esc(c.scoreExplanation)+'</p>':'';
      return '<section class="chk-section" id="sec-'+c.key+'" data-category="'+c.key+'"><header><button type="button" class="chk-section-toggle" aria-expanded="false" aria-controls="panel-'+c.key+'" aria-label="'+esc(c.label)+' 결과 펼치기" data-label="'+esc(c.label)+'"><span class="section-title"><span class="section-heading" role="heading" aria-level="2">'+esc(c.label)+'</span><span class="sub">'+esc(c.sub)+' · '+number.format(c.totalItems||c.items.length)+'항목 점검</span></span><span class="section-right"><span class="section-counts"><span>잘됨 '+c.counts.pass+'</span><span>주의 '+c.counts.warn+'</span><span>개선필요 '+c.counts.fail+'</span></span><span class="toggle-label">펼치기</span><i class="toggle-chevron" aria-hidden="true"></i></span></button></header><div class="chk-section-panel" id="panel-'+c.key+'" hidden>'+scoreExplanation+'<div class="chk-brief"><section class="good"><h3>잘된 점</h3>'+list(top(c.items,'pass'), '해당 판정 항목이 없습니다.')+'</section><section class="issue"><h3>우선 개선점</h3>'+list(sortedIssues(c.items).slice(0,3), '개선 필요 판정 항목이 없습니다.')+'</section></div><div class="chk-list">'+
        groupedChecks(c)+
        '<div class="chk-empty" hidden>현재 조건에 맞는 공개 항목이 없습니다. 검색어나 필터를 바꿔 보세요.</div></div></div></section>';
    }).join('');
    $('chkAllBtn').textContent='공개 결과 전체';
    result.hidden=false;
    searchInput.value='';
    applyFilter();
    openSections=new Set([...openSections].filter(key=>data.categories.some(c=>c.key===key)));
    result.querySelectorAll('.chk-section').forEach(section=>{if(openSections.has(section.dataset.category))setSectionOpen(section,true,{animate:false,sync:false})});
    updateToggleAll();syncOpenParam();
    result.querySelectorAll('.chk-section-toggle').forEach(button=>button.addEventListener('click',()=>setSectionOpen(button.closest('.chk-section'),button.getAttribute('aria-expanded')!=='true')));
    result.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{const t=$(b.dataset.go);if(t){categoryFilter='all';categorySelect.value='all';applyFilter();setSectionOpen(t,true);t.scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'start'})}}));
    result.querySelectorAll('[data-check]').forEach(b=>b.addEventListener('click',()=>{filter='all';categoryFilter='all';searchInput.value='';categorySelect.value='all';applyFilter();const t=$(b.dataset.check);if(t){const section=t.closest('.chk-section');setSectionOpen(section,true);setTimeout(()=>{t.scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'center'});if(t.matches('[tabindex]'))t.focus({preventScroll:true});t.classList.add('pulse');setTimeout(()=>t.classList.remove('pulse'),1400)},reducedMotion.matches?0:220)}}));
    $('chkOutcome').scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'start'});
  }

  function applyFilter(sync=true){
    const term=searchInput.value.trim().toLowerCase();
    let totalVisible=0;
    document.querySelectorAll('.chk-filter .seg button').forEach(b=>{const on=b.dataset.filter===filter;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))});
    document.querySelectorAll('.chk-section').forEach(sec=>{
      let visible=0;
      const categoryMatch=categoryFilter==='all'||sec.dataset.category===categoryFilter;
      sec.querySelectorAll('.chk-row').forEach(row=>{const statusMatch=filter==='all'||(filter==='issues'&&['warn','fail'].includes(row.dataset.status))||(filter==='good'&&row.dataset.status==='pass');const searchMatch=!term||row.dataset.search.includes(term);const hide=!categoryMatch||!statusMatch||!searchMatch;row.classList.toggle('hide',hide);if(!hide)visible++});
      sec.querySelectorAll('.check-group').forEach(group=>{group.hidden=!group.querySelector('.chk-row:not(.hide)')});
      sec.querySelector('.chk-empty').hidden=visible>0;
      sec.hidden=!categoryMatch;
      totalVisible+=visible;
    });
    $('chkVisible').textContent='공개 '+number.format(totalVisible)+'개 표시 중';
    updateToggleAll();
    if(sync){const q=new URL(location.href);filter==='all'?q.searchParams.delete('view'):q.searchParams.set('view',filter);categoryFilter==='all'?q.searchParams.delete('cat'):q.searchParams.set('cat',categoryFilter);term?q.searchParams.set('q',term):q.searchParams.delete('q');history.replaceState(null,'',q)}
  }
  document.querySelectorAll('.chk-filter .seg button').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;applyFilter()}));
  searchInput.addEventListener('input',()=>applyFilter());
  categorySelect.addEventListener('change',()=>{categoryFilter=categorySelect.value;applyFilter()});
  toggleAll.addEventListener('click',()=>{
    const sections=[...document.querySelectorAll('.chk-section:not([hidden])')],shouldOpen=!sections.length||sections.some(section=>!section.classList.contains('is-open'));
    sections.forEach(section=>setSectionOpen(section,shouldOpen,{sync:false}));syncOpenParam();updateToggleAll();
  });

  async function run(url){
    if(running)return;
    url=String(url||'').trim();
    if(!url){showError('점검할 웹페이지 주소를 입력해 주세요.');input.setAttribute('aria-invalid','true');input.focus();return}
    input.removeAttribute('aria-invalid');
    let context;try{context=guideContext()}catch(e){showError(e.message);return}
    running=true;btn.disabled=true;btn.textContent='점검 중…';
    errorBox.hidden=true;result.hidden=true;$('guideReport').hidden=true;
    setProgress(true,url);
    try{
      const res=await fetch(API+'/seo-check',{method:'POST',headers:{'Content-Type':'application/json',...await guideHeaders()},body:JSON.stringify({url,...context}),signal:AbortSignal.timeout(120000)});
      let data=null;try{data=await res.json()}catch{}
      if(!res.ok||!data||!data.ok){const failure=new Error((data&&data.message)||('서버 응답 오류 ('+res.status+')'));failure.help=data?.help;throw failure;}
      stages.forEach(li=>{li.classList.remove('on');li.classList.add('done')});
      setQuota(data.quota);
      const q=new URL(location.href);q.searchParams.set('u',data.summary.finalUrl);q.searchParams.delete('report');history.replaceState(null,'',q);
      render(data);renderGuide(data.guideReport);
      const savedStatus=$('chkRecentSaveStatus');
      savedStatus.hidden=data.recentSaved!==false;
      savedStatus.textContent=data.recentSaved===false?'진단은 완료됐지만 공개 기록에 저장하지 못했습니다.':'';
      void loadRecent();
    }catch(e){
      showError(e.name==='TypeError'?'점검 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.':e.message,e.help);
    }finally{
      running=false;btn.disabled=false;btn.textContent='점검 시작';setProgress(false);
    }
  }
  form.addEventListener('submit',e=>{e.preventDefault();run(input.value)});

  function flash(msg){const el=$('chkCopied');el.textContent=msg;clearTimeout(flash.t);flash.t=setTimeout(()=>el.textContent='',2400)}
  async function copy(text,msg){try{await navigator.clipboard.writeText(text);flash(msg)}catch{const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');flash(msg)}catch{flash('복사하지 못했습니다')}ta.remove()}}
  $('chkCopyLink').addEventListener('click',()=>{if(!current)return;copy(location.href,'결과 링크를 복사했습니다')});
  function reportText(limit=6){
    if(!current)return'';
    const d=current,counts=d.overall.counts||d.categories.reduce((a,c)=>{a.pass+=c.counts.pass;a.warn+=c.counts.warn;a.fail+=c.counts.fail;return a},{pass:0,warn:0,fail:0});
    const lines=['[Studio Genilo SEO·AEO·GEO 진단]','사이트: '+d.summary.finalUrl,'기술 진단 '+(Number.isFinite(d.overall.score)?d.overall.score+'점':'미측정')+' · 잘된 점 '+counts.pass+' · 주의 '+counts.warn+' · 개선필요 '+counts.fail,
      '미확인 '+(counts.unknown||0)+' · 해당 없음 '+(counts.notApplicable||0),d.scoring?.note||'기술 진단 점수는 검색 순위나 실제 색인을 보장하지 않습니다.',
      '※ 점검 항목과 판정 결과입니다. 상세 근거와 수정 방법은 유료 가이드 리포트에 포함됩니다.',''];
    if(d.blockers?.length){lines.push('■ 검색 접근 차단 항목');d.blockers.forEach(b=>lines.push('- '+b.label));lines.push('');}
    d.categories.forEach(c=>{lines.push('■ '+c.label+' '+(Number.isFinite(c.score)?c.score+'점':'미측정'));c.items.forEach(i=>lines.push('- ['+(STATUS[i.status]||'미확인')+'] '+i.label));lines.push('')});
    lines.push('진단 링크: '+location.href);return lines.join('\n');
  }
  $('chkCopyText').addEventListener('click',()=>{if(current)copy(reportText(),'진단 요약을 복사했습니다')});
  function exportData(){
    const d=current;
    // Export the public audit only; the paid snapshot and claim token stay separate.
    return {ok:d.ok,checkedAt:d.checkedAt,summary:{finalUrl:d.summary.finalUrl,title:d.summary.title,status:d.summary.status},totalItems:d.totalItems,
      blockers:(d.blockers||[]).map(({id,label,status})=>({id,label,status})),
      categories:d.categories.map(c=>({key:c.key,label:c.label,sub:c.sub,score:c.score,
        counts:c.counts,totalItems:c.totalItems,items:c.items.map(({id,group,label,status})=>({id,group,label,status}))}))};
  }
  function download(content,type,extension){const blob=new Blob([content],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='genilo-audit-'+(current.summary.host||'site')+'.'+extension;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),0)}
  $('chkDownloadJson').addEventListener('click',()=>{if(current)download(JSON.stringify(exportData(),null,2),'application/json;charset=utf-8','json')});
  $('chkDownloadCsv').addEventListener('click',()=>{if(!current)return;const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';const rows=[['영역','진단 묶음','상태','항목'],...current.categories.flatMap(c=>c.items.map(it=>[c.label,it.group||'기타 진단',STATUS[it.status],it.label]))];download('\ufeff'+rows.map(row=>row.map(value=>quote(/^[=+@\-\t\r]/.test(String(value??''))?"'"+value:value)).join(',')).join('\r\n'),'text/csv;charset=utf-8','csv')});
  const CONSULT_PLANS={seo:'SEO 점수 개선 · 299,000원',full:'SEO·AEO·GEO 기술·콘텐츠 개선 · 990,000원'};
  document.querySelectorAll('[data-consult-plan]').forEach(link=>link.addEventListener('click',()=>{if(!current)return;try{const plan=CONSULT_PLANS[link.dataset.consultPlan]||CONSULT_PLANS.full;sessionStorage.setItem('genilo_seo_consult',JSON.stringify({url:current.summary.finalUrl,checkedAt:current.checkedAt,plan,report:reportText(4)}))}catch{}}));

  const preset=new URLSearchParams(location.search).get('u');
  void loadRecent();
  const restored=await initGuide(render);
  if(preset&&!restored){input.value=preset;(window.SG_READY||Promise.resolve()).then(()=>run(preset))}
})();
