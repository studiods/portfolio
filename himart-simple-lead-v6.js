(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal=[...document.querySelectorAll('.reveal,.case-bridge,.data-card,.journey-track')];
  if(reduced) reveal.forEach(el=>el.classList.add('is-in'));
  else{
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-in');io.unobserve(entry.target)}}),{threshold:.14,rootMargin:'0px 0px -8%'});
    reveal.forEach(el=>io.observe(el));
  }
  const pool='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const scramble=(el)=>{
    if(!el||el.dataset.played||reduced)return;
    el.dataset.played='1';
    const original=el.textContent,chars=[...original];
    const mutable=chars.map((ch,i)=>/[\p{L}\p{N}]/u.test(ch)?i:-1).filter(i=>i>=0);
    let frame=0;const total=mutable.length+9;
    const tick=()=>{const resolved=Math.max(0,frame-8);el.textContent=chars.map((ch,i)=>{const order=mutable.indexOf(i);if(order<0||order<resolved)return ch;return pool[(i*17+frame*7)%pool.length]}).join('');frame+=2;if(frame<total)requestAnimationFrame(tick);else el.textContent=original};
    requestAnimationFrame(tick);
  };
  if(reduced)return;
  const titleIO=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){scramble(entry.target);titleIO.unobserve(entry.target)}}),{threshold:.32});
  document.querySelectorAll('.js-scramble').forEach(el=>titleIO.observe(el));
})();
