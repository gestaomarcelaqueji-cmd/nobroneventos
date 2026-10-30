# noBRon V2

Site institucional de Design Digital, Motion Design e Sistemas para eventos, baladas, pubs e artistas.

## Estrutura atual

- Oito rotas independentes: `/`, `/solucoes`, `/solucoes/design`, `/solucoes/motion`, `/solucoes/sistemas`, `/projetos`, `/sobre`, `/contato`.
- `content-schema.js`: definições iniciais da copy e das seções de cada página.
- `site-v2.js` e `site-v2.css`: site público com layouts distintos, navegação glass no mobile, dividers, galerias e visualização ampliada de projetos.
- `admin/index.html`, `admin/auth.js`, `admin/dashboard.js` e seus CSS: acesso protegido e painel de conteúdo.
- `supabase/functions/nobron-owner-auth/index.ts`: código-fonte da função de autenticação. A função de publicação também está implantada no projeto Supabase.
- `vercel.json`: rotas e cabeçalhos de segurança.

O site atual e o novo projeto `nobroneventos` permanecem separados.

## Editor administrativo

URL: `/admin`.

A primeira ativação requer o código de instalação de uso único, e-mail e senha. Depois, somente a senha é solicitada; a identidade de proprietário continua sendo verificada no servidor.

O editor permite:
- Selecionar as oito páginas e cada seção individual.
- Editar título, descrição e visibilidade de seções.
- Reordenar seções.
- Enviar e selecionar arquivos de mídia na biblioteca privada.
- Atribuir mídias independentes para desktop e mobile, além de posição, zoom e section divider para cada versão.
- Cadastrar e editar projetos, categoria, estágio, descrição, capas desktop/mobile, arquivos da galeria e destaque na Home.
- Salvar rascunhos sem alterar conteúdo publicado.
- Publicar páginas/projetos com validação da sessão e permissões no servidor.
- Consultar histórico básico de versões.

## Persistência / segurança

O Supabase do projeto é `fsaqzbwxhjpnfgqxdvnz`. Nunca inserir service-role keys, código de ativação, senha ou tokens no repositório.

- `cms_admins`: conta autorizada.
- `cms_drafts`: conteúdo privado em preparação.
- `cms_published`: conteúdo público.
- `cms_media`: índice de mídias.
- `cms_versions`: snapshots de publicações anteriores.
- `nobron-drafts`: bucket privado para uploads.
- `nobron-public`: bucket de mídias publicadas.

RLS é obrigatório em tabelas expostas. A função `nobron-cms-publish` valida o token no servidor, verifica proprietário e promove arquivos do bucket privado antes de publicar a versão. Arquivos não utilizados não devem ser excluídos sem conferir referências.

## Pendências conhecidas

- O acervo de projetos reais ainda precisa ser cadastrado pelo painel. Não preencher com portfólio fictício.
- O formulário de contato público ainda está em prévia e **não envia solicitações**.
- A prévia interna do editor é uma representação da seção, não um preview 100% idêntico ao site público.
- Restauração de versões, remoção segura em lote, otimização/transcodificação de vídeos e editor da identidade global precisam de trabalho adicional.
- Falta executar testes ponta a ponta de upload, gravação, publicação, logout e restauração com uma sessão real autorizada. Testes de sintaxe, rendering sem navegador e inspeção de deploy foram realizados, mas não substituem testes reais.
- O Supabase alerta que **Leaked Password Protection** está desabilitado em Auth. Revisar em Settings / Authentication para melhorar a proteção da conta.

## Desenvolvimento local

O projeto utiliza HTML, CSS e JavaScript puro; não usa Next.js. Execute um servidor HTTP que sirva a raiz do repositório, por exemplo `python dev_server.py`, e abra `http://localhost:3000`.

A regra de comunicação da noBRon é copy curta, clara e específica. A criatividade deve aparecer nos layouts e nos trabalhos reais, não em slogans.
