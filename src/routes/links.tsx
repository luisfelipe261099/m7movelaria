import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import {
  SITE_URL,
  SITE_NAME,
  PHONE_LOCAL,
  PHONE_E164,
  STREET_ADDRESS,
  CITY,
  REGION,
  OPENING_HOURS,
} from "@/lib/seo";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { images } from "@/assets/generated/images";

/**
 * Página de link da bio do Instagram (/links).
 *
 * Por que ela é HTML escrito à mão, e não uma rota React como as outras:
 *
 * O bundle compartilhado do site tem ~136 KB comprimidos. Esta página é uma
 * lista de links — carregar React e o roteador para renderizá-la seria
 * desperdício em qualquer contexto, e aqui o contexto é o pior possível: o
 * navegador embutido do Instagram, quase sempre em rede móvel, com o visitante
 * a um toque de desistir. Servida assim, é uma única requisição de poucos KB
 * com o CSS embutido: pinta antes de qualquer coisa poder atrasar.
 *
 * Outras decisões que valem para esta página e não para o resto do site:
 *
 * - **Fonte do sistema.** Nenhum webfont. A identidade vem da cor e do layout;
 *   esperar 30 KB de fonte para mostrar a lista não se paga.
 * - **`noindex, follow`.** Página de links não tem conteúdo próprio — indexá-la
 *   dilui o site e parece doorway page. Os links continuam passando valor.
 *   Também fica fora do sitemap de propósito.
 * - **Uma ação principal.** O WhatsApp é o botão que fecha negócio; o resto é
 *   lista secundária, agrupada em duas seções. Dar o mesmo peso visual a sete
 *   opções é a forma mais comum de não converter nenhuma.
 * - **Prova visual antes da lista.** Quem vem do Instagram vem de um feed de
 *   imagens; a faixa de três miniaturas é o primeiro item da lista justamente
 *   porque é o que responde "vocês fazem o quê?" sem exigir um toque.
 * - **Estado de atendimento calculado no servidor.** "Aberto agora" / "abre
 *   amanhã às 8h" sai de `OPENING_HOURS` no fuso America/Sao_Paulo, sem uma
 *   linha de JavaScript no cliente. É o dado que mais muda a decisão de quem
 *   cai aqui às 22h — e a chamada do WhatsApp muda junto.
 * - **Mensagem pré-preenchida diferente por origem.** Cada botão abre o
 *   WhatsApp com um texto próprio, então a conversa já começa sabendo o que a
 *   pessoa quer e de onde ela veio.
 * - **UTM nos links internos**, para separar o tráfego do Instagram quando
 *   houver analytics instalado.
 * - **`env(safe-area-inset-*)`.** O navegador do Instagram tem barras próprias;
 *   sem isso o último botão fica embaixo da barra do iPhone.
 * - **`:focus-visible` explícito.** O resto do site herda o foco do Tailwind;
 *   aqui o CSS é escrito à mão, então o estado de foco precisa ser declarado —
 *   sem ele quem navega por teclado fica sem saber onde está.
 */

const UTM = "utm_source=instagram&utm_medium=bio&utm_campaign=link_na_bio";

const wa = (msg: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(`${STREET_ADDRESS}, ${CITY} - ${REGION}`);

/* ------------------------------------------------------------------ *
 * Horário de atendimento
 *
 * A tabela semanal é derivada de `OPENING_HOURS` — a mesma constante que
 * alimenta o `LocalBusiness` no JSON-LD. Se o horário mudar em um lugar, muda
 * nos dois: um site que anuncia "aberto agora" fora do horário publicado no
 * Google é pior do que um site que não anuncia nada.
 * ------------------------------------------------------------------ */

const TIMEZONE = "America/Sao_Paulo";

/** Aceita tanto o nome completo (`OPENING_HOURS`) quanto o abreviado (`Intl`). */
const WEEKDAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Sun: 0,
  Monday: 1,
  Mon: 1,
  Tuesday: 2,
  Tue: 2,
  Wednesday: 3,
  Wed: 3,
  Thursday: 4,
  Thu: 4,
  Friday: 5,
  Fri: 5,
  Saturday: 6,
  Sat: 6,
};

