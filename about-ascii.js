(() => {
  'use strict';

  const hero = document.querySelector('.about-ascii-hero');
  const stage = document.querySelector('.about-ascii-stage');
  const canvas = document.querySelector('.about-ascii-canvas');
  const ctx = canvas?.getContext('2d', { alpha: false });
  if (!hero || !stage || !canvas || !ctx) return;

  const SOURCE_COLS = 192;
  const SOURCE_ROWS = 108;
  const FRAME_COUNT = 7;
  const PACKED_BYTES_PER_FRAME = Math.ceil((SOURCE_COLS * SOURCE_ROWS) / 2);
  const FRAME_CHECKSUMS = [
    '79cd4ece',
    '9e81a39e',
    'c789e3aa',
    'b18dd86f',
    'af8546d7',
    '9e03ddb2',
    '4e56d670'
  ];

  const palette = ' .,:;-=+*#%@';
  const SCENE_MS = 1500;
  const HOLD_MS = 960;
  const MORPH_MS = SCENE_MS - HOLD_MS;
  const GLITCH_MS = 48;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const drawStatus = text => {
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

  const clamp01 = value => Math.max(0, Math.min(1, value));
  const smoothstep = value => {
    const t = clamp01(value);
    return t * t * (3 - 2 * t);
  };
  const easeOutCubic = value => {
    const t = clamp01(value);
    return 1 - Math.pow(1 - t, 3);
  };
  const hash = value => {
    let x = value | 0;
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967295;
  };
  const checksum = bytes => {
    let hashValue = 0x811c9dc5;
    for (let i = 0; i < bytes.length; i += 1) {
      hashValue ^= bytes[i];
      hashValue = Math.imul(hashValue, 0x01000193);
    }
    return (hashValue >>> 0).toString(16).padStart(8, '0');
  };
  const shuffle = values => {
    const copy = values.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const base64ToBytes = value => {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  };

  const inflateFrame = async value => {
    if (typeof DecompressionStream !== 'function') {
      throw new Error('DecompressionStream is not supported in this browser.');
    }
    const stream = new Blob([base64ToBytes(value)])
      .stream()
      .pipeThrough(new DecompressionStream('deflate'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  };

  const unpackFrame = packed => {
    const cellCount = SOURCE_COLS * SOURCE_ROWS;
    const frame = new Uint8Array(cellCount);
    let target = 0;
    for (let i = 0; i < packed.length && target < cellCount; i += 1) {
      const byte = packed[i];
      frame[target] = ((byte >>> 4) & 15) * 17;
      if (target + 1 < cellCount) frame[target + 1] = (byte & 15) * 17;
      target += 2;
    }
    return frame;
  };

  const init = async () => {
    drawStatus('ASCII LOADING');

    const encodedFrames = window.ABOUT_ASCII_FRAME_B64;
    if (!Array.isArray(encodedFrames) || encodedFrames.length !== FRAME_COUNT) {
      throw new Error(`About ASCII source count mismatch: ${encodedFrames?.length || 0}/${FRAME_COUNT}`);
    }

    const packedFrames = await Promise.all(encodedFrames.map(inflateFrame));
    packedFrames.forEach((packed, index) => {
      if (packed.length !== PACKED_BYTES_PER_FRAME) {
        throw new Error(`About ASCII packed size mismatch at frame ${index + 1}: ${packed.length}/${PACKED_BYTES_PER_FRAME}`);
      }
      const actual = checksum(packed);
      if (actual !== FRAME_CHECKSUMS[index]) {
        throw new Error(`About ASCII checksum mismatch at frame ${index + 1}: ${actual}/${FRAME_CHECKSUMS[index]}`);
      }
    });

    const frames = packedFrames.map(unpackFrame);
    const cols = SOURCE_COLS;
    const rows = SOURCE_ROWS;
    const cellCount = cols * rows;
    const timingStart = new Float32Array(cellCount);
    const timingEnd = new Float32Array(cellCount);
    const rowBuffers = Array.from({ length: rows }, () => new Array(cols).fill(' '));

    let deck = shuffle(Array.from({ length: FRAME_COUNT }, (_, index) => index));
    let deckCursor = 0;
    let frameIndex = deck[0];
    let nextIndex = deck[1];
    let startedAt = performance.now();
    let rafId = 0;
    let cssWidth = 0;
    let cssHeight = 0;
    let cellWidth = 1;
    let cellHeight = 1;
    let renderDpr = 1;
    let textScaleX = 1;
    let transitionSerial = 0;
    let lastStaticIndex = -1;

    const chooseFollowingFrame = current => {
      deckCursor += 1;
      if (deckCursor >= deck.length - 1) {
        let nextDeck = shuffle(Array.from({ length: FRAME_COUNT }, (_, index) => index));
        if (nextDeck[0] === current && nextDeck.length > 1) {
          [nextDeck[0], nextDeck[1]] = [nextDeck[1], nextDeck[0]];
        }
        deck = nextDeck;
        deckCursor = -1;
      }
      return deck[deckCursor + 1];
    };

    const prepareTransition = () => {
      transitionSerial += 1;
      const seed = (frameIndex + 1) * 733 + (nextIndex + 1) * 1597 + transitionSerial * 409;
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
      const seed = (frameIndex + 1) * 1063 + (nextIndex + 1) * 2207 + transitionSerial * 131;

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

        let paletteIndex = Math.round((value / 255) * (palette.length - 1));
        if (morph > 0) {
          const noise = hash(seed + i * 47 + glitchTick * 131);
          if (noise < 0.08 + chaos * 0.4) {
            const offsetNoise = hash(seed + i * 71 + glitchTick * 197);
            paletteIndex = Math.max(
              0,
              Math.min(
                palette.length - 1,
                paletteIndex + Math.round((offsetNoise * 2 - 1) * (1 + chaos * 3))
              )
            );
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

    const advanceScene = () => {
      frameIndex = nextIndex;
      nextIndex = chooseFollowingFrame(frameIndex);
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
      const passed = clamp01(-stageRect.top / travel);
      const blackout = easeOutCubic(passed) * 0.92;
      hero.style.setProperty('--ascii-blackout', blackout.toFixed(3));
    };

    prepareTransition();
    resize();
    draw(performance.now(), 0);
    updateScrollState();
    hero.dataset.asciiState = 'ready';
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

    window.addEventListener('pagehide', () => {
      if (rafId) cancelAnimationFrame(rafId);
    }, { once: true });
  };

  init().catch(error => {
    drawStatus('ASCII DATA ERROR');
    console.error('About ASCII initialization failed.', error);
  });
})();
