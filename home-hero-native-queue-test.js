(() => {
  'use strict';

  const hero = document.querySelector('#heroSequence');
  const quote = hero?.querySelector('.hero-quote');
  const chars = quote ? [...quote.querySelectorAll('.fill-char')] : [];
  if (!hero || !quote || !chars.length) return;

  /*
    TEST ONLY.
    Native scrolling and production Hero progress remain untouched.
    This module owns only the first English quote's visible scramble pass.

    A scroll jump only changes the target character count. The visible queue
    still resolves authored positions one-by-one, and each active position is
    assigned six random A-Z / 0-9 states before the final character is restored.

    The queue does NOT slow, clamp, prevent, or synthesize scrolling.
  */

  const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const RANDOM_STATES = 6;
  const STATE_MS = 10;
  const QUOTE_FILL_START = 0;
  const QUOTE_FILL_END = 0.095;

  const finalChars = chars.map(char => char.dataset.finalChar ?? char.textContent);
  const visible = chars
    .map((char, domIndex) => ({ char, finalChar: finalChars[domIndex], domIndex }))
    .filter(entry => entry.finalChar.trim().length > 0);

  const style = document.createElement('style');
  style.id = 'hero-native-queue-test-style';
  style.textContent = `
    #heroSequence .fill-char[data-native-queue-state="pending"]{
      color:rgba(17,17,17,.05)!important;
    }
    #heroSequence .fill-char[data-native-queue-state="active"],
    #heroSequence .fill-char[data-native-queue-state="final"]{
      color:rgba(17,17,17,1)!important;
    }
    #heroSequence .fill-char[data-native-queue-state]::before,
    #heroSequence .fill-char[data-native-queue-state]::after{
      content:none!important;
      display:none!important;
    }
  `;
  document.head.appendChild(style);

  let resolved = 0;
  let target = 0;
  let activeState = 0;
  let timer = 0;
  let paintRaf = 0;
  let widths = new WeakMap();
  let userStarted = false;

  const clamp = value => Math.max(0, Math.min(1, value));
  const easeInOut = value => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };

  const heroProgress = () => {
    const top = hero.getBoundingClientRect().top + scrollY;
    const travel = Math.max(1, hero.offsetHeight - innerHeight);
    return clamp((scrollY - top) / travel);
  };

  const quoteProgress = () => {
    const p = heroProgress();
    return clamp((p - QUOTE_FILL_START) / (QUOTE_FILL_END - QUOTE_FILL_START));
  };

  const targetFromScroll = () => {
    const sweep = easeInOut(quoteProgress()) * visible.length;
    return Math.min(visible.length, Math.ceil(sweep));
  };

  const clearLegacy = char => {
    char.classList.remove('is-scrambling', 'live-scramble-glyph');
    char.removeAttribute('data-scramble');
    char.removeAttribute('data-hero-direct-scramble');
    char.style.removeProperty('--live-scramble-width');
    char.style.removeProperty('--live-scramble-color');
    char.style.removeProperty('--scramble-alpha');
    char.style.removeProperty('--scramble-rgb');
  };

  const measureFinalWidth = (char, finalChar) => {
    if (widths.has(char)) return widths.get(char);
    const oldText = char.textContent;
    const oldSpacing = char.style.letterSpacing;
    clearLegacy(char);
    char.textContent = finalChar;
    char.style.letterSpacing = '0px';
    const width = Math.max(0, char.getBoundingClientRect().width);
    char.textContent = oldText;
    char.style.letterSpacing = oldSpacing;
    widths.set(char, width);
    return width;
  };

  const setPending = entry => {
    clearLegacy(entry.char);
    entry.char.textContent = entry.finalChar;
    entry.char.style.removeProperty('letter-spacing');
    entry.char.setAttribute('data-native-queue-state', 'pending');
  };

  const setFinal = entry => {
    clearLegacy(entry.char);
    entry.char.textContent = entry.finalChar;
    entry.char.style.removeProperty('letter-spacing');
    entry.char.setAttribute('data-native-queue-state', 'final');
  };

  const randomGlyph = (index, state) =>
    POOL[(index * 17 + state * 13 + 7) % POOL.length];

  const showRandom = (entry, index, state) => {
    const finalWidth = measureFinalWidth(entry.char, entry.finalChar);
    clearLegacy(entry.char);
    entry.char.style.letterSpacing = '0px';
    entry.char.textContent = randomGlyph(index, state);
    const glyphWidth = Math.max(0, entry.char.getBoundingClientRect().width);
    entry.char.style.letterSpacing = `${(finalWidth - glyphWidth).toFixed(3)}px`;
    entry.char.setAttribute('data-native-queue-state', 'active');
  };

  const paintAll = () => {
    visible.forEach((entry, index) => {
      if (index < resolved) {
        setFinal(entry);
        return;
      }

      const isCurrentActive =
        index === resolved &&
        resolved < target &&
        activeState > 0;

      if (!isCurrentActive) setPending(entry);
    });
  };

  const requestAfterProductionPaint = () => {
    if (paintRaf) return;
    paintRaf = requestAnimationFrame(() => {
      paintRaf = 0;
      paintAll();
    });
  };

  const schedule = () => {
    if (timer || resolved >= target || resolved >= visible.length) return;

    const step = () => {
      timer = 0;
      if (resolved >= target || resolved >= visible.length) {
        paintAll();
        return;
      }

      const entry = visible[resolved];
      showRandom(entry, resolved, activeState);
      activeState += 1;

      if (activeState >= RANDOM_STATES) {
        setFinal(entry);
        resolved += 1;
        activeState = 0;
        paintAll();
      }

      if (resolved < target && resolved < visible.length) {
        timer = window.setTimeout(step, STATE_MS);
      }
    };

    timer = window.setTimeout(step, 0);
  };

  const syncTarget = () => {
    if (!userStarted) return;
    const nextTarget = targetFromScroll();

    if (nextTarget < resolved) {
      if (timer) clearTimeout(timer);
      timer = 0;
      resolved = nextTarget;
      target = nextTarget;
      activeState = 0;
      requestAfterProductionPaint();
      return;
    }

    target = nextTarget;
    requestAfterProductionPaint();
    schedule();
  };

  const startFromUser = () => {
    if (userStarted) return;
    userStarted = true;
    resolved = 0;
    target = 0;
    activeState = 0;
    visible.forEach(setPending);
    syncTarget();
  };

  addEventListener('wheel', startFromUser, { passive: true, once: true });
  addEventListener('touchstart', startFromUser, { passive: true, once: true });
  addEventListener('keydown', startFromUser, { once: true });
  addEventListener('scroll', syncTarget, { passive: true });
  addEventListener('resize', () => {
    widths = new WeakMap();
    syncTarget();
  }, { passive: true });
})();