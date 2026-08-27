(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main){
    document.body.classList.remove('himart-v18-loading');
    document.body.classList.add('himart-v18-ready');
    return;
  }
  document.body.classList.add('himart-prod-v18');

  try{
    /* ---------- V / DATA SYNTHESIS ---------- */
    const bridgeCards=[...main.querySelectorAll('#data .data-bridge-grid article')];
    const bridgeTitles=[
      '각 데이터는 서로 다른<br>행동을 보여줬습니다.',
      '하지만 반복되는<br>패턴은 있었습니다.',
      '화면이 바뀔 때마다<br>맥락이 약해졌습니다.'
    ];
    bridgeTitles.forEach((copy,i)=>{
      const title=bridgeCards[i]?.querySelector('h4');
      if(title)title.innerHTML=copy;
    });

    /* ---------- 03 / ROLE DEFINITION ----------
       Titles are taken verbatim from HIMART_Online_UX_Improvement_v3.1.html
       > '하이마트 구매 여정 개선의 핵심 포인트'. Descriptions are shortened only from the same source. */
    const journey=main.querySelector('#journey');
    const roleGrid=journey?.querySelector('.role-grid');
    if(roleGrid){
      const roles=[
        {
          title:'홈은 보여주는 곳이 아닌 원하는 곳으로 보내주는 곳이어야 한다',
          copy:'최근 관심 상품·혜택·서비스를 기억하고 사용자가 원하는 목적지로 바로 이어줍니다.'
        },
        {
          title:'선택한 카테고리 안에서는 고민의 시간을 줄여야 한다.',
          copy:'많이 찾는 상품과 선택 기준을 먼저 보여줘 카테고리 안에서 비교와 선택을 빠르게 만듭니다.'
        },
        {
          title:'불확실성을 확신으로 바꿔줘야 한다',
          copy:'정확한 모델명을 몰라도 모호한 니즈를 구체적인 상품 후보로 바꾸는 탐색을 지원합니다.'
        },
        {
          title:'단순 상품 목록이 아니라 비교를 끝내는 화면이어야 한다',
          copy:'가격·혜택·브랜드·배송·설치·리뷰·스펙을 한눈에 비교해 구매 후보를 압축합니다.'
        },
        {
          title:'설명하는 화면이 아니라 결정을 끝내는 화면이어야 한다',
          copy:'가격과 설치 가능성, 리뷰, 혜택, 서비스 정보를 함께 보여 구매 결정을 완료하도록 돕습니다.'
        },
        {
          title:'결제 직전의 마지막 확신을 줘야 한다',
          copy:'가격·혜택·옵션·설치 조건을 재확인하고 상품·배송지·결제수단·최종 금액을 빠르게 확인하게 합니다.'
        },
        {
          title:'결제 이후의 불안을 일정 확정으로 바꿔야 한다',
          copy:'설치 일정과 가능 여부, 기존 제품 처리 정보를 명확히 안내해 결제 이후의 불안을 줄입니다.'
        },
        {
          title:'구매 이후에도 관리받고 있다는 느낌을 줘야 한다',
          copy:'안심케어·수리·이전설치·정기점검을 상품 이력과 연결해 구매 이후의 관리 경험을 이어갑니다.'
        }
      ];
      roleGrid.innerHTML=roles.map(role=>`<article class="role-card"><span class="hm-role-name">${role.title}</span><p>${role.copy}</p></article>`).join('');
    }

    /* ---------- 04 / PROTOTYPE ---------- */
    const direction=main.querySelector('#direction');
    const caseList=direction?.querySelector('.prototype-case-list');
    if(caseList){
      [...caseList.querySelectorAll(':scope > .prototype-case')].forEach((item,rowIndex)=>{
        const visual=item.querySelector('.prototype-case-visual');
        if(!visual)return;
        let screens=[...visual.querySelectorAll(':scope > .galaxy-ultra-mockup')];
        if(screens.length===1){
          const clone=screens[0].cloneNode(true);
          clone.setAttribute('aria-label',`Prototype row ${rowIndex+1}, screen 2`);
          visual.appendChild(clone);
          screens=[...visual.querySelectorAll(':scope > .galaxy-ultra-mockup')];
        }
        screens.slice(2).forEach(node=>node.remove());
        [...visual.querySelectorAll(':scope > .galaxy-ultra-mockup')].forEach((screen,i)=>{
          screen.setAttribute('aria-label',`Prototype row ${rowIndex+1}, screen ${i+1}`);
        });
      });
    }

    /* Legacy gallery fallback: rebuild any v16 3-up rows as 2-up rows while preserving metadata order. */
    const gallery=direction?.querySelector('.phone-gallery.production-prototype-gallery');
    if(gallery){
      const pairs=[];
      [...gallery.querySelectorAll(':scope > .production-prototype-row')].forEach(row=>{
        const cards=[...row.querySelectorAll('.production-prototype-phones > .phone-card')];
        const metas=[...row.querySelectorAll('.production-prototype-copy > .phone-meta')];
        cards.forEach((card,i)=>pairs.push({card,meta:metas[i]||null}));
      });
      if(pairs.length){
        gallery.innerHTML='';
        for(let i=0;i<pairs.length;i+=2){
          const row=document.createElement('div');
          row.className='production-v18-row';
          const phones=document.createElement('div');
          phones.className='production-v18-phones';
          const copy=document.createElement('div');
          copy.className='production-v18-copy';
          pairs.slice(i,i+2).forEach(({card,meta})=>{
            phones.appendChild(card);
            if(meta)copy.appendChild(meta);
          });
          row.append(phones,copy);
          gallery.appendChild(row);
        }
      }
    }
  } finally {
    /* Reveal only the final Korean/transformed DOM. */
    requestAnimationFrame(()=>{
      document.body.classList.remove('himart-v18-loading');
      document.body.classList.add('himart-v18-ready');
    });
  }
})();
