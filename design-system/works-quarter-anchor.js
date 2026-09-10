/* WORKS project-copy quarter-height anchor override.
   Keeps the existing Works motion grammar, fixes project-title centers at 25vh,
   and releases the final fixed title only after its title top aligns with the final
   media top. From that point both rise together so the footer remains reachable. */
(() => {
  'use strict';

  const body = document.body;
  if (!body.classList.contains('works-page-body')) return;

  const grid = document.querySelector('.works-grid');
  const footer = document.querySelector('.works-footer');
  const cards = [...document.querySelectorAll('.works-grid .works-card')];
  const copies = cards.map(card => card.querySelector('.works-card-copy'));
  const lastIndex = cards.length - 1;
  const lastCard = cards[lastIndex];
  const lastCopy = copies[lastIndex];
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

  const restoreNaturalDocumentEnd = () => {
    grid.style.removeProperty('padding-bottom');
    if (footer) footer.style.removeProperty('display');
  };

  const updateQuarterAnchor = () => {
    const isDesktop = window.innerWidth > 780;
    restoreNaturalDocumentEnd();

    if (!isDesktop) return;

    const viewportHeight = window.innerHeight;
    const anchor = viewportHeight * .25;
    const handoffGap = clamp(viewportHeight * .08, 72, 120);

    copies.forEach((copy, index) => {
      if (!copy) return;

      const cardRect = cards[index].getBoundingClientRect();
      const copyHeight = copy.offsetHeight;
      const naturalCenter = cardRect.top + copyHeight * .5;

      /* Natural scroll until the copy center reaches 25vh; then lock on that line. */
      let y = Math.max(anchor, naturalCenter);
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
      } else if (index === lastIndex && lastTitle && lastMedia) {
        /*
          Final-project release:
          1) before the final project arrives, keep its copy at its natural offscreen position;
          2) once its media top reaches the fixed title-text top, both share that line;
          3) after that point, drive the title from the media top so both move upward
             at exactly the same scroll rate and the authored footer can enter normally.
        */
        const copyRect = copy.getBoundingClientRect();
        const titleRect = lastTitle.getBoundingClientRect();
        const titleOffset = titleRect.top - copyRect.top;
        const fixedTitleTop = anchor - copyHeight * .5 + titleOffset;
        const mediaTop = lastMedia.getBoundingClientRect().top;

        if (mediaTop <= fixedTitleTop) {
          y = mediaTop - titleOffset + copyHeight * .5;
        }

        opacity = 1;
        shift = 0;
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
