(()=>{'use strict';
const data=window.WORK_ARCHIVE_DATA||[];
const stream=document.querySelector('[data-wa-stream]');
const menu=document.querySelector('[data-wa-menu]');
const trigger=document.querySelector('[data-wa-menu-trigger]');
const menuShell=document.querySelector('[data-wa-menu-shell]');
if(!stream||!menu)return;

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const pad3=n=>String(n).padStart(3,'0');
const rangeLabel=pages=>!pages?.length?'':pages.length===1?String(pages[0]):`${pages[0]}-${pages[pages.length-1]}`;

/* The source extraction in assets/image/work-archive was produced in contiguous portfolio blocks.
   Keep that original extraction naming here instead of introducing new derivative artwork. */
const sourcePrefix=page=>{
 if(page<=33)return'aimmo';
 if(page<=45)return'trenbe';
 if(page<=68)return'yanolja';
 if(page<=98)return'nbt';
 return'coupang';
};
const sourcePath=page=>`./assets/image/work-archive/archive-${sourcePrefix(page)}-p${pad3(page)}.webp`;

/* Archive menu intentionally derives only from WORK_ARCHIVE_DATA.
   Projects that already have their own published case-study page never enter this menu. */
menu.innerHTML=data.map(group=>`<div class="wa-menu-group"><strong>${esc(group.company)}</strong><div>${group.projects.map(project=>`<a href="#${esc(project.id)}" data-wa-menu-project="${esc(project.id)}">${esc(project.title)}</a>`).join('')}</div></div>`).join('');

let globalIndex=0;
stream.innerHTML=data.map((group,companyIndex)=>{
 const projects=group.projects.map((project,projectIndex)=>{
  globalIndex+=1;
  const displayIndex=pad(globalIndex);
  const pages=Array.isArray(project.pages)?project.pages:[];
  const slides=pages.map((page,pageIndex)=>`<figure class="wa-gallery__slide${pageIndex===0?' is-active':''}" aria-hidden="${pageIndex===0?'false':'true'}"><img class="wa-gallery__image" src="${sourcePath(page)}" alt="${esc(project.title)} 원본 포트폴리오 P.${page}" loading="${pageIndex===0?'eager':'lazy'}" decoding="async"></figure>`).join('');
  const controls=pages.length>1?`<button class="wa-gallery__nav wa-gallery__nav--prev" type="button" data-wa-prev aria-label="이전 이미지"></button><button class="wa-gallery__nav wa-gallery__nav--next" type="button" data-wa-next aria-label="다음 이미지"></button>`:'';
  return `<article class="wa-project" id="${esc(project.id)}" data-wa-project data-company="${companyIndex}" data-project="${projectIndex}">
    <div class="wa-project__layout">
      <header class="wa-project__copy hm-reveal">
        <span class="hm-subno wa-project__index">${displayIndex} · ${esc(group.company)}</span>
        <h3 class="hm-subtitle wa-project__title">${esc(project.title)}</h3>
        <p class="wa-project__period">${esc(group.period)}</p>
      </header>
      <div class="wa-project__rail hm-reveal">
        <div class="wa-gallery" data-wa-gallery tabindex="0" aria-label="${esc(project.title)} 원본 포트폴리오 갤러리">
          <div class="wa-gallery__viewport">${slides}</div>
          ${controls}
          <span class="wa-gallery__status" data-wa-status>01 / ${pad(pages.length)}</span>
        </div>
        <div class="wa-gallery-caption">
          <p>${esc(project.desc)}</p>
          ${project.note?`<em>${esc(project.note)}</em>`:''}
          <span data-wa-page-label>ORIGINAL PORTFOLIO · P.${pages[0]||''} · 01 / ${pad(pages.length)}</span>
        </div>
      </div>
    </div>
  </article>`;
 }).join('');
 return `<section class="hm-section hm-ds-section wa-company" id="wa-company-${companyIndex+1}" data-wa-company="${companyIndex}"><div class="hm-wrap hm-ds-wrap"><div class="wa-project-list">${projects}</div></div></section>`;
}).join('');

const galleries=[...document.querySelectorAll('[data-wa-gallery]')];
galleries.forEach(gallery=>{
 const projectEl=gallery.closest('[data-wa-project]');
 const companyIndex=Number(projectEl?.dataset.company||0),projectIndex=Number(projectEl?.dataset.project||0);
 const project=data[companyIndex]?.projects?.[projectIndex];
 if(!project)return;
 const slides=[...gallery.querySelectorAll('.wa-gallery__slide')];
 const prev=gallery.querySelector('[data-wa-prev]');
 const next=gallery.querySelector('[data-wa-next]');
 const status=gallery.querySelector('[data-wa-status]');
 const pageLabel=projectEl.querySelector('[data-wa-page-label]');
 let index=0,busy=false;
 const render=()=>{
  if(status)status.textContent=`${pad(index+1)} / ${pad(slides.length)}`;
  if(pageLabel)pageLabel.textContent=`ORIGINAL PORTFOLIO · P.${project.pages[index]} · ${pad(index+1)} / ${pad(slides.length)}`;
 };
 const go=delta=>{
  if(busy||slides.length<2)return;
  const to=(index+delta+slides.length)%slides.length;
  if(to===index)return;
  busy=true;
  gallery.classList.toggle('is-reverse',delta<0);
  const current=slides[index],incoming=slides[to];
  incoming.classList.add('is-next');incoming.setAttribute('aria-hidden','false');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{incoming.classList.add('is-entering');current.classList.add('is-exiting')}));
  window.setTimeout(()=>{
   current.classList.remove('is-active','is-exiting');current.setAttribute('aria-hidden','true');
   incoming.classList.remove('is-next','is-entering');incoming.classList.add('is-active');
   index=to;render();gallery.classList.remove('is-reverse');busy=false;
  },620);
 };
 prev?.addEventListener('click',()=>go(-1));
 next?.addEventListener('click',()=>go(1));
 gallery.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft'){e.preventDefault();go(-1)}
  else if(e.key==='ArrowRight'){e.preventDefault();go(1)}
 });
 render();
});

