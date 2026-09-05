/* HIMART Design System — animation layer
   Dynamic content-safe reveal, counter, hero fade and video visibility. */
(() => {
  let started = false;
  const revealSelector = '[data-hm-reveal], .hm-reveal, .wide-rise-target';

  const init = () => {
    if (started) return;
    started = true;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const reveals = new WeakSet();
    const counters = new WeakSet();

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

    const scan = () => {
      document.querySelectorAll(revealSelector).forEach(registerReveal);
      document.querySelectorAll('[data-hm-counter], [data-count]').forEach(registerCounter);
    };
    scan();
    if ('MutationObserver' in window) {
      const mo = new MutationObserver(scan);
      mo.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(() => mo.disconnect(), 30000);
    }

    const hero = document.querySelector('[data-hm-hero]');
    if (hero && !reduce) {
      const updateHero = () => {
        const progress = Math.min(1, Math.max(0, window.scrollY / Number(hero.dataset.hmFadeDistance || 420)));
        hero.style.setProperty('--hm-scroll-progress', progress.toFixed(3));
      };
      updateHero();
      window.addEventListener('scroll', updateHero, { passive: true });
    }

    const video = document.querySelector('[data-hm-video]');
    if (video && 'IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.isIntersecting ? video.play?.().catch(() => {}) : video.pause?.());
      }, { threshold: 0.1 });
      videoObserver.observe(video);
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