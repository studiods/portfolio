(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;
  document.body.classList.add('himart-v15');

  /* ---------- 01 / RING DRAWING ----------
     SVG dash patterns can fragment at the path seam on mobile Chromium.
     Draw a single conic sector instead: 0deg is 12 o'clock, angles increase clockwise,
     and a radial mask leaves an exact 5px continuous ring. */
  const rings=[...main.querySelectorAll('#brand .ring-card')];
  rings.forEach(ring=>{
    ring.querySelectorAll('.v14-ring-svg,.v15-ring-svg,.v15-ring-arc').forEach(el=>el.remove());

    const pct=Math.max(0,Math.min(100,parseFloat(ring.style.getPropertyValue('--pct'))||0));
    ring.dataset.v15Pct=String(pct);
    ring.dataset.v15RingPlayed='0';

    const arc=document.createElement('span');
    arc.className='v15-ring-arc';
    arc.setAttribute('aria-hidden','true');
    arc.style.setProperty('--v15-ring-angle','0deg');
    ring.appendChild(arc);
  });

  const playRing=ring=>{
    if(!ring||ring.dataset.v15RingPlayed==='1')return;
    ring.dataset.v15RingPlayed='1';
    const arc=ring.querySelector('.v15-ring-arc');
    if(!arc)return;

    const pct=Math.max(0,Math.min(100,parseFloat(ring.dataset.v15Pct)||0));
    const finalAngle=pct*3.6;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){
      arc.style.setProperty('--v15-ring-angle',`${finalAngle}deg`);
      return;
    }

    const start=performance.now();
    const duration=1200;
    const frame=now=>{
      const t=Math.min(1,(now-start)/duration);
      const eased=1-Math.pow(1-t,3);
      arc.style.setProperty('--v15-ring-angle',`${finalAngle*eased}deg`);
      if(t<1)requestAnimationFrame(frame);
      else arc.style.setProperty('--v15-ring-angle',`${finalAngle}deg`);
    };
    requestAnimationFrame(frame);
  };

  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    rings.forEach(playRing);
  }else if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      playRing(entry.target);
      io.unobserve(entry.target);
    }),{threshold:.24,rootMargin:'0px 0px -8% 0px'});
    rings.forEach(ring=>io.observe(ring));
  }else{
    rings.forEach(playRing);
  }

  /* ---------- 02 / ACTION LABEL ---------- */
  const action=main.querySelector('#data .wide-action-bar');
  const endSegment=action?.querySelector('.wide-segment:first-child');
  const endSpan=endSegment?.querySelector(':scope > span');
  if(endSpan){
    const small=endSpan.querySelector('small');
    const value=small?.textContent?.trim()||'52.2%';
    endSpan.innerHTML=`<span class="v15-action-label">종료</span><small>${value}</small>`;
  }

  /* ---------- V / DATA SYNTHESIS ---------- */
  const bridge=main.querySelector('#data .data-bridge');
  const bridgeTitle=bridge?.querySelector('.data-bridge-title');
  if(bridgeTitle){
    bridgeTitle.innerHTML='<span class="wide-roman-index">V.</span> 결과적으로 데이터를 분석해 보니 뚜렷한 패턴이 보였습니다.';
  }
})();
