(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal=[...document.querySelectorAll('.hm-reveal')];
  if(reduced)reveal.forEach(n=>n.classList.add('is-in'));
  else if('IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -8% 0px'});
    reveal.forEach(n=>io.observe(n));
  } else reveal.forEach(n=>n.classList.add('is-in'));

  const sections=[...document.querySelectorAll('[data-chapter]')];
  const links=[...document.querySelectorAll('.hm-progress a')];
  const update=()=>{let active=0,best=1e9;sections.forEach((s,i)=>{const d=Math.abs(s.getBoundingClientRect().top-innerHeight*.33);if(d<best){best=d;active=i}});links.forEach((l,i)=>l.classList.toggle('is-active',i===active))};
  addEventListener('scroll',()=>requestAnimationFrame(update),{passive:true});
  update();

  const flowScript=document.createElement('script');
  flowScript.src='./himart-flow-line-sync-v1.js?v=ca60638';
  document.body.appendChild(flowScript);
})();