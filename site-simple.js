(()=>{
"use strict";
const {pages,services,baseUrl,publishable}=window.NOBRON_SCHEMA;
const $=(q,root=document)=>root.querySelector(q), $$=(q,root=document)=>[...root.querySelectorAll(q)];
const esc=v=>String(v??"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]));
const current=Object.keys(pages).find(k=>pages[k].route===(location.pathname.replace(/\/+$/,"")||"/"))||"home";
const page=pages[current]; let sections=page.sections;
const inPreview=new URLSearchParams(location.search).get("cms_preview")==="1"&&window.parent!==window;
const target=device=>device==="desktop"||device==="mobile"?device:(innerWidth<=800?"mobile":"desktop");
const mediaUrl=m=>m?.src&&/^https:\/\//.test(m.src)?m.src:"";
const getMedia=(section,device)=>section?.media?.[device]||section?.media?.[device==="mobile"?"desktop":"mobile"]||null;
const galleryItems=(section,device)=>{
 const list=section.gallery?.[device];
 const fallback=section.gallery?.[device==="mobile"?"desktop":"mobile"];
 return Array.isArray(list)&&list.length?list:Array.isArray(fallback)?fallback:[];
};
const video=m=>m?.type==="video"||/\.(mp4|webm)(\?|$)/i.test(mediaUrl(m));
const title=s=>'<div class="ns-title"><small>'+esc(page.label)+'</small><h2>'+esc(s.title)+'</h2>'+(s.description?'<p>'+esc(s.description)+'</p>':"")+'</div>';
function mediaNode(m,s,device,opts={}){
 const src=mediaUrl(m);
 if(!src)return "";
 const pos=Math.min(100,Math.max(0,Number(s?.device?.[device]?.position??50)));
 const zoom=Math.min(1.8,Math.max(1,Number(s?.device?.[device]?.zoom??100)/100));
 const attr='style="object-position:'+pos+'% 50%;transform:scale('+zoom+')"';
 if(video(m))return '<video src="'+esc(src)+'" playsinline muted loop autoplay '+(opts.controls?'controls':'')+' preload="metadata" class="ns-media-content"></video>';
 return '<img src="'+esc(src)+'" alt="'+esc(opts.alt||s.title||"Mídia da noBRon")+'" '+attr+' loading="'+(opts.eager?"eager":"lazy")+'" class="ns-media-content">';
}
function slot(section,className,placeholder){
 const d=getMedia(section,"desktop"),m=getMedia(section,"mobile");
 const real=!!(mediaUrl(d)||mediaUrl(m));
 if(!real)return '<div class="ns-slot '+className+' ns-graphic">'+placeholder+'</div>';
 return '<div class="ns-slot '+className+' ns-reveal" tabindex="0" role="button" aria-label="Revelar as cores da mídia"><div class="ns-only-d">'+mediaNode(d,section,"desktop",{eager:true})+'</div><div class="ns-only-m">'+mediaNode(m,section,"mobile",{eager:true})+'</div></div>';
}
function endDivider(s,i){
 const d=s.device?.desktop?.divider||["curve","diagonal","fold"][i%3],m=s.device?.mobile?.divider||d;
 return '<div class="ns-divider ns-d-'+esc(d)+' ns-m-'+esc(m)+'" aria-hidden="true"></div>';
}
const action=(href,text)=>'<a class="ns-button" href="'+href+'">'+esc(text)+' <span aria-hidden="true">↗</span></a>';
function hero(s){
 const art={
  home:'<span class="ns-art-kicker">noBRon. / DIGITAL STUDIO</span><strong>EVENTOS<br>EM FOCO.</strong><i>DESIGN / MOTION / SISTEMAS</i>',
  solutions:'<span>01 / DESIGN</span><span>02 / MOTION</span><span>03 / SISTEMAS</span>',
  design:'<span class="ns-art-kicker">DIVULGAÇÃO DIGITAL</span><strong>SEU<br>EVENTO.</strong><i>STORY · FEED · OUTDOOR</i>',
  motion:'<strong class="ns-play">▶</strong><i>FLYERS ANIMADOS / TEASERS</i>',
  sistemas:'<span class="ns-browserbar">noBRon. / SISTEMAS · ● ● ●</span><strong>GESTÃO<br>DE EVENTOS.</strong><i>PORTARIA / ESTOQUE / SITES</i>',
  contact:'<strong>FALE<br>COM A GENTE.</strong>'
 }[current];
 return '<section class="ns-hero ns-hero-'+current+'"><div class="ns-hero-copy"><small>'+esc(current==="home"?"ESTÚDIO DIGITAL":page.label.toUpperCase())+'</small><h1>'+esc(s.title)+'</h1><p>'+esc(s.description)+'</p>'+(current==="home"?action("/solucoes","Conheça os serviços"):current==="contact"?"":current==="solutions"?"":action("/contato","Solicitar orçamento"))+'</div>'+slot(s,"ns-hero-art",art)+'</section>';
}
function servicesSection(s){
 return '<section class="ns-services"><div class="ns-wrap">'+title(s)+'<div class="ns-service-list">'+services.map((v,i)=>'<a href="'+v.path+'" class="ns-service-link"><span>0'+(i+1)+'</span><div><strong>'+esc(v.name)+'</strong><p>'+esc(v.description)+'</p></div><b>↗</b></a>').join("")+'</div></div></section>';
}
function feature(s,i){
 const url=services.find(v=>v.id===s.service)?.path||"/solucoes";
 return '<section class="ns-feature ns-feature-'+esc(s.service)+'"><div class="ns-wrap ns-feature-grid"><div class="ns-feature-copy"><small>0'+(i+1)+' / SERVIÇO</small><h2>'+esc(s.title)+'</h2><p>'+esc(s.description)+'</p>'+action(url,"Ver serviço")+'</div>'+slot(s,"ns-feature-image",'<strong>'+esc(s.title)+'</strong>')+'</div></section>';
}
function formats(s){
 return '<section class="ns-formats"><div class="ns-wrap">'+title(s)+'<div class="ns-formats-list">'+(s.items||[]).map((item,i)=>'<div><small>0'+(i+1)+'</small><strong>'+esc(item)+'</strong></div>').join("")+'</div></div></section>';
}
function gallery(s){
 const d=galleryItems(s,"desktop"),m=galleryItems(s,"mobile");
 const combined=galleryItems(s,target()).length;
 if(!combined)return inPreview?'<section class="ns-empty-gallery"><div class="ns-wrap">'+title(s)+'<p>Escolha as mídias desta galeria no painel.</p></div></section>':"";
 return '<section class="ns-gallery" data-gallery="'+esc(s.id)+'"><div class="ns-wrap">'+title(s)+'<div class="ns-gallery-tools"><span>'+combined+' mídias</span><div><button aria-label="Voltar no carrossel" data-direction="-1">←</button><button aria-label="Avançar no carrossel" data-direction="1">→</button></div></div><div class="ns-gallery-track ns-gallery-d">'+(d.length?d:m).map((asset,i)=>galleryItem(asset,i,s)).join("")+'</div><div class="ns-gallery-track ns-gallery-m">'+(m.length?m:d).map((asset,i)=>galleryItem(asset,i,s)).join("")+'</div></div></section>';
}
function galleryItem(m,i,s){
 const u=mediaUrl(m);if(!u)return "";
 return '<button class="ns-gallery-item" data-lightbox="'+esc(u)+'" data-video="'+(video(m)?"1":"0")+'" aria-label="Ampliar mídia '+(i+1)+'">'+(video(m)?'<video src="'+esc(u)+'" muted playsinline preload="metadata"></video><span class="ns-play-icon">▶</span>':'<img loading="lazy" src="'+esc(u)+'" alt="Trabalho '+(i+1)+' de '+esc(page.label)+'">')+'</button>'
}
function cta(s){return '<section class="ns-cta">'+slot(s,"ns-cta-media","")+'<div class="ns-wrap"><small>ORÇAMENTO</small><h2>'+esc(s.title)+'</h2><p>'+esc(s.description)+'</p>'+action("/contato","Entrar em contato")+'</div></section>'}
function contact(s){
 let channels=[];
 const email=String(s.email||"").trim();
 if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))channels.push({name:"E-mail",href:"mailto:"+email,desc:email});
 const tel=String(s.whatsapp||"").replace(/\D/g,"");
 if(tel.length>=10&&tel.length<=15)channels.push({name:"WhatsApp",href:"https://wa.me/"+tel,desc:"Enviar mensagem"});
 const insta=String(s.instagram||"").trim().replace(/^@/,"");
 if(/^[a-zA-Z0-9._]{1,30}$/.test(insta))channels.push({name:"Instagram",href:"https://www.instagram.com/"+insta+"/",desc:"@"+insta});
 return '<section class="ns-contact"><div class="ns-wrap">'+title(s)+(channels.length?'<div class="ns-contact-list">'+channels.map(x=>'<a href="'+esc(x.href)+'" target="_blank" rel="noopener"><strong>'+x.name+'</strong><span>'+esc(x.desc)+'</span><b>↗</b></a>').join("")+'</div>':'<p class="ns-contact-pending">Os canais de atendimento serão disponibilizados aqui.</p>')+'</div></section>';
}
function render(){
 document.title=page.label+" · noBRon";
 const menu=[["Início","/","home"],["Soluções","/solucoes","services"],["Contato","/contato","contact"]];
 const svg={
 home:'<path d="M3 10 12 3l9 7v10H3z"/><path d="M9 20v-7h6v7"/>',
 services:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10M7 12h10M7 16h7"/>',
 contact:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>'
 };
 const active=["solutions","design","motion","sistemas"].includes(current)?"services":current;
 const nav=menu.map(([n,p,k])=>'<a href="'+p+'" '+(active===k?'aria-current="page"':"")+'>'+n+'</a>').join("");
 const mobile=menu.map(([n,p,k])=>'<a href="'+p+'" '+(active===k?'aria-current="page"':"")+'><svg viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+svg[k]+'</svg><span>'+n+'</span></a>').join("");
 const body=sections.filter(s=>s.visible!==false).map((s,i)=>{
 if(s.type==="gallery"&&!inPreview&&!galleryItems(s,target()).length)return "";
 const block=({hero:()=>hero(s),services:()=>servicesSection(s),feature:()=>feature(s,i),formats:()=>formats(s),gallery:()=>gallery(s),cta:()=>cta(s),contact:()=>contact(s)})[s.type];
 return '<div class="ns-edit-section" data-section-id="'+esc(s.id)+'">'+(block?block():"")+endDivider(s,i)+'</div>'
 }).join("");
 $("#app").innerHTML='<header class="ns-top"><a class="ns-logo" href="/">noBRon.</a><nav>'+nav+'</nav><a class="ns-top-contact" href="/contato">Orçamento ↗</a></header><main id="main" class="ns-page ns-page-'+current+'">'+body+'</main><footer class="ns-footer"><a class="ns-logo" href="/">noBRon.</a><span>Design Digital · Motion Design · Sistemas</span></footer><nav class="ns-bottom" aria-label="Menu principal">'+mobile+'</nav><div id="ns-overlay" hidden></div>';
 $$(".ns-reveal").forEach(el=>{
  el.onclick=()=>{ $$(".ns-reveal.active").forEach(x=>{if(x!==el)x.classList.remove("active")});el.classList.toggle("active");};
  el.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();el.click()}}
 });
 setupAutoscroll();
 $$(".ns-gallery").forEach(section=>{
  $$("[data-direction]",section).forEach(btn=>btn.onclick=()=>{
   const track=$(".ns-gallery-track"+(innerWidth<=800?".ns-gallery-m":".ns-gallery-d"),section);
   track?.scrollBy({left:Number(btn.dataset.direction)*(track.clientWidth*.8),behavior:"smooth"});
  });
 });
 $$("[data-lightbox]").forEach(b=>b.onclick=()=>{
  const u=b.dataset.lightbox;
  const wrap=$("#ns-overlay");wrap.hidden=false;
  wrap.innerHTML='<div role="dialog" aria-modal="true" class="ns-dialog"><button type="button" class="ns-close" aria-label="Fechar">×</button>'+(b.dataset.video==="1"?'<video controls autoplay playsinline src="'+esc(u)+'"></video>':'<img src="'+esc(u)+'" alt="Mídia ampliada">')+'</div>';
  $(".ns-close",wrap).onclick=()=>{wrap.hidden=true;wrap.innerHTML=""};
  wrap.onclick=e=>{if(e.target===wrap){wrap.hidden=true;wrap.innerHTML=""}};
 });
}
let autoTimer=null;
function setupAutoscroll(){
 if(autoTimer){clearInterval(autoTimer);autoTimer=null}
 if(!["home","motion","sistemas"].includes(current))return;
 if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return;
 const track=$(".ns-gallery-track"+(innerWidth<=800?".ns-gallery-m":".ns-gallery-d"));
 if(!track||track.scrollWidth<=track.clientWidth+3)return;
 let pauseUntil=0,dir=1;
 track.addEventListener("pointerdown",()=>pauseUntil=Date.now()+5000,{passive:true});
 track.addEventListener("pointerenter",()=>pauseUntil=Infinity);
 track.addEventListener("pointerleave",()=>pauseUntil=Date.now()+1800);
 track.addEventListener("focusin",()=>pauseUntil=Infinity);
 track.addEventListener("focusout",()=>pauseUntil=Date.now()+1800);
 autoTimer=setInterval(()=>{
  if(!track.isConnected||Date.now()<pauseUntil)return;
  const rect=track.getBoundingClientRect();
  if(rect.bottom<0||rect.top>innerHeight)return;
  const end=track.scrollWidth-track.clientWidth;
  if(track.scrollLeft>=end-2)dir=-1;
  else if(track.scrollLeft<=2)dir=1;
  track.scrollLeft+=dir*.68;
 },60);
}
let previewDirty=false;
window.addEventListener("message",ev=>{
 if(!inPreview||ev.source!==window.parent||ev.origin!==location.origin||ev.data?.source!=="nobron-media-editor")return;
 if(ev.data.kind==="draft"&&ev.data.page===current&&Array.isArray(ev.data.doc?.sections)){
  sections=ev.data.doc.sections;previewDirty=true;render();
 }
});
async function load(){
 try{
  const url=baseUrl+"/rest/v1/cms_published?kind=eq.page&key=eq."+current+"&select=payload&limit=1";
  const r=await fetch(url,{headers:{apikey:publishable},cache:"no-store"});
  if(r.ok){const data=await r.json();
   if(!previewDirty&&data[0]?.payload?.sections?.length){sections=data[0].payload.sections;render()}
  }
 }catch{ /* Keep static content if CMS unavailable */ }
}
render();load();
})();