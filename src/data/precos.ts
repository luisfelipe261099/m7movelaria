/**
 * Tabela de custo e catálogo de módulos do simulador de orçamento.
 *
 * Os preços de material e ferragem abaixo foram informados pela M7 em
 * 01/09/2026. Antes disso o simulador rodava com valores de demonstração; o
 * que continua pendente está marcado com `A CONFIRMAR` e listado no final do
 * arquivo — enquanto houver pendência, `TABELA_CONFIRMADA` (em `simulador.ts`)
 * fica `false`, a rota `/orcamento` é `noindex`, fica fora do sitemap e mostra
 * o aviso de valor sujeito a confirmação.
 */

export { TABELA_CONFIRMADA } from "./simulador";

/**
 * Multiplicador sobre o custo. Na marcenaria sob medida a M7 trabalha com 3,0;
 * a linha vendida pelo site usa um fator menor porque o material é de padrão
 * mais simples e o projeto não passa por arquiteto.
 *
 * A CONFIRMAR: número definido pela M7. 2,4 é o provisório.
 */
export const FATOR_SITE = 2.4;

// ————————————————————————————————————————————————————————————
// Chapas — preço por chapa inteira, como a M7 compra
// ————————————————————————————————————————————————————————————

/** Chapa padrão de MDF: 2,75 × 1,84 m. */
export const CHAPA_M2 = 2.75 * 1.84;

/**
 * Aproveitamento de corte. Nenhum plano de corte usa 100% da chapa: sobra
 * recorte que não vira peça. 85% é a folga usual do setor.
 *
 * A CONFIRMAR: se a M7 trabalha com outro índice, é só trocar aqui.
 */
export const APROVEITAMENTO = 0.85;

/** Preço de cada tipo de chapa, em reais por chapa inteira. */
export const CHAPAS = {
  /** MDF 15 mm branco — caixa, laterais, prateleiras e gavetas. */
  interior: 286,
  /** MDF 6 mm — fundo dos armários. */
  fundo: 190,
  /** Chapa de cor — só as frentes (portas e gavetas). */
  frente: 450,
} as const;

/** Converte o preço da chapa inteira em preço por m² já com a perda de corte. */
export const porM2 = (precoDaChapa: number) => precoDaChapa / (CHAPA_M2 * APROVEITAMENTO);

/**
 * As cores mudam a aparência da frente, não o custo: a M7 fechou uma base
 * única de R$ 450 por chapa de cor. Se algum padrão passar a custar mais, cada
 * cor ganha o seu preço aqui.
 */
export type Cor = { id: string; nome: string; hex: string };

export const CORES: Cor[] = [
  { id: "branco", nome: "Branco TX", hex: "#f3f1ee" },
  { id: "cinza", nome: "Cinza Cristal", hex: "#b9b6b1" },
  { id: "carvalho", nome: "Carvalho Hanover", hex: "#b08a67" },
  { id: "nogueira", nome: "Nogueira Terracota", hex: "#6f4a35" },
];

// ————————————————————————————————————————————————————————————
// Fita de borda e ferragem
// ————————————————————————————————————————————————————————————

/**
 * Fita de borda: R$ 3,00 por metro aplicado, preço único. O 0,45 que veio
 * junto na mensagem é a espessura da fita em milímetros, não um segundo preço
 * — confirmado pela M7.
 */
export const FITA_ML = 3.0;
export const FITA_ESPESSURA_MM = 0.45;

/** Dobradiça, por unidade. */
export const DOBRADICA = 3.26;

/**
 * Corrediça oculta, por par. Valor fixo definido pela M7 — não muda mais com a
 * carga da gaveta, como era no provisório.
 */
export const CORREDICA_PAR = 40;

/** Suporte de prateleira Uniblock, por unidade — quatro por prateleira. */
export const UNIBLOCK = 1.5;
export const UNIBLOCK_POR_PRATELEIRA = 4;

/** Parafuso, por unidade. */
export const PARAFUSO = 1.01;

/**
 * Parafusos por módulo: oito para fechar a caixa, mais quatro por porta ou
 * gaveta (dobradiça e corrediça) e dois por prateleira.
 *
 * A CONFIRMAR: é uma estimativa de montagem, não um número que a M7 passou.
 */
