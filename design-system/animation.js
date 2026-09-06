/* HIMART Design System — animation layer
   Dynamic content-safe reveal, counter, hero fade and efficient video visibility/sequence. */
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

    const waitForFrame = video => new Promise(resolve => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      if ('requestVideoFrameCallback' in video) {
        video.requestVideoFrameCallback(done);
        window.setTimeout(done, 260);
      } else {
        video.addEventListener('playing', () => requestAnimationFrame(done), {once:true});
        window.setTimeout(done, 260);
      }
    });

    /*
      Efficient sequence strategy:
      - one video element only; no hidden clone or second decoder;
      - when a clip ends, fade the single element to black, replace src, then reveal after
        the next clip has produced its first frame;
      - visibility control pauses the same element offscreen and resumes it in place.
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
      video.removeAttribute('autoplay');
      video.autoplay = false;
      video.pause();
      video.preload = 'metadata';
      video.muted = true;
      video.setAttribute('muted', '');
      video.playsInline = true;

      let index = 0;
      let switching = false;
      let visible = false;

      const revealCurrent = async () => {
        if (!visible || !switching) return;
        video.preload = 'auto';
        const attempt = video.play?.();
        if (attempt && attempt.catch) await attempt.catch(() => {});
        if (!visible) return;
        await waitForFrame(video);
        if (!visible) return;
        video.classList.remove('is-sequence-switching');
        switching = false;
      };

      const switchToNext = () => {
        if (switching) return;
        switching = true;
        video.classList.add('is-sequence-switching');
        index = (index + 1) % sequence.length;
        video.pause();
        video.src = sequence[index];
        video.preload = visible ? 'auto' : 'metadata';
        video.load();

        const onReady = () => {
          video.removeEventListener('loadeddata', onReady);
          video.removeEventListener('canplay', onReady);
          if (visible) revealCurrent();
        };

        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) onReady();
        else {
          video.addEventListener('loadeddata', onReady, {once:true});
          video.addEventListener('canplay', onReady, {once:true});
        }
      };

      video.addEventListener('ended', switchToNext);

      video.__hmSequenceController = {
        setVisible(isVisible) {
          visible = isVisible;
          if (!visible) {
            video.pause();
            return;
          }
          video.preload = 'auto';
          if (switching) {
            revealCurrent();
            return;
          }
          const attempt = video.play?.();
          if (attempt && attempt.catch) attempt.catch(() => {});
        }
      };
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
    } else {
      videos.forEach(video => {
        const controller = video.__hmSequenceController;
        if (controller) controller.setVisible(true);
        else video.play?.().catch(() => {});
      });
    }

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) return;
      videos.forEach(video => video.pause?.());
    });
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