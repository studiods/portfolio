(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;

  const ids=['brand','data','journey','direction'];
  const MOBILE_BREAKPOINT=780;

  /* Restore the original Wide DOM if an earlier sticky-rail wrapper is ever present. */
  const restoreLegacyRail=()=>{
    ids.forEach(id=>{
      const section=main.querySelector(`#${id}`);
      const wrap=section?.querySelector(':scope > .hm-wrap');
      const layout=wrap?.querySelector(':scope > .hm-sticky-layout');
      if(!wrap||!layout)return;

      const rail=layout.querySelector(':scope > .hm-sticky-rail');
      const content=layout.querySelector(':scope > .hm-sticky-content');
      const head=rail?.querySelector(':scope > .hm-section-head');
      if(head)layout.before(head);
      while(content?.firstChild)layout.before(content.firstChild);
      layout.remove();
      delete wrap.dataset.stickyLayoutMounted;
      section?.classList.remove('hm-sticky-chapter');
    });
  };

  /* Keep the circle/capsule treatment from the previous test, without the left rail. */
  const buildCluster=(group,nodeCount,label,klass)=>{
    if(!group)return;
    if(group.querySelector(':scope .wide-flow-cluster'))return;
    const row=group.querySelector('.flow-row');
    if(!row)return;

    const children=[...row.children];
    const moving=children.slice(0,nodeCount*2-1);
    if(!moving.length)return;

    const cluster=document.createElement('div');
    cluster.className=`wide-flow-cluster ${klass}`;
    cluster.innerHTML=`<div class="wide-flow-cluster-label">${label}</div><div class="wide-flow-cluster-inner"></div>`;
    const inner=cluster.querySelector('.wide-flow-cluster-inner');
    moving.forEach(el=>inner.appendChild(el));
    row.insertBefore(cluster,row.firstChild);
  };

  const tuneJourney=()=>{
    const journey=main.querySelector('#journey');
    if(!journey)return;

    const signal=journey.querySelector('.journey-signal-subsection');
    if(signal){
      const clusters=[...signal.querySelectorAll('.wide-flow-cluster')];
      if(clusters[0]){
        clusters[0].className='wide-flow-cluster wide-flow-cluster--alert';
        const label=clusters[0].querySelector('.wide-flow-cluster-label');
        if(label)label.textContent='외부 랜딩 이후 다음 탐색이 끊김 · 기획전 바로 종료 52.2%';
      }
      if(clusters[1]){
        clusters[1].className='wide-flow-cluster wide-flow-cluster--alert';
        const label=clusters[1].querySelector('.wide-flow-cluster-label');
        if(label)label.textContent='PDP 관심은 유지됐지만 장바구니·구매 행동은 약화';
      }
    }

    const redesign=journey.querySelector('.journey-redesign-subsection');
    if(redesign){
      const groups=[...redesign.querySelectorAll('.flow-group')];
      groups.forEach(group=>{
        const oldLabel=group.querySelector('.flow-label');
        if(oldLabel&&!oldLabel.dataset.originalFlowLabel){
          oldLabel.dataset.originalFlowLabel=oldLabel.textContent.trim();
        }
      });

      const label1=groups[0]?.querySelector('.flow-label')?.dataset.originalFlowLabel || '앞선 유입 맥락을 다음 탐색까지 연결';
      const label2=groups[1]?.querySelector('.flow-label')?.dataset.originalFlowLabel || '구매 확신을 설치·케어까지 연결';
      buildCluster(groups[0],3,label1,'wide-flow-cluster--tobe');
      buildCluster(groups[1],2,label2,'wide-flow-cluster--tobe');
    }
  };

  const createFloatingHeader=()=>{
    let floating=document.querySelector('.hm-floating-chapter');
    if(floating)return floating;

    floating=document.createElement('div');
    floating.className='hm-floating-chapter';
    floating.setAttribute('aria-hidden','true');
    floating.innerHTML=`
      <div class="hm-floating-chapter-inner">
        <span class="hm-floating-chapter-no"></span>
        <h2 class="hm-floating-chapter-title"></h2>
      </div>`;
    document.body.appendChild(floating);
    return floating;
  };

  restoreLegacyRail();
  tuneJourney();

  const floating=createFloatingHeader();
  const floatingNo=floating.querySelector('.hm-floating-chapter-no');
  const floatingTitle=floating.querySelector('.hm-floating-chapter-title');
  let currentId='';
  let raf=0;

  const getChapters=()=>ids.map(id=>{
    const section=main.querySelector(`#${id}`);
    const head=section?.querySelector(':scope > .hm-wrap > .hm-section-head');
    const no=head?.querySelector('.hm-section-no');
    const title=head?.querySelector('.hm-section-title');
    return {id,section,head,no,title};
  }).filter(item=>item.section&&item.head&&item.title);

  const paintChapter=item=>{
    if(!item){
      currentId='';
      floating.classList.remove('is-visible','is-changing');
      return;
    }
    if(currentId===item.id){
      floating.classList.add('is-visible');
      return;
    }

    const apply=()=>{
      floatingNo.textContent=item.no?.textContent?.trim()||'';
      floatingTitle.innerHTML=item.title.innerHTML;
      currentId=item.id;
      floating.classList.add('is-visible');
      requestAnimationFrame(()=>floating.classList.remove('is-changing'));
    };

    if(currentId){
      floating.classList.add('is-changing');
      window.setTimeout(apply,120);
    }else apply();
  };

  const sync=()=>{
    raf=0;
    if(window.innerWidth<=MOBILE_BREAKPOINT){
      paintChapter(null);
      return;
    }

    const chapters=getChapters();
    let active=null;
    for(const chapter of chapters){
      const headRect=chapter.head.getBoundingClientRect();
      const sectionRect=chapter.section.getBoundingClientRect();
      if(headRect.top<=0&&sectionRect.bottom>0)active=chapter;
    }
    paintChapter(active);
  };

  const requestSync=()=>{
    if(raf)return;
    raf=requestAnimationFrame(sync);
  };

  window.addEventListener('scroll',requestSync,{passive:true});
  window.addEventListener('resize',requestSync,{passive:true});
  requestSync();
})();
