// Publishing endpoint. Requires an authenticated Supabase owner token.
// Service credentials never leave the Edge Function.
const URL=Deno.env.get("SUPABASE_URL")||"";
const KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const HEAD={"content-type":"application/json","cache-control":"no-store","access-control-allow-origin":"*","access-control-allow-methods":"POST, OPTIONS","access-control-allow-headers":"authorization, apikey, content-type","x-content-type-options":"nosniff"};
const response=(obj:any,status=200)=>new Response(JSON.stringify(obj),{status,headers:HEAD});
const headers=(more:Record<string,string>={})=>({"apikey":KEY,"authorization":"Bearer "+KEY,...more});
async function request(path:string,init:RequestInit={}){
 const r=await fetch(URL+path,{...init,headers:{...headers(),...(init.headers||{})}});
 if(!r.ok)throw new Error("Remote operation rejected: "+r.status);
 return r;
}
function encoded(p:string){return p.split("/").map(encodeURIComponent).join("/");}
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:HEAD});
 if(req.method!=="POST")return response({error:"Método inválido"},405);
 if(!URL||!KEY)return response({error:"Serviço indisponível"},503);
 try{
   const bearer=req.headers.get("authorization")||"";
   if(!/^Bearer [A-Za-z0-9._-]+$/.test(bearer))return response({error:"Entre novamente no painel"},401);
   const userResponse=await fetch(URL+"/auth/v1/user",{headers:{...headers(),authorization:bearer}});
   if(!userResponse.ok)return response({error:"Sessão expirada"},401);
   const user=await userResponse.json();
   if(!user?.id)return response({error:"Sessão inválida"},401);
   const owners=await (await request("/rest/v1/cms_admins?select=role&user_id=eq."+encodeURIComponent(user.id))).json();
   if(!Array.isArray(owners)||owners[0]?.role!=="owner")return response({error:"Acesso não autorizado"},403);
   const raw=await req.text();
   if(raw.length>4096)return response({error:"Requisição inválida"},413);
   const input=JSON.parse(raw);
   const kind=String(input.kind||"");
   const key=String(input.key||"");
   if(!["page","project","global"].includes(kind)||!/^[-_a-z0-9]{1,100}$/.test(key))return response({error:"Conteúdo inválido"},400);
   const search=new URLSearchParams({select:"payload",kind:"eq."+kind,key:"eq."+key,limit:"1"});
   const drafts=await (await request("/rest/v1/cms_drafts?"+search.toString())).json();
   if(!Array.isArray(drafts)||!drafts.length)return response({error:"Salve o rascunho antes de publicar"},404);
   const payload=drafts[0].payload;
   if(!payload||typeof payload!=="object"||Array.isArray(payload)||JSON.stringify(payload).length>200000)return response({error:"Rascunho inválido"},400);
   let transferred=0;
   const done=new Map<string,string>();
   async function makePublic(path:string):Promise<string>{
     if(!/^[a-zA-Z0-9_./-]{1,300}$/.test(path)||path.includes("..")||path.startsWith("/"))throw Error("Caminho de arquivo inválido");
     if(done.has(path))return done.get(path)!;
     if(++transferred>40)throw Error("Muitas mídias na publicação");
     const file=await request("/storage/v1/object/nobron-drafts/"+encoded(path));
     const mime=(file.headers.get("content-type")||"application/octet-stream").split(";")[0];
     if(!/^(image\/(jpeg|png|webp|avif|gif)|video\/(mp4|webm))$/.test(mime))throw Error("Formato de mídia inválido");
     const bytes=await file.arrayBuffer();
     if(bytes.byteLength>104857600)throw Error("Mídia acima do limite");
     const up=await fetch(URL+"/storage/v1/object/nobron-public/"+encoded(path),{
        method:"POST",headers:headers({"content-type":mime,"x-upsert":"false"}),body:bytes
     });
     if(!up.ok&&up.status!==409)throw Error("Não foi possível publicar uma mídia");
     const publicUrl=URL+"/storage/v1/object/public/nobron-public/"+encoded(path);
     done.set(path,publicUrl);return publicUrl;
   }
   async function normalize(value:any,depth=0):Promise<any>{
      if(depth>20)throw Error("Estrutura inválida");
      if(Array.isArray(value))return Promise.all(value.map(v=>normalize(v,depth+1)));
      if(value&&typeof value==="object"){
        const obj={...value};
        if(obj.bucket==="nobron-drafts"&&typeof obj.path==="string"){
           obj.src=await makePublic(obj.path);obj.bucket="nobron-public";
        }
        for(const k of Object.keys(obj))if(k!=="bucket"&&k!=="src")obj[k]=await normalize(obj[k],depth+1);
        return obj;
      }
      return value;
   }
   const published=await normalize(payload);
   if(JSON.stringify(published).includes("nobron-drafts"))throw Error("Existe mídia privada no conteúdo");
   await request("/rest/v1/rpc/cms_commit_published",{
     method:"POST",headers:headers({"content-type":"application/json"}),
     body:JSON.stringify({p_kind:kind,p_key:key,p_payload:published,p_actor:user.id})
   });
   return response({ok:true,kind,key,mediaTransferred:transferred});
 }catch(e){
   const msg=e instanceof Error?e.message:"Falha inesperada";
   if(/Rascunho inválido|Muitas mídias|Formato de mídia inválido|Mídia acima do limite|Caminho de arquivo inválido|Existe mídia privada|Não foi possível publicar/.test(msg))
      return response({error:msg},400);
   return response({error:"Não foi possível publicar. Verifique o rascunho e tente novamente."},500);
 }
});
