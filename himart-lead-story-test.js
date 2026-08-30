(() => {
  'use strict';

  const links = [...document.querySelectorAll('.story-nav a')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const setCurrent = (id) => {
    links.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-current', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setCurrent(visible.target.id);
    }, { rootMargin: '-22% 0px -62% 0px', threshold: [0, .15, .35] });
    sections.forEach((section) => observer.observe(section));
  }

  document.querySelectorAll('.deep-dive').forEach((details) => {
    const label = details.querySelector('.summary-label');
    if (!label) return;
    const openText = '접기';
    const closedText = label.textContent;
    const syncLabel = () => { label.textContent = details.open ? openText : closedText; };
    details.addEventListener('toggle', syncLabel);
    syncLabel();
  });
})();
