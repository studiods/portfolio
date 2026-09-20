(() => {
  'use strict';

  const SCRAMBLE_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const titleTargets = Array.from(document.querySelectorAll(
    '.about-hero-title, ' +
    '.thinking-section .about-statement, ' +
    '.leadership-section .about-statement, ' +
    '.interview-section .about-statement'
  ));
  const titleRevealLines = new Set(
    titleTargets.flatMap((title) => Array.from(title.querySelectorAll('.reveal-line')))
  );

  const sectionLabels = Array.from(document.querySelectorAll(
    '.thinking-section > .about-section-label, ' +
    '.leadership-section > .about-section-label, ' +
    '.interview-section > .about-section-label, ' +
    '.career-section > .about-section-label'
  ));

  const labelSet = new Set(sectionLabels);
  const targets = Array.from(document.querySelectorAll('.reveal-item, .reveal-line'))
    .filter((el) => !labelSet.has(el) && !titleRevealLines.has(el));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /*
    About owns every character it animates. Keeping this entry title out of the
    generic observer prevents another runtime from replacing its text while the
    page controller settles section titles.
  */
  const asciiTitle = document.querySelector('.about-ascii-title');
  const asciiTitleOriginalHTML = asciiTitle?.innerHTML || 'ABOUT';
  const ASCII_ENTRY_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let asciiTitleRaf = 0;
  let asciiTitleChars = [];
  let asciiTitleComplete = false;

  const settleAsciiTitle = () => {
    if (!asciiTitle) return;
    if (asciiTitleRaf) cancelAnimationFrame(asciiTitleRaf);
    asciiTitleRaf = 0;
    asciiTitle.innerHTML = asciiTitleOriginalHTML;
    asciiTitle.classList.add('about-title-scramble-ready');
    asciiTitleComplete = true;
  };

  const startAsciiTitle = () => {
    if (!asciiTitle || asciiTitle.dataset.scrambleOwner === 'about-page') return;
    asciiTitle.dataset.scrambleOwner = 'about-page';
    asciiTitle.classList.add('about-title-scramble-ready');

    if (reducedMotion) {
      settleAsciiTitle();
      return;
    }

    const finalText = asciiTitle.textContent.trim() || 'ABOUT';
    asciiTitle.setAttribute('aria-label', finalText);
    asciiTitle.textContent = '';

    asciiTitleChars = Array.from(finalText).map((character) => {
      const char = document.createElement('span');
      char.className = 'about-ascii-title-char';
      char.dataset.finalChar = character;
      char.textContent = character;
      char.style.display = 'inline-block';
      asciiTitle.appendChild(char);
      const width = Math.max(1, Math.ceil(char.getBoundingClientRect().width));
      char.style.width = width + 'px';
      char.style.color = 'transparent';
      return char;
    });

    const startedAt = performance.now();
    const staggerMs = 72;
    const cycleMs = 86;
    const cycles = 4;
    const frame = (now) => {
      let complete = true;
      asciiTitleChars.forEach((char, index) => {
        const elapsed = now - startedAt - index * staggerMs;
        if (elapsed < 0) {
          complete = false;
          return;
        }

        const cycle = Math.floor(elapsed / cycleMs);
        if (cycle < cycles) {
          complete = false;
          char.textContent = ASCII_ENTRY_POOL[(index * 19 + cycle * 11) % ASCII_ENTRY_POOL.length];
          char.style.color = '';
        } else {
          char.textContent = char.dataset.finalChar || '';
          char.style.color = '';
        }
      });

      if (complete) {
        settleAsciiTitle();
        return;
      }
      asciiTitleRaf = requestAnimationFrame(frame);
    };
    asciiTitleRaf = requestAnimationFrame(frame);
  };

  startAsciiTitle();
  const reveal = (el) => el.classList.add('is-visible');
  const revealLabel = (el) => {
    el.classList.remove('section-label-pending');
    el.classList.add('section-label-visible');
  };

  const splitTitleChars = (title) => {
    title.classList.add('about-scramble-title');
    title.querySelectorAll('.reveal-line').forEach((line) => {
      line.classList.add('is-visible');
      Array.from(line.childNodes).forEach((node) => {
        if (node.nodeType !== Node.TEXT_NODE) return;
        const fragment = document.createDocumentFragment();
        Array.from(node.textContent).forEach((character) => {
          const span = document.createElement('span');
          span.className = 'about-scramble-char';
          span.textContent = character;
          span.dataset.finalChar = character;
          fragment.appendChild(span);
        });
        node.replaceWith(fragment);
      });
    });
    return Array.from(title.querySelectorAll('.about-scramble-char'))
      .filter((char) => char.textContent.trim());
  };

  const titleCharacters = new Map();
  const titleOriginalHTML = new Map();
  titleTargets.forEach((title) => {
    titleOriginalHTML.set(title, title.innerHTML);
    const chars = splitTitleChars(title);
    titleCharacters.set(title, chars);
    chars.forEach((char) => { char.style.color = 'transparent'; });
  });

  const settleTitle = (title) => {
    const originalHTML = titleOriginalHTML.get(title);
    if (originalHTML != null) {
      title.innerHTML = originalHTML;
      title.dataset.scrambleDone = '1';
    }
  };

  const animateTitle = (title) => {
    if (!title || title.dataset.scrambleDone === '1') return;
    title.dataset.scrambleDone = '1';
    const chars = titleCharacters.get(title) || [];
    const startedAt = performance.now();
    const staggerMs = 26;
    const cycleMs = 96;

    const frame = (now) => {
      let complete = true;
      chars.forEach((char, index) => {
        const elapsed = now - startedAt - index * staggerMs;
        if (elapsed < 0) {
          complete = false;
          return;
        }
        const cycle = Math.floor(elapsed / cycleMs);
        if (cycle < 3) {
          complete = false;
          char.dataset.scramble = SCRAMBLE_POOL[(index * 17 + cycle * 13) % SCRAMBLE_POOL.length];
          char.classList.add('is-scrambling');
        } else {
          char.textContent = char.dataset.finalChar ?? char.textContent;
          char.removeAttribute('data-scramble');
          char.classList.remove('is-scrambling');
          char.style.color = '';
        }
      });
      if (!complete) requestAnimationFrame(frame);
      else settleTitle(title);
    };
    requestAnimationFrame(frame);
  };

  if (reducedMotion) {
    targets.forEach(reveal);
    sectionLabels.forEach(revealLabel);
    titleTargets.forEach(settleTitle);
    return;
  }

  if ('IntersectionObserver' in window) {
    const titleObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateTitle(entry.target);
        titleObserver.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    titleTargets.forEach((title) => titleObserver.observe(title));
  } else {
    titleTargets.forEach(animateTitle);
  }

  /*
    Labels are visible by default in CSS. JS only puts unreached labels into a
    pending state, so a script/observer failure can never leave them invisible.
  */
  const prepareLabels = () => {
    const triggerY = window.innerHeight * 0.88;
    sectionLabels.forEach((label) => {
      const rect = label.getBoundingClientRect();
      if (rect.top <= triggerY) {
        revealLabel(label);
      } else {
        label.classList.add('section-label-pending');
      }
    });
  };

  const checkLabels = () => {
    const triggerY = window.innerHeight * 0.88;
    sectionLabels.forEach((label) => {
      if (label.classList.contains('section-label-visible')) return;
      const rect = label.getBoundingClientRect();
      /*
        Deliberately use only the top threshold. If fast scrolling or restored
        scroll position has already moved the label above the viewport, it is
        still revealed instead of being permanently skipped.
      */
      if (rect.top <= triggerY) revealLabel(label);
    });
  };

  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.01,
      rootMargin: '0px 0px -4% 0px'
    });

    targets.forEach((el) => observer.observe(el));
  } else {
    targets.forEach(reveal);
  }

  const checkGenericTargets = () => {
    const triggerY = window.innerHeight * 0.96;
    targets.forEach((el) => {
      if (el.classList.contains('is-visible')) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= triggerY) {
        reveal(el);
        if (observer) observer.unobserve(el);
      }
    });
  };

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    settleAsciiTitle();
    titleTargets.forEach(settleTitle);
  });
  window.addEventListener('pagehide', () => {
    settleAsciiTitle();
    titleTargets.forEach(settleTitle);
  });

  prepareLabels();

  requestAnimationFrame(() => {
    checkLabels();
    checkGenericTargets();
  });

  let ticking = false;
  const onViewportChange = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      checkLabels();
      checkGenericTargets();
      ticking = false;
    });
  };

  window.addEventListener('scroll', onViewportChange, { passive: true });
  window.addEventListener('resize', onViewportChange, { passive: true });
})();

