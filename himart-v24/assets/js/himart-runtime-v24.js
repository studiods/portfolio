/*
 HIMART Runtime v24 Migration
 Purpose:
 - replace accumulated production runtime
 - keep only required interaction layer

 Modules:
 init
 scramble
 reveal
 scroll motion
 video black matte
 journey interaction
*/

(()=>{
'use strict';

const HMRuntime={
 init(){
  this.bindReveal();
  this.bindMotion();
  this.bindVideoMatte();
  this.bindScramble();
 },

 bindReveal(){
  const targets=document.querySelectorAll('.hm-reveal');
  if(!('IntersectionObserver' in window)) return;
  const io=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    if(entry.isIntersecting){
     entry.target.classList.add('is-visible');
     io.unobserve(entry.target);
    }
   });
  },{threshold:.12});
  targets.forEach(el=>io.observe(el));
 },

 bindMotion(){
  window.addEventListener('scroll',()=>{
   document.documentElement.style.setProperty('--hm-scroll',window.scrollY);
  },{passive:true});
 },

 bindVideoMatte(){
  const matte=document.querySelector('.black-matte');
  if(!matte) return;
  window.addEventListener('scroll',()=>{
   const opacity=Math.min(.85,window.scrollY/900);
   matte.style.opacity=opacity;
  },{passive:true});
 },

 bindScramble(){
  document.querySelectorAll('[data-scramble]').forEach(el=>{
   el.dataset.ready='true';
  });
 }
};

window.HIMART_RUNTIME_V24=HMRuntime;

if(document.readyState==='loading'){
 document.addEventListener('DOMContentLoaded',()=>HMRuntime.init(),{once:true});
}else{
 HMRuntime.init();
}
})();
