(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;

  const cardByNo=no=>[...main.querySelectorAll('#data .data-card')]
    .find(card=>card.querySelector('.hm-card-no')?.textContent.includes(no));

  /* ---------- NUMBERING ----------
     Decimal titles use 1. / 2. / 3. rather than 01. / 02. / 03. */
  const normalizeLeadingZero=(root)=>{
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    let node;
    while((node=walker.nextNode()))nodes.push(node);
    nodes.forEach(textNode=>{
      textNode.nodeValue=textNode.nodeValue.replace(/(^|\s)0([1-9])\./g,'$1$2.');
    });
  };
  main.querySelectorAll(
    '#brand .hm-subtitle, #brand .direction-card h4, #journey .hm-subtitle, #journey .forced-redesign-title, .wide-title-index'
  ).forEach(normalizeLeadingZero);

  /* ---------- 02.2 / TRAFFIC ----------
     IMPORTANT: do not keep a static image here. himart-flow-line-sync-v1.js mounts the inline
     traffic-v5 SVG after this script and that inline SVG is the element that receives stroke drawing.
     Keeping the v8 <img> as well caused the same graph to render twice. */
  const traffic=cardByNo('02.2');
  const trafficWrap=traffic?.querySelector('.chart-wrap');
  if(trafficWrap){
    trafficWrap.className='data-viz chart-wrap wide-unified-traffic';
    trafficWrap.innerHTML=`
      <div class="wide-traffic-legend" aria-hidden="true">
        <span><i style="--c:var(--hm-yellow)"></i>세션</span>
        <span><i style="--c:var(--hm-newblue)"></i>구매건수</span>
        <span><i style="--c:var(--hm-green)"></i>구매전환율</span>
      </div>`;
  }

  /* ---------- 02.5 / HOME ----------
     Rebuild from source values, but preserve the legacy hbars / hbar / track / fill class names.
     The shared motion engine keys off those class names; v8 previously removed them, which made
     the HOME drawing animation disappear. */
  const home=cardByNo('02.5');
  const hbars=home?.querySelector('.data-viz.hbars');
  if(hbars){
    const rows=[...hbars.querySelectorAll('.hbar')].map((row,i)=>({
      label:row.querySelector('span')?.textContent?.trim()||'',
      value:row.querySelector('b')?.textContent?.trim()||'',
      width:row.querySelector('.fill')?.style?.width||'0%',
      color:[
        'var(--hm-blue)',
        'var(--hm-newblue)',
        'var(--hm-green)',
        'var(--hm-yellow)',
        'rgba(255,255,255,.34)',
        'rgba(255,255,255,.18)'
      ][i]||'var(--hm-blue)'
    }));
    hbars.className='data-viz hbars wide-home-bars';
    hbars.innerHTML=rows.map(row=>`
      <div class="hbar wide-home-bar">
        <span class="wide-home-bar-label">${row.label}</span>
        <div class="track wide-home-bar-track"><i class="fill wide-home-bar-fill" style="width:${row.width};--wide-bar-color:${row.color}"></i></div>
        <b class="wide-home-bar-value">${row.value}</b>
      </div>`).join('');
  }

  /* ---------- 03 / JOURNEY ROLLBACK ----------
     v7 physically moved AS-IS nodes into tablet clusters. Restore the pre-v7 DOM order so the
     first 03 visualization can return to the rectangular wide-layout version. The redesign area
     is intentionally left alone; only its circles are recolored by CSS. */
  const journey=main.querySelector('#journey');
  const signal=journey?.querySelector('.journey-signal-subsection');
  if(signal){
    [...signal.querySelectorAll('.wide-flow-cluster')].forEach(cluster=>{
      const row=cluster.parentElement;
      const inner=cluster.querySelector('.wide-flow-cluster-inner');
      if(!row||!inner)return;
      [...inner.children].forEach(child=>row.insertBefore(child,cluster));
      cluster.remove();
    });
  }

  /* ---------- WIDE-SPECIFIC DRAW MOTION ----------
     The original shared motion selector predates the v5 segmented bars and v8 rebuilt HOME bars.
     It only knows .pie / .chart-wrap / .search-slope / .hbars / .landing-chart. Add a small,
     page-local observer for the new graph structures instead of changing production/shared pages. */
  const mountWideDrawMotion=()=>{
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets=[];

    main.querySelectorAll('#data .wide-segmented-bar').forEach(el=>{
      el.classList.add('wide-draw-motion');
      targets.push(el);
    });
    main.querySelectorAll('#data .wide-home-bars').forEach(el=>{
      el.classList.add('wide-draw-motion');
      targets.push(el);
    });
    main.querySelectorAll('#brand .ring-card').forEach(el=>targets.push(el));
    main.querySelectorAll('#brand .sentiment-graph, #brand .conclusion-grid').forEach(el=>targets.push(el));

    const activate=el=>{
      if(!el||el.classList.contains('is-wide-chart-active'))return;
      el.classList.add('is-wide-chart-active');
    };

    if(reduced){
      targets.forEach(activate);
      return;
    }

    const visible=el=>{
      const rect=el.getBoundingClientRect();
      return rect.top<innerHeight*.94&&rect.bottom>innerHeight*.06;
    };
    targets.filter(visible).forEach((el,i)=>setTimeout(()=>activate(el),80+i*55));

    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(!entry.isIntersecting)return;
          activate(entry.target);
          observer.unobserve(entry.target);
        });
      },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
      targets.forEach(el=>observer.observe(el));
    }else{
      targets.forEach(activate);
    }

    /* Dynamic source insertion and mobile desktop-view can move the initial geometry after mount. */
    setTimeout(()=>targets.filter(visible).forEach(activate),700);
  };

  mountWideDrawMotion();

  /* Re-run numbering normalization once more after all v8 DOM replacements. */
  main.querySelectorAll('.wide-title-index, #journey .hm-subtitle, #journey .forced-redesign-title')
    .forEach(normalizeLeadingZero);
})();
