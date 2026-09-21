(() => {
  'use strict';

  const hero = document.querySelector('.works-hero');
  const layer = hero?.querySelector('.works-ascii-bg');
  const canvas = layer?.querySelector('.works-ascii-canvas');
  const ctx = canvas?.getContext('2d', { alpha: false });

  if (!hero || !layer || !canvas || !ctx) return;

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const TAU = Math.PI * 2;

  const oceanGlyphs = [' ', '·', '~', ':', '-', '=', '+', '*', '%', '#', '@'];
  const foamGlyphs = ['~', '=', '+', '*', '#', '@'];
  const sandGlyphs = [' ', ' ', '·', '.', '·', ':'];

  const phases = Array.from({ length: 10 }, () => Math.random() * TAU);
  const seeds = Array.from({ length: 8 }, () => 0.78 + Math.random() * 0.9);

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
  const fract = v => v - Math.floor(v);

  const pseudo = (x, y) => {
    const n = Math.sin(
      x * (12.9898 + seeds[0]) +
      y * (78.233 + seeds[1]) +
      phases[9]
    ) * 43758.5453;
    return fract(n);
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

  // Vertical shoreline around x=75%, viewed from directly above.
  // Tiny y-dependent bends keep the coast organic without becoming noisy.
  const shorelineX = (ny, t) => {
    const slowTide = Math.sin(t * 0.16 + phases[0]) * 0.006;
    const bendA = Math.sin(ny * TAU * 1.05 + phases[1]) * 0.013;
    const bendB = Math.sin(ny * TAU * 2.7 - t * 0.055 + phases[2]) * 0.006;
    return 0.755 + slowTide + bendA + bendB;
  };

  // Wave crests travel from left to right toward the beach.
  const oceanField = (nx, ny, shoreX, t, col, row) => {
    const distanceToShore = Math.max(0, shoreX - nx);
    const verticalDrift =
      Math.sin(ny * TAU * 1.35 + phases[3]) * 0.085 +
      Math.sin(ny * TAU * 3.2 - t * 0.08 + phases[4]) * 0.025;

    const travelling =
      nx * (5.1 * seeds[2]) -
      t * 0.115 +
      verticalDrift;

    const travelling2 =
      nx * (8.2 * seeds[3]) -
      t * 0.165 +
      Math.sin(ny * TAU * 2.15 + phases[5]) * 0.055;

    const phaseA = fract(travelling);
    const phaseB = fract(travelling2);

    // Narrow, soft foam lines inside broader low-contrast swells.
    const crestA = Math.exp(-Math.pow((phaseA - 0.5) / 0.075, 2));
    const crestB = Math.exp(-Math.pow((phaseB - 0.5) / 0.055, 2)) * 0.42;

    const swell =
      0.5 +
      0.5 * Math.sin(
        nx * TAU * 1.9 -
        t * 0.34 +
        Math.sin(ny * TAU * 1.25 + phases[6]) * 0.72
      );

    const shoreGain = 1 - clamp(distanceToShore / 0.28);
    const deepGain = clamp(distanceToShore / 0.72, 0.2, 1);

    const seaTexture =
      0.16 +
      swell * 0.20 +
      pseudo(col * 0.23 + t * 0.008, row * 0.29) * 0.08;

    const foam = (crestA + crestB) * (0.38 + shoreGain * 0.62);

    return {
      intensity: clamp(seaTexture * deepGain + foam),
      foam: clamp(foam),
      shoreGain
    };
  };

  const draw = now => {
    const t = now * 0.001;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    for (let row = -1; row < rows; row++) {
      const y = (row + 0.5) * cellY;
      const ny = y / height;
      const shoreX = shorelineX(ny, t);

      for (let col = -1; col < cols; col++) {
        const x = (col + 0.5) * cellX;
        const nx = x / width;
        const coastDistance = nx - shoreX;

        // BEACH — right 1/4. Sparse, quiet ASCII grain.
        if (coastDistance > 0) {
          const grain = pseudo(col * 0.41 + 17.2, row * 0.37 + 9.8);
          const wetSand = 1 - clamp(coastDistance / 0.10);

          if (grain < (0.42 - wetSand * 0.08)) continue;

          const index = Math.min(
            sandGlyphs.length - 1,
            Math.floor(grain * sandGlyphs.length)
          );
          const alpha = clamp(0.055 + grain * 0.15 + wetSand * 0.07, 0.05, 0.27);

          ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
          ctx.fillText(sandGlyphs[index], x, y);
          continue;
        }

        // OCEAN — left 3/4.
        const ocean = oceanField(nx, ny, shoreX, t, col, row);
        const distanceToShore = Math.max(0, shoreX - nx);

        // Thin shoreline foam gently breathes in/out while the offshore crests advance right.
        const tide =
          0.010 +
          0.005 * (
            0.5 +
            0.5 * Math.sin(t * 0.42 + ny * TAU * 1.2 + phases[7])
          );

        const shoreFoam = Math.exp(
          -Math.pow((distanceToShore - tide) / 0.011, 2)
        );

        const foamStrength = clamp(Math.max(ocean.foam, shoreFoam));
        const intensity = clamp(ocean.intensity + shoreFoam * 0.88);

        if (intensity < 0.115) continue;

        let glyph;
        let alpha;

        if (foamStrength > 0.36) {
          const foamIndex = Math.min(
            foamGlyphs.length - 1,
            Math.floor(clamp(foamStrength) * foamGlyphs.length)
          );
          glyph = foamGlyphs[foamIndex];
          alpha = clamp(0.30 + foamStrength * 0.58, 0.30, 0.90);
        } else {
          const flicker = pseudo(col * 0.31 + Math.floor(t * 0.85), row * 0.23);
          const shaped = clamp(intensity * 0.88 + flicker * 0.055);
          const index = Math.min(
            oceanGlyphs.length - 1,
            Math.floor(shaped * (oceanGlyphs.length - 1))
          );
          glyph = oceanGlyphs[index];
          alpha = clamp(0.07 + shaped * 0.48, 0.07, 0.58);
        }

        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fillText(glyph, x, y);
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

    // Keep the About-like 30% veil. As soon as scrolling begins,
    // the scene darkens quickly and then disappears.
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