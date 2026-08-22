(() => {
  'use strict';

  const hero = document.querySelector('#heroSequence');
  const quote = hero?.querySelector('.hero-quote');
  const source = hero?.querySelector('.quote-source-only');
  const chars = quote ? [...quote.querySelectorAll('.fill-char')] : [];
  if (!hero || !quote || !chars.length) return;

  /*
    H8 TEST — direct text renderer.

    Keep the validated scroll geometry from H7:
      0.000 -> 0.190
      scramble ratio 0.78
      character step 0.78
      smoothstep reveal progression

    The new variable is the renderer. Instead of writing data-scramble and
    waiting for MutationObserver to copy it into textContent, this test writes
    the random glyph directly into each .fill-char. Six scramble states are used
    so we can see whether the observer/adapter was collapsing intermediate states.
  */

  const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const START = 0;
  const END = 0.190;
  const SCRAMBLE_RATIO = 0.78;
  const CYCLES = 6;
  const CHAR_STEP = 0.78;
  const BASE_ALPHA = 0.05;

  const entries = [];
  let visibleIndex = 0;
  chars.forEach(char => {
    const finalChar = char.dataset.finalChar ?? char.textContent;
    if (!char.dataset.h8FinalChar) char.dataset.h8FinalChar = finalChar;

    if (!finalChar.trim()) {
      entries.push({ char, finalChar, index: -1 });
      return;
    }

    const width = char.getBoundingClientRect().width;
    if (width > 0) {
      char.style.display = 'inline-block';
      char.style.width = `${width.toFixed(3)}px`;
    }

    entries.push({ char, finalChar, index: visibleIndex++ });
  });
  const count = Math.max(1, visibleIndex);

  const clamp = value => Math.max(0, Math.min(1, value));
  const easeInOut = value => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };
  const phaseProgress = (value, start, end) =>
    end <= start ? (value >= end ? 1 : 0) : clamp((value - start) / (end - start));

  const heroProgress = () => {
    const top = hero.getBoundingClientRect().top + scrollY;
    const travel = Math.max(1, hero.offsetHeight - innerHeight);
    return clamp((scrollY - top) / travel);
  };

  const glyphFor = (index, cycle) =>
    POOL[(index * 17 + cycle * 13) % POOL.length];

  const clearLegacyScramble = char => {
    char.classList.remove('is-scrambling');
    char.removeAttribute('data-scramble');
    char.style.removeProperty('--scramble-alpha');
    char.style.removeProperty('--scramble-rgb');
  };

  const writeGlyph = (char, value, alpha) => {
    clearLegacyScramble(char);
    if (char.textContent !== value) char.textContent = value;
    char.style.color = `rgba(17,17,17,${alpha})`;
  };

  const paint = () => {
    const p = heroProgress();
    if (p > END + 0.001) return;

    const reveal = phaseProgress(p, START, END);
    const sweepMax = Math.max(1, (count - 1) * CHAR_STEP + 1);
    const sweep = easeInOut(reveal) * sweepMax;

    entries.forEach(({ char, finalChar, index }) => {
      if (index < 0) {
        clearLegacyScramble(char);
        if (char.textContent !== finalChar) char.textContent = finalChar;
        return;
      }

      const local = clamp(sweep - index * CHAR_STEP);
      if (local <= 0) {
        writeGlyph(char, finalChar, BASE_ALPHA);
      } else if (local < SCRAMBLE_RATIO) {
        const cycle = Math.min(
          CYCLES - 1,
          Math.floor((local / SCRAMBLE_RATIO) * CYCLES)
        );
        writeGlyph(char, glyphFor(index, cycle), 1);
      } else {
        writeGlyph(char, finalChar, 1);
      }
    });

    if (source) {
      const sourceStart = START + (END - START) * 0.62;
      const sourceP = easeInOut(phaseProgress(p, sourceStart, END));
      const alpha = BASE_ALPHA + (1 - BASE_ALPHA) * sourceP;
      source.style.color = `rgba(17,17,17,${alpha.toFixed(3)})`;
      source.style.opacity = '1';
    }
  };

  let raf = 0;
  const requestPaint = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      paint();
    });
  };

  addEventListener('scroll', requestPaint, { passive: true });
  addEventListener('resize', requestPaint, { passive: true });
  requestPaint();
})();