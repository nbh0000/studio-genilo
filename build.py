# -*- coding: utf-8 -*-
"""랜딩 원페이지(_landing_backup.html)를 메뉴별 개별 페이지로 분리하는 빌드 스크립트."""
import re, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
src = open("_landing_backup.html", encoding="utf-8").read()
css = src[src.find("<style>") + 7:src.find("</style>")]
js = src[src.rfind("<script>") + 8:src.rfind("</script>")]
land = re.search(r"const LAND_B64='([^']+)'", js).group(1)

def block(start, end, s=src):
    i = s.find(start); j = s.find(end, i) + len(end)
    assert i >= 0 and j > i, start
    return s[i:j]

hero = block('<section class="hero"', '</section>')
secs = {k: block(f'<section class="section" id="{k}"', '</section>') for k in
        ['portfolio', 'effect', 'pricing', 'maintenance', 'estimate', 'process', 'faq', 'contact']}
marquee = block('<div class="marquee"', '</div></div>')
header = block('<header id="header">', '</aside>')
footer = block('<footer>', '</footer>')
mbar = block('<div class="mobile-bar">', '</div>')
modal = block('<div class="preview-modal"', 'alt="포트폴리오 확대 이미지"></div></div>')

PAGES = [('index', '홈', 'index.html'), ('portfolio', '제작 사례', 'portfolio.html'), ('pricing', '제작 요금', 'pricing.html'),
         ('process', '제작 과정', 'process.html'), ('contact', '상담하기', 'contact.html')]
hmap = {'#top': 'index.html', '#portfolio': 'portfolio.html', '#pricing': 'pricing.html', '#estimate': 'contact.html',
        '#process': 'process.html', '#faq': 'contact.html', '#contact': 'contact.html'}

def links(s):
    for k, v in hmap.items():
        s = s.replace(f'href="{k}"', f'href="{v}"')
    return s

GHOST = {'portfolio': 'PORTFOLIO', 'effect': 'WHY', 'pricing': 'PRICING', 'maintenance': 'CARE', 'estimate': 'ESTIMATE', 'process': 'PROCESS', 'faq': 'FAQ', 'contact': 'CONTACT'}
for k in secs:
    secs[k] = links(secs[k]).replace(f'<section class="section" id="{k}"', f'<section class="section" id="{k}" data-ghost="{GHOST[k]}"', 1)
hero, header, footer, mbar = links(hero), links(header), links(footer), links(mbar)
hero = hero.replace('<div class="hero-scroll">SCROLL</div>', '<div class="hero-tags"><span>AI ASSISTED BUILD</span><span>PLAN · DESIGN · DEPLOY</span><span>SEOUL · KOREA</span></div><div class="hud-stats"><span><b>AI</b>CORE</span><span><b>WEB</b>APP</span><span><b>24</b>ONLINE</span></div><div class="hero-scroll">SCROLL DOWN</div>')
for key, label, fn in PAGES[1:]:
    header = header.replace(f'<a href="{fn}">{label}</a>', f'<a href="{fn}" data-page="{key}">{label}</a>')
header = header.replace('<a href="contact.html" data-page="contact">상담하기</a>', '<a href="contact.html" data-page="contact">상담하기</a><a href="workspace.html" data-page="workspace">AI 작업실</a><a href="experts.html" data-page="experts">AI 전문가 지원</a>')
header = header.replace('<a href="contact.html"><span>04</span>상담하기</a>', '<a href="contact.html"><span>04</span>상담하기</a><a href="workspace.html"><span>05</span>AI 작업실</a><a href="experts.html"><span>06</span>AI 전문가 지원</a>')
footer = footer.replace('<a href="contact.html">상담하기</a></nav>', '<a href="contact.html">상담하기</a><a href="workspace.html">AI 작업실</a><a href="experts.html">AI 전문가 지원</a></nav>')

css = css.replace('.section+.section{padding-top:40px}',
                  '.section+.section{padding-top:40px}\nmain>.section:first-child{padding-top:170px}')
_css = css.strip() + "\n"

site_js = open("site.src.js", encoding="utf-8").read().replace('__LAND__', land)
open("site.js", "w", encoding="utf-8", newline="\n").write(site_js)

