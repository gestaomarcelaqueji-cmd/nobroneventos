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
