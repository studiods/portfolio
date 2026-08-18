(() => {
  'use strict';

  const mq = window.matchMedia('(min-width: 781px)');
  if (!mq.matches) return;

  const hero = document.querySelector('.about-ascii-hero');
  const originalCanvas = document.querySelector('.about-ascii-canvas');
  const packed = window.ABOUT_ASCII_PACKED;
  if (!hero || !originalCanvas || !packed || !Array.isArray(packed.bytes)) return;

  const sourceCols = Number(packed.width) || 288;
  const sourceRows = Number(packed.height) || 162;
  const frameCount = Number(packed.count) || 7;
  if (frameCount < 6 || sourceCols !== 288 || sourceRows !== 162) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'about-ascii-desktop-grid-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    display: 'block',
    zIndex: '1',
    background: '#000',
    pointerEvents: 'none'
  });
  hero.insertBefore(canvas, hero.querySelector('.about-ascii-blackout'));
  originalCanvas.style.visibility = 'hidden';

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const OUTPUT_COLS = 288;
  const OUTPUT_ROWS = 162;
  const GRID_COLS = 3;
  const GRID_ROWS = 2;
  const SLOT_COUNT = 6;
  const CARD_COLS = 96;
  const CARD_ROWS = 81;
  const CROP_ROWS = sourceRows;
  const CROP_COLS = Math.round(CROP_ROWS * (CARD_COLS / CARD_ROWS));
  const CROP_X = Math.floor((sourceCols - CROP_COLS) / 2);

  const PALETTE = ' .,:;-=+*#%@';
  const SCENE_MS = 1500;
  const HOLD_MS = 960;
  const MORPH_MS = SCENE_MS - HOLD_MS;
  const GLITCH_MS = 48;
  const MATTE_ALPHA = 0.80;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sourceCellCount = sourceCols * sourceRows;
  const packedPerFrame = Math.ceil(sourceCellCount / 2);
  const raw = Uint8Array.from(packed.bytes);
  if (raw.length !== packedPerFrame * frameCount) return;

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

  const selectedFrames = sourceFrames.slice(0, 6);

  const buildCard = source => {
    const card = new Uint8Array(CARD_COLS * CARD_ROWS);
    for (let y = 0; y < CARD_ROWS; y += 1) {
      const sy = y * 2;
      for (let x = 0; x < CARD_COLS; x += 1) {
        const sx = CROP_X + x * 2;
        const a = source[sy * sourceCols + sx];
        const b = source[sy * sourceCols + sx + 1];
        const c = source[(sy + 1) * sourceCols + sx];
        const d = source[(sy + 1) * sourceCols + sx + 1];
        card[y * CARD_COLS + x] = Math.round((a + b + c + d) / 4);
      }
    }
    return card;
  };

  const cards = selectedFrames.map(buildCard);

  const compose = order => {
    const output = new Uint8Array(OUTPUT_COLS * OUTPUT_ROWS);
    for (let slot = 0; slot < order.length; slot += 1) {
      const gridX = slot % GRID_COLS;
      const gridY = Math.floor(slot / GRID_COLS);
      const card = cards[order[slot]];
      for (let y = 0; y < CARD_ROWS; y += 1) {
        const sourceStart = y * CARD_COLS;
        const targetStart = (gridY * CARD_ROWS + y) * OUTPUT_COLS + gridX * CARD_COLS;
        output.set(card.subarray(sourceStart, sourceStart + CARD_COLS), targetStart);
      }
    }
    return output;
  };

  const shuffle = values => {
    const copy = values.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const nextPermutation = current => {
    for (let attempt = 0; attempt < 24; attempt += 1) {
      const candidate = shuffle(current);
      if (candidate.every((value, index) => value !== current[index])) return candidate;
    }
    return [...current.slice(1), current[0]];
  };

  const pickMatteSlots = previous => {
    const allSlots = Array.from({ length: SLOT_COUNT }, (_, index) => index);
    const previousKey = previous?.slice().sort((a, b) => a - b).join(',') || '';
    for (let attempt = 0; attempt < 32; attempt += 1) {
      const candidate = shuffle(allSlots).slice(0, 3).sort((a, b) => a - b);
      if (candidate.join(',') !== previousKey) return candidate;
    }
    return [0, 2, 4];
  };

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

  const cellCount = OUTPUT_COLS * OUTPUT_ROWS;
  const timingStart = new Float32Array(cellCount);
  const timingEnd = new Float32Array(cellCount);
  const rowBuffers = Array.from({ length: OUTPUT_ROWS }, () => new Array(OUTPUT_COLS).fill(' '));

  let currentOrder = [0, 1, 2, 3, 4, 5];
  let upcomingOrder = nextPermutation(currentOrder);
  let currentMatteSlots = pickMatteSlots();
  let upcomingMatteSlots = pickMatteSlots(currentMatteSlots);
  let currentFrame = compose(currentOrder);
  let upcomingFrame = compose(upcomingOrder);
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

  const prepareTransition = () => {
    transitionSerial += 1;
    const orderSeed = upcomingOrder.reduce((seed, value, index) => seed + (value + 1) * (index + 5) * 97, 0);
    const seed = transitionSerial * 733 + orderSeed * 1597;
    for (let i = 0; i < cellCount; i += 1) {
      const start = hash(seed + i * 19) * 0.48;
      const duration = 0.28 + hash(seed + i * 41) * 0.32;
      timingStart[i] = start;
      timingEnd[i] = Math.min(1, start + duration);
    }
  };

  const resize = () => {
    const rect = hero.getBoundingClientRect();
    cssWidth = Math.max(1, rect.width);
    cssHeight = Math.max(1, rect.height);
    renderDpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssWidth * renderDpr);
    canvas.height = Math.round(cssHeight * renderDpr);
    ctx.setTransform(renderDpr, 0, 0, renderDpr, 0, 0);
    cellWidth = cssWidth / OUTPUT_COLS;
    cellHeight = cssHeight / OUTPUT_ROWS;
    const fontSize = Math.max(1.8, cellHeight * 1.02);
    ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    textScaleX = cellWidth / Math.max(0.01, ctx.measureText('M').width);
    lastStaticSerial = -1;
  };

  const drawMattes = morph => {
    ctx.setTransform(renderDpr, 0, 0, renderDpr, 0, 0);
    const currentSet = new Set(currentMatteSlots);
    const upcomingSet = new Set(upcomingMatteSlots);
    for (let slot = 0; slot < SLOT_COUNT; slot += 1) {
      const from = currentSet.has(slot) ? 1 : 0;
      const to = upcomingSet.has(slot) ? 1 : 0;
      const blend = morph > 0 ? from + (to - from) * smoothstep(morph) : from;
      const alpha = MATTE_ALPHA * blend;
      if (alpha <= 0.001) continue;
      const gridX = slot % GRID_COLS;
      const gridY = Math.floor(slot / GRID_COLS);
      ctx.fillStyle = `rgba(0,0,0,${alpha.toFixed(3)})`;
      ctx.fillRect(
        gridX * CARD_COLS * cellWidth,
        gridY * CARD_ROWS * cellHeight,
        CARD_COLS * cellWidth,
        CARD_ROWS * cellHeight
      );
    }
  };

  const draw = (now, morph = 0) => {
    ctx.setTransform(renderDpr, 0, 0, renderDpr, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    const chaos = morph > 0 ? Math.sin(Math.PI * morph) : 0;
    const glitchTick = Math.floor(now / GLITCH_MS);
    const orderSeed = upcomingOrder.reduce((seed, value, index) => seed + (value + 1) * (index + 11) * 83, 0);
    const seed = transitionSerial * 1063 + orderSeed * 2207;

    for (let i = 0; i < cellCount; i += 1) {
      let value = currentFrame[i];
      if (morph > 0) {
        const start = timingStart[i];
        const end = timingEnd[i];
        const local = morph <= start ? 0 : morph >= end ? 1 : smoothstep((morph - start) / Math.max(0.001, end - start));
        value = currentFrame[i] + (upcomingFrame[i] - currentFrame[i]) * local;
      }
      let paletteIndex = Math.round((value / 255) * (PALETTE.length - 1));
      if (morph > 0) {
        const noise = hash(seed + i * 47 + glitchTick * 131);
        if (noise < 0.08 + chaos * 0.4) {
          const offsetNoise = hash(seed + i * 71 + glitchTick * 197);
          paletteIndex = Math.max(0, Math.min(PALETTE.length - 1, paletteIndex + Math.round((offsetNoise * 2 - 1) * (1 + chaos * 3))));
        }
      }
      rowBuffers[Math.floor(i / OUTPUT_COLS)][i % OUTPUT_COLS] = PALETTE[paletteIndex];
    }

    ctx.setTransform(renderDpr * textScaleX, 0, 0, renderDpr, 0, 0);
    ctx.fillStyle = 'rgba(244,242,237,.88)';
    for (let row = 0; row < OUTPUT_ROWS; row += 1) {
      ctx.fillText(rowBuffers[row].join(''), 0, row * cellHeight + cellHeight * 0.54);
    }
    drawMattes(morph);
  };

  const advanceScene = () => {
    currentOrder = upcomingOrder;
    currentFrame = upcomingFrame;
    currentMatteSlots = upcomingMatteSlots;
    upcomingOrder = nextPermutation(currentOrder);
    upcomingFrame = compose(upcomingOrder);
    upcomingMatteSlots = pickMatteSlots(currentMatteSlots);
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

  prepareTransition();
  resize();
  draw(performance.now(), 0);
  hero.dataset.asciiDesktopGrid = 'ready';
  if (!reducedMotion) rafId = requestAnimationFrame(renderLoop);

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pagehide', () => {
    if (rafId) cancelAnimationFrame(rafId);
  }, { once: true });
})();
