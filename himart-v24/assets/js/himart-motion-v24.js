(()=>{
'use strict';

/*
 HIMART Motion Runtime v24

 Keep:
 - scroll reveal
 - section transition
 - video black matte control

 Remove:
 - legacy mutation patch
 - duplicate observer chain
*/

window.HIMART_MOTION_V24={
 reveal(){
   document.querySelectorAll('.hm-reveal').forEach(el=>{
     el.classList.add('is-ready');
   });
 },
 init(){
   this.reveal();
 }
};

})();