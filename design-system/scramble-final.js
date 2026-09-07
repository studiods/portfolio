/*
  HIMART Design System — fail-safe title scramble.
  Authored HTML is immutable source-of-truth; stale animation callbacks are never allowed to write after cancellation.
*/
(() => {
  'use strict';

  const glyphs = '가나다라마바사아자차카타파하ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const titleSelector = '#live-main .hm-section-head .hm-section-title.js-scramble, #live-main .hm-section-head .hm-section-title';
  const heroSelector = ':is(.hm-hero,.hm-movie-hero,.ways-hero) .hm-title.js-scramble, :is(.hm-hero,.hm-movie-hero,.ways-hero) .hm-title';
  const stateByElement = new WeakMap();
  const activeAnimations = new Set();
  let heroStarted = false;
  let generation = 0;

  const textNodes = element => {
    const nodes = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if ((walker.currentNode.nodeValue || '').trim()) nodes.push(walker.currentNode);
    }
    return nodes;
  };

  const sameNodes = (element, nodes) => {
    const live = textNodes(element);
    return live.length === nodes.length && live.every((node, index) => node === nodes[index]);
  };

  const stopWithoutRestore = element => {
    const state = stateByElement.get(element);
    if (!state) return;
    state.running = false;
    state.generation = ++generation;
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = 0;
    state.completed = false;
    activeAnimations.delete(element);
    element.removeAttribute('data-hm-scramble-active');
    stateByElement.set(element, state);
  };

  const finishScramble = element => {
    const state = stateByElement.get(element);
    if (!state) return;
    state.running = false;
    state.generation = ++generation;
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = 0;

    /* Exact authored markup restoration is the final write, including authored <br> structure. */
    if (document.contains(element) && state.originalHTML != null) element.innerHTML = state.originalHTML;

    state.completed = true;
    activeAnimations.delete(element);
    element.removeAttribute('data-hm-scramble-active');
    stateByElement.set(element, state);
  };

  const scramble = (element, kind, replay = false) => {
    if (!element || !document.contains(element)) return false;
    const previous = stateByElement.get(element);
    if (previous?.running) return false;

    const nodes = textNodes(element);
    if (!nodes.length) return false;
    const currentHTML = element.innerHTML;
    const originalHTML = previous?.completed && previous.originalHTML === currentHTML
      ? previous.originalHTML
      : currentHTML;
    const original = nodes.map(node => node.nodeValue || '');
    const signature = original.join('\u0001');
    if (!replay && previous?.completed && previous.signature === signature && previous.originalHTML === currentHTML) return false;

    const state = {
      running:true,
      completed:false,
      visible:true,
      signature,
      original,
      originalHTML,
      raf:0,
      generation:++generation
    };
    stateByElement.set(element, state);
    activeAnimations.add(element);
    element.setAttribute('data-hm-scramble-active', 'true');
    element.setAttribute('data-hm-scramble-kind', kind);

    const duration = 800;
    const totalSteps = 26;
    const startedAt = performance.now();
    const myGeneration = state.generation;

    const render = step => {
      if (stateByElement.get(element) !== state || !state.running || state.generation !== myGeneration) return false;
      if (!sameNodes(element, nodes)) {
        /* Another runtime replaced the title. Do not overwrite the new authored DOM. */
        stopWithoutRestore(element);
        return false;
      }
      nodes.forEach((node, nodeIndex) => {
        const source = [...original[nodeIndex]];
        node.nodeValue = source.map((char, charIndex) => {
          if (/\s/.test(char) || char === '·') return char;
          const revealAt = Math.floor((charIndex / Math.max(1, source.length)) * totalSteps);
          return step >= revealAt ? char : glyphs[Math.floor(Math.random() * glyphs.length)];
        }).join('');
      });
      return true;
    };

    const frame = now => {
      if (stateByElement.get(element) !== state || !state.running || state.generation !== myGeneration) return;
      if (!document.contains(element)) { stopWithoutRestore(element); return; }
      const progress = Math.min(1, Math.max(0, (now - startedAt) / duration));
      const step = Math.min(totalSteps - 1, Math.floor(progress * totalSteps));
      try {
        if (!render(step)) return;
      } catch {
        finishScramble(element);
        return;
      }
      if (progress >= 1) {
        finishScramble(element);
        return;
      }
      state.raf = requestAnimationFrame(frame);
    };

    state.raf = requestAnimationFrame(frame);
    return true;
  };

  const isInView = element => {
    const rect = element.getBoundingClientRect();
    return rect.top < innerHeight * .82 && rect.bottom > innerHeight * .08;
  };

  const scanTitles = () => {
    document.querySelectorAll(titleSelector).forEach(title => {
      const state = stateByElement.get(title) || {visible:false,completed:false,running:false};
      const visible = isInView(title);
      if (!visible) {
        if (state.running) finishScramble(title);
        const next = stateByElement.get(title) || state;
        next.visible = false;
        next.completed = false;
        stateByElement.set(title, next);
      } else if (!state.visible) {
        state.visible = true;
        stateByElement.set(title, state);
        scramble(title, 'chapter');
      }
    });
  };

  const launchHero = () => {
    if (heroStarted) return;
    const hero = document.querySelector(heroSelector);
    if (!hero) return;
    heroStarted = true;
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          scramble(hero, 'hero');
          observer.disconnect();
        }
      }), {threshold:.25});
      observer.observe(hero);
    } else requestAnimationFrame(() => scramble(hero, 'hero'));
  };

  const initialise = () => {
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
    document.addEventListener('himart:narrative-ready', initialise, {once:true});
  };

  const finishAll = () => [...activeAnimations].forEach(finishScramble);
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  addEventListener('pagehide', finishAll);

  let queued = false;
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      scanTitles();
    });
  }, {passive:true});

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', waitForContentReady, {once:true});
  else waitForContentReady();
  addEventListener('load', () => setTimeout(initialise, 0), {once:true});
})();
