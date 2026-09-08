/* STEPUP — desktop wide editorial DOM adapter. */
(() => {
  'use strict';

  const isTarget = () =>
    document.body?.classList.contains('nbt-stepup-page') &&
    document.body?.classList.contains('hm-wide-stepup-test');

  const mount = () => {
    if (!isTarget() || window.__hmWideStepupMounted) return;

    const sections = [...document.querySelectorAll('#live-main > .hm-section[data-chapter]')];
    if (!sections.length) return;

    sections.forEach(section => {
      const wrap = section.querySelector(':scope > .hm-wrap');
      const head = wrap?.querySelector(':scope > .hm-section-head');
      if (!wrap || !head) return;

      let rail = wrap.querySelector(':scope > .hm-wide-right-rail');
      if (!rail) {
        rail = document.createElement('div');
        rail.className = 'hm-wide-right-rail';
        head.insertAdjacentElement('afterend', rail);
      }

      [...wrap.children]
        .filter(node => node !== head && node !== rail)
        .forEach(node => rail.appendChild(node));
    });

    window.__hmWideStepupMounted = true;
    document.body.classList.add('hm-wide-stepup-ready');
    window.__hmAnimationScan?.();
    window.dispatchEvent(new Event('resize'));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(mount), {once:true});
  } else {
    requestAnimationFrame(mount);
  }
})();