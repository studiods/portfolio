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

  /*
    A single reveal model is used throughout the test home:
    invisible -> three A-Z states -> authored character.
    span=1 keeps the hero strictly one-character-at-a-time; larger spans make
    Philosophy/Principles readable without making the random state flash by.
  */
  const paintProgressiveReveal = (
    chars,
    progress,
    rgb,
    { span = 1, cycles = 3, finalAlpha = 1 } = {}
  ) => {
    const entries = entriesFor(chars);
    const count = entries.reduce((n, entry) => n + (entry.index >= 0 ? 1 : 0), 0) || 1;
    const p = clamp(progress);
    const sweep = easeInOut(p) * (count + span);

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
    const p = clamp(progress);
    const sweep = easeInOut(p) * (count + span);

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
      /* Leave the resting quote to home-idle-v2.js so the existing idle cue is unchanged. */
      clearPaint(quoteChars);
      return;
    }

    const travel = Math.max(1, hero.offsetHeight - innerHeight);
    const progress = clamp((scrollY - absoluteTop(hero)) / travel);
    const quoteProgress = phaseProgress(progress, 0, 0.095);

    if (quoteProgress < 0.999) {
      paintProgressiveReveal(quoteChars, quoteProgress, '17,17,17', { span: 1, cycles: 3 });
    } else {
      /* Give control back to the production morph after the first sentence is complete. */
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
    /* Use nearly the full sticky runway so the A-Z states remain legible. */
    const revealProgress = phaseProgress(p, 0.02, 0.92);
    paintProgressiveReveal(philosophyChars, revealProgress, '17,17,17', {
      span: 2.4,
      cycles: 3
    });
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
      const englishProgress = fillProgress(p, index * 0.065, 0.11);
      const morphProgress = phaseProgress(
        p,
        0.28 + index * 0.12,
        0.47 + index * 0.12
      );

      if (morphProgress <= 0) {
        paintProgressiveReveal(introEnglish[index], englishProgress, '255,255,255', {
          span: 2.1,
          cycles: 3
        });
        paintProgressiveReveal(introKorean[index], 0, '255,255,255', {
          span: 2.2,
          cycles: 3
        });
      } else {
        paintProgressiveErase(introEnglish[index], morphProgress, '255,255,255', {
          span: 1.8,
          cycles: 3
        });
        paintProgressiveReveal(introKorean[index], phaseProgress(morphProgress, 0.04, 1), '255,255,255', {
          span: 2.4,
          cycles: 3
        });
      }
    });
  };

  const setEnglishAlpha = (index, progress) => {
    const alpha = 0.05 + (0.70 - 0.05) * clamp(progress);
    (cardEnglishChars[index] || []).forEach(char => {
      char.style.setProperty('--test-en-alpha', alpha.toFixed(3));
    });
  };

  const CARD_PHASES = Object.freeze([
    { enterStart: 0.00, enterEnd: 0.12, titleStart: 0.12, titleEnd: 0.34, enStart: 0.24, enEnd: 0.34 },
    { enterStart: 0.34, enterEnd: 0.42, titleStart: 0.42, titleEnd: 0.64, enStart: 0.54, enEnd: 0.64 },
    { enterStart: 0.64, enterEnd: 0.72, titleStart: 0.72, titleEnd: 0.94, enStart: 0.84, enEnd: 0.94 }
  ]);

  const updateCards = () => {
    if (!introStage || !cardsStage || !cards.length) return;

    const introTop = absoluteTop(introStage);
    const introTravel = Math.max(1, introStage.offsetHeight - innerHeight);
    /* Start exactly when the completed Korean intro begins to release. */
    const startY = introTop + introTravel;
    const timelineTravel = Math.max(1, innerHeight * (innerWidth <= 850 ? 1.45 : 1.28));
    const p = clamp((scrollY - startY) / timelineTravel);
    const riseDistance = Math.min(110, innerHeight * 0.14);

    cards.forEach((card, index) => {
      const phase = CARD_PHASES[index];
      if (!phase) return;

      const enterProgress = easeInOut(phaseProgress(p, phase.enterStart, phase.enterEnd));
      const titleProgress = phaseProgress(p, phase.titleStart, phase.titleEnd);
      const englishProgress = phaseProgress(p, phase.enStart, phase.enEnd);

      card.style.setProperty('--test-card-opacity', enterProgress.toFixed(4));
      card.style.setProperty('--test-card-y', `${(riseDistance * (1 - enterProgress)).toFixed(2)}px`);

      if (titleProgress <= 0) {
        paintProgressiveReveal(cardKoreanChars[index], 0, '255,255,255', {
          span: 2.2,
          cycles: 3
        });
      } else {
        paintProgressiveReveal(cardKoreanChars[index], titleProgress, '255,255,255', {
          span: 2.4,
          cycles: 3
        });
      }
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

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(requestUpdate)).catch(() => {});
  }

  /* Baseline deferred script has already split all characters. */
  update();
  body?.classList.add('home-test-ready');
})();
