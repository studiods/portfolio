(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;

  const cardByNo=no=>[...main.querySelectorAll('#data .data-card')]
    .find(card=>card.querySelector('.hm-card-no')?.textContent.includes(no));

  /* ---------- 03 / RESTORE TABLET-CLUSTER JOURNEY ----------
     v8 unwrapped the v7 clusters. Rebuild the exact v7 grouping after v8 has finished. */
  const journey=main.querySelector('#journey');
  const signal=journey?.querySelector('.journey-signal-subsection');
  if(signal){
    const groups=[...signal.querySelectorAll('.flow-group')];
    const buildCluster=(group,nodeCount,label,klass)=>{
      if(!group)return;
      const row=group.querySelector('.flow-row');
      if(!row)return;
      /* Remove a stale/partial cluster first so rebuild is deterministic. */
      [...row.querySelectorAll(':scope > .wide-flow-cluster')].forEach(cluster=>{
        const inner=cluster.querySelector('.wide-flow-cluster-inner');
        if(inner)[...inner.children].forEach(child=>row.insertBefore(child,cluster));
        cluster.remove();
      });
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

  /* ---------- 02.2 / GUARANTEE ONE TRAFFIC SVG ----------
     Earlier layers alternated between source SVG, static image and asynchronously mounted live SVG.
     Keep exactly one inline SVG. The class traffic-v5-live also prevents the shared engine from mounting a second copy. */
  const traffic=cardByNo('02.2');
  const trafficWrap=traffic?.querySelector('.chart-wrap');
  const trafficMarkup=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1160 330" class="chart-svg traffic-v5-live v9-traffic-svg" role="img" aria-label="2026년 1월부터 6월까지 세션, 구매건수, 구매전환율"><style>text{font-family:Arial,sans-serif;fill:rgba(255,255,255,.46);font-size:12px}.grid{stroke:rgba(255,255,255,.12);stroke-width:1}.session{stroke:#F3EB01;stroke-width:2}.purchase{fill:none;stroke:#00A6ED;stroke-width:.75;stroke-linecap:round;stroke-linejoin:round}.cvr{fill:none;stroke:#00EDBD;stroke-width:.75;stroke-linecap:round;stroke-linejoin:round}.p-dot{fill:#00B8DE}.c-dot{fill:#00EDBD}.right-blue{fill:#00A6ED}.right-green{fill:#00EDBD}</style><text x="0" y="22">SESSIONS</text><text x="0" y="58">6M</text><text x="0" y="158">3M</text><text x="0" y="258">0</text><line class="grid" x1="90" y1="50" x2="1070" y2="50"/><line class="grid" x1="90" y1="150" x2="1070" y2="150"/><line class="grid" x1="90" y1="250" x2="1070" y2="250"/><text class="right-blue" x="1088" y="64">42K</text><text class="right-blue" x="1088" y="158">39K</text><text class="right-blue" x="1088" y="252">36K</text><text class="right-green" x="1088" y="88">1.2%</text><text class="right-green" x="1088" y="180">0.9%</text><text class="right-green" x="1088" y="272">0.6%</text><line class="session" x1="145" y1="95" x2="145" y2="250"/><line class="session" x1="325" y1="132" x2="325" y2="250"/><line class="session" x1="505" y1="102" x2="505" y2="250"/><line class="session" x1="685" y1="61" x2="685" y2="250"/><line class="session" x1="865" y1="64" x2="865" y2="250"/><line class="session" x1="1045" y1="97" x2="1045" y2="250"/><polyline class="purchase" points="145,78 325,182 505,184 685,183 865,132 1045,117"/><circle class="p-dot" cx="145" cy="78" r="3"/><circle class="p-dot" cx="325" cy="182" r="3"/><circle class="p-dot" cx="505" cy="184" r="3"/><circle class="p-dot" cx="685" cy="183" r="3"/><circle class="p-dot" cx="865" cy="132" r="3"/><circle class="p-dot" cx="1045" cy="117" r="3"/><polyline class="cvr" points="145,170 325,85 505,185 685,240 865,226 1045,174"/><circle class="c-dot" cx="145" cy="170" r="2.5"/><circle class="c-dot" cx="325" cy="85" r="2.5"/><circle class="c-dot" cx="505" cy="185" r="2.5"/><circle class="c-dot" cx="685" cy="240" r="2.5"/><circle class="c-dot" cx="865" cy="226" r="2.5"/><circle class="c-dot" cx="1045" cy="174" r="2.5"/><text x="133" y="300">1월</text><text x="313" y="300">2월</text><text x="493" y="300">3월</text><text x="673" y="300">4월</text><text x="853" y="300">5월</text><text x="1033" y="300">6월</text></svg>`;

  const ensureSingleTraffic=()=>{
    if(!trafficWrap)return null;
    trafficWrap.querySelectorAll('.wide-traffic-image').forEach(el=>el.remove());
    trafficWrap.querySelectorAll('.chart-svg:not(.traffic-v5-live)').forEach(el=>el.remove());
    let svgs=[...trafficWrap.querySelectorAll('.traffic-v5-live')];
    if(!svgs.length){
      const holder=document.createElement('div');
      holder.innerHTML=trafficMarkup;
      const svg=holder.firstElementChild;
      const legend=trafficWrap.querySelector('.wide-traffic-legend,.chart-legend');
      trafficWrap.insertBefore(svg,legend||trafficWrap.firstChild);
      svgs=[svg];
    }
    svgs.slice(1).forEach(el=>el.remove());
    return svgs[0];
  };

  const prepTrafficSvg=svg=>{
    if(!svg)return;
    [...svg.querySelectorAll('.session')].forEach((shape,index)=>{
      const length=Math.max(1,shape.getTotalLength());
      shape.style.strokeDasharray=String(length);
      shape.style.strokeDashoffset=String(length);
      shape.style.transition=`stroke-dashoffset 460ms cubic-bezier(.2,.8,.2,1) ${index*70}ms`;
    });
    const purchase=svg.querySelector('.purchase');
    if(purchase){
      const length=Math.max(1,purchase.getTotalLength());
      purchase.style.strokeDasharray=String(length);
      purchase.style.strokeDashoffset=String(length);
      purchase.style.transition='stroke-dashoffset 820ms cubic-bezier(.2,.8,.2,1) 620ms';
    }
    [...svg.querySelectorAll('.p-dot')].forEach((dot,index)=>{
      dot.style.opacity='0';
      dot.style.transition=`opacity 180ms ease ${1320+index*45}ms`;
    });
    const cvr=svg.querySelector('.cvr');
    if(cvr){
      const length=Math.max(1,cvr.getTotalLength());
      cvr.style.strokeDasharray=String(length);
      cvr.style.strokeDashoffset=String(length);
      cvr.style.transition='stroke-dashoffset 820ms cubic-bezier(.2,.8,.2,1) 1500ms';
    }
    [...svg.querySelectorAll('.c-dot')].forEach((dot,index)=>{
      dot.style.opacity='0';
      dot.style.transition=`opacity 180ms ease ${2200+index*45}ms`;
    });
  };

  const activateTraffic=()=>{
    const svg=ensureSingleTraffic();
    if(!svg)return;
    [...svg.querySelectorAll('.session')].forEach(shape=>shape.style.strokeDashoffset='0');
    const purchase=svg.querySelector('.purchase');if(purchase)purchase.style.strokeDashoffset='0';
    [...svg.querySelectorAll('.p-dot')].forEach(dot=>dot.style.opacity='1');
    const cvr=svg.querySelector('.cvr');if(cvr)cvr.style.strokeDashoffset='0';
    [...svg.querySelectorAll('.c-dot')].forEach(dot=>dot.style.opacity='1');
  };

  const trafficSvg=ensureSingleTraffic();
  prepTrafficSvg(trafficSvg);

  /* ---------- ONE MOTION OWNER FOR EVERY CURRENT GRAPH TYPE ----------
     v5-v8 changed chart DOM class names several times. Reset all current graph types into one v9
     state, then activate only when they enter the viewport. This makes old shared is-chart-active /
     is-wide-chart-active classes harmless. */
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets=[];
  const add=(el,type)=>{
    if(!el||targets.some(item=>item.el===el))return;
    el.classList.add('v9-chart-motion');
    el.classList.remove('is-v9-chart-active');
    targets.push({el,type});
  };

  main.querySelectorAll('#brand .ring-card').forEach(el=>add(el,'ring'));
  add(main.querySelector('#brand .sentiment-graph'),'sentiment');
  add(main.querySelector('#brand .conclusion-grid'),'sentiment');
  main.querySelectorAll('#data .wide-segmented-bar').forEach(el=>add(el,'segmented'));
  add(main.querySelector('#data .search-slope'),'search');
  add(main.querySelector('#data .wide-home-bars'),'home');
  if(trafficWrap)add(trafficWrap,'traffic');

  const activate=item=>{
    if(!item||item.el.classList.contains('is-v9-chart-active'))return;
    item.el.classList.add('is-v9-chart-active');
    if(item.type==='traffic')activateTraffic();
  };

  const visible=item=>{
    const rect=item.el.getBoundingClientRect();
    return rect.top<innerHeight*.92&&rect.bottom>innerHeight*.08;
  };

  if(reduced){
    targets.forEach(activate);
  }else{
    /* One frame reset is required even when an old observer has already marked a chart active. */
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        targets.filter(visible).forEach((item,index)=>setTimeout(()=>activate(item),120+index*50));
      });
    });
    if('IntersectionObserver' in window){
      const map=new Map(targets.map(item=>[item.el,item]));
      const observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(!entry.isIntersecting)return;
          const item=map.get(entry.target);
          if(item)activate(item);
          observer.unobserve(entry.target);
        });
      },{threshold:.14,rootMargin:'0px 0px -7% 0px'});
      targets.forEach(item=>observer.observe(item.el));
    }else{
      targets.forEach((item,index)=>setTimeout(()=>activate(item),100+index*55));
    }
  }

  /* The shared traffic script can arrive after v9. If it touches the wrapper, dedupe again without
     replacing our prepared SVG. */
  if(trafficWrap&&'MutationObserver' in window){
    const mo=new MutationObserver(()=>{
      const svg=ensureSingleTraffic();
      if(svg&&!svg.dataset.v9Prepared){
        svg.dataset.v9Prepared='1';
        prepTrafficSvg(svg);
        if(trafficWrap.classList.contains('is-v9-chart-active'))requestAnimationFrame(activateTraffic);
      }
    });
    mo.observe(trafficWrap,{childList:true,subtree:false});
    if(trafficSvg)trafficSvg.dataset.v9Prepared='1';
  }
})();

/* Isolated rollback loader: affects only the 03 journey treatment. */
(() => {
  'use strict';
  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='./himart-wide-refine-v10.css?v=9013c72';
  document.head.appendChild(css);
  const script=document.createElement('script');
  script.src='./himart-wide-refine-v10.js?v=8850f1d';
  document.body.appendChild(script);
})();
