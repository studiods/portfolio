(() => {
  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const $ = (s, root = document) => root ? root.querySelector(s) : null;
  const $$ = (s, root = document) => root ? [...root.querySelectorAll(s)] : [];

  const FILL_SLOWDOWN = 1.32;
  const FILL_FEATHER = 4;
  const NEXT_ENTER_AT = 0.84;

  const fillProgress = (value, start, duration) =>
    clamp((value - start) / (duration * FILL_SLOWDOWN));

  const phaseProgress = (value, start, end) => {
    if (end <= start) return value >= end ? 1 : 0;
    return clamp((value - start) / (end - start));
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

  const setWhole = (els, progress, rgb = '17,17,17', baseAlpha = 0.05) => {
    const alpha = baseAlpha + (1 - baseAlpha) * clamp(progress);
    els.forEach(el => { el.style.color = `rgba(${rgb},${alpha})`; });
  };

  $$('.js-char-fill').forEach(splitChars);

  const hero = $('#heroSequence');
  const quoteState = $('.hero-state-quote', hero);
  const sourceOnly = $('.quote-source-only', hero);
  const definition = $('.hero-state-definition', hero);
  const subState = $('.hero-state-subtractive', hero);
  const subLines = $$('.subtractive-korean .fill-line', hero);
  subLines.forEach(splitChars);

  const quoteChars = $$('.hero-quote .fill-char', hero);
  const definitionChars = $$('.definition-copy .fill-char', hero);
  const subChars = $$('.subtractive-title .fill-char', hero);
  const subKoreanChars = $$('.subtractive-korean .fill-char', hero);

  /*
    HERO TIMELINE
    ----------------
    The next state now waits until the outgoing state has completed 84% of its
    movement. This avoids the previous early overlap while keeping a small,
    intentional handoff between scenes.

    Character fill remains scroll-driven: each character begins at 5% black
    and sweeps to 100% black in reading order.
  */
  const HERO_HOLD_SCALE = 1 / 3;
  const HERO_PHASE = Object.freeze({
    quoteFill: 0.13,
    quoteHold: 0.15 * HERO_HOLD_SCALE,
    quoteTransition: 0.17,
    defFill: 0.12,
    defHold: 0.14 * HERO_HOLD_SCALE,
    defTransition: 0.15,
    subFill: 0.06,
    subHold: 0.08 * HERO_HOLD_SCALE
  });

  const HERO_TOTAL = Object.values(HERO_PHASE).reduce((sum, value) => sum + value, 0);
  const heroPhase = key => HERO_PHASE[key] / HERO_TOTAL;
  let heroCursor = 0;

  const HERO = Object.freeze({
    quoteFillStart: heroCursor,
    quoteFillEnd: (heroCursor += heroPhase('quoteFill')),
    quoteHoldEnd: (heroCursor += heroPhase('quoteHold')),
    quoteTransitionEnd: (heroCursor += heroPhase('quoteTransition')),

    defFillEnd: (heroCursor += heroPhase('defFill')),
    defHoldEnd: (heroCursor += heroPhase('defHold')),
    defTransitionEnd: (heroCursor += heroPhase('defTransition')),

    subFillEnd: (heroCursor += heroPhase('subFill')),
    subHoldEnd: (heroCursor += heroPhase('subHold'))
  });

  const renderEnter = (state, progress) => {
    const p = clamp(progress);
    const distance = Math.min(innerWidth * 0.18, 260);
    state.style.opacity = String(p);
    state.style.transform = `translate3d(${(1 - p) * distance}px, 0, 0)`;
    state.style.clipPath = 'none';
  };

  const renderEnterDown = (state, progress) => {
    const p = clamp(progress);
    const distance = Math.min(innerHeight * 0.16, 170);
    const easedMove = 1 - Math.pow(1 - p, 1.45);
    state.style.opacity = String(p);
    state.style.transform = `translate3d(0, ${-(1 - easedMove) * distance}px, 0)`;
    state.style.clipPath = 'none';
  };

  const renderExit = (state, progress) => {
    const p = clamp(progress);
    const distance = Math.min(innerHeight * 0.18, 190);
    const easedMove = 1 - Math.pow(1 - p, 1.6);
    const fade = phaseProgress(p, 0.78, 1.00);
    state.style.opacity = String(1 - fade);
    state.style.transform = `translate3d(0, ${easedMove * distance}px, 0)`;
    state.style.clipPath = 'none';
  };

  const renderHero = () => {
    if (!hero || !quoteState || !definition || !subState) return;

    const rect = hero.getBoundingClientRect();
    const travel = Math.max(1, hero.offsetHeight - innerHeight);
    const p = clamp(-rect.top / travel);

    /* STEP 1 — English quote: 5% -> 100% fill, hold, then exit downward. */
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

    const quoteExit = phaseProgress(p, HERO.quoteHoldEnd, HERO.quoteTransitionEnd);
    renderExit(quoteState, quoteExit);
    quoteState.setAttribute('aria-hidden', quoteExit >= 0.999 ? 'true' : 'false');

    /* STEP 2 — Wait until the quote is almost gone, then bring the definition down. */
    const defEnter = phaseProgress(quoteExit, NEXT_ENTER_AT, 1);
    const defExit = phaseProgress(p, HERO.defHoldEnd, HERO.defTransitionEnd);
    const defFillStart = HERO.quoteHoldEnd +
      (HERO.quoteTransitionEnd - HERO.quoteHoldEnd) * NEXT_ENTER_AT;

    if (p < HERO.defHoldEnd) {
      renderEnterDown(definition, defEnter);
    } else {
      renderExit(definition, defExit);
    }

    setChars(
      definitionChars,
      phaseProgress(p, defFillStart, HERO.defFillEnd)
    );

    definition.setAttribute(
      'aria-hidden',
      defEnter <= 0.001 || defExit >= 0.999 ? 'true' : 'false'
    );

    /* STEP 3 — The final state also waits until the definition is almost gone. */
    const subEnter = phaseProgress(defExit, NEXT_ENTER_AT, 1);
    renderEnter(subState, subEnter);

    const subFillStart = HERO.defHoldEnd +
      (HERO.defTransitionEnd - HERO.defHoldEnd) * NEXT_ENTER_AT;
    const subFillSpan = HERO.subFillEnd - subFillStart;
    const subTitleFillEnd = subFillStart + subFillSpan * 0.78;
    const subKoreanFillStart = subFillStart + subFillSpan * 0.28;

    setChars(
      subChars,
      phaseProgress(p, subFillStart, subTitleFillEnd)
    );
    setChars(
      subKoreanChars,
      phaseProgress(p, subKoreanFillStart, HERO.subFillEnd)
    );

    subState.setAttribute('aria-hidden', subEnter <= 0.001 ? 'true' : 'false');
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
  addEventListener('scroll', requestRender, { passive: true });
  addEventListener('resize', requestRender);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(requestRender).catch(() => {});
  }
})();
