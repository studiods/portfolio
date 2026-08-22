(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const POOL='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const prepareScramble=async()=>{
    try{if(document.fonts?.ready)await document.fonts.ready;}catch(e){}
    const targets=[...document.querySelectorAll('.js-scramble')];
    targets.forEach(el=>{
      if(el.dataset.scramblePrepared==='1')return;
      el.dataset.scramblePrepared='1';
      const text=el.textContent;
      el.textContent='';
      const frag=document.createDocumentFragment();
      [...text].forEach(ch=>{
        if(ch===' '||ch==='\n'||ch==='\t'){
          frag.appendChild(document.createTextNode(ch));
          return;
        }
        const span=document.createElement('span');
        span.className='scramble-char';
        span.dataset.final=ch;
        span.textContent=ch;
        frag.appendChild(span);
      });
      el.appendChild(frag);
      [...el.querySelectorAll('.scramble-char')].forEach(span=>{
        const width=span.getBoundingClientRect().width;
        if(width>0)span.style.width=`${Math.ceil(width*100)/100}px`;
      });
    });

    const play=el=>{
      if(el.dataset.scramblePlayed==='1')return;
      el.dataset.scramblePlayed='1';
      const chars=[...el.querySelectorAll('.scramble-char')];
      if(reduced){chars.forEach(ch=>{ch.textContent=ch.dataset.final;ch.classList.add('is-live')});return;}
      chars.forEach((ch,index)=>{
        const final=ch.dataset.final;
        const base=index*12;
        for(let cycle=0;cycle<4;cycle++){
          setTimeout(()=>{
            ch.classList.add('is-live');
            ch.textContent=POOL[(index*17+cycle*13+Math.floor(performance.now()/47))%POOL.length];
          },base+cycle*34);
        }
        setTimeout(()=>{
          ch.classList.add('is-live');
          ch.textContent=final;
        },base+148);
      });
    };

    if(reduced){targets.forEach(play);return;}
    if(!('IntersectionObserver' in window)){targets.forEach(play);return;}
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting||entry.intersectionRatio<.28)return;
      play(entry.target);
      observer.unobserve(entry.target);
    }),{threshold:[.12,.28,.55],rootMargin:'0px 0px -8% 0px'});
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
    const target=document.querySelector(link.getAttribute('href')||'');
    if(!target)return;
    event.preventDefault();
    target.scrollIntoView({behavior:'smooth',block:'start'});
  }));
  updateProgress();
  prepareScramble();
})();