const DAY_ABBR = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const DAY_FULL = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** 480 -> "8h", 750 -> "12h30" */
const hm = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
};

const asDays = (d: string | readonly string[]): readonly string[] =>
  typeof d === "string" ? [d] : d;

/** Índice 0 = domingo. `null` = fechado o dia inteiro. */
const WEEK: ({ opens: number; closes: number } | null)[] = (() => {
  const week: ({ opens: number; closes: number } | null)[] = Array(7).fill(null);
  for (const spec of OPENING_HOURS) {
    for (const day of asDays(spec.dayOfWeek)) {
      week[WEEKDAY_INDEX[day]] = { opens: toMinutes(spec.opens), closes: toMinutes(spec.closes) };
    }
  }
  return week;
})();

/** "Seg a sex 8h–18h · sáb 8h–12h" */
const HOURS_LABEL = (() => {
  const parts = OPENING_HOURS.map((spec) => {
    const days = asDays(spec.dayOfWeek)
      .map((d) => WEEKDAY_INDEX[d])
      .sort((a, b) => a - b);
    const range =
      days.length > 2
        ? `${DAY_ABBR[days[0]]} a ${DAY_ABBR[days[days.length - 1]]}`
        : days.map((d) => DAY_ABBR[d]).join(" e ");
    return `${range} ${hm(toMinutes(spec.opens))}–${hm(toMinutes(spec.closes))}`;
  }).join(" · ");
  return parts.charAt(0).toUpperCase() + parts.slice(1);
})();

/** Hora local do ateliê, independente do fuso do servidor (a Vercel roda em UTC). */
function nowAtWorkshop() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    day: WEEKDAY_INDEX[get("weekday")] ?? 1,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

/** Próxima abertura a partir de agora, procurando até uma semana à frente. */
function nextOpening(day: number, minutes: number) {
  for (let offset = 0; offset < 7; offset++) {
    const d = (day + offset) % 7;
    const slot = WEEK[d];
    if (!slot) continue;
    if (offset === 0 && minutes >= slot.opens) continue;
    return { offset, day: d, opens: slot.opens };
  }
  return null;
}

function businessStatus() {
  const { day, minutes } = nowAtWorkshop();
  const slot = WEEK[day];

  if (slot && minutes >= slot.opens && minutes < slot.closes) {
    return {
      open: true,
      state: "Aberto agora",
      detail: `até ${hm(slot.closes)}`,
      ctaHint: "Mande a planta ou as medidas do ambiente",
    };
  }

  const next = nextOpening(day, minutes);
  if (!next) {
    return {
      open: false,
      state: "Fora do horário",
      detail: HOURS_LABEL.toLowerCase(),
      ctaHint: "Mande a planta ou as medidas do ambiente",
    };
  }

  const when = next.offset === 0 ? "hoje" : next.offset === 1 ? "amanhã" : DAY_FULL[next.day];
  return {
    open: false,
    state: "Fechado agora",
    detail: `abre ${when} às ${hm(next.opens)}`,
    ctaHint: `Pode mandar — voltamos ${when} às ${hm(next.opens)}`,
  };
}

/* ------------------------------------------------------------------ *
 * Conteúdo
 * ------------------------------------------------------------------ */

/** `newTab` só para o que sai do site (WhatsApp, Maps). Link interno abre na
 *  mesma aba: assim o botão "voltar" traz a pessoa de volta para esta página,
 *  em vez de empilhar abas dentro do navegador do Instagram. */
type Item = { href: string; label: string; hint: string; icon: string; newTab?: boolean };
type Group = { title: string; items: Item[] };