STUDIO_CSS = """
/* ===== 히어로 배경 이미지 (index) ===== */
.hero:after{content:"";position:absolute;inset:0;z-index:0;background:radial-gradient(70% 60% at 50% 45%,rgba(23,23,23,.25),rgba(23,23,23,.9) 80%),linear-gradient(180deg,rgba(23,23,23,.65),transparent 28%,transparent 62%,#171717)}
.hero .wrap,.hero .hero-scroll{position:relative;z-index:1}
/* ===== 포트폴리오 라벨 강조 ===== */
#portfolio .eyebrow{font-size:1.05rem;letter-spacing:.42em;font-weight:700;color:#fff;padding:12px 22px 12px 26px;border:1px solid rgba(165,49,219,.55);border-radius:999px;background:linear-gradient(90deg,rgba(138,31,194,.32),rgba(138,31,194,.12));position:relative;isolation:isolate}
#portfolio .eyebrow:before{content:"";position:absolute;inset:-4px;border-radius:999px;box-shadow:0 0 0 4px rgba(138,31,194,.10),0 12px 40px rgba(138,31,194,.45);z-index:-1;animation:portfolioGlow 2.6s ease-in-out infinite;will-change:opacity}
#portfolio .eyebrow:before,#portfolio .eyebrow:after{color:var(--accent-2)}
#portfolio .title{margin-top:26px;font-size:clamp(2rem,4vw,3.4rem)}
@keyframes portfolioGlow{0%,100%{opacity:.6}50%{opacity:1}}
@media(max-width:720px){#portfolio .eyebrow{font-size:.82rem;letter-spacing:.32em;padding:10px 16px 10px 20px}}
/* ===== 스튜디오 비주얼 (index) ===== */
.studio{padding-top:0}
.studio .frame{position:relative;margin-top:44px;border-radius:22px;overflow:hidden;border:1px solid var(--line-strong);background:#0f0f11;box-shadow:0 40px 120px rgba(138,31,194,.18),0 20px 60px rgba(0,0,0,.5)}
.studio .frame img{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;filter:hue-rotate(22deg);transform:scale(1.02);transition:transform 1.6s var(--ease-out)}
.studio .frame.in img{transform:none}
.studio .frame:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(23,23,23,.28),transparent 40%,transparent 75%,rgba(23,23,23,.55));pointer-events:none}
.studio .tag{position:absolute;z-index:2;font-family:var(--font-mono);font-size:.62rem;letter-spacing:.28em;text-transform:uppercase;color:rgba(240,240,248,.82);display:inline-flex;align-items:center;gap:.7em;padding:8px 12px;border:1px solid rgba(255,255,255,.16);border-radius:999px;background:rgba(20,20,22,.55);backdrop-filter:blur(8px)}
.studio .tag b{width:6px;height:6px;border-radius:50%;background:var(--accent-2);box-shadow:0 0 12px var(--accent-2)}
.studio .tag.tl{top:22px;left:22px}
.studio .tag.br{right:22px;bottom:22px}
.studio .caption{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-top:14px;font-family:var(--font-mono);font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
@media(max-width:720px){.studio .frame{border-radius:14px}.studio .frame img{aspect-ratio:4/3}.studio .tag.br{display:none}.studio .caption{display:none}}
"""

STUDIO_HTML = """<section class="section studio" id="studio">
  <div class="wrap">
    <div class="reveal"><div class="eyebrow scramble">AI STUDIO · SEOUL</div><h2 class="title">아이디어 하나도<br>제대로 동작하는 제품으로<em>.</em></h2><p class="lead">Studio Genilo는 AI를 활용해 기획부터 화면 설계, 개발까지 한 번에 진행합니다. 정리된 구조와 또렷한 첫인상, 그 기준을 그대로 담았습니다.</p></div>
    <figure class="frame reveal">
      <span class="tag tl"><b></b>AI STUDIO GENILO · WEB APP</span>
      <img src="studio-1600.jpg" srcset="studio-1600.jpg 1600w, studio-2560.jpg 2560w" sizes="(max-width:1240px) 100vw, 1180px" width="2560" height="1429" alt="Studio Genilo 스튜디오 데스크. 모니터에 마젠타 파티클 지구본이 표시된 다크 모드 홈페이지 시안이 떠 있다." loading="lazy" decoding="async">
      <span class="tag br"><b></b>4K · 5504 × 3072</span>
    </figure>
    <div class="caption reveal"><span>AI-ASSISTED · PLAN TO DEPLOY</span><span>PC · MOBILE RESPONSIVE</span></div>
  </div>
</section>"""
open("site.css", "w", encoding="utf-8", newline="\n").write((_css + STUDIO_CSS).strip() + "\n")

