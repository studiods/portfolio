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
    console.error('ASCII responsive test expects 7 frames at 288×162.', {
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
  const MOBILE_MAX = 768;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sourceCellCount = sourceCols * sourceRows;
  const packedPerFrame = Math.ceil(sourceCellCount / 2);
  const expected = packedPerFrame * frameCount;

  if (packed.encoding !== 'u4-array' || packed.bytes.length !== expected) {
    if (status) status.textContent = 'ASCII TEST · PAYLOAD ERROR';
    console.error('ASCII responsive test payload mismatch.', {
      encoding: packed.encoding,
      actual: packed.bytes.length,
      expected
    });
    return;
  }

  const raw = Uint8Array.from(packed.bytes);
  const sourceFrames = [];

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    const frame = new Uint8Array(sourceCellCount);
    const offset = frameIndex * packedPerFrame;
    let target = 0;

    for (let i = 0; i < packedPerFrame && target < sourceCellCount; i += 1) {
      const byte = raw[offset + i];
      frame[target] = ((byte >>> 4) & 15) * 17;
      if (target + 1 < sourceCellCount) frame[target + 1] = (byte & 15) * 17;
      target += 2;
    }
    sourceFrames.push(frame);
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
    if (frameCount <= 1) return 0;
    let next = previous;
    while (next === previous) next = Math.floor(Math.random() * frameCount);
    return next;
  };

  const pickPair = previous => {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const left = Math.floor(Math.random() * frameCount);
      let right = left;
      while (right === left) right = Math.floor(Math.random() * frameCount);

      const sameOrder = previous && previous[0] === left && previous[1] === right;
      const sameSet = previous && previous.includes(left) && previous.includes(right);
      if (!sameOrder && !sameSet) return [left, right];
    }

    const left = previous ? (previous[0] + 2) % frameCount : 0;
    let right = (left + 3) % frameCount;
    if (right === left) right = (right + 1) % frameCount;
    return [left, right];
  };

  let isMobile = window.innerWidth <= MOBILE_MAX;
  let outputCols = 288;
  let outputRows = 162;
  let cellCount = outputCols * outputRows;
  let rowBuffers = [];
  let timingStart = new Float32Array(cellCount);
  let timingEnd = new Float32Array(cellCount);

  let currentSelection = isMobile ? [Math.floor(Math.random() * frameCount)] : pickPair(null);
  let upcomingSelection = isMobile
    ? [pickDifferent(currentSelection[0])]
    : pickPair(currentSelection);
  let currentFrame = null;
  let upcomingFrame = null;

  let startedAt = performance.now();
  let transitionSerial = 0;
  let rafId = 0;
  let cssWidth = 0;
  let cssHeight = 0;
  let cellWidth = 1;
  let cellHeight = 1;
  let renderDpr = 1;
  let textScaleX = 1;
  let lastStaticSerial = -1;

  /*
    Desktop: retain the existing 288×162 logical resolution and split it into
    two 144×162 portrait cards. Each source uses the full 162px height and a
    centered 144px-wide crop, so the overall output remains exactly 16:9.

    Mobile: show one source only. A centered 162×162 crop uses the full source
    height and produces a true 1:1 logical frame without stretching the portrait.
  */
  const cropSource = (source, cropCols, cropRows = sourceRows) => {
    const cropX = Math.max(0, Math.floor((sourceCols - cropCols) / 2));
    const cropY = Math.max(0, Math.floor((sourceRows - cropRows) / 2));
    const output = new Uint8Array(cropCols * cropRows);

    for (let y = 0; y < cropRows; y += 1) {
      const sourceStart = (cropY + y) * sourceCols + cropX;
      const targetStart = y * cropCols;
      output.set(source.subarray(sourceStart, sourceStart + cropCols), targetStart);
    }
    return output;
  };

  const compose = selection => {
    if (isMobile) {
      return cropSource(sourceFrames[selection[0]], 162, 162);
    }

    const output = new Uint8Array(288 * 162);
    const left = cropSource(sourceFrames[selection[0]], 144, 162);
    const right = cropSource(sourceFrames[selection[1]], 144, 162);

    for (let y = 0; y < 162; y += 1) {
      const rowStart = y * 288;
      const cardStart = y * 144;
      output.set(left.subarray(cardStart, cardStart + 144), rowStart);
      output.set(right.subarray(cardStart, cardStart + 144), rowStart + 144);
    }
    return output;
  };

  const prepareBuffers = () => {
    outputCols = isMobile ? 162 : 288;
    outputRows = 162;
    cellCount = outputCols * outputRows;
    rowBuffers = Array.from({ length: outputRows }, () => new Array(outputCols).fill(' '));
    timingStart = new Float32Array(cellCount);
    timingEnd = new Float32Array(cellCount);
    currentFrame = compose(currentSelection);
    upcomingFrame = compose(upcomingSelection);
  };

  const prepareTransition = () => {
    transitionSerial += 1;
    const selectionSeed = upcomingSelection.reduce(
      (seed, value, index) => seed + (value + 1) * (index + 5) * 97,
      0
    );
    const seed = transitionSerial * 733 + selectionSeed * 1597;

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

    cellWidth = cssWidth / outputCols;
    cellHeight = cssHeight / outputRows;
    const fontSize = Math.max(1.8, cellHeight * 1.02);
    ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    textScaleX = cellWidth / Math.max(0.01, ctx.measureText('M').width);
    lastStaticSerial = -1;
  };

  const draw = (now, morph = 0) => {
    ctx.setTransform(renderDpr, 0, 0, renderDpr, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    const chaos = morph > 0 ? Math.sin(Math.PI * morph) : 0;
    const glitchTick = Math.floor(now / GLITCH_MS);
    const selectionSeed = upcomingSelection.reduce(
      (seed, value, index) => seed + (value + 1) * (index + 11) * 83,
      0
    );
    const seed = transitionSerial * 1063 + selectionSeed * 2207;

    for (let i = 0; i < cellCount; i += 1) {
      let value = currentFrame[i];

      if (morph > 0) {
        const start = timingStart[i];
        const end = timingEnd[i];
        const local = morph <= start
          ? 0
          : morph >= end
            ? 1
            : smoothstep((morph - start) / Math.max(0.001, end - start));
        value = currentFrame[i] + (upcomingFrame[i] - currentFrame[i]) * local;
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

      rowBuffers[Math.floor(i / outputCols)][i % outputCols] = PALETTE[paletteIndex];
    }

    ctx.setTransform(renderDpr * textScaleX, 0, 0, renderDpr, 0, 0);
    ctx.fillStyle = 'rgba(244,242,237,.88)';

    for (let row = 0; row < outputRows; row += 1) {
      ctx.fillText(rowBuffers[row].join(''), 0, row * cellHeight + cellHeight * 0.54);
    }
  };

  const advanceScene = () => {
    currentSelection = upcomingSelection;
    currentFrame = upcomingFrame;
    upcomingSelection = isMobile
      ? [pickDifferent(currentSelection[0])]
      : pickPair(currentSelection);
    upcomingFrame = compose(upcomingSelection);
    prepareTransition();
    lastStaticSerial = -1;
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
      if (lastStaticSerial !== transitionSerial) {
        draw(now, 0);
        lastStaticSerial = transitionSerial;
      }
    } else {
      draw(now, morph);
      lastStaticSerial = -1;
    }

    rafId = requestAnimationFrame(renderLoop);
  };

  const reconfigureForViewport = () => {
    const nextMobile = window.innerWidth <= MOBILE_MAX;
    if (nextMobile !== isMobile) {
      isMobile = nextMobile;
      currentSelection = isMobile
        ? [Math.floor(Math.random() * frameCount)]
        : pickPair(null);
      upcomingSelection = isMobile
        ? [pickDifferent(currentSelection[0])]
        : pickPair(currentSelection);
      prepareBuffers();
      prepareTransition();
      startedAt = performance.now();
    }

    resizeCanvas();
    draw(performance.now(), 0);
    if (status) {
      status.textContent = isMobile
        ? 'ASCII TEST · MOBILE · 1 CARD · 1:1'
        : 'ASCII TEST · DESKTOP · 2 CARDS · 16:9 · 7 RANDOM';
    }
  };

  prepareBuffers();
  prepareTransition();
  reconfigureForViewport();

  if (!reducedMotion) rafId = requestAnimationFrame(renderLoop);

  window.addEventListener('resize', reconfigureForViewport, { passive: true });
  window.addEventListener('pagehide', () => {
    if (rafId) cancelAnimationFrame(rafId);
  }, { once: true });
})();
