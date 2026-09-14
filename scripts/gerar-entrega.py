"""Gera o documento de entrega do projeto do site da M7 Movelaria.

Uso:  pip install reportlab && python3 scripts/gerar-entrega.py

Sai em docs/entrega-projeto-site.pdf.

REGRA DESTE DOCUMENTO: ele vai para o cliente e pede pagamento. Nada aqui pode
ser afirmação não verificada — cada item da lista de entregas foi conferido no
código ou no site no ar antes de entrar, e o que ainda depende do cliente está
declarado em vez de escondido. Se um item sair do ar, tire daqui também.

Os dados comerciais (chave Pix, nome de quem presta o serviço) ficam em
DADOS_COMERCIAIS, no topo — nunca invente nenhum deles.
"""

import os
from datetime import date

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

# --------------------------------------------------------------------------
# Dados comerciais. Preencher antes de enviar — o script avisa se faltar.
# --------------------------------------------------------------------------
DADOS_COMERCIAIS = {
    "prestador": "",  # nome de quem prestou o serviço, como assina
    "pix_chave": "",  # chave Pix para o pagamento
    "pix_titular": "",  # nome que aparece na confirmação do Pix
    "valor": "R$ 650,00",
    "cliente": "M7 Movelaria",
}

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "entrega-projeto-site.pdf")

BRONZE = colors.HexColor("#93603D")
INK = colors.HexColor("#2B2723")
GRAY = colors.HexColor("#5C564E")
LIGHT = colors.HexColor("#E7E0D6")
CREAM = colors.HexColor("#FAF6F0")
GREEN = colors.HexColor("#2F6B4F")

PAGE_W, PAGE_H = A4
MARGIN = 20 * mm

MESES = "janeiro fevereiro março abril maio junho julho agosto setembro outubro novembro dezembro".split()


def P(name, **kw):
    base = dict(
        name=name, fontName="Helvetica", fontSize=9.5, leading=14.5, textColor=INK, spaceAfter=6
    )
    base.update(kw)
    return ParagraphStyle(**base)


S = {
    "capa_titulo": P("capa_titulo", fontName="Helvetica-Bold", fontSize=26, leading=31, spaceAfter=8),
    "capa_sub": P("capa_sub", fontSize=12, leading=18, textColor=GRAY, spaceAfter=4),
    "h1": P("h1", fontName="Helvetica-Bold", fontSize=15, leading=20, textColor=BRONZE, spaceAfter=10, spaceBefore=4),
    "h2": P("h2", fontName="Helvetica-Bold", fontSize=11, leading=15, spaceAfter=4, spaceBefore=8),
    "p": P("p", alignment=TA_JUSTIFY),
    "li": P("li", leftIndent=10, bulletIndent=2, spaceAfter=3),
    "small": P("small", fontSize=8.5, leading=12.5, textColor=GRAY),
    "cell": P("cell", fontSize=9, leading=13, spaceAfter=0),
    "cell_b": P("cell_b", fontName="Helvetica-Bold", fontSize=9, leading=13, spaceAfter=0),
    "valor": P("valor", fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=BRONZE, alignment=TA_CENTER, spaceAfter=2),
    "rodape": P("rodape", fontSize=7.5, leading=10, textColor=GRAY, alignment=TA_CENTER),
}


def rodape(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LIGHT)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, 14 * mm, PAGE_W - MARGIN, 14 * mm)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(GRAY)
    canvas.drawString(MARGIN, 10 * mm, "Entrega de projeto — Site M7 Movelaria")
    canvas.drawRightString(PAGE_W - MARGIN, 10 * mm, f"Página {doc.page}")
    canvas.restoreState()


def bloco(titulo, itens):
    """Um bloco de entrega: título em bronze e a lista do que foi feito."""
    partes = [Paragraph(titulo, S["h2"])]
    for it in itens:
        partes.append(Paragraph(it, S["li"], bulletText="•"))
    return KeepTogether(partes)


def tabela(linhas, larguras, cabecalho=True):
    dados = []
    for i, linha in enumerate(linhas):
        estilo = S["cell_b"] if (cabecalho and i == 0) else S["cell"]
        dados.append([Paragraph(c, estilo) for c in linha])
    t = Table(dados, colWidths=larguras, hAlign="LEFT")
    est = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, LIGHT),
        ("BOX", (0, 0), (-1, -1), 0.5, LIGHT),
    ]
    if cabecalho:
        est.append(("BACKGROUND", (0, 0), (-1, 0), CREAM))
    t.setStyle(TableStyle(est))
    return t


