/* Legacy HIMART inertia entrypoint.
   Kept only for backward compatibility; the canonical behavior now lives in
   design-system/inertia-scroll.js and is bootstrapped globally by navigation.js. */
(() => {
  'use strict';
  if (window.__portfolioInertiaScrollMounted) return;
  if (document.querySelector('script[data-portfolio-inertia]')) return;
  const script = document.createElement('script');
  script.src = './design-system/inertia-scroll.js?v=20260913-2';
  script.async = false;
  script.dataset.portfolioInertia = 'true';
  (document.head || document.documentElement).appendChild(script);
})();
