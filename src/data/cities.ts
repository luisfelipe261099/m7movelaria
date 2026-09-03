import { cityCatalog, type CitySummary } from "./catalog";

/**
 * Conteúdo longo das landing pages locais (/moveis-planejados-em/<slug>).
 * Importado apenas pela rota que o exibe — ver o comentário em `catalog.ts`.
 *
 * ATENÇÃO — o risco aqui é *doorway page*: um punhado de páginas idênticas com a
 * cidade trocada. O Google trata isso como spam e derruba o site inteiro, não só
 * as páginas. Por isso cada cidade abaixo tem conteúdo próprio: contexto urbano
 * real, bairros existentes, o tipo de imóvel que predomina e o que isso muda no
 * projeto de marcenaria. Se um dia entrar uma cidade nova, ela precisa ganhar
 * texto próprio — copiar de outra cidade é pior do que não ter a página.
 *
 * REGRA: só entram fatos geográficos públicos e o que a M7 realmente faz. Nada
 * de "mais de X clientes em Curitiba" ou qualquer número não confirmado.
 */

export type CityBody = {
  /** Relação com o ateliê, escrita sem prometer prazo. */
  logistics: string;
  intro: string[];
  neighborhoods: string[];
  context: { h2: string; body: string };
  faq: { q: string; a: string }[];
};

export type City = CitySummary & CityBody;

