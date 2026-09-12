(()=>{'use strict';
const data=window.WORK_ARCHIVE_DATA||[];
const menuData=window.WORK_ARCHIVE_MENU||[];
const stream=document.querySelector('[data-wa-stream]');
const progress=document.querySelector('[data-wa-progress]');
const menu=document.querySelector('[data-wa-menu]');
const trigger=document.querySelector('[data-wa-menu-trigger]');
const menuShell=document.querySelector('[data-wa-menu-shell]');
if(!stream||!menu)return;

const SPRITES={
 'AIMMO':{src:'./assets/image/work-archive/aimmo-archive.avif',cols:4,rows:2,pages:[28,29,30,31,32,33]},
 'TRENBE':{src:'./assets/image/work-archive/trenbe-archive.avif',cols:3,rows:1,pages:[36,37,38]},
 'YANOLJA':{src:'./assets/image/work-archive/yanolja-archive.avif',cols:4,rows:2,pages:[61,62,63,64,65,67,68]},
 'NBT':{src:'./assets/image/work-archive/nbt-archive.avif',cols:4,rows:4,pages:[73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88]},
 'JOONGANG ILBO':{src:'./assets/image/work-archive/joongang-archive.avif',cols:4,rows:3,pages:[90,91,92,93,94,95,96,97,98]},
 'COUPANG':{src:'./assets/image/work-archive/coupang-archive.avif',cols:4,rows:3,pages:[100,101,102,103,104,105,106,107,108]},
 'VINYL':{src:'./assets/image/work-archive/vinyl-archive.avif',cols:4,rows:8,pages:[110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138]}
};

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const rangeLabel=pages=>!pages?.length?'':pages.length===1?String(pages[0]):`${pages[0]}-${pages[pages.length-1]}`;
const frameStyle=(company,page)=>{
 const cfg=SPRITES[company];
 if(!cfg)return '';
 const index=cfg.pages.indexOf(page);
 if(index<0)return '';
 const col=index%cfg.cols,row=Math.floor(index/cfg.cols);
 const x=cfg.cols===1?0:(col/(cfg.cols-1))*100;
 const y=cfg.rows===1?0:(row/(cfg.rows-1))*100;
 return `background-image:url('${cfg.src}');background-size:${cfg.cols*100}% ${cfg.rows*100}%;background-position:${x}% ${y}%;`;
};

menu.innerHTML=menuData.map(group=>`<div class="wa-menu-group"><strong>${esc(group.company)}</strong><div>${group.items.map(item=>item.href?`<a href="${esc(item.href)}">${esc(item.title)}</a>`:`<a href="#${esc(item.id)}" data-wa-menu-project="${esc(item.id)}">${esc(item.title)}</a>`).join('')}</div></div>`).join('');

let globalProjectIndex=0;
stream.innerHTML=data.map((group,companyIndex)=>{
 const projects=group.projects.map((project,projectIndex)=>{
  globalProjectIndex+=1;
  const pages=Array.isArray(project.pages)?project.pages:[];
  const slides=pages.map((page,pageIndex)=>`<figure class="wa-gallery__slide${pageIndex===0?' is-active':''}" aria-hidden="${pageIndex===0?'false':'true'}"><div class="wa-gallery__visual" role="img" aria-label="${esc(project.title)} 원본 포트폴리오 P.${page}" style="${frameStyle(group.company,page)}"></div></figure>`).join('');
  const controls=pages.length>1?`<button class="wa-gallery__nav wa-gallery__nav--prev" type="button" data-wa-prev aria-label="이전 이미지"></button><button class="wa-gallery__nav wa-gallery__nav--next" type="button" data-wa-next aria-label="다음 이미지"></button>`:'';
  return `<article class="wa-project" id="${esc(project.id)}" data-wa-project data-company="${companyIndex}" data-project="${projectIndex}"><div class="wa-project__layout"><header class="wa-project__copy hm-reveal"><span class="hm-subno wa-project__index">${pad(companyIndex+1)}.${projectIndex+1}</span><p class="wa-project__company">${esc(group.company)} · ${esc(group.period)}</p><h3 class="hm-subtitle wa-project__title">${esc(project.title)}</h3><span class="wa-project__source">ORIGINAL PORTFOLIO · P.${esc(rangeLabel(pages))}</span></header><div class="wa-project__rail hm-reveal"><div class="wa-gallery" data-wa-gallery tabindex="0" aria-label="${esc(project.title)} 원본 포트폴리오 갤러리"><div class="wa-gallery__viewport">${slides}</div>${controls}<span class="wa-gallery__status" data-wa-status>01 / ${pad(pages.length)}</span></div><div class="wa-gallery-caption"><h4>${esc(project.title)}</h4><p>${esc(project.desc)}</p>${project.note?`<em>${esc(project.note)}</em>`:''}<span data-wa-page-label>ORIGINAL PORTFOLIO · P.${pages[0]||''} · 01 / ${pad(pages.length)}</span></div></div></div></article>`;
 }).join('');
 return `<section class="hm-section hm-ds-section wa-company" id="wa-company-${companyIndex+1}" data-wa-company="${companyIndex}"><div class="hm-wrap hm-ds-wrap"><div class="hm-section-head hm-ds-section__head wa-company__head"><span class="hm-section-no hm-ds-section__number">${pad(companyIndex+1)}</span><h2 class="hm-section-title hm-ds-section__title">${esc(group.company)}</h2><p class="hm-section-desc hm-ds-section__description">${esc(group.period)}</p></div><div class="wa-project-list">${projects}</div></div></section>`;
}).join('');

if(progress)progress.innerHTML=data.map((_,i)=>`<a href="#wa-company-${i+1}"${i===0?' class="is-active"':''}>${pad(i+1)}</a>`).join('');

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
  },720);
 };
 prev?.addEventListener('click',()=>go(-1));
 next?.addEventListener('click',()=>go(1));
 gallery.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();go(-1)}else if(e.key==='ArrowRight'){e.preventDefault();go(1)}});
 render();
});

