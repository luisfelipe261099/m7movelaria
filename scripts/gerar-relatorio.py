"""Gera o relatório técnico da migração e otimização do site M7 Movelaria.

Uso:  pip install reportlab && python3 scripts/gerar-relatorio.py

O PDF versionado fica em docs/relatorio-migracao-e-otimizacao.pdf. Todos os
números do relatório foram medidos e estão documentados no Anexo B do próprio
documento — ao atualizar qualquer um deles, atualize também a data de geração
no fim do arquivo.
"""

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

# Caminho de saída relativo à raiz do repositório.
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "docs", "img")
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   "docs", "relatorio-migracao-e-otimizacao.pdf")

BRONZE = colors.HexColor("#93603D")
BRONZE_SOFT = colors.HexColor("#B3814F")
INK = colors.HexColor("#2B2723")
GRAY = colors.HexColor("#5C564E")
LIGHT = colors.HexColor("#E7E0D6")
CREAM = colors.HexColor("#FAF6F0")
GREEN = colors.HexColor("#2F6B4F")
RED = colors.HexColor("#9B3B2F")

PAGE_W, PAGE_H = A4
MARGIN = 20 * mm

ss = getSampleStyleSheet()


def P(name, **kw):
    base = dict(
        name=name,
        fontName="Helvetica",
        fontSize=9.5,
        leading=14.5,
        textColor=INK,
        spaceAfter=6,
    )
    base.update(kw)
    return ParagraphStyle(**base)


S = {
    "title": P("title", fontName="Helvetica-Bold", fontSize=30, leading=34, textColor=INK, spaceAfter=0),
    "subtitle": P("subtitle", fontSize=13, leading=19, textColor=GRAY, spaceAfter=0),
    "capa_label": P("capa_label", fontName="Helvetica-Bold", fontSize=7.5, leading=11, textColor=BRONZE),
    "capa_val": P("capa_val", fontSize=9.5, leading=14, textColor=INK),
    "h1": P("h1", fontName="Helvetica-Bold", fontSize=17, leading=21, textColor=INK, spaceBefore=2, spaceAfter=3),
    "h1num": P("h1num", fontName="Helvetica-Bold", fontSize=17, leading=21, textColor=BRONZE),
    "h2": P("h2", fontName="Helvetica-Bold", fontSize=11.5, leading=15, textColor=INK, spaceBefore=13, spaceAfter=4),
    "h3": P("h3", fontName="Helvetica-Bold", fontSize=9.5, leading=13, textColor=BRONZE, spaceBefore=9, spaceAfter=3),
    "body": P("body", alignment=TA_JUSTIFY),
    "lead": P("lead", fontSize=11, leading=17, textColor=GRAY, alignment=TA_JUSTIFY, spaceAfter=9),
    "li": P("li", alignment=TA_JUSTIFY, leftIndent=11, bulletIndent=1, spaceAfter=4),
    "small": P("small", fontSize=8, leading=12, textColor=GRAY),
    "cell": P("cell", fontSize=8.5, leading=12),
    "cellb": P("cellb", fontName="Helvetica-Bold", fontSize=8.5, leading=12),
    "cellh": P("cellh", fontName="Helvetica-Bold", fontSize=7.5, leading=10, textColor=colors.white),
    "code": P("code", fontName="Courier", fontSize=7.6, leading=10.5, textColor=INK),
    "quote": P("quote", fontSize=9, leading=13.5, textColor=GRAY, leftIndent=9),
}

story = []


# ---------------------------------------------------------------- helpers
def h1(num, text):
    t = Table(
        [[Paragraph(num, S["h1num"]), Paragraph(text, S["h1"])]],
        colWidths=[13 * mm, None],
    )
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(Spacer(1, 4))
    story.append(t)
    story.append(rule(BRONZE, 1.1, 5))
    story.append(Spacer(1, 7))


def rule(color=LIGHT, w=0.7, space=3):
    t = Table([[""]], colWidths=[PAGE_W - 2 * MARGIN], rowHeights=[space])
    t.setStyle(TableStyle([("LINEABOVE", (0, 0), (-1, 0), w, color)]))
    return t


def h2(text):
    story.append(Paragraph(text, S["h2"]))


def h3(text):
    story.append(Paragraph(text, S["h3"]))


def para(text, style="body"):
    story.append(Paragraph(text, S[style]))


def bullets(items, style="li"):
    for it in items:
        story.append(Paragraph(it, S[style], bulletText="•"))
    story.append(Spacer(1, 3))


def table(rows, widths, header=True, align=None, zebra=True, font_size=8.5):
    data = []
    for r_i, row in enumerate(rows):
        out = []
        for c_i, cell in enumerate(row):
            if isinstance(cell, Paragraph):
                out.append(cell)
            else:
                st = "cellh" if (header and r_i == 0) else "cell"
                out.append(Paragraph(str(cell), S[st]))
        data.append(out)
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0, hAlign="LEFT")
    style = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, LIGHT),
    ]
    if header:
        style += [
            ("BACKGROUND", (0, 0), (-1, 0), INK),
            ("LINEBELOW", (0, 0), (-1, 0), 0, colors.white),
        ]
        if zebra:
            for i in range(2, len(data), 2):
                style.append(("BACKGROUND", (0, i), (-1, i), CREAM))
    if align:
        for col, a in align.items():
            style.append(("ALIGN", (col, 0), (col, -1), a))
    t.setStyle(TableStyle(style))
    story.append(t)
    story.append(Spacer(1, 8))


def callout(title, text, color=BRONZE, bg=CREAM):
    inner = [
        [Paragraph(f"<b>{title}</b>", P("ct", fontName="Helvetica-Bold", fontSize=9, leading=13, textColor=color))],
        [Paragraph(text, P("cb", fontSize=8.8, leading=13, textColor=INK, alignment=TA_JUSTIFY))],
    ]
    t = Table(inner, colWidths=[PAGE_W - 2 * MARGIN - 8 * mm], hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LINEBEFORE", (0, 0), (0, -1), 2.2, color),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (0, 0), 8),
        ("BOTTOMPADDING", (0, 0), (0, 0), 2),
        ("TOPPADDING", (0, 1), (0, 1), 0),
        ("BOTTOMPADDING", (0, 1), (0, 1), 8),
    ]))
    story.append(KeepTogether([t, Spacer(1, 9)]))


def code(lines):
    # Escapa o markup: os blocos de código contêm HTML literal que o parser de
    # parágrafo do reportlab tentaria interpretar como formatação.
    esc = [l.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;") for l in lines]
    body = "<br/>".join(esc)
    t = Table([[Paragraph(body, S["code"])]], colWidths=[PAGE_W - 2 * MARGIN - 8 * mm], hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F4F1EC")),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("BOX", (0, 0), (-1, -1), 0.4, LIGHT),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))


def img_compare(left, right, cap_left, cap_right, h=52 * mm):
    """Duas capturas lado a lado, com legenda embaixo de cada uma."""
    w = (PAGE_W - 2 * MARGIN) / 2 - 4 * mm
    cells = []
    for path, cap, col in ((left, cap_left, RED), (right, cap_right, GREEN)):
        inner = Table(
            [[Image(path, width=w, height=h, kind="proportional")],
             [Paragraph(cap, P("ic", fontName="Helvetica-Bold", fontSize=7.6, leading=11,
                               textColor=col, alignment=TA_CENTER))]],
            colWidths=[w],
        )
        inner.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("BOX", (0, 0), (0, 0), 0.5, LIGHT),
            ("TOPPADDING", (0, 0), (-1, 0), 0),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 4),
            ("TOPPADDING", (0, 1), (-1, 1), 0),
            ("BOTTOMPADDING", (0, 1), (-1, 1), 0),
        ]))
        cells.append(inner)
    t = Table([cells], colWidths=[(PAGE_W - 2 * MARGIN) / 2] * 2, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))


