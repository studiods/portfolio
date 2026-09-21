(() => {
  'use strict';

  const body = document.body;
  if (!body?.classList.contains('contact-page-body')) return;

  const hero = document.querySelector('.contact-hero');
  const title = document.querySelector('.contact-page-title');
  const revealItems = [...document.querySelectorAll('.contact-row')];
  if (!hero || !title) return;

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  body.classList.add('contact-motion-ready');

  const updateTitle = () => {
    const range = Math.max(1, Math.min(520, hero.offsetHeight * .55));
    const progress = reduced ? (window.scrollY > 32 ? 1 : 0) : clamp(window.scrollY / range, 0, 1);
    const startSize = clamp(window.innerWidth * .09, 72, 160);
    const endSize = 32;
    const size = startSize + (endSize - startSize) * progress;

    title.style.setProperty('--contact-title-size', size.toFixed(2) + 'px');
    body.classList.toggle('contact-title-compact', progress >= .985);
  };

  let raf = 0;
  const requestUpdate = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      updateTitle();
    });
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  updateTitle();

  const revealDelay = 1000;
  window.setTimeout(() => {
    revealItems.forEach(item => item.classList.add('is-contact-visible'));
  }, revealDelay);
})();
