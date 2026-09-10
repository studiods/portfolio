/* AIMMO hero video sequence — two-layer preloaded crossfade.
   Plays aimmo_system_01 → 02 → 03 → 04 → repeat without changing HIMART hero behavior. */
(() => {
  'use strict';
  const primary = document.querySelector('.aimmo-system-page [data-aimmo-video-sequence]');
  if (!primary) return;

  const sources = (primary.dataset.aimmoVideoSequence || '')
    .split('|').map(v => v.trim()).filter(Boolean);
  if (sources.length < 2) return;

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    primary.loop = true;
    primary.play?.().catch?.(() => {});
    return;
  }

  primary.loop = false;
  primary.removeAttribute('loop');
  primary.muted = true;
  primary.playsInline = true;
  primary.classList.add('is-aimmo-sequence-front');
  primary.style.opacity = '1';

  const secondary = primary.cloneNode(true);
  secondary.removeAttribute('data-aimmo-video-sequence');
  secondary.querySelectorAll('source').forEach(n => n.remove());
  secondary.src = sources[1];
  secondary.classList.remove('is-aimmo-sequence-front');
  secondary.classList.add('is-aimmo-sequence-back');
  secondary.style.opacity = '0';
  secondary.pause();
  primary.parentNode.insertBefore(secondary, primary);

  let current = primary;
  let next = secondary;
  let index = 0;
  let switching = false;

  const loadNext = () => {
    const nextIndex = (index + 1) % sources.length;
    if (next.src !== new URL(sources[nextIndex], location.href).href) {
      next.src = sources[nextIndex];
      next.preload = 'auto';
      next.load();
    }
  };

  const finishSwitch = () => {
    current.pause();
    current.style.opacity = '0';
    [current, next] = [next, current];
    index = (index + 1) % sources.length;
    current.style.opacity = '1';
    next.style.opacity = '0';
    switching = false;
    loadNext();
  };

  const beginSwitch = () => {
    if (switching) return;
    switching = true;
    const play = next.play?.();
    if (play && play.catch) play.catch(() => {});
    requestAnimationFrame(() => {
      next.style.opacity = '1';
      current.style.opacity = '0';
      window.setTimeout(finishSwitch, 360);
    });
  };

  const monitor = () => {
    if (!current.duration || switching) return;
    if (current.duration - current.currentTime <= .34) beginSwitch();
  };

  primary.addEventListener('timeupdate', monitor);
  secondary.addEventListener('timeupdate', monitor);
  primary.addEventListener('ended', beginSwitch);
  secondary.addEventListener('ended', beginSwitch);

  loadNext();
  primary.play?.().catch?.(() => {});
})();
