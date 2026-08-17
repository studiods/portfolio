(async () => {
  'use strict';

  const hero = document.querySelector('.about-ascii-hero');
  const stage = document.querySelector('.about-ascii-stage');
  const canvas = document.querySelector('.about-ascii-canvas');
  const packed = window.ABOUT_ASCII_PACKED;
  if (!hero || !stage || !canvas || !packed || !packed.data) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const cols = packed.width;
  const rows = packed.height;
  const frameCount = packed.count;
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

  const decodePackedFrames = async () => {
    const binary = atob(packed.data);
    const compressed = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
    const raw = new Uint8Array(await new Response(stream).arrayBuffer());
    const packedPerFrame = Math.ceil(cellCount / 2);
    const frames = [];
    for (let f = 0; f < frameCount; f += 1) {
      const frame = new Uint8Array(cellCount);
      const offset = f * packedPerFrame;
      let target = 0;
      for (let i = 0; i < packedPerFrame && target < cellCount; i += 1) {
        const byte = raw[offset + i] || 0;
        frame[target] = ((byte >>> 4) & 15) * 17;
        if (target + 1 < cellCount) frame[target + 1] = (byte & 15) * 17;
        target += 2;
      }
      frames.push(frame);
    }
    return frames;
  };

  let frames;
  try {
    frames = await decodePackedFrames();
  } catch (error) {
    console.error('Failed to decode About ASCII data', error);
    return;
  }

  const timingStart = new Float32Array(cellCount);
  const timingEnd = new Float32Array(cellCount);

  let frameIndex = 0;
  let nextIndex = 1;
  let startedAt = performance.now();
  let rafId = 0;
  let dpr = 1;
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
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cellWidth = cssWidth / cols;
    cellHeight = cssHeight / rows;
    const fontSize = Math.max(4, Math.min(cellWidth * 1.08, cellHeight * 1.02));
    ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lastStaticIndex = -1;
  };

  const draw = (now, morph = 0) => {
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
      if (normalized < 0.035) continue;

      let paletteIndex = Math.round(normalized * (palette.length - 1));
      if (morph > 0) {
        const noise = hash(seed + i * 47 + glitchTick * 131);
        if (noise < 0.08 + chaos * 0.4) {
          const offsetNoise = hash(seed + i * 71 + glitchTick * 197);
          paletteIndex = Math.max(1, Math.min(palette.length - 1, paletteIndex + Math.round((offsetNoise * 2 - 1) * (1 + chaos * 3))));
        }
      }

      const ch = palette[paletteIndex];
      if (ch === ' ') continue;

      const x = (i % cols) * cellWidth + cellWidth * 0.5;
      const y = Math.floor(i / cols) * cellHeight + cellHeight * 0.55;
      const alpha = Math.min(1, 0.18 + normalized * 0.84 + chaos * 0.06);
      const tone = Math.round(172 + normalized * 83);
      ctx.fillStyle = `rgba(${tone},${tone},${tone},${alpha})`;
      ctx.fillText(ch, x, y);
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
    const blackout = clamp01(passed / 0.62);
    const fadePhase = clamp01((passed - 0.62) / 0.38);

    hero.style.setProperty('--ascii-blackout', blackout.toFixed(3));
    hero.style.setProperty('--ascii-opacity', (1 - fadePhase).toFixed(3));
    hero.style.setProperty('--ascii-y', `${Math.round(-56 * fadePhase)}px`);
  };

  prepareTransition();
  resize();
  updateScrollState();

  if (!reducedMotion) {
    rafId = requestAnimationFrame(renderLoop);
  } else {
    draw(performance.now(), 0);
  }

  const onResize = () => {
    resize();
    updateScrollState();
    if (reducedMotion) draw(performance.now(), 0);
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateScrollState();
      ticking = false;
    });
  };

  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (reducedMotion) return;
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      startedAt = performance.now();
      lastStaticIndex = -1;
      rafId = requestAnimationFrame(renderLoop);
    }
  });
})();
