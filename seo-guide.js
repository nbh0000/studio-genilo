// Paid guide content is delivered only after the API authorizes this request.
const API = ['localhost', '127.0.0.1'].includes(location.hostname) ? 'http://127.0.0.1:8787' : 'https://api.genilo.kr';
const $ = id => document.getElementById(id);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statusLabels = {observed:'확인한 내용',review:'내용 검토 필요',missing:'보완 후보',unknown:'미확인'};
const priorityLabels = {high:'우선 검토',medium:'보완 권장',low:'참고'};
let authPromise, activeReport, session, busy = false;
let onReport = () => {};
let printState=[];
window.addEventListener('beforeprint',()=>{
  printState=[];
  if(!activeReport?.access?.granted||!activeReport.guide)return;
  $('guideReport').querySelectorAll('details,.guide-finding').forEach(el=>{
    const property=el.tagName==='DETAILS'?'open':'hidden';
    printState.push({el,property,value:el[property]});
    el[property]=property==='open';
  });
});
window.addEventListener('afterprint',()=>{
  printState.forEach(({el,property,value})=>{el[property]=value;});
  printState=[];
});

async function auth() {
  // Reuse exactly the client used by this site's existing login page.
  authPromise ||= import('./assets/supabase-client-D8zR8z4z.js').then(m => m.s);
  return authPromise;
}
export async function guideHeaders() {
  try {
    const client = await auth();
    const {data} = await client.auth.getSession();
    session = data.session;
    return session?.access_token ? {Authorization:`Bearer ${session.access_token}`} : {};
  } catch { session=null; return {}; }
}
function claimKey(id) { return `genilo_seo_claim_${id}`; }
function rememberOrder(reportId,orderId) { try {sessionStorage.setItem(`genilo_seo_order_${reportId}`,orderId);} catch {} }
function reportOrder(report) { try {return report?.access?.orderId||sessionStorage.getItem(`genilo_seo_order_${report?.reportId}`);} catch {return report?.access?.orderId;} }
function claimHeaders(id) {
  try { const token=sessionStorage.getItem(claimKey(id)); return token ? {'X-Seo-Report-Token':token} : {}; } catch { return {}; }
}
async function request(path, body, reportId) {
  const response = await fetch(API + path, {
    method:body ? 'POST' : 'GET', cache:'no-store',
    headers:{...await guideHeaders(), ...claimHeaders(reportId), ...(body ? {'Content-Type':'application/json'} : {})},
    ...(body ? {body:JSON.stringify(body)} : {}), signal:AbortSignal.timeout(45000)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || '리포트를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
  return data;
}
function safeLink(url) { try { const u = new URL(url); return /^https?:$/.test(u.protocol) ? u.href : '#'; } catch { return '#'; } }
function message(text, error=false) {
  const el=$('guideMessage'); if(!el) return;
  el.textContent=text; el.classList.toggle('is-error',error);
}
function returnPath() {
  const url=new URL(location.href);
  ['paymentKey','orderId','amount','guidePayment','code','message'].forEach(key=>url.searchParams.delete(key));
  return url.pathname+url.search;
}
function login() { sessionStorage.setItem('genilo_return_to',returnPath()); location.assign('/login.html?auth=login'); }
export function guideContext() {
  const competitors=$('chkCompetitors').value.split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
  if(competitors.length>2) { $('chkCompetitors').focus(); throw new Error('비교할 페이지는 최대 2개까지 입력해 주세요.'); }
  return {targetQuery:$('chkQuery').value.trim(),pageType:$('chkPageType').value,audience:$('chkAudience').value.trim(),region:$('chkRegion').value.trim(),competitors,includeRelated:$('chkRelated').checked};
}
export function restoreGuideContext(context={}) {
  for(const [id,key] of [['chkQuery','targetQuery'],['chkPageType','pageType'],['chkAudience','audience'],['chkRegion','region']]) if(context[key]) $(id).value=context[key];
}
function sourceLink(url,label='공식 근거') { return `<a href="${escape(safeLink(url))}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`; }
function renderFull(guide) {
  const p=guide.profile||{}, coverage=guide.coverage||{};
  const findings=guide.findings||[];
  return `<div class="guide-profile"><p><b>${escape(p.typeLabel||'페이지')}</b> · ${escape(p.typeSource==='selected'?'직접 선택한 유형':'공개 본문에서 추정한 유형')}</p><h3>${escape(p.title||'콘텐츠 진단')}</h3><dl><div><dt>목표 검색어</dt><dd>${escape(p.targetQuery||'미지정 — 검색어별 적합성은 판단하지 않았습니다.')}</dd></div><div><dt>분석 범위</dt><dd>입력 페이지의 공개 HTML · 관련 페이지 ${Number(coverage.relatedPagesAnalyzed)||0}개 · 비교 표본 ${Number(coverage.competitorSamplesAnalyzed)||0}개</dd></div></dl><p class="guide-method">규칙 기반 진단과 편집 제안입니다. 문맥의 적합성·주장의 사실 여부·검색 순위는 자동으로 확정하지 않습니다.</p></div>
  <div class="guide-finding-filter" role="group" aria-label="가이드 내용 필터"><button type="button" data-guide-filter="all" aria-pressed="true">전체 보기</button><button type="button" data-guide-filter="action" aria-pressed="false">보완할 내용</button><button type="button" data-guide-filter="unknown" aria-pressed="false">미확인 정보</button></div>
  <div class="guide-findings">${findings.map(f=>`<article class="guide-finding" data-guide-status="${escape(f.status)}"><div class="guide-finding-meta"><span>${escape(priorityLabels[f.priority]||'참고')}</span><span>${escape(f.applicability==='optional'?'선택 기능 · 점수 미반영':statusLabels[f.status]||'검토 필요')}</span></div><h3>${escape(f.title)}</h3><dl><div><dt>확인 근거</dt><dd>${escape(f.evidence)}</dd></div><div><dt>판단 이유</dt><dd>${escape(f.reason)}</dd></div><div><dt>보완 방법</dt><dd>${escape(f.recommendation)}</dd></div>${f.placement?`<div><dt>보완 위치</dt><dd>${escape(f.placement)}</dd></div>`:''}</dl>${f.sourceUrl?sourceLink(f.sourceUrl):''}</article>`).join('')||'<p>분석 가능한 본문이 부족합니다. 공개 본문을 제공한 뒤 다시 점검해 주세요.</p>'}</div>
  ${(guide.outlineSuggestions||[]).length?`<details class="guide-outline" open><summary>페이지 목적에 맞는 구성 제안</summary><p>필요한 정보를 기존 구역에 보완하세요. 아래 제목을 모두 추가할 필요는 없습니다.</p>${guide.outlineSuggestions.map(o=>`<section><h3>${escape(o.heading)}</h3><p>${escape(o.purpose)}</p><p><b>준비할 정보</b> ${escape(o.informationNeeded)}</p></section>`).join('')}</details>`:''}
  <details class="guide-limitations" open><summary>확인하지 못한 범위와 다음 확인</summary><ul>${(guide.limitations||[]).map(l=>`<li>${escape(l)}</li>`).join('')}</ul></details>
  <details class="guide-sources"><summary>참고한 공식 문서</summary><ul>${(guide.sources||[]).map(s=>`<li>${sourceLink(s.url,s.title)} <small>확인 ${escape(s.checkedAt)}</small></li>`).join('')}</ul></details>
  <div class="guide-downloads"><button type="button" class="btn outline" id="guideDownload">가이드 JSON 받기</button><button type="button" class="btn outline" id="guidePrint">가이드 인쇄·PDF 저장</button></div>`;
}
export function renderGuide(report) {
  const el=$('guideReport'); el.hidden=false; activeReport=report;
  if(!report?.reportId) {
    el.innerHTML='<h2 id="guideTitle">콘텐츠 개선 가이드</h2><p>'+escape(report?.message||'현재 가이드 저장소를 준비 중입니다. 기본 기술 진단은 아래에서 확인할 수 있습니다.')+'</p><p>열람할 가이드가 준비되기 전에는 결제를 받지 않습니다.</p>';
    return;
  }
  if(report.claimToken) { try { sessionStorage.setItem(claimKey(report.reportId),report.claimToken); } catch {} }
  const access=report.access||{};
  const allowed=access.granted===true&&Boolean(report.guide);
  const q=new URL(location.href); q.searchParams.set('report',report.reportId); history.replaceState(null,'',q);
  el.innerHTML=`<div class="guide-heading"><div><h2 id="guideTitle" tabindex="-1">콘텐츠 개선 가이드</h2><p>${allowed?(access.reason==='allowed_ip'?'허용된 IP에서 전체 열람 중입니다.':'이 계정에서 구매한 리포트입니다.'):'목표 검색어에 맞춰 무엇을, 어디에 보완할지 확인하세요.'}</p></div><span class="guide-access-label">${allowed?'전체 열람':'건당 150,000원'}</span></div>
  <p id="guideMessage" role="status" aria-live="polite"></p>
  ${allowed?renderFull(report.guide):`<div class="guide-paywall"><div><h3>이 페이지의 개선 방향을 구체적으로</h3><p>본문에서 확인한 근거, 누락된 정보, 수정 위치와 구성 제안, 내부 링크와 비교 페이지 검토 내용을 제공합니다.</p><p>이번 진단의 검토 항목 <b>${Number(report.preview?.findingCount)||0}개</b> · 우선 검토 <b>${Number(report.preview?.highPriorityCount)||0}개</b></p><p class="guide-method">자동 진단 결과입니다. 원고 작성·사이트 수정·검색 상단 노출 보장은 포함하지 않습니다. 이번에 생성한 리포트 1건의 열람 권한을 구매합니다.</p></div><div class="guide-purchase"><strong>150,000<span>원 / 리포트 1건</span></strong><button type="button" class="btn primary" id="guideBuy">로그인 후 리포트 구매</button><p>구매한 리포트는 내 계정에서 다시 볼 수 있습니다.</p><a href="/terms.html">이용약관</a> · <a href="/contact.html">결제 문의</a></div></div>`}`;
  $('guideBuy')?.addEventListener('click',purchase);
  if(!allowed&&reportOrder(report)) {
    const recovery=document.createElement('button'); recovery.type='button'; recovery.className='btn outline'; recovery.textContent='결제 상태 확인'; recovery.id='guideRecover';
    recovery.addEventListener('click',recoverPayment); el.querySelector('.guide-purchase')?.append(recovery);
  }
  if(session&&$('guideBuy')) $('guideBuy').textContent='150,000원 결제하기';
  el.querySelectorAll('[data-guide-filter]').forEach(button=>button.addEventListener('click',()=>{
    el.querySelectorAll('[data-guide-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    el.querySelectorAll('[data-guide-status]').forEach(row=>{row.hidden=button.dataset.guideFilter==='action'?!['missing','review'].includes(row.dataset.guideStatus):button.dataset.guideFilter==='unknown'?row.dataset.guideStatus!=='unknown':false;});
  }));
  $('guideDownload')?.addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify({reportId:report.reportId,createdAt:report.createdAt,guide:report.guide},null,2)],{type:'application/json;charset=utf-8'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`genilo-guide-${report.reportId}.json`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),500);
  });
  $('guidePrint')?.addEventListener('click',()=>window.print());
}
async function loadReport(id) {
  const data=await request('/seo-guide/reports/'+encodeURIComponent(id),null,id);
  onReport(data.report||null);
  $('chkResult').hidden=false;
  renderGuide(data);
  restoreGuideContext(data.guide?.profile);
  return data;
}
async function tossSdk() {
  if(window.TossPayments) return window.TossPayments;
  await new Promise((resolve,reject)=>{
    const script=document.createElement('script'); script.src='https://js.tosspayments.com/v2/standard'; script.onload=resolve; script.onerror=()=>{script.remove();reject(new Error('결제창을 불러오지 못했습니다. 네트워크를 확인해 주세요.'));}; document.head.append(script);
  });
  return window.TossPayments;
}
async function purchase() {
  if(busy||!activeReport) return;
  await guideHeaders();
  if(!session) { login(); return; }
  busy=true; const button=$('guideBuy'); button.disabled=true; button.textContent='주문 확인 중…';
  try {
    const checkout=await request('/seo-guide/reports/'+encodeURIComponent(activeReport.reportId)+'/checkout',{},activeReport.reportId);
    if(checkout.alreadyAccessible||checkout.access?.granted) { await loadReport(activeReport.reportId); return; }
    if(checkout.amount!==150000||checkout.currency!=='KRW'||!checkout.clientKey) throw new Error('결제 설정을 확인하지 못했습니다. 결제 문의로 연락해 주세요.');
    const TossPayments=await tossSdk();
    rememberOrder(activeReport.reportId,checkout.orderId);
    await TossPayments(checkout.clientKey).payment({customerKey:checkout.customerKey}).requestPayment({method:'CARD',amount:{value:checkout.amount,currency:checkout.currency},orderId:checkout.orderId,orderName:checkout.orderName,successUrl:checkout.successUrl,failUrl:checkout.failUrl});
  } catch(error) { message(error.message,true); }
  finally { busy=false; if(button.isConnected) { button.disabled=false; button.textContent='150,000원 결제하기'; } }
}
async function recoverPayment() {
  if(busy||!activeReport) return;
  const orderId=reportOrder(activeReport); if(!orderId) return;
  busy=true; const button=$('guideRecover'); if(button) button.disabled=true;
  try {
    const data=await request('/seo-guide/orders/'+encodeURIComponent(orderId));
    if(data.status==='paid') { await loadReport(activeReport.reportId); message('결제가 확인되어 리포트를 열었습니다.'); }
    else if(data.canResumeConfirmation) {
      message('결제창 인증은 완료됐지만 승인이 마무리되지 않았습니다. 아래 버튼으로 기존 주문의 승인을 이어갈 수 있습니다.');
      if(button) {button.textContent='기존 주문 결제 승인 이어하기';button.onclick=async()=>{
        if(busy)return;busy=true;button.disabled=true;
        try{const completed=await request('/seo-guide/orders/'+encodeURIComponent(orderId)+'/complete',{});if(completed.status==='paid'){await loadReport(activeReport.reportId);message('결제가 확인되었습니다.')}else message('아직 승인 상태를 확인 중입니다. 중복 결제하지 마세요.',true);}catch(error){message(error.message,true);}finally{busy=false;button.disabled=false;}
      };button.removeEventListener('click',recoverPayment);}
    } else message('결제 완료가 확인되지 않았습니다. 결제 내역을 확인하거나 문의해 주세요. 같은 주문을 다시 승인 요청하지 않습니다.',true);
  } catch(error) {message(error.message,true);}
  finally{busy=false;if(button?.isConnected)button.disabled=false;}
}
async function updateAccount() {
  await guideHeaders();
  $('guideAccount').textContent=session?.user?.email||'로그인하면 구매한 리포트를 다시 볼 수 있습니다.';
  $('guideLogin').hidden=Boolean(session); $('guideHistoryButton').hidden=!session; $('guideLogout').hidden=!session;
  if($('guideBuy')) $('guideBuy').textContent=session?'150,000원 결제하기':'로그인 후 리포트 구매';
}
export async function initGuide(handleReport) {
  onReport=handleReport;
  $('guideLogin').addEventListener('click',event=>{event.preventDefault();login();});
  $('guideLogout').addEventListener('click',async()=>{
    try { await (await auth()).auth.signOut(); session=null; $('guideHistory').replaceChildren(); $('guideHistory').hidden=true; if(activeReport) await loadReport(activeReport.reportId); }
    catch { $('guideReport').replaceChildren(); $('guideReport').hidden=true; }
    finally { await updateAccount(); }
  });
  $('guideHistoryButton').addEventListener('click',async()=>{
    const el=$('guideHistory'); el.hidden=false; el.textContent='리포트를 불러오는 중…';
    try {
      const response=await request('/seo-guide/reports'); const reports=response.reports||[];
      el.innerHTML=reports.length?'<h2>내 리포트</h2><ul>'+reports.map(r=>`<li><a href="/seochecker.html?report=${encodeURIComponent(r.reportId||r.id)}">${escape(r.targetUrl||r.preview?.targetUrl||'저장한 리포트')}</a> <span>${escape(r.createdAt?new Date(r.createdAt).toLocaleDateString('ko-KR'):'')}</span></li>`).join('')+'</ul>':'아직 저장된 리포트가 없습니다. 페이지를 점검해 보세요.';
    } catch(error) { el.textContent=error.message; }
  });
  await updateAccount();
  try {
    (await auth()).auth.onAuthStateChange((event,nextSession)=>{
      if(event==='SIGNED_OUT') {
        session=null;
        $('guideHistory').replaceChildren();$('guideHistory').hidden=true;
        if(activeReport?.guide) renderGuide({...activeReport,guide:undefined,report:undefined,access:{...activeReport.access,granted:false}});
        queueMicrotask(updateAccount);
      } else if(event==='SIGNED_IN') {session=nextSession;queueMicrotask(updateAccount);}
    });
  } catch { /* The free audit remains available if the login bundle cannot load. */ }
  const params=new URLSearchParams(location.search), id=params.get('report');
  if(!id) return false;
  onReport(null);
  $('chkResult').hidden=false; $('guideReport').hidden=false;
  $('guideReport').innerHTML='<h2 id="guideTitle">콘텐츠 개선 가이드</h2><p id="guideMessage" role="status">리포트 열람 권한을 확인하고 있습니다…</p>';
  const payment=params.get('guidePayment');
  try {
    if(payment==='success') {
      // Do not persist or share a payment key in the address bar.
      const payload={paymentKey:params.get('paymentKey'),orderId:params.get('orderId'),amount:Number(params.get('amount'))};
      if(payload.orderId)rememberOrder(id,payload.orderId);
      history.replaceState(null,'',returnPath());
      if(!session) throw new Error('결제한 계정으로 로그인한 뒤 내 리포트에서 결제 상태를 확인해 주세요. 중복 결제하지 마세요.');
      const confirmed=await request('/seo-guide/payments/confirm',payload,id);
      if(confirmed.status!=='paid') throw new Error('결제 승인 상태를 확인 중입니다. 내 리포트에서 다시 확인해 주세요. 중복 결제하지 마세요.');
    }
    await loadReport(id);
    if(payment==='fail') { history.replaceState(null,'',returnPath()); message('결제가 완료되지 않았습니다. 결제 내역을 확인한 뒤 다시 시도해 주세요.',true); }
  } catch(error) { const text=error.message;try{await loadReport(id);}catch{}message(text,true); }
  return true;
}
