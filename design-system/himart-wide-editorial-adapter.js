/*
  HIMART Wide Editorial adapter — TEST ONLY v8
  Waits until himart.html finishes its narrative runtime rewrite, then groups all
  chapter content after .hm-section-head into one right rail. This keeps the visual
  contract identical to the current REUSE wide test while avoiding brittle grid-row spans.

  v5 also owns the test-only boot lock. The fetched Himart document stays hidden until
  the runtime rewrite and rail grouping have completed, preventing raw-content / unstyled FOUC.
  Major-title line breaks remain exactly as authored by the current Himart runtime.

  v6 removes the retired 2025–early-2026 review / SNS / community / internal VOC
  provenance copy from the Himart brand chapter. Other evidence source notes remain intact.

  v7 makes each chapter start a single visual event: the left sticky major title and the
  first right-rail content block are revealed from one IntersectionObserver checkpoint.
  Geometry is owned by CSS and remains transform-free at chapter start, so their authored
  top line cannot drift during the scroll-in transition.

  v8 removes the obsolete asynchronous v10 journey rollback before it can override the
  current fluid journey geometry. The old rollback was dynamically appended by the bundled
  production runtime, so cold-load network timing could make its fixed 168px circle rules
  win after the current layout had already been built. Refreshing changed the timing and
  made the newer rules appear correct. A short-lived observer now blocks that stale asset
  and normalizes any legacy cluster that may already have landed before first paint.
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

  const normalizeJourneyClusters = () => {
    const journey = document.querySelector('#live-main > #journey');
    if (!journey) return;

    journey.querySelectorAll('.wide-flow-cluster.v10-journey-tablet').forEach(cluster => {
      cluster.classList.remove('v10-journey-tablet');
      cluster.classList.add('v12-journey-tablet');

      if (cluster.closest('.journey-signal-subsection')) {
        cluster.classList.add('v12-tablet-red');
        cluster.classList.remove('v12-tablet-blue');
        cluster.style.setProperty('--v12-tablet-color', 'var(--hm-red)');
      } else if (cluster.closest('.journey-redesign-subsection, .journey-flow-block')) {
        cluster.classList.add('v12-tablet-blue');
        cluster.classList.remove('v12-tablet-red');
        cluster.style.setProperty('--v12-tablet-color', 'var(--hm-blue)');
      }
    });
  };

  const removeLegacyJourneyRollbackAssets = () => {
    document.querySelectorAll('link[href*="himart-wide-refine-v10.css"]').forEach(node => node.remove());
    document.querySelectorAll('script[src*="himart-wide-refine-v10.js"]').forEach(node => node.remove());
    normalizeJourneyClusters();
  };

  const installLegacyJourneyRollbackGuard = () => {
    if (!isTargetPage() || window.__hmLegacyJourneyRollbackGuardMounted) return;
    window.__hmLegacyJourneyRollbackGuardMounted = true;

    removeLegacyJourneyRollbackAssets();

    if (!('MutationObserver' in window) || !document.documentElement) return;

    const observer = new MutationObserver(() => {
      removeLegacyJourneyRollbackAssets();
    });
    observer.observe(document.documentElement, {childList:true, subtree:true});

    const stop = () => {
      removeLegacyJourneyRollbackAssets();
      observer.disconnect();
    };

    /* The obsolete rollback is injected during the asynchronous narrative boot.
       Ten seconds safely covers the cold-load window without leaving a permanent observer. */
    window.setTimeout(stop, 10000);
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

  const mountChapterStartPairSync = sections => {
    if (window.__hmWideChapterPairSyncMounted) return;
    window.__hmWideChapterPairSyncMounted = true;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const pairs = sections.map(section => {
      const wrap = section.querySelector(':scope > .hm-wrap');
      const head = wrap?.querySelector(':scope > .hm-section-head');
      const rail = wrap?.querySelector(':scope > .hm-wide-right-rail');
      const first = rail?.firstElementChild || null;
      if (!head || !first) return null;
      section.dataset.hmWidePairSynced = '1';
      return {section, head, first};
    }).filter(Boolean);

    const revealPair = pair => {
      if (!pair || pair.section.classList.contains('is-wide-chapter-pair-visible')) return;
      requestAnimationFrame(() => {
        pair.head.classList.add('is-visible', 'is-wide-rise-in');
        pair.first.classList.add('is-visible', 'is-wide-rise-in');
        pair.section.classList.add('is-wide-chapter-pair-visible');
      });
    };

    if (reduce || !('IntersectionObserver' in window)) {
      pairs.forEach(revealPair);
      return;
    }

    const pairByAnchor = new WeakMap();
    const observer = new IntersectionObserver((entries, io) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const pair = pairByAnchor.get(entry.target);
        if (!pair) return;
        revealPair(pair);
        io.unobserve(entry.target);
      });
    }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});

    pairs.forEach(pair => {
      pairByAnchor.set(pair.first, pair);
      observer.observe(pair.first);
    });
  };

  const mount = () => {
    if (!isTargetPage()) return;
    removeLegacyJourneyRollbackAssets();

    if (window.__hmWideHimartAdapterMounted) {
      removeRetiredVoiceSourceCopy();
      normalizeJourneyClusters();
      window.dispatchEvent(new Event('resize'));
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
    removeLegacyJourneyRollbackAssets();
    normalizeJourneyClusters();

    /* One observer checkpoint owns both sides of every chapter start. This is mounted
       before the generic animation rescan so the visible pair shares the same frame. */
    mountChapterStartPairSync(sections);

    window.__hmWideHimartAdapterMounted = true;
    window.__hmAnimationScan?.();
    window.dispatchEvent(new Event('resize'));

    /* Allow one paint-preparation frame after the final DOM grouping, then reveal. */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      removeLegacyJourneyRollbackAssets();
      normalizeJourneyClusters();
      window.dispatchEvent(new Event('resize'));
      releaseBootLock();
    }));
  };

  const ready = () => document.body?.classList.contains('himart-narrative-ready');

  const start = () => {
    if (!isTargetPage()) return;

    installLegacyJourneyRollbackGuard();

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
