import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  X,
  MessageCircle,
  User,
  MousePointer2,
  RotateCw,
  Sparkles,
  Maximize,
  Minimize,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { whatsappLink } from "@/lib/whatsapp";
import { pageSeo, canonical, EMAIL, PHONE_LOCAL } from "@/lib/seo";
import { jsonLd, webPage } from "@/lib/schema";
import { FloorPlanChooser } from "@/components/FloorPlanChooser";
import { Breadcrumbs } from "@/components/PageParts";
import { rooms, type Hotspot, type Room } from "@/data/rooms";
import { projects } from "@/data/projects";

const PanoramaViewer = lazy(() =>
  import("@/components/PanoramaViewer").then((m) => ({ default: m.PanoramaViewer })),
);

// iOS Safari (iPhone/iPad) is the one platform where the native Fullscreen API is
// unreliable — it can report itself as supported yet silently fail to actually resize
// the element, and there's no way to hide Safari's own address bar from a normal tab
// either way. Android Chrome/Firefox/Samsung Internet and desktop browsers all handle
// native fullscreen properly (true edge-to-edge, browser chrome hidden).
function isIOSDevice() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

const TRAIL = [
  { name: "Início", path: "/" },
  { name: "Showroom 3D", path: "/showroom-3d" },
];

export const Route = createFileRoute("/showroom-3d")({
  head: () => ({
    ...pageSeo({
      title: "Showroom 3D e Tour 360° | M7 Movelaria",
      description:
        "Tour virtual 360° da M7 Movelaria: escolha um ambiente na planta e explore cozinhas, closets e home office planejados com os detalhes técnicos de cada móvel.",
      path: "/showroom-3d",
    }),
    scripts: [
      jsonLd([
        ...webPage({
          path: "/showroom-3d",
          name: "Showroom 3D — tour 360° da M7 Movelaria",
          description:
            "Tour virtual 360° pelos ambientes do showroom da M7 Movelaria, com móveis planejados sob medida.",
          breadcrumb: TRAIL,
        }),
      ]),
    ],
  }),
  component: Showroom3DPage,
});

