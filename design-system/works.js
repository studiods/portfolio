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
    const triggerHeight = trigger.getBoundingClientRect().height || 24;
    trigger.style.left = `${Math.round(rect.right + 24)}px`;
    trigger.style.top = `${Math.round(rect.top + (rect.height - triggerHeight) / 2)}px`;
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

  const goToTop = () => {
    if (!body.classList.contains('works-title-compact')) return;
    closeMenu();
    window.scrollTo({top:0, behavior:reduced ? 'auto' : 'smooth'});
  };

  title.addEventListener('click', goToTop);
  title.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (!body.classList.contains('works-title-compact')) return;
    event.preventDefault();
    goToTop();
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
    - each copy rises at the exact same scroll rate as its media, with both top edges aligned;
    - once the copy reaches viewport center it stops, while the media keeps scrolling;
    - the outgoing handoff now spans 100vh -> 50vh instead of 75vh -> 50vh, exactly doubling its scroll-height exposure;
    - opacity stays visible longer with a squared progress before smoothstep;
    - the outgoing copy can travel up to 192px, twice the previous 96px distance, before replacement completes.
  */
  const updateProjectCopies = () => {
    const isDesktop = window.innerWidth > 780;
    if (!isDesktop) {
      copies.forEach(copy => {
        if (!copy) return;
        copy.style.removeProperty('--works-copy-top');
        copy.style.setProperty('--works-copy-opacity', '1');
        copy.style.setProperty('--works-copy-shift', '0px');
        copy.style.removeProperty('--works-copy-z');
        copy.style.pointerEvents = '';
      });
      return;
    }

    const viewportHeight = window.innerHeight;
    const center = viewportHeight * .5;
    const handoffStart = viewportHeight;
    const gridBottom = grid.getBoundingClientRect().bottom;

    copies.forEach((copy, index) => {
      if (!copy) return;

      const cardRect = cards[index].getBoundingClientRect();
      const copyHeight = copy.offsetHeight;
      const naturalCenter = cardRect.top + copyHeight * .5;

      /* Natural scroll until centered; no separate incoming easing/fade. */
      const y = Math.max(center, naturalCenter);
      let opacity = 1;
      let shift = 0;

      const nextCopy = copies[index + 1];
      const nextCard = cards[index + 1];
      const nextAnchor = nextCard && nextCopy
        ? nextCard.getBoundingClientRect().top + nextCopy.offsetHeight * .5
        : gridBottom;

      if (nextAnchor < handoffStart) {
        const progress = clamp(
          (handoffStart - nextAnchor) / Math.max(1, handoffStart - center),
          0,
          1
        );
        const motion = smoothstep(progress);
        const fade = smoothstep(progress * progress);
        opacity = 1 - fade;
        shift = -192 * motion;
      }

      copy.style.setProperty('--works-copy-top', `${y.toFixed(1)}px`);
      copy.style.setProperty('--works-copy-opacity', opacity.toFixed(3));
      copy.style.setProperty('--works-copy-shift', `${shift.toFixed(1)}px`);
      copy.style.setProperty('--works-copy-z', String(1000 + index));

      const copyTop = y - copyHeight * .5 + shift;
      const copyBottom = copyTop + copyHeight;
      const isVisible = copyBottom > 0 && copyTop < viewportHeight;
      copy.style.pointerEvents = isVisible && opacity > .18 ? 'auto' : 'none';
    });
  };

  const updateTitle = () => {
    const range = Math.max(1, Math.min(520, hero.offsetHeight * .55));
    const p = reduced ? (window.scrollY > 32 ? 1 : 0) : clamp(window.scrollY / range, 0, 1);
    const startSize = clamp(window.innerWidth * .09,72,160);
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
    if (compact) {
      title.setAttribute('role', 'button');
      title.setAttribute('tabindex', '0');
      title.setAttribute('aria-label', 'WORKS 맨 위로 이동');
    } else {
      title.removeAttribute('role');
      title.removeAttribute('tabindex');
      title.removeAttribute('aria-label');
      closeMenu();
    }
    placeSwitcher();
    updateProjectCopies();
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
