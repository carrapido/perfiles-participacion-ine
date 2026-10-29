"""La geometría del sitio (web/public/data/mexico.topo.json) sale del Marco Geográfico Seccional del INE y une 1 a 1
con municipios.json por las claves del INE. La genera scripts/preparar_geometria.sh."""
import json
from pathlib import Path

DATOS = Path("web/public/data")
GEOMETRIA = DATOS / "mexico.topo.json"


def propiedades_de(capa):
    topologia = json.loads(GEOMETRIA.read_text(encoding="utf-8"))
    return [geometria["properties"] for geometria in topologia["objects"][capa]["geometries"]]


def test_cada_municipio_del_sitio_tiene_un_solo_poligono():
    poligonos = [(municipio["entidad"], municipio["municipio"]) for municipio in propiedades_de("municipios")]
    datos = json.loads((DATOS / "municipios.json").read_text(encoding="utf-8"))["municipios"]
    assert len(poligonos) == len(set(poligonos))
    assert set(poligonos) == {(municipio["entidad"], municipio["municipio"]) for municipio in datos}


def test_hay_un_poligono_por_cada_una_de_las_32_entidades():
    assert sorted(entidad["entidad"] for entidad in propiedades_de("entidades")) == list(range(1, 33))


def test_la_geometria_pesa_menos_de_1_mb():
    assert GEOMETRIA.stat().st_size < 1_000_000
