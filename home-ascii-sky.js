(() => {
  'use strict';

  const root = document.querySelector('.home-ascii-sky');
  const philosophy = document.querySelector('#philosophy');
  const canvas = root?.querySelector('.home-ascii-sky__canvas');
  const ctx = canvas?.getContext('2d', { alpha: false });
  if (!root || !canvas || !ctx) return;

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const TAU = Math.PI * 2;
  const glyphs = ['.', '.', ':', '*', '+'];
  const stars = [];
  const meteors = [];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let centerX = 0;
  let centerY = 0;
  let maxRadius = 0;
  let raf = 0;
  let lastFrame = 0;
  let nextMeteorAt = performance.now() + 1800 + Math.random() * 2200;

  const rand = (min, max) => min + Math.random() * (max - min);
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const smoothstep = t => { const p = clamp(t); return p * p * (3 - 2 * p); };

  const buildStars = () => {
    stars.length = 0;

    const density = width <= 780 ? 170 : 360;

    for (let i = 0; i < density; i++) {
      const radiusBias = Math.pow(Math.random(), 0.66);
      const radius = radiusBias * maxRadius;
      const brightness = rand(0.22, 0.98);
      const speedBand = Math.random();

      let speed;
      if (speedBand < 0.48) speed = rand(0.0055, 0.0100);
      else if (speedBand < 0.86) speed = rand(0.0100, 0.0175);
      else speed = rand(0.0175, 0.028);

      stars.push({
        radius,
        angle:Math.random() * TAU,
        speed,
        size:rand(9.5, 15.5),
        brightness,
        twinkleSpeed:rand(0.45, 1.75),
        twinklePhase:Math.random() * TAU,
        twinkleAmount:rand(0.05, 0.28),
        trail:brightness > 0.68 && Math.random() < 0.42 ? Math.floor(rand(1,4)) : 0,
        glyphIndex:brightness > 0.78 ? 4 : brightness > 0.55 ? 3 : brightness > 0.34 ? 2 : 0
      });
    }
  };

  const resize = () => {
    const rect = root.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.35);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Southern-sky-like celestial pole: about 3/4 across from the left.
    centerX = width * 0.75;
    centerY = height * 0.48;

    const farthestX = Math.max(centerX, width - centerX);
    const farthestY = Math.max(centerY, height - centerY);
    maxRadius = Math.hypot(farthestX, farthestY) * 1.08;

    buildStars();
  };

  const drawStar = (star, t) => {
    const angle = star.angle + t * star.speed;
    const x = centerX + Math.cos(angle) * star.radius;
    const y = centerY + Math.sin(angle) * star.radius;

    if (x < -24 || x > width + 24 || y < -24 || y > height + 24) return;

    const twinkle =
      1 +
      Math.sin(t * star.twinkleSpeed + star.twinklePhase) * star.twinkleAmount;
    const alpha = clamp(star.brightness * twinkle, 0.06, 0.96);

    ctx.font = `${star.size}px "Averta PE","Courier New",monospace`;

    if (star.trail) {
      for (let i = star.trail; i >= 1; i--) {
        const trailAngle = angle - star.speed * (9 + i * 7);
        const tx = centerX + Math.cos(trailAngle) * star.radius;
        const ty = centerY + Math.sin(trailAngle) * star.radius;
        const trailAlpha = alpha * (0.055 + (star.trail - i + 1) * 0.035);
        ctx.fillStyle = `rgba(255,255,255,${trailAlpha.toFixed(3)})`;
        ctx.fillText('.', tx, ty);
      }
    }

    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    ctx.fillText(glyphs[star.glyphIndex], x, y);
  };

  const spawnMeteor = now => {
    const fromRight = Math.random() > 0.35;
    const startX = fromRight ? rand(width * 0.48, width * 0.96) : rand(width * 0.05, width * 0.48);
    const startY = rand(-height * 0.04, height * 0.34);
    const direction = fromRight ? -1 : 1;

    meteors.push({
      born:now,
      duration:rand(820, 1380),
      x:startX,
      y:startY,
      dx:direction * rand(width * 0.16, width * 0.34),
      dy:rand(height * 0.20, height * 0.38),
      brightness:rand(0.66, 0.96),
      trailLength:Math.floor(rand(5,9))
    });

    nextMeteorAt = now + rand(4200, 8200);
  };

  const drawMeteor = (meteor, now) => {
    const p = clamp((now - meteor.born) / meteor.duration);
    const eased = 1 - Math.pow(1 - p, 2);
    const x = meteor.x + meteor.dx * eased;
    const y = meteor.y + meteor.dy * eased;

    const fadeIn = clamp(p / 0.12);
    const fadeOut = 1 - clamp((p - 0.72) / 0.28);
    const alpha = meteor.brightness * fadeIn * fadeOut;

    ctx.font = '13px "Averta PE","Courier New",monospace';

    for (let i = meteor.trailLength; i >= 1; i--) {
      const trailP = Math.max(0, eased - i * 0.018);
      const tx = meteor.x + meteor.dx * trailP;
      const ty = meteor.y + meteor.dy * trailP;
      const trailAlpha = alpha * (1 - i / (meteor.trailLength + 1)) * 0.55;
      ctx.fillStyle = `rgba(255,255,255,${trailAlpha.toFixed(3)})`;
      ctx.fillText(i < 3 ? '+' : '.', tx, ty);
    }

    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    ctx.fillText('*', x, y);
  };

  const updateExitState = () => {
    if (!philosophy) return;

    const rect = philosophy.getBoundingClientRect();
    const start = innerHeight * 1.02;
    const end = innerHeight * 0.58;
    const p = clamp((start - rect.top) / Math.max(1, start - end));
    const eased = smoothstep(p);

    root.style.setProperty('--home-sky-blackout', (0.50 + eased * 0.50).toFixed(3));
    root.style.setProperty('--home-sky-opacity', (1 - smoothstep(clamp((p - 0.28) / 0.72))).toFixed(3));
    root.style.setProperty('--home-sky-shift', `${(-innerHeight * 0.14 * eased).toFixed(1)}px`);
  };

  const draw = now => {
    const t = now * 0.001;

    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,width,height);

    stars.forEach(star => drawStar(star,t));

    if (!reduce && now >= nextMeteorAt) spawnMeteor(now);

    for (let i = meteors.length - 1; i >= 0; i--) {
      const meteor = meteors[i];
      if (now - meteor.born > meteor.duration) {
        meteors.splice(i,1);
        continue;
      }
      drawMeteor(meteor,now);
    }
  };

  const frame = now => {
    if (now - lastFrame >= 33) {
      draw(now);
      lastFrame = now;
    }
    raf = requestAnimationFrame(frame);
  };

  resize();
  draw(performance.now());
  updateExitState();

  if (!reduce) {
    raf = requestAnimationFrame(frame);
  }

  let scrollRaf = 0;
  window.addEventListener('scroll', () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      updateExitState();
    });
  }, { passive:true });

  window.addEventListener('resize', () => {
    resize();
    draw(performance.now());
    updateExitState();
  }, { passive:true });

  window.addEventListener('pagehide', () => {
    if (raf) cancelAnimationFrame(raf);
  }, { once:true });
})();