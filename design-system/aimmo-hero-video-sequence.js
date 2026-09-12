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

  const video = document.querySelector('.aimmo-system-page [data-aimmo-video-sequence]');
  if (!video) return;

  const sequence = (video.dataset.aimmoVideoSequence || '')
    .split('|')
    .map((value) => value.trim())
    .filter(Boolean);
  if (sequence.length < 2) return;

  /*
    Single-player authority.
    The previous controller started the next clip when only .34s remained and also
    swapped two video elements. Both behaviours could visually cut the active clip.
    A sequence now advances only after the browser fires the native `ended` event.
  */
  video.removeAttribute('autoplay');
  video.removeAttribute('loop');
  video.autoplay = false;
  video.loop = false;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.dataset.hmSequenceManaged = '1';
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');

  /* Remove a standby player if an older cached controller mounted one first. */
  const hero = video.closest('[data-hm-hero]') || video.parentElement;
  hero?.querySelectorAll('.is-aimmo-sequence-back').forEach((node) => {
    if (node !== video) node.remove();
  });

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const FADE_MS = reduced ? 0 : 120;
  const END_HOLD_MS = reduced ? 0 : 120;
  video.style.transition = FADE_MS ? `opacity ${FADE_MS}ms linear` : 'none';
  video.style.opacity = '1';
  video.style.willChange = 'opacity';

  let index = 0;
  let changingClip = false;
  let heroVisible = true;
  let loadToken = 0;
  let endTimer = 0;
  let resumeTimer = 0;
  let pendingAdvance = false;

  const clearEndTimer = () => {
    if (endTimer) window.clearTimeout(endTimer);
    endTimer = 0;
  };

  const clearResumeTimer = () => {
    if (resumeTimer) window.clearTimeout(resumeTimer);
    resumeTimer = 0;
  };

  const canPlay = () => heroVisible && !document.hidden && !changingClip;

  const playCurrent = async () => {
    if (!canPlay() || video.ended) return false;
    const attempt = video.play?.();
    if (attempt?.catch) {
      try { await attempt; } catch (_) { return false; }
    }
    return !video.paused;
  };

  const waitForPlayableFrame = (token) => new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(token === loadToken);
    };
    const cleanup = () => {
      video.removeEventListener('loadeddata', finish);
      video.removeEventListener('canplay', finish);
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      resolve(token === loadToken);
      return;
    }
    video.addEventListener('loadeddata', finish, { once:true });
    video.addEventListener('canplay', finish, { once:true });
    window.setTimeout(finish, 2500);
  });

  const setClip = async (targetIndex, { initial = false } = {}) => {
    const token = ++loadToken;
    changingClip = true;
    pendingAdvance = false;
    clearEndTimer();
    clearResumeTimer();

    if (!initial && FADE_MS) {
      video.style.opacity = '0';
      await new Promise((resolve) => window.setTimeout(resolve, FADE_MS));
      if (token !== loadToken) return;
    }

    index = (targetIndex + sequence.length) % sequence.length;
    video.pause();
    video.src = sequence[index];
    video.preload = 'auto';
    video.load();

    const valid = await waitForPlayableFrame(token);
    if (!valid) return;

    try { video.currentTime = 0; } catch (_) {}
    changingClip = false;

    if (canPlay()) {
      const attempt = video.play?.();
      if (attempt?.catch) await attempt.catch(() => {});
    }
    if (token !== loadToken) return;
    video.style.opacity = '1';
  };

  const scheduleAdvance = () => {
    clearEndTimer();
    if (!pendingAdvance || changingClip || !heroVisible || document.hidden) return;
    endTimer = window.setTimeout(() => {
      endTimer = 0;
      if (!pendingAdvance || changingClip || !heroVisible || document.hidden) return;
      if (!video.ended) {
        pendingAdvance = false;
        playCurrent();
        return;
      }
      setClip(index + 1);
    }, END_HOLD_MS);
  };

  const scheduleResume = () => {
    clearResumeTimer();
    if (!canPlay() || video.ended || pendingAdvance) return;
    resumeTimer = window.setTimeout(() => {
      resumeTimer = 0;
      if (canPlay() && video.paused && !video.ended && !pendingAdvance) playCurrent();
    }, 140);
  };

  video.addEventListener('ended', () => {
    clearResumeTimer();
    if (changingClip) return;
    pendingAdvance = true;
    scheduleAdvance();
  });

  /* Buffering/stalling never advances the playlist. */
  video.addEventListener('waiting', scheduleResume);
  video.addEventListener('stalled', scheduleResume);
  video.addEventListener('canplay', () => {
    if (pendingAdvance && video.ended) scheduleAdvance();
    else if (canPlay() && video.paused && !video.ended) playCurrent();
  });
  video.addEventListener('pause', () => {
    if (canPlay() && !video.ended && !pendingAdvance) scheduleResume();
  });

  if ('IntersectionObserver' in window && hero) {
    const observer = new IntersectionObserver((entries) => {
      heroVisible = Boolean(entries[0]?.isIntersecting);
      if (!heroVisible) {
        clearEndTimer();
        clearResumeTimer();
        video.pause();
        return;
      }
      if (pendingAdvance && video.ended) scheduleAdvance();
      else if (!changingClip && !video.ended) playCurrent();
    }, { threshold:.1 });
    observer.observe(hero);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearEndTimer();
      clearResumeTimer();
      video.pause();
      return;
    }
    if (pendingAdvance && video.ended) scheduleAdvance();
    else if (heroVisible && !changingClip && !video.ended) playCurrent();
  });

  setClip(0, { initial:true });
})();