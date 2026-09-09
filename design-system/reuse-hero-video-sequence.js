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

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const FADE_MS = reduced ? 0 : 140;

  const configure = (video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = false;
    video.removeAttribute('loop');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
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

  const setSource = (video, src, preload = 'auto') => {
    video.preload = preload;
    video.src = src;
    video.load();
  };

  const waitForFrame = (video) => new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    if ('requestVideoFrameCallback' in video) {
      video.requestVideoFrameCallback(done);
      window.setTimeout(done, 300);
    } else {
      video.addEventListener('playing', () => requestAnimationFrame(done), { once:true });
      window.setTimeout(done, 300);
    }
  });

  const play = async (video) => {
    const attempt = video.play?.();
    if (attempt?.catch) await attempt.catch(() => {});
  };

  const prepareStandby = () => {
    const nextIndex = (index + 1) % sequence.length;
    if (standby.dataset.sequenceIndex === String(nextIndex) && standby.readyState >= HTMLMediaElement.HAVE_METADATA) return;
    standby.dataset.sequenceIndex = String(nextIndex);
    setSource(standby, sequence[nextIndex], 'auto');
  };

  const switchToNext = async () => {
    if (switching || document.hidden) return;
    switching = true;
    const nextIndex = (index + 1) % sequence.length;

    if (standby.dataset.sequenceIndex !== String(nextIndex)) {
      standby.dataset.sequenceIndex = String(nextIndex);
      setSource(standby, sequence[nextIndex], 'auto');
    }

    try { standby.currentTime = 0; } catch (_) {}
    await play(standby);
    await waitForFrame(standby);

    standby.style.opacity = '1';
    current.style.opacity = '0';

    window.setTimeout(() => {
      current.pause();
      try { current.currentTime = 0; } catch (_) {}

      const previous = current;
      current = standby;
      standby = previous;
      index = nextIndex;
      current.dataset.sequenceIndex = String(index);
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

  /* Force the requested first clip even when old authored markup still points to reuse_01. */
  heroVideo.dataset.sequenceIndex = '0';
  setSource(heroVideo, sequence[0], 'auto');
  prepareStandby();
  play(heroVideo);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      heroVideo.pause();
      buffer.pause();
      return;
    }
    play(current);
  });
})();