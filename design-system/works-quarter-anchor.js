/* WORKS project-copy quarter-height anchor override.
   Keeps the existing Works motion grammar, fixes project-title centers at 25vh,
   and makes the desktop document end exactly when the final media top aligns with
   the final left project-title top line. */
(() => {
  'use strict';

  const body = document.body;
  if (!body.classList.contains('works-page-body')) return;

  const grid = document.querySelector('.works-grid');
  const footer = document.querySelector('.works-footer');
  const cards = [...document.querySelectorAll('.works-grid .works-card')];
  const copies = cards.map(card => card.querySelector('.works-card-copy'));
  const lastCard = cards[cards.length - 1];
  const lastCopy = copies[copies.length - 1];
  const lastTitle = lastCopy?.querySelector('.works-card-title');
  const lastMedia = lastCard?.querySelector('.works-card-media-link');
  if (!grid || !cards.length) return;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const smoothstep = value => {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  };

  const outgoingOpacity = progress => {
    const p = clamp(progress, 0, 1);
    const earlyEnd = .28;

    if (p <= earlyEnd) {
      const early = smoothstep(p / earlyEnd);
      return 1 - .5 * early;
    }

    const tail = smoothstep((p - earlyEnd) / (1 - earlyEnd));
    return .5 * (1 - tail);
  };

  /*
    Desktop end-stop contract:
    - the footer is removed from desktop flow because it would create scroll distance
      beyond the requested final project state;
    - the grid receives only the exact trailing space required for the final media top
      to meet the final left title's first text line at maximum scroll;
    - mobile keeps the authored footer and normal document flow.
  */
  const syncDesktopEndStop = (viewportHeight, anchor) => {
    const isDesktop = window.innerWidth > 780;

    if (!isDesktop) {
      grid.style.removeProperty('padding-bottom');
      if (footer) footer.style.removeProperty('display');
      return;
    }

    if (footer) footer.style.display = 'none';
    if (!lastCopy || !lastTitle || !lastMedia) {
      grid.style.removeProperty('padding-bottom');
      return;
    }

    const copyHeight = lastCopy.offsetHeight;
    const copyRect = lastCopy.getBoundingClientRect();
    const titleRect = lastTitle.getBoundingClientRect();
    const titleOffset = titleRect.top - copyRect.top;
    const targetTitleTop = anchor - copyHeight * .5 + titleOffset;
    const mediaHeight = lastMedia.getBoundingClientRect().height;

    /* At max scroll: final media top = viewportHeight - mediaHeight - trailingSpace. */
    const trailingSpace = Math.max(0, viewportHeight - mediaHeight - targetTitleTop);
    grid.style.paddingBottom = `${trailingSpace.toFixed(1)}px`;
  };

  const updateQuarterAnchor = () => {
    const isDesktop = window.innerWidth > 780;
    if (!isDesktop) {
      syncDesktopEndStop(window.innerHeight, 0);
      return;
    }

    const viewportHeight = window.innerHeight;
    const anchor = viewportHeight * .25;
    const handoffGap = clamp(viewportHeight * .08, 72, 120);

    /* Establish the natural document end before any handoff/final-state calculations. */
    syncDesktopEndStop(viewportHeight, anchor);
    const gridBottom = grid.getBoundingClientRect().bottom;

    copies.forEach((copy, index) => {
      if (!copy) return;

      const cardRect = cards[index].getBoundingClientRect();
      const copyHeight = copy.offsetHeight;
      const naturalCenter = cardRect.top + copyHeight * .5;

      /* Natural scroll until the copy center reaches 25vh; then lock on that line. */
      const y = Math.max(anchor, naturalCenter);
      let opacity = 1;
      let shift = 0;

      const nextCopy = copies[index + 1];
      const nextCard = cards[index + 1];

      if (nextCard && nextCopy) {
        const nextHeight = nextCopy.offsetHeight;
        const nextRect = nextCard.getBoundingClientRect();
        const nextAnchor = nextRect.top + nextHeight * .5;
        const outgoingBottom = anchor + copyHeight * .5;
        const handoffStart = outgoingBottom + handoffGap + nextHeight * .5;

        if (nextAnchor < handoffStart) {
          const progress = clamp(
            (handoffStart - nextAnchor) / Math.max(1, handoffStart - anchor),
            0,
            1
          );
          const motion = smoothstep(progress);
          opacity = outgoingOpacity(progress);
          shift = -120 * motion;
        }
      } else if (gridBottom < anchor) {
        /* Safety fallback only. The desktop end-stop normally prevents this state. */
        const progress = clamp((anchor - gridBottom) / Math.max(1, anchor), 0, 1);
        const motion = smoothstep(progress);
        opacity = 1 - motion;
        shift = -120 * motion;
      }

      copy.style.setProperty('--works-copy-top', `${y.toFixed(1)}px`);
      copy.style.setProperty('--works-copy-opacity', opacity.toFixed(3));
      copy.style.setProperty('--works-copy-shift', `${shift.toFixed(1)}px`);
      copy.style.setProperty('--works-copy-z', String(1000 + index));

      const copyTop = y - copyHeight * .5 + shift;
      const copyBottom = copyTop + copyHeight;
      const isVisible = copyBottom > 0 && copyTop < viewportHeight;
      copy.style.pointerEvents = isVisible && opacity > .18 ? 'auto' : 'none';
    });
  };

  let raf = 0;
  const requestUpdate = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      updateQuarterAnchor();
    });
  };

  window.addEventListener('scroll', requestUpdate, {passive:true});
  window.addEventListener('resize', requestUpdate);
  window.addEventListener('pageshow', requestUpdate);
  document.fonts?.ready?.then(requestUpdate).catch(() => {});

  updateQuarterAnchor();
})();
