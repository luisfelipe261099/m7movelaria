import { useState } from "react";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { contatoValido, enviaMensagem, nomeValido } from "@/lib/lead";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Formulário de contato da página /contato.
 *
 * Existe por um motivo comercial simples: até aqui a página só oferecia
 * WhatsApp e `mailto:`. Quem não quer puxar conversa agora — ou está no
 * computador do trabalho, ou às onze da noite — não tinha por onde deixar o
 * contato, e ia embora sem deixar rastro. O WhatsApp continua sendo o canal
 * que fecha venda e segue em destaque; isto é a rede embaixo dele.
 *
 * O envio **espera a resposta do servidor**, ao contrário do simulador, que
 * dispara e segue a vida. Aqui a pessoa está parada olhando o botão: sem uma
 * confirmação na tela ela não sabe se mandou, e manda de novo — ou desiste.
 */
export function FormularioContato() {
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tentou, setTentou] = useState(false);
  const [estado, setEstado] = useState<"parado" | "enviando" | "ok" | "erro">("parado");

  const nomeOk = nomeValido(nome);
  const contatoOk = contatoValido(contato);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setTentou(true);
    if (!nomeOk || !contatoOk || estado === "enviando") return;

    setEstado("enviando");
    const foi = await enviaMensagem({
      nome: nome.trim(),
      contato: contato.trim(),
      mensagem: mensagem.trim(),
    });
    setEstado(foi ? "ok" : "erro");
  };

  if (estado === "ok") {
    return (
      <div className="rounded border border-bronze bg-card p-8 text-center">
        <span className="inline-grid place-items-center w-12 h-12 rounded-full bg-bronze/10 text-bronze">
          <Check className="w-6 h-6" aria-hidden />
        </span>
        <h3 className="mt-4 text-xl font-semibold text-ink">Recebemos sua mensagem</h3>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          Vamos responder no contato que você deixou, dentro do horário de atendimento. Se preferir
          adiantar, o WhatsApp é o caminho mais rápido — dá para mandar planta e fotos por lá.
        </p>
        <a
          href={whatsappLink(
            `Olá M7 Movelaria! Acabei de mandar uma mensagem pelo site. Meu nome é ${nome.trim()}.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 px-7 py-3 bg-bronze text-primary-foreground rounded text-sm font-medium hover:bg-bronze-dark transition-colors"
        >
          <MessageCircle className="w-4 h-4" aria-hidden /> Continuar no WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="rounded border border-border bg-card p-6 md:p-8">
      <h3 className="text-xl font-semibold text-ink">Prefere que a gente te procure?</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        Deixe seu contato e o que você precisa. Respondemos no horário de atendimento — sem lista de
        disparo, só sobre o seu projeto.
      </p>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Seu nome</span>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoComplete="name"
            placeholder="Como podemos te chamar"
            className="mt-1.5 w-full rounded border border-input bg-card px-3 py-2.5 text-ink outline-none focus:border-bronze"
          />
          {tentou && !nomeOk && (
            <span className="mt-1 block text-sm text-destructive">Informe seu nome.</span>
          )}
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            WhatsApp ou e-mail
          </span>
          <input
            type="text"
            value={contato}
            onChange={(e) => setContato(e.target.value)}
            autoComplete="tel"
            placeholder="(41) 90000-0000"
            className="mt-1.5 w-full rounded border border-input bg-card px-3 py-2.5 text-ink outline-none focus:border-bronze"
          />
          {tentou && !contatoOk && (
            <span className="mt-1 block text-sm text-destructive">
              Informe um WhatsApp com DDD ou um e-mail válido.
            </span>
          )}
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          O que você precisa <span className="normal-case tracking-normal">(opcional)</span>
        </span>
        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={4}
          maxLength={1200}
          placeholder="Ex.: cozinha e dormitório em apartamento novo na Costeira, entrega das chaves em março."
          className="mt-1.5 w-full rounded border border-input bg-card px-3 py-2.5 text-ink outline-none focus:border-bronze resize-y"
        />
      </label>

      <button
        type="submit"
        disabled={estado === "enviando"}
        className="mt-5 inline-flex items-center gap-2 px-7 py-3 bg-bronze text-primary-foreground rounded text-sm font-medium hover:bg-bronze-dark disabled:opacity-60 transition-colors"
      >
        {estado === "enviando" ? "Enviando…" : "Enviar contato"}
        {estado !== "enviando" && <ArrowRight className="w-4 h-4" aria-hidden />}
      </button>

      {/*
        `aria-live` porque a confirmação e o erro aparecem sem recarregar a
        página: sem isto, quem usa leitor de tela aperta enviar e não recebe
        retorno nenhum.
      */}
      <p aria-live="polite" className="sr-only">
        {estado === "enviando" ? "Enviando sua mensagem." : ""}
      </p>

      {estado === "erro" && (
        <p className="mt-4 text-sm text-destructive leading-relaxed">
          Não conseguimos enviar agora. Tente de novo em instantes ou fale direto no{" "}
          <a
            href={whatsappLink("Olá M7 Movelaria, tentei mandar uma mensagem pelo site.")}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            WhatsApp
          </a>
          .
        </p>
      )}

      <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
        Usamos seu contato apenas para responder sobre o seu projeto.
      </p>
    </form>
  );
}
