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

  const applyBrandPresentation=()=>{
    const brand=document.querySelector('#brand');
    if(!brand)return;

    const intro=brand.querySelector('.hm-section-head p');
    if(intro){
      intro.textContent='입사 후 처음 진행하는 대규모 개편이었기 때문에 화면을 바로 고치지 않았습니다. 먼저 AI를 활용해 다양한 채널에서 하이마트에 대한 고객들의 목소리를 폭넓게 수집하고, 고객이 기대하는 강점과 온라인 경험의 간극을 정리했습니다. 이후 검색·홈·PDP·구매 로그에서 같은 문제가 실제 행동으로도 나타나는지 다시 교차검증했습니다.';
    }

    const groups=[...brand.querySelectorAll('.hm-perception-group')];
    groups.forEach((group,index)=>{
      group.classList.add(index===0?'hm-perception-positive':'hm-perception-negative');
      const label=group.querySelector('.hm-insight-label');
      const eyebrow=label?.querySelector('span');
      if(eyebrow)eyebrow.remove();
      const title=label?.querySelector('b');
      if(title)title.textContent=index===0?'고객들이 생각하는 강점':'고객들이 아쉽다고 느끼는 부분';
    });

    const researchNote=brand.querySelector('.hm-research-note');
    if(researchNote){
      const label=researchNote.querySelector('span');
      const copy=researchNote.querySelector('p');
      if(label)label.textContent='AI VOICE COLLECTION → DATA CROSS-CHECK';
      if(copy)copy.textContent='AI를 활용해 다양한 외부 채널과 소비자 자료에서 하이마트에 대한 고객의 목소리를 수집해 가설을 만들고, 실제 검색·홈·PDP·구매 데이터를 교차검증했습니다. 정성 자료에서 확인되지 않은 비율은 만들지 않았고, 위 수치는 원본 로그와 보고서에 존재하는 값 또는 동일 기간 집계값만 사용했습니다.';
    }

    brand.querySelectorAll('.hm-action-side').forEach(side=>side.classList.add('hm-action-emphasis'));

    const style=document.createElement('style');
    style.setAttribute('data-himart-brand-refine','1');
    style.textContent=`
      .himart-page-body{
        --hm-blue:#00A6ED;
        --hm-green:#00EDBD;
        --hm-yellow:#F3EB01;
        --hm-red:#FA481B;
        --hm-point:var(--hm-blue);
        --hm-second:var(--hm-blue);
        --hm-special:var(--hm-blue);
        --hm-sub:var(--hm-green);
      }
      #brand.hm-section{padding-top:clamp(60px,7vh,95px)}
      #brand .hm-perception{gap:clamp(24px,2.8vw,44px)}
      #brand .hm-perception-group{
        padding:clamp(22px,2.1vw,32px) 0 0;
        border:0;
        border-top:1px solid;
        border-radius:0;
        background:transparent;
      }
      #brand .hm-perception-positive{border-top-color:var(--hm-blue)}
      #brand .hm-perception-negative{border-top-color:var(--hm-red)}
      #brand .hm-insight-label{
        justify-content:flex-start;
        padding-bottom:18px;
      }
      #brand .hm-insight-label b{
        font:300 clamp(24px,1.75vw,30px)/1.2 var(--hm-ko);
        letter-spacing:-.025em;
      }
      #brand .hm-perception-positive .hm-insight-label{border-bottom-color:rgba(0,166,237,.38)}
      #brand .hm-perception-negative .hm-insight-label{border-bottom-color:rgba(250,72,27,.38)}
      #brand .hm-perception-positive .hm-insight-label b{color:var(--hm-blue)}
      #brand .hm-perception-negative .hm-insight-label b{color:var(--hm-red)}
      #brand .hm-insight-grid{padding-top:20px}
      #brand .hm-insight-card{
        height:100%;
        background:rgba(255,255,255,.018)!important;
        border-color:rgba(255,255,255,.13)!important;
      }
      #brand .hm-insight-card::before{display:none!important}
      #brand .hm-insight-card>span{color:rgba(255,255,255,.60)!important}

      /* Green is a subordinate accent only: micro graphics / secondary cues, never primary headings or section rules. */
      #brand .hm-cross-card.hm-cross-second{
        background:linear-gradient(155deg,rgba(0,237,189,.055),rgba(0,237,189,.012) 52%,transparent)!important;
        border-color:rgba(0,237,189,.15)!important;
      }
      #brand .hm-cross-card.hm-cross-second::before{
        height:1px!important;
        background:rgba(0,237,189,.72)!important;
      }
      #brand .hm-cross-stack .is-quick{background:rgba(0,237,189,.68)!important}
      #brand .hm-cross-nodes i:nth-child(2){background:rgba(0,237,189,.68)!important}
      #brand .hm-cross-blocks i.alt{background:rgba(0,237,189,.62)!important}
      #brand .hm-research-note span{color:rgba(0,237,189,.68)!important}

      #brand .hm-action-split{gap:clamp(20px,2.8vw,44px)}
      #brand .hm-action-side.hm-action-emphasis{
        padding:clamp(26px,2.6vw,38px);
        border:1px solid rgba(0,166,237,.62);
        border-radius:8px;
        background:linear-gradient(145deg,rgba(0,166,237,.105),rgba(0,166,237,.018) 52%,transparent);
      }
      #brand .hm-action-side.hm-action-emphasis>span{color:rgba(255,255,255,.60)}
      #brand .hm-action-side.hm-action-emphasis h3{
        margin:32px 0 22px;
        color:var(--hm-blue);
      }
      #brand .hm-action-side.hm-action-emphasis:nth-child(2)>span{color:rgba(0,237,189,.72)}
      @media(max-width:900px){
        #brand .hm-perception-group{padding:20px 0 0}
      }
    `;
    document.head.appendChild(style);

    const equalizeInsightCards=()=>{
      const cards=[...brand.querySelectorAll('.hm-insight-card')];
      if(!cards.length)return;
      cards.forEach(card=>{card.style.minHeight='';});
      if(innerWidth<=900)return;
      const maxHeight=Math.max(...cards.map(card=>Math.ceil(card.getBoundingClientRect().height)));
      cards.forEach(card=>{card.style.minHeight=`${maxHeight}px`;});
    };

    const runEqualize=()=>requestAnimationFrame(equalizeInsightCards);
    try{
      if(document.fonts?.ready)document.fonts.ready.then(runEqualize);
      else runEqualize();
    }catch(e){runEqualize();}

    let resizeTimer=0;
    addEventListener('resize',()=>{
      clearTimeout(resizeTimer);
      resizeTimer=setTimeout(equalizeInsightCards,120);
    },{passive:true});
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
  applyBrandPresentation();
  updateProgress();
  prepareScramble();
})();
