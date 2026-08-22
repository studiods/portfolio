(() => {
  'use strict';

  const hero = document.querySelector('#heroSequence');
  const quote = hero?.querySelector('.hero-quote');
  const source = hero?.querySelector('.quote-source-only');
  const chars = quote ? [...quote.querySelectorAll('.fill-char')] : [];
  if (!hero || !quote || !chars.length) return;

  /*
    H3 TEST — phase-window hypothesis only.

    Production home-interactions.js still owns the full Hero timeline.
    This test paints only the FIRST English reveal after production has painted,
    using six scramble states with the validated 2x reveal window:
      0.000 -> 0.095  (production)
      0.000 -> 0.190  (this diagnostic)

    Once p > 0.190 this module stops touching the Hero entirely, so the later
    quote hold, English -> Korean morph, Subtractive Design and lower sections
    remain on the production timeline.
  */

  const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const START = 0;
  const END = 0.190;
  const SCRAMBLE_RATIO = 0.78;
  const CYCLES = 6;
  const BASE_ALPHA = 0.05;

  const entries = [];
  let visibleIndex = 0;
  chars.forEach(char => {
    const finalChar = char.dataset.finalChar ?? char.textContent;
    if (!finalChar.trim()) {
      entries.push({ char, finalChar, index: -1 });
      return;
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

  const clearScramble = char => {
    if (char.classList.contains('is-scrambling')) char.classList.remove('is-scrambling');
  };

  const setPending = char => {
    clearScramble(char);
    char.style.color = `rgba(17,17,17,${BASE_ALPHA})`;
  };

  const setFinal = char => {
    clearScramble(char);
    char.style.color = 'rgba(17,17,17,1)';
  };

  const setScramble = (char, glyph) => {
    char.style.color = 'rgba(17,17,17,0)';
    char.style.setProperty('--scramble-alpha', '1');
    char.style.setProperty('--scramble-rgb', '17,17,17');
    if (char.dataset.scramble !== glyph) char.dataset.scramble = glyph;
    if (!char.classList.contains('is-scrambling')) char.classList.add('is-scrambling');
  };

  const paint = () => {
    const p = heroProgress();
    if (p > END + 0.001) return;

    const reveal = phaseProgress(p, START, END);
    const sweep = easeInOut(reveal) * count;

    entries.forEach(({ char, index }) => {
      if (index < 0) {
        clearScramble(char);
        return;
      }

      const local = clamp(sweep - index);
      if (local <= 0) {
        setPending(char);
      } else if (local < SCRAMBLE_RATIO) {
        const cycle = Math.min(
          CYCLES - 1,
          Math.floor((local / SCRAMBLE_RATIO) * CYCLES)
        );
        setScramble(char, glyphFor(index, cycle));
      } else {
        setFinal(char);
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
      /* Registered after home-interactions.js, so this is the final quote paint. */
      paint();
    });
  };

  addEventListener('scroll', requestPaint, { passive: true });
  addEventListener('resize', requestPaint, { passive: true });
  requestPaint();
})();