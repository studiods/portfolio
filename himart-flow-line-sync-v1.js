(()=>{'use strict';
const groups=()=>[...document.querySelectorAll('.flow-group,.reuse-journey-block')];
const targetFor=group=>{if(group.dataset.lineTarget)return Math.max(1,parseInt(group.dataset.lineTarget,10)||1);if(group.classList.contains('reuse-journey-block')){const blocks=[...group.parentElement.querySelectorAll(':scope > .reuse-journey-block')],i=blocks.indexOf(group);return i%2===0?3:2}const siblings=[...group.parentElement.querySelectorAll(':scope > .flow-group')],i=siblings.indexOf(group);return i===0?3:2};
const sync=group=>{const cards=[...group.querySelectorAll('.flow-node')],target=cards[targetFor(group)-1],first=cards[0];if(!first||!target)return;const g=group.getBoundingClientRect(),f=first.getBoundingClientRect(),t=target.getBoundingClientRect();const left=Math.max(0,f.left-g.left),width=Math.max(0,t.right-f.left);group.style.setProperty('--line-left',`${left}px`,'important');group.style.setProperty('--line-width',`${width}px`,'important');group.style.setProperty('--flow-line-left',`${left}px`,'important');group.style.setProperty('--flow-line-width',`${width}px`,'important')};
const syncAll=()=>groups().forEach(sync);let raf=0;const queue=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(syncAll)};

const tuneTestPage=()=>{
  if(!document.body.classList.contains('himart-test-page'))return;
  const charts=[...document.querySelectorAll('.pie,.chart-wrap,.search-slope,.hbars,.landing-chart')];
  charts.forEach(el=>el.classList.add('chart-motion'));
  const activate=el=>{if(!el.classList.contains('is-chart-active'))el.classList.add('is-chart-active')};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){charts.forEach(activate);return}
  const inViewport=el=>{const r=el.getBoundingClientRect();return r.top<innerHeight*.94&&r.bottom>innerHeight*.06};
  charts.filter(inViewport).forEach((el,i)=>setTimeout(()=>activate(el),90+i*45));
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){activate(entry.target);io.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -4% 0px'});
  charts.forEach(el=>io.observe(el));
  /* Fallback: charts must never remain invisible if layout/observer timing changes. */
  setTimeout(()=>charts.filter(inViewport).forEach(activate),700);
};

const boot=()=>{queue();tuneTestPage()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
addEventListener('load',()=>{queue();tuneTestPage()},{once:true});addEventListener('resize',queue,{passive:true});
if('ResizeObserver'in window){const ro=new ResizeObserver(queue);groups().forEach(g=>ro.observe(g));document.querySelectorAll('.flow-row').forEach(r=>ro.observe(r))}
if(document.fonts?.ready)document.fonts.ready.then(queue).catch(()=>{});
})();