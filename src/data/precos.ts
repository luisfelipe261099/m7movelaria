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
 * a linha do site fica em 2,4.
 *
 * Aprovado pela M7 em 01/09/2026, com a justificativa dela: o pedido do site
 * entra como plano de corte direto na seccionadora, a produção sai quase sem
 * intervenção e o volume compensa a margem menor por peça. Ou seja, a conta
 * fecha por escala, não por peça — mexer neste número sem mexer no modelo de
 * produção quebra a premissa.
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

/**
 * Entrega + montagem em Curitiba e região. A CONFIRMAR o valor com a M7.
 *
 * Fora dessa área o frete é por conta do cliente, cotado com a transportadora
 * antes do envio — decisão da M7. Não há valor fixo aqui de propósito: peça de
 * armário passa de dois metros, o que descarta encomenda dos Correios (limite
 * de 1 m de comprimento e 30 kg por volume) e joga a cotação para transporte
 * rodoviário, que depende de cubagem e destino.
 */
export const ENTREGA_LOCAL = 180;

/** Desconto para pagamento à vista no Pix. A CONFIRMAR com a M7. */
export const DESCONTO_PIX = 0.05;
/** Parcelamento máximo no cartão de crédito. A CONFIRMAR com a M7. */
export const PARCELAS_MAX = 10;

// ————————————————————————————————————————————————————————————
// Catálogo de módulos
// ————————————————————————————————————————————————————————————

export type ModuloId =
  | "aereo"
  | "balcao"
  | "gaveteiro"
  | "torre-quente"
  | "armario"
  | "guarda-roupa"
  | "criado-mudo"
  | "cabeceira"
  | "bancada"
  | "estante";

/** Ambientes do simulador. Cada módulo diz em quais aparece. */
export type AmbienteId = "cozinha" | "dormitorio" | "home-office" | "lavanderia";

/**
 * Frente do módulo — o que a pessoa vê e escolhe: portas, gavetas ou os dois.
 *
 * Pedido da M7 (áudio de 17/09): no balcão, no aéreo e no balcão de pia a
 * pessoa clica e escolhe 1, 2 ou 3 portas; duas gavetas, um gavetão, gavetão
 * com gavetas — "com umas especificações de limite para não passar". As
 * fileiras vão de cima para baixo; a altura de cada uma é proporcional ao seu
 * peso em `UNIDADES_FILEIRA`, e a largura das portas é a do módulo dividida
 * pelo número de folhas.
 */
export type Fileira =
  { tipo: "portas"; n: 1 | 2 | 3 | 4 } | { tipo: "gaveta"; tamanho: "normal" | "gavetao" };

export type Frente = { id: string; nome: string; fileiras: Fileira[] };

/** Peso de altura de cada fileira: um gavetão vale duas gavetas; portas, três. */
export const UNIDADES_FILEIRA = { portas: 3, normal: 1, gavetao: 2 } as const;

/**
 * Limites de frente, em mm — as "especificações de limite" do áudio.
 *
 *  - Porta: de 300 a 600 mm de largura por folha. Acima de 600 a folha fica
 *    pesada para a dobradiça e empena; abaixo de 300 não abre vão útil.
 *  - Gaveta: até 900 mm de largura (corrediça) e de 120 a 450 mm de altura
 *    (abaixo disso não é gaveta; acima, é porta deitada).
 *
 * A CONFIRMAR com a M7: são os limites usuais do setor, não números que ela
 * passou. Estão em um lugar só de propósito.
 */
export const PORTA_LARGURA: [number, number] = [300, 600];
export const GAVETA_ALTURA: [number, number] = [120, 450];
export const GAVETA_LARGURA_MAX = 900;

const portas = (n: 1 | 2 | 3 | 4): Frente => ({
  id: `${n}-portas`,
  nome: n === 1 ? "1 porta" : `${n} portas`,
  fileiras: [{ tipo: "portas", n }],
});
const gaveta: Fileira = { tipo: "gaveta", tamanho: "normal" };
const gavetao: Fileira = { tipo: "gaveta", tamanho: "gavetao" };

