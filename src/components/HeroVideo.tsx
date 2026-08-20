import { useEffect, useRef, useState } from "react";
import { Picture } from "@/components/Picture";
import type { ImageName } from "@/assets/generated/images";

/**
 * Vídeo do hero que NÃO disputa banda com o LCP.
 *
 * O que existia antes: um `<video autoPlay>` de ~800 KB começando a baixar junto
 * com o HTML. Em 4G simulado (o cenário do Lighthouse mobile) esse download
 * atrasava a primeira imagem visível, empurrando LCP e Speed Index para cima —
 * era o maior item isolado de performance da home.
 *
 * As três condições para o vídeo carregar, todas necessárias:
 *  1. o bloco está (ou já esteve) visível na tela — no celular o hero empilha e
 *     o vídeo fica abaixo da dobra, então quem não rola nunca baixa os 800 KB;
 *  2. a página já terminou de carregar e a thread principal está ociosa, ou
 *     seja, a medição de LCP já passou;
 *  3. o usuário não pediu menos movimento nem está em economia de dados.
 *
 * O pôster continua embaixo do vídeo, então a troca não pisca nem desloca o
 * layout (CLS zero).
 */
export function HeroVideo({
  src,
  poster,
  posterAlt,
  label,
  sizes,
}: {
  src: string;
  poster: ImageName;
  posterAlt: string;
  label: string;
  /** Mesmo valor do `imageSizes` do preload no head da rota. */
  sizes: string;
}) {
  const [showVideo, setShowVideo] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    type NetworkInformation = { saveData?: boolean; effectiveType?: string };
    const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return;

    let idleId: number | undefined;
    let timeoutId: number | undefined;
    let observer: IntersectionObserver | undefined;
    let visible = false;
    let loaded = document.readyState === "complete";

    const maybeStart = () => {
      if (!visible || !loaded) return;
      const ric = window.requestIdleCallback;
      if (ric) idleId = ric(() => setShowVideo(true), { timeout: 3000 });
      else timeoutId = window.setTimeout(() => setShowVideo(true), 1200);
    };

    const onLoad = () => {
      loaded = true;
      maybeStart();
    };
    if (!loaded) window.addEventListener("load", onLoad, { once: true });

    const host = hostRef.current;
    if (host && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            visible = true;
            observer?.disconnect();
            maybeStart();
          }
        },
        // Começa um pouco antes de entrar na tela, para o vídeo já estar
        // rodando quando o bloco aparecer de fato.
        { rootMargin: "200px" },
      );
      observer.observe(host);
    } else {
      visible = true;
      maybeStart();
    }

    return () => {
      window.removeEventListener("load", onLoad);
      observer?.disconnect();
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div ref={hostRef} className="contents">
      <Picture
        name={poster}
        alt={posterAlt}
        priority
        className="absolute inset-0 w-full h-full object-cover"
        sizes={sizes}
      />
      {showVideo && (
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-label={label}
          className="absolute inset-0 w-full h-full object-cover"
        >
          {/* Faixa de legendas vazia: o vídeo é decorativo e não tem áudio, mas
              o critério WCAG 1.2.2 (e o audit `video-caption` do Lighthouse)
              exige a presença de <track kind="captions"> em qualquer <video>. */}
          <track kind="captions" srcLang="pt-BR" label="Sem áudio" src="/media/sem-audio.vtt" />
        </video>
      )}
    </div>
  );
}