def kpi_row(items):
    """items = [(valor, rótulo, cor)]"""
    cells = []
    for val, label, col in items:
        inner = Table(
            [[Paragraph(val, P("kv", fontName="Helvetica-Bold", fontSize=19, leading=22, textColor=col, alignment=TA_CENTER))],
             [Paragraph(label, P("kl", fontSize=7.4, leading=10, textColor=GRAY, alignment=TA_CENTER))]],
            colWidths=[(PAGE_W - 2 * MARGIN) / len(items) - 4],
        )
        inner.setStyle(TableStyle([
            ("TOPPADDING", (0, 0), (-1, 0), 10),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 1),
            ("TOPPADDING", (0, 1), (-1, 1), 0),
            ("BOTTOMPADDING", (0, 1), (-1, 1), 10),
            ("BACKGROUND", (0, 0), (-1, -1), CREAM),
            ("LINEABOVE", (0, 0), (-1, 0), 2, col),
        ]))
        cells.append(inner)
    t = Table([cells], colWidths=[(PAGE_W - 2 * MARGIN) / len(items)] * len(items))
    t.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(t)
    story.append(Spacer(1, 11))


# ============================================================== CAPA
story.append(Spacer(1, 34 * mm))
story.append(Paragraph("M7 MOVELARIA", P("brand", fontName="Helvetica-Bold", fontSize=9, leading=13,
                                         textColor=BRONZE, spaceAfter=0)))
story.append(Paragraph("Relatório técnico de migração e otimização", P("cap_sub", fontSize=9, leading=13,
                                                                       textColor=GRAY, spaceAfter=16)))
story.append(Paragraph("Do Lovable ao site<br/>pronto para indexação", S["title"]))
story.append(Spacer(1, 9))
story.append(rule(BRONZE, 2, 6))
story.append(Spacer(1, 9))
story.append(Paragraph(
    "Documentação completa das correções, otimizações e mudanças de infraestrutura "
    "aplicadas ao site institucional da M7 Movelaria, com os números medidos antes e depois.",
    S["subtitle"]))

story.append(Spacer(1, 26 * mm))
meta_rows = [
    ["CLIENTE", "M7 Movelaria — Móveis planejados sob medida"],
    ["ENDEREÇO", "R. Henrique Bortolam, 182 - Costeira — São José dos Pinhais / PR"],
    ["SITE", "https://www.m7movelaria.com.br"],
    ["PERÍODO", "13 de agosto a 20 de agosto de 2026"],
    ["ESCOPO", "Migração de plataforma, SEO técnico e de conteúdo, performance, acessibilidade e conformidade"],
    ["VERSÃO EM PRODUÇÃO", "commit 4aabdf7 — publicado em 20/08/2026"],
]
mt = Table([[Paragraph(a, S["capa_label"]), Paragraph(b, S["capa_val"])] for a, b in meta_rows],
           colWidths=[42 * mm, None], hAlign="LEFT")
mt.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ("LINEBELOW", (0, 0), (-1, -2), 0.4, LIGHT),
]))
story.append(mt)

story.append(Spacer(1, 14 * mm))
story.append(Paragraph(
    "Todos os números deste relatório foram medidos com ferramentas públicas e são reproduzíveis. "
    "A metodologia está descrita no Anexo B.", S["small"]))

story.append(NextPageTemplate("miolo"))
story.append(PageBreak())


# ============================================================== SUMÁRIO EXECUTIVO
h1("", "Sumário executivo")

para(
    "O site da M7 Movelaria foi originalmente gerado dentro do Lovable, uma plataforma de criação "
    "assistida por IA. Ele funcionava como demonstração, mas não como um site de negócio: dependia "
    "da infraestrutura do Lovable para funcionar, dizia ao Google que a versão oficial do conteúdo "
    "estava em um endereço da plataforma, e não tinha páginas para as buscas que trazem cliente "
    "para uma marcenaria.", "lead")

para(
    "Este documento registra o que foi feito entre 13 e 20 de agosto de 2026: a saída da plataforma, "
    "a reconstrução da base técnica de SEO, a criação do conteúdo que faltava e a otimização de "
    "performance — com os números medidos em cada etapa.", "lead")

story.append(Spacer(1, 4))
kpi_row([
    ("4 &#8594; 21", "páginas indexáveis pelo Google", BRONZE),
    ("-97%", "peso da página inicial (11,3 MB &#8594; 304 KB)", GREEN),
    ("80 &#8594; 93", "nota de performance (Lighthouse)", GREEN),
])
kpi_row([
    ("95 &#8594; 100", "acessibilidade", GREEN),
    ("96 &#8594; 100", "boas práticas", GREEN),
    ("0", "dependências do Lovable restantes", BRONZE),
])

h2("Os seis pontos que mais importam")

bullets([
    "<b>No celular, o site não tinha menu, telefone clicável nem botão de orçamento.</b> "
    "Os três elementos estavam programados para aparecer só em tela grande, e não havia botão de "
    "menu em lugar nenhum. Como a maior parte da busca local acontece pelo telefone, cada visita "
    "nessas condições era um orçamento que não chegou.",

    "<b>O site saiu da plataforma e passou a ser um ativo do cliente.</b> Antes, o vídeo da página "
    "inicial era carregado de um endereço interno do Lovable; fora da plataforma, ele simplesmente "
    "não existia. Hoje todo o site roda em infraestrutura própria (GitHub + Vercel), sem nenhuma "
    "dependência da ferramenta que o originou.",

    "<b>O site parou de entregar o próprio conteúdo para um domínio de terceiro.</b> Todas as "
    "páginas declaravam ao Google que o endereço oficial do conteúdo era "
    "<font face='Courier' size='8'>project-envy-studio.lovable.app</font>. Na prática, o site "
    "trabalhava para posicionar o endereço da plataforma, não o da M7.",

    "<b>De 4 para 21 páginas indexáveis.</b> Não existia uma única página dedicada a "
    "“cozinha planejada”, “closet planejado” ou “móveis planejados em "
    "Curitiba”. Sem página, não há o que o Google ranquear. Foram criadas 6 páginas de serviço, "
    "6 páginas por cidade, FAQ, Sobre e Política de Privacidade.",

    "<b>A página inicial ficou 97% mais leve.</b> De aproximadamente 11,3 MB para 304 KB, sem perder "
    "nenhum elemento visual — o vídeo, as fotos e o tour 360° continuam lá.",

    "<b>Riscos jurídicos e de diretriz foram removidos.</b> O site exibia uma nota “4,9” "
    "e a expressão “há 2 meses” simulando avaliações do Google que não existem, e "
    "apresentava imagens de render como obras entregues. Ambos foram corrigidos.",
])

callout(
    "Sobre a honestidade dos números",
    "Este relatório não afirma nada que não possa ser conferido. As comparações de performance foram "
    "feitas reconstruindo a versão original do site a partir do histórico do projeto e medindo as duas "
    "versões na mesma máquina, com a mesma ferramenta e no mesmo dia. Onde um número depende de "
    "condição externa (rede, servidor do Google), isso está dito explicitamente.")

story.append(PageBreak())


# ============================================================== 1
h1("1", "Ponto de partida: o que era o site no Lovable")

para(
    "A versão original está preservada no histórico do projeto (commit "
    "<font face='Courier' size='8'>c31d46e</font>, 13/08/2026). Ela foi reconstruída e executada "
    "para este relatório, o que permite afirmar com precisão o que o site fazia — e o que não fazia.")

