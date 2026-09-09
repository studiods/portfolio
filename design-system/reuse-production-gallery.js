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

  galleries.forEach((gallery, galleryIndex) => {
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
      if (playPromise?.catch) {
        playPromise.catch(() => scheduleVideoFallback(video));
      }
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

      /* Force the incoming 95% / 20%-black state to paint before transition. */
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
