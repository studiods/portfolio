(() => {
  'use strict';

  const canvas = document.querySelector('.ascii-grid-test-canvas');
  const status = document.querySelector('.ascii-grid-test-status');
  const ctx = canvas?.getContext('2d', { alpha: false });
  const packed = window.ABOUT_ASCII_PACKED;

  if (!canvas || !ctx || !packed || !Array.isArray(packed.bytes)) {
    if (status) status.textContent = 'ASCII TEST · DATA ERROR';
    return;
  }

  const sourceCols = Number(packed.width) || 288;
  const sourceRows = Number(packed.height) || 162;
  const frameCount = Number(packed.count) || 7;

  if (frameCount !== 7 || sourceCols !== 288 || sourceRows !== 162) {
    if (status) status.textContent = 'ASCII TEST · SOURCE SIZE ERROR';
    console.error('ASCII single-frame test expects 7 frames at 288×162.', {
      width: sourceCols,
      height: sourceRows,
      count: frameCount
    });
    return;
  }

  const PALETTE = ' .,:;-=+*#%@';
  const SCENE_MS = 1500;
  const HOLD_MS = 960;
  const MORPH_MS = SCENE_MS - HOLD_MS;
  const GLITCH_MS = 48;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cellCount = sourceCols * sourceRows;
  const packedPerFrame = Math.ceil(cellCount / 2);
  const expected = packedPerFrame * frameCount;

  if (packed.encoding !== 'u4-array' || packed.bytes.length !== expected) {
    if (status) status.textContent = 'ASCII TEST · PAYLOAD ERROR';
    console.error('ASCII single-frame test payload mismatch.', {
      encoding: packed.encoding,
      actual: packed.bytes.length,
      expected
    });
    return;
  }

  const raw = Uint8Array.from(packed.bytes);
  const frames = [];

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    const frame = new Uint8Array(cellCount);
    const offset = frameIndex * packedPerFrame;
    let target = 0;

    for (let i = 0; i < packedPerFrame && target < cellCount; i += 1) {
      const byte = raw[offset + i];
      frame[target] = ((byte >>> 4) & 15) * 17;
      if (target + 1 < cellCount) frame[target + 1] = (byte & 15) * 17;
      target += 2;
    }
    frames.push(frame);
  }

  const clamp01 = value => Math.max(0, Math.min(1, value));
  const smoothstep = value => {
    const t = clamp01(value);
    return t * t * (3 - 2 * t);
  };
  const hash = value => {
    let x = value | 0;
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967295;
  };
  const pickDifferent = previous => {
    let next = previous;
    while (next === previous) next = Math.floor(Math.random() * frameCount);
    return next;
  };

  /*
    This test deliberately uses the full 288×162 source frame with no portrait
    crop. The original 16:9 composition — including more of the surrounding
    background — is therefore preserved. CSS scales the 16:9 canvas to cover the
    viewport, so physical pixel resolution may change but the source composition
    and aspect ratio do not.
  */
  let currentIndex = Math.floor(Math.random() * frameCount);
  let nextIndex = pickDifferent(currentIndex);
  let startedAt = performance.now();
  let transitionSerial = 0;
  let rafId = 0;
  let cssWidth = 0;
  let cssHeight = 0;
  let cellWidth = 1;
  let cellHeight = 1;
  let renderDpr = 1;
  let textScaleX = 1;
  let lastStaticIndex = -1;

  const timingStart = new Float32Array(cellCount);
  const timingEnd = new Float32Array(cellCount);
  const rowBuffers = Array.from({ length: sourceRows }, () => new Array(sourceCols).fill(' '));

  const prepareTransition = () => {
    transitionSerial += 1;
    const seed = transitionSerial * 733 + (currentIndex + 1) * 1597 + (nextIndex + 1) * 2207;

    for (let i = 0; i < cellCount; i += 1) {
      const start = hash(seed + i * 19) * 0.48;
      const duration = 0.28 + hash(seed + i * 41) * 0.32;
      timingStart[i] = start;
      timingEnd[i] = Math.min(1, start + duration);
    }
  };

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    cssWidth = Math.max(1, rect.width);
    cssHeight = Math.max(1, rect.height);
    renderDpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssWidth * renderDpr);
    canvas.height = Math.round(cssHeight * renderDpr);
    ctx.setTransform(renderDpr, 0, 0, renderDpr, 0, 0);

    cellWidth = cssWidth / sourceCols;
    cellHeight = cssHeight / sourceRows;
    const fontSize = Math.max(1.8, cellHeight * 1.02);
    ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    textScaleX = cellWidth / Math.max(0.01, ctx.measureText('M').width);
    lastStaticIndex = -1;
  };

  const draw = (now, morph = 0) => {
    ctx.setTransform(renderDpr, 0, 0, renderDpr, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    const current = frames[currentIndex];
    const next = frames[nextIndex];
    const chaos = morph > 0 ? Math.sin(Math.PI * morph) : 0;
    const glitchTick = Math.floor(now / GLITCH_MS);
    const seed = transitionSerial * 1063 + (currentIndex + 1) * 1601 + (nextIndex + 1) * 2207;

    for (let i = 0; i < cellCount; i += 1) {
      let value = current[i];

      if (morph > 0) {
        const start = timingStart[i];
        const end = timingEnd[i];
        const local = morph <= start
          ? 0
          : morph >= end
            ? 1
            : smoothstep((morph - start) / Math.max(0.001, end - start));
        value = current[i] + (next[i] - current[i]) * local;
      }

      const normalized = value / 255;
      let paletteIndex = Math.round(normalized * (PALETTE.length - 1));

      if (morph > 0) {
        const noise = hash(seed + i * 47 + glitchTick * 131);
        if (noise < 0.08 + chaos * 0.4) {
          const offsetNoise = hash(seed + i * 71 + glitchTick * 197);
          paletteIndex = Math.max(
            0,
            Math.min(
              PALETTE.length - 1,
              paletteIndex + Math.round((offsetNoise * 2 - 1) * (1 + chaos * 3))
            )
          );
        }
      }

      rowBuffers[Math.floor(i / sourceCols)][i % sourceCols] = PALETTE[paletteIndex];
    }

    ctx.setTransform(renderDpr * textScaleX, 0, 0, renderDpr, 0, 0);
    ctx.fillStyle = 'rgba(244,242,237,.88)';

    for (let row = 0; row < sourceRows; row += 1) {
      ctx.fillText(rowBuffers[row].join(''), 0, row * cellHeight + cellHeight * 0.54);
    }
  };

  const advanceScene = () => {
    currentIndex = nextIndex;
    nextIndex = pickDifferent(currentIndex);
    prepareTransition();
    lastStaticIndex = -1;
  };

  const renderLoop = now => {
    let elapsed = now - startedAt;

    while (elapsed >= SCENE_MS) {
      startedAt += SCENE_MS;
      advanceScene();
      elapsed = now - startedAt;
    }

    const morph = elapsed <= HOLD_MS ? 0 : clamp01((elapsed - HOLD_MS) / MORPH_MS);

    if (morph === 0) {
      if (lastStaticIndex !== currentIndex) {
        draw(now, 0);
        lastStaticIndex = currentIndex;
      }
    } else {
      draw(now, morph);
      lastStaticIndex = -1;
    }

    rafId = requestAnimationFrame(renderLoop);
  };

  prepareTransition();
  resizeCanvas();
  draw(performance.now(), 0);
  if (status) status.textContent = 'ASCII TEST · 1 FRAME · FULL 16:9 · 7 RANDOM';

  if (!reducedMotion) rafId = requestAnimationFrame(renderLoop);

  window.addEventListener('resize', () => {
    resizeCanvas();
    draw(performance.now(), 0);
  }, { passive: true });

  window.addEventListener('pagehide', () => {
    if (rafId) cancelAnimationFrame(rafId);
  }, { once: true });
})();
