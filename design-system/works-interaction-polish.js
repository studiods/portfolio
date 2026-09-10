/* WORKS interaction polish — image focus parity + project-menu reveal motion. */
(() => {
  'use strict';

  const body = document.body;
  if (!body.classList.contains('works-page-body')) return;

  const style = document.createElement('style');
  style.dataset.worksInteractionPolish = '1';
  style.textContent = `
body.works-page-body .works-card-media-link.has-visual.is-media-focused::after{
  background:rgba(0,0,0,0)!important;
}
body.works-page-body .works-project-menu{
  clip-path:inset(0 0 100% 0);
  transform:translateY(-10px);
  transform-origin:top center;
  opacity:0;
  visibility:hidden;
  pointer-events:none;
  transition:
    clip-path .36s cubic-bezier(.22,1,.36,1),
    transform .36s cubic-bezier(.22,1,.36,1),
    opacity .22s ease,
    visibility 0s linear .36s!important;
  will-change:clip-path,transform,opacity;
}
body.works-page-body .works-project-menu.is-open{
  clip-path:inset(0 0 0 0);
  transform:translateY(0);
  opacity:1;
  visibility:visible;
  pointer-events:auto;
  transition:
    clip-path .40s cubic-bezier(.22,1,.36,1),
    transform .40s cubic-bezier(.22,1,.36,1),
    opacity .22s ease,
    visibility 0s linear 0s!important;
}
@media(prefers-reduced-motion:reduce){
  body.works-page-body .works-project-menu{
    transition:none!important;
    transform:none!important;
  }
}
`;
  document.head.appendChild(style);

  const mediaLinks = [...document.querySelectorAll('.works-card-media-link.has-visual')];
  if (!mediaLinks.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateFocusedVisual = () => {
    if (reduced) {
      mediaLinks.forEach(link => link.classList.remove('is-media-focused'));
      return;
    }

    const viewportCenter = window.innerHeight * .5;
    const focusTolerance = window.innerHeight * .15;
    let focusedLink = null;
    let focusedDistance = Infinity;

    mediaLinks.forEach(link => {
      const media = link.querySelector('.works-card-media') || link;
      const rect = media.getBoundingClientRect();
      const center = rect.top + rect.height * .5;
      const distance = Math.abs(center - viewportCenter);
      const visible = rect.bottom > 0 && rect.top < window.innerHeight;

      if (visible && distance <= focusTolerance && distance < focusedDistance) {
        focusedLink = link;
        focusedDistance = distance;
      }
    });

    mediaLinks.forEach(link => {
      link.classList.toggle('is-media-focused', link === focusedLink);
    });
  };

  let raf = 0;
  const requestUpdate = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      updateFocusedVisual();
    });
  };

  window.addEventListener('scroll', requestUpdate, {passive:true});
  window.addEventListener('resize', requestUpdate);
  window.addEventListener('pageshow', requestUpdate);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) mediaLinks.forEach(link => link.classList.remove('is-media-focused'));
    else requestUpdate();
  });

  updateFocusedVisual();
})();
