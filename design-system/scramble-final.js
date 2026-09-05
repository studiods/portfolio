/* HIMART Design System — deterministic, DOM-safe scramble animation */
(() => {
  const glyphs = '가나다라마바사아자차카타파하ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const stateByElement = new WeakMap();
  const debug = window.__hmScrambleDebug || {
    heroRuns: 0,
    chapterRuns: 0,
    totalRuns: 0,
    lastRun: null
  };
  window.__hmScrambleDebug = debug;

  const getTargets = () => ({
    hero: document.querySelector('.hm-movie-copy .hm-title'),
    chapters: [...document.querySelectorAll(
      '#brand .hm-section-title, #data .hm-section-title, #journey .hm-section-title, #direction .hm-section-title'
    )]
  });

  const getTextNodes = el => {
    const nodes = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  };

  const hasText = el => getTextNodes(el).some(node => (node.nodeValue || '').trim().length > 0);

  const run = (el, kind) => {
    if (!el || !document.contains(el) || !hasText(el)) return false;
    const currentText = el.textContent || '';
    const state = stateByElement.get(el) || {
      running: false,
      played: false,
      signature: currentText,
      inView: false,
      runs: 0
    };
    if (state.signature !== currentText && !state.running) {
      state.signature = currentText;
      state.played = false;
    }
    if (state.running || state.played) {
      stateByElement.set(el, state);
      return false;
    }

    const nodes = getTextNodes(el);
    const originals = nodes.map(node => node.nodeValue || '');
    state.running = true;
    state.played = true;
    state.runs += 1;
    stateByElement.set(el, state);
    el.classList.add('is-scrambling');
    el.setAttribute('data-hm-scramble-active', 'true');
    el.setAttribute('data-hm-scramble-runs', String(state.runs));
    debug.totalRuns += 1;
    if (kind === 'hero') debug.heroRuns += 1;
    else debug.chapterRuns += 1;
    debug.lastRun = { kind, text: currentText.slice(0, 80), at: Date.now() };

    const totalFrames = 42;
    let frame = 0;
    const tick = () => {
      nodes.forEach((node, nodeIndex) => {
        const original = originals[nodeIndex];
        const chars = [...original];
        node.nodeValue = chars.map((char, index) => {
          if (/\s/.test(char) || char === '·') return char;
          const threshold = (index / Math.max(1, chars.length)) * totalFrames;
          return frame >= threshold
            ? char
            : glyphs[Math.floor(Math.random() * glyphs.length)];
        }).join('');
      });
      if (frame < totalFrames) {
        frame += 1;
        requestAnimationFrame(tick);
      } else {
        nodes.forEach((node, nodeIndex) => { node.nodeValue = originals[nodeIndex]; });
        state.running = false;
        el.classList.remove('is-scrambling');
        el.removeAttribute('data-hm-scramble-active');
        stateByElement.set(el, state);
      }
    };
    requestAnimationFrame(tick);
    return true;
  };

  const inViewport = el => {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.82 && rect.bottom > window.innerHeight * 0.08;
  };

  const scan = () => {
    const { hero, chapters } = getTargets();
    if (hero) run(hero, 'hero');
    chapters.forEach(chapter => {
      const state = stateByElement.get(chapter) || {
        running: false, played: false, signature: chapter.textContent || '', inView: false, runs: 0
      };
      const visible = inViewport(chapter);
      if (!visible) {
        state.inView = false;
        state.played = false;
      } else if (!state.inView) {
        state.inView = true;
        stateByElement.set(chapter, state);
        run(chapter, 'chapter');
      }
      stateByElement.set(chapter, state);
    });
    return Boolean(hero || chapters.length);
  };

  let queued = false;
  const scheduleScan = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      scan();
    });
  };

  window.__hmScrambleScan = scan;
  window.__hmScramblePlay = run;
  window.addEventListener('scroll', scheduleScan, { passive: true });
  window.addEventListener('resize', scheduleScan, { passive: true });

  const boot = () => {
    scan();
    [80, 300, 800, 1500, 3000].forEach(delay => setTimeout(scan, delay));
    const retry = setInterval(() => {
      if (scan()) {
        retry.dataset = undefined;
      }
    }, 500);
    setTimeout(() => clearInterval(retry), 12000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
  window.addEventListener('load', () => {
    scan();
    setTimeout(scan, 500);
  }, { once: true });

  if ('MutationObserver' in window) {
    const observer = new MutationObserver(scheduleScan);
    const observe = () => {
      if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    };
    if (document.body) observe();
    else document.addEventListener('DOMContentLoaded', observe, { once: true });
  }
})();