callout(
    "Uma observação justa antes da lista",
    "Ferramentas de geração assistida por IA como o Lovable fazem bem aquilo a que se propõem: "
    "transformar uma ideia em um protótipo visual navegável em pouco tempo, por pouco dinheiro. "
    "O resultado <i>parece</i> um site pronto — e é justamente por parecer que a diferença passa "
    "despercebida. O que uma ferramenta de prototipagem não entrega, e nunca prometeu entregar, é "
    "um ativo de negócio: endereço próprio consolidado, páginas para as buscas do mercado, "
    "funcionamento no celular, conformidade legal e independência da plataforma. "
    "As páginas a seguir medem exatamente essa distância. Prototipar barato foi uma decisão "
    "acertada; o erro seria confundir o protótipo com o produto final.")

h2("1.1  No celular, o site não tinha navegação nem botão de orçamento")

para(
    "Este é, de longe, o achado de maior impacto comercial — e o mais fácil de qualquer pessoa "
    "conferir: bastava abrir o site no telefone.")

para(
    "No código do cabeçalho original, três elementos essenciais estavam condicionados a telas "
    "grandes, e não havia nenhuma alternativa para telas pequenas:")

code([
    '<nav className="hidden lg:flex ...">        // menu: some abaixo de 1024px',
    '<a ... className="hidden md:inline-flex">   // botao "Solicitar Orcamento": some abaixo de 768px',
    '<span className="hidden md:flex ...">       // telefone: some abaixo de 768px',
])

para(
    "Não existia botão de menu (“hambúrguer”) em lugar nenhum do projeto — a busca por "
    "<font face='Courier' size='8'>menu</font> ou <font face='Courier' size='8'>hamburg</font> no "
    "código original retorna zero ocorrências. Ou seja, o menu não ficava escondido atrás de um "
    "botão: ele simplesmente deixava de existir.")

para(
    "Medição automatizada em tela de 390 px de largura (um iPhone comum), contando os elementos "
    "efetivamente visíveis no cabeçalho:")

table(
    [["Elemento no cabeçalho", "Original", "Hoje"],
     ["Links de navegação visíveis", "0", "Menu completo atrás do botão"],
     ["Botão de menu", "0 — não existia", "1"],
     ["Botão “Solicitar Orçamento”", "0", "Presente no menu"],
     ["Telefone visível", "0", "Presente no menu"],
     ["Telefone clicável (<font face='Courier' size='8'>tel:</font>)", "0 em todo o site", "5 links"]],
    widths=[62 * mm, 40 * mm, None])

para(
    "O que sobrava no celular era o endereço e o logotipo. Nada mais:")

img_compare(os.path.join(IMG, "celular-antes.png"), os.path.join(IMG, "celular-depois.png"),
            "ANTES — sem menu, sem telefone, sem botão", "DEPOIS — menu acessível no botão")

callout(
    "Por que isso custa dinheiro, não só posição no Google",
    "Marcenaria é um negócio em que o contato acontece por telefone e WhatsApp, e a maior parte do "
    "tráfego de busca local vem de celular. Um visitante que chegava pelo telefone não tinha como "
    "navegar para os projetos, não via o botão de orçamento e não conseguia tocar no número para "
    "ligar. Cada visita nessas condições é um orçamento que não foi pedido — e isso vinha "
    "acontecendo desde a publicação.",
    color=RED, bg=colors.HexColor("#FBF1EF"))

h2("1.2  O site dependia do Lovable para funcionar")

para(
    "O vídeo da página inicial não era um arquivo do projeto. Era uma referência a um endereço "
    "interno da plataforma:")

code([
    "src/assets/hero-showroom.mp4.asset.json",
    "{",
    '  "url": "/__l5e/assets-v1/98bb4a50-9443-4bf7-aa0f-52412a97846f/hero-showroom.mp4",',
    '  "size": 11245821',
    "}",
])

para(
    "Ao executar a versão original fora do Lovable, o navegador registra o erro esperado: "
    "<font face='Courier' size='8'>404</font> nesse endereço. Ou seja, o site entregue ao cliente "
    "não conseguia exibir o próprio vídeo institucional fora da plataforma onde foi criado. "
    "O arquivo tinha 11.245.821 bytes — <b>11,2 MB</b> em uma única peça da página inicial.")

h2("1.3  O site declarava que o conteúdo era de outro endereço")

para(
    "Toda página web informa ao Google qual é o endereço oficial do seu conteúdo, através da tag "
    "<i>canonical</i>. No site original, todas as rotas declaravam:")

code([
    '<html lang="en">',
    '<link rel="canonical" href="https://project-envy-studio.lovable.app/">',
    '<meta property="og:url" content="https://project-envy-studio.lovable.app/">',
    "",
    "public/robots.txt",
    "Sitemap: https://project-envy-studio.lovable.app/sitemap.xml",
])

para(
    "Três problemas em cinco linhas. Primeiro, o idioma declarado era inglês "
    "(<font face='Courier' size='8'>lang=\"en\"</font>) em um site inteiramente em português — o que "
    "atrapalha a interpretação do conteúdo e a exibição em resultados regionais. Segundo, o "
    "<i>canonical</i> e o <i>og:url</i> apontavam para o subdomínio de preview da plataforma. "
    "Terceiro, o arquivo que orienta os robôs de busca indicava o mapa do site no mesmo endereço "
    "de terceiro.")

callout(
    "O efeito prático disso",
    "Todo esforço de divulgação — link compartilhado no WhatsApp, no Instagram, em um anúncio — "
    "acumulava reputação para o endereço da plataforma, e não para o da M7. Quando o domínio próprio "
    "entrasse no ar, ele começaria do zero, e o Google poderia inclusive tratá-lo como cópia.",
    color=RED, bg=colors.HexColor("#FBF1EF"))

h2("1.4  Havia rotas técnicas da plataforma abertas ao público")

para(
    "O plugin do Lovable gerava automaticamente 12 arquivos no projeto, incluindo quatro rotas "
    "públicas de integração. Uma delas respondia normalmente a qualquer visitante:")

code([
    "GET /.mcp/list-tools  ->  200 OK",
    '{"server":{"name":"m7-movelaria-mcp","version":"0.1.0",',
    ' "title":"M7 Movelaria Showroom"},"tools":[{"name":"list_projects",',
    ' "description":"List all M7 Movelaria showcase projects with client,',
    '  architect, and ambient count."} ...]}',
])

para(
    "Não é uma falha de segurança grave — as ferramentas eram apenas de leitura do próprio catálogo. "
    "Mas é superfície pública desnecessária, mantida por uma ferramenta que o cliente não usa, em um "
    "site institucional. Junto com ela vinha um módulo de telemetria "
    "(<font face='Courier' size='8'>lovable-error-reporting.ts</font>) que enviava dados de erro "
    "para a plataforma.")

h2("1.5  Avaliações do Google fabricadas, com o logotipo da marca")

para(
    "O site exibia um bloco de depoimentos montado para parecer um resumo de avaliações reais do "
    "Google. Não era uma imprecisão de texto: era um widget completo, construído peça por peça.")

table(
    [["Elemento exibido", "O que era de fato"],
     ["Logotipo “G” do Google ao lado do título e de cada nome",
      "Reproduzido à mão em SVG, com as quatro cores exatas da marca (#EA4335, #4285F4, #FBBC05, #34A853)"],
     ["Nota <b>4,9</b> seguida de cinco estrelas preenchidas",
      "Número inventado. A empresa não tinha avaliações publicadas"],
     ["O texto “· Avaliações Google”", "Atribuição direta a uma fonte que não existia"],
     ["“há 2 meses” em cada depoimento", "Data fixa no código, idêntica em todos os cartões"],
     ["Foto de rosto em cada depoimento",
      "Seis imagens de banco de imagens (avatar-1 a avatar-6), pessoas que não são clientes"],
     ["Nomes e textos dos depoimentos", "Gerados pela IA, não fornecidos por clientes"]],
    widths=[62 * mm, None])

