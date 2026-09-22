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
        entry.target.classList.add('is-visible');
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

  const start = () => {
    reveal();
    prepareVideo();
    addSharedScript('./design-system/navigation.js?v=20260921-5');
    addSharedScript('./design-system/scramble-final.js?v=20260922-2');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
