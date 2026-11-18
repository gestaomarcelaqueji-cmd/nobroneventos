(()=>{'use strict';
if(location.pathname!=='/')return;
const endpoint='https://fsaqzbwxhjpnfgqxdvnz.supabase.co/functions/v1/nobron-v3-public-media';
function init(){
 const root=document.querySelector('.ns-page-home');if(!root||root.querySelector('.nh-atmosphere'))return;
 const atmosphere=document.createElement('div');atmosphere.className='nh-atmosphere';atmosphere.setAttribute('aria-hidden','true');
 atmosphere.innerHTML='<div class="nh-aura nh-aura-one"></div><div class="nh-aura nh-aura-two"></div><div class="nh-collage"></div><div class="nh-veil"></div>';root.prepend(atmosphere);
 const collage=atmosphere.querySelector('.nh-collage');
 fetch(endpoint,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('media');return r.json()}).then(data=>{
  const seen=new Set();
  const media=(Array.isArray(data.media)?data.media:[]).filter(m=>{
   if(!m||typeof m.url!=='string'||!/^https:\/\//.test(m.url)||!['image','video'].includes(m.type)||seen.has(m.url))return false;
   seen.add(m.url);return true;
  });
  media.slice(0,7).forEach((m,i)=>{
   const frame=document.createElement('div');frame.className='nh-sheet nh-sheet-'+(i+1);
   if(m.type==='video'){const v=document.createElement('video');v.src=m.url;v.muted=true;v.playsInline=true;v.loop=true;v.preload='metadata';frame.append(v);if(i<2&&!matchMedia('(prefers-reduced-motion: reduce)').matches)v.play().catch(()=>{});}
   else{const img=document.createElement('img');img.src=m.url;img.alt='';img.loading=i<4?'eager':'lazy';img.decoding='async';frame.append(img);}
   collage.append(frame);
  });
  root.classList.toggle('nh-has-media',media.length>0);
 }).catch(()=>{root.classList.add('nh-media-unavailable')});
}
if(document.querySelector('.ns-page-home'))init();else{
 const observer=new MutationObserver(()=>{if(document.querySelector('.ns-page-home')){observer.disconnect();init()}});
 observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
}
})();
