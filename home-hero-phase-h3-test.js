(() => {
  'use strict';

  const hero = document.querySelector('#heroSequence');
  const quote = hero?.querySelector('.hero-quote');
  const source = hero?.querySelector('.quote-source-only');
  const chars = quote ? [...quote.querySelectorAll('.fill-char')] : [];
  if (!hero || !quote || !chars.length) return;

  /*
    H7 TEST — ordered character-step spacing only.

    Restores the first validated scroll-driven scramble baseline:
      0.000 -> 0.190
      scramble ratio 0.78
      three scramble states
      smoothstep reveal progression

    The only new variable is CHAR_STEP. Production used an effective step of 1.0.
    Here the next authored glyph starts at 0.78, exactly when the previous glyph
    leaves its scramble range. This preserves strict left-to-right order with no
    overlap while giving each glyph about 28% more scroll distance to scramble.
  */

  const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const START = 0;
  const END = 0.190;
  const SCRAMBLE_RATIO = 0.78;
  const CYCLES = 3;
  const CHAR_STEP = 0.78;
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
    const sweepMax = Math.max(1, (count - 1) * CHAR_STEP + 1);
    const sweep = easeInOut(reveal) * sweepMax;

    entries.forEach(({ char, index }) => {
      if (index < 0) {
        clearScramble(char);
        return;
      }

      const local = clamp(sweep - index * CHAR_STEP);
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
      paint();
    });
  };

  addEventListener('scroll', requestPaint, { passive: true });
  addEventListener('resize', requestPaint, { passive: true });
  requestPaint();
})();