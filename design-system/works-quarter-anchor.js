/* WORKS project-copy quarter-height anchor override.
   Keeps the existing Works motion grammar, but moves the fixed project-title anchor
   from viewport center to 25vh. All handoff/fade/final-exit calculations use the
   same 25vh anchor so incoming and outgoing titles remain synchronized. */
(() => {
  'use strict';

  const body = document.body;
  if (!body.classList.contains('works-page-body')) return;

  const grid = document.querySelector('.works-grid');
  const cards = [...document.querySelectorAll('.works-grid .works-card')];
  const copies = cards.map(card => card.querySelector('.works-card-copy'));
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

  const updateQuarterAnchor = () => {
    const isDesktop = window.innerWidth > 780;
    if (!isDesktop) return;

    const viewportHeight = window.innerHeight;
    const anchor = viewportHeight * .25;
    const gridBottom = grid.getBoundingClientRect().bottom;
    const handoffGap = clamp(viewportHeight * .08, 72, 120);

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
        /* Final title exits relative to the same 25vh anchor before the footer. */
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
