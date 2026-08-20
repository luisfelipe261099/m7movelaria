import { serviceCatalog, type ServiceSummary } from "./catalog";

/**
 * Conteúdo longo das landing pages de serviço (/moveis-planejados/<slug>).
 *
 * Este módulo é importado APENAS pela rota que renderiza a página. Os campos
 * curtos (nome, slug, title, description, imagem) ficam em `catalog.ts`, que é o
 * que o rodapé e a home carregam — assim a prosa das seis páginas não entra no
 * bundle de quem só precisa de uma lista de links.
 *
 * Cada página precisa se sustentar sozinha na busca: um H1 com a consulta alvo,
 * texto realmente útil (não parágrafo de enchimento), FAQ próprio e links para
 * os serviços vizinhos. Página de serviço com três frases não ranqueia e ainda
 * dilui o resto do site.
 *
 * REGRA: nada aqui pode afirmar dado que a M7 não confirmou — preço, prazo em
 * dias, anos de mercado, número de obras, garantia em meses. O que dá para
 * escrever com honestidade é *como o preço/prazo se formam* e o que entra no
 * projeto; o número exato sai no orçamento.
 */

export type ServiceSection = {
  h2: string;
  body?: string;
  bullets?: string[];
};

export type ServiceBody = {
  intro: string[];
  sections: ServiceSection[];
  faq: { q: string; a: string }[];
};

export type Service = ServiceSummary & ServiceBody;

