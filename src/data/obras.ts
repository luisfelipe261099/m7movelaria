import type { ImageName } from "@/assets/generated/images";

/**
 * Fotos de obras entregues, enviadas pela M7.
 *
 * É a primeira fotografia real do site — até aqui todo o portfólio era render
 * de projeto executivo (ver AGENTS.md). Por isso os dois conjuntos ficam
 * separados e nomeados: `obra-*` é foto de móvel instalado; `project-*` e
 * `hero-*` continuam sendo render, e nenhum texto pode misturar os dois.
 *
 * O que cada legenda pode dizer: o que está visível na foto — tipo de móvel,
 * acabamento, vidro, iluminação, puxador. O que NÃO pode: cidade, nome de
 * cliente ou de arquiteto, data, marca de ferragem que não aparece na imagem
 * e qualquer número. A M7 não informou nada disso, e inventar é pior do que
 * omitir (regra geral do AGENTS.md).
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
  /** Descrição da imagem para quem não a vê — e para o Google Imagens. */
  alt: string;
  /** Uma ou duas frases sobre o que a foto mostra de marcenaria. */
  caption: string;
  /** Página de serviço que aprofunda esse tipo de móvel, quando existe. */
  servicoSlug?: string;
};

export const obras: Obra[] = [
  {
    slug: "bar-adega",
    image: "obra-bar-adega",
    name: "Bar com adega climatizada",
    alt: "Bar em marcenaria preta fosca com quatro colunas de porta de vidro iluminadas em LED, adega climatizada embutida ao centro e armários baixos com puxador dourado, sobre parede de tijolo aparente",
    caption:
      "Móvel em preto fosco composto por colunas com porta de vidro e prateleiras de vidro iluminadas em LED, nicho central para a adega climatizada e armários baixos com puxador perfil dourado. O contraste com a parede de tijolo é o que o projeto pede.",
    servicoSlug: "home-theater-e-painel-de-tv",
  },
  {
    slug: "guarda-roupa-vidro",
    image: "obra-guarda-roupa-vidro",
    name: "Guarda-roupa com portas de vidro",
    alt: "Guarda-roupa do piso ao teto com portas de vidro fumê emolduradas em acabamento amadeirado e cômoda integrada ao centro, em dormitório com piso de madeira",
    caption:
      "Portas de vidro fumê com moldura amadeirada, do piso ao teto, deixam o interior visível sem expor tudo. Ao centro, uma cômoda integrada fecha a composição e ganha o mesmo acabamento das portas.",
    servicoSlug: "dormitorios-planejados",
  },
  {
    slug: "painel-tv",
    image: "obra-painel-tv",
    name: "Painel de TV e rack suspenso",
    alt: "Painel de TV em branco alto brilho com rack suspenso e porta em vidro bronze, estante metálica vazada separando a sala da cozinha e da mesa de jantar ao fundo",
    caption:
      "Painel e rack suspenso em branco alto brilho, com porta em vidro bronze no rack. A estante metálica vazada divide a sala da área de jantar sem fechar a passagem de luz — serralheria integrada à marcenaria.",
    servicoSlug: "home-theater-e-painel-de-tv",
  },
  {
    slug: "sala-jantar",
    image: "obra-sala-jantar",
    name: "Sala de jantar com cristaleira",
    alt: "Sala de jantar com cristaleira de portas de vidro bronze iluminada em LED, buffet, parede espelhada e nichos com iluminação embutida ao lado de bancada com cafeteira",
    caption:
      "Cristaleira com portas de vidro bronze e fita de LED em cada prateleira, buffet sob a parede espelhada e nichos iluminados junto à bancada de apoio. A luz quente dos pendentes e do LED é a mesma temperatura, por isso o ambiente não briga.",
  },
  {
    slug: "mesa-madeira",
    image: "obra-mesa-madeira",
    name: "Mesa em madeira maciça",
    alt: "Detalhe de mesa em madeira maciça com tampo espesso e pés inclinados torneados, mostrando o encaixe do pé no suporte sob o tampo",
    caption:
      "Peça solta em madeira maciça: tampo espesso e pés inclinados torneados, com o encaixe do pé aparente sob o tampo. É o tipo de detalhe que só a marcenaria de madeira maciça permite — não existe em chapa.",
  },
];

export const getObra = (slug: string) => obras.find((o) => o.slug === slug);
