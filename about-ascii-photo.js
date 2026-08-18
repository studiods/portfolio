(() => {
  'use strict';

  const hero = document.querySelector('.about-ascii-hero');
  const stage = document.querySelector('.about-ascii-stage');
  const canvas = document.querySelector('.about-ascii-canvas');
  const ctx = canvas?.getContext('2d', { alpha: false });
  const meta = window.ABOUT_ASCII_PHOTO_META;
  const encoded = window.ABOUT_ASCII_FRAME_B64;

  if (!hero || !stage || !canvas || !ctx || !meta || !Array.isArray(encoded)) return;

  const COLS = Number(meta.width) || 192;
  const ROWS = Number(meta.height) || 108;
  const COUNT = Number(meta.count) || 7;
  const PACKED = Math.ceil(COLS * ROWS / 2);
  const SOURCE_RATIO = COLS / ROWS;
  const PALETTE = ' .,:;-=+*#%@';
  const SCENE_MS = 1500;
  const HOLD_MS = 960;
  const MORPH_MS = 540;
  const GLITCH_MS = 48;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };
  const ease = value => 1 - Math.pow(1 - clamp(value), 3);
  const hash = value => {
    let x = value | 0;
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967295;
  };
  const shuffle = values => {
    const copy = values.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const b64 = value => {
    const string = atob(value);
    const bytes = new Uint8Array(string.length);
    for (let i = 0; i < string.length; i += 1) bytes[i] = string.charCodeAt(i);
    return bytes;
  };
  const inflate = async value => {
    if (typeof DecompressionStream !== 'function') throw new Error('DecompressionStream unavailable');
    const stream = new Blob([b64(value)]).stream().pipeThrough(new DecompressionStream('deflate'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  };
  const unpack = packed => {
    const frame = new Uint8Array(COLS * ROWS);
    let target = 0;
    for (let i = 0; i < packed.length && target < frame.length; i += 1) {
      const byte = packed[i];
      frame[target] = ((byte >>> 4) & 15) * 17;
      if (target + 1 < frame.length) frame[target + 1] = (byte & 15) * 17;
      target += 2;
    }
    return frame;
  };

  const status = text => {
    const rect = hero.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = 'rgba(244,242,237,.72)';
    ctx.font = '12px ui-monospace,monospace';
    ctx.fillText(text, 18, 18);
  };

  (async () => {
    status('ASCII LOADING');
    if (encoded.length !== COUNT) throw new Error(`frame count ${encoded.length}/${COUNT}`);

    const packedFrames = await Promise.all(encoded.map(inflate));
    packedFrames.forEach((packed, index) => {
      if (packed.length !== PACKED) throw new Error(`frame ${index + 1} size ${packed.length}/${PACKED}`);
    });

    const frames = packedFrames.map(unpack);
    const cells = COLS * ROWS;
    const starts = new Float32Array(cells);
    const ends = new Float32Array(cells);
    const lines = Array.from({ length: ROWS }, () => new Array(COLS).fill(' '));

    let deck = shuffle([...Array(COUNT).keys()]);
    let cursor = 0;
    let current = deck[0];
    let next = deck[1];
    let began = performance.now();
    let serial = 0;
    let raf = 0;
    let last = -1;

    let width = 1;
    let height = 1;
    let drawX = 0;
    let drawY = 0;
    let drawWidth = 1;
    let drawHeight = 1;
    let cellWidth = 1;
    let cellHeight = 1;
    let dpr = 1;
    let scaleX = 1;

    const following = now => {
      cursor += 1;
      if (cursor >= deck.length - 1) {
        const replacement = shuffle([...Array(COUNT).keys()]);
        if (replacement[0] === now && replacement.length > 1) {
          [replacement[0], replacement[1]] = [replacement[1], replacement[0]];
        }
        deck = replacement;
        cursor = -1;
      }
      return deck[cursor + 1];
    };

    const prep = () => {
      serial += 1;
      const seed = (current + 1) * 733 + (next + 1) * 1597 + serial * 409;
      for (let i = 0; i < cells; i += 1) {
        const start = hash(seed + i * 19) * 0.48;
        const duration = 0.28 + hash(seed + i * 41) * 0.32;
        starts[i] = start;
        ends[i] = Math.min(1, start + duration);
      }
    };

    const resize = () => {
      const rect = hero.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      /*
        Cover the hero at every viewport ratio. The source remains centered;
        only the overflow is clipped, so no horizontal or vertical bars can
        appear. On mobile the square hero therefore becomes a centered 1:1
        crop of the same 16:9 ASCII frame.
      */
      const heroRatio = width / height;
      if (heroRatio > SOURCE_RATIO) {
        drawWidth = width;
        drawHeight = drawWidth / SOURCE_RATIO;
        drawX = 0;
        drawY = (height - drawHeight) / 2;
      } else {
        drawHeight = height;
        drawWidth = drawHeight * SOURCE_RATIO;
        drawX = (width - drawWidth) / 2;
        drawY = 0;
      }

      cellWidth = drawWidth / COLS;
      cellHeight = drawHeight / ROWS;
      const fontSize = Math.max(1.8, cellHeight * 1.02);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${fontSize}px ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      scaleX = cellWidth / Math.max(0.01, ctx.measureText('M').width);
      last = -1;
    };

    const draw = (now, morph = 0) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      const currentFrame = frames[current];
      const nextFrame = frames[next];
      const chaos = morph > 0 ? Math.sin(Math.PI * morph) : 0;
      const tick = Math.floor(now / GLITCH_MS);
      const seed = (current + 1) * 1063 + (next + 1) * 2207 + serial * 131;

      for (let i = 0; i < cells; i += 1) {
        let value = currentFrame[i];
        if (morph > 0) {
          const start = starts[i];
          const end = ends[i];
          const local = morph <= start
            ? 0
            : morph >= end
              ? 1
              : smooth((morph - start) / Math.max(0.001, end - start));
          value = currentFrame[i] + (nextFrame[i] - currentFrame[i]) * local;
        }

        let paletteIndex = Math.round((value / 255) * (PALETTE.length - 1));
        if (morph > 0 && hash(seed + i * 47 + tick * 131) < 0.08 + chaos * 0.4) {
          paletteIndex = Math.max(
            0,
            Math.min(
              PALETTE.length - 1,
              paletteIndex + Math.round((hash(seed + i * 71 + tick * 197) * 2 - 1) * (1 + chaos * 3))
            )
          );
        }
        lines[Math.floor(i / COLS)][i % COLS] = PALETTE[paletteIndex];
      }

      ctx.setTransform(dpr * scaleX, 0, 0, dpr, drawX * dpr, drawY * dpr);
      ctx.fillStyle = 'rgba(244,242,237,.88)';
      for (let row = 0; row < ROWS; row += 1) {
        ctx.fillText(lines[row].join(''), 0, row * cellHeight + cellHeight * 0.54);
      }
    };

    const advance = () => {
      current = next;
      next = following(current);
      prep();
      last = -1;
    };

    const loop = now => {
      let elapsed = now - began;
      while (elapsed >= SCENE_MS) {
        began += SCENE_MS;
        advance();
        elapsed = now - began;
      }

      const morph = elapsed <= HOLD_MS ? 0 : clamp((elapsed - HOLD_MS) / MORPH_MS);
      if (morph === 0) {
        if (last !== current) {
          draw(now, 0);
          last = current;
        }
      } else {
        draw(now, morph);
        last = -1;
      }
      raf = requestAnimationFrame(loop);
    };

    const scrollState = () => {
      const stageRect = stage.getBoundingClientRect();
      const heroRect = hero.getBoundingClientRect();
      const travel = Math.max(1, stage.offsetHeight - heroRect.height);
      const passed = clamp(-stageRect.top / travel);
      hero.style.setProperty('--ascii-blackout', (ease(passed) * 0.92).toFixed(3));
    };

    prep();
    resize();
    draw(performance.now(), 0);
    scrollState();
    hero.dataset.asciiState = 'photo-ready';

    if (!reduced) raf = requestAnimationFrame(loop);

    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        scrollState();
        ticking = false;
      });
    }, { passive: true });

    addEventListener('resize', () => {
      resize();
      draw(performance.now(), 0);
      scrollState();
    }, { passive: true });

    addEventListener('pagehide', () => {
      if (raf) cancelAnimationFrame(raf);
    }, { once: true });
  })().catch(error => {
    status('ASCII DATA ERROR');
    console.error('About photo ASCII failed.', error);
  });
})();