const GROUPS: Group[] = [
  {
    title: "Veja o trabalho",
    items: [
      {
        href: `${SITE_URL}/moveis-planejados?${UTM}`,
        label: "Móveis planejados sob medida",
        hint: "Cozinhas, dormitórios, closets, home office",
        icon: "grid",
      },
      {
        href: `${SITE_URL}/showroom-3d?${UTM}`,
        label: "Showroom 3D — tour 360°",
        hint: "Entre nos ambientes e explore por dentro",
        icon: "cube",
      },
    ],
  },
  {
    title: "Fale com a M7",
    items: [
      {
        href: `${SITE_URL}/perguntas-frequentes?${UTM}`,
        label: "Preço, prazo e materiais",
        hint: "Respostas diretas antes do orçamento",
        icon: "help",
      },
      {
        href: `tel:${PHONE_E164}`,
        label: `Ligar — ${PHONE_LOCAL}`,
        hint: HOURS_LABEL,
        icon: "phone",
      },
      {
        href: MAPS_URL,
        label: "Como chegar ao ateliê",
        hint: `${STREET_ADDRESS} — SJP`,
        icon: "pin",
        newTab: true,
      },
    ],
  },
];

/** Miniaturas do portfólio. Usam a variante de 480px que já existe: numa faixa
 *  de três colunas o bloco tem ~107 CSS px, então 480 é a largura certa para
 *  tela de 3x — nada é baixado à toa. São `lazy`, logo não competem com o
 *  primeiro paint. Os arquivos são renders de projeto, nunca fotos de obra.
 *
 *  Entram como decorativas (`alt=""` + faixa `aria-hidden`): o link já tem
 *  rótulo e descrição próprios, e somar três alts a eles faria o nome acessível
 *  do link virar um parágrafo no leitor de tela. */
const THUMBS = ["project-kitchen", "project-closet", "project-office"] as const;

/** O primeiro item de cada srcset é a variante de 480px. */
const first = (srcset: string) => srcset.split(",")[0].trim().split(" ")[0];

/** Ícones em linha: nenhuma requisição extra, nenhuma biblioteca. */
const ICONS: Record<string, string> = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  image:
    '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  cube: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 12l9-5M12 12v10M12 12L3 7"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.2 9a2.8 2.8 0 015.4 1c0 1.9-2.6 2.2-2.6 4"/><path d="M12 17.5h.01"/>',
  phone:
    '<path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012 4.1 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.4 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0z"/><circle cx="12" cy="10" r="3"/>',
  whats:
    '<path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2z"/><path d="M8.5 7.8c.2-.4.4-.4.6-.4h.6c.2 0 .5 0 .7.5l.9 2c.1.3 0 .5-.1.7l-.5.6c-.1.2-.3.4-.1.7.2.4.9 1.4 1.9 2.3 1.2 1.1 2.2 1.4 2.6 1.6.3.1.5 0 .7-.2l.6-.7c.2-.2.4-.2.6-.1l2 1c.3.1.4.3.4.5v.6c0 .3-.2.7-.6 1-.4.3-1 .6-1.6.6-1.6 0-3.7-1-5.6-2.9-1.9-1.9-3-4-3-5.6 0-.7.3-1.3.7-1.7z"/>',
};

const ARROW =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';

function icon(name: string, size = 20) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

function card(it: Item) {
  return `
        <a class="card" href="${it.href}"${it.newTab ? ' target="_blank" rel="noopener"' : ""}>
          <span class="ic">${icon(it.icon)}</span>
          <span class="txt">
            <span class="lb">${it.label}</span>
            <span class="hn">${it.hint}</span>
          </span>
          <span class="ar">${ARROW}</span>
        </a>`;
}

function gallery() {
  const thumbs = THUMBS.map((name) => {
    const v = images[name];
    return `<picture>
              <source type="image/avif" srcset="${first(v.avif)}">
              <source type="image/webp" srcset="${first(v.webp)}">
              <img src="${first(v.jpg)}" alt="" width="480" height="300" loading="lazy" decoding="async">
            </picture>`;
  }).join("");

  return `
        <a class="card gal" href="${SITE_URL}/projetos?${UTM}">
          <span class="thumbs" aria-hidden="true">${thumbs}</span>
          <span class="row">
            <span class="ic">${icon("image")}</span>
            <span class="txt">
              <span class="lb">Portfólio de projetos</span>
              <span class="hn">Materiais e ferragens de cada detalhe</span>
            </span>
            <span class="ar">${ARROW}</span>
          </span>
        </a>`;
}

