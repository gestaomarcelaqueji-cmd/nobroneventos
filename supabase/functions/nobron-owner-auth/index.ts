// noBRon owner-only bootstrap and password login.
// This function accepts unauthenticated requests by design but validates actions itself.
// Never log credentials, tokens, or bootstrap codes.
const URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const ANON = Deno.env.get("SUPABASE_ANON_KEY") || "";
const MAX_BODY = 4096;
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
  "Access-Control-Max-Age": "600",
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer"
};
const json = (data: unknown, status=200) =>
  new Response(JSON.stringify(data), {status,headers:cors});
const service = async (endpoint: string, args: unknown) => {
  const r = await fetch(URL + "/rest/v1/rpc/" + endpoint, {
    method: "POST",
    headers: {apikey:SERVICE,Authorization:"Bearer "+SERVICE,"Content-Type":"application/json"},
    body: JSON.stringify(args)
  });
  if (!r.ok) throw new Error("Private RPC failure " + r.status);
  return await r.json();
};
const auth = async (route: string, body: unknown, key: string) => {
  const r=await fetch(URL+"/auth/v1/"+route,{
    method:"POST",headers:{apikey:key,Authorization:"Bearer "+key,"Content-Type":"application/json"},
    body:JSON.stringify(body)
  });
  const data=await r.json().catch(()=>({}));
  return {ok:r.ok,data,status:r.status};
};
const sanitizeSession=(s:any) => ({
  access_token:s.access_token,
  refresh_token:s.refresh_token,
  expires_in:s.expires_in,
  token_type:s.token_type
});
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, {status:204,headers:cors});
  if (req.method !== "POST") return json({error:"Método inválido"},405);
  if (!URL || !SERVICE || !ANON) return json({error:"Serviço indisponível"},503);
  if (Number(req.headers.get("content-length")||0) > MAX_BODY) return json({error:"Requisição muito grande"},413);
  let input:any;
  try {
    const raw=await req.text();
    if(raw.length > MAX_BODY) return json({error:"Requisição muito grande"},413);
    input=JSON.parse(raw);
    if(!input||typeof input!=="object"||Array.isArray(input)) throw Error();
  }catch{return json({error:"Dados inválidos"},400);}
  try {
    if(input.action==="status"){
      const s=await service("cms_auth_status",{});
      return json({configured:!!s?.configured});
    }
    if(input.action==="setup"){
      const code=String(input.code||"");
      const email=String(input.email||"").trim().toLowerCase();
      const password=String(input.password||"");
      if(!/^[a-f0-9]{64}$/.test(code)|| !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length>254 ||
         password.length<14 || password.length>128)
        return json({error:"Confira o código, o e-mail e a senha (mínimo de 14 caracteres)."},400);
      const available=await service("cms_auth_check",{p_code:code});
      if(!available) return json({error:"Código de ativação inválido ou já utilizado."},403);
      const created=await auth("admin/users",{email,password,email_confirm:true},SERVICE);
      if(!created.ok || !created.data?.id) return json({error:"Não foi possível criar o acesso. Verifique o e-mail e tente novamente."},400);
      const userId=created.data.id;
      let claimed=false;
      try { claimed=await service("cms_auth_claim",{p_code:code,p_user:userId,p_email:email}); }
      catch {claimed=false;}
      if(!claimed){
        await fetch(URL+"/auth/v1/admin/users/"+encodeURIComponent(userId),{
          method:"DELETE",headers:{apikey:SERVICE,Authorization:"Bearer "+SERVICE}
        }).catch(()=>{});
        return json({error:"A instalação já foi concluída ou ocorreu um conflito. Atualize a página."},409);
      }
      const signed=await auth("token?grant_type=password",{email,password},ANON);
      if(!signed.ok||!signed.data?.access_token) return json({configured:true,message:"Acesso criado. Entre com sua senha."});
      return json({configured:true,session:sanitizeSession(signed.data)});
    }
    if(input.action==="login"){
      const password=String(input.password||"");
      if(password.length<1 || password.length>128) return json({error:"Senha inválida."},401);
      // Persistent database throttle: global + IP. IP is only a secondary limit.
      const globalAllowed=await service("cms_auth_allow_attempt",{p_key:"login-global",p_limit:40,p_window_sec:900});
      const ip=(req.headers.get("cf-connecting-ip")||req.headers.get("x-real-ip")||"unknown").slice(0,80);
      const ipAllowed=await service("cms_auth_allow_attempt",{p_key:"login-ip:"+ip,p_limit:10,p_window_sec:900});
      if(!globalAllowed||!ipAllowed) return json({error:"Muitas tentativas. Tente novamente mais tarde."},429);
      const state=await service("cms_auth_identity",{});
      if(!state?.configured||!state?.email) return json({error:"Painel não configurado."},403);
      const signed=await auth("token?grant_type=password",{email:state.email,password},ANON);
      if(!signed.ok || !signed.data?.access_token ||
         signed.data?.user?.id!==state.user_id) return json({error:"Senha incorreta."},401);
      return json({session:sanitizeSession(signed.data)});
    }
    if(input.action==="verify"){
      const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
      if(!token || token.length>4096) return json({authorized:false},401);
      const state=await service("cms_auth_identity",{});
      if(!state?.configured) return json({authorized:false},401);
      const response=await fetch(URL+"/auth/v1/user",{
        headers:{apikey:ANON,Authorization:"Bearer "+token}
      });
      const user=response.ok?await response.json().catch(()=>null):null;
      return json({authorized:!!user?.id&&user.id===state.user_id},user?.id===state.user_id?200:401);
    }
    return json({error:"Ação inválida"},400);
  }catch(_error){
    return json({error:"Serviço temporariamente indisponível."},503);
  }
});