(() => {
  'use strict';

  const body = document.body;
  if (!body?.classList.contains('contact-page-body')) return;

  const hero = document.querySelector('.contact-hero');
  const title = document.querySelector('.contact-page-title');
  const revealItems = [...document.querySelectorAll('.contact-intro,.contact-row')];
  if (!hero || !title) return;

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  body.classList.add('contact-motion-ready');

  const updateTitle = () => {
    const range = Math.max(1, Math.min(520, hero.offsetHeight * .55));
    const progress = reduced ? (window.scrollY > 32 ? 1 : 0) : clamp(window.scrollY / range, 0, 1);
    const startSize = clamp(window.innerWidth * .09, 72, 160);
    const endSize = 32;
    const startTop = window.innerHeight * .5;
    const endTop = window.innerWidth <= 780 ? 24 : 32;
    const size = startSize + (endSize - startSize) * progress;
    const top = startTop + (endTop - startTop) * progress;
    const translate = -50 * (1 - progress);
    const leading = .8 + (.2 * progress);

    title.style.setProperty('--contact-title-size', size.toFixed(2) + 'px');
    title.style.setProperty('--contact-title-top', top.toFixed(2) + 'px');
    title.style.setProperty('--contact-title-translate', translate.toFixed(2) + '%');
    title.style.setProperty('--contact-title-leading', leading.toFixed(3));
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

  if (reduced || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('is-contact-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-contact-visible');
      currentObserver.unobserve(entry.target);
    });
  }, {
    threshold: .14,
    rootMargin: '0px 0px -8% 0px'
  });

  revealItems.forEach(item => observer.observe(item));
})();
