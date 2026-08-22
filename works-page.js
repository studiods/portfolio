(() => {
  'use strict';
  const grid=document.querySelector('.works-grid');
  const filter=document.querySelector('.works-filter');
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
  trigger.addEventListener('click',()=>{
    const open=!filter.classList.contains('is-open');
    filter.classList.toggle('is-open',open);
    trigger.setAttribute('aria-expanded',open?'true':'false');
  });
  addEventListener('click',event=>{if(!filter.contains(event.target))close()});

  const markCompanyStarts=ordered=>{
    cards.forEach(card=>card.classList.remove('is-company-first'));
    let last='';
    ordered.forEach(card=>{
      const company=card.dataset.company||'';
      if(company!==last){card.classList.add('is-company-first');last=company;}
    });
  };

  const sortCards=mode=>{
    const ordered=[...cards].sort(comparators[mode]||comparators.recent);
    grid.classList.add('is-reordering');
    document.body.classList.toggle('works-company-mode',mode==='company');
    if(mode==='company')markCompanyStarts(ordered);else cards.forEach(card=>card.classList.remove('is-company-first'));
    ordered.forEach(card=>grid.appendChild(card));
    options.forEach(option=>option.classList.toggle('is-active',option.dataset.mode===mode));
    const selected=options.find(option=>option.dataset.mode===mode);
    if(selected)trigger.querySelector('span').textContent=selected.textContent.trim();
    close();
    requestAnimationFrame(()=>requestAnimationFrame(()=>grid.classList.remove('is-reordering')));
  };

  options.forEach(option=>option.addEventListener('click',()=>sortCards(option.dataset.mode)));
  cards.forEach(card=>card.addEventListener('click',()=>{
    cards.forEach(item=>item.classList.remove('is-transition-source'));
    card.classList.add('is-transition-source');
  }));
  sortCards('recent');
})();
