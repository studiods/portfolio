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
  const absoluteTop = el => el ? el.getBoundingClientRect().top + scrollY : 0;
  const SCRAMBLE_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomGlyph = (index, step) =>
    SCRAMBLE_POOL[(index * 17 + step * 13) % SCRAMBLE_POOL.length];

  const body = document.body;
  const hero = document.querySelector('#heroSequence');
  const quoteChars = hero ? [...hero.querySelectorAll('.hero-quote .fill-char')] : [];
  const quoteVisibleChars = quoteChars.filter(char => char.textContent.trim().length > 0);

  const principles = document.querySelector('#principles');
  const cardsStage = principles?.querySelector('.principles-cards-stage');
  const cardsGrid = principles?.querySelector('.principles-grid');
  const cards = principles ? [...principles.querySelectorAll('.principle-card')] : [];
  const cardKoreanChars = cards.map(card => [...card.querySelectorAll('.principle-ko .fill-char')]);
  const cardEnglishChars = cards.map(card => [...card.querySelectorAll('.principle-en .fill-char')]);

  /* Preserve real word spacing without changing text nodes or replacing spaces. */
  document.querySelectorAll('.principle-ko .fill-char, .showcase-project h3 .fill-char').forEach(char => {
    if (char.textContent === ' ') char.classList.add('test-space');
  });

  cards.forEach(card => card.classList.add('test-timeline-card'));

  const clearHeroPreScramble = () => {
    quoteVisibleChars.forEach(char => {
      char.classList.remove('test-hero-pre-scramble');
      delete char.dataset.testScramble;
    });
  };

  let heroStarted = scrollY > 8;

  const updateHero = () => {
    if (!hero || !quoteVisibleChars.length || !heroStarted) {
      clearHeroPreScramble();
      return;
    }

    const travel = Math.max(1, hero.offsetHeight - innerHeight);
    const progress = clamp((scrollY - absoluteTop(hero)) / travel);
    const quoteProgress = phaseProgress(progress, 0, 0.095);

    if (quoteProgress >= 0.999) {
      clearHeroPreScramble();
      return;
    }

    const count = quoteVisibleChars.length || 1;
    const sweep = easeInOut(quoteProgress) * count;
    const step = Math.floor(quoteProgress * count * 0.35);

    quoteVisibleChars.forEach((char, index) => {
      const local = clamp(sweep - index);
      if (local <= 0) {
        char.classList.add('test-hero-pre-scramble');
        char.dataset.testScramble = randomGlyph(index, step);
      } else {
        char.classList.remove('test-hero-pre-scramble');
        delete char.dataset.testScramble;
      }
    });
  };

  const setCardCopyState = (index, titleProgress, hasStarted) => {
    const chars = cardKoreanChars[index] || [];
    const visible = chars.filter(char => char.textContent.trim().length > 0);
    const count = visible.length || 1;
    const p = clamp(titleProgress);
    const sweep = easeInOut(p) * count;
    const step = Math.floor(p * count * 5);
    let visibleIndex = 0;

    chars.forEach(char => {
      const isSpace = char.textContent.trim().length === 0;
      char.classList.remove('test-card-pending', 'test-card-scramble', 'test-card-resolved');

      if (!hasStarted) {
        char.classList.add('test-card-pending');
        delete char.dataset.testScramble;
        char.style.removeProperty('--test-scramble-alpha');
        return;
      }

      if (isSpace) {
        if (p < 1) char.classList.add('test-card-pending');
        else char.classList.add('test-card-resolved');
        return;
      }

      const indexInCopy = visibleIndex++;
      const local = clamp(sweep - indexInCopy);

      if (p <= 0 || local <= 0) {
        char.classList.add('test-card-scramble');
        char.dataset.testScramble = randomGlyph(indexInCopy, step);
        char.style.setProperty('--test-scramble-alpha', p <= 0 ? '.16' : '.35');
      } else if (local < 0.82) {
        const cycle = Math.min(2, Math.floor((local / 0.82) * 3));
        char.classList.add('test-card-scramble');
        char.dataset.testScramble = randomGlyph(indexInCopy, cycle + step);
        char.style.setProperty('--test-scramble-alpha', '1');
      } else {
        char.classList.add('test-card-resolved');
        delete char.dataset.testScramble;
        char.style.removeProperty('--test-scramble-alpha');
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
    { titleStart: 0.00, titleEnd: 0.20, enStart: 0.10, enEnd: 0.20 },
    { enterStart: 0.20, enterEnd: 0.25, titleStart: 0.25, titleEnd: 0.45, enStart: 0.35, enEnd: 0.45 },
    { enterStart: 0.45, enterEnd: 0.50, titleStart: 0.50, titleEnd: 0.70, enStart: 0.60, enEnd: 0.70 }
  ]);

  const updateCards = () => {
    if (!cardsStage || !cardsGrid || !cards.length) return;

    const stageTop = absoluteTop(cardsStage);
    const stickyTop = parseFloat(getComputedStyle(cardsGrid).top) || innerHeight * 0.08;
    const stickY = stageTop - stickyTop;
    const entryDistance = Math.min(260, innerHeight * 0.30);
    const firstEntry = easeInOut(phaseProgress(scrollY, stickY - entryDistance, stickY));
    const timelineTravel = Math.max(1, innerHeight * 1.20);
    const p = clamp((scrollY - stickY) / timelineTravel);

    cards.forEach((card, index) => {
      const phase = CARD_PHASES[index];
      if (!phase) return;

      let enterProgress = 0;
      if (index === 0) {
        enterProgress = firstEntry;
      } else {
        enterProgress = easeInOut(phaseProgress(p, phase.enterStart, phase.enterEnd));
      }

      card.style.setProperty('--test-card-opacity', enterProgress.toFixed(4));
      card.style.setProperty('--test-card-y', `${(24 * (1 - enterProgress)).toFixed(2)}px`);

      const titleProgress = phaseProgress(p, phase.titleStart, phase.titleEnd);
      const englishProgress = phaseProgress(p, phase.enStart, phase.enEnd);
      const titleStarted = index === 0 ? scrollY >= stickY : p >= phase.titleStart;
      setCardCopyState(index, titleProgress, titleStarted);
      setEnglishAlpha(index, englishProgress);
    });
  };

  let raf = 0;
  const update = () => {
    raf = 0;
    updateHero();
    updateCards();
  };
  const requestUpdate = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  const startHeroSequence = () => {
    if (!heroStarted) heroStarted = true;
    requestUpdate();
  };

  addEventListener('wheel', startHeroSequence, { passive: true });
  addEventListener('touchstart', startHeroSequence, { passive: true });
  addEventListener('keydown', startHeroSequence);
  addEventListener('scroll', () => {
    if (scrollY > 8) heroStarted = true;
    requestUpdate();
  }, { passive: true });
  addEventListener('resize', requestUpdate, { passive: true });

  /* Baseline deferred scripts have already split the characters at this point. */
  update();
  body?.classList.add('home-test-ready');
})();
