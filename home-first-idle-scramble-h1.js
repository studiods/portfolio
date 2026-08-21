(() => {
  'use strict';

  const hero = document.querySelector('#heroSequence');
  const quote = hero?.querySelector('.hero-quote');
  const chars = quote ? [...quote.querySelectorAll('.fill-char')] : [];
  if (!hero || !quote || !chars.length) return;

  /*
    H1 TEST — first Hero animation only.
    Disable home-interactions.js's built-in brightness pulse, then run one
    isolated scramble owner while the page is still at the top. The moment the
    user interacts, this owner restores authored glyphs and permanently exits;
    the normal scroll timeline remains owned by home-interactions.js.
  */
  window.dispatchEvent(new Event('pointerdown'));

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const RANDOM_STATES = 3;
  const GAP_MS = 3000;
  const BASE_COLOR = 'rgba(17,17,17,.05)';
  const ACTIVE_COLOR = 'rgba(17,17,17,1)';

  const entries = chars
    .map((char, index) => ({
      char,
      index,
      finalChar: char.dataset.finalChar ?? char.textContent
    }))
    .filter(entry => entry.finalChar.trim().length > 0);

  let disabled = false;
  let gapTimer = 0;
  let raf = 0;
  let entryIndex = 0;
  let stateIndex = 0;
  let widths = new WeakMap();

  const atTop = () => scrollY <= 8;

  const measureWidth = entry => {
    if (widths.has(entry.char)) return widths.get(entry.char);
    const char = entry.char;
    const oldText = char.textContent;
    const oldSpacing = char.style.letterSpacing;
    const oldColor = char.style.color;
    char.textContent = entry.finalChar;
    char.style.letterSpacing = '0px';
    char.style.color = BASE_COLOR;
    const width = Math.max(0, char.getBoundingClientRect().width);
    char.textContent = oldText;
    char.style.letterSpacing = oldSpacing;
    char.style.color = oldColor;
    widths.set(char, width);
    return width;
  };

  const restoreEntry = entry => {
    const char = entry.char;
    char.textContent = entry.finalChar;
    char.style.removeProperty('letter-spacing');
    char.style.removeProperty('width');
    char.style.removeProperty('min-width');
    char.style.removeProperty('max-width');
    char.style.removeProperty('display');
    char.style.color = BASE_COLOR;
    char.removeAttribute('data-first-idle-scramble');
  };

  const restoreAll = () => entries.forEach(restoreEntry);

  const showRandom = (entry, state) => {
    const char = entry.char;
    const finalWidth = measureWidth(entry);
    const glyph = POOL[(entry.index * 17 + state * 13 + 5) % POOL.length];

    char.style.display = 'inline-block';
    char.style.width = `${finalWidth.toFixed(3)}px`;
    char.style.minWidth = `${finalWidth.toFixed(3)}px`;
    char.style.maxWidth = `${finalWidth.toFixed(3)}px`;
    char.style.letterSpacing = '0px';
    char.style.color = ACTIVE_COLOR;
    char.textContent = glyph;
    char.setAttribute('data-first-idle-scramble', String(state + 1));
  };

  const cancel = () => {
    if (gapTimer) clearTimeout(gapTimer);
    if (raf) cancelAnimationFrame(raf);
    gapTimer = 0;
    raf = 0;
  };

  const frame = () => {
    raf = 0;
    if (disabled || !atTop() || document.hidden) return;

    if (entryIndex >= entries.length) {
      restoreAll();
      entryIndex = 0;
      stateIndex = 0;
      gapTimer = setTimeout(() => {
        gapTimer = 0;
        if (!disabled && atTop() && !document.hidden) raf = requestAnimationFrame(frame);
      }, GAP_MS);
      return;
    }

    const entry = entries[entryIndex];

    if (stateIndex < RANDOM_STATES) {
      showRandom(entry, stateIndex);
      stateIndex += 1;
      raf = requestAnimationFrame(frame);
      return;
    }

    restoreEntry(entry);
    entryIndex += 1;
    stateIndex = 0;

    if (entryIndex < entries.length) {
      showRandom(entries[entryIndex], 0);
      stateIndex = 1;
    }
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    restoreAll();
    gapTimer = setTimeout(() => {
      gapTimer = 0;
      if (!disabled && atTop() && !document.hidden) raf = requestAnimationFrame(frame);
    }, GAP_MS);
  };

  const stopFromUser = event => {
    if (event && event.isTrusted === false) return;
    if (disabled) return;
    disabled = true;
    cancel();
    restoreAll();
  };

  addEventListener('wheel', stopFromUser, { passive: true });
  addEventListener('touchstart', stopFromUser, { passive: true });
  addEventListener('pointerdown', stopFromUser, { passive: true });
  addEventListener('keydown', stopFromUser);
  addEventListener('scroll', () => {
    if (scrollY > 8) stopFromUser();
  }, { passive: true });
  addEventListener('resize', () => { widths = new WeakMap(); }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (disabled) return;
    cancel();
    restoreAll();
    if (!document.hidden && atTop()) start();
  });

  start();
})();