import type { ImageName } from "@/assets/generated/images";

export type Hotspot = {
  id: string;
  name: string;
  // percent coordinates on the room image (0-100)
  x: number;
  y: number;
  description: string;
  materials: string[];
  ferragens: string[];
  iluminacao: string[];
  diferenciais: string[];
};

export type Ambiente = {
  id: string;
  name: string;
  // percent coordinates on the floor plan (0-100) — hoje sem uso na UI
  planX?: number;
  planY?: number;
  /**
   * `object-position` da imagem no visualizador (que é 4:3 nos projetos de
   * foto). Só a foto em retrato precisa: ancorada a 30% do topo, o recorte
   * mantém tampo, encaixe e pé. As coordenadas x/y dos hotspots são sempre
   * do RECORTE exibido, não da foto inteira — ver o comentário na obra.
   */
  objectPosition?: string;
  /** Chave no manifesto de imagens — o <Picture> resolve AVIF/WebP/JPEG a partir dela. */
  image: ImageName;
  intro: string;
  hotspots: Hotspot[];
  /**
   * Página de serviço que aprofunda este tipo de ambiente. Existe para o
   * projeto deixar de ser beco sem saída: quem chega no portfólio por uma
   * imagem encontra o caminho para "como projetamos isso".
   */
  servicoSlug?: string;
};

export type Project = {
  slug: string;
  /**
   * "render" (padrão): projeto executivo em render, com especificação de
   * chapa, ferragem e LED por ponto — é demonstração. "foto": obra entregue
   * fotografada; os pontos descrevem só o que está visível, e a página muda
   * o texto (nada de "render de", nada de "especificação").
   */
  tipo?: "render" | "foto";
  name: string;
  client: string;
  architect: string;
  coverName: ImageName;
  description: string;
  ambientes: Ambiente[];
};

