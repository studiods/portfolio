/*
  HIMART Wide Editorial adapter — TEST ONLY v5
  Waits until himart.html finishes its narrative runtime rewrite, then groups all
  chapter content after .hm-section-head into one right rail. This keeps the visual
  contract identical to the current REUSE wide test while avoiding brittle grid-row spans.

  v5 also owns the test-only boot lock. The fetched Himart document stays hidden until
  the runtime rewrite and rail grouping have completed, preventing raw-content / unstyled FOUC.
  Major-title line breaks remain exactly as authored by the current Himart runtime.
*/
(() => {
  'use strict';

  const isTargetPage = () =>
    document.body?.classList.contains('hm-wide-editorial-test') &&
    document.body?.classList.contains('hm-wide-himart-test');

  const releaseBootLock = () => {
    if (!document.body) return;
    document.body.classList.remove('hm-wide-booting');
    document.getElementById('hm-wide-boot-lock')?.remove();
  };

  const mount = () => {
    if (!isTargetPage()) return;
    if (window.__hmWideHimartAdapterMounted) {
      releaseBootLock();
      return;
    }

    const sections = [...document.querySelectorAll('#live-main > :is(#brand,#data,#journey,#direction).hm-section')];
    if (!sections.length) return;

    sections.forEach(section => {
      const wrap = section.querySelector(':scope > .hm-wrap');
      const head = wrap?.querySelector(':scope > .hm-section-head');
      if (!wrap || !head) return;

      let rail = wrap.querySelector(':scope > .hm-wide-right-rail');
      if (!rail) {
        rail = document.createElement('div');
        rail.className = 'hm-wide-right-rail';
        head.insertAdjacentElement('afterend', rail);
      }

      [...wrap.children]
        .filter(node => node !== head && node !== rail)
        .forEach(node => rail.appendChild(node));
    });

    window.__hmWideHimartAdapterMounted = true;
    window.__hmAnimationScan?.();
    window.dispatchEvent(new Event('resize'));

    /* Allow one paint-preparation frame after the final DOM grouping, then reveal. */
    requestAnimationFrame(() => requestAnimationFrame(releaseBootLock));
  };

  const ready = () => document.body?.classList.contains('himart-narrative-ready');

  const start = () => {
    if (!isTargetPage()) return;

    /* Never leave the page permanently hidden if a future runtime changes its ready contract. */
    window.setTimeout(releaseBootLock, 5000);

    if (ready()) {
      requestAnimationFrame(() => requestAnimationFrame(mount));
      return;
    }

    const observer = new MutationObserver(() => {
      if (!ready()) return;
      observer.disconnect();
      requestAnimationFrame(() => requestAnimationFrame(mount));
    });
    observer.observe(document.body, {attributes:true, attributeFilter:['class']});

    /* Structural fail-safe: try mounting even if the current ready class disappears later. */
    window.setTimeout(() => {
      observer.disconnect();
      mount();
    }, 3000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, {once:true});
  } else {
    start();
  }
})();
