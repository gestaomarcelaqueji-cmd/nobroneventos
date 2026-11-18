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
const serviceIcons=['<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></svg>','<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 12 7-12 7V5Z"/></svg>','<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-3 20"/></svg>'];
function servicesSection(s){
 return '<section class="ns-services"><div class="ns-wrap">'+title(s)+'<div class="ns-service-list">'+services.map((v,i)=>'<a href="'+v.path+'" class="ns-service-link"><span>'+serviceIcons[i]+'</span><div><strong>'+esc(v.name)+'</strong><p>'+esc(v.description)+'</p></div><b>↗</b></a>').join("")+'</div></div></section>';
}
const solutionDescriptions={"design":"Criação de flyers e materiais gráficos para divulgação de eventos, festas, atrações, produtos, serviços, cardápios, preços, promoções e comunicados. As artes são desenvolvidas de acordo com a identidade visual de cada projeto e entregues nos formatos e dimensões necessários para publicação em redes sociais, compartilhamento digital ou impressão.","motion":"Criação de flyers animados, teasers, vídeos promocionais e conteúdos em movimento para divulgação de eventos, atrações, produtos, serviços, ofertas e campanhas. Os materiais são produzidos e entregues nos formatos e proporções adequados para stories, reels, feeds, telões e outras plataformas de exibição.","sistemas":"Desenvolvimento de sites, páginas institucionais e sistemas personalizados para empresas, estabelecimentos e organizadores de eventos. Soluções para apresentação de serviços, cadastros, controle de estoque, portaria, gerenciamento de informações e processos administrativos, conforme as necessidades de cada projeto."};
function feature(s,i){
 const url=services.find(v=>v.id===s.service)?.path||"/solucoes";
 const description=current==="solutions"?(solutionDescriptions[s.service]||s.description):s.description;
 const number=current==="solutions"?Math.max(1,services.findIndex(v=>v.id===s.service)+1):i+1;
 if(current==="solutions"){
  const brief={design:"Flyers, artes promocionais e materiais gráficos.",motion:"Flyers animados, teasers e vídeos promocionais.",sistemas:"Sites, portaria, bar e ingressos online."}[s.service]||s.description;
  const details={design:"Flyers para eventos, line-ups, ingressos, cardápios, ofertas e comunicados. Materiais preparados para os formatos de divulgação combinados.",motion:"Vídeos para apresentar atrações, anunciar datas, divulgar ingressos e programações em Reels, Stories, telões e painéis.",sistemas:"Sites completos para artistas, produtoras, baladas e pubs; sistemas para organizar portaria e bar; e soluções para venda e conferência de ingressos."}[s.service]||description;
  return '<section class="ns-feature ns-feature-'+esc(s.service)+' ns-accordion"><div class="ns-wrap"><div class="ns-accordion-item"><button class="ns-accordion-trigger" type="button" aria-expanded="false" aria-controls="ns-service-panel-'+esc(s.service)+'"><span class="ns-accordion-top"><small>0'+number+' / SERVIÇO</small><span class="ns-accordion-icon" aria-hidden="true">+</span></span><strong class="ns-accordion-heading">'+esc(s.title)+'</strong><span class="ns-accordion-brief">'+esc(brief)+'</span><span class="ns-accordion-hint">Toque para explorar <span aria-hidden="true">↗</span></span></button><div class="ns-accordion-panel" id="ns-service-panel-'+esc(s.service)+'" inert><div class="ns-accordion-inner"><p>'+esc(details)+'</p>'+action(url,"Explorar serviço")+'</div></div></div></div></section>';
 }
 return '<section class="ns-feature ns-feature-'+esc(s.service)+'"><div class="ns-wrap ns-feature-grid"><div class="ns-feature-copy"><small>0'+number+' / SERVIÇO</small><h2>'+esc(s.title)+'</h2><p>'+esc(description)+'</p>'+action(url,"Ver serviço")+'</div>'+slot(s,"ns-feature-image",'<strong>'+esc(s.title)+'</strong>')+'</div></section>';
}
function setupSolutionsAccordion(){
 if(current!=="solutions"||inPreview)return;
 const items=$$(".ns-page-solutions .ns-accordion-item");
 const toggle=(item,open)=>{
  const trigger=$(".ns-accordion-trigger",item),panel=$(".ns-accordion-panel",item);
  item.classList.toggle("is-open",open);trigger.setAttribute("aria-expanded",String(open));panel.inert=!open;
 };
 items.forEach(item=>{
  toggle(item,false);
  $(".ns-accordion-trigger",item).addEventListener("click",()=>{
   const shouldOpen=!item.classList.contains("is-open");
   items.forEach(other=>toggle(other,false));
   if(shouldOpen)toggle(item,true);
  });
 });
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


function motionPage(){
 const tiles=Array.from({length:9},(_,i)=>'<div class="nm-tile nm-tile-'+(i+1)+'" data-motion-tile="'+i+'"></div>').join("");
 return '<div class="nm-shell"><section class="nm-stage"><div class="nm-reel" id="nm-reel" aria-hidden="true"><div class="nm-mosaic">'+tiles+'</div></div><div class="nm-copy"><small>SOLUÇÕES / 02</small><h1>Motion Design.</h1><p>Produzimos <strong>flyers animados, teasers e vídeos promocionais</strong> para festas, shows, baladas, pubs, casas noturnas e artistas.</p><p>Animamos fotografias, textos e elementos gráficos para apresentar atrações, anunciar datas, divulgar ingressos, programações e promoções em Reels, Stories, telões e painéis de LED.</p><a class="nm-button" href="/contato">Solicitar orçamento <span aria-hidden="true">↗</span></a></div></section></div>';
}
async function setupMotion(){
 if(current!=="motion"||inPreview)return;
 const root=$("#nm-reel");if(!root)return;
 const tiles=[...root.querySelectorAll("[data-motion-tile]")];
 const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
 let visible=true,disposed=false;
 const resume=()=>{if(reduced||!visible||document.hidden)return;const candidates=tiles.slice(0,3).map(t=>t.querySelector("video")).filter(Boolean);candidates.forEach(v=>{v.muted=true;v.play().catch(()=>{})})};
 const observer=new IntersectionObserver(entries=>{visible=!!entries[0]?.isIntersecting&&!document.hidden;if(!visible)root.querySelectorAll("video").forEach(v=>v.pause());else resume()},{threshold:.02});
 document.addEventListener("visibilitychange",()=>{if(document.hidden)root.querySelectorAll("video").forEach(v=>v.pause());else{visible=true;resume()}});
 observer.observe(root);
 try{
  const response=await fetch(baseUrl+"/functions/v1/nobron-motion-videos?public=1",{cache:"no-store"});
  if(!response.ok)throw Error("motion");
  const payload=await response.json();
  let items=(payload.videos||[]).filter(v=>typeof v.url==="string"&&/^https:\/\//.test(v.url));
  if(!items.length){
   const fallback=await fetch(baseUrl+"/rest/v1/nobron_v3_media?select=id,object_path,mime&published=eq.true&section=eq.hero&mime=like.video%25&order=display_order.asc",{headers:{apikey:publishable}});
   if(fallback.ok){const rows=await fallback.json();items=rows.filter(v=>v.mime?.startsWith("video/")).map(v=>({id:v.id,url:baseUrl+"/storage/v1/object/public/nobron-public/"+v.object_path}))}
  }
  const seen=new Set();items=items.filter(v=>{const key=v.id||v.url;if(seen.has(key))return false;seen.add(key);return true});
  if(!items.length){root.classList.add("nm-empty");return}
  const count=Math.min(items.length,tiles.length);
  const assigned=new Map();
  let cursor=count,rotating=false;
  function prepare(item){
   return new Promise(resolve=>{
    const v=document.createElement("video");v.muted=true;v.defaultMuted=true;v.playsInline=true;v.loop=true;v.preload="metadata";v.autoplay=false;v.disablePictureInPicture=true;v.setAttribute("playsinline","");v.setAttribute("aria-hidden","true");
    let done=false;const finish=ok=>{if(done)return;done=true;clearTimeout(timeout);resolve(ok?v:null)};
    const timeout=setTimeout(()=>finish(false),6500);
    v.addEventListener("loadedmetadata",()=>finish(true),{once:true});v.addEventListener("error",()=>finish(false),{once:true});
    v.src=item.url;v.load();
   });
  }
  async function show(tile,item,play=false){
   const next=await prepare(item);
   if(!next||!tile.isConnected)return false;
   next.className="nm-video nm-incoming";tile.append(next);
   requestAnimationFrame(()=>requestAnimationFrame(()=>{next.classList.add("nm-shown");tile.classList.add("nm-ready")}));
   const previous=[...tile.querySelectorAll("video")].filter(v=>v!==next);
   setTimeout(()=>{previous.forEach(v=>{v.pause();v.remove()});next.classList.remove("nm-incoming")},850);
   assigned.set(tile,item.url);
   if((play||tiles.indexOf(tile)<3)&&visible&&!document.hidden&&!reduced){next.muted=true;next.play().catch(()=>{})}
   return true;
  }
  // Autoplay three muted videos immediately; keep the other tiles as static first frames to reduce mobile load.
  await Promise.all(tiles.slice(0,Math.min(3,count)).map((tile,i)=>show(tile,items[i],true)));

  // Do not serialize video requests: a slow file must not hold up the other cards.
  const remaining=tiles.slice(3,count).map((tile,j)=>show(tile,items[j+3],false));
  Promise.allSettled(remaining).catch(()=>{});
  if(disposed||reduced)return;
  let cursorTile=0;
  const timer=setInterval(()=>{
   if(!root.isConnected){clearInterval(timer);observer.disconnect();return}
   if(document.hidden||!visible)return;
   const ready=tiles.slice(0,count).filter(tile=>tile.querySelector("video"));
   if(!ready.length)return;
   const active=ready.slice(cursorTile%ready.length).concat(ready.slice(0,cursorTile%ready.length)).slice(0,Math.min(3,ready.length));
   root.querySelectorAll("video").forEach(v=>{if(!active.some(t=>t.contains(v)))v.pause()});
   active.forEach(tile=>{const v=tile.querySelector("video");if(v){v.muted=true;v.play().catch(()=>{})}});
   cursorTile=(cursorTile+1)%ready.length;
  },5500);

 }catch{root.classList.add("nm-empty")}
}

function designPage(doc){
 const heroSection=doc.find(s=>s.id==="hero")||{};
 const gallerySection=doc.find(s=>s.id==="galeria"&&s.visible!==false);
 const heading=heroSection.title&&heroSection.title!=="Material de divulgação para eventos."?heroSection.title:"Artes para divulgar o que você precisa.";
 const g=gallerySection?gallery(gallerySection):"";
 const cards='<div class="nd-design-visual" aria-label="Três trabalhos de Design Digital"><div class="nd-design-flyer nd-design-flyer-a" data-design-card="1"><span>DIVULGAÇÃO</span><strong>SEU<br>EVENTO.</strong></div><div class="nd-design-flyer nd-design-flyer-b" data-design-card="2"><span>DESIGN DIGITAL</span><strong>FLYERS<br>& ARTES.</strong></div><div class="nd-design-flyer nd-design-flyer-c" data-design-card="3"><span>COMUNICAÇÃO</span><strong>SUA<br>MARCA.</strong></div></div>';
 const intro='<section class="nd-design-hero"><div class="nd-design-intro"><small>DESIGN DIGITAL</small><h1>'+esc(heading)+'</h1><p>Desenvolvemos flyers e materiais gráficos para <strong>festas, shows, baladas, pubs, casas noturnas e artistas.</strong></p><p>Do anúncio de um evento à divulgação de atrações, ingressos e últimas chamadas, criamos peças para cada momento da programação.</p><a class="nd-design-action" href="#nd-orcamento">Simular meu pacote <span aria-hidden="true">↗</span></a></div>'+cards+'</section>';
 const explanation='<section class="nd-design-explainer"><div class="nd-explainer-heading"><small>DO ANÚNCIO À ÚLTIMA CHAMADA</small><h2>Uma arte para cada momento da divulgação.</h2></div><div class="nd-explainer-copy"><p>Primeiro, a data e as informações do evento. Depois, artistas confirmados, line-up, ingressos, lotes, camarotes e reservas. Mais perto da festa, entram localização, avisos e últimas chamadas.</p><p>Para bares, pubs e casas noturnas, também criamos artes para programação semanal, apresentações, cardápios, combos e promoções.</p><p class="nd-explainer-secondary">Outras aplicações: divulgação de produtos, serviços e comunicados comerciais.</p></div></section>';
 const motion='<section class="nd-design-motion" aria-label="Exemplos de artes para divulgação"><div class="nd-motion-fixed">ARTE PARA DIVULGAR</div><div class="nd-motion-viewport" aria-live="off"><span id="nd-motion-word">A DATA DO EVENTO.</span></div></section>';
 const budget='<section class="nd-design-budget" id="nd-orcamento" aria-label="Simular orçamento mensal de artes"><div class="nd-budget-top"><h2>Quantas artes você precisa por mês?</h2><p>Escolha a quantidade para consultar o valor do pacote e sua economia em relação à contratação individual.</p></div><div class="nd-budget-grid"><div class="nd-budget-control"><div class="nd-budget-quantity"><output id="nd-qty" for="nd-slider">8</output><span>artes por mês</span></div><input type="range" id="nd-slider" min="1" max="16" step="1" value="8" aria-label="Quantidade de artes por mês"><div class="nd-budget-marks"><span>1</span><span>8</span><span>16</span></div></div><div class="nd-budget-values"><div class="nd-budget-total"><div class="nd-budget-regular"><span>Contratando individualmente</span><del id="nd-regular">R$ 400,00</del></div><small>VALOR DO PACOTE</small><output id="nd-total">R$ 250,00</output></div><div class="nd-budget-saving"><span>VOCÊ ECONOMIZA</span><output id="nd-saving">R$ 150,00</output></div></div></div><p class="nd-budget-note">Cada arte corresponde a uma peça com conteúdo próprio, em um formato combinado. Adaptações para outros tamanhos são orçadas à parte.</p><a class="nd-design-action nd-budget-whatsapp" id="nd-whatsapp" href="https://wa.me/?text=Ol%C3%A1" target="_blank" rel="noopener">Solicitar pacote pelo WhatsApp <span aria-hidden="true">↗</span></a></section>';
 return '<div class="nd-design-shell">'+intro+explanation+motion+budget+(g?'<div class="nd-design-portfolio">'+g+'</div>':"")+'</div>';
}
function setupDesignCards(){
 if(current!=="design")return;
 const cards=[...document.querySelectorAll("[data-design-card]")];if(!cards.length)return;
 fetch(baseUrl+"/functions/v1/nobron-design-cards",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("cards");return r.json()}).then(data=>{
  for(const item of data.cards||[]){const el=cards.find(x=>x.dataset.designCard===String(item.slot));if(!el||!item.url||!/^https:\/\//.test(item.url))continue;el.replaceChildren();const img=document.createElement("img");img.src=item.url;img.alt="Arte de destaque "+item.slot;img.loading="lazy";img.decoding="async";img.draggable=false;el.append(img);el.classList.add("nd-design-flyer-loaded")}
 }).catch(()=>{});
}

function setupDesign(){
 if(current!=="design"||inPreview)return;
 const slider=$("#nd-slider"),qty=$("#nd-qty"),total=$("#nd-total"),saving=$("#nd-saving"),regular=$("#nd-regular"),link=$("#nd-whatsapp"),word=$("#nd-motion-word");
 if(!slider||!qty||!total||!saving||!link||!word)return;
 const packs=[{q:16,v:400},{q:8,v:250},{q:3,v:100},{q:2,v:60},{q:1,v:50}];
 const cost=n=>{let sum=0;for(const p of packs){const k=Math.floor(n/p.q);sum+=k*p.v;n-=k*p.q}return sum};
 const brl=n=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
 const contact=pages.contact?.sections?.find(s=>s.type==="contact");
 const phone=String(contact?.whatsapp||"").replace(/\D/g,"");
 function update(){const n=Number(slider.value),value=cost(n),saved=n*50-value;qty.textContent=String(n);total.textContent=brl(value);regular.textContent=brl(n*50);saving.textContent=brl(saved);slider.style.setProperty("--progress",((n-1)/15*100)+"%");const msg="Olá! Gostaria de contratar "+n+" "+(n===1?"arte":"artes")+" por mês. Valor estimado do pacote: "+brl(value)+".";link.href="https://wa.me/"+(phone.length>=10&&phone.length<=15?phone:"")+"?text="+encodeURIComponent(msg)}
 slider.addEventListener("input",update);update();
 const phrases=["A DATA DO EVENTO.","O EVENTO COMPLETO.","ARTISTAS CONFIRMADOS.","O LINE-UP.","A VENDA DE INGRESSOS.","A VIRADA DE LOTE.","CAMAROTES E RESERVAS.","O MAPA DO EVENTO.","A LOCALIZAÇÃO.","PROMOÇÕES DO BAR.","COMBOS DE BEBIDAS.","A PROGRAMAÇÃO.","A CONTAGEM REGRESSIVA.","A ÚLTIMA CHAMADA.","AVISOS AO PÚBLICO.","A PRÓXIMA EDIÇÃO."];
 if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return;
 let idx=0;const animate=()=>{if(!word.isConnected)return;word.classList.add("nd-motion-out");setTimeout(()=>{if(!word.isConnected)return;idx=(idx+1)%phrases.length;word.textContent=phrases[idx];word.classList.remove("nd-motion-out");word.classList.add("nd-motion-in");requestAnimationFrame(()=>requestAnimationFrame(()=>word.classList.remove("nd-motion-in")))},520)};
 setInterval(()=>{if(!document.hidden)animate()},3200);
}

function systemsPage(){
 const points=(arr)=>arr.map(([h,p])=>'<div class="sy-point"><strong>'+esc(h)+'</strong><p>'+esc(p)+'</p></div>').join("");
 const button=(label,topic)=>'<a class="sy-cta" href="/contato?assunto='+encodeURIComponent(topic)+'">'+esc(label)+' <span aria-hidden="true">↗</span></a>';
 const visual=(type)=>type==="site"?'<div class="sy-browser"><div class="sy-browser-top">noBRon. / APRESENTAÇÃO DIGITAL</div><div class="sy-browser-body"><strong>SEU TRABALHO.<br>EM UM SÓ LUGAR.</strong><div class="sy-browser-bars"><span></span><span></span><span></span></div></div></div>':type==="bar"?'<div class="sy-browser"><div class="sy-browser-top">OPERAÇÃO / PORTARIA E BAR</div><div class="sy-browser-body"><strong>PORTARIA<br>+ BAR.</strong><div class="sy-browser-bars"><span></span><span></span><span></span></div></div></div>':'<div class="sy-steps"><div class="sy-step">ESCOLHER<br>INGRESSO</div><span class="sy-arrow">→</span><div class="sy-step">COMPRA</div><span class="sy-arrow">→</span><div class="sy-step">CONFERÊNCIA</div></div>';
 const section=(n,kicker,heading,lead,scenario,solution,items,benefit,ctaLabel,topic,light,type)=>'<section class="sy-section '+(light?'sy-light':'sy-dark')+'"><div class="sy-container"><div class="sy-section-head"><small class="sy-eyebrow">'+n+' / '+kicker+'</small><h2>'+heading+'</h2><p class="sy-lead">'+lead+'</p></div><div class="sy-split"><div class="sy-story"><h3>'+scenario[0]+'</h3>'+scenario.slice(1).map(p=>'<p>'+p+'</p>').join('')+'<h3>'+solution+'</h3><p class="sy-benefit">'+benefit+'</p>'+button(ctaLabel,topic)+'</div><div><div class="sy-visual" aria-label="Visão da solução">'+visual(type)+'</div><div class="sy-solution"><small>COMO PODEMOS AJUDAR</small>'+points(items)+'</div></div></div></div></section>';
 return '<div class="sy-page"><section class="sy-hero"><div class="sy-hero-art" aria-hidden="true">'+['SITES COMPLETOS','PORTARIA E BAR','INGRESSOS ONLINE'].map((s,i)=>'<div class="sy-screen"><small>0'+(i+1)+' / SOLUÇÕES</small><strong>'+s+'</strong><div class="sy-lines"><i></i><i></i><i></i></div></div>').join('')+'</div><div class="sy-container"><div class="sy-hero-copy"><small class="sy-eyebrow">NOBRON. / SISTEMAS</small><h1>Sites e sistemas para eventos, artistas e estabelecimentos.</h1><p>Criação de sites completos, sistemas para portaria e bar e plataformas de ingressos online.</p><p>Cada projeto é organizado a partir das necessidades do negócio: divulgar a programação, atender clientes, registrar vendas e acompanhar a operação.</p><a class="sy-cta" href="#sy-sites">Conhecer as soluções <span aria-hidden="true">↘</span></a></div></div></section><div id="sy-sites">'+
 section('01','SITES COMPLETOS','Sites completos para artistas, produtoras, baladas e pubs.','Apresente sua programação, seus serviços e suas informações em um endereço fácil de compartilhar.', ['Quando cada informação está em um lugar.','Um contratante procura fotos e vídeos de um artista. O público quer consultar a programação do fim de semana. Um cliente precisa encontrar o contato para reservar uma mesa.','Se essas informações ficam espalhadas entre publicações, destaques e conversas, as mesmas perguntas chegam à equipe repetidamente.'],'Tudo organizado em um site completo.',[['Artistas','Agenda, fotos, vídeos, portfólio e contato para contratação.'],['Produtoras','Eventos, trabalhos realizados, serviços e solicitações de orçamento.'],['Baladas e pubs','Programação, atrações, horários, localização e informações de reservas.']],'Seu público encontra informações com mais facilidade, e sua equipe pode direcionar as pessoas para um único endereço.','Solicitar meu site','Site completo',true,'site')+'</div>'+
 section('02','PORTARIA E BAR','Sistemas para portaria e bar.','Mais organização para conferir entradas, registrar pedidos e acompanhar vendas durante o funcionamento da casa.',['Quando o movimento aumenta.','Na entrada, a equipe precisa conferir acessos. No bar, chegam novos pedidos enquanto outros ainda estão sendo preparados. No caixa, é preciso localizar registros e conferir valores.','Quando cada etapa depende de anotações ou informações separadas, pequenas conferências tomam tempo e podem gerar retrabalho.'],'Informações acessíveis para a equipe.',[['Entrada','Consulta de acessos, registro de entradas e conferência de informações.'],['Equipe','Registros padronizados e acesso às informações necessárias para cada função.'],['Bar e caixa','Organização de pedidos, produtos, preços e vendas para facilitar conferências.'],['Divergências','Registros de movimentações para facilitar a conferência de diferenças e acompanhar o que aconteceu.']],'A equipe consulta registros com mais facilidade, reduz tarefas repetitivas e ganha tempo para atender o público.','Organizar minha operação','Sistema de portaria e bar',false,'bar')+
 section('03','INGRESSOS ONLINE','Sistema de ingressos online.','Divulgue os ingressos disponíveis, organize os pedidos e facilite a conferência na entrada do evento.',['Quando as vendas começam a aumentar.','Quanto custa a pista? Ainda tem VIP? Como comprar? O pedido foi confirmado? Essas perguntas chegam ao mesmo tempo em que a produção organiza o evento.','Controlar tudo por mensagens e listas manuais exige conferências constantes. Na entrada, a equipe também precisa identificar cada ingresso e verificar se já foi utilizado.'],'Da escolha do ingresso à entrada.',[['Para o público','Informações do evento, categorias, valores e opções disponíveis em um só lugar.'],['Para a produção','Consulta de pedidos, ingressos vendidos e disponibilidade de cada categoria.'],['Para a portaria','Conferência individual de ingressos para identificar acessos já registrados e informações inconsistentes.']],'Mais clareza sobre as vendas e uma conferência de entrada organizada, com registros que ajudam a identificar tentativas de reutilização.','Desenvolver sistema de ingressos','Sistema de ingressos online',true,'ticket')+
 '<section class="sy-final"><div class="sy-container"><small class="sy-eyebrow">PROJETOS SOB MEDIDA</small><h2>Vamos organizar a operação do seu negócio.</h2><p>Conte como funciona sua casa, produtora ou evento. A partir disso, podemos definir quais etapas precisam de um site, de controles de atendimento ou de um sistema de ingressos.</p>'+button('Conversar sobre meu projeto','Sistemas personalizados')+'</div></section></div>';
}


function homeRebuild(){
 const heroData=sections.find(s=>s.id==="hero")||{title:"Design. Motion. Sistemas.",description:"Divulgação e soluções digitais para eventos, baladas, pubs e artistas."};
 const ctaData=sections.find(s=>s.id==="chamada")||{title:"Seu evento precisa aparecer.",description:"Solicite uma proposta para seu projeto."};
 const cards=services.map((v,i)=>'<a class="nh-service" href="'+esc(v.path)+'"><span class="nh-service-icon">'+serviceIcons[i]+'</span><span class="nh-service-text"><strong>'+esc(v.name)+'</strong><span>'+esc(v.description)+'</span></span><span class="nh-service-arrow" aria-hidden="true">↗</span></a>').join("");
 return '<div class="nh-home"><div class="nh-stage"><div class="nh-glow nh-glow-pink"></div><div class="nh-glow nh-glow-cyan"></div><div class="nh-flyers" id="nh-flyers" aria-hidden="true"></div><div class="nh-stage-shade"></div><div class="nh-hero-glass"><span class="nh-eyebrow">ESTÚDIO DIGITAL</span><h1>'+esc(heroData.title)+'</h1><p>'+esc(heroData.description)+'</p><a class="nh-primary" href="/solucoes">Conheça os serviços <span aria-hidden="true">↗</span></a></div></div><section class="nh-services" aria-label="Nossos serviços"><p class="nh-eyebrow">NOSSOS SERVIÇOS</p><div class="nh-services-grid">'+cards+'</div></section><section class="nh-contact-strip"><div><h2>'+esc(ctaData.title)+'</h2><p>'+esc(ctaData.description)+'</p></div><a href="/contato" class="nh-contact-action"><span>Entrar em contato</span><span aria-hidden="true">↗</span></a></section></div>';
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
 const body=current==="home"&&!inPreview ? homeRebuild() : current==="contact"&&!inPreview ? window.NOBRON_CONTACT_PAGE.render(sections) : current==="sistemas"&&!inPreview ? systemsPage() : current==="motion"&&!inPreview ? motionPage() : current==="design"&& !inPreview ? designPage(sections) : sections.filter(s=>s.visible!==false).map((s,i)=>{
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
 setupSolutionsAccordion();
 setupDesign();
 setupDesignCards();
 setupMotion();
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