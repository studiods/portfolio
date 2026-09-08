(() => {
  'use strict';

  const flow = document.querySelector('.reuse-confidence-flow');
  const stage = flow && flow.querySelector('[data-reuse-confidence-stage]');
  if (!flow || !stage) return;

  const allItems = Array.from(stage.querySelectorAll('.reuse-confidence-item'));
  const trustItems = allItems
    .filter((item) => item.classList.contains('is-trust-item'))
    .sort((a, b) => Number(a.dataset.trustStep) - Number(b.dataset.trustStep));

  if (!allItems.length || !trustItems.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const INITIAL_DELAY = 450;
  const STEP_INTERVAL = 620;
  const MOVE_DURATION = 700;
  const ENTER_DURATION = 520;
  const MOVE_EASING = 'cubic-bezier(.22,.8,.28,1)';
  const ENTER_EASING = 'cubic-bezier(.16,.84,.32,1)';

  let inFocus = false;
  let hasPlayed = false;
  let timers = [];
  let animations = [];

  const visibleItems = () => allItems.filter((item) => !item.classList.contains('is-pending'));

  const clearTimers = () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers = [];
  };

  const clearAnimations = () => {
    animations.forEach((animation) => {
      try { animation.cancel(); } catch (_) {}
    });
    animations = [];
  };

  const schedule = (callback, delay) => {
    const timer = window.setTimeout(callback, delay);
    timers.push(timer);
    return timer;
  };

  const readRects = (items) => {
    const map = new Map();
    items.forEach((item) => map.set(item.dataset.flowKey, item.getBoundingClientRect()));
    return map;
  };

  const markFlowEnds = () => {
    const items = visibleItems();
    items.forEach((item) => item.classList.remove('is-row-end', 'is-last-visible'));
    if (!items.length) return;

    const rows = [];
    items.forEach((item) => {
      const top = Math.round(item.getBoundingClientRect().top);
      let row = rows.find((candidate) => Math.abs(candidate.top - top) <= 2);
      if (!row) {
        row = { top, items: [] };
        rows.push(row);
      }
      row.items.push(item);
    });

    rows.forEach((row) => {
      row.items.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
      row.items[row.items.length - 1].classList.add('is-row-end');
    });
    items[items.length - 1].classList.add('is-last-visible');
  };

  const animateExistingItems = (beforeRects, items) => {
    items.forEach((item) => {
      const before = beforeRects.get(item.dataset.flowKey);
      if (!before) return;
      const after = item.getBoundingClientRect();
      const dx = before.left - after.left;
      const dy = before.top - after.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;

      const animation = item.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: 'translate(0, 0)' }
        ],
        {
          duration: MOVE_DURATION,
          easing: MOVE_EASING,
          fill: 'both'
        }
      );
      animations.push(animation);
      animation.finished.finally(() => {
        try { animation.cancel(); } catch (_) {}
      });
    });
  };

  const animateTrustEntry = (item, anchorRect) => {
    const node = item.querySelector('.reuse-confidence-node');
    if (!node) return;

    const finalRect = node.getBoundingClientRect();
    const anchorCenterX = anchorRect.left + (anchorRect.width / 2);
    const anchorCenterY = anchorRect.top + (anchorRect.height / 2);
    const finalCenterX = finalRect.left + (finalRect.width / 2);
    const finalCenterY = finalRect.top + (finalRect.height / 2);
    const dx = anchorCenterX - finalCenterX;
    const dy = anchorCenterY - finalCenterY;

    item.classList.add('is-entering');

    const opacityAnimation = item.animate(
      [{ opacity: 0.2 }, { opacity: 1 }],
      {
        duration: ENTER_DURATION,
        easing: ENTER_EASING,
        fill: 'both'
      }
    );

    const nodeAnimation = node.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(.84)` },
        { transform: 'translate(0, 0) scale(1)' }
      ],
      {
        duration: MOVE_DURATION,
        easing: MOVE_EASING,
        fill: 'both'
      }
    );

    animations.push(opacityAnimation, nodeAnimation);

    Promise.allSettled([opacityAnimation.finished, nodeAnimation.finished]).then(() => {
      item.classList.remove('is-entering');
      try { opacityAnimation.cancel(); } catch (_) {}
      try { nodeAnimation.cancel(); } catch (_) {}
      markFlowEnds();
    });
  };

  const revealTrustItem = (item) => {
    if (!inFocus || !item.classList.contains('is-pending')) return;

    const currentItems = visibleItems();
    const beforeRects = readRects(currentItems);
    const anchor = stage.querySelector(`[data-flow-key="${item.dataset.anchorKey}"]`);
    const anchorRect = anchor
      ? anchor.getBoundingClientRect()
      : currentItems[currentItems.length - 1].getBoundingClientRect();

    item.classList.remove('is-pending');
    item.removeAttribute('aria-hidden');

    void stage.offsetWidth;

    markFlowEnds();
    animateExistingItems(beforeRects, currentItems);
    animateTrustEntry(item, anchorRect);
  };

  const showFinalStateWithoutMotion = () => {
    clearTimers();
    clearAnimations();
    trustItems.forEach((item) => {
      item.classList.remove('is-pending', 'is-entering');
      item.removeAttribute('aria-hidden');
    });
    markFlowEnds();
    hasPlayed = true;
  };

  const reset = () => {
    clearTimers();
    clearAnimations();
    trustItems.forEach((item) => {
      item.classList.add('is-pending');
      item.classList.remove('is-entering');
      item.setAttribute('aria-hidden', 'true');
      item.style.removeProperty('opacity');
      item.style.removeProperty('transform');
      const node = item.querySelector('.reuse-confidence-node');
      if (node) node.style.removeProperty('transform');
    });
    allItems.forEach((item) => item.classList.remove('is-row-end', 'is-last-visible'));
    hasPlayed = false;
    requestAnimationFrame(markFlowEnds);
  };

  const play = () => {
    if (!inFocus || hasPlayed || document.hidden) return;

    if (reducedMotion.matches) {
      showFinalStateWithoutMotion();
      return;
    }

    hasPlayed = true;
    trustItems.forEach((item, index) => {
      schedule(() => {
        if (inFocus && !document.hidden) revealTrustItem(item);
      }, INITIAL_DELAY + (index * STEP_INTERVAL));
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    inFocus = Boolean(entry && entry.isIntersecting);

    if (inFocus) {
      markFlowEnds();
      play();
    } else {
      reset();
    }
  }, {
    root: null,
    rootMargin: '-18% 0px -18% 0px',
    threshold: 0.18
  });

  observer.observe(flow);
  requestAnimationFrame(markFlowEnds);

  window.addEventListener('resize', () => {
    if (!inFocus) return;
    requestAnimationFrame(markFlowEnds);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      reset();
    } else if (inFocus) {
      play();
    }
  });

  const handleMotionChange = () => {
    if (!inFocus) return;
    reset();
    if (reducedMotion.matches) showFinalStateWithoutMotion();
    else play();
  };

  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', handleMotionChange);
  } else if (typeof reducedMotion.addListener === 'function') {
    reducedMotion.addListener(handleMotionChange);
  }
})();