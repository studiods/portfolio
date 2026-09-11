(() => {
  'use strict';

  const TOP_LABEL = '유입 맥락을 유지해 탐색 시작으로 연결';
  const BOTTOM_LABEL = '결제 조건을 명확히 해 이탈을 줄이고 설치 확신까지 연결';
  let applying = false;
  let lastChangedAt = 0;

  const numbersIn = cluster => [...(cluster?.querySelectorAll('.wide-flow-cluster-inner > .flow-node') || [])]
    .map(node => (node.querySelector('.hm-card-no')?.textContent || '').trim().slice(0, 2));

  const unwrap = row => {
    [...row.querySelectorAll(':scope > .wide-flow-cluster')].forEach(cluster => {
      const inner = cluster.querySelector('.wide-flow-cluster-inner');
      if (inner) [...inner.children].forEach(child => row.insertBefore(child, cluster));
      cluster.remove();
    });
  };

  const build = (row, nodeCount, label, startIndex) => {
    const children = [...row.children];
    const moving = children.slice(startIndex, startIndex + nodeCount * 2 - 1);
    if (!moving.length) return null;

    const cluster = document.createElement('div');
    cluster.className = 'wide-flow-cluster v12-journey-tablet v12-tablet-blue wide-flow-cluster--focus';
    cluster.style.setProperty('--v12-tablet-color', 'var(--hm-blue)');
    cluster.innerHTML = `<div class="wide-flow-cluster-label">${label}</div><div class="wide-flow-cluster-inner"></div>`;
    const inner = cluster.querySelector('.wide-flow-cluster-inner');
    row.insertBefore(cluster, moving[0]);
    moving.forEach(node => inner.appendChild(node));
    return cluster;
  };

  const normalize = (cluster, label) => {
    if (!cluster) return;
    cluster.classList.remove('v10-journey-tablet', 'v12-tablet-red');
    cluster.classList.add('v12-journey-tablet', 'v12-tablet-blue', 'wide-flow-cluster--focus');
    cluster.style.setProperty('--v12-tablet-color', 'var(--hm-blue)');
    const labelEl = cluster.querySelector('.wide-flow-cluster-label');
    if (labelEl) labelEl.textContent = label;
  };

  const removeLegacyAssets = () => {
    document.querySelectorAll('link[href*="himart-wide-refine-v10.css"]').forEach(node => node.remove());
    document.querySelectorAll('script[src*="himart-wide-refine-v10.js"]').forEach(node => node.remove());
  };

  const enforce = () => {
    if (applying) return false;
    const block = document.querySelector('#journey .journey-flow-block');
    if (!block) return false;

    const groups = [...block.querySelectorAll('.flow-group')];
    if (groups.length < 2) return false;
    const topRow = groups[0].querySelector('.flow-row');
    const bottomRow = groups[1].querySelector('.flow-row');
    if (!topRow || !bottomRow) return false;

    applying = true;
    let changed = false;
    try {
      removeLegacyAssets();

      const topCluster = topRow.querySelector(':scope > .wide-flow-cluster');
      const bottomCluster = bottomRow.querySelector(':scope > .wide-flow-cluster');
      const topOk = numbersIn(topCluster).join(',') === '01,02';
      const bottomOk = numbersIn(bottomCluster).join(',') === '06,07';

      if (!topOk || !bottomOk) {
        unwrap(topRow);
        unwrap(bottomRow);
        build(topRow, 2, TOP_LABEL, 0);
        build(bottomRow, 2, BOTTOM_LABEL, 2);
        changed = true;
      } else {
        normalize(topCluster, TOP_LABEL);
        normalize(bottomCluster, BOTTOM_LABEL);
      }

      block.dataset.v2ProductionExact = '1';
      block.dataset.hmJourneyColdloadStable = '1';
      if (changed) {
        lastChangedAt = performance.now();
        requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
      }
    } finally {
      applying = false;
    }
    return changed;
  };

  const observer = new MutationObserver(() => {
    requestAnimationFrame(enforce);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  [0, 40, 100, 180, 320, 520, 800, 1200, 1800, 2600, 3600, 5000, 7000, 9000, 11500].forEach(ms => {
    setTimeout(() => {
      removeLegacyAssets();
      enforce();
    }, ms);
  });

  window.addEventListener('load', () => {
    enforce();
    setTimeout(enforce, 120);
    setTimeout(enforce, 600);
  }, { once: true });

  setTimeout(() => {
    enforce();
    observer.disconnect();
  }, 12000);
})();
