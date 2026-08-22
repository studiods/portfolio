(() => {
  'use strict';

  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const POOL='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  document.querySelector('.hero-media')?.remove();

  const authoredText=node=>{
    if(node.nodeType===Node.TEXT_NODE)return node.nodeValue||'';
    if(node.nodeType!==Node.ELEMENT_NODE)return '';
    if(node.classList?.contains('scramble-char')&&node.dataset.final)return node.dataset.final;
    return [...node.childNodes].map(authoredText).join('');
  };

  const stableTargets=[...document.querySelectorAll('[data-focus-scramble]')].map(old=>{
    const clean=old.cloneNode(false);
    clean.removeAttribute('data-focus-scramble');
    clean.setAttribute('data-stable-scramble','');
    clean.removeAttribute('data-scramble-prepared');
    clean.textContent=authoredText(old);
    old.replaceWith(clean);
    return clean;
  });

  const prepare=el=>{
    const text=el.textContent;
    el.textContent='';
    const frag=document.createDocumentFragment();
    [...text].forEach(ch=>{
      if(ch===' '||ch==='\n'){frag.appendChild(document.createTextNode(ch));return;}
      const span=document.createElement('span');
      span.className='scramble-char';
      span.dataset.final=ch;
      span.textContent=ch;
      frag.appendChild(span);
    });
    el.appendChild(frag);
    [...el.querySelectorAll('.scramble-char')].forEach(ch=>{
      const width=ch.getBoundingClientRect().width;
      if(width>0)ch.style.width=`${Math.ceil(width*100)/100}px`;
    });
    el.classList.add('scramble-ready');
  };

  const animateScramble=el=>{
    const chars=[...el.querySelectorAll('.scramble-char')];
    chars.forEach((ch,index)=>{
      const final=ch.dataset.final;
      const base=index*9;
      for(let cycle=0;cycle<3;cycle++)setTimeout(()=>{ch.textContent=POOL[(index*17+cycle*11+Math.floor(performance.now()/37))%POOL.length];},base+cycle*36);
      setTimeout(()=>{ch.textContent=final;},base+120);
    });
  };

  const enhanceInformationUI=()=>{
    document.querySelectorAll('.case-stage').forEach(stage=>{
      const kicker=(stage.querySelector('.case-section-kicker')?.textContent||'').toUpperCase();
      const grid=stage.querySelector('.evidence-grid');
      if(!grid)return;
      const cards=[...grid.querySelectorAll('.evidence-card')];
      cards.forEach((card,index)=>card.dataset.uiIndex=String(index+1).padStart(2,'0'));
      if(kicker.includes('EVIDENCE')||kicker.includes('RESEARCH'))grid.classList.add('is-research-grid');
      if(kicker.includes('OUTCOME')||kicker.includes('RESULT'))grid.classList.add('is-outcome-grid');

      if(document.body.dataset.case==='automation'&&kicker.includes('CONTEXT')){
        const values=cards.map(card=>{
          const span=card.querySelector('span');
          const raw=(span?.textContent||'').replace(/,/g,'').trim();
          return /^\d+(?:\.\d+)?$/.test(raw)?Number(raw):null;
        });
        const numeric=values.filter(Number.isFinite);
        if(numeric.length>=2){
          const max=Math.max(...numeric,1);
          grid.classList.add('has-metrics');
          cards.forEach((card,index)=>{
            const value=values[index];
            if(!Number.isFinite(value))return;
            const span=card.querySelector('span');
            span.dataset.metricTarget=String(value);
            span.textContent=reduced?String(value):'0';
            const track=document.createElement('div');
            track.className='metric-track';
            const fill=document.createElement('span');
            fill.className='metric-fill';
            fill.style.setProperty('--metric-ratio',String(Math.max(.04,value/max)));
            track.appendChild(fill);
            card.appendChild(track);
          });
        }
      }
    });
  };

  const animateMetricGrid=grid=>{
    if(grid.dataset.metricPlayed==='1')return;
    grid.dataset.metricPlayed='1';
    grid.classList.add('is-metric-visible');
    grid.querySelectorAll('[data-metric-target]').forEach(span=>{
      const target=Number(span.dataset.metricTarget)||0;
      if(reduced){span.textContent=String(target);return;}
      const start=performance.now();
      const duration=760;
      const frame=now=>{
        const p=Math.min(1,(now-start)/duration);
        const eased=1-Math.pow(1-p,3);
        span.textContent=String(Math.round(target*eased));
        if(p<1)requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
  };

  const buildChapterProgress=()=>{
    const stages=[...document.querySelectorAll('.case-stage')];
    if(!stages.length)return null;
    const nav=document.createElement('nav');
    nav.className='case-chapter-progress';
    nav.setAttribute('aria-label','Case study chapters');
    stages.forEach((stage,index)=>{
      const button=document.createElement('button');
      button.type='button';
      button.textContent=String(index+1).padStart(2,'0');
      button.setAttribute('aria-label',stage.querySelector('.case-stage-title')?.textContent?.trim()||`Chapter ${index+1}`);
      button.addEventListener('click',()=>stage.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'}));
      nav.appendChild(button);
    });
    document.body.appendChild(nav);
    return {nav,stages,buttons:[...nav.querySelectorAll('button')]};
  };

  const motionTargets=[...document.querySelectorAll('.case-stage-head,.case-stage-intro,.evidence-grid,.process-strip,.case-key-quote,.case-closing blockquote,.case-next')];
  motionTargets.forEach(el=>el.classList.add('motion-reveal'));
  const mediaSlots=[...document.querySelectorAll('.media-slot')];

  enhanceInformationUI();
  const chapters=buildChapterProgress();

  if(reduced){
    motionTargets.forEach(el=>el.classList.add('is-in'));
    mediaSlots.forEach(el=>el.classList.add('is-in'));
    document.querySelectorAll('.has-metrics').forEach(animateMetricGrid);
  }else if('IntersectionObserver' in window){
    const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add('is-in');
      revealObserver.unobserve(entry.target);
    }),{threshold:.12,rootMargin:'0px 0px -8% 0px'});
    motionTargets.forEach(el=>revealObserver.observe(el));
    mediaSlots.forEach(el=>revealObserver.observe(el));

    const metricObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      animateMetricGrid(entry.target);
      metricObserver.unobserve(entry.target);
    }),{threshold:.35});
    document.querySelectorAll('.has-metrics').forEach(el=>metricObserver.observe(el));
  }else{
    motionTargets.forEach(el=>el.classList.add('is-in'));
    mediaSlots.forEach(el=>el.classList.add('is-in'));
    document.querySelectorAll('.has-metrics').forEach(animateMetricGrid);
  }

  const initScramble=async()=>{
    try{if(document.fonts?.ready)await document.fonts.ready;}catch(e){}
    stableTargets.forEach(prepare);
    document.body.classList.add('case-scramble-ready');
    if(reduced)return;
    const played=new WeakSet();
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting&&entry.intersectionRatio>=.42&&!played.has(entry.target)){
        played.add(entry.target);
        animateScramble(entry.target);
      }
    }),{threshold:[.2,.42,.72]});
    stableTargets.forEach(el=>observer.observe(el));
  };

  const mediaWalls=[...document.querySelectorAll('.media-wall')];
  let ticking=false;
  const updateScrollMotion=()=>{
    ticking=false;
    const viewport=innerHeight||1;
    mediaWalls.forEach(wall=>{
      const rect=wall.getBoundingClientRect();
      const center=rect.top+rect.height/2;
      const delta=(center-viewport/2)/viewport;
      const shift=Math.max(-14,Math.min(14,-delta*18));
      wall.style.setProperty('--wall-y',`${shift.toFixed(1)}px`);
    });

    if(chapters){
      let active=0;
      let closest=Infinity;
      chapters.stages.forEach((stage,index)=>{
        const rect=stage.getBoundingClientRect();
        const distance=Math.abs(rect.top-viewport*.28);
        if(distance<closest){closest=distance;active=index;}
      });
      chapters.buttons.forEach((button,index)=>button.classList.toggle('is-active',index===active));
      const first=chapters.stages[0].offsetTop;
      const last=chapters.stages[chapters.stages.length-1];
      const total=Math.max(1,last.offsetTop+last.offsetHeight-first-viewport*.45);
      const progress=Math.max(0,Math.min(1,(scrollY-first+viewport*.28)/total));
      chapters.nav.style.setProperty('--chapter-progress',progress.toFixed(4));
    }
  };

  const requestScrollMotion=()=>{
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(updateScrollMotion);
  };
  addEventListener('scroll',requestScrollMotion,{passive:true});
  addEventListener('resize',requestScrollMotion,{passive:true});

  updateScrollMotion();
  initScramble();
})();