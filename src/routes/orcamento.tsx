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
import { whatsappLink } from "@/lib/whatsapp";
import { pageSeo } from "@/lib/seo";
import { CORES, MODULOS, TABELA_CONFIRMADA, type Modulo, type ModuloId } from "@/data/precos";
import {
  brl,
  brlExato,
  calculaOrcamento,
  corredicaPara,
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
    lateral: 15,
    ripada: false,
    puxador: true,
  });
  const [entrega, setEntrega] = useState<Entrega>("local");
  const [pagamento, setPagamento] = useState<"pix" | "credito">("pix");

  /**
   * `?etapa=4&demo=cozinha` abre o simulador já num passo, com um carrinho de
   * exemplo. Serve para mandar o link de uma tela específica para o cliente (e
   * para gerar as imagens da proposta) sem ter que refazer o preenchimento.
   */
  useEffect(() => {
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
              Escolha os módulos, informe as medidas do seu espaço e feche o pedido pelo site. A
              produção é a mesma marcenaria — com a linha de acabamento pensada para venda direta.
            </p>
            {!TABELA_CONFIRMADA && (
              <p className="mt-6 inline-flex items-start gap-2 rounded border border-bronze/40 bg-white px-4 py-3 text-sm text-muted-foreground">
                <Info className="w-4 h-4 mt-0.5 text-bronze shrink-0" aria-hidden />
                <span>
                  <strong className="text-ink">Simulação de demonstração.</strong> Os valores desta
                  página são ilustrativos, para validar o fluxo — a tabela de preço definitiva da M7
                  entra antes de abrir ao público.
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
                <PassoModulos itens={itens} onAdd={addModulo} onRemove={removeItem} />
              )}
              {etapa === 2 && <PassoMedidas itens={itens} onPatch={patchItem} />}
              {etapa === 3 && (
                <PassoAcabamento valor={acabamento} onChange={setAcabamento} itens={itens} />
              )}
              {etapa === 4 && (
                <PassoResumo
                  orcamento={orcamento}
                  entrega={entrega}
                  onEntrega={setEntrega}
                  acabamento={acabamento}
                />
              )}
              {etapa === 5 && (
                <PassoPagamento
                  orcamento={orcamento}
                  entrega={entrega}
                  pagamento={pagamento}
                  onPagamento={setPagamento}
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

            <ResumoLateral orcamento={orcamento} etapa={etapa} />
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
}: {
  itens: ItemConfig[];
  onAdd: (m: Modulo) => void;
  onRemove: (uid: string) => void;
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
      {itens.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          Adicione ao menos um módulo para continuar.
        </p>
      )}
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
}: {
  itens: ItemConfig[];
  onPatch: (uid: string, patch: Partial<ItemConfig>) => void;
}) {
  return (
    <section>
      <TituloPasso
        titulo="Informe as medidas"
        apoio="Meça o vão em três pontos e use a menor medida. Na torre quente, as medidas do forno e do micro-ondas definem o nicho."
      />
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
          <p className="text-sm font-medium text-ink">Espessura da lateral</p>
          <p className="text-sm text-muted-foreground mt-1">
            Fundo 6 mm e porta 18 mm são fixos da linha.
          </p>
          <div className="mt-4 flex gap-2">
            {([15, 18] as const).map((mm) => (
              <button
                key={mm}
                type="button"
                onClick={() => onChange({ ...valor, lateral: mm })}
                className={`px-4 py-2 rounded text-sm border transition-colors ${
                  valor.lateral === mm
                    ? "bg-bronze text-primary-foreground border-bronze"
                    : "border-border text-muted-foreground hover:border-bronze"
                }`}
              >
                {mm} mm
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 rounded border border-border bg-white space-y-4">
          <Opcao
            titulo="Porta ripada"
            apoio="Usinagem em ripas na frente, cobrada por m² de porta."
            ativo={valor.ripada}
            onToggle={() => onChange({ ...valor, ripada: !valor.ripada })}
          />
          <Opcao
            titulo="Puxador perfil"
            apoio="Sem puxador, a abertura fica por cava usinada."
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
              <p className="text-sm font-medium text-ink">Corrediça escolhida pela carga</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {comGaveta.map((i) => {
                  const c = corredicaPara(i.largura, i.profundidade);
                  return (
                    <li key={i.uid}>
                      {MODULOS.find((m) => m.id === i.moduloId)!.nome} de {i.largura} mm →{" "}
                      <strong className="text-ink">{c.nome}</strong>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-sm text-muted-foreground">
                Gaveta larga e funda pesa mais, então sobe de faixa automaticamente — o orçamento já
                sai com a corrediça que aguenta.
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

function PassoResumo({
  orcamento,
  entrega,
  onEntrega,
  acabamento,
}: {
  orcamento: ReturnType<typeof calculaOrcamento>;
  entrega: Entrega;
  onEntrega: (e: Entrega) => void;
  acabamento: Acabamento;
}) {
  const cor = CORES.find((c) => c.id === acabamento.corId)!;
  return (
    <section>
      <TituloPasso
        titulo="Seu orçamento"
        apoio="Cada módulo com a composição aberta: chapa, fita, ferragem e insumo. É a mesma conta que a marcenaria faz na planilha."
      />

      <div className="space-y-4">
        {orcamento.itens.map((calc) => (
          <details key={calc.item.uid} className="rounded border border-border bg-white">
            <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none">
              <div>
                <h3 className="font-semibold text-ink">
                  {calc.modulo.nome}
                  {calc.item.quantidade > 1 && ` × ${calc.item.quantidade}`}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {calc.item.largura} × {calc.item.altura} × {calc.item.profundidade} mm ·{" "}
                  {cor.nome}
                </p>
              </div>
              <span className="text-lg font-semibold text-ink shrink-0">{brl(calc.preco)}</span>
            </summary>
            <div className="border-t border-border px-5 py-4">
              <table className="w-full text-sm">
                <tbody>
                  {calc.linhas.map((l) => (
                    <tr key={l.descricao} className="border-b border-border/60 last:border-0">
                      <td className="py-2 pr-4 text-ink">{l.descricao}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{l.detalhe}</td>
                      <td className="py-2 text-right text-muted-foreground tabular-nums">
                        {brlExato(l.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {calc.avisos.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {calc.avisos.map((a) => (
                    <li key={a} className="text-sm text-destructive">
                      {a}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </details>
        ))}
      </div>

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

      <FaleComArquiteto />
    </section>
  );
}

/**
 * A saída para quem não fecha sozinho: valor acima do previsto, ou pessoa sem
 * projeto e sem medida. Em vez de perder a visita, o simulador vira porta de
 * entrada para o atendimento com os arquitetos parceiros.
 */
function FaleComArquiteto() {
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
            "Olá M7 Movelaria, montei um orçamento no site e gostaria de falar com a equipe.",
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
}: {
  orcamento: ReturnType<typeof calculaOrcamento>;
  entrega: Entrega;
  pagamento: "pix" | "credito";
  onPagamento: (p: "pix" | "credito") => void;
}) {
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

      <button
        type="button"
        className="mt-6 w-full inline-flex items-center justify-center gap-2 px-7 py-4 bg-bronze text-primary-foreground rounded font-medium hover:bg-bronze-dark transition-colors"
      >
        Finalizar pedido — {pagamento === "pix" ? brl(orcamento.totalPix) : brl(orcamento.total)}
      </button>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Você recebe o orçamento completo em PDF por e-mail e no WhatsApp.
      </p>
    </section>
  );
}

function ResumoLateral({
  orcamento,
  etapa,
}: {
  orcamento: ReturnType<typeof calculaOrcamento>;
  etapa: number;
}) {
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
                <span className="text-ink tabular-nums shrink-0">{brl(c.preco)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Móveis</span>
              <span className="text-ink tabular-nums">{brl(orcamento.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrega e montagem</span>
              <span className="text-ink tabular-nums">
                {orcamento.freteSobConsulta ? "sob cotação" : brl(orcamento.entrega)}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-baseline justify-between">
            <span className="font-medium text-ink">Total</span>
            <span className="text-2xl font-bold text-ink tabular-nums">{brl(orcamento.total)}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            ou {orcamento.parcelas}× de {brl(orcamento.parcela)} no cartão
          </p>
        </>
      )}
      {etapa < 5 && orcamento.itens.length > 0 && (
        <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
          O valor se ajusta sozinho a cada medida e acabamento que você muda.
        </p>
      )}
    </aside>
  );
}
