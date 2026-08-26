(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;
  document.body.classList.add('himart-prod-v16');

  const subByNo=(root,no)=>[...(root||main).querySelectorAll('.hm-subsection')]
    .find(s=>s.querySelector('.hm-subno')?.textContent.includes(no));

  /* ---------- 01 / QUALITATIVE ---------- */
  const brand=main.querySelector('#brand');
  if(brand){
    const meaning=subByNo(brand,'01.2');
    if(meaning){
      let source=meaning.querySelector('.production-meaning-source');
      if(!source){
        source=document.createElement('p');
        source.className='production-meaning-source';
        source.textContent='25~26년 초까지의 리뷰, SNS, 커뮤니티 자료와 내부 VOC 자료 취합본';
        const stack=meaning.querySelector('.voice-stack');
        if(stack)stack.insertAdjacentElement('afterend',source);
        else meaning.appendChild(source);
      }
    }
    const summary=subByNo(brand,'01.3');
    summary?.classList.add('production-summary-after-source');
  }

  /* ---------- 03 / JOURNEY CONCLUSION ---------- */
  const journey=main.querySelector('#journey');
  if(journey){
    const redesign=journey.querySelector('.journey-redesign-subsection');
    if(redesign&&!redesign.querySelector('.production-tobe-conclusion')){
      const conclusion=document.createElement('p');
      conclusion.className='production-tobe-conclusion';
      conclusion.innerHTML='이후 설계에서는 <strong>유입 맥락과 판단 기준을 다음 화면까지 유지하고, 구매 확신과 설치·케어가 끊기지 않도록</strong> 각 화면의 역할과 정보 구조에 반영했습니다.';
      const flow=redesign.querySelector('.flow-area');
      if(flow)flow.insertAdjacentElement('afterend',conclusion);
      else redesign.appendChild(conclusion);
    }
  }

  /* ---------- 04 / PROTOTYPE: 3 wireframes + text per row, 4 rows ---------- */
  const direction=main.querySelector('#direction');
  const caseList=direction?.querySelector('.prototype-case-list');
  if(caseList){
    caseList.classList.add('production-prototype-case-list');
    [...caseList.querySelectorAll(':scope > .prototype-case')].forEach((item,rowIndex)=>{
      const visual=item.querySelector('.prototype-case-visual');
      const original=visual?.querySelector('.galaxy-ultra-mockup');
      if(!visual||!original||visual.dataset.productionTripleMounted==='1')return;
      visual.dataset.productionTripleMounted='1';
      original.setAttribute('aria-label',`Prototype row ${rowIndex+1}, screen 1`);
      for(let screenIndex=2;screenIndex<=3;screenIndex+=1){
        const clone=original.cloneNode(true);
        clone.setAttribute('aria-label',`Prototype row ${rowIndex+1}, screen ${screenIndex}`);
        visual.appendChild(clone);
      }
    });
  }
  const gallery=direction?.querySelector('.phone-gallery');
  if(gallery&&!gallery.classList.contains('production-prototype-gallery')){
    const cards=[...gallery.querySelectorAll(':scope > .phone-card')];
    if(cards.length){
      gallery.classList.add('production-prototype-gallery');
      gallery.innerHTML='';
      for(let i=0;i<cards.length;i+=3){
        const row=document.createElement('div');
        row.className='production-prototype-row';
        const phones=document.createElement('div');
        phones.className='production-prototype-phones';
        const copy=document.createElement('div');
        copy.className='production-prototype-copy';
        cards.slice(i,i+3).forEach(card=>{
          const meta=card.querySelector('.phone-meta');
          if(meta)copy.appendChild(meta);
          phones.appendChild(card);
        });
        row.append(phones,copy);
        gallery.appendChild(row);
      }
    }
  }
})();
