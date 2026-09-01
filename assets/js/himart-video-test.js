(()=>{'use strict';
document.body.classList.add('himart-video-test-page');
const stage=document.querySelector('.hm-video-hero-stage');
const fixed=document.getElementById('hmVideoFixed');
const video=document.getElementById('hmHeroVideo');
const brand=document.getElementById('brand');
const title=document.querySelector('.hm-video-copy .hm-title');
if(fixed&&fixed.parentElement!==document.body)document.body.insertBefore(fixed,document.body.firstChild);
const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
const smooth=t=>t*t*(3-2*t);
function randomReveal(el){if(!el)return;const parts=[...el.querySelectorAll('span')];const originals=parts.map(p=>p.textContent);const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';let frame=0;const total=34;const timer=setInterval(()=>{const progress=frame/total;parts.forEach((part,i)=>{const text=originals[i];let index=0;part.textContent=[...text].map(c=>{if(c===' '){index++;return ' ';}const keep=index<Math.floor(text.length*progress);index++;return keep?c:chars[Math.floor(Math.random()*chars.length)];}).join('');});frame++;if(frame>total){clearInterval(timer);parts.forEach((part,i)=>part.textContent=originals[i]);}},45);}
const revealAtMiddle=()=>{if(!brand)return;brand.querySelectorAll('.hm-reveal:not(.is-in)').forEach(el=>{const r=el.getBoundingClientRect();if(r.top<=innerHeight*.60&&r.bottom>=innerHeight*.40)el.classList.add('is-in');});};
let raf=0;
const update=()=>{raf=0;if(!stage||!fixed)return;const progress=clamp(window.scrollY/Math.max(1,innerHeight*.8));const blackout=clamp(.85*(1-Math.pow(1-progress,4)));fixed.style.setProperty('--hm-video-blackout',blackout.toFixed(4));fixed.style.setProperty('--hm-frame-opacity',(1-blackout).toFixed(4));revealAtMiddle();};
const requestUpdate=()=>{if(!raf)raf=requestAnimationFrame(update);};
addEventListener('scroll',requestUpdate,{passive:true});
addEventListener('resize',requestUpdate,{passive:true});
if(brand&&'MutationObserver'in window)new MutationObserver(()=>{revealAtMiddle();requestUpdate();}).observe(brand,{childList:true,subtree:true});
if(video){video.muted=true;video.loop=true;video.playsInline=true;video.play().catch(()=>{});}
window.addEventListener('load',()=>randomReveal(title));
revealAtMiddle();update();
})();