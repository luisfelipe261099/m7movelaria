/**
 * Motor de cálculo do simulador de orçamento.
 *
 * A conta é a mesma que a marcenaria faz na planilha, só que explícita:
 *   custo = chapa (por espessura e cor) + fita de borda + ferragem + insumos
 *   preço = custo × FATOR_SITE
 *
 * Duas regras que vieram direto do cliente e que o código precisa respeitar:
 *  - a frente (portas, gavetas, gavetão) é escolha da pessoa dentro de limites
 *    de largura de porta e de altura/largura de gaveta — ver `precos.ts`;
 *  - a torre quente é dimensionada pelas medidas dos eletrodomésticos que a
 *    pessoa digita, então o nicho (e a altura de porta que sobra) sai do forno
 *    e do micro-ondas dela, não de um padrão fixo.
 *
 * Tudo em milímetros na entrada e em metros no cálculo de área.
 */

import {
  CHAPAS,
  CORES,
  CORREDICA_PAR,
  DESCONTO_PIX,
  DOBRADICA,
  ENTREGA_LOCAL,
  FATOR_SITE,
  FITA_ML,
  FOLGA_ELETRO,
  GAVETA_ALTURA,
  GAVETA_LARGURA_MAX,
  INSUMOS_PCT,
  MODULOS,
  PARAFUSO,
  PARAFUSOS_CAIXA,
  PARAFUSOS_POR_FRENTE,
  PARAFUSOS_POR_PRATELEIRA,
  PARCELAS_MAX,
  PORTA_LARGURA,
  PUXADOR,
  RIPADO_FATOR_MATERIAL,
  UNIBLOCK,
  UNIBLOCK_POR_PRATELEIRA,
  UNIDADES_FILEIRA,
  porM2,
  type Frente,
  type Modulo,
  type ModuloId,
} from "@/data/precos";

export type MedidaEletro = { largura: number; altura: number; profundidade: number };

export type ItemConfig = {
  /** Identificador da linha no carrinho (não é o id do módulo). */
  uid: string;
  moduloId: ModuloId;
  largura: number;
  altura: number;
  profundidade: number;
  quantidade: number;
  /** Frente escolhida (id em `modulo.frentes`); ausente = padrão do módulo. */
  frenteId?: string;
  /** Só na torre quente. */
  forno?: MedidaEletro;
  micro?: MedidaEletro;
};

export type Acabamento = {
  /** Cor da chapa das frentes. O interior é sempre branco. */
  corId: string;
  /** Porta ripada — usinagem ainda não orçada pela M7. */
  ripada: boolean;
  puxador: boolean;
};

export type LinhaCusto = { descricao: string; detalhe: string; valor: number };

export type ItemCalculado = {
  item: ItemConfig;
  modulo: Modulo;
  linhas: LinhaCusto[];
  /** Custo de um módulo, sem multiplicador. */
  custoUnitario: number;
  /** Preço de venda já multiplicado e arredondado, vezes a quantidade. */
  preco: number;
  /** Avisos de dimensionamento (medida fora da faixa, eletro sem medida). */
  avisos: string[];
  /** Frente escolhida, já com medidas — para descrição, resumo e pedido. */
  fileiras: FileiraCalculada[];
  frente?: Frente;
  portas: number;
  gavetas: number;
  prateleiras: number;
};

export type Entrega = "local" | "distante";

export type Orcamento = {
  itens: ItemCalculado[];
  subtotal: number;
  entrega: number;
  /** `true` quando o frete sai da faixa atendida e precisa de cotação. */
  freteSobConsulta: boolean;
  total: number;
  totalPix: number;
  parcela: number;
  parcelas: number;
};

const m = (mm: number) => mm / 1000;
const arredonda = (v: number) => Math.round(v / 10) * 10;

export const moduloPorId = (id: ModuloId): Modulo =>
  MODULOS.find((mod) => mod.id === id) ?? MODULOS[0];

export const corPorId = (id: string) => CORES.find((c) => c.id === id) ?? CORES[0];

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const brlExato = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** A frente escolhida do item, ou o padrão do módulo; `undefined` em módulo sem opções (torre). */
export const frenteDoItem = (item: ItemConfig, modulo: Modulo): Frente | undefined =>
  modulo.frentes?.find((f) => f.id === item.frenteId) ?? modulo.frentes?.[0];

export type FileiraCalculada =
  | { tipo: "portas"; n: number; largura: number; altura: number }
  | { tipo: "gaveta"; tamanho: "normal" | "gavetao"; altura: number };

