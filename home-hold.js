(() => {
  'use strict';

  const hero = document.querySelector('#heroSequence');
  if (!hero) return;

  const REARM_GAP = 0.025;
  const EPSILON = 0.0005;
  const WHEEL_GESTURE_END_MS = 140;

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
  let activeStop = null;
  let holdStage = 'idle'; // idle -> settling -> armed -> consuming
  let gestureTimer = 0;
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

  const clearGestureTimer = () => {
    if (gestureTimer) clearTimeout(gestureTimer);
    gestureTimer = 0;
  };

  const releaseHold = () => {
    if (!holding || !activeStop) return;
    const stop = activeStop;
    clearGestureTimer();
    consumed.add(stop.key);
    holding = false;
    activeStop = null;
    holdStage = 'idle';

    /* Skip the scroll-distance hold after one full additional scroll gesture. */
    const releaseY = yForProgress(stop.release + EPSILON);
    setScrollY(releaseY);
    lastProgress = stop.release + EPSILON;
  };

  const onGestureEnd = () => {
    gestureTimer = 0;
    if (!holding) return;

    if (holdStage === 'settling') {
      /* The gesture that completed the fill is over. The next gesture is ignored. */
      holdStage = 'armed';
      return;
    }

    if (holdStage === 'consuming') {
      /* One complete extra scroll gesture has now been consumed. */
      releaseHold();
    }
  };

  const scheduleGestureEnd = () => {
    clearGestureTimer();
    gestureTimer = window.setTimeout(onGestureEnd, WHEEL_GESTURE_END_MS);
  };

  const beginHold = stop => {
    if (holding) return;
    holding = true;
    activeStop = stop;
    holdStage = 'settling';
    lockY = yForProgress(stop.fill);
    setScrollY(lockY);
    lastProgress = stop.fill;

    /* No fixed reading time: wait for the current scroll gesture to end. */
    scheduleGestureEnd();
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

  const onWheel = event => {
    if (!holding) return;
    event.preventDefault();

    if (holdStage === 'armed') holdStage = 'consuming';
    scheduleGestureEnd();
  };

  let touchActive = false;
  const onTouchStart = event => {
    if (!holding) return;
    touchActive = true;
    if (holdStage === 'armed') holdStage = 'consuming';
    if (event.cancelable) event.preventDefault();
  };

  const onTouchMove = event => {
    if (!holding) return;
    if (event.cancelable) event.preventDefault();
  };

  const onTouchEnd = () => {
    if (!holding || !touchActive) return;
    touchActive = false;
    if (holdStage === 'settling') {
      clearGestureTimer();
      holdStage = 'armed';
    } else if (holdStage === 'consuming') {
      releaseHold();
    }
  };

  const scrollKeys = new Set([
    'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp',
    'Home', 'End', ' ', 'Spacebar'
  ]);

  addEventListener('wheel', onWheel, { passive: false });
  addEventListener('touchstart', onTouchStart, { passive: false });
  addEventListener('touchmove', onTouchMove, { passive: false });
  addEventListener('touchend', onTouchEnd, { passive: true });
  addEventListener('touchcancel', onTouchEnd, { passive: true });

  addEventListener('keydown', event => {
    if (!holding || !scrollKeys.has(event.key)) return;
    event.preventDefault();

    if (holdStage === 'settling') {
      clearGestureTimer();
      holdStage = 'armed';
      return;
    }

    if (holdStage === 'armed') {
      /* One discrete keyboard scroll is ignored, then the following one can exit. */
      holdStage = 'consuming';
      releaseHold();
    }
  }, { passive: false });

  addEventListener('scroll', () => {
    if (holding && !internalScroll && Math.abs(scrollY - lockY) > 1) {
      setScrollY(lockY);
      return;
    }
    checkProgress();
  }, { passive: true });

  addEventListener('resize', () => {
    if (holding && activeStop) {
      lockY = yForProgress(activeStop.fill);
      setScrollY(lockY);
    }
    lastProgress = metrics().progress;
  }, { passive: true });

  lastProgress = metrics().progress;
})();
