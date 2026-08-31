(()=>{
'use strict';

const expectedTitles={
  brand:'구매 여정을 개선하기 전에,<br>왜 고객이 온라인에서 하이마트를<br>선택하지 않는지부터 정의했습니다.',
  data:'고객의 목소리에서 드러난 문제는<br>실제 이용 패턴에서도 반복됐습니다.',
  journey:'앞선 데이터를 바탕으로,<br>구매 여정의 흐름과 각 화면의 역할을<br>다시 정의했습니다.',
  direction:'앞서 정의한 UX 전략을 바탕으로<br>빠르게 프로토타입을 만들고, 내부 검증을 반복하고 있습니다.'
};

function alignProofCopy(){
  document.querySelectorAll('#brand .narrative-reality .proof-item h4').forEach(h=>{
    h.style.setProperty('min-height','2.76em','important');
    h.style.setProperty('display','block','important');
  });
  document.querySelectorAll('#brand .narrative-reality .proof-item p').forEach(p=>{
    p.style.setProperty('margin','40px 0 0','important');
    p.style.setProperty('padding-top','0','important');
  });
}

const timers=new WeakMap();
function armTitleGuard(title,html){
  if(!title)return;
  /* Suppress the legacy Latin/digit scramble owner. The Narrative V2 Korean scramble
     uses data-sc, so it can still run on focus and finish normally. */
  title.dataset.numberedGroupScramblePlayed='1';
  title.dataset.wideLargeScramblePlayed='1';
  title.dataset.v2CanonicalTitle='1';

  const restore=()=>{
    if(title.innerHTML!==html)title.innerHTML=html;
  };
  const schedule=()=>{
    const old=timers.get(title); if(old)clearTimeout(old);
    timers.set(title,setTimeout(restore,320));
  };
  if(!title.dataset.v2GuardBound){
    title.dataset.v2GuardBound='1';
    if('MutationObserver' in window){
      const mo=new MutationObserver(schedule);
      mo.observe(title,{childList:true,subtree:true,characterData:true});
    }
  }
  /* Catch a scramble that began before this guard was mounted. */
  [0,760,1600].forEach(ms=>setTimeout(restore,ms));
}

function guardChapterTitles(){
  Object.entries(expectedTitles).forEach(([id,html])=>{
    const title=document.querySelector(`#${id} > .hm-wrap > .hm-section-head .hm-section-title`);
    armTitleGuard(title,html);
  });
}

function run(){
  alignProofCopy();
  guardChapterTitles();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
else run();
[80,240,600,1200,2400,5000].forEach(ms=>setTimeout(run,ms));
})();
