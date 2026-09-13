(()=>{
  'use strict';

  /* Explicit editorial image replacements.
     Keep this mapping outside the gallery source resolver so a replaced asset cannot
     silently fall back to an older cached/corrupt raster. The page number is already
     authored on each slide via data-wa-source-page. */
  const replacements={
    29:'./assets/image/work-archive/archive-aimmo-p029-r3.avif',
    33:'./assets/image/work-archive/archive-aimmo-p033-r3.avif',
    36:'./assets/image/work-archive/archive-trenbe-p036-r3.avif',
    37:'./assets/image/work-archive/archive-trenbe-p037-r3.avif',
    38:'./assets/image/work-archive/archive-trenbe-p038-r3.avif'
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
