#!/usr/bin/env python3
"""
Gera os ícones do site a partir do logotipo oficial da M7.

    npm run icons        (ou: python3 scripts/gerar-icones.py)

Fonte de verdade: src/brand/logo-m7.jpg — círculo branco com a marca M7 em
traço preto e o nome "movelaria" em cinza, sobre fundo cinza. O arquivo veio
do cliente e nunca é modificado; tudo que este script produz vai para public/
e é versionado, para o build da Vercel não depender do Pillow.

O que sai, e por quê cada um é diferente:

  logo-512.png, logo-192.png
      O logotipo completo, recortado no círculo, com o lado de fora
      transparente. É o `logo` do schema.org e o ícone "any" do manifesto.
  logo-maskable-512.png
      Fundo branco de canto a canto e o logotipo encolhido para a zona segura
      (80% do centro): o Android recorta ícones "maskable" em círculo, gota ou
      quadrado arredondado, e o que estiver fora some.
  apple-touch-icon.png (180x180)
      Fundo branco (iOS não aceita transparência: viraria preto) e o logotipo
      completo; o próprio iOS arredonda os cantos.
  favicon.ico (16/32/48) e favicon-32.png
      Só a marca M7, sem o nome, dentro do círculo branco. Em 16 px o
      "movelaria" vira ruído, e o traço original (~20 px em 1072) sumiria ao
      encolher — por isso o traço é engrossado antes de reduzir, o suficiente
      para ter ~1,5 px na aba do navegador.

Todas as reduções são feitas com supersampling (desenha grande, reduz com
LANCZOS) para a borda do círculo e o traço saírem suavizados.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src/brand/logo-m7.jpg"
OUT = ROOT / "public"

# Medidas do arquivo-fonte (1072x1008). Se o cliente mandar um arquivo novo,
# refazer a medição: círculo por bbox do branco, marca por bbox do preto.
CIRCLE_CENTER = (529.5, 501.5)
CIRCLE_RADIUS = 501.5
MARK_BOX = (169, 307, 898, 589)  # bbox do traço preto
STROKE_PX = 20  # espessura aproximada do traço no arquivo-fonte

SS = 4  # fator de supersampling


def circle_rgba() -> Image.Image:
    """Logotipo completo recortado no círculo, fora transparente."""
    im = Image.open(SRC).convert("RGB")
    cx, cy, r = *CIRCLE_CENTER, CIRCLE_RADIUS
    box = (round(cx - r), round(cy - r), round(cx + r), round(cy + r))
    crop = im.crop(box)  # pode sair da imagem: PIL preenche com preto...
    # ...então garantimos branco onde a fonte não cobre (o círculo encosta na
    # borda superior/inferior do JPEG).
    canvas = Image.new("RGB", crop.size, (255, 255, 255))
    canvas.paste(im, (-box[0], -box[1]))
    # O branco do JPEG vem com ruído (250–255) que só serve para inflar o PNG:
    # tudo que está quase branco vira branco de verdade. O traço e o texto
    # (abaixo de 200) não são tocados.
    canvas = canvas.point(lambda v: 255 if v >= 240 else v)
    side = crop.size[0]
    # Máscara circular suavizada, 3 px menor que o círculo para deixar de fora a
    # franja cinza dos artefatos de JPEG na borda.
    big = Image.new("L", (side * SS, side * SS), 0)
    inset = 3 * SS
    ImageDraw.Draw(big).ellipse((inset, inset, side * SS - inset, side * SS - inset), fill=255)
    mask = big.resize((side, side), Image.LANCZOS)
    canvas.putalpha(mask)
    return canvas


def on_white(logo: Image.Image, size: int, scale: float) -> Image.Image:
    """Quadrado branco `size` com o logotipo ocupando `scale` do lado, centrado."""
    out = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    d = round(size * scale)
    small = logo.resize((d, d), Image.LANCZOS)
    off = (size - d) // 2
    out.alpha_composite(small, (off, off))
    return out


def mark_only(size: int, stroke_target_px: float) -> Image.Image:
    """Círculo branco com só a marca M7, traço engrossado para o tamanho alvo."""
    im = Image.open(SRC).convert("L")
    pad = 60
    x0, y0, x1, y1 = MARK_BOX
    crop = im.crop((x0 - pad, y0 - pad, x1 + pad, y1 + pad))
    mark = crop.point(lambda v: 0 if v < 110 else 255)  # binariza: traço preto
    # A marca vai ocupar 76% do diâmetro; daí a escala e quanto engrossar.
    mark_w_target = size * 0.76
    scale = mark_w_target / (x1 - x0)
    needed = stroke_target_px / scale  # espessura necessária na fonte
    grow = max(0, round((needed - STROKE_PX) / 2))
    if grow:
        mark = mark.filter(ImageFilter.MinFilter(2 * grow + 1))
    # Desenha no canvas grande (supersampling) e reduz.
    big = size * SS
    canvas = Image.new("L", (big, big), 255)
    mw = round((x1 - x0 + 2 * pad) * scale * SS)
    mh = round((y1 - y0 + 2 * pad) * scale * SS)
    mark_big = mark.resize((mw, mh), Image.LANCZOS)
    canvas.paste(mark_big, ((big - mw) // 2, (big - mh) // 2))
    disc = Image.new("L", (big, big), 0)
    ImageDraw.Draw(disc).ellipse((0, 0, big - 1, big - 1), fill=255)
    rgba = Image.merge("RGBA", (canvas, canvas, canvas, disc))
    return rgba.resize((size, size), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    logo = circle_rgba()
    logo.resize((512, 512), Image.LANCZOS).save(OUT / "logo-512.png", optimize=True)
    logo.resize((192, 192), Image.LANCZOS).save(OUT / "logo-192.png", optimize=True)
    on_white(logo, 512, 0.80).save(OUT / "logo-maskable-512.png", optimize=True)
    on_white(logo, 180, 0.92).convert("RGB").save(OUT / "apple-touch-icon.png", optimize=True)

    fav = {s: mark_only(s, stroke) for s, stroke in ((16, 1.4), (32, 1.8), (48, 2.4))}
    fav[32].save(OUT / "favicon-32.png", optimize=True)
    fav[48].save(
        OUT / "favicon.ico",
        format="ICO",
        sizes=[(48, 48), (32, 32), (16, 16)],
        append_images=[fav[32], fav[16]],
    )
    for name in ("logo-512.png", "logo-192.png", "logo-maskable-512.png",
                 "apple-touch-icon.png", "favicon-32.png", "favicon.ico"):
        print(f"{name:24s} {(OUT / name).stat().st_size:7d} bytes")


if __name__ == "__main__":
    main()
