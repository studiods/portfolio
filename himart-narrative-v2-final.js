(()=>{
'use strict';
const KO='가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허고노도로모보소오조초코토포호';
const q=(r,s)=>r?.querySelector(s)||null;
const qa=(r,s)=>r?[...r.querySelectorAll(s)]:[];
const rm=e=>{if(e?.isConnected)e.remove()};
const mainNums=[['brand','01'],['data','02'],['journey','03'],['direction','04']];

function scramble(el,d=680,pool=KO){
  if(!el||el.dataset.sc==='1')return;
  const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),a=[];
  while(w.nextNode())if(w.currentNode.nodeValue?.trim())a.push([w.currentNode,w.currentNode.nodeValue]);
  if(!a.length)return;
  el.dataset.sc='1';
  const st=performance.now();
  (function t(now){
    const p=Math.min(1,(now-st)/d);
    a.forEach(([n,o],k)=>{
      const c=[...o],r=Math.floor(c.length*p);
      n.nodeValue=c.map((x,i)=>/\s|[0-9.,%×/·→—–()]/.test(x)||i<r||p===1?x:pool[(k*11+i*17+Math.floor(now/42))%pool.length]).join('');
    });
    if(p<1)requestAnimationFrame(t);else a.forEach(([n,o])=>n.nodeValue=o);
  })(st);
}

function count(el){
  if(!el||el.dataset.done)return;
  const v=+el.dataset.count,d=+el.dataset.decimals||0,st=performance.now();
  el.dataset.done='1';
  (function t(now){
    const p=Math.min(1,(now-st)/620),e=1-Math.pow(1-p,3);
    el.textContent=(v*e).toFixed(d);
    if(p<1)requestAnimationFrame(t);else el.textContent=v.toFixed(d);
  })(st);
}

function numbers(main){
  mainNums.forEach(([id,n])=>{
    const s=q(main,'#'+id),h=q(s,':scope > .hm-wrap > .hm-section-head');
    if(!h)return;
    let x=q(h,'.hm-section-no');
    if(!x){
      x=document.createElement('span');
      x.className='hm-section-no';
      h.prepend(x);
    }
    x.textContent=n;
    x.style.setProperty('font-size','16px','important');
    x.style.setProperty('margin','0 0 16px','important');
    qa(h,'.hm-section-no').forEach(y=>{if(y!==x)rm(y)});
    qa(s,'.hm-section-no').forEach(y=>{if(y!==x)rm(y)});
  });
  qa(main,'.narrative-subno,.synthesis-subno,.hm-subno,.hm-card-no,.journey-deep-kicker').forEach(x=>x.style.setProperty('font-size','12px','important'));
}

function brand(main){
  const s=q(main,'#brand'),h=q(s,':scope > .hm-wrap > .hm-section-head'),p=q(s,'.narrative-problem'),r=q(s,'.narrative-reality');
  if(!s||!h||!p||!r)return;
  q(h,'.hm-section-title').innerHTML='구매 여정을 개선하기 전에,<br>왜 고객이 온라인에서 하이마트를<br>선택하지 않는지부터 정의했습니다.';
  const hd=q(h,'.hm-section-desc');
  if(hd)hd.innerHTML='고객의 인식과 실제 행동을 나눠 보고, <strong>두 결과가 함께 가리키는 단절</strong>만 문제로 남겼습니다.';
  if(q(p,'.narrative-title'))q(p,'.narrative-title').innerHTML='표면적인 데이터 분석만으로는<br>무엇을 바꿔야 할지 알 수 없었습니다.';
  if(q(p,'.narrative-copy'))q(p,'.narrative-copy').innerHTML='고객이 말하는 인식과 실제 행동을 따로 본 뒤, <strong>같은 방향을 가리키는 문제만</strong> 남겼습니다.';
  const items=qa(p,'.problem-item');
  const pc=['하이마트를 떠올리는 방식과 매장·온라인에 기대하는 역할을 확인했습니다.','유입부터 다음 행동이 끊기는 지점까지 이용 데이터를 따라갔습니다.','고객 의견과 행동 데이터가 함께 가리킨 문제만 남겼습니다.'];
  items.forEach((x,i)=>{const z=q(x,'p');if(z&&pc[i])z.textContent=pc[i]});
  if(items[2]&&q(items[2],'h4'))q(items[2],'h4').innerHTML='두 이야기가<br>겹치는 지점만 남겼습니다.';
  if(q(r,'.narrative-title'))q(r,'.narrative-title').innerHTML='하이마트는 잊혀진 브랜드가 아니었습니다.<br>다만 강한 전문성이 온라인 경험으로<br>이어지지 않는 것이 문제였습니다.';
  if(q(r,'.narrative-copy'))q(r,'.narrative-copy').innerHTML='최초 상기·멀티 브랜드 비교·직영 서비스는 강했지만, <strong>실제 경험과 반복 관계</strong>로 이어지지 않았습니다.';
  const proof=qa(r,'.proof-item');
  const rc=['강한 브랜드 인지가 실제 온라인 경험으로 이어지지 않았습니다.','서비스 인지가 실제 이용 경험으로 넘어가는 지점에서 큰 병목이 있었습니다.','서비스 평가는 좋았지만 최종 선택은 제조사 선호가 더 강했습니다.','낮은 구매 빈도와 구매 후 접점 부족으로 반복 관계가 약했습니다.'];
  proof.forEach((x,i)=>{const z=q(x,'p');if(z&&rc[i])z.textContent=rc[i]});
  const syn=q(r,'.brand-synthesis');
  if(syn){
    syn.className='brand-synthesis narrative-touchpoint-synthesis';
    syn.innerHTML='<span class="narrative-subno synthesis-subno">01.3 / TRANSITION TOUCHPOINT</span><h4>결국 문제는 인지가 아니라 전환 접점에 있었습니다.</h4><div class="synthesis-list"><article class="synthesis-card positive"><b>이미 가지고 있던 강점</b><p>멀티 브랜드 비교·상담, 전국 매장, 전문 인력,<br>설치·A/S 신뢰처럼 복제하기 어려운 오프라인 자산이 있었습니다.</p></article><article class="synthesis-card negative"><b>온라인에서 끊기던 지점</b><p>인지 → 경험 → 구매·예약 → 설치·케어 → 반복 구매로 갈수록<br>편의성과 연결성이 약해졌습니다.</p></article></div>';
  }
}

function data(main){
  const s=q(main,'#data'),h=q(s,':scope > .hm-wrap > .hm-section-head'),g=q(s,'.narrative-signals');
  if(!s||!h||!g)return;
  q(h,'.hm-section-title').innerHTML='고객의 목소리에서 드러난 문제는<br>실제 이용 패턴에서도 반복됐습니다.';
  const d=q(h,'.hm-section-desc');
  if(d)d.innerHTML='유입부터 구매까지 실제 행동을 따라가며, <strong>같은 단절이 반복되는지</strong> 확인했습니다.';
  if(q(g,'.narrative-title'))q(g,'.narrative-title').innerHTML='고객은 찾아왔지만<br>그 다음으로 연결되지 못했습니다.';
  let grid=q(g,'.behavior-grid,.signal-grid');
  if(grid){
    grid.className='behavior-grid';
    grid.innerHTML='<article class="behavior-card"><div class="behavior-value"><b data-count="68" data-decimals="0">0</b><span>%</span></div><h4>외부 맥락을 가진 유입</h4><p class="behavior-note">AD·CPS·CRM 유입이 68%. 하나의 ‘홈 시작’만으로 설계하기 어려웠습니다.</p></article><article class="behavior-card"><div class="behavior-value"><b data-count="52.2" data-decimals="1">0.0</b><span>%</span></div><h4>기획전 시작 후 바로 종료</h4><p class="behavior-note">유입은 만들었지만 다음 탐색 전 흐름이 끝나는 비중이 가장 컸습니다.</p></article><article class="behavior-card"><div class="behavior-value"><b data-count="3.1" data-decimals="1">0.0</b><span>×</span></div><h4>결제 진입이 장바구니보다 많음</h4><p class="behavior-note">1월 모바일 결제 진입 75,808건으로 장바구니 24,237건의 3배 이상이었습니다.</p></article><article class="behavior-card"><div class="behavior-value"><b data-count="9.34" data-decimals="2">0.00</b><span>%</span></div><h4>세션 대비 검색 비중</h4><p class="behavior-note">검색 비중은 3.26%→9.34%. 구매 후보를 만드는 핵심 행동으로 커졌습니다.</p></article>';
  }
  const b=q(g,'.narrative-bridge p');
  if(b)b.innerHTML='사용자 의견에서는 <strong>“온라인몰이 잘 떠오르지 않는다”</strong>는 이야기가 반복됐고, 실제 이용 데이터에서는 <strong>“들어와도 다음 단계로 이어지지 않는다”</strong>는 행동이 확인됐습니다. 두 결과가 같은 방향을 가리켜 목표를 <strong>‘화면을 새로 만든다’가 아니라 ‘고객의 구매 여정 안에 자리를 만든다’</strong>로 다시 정의했습니다.';
}

const fn=(n,t,p)=>`<article class="flow-node"><span class="hm-card-no">${n}</span><h4>${t}</h4><p>${p}</p></article>`;
const ar=()=>'<div class="flow-arrow">›</div>';
const roles=[
  ['HOME','원하는 곳으로<br>보내주는 허브','최근 관심 상품·혜택·서비스를 기억하고 원하는 목적지로 바로 이어줍니다.'],
  ['CATEGORY','고민의 시간을<br>줄이는 곳','선택 기준을 먼저 보여 카테고리 안에서 후보를 빠르게 좁힙니다.'],
  ['SEARCH','모호한 니즈를<br>후보로 바꾸는 곳','정확한 모델명을 몰라도 목적을 상품 후보와 판단 기준으로 바꿉니다.'],
  ['SRP · PLP','비교를<br>끝내는 곳','가격·혜택·배송·설치·리뷰·스펙을 한눈에 비교해 후보를 압축합니다.'],
  ['PDP','구매 확신을<br>형성하는 곳','가격·설치·리뷰·혜택·상담·서비스를 함께 보여 구매 확신을 만듭니다.'],
  ['CART','선택 조건을<br>정리하는 곳','옵션·혜택·설치 조건과 최종 금액을 다시 확인해 이탈을 줄입니다.'],
  ['CHECKOUT','결제를<br>완료하는 곳','결제 수단·혜택·배송 조건을 한 번에 확인하고 결제를 끝냅니다.'],
  ['FULFILL','설치·회수를<br>확정하는 곳','설치 일정과 기존 제품 회수 정보를 명확히 안내합니다.'],
  ['MY · CARE','구매 이후 관계를<br>이어가는 곳','케어·수리·이전설치·점검을 상품 이력과 연결합니다.']
];

function flow(){
  const s=document.createElement('section');
  s.className='hm-subsection journey-redesign-subsection journey-flow-block';
  s.innerHTML=`<span class="narrative-subno">03.1 / JOURNEY FLOW</span><h3 class="journey-block-title">화면 순서가 아니라,<br>고객 판단의 흐름으로 다시 연결했습니다.</h3><p class="journey-block-copy">문제는 유입보다 다음 행동의 단절이었습니다. 고객 판단 흐름으로 다시 연결했습니다.</p><div class="journey-stage-flow"><div class="journey-flow-row flow-row row4 row-top"><div class="journey-row-group"><span class="group-label">유입 맥락을 유지해 탐색 시작으로 연결</span></div>${fn('01','유입','광고·검색·CRM의 맥락을 이어받습니다.')}${ar()}${fn('02','탐색','목적에 맞는 상품 탐색을 바로 시작합니다.')}${ar()}${fn('03','후보 압축','비교할 후보를 빠르게 줄입니다.')}${ar()}${fn('04','비교·판단','가격·혜택·설치 조건으로 판단합니다.')}</div><div class="journey-flow-row flow-row row4 row-bottom"><div class="journey-row-group"><span class="group-label">결제 조건을 명확히 해 이탈을 줄이고 설치 확신까지 연결</span></div>${fn('05','장바구니','선택 상품과 조건을 다시 확인합니다.')}${ar()}${fn('06','결제','최종 비용과 혜택을 명확히 확정합니다.')}${ar()}${fn('07','설치','일정·회수·설치를 끊김 없이 잇습니다.')}${ar()}${fn('08','관리','A/S·케어·재구매로 관계를 이어갑니다.')}</div></div>`;
  return s;
}

function role(){
  const s=document.createElement('section');
  s.className='journey-role-block';
  s.innerHTML=`<span class="narrative-subno">03.2 / ROLE DEFINITION</span><h3 class="journey-block-title">그리고 각 화면은,<br>다음 행동을 만드는 역할로 다시 정의했습니다.</h3><p class="journey-block-copy">각 접점의 목적을 ‘무엇을 보여줄 것인가’가 아니라 ‘다음에 무엇을 할 수 있어야 하는가’로 정의했습니다.</p><div class="journey-role-grid">${roles.map(x=>`<article><small>${x[0]}</small><h4>${x[1]}</h4><p>${x[2]}</p></article>`).join('')}</div>`;
  return s;
}

function fallbackProductionSection(kind,flowArea){
  if(!flowArea)return null;
  const s=document.createElement('div');
  const signal=kind==='signal';
  s.className=`hm-subsection hm-reveal ${signal?'journey-signal-subsection':'journey-redesign-subsection'} v2-production-copy`;
  s.innerHTML=`<div class="hm-subhead"><span class="hm-subno">${signal?'03.1 / JOURNEY SIGNALS':'03.2 / JOURNEY REDESIGN'}</span><div><h3 class="${signal?'hm-subtitle':'forced-redesign-title'}">${signal?'1. 데이터를 하나의 여정으로 연결해 보니,<br>다음 행동이 약해지는 위치가 더 명확해졌습니다.':'2. 끊어진 지점을 기준으로, 각 단계가<br>다음 행동을 이어주도록 다시 연결했습니다.'}</h3><p class="hm-subcopy">${signal?'신호를 구매 흐름에 놓고 다음 행동이 약해지는 위치를 표시했습니다.':'앞 단계의 맥락과 판단 기준이 다음 화면까지 이어지도록 역할을 연결했습니다.'}</p></div></div>`;
  const clone=flowArea.cloneNode(true);
  const fh=q(clone,'.flow-head');if(fh)rm(fh);
  s.appendChild(clone);
  return s;
}

function more(signal,redesign){
  const d=document.createElement('details');
  d.className='hm-more journey-more';
  d.innerHTML='<summary>여정 연결 구조 자세히 보기<span>JOURNEY ANALYSIS</span></summary><div class="hm-more-body journey-more-inner"></div>';
  const body=q(d,'.journey-more-inner');
  [signal,redesign].filter(Boolean).forEach(src=>{
    const clone=src.cloneNode(true);
    clone.classList.add('v2-production-copy');
    body.appendChild(clone);
  });
  return d;
}

function journey(main){
  const s=q(main,'#journey'),w=q(s,':scope > .hm-wrap'),h=q(w,':scope > .hm-section-head');
  if(!s||!w||!h)return;

  const candidates=qa(w,'.hm-subsection');
  let prodSignal=candidates.find(x=>/데이터를 하나의 여정으로 연결해 보니/.test(x.textContent||'')||/JOURNEY SIGNALS/.test(x.textContent||''))||null;
  let prodRedesign=candidates.find(x=>/끊어진 지점을 기준으로/.test(x.textContent||'')||/JOURNEY REDESIGN/.test(x.textContent||''))||null;

  if(!prodSignal){
    const dataFlow=q(main,'#data .flow-area');
    prodSignal=fallbackProductionSection('signal',dataFlow);
  }
  if(!prodRedesign){
    const directFlow=q(w,':scope > .flow-area')||q(w,'.flow-area');
    prodRedesign=fallbackProductionSection('redesign',directFlow);
  }

  const signalCopy=prodSignal?.cloneNode(true)||null;
  const redesignCopy=prodRedesign?.cloneNode(true)||null;

  q(h,'.hm-section-title').innerHTML='앞선 데이터를 바탕으로,<br>구매 여정의 흐름과 각 화면의 역할을<br>다시 정의했습니다.';
  const d=q(h,'.hm-section-desc');
  if(d)d.textContent='먼저 고객의 판단 흐름을 만들고, 그 흐름 안에서 각 화면이 맡아야 할 역할을 다시 정의했습니다.';

  qa(w,':scope > .journey-flow-block,:scope > .journey-role-block,:scope > details.journey-more,:scope > .journey-principle-block,:scope > .principle-grid,:scope > .hm-subsection,:scope > .flow-area').forEach(rm);
  qa(w,'details.hm-more').forEach(x=>{/ROLE DEFINITION|여정별 역할/.test(x.textContent||'')&&rm(x)});

  const f=flow(),r=role(),m=more(signalCopy,redesignCopy);
  h.insertAdjacentElement('afterend',f);
  f.insertAdjacentElement('afterend',r);
  r.insertAdjacentElement('afterend',m);
}

function direction(main){
  const s=q(main,'#direction'),h=q(s,':scope > .hm-wrap > .hm-section-head');
  if(!s||!h)return;
  q(h,'.hm-section-title').innerHTML='앞서 정의한 UX 전략을 바탕으로<br>빠르게 프로토타입을 만들고, 내부 검증을 반복하고 있습니다.';
  const d=q(h,'.hm-section-desc');
  if(d)d.textContent='정의한 원칙을 화면과 인터랙션으로 옮기고, 내부 검증을 반복했습니다.';
  const a=q(s,'.design-rule article:first-child h4');
  if(a)a.innerHTML='익숙함은 적극적으로<br>가져옵니다.';
  qa(s,'details.hm-more').forEach(x=>{
    if(q(x,'.prototype-case,.production-v18-row,.production-prototype-row,.phone-card,.phone-gallery')){
      const b=q(x,'.hm-more-body');
      if(b)qa(b,':scope > *').forEach(c=>x.parentElement.insertBefore(c,x));
      rm(x);
    }
  });
}

function motion(main){
  const obs=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting||e.intersectionRatio<.42||e.target.dataset.focusPlayed)return;
    e.target.dataset.focusPlayed='1';
    const h=q(e.target,':scope > .hm-wrap > .hm-section-head');
    scramble(q(h,'.hm-section-no'),350,'0123456789');
    scramble(q(h,'.hm-section-title'),680,KO);
    qa(e.target,'[data-count]').forEach(count);
  }),{threshold:[.42,.65]});
  mainNums.map(x=>q(main,'#'+x[0])).filter(Boolean).forEach(x=>obs.observe(x));
}

function run(){
  const main=document.getElementById('live-main');
  if(!main||!q(main,'#brand .narrative-problem')||!q(main,'#data .narrative-signals')||!q(main,'#journey')||!q(main,'#direction')){
    setTimeout(run,50);
    return;
  }
  brand(main);
  data(main);
  journey(main);
  direction(main);
  numbers(main);
  document.body.classList.add('narrative-v2-final-ready','journey-title-canonical');
  motion(main);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();