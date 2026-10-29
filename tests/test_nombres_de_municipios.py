"""Los nombres de municipios.json salen de MPIONOM de los CCPC, con 4 erratas de origen corregidas contra el
Marco Geográfico Seccional del INE."""
import json

import pytest

from exportar_web import exportar

CORREGIDOS = {(4, 6): "Hopelchén", (7, 38): "Huitiupán", (13, 50): "San Agustín Metzquititlán",
              (30, 10): "Alto Lucero de Gutiérrez Barrios"}


@pytest.fixture(scope="module")
def nombres(tmp_path_factory):
    destino = tmp_path_factory.mktemp("data")
    exportar(destino)
    municipios = json.loads((destino / "municipios.json").read_text(encoding="utf-8"))["municipios"]
    return {(municipio["entidad"], municipio["municipio"]): municipio["nombre"] for municipio in municipios}


@pytest.mark.parametrize("clave, nombre", CORREGIDOS.items())
def test_las_erratas_de_los_ccpc_salen_corregidas(nombres, clave, nombre):
    assert nombres[clave] == nombre


def test_los_demas_nombres_siguen_como_en_los_ccpc(nombres):
    assert nombres[(31, 1)] == "Abalá"
