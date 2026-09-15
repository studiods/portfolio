(()=>{
  'use strict';

  const mq=window.matchMedia('(max-width:780px)');

  const sync=()=>{
    document.querySelectorAll('body.work-archive-page [data-wa-company]').forEach(company=>{
      const gallery=company.querySelector('[data-wa-gallery]');
      const overlay=company.querySelector('[data-wa-gallery-copy]');
      if(!gallery||!overlay)return;

      if(mq.matches){
        if(overlay.parentElement===gallery){
          gallery.insertAdjacentElement('afterend',overlay);
        }
        overlay.classList.add('is-mobile-stacked');
      }else{
        if(overlay.parentElement!==gallery){
          const prev=gallery.querySelector('[data-reuse-gallery-prev]');
          if(prev)gallery.insertBefore(overlay,prev);
          else gallery.appendChild(overlay);
        }
        overlay.classList.remove('is-mobile-stacked');
      }
    });
  };

  const init=()=>{
    sync();
    mq.addEventListener?.('change',sync);
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
