import type { ReactNode } from "react";

/**
 * Dificulta a cópia do orçamento montado no simulador: bloqueia seleção de
 * texto, menu de contexto, copiar/recortar e arrastar dentro da área.
 *
 * ## O que isto é e o que NÃO é
 *
 * É uma barreira contra cópia casual — o visitante que arrasta o mouse sobre a
 * tabela de módulos e preços e aperta Ctrl+C não leva nada. Serve para o valor
 * montado não circular fora do canal da M7 em dois cliques.
 *
 * **Não é proteção de verdade, e ninguém deve vender como se fosse.** A página
 * é HTML entregue ao navegador: quem quiser copiar consegue pelo "ver código
 * fonte", pelas ferramentas de desenvolvedor, desligando o JavaScript ou
 * simplesmente tirando um print. Nenhum site do mundo resolve isso, e tentar
 * fechar esses caminhos só quebra a página para o usuário legítimo.
 *
 * ## Por que só aqui
 *
 * Fica restrito às telas de valor (resumo e pagamento). No resto do site
 * bloquear seleção seria contra o próprio objetivo: endereço e telefone
 * existem para serem copiados, e `user-select: none` em texto corrido atrapalha
 * leitor de tela e quem usa zoom.
 *
 * A área continua acessível: o conteúdo é lido normalmente por leitor de tela
 * (não há `aria-hidden` nem `tabindex` negativo) e a navegação por teclado não
 * muda — o que se perde é só a seleção com o ponteiro.
 */
export function AreaProtegida({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  /**
   * Elemento a renderizar. Existe para o wrapper não apagar a semântica de
   * quem ele envolve — o resumo do orçamento é um `aside`, e virar `div`
   * tiraria o landmark que o leitor de tela usa para pular até ele.
   */
  as?: "div" | "aside" | "section";
}) {
  const impede = (e: { preventDefault: () => void }) => e.preventDefault();
  return (
    <Tag
      className={`select-none ${className}`}
      onContextMenu={impede}
      onCopy={impede}
      onCut={impede}
      onDragStart={impede}
    >
      {children}
    </Tag>
  );
}
