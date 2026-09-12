(()=>{'use strict';
const data=window.WORK_ARCHIVE_DATA||[];
const menuData=window.WORK_ARCHIVE_MENU||[];
const stream=document.querySelector('[data-wa-stream]');
const progress=document.querySelector('[data-wa-progress]');
const menu=document.querySelector('[data-wa-menu]');
const trigger=document.querySelector('[data-wa-menu-trigger]');
const menuShell=document.querySelector('[data-wa-menu-shell]');
if(!stream||!menu)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const rangeLabel=pages=>!pages?.length?'':pages.length===1?String(pages[0]):`${pages[0]}-${pages[pages.length-1]}`;
const imageSrc=p=>`./assets/image/work-archive/page-${String(p.imagePage).padStart(3,'0')}.jpg`;

menu.innerHTML=menuData.map(group=>`<div class="wa-menu-group"><strong>${esc(group.company)}</strong><div>${group.items.map(item=>item.href?`<a href="${esc(item.href)}">${esc(item.title)}</a>`:`<a href="#${esc(item.id)}" data-wa-menu-project="${esc(item.id)}">${esc(item.title)}</a>`).join('')}</div></div>`).join('');

stream.innerHTML=data.map((group,companyIndex)=>{
 const slides=group.projects.map((project,index)=>`<figure class="wa-gallery__slide${index===0?' is-active':''}" data-wa-project-id="${esc(project.id)}" aria-hidden="${index===0?'false':'true'}"><img src="${imageSrc(project)}" alt="${esc(project.title)} 원본 포트폴리오 이미지" loading="${companyIndex===0&&index===0?'eager':'lazy'}" decoding="async"></figure>`).join('');
 const project=group.projects[0];
 const controls=group.projects.length>1?`<button class="wa-gallery__nav wa-gallery__nav--prev" type="button" data-wa-prev aria-label="이전 프로젝트"></button><button class="wa-gallery__nav wa-gallery__nav--next" type="button" data-wa-next aria-label="다음 프로젝트"></button>`:'';
 return `<section class="hm-section hm-ds-section wa-company" id="wa-company-${companyIndex+1}" data-wa-company="${companyIndex}"><div class="hm-wrap hm-ds-wrap wa-company__layout"><header class="hm-section-head hm-ds-section__head wa-company__copy" data-wa-copy><span class="hm-section-no hm-ds-section__number">${pad(companyIndex+1)}</span><p class="wa-company__eyebrow">${esc(group.company)} · ${esc(group.period)}</p><h2 class="hm-section-title hm-ds-section__title" data-wa-title>${esc(project.title)}</h2><p class="hm-section-desc hm-ds-section__description" data-wa-desc>${esc(project.desc)}</p><p class="wa-project__note" data-wa-note>${project.note?esc(project.note):''}</p><span class="wa-project__source" data-wa-source>ORIGINAL PORTFOLIO · P.${esc(rangeLabel(project.pages))}</span></header><div class="hm-wide-right-rail wa-company__rail"><div class="wa-gallery" data-wa-gallery tabindex="0" aria-label="${esc(group.company)} 프로젝트 갤러리"><div class="wa-gallery__viewport">${slides}</div>${controls}<span class="wa-gallery__status" data-wa-status>01 / ${pad(group.projects.length)}</span></div></div></div></section>`;
}).join('');

if(progress)progress.innerHTML=data.map((_,i)=>`<a href="#wa-company-${i+1}"${i===0?' class="is-active"':''}>${pad(i+1)}</a>`).join('');

const sections=[...document.querySelectorAll('[data-wa-company]')];
const projectMap=new Map();
const stateBySection=new Map();
sections.forEach(section=>{
 const companyIndex=Number(section.dataset.waCompany)||0;
 const group=data[companyIndex];
 const copy=section.querySelector('[data-wa-copy]');
 const gallery=section.querySelector('[data-wa-gallery]');
 const slides=[...gallery.querySelectorAll('.wa-gallery__slide')];
 const title=copy.querySelector('[data-wa-title]');
 const desc=copy.querySelector('[data-wa-desc]');
 const note=copy.querySelector('[data-wa-note]');
 const source=copy.querySelector('[data-wa-source]');
 const status=gallery.querySelector('[data-wa-status]');
 const prev=gallery.querySelector('[data-wa-prev]');
 const next=gallery.querySelector('[data-wa-next]');
 const state={section,group,copy,gallery,slides,title,desc,note,source,status,index:0,busy:false};
 stateBySection.set(section,state);
 group.projects.forEach((project,index)=>projectMap.set(project.id,{state,index}));
 const renderCopy=()=>{
  const project=group.projects[state.index];
  title.textContent=project.title;
  desc.textContent=project.desc;
  note.textContent=project.note||'';
  note.hidden=!project.note;
  source.textContent=`ORIGINAL PORTFOLIO · P.${rangeLabel(project.pages)}`;
  status.textContent=`${pad(state.index+1)} / ${pad(group.projects.length)}`;
  document.querySelectorAll('[data-wa-menu-project]').forEach(link=>link.classList.toggle('is-active',link.dataset.waMenuProject===project.id));
 };
 const go=(to,direction=1,updateHash=true)=>{
  if(state.busy||to===state.index||to<0||to>=slides.length)return;
  state.busy=true;
  const current=slides[state.index],incoming=slides[to];
  gallery.classList.toggle('is-reverse',direction<0);
  incoming.classList.add('is-next');
  incoming.setAttribute('aria-hidden','false');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{incoming.classList.add('is-entering');current.classList.add('is-exiting')}));
  window.setTimeout(()=>{
   current.classList.remove('is-active','is-exiting');current.setAttribute('aria-hidden','true');
   incoming.classList.remove('is-next','is-entering');incoming.classList.add('is-active');
   state.index=to;renderCopy();gallery.classList.remove('is-reverse');state.busy=false;
   if(updateHash)history.replaceState(null,'',`#${group.projects[to].id}`);
  },730);
 };
 state.go=go;
 prev?.addEventListener('click',()=>go((state.index-1+slides.length)%slides.length,-1));
 next?.addEventListener('click',()=>go((state.index+1)%slides.length,1));
 gallery.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();go((state.index-1+slides.length)%slides.length,-1)}else if(e.key==='ArrowRight'){e.preventDefault();go((state.index+1)%slides.length,1)}});
 renderCopy();
});

