(() => {
  'use strict';

  const grid = document.querySelector('.works-grid');
  const controls = [...document.querySelectorAll('[data-works-sort]')];
  if (!grid || !controls.length) return;

  const cards = [...grid.querySelectorAll('.works-card')];
  const originalOrder = new Map(cards.map((card, index) => [card, index]));

  const comparators = {
    project: (a, b) => Number(a.dataset.projectRank) - Number(b.dataset.projectRank),
    company: (a, b) => {
      const byCompany = (a.dataset.company || '').localeCompare(b.dataset.company || '', 'en');
      return byCompany || originalOrder.get(a) - originalOrder.get(b);
    },
    recent: (a, b) => Number(b.dataset.start) - Number(a.dataset.start),
    past: (a, b) => Number(a.dataset.start) - Number(b.dataset.start)
  };

  const setActive = mode => {
    controls.forEach(button => {
      const active = button.dataset.worksSort === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  };

  const sortCards = mode => {
    const comparator = comparators[mode] || comparators.project;
    const ordered = [...cards].sort(comparator);

    grid.classList.add('is-reordering');
    document.body.classList.toggle('works-company-mode', mode === 'company');
    ordered.forEach(card => grid.appendChild(card));
    setActive(mode);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => grid.classList.remove('is-reordering'));
    });
  };

  controls.forEach(button => {
    button.addEventListener('click', () => sortCards(button.dataset.worksSort));
  });

  sortCards('project');
})();
