(()=>{'use strict';
if(location.pathname!=='/')return;
const endpoint='https://fsaqzbwxhjpnfgqxdvnz.supabase.co/functions/v1/nobron-v3-public-media';
function init(){
 const root=document.querySelector('.ns-page-home');if(!root||root.querySelector('.nh-atmosphere'))return;
 const atmosphere=document.createElement('div');atmosphere.className='nh-atmosphere';atmosphere.setAttribute('aria-hidden','true');
 atmosphere.innerHTML='<div class="nh-aura nh-aura-one"></div><div class="nh-aura nh-aura-two"></div><div class="nh-collage"></div><div class="nh-veil"></div>';
 root.prepend(atmosphere);
 const collage=atmosphere.querySelector('.nh-collage');
 fetch(endpoint,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('media');return r.json()}).then(data=>{
  const media=Array.isArray(data.media)?data.media.filter(m=>m&&typeof m.url==='string'&&m.url.startsWith('https://')&&['image','video'].includes(m.type)):[];
  const seen=new Set();const unique=media.filter(m=>{if(seen.has(m.url))return false;seen.add(m.url);return true});
  unique.slice(0,9).forEach((m,i)=>{
   const frame=document.createElement('div');frame.className='nh-sheet nh-sheet-'+(i+1);
   if(m.type==='video'){const v=document.createElement('video');v.src=m.url;v.muted=true;v.playsInline=true;v.loop=true;v.preload='metadata';v.setAttribute('aria-hidden','true');frame.append(v);if(i<2&&!matchMedia('(prefers-reduced-motion: reduce)').matches)v.play().catch(()=>{});}
   else{const img=document.createElement('img');img.src=m.url;img.alt='';img.loading=i<4?'eager':'lazy';img.decoding='async';frame.append(img)}
   collage.append(frame);
  });
  root.classList.toggle('nh-has-media',unique.length>0);
 }).catch(()=>{});
}
if(document.querySelector('.ns-page-home'))init();else{
 const observer=new MutationObserver(()=>{if(document.querySelector('.ns-page-home')){observer.disconnect();init()}});
 observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
}
})();

(()=>{'use strict';const home=document.querySelector('.ns-page-solutions, .ns-page-design');if(!home)return;const endpoint='https://fsaqzbwxhjpnfgqxdvnz.supabase.co/functions/v1/nobron-v3-public-media';const wall=document.createElement('div');wall.className='ns-media-wall';wall.setAttribute('aria-label','Galeria visual de trabalhos da noBRon');home.prepend(wall);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const mobile=matchMedia('(max-width:800px)').matches;const n=mobile?3:5;let videos=[];const make=(m)=>{const tile=document.createElement('div');tile.className='ns-wall-tile';tile.setAttribute('aria-hidden','true');if(m.type==='video'){const el=document.createElement('video');el.src=m.url;el.muted=true;el.loop=true;el.playsInline=true;el.preload='none';el.setAttribute('disablepictureinpicture','');el.setAttribute('controlslist','nodownload noplaybackrate noremoteplayback');videos.push(el);tile.append(el)}else{const visual=document.createElement('div');visual.className='ns-wall-image';visual.style.backgroundImage='url("'+m.url.replace(/["\\\n\r]/g,'')+'")';tile.append(visual)}return tile};function build(media){if(!media.length){wall.style.background='radial-gradient(ellipse at center,#28282e,#09090b 80%)';return}const grid=document.createElement('div');grid.className='ns-wall-grid';for(let i=0;i<n;i++){const col=document.createElement('div');col.className='ns-wall-column';const count=Math.max(5,Math.ceil(14/n));for(let repeat=0;repeat<2;repeat++)for(let j=0;j<count;j++)col.append(make(media[(i*count+j)%media.length]));grid.append(col)}wall.append(grid);if(!reduced&&'IntersectionObserver'in window){const obs=new IntersectionObserver(entries=>{for(const e of entries){const v=e.target;if(e.isIntersecting&&document.visibilityState==='visible'&&true)v.play().catch(()=>{});else v.pause()}},{rootMargin:'100px'});videos.forEach(v=>obs.observe(v));document.addEventListener('visibilitychange',()=>{if(document.hidden)videos.forEach(v=>v.pause())})}}fetch(endpoint,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('media');return r.json()}).then(data=>build(Array.isArray(data.media)?data.media.filter(m=>m&&/^https:\/\//.test(m.url)&&['image','video'].includes(m.type)):[])).catch(()=>build([]));})();