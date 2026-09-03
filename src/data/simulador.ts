/**
 * Estado de publicação do simulador de orçamento.
 *
 * Vive num arquivo próprio, e não dentro de `precos.ts`, por causa do caminho
 * crítico: o `head()` de uma rota fica na parte *não* dividida do módulo — ela
 * entra no chunk que toda página do site baixa. Como o `noindex` da rota
 * depende desta flag, importá-la de `precos.ts` arrastava o catálogo de
 * módulos e a tabela de preços inteira para dentro desse chunk: quem abria a
 * home baixava a lista de cores de chapa junto. Uma constante isolada custa
 * alguns bytes; o catálogo custava ~6 KB em todas as páginas.
 *
 * A tabela de material, o puxador, o ripado e o multiplicador de 2,4 já foram
 * fechados com a M7 (01/09/2026), e a venda ficou limitada a Curitiba e região
 * — frete para fora ficou para uma etapa seguinte. Falta só definir as cores
 * de chapa que entram nesta linha; feito isso, virar `true`: a página sai do
 * `noindex`, o aviso some e ela pode ser linkada na navegação.
 */
export const TABELA_CONFIRMADA = false;
