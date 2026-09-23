/* HIMART Design System — animation layer
   Dynamic content-safe reveal, counter, hero fade, chart drawing and efficient video visibility/sequence. */
(() => {
  let started = false;
  const revealSelector = '[data-hm-reveal], .hm-reveal, .hm-ds-reveal, .wide-rise-target';

  const init = () => {
    if (started) return;
    started = true;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const reveals = new WeakSet();
    const counters = new WeakSet();
    const autoCounters = new WeakSet();
    const charts = new WeakSet();
    const videoSequences = new WeakSet();

    const registerReveal = (el) => {
      if (reveals.has(el)) return;
      reveals.add(el);
      if (reduce || !('IntersectionObserver' in window)) {
        el.classList.add('is-visible');
        return;
      }
      revealObserver.observe(el);
    };
    const revealObserver = !reduce && 'IntersectionObserver' in window
      ? new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            entry.target.classList.add('is-wide-rise-in');
            observer.unobserve(entry.target);
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
      : null;

    const registerCounter = (el) => {
      if (counters.has(el)) return;
      counters.add(el);
      const end = Number(el.dataset.hmCounter ?? el.dataset.count);
      if (!Number.isFinite(end)) return;
      const decimals = Number(el.dataset.hmDecimals ?? el.dataset.decimals ?? 0);
      if (reduce || !('requestAnimationFrame' in window)) {
        el.textContent = end.toFixed(decimals);
        return;
      }
      const run = () => {
        const start = performance.now();
        const tick = now => {
          const p = Math.min(1, (now - start) / Number(el.dataset.hmDuration || 1200));
          el.textContent = (end * (1 - Math.pow(1 - p, 3))).toFixed(decimals);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, observer) => {
          if (!entries[0].isIntersecting) return;
          run();
          observer.disconnect();
        }, { threshold: 0.5 });
        io.observe(el);
      } else run();
    };

    /*
      Design-system automatic number focus animation.
      - Any leaf text element whose computed font-size is >= 30px is eligible.
      - The text must contain exactly one numeric value; surrounding units/symbols are preserved.
      - Multi-digit values count quickly from 0 to the final value.
      - Single-digit values cycle through 0-9 several times before settling on the final digit.
      - Existing explicit [data-hm-counter]/[data-count] counters keep ownership.
      - Add data-hm-number-count="off" to opt out of this global rule when needed.
    */
    const parseAutoNumber = el => {
      if (!el || el.nodeType !== 1) return null;
      if (el.matches('[data-hm-counter],[data-count],[data-hm-number-count="off"]')) return null;
      if (el.closest('[data-hm-number-count="off"],script,style,noscript,textarea,input,select,option')) return null;
      if (el.children.length) return null;

      const raw = (el.textContent || '').trim();
      if (!raw || !/\d/.test(raw)) return null;

      const match = raw.match(/^([^0-9]*?)([+\-−]?\d[\d,]*(?:\.\d+)?)([^0-9]*)$/u);
      if (!match) return null;

      const styles = getComputedStyle(el);
      const fontSize = Number.parseFloat(styles.fontSize);
      if (!Number.isFinite(fontSize) || fontSize < 30) return null;
      if (styles.display === 'none' || styles.visibility === 'hidden') return null;

      let numericText = match[2];
      let sign = '';
      if (/^[+\-−]/u.test(numericText)) {
        sign = numericText[0];
        numericText = numericText.slice(1);
      }

      const plain = numericText.replace(/,/g, '');
      const target = Number(plain);
      if (!Number.isFinite(target)) return null;

      const parts = plain.split('.');
      const integerDigits = parts[0].length;
      const decimals = parts[1]?.length || 0;
      const useGrouping = numericText.includes(',');
      const singleDigit = decimals === 0 && integerDigits === 1 && target >= 0 && target <= 9;

      return {
        raw,
        prefix: match[1] + sign,
        suffix: match[3],
        target,
        decimals,
        integerDigits,
        useGrouping,
        singleDigit
      };
    };

    const formatAutoNumber = (value, meta) => {
      const fixed = meta.decimals > 0
        ? Math.max(0, value).toFixed(meta.decimals)
        : String(Math.max(0, Math.round(value)));

      let [integer, fraction] = fixed.split('.');
      if (!meta.useGrouping && meta.integerDigits > 1 && meta.target < Math.pow(10, meta.integerDigits - 1)) {
        integer = integer.padStart(meta.integerDigits, '0');
      }
      if (meta.useGrouping) {
        integer = Number(integer).toLocaleString('en-US');
      }

      return meta.prefix + integer + (fraction !== undefined ? '.' + fraction : '') + meta.suffix;
    };

    const runAutoCounter = (el, meta) => {
      if (el.dataset.hmNumberCountDone === '1') return;
      el.dataset.hmNumberCountDone = '1';

      if (reduce || !('requestAnimationFrame' in window)) {
        el.textContent = meta.raw;
        return;
      }

      const duration = meta.singleDigit ? 760 : 720;
      const start = performance.now();

      const tick = now => {
        const progress = Math.min(1, (now - start) / duration);

        if (meta.singleDigit) {
          if (progress >= 1) {
            el.textContent = meta.raw;
            return;
          }
          const cycles = 3;
          const steps = 10 * cycles;
          const digit = Math.floor(progress * steps) % 10;
          el.textContent = meta.prefix + String(digit) + meta.suffix;
        } else {
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = progress >= 1
            ? meta.raw
            : formatAutoNumber(meta.target * eased, meta);
          if (progress >= 1) return;
        }

        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    const registerAutoCounter = el => {
      if (autoCounters.has(el)) return;
      const meta = parseAutoNumber(el);
      if (!meta) return;

      autoCounters.add(el);
      el.dataset.hmNumberCountReady = '1';

      if (reduce || !('IntersectionObserver' in window)) {
        runAutoCounter(el, meta);
        return;
      }

      const io = new IntersectionObserver((entries, observer) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || entry.target.offsetParent === null) return;
        runAutoCounter(entry.target, meta);
        observer.disconnect();
      }, { threshold: 0.3, rootMargin: '0px 0px -6% 0px' });

      io.observe(el);
    };

    const scanAutoCounters = () => {
      if (!document.body) return;
      const parents = new Set();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!/\d/.test(node.nodeValue || '')) continue;
        const parent = node.parentElement;
        if (parent) parents.add(parent);
      }
      parents.forEach(registerAutoCounter);
    };

    /*
      Canonical Himart traffic chart source.
      Geometry and series coordinates are copied from the approved production graph.
      Text font/color are intentionally owned by components/data-viz.css so no new typography
      rule is introduced inside the SVG.
    */
    const trafficSvgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1160 330" class="chart-svg traffic-v5-live" role="img" aria-label="2026년 1월부터 6월까지 세션, 구매건수, 구매전환율"><text x="0" y="22">SESSIONS</text><text x="0" y="58">6M</text><text x="0" y="158">3M</text><text x="0" y="258">0</text><line class="grid" x1="90" y1="50" x2="1070" y2="50"/><line class="grid" x1="90" y1="150" x2="1070" y2="150"/><line class="grid" x1="90" y1="250" x2="1070" y2="250"/><text class="right-blue" x="1088" y="64">42K</text><text class="right-blue" x="1088" y="158">39K</text><text class="right-blue" x="1088" y="252">36K</text><text class="right-green" x="1088" y="88">1.2%</text><text class="right-green" x="1088" y="180">0.9%</text><text class="right-green" x="1088" y="272">0.6%</text><line class="session" x1="145" y1="95" x2="145" y2="250"/><line class="session" x1="325" y1="132" x2="325" y2="250"/><line class="session" x1="505" y1="102" x2="505" y2="250"/><line class="session" x1="685" y1="61" x2="685" y2="250"/><line class="session" x1="865" y1="64" x2="865" y2="250"/><line class="session" x1="1045" y1="97" x2="1045" y2="250"/><polyline class="purchase" points="145,78 325,182 505,184 685,183 865,132 1045,117"/><circle class="p-dot" cx="145" cy="78" r="3"/><circle class="p-dot" cx="325" cy="182" r="3"/><circle class="p-dot" cx="505" cy="184" r="3"/><circle class="p-dot" cx="685" cy="183" r="3"/><circle class="p-dot" cx="865" cy="132" r="3"/><circle class="p-dot" cx="1045" cy="117" r="3"/><polyline class="cvr" points="145,170 325,85 505,185 685,240 865,226 1045,174"/><circle class="c-dot" cx="145" cy="170" r="2.5"/><circle class="c-dot" cx="325" cy="85" r="2.5"/><circle class="c-dot" cx="505" cy="185" r="2.5"/><circle class="c-dot" cx="685" cy="240" r="2.5"/><circle class="c-dot" cx="865" cy="226" r="2.5"/><circle class="c-dot" cx="1045" cy="174" r="2.5"/><text x="133" y="300">1월</text><text x="313" y="300">2월</text><text x="493" y="300">3월</text><text x="673" y="300">4월</text><text x="853" y="300">5월</text><text x="1033" y="300">6월</text></svg>`;

    const ensureTrafficSvg = host => {
      if (!host?.matches('[data-hm-traffic-chart]')) return host?.querySelector?.('.traffic-v5-live') || null;
      let svg = host.querySelector('.traffic-v5-live');
      if (svg) return svg;
      const holder = document.createElement('div');
      holder.innerHTML = trafficSvgMarkup;
      svg = holder.firstElementChild;
      const legend = host.querySelector('.hm-ds-traffic__legend,.wide-traffic-legend');
      host.insertBefore(svg, legend || host.firstChild);
      return svg;
    };

    const prepareTraffic = svg => {
      if (!svg || svg.dataset.hmChartPrepared === '1') return;
      svg.dataset.hmChartPrepared = '1';
      [...svg.querySelectorAll('.session')].forEach((shape, index) => {
        const length = Math.max(1, shape.getTotalLength());
        shape.style.strokeDasharray = String(length);
        shape.style.strokeDashoffset = String(length);
        shape.style.transition = `stroke-dashoffset 460ms cubic-bezier(.2,.8,.2,1) ${index * 70}ms`;
      });
      const purchase = svg.querySelector('.purchase');
      if (purchase) {
        const length = Math.max(1, purchase.getTotalLength());
        purchase.style.strokeDasharray = String(length);
        purchase.style.strokeDashoffset = String(length);
        purchase.style.transition = 'stroke-dashoffset 820ms cubic-bezier(.2,.8,.2,1) 620ms';
      }
      [...svg.querySelectorAll('.p-dot')].forEach((dot, index) => {
        dot.style.opacity = '0';
        dot.style.transition = `opacity 180ms ease ${1320 + index * 45}ms`;
      });
      const cvr = svg.querySelector('.cvr');
      if (cvr) {
        const length = Math.max(1, cvr.getTotalLength());
        cvr.style.strokeDasharray = String(length);
        cvr.style.strokeDashoffset = String(length);
        cvr.style.transition = 'stroke-dashoffset 820ms cubic-bezier(.2,.8,.2,1) 1500ms';
      }
      [...svg.querySelectorAll('.c-dot')].forEach((dot, index) => {
        dot.style.opacity = '0';
        dot.style.transition = `opacity 180ms ease ${2200 + index * 45}ms`;
      });
    };

    const activateTraffic = svg => {
      if (!svg) return;
      [...svg.querySelectorAll('.session')].forEach(shape => { shape.style.strokeDashoffset = '0'; });
      const purchase = svg.querySelector('.purchase');
      if (purchase) purchase.style.strokeDashoffset = '0';
      [...svg.querySelectorAll('.p-dot')].forEach(dot => { dot.style.opacity = '1'; });
      const cvr = svg.querySelector('.cvr');
      if (cvr) cvr.style.strokeDashoffset = '0';
      [...svg.querySelectorAll('.c-dot')].forEach(dot => { dot.style.opacity = '1'; });
    };

    const activateChart = el => {
      if (!el || el.classList.contains('is-hm-chart-active')) return;
      el.classList.add('is-hm-chart-active');
      activateTraffic(ensureTrafficSvg(el));
    };

    const chartObserver = !reduce && 'IntersectionObserver' in window
      ? new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            activateChart(entry.target);
            observer.unobserve(entry.target);
          });
        }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' })
      : null;

    const registerChart = el => {
      if (charts.has(el)) return;
      charts.add(el);
      const svg = ensureTrafficSvg(el);
      prepareTraffic(svg);
      if (reduce || !chartObserver) {
        activateChart(el);
        return;
      }
      chartObserver.observe(el);
    };

    /*
      Generic sequence fallback:
      - native `ended` is the only playlist-advance signal;
      - no opacity animation, fade-to-black class or artificial end hold is used;
      - page-specific hero/WORKS controllers may replace this with a preloaded two-player
        handoff when zero-gap visual continuity is required.
    */
    const registerVideoSequence = (video) => {
      if (videoSequences.has(video)) return;
      const sequence = (video.dataset.hmVideoSequence || '')
        .split('|')
        .map(src => src.trim())
        .filter(Boolean);
      if (sequence.length < 2) return;

      videoSequences.add(video);
      video.loop = false;
      video.removeAttribute('loop');
      video.removeAttribute('autoplay');
      video.autoplay = false;
      video.pause();
      video.preload = 'metadata';
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute('muted', '');
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.style.transition = 'none';
      video.style.opacity = '1';
      video.classList.remove('is-sequence-switching');

      let index = 0;
      let changing = false;
      let visible = false;
      let startedCurrent = false;

      const absoluteSrc = src => new URL(src, document.baseURI).href;
      const currentMatches = () => (video.currentSrc || video.src || '') === absoluteSrc(sequence[index]);

      const playCurrent = () => {
        if (!visible || document.hidden || changing || video.ended) return;
        video.preload = 'auto';
        const attempt = video.play?.();
        if (attempt?.catch) attempt.catch(() => {});
      };

      const switchToNext = () => {
        if (changing || !startedCurrent || !video.ended || !currentMatches()) return;
        changing = true;
        index = (index + 1) % sequence.length;
        startedCurrent = false;
        video.pause();
        video.src = sequence[index];
        video.preload = visible ? 'auto' : 'metadata';
        video.load();

        const onReady = () => {
          video.removeEventListener('loadeddata', onReady);
          video.removeEventListener('canplay', onReady);
          changing = false;
          if (visible && !document.hidden) playCurrent();
        };

        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) onReady();
        else {
          video.addEventListener('loadeddata', onReady, {once:true});
          video.addEventListener('canplay', onReady, {once:true});
        }
      };

      video.addEventListener('playing', () => {
        if (!changing && currentMatches()) startedCurrent = true;
      });
      video.addEventListener('ended', switchToNext);

      video.__hmSequenceController = {
        setVisible(isVisible) {
          visible = isVisible;
          if (!visible) {
            video.pause();
            return;
          }
          if (video.ended) {
            switchToNext();
            return;
          }
          playCurrent();
        }
      };
    };

    const scan = () => {
      document.querySelectorAll(revealSelector).forEach(registerReveal);
      document.querySelectorAll('[data-hm-counter], [data-count]').forEach(registerCounter);
      scanAutoCounters();
      document.querySelectorAll('[data-hm-chart]').forEach(registerChart);
      document.querySelectorAll('.v9-chart-motion').forEach(el => {
        if (el.dataset.hmV9ChartBound === '1') return;
        el.dataset.hmV9ChartBound = '1';

        const activateV9Chart = () => {
          el.classList.add('is-v9-chart-active');
          const svg = el.matches('.traffic-v5-live')
            ? el
            : el.querySelector('.traffic-v5-live');
          if (svg) activateTraffic(svg);
        };

        if (reduce || !('IntersectionObserver' in window)) {
          activateV9Chart();
          return;
        }

        const observer = new IntersectionObserver((entries, currentObserver) => {
          if (!entries.some(entry => entry.isIntersecting)) return;
          activateV9Chart();
          currentObserver.disconnect();
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        observer.observe(el);
      });
      document.querySelectorAll('[data-hm-video]').forEach(registerVideoSequence);
    };

    /*
      Shared sticky chapter-title exit motion.
      After a chapter title has pinned, hide it immediately when its section
      boundary starts pushing it above the sticky anchor. Reverse scrolling
      restores the title as soon as the section boundary releases it.
      Shared by every page using the canonical .hm-section structure.
    */
    const initMajorTitleExit = () => {
      if (reduce || !('requestAnimationFrame' in window)) return;
      if (document.documentElement.dataset.hmMajorTitleExitBound === '1') return;
      document.documentElement.dataset.hmMajorTitleExitBound = '1';

      if (!document.getElementById('hm-major-title-exit-style')) {
        const style = document.createElement('style');
        style.id = 'hm-major-title-exit-style';
        style.textContent = `
          .hm-section-head.is-major-title-exiting{
            opacity:0!important;
            transition:none!important;
          }
        `;
        document.head.appendChild(style);
      }

      let raf = 0;
      const update = () => {
        document.querySelectorAll('.hm-section-head').forEach(head => {
          const section = head.closest('.hm-section');
          if (!section) return;
          const computed = getComputedStyle(head);
          if (computed.position !== 'sticky') {
            head.dataset.hmMajorTitlePinned = '0';
            head.classList.remove('is-major-title-exiting');
            return;
          }

          const sectionRect = section.getBoundingClientRect();
          const headRect = head.getBoundingClientRect();
          const stickyTop = Number.parseFloat(computed.top) || 0;
          const pushBoundary = stickyTop + headRect.height;

          if (headRect.top <= stickyTop + 1 && sectionRect.bottom > pushBoundary) {
            head.dataset.hmMajorTitlePinned = '1';
          }

          const hasPinned = head.dataset.hmMajorTitlePinned === '1';
          const isExiting = hasPinned && sectionRect.bottom <= pushBoundary + 1;
          head.classList.toggle('is-major-title-exiting', isExiting);

          if (!isExiting && sectionRect.top >= stickyTop) {
            head.dataset.hmMajorTitlePinned = '0';
          }
        });
      };
      const requestUpdate = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => { raf = 0; update(); });
      };
      window.addEventListener('scroll', requestUpdate, {passive:true});
      window.addEventListener('resize', requestUpdate, {passive:true});
      requestUpdate();
    };

    scan();
    initMajorTitleExit();
    // Scramble animation is owned by design-system/scramble-final.js.
    // Keeping it out of this layer prevents duplicate observers and text races.
    window.__hmAnimationScan = scan;
    window.addEventListener('load', () => { scan(); initMajorTitleExit(); setTimeout(scan, 600); }, { once: true });
    document.fonts?.ready?.then(() => scan()).catch?.(() => {});

    const hero = document.querySelector('[data-hm-hero]');
    if (hero && !reduce) {
      const heroStyles = getComputedStyle(hero);
      const readHeroOpacity = (name, fallback) => {
        const value = Number.parseFloat(heroStyles.getPropertyValue(name));
        return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;
      };
      const matteBaseOpacity = readHeroOpacity('--hm-hero-matte-base-opacity', 0.5);
      const matteMaxOpacity = Math.max(matteBaseOpacity, readHeroOpacity('--hm-hero-matte-scroll-max-opacity', 1));

      const fadeDistance = Number(hero.dataset.hmFadeDistance || 420);
      let lastProgress = -1;
      let heroRaf = 0;
      const updateHero = () => {
        const progress = Math.min(1, Math.max(0, window.scrollY / fadeDistance));
        if (Math.abs(progress - lastProgress) < 0.001) return;
        lastProgress = progress;
        const eased = 1 - Math.pow(1 - progress, 3);
        hero.style.setProperty('--hm-scroll-progress', progress.toFixed(3));
        hero.style.setProperty('--hm-hero-overlay-opacity', (matteBaseOpacity + eased * (matteMaxOpacity - matteBaseOpacity)).toFixed(3));
        hero.style.setProperty('--hm-hero-copy-opacity', (1 - eased * 0.88).toFixed(3));
      };
      const requestHeroUpdate = () => {
        if (lastProgress === 1 && window.scrollY >= fadeDistance) return;
        if (heroRaf) return;
        heroRaf = requestAnimationFrame(() => {
          heroRaf = 0;
          updateHero();
        });
      };
      updateHero();
      window.addEventListener('scroll', requestHeroUpdate, { passive: true });
    }

    const videos = [...document.querySelectorAll('[data-hm-video]')];
    const setVideoVisible = (video, isVisible) => {
      const controller = video.__hmSequenceController;
      if (controller) controller.setVisible(isVisible);
      else isVisible ? video.play?.().catch(() => {}) : video.pause?.();
    };

    if (videos.length && 'IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => setVideoVisible(entry.target, entry.isIntersecting));
      }, { threshold: 0.1 });
      videos.forEach(video => videoObserver.observe(video));
    } else {
      videos.forEach(video => setVideoVisible(video, true));
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        videos.forEach(video => video.pause?.());
        return;
      }
      videos.forEach(video => {
        const rect = video.getBoundingClientRect();
        const visibleNow = rect.bottom > 0 && rect.top < window.innerHeight;
        setVideoVisible(video, visibleNow);
      });
    });
  };

  const boot = () => {
    if (document.body || document.querySelector(revealSelector + ', [data-hm-counter], [data-count], [data-hm-chart], [data-hm-hero], [data-hm-video]')) {
      init();
      return true;
    }
    return false;
  };
  if (!boot() && 'MutationObserver' in window) {
    const mo = new MutationObserver(() => { if (boot()) mo.disconnect(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => mo.disconnect(), 20000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
})();