callout(
    "Por que isso é sério",
    "Somados, esses elementos afirmam ao visitante que a M7 tem nota 4,9 no Google, com avaliações "
    "recentes de seis pessoas identificadas por foto e nome. Nenhuma dessas afirmações era "
    "verdadeira. Isso configura publicidade enganosa pelo art. 37 do Código de Defesa do Consumidor, "
    "usa marca registrada de terceiro (o logotipo do Google) para dar credibilidade a informação "
    "falsa, e viola diretriz explícita do próprio Google sobre dados de avaliação. "
    "O risco não é hipotético: é o tipo de coisa que um concorrente denuncia ou um cliente "
    "insatisfeito leva ao Procon. Todo o bloco foi removido.",
    color=RED, bg=colors.HexColor("#FBF1EF"))

h2("1.6  O portfólio se contradizia")

para(
    "A seção de portfólio da página inicial tinha cinco cartões, mas apenas quatro imagens "
    "distintas — e as legendas não correspondiam ao que as imagens mostravam:")

code([
    "const portfolio = [",
    '  { img: heroLiving,    alt: "Cozinha planejada" },      // <- sala de estar',
    '  { img: projectCloset, alt: "Home theater sob medida" },// <- closet',
    '  { img: projectKitchen, alt: "Cozinha compacta" },',
    '  { img: projectOffice, alt: "Escritorio planejado" },',
    '  { img: heroLiving,    alt: "Dormitorio planejado" },   // <- MESMA imagem da primeira',
    "];",
])

para(
    "A mesma fotografia aparecia duas vezes no mesmo bloco: uma legendada como "
    "<b>“Cozinha planejada”</b> e outra como <b>“Dormitório planejado”</b>. Uma imagem de closet "
    "estava legendada como <b>“Home theater sob medida”</b>.")

para(
    "Para uma marcenaria, cujo portfólio é o principal argumento de venda, mostrar a mesma foto "
    "como dois ambientes diferentes é um problema de credibilidade com o cliente final antes de ser "
    "um problema de SEO. As legendas erradas também prejudicam quem usa leitor de tela e a "
    "indexação no Google Imagens.")

h2("1.7  Outros problemas técnicos encontrados")

table(
    [["Item", "Situação no original"],
     ["Endereço oficial da página de projeto (<font face='Courier' size='8'>/projetos/[id]</font>)",
      "Sem tag <i>canonical</i> — a única rota do site sem ela"],
     ["Dimensões declaradas nas imagens", "Nenhuma das 5 imagens da home declarava largura e altura"],
     ["Links de redes sociais no cabeçalho",
      "Instagram e Facebook apontando para <font face='Courier' size='8'>href=\"#\"</font> — dois links mortos, "
      "visíveis para o visitante"],
     ["Cabeçalhos de segurança HTTP", "Nenhum configurado"],
     ["Fonte tipográfica", "Carregada do Google Fonts, bloqueando a primeira exibição da página"],
     ["Padrão de formatação do código", "12 arquivos fora do padrão, 117 apontamentos do verificador"],
     ["Arquivos gerados pela plataforma", "12 arquivos, incluindo 4 rotas públicas e um módulo de telemetria"]],
    widths=[62 * mm, None])

h2("1.8  Nota do site original nas ferramentas do Google")

para(
    "Medição do site original, reconstruído e executado localmente (Lighthouse, perfil celular):")

table(
    [["Categoria", "Nota", "O que estava reprovando"],
     ["Performance", "80", "Índice de velocidade alto; imagens em formato antigo"],
     ["Acessibilidade", "95", "Contraste insuficiente: 3,93:1 (mínimo exigido: 4,5:1)"],
     ["Boas práticas", "96", "Erros no console do navegador"],
     ["SEO", "100", "—"]],
    widths=[34 * mm, 18 * mm, None],
    align={1: "CENTER"})

para(
    "Vale um esclarecimento honesto: a nota de SEO do Lighthouse já era 100 no site original, e "
    "continua 100 hoje. Essa categoria verifica apenas requisitos mecânicos — se existe título, se "
    "existe descrição, se o texto é legível. Ela <b>não</b> avalia se o site tem páginas para as "
    "buscas do seu mercado, se o conteúdo é suficiente, ou se o endereço declarado é o certo. "
    "Era exatamente aí que estavam os problemas reais.", "body")

story.append(PageBreak())


# ============================================================== 2
h1("2", "Migração para infraestrutura própria")

para(
    "A primeira etapa foi tornar o site independente da plataforma onde nasceu, sem perder nenhuma "
    "funcionalidade.")

table(
    [["O que foi feito", "Resultado"],
     ["Remoção do plugin <font face='Courier' size='8'>@lovable.dev/mcp-js</font> e dos 12 arquivos gerados por ele",
      "Quatro rotas públicas de integração deixaram de existir"],
     ["Remoção do módulo de telemetria da plataforma",
      "O site não envia mais dados para terceiros"],
     ["Remoção do selo (“badge”) da plataforma",
      "Site sem marca de ferramenta de terceiro"],
     ["Vídeo do hero trazido para dentro do projeto e recomprimido",
      "De 11,2 MB hospedados no Lovable para 807 KB no próprio site — <b>93% menor</b>"],
     ["Fontes tipográficas trazidas para o próprio servidor",
      "Elimina requisição bloqueante ao Google Fonts (cerca de 800 ms de atraso na primeira exibição)"],
     ["Repositório próprio no GitHub e publicação automática na Vercel",
      "Cada alteração aprovada vai ao ar sozinha, com histórico completo e possibilidade de reverter"]],
    widths=[78 * mm, None])

callout(
    "O que isso significa para o cliente",
    "O site deixou de ser uma demonstração hospedada dentro de uma ferramenta e passou a ser um ativo "
    "da empresa: o código está em um repositório do cliente, o conteúdo está em arquivos versionados, "
    "e qualquer profissional de tecnologia consegue assumir a manutenção sem depender de conta, "
    "licença ou assinatura da plataforma original.")

h2("2.1  Qualidade da base de código")

para(
    "Antes de qualquer otimização, o projeto tinha <b>117 erros</b> apontados pelo verificador "
    "automático de código. Todos foram corrigidos, e o padrão de formatação foi fixado para que o "
    "problema não volte. Hoje o projeto passa sem nenhum erro, e as únicas 7 advertências restantes "
    "estão em componentes de biblioteca que nenhuma tela usa.")

story.append(PageBreak())


# ============================================================== 3
h1("3", "SEO: a base técnica reconstruída")

para(
    "Com o site independente, a segunda etapa foi refazer tudo o que determina como o Google enxerga "
    "cada página.")

h2("3.1  Endereço oficial e mapa do site")

table(
    [["Item", "Antes", "Depois"],
     ["Endereço declarado (canonical)", "project-envy-studio.lovable.app", "www.m7movelaria.com.br"],
     ["Idioma declarado", "en (inglês)", "pt-BR"],
     ["robots.txt", "Apontava para a plataforma", "Gerado a partir do domínio real"],
     ["Mapa do site (sitemap)", "4 URLs, sem data de atualização", "21 URLs, com data e com imagens"],
     ["Endereço com maiúscula (<font face='Courier' size='8'>/Contato</font>)", "Respondia 200 (página duplicada)", "Redireciona permanente (308)"],
     ["Endereço com barra final (<font face='Courier' size='8'>/contato/</font>)", "Redirecionamento temporário (307)", "Redirecionamento permanente (308)"],
     ["Endereço de teste da Vercel", "Indexável, competindo com o site", "Marcado como não indexável"]],
    widths=[52 * mm, 55 * mm, None])

callout(
    "Por que “www” e não o domínio sem prefixo",
    "Ao verificar o site publicado, foi constatado que o domínio principal configurado é "
    "<font face='Courier' size='8'>www.m7movelaria.com.br</font>, e que o endereço sem o prefixo "
    "redireciona para ele. O endereço oficial declarado ao Google precisa ser aquele que responde "
    "diretamente — caso contrário, cada página faz o buscador dar um salto a mais. "
    "Esse detalhe foi corrigido antes da publicação.")

