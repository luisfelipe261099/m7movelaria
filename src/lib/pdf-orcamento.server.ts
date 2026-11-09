/**
 * Gera o PDF do orçamento que vai anexado ao e-mail do lead.
 *
 * ## Por que escrito à mão
 *
 * Esta função roda na serverless da Vercel, e o tamanho dela é o que manda no
 * cold start — AGENTS.md trata o pacote do servidor como caminho crítico
 * (resposta lenta derruba a taxa de rastreio do Google). Uma biblioteca de PDF
 * acrescentaria algumas centenas de KB ao pacote para desenhar o que aqui é
 * uma folha de texto: cabeçalho, tabela e rodapé. O escritor abaixo faz só
 * isso e cabe em alguns KB.
 *
 * ## Fonte
 *
 * Helvetica, uma das catorze fontes-base que todo leitor de PDF já tem — não
 * embute arquivo nenhum. O texto é codificado em WinAnsi, que cobre todo o
 * português (á, ã, ç, ê, õ) mais o travessão e o sinal de multiplicação que as
 * linhas de item usam.
 *
 * As larguras abaixo são as da Helvetica, extraídas da Liberation Sans
 * (metricamente compatível com Arial, que é metricamente compatível com a
 * Helvetica). Sem elas não dá para quebrar linha nem alinhar coluna à direita:
 * o PDF não mede texto sozinho.
 */

/** Largura de cada caractere, em milésimos do corpo, de WinAnsi 32 a 255. */
const LARGURA_NORMAL =
  "278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,552,400,549,333,333,333,576,537,333,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,549,611,556,556,556,556,500,556,500"
    .split(",")
    .map(Number);
const LARGURA_NEGRITO =
  "278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,552,400,549,333,333,333,576,556,333,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,549,611,611,611,611,611,556,611,556"
    .split(",")
    .map(Number);

/**
 * Caracteres que o português e as linhas de item usam e que o WinAnsi guarda
 * fora do Latin-1. Sem este mapa o travessão viraria "?" no PDF.
 */
const WINANSI_EXTRA: Record<string, number> = {
  "€": 0x80, // €
  "‚": 0x82,
  ƒ: 0x83,
  "„": 0x84,
  "…": 0x85, // …
  "†": 0x86,
  "‡": 0x87,
  ˆ: 0x88,
  "‰": 0x89,
  Š: 0x8a,
  "‹": 0x8b,
  Œ: 0x8c,
  Ž: 0x8e,
  "‘": 0x91,
  "’": 0x92,
  "“": 0x93,
  "”": 0x94,
  "•": 0x95, // •
  "–": 0x96, // –
  "—": 0x97, // —
  "˜": 0x98,
  "™": 0x99,
  š: 0x9a,
  "›": 0x9b,
  œ: 0x9c,
  ž: 0x9e,
  Ÿ: 0x9f,
};

/** Converte para os bytes do WinAnsi; o que não existir na tabela vira "?". */
function winansi(texto: string): number[] {
  const saida: number[] = [];
  for (const ch of texto) {
    const extra = WINANSI_EXTRA[ch];
    if (extra !== undefined) {
      saida.push(extra);
      continue;
    }
    const cp = ch.codePointAt(0) ?? 63;
    saida.push(cp >= 32 && cp <= 255 ? cp : 63);
  }
  return saida;
}

type Peso = "normal" | "negrito";

/** Largura do texto em pontos, no corpo pedido. */
function larguraDe(texto: string, corpo: number, peso: Peso): number {
  const tabela = peso === "negrito" ? LARGURA_NEGRITO : LARGURA_NORMAL;
  let total = 0;
  for (const b of winansi(texto)) total += tabela[b - 32] ?? 500;
  return (total * corpo) / 1000;
}

