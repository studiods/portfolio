(() => {
  'use strict';

  const hero = document.querySelector('#heroSequence');
  const quote = hero?.querySelector('.hero-quote');
  if (!hero || !quote) return;

  /*
    home-interactions.js still contains the legacy idle controller. Disable it
    first, then let this module own every no-action animation on the first hero.
  */
  window.dispatchEvent(new Event('pointerdown'));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const SCRAMBLE_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const BASE_ALPHA = 0.05;
  const FULL_ALPHA = 1;
  const INITIAL_IDLE_MS = 3000;
  const WORD_MS = 300;
  const NEXT_WORD_AT = 0.60;
  const WORD_STAGGER_MS = WORD_MS * NEXT_WORD_AT;
  const GLYPH_CYCLE_MS = 36;
  const RESOLVE_AT = 0.84;
  const FADE_TO_BASE_MS = 2000;
  const BASE_HOLD_MS = 1000;

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

  const setWordFull = group => group.forEach(char => setCharAlpha(char, FULL_ALPHA));
  const resetAllToBase = () => allChars.forEach(char => setCharAlpha(char, BASE_ALPHA));

  let disabled = false;
  let runToken = 0;
  const timers = new Set();
  const rafs = new Set();

  const atTop = () => window.scrollY <= 8;
  const canRun = token =>
    !disabled && token === runToken && atTop() && !document.hidden;

  const clearTimers = () => {
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
    if (!canRun(token)) {
      resolve(false);
      return;
    }
    const id = setTimeout(() => {
      timers.delete(id);
      resolve(canRun(token));
    }, ms);
    timers.add(id);
  });

  const randomGlyph = (charIndex, cycle, seed) =>
    SCRAMBLE_POOL[(charIndex * 17 + cycle * 13 + seed * 19) % SCRAMBLE_POOL.length];

  const animateWord = (group, token, seed) => new Promise(resolve => {
    if (!canRun(token)) {
      resolve(false);
      return;
    }

    const startedAt = performance.now();

    const frame = now => {
      if (!canRun(token)) {
        group.forEach(char => setCharAlpha(char, BASE_ALPHA));
        resolve(false);
        return;
      }

      const elapsed = now - startedAt;
      const progress = Math.min(1, elapsed / WORD_MS);
      const cycle = Math.floor(elapsed / GLYPH_CYCLE_MS);

      if (progress < RESOLVE_AT) {
        group.forEach((char, index) => {
          char.style.color = 'transparent';
          char.dataset.scramble = randomGlyph(index, cycle, seed);
          char.style.setProperty('--scramble-alpha', '1');
          char.style.setProperty('--scramble-rgb', '17,17,17');
          char.classList.add('is-scrambling');
        });
      } else {
        setWordFull(group);
      }

      if (progress >= 1) {
        setWordFull(group);
        resolve(true);
        return;
      }

      nextFrame(frame);
    };

    nextFrame(frame);
  });

  const fadeAllToBase = token => new Promise(resolve => {
    if (!canRun(token)) {
      resolve(false);
      return;
    }

    allChars.forEach(clearScramble);
    const startedAt = performance.now();
    hero.dataset.idleState = 'fading-to-base';

    const frame = now => {
      if (!canRun(token)) {
        resetAllToBase();
        resolve(false);
        return;
      }

      const progress = Math.min(1, (now - startedAt) / FADE_TO_BASE_MS);
      const alpha = FULL_ALPHA + (BASE_ALPHA - FULL_ALPHA) * progress;
      allChars.forEach(char => {
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

  const runWordPattern = async (groups, token, mode) => {
    resetAllToBase();
    hero.dataset.idleState = 'running';
    hero.dataset.idleMode = mode;

    const jobs = [];
    for (let index = 0; index < groups.length; index += 1) {
      if (!canRun(token)) return false;
      jobs.push(animateWord(groups[index], token, index + (mode === 'random' ? 31 : 0)));

      if (index < groups.length - 1) {
        if (!(await wait(WORD_STAGGER_MS, token))) return false;
      }
    }

    const results = await Promise.all(jobs);
    if (!results.every(Boolean) || !canRun(token)) return false;

    /* Every authored word has accumulated at 100% black. Fade immediately. */
    allChars.forEach(char => setCharAlpha(char, FULL_ALPHA));

    if (!(await fadeAllToBase(token))) return false;

    hero.dataset.idleState = 'base-hold';
    if (!(await wait(BASE_HOLD_MS, token))) return false;

    delete hero.dataset.idleMode;
    return true;
  };

  const stop = permanent => {
    runToken += 1;
    clearTimers();
    clearRafs();
    resetAllToBase();
    if (permanent) disabled = true;
    hero.dataset.idleState = permanent ? 'disabled' : 'paused';
    delete hero.dataset.idleMode;
  };

  const run = async token => {
    resetAllToBase();
    hero.dataset.idleState = 'waiting';
    if (!(await wait(INITIAL_IDLE_MS, token))) return;

    while (canRun(token)) {
      if (!(await runWordPattern(wordGroups, token, 'sequential'))) return;
      if (!(await runWordPattern(shuffle(wordGroups), token, 'random'))) return;
    }
  };

  const start = () => {
    if (disabled || document.hidden || !atTop()) return;
    const token = ++runToken;
    run(token).catch(error => {
      console.error('Home idle scramble failed.', error);
      stop(true);
    });
  };

  const stopFromUser = event => {
    if (event && event.isTrusted === false) return;
    stop(true);
  };

  window.addEventListener('wheel', stopFromUser, { passive: true });
  window.addEventListener('touchstart', stopFromUser, { passive: true });
  window.addEventListener('pointerdown', stopFromUser, { passive: true });
  window.addEventListener('keydown', stopFromUser);
  window.addEventListener('scroll', () => {
    if (window.scrollY > 8) stop(true);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (disabled) return;
    if (document.hidden) stop(false);
    else start();
  });

  hero.dataset.idleState = 'armed';
  start();
})();
