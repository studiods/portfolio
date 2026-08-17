(() => {
  'use strict';

  const root = document.querySelector('.about-ascii-hero');
  const canvas = root?.querySelector('.about-ascii-canvas');
  const source = window.ABOUT_ASCII_DATA;
  if (!root || !canvas || !source || !Array.isArray(source.frames) || source.frames.length < 2) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const sourceCols = source.width;
  const sourceRows = source.height;
  const sourceCellCount = sourceCols * sourceRows;

  /* 1.5× denser ASCII grid. The source data stays light, while the renderer
     interpolates it to a finer grid for a more detailed portrait. */
  const DENSITY_SCALE = 1.5;
  const PORTRAIT_SCALE = 0.85;
  const cols = Math.round(sourceCols * DENSITY_SCALE);
  const rows = Math.round(sourceRows * DENSITY_SCALE);
  const cellCount = cols * rows;

  const palette = ' .,:;-=+*#%@';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const SCENE_MS = 1800;
  const HOLD_MS = 1200;
  const TRANSITION_MS = SCENE_MS - HOLD_MS;
  const GLITCH_STEP_MS = 55;

  const clamp01 = (value) => Math.max(0, Math.min(1, value));
  const smoothstep = (value) => {
    const t = clamp01(value);
    return t * t * (3 - 2 * t);
  };

  const hash = (value) => {
    let x = value | 0;
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967295;
  };

  const decodeFrame = (encoded) => {
    const binary = atob(encoded);
    const frame = new Uint8Array(sourceCellCount);
    let target = 0;
    for (let i = 0; i < binary.length && target < sourceCellCount; i += 1) {
      const packed = binary.charCodeAt(i);
      frame[target] = ((packed >>> 4) & 15) * 17;
      if (target + 1 < sourceCellCount) frame[target + 1] = (packed & 15) * 17;
      target += 2;
    }
    return frame;
  };

  const sampleBilinear = (frame, sx, sy) => {
    const x0 = Math.max(0, Math.min(sourceCols - 1, Math.floor(sx)));
    const y0 = Math.max(0, Math.min(sourceRows - 1, Math.floor(sy)));
    const x1 = Math.min(sourceCols - 1, x0 + 1);
    const y1 = Math.min(sourceRows - 1, y0 + 1);
    const tx = sx - x0;
    const ty = sy - y0;
    const a = frame[y0 * sourceCols + x0];
    const b = frame[y0 * sourceCols + x1];
    const c = frame[y1 * sourceCols + x0];
    const d = frame[y1 * sourceCols + x1];
    const top = a + (b - a) * tx;
    const bottom = c + (d - c) * tx;
    return Math.round(top + (bottom - top) * ty);
  };

  const resampleFrame = (sourceFrame) => {
    const frame = new Uint8Array(cellCount);
    const margin = (1 - PORTRAIT_SCALE) * 0.5;

    for (let y = 0; y < rows; y += 1) {
      const v = (y + 0.5) / rows;
      for (let x = 0; x < cols; x += 1) {
        const u = (x + 0.5) / cols;
        const index = y * cols + x;

        if (u < margin || u > 1 - margin || v < margin || v > 1 - margin) {
          frame[index] = 0;
          continue;
        }

        const sourceU = (u - margin) / PORTRAIT_SCALE;
        const sourceV = (v - margin) / PORTRAIT_SCALE;
        const sx = sourceU * (sourceCols - 1);
        const sy = sourceV * (sourceRows - 1);
        frame[index] = sampleBilinear(sourceFrame, sx, sy);
      }
    }

    return frame;
  };

  const frames = source.frames.map((encoded) => resampleFrame(decodeFrame(encoded)));
  const timingStart = new Float32Array(cellCount);
  const timingEnd = new Float32Array(cellCount);

  let currentIndex = 0;
  let nextIndex = 1;
  let sceneStartedAt = performance.now();
  let animationFrame = 0;
  let cssWidth = 0;
  let cssHeight = 0;
  let dpr = 1;
  let cellWidth = 1;
  let cellHeight = 1;
  let lastStaticFrame = -1;

  const prepareTransition = () => {
    const seed = (currentIndex + 1) * 10007 + (nextIndex + 1) * 7919;
    for (let i = 0; i < cellCount; i += 1) {
      const start = hash(i * 17 + seed) * 0.54;
      const duration = 0.30 + hash(i * 31 + seed * 3) * 0.31;
      timingStart[i] = start;
      timingEnd[i] = Math.min(1, start + duration);
    }
  };

  const resizeCanvas = () => {
    const rect = root.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    cssWidth = rect.width;
    cssHeight = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(cssWidth * dpr));
    canvas.height = Math.max(1, Math.round(cssHeight * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cellWidth = cssWidth / cols;
    cellHeight = cssHeight / rows;
    const fontSize = Math.max(5, cellHeight * 0.9);
    ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lastStaticFrame = -1;
  };

  const draw = (now, transitionProgress = 0) => {
    if (!cssWidth || !cssHeight) resizeCanvas();

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    const current = frames[currentIndex];
    const next = frames[nextIndex];
    const inTransition = transitionProgress > 0;
    const globalChaos = inTransition ? Math.sin(Math.PI * transitionProgress) : 0;
    const glitchTick = Math.floor(now / GLITCH_STEP_MS);
    const transitionSeed = (currentIndex + 1) * 1709 + (nextIndex + 1) * 3253;

    for (let i = 0; i < cellCount; i += 1) {
      let value = current[i];

      if (inTransition) {
        const start = timingStart[i];
        const end = timingEnd[i];
        const local = transitionProgress <= start
          ? 0
          : transitionProgress >= end
            ? 1
            : smoothstep((transitionProgress - start) / Math.max(0.001, end - start));
        value = current[i] + (next[i] - current[i]) * local;
      }

      const normalized = value / 255;
      if (normalized < 0.045) continue;

      let paletteIndex = Math.round(normalized * (palette.length - 1));

      if (inTransition && globalChaos > 0.04) {
        const mutation = hash(i * 97 + glitchTick * 131 + transitionSeed);
        const mutationChance = 0.10 + globalChaos * 0.48;
        if (mutation < mutationChance) {
          const spread = 2 + Math.floor(globalChaos * 4);
          const offsetNoise = hash(i * 53 + glitchTick * 211 + transitionSeed * 7);
          const offset = Math.round((offsetNoise * 2 - 1) * spread);
          paletteIndex = Math.max(1, Math.min(palette.length - 1, paletteIndex + offset));
        }
      }

      const character = palette[paletteIndex];
      if (character === ' ') continue;

      const x = (i % cols) * cellWidth + cellWidth * 0.5;
      const y = Math.floor(i / cols) * cellHeight + cellHeight * 0.52;
      const alphaBase = 0.22 + normalized * 0.78;
      const shimmer = inTransition
        ? 0.82 + hash(i * 43 + glitchTick * 59 + transitionSeed) * 0.18 * globalChaos
        : 1;
      const alpha = Math.min(1, alphaBase * shimmer);
      const tone = Math.round(185 + normalized * 70);

      ctx.fillStyle = `rgba(${tone},${tone},${tone},${alpha})`;
      ctx.fillText(character, x, y);
    }
  };

  const tick = (now) => {
    let elapsed = now - sceneStartedAt;

    while (elapsed >= SCENE_MS) {
      sceneStartedAt += SCENE_MS;
      currentIndex = nextIndex;
      nextIndex = (nextIndex + 1) % frames.length;
      prepareTransition();
      lastStaticFrame = -1;
      elapsed = now - sceneStartedAt;
    }

    const transitionProgress = elapsed <= HOLD_MS
      ? 0
      : clamp01((elapsed - HOLD_MS) / TRANSITION_MS);

    if (transitionProgress === 0) {
      if (lastStaticFrame !== currentIndex) {
        draw(now, 0);
        lastStaticFrame = currentIndex;
      }
    } else {
      draw(now, transitionProgress);
      lastStaticFrame = -1;
    }

    animationFrame = requestAnimationFrame(tick);
  };

  prepareTransition();
  resizeCanvas();

  if (reducedMotion) {
    draw(performance.now(), 0);
    return;
  }

  const resizeObserver = new ResizeObserver(() => resizeCanvas());
  resizeObserver.observe(root);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
      return;
    }
    sceneStartedAt = performance.now();
    lastStaticFrame = -1;
    animationFrame = requestAnimationFrame(tick);
  });

  animationFrame = requestAnimationFrame(tick);
})();
