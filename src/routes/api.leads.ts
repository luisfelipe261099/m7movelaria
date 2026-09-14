import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * Recebe o contato de quem monta um orçamento no simulador.
 *
 * O lead sai por três caminhos, do mais forte para o mais fraco:
 *
 *  1. **WhatsApp** — o link que a própria tela monta com nome, telefone, código
 *     e o orçamento montado. É o caminho que fecha venda, e não depende deste
 *     endpoint.
 *  2. **E-mail** (`enviaEmail`, logo abaixo) — chega sem ninguém precisar abrir
 *     painel nenhum. Só envia com `RESEND_API_KEY`, `LEADS_EMAIL_TO` e
 *     `LEADS_EMAIL_FROM` configuradas na Vercel.
 *  3. **Log da função** (Vercel → Deployments → Functions → Logs) — segunda via,
 *     sempre gravada.
 *
 * Continua sem banco e sem CRM: isso entra na fase que depende da tabela de
 * preço fechada e da conta de pagamento da M7.
 *
 * O endpoint nunca derruba a experiência: se o e-mail falhar, a pessoa segue
 * vendo o orçamento normalmente. Perder um registro é menos ruim do que travar
 * uma venda.
 */

/** Limite de tamanho do corpo — nada aqui precisa de mais que isso. */
const LIMITE_BYTES = 2048;

type Lead = { nome: string; contato: string; codigo: string; total: number };

function valida(dados: unknown): Lead | null {
  if (typeof dados !== "object" || dados === null) return null;
  const d = dados as Record<string, unknown>;
  const texto = (v: unknown, max: number) =>
    typeof v === "string" && v.trim().length > 0 && v.length <= max ? v.trim() : null;

  const nome = texto(d.nome, 120);
  const contato = texto(d.contato, 120);
  if (!nome || !contato) return null;

  return {
    nome,
    contato,
    codigo: texto(d.codigo, 40) ?? "sem-codigo",
    total: typeof d.total === "number" && Number.isFinite(d.total) ? d.total : 0,
  };
}

/**
 * Manda o lead por e-mail via Resend (HTTP puro, sem SDK e sem SMTP — é o que
 * funciona dentro de uma função serverless sem dependência nativa).
 *
 * As três variáveis ficam no painel da Vercel, nunca no repositório:
 *   RESEND_API_KEY   chave da conta Resend
 *   LEADS_EMAIL_TO   para quem o lead vai (aceita vários, separados por vírgula)
 *   LEADS_EMAIL_FROM remetente; precisa ser de domínio verificado na Resend
 *
 * Sem as variáveis a função simplesmente não envia e diz isso no log. É de
 * propósito: o site tem que continuar funcionando em preview, no build local e
 * enquanto o domínio de envio não estiver verificado.
 */
async function enviaEmail(lead: Lead): Promise<void> {
  const chave = process.env.RESEND_API_KEY;
  const para = process.env.LEADS_EMAIL_TO;
  const de = process.env.LEADS_EMAIL_FROM;
  if (!chave || !para || !de) {
    console.log("[lead-orcamento] e-mail não configurado (RESEND_API_KEY/TO/FROM); só log.");
    return;
  }

  const valor =
    lead.total > 0
      ? lead.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "não informado";
  const linhas = [
    `Nome: ${lead.nome}`,
    `Contato: ${lead.contato}`,
    `Orçamento: ${lead.codigo}`,
    `Total simulado: ${valor}`,
    `Em: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
  ];

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${chave}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: de,
      to: para
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean),
      subject: `Novo orçamento no site — ${lead.nome} (${lead.codigo})`,
      text: linhas.join("\n"),
      // `reply_to` faz o "responder" do cliente de e-mail ir para o lead quando
      // o contato informado é um endereço; se for telefone, a Resend ignora.
      reply_to: lead.contato.includes("@") ? lead.contato : undefined,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend respondeu ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}

export const Route = createFileRoute("/api/leads")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const bruto = await request.text();
        if (bruto.length > LIMITE_BYTES) {
          return Response.json({ ok: false, erro: "corpo grande demais" }, { status: 413 });
        }

        let dados: unknown;
        try {
          dados = JSON.parse(bruto);
        } catch {
          return Response.json({ ok: false, erro: "json inválido" }, { status: 400 });
        }

        const lead = valida(dados);
        if (!lead) {
          return Response.json(
            { ok: false, erro: "nome e contato são obrigatórios" },
            { status: 400 },
          );
        }

        // Uma linha por lead, em JSON, para dar para filtrar no painel da Vercel.
        console.log(
          "[lead-orcamento] " + JSON.stringify({ ...lead, em: new Date().toISOString() }),
        );

        // O e-mail é o canal que não depende de alguém abrir o painel da Vercel.
        // Falha dele NUNCA derruba a resposta: quem está montando o orçamento
        // não pode perder a venda porque um serviço de terceiro caiu — o log
        // acima e o link de WhatsApp da tela continuam valendo como caminho.
        await enviaEmail(lead).catch((e) => {
          console.error("[lead-orcamento] e-mail falhou: " + (e?.message ?? e));
        });

        return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
      },
    },
  },
});
