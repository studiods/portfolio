(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;

  const strip=(html='')=>html
    .replace(/^\s*(?:0?\d+|[IVXLCDM]+)\.\s*/i,'')
    .replace(/^\s*<span[^>]*class=["'][^"']*(?:wide-title-index|wide-roman-index)[^"']*["'][^>]*>.*?<\/span>\s*/i,'');

  const setIndexedTitle=(el,label,klass='wide-title-index',space=false)=>{
    if(!el)return;
    el.innerHTML=`<span class="${klass}">${label}.</span>${space?' ':''}${strip(el.innerHTML)}`;
  };

  /* 01 / qualitative: 01., 02., 03... becomes part of the title with no gap. */
  const brand=main.querySelector('#brand');
  if(brand){
    const brandSubs=[...brand.querySelectorAll(':scope > .hm-subsection')];
    brandSubs.forEach((section,i)=>{
      setIndexedTitle(section.querySelector('.hm-subtitle'),String(i+1).padStart(2,'0'));
    });

    const sentimentTitle=brand.querySelector('.sentiment-title');
    if(sentimentTitle)sentimentTitle.textContent='긍정과 부정의 키워드의 비율';

    /* UX principles use the same 01—05 numbering and the full title is blue via CSS. */
    const uxSection=brandSubs.find(section=>section.querySelector('.direction-list'));
    if(uxSection){
      [...uxSection.querySelectorAll('.direction-card h4')].forEach((title,i)=>{
        setIndexedTitle(title,String(i+1).padStart(2,'0'));
      });
    }
  }

  /* 02 / quantitative: keep Roman numbering and refresh chart color grammar. */
  const data=main.querySelector('#data');
  if(data){
    const romans=['I','II','III','IV','V','VI'];
    [...data.querySelectorAll('.data-card')].forEach((card,i)=>{
      const title=card.querySelector('.data-card-head h3');
      if(title&&romans[i])setIndexedTitle(title,romans[i],'wide-roman-index',true);
    });

    const entry=data.querySelector('.wide-entry-bar');
    if(entry){
      const segs=[...entry.querySelectorAll('.wide-segment')];
      const colors=['#0572CB','var(--hm-blue)','var(--hm-newblue)','var(--hm-green)','var(--hm-yellow)'];
      segs.forEach((seg,i)=>{if(colors[i])seg.style.background=colors[i]});
      const labels=[['AD','52%'],['Direct','31%'],['CPS','10%'],['CRM','6%']];
      labels.forEach((parts,i)=>{
        if(segs[i])segs[i].innerHTML=`<span>${parts[0]} <small>${parts[1]}</small></span>`;
      });
    }

    /* Action chart keeps its semantic colors but adopts the exact same text layout. */
    const action=data.querySelector('.wide-action-bar');
    if(action){
      const segs=[...action.querySelectorAll('.wide-segment')];
      const labels=[['종료','52.2%'],['재탐색','27.6%'],['상품','9.3%'],['검색','6.6%']];
      labels.forEach((parts,i)=>{
        if(segs[i])segs[i].innerHTML=`<span>${parts[0]} <small>${parts[1]}</small></span>`;
      });
    }
  }
})();
