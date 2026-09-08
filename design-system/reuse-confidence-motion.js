(() => {
  'use strict';

  const flow = document.querySelector('.reuse-confidence-flow');
  if (!flow) return;

  const nodes = Array.from(flow.querySelectorAll('.reuse-confidence-node'));
  const trustNodes = nodes.filter((node) => node.classList.contains('is-trust'));
  if (!nodes.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const STEP_DELAY = 600;
  const PULSE_DURATION = 1700;
  const FINAL_HOLD = 2000;
  const RESET_DURATION = 1700;
  const RESTART_DELAY = 2000;
  const STANDARD_CLASS = 'is-flow-pulse-standard';
  const TRUST_CLASS = 'is-flow-pulse-trust';
  const HELD_CLASS = 'is-flow-trust-held';
  const RESET_CLASS = 'is-flow-trust-resetting';
  const COPY_ACTIVE_CLASS = 'is-copy-trust-active';

  let active = false;
  let inFocus = false;
  let timers = [];
  let resetFrame = 0;

  const schedule = (callback, delay) => {
    const timer = window.setTimeout(callback, delay);
    timers.push(timer);
    return timer;
  };

  const clearTimers = () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers = [];
    if (resetFrame) {
      window.cancelAnimationFrame(resetFrame);
      resetFrame = 0;
    }
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

  const stop = () => {
    active = false;
    clearTimers();
    clearNodeClasses();
  };

  const pulseNode = (node) => {
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
      node.classList.remove(STANDARD_CLASS);
    }, PULSE_DURATION);
  };

  const beginGlobalReset = () => {
    if (!active || document.hidden || reducedMotion.matches) return;

    trustNodes.forEach((node) => {
      node.classList.remove(TRUST_CLASS, RESET_CLASS);
      node.classList.add(HELD_CLASS);
      setCopyState(node, true);
    });

    resetFrame = window.requestAnimationFrame(() => {
      resetFrame = window.requestAnimationFrame(() => {
        if (!active) return;
        trustNodes.forEach((node) => {
node.classList.add(RESET_CLASS);
node.classList.remove(HELD_CLASS);
        });
        resetFrame = 0;
      });
    });

    schedule(() => {
      if (!active) return;
      trustNodes.forEach((node) => {
        node.classList.remove(RESET_CLASS, HELD_CLASS, TRUST_CLASS, COPY_ACTIVE_CLASS);
        setCopyState(node, false);
      });
      schedule(() => {
        if (active && inFocus && !document.hidden && !reducedMotion.matches) runCycle();
      }, RESTART_DELAY);
    }, RESET_DURATION);
  };

  const runCycle = () => {
    if (!active || !inFocus || reducedMotion.matches || document.hidden) return;

    clearTimers();
    clearNodeClasses();

    nodes.forEach((node, index) => {
      schedule(() => {
        if (active && inFocus && !document.hidden) pulseNode(node);
      }, index * STEP_DELAY);
    });

    const sequenceEnd = ((nodes.length - 1) * STEP_DELAY) + PULSE_DURATION;
    schedule(beginGlobalReset, sequenceEnd + FINAL_HOLD);
  };

  const start = () => {
    if (active || reducedMotion.matches || document.hidden || !inFocus) return;
    active = true;
    runCycle();
  };

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    inFocus = Boolean(entry && entry.isIntersecting);
    if (inFocus) start();
    else stop();
  }, {
    root: null,
    rootMargin: '-25% 0px -25% 0px',
    threshold: 0.15
  });

  observer.observe(flow);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (inFocus) start();
  });

  const handleMotionChange = () => {
    if (reducedMotion.matches) stop();
    else if (inFocus) start();
  };
  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', handleMotionChange);
  } else if (typeof reducedMotion.addListener === 'function') {
    reducedMotion.addListener(handleMotionChange);
  }
})();
