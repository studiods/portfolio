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

  const prepareTraffic = (wrap) => {
    const svg = wrap.querySelector('.chart-svg');
    if (!svg || svg.dataset.prepared === '1') return;
    svg.dataset.prepared = '1';

    const shapes = [...svg.querySelectorAll('.bar, .line-newblue, .line-green')];
    shapes.forEach((shape, index) => {
      const length = Math.max(1, shape.getTotalLength());
      shape.style.strokeDasharray = String(length);
      shape.style.strokeDashoffset = String(length);
      shape.style.transition = `stroke-dashoffset 720ms cubic-bezier(.2,.8,.2,1) ${index * 55}ms`;
    });

    [...svg.querySelectorAll('.point-yellow')].forEach((point, index) => {
      point.style.opacity = '0';
      point.style.transition = `opacity 220ms ease ${240 + index * 55}ms`;
    });
  };

  const activateTraffic = (wrap) => {
    const svg = wrap.querySelector('.chart-svg');
    if (!svg) return;
    [...svg.querySelectorAll('.bar, .line-newblue, .line-green')].forEach((shape) => {
      shape.style.strokeDashoffset = '0';
    });
    [...svg.querySelectorAll('.point-yellow')].forEach((point) => {
      point.style.opacity = '1';
    });
  };

  const tuneTestPage = () => {
    if (!document.body.classList.contains('himart-test-page')) return;

    const charts = [...document.querySelectorAll('.pie, .chart-wrap, .search-slope, .hbars, .landing-chart')];
    charts.forEach((chart) => {
      chart.classList.add('chart-motion');
      if (chart.classList.contains('chart-wrap')) prepareTraffic(chart);
    });

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
      }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
      charts.forEach((chart) => observer.observe(chart));
    } else {
      charts.forEach(activate);
    }

    setTimeout(() => charts.filter(visible).forEach(activate), 650);
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