h2("3.2  Verificação no Google Search Console")

para(
    "O site já está preparado para ser verificado no Google Search Console. Basta inserir o código "
    "fornecido pelo Google em uma variável de ambiente no painel da Vercel "
    "(<font face='Courier' size='8'>VITE_GOOGLE_SITE_VERIFICATION</font>) — sem necessidade de "
    "alterar código. Esse é o passo que permite enviar o mapa do site e acompanhar a indexação.")

story.append(PageBreak())


# ============================================================== 4
h1("4", "Conteúdo: de 4 para 21 páginas")

para(
    "Este é o item de maior impacto no objetivo de aparecer nas buscas — e o que não existia de forma "
    "alguma no site original.")

h2("4.1  O diagnóstico")

para(
    "O site tinha quatro endereços indexáveis: início, projetos, showroom 3D e contato. Os cinco "
    "serviços da empresa apareciam apenas como cartões com uma frase cada, sem página própria. "
    "Na prática, quando alguém em Curitiba pesquisa “cozinha planejada”, o Google não "
    "tinha nenhuma página da M7 para mostrar — só a página inicial, que fala de tudo um pouco e "
    "por isso não é forte em nada.")

h2("4.2  As páginas criadas")

table(
    [["Endereço", "Alvo de busca"],
     ["/moveis-planejados", "Página central dos serviços"],
     ["/moveis-planejados/cozinhas-planejadas", "cozinha planejada, cozinha sob medida"],
     ["/moveis-planejados/dormitorios-planejados", "dormitório planejado, guarda-roupa planejado"],
     ["/moveis-planejados/closets-planejados", "closet planejado"],
     ["/moveis-planejados/home-office-planejado", "home office planejado, escritório sob medida"],
     ["/moveis-planejados/moveis-comerciais", "móveis planejados comerciais, marcenaria para loja"],
     ["/moveis-planejados/home-theater-e-painel-de-tv", "painel de TV planejado, home theater"],
     ["/moveis-planejados-em/sao-jose-dos-pinhais", "móveis planejados São José dos Pinhais"],
     ["/moveis-planejados-em/curitiba", "móveis planejados Curitiba"],
     ["/moveis-planejados-em/pinhais", "móveis planejados Pinhais"],
     ["/moveis-planejados-em/araucaria", "móveis planejados Araucária"],
     ["/moveis-planejados-em/colombo", "móveis planejados Colombo"],
     ["/moveis-planejados-em/fazenda-rio-grande", "móveis planejados Fazenda Rio Grande"],
     ["/perguntas-frequentes", "quanto custa, quanto tempo demora, MDF ou maciça"],
     ["/sobre", "quem é a empresa, como funciona o processo"],
     ["/politica-de-privacidade", "conformidade com a LGPD"]],
    widths=[82 * mm, None])

para(
    "São <b>8.313 palavras</b> de conteúdo novo, escritas especificamente para responder às dúvidas "
    "que uma pessoa tem antes de pedir orçamento de marcenaria.")

h2("4.3  O cuidado que evitou uma penalização")

callout(
    "Páginas por cidade são um risco quando feitas errado",
    "A prática comum no mercado é duplicar a mesma página trocando o nome da cidade. O Google chama "
    "isso de <i>doorway page</i> e trata como spam — a punição não atinge só aquelas páginas, atinge "
    "o site inteiro. Por isso cada página de cidade deste site tem conteúdo próprio: contexto urbano "
    "real, bairros existentes, o tipo de imóvel que predomina e o que isso muda no projeto de "
    "marcenaria. Nenhuma frase é reaproveitada entre elas.")

h2("4.4  Regra de conteúdo aplicada")

para(
    "Nenhum texto novo afirma dado que a M7 não confirmou: não há preço, prazo em dias, tempo de "
    "mercado, número de obras ou percentual de garantia inventado. Onde o número depende do projeto, "
    "o texto explica <i>como</i> o preço e o prazo se formam e encaminha para o orçamento. "
    "Isso é honesto com o cliente final e, para o Google, é conteúdo melhor do que um número "
    "inventado, porque responde de fato à intenção da busca.")

h2("4.5  Ligação entre as páginas")

para(
    "O menu antigo era quase todo composto por âncoras que rolavam a própria página inicial "
    "(<font face='Courier' size='8'>#sobre</font>, <font face='Courier' size='8'>#servicos</font>). "
    "Âncora não é endereço indexável — nenhuma página interna recebia link de navegação. Hoje o menu "
    "aponta para páginas reais e o rodapé fecha a malha: de qualquer ponto do site, todos os serviços "
    "e todas as cidades estão a um clique.")

story.append(PageBreak())


# ============================================================== 5
h1("5", "Dados estruturados: como o Google entende o negócio")

para(
    "Dados estruturados são um bloco invisível ao visitante que descreve o negócio em linguagem que o "
    "buscador entende: que tipo de empresa é, onde fica, que horas abre, que serviços oferece. É o "
    "que habilita os resultados enriquecidos — o painel lateral, o horário de funcionamento na busca, "
    "as perguntas expansíveis.")

h2("5.1  O problema encontrado")

para(
    "O site declarava <b>duas entidades diferentes</b> para a mesma empresa: um bloco "
    "<font face='Courier' size='8'>Organization</font> na estrutura geral e outro "
    "<font face='Courier' size='8'>FurnitureStore</font> na página inicial, nenhum com identificador. "
    "Para o Google, eram duas empresas distintas com o mesmo nome — o que dilui os sinais em vez de "
    "concentrá-los.")

h2("5.2  O que existe hoje")

table(
    [["Bloco", "Função", "Onde"],
     ["LocalBusiness / FurnitureStore", "Empresa, endereço, telefone, horários, cidades atendidas, serviços oferecidos", "Todas as páginas, declarado uma única vez"],
     ["WebSite", "Identidade do site e sua editora", "Todas as páginas"],
     ["WebPage", "Identidade de cada página", "Todas as páginas"],
     ["BreadcrumbList", "Trilha de navegação exibida na busca", "Páginas internas"],
     ["Service", "Cada serviço, com a área atendida", "Páginas de serviço e de cidade"],
     ["FAQPage", "Perguntas expansíveis no resultado de busca", "Início, FAQ, serviços e cidades"],
     ["ContactPage", "Página de contato", "/contato"],
     ["ImageObject", "Logotipo da empresa", "Todas as páginas"]],
    widths=[42 * mm, 68 * mm, None])

callout(
    "O que deliberadamente NÃO foi incluído",
    "Não foi adicionado bloco de avaliação (<font face='Courier' size='8'>AggregateRating</font>) — "
    "aquele que exibe as estrelinhas douradas no resultado de busca. Ele exigiria uma nota, e a M7 "
    "ainda não tem avaliações reais publicadas. Declarar uma nota sem avaliação verificável é "
    "violação explícita de diretriz do Google e sujeita o site a penalização manual. "
    "Assim que existirem avaliações reais no Perfil da Empresa, esse bloco pode ser ativado.")

story.append(PageBreak())


# ============================================================== 6
h1("6", "Performance: o site ficou 97% mais leve")

h2("6.1  O maior problema: o vídeo da página inicial")

para(
    "O vídeo institucional tinha 11,2 MB e começava a baixar junto com o HTML, disputando banda com "
    "o texto e as imagens que o visitante precisa ver primeiro. Em conexão móvel, isso significa uma "
    "página que demora a aparecer.")

