# noBRon V2

Site digital com **seis páginas** e administração direta de imagens e vídeos.

## Páginas públicas

| Página | Caminho |
| --- | --- |
| Home | `/` |
| Soluções | `/solucoes` |
| Design Digital | `/solucoes/design` |
| Motion Design | `/solucoes/motion` |
| Sistemas | `/solucoes/sistemas` |
| Contato | `/contato` |

Rotas antigas `/sobre` e `/projetos` redirecionam para outras páginas.

## Painel /admin

A senha administrativa original é preservada. Depois de entrar:

1. Selecione uma das seis páginas.
2. Escolha **Mobile** ou **Desktop**.
3. Em **Abertura** ou **Seção do serviço**, toque em **Escolher da biblioteca** para atribuir uma imagem ou vídeo já enviado.
4. Em **Galeria / Carrossel**, selecione vários arquivos; reorganize ou remova os escolhidos.
5. Toque em **Salvar rascunho** e, quando estiver pronto, em **Publicar página**.

Uploads existentes continuam no bucket privado `nobron-drafts`. Apenas mídias efetivamente publicadas são copiadas para `nobron-public`. O painel não depende mais do cadastro de projetos para mostrar uma imagem.

Campos de texto e canais de contato estão acessíveis em **Editar texto**.

Se não houver uma mídia específica para determinado dispositivo, a página utiliza a versão atribuída ao outro dispositivo como reserva, sem alterar a atribuição original.

## Estrutura do código

- `content-schema.js`: seis páginas e suas posições editáveis.
- `site-simple.js` e `site-simple.css`: site público e suas galerias.
- `admin/media-pages.js` e `admin/media-pages.css`: interface de atribuição de mídias.
- `admin/auth.js`: autenticação, recuperação e alteração de senha.
- `supabase/functions/nobron-cms-publish/index.ts`: publicação autenticada com conversão de referências de mídias privadas em públicas.

## Atenção

- Os arquivos da biblioteca são privados até serem publicados em alguma página.
- A publicação requer uma sessão administrativa válida no Supabase.
- Não apagar as mídias do Storage sem conferir onde são usadas.
- A versão atual ainda deve passar por teste real de escolha, salvamento e publicação com a sessão da proprietária; inspeção estática e simulações não substituem esse teste.
- A proteção contra senhas vazadas do Supabase Auth continua com um aviso de configuração independente deste fluxo.

Este projeto está separado do site antigo da noBRon.
