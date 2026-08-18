(() => {
  'use strict';

  const sources = [
    './about-ascii-photo-meta.js?v=1',
    './about-ascii-photo-frame-1.js?v=1',
    './about-ascii-photo-frame-2.js?v=1',
    './about-ascii-photo-frame-3.js?v=1',
    './about-ascii-photo-frame-4.js?v=1',
    './about-ascii-photo-frame-5.js?v=1',
    './about-ascii-photo-frame-6.js?v=1',
    './about-ascii-photo-frame-7.js?v=1',
    './about-ascii-photo.js?v=1'
  ];

  const load = src => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });

  (async () => {
    for (const src of sources) await load(src);
  })().catch(error => {
    console.error('About full-frame ASCII loader failed.', error);
  });
})();
