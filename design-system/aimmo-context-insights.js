(() => {
  'use strict';
  const rotator = document.querySelector('.aimmo-system-page #data .aimmo-output-rotator');
  if (!rotator) return;

  const slides = [...rotator.querySelectorAll('.aimmo-output-graph')];
  const dots = [...rotator.querySelectorAll('.aimmo-output-rotator__status i')];
  if (slides.length < 2) return;

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let timer = 0;
  let inView = false;

  const render = nextIndex => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = 0;
  };

  const start = () => {
    stop();
    if (reduced || !inView || document.hidden) return;
    timer = window.setInterval(() => render(index + 1), 5000);
  };

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
