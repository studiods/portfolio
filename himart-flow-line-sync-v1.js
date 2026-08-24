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

  const ensureTitleMotionStyle = () => {
    if (document.getElementById('himart-test-title-motion-style')) return;
    const style = document.createElement('style');
    style.id = 'himart-test-title-motion-style';
    style.textContent = `
      .himart-test-page .title-rise-target{opacity:0;transform:translateY(28px);transition:opacity .62s ease,transform .82s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform}
      .himart-test-page .title-rise-target.is-title-rise-in{opacity:1;transform:translateY(0)}
      @media (prefers-reduced-motion:reduce){.himart-test-page .title-rise-target{opacity:1!important;transform:none!important;transition:none!important}}
    `;
    document.head.appendChild(style);
  };

  const playNumberedScramble = (el) => {
    if (el.dataset.numberedScramblePlayed === '1') return;
    el.dataset.numberedScramblePlayed = '1';
    const original = el.textContent;
    const chars = [...original];
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const mutable = chars.map((ch, index) => /[A-Za-z0-9]/.test(ch) ? index : -1).filter((index) => index >= 0);
    if (!mutable.length) return;

    const started = performance.now();
    const duration = Math.min(980, 500 + mutable.length * 24);
    const tick = (now) => {
      const progress = Math.min(1, (now - started) / duration);
      const resolved = Math.floor(mutable.length * Math.pow(progress, .72));
      let rank = 0;
      el.textContent = chars.map((ch, index) => {
        if (!/[A-Za-z0-9]/.test(ch)) return ch;
        const currentRank = rank++;
        if (currentRank < resolved || progress >= 1) return ch;
        return pool[(index * 19 + Math.floor(now / 42)) % pool.length];
      }).join('');
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = original;
    };
    requestAnimationFrame(tick);
  };

  const mountTitleMotion = () => {
    if (!document.body.classList.contains('himart-test-page')) return;
    ensureTitleMotionStyle();

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const numberedSelector = [
      '.hm-section-no',
      '.hm-subno',
      '.hm-card-no',
      '.data-bridge-grid article > span'
    ].join(',');
    const numbered = [...document.querySelectorAll(numberedSelector)].filter((el) => /^\s*\d{1,2}(?:\.\d+)?(?:\s*\/|\s*$)/.test(el.textContent));

    const riseSelector = [
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
    const riseTargets = [...document.querySelectorAll(riseSelector)].filter((el) => !el.closest('.hm-progress'));

    numbered.forEach((el) => {
      if (el.dataset.numberedScrambleMounted === '1') return;
      el.dataset.numberedScrambleMounted = '1';
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

    if ('IntersectionObserver' in window) {
      const scrambleObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          playNumberedScramble(entry.target);
          scrambleObserver.unobserve(entry.target);
        });
      }, { threshold: .35, rootMargin: '0px 0px -8% 0px' });
      numbered.forEach((el) => scrambleObserver.observe(el));

      const riseObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-title-rise-in');
          riseObserver.unobserve(entry.target);
        });
      }, { threshold: .18, rootMargin: '0px 0px -6% 0px' });
      riseTargets.forEach((el) => riseObserver.observe(el));
    } else {
      numbered.forEach((el, index) => setTimeout(() => playNumberedScramble(el), 60 + index * 35));
      riseTargets.forEach((el, index) => setTimeout(() => el.classList.add('is-title-rise-in'), 80 + index * 30));
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