(() => {
  'use strict';

  const hero = document.querySelector('#heroSequence');
  const quote = hero?.querySelector('.hero-quote');
  const definition = hero?.querySelector('.definition-copy');
  const quoteChars = quote ? [...quote.querySelectorAll('.fill-char')] : [];
  const definitionChars = definition ? [...definition.querySelectorAll('.fill-char')] : [];
  if (!hero || !quote || !definition || !quoteChars.length || !definitionChars.length) return;

  /*
    TEST ONLY
    This version stays 100% scroll-scrubbed. There is no time-based easing,
    catch-up, or delayed playback.

    Production: 3 random states in shorter reveal windows.
    Test:       4 random states + larger physical Hero scroll distance +
                wider reveal windows.

    The result is that a user must physically scroll farther for each glyph to
    advance to its next random state, so a fast wheel / trackpad gesture is less
    likely to skip the visible scramble process.
  */
  const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const SCRAMBLE_CYCLES = 4;

  const HERO = Object.freeze({
    quoteFillStart: 0,
    quoteFillEnd: 0.125,
    definitionFillStart: 0.257,
    definitionFillEnd: 0.437
  });

  const STAGGER_UNITS = 26;
  const CYCLE_UNITS = 96;

  const quoteFinalChars = quoteChars.map(char => char.dataset.finalChar ?? char.textContent);
  const definitionFinalChars = definitionChars.map(char => char.dataset.finalChar ?? char.textContent);
  let widths = new WeakMap();
  let quoteWindowWasActive = false;
  let definitionWindowWasActive = false;

  const style = document.createElement('style');
  style.id = 'hero-scramble-scroll-test-style';
  style.textContent = `
    #heroSequence .fill-char[data-hero-direct-scramble="1"]{
      color:rgba(17,17,17,1)!important;
      display:inline!important;
      position:static!important;
      vertical-align:baseline!important;
      line-height:inherit!important;
      transform:none!important;
      translate:none!important;
    }
    #heroSequence .fill-char[data-hero-direct-scramble="1"]::before,
    #heroSequence .fill-char[data-hero-direct-scramble="1"]::after{
      content:none!important;
      display:none!important;
    }
  `;
  document.head.appendChild(style);

  const clamp = value => Math.max(0, Math.min(1, value));
  const phaseProgress = (value, start, end) => {
    if (end <= start) return value >= end ? 1 : 0;
    return clamp((value - start) / (end - start));
  };

  const measureFinalWidth = (char, finalChar) => {
    if (widths.has(char)) return widths.get(char);
    const previousText = char.textContent;
    const previousSpacing = char.style.letterSpacing;
    char.textContent = finalChar;
    char.style.letterSpacing = '0px';
    const width = Math.max(0, char.getBoundingClientRect().width);
    char.textContent = previousText;
    char.style.letterSpacing = previousSpacing;
    widths.set(char, width);
    return width;
  };

  const showGlyph = (char, finalChar, glyph) => {
    const finalWidth = measureFinalWidth(char, finalChar);
    char.style.letterSpacing = '0px';
    char.textContent = glyph;
    const glyphWidth = Math.max(0, char.getBoundingClientRect().width);
    char.style.letterSpacing = `${(finalWidth - glyphWidth).toFixed(3)}px`;
    char.setAttribute('data-hero-direct-scramble', '1');
  };

  const restore = (char, finalChar) => {
    if (!char.hasAttribute('data-hero-direct-scramble')) return;
    char.textContent = finalChar;
    char.removeAttribute('data-hero-direct-scramble');
    char.style.removeProperty('letter-spacing');
  };

  const restoreAll = (chars, finalChars) => {
    chars.forEach((char, index) => restore(char, finalChars[index]));
  };

  const paintSequence = (chars, finalChars, progress) => {
    const visible = chars
      .map((char, domIndex) => ({ char, finalChar: finalChars[domIndex] }))
      .filter(entry => entry.finalChar.trim().length > 0);

    const totalUnits = Math.max(
      1,
      Math.max(0, visible.length - 1) * STAGGER_UNITS +
      SCRAMBLE_CYCLES * CYCLE_UNITS
    );
    const virtualNow = clamp(progress) * totalUnits;

    visible.forEach(({ char, finalChar }, visibleIndex) => {
      const elapsed = virtualNow - visibleIndex * STAGGER_UNITS;

      if (elapsed <= 0) {
        restore(char, finalChar);
        return;
      }

      const cycle = Math.floor(elapsed / CYCLE_UNITS);
      if (cycle < SCRAMBLE_CYCLES) {
        const poolIndex = (visibleIndex * 17 + cycle * 13) % POOL.length;
        showGlyph(char, finalChar, POOL[poolIndex]);
        return;
      }

      restore(char, finalChar);
    });
  };

  const render = () => {
    const travel = Math.max(1, hero.offsetHeight - innerHeight);
    const heroTop = hero.getBoundingClientRect().top + scrollY;
    const p = clamp((scrollY - heroTop) / travel);

    const quoteProgress = phaseProgress(p, HERO.quoteFillStart, HERO.quoteFillEnd);
    const quoteWindowIsActive = quoteProgress > 0 && quoteProgress < 1;
    if (quoteWindowIsActive) {
      quoteWindowWasActive = true;
      paintSequence(quoteChars, quoteFinalChars, quoteProgress);
    } else if (quoteWindowWasActive) {
      restoreAll(quoteChars, quoteFinalChars);
      quoteWindowWasActive = false;
    }

    const definitionProgress = phaseProgress(
      p,
      HERO.definitionFillStart,
      HERO.definitionFillEnd
    );
    const definitionWindowIsActive = definitionProgress > 0 && definitionProgress < 1;
    if (definitionWindowIsActive) {
      definitionWindowWasActive = true;
      paintSequence(definitionChars, definitionFinalChars, definitionProgress);
    } else if (definitionWindowWasActive) {
      restoreAll(definitionChars, definitionFinalChars);
      definitionWindowWasActive = false;
    }
  };

  let raf = 0;
  const requestRender = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      render();
    });
  };

  addEventListener('scroll', requestRender, { passive: true });
  addEventListener('resize', () => {
    widths = new WeakMap();
    requestRender();
  }, { passive: true });

  requestRender();
})();
