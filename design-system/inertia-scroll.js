/* Portfolio Design System — global inertial / damped wheel scrolling.
   Motion contract
   - Desktop fine-pointer wheel/trackpad only.
   - Uses the real window scroll position, never a transformed wrapper, so sticky,
     IntersectionObserver, progress navigation and scroll-linked effects keep native geometry.
   - Touch/coarse pointers and prefers-reduced-motion keep native scrolling.
   - Nested native scroll areas keep their own wheel behavior.
   - A page can opt out with data-native-scroll on <html> or <body>.

   Shared tuning
   wheel gain : 0.78
   damping    : 0.105
   stop       : 0.35px
*/
(() => {
  'use strict';

  if (window.__portfolioInertiaScrollMounted) return;

  const root = document.documentElement;
  const body = document.body;
  if (!root || !body) return;
  if (root.hasAttribute('data-native-scroll') || body.hasAttribute('data-native-scroll')) return;

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  if (reduce || coarse || !('requestAnimationFrame' in window)) return;

  window.__portfolioInertiaScrollMounted = true;
  root.dataset.inertiaScroll = 'true';
  root.style.scrollBehavior = 'auto';

  const WHEEL_GAIN = 0.78;
  const DAMPING = 0.105;
  const STOP_EPSILON = 0.35;

  let currentY = window.scrollY || window.pageYOffset || 0;
  let targetY = currentY;
  let raf = 0;
  let lastSetY = currentY;

  const maxY = () => Math.max(0, root.scrollHeight - window.innerHeight);
  const clamp = value => Math.max(0, Math.min(maxY(), value));

  const isEditable = target => {
    if (!(target instanceof Element)) return false;
    return !!target.closest('input,textarea,select,[contenteditable="true"],[role="textbox"]');
  };

  const hasNativeScrollableParent = (start, deltaY) => {
    let node = start instanceof Element ? start : null;
    while (node && node !== body && node !== root) {
      if (node.hasAttribute('data-native-scroll')) return true;
      const style = getComputedStyle(node);
      const overflowY = style.overflowY;
      const scrollable = (overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight + 1;
      if (scrollable) {
        const canUp = deltaY < 0 && node.scrollTop > 0;
        const canDown = deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 1;
        if (canUp || canDown) return true;
      }
      node = node.parentElement;
    }
    return false;
  };

  const stop = (sync = true) => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (sync) {
      currentY = window.scrollY || window.pageYOffset || 0;
      targetY = currentY;
      lastSetY = currentY;
    }
  };

  const frame = () => {
    const diff = targetY - currentY;
    if (Math.abs(diff) <= STOP_EPSILON) {
      currentY = targetY;
      lastSetY = currentY;
      window.scrollTo(0, currentY);
      raf = 0;
      return;
    }

    currentY += diff * DAMPING;
    lastSetY = currentY;
    window.scrollTo(0, currentY);
    raf = requestAnimationFrame(frame);
  };

  const ensureFrame = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const onWheel = event => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || isEditable(event.target)) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (hasNativeScrollableParent(event.target, event.deltaY)) return;

    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
    const delta = event.deltaY * unit;
    if (!Number.isFinite(delta) || Math.abs(delta) < 0.01) return;

    event.preventDefault();

    if (!raf) {
      currentY = window.scrollY || window.pageYOffset || 0;
      targetY = currentY;
    }
    targetY = clamp(targetY + delta * WHEEL_GAIN);
    ensureFrame();
  };

  const onScroll = () => {
    const y = window.scrollY || window.pageYOffset || 0;
    /* Our own requestAnimationFrame scroll writes must not cancel easing.
       External jumps — scrollbar dragging, keyboard navigation and anchors — resync. */
    if (raf && Math.abs(y - lastSetY) <= 2) return;
    stop(true);
  };

  window.addEventListener('wheel', onWheel, {passive:false});
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', () => {
    targetY = clamp(targetY);
    if (!raf) stop(true);
  }, {passive:true});
  window.addEventListener('pagehide', () => stop(false), {once:true});
})();
