(() => {
  'use strict';

  const runtime = window.HMDSGalleryRuntime;
  const reduced = runtime?.reducedMotion ?? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const focusCharts = [...document.querySelectorAll(
    '.aimmo-system-page #data .aimmo-reference-bars, ' +
    '.aimmo-system-page #data .aimmo-environment-ratio, ' +
    '.aimmo-system-page #direction .aimmo-impact-chart'
  )];

  /* Reveal every bar-based graph when it enters the viewport. */
  if (reduced) {
    focusCharts.forEach(chart => chart.classList.add('is-bars-focused'));
  } else if ('IntersectionObserver' in window) {
    const barObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.offsetParent !== null) {
          entry.target.classList.add('is-bars-focused');
        }
      });
    }, { threshold:.20, rootMargin:'0px 0px -5% 0px' });
    focusCharts.forEach(chart => barObserver.observe(chart));
  } else {
    focusCharts.forEach(chart => chart.classList.add('is-bars-focused'));
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
  let autoActive = false;

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
    const nextBars = nextSlide?.querySelector('.aimmo-reference-bars');
    nextBars?.classList.remove('is-bars-focused');
    if (reduced || autoActive) {
      requestAnimationFrame(() => {
        nextBars?.classList.add('is-bars-focused');
      });
    }
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = 0;
  };

  const start = () => {
    stop();
    if (reduced || !autoActive || slides.length < 2) return;
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

  const setAutoActive = active => {
    autoActive = Boolean(active);
    if (autoActive) {
      const activeBars = slides[index]?.querySelector('.aimmo-reference-bars');
      requestAnimationFrame(() => activeBars?.classList.add('is-bars-focused'));
      start();
    } else {
      stop();
    }
  };

  if (runtime) {
    runtime.register(rotator, setAutoActive);
  } else if ('IntersectionObserver' in window) {
    let inView = false;
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      inView = Boolean(entry?.isIntersecting && entry.intersectionRatio >= .12);
      setAutoActive(inView && !document.hidden && !reduced);
    }, { threshold:[0,.12,.25,.5,1] });
    observer.observe(rotator);
    document.addEventListener('visibilitychange', () => setAutoActive(inView && !document.hidden && !reduced));
  } else {
    setAutoActive(!document.hidden && !reduced);
  }
})();
