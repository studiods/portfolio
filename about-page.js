(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroMain = document.querySelector('.about-hero-main');
  const heroLines = Array.from(document.querySelectorAll('.hero-mask-line-inner'));
  const profileItems = Array.from(document.querySelectorAll('.about-lead p'));

  const revealItems = (items, stagger = 110, initialDelay = 0) => {
    items.forEach((item, index) => {
      window.setTimeout(() => item.classList.add('is-revealed'), initialDelay + index * stagger);
    });
  };

  const prepareItems = (items) => {
    items.filter(Boolean).forEach((item) => item.classList.add('reveal-mask-item'));
  };

  const revealGroupOnView = (trigger, items, stagger = 110) => {
    const validItems = items.filter(Boolean);
    if (!trigger || !validItems.length) return;

    prepareItems(validItems);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealItems(validItems, stagger);
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.16,
      rootMargin: '0px 0px -12% 0px'
    });

    observer.observe(trigger);
  };

  if (reducedMotion) {
    heroMain?.classList.add('is-line-visible');
    heroLines.forEach((line) => line.classList.add('is-revealed'));
    return;
  }

  prepareItems(profileItems);

  window.requestAnimationFrame(() => {
    window.setTimeout(() => heroMain?.classList.add('is-line-visible'), 100);
    revealItems(heroLines, 150, 470);
    revealItems(profileItems, 130, 1050);
  });

  const thinkingSection = document.querySelector('.thinking-section');
  revealGroupOnView(
    thinkingSection,
    [
      thinkingSection?.querySelector('.about-section-label'),
      thinkingSection?.querySelector('.about-statement')
    ],
    150
  );
  document.querySelectorAll('.principle-row').forEach((row) => {
    revealGroupOnView(row, [row.querySelector('.principle-title'), row.querySelector('.principle-copy')], 120);
  });

  const interviewSection = document.querySelector('.interview-section');
  revealGroupOnView(
    interviewSection,
    [
      interviewSection?.querySelector('.about-section-label'),
      interviewSection?.querySelector('.about-statement')
    ],
    150
  );
  document.querySelectorAll('.interview-row').forEach((row) => {
    revealGroupOnView(row, [row.querySelector('.interview-q'), row.querySelector('.interview-a')], 120);
  });

  const careerSection = document.querySelector('.career-section');
  revealGroupOnView(
    careerSection,
    [careerSection?.querySelector('.about-section-label')],
    0
  );
  document.querySelectorAll('.career-row-v2').forEach((row) => {
    revealGroupOnView(
      row,
      [row.querySelector('.career-period'), row.querySelector('.career-company'), row.querySelector('.career-role')],
      90
    );
  });

  const footer = document.querySelector('.about-footer');
  revealGroupOnView(
    footer,
    [footer?.querySelector('h3'), footer?.querySelector('p')],
    120
  );
})();
