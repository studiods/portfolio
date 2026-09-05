/* HIMART Design System — deterministic scramble animation */
(() => {
  const glyphs = '가나다라마바사아자차카타파하ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const states = new WeakMap();
  let observer = null;
  let targets = [];

  const collectText = el => {
    const nodes = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  };

  const play = (el, force = false) => {
    if (!el) return;
    const state = states.get(el) || { running:false, played:false };
    if (state.running || (!force && state.played)) return;
    state.running = true;
    state.played = true;
    states.set(el, state);
    const nodes = collectText(el);
    const originals = nodes.map(n => n.nodeValue || '');
    const total = 32;
    let frame = 0;
    const tick = () => {
      nodes.forEach((node, index) => {
        const original = originals[index];
        node.nodeValue = [...original].map((ch, i) => {
          if (/\s/.test(ch) || ch === '·') return ch;
          const threshold = (i / Math.max(1, original.length)) * total;
          return frame >= threshold ? ch : glyphs[Math.floor(Math.random() * glyphs.length)];
        }).join('');
      });
      frame += 1;
      if (frame <= total) requestAnimationFrame(tick);
      else {
        nodes.forEach((node, index) => { node.nodeValue = originals[index]; });
        state.running = false;
      }
    };
    requestAnimationFrame(tick);
  };

  const setup = () => {
    const hero = document.querySelector('.hm-movie-copy .hm-title');
    const chapters = [...document.querySelectorAll('#brand .hm-section-title, #data .hm-section-title, #journey .hm-section-title, #direction .hm-section-title')];
    const next = [hero, ...chapters].filter(Boolean);
    if (!next.length) return false;
    targets = next;
    if (hero) play(hero);
    if (observer) observer.disconnect();
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const state = states.get(entry.target) || { running:false, played:false };
          if (entry.isIntersecting && !state.played) play(entry.target);
          if (!entry.isIntersecting) { state.played = false; states.set(entry.target, state); }
        });
      }, { threshold:.18, rootMargin:'0px 0px -10% 0px' });
      chapters.forEach(el => observer.observe(el));
    } else chapters.forEach(el => play(el, true));
    return true;
  };

  let attempts = 0;
  const retry = setInterval(() => {
    if (setup() || ++attempts > 48) clearInterval(retry);
  }, 250);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, { once:true });
  else setup();
  window.addEventListener('load', () => { setup(); setTimeout(setup, 700); }, { once:true });
})();