/** A primeira opção de cada lista é o padrão do módulo. */
const FRENTES_PORTAS: Frente[] = [portas(2), portas(1), portas(3)];
const FRENTES_BALCAO: Frente[] = [
  ...FRENTES_PORTAS,
  { id: "gaveta-2-portas", nome: "1 gaveta + 2 portas", fileiras: [gaveta, portas(2).fileiras[0]] },
  { id: "2-gavetas", nome: "2 gavetas", fileiras: [gaveta, gaveta] },
  { id: "3-gavetas", nome: "3 gavetas", fileiras: [gaveta, gaveta, gaveta] },
  { id: "2-gavetas-gavetao", nome: "2 gavetas + gavetão", fileiras: [gaveta, gaveta, gavetao] },
];
/** Guarda-roupa é largo: 2, 3 ou 4 folhas para a porta ficar dentro dos 600 mm. */
const FRENTES_GUARDA_ROUPA: Frente[] = [portas(3), portas(2), portas(4)];
const FRENTES_CRIADO: Frente[] = [
  { id: "2-gavetas", nome: "2 gavetas", fileiras: [gaveta, gaveta] },
  { id: "gaveta-porta", nome: "1 gaveta + 1 porta", fileiras: [gaveta, portas(1).fileiras[0]] },
  portas(1),
];
const FRENTES_GAVETEIRO: Frente[] = [
  { id: "3-gavetas", nome: "3 gavetas", fileiras: [gaveta, gaveta, gaveta] },
  { id: "4-gavetas", nome: "4 gavetas", fileiras: [gaveta, gaveta, gaveta, gaveta] },
  { id: "2-gavetas", nome: "2 gavetas", fileiras: [gaveta, gaveta] },
  { id: "2-gavetas-gavetao", nome: "2 gavetas + gavetão", fileiras: [gaveta, gaveta, gavetao] },
];

export type Modulo = {
  id: ModuloId;
  nome: string;
  descricao: string;
  /** Em quais ambientes o módulo é oferecido. */
  ambientes: AmbienteId[];
  /**
   * Como a peça é construída, para a conta e para o desenho:
   *  - "caixa" (padrão): laterais, base, tampo, fundo e frentes;
   *  - "painel": uma chapa de cor na parede (cabeceira) — sem caixa, sem
   *    ferragem; a profundidade é a espessura e não é editada;
   *  - "bancada": tampo em chapa de cor apoiado em duas laterais.
   */
  forma?: "caixa" | "painel" | "bancada";
  /** Medidas iniciais em mm (largura, altura, profundidade). */
  padrao: [number, number, number];
  /** Faixa aceita em mm — fora disso vira projeto sob medida com a equipe. */
  limites: { largura: [number, number]; altura: [number, number]; profundidade: [number, number] };
  /** Portas e gavetas do módulo quando ele NÃO tem `frentes` (torre quente). */
  portas: number;
  gavetas: number;
  prateleiras: number;
  /** Só a torre quente pede as medidas dos eletrodomésticos. */
  eletros?: boolean;
  /** Opções de frente que a pessoa escolhe; a primeira é o padrão. */
  frentes?: Frente[];
};

