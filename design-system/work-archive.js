(()=>{
  'use strict';

  const data=window.WORK_ARCHIVE_DATA||[];
  const menuData=window.WORK_ARCHIVE_MENU||[];
  const stream=document.querySelector('[data-wa-stream]');
  const menu=document.querySelector('[data-wa-menu]');
  const trigger=document.querySelector('[data-wa-menu-trigger]');
  const menuShell=document.querySelector('[data-wa-menu-shell]');
  if(!stream||!menu)return;

  const TRANSITION_MS=720;
  const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad=n=>String(n).padStart(2,'0');
  const pad3=n=>String(n).padStart(3,'0');

  const sourcePrefix=page=>{
    if(page<=33)return'aimmo';
    if(page<=45)return'trenbe';
    if(page<=68)return'yanolja';
    if(page<=98)return'nbt';
    return'coupang';
  };
  const sourcePath=page=>`./assets/image/work-archive/archive-${sourcePrefix(page)}-p${pad3(page)}.webp`;

  /* Long portfolio descriptions are distributed across manual gallery pages instead of
     stacking the entire paragraph over every image. Short copy remains on the first page. */
  const splitLongUnit=(unit,target)=>{
    const words=unit.split(/\s+/).filter(Boolean);
    if(unit.length<=target||words.length<2)return[unit];
    const result=[];
    let current='';
    words.forEach(word=>{
      const next=current?`${current} ${word}`:word;
      if(current&&next.length>target){result.push(current);current=word;}
      else current=next;
    });
    if(current)result.push(current);
    return result;
  };

  const captionChunks=(text,slideCount)=>{
    const count=Math.max(1,slideCount||1);
    const clean=String(text||'').replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();
    if(!clean)return Array(count).fill('');

    const desired=Math.min(count,Math.max(1,Math.ceil(clean.length/190)));
    if(desired===1)return[clean,...Array(Math.max(0,count-1)).fill('')];

    const target=Math.max(120,Math.ceil(clean.length/desired));
    let units=clean.split(/\n+|(?<=[.!?。])\s+/).map(v=>v.trim()).filter(Boolean);
    units=units.flatMap(unit=>splitLongUnit(unit,target));

    const chunks=[];
    let current='';
    units.forEach(unit=>{
      const next=current?`${current} ${unit}`:unit;
      if(current&&next.length>target&&chunks.length<desired-1){chunks.push(current);current=unit;}
      else current=next;
    });
    if(current)chunks.push(current);

    while(chunks.length>desired){
      const tail=chunks.pop();
      chunks[chunks.length-1]=`${chunks[chunks.length-1]} ${tail}`.trim();
    }
    return Array.from({length:count},(_,i)=>chunks[i]||'');
  };

  /* Published case pages remain in the switcher; only unpublished projects render here. */
  menu.innerHTML=menuData.map(group=>`<div class="wa-menu-group"><strong>${esc(group.company)}</strong><div>${group.items.map(item=>{
    if(item.href){
      const href=item.href==='./himart-automation.html'?'./himart-ax.html':item.href;
      return `<a href="${esc(href)}">${esc(item.title)}</a>`;
    }
    return `<a href="#${esc(item.id)}" data-wa-menu-project="${esc(item.id)}">${esc(item.title)}</a>`;
  }).join('')}</div></div>`).join('');

  let globalIndex=0;
  let firstRenderedImage=true;
  const projects=[];

  data.forEach((group,companyIndex)=>{
    group.projects.forEach((project,projectIndex)=>{
      globalIndex+=1;
      const displayIndex=pad(globalIndex);
      const pages=Array.isArray(project.pages)?project.pages:[];
      const chunks=captionChunks(project.desc,pages.length||1);
      const lastCaptionIndex=Math.max(0,chunks.reduce((last,chunk,i)=>chunk?i:last,0));
      const slides=pages.map((page,pageIndex)=>{
        const loading=firstRenderedImage?'eager':'lazy';
        firstRenderedImage=false;
        return `<article class="reuse-production-gallery__slide${pageIndex===0?' is-active':''}" aria-hidden="${pageIndex===0?'false':'true'}"><div class="reuse-production-gallery__media"><img src="${sourcePath(page)}" alt="${esc(project.title)} 원본 포트폴리오 P.${page}" loading="${loading}" decoding="async" draggable="false" data-wa-source-page="${page}"></div></article>`;
      }).join('');
      const single=pages.length<=1;

      projects.push(`<article class="wa-project" id="${esc(project.id)}" data-wa-project data-company="${companyIndex}" data-project="${projectIndex}" data-wa-captions="${esc(JSON.stringify(chunks))}" data-wa-note-index="${lastCaptionIndex}">
        <header class="wa-project__head hm-reveal">
          <span class="wa-project__index">${displayIndex} · ${esc(group.company)}</span>
          <h3 class="wa-project__title">${esc(project.title)}</h3>
          <span class="wa-project__period">${esc(group.period)}</span>
        </header>
        <div class="reuse-production-gallery hm-reveal" tabindex="0" aria-label="${esc(project.title)} 원본 포트폴리오 갤러리" data-wa-gallery data-single-slide="${single?'true':'false'}">
          <div class="reuse-production-gallery__viewport">${slides}</div>
          <div class="reuse-production-gallery__copy" data-wa-gallery-copy>
            <p data-wa-caption></p>
            ${project.note?`<em class="wa-gallery-note" data-wa-note>${esc(project.note)}</em>`:''}
          </div>
          <button class="reuse-production-gallery__nav reuse-production-gallery__nav--prev" type="button" data-reuse-gallery-prev aria-label="이전 이미지"></button>
          <button class="reuse-production-gallery__nav reuse-production-gallery__nav--next" type="button" data-reuse-gallery-next aria-label="다음 이미지"></button>
          <span class="reuse-production-gallery__status" data-reuse-gallery-status aria-live="polite">01 / ${pad(pages.length)}</span>
        </div>
      </article>`);
    });
  });

  stream.innerHTML=`<div class="hm-wrap hm-ds-wrap"><div class="wa-project-list">${projects.join('')}</div></div>`;

  const setGalleryHeight=(gallery,img)=>{
    if(!gallery||!img)return;
    const commit=()=>{
      if(!img.naturalWidth||!gallery.clientWidth)return;
      gallery.style.height=`${gallery.clientWidth*(img.naturalHeight/img.naturalWidth)}px`;
      gallery.classList.add('is-ratio-ready');
    };
    if(img.complete&&img.naturalWidth)commit();
    else img.addEventListener('load',commit,{once:true});
  };

  const galleries=[...document.querySelectorAll('[data-wa-gallery]')];
  const controllers=[];

  galleries.forEach(gallery=>{
    const projectEl=gallery.closest('[data-wa-project]');
    if(!projectEl)return;
    const slides=[...gallery.querySelectorAll('.reuse-production-gallery__slide')];
    if(!slides.length)return;

    let captions=[];
    try{captions=JSON.parse(projectEl.dataset.waCaptions||'[]');}catch(_){captions=[];}
    const noteIndex=Number(projectEl.dataset.waNoteIndex||0);
    const caption=gallery.querySelector('[data-wa-caption]');
    const note=gallery.querySelector('[data-wa-note]');
    const prev=gallery.querySelector('[data-reuse-gallery-prev]');
    const next=gallery.querySelector('[data-reuse-gallery-next]');
    const status=gallery.querySelector('[data-reuse-gallery-status]');

    let index=Math.max(0,slides.findIndex(slide=>slide.classList.contains('is-active')));
    let busy=false;
    let pointerStart=null;

    const activeImage=()=>slides[index]?.querySelector('img')||null;
    const updateCopy=()=>{
      const text=captions[index]||'';
      if(caption){caption.textContent=text;caption.hidden=!text;}
      if(note)note.hidden=index!==noteIndex;
      if(status)status.textContent=`${pad(index+1)} / ${pad(slides.length)}`;
    };
    const settle=()=>{
      slides.forEach((slide,i)=>{
        const active=i===index;
        slide.classList.toggle('is-active',active);
        slide.classList.remove('is-next','is-entering','is-exiting');
        slide.setAttribute('aria-hidden',active?'false':'true');
      });
      gallery.classList.remove('is-reverse');
      setGalleryHeight(gallery,activeImage());
      updateCopy();
    };

    const transitionTo=(targetIndex,direction=1)=>{
      if(busy||slides.length<2||targetIndex===index)return;
      busy=true;
      const current=slides[index];
      const incoming=slides[targetIndex];
      const incomingImage=incoming.querySelector('img');
      gallery.classList.toggle('is-reverse',direction<0);

      slides.forEach((slide,i)=>{
        if(i!==index&&i!==targetIndex){
          slide.classList.remove('is-active','is-next','is-entering','is-exiting');
          slide.setAttribute('aria-hidden','true');
        }
      });

      current.classList.add('is-active');
      current.classList.remove('is-next','is-entering');
      incoming.classList.remove('is-active','is-exiting','is-entering');
      incoming.classList.add('is-next');
      incoming.setAttribute('aria-hidden','false');
      setGalleryHeight(gallery,incomingImage);

      const complete=()=>{
        index=targetIndex;
        busy=false;
        settle();
      };
      if(reducedMotion){complete();return;}

      void incoming.offsetWidth;
      current.classList.add('is-exiting');
      incoming.classList.add('is-entering');
      window.setTimeout(complete,TRANSITION_MS+30);
    };

    const move=delta=>{
      if(busy||slides.length<2)return;
      const target=(index+delta+slides.length)%slides.length;
      transitionTo(target,delta<0?-1:1);
    };

    prev?.addEventListener('click',event=>{event.stopPropagation();move(-1);});
    next?.addEventListener('click',event=>{event.stopPropagation();move(1);});
    gallery.addEventListener('keydown',event=>{
      if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}
      else if(event.key==='ArrowRight'){event.preventDefault();move(1);}
    });
    gallery.addEventListener('pointerdown',event=>{
      if(event.target.closest('button'))return;
      pointerStart={x:event.clientX,y:event.clientY,id:event.pointerId};
    });
    gallery.addEventListener('pointerup',event=>{
      if(!pointerStart||pointerStart.id!==event.pointerId)return;
      const dx=event.clientX-pointerStart.x;
      const dy=event.clientY-pointerStart.y;
      pointerStart=null;
      if(Math.abs(dx)>=45&&Math.abs(dx)>Math.abs(dy)*1.15)move(dx<0?1:-1);
    });
    gallery.addEventListener('pointercancel',()=>{pointerStart=null;});

    settle();
    controllers.push(()=>setGalleryHeight(gallery,activeImage()));
  });

  /* No interval, timeout schedule or IntersectionObserver advances gallery pages.
     Every page change is user initiated by arrows, keyboard or horizontal flick. */
  let resizeFrame=0;
  window.addEventListener('resize',()=>{
    if(resizeFrame)cancelAnimationFrame(resizeFrame);
    resizeFrame=requestAnimationFrame(()=>{controllers.forEach(sync=>sync());resizeFrame=0;});
  },{passive:true});

  const setMenuOpen=open=>{
    if(!trigger)return;
    trigger.setAttribute('aria-expanded',open?'true':'false');
    trigger.setAttribute('aria-label',open?'프로젝트 목록 닫기':'프로젝트 목록 열기');
    menu.classList.toggle('is-open',open);
    menu.setAttribute('aria-hidden',open?'false':'true');
  };
  trigger?.addEventListener('click',()=>setMenuOpen(trigger.getAttribute('aria-expanded')!=='true'));
  document.addEventListener('pointerdown',event=>{if(menuShell&&!menuShell.contains(event.target))setMenuOpen(false);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')setMenuOpen(false);});

  const projectEls=[...document.querySelectorAll('[data-wa-project]')];
  const menuLinks=[...document.querySelectorAll('[data-wa-menu-project]')];
  menuLinks.forEach(link=>link.addEventListener('click',event=>{
    const target=document.getElementById(link.dataset.waMenuProject);
    if(!target)return;
    event.preventDefault();
    setMenuOpen(false);
    history.replaceState(null,'',`#${target.id}`);
    scrollTo({top:target.getBoundingClientRect().top+scrollY-96,behavior:'smooth'});
  }));

  const setActiveProject=id=>menuLinks.forEach(link=>link.classList.toggle('is-active',link.dataset.waMenuProject===id));
  if('IntersectionObserver' in window&&projectEls.length){
    const ratios=new Map();
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>ratios.set(entry.target,entry.intersectionRatio));
      let best=null,bestRatio=0;
      projectEls.forEach(project=>{
        const ratio=ratios.get(project)||0;
        if(ratio>bestRatio){best=project;bestRatio=ratio;}
      });
      if(best)setActiveProject(best.id);
    },{threshold:[0,.12,.25,.5,.75],rootMargin:'-18% 0px -52% 0px'});
    projectEls.forEach(project=>observer.observe(project));
  }

  const initial=location.hash.slice(1);
  if(initial){
    const target=document.getElementById(initial);
    if(target)setTimeout(()=>scrollTo({top:target.getBoundingClientRect().top+scrollY-96,behavior:'auto'}),60);
  }

  window.__hmAnimationScan?.();
})();
