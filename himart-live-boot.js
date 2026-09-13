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
    REUSE 04 / PROTOTYPE
    --------------------
    Reuse keeps its authored copy, but the old 12-card phone grid is converted into
    six full-width rows, two taller Galaxy-style line mockups on the left and one copy
    panel on the right. The text is derived from the current Reuse phone-card labels/
    captions, so this structural migration does not replace the authored Reuse content
    with Himart copy.
  */
  const mountReuseDirectionPrototype=()=>{
    if(!document.body.classList.contains('reuse-current'))return;

    if(!document.querySelector('link[data-reuse-prototype-cases]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href='./design-system/components/reuse-prototype-cases.css?v=20260910-2';
      link.dataset.reusePrototypeCases='1';
      document.head.appendChild(link);
    }

    const direction=document.querySelector('#live-main > #direction');
    const wrap=direction?.querySelector(':scope > .hm-wrap');
    const head=wrap?.querySelector(':scope > .hm-section-head');
    const gallery=wrap?.querySelector(':scope > .phone-gallery');
    if(!direction||!wrap||!head)return;

    /* Prevent the 04 major title from entering at the generic 30% pre-reveal opacity. */
    head.classList.add('is-visible');

    if(!gallery || wrap.querySelector(':scope > .prototype-case-list'))return;

    const cards=[...gallery.querySelectorAll(':scope > .phone-card')];
    if(!cards.length)return;

    const list=document.createElement('div');
    list.className='prototype-case-list reuse-prototype-case-list hm-reveal';

    for(let start=0;start<cards.length;start+=2){
      const group=cards.slice(start,start+2);
      if(!group.length)continue;

      const numbers=group.map(card=>(card.querySelector('.phone-meta span')?.textContent||'').trim()).filter(Boolean);
      const titles=group.map(card=>(card.querySelector('.phone-meta b')?.textContent||'').trim()).filter(Boolean);
      const captions=group.map(card=>(card.querySelector('.phone-meta p')?.textContent||'').trim()).filter(Boolean);

      const article=document.createElement('article');
      article.className='prototype-case';

      const visual=document.createElement('div');
      visual.className='prototype-case-visual';
      group.forEach((_,screenIndex)=>{
        const device=document.createElement('div');
        device.className='galaxy-ultra-mockup';
        device.setAttribute('aria-label',`Reuse prototype row ${Math.floor(start/2)+1}, screen ${screenIndex+1}`);
        const screen=document.createElement('div');
        screen.className='galaxy-ultra-screen';
        device.appendChild(screen);
        visual.appendChild(device);
      });

      const copy=document.createElement('div');
      copy.className='prototype-case-copy';

      const number=document.createElement('span');
      number.className='hm-card-no';
      number.textContent=numbers.length>1 ? `${numbers[0]}–${numbers[numbers.length-1]}` : (numbers[0]||'');

      const title=document.createElement('h3');
      title.textContent=captions.join(' · ');

      const description=document.createElement('p');
      description.textContent=titles.join(' · ');

      const summary=document.createElement('strong');
      const summaryLabel=document.createElement('b');
      summaryLabel.textContent='SCREENS';
      summary.appendChild(summaryLabel);
      summary.append(document.createTextNode(group.map((card,index)=>{
        const n=numbers[index]||'';
        const t=titles[index]||'';
        return `${n}${n&&t?'  ':''}${t}`.trim();
      }).filter(Boolean).join(' · ')));

      copy.append(number,title,description,summary);
      article.append(visual,copy);
      list.appendChild(article);
    }

    gallery.replaceWith(list);
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