INDEX_HERO = """<section class="hero hero-x" id="hero">
  <div class="hero-art" aria-hidden="true"><img src="ai-head-2560.jpg" srcset="ai-head-1600.jpg 1600w, ai-head-2560.jpg 2560w" sizes="(max-width:900px) 100vw, 68vw" alt="" decoding="async" fetchpriority="high"></div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <div class="eyebrow scramble">AI STUDIO GENILO · WEB APP STUDIO</div>
      <h1 id="heroTitle">웹 · 앱 제작<br>Studio Genilo</h1>
      <div class="hero-tagline">TRANSFORMING <em>IDEAS</em> INTO <em>WORKING PRODUCTS</em></div>
      <div class="hero-actions"><a class="btn primary" href="portfolio.html">제작 사례 보기</a><a class="btn outline" href="https://open.kakao.com/o/sACnsFNi" target="_blank" rel="noopener noreferrer">카카오톡 무료 상담</a></div>
    </div>
  </div>
  <div class="hero-tags"><span>AI ASSISTED BUILD</span><span>PLAN · DESIGN · DEPLOY</span><span>SEOUL · KOREA</span></div>
  <div class="hud-stats"><span><b>AI</b>CORE</span><span><b>WEB</b>APP</span><span><b>24</b>ONLINE</span></div>
  <div class="hero-scroll">SCROLL DOWN</div>
</section>"""

AICORE_HTML = """<section class="section ai-core" id="aicore" data-ghost="AI CORE">
  <div class="wrap ai-grid">
    <figure class="ai-figure reveal">
      <img src="ai-android-1400.jpg" alt="Studio Genilo AI 안드로이드" loading="lazy" decoding="async">
      <span class="hud-label tl"><b></b>MATERIALIZING_01<br><i>SYNTHETIC_VISUAL_INTERFACE</i></span>
      <span class="hud-label br">SYNC · 100%</span>
    </figure>
    <div class="ai-copy">
      <div class="reveal"><div class="eyebrow scramble">AI CORE · HOW WE BUILD</div><h2 class="title">AI가 설계하고,<br>사람이 완성합니다<em>.</em></h2></div>
      <div class="ai-stats stagger">
        <div class="stat"><b>AI</b><span>PLAN · CODE · QA</span></div>
        <div class="stat"><b>01</b><span>IDEA TO PRODUCT</span></div>
        <div class="stat"><b>PC·M</b><span>RESPONSIVE DEFAULT</span></div>
        <div class="stat"><b>24H</b><span>ONLINE SUPPORT</span></div>
      </div>
      <ul class="ai-list reveal"><li>요구사항을 정리해 화면 구조와 데이터 흐름부터 설계합니다.</li><li>AI 코드 생성과 사람의 검수를 함께 거쳐 빠르고 정확하게 개발합니다.</li><li>배포, 도메인 연결, 운영까지 한 번에 진행합니다.</li></ul>
    </div>
  </div>
</section>"""

NET_HTML = """<section class="section net" id="network" data-ghost="NETWORK">
  <div class="wrap net-grid">
    <div class="net-copy">
      <div class="reveal"><div class="eyebrow scramble">NETWORK · KOREA</div></div>
      <div class="net-tags reveal"><span>WEB APP</span><span>LANDING</span><span>ADMIN</span><span>BOOKING</span><span>PAYMENT</span><span>AUTH</span></div>
    </div>
    <div class="globe-wrap" id="globeWrap"><canvas id="globe"></canvas><div class="online" id="online"><b></b>ONLINE · KOREA</div></div>
  </div>
</section>"""

CTA_HTML = """<section class="cta-x" id="cta">
  <img class="cta-bg" src="ai-letters-2560.jpg" srcset="ai-letters-1600.jpg 1600w, ai-letters-2560.jpg 2560w" sizes="100vw" alt="" loading="lazy" decoding="async">
  <div class="wrap cta-inner reveal">
    <div class="eyebrow scramble">READY TO BUILD</div>
    <div class="hero-actions"><a class="btn primary" href="contact.html">상담하기</a><a class="btn light" href="portfolio.html">제작 사례 보기</a></div>
  </div>
</section>"""

