(() => {
  'use strict';

  /* REUSE 02.6 — authoritative LANDING → ACTION source. */
  const inject02_1ArrowRule = () => {
    if (document.getElementById('reuse-02-1-arrow-rule')) return;
    const style = document.createElement('style');
    style.id = 'reuse-02-1-arrow-rule';
    style.textContent = `
      html body.reuse-current .reuse-proof-map__arrow{
        display:grid!important;
        grid-template-columns:repeat(4,minmax(0,1fr))!important;
        gap:28px!important;
        width:100%!important;
        height:64px!important;
        min-height:64px!important;
        flex:0 0 64px!important;
        align-items:center!important;
        justify-items:center!important;
      }
      html body.reuse-current .reuse-proof-map__arrow-item{
        position:relative!important;
        display:block!important;
        width:40px!important;
        height:32px!important;
      }
      /* 1px white line, 30% opacity, downward open arrow head only. */
      html body.reuse-current .reuse-proof-map__arrow-item::before,
      html body.reuse-current .reuse-proof-map__arrow-item::after{
        content:""!important;
        position:absolute!important;
        top:7px!important;
        width:22px!important;
        height:1px!important;
        background:rgba(255,255,255,.30)!important;
      }
      html body.reuse-current .reuse-proof-map__arrow-item::before{
        left:0!important;
        transform:rotate(38deg)!important;
        transform-origin:left center!important;
      }
      html body.reuse-current .reuse-proof-map__arrow-item::after{
        right:0!important;
        transform:rotate(-38deg)!important;
        transform-origin:right center!important;
      }
      @media(max-width:780px){
        html body.reuse-current .reuse-proof-map__arrow{
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:18px!important;
          height:56px!important;
          min-height:56px!important;
          flex-basis:56px!important;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const syncLandingActionSource = () => {
    const source = document.querySelector('#journey .reuse-image-evidence');
    if (!source) return;
    source.outerHTML = `
<div class="data-viz landing-stack reuse-image-evidence">
  <div class="landing-chart landing-chart--verbatim">
    <h4>기획전 시작 후 첫 다음 행동</h4>
    <div class="stackbar" aria-hidden="true">
      <i style="width:52.2%;--c:var(--hm-red)"></i><i style="width:27.6%;--c:var(--hm-blue)"></i><i style="width:9.3%;--c:var(--hm-newblue)"></i><i style="width:6.6%;--c:var(--hm-green)"></i><i style="width:4.3%;--c:var(--hm-yellow)"></i>
    </div>
    <div class="stacklabels"><div><b>52.2%</b>바로 종료</div><div><b>27.6%</b>기획전 재탐색 후 종료</div><div><b>9.3%</b>상품 도달</div><div><b>6.6%</b>검색/카테고리 도달</div></div>
    <div class="landing-research-signal"><span>RESEARCH SIGNAL</span><p>가격이 중고를 보게 만들었다면, 신뢰할 수 있는 근거가 선택을 완성하게 해야 했습니다.</p><small>리서치에서 확인된 핵심 판단 기준 · 상품 상태 · 판매자 신뢰 · 거래 안전성 · 전문 판매처</small></div>
  </div>
</div>`;
  };

  inject02_1ArrowRule();
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
  const schedule = (callback, delay) => { const timer = window.setTimeout(callback, delay); timers.push(timer); return timer; };
  const clearTimers = () => { timers.forEach((timer) => window.clearTimeout(timer)); timers = []; };
  const cssTimeToMs = (value) => { const token = String(value || '').trim(); if (!token) return 2205; if (token.endsWith('ms')) return Number.parseFloat(token) || 2205; if (token.endsWith('s')) return (Number.parseFloat(token) || 2.205) * 1000; return Number.parseFloat(token) || 2205; };
  const getLaneDuration = () => cssTimeToMs(window.getComputedStyle(map).getPropertyValue('--reuse-proof-lane-duration'));
  const ensureSweepRings = () => { anxietyNodes.forEach((node) => { if (node.querySelector('.reuse-proof-sweep')) return; const sweep = document.createElement('span'); sweep.className = 'reuse-proof-sweep'; sweep.setAttribute('aria-hidden','true'); node.appendChild(sweep); }); };

  /* Four vertical connectors: one arrow head for each upper/lower circle pair. */
  spacer.replaceChildren();
  spacer.setAttribute('aria-hidden','true');
  for (let index = 0; index < anxietyNodes.length; index += 1) {
    const arrow = document.createElement('span');
    arrow.className = 'reuse-proof-map__arrow-item';
    arrow.setAttribute('aria-hidden','true');
    spacer.appendChild(arrow);
  }
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
