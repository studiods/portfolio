(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;
  document.body.classList.add('himart-v15');

  /* ---------- 01 / RING DRAWING ----------
     Use one physical SVG circumference instead of pathLength-normalized dash values.
     Some mobile Chromium builds repeat normalized CSS dashes around the circle; using the
     measured circumference plus dashoffset guarantees one uninterrupted 5px stroke.
     The circle is rotated -90deg, so drawing starts at 12 o'clock and proceeds clockwise. */
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
    circle.setAttribute('transform','rotate(-90 50 50)');

    const circumference=2*Math.PI*49;
    circle.dataset.circumference=String(circumference);
    circle.style.strokeDasharray=`${circumference} ${circumference}`;
    circle.style.strokeDashoffset=String(circumference);

    svg.appendChild(circle);
    ring.appendChild(svg);
  });

  const playRing=ring=>{
    if(!ring||ring.dataset.v15RingPlayed==='1')return;
    ring.dataset.v15RingPlayed='1';
    const circle=ring.querySelector('.v15-ring-progress');
    if(!circle)return;
    const pct=Math.max(0,Math.min(100,parseFloat(ring.dataset.v15Pct)||0));
    const circumference=parseFloat(circle.dataset.circumference)||2*Math.PI*49;
    const finalOffset=circumference*(1-pct/100);
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){
      circle.style.strokeDashoffset=String(finalOffset);
      return;
    }
    circle.animate(
      [
        {strokeDashoffset:String(circumference)},
        {strokeDashoffset:String(finalOffset)}
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