table(
    [["Etapa", "Tamanho", "Comportamento"],
     ["Original (Lovable)", "11,2 MB", "Baixava sempre, hospedado fora do site"],
     ["Após recompressão", "807 KB", "Baixava sempre, agora no próprio site"],
     ["Hoje", "807 KB", "Só baixa se o bloco entrar na tela, após a página carregar, e nunca em economia de dados"]],
    widths=[42 * mm, 26 * mm, None])

para(
    "No celular, o vídeo fica abaixo da primeira dobra. Quem abre o site e não rola a tela "
    "simplesmente não baixa esses 807 KB.")

h2("6.2  Imagens")

table(
    [["Item", "Antes", "Depois", "Redução"],
     ["Fotos e renders (JPEG)", "9,7 MB", "540 KB em AVIF", "94%"],
     ["Panorâmicas do tour 360°", "7,0 MB", "3,0 MB em WebP", "57%"],
     ["Formatos servidos", "Apenas JPEG", "AVIF, WebP e JPEG", "—"],
     ["Tamanhos por imagem", "Um só (até 1600 px)", "Até três (480 / 960 / 1600 px)", "—"]],
    widths=[45 * mm, 32 * mm, 42 * mm, None],
    align={3: "CENTER"})

para(
    "Cada imagem passou a existir em três larguras e três formatos. O navegador escolhe sozinho a "
    "combinação certa para a tela do visitante. Verificado com navegador real: no computador, as "
    "imagens dos cartões baixam a versão de 480 px — onde antes baixavam a de 1600 px.")

h2("6.3  Código enviado ao navegador")

table(
    [["Item", "Antes", "Depois"],
     ["Folha de estilo (CSS)", "91 KB", "47 KB"],
     ["Biblioteca TanStack Query", "Carregada em todas as páginas", "Removida (não havia nenhuma consulta no projeto)"],
     ["Texto das páginas de serviço e cidade", "Entraria em todas as páginas", "Carregado só na página que o exibe"],
     ["Imagens pequenas", "Embutidas em base64 no HTML", "Arquivos separados, com cache próprio"],
     ["HTML transferido (página inicial)", "48,8 KB", "14,6 KB"]],
    widths=[58 * mm, 45 * mm, None])

callout(
    "Um problema encontrado durante a própria otimização",
    "Ao verificar o site publicado, foi identificado que a ferramenta de construção estava embutindo "
    "imagens pequenas como texto codificado dentro do próprio HTML — um único trecho chegava a 7,9 KB. "
    "O HTML da página inicial havia subido para 49 KB. Corrigido: o HTML voltou para 14,6 KB, menor "
    "do que era antes mesmo dessa otimização começar.")

h2("6.4  Outros ajustes de carregamento")

bullets([
    "A fonte principal passou a ser anunciada ao navegador por cabeçalho HTTP, o que a coloca à frente "
    "de centenas de KB de código na fila de download.",
    "A segunda fonte, usada apenas no logotipo e em alguns números decorativos, deixou de disputar "
    "prioridade — eram 36 KB de banda para trocar meia dúzia de palavras.",
    "As seções abaixo da dobra só são desenhadas quando se aproximam da tela.",
    "O HTML passou a ser guardado no cache da rede de distribuição da Vercel, com proteção para que "
    "páginas de erro nunca fiquem armazenadas.",
    "Foi identificado e corrigido um defeito de renderização: as imagens estavam sendo desenhadas no "
    "tamanho original e recortadas, em vez de redimensionadas.",
    "Foi identificado e corrigido que os títulos usavam negrito sintético — o navegador engrossava o "
    "desenho da letra por software porque a fonte não fora declarada na espessura correta.",
])

story.append(PageBreak())


# ============================================================== 7
h1("7", "Acessibilidade e conformidade")

para(
    "Acessibilidade não é só uma questão de inclusão: o Google usa sinais de experiência do usuário "
    "e, no Brasil, a Lei 13.146/2015 (Estatuto da Pessoa com Deficiência) estabelece obrigação de "
    "acessibilidade em sites.")

table(
    [["Item", "Antes", "Depois"],
     ["Contraste do tom bronze", "3,93:1 — reprovado", "4,69:1 em texto e 5,14:1 em botão — aprovado (WCAG AA)"],
     ["Contraste em fundo escuro", "3,57:1 — reprovado", "5,53:1 — aprovado"],
     ["Menu no celular", "Não abria", "Botão acessível, fecha com a tecla Esc"],
     ["Link para pular ao conteúdo", "Não existia", "Primeiro elemento navegável por teclado"],
     ["Telefone", "Texto simples", "Link clicável"],
     ["Links quebrados no rodapé", "Redes sociais apontando para lugar nenhum", "Removidos"],
     ["Tamanho de fonte", "Textos de 10 px", "Mínimo de 12 px"],
     ["Alvos de toque no rodapé", "Muito próximos entre si", "Altura adequada para o dedo"],
     ["Links dentro de parágrafos", "Distinguidos só pela cor", "Sublinhados"],
     ["Animações", "Sempre ativas", "Respeitam a preferência do sistema por menos movimento"],
     ["Vídeo", "Sem faixa de legendas", "Faixa declarada (vídeo sem áudio)"],
     ["Página de erro 404", "Em inglês, indexável", "Em português, fora do índice"]],
    widths=[52 * mm, 50 * mm, None])

para(
    "Resultado: a nota de acessibilidade passou de <b>95 para 100</b>, e a de boas práticas de "
    "<b>96 para 100</b>, sem nenhum item reprovando.")

h2("7.1  Riscos removidos")

table(
    [["Risco", "Providência"],
     ["Avaliações do Google simuladas (nota 4,9, “há 2 meses”, logotipo e fotos de banco de imagens)",
      "Removidos. Depoimentos ficaram neutros até que existam avaliações reais."],
     ["Renders apresentados como obras entregues",
      "Todos os textos que afirmavam execução foram revisados e reescritos."],
     ["Ausência de política de privacidade",
      "Criada, descrevendo exatamente o que o site faz: sem formulário, sem cookies próprios, sem rastreamento."],
     ["Dados enviados à plataforma de origem",
      "Módulo de telemetria removido."]],
    widths=[75 * mm, None])

callout(
    "Dois pontos que continuam em aberto e dependem de decisão do cliente",
    "Os depoimentos exibidos na página inicial ainda são textos criados na geração original, "
    "assinados por nomes fictícios. E os arquivos de projeto ainda creditam um nome de família como "
    "cliente e um escritório de arquitetura como autor, sobre imagens que são renders. "
    "Ambos foram sinalizados e estão documentados no projeto; a substituição ou remoção depende de "
    "orientação da M7.",
    color=RED, bg=colors.HexColor("#FBF1EF"))

story.append(PageBreak())


# ============================================================== 8
h1("8", "Resultados medidos")

para(
    "Comparação das três versões do site, medidas na mesma máquina, com a mesma ferramenta "
    "(Google Lighthouse, perfil celular) e no mesmo dia.")

table(
    [["Versão", "Perf.", "Acess.", "Práticas", "SEO", "Peso da página"],
     ["Original Lovable (13/08)", "80", "95", "96", "100", "~11,3 MB"],
     ["Após 1ª rodada (13/08)", "85", "100", "100", "100", "1.456 KB"],
     ["<b>Publicada hoje (20/08)</b>", "<b>93</b>", "<b>100</b>", "<b>100</b>", "<b>100</b>", "<b>304 KB</b>"]],
    widths=[52 * mm, 16 * mm, 17 * mm, 19 * mm, 14 * mm, None],
    align={1: "CENTER", 2: "CENTER", 3: "CENTER", 4: "CENTER", 5: "CENTER"})

para(
    "O peso de 11,3 MB da versão original soma os 584 KB medidos localmente com os 11,2 MB do vídeo "
    "hospedado na plataforma, que não pôde ser baixado na reconstrução (retorna 404 fora do Lovable) "
    "mas era efetivamente entregue ao visitante quando o site rodava lá.", "small")

