/**
 * Tabela de custo e catálogo de módulos do simulador de orçamento.
 *
 * ATENÇÃO — TODOS OS VALORES AQUI SÃO DE DEMONSTRAÇÃO.
 * Foram escritos apenas para o simulador ter o que somar enquanto a M7 não
 * envia a tabela real (chapa por cor, fita, ferragem, corrediça por carga).
 * Enquanto `TABELA_CONFIRMADA` for `false`, a rota `/orcamento` é `noindex`,
 * fica fora do sitemap e exibe o aviso de valores ilustrativos — nenhum preço
 * inventado pode aparecer para o público como se fosse preço da empresa.
 *
 * Para virar produção: substituir os números, marcar `TABELA_CONFIRMADA = true`
 * (em `simulador.ts`) e revisar `FATOR_SITE` com o cliente.
 */

export { TABELA_CONFIRMADA } from "./simulador";

/**
 * Multiplicador sobre o custo. Na marcenaria sob medida a M7 trabalha com 3,0;
 * a linha vendida pelo site usa um fator menor porque o material é de padrão
 * mais simples e o projeto não passa por arquiteto — é o que torna a venda
 * on-line viável. Número a confirmar com o cliente.
 */
export const FATOR_SITE = 2.4;

/** Cola, parafuso, tarugo, fita crepe e cavilha, como percentual do material. */
export const INSUMOS_PCT = 0.06;

export type Cor = {
  id: string;
  nome: string;
  /** Custo por m² da chapa, por espessura. */
  mm18: number;
  mm15: number;
  mm6: number;
  /** Amostra para o seletor de cor na tela. */
  hex: string;
};

export const CORES: Cor[] = [
  { id: "branco", nome: "Branco TX", mm18: 148, mm15: 132, mm6: 74, hex: "#f3f1ee" },
  { id: "cinza", nome: "Cinza Cristal", mm18: 164, mm15: 146, mm6: 79, hex: "#b9b6b1" },
  { id: "carvalho", nome: "Carvalho Hanover", mm18: 198, mm15: 176, mm6: 86, hex: "#b08a67" },
  { id: "nogueira", nome: "Nogueira Terracota", mm18: 212, mm15: 188, mm6: 86, hex: "#6f4a35" },
];

/** Fita de borda aplicada, por metro linear. */
export const FITA_ML = 3.4;
/** Dobradiça de caneco com amortecedor, por unidade. */
export const DOBRADICA = 16.5;
/** Puxador perfil, por frente. */
export const PUXADOR = 24;
/** Acréscimo de usinagem por m² de porta ripada. */
export const RIPADO_M2 = 195;

/**
 * Corrediças por faixa de carga — o ponto que o cliente fez questão de citar:
 * cada modelo aguarda um peso e tem preço próprio, então a gaveta grande não
 * pode sair orçada com a corrediça da gaveta pequena.
 */
export type Corredica = {
  id: string;
  nome: string;
  cargaKg: number;
  /** Custo do par. */
  custoPar: number;
};

export const CORREDICAS: Corredica[] = [
  { id: "telescopica-35", nome: "Telescópica 35 kg", cargaKg: 35, custoPar: 42 },
  { id: "oculta-40", nome: "Oculta soft-close 40 kg", cargaKg: 40, custoPar: 98 },
  { id: "oculta-60", nome: "Oculta reforçada 60 kg", cargaKg: 60, custoPar: 152 },
];

/** Entrega + montagem em Curitiba e região metropolitana. */
export const ENTREGA_LOCAL = 180;

/** Desconto para pagamento à vista no Pix. */
export const DESCONTO_PIX = 0.05;
/** Parcelamento máximo no cartão de crédito. */
export const PARCELAS_MAX = 10;

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
    descricao: "Gavetas com corrediça dimensionada pela carga de cada uma.",
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
