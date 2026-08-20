/**
 * FAQ geral (/perguntas-frequentes) — também alimenta o schema FAQPage.
 *
 * As perguntas foram escolhidas por serem as que a pessoa realmente digita antes
 * de pedir orçamento de móvel planejado, e não pelo que soa bonito no site.
 *
 * REGRA (repetida aqui porque é onde escorrega): nenhuma resposta pode inventar
 * prazo em dias, preço, percentual de entrada, prazo de garantia ou tempo de
 * mercado. Onde o número depende do cliente, a resposta explica *como o número
 * se forma* e remete ao orçamento. Isso é honesto e, para o Google, é conteúdo
 * melhor do que um número inventado — a página responde a intenção da busca.
 */

export type FaqItem = {
  q: string;
  a: string;
  /** Agrupa as perguntas em blocos na página. */
  group: "Projeto e orçamento" | "Materiais e acabamentos" | "Prazos e instalação" | "Atendimento";
};

export const faq: FaqItem[] = [
  {
    group: "Projeto e orçamento",
    q: "Quanto custa um móvel planejado?",
    a: "Marcenaria sob medida não tem preço de tabela porque não tem produto de prateleira. O valor de cada projeto é formado por quatro variáveis: os metros lineares efetivamente projetados, o tipo de chapa e acabamento (MDF revestido, laca fosca ou lâmina natural), a ferragem especificada e a quantidade de gavetas e mecanismos. Duas cozinhas do mesmo tamanho podem ter valores bem diferentes só pela escolha de ferragem. O caminho é enviar a planta ou as medidas pelo WhatsApp e receber um orçamento fechado do seu projeto.",
  },
  {
    group: "Projeto e orçamento",
    q: "O projeto é cobrado à parte?",
    a: "O projeto faz parte do processo de orçamento: medimos no local, desenhamos e apresentamos as vistas e a especificação de materiais antes de qualquer aprovação. Como cada caso tem um escopo diferente, as condições comerciais do projeto são informadas no atendimento, antes de você decidir.",
  },
  {
    group: "Projeto e orçamento",
    q: "Vocês trabalham com projeto de arquiteto?",
    a: "Sim, é parte grande do que fazemos. Quando existe projeto de arquitetura, executamos a marcenaria conforme o detalhamento e devolvemos a compatibilização — apontando onde a medida real do local diverge do desenho e o que isso exige de ajuste antes do corte. Quando não existe, desenvolvemos o projeto executivo da marcenaria a partir do uso do ambiente.",
  },
  {
    group: "Projeto e orçamento",
    q: "Preciso já ter tudo decidido para pedir orçamento?",
    a: "Não. Basta ter uma ideia dos ambientes e, se possível, a planta ou as medidas aproximadas. As definições de acabamento, ferragem e organização interna são construídas junto com você durante o projeto — é exatamente essa conversa que diferencia o sob medida do móvel de catálogo.",
  },
  {
    group: "Materiais e acabamentos",
    q: "Qual a diferença entre MDF, MDP e madeira maciça?",
    a: "MDF é fibra de madeira prensada em painel homogêneo: aceita usinagem, corte curvo e pintura, e é o material padrão da marcenaria planejada de qualidade. MDP tem partículas maiores, é mais barato e menos indicado onde há usinagem, furação repetida ou peso. Madeira maciça é mais nobre e mais viva — trabalha com a umidade, o que exige projeto pensado para essa movimentação e costuma limitá-la a peças específicas em vez do móvel inteiro. Na prática, um projeto bem feito combina os materiais por função em vez de escolher um só.",
  },
  {
    group: "Materiais e acabamentos",
    q: "O que é laca fosca e quando vale a pena?",
    a: "Laca é pintura aplicada sobre o MDF, com acabamento fosco, acetinado ou brilhante. A vantagem é a superfície contínua e sem emenda, em qualquer cor, inclusive em peças curvas e usinadas — algo que o revestimento em lâmina ou padrão amadeirado não faz. A contrapartida é o cuidado no dia a dia: a laca marca mais que o MDF revestido e um reparo eventual pede repintura da peça, não troca de um pedaço.",
  },
  {
    group: "Materiais e acabamentos",
    q: "Por que a ferragem faz tanta diferença no preço?",
    a: "Porque é a única parte do móvel que se move — e é onde ele falha primeiro. Dobradiça e corrediça de fabricantes como Blum, Häfele e Salice têm vida útil especificada em ciclos de abertura pelo próprio fabricante, amortecimento que evita o impacto que desalinha a porta, e regulagem em três eixos que permite corrigir o móvel anos depois. A diferença não aparece na entrega: aparece no terceiro ano de uso.",
  },
  {
    group: "Materiais e acabamentos",
    q: "Qual temperatura de LED usar: 3000K ou 5000K?",
    a: "3000K é luz quente, amarelada, e é a indicada para ambiente de convívio — sala, quarto e a área social da cozinha — porque valoriza tons de madeira e cria aconchego. 5000K é luz branca neutra, melhor para tarefa: bancada de trabalho, interior de closet e home office, onde você precisa enxergar a cor real do que está manuseando. Muitos projetos usam as duas, separadas por circuito.",
  },
  {
    group: "Prazos e instalação",
    q: "Quanto tempo demora para o móvel ficar pronto?",
    a: "O prazo tem duas partes independentes. A primeira é o projeto, que depende da velocidade das suas definições e aprovações. A segunda é a produção, que só começa depois do projeto aprovado e da medição final — e que varia com o tamanho do projeto e com a fila do ateliê. Por isso o prazo é confirmado por escrito no orçamento do seu projeto, e não estimado por telefone.",
  },
  {
    group: "Prazos e instalação",
    q: "Quando é feita a medição final?",
    a: "A medição que libera o corte é feita com o ambiente no acabamento definitivo: piso assentado, revestimento colocado e paredes prontas. Antes disso, ainda na obra, vale uma medição preliminar — é o momento de posicionar tomada, ponto de água e ponto de gás onde a marcenaria vai precisar, em vez de adaptar o móvel depois.",
  },
  {
    group: "Prazos e instalação",
    q: "A instalação é feita por vocês?",
    a: "Sim, a instalação é executada pela nossa equipe, incluindo a regulagem final de portas e gavetas. Isso importa: móvel sob medida sai do ateliê com folga técnica prevista justamente para ser ajustado ao local, e quem instala precisa conhecer o projeto.",
  },
  {
    group: "Prazos e instalação",
    q: "Dá para instalar com a casa habitada?",
    a: "Dá, com o combinado feito antes. A instalação pode ser organizada em etapas para manter o ambiente utilizável, com proteção de piso e parede e sequência definida. Cozinha em uso é o caso mais sensível — é possível manter geladeira e pia funcionando durante as etapas, desde que isso entre no planejamento e não seja improvisado no dia.",
  },
  {
    group: "Atendimento",
    q: "Quais cidades vocês atendem?",
    a: "O ateliê fica em São José dos Pinhais e atendemos Curitiba e a região metropolitana — incluindo Pinhais, Araucária, Colombo, Fazenda Rio Grande, Piraquara e Quatro Barras. Para endereços fora dessa região, vale confirmar no primeiro contato.",
  },
  {
    group: "Atendimento",
    q: "Posso visitar o ateliê antes de fechar?",
    a: "Pode, e recomendamos. O ateliê fica na R. Orestes Fogiato, 710, em São José dos Pinhais. Combine o horário pelo WhatsApp para garantir que haja alguém disponível para te acompanhar — é a melhor forma de ver acabamento e ferragem de perto em vez de decidir por foto.",
  },
  {
    group: "Atendimento",
    q: "Como falo com a M7?",
    a: "O caminho mais rápido é o WhatsApp (41) 98711-6308. Também atendemos por e-mail em m7movelaria@outlook.com.br. O horário de atendimento é de segunda a sexta, das 8h às 18h, e aos sábados das 8h às 12h.",
  },
];

export const faqGroups = [
  "Projeto e orçamento",
  "Materiais e acabamentos",
  "Prazos e instalação",
  "Atendimento",
] as const;
