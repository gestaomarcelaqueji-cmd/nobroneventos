(()=>{
"use strict";
const {pages,baseUrl,publishable}=window.NOBRON_SCHEMA;
const keys=["home","solutions","design","motion","sistemas","contact"];
const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
const esc=v=>String(v??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
const clone=o=>JSON.parse(JSON.stringify(o));
const st={session:null,view:"pages",key:"home",doc:null,dirty:false,device:"mobile",assets:[],drafts:new Map(),published:new Map(),thumbs:new Map(),busy:false,picker:null,selected:[],query:"",type:"all",activeSection:null};
const auth=()=>({apikey:publishable,Authorization:"Bearer "+st.session.access_token});
const rest=(path,opts={})=>fetch(baseUrl+"/rest/v1/"+path,{...opts,cache:"no-store",headers:{...auth(),...(opts.headers||{})}});
async function fail(r){const data=await r.json().catch(()=>({}));throw Error(data.message||data.error||"Erro "+r.status)}
function toast(message,bad=false){const t=$("#mm-toast");if(!t)return;t.textContent=message;t.classList.toggle("bad",bad);clearTimeout(toast.timer);toast.timer=setTimeout(()=>{t.textContent=""},5200)}
function setBusy(v){st.busy=v;$$("[data-busy]").forEach(b=>b.disabled=v)}
const sectionLabel=s=>s.id==="hero"?"Abertura":s.type==="gallery"?"Galeria / Carrossel":s.type==="feature"?s.title:s.type==="cta"?"Chamada final":s.type==="contact"?"Canais de contato":s.title;
const isMedia=s=>["hero","feature","cta"].includes(s.type);
const isGallery=s=>s.type==="gallery";
const typeOf=a=>a?.type||(/video\//.test(a?.mime||"")?"video":"image");
async function urlFor(asset){
 if(!asset)return null;
 if(asset.src&&asset.bucket==="nobron-public")return asset.src;
 const path=asset.path;if(!path)return asset.src||null;
 if(st.thumbs.has(path))return st.thumbs.get(path);
 const bucket=asset.bucket||"nobron-drafts";
 const url=baseUrl+"/storage/v1/object/"+(bucket==="nobron-public"?"public":"authenticated")+"/"+bucket+"/"+path.split("/").map(encodeURIComponent).join("/");
 if(bucket==="nobron-public")return url;
 const r=await fetch(url,{headers:auth(),cache:"no-store"});
 if(!r.ok)throw Error("Mídia não disponível");
 const object=URL.createObjectURL(await r.blob());st.thumbs.set(path,object);return object;
}
function preview(m,cl="mm-preview"){
 return '<div class="'+cl+'" data-media-path="'+esc(m?.path||"")+'">'+(m?"Carregando imagem...":"Nenhuma mídia selecionada")+'</div>';
}
function hydrate(root=document){
 $$("[data-media-path]",root).forEach(el=>{
  const path=el.dataset.mediaPath;if(!path)return;
  const asset=st.assets.find(x=>x.path===path)||findMediaInPage(path);
  if(!asset)return;
  urlFor(asset).then(u=>{
   if(!el.isConnected||!u)return;
   el.innerHTML=typeOf(asset)==="video"?'<video src="'+esc(u)+'" playsinline muted preload="metadata"></video><span class="mm-video-mark">▶</span>':'<img src="'+esc(u)+'" alt="'+esc(asset.name||"Mídia")+'">';
  }).catch(()=>{if(el.isConnected)el.textContent="Prévia indisponível"});
 })
}
function findMediaInPage(path){
 for(const s of st.doc?.sections||[]){
  for(const dev of ["mobile","desktop"]){
   if(s.media?.[dev]?.path===path)return s.media[dev];
   const found=s.gallery?.[dev]?.find(x=>x.path===path);
   if(found)return found;
  }
 }return null;
}
async function load(){
 const q=[
 "cms_media?select=id,name,mime,bytes,bucket,path,created_at&order=created_at.desc&limit=800",
 "cms_drafts?select=kind,key,payload,updated_at&kind=eq.page&limit=30",
 "cms_published?select=kind,key,payload&kind=eq.page&limit=30"
 ];
 const r=await Promise.all(q.map(x=>rest(x)));for(const item of r)if(!item.ok)await fail(item);
 const [media,draft,published]=await Promise.all(r.map(x=>x.json()));
 st.assets=media;st.drafts=new Map(draft.map(x=>[x.key,x.payload]));st.published=new Map(published.map(x=>[x.key,x.payload]));
}
function documentFor(key){const record=st.drafts.get(key)||st.published.get(key);const defaults=clone(pages[key].sections);
 if(!record?.sections)return {sections:defaults};
 // Keep known sections, preserving existing media assignments if present.
 const current=record.sections;
 const result=defaults.map(s=>{
  const old=current.find(x=>x.id===s.id);if(!old)return s;
  return {...s,...old,type:s.type,service:s.service,items:s.items,media:{...s.media,...old.media},gallery:{...s.gallery,...old.gallery}};
 });
 return {sections:result};
}
function root(){
 document.body.classList.add("mm-open");
 $("#inside").innerHTML='<div class="mm-app"><header class="mm-head"><strong>noBRon.</strong><span>ADMIN / MÍDIAS</span><button id="mm-logout">Sair</button></header><main id="mm-main"></main><div id="mm-layer"></div><div id="mm-toast" role="status" aria-live="polite"></div></div>';
 $("#mm-logout").onclick=()=>{if(st.dirty&&!confirm("Há alterações sem salvar. Sair mesmo assim?"))return;window.nobronAdminLogout?.()};
 window.onbeforeunload=e=>{if(st.dirty){e.preventDefault();e.returnValue=""}};
}
function intro(title,subtitle,back=false){
 return '<div class="mm-intro">'+(back?'<button id="mm-back" aria-label="Voltar">‹</button>':"")+'<div><small>'+esc(subtitle)+'</small><h1>'+esc(title)+'</h1></div></div>'
}
function pagesView(){
 $("#mm-main").innerHTML=intro("Escolha a página","1. SELECIONE ONDE APARECEM AS MÍDIAS")+'<p class="mm-lead">Escolha a página, coloque suas imagens e vídeos e publique. Os arquivos enviados já estão na biblioteca.</p><div class="mm-pages">'+keys.map(k=>'<button class="mm-page" data-page="'+k+'"><span class="mm-num">'+String(keys.indexOf(k)+1).padStart(2,"0")+'</span><span><b>'+esc(pages[k].label)+'</b><small>'+pages[k].sections.length+' posições de conteúdo</small></span><span class="mm-right">↗</span></button>').join("")+'</div><div class="mm-library-link"><b>'+st.assets.length+' arquivos na sua biblioteca</b><button id="mm-library">Ver imagens e vídeos ↗</button></div>';
 $$("[data-page]").forEach(b=>b.onclick=()=>openPage(b.dataset.page));
 $("#mm-library").onclick=()=>{st.view="library";render()};
}
function openPage(k){
 st.key=k;st.doc=documentFor(k);st.view="page";st.dirty=false;st.device="mobile";render();
}
function rowActions(s){
 const a=s.media?.[st.device]||null;
 const other=s.media?.[st.device==="mobile"?"desktop":"mobile"]||null;
 return '<div class="mm-target"><div class="mm-target-title"><span>Imagem ou vídeo · <b>'+st.device.toUpperCase()+'</b></span><small>'+(a?esc(a.name||"Selecionada"):"Não selecionada")+'</small></div>'+preview(a)+(a?"":other?'<p class="mm-fallback-note">Sem arquivo nesta versão. O site usará a mídia do outro dispositivo enquanto você não escolher uma.</p>':"")+'<div class="mm-target-actions"><button data-pick="'+esc(s.id)+'" class="mm-pick-btn">'+(a?"Trocar mídia":"Escolher da biblioteca")+'</button>'+(a?'<button class="mm-link" data-clear="'+esc(s.id)+'">Remover</button>':"")+'</div></div>';
}
function galleryRow(s){
 const arr=s.gallery?.[st.device]||[];
 const alternate=s.gallery?.[st.device==="mobile"?"desktop":"mobile"]||[];
 return '<div class="mm-target"><div class="mm-target-title"><span>Carrossel · <b>'+st.device.toUpperCase()+'</b></span><small>'+arr.length+' arquivos</small></div>'+(arr.length?'<div class="mm-picked-media">'+arr.map((m,i)=>'<div class="mm-picked-item">'+preview(m,"mm-small-preview")+'<span>'+esc(m.name||"Mídia")+'</span><div><button data-move="'+esc(s.id)+':'+i+':-1" title="Mover para trás">←</button><button data-move="'+esc(s.id)+':'+i+':1" title="Mover para frente">→</button><button data-remove="'+esc(s.id)+':'+i+'" title="Remover">×</button></div></div>').join("")+'</div>':'<div class="mm-gallery-empty">Nenhuma mídia selecionada.'+(alternate.length?' O site mostrará as mídias do outro dispositivo como reserva.':'')+'</div>')+'<button class="mm-pick-btn" data-pick="'+esc(s.id)+'">Escolher imagens e vídeos <span>＋</span></button></div>';
}
function pageView(){
 const p=pages[st.key];
 $("#mm-main").innerHTML=intro(p.label,"2. ESCOLHA AS MÍDIAS DA PÁGINA",true)+'<div class="mm-page-controls"><div class="mm-device"><button data-device="mobile" '+(st.device==="mobile"?'aria-pressed="true"':"")+'>▯ Mobile</button><button data-device="desktop" '+(st.device==="desktop"?'aria-pressed="true"':"")+'>▭ Desktop</button></div><a href="'+p.route+'" target="_blank" rel="noopener">Ver página ↗</a></div><p class="mm-lead">Toque em <b>Escolher da biblioteca</b> para usar uma imagem que você já enviou. Mobile e Desktop são configurados separadamente.</p><div class="mm-sections">'+st.doc.sections.map((s,i)=>'<article class="mm-section"><div class="mm-section-head"><span>'+String(i+1).padStart(2,"0")+'</span><div><h2>'+esc(sectionLabel(s))+'</h2><small>'+esc(s.title)+'</small></div><button class="mm-text-toggle" data-text="'+esc(s.id)+'">Editar texto</button></div>'+(isMedia(s)?rowActions(s):isGallery(s)?galleryRow(s):'<p class="mm-info">'+(s.type==="services"?"Os três serviços aparecem automaticamente aqui.":s.type==="formats"?"A lista de materiais aparece automaticamente aqui.":"Configure os canais de atendimento abaixo.")+'</p>')+'<div class="mm-text-editor" id="mm-text-'+esc(s.id)+'" hidden><label>Título<input data-title="'+esc(s.id)+'" value="'+esc(s.title)+'"></label><label>Descrição<textarea rows="3" data-description="'+esc(s.id)+'">'+esc(s.description||"")+'</textarea></label>'+(s.type==="contact"?'<label>E-mail<input data-contact="email" value="'+esc(s.email||"")+'" placeholder="contato@seusite.com"></label><label>WhatsApp com DDD<input data-contact="whatsapp" value="'+esc(s.whatsapp||"")+'" placeholder="5542999999999"></label><label>Instagram<input data-contact="instagram" value="'+esc(s.instagram||"")+'" placeholder="perfil"></label>':"")+'</div></article>').join("")+'</div><div class="mm-actions"><span id="mm-status">'+(st.dirty?"Alterações não salvas":"Pronto para editar")+'</span><button id="mm-save" data-busy>Salvar rascunho</button><button id="mm-publish" class="mm-primary" data-busy>Publicar página ↗</button></div>';
 $("#mm-back").onclick=goBack;
 $$("[data-device]").forEach(b=>b.onclick=()=>{st.device=b.dataset.device;render()});
 $$("[data-pick]").forEach(b=>b.onclick=()=>openPicker(b.dataset.pick));
 $$("[data-clear]").forEach(b=>b.onclick=()=>{const s=sec(b.dataset.clear);s.media[st.device]=null;mark();render()});
 $$("[data-remove]").forEach(b=>b.onclick=()=>{const [id,index]=b.dataset.remove.split(":");sec(id).gallery[st.device].splice(Number(index),1);mark();render()});
 $$("[data-move]").forEach(b=>b.onclick=()=>{const [id,i,d]=b.dataset.move.split(":"),arr=sec(id).gallery[st.device];const at=Number(i),to=at+Number(d);if(to<0||to>=arr.length)return;const [item]=arr.splice(at,1);arr.splice(to,0,item);mark();render()});
 $$("[data-text]").forEach(b=>b.onclick=()=>{
  const el=$("#mm-text-"+CSS.escape(b.dataset.text));if(!el)return;
  el.hidden=!el.hidden;b.textContent=el.hidden?"Editar texto":"Fechar";
 });
 $$("[data-title]").forEach(input=>input.oninput=e=>{sec(e.target.dataset.title).title=e.target.value;mark()});
 $$("[data-description]").forEach(input=>input.oninput=e=>{sec(e.target.dataset.description).description=e.target.value;mark()});
 $$("[data-contact]").forEach(input=>input.oninput=e=>{const s=sec("atendimento");s[e.target.dataset.contact]=e.target.value;mark()});
 $("#mm-save").onclick=()=>saveDoc();
 $("#mm-publish").onclick=()=>publish();
 hydrate($("#mm-main"));
}
function sec(id){return st.doc.sections.find(s=>s.id===id)}
function mark(){st.dirty=true;const a=$("#mm-status");if(a)a.textContent="Alterações não salvas"}
function goBack(){if(st.dirty&&!confirm("Sair sem salvar as alterações?"))return;st.dirty=false;st.doc=null;st.view="pages";render()}
function openPicker(sectionId){
 const s=sec(sectionId);st.picker={sectionId,multiple:isGallery(s),device:st.device};
 st.selected=st.picker.multiple?[...(s.gallery?.[st.device]||[])].map(x=>x.path):[];
 st.query="";st.type="all";renderPicker();
}
function assetFromRow(row){return {bucket:row.bucket,path:row.path,name:row.name,type:typeOf(row)}}
function renderPicker(){
 const host=$("#mm-layer"),multi=st.picker.multiple;
 host.innerHTML='<div class="mm-picker"><header><button id="mm-picker-close" aria-label="Voltar">‹</button><div><small>'+esc(pages[st.key].label)+' / '+st.picker.device.toUpperCase()+'</small><h2>'+(multi?"Escolha as mídias":"Escolha uma mídia")+'</h2></div></header><div class="mm-picker-search"><input id="mm-search" placeholder="Buscar imagens e vídeos" value="'+esc(st.query)+'"><select id="mm-filter"><option value="all">Todos</option><option value="image">Imagens</option><option value="video">Vídeos</option></select></div><div id="mm-assets" class="mm-assets"></div><div class="mm-picker-footer"><label class="mm-upload">＋ Enviar mais<input id="mm-upload" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm"></label><button class="mm-primary" id="mm-use" '+(multi?"":"hidden")+'>Usar selecionadas ('+st.selected.length+')</button></div></div>';
 $("#mm-picker-close").onclick=()=>{$("#mm-layer").innerHTML="";st.picker=null};
 $("#mm-search").oninput=e=>{st.query=e.target.value;renderAssetList()};
 $("#mm-filter").value=st.type;$("#mm-filter").onchange=e=>{st.type=e.target.value;renderAssetList()};
 $("#mm-use").onclick=applySelection;
 $("#mm-upload").onchange=async e=>{await uploadFiles([...e.target.files]);renderAssetList()};
 renderAssetList();
}
function filtered(){
 return st.assets.filter(a=>(st.type==="all"||a.mime?.startsWith(st.type))&&a.name.toLowerCase().includes(st.query.toLowerCase()));
}
function renderAssetList(){
 const items=filtered(),root=$("#mm-assets");
 root.innerHTML=items.length?items.map(a=>'<button data-asset="'+esc(a.id)+'" class="mm-asset '+(st.selected.includes(a.path)?"selected":"")+'">'+preview(a,"mm-asset-preview")+'<span>'+esc(a.name)+'</span>'+(st.picker.multiple?'<b class="mm-select-check">'+(st.selected.includes(a.path)?"✓":"＋")+'</b>':"")+'</button>').join(""):'<p class="mm-none">Nenhum arquivo encontrado.</p>';
 $$("[data-asset]",root).forEach(b=>b.onclick=()=>{
  const a=st.assets.find(x=>x.id===b.dataset.asset);if(!a)return;
  if(!st.picker.multiple){const s=sec(st.picker.sectionId);s.media[st.picker.device]=assetFromRow(a);mark();$("#mm-layer").innerHTML="";st.picker=null;render();return}
  if(st.selected.includes(a.path))st.selected=st.selected.filter(x=>x!==a.path);else st.selected.push(a.path);
  b.classList.toggle("selected",st.selected.includes(a.path));$(".mm-select-check",b).textContent=st.selected.includes(a.path)?"✓":"＋";
  $("#mm-use").textContent="Usar selecionadas ("+st.selected.length+")";
 });
 hydrate(root);
}
function applySelection(){
 const s=sec(st.picker.sectionId);
 const selected=st.selected.map(p=>st.assets.find(x=>x.path===p)).filter(Boolean);
 s.gallery??={desktop:[],mobile:[]};s.gallery[st.picker.device]=selected.map(assetFromRow);
 mark();$("#mm-layer").innerHTML="";st.picker=null;render();
}
async function uploadFiles(files){
 const allowed=new Set(["image/jpeg","image/png","image/webp","image/avif","image/gif","video/mp4","video/webm"]);
 for(const file of files){
  if(!allowed.has(file.type)||file.size>100*1024*1024){toast("Formato ou tamanho não aceito: "+file.name,true);continue}
  try{
   const ext=file.name.split(".").pop().toLowerCase();const path="uploads/"+crypto.randomUUID()+"."+ext;
   const r=await fetch(baseUrl+"/storage/v1/object/nobron-drafts/"+path,{method:"POST",headers:{...auth(),"Content-Type":file.type},body:file});
   if(!r.ok)await fail(r);
   const record={name:file.name,mime:file.type,bytes:file.size,bucket:"nobron-drafts",path};
   const saved=await rest("cms_media?select=id,name,mime,bytes,bucket,path,created_at",{method:"POST",headers:{"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify(record)});
   if(!saved.ok)await fail(saved);
   const row=(await saved.json())[0];st.assets.unshift(row);st.thumbs.set(path,URL.createObjectURL(file));
   if(st.picker?.multiple)st.selected.push(path);
   toast(file.name+" enviado.");
  }catch(e){toast("Não foi possível enviar "+file.name+": "+e.message,true)}
 }
}
function libraryView(){
 $("#mm-main").innerHTML=intro("Suas mídias","BIBLIOTECA",true)+'<p class="mm-lead">Esses arquivos ficam guardados aqui. Para aparecerem no site, escolha uma página e atribua-os à abertura ou à galeria.</p><div class="mm-library-head"><b>'+st.assets.length+' arquivos</b><label class="mm-upload">＋ Enviar arquivo<input id="mm-upload-library" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm"></label></div><div class="mm-assets mm-library-assets">'+st.assets.map(a=>'<div class="mm-asset mm-static">'+preview(a,"mm-asset-preview")+'<span>'+esc(a.name)+'</span></div>').join("")+'</div>';
 $("#mm-back").onclick=()=>{st.view="pages";render()};
 $("#mm-upload-library").onchange=async e=>{await uploadFiles([...e.target.files]);render()};
 hydrate($("#mm-main"));
}
async function saveDoc(){
 if(st.busy)return false;
 setBusy(true);
 try{
  const user=await fetch(baseUrl+"/auth/v1/user",{headers:auth()});if(!user.ok)await fail(user);
  const id=(await user.json()).id;
  const row={kind:"page",key:st.key,payload:st.doc,updated_by:id,updated_at:new Date().toISOString()};
  const r=await rest("cms_drafts?on_conflict=kind,key",{method:"POST",headers:{"Content-Type":"application/json",Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(row)});
  if(!r.ok)await fail(r);
  st.drafts.set(st.key,clone(st.doc));st.dirty=false;
  const status=$("#mm-status");if(status)status.textContent="Rascunho salvo";
  toast("Rascunho salvo com sucesso.");return true;
 }catch(e){toast("Não foi possível salvar: "+e.message,true);return false}
 finally{setBusy(false)}
}
function countDraftMedia(doc){
 const names=new Set();
 for(const section of doc?.sections||[]){
  for(const device of ["mobile","desktop"]){
   const assets=[section.media?.[device],...(section.gallery?.[device]||[])];
   for(const asset of assets)if(asset?.bucket==="nobron-drafts"&&asset.path)names.add(asset.path);
  }
 }
 return names.size;
}
async function publish(){
 if(st.busy)return;
 if(countDraftMedia(st.doc)>40)return toast("Esta página tem mais de 40 arquivos diferentes. Reduza as mídias antes de publicar.",true);
 if(!confirm("Publicar as mídias de "+pages[st.key].label+" no site?"))return;
 const saved=await saveDoc();if(!saved)return;
 setBusy(true);
 try{
  const r=await fetch(baseUrl+"/functions/v1/nobron-cms-publish",{method:"POST",headers:{...auth(),"Content-Type":"application/json"},body:JSON.stringify({kind:"page",key:st.key})});
  if(!r.ok)await fail(r);
  const data=await r.json().catch(()=>({}));
  toast("Página publicada! "+(data.mediaTransferred??0)+" mídia(s) processada(s).");
  // Do not overwrite the draft with public URLs; next edit still uses private originals.
 }catch(e){toast("Não foi possível publicar: "+e.message,true)}
 finally{setBusy(false)}
}
function render(){if(st.view==="page")pageView();else if(st.view==="library")libraryView();else pagesView();}
async function mount(session){
 if(!session?.access_token)return;
 st.session=session;root();
 $("#mm-main").innerHTML='<p class="mm-loading">Carregando imagens e páginas...</p>';
 try{await load();render()}catch(e){$("#mm-main").innerHTML='<div class="mm-error"><strong>Não foi possível abrir suas mídias.</strong><p>'+esc(e.message)+'</p><button id="mm-retry">Tentar novamente</button></div>';$("#mm-retry").onclick=()=>mount(session)}
}
function unmount(){for(const u of st.thumbs.values())if(u.startsWith("blob:"))URL.revokeObjectURL(u);st.thumbs.clear();document.body.classList.remove("mm-open");window.onbeforeunload=null}
window.nobronCms={mount,unmount};
})();