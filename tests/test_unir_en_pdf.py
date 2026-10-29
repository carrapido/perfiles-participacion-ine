"""scripts/unir_en_pdf.py reúne las fichas PNG en un PDF: una por página, en el orden dado y sin perder resolución."""
import re

from PIL import Image

from unir_en_pdf import RESOLUCION, unir_en_pdf

PUNTOS_POR_PULGADA = 72  # unidad de medida de las páginas de un PDF


def crear_png(ruta, ancho, modo="RGB"):
    Image.new(modo, (ancho, 10), "white").save(ruta)
    return ruta


def anchos_de_pagina(pdf):
    """Pillow escribe el tamaño de cada página, en puntos, en su /MediaBox."""
    return [float(ancho) for ancho in re.findall(rb"/MediaBox\s*\[\s*0\s+0\s+([\d.]+)", pdf.read_bytes())]


def test_pone_una_imagen_por_pagina_en_el_orden_dado(tmp_path):
    pulgadas = [2, 1, 3]
    imagenes = [crear_png(tmp_path / f"{n}.png", RESOLUCION * n) for n in pulgadas]
    salida = tmp_path / "fichas.pdf"
    unir_en_pdf(imagenes, salida)
    assert anchos_de_pagina(salida) == [PUNTOS_POR_PULGADA * n for n in pulgadas]


def test_acepta_png_con_canal_alfa(tmp_path):
    imagen = crear_png(tmp_path / "con_alfa.png", RESOLUCION, modo="RGBA")
    salida = tmp_path / "fichas.pdf"
    unir_en_pdf([imagen], salida)
    assert anchos_de_pagina(salida) == [PUNTOS_POR_PULGADA]
