/* Works menu — generated from the links currently shown in the Works list. */
(() => {
  const mount = () => {
    const title = document.querySelector('.works-title-layer, .works-page-title');
    const cards = [...document.querySelectorAll('.works-grid .works-card[href]')];
    if (!title || !cards.length || document.querySelector('.works-title-menu-toggle')) return;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'works-title-menu-toggle';
    trigger.setAttribute('aria-label', '프로젝트 목록 열기');
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');

    const menu = document.createElement('nav');
    menu.className = 'works-project-menu';
    menu.setAttribute('aria-label', 'Works projects');

    cards.forEach(card => {
      const heading = card.querySelector('.works-card-title');
      const item = document.createElement('a');
      item.href = card.getAttribute('href');
      item.textContent = heading ? heading.textContent.trim() : card.textContent.trim();
      menu.appendChild(item);
    });

    document.body.append(trigger, menu);

    const place = () => {
      const rect = title.getBoundingClientRect();
      trigger.style.left = Math.round(rect.right + 8) + 'px';
      trigger.style.top = Math.round(rect.top + (rect.height - 18) / 2) + 'px';
      menu.style.left = Math.round(rect.left) + 'px';
      menu.style.top = Math.round(rect.bottom + 12) + 'px';
    };
    const close = () => {
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-label', '프로젝트 목록 열기');
      menu.classList.remove('is-open');
    };
    const toggle = () => {
      const open = trigger.getAttribute('aria-expanded') === 'true';
      if (open) close();
      else {
        trigger.setAttribute('aria-expanded', 'true');
        trigger.setAttribute('aria-label', '프로젝트 목록 닫기');
        menu.classList.add('is-open');
        place();
      }
    };

    trigger.addEventListener('click', toggle);
    document.addEventListener('pointerdown', event => {
      if (!menu.contains(event.target) && event.target !== trigger) close();
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
    addEventListener('scroll', place, {passive:true});
    addEventListener('resize', place);
    place();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();