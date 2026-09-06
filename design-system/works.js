/* WORKS page controller — title state, project switcher, media and centered project handoff. */
(() => {
  'use strict';

  const body = document.body;
  if (!body.classList.contains('works-page-body')) return;

  const title = document.querySelector('.works-page-title');
  const hero = document.querySelector('.works-hero');
  const grid = document.querySelector('.works-grid');
  const cards = [...document.querySelectorAll('.works-grid .works-card')];
  if (!title || !hero || !grid || !cards.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const smoothstep = value => {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  };
  const copies = cards.map(card => card.querySelector('.works-card-copy'));

  /* Keep authored video behavior without page-local CSS/JS overrides. */
  cards.forEach(card => {
    const video = card.querySelector('.works-card-video');
    if (!video) return;
    video.muted = true;
    video.setAttribute('muted', '');
    const attempt = video.play();
    if (attempt && attempt.catch) attempt.catch(() => {});
  });

  /* Entry scramble remains a one-second A-Z / 0-9 reveal, owned by the DS. */
  const runEntryScramble = () => {
    if (reduced || title.dataset.scrambleReady === '1') return;
    title.dataset.scrambleReady = '1';
    const finalText = title.textContent.trim() || 'WORKS';
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    title.textContent = '';
    const chars = [...finalText].map((finalChar, index) => {
      const span = document.createElement('span');
      span.className = 'entry-scramble-char';
      span.dataset.finalChar = finalChar;
      span.textContent = finalChar;
      title.appendChild(span);
      return {span, finalChar, index};
    });
    const duration = 1000;
    const start = performance.now();
    const frame = now => {
      const progress = clamp((now - start) / duration, 0, 1);
      chars.forEach(({span, finalChar, index}) => {
        const local = clamp(progress * 1.35 - index / Math.max(1, chars.length) * .35, 0, 1);
        if (local >= 1 || finalChar === ' ') span.textContent = finalChar;
        else span.textContent = pool[(Math.floor(now / 70) + index * 11) % pool.length];
      });
      if (progress < 1) requestAnimationFrame(frame);
      else chars.forEach(({span, finalChar}) => { span.textContent = finalChar; });
    };
    requestAnimationFrame(frame);
  };

  /* Project switcher is generated from the actual Works cards. */
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
    const destination = card.querySelector('.works-card-title-link, .works-card-media-link');
    const item = document.createElement('a');
    item.href = destination?.getAttribute('href') || '#';
    item.textContent = heading ? heading.textContent.trim() : card.textContent.trim();
    menu.appendChild(item);
  });
  body.append(trigger, menu);

  const closeMenu = () => {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', '프로젝트 목록 열기');
    menu.classList.remove('is-open');
  };

  const placeSwitcher = () => {
    const rect = title.getBoundingClientRect();
    trigger.style.left = `${Math.round(rect.right + 24)}px`;
    trigger.style.top = `${Math.round(rect.top + (rect.height - 18) / 2)}px`;
    menu.style.left = `${Math.round(rect.left)}px`;
    menu.style.top = `${Math.round(rect.bottom + 24)}px`;
  };

  trigger.addEventListener('click', () => {
    if (!body.classList.contains('works-title-compact')) return;
    const open = trigger.getAttribute('aria-expanded') === 'true';
    if (open) closeMenu();
    else {
      trigger.setAttribute('aria-expanded', 'true');
      trigger.setAttribute('aria-label', '프로젝트 목록 닫기');
      menu.classList.add('is-open');
      placeSwitcher();
    }
  });

  document.addEventListener('pointerdown', event => {
    if (!menu.contains(event.target) && event.target !== trigger) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  const progressLinks = [...document.querySelectorAll('.works-progress a')];
  const updateProgress = () => {
    if (!progressLinks.length) return;
    const center = window.innerHeight * .5;
    let bestIndex = 0;
    let bestDistance = Infinity;
    progressLinks.forEach((link, index) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const distance = Math.abs((rect.top + rect.height * .5) - center);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    progressLinks.forEach((link, index) => link.classList.toggle('is-active', index === bestIndex));
  };

  /*
    Desktop project-copy handoff:
    - the current copy is fixed to the viewport vertical center;
    - the next copy rises from below and eases into that same center position;
    - the outgoing copy still moves upward by up to 96px;
    - fade exponent changed from 3 to 1.5, making the opacity falloff about 50% less abrupt.
  */
  const updateProjectCopies = compact => {
    const isDesktop = window.innerWidth > 780;
    if (!isDesktop || !compact) {
      copies.forEach(copy => {
        if (!copy) return;
        copy.style.setProperty('--works-copy-top', '50vh');
        copy.style.setProperty('--works-copy-opacity', '1');
        copy.style.setProperty('--works-copy-shift', '0px');
        copy.style.removeProperty('--works-copy-z');
        copy.style.pointerEvents = '';
      });
      return;
    }

    const center = window.innerHeight * .5;
    const handoffDistance = clamp(window.innerHeight * .17, 140, 220);
    const gridBottom = grid.getBoundingClientRect().bottom;

    const easedIncomingOffset = rawDistance => {
      if (rawDistance <= 0) return 0;
      if (rawDistance >= handoffDistance) return rawDistance;
      const u = rawDistance / handoffDistance;
      /* Hermite curve: zero arrival velocity at center, unit velocity at the outer edge. */
      return handoffDistance * (-u * u * u + 2 * u * u);
    };

    copies.forEach((copy, index) => {
      if (!copy) return;
      const rect = cards[index].getBoundingClientRect();
      const cardCenter = rect.top + rect.height * .5;
      const distanceBelowCenter = cardCenter - center;

      let y = center;
      let opacity = 1;
      let shift = 0;

      if (distanceBelowCenter > 0) {
        y = center + easedIncomingOffset(distanceBelowCenter);
        const arrival = clamp((center + handoffDistance - cardCenter) / handoffDistance, 0, 1);
        opacity = smoothstep(arrival);
      }

      const nextCard = cards[index + 1];
      const nextAnchor = nextCard
        ? (() => {
            const nextRect = nextCard.getBoundingClientRect();
            return nextRect.top + nextRect.height * .5;
          })()
        : gridBottom;

      const exit = clamp((center + handoffDistance - nextAnchor) / handoffDistance, 0, 1);
      if (exit > 0) {
        opacity *= Math.pow(1 - exit, 1.5);
        shift = -96 * exit;
      }

      copy.style.setProperty('--works-copy-top', `${y.toFixed(1)}px`);
      copy.style.setProperty('--works-copy-opacity', opacity.toFixed(3));
      copy.style.setProperty('--works-copy-shift', `${shift.toFixed(1)}px`);
      copy.style.setProperty('--works-copy-z', String(1000 + index));
      copy.style.pointerEvents = opacity > .18 ? 'auto' : 'none';
    });
  };

  const updateTitle = () => {
    const range = Math.max(1, Math.min(520, hero.offsetHeight * .55));
    const p = reduced ? (window.scrollY > 32 ? 1 : 0) : clamp(window.scrollY / range, 0, 1);
    const startSize = clamp(window.innerWidth * .09, 72, 160);
    const endSize = 32;
    const startTop = window.innerHeight * .5;
    const endTop = window.innerWidth <= 780 ? 24 : 32;
    const size = startSize + (endSize - startSize) * p;
    const top = startTop + (endTop - startTop) * p;
    const translate = -50 * (1 - p);

    title.style.setProperty('--works-title-size', `${size.toFixed(2)}px`);
    title.style.setProperty('--works-title-top', `${top.toFixed(2)}px`);
    title.style.setProperty('--works-title-translate', `${translate.toFixed(2)}%`);

    const compact = p >= .985;
    body.classList.toggle('works-title-compact', compact);
    if (!compact) closeMenu();
    placeSwitcher();
    updateProjectCopies(compact);
    updateProgress();
  };

  let raf = 0;
  const requestUpdate = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      updateTitle();
    });
  };

  window.addEventListener('scroll', requestUpdate, {passive:true});
  window.addEventListener('resize', requestUpdate);
  runEntryScramble();
  updateTitle();
})();
