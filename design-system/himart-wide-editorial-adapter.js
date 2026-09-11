/*
  HIMART Wide Editorial adapter — TEST ONLY v8.1
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

  v8.1 fixes the cold-load-only 03.1 JOURNEY FLOW race. Two historical runtime layers owned
  the same journey DOM with different grouping rules: the current narrative flowfix uses
  01–02 and 06–07, while the asynchronously loaded production v9/v10/v12 refinements can
  rebuild 03.1 as 01–03 and 05–06. On a cold load the production bundle can finish later and
  win; after refresh the cached order changes and the narrative flowfix wins instead.

  This adapter is now the final Himart-wide owner of 03.1. It blocks the obsolete external
  v10 rollback asset, then deterministically restores the current 01–02 / 06–07 grouping
  before the boot lock is released. A short-lived MutationObserver covers any late runtime
  insertion during the cold-load window without leaving permanent page overhead.
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

  const clusterNodeNumbers = cluster =>
    [...(cluster?.querySelectorAll('.wide-flow-cluster-inner > .flow-node') || [])]
      .map(node => (node.querySelector('.hm-card-no')?.textContent || '').trim().slice(0, 2));

  const normalizeCluster = (cluster, label) => {
    if (!cluster) return;
    cluster.classList.remove('v10-journey-tablet', 'v12-tablet-red');
    cluster.classList.add('v12-journey-tablet', 'v12-tablet-blue', 'wide-flow-cluster--focus');
    cluster.style.setProperty('--v12-tablet-color', 'var(--hm-blue)');
    const labelEl = cluster.querySelector('.wide-flow-cluster-label');
    if (labelEl && labelEl.textContent !== label) labelEl.textContent = label;
  };

  const unwrapDirectClusters = row => {
    [...row.querySelectorAll(':scope > .wide-flow-cluster')].forEach(cluster => {
      const inner = cluster.querySelector('.wide-flow-cluster-inner');
      if (inner) [...inner.children].forEach(child => row.insertBefore(child, cluster));
      cluster.remove();
    });
  };

  const buildCanonicalCluster = (row, nodeCount, label, startIndex = 0) => {
    if (!row) return null;
    const children = [...row.children];
    const moveCount = nodeCount * 2 - 1;
    const moving = children.slice(startIndex, startIndex + moveCount);
    if (!moving.length) return null;

    const anchor = moving[0];
    const cluster = document.createElement('div');
    cluster.className = 'wide-flow-cluster v12-journey-tablet v12-tablet-blue wide-flow-cluster--focus';
    cluster.style.setProperty('--v12-tablet-color', 'var(--hm-blue)');
    cluster.innerHTML = `<div class="wide-flow-cluster-label">${label}</div><div class="wide-flow-cluster-inner"></div>`;
    const inner = cluster.querySelector('.wide-flow-cluster-inner');
    row.insertBefore(cluster, anchor);
    moving.forEach(node => inner.appendChild(node));
    return cluster;
  };

  const enforceCanonicalJourneyFlow = () => {
    const block = document.querySelector('#live-main > #journey .journey-flow-block');
    if (!block) return;

    const groups = [...block.querySelectorAll('.flow-group')];
    if (groups.length < 2) return;

    const topRow = groups[0].querySelector('.flow-row');
    const bottomRow = groups[1].querySelector('.flow-row');
    if (!topRow || !bottomRow) return;

    const topLabel = '유입 맥락을 유지해 탐색 시작으로 연결';
    const bottomLabel = '결제 조건을 명확히 해 이탈을 줄이고 설치 확신까지 연결';
    const topCluster = topRow.querySelector(':scope > .wide-flow-cluster');
    const bottomCluster = bottomRow.querySelector(':scope > .wide-flow-cluster');
    const topNumbers = clusterNodeNumbers(topCluster);
    const bottomNumbers = clusterNodeNumbers(bottomCluster);

    const isCanonical =
      topNumbers.join(',') === '01,02' &&
      bottomNumbers.join(',') === '06,07';

    if (!isCanonical) {
      unwrapDirectClusters(topRow);
      unwrapDirectClusters(bottomRow);
      buildCanonicalCluster(topRow, 2, topLabel, 0);
      buildCanonicalCluster(bottomRow, 2, bottomLabel, 2);
    } else {
      normalizeCluster(topCluster, topLabel);
      normalizeCluster(bottomCluster, bottomLabel);
    }

    block.dataset.v2ProductionExact = '1';
    block.dataset.hmWideJourneyCanonical = '1';
  };

  const removeLegacyJourneyRollbackAssets = () => {
    document.querySelectorAll('link[href*="himart-wide-refine-v10.css"]').forEach(node => node.remove());
    document.querySelectorAll('script[src*="himart-wide-refine-v10.js"]').forEach(node => node.remove());
    enforceCanonicalJourneyFlow();
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

    /* Covers production-base, v9/v10/v12 timers, and the narrative flowfix retry window. */
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
      enforceCanonicalJourneyFlow();
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

    /* Final 03.1 ownership happens after every current narrative layer has produced its DOM. */
    removeRetiredVoiceSourceCopy();
    removeLegacyJourneyRollbackAssets();
    enforceCanonicalJourneyFlow();

    /* One observer checkpoint owns both sides of every chapter start. This is mounted
       before the generic animation rescan so the visible pair shares the same frame. */
    mountChapterStartPairSync(sections);

    window.__hmWideHimartAdapterMounted = true;
    window.__hmAnimationScan?.();
    window.dispatchEvent(new Event('resize'));

    /* Recheck the journey in the final paint-preparation frame, then reveal the page. */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      removeLegacyJourneyRollbackAssets();
      enforceCanonicalJourneyFlow();
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
