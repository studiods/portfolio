(() => {
  'use strict';

  const hero = document.querySelector('#heroSequence');
  const quote = hero?.querySelector('.hero-quote');
  const definition = hero?.querySelector('.definition-copy');
  const quoteChars = quote ? [...quote.querySelectorAll('.fill-char')] : [];
  const definitionChars = definition ? [...definition.querySelectorAll('.fill-char')] : [];
  if (!hero || !quote || !definition || !quoteChars.length || !definitionChars.length) return;

  /*
    Hero scramble tuning is expressed as scroll-progress dwell, not time.
    The animation is scroll-scrubbed, so milliseconds would detach the glyph
    timing from the user's wheel / trackpad movement.

    Keep the number of random states at three, but let each character stay in
    those random states 20% longer inside its own local scroll slot:
      English quote: 0.78 -> 0.936
      Korean definition: 0.72 -> 0.864

    This final paint pass is deliberately limited to the two reveal windows.
    It never owns the later English -> Korean morph or definition erase.
  */
  const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const SCRAMBLE_CYCLES = 3;
  const SCRAMBLE_DWELL_MULTIPLIER = 1.20;
  const QUOTE_BASE_DWELL = 0.78;
  const DEFINITION_BASE_DWELL = 0.72;
  const QUOTE_SCRAMBLE_DWELL = Math.min(0.98, QUOTE_BASE_DWELL * SCRAMBLE_DWELL_MULTIPLIER);
  const DEFINITION_SCRAMBLE_DWELL = Math.min(0.98, DEFINITION_BASE_DWELL * SCRAMBLE_DWELL_MULTIPLIER);

  const HERO = Object.freeze({
    quoteFillStart: 0,
    quoteFillEnd: 0.095,
    quoteHoldEnd: 0.245,
    quoteMorphEnd: 0.395,
    definitionRevealStartInMorph: 0.08
  });

  const quoteFinalChars = quoteChars.map(char => char.dataset.finalChar ?? char.textContent);
  const definitionFinalChars = definitionChars.map(char => char.dataset.finalChar ?? char.textContent);
  let widths = new WeakMap();
  let quoteWindowWasActive = false;
  let definitionWindowWasActive = false;

  const style = document.createElement('style');
  style.id = 'hero-scramble-dwell-style';
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
  const easeInOut = value => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
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

  const paintSequence = (chars, finalChars, progress, scrambleDwell) => {
    const visible = chars
      .map((char, domIndex) => ({ char, finalChar: finalChars[domIndex] }))
      .filter(entry => entry.finalChar.trim().length > 0);
    const sweep = easeInOut(clamp(progress)) * visible.length;

    visible.forEach(({ char, finalChar }, visibleIndex) => {
      const local = clamp(sweep - visibleIndex);
      if (local <= 0 || local >= scrambleDwell) {
        restore(char, finalChar);
        return;
      }

      const cycle = Math.min(
        SCRAMBLE_CYCLES - 1,
        Math.floor((local / scrambleDwell) * SCRAMBLE_CYCLES)
      );
      const poolIndex = (visibleIndex * 17 + cycle * 13) % POOL.length;
      showGlyph(char, finalChar, POOL[poolIndex]);
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
      paintSequence(
        quoteChars,
        quoteFinalChars,
        quoteProgress,
        QUOTE_SCRAMBLE_DWELL
      );
    } else if (quoteWindowWasActive) {
      restoreAll(quoteChars, quoteFinalChars);
      quoteWindowWasActive = false;
    }

    const quoteMorph = phaseProgress(p, HERO.quoteHoldEnd, HERO.quoteMorphEnd);
    const definitionProgress = phaseProgress(
      quoteMorph,
      HERO.definitionRevealStartInMorph,
      1
    );
    const definitionWindowIsActive = definitionProgress > 0 && definitionProgress < 1;
    if (definitionWindowIsActive) {
      definitionWindowWasActive = true;
      paintSequence(
        definitionChars,
        definitionFinalChars,
        definitionProgress,
        DEFINITION_SCRAMBLE_DWELL
      );
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
