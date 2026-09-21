(() => {
  'use strict';

  const hero = document.querySelector('.works-hero');
  const layer = hero?.querySelector('.works-ascii-bg');
  const canvas = layer?.querySelector('.works-ascii-canvas');
  const ctx = canvas?.getContext('2d', { alpha: false });

  if (!hero || !layer || !canvas || !ctx) return;

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const TAU = Math.PI * 2;
  const glyphs = [' ', '·', '~', ':', '-', '=', '+', '*', '%', '#', '@'];
  const phases = Array.from({ length: 8 }, () => Math.random() * TAU);
  const seeds = Array.from({ length: 6 }, () => 0.72 + Math.random() * 1.18);

  let width = 0;
  let height = 0;
  let cols = 0;
  let rows = 0;
  let cellX = 15;
  let cellY = 18;
  let raf = 0;
  let lastFrame = 0;
  let visible = true;
  let scrollTicking = false;

  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const smoothstep = t => t * t * (3 - 2 * t);
  const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);

  const pseudo = (x, y) => {
    const n = Math.sin(
      x * (12.9898 + seeds[0]) +
      y * (78.233 + seeds[1]) +
      phases[7]
    ) * 43758.5453;
    return n - Math.floor(n);
  };

  const resize = () => {
    const rect = layer.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cellX = width <= 780 ? 12 : 15;
    cellY = width <= 780 ? 16 : 18;
    cols = Math.ceil(width / cellX) + 2;
    rows = Math.ceil(height / cellY) + 2;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.max(9, cellY * 0.68)}px "Averta PE", "Courier New", monospace`;
  };

  const fieldAt = (nx, ny, t, col, row) => {
    const slowX = nx * TAU;
    const slowY = ny * TAU;

    const centerA =
      0.50 +
      0.135 * Math.sin(slowX * (0.88 * seeds[0]) + t * 0.27 + phases[0]) +
      0.055 * Math.sin(slowX * 2.15 - t * 0.16 + phases[1]) +
      0.025 * Math.sin(slowY * 0.8 + t * 0.11 + phases[2]);

    const centerB =
      0.50 +
      0.205 * Math.sin(slowX * (0.48 * seeds[2]) - t * 0.19 + phases[3]) +
      0.048 * Math.sin(slowX * 1.62 + t * 0.23 + phases[4]);

    const distanceA = Math.abs(ny - centerA);
    const distanceB = Math.abs(ny - centerB);

    const ribbonA = Math.exp(-(distanceA * distanceA) / 0.0068);
    const ribbonB = Math.exp(-(distanceB * distanceB) / 0.0105) * 0.62;

    const ripple =
      0.5 +
      0.5 * Math.sin(
        slowX * (2.1 * seeds[3]) +
        slowY * 0.72 +
        t * 0.62 +
        phases[5] +
        Math.sin(slowY * 1.6 - t * 0.14 + phases[6]) * 0.8
      );

    const haze =
      0.5 +
      0.5 * Math.sin(
        slowX * 0.54 -
        slowY * (0.68 * seeds[4]) +
        t * 0.12 +
        phases[2]
      );

    const drift = pseudo(col * 0.17 + t * 0.012, row * 0.21 - t * 0.007);
    const wave = Math.max(ribbonA, ribbonB);

    return clamp(
      wave * (0.48 + ripple * 0.52) +
      haze * 0.08 +
      (drift - 0.5) * 0.08
    );
  };

  const draw = now => {
    const t = now * 0.001;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    for (let row = -1; row < rows; row++) {
      const y = (row + 0.5) * cellY;
      const ny = y / height;

      for (let col = -1; col < cols; col++) {
        const x = (col + 0.5) * cellX;
        const nx = x / width;
        const intensity = fieldAt(nx, ny, t, col, row);

        if (intensity < 0.105) continue;

        const flicker = pseudo(col * 0.33 + Math.floor(t * 1.6), row * 0.27);
        const shaped = clamp(intensity * 0.93 + flicker * 0.06);
        const glyphIndex = Math.min(
          glyphs.length - 1,
          Math.floor(shaped * (glyphs.length - 1))
        );

        const alpha = clamp(0.08 + shaped * 0.72, 0, 0.82);
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fillText(glyphs[glyphIndex], x, y);
      }
    }
  };

  const frame = now => {
    if (!reduce && visible && now - lastFrame >= 34) {
      draw(now);
      lastFrame = now;
    }
    raf = requestAnimationFrame(frame);
  };

  const updateScrollState = () => {
    const y = Math.max(0, window.scrollY || window.pageYOffset || 0);

    // Match About's 30% starting veil, then darken immediately on scroll.
    const darkenProgress = clamp(y / 120);
    const fadeProgress = clamp((y - 18) / 210);

    const blackout = 0.30 + easeOut(darkenProgress) * 0.70;
    const opacity = 1 - smoothstep(fadeProgress);

    layer.style.setProperty('--works-ascii-blackout', blackout.toFixed(3));
    layer.style.setProperty('--works-ascii-opacity', opacity.toFixed(3));
    visible = opacity > 0.015;

    if (visible && reduce) draw(performance.now());
  };

  const requestScrollState = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      updateScrollState();
      scrollTicking = false;
    });
  };

  resize();
  draw(performance.now());
  updateScrollState();

  if (!reduce) raf = requestAnimationFrame(frame);

  window.addEventListener('scroll', requestScrollState, { passive: true });
  window.addEventListener('resize', () => {
    resize();
    draw(performance.now());
    updateScrollState();
  }, { passive: true });

  window.addEventListener('pagehide', () => {
    if (raf) cancelAnimationFrame(raf);
  }, { once: true });
})();