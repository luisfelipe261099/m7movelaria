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

export type EtapaLead = "contato" | "retorno" | "pedido" | "mensagem";

export type Lead = {
  nome: string;
  contato: string;
  codigo: string;
  total: number;
  etapa?: EtapaLead;
  itens?: string[];
  mensagem?: string;
};

/**
 * O e-mail muda de cara conforme o momento da captura. Não é enfeite: quem
 * abre a caixa de entrada precisa saber, pelo assunto, se aquilo é alguém que
 * ainda está decidindo (responder hoje) ou um pedido montado (conferir e
 * confirmar). Os três chegam do mesmo endereço e se misturam na lista.
 */
const ASSUNTO: Record<EtapaLead, string> = {
  contato: "Contato novo",
  retorno: "Voltou ao simulador",
  pedido: "Pedido fechado",
  mensagem: "Mensagem pelo site",
};

const CABECALHO: Record<EtapaLead, { titulo: string; nota: string }> = {
  contato: {
    titulo: "Contato novo pelo site",
    nota: "A pessoa deixou o contato para ver o valor e ainda não fechou o pedido. É o momento de responder — ela está decidindo agora.",
  },
  retorno: {
    titulo: "Voltou ao simulador",
    nota: "Já tinha se identificado numa visita anterior e voltou a montar orçamento agora.",
  },
  pedido: {
    titulo: "Pedido fechado pelo site",
    nota: "A pessoa concluiu o simulador e foi levada ao WhatsApp com o pedido montado. Se a mensagem não chegou por lá, o contato abaixo é o caminho.",
  },
  mensagem: {
    titulo: "Mensagem pelo site",
    nota: "Veio pelo formulário da página de contato. A pessoa escolheu esperar o retorno em vez de puxar conversa no WhatsApp — responder pelo canal que ela deixou é o que ela espera.",
  },
};

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

/** O que a pessoa escreveu, quando veio (só no formulário de contato). */
function blocoMensagem(texto: string | undefined): { html: string; texto: string[] } {
  const limpo = (texto ?? "").trim();
  if (!limpo) return { html: "", texto: [] };
  // `white-space: pre-wrap` preserva as quebras de linha que a pessoa digitou
  // no textarea; sem isso o recado vira um parágrafo único e ilegível.
  return {
    html: `
      <p style="margin:24px 0 8px;color:${CINZA};font-size:13px;">O que ela escreveu</p>
      <div style="border-left:3px solid ${BRONZE};background:${CREME};padding:12px 14px;color:${INK};font-size:14px;line-height:1.6;white-space:pre-wrap;">${esc(limpo)}</div>`,
    texto: ["", "O que ela escreveu:", limpo],
  };
}

/** A lista do que a pessoa montou, quando veio (só no pedido fechado). */
function blocoItens(itens: string[] | undefined): { html: string; texto: string[] } {
  if (!itens || itens.length === 0) return { html: "", texto: [] };
  const linhas = itens
    .map(
      (i) =>
        `<li style="margin:0 0 6px;color:${INK};font-size:13px;line-height:1.5;">${esc(i)}</li>`,
    )
    .join("");
  return {
    html: `
      <p style="margin:24px 0 8px;color:${CINZA};font-size:13px;">O que foi montado</p>
      <ul style="margin:0;padding-left:18px;">${linhas}</ul>`,
    texto: ["", "O que foi montado:", ...itens.map((i) => `- ${i}`)],
  };
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

  // O formulário de contato não tem código de orçamento; o simulador sempre
  // tem. Mostrar "sem-codigo" numa linha rotulada só suja a leitura.
  const temCodigo = Boolean(lead.codigo) && lead.codigo !== "sem-codigo";

  const nome = esc(lead.nome);
  const contato = esc(lead.contato);
  const codigo = esc(lead.codigo);

  const etapa: EtapaLead = lead.etapa ?? "contato";
  const { titulo, nota } = CABECALHO[etapa];
  const itens = blocoItens(lead.itens);
  const recado = blocoMensagem(lead.mensagem);

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
          <div style="color:#ffffff;font-size:18px;font-weight:bold;margin-top:4px;font-family:Arial,Helvetica,sans-serif;">${titulo}</div>
        </td></tr>
        <tr><td style="padding:26px 28px 28px;font-family:Arial,Helvetica,sans-serif;">
          <p style="margin:0 0 4px;color:${CINZA};font-size:13px;">Quem entrou em contato</p>
          <p style="margin:0 0 20px;color:${INK};font-size:24px;font-weight:bold;line-height:1.25;">${nome}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${linha("Contato", contato)}
            ${temCodigo ? linha("Código do orçamento", codigo) : ""}
            ${etapa === "mensagem" ? "" : linha("Total simulado", valor)}
            ${linha("Recebido em", agora)}
          </table>
          ${recado.html}${itens.html}
          <table role="presentation" cellpadding="0" cellspacing="0">${botao}</table>
          <p style="margin:24px 0 0;color:${INK};font-size:13px;line-height:1.6;">${nota}</p>
          <p style="margin:12px 0 0;color:${CINZA};font-size:12px;line-height:1.6;">
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
    `${titulo} — M7 Movelaria`,
    ``,
    `Nome: ${lead.nome}`,
    `Contato: ${lead.contato}`,
    ...(temCodigo ? [`Código do orçamento: ${lead.codigo}`] : []),
    ...(etapa === "mensagem" ? [] : [`Total simulado: ${valor}`]),
    `Recebido em: ${agora}`,
    ...recado.texto,
    ...itens.texto,
    ``,
    nota,
    ...(zap ? [``, `Responder no WhatsApp: https://wa.me/${zap}`] : []),
  ].join("\n");

  return {
    subject: limpaCabecalho(
      etapa === "mensagem"
        ? `${ASSUNTO[etapa]} — ${lead.nome}`
        : `${ASSUNTO[etapa]} — ${lead.nome} · ${valor}`,
    ),
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
