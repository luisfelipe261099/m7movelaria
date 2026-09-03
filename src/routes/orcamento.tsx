import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Info,
  MessageCircle,
  Minus,
  Plus,
  QrCode,
  Ruler,
  Truck,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Breadcrumbs } from "@/components/PageParts";
import { PreviewMovel } from "@/components/PreviewMovel";
import { whatsappLink } from "@/lib/whatsapp";
import {
  carregaLead,
  contatoValido,
  enviaLead,
  nomeValido,
  primeiroNome,
  salvaLead,
  type Lead,
} from "@/lib/lead";
import { pageSeo } from "@/lib/seo";
import { CORES, MODULOS, type Modulo, type ModuloId } from "@/data/precos";
import { TABELA_CONFIRMADA } from "@/data/simulador";
import {
  brl,
  calculaOrcamento,
  type Acabamento,
  type Entrega,
  type ItemConfig,
} from "@/lib/orcamento";

const PATH = "/orcamento";
const TRAIL = [
  { name: "Início", path: "/" },
  { name: "Monte seu móvel", path: PATH },
];

export const Route = createFileRoute("/orcamento")({
  head: () => ({
    ...pageSeo({
      title: "Monte seu móvel e veja o preço | M7 Movelaria",
      description:
        "Escolha os módulos, informe as medidas e veja o valor do seu planejado na hora. Produção da M7 Movelaria, entrega e montagem em Curitiba e região.",
      path: PATH,
      // Enquanto a tabela de preço não for a real da M7, a página não pode ser
      // indexada: preço público é dado de negócio, e o do simulador ainda é
      // demonstração.
      noindex: !TABELA_CONFIRMADA,
    }),
  }),
  component: Simulador,
});

const ETAPAS = ["Ambiente", "Módulos", "Medidas", "Acabamento", "Resumo", "Pagamento"] as const;

/** Código e validade da simulação, carimbados no desenho. */
type Identificacao = { numero: string; validade: string; cliente?: string };

const AMBIENTES = [
  {
    id: "cozinha",
    nome: "Cozinha",
    descricao: "Aéreos, balcões, gaveteiro e torre quente.",
    ativo: true,
  },
  {
    id: "dormitorio",
    nome: "Dormitório",
    descricao: "Guarda-roupa, cabeceira e criado-mudo.",
    ativo: false,
  },
  {
    id: "home-office",
    nome: "Home office",
    descricao: "Bancada, gaveteiro e estante.",
    ativo: false,
  },
  {
    id: "lavanderia",
    nome: "Lavanderia",
    descricao: "Armário de área de serviço e torre.",
    ativo: false,
  },
];

let seq = 0;
const novoItem = (modulo: Modulo): ItemConfig => ({
  uid: `${modulo.id}-${++seq}`,
  moduloId: modulo.id,
  largura: modulo.padrao[0],
  altura: modulo.padrao[1],
  profundidade: modulo.padrao[2],
  quantidade: 1,
  ...(modulo.eletros
    ? {
        forno: { largura: 595, altura: 595, profundidade: 550 },
        micro: { largura: 490, altura: 290, profundidade: 400 },
      }
    : {}),
});

