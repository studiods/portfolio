(() => {
  'use strict';

  const hero = document.querySelector('#heroSequence');
  const quote = hero?.querySelector('.hero-quote');
  const chars = quote ? [...quote.querySelectorAll('.fill-char')] : [];
  if (!hero || !quote || !chars.length) return;

  /*
    The base Hero renderer calls its initial reveal and its later quote-morph
    renderer in the same frame. While quoteMorph is still zero, the second call
    clears the is-scrambling class that the first call just created. This final
    paint pass owns only the initial 0 -> 9.5% Hero interval and stops touching
    the quote as soon as that interval ends, so later English -> Korean morphs
    remain fully owned by home-interactions.js.
  */
  const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const QUOTE_FILL_END = 0.095;
  const SCRAMBLE_RATIO = 0.78;
  const finalChars = chars.map(char => char.dataset.finalChar ?? char.textContent);
  let widths = new WeakMap();
  let inInitialWindow = false;

  const style = document.createElement('style');
  style.id = 'hero-initial-scramble-fix-style';
  style.textContent = `
    .hero-quote .fill-char.hero-direct-scramble{
      color:rgba(17,17,17,1)!important;
      display:inline!important;
      position:static!important;
      vertical-align:baseline!important;
      line-height:inherit!important;
      transform:none!important;
      translate:none!important;
    }
    .hero-quote .fill-char.hero-direct-scramble::before,
    .hero-quote .fill-char.hero-direct-scramble::after{
      content:none!important;
      display:none!important;
    }
  `;
  document.head.appendChild(style);

  const clamp = value => Math.max(0, Math.min(1, value));
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
    char.classList.add('hero-direct-scramble');
  };

  const restore = (char, finalChar) => {
    char.textContent = finalChar;
    char.classList.remove('hero-direct-scramble');
    char.style.removeProperty('letter-spacing');
  };

  const restoreAll = () => {
    chars.forEach((char, index) => restore(char, finalChars[index]));
  };

  const render = () => {
    const travel = Math.max(1, hero.offsetHeight - innerHeight);
    const heroTop = hero.getBoundingClientRect().top + scrollY;
    const p = clamp((scrollY - heroTop) / travel);
    const isInitialWindow = p > 0 && p < QUOTE_FILL_END;

    if (!isInitialWindow) {
      if (inInitialWindow) restoreAll();
      inInitialWindow = false;
      return;
    }
    inInitialWindow = true;

    const visible = chars
      .map((char, domIndex) => ({ char, domIndex, finalChar: finalChars[domIndex] }))
      .filter(entry => entry.finalChar.trim().length > 0);
    const sweep = easeInOut(p / QUOTE_FILL_END) * visible.length;

    visible.forEach(({ char, finalChar }, visibleIndex) => {
      const local = clamp(sweep - visibleIndex);
      if (local <= 0 || local >= SCRAMBLE_RATIO) {
        restore(char, finalChar);
        return;
      }

      const cycle = Math.min(2, Math.floor((local / SCRAMBLE_RATIO) * 3));
      const poolIndex = (visibleIndex * 17 + cycle * 13) % POOL.length;
      showGlyph(char, finalChar, POOL[poolIndex]);
    });
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
