(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;

  const BREAKPOINT=2160;
  const ids=['brand','data','journey','direction'];

  const mountSection=id=>{
    const section=main.querySelector(`#${id}`);
    const wrap=section?.querySelector(':scope > .hm-wrap');
    if(!section||!wrap||wrap.dataset.stickyLayoutMounted==='1')return;

    const children=[...wrap.children];
    const head=children.find(el=>el.classList?.contains('hm-section-head'));
    if(!head)return;

    const layout=document.createElement('div');
    layout.className='hm-sticky-layout';
    layout.dataset.chapter=id;

    const rail=document.createElement('div');
    rail.className='hm-sticky-rail';

    const content=document.createElement('div');
    content.className='hm-sticky-content';

    wrap.appendChild(layout);
    layout.append(rail,content);
    rail.appendChild(head);
    children.forEach(el=>{if(el!==head)content.appendChild(el)});

    wrap.dataset.stickyLayoutMounted='1';
    section.classList.add('hm-sticky-chapter');
  };

  const unmountSection=id=>{
    const section=main.querySelector(`#${id}`);
    const wrap=section?.querySelector(':scope > .hm-wrap');
    const layout=wrap?.querySelector(':scope > .hm-sticky-layout');
    if(!section||!wrap||!layout)return;

    const rail=layout.querySelector(':scope > .hm-sticky-rail');
    const content=layout.querySelector(':scope > .hm-sticky-content');
    const head=rail?.querySelector(':scope > .hm-section-head');

    if(head)layout.before(head);
    while(content?.firstChild)layout.before(content.firstChild);
    layout.remove();

    delete wrap.dataset.stickyLayoutMounted;
    section.classList.remove('hm-sticky-chapter');
  };

  const syncSticky=()=>{
    const shouldStick=window.innerWidth>=BREAKPOINT;
    ids.forEach(id=>shouldStick?mountSection(id):unmountSection(id));
  };

  /* ---------- Journey tablet/circle treatment ---------- */
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
        if(oldLabel)oldLabel.dataset.originalFlowLabel=oldLabel.textContent.trim();
      });

      const label1=groups[0]?.querySelector('.flow-label')?.dataset.originalFlowLabel || '앞선 유입 맥락을 다음 탐색까지 연결';
      const label2=groups[1]?.querySelector('.flow-label')?.dataset.originalFlowLabel || '구매 확신을 설치·케어까지 연결';

      buildCluster(groups[0],3,label1,'wide-flow-cluster--tobe');
      buildCluster(groups[1],2,label2,'wide-flow-cluster--tobe');
    }
  };

  tuneJourney();
  syncSticky();

  let raf=0;
  window.addEventListener('resize',()=>{
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(syncSticky);
  },{passive:true});
})();