export const projects: Project[] = [
  {
    slug: "residencia-aurora",
    name: "Residência Aurora",
    client: "Projeto residencial",
    architect: "Projeto M7",
    coverName: "hero-living",
    description:
      "Projeto residencial de alto padrão com marcenaria integrada em madeira nogueira e detalhes em dourado fosco.",
    ambientes: [
      {
        id: "sala",
        name: "Sala de Estar",
        planX: 28,
        planY: 42,
        image: "hero-living",
        intro:
          "Ambiente principal com painel de TV em MDF Nogueira, home rack basculante e prateleiras iluminadas.",
        servicoSlug: "home-theater-e-painel-de-tv",
        hotspots: [
          {
            id: "painel-tv",
            name: "Painel de TV",
            x: 62,
            y: 42,
            description:
              "Painel especificado em MDF Nogueira 18mm com nichos ripados e iluminação embutida em perfil de LED.",
            materials: ["MDF Nogueira Natural 18mm", "MDF Preto TX 18mm"],
            ferragens: ["Articuladores inversos FGV", "Fecho rolete Häfele"],
            iluminacao: ["Perfil de LED slim", "Fita de LED 3000K"],
            diferenciais: ["Passagem oculta de cabos", "Nichos ripados sob medida"],
          },
          {
            id: "home-rack",
            name: "Home Rack",
            x: 55,
            y: 72,
            description:
              "Balcão inferior com três portas basculantes equipadas com articuladores inversos.",
            materials: ["MDF Nogueira 18mm", "Interno Branco TX Ultra"],
            ferragens: ["Articuladores Häfele", "Puxadores Zen dourado fosco"],
            iluminacao: ["LED 3000K interno"],
            diferenciais: ["Abertura basculante silenciosa", "Ventilação técnica"],
          },
        ],
      },
      {
        id: "cozinha",
        name: "Cozinha Gourmet",
        planX: 62,
        planY: 40,
        image: "project-kitchen",
        intro:
          "Cozinha com armários em laca fosca, ilha em quartzo e iluminação técnica sob os aéreos.",
        servicoSlug: "cozinhas-planejadas",
        hotspots: [
          {
            id: "aereos",
            name: "Armários Aéreos",
            x: 50,
            y: 30,
            description: "Aéreos em laca fosca com iluminação técnica integrada sob a estrutura.",
            materials: ["MDF 18mm com pintura laca fosca", "Interno Branco TX Ultra"],
            ferragens: ["Dobradiças ocultas Häfele", "Articuladores Häfele"],
            iluminacao: ["Perfil de LED slim", "Fita de LED 3000K"],
            diferenciais: ["Portas basculantes", "Iluminação técnica sob aéreo"],
          },
          {
            id: "ilha",
            name: "Ilha Central",
            x: 50,
            y: 72,
            description: "Ilha com tampo em quartzo e gavetas com corrediças ocultas Häfele.",
            materials: ["MDF Nogueira 25mm", "Tampo em quartzo branco"],
            ferragens: ["Corrediças ocultas Häfele com amortecedor", "Puxadores Zen"],
            iluminacao: ["Spots direcionais"],
            diferenciais: ["Gavetas organizadoras", "Tomadas retráteis"],
          },
        ],
      },
      {
        id: "closet",
        name: "Closet Master",
        planX: 30,
        planY: 74,
        image: "project-closet",
        intro:
          "Closet com cabideiros iluminados, gavetas internas e vitrines em vidro fumê com serralheria.",
        servicoSlug: "closets-planejados",
        hotspots: [
          {
            id: "cabideiro",
            name: "Cabideiro Iluminado",
            x: 45,
            y: 45,
            description: "Cabideiro Vesto Rometal com iluminação integrada em LED 3000K.",
            materials: ["MDF Nogueira 18mm", "Interno Preto TX"],
            ferragens: ["Cabideiro Vesto Rometal", "Dobradiças Salice clip reto"],
            iluminacao: ["LED 3000K embutido no cabideiro"],
            diferenciais: ["Iluminação automática", "Varão dourado fosco"],
          },
          {
            id: "gaveteiro",
            name: "Gaveteiro",
            x: 20,
            y: 70,
            description:
              "Gaveteiro com corrediças ocultas Häfele e divisores internos organizadores.",
            materials: ["MDF Nogueira 18mm"],
            ferragens: ["Corrediças ocultas Häfele com amortecedor"],
            iluminacao: ["LED interno com sensor de presença"],
            diferenciais: ["Divisores organizadores", "Abertura tip-on"],
          },
        ],
      },
      {
        id: "escritorio",
        name: "Escritório",
        planX: 70,
        planY: 72,
        image: "project-office",
        intro:
          "Escritório com estante iluminada, mesa em MDF Nogueira e vitrines em serralheria preta.",
        servicoSlug: "home-office-planejado",
        hotspots: [
          {
            id: "estante",
            name: "Estante Iluminada",
            x: 50,
            y: 40,
            description:
              "Estante com prateleiras iluminadas em perfil de LED slim e portas em vidro fumê.",
            materials: ["MDF Nogueira 18mm", "Vidro fumê"],
            ferragens: ["Dobradiças Salice clip reto", "Puxadores Zen"],
            iluminacao: ["Perfil de LED slim", "Fita de LED 3000K"],
            diferenciais: ["Prateleiras iluminadas individualmente"],
          },
        ],
      },
    ],
  },
  /**
   * Obras entregues, ponto a ponto — as cinco fotos de `src/data/obras.ts`
   * (mesmos ids) no mesmo visualizador da Residência Aurora.
   *
   * REGRA DE CONTEÚDO, diferente da Aurora: a Aurora é render e a
   * especificação dela é demonstração. Aqui é foto de móvel real e a M7 não
   * informou chapa, dobradiça, corrediça, temperatura de LED nem marca. Então
   * cada ponto descreve o que a foto mostra — acabamento, vidro, luz,
   * puxador — e `ferragens`/`iluminacao` ficam vazios quando o item não está
   * visível. Quando a M7 mandar a especificação de cada peça, ela entra
   * nestes mesmos campos.
   */
  {
    slug: "obras-entregues",
    tipo: "foto",
    name: "Obras entregues, ponto a ponto",
    client: "Fotos de móveis entregues pela M7",
    architect: "Obras entregues",
    coverName: "obra-bar-adega",
    description:
      "Cinco móveis entregues, fotografados prontos, com os detalhes de marcenaria marcados sobre a própria foto. Cada ponto descreve o que está visível: acabamento, vidro, iluminação, puxador.",
    ambientes: [
      {
        id: "bar-adega",
        name: "Bar com adega climatizada",
        image: "obra-bar-adega",
        intro:
          "Móvel em preto fosco contra parede de tijolo aparente: quatro colunas com porta de vidro iluminadas, adega climatizada embutida ao centro e armários baixos fechados nas laterais.",
        servicoSlug: "home-theater-e-painel-de-tv",
        hotspots: [
          {
            id: "colunas",
            name: "Colunas com porta de vidro",
            x: 26,
            y: 33,
            description:
              "Quatro colunas altas com porta de vidro e prateleiras de vidro, iluminadas por uma linha de LED vertical no fundo. A garrafa fica em exposição e protegida da poeira ao mesmo tempo.",
            materials: ["Estrutura em preto fosco", "Porta e prateleiras de vidro"],
            ferragens: [],
            iluminacao: ["Linha de LED vertical no fundo de cada coluna"],
            diferenciais: ["Prateleiras de vidro deixam a luz atravessar até a base"],
          },
          {
            id: "adega",
            name: "Adega climatizada embutida",
            x: 50,
            y: 70,
            description:
              "Nicho central dimensionado para a adega climatizada, com a frente do equipamento alinhada às portas vizinhas. O móvel foi desenhado em volta da adega, e não o contrário.",
            materials: ["Nicho em preto fosco"],
            ferragens: [],
            iluminacao: [],
            diferenciais: ["Adega embutida com a frente alinhada ao restante do móvel"],
          },
          {
            id: "nicho",
            name: "Nicho aberto sobre a adega",
            x: 47,
            y: 30,
            description:
              "Vão aberto entre as colunas, com uma prateleira para livros e objetos. É o respiro do conjunto: sem ele, a parede de portas ficaria pesada.",
            materials: ["Prateleira em preto fosco"],
            ferragens: [],
            iluminacao: [],
            diferenciais: ["Fundo aberto deixa o tijolo aparecer dentro do móvel"],
          },
          {
            id: "puxador",
            name: "Puxador barra dourado",
            x: 11,
            y: 72,
            description:
              "Armários baixos fechados nas laterais, com puxador em barra longa dourada aplicado sobre a porta de cima a baixo. O dourado repete o tom da luz das colunas.",
            materials: ["Portas em preto fosco"],
            ferragens: ["Puxador barra dourado, de altura inteira"],
            iluminacao: [],
            diferenciais: ["Um único elemento metálico por porta"],
          },
          {
            id: "tacas",
            name: "Prateleiras de vidro para taças",
            x: 65,
            y: 45,
            description:
              "Nas colunas da direita, as prateleiras de vidro recebem taças e cristais. Com a luz vindo do fundo, o vidro da taça acende junto com o da prateleira.",
            materials: ["Prateleiras de vidro"],
            ferragens: [],
            iluminacao: ["Luz de fundo atravessa taças e prateleiras"],
            diferenciais: [],
          },
        ],
      },
      {
        id: "guarda-roupa-vidro",
        name: "Guarda-roupa com portas de vidro",
        image: "obra-guarda-roupa-vidro",
        intro:
          "Guarda-roupa do piso ao teto com portas de vidro fumê em moldura amadeirada e um armário baixo de portas lisas integrado ao centro. As portas refletem o quarto e deixam entrever as prateleiras e a cômoda interna.",
        servicoSlug: "dormitorios-planejados",
        hotspots: [
          {
            id: "porta",
            name: "Porta de vidro fumê com moldura",
            x: 20,
            y: 45,
            description:
              "Cada folha é um quadro amadeirado com vidro fumê. O vidro escurece o interior sem esconder de todo, e a moldura dá ao guarda-roupa a cara de esquadria, não de armário.",
            materials: ["Moldura em acabamento amadeirado", "Vidro fumê"],
            ferragens: [],
            iluminacao: [],
            diferenciais: ["Folhas altas e estreitas, do piso ao teto"],
          },
          {
            id: "perfil",
            name: "Perfil vertical entre as folhas",
            x: 37,
            y: 40,
            description:
              "Entre uma folha e outra corre um perfil vertical claro, de cima a baixo, que serve de pega. Sem puxador saliente, a frente fica contínua.",
            materials: [],
            ferragens: ["Perfil vertical de abertura, de altura inteira"],
            iluminacao: [],
            diferenciais: ["Sem puxador saliente em nenhuma folha"],
          },
          {
            id: "armario-baixo",
            name: "Armário baixo de portas lisas",
            x: 50,
            y: 80,
            description:
              "Ao centro, um módulo baixo com quatro portas lisas no mesmo acabamento das molduras, sem puxador à vista. Fecha a composição na altura de uma bancada.",
            materials: ["Portas lisas em acabamento amadeirado"],
            ferragens: [],
            iluminacao: [],
            diferenciais: ["Mesmo acabamento das molduras, para ler como uma peça só"],
          },
          {
            id: "piso-teto",
            name: "Do piso ao teto",
            x: 50,
            y: 19,
            description:
              "As folhas vão até o forro, sem tampo aparente nem vão em cima. O que se ganha é armazenamento na altura que normalmente vira depósito de poeira.",
            materials: [],
            ferragens: [],
            iluminacao: [],
            diferenciais: ["Sem vão entre o móvel e o forro"],
          },
          {
            id: "prateleiras",
            name: "Prateleiras internas à mostra",
            x: 63,
            y: 46,
            description:
              "Através do vidro aparecem as prateleiras internas e, embaixo, uma cômoda com gavetas. O fumê mostra o volume sem expor cada objeto.",
            materials: ["Prateleiras internas e cômoda com gavetas"],
            ferragens: [],
            iluminacao: [],
            diferenciais: ["Interior organizado para ser visto através do vidro"],
          },
        ],
      },
      {
        id: "painel-tv",
        name: "Painel de TV e rack suspenso",
        image: "obra-painel-tv",
        intro:
          "Painel e rack suspenso em branco alto brilho, com porta em vidro bronze no rack. Uma estante metálica vazada separa a sala da área de jantar e da cozinha sem bloquear a luz.",
        servicoSlug: "home-theater-e-painel-de-tv",
        hotspots: [
          {
            id: "painel",
            name: "Painel em branco alto brilho",
            x: 45,
            y: 28,
            description:
              "Painel liso, sem nicho nem ripado, em branco de alto brilho: reflete a luz do ambiente e amplia a sala. A TV fica solta sobre ele, sem cabo aparente.",
            materials: ["Painel em branco alto brilho"],
            ferragens: [],
            iluminacao: [],
            diferenciais: ["Nenhum cabo à vista entre a TV e o rack"],
          },
          {
            id: "soundbar",
            name: "Prateleira para a soundbar",
            x: 28,
            y: 54,
            description:
              "Prateleira fina, no mesmo branco do painel, dimensionada para a soundbar ficar apoiada abaixo da TV, sem ocupar o rack.",
            materials: ["Prateleira em branco alto brilho"],
            ferragens: [],
            iluminacao: [],
            diferenciais: ["Soundbar na altura da TV, fora do rack"],
          },
          {
            id: "rack",
            name: "Rack suspenso com porta em vidro bronze",
            x: 47,
            y: 68,
            description:
              "Rack suspenso, sem pé no chão, com portas lisas brancas e uma porta central em vidro bronze que esconde os equipamentos sem fechar tudo.",
            materials: ["Rack em branco alto brilho", "Porta em vidro bronze"],
            ferragens: [],
            iluminacao: [],
            diferenciais: ["Suspenso: o piso passa por baixo, e a limpeza também"],
          },
          {
            id: "estante",
            name: "Estante metálica vazada",
            x: 57,
            y: 35,
            description:
              "Estrutura metálica fina e vazada, do piso ao teto, com prateleiras para objetos. Divide os ambientes sem fechar a vista nem a luz.",
            materials: ["Estrutura metálica clara"],
            ferragens: [],
            iluminacao: [],
            diferenciais: ["Divisória que não escurece nenhum dos dois lados"],
          },
          {
            id: "cozinha",
            name: "Integração com a cozinha",
            x: 83,
            y: 38,
            description:
              "Ao fundo, os armários da cozinha aparecem em branco e cinza brilhantes, na mesma família do painel. A marcenaria da sala e a da cozinha conversam pelo acabamento.",
            materials: ["Armários da cozinha em acabamento brilhante"],
            ferragens: [],
            iluminacao: [],
            diferenciais: ["Mesma linguagem de acabamento nos dois ambientes"],
          },
        ],
      },
      {
        id: "sala-jantar",
        name: "Sala de jantar com cristaleira",
        image: "obra-sala-jantar",
        intro:
          "Cristaleira com portas de vidro bronze e iluminação vertical, buffet sob a parede espelhada e uma bancada de apoio com nichos iluminados. Tudo na mesma luz quente dos pendentes.",
        hotspots: [
          {
            id: "cristaleira",
            name: "Cristaleira com portas de vidro bronze",
            x: 75,
            y: 45,
            description:
              "Duas portas altas em vidro bronze, com moldura escura, guardando taças, cristais e louça. O bronze aquece o que está dentro e esconde a desordem miúda.",
            materials: ["Moldura escura", "Portas em vidro bronze", "Prateleiras de vidro"],
            ferragens: [],
            iluminacao: [],
            diferenciais: [],
          },
          {
            id: "led",
            name: "Perfis verticais de LED",
            x: 67,
            y: 33,
            description:
              "A luz vem de linhas verticais no fundo da cristaleira, de cima a baixo, e não de cada prateleira. As prateleiras de vidro apenas deixam a luz passar.",
            materials: [],
            ferragens: [],
            iluminacao: ["Perfis verticais de LED no fundo da cristaleira"],
            diferenciais: ["Luz contínua do topo à base, sem sombra entre prateleiras"],
          },
          {
            id: "buffet",
            name: "Buffet sob o espelho",
            x: 50,
            y: 60,
            description:
              "Buffet baixo, em tom neutro fosco, encostado na parede espelhada, com o tampo livre para a bandeja de bar. O espelho duplica o buffet e a sala.",
            materials: ["Buffet em acabamento neutro fosco"],
            ferragens: [],
            iluminacao: [],
            diferenciais: ["Tampo livre para bandeja e objetos"],
          },
          {
            id: "espelho",
            name: "Parede espelhada",
            x: 40,
            y: 35,
            description:
              "A parede atrás do buffet é espelhada do buffet ao forro. Numa sala compacta, é o recurso que dobra a profundidade.",
            materials: ["Espelho de parede inteira"],
            ferragens: [],
            iluminacao: [],
            diferenciais: [],
          },
          {
            id: "nichos",
            name: "Nichos iluminados na bancada",
            x: 93,
            y: 30,
            description:
              "Ao lado da cristaleira, uma bancada de apoio com nichos abertos iluminados para xícaras e louça de uso diário, e a cafeteira embaixo.",
            materials: ["Nichos no mesmo acabamento escuro"],
            ferragens: [],
            iluminacao: ["Iluminação embutida em cada nicho"],
            diferenciais: ["Louça de uso diário fora da cristaleira, à mão"],
          },
        ],
      },
      {
        id: "mesa-madeira",
        name: "Mesa com pés em madeira maciça",
        image: "obra-mesa-madeira",
        // Foto em retrato (896x1200) num visualizador 4:3: o recorte mostra a
        // faixa de 13% a 69% da altura da foto. As coordenadas y abaixo já
        // estão convertidas para o recorte: y_recorte = (y_foto - 13,2) / 0,56.
        objectPosition: "50% 30%",
        intro:
          "Peça solta, não embutida: tampo espesso com saia em madeira e pés inclinados afunilados, encaixados em um suporte aparente sob o tampo. Fotografada pronta.",
        hotspots: [
          {
            id: "tampo",
            name: "Tampo espesso com saia",
            x: 50,
            y: 12,
            description:
              "Tampo com saia alta, que dá à mesa a espessura visual de um bloco. A frente da saia é uma face única, sem emenda aparente.",
            materials: ["Saia e tampo em acabamento amadeirado natural"],
            ferragens: [],
            iluminacao: [],
            diferenciais: ["Frente contínua, sem emenda aparente"],
          },
          {
            id: "encaixe",
            name: "Encaixe do pé no suporte",
            x: 42,
            y: 41,
            description:
              "O pé não sai direto do tampo: entra num suporte em cunha, aparente, que recebe a inclinação. É o detalhe que faz a peça, e o que só a madeira maciça permite usinar.",
            materials: ["Suporte e pé em madeira maciça"],
            ferragens: [],
            iluminacao: [],
            diferenciais: ["Encaixe aparente, tratado como desenho e não escondido"],
          },
          {
            id: "pe",
            name: "Pé inclinado afunilado",
            x: 42,
            y: 91,
            description:
              "Pé que afina do suporte até o chão, com faces suavizadas, inclinado para fora. O veio acompanha a peça inteira.",
            materials: ["Madeira maciça"],
            ferragens: [],
            iluminacao: [],
            diferenciais: ["Afunilado e inclinado, sem sapata aparente"],
          },
          {
            id: "veio",
            name: "Veio da madeira",
            x: 78,
            y: 19,
            description:
              "Na saia, o desenho do veio corre contínuo ao longo da peça. É o acabamento natural da madeira, sem pintura que o cubra.",
            materials: ["Acabamento natural, veio aparente"],
            ferragens: [],
            iluminacao: [],
            diferenciais: [],
          },
        ],
      },
    ],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
