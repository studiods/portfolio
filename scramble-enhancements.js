(() => {
  'use strict';

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const DIGITS = '0123456789';
  const ALNUM_POOL = LETTERS + DIGITS;

  /*
    Initial English scramble must occupy the authored glyph's exact position.
    Existing animations paint random glyphs with absolutely-positioned pseudo
    elements, whose top edge is not the font baseline. This shared layer keeps
    the animation timing intact but paints the random glyph through the live
    character node itself. The authored advance width is frozen only during the
    initial scramble so neighboring letters never shift.

    Morph/erase animations are intentionally excluded: once a character has
    resolved for the first time, this layer never intercepts that character
    again.
  */
  const style = document.createElement('style');
  style.id = 'baseline-live-scramble-style';
  style.textContent = `
    html body .baseline-live-scramble{
      display:inline-block!important;
      width:var(--baseline-live-width)!important;
      min-width:var(--baseline-live-width)!important;
      max-width:var(--baseline-live-width)!important;
      position:static!important;
      vertical-align:baseline!important;
      line-height:inherit!important;
      transform:none!important;
      translate:none!important;
      margin:0!important;
      padding:0!important;
      color:var(--baseline-live-color)!important;
      overflow:visible!important;
    }
    html body .baseline-live-scramble.is-scrambling::before,
    html body .baseline-live-scramble.is-scrambling::after,
    body.home-test .baseline-live-scramble.test-managed-char.test-progressive-scramble::before,
    body.home-test .baseline-live-scramble.test-managed-char.test-progressive-scramble::after{
      content:none!important;
      display:none!important;
    }
  `;
  document.head.appendChild(style);

  const baselineStates = new WeakMap();

  const initialEnglishRoot = (el) => el.closest(
    '.hero-quote, ' +
    '.subtractive-title, ' +
    '.principles-intro-en, ' +
    '.showcase-project h3, ' +
    '.about-ascii-title, ' +
    '.works-page-title, ' +
    '.about-statement-en'
  );

  const isInitialEnglishTarget = (el) => {
    if (!(el instanceof Element)) return false;
    return Boolean(initialEnglishRoot(el));
  };

  const isScramblingNow = (el) =>
    el.classList.contains('is-scrambling') ||
    el.classList.contains('test-progressive-scramble');

  const ensureBaselineState = (el) => {
    let state = baselineStates.get(el);
    if (state) return state;

    const finalChar = el.dataset.finalChar || el.textContent;
    state = {
      finalChar,
      width: Math.max(0, el.getBoundingClientRect().width),
      active: false,
      done: false
    };
    baselineStates.set(el, state);
    return state;
  };

  const liveColorFor = (el, attr) => {
    const computed = getComputedStyle(el);
    const rgbVar = (
      attr === 'data-test-scramble'
        ? computed.getPropertyValue('--test-rgb')
        : computed.getPropertyValue('--scramble-rgb')
    ).trim();
    const alphaVar = (
      attr === 'data-test-scramble'
        ? computed.getPropertyValue('--test-scramble-alpha')
        : computed.getPropertyValue('--scramble-alpha')
    ).trim();

    if (rgbVar) {
      const alpha = alphaVar || '1';
      return `rgba(${rgbVar},${alpha})`;
    }

    const parent = el.parentElement;
    return parent ? getComputedStyle(parent).color : 'currentColor';
  };

  const activateBaselineGlyph = (el, glyph, attr) => {
    if (!isInitialEnglishTarget(el)) return;
    const state = ensureBaselineState(el);
    if (state.done || !glyph) return;

    if (!state.active) {
      /* Measure while the authored glyph still owns its natural advance width. */
      el.textContent = state.finalChar;
      state.width = Math.max(0, el.getBoundingClientRect().width);
      el.style.setProperty('--baseline-live-width', `${state.width.toFixed(3)}px`);
      el.classList.add('baseline-live-scramble');
      state.active = true;
    }

    el.style.setProperty('--baseline-live-color', liveColorFor(el, attr));
    el.textContent = glyph;
  };

  const finishInitialBaseline = (el) => {
    const state = baselineStates.get(el);
    if (!state || state.done || !state.active) return;
    state.active = false;
    state.done = true;
    el.textContent = state.finalChar;
    el.classList.remove('baseline-live-scramble');
    el.style.removeProperty('--baseline-live-width');
    el.style.removeProperty('--baseline-live-color');
  };

  const baselineObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const el = mutation.target;
      if (!(el instanceof Element) || !isInitialEnglishTarget(el)) return;

      if (mutation.type === 'attributes') {
        const attr = mutation.attributeName;
        if (attr === 'data-scramble' || attr === 'data-test-scramble') {
          const glyph = el.getAttribute(attr);
          const state = baselineStates.get(el);
          if ((!state || !state.done) && glyph) activateBaselineGlyph(el, glyph, attr);
          return;
        }

        if (attr === 'class') {
          const state = baselineStates.get(el);
          if (state?.active && !isScramblingNow(el)) finishInitialBaseline(el);
        }
      }
    });
  });

  baselineObserver.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-scramble', 'data-test-scramble', 'class']
  });

  /*
    Keep the existing A-Z / 0-9 normalization on About and Works. The Home page
    intentionally keeps its own authored scramble pool; this shared script is
    loaded there only for baseline correction.
  */
  const counters = new WeakMap();
  const suppressed = new WeakMap();
  const normalizePoolOnThisPage = !document.body.classList.contains('home-test');

  const markSuppressed = (el, attr) => {
    let attrs = suppressed.get(el);
    if (!attrs) {
      attrs = new Set();
      suppressed.set(el, attrs);
    }
    attrs.add(attr);
  };

  const consumeSuppressed = (el, attr) => {
    const attrs = suppressed.get(el);
    if (!attrs || !attrs.has(attr)) return false;
    attrs.delete(attr);
    return true;
  };

  const mixedGlyph = (el, attr, raw) => {
    const nextCount = (counters.get(el) || 0) + 1;
    counters.set(el, nextCount);
    const code = raw?.charCodeAt?.(0) || 0;
    const salt = attr === 'data-test-scramble' ? 17 : 29;

    if (nextCount % 4 === 0 || nextCount % 7 === 3) {
      return DIGITS[(code + nextCount * 7 + salt) % DIGITS.length];
    }
    return LETTERS[(code + nextCount * 11 + salt) % LETTERS.length];
  };

  const normalizeScrambleAttribute = (el, attr) => {
    if (!normalizePoolOnThisPage || !(el instanceof Element)) return;
    if (consumeSuppressed(el, attr)) return;
    const raw = el.getAttribute(attr);
    if (!raw || !/^[A-Z0-9]$/.test(raw)) return;
    const next = mixedGlyph(el, attr, raw);
    if (next === raw) return;
    markSuppressed(el, attr);
    el.setAttribute(attr, next);
  };

  const poolObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type !== 'attributes') return;
      const attr = mutation.attributeName;
      if (attr !== 'data-scramble' && attr !== 'data-test-scramble') return;
      normalizeScrambleAttribute(mutation.target, attr);
    });
  });

  if (normalizePoolOnThisPage) {
    poolObserver.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-scramble', 'data-test-scramble']
    });
  }

  /* Entry titles keep their existing one-second timing; only painting changes. */
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