export const PARAFUSOS_CAIXA = 8;
export const PARAFUSOS_POR_FRENTE = 4;
export const PARAFUSOS_POR_PRATELEIRA = 2;

/**
 * Cola, fita crepe e tarugo, como percentual do material. O parafuso saiu
 * daqui e passou a ser contado peça a peça.
 *
 * A CONFIRMAR: a M7 não passou o custo de cola.
 */
export const INSUMOS_PCT = 0.03;

/** Puxador, por peça. Base definida pela M7 — o modelo exato varia. */
export const PUXADOR = 15;

/**
 * Porta ripada não tem preço de usinagem à parte: segundo a M7, o ripado
 * "dobra o material" — as ripas saem da mesma chapa e o consumo de frente vai
 * a duas vezes a área. É assim que entra na conta.
 */
export const RIPADO_FATOR_MATERIAL = 2;

/** Entrega + montagem em Curitiba e região. A CONFIRMAR com a M7. */
export const ENTREGA_LOCAL = 180;

/** Desconto para pagamento à vista no Pix. A CONFIRMAR com a M7. */
export const DESCONTO_PIX = 0.05;
/** Parcelamento máximo no cartão de crédito. A CONFIRMAR com a M7. */
export const PARCELAS_MAX = 10;

// ————————————————————————————————————————————————————————————
// Catálogo de módulos
// ————————————————————————————————————————————————————————————

export type ModuloId = "aereo" | "balcao" | "gaveteiro" | "torre-quente" | "armario";

export type Modulo = {
  id: ModuloId;
  nome: string;
  descricao: string;
  /** Medidas iniciais em mm (largura, altura, profundidade). */
  padrao: [number, number, number];
  /** Faixa aceita em mm — fora disso vira projeto sob medida com a equipe. */
  limites: { largura: [number, number]; altura: [number, number]; profundidade: [number, number] };
  portas: number;
  gavetas: number;
  prateleiras: number;
  /** Só a torre quente pede as medidas dos eletrodomésticos. */
  eletros?: boolean;
};

export const MODULOS: Modulo[] = [
  {
    id: "aereo",
    nome: "Armário aéreo",
    descricao: "Duas portas e uma prateleira interna, fixado na parede.",
    padrao: [800, 700, 350],
    limites: { largura: [400, 1200], altura: [400, 900], profundidade: [300, 400] },
    portas: 2,
    gavetas: 0,
    prateleiras: 1,
  },
  {
    id: "balcao",
    nome: "Balcão 2 portas",
    descricao: "Base de bancada com prateleira interna e pé regulável.",
    padrao: [800, 850, 580],
    limites: { largura: [400, 1200], altura: [700, 900], profundidade: [450, 650] },
    portas: 2,
    gavetas: 0,
    prateleiras: 1,
  },
  {
    id: "gaveteiro",
    nome: "Gaveteiro 3 gavetas",
    descricao: "Gavetas com corrediça oculta e amortecimento.",
    padrao: [600, 850, 580],
    limites: { largura: [400, 900], altura: [700, 900], profundidade: [450, 650] },
    portas: 0,
    gavetas: 3,
    prateleiras: 0,
  },
  {
    id: "torre-quente",
    nome: "Torre quente",
    descricao: "Nichos para forno e micro-ondas, calculados pelas medidas dos seus aparelhos.",
    padrao: [600, 2100, 600],
    limites: { largura: [500, 900], altura: [1800, 2400], profundidade: [500, 700] },
    portas: 2,
    gavetas: 0,
    prateleiras: 1,
    eletros: true,
  },
  {
    id: "armario",
    nome: "Armário multiuso",
    descricao: "Coluna fechada de piso ao teto, com prateleiras.",
    padrao: [900, 2100, 550],
    limites: { largura: [500, 1400], altura: [1800, 2400], profundidade: [400, 650] },
    portas: 2,
    gavetas: 0,
    prateleiras: 4,
  },
];

/** Folga de ventilação/instalação somada à medida do eletrodoméstico, em mm. */
export const FOLGA_ELETRO = 10;
