'use strict';
// Do not put privileged Supabase keys, the activation code, or the admin email here.
const SUPABASE_URL='https://fsaqzbwxhjpnfgqxdvnz.supabase.co';
const PUBLIC_KEY='sb_publishable_fq9iLhiCu0i579uBDl4rBg_WGOw7N2n';
const FN=SUPABASE_URL+'/functions/v1/nobron-owner-auth';
const STORAGE='nobron-admin-session';
const sections=['loading','setup','login','forgot','reset','inside'];
const el=id=>document.getElementById(id);
const state={session:null};
let recoveryToken=null;
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
function consumeRecoveryLink(){
 const params=new URLSearchParams(location.hash.slice(1));
 const token=params.get('access_token');
 const error=params.get('error');
 const isRecovery=params.get('type')==='recovery';
 if(!isRecovery&&!error)return {found:false};
 // Fragments carry credentials; remove them from visible URL immediately.
 history.replaceState(null,'',location.pathname+location.search);
 if(error)return {found:true,error:true};
 if(!token||!/^[A-Za-z0-9._-]{20,4096}$/.test(token))return {found:true,error:true};
 return {found:true,token};
}
async function init(){
 show('loading');
 const recovery=consumeRecoveryLink();
 try{
   const status=await call('status');
   if(!status.configured){clear();show('setup');return;}
   if(recovery.found){
     clear();
     if(recovery.token){
       const check=await call('verify',{},recovery.token).catch(()=>null);
       if(check?.authorized){recoveryToken=recovery.token;show('reset');return;}
     }
     show('login');
     message('login-message','O link de recuperação expirou ou não é válido. Solicite outro.',false);
     return;
   }
   if(await restore()){show('inside');return;}
   show('login');
 }catch{
   el('loading').textContent='Não foi possível verificar o acesso. Atualize a página.';
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

el('forgot-trigger').addEventListener('click',()=>{message('forgot-message','');show('forgot')});
el('forgot-back').addEventListener('click',()=>show('login'));
el('reset-back').addEventListener('click',()=>{recoveryToken=null;show('login')});
el('forgot-form').addEventListener('submit',async(e)=>{
 e.preventDefault();
 if(!e.currentTarget.reportValidity())return;
 const email=el('forgot-email').value.trim().toLowerCase();
 const button=el('forgot-submit');
 button.disabled=true;
 message('forgot-message','');
 try{
   const redirectTo='https://nobroneventos.vercel.app/admin';
   const response=await fetch(SUPABASE_URL+'/auth/v1/recover?redirect_to='+encodeURIComponent(redirectTo),{
     method:'POST',cache:'no-store',
     headers:{apikey:PUBLIC_KEY,'Content-Type':'application/json'},
     body:JSON.stringify({email})
   });
   if(response.status===429)throw new Error('Muitas solicitações. Tente novamente mais tarde.');
   if(!response.ok)throw new Error('Não foi possível enviar o link. Confira o e-mail e tente novamente.');
   // Same response for any address; no disclosure of account ownership.
   message('forgot-message','Se este for o e-mail cadastrado, você receberá um link para redefinir sua senha.',true);
   el('forgot-email').value='';
 }catch(error){message('forgot-message',error.message||'Falha ao solicitar recuperação.')}
 finally{button.disabled=false;}
});
el('reset-form').addEventListener('submit',async(e)=>{
 e.preventDefault();
 const form=el('reset-form');
 if(!recoveryToken)return message('reset-message','O link expirou. Solicite outro.');
 if(!form.reportValidity())return;
 const password=el('reset-password').value;
 if(password!==el('reset-confirm').value)return message('reset-message','As senhas não coincidem.');
 const button=el('reset-submit');button.disabled=true;message('reset-message','');
 try{
   const verified=await call('verify',{},recoveryToken);
   if(!verified.authorized)throw new Error('Link de recuperação inválido.');
   const response=await fetch(SUPABASE_URL+'/auth/v1/user',{
     method:'PUT',cache:'no-store',
     headers:{apikey:PUBLIC_KEY,Authorization:'Bearer '+recoveryToken,'Content-Type':'application/json'},
     body:JSON.stringify({password})
   });
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data.msg||data.message||'Não foi possível atualizar a senha.');
   const oldToken=recoveryToken;
   recoveryToken=null;
   form.reset();
   try{await fetch(SUPABASE_URL+'/auth/v1/logout?scope=global',{
     method:'POST',headers:{apikey:PUBLIC_KEY,Authorization:'Bearer '+oldToken}
   })}catch{}
   clear();show('login');
   message('login-message','Senha redefinida. Entre com sua nova senha.',true);
 }catch(error){message('reset-message',error.message||'Não foi possível atualizar. Solicite outro link.')}
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
