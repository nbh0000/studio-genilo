/* ===== Studio Genilo · 부팅 시퀀스 ===== */
window.SG_READY=new Promise(resolve=>{
  const boot=document.getElementById('boot');if(!boot){resolve();return}
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let seen=false;try{seen=sessionStorage.getItem('sg_boot')==='1'}catch{}
  const quick=seen||reduce;
  document.body.classList.add('booting');
  const $=id=>document.getElementById(id);
  const status=$('bootStatus'),fill=$('bootFill'),dot=$('bootDot'),pctEl=$('bootPct'),enter=$('bootEnter'),log=$('bootLog');
  const STAGES=[[0,'INITIALIZING AI CORE'],[26,'LOADING ASSETS'],[54,'ESTABLISHING CONNECTION'],[82,'COMPILING INTERFACE'],[100,'READY TO ENTER']];
  const LOGS=['> sg.core ........ ok','> assets ......... ok','> link ........... secured','> ui ............. compiled'];
  const dur=quick?650:2600,start=performance.now();let stage=-1,logi=0,finished=false;
  function done(){if(finished)return;finished=true;try{sessionStorage.setItem('sg_boot','1')}catch{}
    boot.classList.add('out');document.body.classList.remove('booting');setTimeout(()=>boot.remove(),1000);resolve()}
  function frame(now){
    const t=Math.min(1,(now-start)/dur),e=1-Math.pow(1-t,3),p=Math.round(e*100);
    fill.style.width=p+'%';dot.style.left=p+'%';pctEl.textContent=String(p).padStart(3,'0')+'%';
    for(let i=STAGES.length-1;i>=0;i--){if(p>=STAGES[i][0]){if(stage!==i){stage=i;status.textContent=STAGES[i][1];if(i===STAGES.length-1)status.classList.add('ready')}break}}
    if(log&&logi<LOGS.length&&p>=(logi+1)*22){const d=document.createElement('div');d.textContent=LOGS[logi++];log.appendChild(d)}
    if(t<1)requestAnimationFrame(frame);else{boot.classList.add('ready');if(quick)setTimeout(done,120)}
  }
  requestAnimationFrame(frame);
  enter.addEventListener('click',done);
  addEventListener('keydown',e=>{if(e.key==='Enter'&&boot.classList.contains('ready'))done()});
});

/* ===== 홀로그램 커서 ===== */
(function(){
  if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  const h=document.createElement('div');h.className='holo';h.innerHTML='<i></i><s></s><b></b><em>SELECT</em>';
  const tail=document.createElement('div');tail.className='holo-tail';
  const mount=()=>document.body.append(tail,h);
  if(document.body)mount();else addEventListener('DOMContentLoaded',mount);
  let x=innerWidth/2,y=innerHeight/2,tx=x,ty=y,shown=false;const em=h.querySelector('em');
  addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;if(!shown){shown=true;tx=x;ty=y;h.classList.add('on');tail.classList.add('on')}
    const hot=e.target.closest&&e.target.closest('a,button,label,summary,.card,.globe-wrap,.faq-q');h.classList.toggle('hot',!!hot);
    if(hot)em.textContent=hot.matches('a[target=_blank]')?'OPEN':hot.matches('.globe-wrap')?'DRAG':'SELECT'},{passive:true});
  addEventListener('pointerdown',()=>h.classList.add('down'));addEventListener('pointerup',()=>h.classList.remove('down'));
  document.addEventListener('mouseleave',()=>{h.classList.remove('on');tail.classList.remove('on')});
  document.addEventListener('mouseenter',()=>{if(shown){h.classList.add('on');tail.classList.add('on')}});
  (function loop(){h.style.transform='translate('+x+'px,'+y+'px)';tx+=(x-tx)*.14;ty+=(y-ty)*.14;tail.style.transform='translate('+tx+'px,'+ty+'px)';requestAnimationFrame(loop)})();
})();

/* ===== 스킬 맵 · 홀로그램 ===== */
(function init(){
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);return}
  const stage=document.querySelector('.sk-stage');if(!stage)return;
  if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  const items=[...stage.querySelectorAll('.sk-node,.sk-link,.sk-card')];
  items.forEach(el=>el.addEventListener('animationend',e=>{if(e.target===el&&(e.animationName==='skHolo'||e.animationName==='skShimmer')){el.classList.add('done');el.classList.remove('glitch')}}));
  const cards=[...stage.querySelectorAll('.sk-card')];
  new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting&&e.intersectionRatio>=.15){stage.classList.add('in')}
    else if(!e.isIntersecting){stage.classList.remove('in');items.forEach(el=>el.classList.remove('done','glitch'))}
  }),{threshold:[0,.15]}).observe(stage);
  function tick(){
    const r=stage.getBoundingClientRect();
    if(document.visibilityState==='visible'&&r.bottom>0&&r.top<innerHeight){
      const done=cards.filter(c=>c.classList.contains('done'));
      if(done.length){const c=done[Math.random()*done.length|0];c.classList.remove('glitch');void c.offsetWidth;c.classList.add('glitch')}
    }
    setTimeout(tick,4500+Math.random()*4500);
  }
  setTimeout(tick,4000);
})();

/* ===== 히어로 타이틀 · 글자별 홀로그램 호버 ===== */
(function init(){
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);return}
  if(matchMedia('(prefers-reduced-motion:reduce)').matches||!matchMedia('(hover:hover)').matches)return;
  const targets=[document.getElementById('heroTitle'),document.querySelector('.hero-tagline')].filter(Boolean);
  targets.forEach(el=>{
    const walk=n=>{[...n.childNodes].forEach(c=>{
      if(c.nodeType===3){const f=document.createDocumentFragment();for(const ch of c.textContent){const s=document.createElement('span');s.className='ch';s.textContent=ch;f.appendChild(s)}c.replaceWith(f)}
      else if(c.nodeType===1&&c.tagName!=='BR')walk(c)})};
    walk(el);el.classList.add('holo-text');
    const chars=[...el.querySelectorAll('.ch')];let cur=-1;
    const set=i=>{if(i===cur)return;cur=i;chars.forEach(c=>c.classList.remove('hot','warm','cool'));if(i<0)return;
      chars[i].classList.add('hot');[chars[i-1],chars[i+1]].forEach(c=>c&&c.classList.add('warm'));[chars[i-2],chars[i+2]].forEach(c=>c&&c.classList.add('cool'))};
    el.addEventListener('pointermove',e=>{const t=e.target.closest('.ch');set(t?chars.indexOf(t):-1)});
    el.addEventListener('pointerleave',()=>set(-1));
  });
})();
