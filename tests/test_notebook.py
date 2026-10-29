"""El notebook corre de principio a fin, como "Ejecutar todo" en Colab, y sus comprobaciones pasan: reproduce los
perfiles guardados, las cifras del documento técnico y los JSON del sitio.
Ejecuta las celdas de código en orden, en este mismo proceso, sin Jupyter: así basta con IPython para `display`."""
import json
from pathlib import Path

from plotly.basedatatypes import BaseFigure

NOTEBOOK = Path("notebooks/perfiles_participacion.ipynb")


def celdas_de_codigo() -> list[str]:
    cuaderno = json.loads(NOTEBOOK.read_text(encoding="utf-8"))
    return ["".join(celda["source"]) for celda in cuaderno["cells"] if celda["cell_type"] == "code"]


def test_el_notebook_no_trae_salidas_guardadas():
    """Sin salidas, el archivo pesa poco y nadie confunde cifras viejas con las que da al correrlo."""
    cuaderno = json.loads(NOTEBOOK.read_text(encoding="utf-8"))
    assert all(not celda.get("outputs") for celda in cuaderno["cells"] if celda["cell_type"] == "code")


def test_el_notebook_corre_completo_y_sus_comprobaciones_pasan(monkeypatch):
    raiz = Path.cwd()
    monkeypatch.chdir(raiz)  # la configuración del notebook cambia de carpeta; esto la restaura al terminar
    monkeypatch.setattr(BaseFigure, "show", lambda figura, *args, **kwargs: None)  # sin navegador
    espacio: dict = {}
    for numero, codigo in enumerate(celdas_de_codigo(), start=1):
        exec(compile(codigo, f"{NOTEBOOK.name}, celda de código {numero}", "exec"), espacio)
