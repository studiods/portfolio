/* HIMART Design System — immediate post-content scramble animation */
(() => {
  const glyphs = '가나다라마바사아자차카타파하ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const chapterSelector = '#brand .hm-section-title, #data .hm-section-title, #journey .hm-section-title, #direction .hm-section-title';
  const stateByElement = new WeakMap();
  const activeAnimations = new Set();
  let heroStarted = false;

  const finishScramble = element => {
    const state = stateByElement.get(element);
    if (!state) return;
    if (state.timer) {
      clearInterval(state.timer);
      state.timer = null;
    }
    const nodes = textNodes(element);
    if (Array.isArray(state.original) && nodes.length === state.original.length) {
      nodes.forEach((node, index) => {
        node.nodeValue = state.original[index];
      });
    }
    state.running = false;
    state.completed = true;
    stateByElement.set(element, state);
    activeAnimations.delete(element);
    element.removeAttribute('data-hm-scramble-active');
  };

  const textNodes = element => {
    const nodes = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if ((walker.currentNode.nodeValue || '').trim()) nodes.push(walker.currentNode);
    }
    return nodes;
  };

  const scramble = (element, kind, replay = false) => {
    if (!element || !document.contains(element)) return false;
    const nodes = textNodes(element);
    if (!nodes.length) return false;

    const state = stateByElement.get(element) || {
      running: false,
      completed: false,
      signature: '',
      original: null,
      visible: false
    };
    // Keep the resolved source text independent from the currently rendered glyphs.
    // If an element leaves the viewport during the animation, its temporary random
    // characters must never become the next animation's source text.
    const original = Array.isArray(state.original) && state.original.length === nodes.length
      ? state.original.slice()
      : nodes.map(node => node.nodeValue || '');
    const signature = original.join('\u0001');
    if (state.running || (!replay && state.completed && state.signature === signature)) return false;

    state.running = true;
    state.completed = true;
    state.signature = signature;
    state.original = original.slice();
    state.timer = null;
    stateByElement.set(element, state);
    activeAnimations.add(element);
    element.setAttribute('data-hm-scramble-active', 'true');
    element.setAttribute('data-hm-scramble-kind', kind);
    element.setAttribute('data-hm-scramble-runs', String(Number(element.getAttribute('data-hm-scramble-runs') || 0) + 1));

    const totalSteps = 26;
    let step = 0;
    const render = () => {
      nodes.forEach((node, nodeIndex) => {
        const source = [...original[nodeIndex]];
        node.nodeValue = source.map((char, charIndex) => {
          if (/\s/.test(char) || char === '·') return char;
          const resolveAt = Math.floor((charIndex / Math.max(1, source.length)) * totalSteps);
          return step >= resolveAt ? char : glyphs[Math.floor(Math.random() * glyphs.length)];
        }).join('');
      });
    };

    try {
      render();
    } catch (error) {
      finishScramble(element);
      return false;
    }

    const timer = setInterval(() => {
      try {
        step += 1;
        if (step >= totalSteps) {
          finishScramble(element);
          return;
        }
        render();
      } catch (error) {
        // Any interrupted render must end on the original source text.
        finishScramble(element);
      }
    }, 30);
    state.timer = timer;
    stateByElement.set(element, state);
    return true;
  };

  const isInView = element => {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.82 && rect.bottom > window.innerHeight * 0.08;
  };

  const scanChapters = () => {
    document.querySelectorAll(chapterSelector).forEach(title => {
      const state = stateByElement.get(title) || { running: false, completed: false, signature: '', visible: false };
      const visible = isInView(title);
      if (!visible) {
        state.visible = false;
        // Allow a fresh replay on re-entry, but retain state.original so a
        // partially rendered scramble can never be used as source text.
        state.completed = false;
        stateByElement.set(title, state);
        return;
      }
      if (!state.visible) {
        state.visible = true;
        stateByElement.set(title, state);
        scramble(title, 'chapter');
      }
    });
  };

  const launchHero = () => {
    if (heroStarted) return true;
    const hero = document.querySelector('.hm-movie-copy .hm-title');
    if (!hero) return false;
    heroStarted = true;
    if ('IntersectionObserver' in window) {
      const hio = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          scramble(hero, 'hero');
          hio.disconnect();
        }
      }), {threshold:.25});
      hio.observe(hero);
    } else {
      requestAnimationFrame(() => scramble(hero, 'hero'));
    }
    return true;
  };

  const waitForContentReady = () => {
    const checkReady = () => {
      if (!document.body?.classList.contains('himart-narrative-ready')) return false;
      const launched = launchHero();
      scanChapters();
      return launched;
    };
    if (checkReady()) return;
    const timer = setInterval(() => {
      if (checkReady()) clearInterval(timer);
    }, 16);
    setTimeout(() => clearInterval(timer), 12000);
    document.addEventListener('himart:narrative-ready', checkReady, { once: true });
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) activeAnimations.forEach(finishScramble);
  });
  window.addEventListener('pagehide', () => {
    activeAnimations.forEach(finishScramble);
  });

  let scrollQueued = false;
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      scanChapters();
    });
  }, { passive: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForContentReady, { once: true });
  } else {
    waitForContentReady();
  }

  window.addEventListener('load', () => setTimeout(scanChapters, 0), { once: true });
})();