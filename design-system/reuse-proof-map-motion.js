(() => {
  'use strict';

  const map = document.querySelector('.reuse-proof-map');
  if (!map) return;

  const anxietyNodes = Array.from(map.querySelectorAll('.reuse-proof-map__node--anxiety'));
  const solutionNodes = Array.from(map.querySelectorAll('.reuse-proof-map__node--solution'));
  const connectorStage = map.querySelector('.reuse-proof-map__arrow');
  if (!anxietyNodes.length || anxietyNodes.length !== solutionNodes.length || !connectorStage) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const STAGGER_RATIO = 0.30;
  const FINAL_HOLD = 5000;
  const RESET_DURATION = 1200;
  const RESTART_DELAY = 900;

  const ACTIVE_CLASS = 'is-proof-lane-running';
  const RESET_CLASS = 'is-proof-resetting';

  let timers = [];
  let active = false;
  let inFocus = false;

  const schedule = (callback, delay) => {
    const timer = window.setTimeout(callback, delay);
    timers.push(timer);
    return timer;
  };

  const clearTimers = () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers = [];
  };

  const cssTimeToMs = (value) => {
    const token = String(value || '').trim();
    if (!token) return 2000;
    if (token.endsWith('ms')) return Number.parseFloat(token) || 2000;
    if (token.endsWith('s')) return (Number.parseFloat(token) || 2) * 1000;
    return Number.parseFloat(token) || 2000;
  };

  const getLaneDuration = () => {
    const styles = window.getComputedStyle(map);
    return cssTimeToMs(styles.getPropertyValue('--reuse-proof-lane-duration'));
  };

  const ensureSweepRings = () => {
    anxietyNodes.forEach((node) => {
      if (node.querySelector('.reuse-proof-sweep')) return;
      const sweep = document.createElement('span');
      sweep.className = 'reuse-proof-sweep';
      sweep.setAttribute('aria-hidden', 'true');
      node.appendChild(sweep);
    });
  };

  const buildConnectors = () => {
    connectorStage.innerHTML = '';
    return anxietyNodes.map((_, index) => {
      const connector = document.createElement('div');
      connector.className = 'reuse-proof-connector';
      connector.dataset.proofConnector = String(index);
      connector.innerHTML = `
        <svg viewBox="0 0 12 120" preserveAspectRatio="none" aria-hidden="true">
          <line class="reuse-proof-connector__active" x1="6" y1="0" x2="6" y2="120" pathLength="100"></line>
        </svg>`;
      connectorStage.appendChild(connector);
      return connector;
    });
  };

  ensureSweepRings();
  const connectors = buildConnectors();

  const clearState = () => {
    map.classList.remove(RESET_CLASS);
    anxietyNodes.forEach((node) => node.classList.remove(ACTIVE_CLASS));
    solutionNodes.forEach((node) => node.classList.remove(ACTIVE_CLASS));
    connectors.forEach((connector) => connector.classList.remove(ACTIVE_CLASS));
  };

  const stop = () => {
    active = false;
    clearTimers();
    clearState();
  };

  const runLane = (index) => {
    if (!active || !inFocus || document.hidden || reducedMotion.matches) return;

    const anxiety = anxietyNodes[index];
    const solution = solutionNodes[index];
    const connector = connectors[index];

    anxiety.classList.remove(ACTIVE_CLASS);
    connector.classList.remove(ACTIVE_CLASS);
    solution.classList.remove(ACTIVE_CLASS);
    void anxiety.offsetWidth;

    // One synchronized timeline owns ring, hand-off, connector and fill.
    // Phase timing is expressed only as percentages in CSS, so there is no
    // separate per-animation second setting and no JS buffer between phases.
    anxiety.classList.add(ACTIVE_CLASS);
    connector.classList.add(ACTIVE_CLASS);
    solution.classList.add(ACTIVE_CLASS);
  };

  const resetCycle = () => {
    if (!active || !inFocus || document.hidden || reducedMotion.matches) return;

    map.classList.add(RESET_CLASS);
    anxietyNodes.forEach((node) => node.classList.remove(ACTIVE_CLASS));
    connectors.forEach((connector) => connector.classList.remove(ACTIVE_CLASS));
    solutionNodes.forEach((node) => node.classList.remove(ACTIVE_CLASS));

    schedule(() => {
      if (!active) return;
      map.classList.remove(RESET_CLASS);
      schedule(() => {
        if (active && inFocus && !document.hidden && !reducedMotion.matches) runCycle();
      }, RESTART_DELAY);
    }, RESET_DURATION);
  };

  const runCycle = () => {
    if (!active || !inFocus || document.hidden || reducedMotion.matches) return;
    clearTimers();
    clearState();

    const laneDuration = getLaneDuration();
    const stagger = laneDuration * STAGGER_RATIO;

    anxietyNodes.forEach((_, index) => {
      schedule(() => runLane(index), index * stagger);
    });

    const finalLaneEnd = ((anxietyNodes.length - 1) * stagger) + laneDuration;
    schedule(resetCycle, finalLaneEnd + FINAL_HOLD);
  };

  const start = () => {
    if (active || !inFocus || document.hidden || reducedMotion.matches) return;
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
    rootMargin: '-18% 0px -18% 0px',
    threshold: 0.18
  });

  observer.observe(map);

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
    reducedMotion.addListener('change', handleMotionChange);
  }
})();