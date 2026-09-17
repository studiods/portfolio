(() => {
  'use strict';

  const flow = document.querySelector('.reuse-confidence-flow');
  if (!flow) return;

  const nodes = Array.from(flow.querySelectorAll('.reuse-confidence-node'));
  if (!nodes.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const STEP_DELAY = 600;
  const PULSE_DURATION = 1700;
  const STANDARD_CLASS = 'is-flow-pulse-standard';
  const TRUST_CLASS = 'is-flow-pulse-trust';
  const HELD_CLASS = 'is-flow-trust-held';
  const RESET_CLASS = 'is-flow-trust-resetting';
  const COPY_ACTIVE_CLASS = 'is-copy-trust-active';

  let active = false;
  let inFocus = false;
  let hasPlayed = false;
  let timers = [];

  const schedule = (callback, delay) => {
    const timer = window.setTimeout(callback, delay);
    timers.push(timer);
    return timer;
  };

  const clearTimers = () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers = [];
  };

  const setCopyState = (node, trustActive) => {
    if (!node.classList.contains('is-trust')) return;
    const baseCopies = node.querySelectorAll('[data-reuse-copy-base]');
    const trustCopies = node.querySelectorAll('[data-reuse-copy-trust]');
    node.classList.toggle(COPY_ACTIVE_CLASS, trustActive);
    baseCopies.forEach((copy) => copy.setAttribute('aria-hidden', trustActive ? 'true' : 'false'));
    trustCopies.forEach((copy) => copy.setAttribute('aria-hidden', trustActive ? 'false' : 'true'));
  };

  const clearNodeClasses = () => {
    nodes.forEach((node) => {
      node.classList.remove(STANDARD_CLASS, TRUST_CLASS, HELD_CLASS, RESET_CLASS, COPY_ACTIVE_CLASS);
      setCopyState(node, false);
    });
  };

  const pulseNode = (node) => {
    if (!active) return;

    node.classList.remove(STANDARD_CLASS, TRUST_CLASS, HELD_CLASS, RESET_CLASS);
    void node.offsetWidth;

    if (node.classList.contains('is-trust')) {
      setCopyState(node, true);
      node.classList.add(TRUST_CLASS);
      schedule(() => {
        if (!active) return;
        node.classList.remove(TRUST_CLASS);
        node.classList.add(HELD_CLASS);
      }, PULSE_DURATION);
      return;
    }

    node.classList.add(STANDARD_CLASS);
    schedule(() => {
      if (!active) return;
      node.classList.remove(STANDARD_CLASS);
    }, PULSE_DURATION);
  };

  const runOnce = () => {
    if (!active || reducedMotion.matches) return;

    clearTimers();
    clearNodeClasses();

    nodes.forEach((node, index) => {
      schedule(() => pulseNode(node), index * STEP_DELAY);
    });
  };

  const start = () => {
    if (active || hasPlayed || reducedMotion.matches || document.hidden || !inFocus) return;
    active = true;
    hasPlayed = true;
    runOnce();
  };

  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    if (!reducedMotion.matches) {
      inFocus = true;
      start();
    }
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    inFocus = Boolean(entry && entry.isIntersecting);
    if (inFocus) {
      start();
      if (hasPlayed) observer.unobserve(flow);
    }
  }, {
    root: null,
    rootMargin: '-25% 0px -25% 0px',
    threshold: 0.15
  });

  observer.observe(flow);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && inFocus) start();
  });

  const handleMotionChange = () => {
    if (!reducedMotion.matches && inFocus) start();
  };
  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', handleMotionChange);
  } else if (typeof reducedMotion.addListener === 'function') {
    reducedMotion.addListener(handleMotionChange);
  }
})();
