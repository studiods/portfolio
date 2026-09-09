(() => {
  'use strict';

  /* REUSE 02.1 / shared motion */
  const inject02_1ArrowRule = () => {
    if (document.getElementById('reuse-02-1-arrow-rule')) return;
    const style = document.createElement('style');
    style.id = 'reuse-02-1-arrow-rule';
    style.textContent = `
      html body.reuse-current .reuse-proof-map__arrow{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:28px!important;width:100%!important;height:64px!important;min-height:64px!important;flex:0 0 64px!important;align-items:center!important;justify-items:center!important}
      html body.reuse-current .reuse-proof-map__arrow-item{position:relative!important;display:block!important;width:40px!important;height:32px!important}
      html body.reuse-current .reuse-proof-map__arrow-item::before,html body.reuse-current .reuse-proof-map__arrow-item::after{content:""!important;position:absolute!important;top:7px!important;width:22px!important;height:1px!important;background:rgba(255,255,255,.30)!important}
      html body.reuse-current .reuse-proof-map__arrow-item::before{left:0!important;transform:rotate(38deg)!important;transform-origin:left center!important}
      html body.reuse-current .reuse-proof-map__arrow-item::after{right:0!important;transform:rotate(-38deg)!important;transform-origin:right center!important}
      @media(max-width:780px){html body.reuse-current .reuse-proof-map__arrow{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:18px!important;height:56px!important;min-height:56px!important;flex-basis:56px!important}}
    `;
    document.head.appendChild(style);
  };

  /*
    REUSE 03.1 — use the canonical HIMART 02.5 / HOME horizontal-bar component.
    No local bar geometry is authored here. Only the data values and labels change.
  */
  const syncTrustChart = () => {
    const source = document.querySelector('#journey .reuse-image-evidence, #journey .reuse-image-trust-chart');
    if (!source) return;

    source.outerHTML = `
<div class="data-viz hm-ds-home-bars reuse-trust-home-bars" data-hm-chart>
  <div class="reuse-trust-chart-title">중고거래에서 중요하게 보는 요소</div>
  <div class="hm-ds-home-bar hm-ds-home-bar--blue" data-value="67.7">
    <span class="hm-ds-home-bar__label">판매자 신뢰</span>
    <div class="hm-ds-home-bar__track"><div class="hm-ds-home-bar__fill" style="width:100%"></div></div>
    <b class="hm-ds-home-bar__value">67.7%</b>
  </div>
  <div class="hm-ds-home-bar hm-ds-home-bar--blue-new" data-value="58.6">
    <span class="hm-ds-home-bar__label">거래 편리성</span>
    <div class="hm-ds-home-bar__track"><div class="hm-ds-home-bar__fill" style="width:86.56%"></div></div>
    <b class="hm-ds-home-bar__value">58.6%</b>
  </div>
  <div class="hm-ds-home-bar hm-ds-home-bar--green" data-value="49.8">
    <span class="hm-ds-home-bar__label">상품 상태 확인</span>
    <div class="hm-ds-home-bar__track"><div class="hm-ds-home-bar__fill" style="width:73.56%"></div></div>
    <b class="hm-ds-home-bar__value">49.8%</b>
  </div>
  <div class="hm-ds-home-bar hm-ds-home-bar--yellow" data-value="48.3">
    <span class="hm-ds-home-bar__label">가격</span>
    <div class="hm-ds-home-bar__track"><div class="hm-ds-home-bar__fill" style="width:71.34%"></div></div>
    <b class="hm-ds-home-bar__value">48.3%</b>
  </div>
  <div class="hm-ds-home-bar hm-ds-home-bar--white-34" data-value="29.0">
    <span class="hm-ds-home-bar__label">안전결제</span>
    <div class="hm-ds-home-bar__track"><div class="hm-ds-home-bar__fill" style="width:42.84%"></div></div>
    <b class="hm-ds-home-bar__value">29.0%</b>
  </div>
  <div class="hm-ds-home-bar hm-ds-home-bar--white-18" data-value="10.9">
    <span class="hm-ds-home-bar__label">플랫폼 대응</span>
    <div class="hm-ds-home-bar__track"><div class="hm-ds-home-bar__fill" style="width:16.10%"></div></div>
    <b class="hm-ds-home-bar__value">10.9%</b>
  </div>
  <div class="hm-source hm-ds-source-note">SOURCE · 전자신문 × 오픈서베이, 중고거래 플랫폼 이용 행태 조사, 2025 / 전국 20–59세 1,002명</div>
</div>`;
  };

  /* The HOME component has 18px row rhythm; preserve it and only change the requested title size. */
  const injectTrustChartTitleRule = () => {
    if (document.getElementById('reuse-trust-chart-title-rule')) return;
    const style = document.createElement('style');
    style.id = 'reuse-trust-chart-title-rule';
    style.textContent = `
      html body.reuse-current #journey .reuse-trust-home-bars{display:grid!important;gap:var(--hm-space-18)!important;width:100%!important;min-height:0!important;margin:0!important}
      html body.reuse-current #journey .reuse-trust-home-bars .reuse-trust-chart-title{grid-column:1/-1!important;margin:0 0 10px!important;color:var(--hm-text-primary)!important;font-family:var(--hm-font-ko)!important;font-size:16px!important;font-weight:300!important;line-height:1.3!important;letter-spacing:var(--hm-track-body)!important}
      html body.reuse-current #journey .reuse-trust-home-bars .hm-source{grid-column:1/-1!important}
    `;
    document.head.appendChild(style);
  };

  inject02_1ArrowRule();
  syncTrustChart();
  injectTrustChartTitleRule();

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
