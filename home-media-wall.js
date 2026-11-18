(()=>{'use strict';
if(location.pathname!=='/')return;
const endpoint='https://fsaqzbwxhjpnfgqxdvnz.supabase.co/functions/v1/nobron-v3-public-media';
let active=false;
function init(){
 const container=document.getElementById('nh-flyers');if(!container||container.dataset.ready)return;
 container.dataset.ready='1';
 fetch(endpoint,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Media unavailable');return r.json()}).then(data=>{
 const list=Array.isArray(data.media)?data.media:[];
 const unique=[];const seen=new Set();
 for(const m of list){if(!m||typeof m.url!=='string'||!m.url.startsWith('https://')||!['image','video'].includes(m.type)||seen.has(m.url))continue;seen.add(m.url);unique.push(m);}
 unique.slice(0,8).forEach((m,i)=>{
  const item=document.createElement('div');item.className='nh-flyer nh-flyer-'+(i+1);
  if(m.type==='image'){const img=document.createElement('img');img.src=m.url;img.alt='';img.decoding='async';img.loading=i<5?'eager':'lazy';img.draggable=false;item.append(img);}
  else{const v=document.createElement('video');v.src=m.url;v.muted=true;v.loop=true;v.playsInline=true;v.preload='metadata';v.disablePictureInPicture=true;v.setAttribute('controlsList','nodownload noplaybackrate');item.append(v);if(i<2)v.play().catch(()=>{});}
  container.append(item);
 });
 container.classList.toggle('nh-media-present',unique.length>0);
 }).catch(()=>{container.classList.add('nh-media-error')});
}
const observer=new MutationObserver(()=>{if(document.getElementById('nh-flyers'))init()});
observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
init();
})();
