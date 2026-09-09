(() => {
  'use strict';

  /*
    REUSE HERO VIDEO SEQUENCE — single-player authority.

    Why this exists:
    The previous implementation used two <video> elements and swapped their roles
    (current / standby). On some browsers the hidden player could be decoded, reset or
    paused while roles were changing, which made the third clip (reuse_01.mp4) appear
    to stop before its intended finish.

    This controller deliberately uses ONE video element only:
    - clips change only after the active video's native `ended` event;
    - no hidden video, no parallel decoder, no role swapping;
    - viewport / tab visibility pause-resume never changes the current time;
    - waiting / stalled states never advance the playlist;
    - an unexpected mid-clip pause is automatically resumed while the Hero is visible.
  */
  const hero = document.querySelector('body.reuse-current #top[data-hm-hero]');
  const video = hero?.querySelector('video.hm-ds-hero__video');
  if (!hero || !video) return;

  const sequence = [
    './assets/movies/reuse_04.mp4',
    './assets/movies/reuse_03.mp4',
    './assets/movies/reuse_01.mp4'
  ];

  /* Remove every legacy buffer left by an older cached controller. */
  hero.querySelectorAll('.hm-hero-sequence-buffer').forEach((node) => node.remove());

  /* animation.js must not become a second playback owner. */
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
  let changingClip = false;
  let shouldPlay = true;
  let loadToken = 0;
  let resumeTimer = 0;

  const clearResumeTimer = () => {
    if (resumeTimer) window.clearTimeout(resumeTimer);
    resumeTimer = 0;
  };

  const isAtNaturalEnd = () => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return video.ended;
    return video.ended || video.currentTime >= Math.max(0, video.duration - 0.12);
  };

  const playCurrent = async () => {
    if (!shouldPlay || !heroVisible || document.hidden || changingClip) return false;
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
    const onReady = () => finish();
    const cleanup = () => {
      video.removeEventListener('loadeddata', onReady);
      video.removeEventListener('canplay', onReady);
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      resolve(token === loadToken);
      return;
    }
    video.addEventListener('loadeddata', onReady, { once:true });
    video.addEventListener('canplay', onReady, { once:true });
    window.setTimeout(finish, 2500);
  });

  const setClip = async (targetIndex, { initial = false } = {}) => {
    const token = ++loadToken;
    changingClip = true;
    clearResumeTimer();

    if (!initial && FADE_MS) {
      video.style.opacity = '0';
      await new Promise((resolve) => window.setTimeout(resolve, FADE_MS));
      if (token !== loadToken) return;
    }

    index = (targetIndex + sequence.length) % sequence.length;
    video.pause();
    video.preload = 'auto';
    video.src = sequence[index];
    video.load();

    const valid = await waitForPlayableFrame(token);
    if (!valid) return;

    /* Exact seek only. fastSeek() is intentionally avoided because it may choose a
       nearby keyframe instead of the exact beginning on some encoded MP4s. */
    try { video.currentTime = 0; } catch (_) {}

    changingClip = false;
    if (shouldPlay && heroVisible && !document.hidden) {
      const attempt = video.play?.();
      if (attempt?.catch) await attempt.catch(() => {});
    }
    if (token !== loadToken) return;
    video.style.opacity = '1';
  };

  const scheduleResume = () => {
    clearResumeTimer();
    if (!shouldPlay || !heroVisible || document.hidden || changingClip || isAtNaturalEnd()) return;
    resumeTimer = window.setTimeout(() => {
      resumeTimer = 0;
      if (shouldPlay && heroVisible && !document.hidden && !changingClip && video.paused && !isAtNaturalEnd()) {
        playCurrent();
      }
    }, 140);
  };

  video.addEventListener('ended', () => {
    clearResumeTimer();
    if (changingClip) return;
    setClip(index + 1);
  });

  /* Buffering is not a reason to skip a clip. The browser keeps the same currentTime
     and playback resumes when more media data becomes available. */
  video.addEventListener('waiting', scheduleResume);
  video.addEventListener('stalled', scheduleResume);
  video.addEventListener('canplay', () => {
    if (!changingClip && shouldPlay && heroVisible && !document.hidden && video.paused && !isAtNaturalEnd()) {
      playCurrent();
    }
  });

  /* There is no user-facing pause control in the Hero. Any pause while the Hero should
     be running is therefore treated as an incidental browser/runtime pause and resumed. */
  video.addEventListener('pause', () => {
    if (!changingClip && shouldPlay && heroVisible && !document.hidden && !isAtNaturalEnd()) scheduleResume();
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      heroVisible = Boolean(entry?.isIntersecting);
      if (!heroVisible) {
        clearResumeTimer();
        video.pause();
        return;
      }
      if (shouldPlay && !document.hidden && !changingClip && !isAtNaturalEnd()) playCurrent();
    }, { threshold:0.1 });
    observer.observe(hero);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearResumeTimer();
      video.pause();
      return;
    }
    if (shouldPlay && heroVisible && !changingClip && !isAtNaturalEnd()) playCurrent();
  });

  /* Start from the requested first clip every time the page is entered. */
  setClip(0, { initial:true });
})();
