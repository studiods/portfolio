/* HIMART Design System — animation layer
   Dynamic content-safe reveal, counter, hero fade and seamless video visibility/sequence. */
(() => {
  let started = false;
  const revealSelector = '[data-hm-reveal], .hm-reveal, .wide-rise-target';

  const init = () => {
    if (started) return;
    started = true;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const reveals = new WeakSet();
    const counters = new WeakSet();
    const videoSequences = new WeakSet();

    const registerReveal = (el) => {
      if (reveals.has(el)) return;
      reveals.add(el);
      if (reduce || !('IntersectionObserver' in window)) {
        el.classList.add('is-visible');
        return;
      }
      revealObserver.observe(el);
    };
    const revealObserver = !reduce && 'IntersectionObserver' in window
      ? new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            entry.target.classList.add('is-wide-rise-in');
            observer.unobserve(entry.target);
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
      : null;

    const registerCounter = (el) => {
      if (counters.has(el)) return;
      counters.add(el);
      const end = Number(el.dataset.hmCounter ?? el.dataset.count);
      if (!Number.isFinite(end)) return;
      const decimals = Number(el.dataset.hmDecimals ?? el.dataset.decimals ?? 0);
      if (reduce || !('requestAnimationFrame' in window)) {
        el.textContent = end.toFixed(decimals);
        return;
      }
      const run = () => {
        const start = performance.now();
        const tick = now => {
          const p = Math.min(1, (now - start) / Number(el.dataset.hmDuration || 1200));
          el.textContent = (end * (1 - Math.pow(1 - p, 3))).toFixed(decimals);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, observer) => {
          if (!entries[0].isIntersecting) return;
          run();
          observer.disconnect();
        }, { threshold: 0.5 });
        io.observe(el);
      } else run();
    };

    /*
      Seamless sequence strategy:
      - never replace the src on the video currently visible;
      - keep a second hidden video preloaded with the next clip;
      - start that hidden buffer before the current clip ends;
      - reveal it only after the browser has composited its first decoded frame;
      - the previous last frame remains visible underneath until the swap is safe.
    */
    const registerVideoSequence = (video) => {
      if (videoSequences.has(video)) return;
      const sequence = (video.dataset.hmVideoSequence || '')
        .split('|')
        .map(src => src.trim())
        .filter(Boolean);
      if (sequence.length < 2) return;

      videoSequences.add(video);
      video.loop = false;
      video.removeAttribute('loop');
      video.preload = 'auto';
      video.muted = true;
      video.setAttribute('muted', '');
      video.classList.add('hm-sequence-buffer', 'is-sequence-active');

      const standby = video.cloneNode(false);
      standby.removeAttribute('data-hm-video');
      standby.removeAttribute('data-hm-video-sequence');
      standby.removeAttribute('autoplay');
      standby.removeAttribute('loop');
      standby.classList.remove('is-sequence-active');
      standby.classList.add('hm-sequence-buffer');
      standby.preload = 'auto';
      standby.muted = true;
      standby.setAttribute('muted', '');
      standby.playsInline = true;
      video.insertAdjacentElement('afterend', standby);

      let active = video;
      let buffer = standby;
      let index = 0;
      let switching = false;
      let visible = true;
      let frameCallbackId = null;
      let fallbackTimer = 0;
      let primeToken = 0;

      const setSource = (target, src) => {
        target.pause?.();
        target.src = src;
        target.preload = 'auto';
        target.load();
      };

      const whenDecoded = (target) => new Promise(resolve => {
        let resolved = false;
        const done = () => {
          if (resolved) return;
          resolved = true;
          target.removeEventListener('loadeddata', done);
          target.removeEventListener('canplay', done);
          resolve();
        };
        if (target.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          done();
          return;
        }
        target.addEventListener('loadeddata', done, { once:true });
        target.addEventListener('canplay', done, { once:true });
      });

      const whenFramePresented = (target) => new Promise(resolve => {
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          resolve();
        };
        if ('requestVideoFrameCallback' in target) {
          target.requestVideoFrameCallback(done);
          setTimeout(done, 240);
        } else {
          target.addEventListener('playing', () => requestAnimationFrame(done), { once:true });
          setTimeout(done, 240);
        }
      });

      const primeBuffer = async () => {
        const token = ++primeToken;
        const nextSrc = sequence[(index + 1) % sequence.length];
        setSource(buffer, nextSrc);
        await whenDecoded(buffer);
        if (token !== primeToken) return;
        try { buffer.currentTime = 0; } catch (_) {}
        const attempt = buffer.play?.();
        if (attempt && attempt.catch) await attempt.catch(() => {});
        await whenFramePresented(buffer);
        if (token !== primeToken) return;
        buffer.pause?.();
        try { buffer.currentTime = 0; } catch (_) {}
      };

      const clearWatch = () => {
        if (frameCallbackId !== null && 'cancelVideoFrameCallback' in active) {
          active.cancelVideoFrameCallback(frameCallbackId);
          frameCallbackId = null;
        }
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
          fallbackTimer = 0;
        }
      };

      const completeSwap = () => {
        const previous = active;
        active = buffer;
        buffer = previous;
        index = (index + 1) % sequence.length;

        window.setTimeout(() => {
          buffer.pause?.();
          buffer.classList.remove('is-sequence-active');
          switching = false;
          primeBuffer();
          if (visible) watchActive();
        }, 140);
      };

      const switchToBuffered = async () => {
        if (switching) return;
        switching = true;
        clearWatch();

        await whenDecoded(buffer);
        try { buffer.currentTime = 0; } catch (_) {}
        const attempt = buffer.play?.();
        if (attempt && attempt.catch) await attempt.catch(() => {});
        await whenFramePresented(buffer);

        /* Swap only after the next frame has reached the compositor. */
        buffer.classList.add('is-sequence-active');
        active.classList.remove('is-sequence-active');
        completeSwap();
      };

      const watchActive = () => {
        clearWatch();
        if (!visible || switching || active.paused || active.ended) return;

        if ('requestVideoFrameCallback' in active) {
          const onFrame = () => {
            if (!visible || switching || active.paused) return;
            const remaining = Number.isFinite(active.duration) ? active.duration - active.currentTime : Infinity;
            if (remaining <= 0.12) {
              switchToBuffered();
              return;
            }
            frameCallbackId = active.requestVideoFrameCallback(onFrame);
          };
          frameCallbackId = active.requestVideoFrameCallback(onFrame);
        } else {
          const poll = () => {
            if (!visible || switching || active.paused) return;
            const remaining = Number.isFinite(active.duration) ? active.duration - active.currentTime : Infinity;
            if (remaining <= 0.12) switchToBuffered();
            else fallbackTimer = window.setTimeout(poll, 50);
          };
          fallbackTimer = window.setTimeout(poll, 50);
        }
      };

      active.addEventListener('ended', switchToBuffered);
      standby.addEventListener('ended', switchToBuffered);
      active.addEventListener('playing', watchActive);
      standby.addEventListener('playing', watchActive);

      const controller = {
        setVisible(isVisible) {
          visible = isVisible;
          if (!visible) {
            clearWatch();
            active.pause?.();
            buffer.pause?.();
            return;
          }
          const attempt = active.play?.();
          if (attempt && attempt.catch) attempt.catch(() => {});
          watchActive();
        }
      };
      video.__hmSequenceController = controller;

      primeBuffer();
      const firstAttempt = active.play?.();
      if (firstAttempt && firstAttempt.catch) firstAttempt.catch(() => {});
      watchActive();
    };

    const scan = () => {
      document.querySelectorAll(revealSelector).forEach(registerReveal);
      document.querySelectorAll('[data-hm-counter], [data-count]').forEach(registerCounter);
      document.querySelectorAll('[data-hm-video]').forEach(registerVideoSequence);
    };
    scan();
    // Scramble animation is owned by design-system/scramble-final.js.
    // Keeping it out of this layer prevents duplicate observers and text races.
    window.__hmAnimationScan = scan;
    window.addEventListener('load', () => { scan(); setTimeout(scan, 600); }, { once: true });

    const hero = document.querySelector('[data-hm-hero]');
    if (hero && !reduce) {
      const updateHero = () => {
        const progress = Math.min(1, Math.max(0, window.scrollY / Number(hero.dataset.hmFadeDistance || 420)));
        const eased = 1 - Math.pow(1 - progress, 3);
        hero.style.setProperty('--hm-scroll-progress', progress.toFixed(3));
        hero.style.setProperty('--hm-hero-overlay-opacity', (0.5 + eased * 0.5).toFixed(3));
        hero.style.setProperty('--hm-hero-copy-opacity', (1 - eased * 0.88).toFixed(3));
      };
      updateHero();
      window.addEventListener('scroll', updateHero, { passive: true });
    }

    const videos = [...document.querySelectorAll('[data-hm-video]')];
    if (videos.length && 'IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const controller = entry.target.__hmSequenceController;
          if (controller) controller.setVisible(entry.isIntersecting);
          else entry.isIntersecting ? entry.target.play?.().catch(() => {}) : entry.target.pause?.();
        });
      }, { threshold: 0.1 });
      videos.forEach(video => videoObserver.observe(video));
    }
  };

  const boot = () => {
    if (document.querySelector(revealSelector + ', [data-hm-counter], [data-count], [data-hm-hero], [data-hm-video]')) {
      init();
      return true;
    }
    return false;
  };
  if (!boot() && 'MutationObserver' in window) {
    const mo = new MutationObserver(() => { if (boot()) mo.disconnect(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => mo.disconnect(), 20000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
})();