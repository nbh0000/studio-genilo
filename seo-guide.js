// Paid guide content is delivered only after the API authorizes this request.
import { renderGuideSetup, readGuideSetup, renderGuideGeneration } from './seo-guide-setup.js?v=20261108-guideprepare';
import { renderGuideObservations, guideObservationSnapshot, observationArtifactStyles } from './seo-guide-observations.js?v=20261108-guideprepare';
const API = ['localhost', '127.0.0.1'].includes(location.hostname) ? 'http://127.0.0.1:8787' : 'https://api.genilo.kr';
const $ = id => document.getElementById(id);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statusLabels = {observed:'확인한 내용',review:'내용 검토 필요',missing:'보완 후보',unknown:'미확인'};
const priorityLabels = {high:'우선 검토',medium:'보완 권장',low:'참고'};
let authPromise, activeReport, session, busy = false;
let onReport = () => {};
let printState=[];
let paymentFeedback=false;
let setupDirty=false,contextVersion=0;
const generationWatch={id:null,attempts:0,timer:null};
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
function safeLink(url) { try { const u = new URL(url); return /^https?:$/.test(u.protocol)&&!u.username&&!u.password ? u.href : '#'; } catch { return '#'; } }
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
  paymentFeedback=false;
  contextVersion++;
  clearTimeout(generationWatch.timer);
  generationWatch.id=null;
  return {includeRelated:false};
}
export function restoreGuideContext(context={}) {
  for(const [id,key] of [['chkQuery','targetQuery'],['chkPageType','pageType']]) if(context[key]&&$(id)) $(id).value=context[key];
}
function sourceLink(url,label='공식 근거') { return `<a href="${escape(safeLink(url))}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`; }
function technicalSnapshot(report) {
  if(!report||!Array.isArray(report.categories))return null;
  return {checkedAt:report.checkedAt,summary:{finalUrl:report.summary?.finalUrl,title:report.summary?.title,status:report.summary?.status},
    blockers:(report.blockers||[]).map(({id,label,status,detail,fix,sourceUrl})=>({id,label,status,detail,fix,sourceUrl})),
    officialUpdates:{findings:(report.officialUpdates?.findings||[]).map(({id,title,status,priority,evidence,reason,recommendation,placement,sourceUrl,sourceCheckedAt})=>({id,title,status,priority,evidence,reason,recommendation,placement,sourceUrl,sourceCheckedAt}))},
    categories:report.categories.map(category=>({key:category.key,label:category.label,score:category.score,
      items:(category.items||[]).map(({id,label,status,group,detail,fix,sourceUrl,sourceCheckedAt})=>({id,label,status,group,detail,fix,sourceUrl,sourceCheckedAt}))}))};
}
function renderTechnical(report,open=true) {
  const technical=technicalSnapshot(report);
  if(!technical)return '<p class="guide-method">이 저장 리포트에는 상세 기술 진단이 포함되어 있지 않습니다.</p>';
  const labels={pass:'잘됨',warn:'주의',fail:'개선필요',unknown:'미확인',notApplicable:'해당 없음'};
  const blockers=technical.blockers.length?`<section class="guide-technical-category"><h3>검색 접근 차단 항목</h3>${technical.blockers.map(item=>`<article class="guide-technical-finding guide-blocker-finding" data-check-id="${escape(item.id)}"><h4>${escape(item.label)}</h4><dl>${item.detail?`<div><dt>확인 근거</dt><dd>${escape(item.detail)}</dd></div>`:''}${item.fix?`<div><dt>수정 방법</dt><dd>${escape(item.fix)}</dd></div>`:''}</dl>${item.sourceUrl?sourceLink(item.sourceUrl):''}</article>`).join('')}</section>`:'';
  const official=technical.officialUpdates.findings.length?`<section class="guide-technical-category"><h3>공식 문서 변경에 따른 확인 내용</h3>${technical.officialUpdates.findings.map(item=>`<article class="guide-technical-finding guide-official-finding" data-check-id="${escape(item.id)}"><div class="guide-finding-meta"><span>${escape(priorityLabels[item.priority]||'참고')}</span><span>${escape(statusLabels[item.status]||labels[item.status]||'검토 필요')}</span></div><h4>${escape(item.title)}</h4><dl>${[['확인 근거',item.evidence],['판단 이유',item.reason],['보완 방법',item.recommendation],['보완 위치',item.placement]].filter(([,value])=>value).map(([label,value])=>`<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>${item.sourceUrl?sourceLink(item.sourceUrl):''}</article>`).join('')}</section>`:'';
  return `<details class="guide-technical"${open?' open':''}><summary>기술 진단의 근거와 수정 방법</summary><p class="guide-method">진단 당시 공개 응답에서 확인한 내용입니다. 상태가 같은 항목도 페이지의 실제 조건에 맞춰 검토하세요.</p>${blockers}${technical.categories.map(category=>`<section class="guide-technical-category"><h3>${escape(category.label)} ${Number.isFinite(category.score)?`${escape(category.score)}점`:''}</h3>${category.items.map(item=>`<article class="guide-technical-finding" data-check-id="${escape(item.id)}"><div class="guide-finding-meta"><span>${escape(labels[item.status]||'미확인')}</span><span>${escape(item.group||'기술 진단')}</span></div><h4>${escape(item.label)}</h4><dl>${item.detail?`<div><dt>확인 근거</dt><dd>${escape(item.detail)}</dd></div>`:''}${item.fix?`<div><dt>수정 방법</dt><dd>${escape(item.fix)}</dd></div>`:''}</dl>${item.sourceUrl?sourceLink(item.sourceUrl,'공식 참고 문서'):''}</article>`).join('')}</section>`).join('')}${official}</details>`;
}
function renderFull(guide,artifact=false) {
  const p=guide.profile||{}, coverage=guide.coverage||{};
  const findings=guide.findings||[];
  return `<div class="guide-profile"><p><b>${escape(p.typeLabel||'페이지')}</b> · ${escape(p.typeSource==='selected'?'직접 선택한 유형':'공개 본문에서 추정한 유형')}</p><h3>${escape(p.title||'콘텐츠 진단')}</h3><dl><div><dt>목표 검색어</dt><dd>${escape(p.targetQuery||'미지정 — 검색어별 적합성은 판단하지 않았습니다.')}</dd></div><div><dt>분석 범위</dt><dd>입력 페이지의 공개 HTML · 관련 페이지 ${Number(coverage.relatedPagesAnalyzed)||0}개 · 비교 표본 ${Number(coverage.competitorSamplesAnalyzed)||0}개</dd></div></dl><p class="guide-method">규칙 기반 진단과 편집 제안입니다. 문맥의 적합성·주장의 사실 여부·검색 순위는 자동으로 확정하지 않습니다.</p></div>
  ${p.audience||p.region?`<dl class="guide-profile-context">${p.audience?`<div><dt>대상 고객</dt><dd>${escape(p.audience)}</dd></div>`:''}${p.region?`<div><dt>대상 지역</dt><dd>${escape(p.region)} <small>콘텐츠 검토 조건이며 순위 조회 조건은 검색 결과에 별도로 표시합니다.</small></dd></div>`:''}</dl>`:''}
  ${renderGuideObservations(guide,{artifact})}
  ${artifact?'':'<div class="guide-finding-filter" role="group" aria-label="가이드 내용 필터"><button type="button" data-guide-filter="all" aria-pressed="true">전체 보기</button><button type="button" data-guide-filter="action" aria-pressed="false">보완할 내용</button><button type="button" data-guide-filter="unknown" aria-pressed="false">미확인 정보</button></div>'}
  <div class="guide-findings">${findings.map(f=>`<article class="guide-finding" data-guide-status="${escape(f.status)}"><div class="guide-finding-meta"><span>${escape(priorityLabels[f.priority]||'참고')}</span><span>${escape(f.applicability==='optional'?'선택 기능 · 점수 미반영':statusLabels[f.status]||'검토 필요')}</span></div><h3>${escape(f.title)}</h3><dl><div><dt>확인 근거</dt><dd>${escape(f.evidence)}</dd></div><div><dt>판단 이유</dt><dd>${escape(f.reason)}</dd></div><div><dt>보완 방법</dt><dd>${escape(f.recommendation)}</dd></div>${f.placement?`<div><dt>보완 위치</dt><dd>${escape(f.placement)}</dd></div>`:''}</dl>${f.sourceUrl?sourceLink(f.sourceUrl):''}</article>`).join('')||'<p>분석 가능한 본문이 부족합니다. 공개 본문을 제공한 뒤 다시 점검해 주세요.</p>'}</div>
  ${(guide.outlineSuggestions||[]).length?`<details class="guide-outline" open><summary>페이지 목적에 맞는 구성 제안</summary><p>필요한 정보를 기존 구역에 보완하세요. 아래 제목을 모두 추가할 필요는 없습니다.</p>${guide.outlineSuggestions.map(o=>`<section><h3>${escape(o.heading)}</h3><p>${escape(o.purpose)}</p><p><b>준비할 정보</b> ${escape(o.informationNeeded)}</p></section>`).join('')}</details>`:''}
  <details class="guide-limitations" open><summary>확인하지 못한 범위와 다음 확인</summary><ul>${(guide.limitations||[]).map(l=>`<li>${escape(l)}</li>`).join('')}</ul></details>
  <details class="guide-sources"${artifact?' open':''}><summary>참고한 공식 문서</summary><ul>${(guide.sources||[]).map(s=>`<li>${sourceLink(s.url,s.title)} <small>확인 ${escape(s.checkedAt)}</small></li>`).join('')}</ul></details>
  ${artifact?'':'<div class="guide-downloads"><button type="button" class="btn primary" id="guideDownload">전체 리포트 HTML 받기</button><button type="button" class="btn outline" id="guideDownloadJson">리포트 JSON 받기</button><button type="button" class="btn outline" id="guidePrint">인쇄하기</button></div><p class="guide-method">HTML 파일은 브라우저에서 열 수 있습니다. PDF가 필요하면 인쇄 창에서 PDF 저장을 선택하세요.</p>'}`;
}
function purchaseReady(report=activeReport) { return Boolean(report?.reportId&&report.access?.canPurchase===true&&!setupDirty&&(!report.preparation||(report.preparation.prepared===true&&report.preparation.ready===true))); }
function updatePurchaseButton() {
  const button=$('guideBuy');if(!button)return;
  const ready=purchaseReady();
  button.disabled=!ready||busy;button.dataset.ready=String(ready);
  const preparation=activeReport?.preparation;
  button.textContent=!ready?(setupDirty||preparation?.prepared===false?'분석 조건 저장 후 구매':preparation?.ready===false?'가이드 서비스 준비 중':activeReport?.access?.billingReady===true?'결제 상태 확인 필요':'결제 준비 중'):session?'150,000원 결제하기':'로그인 후 150,000원 구매';
}
async function prepareGuide(event) {
  event.preventDefault();if(busy||!activeReport?.reportId)return;
  const form=event.currentTarget,feedback=$('guideSettingsMessage'),button=$('guidePrepare');
  let settings;
  try{settings=readGuideSetup(form);}catch(error){feedback.textContent=error.message;feedback.classList.add('is-error');return;}
  const report=activeReport,version=contextVersion;busy=true;button.disabled=true;button.textContent='분석 조건 저장 중…';feedback.textContent='';feedback.classList.remove('is-error');updatePurchaseButton();
  try{
    const data=await request('/seo-guide/reports/'+encodeURIComponent(report.reportId)+'/prepare',settings,report.reportId);
    if(activeReport!==report||version!==contextVersion)return;
    renderGuide(data);message(data.access?.granted===true?'분석 조건을 저장했습니다. 저장한 조건으로 가이드를 생성할 수 있습니다.':'분석 조건을 저장했습니다. 구매 전 저장한 조건을 확인해 주세요.');
  }catch(error){if(button.isConnected){feedback.textContent=error.message;feedback.classList.add('is-error');}}
  finally{busy=false;if(button.isConnected){button.disabled=false;button.textContent='분석 조건 저장';}updatePurchaseButton();}
}
async function generateGuide() {
  if(busy||activeReport?.access?.granted!==true||activeReport.access.canGenerate!==true)return;
  const report=activeReport,version=contextVersion,button=$('guideGenerate');busy=true;button.disabled=true;button.textContent='생성 요청 중…';
  try{
    const data=await request('/seo-guide/reports/'+encodeURIComponent(report.reportId)+'/generate',{},report.reportId);
    if(activeReport!==report||version!==contextVersion)return;
    renderGuide(data);
  }catch(error){if(activeReport===report){message(error.message,true);const refresh=document.createElement('button');refresh.type='button';refresh.id='guideRefresh';refresh.className='btn outline';refresh.textContent='상태 다시 확인';refresh.addEventListener('click',refreshGuide);button.replaceWith(refresh);}}
  finally{busy=false;if(button.isConnected){button.disabled=false;button.textContent='가이드 리포트 생성';}}
}
async function refreshGuide() {
  if(busy||!activeReport?.reportId)return;
  const report=activeReport,version=contextVersion,button=$('guideRefresh');busy=true;if(button)button.disabled=true;
  clearTimeout(generationWatch.timer);
  try{const data=await request('/seo-guide/reports/'+encodeURIComponent(report.reportId),null,report.reportId);if(activeReport!==report||version!==contextVersion)return;if(data.report)onReport(data.report);renderGuide(data);}
  catch(error){if(activeReport===report)message(error.message,true);}
  finally{busy=false;if(button?.isConnected)button.disabled=false;}
}
function watchGeneration(report) {
  clearTimeout(generationWatch.timer);
  if(report?.access?.granted!==true||!['running','queued'].includes(report.generation?.status)||!report.reportId)return;
  if(generationWatch.id!==report.reportId){generationWatch.id=report.reportId;generationWatch.attempts=0;}
  if(generationWatch.attempts>=120){message('생성 상태 자동 확인을 마쳤습니다. 상태 다시 확인을 누르거나 내 리포트에서 결과를 확인해 주세요.');return;}
  const version=contextVersion;
  generationWatch.timer=setTimeout(async()=>{
    if(activeReport?.reportId!==report.reportId||version!==contextVersion)return;
    generationWatch.attempts++;
    try{const data=await request('/seo-guide/reports/'+encodeURIComponent(report.reportId),null,report.reportId);if(activeReport?.reportId!==report.reportId||version!==contextVersion)return;if(data.report)onReport(data.report);renderGuide(data);}
    catch{if(activeReport?.reportId===report.reportId&&version===contextVersion){message('생성 상태를 확인하지 못했습니다. 잠시 후 다시 확인합니다.',true);watchGeneration(activeReport);}}
  },5000);
}
function previewCounts(preview={}) {
  const count=value=>Number.isSafeInteger(value)&&value>=0?new Intl.NumberFormat('ko-KR').format(value):null;
  const technical=count(preview.technicalCheckCount),findings=count(preview.findingCount),priority=count(preview.highPriorityCount);
  return [technical!==null?`기술 점검 ${technical}개`:null,findings!==null?`콘텐츠 검토 ${findings}개`:null,priority!==null?`우선 검토 ${priority}개`:null].filter(Boolean).join(' · ');
}
function fullReportDocument(report) {
  const created=new Date(report.createdAt);
  const date=Number.isFinite(created.getTime())?new Intl.DateTimeFormat('ko-KR',{dateStyle:'long',timeStyle:'short'}).format(created):'저장 시점 미확인';
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>제닐로 SEO 개선 가이드 리포트</title><style>body{max-width:900px;margin:48px auto;padding:0 24px;background:#fff;color:#202024;font:16px/1.75 system-ui,sans-serif;word-break:keep-all}h1{font-size:28px;line-height:1.4}h2,summary{font-size:22px;font-weight:700}h3{font-size:20px}h4{font-size:17px;margin:8px 0}a{color:#653080;overflow-wrap:anywhere}summary{cursor:pointer;padding:20px 0}p{margin:10px 0}article{padding:24px 0;border-bottom:1px solid #d6d6dd;break-inside:avoid}dl{margin:0}dl>div{display:grid;grid-template-columns:100px minmax(0,1fr);gap:20px;margin-top:12px}dt{color:#565660}dd{margin:0;overflow-wrap:anywhere}.guide-finding-meta{display:flex;gap:20px;font-size:14px;color:#565660}.guide-profile,.guide-technical-category,.guide-outline{margin-top:28px}.guide-method{color:#565660;font-size:14px}small{display:block}@media(max-width:600px){body{margin:24px auto;padding:0 16px}dl>div{grid-template-columns:1fr;gap:4px}}@media print{body{max-width:none;margin:0;padding:0}details>*{display:block!important}}${observationArtifactStyles}</style></head><body><h1>SEO 개선 가이드 리포트</h1><p>Studio Genilo · ${escape(date)}</p><p>${escape(report.report?.summary?.finalUrl||report.preview?.targetUrl||'')}</p>${renderTechnical(report.report)}${renderFull(report.guide,true)}</body></html>`;
}
function downloadReport(format) {
  const report=activeReport;
  if(report?.access?.granted!==true||!report.guide)return;
  const json=format==='json';
  const guide={...Object.fromEntries(['version','generatedAt','profile','coverage','summary','findings','outlineSuggestions','limitations','sources'].filter(key=>report.guide[key]!==undefined).map(key=>[key,report.guide[key]])),...guideObservationSnapshot(report.guide)};
  const settings=report.preparation?.settings;
  const preparation=settings?{prepared:report.preparation.prepared===true,settings:Object.fromEntries(['targetQuery','pageType','audience','region','competitors'].filter(key=>settings[key]!==undefined).map(key=>[key,settings[key]]))}:undefined;
  const content=json?JSON.stringify({reportId:report.reportId,createdAt:report.createdAt,preparation,report:technicalSnapshot(report.report),guide},null,2):fullReportDocument(report);
  const blob=new Blob([content],{type:json?'application/json;charset=utf-8':'text/html;charset=utf-8'});
  const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`genilo-guide-${report.reportId}.${json?'json':'html'}`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),500);
}
function hideGuideOffer(report,auditReport) {
  const categories=auditReport?.categories||report?.report?.categories||[];
  const scores=report?.preview?.scores??Object.fromEntries(categories.map(category=>[category.key,category.score]));
  return ['naver','google','aeo','geo'].every(key=>typeof scores[key]==='number'&&Number.isFinite(scores[key])&&scores[key]>=98&&scores[key]<=100);
}
export function renderGuide(report,auditReport) {
  const el=$('guideReport'); activeReport=report;setupDirty=false;clearTimeout(generationWatch.timer);
  if(report?.reportId&&report.claimToken) { try { sessionStorage.setItem(claimKey(report.reportId),report.claimToken); } catch {} }
  const access=report?.access||{};
  const granted=access.granted===true;
  const allowed=granted&&Boolean(report?.guide)&&(!report.preparation?.prepared||['complete','partial'].includes(report.generation?.status));
  if(report?.reportId){const q=new URL(location.href);q.searchParams.set('report',report.reportId);history.replaceState(null,'',q);}
  const offerHidden=!granted&&hideGuideOffer(report,auditReport);
  el.hidden=offerHidden&&!reportOrder(report)&&!paymentFeedback;
  if(el.hidden){el.replaceChildren();return;}
  const counts=previewCounts(report?.preview);
  el.innerHTML=offerHidden?'<h2 id="guideTitle" tabindex="-1">결제 상태 확인</h2><p id="guideMessage" role="status" aria-live="polite">기존 주문의 결제 상태를 확인할 수 있습니다.</p>':`<div class="guide-heading"><div><h2 id="guideTitle" tabindex="-1">SEO 개선 가이드 리포트</h2><p>${allowed?(access.reason==='allowed_ip'?'허용된 IP에서 전체 열람 중입니다.':'이 계정에서 구매한 리포트입니다.'):'점검 결과를 실제 수정 작업으로 이어갈 때 확인하세요.'}</p></div><span class="guide-access-label">${allowed?'전체 열람':'리포트 1건 · 150,000원'}</span></div>
  <p id="guideMessage" role="status" aria-live="polite"></p>
  ${allowed?renderTechnical(report.report,!report.preparation?.prepared)+renderFull(report.guide):`<div class="guide-paywall"><div><h3>어떤 근거로 판단했고, 어디를 어떻게 고칠지</h3><p>무료 결과에서 확인한 항목의 상태를 넘어, 진단한 페이지의 실제 근거와 수정 방법을 한 파일로 내려받습니다. 직접 작업하거나 담당자에게 전달할 때 참고할 수 있습니다.</p><ul class="guide-deliverables"><li><b>기술 진단 근거와 수정 방법</b>항목별 공개 응답에서 확인한 내용과 조치 방법, 공식 참고 문서를 확인합니다.</li><li><b>콘텐츠 보완 위치와 우선순위</b>본문에서 찾은 근거, 보완할 구역과 준비할 정보를 확인합니다. 해당하는 페이지에는 구성 제안도 포함됩니다.</li><li><b>전체 리포트 보관</b>HTML·JSON 파일로 내려받고, 구매한 계정에서 같은 리포트를 다시 열어볼 수 있습니다.</li></ul>${counts?`<p class="guide-preview-counts">이번 리포트: ${escape(counts)}</p>`:''}<p class="guide-method">규칙 기반 자동 진단 리포트입니다. 맞춤 원고 작성이나 사이트 수정 작업은 포함하지 않으며 검색 순위·AI 인용을 보장하지 않습니다. 구매 대상은 이번 진단 시점에 저장된 리포트 1건입니다.</p></div><div class="guide-purchase"><strong>150,000<span>원 / 리포트 1건</span></strong><button type="button" class="btn primary" id="guideBuy" aria-describedby="guideReadyStatus" disabled>결제 준비 중</button><p id="guideReadyStatus">${purchaseReady(report)?'로그인한 계정에 구매 권한이 저장됩니다. 결제가 확인되면 전체 리포트를 열람하고 내려받을 수 있습니다.':access.billingReady===true?'기존 주문 상태를 확인해 주세요. 확인 전에는 새 결제를 진행하지 않습니다.':'결제 서비스를 준비 중입니다. 지금은 구매할 수 없으며 결제가 진행되지 않습니다.'}</p><a href="/terms.html">이용약관</a> · <a href="/contact.html">결제 문의</a></div></div>`}`;
  $('guideBuy')?.addEventListener('click',purchase);
  if(allowed&&report.generation?.status==='partial')el.querySelector('.guide-heading').insertAdjacentHTML('afterend','<p class="guide-method guide-partial">일부 항목의 수집을 완료하지 못했습니다. 확인된 내용은 열람·다운로드할 수 있으며, 미측정 범위와 이유는 각 결과에 표시합니다.</p>');
  if(granted&&!allowed){
    el.querySelector('.guide-heading p').textContent=access.reason==='allowed_ip'?'허용된 IP에서 리포트를 생성할 수 있습니다.':'이 계정에서 구매한 리포트입니다.';
    el.querySelector('.guide-access-label').textContent=access.reason==='allowed_ip'?'전체 열람 권한':'구매한 리포트';
    el.querySelector('.guide-paywall').outerHTML=renderGuideGeneration(report);
    if(report.preparation?.prepared!==true)el.querySelector('.guide-generation').insertAdjacentHTML('beforeend',renderGuideSetup(report));
    $('guideGenerate')?.addEventListener('click',generateGuide);
    $('guideRefresh')?.addEventListener('click',refreshGuide);
  }
  if(!granted&&!offerHidden&&report?.preparation){
    el.querySelector('.guide-paywall h3').textContent='페이지 진단 근거와 경쟁 페이지·검색 결과 비교';
    el.querySelector('.guide-paywall>div>p').textContent='검색어와 비교할 페이지를 저장하고, 결제 후 해당 조건으로 가이드를 생성합니다. 실제 확인한 근거와 미측정 범위를 함께 담습니다.';
    el.querySelector('.guide-deliverables').innerHTML='<li><b>기술·콘텐츠 진단 근거와 수정 방법</b>공개 응답과 본문에서 확인한 근거, 보완 위치와 우선순위, 공식 참고 문서를 확인합니다.</li><li><b>경쟁 페이지 진단 비교</b>선택한 공개 페이지 최대 2개를 네이버·Google·AEO·GEO 기준으로 점검하고, 비교 가능한 점수 차이와 항목별 근거를 확인합니다.</li><li><b>목표 검색어의 실제 검색 결과</b>Google 자연검색과 네이버 웹문서에서 입력 페이지의 순위와 같은 사이트의 최고 순위를 구분합니다. 조회 시각·조건·범위를 표시하며, 찾지 못했거나 수집하지 못한 결과를 구분합니다.</li>';
    el.querySelector('.guide-paywall .guide-method').textContent='규칙 기반 진단과 조회 시점의 검색 결과를 담은 리포트 1건입니다. 생성 완료 후 HTML·JSON으로 내려받을 수 있습니다. 맞춤 원고 작성이나 사이트 수정 작업은 포함하지 않으며 검색 순위·AI 인용을 보장하지 않습니다.';
    el.querySelector('.guide-paywall>div').insertAdjacentHTML('beforeend',renderGuideSetup(report));
    if(report.preparation.prepared!==true)$('guideReadyStatus').textContent='분석 조건을 저장하면 구매 가능 여부를 확인할 수 있습니다.';
    else if(report.preparation.ready!==true)$('guideReadyStatus').textContent=report.preparation.message||'가이드 분석 서비스를 준비 중입니다. 지금은 구매할 수 없으며 결제가 진행되지 않습니다.';
    else if(purchaseReady(report))$('guideReadyStatus').textContent='결제 후 저장한 조건으로 가이드를 생성할 수 있습니다. 생성 완료 후 전체 리포트를 열람하고 내려받을 수 있습니다.';
  }
  $('guideSettingsForm')?.addEventListener('submit',prepareGuide);
  $('guideSettingsForm')?.addEventListener('input',()=>{setupDirty=true;updatePurchaseButton();if($('guideReadyStatus'))$('guideReadyStatus').textContent='변경한 분석 조건을 저장한 뒤 구매해 주세요.';});
  if(!granted&&reportOrder(report)) {
    const recovery=document.createElement('button'); recovery.type='button'; recovery.className='btn outline'; recovery.textContent='결제 상태 확인'; recovery.id='guideRecover';
    recovery.addEventListener('click',recoverPayment); (el.querySelector('.guide-purchase')||el).append(recovery);
  }
  updatePurchaseButton();
  el.querySelectorAll('[data-guide-filter]').forEach(button=>button.addEventListener('click',()=>{
    el.querySelectorAll('[data-guide-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    el.querySelectorAll('[data-guide-status]').forEach(row=>{row.hidden=button.dataset.guideFilter==='action'?!['missing','review'].includes(row.dataset.guideStatus):button.dataset.guideFilter==='unknown'?row.dataset.guideStatus!=='unknown':false;});
  }));
  $('guideDownload')?.addEventListener('click',()=>downloadReport('html'));
  $('guideDownloadJson')?.addEventListener('click',()=>downloadReport('json'));
  $('guidePrint')?.addEventListener('click',()=>{if(activeReport?.access?.granted===true&&activeReport.guide)window.print();});
  watchGeneration(report);
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
  if(busy||!purchaseReady()) return;
  const report=activeReport;
  await guideHeaders();
  if(activeReport!==report||!purchaseReady(report))return;
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
  finally { busy=false; updatePurchaseButton(); }
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
  updatePurchaseButton();
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
        if(activeReport?.guide) renderGuide({...activeReport,guide:undefined,report:undefined,access:{...activeReport.access,granted:false}},activeReport.report);
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
  paymentFeedback=Boolean(payment);
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
