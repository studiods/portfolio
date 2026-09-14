/* HIMART TEAM — exact workshop card geometry.
   Desktop contract:
   - card height = 40% of rendered image height
   - one third of the card exits below the image
   - two thirds remain over the image
   Uses measured pixels to avoid percentage/aspect-ratio intrinsic sizing differences. */
(function(){
  'use strict';

  const BREAKPOINT = 768;
  const visualSelector = '.himart-team-page .team-workshop-visual';

  function clearDesktopGeometry(visual){
    const cards = visual.querySelector('.team-workshop-visual__cards');
    if (!cards) return;
    cards.style.removeProperty('height');
    cards.style.removeProperty('min-height');
    cards.style.removeProperty('max-height');
    cards.style.removeProperty('aspect-ratio');
    cards.style.removeProperty('transform');
    visual.style.removeProperty('padding-bottom');
  }

  function syncVisual(visual){
    const imageBox = visual.querySelector('.team-workshop-visual__image');
    const cards = imageBox && imageBox.querySelector('.team-workshop-visual__cards');
    if (!imageBox || !cards) return;

    if (window.innerWidth < BREAKPOINT){
      clearDesktopGeometry(visual);
      return;
    }

    const imageHeight = imageBox.getBoundingClientRect().height;
    if (!Number.isFinite(imageHeight) || imageHeight <= 0) return;

    const cardHeight = imageHeight * 0.4;
    const outside = cardHeight / 3;

    cards.style.setProperty('height', cardHeight.toFixed(3) + 'px', 'important');
    cards.style.setProperty('min-height', cardHeight.toFixed(3) + 'px', 'important');
    cards.style.setProperty('max-height', cardHeight.toFixed(3) + 'px', 'important');
    cards.style.setProperty('aspect-ratio', 'auto', 'important');
    cards.style.setProperty('transform', 'translateY(' + outside.toFixed(3) + 'px)', 'important');
    visual.style.setProperty('padding-bottom', outside.toFixed(3) + 'px', 'important');

    cards.dataset.imageHeight = imageHeight.toFixed(3);
    cards.dataset.cardHeight = cardHeight.toFixed(3);
    cards.dataset.cardOutside = outside.toFixed(3);
  }

  function syncAll(){
    document.querySelectorAll(visualSelector).forEach(syncVisual);
  }

  function boot(){
    const visuals = Array.from(document.querySelectorAll(visualSelector));
    if (!visuals.length) return;

    const resizeObserver = 'ResizeObserver' in window
      ? new ResizeObserver(entries => {
          entries.forEach(entry => {
            const visual = entry.target.closest('.team-workshop-visual');
            if (visual) syncVisual(visual);
          });
        })
      : null;

    visuals.forEach(visual => {
      const imageBox = visual.querySelector('.team-workshop-visual__image');
      if (imageBox && resizeObserver) resizeObserver.observe(imageBox);
      const img = imageBox && imageBox.querySelector('img');
      if (img && !img.complete) img.addEventListener('load', () => syncVisual(visual), { once:true });
      syncVisual(visual);
    });

    let raf = 0;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncAll);
    }, { passive:true });

    requestAnimationFrame(() => requestAnimationFrame(syncAll));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncAll).catch(() => {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once:true });
  } else {
    boot();
  }
})();