# M7 Movelaria — site institucional

Site da [M7 Movelaria](https://www.m7movelaria.com.br) (móveis planejados sob medida,
São José dos Pinhais/PR): landing pages por serviço e por cidade, portfólio
interativo com hotspots, tour 360° em Three.js e contato via WhatsApp.

## Stack

- [TanStack Start](https://tanstack.com/start) (React 19 + Vite 8, SSR via nitro)
- Tailwind CSS 4
- Three.js + React Three Fiber (tour 360° e panorâmicas)
- TypeScript

## Desenvolvimento

```bash
npm install
npm run dev        # http://localhost:8080
```

Outros comandos:

```bash
npm run build      # build de produção
npm run lint       # eslint
npm run format     # prettier
npm run images     # regenera AVIF/WebP e o manifesto (só ao trocar imagens)
```

## Deploy (Vercel)

O projeto está pronto para import direto na Vercel — o nitro detecta o ambiente
(`VERCEL=1`) e gera `.vercel/output` (Build Output API) sem configuração extra:

1. Importar o repositório na Vercel (framework: **Vite**, build `npm run build`).
2. Apontar o domínio no painel da Vercel.
3. **Se o domínio mudar**, atualizar `SITE_URL` em `src/lib/seo.ts` — é uma
   linha só, e canonical, og:url, sitemap, robots.txt, schema e links internos
   seguem juntos. Dá para sobrescrever sem mexer no código definindo
   `VITE_SITE_URL` na Vercel.

   Atenção ao `www`: o domínio primário na Vercel é `www.m7movelaria.com.br` e o
   apex responde 308 para ele. O canonical tem que apontar para o host que
   devolve 200 — se você trocar o primário para o apex no painel, troque o
   `SITE_URL` junto.

### Variáveis de ambiente

| Variável | Para quê |
|---|---|
| `VITE_GOOGLE_SITE_VERIFICATION` | Verificação do Google Search Console. Cole só o valor do `content=` do método "tag HTML". Sem ela, a meta tag simplesmente não é emitida. |
| `VITE_SITE_URL` | Sobrescreve o domínio canônico sem editar código. Sem barra no fim (ex.: `https://www.m7movelaria.com.br`). |

## Mapa de URLs

| Rota | O quê |
|---|---|
| `/` | Home — hero, serviços, área atendida, materiais, acabamentos, portfólio, FAQ |
| `/moveis-planejados` | Hub dos serviços |
| `/moveis-planejados/$servico` | 6 landing pages (cozinhas, dormitórios, closets, home office, comerciais, painel de TV) |
| `/moveis-planejados-em/$cidade` | 6 landing pages locais (SJP, Curitiba, Pinhais, Araucária, Colombo, Fazenda Rio Grande) |
| `/projetos`, `/projetos/$projectId` | Portfólio com hotspots |
| `/showroom-3d` | Tour 360° |
| `/perguntas-frequentes` | FAQ (gera o rich result de perguntas) |
| `/sobre` | E-E-A-T: quem é a M7 e como o projeto acontece |
| `/contato` | NAP e canais |
| `/politica-de-privacidade` | LGPD |
| `/sitemap.xml`, `/robots.txt` | Rotas geradas a partir do `SITE_URL` |
| `/llms.txt` | Resumo do site para modelos de linguagem (arquivo estático) |

## Onde editar conteúdo

Não há CMS — o conteúdo é código:

| O quê | Onde |
|---|---|
| Domínio canônico, NAP, meta tags | `src/lib/seo.ts` (fonte única — inclusive do robots.txt) |
| JSON-LD (LocalBusiness, WebSite, FAQ, Service, Breadcrumb) | `src/lib/schema.ts` |
| Nome/slug/title/description de serviços e cidades | `src/data/catalog.ts` |
| Texto longo das páginas de serviço | `src/data/services.ts` |
| Texto longo das páginas de cidade | `src/data/cities.ts` |
| FAQ geral | `src/data/faq.ts` |
| Telefone/WhatsApp | `src/lib/whatsapp.ts` |
| Projetos do portfólio (ambientes, hotspots) | `src/data/projects.ts` |
| Ambientes do tour 360° | `src/data/rooms.ts` |
| Home (ferragens, acabamentos, depoimentos) | `src/routes/index.tsx` |
| Cabeçalho/rodapé | `src/components/SiteChrome.tsx` |
| `lastmod` do sitemap | `src/routes/sitemap[.]xml.ts` (constante `LASTMOD`) |

Ao adicionar ou trocar imagem em `src/assets/`, rodar `npm run images` e
commitar o que aparecer em `src/assets/generated/`.

## Relatório para o cliente

`docs/relatorio-migracao-e-otimizacao.pdf` — documento de 18 páginas com tudo o
que mudou desde a versão original gerada no Lovable até a publicação atual, com
os números medidos, o histórico de alterações e a metodologia de medição.
Regenerar com `python3 scripts/gerar-relatorio.py` (requer `pip install reportlab`).

## Pendências conhecidas

Bloqueadas em dados que só o cliente tem:

- **CEP e coordenadas do ateliê** — `POSTAL_CODE` e `GEO` em `src/lib/seo.ts`
  estão vazios. Preenchê-los completa o `LocalBusiness` no schema (`postalCode`,
  `geo`, `hasMap`), que é o que casa o site com o Perfil da Empresa no Google.
- **Perfil da Empresa no Google (antigo Google Meu Negócio)** — sem ele o site
  não aparece no mapa nem no pacote local, que é onde está a maior parte dos
  cliques desse nicho. O NAP do site já está no formato certo para casar.
- **Redes sociais** — `sameAs` no schema está vazio de propósito; declarar
  perfil inexistente atrapalha a validação da entidade.
- **Avaliações reais** — os depoimentos em `src/routes/index.tsx` são
  placeholders com nomes fictícios. Substituir por avaliações reais do Perfil
  Google (ou remover a seção). Não existe `Review`/`AggregateRating` no schema
  justamente por isso — marcar nota sem review real é violação de diretriz do
  Google e risco pelo CDC art. 37.
- **Fotos de obra** — as imagens do portfólio são renders. Nenhum texto do site
  afirma que são obras entregues; ao substituir por fotos reais, dá para
  reintroduzir essa afirmação.
- **Cliente e arquiteto nomeados** — `src/data/projects.ts` e `src/data/rooms.ts`
  citam "Família Almeida" e "Studio Larissa Tortato" sobre imagens que são
  renders. Confirmar autorização ou trocar por descrição genérica.
- **CNPJ e tempo de mercado** — não estão no site; são sinais de confiança
  (E-E-A-T) que valem a pena acrescentar em `/sobre` quando confirmados.
- Sem analytics — instalar GA4 (ou similar) quando houver conta. Se entrar,
  atualizar `/politica-de-privacidade`, que hoje declara que o site não usa
  cookies nem rastreamento.
