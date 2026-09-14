/**
 * Pré-renderiza as páginas indexáveis para HTML estático, depois do build.
 *
 * Roda sozinho: é o `postbuild` do package.json, então `npm run build` já o
 * dispara — inclusive no CI da Vercel.
 *
 * ## Por que
 *
 * O conteúdo do site é código: não há CMS, banco nem nada por requisição. Ainda
 * assim toda visita a uma URL fria executava a função serverless, e no plano
 * Hobby ela dorme — o cold start medido em produção foi de 5 a 10 segundos,
 * dentro do TTFB. Quem paga isso é justamente a primeira visita de cada URL,
 * que no caso do Googlebot é *a* visita que decide se a página entra no índice.
 *
 * Com o HTML no disco, a Vercel serve do CDN e a função não é tocada: o
 * `config.json` gerado pelo nitro tem `{"handle":"filesystem"}` ANTES do
 * catch-all para `/__server`. Ou seja, isto é aditivo — se um arquivo não for
 * gerado, aquela rota simplesmente continua sendo servida pela função, como
 * antes. Nada quebra por ausência.
 *
 * ## A lista de rotas não é escrita aqui
 *
 * Ela vem do próprio `/sitemap.xml`, pedido ao handler recém-construído. Assim
 * não nasce uma segunda lista de páginas para desincronizar da primeira: o que
 * é indexável é o que o sitemap declara. `/links` fica de fora automaticamente
 * (é `noindex` e fora do sitemap de propósito) e continua dinâmica, que é o que
 * ela precisa — o selo "aberto agora" é calculado por requisição.
 *
 * ## Os cabeçalhos precisam ser repostos
 *
 * Arquivo estático não passa pelo middleware de `src/start.ts`, então os
 * cabeçalhos que ele põe (preload da fonte, segurança, noindex em
 * `*.vercel.app`) sumiriam nessas rotas. São reinjetados como rotas de
 * `headers` no `config.json`, com `continue: true`, antes do filesystem.
 * É duplicação de regra, e duplicação é dívida — então ela não fica no escuro:
 * o próprio script compara o que o middleware acabou de devolver com o que as
 * rotas estáticas repõem, e falha o build nomeando qualquer cabeçalho novo que
 * tenha ficado para trás.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const RAIZ = process.cwd();
const SAIDA = join(RAIZ, ".vercel/output");
const FUNCAO = join(SAIDA, "functions/__server.func/index.mjs");
const ESTATICO = join(SAIDA, "static");
const CONFIG = join(SAIDA, "config.json");

// Só o build da Vercel produz o layout que este script entende. O build local
// padrão gera worker Cloudflare em `.output/` — ali não há o que fazer, e sair
// em silêncio é o certo: `npm run build` no laptop não pode quebrar por isso.
if (!existsSync(FUNCAO)) {
  console.log("· prerender: sem .vercel/output (preset não-Vercel), nada a fazer.");
  process.exit(0);
}

const { default: servidor } = await import(pathToFileURL(FUNCAO).href);
if (typeof servidor?.fetch !== "function") {
  console.error("✖ prerender: a função não exporta `fetch`. O preset do nitro mudou?");
  process.exit(1);
}

/** Qualquer origem serve: o app monta as URLs absolutas a partir de SITE_URL. */
const ORIGEM = "https://www.m7movelaria.com.br";

async function pegar(rota) {
  const res = await servidor.fetch(new Request(ORIGEM + rota));
  return {
    status: res.status,
    corpo: await res.text(),
    tipo: res.headers.get("content-type") ?? "",
    cabecalhos: res.headers,
  };
}

/**
 * Cabeçalhos de transporte, postos pelo runtime e não pelo middleware. Não
 * entram na comparação porque a Vercel os gera de novo para o arquivo estático.
 */
const TRANSPORTE = new Set([
  "content-type",
  "content-length",
  "content-encoding",
  "date",
  "etag",
  "transfer-encoding",
  "vary",
  "connection",
  "keep-alive",
]);

// A lista de páginas vem do sitemap — ver o bloco de comentário lá em cima.
const sitemap = await pegar("/sitemap.xml");
if (sitemap.status !== 200) {
  console.error(`✖ prerender: /sitemap.xml devolveu ${sitemap.status}; sem lista de rotas.`);
  process.exit(1);
}
const rotas = [...sitemap.corpo.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].replace(/^https?:\/\/[^/]+/, ""))
  .map((p) => p || "/");

