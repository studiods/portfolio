(() => {
  'use strict';

  /*
    REUSE 03.1 — copy the visible HIMART 02.6 / LANDING → ACTION source verbatim.
    Do not translate, summarize, rename, recolor, or reinterpret the chart content.
  */
  const syncLandingActionSource = () => {
    const source = document.querySelector('.reuse-image-evidence');
    if (!source) return;

    source.className = 'data-viz landing-stack';
    source.setAttribute('aria-label', '기획전 시작 후 첫 다음 행동');
    source.innerHTML = `
      <div class="landing-chart landing-chart--verbatim">
        <h4>기획전 시작 후 첫 다음 행동</h4>
        <div class="stackbar">
          <i style="width:52.2%"></i>
          <i style="width:27.6%"></i>
          <i style="width:9.3%"></i>
          <i style="width:6.6%"></i>
          <i style="width:4.3%"></i>
        </div>
        <div class="stacklabels">
          <div><b>종료</b><strong>52.2%</strong></div>
          <div><b>재탐색</b><strong>27.6%</strong></div>
          <div><b>상품</b><strong>9.3%</strong></div>
          <div><b>검색</b><strong>6.6%</strong></div>
          <div><b>기타</b><strong>4.3%</strong></div>
        </div>
      </div>`;
  };

  syncLandingActionSource();

  const map = document.querySelector('.reuse-proof-map');
  if (!map) return;

  const anxietyNodes = Array.from(map.querySelectorAll('.reuse-proof-map__node--anxiety'));
  const solutionNodes = Array.from(map.querySelectorAll('.reuse-proof-map__node--solution'));
  const spacer = map.querySelector('.reuse-proof-map__arrow');
  if (!anxietyNodes.length || anxietyNodes.length !== solutionNodes.length || !spacer) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const STAGGER_RATIO = 0.30;
  const FINAL_HOLD = 6000;
  const RESET_DURATION = 2000;
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
    if (!token) return 2205;
    if (token.endsWith('ms')) return Number.parseFloat(token) || 2205;
    if (token.endsWith('s')) return (Number.parseFloat(token) || 2.205) * 1000;
    return Number.parseFloat(token) || 2205;
  };
  const getLaneDuration = () => cssTimeToMs(window.getComputedStyle(map).getPropertyValue('--reuse-proof-lane-duration'));
  const ensureSweepRings = () => {
    anxietyNodes.forEach((node) => {
      if (node.querySelector('.reuse-proof-sweep')) return;
      const sweep = document.createElement('span');
      sweep.className = 'reuse-proof-sweep';
      sweep.setAttribute('aria-hidden', 'true');
      node.appendChild(sweep);
    });
  };

  spacer.replaceChildren();
  ensureSweepRings();

  const clearState = () => {
    map.classList.remove(RESET_CLASS);
    anxietyNodes.forEach((node) => node.classList.remove(ACTIVE_CLASS));
    solutionNodes.forEach((node) => node.classList.remove(ACTIVE_CLASS));
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
    anxiety.classList.remove(ACTIVE_CLASS);
    solution.classList.remove(ACTIVE_CLASS);
    void anxiety.offsetWidth;
    anxiety.classList.add(ACTIVE_CLASS);
    solution.classList.add(ACTIVE_CLASS);
  };
  const resetCycle = () => {
    if (!active || !inFocus || document.hidden || reducedMotion.matches) return;
    map.classList.add(RESET_CLASS);
    void map.offsetWidth;
    anxietyNodes.forEach((node) => node.classList.remove(ACTIVE_CLASS));
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
    anxietyNodes.forEach((_, index) => schedule(() => runLane(index), index * stagger));
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
    if (inFocus) start(); else stop();
  }, { root:null, rootMargin:'-18% 0px -18% 0px', threshold:0.18 });
  observer.observe(map);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else if (inFocus) start();
  });
  const handleMotionChange = () => {
    if (reducedMotion.matches) stop(); else if (inFocus) start();
  };
  if (typeof reducedMotion.addEventListener === 'function') reducedMotion.addEventListener('change', handleMotionChange);
  else if (typeof reducedMotion.addListener === 'function') reducedMotion.addListener(handleMotionChange);
})();
