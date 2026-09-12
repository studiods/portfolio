(() => {
  'use strict';

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const referenceBars = [...document.querySelectorAll('.aimmo-system-page #data .aimmo-reference-bars')];

  /* Reuse 03.1-style viewport reveal for DURATION / DECISION / OUTPUT. */
  if (reduced) {
    referenceBars.forEach(chart => chart.classList.add('is-bars-focused'));
  } else if ('IntersectionObserver' in window) {
    const barObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.offsetParent !== null) {
          entry.target.classList.add('is-bars-focused');
        }
      });
    }, { threshold:.20, rootMargin:'0px 0px -5% 0px' });
    referenceBars.forEach(chart => barObserver.observe(chart));
  } else {
    referenceBars.forEach(chart => chart.classList.add('is-bars-focused'));
  }

  const rotator = document.querySelector('.aimmo-system-page #data .aimmo-output-rotator');
  if (!rotator) return;

  const slides = [...rotator.querySelectorAll('.aimmo-output-graph')];
  const dots = [...rotator.querySelectorAll('.aimmo-output-rotator__status i')];
  const prev = rotator.querySelector('.aimmo-output-rotator__nav--prev');
  const next = rotator.querySelector('.aimmo-output-rotator__nav--next');
  if (slides.length < 2) return;

  const HOLD_MS = 10000;
  const DISSOLVE_MS = 680;
  let index = 0;
  let timer = 0;
  let cleanupTimer = 0;
  let inView = false;

  const render = nextIndex => {
    const previousIndex = index;
    const resolvedIndex = (nextIndex + slides.length) % slides.length;
    const previousSlide = slides[previousIndex];
    const nextSlide = slides[resolvedIndex];

    if (cleanupTimer) window.clearTimeout(cleanupTimer);

    if (resolvedIndex === previousIndex) {
      slides.forEach((slide, i) => {
        const active = i === resolvedIndex;
        slide.classList.toggle('is-active', active);
        slide.classList.remove('is-leaving');
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
    } else {
      previousSlide?.classList.remove('is-active');
      previousSlide?.classList.add('is-leaving');
      previousSlide?.setAttribute('aria-hidden', 'true');

      nextSlide?.classList.remove('is-leaving');
      nextSlide?.classList.add('is-active');
      nextSlide?.setAttribute('aria-hidden', 'false');

      cleanupTimer = window.setTimeout(() => {
        slides.forEach((slide, i) => {
          if (i !== resolvedIndex) slide.classList.remove('is-leaving','is-active');
        });
      }, DISSOLVE_MS + 80);
    }

    index = resolvedIndex;

    requestAnimationFrame(() => {
      nextSlide?.querySelector('.aimmo-reference-bars')?.classList.add('is-bars-focused');
    });
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = 0;
  };

  const start = () => {
    stop();
    if (reduced || !inView || document.hidden) return;
    timer = window.setInterval(() => render(index + 1), HOLD_MS);
  };

  const move = delta => {
    render(index + delta);
    start();
  };

  prev?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    move(-1);
  });
  next?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    move(1);
  });

  rotator.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
    }
  });

  render(0);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      inView = Boolean(entries[0]?.isIntersecting);
      if (inView) start();
      else stop();
    }, { threshold:.18, rootMargin:'0px 0px -5% 0px' });
    observer.observe(rotator);
  } else {
    inView = true;
    start();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });
})();