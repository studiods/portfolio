(()=>{
  'use strict';

  const trenbeSlide=document.querySelector('[data-wa-source-page="36"]');
  const company=trenbeSlide?.closest('[data-wa-company]');
  const overlayBody=company?.querySelector('.wa-gallery-overlay__body');
  if(!company||!overlayBody)return;

  company.classList.add('is-trenbe');

  const copy='디자이너들 간의 소통 부재와 협업 방식에 대한 정의가 없어 제대로된 협업과 커뮤니케이션이 안되고 있어 각자 다른 목표와 우선 순위로 일하고 있던 상황이라 무엇보다 먼저 디자인 조직의 핵심가치와 일하는 방식에 대한 정의를 진행하였습니다. 실제 본인들이 중요하다고 생각하는 가치와 우선 순위를 찾게 하였고 회사의 비젼과 목표에 맞춰 디자이너들이 어떻게 일해야 하고 어떤 디자이너가 되어야 하는지에 대한 정의를 내렸습니다. 현재 업무 및 리뷰나 회고 시 항상 이 핵심 가치를 기준으로 일하고 있으며 특히 커뮤니케이션 비용이 줄어 업무 효율성이 높아진 부분에 대해 디자이너와 협업부서 모두 크게 만족하고 있습니다.';

  let paragraph=overlayBody.querySelector('.wa-trenbe-copy');
  if(!paragraph){
    paragraph=document.createElement('p');
    paragraph.className='wa-trenbe-copy';
    overlayBody.prepend(paragraph);
  }
  paragraph.textContent=copy;
})();
