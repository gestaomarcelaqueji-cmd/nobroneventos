(()=>{
"use strict";
// Six public pages. Media slots are independent and editable without creating a "project".
const S=(id,type,title,description="",extra={})=>({
 id,type,title,description,visible:true,
 media:{desktop:null,mobile:null},gallery:{desktop:[],mobile:[]},
 device:{desktop:{position:50,zoom:100,divider:"curve"},mobile:{position:50,zoom:100,divider:"curve"}},
 ...extra
});
const pages={
 home:{label:"Home",route:"/",sections:[
  S("hero","hero","Design. Motion. Sistemas.","Divulgação e soluções digitais para eventos, baladas, pubs e artistas."),
  S("destaques","gallery","Trabalhos em destaque.","Uma seleção de artes, vídeos e interfaces."),
  S("servicos","services","O que fazemos.","Design Digital, Motion Design e Sistemas."),
  S("chamada","cta","Seu evento precisa aparecer.","Solicite uma proposta para seu projeto.")
 ]},
 solutions:{label:"Soluções",route:"/solucoes",sections:[
  S("hero","hero","Divulgação e tecnologia para eventos.","Do material de divulgação aos sistemas de gestão."),
  S("design","feature","Design Digital","Criação de flyers e materiais gráficos para divulgação de eventos, festas, atrações, produtos, serviços, cardápios, preços, promoções e comunicados. As artes são desenvolvidas de acordo com a identidade visual de cada projeto e entregues nos formatos e dimensões necessários para publicação em redes sociais, compartilhamento digital ou impressão.",{service:"design"}),
  S("motion","feature","Motion Design","Criação de flyers animados, teasers, vídeos promocionais e conteúdos em movimento para divulgação de eventos, atrações, produtos, serviços, ofertas e campanhas. Os materiais são produzidos e entregues nos formatos e proporções adequados para stories, reels, feeds, telões e outras plataformas de exibição.",{service:"motion"}),
  S("sistemas","feature","Sistemas","Desenvolvimento de sites, páginas institucionais e sistemas personalizados para empresas, estabelecimentos e organizadores de eventos. Soluções para apresentação de serviços, cadastros, controle de estoque, portaria, gerenciamento de informações e processos administrativos, conforme as necessidades de cada projeto.",{service:"sistemas"})
 ]},
 design:{label:"Design Digital",route:"/solucoes/design",sections:[
  S("hero","hero","Material de divulgação para eventos.","Artes para festas, shows, baladas, pubs e artistas."),
  S("formatos","formats","Onde você divulga.","Story, feed, flyer, line-up, banner, outdoor, ingresso e painel digital.",{items:["Stories e feed","Flyers e line-ups","Banners e outdoors","Ingressos e painéis digitais"]}),
  S("galeria","gallery","Artes realizadas.","Veja os materiais de divulgação.")
 ]},
 motion:{label:"Motion Design",route:"/solucoes/motion",sections:[
  S("hero","hero","Vídeos para divulgar seu evento.","Flyers animados, teasers, vinhetas e chamadas de atrações."),
  S("formatos","formats","Onde os vídeos aparecem.","Reels, stories, telões e painéis de LED.",{items:["Reels e stories","Teasers","Vinhetas e chamadas","Telões e LED"]}),
  S("galeria","gallery","Vídeos realizados.","Veja os trabalhos em movimento.")
 ]},
 sistemas:{label:"Sistemas",route:"/solucoes/sistemas",sections:[
  S("hero","hero","Sites e sistemas para eventos.","Ferramentas digitais para organizar e operar eventos."),
  S("funcoes","formats","O que desenvolvemos.","Portaria, vendas, estoque, sites de eventos e páginas de artistas.",{items:["Portaria e vendas","Controle de estoque","Sites para eventos","Páginas e media kits"]}),
  S("galeria","gallery","Sistemas desenvolvidos.","Telas e funcionalidades dos projetos.")
 ]},
 contact:{label:"Contato",route:"/contato",sections:[
  S("hero","hero","Peça seu orçamento.","Conte o que você precisa para seu evento."),
  S("atendimento","contact","Vamos conversar.","Selecione um canal para enviar sua solicitação.",{email:"",whatsapp:"",instagram:""})
 ]}
};
const services=[
 {id:"design",name:"Design Digital",path:"/solucoes/design",description:"Artes para story, feed, flyers, line-up e outdoor."},
 {id:"motion",name:"Motion Design",path:"/solucoes/motion",description:"Flyers animados, teasers e vídeos de divulgação."},
 {id:"sistemas",name:"Sistemas",path:"/solucoes/sistemas",description:"Sites, portaria, controle de estoque e ferramentas digitais."}
];
window.NOBRON_SCHEMA={
 pages,services,
 baseUrl:"https://fsaqzbwxhjpnfgqxdvnz.supabase.co",
 publishable:"sb_publishable_fq9iLhiCu0i579uBDl4rBg_WGOw7N2n"
};
})();
