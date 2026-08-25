(() => {
  'use strict';
  const journey=document.querySelector('#journey');
  if(!journey)return;

  const rebuildTabletClusters=(section,labels,classes)=>{
    if(!section)return;
    const groups=[...section.querySelectorAll('.flow-group')];

    const unwrap=(row)=>{
      [...row.querySelectorAll(':scope > .wide-flow-cluster')].forEach(cluster=>{
        const inner=cluster.querySelector('.wide-flow-cluster-inner');
        if(inner)[...inner.children].forEach(child=>row.insertBefore(child,cluster));
        cluster.remove();
      });
    };

    const build=(group,nodeCount,label,klass)=>{
      if(!group)return;
      const row=group.querySelector('.flow-row');
      if(!row)return;
      unwrap(row);
      const children=[...row.children];
      const moving=children.slice(0,nodeCount*2-1);
      if(!moving.length)return;
      const cluster=document.createElement('div');
      cluster.className=`wide-flow-cluster v10-journey-tablet ${klass||''}`.trim();
      cluster.innerHTML=`<div class="wide-flow-cluster-label">${label||''}</div><div class="wide-flow-cluster-inner"></div>`;
      const inner=cluster.querySelector('.wide-flow-cluster-inner');
      moving.forEach(el=>inner.appendChild(el));
      row.insertBefore(cluster,row.firstChild);
    };

    build(groups[0],3,labels[0],classes[0]);
    build(groups[1],2,labels[1],classes[1]);
  };

  /* 1. 데이터를 하나의 여정으로... : restore the previous tablet-wrapped circles. */
  rebuildTabletClusters(
    journey.querySelector('.journey-signal-subsection'),
    [
      '외부 랜딩 이후 다음 탐색이 끊김 · 기획전 바로 종료 52.2%',
      'PDP 관심은 유지됐지만 장바구니·구매 행동은 약화'
    ],
    ['wide-flow-cluster--alert','wide-flow-cluster--focus']
  );

  /* 2. 끊어진 지점을 기준으로... : use the same tablet-wrapped circle grammar. */
  const redesign=journey.querySelector('.journey-redesign-subsection');
  if(redesign){
    const groups=[...redesign.querySelectorAll('.flow-group')];
    const labels=groups.map(group=>group.querySelector('.flow-label')?.textContent?.trim()||'');
    rebuildTabletClusters(
      redesign,
      [labels[0]||'유입 맥락을 잃지 않고 탐색으로 연결',labels[1]||'비교 기준을 유지해 구매 확신과 설치·케어까지 연결'],
      ['wide-flow-cluster--focus','wide-flow-cluster--focus']
    );
  }
})();
