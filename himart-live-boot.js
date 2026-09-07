(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal=[...document.querySelectorAll('.hm-reveal')];
  if(reduced) reveal.forEach(n=>n.classList.add('is-in'));
  else if('IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -8% 0px'});
    reveal.forEach(n=>io.observe(n));
  } else reveal.forEach(n=>n.classList.add('is-in'));

  /* Right-side navigation is owned only by design-system/navigation.js + components/progress.css. */
  const flowScript=document.createElement('script');
  flowScript.src='./himart-flow-line-sync-v1.js?v=ca60638';
  document.body.appendChild(flowScript);
})();
