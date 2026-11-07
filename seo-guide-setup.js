const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pageTypes = [['auto','본문에서 추정'],['home','홈페이지'],['service','서비스 소개'],['article','정보 글·가이드'],['product','상품 상세'],['local','지역 업체'],['tool','도구·계산기'],['category','목록·카테고리']];

export function renderGuideSetup(report) {
  const preparation=report.preparation||{},settings=preparation.settings||{};
  return `<form id="guideSettingsForm" class="guide-settings" novalidate aria-labelledby="guideSettingsTitle">
    <h3 id="guideSettingsTitle">가이드 분석 조건</h3>
    <div class="guide-fields"><label for="guideTargetQuery">목표 검색어 <span>(필수)</span><input id="guideTargetQuery" name="targetQuery" maxlength="160" autocomplete="off" required value="${escape(settings.targetQuery)}" placeholder="예: 소상공인 홈페이지 제작 비용…" aria-describedby="guideSettingsHelp guideSettingsMessage"></label>
    <label for="guidePageType">페이지 유형<select id="guidePageType" name="pageType">${pageTypes.map(([value,label])=>`<option value="${value}"${(settings.pageType||'auto')===value?' selected':''}>${label}</option>`).join('')}</select></label></div>
    <div class="guide-fields"><label for="guideAudience">대상 고객 <span>(선택)</span><input id="guideAudience" name="audience" maxlength="160" autocomplete="off" value="${escape(settings.audience)}" placeholder="예: 처음 홈페이지를 만드는 소상공인…"></label><label for="guideRegion">대상 지역 <span>(선택)</span><input id="guideRegion" name="region" maxlength="100" autocomplete="off" value="${escape(settings.region)}" placeholder="예: 서울 마포구…" aria-describedby="guideRegionHelp"></label></div>
    <p id="guideRegionHelp" class="guide-method">대상 지역은 콘텐츠 검토에 사용하며, 순위 조회 조건은 결과에 별도로 표시합니다.</p>
    <label for="guideCompetitors">비교할 페이지 주소 <span>(선택, 최대 2개)</span><textarea id="guideCompetitors" name="competitors" rows="2" maxlength="4100" spellcheck="false" autocomplete="off" placeholder="https://example.com/service…" aria-describedby="guideCompetitorsHelp guideSettingsMessage">${escape((settings.competitors||[]).join('\n'))}</textarea></label>
    <p id="guideCompetitorsHelp" class="guide-method">공개 페이지 주소를 한 줄에 하나씩 입력하세요. 같은 진단 기준의 점수와 확인 가능한 검색 결과를 비교합니다.</p>
    <p id="guideSettingsHelp" class="guide-method">검색 순위는 조회 시점·지역·기기에 따라 달라집니다. 보고서에 실제 확인한 검색 범위와 미측정 항목을 표시합니다.</p>
    <p id="guideSettingsMessage" role="status" aria-live="polite"></p>
    <button type="submit" class="btn outline" id="guidePrepare">분석 조건 저장</button>
    ${preparation.prepared?'<p class="guide-method">저장한 조건이 바뀌면 새 리포트로 저장됩니다. 구매한 리포트의 조건과 내용은 유지됩니다.</p>':''}
  </form>`;
}

export function readGuideSetup(form) {
  const query=form.elements.targetQuery,competitors=form.elements.competitors;
  const targetQuery=query.value.trim();
  query.removeAttribute('aria-invalid');competitors.removeAttribute('aria-invalid');
  const invalid=(field,message)=>{field.setAttribute('aria-invalid','true');field.focus();throw new Error(message);};
  if(!targetQuery)invalid(query,'검색 결과를 확인할 목표 검색어를 입력해 주세요.');
  if(targetQuery.length>160)invalid(query,'목표 검색어는 160자 이내로 입력해 주세요.');
  const urls=competitors.value.split(/\r?\n/).map(value=>value.trim()).filter(Boolean);
  if(urls.length>2)invalid(competitors,'비교할 페이지는 최대 2개까지 입력해 주세요.');
  for(const value of urls){try{const url=new URL(value);if(!/^https?:$/.test(url.protocol)||url.username||url.password)throw new Error();}catch{invalid(competitors,'비교할 페이지의 전체 주소를 https:// 또는 http://로 입력해 주세요.');}}
  const audience=form.elements.audience.value.trim(),region=form.elements.region.value.trim();
  if(audience.length>160)invalid(form.elements.audience,'대상 고객은 160자 이내로 입력해 주세요.');
  if(region.length>100)invalid(form.elements.region,'대상 지역은 100자 이내로 입력해 주세요.');
  return {targetQuery,pageType:form.elements.pageType.value,audience,region,competitors:urls};
}

export function renderGuideGeneration(report) {
  const generation=report.generation||{},settings=report.preparation?.settings||{},status=generation.status;
  const working=['running','queued'].includes(status),failed=['failed','interrupted'].includes(status),unavailable=status==='unavailable';
  const heading=working?'가이드 리포트를 만들고 있습니다.':failed?'가이드 생성을 마치지 못했습니다.':unavailable?'가이드 생성 서비스를 준비 중입니다.':report.preparation?.prepared!==true?'가이드 분석 조건을 입력하세요.':'저장한 조건으로 가이드 리포트를 생성하세요.';
  return `<div class="guide-generation"><h3>${heading}</h3>
    ${settings.targetQuery?`<dl><div><dt>목표 검색어</dt><dd>${escape(settings.targetQuery)}</dd></div><div><dt>페이지 유형</dt><dd>${escape(pageTypes.find(([value])=>value===settings.pageType)?.[1]||'본문에서 추정')}</dd></div>${settings.audience?`<div><dt>대상 고객</dt><dd>${escape(settings.audience)}</dd></div>`:''}${settings.region?`<div><dt>대상 지역</dt><dd>${escape(settings.region)} <small>콘텐츠 검토에 사용하며 순위 조회 조건은 결과에 별도로 표시합니다.</small></dd></div>`:''}${(settings.competitors||[]).length?`<div><dt>비교 페이지</dt><dd>${settings.competitors.map(value=>`<p>${escape(value)}</p>`).join('')}</dd></div>`:''}</dl>`:''}
    <p class="guide-method">${working?'페이지 진단과 검색 결과 확인을 진행하고 있습니다. 완료되면 이 화면에서 결과를 열 수 있습니다.':failed?'이미 접수한 요청을 자동으로 다시 실행하지 않습니다. 내 리포트에서 상태를 확인하거나 결제 문의로 연락해 주세요.':unavailable?'지금은 새 가이드를 생성할 수 없습니다. 상태 다시 확인을 누르거나 내 리포트에서 준비 상태를 확인해 주세요.':'저장한 조건을 기준으로 공개 페이지와 검색 결과를 확인합니다. 확인할 수 없는 항목은 미측정으로 남습니다.'}</p>
    ${report.access?.canGenerate===true&&!working?'<button type="button" class="btn primary" id="guideGenerate">가이드 리포트 생성</button>':''}
    ${working||failed||unavailable?'<button type="button" class="btn outline" id="guideRefresh">상태 다시 확인</button>':''}
    ${failed?'<a href="/contact.html">결제 문의</a>':''}
  </div>`;
}
