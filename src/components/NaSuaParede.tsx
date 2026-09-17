import { useEffect, useRef, useState } from "react";
import { Camera, Download, ImagePlus, X } from "lucide-react";
import { CenaMoveis, medidasDaCena } from "@/components/PreviewMovel";
import type { Acabamento, ItemConfig } from "@/lib/orcamento";

/**
 * "Veja na sua parede": a pessoa tira (ou escolhe) uma foto da parede vazia,
 * marca as duas pontas da parede e a linha do piso, informa a largura real,
 * e o desenho do conjunto entra sobre a foto em escala.
 *
 * Decisões:
 *  - A foto NUNCA sai do aparelho. Vira um object URL, é desenhada num
 *    <svg> e descartada quando a pessoa troca ou sai. Nada vai para o
 *    servidor nem para o lead — é a foto da casa de alguém.
 *  - Tudo é feito num único <svg> com o viewBox no tamanho natural da foto:
 *    marcadores, foto e móvel compartilham o mesmo sistema de coordenadas, o
 *    arrasto converte o ponteiro com getScreenCTM() e o resultado escala com
 *    a largura da tela sem conta nenhuma em px.
 *  - É referência de proporção, não projeto: foto tem perspectiva, e a página
 *    diz isso. A medição continua sendo feita pela M7 no local.
 *  - O download sai com a mesma marca d'água do desenho: é o print que mais
 *    vale levar para outra marcenaria.
 */

type Marcadores = { xEsq: number; xDir: number; yPiso: number };
type Alca = keyof Marcadores;

const LARGURA_PADRAO_MM = 3000;

