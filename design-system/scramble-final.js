/*
  HIMART Design System — per-character fail-safe title scramble.
  Contract:
  - authored HTML is the immutable source of truth;
  - each visible character resolves to its final glyph independently and never becomes random again;
  - after the final character resolves, authored HTML is restored on the next frame so there is no visible jump;
  - each title runs once per page lifecycle. Scrolling away never re-arms the scramble;
  - interruption, tab hiding, pagehide, or runtime errors always settle to the authored title.
*/
(() => {
  'use strict';

  const glyphs = '가나다라마바사아자차카타파하ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const titleSelector = '#live-main .hm-section-head .hm-section-title.js-scramble, #live-main .hm-section-head .hm-section-title';
  const heroSelector = ':is(.hm-hero,.hm-movie-hero,.ways-hero) .hm-title.js-scramble, :is(.hm-hero,.hm-movie-hero,.ways-hero) .hm-title';
  const stateByElement = new WeakMap();
  const activeAnimations = new Set();
  const observed = new WeakSet();

  const randomGlyph = () => glyphs[Math.floor(Math.random() * glyphs.length)];

  const cloneWithCharacters = (node, chars) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const fragment = document.createDocumentFragment();
      [...(node.nodeValue || '')].forEach(char => {
        if (/\s/.test(char) || char === '·') {
          fragment.appendChild(document.createTextNode(char));
          return;
        }
        const span = document.createElement('span');
        span.className = 'hm-scramble-char';
        span.dataset.hmFinalChar = char;
        span.textContent = randomGlyph();
        fragment.appendChild(span);
        chars.push(span);
      });
      return fragment;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return node.cloneNode(true);
    const clone = node.cloneNode(false);
    node.childNodes.forEach(child => clone.appendChild(cloneWithCharacters(child, chars)));
    return clone;
  };

  const buildAnimatedMarkup = (element, originalHTML) => {
    const template = document.createElement('template');
    template.innerHTML = originalHTML;
    const fragment = document.createDocumentFragment();
    const chars = [];
    template.content.childNodes.forEach(node => fragment.appendChild(cloneWithCharacters(node, chars)));
    element.replaceChildren(fragment);
    return chars;
  };

  const ownsAnimatedDOM = (element, state) =>
    state.chars.length > 0 && state.chars.every(char => char.isConnected && element.contains(char));

  const restoreAuthoredHTML = (element, state) => {
    if (!document.contains(element) || state.originalHTML == null) return;
    element.innerHTML = state.originalHTML;
  };

  const settle = (element, immediate = false) => {
    const state = stateByElement.get(element);
    if (!state || state.completed) return;

    state.running = false;
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = 0;

    if (ownsAnimatedDOM(element, state)) {
      state.chars.forEach(char => {
        char.textContent = char.dataset.hmFinalChar || '';
        char.dataset.hmResolved = '1';
      });
    }

    const finalize = () => {
      if (document.contains(element) && ownsAnimatedDOM(element, state)) restoreAuthoredHTML(element, state);
      state.completed = true;
      state.running = false;
      activeAnimations.delete(element);
      element.removeAttribute('data-hm-scramble-active');
      stateByElement.set(element, state);
    };

    if (immediate) finalize();
    else requestAnimationFrame(finalize);
  };

  const startScramble = (element, kind) => {
    if (!element || !document.contains(element)) return false;

    let state = stateByElement.get(element);
    if (state?.completed || state?.running) return false;

    const originalHTML = state?.originalHTML ?? element.innerHTML;
    const originalText = state?.originalText ?? element.textContent ?? '';
    const chars = buildAnimatedMarkup(element, originalHTML);
    if (!chars.length) return false;

    state = {
      originalHTML,
      originalText,
      chars,
      running:true,
      completed:false,
      raf:0,
      startedAt:performance.now(),
      kind
    };
    stateByElement.set(element, state);
    activeAnimations.add(element);
    element.setAttribute('data-hm-scramble-active', 'true');
    element.setAttribute('data-hm-scramble-kind', kind);
    element.setAttribute('aria-label', originalText.replace(/\s+/g, ' ').trim());

    const count = chars.length;
    const stagger = Math.max(10, Math.min(22, 520 / Math.max(1, count)));
    const randomPhase = 250;
    const totalDuration = randomPhase + (count - 1) * stagger + 80;
    let lastRandomBucket = -1;

    const frame = now => {
      const live = stateByElement.get(element);
      if (live !== state || !state.running || state.completed) return;
      if (!document.contains(element)) {
        state.completed = true;
        activeAnimations.delete(element);
        return;
      }

      if (!ownsAnimatedDOM(element, state)) {
        /* Another runtime replaced this title. Its authored DOM wins; detached random spans can no longer paint. */
        state.running = false;
        state.completed = true;
        activeAnimations.delete(element);
        element.removeAttribute('data-hm-scramble-active');
        return;
      }

      const elapsed = now - state.startedAt;
      const randomBucket = Math.floor(elapsed / 45);
      const shouldRefreshRandom = randomBucket !== lastRandomBucket;
      lastRandomBucket = randomBucket;
      let resolved = 0;

      state.chars.forEach((char, index) => {
        if (char.dataset.hmResolved === '1') {
          resolved += 1;
          return;
        }
        const resolveAt = randomPhase + index * stagger;
        if (elapsed >= resolveAt) {
          char.textContent = char.dataset.hmFinalChar || '';
          char.dataset.hmResolved = '1';
          resolved += 1;
        } else if (shouldRefreshRandom) {
          char.textContent = randomGlyph();
        }
      });

      if (resolved === count || elapsed >= totalDuration) {
        /* All visible glyphs are final BEFORE the original markup is restored. */
        settle(element, false);
        return;
      }
      state.raf = requestAnimationFrame(frame);
    };

    state.raf = requestAnimationFrame(frame);
    return true;
  };

  const captureSource = element => {
    if (!element || stateByElement.has(element)) return;
    stateByElement.set(element, {
      originalHTML: element.innerHTML,
      originalText: element.textContent || '',
      chars:[],
      running:false,
      completed:false,
      raf:0,
      kind:null
    });
  };

  const register = (element, kind, observer) => {
    if (!element || observed.has(element)) return;
    captureSource(element);
    observed.add(element);

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || !observer) {
      const state = stateByElement.get(element);
      if (state) state.completed = true;
      return;
    }
    element.dataset.hmScrambleKind = kind;
    observer.observe(element);
  };

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const element = entry.target;
          observer.unobserve(element);
          startScramble(element, element.dataset.hmScrambleKind || 'chapter');
        });
      }, {threshold:.24, rootMargin:'0px 0px -6% 0px'})
    : null;

  const scan = () => {
    const hero = document.querySelector(heroSelector);
    if (hero) register(hero, 'hero', observer);
    document.querySelectorAll(titleSelector).forEach(title => register(title, 'chapter', observer));
  };

  const finishAll = () => [...activeAnimations].forEach(element => settle(element, true));

  const initialise = () => {
    scan();
    if (!observer) {
      const hero = document.querySelector(heroSelector);
      if (hero) startScramble(hero, 'hero');
      document.querySelectorAll(titleSelector).forEach(title => startScramble(title, 'chapter'));
    }
  };

  const waitForContentReady = () => {
    if (document.body?.classList.contains('himart-narrative-ready')) {
      initialise();
      return;
    }
    const timer = setInterval(() => {
      if (!document.body?.classList.contains('himart-narrative-ready')) return;
      clearInterval(timer);
      initialise();
    }, 16);
    setTimeout(() => {
      clearInterval(timer);
      initialise();
    }, 12000);
    document.addEventListener('himart:narrative-ready', initialise, {once:true});
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) finishAll();
  });
  addEventListener('pagehide', finishAll);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', waitForContentReady, {once:true});
  else waitForContentReady();
  addEventListener('load', () => setTimeout(scan, 0), {once:true});
})();
