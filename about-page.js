(() => {
  'use strict';

  const SCRAMBLE_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const titleTargets = Array.from(document.querySelectorAll(
    '.about-hero-title, ' +
    '.thinking-section .about-statement, ' +
    '.interview-section .about-statement'
  ));
  const titleRevealLines = new Set(
    titleTargets.flatMap((title) => Array.from(title.querySelectorAll('.reveal-line')))
  );

  const sectionLabels = Array.from(document.querySelectorAll(
    '.thinking-section > .about-section-label, ' +
    '.interview-section > .about-section-label, ' +
    '.career-section > .about-section-label'
  ));

  const labelSet = new Set(sectionLabels);
  const targets = Array.from(document.querySelectorAll('.reveal-item, .reveal-line'))
    .filter((el) => !labelSet.has(el) && !titleRevealLines.has(el));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  titleTargets.forEach((title) => {
    const chars = splitTitleChars(title);
    titleCharacters.set(title, chars);
    chars.forEach((char) => { char.style.color = 'transparent'; });
  });

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
          char.classList.remove('is-scrambling');
          char.style.color = '';
        }
      });
      if (!complete) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  if (reducedMotion) {
    targets.forEach(reveal);
    sectionLabels.forEach(revealLabel);
    titleTargets.forEach((title) => {
      (titleCharacters.get(title) || []).forEach((char) => { char.style.color = ''; });
    });
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
