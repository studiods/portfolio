(() => {
  'use strict';

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const DIGITS = '0123456789';
  const ALNUM_POOL = LETTERS + DIGITS;

  /*
    One rendering rule for every scramble on Home / About / Works:
    - random glyphs are painted by the real character node, never a pseudo layer;
    - the authored glyph width is frozen during the scramble;
    - the character therefore keeps the exact authored baseline and x-position;
    - every scramble uses A-Z + 0-9.

    The legacy pseudo glyphs are disabled before any later defer script can start
    an animation, so there is no first frame where a glyph can appear above the
    authored baseline.
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
      display:inline-block!important;
      width:var(--live-scramble-width)!important;
      min-width:var(--live-scramble-width)!important;
      max-width:var(--live-scramble-width)!important;
      position:static!important;
      top:auto!important;
      bottom:auto!important;
      left:auto!important;
      right:auto!important;
      vertical-align:baseline!important;
      line-height:inherit!important;
      transform:none!important;
      translate:none!important;
      margin:0!important;
      padding:0!important;
      overflow:visible!important;
      color:var(--live-scramble-color)!important;
    }

    html body.home-test .live-scramble-glyph.test-managed-char.test-progressive-scramble,
    html body .live-scramble-glyph.about-scramble-char.is-scrambling,
    html body .live-scramble-glyph.entry-scramble-char.is-scrambling,
    html body .live-scramble-glyph.fill-char.is-scrambling{
      color:var(--live-scramble-color)!important;
    }
  `;
  document.head.appendChild(style);

  const states = new WeakMap();
  const counters = new WeakMap();

  const isScrambling = (el) =>
    el.classList.contains('is-scrambling') ||
    el.classList.contains('test-progressive-scramble');

  const ensureState = (el) => {
    let state = states.get(el);
    if (state) return state;

    state = {
      finalChar: el.dataset.finalChar || el.textContent,
      width: Math.max(0, el.getBoundingClientRect().width),
      active: false
    };
    states.set(el, state);
    return state;
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

  const mixedGlyph = (el, raw) => {
    const count = (counters.get(el) || 0) + 1;
    counters.set(el, count);
    const code = raw?.charCodeAt?.(0) || 0;

    if (count % 3 === 0) {
      return DIGITS[(code + count * 7) % DIGITS.length];
    }
    return LETTERS[(code + count * 11) % LETTERS.length];
  };

  const activate = (el, rawGlyph, attr) => {
    if (!(el instanceof Element) || !rawGlyph) return;
    const state = ensureState(el);

    if (!state.active) {
      el.textContent = state.finalChar;
      state.width = Math.max(0, el.getBoundingClientRect().width);
      el.style.setProperty('--live-scramble-width', `${state.width.toFixed(3)}px`);
      el.classList.add('live-scramble-glyph');
      state.active = true;
    }

    el.style.setProperty('--live-scramble-color', scrambleColor(el, attr));
    el.textContent = mixedGlyph(el, rawGlyph);
  };

  const restore = (el) => {
    const state = states.get(el);
    if (!state || !state.active) return;

    state.active = false;
    el.textContent = state.finalChar;
    el.classList.remove('live-scramble-glyph');
    el.style.removeProperty('--live-scramble-width');
    el.style.removeProperty('--live-scramble-color');
  };

  const syncElement = (el, attr) => {
    if (!(el instanceof Element)) return;
    if (!isScrambling(el)) {
      restore(el);
      return;
    }

    const dataAttr = attr === 'data-test-scramble' || el.hasAttribute('data-test-scramble')
      ? 'data-test-scramble'
      : 'data-scramble';
    const glyph = el.getAttribute(dataAttr);
    if (glyph && /^[A-Z0-9]$/i.test(glyph)) activate(el, glyph.toUpperCase(), dataAttr);
  };

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const el = mutation.target;
      if (!(el instanceof Element)) return;

      if (mutation.type === 'attributes') {
        const attr = mutation.attributeName;
        if (
          attr === 'data-scramble' ||
          attr === 'data-test-scramble' ||
          attr === 'class'
        ) {
          syncElement(el, attr);
        }
      }
    });
  });

  observer.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-scramble', 'data-test-scramble', 'class']
  });

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

    const frame = (now) => {
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
          char.dataset.scramble = glyph;
          char.classList.add('is-scrambling');
        } else {
          char.classList.remove('is-scrambling');
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