function Showroom3DPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ h: Hotspot; room: Room } | null>(null);
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  // iOS Safari (most iPhones) doesn't support the native Fullscreen API for regular
  // elements, so this is a CSS-only fallback (fixed, fills the viewport) that works
  // everywhere — the button should always do *something* useful, not just disappear.
  const [cssFullscreen, setCssFullscreen] = useState(false);
  const isFullscreen = nativeFullscreen || cssFullscreen;
  const [isIOS, setIsIOS] = useState(false);
  const [selectedProjectSlug, setSelectedProjectSlug] = useState(projects[0].slug);
  const viewerRef = useRef<HTMLDivElement>(null);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) ?? null;

  useEffect(() => {
    setIsIOS(isIOSDevice());
  }, []);

  useEffect(() => {
    const onChange = () => setNativeFullscreen(document.fullscreenElement === viewerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Escape fecha o painel de detalhe do hotspot (o fullscreen nativo já é
  // encerrado pelo próprio navegador com Escape).
  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetail(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [detail]);

  // Lock page scroll while the CSS fallback is active (native fullscreen does this
  // automatically; this fallback doesn't leave the normal document flow).
  useEffect(() => {
    if (!cssFullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [cssFullscreen]);

  // Aquece o chunk do three.js enquanto a pessoa ainda olha a planta, para o
  // clique numa sala não esperar carregamento frio. São 248 KB na rede — o maior
  // JavaScript do site, quase três vezes o entry —, então o preload segue a
  // mesma disciplina que o vídeo do hero já usa: só depois do `load`, dentro de
  // tempo ocioso, e nunca em economia de dados ou rede 2G. Sem isso, todo mundo
  // que abre a página paga o download mesmo sem entrar em sala nenhuma.
  //
  // As panorâmicas (~1 MB cada) continuam fora do preload em bloco: baixar as
  // oito custava ~7 MB antes de qualquer interação.
  useEffect(() => {
    type NetworkInformation = { saveData?: boolean; effectiveType?: string };
    const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return;

    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const aquecer = () => {
      const ric = window.requestIdleCallback;
      if (ric) idleId = ric(() => void import("@/components/PanoramaViewer"), { timeout: 3000 });
      else timeoutId = window.setTimeout(() => void import("@/components/PanoramaViewer"), 1200);
    };

    if (document.readyState === "complete") aquecer();
    else window.addEventListener("load", aquecer, { once: true });

    return () => {
      window.removeEventListener("load", aquecer);
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  // Pré-carrega apenas a panorâmica do ambiente selecionado e a do vizinho seguinte,
  // mantendo a troca de sala fluida sem o custo do preload total.
  useEffect(() => {
    if (!selectedRoomId) return;
    const idx = rooms.findIndex((r) => r.id === selectedRoomId);
    if (idx === -1) return;
    const next = rooms[(idx + 1) % rooms.length];
    const img = new Image();
    img.src = next.panorama;
  }, [selectedRoomId]);

  const toggleFullscreen = () => {
    if (cssFullscreen) {
      setCssFullscreen(false);
      return;
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }
    if (!isIOS && document.fullscreenEnabled && viewerRef.current) {
      viewerRef.current.requestFullscreen().catch(() => setCssFullscreen(true));
    } else {
      setCssFullscreen(true);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-white">
      <SiteHeader />
      <main id="conteudo">
        <section className="pt-28 pb-6 max-w-7xl mx-auto px-6 text-center">
          {/* O JSON-LD já declarava BreadcrumbList; faltava a trilha visível,
              que é o que o visitante e o rastreador usam para se situar. */}
          <div className="text-left mb-6 [&_a]:text-white/70 [&_a:hover]:text-bronze [&_li[aria-current]]:text-white">
            <Breadcrumbs trail={TRAIL} />
          </div>
          <p className="text-xs uppercase tracking-[0.4em] text-bronze mb-3">
            Tour Virtual · Imersão 360°
          </p>
          <h1 className="font-display text-4xl md:text-6xl leading-tight">
            Showroom 3D: ambientes planejados da M7 em tour 360°
          </h1>
          <p className="text-white/60 mt-4 max-w-2xl mx-auto text-sm md:text-base">
            Escolha um ambiente na planta e entre em uma imersão 360° pelos ambientes M7 — hall,
            sala, cozinha, dormitório, closet, lavabo, escritório e adega. Clique nos pontos
            dourados para se aproximar de cada móvel e ver marca, material e especificação.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-6 text-[11px] uppercase tracking-widest text-white/50">
            <span className="inline-flex items-center gap-2">
              <MousePointer2 className="w-4 h-4 text-bronze" /> Arraste para olhar
            </span>
            <span className="inline-flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-bronze" /> Imersão 360°
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-bronze" /> Pontos dourados
            </span>
          </div>
        </section>

        <section className="pb-10 sm:pb-16 max-w-7xl mx-auto px-3 sm:px-4">
          <div
            ref={viewerRef}
            className={`relative w-full border border-bronze/20 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] overflow-hidden bg-black ${
              isFullscreen
                ? "fixed inset-0 z-[200] h-[100dvh] w-[100dvw] border-0"
                : "h-[55vh] min-h-[380px] sm:h-[70vh] sm:min-h-[500px] md:h-[75vh] md:min-h-[560px]"
            }`}
          >
            {/*
              No point offering fullscreen on iOS: Safari can't hide its own address bar
              for a regular page no matter what we do, so the button would just be
              confusing there. Android/desktop get the real thing.
            */}
            {!isIOS && (
              <button
                onClick={toggleFullscreen}
                className={`absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-30 flex items-center bg-black/60 hover:bg-black/80 backdrop-blur text-white tracking-widest border border-white/15 uppercase transition-colors ${
                  isFullscreen
                    ? "gap-0 p-2.5 sm:gap-3 sm:text-base sm:px-6 sm:py-3"
                    : "gap-0 p-2.5 sm:gap-2 sm:text-[11px] sm:px-4 sm:py-2"
                }`}
                aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
                </span>
              </button>
            )}
            {selectedRoom ? (
              <Suspense
                fallback={
                  <div className="absolute inset-0 flex items-center justify-center text-white/60 text-xs uppercase tracking-[0.3em] bg-black">
                    Carregando ambiente em 360°…
                  </div>
                }
              >
                <PanoramaViewer
                  key={selectedRoom.id}
                  src={selectedRoom.panorama}
                  hotspots={selectedRoom.hotspots}
                  onHotspotClick={(h) => setDetail({ h, room: selectedRoom })}
                  onBack={() => setSelectedRoomId(null)}
                  rooms={rooms.map((r) => ({ id: r.id, name: r.name }))}
                  activeRoomId={selectedRoom.id}
                  onNavigateRoom={setSelectedRoomId}
                  fullscreen={isFullscreen}
                />
              </Suspense>
            ) : (
              <FloorPlanChooser
                rooms={rooms}
                onSelectRoom={setSelectedRoomId}
                projects={projects.map((p) => ({ slug: p.slug, name: p.name, client: p.client }))}
                selectedProjectSlug={selectedProjectSlug}
                onSelectProject={setSelectedProjectSlug}
                isIOS={isIOS}
              />
            )}

            {/*
              Rendered *inside* the element that goes fullscreen (viewerRef): the
              Fullscreen API only paints the fullscreen element's own subtree, so a
              `fixed` panel living outside it (e.g. as a sibling of <SiteFooter />)
              would silently stop rendering the moment fullscreen is entered.
            */}
            {detail && (
              <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-black/90 backdrop-blur-xl border-l border-bronze/20 text-white p-5 sm:p-8 z-[100] overflow-y-auto animate-in slide-in-from-right duration-300">
                <button
                  onClick={() => setDetail(null)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-bronze transition-colors flex items-center justify-center"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>

                <p className="text-[10px] uppercase tracking-[0.35em] text-bronze pr-10">
                  {detail.h.categoria}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl mt-2 leading-tight pr-2">
                  {detail.h.label}
                </h2>

                <p className="text-[11px] text-white/50 mt-2 uppercase tracking-[0.25em]">
                  {detail.room.name}
                </p>

                <div className="mt-8 space-y-5">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/50">Marca</div>
                    <div className="text-base text-white mt-1">{detail.h.marca}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/50">
                      Modelo / Especificação
                    </div>
                    <div className="text-sm text-white/90 mt-1">{detail.h.modelo}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/50">
                      Execução M7
                    </div>
                    <div className="text-sm text-white/80 mt-1 leading-relaxed">
                      {detail.h.detalhe}
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/10">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-bronze mb-2">
                    Projeto
                  </div>
                  <p className="text-sm text-white/90 flex items-center gap-2">
                    <User className="w-3 h-3 text-bronze" /> {detail.room.cliente}
                  </p>
                </div>

                <a
                  href={whatsappLink(
                    `Olá M7, vi o ${detail.h.label} no tour 360° (${detail.room.name}) e gostaria de um orçamento.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-bronze text-white text-xs uppercase tracking-[0.25em] px-5 py-4 hover:bg-bronze/90 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> Solicitar orçamento
                </a>
                <p className="text-[10px] text-white/70 text-center mt-3 uppercase tracking-widest">
                  {PHONE_LOCAL} · {EMAIL}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
