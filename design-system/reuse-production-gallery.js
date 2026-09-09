(() => {
  'use strict';

  const HOLD_MS = 2500;
  const GALLERY_02_INITIAL_HOLD_MS = 5000;
  const VIDEO_STOP_FALLBACK_MS = 3000;
  const TRANSITION_MS = 720;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const STUDIO_MEDIA = [
    './assets/image/himart/reuse/reuse_studiio_01.png',
    './assets/image/himart/reuse/reuse_studiio_02.png',
    './assets/image/himart/reuse/reuse_studiio_03.png',
    './assets/image/himart/reuse/reuse_studiio_04.png',
    './assets/image/himart/reuse/reuse_studiio_05.png',
    './assets/image/himart/reuse/reuse_studiio_06.png'
  ].map((src) => ({ type: 'image', src }));

  const SHOOTING_MEDIA = [
    { type: 'image', src: './assets/image/himart/reuse/reuse_shooting_01.png' },
    { type: 'image', src: './assets/image/himart/reuse/reuse_shooting_02.png' },
    { type: 'image', src: './assets/image/himart/reuse/reuse_shooting_03.png' },
    { type: 'video', src: './assets/movies/reuse_02.mp4' }
  ];

  const AI_VIDEO_MEDIA = [
    './assets/movies/reuse_04.mp4',
    './assets/movies/reuse_03.mp4',
    './assets/movies/reuse_01.mp4'
  ];

  const galleries = Array.from(document.querySelectorAll('.reuse-production-gallery'));
  if (!galleries.length) return;

  const buildSlides = (gallery, items) => {
    const viewport = gallery?.querySelector('.reuse-production-gallery__viewport');
    if (!viewport || !items.length) return;

    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
      const slide = document.createElement('article');
      slide.className = `reuse-production-gallery__slide${index === 0 ? ' is-active' : ''}`;
      slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');

      const media = document.createElement('div');
      media.className = 'reuse-production-gallery__media';

      if (item.type === 'video') {
        const video = document.createElement('video');
        video.src = item.src;
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.loop = false;
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', '');
        video.setAttribute('data-reuse-gallery-video', '');
        media.appendChild(video);
      } else {
        const image = document.createElement('img');
        image.src = item.src;
        image.alt = '';
        image.loading = index === 0 ? 'eager' : 'lazy';
        image.decoding = 'async';
        image.draggable = false;
        media.appendChild(image);
      }

      slide.appendChild(media);
      fragment.appendChild(slide);
    });
    viewport.replaceChildren(fragment);
  };

  /* 03.3 Gallery 01: studio environment, fixed 01–06 sequence only. */
  buildSlides(galleries[0], STUDIO_MEDIA);

  /* 03.3 Gallery 02: shooting 01–03, then reuse_02.mp4, then back to 01. */
  if (galleries[1]) buildSlides(galleries[1], SHOOTING_MEDIA);

  const controllers = new Map();

  /* Galleries 01–02 retain the timed rolling behavior. */
  galleries.slice(0, 2).forEach((gallery, galleryIndex) => {
    const slides = Array.from(gallery.querySelectorAll('.reuse-production-gallery__slide'));
    const prev = gallery.querySelector('[data-reuse-gallery-prev]');
    const next = gallery.querySelector('[data-reuse-gallery-next]');
    const status = gallery.querySelector('[data-reuse-gallery-status]');
    if (!slides.length) return;

    let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
    let timer = 0;
    let videoFallbackTimer = 0;
    let busy = false;
    let inView = false;
    let firstAdvanceDone = false;
    let suppressVideoPauseFallback = false;

    const isSequencedVideoGallery = galleryIndex === 1;

    const clearTimer = () => {
      if (timer) window.clearTimeout(timer);
      timer = 0;
    };

    const clearVideoFallback = () => {
      if (videoFallbackTimer) window.clearTimeout(videoFallbackTimer);
      videoFallbackTimer = 0;
    };

    const activeVideo = () => slides[index]?.querySelector('video[data-reuse-gallery-video]') || null;

    const updateStatus = () => {
      if (!status) return;
      status.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    };

    const pauseVideo = (video, { reset = false } = {}) => {
      if (!video) return;
      suppressVideoPauseFallback = true;
      video.pause();
      if (reset) {
        try { video.currentTime = 0; } catch (_) {}
      }
      window.setTimeout(() => { suppressVideoPauseFallback = false; }, 0);
    };

    const scheduleVideoFallback = (video) => {
      clearVideoFallback();
      if (!isSequencedVideoGallery || !video || !inView || document.hidden || busy || video.ended) return;
      videoFallbackTimer = window.setTimeout(() => {
        videoFallbackTimer = 0;
        if (!inView || document.hidden || busy || video.ended || !video.paused) return;
        move(1, true);
      }, VIDEO_STOP_FALLBACK_MS);
    };

    const playActiveVideo = () => {
      const video = activeVideo();
      if (!video || !inView || document.hidden || busy) return false;
      clearTimer();
      clearVideoFallback();
      try { video.currentTime = 0; } catch (_) {}
      const playPromise = video.play();
      if (playPromise?.catch) playPromise.catch(() => scheduleVideoFallback(video));
      return true;
    };

    const settle = () => {
      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle('is-active', active);
        slide.classList.remove('is-next', 'is-entering', 'is-exiting');
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        if (!active) pauseVideo(slide.querySelector('video[data-reuse-gallery-video]'), { reset: true });
      });
      gallery.classList.remove('is-reverse');
      updateStatus();
    };

    const schedule = (delayOverride = null) => {
      clearTimer();
      clearVideoFallback();
      if (!inView || document.hidden || busy || slides.length < 2) return;

      if (isSequencedVideoGallery && activeVideo()) {
        playActiveVideo();
        return;
      }

      const delay = delayOverride ?? (!firstAdvanceDone && galleryIndex === 1 ? GALLERY_02_INITIAL_HOLD_MS : HOLD_MS);
      timer = window.setTimeout(() => move(1, true), delay);
    };

    const transitionTo = (targetIndex, direction = 1, automatic = false) => {
      if (busy || slides.length < 2 || targetIndex === index) return;
      clearTimer();
      clearVideoFallback();
      busy = true;

      const current = slides[index];
      const incoming = slides[targetIndex];
      pauseVideo(current.querySelector('video[data-reuse-gallery-video]'));
      gallery.classList.toggle('is-reverse', direction < 0);

      slides.forEach((slide, i) => {
        if (i !== index && i !== targetIndex) {
          slide.classList.remove('is-active', 'is-next', 'is-entering', 'is-exiting');
          slide.setAttribute('aria-hidden', 'true');
        }
      });

      current.classList.add('is-active');
      current.classList.remove('is-next', 'is-entering');
      incoming.classList.remove('is-active', 'is-exiting', 'is-entering');
      incoming.classList.add('is-next');
      incoming.setAttribute('aria-hidden', 'true');

      const complete = () => {
        index = targetIndex;
        busy = false;
        if (automatic) firstAdvanceDone = true;
        settle();
        if (!playActiveVideo()) schedule(HOLD_MS);
      };

      if (reducedMotion) {
        complete();
        return;
      }

      void incoming.offsetWidth;
      current.classList.add('is-exiting');
      incoming.classList.add('is-entering');
      window.setTimeout(complete, TRANSITION_MS + 30);
    };

    function move(delta, automatic = false) {
      if (busy || slides.length < 2) return;
      const targetIndex = (index + delta + slides.length) % slides.length;
      transitionTo(targetIndex, delta < 0 ? -1 : 1, automatic);
    }

    slides.forEach((slide) => {
      const video = slide.querySelector('video[data-reuse-gallery-video]');
      if (!video) return;

      video.addEventListener('ended', () => {
        clearVideoFallback();
        if (!inView || document.hidden || busy || slide !== slides[index]) return;
        move(1, true);
      });
      video.addEventListener('playing', clearVideoFallback);
      ['pause', 'waiting', 'stalled'].forEach((eventName) => {
        video.addEventListener(eventName, () => {
          if (suppressVideoPauseFallback || slide !== slides[index]) return;
          scheduleVideoFallback(video);
        });
      });
    });

    prev?.addEventListener('click', () => move(-1));
    next?.addEventListener('click', () => move(1));

    gallery.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        move(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        move(1);
      }
    });

    const controller = {
      setInView(value) {
        inView = value;
        if (inView) {
          if (!playActiveVideo()) schedule();
        } else {
          clearTimer();
          clearVideoFallback();
          pauseVideo(activeVideo());
        }
      },
      resume() {
        if (!inView) return;
        if (!playActiveVideo()) schedule();
      },
      pause() {
        clearTimer();
        clearVideoFallback();
        pauseVideo(activeVideo());
      }
    };

    controllers.set(gallery, controller);
    settle();
  });

  /* Gallery 03: manually started AI video playlist with hover controls while playing. */
  const setupAiVideoGallery = (gallery) => {
    if (!gallery) return;
    const viewport = gallery.querySelector('.reuse-production-gallery__viewport');
    const status = gallery.querySelector('[data-reuse-gallery-status]');
    if (!viewport) return;

    gallery.classList.add('reuse-production-gallery--video-player', 'is-video-idle');
    gallery.querySelectorAll(':scope > .reuse-production-gallery__nav').forEach((button) => button.hidden = true);

    const slide = document.createElement('article');
    slide.className = 'reuse-production-gallery__slide is-active reuse-video-player__slide';
    slide.setAttribute('aria-hidden', 'false');

    const media = document.createElement('div');
    media.className = 'reuse-production-gallery__media reuse-video-player__media';

    const video = document.createElement('video');
    video.src = AI_VIDEO_MEDIA[0];
    video.playsInline = true;
    video.preload = 'metadata';
    video.loop = false;
    video.controls = false;
    video.setAttribute('playsinline', '');
    video.setAttribute('data-reuse-ai-video', '');

    media.appendChild(video);
    slide.appendChild(media);

    const veil = document.createElement('div');
    veil.className = 'reuse-video-player__veil';
    veil.setAttribute('aria-hidden', 'true');

    viewport.replaceChildren(slide, veil);

    const controls = document.createElement('div');
    controls.className = 'reuse-video-player__controls';
    controls.innerHTML = `
      <button class="reuse-video-player__skip reuse-video-player__skip--prev" type="button" aria-label="이전 영상">
        <svg viewBox="0 0 44 44" aria-hidden="true"><polyline points="23,12 13,22 23,32"></polyline><polyline points="34,12 24,22 34,32"></polyline></svg>
      </button>
      <button class="reuse-video-player__toggle" type="button" aria-label="재생">
        <svg class="reuse-video-player__icon reuse-video-player__icon--play" viewBox="0 0 48 48" aria-hidden="true"><polyline points="17,11 36,24 17,37 17,11"></polyline></svg>
        <svg class="reuse-video-player__icon reuse-video-player__icon--pause" viewBox="0 0 48 48" aria-hidden="true"><line x1="18" y1="12" x2="18" y2="36"></line><line x1="30" y1="12" x2="30" y2="36"></line></svg>
      </button>
      <button class="reuse-video-player__skip reuse-video-player__skip--next" type="button" aria-label="다음 영상">
        <svg viewBox="0 0 44 44" aria-hidden="true"><polyline points="10,12 20,22 10,32"></polyline><polyline points="21,12 31,22 21,32"></polyline></svg>
      </button>`;
    gallery.appendChild(controls);

    const toggle = controls.querySelector('.reuse-video-player__toggle');
    const prev = controls.querySelector('.reuse-video-player__skip--prev');
    const next = controls.querySelector('.reuse-video-player__skip--next');
    let index = 0;
    let inView = false;
    let userStarted = false;

    const updateStatus = () => {
      if (status) status.textContent = `${String(index + 1).padStart(2, '0')} / ${String(AI_VIDEO_MEDIA.length).padStart(2, '0')}`;
    };

    const syncState = () => {
      const playing = !video.paused && !video.ended;
      gallery.classList.toggle('is-video-playing', playing);
      gallery.classList.toggle('is-video-paused', userStarted && !playing);
      gallery.classList.toggle('is-video-idle', !userStarted);
      if (toggle) toggle.setAttribute('aria-label', playing ? '일시정지' : '재생');
    };

    const play = () => {
      userStarted = true;
      const promise = video.play();
      if (promise?.catch) promise.catch(() => syncState());
      syncState();
    };

    const pause = () => {
      video.pause();
      userStarted = true;
      syncState();
    };

    const load = (targetIndex, autoplay = false) => {
      index = (targetIndex + AI_VIDEO_MEDIA.length) % AI_VIDEO_MEDIA.length;
      video.pause();
      video.src = AI_VIDEO_MEDIA[index];
      video.load();
      updateStatus();
      if (autoplay) {
        userStarted = true;
        const onReady = () => {
          video.removeEventListener('canplay', onReady);
          if (inView && !document.hidden) play();
        };
        video.addEventListener('canplay', onReady, { once: true });
      } else {
        syncState();
      }
    };

    toggle?.addEventListener('click', () => {
      if (video.paused || video.ended) play();
      else pause();
    });
    prev?.addEventListener('click', () => load(index - 1, userStarted && !video.paused));
    next?.addEventListener('click', () => load(index + 1, userStarted && !video.paused));

    video.addEventListener('play', syncState);
    video.addEventListener('playing', syncState);
    video.addEventListener('pause', syncState);
    video.addEventListener('ended', () => load(index + 1, true));

    gallery.addEventListener('keydown', (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        if (event.target.closest('button')) return;
        event.preventDefault();
        if (video.paused || video.ended) play();
        else pause();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        load(index - 1, userStarted && !video.paused);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        load(index + 1, userStarted && !video.paused);
      }
    });

    const controller = {
      setInView(value) {
        inView = value;
        if (!inView && !video.paused) pause();
      },
      resume() {},
      pause() { if (!video.paused) pause(); }
    };
    controllers.set(gallery, controller);
    updateStatus();
    syncState();
  };

  setupAiVideoGallery(galleries[2]);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => controllers.get(entry.target)?.setInView(entry.isIntersecting));
    }, { threshold: 0.20, rootMargin: '0px 0px -5% 0px' });
    controllers.forEach((_, gallery) => observer.observe(gallery));
  } else {
    controllers.forEach((controller) => controller.setInView(true));
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) controllers.forEach((controller) => controller.pause());
    else controllers.forEach((controller) => controller.resume());
  });
})();