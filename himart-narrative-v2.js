(()=>{
  'use strict';

  const pool='가나다라마바사아자차카타파하ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const scrambleText=(el,duration=720,customPool=pool)=>{
    if(!el||el.dataset.scramblePlayed==='1')return;
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
    const parts=[];
    while(walker.nextNode()){
      const node=walker.currentNode;
      const original=node.nodeValue;
      if(original&&original.trim())parts.push({node,original});
    }
    if(!parts.length)return;
    el.dataset.scramblePlayed='1';
    const start=performance.now();
    const tick=(now)=>{
      const p=Math.min(1,(now-start)/duration);
      parts.forEach((part,pi)=>{
        const chars=[...part.original];
        const reveal=Math.floor(chars.length*p);
        part.node.nodeValue=chars.map((ch,ci)=>{
          if(/\s/.test(ch))return ch;
          if(ci<reveal||p===1)return ch;
          return customPool[(pi*17+ci*29+Math.floor(now/36))%customPool.length];
        }).join('');
      });
      if(p<1)requestAnimationFrame(tick);
      else parts.forEach(part=>{part.node.nodeValue=part.original;});
    };
    requestAnimationFrame(tick);
  };

  const animateCount=(el)=>{
    if(!el||el.dataset.countPlayed==='1')return;
    const target=parseFloat(el.dataset.count||'0');
    const decimals=parseInt(el.dataset.decimals||'0',10);
    const duration=parseInt(el.dataset.duration||'720',10);
    if(Number.isNaN(target))return;
    el.dataset.countPlayed='1';
    const start=performance.now();
    const tick=(now)=>{
      const p=Math.min(1,(now-start)/duration);
      const eased=1-Math.pow(1-p,3);
      const value=target*eased;
      el.textContent=value.toFixed(decimals);
      if(p<1)requestAnimationFrame(tick);
      else el.textContent=target.toFixed(decimals);
    };
    requestAnimationFrame(tick);
  };

  const animateCountersIn=(scope)=>{
    if(!scope)return;
    scope.querySelectorAll('[data-count]').forEach(animateCount);
  };

  const installFocusMotion=(targets)=>{
    const valid=targets.filter(Boolean);
    if(!valid.length)return;
    const obs=new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting||entry.intersectionRatio<0.46)return;
        const target=entry.target;
        if(target.dataset.focusPlayed==='1')return;
        target.dataset.focusPlayed='1';
        const head=target.querySelector(':scope > .hm-wrap > .hm-section-head')||target.querySelector('.hm-section-head');
        scrambleText(head?.querySelector('.hm-section-no'),420,'0123456789');
        scrambleText(head?.querySelector('.hm-section-title'),760);
        animateCountersIn(target);
        target.querySelectorAll('.behavior-card').forEach(card=>card.classList.add('is-anim'));
      });
    },{threshold:[0.46,0.72]});
    valid.forEach(target=>obs.observe(target));
  };

  const wait=()=>{
    const main=document.getElementById('live-main');
    const brand=main?.querySelector('#brand');
    const data=main?.querySelector('#data');
    const problem=brand?.querySelector('.narrative-problem');
    const reality=brand?.querySelector('.narrative-reality');
    const signals=main?.querySelector('#data .narrative-signals');
    const journey=main?.querySelector('#journey');
    const direction=main?.querySelector('#direction');

    if(!main||!brand||!data||!problem||!reality||!signals||!journey||!direction){
      setTimeout(wait,60);
      return;
    }

    const brandHead=brand.querySelector(':scope > .hm-wrap > .hm-section-head');
    const brandTitle=brandHead?.querySelector('.hm-section-title');
    const brandDesc=brandHead?.querySelector('.hm-section-desc');
    if(brandTitle)brandTitle.innerHTML='구매 여정을 개선하기 전에,<br>왜 고객이 온라인에서 하이마트를<br>선택하지 않는지부터 정의했습니다.';
    if(brandDesc)brandDesc.innerHTML='고객의 인식과 실제 행동을 나눠 보고, <strong>두 결과가 함께 가리키는 단절</strong>만 문제로 남겼습니다.';

    const problemTitle=problem.querySelector('.narrative-title');
    const problemCopy=problem.querySelector('.narrative-copy');
    if(problemTitle)problemTitle.innerHTML='표면적인 데이터 분석만으로는<br>무엇을 바꿔야 할지 알 수 없었습니다.';
    if(problemCopy)problemCopy.innerHTML='고객이 말하는 인식과 실제 행동을 따로 본 뒤, <strong>같은 방향을 가리키는 문제만</strong> 남겼습니다.';

    const problemItems=[...problem.querySelectorAll('.problem-item')];
    if(problemItems[0]){
      const p=problemItems[0].querySelector('p');
      if(p)p.textContent='하이마트를 떠올리는지, 매장과 온라인에 어떤 기대를 갖는지 확인했습니다.';
    }
    if(problemItems[1]){
      const p=problemItems[1].querySelector('p');
      if(p)p.textContent='어디서 들어와 무엇을 보고, 어느 지점에서 다음 행동이 끊기는지 이용 데이터를 따라갔습니다.';
    }
    if(problemItems[2]){
      const h=problemItems[2].querySelector('h4');
      const p=problemItems[2].querySelector('p');
      if(h)h.innerHTML='두 이야기가<br>겹치는 지점만 남겼습니다.';
      if(p)p.textContent='고객 의견과 행동 데이터가 함께 지지하는 문제만 우선순위로 남겼습니다.';
    }

    const realityTitle=reality.querySelector('.narrative-title');
    const realityCopy=reality.querySelector('.narrative-copy');
    if(realityTitle)realityTitle.innerHTML='하이마트는 잊혀진 브랜드가 아니었습니다.<br>다만 강한 전문성이 온라인 경험으로<br>이어지지 않는 것이 문제였습니다.';
    if(realityCopy)realityCopy.innerHTML='최초 상기, 멀티 브랜드 비교, 직영 서비스는 강했습니다. 문제는 이 강점이 <strong>실제 경험과 선택, 반복 관계</strong>로 이어지지 않는 데 있었습니다.';

    const synthesis=reality.querySelector('.brand-synthesis');
    if(synthesis){
      synthesis.classList.remove('narrative-blue-synthesis');
      synthesis.classList.add('narrative-touchpoint-synthesis');
      synthesis.innerHTML=`
        <span class="narrative-subno synthesis-subno">01.3 / TRANSITION TOUCHPOINT</span>
        <h4>결국 문제는 인지가 아니라 전환 접점에 있었습니다.</h4>
        <div class="synthesis-list">
          <article class="synthesis-card positive">
            <b>이미 가지고 있던 강점</b>
            <p>멀티 브랜드 비교·상담, 전국 매장, 전문 인력,<br>설치·A/S 신뢰처럼 경쟁사가 쉽게 복제하기 어려운 오프라인 자산이 있었습니다.</p>
          </article>
          <article class="synthesis-card negative">
            <b>온라인에서 끊기던 지점</b>
            <p>인지 → 실제 경험 → 구매·예약 → 설치·케어 → 반복 구매로 갈수록<br>편의성과 연결성이 약해졌습니다.</p>
          </article>
        </div>`;
    }

    const dataHead=data.querySelector('.hm-section-head');
    const dataTitle=dataHead?.querySelector('.hm-section-title');
    const dataDesc=dataHead?.querySelector('.hm-section-desc');
    if(dataTitle)dataTitle.innerHTML='고객의 목소리에서 드러난 문제는<br>실제 이용 패턴에서도 반복됐습니다.';
    if(dataDesc)dataDesc.innerHTML='유입부터 구매까지 실제 행동을 따라가며, <strong>같은 단절이 반복되는지</strong> 확인했습니다.';

    const signalTitle=signals.querySelector('.narrative-title');
    if(signalTitle)signalTitle.innerHTML='고객은 찾아왔지만<br>그 다음으로 연결되지 못했습니다.';

    const behaviorGrid=signals.querySelector('.behavior-grid');
    if(behaviorGrid){
      behaviorGrid.innerHTML=`
        <article class="behavior-card">
          <small>ENTRY</small>
          <div class="behavior-card-top">
            <div class="behavior-value"><b data-count="68" data-decimals="0" data-duration="620">0</b><span>%</span></div>
            <h4>외부 맥락을 가진<br>유입</h4>
          </div>
          <p class="behavior-note">광고·CRM·검색 결과를 통해 들어온 비중이 높았습니다. 고객은 이미 맥락을 가진 채 들어왔지만, 그 다음 선택을 빠르게 이어 주는 구조는 충분하지 않았습니다.</p>
          <div class="behavior-rule"><i style="--w:68%"></i></div>
        </article>
        <article class="behavior-card">
          <small>CAMPAIGN → NEXT</small>
          <div class="behavior-card-top">
            <div class="behavior-value"><b data-count="52.2" data-decimals="1" data-duration="620">0.0</b><span>%</span></div>
            <h4>기획전에서 멈춘<br>다음 행동</h4>
          </div>
          <p class="behavior-note">기획전 랜딩 이후 절반 이상이 바로 종료됐고 상품 도달 9.3%, 검색·카테고리 도달 6.6%에 그쳤습니다. 관심은 만들었지만 다음 탐색으로 넘기는 연결이 약했습니다.</p>
          <div class="behavior-rule"><i style="--w:52.2%"></i></div>
        </article>
        <article class="behavior-card">
          <small>SEARCH INTENT</small>
          <div class="behavior-card-top">
            <div class="behavior-value"><b data-count="9.34" data-decimals="2" data-duration="640">0.00</b><span>%</span></div>
            <h4>검색 의도는 더<br>분명해졌습니다</h4>
          </div>
          <p class="behavior-note">검색 비중은 3.26%에서 9.34%로 높아졌습니다. 사용자는 더 명확한 목적을 가지고 들어왔지만, 그 의도를 빠르게 상품 판단과 비교로 연결할 구조는 충분하지 않았습니다.</p>
          <div class="behavior-rule"><i style="--w:66%"></i></div>
        </article>
        <article class="behavior-card">
          <small>CHECKOUT BIAS</small>
          <div class="behavior-card-top">
            <div class="behavior-value"><b data-count="3.1" data-decimals="1" data-duration="620">0.0</b><span>×</span></div>
            <h4>결제 직행이 장바구니보다<br>더 많았습니다</h4>
          </div>
          <p class="behavior-note">장바구니보다 결제 진입이 3.1배 많았고, PDP 이용은 증가했지만 실제 장바구니와 구매 전환은 줄었습니다. 중간 탐색을 줄이고 바로 결정을 돕는 설계가 필요했습니다.</p>
          <div class="behavior-rule"><i style="--w:78%"></i></div>
        </article>`;
    }

    const bridge=signals.querySelector('.narrative-bridge p');
    if(bridge)bridge.innerHTML='사용자 의견에서는 <strong>“온라인몰이 잘 떠오르지 않는다”</strong>는 이야기가 반복됐고, 실제 이용 데이터에서는 <strong>“들어와도 다음 단계로 이어지지 않는다”</strong>는 행동이 확인됐습니다. 두 결과가 같은 방향을 가리켰기 때문에 목표를 <strong>‘화면을 새로 만든다’가 아니라 ‘고객의 구매 여정 안에 자리를 만든다’</strong>로 다시 정의했습니다.';

    const journeyHead=journey.querySelector(':scope > .hm-wrap > .hm-section-head');
    const journeyTitle=journeyHead?.querySelector('.hm-section-title');
    const journeyDesc=journeyHead?.querySelector('.hm-section-desc');
    if(journeyTitle)journeyTitle.innerHTML='그래서 끊어진 여정을, 어디서 시작해도<br>다음 행동으로 이어지는 구조로<br>다시 설계했습니다.';
    if(journeyDesc)journeyDesc.textContent='모든 화면이 같은 방향으로 움직이도록, 구매 여정 전체의 원칙부터 정했습니다.';

    const principles=journey.querySelector('.principle-grid');
    if(principles){
      principles.innerHTML=`
        <article class="principle-item"><small>01 / FAMILIARITY</small><h4>익숙한 경험이<br>먼저입니다.</h4><p>검색·필터·상품카드·결제처럼 이미 학습한 커머스 문법은 그대로 활용합니다.</p></article>
        <article class="principle-item"><small>02 / NEXT STEP</small><h4>이어지는 경험을<br>만듭니다.</h4><p>각 화면의 역할을 ‘머무르게 하는 것’이 아니라 다음 판단으로 자연스럽게 보내는 데 둡니다.</p></article>
        <article class="principle-item"><small>03 / OMNI</small><h4>매장과 사람을<br>연결합니다.</h4><p>실물 확인과 전문가 상담이 필요한 순간 온라인에서 자연스럽게 오프라인 강점으로 연결합니다.</p></article>
        <article class="principle-item"><small>04 / NARROW</small><h4>고민의 시간을<br>줄입니다.</h4><p>카테고리 안에서는 많이 찾는 상품과 선택 기준을 먼저 보여 후보를 빠르게 좁힙니다.</p></article>
        <article class="principle-item"><small>05 / CONFIDENCE</small><h4>불확실성을<br>확신으로 바꿉니다.</h4><p>검색과 비교 과정에서 모호한 니즈를 구체적인 상품 후보와 판단 기준으로 바꿉니다.</p></article>
        <article class="principle-item"><small>06 / DECISION</small><h4>결정을 끝낼 수<br>있게 합니다.</h4><p>상세페이지에서 가격·혜택·설치·상담·케어를 함께 판단해 구매 결정을 완료하도록 돕습니다.</p></article>`;
    }

    const directionHead=direction.querySelector(':scope > .hm-wrap > .hm-section-head');
    const directionTitle=directionHead?.querySelector('.hm-section-title');
    const directionDesc=directionHead?.querySelector('.hm-section-desc');
    if(directionTitle)directionTitle.innerHTML='앞서 정의한 UX 전략을 바탕으로<br>빠르게 프로토타입을 만들고, 내부 검증을 반복하고 있습니다.';
    if(directionDesc)directionDesc.textContent='정의한 원칙을 화면과 인터랙션으로 옮기고, 내부 검증을 반복했습니다.';

    const standardRule=direction.querySelector('.design-rule article:first-child h4');
    if(standardRule)standardRule.innerHTML='익숙함은 적극적으로<br>가져옵니다.';

    direction.querySelectorAll('details.hm-more').forEach(details=>{
      if(!details.querySelector('.prototype-case,.production-v18-row,.production-prototype-row,.phone-card,.phone-gallery'))return;
      const body=details.querySelector('.hm-more-body');
      if(body){[...body.children].forEach(child=>details.parentElement.insertBefore(child,details));}
      details.remove();
    });
    direction.querySelectorAll('.prototype-case,.production-v18-row,.production-prototype-row,.phone-gallery').forEach(el=>{
      el.hidden=false;
      el.style.removeProperty('display');
      el.classList.add('narrative-prototype-visible');
    });

    installFocusMotion([brand,data,signals,journey,direction]);

    document.body.classList.add('narrative-v2-ready');
    window.dispatchEvent(new Event('scroll'));
  };

  wait();
})();
