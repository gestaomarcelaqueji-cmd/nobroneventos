(()=>{'use strict';
if(location.pathname!=='/')return;
const endpoint='https://fsaqzbwxhjpnfgqxdvnz.supabase.co/functions/v1/nobron-v3-public-media';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function init(){
 const root=document.querySelector('.ns-page-home');
 if(!root||root.querySelector('.nh-atmosphere'))return;
 const atmosphere=document.createElement('div');
 atmosphere.className='nh-atmosphere';atmosphere.setAttribute('aria-hidden','true');
 atmosphere.innerHTML='<div class="nh-collage"></div><div class="nh-veil"></div>';
 root.prepend(atmosphere);
 const collage=atmosphere.querySelector('.nh-collage');
 fetch(endpoint,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('media');return r.json()}).then(data=>{
  const entries=Array.isArray(data.media)?data.media:[];
  const seen=new Set();
  const media=entries.filter(m=>{
   if(!m||typeof m.url!=='string'||!/^https:\/\//i.test(m.url))return false;
   const key=m.url.split('?')[0].replace(/\/$/,'');
   if(seen.has(key))return false;
   seen.add(key);return true;
  }).map(m=>{
   const ext=m.url.split('?')[0].toLowerCase();
   const kind=String(m.type||m.mime_type||m.mimeType||'').toLowerCase();
   const isVideo=kind.includes('video')||/\.(mp4|webm|mov|m4v|ogv)$/i.test(ext);
   const isImage=kind.includes('image')||/\.(jpg|jpeg|png|webp|avif|gif)$/i.test(ext);
   return {...m,kind:isVideo?'video':isImage?'image':null};
  }).filter(m=>m.kind);
  if(!media.length)return;
  const images=media.filter(m=>m.kind==='image');
  const videos=media.filter(m=>m.kind==='video');
  const ordered=[];
  while(images.length||videos.length){
   if(images.length)ordered.push(images.shift());
   if(videos.length)ordered.push(videos.shift());
  }
  const count=Math.min(matchMedia('(max-width:800px)').matches?4:6,Math.max(1,ordered.length));
  const grid=document.createElement('div');grid.className='nh-columns';
  grid.style.setProperty('--nh-count',String(count));
  const columns=Array.from({length:count},(_,i)=>{
   const col=document.createElement('div');col.className='nh-column';
   if(i%2)col.classList.add('nh-column-reverse');
   const strip=document.createElement('div');strip.className='nh-strip';col.append(strip);grid.append(col);return strip;
  });
  const videosOnWall=[];
  ordered.forEach((m,i)=>{
   const frame=document.createElement('div');frame.className='nh-sheet';
   if(i%3===0||i%5===0)frame.classList.add('nh-mono');
   if(m.kind==='video'){
    const v=document.createElement('video');
    v.src=m.url;v.muted=true;v.defaultMuted=true;v.playsInline=true;v.loop=true;v.preload='metadata';
    v.setAttribute('playsinline','');v.setAttribute('muted','');
    if(typeof m.thumbnail==='string'&&/^https:\/\//.test(m.thumbnail))v.poster=m.thumbnail;
    v.setAttribute('disablepictureinpicture','');
    frame.append(v);videosOnWall.push(v);
   }else{
    const img=document.createElement('img');img.src=m.url;img.alt='';img.loading='lazy';img.decoding='async';frame.append(img);
   }
   columns[i%count].append(frame);
  });
  collage.append(grid);root.classList.add('nh-has-media');
  if(reduced)return;
  if('IntersectionObserver'in window){
   const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
     const video=entry.target;
     if(entry.isIntersecting&&!document.hidden)video.play().catch(()=>{});
     else video.pause();
    });
   },{rootMargin:'160px'});
   videosOnWall.forEach(video=>observer.observe(video));
   document.addEventListener('visibilitychange',()=>{
    videosOnWall.forEach(v=>{if(document.hidden)v.pause();else if(v.getBoundingClientRect().bottom>0&&v.getBoundingClientRect().top<innerHeight)v.play().catch(()=>{})});
   });
  }else videosOnWall.slice(0,2).forEach(v=>v.play().catch(()=>{}));
 }).catch(()=>{});
}
if(document.querySelector('.ns-page-home'))init();
else{const observer=new MutationObserver(()=>{if(document.querySelector('.ns-page-home')){observer.disconnect();init()}});observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true})}
})();

