import { CORES, MODULOS, FOLGA_ELETRO, type Modulo } from "@/data/precos";
import type { Acabamento, ItemConfig } from "@/lib/orcamento";

/**
 * Desenho 2D do conjunto que a pessoa está montando.
 *
 * Por que SVG paramétrico e não render 3D: o objetivo aqui é a pessoa se
 * enxergar no móvel — proporção, quantidade de portas, onde ficam as gavetas,
 * a cor da chapa. Isso um desenho de frente em escala resolve, pesa alguns KB,
 * redesenha instantaneamente a cada medida digitada e funciona no celular
 * fraco. Um 3D custaria uma biblioteca inteira no caminho crítico para vender
 * a mesma informação.
 *
 * Tudo é desenhado em milímetros reais dentro do `viewBox`: o navegador faz a
 * escala. Assim o desenho é sempre proporcional ao que foi digitado — um
 * armário de 400 mm ao lado de uma torre de 2100 mm aparece na proporção certa.
 */

/** Altura em que o aéreo é fixado, medida do piso à base do armário. */
const ALTURA_AEREO = 1500;
/** Folga entre um módulo e o vizinho, no desenho. */
const VAO = 20;
/** Altura do rodapé/pé regulável dos módulos de piso. */
const RODAPE = 100;
/** Margem em volta da cena, para as cotas caberem. */
const MARGEM = { topo: 90, direita: 200, baixo: 260, esquerda: 40 };

const CINZA_COTA = "#a8a099";
const TRACO = "#6b6259";

type Peca = { x: number; y: number; w: number; h: number };

/**
 * Nada de medida negativa ou NaN chegando no SVG.
 *
 * O campo de medida é livre — a pessoa apaga para digitar de novo, ou digita
 * uma torre de 700 mm que não comporta o forno que ela mesma informou. Nesses
 * casos a conta de "altura que sobra para a porta" fica negativa, e o navegador
 * recusa o atributo (`<rect height="-16">`) deixando o desenho quebrado no meio
 * do preenchimento. Aqui a peça simplesmente deixa de existir até a medida
 * voltar a fazer sentido; quem avisa que a medida está fora da faixa é o texto
 * de aviso do orçamento, não o desenho.
 */
const positivo = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

/** Converte a altura real (piso = 0, crescendo para cima) em Y do SVG. */
const paraSvg = (alturaCena: number, yReal: number, h: number) => alturaCena - yReal - h;

function Ripas({ x, y, w, h, cor }: Peca & { cor: string }) {
  const passo = 55;
  const n = Math.max(1, Math.floor(w / passo));
  const larguraRipa = w / n;
  return (
    <g>
      {Array.from({ length: n - 1 }, (_, i) => (
        <line
          key={i}
          x1={x + larguraRipa * (i + 1)}
          y1={y + 6}
          x2={x + larguraRipa * (i + 1)}
          y2={y + h - 6}
          stroke={cor}
          strokeWidth={4}
          opacity={0.55}
        />
      ))}
    </g>
  );
}

function Frente({
  peca,
  cor,
  contorno,
  ripada,
  puxador,
  orientacao,
}: {
  peca: Peca;
  cor: string;
  contorno: string;
  ripada: boolean;
  puxador: boolean;
  /** Onde entra o puxador: porta leva puxador vertical, gaveta leva horizontal. */
  orientacao: "porta" | "gaveta";
}) {
  const { x, y } = peca;
  const w = positivo(peca.w);
  const h = positivo(peca.h);
  if (w === 0 || h === 0) return null;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={cor} stroke={contorno} strokeWidth={3} rx={4} />
      {ripada && <Ripas x={x} y={y} w={w} h={h} cor={contorno} />}
      {puxador &&
        (orientacao === "porta" ? (
          <rect x={x + w - 40} y={y + h / 2 - 90} width={12} height={180} rx={6} fill={TRACO} />
        ) : (
          <rect x={x + w / 2 - 90} y={y + 26} width={180} height={12} rx={6} fill={TRACO} />
        ))}
    </g>
  );
}

