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

    The reveal is strictly serial now:
      glyph 01 -> 15 random states -> authored glyph
      glyph 02 -> 15 random states -> authored glyph
      glyph 03 -> ...

    No two authored positions scramble at the same time. The next glyph cannot
    start until the current glyph has consumed all 15 scroll-driven random states.

    This remains 100% scroll-scrubbed. There is no timer, autoplay, catch-up,
    or time-based easing. The test page already gives the Hero +20% physical
    scroll runway and wider reveal windows, so each glyph also requires more
    real scroll distance before the sequence advances.
  */
  const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const RANDOM_STATES_PER_GLYPH = 15;

  const HERO = Object.freeze({
    quoteFillStart: 0,
    quoteFillEnd: 0.125,
    definitionFillStart: 0.257,
    definitionFillEnd: 0.437
  });

  const quoteFinalChars = quoteChars.map(char => char.dataset.finalChar ?? char.textContent);
  const definitionFinalChars = definitionChars.map(char => char.dataset.finalChar ?? char.textContent);
  let widths = new WeakMap();

  const style = document.createElement('style');
  style.id = 'hero-scramble-scroll-test-style';
  style.textContent = `
    #heroSequence .fill-char[data-scroll-test-state="pending"]{
      color:rgba(17,17,17,.05)!important;
    }
    #heroSequence .fill-char[data-scroll-test-state="active"],
    #heroSequence .fill-char[data-scroll-test-state="final"]{
      color:rgba(17,17,17,1)!important;
      display:inline!important;
      position:static!important;
      vertical-align:baseline!important;
      line-height:inherit!important;
      transform:none!important;
      translate:none!important;
    }
    #heroSequence .fill-char[data-scroll-test-state]::before,
    #heroSequence .fill-char[data-scroll-test-state]::after{
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

  const setPending = (char, finalChar) => {
    char.textContent = finalChar;
    char.style.removeProperty('letter-spacing');
    char.removeAttribute('data-hero-direct-scramble');
    char.setAttribute('data-scroll-test-state', 'pending');
  };

  const setFinal = (char, finalChar) => {
    char.textContent = finalChar;
    char.style.removeProperty('letter-spacing');
    char.removeAttribute('data-hero-direct-scramble');
    char.setAttribute('data-scroll-test-state', 'final');
  };

  const showGlyph = (char, finalChar, glyph) => {
    const finalWidth = measureFinalWidth(char, finalChar);
    char.style.letterSpacing = '0px';
    char.textContent = glyph;
    const glyphWidth = Math.max(0, char.getBoundingClientRect().width);
    if (finalWidth > 0) {
      char.style.letterSpacing = `${(finalWidth - glyphWidth).toFixed(3)}px`;
    }
    char.removeAttribute('data-hero-direct-scramble');
    char.setAttribute('data-scroll-test-state', 'active');
  };

  const releaseAll = (chars, finalChars) => {
    chars.forEach((char, index) => {
      char.textContent = finalChars[index];
      char.style.removeProperty('letter-spacing');
      char.removeAttribute('data-scroll-test-state');
      char.removeAttribute('data-hero-direct-scramble');
    });
  };

  const paintSequential = (chars, finalChars, progress) => {
    const visible = chars
      .map((char, domIndex) => ({ char, finalChar: finalChars[domIndex] }))
      .filter(entry => entry.finalChar.trim().length > 0);

    if (!visible.length) return;

    const p = clamp(progress);
    if (p >= 1) {
      visible.forEach(({ char, finalChar }) => setFinal(char, finalChar));
      return;
    }

    if (p <= 0) {
      visible.forEach(({ char, finalChar }) => setPending(char, finalChar));
      return;
    }

    /*
      One authored position owns one full slot. That slot is divided into exactly
      15 scroll-controlled random states. Only after state 15 does the next glyph
      receive control.
    */
    const position = p * visible.length;
    const activeIndex = Math.min(visible.length - 1, Math.floor(position));
    const local = clamp(position - activeIndex);
    const randomState = Math.min(
      RANDOM_STATES_PER_GLYPH - 1,
      Math.floor(local * RANDOM_STATES_PER_GLYPH)
    );

    visible.forEach(({ char, finalChar }, index) => {
      if (index < activeIndex) {
        setFinal(char, finalChar);
        return;
      }
      if (index > activeIndex) {
        setPending(char, finalChar);
        return;
      }

      const poolIndex = (
        activeIndex * 17 +
        randomState * 13 +
        (finalChar.codePointAt(0) || 0)
      ) % POOL.length;
      showGlyph(char, finalChar, POOL[poolIndex]);
    });
  };

  const render = () => {
    const travel = Math.max(1, hero.offsetHeight - innerHeight);
    const heroTop = hero.getBoundingClientRect().top + scrollY;
    const p = clamp((scrollY - heroTop) / travel);

    const quoteProgress = phaseProgress(p, HERO.quoteFillStart, HERO.quoteFillEnd);
    if (p <= HERO.quoteFillEnd) {
      paintSequential(quoteChars, quoteFinalChars, quoteProgress);
    } else {
      releaseAll(quoteChars, quoteFinalChars);
    }

    const definitionProgress = phaseProgress(
      p,
      HERO.definitionFillStart,
      HERO.definitionFillEnd
    );
    if (p < HERO.definitionFillStart) {
      paintSequential(definitionChars, definitionFinalChars, 0);
    } else if (p <= HERO.definitionFillEnd) {
      paintSequential(definitionChars, definitionFinalChars, definitionProgress);
    } else {
      releaseAll(definitionChars, definitionFinalChars);
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
