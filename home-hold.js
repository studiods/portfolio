(() => {
  'use strict';

  const hero = document.querySelector('#heroSequence');
  if (!hero) return;

  const HOLD_MS = 800;
  const REARM_GAP = 0.025;
  const EPSILON = 0.0005;

  /* Keep these phase weights synchronized with home-interactions.js. */
  const HOLD_SCALE = 1 / 3;
  const phase = {
    quoteFill: 0.13,
    quoteHold: 0.15 * HOLD_SCALE,
    quoteExit: 0.13,
    defEnter: 0.09,
    defFill: 0.12,
    defHold: 0.14 * HOLD_SCALE,
    defExit: 0.13,
    subEnter: 0.08,
    subFill: 0.13,
    subHold: 0.08 * HOLD_SCALE,
    subExit: 0.13
  };

  const total = Object.values(phase).reduce((sum, value) => sum + value, 0);
  const n = key => phase[key] / total;
  let cursor = 0;

  const quoteFillEnd = (cursor += n('quoteFill'));
  const quoteHoldEnd = (cursor += n('quoteHold'));
  cursor += n('quoteExit');
  cursor += n('defEnter');
  const defFillEnd = (cursor += n('defFill'));
  const defHoldEnd = (cursor += n('defHold'));
  cursor += n('defExit');
  cursor += n('subEnter');
  const subFillEnd = (cursor += n('subFill'));
  const subHoldEnd = (cursor += n('subHold'));

  const stops = [
    { key: 'quote', fill: quoteFillEnd, release: quoteHoldEnd },
    { key: 'definition', fill: defFillEnd, release: defHoldEnd },
    { key: 'subtractive', fill: subFillEnd, release: subHoldEnd }
  ];

  const consumed = new Set();
  let holding = false;
  let holdTimer = 0;
  let lockY = 0;
  let lastProgress = 0;
  let internalScroll = false;

  const clamp01 = value => Math.max(0, Math.min(1, value));

  const metrics = () => {
    const rect = hero.getBoundingClientRect();
    const travel = Math.max(1, hero.offsetHeight - innerHeight);
    const top = scrollY + rect.top;
    const progress = clamp01((scrollY - top) / travel);
    return { top, travel, progress };
  };

  const yForProgress = progress => {
    const { top, travel } = metrics();
    return Math.round(top + travel * progress);
  };

  const setScrollY = y => {
    internalScroll = true;
    scrollTo(0, y);
    requestAnimationFrame(() => { internalScroll = false; });
  };

  const releaseHold = stop => {
    consumed.add(stop.key);
    holding = false;
    holdTimer = 0;

    /*
      Consume the original scroll-distance hold invisibly while the scene is
      already fully filled. The next user scroll can therefore start the exit
      immediately after the 0.8s temporal pause.
    */
    const releaseY = yForProgress(stop.release + EPSILON);
    setScrollY(releaseY);
    lastProgress = stop.release + EPSILON;
  };

  const beginHold = stop => {
    if (holding) return;
    holding = true;
    lockY = yForProgress(stop.fill);
    setScrollY(lockY);
    lastProgress = stop.fill;

    holdTimer = window.setTimeout(() => releaseHold(stop), HOLD_MS);
  };

  const checkProgress = () => {
    const { progress } = metrics();

    stops.forEach(stop => {
      if (progress < stop.fill - REARM_GAP) consumed.delete(stop.key);
    });

    if (!holding) {
      const crossed = stops.find(stop =>
        !consumed.has(stop.key) &&
        lastProgress < stop.fill &&
        progress >= stop.fill
      );
      if (crossed) {
        beginHold(crossed);
        return;
      }
    }

    lastProgress = progress;
  };

  const blockScrollInput = event => {
    if (!holding) return;
    event.preventDefault();
  };

  const scrollKeys = new Set([
    'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp',
    'Home', 'End', ' ', 'Spacebar'
  ]);

  addEventListener('wheel', blockScrollInput, { passive: false });
  addEventListener('touchmove', blockScrollInput, { passive: false });
  addEventListener('keydown', event => {
    if (holding && scrollKeys.has(event.key)) event.preventDefault();
  }, { passive: false });

  addEventListener('scroll', () => {
    if (holding && !internalScroll && Math.abs(scrollY - lockY) > 1) {
      setScrollY(lockY);
      return;
    }
    checkProgress();
  }, { passive: true });

  addEventListener('resize', () => {
    if (holding) {
      const active = stops.find(stop => Math.abs(lastProgress - stop.fill) < 0.01);
      if (active) {
        lockY = yForProgress(active.fill);
        setScrollY(lockY);
      }
    }
    lastProgress = metrics().progress;
  }, { passive: true });

  lastProgress = metrics().progress;
})();
