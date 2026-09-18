(() => {
  'use strict';

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const referenceBars = [...document.querySelectorAll('.trenbe-ut-page #brand .aimmo-reference-bars')];

  if (reduced) {
    referenceBars.forEach(chart => chart.classList.add('is-bars-focused'));
  } else if ('IntersectionObserver' in window) {
    const barObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.offsetParent !== null) {
          entry.target.classList.add('is-bars-focused');
        }
      });
    }, { threshold:.20, rootMargin:'0px 0px -5% 0px' });
    referenceBars.forEach(chart => barObserver.observe(chart));
  } else {
    referenceBars.forEach(chart => chart.classList.add('is-bars-focused'));
  }
})();