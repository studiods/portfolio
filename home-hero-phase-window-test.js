(() => {
  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const $ = (s, root = document) => root ? root.querySelector(s) : null;
  const $$ = (s, root = document) => root ? [...root.querySelectorAll(s)] : [];
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
    if (property.startsWith('--')) el.style.setProperty(property, value);
    else el.style[property] = value;
  };

  const setAttribute = (el, name, value) => {
    if (el && el.getAttribute(name) !== value) el.setAttribute(name, value);
  };

  const phaseProgress = (value, start, end) => {
    if (end <= start) return value >= end ? 1 : 0;
    return clamp((value - start) / (end - start));
  };

  const easeInOut = value => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };

  const splitChars = el => {
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

  $$('.js-char-fill').forEach(splitChars);

  const hero = $('#heroSequence');
  const quoteState = $('.hero-state-quote', hero);
  const heroQuote = $('.hero-quote', hero);
  const sourceOnly = $('.quote-source-only', hero);
  const definition = $('.hero-state-definition', hero);
  const definitionCopy = $('.definition-copy', hero);
  const definitionSource = $('.definition-source', hero);
  const subState = $('.hero-state-subtractive', hero);
  const subLines = $$('.subtractive-korean .fill-line', hero);
  subLines.forEach(splitChars);

  const quoteChars = $$('.hero-quote .fill-char', hero);
  const definitionChars = $$('.definition-copy .fill-char', hero);
  const definitionSourceChars = $$('.definition-source .fill-char', hero);
  const subChars = $$('.subtractive-title .fill-char', hero);
  const subKoreanChars = $$('.subtractive-korean .fill-char', hero);
  if (!hero || !quoteChars.length || !definitionChars.length) return;

  /*
    DIAGNOSTIC ONLY.
    Production English reveal: 0.000 -> 0.095.
    Test English reveal:       0.000 -> 0.190 (2x span).

    Production Korean definition reveal effectively spans about 0.257 -> 0.395.
    Test Korean reveal:                             0.257 -> 0.533 (2x span).

    Scramble cycle count and renderer math are intentionally unchanged.
  */
  const HERO = Object.freeze({
    quoteFillStart: 0,
    quoteFillEnd: 0.190,
    quoteHoldEnd: 0.245,
    quoteMorphEnd: 0.395,
    definitionRevealStart: 0.257,
    definitionRevealEnd: 0.533,
    definitionHoldEnd: 0.555,
    definitionEraseEnd: 0.695,
    subRevealStart: 0.625,
    subRevealEnd: 0.790,
    subFillEnd: 0.910,
    subCaptionFillEnd: 0.960
  });

  const SCRAMBLE_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const rememberFinalChars = chars => chars.forEach(char => {
    char.dataset.finalChar = char.textContent;
  });
  rememberFinalChars(quoteChars);
  rememberFinalChars(definitionChars);
  rememberFinalChars(definitionSourceChars);
  rememberFinalChars(subChars);
  rememberFinalChars(subKoreanChars);

  const randomGlyph = (index, step) =>
    SCRAMBLE_POOL[(index * 17 + step * 13) % SCRAMBLE_POOL.length];

  const setScrambleOverlay = (char, glyph, alpha = 1, rgb = '17,17,17') => {
    if (char.dataset.scramble !== glyph) char.dataset.scramble = glyph;
    if (!char.classList.contains('is-scrambling')) char.classList.add('is-scrambling');
    setStyle(char, '--scramble-alpha', clamp(alpha).toFixed(3));
    setStyle(char, '--scramble-rgb', rgb);
  };

  const clearScrambleOverlay = char => {
    if (char.classList.contains('is-scrambling')) char.classList.remove('is-scrambling');
  };

  const visibleCharEntries = chars => {
    let visibleIndex = 0;
    return chars.map(char => {
      const finalChar = char.dataset.finalChar ?? char.textContent;
      if (!finalChar.trim()) return { char, finalChar, index: -1 };
      return { char, finalChar, index: visibleIndex++ };
    });
  };

  const setWhole = (els, progress, rgb = '17,17,17', baseAlpha = 0.05) => {
    const alpha = (baseAlpha + (1 - baseAlpha) * clamp(progress)).toFixed(3);
    els.forEach(el => setStyle(el, 'color', `rgba(${rgb},${alpha})`));
  };

  const renderThreeCycleReveal = (
    chars,
    progress,
    rgb = '17,17,17',
    baseAlpha = 0,
    finalAlpha = 1,
    scrambleRatio = 0.78
  ) => {
    const entries = visibleCharEntries(chars);
    const count = entries.reduce((n, entry) => n + (entry.index >= 0 ? 1 : 0), 0) || 1;
    const sweep = easeInOut(clamp(progress)) * count;

    entries.forEach(({ char, index }) => {
      if (index < 0) {
        clearScrambleOverlay(char);
        return;
      }
      const local = clamp(sweep - index);
      if (local <= 0) {
        clearScrambleOverlay(char);
        setStyle(char, 'color', `rgba(${rgb},${baseAlpha})`);
      } else if (local < scrambleRatio) {
        const cycle = Math.min(2, Math.floor((local / scrambleRatio) * 3));
        setStyle(char, 'color', `rgba(${rgb},0)`);
        setScrambleOverlay(char, randomGlyph(index, cycle), finalAlpha, rgb);
      } else {
        clearScrambleOverlay(char);
        setStyle(char, 'color', `rgba(${rgb},${finalAlpha})`);
      }
    });
  };

  const renderScrambleToTarget = (chars, progress, rgb = '17,17,17') => {
    const entries = visibleCharEntries(chars);
    const count = entries.reduce((n, entry) => n + (entry.index >= 0 ? 1 : 0), 0) || 1;
    const p = clamp(progress);
    const sweep = easeInOut(p) * count;
    const step = Math.floor(p * count * 7);

    entries.forEach(({ char, index }) => {
      if (index < 0) {
        clearScrambleOverlay(char);
        return;
      }
      const local = clamp(sweep - index);
      if (local <= 0) {
        clearScrambleOverlay(char);
        setStyle(char, 'color', `rgba(${rgb},0)`);
      } else if (local < 0.72) {
        setStyle(char, 'color', `rgba(${rgb},0)`);
        setScrambleOverlay(char, randomGlyph(index, step), 1, rgb);
      } else {
        clearScrambleOverlay(char);
        setStyle(char, 'color', `rgba(${rgb},1)`);
      }
    });
  };

  const renderScrambleSource = (chars, progress, rgb = '17,17,17') => {
    const entries = visibleCharEntries(chars);
    const p = clamp(progress);
    const count = entries.reduce((n, entry) => n + (entry.index >= 0 ? 1 : 0), 0) || 1;
    const sweep = p * count;
    const step = Math.floor(p * count * 7);

    entries.forEach(({ char, index }) => {
      if (index < 0) return;
      if (p <= 0) {
        clearScrambleOverlay(char);
        return;
      }
      const local = clamp(sweep - index);
      if (local <= 0) {
        clearScrambleOverlay(char);
        setStyle(char, 'color', `rgba(${rgb},1)`);
      } else if (local < 0.68) {
        setStyle(char, 'color', `rgba(${rgb},0)`);
        setScrambleOverlay(char, randomGlyph(index, step), 1, rgb);
      } else if (local < 1) {
        setStyle(char, 'color', `rgba(${rgb},0)`);
        setScrambleOverlay(char, randomGlyph(index, step), (1 - local) / 0.32, rgb);
      } else {
        clearScrambleOverlay(char);
        setStyle(char, 'color', `rgba(${rgb},0)`);
      }
    });
  };

  const renderScrambleErase = (chars, progress, rgb = '17,17,17') => {
    const entries = visibleCharEntries(chars);
    const count = entries.reduce((n, entry) => n + (entry.index >= 0 ? 1 : 0), 0) || 1;
    const sweep = clamp(progress) * count;
    const step = Math.floor(clamp(progress) * count * 7);

    entries.forEach(({ char, index }) => {
      if (index < 0) return;
      const local = clamp(sweep - index);
      if (local <= 0) {
        clearScrambleOverlay(char);
        setStyle(char, 'color', `rgba(${rgb},1)`);
      } else if (local < 1) {
        setStyle(char, 'color', `rgba(${rgb},0)`);
        setScrambleOverlay(char, randomGlyph(index, step), 1 - local, rgb);
      } else {
        clearScrambleOverlay(char);
        setStyle(char, 'color', `rgba(${rgb},0)`);
      }
    });
  };

  const renderScrambleReveal = (chars, progress, rgb = '17,17,17') => {
    const entries = visibleCharEntries(chars);
    const count = entries.reduce((n, entry) => n + (entry.index >= 0 ? 1 : 0), 0) || 1;
    const sweep = clamp(progress) * count;
    const step = Math.floor(clamp(progress) * count * 7);

    entries.forEach(({ char, index }) => {
      if (index < 0) return;
      const local = clamp(sweep - index);
      if (local <= 0) {
        clearScrambleOverlay(char);
        setStyle(char, 'color', `rgba(${rgb},0)`);
      } else if (local < 0.72) {
        setStyle(char, 'color', `rgba(${rgb},0)`);
        setScrambleOverlay(char, randomGlyph(index, step), 1, rgb);
      } else {
        clearScrambleOverlay(char);
        setStyle(char, 'color', `rgba(${rgb},1)`);
      }
    });
  };

  const syncHeroTextMetrics = () => {
    if (!heroQuote || !definitionCopy) return;
    const quoteHeight = heroQuote.getBoundingClientRect().height;
    const definitionStyle = getComputedStyle(definitionCopy);
    const currentSize = parseFloat(definitionStyle.fontSize) || 1;
    const lineHeight = parseFloat(definitionStyle.lineHeight) || currentSize;
    const lineRatio = lineHeight / currentSize;
    const targetSize = quoteHeight / (4 * lineRatio);
    setStyle(definitionCopy, 'fontSize', `${targetSize.toFixed(3)}px`);
  };

  const renderHero = p => {
    renderThreeCycleReveal(
      quoteChars,
      phaseProgress(p, HERO.quoteFillStart, HERO.quoteFillEnd),
      '17,17,17',
      0.05
    );

    const quoteSourceStart = HERO.quoteFillStart +
      (HERO.quoteFillEnd - HERO.quoteFillStart) * 0.62;
    setWhole(
      sourceOnly ? [sourceOnly] : [],
      phaseProgress(p, quoteSourceStart, HERO.quoteFillEnd)
    );

    const quoteMorph = phaseProgress(p, HERO.quoteHoldEnd, HERO.quoteMorphEnd);
    const definitionErase = phaseProgress(p, HERO.definitionHoldEnd, HERO.definitionEraseEnd);
    renderScrambleSource(quoteChars, quoteMorph);
    setStyle(quoteState, 'opacity', '1');
    setStyle(quoteState, 'transform', 'none');
    setStyle(sourceOnly, 'opacity', (1 - easeInOut(quoteMorph)).toFixed(4));
    setStyle(definition, 'opacity', quoteMorph > 0 ? '1' : '0');
    setStyle(definition, 'transform', 'none');
    setStyle(definition, 'clipPath', 'none');

    renderScrambleToTarget(
      definitionChars,
      phaseProgress(p, HERO.definitionRevealStart, HERO.definitionRevealEnd)
    );
    renderScrambleToTarget(
      definitionSourceChars,
      phaseProgress(quoteMorph, 0.58, 1)
    );
    if (definitionErase > 0) {
      renderScrambleErase(definitionChars, definitionErase);
      renderScrambleErase(definitionSourceChars, definitionErase);
    }

    setAttribute(quoteState, 'aria-hidden', quoteMorph >= 0.999 ? 'true' : 'false');
    setAttribute(
      definition,
      'aria-hidden',
      quoteMorph <= 0.001 || definitionErase >= 0.999 ? 'true' : 'false'
    );

    const subReveal = phaseProgress(p, HERO.subRevealStart, HERO.subRevealEnd);
    setStyle(subState, 'opacity', subReveal > 0 ? '1' : '0');
    setStyle(subState, 'transform', 'none');
    setStyle(subState, 'clipPath', 'none');
    renderScrambleReveal(subChars, subReveal);
    renderThreeCycleReveal(
      subKoreanChars,
      phaseProgress(p, HERO.subFillEnd, HERO.subCaptionFillEnd),
      '17,17,17',
      0
    );
    setAttribute(subState, 'aria-hidden', subReveal <= 0.001 ? 'true' : 'false');
  };

  let heroTop = 0;
  let heroTravel = 1;
  let raf = 0;
  let lastHeroProgress = -1;

  const refreshMetrics = () => {
    syncHeroTextMetrics();
    heroTop = hero.getBoundingClientRect().top + scrollY;
    heroTravel = Math.max(1, hero.offsetHeight - innerHeight);
    lastHeroProgress = -1;
    requestRender();
  };

  const render = () => {
    raf = 0;
    const p = clamp((scrollY - heroTop) / heroTravel);
    if (Math.abs(p - lastHeroProgress) >= 0.0001) {
      renderHero(p);
      lastHeroProgress = p;
    }
  };

  const requestRender = () => {
    if (!raf) raf = requestAnimationFrame(render);
  };

  refreshMetrics();
  addEventListener('scroll', requestRender, { passive: true });
  addEventListener('resize', refreshMetrics, { passive: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refreshMetrics).catch(() => {});
  }
})();