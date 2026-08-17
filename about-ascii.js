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

  drawStatus('DOT LOADING');

  const packed = window.ABOUT_ASCII_PACKED;
  if (!packed || !Array.isArray(packed.bytes) || Number(packed.count) !== 7) {
    drawStatus('ASCII DATA ERROR');
    console.error('About ASCII: packed 7-frame data is missing or invalid.', packed);
    return;
  }

  const cols = Number(packed.width) || 144;
  const rows = Number(packed.height) || 81;
  const frameCount = Number(packed.count) || 7;
  const cellCount = cols * rows;
  const packedPerFrame = Math.ceil(cellCount / 2);
  const DOT_LEVELS = 12;
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

  const frames = [];
  for (let f = 0; f < frameCount; f += 1) {
    const frame = new Uint8Array(cellCount);
    const offset = f * packedPerFrame;
    let target = 0;
    for (let i = 0; i < packedPerFrame && target < cellCount; i += 1) {
      const byte = raw[offset + i];
      frame[target] = ((byte >>> 4) & 15) * 17;
      if (target + 1 < cellCount) frame[target + 1] = (byte & 15) * 17;
      target += 2;
    }
    frames.push(frame);
  }
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
  let lastStaticIndex = -1;

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
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cellWidth = cssWidth / cols;
    cellHeight = cssHeight / rows;
    lastStaticIndex = -1;
  };

  const dotBuckets = Array.from({ length: DOT_LEVELS }, () => []);

  const draw = (now, morph = 0) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    const current = frames[frameIndex];
    const next = frames[nextIndex];
    const chaos = morph > 0 ? Math.sin(Math.PI * morph) : 0;
    const glitchTick = Math.floor(now / GLITCH_MS);
    const seed = (frameIndex + 1) * 1063 + (nextIndex + 1) * 2207;

    dotBuckets.forEach((bucket) => { bucket.length = 0; });

    for (let i = 0; i < cellCount; i += 1) {
      let value = current[i];
      if (morph > 0) {
        const start = timingStart[i];
        const end = timingEnd[i];
        const local = morph <= start ? 0 : morph >= end ? 1 : smoothstep((morph - start) / Math.max(0.001, end - start));
        value = current[i] + (next[i] - current[i]) * local;
      }
      let normalized = value / 255;
      if (morph > 0) {
        const noise = hash(seed + i * 47 + glitchTick * 131);
        normalized = clamp01(normalized + (noise * 2 - 1) * chaos * 0.16);
      }
      const shaped = Math.pow(normalized, 0.72);
      const level = Math.round(shaped * (DOT_LEVELS - 1));
      if (level < 1) continue;

      const jitterX = morph > 0 ? (hash(seed + i * 71 + glitchTick * 197) * 2 - 1) * cellWidth * chaos * 0.18 : 0;
      const jitterY = morph > 0 ? (hash(seed + i * 89 + glitchTick * 229) * 2 - 1) * cellHeight * chaos * 0.18 : 0;
      const x = (i % cols) * cellWidth + cellWidth * 0.5 + jitterX;
      const y = Math.floor(i / cols) * cellHeight + cellHeight * 0.5 + jitterY;
      dotBuckets[level].push(x, y);
    }

    const maxRadius = Math.min(cellWidth, cellHeight) * 0.47;
    for (let level = 1; level < DOT_LEVELS; level += 1) {
      const bucket = dotBuckets[level];
      if (!bucket.length) continue;
      const normalized = level / (DOT_LEVELS - 1);
      const radius = Math.max(0.42, maxRadius * (0.12 + Math.pow(normalized, 0.82) * 0.88));
      const tone = Math.round(172 + normalized * 83);
      const alpha = Math.min(1, 0.12 + normalized * 0.88 + chaos * 0.04);
      ctx.fillStyle = `rgba(${tone},${tone},${tone},${alpha})`;
      ctx.beginPath();
      for (let p = 0; p < bucket.length; p += 2) {
        ctx.moveTo(bucket[p] + radius, bucket[p + 1]);
        ctx.arc(bucket[p], bucket[p + 1], radius, 0, Math.PI * 2);
      }
      ctx.fill();
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
    const passed = clamp01((-stageRect.top) / travel);
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
