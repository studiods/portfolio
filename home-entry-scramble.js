(() => {
  'use strict';

  const body = document.body;
  const hero = document.querySelector('#heroSequence');
  const quote = hero?.querySelector('.hero-quote');
  const source = hero?.querySelector('.quote-source-only');
  if (!body || !hero || !quote || !source) return;

  /*
    Disable the legacy Home idle loop that is armed inside home-interactions.js.
    That listener intentionally treats this synthetic event as a user action,
    which cancels its timer before the 3s idle delay can fire.
  */
  window.dispatchEvent(new Event('pointerdown'));

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
  const chars = [...quoteChars, ...sourceChars];
  if (!chars.length) {
    body.classList.remove('home-entry-pending');
    return;
  }

  const states = chars.map((char) => ({
    char,
    finalChar: char.dataset.finalChar ?? char.textContent,
    width: 0,
    lastGlyph: null
  }));

  let raf = 0;
  let cancelled = false;
  let completed = false;
  let startedAt = 0;

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
    body.classList.remove('home-entry-pending');
    body.classList.add('home-entry-settled');
  };

  const cancel = () => {
    if (cancelled || completed) {
      body.classList.remove('home-entry-settled');
      return;
    }
    cancelled = true;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    clearTemporaryStyles();
    body.classList.remove('home-entry-pending', 'home-entry-settled');
  };

  const visibleStates = states.filter(({ finalChar }) => finalChar.trim().length > 0);

  const render = (now) => {
    if (cancelled) return;
    const elapsed = now - startedAt;
    let allDone = true;

    visibleStates.forEach((state, index) => {
      const local = elapsed - index * STAGGER_MS;
      if (local < 0) {
        allDone = false;
        return;
      }

      const scrambleDuration = CYCLES * CYCLE_MS;
      if (local < scrambleDuration) {
        allDone = false;
        const cycle = Math.min(CYCLES - 1, Math.floor(local / CYCLE_MS));
        const glyph = POOL[(index * 17 + cycle * 13) % POOL.length];
        if (state.lastGlyph !== glyph) {
          state.lastGlyph = glyph;
          state.char.textContent = glyph;
        }
        /* Hero state is inverted by the dark-theme layer, so black paints as pure white. */
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
    if (window.scrollY <= 1 && !completed) {
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
    body.classList.remove('home-entry-pending');

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
