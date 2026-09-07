(() => {
  'use strict';

  const flow = document.querySelector('.reuse-confidence-flow');
  if (!flow) return;

  const nodes = Array.from(flow.querySelectorAll('.reuse-confidence-node'));
  if (!nodes.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const STEP_DELAY = 1000;
  const PULSE_DURATION = 2000;
  const CYCLE_PAUSE = 1500;
  const CYCLE_DURATION = ((nodes.length - 1) * STEP_DELAY) + PULSE_DURATION + CYCLE_PAUSE;
  const STANDARD_CLASS = 'is-flow-pulse-standard';
  const TRUST_CLASS = 'is-flow-pulse-trust';

  let active = false;
  let cycleTimer = 0;
  let nodeTimers = [];

  const clearNodeClasses = () => {
    nodes.forEach((node) => node.classList.remove(STANDARD_CLASS, TRUST_CLASS));
  };

  const stop = () => {
    active = false;
    window.clearTimeout(cycleTimer);
    nodeTimers.forEach((timer) => window.clearTimeout(timer));
    nodeTimers = [];
    clearNodeClasses();
  };

  const pulseNode = (node) => {
    node.classList.remove(STANDARD_CLASS, TRUST_CLASS);
    void node.offsetWidth;
    node.classList.add(node.classList.contains('is-trust') ? TRUST_CLASS : STANDARD_CLASS);
    const cleanup = window.setTimeout(() => {
      node.classList.remove(STANDARD_CLASS, TRUST_CLASS);
    }, PULSE_DURATION);
    nodeTimers.push(cleanup);
  };

  const runCycle = () => {
    if (!active || reducedMotion.matches || document.hidden) return;
    nodeTimers.forEach((timer) => window.clearTimeout(timer));
    nodeTimers = [];
    clearNodeClasses();

    nodes.forEach((node, index) => {
      const timer = window.setTimeout(() => {
        if (active && !document.hidden) pulseNode(node);
      }, index * STEP_DELAY);
      nodeTimers.push(timer);
    });

    cycleTimer = window.setTimeout(runCycle, CYCLE_DURATION);
  };

  const start = () => {
    if (active || reducedMotion.matches || document.hidden) return;
    active = true;
    runCycle();
  };

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry && entry.isIntersecting) start();
    else stop();
  }, {
    root: null,
    rootMargin: '-25% 0px -25% 0px',
    threshold: 0.15
  });

  observer.observe(flow);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });

  const handleMotionChange = () => {
    if (reducedMotion.matches) stop();
  };
  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', handleMotionChange);
  } else if (typeof reducedMotion.addListener === 'function') {
    reducedMotion.addListener(handleMotionChange);
  }
})();
