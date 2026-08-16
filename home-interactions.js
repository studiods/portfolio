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

  const setSequentialWhole = (els, progress, rgb = '17,17,17', baseAlpha = 0.05) => {
    const n = els.length || 1;
    els.forEach((el, i) => {
      const local = clamp(progress * n - i);
      const alpha = baseAlpha + (1 - baseAlpha) * local;
      el.style.color = `rgba(${rgb},${alpha})`;
    });
  };

  $$('.js-char-fill')
    .filter(el => !el.classList.contains('philosophy-statements'))
    .forEach(splitChars);

  const hero = $('#heroSequence');
  const quoteState = $('.hero-state-quote', hero);
  const sourceOnly = $('.quote-source-only', hero);
  const definition = $('.hero-state-definition', hero);
  const subState = $('.hero-state-subtractive', hero);
  const subLines = $$('.subtractive-korean .fill-line', hero);
  const quoteChars = $$('.hero-quote .fill-char', hero);
  const definitionChars = $$('.definition-copy .fill-char', hero);
  const subChars = $$('.subtractive-title .fill-char', hero);

  const HERO = {
    quoteFillStart: 0.00,
    quoteFillDuration: 0.20,
    sourceFillStart: 0.12,
    sourceFillDuration: 0.08,
    quoteOutStart: 0.27,
    quoteOutDuration: 0.07,

    defInStart: 0.34,
    defInDuration: 0.07,
    defFillStart: 0.40,
    defFillDuration: 0.20,
    defOutStart: 0.72,
    defOutDuration: 0.07,

    subInStart: 0.79,
    subInDuration: 0.07,
    subFillStart: 0.84,
    subFillDuration: 0.10,
    subKoreanFillStart: 0.90,
    subKoreanFillDuration: 0.05
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
    quoteState.style.opacity = String(1 - quoteOut);
    quoteState.style.transform = `translateY(${quoteOut * 1.1}em)`;
    quoteState.style.clipPath = `inset(0 0 ${quoteOut * 100}% 0)`;

    const defIn = clamp((p - HERO.defInStart) / HERO.defInDuration);
    const defOut = clamp((p - HERO.defOutStart) / HERO.defOutDuration);
    const defVisible = clamp(defIn - defOut);
    definition.style.opacity = String(defVisible);
    definition.style.transform = defOut > 0
      ? `translateY(${defOut * 1.1}em)`
      : `translateY(${(1 - defIn) * -0.8}em)`;
    definition.style.clipPath = defOut > 0
      ? `inset(0 0 ${defOut * 100}% 0)`
      : `inset(${(1 - defIn) * 100}% 0 0 0)`;
    definition.setAttribute('aria-hidden', defVisible <= 0.001 ? 'true' : 'false');
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

    /*
      Use 82% of the sticky travel for the five line fills, then keep the fully
      filled philosophy on screen for the final 18% before the sticky releases.
      This guarantees the section never scrolls away before the last line hits 100%.
    */
    const fillP = clamp(p / 0.82);
    setSequentialWhole(philosophyLines, fillP);
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
