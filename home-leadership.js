(() => {
  'use strict';

  const section = document.querySelector('#leadership');
  if (!section) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const targets = [...section.querySelectorAll('[data-leadership-scramble]')];
  const copyTargets = [...section.querySelectorAll('.leadership-reveal-copy')];

  const splitTarget = target => {
    if (!target || target.dataset.leadershipSplit === '1') return [];
    target.dataset.leadershipSplit = '1';

    const chars = [];
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          [...child.textContent].forEach(glyph => {
            const span = document.createElement('span');
            span.className = 'leadership-scramble-char';
            span.textContent = glyph;
            span.dataset.finalChar = glyph;
            if (glyph.trim()) span.classList.add('is-pending');
            frag.appendChild(span);
            chars.push(span);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE && !child.classList.contains('leadership-scramble-char')) {
          walk(child);
        }
      });
    };

    walk(target);
    return chars;
  };

  const targetChars = new Map(targets.map(target => [target, splitTarget(target)]));

  const randomGlyph = previous => {
    let glyph = previous;
    while (glyph === previous) glyph = POOL[Math.floor(Math.random() * POOL.length)];
    return glyph;
  };

  const revealTarget = (target, delay = 0) => {
    if (!target || target.dataset.leadershipDone === '1') return;
    target.dataset.leadershipDone = '1';
    const chars = (targetChars.get(target) || []).filter(char => (char.dataset.finalChar || '').trim());

    if (reducedMotion || !chars.length) {
      (targetChars.get(target) || []).forEach(char => {
        char.classList.remove('is-pending', 'is-scrambling');
        char.classList.add('is-resolved');
      });
      return;
    }

    const startAt = performance.now() + delay;
    const stagger = target.classList.contains('leadership-statement') ? 17 : 15;
    const cycleDuration = 62;
    const cycles = 3;

    const frame = now => {
      let complete = true;
      chars.forEach((char, index) => {
        const elapsed = now - startAt - index * stagger;
        if (elapsed < 0) {
          complete = false;
          return;
        }

        const cycle = Math.floor(elapsed / cycleDuration);
        if (cycle < cycles) {
          complete = false;
          const previous = char.dataset.leadershipRandom || '';
          char.dataset.leadershipRandom = randomGlyph(previous);
          char.style.setProperty('--leadership-random-alpha', '1');
          char.classList.remove('is-pending', 'is-resolved');
          char.classList.add('is-scrambling');
        } else {
          char.classList.remove('is-pending', 'is-scrambling');
          char.classList.add('is-resolved');
          delete char.dataset.leadershipRandom;
        }
      });

      if (!complete) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  };

  const revealCopy = el => {
    if (!el || el.classList.contains('is-visible')) return;
    el.classList.add('is-visible');
  };

  if (reducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach(target => revealTarget(target));
    copyTargets.forEach(revealCopy);
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const target = entry.target;
      const delay = Number(target.dataset.leadershipDelay || 0);
      revealTarget(target, delay);
      observer.unobserve(target);
    });
  }, { threshold: 0.26, rootMargin: '0px 0px -10% 0px' });

  targets.forEach(target => observer.observe(target));

  const copyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const target = entry.target;
      const delay = Number(target.dataset.leadershipCopyDelay || 0);
      window.setTimeout(() => revealCopy(target), delay);
      copyObserver.unobserve(target);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

  copyTargets.forEach(target => copyObserver.observe(target));
})();
