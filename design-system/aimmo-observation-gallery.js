(() => {
  'use strict';

  const root = document.querySelector('body.aimmo-system-page #data .aimmo-evidence-gallery');
  if (!root) return;

  const cards = [...root.querySelectorAll('.aimmo-evidence-card')];
  if (cards.length < 3) return;

  const sequences = [
    [
      './assets/image/aimmo-system/aimmo_system_01_01.png',
      './assets/image/aimmo-system/aimmo_system_01_02.png',
      './assets/image/aimmo-system/aimmo_system_01_03.png',
      './assets/image/aimmo-system/aimmo_system_01_04.png'
    ],
    [
      './assets/image/aimmo-system/aimmo_system_02_01.png',
      './assets/image/aimmo-system/aimmo_system_02_02.png',
      './assets/image/aimmo-system/aimmo_system_02_03.png'
    ],
    [
      './assets/image/aimmo-system/aimmo_system_03_01.png',
      './assets/image/aimmo-system/aimmo_system_03_02.png',
      './assets/image/aimmo-system/aimmo_system_03_03.png'
    ]
  ];

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const FRAME_MS = 1800;
  const FADE_MS = reduced ? 0 : 240;

  const preload = src => new Promise(resolve => {
    const probe = new Image();
    probe.onload = () => resolve(src);
    probe.onerror = () => resolve(null);
    probe.src = src;
  });

  const mountSequence = async (card, requested) => {
    const image = card?.querySelector('img');
    if (!image || !requested?.length) return;

    const loaded = (await Promise.all(requested.map(preload))).filter(Boolean);
    if (!loaded.length) return; // Keep the authored JPG fallback when the sequence assets are absent.

    let index = 0;
    let timer = 0;
    let visible = true;
    let changing = false;

    const swap = src => {
      if (changing) return;
      changing = true;
      if (FADE_MS) image.classList.add('is-sequence-changing');
      window.setTimeout(() => {
        image.src = src;
        image.onload = () => {
          image.classList.remove('is-sequence-changing');
          changing = false;
        };
        if (image.complete) {
          image.classList.remove('is-sequence-changing');
          changing = false;
        }
      }, FADE_MS ? Math.round(FADE_MS * .55) : 0);
    };

    swap(loaded[0]);
    if (reduced || loaded.length < 2) return;

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = 0;
    };
    const start = () => {
      if (timer || !visible || document.hidden) return;
      timer = window.setInterval(() => {
        index = (index + 1) % loaded.length;
        swap(loaded[index]);
      }, FRAME_MS);
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        visible = Boolean(entries[0]?.isIntersecting);
        if (visible) start(); else stop();
      }, {threshold:.08});
      observer.observe(card);
    } else {
      start();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });
  };

  cards.slice(0,3).forEach((card,index) => mountSequence(card,sequences[index]));
})();
