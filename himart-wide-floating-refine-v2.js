(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;

  /* Draw a blue focus ring whenever a voice group becomes the reading focus. */
  const groups=[...main.querySelectorAll('#brand .voice-group')];
  if(!groups.length)return;

  const activate=group=>{
    const cards=[...group.querySelectorAll('.ring-card')];
    cards.forEach(card=>{
      card.classList.remove('is-focus-drawing');
      void card.offsetWidth;
      card.classList.add('is-focus-drawing');
    });
  };

  const deactivate=group=>{
    group.querySelectorAll('.ring-card').forEach(card=>card.classList.remove('is-focus-drawing'));
  };

  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting)activate(entry.target);
        else deactivate(entry.target);
      });
    },{
      threshold:.48,
      rootMargin:'-10% 0px -18% 0px'
    });
    groups.forEach(group=>observer.observe(group));
  }else{
    groups.forEach(activate);
  }
})();
