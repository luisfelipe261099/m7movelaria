/**
 * Motor de cálculo do simulador de orçamento.
 *
 * A conta é a mesma que a marcenaria faz na planilha, só que explícita:
 *   custo = chapa (por espessura e cor) + fita de borda + ferragem + insumos
 *   preço = custo × FATOR_SITE
 *
 * Duas regras que vieram direto do cliente e que o código precisa respeitar:
 *  - a corrediça é escolhida pela carga da gaveta, não por um preço médio: a
 *    gaveta larga e funda pede corrediça reforçada, e ela custa três vezes a
 *    telescópica simples;
 *  - a torre quente é dimensionada pelas medidas dos eletrodomésticos que a
 *    pessoa digita, então o nicho (e a altura de porta que sobra) sai do forno
 *    e do micro-ondas dela, não de um padrão fixo.
 *
 * Tudo em milímetros na entrada e em metros no cálculo de área.
 */

import {
  CORES,
  CORREDICAS,
  DESCONTO_PIX,
  DOBRADICA,
  ENTREGA_LOCAL,
  FATOR_SITE,
  FITA_ML,
  FOLGA_ELETRO,
  INSUMOS_PCT,
  MODULOS,
  PARCELAS_MAX,
  PUXADOR,
  RIPADO_M2,
  type Corredica,
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
  /** Só na torre quente. */
  forno?: MedidaEletro;
  micro?: MedidaEletro;
};

export type Acabamento = {
  corId: string;
  /** Espessura da lateral: 15 mm (padrão) ou 18 mm (reforçada). */
  lateral: 15 | 18;
  /** Porta ripada tem usinagem por m² de frente. */
  ripada: boolean;
  puxador: boolean;
};

export type LinhaCusto = { descricao: string; detalhe: string; valor: number };

export type ItemCalculado = {
  item: ItemConfig;
  modulo: Modulo;
  linhas: LinhaCusto[];
  corredica: Corredica | null;
  /** Custo de um módulo, sem multiplicador. */
  custoUnitario: number;
  /** Preço de venda já multiplicado e arredondado, vezes a quantidade. */
  preco: number;
  /** Avisos de dimensionamento (medida fora da faixa, eletro sem medida). */
  avisos: string[];
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

/**
 * Escolhe a corrediça pela carga estimada da gaveta. A estimativa é grosseira
 * de propósito (largura × profundidade); o que importa é não orçar a gaveta de
 * 900 mm com a corrediça de 35 kg.
 */
export function corredicaPara(larguraMm: number, profundidadeMm: number): Corredica {
  const area = m(larguraMm) * m(profundidadeMm);
  const cargaEstimada = area <= 0.25 ? 35 : area <= 0.42 ? 40 : 60;
  return CORREDICAS.find((c) => c.cargaKg >= cargaEstimada) ?? CORREDICAS[CORREDICAS.length - 1];
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

  // Chapa estrutural (laterais na espessura escolhida, restante em 18 mm).
  const lateraisM2 = 2 * A * P;
  const horizontaisM2 = (2 + modulo.prateleiras + travessasExtras) * L * P;
  const frentesM2 = modulo.portas + modulo.gavetas > 0 ? L * alturaFrente : 0;
  const caixasGavetaM2 = modulo.gavetas * (2 * 0.15 * P + 2 * 0.15 * L);
  const fundoM2 = L * A + modulo.gavetas * L * P;

  const custoLateral = lateraisM2 * (acab.lateral === 18 ? cor.mm18 : cor.mm15);
  const custoHorizontal = horizontaisM2 * cor.mm18;
  const custoFrente = frentesM2 * cor.mm18;
  const custoGaveta = caixasGavetaM2 * cor.mm15;
  const custoFundo = fundoM2 * cor.mm6;

  // Fita de borda: bordas aparentes das horizontais, das frentes e das gavetas.
  const larguraFrente = modulo.portas > 0 ? L / modulo.portas : L;
  const alturaGaveta = modulo.gavetas > 0 ? alturaFrente / modulo.gavetas : 0;
  const fitaMl =
    (2 + modulo.prateleiras + travessasExtras) * L +
    2 * A +
    modulo.portas * 2 * (larguraFrente + alturaFrente) +
    modulo.gavetas * 2 * (L + alturaGaveta);

  const dobradicas = modulo.portas * (alturaFrente > 1.2 ? 3 : 2);
  const corredica = modulo.gavetas > 0 ? corredicaPara(item.largura, item.profundidade) : null;
  const frentes = modulo.portas + modulo.gavetas;

  const linhas: LinhaCusto[] = [
    {
      descricao: `Laterais em MDF ${acab.lateral} mm`,
      detalhe: `${lateraisM2.toFixed(2)} m² · ${cor.nome}`,
      valor: custoLateral,
    },
    {
      descricao: "Base, tampo e prateleiras em MDF 18 mm",
      detalhe: `${horizontaisM2.toFixed(2)} m²`,
      valor: custoHorizontal,
    },
    {
      descricao: "Fundo em MDF 6 mm",
      detalhe: `${fundoM2.toFixed(2)} m²`,
      valor: custoFundo,
    },
  ];

  if (frentesM2 > 0) {
    linhas.push({
      descricao: `Frentes em MDF 18 mm${acab.ripada ? " com ripado" : ""}`,
      detalhe: `${frentesM2.toFixed(2)} m² · ${frentes} ${frentes === 1 ? "frente" : "frentes"}`,
      valor: custoFrente + (acab.ripada ? frentesM2 * RIPADO_M2 : 0),
    });
  }
  if (caixasGavetaM2 > 0) {
    linhas.push({
      descricao: "Caixas de gaveta em MDF 15 mm",
      detalhe: `${caixasGavetaM2.toFixed(2)} m²`,
      valor: custoGaveta,
    });
  }
  linhas.push({
    descricao: "Fita de borda",
    detalhe: `${fitaMl.toFixed(1)} m aplicados`,
    valor: fitaMl * FITA_ML,
  });
  if (dobradicas > 0) {
    linhas.push({
      descricao: "Dobradiças com amortecedor",
      detalhe: `${dobradicas} un`,
      valor: dobradicas * DOBRADICA,
    });
  }
  if (corredica) {
    linhas.push({
      descricao: `Corrediça ${corredica.nome}`,
      detalhe: `${modulo.gavetas} pares · escolhida pela carga da gaveta`,
      valor: modulo.gavetas * corredica.custoPar,
    });
  }
  if (acab.puxador && frentes > 0) {
    linhas.push({
      descricao: "Puxador perfil",
      detalhe: `${frentes} un`,
      valor: frentes * PUXADOR,
    });
  }

  const material = linhas.reduce((s, l) => s + l.valor, 0);
  const insumos = material * INSUMOS_PCT;
  linhas.push({
    descricao: "Cola, parafuso, tarugo e fita crepe",
    detalhe: `${Math.round(INSUMOS_PCT * 100)}% sobre o material`,
    valor: insumos,
  });

  const custoUnitario = material + insumos;
  const preco = arredonda(custoUnitario * FATOR_SITE) * item.quantidade;

  return { item, modulo, linhas, corredica, custoUnitario, preco, avisos };
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
