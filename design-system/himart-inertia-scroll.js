/* Legacy HIMART inertia entrypoint.
   Kept only for backward compatibility with historical pages.
   Production pages use the canonical design-system/inertia-scroll.js bootstrap
   owned globally by navigation.js. */
(() => {
  'use strict';
  if (window.__portfolioInertiaScrollMounted) return;
  if (document.querySelector('script[data-portfolio-inertia]')) return;
  const script = document.createElement('script');
  script.src = './design-system/inertia-scroll.js?v=20260928-1';
  script.async = false;
  script.dataset.portfolioInertia = 'true';
  (document.head || document.documentElement).appendChild(script);
})();
