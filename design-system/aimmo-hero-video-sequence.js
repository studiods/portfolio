/* AIMMO hero video sequence + 03.1 Himart journey structure sync. */
(() => {
  'use strict';

  const mountAimmoJourney = () => {
    const root = document.querySelector('.aimmo-system-page #journey .aimmo-ownership-journey');
    if (!root || root.dataset.himartJourneyMounted === '1') return;

    root.dataset.himartJourneyMounted = '1';
    root.innerHTML = `
      <div class="journey-stage-flow flow-groups">
        <div class="flow-group">
          <div class="flow-row">
            <div class="wide-flow-cluster v12-journey-tablet v12-tablet-blue wide-flow-cluster--focus">
              <div class="wide-flow-cluster-label">기준을 나누고 각 영역의 오너십으로 실행</div>
              <div class="wide-flow-cluster-inner">
                <article class="flow-node"><span class="hm-card-no">01</span><h4>TYPE</h4><p>폰트 위계와 텍스트 규칙</p></article>
                <div class="flow-arrow" aria-hidden="true">›</div>
                <article class="flow-node"><span class="hm-card-no">02</span><h4>COLOR</h4><p>상태와 행동 컬러 체계</p></article>
              </div>
            </div>
            <div class="flow-arrow" aria-hidden="true">›</div>
            <article class="flow-node"><span class="hm-card-no">03</span><h4>GRAPHIC</h4><p>그래픽 스타일과 표현 기준</p></article>
          </div>
        </div>
        <div class="flow-group">
          <div class="flow-row">
            <div class="wide-flow-cluster v12-journey-tablet v12-tablet-blue wide-flow-cluster--focus">
              <div class="wide-flow-cluster-label">지속적인 리뷰와 공유로 싱크를 맞춤</div>
              <div class="wide-flow-cluster-inner">
                <article class="flow-node"><span class="hm-card-no">04</span><h4>COMPONENT</h4><p>코어 컴포넌트와 상태 정의</p></article>
                <div class="flow-arrow" aria-hidden="true">›</div>
                <article class="flow-node"><span class="hm-card-no">05</span><h4>TOKEN</h4><p>개발과 공유할 공통 값</p></article>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  };

  mountAimmoJourney();

  const primary = document.querySelector('.aimmo-system-page [data-aimmo-video-sequence]');
  if (!primary) return;

  const sources = (primary.dataset.aimmoVideoSequence || '')
    .split('|').map(v => v.trim()).filter(Boolean);
  if (sources.length < 2) return;

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    primary.loop = true;
    primary.play?.().catch?.(() => {});
    return;
  }

  primary.loop = false;
  primary.removeAttribute('loop');
  primary.muted = true;
  primary.playsInline = true;
  primary.classList.add('is-aimmo-sequence-front');
  primary.style.opacity = '1';

  const secondary = primary.cloneNode(true);
  secondary.removeAttribute('data-aimmo-video-sequence');
  secondary.querySelectorAll('source').forEach(n => n.remove());
  secondary.src = sources[1];
  secondary.classList.remove('is-aimmo-sequence-front');
  secondary.classList.add('is-aimmo-sequence-back');
  secondary.style.opacity = '0';
  secondary.pause();
  primary.parentNode.insertBefore(secondary, primary);

  let current = primary;
  let next = secondary;
  let index = 0;
  let switching = false;

  const loadNext = () => {
    const nextIndex = (index + 1) % sources.length;
    if (next.src !== new URL(sources[nextIndex], location.href).href) {
      next.src = sources[nextIndex];
      next.preload = 'auto';
      next.load();
    }
  };

  const finishSwitch = () => {
    current.pause();
    current.style.opacity = '0';
    [current, next] = [next, current];
    index = (index + 1) % sources.length;
    current.style.opacity = '1';
    next.style.opacity = '0';
    switching = false;
    loadNext();
  };

  const beginSwitch = () => {
    if (switching) return;
    switching = true;
    const play = next.play?.();
    if (play && play.catch) play.catch(() => {});
    requestAnimationFrame(() => {
      next.style.opacity = '1';
      current.style.opacity = '0';
      window.setTimeout(finishSwitch, 360);
    });
  };

  const monitor = () => {
    if (!current.duration || switching) return;
    if (current.duration - current.currentTime <= .34) beginSwitch();
  };

  primary.addEventListener('timeupdate', monitor);
  secondary.addEventListener('timeupdate', monitor);
  primary.addEventListener('ended', beginSwitch);
  secondary.addEventListener('ended', beginSwitch);

  loadNext();
  primary.play?.().catch?.(() => {});
})();