function render() {
  const url = `${SITE_URL}/links`;
  const title = `${SITE_NAME} — Móveis planejados sob medida`;
  const desc =
    "Peça um orçamento no WhatsApp, veja o portfólio e entre no tour 360°. Marcenaria de alto padrão em São José dos Pinhais e Curitiba.";
  const status = businessStatus();

  const sections = GROUPS.map(
    (g, i) => `
      <h2 class="gl">${g.title}</h2>
      <nav class="list" aria-label="${g.title}">${i === 0 ? gallery() : ""}${g.items
        .map(card)
        .join("")}
      </nav>`,
  ).join("");

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#17130F">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE_URL}/og-cover.jpg">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE_URL}/og-cover.jpg">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/logo-512.png">
<!-- O destino do botão principal é outra origem: abrir a conexão agora tira o
     DNS + TLS do caminho entre o toque e o WhatsApp. -->
<link rel="dns-prefetch" href="https://wa.me">
<link rel="preconnect" href="https://wa.me">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#17130F; --card:#221C17; --card-h:#2B231C;
  --line:#332A22; --txt:#F3EDE4; --mut:#B2A597;
  --bronze:#93603D; --bronze-soft:#C79A63; --open:#6FCF87;
}
html{-webkit-text-size-adjust:100%}
body{
  background:var(--bg); color:var(--txt);
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  line-height:1.45; -webkit-font-smoothing:antialiased;
  -webkit-tap-highlight-color:transparent;
  min-height:100svh;
  padding:calc(env(safe-area-inset-top) + 30px) calc(env(safe-area-inset-right) + 20px)
          calc(env(safe-area-inset-bottom) + 30px) calc(env(safe-area-inset-left) + 20px);
  display:flex; justify-content:center;
}
.wrap{width:100%;max-width:440px;display:flex;flex-direction:column}
/* Estado de foco: o único estado que existia era :active, que teclado e leitor
   de tela não disparam. */
