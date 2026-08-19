(() => {
  'use strict';

  const hero = document.querySelector('#heroSequence');
  const quote = hero?.querySelector('.hero-quote');
  if (!hero || !quote) return;

  /* Disable the legacy idle cue in home-interactions.js. */
  window.dispatchEvent(new Event('pointerdown'));

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const SCRAMBLE_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const BASE_ALPHA = 0.05;
  const FULL_ALPHA = 1;
  const IDLE_DELAY_MS = 3000;
  const WORD_MS = 500;
  const NEXT_WORD_MS = WORD_MS * 0.5;
  const GLYPH_STEP_MS = 80;
  const FADE_TO_BASE_MS = 3000;

  const logicalLines = [...quote.children].filter(
    el => el.matches('span') && !el.classList.contains('fill-char')
  );

  const wordGroups = [];
  logicalLines.forEach(line => {
    const chars = [...line.querySelectorAll('.fill-char')];
    let word = [];

    const flush = () => {
      if (!word.length) return;
      wordGroups.push(word);
      word = [];
    };

    chars.forEach(char => {
      if (char.textContent.trim()) word.push(char);
      else flush();
    });
    flush();
  });

  if (!wordGroups.length) return;

  const allChars = wordGroups.flat();
  const authoredChars = new WeakMap();
  allChars.forEach(char => {
    authoredChars.set(char, char.dataset.finalChar || char.textContent);
  });

  const authoredChar = char => authoredChars.get(char) || char.textContent;

  /*
    Random letters replace the live text node itself instead of using an
    absolutely positioned pseudo element. This keeps scramble and authored
    glyphs on the exact same font baseline. The original advance width is held
    only while scrambling so neighboring letters do not shift horizontally.
  */
  const clearLegacyScramble = char => {
    char.classList.remove('is-scrambling');
    char.removeAttribute('data-scramble');
    char.style.removeProperty('--scramble-alpha');
    char.style.removeProperty('--scramble-rgb');
  };

  const restoreChar = (char, alpha) => {
    clearLegacyScramble(char);
    char.textContent = authoredChar(char);
    char.classList.remove('idle-inline-scramble');
    char.style.removeProperty('--idle-char-width');
    char.style.color = `rgba(17,17,17,${alpha})`;
  };

  const prepareChar = char => {
    restoreChar(char, BASE_ALPHA);
    const width = char.getBoundingClientRect().width;
    char.style.setProperty('--idle-char-width', `${width.toFixed(3)}px`);
    char.classList.add('idle-inline-scramble');
    char.style.color = 'rgba(17,17,17,1)';
  };

  const resetToBase = () => allChars.forEach(char => restoreChar(char, BASE_ALPHA));
  const setAllFull = () => allChars.forEach(char => restoreChar(char, FULL_ALPHA));

  const randomLetter = (finalChar, previous = '') => {
    let glyph = finalChar;
    for (let i = 0; i < 10 && (glyph === finalChar || glyph === previous); i += 1) {
      glyph = SCRAMBLE_POOL[Math.floor(Math.random() * SCRAMBLE_POOL.length)];
    }
    return glyph;
  };

  let generation = 0;
  let idleTimer = 0;
  const timers = new Set();
  const rafs = new Set();

  const atHeroStart = () => window.scrollY <= 8;
  const alive = token => token === generation && !document.hidden && atHeroStart();

  const clearAsync = () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = 0;
    }
    timers.forEach(id => clearTimeout(id));
    timers.clear();
    rafs.forEach(id => cancelAnimationFrame(id));
    rafs.clear();
  };

  const nextFrame = callback => {
    const id = requestAnimationFrame(now => {
      rafs.delete(id);
      callback(now);
    });
    rafs.add(id);
  };

  const wait = (ms, token) => new Promise(resolve => {
    if (!alive(token)) {
      resolve(false);
      return;
    }
    const id = setTimeout(() => {
      timers.delete(id);
      resolve(alive(token));
    }, ms);
    timers.add(id);
  });

  const animateWord = (chars, token) => new Promise(resolve => {
    if (!alive(token)) {
      resolve(false);
      return;
    }

    chars.forEach(prepareChar);
    let lastStep = -1;
    let previousGlyphs = new Array(chars.length).fill('');
    const startedAt = performance.now();

    const frame = now => {
      if (!alive(token)) {
        chars.forEach(char => restoreChar(char, BASE_ALPHA));
        resolve(false);
        return;
      }

      const elapsed = now - startedAt;
      if (elapsed >= WORD_MS) {
        chars.forEach(char => restoreChar(char, FULL_ALPHA));
        resolve(true);
        return;
      }

      const step = Math.floor(elapsed / GLYPH_STEP_MS);
      if (step !== lastStep) {
        chars.forEach((char, index) => {
          const next = randomLetter(authoredChar(char).toUpperCase(), previousGlyphs[index]);
          previousGlyphs[index] = next;
          char.textContent = next;
        });
        lastStep = step;
      }

      nextFrame(frame);
    };

    nextFrame(frame);
  });

  const fadeToBase = token => new Promise(resolve => {
    if (!alive(token)) {
      resolve(false);
      return;
    }

    setAllFull();
    const startedAt = performance.now();
    hero.dataset.idleState = 'fading';

    const frame = now => {
      if (!alive(token)) {
        resetToBase();
        resolve(false);
        return;
      }

      const progress = Math.min(1, (now - startedAt) / FADE_TO_BASE_MS);
      const eased = progress * progress * (3 - 2 * progress);
      const alpha = FULL_ALPHA + (BASE_ALPHA - FULL_ALPHA) * eased;
      allChars.forEach(char => {
        clearLegacyScramble(char);
        char.textContent = authoredChar(char);
        char.classList.remove('idle-inline-scramble');
        char.style.removeProperty('--idle-char-width');
        char.style.color = `rgba(17,17,17,${alpha.toFixed(4)})`;
      });

      if (progress >= 1) {
        resetToBase();
        resolve(true);
        return;
      }

      nextFrame(frame);
    };

    nextFrame(frame);
  });

  const runSequence = async token => {
    resetToBase();
    hero.dataset.idleState = 'running';

    const jobs = [];
    for (let index = 0; index < wordGroups.length; index += 1) {
      if (!alive(token)) return false;
      jobs.push(animateWord(wordGroups[index], token));

      if (index < wordGroups.length - 1) {
        if (!(await wait(NEXT_WORD_MS, token))) return false;
      }
    }

    const results = await Promise.all(jobs);
    if (!results.every(Boolean) || !alive(token)) return false;

    setAllFull();
    return fadeToBase(token);
  };

  const runLoop = async token => {
    while (alive(token)) {
      if (!(await runSequence(token))) return;
    }
  };

  const cancelAndReset = () => {
    generation += 1;
    clearAsync();
    resetToBase();
    hero.dataset.idleState = 'waiting';
  };

  const armAfterIdle = () => {
    cancelAndReset();
    if (document.hidden || !atHeroStart()) return;

    const token = generation;
    idleTimer = setTimeout(() => {
      idleTimer = 0;
      if (!alive(token)) return;
      runLoop(token).catch(() => cancelAndReset());
    }, IDLE_DELAY_MS);
  };

  const registerActivity = event => {
    if (event && event.isTrusted === false) return;
    armAfterIdle();
  };

  window.addEventListener('wheel', registerActivity, { passive: true });
  window.addEventListener('touchstart', registerActivity, { passive: true });
  window.addEventListener('pointerdown', registerActivity, { passive: true });
  window.addEventListener('pointermove', registerActivity, { passive: true });
  window.addEventListener('keydown', registerActivity);
  window.addEventListener('scroll', registerActivity, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAndReset();
    else armAfterIdle();
  });

  hero.dataset.idleState = 'armed';
  armAfterIdle();
})();
