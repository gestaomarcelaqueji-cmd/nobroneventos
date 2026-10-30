# noBRon V2

Site institucional mobile-first para Design Digital, Motion Design e Sistemas.

## Páginas
- Início `/`
- Soluções `/solucoes`
- Design Digital `/solucoes/design`
- Motion Design `/solucoes/motion`
- Sistemas `/solucoes/sistemas`
- Projetos `/projetos`
- Sobre `/sobre`
- Contato `/contato`

## Executar localmente

```bash
python dev_server.py
```

Abra `http://localhost:3000`.

O projeto usa HTML, CSS e JavaScript sem dependências de framework. `vercel.json` contém o encaminhamento das rotas para a aplicação.

## Portfólio real

Cadastre os trabalhos em `data/projects.json` como uma lista de objetos:

```json
[
  {
    "id": "id-do-projeto",
    "title": "Nome do trabalho",
    "category": "design",
    "cover": "/assets/capa.webp",
    "description": "Material produzido para o evento",
    "status": "concluído",
    "media": [
      {"type": "image", "src": "/assets/capa.webp"},
      {"type": "video", "src": "/assets/video.mp4"}
    ]
  }
]
```

Categorias válidas: `design`, `motion`, `sistemas`.
Coloque somente arquivos reais e autorizados na pasta `assets`. Sem dados publicados, as galerias exibem uma área neutra de espera.

## Situação e pendências

- O site tem oito páginas, navegação inferior glass no mobile, divisores assimétricos, transições, galerias e visualização fullscreen de projetos.
- As fotografias externas usadas na primeira versão servem apenas como referências visuais de layout, não como trabalhos realizados.
- O formulário ainda é uma prévia: **não envia dados**. Conectar a um recebimento seguro e proteção antispam antes da publicação.
- O Supabase permanece sem modificações.
- O arquivo `robots.txt` bloqueia indexação durante a homologação. Revisar ao lançar.
- Testar rotas, telas mobile/desktop, mídia, acessibilidade e performance no ambiente publicado.
- O site atual da noBRon permanece separado e não foi alterado.

## Segurança

Nunca colocar chaves secretas ou credenciais de administrador em arquivos do frontend. A chave publicável do Supabase deve ser usada apenas com as políticas RLS apropriadas, quando a integração for criada.

## Painel administrativo — acesso único

- Rota após implantação: `/admin` (arquivos em `admin/`).
- Na primeira visita, o painel consulta `nobron-owner-auth` para saber se existe um proprietário.
- Configuração inicial exige um **código de ativação de uso único**, um e-mail administrativo e senha de pelo menos 14 caracteres.
- Depois da ativação, o formulário de cadastro deixa de aparecer; os logins seguintes exigem **somente a senha**.
- O código é gerado no Supabase e apenas seu SHA-256 é armazenado no esquema privado `nobron_private`. Nunca adicionar o código ao GitHub.
- O e-mail administrativo fica no banco privado e não é solicitado novamente na tela de login.
- Sessões temporárias ficam em `sessionStorage`; não utilizar credenciais em `localStorage`.
- A Edge Function valida a senha com Supabase Auth, limita tentativas e não envia chaves administrativas ao navegador.
- As tabelas privadas são protegidas com RLS; publicações privilegiadas exigirão uma futura ação autenticada no servidor.
- O painel de edição visual e upload de mídias **ainda não está implementado**. O login abre uma tela de acesso confirmado; não confundir com o editor final.
- Configurar hospedagem separada para a V2 e testar a ativação antes de considerar a etapa concluída.
- Em caso de perda da senha, a recuperação deverá ser tratada de forma segura pela administração do Supabase, nunca criando uma segunda conta pública.
