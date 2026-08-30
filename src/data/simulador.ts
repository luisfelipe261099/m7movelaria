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
 * Quando a tabela real da M7 entrar, virar `true`: a página sai do `noindex`,
 * o aviso de valores ilustrativos some e ela pode ser linkada na navegação.
 */
export const TABELA_CONFIRMADA = false;
