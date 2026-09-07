/*
  Portfolio global navigation + global right-side chapter navigator.
  HOME / ABOUT / CONTACT never receive the right-side navigator.
*/
(() => {
  'use strict';

  const links = [
    { label: 'Home', href: './index.html', page: 'home' },
    { label: 'About', href: './about.html', page: 'about' },
    { label: 'Works', href: './works.html', page: 'works' },
    { label: 'Contact', href: './index.html#contact', page: 'contact' }
  ];

  const currentPage = () => {
    const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (file === 'about.html') return 'about';
    if (file === 'index.html' || file === '') return 'home';
    return 'works';
  };

  const mountNavigation = active => {
    document.querySelectorAll('body > .top').forEach(node => node.remove());
    document.body.classList.toggle('portfolio-progress-page', active === 'works');
    const items = links.map(({label,href,page}) =>
      '<a href="' + href + '"' + (page === active ? ' aria-current="page"' : '') + '>' + label + '</a>'
    ).join('');
    document.body.insertAdjacentHTML('afterbegin',
      '<nav class="top" aria-label="Global navigation"><div class="top-center">' + items + '</div></nav>'
    );
  };

  const progressTargets = () => {
    if (!document.body.classList.contains('portfolio-progress-page')) return [];
    if (document.body.classList.contains('works-page-body')) {
      return [...document.querySelectorAll('.works-grid .works-card')];
    }
    return [...document.querySelectorAll('#live-main > section.hm-section')]
      .filter(section => section.querySelector('.hm-section-title'));
  };

  const mountProgress = () => {
    document.querySelectorAll('.hm-progress,.works-progress,.hm-global-progress').forEach(node => node.remove());
    const targets = progressTargets();
    if (!targets.length) return;

    const nav = document.createElement('nav');
    nav.className = 'hm-global-progress';
    nav.setAttribute('aria-label', 'Page sections');

    const progressLinks = targets.map((target, index) => {
      if (!target.id) target.id = `portfolio-section-${index + 1}`;
      const link = document.createElement('a');
      link.href = `#${target.id}`;
      link.textContent = String(index + 1).padStart(2, '0');
      link.setAttribute('aria-label', `${index + 1}번째 주요 영역`);
      nav.appendChild(link);
      return link;
    });
    document.body.appendChild(nav);

    let raf = 0;
    const update = () => {
      raf = 0;
      const focusY = window.innerHeight * .5;
      let activeIndex = -1;
      targets.forEach((target, index) => {
        const rect = target.getBoundingClientRect();
        if (rect.top <= focusY && rect.bottom >= focusY) activeIndex = index;
      });
      progressLinks.forEach((link, index) => {
        const active = index === activeIndex;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    };
    const requestUpdate = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestUpdate, {passive:true});
    window.addEventListener('resize', requestUpdate);
    update();
  };

  const mount = () => {
    const active = currentPage();
    mountNavigation(active);
    if (active === 'works') mountProgress();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();
