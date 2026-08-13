# M7 Movelaria — site institucional

Site da [M7 Movelaria](https://m7movelaria.online) (móveis planejados sob medida, São José dos Pinhais/PR): apresentação, portfólio interativo com hotspots, tour 360° em Three.js e contato via WhatsApp.

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
```

## Deploy (Vercel)

O projeto está pronto para import direto na Vercel — o nitro detecta o ambiente
(`VERCEL=1`) e gera `.vercel/output` (Build Output API) sem configuração extra:

1. Importar o repositório na Vercel (framework: **Vite**, build `npm run build`).
2. Apontar o domínio no painel da Vercel.
3. **Se o domínio mudar**, atualizar `SITE_URL` em `src/lib/seo.ts` (uma linha —
   canonicals, og:url, sitemap e schema seguem juntos) e o `Sitemap:` de
   `public/robots.txt`.

## Onde editar conteúdo

Não há CMS — o conteúdo é código:

| O quê | Onde |
|---|---|
| Domínio canônico / meta tags | `src/lib/seo.ts` |
| Telefone/WhatsApp | `src/lib/whatsapp.ts` |
| Projetos do portfólio (ambientes, hotspots) | `src/data/projects.ts` |
| Ambientes do tour 360° (panorâmicas, hotspots) | `src/data/rooms.ts` |
| Depoimentos, serviços, ferragens, acabamentos | `src/routes/index.tsx` |
| Cabeçalho/rodapé (menu, endereço, horários) | `src/components/SiteChrome.tsx` |

## Pendências conhecidas

- Depoimentos são placeholders — substituir por avaliações reais do Google.
- Fotos do portfólio são renders — substituir por fotos de obras entregues.
- Links de Instagram/Facebook removidos até existirem perfis reais.
- CEP ausente no schema (`src/routes/index.tsx`) — confirmar com o cliente.
- Sem analytics — instalar GA4 (ou similar) quando houver conta.
