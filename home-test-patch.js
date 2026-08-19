(() => {
  'use strict';

  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const easeInOut = value => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };
  const phaseProgress = (value, start, end) => {
    if (end <= start) return value >= end ? 1 : 0;
    return clamp((value - start) / (end - start));
  };
  const FILL_SLOWDOWN = 1.452;
  const fillProgress = (value, start, duration) =>
    clamp((value - start) / (duration * FILL_SLOWDOWN));
  const absoluteTop = el => el ? el.getBoundingClientRect().top + scrollY : 0;

  /*
    Principles intro timeline.
    English completes first, then holds, then Korean morphs, then holds again.
    The enlarged CSS sticky stage converts these progress holds into real scroll
    distance, giving the viewer time to read each completed state.
  */
  const PRINCIPLES_TIMING = Object.freeze({
    englishRevealEnd: 0.34,
    englishHoldEnd: 0.48,
    koreanMorphEnd: 0.82,
    koreanHoldEnd: 1.00
  });
  const PRINCIPLES_CARD_SLOWDOWN = 1.20;
  const slowEnd = (start, end, factor) =>
    Math.min(1, start + (end - start) * factor);

  const SCRAMBLE_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomGlyph = (index, step) =>
    SCRAMBLE_POOL[(index * 17 + step * 13) % SCRAMBLE_POOL.length];

  const body = document.body;
  const hero = document.querySelector('#heroSequence');
  const quoteChars = hero ? [...hero.querySelectorAll('.hero-quote .fill-char')] : [];

  const philosophy = document.querySelector('#philosophy');
  const philosophySticky = philosophy?.querySelector('.philosophy-sticky');
  const philosophyChars = philosophy ? [...philosophy.querySelectorAll('.philosophy-statements .fill-char')] : [];

  const principles = document.querySelector('#principles');
  const introStage = principles?.querySelector('.principles-intro-stage');
  const introRows = principles ? [...principles.querySelectorAll('.principles-intro-row')] : [];
  const introEnglish = introRows.map(row => [...row.querySelectorAll('.principles-intro-en .fill-char')]);
  const introKorean = introRows.map(row => [...row.querySelectorAll('.principles-intro-ko .fill-char')]);

  const cardsStage = principles?.querySelector('.principles-cards-stage');
  const cardsGrid = principles?.querySelector('.principles-grid');
  const cards = principles ? [...principles.querySelectorAll('.principle-card')] : [];
  const cardKoreanChars = cards.map(card => [...card.querySelectorAll('.principle-ko .fill-char')]);
  const cardEnglishChars = cards.map(card => [...card.querySelectorAll('.principle-en .fill-char')]);

  document.querySelectorAll('.principle-ko .fill-char, .showcase-project h3 .fill-char').forEach(char => {
    if (char.textContent === ' ') char.classList.add('test-space');
  });
  cards.forEach(card => card.classList.add('test-timeline-card'));

  const entriesFor = chars => {
    let index = 0;
    return chars.map(char => {
      const visible = char.textContent.trim().length > 0;
      return { char, index: visible ? index++ : -1 };
    });
  };

  const clearPaint = chars => {
    chars.forEach(char => {
      char.classList.remove(
        'test-managed-char',
        'test-progressive-pending',
        'test-progressive-scramble',
        'test-progressive-resolved'
      );
      delete char.dataset.testScramble;
      char.style.removeProperty('--test-rgb');
      char.style.removeProperty('--test-final-alpha');
      char.style.removeProperty('--test-scramble-alpha');
    });
  };

  const paintState = (char, state, rgb, glyph = '', alpha = 1, finalAlpha = 1) => {
    char.classList.add('test-managed-char');
    char.classList.remove(
      'test-progressive-pending',
      'test-progressive-scramble',
      'test-progressive-resolved'
    );
    char.style.setProperty('--test-rgb', rgb);
    char.style.setProperty('--test-final-alpha', String(finalAlpha));

    if (state === 'pending') {
      char.classList.add('test-progressive-pending');
      delete char.dataset.testScramble;
      char.style.removeProperty('--test-scramble-alpha');
    } else if (state === 'scramble') {
      char.classList.add('test-progressive-scramble');
      char.dataset.testScramble = glyph;
      char.style.setProperty('--test-scramble-alpha', String(alpha));
    } else {
      char.classList.add('test-progressive-resolved');
      delete char.dataset.testScramble;
      char.style.removeProperty('--test-scramble-alpha');
    }
  };

  const paintProgressiveReveal = (
    chars,
    progress,
    rgb,
    { span = 1, cycles = 3, finalAlpha = 1 } = {}
  ) => {
    const entries = entriesFor(chars);
    const count = entries.reduce((n, entry) => n + (entry.index >= 0 ? 1 : 0), 0) || 1;
    const sweep = easeInOut(clamp(progress)) * (count + span);

    entries.forEach(({ char, index }) => {
      if (index < 0) return;
      const local = (sweep - index) / span;
      if (local <= 0) {
        paintState(char, 'pending', rgb, '', 0, finalAlpha);
      } else if (local < 1) {
        const cycle = Math.min(cycles - 1, Math.floor(clamp(local) * cycles));
        paintState(char, 'scramble', rgb, randomGlyph(index, cycle), 1, finalAlpha);
      } else {
        paintState(char, 'resolved', rgb, '', 1, finalAlpha);
      }
    });
  };

  const paintProgressiveErase = (
    chars,
    progress,
    rgb,
    { span = 1.6, cycles = 3, finalAlpha = 1 } = {}
  ) => {
    const entries = entriesFor(chars);
    const count = entries.reduce((n, entry) => n + (entry.index >= 0 ? 1 : 0), 0) || 1;
    const sweep = easeInOut(clamp(progress)) * (count + span);

    entries.forEach(({ char, index }) => {
      if (index < 0) return;
      const local = (sweep - index) / span;
      if (local <= 0) {
        paintState(char, 'resolved', rgb, '', 1, finalAlpha);
      } else if (local < 1) {
        const cycle = Math.min(cycles - 1, Math.floor(clamp(local) * cycles));
        paintState(char, 'scramble', rgb, randomGlyph(index, cycle + 3), 1, finalAlpha);
      } else {
        paintState(char, 'pending', rgb, '', 0, finalAlpha);
      }
    });
  };

  let heroStarted = scrollY > 8;

  const updateHero = () => {
    if (!hero || !quoteChars.length) return;
    if (!heroStarted) {
      clearPaint(quoteChars);
      return;
    }
    const travel = Math.max(1, hero.offsetHeight - innerHeight);
    const progress = clamp((scrollY - absoluteTop(hero)) / travel);
    const quoteProgress = phaseProgress(progress, 0, 0.095);
    if (quoteProgress < 0.999) {
      paintProgressiveReveal(quoteChars, quoteProgress, '17,17,17', { span: 1, cycles: 3 });
    } else {
      clearPaint(quoteChars);
    }
  };

  const getPhilosophyProgress = () => {
    if (!philosophy || !philosophySticky) return 0;
    const stickyTop = innerHeight * (innerWidth <= 850 ? 0.14 : 0.18);
    const travel = Math.max(1, philosophy.offsetHeight - philosophySticky.offsetHeight - stickyTop);
    return clamp((scrollY + stickyTop - absoluteTop(philosophy)) / travel);
  };

  const updatePhilosophy = () => {
    if (!philosophyChars.length) return;
    const p = getPhilosophyProgress();
    paintProgressiveReveal(
      philosophyChars,
      phaseProgress(p, 0.02, 0.92),
      '17,17,17',
      { span: 2.4, cycles: 3 }
    );
  };

  const getIntroProgress = () => {
    if (!introStage) return 0;
    const travel = Math.max(1, introStage.offsetHeight - innerHeight);
    return clamp((scrollY - absoluteTop(introStage)) / travel);
  };

  const updatePrinciplesIntro = () => {
    if (!introRows.length) return;
    const p = getIntroProgress();

    introRows.forEach((row, index) => {
      /* Force every LESS row to stay at its authored coordinates. */
      row.style.setProperty('transform', 'none');
      const enNode = row.querySelector('.principles-intro-en');
      const koNode = row.querySelector('.principles-intro-ko');
      enNode?.style.setProperty('transform', 'none');
      koNode?.style.setProperty('transform', 'none');

      /* All English rows finish before the first Korean row starts. */
      const englishStart = index * 0.055;
      const englishEnd = 0.23 + index * 0.055;
      const englishProgress = phaseProgress(p, englishStart, englishEnd);

      /* Korean morph starts only after the English hold has finished. */
      const morphStart = PRINCIPLES_TIMING.englishHoldEnd + index * 0.055;
      const morphEnd = 0.70 + index * 0.06;
      const morphProgress = phaseProgress(p, morphStart, morphEnd);

      if (p < PRINCIPLES_TIMING.englishHoldEnd) {
        paintProgressiveReveal(introEnglish[index], englishProgress, '255,255,255', {
          span: 2.35,
          cycles: 3
        });
        paintProgressiveReveal(introKorean[index], 0, '255,255,255', {
          span: 2.4,
          cycles: 3
        });
        return;
      }

      if (p < PRINCIPLES_TIMING.koreanMorphEnd) {
        paintProgressiveErase(introEnglish[index], morphProgress, '255,255,255', {
          span: 2.2,
          cycles: 3
        });
        paintProgressiveReveal(introKorean[index], morphProgress, '255,255,255', {
          span: 2.75,
          cycles: 3
        });
        return;
      }

      /* Final Korean hold: no further glyph changes until the sticky stage ends. */
      paintProgressiveErase(introEnglish[index], 1, '255,255,255', {
        span: 2.2,
        cycles: 3
      });
      paintProgressiveReveal(introKorean[index], 1, '255,255,255', {
        span: 2.75,
        cycles: 3
      });
    });
  };

  const setEnglishAlpha = (index, progress) => {
    const alpha = 0.05 + (0.70 - 0.05) * clamp(progress);
    (cardEnglishChars[index] || []).forEach(char => {
      char.style.setProperty('--test-en-alpha', alpha.toFixed(3));
    });
  };

  const CARD_PHASES = Object.freeze([
    {
      enterStart: 0.00,
      enterEnd: 0.06,
      titleStart: 0.01,
      titleEnd: slowEnd(0.01, 0.32, PRINCIPLES_CARD_SLOWDOWN),
      enStart: 0.24,
      enEnd: 0.34
    },
    {
      enterStart: 0.34,
      enterEnd: 0.40,
      titleStart: 0.40,
      titleEnd: slowEnd(0.40, 0.64, PRINCIPLES_CARD_SLOWDOWN),
      enStart: 0.56,
      enEnd: 0.66
    },
    {
      enterStart: 0.66,
      enterEnd: 0.72,
      titleStart: 0.72,
      titleEnd: slowEnd(0.72, 0.94, PRINCIPLES_CARD_SLOWDOWN),
      enStart: 0.88,
      enEnd: 1.00
    }
  ]);

  const updateCards = () => {
    if (!cardsStage || !cardsGrid || !cards.length) return;
    const stageTop = absoluteTop(cardsStage);
    const stickyTop = parseFloat(getComputedStyle(cardsGrid).top) ||
      (innerWidth <= 850 ? 70 : innerHeight * 0.12);
    const approachStartY = stageTop - innerHeight;
    const lockY = stageTop - stickyTop;
    const approachProgress = phaseProgress(scrollY, approachStartY, lockY);
    const stickyHold = Math.max(1, cardsStage.offsetHeight - cardsGrid.offsetHeight);
    const holdProgress = phaseProgress(scrollY, lockY, lockY + stickyHold);
    const timelineProgress = scrollY < lockY
      ? approachProgress * 0.20
      : 0.20 + holdProgress * 0.80;

    cards.forEach((card, index) => {
      const phase = CARD_PHASES[index];
      if (!phase) return;
      const enterProgress = easeInOut(
        phaseProgress(timelineProgress, phase.enterStart, phase.enterEnd)
      );
      const titleProgress = phaseProgress(
        timelineProgress,
        phase.titleStart,
        phase.titleEnd
      );
      const englishProgress = phaseProgress(
        timelineProgress,
        phase.enStart,
        phase.enEnd
      );
      card.style.setProperty('--test-card-opacity', enterProgress.toFixed(4));
      paintProgressiveReveal(cardKoreanChars[index], titleProgress, '255,255,255', {
        span: 2.4,
        cycles: 3
      });
      setEnglishAlpha(index, englishProgress);
    });
  };

  let raf = 0;
  const update = () => {
    raf = 0;
    updateHero();
    updatePhilosophy();
    updatePrinciplesIntro();
    updateCards();
  };
  const requestUpdate = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  const startHeroSequence = event => {
    if (event && event.isTrusted === false) return;
    heroStarted = true;
    requestUpdate();
  };

  addEventListener('wheel', startHeroSequence, { passive: true });
  addEventListener('touchstart', startHeroSequence, { passive: true });
  addEventListener('pointerdown', startHeroSequence, { passive: true });
  addEventListener('keydown', startHeroSequence);
  addEventListener('scroll', () => {
    if (scrollY > 8) heroStarted = true;
    requestUpdate();
  }, { passive: true });
  addEventListener('resize', requestUpdate, { passive: true });

  update();
  body?.classList.add('home-test-ready');

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(requestUpdate)).catch(() => {});
  }
})();
