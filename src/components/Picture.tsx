import { images, type ImageName } from "@/assets/generated/images";

type PictureProps = {
  /** Nome do arquivo em src/assets sem extensão (ex.: "hero-living"). */
  name: ImageName;
  alt: string;
  /** Classe aplicada ao <img> (o <picture> não participa do layout). */
  className?: string;
  /**
   * `true` só para a imagem que provavelmente é o LCP (a primeira visível na
   * dobra). Ela carrega com prioridade alta e *não* pode ser lazy — imagem
   * `loading="lazy"` acima da dobra atrasa o LCP em vez de ajudar.
   */
  priority?: boolean;
  /**
   * Quanto do viewport a imagem ocupa em cada breakpoint, ex.:
   * `"(min-width: 1024px) 30vw, 100vw"`. É o que faz o navegador escolher a
   * variante certa do srcset — sem isso ele assume 100vw e baixa a maior.
   */
  sizes?: string;
};

/**
 * <img> responsivo com AVIF → WebP → JPEG e dimensões explícitas.
 *
 * Cada imagem é gerada em até três larguras (480/960/1600) e o `srcset` traz o
 * descritor `w` de cada uma, então o celular baixa a variante do tamanho do
 * slot em vez da mesma imagem grande do desktop.
 *
 * As dimensões vêm do manifesto gerado, não são chutadas: é o que reserva o
 * espaço no layout antes do download e mantém o CLS em zero. O CSS continua
 * mandando no tamanho renderizado; width/height só informam a proporção.
 */
export function Picture({ name, alt, className, priority = false, sizes = "100vw" }: PictureProps) {
  const img = images[name];
  return (
    // `display: contents` no <picture>: sem isso ele entra no layout como um
    // elemento inline de altura automática, e o `h-full` do <img> passa a
    // resolver contra ele em vez de contra o container com aspect-ratio — a
    // imagem renderiza no tamanho natural e é recortada pelo overflow-hidden.
    <picture className="contents">
      <source srcSet={img.avif} sizes={sizes} type="image/avif" />
      <source srcSet={img.webp} sizes={sizes} type="image/webp" />
      <img
        src={img.src}
        srcSet={img.jpg}
        sizes={sizes}
        alt={alt}
        width={img.width}
        height={img.height}
        className={className}
        // Sempre `async`: `decoding="sync"` na imagem prioritária bloqueia a
        // main thread justamente no frame em que o LCP é pintado.
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
    </picture>
  );
}
