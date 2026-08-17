(() => {
  'use strict';

  const hero = document.querySelector('.about-ascii-hero');
  const stage = document.querySelector('.about-ascii-stage');
  const canvas = document.querySelector('.about-ascii-canvas');
  const ctx = canvas?.getContext('2d', { alpha: false });
  if (!hero || !stage || !canvas || !ctx) return;

  const drawStatus = (text) => {
    const rect = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = 'rgba(244,242,237,.72)';
    ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(text, 18, 18);
  };

  drawStatus('ASCII LOADING');

  const packed = window.ABOUT_ASCII_PACKED;
  if (!packed || !Array.isArray(packed.bytes) || Number(packed.count) !== 7) {
    drawStatus('ASCII DATA ERROR');
    console.error('About ASCII: packed 7-frame data is missing or invalid.', packed);
    return;
  }

  const sourceCols = Number(packed.width) || 144;
  const sourceRows = Number(packed.height) || 81;
  const frameCount = Number(packed.count) || 7;
  const sourceCellCount = sourceCols * sourceRows;
  const packedPerFrame = Math.ceil(sourceCellCount / 2);
  const cols = 192;
  const rows = 108;
  const cellCount = cols * rows;
  const palette = ' .,:;-=+*#%@';
  const SCENE_MS = 1800;
  const HOLD_MS = 1150;
  const MORPH_MS = SCENE_MS - HOLD_MS;
  const GLITCH_MS = 48;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const smoothstep = (v) => {
    const t = clamp01(v);
    return t * t * (3 - 2 * t);
  };
  const hash = (value) => {
    let x = value | 0;
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967295;
  };

  const expected = packedPerFrame * frameCount;
  if (packed.encoding !== 'u4-array' || !Array.isArray(packed.bytes)) {
    drawStatus('ASCII DATA ERROR');
    console.error('About ASCII: expected an inline u4 byte array.', packed.encoding);
    return;
  }

  const raw = Uint8Array.from(packed.bytes);
  if (raw.length !== expected) {
    drawStatus('ASCII PAYLOAD ERROR');
    console.error(`About ASCII payload mismatch: ${raw.length}/${expected}`);
    return;
  }

  const checksum = (bytes) => {
    let hashValue = 0x811c9dc5;
    for (let i = 0; i < bytes.length; i += 1) {
      hashValue ^= bytes[i];
      hashValue = Math.imul(hashValue, 0x01000193);
    }
    return (hashValue >>> 0).toString(16).padStart(8, '0');
  };
  const actualChecksum = checksum(raw);
  if (packed.checksum !== actualChecksum) {
    drawStatus('ASCII DATA ERROR');
    console.error(`About ASCII checksum mismatch: ${actualChecksum}/${packed.checksum}`);
    return;
  }

  const sourceFrames = [];
  for (let f = 0; f < frameCount; f += 1) {
    const frame = new Uint8Array(sourceCellCount);
    const offset = f * packedPerFrame;
    let target = 0;
    for (let i = 0; i < packedPerFrame && target < sourceCellCount; i += 1) {
      const byte = raw[offset + i];
      frame[target] = ((byte >>> 4) & 15) * 17;
      if (target + 1 < sourceCellCount) frame[target + 1] = (byte & 15) * 17;
      target += 2;
    }
    sourceFrames.push(frame);
  }

  const resampleFrame = (source) => {
    const output = new Uint8Array(cellCount);
    for (let y = 0; y < rows; y += 1) {
      const sourceY = y * (sourceRows - 1) / Math.max(1, rows - 1);
      const y0 = Math.floor(sourceY);
      const y1 = Math.min(sourceRows - 1, y0 + 1);
      const fy = sourceY - y0;
      for (let x = 0; x < cols; x += 1) {
        const sourceX = x * (sourceCols - 1) / Math.max(1, cols - 1);
        const x0 = Math.floor(sourceX);
        const x1 = Math.min(sourceCols - 1, x0 + 1);
        const fx = sourceX - x0;
        const top = source[y0 * sourceCols + x0] * (1 - fx) + source[y0 * sourceCols + x1] * fx;
        const bottom = source[y1 * sourceCols + x0] * (1 - fx) + source[y1 * sourceCols + x1] * fx;
        output[y * cols + x] = Math.round(top * (1 - fy) + bottom * fy);
      }
    }
    return output;
  };
  const frames = sourceFrames.map(resampleFrame);
  hero.dataset.asciiState = 'ready';

  const timingStart = new Float32Array(cellCount);
  const timingEnd = new Float32Array(cellCount);
  let frameIndex = 0;
  let nextIndex = 1;
  let startedAt = performance.now();
  let rafId = 0;
  let cssWidth = 0;
  let cssHeight = 0;
  let cellWidth = 1;
  let cellHeight = 1;
  let renderDpr = 1;
  let textScaleX = 1;
  let lastStaticIndex = -1;
  const rowBuffers = Array.from({ length: rows }, () => new Array(cols).fill(' '));

  const prepareTransition = () => {
    const seed = (frameIndex + 1) * 733 + (nextIndex + 1) * 1597;
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
    cellWidth = cssWidth / cols;
    cellHeight = cssHeight / rows;
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
    const current = frames[frameIndex];
    const next = frames[nextIndex];
    const chaos = morph > 0 ? Math.sin(Math.PI * morph) : 0;
    const glitchTick = Math.floor(now / GLITCH_MS);
    const seed = (frameIndex + 1) * 1063 + (nextIndex + 1) * 2207;

    for (let i = 0; i < cellCount; i += 1) {
      let value = current[i];
      if (morph > 0) {
        const start = timingStart[i];
        const end = timingEnd[i];
        const local = morph <= start ? 0 : morph >= end ? 1 : smoothstep((morph - start) / Math.max(0.001, end - start));
        value = current[i] + (next[i] - current[i]) * local;
      }
      const normalized = value / 255;
      let paletteIndex = Math.round(normalized * (palette.length - 1));
      if (morph > 0) {
        const noise = hash(seed + i * 47 + glitchTick * 131);
        if (noise < 0.08 + chaos * 0.4) {
          const offsetNoise = hash(seed + i * 71 + glitchTick * 197);
          paletteIndex = Math.max(0, Math.min(palette.length - 1, paletteIndex + Math.round((offsetNoise * 2 - 1) * (1 + chaos * 3))));
        }
      }
      rowBuffers[Math.floor(i / cols)][i % cols] = palette[paletteIndex];
    }

    ctx.setTransform(renderDpr * textScaleX, 0, 0, renderDpr, 0, 0);
    ctx.fillStyle = 'rgba(244,242,237,.88)';
    for (let row = 0; row < rows; row += 1) {
      ctx.fillText(rowBuffers[row].join(''), 0, row * cellHeight + cellHeight * 0.54);
    }
  };

  const renderLoop = (now) => {
    let elapsed = now - startedAt;
    while (elapsed >= SCENE_MS) {
      startedAt += SCENE_MS;
      frameIndex = nextIndex;
      nextIndex = (nextIndex + 1) % frames.length;
      prepareTransition();
      lastStaticIndex = -1;
      elapsed = now - startedAt;
    }
    const morph = elapsed <= HOLD_MS ? 0 : clamp01((elapsed - HOLD_MS) / MORPH_MS);
    if (morph === 0) {
      if (lastStaticIndex !== frameIndex) {
        draw(now, 0);
        lastStaticIndex = frameIndex;
      }
    } else {
      draw(now, morph);
      lastStaticIndex = -1;
    }
    rafId = requestAnimationFrame(renderLoop);
  };

  const updateScrollState = () => {
    const stageRect = stage.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();
    const travel = Math.max(1, stage.offsetHeight - heroRect.height);
    const fadeDistance = Math.max(travel, stage.offsetHeight * 0.82);
    const fadeStart = Math.min(90, fadeDistance * 0.08);
    const passed = clamp01((-stageRect.top - fadeStart) / Math.max(1, fadeDistance - fadeStart));
    const blackout = smoothstep(passed) * 0.92;
    hero.style.setProperty('--ascii-blackout', blackout.toFixed(3));
  };

  prepareTransition();
  resize();
  draw(performance.now(), 0);
  updateScrollState();
  if (!reducedMotion) rafId = requestAnimationFrame(renderLoop);

  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      updateScrollState();
      scrollTicking = false;
    });
  }, { passive: true });

  window.addEventListener('resize', () => {
    resize();
    draw(performance.now(), 0);
    updateScrollState();
  }, { passive: true });
})();
