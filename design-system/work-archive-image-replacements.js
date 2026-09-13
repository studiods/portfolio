(()=>{
  'use strict';

  /* Explicit editorial image replacements.
     Keep this mapping outside the gallery source resolver so a replaced asset cannot
     silently fall back to an older cached/corrupt raster. The page number is already
     authored on each slide via data-wa-source-page. */
  const replacements={
    29:'./assets/image/work-archive/archive-aimmo-p029-v5.webp',
    33:'./assets/image/work-archive/archive-aimmo-p033-v5.webp',
    36:'./assets/image/work-archive/archive-trenbe-p036-v6.webp',
    37:'./assets/image/work-archive/archive-trenbe-p037-v5.webp',
    38:'./assets/image/work-archive/archive-trenbe-p038-v5.webp'
  };

  const apply=()=>{
    Object.entries(replacements).forEach(([page,src])=>{
      const slide=document.querySelector(`.reuse-production-gallery__slide[data-wa-source-page="${page}"]`);
      const img=slide?.querySelector('img');
      if(!img)return;
      img.removeAttribute('srcset');
      img.src=src;
      img.dataset.waReplacement='true';
    });
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
})();
