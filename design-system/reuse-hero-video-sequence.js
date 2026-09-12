(() => {
  'use strict';

  /*
    REUSE HERO VIDEO SEQUENCE — strict natural-end + seamless frame handoff.

    Rules:
    - only the currently visible player can advance the playlist;
    - a clip advances only after that exact player's native `ended` event;
    - stale/queued `ended` events are ignored by source + playback-session guards;
    - the next clip is preloaded in a standby player while the current clip runs;
    - there is no opacity fade, black matte, transition class or artificial end hold;
    - the current final frame stays visible until the next clip has produced a frame,
      then visibility swaps immediately.
  */
  const hero = document.querySelector('body.reuse-current #top[data-hm-hero]');
  const authoredVideo = hero?.querySelector('video.hm-ds-hero__video');
  if (!hero || !authoredVideo) return;

  const sequence = [
    './assets/movies/reuse_04.mp4',
    './assets/movies/reuse_03.mp4',
    './assets/movies/reuse_01.mp4'
  ];
  if (sequence.length < 2) return;

  const absoluteSrc = (src) => new URL(src, document.baseURI).href;

  /* Replace the authored node so no legacy anonymous media listeners can survive. */
  const makePlayer = (role) => {
    const player = authoredVideo.cloneNode(false);
    player.removeAttribute('autoplay');
    player.removeAttribute('loop');
    player.removeAttribute('data-hm-video');
    player.removeAttribute('data-hm-video-sequence');
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
    player.classList.remove('is-sequence-switching', 'hm-hero-sequence-buffer');
    player.style.transition = 'none';
    player.style.opacity = '1';
    player.style.willChange = 'auto';
    player.style.pointerEvents = 'none';
    return player;
  };

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
  let playSession = 0;
  let resumeTimer = 0;

  const clearResumeTimer = () => {
    if (resumeTimer) window.clearTimeout(resumeTimer);
    resumeTimer = 0;
  };

  const sourceMatches = (player, sequenceIndex) => {
    const expected = absoluteSrc(sequence[sequenceIndex]);
    const current = player.currentSrc || player.src || '';
    return current === expected;
  };

  const configureSource = (player, sequenceIndex) => {
    const expected = absoluteSrc(sequence[sequenceIndex]);
    if ((player.currentSrc || player.src || '') !== expected) {
      player.pause();
      player.src = sequence[sequenceIndex];
      player.preload = 'auto';
      player.load();
    }
  };

  const waitForPlayableData = (player) => new Promise((resolve) => {
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
    player.addEventListener('loadeddata', finish, { once:true });
    player.addEventListener('canplay', finish, { once:true });
    window.setTimeout(finish, 3000);
  });

  const waitForFirstFrame = (player) => new Promise((resolve) => {
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
      player.addEventListener('playing', () => requestAnimationFrame(finish), { once:true });
      window.setTimeout(finish, 500);
    }
  });

  const playActive = async () => {
    if (!heroVisible || document.hidden || switching || active.ended) return false;
    const session = playSession;
    const attempt = active.play?.();
    if (attempt?.catch) {
      try { await attempt; } catch (_) { return false; }
    }
    return session === playSession && !active.paused;
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
    clearResumeTimer();
    const nextIndex = (index + 1) % sequence.length;
    configureSource(buffer, nextIndex);
    await waitForPlayableData(buffer);
    if (!active.ended || !sourceMatches(active, index)) {
      switching = false;
      return;
    }

    try { buffer.currentTime = 0; } catch (_) {}
    const playAttempt = buffer.play?.();
    if (playAttempt?.catch) await playAttempt.catch(() => {});
    await waitForFirstFrame(buffer);

    if (!heroVisible || document.hidden) {
      buffer.pause();
      switching = false;
      return;
    }

    /* No fade: keep the old final frame visible until the new frame is ready, then swap. */
    buffer.style.visibility = 'visible';
    active.style.visibility = 'hidden';
    active.pause();

    const previous = active;
    active = buffer;
    buffer = previous;
    index = nextIndex;
    playSession += 1;
    activeStarted = !active.paused;
    switching = false;

    if (active.paused && heroVisible && !document.hidden) playActive();
    preloadNext();
  };

  const scheduleResume = () => {
    clearResumeTimer();
    if (!heroVisible || document.hidden || switching || active.ended) return;
    resumeTimer = window.setTimeout(() => {
      resumeTimer = 0;
      if (heroVisible && !document.hidden && !switching && active.paused && !active.ended) {
        playActive();
      }
    }, 140);
  };

  const bindPlayer = (player) => {
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
      if (player === active && heroVisible && !document.hidden && !switching && player.paused && !player.ended) {
        playActive();
      }
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
    const observer = new IntersectionObserver((entries) => {
      heroVisible = Boolean(entries[0]?.isIntersecting);
      if (!heroVisible) {
        clearResumeTimer();
        active.pause();
        buffer.pause();
        return;
      }
      if (active.ended) advance();
      else if (!switching) playActive();
    }, { threshold:0.1 });
    observer.observe(hero);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearResumeTimer();
      active.pause();
      buffer.pause();
      return;
    }
    if (!heroVisible) return;
    if (active.ended) advance();
    else if (!switching) playActive();
  });
})();
