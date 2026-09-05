/* HIMART Design System — one shared global navigation source. */
(() => {
  const links = [
    { label: 'Home', href: './index.html', page: 'home' },
    { label: 'About', href: './about.html', page: 'about' },
    { label: 'Works', href: './works.html', page: 'works' },
    { label: 'Contact', href: './index.html#contact', page: 'contact' }
  ];

  const currentPage = () => {
    const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (file.startsWith('himart') || file === 'works.html') return 'works';
    if (file === 'about.html') return 'about';
    return 'home';
  };

  const mount = () => {
    document.querySelectorAll('.top').forEach(node => node.remove());
    const active = currentPage();
    const items = links.map(link =>
      '<a href="' + link.href + '"' + (link.page === active ? ' aria-current="page"' : '') + '>' + link.label + '</a>'
    ).join('');
    document.body.insertAdjacentHTML('afterbegin',
      '<nav class="top hm-gnb" aria-label="Global navigation"><div class="top-center">' + items + '</div></nav>'
    );
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