story.append(Spacer(1, 6))
h2("8.1  Métricas de experiência (Core Web Vitals)")

table(
    [["Métrica", "O que mede", "Antes", "Depois"],
     ["LCP", "Tempo até o maior elemento aparecer", "3,8 s", "2,8 s"],
     ["CLS", "Elementos que pulam durante o carregamento", "0", "0"],
     ["TBT", "Tempo em que a página não responde ao toque", "0 ms", "0 ms"],
     ["Índice de velocidade", "Quão rápido a página fica visualmente completa", "3,9 s", "2,2 s"]],
    widths=[22 * mm, 72 * mm, 26 * mm, None],
    align={2: "CENTER", 3: "CENTER"})

h2("8.2  Inventário do site")

table(
    [["Indicador", "Antes", "Depois"],
     ["Páginas indexáveis pelo Google", "4", "21"],
     ["Palavras de conteúdo próprio", "—", "8.313 palavras novas"],
     ["Blocos de dados estruturados", "2, conflitantes entre si", "8 tipos, integrados"],
     ["Arquivos gerados pela plataforma de origem", "12", "0"],
     ["Rotas técnicas expostas ao público", "4", "0"],
     ["Erros do verificador de código", "117", "0"]],
    widths=[70 * mm, 40 * mm, None],
    align={1: "CENTER", 2: "CENTER"})

h2("8.3  Verificação no ar")

para(
    "Após a publicação, foram conferidos diretamente no domínio de produção:")

bullets([
    "As 24 URLs do site respondendo corretamente (código 200).",
    "Endereço inexistente retornando 404, como deve ser.",
    "<font face='Courier' size='8'>/Contato</font> e <font face='Courier' size='8'>/contato/</font> "
    "redirecionando de forma permanente para o endereço oficial.",
    "Endereço de teste da Vercel marcado como não indexável.",
    "Compressão Brotli ativa e cache da rede de distribuição funcionando.",
    "Mapa do site com as 21 URLs e robots.txt apontando para o domínio correto.",
])

story.append(PageBreak())


# ============================================================== 9
h1("9", "Indexação no Google: onde estamos")

para(
    "O site está tecnicamente pronto para ser indexado. Nada no código impede ou atrasa o "
    "rastreamento. O que falta são passos administrativos, que dependem de acesso a contas do "
    "cliente.")

h2("9.1  Já concluído")

bullets([
    "Endereço oficial correto e consistente em todas as páginas.",
    "Mapa do site (sitemap) gerado automaticamente com as 21 URLs, datas de atualização e imagens.",
    "robots.txt liberando o rastreamento completo, sem bloquear arquivos de estilo ou de script — "
    "bloqueá-los impediria o Google de renderizar a página.",
    "Diretiva que autoriza miniatura grande nos resultados de busca e trecho de texto sem limite.",
    "Endereço de teste da plataforma marcado como não indexável, para não competir com o domínio próprio.",
    "Estrutura de dados que permite os resultados enriquecidos de empresa local e de perguntas frequentes.",
    "Suporte pronto para a verificação do Search Console, sem necessidade de alterar código.",
])

h2("9.2  Próximos passos, em ordem")

table(
    [["#", "Ação", "Quem", "Por quê"],
     ["1", "Criar a propriedade no Google Search Console e colar o código de verificação na variável "
      "<font face='Courier' size='8'>VITE_GOOGLE_SITE_VERIFICATION</font>", "Cliente / responsável técnico",
      "É a porta de entrada para tudo o que vem depois"],
     ["2", "Enviar o mapa do site pelo Search Console", "Responsável técnico",
      "Acelera a descoberta das 16 páginas novas"],
     ["3", "Solicitar indexação das páginas principais", "Responsável técnico",
      "Coloca as páginas prioritárias na fila do Google"],
     ["4", "Criar e verificar o Perfil da Empresa no Google", "Cliente",
      "É o que coloca a M7 no mapa e no bloco local, onde está a maior parte dos cliques deste mercado"],
     ["5", "Informar CEP e coordenadas do ateliê", "Cliente",
      "Completa os dados estruturados de empresa local"],
     ["6", "Fornecer avaliações reais e fotos de obra", "Cliente",
      "Libera o bloco de avaliação na busca e permite afirmar execução nos textos"]],
    widths=[8 * mm, 62 * mm, 32 * mm, None])

callout(
    "Expectativa realista de prazo",
    "Indexação não é instantânea nem comprável. Após a verificação no Search Console e o envio do "
    "mapa do site, o Google normalmente leva de alguns dias a algumas semanas para rastrear e indexar "
    "páginas novas. O posicionamento nas primeiras colocações para termos concorridos é um processo "
    "de meses e depende também de fatores externos ao site — principalmente do Perfil da Empresa e "
    "de avaliações reais. O que foi entregue é a condição necessária: um site que o Google consegue "
    "rastrear, entender e ranquear.")

story.append(PageBreak())


# ============================================================== 10
h1("10", "Manutenção e continuidade")

para(
    "Um ponto que costuma ser esquecido: o trabalho só tem valor se puder ser mantido. O projeto foi "
    "documentado para que qualquer profissional consiga assumi-lo.")

table(
    [["Documento", "Conteúdo"],
     ["README.md", "Como rodar, como publicar, mapa de todas as URLs, onde editar cada conteúdo, "
      "variáveis de ambiente e a lista de pendências"],
     ["AGENTS.md", "As decisões técnicas e o motivo de cada uma, incluindo o que <b>não</b> pode ser "
      "alterado sem quebrar SEO, performance ou acessibilidade"],
     ["Histórico de commits", "20 registros, cada um explicando o que mudou e por quê, com "
      "possibilidade de reverter qualquer alteração"]],
    widths=[42 * mm, None])

h2("10.1  Onde editar cada conteúdo (sem programador)")

table(
    [["O que", "Arquivo"],
     ["Domínio, telefone, e-mail, endereço, horários", "src/lib/seo.ts"],
     ["Nome, título e descrição de serviços e cidades", "src/data/catalog.ts"],
     ["Texto das páginas de serviço", "src/data/services.ts"],
     ["Texto das páginas de cidade", "src/data/cities.ts"],
     ["Perguntas frequentes", "src/data/faq.ts"],
     ["Projetos do portfólio", "src/data/projects.ts"],
     ["Menu e rodapé", "src/components/SiteChrome.tsx"]],
    widths=[80 * mm, None])

para(
    "Ao trocar qualquer imagem, basta rodar um comando "
    "(<font face='Courier' size='8'>npm run images</font>) que gera automaticamente todas as versões "
    "e formatos necessários.")

h2("10.2  Riscos conhecidos, registrados no projeto")

table(
    [["Risco", "Estado"],
     ["Depoimentos fictícios na página inicial", "Documentado; aguarda decisão do cliente"],
     ["Cliente e escritório de arquitetura creditados sobre renders", "Documentado; aguarda confirmação de autorização"],
     ["CEP e coordenadas ausentes nos dados estruturados", "Campos preparados e vazios; aguarda o dado"],
     ["Redes sociais ausentes nos dados estruturados", "Deixado vazio deliberadamente — declarar perfil inexistente prejudica a validação"],
     ["Site sem ferramenta de análise de audiência", "Nenhuma instalada. Se for instalada, a política de privacidade precisa ser atualizada junto"]],
    widths=[80 * mm, None])

story.append(PageBreak())


# ============================================================== ANEXO A
h1("A", "Anexo A — Histórico completo de alterações")

para(
    "Todas as alterações estão registradas no repositório do cliente, com data, autor e conteúdo "
    "exato de cada mudança. Cada linha abaixo corresponde a um registro conferível.", "small")

story.append(Spacer(1, 4))