export function NaSuaParede({
  itens,
  acabamento,
  numero,
  cliente,
}: {
  itens: ItemConfig[];
  acabamento: Acabamento;
  numero?: string;
  cliente?: string;
}) {
  const [foto, setFoto] = useState<{ url: string; w: number; h: number } | null>(null);
  const [marc, setMarc] = useState<Marcadores>({ xEsq: 0, xDir: 0, yPiso: 0 });
  const [larguraParede, setLarguraParede] = useState(LARGURA_PADRAO_MM);
  const [posicao, setPosicao] = useState(0.5);
  const [transparente, setTransparente] = useState(false);
  const [arrastando, setArrastando] = useState<Alca | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const cenaRef = useRef<SVGSVGElement>(null);
  const inputGaleria = useRef<HTMLInputElement>(null);
  const inputCamera = useRef<HTMLInputElement>(null);

  // Libera o object URL quando a foto muda ou o componente sai de cena.
  useEffect(() => () => void (foto && URL.revokeObjectURL(foto.url)), [foto]);

  const carregar = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      // A URL anterior é liberada pelo cleanup do useEffect acima.
      setFoto({ url, w, h });
      setMarc({ xEsq: w * 0.12, xDir: w * 0.88, yPiso: h * 0.82 });
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  };

  const limpar = () => {
    setFoto(null);
    if (inputGaleria.current) inputGaleria.current.value = "";
    if (inputCamera.current) inputCamera.current.value = "";
  };

  /** Ponteiro (px da tela) → coordenadas do viewBox (px da foto). */
  const paraFoto = (e: React.PointerEvent) => {
    const svg = svgRef.current!;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM()!.inverse());
    return pt;
  };

  const onMove = (e: React.PointerEvent) => {
    if (!arrastando || !foto) return;
    const pt = paraFoto(e);
    const x = Math.min(foto.w, Math.max(0, pt.x));
    const y = Math.min(foto.h, Math.max(0, pt.y));
    setMarc((m) => {
      if (arrastando === "yPiso") return { ...m, yPiso: y };
      if (arrastando === "xEsq") return { ...m, xEsq: Math.min(x, m.xDir - 20) };
      return { ...m, xDir: Math.max(x, m.xEsq + 20) };
    });
  };

  const { larguraCena, alturaCena } = medidasDaCena(itens);
  const pxPorMm = foto && larguraParede > 0 ? (marc.xDir - marc.xEsq) / larguraParede : 0;
  const sobra = larguraParede - larguraCena;
  const naoCabe = sobra < 0;
  const cenaW = larguraCena * pxPorMm;
  const cenaH = alturaCena * pxPorMm;
  const cenaX = marc.xEsq + Math.max(0, sobra) * posicao * pxPorMm;
  const cenaY = marc.yPiso - cenaH;

  const baixar = async () => {
    if (!foto || !cenaRef.current) return;
    const escala = Math.min(1, 1600 / foto.w);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(foto.w * escala);
    canvas.height = Math.round(foto.h * escala) + 44;
    const ctx = canvas.getContext("2d")!;
    const base = new Image();
    base.src = foto.url;
    await base.decode();
    ctx.drawImage(base, 0, 0, canvas.width, Math.round(foto.h * escala));

    // A cena vira uma imagem à parte, no tamanho em que aparece na foto.
    const clone = cenaRef.current.cloneNode(true) as SVGSVGElement;
    clone.removeAttribute("x");
    clone.removeAttribute("y");
    clone.setAttribute("width", String(Math.max(1, Math.round(cenaW * escala))));
    clone.setAttribute("height", String(Math.max(1, Math.round(cenaH * escala))));
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const blob = new Blob([new XMLSerializer().serializeToString(clone)], {
      type: "image/svg+xml",
    });
    const url = URL.createObjectURL(blob);
    try {
      const cena = new Image();
      cena.src = url;
      await cena.decode();
      ctx.drawImage(cena, cenaX * escala, cenaY * escala);
    } finally {
      URL.revokeObjectURL(url);
    }

    ctx.fillStyle = "#1a1714";
    ctx.fillRect(0, canvas.height - 44, canvas.width, 44);
    ctx.fillStyle = "#e8dccb";
    ctx.font = `${Math.max(12, Math.round(canvas.width / 70))}px system-ui, sans-serif`;
    ctx.fillText(
      `Simulação M7 Movelaria${numero ? ` · orçamento ${numero}` : ""} · proporção aproximada, não é projeto`,
      16,
      canvas.height - 16,
    );
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg", 0.9);
    a.download = `m7-na-sua-parede${numero ? `-${numero}` : ""}.jpg`;
    a.click();
  };

  const alca = (nome: Alca) => ({
    onPointerDown: (e: React.PointerEvent<SVGElement>) => {
      e.preventDefault();
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      setArrastando(nome);
    },
    onPointerUp: () => setArrastando(null),
    onPointerCancel: () => setArrastando(null),
    style: { cursor: nome === "yPiso" ? "ns-resize" : "ew-resize", touchAction: "none" as const },
  });

  // Espessura das alças em px da foto, para ficar do mesmo tamanho na tela
  // em qualquer resolução de câmera.
  const u = foto ? foto.w / 400 : 1;

  return (
    <section className="mt-5 rounded border border-border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink">Veja na sua parede</h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-xl">
            Tire uma foto da parede vazia, de frente. Marque as duas pontas da parede e a linha do
            piso, diga a largura real, e o móvel aparece em escala. A foto fica só no seu aparelho:
            nada é enviado para a M7 nem para o site.
          </p>
        </div>
        {foto && (
          <button
            type="button"
            onClick={limpar}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink"
          >
            <X className="w-4 h-4" aria-hidden /> Trocar foto
          </button>
        )}
      </div>

      <input
        ref={inputGaleria}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Arquivo da foto da parede (galeria)"
        onChange={(e) => carregar(e.target.files?.[0])}
      />
      <input
        ref={inputCamera}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        aria-label="Arquivo da foto da parede (câmera)"
        onChange={(e) => carregar(e.target.files?.[0])}
      />

      {!foto ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => inputCamera.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-3 bg-bronze text-primary-foreground rounded hover:bg-bronze-dark transition-colors text-sm font-medium"
          >
            <Camera className="w-4 h-4" aria-hidden /> Tirar foto da parede
          </button>
          <button
            type="button"
            onClick={() => inputGaleria.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-3 border border-bronze text-bronze rounded hover:bg-bronze hover:text-primary-foreground transition-colors text-sm font-medium"
          >
            <ImagePlus className="w-4 h-4" aria-hidden /> Escolher da galeria
          </button>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block">
              <span className="text-sm font-medium text-ink">
                Largura real entre os dois marcadores
              </span>
              <span className="mt-1.5 flex items-center rounded border border-border bg-white focus-within:border-bronze max-w-xs">
                <input
                  type="number"
                  inputMode="numeric"
                  min={300}
                  step={10}
                  value={larguraParede || ""}
                  onChange={(e) => setLarguraParede(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-transparent outline-none text-ink"
                />
                <span className="pr-3 text-sm text-muted-foreground">mm</span>
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Meça a parede de ponta a ponta. Se a parede continua fora da foto, marque algo que
                você saiba a medida — uma porta, uma janela — e informe essa medida.
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={transparente}
                onChange={(e) => setTransparente(e.target.checked)}
                className="accent-bronze"
              />
              Ver a parede através do móvel
            </label>
          </div>

          <div className="mt-4 overflow-hidden rounded border border-border bg-ink">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${foto.w} ${foto.h}`}
              className="block w-full h-auto select-none"
              style={{ touchAction: "none" }}
              onPointerMove={onMove}
              onPointerUp={() => setArrastando(null)}
              role="img"
              aria-label="Sua parede com o móvel desenhado em escala"
            >
              <image href={foto.url} width={foto.w} height={foto.h} />

              {pxPorMm > 0 && (
                <CenaMoveis
                  ref={cenaRef}
                  itens={itens}
                  acabamento={acabamento}
                  numero={numero}
                  cliente={cliente}
                  opacidade={transparente ? 0.55 : 0.96}
                  x={cenaX}
                  y={cenaY}
                  width={cenaW}
                  height={cenaH}
                  overflow="visible"
                  style={{ pointerEvents: "none" }}
                />
              )}

              {/* Linha do piso */}
              <line
                x1={0}
                y1={marc.yPiso}
                x2={foto.w}
                y2={marc.yPiso}
                stroke="#f5b64a"
                strokeWidth={1.5 * u}
                strokeDasharray={`${8 * u} ${6 * u}`}
              />
              <g {...alca("yPiso")}>
                <line
                  x1={0}
                  y1={marc.yPiso}
                  x2={foto.w}
                  y2={marc.yPiso}
                  stroke="transparent"
                  strokeWidth={28 * u}
                />
                <circle
                  cx={foto.w / 2}
                  cy={marc.yPiso}
                  r={9 * u}
                  fill="#f5b64a"
                  stroke="#1a1714"
                  strokeWidth={1.5 * u}
                />
                <text
                  x={foto.w / 2 + 14 * u}
                  y={marc.yPiso - 8 * u}
                  fill="#fff"
                  fontSize={11 * u}
                  fontWeight={700}
                  style={{ paintOrder: "stroke", stroke: "#1a1714", strokeWidth: 2 * u }}
                >
                  piso
                </text>
              </g>

              {/* Pontas da parede */}
              {(["xEsq", "xDir"] as const).map((nome) => {
                const x = marc[nome];
                return (
                  <g key={nome} {...alca(nome)}>
                    <line
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={foto.h}
                      stroke="#f5b64a"
                      strokeWidth={1.5 * u}
                      strokeDasharray={`${8 * u} ${6 * u}`}
                    />
                    <line
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={foto.h}
                      stroke="transparent"
                      strokeWidth={28 * u}
                    />
                    <circle
                      cx={x}
                      cy={foto.h * 0.35}
                      r={9 * u}
                      fill="#f5b64a"
                      stroke="#1a1714"
                      strokeWidth={1.5 * u}
                    />
                    <text
                      x={x + (nome === "xEsq" ? 14 : -14) * u}
                      y={foto.h * 0.35 - 12 * u}
                      fill="#fff"
                      fontSize={11 * u}
                      fontWeight={700}
                      textAnchor={nome === "xEsq" ? "start" : "end"}
                      style={{ paintOrder: "stroke", stroke: "#1a1714", strokeWidth: 2 * u }}
                    >
                      {nome === "xEsq" ? "ponta esquerda" : "ponta direita"}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {naoCabe ? (
            <p className="mt-3 text-sm text-destructive">
              O conjunto tem {Math.round(larguraCena)} mm de largura e a parede, {larguraParede} mm.
              Não cabe: tire um módulo ou reduza as medidas.
            </p>
          ) : (
            <label className="mt-4 block">
              <span className="text-sm font-medium text-ink">Posição na parede</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={posicao}
                onChange={(e) => setPosicao(Number(e.target.value))}
                className="mt-1.5 block w-full max-w-md accent-bronze"
                aria-label="Posição do móvel na parede, da esquerda para a direita"
              />
            </label>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={baixar}
              disabled={naoCabe || pxPorMm <= 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-bronze text-bronze rounded hover:bg-bronze hover:text-primary-foreground transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Download className="w-4 h-4" aria-hidden /> Baixar a imagem
            </button>
            <p className="text-xs text-muted-foreground">
              Proporção aproximada: a foto tem perspectiva e a medida final é feita pela M7 no
              local.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