const content: Record<string, CityBody> = {
  "sao-jose-dos-pinhais": {
    logistics:
      "O ateliê da M7 fica em São José dos Pinhais, na R. Henrique Bortolam, 182, no bairro Costeira. Aqui a visita técnica, a medição e a instalação acontecem na mesma cidade da produção — o que encurta o caminho entre um ajuste no projeto e a peça pronta.",
    intro: [
      "São José dos Pinhais é a cidade onde a M7 produz. Isso muda coisas práticas para quem mora aqui: a medição não depende de deslocamento entre municípios, um ajuste de última hora no projeto não vira uma semana de logística, e a assistência pós-instalação é resolvida sem agendamento de viagem.",
      "É também a cidade cujo estoque de imóveis conhecemos melhor — do sobrado antigo do Centro e do Afonso Pena aos apartamentos e condomínios mais recentes, cada um com um tipo diferente de problema de marcenaria.",
    ],
    neighborhoods: [
      "Centro",
      "Afonso Pena",
      "Cidade Jardim",
      "Costeira",
      "Guatupê",
      "Boneca do Iguaçu",
      "São Marcos",
      "Bom Jesus",
      "Borda do Campo",
      "Ouro Fino",
      "Del Rey",
      "Águas Belas",
    ],
    context: {
      h2: "O que muda em um projeto sob medida em São José dos Pinhais",
      body: "A cidade mistura casa térrea e sobrado de bairro consolidado com prédio novo de metragem enxuta. No sobrado, o desafio quase sempre é parede fora de esquadro e pé-direito irregular — situações em que o módulo de loja deixa fresta e o sob medida resolve com arremate feito na instalação. Nos apartamentos mais novos, o problema inverte: o espaço é pouco e o ganho vem de subir a marcenaria até o teto e de aproveitar recuo de pilar e vão de viga que o móvel pronto simplesmente ignora.",
    },
    faq: [
      {
        q: "Onde fica o ateliê da M7 em São José dos Pinhais?",
        a: "Na R. Henrique Bortolam, 182, bairro Costeira, São José dos Pinhais - PR. O atendimento é de segunda a sexta, das 8h às 18h, e aos sábados das 8h às 12h. A visita ao ateliê é combinada previamente pelo WhatsApp para garantir que haja alguém disponível para te acompanhar.",
      },
      {
        q: "Vocês atendem toda São José dos Pinhais?",
        a: "Sim, incluindo os bairros mais afastados do Centro. Para endereços em área rural ou distritos, vale confirmar o local no primeiro contato, porque isso pode influenciar o agendamento da medição e da entrega.",
      },
    ],
  },
  curitiba: {
    logistics:
      "Curitiba faz divisa com São José dos Pinhais, onde fica o nosso ateliê. Na prática, a medição, a entrega e a instalação em Curitiba são atendidas com a mesma estrutura da cidade sede.",
    intro: [
      "Curitiba concentra dois tipos de projeto bem diferentes. De um lado, o apartamento de alto padrão em bairros como Batel, Champagnat e Ecoville, onde a marcenaria costuma ser o elemento que define o acabamento do imóvel inteiro e o projeto vem acompanhado de um arquiteto. Do outro, o apartamento compacto em bairros como Portão, Água Verde e Cristo Rei, onde o planejado precisa resolver armazenamento em pouca metragem sem fechar o ambiente.",
      "Atendemos os dois com o mesmo processo: medição no local, projeto executivo próprio e execução no ateliê em São José dos Pinhais — e não com módulos de catálogo adaptados ao vão.",
    ],
    neighborhoods: [
      "Batel",
      "Água Verde",
      "Champagnat",
      "Bigorrilho",
      "Ecoville",
      "Cabral",
      "Juvevê",
      "Alto da XV",
      "Bacacheri",
      "Santa Felicidade",
      "Portão",
      "Cristo Rei",
      "Jardim Social",
      "Hugo Lange",
      "Campo Comprido",
      "Boa Vista",
    ],
    context: {
      h2: "Marcenaria para apartamento em Curitiba: o que precisa entrar no projeto",
      body: "Projeto em prédio tem restrições que casa não tem, e ignorá-las custa tempo de obra. Elevador e escada limitam o tamanho máximo da peça que entra montada, o que precisa ser decidido no desenho e não na entrega. Regra de condomínio costuma restringir horário de trabalho ruidoso e exige agendamento de carga e descarga. Parede de drywall e shaft mudam onde é possível fixar carga — painel de TV grande e armário aéreo pedem reforço definido em projeto. Tudo isso entra na medição, junto com a conferência do quadro de energia para os pontos de LED.",
    },
    faq: [
      {
        q: "Vocês entregam e instalam em Curitiba?",
        a: "Sim. Curitiba é atendida a partir do ateliê em São José dos Pinhais, com medição no local, entrega e instalação pela nossa própria equipe. Para apartamento, combinamos antes o agendamento de elevador e as regras de horário do condomínio.",
      },
      {
        q: "Trabalham junto com arquitetos em Curitiba?",
        a: "Sim, e em Curitiba isso é a maior parte do que chega até nós — a cidade concentra os escritórios de interiores da região. O que muda em relação a um atendimento direto: recebemos o detalhamento pronto, medimos o local antes do corte e devolvemos a compatibilização por escrito. Em apartamento de prédio antigo do Batel ou do Água Verde, a divergência entre o desenho e a parede real é regra, não exceção, e é melhor descobrir isso antes da chapa cortada.",
      },
      {
        q: "Dá para visitar o ateliê antes de fechar?",
        a: "Dá, e recomendamos. O ateliê fica na R. Henrique Bortolam, 182, no bairro Costeira, em São José dos Pinhais, a poucos minutos da divisa com Curitiba. É onde você vê o acabamento e a ferragem de perto, em vez de decidir por foto.",
      },
    ],
  },
  pinhais: {
    logistics:
      "Pinhais é vizinha de São José dos Pinhais e Curitiba, o que mantém a cidade dentro do raio de atendimento direto do nosso ateliê.",
    intro: [
      "Pinhais tem um perfil de imóvel bastante variado para uma cidade do seu tamanho: condomínio horizontal de alto padrão na região da Graciosa, casa de bairro consolidado no Centro e em Weissópolis, e prédios residenciais mais recentes ao longo dos eixos que ligam a cidade a Curitiba.",
      "Na marcenaria isso aparece como dois pedidos recorrentes bem distintos — projeto completo de casa em condomínio, com cozinha, closet e home theater no mesmo padrão de acabamento, e projeto pontual de guarda-roupa ou cozinha para reforma de imóvel já ocupado.",
    ],
    neighborhoods: [
      "Centro",
      "Weissópolis",
      "Emiliano Perneta",
      "Jardim Amélia",
      "Vargem Grande",
      "Alphaville Graciosa",
      "Alto Tarumã",
      "Atuba",
    ],
    context: {
      h2: "Reforma com o imóvel habitado",
      body: "Boa parte dos projetos em Pinhais é reforma de imóvel em uso, não obra vazia — e isso muda a logística mais do que muda o desenho. Nesses casos a medição já considera o móvel antigo que sai, a sequência de instalação é planejada para deixar o ambiente utilizável entre as etapas, e a proteção de piso e parede entra no combinado. Cozinha em uso é o caso mais sensível: dá para instalar por partes, mantendo geladeira e pia funcionando, desde que isso seja acordado antes da produção e não improvisado no dia.",
    },
    faq: [
      {
        q: "Vocês atendem condomínios em Pinhais?",
        a: "Sim. Em condomínio fechado o que muda é o procedimento de acesso: cadastro prévio da equipe, agendamento de entrada de carga e, em alguns casos, restrição de horário para trabalho com ruído. Combinamos isso antes da entrega para não perder o dia de instalação na portaria.",
      },
      {
        q: "Dá para fazer só um ambiente?",
        a: "Dá. Não há exigência de fechar a casa inteira — muitos projetos começam por um ambiente, normalmente a cozinha ou o guarda-roupa, e continuam depois nos demais. O que recomendamos é registrar a especificação de acabamento usada, para que uma etapa futura consiga manter a mesma linha.",
      },
    ],
  },
  araucaria: {
    logistics:
      "Araucária fica na região metropolitana de Curitiba e é atendida a partir do ateliê em São José dos Pinhais, com medição, entrega e instalação pela nossa equipe.",
    intro: [
      "Araucária combina bairros residenciais consolidados com uma base industrial forte, e isso se reflete nos projetos: além da marcenaria residencial, aparecem com frequência pedidos comerciais — recepção, sala de reunião, copa corporativa e mobiliário de escritório.",
      "Atendemos os dois lados com a mesma marcenaria, mudando a especificação: móvel comercial recebe ferragem dimensionada por ciclo de uso e chapa de maior espessura onde há vão livre, porque o regime de trabalho não é o de uma casa.",
    ],
    neighborhoods: [
      "Centro",
      "Fazenda Velha",
      "Cachoeira",
      "Costeira",
      "Thomaz Coelho",
      "Capela Velha",
      "Iguaçu",
      "Estação",
    ],
    context: {
      h2: "Projeto residencial e projeto comercial na mesma cidade",
      body: "A diferença entre os dois não está no desenho e sim na especificação. Uma gaveta residencial abre poucas vezes por dia; a mesma gaveta numa recepção abre dezenas. Por isso, em projeto comercial, a corrediça e a dobradiça são escolhidas pelo número de ciclos que o fabricante garante, o tampo sobe de espessura e as quinas de circulação recebem arremate reforçado. É também onde a serralheria sob medida costuma entrar — pé de bancada e estrutura de balcão em vão maior.",
    },
    faq: [
      {
        q: "Vocês fazem móveis para empresa em Araucária?",
        a: "Fazemos: recepção, balcão de atendimento, sala de reunião, copa e estação de trabalho, com faturamento para CNPJ. A instalação pode ser programada fora do horário de funcionamento quando a operação não pode parar — isso precisa ser combinado antes, porque muda a sequência de montagem.",
      },
      {
        q: "O deslocamento até Araucária tem custo?",
        a: "A visita técnica e a logística de entrega entram na composição do orçamento junto com o projeto, e você recebe o valor fechado antes de decidir. Não trabalhamos com cobrança separada aparecendo depois da aprovação.",
      },
    ],
  },
  colombo: {
    logistics:
      "Colombo faz divisa com Curitiba e está no raio atendido pelo ateliê da M7 em São José dos Pinhais.",
    intro: [
      "Em Colombo o pedido mais comum é o projeto que acompanha uma reforma: cozinha e guarda-roupa refeitos num imóvel que já está de pé há alguns anos, muitas vezes com alvenaria fora de esquadro e instalação elétrica antiga.",
      "Esses dois pontos definem boa parte do trabalho. Parede torta é resolvida com arremate feito na instalação, não com tapa-furo genérico. E elétrica antiga precisa ser conferida antes de o projeto prever LED e tomada embutida — o ponto existente nem sempre suporta o que o desenho pede.",
    ],
    neighborhoods: [
      "Centro",
      "Maracanã",
      "Guaraituba",
      "São Gabriel",
      "Roça Grande",
      "Atuba",
      "Rio Verde",
      "Monte Castelo",
    ],
    context: {
      h2: "Marcenaria em imóvel que já está pronto",
      body: "Projetar para um imóvel construído é diferente de projetar para obra nova. A medição precisa registrar prumo, esquadro e nível reais — não os do projeto original — porque é a partir deles que a peça é cortada. Ponto de tomada, registro de água e caixa de passagem existentes viram restrição de desenho: o armário se adapta a eles ou o orçamento passa a incluir a mudança do ponto. Deixar essa conferência para o dia da instalação é a principal causa de móvel que 'não coube'.",
    },
    faq: [
      {
        q: "Minha parede é torta. Isso é problema?",
        a: "É uma condição normal em imóvel construído, não um impedimento. O sob medida lida com isso de duas formas: registrando a variação na medição para cortar a peça já compensada, e usando arremate feito na hora da instalação para fechar a diferença sem deixar fresta. É justamente o que o módulo pronto de loja não consegue fazer.",
      },
      {
        q: "Vocês retiram o móvel antigo?",
        a: "A retirada pode entrar no combinado, mas precisa ser dita antes do orçamento, porque ocupa tempo de equipe e espaço de transporte no dia da instalação.",
      },
    ],
  },
  "fazenda-rio-grande": {
    logistics:
      "Fazenda Rio Grande fica na região metropolitana de Curitiba e é atendida a partir do ateliê da M7 em São José dos Pinhais.",
    intro: [
      "Fazenda Rio Grande cresceu rápido e tem grande presença de casas e sobrados em loteamento recente — imóveis novos, com planta compacta e, quase sempre, o mesmo desafio: transformar pouca metragem em armazenamento suficiente sem deixar o ambiente pesado.",
      "É o cenário em que a marcenaria sob medida rende mais por metro quadrado. Subir o armário até o teto, aproveitar o vão sob a escada do sobrado, usar profundidade reduzida onde a função permite e resolver o canto vivo da cozinha são decisões que o móvel pronto não oferece.",
    ],
    neighborhoods: [
      "Centro",
      "Eucaliptos",
      "Gralha Azul",
      "Santa Terezinha",
      "Nações",
      "Iguaçu",
      "Green Field",
      "Estados",
    ],
    context: {
      h2: "Sobrado e casa de loteamento: onde o sob medida rende mais",
      body: "Em sobrado de planta compacta existem três espaços que costumam ser desperdiçados e que a marcenaria recupera. O vão sob a escada, que vira despensa, armário de serviço ou home office pequeno. A faixa entre o topo do armário e o teto, que em cozinha comporta o que se usa poucas vezes por ano. E o recuo de pilar e o vão de viga, que no móvel de catálogo viram espaço morto e no sob medida viram nicho ou prateleira. Somados, esses três costumam representar mais armazenamento do que qualquer módulo extra comprado depois.",
    },
    faq: [
      {
        q: "Vocês fazem móvel para casa ainda em construção?",
        a: "Fazemos, e é o melhor momento para começar a conversa. Com a obra em andamento dá para posicionar tomada, ponto de água e ponto de gás onde a marcenaria vai precisar, em vez de adaptar o móvel a um ponto mal colocado. A medição final, que libera o corte, é feita depois com o piso e o revestimento já assentados.",
      },
      {
        q: "Dá para fazer o projeto por etapas?",
        a: "Dá. Muitos projetos começam por cozinha e guarda-roupa e continuam depois nos demais ambientes. O importante é guardar a especificação de acabamento usada na primeira etapa, para que a seguinte consiga manter o mesmo padrão.",
      },
    ],
  },
};

export const cities: City[] = cityCatalog.map((c) => ({ ...c, ...content[c.slug] }));

export function getCity(slug: string) {
  return cities.find((c) => c.slug === slug);
}