/** Forno e micro-ondas: caixa escura com o vidro e a barra do puxador. */
function Eletro({ x, y, w, h }: Peca) {
  if (positivo(w) === 0 || positivo(h) === 0) return null;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#3b3733" rx={5} />
      <rect
        x={x + 26}
        y={y + h * 0.3}
        width={w - 52}
        height={h * 0.52}
        fill="#5e5952"
        opacity={0.75}
        rx={3}
      />
      <rect x={x + 26} y={y + h * 0.14} width={w - 52} height={12} rx={6} fill="#8c847b" />
    </g>
  );
}

function Cota({
  x1,
  y1,
  x2,
  y2,
  texto,
  vertical = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  texto: string;
  vertical?: boolean;
}) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={CINZA_COTA} strokeWidth={2.5} />
      <text
        x={vertical ? x1 + 34 : (x1 + x2) / 2}
        y={vertical ? (y1 + y2) / 2 : y1 + 46}
        fill={CINZA_COTA}
        fontSize={44}
        textAnchor={vertical ? "start" : "middle"}
        dominantBaseline={vertical ? "middle" : "auto"}
      >
        {texto}
      </text>
    </g>
  );
}

function DesenhoModulo({
  item,
  modulo,
  x,
  alturaCena,
  cor,
  contorno,
  acabamento,
}: {
  item: ItemConfig;
  modulo: Modulo;
  x: number;
  alturaCena: number;
  cor: string;
  contorno: string;
  acabamento: Acabamento;
}) {
  const L = positivo(item.largura);
  const A = positivo(item.altura);
  const baseReal = modulo.id === "aereo" ? ALTURA_AEREO : 0;
  const y = paraSvg(alturaCena, baseReal, A);
  const temRodape = modulo.id !== "aereo";
  const corpoY = y;
  const corpoH = positivo(temRodape ? A - RODAPE : A);

  // Torre quente: os nichos ocupam o miolo e as portas ficam com o que sobra.
  const nichos = (() => {
    if (!modulo.eletros || !item.forno || !item.micro) return null;
    const disponivel = positivo(A - RODAPE);
    const pedido = positivo(item.forno.altura) + positivo(item.micro.altura) + FOLGA_ELETRO * 4;
    // Se o vão não comporta os dois aparelhos, os nichos encolhem na proporção
    // pedida em vez de invadirem o resto do móvel — o orçamento avisa que a
    // medida não fecha, e o desenho mostra por quê.
    const escala = pedido > disponivel && pedido > 0 ? disponivel / pedido : 1;
    const hForno = (positivo(item.forno.altura) + FOLGA_ELETRO * 2) * escala;
    const hMicro = (positivo(item.micro.altura) + FOLGA_ELETRO * 2) * escala;
    const total = hForno + hMicro;
    const restante = positivo(disponivel - total);
    const hPortaBaixo = restante * 0.45;
    const hPortaCima = restante - hPortaBaixo;
    return { hForno, hMicro, hPortaBaixo, hPortaCima };
  })();

  const frentes: Array<{ peca: Peca; orientacao: "porta" | "gaveta" }> = [];

  if (nichos) {
    let cursor = corpoY; // topo do corpo, descendo
    frentes.push({
      peca: { x: x + 8, y: cursor + 8, w: L - 16, h: nichos.hPortaCima - 16 },
      orientacao: "porta",
    });
    cursor += nichos.hPortaCima + nichos.hMicro + nichos.hForno;
    frentes.push({
      peca: { x: x + 8, y: cursor + 8, w: L - 16, h: nichos.hPortaBaixo - 16 },
      orientacao: "porta",
    });
  } else if (modulo.gavetas > 0) {
    const h = corpoH / modulo.gavetas;
    for (let i = 0; i < modulo.gavetas; i++) {
      frentes.push({
        peca: { x: x + 8, y: corpoY + h * i + 8, w: L - 16, h: h - 16 },
        orientacao: "gaveta",
      });
    }
  } else if (modulo.portas > 0) {
    const w = L / modulo.portas;
    for (let i = 0; i < modulo.portas; i++) {
      frentes.push({
        peca: { x: x + w * i + 8, y: corpoY + 8, w: w - 16, h: corpoH - 16 },
        orientacao: "porta",
      });
    }
  }

  return (
    <g>
      {/* Caixa: aparece como a sombra do móvel atrás das frentes. */}
      <rect
        x={x}
        y={corpoY}
        width={L}
        height={corpoH}
        fill={cor}
        stroke={contorno}
        strokeWidth={4}
        rx={6}
      />

      {nichos && (
        <g>
          <rect
            x={x + 14}
            y={corpoY + nichos.hPortaCima}
            width={positivo(L - 28)}
            height={positivo(nichos.hMicro)}
            fill="#efe9e2"
            stroke={contorno}
            strokeWidth={3}
          />
          <Eletro
            x={x + 26}
            y={corpoY + nichos.hPortaCima + 10}
            w={positivo(L - 52)}
            h={positivo(nichos.hMicro - 20)}
          />
          <rect
            x={x + 14}
            y={corpoY + nichos.hPortaCima + nichos.hMicro}
            width={positivo(L - 28)}
            height={positivo(nichos.hForno)}
            fill="#efe9e2"
            stroke={contorno}
            strokeWidth={3}
          />
          <Eletro
            x={x + 26}
            y={corpoY + nichos.hPortaCima + nichos.hMicro + 10}
            w={positivo(L - 52)}
            h={positivo(nichos.hForno - 20)}
          />
        </g>
      )}

      {frentes.map((f, i) => (
        <Frente
          key={i}
          peca={f.peca}
          cor={cor}
          contorno={contorno}
          ripada={acabamento.ripada && f.orientacao === "porta"}
          puxador={acabamento.puxador}
          orientacao={f.orientacao}
        />
      ))}

      {temRodape && (
        <rect
          x={x + 30}
          y={corpoY + corpoH}
          width={positivo(L - 60)}
          height={RODAPE}
          fill={contorno}
          opacity={0.35}
        />
      )}

      {/* Cota de largura e nome, embaixo de cada módulo. */}
      <Cota x1={x} y1={alturaCena + 80} x2={x + L} y2={alturaCena + 80} texto={`${L} mm`} />
      <text x={x + L / 2} y={alturaCena + 200} fill={CINZA_COTA} fontSize={38} textAnchor="middle">
        {modulo.nome}
      </text>
    </g>
  );
}

