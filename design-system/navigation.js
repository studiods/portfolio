/*
  Portfolio global navigation — one markup source for index and all detail pages.
  The structure and visual rules are taken from index.html.
*/
(() => {
  const links = [
    { label: 'Home', href: './index.html', page: 'home' },
    { label: 'About', href: './about.html', page: 'about' },
    { label: 'Works', href: './works.html', page: 'works' },
    { label: 'Contact', href: './index.html#contact', page: 'contact' }
  ];
  const currentPage = () => {
    const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (file === 'about.html') return 'about';
    if (file !== 'index.html' && file !== '') return 'works';
    return 'home';
  };
  const mount = () => {
    document.querySelectorAll('body > .top').forEach(node => node.remove());
    const active = currentPage();
    const items = links.map(({label,href,page}) =>
      '<a href="' + href + '"' + (page === active ? ' aria-current="page"' : '') + '>' + label + '</a>'
    ).join('');
    document.body.insertAdjacentHTML('afterbegin',
      '<nav class="top" aria-label="Global navigation"><div class="top-center">' + items + '</div></nav>'
    );
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();