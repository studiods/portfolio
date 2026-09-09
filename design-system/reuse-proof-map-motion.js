(() => {
  'use strict';

  /* REUSE 02.1 / shared motion + REUSE 03 editorial copy / bar focus motion. */
  const inject02_1ArrowRule = () => {
    if (document.getElementById('reuse-02-1-arrow-rule')) return;
    const style = document.createElement('style');
    style.id = 'reuse-02-1-arrow-rule';
    style.textContent = `
      html body.reuse-current .reuse-proof-map__arrow{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:28px!important;width:100%!important;height:64px!important;min-height:64px!important;flex:0 0 64px!important;align-items:center!important;justify-items:center!important}
      html body.reuse-current .reuse-proof-map__arrow-item{position:relative!important;display:block!important;width:56px!important;height:24px!important;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='24' viewBox='0 0 56 24'%3E%3Cpath d='M3 2 L28 22 L53 2' fill='none' stroke='%23FFFFFF' stroke-opacity='.30' stroke-width='1' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E") center/56px 24px no-repeat!important}
      html body.reuse-current .reuse-proof-map__arrow-item::before,html body.reuse-current .reuse-proof-map__arrow-item::after{content:none!important;display:none!important}
      @media(max-width:980px) and (min-width:781px){html body.reuse-current .reuse-proof-map__arrow{gap:20px!important}}
      @media(max-width:780px){html body.reuse-current .reuse-proof-map__arrow{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:18px!important;height:56px!important;min-height:56px!important;flex-basis:56px!important}}
    `;
    document.head.appendChild(style);
  };

  const syncJourneyCopy = () => {
    const journey = document.querySelector('#journey');
    if (!journey) return;

    const chapterTitle = journey.querySelector('.hm-section-head .hm-section-title');
    if (chapterTitle) chapterTitle.innerHTML = '무엇보다 이미지와 영상으로<br>신뢰를 구축하기 위해 노력했습니다.';

    const sections = Array.from(journey.querySelectorAll('.hm-subsection'));
    const findSection = (number) => sections.find((section) => {
      const subno = section.querySelector('.hm-subno');
      return (subno?.textContent || '').trim() === number;
    });

    const section03_1 = findSection('03.1');
    const title03_1 = section03_1?.querySelector('.hm-subtitle');
    if (title03_1) title03_1.innerHTML = '신뢰, 편의성 제외하고는<br>이미지가 가장 중요한 요소였습니다.';

    const section03_2 = findSection('03.2');
    const title03_2 = section03_2?.querySelector('.hm-subtitle');
    if (title03_2) title03_2.innerHTML = '이 중요한 이미지 정보를 어떻게 잘 전달할지<br>방법과 순서를 고민했습니다.';

    const section03_3 = findSection('03.3');
    const title03_3 = section03_3?.querySelector('.hm-subtitle');
    if (title03_3) title03_3.innerHTML = '역할 제한없이 촬영 환경과 기준,<br>그리고 AI 영상 제작까지 직접 설계하고 제작했습니다.';
  };

  const initReferenceBars = () => {
    const chart = document.querySelector('#journey .reuse-reference-bars');
    if (!chart) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inFocus = false;

    const show = () => {
      chart.classList.remove('is-bars-focused');
      void chart.offsetWidth;
      chart.classList.add('is-bars-focused');
    };
    const hide = () => chart.classList.remove('is-bars-focused');

    if (reduced.matches || !('IntersectionObserver' in window)) {
      chart.classList.add('is-bars-focused');
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      const nextFocus = Boolean(entry?.isIntersecting);
      if (nextFocus && !inFocus) show();
      if (!nextFocus && inFocus) hide();
      inFocus = nextFocus;
    }, { root:null, rootMargin:'-16% 0px -16% 0px', threshold:0.22 });

    observer.observe(chart);

    const handleMotionChange = () => {
      if (reduced.matches) chart.classList.add('is-bars-focused');
      else if (inFocus) show();
      else hide();
    };
    if (typeof reduced.addEventListener === 'function') reduced.addEventListener('change', handleMotionChange);
    else if (typeof reduced.addListener === 'function') reduced.addListener(handleMotionChange);
  };

  inject02_1ArrowRule();
  syncJourneyCopy();
  initReferenceBars();

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
  const schedule = (callback, delay) => { const timer = window.setTimeout(callback, delay); timers.push(timer); return timer; };
  const clearTimers = () => { timers.forEach((timer) => window.clearTimeout(timer)); timers = []; };
  const cssTimeToMs = (value) => { const token = String(value || '').trim(); if (!token) return 2205; if (token.endsWith('ms')) return Number.parseFloat(token) || 2205; if (token.endsWith('s')) return (Number.parseFloat(token) || 2.205) * 1000; return Number.parseFloat(token) || 2205; };
  const getLaneDuration = () => cssTimeToMs(window.getComputedStyle(map).getPropertyValue('--reuse-proof-lane-duration'));
  const ensureSweepRings = () => { anxietyNodes.forEach((node) => { if (node.querySelector('.reuse-proof-sweep')) return; const sweep = document.createElement('span'); sweep.className = 'reuse-proof-sweep'; sweep.setAttribute('aria-hidden','true'); node.appendChild(sweep); }); };
  spacer.replaceChildren();
  spacer.setAttribute('aria-hidden','true');
  for (let index = 0; index < anxietyNodes.length; index += 1) { const arrow = document.createElement('span'); arrow.className = 'reuse-proof-map__arrow-item'; arrow.setAttribute('aria-hidden','true'); spacer.appendChild(arrow); }
  ensureSweepRings();
  const clearState = () => { map.classList.remove(RESET_CLASS); anxietyNodes.forEach((node) => node.classList.remove(ACTIVE_CLASS)); solutionNodes.forEach((node) => node.classList.remove(ACTIVE_CLASS)); };
  const stop = () => { active = false; clearTimers(); clearState(); };
  const runLane = (index) => { if (!active || !inFocus || document.hidden || reducedMotion.matches) return; const anxiety = anxietyNodes[index]; const solution = solutionNodes[index]; anxiety.classList.remove(ACTIVE_CLASS); solution.classList.remove(ACTIVE_CLASS); void anxiety.offsetWidth; anxiety.classList.add(ACTIVE_CLASS); solution.classList.add(ACTIVE_CLASS); };
  const resetCycle = () => { if (!active || !inFocus || document.hidden || reducedMotion.matches) return; map.classList.add(RESET_CLASS); void map.offsetWidth; anxietyNodes.forEach((node) => node.classList.remove(ACTIVE_CLASS)); solutionNodes.forEach((node) => node.classList.remove(ACTIVE_CLASS)); schedule(() => { if (!active) return; map.classList.remove(RESET_CLASS); schedule(() => { if (active && inFocus && !document.hidden && !reducedMotion.matches) runCycle(); }, RESTART_DELAY); }, RESET_DURATION); };
  const runCycle = () => { if (!active || !inFocus || document.hidden || reducedMotion.matches) return; clearTimers(); clearState(); const laneDuration = getLaneDuration(); const stagger = laneDuration * STAGGER_RATIO; anxietyNodes.forEach((_, index) => schedule(() => runLane(index), index * stagger)); const finalLaneEnd = ((anxietyNodes.length - 1) * stagger) + laneDuration; schedule(resetCycle, finalLaneEnd + FINAL_HOLD); };
  const start = () => { if (active || !inFocus || document.hidden || reducedMotion.matches) return; active = true; runCycle(); };
  const observer = new IntersectionObserver((entries) => { const entry = entries[0]; inFocus = Boolean(entry && entry.isIntersecting); if (inFocus) start(); else stop(); }, {root:null, rootMargin:'-18% 0px -18% 0px', threshold:0.18});
  observer.observe(map);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (inFocus) start(); });
  const handleMotionChange = () => { if (reducedMotion.matches) stop(); else if (inFocus) start(); };
  if (typeof reducedMotion.addEventListener === 'function') reducedMotion.addEventListener('change', handleMotionChange); else if (typeof reducedMotion.addListener === 'function') reducedMotion.addListener(handleMotionChange);
})();