/* Career accordion — row navigation removed; arrow owns open/close. */
(() => {
  'use strict';

  const items = Array.from(document.querySelectorAll('[data-career-item]'));
  if (!items.length) return;

  const setState = (item, open) => {
    const toggle = item.querySelector('.career-toggle');
    const detail = item.querySelector('.career-detail');
    const company = item.querySelector('.career-company')?.textContent?.trim() || '경력';
    if (!toggle || !detail) return;

    item.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', `${company} 상세 이력 ${open ? '접기' : '펼치기'}`);
    detail.setAttribute('aria-hidden', String(!open));
  };

  const closeOthers = (except) => {
    items.forEach((item) => {
      if (item !== except && item.classList.contains('is-open')) setState(item, false);
    });
  };

  items.forEach((item) => {
    const row = item.querySelector('.career-row-v2');
    const toggle = item.querySelector('.career-toggle');
    const detailGrid = item.querySelector('.career-detail-grid');
    if (!row || !toggle || !detailGrid) return;

    const toggleItem = () => {
      const willOpen = !item.classList.contains('is-open');
      if (willOpen) closeOthers(item);
      setState(item, willOpen);
    };

    row.addEventListener('click', (event) => {
      const selection = window.getSelection?.();
      if (selection && String(selection).trim()) return;
      if (event.target.closest('.career-toggle')) return;
      toggleItem();
    });

    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleItem();
    });

    detailGrid.addEventListener('click', () => {
      const selection = window.getSelection?.();
      if (selection && String(selection).trim()) return;
      setState(item, false);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const openItem = items.find((item) => item.classList.contains('is-open'));
    if (!openItem) return;
    const toggle = openItem.querySelector('.career-toggle');
    setState(openItem, false);
    toggle?.focus({ preventScroll: true });
  });
})();
