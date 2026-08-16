(() => {
  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));

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

  const hero = document.getElementById('heroSequence');
  const quoteState = hero?.querySelector('.hero-state-quote');
  const quote = quoteState?.querySelector('.hero-quote');
  const oldTranslation = quoteState?.querySelector('.quote-translation');
  const subState = hero?.querySelector('.hero-state-subtractive');
  const subTitle = subState?.querySelector('.subtractive-title');
  const subKorean = subState?.querySelector('.subtractive-korean');

  if (hero && quoteState && quote && oldTranslation && subState && subTitle) {
    // Keep only the author with the opening quotation.
    const source = oldTranslation.querySelector('.quote-source');
    const sourceOnly = document.createElement('div');
    sourceOnly.className = 'quote-source-only fill-line';
    sourceOnly.textContent = source?.textContent || 'HANS HOFMANN';
    oldTranslation.replaceWith(sourceOnly);

    // Create a dedicated definition state between quote and Subtractive Design.
    const definition = document.createElement('div');
    definition.className = 'hero-state hero-state-definition';
    definition.innerHTML = `
      <div class="definition-copy definition-mask">
        <p class="fill-line">필요한 말을 할 수 있도록 불필요한 내용을 제거하는 행위를</p>
        <p class="fill-line">단순화 능력이라고 합니다.</p>
      </div>`;
    subState.before(definition);

    splitChars(quote);
    splitChars(subTitle);

    const quoteChars = [...quote.querySelectorAll('.fill-char')];
    const sourceLine = [sourceOnly];
    const definitionLines = [...definition.querySelectorAll('.fill-line')];
    const subChars = [...subTitle.querySelectorAll('.fill-char')];
    const subLines = [...subKorean.querySelectorAll('.fill-line')];

    const updateHero = () => {
      const rect = hero.getBoundingClientRect();
      const travel = Math.max(1, hero.offsetHeight - innerHeight);
      const p = clamp(-rect.top / travel);

      // 0.00—0.22: quotation fills letter-by-letter; author fills as one line.
      setChars(quoteChars, clamp(p / 0.20));
      setWhole(sourceLine, clamp((p - 0.12) / 0.08));

      // 0.25—0.34: quotation masks downward directly beneath its last line.
      const quoteOut = clamp((p - 0.25) / 0.09);
      quoteState.style.opacity = String(1 - quoteOut);
      quoteState.style.transform = `translateY(${quoteOut * 1.1}em)`;
      quoteState.style.clipPath = `inset(0 0 ${quoteOut * 100}% 0)`;

      // 0.31—0.43: definition drops in from above, initially 5%, then fills by line.
      const defIn = clamp((p - 0.31) / 0.09);
      definition.style.opacity = String(defIn);
      definition.style.transform = `translateY(${(1 - defIn) * -0.8}em)`;
      definition.style.clipPath = `inset(${(1 - defIn) * 100}% 0 0 0)`;
      setWhole(definitionLines.slice(0, 1), clamp((p - 0.36) / 0.06));
      setWhole(definitionLines.slice(1), clamp((p - 0.40) / 0.06));

      // 0.47—0.54: definition exits downward.
      const defOut = clamp((p - 0.47) / 0.07);
      if (defOut > 0) {
        definition.style.opacity = String(1 - defOut);
        definition.style.transform = `translateY(${defOut * 1.1}em)`;
        definition.style.clipPath = `inset(0 0 ${defOut * 100}% 0)`;
      }

      // 0.52—0.66: Subtractive Design masks in, then fills letter-by-letter.
      const subIn = clamp((p - 0.52) / 0.09);
      subState.style.opacity = String(subIn);
      subState.style.transform = `translateY(${(1 - subIn) * -0.8}em)`;
      subState.style.clipPath = `inset(${(1 - subIn) * 100}% 0 0 0)`;
      setChars(subChars, clamp((p - 0.58) / 0.11));
      setWhole(subLines, clamp((p - 0.64) / 0.06));

      // 0.82—0.91: Subtractive exits downward so philosophy can follow immediately.
      const subOut = clamp((p - 0.82) / 0.09);
      if (subOut > 0) {
        subState.style.opacity = String(1 - subOut);
        subState.style.transform = `translateY(${subOut * 1.1}em)`;
        subState.style.clipPath = `inset(0 0 ${subOut * 100}% 0)`;
      }
    };

    updateHero();
    addEventListener('scroll', updateHero, { passive: true });
    addEventListener('resize', updateHero);
  }

  // Design philosophy retains scroll-based character fill.
  const philosophy = document.querySelector('.philosophy-statements');
  if (philosophy) {
    splitChars(philosophy, true);
    const chars = [...philosophy.querySelectorAll('.fill-char')];
    const updatePhilosophy = () => {
      const r = philosophy.getBoundingClientRect();
      const start = innerHeight * 0.94;
      const end = innerHeight * 0.30;
      setChars(chars, clamp((start - r.top) / (start - end)));
    };
    updatePhilosophy();
    addEventListener('scroll', updatePhilosophy, { passive: true });
    addEventListener('resize', updatePhilosophy);
  }

  const principles = document.getElementById('principles');
  if (principles) {
    // Replace the old typing target with a reversible scroll state.
    const intro = principles.querySelector('.principles-intro');
    if (intro) {
      const clone = intro.cloneNode(true);
      clone.classList.remove('typing-target');
      clone.removeAttribute('data-text');
      intro.replaceWith(clone);
    }
    const principleIntro = principles.querySelector('.principles-intro');
    const introText = principleIntro?.textContent || 'LESS ASSUMPTION. LESS CONVENTION. LESS BIAS.';
    if (principleIntro) {
      principleIntro.innerHTML = 'LESS ASSUMPTION<br>LESS CONVENTION<br>LESS BIAS';
      splitChars(principleIntro);
    }

    const translation = document.createElement('div');
    translation.className = 'principles-translation';
    translation.innerHTML = '<p>가정을 덜고, 관습을 덜고, 편향을 덜어냅니다.</p>';
    principleIntro?.after(translation);

    const englishEls = [
      ...(principleIntro ? [principleIntro] : []),
      ...principles.querySelectorAll('.principle-card h3, .principle-en')
    ];
    englishEls.forEach(el => splitChars(el));
    const introChars = [...(principleIntro?.querySelectorAll('.fill-char') || [])];
    const cardEnglishChars = [...principles.querySelectorAll('.principle-card h3 .fill-char, .principle-en .fill-char')];
    const cardKorean = [...principles.querySelectorAll('.principle-card > p:last-child')];
    const translationLine = [...translation.querySelectorAll('p')];

    // Initial state: all animated text starts at 5%.
    setChars(introChars, 0, '255,255,255');
    setChars(cardEnglishChars, 0, '255,255,255');
    setWhole(cardKorean, 0, '255,255,255');
    setWhole(translationLine, 0, '255,255,255');

    const updatePrinciples = () => {
      const r = principles.getBoundingClientRect();
      const travel = Math.max(1, principles.offsetHeight - innerHeight * 0.72);
      const p = clamp((innerHeight * 0.78 - r.top) / travel);

      // Intro English fills alphabet-by-alphabet.
      setChars(introChars, clamp(p / 0.23), '255,255,255');

      // Then intro English leaves upward/down-mask and concise Korean translation drops in.
      const introOut = clamp((p - 0.26) / 0.10);
      if (principleIntro) {
        principleIntro.style.opacity = String(1 - introOut);
        principleIntro.style.transform = `translateY(${introOut * 0.8}em)`;
        principleIntro.style.clipPath = `inset(0 0 ${introOut * 100}% 0)`;
      }
      const trIn = clamp((p - 0.32) / 0.09);
      translation.style.opacity = String(trIn);
      translation.style.transform = `translateY(${(1 - trIn) * -0.7}em)`;
      translation.style.clipPath = `inset(${(1 - trIn) * 100}% 0 0 0)`;
      setWhole(translationLine, clamp((p - 0.37) / 0.07), '255,255,255');

      const trOut = clamp((p - 0.48) / 0.08);
      if (trOut > 0) {
        translation.style.opacity = String(1 - trOut);
        translation.style.transform = `translateY(${trOut * 0.8}em)`;
        translation.style.clipPath = `inset(0 0 ${trOut * 100}% 0)`;
      }

      // Card English fills alphabet-by-alphabet; all three cards progress together.
      setChars(cardEnglishChars, clamp((p - 0.52) / 0.26), '255,255,255');

      // Korean card descriptions fill one sentence at a time, but 01/02/03 simultaneously.
      // Each p is a single unit and receives the exact same progress.
      setWhole(cardKorean, clamp((p - 0.72) / 0.12), '255,255,255');
    };

    updatePrinciples();
    addEventListener('scroll', updatePrinciples, { passive: true });
    addEventListener('resize', updatePrinciples);
  }
})();
