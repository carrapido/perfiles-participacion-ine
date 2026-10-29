"""Reúne imágenes PNG en un PDF, una por página, en el orden de los argumentos. Sirve para las fichas de perfil,
que salen del botón "Descargar PNG" del sitio; van en el orden de perfiles.json (campo `orden`).
Uso (desde la raíz):
    python scripts/unir_en_pdf.py entregables/fichas/fichas_de_perfil.pdf entregables/fichas/ficha-a.png ..."""
import sys
from pathlib import Path

from PIL import Image

# El sitio dibuja las fichas con scale 3 (96 × 3 = 288 ppp, web/src/compartido/descargarPng.ts): a esta resolución
# cada página mide lo mismo que la ficha en pantalla
RESOLUCION = 288


def main() -> None:
    salida, *imagenes = sys.argv[1:]
    unir_en_pdf([Path(imagen) for imagen in imagenes], Path(salida))


def unir_en_pdf(imagenes: list[Path], salida: Path) -> None:
    """Pillow escribe el PDF: https://pillow.readthedocs.io/en/stable/handbook/image-file-formats.html#pdf"""
    primera, *resto = [abrir_en_rgb(imagen) for imagen in imagenes]
    primera.save(salida, save_all=True, append_images=resto, resolution=RESOLUCION,
                 title="Fichas de los perfiles de participación", author="Equipo Utrinos")


def abrir_en_rgb(ruta: Path) -> Image.Image:
    # El PDF de Pillow no guarda el canal alfa; las fichas ya traen fondo blanco
    with Image.open(ruta) as imagen:
        return imagen.convert("RGB")


if __name__ == "__main__":
    main()
