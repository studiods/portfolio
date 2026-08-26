(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;
  document.body.classList.add('himart-v15');

  /* ---------- 01 / RING DRAWING ----------
     Use a single SVG circle whose pathLength is 100. The circle itself is rotated -90deg,
     so 0 always starts at 12 o'clock and the positive stroke direction is clockwise.
     Animate only stroke-dasharray from 0 to the exact percentage; no dashoffset segmentation. */
  const rings=[...main.querySelectorAll('#brand .ring-card')];
  rings.forEach(ring=>{
    ring.querySelector('.v14-ring-svg')?.remove();
    ring.querySelector('.v15-ring-svg')?.remove();

    const pct=Math.max(0,Math.min(100,parseFloat(ring.style.getPropertyValue('--pct'))||0));
    ring.dataset.v15Pct=String(pct);
    ring.dataset.v15RingPlayed='0';

    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','v15-ring-svg');
    svg.setAttribute('viewBox','0 0 100 100');
    svg.setAttribute('aria-hidden','true');

    const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('class','v15-ring-progress');
    circle.setAttribute('cx','50');
    circle.setAttribute('cy','50');
    circle.setAttribute('r','49');
    circle.setAttribute('pathLength','100');
    circle.setAttribute('transform','rotate(-90 50 50)');
    circle.style.strokeDasharray='0 100';
    circle.style.strokeDashoffset='0';

    svg.appendChild(circle);
    ring.appendChild(svg);
  });

  const playRing=ring=>{
    if(!ring||ring.dataset.v15RingPlayed==='1')return;
    ring.dataset.v15RingPlayed='1';
    const circle=ring.querySelector('.v15-ring-progress');
    if(!circle)return;
    const pct=Math.max(0,Math.min(100,parseFloat(ring.dataset.v15Pct)||0));
    const finalDash=`${pct} ${100-pct}`;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){
      circle.style.strokeDasharray=finalDash;
      return;
    }
    circle.animate(
      [
        {strokeDasharray:'0 100'},
        {strokeDasharray:finalDash}
      ],
      {duration:1200,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'}
    );
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
