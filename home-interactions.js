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
  const quoteChars = $$('.hero-quote .fill-char', hero);
  const definitionChars = $$('.definition-copy .fill-char', hero);
  const subChars = $$('.subtractive-title .fill-char', hero);

  /*
    HERO TIMELINE — structural order is intentionally non-overlapping.

    1) English quote fills completely
    2) HOLD: scrolling changes no visual state
    3) English quote visibly moves downward, staying opaque for most of the exit
    4) Korean definition enters and fills completely
    5) HOLD
    6) Korean definition visibly moves downward, staying opaque for most of the exit
    7) SUBTRACTIVE DESIGN enters and fills completely
    8) HOLD until the sticky hero releases into the next section

    Overall speed can later be tuned only by changing .hero-sequence height in CSS.
    These normalized phase boundaries preserve the sequence regardless of that speed.
  */
  const HERO = Object.freeze({
    quoteFillStart: 0.00,
    quoteFillEnd: 0.13,
    quoteHoldEnd: 0.28,
    quoteExitEnd: 0.39,

    defEnterEnd: 0.45,
    defFillEnd: 0.57,
    defHoldEnd: 0.71,
    defExitEnd: 0.82,

    subEnterEnd: 0.86,
    subFillEnd: 0.92,
    subHoldEnd: 1.00
  });

  const renderEnter = (state, progress) => {
    const p = clamp(progress);
    const distance = innerHeight * 0.065;
    state.style.opacity = String(p);
    state.style.transform = `translate3d(0, ${-(1 - p) * distance}px, 0)`;
    state.style.clipPath = 'none';
  };

  const renderExit = (state, progress) => {
    const p = clamp(progress);
    const distance = Math.min(innerHeight * 0.18, 190);
    const easedMove = 1 - Math.pow(1 - p, 1.6);

    /*
      Keep the outgoing copy at 100% opacity through 78% of the exit travel.
      Only the final 22% fades. This makes the downward movement legible instead
      of reading as an instantaneous disappearance.
    */
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

    /* STEP 1 — English quote: fill -> hold -> visible downward exit */
    const quoteFill = phaseProgress(p, HERO.quoteFillStart, HERO.quoteFillEnd);
    setChars(quoteChars, quoteFill);
    setWhole(
      sourceOnly ? [sourceOnly] : [],
      phaseProgress(p, 0.08, HERO.quoteFillEnd)
    );

    const quoteExit = phaseProgress(p, HERO.quoteHoldEnd, HERO.quoteExitEnd);
    renderExit(quoteState, quoteExit);
    quoteState.setAttribute('aria-hidden', quoteExit >= 0.999 ? 'true' : 'false');

    /* STEP 2 — Korean definition: enter -> fill -> hold -> visible downward exit */
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

    /* STEP 3 — SUBTRACTIVE DESIGN: enter -> fill -> hold until section releases */
    const subEnter = phaseProgress(p, HERO.defExitEnd, HERO.subEnterEnd);
    renderEnter(subState, subEnter);

    setChars(
      subChars,
      phaseProgress(p, HERO.subEnterEnd, 0.91)
    );
    setWhole(
      subLines,
      phaseProgress(p, 0.88, HERO.subFillEnd)
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
