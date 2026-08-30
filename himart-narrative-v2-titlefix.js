(()=>{
  'use strict';

  const CANONICAL_HTML='앞선 데이터를 바탕으로,<br>구매 여정의 흐름과 각 화면의 역할을<br>다시 정의했습니다.';
  const OLD_NEEDLE='그래서 끊어진 여정을';
  const CANONICAL_NEEDLES=['앞선 데이터를 바탕으로','구매 여정의 흐름과 각 화면의 역할을','다시 정의했습니다'];
  let fixing=false;

  const normalize=s=>(s||'').replace(/\s+/g,' ').trim();
  const isCanonicalText=text=>CANONICAL_NEEDLES.every(part=>text.includes(part));

  const fixJourneyTitle=()=>{
    if(fixing)return;
    fixing=true;
    try{
      const journey=document.querySelector('#journey');
      if(!journey)return;
      const wrap=journey.querySelector(':scope > .hm-wrap')||journey.querySelector('.hm-wrap');
      if(!wrap)return;

      const directHeads=[...wrap.querySelectorAll(':scope > .hm-section-head')];
      const head=directHeads[0]||wrap.querySelector('.hm-section-head');
      if(!head)return;

      let titles=[...head.querySelectorAll('.hm-section-title')];
      let keep=titles[0]||null;
      if(!keep){
        keep=document.createElement('h2');
        keep.className='hm-section-title';
        const no=head.querySelector('.hm-section-no');
        if(no)no.insertAdjacentElement('afterend',keep);
        else head.prepend(keep);
      }
      if(keep.innerHTML!==CANONICAL_HTML)keep.innerHTML=CANONICAL_HTML;

      titles=[...head.querySelectorAll('.hm-section-title')];
      titles.forEach(el=>{if(el!==keep)el.remove();});

      directHeads.slice(1).forEach(extra=>{
        const text=normalize(extra.textContent);
        if(text.includes(OLD_NEEDLE)||isCanonicalText(text))extra.remove();
      });

      const headingSelector='.hm-section-title,.hm-subtitle,.forced-redesign-title,h1,h2,h3,h4';
      [...journey.querySelectorAll(headingSelector)].forEach(el=>{
        if(el===keep||!el.isConnected)return;
        const text=normalize(el.textContent);
        if(text.includes(OLD_NEEDLE)||isCanonicalText(text))el.remove();
      });
    }finally{
      fixing=false;
    }
  };

  const start=()=>{
    fixJourneyTitle();
    [80,220,500,900,1600,2800,4500].forEach(ms=>setTimeout(fixJourneyTitle,ms));

    const root=document.querySelector('#live-main')||document.body;
    if('MutationObserver' in window&&root){
      const observer=new MutationObserver(()=>requestAnimationFrame(fixJourneyTitle));
      observer.observe(root,{childList:true,subtree:true,characterData:true});
      setTimeout(()=>observer.disconnect(),8000);
    }
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
