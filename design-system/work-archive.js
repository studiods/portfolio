(()=>{
  'use strict';

  const data=window.WORK_ARCHIVE_DATA||[];
  const menuData=window.WORK_ARCHIVE_MENU||[];
  const stream=document.querySelector('[data-wa-stream]');
  const menu=document.querySelector('[data-wa-menu]');
  const trigger=document.querySelector('[data-wa-menu-trigger]');
  const menuShell=document.querySelector('[data-wa-menu-shell]');
  if(!stream||!menu)return;

  const HOLD_MS=2500;
  const TRANSITION_MS=720;
  const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad=n=>String(n).padStart(2,'0');
  const pad3=n=>String(n).padStart(3,'0');

  /* Source extraction was created in contiguous portfolio blocks. These prefixes match
     the files currently stored in assets/image/work-archive without creating derivatives. */
  const sourcePrefix=page=>{
    if(page<=33)return'aimmo';
    if(page<=45)return'trenbe';
    if(page<=68)return'yanolja';
    if(page<=98)return'nbt';
    return'coupang';
  };
  const sourcePath=page=>`./assets/image/work-archive/archive-${sourcePrefix(page)}-p${pad3(page)}.webp`;

  /* Preserve the original WORKS switcher requirement: published cases stay navigable,
     while only unpublished projects are rendered in this archive page. */
  menu.innerHTML=menuData.map(group=>`<div class="wa-menu-group"><strong>${esc(group.company)}</strong><div>${group.items.map(item=>{
    if(item.href){
      const href=item.href==='./himart-automation.html'?'./himart-ax.html':item.href;
      return `<a href="${esc(href)}">${esc(item.title)}</a>`;
    }
    return `<a href="#${esc(item.id)}" data-wa-menu-project="${esc(item.id)}">${esc(item.title)}</a>`;
  }).join('')}</div></div>`).join('');

  let globalIndex=0;
  stream.innerHTML=data.map((group,companyIndex)=>{
    const projects=group.projects.map((project,projectIndex)=>{
      globalIndex+=1;
      const displayIndex=pad(globalIndex);
      const pages=Array.isArray(project.pages)?project.pages:[];
      const slides=pages.map((page,pageIndex)=>`<article class="reuse-production-gallery__slide${pageIndex===0?' is-active':''}" aria-hidden="${pageIndex===0?'false':'true'}"><div class="reuse-production-gallery__media"><img src="${sourcePath(page)}" alt="${esc(project.title)} 원본 포트폴리오 P.${page}" loading="${pageIndex===0?'eager':'lazy'}" decoding="async" draggable="false" data-wa-source-page="${page}"></div></article>`).join('');
      const single=pages.length<=1;

      return `<article class="wa-project hm-reveal" id="${esc(project.id)}" data-wa-project data-company="${companyIndex}" data-project="${projectIndex}">
        <div class="reuse-production-gallery" tabindex="0" aria-label="${esc(project.title)} 원본 포트폴리오 갤러리" data-wa-gallery data-single-slide="${single?'true':'false'}">
          <div class="reuse-production-gallery__viewport">${slides}</div>
          <div class="wa-gallery-title" data-wa-gallery-title>
            <span class="wa-gallery-title__index">${displayIndex} · ${esc(group.company)}</span>
            <h3>${esc(project.title)}</h3>
            <span class="wa-gallery-title__period">${esc(group.period)}</span>
          </div>
          <div class="reuse-production-gallery__copy">
            <p>${esc(project.desc)}</p>
            ${project.note?`<em class="wa-gallery-note">${esc(project.note)}</em>`:''}
          </div>
          <button class="reuse-production-gallery__nav reuse-production-gallery__nav--prev" type="button" data-reuse-gallery-prev aria-label="이전 이미지"></button>
          <button class="reuse-production-gallery__nav reuse-production-gallery__nav--next" type="button" data-reuse-gallery-next aria-label="다음 이미지"></button>
          <span class="reuse-production-gallery__status" data-reuse-gallery-status aria-live="polite">01 / ${pad(pages.length)}</span>
        </div>
      </article>`;
    }).join('');

    return `<section class="hm-section hm-ds-section wa-company" id="wa-company-${companyIndex+1}" data-wa-company="${companyIndex}"><div class="hm-wrap hm-ds-wrap"><div class="wa-project-list">${projects}</div></div></section>`;
  }).join('');

  const toneCanvas=document.createElement('canvas');
  toneCanvas.width=64;
  toneCanvas.height=32;
  const toneCtx=toneCanvas.getContext('2d',{willReadFrequently:true});

  const cacheTone=img=>{
    if(!img||img.dataset.waTone||!toneCtx)return;
    if(!img.complete||!img.naturalWidth){
      img.addEventListener('load',()=>cacheTone(img),{once:true});
      return;
    }
    try{
      toneCtx.clearRect(0,0,64,32);
      const sw=Math.max(1,Math.floor(img.naturalWidth*.62));
      const sh=Math.max(1,Math.floor(img.naturalHeight*.34));
      toneCtx.drawImage(img,0,0,sw,sh,0,0,64,32);
      const pixels=toneCtx.getImageData(0,0,64,32).data;
      let total=0,count=0,dark=0;
      for(let i=0;i<pixels.length;i+=4){
        if(pixels[i+3]<24)continue;
        const lum=(.2126*pixels[i]+.7152*pixels[i+1]+.0722*pixels[i+2])/255;
        total+=lum;
        count+=1;
        if(lum<.42)dark+=1;
      }
      const avg=count?total/count:1;
      const darkRatio=count?dark/count:0;
      img.dataset.waTone=(avg<.46||darkRatio>.56)?'light':'dark';
    }catch(_){
      img.dataset.waTone='dark';
    }
  };

  const applyTone=(gallery,img)=>{
    if(!gallery||!img)return;
    cacheTone(img);
    const commit=()=>gallery.style.setProperty('--wa-title-color',img.dataset.waTone==='light'?'#fff':'#000');
    if(img.dataset.waTone)commit();
    else img.addEventListener('load',()=>{cacheTone(img);commit();},{once:true});
  };

  const setGalleryHeight=(gallery,img)=>{
    if(!gallery||!img)return;
    const commit=()=>{
      if(!img.naturalWidth||!gallery.clientWidth)return;
      const height=gallery.clientWidth*(img.naturalHeight/img.naturalWidth);
      gallery.style.height=`${height}px`;
      gallery.classList.add('is-ratio-ready');
    };
    if(img.complete&&img.naturalWidth)commit();
    else img.addEventListener('load',commit,{once:true});
  };

  const galleries=[...document.querySelectorAll('[data-wa-gallery]')];
  const controllers=new Map();

  galleries.forEach(gallery=>{
    const projectEl=gallery.closest('[data-wa-project]');
    const companyIndex=Number(projectEl?.dataset.company||0);
    const projectIndex=Number(projectEl?.dataset.project||0);
    const project=data[companyIndex]?.projects?.[projectIndex];
    if(!project)return;

    const slides=[...gallery.querySelectorAll('.reuse-production-gallery__slide')];
    const prev=gallery.querySelector('[data-reuse-gallery-prev]');
    const next=gallery.querySelector('[data-reuse-gallery-next]');
    const status=gallery.querySelector('[data-reuse-gallery-status]');
    if(!slides.length)return;

    slides.forEach(slide=>cacheTone(slide.querySelector('img')));

    let index=Math.max(0,slides.findIndex(slide=>slide.classList.contains('is-active')));
    let timer=0;
    let busy=false;
    let inView=false;
    let pointerStart=null;

    const clearTimer=()=>{
      if(timer)window.clearTimeout(timer);
      timer=0;
    };

    const updateStatus=()=>{
      if(status)status.textContent=`${pad(index+1)} / ${pad(slides.length)}`;
    };

    const activeImage=()=>slides[index]?.querySelector('img')||null;

    const syncVisual=()=>{
      const img=activeImage();
      if(!img)return;
      setGalleryHeight(gallery,img);
      applyTone(gallery,img);
    };

    const settle=()=>{
      slides.forEach((slide,i)=>{
        const active=i===index;
        slide.classList.toggle('is-active',active);
        slide.classList.remove('is-next','is-entering','is-exiting');
        slide.setAttribute('aria-hidden',active?'false':'true');
      });
      gallery.classList.remove('is-reverse');
      updateStatus();
      syncVisual();
    };

    const schedule=()=>{
      clearTimer();
      if(!inView||document.hidden||busy||slides.length<2)return;
      timer=window.setTimeout(()=>move(1),HOLD_MS);
    };

    const transitionTo=(targetIndex,direction=1)=>{
      if(busy||slides.length<2||targetIndex===index)return;
      clearTimer();
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
        schedule();
      };

      if(reducedMotion){
        complete();
        return;
      }

      void incoming.offsetWidth;
      current.classList.add('is-exiting');
      incoming.classList.add('is-entering');
      window.setTimeout(complete,TRANSITION_MS+30);
    };

    function move(delta){
      if(busy||slides.length<2)return;
      const targetIndex=(index+delta+slides.length)%slides.length;
      transitionTo(targetIndex,delta<0?-1:1);
    }

    prev?.addEventListener('click',event=>{
      event.stopPropagation();
      move(-1);
    });
    next?.addEventListener('click',event=>{
      event.stopPropagation();
      move(1);
    });

    gallery.addEventListener('keydown',event=>{
      if(event.key==='ArrowLeft'){
        event.preventDefault();
        move(-1);
      }else if(event.key==='ArrowRight'){
        event.preventDefault();
        move(1);
      }
    });

    gallery.addEventListener('pointerdown',event=>{
      if(event.target.closest('button'))return;
      pointerStart={x:event.clientX,y:event.clientY,id:event.pointerId};
      clearTimer();
    });
    gallery.addEventListener('pointerup',event=>{
      if(!pointerStart||pointerStart.id!==event.pointerId)return;
      const dx=event.clientX-pointerStart.x;
      const dy=event.clientY-pointerStart.y;
      pointerStart=null;
      if(Math.abs(dx)>=45&&Math.abs(dx)>Math.abs(dy)*1.15)move(dx<0?1:-1);
      else schedule();
    });
    gallery.addEventListener('pointercancel',()=>{
      pointerStart=null;
      schedule();
    });

    const controller={
      setInView(value){
        inView=value;
        if(inView)schedule();
        else clearTimer();
      },
      pause(){clearTimer();},
      resume(){if(inView)schedule();},
      sync:syncVisual
    };
    controllers.set(gallery,controller);
    settle();
  });

  if('IntersectionObserver' in window){
    const galleryObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>controllers.get(entry.target)?.setInView(entry.isIntersecting));
    },{threshold:.20,rootMargin:'0px 0px -5% 0px'});
    controllers.forEach((_,gallery)=>galleryObserver.observe(gallery));
  }else{
    controllers.forEach(controller=>controller.setInView(true));
  }

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)controllers.forEach(controller=>controller.pause());
    else controllers.forEach(controller=>controller.resume());
  });

  let resizeFrame=0;
  window.addEventListener('resize',()=>{
    if(resizeFrame)cancelAnimationFrame(resizeFrame);
    resizeFrame=requestAnimationFrame(()=>{
      controllers.forEach(controller=>controller.sync());
      resizeFrame=0;
    });
  },{passive:true});

  const setMenuOpen=open=>{
    if(!trigger)return;
    trigger.setAttribute('aria-expanded',open?'true':'false');
    trigger.setAttribute('aria-label',open?'프로젝트 목록 닫기':'프로젝트 목록 열기');
    menu.classList.toggle('is-open',open);
    menu.setAttribute('aria-hidden',open?'false':'true');
  };
  trigger?.addEventListener('click',()=>setMenuOpen(trigger.getAttribute('aria-expanded')!=='true'));
  document.addEventListener('pointerdown',event=>{
    if(menuShell&&!menuShell.contains(event.target))setMenuOpen(false);
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape')setMenuOpen(false);
  });

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
    const projectObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>ratios.set(entry.target,entry.intersectionRatio));
      let best=null,bestRatio=0;
      projectEls.forEach(project=>{
        const ratio=ratios.get(project)||0;
        if(ratio>bestRatio){best=project;bestRatio=ratio;}
      });
      if(best)setActiveProject(best.id);
    },{threshold:[0,.12,.25,.5,.75],rootMargin:'-18% 0px -52% 0px'});
    projectEls.forEach(project=>projectObserver.observe(project));
  }

  const initial=location.hash.slice(1);
  if(initial){
    const target=document.getElementById(initial);
    if(target)setTimeout(()=>scrollTo({top:target.getBoundingClientRect().top+scrollY-96,behavior:'auto'}),60);
  }

  window.__hmAnimationScan?.();
})();