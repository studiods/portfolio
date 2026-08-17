(() => {
  'use strict';

  const hero = document.querySelector('#heroSequence');
  if (!hero) return;

  const quoteState = hero.querySelector('.hero-state-quote');
  const definitionState = hero.querySelector('.hero-state-definition');
  const subState = hero.querySelector('.hero-state-subtractive');
  if (!quoteState || !definitionState || !subState) return;

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
  const quoteExitEnd = (cursor += n('quoteExit'));
  const defEnterEnd = (cursor += n('defEnter'));
  const defFillEnd = (cursor += n('defFill'));
  const defHoldEnd = (cursor += n('defHold'));
  const defExitEnd = (cursor += n('defExit'));
  const subEnterEnd = (cursor += n('subEnter'));
  const subFillEnd = (cursor += n('subFill'));
  const subHoldEnd = (cursor += n('subHold'));
  const subExitEnd = (cursor += n('subExit'));

  const clamp01 = value => Math.max(0, Math.min(1, value));
  const phaseProgress = (value, start, end) =>
    end <= start ? (value >= end ? 1 : 0) : clamp01((value - start) / (end - start));

  /*
    Exit opacity profile:
    - first 10% of the exit: a strong, quick drop from 1.0 to 0.56
    - remaining 90%: a long, gradual fade from 0.56 to 0
    This gives the requested "quick transparency hit, then slow disappearance" feel.
  */
  const exitOpacity = progress => {
    const p = clamp01(progress);
    const EARLY_END = 0.10;
    const EARLY_OPACITY = 0.56;

    if (p <= 0) return 1;
    if (p < EARLY_END) {
      const t = p / EARLY_END;
      const fastDrop = 1 - Math.pow(1 - t, 4);
      return 1 - (1 - EARLY_OPACITY) * fastDrop;
    }

    const tail = (p - EARLY_END) / (1 - EARLY_END);
    return Math.max(0, EARLY_OPACITY * (1 - Math.pow(tail, 1.4)));
  };

  const render = () => {
    const rect = hero.getBoundingClientRect();
    const travel = Math.max(1, hero.offsetHeight - innerHeight);
    const p = clamp01(-rect.top / travel);

    const quoteExit = phaseProgress(p, quoteHoldEnd, quoteExitEnd);
    const defExit = phaseProgress(p, defHoldEnd, defExitEnd);
    const subExit = phaseProgress(p, subHoldEnd, subExitEnd);

    if (p >= quoteHoldEnd && p <= quoteExitEnd) {
      quoteState.style.opacity = String(exitOpacity(quoteExit));
    }
    if (p >= defHoldEnd && p <= defExitEnd) {
      definitionState.style.opacity = String(exitOpacity(defExit));
    }
    if (p >= subHoldEnd && p <= subExitEnd) {
      subState.style.opacity = String(exitOpacity(subExit));
    }
  };

  let raf = 0;
  const requestRender = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      render();
    });
  };

  render();
  addEventListener('scroll', requestRender, { passive: true });
  addEventListener('resize', requestRender, { passive: true });
})();
