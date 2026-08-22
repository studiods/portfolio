(() => {
  'use strict';

  const hero = document.querySelector('#heroSequence');
  const quote = hero?.querySelector('.hero-quote');
  const source = hero?.querySelector('.quote-source-only');
  const chars = quote ? [...quote.querySelectorAll('.fill-char')] : [];
  if (!hero || !quote || !chars.length) return;

  /*
    H6 TEST — time-driven scramble tick only.

    The validated first-reveal geometry remains unchanged:
      0.000 -> 0.190
      scramble ratio 0.78
      smoothstep reveal progression

    Scroll position still decides pending / scramble / final. While a glyph is
    inside the scramble state, its random character now advances by real time
    every 60ms instead of deriving the random step from scroll progress.
  */

  const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const START = 0;
  const END = 0.190;
  const SCRAMBLE_RATIO = 0.78;
  const CYCLES = 3;
  const TICK_MS = 60;
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
  const activeSince = new WeakMap();

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

  const glyphFor = (index, step) =>
    POOL[(index * 17 + step * 13) % POOL.length];

  const clearScramble = char => {
    if (char.classList.contains('is-scrambling')) char.classList.remove('is-scrambling');
  };

  const setPending = char => {
    activeSince.delete(char);
    clearScramble(char);
    char.style.color = `rgba(17,17,17,${BASE_ALPHA})`;
  };

  const setFinal = char => {
    activeSince.delete(char);
    clearScramble(char);
    char.style.color = 'rgba(17,17,17,1)';
  };

  const setScramble = (char, index, now) => {
    if (!activeSince.has(char)) activeSince.set(char, now);
    const elapsed = Math.max(0, now - activeSince.get(char));
    const step = Math.floor(elapsed / TICK_MS) % CYCLES;
    const glyph = glyphFor(index, step);

    char.style.color = 'rgba(17,17,17,0)';
    char.style.setProperty('--scramble-alpha', '1');
    char.style.setProperty('--scramble-rgb', '17,17,17');
    if (char.dataset.scramble !== glyph) char.dataset.scramble = glyph;
    if (!char.classList.contains('is-scrambling')) char.classList.add('is-scrambling');
  };

  const paint = now => {
    const p = heroProgress();
    if (p > END + 0.001) return false;

    const reveal = phaseProgress(p, START, END);
    const sweep = easeInOut(reveal) * count;
    let hasActiveScramble = false;

    entries.forEach(({ char, index }) => {
      if (index < 0) {
        activeSince.delete(char);
        clearScramble(char);
        return;
      }

      const local = clamp(sweep - index);
      if (local <= 0) {
        setPending(char);
      } else if (local < SCRAMBLE_RATIO) {
        hasActiveScramble = true;
        setScramble(char, index, now);
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

    return hasActiveScramble;
  };

  let raf = 0;
  const frame = now => {
    raf = 0;
    const keepTicking = paint(now);
    if (keepTicking) raf = requestAnimationFrame(frame);
  };

  const requestPaint = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  addEventListener('scroll', requestPaint, { passive: true });
  addEventListener('resize', requestPaint, { passive: true });
  requestPaint();
})();