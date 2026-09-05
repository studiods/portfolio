/* HIMART Design System — final scramble layer
   Loaded after content reconciliation so text replacement cannot cancel the effect. */
(() => {
  const glyphs = '가나다라마바사아자차카타파하ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const done = new WeakSet();
  const textNodes = el => {
    const out = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) out.push(walker.currentNode);
    return out;
  };
  const run = el => {
    if (!el || done.has(el)) return;
    done.add(el);
    const nodes = textNodes(el);
    const originals = nodes.map(n => n.nodeValue);
    const total = 32;
    let frame = 0;
    const tick = () => {
      nodes.forEach((node, index) => {
        const original = originals[index] || '';
        node.nodeValue = [...original].map((ch, i) => {
          if (/\s/.test(ch) || ch === '·') return ch;
          const threshold = (i / Math.max(1, original.length)) * total;
          return frame >= threshold ? ch : glyphs[Math.floor(Math.random() * glyphs.length)];
        }).join('');
      });
      frame += 1;
      if (frame <= total) requestAnimationFrame(tick);
      else nodes.forEach((n, i) => { n.nodeValue = originals[i]; });
    };
    requestAnimationFrame(tick);
  };
  const setup = () => {
    const hero = document.querySelector('.hm-movie-copy .hm-title');
    if (hero) run(hero);
    const chapters = [...document.querySelectorAll('#brand .hm-section-title, #data .hm-section-title, #journey .hm-section-title, #direction .hm-section-title')];
    if (!chapters.length) return false;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
      }), { threshold: .25, rootMargin: '0px 0px -10% 0px' });
      chapters.forEach(el => io.observe(el));
    } else chapters.forEach(run);
    return true;
  };
  const boot = () => {
    if (setup()) {
      clearInterval(retry);
      setTimeout(() => {
        const hero = document.querySelector('.hm-movie-copy .hm-title');
        if (hero && !done.has(hero)) run(hero);
      }, 1200);
    }
  };
  const retry = setInterval(boot, 250);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  setTimeout(() => clearInterval(retry), 12000);
})();