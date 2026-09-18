import type { ImageName } from "@/assets/generated/images";

/**
 * Marcas de ferragem que a M7 especifica.
 *
 * Existe para dar destaque às marcas — pedido do cliente — sem inventar nada.
 * Cada descrição repete o que o site já afirma em /perguntas-frequentes, em
 * /sobre e nos cartões da home: o que a marca fornece, e só isso. Nada de
 * "parceiro oficial", "revenda autorizada" ou "distribuidor": a M7 não
 * informou nenhum vínculo comercial, e afirmar vínculo é diferente de dizer
 * que se usa a peça.
 *
 * LOGOTIPO. `logo` aponta para o arquivo que já está em `src/assets` e que a
 * home usa desde sempre nos cartões de ferragem — é o logotipo oficial de cada
 * fabricante, não um desenho aproximado. Cada arquivo tem o fundo da própria
 * marca embutido (laranja da Blum, vermelho da Salice, azul da Rometal), então
 * a faixa mostra cada logotipo em placa, e não recortado sobre o fundo escuro
 * do site — recortar exigiria PNG com transparência, que não temos.
 *
 * São marcas de terceiros. Citar a marca para dizer qual peça se usa é uso
 * nominativo e normal no setor, mas cada fabricante publica regras de uso do
 * seu logotipo (tamanho mínimo, área de respiro, fundo). Vale o cliente
 * conferir essas regras antes de dar mais destaque ainda.
 */

export type Marca = {
  id: string;
  nome: string;
  /** Logotipo oficial, o mesmo arquivo que a home já usa nos cartões. */
  logo: ImageName;
  /**
   * Texto alternativo. Descreve o que a imagem É — um logotipo — porque é
   * isso que quem não enxerga precisa saber. Descrever "dobradiça com sistema
   * clip" numa imagem que é o logotipo seria descrever outra coisa.
   */
  alt: string;
  /** O que a marca fornece nos projetos da M7. Duas a quatro palavras. */
  fornece: string;
  /** País de origem, como já aparece nos cartões da home. */
  origem: string;
};

export const marcas: Marca[] = [
  {
    id: "blum",
    nome: "Blum",
    logo: "hw-blum",
    alt: "Logotipo Blum",
    fornece: "Dobradiças e corrediças",
    origem: "Áustria",
  },
  {
    id: "hafele",
    nome: "Häfele",
    logo: "hw-hafele",
    alt: "Logotipo Häfele",
    fornece: "Corrediças ocultas e articuladores",
    origem: "Alemanha",
  },
  {
    id: "salice",
    nome: "Salice",
    logo: "hw-salice",
    alt: "Logotipo Salice",
    fornece: "Dobradiças de sobrepor",
    origem: "Itália",
  },
  {
    id: "rometal",
    nome: "Rometal",
    logo: "hw-rometal",
    alt: "Logotipo Rometal",
    fornece: "Portas de correr e cabideiros",
    origem: "Brasil",
  },
  {
    id: "siforma",
    nome: "Siforma",
    logo: "hw-siforma",
    alt: "Logotipo Siforma",
    fornece: "Perfis e sistemas deslizantes",
    origem: "Brasil",
  },
];
