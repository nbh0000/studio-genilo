const guideMenuButton=document.getElementById('menuBtn');
const guideMenu=document.getElementById('mobileMenu');
const guideHeader=document.getElementById('header');
const guideTick=document.getElementById('tick');
const guidePercent=document.getElementById('scrollPct');
let guideLastY=0;

function closeGuideMenu(){
  if(!guideMenuButton||!guideMenu)return;
  guideMenu.classList.remove('open');
  guideMenu.setAttribute('aria-hidden','true');
  guideMenu.inert=true;
  guideMenuButton.setAttribute('aria-expanded','false');
  guideMenuButton.textContent='☰';
  document.body.style.overflow='';
}

if(guideMenuButton&&guideMenu){
  guideMenuButton.addEventListener('click',()=>{
    const open=!guideMenu.classList.contains('open');
    guideMenu.classList.toggle('open',open);
    guideMenu.setAttribute('aria-hidden',String(!open));
    guideMenu.inert=!open;
    guideMenuButton.setAttribute('aria-expanded',String(open));
    guideMenuButton.textContent=open?'×':'☰';
    document.body.style.overflow=open?'hidden':'';
  });
  guideMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeGuideMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeGuideMenu()});
}

function updateGuideScroll(){
  const y=window.scrollY;
  const max=document.documentElement.scrollHeight-window.innerHeight;
  const progress=max>0?Math.min(1,y/max):0;
  if(guideTick)guideTick.style.top=`${progress*58}px`;
  if(guidePercent)guidePercent.textContent=String(Math.round(progress*100)).padStart(3,'0')+'%';
  if(guideHeader){
    const menuOpen=guideMenu?.classList.contains('open');
    guideHeader.classList.toggle('hide',y>guideLastY&&y>300&&!menuOpen);
  }
  guideLastY=y;
}

window.addEventListener('scroll',updateGuideScroll,{passive:true});
window.addEventListener('resize',updateGuideScroll);
updateGuideScroll();

const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealElements=document.querySelectorAll('.reveal');
if(reducedMotion||!('IntersectionObserver' in window)){
  revealElements.forEach(element=>element.classList.add('in'));
}else{
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    });
  },{threshold:.08,rootMargin:'0px 0px -4%'});
  revealElements.forEach(element=>revealObserver.observe(element));
}
