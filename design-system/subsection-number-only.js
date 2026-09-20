/* Shared case-study blue 12px numeric-label contract.
   Portfolio-wide rule: structural labels are numeric only.
   Do not render number + English descriptors (e.g. "01 / TOP OF MIND").
   Any structural/small-title label beginning with 01 / 01.1 is normalized to its
   numeric hierarchy only. Category/source labels without a leading number are untouched. */
(() => {
  'use strict';

  const selector = [
    '.hm-subno',
    '.narrative-subno',
    '.synthesis-subno',
    '.hm-card-no',
    '.hm-ds-index-label[data-index]',
    '.aimmo-context-insight__label',
    '.brand-gap-index',
    '.problem-item > small:first-child',
    '.signal-item > small:first-child',
    '.principle-item > small:first-child',
    '.behavior-pattern-card > span:first-child',
    '.design-rule > article > small:first-child',
    '.aimmo-evidence-card figcaption > span:first-child',
    '.aimmo-application-gallery__item figcaption > span:first-child',
    '.team-card > span:first-child',
    '.ways-operating-stack > article > span:first-child',
    '.aimmo-business-flow > article > span:first-child',
    '.stepup-habit-flow > article > span:first-child',
    '.ax-friction-card > span:first-child',
    '.ax-rule-summary > article > span:first-child',
    '.ax-composition-step > span:first-child',
    '.yanolja-usability-row__copy > span:first-child',
    '.yanolja-answer-card > span:first-child',
    '.yanolja-context-grid > article > span:first-child',
    '.yanolja-direction-card > span:first-child',
    '.yanolja-goal-card > span:first-child',
    '.yanolja-demo-panel > span:first-child',
    '.yanolja-glance-grid > article > span:first-child',
    '.yanolja-coverage-card > span:first-child',
    '.yanolja-lead-step > span:first-child'
  ].join(',');

  const normalize = node => {
    if (!node || node.nodeType !== 1 || !node.matches?.(selector)) return;
    const explicit = node.getAttribute('data-index');
    const value = (explicit || node.textContent || '').trim();
    const match = value.match(/^(\d{2}(?:\.\d+)?)(?![\d.])/);
    if (!match) return;
    const numeric = match[1];
    if (node.textContent !== numeric) node.textContent = numeric;
  };

  const scan = root => {
    if (!root) return;
    if (root.nodeType === 3) {
      normalize(root.parentElement);
      return;
    }
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    if (root.nodeType === 1) normalize(root);
    root.querySelectorAll?.(selector).forEach(normalize);
  };

  const mount = () => {
    scan(document);
    if (!('MutationObserver' in window)) return;
    const observer = new MutationObserver(records => {
      records.forEach(record => {
        scan(record.target);
        record.addedNodes.forEach(scan);
      });
    });
    observer.observe(document.documentElement, {
      childList:true,
      characterData:true,
      subtree:true
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, {once:true});
  } else {
    mount();
  }
})();