function Simulador() {
  const [etapa, setEtapa] = useState(0);
  const [ambiente, setAmbiente] = useState("cozinha");
  const [itens, setItens] = useState<ItemConfig[]>([]);
  const [acabamento, setAcabamento] = useState<Acabamento>({
    corId: "branco",
    ripada: false,
    puxador: true,
  });
  const [entrega, setEntrega] = useState<Entrega>("local");
  const [pagamento, setPagamento] = useState<"pix" | "credito">("pix");
  const [identificacao, setIdentificacao] = useState({ numero: "", validade: "" });
  const [lead, setLead] = useState<Lead | null>(null);

  /**
   * Código e validade da simulação, para a marca d'água e para o rodapé.
   *
   * Gerado depois da montagem, e não durante a renderização, porque o valor
   * muda a cada chamada: no servidor sairia um código e no cliente outro, e o
   * React acusaria divergência de hidratação na página inteira.
   */
  useEffect(() => {
    const agora = new Date();
    const d = (n: number) => String(n).padStart(2, "0");
    const sufixo = Math.random().toString(36).slice(2, 6).toUpperCase();
    const validade = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);
    setIdentificacao({
      numero: `${String(agora.getFullYear()).slice(2)}${d(agora.getMonth() + 1)}${d(agora.getDate())}-${sufixo}`,
      validade: validade.toLocaleDateString("pt-BR"),
    });
  }, []);

  /**
   * `?etapa=4&demo=cozinha` abre o simulador já num passo, com um carrinho de
   * exemplo. Serve para mandar o link de uma tela específica para o cliente (e
   * para gerar as imagens da proposta) sem ter que refazer o preenchimento.
   */
  useEffect(() => {
    // Quem já se identificou numa visita anterior não preenche de novo.
    setLead(carregaLead());

    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "cozinha" && itens.length === 0) {
      setItens([
        novoItem(MODULOS[0]),
        { ...novoItem(MODULOS[3]) },
        { ...novoItem(MODULOS[2]), largura: 800 },
      ]);
      setAcabamento((a) => ({ ...a, corId: "carvalho", ripada: true }));
    }
    const alvo = Number(params.get("etapa"));
    if (Number.isInteger(alvo) && alvo >= 0 && alvo < ETAPAS.length) setEtapa(alvo);
    // Só na montagem: depois disso quem manda é a navegação do próprio usuário.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orcamento = useMemo(
    () => calculaOrcamento(itens, acabamento, entrega),
    [itens, acabamento, entrega],
  );

  const addModulo = (modulo: Modulo) => setItens((l) => [...l, novoItem(modulo)]);
  const removeItem = (uid: string) => setItens((l) => l.filter((i) => i.uid !== uid));
  const patchItem = (uid: string, patch: Partial<ItemConfig>) =>
    setItens((l) => l.map((i) => (i.uid === uid ? { ...i, ...patch } : i)));

  const podeAvancar = etapa === 1 ? itens.length > 0 : true;

  const identificar = (novo: Lead) => {
    setLead(novo);
    salvaLead(novo);
    enviaLead(novo, identificacao.numero, orcamento.total);
  };

  const carimbo = { ...identificacao, cliente: lead ? primeiroNome(lead.nome) : undefined };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="conteudo">
        <section className="bg-cream border-b border-border">
          <div className="max-w-6xl mx-auto px-6 pt-8 pb-10">
            <Breadcrumbs trail={TRAIL} />
            <p className="mt-8 text-sm uppercase tracking-[0.3em] text-bronze mb-3">
              Orçamento na hora
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-ink leading-[1.1] text-balance max-w-2xl">
              Monte seu móvel e veja o preço sem esperar retorno
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
              Escolha os módulos, informe as medidas do seu espaço e veja o móvel desenhado na tela.
              Para liberar o valor pedimos só seu nome e um contato — a produção é a mesma
              marcenaria, com a linha de acabamento pensada para venda direta.
            </p>
            {!TABELA_CONFIRMADA && (
              <p className="mt-6 inline-flex items-start gap-2 rounded border border-bronze/40 bg-white px-4 py-3 text-sm text-muted-foreground">
                <Info className="w-4 h-4 mt-0.5 text-bronze shrink-0" aria-hidden />
                <span>
                  <strong className="text-ink">Valores em conferência.</strong> O cálculo já usa a
                  tabela de material da M7, mas alguns itens ainda estão sendo fechados — o preço
                  final é confirmado pela equipe antes do pedido.
                </span>
              </p>
            )}
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 py-10">
          <Stepper etapa={etapa} onIr={setEtapa} />

          <div className="mt-10 grid lg:grid-cols-[1fr_320px] gap-10 items-start">
            <div>
              {etapa === 0 && <PassoAmbiente valor={ambiente} onChange={setAmbiente} />}
              {etapa === 1 && (
                <PassoModulos
                  itens={itens}
                  onAdd={addModulo}
                  onRemove={removeItem}
                  acabamento={acabamento}
                  identificacao={carimbo}
                />
              )}
              {etapa === 2 && (
                <PassoMedidas
                  itens={itens}
                  onPatch={patchItem}
                  acabamento={acabamento}
                  identificacao={carimbo}
                />
              )}
              {etapa === 3 && (
                <PassoAcabamento valor={acabamento} onChange={setAcabamento} itens={itens} />
              )}
              {etapa === 4 && (
                <PassoResumo
                  orcamento={orcamento}
                  entrega={entrega}
                  onEntrega={setEntrega}
                  acabamento={acabamento}
                  identificacao={carimbo}
                  lead={lead}
                  onIdentificar={identificar}
                />
              )}
              {etapa === 5 && (
                <PassoPagamento
                  orcamento={orcamento}
                  entrega={entrega}
                  pagamento={pagamento}
                  onPagamento={setPagamento}
                  lead={lead}
                  identificacao={carimbo}
                  onIdentificar={identificar}
                />
              )}

              <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
                <button
                  type="button"
                  onClick={() => setEtapa((e) => Math.max(0, e - 1))}
                  disabled={etapa === 0}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm text-muted-foreground hover:text-ink disabled:opacity-40 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden /> Voltar
                </button>
                {etapa < ETAPAS.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setEtapa((e) => Math.min(ETAPAS.length - 1, e + 1))}
                    disabled={!podeAvancar}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-bronze text-primary-foreground rounded text-sm font-medium hover:bg-bronze-dark disabled:opacity-40 transition-colors"
                  >
                    Continuar <ArrowRight className="w-4 h-4" aria-hidden />
                  </button>
                )}
              </div>
            </div>

            <ResumoLateral orcamento={orcamento} etapa={etapa} lead={lead} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stepper({ etapa, onIr }: { etapa: number; onIr: (n: number) => void }) {
  return (
    <ol className="flex flex-wrap gap-x-2 gap-y-3">
      {ETAPAS.map((nome, i) => {
        const feito = i < etapa;
        const atual = i === etapa;
        return (
          <li key={nome} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onIr(i)}
              aria-current={atual ? "step" : undefined}
              className="flex items-center gap-2 text-sm transition-colors"
            >
              <span
                className={`grid place-items-center w-7 h-7 rounded-full text-xs font-medium border ${
                  atual
                    ? "bg-bronze text-primary-foreground border-bronze"
                    : feito
                      ? "bg-bronze/10 text-bronze border-bronze/30"
                      : "bg-white text-muted-foreground border-border"
                }`}
              >
                {feito ? <Check className="w-3.5 h-3.5" aria-hidden /> : i + 1}
              </span>
              <span className={atual ? "text-ink font-medium" : "text-muted-foreground"}>
                {nome}
              </span>
            </button>
            {i < ETAPAS.length - 1 && (
              <span aria-hidden className="text-border px-1">
                —
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function TituloPasso({ titulo, apoio }: { titulo: string; apoio: string }) {
  return (
    <header className="mb-6">
      <h2 className="text-2xl font-bold text-ink">{titulo}</h2>
      <p className="text-muted-foreground mt-2 leading-relaxed">{apoio}</p>
    </header>
  );
}

function PassoAmbiente({ valor, onChange }: { valor: string; onChange: (v: string) => void }) {
  return (
    <section>
      <TituloPasso
        titulo="Qual ambiente você quer montar?"
        apoio="Começamos pela cozinha, que é onde a maior parte dos pedidos entra. Os outros ambientes entram em seguida."
      />
      <div className="grid sm:grid-cols-2 gap-4">
        {AMBIENTES.map((a) => {
          const ativo = valor === a.id;
          return (
            <button
              key={a.id}
              type="button"
              disabled={!a.ativo}
              onClick={() => onChange(a.id)}
              className={`text-left p-5 rounded border transition-colors ${
                ativo
                  ? "border-bronze bg-bronze/5"
                  : "border-border bg-white hover:border-bronze/50"
              } disabled:opacity-50 disabled:hover:border-border`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-ink">{a.nome}</h3>
                {ativo && <Check className="w-4 h-4 text-bronze" aria-hidden />}
                {!a.ativo && (
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    em breve
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1.5">{a.descricao}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PassoModulos({
  itens,
  onAdd,
  onRemove,
  acabamento,
  identificacao,
}: {
  itens: ItemConfig[];
  onAdd: (m: Modulo) => void;
  onRemove: (uid: string) => void;
  acabamento: Acabamento;
  identificacao: Identificacao;
}) {
  const conta = (id: ModuloId) => itens.filter((i) => i.moduloId === id).length;
  return (
    <section>
      <TituloPasso
        titulo="Escolha os módulos"
        apoio="Cada módulo é uma peça do conjunto. Você monta a cozinha somando as peças, como no projeto da marcenaria."
      />
      <div className="grid sm:grid-cols-2 gap-4">
        {MODULOS.map((m) => {
          const n = conta(m.id);
          return (
            <div
              key={m.id}
              className={`p-5 rounded border bg-white ${n > 0 ? "border-bronze" : "border-border"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-ink">{m.nome}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5">{m.descricao}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    Padrão {m.padrao[0]} × {m.padrao[1]} × {m.padrao[2]} mm
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {n > 0 && (
                    <>
                      <button
                        type="button"
                        aria-label={`Remover um ${m.nome}`}
                        onClick={() => {
                          const ultimo = [...itens].reverse().find((i) => i.moduloId === m.id);
                          if (ultimo) onRemove(ultimo.uid);
                        }}
                        className="grid place-items-center w-8 h-8 rounded border border-border text-muted-foreground hover:border-bronze hover:text-bronze transition-colors"
                      >
                        <Minus className="w-4 h-4" aria-hidden />
                      </button>
                      <span className="w-5 text-center text-sm font-medium text-ink">{n}</span>
                    </>
                  )}
                  <button
                    type="button"
                    aria-label={`Adicionar ${m.nome}`}
                    onClick={() => onAdd(m)}
                    className="grid place-items-center w-8 h-8 rounded bg-bronze text-primary-foreground hover:bg-bronze-dark transition-colors"
                  >
                    <Plus className="w-4 h-4" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <PreviewMovel itens={itens} acabamento={acabamento} {...identificacao} />
      </div>
    </section>
  );
}

function CampoMm({
  label,
  valor,
  onChange,
  faixa,
  compacto = false,
}: {
  label: string;
  valor: number;
  onChange: (v: number) => void;
  faixa?: [number, number];
  /** Versão estreita, usada nos seis campos dos eletrodomésticos. */
  compacto?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="mt-1.5 flex items-center rounded border border-input bg-white focus-within:border-bronze transition-colors">
        <input
          type="number"
          value={valor}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full min-w-0 bg-transparent py-2.5 text-ink outline-none ${
            compacto ? "px-2 text-sm" : "px-3"
          }`}
        />
        <span className={`text-sm text-muted-foreground ${compacto ? "pr-2" : "px-3"}`}>mm</span>
      </span>
      {faixa && (
        <span className="mt-1 block text-xs text-muted-foreground">
          {faixa[0]} a {faixa[1]} mm
        </span>
      )}
    </label>
  );
}

function PassoMedidas({
  itens,
  onPatch,
  acabamento,
  identificacao,
}: {
  itens: ItemConfig[];
  onPatch: (uid: string, patch: Partial<ItemConfig>) => void;
  acabamento: Acabamento;
  identificacao: Identificacao;
}) {
  return (
    <section>
      <TituloPasso
        titulo="Informe as medidas"
        apoio="Meça o vão em três pontos e use a menor medida. O desenho acompanha o que você digita."
      />
      <div className="mb-6">
        <PreviewMovel itens={itens} acabamento={acabamento} {...identificacao} />
      </div>
      <div className="space-y-5">
        {itens.map((item) => {
          const modulo = MODULOS.find((m) => m.id === item.moduloId)!;
          return (
            <div key={item.uid} className="p-5 rounded border border-border bg-white">
              <div className="flex items-center gap-2 mb-4">
                <Ruler className="w-4 h-4 text-bronze" aria-hidden />
                <h3 className="font-semibold text-ink">{modulo.nome}</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <CampoMm
                  label="Largura"
                  valor={item.largura}
                  faixa={modulo.limites.largura}
                  onChange={(v) => onPatch(item.uid, { largura: v })}
                />
                <CampoMm
                  label="Altura"
                  valor={item.altura}
                  faixa={modulo.limites.altura}
                  onChange={(v) => onPatch(item.uid, { altura: v })}
                />
                <CampoMm
                  label="Profundidade"
                  valor={item.profundidade}
                  faixa={modulo.limites.profundidade}
                  onChange={(v) => onPatch(item.uid, { profundidade: v })}
                />
              </div>

              <ForaDaFaixa item={item} modulo={modulo} />

              {modulo.eletros && item.forno && item.micro && (
                <div className="mt-6 pt-5 border-t border-border">
                  <p className="text-sm text-ink font-medium">Medidas dos seus eletrodomésticos</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Estão na etiqueta ou no manual. O nicho sai com 1 cm de folga em cada lado.
                  </p>
                  <div className="mt-4 grid sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-bronze mb-3">Forno</p>
                      <div className="grid grid-cols-3 gap-2">
                        <CampoMm
                          compacto
                          label="Larg."
                          valor={item.forno.largura}
                          onChange={(v) =>
                            onPatch(item.uid, { forno: { ...item.forno!, largura: v } })
                          }
                        />
                        <CampoMm
                          compacto
                          label="Alt."
                          valor={item.forno.altura}
                          onChange={(v) =>
                            onPatch(item.uid, { forno: { ...item.forno!, altura: v } })
                          }
                        />
                        <CampoMm
                          compacto
                          label="Prof."
                          valor={item.forno.profundidade}
                          onChange={(v) =>
                            onPatch(item.uid, { forno: { ...item.forno!, profundidade: v } })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-bronze mb-3">
                        Micro-ondas
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <CampoMm
                          compacto
                          label="Larg."
                          valor={item.micro.largura}
                          onChange={(v) =>
                            onPatch(item.uid, { micro: { ...item.micro!, largura: v } })
                          }
                        />
                        <CampoMm
                          compacto
                          label="Alt."
                          valor={item.micro.altura}
                          onChange={(v) =>
                            onPatch(item.uid, { micro: { ...item.micro!, altura: v } })
                          }
                        />
                        <CampoMm
                          compacto
                          label="Prof."
                          valor={item.micro.profundidade}
                          onChange={(v) =>
                            onPatch(item.uid, { micro: { ...item.micro!, profundidade: v } })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Nicho do forno:{" "}
                    <strong className="text-ink">
                      {item.forno.largura + 20} × {item.forno.altura + 20} mm
                    </strong>{" "}
                    · Nicho do micro-ondas:{" "}
                    <strong className="text-ink">
                      {item.micro.largura + 20} × {item.micro.altura + 20} mm
                    </strong>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Aviso na hora, na etapa em que a medida é digitada.
 *
 * Antes o alerta só aparecia lá no resumo: a pessoa digitava uma torre de
 * 700 mm, seguia adiante e só descobria o problema três telas depois. Como o
 * campo é livre de propósito (dá para apagar e redigitar), o aviso precisa
 * estar ao lado do campo.
 */
function ForaDaFaixa({ item, modulo }: { item: ItemConfig; modulo: Modulo }) {
  const problemas: string[] = [];
  const checa = (valor: number, [min, max]: [number, number], nome: string) => {
    if (!valor) problemas.push(`Informe a ${nome.toLowerCase()}.`);
    else if (valor < min || valor > max) {
      problemas.push(`${nome} aceita de ${min} a ${max} mm neste módulo.`);
    }
  };
  checa(item.largura, modulo.limites.largura, "Largura");
  checa(item.altura, modulo.limites.altura, "Altura");
  checa(item.profundidade, modulo.limites.profundidade, "Profundidade");

  if (modulo.eletros && item.forno && item.micro) {
    const precisa = item.forno.altura + item.micro.altura + 40 + 100;
    if (item.altura && item.altura < precisa) {
      problemas.push(
        `Com esse forno e esse micro-ondas, a torre precisa de pelo menos ${precisa} mm de altura.`,
      );
    }
  }

  if (problemas.length === 0) return null;
  return (
    <ul className="mt-4 space-y-1">
      {problemas.map((p) => (
        <li key={p} className="text-sm text-destructive">
          {p}
        </li>
      ))}
    </ul>
  );
}

function PassoAcabamento({
  valor,
  onChange,
  itens,
}: {
  valor: Acabamento;
  onChange: (a: Acabamento) => void;
  itens: ItemConfig[];
}) {
  const comGaveta = itens.filter((i) => MODULOS.find((m) => m.id === i.moduloId)?.gavetas);
  return (
    <section>
      <TituloPasso
        titulo="Acabamento e ferragem"
        apoio="A linha do site trabalha com chapa de padrão mais simples que a da marcenaria sob medida — é o que mantém o preço de venda direta."
      />

      <p className="text-sm font-medium text-ink mb-3">Cor da chapa</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CORES.map((c) => {
          const ativo = valor.corId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange({ ...valor, corId: c.id })}
              className={`p-3 rounded border text-left transition-colors ${
                ativo
                  ? "border-bronze bg-bronze/5"
                  : "border-border bg-white hover:border-bronze/50"
              }`}
            >
              <span
                className="block h-14 w-full rounded-sm border border-black/10"
                style={{ backgroundColor: c.hex }}
                aria-hidden
              />
              <span className="mt-2.5 block text-sm text-ink">{c.nome}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <div className="p-5 rounded border border-border bg-white">
          <p className="text-sm font-medium text-ink">Como o móvel é montado</p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li>Caixa, prateleiras e gavetas em MDF 15 mm branco</li>
            <li>Fundo em MDF 6 mm</li>
            <li>Frentes na cor escolhida, com fita de borda no mesmo tom</li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            A cor entra onde aparece. O interior é branco em todas as opções — é o que mantém o
            preço da linha do site.
          </p>
        </div>

        <div className="p-5 rounded border border-border bg-white space-y-4">
          <Opcao
            titulo="Porta ripada"
            apoio="As ripas saem da mesma chapa, então a frente consome o dobro de material."
            ativo={valor.ripada}
            onToggle={() => onChange({ ...valor, ripada: !valor.ripada })}
          />
          <Opcao
            titulo="Puxador perfil"
            apoio="Sem puxador, a abertura fica por cava usinada na própria porta."
            ativo={valor.puxador}
            onToggle={() => onChange({ ...valor, puxador: !valor.puxador })}
          />
        </div>
      </div>

      {comGaveta.length > 0 && (
        <div className="mt-6 p-5 rounded border border-bronze/40 bg-bronze/5">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 text-bronze shrink-0" aria-hidden />
            <div>
              <p className="text-sm font-medium text-ink">Gavetas com corrediça oculta</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Todas as gavetas saem com corrediça oculta e amortecimento, independente do tamanho
                — {comGaveta.length}{" "}
                {comGaveta.length === 1 ? "módulo com gaveta" : "módulos com gaveta"} neste
                orçamento.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Opcao({
  titulo,
  apoio,
  ativo,
  onToggle,
}: {
  titulo: string;
  apoio: string;
  ativo: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={ativo}
      className="flex w-full items-start gap-3 text-left"
    >
      <span
        className={`mt-0.5 grid place-items-center w-5 h-5 rounded border shrink-0 transition-colors ${
          ativo ? "bg-bronze border-bronze text-primary-foreground" : "border-border bg-white"
        }`}
      >
        {ativo && <Check className="w-3.5 h-3.5" aria-hidden />}
      </span>
      <span>
        <span className="block text-sm font-medium text-ink">{titulo}</span>
        <span className="block text-sm text-muted-foreground">{apoio}</span>
      </span>
    </button>
  );
}

/**
 * O que o módulo tem, dito como o cliente fala.
 *
 * A composição técnica (metro quadrado de chapa, metro de fita, quantidade de
 * dobradiça) saiu da tela de propósito: aberta daquele jeito ela é quase uma
 * lista de corte pronta, e um print bastaria para um concorrente refazer o
 * orçamento sem ter dimensionado nada. O detalhamento continua existindo — vai
 * no PDF, depois do pedido fechado.
 */
function descreve(calc: ReturnType<typeof calculaOrcamento>["itens"][number], acab: Acabamento) {
  const { modulo } = calc;
  const partes: string[] = [];
  if (modulo.eletros) partes.push("nichos para forno e micro-ondas nas suas medidas");
  if (modulo.portas > 0) {
    partes.push(
      `${modulo.portas} ${modulo.portas === 1 ? "porta" : "portas"}${acab.ripada ? " ripadas" : ""}`,
    );
  }
  if (modulo.gavetas > 0) {
    partes.push(`${modulo.gavetas} gavetas com corrediça oculta`);
  }
  if (modulo.prateleiras > 0) {
    partes.push(`${modulo.prateleiras} ${modulo.prateleiras === 1 ? "prateleira" : "prateleiras"}`);
  }
  partes.push("interior em MDF 15 mm branco");
  const texto = partes.join(" · ");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Valor que só aparece depois da identificação.
 *
 * O número continua sendo calculado no navegador — quem abrir as ferramentas
 * do desenvolvedor chega nele. Isso aqui é porteira comercial, não cofre: a
 * função é trocar o valor pelo contato de quem está comprando, não esconder
 * segredo. Blindagem real exigiria calcular o preço no servidor, o que só faz
 * sentido quando a tabela verdadeira entrar.
 */
function Valor({
  valor,
  liberado,
  className = "",
}: {
  valor: string;
  liberado: boolean;
  className?: string;
}) {
  if (liberado) return <span className={className}>{valor}</span>;
  return (
    <span className={className}>
      <span aria-hidden className="select-none blur-[6px]">
        {valor}
      </span>
      <span className="sr-only">Valor disponível após informar seu contato</span>
    </span>
  );
}

/**
 * A troca: o desenho e a composição são livres, o valor pede nome e contato.
 *
 * Sem isso, alguém monta a cozinha inteira, tira um print do preço e some — e
 * a M7 nunca fica sabendo que essa pessoa existiu. Com o contato na mão, o
 * orçamento vira atendimento mesmo quando a pessoa sai para pesquisar.
 */
function PortaoDeContato({
  onIdentificar,
  titulo = "Veja o valor do seu orçamento",
}: {
  onIdentificar: (lead: Lead) => void;
  titulo?: string;
}) {
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [tentou, setTentou] = useState(false);

  const nomeOk = nomeValido(nome);
  const contatoOk = contatoValido(contato);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    setTentou(true);
    if (nomeOk && contatoOk) onIdentificar({ nome: nome.trim(), contato: contato.trim() });
  };

  return (
    <form onSubmit={enviar} className="rounded border border-bronze bg-cream p-6">
      <h3 className="text-lg font-semibold text-ink">{titulo}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xl">
        Seu orçamento está pronto. Informe como falar com você e o valor aparece na hora — junto com
        o desenho e o resumo do que você montou.
      </p>

      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Seu nome</span>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoComplete="name"
            placeholder="Como podemos te chamar"
            className="mt-1.5 w-full rounded border border-input bg-white px-3 py-2.5 text-ink outline-none focus:border-bronze"
          />
          {tentou && !nomeOk && (
            <span className="mt-1 block text-sm text-destructive">Informe seu nome.</span>
          )}
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            WhatsApp ou e-mail
          </span>
          <input
            type="text"
            value={contato}
            onChange={(e) => setContato(e.target.value)}
            autoComplete="tel"
            inputMode="text"
            placeholder="(41) 90000-0000"
            className="mt-1.5 w-full rounded border border-input bg-white px-3 py-2.5 text-ink outline-none focus:border-bronze"
          />
          {tentou && !contatoOk && (
            <span className="mt-1 block text-sm text-destructive">
              Informe um WhatsApp com DDD ou um e-mail válido.
            </span>
          )}
        </label>
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex items-center gap-2 px-7 py-3 bg-bronze text-primary-foreground rounded text-sm font-medium hover:bg-bronze-dark transition-colors"
      >
        Ver meu orçamento <ArrowRight className="w-4 h-4" aria-hidden />
      </button>

      <p className="mt-4 text-xs text-muted-foreground leading-relaxed max-w-xl">
        Usamos seu contato apenas para falar sobre este orçamento. Nada de lista de disparo — veja a{" "}
        <Link to="/politica-de-privacidade" className="underline hover:text-bronze">
          política de privacidade
        </Link>
        .
      </p>
    </form>
  );
}

function PassoResumo({
  orcamento,
  entrega,
  onEntrega,
  acabamento,
  identificacao,
  lead,
  onIdentificar,
}: {
  orcamento: ReturnType<typeof calculaOrcamento>;
  entrega: Entrega;
  onEntrega: (e: Entrega) => void;
  acabamento: Acabamento;
  identificacao: Identificacao;
  lead: Lead | null;
  onIdentificar: (lead: Lead) => void;
}) {
  const cor = CORES.find((c) => c.id === acabamento.corId)!;
  const liberado = lead !== null;
  return (
    <section>
      <TituloPasso
        titulo="Seu orçamento"
        apoio="O conjunto desenhado em escala e o valor de cada peça. A composição completa de chapa, fita e ferragem vai no PDF junto com a confirmação do pedido."
      />

      <div className="mb-6">
        <PreviewMovel
          itens={orcamento.itens.map((c) => c.item)}
          acabamento={acabamento}
          {...identificacao}
        />
      </div>

      {!liberado && orcamento.itens.length > 0 && (
        <div className="mb-6">
          <PortaoDeContato onIdentificar={onIdentificar} />
        </div>
      )}

      <div className="space-y-4">
        {orcamento.itens.map((calc) => (
          <div
            key={calc.item.uid}
            className="flex items-start justify-between gap-4 rounded border border-border bg-white p-5"
          >
            <div>
              <h3 className="font-semibold text-ink">
                {calc.modulo.nome}
                {calc.item.quantidade > 1 && ` × ${calc.item.quantidade}`}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {calc.item.largura} × {calc.item.altura} × {calc.item.profundidade} mm · {cor.nome}
              </p>
              <p className="text-sm text-muted-foreground mt-2">{descreve(calc, acabamento)}</p>
              {calc.avisos.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {calc.avisos.map((a) => (
                    <li key={a} className="text-sm text-destructive">
                      {a}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Valor
              valor={brl(calc.preco)}
              liberado={liberado}
              className="text-lg font-semibold text-ink shrink-0"
            />
          </div>
        ))}
      </div>

      {identificacao.numero && (
        <p className="mt-4 text-xs text-muted-foreground">
          Simulação {identificacao.numero} · válida até {identificacao.validade}. O preço é
          confirmado com a conferência das medidas; cópia ou print não vale como proposta comercial.
        </p>
      )}

      <div className="mt-8">
        <p className="text-sm font-medium text-ink mb-3">Entrega e montagem</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onEntrega("local")}
            className={`p-5 rounded border text-left transition-colors ${
              entrega === "local" ? "border-bronze bg-bronze/5" : "border-border bg-white"
            }`}
          >
            <span className="flex items-center gap-2 font-medium text-ink">
              <Truck className="w-4 h-4 text-bronze" aria-hidden /> Curitiba e região
            </span>
            <span className="mt-1.5 block text-sm text-muted-foreground">
              Entrega e montagem pela nossa equipe, já inclusas no valor.
            </span>
          </button>
          <button
            type="button"
            onClick={() => onEntrega("distante")}
            className={`p-5 rounded border text-left transition-colors ${
              entrega === "distante" ? "border-bronze bg-bronze/5" : "border-border bg-white"
            }`}
          >
            <span className="flex items-center gap-2 font-medium text-ink">
              <Truck className="w-4 h-4 text-bronze" aria-hidden /> Outras cidades e estados
            </span>
            <span className="mt-1.5 block text-sm text-muted-foreground">
              Frete cotado por transportadora. A montagem fica por conta do cliente — indicamos
              montadores parceiros da região.
            </span>
          </button>
        </div>
      </div>

      <FaleComArquiteto lead={lead} identificacao={identificacao} />
    </section>
  );
}

/**
 * A saída para quem não fecha sozinho: valor acima do previsto, ou pessoa sem
 * projeto e sem medida. Em vez de perder a visita, o simulador vira porta de
 * entrada para o atendimento com os arquitetos parceiros.
 */
function FaleComArquiteto({
  lead,
  identificacao,
}: {
  lead: Lead | null;
  identificacao: Identificacao;
}) {
  return (
    <div className="mt-8 p-6 rounded border border-border bg-cream">
      <h3 className="font-semibold text-ink">Ficou acima do que você esperava?</h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xl">
        Ou você ainda não tem projeto e está na dúvida do que cabe no espaço? Nossa equipe desenha o
        ambiente com os arquitetos parceiros da M7 e volta com uma proposta ajustada ao seu
        orçamento.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={whatsappLink(
            [
              "Olá M7 Movelaria, montei um orçamento no site e gostaria de falar com a equipe.",
              identificacao.numero ? `Orçamento ${identificacao.numero}.` : "",
              lead ? `Meu nome é ${lead.nome}.` : "",
            ]
              .filter(Boolean)
              .join(" "),
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-bronze text-primary-foreground rounded text-sm font-medium hover:bg-bronze-dark transition-colors"
        >
          <MessageCircle className="w-4 h-4" aria-hidden /> Falar com a equipe
        </a>
        <Link
          to="/projetos"
          className="inline-flex items-center gap-2 px-6 py-3 border border-bronze text-bronze rounded text-sm font-medium hover:bg-bronze hover:text-primary-foreground transition-colors"
        >
          Ver projetos executados
        </Link>
      </div>
    </div>
  );
}

function PassoPagamento({
  orcamento,
  entrega,
  pagamento,
  onPagamento,
  lead,
  identificacao,
  onIdentificar,
}: {
  orcamento: ReturnType<typeof calculaOrcamento>;
  entrega: Entrega;
  pagamento: "pix" | "credito";
  onPagamento: (p: "pix" | "credito") => void;
  lead: Lead | null;
  identificacao: Identificacao;
  onIdentificar: (lead: Lead) => void;
}) {
  // Sem identificação não há para quem emitir o pedido: o portão vem antes.
  if (!lead) {
    return (
      <section>
        <TituloPasso
          titulo="Pagamento"
          apoio="Falta só saber com quem estamos falando para fechar o pedido."
        />
        <PortaoDeContato
          onIdentificar={onIdentificar}
          titulo="Informe seu contato para fechar o pedido"
        />
      </section>
    );
  }

  return (
    <section>
      <TituloPasso
        titulo="Pagamento"
        apoio="Pix à vista com desconto ou cartão de crédito parcelado. A produção entra na fila assim que o pagamento é confirmado."
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onPagamento("pix")}
          className={`p-6 rounded border text-left transition-colors ${
            pagamento === "pix" ? "border-bronze bg-bronze/5" : "border-border bg-white"
          }`}
        >
          <span className="flex items-center gap-2 font-medium text-ink">
            <QrCode className="w-4 h-4 text-bronze" aria-hidden /> Pix à vista
          </span>
          <span className="mt-3 block text-2xl font-bold text-ink">{brl(orcamento.totalPix)}</span>
          <span className="mt-1 block text-sm text-bronze">5% de desconto</span>
        </button>
        <button
          type="button"
          onClick={() => onPagamento("credito")}
          className={`p-6 rounded border text-left transition-colors ${
            pagamento === "credito" ? "border-bronze bg-bronze/5" : "border-border bg-white"
          }`}
        >
          <span className="flex items-center gap-2 font-medium text-ink">
            <CreditCard className="w-4 h-4 text-bronze" aria-hidden /> Cartão de crédito
          </span>
          <span className="mt-3 block text-2xl font-bold text-ink">
            {orcamento.parcelas}× {brl(orcamento.parcela)}
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Total {brl(orcamento.total)}
          </span>
        </button>
      </div>

      <div className="mt-6 p-5 rounded border border-border bg-white">
        <h3 className="font-semibold text-ink">Antes de finalizar</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            As medidas informadas são de responsabilidade do cliente — a produção segue exatamente o
            que está no pedido.
          </li>
          <li>
            {entrega === "local"
              ? "Entrega e montagem em Curitiba e região inclusas no valor."
              : "Fora de Curitiba, o frete é cotado por transportadora e a montagem fica por conta do cliente. Indicamos montadores parceiros da sua região."}
          </li>
          <li>O prazo de produção é confirmado por escrito na confirmação do pedido.</li>
        </ul>
      </div>

      <a
        href={whatsappLink(
          mensagemDoPedido({ orcamento, lead, identificacao, pagamento, entrega }),
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 w-full inline-flex items-center justify-center gap-2 px-7 py-4 bg-bronze text-primary-foreground rounded font-medium hover:bg-bronze-dark transition-colors"
      >
        <MessageCircle className="w-4 h-4" aria-hidden /> Enviar pedido —{" "}
        {pagamento === "pix" ? brl(orcamento.totalPix) : brl(orcamento.total)}
      </a>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        O pedido chega à equipe com tudo que você montou. A confirmação e a chave de pagamento
        voltam por ali mesmo.
      </p>
    </section>
  );
}

/**
 * O pedido fechado, escrito para chegar no WhatsApp da M7.
 *
 * É a ponte enquanto a integração de pagamento não existe: o pedido sai da
 * tela com medida, acabamento, forma de pagamento escolhida e o código da
 * simulação, e chega em alguém que pode responder. Quando o gateway entrar,
 * este botão passa a abrir o checkout e a mensagem vira a confirmação.
 */
function mensagemDoPedido({
  orcamento,
  lead,
  identificacao,
  pagamento,
  entrega,
}: {
  orcamento: ReturnType<typeof calculaOrcamento>;
  lead: Lead;
  identificacao: Identificacao;
  pagamento: "pix" | "credito";
  entrega: Entrega;
}) {
  const itens = orcamento.itens.map(
    (c) =>
      `• ${c.modulo.nome} — ${c.item.largura} × ${c.item.altura} × ${c.item.profundidade} mm — ${brl(c.preco)}`,
  );
  return [
    `Olá M7 Movelaria! Fechei um orçamento pelo site.`,
    ``,
    `Orçamento ${identificacao.numero || "(sem código)"}`,
    `Nome: ${lead.nome}`,
    `Contato: ${lead.contato}`,
    ``,
    ...itens,
    ``,
    `Entrega: ${entrega === "local" ? "Curitiba e região, com montagem" : "outra cidade — frete a cotar, montagem por minha conta"}`,
    `Pagamento: ${pagamento === "pix" ? `Pix à vista — ${brl(orcamento.totalPix)}` : `Cartão em ${orcamento.parcelas}× de ${brl(orcamento.parcela)}`}`,
    `Total: ${brl(orcamento.total)}`,
  ].join("\n");
}

function ResumoLateral({
  orcamento,
  etapa,
  lead,
}: {
  orcamento: ReturnType<typeof calculaOrcamento>;
  etapa: number;
  lead: Lead | null;
}) {
  const liberado = lead !== null;
  return (
    <aside className="lg:sticky lg:top-24 p-6 rounded border border-border bg-white">
      <h2 className="text-sm uppercase tracking-[0.2em] text-bronze">Seu orçamento</h2>
      {orcamento.itens.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Os valores aparecem aqui conforme você adiciona os módulos.
        </p>
      ) : (
        <>
          <ul className="mt-4 space-y-2.5">
            {orcamento.itens.map((c) => (
              <li key={c.item.uid} className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  {c.modulo.nome}
                  {c.item.quantidade > 1 && ` × ${c.item.quantidade}`}
                </span>
                <Valor
                  valor={brl(c.preco)}
                  liberado={liberado}
                  className="text-ink tabular-nums shrink-0"
                />
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Móveis</span>
              <Valor
                valor={brl(orcamento.subtotal)}
                liberado={liberado}
                className="text-ink tabular-nums"
              />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrega e montagem</span>
              <Valor
                valor={orcamento.freteSobConsulta ? "sob cotação" : brl(orcamento.entrega)}
                liberado={liberado || orcamento.freteSobConsulta}
                className="text-ink tabular-nums"
              />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-baseline justify-between">
            <span className="font-medium text-ink">Total</span>
            <Valor
              valor={brl(orcamento.total)}
              liberado={liberado}
              className="text-2xl font-bold text-ink tabular-nums"
            />
          </div>
          {liberado ? (
            <p className="mt-2 text-sm text-muted-foreground">
              ou {orcamento.parcelas}× de {brl(orcamento.parcela)} no cartão
            </p>
          ) : (
            <p className="mt-3 text-sm text-bronze">
              Informe seu contato na etapa do resumo para ver o valor.
            </p>
          )}
        </>
      )}
      {etapa < 5 && orcamento.itens.length > 0 && liberado && (
        <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
          O valor se ajusta sozinho a cada medida e acabamento que você muda.
        </p>
      )}
    </aside>
  );
}
