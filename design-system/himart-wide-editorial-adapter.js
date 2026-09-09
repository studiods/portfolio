/*
  HIMART Wide Editorial adapter — TEST ONLY v6
  Waits until himart.html finishes its narrative runtime rewrite, then groups all
  chapter content after .hm-section-head into one right rail. This keeps the visual
  contract identical to the current REUSE wide test while avoiding brittle grid-row spans.

  v5 also owns the test-only boot lock. The fetched Himart document stays hidden until
  the runtime rewrite and rail grouping have completed, preventing raw-content / unstyled FOUC.
  Major-title line breaks remain exactly as authored by the current Himart runtime.

  v6 removes the retired 2025–early-2026 review / SNS / community / internal VOC
  provenance copy from the Himart brand chapter. Other evidence source notes remain intact.
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

  const removeRetiredVoiceSourceCopy = () => {
    const brand = document.querySelector('#live-main > #brand');
    if (!brand) return;

    const sourceSelector = '.hm-source,.hm-ds-source-note,[data-hm-source-note]';
    brand.querySelectorAll(sourceSelector).forEach(node => {
      const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
      const normalized = text.toUpperCase();

      const isLegacyCombinedSource =
        normalized.includes('VOC') &&
        (normalized.includes('리뷰') || normalized.includes('SNS') || normalized.includes('커뮤니티'));

      const isExactRetiredCopy =
        text.includes('25~26년') ||
        text.includes('25~26 년') ||
        text.includes('2025~2026') ||
        text.includes('2025–2026') ||
        text.includes('2025-2026');

      if (isLegacyCombinedSource || isExactRetiredCopy) node.remove();
    });
  };

  const mount = () => {
    if (!isTargetPage()) return;
    if (window.__hmWideHimartAdapterMounted) {
      removeRetiredVoiceSourceCopy();
      releaseBootLock();
      return;
    }

    const sections = [...document.querySelectorAll('#live-main > :is(#brand,#data,#journey,#direction).hm-section')];
    if (!sections.length) return;

    /* navigation.js mounts SOURCE notes before this adapter, so retire the old
       review/SNS/community/VOC provenance before the page becomes visible. */
    removeRetiredVoiceSourceCopy();

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

    /* Defensive second pass in case a late source migration landed during grouping. */
    removeRetiredVoiceSourceCopy();

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