SKILLS_HTML = """<section class="section skills" id="skills" data-ghost="SKILLS">
  <div class="wrap">
    <div class="reveal"><div class="eyebrow scramble">AI SKILLS · NEURAL MAP</div><h2 class="title sk-title">Where <em>AI</em> lives in our workflow<em>.</em></h2></div>
    <div class="sk-stage reveal">
      <svg class="sk-circuit" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
        <g class="trace"><path pathLength="1" d="M0 70H120l24 24H300V132"/><path pathLength="1" d="M0 250H70V300H180l20 20H330"/><path pathLength="1" d="M0 540H140l24-24H290V456"/><path pathLength="1" d="M1000 90H860l-24 24H700V150"/><path pathLength="1" d="M1000 300H930V340H820l-20 20H680"/><path pathLength="1" d="M1000 530H840l-24-24H710V460"/><path pathLength="1" d="M420 600V560l20-20H580l20 20V600"/><path pathLength="1" d="M470 0V40l-20 20H400"/><path pathLength="1" d="M530 0V40l20 20H600"/></g>
        <g class="pulse"><path pathLength="1" d="M0 70H120l24 24H300V132"/><path pathLength="1" d="M0 250H70V300H180l20 20H330"/><path pathLength="1" d="M0 540H140l24-24H290V456"/><path pathLength="1" d="M1000 90H860l-24 24H700V150"/><path pathLength="1" d="M1000 300H930V340H820l-20 20H680"/><path pathLength="1" d="M1000 530H840l-24-24H710V460"/><path pathLength="1" d="M420 600V560l20-20H580l20 20V600"/><path pathLength="1" d="M470 0V40l-20 20H400"/><path pathLength="1" d="M530 0V40l20 20H600"/></g>
        <g class="pad"><circle cx="120" cy="70" r="3"/><circle cx="300" cy="132" r="3"/><circle cx="70" cy="250" r="3"/><circle cx="330" cy="320" r="3"/><circle cx="290" cy="456" r="3"/><circle cx="860" cy="90" r="3"/><circle cx="700" cy="150" r="3"/><circle cx="930" cy="300" r="3"/><circle cx="680" cy="360" r="3"/><circle cx="710" cy="460" r="3"/><circle cx="440" cy="540" r="3"/><circle cx="580" cy="540" r="3"/><circle cx="400" cy="60" r="3"/><circle cx="600" cy="60" r="3"/></g>
      </svg>
      <div class="sk-figure"><img src="ai-android-1400.jpg" alt="" loading="lazy" decoding="async"><i class="sk-node" style="--x:46%;--y:22%;--c:#d24cff"></i><i class="sk-node" style="--x:36%;--y:50%;--c:#7c5cff"></i><i class="sk-node" style="--x:30%;--y:78%;--c:#ff6a3d"></i><i class="sk-node" style="--x:62%;--y:30%;--c:#24d3ff"></i><i class="sk-node" style="--x:58%;--y:56%;--c:#3dff9a"></i><i class="sk-node" style="--x:82%;--y:80%;--c:#ffd23d"></i></div>
      <i class="sk-link l" style="--xn:46;--y:22%;--c:#d24cff"></i><i class="sk-link l" style="--xn:36;--y:50%;--c:#7c5cff"></i><i class="sk-link l" style="--xn:30;--y:78%;--c:#ff6a3d"></i><i class="sk-link r" style="--xn:62;--y:30%;--c:#24d3ff"></i><i class="sk-link r" style="--xn:58;--y:56%;--c:#3dff9a"></i><i class="sk-link r" style="--xn:82;--y:80%;--c:#ffd23d"></i>
      <div class="sk-cards">
      <article class="sk-card l" style="--y:22%;--c:#d24cff"><h3>Prompt Engineering</h3><p>Specs that models execute exactly</p><span class="lvl">DAILY DRIVER</span><span class="bars"><b class="on"></b><b class="on"></b><b class="on"></b></span><small>CORE_01</small><span class="ret"><i></i><b></b></span></article>
      <article class="sk-card l" style="--y:50%;--c:#7c5cff"><h3>AI Pair Coding</h3><p>Claude Code, Cursor and Copilot in the loop</p><span class="lvl">DAILY DRIVER</span><span class="bars"><b class="on"></b><b class="on"></b><b class="on"></b></span><small>CORE_02</small><span class="ret"><i></i><b></b></span></article>
      <article class="sk-card l" style="--y:78%;--c:#ff6a3d"><h3>Generative Visuals</h3><p>Gemini image models for art direction</p><span class="lvl">SHIP WITH IT</span><span class="bars"><b class="on"></b><b class="on"></b><b></b></span><small>CORE_03</small><span class="ret"><i></i><b></b></span></article>
      <article class="sk-card r" style="--y:30%;--c:#24d3ff"><h3>Agent Workflows</h3><p>Tool-use, MCP and multi-step automation</p><span class="lvl">SHIP WITH IT</span><span class="bars"><b class="on"></b><b class="on"></b><b></b></span><small>CORE_04</small><span class="ret"><i></i><b></b></span></article>
      <article class="sk-card r" style="--y:56%;--c:#3dff9a"><h3>LLM Integration</h3><p>Chat, RAG and search inside web apps</p><span class="lvl">DAILY DRIVER</span><span class="bars"><b class="on"></b><b class="on"></b><b class="on"></b></span><small>CORE_05</small><span class="ret"><i></i><b></b></span></article>
      <article class="sk-card r" style="--y:80%;--c:#ffd23d"><h3>AI QA & Review</h3><p>Automated tests, code review and audits</p><span class="lvl">SHIP WITH IT</span><span class="bars"><b class="on"></b><b class="on"></b><b></b></span><small>CORE_06</small><span class="ret"><i></i><b></b></span></article>
      </div>
    </div>
    <div class="sk-legend reveal"><span>DAILY DRIVER · 3/3</span><span>SHIP WITH IT · 2/3</span><span>SYNC · LIVE</span></div>
  </div>
</section>"""

