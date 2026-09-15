/* HIMART DESIGN SYSTEM — Gallery Runtime
   Canonical lifecycle for every auto-rotating gallery/slideshow.

   Contract
   - Autoplay runs only while the gallery is meaningfully visible in the viewport.
   - Autoplay pauses immediately when the gallery leaves the viewport or the document is hidden.
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

  const isDocumentActive = () => !document.hidden;

  const notify = (root, inView, reason) => {
    const record = records.get(root);
    if (!record) return;

    record.inView = Boolean(inView);
    const nextActive = !reducedMotion && record.inView && isDocumentActive();
    root.dataset.hmGalleryRuntimeState = nextActive ? 'active' : 'paused';

    if (record.active === nextActive) return;
    record.active = nextActive;
    record.onActiveChange?.(nextActive, reason);
  };

  const observer = supportsObserver
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          /* 12% prevents a nearly-offscreen gallery from continuing to rotate behind
             the next section while still resuming early enough to feel immediate. */
          const visible = entry.isIntersecting && entry.intersectionRatio >= 0.12;
          notify(entry.target, visible, visible ? 'viewport-enter' : 'viewport-leave');
        });
      }, { threshold:[0, 0.12, 0.25, 0.5, 1], rootMargin:'0px' })
    : null;

  const refreshDocumentVisibility = () => {
    records.forEach((record, root) => {
      const nextActive = !reducedMotion && record.inView && isDocumentActive();
      root.dataset.hmGalleryRuntimeState = nextActive ? 'active' : 'paused';
      if (record.active === nextActive) return;
      record.active = nextActive;
      record.onActiveChange?.(nextActive, document.hidden ? 'document-hidden' : 'document-visible');
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
        return () => {
          observer?.unobserve(root);
          records.delete(root);
        };
      }

      const record = {
        active:false,
        inView:!supportsObserver,
        onActiveChange
      };
      records.set(root, record);
      root.dataset.hmGalleryRuntimeState = 'paused';

      if (observer) {
        observer.observe(root);
      } else {
        notify(root, true, 'observer-unavailable');
      }

      return () => {
        observer?.unobserve(root);
        records.delete(root);
        delete root.dataset.hmGalleryRuntimeState;
      };
    }
  });
})();