const setMenuOpen=open=>{if(!trigger)return;trigger.setAttribute('aria-expanded',open?'true':'false');trigger.setAttribute('aria-label',open?'프로젝트 목록 닫기':'프로젝트 목록 열기');menu.classList.toggle('is-open',open);menu.setAttribute('aria-hidden',open?'false':'true')};
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
 const pio=new IntersectionObserver(entries=>{entries.forEach(entry=>ratios.set(entry.target,entry.intersectionRatio));let best=null,bestRatio=0;projectEls.forEach(project=>{const ratio=ratios.get(project)||0;if(ratio>bestRatio){best=project;bestRatio=ratio}});if(best)setActiveProject(best.id)},{threshold:[0,.12,.25,.5,.75],rootMargin:'-18% 0px -52% 0px'});
 projectEls.forEach(project=>pio.observe(project));
}

const sections=[...document.querySelectorAll('[data-wa-company]')];
const progressLinks=[...(progress?.querySelectorAll('a')||[])];
if('IntersectionObserver' in window&&sections.length){
 const ratios=new Map();
 const cio=new IntersectionObserver(entries=>{entries.forEach(entry=>ratios.set(entry.target,entry.intersectionRatio));let best=sections[0],bestRatio=-1;sections.forEach(section=>{const ratio=ratios.get(section)||0;if(ratio>bestRatio){best=section;bestRatio=ratio}});const activeIndex=sections.indexOf(best);progressLinks.forEach((link,i)=>link.classList.toggle('is-active',i===activeIndex))},{threshold:[0,.1,.25,.5,.75],rootMargin:'-18% 0px -48% 0px'});
 sections.forEach(section=>cio.observe(section));
}

const initial=location.hash.slice(1);if(initial){const target=document.getElementById(initial);if(target)setTimeout(()=>scrollTo({top:target.getBoundingClientRect().top+scrollY-96,behavior:'auto'}),60)}
window.__hmAnimationScan?.();
})();
