(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;
  document.body.classList.add('himart-v12');

  const stripPrefix=(html='')=>html
    .replace(/^\s*(?:0?\d+|[IVXLCDM]+)\.\s*/i,'')
    .replace(/^\s*<span[^>]*class=["'][^"']*(?:wide-title-index|wide-roman-index)[^"']*["'][^>]*>.*?<\/span>\s*/i,'');
  const subByNo=(root,no)=>[...(root||main).querySelectorAll('.hm-subsection')]
    .find(s=>s.querySelector('.hm-subno')?.textContent.includes(no));
  const cardByNo=no=>[...main.querySelectorAll('#data .data-card')]
    .find(card=>card.querySelector('.hm-card-no')?.textContent.includes(no));
  const setDecimal=(el,n)=>{
    if(!el)return;
    el.innerHTML=`<span class="wide-title-index">${n}.</span>${stripPrefix(el.innerHTML)}`;
  };
  const setRoman=(el,n)=>{
    if(!el)return;
    el.innerHTML=`<span class="wide-roman-index">${n}.</span> ${stripPrefix(el.innerHTML)}`;
  };

  /* ---------- 01 / QUALITATIVE ---------- */
  const brand=main.querySelector('#brand');
  if(brand){
    const chapterTitle=brand.querySelector(':scope > .hm-wrap > .hm-section-head .hm-section-title');
    if(chapterTitle)chapterTitle.innerHTML='개편보다 하이마트가 어떤 브랜드로<br>인식되는지 부터 확인했습니다.';

    [['01.1',1],['01.2',2],['01.3',3],['01.4',4]].forEach(([no,n])=>{
      setDecimal(subByNo(brand,no)?.querySelector('.hm-subtitle'),n);
    });

    /* Keyword clouds -> plain 16px comma-separated lists; keep section colors. */
    brand.querySelectorAll('.keyword-group').forEach(group=>{
      const cloud=group.querySelector('.keyword-cloud');
      if(!cloud||cloud.querySelector('.wide-keyword-list'))return;
      const labels=[...cloud.querySelectorAll('.keyword-pill b')]
        .map(el=>el.textContent.trim()).filter(Boolean);
      cloud.innerHTML=`<p class="wide-keyword-list">${labels.join(', ')}</p>`;
    });

    const meaning=subByNo(brand,'01.2');
    if(meaning){
      const groups=[...meaning.querySelectorAll('.voice-group')];
      const positive=groups[0]?.querySelector('.voice-group-title');
      const negative=groups[1]?.querySelector('.voice-group-title');
      if(positive)positive.innerHTML='<span class="v12-voice-accent is-positive">I.신뢰, 매장 경험, 옴니 채널 강점</span><br><span class="v12-voice-rest">으로 정리되는 긍정 키워드</span>';
      if(negative)negative.innerHTML='<span class="v12-voice-accent is-negative">II.UX불편, 지연, 경험 불일치</span><br><span class="v12-voice-rest">로 정리되는 부정 키워드</span>';
    }

    const summary=subByNo(brand,'01.3');
    if(summary){
      const sentimentTitle=summary.querySelector('.sentiment-title');
      if(sentimentTitle)sentimentTitle.textContent='I.긍정과 부정의 키워드의 비율';
      const conclusionTitle=summary.querySelector('.sentiment-conclusion>h4');
      if(conclusionTitle)conclusionTitle.textContent='II.사용자들의 피드백 종합';

      const blocks=[...summary.querySelectorAll('.sentiment-block')];
      const keyCopy=[
        ['오프라인 체험 · 전문가 상담 · 제품 다양성 · 설치/A/S 신뢰 · 통합 쇼핑가격/혜택','즉시수령 · 토탈 케어 · 접근성 · 가전 전문성'],
        ['앱/UI/UX 불편 · 배송/설치 지연 · 가격/혜택 복잡성 · 환불/교환 불편','문의/A/S 지연 · 재고 문제 · 직원 부담 · 온/오프라인 불일치']
      ];
      blocks.forEach((block,i)=>{
        const keywords=block.querySelector('.sentiment-keywords');
        if(keywords&&keyCopy[i])keywords.innerHTML=`<b>핵심 키워드</b><span class="v12-keyline">${keyCopy[i][0]}</span><span class="v12-keyline">${keyCopy[i][1]}</span>`;
      });
    }

    const ux=subByNo(brand,'01.4');
    const directionList=ux?.querySelector('.direction-list');
    if(directionList){
      const titles=[
        '1.매장의 전문성을 온라인 경험으로 전환',
        '2.흐름이 이어지는 구매경험',
        '3.매장과 온라인, 끊기지 않는 경험',
        '4.검색·탐색 등 쇼핑의 기본기를 먼저 강화',
        '5.모든 진행상황은 투명하고 쉽게 확인',
        '6.흐름이 끊기지 않는 UX'
      ];
      const cards=[...directionList.querySelectorAll('.direction-card')];
      if(cards.length<6){
        const extra=document.createElement('article');
        extra.className='direction-card';
        extra.innerHTML='<span class="hm-card-no">06</span><h4>6.흐름이 끊기지 않는 UX</h4><p>앞 단계의 관심·혜택·비교 기준을 다음 화면에서도 유지해 다시 찾지 않게 합니다.</p>';
        directionList.appendChild(extra);
      }
      [...directionList.querySelectorAll('.direction-card')].forEach((card,i)=>{
        const title=card.querySelector('h4');
        if(title&&titles[i])title.textContent=titles[i];
      });
    }
  }

  /* Ring reveal owned by v12. */
  const rings=[...main.querySelectorAll('#brand .ring-card')];
  rings.forEach(r=>r.classList.remove('is-v12-ring-active'));
  const activateRing=ring=>ring?.classList.add('is-v12-ring-active');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    rings.forEach(activateRing);
  }else if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){activateRing(entry.target);io.unobserve(entry.target)}
    }),{threshold:.28,rootMargin:'0px 0px -7% 0px'});
    rings.forEach(r=>io.observe(r));
  }else rings.forEach(activateRing);

  /* ---------- 02 / DATA ---------- */
  const data=main.querySelector('#data');
  if(data){
    const search=cardByNo('02.4');
    if(search){
      search.classList.add('v12-removed-search');
      search.remove();
    }
    const order=[['02.1','I'],['02.2','II'],['02.5','III'],['02.6','IV']];
    order.forEach(([no,roman])=>setRoman(cardByNo(no)?.querySelector('.data-card-head h3'),roman));

    const bridge=data.querySelector('.data-bridge');
    const bridgeTitle=bridge?.querySelector('.data-bridge-title');
    if(bridgeTitle)bridgeTitle.innerHTML='<span class="wide-roman-index">V.</span> 결과적으로 데이터를 분석해 보니 뚜렷한 패턴이 보였습니다.';
  }

  /* ---------- 03 / JOURNEY ---------- */
  const journey=main.querySelector('#journey');
  const ensureCluster=(group,nodeCount,label,mode)=>{
    if(!group)return;
    const row=group.querySelector('.flow-row');
    if(!row)return;
    let cluster=row.querySelector(':scope > .wide-flow-cluster');
    if(!cluster){
      const children=[...row.children];
      const moving=children.slice(0,nodeCount*2-1);
      if(!moving.length)return;
      cluster=document.createElement('div');
      cluster.className='wide-flow-cluster v12-journey-tablet';
      cluster.innerHTML='<div class="wide-flow-cluster-label"></div><div class="wide-flow-cluster-inner"></div>';
      const inner=cluster.querySelector('.wide-flow-cluster-inner');
      moving.forEach(el=>inner.appendChild(el));
      row.insertBefore(cluster,row.firstChild);
    }
    cluster.classList.add('v12-journey-tablet');
    cluster.classList.toggle('v12-tablet-red',mode==='red');
    cluster.classList.toggle('v12-tablet-blue',mode==='blue');
    const labelEl=cluster.querySelector('.wide-flow-cluster-label');
    if(labelEl)labelEl.textContent=label;
  };

  const enforceJourney=()=>{
    if(!journey)return;
    const signal=journey.querySelector('.journey-signal-subsection');
    if(signal){
      const groups=[...signal.querySelectorAll('.flow-group')];
      ensureCluster(groups[0],3,'외부 랜딩 이후 다음 탐색이 끊김 · 기획전 바로 종료 52.2%','red');
      ensureCluster(groups[1],2,'PDP 관심은 유지됐지만 장바구니·구매 행동은 약화','red');
    }
    const redesign=journey.querySelector('.journey-redesign-subsection');
    if(redesign){
      const groups=[...redesign.querySelectorAll('.flow-group')];
      ensureCluster(groups[0],3,'유입 맥락을 잃지 않고 탐색으로 연결','blue');
      ensureCluster(groups[1],2,'비교 기준을 유지해 구매 확신과 설치·케어까지 연결','blue');
    }
  };

  enforceJourney();
  /* v9 can load v10 asynchronously after this script. Reassert only the journey grammar afterwards. */
  setTimeout(enforceJourney,120);
  setTimeout(enforceJourney,650);
  if(journey&&'MutationObserver' in window){
    let queued=false;
    const mo=new MutationObserver(()=>{
      if(queued)return;
      queued=true;
      requestAnimationFrame(()=>{queued=false;enforceJourney()});
    });
    mo.observe(journey,{childList:true,subtree:true});
    setTimeout(()=>mo.disconnect(),2200);
  }
})();
