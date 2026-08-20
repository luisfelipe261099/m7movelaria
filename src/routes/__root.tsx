import {
  Outlet,
  Link,
  createRootRoute,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { SITE_NAME, OG_IMAGE, GOOGLE_SITE_VERIFICATION } from "../lib/seo";
import { jsonLd, globalGraph } from "../lib/schema";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* `noindex` via meta hoisting do React 19: a 404 devolve status 404, mas
          o Google também lê a página — sem isso ela entra no índice herdando
          title e description da home. */}
      <meta name="robots" content="noindex, follow" />
      <main id="conteudo" className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O endereço que você abriu não existe ou foi movido.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ir para a página inicial
          </Link>
          <Link
            to="/moveis-planejados"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ver os serviços
          </Link>
        </div>
      </main>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado do nosso lado. Você pode tentar de novo ou voltar para o início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      // Fallback: toda rota sobrescreve com pageSeo(). Se alguma esquecer,
      // ainda assim não vai para o índice com título genérico em inglês.
      { title: "M7 Movelaria — Móveis Planejados em São José dos Pinhais" },
      {
        name: "description",
        content:
          "Marcenaria de alto padrão em São José dos Pinhais: móveis planejados sob medida para cozinhas, dormitórios, closets, home office e ambientes comerciais.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "author", content: SITE_NAME },
      { name: "theme-color", content: "#93603d" },
      // Sinais geográficos legados: o Google não usa mais, mas Bing e alguns
      // agregadores locais ainda leem. Custam dois bytes.
      { name: "geo.region", content: "BR-PR" },
      { name: "geo.placename", content: "São José dos Pinhais" },
      // Verificação do Search Console — vem de VITE_GOOGLE_SITE_VERIFICATION.
      // Sem a variável definida, a tag simplesmente não é emitida.
      ...(GOOGLE_SITE_VERIFICATION
        ? [{ name: "google-site-verification", content: GOOGLE_SITE_VERIFICATION }]
        : []),
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/logo-512.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      // Só a Inter é pré-carregada: é a fonte do corpo e dos títulos, ou seja,
      // de praticamente todo o texto da página. A Cormorant aparece só no
      // logotipo e em alguns números decorativos — pré-carregá-la custava 36 KB
      // de banda com prioridade alta disputando com o CSS, para depois trocar
      // meia dúzia de palavras. Ela carrega normalmente quando o CSS é lido, e
      // até lá o texto usa Georgia (o fallback declarado).
      {
        rel: "preload",
        href: "/fonts/inter-latin.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: appCss },
    ],
    // Empresa + site, declarados uma única vez. As rotas só referenciam por @id.
    scripts: [jsonLd(globalGraph())],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {/* Skip link: primeiro elemento focável da página, exigido pelo audit
            "bypass" do Lighthouse e essencial para navegação por teclado. */}
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-3 focus:left-3 focus:rounded focus:bg-bronze focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Pular para o conteúdo
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  // Required: nested routes render here. Removing <Outlet /> breaks all child routes.
  return <Outlet />;
}