export const MODULOS: Modulo[] = [
  {
    id: "aereo",
    nome: "Armário aéreo",
    ambientes: ["cozinha", "lavanderia"],
    descricao: "Fixado na parede, com prateleira interna. Você escolhe 1, 2 ou 3 portas.",
    padrao: [800, 700, 350],
    limites: { largura: [400, 1200], altura: [400, 900], profundidade: [300, 400] },
    portas: 2,
    gavetas: 0,
    prateleiras: 1,
    frentes: FRENTES_PORTAS,
  },
  {
    id: "balcao",
    nome: "Balcão",
    ambientes: ["cozinha", "lavanderia"],
    descricao: "Base de bancada ou de pia, com pé regulável. Portas, gavetas ou os dois.",
    padrao: [800, 850, 580],
    limites: { largura: [400, 1200], altura: [700, 900], profundidade: [450, 650] },
    portas: 2,
    gavetas: 0,
    prateleiras: 1,
    frentes: FRENTES_BALCAO,
  },
  {
    id: "gaveteiro",
    nome: "Gaveteiro",
    ambientes: ["cozinha", "home-office"],
    descricao: "Gavetas com corrediça oculta e amortecimento: de 2 a 4, com ou sem gavetão.",
    padrao: [600, 850, 580],
    limites: { largura: [400, 900], altura: [700, 900], profundidade: [450, 650] },
    portas: 0,
    gavetas: 3,
    prateleiras: 0,
    frentes: FRENTES_GAVETEIRO,
  },
  {
    id: "torre-quente",
    nome: "Torre quente",
    ambientes: ["cozinha"],
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
    ambientes: ["cozinha", "lavanderia", "dormitorio"],
    descricao: "Coluna fechada de piso ao teto, com prateleiras.",
    padrao: [900, 2100, 550],
    limites: { largura: [500, 1400], altura: [1800, 2400], profundidade: [400, 650] },
    portas: 2,
    gavetas: 0,
    prateleiras: 4,
    frentes: FRENTES_PORTAS,
  },
  // ————— dormitório —————
  {
    id: "guarda-roupa",
    nome: "Guarda-roupa",
    descricao: "Do piso ao teto, com prateleiras e cabideiro. 2, 3 ou 4 portas.",
    ambientes: ["dormitorio"],
    padrao: [1600, 2200, 550],
    limites: { largura: [800, 2400], altura: [1800, 2600], profundidade: [450, 650] },
    portas: 3,
    gavetas: 0,
    prateleiras: 4,
    frentes: FRENTES_GUARDA_ROUPA,
  },
  {
    id: "criado-mudo",
    nome: "Criado-mudo",
    descricao: "Ao lado da cama: gavetas, gaveta com porta ou só porta.",
    ambientes: ["dormitorio"],
    padrao: [500, 550, 400],
    limites: { largura: [400, 700], altura: [400, 700], profundidade: [350, 500] },
    portas: 0,
    gavetas: 2,
    prateleiras: 0,
    frentes: FRENTES_CRIADO,
  },
  {
    id: "cabeceira",
    nome: "Painel de cabeceira",
    descricao: "Painel em chapa de cor fixado na parede atrás da cama.",
    ambientes: ["dormitorio"],
    forma: "painel",
    padrao: [1600, 1100, 15],
    limites: { largura: [900, 2600], altura: [600, 1400], profundidade: [15, 15] },
    portas: 0,
    gavetas: 0,
    prateleiras: 0,
  },
  // ————— home office —————
  {
    id: "bancada",
    nome: "Bancada de trabalho",
    descricao: "Tampo em chapa de cor sobre duas laterais. O gaveteiro vai embaixo.",
    ambientes: ["home-office"],
    forma: "bancada",
    padrao: [1400, 750, 600],
    limites: { largura: [800, 2400], altura: [700, 800], profundidade: [450, 700] },
    portas: 0,
    gavetas: 0,
    prateleiras: 0,
  },
  {
    id: "estante",
    nome: "Estante aberta",
    descricao: "Nichos abertos com prateleiras, sem porta.",
    ambientes: ["home-office"],
    padrao: [800, 1800, 300],
    limites: { largura: [400, 1200], altura: [600, 2400], profundidade: [250, 400] },
    portas: 0,
    gavetas: 0,
    prateleiras: 4,
  },
];

/** Folga de ventilação/instalação somada à medida do eletrodoméstico, em mm. */
export const FOLGA_ELETRO = 10;
