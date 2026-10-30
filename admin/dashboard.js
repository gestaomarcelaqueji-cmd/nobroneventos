(()=>{
"use strict";
const SCHEMA=window.NOBRON_SCHEMA;
const {pages,baseUrl,publishable}=SCHEMA;
const $=q=>document.querySelector(q);
const E=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const COPY=o=>JSON.parse(JSON.stringify(o));
const STATE={tab:"pages",page:"home",section:0,device:"mobile",projects:{},drafts:{},published:{},assets:[],versions:[],project:null,dirty:false,session:null,previewURLs:new Map(),busy:false};
const AUTH=()=>STATE.session?.access_token||"";
const REST=baseUrl+"/rest/v1/";
const API=(path,opts={})=>fetch(REST+path,{...opts,headers:{apikey:publishable,Authorization:"Bearer "+AUTH(),...(opts.headers||{})}});
const field=(label,id,value,tag="input",attrs="")=>'<label class="cms-field"><span>'+E(label)+'</span>'+(tag==="textarea"?'<textarea id="'+id+'" '+attrs+'>'+E(value)+'</textarea>':'<input id="'+id+'" value="'+E(value)+'" '+attrs+'>')+'</label>';
function shell(){
 $("#inside").innerHTML='<div class="cms-layout"><aside class="cms-sidebar"><div class="cms-sidebar-top"><strong>noBRon.</strong><small>GESTÃO DO SITE</small></div><nav class="cms-side-nav">'+menu()+'</nav><div class="cms-side-footer"><a href="/" target="_blank" rel="noopener">Abrir site ↗</a><button id="cms-exit" type="button">Sair</button></div></aside><div class="cms-area"><header class="cms-toolbar"><div><small>NO BRON / ADMIN</small><h1 id="cms-title">Páginas</h1></div><div class="cms-toolbar-actions"><a href="/" target="_blank" rel="noopener">Ver site ↗</a><button type="button" id="cms-logout">Sair</button></div></header><section id="cms-content" aria-live="polite"></section></div><nav class="cms-mobile-nav">'+menu()+'</nav></div><div id="cms-toast" role="status" aria-live="polite"></div>';
 $("#cms-exit").onclick=$("#cms-logout").onclick=()=>$("#logout").click();
 document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{STATE.tab=b.dataset.tab;STATE.dirty=false;render()});
}
const menu=()=>[["pages","Páginas","▤"],["projects","Projetos","▦"],["library","Biblioteca","▧"],["publish","Publicação","⇧"]].map(([id,label,icon])=>'<button type="button" data-tab="'+id+'" class="'+(STATE.tab===id?"selected":"")+'"><span>'+icon+'</span><b>'+label+'</b></button>').join("");
const notify=(message,error=false)=>{const t=$("#cms-toast");t.textContent=message;t.className=error?"error":"ok";setTimeout(()=>{if(t.textContent===message)t.textContent=""},5500)};
function activePage(){
 const key=STATE.page;
 return STATE.drafts["page:"+key]?.payload||STATE.published["page:"+key]?.payload||COPY({sections:pages[key].sections});
}
function currentSection(){return activePage().sections[STATE.section]}
function projectDoc(){
 if(STATE.project==="new")return STATE.projects.new||{title:"",category:"design",description:"",status:"concluído",visible:true,cover:{desktop:null,mobile:null},media:[]};
 return STATE.projects[STATE.project]||{title:"",category:"design",description:"",status:"concluído",visible:true,cover:{desktop:null,mobile:null},media:[]}
}
function updatePageDoc(doc){
 STATE.drafts["page:"+STATE.page]={kind:"page",key:STATE.page,payload:doc};
 STATE.dirty=true;
}
function updateProjectDoc(doc){
 const id=STATE.project||"new";
 STATE.projects[id]=doc;
 if(id!=="new")STATE.drafts["project:"+id]={kind:"project",key:id,payload:doc};
 STATE.dirty=true;
}
async function load(){
 const [draft,pub,assets,versions]=await Promise.all([
  API("cms_drafts?select=kind,key,payload,updated_at&order=updated_at.desc&limit=300"),
  API("cms_published?select=kind,key,payload,published_at&limit=300"),
  API("cms_media?select=id,name,mime,bytes,bucket,path,created_at&order=created_at.desc&limit=300"),
  API("cms_versions?select=id,kind,key,created_at&order=created_at.desc&limit=100")
 ]);
 for(const r of [draft,pub,assets,versions])if(!r.ok)throw new Error("Falha ao consultar o banco ("+r.status+")");
 STATE.drafts=Object.fromEntries((await draft.json()).map(x=>[x.kind+":"+x.key,x]));
 STATE.published=Object.fromEntries((await pub.json()).map(x=>[x.kind+":"+x.key,x]));
 STATE.assets=await assets.json();
 STATE.versions=await versions.json();
 STATE.projects={};
 for(const row of [...Object.values(STATE.published),...Object.values(STATE.drafts)])if(row.kind==="project")STATE.projects[row.key]=COPY(row.payload);
}
function assetChoice(){
 const opts=STATE.assets.map(x=>'<option value="'+E(x.id)+'">'+E(x.name)+' · '+(x.mime?.startsWith("video")?"Vídeo":"Imagem")+'</option>').join("");
 return '<div class="cms-media-controls"><select id="cms-media-select"><option value="">Selecionar da biblioteca</option>'+opts+'</select><button type="button" id="cms-apply-media" '+(opts?"":"disabled")+'>Aplicar</button></div>';
}
function activeMedia(){return currentSection()?.media?.[STATE.device]||null}
function mediaEditor(asset,section="page"){
 const label=asset?.name||asset?.path||"Nenhum arquivo selecionado";
 return '<div class="cms-media-box"><div class="cms-media-top"><small>ARQUIVO · '+STATE.device.toUpperCase()+'</small><b>'+E(label)+'</b></div><div id="cms-media-preview" class="cms-media-preview"><span>Prévia da mídia</span></div>'+assetChoice()+'<label class="cms-upload">Enviar imagem ou vídeo<input id="cms-upload" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm"></label>'+(asset?'<button type="button" id="cms-remove-media" class="cms-minor">Retirar desta posição</button>':"")+'</div>'
}
function previewMedia(asset){
 const el=$("#cms-media-preview");if(!el||!asset)return;
 if(asset.src&&asset.bucket==="nobron-public"){paintPreview(asset.src,asset);return}
 const path=asset.path;
 if(!path)return;
 if(STATE.previewURLs.has(path)){paintPreview(STATE.previewURLs.get(path),asset);return}
 const url=baseUrl+"/storage/v1/object/authenticated/nobron-drafts/"+path.split("/").map(encodeURIComponent).join("/");
 fetch(url,{headers:{apikey:publishable,Authorization:"Bearer "+AUTH()}}).then(r=>{if(!r.ok)throw Error("Arquivo indisponível");return r.blob()}).then(blob=>{
  const u=URL.createObjectURL(blob);STATE.previewURLs.set(path,u);
  if($("#cms-media-preview"))paintPreview(u,asset)
 }).catch(()=>{if($("#cms-media-preview"))$("#cms-media-preview").textContent="Prévia indisponível"});
}
function paintPreview(url,asset){
 const el=$("#cms-media-preview");if(!el)return;
 el.innerHTML=asset.type==="video"||asset.mime?.startsWith("video")?'<video controls playsinline preload="metadata" src="'+E(url)+'"></video>':'<img src="'+E(url)+'" alt="Prévia da mídia">';
}
function mediaAsset(row){return {bucket:row.bucket,path:row.path,name:row.name,type:row.mime?.startsWith("video")?"video":"image"}}
function renderPages(){
 const page=activePage();const entries=page.sections||[];
 STATE.section=Math.max(0,Math.min(STATE.section,entries.length-1));
 const s=entries[STATE.section];
 $("#cms-content").innerHTML='<div class="cms-editor"><div class="cms-editor-side"><label>Editar página</label><select id="cms-page">'+Object.entries(pages).map(([k,v])=>'<option value="'+k+'" '+(k===STATE.page?"selected":"")+'>'+v.label+'</option>').join("")+'</select><div class="cms-sections-title"><b>Seções da página</b><small>'+entries.length+' seções</small></div><div class="cms-sections">'+entries.map((x,i)=>'<button class="'+(i===STATE.section?"selected":"")+'" data-section="'+i+'"><span>0'+(i+1)+'</span><b>'+E(x.title)+'</b><i>›</i></button>').join("")+'</div><p class="cms-help">Selecione a seção para editar o conteúdo e as mídias separadamente.</p></div><div class="cms-editor-main"><div class="cms-editor-head"><div><small>EDITOR DE SEÇÃO</small><h2>'+E(s.title)+'</h2></div><div class="cms-device"><button id="cms-desktop" class="'+(STATE.device==="desktop"?"selected":"")+'">▭ Desktop</button><button id="cms-mobile" class="'+(STATE.device==="mobile"?"selected":"")+'">▯ Mobile</button></div></div><div class="cms-editor-grid"><div class="cms-fields">'+field("Título","cms-section-title",s.title)+field("Descrição","cms-section-description",s.description,"textarea","rows=3")+'<label class="cms-check"><input type="checkbox" id="cms-section-visible" '+(s.visible!==false?"checked":"")+'> Mostrar seção no site</label><div class="cms-divider"></div><h3>Visual de '+(STATE.device==="mobile"?"celular":"computador")+'</h3><div class="cms-pair">'+field("Posição da mídia (%)","cms-position",s.device?.[STATE.device]?.position??50,"input",'type="number" min="0" max="100"')+field("Zoom (%)","cms-zoom",s.device?.[STATE.device]?.zoom??100,"input",'type="number" min="100" max="180"')+'</div><label class="cms-field"><span>Recorte entre seções</span><select id="cms-divider">'+["curve","diagonal","fold","notch"].map((v,i)=>'<option value="'+v+'" '+(v===(s.device?.[STATE.device]?.divider||"curve")?"selected":"")+'>'+["Curva","Diagonal","Camadas","Recorte"][i]+'</option>').join("")+'</select></label>'+mediaEditor(activeMedia())+'</div><div class="cms-preview-zone"><b>Prévia da seção · '+(STATE.device==="mobile"?"Mobile":"Desktop")+'</b><div class="cms-preview-frame '+STATE.device+'"><small>noBRon. / '+E(pages[STATE.page].label)+'</small><h3 id="cms-live-title">'+E(s.title)+'</h3><p id="cms-live-desc">'+E(s.description)+'</p><div id="cms-preview-art"></div></div><p>Para conferir a página publicada, abra <a target="_blank" rel="noopener" href="'+pages[STATE.page].route+'">o site ↗</a>.</p></div></div><div class="cms-savebar"><span id="cms-dirty-note">Alterações ainda não salvas</span><button id="cms-save">Salvar rascunho</button><button id="cms-publish" class="primary">Publicar página ↗</button></div></div></div>';
 $("#cms-page").onchange=e=>{STATE.page=e.target.value;STATE.section=0;STATE.dirty=false;render()};
 document.querySelectorAll("[data-section]").forEach(btn=>btn.onclick=()=>{STATE.section=Number(btn.dataset.section);render()});
 $("#cms-desktop").onclick=()=>{STATE.device="desktop";render()};
 $("#cms-mobile").onclick=()=>{STATE.device="mobile";render()};
 const modify=(fn)=>{const doc=COPY(activePage());fn(doc.sections[STATE.section]);updatePageDoc(doc);$("#cms-dirty-note").textContent="Alterações não salvas"};
 $("#cms-section-title").oninput=e=>{modify(s=>s.title=e.target.value);$("#cms-live-title").textContent=e.target.value};
 $("#cms-section-description").oninput=e=>{modify(s=>s.description=e.target.value);$("#cms-live-desc").textContent=e.target.value};
 $("#cms-section-visible").onchange=e=>modify(s=>s.visible=e.target.checked);
 ["position","zoom","divider"].forEach(field=>$("#cms-"+field).onchange=e=>modify(s=>{s.device??={};s.device[STATE.device]??={};s.device[STATE.device][field]=field==="divider"?e.target.value:Number(e.target.value)}));
 wireMediaControls((asset)=>{modify(s=>{s.media??={desktop:null,mobile:null};s.media[STATE.device]=asset});render()});
 $("#cms-save").onclick=()=>savePage();
 $("#cms-publish").onclick=()=>publish("page",STATE.page);
 previewMedia(activeMedia());previewMediaInFrame(activeMedia());
}
function previewMediaInFrame(a){
 const node=$("#cms-preview-art");if(!node||!a)return;
 const url=a.src?.startsWith("https://")?a.src:STATE.previewURLs.get(a.path);
 if(!url){setTimeout(()=>previewMediaInFrame(a),950);return}
 node.innerHTML=a.type==="video"?'<video controls playsinline src="'+E(url)+'"></video>':'<img src="'+E(url)+'" alt="Mídia selecionada">'
}
function wireMediaControls(apply){
 const button=$("#cms-apply-media");
 if(button)button.onclick=()=>{const id=$("#cms-media-select").value;const row=STATE.assets.find(x=>x.id===id);if(row)apply(mediaAsset(row));else notify("Selecione uma mídia",true)};
 const upload=$("#cms-upload");if(upload)upload.onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{setBusy(true);const row=await uploadFile(file);apply(mediaAsset(row));notify("Arquivo enviado para a biblioteca")}catch(err){notify(err.message,true)}finally{setBusy(false)}};
 const remove=$("#cms-remove-media");if(remove)remove.onclick=()=>apply(null);
}
function setBusy(v){STATE.busy=v;document.querySelectorAll(".cms-savebar button,.cms-upload input").forEach(el=>el.disabled=v)}
async function uploadFile(file){
 const mimeOk=["image/jpeg","image/png","image/webp","image/avif","image/gif","video/mp4","video/webm"];
 if(!mimeOk.includes(file.type))throw Error("Formato não suportado");
 if(file.size>100*1024*1024)throw Error("Arquivo maior que 100 MB");
 const ext=(file.name.split(".").pop()||"bin").toLowerCase();
 const path="uploads/"+crypto.randomUUID()+"."+ext;
 const url=baseUrl+"/storage/v1/object/nobron-drafts/"+path;
 const uploaded=await fetch(url,{method:"POST",headers:{apikey:publishable,Authorization:"Bearer "+AUTH(),"Content-Type":file.type},body:file});
 if(!uploaded.ok)throw Error("Falha no envio ao Storage: "+uploaded.status);
 const info={name:file.name,mime:file.type,bytes:file.size,bucket:"nobron-drafts",path};
 const registered=await API("cms_media?select=id,name,mime,bytes,bucket,path,created_at",{method:"POST",headers:{"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify(info)});
 if(!registered.ok)throw Error("Arquivo enviado, mas o cadastro falhou: "+registered.status);
 const row=(await registered.json())[0];STATE.assets.unshift(row);
 const obj=URL.createObjectURL(file);STATE.previewURLs.set(path,obj);
 return row
}
async function upsert(kind,key,payload){
 const record={kind,key,payload,updated_by:await sessionUser(),updated_at:new Date().toISOString()};
 const r=await API("cms_drafts?on_conflict=kind,key",{method:"POST",headers:{"Content-Type":"application/json",Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(record)});
 if(!r.ok)throw Error("Não foi possível salvar no banco ("+r.status+")");
 STATE.drafts[kind+":"+key]={...record};STATE.dirty=false;
}
async function sessionUser(){
 const r=await fetch(baseUrl+"/auth/v1/user",{headers:{apikey:publishable,Authorization:"Bearer "+AUTH()}});
 if(!r.ok)throw Error("Sessão expirada. Entre novamente.");
 const user=await r.json();return user.id
}
async function savePage(){
 try{setBusy(true);await upsert("page",STATE.page,activePage());notify("Rascunho salvo no Supabase");renderPages()}catch(e){notify(e.message,true)}finally{setBusy(false)}
}
async function publish(kind,key){
 if(!confirm("Publicar as alterações de "+(kind==="page"?"página":"projeto")+"?"))return;
 try{
  setBusy(true);
  if(kind==="page")await upsert("page",key,activePage());
  else await saveProject(true);
  const r=await fetch(baseUrl+"/functions/v1/nobron-cms-publish",{method:"POST",headers:{apikey:publishable,Authorization:"Bearer "+AUTH(),"Content-Type":"application/json"},body:JSON.stringify({kind,key})});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw Error(data.error||"Não foi possível publicar");
  notify("Conteúdo publicado! "+(data.mediaTransferred||0)+" mídias processadas");
  await load();render()
 }catch(e){notify(e.message,true)}finally{setBusy(false)}
}
function projectKeys(){return Object.keys(STATE.projects).filter(x=>x!=="new").sort()}
function renderProjects(){
 if(!STATE.project)STATE.project=projectKeys()[0]||"new";
 const p=projectDoc();
 $("#cms-content").innerHTML='<div class="cms-project-header"><div><h2>Projetos do portfólio</h2><p>Cadastre um trabalho uma vez e publique nas galerias correspondentes.</p></div><button id="cms-new-project">+ Novo projeto</button></div><div class="cms-project-panel"><aside><label>Projeto</label><select id="cms-project-select"><option value="new" '+(STATE.project==="new"?"selected":"")+'>+ Novo projeto</option>'+projectKeys().map(id=>'<option value="'+E(id)+'" '+(STATE.project===id?"selected":"")+'>'+E(STATE.projects[id].title||id)+'</option>').join("")+'</select><p class="cms-help">Cada projeto pode conter capa desktop, capa mobile e várias mídias.</p></aside><div class="cms-project-main"><div class="cms-pair">'+field("Nome do projeto","cms-project-title",p.title)+field("Identificador","cms-project-id",STATE.project==="new"?"Gerado automaticamente":STATE.project,"input","readonly")+'</div><div class="cms-pair"><label class="cms-field"><span>Categoria</span><select id="cms-project-category">'+["design","motion","sistemas"].map(x=>'<option value="'+x+'" '+(p.category===x?"selected":"")+'>'+({design:"Design Digital",motion:"Motion Design",sistemas:"Sistemas"}[x])+'</option>').join("")+'</select></label><label class="cms-field"><span>Estado</span><select id="cms-project-status">'+["concluído","em desenvolvimento","protótipo"].map(x=>'<option '+(p.status===x?"selected":"")+'>'+x+'</option>').join("")+'</select></label></div>'+field("Descrição curta","cms-project-description",p.description,"textarea","rows=3")+'<label class="cms-check"><input id="cms-project-visible" type="checkbox" '+(p.visible!==false?"checked":"")+'> Mostrar projeto no site</label><div class="cms-divider"></div><div class="cms-editor-head"><h3>Capa do projeto</h3><div class="cms-device"><button id="cms-desktop" class="'+(STATE.device==="desktop"?"selected":"")+'">Desktop</button><button id="cms-mobile" class="'+(STATE.device==="mobile"?"selected":"")+'">Mobile</button></div></div>'+mediaEditor(p.cover?.[STATE.device]||null,"project")+'<div class="cms-divider"></div><h3>Galeria do projeto</h3><p class="cms-help">As imagens e vídeos adicionados serão exibidos na visualização ampliada do trabalho.</p><div class="cms-project-media-list">'+(p.media||[]).map((a,i)=>'<div class="cms-project-file"><span>'+E(a.name||a.path||"Mídia")+'</span><button data-remove-project-media="'+i+'">Remover</button></div>').join("")+'</div><div class="cms-media-controls"><select id="cms-gallery-select"><option value="">Escolher da biblioteca</option>'+STATE.assets.map(a=>'<option value="'+E(a.id)+'">'+E(a.name)+'</option>').join("")+'</select><button id="cms-add-project-media">Adicionar</button></div><div class="cms-savebar"><span>As alterações só aparecem no site após publicar.</span><button id="cms-save-project">Salvar rascunho</button><button id="cms-publish-project" class="primary">Publicar projeto ↗</button></div></div></div>';
 const modify=fn=>{const d=COPY(projectDoc());fn(d);updateProjectDoc(d)};
 ["title","description"].forEach(k=>$("#cms-project-"+k).oninput=e=>modify(d=>d[k]=e.target.value));
 ["category","status"].forEach(k=>$("#cms-project-"+k).onchange=e=>modify(d=>d[k]=e.target.value));
 $("#cms-project-visible").onchange=e=>modify(d=>d.visible=e.target.checked);
 $("#cms-project-select").onchange=e=>{STATE.project=e.target.value;render()};
 $("#cms-new-project").onclick=()=>{STATE.project="new";STATE.projects.new={title:"",category:"design",description:"",status:"concluído",visible:true,cover:{desktop:null,mobile:null},media:[]};render()};
 $("#cms-desktop").onclick=()=>{STATE.device="desktop";render()};
 $("#cms-mobile").onclick=()=>{STATE.device="mobile";render()};
 wireMediaControls(asset=>{modify(d=>{d.cover??={desktop:null,mobile:null};d.cover[STATE.device]=asset});render()});
 document.querySelectorAll("[data-remove-project-media]").forEach(btn=>btn.onclick=()=>{modify(d=>d.media.splice(Number(btn.dataset.removeProjectMedia),1));render()});
 $("#cms-add-project-media").onclick=()=>{const row=STATE.assets.find(x=>x.id===$("#cms-gallery-select").value);if(!row)return notify("Selecione uma mídia",true);modify(d=>{d.media??=[];d.media.push(mediaAsset(row))});render()};
 $("#cms-save-project").onclick=()=>saveProject(false);
 $("#cms-publish-project").onclick=async()=>{const id=await ensureProjectKey();if(id)publish("project",id)};
 previewMedia(p.cover?.[STATE.device]||null)
}
async function ensureProjectKey(){
 const p=projectDoc();if(!p.title?.trim()){notify("Informe o nome do projeto",true);return null}
 if(STATE.project==="new"){
 const id="projeto-"+crypto.randomUUID().slice(0,12);
 STATE.projects[id]=COPY(p);delete STATE.projects.new;STATE.project=id;
 }
 return STATE.project
}
async function saveProject(silent=false){
 const id=await ensureProjectKey();if(!id)return null;
 const p=projectDoc();
 try{await upsert("project",id,p);if(!silent){notify("Projeto salvo como rascunho");render()};return id}catch(e){notify(e.message,true);throw e}
}
function renderLibrary(){
 $("#cms-content").innerHTML='<div class="cms-project-header"><div><h2>Biblioteca de mídias</h2><p>Imagens e vídeos armazenados no projeto noBRon V2.</p></div><label class="cms-upload">+ Enviar arquivo<input id="cms-library-upload" type="file" accept="image/*,video/mp4,video/webm" multiple></label></div><div class="cms-library-grid">'+(STATE.assets.length?STATE.assets.map(x=>'<div class="cms-media-card"><div class="cms-media-thumb" data-preview-path="'+E(x.path)+'"><span>'+E(x.mime?.startsWith("video")?"VÍDEO":"IMAGEM")+'</span></div><div class="cms-media-name">'+E(x.name)+'</div><small>'+Math.round((x.bytes||0)/1024)+' KB</small></div>').join(""):'<div class="cms-empty">Biblioteca vazia. Envie a primeira mídia.</div>')+'</div>';
 $("#cms-library-upload").onchange=async e=>{const files=[...e.target.files];for(const file of files){try{await uploadFile(file);notify(file.name+" enviado")}catch(err){notify(file.name+": "+err.message,true)}}render()};
 document.querySelectorAll("[data-preview-path]").forEach(async box=>{const row=STATE.assets.find(a=>a.path===box.dataset.previewPath);if(!row)return;let u=STATE.previewURLs.get(row.path);if(!u){try{const r=await fetch(baseUrl+"/storage/v1/object/authenticated/nobron-drafts/"+row.path.split("/").map(encodeURIComponent).join("/"),{headers:{apikey:publishable,Authorization:"Bearer "+AUTH()}});if(r.ok){u=URL.createObjectURL(await r.blob());STATE.previewURLs.set(row.path,u)}}catch{}}if(u)box.innerHTML=row.mime?.startsWith("video")?'<video src="'+E(u)+'" muted playsinline preload="metadata"></video>':'<img loading="lazy" src="'+E(u)+'" alt="'+E(row.name)+'">'})
}
function renderPublish(){
 const entries=Object.entries(pages);
 $("#cms-content").innerHTML='<div class="cms-project-header"><div><h2>Publicação</h2><p>Revise os rascunhos antes de alterar o conteúdo público.</p></div></div><div class="cms-publication-list">'+entries.map(([id,p])=>'<div><div><b>'+E(p.label)+'</b><small>'+ (STATE.drafts["page:"+id]?"Rascunho salvo":"Sem rascunho") +' · '+ (STATE.published["page:"+id]?"Publicado":"Conteúdo padrão") +'</small></div><button data-publish-page="'+id+'" '+(!STATE.drafts["page:"+id]?"disabled":"")+'>Publicar</button></div>').join("")+'</div><h2 class="cms-subtitle">Histórico de versões</h2><div class="cms-publication-list">'+(STATE.versions.length?STATE.versions.map(v=>'<div><div><b>'+E(v.kind)+" · "+E(v.key)+'</b><small>'+E(new Date(v.created_at).toLocaleString("pt-BR"))+'</small></div><span>Versão '+v.id+'</span></div>').join(""):'<p>O histórico aparecerá após a primeira atualização de conteúdo publicado.</p>')+'</div>';
 document.querySelectorAll("[data-publish-page]").forEach(btn=>btn.onclick=()=>publish("page",btn.dataset.publishPage))
}
function render(){
 if(!$("#cms-content"))return;
 document.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("selected",b.dataset.tab===STATE.tab));
 $("#cms-title").textContent=({pages:"Páginas",projects:"Projetos",library:"Biblioteca",publish:"Publicação"})[STATE.tab];
 if(STATE.tab==="pages")renderPages();
 if(STATE.tab==="projects")renderProjects();
 if(STATE.tab==="library")renderLibrary();
 if(STATE.tab==="publish")renderPublish();
}
async function mount(session){
 if(!session?.access_token)return;
 STATE.session=session;document.body.classList.add("cms-open");
 shell();$("#cms-content").innerHTML='<div class="cms-empty">Carregando conteúdo...</div>';
 try{await load();render()}catch(err){$("#cms-content").innerHTML='<div class="cms-empty"><b>Não foi possível abrir o painel.</b><p>'+E(err.message)+'</p><button id="cms-retry">Tentar novamente</button></div>';$("#cms-retry").onclick=()=>mount(STATE.session)}
}
function unmount(){document.body.classList.remove("cms-open")}
window.nobronCms={mount,unmount};
})();