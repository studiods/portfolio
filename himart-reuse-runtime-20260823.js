(()=>{
  'use strict';
  const init=()=>{
    if(!document.body.classList.contains('reuse-page')) return;

    const css=document.createElement('link');
    css.rel='stylesheet';
    css.href='./himart-reuse-refine-20260823-2257.css?v=2257';
    document.head.appendChild(css);

    const addPills=(selector,items)=>{
      const cloud=document.querySelector(selector);
      if(!cloud) return;
      const existing=new Set([...cloud.querySelectorAll('.keyword-pill b')].map(el=>el.textContent.trim()));
      items.forEach(({label,major=false})=>{
        if(existing.has(label)) return;
        const span=document.createElement('span');
        span.className='keyword-pill'+(major?' major':'');
        const b=document.createElement('b');
        b.textContent=label;
        span.appendChild(b);
        cloud.appendChild(span);
      });
    };

    addPills('.keyword-group.anxiety .keyword-cloud',[
      {label:'사전고지와 실제 상품 상이',major:true},
      {label:'미고지 하자',major:true},
      {label:'사진과 실제의 차이'},
      {label:'반품·환불 분쟁'},
      {label:'책임 주체 불명확',major:true},
      {label:'배송 중 파손'},
      {label:'설치 추가비용'},
      {label:'가격 적정성 판단'},
      {label:'검수 이력 확인 어려움'},
      {label:'구매 후 문제 대응'}
    ]);

    addPills('.keyword-group.trust .keyword-cloud',[
      {label:'상품정보와 실제 상태 일치',major:true},
      {label:'하자 선공개',major:true},
      {label:'360° 실물 확인',major:true},
      {label:'검수 주체·이력 공개'},
      {label:'반품·환불 기준'},
      {label:'책임 주체 명확화',major:true},
      {label:'설치비·조건 사전안내'},
      {label:'배송·설치 책임'},
      {label:'가격 판단 근거'},
      {label:'하이마트 직접 상품화',major:true}
    ]);

    const keywordGrid=document.querySelector('#market .keyword-grid');
    if(keywordGrid && !keywordGrid.nextElementSibling?.classList.contains('reuse-research-source')){
      const source=document.createElement('div');
      source.className='hm-source reuse-research-source';
      source.textContent='RESEARCH · 한국소비자원 중고거래 플랫폼 소비자상담 분석(2019—2021) · 상품정보와 실제가 다르다는 불만 32.4% / 하자·환불·책임소재 관련 분쟁 기준 참고';
      keywordGrid.insertAdjacentElement('afterend',source);
    }

    const summary=document.querySelector('.reuse-summary');
    if(summary && !summary.querySelector('.reuse-summary-arrow')){
      const second=summary.querySelectorAll('article')[1];
      const arrow=document.createElement('div');
      arrow.className='reuse-summary-arrow';
      arrow.setAttribute('aria-hidden','true');
      arrow.innerHTML='<span></span>';
      summary.insertBefore(arrow,second || null);
    }

    document.querySelectorAll('.reuse-big-statement,.reuse-journey-note').forEach(block=>{
      if(block.querySelector('.reuse-statement-label')) return;
      const label=document.createElement('span');
      label.className='reuse-statement-label';
      label.textContent='결론';
      block.insertBefore(label,block.firstChild);
    });

    const principleSubno=[...document.querySelectorAll('.hm-subno')].find(el=>el.textContent.includes('01.4 / TRUST PRINCIPLES'));
    if(principleSubno){
      const sub=principleSubno.closest('.hm-subsection');
      const title=sub?.querySelector('.hm-subtitle');
      if(title) title.textContent='그래서 신뢰를 만드는 여섯 가지 원칙을 정했습니다.';
      const list=sub?.querySelector('.direction-list');
      if(list && list.children.length<6){
        const card=document.createElement('article');
        card.className='direction-card';
        card.innerHTML='<span class="hm-card-no">06 / TIMING</span><h4>필요한 순간에만 보여줍니다.</h4><p>안심 메시지를 반복하지 않고 사용자가 다시 의심하는 지점에만 하이마트가 직접 확인하고 관리한 근거를 배치합니다.</p>';
        list.appendChild(card);
      }
    }

    const stage=document.querySelector('.reuse-360-stage');
    if(stage && !stage.classList.contains('is-live')){
      stage.classList.add('is-live');
      const url='https://www.e-himart.co.kr/app/goods/goodsDetail?goodsNo=0063716780&gtmPos=%ED%95%98%EC%9D%B4%EB%A7%88%ED%8A%B8%20%EC%9D%B8%EC%A6%9D%EC%A4%91%EA%B3%A0&jsClck=Y';
      stage.innerHTML='<div class="reuse-360-live"><iframe title="하이마트 인증중고 실제 360도 상품 모듈" loading="lazy" src="'+url+'" allow="fullscreen; autoplay; encrypted-media; picture-in-picture"></iframe><a class="reuse-360-live-fallback" href="'+url+'" target="_blank" rel="noopener">360° 원본 모듈 열기 ↗</a></div>';
    }

    const paju=[...document.querySelectorAll('.hm-subno')].find(el=>el.textContent.includes('02.4 / PAJU TRUST STUDIO'))?.closest('.hm-subsection');
    if(paju && !paju.querySelector('.reuse-process-strip')){
      const grid=paju.querySelector('.reuse-studio-grid');
      if(grid){
        const strip=document.createElement('div');
        strip.className='reuse-process-strip';
        strip.innerHTML='<span>입고</span><i>→</i><span>검수</span><i>→</i><span>세척</span><i>→</i><span>실물 촬영</span><i>→</i><span>360°</span><i>→</i><span>정보 등록</span><i>→</i><span>QA</span><i>→</i><span>고객 노출</span>';
        grid.insertAdjacentElement('afterend',strip);
      }
    }

    const productization=[...document.querySelectorAll('.hm-subno')].find(el=>el.textContent.includes('02.5 / PRODUCTIZATION FLOW'))?.closest('.hm-subsection');
    if(productization) productization.remove();
    document.querySelectorAll('.hm-subno').forEach(el=>{
      if(el.textContent.includes('02.6 / AI CONTENT')) el.textContent='02.5 / AI CONTENT';
      if(el.textContent.includes('02.7 / OPERATION STANDARD')) el.textContent='02.6 / OPERATION STANDARD';
    });
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();