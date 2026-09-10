(() => {
  'use strict';

  const HOLD_MS = 2500;
  const GALLERY_02_INITIAL_HOLD_MS = 5000;
  const VIDEO_STOP_FALLBACK_MS = 3000;
  const TRANSITION_MS = 720;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  /* 03.2 — image-information standards: same rolling grammar as 03.3 + horizontal flick. */
  const setupImageDisplayGalleries = () => {
    const journey = document.querySelector('#journey');
    const cards = Array.from(document.querySelectorAll('.reuse-image-display-card'));
    if (!journey || !cards.length) return;

    const subsection = cards[0].closest('.hm-subsection');
    const sectionTitle = subsection?.querySelector('.hm-subtitle');
    const sectionDescription = subsection?.querySelector('.hm-subcopy');

    if (sectionTitle) {
      sectionTitle.innerHTML = '이미지가 중요한 판단 근거였기에,<br>무엇을 어떻게 보여줄지 기준부터 만들었습니다.';
    }
    if (sectionDescription) {
      sectionDescription.textContent = '상품본부와 카테고리별 필수 촬영 부위와 확인 포인트를 정리해, 상태 정보를 빠르게 확인할 수 있게 했습니다.';
    }

    const content = [
      {
        title: '상품본부와 카테고리별 확인 기준을 함께 정리했습니다.',
        copy: '제품마다 고객이 확인해야 할 정보가 달라 상품본부와 협의해 카테고리별 핵심 확인 포인트를 취합했습니다.'
      },
      {
        title: '제품마다 반드시 보여줘야 할 부위를 촬영 기준으로 만들었습니다.',
        copy: '전면·측면·내부·조작부 등 카테고리별 필수 촬영 부위와 중점 확인 사항을 정리해 빠짐없이 보여주도록 했습니다.'
      },
      {
        title: '흠집과 사용 흔적은 가까이 확인할 수 있게 했습니다.',
        copy: '스크래치·찍힘·변색처럼 구매 판단에 영향을 주는 흔적은 위치와 정도가 드러나도록 상세 이미지로 확인하게 했습니다.'
      },
      {
        title: '전체 형태와 보이지 않는 면까지 여러 각도로 확인하게 했습니다.',
        copy: '한 장으로 판단하기 어려운 제품은 여러 방향과 360도 촬영을 활용해 전체 상태를 빠르게 살펴볼 수 있게 했습니다.'
      }
    ];

    const controllers = new Map();

    cards.forEach((card, cardIndex) => {
      const copy = card.querySelector('.reuse-image-display-card__copy');
      const heading = copy?.querySelector('h4');
      const paragraph = copy?.querySelector('p');
      const item = content[cardIndex];
      if (heading && item) heading.textContent = item.title;
      if (paragraph && item) paragraph.textContent = item.copy;

      card.tabIndex = 0;
      card.setAttribute('aria-label', item?.title || `이미지 정보 갤러리 ${cardIndex + 1}`);

      const legacyMedia = card.querySelector(':scope > .reuse-image-display-card__media');
      const viewport = document.createElement('div');
      viewport.className = 'reuse-image-display-card__viewport';

      const createSlide = (index, mediaNode = null) => {
        const slide = document.createElement('article');
        slide.className = `reuse-image-display-card__slide${index === 0 ? ' is-active' : ''}`;
        slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
        slide.dataset.reuseImageSlot = String(index + 1).padStart(2, '0');

        const media = mediaNode || document.createElement('div');
        media.classList.add('reuse-image-display-card__media');
        media.setAttribute('aria-hidden', 'true');
        slide.appendChild(media);
        return slide;
      };

      /* Keep the authored media slot as slide 01 and prepare two additional slots for later uploads. */
      viewport.appendChild(createSlide(0, legacyMedia || null));
      viewport.appendChild(createSlide(1));
      viewport.appendChild(createSlide(2));
      card.insertBefore(viewport, copy || card.firstChild);

      const prev = document.createElement('button');
      prev.className = 'reuse-image-display-card__nav reuse-image-display-card__nav--prev';
      prev.type = 'button';
      prev.setAttribute('aria-label', '이전 이미지');

      const next = document.createElement('button');
      next.className = 'reuse-image-display-card__nav reuse-image-display-card__nav--next';
      next.type = 'button';
      next.setAttribute('aria-label', '다음 이미지');

      const status = document.createElement('span');
      status.className = 'reuse-image-display-card__status';
      status.setAttribute('aria-live', 'polite');

      card.append(prev, next, status);

      const slides = Array.from(viewport.querySelectorAll('.reuse-image-display-card__slide'));
      let index = 0;
      let timer = 0;
      let busy = false;
      let inView = false;
      let pointerStart = null;

      const clearTimer = () => {
        if (timer) window.clearTimeout(timer);
        timer = 0;
      };

      const updateStatus = () => {
        status.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      };

      const settle = () => {
        slides.forEach((slide, i) => {
          const active = i === index;
          slide.classList.toggle('is-active', active);
          slide.classList.remove('is-next', 'is-entering', 'is-exiting');
          slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        });
        card.classList.remove('is-reverse');
        updateStatus();
      };

      const schedule = () => {
        clearTimer();
        if (!inView || document.hidden || busy || slides.length < 2) return;
        timer = window.setTimeout(() => move(1), HOLD_MS);
      };

      const transitionTo = (targetIndex, direction = 1) => {
        if (busy || slides.length < 2 || targetIndex === index) return;
        clearTimer();
        busy = true;

        const current = slides[index];
        const incoming = slides[targetIndex];
        card.classList.toggle('is-reverse', direction < 0);

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
          settle();
          schedule();
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

      function move(delta) {
        if (busy || slides.length < 2) return;
        const targetIndex = (index + delta + slides.length) % slides.length;
        transitionTo(targetIndex, delta < 0 ? -1 : 1);
      }

      prev.addEventListener('click', (event) => {
        event.stopPropagation();
        move(-1);
      });
      next.addEventListener('click', (event) => {
        event.stopPropagation();
        move(1);
      });

      card.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          move(-1);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          move(1);
        }
      });

      card.addEventListener('pointerdown', (event) => {
        if (event.target.closest('button')) return;
        pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
        clearTimer();
      });

      card.addEventListener('pointerup', (event) => {
        if (!pointerStart || pointerStart.id !== event.pointerId) return;
        const dx = event.clientX - pointerStart.x;
        const dy = event.clientY - pointerStart.y;
        pointerStart = null;

        if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.15) {
          move(dx < 0 ? 1 : -1);
        } else {
          schedule();
        }
      });

      card.addEventListener('pointercancel', () => {
        pointerStart = null;
        schedule();
      });

      const controller = {
        setInView(value) {
          inView = value;
          if (inView) schedule();
          else clearTimer();
        },
        resume() { if (inView) schedule(); },
        pause() { clearTimer(); }
      };

      controllers.set(card, controller);
      settle();
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => controllers.get(entry.target)?.setInView(entry.isIntersecting));
      }, { threshold: 0.20, rootMargin: '0px 0px -5% 0px' });
      controllers.forEach((_, card) => observer.observe(card));
    } else {
      controllers.forEach((controller) => controller.setInView(true));
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) controllers.forEach((controller) => controller.pause());
      else controllers.forEach((controller) => controller.resume());
    });
  };

  setupImageDisplayGalleries();

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
    './assets/movies/reuse_03.mp4',
    './assets/movies/reuse_04.mp4',
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
        <svg class="reuse-video-player__icon reuse-video-player__icon--play" viewBox="0 0 48 48" aria-hidden="true"><polyline points="18,12 32,24 18,36"></polyline></svg>
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