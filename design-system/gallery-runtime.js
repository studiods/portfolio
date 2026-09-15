/* HIMART DESIGN SYSTEM — Gallery Runtime
   Canonical lifecycle for every auto-rotating gallery/slideshow.

   Contract
   - Autoplay runs only while the gallery is meaningfully visible in the viewport.
   - Autoplay pauses immediately when the gallery leaves the viewport or the document is hidden.
   - Sticky background galleries also pause when their original document-flow area has scrolled away,
     even if the sticky element itself remains physically behind later sections.
   - Returning to the gallery resumes from the current frame; it never reloads or resets the sequence.
   - prefers-reduced-motion disables automatic playback while keeping manual controls available.
   - One shared IntersectionObserver + one visibilitychange listener manages all registered galleries.

   Keeping already-loaded media in memory/browser cache is intentionally more efficient than reloading
   on every re-entry: it avoids repeat network/decode work, visual flicker and loss of the user's place. */
(() => {
  'use strict';

  if (window.HMDSGalleryRuntime) return;

  const reducedMotion = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const records = new Map();
  const supportsObserver = 'IntersectionObserver' in window;
  const VISIBLE_RATIO = 0.12;
  let frameRequest = 0;

  const isDocumentActive = () => !document.hidden;

  const getFlowTop = element => {
    let top = 0;
    let node = element;
    while (node) {
      top += Number(node.offsetTop || 0);
      node = node.offsetParent;
    }
    return top;
  };

  const refreshFlowMetrics = (root, record) => {
    if (!record.sticky) return;
    record.flowTop = getFlowTop(root);
    record.flowHeight = Math.max(1, root.offsetHeight || window.innerHeight || 1);
  };

  const isStickyFlowVisible = record => {
    if (!record.sticky) return true;
    const viewportTop = window.scrollY || window.pageYOffset || 0;
    const viewportBottom = viewportTop + Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
    const flowBottom = record.flowTop + record.flowHeight;
    const overlap = Math.max(0, Math.min(flowBottom, viewportBottom) - Math.max(record.flowTop, viewportTop));
    return overlap / record.flowHeight >= VISIBLE_RATIO;
  };

  const refreshRecord = (root, record, reason) => {
    if (!record) return;
    const geometricallyVisible = record.intersectionVisible && isStickyFlowVisible(record);
    const nextActive = !reducedMotion && geometricallyVisible && isDocumentActive();
    root.dataset.hmGalleryRuntimeState = nextActive ? 'active' : 'paused';

    if (record.active === nextActive) return;
    record.active = nextActive;
    record.onActiveChange?.(nextActive, reason);
  };

  const observer = supportsObserver
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const record = records.get(entry.target);
          if (!record) return;
          /* 12% prevents a nearly-offscreen gallery from continuing to rotate behind
             the next section while still resuming early enough to feel immediate. */
          record.intersectionVisible = entry.isIntersecting && entry.intersectionRatio >= VISIBLE_RATIO;
          refreshRecord(entry.target, record, record.intersectionVisible ? 'viewport-enter' : 'viewport-leave');
        });
      }, { threshold:[0, VISIBLE_RATIO, 0.25, 0.5, 1], rootMargin:'0px' })
    : null;

  const refreshStickyRecords = reason => {
    records.forEach((record, root) => {
      if (record.sticky) refreshRecord(root, record, reason);
    });
  };

  const requestStickyRefresh = reason => {
    if (frameRequest) return;
    frameRequest = window.requestAnimationFrame(() => {
      frameRequest = 0;
      refreshStickyRecords(reason);
    });
  };

  /* A sticky hero can remain at top:0 behind the entire case study, so IntersectionObserver
     alone still reports it as visible. One passive, rAF-throttled shared scroll listener
     compares the sticky element with its original document-flow range and pauses it once
     that range is no longer on screen. */
  window.addEventListener('scroll', () => requestStickyRefresh('flow-scroll'), { passive:true });
  window.addEventListener('resize', () => {
    records.forEach((record, root) => refreshFlowMetrics(root, record));
    requestStickyRefresh('resize');
  }, { passive:true });

  const refreshDocumentVisibility = () => {
    records.forEach((record, root) => {
      refreshRecord(root, record, document.hidden ? 'document-hidden' : 'document-visible');
    });
  };

  document.addEventListener('visibilitychange', refreshDocumentVisibility, { passive:true });

  window.HMDSGalleryRuntime = Object.freeze({
    reducedMotion,

    register(root, onActiveChange) {
      if (!root || typeof onActiveChange !== 'function') return () => {};

      /* Re-registering the same element replaces only its callback; it does not create
         another observer/listener, which keeps lifecycle cost constant as galleries grow. */
      const previous = records.get(root);
      if (previous) {
        previous.onActiveChange = onActiveChange;
        refreshRecord(root, previous, 're-register');
        return () => {
          observer?.unobserve(root);
          records.delete(root);
        };
      }

      const sticky = window.getComputedStyle?.(root).position === 'sticky';
      const record = {
        active:false,
        intersectionVisible:!supportsObserver,
        sticky,
        flowTop:0,
        flowHeight:Math.max(1, root.offsetHeight || 1),
        onActiveChange
      };
      records.set(root, record);
      refreshFlowMetrics(root, record);
      root.dataset.hmGalleryRuntimeState = 'paused';

      if (observer) {
        observer.observe(root);
      } else {
        record.intersectionVisible = true;
        refreshRecord(root, record, 'observer-unavailable');
      }

      /* IO callbacks are asynchronous; this immediately resolves sticky logical visibility
         after registration without starting a second observer. */
      if (sticky) requestStickyRefresh('register');

      return () => {
        observer?.unobserve(root);
        records.delete(root);
        delete root.dataset.hmGalleryRuntimeState;
      };
    }
  });
})();