const setMenuOpen=open=>{
 if(!trigger)return;
 trigger.setAttribute('aria-expanded',open?'true':'false');
 trigger.setAttribute('aria-label',open?'프로젝트 목록 닫기':'프로젝트 목록 열기');
 menu.classList.toggle('is-open',open);
 menu.setAttribute('aria-hidden',open?'false':'true');
};
trigger?.addEventListener('click',()=>setMenuOpen(trigger.getAttribute('aria-expanded')!=='true'));
document.addEventListener('pointerdown',e=>{if(menuShell&&!menuShell.contains(e.target))setMenuOpen(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenuOpen(false)});

const projectEls=[...document.querySelectorAll('[data-wa-project]')];
const menuLinks=[...document.querySelectorAll('[data-wa-menu-project]')];
menuLinks.forEach(link=>link.addEventListener('click',e=>{
 const target=document.getElementById(link.dataset.waMenuProject);if(!target)return;
 e.preventDefault();setMenuOpen(false);history.replaceState(null,'',`#${target.id}`);
 scrollTo({top:target.getBoundingClientRect().top+scrollY-96,behavior:'smooth'});
}));
const setActiveProject=id=>menuLinks.forEach(link=>link.classList.toggle('is-active',link.dataset.waMenuProject===id));
if('IntersectionObserver' in window&&projectEls.length){
 const ratios=new Map();
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>ratios.set(entry.target,entry.intersectionRatio));
  let best=null,bestRatio=0;
  projectEls.forEach(project=>{const ratio=ratios.get(project)||0;if(ratio>bestRatio){best=project;bestRatio=ratio}});
  if(best)setActiveProject(best.id);
 },{threshold:[0,.12,.25,.5,.75],rootMargin:'-18% 0px -52% 0px'});
 projectEls.forEach(project=>observer.observe(project));
}

const initial=location.hash.slice(1);
if(initial){const target=document.getElementById(initial);if(target)setTimeout(()=>scrollTo({top:target.getBoundingClientRect().top+scrollY-96,behavior:'auto'}),60)}
window.__hmAnimationScan?.();
})();
