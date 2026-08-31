(()=>{
'use strict';

const node=(n,t,p)=>`<article class="flow-node"><span class="hm-card-no">${n}</span><h4>${t}</h4><p>${p}</p></article>`;
const arrow=()=>'<div class="flow-arrow" aria-hidden="true"></div>';

function mount(){
  const block=document.querySelector('#journey .journey-flow-block');
  if(!block){setTimeout(mount,60);return}
  if(block.dataset.v2TabletFixed==='1')return;

  const title=block.querySelector('.journey-block-title');
  const copy=block.querySelector('.journey-block-copy');
  const stage=block.querySelector('.journey-stage-flow');
  if(!stage){setTimeout(mount,60);return}

  if(title)title.innerHTML='화면 순서가 아니라,<br>고객 판단의 흐름으로 다시 연결했습니다.';
  if(copy)copy.textContent='유입 이후 다음 행동이 끊기지 않도록 고객 판단 흐름으로 다시 연결했습니다.';

  stage.innerHTML=`
    <div class="v2-production-flow-row row-top">
      <div class="wide-flow-cluster v12-journey-tablet">
        <span class="wide-flow-cluster-label">유입 맥락을 유지해 탐색 시작으로 연결</span>
        <div class="wide-flow-cluster-inner">
          ${node('01','유입','광고·검색·CRM의 맥락을 이어받습니다.')}
          ${arrow()}
          ${node('02','탐색','목적에 맞는 상품 탐색을 바로 시작합니다.')}
        </div>
      </div>
      ${arrow()}
      ${node('03','후보 압축','비교할 후보를 빠르게 줄입니다.')}
      ${arrow()}
      ${node('04','비교·판단','가격·혜택·설치 조건으로 판단합니다.')}
    </div>
    <div class="v2-production-flow-row row-bottom">
      ${node('05','장바구니','선택 상품과 조건을 다시 확인합니다.')}
      ${arrow()}
      <div class="wide-flow-cluster v12-journey-tablet">
        <span class="wide-flow-cluster-label">결제 조건을 명확히 해 이탈을 줄이고 설치 확신까지 연결</span>
        <div class="wide-flow-cluster-inner">
          ${node('06','결제','최종 비용과 혜택을 명확히 확정합니다.')}
          ${arrow()}
          ${node('07','설치','일정·회수·설치를 끊김 없이 잇습니다.')}
        </div>
      </div>
      ${arrow()}
      ${node('08','관리','A/S·케어·재구매로 관계를 이어갑니다.')}
    </div>`;

  block.dataset.v2TabletFixed='1';
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
else mount();
setTimeout(mount,500);
setTimeout(mount,1200);
})();
