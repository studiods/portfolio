(() => {
  'use strict';

  const hero = document.querySelector('#heroSequence');
  const quote = hero?.querySelector('.hero-quote');
  const definition = hero?.querySelector('.definition-copy');
  const quoteChars = quote ? [...quote.querySelectorAll('.fill-char')] : [];
  const definitionChars = definition ? [...definition.querySelectorAll('.fill-char')] : [];
  if (!hero || !quote || !definition || !quoteChars.length || !definitionChars.length) return;

  /*
    TEST ONLY — root-cause fix for fast-scroll skipping.

    Production maps absolute scrollY directly to Hero progress. Large wheel or
    trackpad deltas can therefore jump over multiple per-glyph scramble states
    between two painted frames.

    This test changes two things:
    1) one authored position owns the scramble at a time;
    2) while the Hero is active, wheel / trackpad / touch / page-key input is
       converted into controlled real scroll movement. In reveal windows the
       maximum physical scroll step is derived from one glyph slot, so a frame
       cannot jump across a random state.

    There is no autonomous playback. If the user stops providing scroll input,
    the controller only finishes the small already-accepted scroll fragment and
    then stops. More progress still requires more physical scrolling.
  */

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const DIGITS = '0123456789';
  const RANDOM_VARIANTS_PER_GLYPH = 8;

  /* Wider than production, but still contained before the next Hero state. */
  const HERO = Object.freeze({
    quoteFillStart: 0.015,
    quoteFillEnd: 0.205,
    definitionFillStart: 0.260,
    definitionFillEnd: 0.465
  });

  /* Physical input tuning. */
  const REVEAL_INPUT_RESISTANCE = 0.56;
  const NORMAL_INPUT_RESISTANCE = 0.76;
  const REVEAL_TARGET_LEAD_PX = 42;
  const NORMAL_TARGET_LEAD_PX = 150;
  const NORMAL_MAX_STEP_PX = 16;
  const REVEAL_STEP_SAFETY = 0.82;

  const quoteFinalChars = quoteChars.map(char => char.dataset.finalChar ?? char.textContent);
  const definitionFinalChars = definitionChars.map(char => char.dataset.finalChar ?? char.textContent);
  const sourceOnly = hero.querySelector('.quote-source-only');

  const visibleCount = finalChars => finalChars.reduce(
    (count, char) => count + ((char || '').trim() ? 1 : 0),
    0
  );
  const quoteVisibleCount = Math.max(1, visibleCount(quoteFinalChars));
  const definitionVisibleCount = Math.max(1, visibleCount(definitionFinalChars));

  let widths = new WeakMap();
  let paintRaf = 0;
  let scrollRaf = 0;
  let controlledTargetY = scrollY;
  let touchY = null;

  const style = document.createElement('style');
  style.id = 'hero-scramble-scroll-test-style';
  style.textContent = `
    #heroSequence .fill-char[data-scroll-test-state="pending"]{
      color:rgba(17,17,17,.05)!important;
    }
    #heroSequence .fill-char[data-scroll-test-state="active"],
    #heroSequence .fill-char[data-scroll-test-state="final"]{
      color:rgba(17,17,17,1)!important;
      display:inline!important;
      position:static!important;
      vertical-align:baseline!important;
      line-height:inherit!important;
      transform:none!important;
      translate:none!important;
    }
    #heroSequence .fill-char[data-scroll-test-state]::before,
    #heroSequence .fill-char[data-scroll-test-state]::after{
      content:none!important;
      display:none!important;
    }
  `;
  document.head.appendChild(style);

  const clamp = value => Math.max(0, Math.min(1, value));
  const clampRange = (value, min, max) => Math.max(min, Math.min(max, value));
  const phaseProgress = (value, start, end) => {
    if (end <= start) return value >= end ? 1 : 0;
    return clamp((value - start) / (end - start));
  };

  const heroMetrics = () => {
    const top = hero.getBoundingClientRect().top + scrollY;
    const travel = Math.max(1, hero.offsetHeight - innerHeight);
    return { top, travel, end: top + travel };
  };

  const progressForY = (y, metrics = heroMetrics()) =>
    clamp((y - metrics.top) / metrics.travel);

  const isRevealProgress = p =>
    (p >= Math.max(0, HERO.quoteFillStart - 0.015) && p <= HERO.quoteFillEnd + 0.015) ||
    (p >= HERO.definitionFillStart - 0.015 && p <= HERO.definitionFillEnd + 0.015);

  const revealStepPx = (p, metrics) => {
    let windowSize = HERO.quoteFillEnd - HERO.quoteFillStart;
    let count = quoteVisibleCount;

    if (p >= HERO.definitionFillStart - 0.015) {
      windowSize = HERO.definitionFillEnd - HERO.definitionFillStart;
      count = definitionVisibleCount;
    }

    const windowPx = Math.max(1, metrics.travel * windowSize);
    const glyphSlotPx = windowPx / Math.max(1, count);
    const statePx = glyphSlotPx / (RANDOM_VARIANTS_PER_GLYPH + 1);

    /* Never move farther than roughly one random-state width per painted frame. */
    return clampRange(statePx * REVEAL_STEP_SAFETY, 0.65, 3.0);
  };

  const clearLegacyScramble = char => {
    char.classList.remove('is-scrambling', 'live-scramble-glyph');
    char.removeAttribute('data-scramble');
    char.removeAttribute('data-hero-direct-scramble');
    char.style.removeProperty('--live-scramble-width');
    char.style.removeProperty('--live-scramble-color');
    char.style.removeProperty('--scramble-alpha');
    char.style.removeProperty('--scramble-rgb');
  };

  const measureFinalWidth = (char, finalChar) => {
    if (widths.has(char)) return widths.get(char);
    const previousText = char.textContent;
    const previousSpacing = char.style.letterSpacing;
    clearLegacyScramble(char);
    char.textContent = finalChar;
    char.style.letterSpacing = '0px';
    const width = Math.max(0, char.getBoundingClientRect().width);
    char.textContent = previousText;
    char.style.letterSpacing = previousSpacing;
    widths.set(char, width);
    return width;
  };

  const setPending = (char, finalChar) => {
    clearLegacyScramble(char);
    char.textContent = finalChar;
    char.style.removeProperty('letter-spacing');
    char.setAttribute('data-scroll-test-state', 'pending');
  };

  const setFinal = (char, finalChar) => {
    clearLegacyScramble(char);
    char.textContent = finalChar;
    char.style.removeProperty('letter-spacing');
    char.setAttribute('data-scroll-test-state', 'final');
  };

  const showGlyph = (char, finalChar, glyph) => {
    const finalWidth = measureFinalWidth(char, finalChar);
    clearLegacyScramble(char);
    char.style.letterSpacing = '0px';
    char.textContent = glyph;
    const glyphWidth = Math.max(0, char.getBoundingClientRect().width);
    if (finalWidth > 0) {
      char.style.letterSpacing = `${(finalWidth - glyphWidth).toFixed(3)}px`;
    }
    char.setAttribute('data-scroll-test-state', 'active');
  };

  const releaseAll = (chars, finalChars) => {
    chars.forEach((char, index) => {
      clearLegacyScramble(char);
      char.textContent = finalChars[index];
      char.style.removeProperty('letter-spacing');
      char.removeAttribute('data-scroll-test-state');
    });
  };

  const randomGlyph = (activeIndex, variant, finalChar) => {
    const seed = activeIndex * 31 + variant * 47 + (finalChar.codePointAt(0) || 0);
    /* Guarantee a visible mix of letters and numbers while still looking random. */
    if ((variant + activeIndex) % 3 === 2) {
      return DIGITS[Math.abs(seed) % DIGITS.length];
    }
    return LETTERS[Math.abs(seed) % LETTERS.length];
  };

  const paintSequential = (chars, finalChars, progress) => {
    const visible = chars
      .map((char, domIndex) => ({ char, finalChar: finalChars[domIndex] }))
      .filter(entry => entry.finalChar.trim().length > 0);

    if (!visible.length) return;

    const p = clamp(progress);
    if (p >= 1) {
      visible.forEach(({ char, finalChar }) => setFinal(char, finalChar));
      return;
    }

    if (p <= 0) {
      visible.forEach(({ char, finalChar }) => setPending(char, finalChar));
      return;
    }

    /* Strictly one active authored position at a time. */
    const position = p * visible.length;
    const activeIndex = Math.min(visible.length - 1, Math.floor(position));
    const local = clamp(position - activeIndex);
    const variant = Math.min(
      RANDOM_VARIANTS_PER_GLYPH - 1,
      Math.floor(local * RANDOM_VARIANTS_PER_GLYPH)
    );

    visible.forEach(({ char, finalChar }, index) => {
      if (index < activeIndex) {
        setFinal(char, finalChar);
      } else if (index > activeIndex) {
        setPending(char, finalChar);
      } else {
        showGlyph(char, finalChar, randomGlyph(activeIndex, variant, finalChar));
      }
    });
  };

  const render = () => {
    const metrics = heroMetrics();
    const p = progressForY(scrollY, metrics);

    const quoteProgress = phaseProgress(p, HERO.quoteFillStart, HERO.quoteFillEnd);
    if (p <= HERO.quoteFillEnd) {
      paintSequential(quoteChars, quoteFinalChars, quoteProgress);
      if (sourceOnly) {
        const sourceProgress = phaseProgress(quoteProgress, 0.82, 1);
        sourceOnly.style.opacity = sourceProgress.toFixed(3);
      }
    } else {
      releaseAll(quoteChars, quoteFinalChars);
    }

    const definitionProgress = phaseProgress(
      p,
      HERO.definitionFillStart,
      HERO.definitionFillEnd
    );
    if (p < HERO.definitionFillStart) {
      paintSequential(definitionChars, definitionFinalChars, 0);
    } else if (p <= HERO.definitionFillEnd) {
      paintSequential(definitionChars, definitionFinalChars, definitionProgress);
    } else {
      releaseAll(definitionChars, definitionFinalChars);
    }
  };

  const requestPaint = () => {
    if (paintRaf) return;
    paintRaf = requestAnimationFrame(() => {
      paintRaf = 0;
      render();
    });
  };

  const animateControlledScroll = () => {
    scrollRaf = 0;

    const metrics = heroMetrics();
    const y = scrollY;
    const remaining = controlledTargetY - y;
    if (Math.abs(remaining) < 0.2) {
      controlledTargetY = y;
      requestPaint();
      return;
    }

    const p = progressForY(y, metrics);
    const direction = Math.sign(remaining);
    const normalCandidate = direction * Math.min(Math.abs(remaining), NORMAL_MAX_STEP_PX);
    const candidateP = progressForY(y + normalCandidate, metrics);
    const revealNearby = isRevealProgress(p) || isRevealProgress(candidateP);
    const maxStep = revealNearby ? revealStepPx(p, metrics) : NORMAL_MAX_STEP_PX;
    const step = direction * Math.min(Math.abs(remaining), maxStep);

    scrollTo(0, y + step);
    requestPaint();

    if (Math.abs(controlledTargetY - scrollY) >= 0.2) {
      scrollRaf = requestAnimationFrame(animateControlledScroll);
    }
  };

  const requestControlledScroll = () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(animateControlledScroll);
  };

  const queueInputDelta = rawDelta => {
    if (!Number.isFinite(rawDelta) || Math.abs(rawDelta) < 0.01) return false;

    const metrics = heroMetrics();
    const y = scrollY;
    const atTop = y <= metrics.top + 0.5;
    const atEnd = y >= metrics.end - 0.5;

    if ((rawDelta < 0 && atTop) || (rawDelta > 0 && atEnd)) {
      controlledTargetY = y;
      return false;
    }

    const p = progressForY(y, metrics);
    const reveal = isRevealProgress(p);
    const resistance = reveal ? REVEAL_INPUT_RESISTANCE : NORMAL_INPUT_RESISTANCE;
    const maxLead = reveal ? REVEAL_TARGET_LEAD_PX : NORMAL_TARGET_LEAD_PX;

    if (Math.abs(controlledTargetY - y) > maxLead) {
      controlledTargetY = y + Math.sign(controlledTargetY - y) * maxLead;
    }

    controlledTargetY += rawDelta * resistance;
    controlledTargetY = clampRange(controlledTargetY, y - maxLead, y + maxLead);
    controlledTargetY = clampRange(controlledTargetY, metrics.top, metrics.end);
    requestControlledScroll();
    return true;
  };

  const normalizeWheelDelta = event => {
    if (event.deltaMode === 1) return event.deltaY * 16;
    if (event.deltaMode === 2) return event.deltaY * innerHeight;
    return event.deltaY;
  };

  const onWheel = event => {
    if (event.ctrlKey) return;
    const metrics = heroMetrics();
    const y = scrollY;
    const insideHero = y >= metrics.top - 0.5 && y <= metrics.end + 0.5;
    if (!insideHero) {
      controlledTargetY = y;
      return;
    }

    const delta = normalizeWheelDelta(event);
    if (queueInputDelta(delta)) event.preventDefault();
  };

  const onKeyDown = event => {
    const metrics = heroMetrics();
    const y = scrollY;
    if (y < metrics.top - 0.5 || y > metrics.end + 0.5) return;

    let delta = 0;
    if (event.key === 'ArrowDown') delta = 54;
    else if (event.key === 'ArrowUp') delta = -54;
    else if (event.key === 'PageDown' || (event.key === ' ' && !event.shiftKey)) delta = innerHeight * 0.38;
    else if (event.key === 'PageUp' || (event.key === ' ' && event.shiftKey)) delta = -innerHeight * 0.38;
    else return;

    if (queueInputDelta(delta)) event.preventDefault();
  };

  const onTouchStart = event => {
    touchY = event.touches?.[0]?.clientY ?? null;
    controlledTargetY = scrollY;
  };

  const onTouchMove = event => {
    const nextY = event.touches?.[0]?.clientY;
    if (!Number.isFinite(nextY) || !Number.isFinite(touchY)) return;
    const delta = touchY - nextY;
    touchY = nextY;

    const metrics = heroMetrics();
    const y = scrollY;
    if (y < metrics.top - 0.5 || y > metrics.end + 0.5) return;
    if (queueInputDelta(delta)) event.preventDefault();
  };

  addEventListener('wheel', onWheel, { passive: false, capture: true });
  addEventListener('keydown', onKeyDown, { capture: true });
  addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
  addEventListener('touchmove', onTouchMove, { passive: false, capture: true });

  addEventListener('scroll', requestPaint, { passive: true });
  addEventListener('resize', () => {
    widths = new WeakMap();
    controlledTargetY = scrollY;
    requestPaint();
  }, { passive: true });

  controlledTargetY = scrollY;
  requestPaint();
})();
