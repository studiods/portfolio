(() => {
  'use strict';

  const hero = document.querySelector('#heroSequence');
  const quote = hero?.querySelector('.hero-quote');
  const definition = hero?.querySelector('.definition-copy');
  const quoteChars = quote ? [...quote.querySelectorAll('.fill-char')] : [];
  const definitionChars = definition ? [...definition.querySelectorAll('.fill-char')] : [];
  if (!hero || !quote || !definition || !quoteChars.length || !definitionChars.length) return;

  /*
    TEST ONLY — six guaranteed painted random frames per authored glyph.

    Native scrolling is left completely untouched. Scroll speed only updates the
    desired reveal position. The visible text catches up through a small render
    queue, and one authored position must paint exactly six random glyph frames
    before it can resolve to the authored character and hand off to the next one.

    A fast wheel / trackpad gesture can therefore move the page normally, but it
    cannot collapse the current glyph into a simple sequential fill. No wheel,
    touch, keyboard, deltaY, resistance, or controlled-scroll code exists here.
  */

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const DIGITS = '0123456789';
  const RANDOM_FRAMES_PER_GLYPH = 6;

  /* Match the production Hero timing again. */
  const HERO = Object.freeze({
    quoteFillStart: 0,
    quoteFillEnd: 0.095,
    quoteHoldEnd: 0.245,
    quoteMorphEnd: 0.395,
    definitionRevealStartInMorph: 0.08
  });

  const quoteFinalChars = quoteChars.map(char => char.dataset.finalChar ?? char.textContent);
  const definitionFinalChars = definitionChars.map(char => char.dataset.finalChar ?? char.textContent);
  const sourceOnly = hero.querySelector('.quote-source-only');

  let widths = new WeakMap();
  let raf = 0;

  const style = document.createElement('style');
  style.id = 'hero-scramble-six-frame-test-style';
  style.textContent = `
    #heroSequence .fill-char[data-six-frame-state="pending"]{
      color:rgba(17,17,17,.05)!important;
    }
    #heroSequence .fill-char[data-six-frame-state="active"],
    #heroSequence .fill-char[data-six-frame-state="final"]{
      color:rgba(17,17,17,1)!important;
      display:inline!important;
      position:static!important;
      vertical-align:baseline!important;
      line-height:inherit!important;
      transform:none!important;
      translate:none!important;
    }
    #heroSequence .fill-char[data-six-frame-state]::before,
    #heroSequence .fill-char[data-six-frame-state]::after{
      content:none!important;
      display:none!important;
    }
  `;
  document.head.appendChild(style);

  const clamp = value => Math.max(0, Math.min(1, value));
  const phaseProgress = (value, start, end) => {
    if (end <= start) return value >= end ? 1 : 0;
    return clamp((value - start) / (end - start));
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
    char.setAttribute('data-six-frame-state', 'pending');
  };

  const setFinal = (char, finalChar) => {
    clearLegacyScramble(char);
    char.textContent = finalChar;
    char.style.removeProperty('letter-spacing');
    char.setAttribute('data-six-frame-state', 'final');
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
    char.setAttribute('data-six-frame-state', 'active');
  };

  const randomGlyph = (activeIndex, frameIndex, finalChar) => {
    const seed = activeIndex * 31 + frameIndex * 47 + (finalChar.codePointAt(0) || 0);
    if ((frameIndex + activeIndex) % 3 === 2) {
      return DIGITS[Math.abs(seed) % DIGITS.length];
    }
    return LETTERS[Math.abs(seed) % LETTERS.length];
  };

  const makeSequence = (chars, finalChars) => {
    const visible = chars
      .map((char, domIndex) => ({ char, finalChar: finalChars[domIndex] }))
      .filter(entry => entry.finalChar.trim().length > 0);

    return {
      visible,
      resolved: 0,
      target: 0,
      activeFrame: 0,
      started: false
    };
  };

  const quoteSequence = makeSequence(quoteChars, quoteFinalChars);
  const definitionSequence = makeSequence(definitionChars, definitionFinalChars);

  const resetSequenceTo = (sequence, target) => {
    const nextResolved = Math.max(0, Math.min(sequence.visible.length, target));
    sequence.resolved = nextResolved;
    sequence.target = nextResolved;
    sequence.activeFrame = 0;
    sequence.started = false;

    sequence.visible.forEach(({ char, finalChar }, index) => {
      if (index < nextResolved) setFinal(char, finalChar);
      else setPending(char, finalChar);
    });
  };

  const targetFromProgress = (sequence, progress) => {
    const count = sequence.visible.length;
    if (!count || progress <= 0) return 0;
    if (progress >= 1) return count;
    return Math.min(count, Math.ceil(clamp(progress) * count));
  };

  const setTarget = (sequence, progress) => {
    const nextTarget = targetFromProgress(sequence, progress);

    /* Scrolling backwards resets immediately to the authored position implied by scroll. */
    if (nextTarget < sequence.resolved) {
      resetSequenceTo(sequence, nextTarget);
      return;
    }

    sequence.target = nextTarget;
  };

  const paintSequenceFrame = sequence => {
    if (sequence.resolved >= sequence.target || sequence.resolved >= sequence.visible.length) {
      sequence.started = false;
      sequence.activeFrame = 0;
      return false;
    }

    const activeIndex = sequence.resolved;
    const { char, finalChar } = sequence.visible[activeIndex];

    /*
      One RAF = one actually painted random state. We intentionally advance by
      only one state per browser frame, even if the user jumped far ahead.
    */
    showGlyph(
      char,
      finalChar,
      randomGlyph(activeIndex, sequence.activeFrame, finalChar)
    );
    sequence.started = true;
    sequence.activeFrame += 1;

    if (sequence.activeFrame >= RANDOM_FRAMES_PER_GLYPH) {
      /* Resolve on the following RAF so the sixth random state is visibly painted. */
      sequence.activeFrame = RANDOM_FRAMES_PER_GLYPH;
    }

    return true;
  };

  const finishCompletedFrame = sequence => {
    if (!sequence.started || sequence.activeFrame < RANDOM_FRAMES_PER_GLYPH) return false;

    const activeIndex = sequence.resolved;
    const entry = sequence.visible[activeIndex];
    if (!entry) return false;

    setFinal(entry.char, entry.finalChar);
    sequence.resolved += 1;
    sequence.activeFrame = 0;
    sequence.started = false;
    return true;
  };

  const heroProgress = () => {
    const travel = Math.max(1, hero.offsetHeight - innerHeight);
    const top = hero.getBoundingClientRect().top + scrollY;
    return clamp((scrollY - top) / travel);
  };

  const readScrollTargets = () => {
    const p = heroProgress();

    const quoteProgress = phaseProgress(p, HERO.quoteFillStart, HERO.quoteFillEnd);
    setTarget(quoteSequence, quoteProgress);

    const quoteMorph = phaseProgress(p, HERO.quoteHoldEnd, HERO.quoteMorphEnd);
    const definitionProgress = phaseProgress(
      quoteMorph,
      HERO.definitionRevealStartInMorph,
      1
    );
    setTarget(definitionSequence, definitionProgress);

    if (sourceOnly) {
      const sourceProgress = phaseProgress(quoteProgress, 0.82, 1);
      sourceOnly.style.opacity = sourceProgress.toFixed(3);
    }
  };

  const needsAnimation = sequence => sequence.resolved < sequence.target;

  const frame = () => {
    raf = 0;

    /* First finalize a glyph whose sixth random state was painted last frame. */
    const quoteFinished = finishCompletedFrame(quoteSequence);
    const definitionFinished = finishCompletedFrame(definitionSequence);

    /* Then paint at most one new random state for each active sequence. */
    if (!quoteFinished) paintSequenceFrame(quoteSequence);
    if (!definitionFinished) paintSequenceFrame(definitionSequence);

    if (needsAnimation(quoteSequence) || needsAnimation(definitionSequence)) {
      requestFrame();
    }
  };

  const requestFrame = () => {
    if (raf) return;
    raf = requestAnimationFrame(frame);
  };

  const onScroll = () => {
    readScrollTargets();
    requestFrame();
  };

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => {
    widths = new WeakMap();
    readScrollTargets();
    requestFrame();
  }, { passive: true });

  /* Start from the actual current scroll position without intercepting input. */
  resetSequenceTo(quoteSequence, 0);
  resetSequenceTo(definitionSequence, 0);
  readScrollTargets();
  requestFrame();
})();