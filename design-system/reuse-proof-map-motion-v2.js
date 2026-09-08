(() => {
  'use strict';

  const map = document.querySelector('.reuse-proof-map');
  if (!map) return;

  const anxietyNodes = Array.from(map.querySelectorAll('.reuse-proof-map__node--anxiety'));
  const solutionNodes = Array.from(map.querySelectorAll('.reuse-proof-map__node--solution'));
  const connectorStage = map.querySelector('.reuse-proof-map__arrow');
  if (!anxietyNodes.length || anxietyNodes.length !== solutionNodes.length || !connectorStage) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const LANE_DURATION = 2500;
  const STAGGER = LANE_DURATION * 0.30;
  const RING_DURATION = 1500;
  const CONNECTOR_DURATION = 600;
  const FINAL_HOLD = 5000;
  const RESET_DURATION = 1200;
  const RESTART_DELAY = 900;

  const RING_CLASS = 'is-proof-ring-running';
  const CONNECTOR_RUN_CLASS = 'is-proof-connector-running';
  const CONNECTOR_HELD_CLASS = 'is-proof-connector-held';
  const SOLUTION_FILLED_CLASS = 'is-proof-solution-filled';
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

  const ensureSweepRings = () => {
    anxietyNodes.forEach((node) => {
      if (node.querySelector('.reuse-proof-sweep')) return;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'reuse-proof-sweep');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('aria-hidden', 'true');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('class', 'reuse-proof-sweep__ring');
      circle.setAttribute('cx', '50');
      circle.setAttribute('cy', '50');
      circle.setAttribute('r', '49');
      circle.setAttribute('pathLength', '100');
      svg.appendChild(circle);
      node.appendChild(svg);
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
          <line class="reuse-proof-connector__base" x1="6" y1="0" x2="6" y2="120" pathLength="100"></line>
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
    anxietyNodes.forEach((node) => node.classList.remove(RING_CLASS));
    solutionNodes.forEach((node) => node.classList.remove(SOLUTION_FILLED_CLASS));
    connectors.forEach((connector) => connector.classList.remove(CONNECTOR_RUN_CLASS, CONNECTOR_HELD_CLASS));
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

    anxiety.classList.remove(RING_CLASS);
    connector.classList.remove(CONNECTOR_RUN_CLASS, CONNECTOR_HELD_CLASS);
    solution.classList.remove(SOLUTION_FILLED_CLASS);
    void anxiety.offsetWidth;

    anxiety.classList.add(RING_CLASS);

    schedule(() => {
      if (!active || !inFocus) return;
      anxiety.classList.remove(RING_CLASS);
      connector.classList.add(CONNECTOR_RUN_CLASS);
    }, RING_DURATION);

    schedule(() => {
      if (!active || !inFocus) return;
      connector.classList.remove(CONNECTOR_RUN_CLASS);
      connector.classList.add(CONNECTOR_HELD_CLASS);
      solution.classList.add(SOLUTION_FILLED_CLASS);
    }, RING_DURATION + CONNECTOR_DURATION);
  };

  const resetCycle = () => {
    if (!active || !inFocus || document.hidden || reducedMotion.matches) return;

    map.classList.add(RESET_CLASS);
    anxietyNodes.forEach((node) => node.classList.remove(RING_CLASS));
    solutionNodes.forEach((node) => node.classList.remove(SOLUTION_FILLED_CLASS));
    connectors.forEach((connector) => connector.classList.remove(CONNECTOR_RUN_CLASS));

    schedule(() => {
      if (!active) return;
      connectors.forEach((connector) => connector.classList.remove(CONNECTOR_HELD_CLASS));
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

    anxietyNodes.forEach((_, index) => {
      schedule(() => runLane(index), index * STAGGER);
    });

    const finalLaneEnd = ((anxietyNodes.length - 1) * STAGGER) + LANE_DURATION;
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
    reducedMotion.addListener(handleMotionChange);
  }
})();
