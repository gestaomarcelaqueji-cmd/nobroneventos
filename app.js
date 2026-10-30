'use strict';
/* noBRon V2: primeira versão de navegação e apresentação.
   O portfólio usa somente itens reais adicionados a data/projects.json. */
const NAV=[['Início','/','house'],['Soluções','/solucoes','layers'],['Projetos','/projetos','grid'],['Sobre','/sobre','info'],['Contato','/contato','mail']];
const SERVICES=[
 {id:'design',name:'Design Digital',path:'/solucoes/design',intro:'Material de divulgação para eventos.',desc:'Artes para stories, feed, flyers, line-ups, banners, outdoors e painéis digitais.',items:['Artes para stories e feed','Flyers e cartazes','Divulgação de line-ups','Banners e capas','Artes para outdoor','Painéis digitais','Artes para ingressos','Campanhas de divulgação']},
 {id:'motion',name:'Motion Design',path:'/solucoes/motion',intro:'Vídeos e animações para eventos.',desc:'Flyers animados, teasers, vinhetas e vídeos para redes sociais e telões.',items:['Flyers animados','Vídeos para stories e reels','Teasers de eventos','Chamadas de atrações','Vinhetas','Vídeos promocionais','Animações para painéis de LED']},
 {id:'sistemas',name:'Sistemas',path:'/solucoes/sistemas',intro:'Sites e sistemas para eventos.',desc:'Sites, sistemas de portaria, controle de estoque e media kits digitais.',items:['Sistemas de portaria','Controle de vendas','Gestão de cortesias','Controle de estoque','Sites para eventos','Páginas para artistas','Media kits digitais','Sistemas personalizados']}
];
const IMAGES={
 dj:'https://images.unsplash.com/photo-1571266028243-d220c6a7a157?auto=format&fit=crop&w=1600&q=82',
 crowd:'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1600&q=82',
 concert:'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=82',
 live:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1600&q=82'
};
let projects=[],filter='todos',opened=null,lastFocused=null;
const routes={'/':'home','/solucoes':'solutions','/solucoes/design':'design','/solucoes/motion':'motion','/solucoes/sistemas':'sistemas','/projetos':'projects','/sobre':'about','/contato':'contact'};
const clean=p=>p.length>1?p.replace(/\/+$/,''):'/';
const path=()=>routes[clean(location.pathname)]?clean(location.pathname):'/';
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(s,href,outline=false)=>'<a class="btn'+(outline?' btn-outline':'')+'" href="'+href+'">'+E(s)+' <span aria-hidden="true">↗</span></a>';
const label=s=>'<span class="eyebrow">'+E(s)+'</span>';
const title=(s,desc='',eyebrow='')=>'<div class="section-heading reveal">'+(eyebrow?label(eyebrow):'')+'<h2>'+E(s)+'</h2>'+(desc?'<p>'+E(desc)+'</p>':'')+'</div>';
const photo=(url,cls='',caption='Mídia de referência')=>'<div class="photo '+cls+'" data-reveal tabindex="0" role="button" aria-label="Revelar cores da mídia"><img src="'+E(url)+'" alt="'+E(caption)+'" loading="lazy"/><span class="photo-index">noBRon. / PRÉVIA VISUAL</span><span class="tap-hint">TOQUE PARA REVELAR</span></div>';
const divider=(shape='curve')=>'<div aria-hidden="true" class="section-divider '+shape+'"></div>';
const section=(content,light=true,cls='')=>'<section class="section '+(light?'light':'dark')+' '+cls+'"><div class="container">'+content+'</div></section>';
const service=id=>SERVICES.find(s=>s.id===id);
function icon(name){
 const paths={house:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',layers:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m8 9 4-3 4 3-4 3z"/><path d="M8 15h8"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>'};
 return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.grid)+'</svg>';
}
function header(){
 const route=path(), active=route.startsWith('/solucoes')?'/solucoes':route;
 return '<header class="site-header"><div class="container header-inner"><a class="brand" href="/" aria-label="noBRon, início">noBRon.</a><nav class="desktop-menu" aria-label="Menu principal">'+NAV.map(n=>'<a '+(active===n[1]?'aria-current="page"':'')+' href="'+n[1]+'">'+n[0]+'</a>').join('')+'</nav><button class="theme-toggle" type="button" aria-label="Alternar modo claro e escuro">◐</button></div></header>';
}
function mobileNav(){
 const route=path(),active=route.startsWith('/solucoes')?'/solucoes':route;
 return '<nav class="mobile-nav" aria-label="Navegação principal"><div class="glass-nav">'+NAV.map(n=>'<a href="'+n[1]+'" '+(active===n[1]?'aria-current="page"':'')+'>'+icon(n[2])+'<span>'+n[0]+'</span></a>').join('')+'</div></nav>';
}
function hero(head,desc,opts={}){
 let image=IMAGES[opts.image||'crowd'];
 return '<section class="hero dark"><div class="container hero-main"><div class="hero-copy reveal">'+label(opts.eyebrow||'ESTÚDIO DIGITAL')+'<h1>'+E(head)+'</h1><p>'+E(desc)+'</p><div class="actions">'+link(opts.cta||'Ver trabalhos',opts.href||'/projetos')+(opts.cta2?link(opts.cta2,opts.href2||'/solucoes',true):'')+'</div></div><div class="hero-media" data-depth>'+photo(image,'hero-image')+'<div class="floating-label">DESIGN <i>×</i> MOTION <i>×</i> SISTEMAS</div></div></div><div class="container hero-bottom"><span>EVENTOS · BALADAS · PUBS · ARTISTAS</span><a href="#conteudo">EXPLORAR ↓</a></div></section><div id="conteudo"></div>';
}
function serviceCards(){
 return '<div class="service-grid">'+SERVICES.map((s,i)=>'<article class="service-card reveal"><a href="'+s.path+'" class="service-visual"><div class="service-number">0'+(i+1)+'</div><div class="service-art art-'+s.id+'">'+(s.id==='sistemas'?'<div class="mock-screen"><span>EVENTOS</span><strong>Gestão</strong><div class="fake-stats"><b>Portaria</b><b>Vendas</b><b>Estoque</b></div></div>':'<div class="poster-stack"><div class="poster p1"></div><div class="poster p2"></div><div class="poster p3">'+(s.id==='motion'?'▶':'')+'</div></div>')+'</div></a><div class="service-body"><h3>'+s.name+'</h3><p>'+s.desc+'</p><a href="'+s.path+'">Ver serviço ↗</a></div></article>').join('')+'</div>';
}
function loopCards(){
 const arr=[['DESIGN DIGITAL',IMAGES.crowd,'/solucoes/design'],['MOTION DESIGN',IMAGES.concert,'/solucoes/motion'],['SISTEMAS',IMAGES.live,'/solucoes/sistemas']];
 return '<section class="ticker-section dark"><div class="container">'+title('Nossos serviços.','Materiais de divulgação, vídeos e ferramentas digitais.')+'</div><div class="ticker-viewport"><div class="ticker-track">'+arr.concat(arr).map((it,i)=>'<a href="'+it[2]+'" class="ticker-item" '+(i>2?'aria-hidden="true" tabindex="-1"':'')+'><div class="ticker-photo">'+photo(it[1],'','Imagem de referência de evento')+'</div><b>'+it[0]+'</b></a>').join('')+'</div></div></section>';
}
function empty(){
 return '<div class="empty-gallery"><div class="empty-graphic"><span>noBRon.</span><strong>PORTFÓLIO</strong></div><div><h3>Trabalhos realizados.</h3><p>As artes, vídeos e telas dos projetos serão adicionados aqui.</p></div></div>';
}
function projectMedia(p){
 const media=Array.isArray(p.media)&&p.media.length?p.media:[{type:'image',src:p.cover}];
 return media.filter(m=>m&&m.src).map(m=>({type:m.type==='video'?'video':'image',src:String(m.src)}));
}
function gallery(cat='todos',limit=100){
 let list=projects.filter(p=>cat==='todos'||p.category===cat).slice(0,limit);
 if(!list.length)return empty();
 return '<div class="project-grid">'+list.map(p=>'<button class="project-item" type="button" data-project="'+E(p.id)+'" aria-label="Abrir projeto '+E(p.title)+'"><span class="project-cover"><img src="'+E(p.cover)+'" alt="'+E(p.title)+'" loading="lazy" /></span><span class="project-info"><strong>'+E(p.title)+'</strong><small>'+E(p.category)+'</small></span></button>').join('')+'</div>';
}
function portfolio(cat='todos',head='Trabalhos realizados.',desc='Artes, vídeos e sistemas desenvolvidos pela noBRon.'){
 return section(title(head,desc,'PORTFÓLIO')+'<div class="gallery-shell" data-gallery="'+cat+'">'+gallery(cat,8)+'</div><div class="portfolio-actions">'+link('Ver todos os projetos','/projetos')+'</div>',true,'portfolio-section');
}
function applications(s){
 return section(title('Materiais e aplicações.','',s.name.toUpperCase())+'<div class="app-grid">'+s.items.map((item,i)=>'<div class="app-item reveal"><small>'+String(i+1).padStart(2,'0')+'</small><strong>'+E(item)+'</strong><span>↗</span></div>').join('')+'</div>',true,'applications');
}
function cta(head='Solicite um orçamento.',desc='Conte o que você precisa para o seu evento ou projeto.',btn='Solicitar orçamento',dest='/contato'){
 return '<section class="cta-section dark"><div class="cta-bg" aria-hidden="true"></div><div class="container cta-content reveal">'+label('CONTATO')+'<h2>'+E(head)+'</h2><p>'+E(desc)+'</p>'+link(btn,dest)+'</div></section>';
}
function serviceRow(s,i){
 return section('<div class="service-row '+(i%2?'reverse':'')+'"><div class="feature-art reveal">'+(s.id==='sistemas'?'<div class="interface-art"><span>noBRon / SISTEMAS</span><div class="ui-cols"><b>Eventos</b><b>Portaria</b><b>Vendas</b></div><div class="ui-chart"></div></div>':photo(IMAGES[s.id==='motion'?'live':'concert']))+'</div><div class="feature-copy reveal">'+label('0'+(i+1)+' / SERVIÇO')+'<h2>'+E(s.name)+'</h2><p>'+E(s.desc)+'</p>'+link('Ver '+s.name,s.path)+'</div></div>',i%2===1,'service-feature')+divider(i%2?'angle':'curve');
}
const PAGES={
 home:()=>hero('Design. Motion. Sistemas.','Artes de divulgação, vídeos e sistemas para eventos, baladas, pubs e artistas.',{cta2:'Conhecer serviços'})+divider('curve')+loopCards()+divider('angle')+section(title('Nossos serviços.','Escolha o material ou sistema que você precisa.')+serviceCards(),true,'services-section')+divider('inset')+portfolio('todos','Trabalhos em destaque.','Conheça os materiais produzidos pelo estúdio.')+divider('angle')+cta(),
 solutions:()=>hero('Nossos serviços.','Criação de artes, vídeos e sistemas para eventos, baladas, pubs e artistas.',{eyebrow:'SOLUÇÕES',cta2:'Solicitar orçamento',href2:'/contato'})+divider('curve')+SERVICES.map(serviceRow).join('')+portfolio()+divider('angle')+cta(),
 design:()=>hero('Material de divulgação para eventos.','Criamos artes para festas, shows, baladas, pubs e artistas.',{eyebrow:'DESIGN DIGITAL',image:'concert',cta:'Solicitar arte',href:'/contato?servico=design',cta2:'Ver trabalhos',href2:'#conteudo'})+divider('curve')+applications(service('design'))+divider('inset')+portfolio('design','Trabalhos realizados.','Artes de divulgação produzidas pela noBRon.')+divider('angle')+loopCards()+divider('angle')+cta('Solicite sua arte.','Conte o que precisa divulgar.','Solicitar arte','/contato?servico=design'),
 motion:()=>hero('Vídeos e animações para eventos.','Criamos flyers animados, teasers, vinhetas e vídeos de divulgação.',{eyebrow:'MOTION DESIGN',image:'live',cta:'Solicitar vídeo',href:'/contato?servico=motion',cta2:'Ver vídeos',href2:'#conteudo'})+divider('curve')+applications(service('motion'))+divider('inset')+portfolio('motion','Vídeos realizados.','Trabalhos em vídeo produzidos pela noBRon.')+divider('angle')+loopCards()+divider('angle')+cta('Solicite seu vídeo.','Envie as informações do evento ou da campanha.','Solicitar vídeo','/contato?servico=motion'),
 sistemas:()=>hero('Sites e sistemas para eventos.','Desenvolvemos ferramentas digitais para gestão, operação e apresentação.',{eyebrow:'SISTEMAS',cta:'Solicitar sistema',href:'/contato?servico=sistemas',cta2:'Ver sistemas',href2:'#conteudo'})+divider('curve')+applications(service('sistemas'))+divider('inset')+portfolio('sistemas','Sistemas desenvolvidos.','Telas, funcionalidades e estágio de cada projeto.')+divider('angle')+cta('Solicite um sistema.','Explique qual operação precisa de uma ferramenta digital.','Solicitar sistema','/contato?servico=sistemas'),
 projects:()=>hero('Trabalhos realizados.','Artes, vídeos e sistemas desenvolvidos pela noBRon.',{eyebrow:'PROJETOS',image:'concert',cta:'Explorar trabalhos',href:'#conteudo'})+divider('curve')+section(title('Explore por categoria.','Selecione um serviço para visualizar os trabalhos.','PORTFÓLIO')+'<div class="filters" role="group" aria-label="Filtrar trabalhos">'+[['todos','Todos'],['design','Design'],['motion','Motion'],['sistemas','Sistemas']].map(f=>'<button type="button" data-filter="'+f[0]+'" aria-pressed="'+(f[0]===filter)+'" class="'+(f[0]===filter?'active':'')+'">'+f[1]+'</button>').join('')+'</div><div id="main-gallery">'+gallery(filter)+'</div>',true,'all-projects')+divider('angle')+cta(),
 about:()=>hero('Sobre a noBRon.','Estúdio digital especializado em Design, Motion e Sistemas para eventos, casas noturnas e artistas.',{eyebrow:'SOBRE',image:'live'})+divider('curve')+section('<div class="about-layout">'+title('O que fazemos.','Criamos materiais de divulgação, vídeos e ferramentas digitais para eventos e artistas.')+photo(IMAGES.crowd)+'</div>',true,'about-section')+divider('angle')+section(title('Nossos serviços.','Design Digital, Motion Design e Sistemas.')+serviceCards(),false,'services-section')+divider('inset')+portfolio('todos','Trabalhos realizados.','Conheça projetos do estúdio.')+divider('angle')+cta('Entre em contato.','Conte o que você precisa.'),
 contact:()=>hero('Solicite um orçamento.','Conte o que você precisa para receber uma proposta personalizada.',{eyebrow:'CONTATO',cta:'Preencher solicitação',href:'#conteudo'})+divider('curve')+section('<div class="contact-layout"><div class="contact-intro">'+title('Seu projeto.','Informe o serviço, a data do evento e os detalhes da sua solicitação.','ORÇAMENTO')+photo(IMAGES.live)+'</div><form id="contact-form"><label>Nome *<input name="name" required maxlength="120" autocomplete="name" placeholder="Seu nome"/></label><label>E-mail ou WhatsApp *<input name="contact" required maxlength="160" autocomplete="email" placeholder="Seu contato"/></label><label>Serviço *<select name="service" required><option value="">Selecione</option>'+SERVICES.map(s=>'<option value="'+s.id+'">'+s.name+'</option>').join('')+'</select></label><label>Contratação<select name="plan"><option value="avulso">Serviço avulso</option><option value="plano">Plano personalizado</option></select></label><label>Data do evento (opcional)<input type="date" name="date"/></label><label>Descrição do projeto *<textarea name="description" rows="5" maxlength="2500" required placeholder="Conte o que você precisa"></textarea></label><label>Referências (opcional)<textarea name="references" rows="2" placeholder="Links ou observações"></textarea></label><button class="btn submit" type="submit">Enviar solicitação <span aria-hidden="true">↗</span></button><p id="form-status" role="status" aria-live="polite"></p><small>Seus dados serão usados para responder à solicitação.</small></form></div>',true,'contact-section')+divider('angle')+section('<div class="signature">noBRon.</div>',false,'signature-section')
};
function footer(){
 return '<footer class="footer dark"><div class="container"><div class="footer-title"><a class="brand" href="/">noBRon.</a><span>Design. Motion. Sistemas.</span></div><div class="footer-last"><span>© '+new Date().getFullYear()+' noBRon.</span><nav>'+NAV.map(n=>'<a href="'+n[1]+'">'+n[0]+'</a>').join('')+'</nav></div></div></footer>';
}
function closeModal(){
 const d=document.getElementById('overlay');
 if(!d)return;
 d.hidden=true;d.innerHTML='';document.body.classList.remove('locked');
 lastFocused?.focus?.();opened=null;
}
function openProject(id){
 const p=projects.find(x=>String(x.id)===id);if(!p)return;
 const media=projectMedia(p);if(!media.length)return;
 lastFocused=document.activeElement;
 const d=document.getElementById('overlay');let idx=0;opened=id;
 d.hidden=false;document.body.classList.add('locked');
 d.innerHTML='<div class="overlay-panel" role="dialog" aria-modal="true" aria-label="Projeto '+E(p.title)+'"><button type="button" class="overlay-close" aria-label="Fechar projeto">×</button><div class="overlay-media"></div><div class="overlay-bottom"><div><small>'+E(p.category)+(p.status?' · '+E(p.status):'')+'</small><h2>'+E(p.title)+'</h2><p>'+E(p.description||'')+'</p></div><div class="overlay-controls"><button type="button" class="overlay-prev" aria-label="Mídia anterior">←</button><span class="overlay-count"></span><button type="button" class="overlay-next" aria-label="Próxima mídia">→</button></div></div></div>';
 function update(){
  const m=media[idx];const view=d.querySelector('.overlay-media');
  view.innerHTML=m.type==='video'?'<video src="'+E(m.src)+'" controls playsinline preload="metadata"></video>':'<img src="'+E(m.src)+'" alt="'+E(p.title)+'"/>';
  d.querySelector('.overlay-count').textContent=(idx+1)+' / '+media.length;
 }
 update();
 d.querySelector('.overlay-close').addEventListener('click',closeModal);
 d.querySelector('.overlay-prev').addEventListener('click',()=>{idx=(idx-1+media.length)%media.length;update();});
 d.querySelector('.overlay-next').addEventListener('click',()=>{idx=(idx+1)%media.length;update();});
 d.addEventListener('click',e=>{if(e.target===d)closeModal();});
 let x=0;d.addEventListener('touchstart',e=>{x=e.touches[0].clientX;},{passive:true});
 d.addEventListener('touchend',e=>{const delta=e.changedTouches[0].clientX-x;if(Math.abs(delta)>55){idx=(idx+(delta<0?1:-1)+media.length)%media.length;update();}},{passive:true});
 d.querySelector('.overlay-close').focus();
}
function wire(){
 document.querySelector('.theme-toggle')?.addEventListener('click',()=>{
  const next=document.body.dataset.theme==='light'?'dark':'light';
  document.body.dataset.theme=next;
  try{localStorage.setItem('nobron-theme',next);}catch{}
 });
 document.querySelectorAll('[data-reveal]').forEach(node=>{
  const toggle=()=>{document.querySelectorAll('[data-reveal].colored').forEach(el=>{if(el!==node)el.classList.remove('colored');});node.classList.toggle('colored');};
  node.addEventListener('click',toggle);
  node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
 });
 document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
  filter=btn.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn));});
  const g=document.getElementById('main-gallery');if(g)g.innerHTML=gallery(filter);
 }));
 document.querySelectorAll('[data-project]').forEach(btn=>btn.addEventListener('click',()=>openProject(btn.dataset.project)));
 const form=document.getElementById('contact-form');
 if(form){
  const s=new URLSearchParams(location.search).get('servico');
  if(SERVICES.some(x=>x.id===s))form.elements.service.value=s;
  form.addEventListener('submit',e=>{
   e.preventDefault();if(!form.reportValidity())return;
   form.querySelector('#form-status').textContent='Formulário em prévia. O recebimento será configurado antes da publicação.';
  });
 }
 const obs=new IntersectionObserver(rows=>{rows.forEach(row=>{if(row.isIntersecting){row.target.classList.add('visible');obs.unobserve(row.target);}})},{threshold:0.05});
 document.querySelectorAll('.reveal').forEach(node=>obs.observe(node));
}
function render(){
 const p=path(),key=routes[p];
 document.title=(key==='home'?'Design. Motion. Sistemas.':key==='projects'?'Trabalhos realizados.':key==='contact'?'Solicite um orçamento.':key==='solutions'?'Nossos serviços.':key==='about'?'Sobre a noBRon.':service(key)?.intro||'noBRon.')+' | noBRon.';
 document.getElementById('app').innerHTML=header()+'<main id="main">'+PAGES[key]()+'</main>'+footer()+mobileNav()+'<div id="overlay" class="overlay" hidden></div>';
 document.querySelectorAll('[data-gallery]').forEach(g=>{g.innerHTML=gallery(g.dataset.gallery,8)});
 wire();
}
document.addEventListener('click',e=>{
 const a=e.target.closest('a[href]');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;
 const u=new URL(a.href,location.href);if(u.origin!==location.origin)return;
 e.preventDefault();
 if(u.pathname===location.pathname&&u.hash){document.querySelector(u.hash)?.scrollIntoView({behavior:'smooth'});return;}
 history.pushState({},'',u.pathname+u.search+u.hash);filter='todos';render();scrollTo(0,0);
 if(u.hash)requestAnimationFrame(()=>document.querySelector(u.hash)?.scrollIntoView({behavior:'smooth'}));
});
window.addEventListener('popstate',()=>{filter='todos';render();scrollTo(0,0);});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
let raf=0;window.addEventListener('scroll',()=>{
 if(innerWidth<700||matchMedia('(prefers-reduced-motion: reduce)').matches||raf)return;
 raf=requestAnimationFrame(()=>{document.querySelectorAll('[data-depth]').forEach(node=>{const r=node.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)node.style.transform='translate3d(0,'+Math.max(-30,Math.min(30,-r.top*.065))+'px,0)';});raf=0;});
},{passive:true});
try{document.body.dataset.theme=localStorage.getItem('nobron-theme')||'dark';}catch{document.body.dataset.theme='dark';}
render();
fetch('/data/projects.json').then(r=>r.ok?r.json():[]).then(data=>{
 projects=Array.isArray(data)?data.filter(p=>p&&p.id&&p.title&&p.cover&&['design','motion','sistemas'].includes(p.category)):[];
 render();
}).catch(()=>{});
