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

  /* The source portfolio is authored newest -> oldest. Company and project order are
     locked to source-page order so the archive cannot drift when data is edited. */
  const data=[...rawData]
    .map(group=>({...group,projects:[...(group.projects||[])].sort((a,b)=>firstPage(a)-firstPage(b))}))
    .sort((a,b)=>Math.min(...a.projects.map(firstPage))-Math.min(...b.projects.map(firstPage)));

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
  /* Replaced images use versioned filenames so browser/CDN caches can never serve
     the former raster at the same URL after an editorial image replacement. */
  const sourceOverride={
    29:'./assets/image/work-archive/archive-aimmo-p029-v5.webp',
    33:'./assets/image/work-archive/archive-aimmo-p033-v6.webp',
    36:'./assets/image/work-archive/archive-trenbe-p036-v6.webp',
    37:'./assets/image/work-archive/archive-trenbe-p037-v5.webp',
    38:'./assets/image/work-archive/archive-trenbe-p038-v5.webp'
  };
  const sourcePath=page=>sourceOverride[page]||`./assets/image/work-archive/archive-${sourcePrefix(page)}-p${pad3(page)}.webp`;

  const AIMMO_INTERNAL_COPY='신규로 제작된 그래픽 모티브를 바탕으로 내부 구성원들에게 브랜드 이미지를 각인시키고 소속감을 높일 수 있는 인터널 브랜딩 요소를 제작. 웰컴킷, 공용 문서 포멧, 행사용 배너 및 브로셔/굿즈 등 작은 것 부터 시작하여 브랜드 이미지가 달라졌다는 것을 알리면서 좋은 반응을 얻었고 이후 홈페이지와 CES 부스 디자인까지 많은 부분에 까지 적용하면서 다소 경직된 AI B2B 회사의 분위기를 바꿔갈 수 있도록 진행';
  const AIMMO_SITE_COPY='기존 사이트가 서비스와 제품의 특성을 제대로 반영하지 못하고 단순한 정보나열에 그쳐 고객사들로 부터 신뢰를 얻기 힘든 상황. 협업 부서 및 영업팀과의 미팅/인터뷰를 통해 제품의 특성과 주요 비지니스 포인트를 파악하여 카테고리화 후 정보의 우선 순위에 따라 화면을 재배치하여 리디자인 진행. 이후 CES 2023, 유럽 전시회 등에서 좋은 반응을 이끌어 냄';

  /* Source-page copy contract:
     - identical source copy repeats on every corresponding slide;
     - AIMMO changes copy at the actual source-page boundary;
     - CORE VALUE pages carry their authored typography inside the rendered visual, so
       no duplicate overlay body copy is added on those slides. */
  const pageCaption=(project,page)=>{
    if(project.id==='aimmo-internal-branding')return page<=30?AIMMO_INTERNAL_COPY:AIMMO_SITE_COPY;
    if(project.id==='trenbe-core-value')return'';
    return String(project.desc||'').replace(/\r/g,'').replace(/\n{2,}/g,' ').trim();
  };
  const pageNote=(project,pageIndex)=>project.note&&pageIndex===0?String(project.note):'';

  const VISITED_KEY='workArchiveVisited.v2';
  const readVisited=()=>{try{return new Set(JSON.parse(localStorage.getItem(VISITED_KEY)||'[]'));}catch(_){return new Set();}};
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
  const companies=[];

  data.forEach((group,companyIndex)=>{
    const slides=[];
    group.projects.forEach((project,projectIndex)=>{
      globalIndex+=1;
      const displayIndex=pad(globalIndex);
      const pages=Array.isArray(project.pages)?[...project.pages].sort((a,b)=>a-b):[];
      pages.forEach((page,pageIndex)=>{
        slides.push({
          page,
          company:group.company,
          period:group.period,
          projectId:project.id,
          projectTitle:project.title,
          projectIndex,
          displayIndex,
          caption:pageCaption(project,page),
          note:pageNote(project,pageIndex),
          coreValue:project.id==='trenbe-core-value'
        });
      });
    });
    if(slides.length)companies.push({companyIndex,company:group.company,period:group.period,slides});
  });

  const companyHtml=companies.map((company,companyListIndex)=>{
    const first=company.slides[0];
    const slides=company.slides.map((item,slideIndex)=>{
      const loading=firstRenderedImage?'eager':'lazy';
      firstRenderedImage=false;
      return `<article class="reuse-production-gallery__slide${slideIndex===0?' is-active':''}" aria-hidden="${slideIndex===0?'false':'true'}" data-wa-project-id="${esc(item.projectId)}" data-wa-source-page="${item.page}"><div class="reuse-production-gallery__media"><img src="${sourcePath(item.page)}" alt="${esc(item.projectTitle)} 원본 포트폴리오 P.${item.page}" loading="${loading}" decoding="async" draggable="false"></div></article>`;
    }).join('');
    const anchors=[...new Set(company.slides.map(item=>item.projectId))].map(id=>`<span class="wa-project-anchor" id="${esc(id)}" aria-hidden="true"></span>`).join('');
    return `<article class="wa-company" data-wa-company data-wa-company-index="${companyListIndex}">
      ${anchors}
      <header class="wa-project__head is-dark hm-reveal" data-wa-head>
        <div class="wa-project__meta"><span class="wa-project__index" data-wa-head-index>${first.displayIndex} · ${esc(first.company)}</span><span class="wa-project__period" data-wa-head-period>${esc(first.period)}</span></div>
        <h3 class="wa-project__title" data-wa-head-title>${esc(first.projectTitle)}</h3>
      </header>
      <div class="reuse-production-gallery hm-reveal${first.coreValue?' is-core-value':''}" tabindex="0" aria-label="${esc(company.company)} 원본 포트폴리오 갤러리" data-wa-gallery>
        <div class="reuse-production-gallery__viewport">${slides}</div>
        <div class="wa-gallery-overlay" data-wa-gallery-copy><div class="wa-gallery-overlay__body"><p data-wa-caption></p><em class="wa-gallery-note" data-wa-note></em></div></div>
        <button class="reuse-production-gallery__nav reuse-production-gallery__nav--prev" type="button" data-reuse-gallery-prev aria-label="이전 이미지"></button>
        <button class="reuse-production-gallery__nav reuse-production-gallery__nav--next" type="button" data-reuse-gallery-next aria-label="다음 이미지"></button>
        <span class="reuse-production-gallery__status" data-reuse-gallery-status aria-live="polite">01 / ${pad(company.slides.length)}</span>
      </div>
    </article>`;
  }).join('');

  stream.innerHTML=`<div class="hm-wrap hm-ds-wrap"><div class="wa-company-list">${companyHtml}</div></div>`;
  const archiveWrap=stream.querySelector('.hm-wrap');
  if(archiveWrap&&menuShell)archiveWrap.prepend(menuShell);

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

  const menuLinks=[...document.querySelectorAll('[data-wa-menu-project]')];
  const setActiveProject=id=>menuLinks.forEach(link=>link.classList.toggle('is-active',link.dataset.waMenuProject===id));

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

  const sampleLuminance=(img,region)=>{
    if(!img?.naturalWidth||!img?.naturalHeight)return null;
    try{
      const [rx,ry,rw,rh]=region;
      const sx=Math.max(0,Math.min(img.naturalWidth-1,Math.round(img.naturalWidth*rx)));
      const sy=Math.max(0,Math.min(img.naturalHeight-1,Math.round(img.naturalHeight*ry)));
      const sw=Math.max(1,Math.min(img.naturalWidth-sx,Math.round(img.naturalWidth*rw)));
      const sh=Math.max(1,Math.min(img.naturalHeight-sy,Math.round(img.naturalHeight*rh)));
      const canvas=document.createElement('canvas');
      canvas.width=18;canvas.height=18;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      ctx.drawImage(img,sx,sy,sw,sh,0,0,18,18);
      const pixels=ctx.getImageData(0,0,18,18).data;
      let sum=0,count=0;
      for(let i=0;i<pixels.length;i+=4){
        if(pixels[i+3]<32)continue;
        sum+=(0.2126*pixels[i]+0.7152*pixels[i+1]+0.0722*pixels[i+2])/255;
        count+=1;
      }
      return count?sum/count:null;
    }catch(_){return null;}
  };

  const controllers=[];
  const targetMap=new Map();

  [...document.querySelectorAll('[data-wa-company]')].forEach((companyEl,companyListIndex)=>{
    const companyData=companies[companyListIndex];
    const gallery=companyEl.querySelector('[data-wa-gallery]');
    const slides=[...gallery.querySelectorAll('.reuse-production-gallery__slide')];
    const headIndex=companyEl.querySelector('[data-wa-head-index]');
    const headPeriod=companyEl.querySelector('[data-wa-head-period]');
    const headTitle=companyEl.querySelector('[data-wa-head-title]');
    const caption=gallery.querySelector('[data-wa-caption]');
    const note=gallery.querySelector('[data-wa-note]');
    const prev=gallery.querySelector('[data-reuse-gallery-prev]');
    const next=gallery.querySelector('[data-reuse-gallery-next]');
    const status=gallery.querySelector('[data-reuse-gallery-status]');

    let index=0;
    let busy=false;
    let pointerStart=null;

    companyData.slides.forEach((item,slideIndex)=>{
      if(!targetMap.has(item.projectId))targetMap.set(item.projectId,{companyEl,slideIndex});
    });

    const activeImage=()=>slides[index]?.querySelector('img')||null;
    const applyContrast=()=>{
      const item=companyData.slides[index];
      const img=activeImage();
      const commit=()=>{
        if(item.coreValue){
          gallery.style.setProperty('--wa-body-color','#fff');
          gallery.style.setProperty('--wa-prev-color','#fff');
          gallery.style.setProperty('--wa-next-color','#fff');
          return;
        }
        const bodyLum=sampleLuminance(img,[0,.02,.48,.30]);
        const prevLum=sampleLuminance(img,[0,.32,.12,.36]);
        const nextLum=sampleLuminance(img,[.88,.32,.12,.36]);
        gallery.style.setProperty('--wa-body-color',bodyLum!==null&&bodyLum<.46?'#fff':'#000');
        gallery.style.setProperty('--wa-prev-color',prevLum!==null&&prevLum<.46?'#fff':'#000');
        gallery.style.setProperty('--wa-next-color',nextLum!==null&&nextLum<.46?'#fff':'#000');
      };
      if(img?.complete&&img.naturalWidth)commit();
      else img?.addEventListener('load',commit,{once:true});
    };

    const updateCopy=()=>{
      const item=companyData.slides[index];
      if(headIndex)headIndex.textContent=`${item.displayIndex} · ${item.company}`;
      if(headPeriod)headPeriod.textContent=item.period;
      if(headTitle)headTitle.textContent=item.projectTitle;
      if(caption){caption.textContent=item.caption||'';caption.hidden=!item.caption;}
      if(note){note.textContent=item.note||'';note.hidden=!item.note;}
      if(status)status.textContent=`${pad(index+1)} / ${pad(slides.length)}`;
      gallery.classList.toggle('is-core-value',item.coreValue);
      setActiveProject(item.projectId);
      applyContrast();
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

    const transitionTo=(targetIndex,direction=1,animate=true)=>{
      if(busy||slides.length<2||targetIndex===index){
        if(targetIndex===index)updateCopy();
        return;
      }
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
      const complete=()=>{index=targetIndex;busy=false;settle();};
      if(reducedMotion||!animate){complete();return;}
      void incoming.offsetWidth;
      current.classList.add('is-exiting');
      incoming.classList.add('is-entering');
      window.setTimeout(complete,TRANSITION_MS+30);
    };

    const move=delta=>{
      if(busy||slides.length<2)return;
      const target=(index+delta+slides.length)%slides.length;
      transitionTo(target,delta<0?-1:1,true);
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

    const controller={
      sync:()=>{setGalleryHeight(gallery,activeImage());applyContrast();},
      goTo:target=>transitionTo(target,target<index?-1:1,false),
      getProjectId:()=>companyData.slides[index]?.projectId
    };
    companyEl.__waController=controller;
    controllers.push(controller);
    settle();
  });

  /* Manual-only gallery. No timer, autoplay, interval or observer advances slides. */
  let resizeFrame=0;
  window.addEventListener('resize',()=>{
    if(resizeFrame)cancelAnimationFrame(resizeFrame);
    resizeFrame=requestAnimationFrame(()=>{controllers.forEach(controller=>controller.sync());resizeFrame=0;});
  },{passive:true});

  menuLinks.forEach(link=>link.addEventListener('click',event=>{
    const target=targetMap.get(link.dataset.waMenuProject);
    if(!target)return;
    event.preventDefault();
    setMenuOpen(false);
    history.replaceState(null,'',`#${link.dataset.waMenuProject}`);
    target.companyEl.__waController?.goTo(target.slideIndex);
    scrollTo({top:target.companyEl.getBoundingClientRect().top+scrollY-24,behavior:reducedMotion?'auto':'smooth'});
  }));

  const companyEls=[...document.querySelectorAll('[data-wa-company]')];
  if('IntersectionObserver' in window&&companyEls.length){
    const ratios=new Map();
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>ratios.set(entry.target,entry.intersectionRatio));
      let best=null,bestRatio=0;
      companyEls.forEach(company=>{
        const ratio=ratios.get(company)||0;
        if(ratio>bestRatio){best=company;bestRatio=ratio;}
      });
      const id=best?.__waController?.getProjectId();
      if(id)setActiveProject(id);
    },{threshold:[0,.12,.25,.5,.75],rootMargin:'-12% 0px -56% 0px'});
    companyEls.forEach(company=>observer.observe(company));
  }

  const initial=location.hash.slice(1);
  if(initial){
    const target=targetMap.get(initial);
    if(target)setTimeout(()=>{
      target.companyEl.__waController?.goTo(target.slideIndex);
      scrollTo({top:target.companyEl.getBoundingClientRect().top+scrollY-24,behavior:'auto'});
    },60);
  }

  window.__hmAnimationScan?.();
})();