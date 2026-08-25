(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;
  const setText=(el,v)=>{if(el)el.textContent=v};
  const setHTML=(el,v)=>{if(el)el.innerHTML=v};
  const subByNo=(root,no)=>[...(root||main).querySelectorAll('.hm-subsection')].find(s=>s.querySelector('.hm-subno')?.textContent.includes(no));
  const cardByNo=no=>[...main.querySelectorAll('#data .data-card')].find(card=>card.querySelector('.hm-card-no')?.textContent.includes(no));
  const prefix=(el,n)=>{
    if(!el)return;
    const html=el.innerHTML.replace(/^\s*\d+\.\s*/,'');
    el.innerHTML=`${n}. ${html}`;
  };

  /* 01 / qualitative synthesis */
  const brand=main.querySelector('#brand');
  const summary=subByNo(brand,'01.3');
  if(summary){
    setHTML(summary.querySelector('.hm-subtitle'),'1. 긍정과 부정의 비율도 함께 놓고 봤습니다.');
    const conclusion=summary.querySelector('.sentiment-conclusion');
    if(conclusion){
      setText(conclusion.querySelector(':scope > h4'),'사용자들의 피드백 종합');
      const cards=[...conclusion.querySelectorAll('.conclusion-card')];
      setHTML(cards[0]?.querySelector('h5'),'믿고 맡길 수 있는<br>검증된 가전 전문가');
      setHTML(cards[1]?.querySelector('h5'),'느리고 복잡한,<br>약속이 불확실한 쇼핑몰');
    }
  }

  const uxPoints=subByNo(brand,'01.4');
  if(uxPoints){
    setHTML(uxPoints.querySelector('.hm-subtitle'),'2. 사용자들의 목소리를 UX에<br>어떻게 반영할까를 고민했습니다.');
    const care=[...uxPoints.querySelectorAll('.direction-card h4')].find(el=>el.textContent.trim()==='구매를 케어의 시작으로');
    care?.classList.add('wide-care-light');
  }

  /* 02 / quantitative behavior */
  const data=main.querySelector('#data');
  if(data){
    setHTML(data.querySelector('.hm-section-title'),'정성적 데이터 분석과 더불어<br>정량적인 사용자 패턴 분석도 진행했습니다.');

    [...data.querySelectorAll('.data-card')].forEach((card,i)=>{
      prefix(card.querySelector('.data-card-head h3'),i+1);
    });

    const c26=cardByNo('02.6');
    if(c26){
      const landingCharts=[...c26.querySelectorAll('.landing-chart')];
      landingCharts.find(chart=>chart.querySelector('h4')?.textContent.includes('PDP 이후 행동'))?.remove();
    }

    const bridge=data.querySelector('.data-bridge');
    if(bridge){
      setHTML(bridge.querySelector('.data-bridge-title'),'7. 데이터를 분석해 보니<br>뚜렷한 패턴이 보였습니다.');
      const articles=[...bridge.querySelectorAll('.data-bridge-grid article')];
      const last=articles.at(-1);
      if(last){
        setHTML(last.querySelector('h4'),'그래서 <strong class="journey-title-emphasis">유입 맥락 → 탐색 → 비교 → 구매 확신 → 설치·케어</strong>로 다시 정의할 필요가 보였습니다.');
      }
    }
  }

  /* 03 / journey: report labels are hidden by CSS, readable titles carry simple numbers. */
  const journey=main.querySelector('#journey');
  if(journey){
    const signal=journey.querySelector('.journey-signal-subsection');
    if(signal)prefix(signal.querySelector('.hm-subtitle'),1);
    const role=[...journey.querySelectorAll('.hm-subsection')].find(s=>s.querySelector('.hm-subno')?.textContent.includes('ROLE DEFINITION'));
    if(role)prefix(role.querySelector('.hm-subtitle'),3);
  }

  /* 04 / screen application: keep the same title-number pattern where subsection labels exist. */
  const direction=main.querySelector('#direction');
  if(direction){
    [...direction.querySelectorAll('.hm-subsection')].forEach((section,i)=>{
      const title=section.querySelector('.hm-subtitle, .forced-redesign-title');
      if(title)prefix(title,i+1);
    });
  }
})();
