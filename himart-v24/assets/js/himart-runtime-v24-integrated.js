(()=>{
'use strict';

/**
 * HIMART Runtime v24 Integrated
 *
 * Module order:
 * 1. content-v24
 * 2. motion-v24
 * 3. runtime boot
 *
 * Removed:
 * - legacy refine loader
 * - rollback loader
 * - duplicate mount observer
 */

function initHimartRuntime(){
  const root=document.getElementById('live-main');
  if(!root) return;

  document.documentElement.dataset.himartRuntime='v24';

  if(window.HIMART_CONTENT_V24?.init){
    window.HIMART_CONTENT_V24.init();
  }

  if(window.HIMART_MOTION_V24?.init){
    window.HIMART_MOTION_V24.init();
  }

  console.log('[HIMART] v24 integrated runtime ready');
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initHimartRuntime,{once:true});
}else{
  initHimartRuntime();
}
})();
