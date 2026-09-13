(()=>{
  'use strict';

  const shell=document.querySelector('[data-wa-menu-shell]');
  const menu=document.querySelector('[data-wa-menu]');
  const trigger=document.querySelector('[data-wa-menu-trigger]');
  if(!shell||!menu||!trigger)return;

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const luminance=(r,g,b)=>(0.2126*r+0.7152*g+0.0722*b)/255;

  const parseColor=value=>{
    const match=String(value||'').match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/i);
    if(!match)return null;
    const alpha=match[4]===undefined?1:Number(match[4]);
    if(!Number.isFinite(alpha)||alpha<.12)return null;
    return luminance(Number(match[1]),Number(match[2]),Number(match[3]));
  };

  const imageLuminance=(img,x,y)=>{
    if(!img?.naturalWidth||!img?.naturalHeight)return null;
    const rect=img.getBoundingClientRect();
    if(rect.width<2||rect.height<2)return null;
    try{
      const rx=clamp((x-rect.left)/rect.width,0,1);
      const ry=clamp((y-rect.top)/rect.height,0,1);
      const rw=.18;
      const rh=.18;
      const sx=clamp(Math.round(img.naturalWidth*(rx-rw/2)),0,Math.max(0,img.naturalWidth-1));
      const sy=clamp(Math.round(img.naturalHeight*(ry-rh/2)),0,Math.max(0,img.naturalHeight-1));
      const sw=Math.max(1,Math.min(img.naturalWidth-sx,Math.round(img.naturalWidth*rw)));
      const sh=Math.max(1,Math.min(img.naturalHeight-sy,Math.round(img.naturalHeight*rh)));
      const canvas=document.createElement('canvas');
      canvas.width=12;
      canvas.height=12;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      ctx.drawImage(img,sx,sy,sw,sh,0,0,12,12);
      const data=ctx.getImageData(0,0,12,12).data;
      let total=0;
      let count=0;
      for(let i=0;i<data.length;i+=4){
        if(data[i+3]<32)continue;
        total+=luminance(data[i],data[i+1],data[i+2]);
        count+=1;
      }
      return count?total/count:null;
    }catch(_){
      return null;
    }
  };

  const underlyingElements=(x,y)=>document.elementsFromPoint(x,y).filter(el=>el!==shell&&!shell.contains(el));

  const findImage=(elements)=>{
    for(const el of elements){
      if(el instanceof HTMLImageElement&&el.complete&&el.naturalWidth)return el;
      const activeSlide=el.closest?.('.reuse-production-gallery__slide.is-active');
      const activeImage=activeSlide?.querySelector?.('img');
      if(activeImage?.complete&&activeImage.naturalWidth)return activeImage;
      const hero=el.closest?.('.wa-hero');
      const heroImage=hero?.querySelector?.('.wa-hero__image');
      if(heroImage?.complete&&heroImage.naturalWidth)return heroImage;
    }
    return null;
  };

  const pointLuminance=(x,y)=>{
    const elements=underlyingElements(x,y);
    const image=findImage(elements);
    const imageLum=imageLuminance(image,x,y);
    if(imageLum!==null)return imageLum;
    for(const el of elements){
      const bg=parseColor(getComputedStyle(el).backgroundColor);
      if(bg!==null)return bg;
    }
    return null;
  };

  const surfaceLuminance=()=>{
    const shellRect=shell.getBoundingClientRect();
    const open=trigger.getAttribute('aria-expanded')==='true';
    const menuRect=menu.getBoundingClientRect();
    const left=shellRect.left;
    const width=Math.max(120,Math.min(shellRect.width,400));
    const xs=[left+width*.18,left+width*.50,left+width*.82]
      .map(x=>clamp(x,8,innerWidth-8));
    const ys=open&&menuRect.height>20
      ? [menuRect.top+Math.min(menuRect.height*.28,140),menuRect.top+Math.min(menuRect.height*.62,300)]
      : [shellRect.top+10,shellRect.top+26];
    const values=[];
    for(const y of ys){
      for(const x of xs){
        const value=pointLuminance(x,clamp(y,8,innerHeight-8));
        if(value!==null)values.push(value);
      }
    }
    if(!values.length)return 0;
    return values.reduce((sum,value)=>sum+value,0)/values.length;
  };

  let frame=0;
  const update=()=>{
    frame=0;
    const surface=surfaceLuminance();
    shell.dataset.waSurface=surface>.56?'light':'dark';
  };
  const schedule=()=>{
    if(frame)return;
    frame=requestAnimationFrame(update);
  };

  trigger.addEventListener('click',()=>requestAnimationFrame(schedule));
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('load',schedule,{once:true});

  const stream=document.querySelector('[data-wa-stream]');
  if(stream&&'MutationObserver' in window){
    const observer=new MutationObserver(schedule);
    observer.observe(stream,{subtree:true,attributes:true,attributeFilter:['class','aria-hidden']});
  }

  document.querySelectorAll('.wa-hero__image,[data-wa-gallery] img').forEach(img=>{
    if(!img.complete)img.addEventListener('load',schedule,{once:true});
  });

  schedule();
})();
