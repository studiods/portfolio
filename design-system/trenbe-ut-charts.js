(() => {
  'use strict';

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const charts = [...document.querySelectorAll(
    '.trenbe-ut-page #brand .trenbe-luxury-time-table, ' +
    '.trenbe-ut-page #brand .aimmo-impact-chart, ' +
    '.trenbe-ut-page #data .trenbe-age-chart'
  )];

  if (!charts.length) return;

  const activate = chart => chart.classList.add('is-bars-focused');

  if (reduced || !('IntersectionObserver' in window)) {
    charts.forEach(activate);
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.target.offsetParent === null) return;
      activate(entry.target);
      observer.unobserve(entry.target);
    });
  }, {
    threshold: .20,
    rootMargin: '0px 0px -5% 0px'
  });

  charts.forEach(chart => observer.observe(chart));
})();