HEAD = '''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="Studio Genilo | AI로 만드는 웹 앱 제작 스튜디오. 랜딩 페이지부터 로그인·결제·관리자 기능이 있는 웹 앱까지 기획·디자인·개발을 한 번에.">
<title>{title}</title>
<link href="fonts.css" rel="stylesheet">
<link href="site.css" rel="stylesheet">
<link href="cyber.css?v=20261020" rel="stylesheet">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&display=swap" rel="stylesheet">
</head>
<body data-theme="{theme}" data-page="{key}">
<div class="grid-bg"></div>
<div class="cursor" id="cursor"></div>
<div class="scan"></div>
<div class="hud"><i></i><i></i><i></i><i></i></div>
<div class="boot" id="boot"><div class="boot-grid"></div><div class="boot-corners"><i></i><i></i><i></i><i></i></div>
<div class="boot-inner"><div class="boot-mark"><i></i></div><div class="boot-logo">Studio <em>Genilo</em></div><div class="boot-status" id="bootStatus">INITIALIZING AI CORE</div><div class="boot-tag">당신의 상상을 현실로 <b>AI</b>로</div><div class="boot-bar"><i id="bootFill"></i><b id="bootDot"></b></div><div class="boot-pct" id="bootPct">000%</div><button class="boot-enter" id="bootEnter" type="button">ENTER STUDIO<small>READY</small></button></div>
<div class="boot-log" id="bootLog"></div><div class="boot-ver">SG · BUILD 2026.09</div></div>
<script src="cyber.js?v=20261020"></script>
'''

