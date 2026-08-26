(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;
  document.body.classList.add('himart-v14');

  /* ---------- 01 / RING DRAWING ----------
     Use an explicit SVG overlay so the 5px 12-o'clock drawing is not affected by older pseudo-element motion code. */
  const rings=[...main.querySelectorAll('#brand .ring-card')];
  rings.forEach(ring=>{
    ring.querySelector('.v14-ring-svg')?.remove();
    const raw=ring.style.getPropertyValue('--pct').trim();
    const pct=Math.max(0,Math.min(100,parseFloat(raw)||0));
    ring.style.setProperty('--v14-ring-offset',String(100-pct));
    ring.classList.remove('is-v14-ring-active');
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','v14-ring-svg');
    svg.setAttribute('viewBox','0 0 100 100');
    svg.setAttribute('aria-hidden','true');
    const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('class','v14-ring-progress');
    circle.setAttribute('cx','50');
    circle.setAttribute('cy','50');
    circle.setAttribute('r','49');
    circle.setAttribute('pathLength','100');
    svg.appendChild(circle);
    ring.appendChild(svg);
  });

  const activateRing=ring=>ring?.classList.add('is-v14-ring-active');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    rings.forEach(activateRing);
  }else if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      requestAnimationFrame(()=>activateRing(entry.target));
      io.unobserve(entry.target);
    }),{threshold:.22,rootMargin:'0px 0px -8% 0px'});
    rings.forEach(r=>io.observe(r));
  }else{
    rings.forEach(activateRing);
  }

  /* ---------- 02 / ENTRY ---------- */
  const entry=main.querySelector('#data .wide-entry-bar');
  const entryTail=entry?.querySelector('.wide-segment:last-child');
  entryTail?.querySelector('span')?.remove();

  /* ---------- 03 / JOURNEY COPY BALANCE ---------- */
  const splitBalanced=(text)=>{
    const clean=(text||'').replace(/\s+/g,' ').trim();
    if(!clean)return ['', ''];
    const words=clean.split(' ');
    if(words.length<2)return [clean,''];
    let best=1,bestDiff=Infinity;
    for(let i=1;i<words.length;i++){
      const a=words.slice(0,i).join(' ');
      const b=words.slice(i).join(' ');
      const diff=Math.abs(a.replace(/\s/g,'').length-b.replace(/\s/g,'').length);
      if(diff<bestDiff){best=i;bestDiff=diff;}
    }
    return [words.slice(0,best).join(' '),words.slice(best).join(' ')];
  };

  const balanceJourneyCopy=()=>{
    main.querySelectorAll('#journey .flow-node p').forEach(p=>{
      if(p.dataset.v14Balanced==='1')return;
      const [a,b]=splitBalanced(p.textContent);
      if(!b)return;
      p.dataset.v14Balanced='1';
      p.classList.add('v14-balanced-flow-copy');
      p.innerHTML=`<span class="v14-flow-line">${a}</span><span class="v14-flow-line">${b}</span>`;
    });
  };

  const centerTabletLabels=()=>{
    main.querySelectorAll('#journey .wide-flow-cluster .wide-flow-cluster-label').forEach(label=>{
      label.style.left='50%';
      label.style.right='auto';
      label.style.transform='translate(-50%,-50%)';
      label.style.textAlign='center';
    });
  };

  balanceJourneyCopy();
  centerTabletLabels();

  /* Older journey rebuilds can land a little later. Re-apply only the harmless copy/label alignment. */
  setTimeout(()=>{balanceJourneyCopy();centerTabletLabels();},180);
  setTimeout(()=>{balanceJourneyCopy();centerTabletLabels();},780);
})();
