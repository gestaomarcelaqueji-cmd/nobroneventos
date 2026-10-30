(()=>{
"use strict";
const C=window.NOBRON_SCHEMA, {pages,services,baseUrl,publishable}=C;
const nav=[["Início","/","⌂"],["Soluções","/solucoes","▤"],["Projetos","/projetos","▦"],["Sobre","/sobre","◯"],["Contato","/contato","✉"]];
const R=Object.fromEntries(Object.entries(pages).map(([k,v])=>[v.route,k]));
const S={page:{},projects:[],filter:"todos"};
const esc=t=>String(t??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
const pkey=()=>R[location.pathname.replace(/\/+$/,"")||"/"]||"home";
const current=()=>({...pages[pkey()],sections:S.page[pkey()]?.sections||pages[pkey()].sections});
const btn=(to,name)=>'<a class="vx-btn" href="'+esc(to)+'">'+esc(name)+' ↗</a>';
const title=s=>'<div class="vx-heading"><small>noBRon. / '+esc(pages[pkey()].label)+'</small><h2>'+esc(s.title)+'</h2><p>'+esc(s.description)+'</p></div>';
const style=(s,d)=>'object-position:'+Number(s.device?.[d]?.position||50)+'% 50%;transform:scale('+(Math.max(1,Math.min(1.8,(Number(s.device?.[d]?.zoom)||100)/100)))+')';
const url=a=>a&&(typeof a==="string"?a:a.src)||"";
function media(s,cls,placeholder){
 const desktop=s.media?.desktop,mobile=s.media?.mobile;
 const d=url(desktop),m=url(mobile),src=d||m;
 if(!src)return '<div class="vx-media vx-demo '+cls+'" aria-hidden="true">'+placeholder+'</div>';
 const item=(a,device)=>{
 const u=url(a);if(!u)return "";
 if(a.type==="video"||/\.(mp4|webm)(\?|$)/i.test(u))return '<video src="'+esc(u)+'" controls playsinline preload="metadata"></video>';
 return '<img src="'+esc(u)+'" loading="lazy" alt="Mídia de '+esc(pages[pkey()].label)+'" style="'+style(s,device)+'">';
 };
 const missing='<div class="vx-device-empty"><small>Mídia não cadastrada para este dispositivo</small></div>';
 return '<div class="vx-media vx-photo '+cls+'" tabindex="0" aria-label="Revelar cores da imagem"><div class="vx-desktop-only">'+(d?item(desktop,"desktop"):missing)+'</div><div class="vx-mobile-only">'+(m?item(mobile,"mobile"):missing)+'</div></div>'
}
function division(s,i){
 const opts=["curve","diagonal","fold","notch"],d=s.device?.desktop?.divider,m=s.device?.mobile?.divider;
 return '<div aria-hidden="true" class="vx-divider vx-d-'+(opts.includes(d)?d:opts[i%4])+' vx-m-'+(opts.includes(m)?m:opts[(i+1)%4])+'"></div>'
}
const visibleWorks=(cat="todos",limit=99)=>{const a=S.projects.filter(x=>x.visible!==false&&(cat==="todos"||x.category===cat));if(pkey()==="home")a.sort((x,y)=>Number(y.featured===true)-Number(x.featured===true));return a.slice(0,limit)};
function works(cat="todos",limit=99){
 const a=visibleWorks(cat,limit);
 if(!a.length)return '<div class="vx-empty"><b>Portfólio em atualização.</b><p>Os trabalhos realizados serão publicados aqui.</p></div>';
 return '<div class="vx-project-grid">'+a.map(p=>{
 const img=url(p.cover?.[innerWidth<=800?"mobile":"desktop"])||url(p.cover);
 return '<button type="button" class="vx-project" data-project="'+esc(p.id)+'"><span class="vx-project-image">'+(img?'<img loading="lazy" src="'+esc(img)+'" alt="'+esc(p.title)+'">':'<span>'+esc(p.category)+'</span>')+'</span><strong>'+esc(p.title)+'</strong><small>'+esc(p.category)+'</small></button>'
 }).join("")+'</div>'
}
function pageBody(s,i){
 const work=(cat,cl)=>'<section class="vx-section '+cl+'"><div class="vx-wrap">'+title(s)+works(cat,8)+'</div></section>';
 switch(s.type){
 case "homeHero":return '<section class="vx-home-hero"><div class="vx-copy"><small>ESTÚDIO DIGITAL</small><h1>'+esc(s.title)+'</h1><p>'+esc(s.description)+'</p>'+btn("/projetos","Ver trabalhos")+'</div>'+media(s,"vx-home-image",'<span class="vx-giant">noBRon.</span><strong>DESIGN<br>MOTION<br>SISTEMAS</strong>')+'</section>';
 case "homeServices":return '<section class="vx-section vx-light"><div class="vx-wrap">'+title(s)+'<div class="vx-home-services">'+services.map((v,j)=>'<a href="'+v.path+'"><small>0'+(j+1)+'</small><b>'+v.name+'</b><p>'+v.description+'</p><span>↗</span></a>').join("")+'</div></div></section>';
 case "homeWork":return work("todos","vx-dark vx-work-home");
 case "solutionsHero":return '<section class="vx-sol-hero"><small>TRÊS FRENTES</small><h1>'+esc(s.title)+'</h1><p>'+esc(s.description)+'</p><div class="vx-vertical-labels"><span>01 / DESIGN</span><span>02 / MOTION</span><span>03 / SISTEMAS</span></div>'+media(s,"vx-sol-image","")+'</section>';
 case "serviceFeature":{
 const dest=services.find(v=>v.id===s.service)?.path||"/solucoes";
 return '<section class="vx-feature vx-feature-'+s.service+'"><div class="vx-wrap"><div class="vx-feature-copy"><small>0'+i+' / SERVIÇO</small><h2>'+esc(s.title)+'</h2><p>'+esc(s.description)+'</p>'+btn(dest,"Ver serviço")+'</div>'+media(s,"vx-feature-art",s.service==="sistemas"?'<span>GESTÃO<br>DE EVENTOS</span>':'<strong>'+esc(s.title)+'</strong>')+'</div></section>'}
 case "compactWork":return work("todos","vx-light");
 case "designHero":return '<section class="vx-design-hero"><div class="vx-copy"><small>DESIGN DIGITAL</small><h1>'+esc(s.title)+'</h1><p>'+esc(s.description)+'</p>'+btn("/contato?servico=design","Solicitar arte")+'</div><div class="vx-design-art">'+media(s,"vx-design-image",'<small>FORMATO DIGITAL</small><b>FLYER<br>EVENTO</b><span>STORY / FEED / PAINEL</span>')+'<div class="vx-flyer-back">LINE-UP<br>ARTES DIGITAIS</div></div></section>';
 case "designFormats":return '<section class="vx-section vx-dark vx-design-formats"><div class="vx-wrap">'+title(s)+'<div class="vx-formats">'+["Stories","Feed","Flyers","Line-ups","Cartazes","Banners","Outdoors","Ingressos"].map((x,j)=>'<div><small>'+String(j+1).padStart(2,"0")+'</small><b>'+x+'</b></div>').join("")+'</div></div></section>';
 case "designGallery":return work("design","vx-light vx-gallery-design");
 case "motionHero":return '<section class="vx-motion-hero"><div class="vx-wrap"><small>MOTION DESIGN / VÍDEO</small><h1>'+esc(s.title)+'</h1><p>'+esc(s.description)+'</p>'+btn("/contato?servico=motion","Solicitar vídeo")+'</div>'+media(s,"vx-motion-image",'<strong>▶</strong><span>VÍDEOS E ANIMAÇÕES</span>')+'</section>';
 case "motionFormats":return '<section class="vx-motion-formats"><div class="vx-wrap">'+title(s)+'<div><span>REELS</span><span>STORIES</span><span>TELÕES</span><span>PAINÉIS DE LED</span></div></div></section>';
 case "motionGallery":return work("motion","vx-dark vx-motion-gallery");
 case "systemsHero":return '<section class="vx-system-hero"><div class="vx-wrap"><div><small>DESENVOLVIMENTO DE SISTEMAS</small><h1>'+esc(s.title)+'</h1><p>'+esc(s.description)+'</p>'+btn("/contato?servico=sistemas","Solicitar sistema")+'</div>'+media(s,"vx-system-image",'<span>noBRon. / SISTEMAS</span><strong>GESTÃO</strong><div class="vx-ui-row"><b>Eventos</b><b>Portaria</b><b>Estoque</b></div>')+'</div></section>';
 case "systemsOperations":return '<section class="vx-system-ops"><div class="vx-wrap">'+title(s)+'<div class="vx-ops">'+["Portaria","Vendas","Cortesias","Estoque"].map((x,j)=>'<div><small>0'+(j+1)+'</small><strong>'+x+'</strong></div>').join("")+'</div></div></section>';
 case "systemsDigital":return '<section class="vx-system-digital"><div class="vx-wrap">'+title(s)+media(s,"vx-browser",'<span>WEBSITES</span><strong>SITES PARA EVENTOS<br>E ARTISTAS</strong>')+'</div></section>';
 case "systemsGallery":return work("sistemas","vx-light vx-systems-gallery");
 case "projectsHero":return '<section class="vx-projects-hero"><div class="vx-wrap"><small>PORTFÓLIO</small><h1>'+esc(s.title)+'</h1><p>'+esc(s.description)+'</p><span class="vx-proj-index">01 — 08</span></div>'+media(s,"vx-projects-cover","")+'</section>';
 case "allGallery":return '<section class="vx-section vx-light vx-all-gallery"><div class="vx-wrap">'+title(s)+'<div class="vx-filters">'+["todos","design","motion","sistemas"].map(x=>'<button data-filter="'+x+'" class="'+(S.filter===x?"active":"")+'">'+({"todos":"Todos","design":"Design","motion":"Motion","sistemas":"Sistemas"}[x])+'</button>').join("")+'</div><div id="vx-gallery">'+works(S.filter)+'</div></div></section>';
 case "aboutHero":return '<section class="vx-about-hero"><div class="vx-masthead">noBRon.</div><div class="vx-wrap"><div><small>SOBRE O ESTÚDIO</small><h1>'+esc(s.title)+'</h1><p>'+esc(s.description)+'</p></div>'+media(s,"vx-about-image",'<span>DESIGN.<br>MOTION.<br>SISTEMAS.</span>')+'</div></section>';
 case "aboutText":return '<section class="vx-about-text"><div class="vx-wrap">'+title(s)+'</div></section>';
 case "aboutAreas":return '<section class="vx-section vx-dark vx-about-areas"><div class="vx-wrap">'+title(s)+services.map(x=>'<a href="'+x.path+'"><b>'+x.name+'</b><span>'+x.description+'</span><i>↗</i></a>').join("")+'</div></section>';
 case "contactHero":return '<section class="vx-contact-hero"><div class="vx-wrap"><small>CONTATO</small><h1>'+esc(s.title)+'</h1><p>'+esc(s.description)+'</p></div>'+media(s,"vx-contact-image","")+'</section>';
 case "contactForm":return '<section class="vx-contact-form"><div class="vx-wrap"><div>'+title(s)+'</div><form id="vx-form"><label>Nome *<input name="nome" required></label><label>E-mail ou WhatsApp *<input name="contato" required></label><label>Serviço *<select name="servico" required><option value="">Selecione</option><option value="design">Design Digital</option><option value="motion">Motion Design</option><option value="sistemas">Sistemas</option></select></label><label>Contratação<select><option>Serviço avulso</option><option>Plano personalizado</option></select></label><label>Data do evento<input type="date"></label><label>Descrição *<textarea required rows="5"></textarea></label><button type="submit">Enviar solicitação ↗</button><p id="vx-form-status" aria-live="polite"></p></form></div></section>';
 case "contactLinks":return '<section class="vx-section vx-light"><div class="vx-wrap">'+title(s)+'</div></section>';
 case "contactBand":return '<section class="vx-cta">'+media(s,"vx-cta-image","")+'<div class="vx-wrap"><small>NO BRON / CONTATO</small><h2>'+esc(s.title)+'</h2><p>'+esc(s.description)+'</p>'+btn(pkey()==="about"?"/projetos":"/contato",pkey()==="about"?"Ver projetos":"Solicitar orçamento")+'</div></section>';
 default:return "";
 }
}
function render(){
 const v=current(),route=v.route;
 document.title=v.label+" | noBRon.";
 document.body.dataset.theme=localStorage.getItem("nobron-theme")||"dark";
 document.getElementById("app").innerHTML='<header class="vx-header"><a class="vx-logo" href="/">noBRon.</a><nav>'+nav.map(([n,u])=>'<a href="'+u+'" '+(u===route?'aria-current="page"':'')+'>'+n+'</a>').join("")+'</nav><button class="vx-theme" title="Alternar tema">◐</button></header><main id="main">'+v.sections.filter(s=>s.visible!==false).map((s,i)=>pageBody(s,i)+'<div class="vx-divider vx-d-'+(s.device?.desktop?.divider||"curve")+' vx-m-'+(s.device?.mobile?.divider||"curve")+'" aria-hidden="true"></div>').join("")+'</main><footer class="vx-footer"><a class="vx-logo" href="/">noBRon.</a><span>Design · Motion · Sistemas</span></footer><nav class="vx-bottom">'+nav.map(([n,u,ico])=>'<a href="'+u+'" '+(u===route?'aria-current="page"':'')+'><span>'+ico+'</span><small>'+n+'</small></a>').join("")+'</nav><div id="vx-overlay" hidden></div>';
 const theme=document.querySelector(".vx-theme");
 if(theme)theme.onclick=()=>{const v=document.body.dataset.theme==="light"?"dark":"light";document.body.dataset.theme=v;localStorage.setItem("nobron-theme",v)};
  document.querySelectorAll(".vx-photo").forEach(el=>{el.onclick=()=>{document.querySelectorAll(".vx-photo.active").forEach(x=>{if(x!==el)x.classList.remove("active")});el.classList.toggle("active")};el.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();el.click()}}});
 document.querySelectorAll("[data-filter]").forEach(b=>b.onclick=()=>{S.filter=b.dataset.filter;document.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("active",x===b));document.getElementById("vx-gallery").innerHTML=works(S.filter);bindProjects()});
 activateCarousels();
 const f=document.getElementById("vx-form");if(f){const pre=new URLSearchParams(location.search).get("servico");if(["design","motion","sistemas"].includes(pre))f.elements.servico.value=pre;f.onsubmit=e=>{e.preventDefault();document.getElementById("vx-form-status").textContent="Formulário em preparação. O envio será habilitado após a configuração do atendimento."}};
 bindProjects();
}
let carouselTimer=null;
function activateCarousels(){
 if(carouselTimer){clearInterval(carouselTimer);carouselTimer=null}
 if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 const tracks=[...document.querySelectorAll(".vx-gallery-design .vx-project-grid,.vx-motion-gallery .vx-project-grid,.vx-systems-gallery .vx-project-grid")];
 if(!tracks.length)return;
 for(const track of tracks){
   track._moveDir=1;
   track._pauseUntil=0;
   track.addEventListener("pointerdown",()=>track._pauseUntil=Date.now()+6500,{passive:true});
   track.addEventListener("pointerenter",()=>track._pauseUntil=Infinity);
   track.addEventListener("pointerleave",()=>track._pauseUntil=Date.now()+2000);
   track.addEventListener("focusin",()=>track._pauseUntil=Infinity);
   track.addEventListener("focusout",()=>track._pauseUntil=Date.now()+2000);
 }
 carouselTimer=setInterval(()=>{
   for(const t of tracks){
     if(!t.isConnected||t.scrollWidth<=t.clientWidth+10||Date.now()<t._pauseUntil)continue;
     const rect=t.getBoundingClientRect();
     if(rect.bottom<0||rect.top>innerHeight)continue;
     const max=t.scrollWidth-t.clientWidth;
     if(t.scrollLeft>=max-2)t._moveDir=-1;
     if(t.scrollLeft<=2)t._moveDir=1;
     t.scrollLeft+=t._moveDir*.8;
   }
 },45)
}
function bindProjects(){document.querySelectorAll("[data-project]").forEach(btn=>btn.onclick=()=>openProject(btn.dataset.project))}
function openProject(id){
 const p=S.projects.find(x=>x.id===id);if(!p)return;
 const files=[...(p.media||[])].map(x=>url(x)).filter(Boolean);
 if(!files.length){const c=url(p.cover?.mobile)||url(p.cover?.desktop)||url(p.cover);if(c)files.push(c)}
 if(!files.length)return;
 const overlay=document.getElementById("vx-overlay");let at=0;overlay.hidden=false;document.body.style.overflow="hidden";
 function close(){overlay.hidden=true;overlay.innerHTML="";document.body.style.overflow=""}
 function paint(){let u=files[at];overlay.innerHTML='<div class="vx-viewer" role="dialog" aria-modal="true"><button id="vx-close" aria-label="Fechar">×</button>'+( /\.(mp4|webm)(\?|$)/i.test(u)?'<video controls playsinline src="'+esc(u)+'"></video>':'<img src="'+esc(u)+'" alt="'+esc(p.title)+'">')+'<div class="vx-viewer-bottom"><b>'+esc(p.title)+'</b><span>'+esc(p.category)+' · '+(at+1)+'/'+files.length+'</span><button id="vx-prev">←</button><button id="vx-next">→</button></div></div>';document.getElementById("vx-close").onclick=close;document.getElementById("vx-prev").onclick=()=>{at=(at+files.length-1)%files.length;paint()};document.getElementById("vx-next").onclick=()=>{at=(at+1)%files.length;paint()}}
 paint();overlay.onclick=e=>{if(e.target===overlay)close()}
}
async function load(){
 try{
 const q=new URLSearchParams({select:"kind,key,payload",limit:"300"});
 const resp=await fetch(baseUrl+"/rest/v1/cms_published?"+q,{headers:{apikey:publishable},cache:"no-store"});
 if(resp.ok){
  const records=await resp.json();
  for(const row of records){
   if(row.kind==="page"&&pages[row.key]&&Array.isArray(row.payload?.sections))S.page[row.key]=row.payload;
   if(row.kind==="project"&&row.payload?.title)S.projects.push({...row.payload,id:row.key});
  }
 }
 }catch(e){console.warn("Conteúdo CMS indisponível",e)}
 render()
}
document.addEventListener("click",e=>{const a=e.target.closest("a[href]");if(!a||e.metaKey||e.ctrlKey||e.altKey||e.shiftKey||e.button!==0)return;const u=new URL(a.href,location.href);if(u.origin!==location.origin||!R[u.pathname])return;e.preventDefault();history.pushState(null,"",u.pathname+u.search+u.hash);S.filter="todos";render();window.scrollTo(0,0)});
window.addEventListener("popstate",()=>{S.filter="todos";render();window.scrollTo(0,0)});
render();load();
})();