let gravadas = 0;
const falhas = [];
/** `arquivo.html` → caminho em que a Vercel deve servi-lo (sem a extensão). */
const overrides = {};
/** As rotas que passaram a ser estáticas, para mirar os cabeçalhos só nelas. */
const estaticas = [];
/** Cabeçalhos que o middleware realmente pôs, para conferir contra os estáticos. */
let doMiddleware = null;
for (const rota of rotas) {
  const { status, corpo, tipo, cabecalhos } = await pegar(rota);
  if (status !== 200 || !tipo.includes("text/html")) {
    falhas.push(`${rota} → ${status} ${tipo}`);
    continue;
  }
  doMiddleware ??= cabecalhos;
  const arquivo = rota === "/" ? "index.html" : `${rota.replace(/^\//, "")}.html`;
  const destino = join(ESTATICO, arquivo);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, corpo, "utf8");
  // O `{"handle":"filesystem"}` casa o caminho literal: com o arquivo em
  // `sobre.html`, `/sobre` passava direto para a função (sem ganho nenhum) e
  // `/sobre.html` respondia 200 — uma segunda URL para cada página, que é
  // exatamente o conteúdo duplicado que o resto do site evita. `overrides` diz
  // à Vercel em que caminho servir o arquivo: `/sobre`, e só ele.
  if (rota !== "/") {
    overrides[arquivo] = { path: rota.replace(/^\//, ""), contentType: "text/html; charset=utf-8" };
  }
  estaticas.push(rota);
  gravadas++;
}

if (falhas.length > 0) {
  console.error(`✖ prerender: ${falhas.length} rota(s) não renderizaram:`);
  for (const f of falhas) console.error(`    ${f}`);
  process.exit(1);
}

// --- cabeçalhos que o middleware poria e o arquivo estático não recebe -------
const config = JSON.parse(readFileSync(CONFIG, "utf8"));
const SEGURANCA = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  link: '</fonts/inter-latin.woff2>; rel=preload; as=font; type="font/woff2"; crossorigin',
  "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
};
// A regex casa SÓ as rotas que viraram estáticas. Um catch-all `/(.*)` também
// funcionaria, mas aí as rotas que continuam na função receberiam cada
// cabeçalho duas vezes (uma do middleware, outra daqui) — observado em produção
// com o `link` do preload saindo duplicado.
const SO_ESTATICAS = `^(${estaticas.map((r) => r.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})$`;
const novas = [
  { src: SO_ESTATICAS, headers: SEGURANCA, continue: true },
  // Mesmo motivo do middleware: `*.vercel.app` serve o site inteiro com 200 e
  // sem isto o Google indexaria uma segunda cópia. Casa `.vercel.app` explícito,
  // nunca "host diferente do canônico" — a segunda forma marca o site todo como
  // noindex quando o host chega diferente do esperado.
  {
    src: SO_ESTATICAS,
    has: [{ type: "host", value: "(.*)\\.vercel\\.app" }],
    headers: { "x-robots-tag": "noindex, nofollow" },
    continue: true,
  },
];
// A duplicação acima só é segura se ninguém acrescentar um cabeçalho no
// middleware e esquecer daqui. Em vez de confiar na memória, comparamos com o
// que o middleware acabou de devolver de verdade: cabeçalho que ele põe e a
// rota estática não repõe quebra o build, com o nome dele na mensagem.
const esquecidos = [...doMiddleware.keys()].filter((h) => !TRANSPORTE.has(h) && !(h in SEGURANCA));
if (esquecidos.length > 0) {
  console.error(
    `✖ prerender: o middleware de src/start.ts põe cabeçalho(s) que a rota\n` +
      `  estática não reporia — as páginas pré-renderizadas sairiam sem eles:\n` +
      esquecidos.map((h) => `    ${h}: ${doMiddleware.get(h)}`).join("\n") +
      `\n\n  Acrescente em SEGURANCA (ou em TRANSPORTE, se for do runtime).`,
  );
  process.exit(1);
}

const jaTem = config.routes?.some((r) => r.headers?.link === SEGURANCA.link);
if (!jaTem) config.routes = [...novas, ...(config.routes ?? [])];
config.overrides = { ...(config.overrides ?? {}), ...overrides };
writeFileSync(CONFIG, JSON.stringify(config, null, 2), "utf8");

console.log(
  `✓ prerender: ${gravadas} páginas estáticas (${Object.keys(overrides).length} overrides); ` +
    `a função só atende o que sobrou.`,
);
