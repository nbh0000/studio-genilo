import { guideHeaders, guideContext, renderGuide, initGuide } from './seo-guide.js';
import { renderOfficialUpdates } from './seo-official.js';
(async function(){
  const API=(location.hostname==='localhost'||location.hostname==='127.0.0.1')?'http://127.0.0.1:8787':'https://api.genilo.kr';
  const $=id=>document.getElementById(id);
  const form=$('chkForm'),input=$('chkUrl'),btn=$('chkBtn'),quota=$('chkQuota');
  const progress=$('chkProgress'),stages=[...$('chkStages').children],progressUrl=$('chkProgressUrl');
  const errorBox=$('chkError'),result=$('chkResult'),searchInput=$('chkSearch'),categorySelect=$('chkCategory'),toggleAll=$('chkToggleAll');
  const STATUS={pass:'잘됨',warn:'주의',fail:'개선필요',unknown:'미확인',notApplicable:'해당 없음'};
  const CAT_ORDER=['naver','google','aeo','geo'];
  const params=new URLSearchParams(location.search);
  let current=null,filter=['all','issues','good'].includes(params.get('view'))?params.get('view'):'all';
  let categoryFilter=params.get('cat')||'all',stageTimer=null,running=false;
  let openSections=new Set((params.get('open')||'').split(',').filter(key=>CAT_ORDER.includes(key)));
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number=new Intl.NumberFormat('ko-KR');
  const fmtMs=ms=>(ms/1000).toFixed(2)+'초';
  const fmtStep=ms=>Number.isFinite(ms)?number.format(ms)+'ms':'미측정';
  const fmtKb=b=>b>=1024*1024?(b/1024/1024).toFixed(1)+'MB':Math.max(1,Math.round(b/1024))+'KB';

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
    return groups.map(group=>'<section class="check-group" data-group="'+esc(group.name)+'"><div class="check-group-head"><h3>'+esc(group.name)+'</h3><span>'+number.format(group.items.length)+'개 공개</span></div>'+group.items.map(it=>'<article class="chk-row" id="check-'+esc(it.id)+'" data-status="'+it.status+'" data-category="'+category.key+'" data-search="'+esc((group.name+' '+it.label+' '+it.detail+' '+(it.fix||'')).toLowerCase())+'"><span class="chip '+it.status+'">'+STATUS[it.status]+'</span><div class="row-copy"><h4>'+esc(it.label)+'</h4><div class="detail"><span>확인 근거</span>'+esc(it.detail)+'</div>'+(it.fix?'<div class="fix"><span>개선 방법</span>'+esc(it.fix)+'</div>':'')+(it.sourceUrl?'<p class="check-source"><a href="'+esc(it.sourceUrl)+'" target="_blank" rel="noopener noreferrer">참고한 공식 문서</a><span>'+esc(({official:'공식 기술 기준',heuristic:'휴리스틱 검토',observation:'응답에서 관측',optional:'선택 항목'})[it.evidenceType]||'참고 진단')+'</span></p>':'')+'</div></article>').join('')+'</section>').join('');
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
    renderOfficialUpdates(data.officialUpdates);
    data.categories.sort((a,b)=>CAT_ORDER.indexOf(a.key)-CAT_ORDER.indexOf(b.key));
    const s=data.summary,n=s.network||{};
    $('chkSummary').innerHTML=
      '<div class="cell"><i>점검 대상</i><b>'+esc(s.finalUrl)+'</b><small>'+esc(s.title)+'</small></div>'+
      '<div class="cell"><i>응답 코드</i><b>'+esc(s.status)+'</b><small>'+(s.redirects?'리다이렉트 '+s.redirects+'회':'직접 응답')+'</small></div>'+
      '<div class="cell"><i>전체 응답</i><b>'+fmtMs(s.responseMs)+'</b><small>HTML 수신 완료 기준</small></div>'+
      '<div class="cell network"><i>DNS · TCP</i><b>'+fmtStep(n.dnsMs)+' · '+fmtStep(n.tcpMs)+'</b><small>'+esc(n.ipVersion||'IP 미측정')+'</small></div>'+
      '<div class="cell network"><i>TLS · PROTOCOL</i><b>'+fmtStep(n.tlsMs)+' · '+esc(n.protocol||'미측정')+'</b><small>'+esc(n.tlsVersion||'TLS 미측정')+'</small></div>'+
      '<div class="cell network"><i>TTFB · DOWNLOAD</i><b>'+fmtStep(n.ttfbMs)+' · '+fmtStep(n.downloadMs)+'</b><small>'+(Number.isFinite(n.transferKbps)?number.format(n.transferKbps)+'Kbps':'처리량 미측정')+'</small></div>'+
      '<div class="cell"><i>HTML 용량</i><b>'+fmtKb(s.htmlBytes)+(s.truncated?'+':'')+'</b><small>'+esc((s.charset||'utf-8').toUpperCase())+'</small></div>'+
      '<div class="cell"><i>CDN · EDGE</i><b>'+esc(s.edge||'미표시')+'</b><small>'+esc(s.server||'서버 미표시')+'</small></div>'+
      '<div class="cell"><i>캐시 정책</i><b>'+esc(s.cacheControl||'미표시')+'</b><small>'+(s.hostUnified?'호스트 통일':'호스트 변형 확인 필요')+'</small></div>'+
      '<div class="cell"><i>전송 · 최신성</i><b>'+esc(s.contentEncoding||'없음')+'</b><small>'+esc(s.lastModified||'Last-Modified 미표시')+'</small></div>';
    const counts=data.overall.counts||data.categories.reduce((a,c)=>{a.pass+=c.counts.pass;a.warn+=c.counts.warn;a.fail+=c.counts.fail;return a},{pass:0,warn:0,fail:0});
    const priorities=(data.overall.topImprovements||data.categories.flatMap(c=>c.items.map(it=>({...it,category:c.label,categoryKey:c.key})))).slice(0,5);
    const blockerIds=new Set((data.blockers||[]).map(item=>item.id));
    $('chkOutcome').innerHTML='<div class="outcome-copy"><p>이번 진단에서 확인한 내용</p><h2 id="chkOutcomeTitle">먼저 고칠 점 '+number.format(counts.fail)+'개, 살펴볼 점 '+number.format(counts.warn)+'개</h2><div class="outcome-counts"><span class="good">잘된 점 <b>'+number.format(counts.pass)+'</b></span><span class="warn">주의 <b>'+number.format(counts.warn)+'</b></span><span class="bad">개선필요 <b>'+number.format(counts.fail)+'</b></span></div><p class="outcome-help">네이버·구글·GEO는 기술 항목, AEO는 확인 가능한 콘텐츠 구조 항목의 충족도입니다. 100점도 검색 순위를 보장하지 않습니다. 미확인·해당 없음은 통과에 포함하지 않습니다.</p></div><div class="outcome-priority"><h3>가장 먼저 확인할 항목</h3>'+(priorities.length?'<ol>'+priorities.map(it=>'<li><button type="button" data-check="'+(blockerIds.has(it.id)?'blocker-':'check-')+esc(it.id)+'"><span>'+esc(it.category)+'</span><b>'+esc(it.label)+'</b></button></li>').join('')+'</ol>':'<p>즉시 고칠 항목이 없습니다. 잘된 점을 유지하면서 주의 항목을 확인해 주세요.</p>')+'</div>';
    if(data.blockers?.length){$('chkOutcome').insertAdjacentHTML('afterbegin','<div class="guide-blockers"><h3>검색 노출을 막는 문제부터 해결하세요</h3><ul>'+data.blockers.map(b=>'<li id="blocker-'+esc(b.id)+'" tabindex="-1"><b>'+esc(b.label)+'</b> — '+esc(b.detail)+(b.fix?'<p>'+esc(b.fix)+'</p>':'')+'</li>').join('')+'</ul></div>')}
    $('chkOutcome').insertAdjacentHTML('beforeend','<p class="guide-measurement">미확인 '+Number(counts.unknown||0)+'개 · 해당 없음 '+Number(counts.notApplicable||0)+'개 · 확인된 기술·콘텐츠 구조 범위의 진단입니다.</p>');
    $('chkScores').innerHTML=data.categories.map(c=>{
      const good=top(c.items,'pass',1)[0],bad=sortedIssues(c.items)[0];
      const issueLabel=bad?bad.label:c.privateChecks?.hasImprovement?'미공개 핵심 개선 항목 있음':'즉시 고칠 항목 없음';
      const scoreLabel=c.key==='aeo'?'콘텐츠 진단':'기술 진단';
      return '<button type="button" class="card chk-cat" data-go="sec-'+c.key+'"><div class="cat-head"><span class="label">'+esc(c.label)+'</span><span>'+number.format(c.totalItems||c.items.length)+'항목 점검</span></div><div class="cat-score"><b>'+(Number.isFinite(c.score)?number.format(c.score):'—')+'</b><span>'+esc(Number.isFinite(c.score)?'/ 100 · '+scoreLabel:'측정 불가')+'</span></div><div class="counts"><span>잘됨 '+c.counts.pass+'</span><span class="w">주의 '+c.counts.warn+'</span><span class="f">개선필요 '+c.counts.fail+'</span></div><div class="cat-signal good"><span>잘된 점</span><b>'+esc(good?good.label:'확인된 강점 없음')+'</b></div><div class="cat-signal issue"><span>우선 개선</span><b>'+esc(issueLabel)+'</b></div></button>';
    }).join('');
    const seoIssues=data.categories.filter(c=>c.key==='naver'||c.key==='google').reduce((sum,c)=>sum+c.counts.warn+c.counts.fail,0);
    const allIssues=counts.warn+counts.fail;
    $('quoteSeoCount').textContent='현재 SEO 개선 대상 '+number.format(seoIssues)+'개';
    $('quoteAllCount').textContent='현재 전체 개선 대상 '+number.format(allIssues)+'개';
    categorySelect.innerHTML='<option value="all">모든 영역</option>'+data.categories.map(c=>'<option value="'+c.key+'">'+esc(c.label)+'</option>').join('');
    if(!data.categories.some(c=>c.key===categoryFilter))categoryFilter='all';
    categorySelect.value=categoryFilter;
    $('chkSections').innerHTML=data.categories.map(c=>{
      const scoreExplanation=c.key==='aeo'&&c.scoreExplanation?'<p class="guide-measurement">'+esc(c.scoreExplanation)+'</p>':'';
      const privateNotice=c.privateChecks?.hasImprovement?'<aside class="private-check"><b>미공개 핵심 개선 항목 있음</b><span>내부 판정 기준 보호를 위해 세부 신호와 수정 조건은 표시하지 않습니다. 개선 상담 시 사이트 소유 확인 후 안내합니다.</span></aside>':'';
      return '<section class="chk-section" id="sec-'+c.key+'" data-category="'+c.key+'"><header><button type="button" class="chk-section-toggle" aria-expanded="false" aria-controls="panel-'+c.key+'" aria-label="'+esc(c.label)+' 결과 펼치기" data-label="'+esc(c.label)+'"><span class="section-title"><span class="section-heading" role="heading" aria-level="2">'+esc(c.label)+'</span><span class="sub">'+esc(c.sub)+' · '+number.format(c.totalItems||c.items.length)+'항목 점검</span></span><span class="section-right"><span class="section-counts"><span>잘됨 '+c.counts.pass+'</span><span>주의 '+c.counts.warn+'</span><span>개선필요 '+c.counts.fail+'</span></span><span class="toggle-label">펼치기</span><i class="toggle-chevron" aria-hidden="true"></i></span></button></header><div class="chk-section-panel" id="panel-'+c.key+'" hidden>'+scoreExplanation+privateNotice+'<div class="chk-brief"><section class="good"><h3>잘된 점</h3>'+list(top(c.items,'pass'), '아직 뚜렷한 강점을 찾지 못했습니다.')+'</section><section class="issue"><h3>우선 개선점</h3>'+list(sortedIssues(c.items).slice(0,3), c.privateChecks?.hasImprovement?'공개 가능한 즉시 개선 항목은 없습니다.':'즉시 개선할 항목이 없습니다.')+'</section></div><div class="chk-list">'+
        groupedChecks(c)+
        '<div class="chk-empty" hidden>현재 조건에 맞는 공개 항목이 없습니다. 검색어나 필터를 바꿔 보세요.</div></div></div></section>';
    }).join('');
    $('chkAllBtn').textContent='공개 결과 전체';
    result.hidden=false;
    searchInput.value=params.get('q')||'';
    applyFilter(false);
    openSections=new Set([...openSections].filter(key=>data.categories.some(c=>c.key===key)));
    result.querySelectorAll('.chk-section').forEach(section=>{if(openSections.has(section.dataset.category))setSectionOpen(section,true,{animate:false,sync:false})});
    updateToggleAll();
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
      '※ 내부 배점·판정 공식과 일부 핵심 검사 신호는 공개하지 않습니다.',''];
    if(d.blockers?.length){lines.push('■ 검색 노출 차단');d.blockers.forEach(b=>lines.push('- '+b.label+' — '+b.detail+' / '+(b.fix||'')));lines.push('');}
    d.categories.forEach(c=>{lines.push('■ '+c.label+' '+(Number.isFinite(c.score)?c.score+'점':'참고 진단'));const good=top(c.items,'pass',3),bad=sortedIssues(c.items).slice(0,limit);lines.push('잘된 점: '+(good.length?good.map(i=>i.label).join(', '):'확인된 항목 없음'));if(bad.length){lines.push('우선 개선:');bad.forEach(i=>lines.push('- ['+STATUS[i.status]+'] '+i.label+' — '+(i.fix||i.detail)))}else lines.push('우선 개선: 즉시 고칠 공개 항목 없음');if(c.privateChecks?.hasImprovement)lines.push('- 미공개 핵심 개선 항목 있음');lines.push('')});
    lines.push('진단 링크: '+location.href);return lines.join('\n');
  }
  $('chkCopyText').addEventListener('click',()=>{if(current)copy(reportText(),'진단 요약을 복사했습니다')});
  function exportData(){
    const d=current;
    // Export the public audit only; the paid snapshot and claim token stay separate.
    return {ok:d.ok,checkedAt:d.checkedAt,summary:d.summary,totalItems:d.totalItems,
      scoring:d.scoring,indexing:d.indexing,blockers:d.blockers||[],overall:d.overall,officialUpdates:d.officialUpdates,
      categories:d.categories.map(c=>({key:c.key,label:c.label,sub:c.sub,score:c.score,
        scoreScope:c.scoreScope,grade:c.grade,assessment:c.assessment,counts:c.counts,
        totalItems:c.totalItems,items:c.items.map(({id,group,label,status,detail,fix,
          sourceUrl,sourceCheckedAt,evidenceType,confidence,applicability,scope})=>({
          id,group,label,status,detail,fix,sourceUrl,sourceCheckedAt,evidenceType,
          confidence,applicability,scope}))}))};
  }
  function download(content,type,extension){const blob=new Blob([content],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='genilo-audit-'+(current.summary.host||'site')+'.'+extension;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),0)}
  $('chkDownloadJson').addEventListener('click',()=>{if(current)download(JSON.stringify(exportData(),null,2),'application/json;charset=utf-8','json')});
  $('chkDownloadCsv').addEventListener('click',()=>{if(!current)return;const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';const rows=[['영역','진단 묶음','상태','항목','확인 근거','개선 방법','공식 참고 문서','문서 확인일','근거 유형'],...current.categories.flatMap(c=>c.items.map(it=>[c.label,it.group||'기타 진단',STATUS[it.status],it.label,it.detail,it.fix||'',it.sourceUrl||'',it.sourceCheckedAt||'',it.evidenceType||'']))];download('\ufeff'+rows.map(row=>row.map(value=>quote(/^[=+@\-\t\r]/.test(String(value??''))?"'"+value:value)).join(',')).join('\r\n'),'text/csv;charset=utf-8','csv')});
  const CONSULT_PLANS={seo:'SEO 점수 개선 · 299,000원',full:'SEO·AEO·GEO 기술·콘텐츠 개선 · 990,000원'};
  document.querySelectorAll('[data-consult-plan]').forEach(link=>link.addEventListener('click',()=>{if(!current)return;try{const plan=CONSULT_PLANS[link.dataset.consultPlan]||CONSULT_PLANS.full;sessionStorage.setItem('genilo_seo_consult',JSON.stringify({url:current.summary.finalUrl,checkedAt:current.checkedAt,plan,report:reportText(4)}))}catch{}}));

  const preset=new URLSearchParams(location.search).get('u');
  const restored=await initGuide(render);
  if(preset&&!restored){input.value=preset;(window.SG_READY||Promise.resolve()).then(()=>run(preset))}
})();
