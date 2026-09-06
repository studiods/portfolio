/* HIMART Design System — animation layer
   Dynamic content-safe reveal, counter, hero fade, chart drawing and efficient video visibility/sequence. */
(() => {
  let started = false;
  const revealSelector = '[data-hm-reveal], .hm-reveal, .wide-rise-target';

  const init = () => {
    if (started) return;
    started = true;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const reveals = new WeakSet();
    const counters = new WeakSet();
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

    const waitForFrame = video => new Promise(resolve => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      if ('requestVideoFrameCallback' in video) {
        video.requestVideoFrameCallback(done);
        window.setTimeout(done, 260);
      } else {
        video.addEventListener('playing', () => requestAnimationFrame(done), {once:true});
        window.setTimeout(done, 260);
      }
    });

    /*
      Efficient sequence strategy:
      - one video element only; no hidden clone or second decoder;
      - when a clip ends, fade the single element to black, replace src, then reveal after
        the next clip has produced its first frame;
      - visibility control pauses the same element offscreen and resumes it in place.
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
      video.setAttribute('muted', '');
      video.playsInline = true;

      let index = 0;
      let switching = false;
      let visible = false;

      const revealCurrent = async () => {
        if (!visible || !switching) return;
        video.preload = 'auto';
        const attempt = video.play?.();
        if (attempt && attempt.catch) await attempt.catch(() => {});
        if (!visible) return;
        await waitForFrame(video);
        if (!visible) return;
        video.classList.remove('is-sequence-switching');
        switching = false;
      };

      const switchToNext = () => {
        if (switching) return;
        switching = true;
        video.classList.add('is-sequence-switching');
        index = (index + 1) % sequence.length;
        video.pause();
        video.src = sequence[index];
        video.preload = visible ? 'auto' : 'metadata';
        video.load();

        const onReady = () => {
          video.removeEventListener('loadeddata', onReady);
          video.removeEventListener('canplay', onReady);
          if (visible) revealCurrent();
        };

        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) onReady();
        else {
          video.addEventListener('loadeddata', onReady, {once:true});
          video.addEventListener('canplay', onReady, {once:true});
        }
      };

      video.addEventListener('ended', switchToNext);

      video.__hmSequenceController = {
        setVisible(isVisible) {
          visible = isVisible;
          if (!visible) {
            video.pause();
            return;
          }
          video.preload = 'auto';
          if (switching) {
            revealCurrent();
            return;
          }
          const attempt = video.play?.();
          if (attempt && attempt.catch) attempt.catch(() => {});
        }
      };
    };

    const scan = () => {
      document.querySelectorAll(revealSelector).forEach(registerReveal);
      document.querySelectorAll('[data-hm-counter], [data-count]').forEach(registerCounter);
      document.querySelectorAll('[data-hm-chart]').forEach(registerChart);
      document.querySelectorAll('[data-hm-video]').forEach(registerVideoSequence);
    };
    scan();
    // Scramble animation is owned by design-system/scramble-final.js.
    // Keeping it out of this layer prevents duplicate observers and text races.
    window.__hmAnimationScan = scan;
    window.addEventListener('load', () => { scan(); setTimeout(scan, 600); }, { once: true });

    const hero = document.querySelector('[data-hm-hero]');
    if (hero && !reduce) {
      const updateHero = () => {
        const progress = Math.min(1, Math.max(0, window.scrollY / Number(hero.dataset.hmFadeDistance || 420)));
        const eased = 1 - Math.pow(1 - progress, 3);
        hero.style.setProperty('--hm-scroll-progress', progress.toFixed(3));
        hero.style.setProperty('--hm-hero-overlay-opacity', (0.5 + eased * 0.5).toFixed(3));
        hero.style.setProperty('--hm-hero-copy-opacity', (1 - eased * 0.88).toFixed(3));
      };
      updateHero();
      window.addEventListener('scroll', updateHero, { passive: true });
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
    if (document.querySelector(revealSelector + ', [data-hm-counter], [data-count], [data-hm-chart], [data-hm-hero], [data-hm-video]')) {
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
