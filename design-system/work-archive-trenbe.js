(()=>{
  'use strict';

  const trenbeSlide=document.querySelector('[data-wa-source-page="36"]');
  const company=trenbeSlide?.closest('[data-wa-company]');
  const gallery=company?.querySelector('[data-wa-gallery]');
  const overlayBody=company?.querySelector('.wa-gallery-overlay__body');
  if(!company||!gallery||!overlayBody)return;

  company.classList.add('is-trenbe');

  const copy='디자이너들 간의 소통 부재와 협업 방식에 대한 정의가 없어 제대로된 협업과 커뮤니케이션이 안되고 있어 각자 다른 목표와 우선 순위로 일하고 있던 상황이라 무엇보다 먼저 디자인 조직의 핵심가치와 일하는 방식에 대한 정의를 진행하였습니다. 실제 본인들이 중요하다고 생각하는 가치와 우선 순위를 찾게 하였고 회사의 비젼과 목표에 맞춰 디자이너들이 어떻게 일해야 하고 어떤 디자이너가 되어야 하는지에 대한 정의를 내렸습니다. 현재 업무 및 리뷰나 회고 시 항상 이 핵심 가치를 기준으로 일하고 있으며 특히 커뮤니케이션 비용이 줄어 업무 효율성이 높아진 부분에 대해 디자이너와 협업부서 모두 크게 만족하고 있습니다.';

  let paragraph=overlayBody.querySelector('.wa-trenbe-copy');
  if(!paragraph){
    paragraph=document.createElement('p');
    paragraph.className='wa-trenbe-copy';
    overlayBody.prepend(paragraph);
  }
  paragraph.textContent=copy;

  const sampleBodyLuminance=img=>{
    if(!img?.naturalWidth||!img?.naturalHeight)return null;
    try{
      const sx=0;
      const sy=Math.round(img.naturalHeight*.02);
      const sw=Math.max(1,Math.round(img.naturalWidth*.48));
      const sh=Math.max(1,Math.round(img.naturalHeight*.30));
      const canvas=document.createElement('canvas');
      canvas.width=18;
      canvas.height=18;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      ctx.drawImage(img,sx,sy,sw,sh,0,0,18,18);
      const pixels=ctx.getImageData(0,0,18,18).data;
      let sum=0;
      let count=0;
      for(let i=0;i<pixels.length;i+=4){
        if(pixels[i+3]<32)continue;
        sum+=(0.2126*pixels[i]+0.7152*pixels[i+1]+0.0722*pixels[i+2])/255;
        count+=1;
      }
      return count?sum/count:null;
    }catch(_){
      return null;
    }
  };

  const activeImage=()=>{
    const incoming=gallery.querySelector('.reuse-production-gallery__slide.is-next.is-entering img');
    if(incoming)return incoming;
    return gallery.querySelector('.reuse-production-gallery__slide.is-active img');
  };

  const syncContrast=()=>{
    const img=activeImage();
    const commit=()=>{
      const luminance=sampleBodyLuminance(img);
      gallery.style.setProperty('--wa-body-color',luminance!==null&&luminance<.46?'#fff':'#000');
    };
    if(img?.complete&&img.naturalWidth)commit();
    else img?.addEventListener('load',commit,{once:true});
  };

  let frame=0;
  const queueContrast=()=>{
    if(frame)cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>{
      frame=0;
      syncContrast();
    });
  };

  const observer=new MutationObserver(queueContrast);
  gallery.querySelectorAll('.reuse-production-gallery__slide').forEach(slide=>observer.observe(slide,{attributes:true,attributeFilter:['class']}));
  window.addEventListener('resize',queueContrast,{passive:true});
  syncContrast();
})();
