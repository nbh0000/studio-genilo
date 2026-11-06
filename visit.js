/* genilo.kr 방문 유입 기록: 어디서(검색엔진·키워드·사이트) 와서 어느 페이지를 봤는지.
   이메일·이름·IP 같은 개인정보는 보내지 않고, 브라우저에 만든 무작위 ID만 쓴다.
   관리자 콘솔(admin.html)에서 "이 브라우저 방문 제외"를 켜면 기록하지 않는다. */
(() => {
  const API = "https://bvhzftjjvmjbfulizgvp.supabase.co/rest/v1/rpc/";
  const KEY = "sb_publishable_wIbZHpjXvp-cQooRSiXPFQ_ZLNni5gd";
  const SESSION_MS = 30 * 60 * 1000;
  let store;
  try { store = window.localStorage; store.getItem("x"); } catch { return; }
  if (navigator.webdriver || /bot|crawl|spider|lighthouse|headless/i.test(navigator.userAgent)) return;
  if (store.getItem("genilo_no_track") === "1") return;
  const host = location.hostname;
  const local = host === "127.0.0.1" || host === "localhost";
  if (!/(^|\.)genilo\.kr$/.test(host) && !(local && store.getItem("genilo_track_local") === "1")) return;

  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)));
  const clean = v => (v || "").replace(/\+/g, " ").trim().slice(0, 150);

  const ENGINES = [
    [/(^|\.)google\./, "google", ["q"]],
    [/(^|\.)search\.naver\.com$/, "naver", ["query", "oquery"]],
    [/(^|\.)naver\.com$/, "naver", ["query"]],
    [/(^|\.)search\.daum\.net$|(^|\.)daum\.net$/, "daum", ["q"]],
    [/(^|\.)bing\.com$/, "bing", ["q"]],
    [/(^|\.)zum\.com$/, "zum", ["query"]],
    [/(^|\.)yahoo\./, "yahoo", ["p", "q"]],
    [/(^|\.)duckduckgo\.com$/, "duckduckgo", ["q"]],
    [/(^|\.)baidu\.com$/, "baidu", ["wd"]],
    [/(^|\.)nate\.com$/, "nate", ["q"]]
  ];
  const SOCIAL = [
    [/^(m\.)?blog\.naver\.com$/, "naver_blog"], [/^(m\.)?cafe\.naver\.com$/, "naver_cafe"],
    [/(^|\.)instagram\.com$/, "instagram"], [/(^|\.)facebook\.com$|(^|\.)fb\.com$/, "facebook"],
    [/(^|\.)youtube\.com$|^youtu\.be$/, "youtube"], [/(^|\.)kakao\.com$|(^|\.)kakaocdn\.net$/, "kakao"],
    [/(^|\.)tistory\.com$/, "tistory"], [/(^|\.)threads\.(net|com)$/, "threads"], [/^t\.co$|(^|\.)x\.com$|(^|\.)twitter\.com$/, "x"],
    [/(^|\.)band\.us$/, "band"], [/(^|\.)kmong\.com$/, "kmong"]
  ];

  // 이번 페이지가 새 유입인지 판단
  const params = new URLSearchParams(location.search);
  let refUrl = null;
  try { if (document.referrer) refUrl = new URL(document.referrer); } catch {}
  const refHost = refUrl ? refUrl.hostname.replace(/^www\./, "") : "";
  const internal = refHost && (refHost === host.replace(/^www\./, "") || /(^|\.)genilo\.kr$/.test(refHost));

  let source = "direct", medium = "direct", keyword = "", campaign = clean(params.get("utm_campaign"));
  if (params.get("utm_source")) {
    source = clean(params.get("utm_source")).toLowerCase();
    medium = clean(params.get("utm_medium")).toLowerCase() || "campaign";
    keyword = clean(params.get("utm_term"));
  } else if (params.get("gclid")) {
    source = "google"; medium = "cpc";
  } else if (params.get("n_media") || params.get("NaPm")) {
    source = "naver"; medium = "cpc"; keyword = clean(params.get("n_query") || params.get("n_keyword"));
  } else if (refUrl && !internal) {
    const engine = ENGINES.find(([re]) => re.test(refUrl.hostname));
    const social = SOCIAL.find(([re]) => re.test(refUrl.hostname.replace(/^www\./, "")));
    if (social) { source = social[1]; medium = "social"; }
    else if (engine) {
      source = engine[1]; medium = "organic";
      for (const k of engine[2]) { const q = refUrl.searchParams.get(k); if (q) { keyword = clean(q); break; } }
    } else { source = refHost; medium = "referral"; }
  }
  if (!keyword && params.get("n_query")) keyword = clean(params.get("n_query"));

  const now = Date.now();
  let visitor = store.getItem("genilo_vid");
  if (!visitor) { visitor = uuid(); store.setItem("genilo_vid", visitor); }
  let session = null;
  try { session = JSON.parse(store.getItem("genilo_vs") || "null"); } catch {}
  const external = source !== "direct";
  const isNew = !session || now - session.last > SESSION_MS || (external && (session.src !== source || session.kw !== keyword));
  if (isNew) {
    session = { id: uuid(), src: source, med: medium, kw: keyword, host: medium === "direct" ? "" : refHost, landing: location.pathname };
  }
  session.last = now;
  store.setItem("genilo_vs", JSON.stringify(session));

  const ua = navigator.userAgent;
  const device = /iPad|Tablet/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? "tablet" : /Mobi|Android|iPhone/i.test(ua) ? "mobile" : "desktop";
  const id = uuid();
  const call = (fn, body) => fetch(API + fn, {
    method: "POST", keepalive: true, mode: "cors", credentials: "omit",
    headers: { "Content-Type": "application/json", apikey: KEY },
    body: JSON.stringify(body)
  }).catch(() => {});

  call("log_site_visit", { p: {
    id, visitor_id: visitor, session_id: session.id,
    path: location.pathname, title: document.title.slice(0, 200),
    referrer: refUrl && !internal ? document.referrer.slice(0, 600) : "",
    ref_host: internal ? "" : refHost,
    source: isNew ? source : (internal ? "internal" : source),
    medium: isNew ? medium : (internal ? "internal" : medium),
    keyword, campaign, is_entry: isNew,
    entry_source: session.src, entry_medium: session.med, entry_keyword: session.kw,
    entry_path: session.landing, entry_ref_host: session.host, device
  } });

  // 페이지에 머문 시간(화면이 보이는 동안만)
  let shown = document.visibilityState === "visible" ? now : 0, total = 0, sent = -1;
  const flush = () => {
    if (shown) { total += Date.now() - shown; shown = 0; }
    const sec = Math.round(total / 1000);
    if (sec !== sent && sec > 0) { sent = sec; call("end_site_visit", { p_id: id, p_session: session.id, p_seconds: sec }); }
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush(); else shown = Date.now();
  });
  addEventListener("pagehide", flush);
})();
