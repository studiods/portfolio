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

  const hero = document.querySelector('body.aimmo-system-page #top[data-hm-hero]');
  const authoredVideo = hero?.querySelector('[data-aimmo-video-sequence]');
  if (!hero || !authoredVideo) return;

  const sequence = (authoredVideo.dataset.aimmoVideoSequence || '')
    .split('|')
    .map(value => value.trim())
    .filter(Boolean);
  if (sequence.length < 2) return;

  const absoluteSrc = src => new URL(src, document.baseURI).href;

  /* Two players are used only to keep the completed frame visible until the next
     clip has decoded its first frame. There is no fade, dimming or artificial hold. */
  const makePlayer = role => {
    const player = authoredVideo.cloneNode(false);
    player.removeAttribute('autoplay');
    player.removeAttribute('loop');
    player.removeAttribute('data-hm-video');
    player.removeAttribute('data-hm-video-sequence');
    player.removeAttribute('data-aimmo-video-sequence');
    player.autoplay = false;
    player.loop = false;
    player.muted = true;
    player.defaultMuted = true;
    player.playsInline = true;
    player.preload = 'auto';
    player.dataset.hmSequenceManaged = '1';
    player.dataset.hmSequenceRole = role;
    player.setAttribute('muted', '');
    player.setAttribute('playsinline', '');
    player.setAttribute('aria-hidden', 'true');
    player.classList.remove('is-sequence-switching', 'is-aimmo-sequence-front', 'is-aimmo-sequence-back');
    player.style.transition = 'none';
    player.style.opacity = '1';
    player.style.willChange = 'auto';
    player.style.pointerEvents = 'none';
    return player;
  };

  hero.querySelectorAll('.is-aimmo-sequence-back').forEach(node => node.remove());

  const front = makePlayer('front');
  const standby = makePlayer('standby');
  authoredVideo.replaceWith(front);
  hero.insertBefore(standby, front);
  front.style.visibility = 'visible';
  standby.style.visibility = 'hidden';

  let active = front;
  let buffer = standby;
  let index = 0;
  let heroVisible = true;
  let switching = false;
  let activeStarted = false;
  let resumeTimer = 0;

  const clearResume = () => {
    if (resumeTimer) window.clearTimeout(resumeTimer);
    resumeTimer = 0;
  };

  const sourceMatches = (player, sequenceIndex) => {
    const current = player.currentSrc || player.src || '';
    return current === absoluteSrc(sequence[sequenceIndex]);
  };

  const configureSource = (player, sequenceIndex) => {
    const expected = absoluteSrc(sequence[sequenceIndex]);
    if ((player.currentSrc || player.src || '') === expected) return;
    player.pause();
    player.src = sequence[sequenceIndex];
    player.preload = 'auto';
    player.load();
  };

  const waitForPlayableData = player => new Promise(resolve => {
    if (player.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      resolve();
      return;
    }
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      player.removeEventListener('loadeddata', finish);
      player.removeEventListener('canplay', finish);
      resolve();
    };
    player.addEventListener('loadeddata', finish, {once:true});
    player.addEventListener('canplay', finish, {once:true});
    window.setTimeout(finish, 3000);
  });

  const waitForFirstFrame = player => new Promise(resolve => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    if ('requestVideoFrameCallback' in player) {
      player.requestVideoFrameCallback(finish);
      window.setTimeout(finish, 500);
    } else {
      player.addEventListener('playing', () => requestAnimationFrame(finish), {once:true});
      window.setTimeout(finish, 500);
    }
  });

  const playActive = async () => {
    if (!heroVisible || document.hidden || switching || active.ended) return;
    const attempt = active.play?.();
    if (attempt?.catch) await attempt.catch(() => {});
  };

  const preloadNext = () => {
    const nextIndex = (index + 1) % sequence.length;
    buffer.style.visibility = 'hidden';
    buffer.pause();
    configureSource(buffer, nextIndex);
    try { buffer.currentTime = 0; } catch (_) {}
  };

  const advance = async () => {
    if (switching || !heroVisible || document.hidden) return;
    if (!activeStarted || !active.ended || !sourceMatches(active, index)) return;

    switching = true;
    clearResume();
    const nextIndex = (index + 1) % sequence.length;
    configureSource(buffer, nextIndex);
    await waitForPlayableData(buffer);

    if (!active.ended || !sourceMatches(active, index)) {
      switching = false;
      return;
    }

    try { buffer.currentTime = 0; } catch (_) {}
    const attempt = buffer.play?.();
    if (attempt?.catch) await attempt.catch(() => {});
    await waitForFirstFrame(buffer);

    if (!heroVisible || document.hidden) {
      buffer.pause();
      switching = false;
      return;
    }

    buffer.style.visibility = 'visible';
    active.style.visibility = 'hidden';
    active.pause();

    const previous = active;
    active = buffer;
    buffer = previous;
    index = nextIndex;
    activeStarted = !active.paused;
    switching = false;

    if (active.paused && heroVisible && !document.hidden) playActive();
    preloadNext();
  };

  const scheduleResume = () => {
    clearResume();
    if (!heroVisible || document.hidden || switching || active.ended) return;
    resumeTimer = window.setTimeout(() => {
      resumeTimer = 0;
      if (heroVisible && !document.hidden && !switching && active.paused && !active.ended) playActive();
    }, 140);
  };

  const bindPlayer = player => {
    player.addEventListener('playing', () => {
      if (player === active && sourceMatches(player, index)) activeStarted = true;
    });
    player.addEventListener('ended', () => {
      if (player !== active || switching) return;
      if (!activeStarted || !sourceMatches(player, index)) return;
      advance();
    });
    player.addEventListener('waiting', () => {
      if (player === active) scheduleResume();
    });
    player.addEventListener('stalled', () => {
      if (player === active) scheduleResume();
    });
    player.addEventListener('pause', () => {
      if (player === active && !switching && !player.ended) scheduleResume();
    });
    player.addEventListener('canplay', () => {
      if (player === active && heroVisible && !document.hidden && !switching && player.paused && !player.ended) playActive();
    });
  };

  bindPlayer(front);
  bindPlayer(standby);
  configureSource(active, 0);
  configureSource(buffer, 1);
  waitForPlayableData(active).then(() => {
    try { active.currentTime = 0; } catch (_) {}
    if (heroVisible && !document.hidden) playActive();
  });
  preloadNext();

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      heroVisible = Boolean(entries[0]?.isIntersecting);
      if (!heroVisible) {
        clearResume();
        active.pause();
        buffer.pause();
        return;
      }
      if (active.ended) advance();
      else if (!switching) playActive();
    }, {threshold:.1});
    observer.observe(hero);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearResume();
      active.pause();
      buffer.pause();
      return;
    }
    if (!heroVisible) return;
    if (active.ended) advance();
    else if (!switching) playActive();
  });
})();
