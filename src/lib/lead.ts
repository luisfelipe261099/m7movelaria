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
 * Manda o lead para o servidor sem segurar a tela: se a rede falhar, a pessoa
 * vê o orçamento do mesmo jeito. O caminho que garante a chegada do contato na
 * equipe é o link de WhatsApp montado na tela.
 */
export function enviaLead(lead: Lead, codigo: string, total: number): void {
  try {
    void fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lead, codigo, total }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // idem
  }
}
