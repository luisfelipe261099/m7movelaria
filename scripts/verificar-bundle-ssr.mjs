/**
 * Falha o build se o bundle do Three.js encostar no caminho de renderização
 * do servidor.
 *
 *     npm run check:ssr        (depois de `npm run build`)
 *
 * Por que isto existe:
 *
 * O Rollup agrupa sozinho os módulos compartilhados entre entradas. Como o
 * `@react-three/drei` é CommonJS e depende de `react` e de `react/jsx-runtime`,
 * o agrupamento automático colocou os *wrappers* de interop do React dentro do
 * chunk do drei — e aí todo chunk de rota passou a fazer
 *
 *     import { m as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs"
 *
 * só para conseguir JSX. Na prática: 2,6 MB de Three.js carregados e parseados
 * no boot da função serverless em TODA requisição, inclusive /contato e /sobre,
 * que não têm nada 3D. O custo aparecia como cold start de 5 a 10 segundos, e
 * resposta lenta é exatamente o que faz o Google reduzir a taxa de rastreio.
 *
 * No cliente isso nunca aconteceu (o `lazy()` em showroom-3d.tsx segura o
 * Three.js fora do caminho crítico). O vazamento era só do lado do servidor,
 * onde ninguém estava olhando — daí a verificação automática.
 *
 * O conserto NÃO é no vite.config: com Vite 8 + rolldown quem agrupa os chunks
 * do servidor é o `codeSplitting.groups` do Nitro, e o `defu` põe o grupo dele
 * antes de qualquer coisa vinda do projeto — `manualChunks` em `environments.ssr`
 * ou `environments.nitro` é aceito, roda, e não muda um byte da saída. O corte
 * tem que ser na origem: `import.meta.env.SSR` em volta do `import()`, para o
 * build do servidor descartar o ramo e nunca visitar o Three.js.
 *
 * A regra: só quem realmente usa a API do drei pode importar do chunk dele.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Onde os chunks do servidor param depende do preset do nitro: build local
 * padrão gera worker Cloudflare em `.output/`, e com VERCEL=1 (ou
 * NITRO_PRESET=vercel) sai a função da Build Output API em `.vercel/`. A
 * Vercel é o que vai ao ar, então tem precedência quando os dois existem.
 */
const CANDIDATOS = [".vercel/output/functions/__server.func/_ssr", ".output/server/_ssr"];
const DIR_SSR = CANDIDATOS.find((d) => existsSync(d)) ?? CANDIDATOS[1];

/**
 * Chunks que podem legitimamente importar do bundle 3D, porque de fato usam a
 * API dele. É o visualizador de panorâmica e a rota que o carrega sob demanda.
 */
const PERMITIDOS = [/^PanoramaViewer-/, /^showroom-3d-/];

/** Importa QUALQUER coisa de um chunk cujo caminho contenha three/drei/fiber. */
const IMPORT_3D = /^import\s*\{([^}]*)\}\s*from\s*"([^"]*(?:@react-three|three)[^"]*)"/gm;

let chunks;
try {
  chunks = readdirSync(DIR_SSR).filter((f) => f.endsWith(".mjs"));
} catch {
  console.error(`✖ ${DIR_SSR} não existe — rode \`npm run build\` antes.`);
  process.exit(1);
}

const infratores = [];
for (const arquivo of chunks) {
  if (PERMITIDOS.some((re) => re.test(arquivo))) continue;
  const fonte = readFileSync(join(DIR_SSR, arquivo), "utf8");
  for (const [, nomes, origem] of fonte.matchAll(IMPORT_3D)) {
    infratores.push({ arquivo, origem, nomes: nomes.trim().replace(/\s+/g, " ") });
  }
}

if (infratores.length > 0) {
  console.error(
    `✖ ${infratores.length} chunk(s) de servidor importam do bundle 3D sem usar 3D.\n` +
      `  Isso arrasta o Three.js para o boot da função serverless em toda requisição.\n`,
  );
  for (const { arquivo, origem, nomes } of infratores) {
    console.error(`  ${arquivo}\n      de: ${origem}\n      usa: ${nomes}`);
  }
  console.error(
    `\n  Conserto: envolver o import() do componente 3D com \`import.meta.env.SSR\`` +
      `\n  na rota que o carrega (src/routes/showroom-3d.tsx é o exemplo), para o` +
      `\n  build do servidor descartar o ramo. Mexer em manualChunks no vite.config` +
      `\n  não resolve: o agrupamento do Nitro tem precedência sobre o do projeto.`,
  );
  process.exit(1);
}

console.log(`✓ nenhum dos ${chunks.length} chunks de servidor arrasta o Three.js (${DIR_SSR}).`);
