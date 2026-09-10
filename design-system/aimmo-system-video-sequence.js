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
  video.style.transition = FADE_MS ? `opacity ${FADE_MS}ms linear` : 'none';
  video.style.opacity = '1';
  video.style.willChange = 'opacity';

  let index = 0;
  let heroVisible = true;
  let changing = false;
  let loadToken = 0;
  let resumeTimer = 0;

  const clearResume = () => {
    if (resumeTimer) window.clearTimeout(resumeTimer);
    resumeTimer = 0;
  };

  const atEnd = () => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return video.ended;
    return video.ended || video.currentTime >= Math.max(0, video.duration - .12);
  };

  const play = async () => {
    if (!heroVisible || document.hidden || changing) return;
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
    clearResume();

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

  const scheduleResume = () => {
    clearResume();
    if (!heroVisible || document.hidden || changing || atEnd()) return;
    resumeTimer = window.setTimeout(() => {
      resumeTimer = 0;
      if (heroVisible && !document.hidden && !changing && video.paused && !atEnd()) play();
    }, 140);
  };

  video.addEventListener('ended', () => {
    if (!changing) setClip(index + 1);
  });
  video.addEventListener('waiting', scheduleResume);
  video.addEventListener('stalled', scheduleResume);
  video.addEventListener('canplay', () => {
    if (!changing && heroVisible && !document.hidden && video.paused && !atEnd()) play();
  });
  video.addEventListener('pause', () => {
    if (!changing && heroVisible && !document.hidden && !atEnd()) scheduleResume();
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      heroVisible = Boolean(entries[0]?.isIntersecting);
      if (!heroVisible) {
        clearResume();
        video.pause();
      } else if (!document.hidden && !changing && !atEnd()) {
        play();
      }
    }, {threshold:.1});
    observer.observe(hero);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearResume();
      video.pause();
    } else if (heroVisible && !changing && !atEnd()) {
      play();
    }
  });

  setClip(0, true);
})();