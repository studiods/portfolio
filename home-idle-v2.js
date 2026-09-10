(() => {
  'use strict';

  const body = document.body;
  const hero = document.querySelector('#heroSequence');
  const quote = hero?.querySelector('.hero-quote');
  const source = hero?.querySelector('.quote-source-only');
  if (!body || !hero || !quote || !source) return;

  /*
    This file intentionally no longer owns any idle animation.

    1) home-interactions.js still contains an old 3s idle timer. Its existing
       pointerdown listener disables that timer permanently, so fire one synthetic
       event immediately after the deferred scripts have initialized.
    2) index.html's old SCROLL cue also owns a 3s idle timer. Its existing scroll
       listener stops that timer, so fire one synthetic scroll event and remove the
       detached cue/style before any delayed animation can begin.
  */
  window.dispatchEvent(new Event('pointerdown'));
  window.dispatchEvent(new Event('scroll'));
  document.querySelector('.index-scroll-guide')?.remove();
  document.getElementById('index-scroll-guide-styles')?.remove();

  const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const CYCLES = 3;
  const CYCLE_MS = 48;
  const STAGGER_MS = 14;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const splitPlainText = (element) => {
    if (!element || element.dataset.homeEntrySplit === '1') return;
    element.dataset.homeEntrySplit = '1';
    const text = element.textContent;
    element.textContent = '';
    const fragment = document.createDocumentFragment();
    [...text].forEach((character) => {
      const span = document.createElement('span');
      span.className = 'home-entry-source-char';
      span.textContent = character;
      span.dataset.finalChar = character;
      fragment.appendChild(span);
    });
    element.appendChild(fragment);
  };

  splitPlainText(source);

  const quoteChars = [...quote.querySelectorAll('.fill-char')];
  const sourceChars = [...source.querySelectorAll('.home-entry-source-char')];
  const states = [...quoteChars, ...sourceChars].map((char) => ({
    char,
    finalChar: char.dataset.finalChar ?? char.textContent,
    width: 0,
    lastGlyph: null
  }));
  if (!states.length) return;

  const visibleStates = states.filter(({ finalChar }) => finalChar.trim().length > 0);
  let raf = 0;
  let startedAt = 0;
  let cancelled = false;
  let completed = false;

  const setColor = (char, value) => {
    char.style.setProperty('color', value, 'important');
  };

  const prepare = () => {
    states.forEach((state) => {
      const { char, finalChar } = state;
      char.textContent = finalChar;
      if (!finalChar.trim()) return;
      state.width = Math.max(0, char.getBoundingClientRect().width);
      char.style.setProperty('display', 'inline-block', 'important');
      char.style.setProperty('width', `${state.width.toFixed(3)}px`, 'important');
      char.style.setProperty('min-width', `${state.width.toFixed(3)}px`, 'important');
      char.style.setProperty('max-width', `${state.width.toFixed(3)}px`, 'important');
      setColor(char, 'transparent');
    });
  };

  const clearTemporaryStyles = () => {
    states.forEach(({ char, finalChar }) => {
      char.textContent = finalChar;
      char.style.removeProperty('display');
      char.style.removeProperty('width');
      char.style.removeProperty('min-width');
      char.style.removeProperty('max-width');
      char.style.removeProperty('color');
    });
  };

  const settle = () => {
    if (completed) return;
    completed = true;
    clearTemporaryStyles();
    body.classList.add('home-entry-settled');

    /*
      The dark Home theme inverts the Hero state. Painting #000 here therefore
      resolves to visually pure #fff without changing the existing theme stack.
      This class is released as soon as the user starts interacting with the
      scroll narrative, so all existing scroll-driven transitions remain intact.
    */
    const style = document.createElement('style');
    style.id = 'home-entry-settled-style';
    style.textContent = `
      body.home-dark.home-entry-settled #heroSequence .hero-state-quote .hero-quote .fill-char,
      body.home-dark.home-entry-settled #heroSequence .hero-state-quote .quote-source-only{
        color:#000!important;
      }
    `;
    document.head.appendChild(style);
  };

  const cancel = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    cancelled = true;
    clearTemporaryStyles();
    body.classList.remove('home-entry-settled');
  };

  const render = (now) => {
    if (cancelled) return;
    const elapsed = now - startedAt;
    const scrambleDuration = CYCLES * CYCLE_MS;
    let allDone = true;

    visibleStates.forEach((state, index) => {
      const local = elapsed - index * STAGGER_MS;
      if (local < 0) {
        allDone = false;
        return;
      }

      if (local < scrambleDuration) {
        allDone = false;
        const cycle = Math.min(CYCLES - 1, Math.floor(local / CYCLE_MS));
        const glyph = POOL[(index * 17 + cycle * 13) % POOL.length];
        if (state.lastGlyph !== glyph) {
          state.lastGlyph = glyph;
          state.char.textContent = glyph;
        }
        setColor(state.char, '#000');
        return;
      }

      state.char.textContent = state.finalChar;
      setColor(state.char, '#000');
    });

    if (allDone) {
      settle();
      return;
    }
    raf = requestAnimationFrame(render);
  };

  const releaseToScrollTimeline = () => {
    if (!completed) {
      cancel();
      return;
    }
    body.classList.remove('home-entry-settled');
  };

  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach((eventName) => {
    window.addEventListener(eventName, releaseToScrollTimeline, { passive: true });
  });
  window.addEventListener('scroll', () => {
    if (window.scrollY > 1) releaseToScrollTimeline();
  }, { passive: true });

  const start = () => {
    if (cancelled) return;
    prepare();
    if (reduced) {
      settle();
      return;
    }
    startedAt = performance.now();
    raf = requestAnimationFrame(render);
  };

  const ready = document.fonts?.ready || Promise.resolve();
  ready.then(() => requestAnimationFrame(start)).catch(() => requestAnimationFrame(start));
})();
