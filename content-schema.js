(function(){
"use strict";
const S=(id,type,title,description="",extra={})=>({id,type,title,description,visible:true,media:{desktop:null,mobile:null},device:{desktop:{position:50,zoom:100,divider:"curve"},mobile:{position:50,zoom:100,divider:"curve"}},...extra});
const pages={
 home:{label:"Home",route:"/",sections:[
  S("hero","homeHero","Design. Motion. Sistemas.","Artes de divulgação, vídeos e sistemas para eventos, baladas, pubs e artistas."),
  S("solucoes","homeServices","Nossos serviços.","Design Digital, Motion Design e Sistemas."),
  S("destaques","homeWork","Trabalhos realizados.","Uma seleção dos projetos da noBRon."),
  S("final","contactBand","Solicite um orçamento.","Conte o que precisa para o seu evento.")
 ]},
 solutions:{label:"Soluções",route:"/solucoes",sections:[
  S("hero","solutionsHero","Nossos serviços.","Materiais de divulgação, vídeos e sistemas para eventos e artistas."),
  S("design","serviceFeature","Design Digital","Artes para stories, feed, flyers, line-ups, banners, outdoors e painéis digitais.",{service:"design"}),
  S("motion","serviceFeature","Motion Design","Flyers animados, teasers, chamadas e vídeos para redes sociais e telões.",{service:"motion"}),
  S("sistemas","serviceFeature","Sistemas","Sites, sistemas de portaria, controle de estoque e media kits digitais.",{service:"sistemas"}),
  S("projetos","compactWork","Trabalhos realizados.","Veja exemplos dos serviços.")
 ]},
 design:{label:"Design Digital",route:"/solucoes/design",sections:[
  S("hero","designHero","Material de divulgação para eventos.","Criamos artes para festas, shows, baladas, pubs e artistas."),
  S("materiais","designFormats","Materiais que produzimos.","Stories, feed, flyers, cartazes, line-ups, banners, capas, outdoors e artes para ingressos."),
  S("galeria","designGallery","Artes realizadas.","Projetos de Design Digital da noBRon."),
  S("final","contactBand","Solicite sua arte.","Envie os detalhes do evento.")
 ]},
 motion:{label:"Motion Design",route:"/solucoes/motion",sections:[
  S("hero","motionHero","Vídeos e animações para eventos.","Flyers animados, teasers, vinhetas e vídeos de divulgação."),
  S("formatos","motionFormats","Onde aplicamos.","Stories, reels, redes sociais, telões e painéis de LED."),
  S("reels","motionGallery","Vídeos realizados.","Trabalhos de Motion Design da noBRon."),
  S("final","contactBand","Solicite um vídeo.","Envie as informações da campanha.")
 ]},
 sistemas:{label:"Sistemas",route:"/solucoes/sistemas",sections:[
  S("hero","systemsHero","Sites e sistemas para eventos.","Ferramentas digitais para gestão, operação e apresentação."),
  S("operacao","systemsOperations","Gestão de eventos.","Sistemas de portaria, vendas, cortesias e controle de estoque."),
  S("digital","systemsDigital","Sites e páginas.","Sites para eventos, páginas para artistas e media kits digitais."),
  S("cases","systemsGallery","Sistemas desenvolvidos.","Projetos, telas e funcionalidades disponíveis."),
  S("final","contactBand","Solicite um sistema.","Conte o que você precisa desenvolver.")
 ]},
 projects:{label:"Projetos",route:"/projetos",sections:[
  S("hero","projectsHero","Trabalhos realizados.","Artes, vídeos e sistemas desenvolvidos pela noBRon."),
  S("galeria","allGallery","Explore os projetos.","Filtre por Design, Motion ou Sistemas."),
  S("final","contactBand","Solicite um orçamento.","Fale sobre seu próximo projeto.")
 ]},
 about:{label:"Sobre",route:"/sobre",sections:[
  S("hero","aboutHero","Sobre a noBRon.","Estúdio digital especializado em Design, Motion e Sistemas para eventos e artistas."),
  S("quem","aboutText","O que fazemos.","Criamos materiais de divulgação, vídeos e ferramentas digitais para eventos, casas noturnas e artistas."),
  S("areas","aboutAreas","Nossos serviços.","Design Digital, Motion Design e Sistemas."),
  S("final","contactBand","Conheça nosso trabalho.","Veja os projetos do estúdio.")
 ]},
 contact:{label:"Contato",route:"/contato",sections:[
  S("hero","contactHero","Solicite um orçamento.","Informe o que você precisa para receber uma proposta personalizada."),
  S("formulario","contactForm","Seu projeto.","Selecione o serviço e descreva sua solicitação."),
  S("redes","contactLinks","Contato direto.","Consulte nossos canais oficiais.")
 ]}
};
const services=[
 {id:"design",name:"Design Digital",path:"/solucoes/design",description:"Artes para stories, feed, flyers, line-ups e outdoors."},
 {id:"motion",name:"Motion Design",path:"/solucoes/motion",description:"Flyers animados, teasers e vídeos de divulgação."},
 {id:"sistemas",name:"Sistemas",path:"/solucoes/sistemas",description:"Sites, sistemas de portaria e ferramentas de gestão."}
];
window.NOBRON_SCHEMA={pages,services,baseUrl:"https://fsaqzbwxhjpnfgqxdvnz.supabase.co",publishable:"sb_publishable_fq9iLhiCu0i579uBDl4rBg_WGOw7N2n"};
})();