const setMenuOpen=open=>{if(!trigger)return;trigger.setAttribute('aria-expanded',open?'true':'false');trigger.setAttribute('aria-label',open?'프로젝트 목록 닫기':'프로젝트 목록 열기');menu.classList.toggle('is-open',open);menu.setAttribute('aria-hidden',open?'false':'true')};
trigger?.addEventListener('click',()=>setMenuOpen(trigger.getAttribute('aria-expanded')!=='true'));
document.addEventListener('pointerdown',e=>{if(menuShell&&!menuShell.contains(e.target))setMenuOpen(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenuOpen(false)});

document.querySelectorAll('[data-wa-menu-project]').forEach(link=>link.addEventListener('click',e=>{
 e.preventDefault();const target=projectMap.get(link.dataset.waMenuProject);if(!target)return;
 const {state,index}=target;if(index!==state.index)state.go(index,index>state.index?1:-1,false);
 setMenuOpen(false);history.replaceState(null,'',`#${link.dataset.waMenuProject}`);
 const top=state.section.getBoundingClientRect().top+scrollY-72;scrollTo({top,behavior:'smooth'});
}));

const progressLinks=[...(progress?.querySelectorAll('a')||[])];
if('IntersectionObserver' in window&&sections.length){
 const ratios=new Map();const io=new IntersectionObserver(entries=>{entries.forEach(entry=>ratios.set(entry.target,entry.intersectionRatio));let best=sections[0],bestRatio=-1;sections.forEach(section=>{const ratio=ratios.get(section)||0;if(ratio>bestRatio){best=section;bestRatio=ratio}});const activeIndex=sections.indexOf(best);progressLinks.forEach((link,i)=>link.classList.toggle('is-active',i===activeIndex))},{threshold:[0,.1,.25,.5,.75],rootMargin:'-18% 0px -48% 0px'});sections.forEach(section=>io.observe(section));
}

const initial=location.hash.slice(1);if(initial&&projectMap.has(initial)){const {state,index}=projectMap.get(initial);if(index!==state.index)state.go(index,index>state.index?1:-1,false);setTimeout(()=>scrollTo({top:state.section.getBoundingClientRect().top+scrollY-72,behavior:'auto'}),40)}
window.__hmAnimationScan?.();
})();
