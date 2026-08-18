(() => {
  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const $ = (s, root = document) => root ? root.querySelector(s) : null;
  const $$ = (s, root = document) => root ? [...root.querySelectorAll(s)] : [];

  const FILL_SLOWDOWN = 1.452;
  const FILL_FEATHER = 4;
  const styleCache = new WeakMap();

  const setStyle = (el, property, value) => {
    if (!el) return;
    let cache = styleCache.get(el);
    if (!cache) {
      cache = Object.create(null);
      styleCache.set(el, cache);
    }
    if (cache[property] === value) return;
    cache[property] = value;
    el.style[property] = value;
  };

  const setAttribute = (el, name, value) => {
    if (el && el.getAttribute(name) !== value) el.setAttribute(name, value);
  };

  const fillProgress = (value, start, duration) =>
    clamp((value - start) / (duration * FILL_SLOWDOWN));

  const phaseProgress = (value, start, end) => {
    if (end <= start) return value >= end ? 1 : 0;
    return clamp((value - start) / (end - start));
  };

  const easeInOut = (value) => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };

  try {
    const nav = performance.getEntriesByType('navigation')[0];
    const isBackForward = nav && nav.type === 'back_forward';
    if (!location.hash && !isBackForward) {
      history.scrollRestoration = 'manual';
      const scroller = document.scrollingElement;
      if (scroller) scroller.scrollTop = 0;
    }
  } catch (_) {}

  const splitChars = (el) => {
    if (!el || el.dataset.split === '1') return;
    el.dataset.split = '1';
    [...el.childNodes].forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        [...node.textContent].forEach(ch => {
          const span = document.createElement('span');
          span.className = 'fill-char';
          span.textContent = ch;
          frag.appendChild(span);
        });
        node.replaceWith(frag);
      } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('fill-char')) {
        splitChars(node);
      }
    });
  };

  /* Feathered fill remains for sections below the hero. */
  const setChars = (chars, progress, rgb = '17,17,17', baseAlpha = 0.05) => {
    const n = chars.length || 1;
    const sweep = progress * Math.max(1, n - 1 + FILL_FEATHER);
    chars.forEach((char, i) => {
      const local = clamp((sweep - i) / FILL_FEATHER);
      const alpha = (baseAlpha + (1 - baseAlpha) * local).toFixed(3);
      setStyle(char, 'color', `rgba(${rgb},${alpha})`);
    });
  };

  /*
    Hero fill: one visible character owns the transition at a time. Characters
    already passed by the scroll sweep stay at full black; characters ahead
    remain at the base alpha. This keeps the effect deterministic and tied to
    scroll distance rather than elapsed time or wheel-event interception.
  */
  const setCharsOneByOne = (
    chars,
    progress,
    rgb = '17,17,17',
    baseAlpha = 0.05,
    maxAlpha = 1
  ) => {
    const visibleChars = chars.filter(char => char.textContent.trim().length > 0);
    const n = visibleChars.length || 1;
    const sweep = clamp(progress) * n;
    visibleChars.forEach((char, i) => {
      const local = clamp(sweep - i);
      const alpha = (baseAlpha + (maxAlpha - baseAlpha) * local).toFixed(3);
      setStyle(char, 'color', `rgba(${rgb},${alpha})`);
    });
  };

  const setWhole = (els, progress, rgb = '17,17,17', baseAlpha = 0.05) => {
    const alpha = (baseAlpha + (1 - baseAlpha) * clamp(progress)).toFixed(3);
    els.forEach(el => setStyle(el, 'color', `rgba(${rgb},${alpha})`));
  };

  $$('.js-char-fill').forEach(splitChars);

  const hero = $('#heroSequence');
  const quoteState = $('.hero-state-quote', hero);
  const quoteLines = $$('.hero-quote > span', hero);
  const sourceOnly = $('.quote-source-only', hero);
  const definition = $('.hero-state-definition', hero);
  const definitionSource = $('.definition-source', hero);
  const subState = $('.hero-state-subtractive', hero);
  const subLines = $$('.subtractive-korean .fill-line', hero);
  subLines.forEach(splitChars);

  const quoteChars = $$('.hero-quote .fill-char', hero);
  const definitionChars = $$('.definition-copy .fill-char', hero);
  const definitionSourceChars = $$('.definition-source .fill-char', hero);
  const subChars = $$('.subtractive-title .fill-char', hero);
  const subKoreanChars = $$('.subtractive-korean .fill-char', hero);
  const quoteLineChars = quoteLines.map(line => $$('.fill-char', line));

  /*
    Keep the deployed hero travel unchanged. Small source/caption fill phases
    are carved out of their existing hold windows: the Korean Hofmann credit
    fills immediately after the definition, and the Korean subtractive caption
    fills only after SUBTRACTIVE DESIGN is completely black. This preserves all
    section-height math and the natural sticky release into Design philosophy.
  */
  const HERO_FILL_SCALE = 1.21;
  const SUBTRACTIVE_FILL_SCALE = 1.30;
  const HERO_PHASE = Object.freeze({
    quoteFill: 0.13 * HERO_FILL_SCALE,
    quoteHold: 0.24,
    quoteExit: 0.13,
    defEnter: 0.09,
    defFill: 0.12 * HERO_FILL_SCALE,
    defSourceFill: 0.04,
    defHold: 0.20,
    defExit: 0.13,
    subEnter: 0.08,
    subFill: 0.13 * HERO_FILL_SCALE * SUBTRACTIVE_FILL_SCALE,
    subCaptionFill: 0.10,
    subHold: 0.30,
    subExit: 0
  });

  const HERO_TOTAL = Object.values(HERO_PHASE).reduce((sum, value) => sum + value, 0);
  const heroPhase = key => HERO_PHASE[key] / HERO_TOTAL;
  let heroCursor = 0;

  const HERO = Object.freeze({
    quoteFillStart: heroCursor,
    quoteFillEnd: (heroCursor += heroPhase('quoteFill')),
    quoteHoldEnd: (heroCursor += heroPhase('quoteHold')),
    quoteExitEnd: (heroCursor += heroPhase('quoteExit')),

    defEnterEnd: (heroCursor += heroPhase('defEnter')),
    defFillEnd: (heroCursor += heroPhase('defFill')),
    defSourceFillEnd: (heroCursor += heroPhase('defSourceFill')),
    defHoldEnd: (heroCursor += heroPhase('defHold')),
    defExitEnd: (heroCursor += heroPhase('defExit')),

    subEnterEnd: (heroCursor += heroPhase('subEnter')),
    subFillEnd: (heroCursor += heroPhase('subFill')),
    subCaptionFillEnd: (heroCursor += heroPhase('subCaptionFill')),
    subHoldEnd: (heroCursor += heroPhase('subHold')),
    subExitEnd: (heroCursor += heroPhase('subExit'))
  });

  const exitOpacity = progress => {
    const p = clamp(progress);
    const EARLY_END = 0.10;
    const EARLY_OPACITY = 0.56;

    if (p <= 0) return 1;
    if (p < EARLY_END) {
      const t = p / EARLY_END;
      const fastDrop = 1 - Math.pow(1 - t, 4);
      return 1 - (1 - EARLY_OPACITY) * fastDrop;
    }

    const tail = (p - EARLY_END) / (1 - EARLY_END);
    return Math.max(0, EARLY_OPACITY * (1 - Math.pow(tail, 1.4)));
  };

  const renderEnter = (state, progress) => {
    const raw = clamp(progress);
    const p = easeInOut(raw);
    const distance = Math.min(innerHeight * 0.12, 140);
    const opacity = 1 - Math.pow(1 - raw, 1.65);
    setStyle(state, 'opacity', opacity.toFixed(4));
    setStyle(state, 'transform', `translate3d(0, ${(-(1 - p) * distance).toFixed(2)}px, 0)`);
    setStyle(state, 'clipPath', 'none');
  };

  const renderExit = (state, progress) => {
    const raw = clamp(progress);
    const distance = Math.min(innerHeight * 0.18, 190);
    const easedMove = 1 - Math.pow(1 - raw, 1.6);
    setStyle(state, 'opacity', exitOpacity(raw).toFixed(4));
    setStyle(state, 'transform', `translate3d(0, ${(easedMove * distance).toFixed(2)}px, 0)`);
    setStyle(state, 'clipPath', 'none');
  };

  const renderHero = (p) => {
    if (!hero || !quoteState || !definition || !subState) return;

    setCharsOneByOne(
      quoteChars,
      phaseProgress(p, HERO.quoteFillStart, HERO.quoteFillEnd)
    );

    const quoteSourceStart = HERO.quoteFillStart +
      (HERO.quoteFillEnd - HERO.quoteFillStart) * 0.62;
    setWhole(
      sourceOnly ? [sourceOnly] : [],
      phaseProgress(p, quoteSourceStart, HERO.quoteFillEnd)
    );

    const quoteExit = phaseProgress(p, HERO.quoteHoldEnd, HERO.quoteExitEnd);
    renderExit(quoteState, quoteExit);
    setAttribute(quoteState, 'aria-hidden', quoteExit >= 0.999 ? 'true' : 'false');

    const defEnter = phaseProgress(p, HERO.quoteExitEnd, HERO.defEnterEnd);
    const defExit = phaseProgress(p, HERO.defHoldEnd, HERO.defExitEnd);

    if (p < HERO.defHoldEnd) {
      renderEnter(definition, defEnter);
    } else {
      renderExit(definition, defExit);
    }

    setCharsOneByOne(
      definitionChars,
      phaseProgress(p, HERO.defEnterEnd, HERO.defFillEnd)
    );
    setCharsOneByOne(
      definitionSourceChars,
      phaseProgress(p, HERO.defFillEnd, HERO.defSourceFillEnd)
    );

    setAttribute(
      definition,
      'aria-hidden',
      defEnter <= 0.001 || defExit >= 0.999 ? 'true' : 'false'
    );

    const subEnter = phaseProgress(p, HERO.defExitEnd, HERO.subEnterEnd);

    /*
      Keep the final state fully rendered after it has entered. There is no
      translate-down/fade-out phase; CSS sticky containment performs the exit
      naturally as the hero section itself scrolls upward off the viewport.
    */
    renderEnter(subState, subEnter);

    setCharsOneByOne(
      subChars,
      phaseProgress(p, HERO.subEnterEnd, HERO.subFillEnd)
    );
    setCharsOneByOne(
      subKoreanChars,
      phaseProgress(p, HERO.subFillEnd, HERO.subCaptionFillEnd)
    );

    setAttribute(
      subState,
      'aria-hidden',
      subEnter <= 0.001 ? 'true' : 'false'
    );
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /*
    Initial-page idle cue. It is intentionally isolated from the scroll-driven
    hero timeline: the cue only runs while the page has never been interacted
    with and the hero progress is still at zero. Any user interaction cancels
    it permanently for that page view, so it can never fight the scroll scrub.

    Pattern order is a ping-pong sequence: 1 > 2 > 3 > 2 > 1 > 2 > 3 ...
    Pattern 1: words in reading order, 5% -> 50% -> 5%, 1s per word.
    Pattern 2: lines in reading order, 5% -> 30% -> 5%, 1s per line.
    Pattern 3: every word once in a fresh random order, same 50% pulse.
    There is a 3s idle gap before the first pattern and between patterns.
  */
  const IDLE_DELAY_MS = 3000;
  const IDLE_UNIT_MS = 1000;
  const IDLE_BASE_ALPHA = 0.05;
  const IDLE_WORD_PEAK_ALPHA = 0.50;
  const IDLE_LINE_PEAK_ALPHA = 0.30;
  const IDLE_PATTERN_ORDER = Object.freeze(['words', 'lines', 'randomWords', 'lines']);

  const quoteWordGroups = [];
  quoteLineChars.forEach(chars => {
    let word = [];
    const flushWord = () => {
      if (!word.length) return;
      quoteWordGroups.push(word);
      word = [];
    };

    chars.forEach(char => {
      if (char.textContent.trim().length > 0) {
        word.push(char);
      } else {
        flushWord();
      }
    });
    flushWord();
  });

  const shuffleUnits = units => {
    const copy = units.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  let idleTimer = 0;
  let idleRaf = 0;
  let idlePatternStartedAt = 0;
  let idlePatternIndex = 0;
  let idleUnits = [];
  let idlePeakAlpha = IDLE_WORD_PEAK_ALPHA;
  let idleDisabled = false;

  const heroIsAtRest = () => hero && getHeroProgress() < 0.002;

  const paintQuoteBase = () => {
    quoteChars.forEach(char => {
      setStyle(char, 'color', `rgba(17,17,17,${IDLE_BASE_ALPHA.toFixed(3)})`);
    });
    setWhole(sourceOnly ? [sourceOnly] : [], 0);
  };

  const paintIdleUnit = (chars, alpha) => {
    chars.forEach(char => {
      if (char.textContent.trim().length > 0) {
        setStyle(char, 'color', `rgba(17,17,17,${alpha.toFixed(3)})`);
      }
    });
  };

  const idlePulseAlpha = (localProgress, peakAlpha) => {
    const local = clamp(localProgress);
    const pulse = local < 0.5
      ? easeInOut(local * 2)
      : easeInOut((1 - local) * 2);
    return IDLE_BASE_ALPHA + (peakAlpha - IDLE_BASE_ALPHA) * pulse;
  };

  const stopIdleCue = (restore = true) => {
    if (idleTimer) clearTimeout(idleTimer);
    if (idleRaf) cancelAnimationFrame(idleRaf);
    idleTimer = 0;
    idleRaf = 0;
    idlePatternStartedAt = 0;
    idleUnits = [];
    if (restore && heroIsAtRest()) paintQuoteBase();
  };

  const prepareIdlePattern = () => {
    const mode = IDLE_PATTERN_ORDER[idlePatternIndex];
    if (mode === 'lines') {
      idleUnits = quoteLineChars.map(chars => chars.filter(char => char.textContent.trim().length > 0));
      idlePeakAlpha = IDLE_LINE_PEAK_ALPHA;
    } else if (mode === 'randomWords') {
      idleUnits = shuffleUnits(quoteWordGroups);
      idlePeakAlpha = IDLE_WORD_PEAK_ALPHA;
    } else {
      idleUnits = quoteWordGroups.slice();
      idlePeakAlpha = IDLE_WORD_PEAK_ALPHA;
    }
  };

  const scheduleIdleCue = (delay = IDLE_DELAY_MS) => {
    if (reducedMotion || idleDisabled || !quoteWordGroups.length || document.hidden) return;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      idleTimer = 0;
      if (idleDisabled || !heroIsAtRest() || document.hidden) return;
      prepareIdlePattern();
      paintQuoteBase();
      idlePatternStartedAt = performance.now();
      idleRaf = requestAnimationFrame(runIdleCue);
    }, delay);
  };

  const runIdleCue = now => {
    if (idleDisabled || !heroIsAtRest() || document.hidden) {
      stopIdleCue(true);
      return;
    }

    const elapsed = now - idlePatternStartedAt;
    const totalDuration = Math.max(1, idleUnits.length) * IDLE_UNIT_MS;

    if (elapsed >= totalDuration) {
      paintQuoteBase();
      idleRaf = 0;
      idlePatternStartedAt = 0;
      idleUnits = [];
      idlePatternIndex = (idlePatternIndex + 1) % IDLE_PATTERN_ORDER.length;
      scheduleIdleCue(IDLE_DELAY_MS);
      return;
    }

    const unitIndex = Math.min(idleUnits.length - 1, Math.floor(elapsed / IDLE_UNIT_MS));
    const localProgress = (elapsed - unitIndex * IDLE_UNIT_MS) / IDLE_UNIT_MS;

    /* Reset first so skipped animation frames can never leave a prior unit lit. */
    paintQuoteBase();
    paintIdleUnit(idleUnits[unitIndex], idlePulseAlpha(localProgress, idlePeakAlpha));
    idleRaf = requestAnimationFrame(runIdleCue);
  };

  const registerUserAction = () => {
    if (idleDisabled) return;
    idleDisabled = true;
    stopIdleCue(true);
  };

  const philosophySection = $('#philosophy');
  const philosophySticky = $('.philosophy-sticky', philosophySection);
  const philosophyLines = $$('.philosophy-statements > p', philosophySection);

  const renderPhilosophy = (p, fillEnd) => {
    if (!philosophySection || !philosophySticky || !philosophyLines.length) return;

    const fillP = clamp(p / fillEnd);
    const lineCount = philosophyLines.length;
    const lineWindow = 1 / lineCount;

    philosophyLines.forEach((line, index) => {
      const lineStart = index * lineWindow;
      const lineProgress = clamp((fillP - lineStart) / lineWindow);
      const alpha = (0.05 + 0.95 * lineProgress).toFixed(3);
      setStyle(line, 'color', `rgba(17,17,17,${alpha})`);
    });
  };

  const principles = $('#principles');
  const principleIntroStage = $('.principles-intro-stage', principles);
  const principleRows = $$('.principles-intro-row', principles);
  const principleRowEnglish = principleRows.map(row => $$('.principles-intro-en .fill-char', row));
  const principleRowMasks = principleRows.map(row => $('.principles-intro-mask', row));
  const principleRowKorean = principleRows.map(row => $('.principles-intro-ko', row));
  const principleCardsStage = $('.principles-cards-stage', principles);
  const principleCards = $$('.principle-card', principles);
  const principleCardEnglish = principleCards.map(card => $$('.principle-en .fill-char', card));

  const renderPrinciplesIntro = p => {
    if (!principleRows.length) return;

    principleRows.forEach((row, index) => {
      const englishProgress = fillProgress(p, index * 0.065, 0.085);
      const maskProgress = easeInOut(phaseProgress(
        p,
        0.30 + index * 0.075,
        0.405 + index * 0.075
      ));
      const translationProgress = easeInOut(phaseProgress(
        p,
        0.315 + index * 0.075,
        0.42 + index * 0.075
      ));

      setChars(principleRowEnglish[index], englishProgress, '255,255,255', 0.16);
      setStyle(
        principleRowMasks[index],
        'clipPath',
        `inset(0 0 ${(100 * (1 - maskProgress)).toFixed(2)}% 0)`
      );
      setStyle(principleRowKorean[index], 'opacity', translationProgress.toFixed(4));
      setStyle(
        principleRowKorean[index],
        'transform',
        `translate3d(0, ${(-1.05 * (1 - translationProgress)).toFixed(3)}em, 0)`
      );
    });
  };

  const CARD_PHASES = Object.freeze([
    { enterStart: 0.00, enterEnd: 0.08, fillStart: 0.04, fillEnd: 0.20 },
    { enterStart: 0.36, enterEnd: 0.44, fillStart: 0.40, fillEnd: 0.56 },
    { enterStart: 0.72, enterEnd: 0.80, fillStart: 0.76, fillEnd: 0.92 }
  ]);

  /*
    Mobile has a much shorter physical scroll runway. Preserve the ordered
    reveal while finishing within one normal swipe instead of requiring a
    separate swipe for every card.
  */
  const MOBILE_CARD_PHASES = Object.freeze([
    { enterStart: 0.00, enterEnd: 0.06, fillStart: 0.02, fillEnd: 0.12 },
    { enterStart: 0.25, enterEnd: 0.31, fillStart: 0.27, fillEnd: 0.39 },
    { enterStart: 0.50, enterEnd: 0.56, fillStart: 0.52, fillEnd: 0.64 }
  ]);

  const renderPrincipleCards = p => {
    const phases = innerWidth <= 850 ? MOBILE_CARD_PHASES : CARD_PHASES;
    principleCards.forEach((card, index) => {
      const phase = phases[index];
      if (!phase) return;

      const enterProgress = easeInOut(phaseProgress(p, phase.enterStart, phase.enterEnd));
      const fill = phaseProgress(p, phase.fillStart, phase.fillEnd);

      setStyle(card, 'opacity', enterProgress.toFixed(4));
      setStyle(card, 'transform', `translate3d(0, ${(24 * (1 - enterProgress)).toFixed(2)}px, 0)`);
      setChars(principleCardEnglish[index], fill, '255,255,255');
    });
  };

  const metrics = {
    viewportHeight: innerHeight,
    heroTop: 0,
    heroTravel: 1,
    philosophyTop: 0,
    philosophyTravel: 1,
    philosophyStickyTop: 0,
    philosophyFillEnd: 0.82,
    principlesIntroTop: 0,
    principlesIntroTravel: 1,
    principlesCardsTop: 0,
    principlesCardsTravel: 1
  };
  let metricsRaf = 0;
  let raf = 0;
  let lastHeroProgress = -1;
  let lastPhilosophyProgress = -1;
  let lastPrinciplesIntroProgress = -1;
  let lastPrinciplesCardsProgress = -1;

  const absoluteTop = el => el ? el.getBoundingClientRect().top + scrollY : 0;
  const getHeroProgress = () => clamp((scrollY - metrics.heroTop) / metrics.heroTravel);

  const refreshMetrics = () => {
    metricsRaf = 0;
    metrics.viewportHeight = innerHeight;
    metrics.heroTop = absoluteTop(hero);
    metrics.heroTravel = hero ? Math.max(1, hero.offsetHeight - innerHeight) : 1;
    metrics.philosophyTop = absoluteTop(philosophySection);
    metrics.philosophyStickyTop = innerHeight * (innerWidth <= 850 ? 0.14 : 0.18);
    metrics.philosophyTravel = philosophySection && philosophySticky
      ? Math.max(1, philosophySection.offsetHeight - philosophySticky.offsetHeight - metrics.philosophyStickyTop)
      : 1;
    metrics.philosophyFillEnd = clamp(
      1 - (metrics.viewportHeight * 0.60) / metrics.philosophyTravel,
      0.55,
      0.82
    );
    metrics.principlesIntroTop = absoluteTop(principleIntroStage);
    metrics.principlesIntroTravel = principleIntroStage
      ? Math.max(1, principleIntroStage.offsetHeight - innerHeight)
      : 1;
    metrics.principlesCardsTop = absoluteTop(principleCardsStage);
    metrics.principlesCardsTravel = principleCardsStage
      ? Math.max(1, principleCardsStage.offsetHeight - innerHeight)
      : 1;
    lastHeroProgress = -1;
    lastPhilosophyProgress = -1;
    lastPrinciplesIntroProgress = -1;
    lastPrinciplesCardsProgress = -1;
    requestRender();
  };

  const scheduleMetricsRefresh = () => {
    if (!metricsRaf) metricsRaf = requestAnimationFrame(refreshMetrics);
  };

  const render = () => {
    raf = 0;
    const y = scrollY;
    const heroProgress = getHeroProgress();
    const philosophyProgress = clamp(
      (y + metrics.philosophyStickyTop - metrics.philosophyTop) / metrics.philosophyTravel
    );
    const principlesIntroProgress = clamp(
      (y - metrics.principlesIntroTop) / metrics.principlesIntroTravel
    );
    const principlesCardsProgress = clamp(
      (y - metrics.principlesCardsTop) / metrics.principlesCardsTravel
    );

    if (Math.abs(heroProgress - lastHeroProgress) >= 0.0001) {
      renderHero(heroProgress);
      lastHeroProgress = heroProgress;
    }
    if (Math.abs(philosophyProgress - lastPhilosophyProgress) >= 0.0001) {
      renderPhilosophy(philosophyProgress, metrics.philosophyFillEnd);
      lastPhilosophyProgress = philosophyProgress;
    }
    if (Math.abs(principlesIntroProgress - lastPrinciplesIntroProgress) >= 0.0001) {
      renderPrinciplesIntro(principlesIntroProgress);
      lastPrinciplesIntroProgress = principlesIntroProgress;
    }
    if (Math.abs(principlesCardsProgress - lastPrinciplesCardsProgress) >= 0.0001) {
      renderPrincipleCards(principlesCardsProgress);
      lastPrinciplesCardsProgress = principlesCardsProgress;
    }
  };
  const requestRender = () => {
    if (!raf) raf = requestAnimationFrame(render);
  };

  refreshMetrics();
  scheduleIdleCue(IDLE_DELAY_MS);

  addEventListener('scroll', () => {
    if (getHeroProgress() > 0.002) registerUserAction();
    requestRender();
  }, { passive: true });
  addEventListener('wheel', registerUserAction, { passive: true });
  addEventListener('touchstart', registerUserAction, { passive: true });
  addEventListener('pointerdown', registerUserAction, { passive: true });
  addEventListener('keydown', registerUserAction);
  addEventListener('resize', scheduleMetricsRefresh, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (idleDisabled || reducedMotion) return;
    if (document.hidden) {
      stopIdleCue(true);
    } else if (heroIsAtRest()) {
      scheduleIdleCue(IDLE_DELAY_MS);
    }
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleMetricsRefresh).catch(() => {});
  }
})();
