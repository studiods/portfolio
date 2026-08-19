(() => {
  'use strict';

  const state = window.__PORTFOLIO_HOME_OWNERS__ || {};

  if (state.hero) state.hero.id = state.heroOriginalId || 'heroSequence';
  if (state.philosophy) state.philosophy.id = state.philosophyOriginalId || 'philosophy';

  const hero = document.getElementById('heroSequence');
  const philosophy = document.getElementById('philosophy');
  const principles = document.getElementById('principles');

  hero?.setAttribute('data-runtime-owner', 'home-interactions');
  philosophy?.setAttribute('data-runtime-owner', 'home-interactions');
  principles?.setAttribute('data-runtime-owner', 'home-test-patch');

  /* Clean temporary timeline attributes left over during the boot handoff. */
  document.querySelectorAll(
    '.fill-char:not(.is-scrambling):not(.test-progressive-scramble)[data-scramble], ' +
    '.fill-char:not(.is-scrambling):not(.test-progressive-scramble)[data-test-scramble]'
  ).forEach(char => {
    if (!char.classList.contains('is-scrambling')) delete char.dataset.scramble;
    if (!char.classList.contains('test-progressive-scramble')) delete char.dataset.testScramble;
  });

  const measuredTextHeight = element => {
    if (!element) return 0;
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getBoundingClientRect().height;
  };

  /* home-interactions no longer owns Principles, so keep only its typography
     measurement as an independent responsibility. */
  const syncPrinciplesTextMetrics = () => {
    if (!principles) return;
    const rows = [...principles.querySelectorAll('.principles-intro-row')];
    let measuredSizeTotal = 0;
    let measuredSizeCount = 0;

    rows.forEach(row => {
      const english = row.querySelector('.principles-intro-en');
      const korean = row.querySelector('.principles-intro-ko');
      if (!english || !korean) return;
      const englishHeight = measuredTextHeight(english);
      const koreanHeight = measuredTextHeight(korean);
      const currentSize = parseFloat(getComputedStyle(korean).fontSize) || 1;
      if (englishHeight > 0 && koreanHeight > 0) {
        const matchedSize = currentSize * englishHeight / koreanHeight;
        measuredSizeTotal += innerWidth > 850 ? matchedSize - (4 * 96 / 72) : matchedSize;
        measuredSizeCount += 1;
      }
    });

    if (measuredSizeCount) {
      principles.style.setProperty(
        '--principles-ko-size',
        `${(measuredSizeTotal / measuredSizeCount).toFixed(3)}px`
      );
    }
  };

  let metricsRaf = 0;
  const requestMetricSync = () => {
    if (metricsRaf) return;
    metricsRaf = requestAnimationFrame(() => {
      metricsRaf = 0;
      syncPrinciplesTextMetrics();
    });
  };

  syncPrinciplesTextMetrics();
  addEventListener('resize', requestMetricSync, { passive: true });
  if (document.fonts?.ready) {
    document.fonts.ready.then(requestMetricSync).catch(() => {});
  }

  document.documentElement.dataset.homeOwnerPhase = 'ready';

  ['heroSequence', 'philosophy', 'principles'].forEach(id => {
    if (document.querySelectorAll(`#${id}`).length !== 1) {
      console.error(`Home runtime ownership error: expected one #${id}.`);
    }
  });
})();
