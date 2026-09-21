(() => {
  'use strict';

  const body = document.body;
  if (!body?.classList.contains('contact-page-body')) return;

  const title = document.querySelector('.contact-page-title');
  const details = document.querySelector('.contact-details');
  const revealItems = [...document.querySelectorAll('.contact-row')];
  if (!title || !details) return;

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const revealDelay = 2000;
  const titleDuration = 1500;
  const easeInCubic = progress => progress * progress * progress;

  body.classList.add('contact-motion-ready');

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  const preventScroll = event => event.preventDefault();
  const preventScrollKeys = event => {
    if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) {
      event.preventDefault();
    }
  };

  window.addEventListener('wheel', preventScroll, { passive:false });
  window.addEventListener('touchmove', preventScroll, { passive:false });
  window.addEventListener('keydown', preventScrollKeys);

  const setTitleSize = progress => {
    const startSize = clamp(window.innerWidth * .09, 72, 160);
    const endSize = 32;
    const size = startSize + ((endSize - startSize) * progress);
    title.style.setProperty('--contact-title-size', size.toFixed(2) + 'px');
    body.classList.toggle('contact-title-compact', progress >= .985);
  };

  const animateTitleCompact = () => {
    if (reduced) {
      setTitleSize(1);
      return;
    }

    const startedAt = performance.now();
    const step = now => {
      const progress = clamp((now - startedAt) / titleDuration, 0, 1);
      setTitleSize(easeInCubic(progress));
      if (progress < 1) requestAnimationFrame(step);
      else setTitleSize(1);
    };
    requestAnimationFrame(step);
  };

  const revealScene = () => {
    details.classList.add('is-contact-visible');
    requestAnimationFrame(() => {
      revealItems.forEach(item => item.classList.add('is-contact-visible'));
      animateTitleCompact();
    });
  };

  let revealTimer = 0;
  let scrambleObserver = null;

  const scheduleReveal = () => {
    if (revealTimer) return;
    scrambleObserver?.disconnect();
    scrambleObserver = null;
    revealTimer = window.setTimeout(revealScene, revealDelay);
  };

  const resetTitleForResize = () => {
    if (body.classList.contains('contact-title-compact')) setTitleSize(1);
    else setTitleSize(0);
  };
  window.addEventListener('resize', resetTitleForResize);
  setTitleSize(0);

  if (reduced) {
    scheduleReveal();
  } else if (title.getAttribute('data-hm-scramble-complete') === 'true') {
    scheduleReveal();
  } else if ('MutationObserver' in window) {
    scrambleObserver = new MutationObserver(() => {
      if (title.getAttribute('data-hm-scramble-complete') === 'true') scheduleReveal();
    });
    scrambleObserver.observe(title, {
      attributes:true,
      attributeFilter:['data-hm-scramble-complete']
    });
  }
})();