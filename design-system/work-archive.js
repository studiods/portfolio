(()=>{'use strict';
const data=window.WORK_ARCHIVE_DATA||[];
const stream=document.querySelector('[data-archive-stream]');
const menuShell=document.querySelector('[data-archive-menu-shell]');
const trigger=document.querySelector('[data-archive-menu-trigger]');
const menu=document.querySelector('[data-archive-menu]');
if(!stream||!menu)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let projectIndex=0;
menu.innerHTML=data.map(group=>`<div class="archive-menu-group"><div class="archive-menu-company">${esc(group.company)}</div>${group.projects.map(p=>`<a href="#${esc(p.id)}" data-archive-menu-link="${esc(p.id)}">${esc(p.title)}</a>`).join('')}</div>`).join('');
stream.innerHTML=data.map(group=>group.projects.map(p=>{
  projectIndex+=1;
  const pages=Array.isArray(p.pages)?p.pages:[];
  const pageLabel=pages.length<2?String(pages[0]??''):String(pages[0])+'-'+String(pages[pages.length-1]);
  const slides=pages.map((page,i)=>`<figure class="archive-gallery__slide${i===0?' is-active':''}" aria-hidden="${i===0?'false':'true'}"><img src="./assets/image/work-archive/page-${String(page).padStart(3,'0')}.webp" alt="${esc(p.title)} · original portfolio page ${page}" loading="lazy" decoding="async"></figure>`).join('');
  const nav=pages.length>1?'<button class="archive-gallery__nav archive-gallery__nav--prev" type="button" data-archive-prev aria-label="이전 이미지"></button><button class="archive-gallery__nav archive-gallery__nav--next" type="button" data-archive-next aria-label="다음 이미지"></button>':'';
  const note=p.note?`<p class="archive-project__note">${esc(p.note)}</p>`:'';
  return `<section class="archive-project hm-section" id="${esc(p.id)}" data-archive-project><div class="archive-project__inner hm-wrap hm-ds-wrap"><header class="archive-project__copy hm-reveal"><span class="archive-project__index">${String(projectIndex).padStart(2,'0')}</span><p class="archive-project__company">${esc(group.company)} · ${esc(group.period)}</p><h2>${esc(p.title)}</h2><p class="archive-project__description">${esc(p.desc)}</p>${note}<span class="archive-project__source">ORIGINAL PORTFOLIO · P.${esc(pageLabel)}</span></header><div class="archive-project__content hm-reveal"><div class="archive-gallery" tabindex="0" data-archive-gallery aria-label="${esc(p.title)} 원본 포트폴리오 갤러리"><div class="archive-gallery__viewport">${slides}</div>${nav}<span class="archive-gallery__status" data-archive-status>01 / ${String(pages.length).padStart(2,'0')}</span></div></div></div></section>`;
}).join('')).join('');

const setMenuOpen=open=>{if(!trigger||!menu)return;trigger.setAttribute('aria-expanded',open?'true':'false');menu.classList.toggle('is-open',open)};
trigger?.addEventListener('click',()=>setMenuOpen(trigger.getAttribute('aria-expanded')!=='true'));
document.addEventListener('pointerdown',e=>{if(menuShell&&!menuShell.contains(e.target))setMenuOpen(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenuOpen(false)});

/* Match the WORKS compact-title behavior: switcher becomes available after the hero hands off. */
const updateMenuVisibility=()=>{document.body.classList.toggle('is-archive-menu-ready',window.scrollY>Math.max(120,window.innerHeight*.38))};
updateMenuVisibility();window.addEventListener('scroll',updateMenuVisibility,{passive:true});window.addEventListener('resize',updateMenuVisibility,{passive:true});

const menuLinks=[...document.querySelectorAll('[data-archive-menu-link]')];
const projects=[...document.querySelectorAll('[data-archive-project]')];
menuLinks.forEach(link=>link.addEventListener('click',e=>{const target=document.getElementById(link.dataset.archiveMenuLink);if(!target)return;e.preventDefault();setMenuOpen(false);history.replaceState(null,'',`#${target.id}`);window.scrollTo({top:target.getBoundingClientRect().top+window.scrollY-72,behavior:'smooth'})}));
const setActive=id=>menuLinks.forEach(link=>link.classList.toggle('is-active',link.dataset.archiveMenuLink===id));
if('IntersectionObserver' in window){const seen=new Map();const io=new IntersectionObserver(entries=>{entries.forEach(entry=>seen.set(entry.target,entry.intersectionRatio));let best=null,bestRatio=0;projects.forEach(p=>{const r=seen.get(p)||0;if(r>bestRatio){best=p;bestRatio=r}});if(best)setActive(best.id)},{threshold:[0,.12,.25,.5,.75],rootMargin:'-18% 0px -52% 0px'});projects.forEach(p=>io.observe(p))}else if(projects[0])setActive(projects[0].id);

/* Manual-only source galleries. No timer, interval, autoplay, or automatic slide advancement exists. */
document.querySelectorAll('[data-archive-gallery]').forEach(gallery=>{
  const slides=[...gallery.querySelectorAll('.archive-gallery__slide')];
  const prev=gallery.querySelector('[data-archive-prev]');
  const next=gallery.querySelector('[data-archive-next]');
  const status=gallery.querySelector('[data-archive-status]');
  let index=0,busy=false;
  const renderStatus=()=>{if(status)status.textContent=`${String(index+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`};
  const go=delta=>{if(busy||slides.length<2)return;const to=(index+delta+slides.length)%slides.length;if(to===index)return;busy=true;gallery.classList.toggle('is-reverse',delta<0);const current=slides[index],incoming=slides[to];incoming.classList.add('is-next');incoming.setAttribute('aria-hidden','false');requestAnimationFrame(()=>requestAnimationFrame(()=>{incoming.classList.add('is-entering');current.classList.add('is-exiting')}));window.setTimeout(()=>{current.classList.remove('is-active','is-exiting');current.setAttribute('aria-hidden','true');incoming.classList.remove('is-next','is-entering');incoming.classList.add('is-active');index=to;renderStatus();gallery.classList.remove('is-reverse');busy=false},740)};
  prev?.addEventListener('click',()=>go(-1));next?.addEventListener('click',()=>go(1));gallery.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();go(-1)}else if(e.key==='ArrowRight'){e.preventDefault();go(1)}});renderStatus();
});
window.__hmAnimationScan?.();
})();
