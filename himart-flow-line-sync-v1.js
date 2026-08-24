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

  const enforceRoleCopyOpacity = () => {
    if (!document.body.classList.contains('himart-test-page')) return;
    document.querySelectorAll('#journey .role-grid .role-card > p').forEach((copy) => {
      copy.classList.add('role-card-copy-50');
      copy.style.setProperty('color', '#fff', 'important');
      copy.style.setProperty('opacity', '0.5', 'important');
    });
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

  const mountSubtitleScramble = () => {
    if (!document.body.classList.contains('himart-test-page')) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const selectors = [
      '.hm-subtitle',
      '.data-card h3',
      '.data-bridge-title',
      '.forced-redesign-title',
      '.prototype-case-copy h3',
      '.voice-group-title',
      '.sentiment-conclusion > h4'
    ].join(',');

    const targets = [...document.querySelectorAll(selectors)].filter((el) => {
      if (el.dataset.subtitleScrambleMounted === '1') return false;
      if (el.classList.contains('js-scramble')) return false;
      return el.textContent.trim().length > 0;
    });

    const collectTextNodes = (el) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          return node.nodeValue && node.nodeValue.trim().length
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      });
      const nodes = [];
      let node;
      while ((node = walker.nextNode())) nodes.push(node);
      return nodes;
    };

    const play = (el) => {
      if (el.dataset.subtitleScramblePlayed === '1') return;
      el.dataset.subtitleScramblePlayed = '1';

      const nodes = collectTextNodes(el);
      const parts = nodes.map((node) => ({ node, original: node.nodeValue }));
      const total = parts.reduce((sum, part) => sum + [...part.original].filter((ch) => !/\s/.test(ch)).length, 0);
      if (!total) return;

      const started = performance.now();
      const duration = Math.min(1350, 620 + total * 14);

      const tick = (now) => {
        const progress = Math.min(1, (now - started) / duration);
        const resolved = Math.floor(total * Math.pow(progress, 0.72));
        let cursor = 0;

        parts.forEach((part, partIndex) => {
          part.node.nodeValue = [...part.original].map((ch, charIndex) => {
            if (/\s/.test(ch)) return ch;
            const globalIndex = cursor++;
            if (globalIndex < resolved || progress >= 1) return ch;
            const salt = partIndex * 23 + charIndex * 17 + Math.floor(now / 46);
            return pool[salt % pool.length];
          }).join('');
        });

        if (progress < 1) requestAnimationFrame(tick);
        else parts.forEach((part) => { part.node.nodeValue = part.original; });
      };

      requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          play(entry.target);
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.28, rootMargin: '0px 0px -8% 0px' });

      targets.forEach((el) => {
        el.dataset.subtitleScrambleMounted = '1';
        observer.observe(el);
      });
    } else {
      targets.forEach((el, index) => {
        el.dataset.subtitleScrambleMounted = '1';
        setTimeout(() => play(el), 80 + index * 60);
      });
    }
  };

  const tuneTestPage = async () => {
    if (!document.body.classList.contains('himart-test-page')) return;

    enforceRoleCopyOpacity();
    setTimeout(enforceRoleCopyOpacity, 120);
    setTimeout(enforceRoleCopyOpacity, 500);
    mountSubtitleScramble();

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
    enforceRoleCopyOpacity();
    tuneTestPage();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  addEventListener('load', () => {
    queueSync();
    enforceRoleCopyOpacity();
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