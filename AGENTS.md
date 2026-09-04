# Notas para agentes e desenvolvedores

## SEO

- **URLs de SEO têm fonte única**: `SITE_URL` em `src/lib/seo.ts`. Nunca hardcodar
  domínio em rota, sitemap, robots ou schema — usar `pageSeo()`/`canonical()`/`SITE_URL`.
  Não existe mais `public/robots.txt`: virou rota (`src/routes/robots[.]txt.ts`)
  justamente para não haver um segundo lugar com o domínio escrito à mão.
- **O canonical inclui `www`** porque o domínio primário na Vercel é
  `www.m7movelaria.com.br` (o apex responde 308). Canonical apontando para uma
  URL que redireciona faz o Google seguir um salto a mais em cada página.
- **O `noindex` de host casa `.vercel.app` explicitamente**, não "qualquer host
  diferente do canônico". A segunda forma marca o site inteiro como noindex se o
  host chegar diferente do esperado (com/sem `www`, header de proxy ausente) —
  falha silenciosa e cara. Não trocar por comparação com `SITE_URL`.
- **Um `@id` por entidade**: o negócio e o site são declarados uma única vez, no
  root (`globalGraph()` em `src/lib/schema.ts`). As rotas só referenciam por
  `@id`. Não voltar a declarar `Organization`/`LocalBusiness` dentro de uma rota —
  dois nós sem `@id` viram duas empresas diferentes para o Google.
- **Nunca inventar dado de negócio** em texto, alt ou schema: preço, prazo em
  dias, CNPJ, CEP, coordenadas, anos de mercado, número de obras, nota de
  avaliação. O que dá para escrever é _como_ o preço/prazo se formam.
- **Depoimentos**: não reintroduzir logo do Google, notas ou datas em avaliações
  que não vieram do Perfil Google real do cliente, e não adicionar
  `Review`/`AggregateRating` sobre os placeholders atuais (risco jurídico —
  CDC art. 37 — e violação de diretriz de dados estruturados do Google).
- **Dois tipos de imagem no portfólio, e não se misturam.** `obra-*.jpg`
  (`src/data/obras.ts`) são fotos de móvel instalado enviadas pela M7 — podem
  ser chamadas de "obra entregue". `project-*`, `hero-*` e as panorâmicas são
  renders de projeto executivo: nenhum texto ou alt pode afirmar execução sobre
  elas ("projeto executado em...", "fotos reais"). A legenda de uma foto de
  obra descreve só o que está visível; não recebe cidade, nome de cliente ou
  de arquiteto, data, nem marca de ferragem que não apareça na imagem — a M7
  não informou nada disso.
- **Páginas de cidade não podem virar doorway pages**: cada uma tem conteúdo
  próprio (contexto urbano, bairros, o que muda no projeto ali). Cidade nova
  precisa de texto novo — copiar de outra é pior do que não ter a página.
- **`/links` (bio do Instagram) tem regras próprias**: HTML escrito à mão, sem
  React, sem webfont, `noindex, follow` e fora do sitemap. O selo "aberto agora"
  é derivado de `OPENING_HOURS` (a mesma constante do `LocalBusiness`) no fuso
  `America/Sao_Paulo` — não duplicar o horário em uma tabela própria, e não
  subir o `s-maxage` de 300s: com uma hora de CDN o status fica errado por uma
  hora, o que é pior do que não ter status.
- `lastmod` do sitemap é constante manual (`LASTMOD` em `src/routes/sitemap[.]xml.ts`).
  Gerar `new Date()` a cada request faz o Google desprezar o campo no site todo.

## Performance

- **O caminho crítico é sagrado.** `routeTree.gen.ts` importa todas as rotas
  estaticamente, então tudo que um arquivo de rota importar no topo entra no
  chunk que _toda_ página baixa. Conteúdo longo (`services.ts`, `cities.ts`,
  `faq.ts`) entra por `import()` dinâmico dentro do `loader`. Os campos curtos
  ficam em `src/data/catalog.ts`, que é leve e pode ser importado direto.
- **Imagens**: sempre `<Picture>` (`src/components/Picture.tsx`), nunca `<img>`
  cru. Ele resolve AVIF/WebP/JPEG, srcset por largura e width/height (CLS).
  Ao trocar imagem, rodar `npm run images` e commitar `src/assets/generated/`.
  O `<picture>` usa `display: contents` de propósito — sem isso o `h-full` do
  `<img>` resolve contra o `<picture>` e a imagem renderiza no tamanho natural.
- **Vídeo do hero**: só carrega quando o bloco entra na tela E a página terminou
  de carregar E o usuário não pediu economia de dados. Não voltar a usar
  `<video autoPlay>` direto — os 800 KB competiam com o LCP.
- **Preload**: só a Inter (fonte do corpo), via header `Link` em `src/start.ts`.
  A Cormorant foi tirada do preload de propósito: 36 KB de prioridade alta para
  trocar meia dúzia de palavras. O preload do pôster do hero tem `media` porque
  no celular o LCP é o parágrafo, não a imagem.
- **Showroom 3D**: não pré-carregar todas as panorâmicas em bloco; o padrão atual
  carrega a selecionada + a vizinha. As texturas são WebP em `src/assets/generated/`.
- **`assetsInlineLimit: 0`** em `vite.config.ts` (e repetido em `environments.client`
  e `environments.ssr`, porque o `build` do topo não chega sozinho nos ambientes).
  Com o padrão do Vite (4 KB) as variantes de 480px viravam `data:` URI em base64
  dentro do HTML: base64 é ~33% maior que o binário, o mesmo arquivo se repete em
  cada `srcset` da página e nada disso fica em cache separado. O HTML da home ia
  de 15 KB para 49 KB comprimidos — tudo no caminho crítico — para "economizar"
  requisições de imagens que são lazy e ficam abaixo da dobra. Não aumentar esse
  limite sem medir o HTML depois.
- `@source not "../src/components/ui"` em `src/styles.css`: os 46 componentes
  shadcn não são usados por nenhuma tela e dobravam o CSS. Se algum for usado,
  tirar da exclusão.
- `src/start.ts` só põe `cache-control` em HTML com **status 200** — sem esse
  guard uma 404 ou o HTML de erro fica preso na CDN por uma hora.

## Acessibilidade

- O bronze `#93603d` foi calculado para WCAG AA sobre fundo claro (4,69:1 como
  texto sobre creme, 5,14:1 sob texto branco). Não clarear sem revalidar.
  Sobre fundo escuro, usar `text-bronze-soft` (`#b3814f`, 5,53:1).
- Fontes: nada abaixo de 12px (`text-xs`). Links dentro de texto corrido levam
  `underline` — cor sozinha não distingue (WCAG 1.4.1).
- Alvos de toque com pelo menos 24px de altura efetiva (daí o `py-1.5` nos links
  do rodapé).
- `@font-face` da Inter cobre 100–900: fora do intervalo o navegador aplica
  negrito sintético nos títulos.

## Deploy

- Vercel via Build Output API (autodetectada no CI). Build local padrão gera
  worker Cloudflare (`defaultPreset` do config Lovable) — é normal. Para testar
  o SSR localmente: `NITRO_PRESET=node_server npm run build && node .output/server/index.mjs`.
- **`vercel.json` não adianta** para `headers`/`redirects`: com `.vercel/output`
  presente a Vercel ignora essas chaves. Headers e redirects ficam no
  middleware de `src/start.ts`.
- Histórico: projeto originalmente gerado no Lovable; o acoplamento (plugin MCP,
  telemetria, badge) foi removido em agosto/2026 na migração para GitHub+Vercel.
