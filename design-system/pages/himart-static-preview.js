(() => {
  'use strict';

  /*
   * Static preview runtime:
   * - Shared navigation and scramble behaviour are reused.
   * - Page-owned behaviour only reveals authored elements and keeps native video
   *   playback resilient.
   * - It never injects, moves, wraps, or reconciles case-study content.
   */
  const addSharedScript = (src) => {
    if (document.querySelector('script[src^="' + src.split('?')[0] + '"]')) return;
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  };

  const reveal = () => {
    const nodes = [...document.querySelectorAll('.hm-reveal')];
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible', 'is-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach((node) => observer.observe(node));
  };

  const prepareVideo = () => {
    document.querySelectorAll('video[data-hm-video]').forEach((video) => {
      video.muted = true;
      video.playsInline = true;
      const attempt = video.play?.();
      if (attempt?.catch) attempt.catch(() => {});
    });
  };

  const prepareHeroFade = () => {
    const hero = document.querySelector('[data-hm-hero]');
    const overlay = hero?.querySelector('.hm-ds-hero__overlay');
    if (!hero || !overlay) return;

    const root = document.documentElement;
    const styles = getComputedStyle(root);
    const base = Number.parseFloat(styles.getPropertyValue('--hm-hero-matte-base-opacity')) || 0.4;
    const max = Number.parseFloat(styles.getPropertyValue('--hm-hero-matte-scroll-max-opacity')) || 1;
    const distance = Math.max(1, Number.parseFloat(hero.dataset.hmFadeDistance) || 420);
    let raf = 0;

    const apply = () => {
      raf = 0;
      const progress = Math.min(1, Math.max(0, (window.scrollY || 0) / distance));
      // Darken quickly at the start, then ease into the final matte.
      const eased = 1 - Math.pow(1 - progress, 2);
      const opacity = base + (max - base) * eased;
      root.style.setProperty('--hm-hero-overlay-opacity', opacity.toFixed(3));
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
  };

  const start = () => {
    reveal();
    prepareVideo();
    prepareHeroFade();
    addSharedScript('./design-system/navigation.js?v=20260921-5');
    addSharedScript('./design-system/scramble-final.js?v=20260922-2');
  };

  let started = false;
  const startOnce = () => {
    if (started) return;
    started = true;
    start();
  };

  // The script is loaded at the end of the page, so initialize immediately.
  // Keep the DOMContentLoaded fallback for deferred or cached execution paths.
  startOnce();
  document.addEventListener('DOMContentLoaded', startOnce, { once: true });
})();
