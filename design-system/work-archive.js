(()=>{
  'use strict';

  const rawData=window.WORK_ARCHIVE_DATA||[];
  const rawMenuData=window.WORK_ARCHIVE_MENU||[];
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
  const firstPage=project=>Math.min(...((project?.pages||[]).map(Number).filter(Number.isFinite).length?(project.pages||[]).map(Number).filter(Number.isFinite):[9999]));

  /* The source portfolio itself is newest -> oldest. Lock the archive to that authored
     page order so data edits cannot accidentally scramble chronology. */
  const data=[...rawData]
    .map(group=>({...group,projects:[...(group.projects||[])].sort((a,b)=>firstPage(a)-firstPage(b))}))
    .sort((a,b)=>Math.min(...a.projects.map(firstPage))-Math.min(...b.projects.map(firstPage)));

  /* The only menu-order mismatch in the authored registry was TRENBE: CORE VALUE appears
     before the usability-test case in the source portfolio. */
  const menuData=rawMenuData.map(group=>{
    const items=[...(group.items||[])];
    if(group.company==='TRENBE')items.sort((a,b)=>{
      const rank=item=>item.id==='trenbe-core-value'?0:(item.href==='./trenbe-ut.html'?1:2);
      return rank(a)-rank(b);
    });
    return {...group,items};
  });

  const sourcePrefix=page=>{
    if(page<=33)return'aimmo';
    if(page<=45)return'trenbe';
    if(page<=68)return'yanolja';
    if(page<=98)return'nbt';
    return'coupang';
  };
  const sourcePath=page=>`./assets/image/work-archive/archive-${sourcePrefix(page)}-p${pad3(page)}.webp`;

  const AIMMO_INTERNAL_COPY='신규로 제작된 그래픽 모티브를 바탕으로 내부 구성원들에게 브랜드 이미지를 각인시키고 소속감을 높일 수 있는 인터널 브랜딩 요소를 제작. 웰컴킷, 공용 문서 포멧, 행사용 배너 및 브로셔/굿즈 등 작은 것 부터 시작하여 브랜드 이미지가 달라졌다는 것을 알리면서 좋은 반응을 얻었고 이후 홈페이지와 CES 부스 디자인까지 많은 부분에 까지 적용하면서 다소 경직된 AI B2B 회사의 분위기를 바꿔갈 수 있도록 진행';
  const AIMMO_SITE_COPY='기존 사이트가 서비스와 제품의 특성을 제대로 반영하지 못하고 단순한 정보나열에 그쳐 고객사들로 부터 신뢰를 얻기 힘든 상황. 협업 부서 및 영업팀과의 미팅/인터뷰를 통해 제품의 특성과 주요 비지니스 포인트를 파악하여 카테고리화 후 정보의 우선 순위에 따라 화면을 재배치하여 리디자인 진행. 이후 CES 2023, 유럽 전시회 등에서 좋은 반응을 이끌어 냄';
  const TRENBE_CORE_COPY={
    36:'',
    37:'1.Core value of Design chapter · Clarity · Identity · Guidance',
    38:'2.How we work · : be bold · : be simple · : be clear'
  };

  /* Preserve the source-page body copy page by page. Repeated source copy intentionally
     repeats on every slide; only pages whose authored copy actually changes receive a
     different string. */
  const pageCaption=(project,page)=>{
    if(project.id==='aimmo-internal-branding')return page<=30?AIMMO_INTERNAL_COPY:AIMMO_SITE_COPY;
    if(project.id==='trenbe-core-value')return TRENBE_CORE_COPY[page]||'';
    return String(project.desc||'').replace(/\r/g,'').replace(/\n{2,}/g,' ').trim();
  };
  const pageNote=(project,pageIndex)=>project.note&&pageIndex===0?String(project.note):'';

  const VISITED_KEY='workArchiveVisited.v2';
  const readVisited=()=>{
    try{return new Set(JSON.parse(localStorage.getItem(VISITED_KEY)||'[]'));}catch(_){return new Set();}
  };
  const visited=readVisited();
  const persistVisited=()=>{try{localStorage.setItem(VISITED_KEY,JSON.stringify([...visited]));}catch(_){}};
  const markVisited=link=>{
    const key=link?.dataset?.waVisitKey;
    if(!key)return;
    visited.add(key);
    link.classList.add('is-visited');
    persistVisited();
  };

  menu.innerHTML=menuData.map(group=>`<div class="wa-menu-group"><strong>${esc(group.company)}</strong><div>${group.items.map(item=>{
    if(item.href){
      const href=item.href==='./himart-automation.html'?'./himart-ax.html':item.href;
      return `<a href="${esc(href)}" data-wa-visit-key="${esc(href)}">${esc(item.title)}</a>`;
    }
    return `<a href="#${esc(item.id)}" data-wa-menu-project="${esc(item.id)}" data-wa-visit-key="${esc(item.id)}">${esc(item.title)}</a>`;
  }).join('')}</div></div>`).join('');

  [...menu.querySelectorAll('a[data-wa-visit-key]')].forEach(link=>{
    if(visited.has(link.dataset.waVisitKey))link.classList.add('is-visited');
    link.addEventListener('click',()=>markVisited(link));
  });

  let globalIndex=0;
  let firstRenderedImage=true;
  const projects=[];

  data.forEach((group,companyIndex)=>{
    group.projects.forEach((project,projectIndex)=>{
      globalIndex+=1;
      const displayIndex=pad(globalIndex);
      const pages=Array.isArray(project.pages)?[...project.pages].sort((a,b)=>a-b):[];
      const captions=pages.map(page=>pageCaption(project,page));
      const notes=pages.map((_,pageIndex)=>pageNote(project,pageIndex));
      const slides=pages.map((page,pageIndex)=>{
        const loading=firstRenderedImage?'eager':'lazy';
        firstRenderedImage=false;
        return `<article class="reuse-production-gallery__slide${pageIndex===0?' is-active':''}" aria-hidden="${pageIndex===0?'false':'true'}"><div class="reuse-production-gallery__media"><img src="${sourcePath(page)}" alt="${esc(project.title)} 원본 포트폴리오 P.${page}" loading="${loading}" decoding="async" draggable="false" data-wa-source-page="${page}"></div></article>`;
      }).join('');
      const single=pages.length<=1;
      const coreValue=project.id==='trenbe-core-value';

      projects.push(`<article class="wa-project${coreValue?' wa-project--core-value':''}" id="${esc(project.id)}" data-wa-project data-company="${companyIndex}" data-project="${projectIndex}" data-wa-captions="${esc(JSON.stringify(captions))}" data-wa-notes="${esc(JSON.stringify(notes))}">
        <div class="reuse-production-gallery hm-reveal${coreValue?' is-core-value':''}" tabindex="0" aria-label="${esc(project.title)} 원본 포트폴리오 갤러리" data-wa-gallery data-single-slide="${single?'true':'false'}">
          <div class="reuse-production-gallery__viewport">${slides}</div>
          <div class="wa-gallery-overlay" data-wa-gallery-copy>
            <div class="wa-gallery-overlay__title">
              <div class="wa-project__meta"><span class="wa-project__index">${displayIndex} · ${esc(group.company)}</span><span class="wa-project__period">${esc(group.period)}</span></div>
              <h3 class="wa-project__title">${esc(project.title)}</h3>
            </div>
            <div class="wa-gallery-overlay__body"><p data-wa-caption></p><em class="wa-gallery-note" data-wa-note></em></div>
          </div>
          <button class="reuse-production-gallery__nav reuse-production-gallery__nav--prev" type="button" data-reuse-gallery-prev aria-label="이전 이미지"></button>
          <button class="reuse-production-gallery__nav reuse-production-gallery__nav--next" type="button" data-reuse-gallery-next aria-label="다음 이미지"></button>
          <span class="reuse-production-gallery__status" data-reuse-gallery-status aria-live="polite">01 / ${pad(pages.length)}</span>
        </div>
      </article>`);
    });
  });

  stream.innerHTML=`<div class="hm-wrap hm-ds-wrap"><div class="wa-project-list">${projects.join('')}</div></div>`;
  const archiveWrap=stream.querySelector('.hm-wrap');
  if(archiveWrap&&menuShell)archiveWrap.prepend(menuShell);

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
    let notes=[];
    try{captions=JSON.parse(projectEl.dataset.waCaptions||'[]');}catch(_){captions=[];}
    try{notes=JSON.parse(projectEl.dataset.waNotes||'[]');}catch(_){notes=[];}
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
      const noteText=notes[index]||'';
      if(caption){caption.textContent=text;caption.hidden=!text;}
      if(note){note.textContent=noteText;note.hidden=!noteText;}
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

  /* Manual-only gallery. No timer, autoplay, interval or observer advances slides. */
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
    scrollTo({top:target.getBoundingClientRect().top+scrollY-24,behavior:reducedMotion?'auto':'smooth'});
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
    },{threshold:[0,.12,.25,.5,.75],rootMargin:'-12% 0px -56% 0px'});
    projectEls.forEach(project=>observer.observe(project));
  }

  const initial=location.hash.slice(1);
  if(initial){
    const target=document.getElementById(initial);
    if(target)setTimeout(()=>scrollTo({top:target.getBoundingClientRect().top+scrollY-24,behavior:'auto'}),60);
  }

  window.__hmAnimationScan?.();
})();
