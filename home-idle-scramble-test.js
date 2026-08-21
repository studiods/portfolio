(() => {
  'use strict';

  const hero = document.querySelector('#heroSequence');
  const quote = hero?.querySelector('.hero-quote');
  const chars = quote ? [...quote.querySelectorAll('.fill-char')] : [];
  if (!hero || !quote || !chars.length) return;

  /* Disable the legacy idle loop in home-interactions.js. */
  window.dispatchEvent(new Event('pointerdown'));

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const RANDOM_STATES = 6;
  const GAP_MS = 3000;
  const BASE_ALPHA = 0.05;

  const entries = chars
    .map((char, index) => ({
      char,
      index,
      finalChar: char.dataset.finalChar ?? char.textContent
    }))
    .filter(entry => entry.finalChar.trim().length > 0);

  let disabled = false;
  let gapTimer = 0;
  let sequenceRaf = 0;
  let token = 0;
  let widths = new WeakMap();
  let entryIndex = 0;
  let activeState = 0;

  const style = document.createElement('style');
  style.id = 'home-idle-scramble-test-style';
  style.textContent = `
    #heroSequence .fill-char[data-idle-scramble-state="active"]{
      color:rgba(17,17,17,1)!important;
    }
    #heroSequence .fill-char[data-idle-scramble-state="rest"]{
      color:rgba(17,17,17,${BASE_ALPHA})!important;
    }
    #heroSequence .fill-char[data-idle-scramble-state]::before,
    #heroSequence .fill-char[data-idle-scramble-state]::after{
      content:none!important;
      display:none!important;
    }
  `;
  document.head.appendChild(style);

  const atTop = () => scrollY <= 8;
  const canRun = runToken =>
    !disabled && runToken === token && atTop() && !document.hidden;

  const clearLegacy = char => {
    char.classList.remove('is-scrambling', 'live-scramble-glyph');
    char.removeAttribute('data-scramble');
    char.removeAttribute('data-hero-direct-scramble');
    char.style.removeProperty('--live-scramble-width');
    char.style.removeProperty('--live-scramble-color');
    char.style.removeProperty('--scramble-alpha');
    char.style.removeProperty('--scramble-rgb');
  };

  const measure = entry => {
    if (widths.has(entry.char)) return widths.get(entry.char);
    const oldText = entry.char.textContent;
    const oldSpacing = entry.char.style.letterSpacing;
    clearLegacy(entry.char);
    entry.char.textContent = entry.finalChar;
    entry.char.style.letterSpacing = '0px';
    const width = Math.max(0, entry.char.getBoundingClientRect().width);
    entry.char.textContent = oldText;
    entry.char.style.letterSpacing = oldSpacing;
    widths.set(entry.char, width);
    return width;
  };

  const rest = entry => {
    clearLegacy(entry.char);
    entry.char.textContent = entry.finalChar;
    entry.char.style.removeProperty('letter-spacing');
    entry.char.setAttribute('data-idle-scramble-state', 'rest');
  };

  const show = (entry, state) => {
    const finalWidth = measure(entry);
    clearLegacy(entry.char);
    entry.char.style.letterSpacing = '0px';
    entry.char.textContent = POOL[(entry.index * 17 + state * 13 + 5) % POOL.length];
    const glyphWidth = Math.max(0, entry.char.getBoundingClientRect().width);
    entry.char.style.letterSpacing = `${(finalWidth - glyphWidth).toFixed(3)}px`;
    entry.char.setAttribute('data-idle-scramble-state', 'active');
  };

  const restoreAll = () => entries.forEach(rest);

  const cancelScheduled = () => {
    if (gapTimer) clearTimeout(gapTimer);
    if (sequenceRaf) cancelAnimationFrame(sequenceRaf);
    gapTimer = 0;
    sequenceRaf = 0;
  };

  const scheduleGap = runToken => {
    if (!canRun(runToken)) return;
    if (gapTimer) clearTimeout(gapTimer);
    gapTimer = setTimeout(() => {
      gapTimer = 0;
      if (!canRun(runToken)) return;
      entryIndex = 0;
      activeState = 0;
      sequenceRaf = requestAnimationFrame(() => sequenceFrame(runToken));
    }, GAP_MS);
  };

  const sequenceFrame = runToken => {
    sequenceRaf = 0;
    if (!canRun(runToken)) return;

    if (entryIndex >= entries.length) {
      restoreAll();
      scheduleGap(runToken);
      return;
    }

    const entry = entries[entryIndex];

    /* One random state per real display frame. */
    if (activeState < RANDOM_STATES) {
      show(entry, activeState);
      activeState += 1;
      sequenceRaf = requestAnimationFrame(() => sequenceFrame(runToken));
      return;
    }

    /* The sixth state was visible during the previous display frame. */
    rest(entry);
    entryIndex += 1;
    activeState = 0;

    if (entryIndex < entries.length) {
      show(entries[entryIndex], 0);
      activeState = 1;
      sequenceRaf = requestAnimationFrame(() => sequenceFrame(runToken));
    } else {
      restoreAll();
      scheduleGap(runToken);
    }
  };

  const start = () => {
    if (disabled || !atTop() || document.hidden) return;
    cancelScheduled();
    restoreAll();
    entryIndex = 0;
    activeState = 0;
    const runToken = ++token;
    scheduleGap(runToken);
  };

  const stopFromUser = event => {
    if (event && event.isTrusted === false) return;
    disabled = true;
    token += 1;
    cancelScheduled();
    entries.forEach(entry => {
      clearLegacy(entry.char);
      entry.char.textContent = entry.finalChar;
      entry.char.style.removeProperty('letter-spacing');
      entry.char.removeAttribute('data-idle-scramble-state');
    });
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
    token += 1;
    cancelScheduled();
    if (!document.hidden) start();
  });

  start();
})();