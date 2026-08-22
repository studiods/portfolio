(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const POOL='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const isHangul=value=>/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(value||'');

  const repairOperatingPresentation=()=>{
    const benchmark=document.querySelector('.hm-benchmark-title h3');
    if(benchmark&&benchmark.textContent.includes('익쌙한')){
      benchmark.textContent=benchmark.textContent.replace('익쌙한','익숙한');
    }
    document.querySelectorAll('.hm-meta b').forEach(el=>{
      if(el.textContent.includes('»'))el.textContent=el.textContent.replaceAll('»','·');
    });
    const style=document.createElement('style');
    style.setAttribute('data-himart-runtime-fix','1');
    style.textContent=".hm-confidential-card{border:1px solid var(--local-minor)!important}.hm-preview-blur::after{content:'PRE-OPEN / BLURRED'!important}";
    document.head.appendChild(style);
  };

  const prepareScramble=async()=>{
    try{if(document.fonts?.ready)await document.fonts.ready;}catch(e){}
    const targets=[...document.querySelectorAll('.js-scramble')];

    targets.forEach(el=>{
      if(el.dataset.scramblePrepared==='1')return;
      el.dataset.scramblePrepared='1';
      const originalText=el.textContent;
      el.dataset.originalText=originalText;
      el.textContent='';
      const frag=document.createDocumentFragment();

      [...originalText].forEach(ch=>{
        if(ch===' '||ch==='\n'||ch==='\t'){
          frag.appendChild(document.createTextNode(ch));
          return;
        }
        const span=document.createElement('span');
        span.className='scramble-char';
        span.dataset.final=ch;
        span.textContent=ch;
        if(isHangul(ch))span.style.width='1em';
        frag.appendChild(span);
      });
      el.appendChild(frag);
    });

    const finalize=el=>{
      const original=el.dataset.originalText;
      if(typeof original!=='string')return;
      el.textContent=original;
      el.classList.add('is-scramble-complete');
    };

    const play=el=>{
      if(el.dataset.scramblePlayed==='1')return;
      el.dataset.scramblePlayed='1';
      const chars=[...el.querySelectorAll('.scramble-char')];
      if(!chars.length){finalize(el);return;}
      if(reduced){finalize(el);return;}

      let completed=0;
      chars.forEach((ch,index)=>{
        const final=ch.dataset.final;
        const base=index*14;
        for(let cycle=0;cycle<4;cycle++){
          setTimeout(()=>{
            ch.classList.add('is-live');
            ch.textContent=POOL[(index*17+cycle*13+Math.floor(performance.now()/47))%POOL.length];
          },base+cycle*34);
        }
        setTimeout(()=>{
          ch.classList.add('is-live');
          ch.textContent=final;
          completed+=1;
          if(completed===chars.length)setTimeout(()=>finalize(el),34);
        },base+156);
      });
    };

    if(reduced){targets.forEach(finalize);return;}
    if(!('IntersectionObserver' in window)){targets.forEach(play);return;}
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting||entry.intersectionRatio<.24)return;
      play(entry.target);
      observer.unobserve(entry.target);
    }),{threshold:[.12,.24,.5],rootMargin:'0px 0px -10% 0px'});
    targets.forEach(el=>observer.observe(el));
  };

  const revealTargets=[...document.querySelectorAll('.hm-reveal,.hm-metric')];
  if(reduced){revealTargets.forEach(el=>el.classList.add('is-in'));}
  else if('IntersectionObserver' in window){
    const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add('is-in');
      revealObserver.unobserve(entry.target);
    }),{threshold:.12,rootMargin:'0px 0px -8% 0px'});
    revealTargets.forEach(el=>revealObserver.observe(el));
  }else revealTargets.forEach(el=>el.classList.add('is-in'));

  const metricCards=[...document.querySelectorAll('.hm-metric[data-value]')];
  const playMetric=card=>{
    if(card.dataset.metricPlayed==='1')return;
    card.dataset.metricPlayed='1';
    card.classList.add('is-in');
    const strong=card.querySelector('strong');
    const target=Number(card.dataset.value)||0;
    if(!strong||reduced)return;
    const start=performance.now();
    const duration=780;
    const tick=now=>{
      const p=Math.min(1,(now-start)/duration);
      const eased=1-Math.pow(1-p,3);
      strong.textContent=`${Math.round(target*eased)}%+`;
      if(p<1)requestAnimationFrame(tick);
    };
    strong.textContent='0%+';
    requestAnimationFrame(tick);
  };
  if(reduced)metricCards.forEach(playMetric);
  else if('IntersectionObserver' in window){
    const metricObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      playMetric(entry.target);
      metricObserver.unobserve(entry.target);
    }),{threshold:.35});
    metricCards.forEach(card=>metricObserver.observe(card));
  }else metricCards.forEach(playMetric);

  const sections=[...document.querySelectorAll('.hm-section[data-chapter]')];
  const progress=[...document.querySelectorAll('.hm-progress a')];
  let ticking=false;
  const updateProgress=()=>{
    ticking=false;
    const y=(innerHeight||1)*.32;
    let active=0;
    let best=Infinity;
    sections.forEach((section,index)=>{
      const distance=Math.abs(section.getBoundingClientRect().top-y);
      if(distance<best){best=distance;active=index;}
    });
    progress.forEach((link,index)=>link.classList.toggle('is-active',index===active));
  };
  const requestProgress=()=>{if(ticking)return;ticking=true;requestAnimationFrame(updateProgress)};
  addEventListener('scroll',requestProgress,{passive:true});
  addEventListener('resize',requestProgress,{passive:true});

  progress.forEach(link=>link.addEventListener('click',event=>{
    if(reduced)return;
    const selector=link.getAttribute('href');
    const target=selector?document.querySelector(selector):null;
    if(!target)return;
    event.preventDefault();
    target.scrollIntoView({behavior:'smooth',block:'start'});
  }));

  repairOperatingPresentation();
  updateProgress();
  prepareScramble();
})();
