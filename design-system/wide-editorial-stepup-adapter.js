/* STEPUP — desktop wide editorial DOM adapter. */
(() => {
  'use strict';

  const isTarget = () =>
    document.body?.classList.contains('nbt-stepup-page') &&
    document.body?.classList.contains('hm-wide-stepup-test');

  /* Hero copy normalization runs immediately when this deferred script executes,
     before DOMContentLoaded and before scramble-final captures its authored source. */
  const normalizeHeroTitle = () => {
    if (!document.body?.classList.contains('nbt-stepup-page')) return;
    const title = document.querySelector('#top .hm-ds-hero__title, #top .hm-title');
    if (!title) return;
    const text = (title.textContent || '').replace(/\s+/g, ' ').trim();
    if (text === '만보계가 아닌 습관을 만드는 경험을 설계했습니다.') {
      title.innerHTML = '만보계가 아닌 습관을 만드는<br>경험을 설계했습니다.';
    }
  };

  normalizeHeroTitle();

  const mount = () => {
    if (!isTarget() || window.__hmWideStepupMounted) return;

    normalizeHeroTitle();

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