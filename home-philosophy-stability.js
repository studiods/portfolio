(() => {
  'use strict';

  const section = document.querySelector('#philosophy');
  const sticky = section?.querySelector('.philosophy-sticky');
  const source = section?.querySelector('.philosophy-statements');
  if (!section || !sticky || !source) return;

  /*
    The production home currently has two legacy scroll renderers that can touch
    Design Philosophy in the same frame. Do not rewrite those global renderers
    here: keep the working page runtime intact and isolate only the visual layer
    that was flickering.

    The original source remains in the document to preserve layout. A visual
    clone is positioned exactly over it and is the only layer the visitor sees.
    Legacy scripts can continue updating the hidden source without ever exposing
    a stale/random glyph. The visible clone is driven by one monotonic timeline,
    so a resolved character can never become random again while later text runs.
  */
  source.classList.add('philosophy-stability-source');
  source.setAttribute('aria-hidden', 'true');

  const overlay = source.cloneNode(true);
  overlay.classList.remove('philosophy-stability-source');
  overlay.classList.add('philosophy-stability-overlay');
  overlay.removeAttribute('aria-hidden');
  overlay.removeAttribute('data-split');

  const sourceChars = [...source.querySelectorAll('.fill-char')];
  const overlayChars = [...overlay.querySelectorAll('.fill-char')];
  const finalChars = sourceChars.map(char => char.dataset.finalChar || char.textContent);

  overlayChars.forEach((char, index) => {
    char.className = 'fill-char';
    char.textContent = finalChars[index] ?? char.textContent;
    char.removeAttribute('style');
    char.removeAttribute('data-final-char');
    char.removeAttribute('data-scramble');
    char.removeAttribute('data-test-scramble');
  });

  sticky.appendChild(overlay);

  const style = document.createElement('style');
  style.id = 'philosophy-stability-style';
  style.textContent = `
    .philosophy-stability-source{
      visibility:hidden!important;
    }
    .philosophy-stability-overlay{
      position:absolute!important;
      margin:0!important;
      pointer-events:none!important;
      z-index:2!important;
    }
    .philosophy-stability-overlay .fill-char{
      position:static!important;
      transform:none!important;
      translate:none!important;
      vertical-align:baseline!important;
    }
    .philosophy-stability-overlay .fill-char::before,
    .philosophy-stability-overlay .fill-char::after{
      content:none!important;
      display:none!important;
    }
  `;
  document.head.appendChild(style);

  const visible = [];
  overlayChars.forEach((char, domIndex) => {
    const finalChar = finalChars[domIndex] ?? char.textContent;
    if (finalChar.trim()) {
      visible.push({ char, finalChar, index: visible.length });
    } else {
      char.textContent = finalChar;
    }
  });

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const DIGITS = '0123456789';
  const BASE_ALPHA = 0.05;

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const easeInOut = value => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };
  const phaseProgress = (value, start, end) => {
    if (end <= start) return value >= end ? 1 : 0;
    return clamp((value - start) / (end - start));
  };
  const absoluteTop = element => element.getBoundingClientRect().top + scrollY;

  const glyphFor = (index, cycle) => {
    if (cycle === 1) {
      return DIGITS[(index * 7 + cycle * 3) % DIGITS.length];
    }
    return LETTERS[(index * 17 + cycle * 13) % LETTERS.length];
  };

  let maxSweep = 0;
  let raf = 0;

  const syncOverlayBox = () => {
    const stickyRect = sticky.getBoundingClientRect();
    const sourceRect = source.getBoundingClientRect();
    overlay.style.left = `${(sourceRect.left - stickyRect.left).toFixed(3)}px`;
    overlay.style.top = `${(sourceRect.top - stickyRect.top).toFixed(3)}px`;
    overlay.style.width = `${sourceRect.width.toFixed(3)}px`;
    overlay.style.height = `${sourceRect.height.toFixed(3)}px`;
  };

  const render = () => {
    raf = 0;
    syncOverlayBox();
    if (!visible.length) return;

    const stickyTop = innerHeight * (innerWidth <= 850 ? 0.14 : 0.18);
    const travel = Math.max(1, section.offsetHeight - sticky.offsetHeight - stickyTop);
    const sectionProgress = clamp((scrollY + stickyTop - absoluteTop(section)) / travel);
    const revealProgress = phaseProgress(sectionProgress, 0.02, 0.92);
    const requestedSweep = easeInOut(revealProgress) * visible.length;

    /* Never move the reveal frontier backward after a glyph has resolved. */
    maxSweep = Math.max(maxSweep, requestedSweep);
    const sweep = Math.min(visible.length, maxSweep);
    const resolvedCount = Math.min(visible.length, Math.floor(sweep));
    const activeLocal = clamp(sweep - resolvedCount);

    visible.forEach(({ char, finalChar, index }) => {
      if (index < resolvedCount || resolvedCount >= visible.length) {
        char.textContent = finalChar;
        char.style.color = 'rgba(17,17,17,1)';
        return;
      }

      if (index === resolvedCount && activeLocal > 0 && sweep < visible.length) {
        const cycle = Math.min(2, Math.floor(activeLocal * 3));
        char.textContent = glyphFor(index, cycle);
        char.style.color = 'rgba(17,17,17,1)';
        return;
      }

      char.textContent = finalChar;
      char.style.color = `rgba(17,17,17,${BASE_ALPHA})`;
    });
  };

  const requestRender = () => {
    if (!raf) raf = requestAnimationFrame(render);
  };

  addEventListener('scroll', requestRender, { passive: true });
  addEventListener('resize', requestRender, { passive: true });
  requestRender();

  if (document.fonts?.ready) {
    document.fonts.ready.then(requestRender).catch(() => {});
  }
})();
