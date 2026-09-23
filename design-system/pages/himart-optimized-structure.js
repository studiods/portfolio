/* Himart optimized candidate — one-time structural presentation finalizer.
   Runs only after the candidate's editorial layout is complete. */
(() => {
  'use strict';

  const root = document.getElementById('live-main');
  if (!root || !document.body) return;

  const directChildren = (parent, selector) =>
    [...parent.children].filter(child => child.matches(selector));

  const descriptionNodes = () => {
    const nodes = [];
    root.querySelectorAll('.hm-subhead, .data-card-head, .narrative-block, .journey-role-block')
      .forEach(head => {
        if (head.matches('.narrative-block, .journey-role-block')) {
          directChildren(head, '.narrative-copy, .journey-block-copy, [data-hm-subsection-copy]')
            .forEach(node => { if (!nodes.includes(node)) nodes.push(node); });
          return;
        }

        if (!directChildren(head, '.hm-subno, .hm-card-no')[0]) return;
        directChildren(head, 'div').forEach(group => {
          [...group.children].forEach(node => {
            const named = node.matches('.hm-subcopy, .hm-ds-subsection__description, .desc, [data-hm-subsection-copy]');
            const followsTitle = node.matches('p') && node.previousElementSibling?.matches('.hm-subtitle, h3, h4');
            if ((named || followsTitle) && !nodes.includes(node)) nodes.push(node);
          });
        });
      });
    return nodes;
  };

  const indexNodes = () =>
    [...root.querySelectorAll('.hm-ds-index-label, .hm-subno, .hm-card-no, .hm-section-no, .narrative-subno, .synthesis-subno')]
      .filter(node => {
        const match = (node.textContent || '').trim().match(/^(\\d{1,2}(?:\\.\\d{1,2})?)(?=\\s*(?:\\/|·|$))/);
        if (!match) return false;
        node.dataset.index ||= match[1];
        node.classList.add('hm-ds-index-label');
        return true;
      });

  const numberSelector = [
    '.hm-subno', '.narrative-subno', '.synthesis-subno', '.hm-card-no',
    '.hm-ds-index-label[data-index]', '.problem-item > small:first-child',
    '.signal-item > small:first-child', '.principle-item > small:first-child',
    '.behavior-pattern-card > span:first-child', '.design-rule > article > small:first-child',
    '.ax-friction-card > span:first-child', '.ax-rule-summary > article > span:first-child',
    '.ax-composition-step > span:first-child'
  ].join(',');

  const normalizeNumbers = () => {
    root.querySelectorAll(numberSelector).forEach(node => {
      const value = (node.dataset.index || node.textContent || '').trim();
      const match = value.match(/^(\\d{2}(?:\\.\\d+)?)(?![\\d.])/);
      if (match && node.textContent !== match[1]) node.textContent = match[1];
    });
  };

  if (document.body.classList.contains('hm-ds-subsection-copy-hidden')) {
    descriptionNodes().forEach(node => {
      node.dataset.hmDsVisibilityOwned = 'description';
      node.style.setProperty('display', 'none', 'important');
      node.style.setProperty('margin', '0', 'important');
      node.style.setProperty('padding', '0', 'important');
    });
  }

  indexNodes().forEach(node => {
    node.dataset.hmDsIndexOwned = 'true';
    node.style.setProperty('font-size', '0px', 'important');
    node.style.setProperty('white-space', 'nowrap', 'important');
  });
  normalizeNumbers();
  document.dispatchEvent(new CustomEvent('himart:structure-ready'));
})();
