(() => {
  'use strict';

  /* REUSE: remove an accidental literal "\\n" text node that can be promoted
     from the document head into the top-left of the rendered body by the HTML parser. */
  if(document.body.classList.contains('reuse-current')){
    [...document.body.childNodes].forEach(node=>{
      if(node.nodeType===Node.TEXT_NODE && node.nodeValue.trim()==='\\n') node.remove();
    });
  }

  /* HIMART AX hero: replace the legacy static hero image with the approved AX movie.
     The page already loads this bootstrap at the end of body, so the swap happens before
     the visitor can meaningfully interact with the hero. */
  const mountHimartAxHeroVideo=()=>{
    if(!document.body.classList.contains('himart-ax-page'))return;
    const visual=document.querySelector('.ax-hero .ax-hero-visual');
    if(!visual || visual.querySelector('video'))return;

    const video=document.createElement('video');
    video.src='./assets/movies/himart_ax_01.mp4';
    video.autoplay=true;
    video.loop=true;
    video.muted=true;
    video.defaultMuted=true;
    video.playsInline=true;
    video.preload='auto';
    video.setAttribute('muted','');
    video.setAttribute('playsinline','');
    video.setAttribute('webkit-playsinline','');
    video.setAttribute('aria-hidden','true');
    video.style.cssText='display:block;width:100%;height:100%;object-fit:cover;object-position:center;opacity:.72;filter:grayscale(.22) contrast(1.05)';

    const image=visual.querySelector('img');
    if(image)image.replaceWith(video);
    else visual.prepend(video);

    const attempt=video.play?.();
    if(attempt?.catch)attempt.catch(()=>{});
  };
  mountHimartAxHeroVideo();

  /*
    REUSE 04.1 / PROTOTYPE GALLERY
    ------------------------------
    The first eight authored phone cards become a four-page carousel, two mockups per page.
    Each page uses 85% of the right content rail, with a fixed 32px gap between mockups.
    Copy stays paired with each mockup and moves below the device.
  */
  const mountReuseDirectionPrototype=()=>{
    const isReuse=document.body.classList.contains('reuse-current');
    const isHimartCommerce=document.body.classList.contains('himart-commerce-page')&&!isReuse;
    if(!isReuse&&!isHimartCommerce)return;

    if(!document.querySelector('link[data-reuse-prototype-cases]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href='./design-system/components/reuse-prototype-cases.css?v=20260921-14';
      link.dataset.reusePrototypeCases='1';
      document.head.appendChild(link);
    }

    const direction=document.querySelector('#live-main > #direction');
    const wrap=direction?.querySelector(':scope > .hm-wrap');
    const head=wrap?.querySelector(':scope > .hm-section-head');
    if(!direction||!wrap||!head)return;
    head.classList.add('is-visible');

    const reuseCopy=[
      {title:'상품화 이력과 보증',body:'상품화 과정과 보증 내역을 PDP 상단에서 바로 확인해 제품 상태에 대한 신뢰를 높였습니다.'},
      {title:'상태 이력과 등급',body:'회수·상품화·판매 시점을 공개하고, 현재 상태는 직관적인 등급으로 바로 확인하게 했습니다.'},
      {title:'간편 판매 등록',body:'판매 정보를 몇 단계의 짧은 스텝으로 나눠, 입력 부담 없이 빠르게 등록하도록 설계했습니다.'},
      {title:'예상 매입가',body:'예상 매입가를 메뉴에서 즉시 확인하게 해 가격 기준의 투명성과 신뢰를 높였습니다.'},
      {title:'보상 금액 확인',body:'사용하던 가전의 보상 금액을 몇 번의 선택만으로 빠르게 확인할 수 있게 구성했습니다.'},
      {title:'판매자의 사용 기록',body:'이전 사용자의 사용·관리 이야기를 직접 기록하게 해 제품을 이해할 또 하나의 신뢰 근거를 만들었습니다.'},
      {title:'상세 검수 결과',body:'검수 항목과 결과를 한눈에 보여 무엇이 좋고 부족한지 바로 판단할 수 있게 했습니다.'},
      {title:'구매와 매입 연결',body:'새 제품 구매에 기존 가전 매입을 연결해 폐기 부담은 줄이고 재판매 상품 확보 기회는 넓혔습니다.'}
    ];
    const himartCopy=[
      {title:'다음 목적지를 여는 홈',body:'유입과 최근 행동의 맥락을 이어받아 검색·카테고리·혜택과 주요 서비스로 빠르게 연결했습니다.'},
      {title:'구매 목적을 구체화하는 서브홈',body:'품목 나열보다 사용 상황과 공간, 설치 조건을 중심으로 탐색 방향을 빠르게 구체화했습니다.'},
      {title:'니즈를 행동으로 바꾸는 검색 진입',body:'추천검색과 탐색 가이드로 막연한 요구를 실제 검색 행동으로 자연스럽게 연결했습니다.'},
      {title:'검색 맥락을 유지하는 결과',body:'검색 조건과 필터를 유지해 사용자가 원하는 조건을 잃지 않고 후보를 좁히게 했습니다.'},
      {title:'후보를 빠르게 좁히는 목록',body:'가격·혜택·핵심 스펙과 설치 조건을 같은 기준으로 비교해 구매 후보를 빠르게 압축했습니다.'},
      {title:'핵심 기준을 한눈에 비교',body:'선택한 상품의 차이를 같은 기준으로 보여주고 사용자의 우선순위에 맞는 후보를 남기게 했습니다.'},
      {title:'구매 확신을 만드는 상세',body:'가격·혜택·배송·설치와 핵심 정보를 판단 순서에 맞춰 재구성해 구매 전 재확인 부담을 줄였습니다.'},
      {title:'매장·설치·케어를 연결하는 PDP',body:'실물 확인과 전문 상담, 배송·설치와 케어 정보를 한 흐름으로 연결해 구매 전 불확실성을 줄였습니다.'}
    ];

    const mountOne=(gallery,{kind='reuse',assetGroup='01',shellOnly=false}={})=>{
      if(!gallery||gallery.dataset.prototypeCarouselMounted==='true')return;
      const owner=gallery.closest('.himart-direction-041,.himart-direction-042')||wrap;
      if(owner.querySelector(':scope > .prototype-case-list'))return;

      const cards=[...gallery.querySelectorAll(':scope > .phone-card')].slice(0,8);
      if(!cards.length)return;
      gallery.dataset.prototypeCarouselMounted='true';

      const list=document.createElement('div');
      list.className='prototype-case-list reuse-prototype-case-list hm-reveal';
      list.dataset.reusePrototypeGallery='true';
      if(shellOnly)list.classList.add('is-shell-only');

      const viewport=document.createElement('div');
      viewport.className='prototype-case-viewport';
      const track=document.createElement('div');
      track.className='prototype-case-track';
      const copySet=kind==='reuse'?reuseCopy:himartCopy;
      const pages=[];

      for(let start=0;start<cards.length;start+=2){
        const group=cards.slice(start,start+2);
        if(!group.length)continue;
        const article=document.createElement('article');
        article.className=`prototype-case${start===0?' prototype-case--first':''}`;
        article.dataset.reusePrototypeSlide=String(pages.length);
        article.setAttribute('aria-hidden',pages.length===0?'false':'true');

        group.forEach((card,screenIndex)=>{
          const item=document.createElement('div');
          item.className='prototype-case-item';

          const device=document.createElement('div');
          device.className='galaxy-ultra-mockup';
          device.setAttribute('aria-label',`${kind==='reuse'?'Reuse':'Himart'} prototype page ${pages.length+1}, screen ${screenIndex+1}`);

          const screen=document.createElement('div');
          screen.className='galaxy-ultra-screen';

          /* HIMART 04.2 geometry lock.
             This runtime inline lock intentionally wins over the dynamically
             injected shared prototype stylesheet. The uploaded 04.2 screens
             are 375 × 812 and the outer device must use that exact ratio. */
          const isHimart042=kind==='himart'&&assetGroup==='02';
          if(isHimart042){
            device.classList.add('himart-042-device');
            device.style.setProperty('height','auto','important');
            device.style.setProperty('aspect-ratio','375 / 812','important');
            device.style.setProperty('padding','0','important');
            device.style.setProperty('overflow','visible','important');
            device.style.setProperty('box-sizing','border-box','important');

            screen.classList.add('himart-042-screen');
            screen.style.setProperty('width','100%','important');
            screen.style.setProperty('height','100%','important');
            screen.style.setProperty('aspect-ratio','auto','important');
            screen.style.setProperty('overflow','hidden','important');
            screen.style.setProperty('box-sizing','border-box','important');
          }
          device.appendChild(screen);

          const assetIndex=start+screenIndex+1;
          const assetNo=String(assetIndex).padStart(2,'0');

          if(!shellOnly){
            screen.classList.add('is-scrollable');
            device.classList.add('has-scroll-screen');
            const image=document.createElement('img');
            image.src=kind==='reuse'
              ?`./assets/image/himart-reuse/reuse_screens_01_${assetNo}.png`
              :`./assets/image/himart-cj/himart_cj_${assetGroup}_${assetNo}.png`;
            image.alt=kind==='reuse'
              ?`Reuse prototype screen 01_${assetNo}`
              :`Himart commerce journey prototype ${assetGroup}_${assetNo}`;
            image.loading=assetIndex<=2?'eager':'lazy';
            image.decoding='async';
            if(isHimart042){
              image.style.setProperty('display','block','important');
              image.style.setProperty('width','100%','important');
              image.style.setProperty('height','100%','important');
              image.style.setProperty('aspect-ratio','375 / 812','important');
              image.style.setProperty('object-fit','contain','important');
              image.style.setProperty('object-position','top center','important');
            }
            screen.appendChild(image);
          }

          item.appendChild(device);

          if(!shellOnly){
            const copyData=copySet[assetIndex-1]||{title:'',body:''};
            const copy=document.createElement('div');
            copy.className='prototype-case-copy';
            const copyTitle=document.createElement('h3');
            copyTitle.textContent=copyData.title;
            const copyDescription=document.createElement('p');
            copyDescription.textContent=copyData.body;
            copy.append(copyTitle,copyDescription);
            item.appendChild(copy);
          }

          article.appendChild(item);
        });

        const firstDevice=article.querySelector('.prototype-case-item:first-child .galaxy-ultra-mockup');
        const lastDevice=article.querySelector('.prototype-case-item:last-child .galaxy-ultra-mockup');
        const prev=document.createElement('button');
        prev.className='prototype-case-control prototype-case-control--prev';
        prev.type='button';
        prev.setAttribute('aria-label','이전 목업');
        const next=document.createElement('button');
        next.className='prototype-case-control prototype-case-control--next';
        next.type='button';
        next.setAttribute('aria-label','다음 목업');
        firstDevice?.appendChild(prev);
        lastDevice?.appendChild(next);

        track.appendChild(article);
        pages.push(article);
      }

      const firstClone=pages[0]?.cloneNode(true);
      const lastClone=pages[pages.length-1]?.cloneNode(true);
      if(firstClone&&lastClone){
        firstClone.classList.add('prototype-case--clone');
        lastClone.classList.add('prototype-case--clone');
        firstClone.setAttribute('aria-hidden','true');
        lastClone.setAttribute('aria-hidden','true');
        track.insertBefore(lastClone,track.firstChild);
        track.appendChild(firstClone);
      }

      viewport.appendChild(track);
      list.appendChild(viewport);

      const footer=document.createElement('div');
      footer.className='prototype-case-footer';
      const pagination=document.createElement('span');
      pagination.className='prototype-case-pagination';
      pagination.setAttribute('aria-live','polite');
      footer.appendChild(pagination);
      list.appendChild(footer);

      const HOLD_MS=6000;
      const realCount=pages.length;
      let index=0;
      let virtualIndex=1;
      let timer=0;
      let wrapping=false;

      const clearTimer=()=>{
        if(timer)window.clearTimeout(timer);
        timer=0;
      };
      const render=()=>{
        track.style.transform=`translate3d(${virtualIndex*-100}%,0,0)`;
        pages.forEach((page,pageIndex)=>page.setAttribute('aria-hidden',pageIndex===index?'false':'true'));
        pagination.textContent=`${String(index+1).padStart(2,'0')} / ${String(realCount).padStart(2,'0')}`;
      };
      const jumpToReal=(realIndex)=>{
        wrapping=true;
        index=realIndex;
        virtualIndex=realIndex+1;
        track.classList.add('is-instant');
        render();
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
          track.classList.remove('is-instant');
          wrapping=false;
        }));
      };
      const schedule=()=>{
        clearTimer();
        if(realCount<2)return;
        timer=window.setTimeout(()=>move(1),HOLD_MS);
      };
      const move=(delta)=>{
        if(realCount<2||wrapping)return;
        clearTimer();
        index=(index+delta+realCount)%realCount;
        virtualIndex+=delta;
        render();
        schedule();
      };

      track.addEventListener('transitionend',(event)=>{
        if(event.propertyName!=='transform'||wrapping)return;
        if(virtualIndex===realCount+1)jumpToReal(0);
        else if(virtualIndex===0)jumpToReal(realCount-1);
      });
      list.querySelectorAll('.prototype-case-control--prev').forEach(button=>{
        button.addEventListener('click',(event)=>{
          event.preventDefault();
          event.stopPropagation();
          move(-1);
        });
      });
      list.querySelectorAll('.prototype-case-control--next').forEach(button=>{
        button.addEventListener('click',(event)=>{
          event.preventDefault();
          event.stopPropagation();
          move(1);
        });
      });
      list.tabIndex=0;
      list.addEventListener('keydown',(event)=>{
        if(event.key==='ArrowLeft'){event.preventDefault();move(-1)}
        else if(event.key==='ArrowRight'){event.preventDefault();move(1)}
      });
      document.addEventListener('visibilitychange',()=>{
        if(document.hidden)clearTimer();
        else schedule();
      });

      track.classList.add('is-instant');
      render();
      gallery.replaceWith(list);
      requestAnimationFrame(()=>track.classList.remove('is-instant'));
      schedule();
    };

    if(isReuse){
      mountOne(wrap.querySelector(':scope > .phone-gallery, :scope > .hm-wide-right-rail > .phone-gallery'),{kind:'reuse'});
      return;
    }

    mountOne(wrap.querySelector('.himart-direction-041 .phone-gallery'),{kind:'himart',assetGroup:'01'});
    mountOne(wrap.querySelector('.himart-direction-042 .phone-gallery'),{kind:'himart',assetGroup:'02'});
  };
  mountReuseDirectionPrototype();

  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal=[...document.querySelectorAll('.hm-reveal')];
  if(reduced) reveal.forEach(n=>n.classList.add('is-in'));
  else if('IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -8% 0px'});
    reveal.forEach(n=>io.observe(n));
  } else reveal.forEach(n=>n.classList.add('is-in'));

  /*
    REUSE wide editorial chapter-start synchronization.
    Unlike himart.html, Reuse has no right-rail adapter, so the left sticky title and the
    first right-side block previously entered through independent reveal observers.
    One section-level checkpoint now reveals both in the same animation frame. CSS owns
    geometry and keeps both transform-free, so the divider/top line cannot drift.
  */
  const mountReuseWidePairSync=()=>{
    if(!document.body.classList.contains('reuse-current') || !document.body.classList.contains('hm-wide-editorial-test'))return;
    if(window.__hmReuseWidePairSyncMounted)return;
    window.__hmReuseWidePairSyncMounted=true;

    const sections=[...document.querySelectorAll('#live-main > :is(#brand,#data,#journey,#direction).hm-section')];
    const pairs=sections.map(section=>{
      const wrap=section.querySelector(':scope > .hm-wrap');
      const head=wrap?.querySelector(':scope > .hm-section-head');
      if(!wrap||!head)return null;

      let first=null;
      if(section.id==='brand' || section.id==='journey'){
        first=wrap.querySelector(':scope > .hm-section-head + .hm-subsection');
      }else if(section.id==='data'){
        const list=wrap.querySelector(':scope > .hm-section-head + .data-list');
        first=list?.querySelector(':scope > .data-card:first-child')||null;
      }else if(section.id==='direction'){
        first=wrap.querySelector(':scope > .hm-section-head + .prototype-intro') ||
          wrap.querySelector(':scope > .hm-section-head + .prototype-case-list') ||
          wrap.querySelector(':scope > .hm-section-head + .flow-area');
      }
      if(!first)return null;
      section.dataset.hmReuseWidePair='1';
      return{section,head,first};
    }).filter(Boolean);

    const revealPair=pair=>{
      if(!pair||pair.section.classList.contains('is-wide-chapter-pair-visible'))return;
      requestAnimationFrame(()=>{
        pair.head.classList.add('is-visible','is-in','is-wide-rise-in');
        pair.first.classList.add('is-visible','is-in','is-wide-rise-in');
        pair.section.classList.add('is-wide-chapter-pair-visible');
      });
    };

    if(reduced || !('IntersectionObserver' in window)){
      pairs.forEach(revealPair);
      return;
    }

    const pairByAnchor=new WeakMap();
    const pairObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        const pair=pairByAnchor.get(entry.target);
        if(!pair)return;
        revealPair(pair);
        pairObserver.unobserve(entry.target);
      });
    },{threshold:.12,rootMargin:'0px 0px -8% 0px'});

    pairs.forEach(pair=>{
      pairByAnchor.set(pair.first,pair);
      pairObserver.observe(pair.first);
    });
  };
  mountReuseWidePairSync();

  /* REUSE 03.2 / Gallery 03: one 8-frame focus demonstration + direct drag hint. */
  if(document.body.classList.contains('reuse-current') && !document.querySelector('script[data-reuse-360-focus-demo]')){
    const focusDemoScript=document.createElement('script');
    focusDemoScript.src='./design-system/reuse-360-focus-demo.js?v=20260910-1';
    focusDemoScript.dataset.reuse360FocusDemo='1';
    document.body.appendChild(focusDemoScript);
  }

  /* Right-side navigation is owned only by design-system/navigation.js + components/progress.css. */
  const flowScript=document.createElement('script');
  flowScript.src='./himart-flow-line-sync-v1.js?v=ca60638';
  document.body.appendChild(flowScript);
})();
