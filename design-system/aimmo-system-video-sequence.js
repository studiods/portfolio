(() => {
  'use strict';

  const hero = document.querySelector('body.aimmo-system-page #top[data-hm-hero]');
  const video = hero?.querySelector('video.hm-ds-hero__video');
  if (!hero || !video) return;

  const sequence = [
    './assets/movies/aimmo_system_01.mp4',
    './assets/movies/aimmo_system_02.mp4',
    './assets/movies/aimmo_system_03.mp4',
    './assets/movies/aimmo_system_04.mp4'
  ];

  video.removeAttribute('data-hm-video');
  video.dataset.hmSequenceManaged = '1';
  video.removeAttribute('autoplay');
  video.removeAttribute('loop');
  video.autoplay = false;
  video.loop = false;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const FADE_MS = reduced ? 0 : 120;
  const END_HOLD_MS = reduced ? 0 : 120;
  video.style.transition = FADE_MS ? `opacity ${FADE_MS}ms linear` : 'none';
  video.style.opacity = '1';
  video.style.willChange = 'opacity';

  let index = 0;
  let heroVisible = true;
  let changing = false;
  let loadToken = 0;
  let resumeTimer = 0;
  let endTimer = 0;
  let pendingAdvance = false;

  const clearResume = () => {
    if (resumeTimer) window.clearTimeout(resumeTimer);
    resumeTimer = 0;
  };

  const clearEnd = () => {
    if (endTimer) window.clearTimeout(endTimer);
    endTimer = 0;
  };

  const atEnd = () => video.ended;

  const play = async () => {
    if (!heroVisible || document.hidden || changing || pendingAdvance || video.ended) return;
    const attempt = video.play?.();
    if (attempt?.catch) await attempt.catch(() => {});
  };

  const waitForFrame = token => new Promise(resolve => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      video.removeEventListener('loadeddata', finish);
      video.removeEventListener('canplay', finish);
      resolve(token === loadToken);
    };
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return resolve(token === loadToken);
    video.addEventListener('loadeddata', finish, {once:true});
    video.addEventListener('canplay', finish, {once:true});
    window.setTimeout(finish, 2500);
  });

  const setClip = async (targetIndex, initial = false) => {
    const token = ++loadToken;
    changing = true;
    pendingAdvance = false;
    clearResume();
    clearEnd();

    if (!initial && FADE_MS) {
      video.style.opacity = '0';
      await new Promise(resolve => window.setTimeout(resolve, FADE_MS));
      if (token !== loadToken) return;
    }

    index = (targetIndex + sequence.length) % sequence.length;
    video.pause();
    video.src = sequence[index];
    video.load();

    const valid = await waitForFrame(token);
    if (!valid) return;
    try { video.currentTime = 0; } catch (_) {}
    changing = false;
    if (heroVisible && !document.hidden) await play();
    if (token === loadToken) video.style.opacity = '1';
  };

  const scheduleAdvance = () => {
    clearEnd();
    if (!pendingAdvance || changing || !heroVisible || document.hidden) return;
    endTimer = window.setTimeout(() => {
      endTimer = 0;
      if (!pendingAdvance || changing || !heroVisible || document.hidden) return;
      if (!video.ended) {
        pendingAdvance = false;
        play();
        return;
      }
      setClip(index + 1);
    }, END_HOLD_MS);
  };

  const scheduleResume = () => {
    clearResume();
    if (!heroVisible || document.hidden || changing || pendingAdvance || atEnd()) return;
    resumeTimer = window.setTimeout(() => {
      resumeTimer = 0;
      if (heroVisible && !document.hidden && !changing && !pendingAdvance && video.paused && !atEnd()) play();
    }, 140);
  };

  video.addEventListener('ended', () => {
    if (changing) return;
    pendingAdvance = true;
    scheduleAdvance();
  });
  video.addEventListener('waiting', scheduleResume);
  video.addEventListener('stalled', scheduleResume);
  video.addEventListener('canplay', () => {
    if (pendingAdvance && atEnd()) scheduleAdvance();
    else if (!changing && heroVisible && !document.hidden && video.paused && !atEnd()) play();
  });
  video.addEventListener('pause', () => {
    if (!changing && !pendingAdvance && heroVisible && !document.hidden && !atEnd()) scheduleResume();
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      heroVisible = Boolean(entries[0]?.isIntersecting);
      if (!heroVisible) {
        clearResume();
        clearEnd();
        video.pause();
      } else if (pendingAdvance && atEnd()) {
        scheduleAdvance();
      } else if (!document.hidden && !changing && !atEnd()) {
        play();
      }
    }, {threshold:.1});
    observer.observe(hero);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearResume();
      clearEnd();
      video.pause();
    } else if (pendingAdvance && atEnd()) {
      scheduleAdvance();
    } else if (heroVisible && !changing && !atEnd()) {
      play();
    }
  });

  setClip(0, true);
})();