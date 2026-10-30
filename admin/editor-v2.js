(()=>{
"use strict";
const CFG=window.NOBRON_SCHEMA, {pages,baseUrl,publishable}=CFG;
const $=(q,root=document)=>root.querySelector(q),$$=(q,root=document)=>[...root.querySelectorAll(q)];
const html=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const copy=v=>JSON.parse(JSON.stringify(v));
const st={session:null,view:"pages",page:"home",doc:null,dirty:false,device:"mobile",section:null,selected:null,tab:"media",assetTarget:null,previousView:null,assets:[],drafts:new Map(),published:new Map(),projects:new Map(),versions:[],assetUrls:new Map(),pickerQuery:"",pickerType:"all",busy:false,previewReady:false,previewRevision:0,projectId:null,projectDoc:null,projectDirty:false,projectTab:"info",preUploadView:null};
const menus=[["pages","Páginas","▤"],["projects","Projetos","▦"],["media","Mídias","▧"],["more","Mais","⚙"]];
const route=k=>pages[k]?.route||"/";
const label=k=>pages[k]?.label||k;
const pref=()=>st.session?.access_token||"";
const request=(endpoint,method="GET",body=null)=>fetch(baseUrl+"/rest/v1/"+endpoint,{method,cache:"no-store",headers:{apikey:publishable,Authorization:"Bearer "+pref(),...(body?{"Content-Type":"application/json",Prefer:"resolution=merge-duplicates,return=representation"}:{})},...(body?{body:JSON.stringify(body)}:{})});
const showErr=async response=>{const body=await response.json().catch(()=>({}));throw Error(body?.message||body?.error||"Falha na operação ("+response.status+").")};
const sectionName=s=>s?.title||"Seção";
const MEDIA_TYPES=new Set(["homeHero","solutionsHero","designHero","motionHero","systemsHero","projectsHero","aboutHero","contactHero","serviceFeature","systemsDigital","contactBand"]);
const pageDoc=k=>copy(st.drafts.get("page:"+k)?.payload||st.published.get("page:"+k)?.payload||{sections:pages[k].sections});
const hasChanges=()=>st.dirty||st.projectDirty;
function toast(message,bad=false){const box=$("#v2-toast");if(!box)return;box.textContent=message;box.dataset.kind=bad?"bad":"good";clearTimeout(toast.timer);toast.timer=setTimeout(()=>{box.textContent=""},4700);}
function busy(flag){st.busy=flag;$$("[data-busy]").forEach(b=>b.disabled=flag);}
function apiSession(){return pref()?{apikey:publishable,Authorization:"Bearer "+pref()}:null;}
async function loadData(){
 const queries=[
 "cms_drafts?select=kind,key,payload,updated_at&limit=500",
 "cms_published?select=kind,key,payload,published_at&limit=500",
 "cms_media?select=id,name,mime,bytes,bucket,path,created_at&order=created_at.desc&limit=500",
 "cms_versions?select=id,kind,key,created_at&order=created_at.desc&limit=100"
 ];
 const rs=await Promise.all(queries.map(q=>request(q)));
 for(const r of rs)if(!r.ok)await showErr(r);
 const [draft,published,media,versions]=await Promise.all(rs.map(r=>r.json()));
 st.drafts=new Map(draft.map(row=>[row.kind+":"+row.key,row]));
 st.published=new Map(published.map(row=>[row.kind+":"+row.key,row]));
 st.assets=media;
 st.versions=versions;
 st.projects=new Map();
 for(const row of [...published,...draft])if(row.kind==="project")st.projects.set(row.key,copy(row.payload));
}
function root(){
 document.body.classList.add("cms-v2-open");
 $("#inside").innerHTML='<div class="v2-app"><header class="v2-top"><div class="v2-brand"><strong>noBRon.</strong><small>ADMIN</small></div><div class="v2-top-actions"><a href="/" target="_blank" rel="noopener">Ver site ↗</a><button id="v2-exit" aria-label="Sair do painel">Sair</button></div></header><main class="v2-stage" id="v2-stage"></main><nav id="v2-nav" class="v2-nav" aria-label="Navegação administrativa"></nav><div id="v2-layer"></div><div id="v2-toast" aria-live="polite" role="status"></div></div>';
 $("#v2-exit").onclick=()=>window.nobronAdminLogout?.();
 renderNav();
 window.onbeforeunload=ev=>{if(!hasChanges())return;ev.preventDefault();ev.returnValue="";};
}
function renderNav(){
 const nav=$("#v2-nav");if(!nav)return;
 const hide=["edit","pick","review","reorder","projectEdit","security"].includes(st.view);
 nav.hidden=hide;
 nav.innerHTML=menus.map(([key,text,ico])=>'<button data-nav="'+key+'" '+(st.view===key?'aria-current="page"':'')+'><span>'+ico+'</span><small>'+text+'</small></button>').join("");
 $$("[data-nav]",nav).forEach(b=>b.onclick=()=>navigate(b.dataset.nav));
}
function navigate(view){
 if(hasChanges()&&!confirm("Há alterações não salvas. Descartar e continuar?"))return;
 st.dirty=false;st.projectDirty=false;st.section=null;st.selected=null;
 st.view=view;st.page=st.page||"home";st.doc=null;render();
}
function topline(title,subtitle,back){return '<div class="v2-bar">'+(back?'<button class="v2-back" data-action="back" aria-label="Voltar">‹</button>':'')+'<div><div class="v2-overline">'+html(subtitle||"NO BRON / ADMIN")+'</div><h1>'+html(title)+'</h1></div><span class="v2-bar-end"></span></div>';}
function step(title,description){return '<div class="v2-section-title"><h2>'+html(title)+'</h2>'+(description?'<p>'+html(description)+'</p>':"")+'</div>';}
function thumb(k,doc){
 const s=doc?.sections?.[0]||pages[k].sections[0],asset=s?.media?.mobile||s?.media?.desktop;
 const u=asset?.src;
 return '<div class="v2-thumbnail"><div class="v2-thumbnail-head"><b>noBRon.</b><span>•••</span></div><div class="v2-thumbnail-title">'+html(s.title)+'</div>'+(u&&u.startsWith("https://")?'<img src="'+html(u)+'" loading="lazy" alt="">':'<div class="v2-thumbnail-art"><span>'+html(label(k))+'</span></div>')+'</div>';
}
function pagesView(){
 $("#v2-stage").innerHTML=topline("Páginas","GESTÃO DO SITE")+step("Escolha uma página","Toque para visualizar e editar diretamente.")+'<div class="v2-pages">'+Object.entries(pages).map(([k,v])=>{
 const d=pageDoc(k),saved=st.drafts.has("page:"+k),published=st.published.has("page:"+k);
 return '<button class="v2-page-card" data-page="'+k+'">'+thumb(k,d)+'<div class="v2-page-details"><b>'+html(v.label)+'</b><small>'+d.sections.length+' seções · '+(saved?"Rascunho":published?"Publicado":"Padrão")+'</small></div><span class="v2-arrow">↗</span></button>';
 }).join("")+'</div>';
 $$("[data-page]").forEach(b=>b.onclick=()=>openPage(b.dataset.page));
}
function openPage(k){
 st.view="page";st.page=k;st.doc=pageDoc(k);st.dirty=false;st.section=null;st.previewReady=false;render();
}
function frameMarkup(kind="page"){
 const d=st.device==="mobile";
 return '<div class="v2-canvas-shell '+(d?"is-mobile":"is-desktop")+'"><div class="v2-canvas"><iframe id="v2-live-frame" title="Prévia real da página '+html(label(st.page))+'" src="'+route(st.page)+'?cms_preview=1" loading="eager"></iframe></div></div>';
}
function deviceSwitch(){return '<div class="v2-device" role="group" aria-label="Versão do site"><button data-device="mobile" '+(st.device==="mobile"?'aria-pressed="true"':'')+'>▯ Mobile</button><button data-device="desktop" '+(st.device==="desktop"?'aria-pressed="true"':'')+'>▭ Desktop</button></div>';}
function pageView(){
 $("#v2-stage").innerHTML=topline(label(st.page),"EDITOR VISUAL · "+(st.dirty?"ALTERAÇÕES PENDENTES":"RASCUNHO"),true)+'<div class="v2-page-workspace"><div class="v2-preview-side"><div class="v2-preview-actions">'+deviceSwitch()+'<button class="v2-soft" id="v2-all-sections">☷ Seções</button></div><p class="v2-tip">Toque na seção que deseja alterar. Deslize para navegar pela página.</p>'+frameMarkup()+'</div><aside class="v2-desktop-actions"><h2>'+html(label(st.page))+'</h2><p>Prévia real da página, com ferramentas contextuais.</p><button id="v2-side-sections">Organizar seções</button><button id="v2-side-review">Revisar publicação</button></aside></div><div class="v2-page-bottom"><button id="v2-section-button">☷ Seções</button><button id="v2-save-draft" class="v2-primary" data-busy>Salvar rascunho</button><button id="v2-review" class="v2-review-action">Revisar ↗</button></div>';
 wireBack(()=>navigateFromPage());
 $("#v2-all-sections").onclick=$("#v2-section-button").onclick=$("#v2-side-sections").onclick=()=>{st.view="reorder";render()};
 $("#v2-save-draft").onclick=savePage;
 $("#v2-review").onclick=$("#v2-side-review").onclick=()=>{st.view="review";render()};
 wireDevices();
 initFrame();
}
function navigateFromPage(){
 if(st.dirty&&!confirm("Descartar alterações não salvas?"))return;
 st.dirty=false;st.doc=null;st.view="pages";render();
}
function wireDevices(){
 $$("[data-device]").forEach(b=>b.onclick=()=>{st.device=b.dataset.device;$$("[data-device]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));const shell=$(".v2-canvas-shell");if(shell){shell.classList.toggle("is-mobile",st.device==="mobile");shell.classList.toggle("is-desktop",st.device==="desktop");}resizePreview();if(st.view==="edit"){renderLayer()}});
}
function wireBack(fn){const b=$("[data-action=back]");if(b)b.onclick=fn;}
function resizePreview(){
 const frame=$("#v2-live-frame"),canvas=frame?.parentElement;
 if(!frame||!canvas)return;
 const width=canvas.clientWidth||360;
 if(st.device==="desktop"){
  const scale=Math.min(1,width/1280);
  frame.style.width="1280px";frame.style.height=Math.ceil((canvas.clientHeight||740)/scale)+"px";
  frame.style.transformOrigin="top left";frame.style.transform="scale("+scale+")";
 }else{
  frame.style.width="100%";frame.style.height="100%";frame.style.transform="none";
 }
}
window.addEventListener("resize",resizePreview);
function initFrame(){
 st.previewReady=false;
 const f=$("#v2-live-frame");if(!f)return;
 resizePreview();
 f.addEventListener("load",()=>{resizePreview();st.previewReady=true;sendDraft()});
}
function sendDraft(){
 const iframe=$("#v2-live-frame");if(!iframe?.contentWindow||!st.doc)return;
 const stamp=++st.previewRevision;
 const doc=copy(st.doc);
 if(st.view==="edit"&&st.section&&st.selected){
  const idx=doc.sections.findIndex(x=>x.id===st.selected);
  if(idx>=0)doc.sections[idx]=copy(st.section);
 }
 // Resolve authenticated media to temporary same-origin blob URLs for the preview.
 Promise.all((doc.sections||[]).flatMap(sec=>["desktop","mobile"].map(async device=>{
  const asset=sec.media?.[device];
  if(asset?.bucket==="nobron-drafts"&&asset.path){
   const uri=await assetURL(asset);
   if(uri)asset.src=uri;
  }
 }))).then(()=>{
  if(stamp!==st.previewRevision)return;
  iframe.contentWindow?.postMessage({source:"nobron-editor",kind:"draft",key:st.page,doc,selectedId:st.selected,selected:st.selected?1:0},location.origin);
 }).catch(()=>{});
}
async function assetURL(asset){
 if(!asset)return null;
 if(asset.src&&asset.bucket==="nobron-public")return asset.src;
 if(asset.path&&st.assetUrls.has(asset.path))return st.assetUrls.get(asset.path);
 if(!asset.path)return asset.src||null;
 const url=baseUrl+"/storage/v1/object/authenticated/nobron-drafts/"+asset.path.split("/").map(encodeURIComponent).join("/");
 const r=await fetch(url,{headers:apiSession()});
 if(!r.ok)return null;
 const blob=await r.blob(),value=URL.createObjectURL(blob);
 st.assetUrls.set(asset.path,value);
 return value;
}
window.addEventListener("message",evt=>{
 if(evt.origin!==location.origin||evt.data?.source!=="nobron-preview")return;
 const frame=$("#v2-live-frame");
 if(!frame||evt.source!==frame.contentWindow||evt.data.key!==st.page)return;
 if(evt.data.kind==="ready"){st.previewReady=true;sendDraft()}
 if(evt.data.kind==="select"&&st.view==="page"){editSection(evt.data.id)}
});
function editSection(id){
 const section=st.doc?.sections.find(s=>s.id===id);if(!section)return;
 st.section=copy(section);st.selected=id;st.tab=MEDIA_TYPES.has(section.type)?"media":"content";st.view="edit";renderNav();renderLayer();
}
function updatePreview(){if(st.view==="edit")sendDraft()}
function render(){
 renderNav();
 $("#v2-layer").innerHTML="";
 if(st.view==="pages")pagesView();
 else if(st.view==="page")pageView();
 else if(st.view==="edit"){if(!$("#v2-live-frame")){st.view="page";pageView();st.view="edit"}renderLayer();}
 else if(st.view==="reorder")reorderView();
 else if(st.view==="pick")pickerView();
 else if(st.view==="media")mediaView();
 else if(st.view==="projects")projectsView();
 else if(st.view==="projectEdit")projectEditView();
 else if(st.view==="review")reviewView();
 else if(st.view==="more")moreView();
 else if(st.view==="security")securityView();
 renderNav();
}
function renderLayer(){
 const wrap=$("#v2-layer");if(!wrap||!st.section)return;
 const sec=st.section;
 wrap.innerHTML='<div class="v2-sheet-backdrop"></div><div class="v2-sheet" role="dialog" aria-modal="true" aria-label="Editar seção"><header class="v2-sheet-header"><div><small>'+html(label(st.page))+' / SEÇÃO</small><h2>'+html(sec.title)+'</h2></div><button id="v2-edit-close" aria-label="Fechar">×</button></header><div class="v2-tabs" role="tablist"><button data-edit-tab="content">Conteúdo</button>'+(MEDIA_TYPES.has(sec.type)?'<button data-edit-tab="media">Mídia</button>':"")+'<button data-edit-tab="visual">Visual</button></div><div class="v2-sheet-body" id="v2-sheet-content"></div><div class="v2-sheet-footer"><button id="v2-edit-cancel">Cancelar</button><button id="v2-edit-apply" class="v2-primary">Aplicar alterações</button></div></div>';
 $$(".v2-sheet-backdrop,#v2-edit-close,#v2-edit-cancel").forEach(el=>el.onclick=cancelEdit);
 $("#v2-edit-apply").onclick=applySection;
 $$("[data-edit-tab]").forEach(b=>b.onclick=()=>{st.tab=b.dataset.editTab;renderEditContent()});
 renderEditContent();
}
function renderEditContent(){
 const root=$("#v2-sheet-content");if(!root)return;
 $$("[data-edit-tab]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.editTab===st.tab)));
 const s=st.section;
 if(st.tab==="content"){
 const canCta=["homeHero","serviceFeature","designHero","motionHero","systemsHero","contactBand"].includes(s.type);
 root.innerHTML='<label class="v2-field"><span>Título</span><input id="v2-title" maxlength="150" value="'+html(s.title)+'"></label><label class="v2-field"><span>Descrição</span><textarea id="v2-description" rows="4" maxlength="1200">'+html(s.description||"")+'</textarea></label>'+(canCta?'<div class="v2-divider-line"></div><h3 class="v2-small-heading">Botão da seção</h3><label class="v2-field"><span>Texto do botão</span><input id="v2-cta-label" maxlength="80" value="'+html(s.cta?.label||"")+'" placeholder="Usar texto padrão"></label><label class="v2-field"><span>Destino (URL)</span><input id="v2-cta-href" maxlength="400" value="'+html(s.cta?.href||"")+'" placeholder="/contato"></label><label class="v2-checkbox"><input id="v2-cta-visible" type="checkbox" '+(s.cta?.visible===false?"":"checked")+'> Mostrar botão</label>':"")+(!MEDIA_TYPES.has(s.type)&&/Gallery|Work|allGallery/.test(s.type)?'<p class="v2-tip">Esta galeria utiliza os trabalhos cadastrados em <b>Projetos</b>. As capas e mídias são editadas naquela área.</p>':"")+'<div class="v2-divider-line"></div><label class="v2-checkbox"><input id="v2-visible" type="checkbox" '+(s.visible===false?"":"checked")+'> Mostrar esta seção no site</label>';
 $("#v2-title").oninput=e=>{st.section.title=e.target.value;sendDraft()};
 $("#v2-description").oninput=e=>{st.section.description=e.target.value;sendDraft()};
 $("#v2-visible").onchange=e=>{st.section.visible=e.target.checked;sendDraft()};
 if(canCta){
  ["label","href"].forEach(key=>$("#v2-cta-"+key).oninput=e=>{
   st.section.cta??={};
   st.section.cta[key]=e.target.value;
   sendDraft();
  });
  $("#v2-cta-visible").onchange=e=>{st.section.cta??={};st.section.cta.visible=e.target.checked;sendDraft()};
 }

 }
 if(st.tab==="media"){
 const a=s.media?.[st.device],assetName=a?.name||"Nenhuma mídia cadastrada";
 root.innerHTML=deviceSwitch()+'<div class="v2-media-slot"><div class="v2-media-slot-visual" id="v2-slot-preview"><span>▧</span></div><strong>'+html(assetName)+'</strong><p>Arquivo independente para '+(st.device==="mobile"?"celular":"computador")+'.</p><button id="v2-choose-media" class="v2-primary">Escolher mídia</button>'+(a?'<button id="v2-clear-media" class="v2-text-btn">Remover desta posição</button>':"")+'</div>';
 wireDevices();
 $("#v2-choose-media").onclick=()=>openPicker("section");
 if($("#v2-clear-media"))$("#v2-clear-media").onclick=()=>{st.section.media??={desktop:null,mobile:null};st.section.media[st.device]=null;renderEditContent();updatePreview()};
 if(a){assetURL(a).then(url=>{if(url&&$("#v2-slot-preview"))$("#v2-slot-preview").innerHTML=a.type==="video"?'<video controls playsinline src="'+html(url)+'"></video>':'<img src="'+html(url)+'" alt="Prévia da mídia">'});}
 }
 if(st.tab==="visual"){
 const v=s.device?.[st.device]||{};
 root.innerHTML=deviceSwitch()+'<div class="v2-controls"><label class="v2-field"><span>Posição da imagem <b id="v2-position-label">'+Number(v.position??50)+'%</b></span><input type="range" id="v2-position" min="0" max="100" value="'+Number(v.position??50)+'"></label><label class="v2-field"><span>Zoom <b id="v2-zoom-label">'+Number(v.zoom??100)+'%</b></span><input type="range" id="v2-zoom" min="100" max="180" value="'+Number(v.zoom??100)+'"></label><label class="v2-field"><span>Section Divider</span><select id="v2-divider">'+[["curve","Curva"],["diagonal","Diagonal"],["fold","Camadas"],["notch","Recorte"]].map(([x,y])=>'<option value="'+x+'" '+(v.divider===x?"selected":"")+'>'+y+'</option>').join("")+'</select></label></div>';
 wireDevices();
 ["position","zoom","divider"].forEach(key=>$("#v2-"+key).oninput=e=>{
 st.section.device??={desktop:{},mobile:{}};st.section.device[st.device]??={};
 st.section.device[st.device][key]=key==="divider"?e.target.value:Number(e.target.value);
 const lbl=$("#v2-"+key+"-label");if(lbl)lbl.textContent=e.target.value+"%";
 sendDraft();
 });
 }
}
function applySection(){
 const index=st.doc?.sections.findIndex(s=>s.id===st.selected);
 if(index<0)return;
 st.doc.sections[index]=copy(st.section);st.dirty=true;
 st.section=null;st.selected=null;st.view="page";$("#v2-layer").innerHTML="";renderNav();sendDraft();
 toast("Seção atualizada. Salve o rascunho para guardar.");
}
function cancelEdit(){st.section=null;st.selected=null;st.view="page";$("#v2-layer").innerHTML="";renderNav();sendDraft();}
function reorderView(){
 $("#v2-stage").innerHTML=topline("Seções",label(st.page)+" / ORGANIZAÇÃO",true)+'<p class="v2-tip">Altere a ordem, visibilidade ou escolha uma seção para editar.</p><div class="v2-stack">'+st.doc.sections.map((s,i)=>'<div class="v2-stack-item"><div class="v2-stack-num">'+String(i+1).padStart(2,"0")+'</div><button class="v2-stack-name" data-open-section="'+html(s.id)+'"><b>'+html(s.title)+'</b><small>'+html(s.type)+(s.visible===false?" · Oculta":"")+'</small></button><div class="v2-stack-moves"><button data-move="'+i+':-1" aria-label="Subir">↑</button><button data-move="'+i+':1" aria-label="Descer">↓</button></div><button data-toggle="'+html(s.id)+'" class="v2-visibility" aria-label="Mostrar ou ocultar">'+(s.visible===false?"◌":"◉")+'</button></div>').join("")+'</div><div class="v2-fixed-actions"><button id="v2-reorder-back">Voltar à página</button><button id="v2-reorder-save" class="v2-primary" data-busy>Salvar rascunho</button></div>';
 wireBack(()=>{st.view="page";render()});$("#v2-reorder-back").onclick=()=>{st.view="page";render()};
 $("#v2-reorder-save").onclick=savePage;
 $$("[data-open-section]").forEach(b=>b.onclick=()=>editSection(b.dataset.openSection));
 $$("[data-move]").forEach(b=>b.onclick=()=>{
 const [from,change]=b.dataset.move.split(":").map(Number),to=from+change;if(to<0||to>=st.doc.sections.length)return;
 const [section]=st.doc.sections.splice(from,1);st.doc.sections.splice(to,0,section);st.dirty=true;render();
 });
 $$("[data-toggle]").forEach(b=>b.onclick=()=>{const sec=st.doc.sections.find(s=>s.id===b.dataset.toggle);if(sec){sec.visible=sec.visible===false;st.dirty=true;render()}});
}
async function sessionId(){
 const r=await fetch(baseUrl+"/auth/v1/user",{headers:apiSession()});if(!r.ok)throw Error("Sessão expirada. Entre novamente.");
 return (await r.json()).id;
}
async function savePage(){
 if(st.busy)return;
 busy(true);
 try{
 const actor=await sessionId(),row={kind:"page",key:st.page,payload:st.doc,updated_by:actor,updated_at:new Date().toISOString()};
 const r=await request("cms_drafts?on_conflict=kind,key","POST",row);if(!r.ok)await showErr(r);
 st.drafts.set("page:"+st.page,row);st.dirty=false;toast("Rascunho salvo no Supabase.");
 if(st.view==="page"){$(".v2-overline")?.replaceChildren(document.createTextNode("EDITOR VISUAL · RASCUNHO SALVO"));}
 }catch(e){toast(e.message,true)}finally{busy(false)}
}
async function publish(kind,key,payload){
 busy(true);
 try{
 const actor=await sessionId();
 const row={kind,key,payload,updated_by:actor,updated_at:new Date().toISOString()};
 const save=await request("cms_drafts?on_conflict=kind,key","POST",row);if(!save.ok)await showErr(save);
 st.drafts.set(kind+":"+key,row);
 const r=await fetch(baseUrl+"/functions/v1/nobron-cms-publish",{method:"POST",cache:"no-store",headers:{apikey:publishable,Authorization:"Bearer "+pref(),"Content-Type":"application/json"},body:JSON.stringify({kind,key})});
 if(!r.ok){const msg=await r.json().catch(()=>({}));throw Error(msg.error||"Não foi possível publicar");}
 await loadData();st.dirty=false;st.projectDirty=false;
 toast("Publicado! As alterações já podem aparecer no site.");
 st.view=kind==="page"?"page":"projects";
 if(kind==="page")st.doc=pageDoc(key);
 render();
 }catch(e){toast(e.message,true)}finally{busy(false)}
}
function reviewView(){
 $("#v2-stage").innerHTML=topline("Revisar página",label(st.page)+" / PUBLICAÇÃO",true)+'<div class="v2-review-summary"><div><small>VERSÃO</small><strong>'+html(label(st.page))+'</strong></div><div><small>SEÇÕES</small><strong>'+st.doc.sections.filter(s=>s.visible!==false).length+' visíveis</strong></div></div><div class="v2-review-preview">'+deviceSwitch()+frameMarkup("review")+'</div><p class="v2-tip">Confira Mobile e Desktop. Ao publicar, o rascunho substitui a versão pública da página.</p><div class="v2-fixed-actions"><button id="v2-review-edit">Voltar e editar</button><button id="v2-review-save" data-busy>Salvar</button><button id="v2-review-publish" class="v2-primary" data-busy>Publicar</button></div>';
 wireBack(()=>{st.view="page";render()});$("#v2-review-edit").onclick=()=>{st.view="page";render()};
 $("#v2-review-save").onclick=savePage;
 $("#v2-review-publish").onclick=()=>{if(confirm("Publicar esta página no site?"))publish("page",st.page,st.doc)};
 wireDevices();initFrame();
}
function mediaView(){
 $("#v2-stage").innerHTML=topline("Biblioteca de mídias","GESTÃO DE ARQUIVOS")+step("Imagens e vídeos","Use os mesmos arquivos em diferentes páginas.")+mediaControls()+'<div class="v2-media-grid" id="v2-media-grid"></div>';
 bindMediaSearch();paintMediaGrid(false);
}
function mediaControls(){return '<div class="v2-media-tools"><label class="v2-search"><span>⌕</span><input id="v2-media-search" placeholder="Buscar mídia" value="'+html(st.pickerQuery)+'"></label><select id="v2-media-filter"><option value="all">Todos</option><option value="image">Imagens</option><option value="video">Vídeos</option></select><label class="v2-upload">＋ Enviar<input id="v2-upload-files" type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif,video/mp4,video/webm" multiple></label></div>';}
function bindMediaSearch(){
 $("#v2-media-filter").value=st.pickerType;
 $("#v2-media-search").oninput=e=>{st.pickerQuery=e.target.value;paintMediaGrid(st.view==="pick")};
 $("#v2-media-filter").onchange=e=>{st.pickerType=e.target.value;paintMediaGrid(st.view==="pick")};
 $("#v2-upload-files").onchange=async e=>{const files=[...e.target.files];if(!files.length)return;await uploadMedia(files);paintMediaGrid(st.view==="pick")};
}
function filteredAssets(){return st.assets.filter(a=>(st.pickerType==="all"||a.mime?.startsWith(st.pickerType))&&a.name?.toLowerCase().includes(st.pickerQuery.toLowerCase()))}
function paintMediaGrid(choose){
 const root=$("#v2-media-grid");if(!root)return;
 const items=filteredAssets();
 root.innerHTML=items.length?items.map(a=>'<button type="button" class="v2-media-card" data-asset="'+a.id+'"><div class="v2-media-card-thumb" data-path="'+html(a.path)+'"><span>'+ (a.mime?.startsWith("video")?"▶":"▧")+'</span></div><b title="'+html(a.name)+'">'+html(a.name)+'</b><small>'+Math.round((a.bytes||0)/1024)+' KB · '+(a.mime?.startsWith("video")?"Vídeo":"Imagem")+'</small></button>').join(""):'<div class="v2-empty"><b>Nenhuma mídia encontrada.</b><p>Envie imagens ou vídeos para começar.</p></div>';
 $$("[data-asset]",root).forEach(b=>b.onclick=()=>{const asset=st.assets.find(x=>x.id===b.dataset.asset);if(!asset)return;if(choose)chooseMedia(asset);else showMediaDetail(asset)});
 for(const a of items){
  const elem=$('[data-path="'+CSS.escape(a.path)+'"]',root);if(!elem)continue;
  assetURL(a).then(u=>{if(!u||!elem.isConnected)return;elem.innerHTML=a.mime?.startsWith("video")?'<video src="'+html(u)+'" muted preload="metadata" playsinline></video>':'<img src="'+html(u)+'" alt="">'}).catch(()=>{});
 }
}
async function uploadMedia(files){
 const types=["image/jpeg","image/png","image/webp","image/avif","image/gif","video/mp4","video/webm"];
 for(const file of files){
  if(!types.includes(file.type)||file.size>100*1024*1024){toast(file.name+": formato ou tamanho não aceito.",true);continue}
  busy(true);
  try{
   const ext=(file.name.split(".").pop()||"bin").toLowerCase();
   const path="uploads/"+crypto.randomUUID()+"."+ext;
   const up=await fetch(baseUrl+"/storage/v1/object/nobron-drafts/"+path,{method:"POST",headers:{apikey:publishable,Authorization:"Bearer "+pref(),"Content-Type":file.type},body:file});
   if(!up.ok)throw Error("Falha no upload ("+up.status+")");
   const row={name:file.name,mime:file.type,bytes:file.size,bucket:"nobron-drafts",path};
   const save=await request("cms_media?select=id,name,mime,bytes,bucket,path,created_at","POST",row);
   if(!save.ok)await showErr(save);
   const record=(await save.json())[0];st.assets.unshift(record);st.assetUrls.set(path,URL.createObjectURL(file));toast(file.name+" enviado.");
  }catch(e){toast(e.message,true)}finally{busy(false)}
 }
}
function showMediaDetail(a){
 const node=$("#v2-layer");
 node.innerHTML='<div class="v2-sheet-backdrop"></div><div class="v2-sheet v2-media-detail"><header class="v2-sheet-header"><div><small>BIBLIOTECA</small><h2>'+html(a.name)+'</h2></div><button id="v2-detail-close">×</button></header><div class="v2-sheet-body"><div class="v2-detail-media" id="v2-detail-media">Carregando...</div><div class="v2-detail-info"><span>Tipo</span><b>'+html(a.mime||"")+'</b><span>Tamanho</span><b>'+Math.round(a.bytes/1024)+' KB</b></div></div></div>';
 $$(".v2-sheet-backdrop,#v2-detail-close").forEach(b=>b.onclick=()=>node.innerHTML="");
 assetURL(a).then(url=>{const elem=$("#v2-detail-media");if(!elem||!url)return;elem.innerHTML=a.mime?.startsWith("video")?'<video src="'+html(url)+'" controls playsinline></video>':'<img src="'+html(url)+'" alt="'+html(a.name)+'">'});
}
function openPicker(target){
 st.assetTarget=target;st.previousView=st.view;
 st.view="pick";render();
}
function pickerView(){
 const root=$("#v2-layer");
 const parentPage=st.previousView==="edit";
 if(parentPage){
  if(!$("#v2-live-frame")){st.view="page";pageView();}st.view="pick";
 }else if(st.previousView==="projectEdit"){
  // Render background without destroying the project being edited.
  $("#v2-stage").innerHTML=topline("Projeto","Selecionar mídia");
 }
 root.innerHTML='<div class="v2-picker" role="dialog" aria-modal="true"><div class="v2-picker-header"><button id="v2-picker-close" aria-label="Voltar">‹</button><div><small>BIBLIOTECA</small><h2>Escolher mídia</h2></div></div>'+mediaControls()+'<div class="v2-media-grid" id="v2-media-grid"></div></div>';
 $("#v2-picker-close").onclick=closePicker;bindMediaSearch();paintMediaGrid(true);
}
function chooseMedia(asset){
 const value={bucket:asset.bucket,path:asset.path,name:asset.name,type:asset.mime?.startsWith("video")?"video":"image"};
 if(st.assetTarget==="section"){
  st.section.media??={desktop:null,mobile:null};
  st.section.media[st.device]=value;
 }else if(st.assetTarget==="cover"){
  st.projectDoc.cover??={desktop:null,mobile:null};st.projectDoc.cover[st.device]=value;st.projectDirty=true;
 }else if(st.assetTarget==="gallery"){
  st.projectDoc.media??=[];st.projectDoc.media.push(value);st.projectDirty=true;
 }
 closePicker();
}
function closePicker(){
 st.view=st.previousView||"page";st.previousView=null;st.assetTarget=null;
 if(st.view==="edit"&&$("#v2-live-frame")){renderNav();renderLayer();sendDraft();}else if(st.view==="page"&&$("#v2-live-frame")){renderNav();sendDraft();}else render();
}
function projectsView(){
 $("#v2-stage").innerHTML=topline("Projetos","PORTFÓLIO")+step("Trabalhos realizados","Gerencie capas, imagens, vídeos e destaques.")+'<div class="v2-project-actions"><button id="v2-new-project" class="v2-primary">＋ Novo projeto</button></div><div class="v2-project-list">'+[...st.projects].map(([id,p])=>'<button data-project="'+html(id)+'"><div class="v2-project-thumb">▦</div><div><b>'+html(p.title)+'</b><small>'+html(p.category||"")+' · '+html(p.status||"")+'</small></div><span>↗</span></button>').join("")+'</div>';
 if(!st.projects.size)$(".v2-project-list").innerHTML='<div class="v2-empty"><b>Seu portfólio começa aqui.</b><p>Cadastre o primeiro trabalho para aparecer na galeria pública.</p></div>';
 $("#v2-new-project").onclick=()=>openProject(null);
 $$("[data-project]").forEach(b=>b.onclick=()=>openProject(b.dataset.project));
}
function openProject(id){
 st.projectId=id||"projeto-"+crypto.randomUUID().slice(0,12);
 st.projectDoc=copy(id?st.projects.get(id):{title:"",description:"",category:"design",status:"concluído",featured:false,visible:true,cover:{desktop:null,mobile:null},media:[]});
 st.projectDirty=false;st.projectTab="info";st.view="projectEdit";render();
}
function projectEditView(){
 const p=st.projectDoc;
 $("#v2-stage").innerHTML=topline(p.title||"Novo projeto","PORTFÓLIO / EDIÇÃO",true)+'<div class="v2-project-tabs"><button data-ptab="info">Informações</button><button data-ptab="media">Mídias</button><button data-ptab="display">Exibição</button></div><div class="v2-project-form" id="v2-project-form"></div><div class="v2-fixed-actions"><button id="v2-project-back">Voltar</button><button id="v2-project-save" data-busy>Salvar</button><button id="v2-project-publish" class="v2-primary" data-busy>Publicar ↗</button></div>';
 wireBack(backProject);$("#v2-project-back").onclick=backProject;
 $$("[data-ptab]").forEach(b=>b.onclick=()=>{st.projectTab=b.dataset.ptab;drawProjectForm()});
 $("#v2-project-save").onclick=saveProject;
 $("#v2-project-publish").onclick=()=>{if(!st.projectDoc.title.trim())return toast("Informe o nome do projeto.",true);if(confirm("Publicar este projeto?"))publish("project",st.projectId,st.projectDoc)};
 drawProjectForm();
}
function backProject(){if(st.projectDirty&&!confirm("Descartar alterações não salvas?"))return;st.projectDirty=false;st.view="projects";render()}
function drawProjectForm(){
 $$("[data-ptab]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.ptab===st.projectTab)));
 const p=st.projectDoc,root=$("#v2-project-form");if(!root)return;
 if(st.projectTab==="info"){
 root.innerHTML='<label class="v2-field"><span>Nome do projeto</span><input id="v2-p-title" value="'+html(p.title)+'" maxlength="150"></label><label class="v2-field"><span>Descrição curta</span><textarea id="v2-p-description" rows="4">'+html(p.description||"")+'</textarea></label><label class="v2-field"><span>Categoria</span><select id="v2-p-category">'+[["design","Design Digital"],["motion","Motion Design"],["sistemas","Sistemas"]].map(([v,t])=>'<option value="'+v+'" '+(v===p.category?"selected":"")+'>'+t+'</option>').join("")+'</select></label><label class="v2-field"><span>Estado</span><select id="v2-p-status">'+["concluído","em desenvolvimento","protótipo"].map(v=>'<option '+(v===p.status?"selected":"")+'>'+v+'</option>').join("")+'</select></label>';
 for(const prop of ["title","description","category","status"])$("#v2-p-"+prop).oninput=e=>{st.projectDoc[prop]=e.target.value;st.projectDirty=true};
 }
 if(st.projectTab==="media"){
 root.innerHTML=deviceSwitch()+'<div class="v2-media-slot"><strong>Capa · '+html(st.device)+'</strong><div id="v2-project-cover" class="v2-media-slot-visual"><span>▧</span></div><button id="v2-cover-pick" class="v2-primary">Escolher capa</button></div>'+step("Galeria do projeto","Imagens e vídeos exibidos ao abrir o trabalho.")+'<div class="v2-gallery-list">'+(p.media||[]).map((a,i)=>'<div><span>'+html(a.name||a.path)+'</span><div><button data-gmove="'+i+':-1" aria-label="Subir">↑</button><button data-gmove="'+i+':1" aria-label="Descer">↓</button><button data-gremove="'+i+'" aria-label="Remover">×</button></div></div>').join("")+'</div><button id="v2-gallery-add" class="v2-secondary">＋ Adicionar mídia</button>';
 wireDevices();$("#v2-cover-pick").onclick=()=>openPicker("cover");$("#v2-gallery-add").onclick=()=>openPicker("gallery");
 const cover=p.cover?.[st.device];if(cover)assetURL(cover).then(u=>{if(u&&$("#v2-project-cover"))$("#v2-project-cover").innerHTML=cover.type==="video"?'<video controls playsinline src="'+html(u)+'"></video>':'<img src="'+html(u)+'" alt="Capa">';});
 $$("[data-gremove]").forEach(b=>b.onclick=()=>{p.media.splice(Number(b.dataset.gremove),1);st.projectDirty=true;drawProjectForm()});
 $$("[data-gmove]").forEach(b=>b.onclick=()=>{const [i,d]=b.dataset.gmove.split(":").map(Number),j=i+d;if(j<0||j>=p.media.length)return;const [v]=p.media.splice(i,1);p.media.splice(j,0,v);st.projectDirty=true;drawProjectForm()});
 }
 if(st.projectTab==="display"){
 root.innerHTML='<label class="v2-checkbox"><input id="v2-p-visible" type="checkbox" '+(p.visible!==false?"checked":"")+'> Mostrar no site</label><label class="v2-checkbox"><input id="v2-p-featured" type="checkbox" '+(p.featured===true?"checked":"")+'> Destacar na Home</label><p class="v2-tip">O projeto aparece automaticamente na categoria correspondente após a publicação.</p>';
 $("#v2-p-visible").onchange=e=>{p.visible=e.target.checked;st.projectDirty=true};
 $("#v2-p-featured").onchange=e=>{p.featured=e.target.checked;st.projectDirty=true};
 }
}
async function saveProject(){
 if(!st.projectDoc?.title?.trim())return toast("Informe o nome do projeto.",true);
 busy(true);
 try{
 const row={kind:"project",key:st.projectId,payload:st.projectDoc,updated_by:await sessionId(),updated_at:new Date().toISOString()};
 const r=await request("cms_drafts?on_conflict=kind,key","POST",row);if(!r.ok)await showErr(r);
 st.drafts.set("project:"+st.projectId,row);st.projects.set(st.projectId,copy(st.projectDoc));st.projectDirty=false;toast("Projeto salvo como rascunho.");
 }catch(e){toast(e.message,true)}finally{busy(false)}
}
function moreView(){
 $("#v2-stage").innerHTML=topline("Mais","PAINEL ADMINISTRATIVO")+'<div class="v2-menu-list"><button id="v2-more-publish"><span>⇧</span><div><b>Publicação</b><small>Revisar e publicar conteúdo</small></div>›</button><button id="v2-more-security"><span>♢</span><div><b>Segurança</b><small>Alterar senha de acesso</small></div>›</button><button id="v2-more-exit"><span>↪</span><div><b>Sair</b><small>Encerrar sessão administrativa</small></div>›</button></div><div id="v2-publish-list"></div>';
 $("#v2-more-publish").onclick=()=>showPublished();
 $("#v2-more-security").onclick=()=>{st.view="security";render()};
 $("#v2-more-exit").onclick=()=>window.nobronAdminLogout?.();
}
function showPublished(){
 const root=$("#v2-publish-list");if(!root)return;
 root.innerHTML=step("Conteúdo publicado","Selecione uma página para revisar.")+'<div class="v2-stack">'+Object.entries(pages).map(([k,v])=>'<button data-review-page="'+k+'" class="v2-publish-row"><b>'+html(v.label)+'</b><small>'+ (st.drafts.has("page:"+k)?"Rascunho":"Sem rascunho")+'</small>↗</button>').join("")+'</div><div class="v2-history">'+step("Histórico","Registros de versões anteriores.")+(st.versions.length?st.versions.slice(0,15).map(v=>'<p>'+html(v.kind)+' / '+html(v.key)+' · '+new Date(v.created_at).toLocaleString("pt-BR")+'</p>').join(""):'<p>Nenhuma versão anterior.</p>')+'</div>';
 $$("[data-review-page]").forEach(b=>b.onclick=()=>{st.page=b.dataset.reviewPage;st.doc=pageDoc(st.page);st.view="review";render()});
}
function securityView(){
 $("#v2-stage").innerHTML=topline("Segurança","CONFIGURAÇÕES DE ACESSO",true)+step("Alterar senha","Confirme sua senha atual e defina uma nova senha.")+'<form id="v2-pass-form" class="v2-security-form"><label class="v2-field"><span>Senha atual</span><input id="v2-old-pass" type="password" autocomplete="current-password" required></label><label class="v2-field"><span>Nova senha</span><input id="v2-new-pass" type="password" minlength="14" maxlength="128" autocomplete="new-password" required></label><label class="v2-field"><span>Confirmar nova senha</span><input id="v2-confirm-pass" type="password" minlength="14" maxlength="128" autocomplete="new-password" required></label><button type="submit" class="v2-primary" data-busy>Salvar nova senha</button><p id="v2-pass-status" role="status"></p></form>';
 wireBack(()=>{st.view="more";render()});
 $("#v2-pass-form").onsubmit=async e=>{
 e.preventDefault();const current=$("#v2-old-pass").value,newPass=$("#v2-new-pass").value;if(newPass!==$("#v2-confirm-pass").value)return toast("As senhas não coincidem.",true);
 busy(true);
 try{
 const login=await fetch(baseUrl+"/functions/v1/nobron-owner-auth",{method:"POST",headers:{apikey:publishable,"Content-Type":"application/json"},body:JSON.stringify({action:"login",password:current})});
 const body=await login.json().catch(()=>({}));
 if(!login.ok||!body.session?.access_token)throw Error("Senha atual incorreta ou muitas tentativas.");
 const r=await fetch(baseUrl+"/auth/v1/user",{method:"PUT",headers:{apikey:publishable,Authorization:"Bearer "+body.session.access_token,"Content-Type":"application/json"},body:JSON.stringify({password:newPass})});
 if(!r.ok)await showErr(r);
 $("#v2-pass-form").reset();toast("Senha atualizada. Entre novamente.");
 await window.nobronAdminLogout?.();
 }catch(err){toast(err.message,true)}finally{busy(false)}
 };
}
async function mount(session){
 if(!session?.access_token)return;
 st.session=session;
 root();$("#v2-stage").innerHTML='<div class="v2-loading">Abrindo seu painel...</div>';
 try{await loadData();st.view="pages";render()}
 catch(e){$("#v2-stage").innerHTML=step("Não foi possível carregar",e.message)+'<button id="v2-retry" class="v2-primary">Tentar novamente</button>';$("#v2-retry").onclick=()=>mount(session);}
}
function unmount(){
 for(const uri of st.assetUrls.values())if(uri.startsWith("blob:"))URL.revokeObjectURL(uri);
 st.assetUrls.clear();st.dirty=false;st.projectDirty=false;
 document.body.classList.remove("cms-v2-open");
 window.onbeforeunload=null;
}
window.nobronCms={mount,unmount};
})();