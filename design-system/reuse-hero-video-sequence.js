(() => {
  'use strict';

  const heroVideo = document.querySelector('body.reuse-current #top video[data-hm-video]');
  if (!heroVideo) return;

  const sequence = [
    './assets/movies/reuse_04.mp4',
    './assets/movies/reuse_03.mp4',
    './assets/movies/reuse_01.mp4'
  ];
  if (sequence.length < 2) return;

  const hero = heroVideo.closest('.hm-ds-hero, .hm-hero');
  if (!hero) return;

  /*
    This sequence owns Hero playback completely.
    animation.js also controls every [data-hm-video] for viewport visibility. When the
    original Hero video became the hidden standby element, that generic controller could
    start it again while it was preloading the next clip. In particular reuse_01 could
    therefore already be part-way through before being promoted to the visible layer.
    Remove the generic hook and keep both players manual-only so a standby clip can never
    advance before its turn.
  */
  heroVideo.removeAttribute('data-hm-video');
  heroVideo.dataset.hmSequenceManaged = '1';

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const FADE_MS = reduced ? 0 : 140;

  const configure = (video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.autoplay = false;
    video.loop = false;
    video.removeAttribute('autoplay');
    video.removeAttribute('loop');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.dataset.hmSequenceManaged = '1';
    video.style.transition = FADE_MS ? `opacity ${FADE_MS}ms linear` : 'none';
    video.style.willChange = 'opacity';
  };

  configure(heroVideo);
  heroVideo.style.opacity = '1';

  const buffer = document.createElement('video');
  buffer.className = `${heroVideo.className} hm-hero-sequence-buffer`;
  configure(buffer);
  buffer.preload = 'auto';
  buffer.style.opacity = '0';
  heroVideo.insertAdjacentElement('afterend', buffer);

  let index = 0;
  let current = heroVideo;
  let standby = buffer;
  let switching = false;
  let heroVisible = true;

  const setSource = (video, src, preload = 'auto') => {
    video.pause();
    video.autoplay = false;
    video.preload = preload;
    video.src = src;
    video.load();
  };

  const waitUntilPlayable = (video) => new Promise((resolve) => {
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      resolve();
      return;
    }
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      video.removeEventListener('canplay', done);
      video.removeEventListener('loadeddata', done);
      resolve();
    };
    video.addEventListener('canplay', done, { once:true });
    video.addEventListener('loadeddata', done, { once:true });
    window.setTimeout(done, 1200);
  });

  const waitForFrame = (video) => new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    if ('requestVideoFrameCallback' in video) {
      video.requestVideoFrameCallback(done);
      window.setTimeout(done, 360);
    } else {
      video.addEventListener('playing', () => requestAnimationFrame(done), { once:true });
      window.setTimeout(done, 360);
    }
  });

  const play = async (video) => {
    if (!heroVisible || document.hidden) return false;
    const attempt = video.play?.();
    if (attempt?.catch) {
      try { await attempt; } catch (_) { return false; }
    }
    return !video.paused;
  };

  const resetToStart = (video) => {
    try {
      if (typeof video.fastSeek === 'function') video.fastSeek(0);
      else video.currentTime = 0;
    } catch (_) {
      try { video.currentTime = 0; } catch (__) {}
    }
  };

  const prepareStandby = () => {
    const nextIndex = (index + 1) % sequence.length;
    if (standby.dataset.sequenceIndex === String(nextIndex) && standby.readyState >= HTMLMediaElement.HAVE_METADATA) {
      standby.pause();
      resetToStart(standby);
      return;
    }
    standby.dataset.sequenceIndex = String(nextIndex);
    standby.style.opacity = '0';
    setSource(standby, sequence[nextIndex], 'auto');
    standby.addEventListener('loadedmetadata', () => {
      if (standby !== current) {
        standby.pause();
        resetToStart(standby);
      }
    }, { once:true });
  };

  const switchToNext = async () => {
    if (switching || document.hidden || !heroVisible) return;
    switching = true;
    const nextIndex = (index + 1) % sequence.length;

    if (standby.dataset.sequenceIndex !== String(nextIndex)) {
      standby.dataset.sequenceIndex = String(nextIndex);
      standby.style.opacity = '0';
      setSource(standby, sequence[nextIndex], 'auto');
    }

    await waitUntilPlayable(standby);
    standby.pause();
    resetToStart(standby);

    const started = await play(standby);
    if (!started) {
      switching = false;
      return;
    }
    await waitForFrame(standby);
    if (document.hidden || !heroVisible) {
      standby.pause();
      switching = false;
      return;
    }

    standby.style.opacity = '1';
    current.style.opacity = '0';

    window.setTimeout(() => {
      const previous = current;
      current = standby;
      standby = previous;
      index = nextIndex;
      current.dataset.sequenceIndex = String(index);

      standby.pause();
      resetToStart(standby);
      standby.style.opacity = '0';
      prepareStandby();
      switching = false;
    }, FADE_MS + 30);
  };

  [heroVideo, buffer].forEach((video) => {
    video.addEventListener('ended', () => {
      if (video === current) switchToNext();
    });
  });

  heroVideo.dataset.sequenceIndex = '0';
  setSource(heroVideo, sequence[0], 'auto');
  heroVideo.style.opacity = '1';
  prepareStandby();
  waitUntilPlayable(heroVideo).then(() => play(heroVideo));

  /* The custom controller now owns viewport pause/resume as well, so animation.js cannot
     accidentally drive the hidden standby player. */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      heroVisible = Boolean(entry?.isIntersecting);
      if (!heroVisible) {
        current.pause();
        standby.pause();
        return;
      }
      standby.pause();
      if (!switching) play(current);
    }, { threshold:0.1 });
    observer.observe(hero);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      current.pause();
      standby.pause();
      return;
    }
    standby.pause();
    if (heroVisible && !switching) play(current);
  });
})();