commits = [
    ("c31d46e", "13/08", "Baseline: site original gerado por IA (Lovable), antes das correções"),
    ("5cfa162", "13/08", "Formatação do código — corrige 117 erros do verificador"),
    ("8b53037", "13/08", "SEO: endereço oficial único; canonical e og corretos em todas as rotas; idioma pt-BR; imagem de compartilhamento; dados estruturados; sitemap e robots no domínio vivo"),
    ("aac2376", "13/08", "Menu no celular acessível; telefone clicável; remoção de links sociais quebrados"),
    ("0770103", "13/08", "Remoção da simulação de avaliações do Google (nota 4,9, “há 2 meses” e fotos de banco de imagens)"),
    ("3e0c464", "13/08", "Vídeo do hero de 11,2 MB para 807 KB (93% menor); servido do próprio site em vez do endereço interno do Lovable"),
    ("21daaef", "13/08", "Portfólio sem foto duplicada e com textos alternativos corretos; 7 MB de panorâmicas deixam de ser pré-carregadas; remoção de arquivos órfãos"),
    ("a96104e", "13/08", "Acessibilidade: tom bronze atinge o mínimo exigido (4,69:1 e 5,14:1); Esc fecha painéis; animações respeitam preferência do sistema"),
    ("f54885f", "13/08", "Formatação"),
    ("c064c30", "13/08", "Exclusão dos arquivos gerados pelo plugin do Lovable da formatação"),
    ("45461d9", "13/08", "Exclusão dos arquivos gerados pelo plugin da verificação de código"),
    ("261ae1c", "13/08", "Ajuste nas regras de exclusão"),
    ("2b40d42", "13/08", "Preparação do repositório independente para GitHub e Vercel"),
    ("32a16be", "13/08", "Primeira publicação na Vercel"),
    ("d39848d", "13/08", "Fontes no próprio servidor (remove requisição bloqueante ao Google Fonts, ~800 ms); tom bronze claro para fundos escuros (5,53:1); demais ajustes de contraste"),
    ("d91531a", "13/08", "Ajuste de configuração local"),
    ("93a391d", "13/08", "Endereço da Vercel como oficial provisório até a virada do domínio próprio"),
    ("db0b6ae", "20/08", "11 páginas novas para busca local; dados estruturados unificados; caminho crítico 3x menor"),
    ("636e8c0", "20/08", "Endereço oficial no host que responde (www); robots.txt gerado a partir do domínio"),
    ("4aabdf7", "20/08", "Imagens deixam de ser embutidas no HTML — página inicial de 49 KB para 15 KB"),
]

rows = [["Registro", "Data", "O que mudou"]]
rows += [[f"<font face='Courier' size='7.5'>{c}</font>", d, t] for c, d, t in commits]
table(rows, widths=[19 * mm, 13 * mm, None], font_size=8)

story.append(PageBreak())


# ============================================================== ANEXO B
h1("B", "Anexo B — Metodologia de medição")

para(
    "Este anexo existe para que qualquer pessoa possa repetir as medições e chegar aos mesmos "
    "números. Nenhum dado deste relatório é estimativa.")

h2("Ferramenta")

para(
    "Google Lighthouse 13, executado com Chromium em modo automatizado, perfil <i>mobile</i> "
    "(o mesmo perfil que o Google usa como referência), com limitação de rede e de processador "
    "simuladas nos valores padrão da ferramenta.")

h2("Como a comparação foi feita")

bullets([
    "A versão original do site foi reconstruída a partir do registro <font face='Courier' size='8'>c31d46e</font> "
    "do próprio repositório — não é uma lembrança nem uma estimativa, é o código original executando.",
    "As duas versões foram servidas localmente com o mesmo servidor e a mesma configuração de "
    "compressão, e medidas na mesma máquina, no mesmo dia, com intervalo de minutos.",
    "Cada medição foi repetida duas vezes; os valores apresentados são consistentes entre as repetições.",
    "As afirmações estruturais (endereço oficial, idioma declarado, rotas expostas, tamanho do vídeo) "
    "foram extraídas diretamente dos arquivos do repositório, não de medições.",
])

h2("Limitações declaradas")

bullets([
    "O vídeo de 11,2 MB da versão original está hospedado na infraestrutura do Lovable e retorna 404 "
    "fora dela. O peso de ~11,3 MB da versão original é, portanto, a soma dos 584 KB efetivamente "
    "medidos com o tamanho do vídeo registrado nos arquivos do projeto.",
    "As notas de performance foram medidas em ambiente de teste, cujo processador é mais lento que o "
    "de um servidor de produção. Elas servem para <b>comparar</b> as duas versões em igualdade de "
    "condições, não como previsão exata do número que o PageSpeed Insights exibirá.",
    "A verificação final no domínio publicado foi feita por requisições HTTP diretas — códigos de "
    "resposta, redirecionamentos, cabeçalhos, compressão, cache, mapa do site e endereço oficial. "
    "Essa parte reflete produção real.",
])

h2("Como conferir o número oficial")

para(
    "A nota oficial de PageSpeed pode ser conferida por qualquer pessoa em "
    "<font face='Courier' size='8'>pagespeed.web.dev</font>, informando o endereço "
    "<font face='Courier' size='8'>https://www.m7movelaria.com.br</font>. Essa medição roda na "
    "infraestrutura do próprio Google e é a referência final.")

story.append(Spacer(1, 10))
story.append(rule(BRONZE, 1.2, 6))
story.append(Spacer(1, 6))
para(
    "Relatório gerado em 21 de agosto de 2026, referente à versão publicada sob o registro "
    "<font face='Courier' size='8'>4aabdf7</font>.", "small")


# ============================================================== TEMPLATES
def capa(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(CREAM)
    canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    canvas.setFillColor(BRONZE)
    canvas.rect(0, PAGE_H - 9 * mm, PAGE_W, 9 * mm, stroke=0, fill=1)
    canvas.setFillColor(INK)
    canvas.rect(0, 0, PAGE_W, 5 * mm, stroke=0, fill=1)
    canvas.restoreState()


def miolo(canvas, doc):
    canvas.saveState()
    # cabeçalho
    canvas.setFont("Helvetica-Bold", 7)
    canvas.setFillColor(BRONZE)
    canvas.drawString(MARGIN, PAGE_H - 13 * mm, "M7 MOVELARIA")
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(GRAY)
    canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 13 * mm,
                           "Relatório técnico de migração e otimização")
    canvas.setStrokeColor(LIGHT)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, PAGE_H - 15 * mm, PAGE_W - MARGIN, PAGE_H - 15 * mm)
    # rodapé
    canvas.line(MARGIN, 14 * mm, PAGE_W - MARGIN, 14 * mm)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(GRAY)
    canvas.drawString(MARGIN, 10 * mm, "www.m7movelaria.com.br")
    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(BRONZE)
    canvas.drawRightString(PAGE_W - MARGIN, 10 * mm, str(canvas.getPageNumber() - 1))
    canvas.restoreState()


doc = BaseDocTemplate(
    OUT, pagesize=A4,
    leftMargin=MARGIN, rightMargin=MARGIN,
    topMargin=MARGIN, bottomMargin=MARGIN,
    title="M7 Movelaria — Relatório técnico de migração e otimização",
    author="Relatório técnico",
    subject="Migração do Lovable para infraestrutura própria, SEO e performance",
)
frame_capa = Frame(MARGIN, MARGIN, PAGE_W - 2 * MARGIN, PAGE_H - 2 * MARGIN, id="capa")
frame_miolo = Frame(MARGIN, 18 * mm, PAGE_W - 2 * MARGIN, PAGE_H - 18 * mm - 20 * mm, id="miolo")
doc.addPageTemplates([
    PageTemplate(id="capa", frames=[frame_capa], onPage=capa),
    PageTemplate(id="miolo", frames=[frame_miolo], onPage=miolo),
])
doc.build(story)
print("gerado:", OUT)
