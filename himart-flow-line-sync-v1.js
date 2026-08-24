(()=>{'use strict';
const style=document.createElement('style');
style.textContent=`
@media (min-width:781px) and (max-width:1100px){.flow-row.row4{display:grid!important;grid-template-columns:minmax(0,1fr) 32px minmax(0,1fr) 32px minmax(0,1fr) 32px minmax(0,1fr)!important;justify-content:stretch!important}.flow-row.row4 .flow-node{width:100%!important}.flow-row.row4 .flow-arrow{width:32px!important}}

/* 2026-08-24 test-only refinements */
.himart-test-page .hm-meta{grid-template-columns:repeat(4,minmax(0,1fr))!important}

/* Temporarily expose every common 60% copy treatment at 30% for visual inspection. */
.himart-test-page .hm-lead,
.himart-test-page .hm-section-desc,
.himart-test-page .hm-subcopy,
.himart-test-page .data-card .desc,
.himart-test-page .legend-row,
.himart-test-page .chart-legend,
.himart-test-page .hbar span,
.himart-test-page .stacklabels div,
.himart-test-page .pdp-col span,
.himart-test-page .flow-head p,
.himart-test-page .flow-node p,
.himart-test-page .role-card p,
.himart-test-page .prototype-case-copy p,
.himart-test-page .data-bridge article p,
.himart-test-page .sentiment-keywords,
.himart-test-page .conclusion-card p,
.himart-test-page .direction-card p,
.himart-test-page .ring-card p{color:rgba(255,255,255,.30)!important}
.himart-test-page .data-emphasis{color:#fff!important;opacity:1!important;font-weight:300!important}

/* Entry legend: keep percentage close to its label instead of pushing it to the far right. */
@media(min-width:781px){
  .himart-test-page .pie-layout .legend{width:auto!important;max-width:460px!important;justify-self:start!important}
  .himart-test-page .pie-layout .legend-row{grid-template-columns:12px minmax(230px,300px) 58px!important;width:max-content!important;max-width:100%!important;column-gap:12px!important}
  .himart-test-page .pie-layout .legend-row b{text-align:right!important}
}

/* Tighter title/copy rhythm in the two Journey subsections. */
.himart-test-page #journey .journey-signal-subsection .hm-subcopy,
.himart-test-page #journey .journey-redesign-subsection .hm-subcopy{margin-top:14px!important}

/* Reduce the gap between explanatory copy and the next graph/rule. */
.himart-test-page .data-card:has(.landing-stack) .landing-stack{margin-top:25px!important;min-height:0!important}
.himart-test-page .landing-chart{padding-top:14px!important}
.himart-test-page .data-card:has(.search-slope) .search-slope{margin-top:25px!important;min-height:0!important}
.himart-test-page .search-slope>div:not(.arrow-head){min-height:150px!important}
.himart-test-page .hbars{gap:14px!important}

/* Requested blue palette for the landing/PDP comparison. */
.himart-test-page .landing-chart .stackbar.signal-stack i:first-child{background:#0572CB!important}
.himart-test-page .pdp-col i:first-child::after{background:#0572CB!important}
.himart-test-page .pdp-col i:nth-child(2)::after{background:var(--hm-blue)!important}
.himart-test-page .landing-chart .chart-legend span:first-child i{background:#0572CB!important}
.himart-test-page .landing-chart .chart-legend span:nth-child(2) i{background:var(--hm-blue)!important}

/* Prototype proof: remove screenshots and use one consistent Galaxy S26 Ultra line frame. */
.himart-test-page .prototype-case{--device-h:620px;grid-template-columns:minmax(190px,.82fr) minmax(0,1.18fr)!important;gap:28px!important;align-items:start!important;padding-top:0!important;border-top:0!important}
.himart-test-page .prototype-case-visual{height:var(--device-h)!important;display:flex!important;align-items:stretch!important;justify-content:center!important;padding:0!important;background:transparent!important;border-radius:0!important;overflow:visible!important}
.himart-test-page .prototype-case-copy{height:var(--device-h)!important;display:flex!important;flex-direction:column!important;padding:0!important;align-self:start!important}
.himart-test-page .prototype-case-copy .hm-card-no{margin:0!important;line-height:1!important}
.himart-test-page .prototype-case-copy strong{margin-top:auto!important;color:#fff!important;opacity:1!important}
.himart-test-page .prototype-case-copy strong b{color:#fff!important;opacity:1!important}
.himart-test-page .galaxy-ultra-mockup{position:relative!important;height:100%!important;width:auto!important;aspect-ratio:9/19.5!important;border:1px solid rgba(255,255,255,.72)!important;border-radius:34px!important;padding:7px!important;background:transparent!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.05)!important}
.himart-test-page .galaxy-ultra-mockup::before{content:""!important;position:absolute!important;z-index:3!important;left:50%!important;top:12px!important;width:8px!important;height:8px!important;border-radius:50%!important;background:#050505!important;border:1px solid rgba(255,255,255,.48)!important;transform:translateX(-50%)!important}
.himart-test-page .galaxy-ultra-mockup::after{content:""!important;position:absolute!important;right:-3px!important;top:112px!important;width:2px!important;height:72px!important;border-radius:2px!important;background:rgba(255,255,255,.56)!important;box-shadow:0 88px 0 rgba(255,255,255,.40)!important}
.himart-test-page .galaxy-ultra-screen{width:100%!important;height:100%!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:28px!important;background:transparent!important;overflow:hidden!important}
.himart-test-page .galaxy-ultra-screen img{display:none!important}

/* Scroll-triggered chart motion. */
.himart-test-page .chart-motion{will-change:transform,opacity}
.himart-test-page .pie.chart-motion{clip-path:circle(0% at 50% 50%);transform:rotate(-14deg) scale(.94);opacity:.2;transition:clip-path 1.05s cubic-bezier(.2,.8,.2,1),transform 1.05s cubic-bezier(.2,.8,.2,1),opacity .55s ease}
.himart-test-page .pie.chart-motion.is-chart-active{clip-path:circle(75% at 50% 50%);transform:none;opacity:1}
.himart-test-page .chart-wrap.chart-motion::before{transform:scaleX(0);transform-origin:left center;opacity:.18;transition:transform 1.15s cubic-bezier(.2,.8,.2,1),opacity .4s ease}
.himart-test-page .chart-wrap.chart-motion.is-chart-active::before{transform:scaleX(1);opacity:1}
.himart-test-page .hbars.chart-motion .fill{transform:scaleX(0);transform-origin:left center;transition:transform .9s cubic-bezier(.2,.8,.2,1)}
.himart-test-page .hbars.chart-motion.is-chart-active .fill{transform:scaleX(1)}
.himart-test-page .hbars.chart-motion .hbar:nth-child(2) .fill{transition-delay:.08s}
.himart-test-page .hbars.chart-motion .hbar:nth-child(3) .fill{transition-delay:.16s}
.himart-test-page .hbars.chart-motion .hbar:nth-child(4) .fill{transition-delay:.24s}
.himart-test-page .hbars.chart-motion .hbar:nth-child(5) .fill{transition-delay:.32s}
.himart-test-page .hbars.chart-motion .hbar:nth-child(6) .fill{transition-delay:.4s}
.himart-test-page .search-slope.chart-motion strong,
.himart-test-page .search-slope.chart-motion .arrow-head{opacity:0;transform:translateY(22px);transition:opacity .65s ease,transform .8s cubic-bezier(.2,.8,.2,1)}
.himart-test-page .search-slope.chart-motion.is-chart-active strong,
.himart-test-page .search-slope.chart-motion.is-chart-active .arrow-head{opacity:1;transform:none}
.himart-test-page .search-slope.chart-motion>div:last-child strong{transition-delay:.14s}
.himart-test-page .landing-chart.chart-motion .stackbar i{transform:scaleX(0);transform-origin:left center;transition:transform .75s cubic-bezier(.2,.8,.2,1)}
.himart-test-page .landing-chart.chart-motion.is-chart-active .stackbar i{transform:scaleX(1)}
.himart-test-page .landing-chart.chart-motion .stackbar i:nth-child(2){transition-delay:.08s}.himart-test-page .landing-chart.chart-motion .stackbar i:nth-child(3){transition-delay:.16s}.himart-test-page .landing-chart.chart-motion .stackbar i:nth-child(4){transition-delay:.24s}.himart-test-page .landing-chart.chart-motion .stackbar i:nth-child(5){transition-delay:.32s}
.himart-test-page .landing-chart.chart-motion .pdp-col i::after{transform:scaleX(0);transform-origin:left center;transition:transform .8s cubic-bezier(.2,.8,.2,1)}
.himart-test-page .landing-chart.chart-motion.is-chart-active .pdp-col i::after{transform:scaleX(1)}
.himart-test-page .landing-chart.chart-motion .pdp-col:nth-child(2) i::after{transition-delay:.12s}.himart-test-page .landing-chart.chart-motion .pdp-col:nth-child(3) i::after{transition-delay:.24s}

@media(max-width:1100px){.himart-test-page .prototype-case{--device-h:560px}}
@media(max-width:780px){
  .himart-test-page .hm-meta{grid-template-columns:1fr 1fr!important}
  .himart-test-page .pie-layout .legend-row{grid-template-columns:10px 1fr auto!important;width:100%!important}
  .himart-test-page .search-slope>div:not(.arrow-head){min-height:120px!important}
  .himart-test-page .prototype-case{--device-h:640px;grid-template-columns:1fr!important;gap:32px!important}
  .himart-test-page .prototype-case-copy{height:auto!important;min-height:0!important}
  .himart-test-page .prototype-case-visual{height:var(--device-h)!important}
  .himart-test-page .galaxy-ultra-mockup{height:100%!important;max-width:78%!important}
}
`;
document.head.appendChild(style);

const groups=()=>[...document.querySelectorAll('.flow-group,.reuse-journey-block')];
const targetFor=group=>{if(group.dataset.lineTarget)return Math.max(1,parseInt(group.dataset.lineTarget,10)||1);if(group.classList.contains('reuse-journey-block')){const blocks=[...group.parentElement.querySelectorAll(':scope > .reuse-journey-block')],i=blocks.indexOf(group);return i%2===0?3:2}const siblings=[...group.parentElement.querySelectorAll(':scope > .flow-group')],i=siblings.indexOf(group);return i===0?3:2};
const sync=group=>{const cards=[...group.querySelectorAll('.flow-node')],target=cards[targetFor(group)-1],first=cards[0];if(!first||!target)return;const g=group.getBoundingClientRect(),f=first.getBoundingClientRect(),t=target.getBoundingClientRect();const left=Math.max(0,f.left-g.left),width=Math.max(0,t.right-f.left);group.style.setProperty('--line-left',`${left}px`,'important');group.style.setProperty('--line-width',`${width}px`,'important');group.style.setProperty('--flow-line-left',`${left}px`,'important');group.style.setProperty('--flow-line-width',`${width}px`,'important')};
const syncAll=()=>groups().forEach(sync);let raf=0;const queue=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(syncAll)};

const tuneTestPage=()=>{
  if(!document.body.classList.contains('himart-test-page'))return;

  /* Emphasis is visual only: remove semantic <strong> wrappers from data copy. */
  document.querySelectorAll('#data .data-card .desc strong').forEach(el=>{const span=document.createElement('span');span.className='data-emphasis';span.innerHTML=el.innerHTML;el.replaceWith(span)});

  /* Replace every prototype screenshot with the same line-only Galaxy S26 Ultra frame. */
  document.querySelectorAll('.prototype-case .prototype-case-visual').forEach(visual=>{visual.innerHTML='<div class="galaxy-ultra-mockup" aria-label="Galaxy S26 Ultra line frame"><div class="galaxy-ultra-screen"></div></div>'});

  /* Animate charts only when they become the focal content in the viewport. */
  const charts=[...document.querySelectorAll('.pie,.chart-wrap,.search-slope,.hbars,.landing-chart')];
  charts.forEach(el=>el.classList.add('chart-motion'));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){charts.forEach(el=>el.classList.add('is-chart-active'));return}
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-chart-active');io.unobserve(entry.target)}}),{threshold:.28,rootMargin:'0px 0px -12% 0px'});
  charts.forEach(el=>io.observe(el));
};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{queue();tuneTestPage()},{once:true});else{queue();tuneTestPage()}
addEventListener('load',queue,{once:true});addEventListener('resize',queue,{passive:true});
if('ResizeObserver'in window){const ro=new ResizeObserver(queue);groups().forEach(g=>ro.observe(g));document.querySelectorAll('.flow-row').forEach(r=>ro.observe(r))}
if(document.fonts?.ready)document.fonts.ready.then(queue).catch(()=>{});
})();