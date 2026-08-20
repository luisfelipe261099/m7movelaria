/**
 * Gera as variantes AVIF/WebP das imagens do site e o manifesto tipado que o
 * componente <Picture> consome.
 *
 * Rodar só quando *adicionar ou trocar* uma imagem em src/assets/:
 *
 *     npm run images
 *
 * As variantes são versionadas no git de propósito: assim o build da Vercel não
 * depende do sharp (que é um binário nativo pesado e um ponto de falha a mais no
 * CI). O script é idempotente — reprocessar não muda o resultado.
 *
 * Os originais em src/assets/*.jpg são a fonte de verdade e nunca são
 * modificados; tudo que o script produz vai para src/assets/generated/.
 *
 * O que ele faz:
 *  - `pano-*.jpg` (4096x2048, textura do tour 360°): vira WebP. AVIF foi
 *    descartado porque a decodificação de uma imagem desse tamanho em CPU de
 *    celular custa mais do que os KB que economiza.
 *  - demais imagens: reencoda o JPEG com mozjpeg (fallback) e gera AVIF + WebP.
 *  - escreve src/assets/generated/images.ts com URL das 3 variantes e as
 *    dimensões reais de cada imagem (é o que elimina o CLS).
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = path.join(ROOT, "src/assets");
const GENERATED = path.join(ASSETS, "generated");

/**
 * Larguras geradas por imagem. Só entram as menores ou iguais à largura
 * original — não faz sentido ampliar. 1600 cobre a maior área do layout em
 * telas 2x; 480 cobre um card de portfólio no celular, que hoje recebia a mesma
 * imagem de 1600px que o desktop.
 */
const WIDTHS = [480, 960, 1600];
const JPEG = { quality: 76, mozjpeg: true, progressive: true };
const WEBP = { quality: 78, effort: 6 };
const AVIF = { quality: 50, effort: 6 };

const isPanorama = (file) => file.startsWith("pano-");

function camelize(name) {
  return name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

async function main() {
  await mkdir(GENERATED, { recursive: true });
  const files = (await readdir(ASSETS)).filter((f) => f.endsWith(".jpg")).sort();

  const manifest = [];

  for (const file of files) {
    const base = file.replace(/\.jpg$/, "");
    const src = path.join(ASSETS, file);
    const input = await readFile(src);
    const meta = await sharp(input).metadata();

    if (isPanorama(file)) {
      // Equirretangular: manter a proporção 2:1 exata, senão o tour distorce.
      await sharp(input)
        .webp(WEBP)
        .toFile(path.join(GENERATED, `${base}.webp`));
      manifest.push({ base, kind: "panorama", width: meta.width, height: meta.height });
      continue;
    }

    const targets = WIDTHS.filter((w) => w <= meta.width);
    if (!targets.length) targets.push(meta.width);
    if (!targets.includes(Math.min(meta.width, WIDTHS[WIDTHS.length - 1]))) {
      targets.push(Math.min(meta.width, WIDTHS[WIDTHS.length - 1]));
    }

    const variants = [];
    for (const w of targets) {
      const resized = await sharp(input).resize({ width: w, withoutEnlargement: true }).toBuffer();
      const m = await sharp(resized).metadata();
      await sharp(resized)
        .jpeg(JPEG)
        .toFile(path.join(GENERATED, `${base}-${w}.jpg`));
      await sharp(resized)
        .webp(WEBP)
        .toFile(path.join(GENERATED, `${base}-${w}.webp`));
      await sharp(resized)
        .avif(AVIF)
        .toFile(path.join(GENERATED, `${base}-${w}.avif`));
      variants.push({ w: m.width, h: m.height });
    }

    const largest = variants[variants.length - 1];
    manifest.push({ base, kind: "image", width: largest.w, height: largest.h, variants });
  }

  const images = manifest.filter((m) => m.kind === "image");
  const panos = manifest.filter((m) => m.kind === "panorama");

  const lines = [
    "/* AUTO-GERADO por scripts/optimize-images.mjs — não editar à mão. */",
    "/* eslint-disable */",
    "",
    ...images.flatMap((m) =>
      m.variants.flatMap((v) => [
        `import ${camelize(m.base)}${v.w}Avif from "./${m.base}-${v.w}.avif";`,
        `import ${camelize(m.base)}${v.w}Webp from "./${m.base}-${v.w}.webp";`,
        `import ${camelize(m.base)}${v.w}Jpg from "./${m.base}-${v.w}.jpg";`,
      ]),
    ),
    "",
    "export type ImageVariants = {",
    "  /** srcset pronto, com descritor de largura, por formato. */",
    "  avif: string;",
    "  webp: string;",
    "  jpg: string;",
    "  /** Maior variante — usada como `src` de fallback. */",
    "  src: string;",
    "  /** Dimensões da maior variante: definem a proporção e evitam CLS. */",
    "  width: number;",
    "  height: number;",
    "};",
    "",
    "export const images = {",
    ...images.map((m) => {
      const set = (fmt) =>
        m.variants.map((v) => `\${${camelize(m.base)}${v.w}${fmt}} ${v.w}w`).join(", ");
      const last = m.variants[m.variants.length - 1];
      return (
        `  "${m.base}": {` +
        ` avif: \`${set("Avif")}\`,` +
        ` webp: \`${set("Webp")}\`,` +
        ` jpg: \`${set("Jpg")}\`,` +
        ` src: ${camelize(m.base)}${last.w}Jpg,` +
        ` width: ${m.width}, height: ${m.height} },`
      );
    }),
    "} satisfies Record<string, ImageVariants>;",
    "",
    "export type ImageName = keyof typeof images;",
    "",
    `/* Panorâmicas ficam fora do manifesto: são carregadas como textura pelo`,
    ` * Three.js, não por <img>. Disponíveis em WebP:`,
    ...panos.map((m) => ` *   generated/${m.base}.webp (${m.width}x${m.height})`),
    " */",
    "",
  ];

  await writeFile(path.join(GENERATED, "images.ts"), lines.join("\n"), "utf8");

  console.log(`${images.length} imagens (avif+webp+jpg) e ${panos.length} panorâmicas (webp).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
