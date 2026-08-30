(()=>{
  'use strict';

  const CANONICAL_HTML='앞선 데이터를 바탕으로,<br>구매 여정의 흐름과 각 화면의 역할을<br>다시 정의했습니다.';
  const OLD_NEEDLE='그래서 끊어진 여정을';
  let fixing=false;
  let raf=0;

  const normalize=s=>(s||'').replace(/\s+/g,' ').trim();

  const ensureGuardStyle=()=>{
    if(document.getElementById('journey-title-hard-guard'))return;
    const style=document.createElement('style');
    style.id='journey-title-hard-guard';
    style.textContent=`
      html body:not(.journey-title-canonical) #journey > .hm-wrap > .hm-section-head .hm-section-title{visibility:hidden!important}
      html body #journey > .hm-wrap > .hm-section-head .hm-section-no{display:block!important;margin:0 0 24px!important;font-size:16px!important;color:var(--hm-blue)!important}
      html body #journey > .hm-wrap > .hm-section-head .hm-section-title::before,
      html body #journey > .hm-wrap > .hm-section-head .hm-section-title::after{content:none!important;display:none!important}
    `;
    document.head.appendChild(style);
  };

  const fixJourneyTitle=()=>{
    if(fixing)return;
    fixing=true;
    try{
      ensureGuardStyle();
      const journey=document.querySelector('#journey');
      const wrap=journey?.querySelector(':scope > .hm-wrap')||journey?.querySelector('.hm-wrap');
      const head=wrap?.querySelector(':scope > .hm-section-head')||wrap?.querySelector('.hm-section-head');
      if(!journey||!wrap||!head){
        document.body?.classList.remove('journey-title-canonical');
        return;
      }

      let no=head.querySelector(':scope > .hm-section-no');
      if(!no){
        no=document.createElement('span');
        no.className='hm-section-no';
      }
      no.textContent='03';

      let title=head.querySelector(':scope > .hm-section-title');
      if(!title){
        title=document.createElement('h2');
        title.className='hm-section-title';
      }
      title.innerHTML=CANONICAL_HTML;

      head.prepend(no);
      no.insertAdjacentElement('afterend',title);

      [...head.querySelectorAll(':scope > .hm-section-no')].forEach(el=>{if(el!==no)el.remove();});
      [...head.querySelectorAll(':scope > .hm-section-title')].forEach(el=>{if(el!==title)el.remove();});

      const headingSelector='.hm-section-title,.hm-subtitle,.forced-redesign-title,h1,h2,h3,h4';
      [...journey.querySelectorAll(headingSelector)].forEach(el=>{
        if(el===title||el.closest('.journey-flow-block,.journey-role-block'))return;
        const t=normalize(el.textContent);
        if(t.includes(OLD_NEEDLE)||t===normalize(title.textContent))el.remove();
      });

      const valid=head.firstElementChild===no && no.nextElementSibling===title && title.innerHTML===CANONICAL_HTML && !normalize(journey.textContent).includes(OLD_NEEDLE);
      document.body?.classList.toggle('journey-title-canonical',valid);
    }finally{
      fixing=false;
    }
  };

  const scheduleFix=()=>{
    if(raf)return;
    raf=requestAnimationFrame(()=>{
      raf=0;
      fixJourneyTitle();
    });
  };

  const start=()=>{
    ensureGuardStyle();
    fixJourneyTitle();
    [20,60,120,220,400,700,1100,1700,2600,4000,6500,10000].forEach(ms=>setTimeout(fixJourneyTitle,ms));
    if('MutationObserver' in window){
      const observer=new MutationObserver(scheduleFix);
      observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
      setTimeout(()=>observer.disconnect(),15000);
    }
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
