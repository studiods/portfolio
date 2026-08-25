(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;

  const strip=(html='')=>html
    .replace(/^\s*(?:0?\d+|[IVXLCDM]+)\.\s*/i,'')
    .replace(/^\s*<span[^>]*class=["'][^"']*(?:wide-title-index|wide-roman-index)[^"']*["'][^>]*>.*?<\/span>\s*/i,'');
  const setIndex=(el,label,klass='wide-title-index',space=false)=>{
    if(!el)return;
    el.innerHTML=`<span class="${klass}">${label}.</span>${space?' ':''}${strip(el.innerHTML)}`;
  };
  const subByNo=(root,no)=>[...(root||main).querySelectorAll('.hm-subsection')]
    .find(s=>s.querySelector('.hm-subno')?.textContent.includes(no));
  const cardByNo=no=>[...main.querySelectorAll('#data .data-card')]
    .find(card=>card.querySelector('.hm-card-no')?.textContent.includes(no));

  /* ---------- 01 / QUALITATIVE ---------- */
  const brand=main.querySelector('#brand');
  if(brand){
    [['01.1','01'],['01.2','02'],['01.3','03'],['01.4','04']].forEach(([no,label])=>{
      const section=subByNo(brand,no);
      setIndex(section?.querySelector('.hm-subtitle'),label,'wide-title-index',false);
    });

    /* Voice-group titles remain descriptive, without their old rules. */
    const voiceGroups=[...brand.querySelectorAll('.voice-group')];
    voiceGroups.forEach(group=>group.classList.add('wide-no-title-rule'));

    const summary=subByNo(brand,'01.3');
    if(summary){
      const sentimentTitle=summary.querySelector('.sentiment-title');
      if(sentimentTitle)sentimentTitle.textContent='I.긍정과 부정의 키워드의 비율';
      const conclusionTitle=summary.querySelector('.sentiment-conclusion>h4');
      if(conclusionTitle)conclusionTitle.textContent='II.사용자들의 피드백 종합';

      const positive=summary.querySelector('.sentiment-block:not(.negative) .sentiment-keywords');
      if(positive){
        positive.innerHTML='<b>핵심 키워드</b><br>오프라인 체험 · 전문가 상담 · 제품 다양성 · 설치/A/S 신뢰 · 통합 쇼핑가격/혜택<br>즉시수령 · 토탈 케어 · 접근성 · 가전 전문성';
      }
    }

    /* Make the design-principle area six items and number every title. */
    const uxSection=subByNo(brand,'01.4');
    const directionList=uxSection?.querySelector('.direction-list');
    if(directionList){
      const cards=[...directionList.querySelectorAll('.direction-card')];
      if(cards.length<6){
        const extra=document.createElement('article');
        extra.className='direction-card';
        extra.innerHTML='<span class="hm-card-no">06</span><h4>판단 기준을 다음 화면까지 연결</h4><p>앞 단계의 관심·혜택·비교 기준을 다음 화면에서도 유지해 다시 찾지 않게 합니다.</p>';
        directionList.appendChild(extra);
      }
      [...directionList.querySelectorAll('.direction-card h4')].forEach((title,i)=>{
        setIndex(title,String(i+1).padStart(2,'0'),'wide-title-index',true);
      });
    }
  }

  /* ---------- 02 / QUANTITATIVE ---------- */
  const data=main.querySelector('#data');
  if(data){
    /* Skip the hidden 02.3 card: visible evidence is I, II, III, IV, V, then bridge VI. */
    const order=[['02.1','I'],['02.2','II'],['02.4','III'],['02.5','IV'],['02.6','V']];
    order.forEach(([no,roman])=>{
      const card=cardByNo(no);
      setIndex(card?.querySelector('.data-card-head h3'),roman,'wide-roman-index',true);
    });

    const bridge=data.querySelector('.data-bridge');
    if(bridge){
      const title=bridge.querySelector('.data-bridge-title');
      if(title){
        title.innerHTML=`<span class="wide-roman-index">VI.</span> ${strip(title.innerHTML)}`;
      }
    }

    /* Entry chart: same data, refreshed palette and 28px label/value grammar. */
    const entry=data.querySelector('.wide-entry-bar');
    if(entry){
      const segs=[...entry.querySelectorAll('.wide-segment')];
      const colors=['#0572CB','var(--hm-blue)','var(--hm-newblue)','var(--hm-green)','var(--hm-yellow)'];
      const labels=[['AD','52%'],['Direct','31%'],['CPS','10%'],['CRM','6%'],['기타','1%']];
      segs.forEach((seg,i)=>{
        if(colors[i])seg.style.background=colors[i];
        if(labels[i])seg.innerHTML=`<span>${labels[i][0]} <small>${labels[i][1]}</small></span>`;
        seg.classList.remove('is-tiny');
      });
    }

    /* Landing next-action chart: same palette/style as entry, keep the original data. */
    const action=data.querySelector('.wide-action-bar');
    if(action){
      const segs=[...action.querySelectorAll('.wide-segment')];
      const colors=['#0572CB','var(--hm-blue)','var(--hm-newblue)','var(--hm-green)','var(--hm-yellow)'];
      const labels=[['종료','52.2%'],['재탐색','27.6%'],['상품','9.3%'],['검색','6.6%'],['기타','4.3%']];
      segs.forEach((seg,i)=>{
        if(colors[i])seg.style.background=colors[i];
        if(labels[i])seg.innerHTML=`<span>${labels[i][0]} <small>${labels[i][1]}</small></span>`;
        seg.classList.remove('is-tiny');
      });
    }
  }

  /* ---------- 03 / JOURNEY ---------- */
  const journey=main.querySelector('#journey');
  if(journey){
    const signal=journey.querySelector('.journey-signal-subsection');
    if(signal){
      const title=signal.querySelector('.hm-subtitle');
      if(title){
        title.innerHTML='01. 데이터를 하나의 여정으로 연결해 보니,<br>다음 행동이 약해지는 위치가 더 명확해졌습니다.';
      }

      const groups=[...signal.querySelectorAll('.flow-group')];
      const buildCluster=(group,nodeCount,label,klass)=>{
        if(!group||group.querySelector('.wide-flow-cluster'))return;
        const row=group.querySelector('.flow-row');
        if(!row)return;
        const children=[...row.children];
        const moveCount=nodeCount*2-1;
        const moving=children.slice(0,moveCount);
        if(!moving.length)return;
        const cluster=document.createElement('div');
        cluster.className=`wide-flow-cluster ${klass}`;
        cluster.innerHTML=`<div class="wide-flow-cluster-label">${label}</div><div class="wide-flow-cluster-inner"></div>`;
        const inner=cluster.querySelector('.wide-flow-cluster-inner');
        moving.forEach(el=>inner.appendChild(el));
        row.insertBefore(cluster,row.firstChild);
      };

      buildCluster(groups[0],3,'외부 랜딩 이후 다음 탐색이 끊김 · 기획전 바로 종료 52.2%','wide-flow-cluster--alert');
      buildCluster(groups[1],2,'PDP 관심은 유지됐지만 장바구니·구매 행동은 약화','wide-flow-cluster--focus');
    }

    const redesign=journey.querySelector('.journey-redesign-subsection');
    if(redesign){
      const title=redesign.querySelector('.forced-redesign-title');
      if(title&&!/^\s*02\./.test(title.textContent)){
        title.innerHTML='<span>02. 끊어진 지점을 기준으로, 각 단계가</span><span>다음 행동을 이어주도록 다시 연결했습니다.</span>';
      }
    }

    /* Role labels such as HOME use Averta Regular. */
    journey.querySelectorAll('.role-card .hm-role-name').forEach(el=>{el.style.fontWeight='400'});
  }
})();
