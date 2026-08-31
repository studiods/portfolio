(() => {
  'use strict';

  try {
  document.body.classList.add(
    'himart-narrative-ready',
    'narrative-v2-ready',
    'narrative-v2-final-ready',
    'himart-v18-ready'
  );
  document.body.classList.remove('himart-narrative-loading', 'himart-v18-loading');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealNow = element => {
    element.classList.add('is-in', 'is-wide-rise-in', 'is-title-rise-in', 'is-content-rise-in');
    if (element.classList.contains('v9-chart-motion')) {
      element.classList.add('is-v9-chart-active', 'is-chart-active', 'is-wide-chart-active');
    }
    if (element.classList.contains('ring-card')) element.classList.add('is-fast-chart-active');
  };

  const observe = elements => {
    if (reduced || !('IntersectionObserver' in window)) {
      elements.forEach(revealNow);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        revealNow(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold:.14, rootMargin:'0px 0px -7% 0px' });
    elements.forEach(element => observer.observe(element));
  };

  const smallUnits = [...document.querySelectorAll(
    '.narrative-subno,.synthesis-subno,.hm-subhead>.hm-subno,' +
    '.data-card-head>.hm-card-no,.prototype-case-copy>.hm-card-no,' +
    '.behavior-card>small,.narrative-title,.narrative-copy,' +
    '.journey-block-title,.journey-block-copy'
  )];
  smallUnits.forEach((element, index) => {
    element.classList.add('content-rise');
    element.style.setProperty('--rise-delay', `${(index % 3) * 70}ms`);
  });

  const revealTargets = [...new Set([
    ...document.querySelectorAll('.hm-reveal,.wide-rise-target,.title-rise-target,.content-rise'),
    ...document.querySelectorAll('.v9-chart-motion,.ring-card'),
  ])];
  observe(revealTargets);

  document.querySelectorAll('.ring-card[data-v15-pct]').forEach(card => {
    const percentage = Math.max(0, Math.min(100, Number(card.dataset.v15Pct) || 0));
    card.style.setProperty('--ring-angle', `${percentage * 3.6}deg`);
  });

  document.querySelectorAll('details.hm-more').forEach(details => {
    const summary = details.querySelector(':scope > summary');
    const close = details.querySelector(':scope > .hm-more-close');
    if (!summary || !close) return;
    close.addEventListener('click', () => {
      details.open = false;
      summary.scrollIntoView({ behavior:reduced ? 'auto' : 'smooth', block:'center' });
      summary.focus({ preventScroll:true });
    });
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      requestAnimationFrame(() => {
        details.querySelectorAll('.hm-reveal,.wide-rise-target,.title-rise-target,.content-rise,.v9-chart-motion,.ring-card')
          .forEach(revealNow);
        dispatchEvent(new Event('scroll'));
      });
    });
  });

  const sections = [...document.querySelectorAll('[data-chapter]')];
  const links = [...document.querySelectorAll('.hm-progress a')];
  let ticking = false;
  const updateProgress = () => {
    ticking = false;
    let active = 0;
    let nearest = Infinity;
    sections.forEach((section, index) => {
      const distance = Math.abs(section.getBoundingClientRect().top - innerHeight * .33);
      if (distance < nearest) { nearest = distance; active = index; }
    });
    links.forEach((link, index) => link.classList.toggle('is-active', index === active));
  };
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateProgress);
  }, { passive:true });
  updateProgress();
  document.documentElement.classList.add('hm-motion-stable');
  } catch (error) {
    document.documentElement.classList.add('hm-motion-fallback');
    console.error('[Himart] Motion initialization failed; content was restored.', error);
  }
})();