/**
 * As fileiras de frente do item com medidas reais, em mm, de cima para baixo.
 * A altura de cada fileira é a fatia proporcional de `alturaFrente` pelo peso
 * em UNIDADES_FILEIRA; portas dividem a largura do módulo entre as folhas.
 * Módulo sem `frentes` (torre quente) cai no legado: portas lado a lado na
 * altura inteira e gavetas iguais.
 */
export function fileirasDoItem(
  item: ItemConfig,
  modulo: Modulo,
  alturaFrente: number,
): FileiraCalculada[] {
  const frente = frenteDoItem(item, modulo);
  if (!frente) {
    const saida: FileiraCalculada[] = [];
    if (modulo.portas > 0)
      saida.push({
        tipo: "portas",
        n: modulo.portas,
        largura: item.largura / modulo.portas,
        altura: alturaFrente,
      });
    for (let i = 0; i < modulo.gavetas; i++)
      saida.push({ tipo: "gaveta", tamanho: "normal", altura: alturaFrente / modulo.gavetas });
    return saida;
  }
  const peso = (f: Frente["fileiras"][number]) =>
    f.tipo === "portas" ? UNIDADES_FILEIRA.portas : UNIDADES_FILEIRA[f.tamanho];
  const total = frente.fileiras.reduce((acc, f) => acc + peso(f), 0);
  return frente.fileiras.map((f) => {
    const altura = (alturaFrente * peso(f)) / total;
    return f.tipo === "portas"
      ? { tipo: "portas", n: f.n, largura: item.largura / f.n, altura }
      : { tipo: "gaveta", tamanho: f.tamanho, altura };
  });
}

/**
 * Por que uma frente não serve para esta largura — ou `null` se serve. É o
 * texto do chip desabilitado na tela de medidas.
 */
export function motivoIndisponivel(frente: Frente, largura: number): string | null {
  for (const f of frente.fileiras) {
    if (f.tipo === "portas") {
      const w = Math.round(largura / f.n);
      if (w > PORTA_LARGURA[1])
        return `cada porta ficaria com ${w} mm; o máximo é ${PORTA_LARGURA[1]} mm por folha`;
      if (w < PORTA_LARGURA[0])
        return `cada porta ficaria com ${w} mm; o mínimo é ${PORTA_LARGURA[0]} mm por folha`;
    } else if (largura > GAVETA_LARGURA_MAX) {
      return `gaveta vai até ${GAVETA_LARGURA_MAX} mm de largura, pela corrediça`;
    }
  }
  return null;
}

/**
 * Problemas da frente escolhida com as medidas atuais (largura de porta,
 * largura e altura de gaveta). Aparecem ao lado dos campos e no resumo.
 */
export function problemasDeFrente(item: ItemConfig, modulo: Modulo): string[] {
  if (!modulo.frentes || !item.largura || !item.altura) return [];
  const problemas: string[] = [];
  const frente = frenteDoItem(item, modulo)!;
  const motivo = motivoIndisponivel(frente, item.largura);
  if (motivo)
    problemas.push(`Com ${item.largura} mm de largura, "${frente.nome}" não fecha: ${motivo}.`);
  for (const f of fileirasDoItem(item, modulo, item.altura)) {
    if (f.tipo !== "gaveta") continue;
    const h = Math.round(f.altura);
    if (h < GAVETA_ALTURA[0] || h > GAVETA_ALTURA[1]) {
      problemas.push(
        `Uma das gavetas ficaria com ${h} mm de altura; gaveta vai de ${GAVETA_ALTURA[0]} a ${GAVETA_ALTURA[1]} mm. Troque a frente ou a altura do módulo.`,
      );
      break;
    }
  }
  return problemas;
}

/**
 * Altura ocupada pelos nichos da torre quente. Cada eletrodoméstico ganha uma
 * folga de instalação; sem as medidas, cai num nicho padrão só para o
 * orçamento não travar — e o item recebe um aviso na tela.
 */
function alturaNichos(item: ItemConfig): { altura: number; avisos: string[] } {
  const avisos: string[] = [];
  const forno = item.forno?.altura;
  const micro = item.micro?.altura;
  if (!forno || !micro)
    avisos.push("Informe as medidas do forno e do micro-ondas para o nicho sair exato.");
  const alturaForno = (forno ?? 600) + FOLGA_ELETRO * 2;
  const alturaMicro = (micro ?? 390) + FOLGA_ELETRO * 2;
  return { altura: alturaForno + alturaMicro, avisos };
}

