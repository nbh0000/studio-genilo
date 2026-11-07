const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const safeUrl=value=>{try{const url=new URL(value);return url.protocol==='https:'?url.href:'#';}catch{return '#';}};
const labels={observed:'관측',review:'검토 권장',unknown:'추가 확인'};

export function renderOfficialUpdates(coverage) {
  const el=document.getElementById('chkOfficial');
  if(!el)return;
  el.hidden=!coverage;
  if(!coverage){el.replaceChildren();return;}
  const urgency=f=>(f.status==='review'?20:f.status==='unknown'?10:0)+({high:3,medium:2,low:1}[f.priority]||0);
  const entries=coverage.entries||[],findings=[...(coverage.findings||[])].sort((a,b)=>urgency(b)-urgency(a));
  const statuses=coverage.statusLabels||{};
  el.innerHTML=`<header><h2>공식 문서 반영 내역</h2><p><time datetime="${escape(coverage.reviewedAt)}">${escape(coverage.reviewedAt)}</time> 확인 · 변경 기록 ${entries.length}건 대조</p></header>
    <p class="official-scope">점수에 반영하는 기술 검사와 선택 기능·소유자 확인 안내를 구분했습니다. 아래 반영 상태는 체커의 구현 범위이며, 이 사이트가 해당 조건을 통과했다는 뜻은 아닙니다.</p>
    ${findings.length?`<details class="official-observations" open><summary>이번 페이지에서 확인할 최신 기준 <span>${findings.length}건</span></summary>${findings.map(f=>`<article><div class="official-meta"><span>${escape(labels[f.status]||'참고')}</span><time datetime="${escape(f.updateDate)}">${escape(f.updateDate)}</time></div><h3>${escape(f.title)}</h3><p>${escape(f.evidence)}</p><p>${escape(f.reason)}</p><p><b>확인·수정 방법</b> ${escape(f.recommendation)}</p><a href="${escape(safeUrl(f.sourceUrl))}" target="_blank" rel="noopener noreferrer">공식 문서 확인</a></article>`).join('')}</details>`:''}
    <details class="official-registry"><summary>전체 변경 기록과 반영 범위 보기</summary>
      <label class="official-filter-label" for="officialStatus">반영 방식</label><select id="officialStatus"><option value="all">전체</option>${Object.entries(statuses).map(([key,label])=>`<option value="${escape(key)}">${escape(label)}</option>`).join('')}</select>
      <p class="official-count" role="status" aria-live="polite">${entries.length}건 표시</p>
      <ol>${entries.map(entry=>`<li data-official-status="${escape(entry.status)}"><div class="official-meta"><time datetime="${escape(entry.date)}">${escape(entry.date)}</time><span>${escape(statuses[entry.status]||entry.status)}</span></div><h3>${escape(entry.title)}</h3><p>${escape(entry.rationale)}</p><p class="official-applicability"><b>적용 대상</b> ${escape(entry.applicability)}</p><a href="${escape(safeUrl(entry.sourceUrl))}" target="_blank" rel="noopener noreferrer">현재 공식 문서</a></li>`).join('')}</ol>
    </details><p class="official-footer">확인일 이후의 업데이트를 자동 적용하지는 않습니다. ${[...new Map((coverage.sources||[]).map(s=>[s.url,s])).values()].map(s=>`<a href="${escape(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${escape(s.title)}</a>`).join(' · ')}</p>`;
  el.querySelector('#officialStatus')?.addEventListener('change',event=>{
    const value=event.target.value;let count=0;
    el.querySelectorAll('[data-official-status]').forEach(row=>{row.hidden=value!=='all'&&row.dataset.officialStatus!==value;if(!row.hidden)count++;});
    el.querySelector('.official-count').textContent=`${count}건 표시`;
  });
}
