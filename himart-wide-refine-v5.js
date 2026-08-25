(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;

  const stripPrefix=(html='')=>html
    .replace(/^\s*(?:0?\d+|[IVXLCDM]+)\.\s*/i,'')
    .replace(/^\s*<span[^>]*class=["'][^"']*(?:wide-title-index|wide-roman-index)[^"']*["'][^>]*>.*?<\/span>\s*/i,'');

  const numbered=(el,label,klass='wide-title-index')=>{
    if(!el)return;
    el.innerHTML=`<span class="${klass}">${label}.</span> ${stripPrefix(el.innerHTML)}`;
  };

  const subByNo=(root,no)=>[...(root||main).querySelectorAll('.hm-subsection')]
    .find(s=>s.querySelector('.hm-subno')?.textContent.includes(no));
  const cardByNo=no=>[...main.querySelectorAll('#data .data-card')]
    .find(card=>card.querySelector('.hm-card-no')?.textContent.includes(no));

  /* 01 / qualitative: readable subsection numbering begins at 01. */
  const brand=main.querySelector('#brand');
  if(brand){
    const brandSubs=[...brand.querySelectorAll(':scope > .hm-subsection')];
    brandSubs.forEach((section,i)=>{
      const title=section.querySelector('.hm-subtitle');
      if(title)numbered(title,String(i+1).padStart(2,'0'));
    });

    /* UX principle titles get explicit blue 01—05 indices. */
    const uxPoints=subByNo(brand,'01.4');
    if(uxPoints){
      [...uxPoints.querySelectorAll('.direction-card h4')].forEach((title,i)=>{
        numbered(title,String(i+1).padStart(2,'0'));
      });
    }
  }

  /* 02 / quantitative: use Roman numerals for the six evidence headlines. */
  const romans=['I','II','III','IV','V','VI'];
  const data=main.querySelector('#data');
  if(data){
    [...data.querySelectorAll('.data-card')].forEach((card,i)=>{
      const title=card.querySelector('.data-card-head h3');
      if(title&&romans[i]){
        title.innerHTML=`${romans[i]}. ${stripPrefix(title.innerHTML)}`;
      }
    });

    /* Entry channel: replace donut/legend with a single 80px segmented bar. */
    const c21=cardByNo('02.1');
    if(c21){
      const viz=c21.querySelector('.data-viz');
      if(viz){
        viz.className='data-viz wide-segmented-chart';
        viz.innerHTML=`
          <div class="wide-segmented-bar wide-entry-bar" aria-label="2026년 상반기 유입 채널 비율">
            <div class="wide-segment" style="flex:52 1 0;background:var(--hm-blue)"><span>AD <small>52%</small></span></div>
            <div class="wide-segment" style="flex:31 1 0;background:var(--hm-newblue)"><span>Direct <small>31%</small></span></div>
            <div class="wide-segment" style="flex:10 1 0;background:var(--hm-green)"><span>CPS <small>10%</small></span></div>
            <div class="wide-segment is-small" style="flex:6 1 0;background:var(--hm-yellow)"><span>CRM <small>6%</small></span></div>
            <div class="wide-segment is-tiny" style="flex:1 1 0;background:rgba(255,255,255,.25)" title="기타 1%"><span>1%</span></div>
          </div>`;
      }
    }

    /* Landing next-action graph adopts the exact same segmented-bar grammar. */
    const c26=cardByNo('02.6');
    if(c26){
      const firstChart=c26.querySelector('.landing-chart');
      if(firstChart){
        const oldBar=firstChart.querySelector('.stackbar');
        const oldLabels=firstChart.querySelector('.stacklabels');
        if(oldBar){
          const bar=document.createElement('div');
          bar.className='wide-segmented-bar wide-action-bar';
          bar.setAttribute('aria-label','기획전 시작 후 첫 다음 행동');
          bar.innerHTML=`
            <div class="wide-segment" style="flex:52.2 1 0;background:var(--hm-red)"><span>종료 <small>52.2%</small></span></div>
            <div class="wide-segment" style="flex:27.6 1 0;background:var(--hm-blue)"><span>재탐색 <small>27.6%</small></span></div>
            <div class="wide-segment is-small" style="flex:9.3 1 0;background:var(--hm-newblue)"><span>상품 <small>9.3%</small></span></div>
            <div class="wide-segment is-small" style="flex:6.6 1 0;background:var(--hm-green)"><span>검색 <small>6.6%</small></span></div>
            <div class="wide-segment is-tiny" style="flex:4.3 1 0;background:var(--hm-yellow)" title="기타 4.3%"><span>4.3%</span></div>`;
          oldBar.replaceWith(bar);
        }
        oldLabels?.remove();
      }
    }
  }
})();
