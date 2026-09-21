(() => {
  'use strict';

  const body = document.body;
  if (!body?.classList.contains('contact-page-body')) return;

  const hero = document.querySelector('.contact-hero');
  const title = document.querySelector('.contact-page-title');
  const revealItems = [...document.querySelectorAll('.contact-row')];
  if (!hero || !title) return;

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  body.classList.add('contact-motion-ready');

  const updateTitle = () => {
    const range = Math.max(1, Math.min(520, hero.offsetHeight * .55));
    const progress = reduced ? (window.scrollY > 32 ? 1 : 0) : clamp(window.scrollY / range, 0, 1);
    const startSize = clamp(window.innerWidth * .09, 72, 160);
    const endSize = 32;
    const size = startSize + (endSize - startSize) * progress;

    title.style.setProperty('--contact-title-size', size.toFixed(2) + 'px');
    body.classList.toggle('contact-title-compact', progress >= .985);
  };

  let raf = 0;
  const requestUpdate = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      updateTitle();
    });
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  updateTitle();

  const details = document.querySelector('.contact-details');
  const contactContent = document.querySelector('.contact-content');
  const revealDelay = 2000;
  const autoScrollDuration = 1700;
  const hideDuration = 1050;
  let revealTimer = 0;
  let hideTimer = 0;
  let scrambleObserver = null;
  let autoScrollRaf = 0;
  let autoScrolling = false;
  let userInteracted = false;
  let lastScrollY = window.scrollY;

  const easeInCubic = progress => progress * progress * progress;

  const showDetails = () => {
    if (!details) return;
    if (hideTimer) {
      window.clearTimeout(hideTimer);
      hideTimer = 0;
    }
    details.classList.add('is-contact-visible');
    requestAnimationFrame(() => {
      revealItems.forEach(item => item.classList.add('is-contact-visible'));
    });
  };

  const hideDetails = () => {
    if (!details) return;
    revealItems.forEach(item => item.classList.remove('is-contact-visible'));
    if (hideTimer) window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      details.classList.remove('is-contact-visible');
      hideTimer = 0;
    }, hideDuration);
  };

  const stopAutoScroll = () => {
    if (autoScrollRaf) cancelAnimationFrame(autoScrollRaf);
    autoScrollRaf = 0;
    autoScrolling = false;
  };

  const animateScrollTo = targetY => {
    if (reduced) {
      window.scrollTo(0, targetY);
      updateTitle();
      return;
    }

    stopAutoScroll();
    autoScrolling = true;
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startedAt = performance.now();

    const step = now => {
      const elapsed = now - startedAt;
      const progress = clamp(elapsed / autoScrollDuration, 0, 1);
      const eased = easeInCubic(progress);
      window.scrollTo(0, startY + (distance * eased));
      updateTitle();

      if (progress < 1) {
        autoScrollRaf = requestAnimationFrame(step);
      } else {
        window.scrollTo(0, targetY);
        updateTitle();
        autoScrollRaf = 0;
        autoScrolling = false;
        lastScrollY = window.scrollY;
      }
    };

    autoScrollRaf = requestAnimationFrame(step);
  };

  const revealAndCenterDetails = () => {
    if (!details || !contactContent || userInteracted) return;

    showDetails();

    const titleRange = Math.max(1, Math.min(520, hero.offsetHeight * .55));
    const stickyCenterTarget = contactContent.offsetTop - (window.innerHeight * .5);
    const targetY = Math.max(0, titleRange, stickyCenterTarget);
    animateScrollTo(targetY);
  };

  const scheduleReveal = () => {
    if (revealTimer || userInteracted) return;
    scrambleObserver?.disconnect();
    scrambleObserver = null;
    revealTimer = window.setTimeout(() => {
      revealTimer = 0;
      revealAndCenterDetails();
    }, revealDelay);
  };

  const onManualIntent = () => {
    userInteracted = true;
    if (revealTimer) {
      window.clearTimeout(revealTimer);
      revealTimer = 0;
    }
    stopAutoScroll();
  };

  const handleDirectionalScroll = () => {
    const currentY = window.scrollY;
    const delta = currentY - lastScrollY;

    if (!autoScrolling && Math.abs(delta) > 1) {
      if (delta > 0) showDetails();
      else hideDetails();
    }

    lastScrollY = currentY;
  };

  window.addEventListener('wheel', onManualIntent, { passive:true });
  window.addEventListener('touchstart', onManualIntent, { passive:true });
  window.addEventListener('keydown', event => {
    if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) onManualIntent();
  });
  window.addEventListener('scroll', handleDirectionalScroll, { passive:true });

  if (reduced) {
    scheduleReveal();
  } else if (title.getAttribute('data-hm-scramble-complete') === 'true') {
    scheduleReveal();
  } else if ('MutationObserver' in window) {
    scrambleObserver = new MutationObserver(() => {
      if (title.getAttribute('data-hm-scramble-complete') === 'true') scheduleReveal();
    });
    scrambleObserver.observe(title, {
      attributes:true,
      attributeFilter:['data-hm-scramble-complete']
    });
  }
})();
