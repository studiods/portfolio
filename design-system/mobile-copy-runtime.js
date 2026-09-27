/* Portfolio Mobile Presentation Runtime
   Mobile-only text presentation contract:
   - authored source text is never rewritten;
   - visible middle-dot separators render as commas at <=780px;
   - desktop restores the exact authored text;
   - scramble-owned text is excluded so animation final-state ownership is preserved.
*/
(() => {
  'use strict';

  if (window.__portfolioMobileCopyRuntimeMounted) return;
  window.__portfolioMobileCopyRuntimeMounted = true;

  const mq = window.matchMedia('(max-width: 780px)');
  const states = new WeakMap();
  const excluded = 'script,style,noscript,textarea,input,select,option,code,pre,svg,canvas,.js-scramble,.hm-scramble-char,[data-mobile-copy="off"]';

  const normalizeMobileSeparators = value =>
    String(value || '').replace(/\s*[·•∙ㆍ]\s*/g, ', ');

  const eligible = node => {
    const parent = node?.parentElement;
    return !!parent && !parent.closest(excluded);
  };

  const syncTextNode = node => {
    if (!eligible(node)) return;

    const current = node.nodeValue || '';
    const prior = states.get(node);

    if (mq.matches) {
      let source = prior?.source ?? current;

      /* A page runtime may replace copy after initial mount (gallery captions, counters, etc.).
         Treat any value that is not our last rendered value as the new authored source. */
      if (prior && current !== prior.rendered) source = current;

      const rendered = normalizeMobileSeparators(source);
      states.set(node, {source, rendered});
      if (current !== rendered) node.nodeValue = rendered;
      return;
    }

    if (!prior) return;
    if (current === prior.rendered && current !== prior.source) node.nodeValue = prior.source;
    states.delete(node);
  };

  const scan = root => {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      syncTextNode(root);
      return;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) syncTextNode(node);
  };

  const mount = () => {
    scan(document.body);
    document.documentElement.dataset.mobileCopyRuntime = 'true';

    const observer = new MutationObserver(records => {
      records.forEach(record => {
        if (record.type === 'characterData') {
          syncTextNode(record.target);
          return;
        }
        record.addedNodes.forEach(scan);
      });
    });
    observer.observe(document.body, {subtree:true, childList:true, characterData:true});

    mq.addEventListener?.('change', () => scan(document.body));
    window.addEventListener('pagehide', () => observer.disconnect(), {once:true});
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, {once:true});
  } else {
    mount();
  }
})();
