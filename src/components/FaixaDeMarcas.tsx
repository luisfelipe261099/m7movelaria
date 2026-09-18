import { Picture } from "@/components/Picture";
import { marcas } from "@/data/marcas";

/**
 * Faixa das marcas de ferragem.
 *
 * Mostra o logotipo oficial de cada fabricante — os mesmos arquivos que a home
 * já usa nos cartões de ferragem. Cada logotipo entra em placa própria porque
 * os arquivos trazem o fundo da marca embutido; sobre o fundo escuro do site
 * isso vira uma fileira de placas coloridas, que é justamente o destaque que o
 * cliente pediu.
 *
 * `<ul>` e não uma fileira de divs: é uma lista de marcas, e quem usa leitor
 * de tela ouve quantas são antes de percorrer.
 */
export function FaixaDeMarcas({
  titulo,
  apoio,
  tone = "cream",
}: {
  /**
   * Título da faixa. Sem título ela entra como bloco solto — é o caso da home,
   * onde a seção já tem o próprio h2 e um segundo título repetiria a hierarquia
   * (e um <h2> vazio quebraria a navegação por títulos do leitor de tela).
   */
  titulo?: string;
  apoio?: string;
  tone?: "cream" | "transparente";
}) {
  return (
    <section
      {...(titulo
        ? { "aria-labelledby": "marcas-titulo" }
        : { "aria-label": "Marcas de ferragem que a M7 especifica" })}
      className={tone === "cream" ? "bg-cream py-14" : ""}
    >
      <div className={tone === "cream" ? "max-w-7xl mx-auto px-6" : ""}>
        {titulo && (
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.4em] text-bronze mb-3">Ferragens</p>
            <h2 id="marcas-titulo" className="text-2xl md:text-3xl font-bold text-ink text-balance">
              {titulo}
            </h2>
            {apoio && <p className="mt-3 text-muted-foreground leading-relaxed">{apoio}</p>}
          </div>
        )}

        <ul
          className={`${titulo ? "mt-10" : ""} grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-border border border-border rounded overflow-hidden`}
        >
          {marcas.map((m) => (
            <li key={m.id} className="bg-card flex flex-col">
              {/* Placa quadrada porque o arquivo é quadrado: assim o logotipo
                  entra inteiro. Um recorte em 4/3 cortava a marca da Siforma. */}
              <div className="aspect-square overflow-hidden">
                <Picture
                  name={m.logo}
                  alt={m.alt}
                  className="w-full h-full object-cover"
                  sizes="(min-width: 1024px) 18vw, (min-width: 640px) 32vw, 48vw"
                />
              </div>
              <div className="px-4 py-4 text-center flex flex-col gap-1">
                <span className="text-sm font-semibold tracking-wide text-ink">{m.nome}</span>
                <span className="text-xs text-muted-foreground leading-snug">{m.fornece}</span>
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {m.origem}
                </span>
              </div>
            </li>
          ))}
          {/* São cinco marcas: em duas colunas (celular) e em três (tablet) sobra
              um vão, e o vão mostra a cor da borda como se faltasse um sexto
              logotipo. Esta célula vazia fecha a fileira. Em cinco colunas não
              sobra nada, então ela some. */}
          <li aria-hidden className="bg-card lg:hidden" />
        </ul>
      </div>
    </section>
  );
}
