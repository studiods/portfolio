/*
  HIMART Wide Editorial adapter — TEST ONLY v1
  Waits until himart.html finishes its narrative runtime rewrite, then groups all
  chapter content after .hm-section-head into one right rail. This keeps the visual
  contract identical to the current REUSE wide test while avoiding brittle grid-row spans.
*/
(() => {
  'use strict';

  const isTargetPage = () =>
    document.body?.classList.contains('hm-wide-editorial-test') &&
    document.body?.classList.contains('hm-wide-himart-test');

  const mount = () => {
    if (!isTargetPage() || window.__hmWideHimartAdapterMounted) return;

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
  };

  const ready = () => document.body?.classList.contains('himart-narrative-ready');

  const start = () => {
    if (!isTargetPage()) return;
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

    /* Fail-safe for a future runtime that stops toggling the current ready class. */
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