EXPERTS_HTML = """<section class="section" id="experts" data-theme="dark" data-ghost="APPLY">
  <div class="wrap">
    <div class="reveal"><div class="eyebrow scramble">APPLY · AI EXPERT</div><h2 class="title">AI 전문가 지원<em>.</em></h2><p class="lead">Studio Genilo 프로젝트에 함께할 AI 전문가를 찾습니다. 지원서는 검토 후 이메일 또는 카카오톡으로 연락드립니다.</p></div>
    <div class="contact-grid">
      <aside class="contact-side card reveal">
        <h3>모집 분야</h3>
        <div class="info"><ul><li>프롬프트 엔지니어링 · 에이전트 워크플로</li><li>LLM 앱 개발 (RAG · 챗봇 · API 연동)</li><li>이미지 · 영상 · 음악 생성</li><li>데이터 · 자동화 · MCP 도구</li><li>UI 디자인 · 프런트엔드</li></ul></div>
        <h3 style="margin-top:22px">협업 형태</h3>
        <p>프로젝트 단위 프리랜서, 파트타임, 상시 협업 모두 가능합니다. 원격 기본, 필요 시 서울 마포 오프라인 미팅.</p>
        <h3 style="margin-top:22px">진행</h3>
        <div class="info"><ul><li>지원서 접수</li><li>포트폴리오 검토 (영업일 3일 이내)</li><li>화상 또는 카카오톡 인터뷰</li><li>시범 과제 후 협업 시작</li></ul></div>
      </aside>
      <form class="form card reveal" id="expertForm" novalidate>
        <h3 style="margin-top:0">지원서</h3>
        <p class="notice">* 표시는 필수입니다. 접수된 내용은 채용 검토 목적으로만 사용합니다.</p>
        <div class="form-grid">
          <div class="field"><label for="exName">이름 <span style="color:var(--red)">*</span></label><input id="exName" type="text" autocomplete="name" maxlength="80" placeholder="홍길동"></div>
          <div class="field"><label for="exEmail">이메일 <span style="color:var(--red)">*</span></label><input id="exEmail" type="text" inputmode="email" autocomplete="email" maxlength="254" placeholder="you@example.com"></div>
          <div class="field"><label for="exPhone">연락처</label><input id="exPhone" type="text" inputmode="tel" autocomplete="tel" maxlength="40" placeholder="010-0000-0000"></div>
          <div class="field"><label for="exYears">경력</label><select id="exYears"><option>1년 미만</option><option>1~3년</option><option>3~5년</option><option>5~10년</option><option>10년 이상</option></select></div>
          <div class="field full"><label>전문 분야 <span class="notice">(복수 선택)</span></label><div class="choice-row" id="exFields"><label><input class="exField" type="checkbox" value="프롬프트 엔지니어링"> 프롬프트 엔지니어링</label><label><input class="exField" type="checkbox" value="에이전트 워크플로"> 에이전트 워크플로</label><label><input class="exField" type="checkbox" value="LLM 앱 개발"> LLM 앱 개발</label><label><input class="exField" type="checkbox" value="이미지 생성"> 이미지 생성</label><label><input class="exField" type="checkbox" value="영상 생성"> 영상 생성</label><label><input class="exField" type="checkbox" value="음악 생성"> 음악 생성</label><label><input class="exField" type="checkbox" value="데이터 · 자동화"> 데이터 · 자동화</label><label><input class="exField" type="checkbox" value="UI 디자인"> UI 디자인</label><label><input class="exField" type="checkbox" value="프런트엔드"> 프런트엔드</label><label><input class="exField" type="checkbox" value="기타"> 기타</label></div></div>
          <div class="field full"><label>협업 형태</label><div class="choice-row"><label><input name="exType" type="radio" value="프리랜서 (프로젝트 단위)" checked> 프리랜서 (프로젝트 단위)</label><label><input name="exType" type="radio" value="파트타임"> 파트타임</label><label><input name="exType" type="radio" value="상시 협업"> 상시 협업</label></div></div>
          <div class="field full"><label for="exLinks">포트폴리오 · GitHub 링크</label><input id="exLinks" type="text" inputmode="url" maxlength="500" placeholder="https://github.com/… , https://…"></div>
          <div class="field full"><label for="exIntro">소개 <span style="color:var(--red)">*</span></label><textarea id="exIntro" rows="6" maxlength="4000" placeholder="주로 다뤄 온 모델과 도구, 대표 작업, 가능한 시간대를 적어 주세요."></textarea></div>
          <div class="field full"><label class="privacy"><input type="checkbox" id="exPrivacy"> 지원서 검토를 위한 개인정보 수집 및 이용에 동의합니다. <span style="color:var(--red)">*</span></label></div>
          <input type="text" id="exWebsite" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">
        </div>
        <div class="form-actions"><button class="btn primary" type="submit" id="exSubmit">지원서 보내기</button><button class="btn kakao-btn" type="button" id="exKakao">카카오톡으로 보내기</button></div>
        <div class="result" id="exResult" aria-live="polite"></div>
        <div class="form-success" id="exSuccess">지원서가 접수되었습니다. 검토 후 이메일로 연락드리겠습니다.</div>
      </form>
    </div>
  </div>
</section>
<script>
(function(){
  const $=id=>document.getElementById(id);const form=$('expertForm');if(!form)return;
  const startedAt=Date.now();const KAKAO='https://open.kakao.com/o/sACnsFNi';
  function fields(){return [...document.querySelectorAll('.exField:checked')].map(i=>i.value)}
  function type(){const r=document.querySelector('input[name=exType]:checked');return r?r.value:''}
  function compose(){return ['[AI 전문가 지원]','이름: '+$('exName').value.trim(),'이메일: '+$('exEmail').value.trim(),'연락처: '+($('exPhone').value.trim()||'-'),'경력: '+$('exYears').value,'전문 분야: '+(fields().join(', ')||'-'),'협업 형태: '+type(),'링크: '+($('exLinks').value.trim()||'-'),'','소개:',$('exIntro').value.trim()].join('\\n')}
  function validate(){const name=$('exName').value.trim(),email=$('exEmail').value.trim(),intro=$('exIntro').value.trim();
    if(name.length<2)return '이름을 입력해 주세요.';if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email))return '이메일 주소를 확인해 주세요.';
    if(intro.length<10)return '소개를 10자 이상 적어 주세요.';if(!$('exPrivacy').checked)return '개인정보 수집·이용에 동의해 주세요.';return ''}
  function show(msg,ok){const r=$('exResult');r.textContent=msg;r.style.color=ok?'':'var(--red)'}
  form.addEventListener('submit',async e=>{e.preventDefault();const err=validate();if(err){show(err,false);return}
    const btn=$('exSubmit');btn.disabled=true;btn.textContent='보내는 중…';show('',true);
    try{const res=await fetch('https://api.genilo.kr/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({category:'partnership',name:$('exName').value.trim(),email:$('exEmail').value.trim(),subject:'AI 전문가 지원 · '+$('exName').value.trim()+' · '+(fields().slice(0,2).join(', ')||'분야 미선택'),message:compose(),privacy:true,startedAt,website:$('exWebsite').value})});
      const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.message||'접수에 실패했습니다.');
      $('exSuccess').classList.add('show');form.querySelectorAll('input,textarea,select,button').forEach(el=>{if(el.id!=='exKakao')el.disabled=true});btn.textContent='접수 완료'}
    catch(err){show((err.message||'접수에 실패했습니다.')+' 카카오톡으로 보내기를 이용해 주세요.',false);btn.disabled=false;btn.textContent='지원서 보내기'}});
  $('exKakao').addEventListener('click',async()=>{const err=validate();if(err){show(err,false);return}
    try{await navigator.clipboard.writeText(compose())}catch{}window.open(KAKAO,'_blank','noopener');show('지원 내용이 복사되었습니다. 열린 채팅창에 붙여 넣어 보내 주세요.',true)});
})();
</script>"""

