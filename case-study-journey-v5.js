(() => {
  'use strict';
  if(document.body.dataset.case!=='journey')return;

  const heroTitle=document.querySelector('.case-title');
  const heroLead=document.querySelector('.case-lead');
  if(heroTitle)heroTitle.textContent='하이마트 온라인 전체 구매 여정을\n처음부터 재설계했습니다.';
  if(heroLead)heroLead.textContent='하이마트 온라인 전체 개편을 요구사항 반영이 아닌 UX 전략 재수립에서 시작했습니다. 브랜드 인식과 고객의 기대·불만, 실제 이용 데이터를 함께 분석해 하이마트가 잘할 수 있는 경험과 개선해야 할 문제를 정의하고, 그 기준으로 전체 구매 여정을 다시 설계했습니다.';

  const role=document.querySelector('.case-meta > div:first-child b');
  if(role)role.textContent='UX STRATEGY · UX PLANNING · EXPERIENCE DESIGN · UX DIRECTION';

  const sections=[
    {
      kicker:'CONTEXT',
      title:'홈을 바꾸기 전에, 하이마트가 어떤 경험으로 인식되는지부터 확인했습니다.',
      intro:'입사 후 처음 진행하는 대규모 개편이었기 때문에 “홈이 이상하니 개선하자”는 요청을 그대로 화면 과제로 받지 않았습니다. 하이마트가 고객에게 어떤 브랜드로 기억되는지, 무엇을 좋아하고 불편해하는지부터 다시 확인해 개편의 출발점을 정했습니다.',
      cards:[
        ['BRIEF','홈 화면 개선 요청','주어진 화면을 바로 고치기보다 왜 지금 바꿔야 하는지부터 확인했습니다.'],
        ['BRAND','고객이 기억하는 하이마트','블로그·카페·앱 리뷰·YouTube·소비자 자료를 통해 긍정과 불만을 함께 수집했습니다.'],
        ['STRENGTH','신뢰 · 전문성 · 오프라인','설치·A/S, 전문 상담, 매장 체험은 반복해서 확인된 하이마트의 강점이었습니다.'],
        ['GAP','느리고 복잡한 온라인 경험','복잡한 혜택과 정보, 온·오프라인 단절은 온라인에서 강점을 약하게 만드는 문제였습니다.']
      ],
      steps:['요청 재해석','브랜드 인식 리서치','고객 반응 군집화','개편 범위 재정의'],
      media:['BRAND PERCEPTION RESEARCH','POSITIVE / NEGATIVE SIGNAL MAP','RESEARCH SOURCES'],
      quote:'화면을 고치기 전에, 하이마트가 고객에게 어떤 기대를 받고 있는지부터 다시 봤습니다.'
    },
    {
      kicker:'EVIDENCE',
      title:'브랜드 인식과 실제 이용 데이터를 함께 놓자, 문제는 “연결의 단절”로 보였습니다.',
      intro:'제한적이지만 확보할 수 있었던 GA 데이터를 함께 확인했습니다. 대부분의 사용자는 홈에서 시작하지 않았고 외부 광고·CRM·프로모션·상품 화면을 통해 들어왔습니다. 문제는 유입 이후였습니다. 관심 맥락을 이어줄 다음 행동이 충분하지 않아 많은 사용자가 다른 탐색으로 연결되지 못했습니다.',
      cards:[
        ['82%+','외부 채널을 통한 유입','온라인 방문의 대부분이 홈이 아닌 외부 접점에서 시작했습니다.'],
        ['50%+','후속 탐색 없이 이탈','외부 유입자의 절반 이상이 다른 화면이나 서비스로 이어지지 못했습니다.'],
        ['INSIGHT','홈이 첫 화면이라는 가정의 오류','첫 화면을 예쁘게 만드는 것보다 어디에서 들어와도 다음 행동으로 연결하는 구조가 중요했습니다.'],
        ['REFRAME','화면 문제 → 여정 문제','홈 하나의 개편을 유입부터 탐색·비교·구매·설치·관리까지의 전체 과제로 확장했습니다.']
      ],
      steps:['GA 유입 확인','이탈 구간 확인','브랜드 리서치 대조','문제 재정의'],
      media:['GA ENTRY / EXIT OVERVIEW','ENTRY PATHS / JOURNEY MAP','STRENGTH VS EXPERIENCE GAP'],
      quote:'사용자가 들어오는 곳은 달라도, 다음 행동을 이어주는 연결고리가 부족하다는 문제는 같았습니다.'
    },
    {
      kicker:'DECISION',
      title:'새로운 UX를 발명하기보다, 사용자가 이미 아는 기본을 먼저 선택했습니다.',
      intro:'검색·필터·상품카드·장바구니·결제처럼 시장에서 이미 학습된 문법은 네이버와 쿠팡 등 익숙한 서비스의 기본을 적극적으로 참고했습니다. 학습 비용을 줄이는 대신 하이마트만이 가진 매장, 가전 상담, 설치·A/S, 중고·케어 서비스를 구매 과정 곳곳의 연결점으로 더 선명하게 드러냈습니다.',
      cards:[
        ['FAMILIAR','익숙한 커머스 문법','새로움보다 이미 학습된 탐색·비교·구매 방식을 우선했습니다.'],
        ['SEARCH','탐색의 기본 강화','검색과 카테고리, 필터가 사용자의 목적을 빠르게 좁히도록 기본 구조를 정리했습니다.'],
        ['CONNECT','하이마트 자산 연결','매장·전문 상담·설치·회수·케어가 온라인 구매와 자연스럽게 이어지도록 했습니다.'],
        ['OMNI','목적은 구분하고 데이터는 연결','온라인은 빠른 탐색과 결제를, 오프라인은 확인·상담·설치 확신을 담당하도록 역할을 나눴습니다.']
      ],
      steps:['시장 표준 분석','기본 문법 선택','하이마트 자산 정의','연결 원칙 수립'],
      media:['NAVER / COUPANG PATTERN STUDY','HIMART DIFFERENTIATION MAP','UX STRATEGY PRINCIPLES'],
      quote:'익숙하지만 하이마트답게. 기본은 시장의 표준에서 가져오고, 선택할 이유는 하이마트의 강점에서 만들었습니다.'
    },
    {
      kicker:'MAKING',
      title:'홈을 탐색 허브로, 구매 여정의 각 화면을 하나의 역할로 다시 정의했습니다.',
      intro:'홈을 프로모션을 많이 보여주는 곳이 아니라 원하는 곳으로 보내주는 탐색 허브로 다시 정의했습니다. 같은 방식으로 검색, 상품 목록, PDP, 장바구니, 결제와 구매 후 경험까지 각 화면이 해결해야 할 역할을 명확히 하고, 외부 유입의 관심 맥락이 끊기지 않도록 전체 흐름을 연결했습니다.',
      cards:[
        ['HOME','원하는 곳으로 보내는 탐색 허브','검색, 주요 카테고리, 최근 행동, 서비스 진입점을 첫 화면에서 빠르게 찾게 합니다.'],
        ['SEARCH','모호한 니즈를 상품 후보로','연관 검색과 가이드로 사용자의 막연한 요구를 구체적인 후보로 바꿉니다.'],
        ['SRP / PLP','비교를 끝내는 화면','가격·혜택·배송·리뷰와 비교 기준을 정리해 후보를 좁히게 합니다.'],
        ['PDP','결정을 끝내는 화면','구매 판단에 필요한 정보와 설치·상담·케어 조건을 한곳에서 확인하게 합니다.']
      ],
      steps:['장바구니 · 마지막 확신','결제 · 쉽고 빠르게','설치 · 약속을 명확히','구매 후 · 관리 관계 지속'],
      media:['FULL COMMERCE JOURNEY','HOME AS EXPLORATION HUB','SRP / PLP COMPARISON','PDP DECISION EXPERIENCE'],
      quote:'홈부터 구매 이후까지 화면마다 하나의 역할을 부여하고, 그 역할 사이의 연결을 구매 여정으로 설계했습니다.'
    },
    {
      kicker:'OUTCOME',
      title:'하이마트의 강점이 구매 전후를 연결하는 UX 기준을 만들었습니다.',
      intro:'이번 개편의 결과는 특정 홈 시안 하나가 아니라 하이마트 온라인이 어떤 방식으로 탐색·비교·구매·설치·관리를 연결해야 하는지에 대한 기준입니다. 이후 화면을 바꾸더라도 “익숙한 기본 위에 하이마트의 신뢰와 전문성을 연결한다”는 원칙을 반복해서 사용할 수 있도록 정리했습니다.',
      cards:[
        ['STANDARD','익숙한 기본','시장에서 검증된 UX 문법을 기본 구조로 사용합니다.'],
        ['HUB','홈의 역할 재정의','프로모션 진열보다 검색·카테고리·최근 행동·서비스 연결을 우선합니다.'],
        ['VALUE','전문성의 디지털 확장','상담·매장·설치·A/S·중고·케어를 온라인 경험의 차별점으로 연결합니다.'],
        ['SYSTEM','여정별 판단 기준','Home · Search · SRP/PLP · PDP · Cart · Payment · Care의 역할을 공통 기준으로 남겼습니다.']
      ],
      steps:['UX 전략','여정 역할 정의','화면 적용','운영 기준 확장'],
      media:['FINAL UX STRATEGY OVERVIEW','JOURNEY ROLE DEFINITION','APPLIED EXPERIENCE PRINCIPLES'],
      quote:'하이마트만의 낯선 UX가 아니라, 고객이 이미 아는 방식 안에서 하이마트를 선택할 이유를 더 분명하게 만들었습니다.'
    }
  ];

  const renderCards=items=>items.map(([k,t,p])=>`<div class="evidence-card"><span>${k}</span><b>${t}</b><p>${p}</p></div>`).join('');
  const renderSteps=items=>items.map(t=>`<div class="process-step"><b>${t}</b></div>`).join('');
  const stages=[...document.querySelectorAll('.case-stage')];
  stages.forEach((stage,index)=>{
    const data=sections[index];
    if(!data)return;
    const kicker=stage.querySelector('.case-section-kicker');
    const title=stage.querySelector('.case-stage-title');
    const intro=stage.querySelector('.case-stage-intro');
    const grid=stage.querySelector('.evidence-grid');
    const process=stage.querySelector('.process-strip');
    const quote=stage.querySelector('.case-key-quote');
    if(kicker)kicker.textContent=data.kicker;
    if(title)title.textContent=data.title;
    if(intro)intro.textContent=data.intro;
    if(grid)grid.innerHTML=renderCards(data.cards);
    if(process)process.innerHTML=renderSteps(data.steps);
    if(quote)quote.textContent=data.quote;
    const labels=[...stage.querySelectorAll('.media-slot > span')];
    labels.forEach((el,i)=>{if(data.media[i])el.textContent=data.media[i];});
  });

  const metricGrid=stages[1]?.querySelector('.evidence-grid');
  if(metricGrid){
    metricGrid.classList.add('journey-metrics');
    const metricCards=[...metricGrid.querySelectorAll('.evidence-card')].slice(0,2);
    const values=[82,50];
    metricCards.forEach((card,index)=>{
      card.classList.add('is-metric-card');
      const value=values[index];
      const label=card.querySelector('span');
      if(!label)return;
      label.dataset.metricValue=String(value);
      label.textContent='0%+';
      const track=document.createElement('div');
      track.className='journey-metric-track';
      const fill=document.createElement('span');
      fill.className='journey-metric-fill';
      fill.style.setProperty('--journey-ratio',String(value/82));
      track.appendChild(fill);
      card.appendChild(track);
    });

    const play=()=>{
      if(metricGrid.dataset.metricPlayed==='1')return;
      metricGrid.dataset.metricPlayed='1';
      metricGrid.classList.add('is-metric-visible');
      metricCards.forEach(card=>{
        const label=card.querySelector('[data-metric-value]');
        const target=Number(label?.dataset.metricValue)||0;
        if(!label)return;
        const start=performance.now();
        const duration=820;
        const frame=now=>{
          const p=Math.min(1,(now-start)/duration);
          const eased=1-Math.pow(1-p,3);
          label.textContent=`${Math.round(target*eased)}%+`;
          if(p<1)requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });
    };
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)play();
    else if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        play();
        observer.disconnect();
      }),{threshold:.3});
      observer.observe(metricGrid);
    }else play();
  }
})();
