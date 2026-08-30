(() => {
  'use strict';

  const links = [...document.querySelectorAll('.story-nav a')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setCurrent = (id) => {
    links.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-current', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setCurrent(visible.target.id);
    }, { rootMargin: '-22% 0px -62% 0px', threshold: [0, .15, .35] });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  const revealSelectors = [
    '.section-head', '.method-grid article', '.perception-stats article',
    '.channel-compare', '.plain-conclusion', '.behavior-panel', '.data-alert',
    '.synthesis-flow article', '.synthesis-statement', '.pattern-grid article',
    '.principle-strip article', '.role-list li', '.prototype-grid figure',
    '.lead-role', '.case-outro .wrap', '.deep-dive'
  ];
  const revealNodes = [...document.querySelectorAll(revealSelectors.join(','))];
  revealNodes.forEach((node, index) => {
    node.classList.add('reveal');
    node.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
  });

  const graphBars = [...document.querySelectorAll(
    '.channel-row i, .intent-bars i, .home-bars i, .stack-track i, .search-compare i, .delta-chart i'
  )];
  graphBars.forEach((bar) => bar.classList.add('draw-bar'));

  const counters = [...document.querySelectorAll([
    '.perception-stats strong', '.channel-row strong', '.metric-pair strong',
    '.intent-bars strong', '.home-bars strong', '.journey-band strong', '.data-alert>strong'
  ].join(','))];
  const counterData = new WeakMap();
  counters.forEach((node) => {
    const original = node.textContent.trim();
    const match = original.match(/^([−-]?)([\d,]+(?:\.\d+)?)(.*)$/);
    if (!match) return;
    counterData.set(node, {
      sign: match[1],
      target: Number(match[2].replace(/,/g, '')),
      decimals: (match[2].split('.')[1] || '').length,
      suffix: match[3]
    });
    node.classList.add('counter-value');
  });

  const renderCounter = (node, value) => {
    const data = counterData.get(node);
    if (!data) return;
    const formatted = value.toLocaleString('ko-KR', {
      minimumFractionDigits: data.decimals,
      maximumFractionDigits: data.decimals
    });
    node.textContent = `${data.sign}${formatted}${data.suffix}`;
  };

  const animateCounter = (node) => {
    if (node.dataset.countDone) return;
    const data = counterData.get(node);
    if (!data) return;
    node.dataset.countDone = 'true';
    if (reduceMotion) {
      renderCounter(node, data.target);
      return;
    }
    const start = performance.now();
    const duration = 920;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      renderCounter(node, data.target * eased);
      if (progress < 1) requestAnimationFrame(tick);
      else renderCounter(node, data.target);
    };
    requestAnimationFrame(tick);
  };

  const animateNode = (node) => {
    node.classList.add('is-visible');
    node.querySelectorAll('.draw-bar').forEach((bar) => {
      requestAnimationFrame(() => bar.classList.add('is-drawn'));
    });
    node.querySelectorAll('.counter-value').forEach(animateCounter);
  };

  if ('IntersectionObserver' in window) {
    const motionObserver = new IntersectionObserver((entries, observer) => {
      entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
        animateNode(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: .18 });
    revealNodes.forEach((node) => motionObserver.observe(node));
  } else {
    revealNodes.forEach(animateNode);
  }

  document.querySelectorAll('.deep-dive').forEach((details) => {
    const label = details.querySelector('.summary-label');
    if (!label) return;
    const openText = '접기';
    const closedText = label.textContent;
    const syncLabel = () => { label.textContent = details.open ? openText : closedText; };
    details.addEventListener('toggle', syncLabel);
    syncLabel();
  });
})();
