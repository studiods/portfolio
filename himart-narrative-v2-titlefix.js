(()=>{
  'use strict';

  const CANONICAL_HTML='앞선 데이터를 바탕으로,<br>구매 여정의 흐름과 각 화면의 역할을<br>다시 정의했습니다.';
  const OLD_NEEDLE='그래서 끊어진 여정을';
  const CANONICAL_NEEDLES=['앞선 데이터를 바탕으로','구매 여정의 흐름과 각 화면의 역할을','다시 정의했습니다'];
  let fixing=false;
  let raf=0;

  const normalize=s=>(s||'').replace(/\s+/g,' ').trim();
  const isCanonicalText=text=>CANONICAL_NEEDLES.every(part=>text.includes(part));

  const ensureGuardStyle=()=>{
    if(document.getElementById('journey-title-hard-guard'))return;
    const style=document.createElement('style');
    style.id='journey-title-hard-guard';
    style.textContent=`
      html body:not(.journey-title-canonical) #journey > .hm-wrap > .hm-section-head .hm-section-title{
        visibility:hidden!important;
      }
      html body #journey > .hm-wrap > .hm-section-head .hm-section-title::before,
      html body #journey > .hm-wrap > .hm-section-head .hm-section-title::after{
        content:none!important;
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  };

  const fixJourneyTitle=()=>{
    if(fixing)return;
    fixing=true;
    try{
      ensureGuardStyle();

      const journey=document.querySelector('#journey');
      if(!journey){
        document.body?.classList.remove('journey-title-canonical');
        return;
      }

      const wrap=journey.querySelector(':scope > .hm-wrap')||journey.querySelector('.hm-wrap');
      if(!wrap)return;

      const directHeads=[...wrap.querySelectorAll(':scope > .hm-section-head')];
      const head=directHeads[0]||wrap.querySelector('.hm-section-head');
      if(!head)return;

      let titles=[...head.querySelectorAll(':scope > .hm-section-title')];
      let keep=titles[0]||null;
      if(!keep){
        keep=document.createElement('h2');
        keep.className='hm-section-title';
        const no=head.querySelector(':scope > .hm-section-no');
        if(no)no.insertAdjacentElement('afterend',keep);
        else head.prepend(keep);
      }

      /* Always replace the entire title node content. This removes the old title even when
         another script has concatenated it into the same h2. */
      if(keep.innerHTML!==CANONICAL_HTML)keep.innerHTML=CANONICAL_HTML;
      keep.removeAttribute('data-old-title');
      keep.dataset.canonicalJourneyTitle='1';

      titles=[...head.querySelectorAll(':scope > .hm-section-title')];
      titles.forEach(el=>{if(el!==keep)el.remove();});

      /* Remove any extra chapter head that may have been injected later. */
      directHeads.slice(1).forEach(extra=>{
        const text=normalize(extra.textContent);
        if(text.includes(OLD_NEEDLE)||isCanonicalText(text))extra.remove();
      });

      /* Remove old/canonical duplicate headings anywhere else inside #journey. */
      const headingSelector='.hm-section-title,.hm-subtitle,.forced-redesign-title,.journey-block-title,h1,h2,h3,h4';
      [...journey.querySelectorAll(headingSelector)].forEach(el=>{
        if(el===keep||!el.isConnected)return;
        const text=normalize(el.textContent);
        if(text.includes(OLD_NEEDLE)||isCanonicalText(text))el.remove();
      });

      /* Last-resort cleanup for a plain text node inserted without a heading wrapper. */
      const walker=document.createTreeWalker(journey,NodeFilter.SHOW_TEXT);
      const dirty=[];
      while(walker.nextNode()){
        const node=walker.currentNode;
        if(node.parentElement===keep)continue;
        if((node.nodeValue||'').includes(OLD_NEEDLE))dirty.push(node);
      }
      dirty.forEach(node=>{
        const parent=node.parentElement;
        if(parent&&parent!==journey&&normalize(parent.textContent).includes(OLD_NEEDLE)){
          parent.remove();
        }else{
          node.nodeValue=(node.nodeValue||'').replace(/그래서 끊어진 여정을[^]*?(?=앞선 데이터를 바탕으로|$)/,'');
        }
      });

      /* Verify that the only chapter title left is the canonical title. */
      const finalTitles=[...head.querySelectorAll(':scope > .hm-section-title')];
      const valid=finalTitles.length===1 && finalTitles[0]===keep && keep.innerHTML===CANONICAL_HTML && !normalize(journey.textContent).includes(OLD_NEEDLE);
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

    /* Cover delayed source construction and all late-running refinement scripts. */
    [20,60,120,220,400,700,1100,1700,2600,4000,6500,10000,15000].forEach(ms=>setTimeout(fixJourneyTitle,ms));

    if('MutationObserver' in window){
      const observer=new MutationObserver(scheduleFix);
      observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
    }

    /* Permanent lightweight fallback: if another script rewrites the title much later,
       the canonical title is restored on the next tick. */
    setInterval(fixJourneyTitle,1200);
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
