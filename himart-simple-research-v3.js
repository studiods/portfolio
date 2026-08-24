(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;

  const q=(s,r=main)=>r.querySelector(s);
  const setText=(el,text)=>{if(el)el.textContent=text};
  const setHTML=(el,html)=>{if(el)el.innerHTML=html};

  /* 01 — make the qualitative read explicit: how customers perceive Himart and where that trust breaks online. */
  const brand=q('#brand');
  if(brand){
    const wrap=q(':scope > .hm-wrap',brand);
    const head=q(':scope > .hm-wrap > .hm-section-head',brand);
    setText(q('.hm-section-no',head),'01 / QUALITATIVE READ');
    setHTML(q('.hm-section-title',head),'먼저, 고객이 하이마트를 왜 선택하고<br>어디에서 신뢰를 잃는지 봤습니다.');
    setText(q('.hm-section-desc',head),'정성 데이터에서 하이마트는 설치·A/S·매장 체험·전문가 상담 같은 전문성으로 인식됐습니다. 반면 온라인에서는 복잡한 혜택, 배송·설치 불확실성, 정보 차이가 그 기대를 약하게 만들었습니다.');

    const evidence=q('.simple-evidence',brand);
    if(evidence){
      const articles=[...evidence.querySelectorAll('article')];
      const keywordSets=[
        ['전문성','설치·A/S','매장 체험','전문가 상담'],
        ['혜택 복잡성','배송·설치 불확실성','정보 차이','신뢰 단절']
      ];
      articles.forEach((article,i)=>{
        article.querySelector('.simple-keyword-row')?.remove();
        const row=document.createElement('div');
        row.className='simple-keyword-row';
        row.innerHTML=(keywordSets[i]||[]).map(word=>`<span>${word}</span>`).join('');
        const p=article.querySelector('p');
        if(p)article.insertBefore(row,p);
        else article.appendChild(row);
      });

      wrap?.querySelector('.simple-research-bridge')?.remove();
      const bridge=document.createElement('div');
      bridge.className='simple-research-bridge hm-reveal';
      bridge.innerHTML=`
        <span class="simple-research-label">RESEARCH LOGIC</span>
        <div class="simple-research-flow" aria-label="Qualitative to quantitative research flow">
          <div><b>QUALITATIVE</b><span>소비자 인식</span></div>
          <i></i>
          <div><b>QUANTITATIVE</b><span>실제 이용 행동</span></div>
        </div>
        <p>먼저 <strong>“하이마트를 어떻게 바라보는가”</strong>를 정성적으로 확인하고, 그 인식의 간극이 유입·검색·이탈 같은 <strong>실제 행동에서도 반복되는지</strong> 정량 데이터로 확인했습니다.</p>`;
      evidence.insertAdjacentElement('afterend',bridge);
    }
  }

  /* 02 — explicitly position behavioral data as the quantitative verification step. */
  const data=q('#data');
  if(data){
    const head=q(':scope > .hm-wrap > .hm-section-head',data);
    setText(q('.hm-section-no',head),'02 / QUANTITATIVE CHECK');
    setHTML(q('.hm-section-title',head),'정성적으로 보인 간극이,<br>실제 이용 행동에서도 나타나는지 확인했습니다.');
    setText(q('.hm-section-desc',head),'유입 맥락, 검색 행동, 구매 직전 단절. 세 신호만 남겨 고객 인식과 실제 행동이 같은 문제를 가리키는지 확인했습니다.');
  }
})();
