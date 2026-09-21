/*
 * Mobile-only primary page swipe navigation
 * Home → About → Works → Contact
 *
 * - Runs only below 780px.
 * - Pointer Events are preferred; Touch Events are fallback only.
 * - Vertical scroll and ordinary taps/clicks remain native.
 * - Links and normal content can start a swipe.
 * - Buttons/form controls are excluded.
 */
(() => {
  'use strict';

  const MOBILE_QUERY = '(max-width: 779px)';
  const SWIPE_THRESHOLD = 56;
  const DIRECTION_RATIO = 1.15;
  const MAX_DURATION = 1200;

  const pages = [
    './index.html',
    './about.html',
    './works.html',
    './contact.html'
  ];

  const mediaQuery = window.matchMedia(MOBILE_QUERY);
  const supportsPointerEvents = 'PointerEvent' in window;

  let gesture = null;
  let suppressClickUntil = 0;

  const currentPageIndex = () => {
    const pathname = window.location.pathname.replace(/\/+$/, '');
    const filename = pathname.split('/').pop() || 'index.html';

    if (!filename || filename === 'portfolio') return 0;

    const index = pages.findIndex(href => href.endsWith(filename));
    return index >= 0 ? index : -1;
  };

  const isExcludedTarget = target => {
    if (!(target instanceof Element)) return true;
    return Boolean(target.closest(
      'button, input, textarea, select, option, [role="button"], [contenteditable="true"], [data-swipe-ignore]'
    ));
  };

  const begin = ({ x, y, target, id = null }) => {
    if (!mediaQuery.matches || isExcludedTarget(target)) {
      gesture = null;
      return;
    }
    gesture = { x, y, id, time: performance.now() };
  };

  const move = ({ x, y, id = null }) => {
    if (!gesture || (gesture.id !== null && id !== gesture.id)) return;
    const deltaX = x - gesture.x;
    const deltaY = y - gesture.y;

    if (Math.abs(deltaY) > 18 && Math.abs(deltaY) > Math.abs(deltaX) * 1.15) {
      gesture = null;
    }
  };

  const finish = ({ x, y, id = null }) => {
    if (!mediaQuery.matches || !gesture || (gesture.id !== null && id !== gesture.id)) {
      gesture = null;
      return;
    }

    const start = gesture;
    gesture = null;

    const deltaX = x - start.x;
    const deltaY = y - start.y;
    const duration = performance.now() - start.time;

    if (
      duration > MAX_DURATION ||
      Math.abs(deltaX) < SWIPE_THRESHOLD ||
      Math.abs(deltaX) <= Math.abs(deltaY) * DIRECTION_RATIO
    ) return;

    const currentIndex = currentPageIndex();
    if (currentIndex < 0) return;

    const direction = deltaX < 0 ? 1 : -1;
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= pages.length) return;

    suppressClickUntil = performance.now() + 500;
    window.location.assign(pages[nextIndex]);
  };

  const cancel = () => {
    gesture = null;
  };

  document.addEventListener('click', event => {
    if (performance.now() >= suppressClickUntil) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  if (supportsPointerEvents) {
    document.addEventListener('pointerdown', event => {
      if (!mediaQuery.matches || !event.isPrimary || event.pointerType === 'mouse') return;
      begin({ x:event.clientX, y:event.clientY, target:event.target, id:event.pointerId });
    }, { passive:true });

    document.addEventListener('pointermove', event => {
      if (!event.isPrimary || event.pointerType === 'mouse') return;
      move({ x:event.clientX, y:event.clientY, id:event.pointerId });
    }, { passive:true });

    document.addEventListener('pointerup', event => {
      if (!event.isPrimary || event.pointerType === 'mouse') return;
      finish({ x:event.clientX, y:event.clientY, id:event.pointerId });
    }, { passive:true });

    document.addEventListener('pointercancel', cancel, { passive:true });
  } else {
    document.addEventListener('touchstart', event => {
      if (!mediaQuery.matches || event.touches.length !== 1) {
        cancel();
        return;
      }
      const touch = event.touches[0];
      begin({ x:touch.clientX, y:touch.clientY, target:event.target });
    }, { passive:true });

    document.addEventListener('touchmove', event => {
      if (!gesture || event.touches.length !== 1) return;
      const touch = event.touches[0];
      move({ x:touch.clientX, y:touch.clientY });
    }, { passive:true });

    document.addEventListener('touchend', event => {
      if (!gesture || event.changedTouches.length !== 1) {
        cancel();
        return;
      }
      const touch = event.changedTouches[0];
      finish({ x:touch.clientX, y:touch.clientY });
    }, { passive:true });

    document.addEventListener('touchcancel', cancel, { passive:true });
  }
})();