a:focus-visible{outline:2px solid var(--bronze-soft);outline-offset:3px}
/* --- topo --- */
.head{text-align:center;margin-bottom:20px}
.mark{
  width:72px;height:72px;margin:0 auto 14px;border-radius:20px;
  background:linear-gradient(160deg,#2E251D,#1C1713);
  border:1px solid var(--line);
  display:grid;place-items:center;
  font:700 27px/1 Georgia,"Times New Roman",serif;
  color:var(--bronze-soft);letter-spacing:.02em;
}
h1{font-size:19px;font-weight:700;letter-spacing:.01em}
.sub{color:var(--mut);font-size:14px;margin-top:5px}
.pills{display:flex;flex-wrap:wrap;justify-content:center;gap:7px;margin-top:12px}
.pill{
  display:inline-flex;align-items:center;gap:7px;
  border:1px solid var(--line);border-radius:999px;
  padding:5px 12px;font-size:12px;color:var(--mut);
}
.pill b{font-weight:600;color:var(--txt)}
.pill .pi{display:inline-flex;color:var(--bronze-soft);margin-left:-1px}
.dot{width:7px;height:7px;border-radius:50%;background:var(--mut);flex:none}
.pill.on .dot{background:var(--open);box-shadow:0 0 0 3px rgba(111,207,135,.17)}
.pill.on b{color:var(--open)}
/* --- botão principal --- */
.cta{
  display:flex;align-items:center;gap:13px;
  background:var(--bronze);color:#fff;text-decoration:none;
  border-radius:15px;padding:17px 18px;
  box-shadow:0 8px 22px rgba(0,0,0,.4);
}
.cta:active{transform:scale(.985)}
.cta .ic{flex:none;display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:rgba(255,255,255,.16)}
.cta .lb{display:block;font-size:16px;font-weight:700;letter-spacing:.01em}
.cta .hn{display:block;font-size:12.5px;color:rgba(255,255,255,.92);margin-top:2px}
/* --- listas --- */
.gl{
  font-size:12px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;
  color:var(--mut);margin:22px 0 9px;padding-left:4px;
}
.list{display:flex;flex-direction:column;gap:9px}
.card{
  display:flex;align-items:center;gap:13px;
  background:var(--card);border:1px solid var(--line);
  border-radius:14px;padding:13px 15px;text-decoration:none;color:var(--txt);
  min-height:62px;
}
.card:active{background:var(--card-h);transform:scale(.99)}
.card .ic{flex:none;color:var(--bronze-soft);display:grid;place-items:center;width:26px}
.card .txt{flex:1;min-width:0}
.card .lb{display:block;font-size:14.5px;font-weight:600}
.card .hn{display:block;font-size:12.5px;color:var(--mut);margin-top:2px}
.card .ar{flex:none;color:#7C7167;display:grid;place-items:center}
/* --- faixa do portfólio --- */
.gal{display:block;padding:8px 8px 3px}
.thumbs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.thumbs img{
  display:block;width:100%;height:auto;aspect-ratio:8/5;
  object-fit:cover;border-radius:8px;background:#1C1713;
}
.gal .row{display:flex;align-items:center;gap:13px;padding:11px 7px 10px}
/* --- rodapé --- */
.trust{margin-top:20px;text-align:center;font-size:12px;color:var(--mut);line-height:1.7}
.trust b{color:var(--txt);font-weight:600}
.foot{margin-top:16px;text-align:center;font-size:12.5px;color:var(--mut);line-height:1.7}
/* padding, e não só texto: sem ele o alvo de toque tem 14px de altura,
   metade do mínimo utilizável no celular. */
.foot a{display:inline-block;padding:6px 6px;color:var(--bronze-soft);text-decoration:none;font-weight:600}
.foot .hr{height:1px;background:var(--line);margin:0 auto 16px;max-width:150px}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
@media (min-width:520px){ .mark{width:80px;height:80px;font-size:30px} h1{font-size:21px} }
</style>
</head>
<body>
<main class="wrap">
  <header class="head">
    <div class="mark" aria-hidden="true">M7</div>
    <h1>M7 Movelaria</h1>
    <p class="sub">Marcenaria de alto padrão sob medida</p>
    <div class="pills">
      <p class="pill${status.open ? " on" : ""}"><span class="dot"></span><b>${status.state}</b> · ${status.detail}</p>
      <p class="pill"><span class="pi">${icon("pin", 13)}</span>São José dos Pinhais, Curitiba e região</p>
    </div>
  </header>

  <a class="cta" href="${wa(
    "Olá M7 Movelaria! Vim pelo Instagram e gostaria de um orçamento de móveis planejados.",
  )}" target="_blank" rel="noopener">
    <span class="ic">${icon("whats", 22)}</span>
    <span>
      <span class="lb">Pedir orçamento no WhatsApp</span>
      <span class="hn">${status.ctaHint}</span>
    </span>
  </a>
${sections}

  <p class="trust">
    Ferragens <b>Blum</b>, <b>Häfele</b> e <b>Salice</b><br>
    Projeto, produção no ateliê e instalação com equipe própria
  </p>

  <footer class="foot">
    <div class="hr"></div>
    <a href="${SITE_URL}/?${UTM}">www.m7movelaria.com.br</a>
  </footer>
</main>
</body>
</html>`;
}

export const Route = createFileRoute("/links")({
  server: {
    handlers: {
      GET: async () =>
        new Response(render(), {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            // Curto de propósito: o "aberto agora" é calculado por requisição e
            // um s-maxage de uma hora deixaria o status errado por até uma hora.
            // 5 min ainda entrega ~toda a página pela CDN.
            "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=300",
          },
        }),
    },
  },
});
