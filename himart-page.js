(() => {
  'use strict';

  const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = Array.from(document.querySelectorAll('.js-scramble'));

  const splitChars = (element) => {
    if (!element || element.dataset.split === '1') return [];
    element.dataset.split = '1';
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      Array.from(node.textContent).forEach((character) => {
        const span = document.createElement('span');
        span.className = 'hm-scramble-char';
        span.textContent = character;
        fragment.appendChild(span);
      });
      node.replaceWith(fragment);
    });
    return Array.from(element.querySelectorAll('.hm-scramble-char'))
      .filter((character) => character.textContent.trim());
  };

  const targetCharacters = new Map();
  targets.forEach((target) => {
    const characters = splitChars(target);
    targetCharacters.set(target, characters);
    if (!reducedMotion) characters.forEach((character) => {
      character.style.color = 'transparent';
    });
  });

  const animate = (target) => {
    if (!target || target.dataset.scrambleDone === '1') return;
    target.dataset.scrambleDone = '1';
    const characters = targetCharacters.get(target) || [];
    const startedAt = performance.now();
    const stagger = target.matches('.case-title-v2,.chapter-head h2') ? 24 : 18;
    const cycleDuration = 92;

    const render = (now) => {
      let complete = true;
      characters.forEach((character, index) => {
        const elapsed = now - startedAt - index * stagger;
        if (elapsed < 0) {
          complete = false;
          return;
        }
        const cycle = Math.floor(elapsed / cycleDuration);
        if (cycle < 3) {
          complete = false;
          character.dataset.scramble = POOL[(index * 17 + cycle * 13) % POOL.length];
          character.classList.add('is-scrambling');
        } else {
          character.classList.remove('is-scrambling');
          character.style.color = '';
        }
      });
      if (!complete) requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  };

  if (!reducedMotion) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animate(entry.target);
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
      targets.forEach((target) => observer.observe(target));
    } else {
      targets.forEach(animate);
    }
  }

  const links = Array.from(document.querySelectorAll('.case-local-nav a'));
  const chapters = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && chapters.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-28% 0px -62% 0px', threshold: 0 });
    chapters.forEach((chapter) => sectionObserver.observe(chapter));
  }
})();
