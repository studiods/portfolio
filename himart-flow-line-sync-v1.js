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

    [...svg.querySelectorAll('.session')].forEach((shape, index) => {
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

  const ensureTitleMotionStyle = () => {
    if (document.getElementById('himart-test-title-motion-style')) return;
    const style = document.createElement('style');
    style.id = 'himart-test-title-motion-style';
    style.textContent = `
      .himart-test-page .title-rise-target{opacity:0;transform:translateY(28px);transition:opacity .62s ease,transform .82s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform}
      .himart-test-page .title-rise-target.is-title-rise-in{opacity:1;transform:translateY(0)}
      .himart-test-page .flow-node{border-top-color:rgba(255,255,255,.20)!important}
      .himart-test-page .flow-group.flow-label-motion::before{transform:scaleX(0)!important;transform-origin:left center!important;transition:transform .9s cubic-bezier(.2,.8,.2,1) .12s!important;will-change:transform}
      .himart-test-page .flow-group.flow-label-motion.is-flow-label-in::before{transform:scaleX(1)!important}
      @media (prefers-reduced-motion:reduce){
        .himart-test-page .title-rise-target{opacity:1!important;transform:none!important;transition:none!important}
        .himart-test-page .flow-group.flow-label-motion::before{transform:scaleX(1)!important;transition:none!important}
      }
    `;
    document.head.appendChild(style);
  };

  const textNodesFor = (el) => {
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

  const playTextScramble = (el, dataKey = 'scramblePlayed') => {
    if (!el || el.dataset[dataKey] === '1') return;
    el.dataset[dataKey] = '1';

    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const parts = textNodesFor(el).map((node) => ({ node, original: node.nodeValue }));
    const isMutable = (ch) => /[\p{L}\p{N}]/u.test(ch);
    const total = parts.reduce((sum, part) => sum + [...part.original].filter(isMutable).length, 0);
    if (!total) return;

    const started = performance.now();
    const duration = Math.min(1350, 600 + total * 13);
    const tick = (now) => {
      const progress = Math.min(1, (now - started) / duration);
      const resolved = Math.floor(total * Math.pow(progress, .72));
      let cursor = 0;

      parts.forEach((part, partIndex) => {
        part.node.nodeValue = [...part.original].map((ch, charIndex) => {
          if (!isMutable(ch)) return ch;
          const globalIndex = cursor++;
          if (globalIndex < resolved || progress >= 1) return ch;
          const salt = partIndex * 29 + charIndex * 17 + Math.floor(now / 44);
          return pool[salt % pool.length];
        }).join('');
      });

      if (progress < 1) requestAnimationFrame(tick);
      else parts.forEach((part) => { part.node.nodeValue = part.original; });
    };
    requestAnimationFrame(tick);
  };

  const mountTitleMotion = () => {
    if (!document.body.classList.contains('himart-test-page')) return;
    ensureTitleMotionStyle();

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const numberPattern = /^\s*\d{1,2}(?:\.\d+)?(?:\s*\/|\s*$)/;
    const groups = [];
    const titleSet = new Set();

    const registerGroup = (container, numberSelector, titleSelector) => {
      if (!container || container.dataset.numberedTitleGroupMounted === '1') return;
      const number = container.querySelector(numberSelector);
      const title = container.querySelector(titleSelector);
      if (!number || !title || !numberPattern.test(number.textContent)) return;
      container.dataset.numberedTitleGroupMounted = '1';
      groups.push({ container, number, title });
      titleSet.add(title);
    };

    document.querySelectorAll('.hm-section-head').forEach((container) => registerGroup(container, '.hm-section-no', '.hm-section-title'));
    document.querySelectorAll('.data-card-head').forEach((container) => registerGroup(container, '.hm-card-no', 'h3'));
    document.querySelectorAll('.hm-subhead').forEach((container) => registerGroup(container, '.hm-subno', '.hm-subtitle, .forced-redesign-title'));
    document.querySelectorAll('.data-bridge').forEach((container) => registerGroup(container, ':scope > .hm-card-no', ':scope > .data-bridge-title'));

    const riseSelector = [
      '.hm-title',
      '.hm-section-title',
      '.hm-subtitle',
      '.data-card h3',
      '.data-bridge-title',
      '.data-bridge-grid article h4',
      '.forced-redesign-title',
      '.prototype-case-copy h3',
      '.voice-group-title',
      '.sentiment-title',
      '.sentiment-conclusion > h4',
      '.keyword-group h3',
      '.role-card h4',
      '.flow-node h4',
      '.direction-card h4',
      '.conclusion-card h5'
    ].join(',');

    const riseTargets = [...document.querySelectorAll(riseSelector)].filter((el) => {
      if (titleSet.has(el)) return false;
      if (el.closest('.hm-progress')) return false;
      return true;
    });

    riseTargets.forEach((el) => {
      if (el.dataset.titleRiseMounted === '1') return;
      el.dataset.titleRiseMounted = '1';
      el.classList.add('title-rise-target');
    });

    if (reduced) {
      riseTargets.forEach((el) => el.classList.add('is-title-rise-in'));
      return;
    }

    const playGroup = (group) => {
      playTextScramble(group.number, 'numberedGroupScramblePlayed');
      playTextScramble(group.title, 'numberedGroupScramblePlayed');
    };

    if ('IntersectionObserver' in window) {
      const groupMap = new Map(groups.map((group) => [group.container, group]));
      const scrambleObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const group = groupMap.get(entry.target);
          if (group) playGroup(group);
          scrambleObserver.unobserve(entry.target);
        });
      }, { threshold: .28, rootMargin: '0px 0px -8% 0px' });
      groups.forEach((group) => scrambleObserver.observe(group.container));

      const riseObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-title-rise-in');
          riseObserver.unobserve(entry.target);
        });
      }, { threshold: .18, rootMargin: '0px 0px -6% 0px' });
      riseTargets.forEach((el) => riseObserver.observe(el));
    } else {
      groups.forEach((group, index) => setTimeout(() => playGroup(group), 70 + index * 55));
      riseTargets.forEach((el, index) => setTimeout(() => el.classList.add('is-title-rise-in'), 80 + index * 30));
    }
  };

  const mountFlowLabelMotion = () => {
    if (!document.body.classList.contains('himart-test-page')) return;
    ensureTitleMotionStyle();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const groups = [...document.querySelectorAll('.flow-group')].filter((group) => group.querySelector('.flow-label'));

    groups.forEach((group) => group.classList.add('flow-label-motion'));
    if (reduced) {
      groups.forEach((group) => group.classList.add('is-flow-label-in'));
      return;
    }

    const activate = (group) => {
      if (group.dataset.flowLabelMotionPlayed === '1') return;
      group.dataset.flowLabelMotionPlayed = '1';
      const label = group.querySelector('.flow-label');
      playTextScramble(label, 'flowLabelScramblePlayed');
      requestAnimationFrame(() => group.classList.add('is-flow-label-in'));
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          activate(entry.target);
          observer.unobserve(entry.target);
        });
      }, { threshold: .22, rootMargin: '0px 0px -8% 0px' });
      groups.forEach((group) => observer.observe(group));
    } else {
      groups.forEach((group, index) => setTimeout(() => activate(group), 90 + index * 90));
    }
  };

  const playDigitRoll = (el) => {
    if (el.dataset.digitRollPlayed === '1') return;
    el.dataset.digitRollPlayed = '1';
    const original = el.textContent.trim();
    if (!/^[-+]?\d[\d,.]*%?$/.test(original)) return;
    const chars = [...original];
    const digitIndexes = chars.map((ch, index) => /\d/.test(ch) ? index : -1).filter((index) => index >= 0);
    if (!digitIndexes.length) return;

    el.style.fontVariantNumeric = 'tabular-nums';
    const started = performance.now();
    const duration = 860;
    const settleStart = .48;

    const tick = (now) => {
      const progress = Math.min(1, (now - started) / duration);
      const settleProgress = Math.max(0, (progress - settleStart) / (1 - settleStart));
      const settled = Math.floor(digitIndexes.length * Math.pow(settleProgress, .82));
      let digitRank = 0;
      el.textContent = chars.map((ch, index) => {
        if (!/\d/.test(ch)) return ch;
        const rank = digitRank++;
        if (rank < settled || progress >= 1) return ch;
        return String((index * 7 + Math.floor(now / 38) + rank * 3) % 10);
      }).join('');
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = original;
    };
    requestAnimationFrame(tick);
  };

  const mountDigitRoll = () => {
    if (!document.body.classList.contains('himart-test-page')) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const selector = [
      '.search-slope strong',
      '.number-panel strong',
      '.sentiment-number',
      '.ring-card .pct',
      '.hbar b',
      '.stacklabels b',
      '.pdp-col b'
    ].join(',');
    const targets = [...document.querySelectorAll(selector)].filter((el) => /^[-+]?\d[\d,.]*%?$/.test(el.textContent.trim()));
    targets.forEach((el) => { el.dataset.digitRollMounted = '1'; });
    if (reduced) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          playDigitRoll(entry.target);
          observer.unobserve(entry.target);
        });
      }, { threshold: .35, rootMargin: '0px 0px -8% 0px' });
      targets.forEach((el) => observer.observe(el));
    } else {
      targets.forEach((el, index) => setTimeout(() => playDigitRoll(el), 80 + index * 45));
    }
  };

  const tuneTestPage = async () => {
    if (!document.body.classList.contains('himart-test-page')) return;

    enforceRoleCopyOpacity();
    setTimeout(enforceRoleCopyOpacity, 120);
    setTimeout(enforceRoleCopyOpacity, 500);
    mountTitleMotion();
    mountFlowLabelMotion();
    mountDigitRoll();

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
      return rect.top < innerHeight * .94 && rect.bottom > innerHeight * .06;
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
      }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
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