def page(key, title, theme, content):
    return (HEAD.format(title=title, theme=theme, key=key) + header + '\n\n<main id="top">\n' + content +
            '\n</main>\n\n' + footer + '\n\n' + mbar + '\n' + modal + '\n<script src="site.js"></script>\n</body>\n</html>\n')

T = 'Studio Genilo | AI 웹 앱 제작 스튜디오'
out = {
    'index.html': page('index', T, 'dark', INDEX_HERO + '\n\n' + SKILLS_HTML + '\n\n' + NET_HTML + '\n\n' + marquee + '\n\n' + CTA_HTML),
    'portfolio.html': page('portfolio', '제작 사례 | Studio Genilo', 'dark', secs['portfolio']),
    'pricing.html': page('pricing', '제작 요금 | Studio Genilo', 'light', secs['pricing'] + '\n\n' + secs['maintenance']),
    'process.html': page('process', '제작 과정 | Studio Genilo', 'dark', secs['process']),
    'contact.html': page('contact', '상담하기 | Studio Genilo', 'dark', secs['contact']),
    'experts.html': page('experts', 'AI 전문가 지원 | Studio Genilo', 'dark', EXPERTS_HTML),
}
for fn, html in out.items():
    open(fn, "w", encoding="utf-8", newline="\n").write(html)
print(sorted(out), "| leftover # links:", [fn for fn, h in out.items() if re.search(r'href="#', h)])
