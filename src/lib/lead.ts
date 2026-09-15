/**
 * Identificação de quem monta um orçamento no simulador.
 *
 * A troca é explícita: a pessoa monta o móvel e vê o desenho à vontade; o
 * valor aparece depois que ela deixa nome e contato. É o que evita a situação
 * que o cliente descreveu — alguém montar o projeto no site, sair para
 * pesquisar preço em outro lugar e a M7 nunca ficar sabendo que existiu.
 *
 * Isto é uma porteira comercial, não uma trava de segurança: o preço é
 * calculado no navegador, então quem abrir as ferramentas do desenvolvedor
 * chega no número. Blindar de verdade exigiria calcular no servidor, o que só
 * faz sentido quando a tabela real entrar. Para o visitante normal — que é
 * quem interessa aqui — a porteira funciona.
 */

export type Lead = { nome: string; contato: string };

const CHAVE = "m7:orcamento:lead";

/** Aceita telefone brasileiro (10 ou 11 dígitos, com ou sem máscara) ou e-mail. */
export function contatoValido(valor: string): boolean {
  const limpo = valor.trim();
  const digitos = limpo.replace(/\D/g, "");
  const ehTelefone = digitos.length === 10 || digitos.length === 11;
  const ehEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpo);
  return ehTelefone || ehEmail;
}

export function nomeValido(valor: string): boolean {
  return valor.trim().length >= 2;
}

/** Só o primeiro nome, para carimbar no desenho sem virar uma faixa de texto. */
export function primeiroNome(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeiro = partes[0] ?? "";
  const inicial = partes.length > 1 ? ` ${partes[partes.length - 1][0].toUpperCase()}.` : "";
  return primeiro.charAt(0).toUpperCase() + primeiro.slice(1).toLowerCase() + inicial;
}

/**
 * Guarda no navegador para quem volta não preencher de novo. `localStorage`
 * lança em janela anônima com cookies bloqueados, então tudo é protegido.
 */
export function carregaLead(): Lead | null {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const dados = JSON.parse(bruto) as Partial<Lead>;
    if (typeof dados.nome !== "string" || typeof dados.contato !== "string") return null;
    if (!nomeValido(dados.nome) || !contatoValido(dados.contato)) return null;
    return { nome: dados.nome, contato: dados.contato };
  } catch {
    return null;
  }
}

export function salvaLead(lead: Lead): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lead));
  } catch {
    // Sem armazenamento local a pessoa preenche de novo na próxima visita —
    // não é motivo para atrapalhar esta.
  }
}

/**
 * Em que momento da jornada o lead foi capturado. O e-mail muda de cara
 * conforme isto, porque a ação de quem recebe é diferente:
 *
 *   contato  a pessoa acabou de deixar nome e telefone para ver o valor.
 *            Pode sumir no segundo seguinte — é justamente o lead que se
 *            perdia antes, e o mais urgente de responder.
 *   retorno  já tinha se identificado numa visita anterior e voltou a montar
 *            orçamento. Não vê o portão de novo, então sem isto a volta dela
 *            seria invisível para a M7.
 *   pedido   fechou o pedido no fim do simulador. Chega com a lista de itens.
 */
export type EtapaLead = "contato" | "retorno" | "pedido";

/**
 * Cada etapa manda **um** e-mail por sessão, não um por clique.
 *
 * Sem isto, recarregar a página no passo do resumo dispara "retorno" de novo,
 * e clicar duas vezes em "Enviar pedido" manda dois avisos iguais. Quem recebe
 * é uma caixa de entrada de verdade: e-mail repetido treina a pessoa a ignorar
 * o aviso, e aí o canal inteiro perde a serventia.
 *
 * `sessionStorage` cobre o recarregar da página; o `Set` em memória cobre o
 * caso de o armazenamento estar bloqueado (janela anônima), onde ao menos os
 * cliques repetidos da mesma tela não passam.
 */
const MARCA = "m7:orcamento:avisado";
const avisados = new Set<string>();

function primeiraVez(chave: string): boolean {
  if (avisados.has(chave)) return false;
  avisados.add(chave);
  try {
    const bruto = sessionStorage.getItem(MARCA);
    const lista = bruto ? (JSON.parse(bruto) as unknown) : [];
    const antes = Array.isArray(lista) ? lista.filter((v) => typeof v === "string") : [];
    if (antes.includes(chave)) return false;
    sessionStorage.setItem(MARCA, JSON.stringify([...antes, chave]));
  } catch {
    // Sem armazenamento vale só o Set acima.
  }
  return true;
}

/**
 * Manda o lead para o servidor sem segurar a tela: se a rede falhar, a pessoa
 * vê o orçamento do mesmo jeito. O caminho que garante a chegada do contato na
 * equipe é o link de WhatsApp montado na tela.
 *
 * `keepalive` não é detalhe: em "pedido" esta chamada sai junto com um clique
 * que leva a pessoa para o WhatsApp, ou seja, a página está sendo abandonada
 * no mesmo instante. Sem ele o navegador cancela o fetch na saída e o aviso
 * mais importante — o do pedido fechado — é o único que nunca chegaria.
 */
export function enviaLead(
  lead: Lead,
  dados: { codigo: string; total: number; etapa: EtapaLead; itens?: string[] },
): void {
  if (!primeiraVez(`${dados.etapa}:${dados.codigo}`)) return;
  try {
    void fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lead, ...dados }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // idem
  }
}
