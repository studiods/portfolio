(() => {
  'use strict';

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const DIGITS = '0123456789';
  const ALNUM_POOL = LETTERS + DIGITS;
  const counters = new WeakMap();
  const suppressed = new WeakMap();

  const markSuppressed = (el, attr) => {
    let attrs = suppressed.get(el);
    if (!attrs) {
      attrs = new Set();
      suppressed.set(el, attrs);
    }
    attrs.add(attr);
  };

  const consumeSuppressed = (el, attr) => {
    const attrs = suppressed.get(el);
    if (!attrs || !attrs.has(attr)) return false;
    attrs.delete(attr);
    return true;
  };

  const mixedGlyph = (el, attr, raw) => {
    const nextCount = (counters.get(el) || 0) + 1;
    counters.set(el, nextCount);
    const code = raw?.charCodeAt?.(0) || 0;
    const salt = attr === 'data-test-scramble' ? 17 : 29;

    /* Guarantee a regular numeric state instead of relying on pure chance. */
    if (nextCount % 4 === 0 || nextCount % 7 === 3) {
      return DIGITS[(code + nextCount * 7 + salt) % DIGITS.length];
    }
    return LETTERS[(code + nextCount * 11 + salt) % LETTERS.length];
  };

  const normalizeScrambleAttribute = (el, attr) => {
    if (!(el instanceof Element)) return;
    if (consumeSuppressed(el, attr)) return;
    const raw = el.getAttribute(attr);
    if (!raw || !/^[A-Z0-9]$/.test(raw)) return;
    const next = mixedGlyph(el, attr, raw);
    if (next === raw) return;
    markSuppressed(el, attr);
    el.setAttribute(attr, next);
  };

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type !== 'attributes') return;
      const attr = mutation.attributeName;
      if (attr !== 'data-scramble' && attr !== 'data-test-scramble') return;
      normalizeScrambleAttribute(mutation.target, attr);
    });
  });

  observer.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-scramble', 'data-test-scramble']
  });

  document.querySelectorAll('[data-scramble]').forEach((el) =>
    normalizeScrambleAttribute(el, 'data-scramble')
  );
  document.querySelectorAll('[data-test-scramble]').forEach((el) =>
    normalizeScrambleAttribute(el, 'data-test-scramble')
  );

  const animateAboutTitle = () => {
    const title = document.querySelector('.about-ascii-title');
    if (!title || title.dataset.scrambleEnhanced === '1') return;
    title.dataset.scrambleEnhanced = '1';

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finalText = title.textContent.trim() || 'ABOUT';
    title.classList.add('about-title-scramble-ready');

    if (reducedMotion) return;

    title.textContent = '';
    const chars = Array.from(finalText).map((character, index) => {
      const span = document.createElement('span');
      span.className = 'about-scramble-char';
      span.textContent = character;
      span.dataset.finalChar = character;
      span.style.color = 'transparent';
      span.dataset.aboutTitleIndex = String(index);
      title.appendChild(span);
      return span;
    });

    const startedAt = performance.now() + 100;
    const staggerMs = 58;
    const cycleMs = 92;
    const cycles = 4;

    const frame = (now) => {
      let complete = true;
      chars.forEach((char, index) => {
        const elapsed = now - startedAt - index * staggerMs;
        if (elapsed < 0) {
          complete = false;
          return;
        }

        const cycle = Math.floor(elapsed / cycleMs);
        if (cycle < cycles) {
          complete = false;
          const glyph = ALNUM_POOL[(index * 13 + cycle * 17) % ALNUM_POOL.length];
          char.dataset.scramble = glyph;
          char.classList.add('is-scrambling');
        } else {
          char.classList.remove('is-scrambling');
          char.style.color = '';
        }
      });

      if (!complete) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  };

  animateAboutTitle();
})();
