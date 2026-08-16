(() => {
  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const $ = (s, root = document) => root ? root.querySelector(s) : null;
  const $$ = (s, root = document) => root ? [...root.querySelectorAll(s)] : [];

  const FILL_SLOWDOWN = 1.32;
  const FILL_FEATHER = 4;

  const fillProgress = (value, start, duration) =>
    clamp((value - start) / (duration * FILL_SLOWDOWN));

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
    Hero is staged as FILL -> HOLD -> EXIT -> NEXT STATE.
    The hold ranges deliberately consume real scroll distance, so a fully filled
    message remains readable before it starts leaving. Exit movement also keeps
    the text fully visible through the first 45% of travel, then fades/masks it.
  */
  const HERO = {
    quoteFillStart: 0.00,
    quoteFillDuration: 0.16,
    sourceFillStart: 0.10,
    sourceFillDuration: 0.06,
    quoteOutStart: 0.30,
    quoteOutDuration: 0.10,

    defInStart: 0.40,
    defInDuration: 0.07,
    defFillStart: 0.46,
    defFillDuration: 0.14,
    defOutStart: 0.73,
    defOutDuration: 0.10,

    subInStart: 0.83,
    subInDuration: 0.06,
    subFillStart: 0.88,
    subFillDuration: 0.07,
    subKoreanFillStart: 0.92,
    subKoreanFillDuration: 0.04
  };

  const renderExit = (state, progress) => {
    const fade = clamp((progress - 0.45) / 0.55);
    state.style.opacity = String(1 - fade);
    state.style.transform = `translateY(${progress * 1.35}em)`;
    state.style.clipPath = `inset(0 0 ${fade * 100}% 0)`;
  };

  const renderHero = () => {
    if (!hero || !quoteState || !definition || !subState) return;
    const rect = hero.getBoundingClientRect();
    const travel = Math.max(1, hero.offsetHeight - innerHeight);
    const p = clamp(-rect.top / travel);

    setChars(quoteChars, fillProgress(p, HERO.quoteFillStart, HERO.quoteFillDuration));
    setWhole(
      sourceOnly ? [sourceOnly] : [],
      fillProgress(p, HERO.sourceFillStart, HERO.sourceFillDuration)
    );

    const quoteOut = clamp((p - HERO.quoteOutStart) / HERO.quoteOutDuration);
    renderExit(quoteState, quoteOut);

    const defIn = clamp((p - HERO.defInStart) / HERO.defInDuration);
    const defOut = clamp((p - HERO.defOutStart) / HERO.defOutDuration);
    if (defOut > 0) {
      renderExit(definition, defOut);
    } else {
      definition.style.opacity = String(defIn);
      definition.style.transform = `translateY(${(1 - defIn) * -0.8}em)`;
      definition.style.clipPath = `inset(${(1 - defIn) * 100}% 0 0 0)`;
    }
    definition.setAttribute('aria-hidden', defIn <= 0.001 || defOut >= 0.999 ? 'true' : 'false');
    setChars(
      definitionChars,
      fillProgress(p, HERO.defFillStart, HERO.defFillDuration)
    );

    const subIn = clamp((p - HERO.subInStart) / HERO.subInDuration);
    subState.style.opacity = String(subIn);
    subState.style.transform = `translateY(${(1 - subIn) * -0.8}em)`;
    subState.style.clipPath = `inset(${(1 - subIn) * 100}% 0 0 0)`;
    subState.setAttribute('aria-hidden', subIn <= 0.001 ? 'true' : 'false');
    setChars(
      subChars,
      fillProgress(p, HERO.subFillStart, HERO.subFillDuration)
    );
    setWhole(
      subLines,
      fillProgress(p, HERO.subKoreanFillStart, HERO.subKoreanFillDuration)
    );
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
