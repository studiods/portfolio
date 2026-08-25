(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;

  ['brand','data','journey','direction'].forEach(id=>{
    const section=main.querySelector(`#${id}`);
    const wrap=section?.querySelector(':scope > .hm-wrap');
    if(!section||!wrap||wrap.dataset.stickyLayoutMounted==='1')return;

    const children=[...wrap.children];
    const head=children.find(el=>el.classList?.contains('hm-section-head'));
    if(!head)return;

    const layout=document.createElement('div');
    layout.className='hm-sticky-layout';
    layout.dataset.chapter=id;

    const rail=document.createElement('div');
    rail.className='hm-sticky-rail';

    const content=document.createElement('div');
    content.className='hm-sticky-content';

    wrap.appendChild(layout);
    layout.append(rail,content);
    rail.appendChild(head);

    children.forEach(el=>{
      if(el!==head)content.appendChild(el);
    });

    wrap.dataset.stickyLayoutMounted='1';
    section.classList.add('hm-sticky-chapter');
  });
})();
