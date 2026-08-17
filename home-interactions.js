(() => {
  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const $ = (s, root = document) => root ? root.querySelector(s) : null;
  const $$ = (s, root = document) => root ? [...root.querySelectorAll(s)] : [];

  const FILL_SLOWDOWN = 1.32;
  const FILL_FEATHER = 4;

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
      scrollTo(0, 0);
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
      char.style.color = `rgba(${rgb},${baseAlpha + (1 - baseAlpha) * local})`;
    });
  };

  const setCharsOneByOne = (chars, progress, rgb = '17,17,17', baseAlpha = 0.05) => {
    const visibleChars = chars.filter(char => char.textContent.trim().length > 0);
    const n = visibleChars.length || 1;
    const sweep = clamp(progress) * n;
    visibleChars.forEach((char, i) => {
      const local = clamp(sweep - i);
      char.style.color = `rgba(${rgb},${baseAlpha + (1 - baseAlpha) * local})`;
    });
  };

  const setWhole = (els, progress, rgb = '17,17,17', baseAlpha = 0.05) => {
    const alpha = baseAlpha + (1 - baseAlpha) * clamp(progress);
    els.forEach(el => { el.style.color = `rgba(${rgb},${alpha})`; });
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
    state.style.opacity = String(opacity);
    state.style.transform = `translate3d(0, ${-(1 - p) * distance}px, 0)`;
    state.style.clipPath = 'none';
  };

  const renderExit = (state, progress) => {
    const raw = clamp(progress);
    const distance = Math.min(innerHeight * 0.18, 190);
    const easedMove = 1 - Math.pow(1 - raw, 1.6);
    state.style.opacity = String(exitOpacity(raw));
    state.style.transform = `translate3d(0, ${easedMove * distance}px, 0)`;
    state.style.clipPath = 'none';
  };

  const renderHero = () => {
    if (!hero || !quoteState || !definition || !subState) return;

    const rect = hero.getBoundingClientRect();
    const travel = Math.max(1, hero.offsetHeight - innerHeight);
    const p = clamp(-rect.top / travel);

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
    quoteState.setAttribute('aria-hidden', quoteExit >= 0.999 ? 'true' : 'false');

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

    definition.setAttribute(
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

    subState.setAttribute(
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

  const heroIsAtRest = () => {
    if (!hero) return false;
    const rect = hero.getBoundingClientRect();
    const travel = Math.max(1, hero.offsetHeight - innerHeight);
    const p = clamp(-rect.top / travel);
    return p < 0.002;
  };

  const restoreQuoteFromScroll = () => {
    if (!heroIsAtRest()) return;
    setChars(quoteChars, 0);
    setWhole(sourceOnly ? [sourceOnly] : [], 0);
  };

  const stopIdleCue = () => {
    if (idleTimer) clearTimeout(idleTimer);
    if (idleRaf) cancelAnimationFrame(idleRaf);
    idleTimer = 0;
    idleRaf = 0;
    idleCycleStartedAt = 0;
    restoreQuoteFromScroll();
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
        char.style.color = `rgba(17,17,17,${alpha})`;
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

  const renderPhilosophy = () => {
    if (!philosophySection || !philosophySticky || !philosophyLines.length) return;

    const sectionRect = philosophySection.getBoundingClientRect();
    const stickyTop = innerHeight * (innerWidth <= 850 ? 0.14 : 0.18);
    const stickyTravel = Math.max(
      1,
      philosophySection.offsetHeight - philosophySticky.offsetHeight - stickyTop
    );
    const p = clamp((stickyTop - sectionRect.top) / stickyTravel);

    const fillP = clamp(p / 0.82);
    const lineCount = philosophyLines.length;
    const lineWindow = 1 / lineCount;

    philosophyLines.forEach((line, index) => {
      const lineStart = index * lineWindow;
      const lineProgress = clamp((fillP - lineStart) / lineWindow);
      const alpha = 0.05 + 0.95 * lineProgress;
      line.style.color = `rgba(17,17,17,${alpha})`;
    });
  };

  const principles = $('#principles');
  const principleIntro = $('.principles-intro', principles);
  const introChars = $$('.principles-intro .fill-char', principles);
  const cardEnglishChars = $$('.principle-card h3 .fill-char, .principle-en .fill-char', principles);
  const cardKorean = $$('.principle-card > p:last-child', principles);

  const renderPrinciples = () => {
    if (!principles || !principleIntro) return;
    const r = principles.getBoundingClientRect();
    const travel = Math.max(
      innerHeight * 0.90,
      principles.offsetHeight - innerHeight * 0.35
    );
    const p = clamp((innerHeight * 0.82 - r.top) / travel);

    setChars(introChars, fillProgress(p, 0, 0.23), '255,255,255', 0.16);
    principleIntro.style.opacity = '1';
    principleIntro.style.transform = 'none';
    principleIntro.style.clipPath = 'inset(0)';

    setChars(cardEnglishChars, fillProgress(p, 0.62, 0.26), '255,255,255');
    setWhole(cardKorean, fillProgress(p, 0.78, 0.12), '255,255,255');
  };

  let raf = 0;
  const render = () => {
    raf = 0;
    renderHero();
    renderPhilosophy();
    renderPrinciples();
  };
  const requestRender = () => {
    if (!raf) raf = requestAnimationFrame(render);
  };

  render();
  scheduleIdleCue(IDLE_FIRST_DELAY);

  addEventListener('scroll', () => {
    registerUserAction();
    requestRender();
  }, { passive: true });
  addEventListener('wheel', registerUserAction, { passive: true });
  addEventListener('touchstart', registerUserAction, { passive: true });
  addEventListener('pointerdown', registerUserAction, { passive: true });
  addEventListener('keydown', registerUserAction);
  addEventListener('resize', requestRender);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(requestRender).catch(() => {});
  }
})();