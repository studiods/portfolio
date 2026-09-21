/*
 * Mobile-only page swipe navigation
 * Home → About → Works → Contact
 *
 * Horizontal swipes navigate between the four primary pages.
 * Vertical scrolling, taps, desktop input, and interactive controls remain unchanged.
 */
(() => {
  'use strict';

  const MOBILE_QUERY = '(max-width: 779px)';
  const SWIPE_THRESHOLD = 64;
  const DIRECTION_RATIO = 1.25;
  const MAX_DURATION = 800;

  const pages = [
    './index.html',
    './about.html',
    './works.html',
    './contact.html'
  ];

  const mediaQuery = window.matchMedia(MOBILE_QUERY);
  let startPoint = null;

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
      'a, button, input, textarea, select, option, [role="button"], [contenteditable="true"], [data-swipe-ignore]'
    ));
  };

  const begin = event => {
    if (!mediaQuery.matches || event.touches.length !== 1) {
      startPoint = null;
      return;
    }

    const touch = event.touches[0];
    if (isExcludedTarget(event.target)) {
      startPoint = null;
      return;
    }

    startPoint = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };

  const finish = event => {
    if (!mediaQuery.matches || !startPoint || event.changedTouches.length !== 1) {
      startPoint = null;
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - startPoint.x;
    const deltaY = touch.clientY - startPoint.y;
    const duration = Date.now() - startPoint.time;
    startPoint = null;

    if (
      duration > MAX_DURATION ||
      Math.abs(deltaX) < SWIPE_THRESHOLD ||
      Math.abs(deltaX) <= Math.abs(deltaY) * DIRECTION_RATIO
    ) {
      return;
    }

    const currentIndex = currentPageIndex();
    if (currentIndex < 0) return;

    // Swipe left: next menu. Swipe right: previous menu.
    const direction = deltaX < 0 ? 1 : -1;
    const nextIndex = currentIndex + direction;

    // Do not wrap at the first or last primary page.
    if (nextIndex < 0 || nextIndex >= pages.length) return;

    window.location.assign(pages[nextIndex]);
  };

  const cancel = () => {
    startPoint = null;
  };

  document.addEventListener('touchstart', begin, { passive: true });
  document.addEventListener('touchend', finish, { passive: true });
  document.addEventListener('touchcancel', cancel, { passive: true });
})();
