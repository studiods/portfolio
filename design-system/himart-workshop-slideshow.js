/* HIMART WORKSHOP SLIDESHOW
   Shared by himart-team.html hero and Works project card.
   Plays himart_ws_01.png ~ himart_ws_06.png every 3 seconds with a soft dissolve.
   Visibility/autoplay lifecycle is owned by design-system/gallery-runtime.js. */
(() => {
  'use strict';

  const runtime = window.HMDSGalleryRuntime;
  const reducedMotion = runtime?.reducedMotion ?? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const DEFAULT_INTERVAL = 3000;
  const DEFAULT_FRAMES = 6;
  const BASE_PATH = './assets/image/himart-workshop/';

  const registerVisibilityFallback = (root, callback) => {
    let inView = false;
    const update = value => {
      inView = Boolean(value);
      callback(inView && !document.hidden && !reducedMotion);
    };
    let observer = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        const entry = entries[0];
        update(Boolean(entry?.isIntersecting && entry.intersectionRatio >= .12));
      }, { threshold:[0,.12,.25,.5,1] });
      observer.observe(root);
    } else update(true);
    const onVisibility = () => callback(inView && !document.hidden && !reducedMotion);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  };

  const mount = (root) => {
    if (!root || root.dataset.hmWorkshopSlideshowMounted === 'true') return;
    root.dataset.himartWorkshopSlideshow = '';
    root.dataset.hmWorkshopSlideshowMounted = 'true';

    const frameCount = Math.max(1, Number(root.dataset.hmWorkshopFrames || DEFAULT_FRAMES));
    const interval = Math.max(500, Number(root.dataset.hmWorkshopInterval || DEFAULT_INTERVAL));
    const sources = Array.from({ length:frameCount }, (_, index) =>
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
    let autoActive = false;
    const loaded = new Set();

    const setSource = (layer, src) => {
      if (layer.dataset.hmWsSource === src) return;
      layer.dataset.hmWsSource = src;
      layer.style.backgroundImage = `url("${src}")`;
      loaded.add(src);
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

    const stop = () => {
      if (!timer) return;
      window.clearInterval(timer);
      timer = 0;
    };

    const start = () => {
      stop();
      if (!autoActive || reducedMotion || sources.length < 2) return;
      /* Do not reset index or reload existing frames on re-entry. Browser cache and the
         two retained layers make resume cheaper and prevent a visible flash. */
      timer = window.setInterval(advance, interval);
    };

    const setAutoActive = active => {
      autoActive = Boolean(active);
      if (autoActive) start();
      else stop();
    };

    if (runtime) runtime.register(root, setAutoActive);
    else registerVisibilityFallback(root, setAutoActive);
  };

  const init = () => {
    const targets = new Set([
      ...document.querySelectorAll('[data-himart-workshop-slideshow]'),
      ...document.querySelectorAll('.himart-team-page .team-hero'),
      ...document.querySelectorAll('.works-page-body #works-project-6 .works-card-media')
    ]);
    targets.forEach(mount);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