def conteudo():
    d = DADOS_COMERCIAIS
    hoje = date.today()
    data_ext = f"{hoje.day} de {MESES[hoje.month - 1]} de {hoje.year}"
    fl = []

    # ---------------------------------------------------------------- capa
    fl.append(Spacer(1, 26 * mm))
    fl.append(Paragraph("Entrega de projeto", S["capa_sub"]))
    fl.append(Paragraph("Site institucional, indexação no Google e orçamento automatizado", S["capa_titulo"]))
    fl.append(Spacer(1, 6 * mm))
    fl.append(
        Paragraph(
            f"Cliente: <b>{d['cliente']}</b> — móveis planejados, São José dos Pinhais/PR<br/>"
            f"Endereço do site: <b>www.m7movelaria.com.br</b><br/>"
            f"Data desta entrega: {data_ext}",
            S["capa_sub"],
        )
    )
    fl.append(Spacer(1, 10 * mm))
    fl.append(
        Paragraph(
            "Este documento descreve o que foi construído e entregue, como conferir cada item "
            "por conta própria, o que ainda depende de informação da M7 e as condições de "
            "pagamento combinadas.",
            S["p"],
        )
    )
    fl.append(PageBreak())

    # ------------------------------------------------------------ entregas
    fl.append(Paragraph("O que foi entregue", S["h1"]))
    fl.append(
        Paragraph(
            "São 23 páginas publicadas, todas no ar e acessíveis a partir do endereço acima. "
            "O conteúdo é servido como arquivo pronto, sem depender de banco de dados ou de "
            "painel administrativo — o que significa uma coisa prática para a M7: não há "
            "mensalidade de hospedagem de sistema, nem plugin para atualizar, nem site que sai "
            "do ar porque um serviço caiu.",
            S["p"],
        )
    )
    fl.append(Spacer(1, 3 * mm))

    fl.append(
        bloco(
            "1. Site institucional — 23 páginas",
            [
                "Página inicial com apresentação, serviços, área atendida, materiais, acabamentos, portfólio e perguntas frequentes.",
                "6 páginas de serviço: cozinhas, dormitórios, closets, home office, móveis comerciais e home theater/painel de TV.",
                "6 páginas de cidade: São José dos Pinhais, Curitiba, Pinhais, Araucária, Colombo e Fazenda Rio Grande — cada uma com texto próprio sobre o que muda no projeto naquela cidade.",
                "Página dedicada a arquitetos, portfólio de projetos, página de obras entregues, tour virtual 360°, sobre, contato, perguntas frequentes e política de privacidade.",
                "Página de link para a bio do Instagram, com selo de “aberto agora” calculado pelo horário de atendimento.",
            ],
        )
    )

    fl.append(
        bloco(
            "2. Indexação no Google",
            [
                "Mapa do site (sitemap.xml) gerado automaticamente e enviado ao Google Search Console: <b>processado, 23 páginas encontradas</b>.",
                "Arquivo robots.txt liberando o rastreamento de todo o site.",
                "Endereço canônico único em todas as páginas, evitando que o Google veja o mesmo conteúdo em dois endereços diferentes.",
                "Dados estruturados (o código que o Google lê para entender o negócio): empresa local, site, serviços, trilha de navegação e perguntas frequentes.",
                "Nome, endereço e telefone do site conferidos contra o Perfil da Empresa no Google, incluindo a grafia da rua nos Correios e as coordenadas do próprio perfil.",
                "Títulos e descrições escritos página a página, com a cidade no título das páginas locais.",
                "<b>Resultado já visível:</b> o site aparece nos resultados do Google para buscas como “movelaria em São José dos Pinhais”.",
            ],
        )
    )

    fl.append(
        bloco(
            "3. Orçamento automatizado, com bloqueio de cópia",
            [
                "Simulador de 6 etapas: ambiente, módulos, medidas, acabamento, resumo e pagamento.",
                "Desenho do móvel em escala na tela, conforme as medidas informadas.",
                "Cálculo automático por peça, com entrega e montagem, e duas formas de pagamento: Pix à vista com 5% de desconto ou cartão em até 10 vezes.",
                "Código e validade em cada simulação, e aviso de que cópia ou print não vale como proposta comercial.",
                "<b>Bloqueio de cópia</b> sobre o resumo e a lista de preços: seleção de texto, menu do botão direito, copiar/recortar e arrastar ficam desativados nessa área. Telefone e endereço seguem copiáveis no resto do site, de propósito.",
            ],
        )
    )

    fl.append(
        bloco(
            "4. Captação de contatos (leads)",
            [
                "Para ver o valor, o visitante informa nome e contato — é isso que transforma visita em lead.",
                "O contato chega por <b>WhatsApp</b>, com a mensagem já pronta contendo nome, telefone, código e o orçamento montado — é o caminho que fecha venda, e funciona desde agora.",
                "Cada contato também fica <b>registrado no painel do serviço</b>, como segunda via, caso alguém não veja a mensagem.",
                "O envio por <b>e-mail</b> está implantado e testado, e passa a enviar assim que a conta de envio for criada e o domínio do remetente confirmado (ver pendências).",
                "Botão flutuante de WhatsApp em todas as páginas, e botões de orçamento no cabeçalho e ao longo do conteúdo.",
                "Se o envio de e-mail falhar, o visitante continua vendo o orçamento normalmente — nenhuma falha de serviço externo derruba uma venda.",
            ],
        )
    )

    # Sem quebra forçada aqui: os blocos são KeepTogether, então cada um migra
    # inteiro para a página seguinte se não couber. Forçar a quebra deixava a
    # página 3 com um bloco só e o resto em branco.
    fl.append(
        bloco(
            "5. Velocidade",
            [
                "As 23 páginas são entregues prontas pela rede de distribuição, sem processamento a cada visita. Tempo de resposta medido em produção: <b>mediana de 58 milésimos de segundo</b>.",
                "Imagens convertidas para formatos modernos (AVIF e WebP) com versões por tamanho de tela, e carregamento adiado do que está abaixo da dobra.",
                "Vídeo da página inicial só carrega quando entra na tela, depois do restante, e nunca em modo de economia de dados.",
                "Velocidade não é só conforto: é critério de posicionamento do Google e é o que segura quem abre o site pelo celular, no 4G.",
            ],
        )
    )

    fl.append(
        bloco(
            "6. Acessibilidade e conformidade",
            [
                "Contraste de cores calculado para o nível AA das diretrizes internacionais de acessibilidade (WCAG).",
                "Alvos de toque dimensionados para uso no celular e navegação por teclado preservada.",
                "Política de privacidade publicada, em linha com a LGPD. O site não usa cookies nem rastreamento de terceiros — não há banner de cookies porque não há o que consentir.",
            ],
        )
    )

    fl.append(Spacer(1, 4 * mm))
    fl.append(Paragraph("Como conferir", S["h1"]))
    fl.append(
        Paragraph(
            "Tudo abaixo pode ser verificado sem nenhuma ferramenta, direto do navegador:",
            S["p"],
        )
    )
    fl.append(
        tabela(
            [
                ["O quê", "Onde conferir"],
                ["O site no ar", "www.m7movelaria.com.br"],
                ["As páginas que o Google conhece", "www.m7movelaria.com.br/sitemap.xml"],
                ["O simulador de orçamento", "www.m7movelaria.com.br/orcamento"],
                ["O tour virtual 360°", "www.m7movelaria.com.br/showroom-3d"],
                ["O site aparecendo no Google", "Buscar por “M7 Movelaria” ou “movelaria em São José dos Pinhais”"],
            ],
            [62 * mm, 98 * mm],
        )
    )

    fl.append(PageBreak())

    # ---------------------------------------------------------- pendências
    fl.append(Paragraph("O que ainda depende da M7", S["h1"]))
    fl.append(
        Paragraph(
            "Estes pontos não são trabalho pendente de programação: são informações ou decisões "
            "que só a M7 pode dar. Estão listados aqui para ficarem registrados, não para "
            "adiar nada.",
            S["p"],
        )
    )
    fl.append(
        tabela(
            [
                ["Pendência", "O que é preciso"],
                [
                    "Tabela de preços do simulador",
                    "O cálculo usa a tabela de material da M7, mas alguns itens ainda estão sendo fechados. Enquanto isso o simulador mostra o aviso “Valores em conferência” e fica fora das buscas do Google, de propósito — para não divulgar preço que ainda vai mudar. Com a tabela fechada, é uma linha de configuração.",
                ],
                [
                    "Envio de e-mail dos leads",
                    "O caminho de e-mail está implantado e testado. Para começar a enviar, falta criar a conta de envio e confirmar o domínio do remetente. WhatsApp e registro no painel já funcionam desde agora.",
                ],
                [
                    "Categoria no Perfil da Empresa no Google",
                    "A categoria principal está como “Fabricante”, que não casa com móveis planejados e deixa o perfil fora do bloco de mapa nas buscas locais. Trocar para “Loja de móveis planejados” ou “Moveleiro” é feito pela própria M7.",
                ],
                [
                    "Horário divergente",
                    "O Perfil no Google informa 7h–16h sem sábado; o site informa 8h–18h e sábado 8h–12h. Vale alinhar os dois.",
                ],
                [
                    "Avaliações e fotos de obra",
                    "Os depoimentos do site são exemplos, e as imagens do portfólio são projetos em 3D. Nenhum texto do site afirma o contrário. Com avaliações reais do Google e fotos de obras entregues, os dois pontos ficam mais fortes.",
                ],
                [
                    "Redes sociais e CNPJ",
                    "Não estão declarados no site porque não foram informados. São sinais de confiança que valem a pena acrescentar.",
                ],
            ],
            [46 * mm, 114 * mm],
        )
    )

    fl.append(PageBreak())

    # ----------------------------------------------------------- pagamento
    fl.append(Paragraph("Pagamento", S["h1"]))
    fl.append(
        Paragraph(
            "Valor combinado no orçamento enviado, referente à entrega descrita neste documento:",
            S["p"],
        )
    )
    fl.append(Spacer(1, 4 * mm))

    caixa = Table(
        [[Paragraph(d["valor"], S["valor"])], [Paragraph("pagamento via Pix", S["rodape"])]],
        colWidths=[160 * mm],
    )
    caixa.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.8, BRONZE),
                ("BACKGROUND", (0, 0), (-1, -1), CREAM),
                ("TOPPADDING", (0, 0), (-1, 0), 10),
                ("BOTTOMPADDING", (0, -1), (-1, -1), 10),
            ]
        )
    )
    fl.append(caixa)
    fl.append(Spacer(1, 6 * mm))

    fl.append(
        tabela(
            [
                ["Dados para o pagamento", ""],
                ["Chave Pix", d["pix_chave"] or "<font color='#9B3B2F'>(preencher)</font>"],
                ["Titular", d["pix_titular"] or "<font color='#9B3B2F'>(preencher)</font>"],
                ["Valor", d["valor"]],
                ["Referente a", "Entrega do projeto do site, conforme orçamento enviado"],
            ],
            [46 * mm, 114 * mm],
        )
    )

    fl.append(Spacer(1, 8 * mm))
    fl.append(
        Paragraph(
            "O site segue no ar e funcionando normalmente. Os itens listados como pendentes "
            "acima dependem de informação da M7 e podem ser resolvidos assim que forem "
            "definidos.",
            S["p"],
        )
    )
    fl.append(Spacer(1, 12 * mm))
    fl.append(
        Paragraph(
            (d["prestador"] or "<font color='#9B3B2F'>(preencher: nome de quem assina)</font>")
            + f"<br/><font size=8 color='#5C564E'>{data_ext}</font>",
            S["p"],
        )
    )
    return fl


def main():
    faltando = [k for k in ("prestador", "pix_chave", "pix_titular") if not DADOS_COMERCIAIS[k]]
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    doc = BaseDocTemplate(
        OUT,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=24 * mm,
        title="Entrega de projeto — Site M7 Movelaria",
        author=DADOS_COMERCIAIS["prestador"] or "",
    )
    frame = Frame(MARGIN, 24 * mm, PAGE_W - 2 * MARGIN, PAGE_H - MARGIN - 24 * mm, id="f")
    doc.addPageTemplates([PageTemplate(id="normal", frames=[frame], onPage=rodape)])
    doc.build(conteudo())
    print(f"✓ {OUT}")
    if faltando:
        print(f"⚠ campos em branco no PDF: {', '.join(faltando)} — preencha DADOS_COMERCIAIS e rode de novo.")


if __name__ == "__main__":
    main()
