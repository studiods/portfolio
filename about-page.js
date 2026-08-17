(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroMain = document.querySelector('.about-hero-main');
  const heroLines = Array.from(document.querySelectorAll('.hero-mask-line-inner'));
  const profileItems = Array.from(document.querySelectorAll('.about-lead p'));

  const revealItems = (items, stagger = 80, initialDelay = 0) => {
    items.filter(Boolean).forEach((item, index) => {
      window.setTimeout(() => item.classList.add('is-revealed'), initialDelay + index * stagger);
    });
  };

  const prepareItems = (items) => {
    items.filter(Boolean).forEach((item) => item.classList.add('reveal-item'));
  };

  const revealOnView = (trigger, items, stagger = 70) => {
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
      threshold: 0.14,
      rootMargin: '0px 0px -10% 0px'
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
    window.setTimeout(() => heroMain?.classList.add('is-line-visible'), 80);
    revealItems(heroLines, 95, 300);
    revealItems(profileItems, 90, 720);
  });

  const thinkingSection = document.querySelector('.thinking-section');
  revealOnView(
    thinkingSection,
    [thinkingSection?.querySelector('.about-section-label'), thinkingSection?.querySelector('.about-statement')],
    90
  );
  document.querySelectorAll('.principle-row').forEach((row) => revealOnView(row, [row], 0));

  const interviewSection = document.querySelector('.interview-section');
  revealOnView(
    interviewSection,
    [interviewSection?.querySelector('.about-section-label'), interviewSection?.querySelector('.about-statement')],
    90
  );
  document.querySelectorAll('.interview-row').forEach((row) => revealOnView(row, [row], 0));

  const careerSection = document.querySelector('.career-section');
  revealOnView(careerSection, [careerSection?.querySelector('.about-section-label')], 0);
  document.querySelectorAll('.career-row-v2').forEach((row) => revealOnView(row, [row], 0));

  const footer = document.querySelector('.about-footer');
  revealOnView(footer, [footer?.querySelector('h3'), footer?.querySelector('p')], 80);
})();
