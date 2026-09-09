(() => {
  'use strict';

  /*
    REUSE 03.1 — exact 02.6 / LANDING → ACTION source sync.
    The approved source is the actual himart_backup_02/himart.html 02.6 DOM,
    not a previously recreated visualization. Keep the structure, data and
    class names identical so the shared landing-action.css renders the same component.
  */
  const syncLandingActionSource = () => {
    const source = document.querySelector('.reuse-image-evidence');
    if (!source) return;

    source.outerHTML = `
<div class="data-viz landing-stack">
  <div class="landing-chart">
    <h4>기획전 시작 후 첫 다음 행동</h4>
    <div class="stackbar">
      <i style="width:52.2%;--c:var(--hm-red)"></i>
      <i style="width:27.6%;--c:var(--hm-blue)"></i>
      <i style="width:9.3%;--c:var(--hm-newblue)"></i>
      <i style="width:6.6%;--c:var(--hm-green)"></i>
      <i style="width:4.3%;--c:var(--hm-yellow)"></i>
    </div>
    <div class="stacklabels">
      <div><b>52.2%</b>바로 종료</div>
      <div><b>27.6%</b>기획전 재탐색 후 종료</div>
      <div><b>9.3%</b>상품 도달</div>
      <div><b>6.6%</b>검색/카테고리 도달</div>
    </div>
  </div>
  <div class="landing-chart">
    <h4>PDP 이후 행동 · 2025 H1 vs 2026 H1</h4>
    <div class="pdp-columns">
      <div class="pdp-col">
        <i style="height:93%;--c:var(--hm-blue)"></i>
        <i style="height:100%;--c:var(--hm-yellow)"></i>
        <span>PDP 이용<br>10.09M → 10.87M</span>
      </div>
      <div class="pdp-col">
        <i style="height:100%;--c:var(--hm-blue)"></i>
        <i style="height:80%;--c:var(--hm-yellow)"></i>
        <span>장바구니<br>227,462 → 181,913</span>
      </div>
      <div class="pdp-col">
        <i style="height:100%;--c:var(--hm-blue)"></i>
        <i style="height:83%;--c:var(--hm-yellow)"></i>
        <span>구매<br>333,664 → 277,167</span>
      </div>
    </div>
    <div class="chart-legend">
      <span><i style="--c:var(--hm-blue)"></i>2025 H1</span>
      <span><i style="--c:var(--hm-yellow)"></i>2026 H1</span>
    </div>
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
