(() => {
  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const splitChars = (el, preserveSpaces = false) => {
    if (!el || el.dataset.split === '1') return;
    el.dataset.split = '1';
    [...el.childNodes].forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        [...node.textContent].forEach(ch => {
          const span = document.createElement('span');
          span.className = 'fill-char';
          span.textContent = ch === ' ' && !preserveSpaces ? '\u00A0' : ch;
          frag.appendChild(span);
        });
        node.replaceWith(frag);
      } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('fill-char')) {
        splitChars(node, preserveSpaces);
      }
    });
  };

  const setChars = (chars, progress, rgb = '17,17,17') => {
    const n = chars.length || 1;
    chars.forEach((char, i) => {
      const local = clamp(progress * n - i);
      char.style.color = `rgba(${rgb},${0.05 + 0.95 * local})`;
    });
  };

  const setWhole = (els, progress, rgb = '17,17,17') => {
    const alpha = 0.05 + 0.95 * clamp(progress);
    els.forEach(el => { el.style.color = `rgba(${rgb},${alpha})`; });
  };

  // Split only after CSS has already rendered every animated source at 5%.
  $$('.js-char-fill').forEach(el => splitChars(el, !!el.closest('.philosophy-statements')));
  document.documentElement.classList.add('motion-ready');

  const hero = $('#heroSequence');
  const quoteState = $('.hero-state-quote', hero);
  const quote = $('.hero-quote', hero);
  const sourceOnly = $('.quote-source-only', hero);
  const definition = $('.hero-state-definition', hero);
  const definitionLines = $$('.definition-copy .fill-line', hero);
  const subState = $('.hero-state-subtractive', hero);
  const subTitle = $('.subtractive-title', hero);
  const subLines = $$('.subtractive-korean .fill-line', hero);

  const quoteChars = $$('.hero-quote .fill-char', hero);
  const subChars = $$('.subtractive-title .fill-char', hero);

  const renderHero = () => {
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const travel = Math.max(1, hero.offsetHeight - innerHeight);
    const p = clamp(-rect.top / travel);

    setChars(quoteChars, clamp(p / 0.20));
    setWhole(sourceOnly ? [sourceOnly] : [], clamp((p - 0.12) / 0.08));

    const quoteOut = clamp((p - 0.25) / 0.09);
    quoteState.style.opacity = String(1 - quoteOut);
    quoteState.style.transform = `translateY(${quoteOut * 1.1}em)`;
    quoteState.style.clipPath = `inset(0 0 ${quoteOut * 100}% 0)`;

    const defIn = clamp((p - 0.31) / 0.09);
    const defOut = clamp((p - 0.47) / 0.07);
    const defVisible = clamp(defIn - defOut);
    definition.style.opacity = String(defVisible);
    definition.style.transform = defOut > 0
      ? `translateY(${defOut * 1.1}em)`
      : `translateY(${(1 - defIn) * -0.8}em)`;
    definition.style.clipPath = defOut > 0
      ? `inset(0 0 ${defOut * 100}% 0)`
      : `inset(${(1 - defIn) * 100}% 0 0 0)`;
    definition.setAttribute('aria-hidden', defVisible <= 0.001 ? 'true' : 'false');
    setWhole(definitionLines.slice(0, 1), clamp((p - 0.36) / 0.06));
    setWhole(definitionLines.slice(1), clamp((p - 0.40) / 0.06));

    const subIn = clamp((p - 0.52) / 0.09);
    const subOut = clamp((p - 0.82) / 0.09);
    const subVisible = clamp(subIn - subOut);
    subState.style.opacity = String(subVisible);
    subState.style.transform = subOut > 0
      ? `translateY(${subOut * 1.1}em)`
      : `translateY(${(1 - subIn) * -0.8}em)`;
    subState.style.clipPath = subOut > 0
      ? `inset(0 0 ${subOut * 100}% 0)`
      : `inset(${(1 - subIn) * 100}% 0 0 0)`;
    subState.setAttribute('aria-hidden', subVisible <= 0.001 ? 'true' : 'false');
    setChars(subChars, clamp((p - 0.58) / 0.11));
    setWhole(subLines, clamp((p - 0.64) / 0.06));
  };

  const philosophy = $('.philosophy-statements');
  const philosophyChars = $$('.philosophy-statements .fill-char');
  const renderPhilosophy = () => {
    if (!philosophy) return;
    const r = philosophy.getBoundingClientRect();
    const start = innerHeight * 0.94;
    const end = innerHeight * 0.30;
    setChars(philosophyChars, clamp((start - r.top) / (start - end)));
  };

  const principles = $('#principles');
  const principleIntro = $('.principles-intro', principles);
  const translation = $('.principles-translation', principles);
  const introChars = $$('.principles-intro .fill-char', principles);
  const cardEnglishChars = $$('.principle-card h3 .fill-char, .principle-en .fill-char', principles);
  const cardKorean = $$('.principle-card > p:last-child', principles);
  const translationLine = $$('.principles-translation p', principles);

  const renderPrinciples = () => {
    if (!principles) return;
    const r = principles.getBoundingClientRect();
    const travel = Math.max(1, principles.offsetHeight - innerHeight * 0.72);
    const p = clamp((innerHeight * 0.78 - r.top) / travel);

    setChars(introChars, clamp(p / 0.23), '255,255,255');

    const introOut = clamp((p - 0.26) / 0.10);
    principleIntro.style.opacity = String(1 - introOut);
    principleIntro.style.transform = `translateY(${introOut * 0.8}em)`;
    principleIntro.style.clipPath = `inset(0 0 ${introOut * 100}% 0)`;

    const trIn = clamp((p - 0.32) / 0.09);
    const trOut = clamp((p - 0.48) / 0.08);
    const trVisible = clamp(trIn - trOut);
    translation.style.opacity = String(trVisible);
    translation.style.transform = trOut > 0
      ? `translateY(${trOut * 0.8}em)`
      : `translateY(${(1 - trIn) * -0.7}em)`;
    translation.style.clipPath = trOut > 0
      ? `inset(0 0 ${trOut * 100}% 0)`
      : `inset(${(1 - trIn) * 100}% 0 0 0)`;
    translation.setAttribute('aria-hidden', trVisible <= 0.001 ? 'true' : 'false');
    setWhole(translationLine, clamp((p - 0.37) / 0.07), '255,255,255');

    setChars(cardEnglishChars, clamp((p - 0.52) / 0.26), '255,255,255');
    setWhole(cardKorean, clamp((p - 0.72) / 0.12), '255,255,255');
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
})();
