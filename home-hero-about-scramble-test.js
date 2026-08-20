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
    Keep the production Home scroll geometry / Hero phase timing exactly as-is.
    Replace only the quote + Korean definition reveal texture with the same
    relative scramble rhythm used by the About entry titles:
      26 stagger units / 96 cycle units / 3 random states.

    Because this Hero is scroll-scrubbed, those time values are used only as a
    ratio and are normalized into the existing production reveal windows.
    Pending glyphs are fully hidden, scramble glyphs are 100% black, and the
    authored glyph returns at 100% black when its three random states finish.
  */
  const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const STAGGER_UNITS = 26;
  const CYCLE_UNITS = 96;
  const SCRAMBLE_CYCLES = 3;

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

  const style = document.createElement('style');
  style.id = 'hero-about-scramble-test-style';
  style.textContent = `
    #heroSequence .fill-char[data-hero-about-test-state="pending"]{
      color:rgba(17,17,17,0)!important;
    }
    #heroSequence .fill-char[data-hero-about-test-state="scramble"]{
      color:rgba(17,17,17,1)!important;
      display:inline!important;
      position:static!important;
      vertical-align:baseline!important;
      line-height:inherit!important;
      transform:none!important;
      translate:none!important;
    }
    #heroSequence .fill-char[data-hero-about-test-state="pending"]::before,
    #heroSequence .fill-char[data-hero-about-test-state="pending"]::after,
    #heroSequence .fill-char[data-hero-about-test-state="scramble"]::before,
    #heroSequence .fill-char[data-hero-about-test-state="scramble"]::after{
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
    char.setAttribute('data-hero-about-test-state', 'pending');
  };

  const showScramble = (char, finalChar, glyph) => {
    const finalWidth = measureFinalWidth(char, finalChar);
    char.style.letterSpacing = '0px';
    char.textContent = glyph;
    const glyphWidth = Math.max(0, char.getBoundingClientRect().width);
    char.style.letterSpacing = `${(finalWidth - glyphWidth).toFixed(3)}px`;
    char.setAttribute('data-hero-about-test-state', 'scramble');
  };

  const restore = (char, finalChar) => {
    char.textContent = finalChar;
    char.removeAttribute('data-hero-about-test-state');
    char.style.removeProperty('letter-spacing');
  };

  const restoreAll = (chars, finalChars) => {
    chars.forEach((char, index) => restore(char, finalChars[index]));
  };

  const paintAboutRhythm = (chars, finalChars, progress) => {
    const visible = chars
      .map((char, domIndex) => ({ char, finalChar: finalChars[domIndex], domIndex }))
      .filter(entry => entry.finalChar.trim().length > 0);

    const totalUnits = Math.max(
      1,
      (Math.max(0, visible.length - 1) * STAGGER_UNITS) +
      (CYCLE_UNITS * SCRAMBLE_CYCLES)
    );
    const now = clamp(progress) * totalUnits;

    visible.forEach(({ char, finalChar }, visibleIndex) => {
      const elapsed = now - visibleIndex * STAGGER_UNITS;

      if (elapsed < 0) {
        setPending(char, finalChar);
        return;
      }

      const cycle = Math.floor(elapsed / CYCLE_UNITS);
      if (cycle < SCRAMBLE_CYCLES) {
        const poolIndex = (visibleIndex * 17 + cycle * 13) % POOL.length;
        showScramble(char, finalChar, POOL[poolIndex]);
        return;
      }

      restore(char, finalChar);
    });
  };

  const render = () => {
    const travel = Math.max(1, hero.offsetHeight - innerHeight);
    const heroTop = hero.getBoundingClientRect().top + scrollY;
    const p = clamp((scrollY - heroTop) / travel);

    /* Exact production quote reveal window. */
    if (p <= HERO.quoteFillEnd) {
      const quoteProgress = phaseProgress(p, HERO.quoteFillStart, HERO.quoteFillEnd);
      paintAboutRhythm(quoteChars, quoteFinalChars, quoteProgress);
    } else {
      restoreAll(quoteChars, quoteFinalChars);
    }

    /* Exact production Korean reveal window inside the quote -> definition morph. */
    const quoteMorph = phaseProgress(p, HERO.quoteHoldEnd, HERO.quoteMorphEnd);
    const definitionProgress = phaseProgress(
      quoteMorph,
      HERO.definitionRevealStartInMorph,
      1
    );

    if (p >= HERO.quoteHoldEnd && p <= HERO.quoteMorphEnd) {
      paintAboutRhythm(definitionChars, definitionFinalChars, definitionProgress);
    } else {
      restoreAll(definitionChars, definitionFinalChars);
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