function calculaItem(item: ItemConfig, acab: Acabamento): ItemCalculado {
  const modulo = moduloPorId(item.moduloId);
  const cor = corPorId(acab.corId);
  const avisos: string[] = [];

  const L = m(item.largura);
  const A = m(item.altura);
  const P = m(item.profundidade);

  const fora = (valor: number, [min, max]: [number, number], nome: string) => {
    if (valor < min || valor > max) {
      avisos.push(`${nome} de ${valor} mm está fora da faixa do site (${min}–${max} mm).`);
    }
  };
  fora(item.largura, modulo.limites.largura, "Largura");
  fora(item.altura, modulo.limites.altura, "Altura");
  fora(item.profundidade, modulo.limites.profundidade, "Profundidade");

  // Altura de frente: na torre quente os nichos comem parte da coluna.
  let alturaFrente = A;
  let travessasExtras = 0;
  if (modulo.eletros) {
    const nichos = alturaNichos(item);
    avisos.push(...nichos.avisos);
    alturaFrente = Math.max(0, A - m(nichos.altura));
    travessasExtras = 3; // divisórias horizontais que fecham os dois nichos
  }

  // ————— frente escolhida —————
  // Portas e gavetas saem das fileiras do item, não do módulo: é a escolha da
  // pessoa (1, 2 ou 3 portas; gavetas com ou sem gavetão) que dita dobradiça,
  // corrediça, fita e puxador.
  avisos.push(...problemasDeFrente(item, modulo));
  const fileiras = fileirasDoItem(item, modulo, alturaFrente * 1000);
  const portas = fileiras.filter((f) => f.tipo === "portas");
  const gavetas = fileiras.filter((f) => f.tipo === "gaveta");
  const nPortas = portas.reduce((acc, f) => acc + f.n, 0);
  const nGavetas = gavetas.length;
  // Prateleira não faz sentido num módulo só de gavetas (balcão de gavetas);
  // numa estante aberta, sem frente nenhuma, ela é o próprio móvel.
  const soGavetas = nGavetas > 0 && nPortas === 0;
  const prateleiras = soGavetas ? 0 : modulo.prateleiras;
  const forma = modulo.forma ?? "caixa";

  // ————— chapa —————
  // O interior é sempre MDF 15 mm branco; a chapa de cor entra só nas frentes,
  // que é como a M7 compra: uma chapa barata para a caixa e uma cara para o
  // que aparece. A caixa da gaveta é um pouco mais baixa que a frente.
  const caixasGavetaM2 = gavetas.reduce((acc, g) => {
    const h = m(g.altura) * 0.8;
    return acc + 2 * h * P + 2 * h * L;
  }, 0);
  // Painel: só a chapa de cor na parede. Bancada: tampo em chapa de cor
  // sobre duas laterais em MDF branco, sem fundo. Caixa: o de sempre.
  const interiorM2 =
    forma === "painel"
      ? 0
      : forma === "bancada"
        ? 2 * A * P
        : 2 * A * P + // laterais
          (2 + prateleiras + travessasExtras) * L * P + // base, tampo, prateleiras e travessas
          caixasGavetaM2;
  const frentesM2 =
    forma === "painel"
      ? L * A
      : forma === "bancada"
        ? L * P
        : nPortas + nGavetas > 0
          ? L * alturaFrente
          : 0;
  const fundoM2 = forma === "caixa" ? L * A + nGavetas * L * P : 0;

  // ————— fita de borda —————
  // Preço único por metro aplicado, nas bordas aparentes da caixa e no
  // perímetro de cada frente.
  const perimetroPortas = portas.reduce(
    (acc, f) => acc + f.n * 2 * (m(f.largura) + m(f.altura)),
    0,
  );
  const perimetroGavetas = gavetas.reduce((acc, g) => acc + 2 * (L + m(g.altura)), 0);
  const fitaMl =
    forma === "painel"
      ? 2 * (L + A)
      : forma === "bancada"
        ? 2 * (L + P) + 2 * (2 * A + 2 * P)
        : (2 + prateleiras + travessasExtras) * L + 2 * A + perimetroPortas + perimetroGavetas;

  // ————— ferragem —————
  const dobradicas = portas.reduce((acc, f) => acc + f.n * (m(f.altura) > 1.2 ? 3 : 2), 0);
  const frentes = nPortas + nGavetas;
  const uniblocks = prateleiras * UNIBLOCK_POR_PRATELEIRA;
  const parafusos =
    PARAFUSOS_CAIXA + frentes * PARAFUSOS_POR_FRENTE + prateleiras * PARAFUSOS_POR_PRATELEIRA;

  const linhas: LinhaCusto[] = [];
  if (interiorM2 > 0) {
    linhas.push({
      descricao: forma === "bancada" ? "Laterais em MDF 15 mm branco" : "Caixa em MDF 15 mm branco",
      detalhe: `${interiorM2.toFixed(2)} m²${forma === "bancada" ? "" : " · laterais, prateleiras e gavetas"}`,
      valor: interiorM2 * porM2(CHAPAS.interior),
    });
  }
  if (fundoM2 > 0) {
    linhas.push({
      descricao: "Fundo em MDF 6 mm",
      detalhe: `${fundoM2.toFixed(2)} m²`,
      valor: fundoM2 * porM2(CHAPAS.fundo),
    });
  }

  if (frentesM2 > 0 && forma !== "caixa") {
    linhas.push({
      descricao: `${forma === "painel" ? "Painel" : "Tampo"} em chapa ${cor.nome}`,
      detalhe: `${frentesM2.toFixed(2)} m²`,
      valor: frentesM2 * porM2(CHAPAS.frente),
    });
  } else if (frentesM2 > 0) {
    // O ripado dobra o consumo de chapa da frente: as ripas saem da mesma
    // chapa, então a área cotada vai a duas vezes a área da porta.
    const consumoFrente = frentesM2 * (acab.ripada ? RIPADO_FATOR_MATERIAL : 1);
    linhas.push({
      descricao: `Frentes em chapa ${cor.nome}${acab.ripada ? " com ripado" : ""}`,
      detalhe: acab.ripada
        ? `${frentesM2.toFixed(2)} m² de porta · ${consumoFrente.toFixed(2)} m² de chapa (o ripado dobra o material)`
        : `${frentesM2.toFixed(2)} m² · ${frentes} ${frentes === 1 ? "frente" : "frentes"}`,
      valor: consumoFrente * porM2(CHAPAS.frente),
    });
  }

  linhas.push({
    descricao: "Fita de borda",
    detalhe: `${fitaMl.toFixed(1)} m aplicados`,
    valor: fitaMl * FITA_ML,
  });
  if (dobradicas > 0) {
    linhas.push({
      descricao: "Dobradiças",
      detalhe: `${dobradicas} un`,
      valor: dobradicas * DOBRADICA,
    });
  }
  if (nGavetas > 0) {
    linhas.push({
      descricao: "Corrediças ocultas",
      detalhe: `${nGavetas} ${nGavetas === 1 ? "par" : "pares"}`,
      valor: nGavetas * CORREDICA_PAR,
    });
  }
  if (uniblocks > 0) {
    linhas.push({
      descricao: "Suportes de prateleira Uniblock",
      detalhe: `${uniblocks} un · ${UNIBLOCK_POR_PRATELEIRA} por prateleira`,
      valor: uniblocks * UNIBLOCK,
    });
  }
  linhas.push({
    descricao: "Parafusos",
    detalhe: `${parafusos} un`,
    valor: parafusos * PARAFUSO,
  });
  if (acab.puxador && frentes > 0) {
    linhas.push({
      descricao: "Puxador",
      detalhe: `${frentes} un`,
      valor: frentes * PUXADOR,
    });
  }

  const material = linhas.reduce((s, l) => s + l.valor, 0);
  const insumos = material * INSUMOS_PCT;
  linhas.push({
    descricao: "Cola, tarugo e fita crepe",
    detalhe: `${Math.round(INSUMOS_PCT * 100)}% sobre o material`,
    valor: insumos,
  });

  const custoUnitario = material + insumos;
  const preco = arredonda(custoUnitario * FATOR_SITE) * item.quantidade;

  return {
    item,
    modulo,
    linhas,
    custoUnitario,
    preco,
    avisos,
    fileiras,
    frente: frenteDoItem(item, modulo),
    portas: nPortas,
    gavetas: nGavetas,
    prateleiras,
  };
}

export function calculaOrcamento(
  itens: ItemConfig[],
  acabamento: Acabamento,
  entrega: Entrega,
): Orcamento {
  const calculados = itens.map((i) => calculaItem(i, acabamento));
  const subtotal = calculados.reduce((s, i) => s + i.preco, 0);
  const freteSobConsulta = entrega === "distante";
  const frete = freteSobConsulta || subtotal === 0 ? 0 : ENTREGA_LOCAL;
  const total = subtotal + frete;
  const parcelas = PARCELAS_MAX;

  return {
    itens: calculados,
    subtotal,
    entrega: frete,
    freteSobConsulta,
    total,
    totalPix: total * (1 - DESCONTO_PIX),
    parcela: total / parcelas,
    parcelas,
  };
}