/** Quebra o texto na largura disponível, sem cortar palavra. */
function quebra(texto: string, largura: number, corpo: number, peso: Peso): string[] {
  const linhas: string[] = [];
  let atual = "";
  for (const palavra of texto.split(/\s+/)) {
    const teste = atual ? `${atual} ${palavra}` : palavra;
    if (larguraDe(teste, corpo, peso) <= largura || !atual) {
      atual = teste;
    } else {
      linhas.push(atual);
      atual = palavra;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

/** Escapa o que é delimitador dentro de uma string literal de PDF. */
function literal(texto: string): string {
  const bytes = winansi(texto).map((b) => {
    if (b === 0x28 || b === 0x29 || b === 0x5c) return `\\${String.fromCharCode(b)}`;
    if (b < 32 || b > 126) return `\\${b.toString(8).padStart(3, "0")}`;
    return String.fromCharCode(b);
  });
  return `(${bytes.join("")})`;
}

/** Folha A4 em pontos, e as margens do documento. */
const PAG_L = 595.28;
const PAG_A = 841.89;
const MARGEM = 48;
const UTIL = PAG_L - 2 * MARGEM;

/** Cor em RGB de 0 a 1, que é como o PDF escreve. */
type Cor = readonly [number, number, number];

/** As mesmas cores da marca usadas no e-mail do lead. */
const BRONZE: Cor = [0.576, 0.376, 0.239];
const TINTA: Cor = [0.168, 0.153, 0.137];
const CINZA: Cor = [0.435, 0.4, 0.361];
const LINHA_COR: Cor = [0.871, 0.843, 0.804];
const BRANCO: Cor = [1, 1, 1];

/**
 * Acumula os comandos de desenho de uma página. O eixo Y do PDF cresce para
 * cima; `y` aqui é a distância a partir do topo, que é como se lê um layout.
 */
class Pagina {
  partes: string[] = [];

  texto(t: string, x: number, y: number, corpo: number, peso: Peso, cor: Cor = TINTA) {
    this.partes.push(
      `BT /${peso === "negrito" ? "FB" : "FR"} ${corpo} Tf ` +
        `${cor[0]} ${cor[1]} ${cor[2]} rg ` +
        `1 0 0 1 ${x.toFixed(2)} ${(PAG_A - y).toFixed(2)} Tm ${literal(t)} Tj ET`,
    );
  }

  /** Texto alinhado pela direita — usado nos preços, que precisam bater coluna. */
  textoDireita(t: string, direita: number, y: number, corpo: number, peso: Peso, cor: Cor = TINTA) {
    this.texto(t, direita - larguraDe(t, corpo, peso), y, corpo, peso, cor);
  }

  retangulo(x: number, y: number, l: number, a: number, cor: Cor) {
    this.partes.push(
      `${cor[0]} ${cor[1]} ${cor[2]} rg ` +
        `${x.toFixed(2)} ${(PAG_A - y - a).toFixed(2)} ${l.toFixed(2)} ${a.toFixed(2)} re f`,
    );
  }

  regua(y: number, cor: Cor = LINHA_COR) {
    this.partes.push(
      `${cor[0]} ${cor[1]} ${cor[2]} RG 0.6 w ` +
        `${MARGEM} ${(PAG_A - y).toFixed(2)} m ${(PAG_L - MARGEM).toFixed(2)} ${(PAG_A - y).toFixed(2)} l S`,
    );
  }

  get conteudo(): string {
    return this.partes.join("\n");
  }
}

/**
 * Monta o arquivo PDF a partir das páginas já desenhadas.
 *
 * Estrutura mínima: catálogo, árvore de páginas, uma página por folha com o
 * seu fluxo de conteúdo, e as duas Helvetica em WinAnsi. A tabela xref precisa
 * trazer o deslocamento exato de cada objeto em bytes, por isso o documento é
 * montado em Buffer e não em string — acento é dois bytes em UTF-8 e um só em
 * WinAnsi, e contar caractere daria deslocamento errado.
 */
function montaPdf(paginas: Pagina[]): Buffer {
  const objetos: Buffer[] = [];
  const add = (corpo: string | Buffer) => {
    objetos.push(Buffer.isBuffer(corpo) ? corpo : Buffer.from(corpo, "latin1"));
    return objetos.length; // número do objeto, 1-based
  };

  const idPaginas = 1;
  objetos.push(Buffer.alloc(0)); // reservado para a árvore de páginas
  const idFonteR = add(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  );
  const idFonteB = add(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  );

  const idsPagina: number[] = [];
  for (const p of paginas) {
    const fluxo = Buffer.from(p.conteudo, "latin1");
    const idFluxo = add(
      Buffer.concat([
        Buffer.from(`<< /Length ${fluxo.length} >>\nstream\n`, "latin1"),
        fluxo,
        Buffer.from("\nendstream", "latin1"),
      ]),
    );
    idsPagina.push(
      add(
        `<< /Type /Page /Parent ${idPaginas} 0 R /MediaBox [0 0 ${PAG_L} ${PAG_A}] ` +
          `/Resources << /Font << /FR ${idFonteR} 0 R /FB ${idFonteB} 0 R >> >> ` +
          `/Contents ${idFluxo} 0 R >>`,
      ),
    );
  }

  objetos[idPaginas - 1] = Buffer.from(
    `<< /Type /Pages /Kids [${idsPagina.map((i) => `${i} 0 R`).join(" ")}] /Count ${idsPagina.length} >>`,
    "latin1",
  );
  const idCatalogo = add(`<< /Type /Catalog /Pages ${idPaginas} 0 R >>`);

  const pedacos: Buffer[] = [Buffer.from("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n", "latin1")];
  let posicao = pedacos[0].length;
  const deslocamentos: number[] = [];
  objetos.forEach((corpo, i) => {
    deslocamentos.push(posicao);
    const bloco = Buffer.concat([
      Buffer.from(`${i + 1} 0 obj\n`, "latin1"),
      corpo,
      Buffer.from("\nendobj\n", "latin1"),
    ]);
    pedacos.push(bloco);
    posicao += bloco.length;
  });

  const inicioXref = posicao;
  const xref = [
    `xref`,
    `0 ${objetos.length + 1}`,
    `0000000000 65535 f `,
    ...deslocamentos.map((d) => `${String(d).padStart(10, "0")} 00000 n `),
    `trailer`,
    `<< /Size ${objetos.length + 1} /Root ${idCatalogo} 0 R >>`,
    `startxref`,
    `${inicioXref}`,
    `%%EOF`,
  ].join("\n");
  pedacos.push(Buffer.from(xref, "latin1"));
  return Buffer.concat(pedacos);
}

export type DadosPdf = {
  nome: string;
  contato: string;
  codigo: string;
  total: number;
  itens: string[];
  /** Data de validade que a tela mostrou, quando veio. */
  validade?: string;
  /** Endereço e telefone do ateliê, passados de fora para não duplicar o NAP. */
  endereco: string;
  cidade: string;
  telefone: string;
  site: string;
};

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Separa a linha de item nas três colunas.
 *
 * As linhas chegam no formato que `linhasDosItens` monta no simulador:
 * "Nome (frente) — 1200 × 850 × 560 mm — R$ 1.840,00". Quando o formato não
 * bater, a linha inteira vira descrição — melhor uma coluna feia do que perder
 * o item.
 */
function colunas(linha: string): { descricao: string; medidas: string; preco: string } {
  const partes = linha.split(" — ");
  if (partes.length >= 3) {
    return {
      descricao: partes.slice(0, partes.length - 2).join(" — "),
      medidas: partes[partes.length - 2],
      preco: partes[partes.length - 1],
    };
  }
  return { descricao: linha, medidas: "", preco: "" };
}

/** Desenha o cabeçalho da folha e devolve o y onde o conteúdo começa. */
function cabecalho(p: Pagina, d: DadosPdf, continuacao: boolean): number {
  p.retangulo(0, 0, PAG_L, 92, BRONZE);
  p.texto("M 7   M O V E L A R I A", MARGEM, 40, 10, "negrito", BRANCO);
  p.texto(
    continuacao ? "Orçamento simulado (continuação)" : "Orçamento simulado",
    MARGEM,
    64,
    19,
    "negrito",
    BRANCO,
  );
  p.textoDireita(d.codigo, PAG_L - MARGEM, 64, 13, "negrito", BRANCO);
  return 124;
}

/** Rodapé com o NAP e o número da folha. */
function rodape(p: Pagina, d: DadosPdf, folha: number, folhas: number) {
  const y = PAG_A - 54;
  p.regua(y - 14);
  p.texto(`${d.endereco} — ${d.cidade}`, MARGEM, y, 8, "normal", CINZA);
  p.texto(`${d.telefone} · ${d.site}`, MARGEM, y + 11, 8, "normal", CINZA);
  p.textoDireita(`Folha ${folha} de ${folhas}`, PAG_L - MARGEM, y, 8, "normal", CINZA);
}

/**
 * Monta o PDF do orçamento.
 *
 * O que entra é só o que a pessoa realmente escolheu na tela e o que o site já
 * diz em texto. Nada de prazo em dias, condição de pagamento ou desconto: o
 * documento avisa, nele mesmo, que é simulação e não proposta fechada — é a
 * mesma ressalva que a tela e o e-mail trazem.
 */
export function pdfDoOrcamento(d: DadosPdf): Buffer {
  const COL_MEDIDAS = MARGEM + UTIL * 0.52;
  const DIREITA = PAG_L - MARGEM;
  const paginas: Pagina[] = [];

  let p = new Pagina();
  paginas.push(p);
  let y = cabecalho(p, d, false);

  // ── quem pediu
  p.texto("Cliente", MARGEM, y, 8.5, "normal", CINZA);
  p.texto(d.nome, MARGEM, y + 15, 15, "negrito");
  p.texto(d.contato, MARGEM, y + 31, 10, "normal", CINZA);
  if (d.validade) {
    p.textoDireita("Válido até", DIREITA, y, 8.5, "normal", CINZA);
    p.textoDireita(d.validade, DIREITA, y + 15, 12, "negrito");
  }
  y += 52;
  p.regua(y);
  y += 22;

  // ── tabela
  p.texto("Peça", MARGEM, y, 8.5, "negrito", CINZA);
  p.texto("Medidas", COL_MEDIDAS, y, 8.5, "negrito", CINZA);
  p.textoDireita("Valor", DIREITA, y, 8.5, "negrito", CINZA);
  y += 8;
  p.regua(y);
  y += 18;

  const larguraDescricao = COL_MEDIDAS - MARGEM - 12;
  for (const item of d.itens) {
    const { descricao, medidas, preco } = colunas(item);
    const linhas = quebra(descricao, larguraDescricao, 10, "normal");
    const altura = Math.max(linhas.length * 13, 13) + 13;

    // Cabe nesta folha? Senão, abre outra com o mesmo cabeçalho.
    if (y + altura > PAG_A - 120) {
      p = new Pagina();
      paginas.push(p);
      y = cabecalho(p, d, true) + 10;
      p.texto("Peça", MARGEM, y, 8.5, "negrito", CINZA);
      p.texto("Medidas", COL_MEDIDAS, y, 8.5, "negrito", CINZA);
      p.textoDireita("Valor", DIREITA, y, 8.5, "negrito", CINZA);
      y += 8;
      p.regua(y);
      y += 18;
    }

    linhas.forEach((l, i) => p.texto(l, MARGEM, y + i * 13, 10, "normal"));
    if (medidas) p.texto(medidas, COL_MEDIDAS, y, 9.5, "normal", CINZA);
    if (preco) p.textoDireita(preco, DIREITA, y, 10, "negrito");
    y += altura;
    p.regua(y - 7);
  }

  // ── total
  y += 10;
  p.texto("Total simulado", MARGEM, y + 4, 11, "normal", CINZA);
  p.textoDireita(brl(d.total), DIREITA, y + 6, 18, "negrito", BRONZE);
  y += 30;
  p.regua(y);
  y += 24;

  // ── ressalva, a mesma da tela e do e-mail
  for (const linha of quebra(
    "Este documento é a simulação que a pessoa montou no site. O valor depende da conferência " +
      "das medidas no local e não vale como proposta comercial fechada. A composição de chapa, " +
      "fita e ferragem é definida no projeto executivo, antes do corte.",
    UTIL,
    9,
    "normal",
  )) {
    p.texto(linha, MARGEM, y, 9, "normal", CINZA);
    y += 13;
  }

  paginas.forEach((pg, i) => rodape(pg, d, i + 1, paginas.length));
  return montaPdf(paginas);
}
