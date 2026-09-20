(() => {
  'use strict';

  const SELECTOR = '#brand .himart-appliance-flow';
  let mounted = false;

  const mount = () => {
    if (mounted) return;
    const flow = document.querySelector(SELECTOR);
    if (!flow) return;
    mounted = true;

    const sequence = [
      ...flow.querySelectorAll('.himart-appliance-flow__stage, .himart-appliance-flow__connector')
    ];
    sequence.forEach((el, i) => el.style.setProperty('--flow-i', String(i)));

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const activate = () => flow.classList.add('is-active');

    if (reduce || !('IntersectionObserver' in window)) {
      activate();
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.target.offsetParent === null) return;
        activate();
        observer.disconnect();
      });
    }, { threshold:.18, rootMargin:'0px 0px -8% 0px' });

    observer.observe(flow);
  };

  const start = () => {
    mount();
    if (mounted || !('MutationObserver' in window)) return;

    const observer = new MutationObserver(() => {
      mount();
      if (mounted) observer.disconnect();
    });
    observer.observe(document.getElementById('live-main') || document.body, {
      childList:true,
      subtree:true
    });

    window.setTimeout(() => {
      mount();
      observer.disconnect();
    }, 12000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once:true });
  } else {
    start();
  }
})();