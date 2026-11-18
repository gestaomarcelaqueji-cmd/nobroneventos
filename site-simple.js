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
const solutionDescriptions={"design":"Criação de flyers e materiais gráficos para divulgação de eventos, festas, atrações, produtos, serviços, cardápios, preços, promoções e comunicados. As artes são desenvolvidas de acordo com a identidade visual de cada projeto e entregues nos formatos e dimensões necessários para publicação em redes sociais, compartilhamento digital ou impressão.","motion":"Criação de flyers animados, teasers, vídeos promocionais e conteúdos em movimento para divulgação de eventos, atrações, produtos, serviços, ofertas e campanhas. Os materiais são produzidos e entregues nos formatos e proporções adequados para stories, reels, feeds, telões e outras plataformas de exibição.","sistemas":"Desenvolvimento de sites, páginas institucionais e sistemas personalizados para empresas, estabelecimentos e organizadores de eventos. Soluções para apresentação de serviços, cadastros, controle de estoque, portaria, gerenciamento de informações e processos administrativos, conforme as necessidades de cada projeto."};
function feature(s,i){
 const url=services.find(v=>v.id===s.service)?.path||"/solucoes";
 const description=current==="solutions"?(solutionDescriptions[s.service]||s.description):s.description;
 const number=current==="solutions"?Math.max(1,services.findIndex(v=>v.id===s.service)+1):i+1;
 return '<section class="ns-feature ns-feature-'+esc(s.service)+'"><div class="ns-wrap ns-feature-grid"><div class="ns-feature-copy"><small>0'+number+' / SERVIÇO</small><h2>'+esc(s.title)+'</h2><p>'+esc(description)+'</p>'+action(url,"Ver serviço")+'</div>'+(current==="solutions"?"":slot(s,"ns-feature-image",'<strong>'+esc(s.title)+'</strong>'))+'</div></section>';
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

function designPage(doc){
 const heroSection=doc.find(s=>s.id==="hero")||{};
 const gallerySection=doc.find(s=>s.id==="galeria"&&s.visible!==false);
 const heading=heroSection.title&&heroSection.title!=="Material de divulgação para eventos."?heroSection.title:"Artes para divulgar o que você precisa.";
 const description=heroSection.description&&heroSection.description!=="Artes para festas, shows, baladas, pubs e artistas."?heroSection.description:"Criamos flyers e materiais gráficos para eventos, atrações, produtos, serviços, preços, promoções e comunicados. Cada peça é desenvolvida a partir das informações do projeto e entregue no formato combinado para publicação digital ou impressão.";
 const g=gallerySection?gallery(gallerySection):"";
 return '<div class="nd-design-shell"><section class="nd-design-hero"><div class="nd-design-intro"><small>DESIGN DIGITAL</small><h1>'+esc(heading)+'</h1><p>'+esc(description)+'</p><a class="nd-design-action" href="#nd-orcamento">Simular meu pacote <span aria-hidden="true">↗</span></a></div><div class="nd-design-visual" aria-hidden="true"><div class="nd-design-flyer nd-design-flyer-a"><span>DIVULGAÇÃO</span><strong>SEU<br>EVENTO.</strong></div><div class="nd-design-flyer nd-design-flyer-b"><span>DESIGN DIGITAL</span><strong>FLYERS<br>& ARTES.</strong></div><div class="nd-design-flyer nd-design-flyer-c"><span>COMUNICAÇÃO</span><strong>SUA<br>MARCA.</strong></div></div></section><section class="nd-design-budget" id="nd-orcamento" aria-label="Simular orçamento mensal de artes"><div class="nd-budget-top"><h2>Quantas artes você precisa por mês?</h2><p>Arraste a barra para simular seu pacote mensal.</p></div><div class="nd-budget-grid"><div class="nd-budget-control"><div class="nd-budget-quantity"><output id="nd-qty" for="nd-slider">8</output><span>artes por mês</span></div><input type="range" id="nd-slider" min="1" max="16" step="1" value="8" aria-label="Quantidade de artes por mês"><div class="nd-budget-marks"><span>1</span><span>8</span><span>16</span></div></div><div class="nd-budget-values"><div class="nd-budget-total"><small>VALOR DO PACOTE</small><output id="nd-total">R$ 250,00</output></div><div class="nd-budget-saving"><output id="nd-saving">R$ 150,00</output><span>ECONOMIZADOS</span></div></div></div><a class="nd-design-action nd-budget-whatsapp" id="nd-whatsapp" href="https://wa.me/?text=Ol%C3%A1" target="_blank" rel="noopener">Solicitar pacote pelo WhatsApp <span aria-hidden="true">↗</span></a></section><section class="nd-design-motion" aria-label="Aplicações do design digital"><div class="nd-motion-fixed">ARTE PARA</div><div class="nd-motion-viewport" aria-live="off"><span id="nd-motion-word">SEU EVENTO.</span></div></section>'+(g?'<div class="nd-design-portfolio">'+g+'</div>':"")+'</div>';
}
function setupDesign(){
 if(current!=="design"||inPreview)return;
 const slider=$("#nd-slider"),qty=$("#nd-qty"),total=$("#nd-total"),saving=$("#nd-saving"),link=$("#nd-whatsapp"),word=$("#nd-motion-word");
 if(!slider||!qty||!total||!saving||!link||!word)return;
 const packs=[{q:16,v:400},{q:8,v:250},{q:3,v:100},{q:2,v:60},{q:1,v:50}];
 const cost=n=>{let sum=0;for(const p of packs){const k=Math.floor(n/p.q);sum+=k*p.v;n-=k*p.q}return sum};
 const brl=n=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
 const contact=pages.contact?.sections?.find(s=>s.type==="contact");
 const phone=String(contact?.whatsapp||"").replace(/\D/g,"");
 function update(){const n=Number(slider.value),value=cost(n),saved=n*50-value;qty.textContent=String(n);total.textContent=brl(value);saving.textContent=brl(saved);slider.style.setProperty("--progress",((n-1)/15*100)+"%");const msg="Olá! Gostaria de contratar "+n+" "+(n===1?"arte":"artes")+" por mês. Valor estimado do pacote: "+brl(value)+".";link.href="https://wa.me/"+(phone.length>=10&&phone.length<=15?phone:"")+"?text="+encodeURIComponent(msg)}
 slider.addEventListener("input",update);update();
 const phrases=["SEU EVENTO.","ATRAÇÕES.","INGRESSOS.","SEU BAR.","PROMOÇÕES.","CARDÁPIOS.","PRODUTOS.","NOVIDADES.","SUA IDEIA."];
 if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return;
 let idx=0;const animate=()=>{if(!word.isConnected)return;word.classList.add("nd-motion-out");setTimeout(()=>{if(!word.isConnected)return;idx=(idx+1)%phrases.length;word.textContent=phrases[idx];word.classList.remove("nd-motion-out");word.classList.add("nd-motion-in");requestAnimationFrame(()=>requestAnimationFrame(()=>word.classList.remove("nd-motion-in")))},520)};
 setInterval(()=>{if(!document.hidden)animate()},3200);
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
 const body=current==="design"&& !inPreview ? designPage(sections) : sections.filter(s=>s.visible!==false).map((s,i)=>{
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
 setupDesign();
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