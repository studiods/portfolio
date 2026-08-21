(() => {
  'use strict';

  /*
    TEST ONLY.
    Load the production Home controller verbatim, then patch only the Hero
    scramble sampling behavior before executing it. This preserves every
    production metric/timeline below the Hero.

    Changes:
    1) Hero first-fill scramble cycles: 3 -> 6.
    2) Native scroll remains untouched.
    3) Hero uses a separate painted progress only while scramble-heavy phases
       are active. Hold/gap phases catch up quickly.
    4) Philosophy / Principles / Works continue to use the production logic and
       real scroll position because the full production controller is executed.
  */

  const xhr = new XMLHttpRequest();
  xhr.open('GET', './home-interactions.js?v=50', false);
  try {
    xhr.send(null);
  } catch (error) {
    console.error('[Hero catch-up test] Failed to load production controller.', error);
    return;
  }

  if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0)) {
    console.error('[Hero catch-up test] Production controller request failed:', xhr.status);
    return;
  }

  let source = xhr.responseText;

  const patches = [
    {
      name: 'six-cycle renderer',
      from: "const cycle = Math.min(2, Math.floor((local / scrambleRatio) * 3));",
      to: "const cycle = Math.min(5, Math.floor((local / scrambleRatio) * 6));"
    },
    {
      name: 'Hero painted-progress state',
      from: `  let metricsRaf = 0;\n  let raf = 0;\n  let lastHeroProgress = -1;`,
      to: `  let metricsRaf = 0;\n  let raf = 0;\n\n  /* TEST: Hero visual progress is independent from native scroll speed. */\n  let paintedHeroProgress = -1;\n  let latestHeroTarget = 0;\n  const HERO_TEST_CYCLES = 6;\n  const HERO_TEST_SCRAMBLE_RATIO = 0.78;\n\n  const HERO_TEST_QUOTE_COUNT = Math.max(\n    1,\n    quoteChars.reduce((count, char) =>\n      count + (((char.dataset.finalChar ?? char.textContent).trim()) ? 1 : 0), 0\n    )\n  );\n  const HERO_TEST_DEFINITION_COUNT = Math.max(\n    1,\n    definitionChars.reduce((count, char) =>\n      count + (((char.dataset.finalChar ?? char.textContent).trim()) ? 1 : 0), 0\n    )\n  );\n\n  /*\n    Quote: one visual RAF stays below one of the six scramble slices.\n    Morph/definition: production changes its random step count*7 times, so use\n    that native cadence as the maximum visual step there.\n  */\n  const HERO_TEST_QUOTE_STEP = Math.max(\n    0.00002,\n    ((HERO.quoteFillEnd - HERO.quoteFillStart) / HERO_TEST_QUOTE_COUNT) *\n      HERO_TEST_SCRAMBLE_RATIO / HERO_TEST_CYCLES * 0.96\n  );\n  const HERO_TEST_MORPH_STEP = Math.max(\n    0.00008,\n    ((HERO.quoteMorphEnd - HERO.quoteHoldEnd) /\n      (HERO_TEST_DEFINITION_COUNT * 7)) * 0.94\n  );\n  const HERO_TEST_FAST_STEP = 0.018;\n  const HERO_TEST_BOUNDARIES = [\n    HERO.quoteFillEnd,\n    HERO.quoteHoldEnd,\n    HERO.quoteMorphEnd\n  ];\n\n  const heroTestStepFor = progress => {\n    if (progress < HERO.quoteFillEnd - 0.000001) return HERO_TEST_QUOTE_STEP;\n    if (\n      progress >= HERO.quoteHoldEnd - 0.000001 &&\n      progress < HERO.quoteMorphEnd - 0.000001\n    ) return HERO_TEST_MORPH_STEP;\n    return HERO_TEST_FAST_STEP;\n  };\n\n  const heroTestClampBoundary = (current, next, direction) => {\n    for (const boundary of HERO_TEST_BOUNDARIES) {\n      if (direction > 0 && current < boundary && next > boundary) return boundary;\n      if (direction < 0 && current > boundary && next < boundary) return boundary;\n    }\n    return next;\n  };\n\n  let lastHeroProgress = -1;`
    },
    {
      name: 'Hero progress sampler',
      from: `    const y = scrollY;\n    const heroProgress = getHeroProgress();`,
      to: `    const y = scrollY;\n    latestHeroTarget = getHeroProgress();\n\n    if (paintedHeroProgress < 0) paintedHeroProgress = latestHeroTarget;\n    const heroDelta = latestHeroTarget - paintedHeroProgress;\n    if (Math.abs(heroDelta) > 0.000001) {\n      const direction = Math.sign(heroDelta);\n      const step = heroTestStepFor(paintedHeroProgress);\n      let nextProgress = Math.abs(heroDelta) <= step\n        ? latestHeroTarget\n        : paintedHeroProgress + direction * step;\n      nextProgress = heroTestClampBoundary(\n        paintedHeroProgress,\n        nextProgress,\n        direction\n      );\n      paintedHeroProgress = clamp(nextProgress);\n    } else {\n      paintedHeroProgress = latestHeroTarget;\n    }\n    const heroProgress = clamp(paintedHeroProgress);`
    },
    {
      name: 'Hero catch-up RAF continuation',
      from: `    if (!PATCH_OWNS_LOWER_TIMELINES && Math.abs(principlesCardsProgress - lastPrinciplesCardsProgress) >= 0.0001) {\n      renderPrincipleCards(principlesCardsProgress);\n      lastPrinciplesCardsProgress = principlesCardsProgress;\n    }\n  };`,
      to: `    if (!PATCH_OWNS_LOWER_TIMELINES && Math.abs(principlesCardsProgress - lastPrinciplesCardsProgress) >= 0.0001) {\n      renderPrincipleCards(principlesCardsProgress);\n      lastPrinciplesCardsProgress = principlesCardsProgress;\n    }\n\n    /* Keep painting Hero intermediate states after a fast scroll event ends. */\n    if (Math.abs(latestHeroTarget - paintedHeroProgress) > 0.000001) {\n      requestRender();\n    }\n  };`
    }
  ];

  for (const patch of patches) {
    if (!source.includes(patch.from)) {
      console.error(`[Hero catch-up test] Patch target not found: ${patch.name}`);
      return;
    }
    source = source.replace(patch.from, patch.to);
  }

  source += '\n//# sourceURL=home-interactions-hero-catchup-runtime.js';

  try {
    (0, eval)(source);
  } catch (error) {
    console.error('[Hero catch-up test] Patched production controller failed.', error);
  }
})();