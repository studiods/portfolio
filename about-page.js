(() => {
  'use strict';

  const targets = Array.from(document.querySelectorAll('.reveal-item, .reveal-line'));
  const reveal = (el) => el.classList.add('is-visible');
  const revealAll = () => targets.forEach(reveal);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealAll();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.01,
    rootMargin: '0px 0px -4% 0px'
  });

  targets.forEach((el) => observer.observe(el));

  /*
    Directly reveal anything already inside the viewport on first paint.
    This removes the old dependency on a large parent block reaching a 16%
    intersection ratio before its children were allowed to appear.
  */
  requestAnimationFrame(() => {
    const visibleBottom = window.innerHeight * 0.96;
    targets.forEach((el) => {
      if (el.classList.contains('is-visible')) return;
      const rect = el.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < visibleBottom) {
        reveal(el);
        observer.unobserve(el);
      }
    });
  });
})();
