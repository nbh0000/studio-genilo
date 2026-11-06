// 관리자 콘솔 "유입 분석" 탭. visit.js 가 남긴 site_visits 를 get_site_traffic() 으로 집계해 보여준다.
import { s as supabase } from "/assets/supabase-client-D8zR8z4z.js";

const $ = sel => document.querySelector(sel);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const num = v => Number(v || 0).toLocaleString("ko-KR");
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0) + "%";
const dur = sec => {
  sec = Math.round(Number(sec || 0));
  if (!sec) return "-";
  const m = Math.floor(sec / 60), s = sec % 60;
  return m ? `${m}분 ${s}초` : `${s}초`;
};
const when = v => v ? new Intl.DateTimeFormat("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(v)) : "-";

const SOURCE = {
  google: "구글", naver: "네이버", daum: "다음", bing: "빙", zum: "줌", yahoo: "야후", duckduckgo: "덕덕고", baidu: "바이두", nate: "네이트",
  naver_blog: "네이버 블로그", naver_cafe: "네이버 카페", instagram: "인스타그램", facebook: "페이스북", youtube: "유튜브",
  kakao: "카카오", tistory: "티스토리", threads: "스레드", x: "X(트위터)", band: "밴드", kmong: "크몽", direct: "직접 방문"
};
const MEDIUM = { organic: "검색", cpc: "광고", social: "SNS·블로그", referral: "다른 사이트", direct: "주소 입력·북마크", campaign: "캠페인", internal: "사이트 안 이동" };
const DEVICE = { mobile: "휴대폰", desktop: "PC", tablet: "태블릿", unknown: "알 수 없음" };
const srcName = s => SOURCE[s] || s || "-";
const route = (s, m) => s === "direct" ? "직접 방문" : `${srcName(s)} <small>${esc(MEDIUM[m] || m || "")}</small>`;
const pageName = p => {
  if (!p) return "-";
  if (p === "/" || p === "/index.html") return "홈";
  return p.replace(/^\//, "").replace(/\.html$/, "");
};
const pageLink = p => p ? `<a href="${esc(p)}" target="_blank" rel="noopener">${esc(pageName(p))}</a>` : "-";
const empty = (cols, msg = "이 기간에 기록이 없습니다.") => `<tr><td colspan="${cols}" class="empty-data">${msg}</td></tr>`;

let loaded = false;

async function load() {
  const status = $("#trafficStatus");
  status.textContent = "집계 중…";
  const { data, error } = await supabase.rpc("get_site_traffic", { p_days: Number($("#trafficWindow").value) || 30 });
  if (error) {
    status.textContent = /get_site_traffic/.test(error.message) ? "Supabase에 020_site_traffic.sql 적용이 필요합니다." : error.message;
    return;
  }
  loaded = true;
  const t = data || {};
  const sm = t.summary || {};

  $("#trafficSummary").innerHTML = [
    ["방문자", num(sm.visitors), `처음 온 사람 기준 · 방문 ${num(sm.sessions)}회`],
    ["페이지뷰", num(sm.pageviews), `방문당 ${sm.sessions ? (sm.pageviews / sm.sessions).toFixed(1) : 0}페이지`],
    ["검색 유입", num(sm.searchSessions), `전체 방문의 ${pct(sm.searchSessions, sm.sessions)}`],
    ["평균 체류", dur(sm.avgSeconds), `한 페이지만 보고 나감 ${pct(sm.bounceSessions, sm.sessions)}`]
  ].map(([k, v, s]) => `<article><span>${k}</span><strong>${v}</strong><small>${esc(s)}</small></article>`).join("");

  const daily = t.daily || [];
  const max = Math.max(1, ...daily.map(d => d.sessions));
  $("#trafficDaily").innerHTML = daily.length ? daily.map(d => {
    const label = d.day.slice(5).replace("-", ".");
    return `<div class="tr-day" title="${esc(d.day)} 방문 ${num(d.sessions)} · 방문자 ${num(d.visitors)} · 페이지뷰 ${num(d.pageviews)}"><b>${d.sessions ? num(d.sessions) : ""}</b><i style="height:${Math.max(d.sessions ? 4 : 1, (d.sessions / max) * 100)}%"></i><span>${label}</span></div>`;
  }).join("") : '<p class="empty-data">기록이 없습니다.</p>';

  $("#trafficChannels").innerHTML = (t.channels || []).map(c =>
    `<tr><td>${route(c.source, c.medium)}</td><td>${num(c.sessions)}</td><td>${num(c.visitors)}</td><td>${num(c.pageviews)}</td><td>${dur(c.avgSeconds)}</td></tr>`
  ).join("") || empty(5);

  $("#trafficKeywords").innerHTML = (t.keywords || []).map(k =>
    `<tr><td><b>${esc(k.keyword)}</b></td><td>${esc(srcName(k.source))}</td><td>${num(k.sessions)}</td><td>${pageLink(k.landing)}</td><td>${when(k.lastAt)}</td></tr>`
  ).join("") || empty(5, "검색어가 잡힌 방문이 아직 없습니다.");

  $("#trafficFlows").innerHTML = (t.flows || []).map(f =>
    `<tr><td>${route(f.source, f.medium)}</td><td>${pageLink(f.landing)}</td><td>${num(f.sessions)}</td><td>${f.avgPages}</td></tr>`
  ).join("") || empty(4);

  $("#trafficReferrers").innerHTML = (t.referrers || []).map(r => {
    const sample = r.sample && /^https?:\/\//.test(r.sample) ? `<small><a href="${esc(r.sample)}" target="_blank" rel="noopener noreferrer">${esc(r.sample.length > 70 ? r.sample.slice(0, 70) + "…" : r.sample)}</a></small>` : "";
    return `<tr><td>${esc(r.host)}${sample}</td><td>${esc(MEDIUM[r.medium] || r.medium)}</td><td>${num(r.sessions)}</td><td>${pageLink(r.landing)}</td></tr>`;
  }).join("") || empty(4);

  const dv = t.devices || [];
  const dmax = Math.max(1, ...dv.map(d => d.sessions));
  $("#trafficDevices").innerHTML = dv.length ? dv.map(d =>
    `<div class="bar-row"><div><span>${esc(DEVICE[d.device] || d.device)}</span><b>${num(d.sessions)} (${pct(d.sessions, sm.sessions)})</b></div><i><em style="width:${Math.max(4, d.sessions / dmax * 100)}%"></em></i></div>`
  ).join("") : '<p class="empty-data">기록이 없습니다.</p>';

  $("#trafficPages").innerHTML = (t.pages || []).map(p => {
    const title = (p.title || "").replace(/\s*[|·-]\s*Studio Genilo.*$/i, "");
    return `<tr><td>${pageLink(p.path)}${title ? `<small>${esc(title)}</small>` : ""}</td><td>${num(p.pageviews)}</td><td>${num(p.visitors)}</td><td>${num(p.entries)}</td><td>${dur(p.avgSeconds)}</td></tr>`;
  }).join("") || empty(5);

  $("#trafficRecent").innerHTML = (t.recent || []).map(r => {
    const from = r.source === "direct" ? "직접 방문" : esc(srcName(r.source)) + (r.refHost && r.refHost !== r.source ? `<small>${esc(r.refHost)}</small>` : "");
    const path = (r.paths || []).map(p => esc(pageName(p))).join(" › ") + (r.pageviews > (r.paths || []).length ? " …" : "");
    return `<tr><td>${when(r.startedAt)}</td><td>${from}</td><td>${r.keyword ? `<b>${esc(r.keyword)}</b>` : "-"}</td><td class="tr-path">${path}</td><td>${num(r.pageviews)}</td><td>${dur(r.seconds)}</td><td>${esc(DEVICE[r.device] || r.device || "-")}</td></tr>`;
  }).join("") || empty(7);

  status.textContent = `최근 ${t.windowDays}일 (오늘 포함) · ${new Intl.DateTimeFormat("ko-KR", { timeStyle: "short" }).format(new Date())} 기준`;
}

const run = () => load().catch(e => { $("#trafficStatus").textContent = e.message; });

document.querySelector('aside nav button[data-tab="traffic"]').addEventListener("click", () => { if (!loaded) run(); });
$("#trafficReload").addEventListener("click", run);
$("#trafficWindow").addEventListener("change", run);

// 관리자 본인 방문은 기본으로 빼고 센다
const box = $("#trafficSelf");
try {
  if (localStorage.getItem("genilo_no_track") === null) localStorage.setItem("genilo_no_track", "1");
  box.checked = localStorage.getItem("genilo_no_track") === "1";
  box.addEventListener("change", () => localStorage.setItem("genilo_no_track", box.checked ? "1" : "0"));
} catch { box.disabled = true; }
