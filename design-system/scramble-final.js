/* HIMART Design System — immediate post-content scramble animation */
(() => {
  const glyphs = '가나다라마바사아자차카타파하ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const chapterSelector = '#brand .hm-section-title, #data .hm-section-title, #journey .hm-section-title, #direction .hm-section-title';
  const stateByElement = new WeakMap();
  let heroStarted = false;

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
    stateByElement.set(element, state);
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

    render();
    const timer = setInterval(() => {
      step += 1;
      if (step >= totalSteps) {
        clearInterval(timer);
        nodes.forEach((node, index) => { node.nodeValue = original[index]; });
        state.running = false;
        stateByElement.set(element, state);
        element.removeAttribute('data-hm-scramble-active');
        return;
      }
      render();
    }, 30);
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
    requestAnimationFrame(() => {
      if (!scramble(hero, 'hero')) heroStarted = false;
    });
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