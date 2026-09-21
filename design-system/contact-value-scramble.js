(() => {
  'use strict';

  const body = document.body;
  if (!body?.classList.contains('contact-page-body')) return;

  const rows = [...document.querySelectorAll('.contact-row')];
  if (!rows.length) return;

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const START_DELAY = 760;
  const DURATION = 900;
  const NEXT_AT = 0.30;
  const CYCLE = 42;

  const randomGlyph = () => glyphs[Math.floor(Math.random() * glyphs.length)];

  if (reduce) {
    rows.forEach(row => row.classList.add('is-contact-row-visible'));
    return;
  }

  const states = rows.map(row => {
    const value = row.querySelector('.contact-value');
    if (!value) return null;
    return {
      row,
      value,
      originalHTML:value.innerHTML,
      originalText:value.textContent || '',
      started:false,
      nextStarted:false
    };
  });

  const finish = state => {
    state.value.innerHTML = state.originalHTML;
    state.value.removeAttribute('data-contact-scramble-active');
    state.value.setAttribute('data-contact-scramble-complete','true');
  };

  const startRow = index => {
    const state = states[index];
    if (!state || state.started) return;

    state.started = true;
    state.row.classList.add('is-contact-row-visible');
    state.value.setAttribute('data-contact-scramble-active','true');
    state.value.setAttribute('aria-label', state.originalText.trim());

    const chars = [...state.originalText];
    const startedAt = performance.now();
    let lastBucket = -1;

    const frame = now => {
      const progress = Math.min(1, (now - startedAt) / DURATION);

      if (!state.nextStarted && progress >= NEXT_AT) {
        state.nextStarted = true;
        startRow(index + 1);
      }

      const bucket = Math.floor((now - startedAt) / CYCLE);
      if (bucket !== lastBucket || progress >= 1) {
        lastBucket = bucket;
        const resolvedCount = Math.floor(chars.length * progress);
        state.value.textContent = chars.map((char, charIndex) => {
          if (/\s/.test(char) || char === '·' || char === '/' || char === '.' || char === '@' || char === '-') return char;
          if (charIndex < resolvedCount) return char;
          return randomGlyph();
        }).join('');
      }

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        finish(state);
        if (!state.nextStarted) startRow(index + 1);
      }
    };

    requestAnimationFrame(frame);
  };

  window.setTimeout(() => startRow(0), START_DELAY);
})();