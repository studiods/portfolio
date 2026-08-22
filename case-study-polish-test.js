(() => {
  'use strict';
  const POOL='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

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

  const animate=el=>{
    const chars=[...el.querySelectorAll('.scramble-char')];
    chars.forEach((ch,index)=>{
      const final=ch.dataset.final;
      const base=index*8;
      for(let cycle=0;cycle<3;cycle++)setTimeout(()=>{ch.textContent=POOL[(index*17+cycle*11+Math.floor(performance.now()/37))%POOL.length];},base+cycle*36);
      setTimeout(()=>{ch.textContent=final;},base+118);
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

      const values=cards.map(card=>{
        const raw=(card.querySelector('span')?.textContent||'').replace(/,/g,'').trim();
        return /^\d+(?:\.\d+)?$/.test(raw)?Number(raw):null;
      });
      const numeric=values.filter(value=>Number.isFinite(value));
      if(numeric.length<2)return;
      const max=Math.max(...numeric,1);
      grid.classList.add('has-metrics');
      cards.forEach((card,index)=>{
        const value=values[index];
        if(!Number.isFinite(value))return;
        card.classList.add('is-metric');
        const track=document.createElement('div');
        track.className='metric-track';
        const fill=document.createElement('span');
        fill.className='metric-fill';
        fill.style.width=`${Math.max(4,(value/max)*100).toFixed(1)}%`;
        track.appendChild(fill);
        card.appendChild(track);
      });
    });
  };

  const initScramble=async()=>{
    try{if(document.fonts?.ready)await document.fonts.ready;}catch(e){}
    stableTargets.forEach(prepare);
    document.body.classList.add('case-scramble-ready');
    const played=new WeakSet();
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting&&entry.intersectionRatio>=.46&&!played.has(entry.target)){
        played.add(entry.target);animate(entry.target);
      }
    }),{threshold:[.2,.46,.72]});
    stableTargets.forEach(el=>observer.observe(el));
  };

  const hero=document.querySelector('.case-hero');
  let ticking=false;
  const renderHero=()=>{
    ticking=false;
    if(!hero)return;
    const rect=hero.getBoundingClientRect();
    const progress=Math.min(1,Math.max(0,-rect.top/Math.max(1,innerHeight*.82)));
    hero.style.setProperty('--hero-dim',(0.06+progress*0.82).toFixed(3));
  };
  const requestHero=()=>{if(ticking)return;ticking=true;requestAnimationFrame(renderHero);};
  addEventListener('scroll',requestHero,{passive:true});
  addEventListener('resize',requestHero,{passive:true});

  enhanceInformationUI();
  renderHero();
  initScramble();
})();