(()=>{'use strict';
const home=document.querySelector('.ns-page-solutions, .ns-page-design');if(!home)return;
const endpoint='https://fsaqzbwxhjpnfgqxdvnz.supabase.co/functions/v1/nobron-v3-public-media';
const wall=document.createElement('div');wall.className='ns-media-wall';wall.setAttribute('aria-label','Galeria visual de trabalhos da noBRon');home.prepend(wall);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile=matchMedia('(max-width:800px)').matches;
const designDesktop=!mobile&&home.classList.contains('ns-page-design');
const n=mobile?3:3;const videos=[];
const make=m=>{
 const tile=document.createElement('div');tile.className='ns-wall-tile';tile.setAttribute('aria-hidden','true');
 if(m.type==='video'){
  const el=document.createElement('video');el.src=m.url;el.muted=true;el.defaultMuted=true;el.loop=true;el.playsInline=true;el.preload=mobile?'none':'metadata';el.autoplay=!reduced;
  el.setAttribute('muted','');el.setAttribute('playsinline','');el.setAttribute('disablepictureinpicture','');el.setAttribute('controlslist','nodownload noplaybackrate noremoteplayback');
  if(typeof m.thumbnail==='string'&&/^https:\/\//.test(m.thumbnail))el.poster=m.thumbnail;
  videos.push(el);tile.append(el);
 }else{
  const visual=document.createElement('div');visual.className='ns-wall-image';visual.style.backgroundImage='url("'+m.url.replace(/["\\\n\r]/g,'')+'")';tile.append(visual);
 }return tile;
};
function build(media){
 if(!media.length){wall.style.background='radial-gradient(ellipse at center,#28282e,#09090b 80%)';return}
 const grid=document.createElement('div');grid.className='ns-wall-grid';
 if(mobile&&home.classList.contains('ns-page-design')){
  // Same image-only, unique three-column treatment as desktop, adapted to narrow screens.
  const seen=new Set();
  const images=media.filter(m=>{
   if(m.type!=='image')return false;
   const key=m.url.split('?')[0];
   if(seen.has(key))return false;
   seen.add(key);return true;
  });
  const cols=Array.from({length:3},()=>{const col=document.createElement('div');col.className='ns-wall-column';grid.append(col);return col});
  // Fill the complete page height rather than ending the gallery after the first media set.
  // Reuse only after cycling through every unique image, never in adjacent positions.
  const render=()=>{
   const height=Math.max(home.scrollHeight,document.documentElement.clientHeight);
   const colWidth=Math.max(95,(window.innerWidth*.94)/3);
   const tileHeight=colWidth*16/9+10;
   const perColumn=Math.min(38,Math.max(8,Math.ceil((height*1.3)/tileHeight)));
   cols.forEach(col=>col.replaceChildren());
   if(!images.length)return;
   for(let i=0;i<perColumn*3;i++)cols[i%3].append(make(images[i%images.length]));
  };
  render();
  grid.classList.add('ns-wall-design-mobile');
 }else if(mobile){
  // Preserve the existing mobile composition for other pages.
  for(let i=0;i<n;i++){const col=document.createElement('div');col.className='ns-wall-column';const count=Math.max(5,Math.ceil(14/n));for(let repeat=0;repeat<2;repeat++)for(let j=0;j<count;j++)col.append(make(media[(i*count+j)%media.length]));grid.append(col)}
 }else{
  // Desktop: unique source files, alternated by media type and assigned once.
  const seen=new Set();const unique=media.filter(m=>{const key=m.url.split('?')[0];if(seen.has(key))return false;seen.add(key);return true});
  const images=unique.filter(m=>m.type==='image');const motion=designDesktop?[]:unique.filter(m=>m.type==='video');const ordered=[];
  while(images.length||motion.length){if(images.length)ordered.push(images.shift());if(motion.length)ordered.push(motion.shift())}
  const count=designDesktop?5:3;
  const columns=Array.from({length:count},()=>{const col=document.createElement('div');col.className='ns-wall-column';grid.append(col);return col});
  if(designDesktop){
   // Five tracks cover the rotated edges. Complete a full unique pass before reuse.
   const height=Math.max(home.scrollHeight,window.innerHeight);
   const width=Math.max(130,window.innerWidth*.27);
   const rows=Math.min(30,Math.max(5,Math.ceil(height*1.3/(width*16/9+24))));
   for(let i=0;i<rows*count&&ordered.length;i++)columns[i%count].append(make(ordered[i%ordered.length]));
   grid.classList.add('ns-wall-desktop','ns-wall-design-desktop');
  }else{
   ordered.forEach((m,i)=>columns[i%count].append(make(m)));
   grid.classList.add('ns-wall-desktop');
  }
 }
 wall.append(grid);
 if(reduced)return;
 if('IntersectionObserver'in window){
  const obs=new IntersectionObserver(entries=>{for(const e of entries){const v=e.target;if(e.isIntersecting&&!document.hidden)v.play().catch(()=>{});else v.pause()}},{rootMargin:'250px',threshold:0.01});
  videos.forEach(v=>obs.observe(v));
  document.addEventListener('visibilitychange',()=>{videos.forEach(v=>{if(document.hidden)v.pause();else if(v.getBoundingClientRect().bottom>0&&v.getBoundingClientRect().top<innerHeight)v.play().catch(()=>{})})});
 }else videos.slice(0,3).forEach(v=>v.play().catch(()=>{}));
}
fetch(endpoint,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('media');return r.json()}).then(data=>build(Array.isArray(data.media)?data.media.filter(m=>m&&typeof m.url==='string'&&/^https:\/\//.test(m.url)&&['image','video'].includes(m.type)):[])).catch(()=>build([]));
})();