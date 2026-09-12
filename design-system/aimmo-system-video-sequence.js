(() => {
  'use strict';

  /* Legacy compatibility entrypoint.
     The old controller contained its own fade-to-black and delayed source swap.
     Sequence playback is now owned exclusively by aimmo-hero-video-sequence.js. */
  const hero = document.querySelector('body.aimmo-system-page #top[data-hm-hero]');
  if (!hero) return;
  if (hero.querySelector('[data-hm-sequence-managed="1"]')) return;
  if (!hero.querySelector('[data-aimmo-video-sequence]')) return;
  if (document.querySelector('script[data-aimmo-canonical-sequence-loader]')) return;

  const script = document.createElement('script');
  script.src = './design-system/aimmo-hero-video-sequence.js?v=20260912-2';
  script.async = false;
  script.dataset.aimmoCanonicalSequenceLoader = '1';
  document.head.appendChild(script);
})();