export function PreviewMovel({
  itens,
  acabamento,
  numero,
  validade,
  cliente,
}: {
  itens: ItemConfig[];
  acabamento: Acabamento;
  /**
   * Código do orçamento. Vai na marca d'água em mosaico: print recortado
   * continua carregando de onde saiu e de qual simulação.
   */
  numero?: string;
  /** Data de validade, escrita no desenho para o print envelhecer sozinho. */
  validade?: string;
  /**
   * Primeiro nome de quem simulou. Entra na marca d'água: o print deixa de ser
   * um documento anônimo e passa a ser o orçamento de uma pessoa — bem menos
   * confortável de levar para outra marcenaria pedir cobertura.
   */
  cliente?: string;
}) {
  const cor = CORES.find((c) => c.id === acabamento.corId) ?? CORES[0];
  const contorno = cor.id === "branco" || cor.id === "cinza" ? "#8f8880" : "#4a3a2c";

  if (itens.length === 0) {
    return (
      <div className="rounded border border-dashed border-border bg-white p-10 text-center">
        <p className="text-sm text-muted-foreground">
          O desenho do seu móvel aparece aqui assim que você adicionar o primeiro módulo.
        </p>
      </div>
    );
  }

  // A cota vertical mostra a altura real do ponto mais alto do conjunto — por
  // isso a cena mede exatamente isso, e não uma altura fixa de referência.
  const alturaCena = Math.max(
    ...itens.map((i) =>
      MODULOS.find((m) => m.id === i.moduloId)?.id === "aereo"
        ? ALTURA_AEREO + positivo(i.altura)
        : positivo(i.altura),
    ),
  );
  const larguraCena =
    itens.reduce((s, i) => s + positivo(i.largura), 0) + VAO * Math.max(0, itens.length - 1);

  if (alturaCena <= 0 || larguraCena <= 0) {
    return (
      <div className="rounded border border-dashed border-border bg-white p-10 text-center">
        <p className="text-sm text-muted-foreground">
          Informe as medidas do módulo para ver o desenho.
        </p>
      </div>
    );
  }

  let cursor = 0;
  const desenhos = itens.map((item) => {
    const modulo = MODULOS.find((m) => m.id === item.moduloId)!;
    const x = cursor;
    cursor += positivo(item.largura) + VAO;
    return { item, modulo, x };
  });

  // O id do <pattern> não pode colidir se dois desenhos coexistirem na página.
  const idMarca = `marca-m7-${numero || "simulacao"}`;

  const vbW = larguraCena + MARGEM.esquerda + MARGEM.direita;
  const vbH = alturaCena + MARGEM.topo + MARGEM.baixo;

  return (
    <figure className="rounded border border-border bg-white p-4">
      <svg
        viewBox={`${-MARGEM.esquerda} ${-MARGEM.topo} ${vbW} ${vbH}`}
        className="w-full h-auto"
        style={{ maxHeight: "420px" }}
        role="img"
        aria-label={`Desenho do conjunto com ${itens.length} módulos em ${cor.nome}`}
      >
        {/* Piso e parede, para dar referência de altura. */}
        <line
          x1={-MARGEM.esquerda + 10}
          y1={alturaCena}
          x2={larguraCena + MARGEM.direita - 10}
          y2={alturaCena}
          stroke={CINZA_COTA}
          strokeWidth={4}
        />
        {desenhos.map(({ item, modulo, x }) => (
          <DesenhoModulo
            key={item.uid}
            item={item}
            modulo={modulo}
            x={x}
            alturaCena={alturaCena}
            cor={cor.hex}
            contorno={contorno}
            acabamento={acabamento}
          />
        ))}

        {/* Cota de altura total, à direita da cena. */}
        <Cota
          x1={larguraCena + 60}
          y1={0}
          x2={larguraCena + 60}
          y2={alturaCena}
          texto={`${Math.round(alturaCena)} mm`}
          vertical
        />

        {/*
          Marca d'água em mosaico.
          Print não dá para impedir — não existe API de navegador para isso, e
          quem quiser fotografa a tela com outro aparelho. O que dá para fazer é
          o print sair pouco útil para quem quer levar a terceiros: a origem, o
          código da simulação e a validade aparecem repetidos, então qualquer
          recorte continua dizendo de onde veio e de quando é. Uma marca única
          no meio era só recortar fora.
        */}
        <defs>
          <pattern
            id={idMarca}
            width={1100}
            height={620}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-20)"
          >
            <text
              x={0}
              y={80}
              fill={contorno}
              opacity={0.085}
              fontSize={76}
              style={{ letterSpacing: "0.18em", fontWeight: 700 }}
            >
              M7 MOVELARIA
            </text>
            <text x={0} y={150} fill={contorno} opacity={0.075} fontSize={48}>
              m7movelaria.com.br{numero ? ` · ${numero}` : ""}
            </text>
            {cliente && (
              <text x={0} y={214} fill={contorno} opacity={0.075} fontSize={48}>
                Simulação de {cliente}
              </text>
            )}
          </pattern>
        </defs>
        <rect
          x={-MARGEM.esquerda}
          y={-MARGEM.topo}
          width={larguraCena + MARGEM.esquerda + MARGEM.direita}
          height={alturaCena + MARGEM.topo + MARGEM.baixo}
          fill={`url(#${idMarca})`}
          pointerEvents="none"
        />
      </svg>
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          Desenho em escala do que você montou · {cor.nome}
          {acabamento.ripada && " · porta ripada"} · aéreo a {ALTURA_AEREO} mm do piso
        </span>
        <span>
          {cliente ? `Simulação de ${cliente} · ` : ""}M7 Movelaria
          {numero ? ` · orçamento ${numero}` : ""}
          {validade ? ` · válido até ${validade}` : ""}
        </span>
      </figcaption>
      {/*
        Impressão e "salvar como PDF" do navegador: a faixa só existe no papel,
        então não polui a tela de quem está comprando.
      */}
      <p className="hidden print:block mt-2 text-xs text-muted-foreground">
        Simulação gerada em m7movelaria.com.br
        {numero ? ` · orçamento ${numero}` : ""}
        {validade ? ` · válido até ${validade}` : ""}. Cópia impressa não vale como proposta
        comercial e não garante preço nem prazo.
      </p>
    </figure>
  );
}
