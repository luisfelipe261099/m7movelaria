/**
 * Monta e envia o e-mail de um lead do simulador, pelo Gmail.
 *
 * ## Credenciais
 *
 * Três variáveis, todas no painel da Vercel — nunca no repositório:
 *
 *   GMAIL_USER          a conta que envia (ex.: m7movelariasite@gmail.com)
 *   GMAIL_APP_PASSWORD  **senha de app**, 16 caracteres, gerada em
 *                       myaccount.google.com → Segurança → Senhas de app
 *   LEADS_EMAIL_TO      quem recebe (vários, separados por vírgula)
 *
 * Tem que ser senha de app, não a senha da conta: o Google bloqueia login SMTP
 * com a senha normal desde 2022. E é melhor assim — a senha de app só serve
 * para enviar e-mail, é revogável sozinha e não dá acesso a Gmail, Drive ou
 * qualquer outra coisa da conta.
 *
 * Sem as variáveis não envia e diz isso no log, para preview e build local
 * seguirem funcionando.
 *
 * `.server.ts` no nome: este módulo carrega nodemailer e nunca pode ser
 * arrastado para o pacote do navegador.
 */
import nodemailer from "nodemailer";

export type Lead = { nome: string; contato: string; codigo: string; total: number };

const BRONZE = "#93603d";
const INK = "#2b2723";
const CINZA = "#5c564e";
const CREME = "#faf6f0";
const BORDA = "#e7e0d6";

/**
 * Escapa o que veio do formulário antes de virar HTML.
 *
 * Nome e contato são digitados por quem visita o site, ou seja, são entrada de
 * terceiro dentro de um e-mail que alguém vai abrir. Sem isto, um nome com
 * `<img onerror=...>` vira HTML no cliente de e-mail de quem recebe.
 */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Tira quebras de linha e caracteres de controle do que vai para um cabeçalho
 * (assunto). Cabeçalho de e-mail é delimitado por CRLF: um nome contendo
 * `\r\nBcc:` poderia acrescentar destinatário. O nodemailer já codifica
 * cabeçalho, isto é a segunda tranca — a entrada vem de formulário público.
 */
/**
 * Caracteres de controle. O `eslint-disable` fica colado na constante porque
 * é exatamente isto que a regra proíbe — e é exatamente isto que queremos
 * casar. Solto acima do `return`, o prettier quebra a expressão em várias
 * linhas e o comentário passa a apontar para a linha errada.
 */
// eslint-disable-next-line no-control-regex
const CONTROLE = /[\u0000-\u001f\u007f]/g;

function limpaCabecalho(s: string): string {
  // Só caracteres de controle viram espaço. Espaço e hífen são legítimos:
  // "Ana Paula" e "41 98877-1234" precisam continuar inteiros.
  return s.replace(CONTROLE, " ").replace(/\s+/g, " ").trim();
}

/** Só dígitos, com o 55 na frente, para montar o link do WhatsApp. */
function telefoneWhats(contato: string): string | null {
  const so = contato.replace(/\D/g, "");
  if (so.length < 10 || so.length > 13) return null;
  return so.startsWith("55") ? so : `55${so}`;
}

function linha(rotulo: string, valor: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${BORDA};color:${CINZA};font-size:13px;width:150px;vertical-align:top;">${rotulo}</td>
      <td style="padding:10px 0;border-bottom:1px solid ${BORDA};color:${INK};font-size:14px;font-weight:600;">${valor}</td>
    </tr>`;
}

export function montaEmail(lead: Lead) {
  const agora = new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });
  const valor =
    lead.total > 0
      ? lead.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "não informado";

  const nome = esc(lead.nome);
  const contato = esc(lead.contato);
  const codigo = esc(lead.codigo);

  const zap = telefoneWhats(lead.contato);
  const botao = zap
    ? `<tr><td style="padding-top:24px;">
         <a href="https://wa.me/${zap}?text=${encodeURIComponent(
           `Olá ${lead.nome}, aqui é da M7 Movelaria. Recebi seu orçamento ${lead.codigo} pelo site.`,
         )}"
            style="display:inline-block;background:${BRONZE};color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:4px;font-size:14px;font-weight:600;">
           Responder no WhatsApp
         </a>
       </td></tr>`
    : "";

  // O `meta charset` não é opcional aqui: sem ele, cliente de e-mail que não
  // olha o cabeçalho MIME assume Latin-1 e "orçamento" chega como "orÃ§amento".
  // Acentuação é metade do texto em português — vale a linha.
  const html = `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${CREME};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREME};padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${BORDA};border-radius:6px;">
        <tr><td style="background:${BRONZE};padding:18px 28px;border-radius:5px 5px 0 0;">
          <div style="color:#ffffff;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">M7 Movelaria</div>
          <div style="color:#ffffff;font-size:18px;font-weight:bold;margin-top:4px;font-family:Arial,Helvetica,sans-serif;">Novo orçamento pelo site</div>
        </td></tr>
        <tr><td style="padding:26px 28px 28px;font-family:Arial,Helvetica,sans-serif;">
          <p style="margin:0 0 4px;color:${CINZA};font-size:13px;">Quem pediu</p>
          <p style="margin:0 0 20px;color:${INK};font-size:24px;font-weight:bold;line-height:1.25;">${nome}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${linha("Contato", contato)}
            ${linha("Código do orçamento", codigo)}
            ${linha("Total simulado", valor)}
            ${linha("Recebido em", agora)}
          </table>
          <table role="presentation" cellpadding="0" cellspacing="0">${botao}</table>
          <p style="margin:26px 0 0;color:${CINZA};font-size:12px;line-height:1.6;">
            O valor acima é o que a pessoa viu na simulação e depende da conferência
            das medidas — não vale como proposta fechada.
          </p>
        </td></tr>
      </table>
      <p style="max-width:560px;margin:14px auto 0;color:${CINZA};font-size:11px;font-family:Arial,Helvetica,sans-serif;">
        Enviado automaticamente por www.m7movelaria.com.br
      </p>
    </td></tr>
  </table>
</body></html>`;

  // Texto puro para quem lê e-mail sem HTML — e é o que aparece na prévia da
  // notificação do celular, então vale ser legível.
  const text = [
    `Novo orçamento pelo site da M7 Movelaria`,
    ``,
    `Nome: ${lead.nome}`,
    `Contato: ${lead.contato}`,
    `Código do orçamento: ${lead.codigo}`,
    `Total simulado: ${valor}`,
    `Recebido em: ${agora}`,
    ...(zap ? [``, `Responder no WhatsApp: https://wa.me/${zap}`] : []),
  ].join("\n");

  return {
    subject: limpaCabecalho(`Novo orçamento — ${lead.nome} · ${valor}`),
    html,
    text,
  };
}

export async function enviaEmailLead(lead: Lead): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const para = process.env.LEADS_EMAIL_TO;
  if (!user || !pass || !para) {
    console.log(
      "[lead-orcamento] e-mail não configurado (GMAIL_USER/GMAIL_APP_PASSWORD/LEADS_EMAIL_TO); só log.",
    );
    return;
  }

  const { subject, html, text } = montaEmail(lead);
  const transporte = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  await transporte.sendMail({
    from: `"Site M7 Movelaria" <${user}>`,
    to: para
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean),
    subject,
    text,
    html,
    // Responder o e-mail fala com o lead direto, quando ele deixou endereço.
    replyTo: lead.contato.includes("@") ? lead.contato : undefined,
  });
}
