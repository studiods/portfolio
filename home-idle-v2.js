(() => {
  'use strict';

  const hero = document.querySelector('#heroSequence');
  const quote = hero?.querySelector('.hero-quote');
  if (!hero || !quote) return;

  /*
    Disable the legacy idle loop inside home-interactions.js before registering
    this module's own input listeners. The synthetic event has no browser default
    action; it only reaches already-registered JS listeners.
  */
  window.dispatchEvent(new Event('pointerdown'));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const BASE_ALPHA = 0.05;
  const WORD_ALPHA = 0.82;
  const LINE_ALPHA = 0.82;
  const UNIT_MS = 1000;
  const NEXT_UNIT_AT = 0.60;
  const STAGGER_MS = UNIT_MS * NEXT_UNIT_AT;
  const TAIL_MS = UNIT_MS - STAGGER_MS;
  const GAP_MS = 3000;
  const PATTERNS = Object.freeze(['words', 'lines', 'randomWords', 'lines']);

  const logicalLines = [...quote.children].filter(
    el => el.matches('span') && !el.classList.contains('fill-char')
  );
  const lineGroups = logicalLines
    .map(line => [...line.querySelectorAll('.fill-char')]
      .filter(char => char.textContent.trim().length > 0))
    .filter(group => group.length > 0);

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

  if (!lineGroups.length || !wordGroups.length) {
    console.warn('Home idle: logical quote groups were not found.');
    return;
  }

  const shuffle = items => {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  let disabled = false;
  let runToken = 0;
  let patternIndex = 0;
  const timers = new Set();
  const activeAnimations = new Set();

  const atTop = () => window.scrollY <= 8;
  const canRun = token =>
    !disabled && token === runToken && atTop() && !document.hidden;

  const clearTimers = () => {
    timers.forEach(id => clearTimeout(id));
    timers.clear();
  };

  const cancelAnimations = () => {
    activeAnimations.forEach(animation => {
      try { animation.cancel(); } catch (_) {}
    });
    activeAnimations.clear();
  };

  const stop = permanent => {
    runToken += 1;
    clearTimers();
    cancelAnimations();
    if (permanent) disabled = true;
    hero.dataset.idleState = permanent ? 'disabled' : 'paused';
    delete hero.dataset.idleMode;
  };

  const wait = (ms, token) => new Promise(resolve => {
    if (!canRun(token)) {
      resolve(false);
      return;
    }

    const id = window.setTimeout(() => {
      timers.delete(id);
      resolve(canRun(token));
    }, ms);
    timers.add(id);
  });

  const rgba = alpha => `rgba(17,17,17,${alpha.toFixed(3)})`;

  const pulseUnit = (group, peakAlpha, token) => {
    if (!canRun(token)) return false;

    const base = rgba(BASE_ALPHA);

    /*
      The previous 700ms attack reached full black in about 238ms, so although
      units overlapped in time, each word visually snapped on. Use a full 1s
      envelope with several intermediate alpha stops instead. The next unit still
      starts at 60% (600ms), while the outgoing unit is still rising toward its
      peak. This makes the transition read as a continuous wave rather than a set
      of separate flashes. The peak is capped at 82% to keep the progression
      visible instead of jumping from the 5% resting state to hard black.
  */
    if (group[0]?.animate) {
      const keyframes = [
        { color: base, offset: 0 },
        { color: rgba(0.14), offset: 0.18 },
        { color: rgba(0.34), offset: 0.36 },
        { color: rgba(0.60), offset: 0.54 },
        { color: rgba(peakAlpha), offset: 0.72 },
        { color: rgba(peakAlpha), offset: 0.78 },
        { color: rgba(0.45), offset: 0.90 },
        { color: base, offset: 1 }
      ];

      group.forEach(char => {
        const animation = char.animate(keyframes, {
          duration: UNIT_MS,
          easing: 'linear',
          fill: 'none'
        });
        activeAnimations.add(animation);
        animation.finished
          .catch(() => {})
          .finally(() => activeAnimations.delete(animation));
      });
      return true;
    }

    /* Very old-browser fallback: keep the same overall 1s timing. */
    group.forEach(char => { char.style.color = rgba(peakAlpha); });
    const id = window.setTimeout(() => {
      timers.delete(id);
      group.forEach(char => { char.style.color = base; });
    }, UNIT_MS);
    timers.add(id);
    return true;
  };

  const currentPattern = () => {
    const mode = PATTERNS[patternIndex];
    if (mode === 'lines') {
      return { mode, groups: lineGroups, peak: LINE_ALPHA };
    }
    if (mode === 'randomWords') {
      return { mode, groups: shuffle(wordGroups), peak: WORD_ALPHA };
    }
    return { mode, groups: wordGroups, peak: WORD_ALPHA };
  };

  const runPattern = async (pattern, token) => {
    const { groups, peak } = pattern;

    for (let index = 0; index < groups.length; index += 1) {
      if (!pulseUnit(groups[index], peak, token)) return false;

      if (index < groups.length - 1) {
        if (!(await wait(STAGGER_MS, token))) return false;
      }
    }

    /* Let the final unit finish its remaining 40% before the 3s pattern gap. */
    return wait(TAIL_MS, token);
  };

  const run = async token => {
    while (canRun(token)) {
      hero.dataset.idleState = 'waiting';
      if (!(await wait(GAP_MS, token))) return;

      const pattern = currentPattern();
      hero.dataset.idleState = 'running';
      hero.dataset.idleMode = pattern.mode;

      if (!(await runPattern(pattern, token))) return;

      patternIndex = (patternIndex + 1) % PATTERNS.length;
      delete hero.dataset.idleMode;
    }
  };

  const start = () => {
    if (disabled || document.hidden || !atTop()) return;
    const token = ++runToken;
    run(token).catch(error => {
      console.error('Home idle animation failed.', error);
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
