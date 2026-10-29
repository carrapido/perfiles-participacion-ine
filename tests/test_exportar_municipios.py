"""municipios.json: brecha por elección y perfil principal de cada municipio de la federal 2024, con las claves
del INE (EDOCVE + MPIOCVE). Las cifras de referencia están en resume.md, sección 6."""
import json
import statistics

import pytest

from exportar_web import exportar

ARCHIVOS = ["perfiles", "entidades", "brecha_edad", "nacional", "municipios"]
ELECCIONES = [2009, 2012, 2015, 2018, 2021, 2024, 2025]
FEDERAL_2024, JUDICIAL_2025 = ELECCIONES.index(2024), ELECCIONES.index(2025)
MUNICIPIOS_DE_2024 = 2477
SIN_CELDAS_EN_EL_MODELO = 222
SOLO_UN_SEXO_EN_EL_MODELO = 31  # las celdas del otro sexo no llegan a la lista nominal mínima del modelo
SIN_VOTOS_EN_2024 = 12  # tienen lista nominal, pero SV = NV = 0
CAMPECHE = 4  # el INE no publicó sus conteos de la elección judicial 2025


@pytest.fixture(scope="module")
def carpeta(tmp_path_factory):
    destino = tmp_path_factory.mktemp("data")
    exportar(destino)
    return destino


@pytest.fixture(scope="module")
def municipios(carpeta):
    return json.loads((carpeta / "municipios.json").read_text(encoding="utf-8"))["municipios"]


def brechas_de(municipios, eleccion):
    return [municipio["brecha"][eleccion] for municipio in municipios if municipio["brecha"][eleccion] is not None]


def test_los_cinco_archivos_pesan_menos_de_2_mb(carpeta):
    assert sum((carpeta / f"{nombre}.json").stat().st_size for nombre in ARCHIVOS) < 2_000_000


def test_cada_brecha_sigue_el_orden_de_las_siete_elecciones(carpeta, municipios):
    elecciones = json.loads((carpeta / "municipios.json").read_text(encoding="utf-8"))["elecciones"]
    assert elecciones == ELECCIONES
    assert all(len(municipio["brecha"]) == len(ELECCIONES) for municipio in municipios)


def test_hay_un_registro_por_cada_municipio_de_la_federal_2024(municipios):
    claves = {(municipio["entidad"], municipio["municipio"]) for municipio in municipios}
    assert len(municipios) == len(claves) == MUNICIPIOS_DE_2024


def test_los_municipios_sin_votos_en_2024_no_tienen_brecha_de_2024(municipios):
    sin_brecha = [municipio["nombre"] for municipio in municipios if municipio["brecha"][FEDERAL_2024] is None]
    assert len(sin_brecha) == SIN_VOTOS_EN_2024
    assert {"Chicomuselo", "Pantelhó"} <= set(sin_brecha)


def test_campeche_no_tiene_brecha_judicial(municipios):
    campeche = [municipio for municipio in municipios if municipio["entidad"] == CAMPECHE]
    assert campeche
    assert all(municipio["brecha"][JUDICIAL_2025] is None for municipio in campeche)


def test_la_brecha_municipal_conserva_las_cifras_de_resume(municipios):
    federal, judicial = brechas_de(municipios, FEDERAL_2024), brechas_de(municipios, JUDICIAL_2025)
    assert (sum(brecha < 0 for brecha in federal), sum(brecha < 0 for brecha in judicial)) == (35, 616)
    assert (round(statistics.median(federal), 1), round(statistics.median(judicial), 1)) == (9.5, 1.3)


def test_solo_los_municipios_sin_celdas_en_el_modelo_no_tienen_perfil(municipios):
    assert sum(municipio["perfil_principal"] is None for municipio in municipios) == SIN_CELDAS_EN_EL_MODELO


def test_el_perfil_principal_de_cada_sexo_es_de_ese_sexo(municipios):
    for municipio in municipios:
        for sexo, perfil in (municipio["perfil_principal"] or {}).items():
            assert perfil is None or perfil.startswith(f"{sexo}_")


def test_los_municipios_con_un_solo_sexo_en_el_modelo_no_tienen_perfil_del_otro(municipios):
    con_perfil = [municipio["perfil_principal"] for municipio in municipios if municipio["perfil_principal"]]
    assert sum(None in perfil.values() for perfil in con_perfil) == SOLO_UN_SEXO_EN_EL_MODELO
    assert all(any(perfil.values()) for perfil in con_perfil)
