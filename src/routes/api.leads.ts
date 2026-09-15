import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { enviaEmailLead } from "@/lib/email-lead.server";

/**
 * Recebe o contato de quem monta um orçamento no simulador.
 *
 * O lead sai por três caminhos, do mais forte para o mais fraco:
 *
 *  1. **WhatsApp** — o link que a própria tela monta com nome, telefone, código
 *     e o orçamento montado. É o caminho que fecha venda, e não depende deste
 *     endpoint.
 *  2. **E-mail** (`src/lib/email-lead.server.ts`) — chega sem ninguém precisar abrir
 *     painel nenhum. Sai pelo Gmail e só envia com `GMAIL_USER`,
 *     `GMAIL_APP_PASSWORD` e `LEADS_EMAIL_TO` configuradas na Vercel.
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

import type { Lead } from "@/lib/email-lead.server";

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
        await enviaEmailLead(lead).catch((e) => {
          console.error("[lead-orcamento] e-mail falhou: " + (e?.message ?? e));
        });

        return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
      },
    },
  },
});
