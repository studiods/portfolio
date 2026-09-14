/* HIMART WORKSHOP SLIDESHOW
   Shared by himart-team.html hero and Works project card.
   Plays himart_ws_01.png ~ himart_ws_06.png every 3 seconds with a soft dissolve.
   Missing files are intentionally left blank rather than replaced or skipped. */
(() => {
  'use strict';

  const DEFAULT_INTERVAL = 3000;
  const DEFAULT_FRAMES = 6;
  const BASE_PATH = './assets/image/himart-workshop/';

  const mount = (root) => {
    if (!root || root.dataset.hmWorkshopSlideshowMounted === 'true') return;
    root.dataset.hmWorkshopSlideshowMounted = 'true';

    const frameCount = Math.max(1, Number(root.dataset.hmWorkshopFrames || DEFAULT_FRAMES));
    const interval = Math.max(500, Number(root.dataset.hmWorkshopInterval || DEFAULT_INTERVAL));
    const sources = Array.from({ length: frameCount }, (_, index) =>
      `${BASE_PATH}himart_ws_${String(index + 1).padStart(2, '0')}.png`
    );

    const layers = [0, 1].map(() => {
      const layer = document.createElement('div');
      layer.className = 'hm-ws-slideshow__frame';
      layer.setAttribute('aria-hidden', 'true');
      root.appendChild(layer);
      return layer;
    });

    let index = 0;
    let activeLayer = 0;
    let timer = 0;

    const setSource = (layer, src) => {
      layer.style.backgroundImage = `url("${src}")`;
    };

    setSource(layers[0], sources[0]);
    layers[0].classList.add('is-active');

    const advance = () => {
      index = (index + 1) % sources.length;
      const nextLayer = activeLayer === 0 ? 1 : 0;
      const incoming = layers[nextLayer];
      const outgoing = layers[activeLayer];

      setSource(incoming, sources[index]);
      incoming.classList.remove('is-active');
      void incoming.offsetWidth;
      incoming.classList.add('is-active');
      outgoing.classList.remove('is-active');
      activeLayer = nextLayer;
    };

    const start = () => {
      if (timer || sources.length < 2) return;
      timer = window.setInterval(advance, interval);
    };

    const stop = () => {
      if (!timer) return;
      window.clearInterval(timer);
      timer = 0;
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });

    start();
  };

  const init = () => {
    document.querySelectorAll('[data-himart-workshop-slideshow]').forEach(mount);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
