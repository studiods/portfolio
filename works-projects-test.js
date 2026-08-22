(() => {
  'use strict';
  const grid=document.querySelector('.works-grid');
  const filter=document.querySelector('.works-test-filter');
  const trigger=document.querySelector('.works-filter-trigger');
  const options=[...document.querySelectorAll('.works-filter-option')];
  if(!grid||!filter||!trigger||!options.length)return;
  const cards=[...grid.querySelectorAll('.works-card')];
  const original=new Map(cards.map((card,index)=>[card,index]));

  const comparators={
    recent:(a,b)=>Number(b.dataset.date)-Number(a.dataset.date)||Number(a.dataset.recentRank)-Number(b.dataset.recentRank)||original.get(a)-original.get(b),
    company:(a,b)=>(a.dataset.company||'').localeCompare(b.dataset.company||'','en')||Number(a.dataset.companyRank)-Number(b.dataset.companyRank)||original.get(a)-original.get(b),
    past:(a,b)=>Number(a.dataset.date)-Number(b.dataset.date)||Number(a.dataset.recentRank)-Number(b.dataset.recentRank)||original.get(a)-original.get(b)
  };

  const close=()=>{filter.classList.remove('is-open');trigger.setAttribute('aria-expanded','false')};
  trigger.addEventListener('click',()=>{const open=!filter.classList.contains('is-open');filter.classList.toggle('is-open',open);trigger.setAttribute('aria-expanded',open?'true':'false')});
  addEventListener('click',e=>{if(!filter.contains(e.target))close()});

  const markCompanyStarts=ordered=>{
    cards.forEach(card=>card.classList.remove('is-company-first'));
    let last='';ordered.forEach(card=>{const company=card.dataset.company||'';if(company!==last){card.classList.add('is-company-first');last=company;}});
  };

  const sortCards=mode=>{
    const comparator=comparators[mode]||comparators.recent;
    const ordered=[...cards].sort(comparator);
    grid.classList.add('is-reordering');
    document.body.classList.toggle('works-company-mode',mode==='company');
    if(mode==='company')markCompanyStarts(ordered);else cards.forEach(card=>card.classList.remove('is-company-first'));
    ordered.forEach(card=>grid.appendChild(card));
    options.forEach(option=>option.classList.toggle('is-active',option.dataset.mode===mode));
    const selected=options.find(option=>option.dataset.mode===mode);if(selected)trigger.querySelector('span').textContent=selected.textContent.trim();
    close();requestAnimationFrame(()=>requestAnimationFrame(()=>grid.classList.remove('is-reordering')));
  };

  options.forEach(option=>option.addEventListener('click',()=>sortCards(option.dataset.mode)));

  const POOL='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const prepared=new WeakSet();
  const prepare=el=>{
    if(prepared.has(el))return;prepared.add(el);
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{const frag=document.createDocumentFragment();[...node.nodeValue].forEach(ch=>{if(ch===' '||ch==='\n'){frag.appendChild(document.createTextNode(ch));return;}const span=document.createElement('span');span.className='works-scramble-char';span.dataset.final=ch;span.textContent=ch;frag.appendChild(span);});node.replaceWith(frag);});
    requestAnimationFrame(()=>el.querySelectorAll('.works-scramble-char').forEach(ch=>{const w=ch.getBoundingClientRect().width;if(w>0)ch.style.width=`${w.toFixed(2)}px`;}));
  };
  const animate=el=>{prepare(el);const chars=[...el.querySelectorAll('.works-scramble-char')];chars.forEach((ch,index)=>{const final=ch.dataset.final;for(let cycle=0;cycle<3;cycle++)setTimeout(()=>{ch.textContent=POOL[(index*13+cycle*7+Math.floor(performance.now()/29))%POOL.length];},index*7+cycle*32);setTimeout(()=>{ch.textContent=final;},index*7+105);});};
  const seen=new WeakSet();
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting&&entry.intersectionRatio>.35&&!seen.has(entry.target)){seen.add(entry.target);animate(entry.target);}}),{threshold:[.2,.35,.6]});
  document.querySelectorAll('[data-card-scramble]').forEach(el=>observer.observe(el));
  sortCards('recent');
})();