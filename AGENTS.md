# Notas para agentes e desenvolvedores

- **URLs de SEO têm fonte única**: `SITE_URL` em `src/lib/seo.ts`. Nunca hardcodar
  domínio em rota, sitemap ou schema — usar `pageSeo()`/`SITE_URL`. O único lugar
  fora do módulo é o `Sitemap:` de `public/robots.txt` (atualizar junto).
- **Depoimentos**: não reintroduzir logo do Google, notas ou datas em avaliações
  que não vieram do Perfil Google real do cliente (risco jurídico — CDC art. 37).
- **Mídia pesada**: vídeos/panorâmicas ficam em `public/media/` e `src/assets/`.
  O vídeo do hero foi comprimido a ~800KB; manter qualquer substituto abaixo de
  ~2MB (o original de 11MB era 96% do peso da página).
- **Showroom 3D**: não pré-carregar todas as panorâmicas em bloco (~7MB); o
  padrão atual carrega a selecionada + a vizinha.
- **Acessibilidade**: o bronze `#93603d` foi calculado para WCAG AA (4.69:1 como
  texto sobre creme, 5.14:1 sob texto branco). Não clarear sem revalidar contraste.
- **Deploy**: Vercel via Build Output API (autodetectada no CI). Build local
  padrão gera worker Cloudflare (`defaultPreset` do config Lovable) — é normal.
- Histórico: projeto originalmente gerado no Lovable; o acoplamento (plugin MCP,
  telemetria, badge) foi removido em agosto/2026 na migração para GitHub+Vercel.
