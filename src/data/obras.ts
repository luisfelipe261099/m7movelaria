import type { ImageName } from "@/assets/generated/images";

/**
 * Fotos de móveis entregues, enviadas pela M7.
 *
 * É a primeira fotografia real do site — até aqui todo o portfólio era render
 * de projeto executivo (ver AGENTS.md). Por isso os dois conjuntos ficam
 * separados e nomeados: `obra-*` é foto de móvel entregue (instalado na casa
 * do cliente ou peça solta fotografada pronta); `project-*` e `hero-*`
 * continuam sendo render, e nenhum texto pode misturar os dois.
 *
 * O que cada legenda pode dizer: o que está visível na foto — tipo de móvel,
 * acabamento, vidro, iluminação, puxador. O que NÃO pode: cidade, nome de
 * cliente ou de arquiteto, data, marca de ferragem que não aparece na imagem,
 * técnica ou material que a foto não permite confirmar, e qualquer número. A
 * M7 não informou nada disso, e inventar é pior do que omitir (regra geral do
 * AGENTS.md). Cada legenda foi conferida contra a foto ampliada — quando a
 * revisão apontou "cômoda" onde há portas, ou "torneado" onde o pé tem faces
 * planas, o texto cedeu à imagem.
 *
 * Arquivo leve de propósito: entra direto na home e em /projetos, então não
 * pode crescer em prosa longa — se um dia cada obra ganhar página própria, o
 * texto longo vai por `import()` no loader, como fazem `services.ts` e
 * `cities.ts`.
 */

export type Obra = {
  slug: string;
  image: ImageName;
  /** Título curto, como aparece no card. */
  name: string;
  /**
   * Descrição completa da imagem — para o Google Imagens (`description` do
   * ImageObject) e como alt onde a foto aparece SEM legenda (home, faixa da
   * página de projeto).
   */
  alt: string;
  /**
   * Alt curto para a galeria, onde a <figcaption> já descreve a foto: leitor
   * de tela ouve o nome da figure (a legenda) e depois o alt — com o alt longo
   * o mesmo conteúdo era anunciado três vezes.
   */
  altCurto: string;
  /** Uma ou duas frases sobre o que a foto mostra de marcenaria. */
  caption: string;
  /** Página de serviço que aprofunda esse tipo de móvel, quando existe. */
  servicoSlug?: string;
};

/**
 * Tupla não vazia de propósito: `obras[0]` é a capa de /projetos e é avaliado
 * no import do módulo da rota. Com `Obra[]` um array vazio compilaria e
 * derrubaria o SSR do site inteiro; assim vira erro de tipo.
 */
export const obras: [Obra, ...Obra[]] = [
  {
    slug: "bar-adega",
    image: "obra-bar-adega",
    name: "Bar com adega climatizada",
    alt: "Bar em marcenaria preta fosca com quatro colunas de porta de vidro iluminadas em LED, adega climatizada embutida ao centro e armários baixos com puxador dourado, sobre parede de tijolo aparente",
    altCurto: "Bar em preto fosco sobre parede de tijolo aparente",
    caption:
      "Móvel em preto fosco composto por colunas com porta de vidro e prateleiras de vidro iluminadas em LED, nicho central para a adega climatizada e armários baixos com puxador dourado. O contraste com a parede de tijolo é o que o projeto pede.",
  },
  {
    slug: "guarda-roupa-vidro",
    image: "obra-guarda-roupa-vidro",
    name: "Guarda-roupa com portas de vidro",
    alt: "Guarda-roupa do piso ao teto com portas de vidro fumê emolduradas em acabamento amadeirado e armário baixo de quatro portas integrado ao centro, em dormitório com piso de madeira",
    altCurto: "Guarda-roupa de vidro fumê em dormitório com piso de madeira",
    caption:
      "Portas de vidro fumê com moldura amadeirada, do piso ao teto. Ao centro, um armário baixo de portas lisas fecha a composição e ganha o mesmo acabamento das molduras.",
    servicoSlug: "dormitorios-planejados",
  },
  {
    slug: "painel-tv",
    image: "obra-painel-tv",
    name: "Painel de TV e rack suspenso",
    alt: "Painel de TV em branco alto brilho com rack suspenso e porta em vidro bronze, estante metálica vazada separando a sala da cozinha e da mesa de jantar ao fundo",
    altCurto: "Painel de TV branco alto brilho com estante metálica vazada",
    caption:
      "Painel e rack suspenso em branco alto brilho, com porta em vidro bronze no rack. A estante metálica vazada divide a sala da área de jantar sem fechar a passagem de luz.",
    servicoSlug: "home-theater-e-painel-de-tv",
  },
  {
    slug: "sala-jantar",
    image: "obra-sala-jantar",
    name: "Sala de jantar com cristaleira",
    alt: "Sala de jantar com cristaleira de portas de vidro bronze iluminada em LED, buffet, parede espelhada e nichos com iluminação embutida ao lado de bancada com cafeteira",
    altCurto: "Cristaleira iluminada em sala de jantar com parede espelhada",
    caption:
      "Cristaleira com portas de vidro bronze e perfis verticais de LED atrás das prateleiras de vidro, buffet sob a parede espelhada e nichos iluminados junto à bancada de apoio. A luz dos pendentes e do LED é da mesma tonalidade quente, por isso o ambiente não briga.",
  },
  {
    slug: "mesa-madeira",
    image: "obra-mesa-madeira",
    name: "Mesa com pés em madeira maciça",
    alt: "Detalhe de mesa com tampo espesso e pés inclinados afunilados em madeira maciça, mostrando o encaixe do pé no suporte sob o tampo",
    altCurto: "Detalhe do pé inclinado de uma mesa em madeira",
    caption:
      "Peça solta, não embutida: tampo espesso e pés inclinados afunilados, com o encaixe do pé aparente no suporte sob o tampo. Pés e suporte em madeira maciça — é o tipo de encaixe que só a madeira maciça permite.",
  },
];

export const getObra = (slug: string) => obras.find((o) => o.slug === slug);
