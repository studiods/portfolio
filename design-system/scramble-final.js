/* HIMART Design System — fail-safe title scramble and content constraints. */
(() => {
  const glyphs = '가나다라마바사아자차카타파하ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const titleSelector = '#live-main .hm-section-head .hm-section-title.js-scramble, #live-main .hm-section-head .hm-section-title';
  const heroSelector = ':is(.hm-hero,.hm-movie-hero,.ways-hero) .hm-title.js-scramble, :is(.hm-hero,.hm-movie-hero,.ways-hero) .hm-title';
  const descriptionSelector = '#live-main :is(.hm-lead,.hm-section-desc,.hm-subcopy,.data-card-head .desc)';
  const stateByElement = new WeakMap();
  const activeAnimations = new Set();
  let heroStarted = false;

  const textNodes = element => {
    const nodes = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if ((walker.currentNode.nodeValue || '').trim()) nodes.push(walker.currentNode);
    }
    return nodes;
  };

  const finishScramble = element => {
    const state = stateByElement.get(element);
    if (!state) return;
    if (state.timer) clearInterval(state.timer);
    const nodes = textNodes(element);
    if (nodes.length === state.original.length) {
      nodes.forEach((node, index) => { node.nodeValue = state.original[index]; });
    } else if (state.originalHTML != null) {
      /* A DOM replacement during motion must still finish on the authored text. */
      element.innerHTML = state.originalHTML;
    }
    state.timer = null;
    state.running = false;
    state.completed = true;
    stateByElement.set(element, state);
    activeAnimations.delete(element);
    element.removeAttribute('data-hm-scramble-active');
  };

  const scramble = (element, kind, replay = false) => {
    if (!element || !document.contains(element)) return false;
    const nodes = textNodes(element);
    if (!nodes.length) return false;
    const previous = stateByElement.get(element);
    const original = previous?.original?.length === nodes.length
      ? previous.original.slice()
      : nodes.map(node => node.nodeValue || '');
    const signature = original.join('\u0001');
    if (previous?.running || (!replay && previous?.completed && previous.signature === signature)) return false;

    const state = {
      running: true,
      completed: false,
      visible: true,
      signature,
      original,
      originalHTML: previous?.originalHTML ?? element.innerHTML,
      timer: null
    };
    stateByElement.set(element, state);
    activeAnimations.add(element);
    element.setAttribute('data-hm-scramble-active', 'true');
    element.setAttribute('data-hm-scramble-kind', kind);

    const totalSteps = 26;
    let step = 0;
    const render = () => {
      nodes.forEach((node, nodeIndex) => {
        const source = [...original[nodeIndex]];
        node.nodeValue = source.map((char, charIndex) => {
          if (/\s/.test(char) || char === '·') return char;
          return step >= Math.floor((charIndex / Math.max(1, source.length)) * totalSteps)
            ? char
            : glyphs[Math.floor(Math.random() * glyphs.length)];
        }).join('');
      });
    };

    try { render(); } catch { finishScramble(element); return false; }
    state.timer = setInterval(() => {
      try {
        step += 1;
        if (step >= totalSteps) finishScramble(element);
        else render();
      } catch { finishScramble(element); }
    }, 30);
    return true;
  };

  const isInView = element => {
    const rect = element.getBoundingClientRect();
    return rect.top < innerHeight * .82 && rect.bottom > innerHeight * .08;
  };

  const scanTitles = () => {
    document.querySelectorAll(titleSelector).forEach(title => {
      const state = stateByElement.get(title) || { visible: false, completed: false };
      const visible = isInView(title);
      if (!visible) {
        if (state.running) finishScramble(title);
        state.visible = false;
        state.completed = false;
        stateByElement.set(title, state);
      } else if (!state.visible) {
        state.visible = true;
        stateByElement.set(title, state);
        scramble(title, 'chapter');
      }
    });
  };

  const normaliseSubtitles = () => {
    document.querySelectorAll('#live-main .hm-section').forEach(section => {
      let order = 0;
      section.querySelectorAll('.hm-subhead .hm-subtitle').forEach(title => {
        if (!title.dataset.hmRoman) {
          order += 1;
          title.dataset.hmRoman = ['I','II','III','IV','V','VI','VII','VIII','IX','X'][order - 1] || String(order);
        }
      });
    });
  };

  const enforceDescriptionLimit = () => {
    document.querySelectorAll(descriptionSelector).forEach(element => {
      if (element.dataset.hmDescriptionLimited === 'true') return;
      const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
      if ([...text].length > 40) element.textContent = [...text].slice(0, 39).join('') + '…';
      element.dataset.hmDescriptionLimited = 'true';
    });
  };

  const launchHero = () => {
    if (heroStarted) return;
    const hero = document.querySelector(heroSelector);
    if (!hero) return;
    heroStarted = true;
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { scramble(hero, 'hero'); observer.disconnect(); }
      }), { threshold: .25 });
      observer.observe(hero);
    } else requestAnimationFrame(() => scramble(hero, 'hero'));
  };

  const initialise = () => {
    normaliseSubtitles();
    enforceDescriptionLimit();
    launchHero();
    scanTitles();
  };

  const waitForContentReady = () => {
    if (document.body?.classList.contains('himart-narrative-ready')) return initialise();
    const timer = setInterval(() => {
      if (document.body?.classList.contains('himart-narrative-ready')) {
        clearInterval(timer);
        initialise();
      }
    }, 16);
    setTimeout(() => { clearInterval(timer); initialise(); }, 12000);
    document.addEventListener('himart:narrative-ready', initialise, { once: true });
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) activeAnimations.forEach(finishScramble);
  });
  addEventListener('pagehide', () => activeAnimations.forEach(finishScramble));
  let queued = false;
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; scanTitles(); });
  }, { passive: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', waitForContentReady, { once: true });
  else waitForContentReady();
  addEventListener('load', () => setTimeout(initialise, 0), { once: true });
})();
