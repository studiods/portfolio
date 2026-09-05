/* HIMART Design System — animation layer
   Content and layout are intentionally not mutated here. */
(() => {
  let initialized = false;
  const init = () => {
    if (initialized) return;
    initialized = true;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = document.querySelectorAll('[data-hm-reveal], .hm-reveal, .wide-rise-target');
  const counterTargets = document.querySelectorAll('[data-hm-counter], [data-count]');
  const hero = document.querySelector('[data-hm-hero]');
  const video = document.querySelector('[data-hm-video]');

  if (!reduce && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach((el, i) => {
      el.style.setProperty('--hm-index', i);
      revealObserver.observe(el);
    });

    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = Number(el.dataset.hmCounter ?? el.dataset.count);
        if (!Number.isFinite(end)) return;
        const decimals = Number(el.dataset.hmDecimals ?? el.dataset.decimals ?? 0);
        const duration = Number(el.dataset.hmDuration ?? 1200);
        const start = performance.now();
        const tick = now => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (end * eased).toFixed(decimals);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });
    counterTargets.forEach(el => counterObserver.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
    counterTargets.forEach(el => { el.textContent = Number(el.dataset.hmCounter ?? el.dataset.count).toFixed(Number(el.dataset.hmDecimals ?? el.dataset.decimals ?? 0)); });
  }

  if (hero && !reduce) {
    const updateHero = () => {
      const progress = Math.min(1, Math.max(0, window.scrollY / Number(hero.dataset.hmFadeDistance || 420)));
      hero.style.setProperty('--hm-scroll-progress', progress.toFixed(3));
    };
    updateHero();
    window.addEventListener('scroll', updateHero, { passive: true });
  }

  if (video && 'IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) video.play?.().catch(() => {});
        else video.pause?.();
      });
    }, { threshold: 0.1 });
    videoObserver.observe(video);
  }

  const boot = () => {
    const hasTargets = document.querySelector('[data-hm-reveal], [data-hm-counter], [data-count]');
    if (hasTargets) { init(); return true; }
    return false;
  };
  if (!boot() && 'MutationObserver' in window) {
    const observer = new MutationObserver(() => {
      if (boot()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 20000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
})();
