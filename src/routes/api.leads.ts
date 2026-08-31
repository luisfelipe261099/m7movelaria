import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * Recebe o contato de quem monta um orçamento no simulador.
 *
 * ATENÇÃO — ESTADO ATUAL: o lead é registrado no log da função (visível em
 * Vercel → Deployments → Functions → Logs) e nada mais. Não há banco, não há
 * e-mail, não há CRM: essas peças entram na fase que depende da tabela de
 * preço e da conta de pagamento da M7. Até lá o caminho que realmente entrega
 * o contato para a equipe é o link de WhatsApp que a tela monta com nome,
 * telefone e código do orçamento — o log serve de segunda via.
 *
 * Por isso o endpoint nunca derruba a experiência: se ele falhar, a pessoa
 * segue vendo o orçamento normalmente. Perder um registro de log é menos ruim
 * do que travar uma venda.
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

        return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
      },
    },
  },
});
