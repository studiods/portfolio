(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const rafState = { pending: false };

  const splitForScramble = element => {
    if (!element) return [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      [...node.textContent].forEach(character => {
        if (/\s/.test(character)) {
          fragment.appendChild(document.createTextNode(character));
          return;
        }
        const span = document.createElement('span');
        span.className = 'hm3-scramble-char';
        span.dataset.final = character;
        span.textContent = character;
        if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(character)) span.style.width = '1em';
        fragment.appendChild(span);
      });
      node.replaceWith(fragment);
    });

    return [...element.querySelectorAll('.hm3-scramble-char')];
  };

  const playScramble = (element, { html = null, cycles = 3, stagger = 13 } = {}) => {
    if (!element) return;
    if (html !== null) element.innerHTML = html;
    const finalHTML = element.innerHTML;
    if (reduced) return;
    const token = Number(element.dataset.scrambleToken || 0) + 1;
    element.dataset.scrambleToken = String(token);

    const characters = splitForScramble(element);
    const start = performance.now();
    const cycleDuration = 42;

    const render = now => {
      if (Number(element.dataset.scrambleToken) !== token) return;
      let done = true;
      characters.forEach((character, index) => {
        const elapsed = now - start - index * stagger;
        if (elapsed < 0) {
          done = false;
          return;
        }
        const cycle = Math.floor(elapsed / cycleDuration);
        if (cycle < cycles) {
          done = false;
          character.classList.add('is-live');
          character.textContent = pool[(index * 19 + cycle * 11 + Math.floor(now / 61)) % pool.length];
        } else {
          character.classList.add('is-live');
          character.textContent = character.dataset.final;
        }
      });
      if (done) {
        if (Number(element.dataset.scrambleToken) === token) element.innerHTML = finalHTML;
        return;
      }
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  };

  const scrambleTargets = [...document.querySelectorAll('.js-scramble')];
  if (reduced) {
    scrambleTargets.forEach(element => element.classList.add('is-scramble-complete'));
  } else if ('IntersectionObserver' in window) {
    const scrambleObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.intersectionRatio < .18) return;
        playScramble(entry.target);
        scrambleObserver.unobserve(entry.target);
      });
    }, { threshold: [.12, .18, .4], rootMargin: '0px 0px -8% 0px' });
    scrambleTargets.forEach(element => scrambleObserver.observe(element));
  } else {
    scrambleTargets.forEach(element => playScramble(element));
  }

  const story = document.querySelector('.hm3-story');
  const storyFrame = document.querySelector('.hm3-story-frame');
  const storySteps = [...document.querySelectorAll('.hm3-story-step')];
  const storyScenes = [...document.querySelectorAll('.hm3-scene')];
  const storyKicker = document.querySelector('.hm3-story-kicker');
  const storyTitle = document.querySelector('.hm3-story-heading h2');
  const storyCopy = document.querySelector('.hm3-story-heading p');
  const storyCounter = document.querySelector('.hm3-story-counter span');
  let activeScene = -1;

  const countSceneMetric = scene => {
    if (scene !== 3 || reduced) return;
    const target = document.querySelector('.hm3-home-total [data-count]');
    if (!target || target.dataset.played === '1') return;
    target.dataset.played = '1';
    const value = Number(target.dataset.count || 0);
    const suffix = target.dataset.suffix || '';
    const started = performance.now();
    const tick = now => {
      const progress = clamp((now - started) / 900);
      const eased = 1 - Math.pow(1 - progress, 3);
      target.textContent = `${(value * eased).toFixed(1)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    target.textContent = `0.0${suffix}`;
    requestAnimationFrame(tick);
  };

  const setStoryScene = index => {
    if (!storySteps.length) return;
    const next = clamp(index, 0, storySteps.length - 1);
    if (next === activeScene) return;
    activeScene = next;

    const step = storySteps[next];
    storyScenes.forEach((scene, sceneIndex) => scene.classList.toggle('is-active', sceneIndex === next));
    if (storyKicker) storyKicker.textContent = step.dataset.kicker || '';
    if (storyCopy) storyCopy.textContent = step.dataset.copy || '';
    if (storyCounter) storyCounter.textContent = String(next + 1).padStart(2, '0');
    if (storyFrame) storyFrame.style.setProperty('--hm3-story-progress', `${((next + 1) / storySteps.length) * 100}%`);
    if (storyTitle) {
      const titleHTML = (step.dataset.title || '').split('|').join('<br>');
      playScramble(storyTitle, { html: titleHTML, cycles: 3, stagger: 10 });
    }
    countSceneMetric(next);
  };

  const expandElements = [...document.querySelectorAll('[data-expand]')];
  const strategyMap = document.querySelector('[data-strategy-map]');
  const progressLinks = [...document.querySelectorAll('.hm3-progress a')];
  const progressSections = progressLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

  const updateScroll = () => {
    rafState.pending = false;
    const viewport = innerHeight || 1;

    if (story && storyFrame && storySteps.length && !reduced) {
      const rect = story.getBoundingClientRect();
      const distance = Math.max(1, rect.height - viewport);
      const overall = clamp(-rect.top / distance);
      const sceneFloat = (-rect.top + viewport * .48) / viewport;
      setStoryScene(Math.floor(sceneFloat));
      const growth = clamp(overall * 1.15);
      const mobile = innerWidth <= 780;
      storyFrame.style.setProperty('--hm3-story-width', `${(mobile ? 94 : 86) + growth * (mobile ? 4 : 8)}vw`);
      storyFrame.style.setProperty('--hm3-story-height', `${(mobile ? 91 : 78) + growth * (mobile ? 5 : 12)}svh`);
    }

    expandElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const progress = clamp((viewport * .92 - rect.top) / (viewport * .72));
      const widthGrowth = element.classList.contains('hm3-benchmark-stage') ? 12 : 10;
      const lift = element.classList.contains('hm3-mosaic') ? 38 : 36;
      element.style.setProperty('--expand-width', `${82 + progress * widthGrowth}vw`);
      element.style.setProperty('--expand-y', `${(1 - progress) * lift}px`);
      if (element.classList.contains('hm3-mosaic')) {
        element.style.setProperty('--line-progress', clamp(progress * 1.08).toFixed(3));
      }
    });

    if (strategyMap) {
      const rect = strategyMap.getBoundingClientRect();
      const progress = clamp((viewport * .82 - rect.top) / Math.max(viewport, rect.height * .82));
      strategyMap.style.setProperty('--line-progress', progress.toFixed(3));
      [...strategyMap.querySelectorAll('li')].forEach((item, index, items) => {
        const itemProgress = clamp(progress * items.length - index);
        item.style.setProperty('--item-progress-width', `${itemProgress * 100}%`);
      });
    }

    if (progressSections.length) {
      const marker = viewport * .34;
      let active = 0;
      let best = Infinity;
      progressSections.forEach((section, index) => {
        const distance = Math.abs(section.getBoundingClientRect().top - marker);
        if (distance < best) {
          best = distance;
          active = index;
        }
      });
      progressLinks.forEach((link, index) => link.classList.toggle('is-active', index === active));
    }
  };

  const requestUpdate = () => {
    if (rafState.pending) return;
    rafState.pending = true;
    requestAnimationFrame(updateScroll);
  };

  progressLinks.forEach(link => {
    link.addEventListener('click', event => {
      if (reduced) return;
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate, { passive: true });

  if (reduced) {
    storyScenes.forEach((scene, index) => scene.classList.toggle('is-active', index === 0));
    expandElements.forEach(element => {
      element.style.setProperty('--expand-width', '94vw');
      element.style.setProperty('--expand-y', '0px');
    });
    if (strategyMap) strategyMap.style.setProperty('--line-progress', '1');
  } else {
    setStoryScene(0);
  }
  updateScroll();
})();
