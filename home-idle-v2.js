(() => {
  'use strict';

  const hero = document.querySelector('#heroSequence');
  const quote = hero?.querySelector('.hero-quote');
  if (!hero || !quote) return;

  /* Disable the legacy idle cue in home-interactions.js. */
  window.dispatchEvent(new Event('pointerdown'));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const SCRAMBLE_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const BASE_ALPHA = 0.05;
  const FULL_ALPHA = 1;
  const IDLE_RESTART_MS = 3000;
  const CHAR_MS = 800;
  const NEXT_CHAR_AT = 0.60;
  const CHAR_STAGGER_MS = CHAR_MS * NEXT_CHAR_AT;
  const SCRAMBLE_STATES = 3;
  const SCRAMBLE_STATE_MS = CHAR_MS / SCRAMBLE_STATES;
  const FADE_TO_BASE_MS = 3000;

  const logicalLines = [...quote.children].filter(
    el => el.matches('span') && !el.classList.contains('fill-char')
  );

  const wordGroups = [];
  logicalLines.forEach(line => {
    const chars = [...line.querySelectorAll('.fill-char')];
    let current = [];

    const flush = () => {
      if (!current.length) return;
      wordGroups.push(current);
      current = [];
    };

    chars.forEach(char => {
      if (char.textContent.trim().length > 0) current.push(char);
      else flush();
    });
    flush();
  });

  if (!wordGroups.length) {
    console.warn('Home idle scramble: quote word groups were not found.');
    return;
  }

  const allChars = wordGroups.flat();

  const shuffle = items => {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const clearScramble = char => {
    char.classList.remove('is-scrambling');
    char.removeAttribute('data-scramble');
    char.style.removeProperty('--scramble-alpha');
    char.style.removeProperty('--scramble-rgb');
  };

  const setCharAlpha = (char, alpha) => {
    clearScramble(char);
    char.style.color = `rgba(17,17,17,${alpha})`;
  };

  const resetAllToBase = () => allChars.forEach(char => setCharAlpha(char, BASE_ALPHA));
  const setAllFull = () => allChars.forEach(char => setCharAlpha(char, FULL_ALPHA));

  const randomLetter = (finalChar, previous = '') => {
    let glyph = finalChar;
    for (let attempt = 0; attempt < 8 && (glyph === finalChar || glyph === previous); attempt += 1) {
      glyph = SCRAMBLE_POOL[Math.floor(Math.random() * SCRAMBLE_POOL.length)];
    }
    return glyph === finalChar ? SCRAMBLE_POOL[(SCRAMBLE_POOL.indexOf(finalChar) + 7) % SCRAMBLE_POOL.length] : glyph;
  };

  const makeThreeStates = char => {
    const finalChar = char.textContent.toUpperCase();
    const states = [];
    for (let index = 0; index < SCRAMBLE_STATES; index += 1) {
      states.push(randomLetter(finalChar, states[index - 1] || ''));
    }
    return states;
  };

  let generation = 0;
  let mode = 'sequential';
  let idleTimer = 0;
  const timers = new Set();
  const rafs = new Set();

  const atHeroStart = () => window.scrollY <= 8;
  const alive = token => token === generation && !document.hidden && atHeroStart();

  const clearTimers = () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = 0;
    }
    timers.forEach(id => clearTimeout(id));
    timers.clear();
  };

  const clearRafs = () => {
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

  const animateChar = (char, token) => new Promise(resolve => {
    if (!alive(token)) {
      resolve(false);
      return;
    }

    const states = makeThreeStates(char);
    const startedAt = performance.now();

    const frame = now => {
      if (!alive(token)) {
        setCharAlpha(char, BASE_ALPHA);
        resolve(false);
        return;
      }

      const elapsed = now - startedAt;
      if (elapsed >= CHAR_MS) {
        setCharAlpha(char, FULL_ALPHA);
        resolve(true);
        return;
      }

      const stateIndex = Math.min(
        SCRAMBLE_STATES - 1,
        Math.floor(elapsed / SCRAMBLE_STATE_MS)
      );

      char.style.color = 'transparent';
      char.dataset.scramble = states[stateIndex];
      char.style.setProperty('--scramble-alpha', '1');
      char.style.setProperty('--scramble-rgb', '17,17,17');
      char.classList.add('is-scrambling');
      nextFrame(frame);
    };

    nextFrame(frame);
  });

  const fadeAllToBase = token => new Promise(resolve => {
    if (!alive(token)) {
      resolve(false);
      return;
    }

    setAllFull();
    hero.dataset.idleState = 'fading-to-base';
    const startedAt = performance.now();

    const frame = now => {
      if (!alive(token)) {
        resetAllToBase();
        resolve(false);
        return;
      }

      const progress = Math.min(1, (now - startedAt) / FADE_TO_BASE_MS);
      const eased = progress * progress * (3 - 2 * progress);
      const alpha = FULL_ALPHA + (BASE_ALPHA - FULL_ALPHA) * eased;
      allChars.forEach(char => {
        clearScramble(char);
        char.style.color = `rgba(17,17,17,${alpha.toFixed(4)})`;
      });

      if (progress >= 1) {
        resetAllToBase();
        resolve(true);
        return;
      }

      nextFrame(frame);
    };

    nextFrame(frame);
  });

  const orderedCharsForMode = currentMode => {
    const words = currentMode === 'random' ? shuffle(wordGroups) : wordGroups.slice();
    return words.flat();
  };

  const runPattern = async (currentMode, token) => {
    resetAllToBase();
    hero.dataset.idleState = 'running';
    hero.dataset.idleMode = currentMode;

    const chars = orderedCharsForMode(currentMode);
    const jobs = [];

    for (let index = 0; index < chars.length; index += 1) {
      if (!alive(token)) return false;
      jobs.push(animateChar(chars[index], token));

      if (index < chars.length - 1) {
        if (!(await wait(CHAR_STAGGER_MS, token))) return false;
      }
    }

    const results = await Promise.all(jobs);
    if (!results.every(Boolean) || !alive(token)) return false;

    setAllFull();
    hero.dataset.idleState = 'full';

    if (!(await fadeAllToBase(token))) return false;

    delete hero.dataset.idleMode;
    hero.dataset.idleState = 'ready-next';
    return true;
  };

  const runLoop = async token => {
    while (alive(token)) {
      const completed = await runPattern(mode, token);
      if (!completed || !alive(token)) return;
      mode = mode === 'sequential' ? 'random' : 'sequential';
    }
  };

  const cancelCurrent = () => {
    generation += 1;
    clearTimers();
    clearRafs();
    resetAllToBase();
    delete hero.dataset.idleMode;
    hero.dataset.idleState = 'waiting';
  };

  const armInitialAfterIdle = () => {
    cancelCurrent();
    mode = 'sequential';

    if (document.hidden || !atHeroStart()) return;

    const token = generation;
    idleTimer = setTimeout(() => {
      idleTimer = 0;
      if (!alive(token)) return;
      runLoop(token).catch(error => {
        console.error('Home idle alphabet scramble failed.', error);
        cancelCurrent();
      });
    }, IDLE_RESTART_MS);
  };

  const registerActivity = event => {
    if (event && event.isTrusted === false) return;
    armInitialAfterIdle();
  };

  window.addEventListener('wheel', registerActivity, { passive: true });
  window.addEventListener('touchstart', registerActivity, { passive: true });
  window.addEventListener('pointerdown', registerActivity, { passive: true });
  window.addEventListener('pointermove', registerActivity, { passive: true });
  window.addEventListener('keydown', registerActivity);
  window.addEventListener('scroll', registerActivity, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelCurrent();
    else armInitialAfterIdle();
  });

  hero.dataset.idleState = 'armed';
  armInitialAfterIdle();
})();
