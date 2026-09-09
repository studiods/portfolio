(() => {
  'use strict';

  const galleries = Array.from(document.querySelectorAll('.reuse-production-gallery'));
  if (!galleries.length) return;

  galleries.forEach((gallery) => {
    const slides = Array.from(gallery.querySelectorAll('.reuse-production-gallery__slide'));
    const prev = gallery.querySelector('[data-reuse-gallery-prev]');
    const next = gallery.querySelector('[data-reuse-gallery-next]');
    const status = gallery.querySelector('[data-reuse-gallery-status]');
    if (!slides.length) return;

    let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));

    const render = () => {
      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      if (status) {
        status.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      }
    };

    const move = (delta) => {
      index = (index + delta + slides.length) % slides.length;
      render();
    };

    prev?.addEventListener('click', () => move(-1));
    next?.addEventListener('click', () => move(1));

    gallery.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        move(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        move(1);
      }
    });

    render();
  });
})();
