/* WORKS page controller — title state, project switcher, focused media playback and centered project handoff. */
(() => {
  'use strict';

  const body = document.body;
  if (!body.classList.contains('works-page-body')) return;

  const title = document.querySelector('.works-page-title');
  const hero = document.querySelector('.works-hero');
  const grid = document.querySelector('.works-grid');
  const cards = [...document.querySelectorAll('.works-grid .works-card')];
  if (!title || !hero || !grid || !cards.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const smoothstep = value => {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  };
  const copies = cards.map(card => card.querySelector('.works-card-copy'));
  const mediaVideos = cards
    .map(card => ({card, video:card.querySelector('.works-card-video')}))
    .filter(item => item.video);

  /*
    WORKS media runtime:
    - videos do not autoplay on page load;
    - the media center may sit anywhere inside the viewport 35%–65% band and remain focused;
    - leaving that ±15vh focus band pauses immediately at the current frame;
    - reverse scroll resumes from the paused frame when the media re-enters the band;
    - only the closest eligible project plays;
    - sequential clips use two stacked players only for seamless handoff;
    - the active clip must fire its own native `ended` event before a switch can occur;
    - the next clip is decoded behind the final frame, then visibility swaps immediately;
    - there is no fade, dimming, black transition or artificial end delay.
  */
  const focusState = new WeakMap();
  const absoluteSrc = src => new URL(src, document.baseURI).href;

  const waitForPlayableData = video => new Promise(resolve => {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      resolve();
      return;
    }
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      video.removeEventListener('loadeddata', done);
      video.removeEventListener('canplay', done);
      resolve();
    };
    video.addEventListener('loadeddata', done, {once:true});
    video.addEventListener('canplay', done, {once:true});
    window.setTimeout(done, 2500);
  });

  const waitForFrame = video => new Promise(resolve => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    if ('requestVideoFrameCallback' in video) {
      video.requestVideoFrameCallback(done);
      window.setTimeout(done, 500);
    } else {
      video.addEventListener('playing', () => requestAnimationFrame(done), {once:true});
      window.setTimeout(done, 500);
    }
  });

  const sourceMatches = (state, player, sequenceIndex) => {
    if (!state.sequence.length) return true;
    return (player.currentSrc || player.src || '') === absoluteSrc(state.sequence[sequenceIndex]);
  };

  const configureSequenceSource = (state, player, sequenceIndex) => {
    const expected = absoluteSrc(state.sequence[sequenceIndex]);
    if ((player.currentSrc || player.src || '') === expected) return;
    player.pause();
    player.src = state.sequence[sequenceIndex];
    player.preload = state.focused ? 'auto' : 'metadata';
    player.load();
  };

  const preloadNextSequence = state => {
    if (!state.buffer || state.sequence.length < 2) return;
    const nextIndex = (state.index + 1) % state.sequence.length;
    state.buffer.style.visibility = 'hidden';
    state.buffer.pause();
    configureSequenceSource(state, state.buffer, nextIndex);
    try { state.buffer.currentTime = 0; } catch (_) {}
  };

  const playState = state => {
    const player = state.active || state.video;
    if (!state.focused || document.hidden || state.switching || player.ended) return;
    player.preload = 'auto';
    const attempt = player.play?.();
    if (attempt?.catch) attempt.catch(() => {});
  };

  const advanceSequence = async state => {
    if (!state || state.sequence.length < 2 || state.switching || !state.focused || document.hidden) return;
    const outgoing = state.active;
    if (!state.activeStarted || !outgoing.ended || !sourceMatches(state, outgoing, state.index)) return;

    state.switching = true;
    const nextIndex = (state.index + 1) % state.sequence.length;
    configureSequenceSource(state, state.buffer, nextIndex);
    await waitForPlayableData(state.buffer);

    if (!outgoing.ended || !sourceMatches(state, outgoing, state.index)) {
      state.switching = false;
      return;
    }

    try { state.buffer.currentTime = 0; } catch (_) {}
    const attempt = state.buffer.play?.();
    if (attempt?.catch) await attempt.catch(() => {});
    await waitForFrame(state.buffer);

    if (!state.focused || document.hidden) {
      state.buffer.pause();
      state.switching = false;
      return;
    }

    state.buffer.style.visibility = 'visible';
    outgoing.style.visibility = 'hidden';
    outgoing.pause();

    state.active = state.buffer;
    state.buffer = outgoing;
    state.index = nextIndex;
    state.activeStarted = !state.active.paused;
    state.switching = false;

    if (state.active.paused) playState(state);
    preloadNextSequence(state);
  };

  mediaVideos.forEach(({video}) => {
    video.removeAttribute('autoplay');
    video.autoplay = false;
    video.pause();
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.preload = 'metadata';
    video.style.transition = 'none';
    video.style.opacity = '1';
    video.classList.remove('is-sequence-switching');

    const sequence = (video.dataset.worksVideoSequence || '')
      .split('|')
      .map(src => src.trim())
      .filter(Boolean);

    const state = {
      video,
      sequence,
      index:0,
      focused:false,
      switching:false,
      active:video,
      buffer:null,
      activeStarted:false
    };
    focusState.set(video, state);

    if (sequence.length > 1) {
      video.loop = false;
      video.removeAttribute('loop');
      video.src = sequence[0];
      video.load();
      video.style.visibility = 'visible';

      const standby = video.cloneNode(false);
      standby.removeAttribute('data-works-video-sequence');
      standby.removeAttribute('autoplay');
      standby.removeAttribute('loop');
      standby.autoplay = false;
      standby.loop = false;
      standby.muted = true;
      standby.defaultMuted = true;
      standby.playsInline = true;
      standby.preload = 'metadata';
      standby.setAttribute('muted', '');
      standby.setAttribute('playsinline', '');
      standby.setAttribute('aria-hidden', 'true');
      standby.style.visibility = 'hidden';
      standby.style.transition = 'none';
      standby.style.opacity = '1';
      standby.classList.remove('is-sequence-switching');
      video.parentNode.insertBefore(standby, video);
      state.buffer = standby;

      const bindSequencePlayer = player => {
        player.addEventListener('playing', () => {
          if (player === state.active && sourceMatches(state, player, state.index)) state.activeStarted = true;
        });
        player.addEventListener('ended', () => {
          if (player !== state.active || state.switching) return;
          if (!state.activeStarted || !sourceMatches(state, player, state.index)) return;
          advanceSequence(state);
        });
      };
      bindSequencePlayer(video);
      bindSequencePlayer(standby);
      preloadNextSequence(state);
    }
  });

  /* Warm only media near the viewport. This avoids eager playback while allowing the
     standby sequence frame to be ready before the active clip reaches its natural end. */
  if ('IntersectionObserver' in window && mediaVideos.length) {
    const warmObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const video = entry.target;
        const state = focusState.get(video);
        video.preload = 'auto';
        if (state?.buffer) state.buffer.preload = 'auto';
      });
    }, {rootMargin:'75% 0px 75% 0px', threshold:0.01});
    mediaVideos.forEach(({video}) => warmObserver.observe(video));
  }

  const updateFocusedMedia = () => {
    if (!mediaVideos.length) return;
    if (reduced) {
      mediaVideos.forEach(({video}) => {
        const state = focusState.get(video);
        if (state) {
          state.focused = false;
          state.active?.pause();
          state.buffer?.pause();
        } else video.pause();
        video.closest('.works-card-media-link')?.classList.remove('is-video-focused');
      });
      return;
    }

    const viewportCenter = window.innerHeight * .5;
    const focusTolerance = window.innerHeight * .15;
    let focusedVideo = null;
    let focusedDistance = Infinity;

    mediaVideos.forEach(({video}) => {
      const media = video.closest('.works-card-media') || video;
      const rect = media.getBoundingClientRect();
      const center = rect.top + rect.height * .5;
      const distance = Math.abs(center - viewportCenter);
      const visible = rect.bottom > 0 && rect.top < window.innerHeight;
      if (visible && distance <= focusTolerance && distance < focusedDistance) {
        focusedVideo = video;
        focusedDistance = distance;
      }
    });

    mediaVideos.forEach(({video}) => {
      const state = focusState.get(video);
      if (!state) return;
      const shouldFocus = video === focusedVideo;
      const mediaLink = video.closest('.works-card-media-link');
      mediaLink?.classList.toggle('is-video-focused', shouldFocus);

      if (!shouldFocus) {
        state.focused = false;
        state.active?.pause();
        state.buffer?.pause();
        return;
      }

      state.focused = true;
      state.active.preload = 'auto';
      if (state.buffer) state.buffer.preload = 'auto';

      if (state.sequence.length > 1 && state.active.ended) {
        advanceSequence(state);
        return;
      }
      playState(state);
    });
  };

  /* Entry scramble remains a one-second A-Z / 0-9 reveal, owned by the DS. */
  const runEntryScramble = () => {
    if (reduced || title.dataset.scrambleReady === '1') return;
    title.dataset.scrambleReady = '1';
    const finalText = title.textContent.trim() || 'WORKS';
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    title.textContent = '';
    const chars = [...finalText].map((finalChar, index) => {
      const span = document.createElement('span');
      span.className = 'entry-scramble-char';
      span.dataset.finalChar = finalChar;
      span.textContent = finalChar;
      title.appendChild(span);
      return {span, finalChar, index};
    });
    const duration = 1000;
    const start = performance.now();
    const frame = now => {
      const progress = clamp((now - start) / duration, 0, 1);
      chars.forEach(({span, finalChar, index}) => {
        const local = clamp(progress * 1.35 - index / Math.max(1, chars.length) * .35, 0, 1);
        if (local >= 1 || finalChar === ' ') span.textContent = finalChar;
        else span.textContent = pool[(Math.floor(now / 70) + index * 11) % pool.length];
      });
      if (progress < 1) requestAnimationFrame(frame);
      else chars.forEach(({span, finalChar}) => { span.textContent = finalChar; });
    };
    requestAnimationFrame(frame);
  };

  /* Project switcher is generated from the actual Works cards. */
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'works-title-menu-toggle';
  trigger.setAttribute('aria-label', '프로젝트 목록 열기');
  trigger.setAttribute('aria-haspopup', 'true');
  trigger.setAttribute('aria-expanded', 'false');

  const menu = document.createElement('nav');
  menu.className = 'works-project-menu';
  menu.setAttribute('aria-label', 'Works projects');

  cards.forEach(card => {
    const heading = card.querySelector('.works-card-title');
    const destination = card.querySelector('.works-card-title-link, .works-card-media-link');
    const item = document.createElement('a');
    item.href = destination?.getAttribute('href') || '#';
    item.textContent = heading ? heading.textContent.trim() : card.textContent.trim();
    menu.appendChild(item);
  });
  body.append(trigger, menu);

  const closeMenu = () => {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', '프로젝트 목록 열기');
    menu.classList.remove('is-open');
  };

  const placeSwitcher = () => {
    const rect = title.getBoundingClientRect();
    const triggerHeight = trigger.getBoundingClientRect().height || 24;
    trigger.style.left = `${Math.round(rect.right + 24)}px`;
    trigger.style.top = `${Math.round(rect.top + (rect.height - triggerHeight) / 2)}px`;
    menu.style.left = `${Math.round(rect.left)}px`;
    menu.style.top = `${Math.round(rect.bottom + 24)}px`;
  };

  trigger.addEventListener('click', () => {
    if (!body.classList.contains('works-title-compact')) return;
    const open = trigger.getAttribute('aria-expanded') === 'true';
    if (open) closeMenu();
    else {
      trigger.setAttribute('aria-expanded', 'true');
      trigger.setAttribute('aria-label', '프로젝트 목록 닫기');
      menu.classList.add('is-open');
      placeSwitcher();
    }
  });

  const goToTop = () => {
    if (!body.classList.contains('works-title-compact')) return;
    closeMenu();
    window.scrollTo({top:0, behavior:reduced ? 'auto' : 'smooth'});
  };

  title.addEventListener('click', goToTop);
  title.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (!body.classList.contains('works-title-compact')) return;
    event.preventDefault();
    goToTop();
  });

  document.addEventListener('pointerdown', event => {
    if (!menu.contains(event.target) && event.target !== trigger) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  const progressLinks = [...document.querySelectorAll('.works-progress a')];
  const updateProgress = () => {
    if (!progressLinks.length) return;
    const center = window.innerHeight * .5;
    let bestIndex = 0;
    let bestDistance = Infinity;
    progressLinks.forEach((link, index) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const distance = Math.abs((rect.top + rect.height * .5) - center);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    progressLinks.forEach((link, index) => link.classList.toggle('is-active', index === bestIndex));
  };

  /*
    Desktop project-copy handoff:
    - each copy rises at the exact same scroll rate as its media, with both top edges aligned;
    - once the copy reaches viewport center it stays completely fixed: position 0 shift / opacity 1;
    - no outgoing animation runs while the next title is still far below;
    - handoff starts only when the incoming title comes within a small visual gap of the centered title;
    - from that proximity point to center, the outgoing title uses the existing 120px upward motion and two-stage fade.
  */
  const updateProjectCopies = () => {
    const isDesktop = window.innerWidth > 780;
    if (!isDesktop) {
      copies.forEach(copy => {
        if (!copy) return;
        copy.style.removeProperty('--works-copy-top');
        copy.style.setProperty('--works-copy-opacity', '1');
        copy.style.setProperty('--works-copy-shift', '0px');
        copy.style.removeProperty('--works-copy-z');
        copy.style.pointerEvents = '';
      });
      return;
    }

    const viewportHeight = window.innerHeight;
    const center = viewportHeight * .5;
    const gridBottom = grid.getBoundingClientRect().bottom;
    const handoffGap = clamp(viewportHeight * .08, 72, 120);

    const outgoingOpacity = progress => {
      const p = clamp(progress, 0, 1);
      const earlyEnd = .28;

      if (p <= earlyEnd) {
        const early = smoothstep(p / earlyEnd);
        return 1 - .5 * early;
      }

      const tail = smoothstep((p - earlyEnd) / (1 - earlyEnd));
      return .5 * (1 - tail);
    };

    copies.forEach((copy, index) => {
      if (!copy) return;

      const cardRect = cards[index].getBoundingClientRect();
      const copyHeight = copy.offsetHeight;
      const naturalCenter = cardRect.top + copyHeight * .5;

      /* Natural scroll until centered; after that the copy is fully locked until proximity handoff. */
      const y = Math.max(center, naturalCenter);
      let opacity = 1;
      let shift = 0;

      const nextCopy = copies[index + 1];
      const nextCard = cards[index + 1];

      if (nextCard && nextCopy) {
        const nextHeight = nextCopy.offsetHeight;
        const nextRect = nextCard.getBoundingClientRect();
        const nextAnchor = nextRect.top + nextHeight * .5;
        const outgoingBottom = center + copyHeight * .5;
        const handoffStart = outgoingBottom + handoffGap + nextHeight * .5;

        if (nextAnchor < handoffStart) {
          const progress = clamp(
            (handoffStart - nextAnchor) / Math.max(1, handoffStart - center),
            0,
            1
          );
          const motion = smoothstep(progress);
          opacity = outgoingOpacity(progress);
          shift = -120 * motion;
        }
      } else if (gridBottom < center) {
        /* Final-project escape only: avoid leaving the last fixed title over the footer. */
        const progress = clamp((center - gridBottom) / Math.max(1, center), 0, 1);
        const motion = smoothstep(progress);
        opacity = 1 - motion;
        shift = -120 * motion;
      }

      copy.style.setProperty('--works-copy-top', `${y.toFixed(1)}px`);
      copy.style.setProperty('--works-copy-opacity', opacity.toFixed(3));
      copy.style.setProperty('--works-copy-shift', `${shift.toFixed(1)}px`);
      copy.style.setProperty('--works-copy-z', String(1000 + index));

      const copyTop = y - copyHeight * .5 + shift;
      const copyBottom = copyTop + copyHeight;
      const isVisible = copyBottom > 0 && copyTop < viewportHeight;
      copy.style.pointerEvents = isVisible && opacity > .18 ? 'auto' : 'none';
    });
  };

  const updateTitle = () => {
    const range = Math.max(1, Math.min(520, hero.offsetHeight * .55));
    const p = reduced ? (window.scrollY > 32 ? 1 : 0) : clamp(window.scrollY / range, 0, 1);
    const startSize = clamp(window.innerWidth * .09,72,160);
    const endSize = 32;
    const startTop = window.innerHeight * .5;
    const endTop = window.innerWidth <= 780 ? 24 : 32;
    const size = startSize + (endSize - startSize) * p;
    const top = startTop + (endTop - startTop) * p;
    const translate = -50 * (1 - p);

    title.style.setProperty('--works-title-size', `${size.toFixed(2)}px`);
    title.style.setProperty('--works-title-top', `${top.toFixed(2)}px`);
    title.style.setProperty('--works-title-translate', `${translate.toFixed(2)}%`);

    const compact = p >= .985;
    body.classList.toggle('works-title-compact', compact);
    if (compact) {
      title.setAttribute('role', 'button');
      title.setAttribute('tabindex', '0');
      title.setAttribute('aria-label', 'WORKS 맨 위로 이동');
    } else {
      title.removeAttribute('role');
      title.removeAttribute('tabindex');
      title.removeAttribute('aria-label');
      closeMenu();
    }
    placeSwitcher();
    updateProjectCopies();
    updateProgress();
    updateFocusedMedia();
  };

  let raf = 0;
  const requestUpdate = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      updateTitle();
    });
  };

  window.addEventListener('scroll', requestUpdate, {passive:true});
  window.addEventListener('resize', requestUpdate);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      mediaVideos.forEach(({video}) => {
        const state = focusState.get(video);
        if (state) {
          state.focused = false;
          state.active?.pause();
          state.buffer?.pause();
        } else video.pause();
        video.closest('.works-card-media-link')?.classList.remove('is-video-focused');
      });
    } else requestUpdate();
  });
  runEntryScramble();
  updateTitle();
})();
