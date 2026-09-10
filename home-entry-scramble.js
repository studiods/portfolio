(() => {
  'use strict';

  const body = document.body;
  const hero = document.querySelector('#heroSequence');
  const quote = hero?.querySelector('.hero-quote');
  const source = hero?.querySelector('.quote-source-only');
  if (!body || !hero || !quote || !source) return;

  /*
    Home entry now has one automatic motion only: this one-time scramble reveal.
    Stop both legacy idle systems before their 3s delay can fire.
  */
  window.dispatchEvent(new Event('pointerdown')); // disables home-interactions.js idle timer
  window.dispatchEvent(new Event('scroll'));      // stops the old SCROLL idle cue timer
  document.querySelector('.index-scroll-guide')?.remove();
  document.getElementById('index-scroll-guide-styles')?.remove();

  const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const CYCLES = 3;
  /* 20% slower than the previous 48ms / 14ms timing while preserving the same rhythm. */
  const CYCLE_MS = 57.6;
  const STAGGER_MS = 16.8;
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

  const settledStyle = document.createElement('style');
  settledStyle.id = 'home-entry-settled-style';
  settledStyle.textContent = `
    body.home-dark.home-entry-settled #heroSequence .hero-state-quote .hero-quote .fill-char,
    body.home-dark.home-entry-settled #heroSequence .hero-state-quote .quote-source-only{
      color:#000!important;
    }
  `;
  document.head.appendChild(settledStyle);

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
  };

  const cancel = () => {
    if (cancelled) return;
    cancelled = true;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
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
        /* The dark Home layer inverts Hero text, so #000 renders as pure #fff. */
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

  /* Existing scroll-driven Hero storytelling begins only when the user actually scrolls. */
  window.addEventListener('scroll', () => {
    if (window.scrollY <= 1) return;
    if (!completed) cancel();
    body.classList.remove('home-entry-settled');
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
