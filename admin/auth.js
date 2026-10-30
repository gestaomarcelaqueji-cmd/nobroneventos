'use strict';
// Do not put privileged Supabase keys, the activation code, or the admin email here.
const SUPABASE_URL='https://fsaqzbwxhjpnfgqxdvnz.supabase.co';
const PUBLIC_KEY='sb_publishable_fq9iLhiCu0i579uBDl4rBg_WGOw7N2n';
const FN=SUPABASE_URL+'/functions/v1/nobron-owner-auth';
const STORAGE='nobron-admin-session';
const sections=['loading','setup','login','inside'];
const el=id=>document.getElementById(id);
const state={session:null};
function show(id){
 for(const s of sections)el(s).hidden=s!==id;
 if(id==='inside' && state.session?.access_token)window.nobronCms?.mount(state.session);
 else window.nobronCms?.unmount();
}
function message(id,value,ok=false){const node=el(id);node.textContent=value;node.classList.toggle('ok',ok);}
function store(session){
 state.session=session;
 try{sessionStorage.setItem(STORAGE,JSON.stringify(session));}catch{}
}
function clear(){
 state.session=null;
 try{sessionStorage.removeItem(STORAGE);}catch{}
}
function recoverStored(){
 try{const obj=JSON.parse(sessionStorage.getItem(STORAGE)||'null');if(obj&&typeof obj.access_token==='string'&&typeof obj.refresh_token==='string')return obj;}catch{}
 return null;
}
async function call(action,params={},token=null){
 const controller=new AbortController();
 const stop=setTimeout(()=>controller.abort(),15000);
 try{
   const response=await fetch(FN,{method:'POST',cache:'no-store',signal:controller.signal,headers:{
     'Content-Type':'application/json',
     'apikey':PUBLIC_KEY,
     ...(token?{Authorization:'Bearer '+token}:{})
   },body:JSON.stringify({action,...params})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data.error||'Não foi possível concluir a solicitação.');
   return data;
 }finally{clearTimeout(stop);}
}
async function refreshSession(session){
 const response=await fetch(SUPABASE_URL+'/auth/v1/token?grant_type=refresh_token',{
   method:'POST',cache:'no-store',
   headers:{'Content-Type':'application/json','apikey':PUBLIC_KEY},
   body:JSON.stringify({refresh_token:session.refresh_token})
 });
 if(!response.ok)throw new Error('Sessão expirada.');
 const data=await response.json();
 return {access_token:data.access_token,refresh_token:data.refresh_token,expires_in:data.expires_in,token_type:data.token_type};
}
async function restore(){
 const saved=recoverStored();if(!saved)return false;
 try{
  let value=saved;
  try{const verified=await call('verify',{},value.access_token);if(verified.authorized){store(value);return true;}}catch{}
  value=await refreshSession(saved);
  const verified=await call('verify',{},value.access_token);
  if(verified.authorized){store(value);return true;}
 }catch{}
 clear();return false;
}
async function init(){
 show('loading');
 try{
   const status=await call('status');
   if(!status.configured){clear();show('setup');return;}
   if(await restore()){show('inside');return;}
   show('login');
 }catch{
   el('loading').innerHTML='<p>Não foi possível verificar o acesso. Atualize a página.</p>';
 }
}
el('setup-form').addEventListener('submit',async(e)=>{
 e.preventDefault();
 const form=e.currentTarget; if(!form.reportValidity())return;
 const password=el('setup-pass').value,confirm=el('setup-confirm').value;
 if(password!==confirm){message('setup-message','As senhas não coincidem.');return;}
 const button=el('setup-submit');button.disabled=true;
 message('setup-message','');
 try{
  const data=await call('setup',{
   code:el('setup-code').value.trim().toLowerCase(),
   email:el('setup-email').value.trim(),
   password
  });
  form.reset();
  if(data.session){store(data.session);show('inside');}
  else{show('login');message('login-message','Acesso criado. Digite sua senha.',true);}
 }catch(error){message('setup-message',error.message||'Não foi possível ativar.');}
 finally{button.disabled=false;}
});
el('login-form').addEventListener('submit',async(e)=>{
 e.preventDefault();
 const button=el('login-submit');button.disabled=true;
 message('login-message','');
 try{
  const data=await call('login',{password:el('login-pass').value});
  if(!data.session?.access_token)throw new Error('Não foi possível iniciar a sessão.');
  store(data.session);el('login-pass').value='';show('inside');
 }catch(error){message('login-message',error.message||'Falha no login.');}
 finally{button.disabled=false;}
});
async function logoutAdmin(){
 const session=state.session;
 clear();show('login');
 if(session?.access_token){
  // Best-effort remote token revocation; UI is logged out regardless of network.
  try{await fetch(SUPABASE_URL+'/auth/v1/logout',{method:'POST',
   headers:{apikey:PUBLIC_KEY,Authorization:'Bearer '+session.access_token}});}catch{}
 }
}
window.nobronAdminLogout=logoutAdmin;
el('logout').addEventListener('click',logoutAdmin);
init();
