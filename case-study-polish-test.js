(() => {
  'use strict';

  const POOL='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  // The original test renderer already registered an IntersectionObserver on
  // data-focus-scramble nodes. Replace those nodes so that observer is left
  // watching detached elements and cannot run a second scramble on the same title.
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
      if(ch===' '||ch==='\n'){
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
      for(let cycle=0;cycle<3;cycle++){
        setTimeout(()=>{
          ch.textContent=POOL[(index*17+cycle*11+Math.floor(performance.now()/37))%POOL.length];
        },base+cycle*36);
      }
      setTimeout(()=>{ch.textContent=final;},base+118);
    });
  };

  const initScramble=async()=>{
    try{if(document.fonts?.ready)await document.fonts.ready;}catch(e){}
    stableTargets.forEach(prepare);
    document.body.classList.add('case-scramble-ready');
    const played=new WeakSet();
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting&&entry.intersectionRatio>=.46&&!played.has(entry.target)){
        played.add(entry.target);
        animate(entry.target);
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
    const travel=Math.max(1,rect.height-innerHeight);
    const progress=Math.min(1,Math.max(0,-rect.top/travel));
    hero.style.setProperty('--hero-dim',(0.08+progress*0.80).toFixed(3));
  };
  const requestHero=()=>{
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(renderHero);
  };
  addEventListener('scroll',requestHero,{passive:true});
  addEventListener('resize',requestHero,{passive:true});
  renderHero();

  initScramble();
})();