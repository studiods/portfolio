(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;

  const cardByNo=no=>[...main.querySelectorAll('#data .data-card')]
    .find(card=>card.querySelector('.hm-card-no')?.textContent.includes(no));

  /* ---------- NUMBERING ----------
     Latest rule: decimal titles use 1. / 2. / 3. rather than 01. / 02. / 03. */
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
     Replace the old layered chart DOM with one proportional SVG image so mobile desktop-view
     never renders the chart as separate upper/lower plots. */
  const traffic=cardByNo('02.2');
  const trafficWrap=traffic?.querySelector('.chart-wrap');
  if(trafficWrap){
    trafficWrap.className='data-viz chart-wrap wide-unified-traffic';
    trafficWrap.innerHTML=`
      <img class="wide-traffic-image" src="./himart-traffic-v5.svg?v=81da379" alt="2026년 1월부터 6월까지 세션, 구매건수, 구매전환율을 하나의 시간축에 표시한 그래프">
      <div class="wide-traffic-legend" aria-hidden="true">
        <span><i style="--c:var(--hm-yellow)"></i>세션</span>
        <span><i style="--c:var(--hm-newblue)"></i>구매건수</span>
        <span><i style="--c:var(--hm-green)"></i>구매전환율</span>
      </div>`;
  }

  /* ---------- 02.5 / HOME ----------
     Rebuild the bars from the values already present in the source DOM. No data is changed. */
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
    hbars.className='data-viz wide-home-bars';
    hbars.innerHTML=rows.map(row=>`
      <div class="wide-home-bar">
        <span class="wide-home-bar-label">${row.label}</span>
        <div class="wide-home-bar-track"><i class="wide-home-bar-fill" style="width:${row.width};--wide-bar-color:${row.color}"></i></div>
        <b class="wide-home-bar-value">${row.value}</b>
      </div>`).join('');
  }

  /* Re-run the numbering normalization once more after all v8 DOM replacements. */
  main.querySelectorAll('.wide-title-index, #journey .hm-subtitle, #journey .forced-redesign-title')
    .forEach(normalizeLeadingZero);
})();
