(() => {
  'use strict';

  const flowGroups = () => [...document.querySelectorAll('.flow-group, .reuse-journey-block')];

  const targetIndexFor = (group) => {
    if (group.dataset.lineTarget) return Math.max(1, parseInt(group.dataset.lineTarget, 10) || 1);
    if (group.classList.contains('reuse-journey-block')) {
      const blocks = [...group.parentElement.querySelectorAll(':scope > .reuse-journey-block')];
      return blocks.indexOf(group) % 2 === 0 ? 3 : 2;
    }
    const siblings = [...group.parentElement.querySelectorAll(':scope > .flow-group')];
    return siblings.indexOf(group) === 0 ? 3 : 2;
  };

  const syncFlow = (group) => {
    const cards = [...group.querySelectorAll('.flow-node')];
    const first = cards[0];
    const target = cards[targetIndexFor(group) - 1];
    if (!first || !target) return;
    const g = group.getBoundingClientRect();
    const f = first.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    const left = Math.max(0, f.left - g.left);
    const width = Math.max(0, t.right - f.left);
    group.style.setProperty('--line-left', `${left}px`, 'important');
    group.style.setProperty('--line-width', `${width}px`, 'important');
    group.style.setProperty('--flow-line-left', `${left}px`, 'important');
    group.style.setProperty('--flow-line-width', `${width}px`, 'important');
  };

  const syncAll = () => flowGroups().forEach(syncFlow);
  let raf = 0;
  const queueSync = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(syncAll);
  };

  const mountOriginalTrafficChart = async () => {
    const wrap = document.querySelector('.himart-test-page .chart-wrap');
    if (!wrap || wrap.querySelector('.traffic-v5-live')) return wrap;
    try {
      const source = await fetch('./himart-traffic-v5.svg?v=81da379', { cache: 'no-store' }).then((r) => {
        if (!r.ok) throw new Error('traffic svg load failed');
        return r.text();
      });
      const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');
      const svg = parsed.documentElement;
      svg.classList.add('chart-svg', 'traffic-v5-live');
      svg.setAttribute('aria-label', '2026년 1월부터 6월까지 세션, 구매건수, 구매전환율');
      const legend = wrap.querySelector('.chart-legend');
      wrap.insertBefore(document.importNode(svg, true), legend || wrap.firstChild);
    } catch (error) {
      const fallback = wrap.querySelector('.chart-svg');
      if (fallback) fallback.classList.add('traffic-v5-live');
      console.warn(error);
    }
    return wrap;
  };

  const prepareTraffic = (wrap) => {
    const svg = wrap?.querySelector('.traffic-v5-live');
    if (!svg || svg.dataset.prepared === '1') return;
    svg.dataset.prepared = '1';

    const sessions = [...svg.querySelectorAll('.session')];
    sessions.forEach((shape, index) => {
      const length = Math.max(1, shape.getTotalLength());
      shape.style.strokeDasharray = String(length);
      shape.style.strokeDashoffset = String(length);
      shape.style.transition = `stroke-dashoffset 460ms cubic-bezier(.2,.8,.2,1) ${index * 70}ms`;
    });

    const purchase = svg.querySelector('.purchase');
    if (purchase) {
      const length = Math.max(1, purchase.getTotalLength());
      purchase.style.strokeDasharray = String(length);
      purchase.style.strokeDashoffset = String(length);
      purchase.style.transition = 'stroke-dashoffset 820ms cubic-bezier(.2,.8,.2,1) 620ms';
    }

    [...svg.querySelectorAll('.p-dot')].forEach((dot, index) => {
      dot.style.opacity = '0';
      dot.style.transition = `opacity 180ms ease ${1320 + index * 45}ms`;
    });

    const cvr = svg.querySelector('.cvr');
    if (cvr) {
      const length = Math.max(1, cvr.getTotalLength());
      cvr.style.strokeDasharray = String(length);
      cvr.style.strokeDashoffset = String(length);
      cvr.style.transition = 'stroke-dashoffset 820ms cubic-bezier(.2,.8,.2,1) 1500ms';
    }

    [...svg.querySelectorAll('.c-dot')].forEach((dot, index) => {
      dot.style.opacity = '0';
      dot.style.transition = `opacity 180ms ease ${2200 + index * 45}ms`;
    });
  };

  const activateTraffic = (wrap) => {
    const svg = wrap?.querySelector('.traffic-v5-live');
    if (!svg) return;
    [...svg.querySelectorAll('.session')].forEach((shape) => { shape.style.strokeDashoffset = '0'; });
    const purchase = svg.querySelector('.purchase');
    if (purchase) purchase.style.strokeDashoffset = '0';
    [...svg.querySelectorAll('.p-dot')].forEach((dot) => { dot.style.opacity = '1'; });
    const cvr = svg.querySelector('.cvr');
    if (cvr) cvr.style.strokeDashoffset = '0';
    [...svg.querySelectorAll('.c-dot')].forEach((dot) => { dot.style.opacity = '1'; });
  };

  const tuneTestPage = async () => {
    if (!document.body.classList.contains('himart-test-page')) return;

    const trafficWrap = await mountOriginalTrafficChart();
    if (trafficWrap) prepareTraffic(trafficWrap);

    const charts = [...document.querySelectorAll('.pie, .chart-wrap, .search-slope, .hbars, .landing-chart')];
    charts.forEach((chart) => chart.classList.add('chart-motion'));

    const activate = (chart) => {
      if (chart.classList.contains('is-chart-active')) return;
      chart.classList.add('is-chart-active');
      if (chart.classList.contains('chart-wrap')) activateTraffic(chart);
    };

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      charts.forEach(activate);
      return;
    }

    const visible = (chart) => {
      const rect = chart.getBoundingClientRect();
      return rect.top < innerHeight * 0.94 && rect.bottom > innerHeight * 0.06;
    };

    charts.filter(visible).forEach((chart, index) => setTimeout(() => activate(chart), 80 + index * 45));

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      charts.forEach((chart) => observer.observe(chart));
    } else {
      charts.forEach(activate);
    }

    setTimeout(() => charts.filter(visible).forEach(activate), 700);
  };

  const boot = () => {
    queueSync();
    tuneTestPage();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  addEventListener('load', () => {
    queueSync();
    tuneTestPage();
  }, { once: true });
  addEventListener('resize', queueSync, { passive: true });

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(queueSync);
    flowGroups().forEach((group) => resizeObserver.observe(group));
    document.querySelectorAll('.flow-row').forEach((row) => resizeObserver.observe(row));
  }

  if (document.fonts?.ready) document.fonts.ready.then(queueSync).catch(() => {});
})();