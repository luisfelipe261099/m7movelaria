// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
//
// Deploy: o nitro autodetecta a plataforma no CI. Na Vercel (env VERCEL=1) o build
// gera .vercel/output (Build Output API) — sem configuração extra no painel.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    // Repetido por ambiente: com a API de environments do Vite, o `build` do
    // topo nem sempre chega aos ambientes client/ssr depois do mergeConfig.
    environments: {
      client: { build: { assetsInlineLimit: 0 } },
      ssr: { build: { assetsInlineLimit: 0 } },
    },
    // Não tente controlar o chunking do servidor daqui — não funciona.
    //
    // São TRÊS ambientes de build, não dois: `client`, `ssr` e `nitro`. O `ssr`
    // é só a entrada do servidor (~290 módulos); quem empacota as rotas (os
    // `_ssr/*.mjs` e as `_libs/*` que a função da Vercel carrega) é o `nitro`.
    // E dentro dele, com Vite 8 + rolldown, o agrupamento sai do
    // `output.codeSplitting.groups` do próprio Nitro, que entra como PRIMEIRO
    // argumento do `defu` — ou seja, ganha de `rollupConfig`, de `rolldownConfig`
    // e do que vier do projeto. `manualChunks` posto aqui é aceito, o hook até
    // roda, e a saída não muda um byte (verificado: hashes idênticos).
    //
    // Para manter algo fora do bundle do servidor, corte na origem com
    // `import.meta.env.SSR` em volta do `import()` — veja showroom-3d.tsx.
    build: {
      // Nada de asset embutido como data: URI.
      //
      // O padrão do Vite (4 KB) inlinava as variantes de 480px em base64 dentro
      // do próprio HTML — base64 é ~33% maior que o binário, o mesmo arquivo
      // aparece repetido em cada `srcset` da página, e nada disso fica em cache
      // separado: volta inteiro a cada navegação. Na prática o HTML da home
      // passou de 21 KB para 49 KB comprimidos, tudo no caminho crítico, para
      // "economizar" requisições de imagens que são lazy e ficam abaixo da
      // dobra. Como arquivo, cada variante é baixada só quando é usada e fica
      // no cache imutável de /assets.
      assetsInlineLimit: 0,
    },
  },
});
