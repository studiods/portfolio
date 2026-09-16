/*
  HIMART / WORKS Design System — title scramble runtime v2.3.

  Shared contract
  - One runtime owns Hero, major-section and medium-subsection title scramble across Works case pages.
  - Hero title runs once on page entry.
  - Major titles run once when their section heading becomes visible.
  - Medium titles run once when their subsection/data-card heading becomes visible.
  - Wide-editorial pages synchronize scramble with the existing reveal owner instead of firing early.
  - No translate / magnetic / sticky motion is created here. This file changes glyphs only.
  - Authored HTML remains the immutable source of truth; <br> and inline emphasis are preserved.
  - Each visible character resolves independently and never becomes random again.
  - Every title runs once per page lifecycle. Scrolling away never re-arms the animation.
  - interruption, tab hiding, pagehide, or runtime errors settle to the authored title.
  - prefers-reduced-motion disables automatic scramble.

  Canonical selectors
  - Hero: .hm-title inside a Works hero
  - Major: .hm-section-title inside .hm-section-head
  - Medium: .hm-subtitle inside .hm-subhead, data-card headings, prototype headings,
            and Work Archive project headings
  - Future components may opt in with [data-hm-major-title] / [data-hm-medium-title].
*/
(() => {
  'use strict';

  if (window.HMDSTitleScrambleRuntime) return;

  const glyphs = '가나다라마바사아자차카타파하ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const heroSelector = ':is(.hm-hero,.hm-movie-hero,.ways-hero) .hm-title';
  const majorSelector = [
    '#live-main .hm-section-head .hm-section-title',
    '#live-main [data-hm-major-title]'
  ].join(',');
  const mediumSelector = [
    '#live-main .hm-subhead .hm-subtitle',
    '#live-main .data-card-head h3',
    '#live-main .prototype-intro > h3',
    '#live-main .wa-project__head .wa-project__title',
    '#live-main [data-hm-medium-title]'
  ].join(',');

  const stateByElement = new WeakMap();
  const activeAnimations = new Set();
  const observed = new WeakSet();
  const revealWatchers = new WeakMap();
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const REVEAL_SYNC_DELAY = 70;

  const randomGlyph = () => glyphs[Math.floor(Math.random() * glyphs.length)];
  const normalizeText = value => (value || '').replace(/\s+/g, ' ').trim();

  const isWideMajor = (element, state) =>
    state?.kind === 'major' &&
    document.body?.classList.contains('hm-wide-editorial-test') &&
    !!element.closest('.hm-section-head');

  const createScrambleCharacter = (char, chars) => {
    const span = document.createElement('span');
    span.className = 'hm-scramble-char';
    span.dataset.hmFinalChar = char;
    span.textContent = randomGlyph();
    chars.push(span);
    return span;
  };

  const cloneWithCharacters = (node, chars, groupByWord = false) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const fragment = document.createDocumentFragment();
      const value = node.nodeValue || '';

      if (groupByWord) {
        value.split(/(\s+|·)/).filter(Boolean).forEach(token => {
          if (/^\s+$/.test(token) || token === '·') {
            fragment.appendChild(document.createTextNode(token));
            return;
          }

          /* Major titles must wrap only at authored whitespace. Character-level
             scramble spans stay inside one atomic word wrapper. */
          const word = document.createElement('span');
          word.className = 'hm-scramble-word';
          word.style.display = 'inline-block';
          word.style.whiteSpace = 'nowrap';
          [...token].forEach(char => word.appendChild(createScrambleCharacter(char, chars)));
          fragment.appendChild(word);
        });
        return fragment;
      }

      [...value].forEach(char => {
        if (/\s/.test(char) || char === '·') {
          fragment.appendChild(document.createTextNode(char));
          return;
        }
        fragment.appendChild(createScrambleCharacter(char, chars));
      });
      return fragment;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return node.cloneNode(true);
    const clone = node.cloneNode(false);
    node.childNodes.forEach(child => clone.appendChild(cloneWithCharacters(child, chars, groupByWord)));
    return clone;
  };

  const buildAnimatedMarkup = (element, originalHTML) => {
    const template = document.createElement('template');
    template.innerHTML = originalHTML;
    const fragment = document.createDocumentFragment();
    const chars = [];
    const groupByWord = element.matches(majorSelector);
    template.content.childNodes.forEach(node =>
      fragment.appendChild(cloneWithCharacters(node, chars, groupByWord))
    );
    element.replaceChildren(fragment);
    return chars;
  };

  const ownsAnimatedDOM = (element, state) =>
    state.chars.length > 0 && state.chars.every(char => char.isConnected && element.contains(char));

  const restoreAuthoredHTML = (element, state) => {
    if (!document.contains(element) || state.originalHTML == null) return;
    element.innerHTML = state.originalHTML;
  };

  /* Himart's canonical narrative guard may rewrite the same major title while the
     scramble is running. Rebuild only when the visible text is still identical. */
  const repairCanonicalRewrite = (element, state) => {
    if (!isWideMajor(element, state) || !document.contains(element)) return false;
    if (ownsAnimatedDOM(element, state)) return true;
    if (normalizeText(element.textContent) !== normalizeText(state.originalText)) return false;

    const chars = buildAnimatedMarkup(element, state.originalHTML);
    if (!chars.length) return false;
    state.chars = chars;

    const elapsed = performance.now() - state.startedAt;
    chars.forEach((char, index) => {
      const resolveAt = state.randomPhase + index * state.stagger;
      if (state.completed || elapsed >= resolveAt) {
        char.textContent = char.dataset.hmFinalChar || '';
        char.dataset.hmResolved = '1';
      } else {
        char.textContent = randomGlyph();
        char.removeAttribute('data-hm-resolved');
      }
    });
    return true;
  };

  const protectCanonicalMarkup = (element, state) => {
    if (!isWideMajor(element, state) || !('MutationObserver' in window) || state.canonicalObserver) return;
    const mutationObserver = new MutationObserver(() => {
      const live = stateByElement.get(element);
      if (live !== state || !document.contains(element)) {
        mutationObserver.disconnect();
        return;
      }
      if (ownsAnimatedDOM(element, state)) return;
      repairCanonicalRewrite(element, state);
    });
    mutationObserver.observe(element, { childList:true, subtree:true, characterData:true });
    state.canonicalObserver = mutationObserver;
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
      const preserveResolvedMarkup = !immediate && isWideMajor(element, state);
      if (!preserveResolvedMarkup && document.contains(element) && ownsAnimatedDOM(element, state)) {
        restoreAuthoredHTML(element, state);
      }
      state.completed = true;
      state.running = false;
      activeAnimations.delete(element);
      element.removeAttribute('data-hm-scramble-active');
      element.setAttribute('data-hm-scramble-complete', 'true');
      stateByElement.set(element, state);
    };

    if (immediate) finalize();
    else requestAnimationFrame(finalize);
  };

  const startScramble = (element, kind) => {
    if (!element || !document.contains(element) || reduce) return false;

    let state = stateByElement.get(element);
    if (state?.completed || state?.running) return false;

    const originalHTML = state?.originalHTML ?? element.innerHTML;
    const originalText = state?.originalText ?? element.textContent ?? '';
    const chars = buildAnimatedMarkup(element, originalHTML);
    if (!chars.length) return false;

    const count = chars.length;
    const stagger = Math.max(9, Math.min(kind === 'medium' ? 18 : 22, 520 / Math.max(1, count)));
    const randomPhase = kind === 'medium' ? 190 : 250;
    const totalDuration = randomPhase + (count - 1) * stagger + 80;

    state = {
      originalHTML,
      originalText,
      chars,
      running:true,
      completed:false,
      raf:0,
      startedAt:performance.now(),
      kind,
      stagger,
      randomPhase,
      totalDuration,
      canonicalObserver:null
    };
    stateByElement.set(element, state);
    activeAnimations.add(element);
    element.setAttribute('data-hm-scramble-active', 'true');
    element.removeAttribute('data-hm-scramble-complete');
    element.setAttribute('data-hm-scramble-kind', kind);
    element.setAttribute('aria-label', originalText.replace(/\s+/g, ' ').trim());
    protectCanonicalMarkup(element, state);

    let lastRandomBucket = -1;

    const frame = now => {
      const live = stateByElement.get(element);
      if (live !== state || !state.running || state.completed) return;
      if (!document.contains(element)) {
        state.completed = true;
        activeAnimations.delete(element);
        state.canonicalObserver?.disconnect();
        return;
      }

      if (!ownsAnimatedDOM(element, state)) {
        if (!repairCanonicalRewrite(element, state) || !ownsAnimatedDOM(element, state)) {
          state.running = false;
          state.completed = true;
          activeAnimations.delete(element);
          state.canonicalObserver?.disconnect();
          element.removeAttribute('data-hm-scramble-active');
          return;
        }
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
        const resolveAt = state.randomPhase + index * state.stagger;
        if (elapsed >= resolveAt) {
          char.textContent = char.dataset.hmFinalChar || '';
          char.dataset.hmResolved = '1';
          resolved += 1;
        } else if (shouldRefreshRandom) {
          char.textContent = randomGlyph();
        }
      });

      if (resolved === count || elapsed >= state.totalDuration) {
        settle(element, false);
        return;
      }
      state.raf = requestAnimationFrame(frame);
    };

    state.raf = requestAnimationFrame(frame);
    return true;
  };

  const normalizeMajorTitleWrapping = (element, kind) => {
    if (!element || kind !== 'major') return;

    /* Major titles use the available left-rail width as the only line-length rule.
       Retired authored <br> tags made every page keep a different fixed line break,
       so replace them with spaces and allow wrapping only at word boundaries. */
    element.querySelectorAll('br').forEach(br => br.replaceWith(document.createTextNode(' ')));
    element.normalize();
    element.style.setProperty('white-space', 'normal', 'important');
    element.style.setProperty('word-break', 'keep-all', 'important');
    element.style.setProperty('overflow-wrap', 'normal', 'important');
    element.style.setProperty('line-break', 'strict', 'important');
    element.style.setProperty('hyphens', 'none', 'important');
  };

  const captureSource = (element, kind) => {
    if (!element || stateByElement.has(element)) return;
    normalizeMajorTitleWrapping(element, kind);
    stateByElement.set(element, {
      originalHTML: element.innerHTML,
      originalText: element.textContent || '',
      chars:[],
      running:false,
      completed:reduce,
      raf:0,
      kind,
      canonicalObserver:null
    });
  };

  const revealOwner = (element, kind) => {
    if (kind === 'major') return element.closest('.hm-section-head');
    if (kind === 'medium') {
      return element.closest('.hm-subsection, .data-card, .prototype-intro, .wa-project__head, [data-hm-medium-owner]');
    }
    return null;
  };

  const registerRevealSynchronized = (element, kind, owner) => {
    if (!owner?.classList.contains('hm-reveal') || !('MutationObserver' in window)) return false;

    let watcher = revealWatchers.get(element);
    if (watcher) return true;

    let timer = 0;
    const launch = () => {
      if (!owner.classList.contains('is-visible')) return;
      watcher?.disconnect();
      revealWatchers.delete(element);
      if (timer) return;
      timer = window.setTimeout(() => {
        timer = 0;
        startScramble(element, kind);
      }, REVEAL_SYNC_DELAY);
    };

    watcher = new MutationObserver(launch);
    revealWatchers.set(element, watcher);
    watcher.observe(owner, { attributes:true, attributeFilter:['class'] });
    requestAnimationFrame(launch);
    return true;
  };

  const observer = !reduce && 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const element = entry.target;
          observer.unobserve(element);
          startScramble(element, element.dataset.hmScrambleKind || 'major');
        });
      }, { threshold:.22, rootMargin:'0px 0px -8% 0px' })
    : null;

  const register = (element, kind) => {
    if (!element || observed.has(element)) return;
    captureSource(element, kind);
    observed.add(element);
    element.dataset.hmScrambleKind = kind;

    if (reduce) return;

    const owner = revealOwner(element, kind);
    if (registerRevealSynchronized(element, kind, owner)) return;

    if (observer) observer.observe(element);
    else startScramble(element, kind);
  };

  const scan = () => {
    const hero = document.querySelector(heroSelector);
    if (hero) register(hero, 'hero');
    document.querySelectorAll(majorSelector).forEach(title => register(title, 'major'));
    document.querySelectorAll(mediumSelector).forEach(title => register(title, 'medium'));
  };

  const finishAll = () => [...activeAnimations].forEach(element => settle(element, true));

  const pageNeedsNarrativeReady = () =>
    document.body?.classList.contains('himart-narrative-loading') ||
    document.body?.classList.contains('hm-wide-booting');

  const isContentReady = () => {
    if (!pageNeedsNarrativeReady()) return true;
    if (!document.body?.classList.contains('himart-narrative-ready')) return false;
    if (document.body?.classList.contains('hm-wide-booting')) return false;
    return true;
  };

  let mutationScanQueued = false;
  const scheduleScan = () => {
    if (mutationScanQueued) return;
    mutationScanQueued = true;
    requestAnimationFrame(() => {
      mutationScanQueued = false;
      scan();
    });
  };

  const observeDynamicTitles = () => {
    const root = document.querySelector('#live-main');
    if (!root || !('MutationObserver' in window)) return;
    const mutationObserver = new MutationObserver(mutations => {
      if (!mutations.some(mutation => mutation.addedNodes.length || mutation.removedNodes.length)) return;

      /* Legacy narrative layers can rewrite an already-registered H2 after the initial
         scan. Re-apply the wrapping contract even when the title element itself survives
         and only its innerHTML changes. */
      root.querySelectorAll(majorSelector).forEach(title =>
        normalizeMajorTitleWrapping(title, 'major')
      );
      scheduleScan();
    });
    mutationObserver.observe(root, { childList:true, subtree:true });
  };

  const initialise = () => {
    scan();
    observeDynamicTitles();
  };

  const waitForContentReady = () => {
    if (isContentReady()) {
      initialise();
      return;
    }

    const timer = window.setInterval(() => {
      if (!isContentReady()) return;
      window.clearInterval(timer);
      initialise();
    }, 32);

    window.setTimeout(() => {
      window.clearInterval(timer);
      initialise();
    }, 12000);

    document.addEventListener('himart:narrative-ready', () => {
      if (isContentReady()) initialise();
    }, { once:true });
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) finishAll();
  });
  addEventListener('pagehide', finishAll);

  window.HMDSTitleScrambleRuntime = Object.freeze({
    version:'2026.09.15-works-1',
    selectors:Object.freeze({ hero:heroSelector, major:majorSelector, medium:mediumSelector }),
    scan
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', waitForContentReady, { once:true });
  else waitForContentReady();
  addEventListener('load', scheduleScan, { once:true });
})();