const content: Record<string, ServiceBody> = {
  "cozinhas-planejadas": {
    intro: [
      "A cozinha é o ambiente que mais castiga um móvel: calor, vapor, gordura e portas que abrem dezenas de vezes por dia. É também o ambiente onde a diferença entre um planejado de linha e uma marcenaria sob medida aparece mais rápido — normalmente no primeiro ano de uso, quando a dobradiça começa a ceder e a porta desalinha.",
      "Na M7, cada cozinha nasce de uma medição no local e de um projeto executivo próprio. Nada é adaptado a partir de um módulo de catálogo: a altura da bancada acompanha quem cozinha, a torre quente é dimensionada para o forno e o micro-ondas que já foram comprados, e o vão da geladeira é conferido com a ficha técnica do modelo antes de o MDF ser cortado.",
    ],
    sections: [
      {
        h2: "O que entra em um projeto de cozinha planejada",
        bullets: [
          "Armários inferiores e superiores sob medida, com prumo corrigido para paredes fora de esquadro",
          "Torre quente dimensionada para forno elétrico, micro-ondas e cooktop já definidos",
          "Ilha ou península com nichos, tomadas embutidas e apoio para banquetas",
          "Gaveteiros com corrediças de extensão total e amortecimento",
          "Despenseiro ou torre de mantimentos com prateleiras reguláveis",
          "Iluminação em LED sob os armários superiores e dentro dos gaveteiros",
          "Rodapé, acabamento de teto e arremates que fecham a marcenaria na alvenaria",
        ],
      },
      {
        h2: "Materiais e ferragens que usamos na cozinha",
        body: "Cozinha é o ambiente onde a ferragem trabalha mais — e onde economizar nela sai caro. Trabalhamos com dobradiças e corrediças Blum e Häfele, com amortecimento e vida útil especificada em ciclos pelo fabricante, e com chapas de MDF de 15, 18 e 25 mm conforme a função de cada peça (fundo, lateral estrutural, prateleira ou tampo).",
        bullets: [
          "Ferragens Blum, Häfele e Salice — dobradiças com clip, corrediças de extensão total e sistemas basculantes",
          "MDF revestido em branco, cores e padrões amadeirados; 25 mm onde há vão livre e risco de flecha",
          "Laca fosca em portas e frentes, quando o projeto pede superfície uniforme e sem emenda",
          "Lâmina natural com encaixe em 45° para continuidade de veio nas quinas",
          "Perfis de LED 3000K (luz quente) sobre a bancada e 5000K onde a tarefa exige luz neutra",
        ],
      },
      {
        h2: "Como funciona, do primeiro contato à instalação",
        bullets: [
          "Conversa inicial pelo WhatsApp para entender ambiente, prazo e referências",
          "Visita técnica e medição no local — inclusive de pontos de água, gás e elétrica",
          "Projeto 3D com as vistas de cada parede e a especificação de materiais e ferragens",
          "Ajustes do projeto junto com você (e com o arquiteto, quando houver)",
          "Aprovação, produção no ateliê e agendamento da entrega",
          "Instalação pela nossa equipe, com regulagem final de portas e gavetas",
        ],
      },
      {
        h2: "Cozinha planejada ou modulada de loja?",
        body: "A modulada de loja parte de módulos prontos em medidas fixas e resolve o preço; sobra vão, sobra tapa-furo e o projeto se adapta ao módulo. O planejado sob medida parte da sua parede: aproveita altura até o teto, resolve canto vivo, encaixa em recuo de pilar e não deixa o espaço morto onde o pó se acumula. Em cozinha pequena essa diferença costuma valer mais do que em qualquer outro ambiente, porque cada centímetro de altura vira armazenamento.",
      },
    ],
    faq: [
      {
        q: "Quanto custa uma cozinha planejada?",
        a: "Não existe preço de tabela em marcenaria sob medida: o valor é formado pelo metro linear efetivamente projetado, pelo tipo de chapa e acabamento (MDF revestido, laca fosca ou lâmina natural), pela ferragem especificada e pela quantidade de gavetas e mecanismos. Duas cozinhas do mesmo tamanho podem ter valores bem diferentes só pela ferragem. O caminho é enviar a planta ou as medidas pelo WhatsApp para receber um orçamento fechado do seu projeto.",
      },
      {
        q: "Quanto tempo demora para ficar pronta?",
        a: "O prazo tem duas partes: o projeto, que depende da velocidade das aprovações e das definições de acabamento, e a produção, que só começa depois do projeto aprovado e do local liberado. Como o prazo varia com a fila do ateliê e o tamanho do projeto, ele é confirmado por escrito no orçamento — e não estimado por telefone.",
      },
      {
        q: "Preciso ter a obra pronta para medir?",
        a: "Não. O ideal é fazer uma medição preliminar ainda com a obra em andamento, porque é nessa fase que dá para posicionar tomadas, ponto de água e ponto de gás no lugar certo para a marcenaria. A medição final, que libera o corte, é feita com piso assentado, revestimento colocado e paredes no acabamento definitivo.",
      },
      {
        q: "Vocês fazem a bancada de quartzo ou granito também?",
        a: "A bancada em pedra é executada por marmoraria e entra no projeto como especificação: definimos a espessura, o tipo de cuba, o rebaixo do cooktop e a altura final, e a marcenaria é produzida para receber essa peça. Assim a bancada chega e assenta sem retrabalho.",
      },
    ],
  },
  "dormitorios-planejados": {
    intro: [
      "Dormitório planejado é, na prática, um problema de circulação. O guarda-roupa mais bonito do projeto atrapalha se a porta de abrir bate no pé da cama, e a suíte com dois metros livres pede porta de correr, não porta de girar. É isso que a medição no local resolve antes de o desenho existir.",
      "Fazemos o quarto como um conjunto: guarda-roupa, cabeceira, criados-mudos e, quando cabe, uma bancada de apoio ou penteadeira — todos no mesmo acabamento, com os mesmos alinhamentos horizontais, para o ambiente ler como uma peça só.",
    ],
    sections: [
      {
        h2: "O que entra em um dormitório planejado",
        bullets: [
          "Guarda-roupa até o teto, com portas de abrir, de correr ou perfis deslizantes",
          "Organização interna: cabideiros em duas alturas, gaveteiro interno, prateleiras reguláveis e porta-calças",
          "Cabeceira estofada ou ripada, integrada ao painel e com tomada e USB embutidos",
          "Criados-mudos suspensos, que liberam o piso e facilitam a limpeza",
          "Bancada de apoio, penteadeira ou home office compacto quando o quarto permite",
          "Iluminação em LED no cabideiro, com acionamento por sensor de porta",
        ],
      },
      {
        h2: "Porta de correr, porta de abrir ou perfil deslizante",
        body: "Porta de abrir dá acesso total ao interior do armário, mas precisa de área de giro livre — em quartos apertados ela é a primeira coisa a rever. Porta de correr não invade a circulação e é a saída em quarto estreito, com a contrapartida de sempre deixar metade do vão fechado. Os perfis deslizantes (Rometal, Siforma) permitem folhas mais altas e leves, com trilho superior embutido, e são o que costuma resolver suíte com pé-direito alto.",
      },
      {
        h2: "Acabamentos que funcionam bem no quarto",
        bullets: [
          "MDF amadeirado para dar temperatura ao ambiente sem escurecer o quarto",
          "Laca fosca em tons claros, que reflete a luz e amplia visualmente o espaço",
          "Lâmina natural em 45° na frente do guarda-roupa, quando o quarto é o ponto alto do projeto",
          "LED 3000K, luz quente, para não transformar o quarto em ambiente de trabalho",
        ],
      },
    ],
    faq: [
      {
        q: "Dá para fazer guarda-roupa em quarto pequeno?",
        a: "Sim, e normalmente é onde o sob medida mais compensa. Em quarto pequeno o ganho vem de três decisões: subir o armário até o teto para usar a faixa alta como armazenamento de baixa frequência, reduzir a profundidade padrão quando o cabideiro permite, e escolher porta de correr para não gastar área de circulação com o giro da folha.",
      },
      {
        q: "O guarda-roupa vai até o teto? E se o teto for irregular?",
        a: "Vai, e é o que recomendamos: o vão entre o topo do armário e a laje só acumula poeira. Teto irregular ou com gesso fora de nível é resolvido com peça de arremate feita sob medida na instalação, que acompanha a variação sem deixar fresta aparente.",
      },
      {
        q: "Vocês fazem só o guarda-roupa ou o quarto inteiro?",
        a: "Os dois. Dá para executar apenas o guarda-roupa, mas quando cabeceira, criados-mudos e painel saem no mesmo projeto o resultado é mais coerente: mesmo acabamento, mesma altura de linha horizontal e nenhuma diferença de tonalidade entre lotes de chapa.",
      },
    ],
  },
  "closets-planejados": {
    intro: [
      "Closet bom não é o maior — é o que foi dimensionado pelo que você tem. Antes de desenhar, a conta é simples e precisa ser feita: quantos metros lineares de cabide de camisa, quantos de vestido longo, quantos pares de sapato, quantas gavetas de peça dobrada. Sem essa contagem o closet vira prateleira sobrando de um lado e falta de espaço do outro.",
      "Executamos closet aberto, com a roupa à vista e iluminação valorizando a peça, e closet fechado, com portas de vidro ou lâmina protegendo do pó. A escolha depende de quanto o ambiente recebe luz natural e poeira — e de quanto você quer administrar a organização visual todos os dias.",
    ],
    sections: [
      {
        h2: "O que compõe um closet planejado",
        bullets: [
          "Araras em duas alturas para camisa e peça curta, e arara alta para vestido e casaco",
          "Gaveteiros internos com corrediça de extensão total e divisórias para peça pequena",
          "Sapateira inclinada ou prateleira raso para calçado, dimensionada por número de pares",
          "Módulos com porta de vidro para bolsa, óculos e peça de coleção",
          "Nicho para mala e itens de baixa frequência na faixa mais alta",
          "Ilha central com gavetas quando a metragem permite circulação de 90 cm em volta",
          "LED em perfil sobre cada arara, acionado por sensor",
        ],
      },
      {
        h2: "Closet aberto ou fechado",
        body: "O closet aberto ganha em acesso e em sensação de amplitude, e é o formato que mais valoriza a iluminação — mas exige disciplina de organização, porque tudo fica visível. O fechado protege do pó e perdoa a bagunça do dia a dia, ao custo de uma camada a mais de portas. Em ambiente que não é dormitório e recebe circulação de fora, o fechado costuma ser a escolha mais prática.",
      },
      {
        h2: "Iluminação: onde o closet acerta ou erra",
        body: "Iluminação de closet não é decoração, é função — a luz precisa chegar na cor real do tecido. Perfil de LED contínuo sobre a arara ilumina a peça de cima a baixo sem sombra do próprio cabide; spot solto no teto faz o oposto, joga a sombra do corpo na roupa. Usamos 4000K a 5000K em closet quando a fidelidade de cor importa e 3000K quando o closet é integrado à suíte e precisa manter o clima do quarto.",
      },
    ],
    faq: [
      {
        q: "Qual o tamanho mínimo para um closet?",
        a: "O que define não é a área total e sim a circulação: um closet em L ou em U precisa de pelo menos 90 cm livres entre os módulos para você abrir gaveta e passar. Com 60 cm de profundidade de arara de cada lado, isso dá um vão em torno de 2,10 m para closet em corredor com dois lados. Abaixo disso, o caminho costuma ser um lado só de arara ou um guarda-roupa com organização de closet.",
      },
      {
        q: "Dá para transformar um quarto pequeno em closet?",
        a: "Sim, é uma das conversões mais comuns. O ponto de atenção é a janela: quarto vira closet com a janela existente, e luz direta desbota tecido. Nesses casos posicionamos as araras fora da incidência direta ou fechamos o módulo com porta.",
      },
      {
        q: "Closet fechado precisa de ventilação?",
        a: "Precisa de troca de ar, sim — módulo totalmente vedado em ambiente úmido favorece mofo. Resolvemos com folga técnica no rodapé e no topo dos módulos e, quando o ambiente é crítico, com portas de vidro que mantêm a peça visível e permitem abertura frequente.",
      },
    ],
  },
  "home-office-planejado": {
    intro: [
      "O home office que funciona resolve três coisas que quase nenhum móvel de loja resolve: altura de bancada compatível com a sua cadeira, cabo que não aparece e luz que não bate na tela. O resto é acabamento.",
      "Projetamos escritórios em casa que vão do canto de 1,20 m dentro do quarto até a sala inteira convertida, sempre com a fiação prevista no desenho — passagem de cabo, tomada embutida na bancada e ponto para monitor — em vez de improvisada depois da instalação.",
    ],
    sections: [
      {
        h2: "O que entra em um home office planejado",
        bullets: [
          "Bancada sob medida, com profundidade ajustada ao monitor e à sua distância de trabalho",
          "Passagem de cabos e caixa de tomada embutida no tampo, com organizador sob a bancada",
          "Gaveteiro ou armário fechado para documento, papelaria e equipamento",
          "Estante ou prateleiras com LED em perfil, iluminando a superfície e não a sua tela",
          "Painel acústico ou ripado ao fundo, que também melhora a chamada de vídeo",
          "Nicho para impressora e para no-break, com ventilação prevista",
        ],
      },
      {
        h2: "Ergonomia que o móvel precisa dar conta",
        body: "A bancada padrão de 75 cm serve para a maioria dos adultos com cadeira regulável, mas nem sempre para você. Quando o home office é de uso diário e prolongado, vale ajustar a altura na medição, prever apoio para o teclado na profundidade certa e deixar o vão livre para as pernas sem travessa atravessada. São decisões que não custam a mais no projeto e que decidem se o móvel é usado ou abandonado.",
      },
      {
        h2: "Home office em ambiente compartilhado",
        body: "Boa parte dos projetos não é uma sala dedicada — é um trecho de quarto, de sala ou de closet. Nesses casos o móvel tem que conseguir 'desligar' no fim do dia: porta de correr que fecha a bancada, tampo rebatível ou armário alto que esconde o equipamento resolvem melhor do que qualquer arranjo de decoração.",
      },
    ],
    faq: [
      {
        q: "Qual a profundidade ideal para a bancada de home office?",
        a: "Para monitor único de até 27 polegadas, 60 cm de profundidade dão distância de leitura confortável e ainda deixam área de apoio à frente do teclado. Com dois monitores ou monitor ultrawide, 70 a 75 cm evitam que você fique perto demais da tela. Abaixo de 50 cm o uso vira desconfortável em jornada longa.",
      },
      {
        q: "Como ficam os cabos e as tomadas?",
        a: "A fiação entra no projeto: definimos onde passa o cabo, onde fica a caixa de tomada (embutida no tampo ou sob a bancada) e prevemos furo passa-cabo alinhado ao ponto elétrico existente. Se a elétrica ainda não estiver executada, é o momento de posicionar o ponto no lugar certo em vez de puxar extensão depois.",
      },
      {
        q: "Dá para fazer home office em um quarto que já tem guarda-roupa?",
        a: "Dá, e é comum. O cuidado é não brigar por circulação: a bancada precisa de área para a cadeira recuar sem bater na porta do armário. Quando o espaço é justo, uma bancada mais estreita com armário superior costuma render mais do que uma bancada profunda encostada na parede.",
      },
    ],
  },
  "moveis-comerciais": {
    intro: [
      "Móvel comercial trabalha em outro regime: a gaveta que abre cinco vezes por dia numa casa abre cem numa recepção, e o balcão que encosta na parede da loja leva impacto de carrinho, de mala e de cadeira. Por isso a especificação de ferragem e de espessura de chapa em projeto comercial não é a mesma de um projeto residencial, mesmo quando o desenho parece igual.",
      "Executamos marcenaria para recepção, balcão de atendimento, expositor de loja, mobiliário de consultório e estação de trabalho de escritório — com o projeto compatibilizado com elétrica, lógica e, quando for o caso, com a identidade visual da marca.",
    ],
    sections: [
      {
        h2: "Ambientes comerciais que atendemos",
        bullets: [
          "Recepção e balcão de atendimento, com bancada em altura de atendimento em pé e sentado",
          "Loja: expositor, vitrine, prateleira ajustável e estoque de retaguarda",
          "Consultório e clínica: bancada com cuba, armário de insumos e mobiliário de sala de espera",
          "Escritório: estação de trabalho, armário de arquivo e sala de reunião",
          "Copa e área de convivência corporativa",
        ],
      },
      {
        h2: "O que muda em relação ao móvel residencial",
        bullets: [
          "Ferragem especificada por ciclos de abertura, não por preço de tabela",
          "Chapa de maior espessura em tampo, bancada e prateleira com vão livre",
          "Bordas e quinas com arremate reforçado nas áreas de circulação",
          "Compatibilização com pontos de elétrica, lógica e hidráulica antes do corte",
          "Instalação programada para janela de obra ou horário fora do funcionamento",
        ],
      },
      {
        h2: "Serralheria integrada",
        body: "Boa parte do mobiliário comercial pede estrutura metálica: pé de bancada, montante de prateleira, moldura de vitrine e apoio de balcão em vão maior. Executamos a serralheria sob medida integrada à marcenaria, o que evita a junção improvisada entre dois fornecedores diferentes e mantém alinhamento e acabamento no mesmo padrão.",
      },
    ],
    faq: [
      {
        q: "Vocês trabalham com projeto de arquiteto ou desenvolvem o projeto?",
        a: "Os dois. Quando existe projeto de arquitetura ou de identidade visual, executamos a marcenaria conforme o detalhamento e apontamos em compatibilização o que precisa de ajuste construtivo. Quando não existe, desenvolvemos o projeto executivo da marcenaria a partir do uso do espaço e do fluxo de atendimento.",
      },
      {
        q: "É possível instalar sem parar o funcionamento da loja?",
        a: "Na maioria dos casos sim, programando a instalação em etapas ou fora do horário de atendimento. Isso precisa ser combinado antes, porque muda a logística de entrega e a sequência de montagem no ateliê.",
      },
      {
        q: "Vocês emitem nota fiscal para pessoa jurídica?",
        a: "Sim. O faturamento para CNPJ é feito normalmente, com a nota emitida conforme os dados da empresa contratante.",
      },
    ],
  },
  "home-theater-e-painel-de-tv": {
    intro: [
      "O painel de TV é o móvel mais visto da casa e o que mais denuncia improviso: cabo aparecendo atrás da tela, tomada no lugar errado, altura que obriga a levantar o queixo para assistir. Resolver isso é questão de projeto, não de produto.",
      "Fazemos o conjunto completo da sala — painel, rack, nichos e, quando existe, a integração com o home theater e a caixa embutida — já prevendo a passagem de cabo HDMI, o ponto de tomada atrás da tela e a ventilação do equipamento dentro do rack fechado.",
    ],
    sections: [
      {
        h2: "O que entra no projeto da sala",
        bullets: [
          "Painel em ripado, lâmina natural, laca ou MDF amadeirado, dimensionado pela parede inteira",
          "Passagem de cabo interna, com tomada e ponto de dados posicionados atrás da TV",
          "Rack basculante ou com porta, com ventilação prevista para receiver e console",
          "Nichos e prateleiras com perfil de LED embutido",
          "Adega ou bar integrado à marcenaria, quando o ambiente pede",
          "Integração com caixas de som e projeção, quando há projeto de home theater",
        ],
      },
      {
        h2: "Altura certa da TV",
        body: "A regra prática que funciona na maioria das salas é alinhar o centro da tela com a altura dos olhos de quem está sentado — algo em torno de 100 a 110 cm do piso para um sofá de assento padrão. Painel executado sem essa conferência costuma subir demais, e a correção depois da instalação significa refurar o painel.",
      },
      {
        h2: "Ripado: quando ele ajuda e quando atrapalha",
        body: "O painel ripado dá textura e quebra a superfície plana, além de contribuir com a difusão do som na sala. Em contrapartida, acumula mais poeira entre as ripas e encarece o metro em relação a uma superfície lisa. Em salas pequenas, aplicá-lo só na faixa da TV — e manter o resto liso — costuma dar o efeito sem pesar o ambiente.",
      },
    ],
    faq: [
      {
        q: "O painel aguenta TV grande?",
        a: "Aguenta, desde que a fixação seja prevista em projeto. TV a partir de 65 polegadas exige reforço estrutural no ponto de fixação do suporte, feito por dentro do painel, e não apenas o painel de MDF. Esse reforço precisa ser definido antes da produção, com o modelo e o peso da TV e o tipo de suporte já conhecidos.",
      },
      {
        q: "Dá para esconder todos os cabos?",
        a: "Sim, com a passagem interna prevista no desenho e o ponto de tomada posicionado atrás da tela. Se a elétrica já estiver executada em lugar diferente, ainda dá para embutir o cabo dentro do painel e levá-lo até o ponto existente — o cuidado é combinar isso na medição, não na instalação.",
      },
      {
        q: "Rack fechado esquenta o equipamento?",
        a: "Esquenta se não houver ventilação. Rack com porta fechada que abriga receiver, console ou decodificador recebe abertura de ventilação no fundo e folga técnica nas laterais; em equipamento que dissipa muito calor, a porta de vidro com ventilação inferior é a solução mais segura.",
      },
    ],
  },
};

export const services: Service[] = serviceCatalog.map((s) => ({ ...s, ...content[s.slug] }));

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
