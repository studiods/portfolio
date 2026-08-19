(() => {
  'use strict';

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const DIGITS = '0123456789';
  const ALNUM_POOL = LETTERS + DIGITS;

  /*
    Shared scramble renderer for Home / About / Works.

    Rules:
    - random glyphs are drawn by the authored character node itself;
    - the node stays inline, so its baseline / line box never changes;
    - the authored advance width is preserved with temporary letter-spacing;
    - a timeline state class is paired only with its own data attribute;
    - MutationObserver batches are collapsed to one render per element;
    - visible random states use A-Z + 0-9.
  */
  const style = document.createElement('style');
  style.id = 'live-scramble-style';
  style.textContent = `
    .fill-char.is-scrambling::before,
    .fill-char.is-scrambling::after,
    .test-managed-char.test-progressive-scramble::before,
    .test-managed-char.test-progressive-scramble::after,
    .about-scramble-char.is-scrambling::before,
    .about-scramble-char.is-scrambling::after,
    .entry-scramble-char.is-scrambling::before,
    .entry-scramble-char.is-scrambling::after{
      content:none!important;
      display:none!important;
    }

    html body .live-scramble-glyph{
      display:inline!important;
      position:static!important;
      top:auto!important;
      bottom:auto!important;
      left:auto!important;
      right:auto!important;
      width:auto!important;
      min-width:0!important;
      max-width:none!important;
      vertical-align:baseline!important;
      line-height:inherit!important;
      transform:none!important;
      translate:none!important;
      margin:0!important;
      padding:0!important;
      overflow:visible!important;
    }

    /*
      Legacy CSS intentionally makes the authored glyph transparent while a
      pseudo-element displays the random glyph. The pseudo-element is disabled
      above, so the live-node renderer must explicitly win that old !important
      transparency rule. Keep these selectors state-specific: resolved/pending
      characters are still painted by their owning timeline.
    */
    html body .fill-char.live-scramble-glyph.is-scrambling,
    html body .about-scramble-char.live-scramble-glyph.is-scrambling,
    html body .entry-scramble-char.live-scramble-glyph.is-scrambling,
    html body.home-test .test-managed-char.live-scramble-glyph.test-progressive-scramble{
      color:var(--live-scramble-color)!important;
    }
  `;
  document.head.appendChild(style);

  const states = new WeakMap();
  const counters = new WeakMap();

  const ensureState = el => {
    let state = states.get(el);
    if (state) return state;
    state = {
      finalChar: el.dataset.finalChar || el.textContent,
      finalWidth: 0,
      active: false,
      inlineLetterSpacing: '',
      lastAttr: '',
      lastRawGlyph: ''
    };
    states.set(el, state);
    return state;
  };

  const resolveTimelineAttr = el => {
    if (
      el.classList.contains('test-progressive-scramble') &&
      el.hasAttribute('data-test-scramble')
    ) {
      return 'data-test-scramble';
    }
    if (
      el.classList.contains('is-scrambling') &&
      el.hasAttribute('data-scramble')
    ) {
      return 'data-scramble';
    }
    return '';
  };

  const scrambleColor = (el, attr) => {
    const computed = getComputedStyle(el);
    const rgb = (
      attr === 'data-test-scramble'
        ? computed.getPropertyValue('--test-rgb')
        : computed.getPropertyValue('--scramble-rgb')
    ).trim();
    const alpha = (
      attr === 'data-test-scramble'
        ? computed.getPropertyValue('--test-scramble-alpha')
        : computed.getPropertyValue('--scramble-alpha')
    ).trim();

    if (rgb) return `rgba(${rgb},${alpha || '1'})`;
    const parentColor = el.parentElement ? getComputedStyle(el.parentElement).color : '';
    return parentColor || '#fff';
  };

  /* Every short sequence visibly contains a numeric state. */
  const mixedGlyph = (el, raw) => {
    const count = (counters.get(el) || 0) + 1;
    counters.set(el, count);
    const code = raw?.charCodeAt?.(0) || 0;

    if (count % 3 === 0) {
      return DIGITS[(code + count * 7) % DIGITS.length];
    }
    return LETTERS[(code + count * 11) % LETTERS.length];
  };

  const beginActiveState = (el, state) => {
    state.inlineLetterSpacing = el.style.letterSpacing;
    el.textContent = state.finalChar;
    el.style.removeProperty('letter-spacing');
    state.finalWidth = Math.max(0, el.getBoundingClientRect().width);
    state.active = true;
    if (!el.classList.contains('live-scramble-glyph')) {
      el.classList.add('live-scramble-glyph');
    }
  };

  const preserveAdvanceWidth = (el, state, glyph) => {
    el.style.letterSpacing = '0px';
    el.textContent = glyph;
    const glyphWidth = Math.max(0, el.getBoundingClientRect().width);
    const compensation = state.finalWidth - glyphWidth;
    el.style.letterSpacing = `${compensation.toFixed(3)}px`;
  };

  const activate = (el, rawGlyph, attr) => {
    if (!(el instanceof Element) || !rawGlyph) return;
    const state = ensureState(el);
    if (!state.active) beginActiveState(el, state);

    el.style.setProperty('--live-scramble-color', scrambleColor(el, attr));

    /* A class mutation created by this renderer can trigger the observer again.
       Do not generate another random character unless the owning timeline has
       actually changed its raw glyph or source attribute. */
    if (state.lastAttr === attr && state.lastRawGlyph === rawGlyph) return;

    state.lastAttr = attr;
    state.lastRawGlyph = rawGlyph;
    preserveAdvanceWidth(el, state, mixedGlyph(el, rawGlyph));
  };

  const restore = el => {
    const state = states.get(el);
    if (!state || !state.active) return;

    state.active = false;
    state.lastAttr = '';
    state.lastRawGlyph = '';
    el.textContent = state.finalChar;
    if (state.inlineLetterSpacing) {
      el.style.letterSpacing = state.inlineLetterSpacing;
    } else {
      el.style.removeProperty('letter-spacing');
    }
    el.classList.remove('live-scramble-glyph');
    el.style.removeProperty('--live-scramble-color');
  };

  const syncElement = el => {
    if (!(el instanceof Element)) return;
    const attr = resolveTimelineAttr(el);
    if (!attr) {
      restore(el);
      return;
    }

    const glyph = el.getAttribute(attr);
    if (glyph && /^[A-Z0-9]$/i.test(glyph)) {
      activate(el, glyph.toUpperCase(), attr);
    } else {
      restore(el);
    }
  };

  const observer = new MutationObserver(mutations => {
    const targets = new Set();
    mutations.forEach(mutation => {
      if (mutation.type !== 'attributes') return;
      const attr = mutation.attributeName;
      if (
        attr === 'data-scramble' ||
        attr === 'data-test-scramble' ||
        attr === 'class'
      ) {
        targets.add(mutation.target);
      }
    });
    targets.forEach(syncElement);
  });

  observer.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-scramble', 'data-test-scramble', 'class']
  });

  /* ABOUT / WORKS entry titles retain their existing one-second timing. */
  const animateEntryTitle = (selector, fallbackText, readyClass) => {
    const title = document.querySelector(selector);
    if (!title || title.dataset.scrambleEnhanced === '1') return;
    title.dataset.scrambleEnhanced = '1';

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finalText = title.textContent.trim() || fallbackText;
    title.classList.add(readyClass);

    if (reducedMotion) return;

    title.textContent = '';
    const chars = Array.from(finalText).map((character, index) => {
      const span = document.createElement('span');
      span.className = 'about-scramble-char entry-scramble-char';
      span.textContent = character;
      span.dataset.finalChar = character;
      span.style.color = 'transparent';
      span.dataset.entryTitleIndex = String(index);
      title.appendChild(span);
      return span;
    });

    const TOTAL_MS = 1000;
    const slotMs = TOTAL_MS / Math.max(1, chars.length);
    const cycleMs = slotMs / 4;
    const cycles = 4;
    const startedAt = performance.now();

    const frame = now => {
      let complete = true;
      chars.forEach((char, index) => {
        const elapsed = now - startedAt - index * slotMs;
        if (elapsed < 0) {
          complete = false;
          return;
        }

        if (elapsed < slotMs) {
          complete = false;
          const cycle = Math.min(cycles - 1, Math.floor(elapsed / cycleMs));
          const glyph = ALNUM_POOL[(index * 13 + cycle * 17) % ALNUM_POOL.length];
          if (char.dataset.scramble !== glyph) char.dataset.scramble = glyph;
          if (!char.classList.contains('is-scrambling')) char.classList.add('is-scrambling');
        } else {
          if (char.classList.contains('is-scrambling')) char.classList.remove('is-scrambling');
          char.style.color = '';
        }
      });

      if (!complete) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  };

  animateEntryTitle('.about-ascii-title', 'ABOUT', 'about-title-scramble-ready');
  animateEntryTitle('.works-page-title', 'WORKS', 'works-title-scramble-ready');
})();