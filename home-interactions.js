(() => {
  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const $ = (s, root = document) => root ? root.querySelector(s) : null;
  const $$ = (s, root = document) => root ? [...root.querySelectorAll(s)] : [];

  const FILL_SLOWDOWN = 1.32;
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

  const setChars = (chars, progress, rgb = '17,17,17', baseAlpha = 0.05) => {
    const n = chars.length || 1;
    const sweep = progress * Math.max(1, n - 1 + FILL_FEATHER);
    chars.forEach((char, i) => {
      const local = clamp((sweep - i) / FILL_FEATHER);
      const alpha = (baseAlpha + (1 - baseAlpha) * local).toFixed(3);
      setStyle(char, 'color', `rgba(${rgb},${alpha})`);
    });
  };

  const setCharsOneByOne = (chars, progress, rgb = '17,17,17', baseAlpha = 0.05) => {
    const visibleChars = chars.filter(char => char.textContent.trim().length > 0);
    const n = visibleChars.length || 1;
    const sweep = clamp(progress) * n;
    visibleChars.forEach((char, i) => {
      const local = clamp(sweep - i);
      const alpha = (baseAlpha + (1 - baseAlpha) * local).toFixed(3);
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
  const subState = $('.hero-state-subtractive', hero);
  const subLines = $$('.subtractive-korean .fill-line', hero);
  const quoteChars = $$('.hero-quote .fill-char', hero);
  const definitionChars = $$('.definition-copy .fill-char', hero);
  const subChars = $$('.subtractive-title .fill-char', hero);
  const quoteLineChars = quoteLines.map(line => $$('.fill-char', line));

  const HERO_HOLD_SCALE = 1 / 3;
  const HERO_PHASE = Object.freeze({
    quoteFill: 0.13,
    quoteHold: 0.15 * HERO_HOLD_SCALE,
    quoteExit: 0.13,
    defEnter: 0.09,
    defFill: 0.12,
    defHold: 0.14 * HERO_HOLD_SCALE,
    defExit: 0.13,
    subEnter: 0.08,
    subFill: 0.13,
    subHold: 0.08 * HERO_HOLD_SCALE,
    subExit: 0.13
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
    defHoldEnd: (heroCursor += heroPhase('defHold')),
    defExitEnd: (heroCursor += heroPhase('defExit')),

    subEnterEnd: (heroCursor += heroPhase('subEnter')),
    subFillEnd: (heroCursor += heroPhase('subFill')),
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

    setChars(
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

    setChars(
      definitionChars,
      phaseProgress(p, HERO.defEnterEnd, HERO.defFillEnd)
    );

    setAttribute(
      definition,
      'aria-hidden',
      defEnter <= 0.001 || defExit >= 0.999 ? 'true' : 'false'
    );

    const subEnter = phaseProgress(p, HERO.defExitEnd, HERO.subEnterEnd);
    const subExit = phaseProgress(p, HERO.subHoldEnd, HERO.subExitEnd);

    if (p < HERO.subHoldEnd) {
      renderEnter(subState, subEnter);
    } else {
      renderExit(subState, subExit);
    }

    setCharsOneByOne(
      subChars,
      phaseProgress(p, HERO.subEnterEnd, HERO.subFillEnd)
    );

    const subKoreanFillStart = HERO.subEnterEnd +
      (HERO.subFillEnd - HERO.subEnterEnd) * 0.44;
    setWhole(
      subLines,
      phaseProgress(p, subKoreanFillStart, HERO.subFillEnd)
    );

    setAttribute(
      subState,
      'aria-hidden',
      subEnter <= 0.001 || subExit >= 0.999 ? 'true' : 'false'
    );
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IDLE_FIRST_DELAY = 2000;
  const IDLE_REPEAT_DELAY = 5000;
  const IDLE_LINE_MS = 920;
  const IDLE_NEXT_AT = 0.90;
  const IDLE_BASE_ALPHA = 0.05;
  const IDLE_PEAK_ALPHA = 0.15;
  let idleTimer = 0;
  let idleRaf = 0;
  let idleCycleStartedAt = 0;

  const heroIsAtRest = () => hero && getHeroProgress() < 0.002;

  const restoreQuoteFromScroll = () => {
    if (!heroIsAtRest()) return;
    setChars(quoteChars, 0);
    setWhole(sourceOnly ? [sourceOnly] : [], 0);
  };

  const stopIdleCue = () => {
    const wasAnimating = Boolean(idleRaf || idleCycleStartedAt);
    if (idleTimer) clearTimeout(idleTimer);
    if (idleRaf) cancelAnimationFrame(idleRaf);
    idleTimer = 0;
    idleRaf = 0;
    idleCycleStartedAt = 0;
    if (wasAnimating) restoreQuoteFromScroll();
  };

  const scheduleIdleCue = (delay) => {
    if (reducedMotion || !quoteLineChars.length) return;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      idleTimer = 0;
      if (heroIsAtRest()) {
        idleCycleStartedAt = performance.now();
        idleRaf = requestAnimationFrame(runIdleCue);
      }
    }, delay);
  };

  const runIdleCue = (now) => {
    if (!heroIsAtRest()) {
      stopIdleCue();
      return;
    }

    const elapsed = now - idleCycleStartedAt;
    const lineOffset = IDLE_LINE_MS * IDLE_NEXT_AT;
    const totalDuration = IDLE_LINE_MS + lineOffset * (quoteLineChars.length - 1);

    quoteLineChars.forEach((chars, lineIndex) => {
      const local = clamp((elapsed - lineIndex * lineOffset) / IDLE_LINE_MS);
      const pulse = local < 0.5
        ? easeInOut(local * 2)
        : easeInOut((1 - local) * 2);
      const alpha = IDLE_BASE_ALPHA +
        (IDLE_PEAK_ALPHA - IDLE_BASE_ALPHA) * pulse;
      chars.forEach(char => {
        setStyle(char, 'color', `rgba(17,17,17,${alpha.toFixed(3)})`);
      });
    });

    if (elapsed < totalDuration) {
      idleRaf = requestAnimationFrame(runIdleCue);
      return;
    }

    idleRaf = 0;
    idleCycleStartedAt = 0;
    restoreQuoteFromScroll();
    scheduleIdleCue(IDLE_REPEAT_DELAY);
  };

  const registerUserAction = () => {
    stopIdleCue();
    if (heroIsAtRest()) scheduleIdleCue(IDLE_REPEAT_DELAY);
  };

  const philosophySection = $('#philosophy');
  const philosophySticky = $('.philosophy-sticky', philosophySection);
  const philosophyLines = $$('.philosophy-statements > p', philosophySection);

  const renderPhilosophy = (p) => {
    if (!philosophySection || !philosophySticky || !philosophyLines.length) return;

    const fillP = clamp(p / 0.82);
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
  const principleIntro = $('.principles-intro', principles);
  const introChars = $$('.principles-intro .fill-char', principles);
  const cardEnglishChars = $$('.principle-card h3 .fill-char, .principle-en .fill-char', principles);
  const cardKorean = $$('.principle-card > p:last-child', principles);

  const renderPrinciples = (p) => {
    if (!principles || !principleIntro) return;

    setChars(introChars, fillProgress(p, 0, 0.23), '255,255,255', 0.16);
    setStyle(principleIntro, 'opacity', '1');
    setStyle(principleIntro, 'transform', 'none');
    setStyle(principleIntro, 'clipPath', 'inset(0)');

    setChars(cardEnglishChars, fillProgress(p, 0.62, 0.26), '255,255,255');
    setWhole(cardKorean, fillProgress(p, 0.78, 0.12), '255,255,255');
  };

  const metrics = {
    viewportHeight: innerHeight,
    heroTop: 0,
    heroTravel: 1,
    philosophyTop: 0,
    philosophyTravel: 1,
    philosophyStickyTop: 0,
    principlesTop: 0,
    principlesTravel: 1
  };
  let metricsRaf = 0;
  let raf = 0;
  let lastHeroProgress = -1;
  let lastPhilosophyProgress = -1;
  let lastPrinciplesProgress = -1;

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
    metrics.principlesTop = absoluteTop(principles);
    metrics.principlesTravel = principles
      ? Math.max(innerHeight * 0.90, principles.offsetHeight - innerHeight * 0.35)
      : 1;
    lastHeroProgress = -1;
    lastPhilosophyProgress = -1;
    lastPrinciplesProgress = -1;
    requestRender();
  };

  const scheduleMetricsRefresh = () => {
    if (!metricsRaf) metricsRaf = requestAnimationFrame(refreshMetrics);
  };

  /*
    After each hero message and the philosophy statement are fully visible,
    suppress the following downward wheel gesture. The gesture that completed
    the text is allowed to finish first, so trackpad momentum cannot consume
    the reading pause by accident.
  */
  const gateDefinitions = [
    progress => progress.hero >= HERO.quoteFillEnd,
    progress => progress.hero >= HERO.defFillEnd,
    progress => progress.hero >= HERO.subFillEnd,
    progress => progress.philosophy >= 0.82
  ];
  const gateStates = gateDefinitions.map(() => 'waiting');
  let wheelBurstActive = false;
  let wheelBurstTimer = 0;
  let activeGate = -1;
  let wheelControlListening = false;
  let wheelTrackingListening = false;

  const enableWheelControl = () => {
    if (wheelControlListening) return;
    addEventListener('wheel', onControlledWheel, { passive: false });
    wheelControlListening = true;
  };

  const disableWheelControl = () => {
    if (!wheelControlListening) return;
    removeEventListener('wheel', onControlledWheel);
    wheelControlListening = false;
  };

  const disableWheelTracking = () => {
    disableWheelControl();
    if (!wheelTrackingListening) return;
    removeEventListener('wheel', trackWheel);
    wheelTrackingListening = false;
  };

  const armGate = index => {
    gateStates[index] = 'armed';
    enableWheelControl();
  };

  const updateGates = progress => {
    gateDefinitions.forEach((isComplete, index) => {
      if (gateStates[index] !== 'waiting' || !isComplete(progress)) return;
      if (wheelBurstActive) gateStates[index] = 'pending';
      else armGate(index);
    });
  };

  const finishWheelBurst = () => {
    wheelBurstActive = false;
    if (activeGate >= 0) {
      gateStates[activeGate] = 'consumed';
      activeGate = -1;
    }
    gateStates.forEach((state, index) => {
      if (state === 'pending') armGate(index);
    });
    if (!gateStates.includes('armed')) disableWheelControl();
    if (gateStates.every(state => state === 'consumed')) disableWheelTracking();
  };

  const trackWheel = event => {
    registerUserAction();
    if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX) || event.deltaY <= 0) return;
    if (scrollY > metrics.philosophyTop + metrics.philosophyTravel + metrics.viewportHeight) {
      disableWheelTracking();
      return;
    }
    wheelBurstActive = true;
    clearTimeout(wheelBurstTimer);
    wheelBurstTimer = setTimeout(finishWheelBurst, 140);
  };

  const onControlledWheel = event => {
    if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX) || event.deltaY <= 0) return;
    if (activeGate < 0) activeGate = gateStates.indexOf('armed');
    if (activeGate < 0) return;

    event.preventDefault();
  };

  const render = () => {
    raf = 0;
    const y = scrollY;
    const heroProgress = getHeroProgress();
    const philosophyProgress = clamp(
      (y + metrics.philosophyStickyTop - metrics.philosophyTop) / metrics.philosophyTravel
    );
    const principlesProgress = clamp(
      (y + metrics.viewportHeight * 0.82 - metrics.principlesTop) / metrics.principlesTravel
    );

    if (Math.abs(heroProgress - lastHeroProgress) >= 0.0001) {
      renderHero(heroProgress);
      lastHeroProgress = heroProgress;
    }
    if (Math.abs(philosophyProgress - lastPhilosophyProgress) >= 0.0001) {
      renderPhilosophy(philosophyProgress);
      lastPhilosophyProgress = philosophyProgress;
    }
    if (Math.abs(principlesProgress - lastPrinciplesProgress) >= 0.0001) {
      renderPrinciples(principlesProgress);
      lastPrinciplesProgress = principlesProgress;
    }
    updateGates({ hero: heroProgress, philosophy: philosophyProgress });
  };
  const requestRender = () => {
    if (!raf) raf = requestAnimationFrame(render);
  };

  refreshMetrics();
  scheduleIdleCue(IDLE_FIRST_DELAY);

  addEventListener('scroll', () => {
    registerUserAction();
    requestRender();
  }, { passive: true });
  if (!reducedMotion) {
    addEventListener('wheel', trackWheel, { passive: true });
    wheelTrackingListening = true;
  }
  addEventListener('touchstart', registerUserAction, { passive: true });
  addEventListener('pointerdown', registerUserAction, { passive: true });
  addEventListener('keydown', registerUserAction);
  addEventListener('resize', scheduleMetricsRefresh, { passive: true });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleMetricsRefresh).catch(() => {});
  }
})();
