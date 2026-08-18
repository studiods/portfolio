(() => {
  'use strict';

  const sectionLabels = Array.from(document.querySelectorAll(
    '.thinking-section > .about-section-label, ' +
    '.interview-section > .about-section-label, ' +
    '.career-section > .about-section-label'
  ));

  const labelSet = new Set(sectionLabels);
  const targets = Array.from(document.querySelectorAll('.reveal-item, .reveal-line'))
    .filter((el) => !labelSet.has(el));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal = (el) => el.classList.add('is-visible');
  const revealLabel = (el) => {
    el.classList.remove('section-label-pending');
    el.classList.add('section-label-visible');
  };

  if (reducedMotion) {
    targets.forEach(reveal);
    sectionLabels.forEach(revealLabel);
    return;
  }

  /*
    Labels are visible by default in CSS. JS only puts unreached labels into a
    pending state, so a script/observer failure can never leave them invisible.
  */
  const prepareLabels = () => {
    const triggerY = window.innerHeight * 0.88;
    sectionLabels.forEach((label) => {
      const rect = label.getBoundingClientRect();
      if (rect.top <= triggerY) {
        revealLabel(label);
      } else {
        label.classList.add('section-label-pending');
      }
    });
  };

  const checkLabels = () => {
    const triggerY = window.innerHeight * 0.88;
    sectionLabels.forEach((label) => {
      if (label.classList.contains('section-label-visible')) return;
      const rect = label.getBoundingClientRect();
      /*
        Deliberately use only the top threshold. If fast scrolling or restored
        scroll position has already moved the label above the viewport, it is
        still revealed instead of being permanently skipped.
      */
      if (rect.top <= triggerY) revealLabel(label);
    });
  };

  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.01,
      rootMargin: '0px 0px -4% 0px'
    });

    targets.forEach((el) => observer.observe(el));
  } else {
    targets.forEach(reveal);
  }

  const checkGenericTargets = () => {
    const triggerY = window.innerHeight * 0.96;
    targets.forEach((el) => {
      if (el.classList.contains('is-visible')) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= triggerY) {
        reveal(el);
        if (observer) observer.unobserve(el);
      }
    });
  };

  prepareLabels();

  requestAnimationFrame(() => {
    checkLabels();
    checkGenericTargets();
  });

  let ticking = false;
  const onViewportChange = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      checkLabels();
      checkGenericTargets();
      ticking = false;
    });
  };

  window.addEventListener('scroll', onViewportChange, { passive: true });
  window.addEventListener('resize', onViewportChange, { passive: true });
})();
