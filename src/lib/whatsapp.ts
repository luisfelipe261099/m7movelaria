import { PHONE_E164 } from "@/lib/seo";

/**
 * Número do WhatsApp no formato que a wa.me exige: só dígitos, com DDI e sem
 * o "+".
 *
 * Derivado do `PHONE_E164` de propósito. O NAP (nome, endereço, telefone) tem
 * que ser idêntico em todo lugar — site, Perfil da Empresa no Google, redes —
 * e com dois literais do mesmo número no código era questão de tempo até um
 * ser trocado sem o outro. Para mudar o número da M7, edite `PHONE_E164` em
 * `src/lib/seo.ts`: link de WhatsApp, `href="tel:"`, schema.org e o texto
 * exibido saem todos de lá.
 */
export const WHATSAPP_NUMBER = PHONE_E164.replace(/\D/g, "");

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
