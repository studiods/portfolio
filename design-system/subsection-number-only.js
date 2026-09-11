/* Shared case-study subsection label contract.
   Decimal subsection labels display the sequence only (e.g. 01.1),
   while ordinary card labels such as 01 / DESIGN remain untouched. */
(() => {
  'use strict';

  const selector = '.hm-subno,.narrative-subno,.hm-card-no';

  const normalize = node => {
    if (!node) return;
    const value = (node.textContent || '').trim();
    const match = value.match(/^(\d{2}\.\d+)\s*(?:\/.*)?$/);
    if (match && node.textContent !== match[1]) node.textContent = match[1];
  };

  const scan = root => {
    if (!root) return;
    if (root.nodeType === 1 && root.matches?.(selector)) normalize(root);
    root.querySelectorAll?.(selector).forEach(normalize);
  };

  const mount = () => {
    scan(document);
    if (!('MutationObserver' in window)) return;
    const observer = new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(scan));
    });
    observer.observe(document.documentElement, {childList:true, subtree:true});
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();
