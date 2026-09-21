(() => {
  'use strict';

  const hero = document.querySelector('.works-hero');
  const layer = hero?.querySelector('.works-ascii-bg');
  const canvas = layer?.querySelector('.works-ascii-canvas');
  const ctx = canvas?.getContext('2d', { alpha: false });

  if (!hero || !layer || !canvas || !ctx) return;

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const TAU = Math.PI * 2;

  const oceanGlyphs = [' ', '·', '~', ':', '-', '=', '+', '*', '%', '#'];
  const foamGlyphs = ['~', '=', '+', '*', '#', '@'];
  const sandGlyphs = [' ', ' ', ' ', '·', '.', '·', ':'];

  const phases = Array.from({ length: 12 }, () => Math.random() * TAU);
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
      phases[11]
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

  // Reference-like top view: the coast sits at roughly 72–75% of the frame,
  // with a slight diagonal and naturally broken edge.
  const shorelineX = (ny, t) => {
    const diagonal = (ny - 0.5) * 0.034;
    const largeBend = Math.sin(ny * TAU * 0.95 + phases[0]) * 0.012;
    const smallBend = Math.sin(ny * TAU * 3.1 - t * 0.18 + phases[1]) * 0.006;
    const breathing = Math.sin(t * 0.58 + phases[2]) * 0.0065;
    return 0.725 + diagonal + largeBend + smallBend + breathing;
  };

  const oceanField = (nx, ny, shoreX, t, col, row) => {
    const distanceToShore = Math.max(0, shoreX - nx);

    // Slightly faster than the previous version, but still calm.
    const speedA = 0.31;
    const speedB = 0.43;
    const speedC = 0.22;

    const verticalWarp =
      Math.sin(ny * TAU * 1.25 + phases[3]) * 0.080 +
      Math.sin(ny * TAU * 3.7 - t * 0.22 + phases[4]) * 0.028;

    const phaseA = fract(
      nx * (5.25 * seeds[2]) -
      t * speedA +
      verticalWarp
    );

    const phaseB = fract(
      nx * (8.6 * seeds[3]) -
      t * speedB +
      Math.sin(ny * TAU * 2.2 + phases[5]) * 0.060
    );

    const phaseC = fract(
      nx * (3.35 * seeds[4]) -
      t * speedC +
      Math.sin(ny * TAU * 1.6 + phases[6]) * 0.048
    );

    const crestA = Math.exp(-Math.pow((phaseA - 0.5) / 0.072, 2));
    const crestB = Math.exp(-Math.pow((phaseB - 0.5) / 0.050, 2)) * 0.34;
    const crestC = Math.exp(-Math.pow((phaseC - 0.5) / 0.095, 2)) * 0.18;

    const shoreGain = 1 - clamp(distanceToShore / 0.30);
    const deepGain = clamp(distanceToShore / 0.74, 0.22, 1);

    // Broad water texture keeps the left side feeling like open sea rather than empty black.
    const swell =
      0.5 +
      0.5 * Math.sin(
        nx * TAU * 1.65 -
        t * 0.64 +
        Math.sin(ny * TAU * 1.18 + phases[7]) * 0.72
      );

    const seaTexture =
      0.125 +
      swell * 0.165 +
      pseudo(col * 0.23 + t * 0.020, row * 0.29) * 0.085;

    const foam =
      (crestA + crestB + crestC) *
      (0.32 + shoreGain * 0.68);

    return {
      intensity: clamp(seaTexture * deepGain + foam),
      foam: clamp(foam),
      shoreGain
    };
  };

  // A primary breaking line advances toward shore, spreads, then resets offshore.
  // This gives a recognizable real-wave cycle instead of endless equal-speed stripes.
  const breakerField = (distanceToShore, ny, t) => {
    const cycle = fract(t * 0.255 + phases[8] / TAU);
    const eased = 1 - Math.pow(1 - cycle, 1.55);

    const start = 0.145;
    const end = 0.010;
    const center =
      start + (end - start) * eased +
      Math.sin(ny * TAU * 1.35 + phases[9]) * 0.010 +
      Math.sin(ny * TAU * 4.4 - t * 0.32 + phases[10]) * 0.0045;

    const widthBand = 0.016 + eased * 0.014;
    const band = Math.exp(-Math.pow((distanceToShore - center) / widthBand, 2));

    // Fade the breaker just before the cycle restarts to avoid a visible jump.
    const life = smoothstep(clamp(cycle / 0.10)) * (1 - smoothstep(clamp((cycle - 0.84) / 0.16)));
    return band * life;
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

        // BEACH — mostly quiet, pale-grain equivalent in monochrome ASCII.
        if (coastDistance > 0) {
          const grain = pseudo(col * 0.41 + 17.2, row * 0.37 + 9.8);
          const wetSand = 1 - clamp(coastDistance / 0.105);

          if (grain < (0.50 - wetSand * 0.09)) continue;

          const index = Math.min(
            sandGlyphs.length - 1,
            Math.floor(grain * sandGlyphs.length)
          );

          const alpha = clamp(
            0.045 + grain * 0.13 + wetSand * 0.06,
            0.045,
            0.23
          );

          ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
          ctx.fillText(sandGlyphs[index], x, y);
          continue;
        }

        // OCEAN — left side, with several offshore swells plus a main breaking wave.
        const ocean = oceanField(nx, ny, shoreX, t, col, row);
        const distanceToShore = Math.max(0, shoreX - nx);
        const breaker = breakerField(distanceToShore, ny, t);

        // Persistent shoreline wash, moving slightly in and out.
        const tide =
          0.009 +
          0.008 * (
            0.5 +
            0.5 * Math.sin(t * 1.05 + ny * TAU * 1.18 + phases[2])
          );

        const shoreFoam = Math.exp(
          -Math.pow((distanceToShore - tide) / 0.010, 2)
        );

        // Breaker becomes brighter and more fragmented near the shoreline.
        const breakNoise = 0.78 + pseudo(col * 0.63 + t * 0.11, row * 0.47) * 0.35;
        const breakerFoam = breaker * breakNoise * (0.68 + ocean.shoreGain * 0.42);

        const foamStrength = clamp(
          Math.max(ocean.foam, shoreFoam, breakerFoam)
        );

        const intensity = clamp(
          ocean.intensity +
          shoreFoam * 0.88 +
          breakerFoam * 1.08
        );

        if (intensity < 0.108) continue;

        let glyph;
        let alpha;

        if (foamStrength > 0.32) {
          const foamIndex = Math.min(
            foamGlyphs.length - 1,
            Math.floor(clamp(foamStrength) * foamGlyphs.length)
          );
          glyph = foamGlyphs[foamIndex];
          alpha = clamp(0.30 + foamStrength * 0.60, 0.30, 0.92);
        } else {
          const flicker = pseudo(col * 0.31 + Math.floor(t * 1.65), row * 0.23);
          const shaped = clamp(intensity * 0.90 + flicker * 0.052);
          const index = Math.min(
            oceanGlyphs.length - 1,
            Math.floor(shaped * (oceanGlyphs.length - 1))
          );
          glyph = oceanGlyphs[index];
          alpha = clamp(0.065 + shaped * 0.47, 0.065, 0.58);
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

    const darkenProgress = clamp(y / 144);
    const fadeProgress = clamp((y - 18) / 210);

    const blackout = 0.60 + easeOut(darkenProgress) * 0.40;
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