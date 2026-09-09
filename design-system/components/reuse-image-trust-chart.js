(() => {
  const charts = [...document.querySelectorAll('.reuse-image-trust-chart')];
  if (!charts.length) return;
  const activate = chart => chart.querySelectorAll('.reuse-image-trust-chart__segment').forEach((segment,index) => {
    window.setTimeout(() => segment.classList.add('is-visible'), index * 120);
  });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) charts.forEach(activate);
  else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { activate(entry.target); observer.unobserve(entry.target); }
    }), {threshold:.35});
    charts.forEach(chart => observer.observe(chart));
  } else charts.forEach(activate);
})();