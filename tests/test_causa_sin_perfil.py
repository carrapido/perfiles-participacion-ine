"""municipios.json dice por qué un municipio no tiene perfil de un sexo (sin_perfil): no aparece en los conteos de
alguna federal, los conteos no tienen su participación de alguna, o ningún grupo de edad de ese sexo llega a la lista
nominal mínima del modelo en las seis federales."""
import json

import pandas as pd
import pytest

from exportar_web import AGREGADOS, causa_sin_perfil, exportar
from segmentacion import ANIOS, LISTA_NOMINAL_MINIMA, SEXOS, cargar_celdas

OXCHUC, SAN_ANDRES_DURAZNAL, SAN_QUINTIN = (7, 64), (7, 117), (2, 6)
CODIGO_DEL_SEXO = {nombre: codigo for codigo, nombre in SEXOS.items()}


def votos_contados(cambios: dict[int, float]) -> pd.Series:
    """SV + NV de un municipio en cada federal: 500 en todas, salvo en las de `cambios`."""
    return pd.Series({**dict.fromkeys(ANIOS, 500.0), **cambios})


def test_el_municipio_que_falta_en_los_conteos_de_alguna_federal():
    causa = causa_sin_perfil(votos_contados({2009: float("nan"), 2012: float("nan")}))
    assert causa == {"causa": "fuera_de_los_conteos", "elecciones": [2009, 2012]}


def test_el_municipio_sin_votos_contados_en_alguna_federal():
    causa = causa_sin_perfil(votos_contados({2015: 0, 2021: 0}))
    assert causa == {"causa": "sin_conteo", "elecciones": [2015, 2021]}


def test_faltar_en_los_conteos_va_antes_que_no_tener_votos_contados():
    causa = causa_sin_perfil(votos_contados({2012: float("nan"), 2021: 0}))
    assert causa == {"causa": "fuera_de_los_conteos", "elecciones": [2012]}


def test_con_votos_contados_en_las_seis_federales_la_causa_es_la_lista_nominal():
    assert causa_sin_perfil(votos_contados({})) == {"causa": "lista_nominal_chica", "minima": LISTA_NOMINAL_MINIMA}


@pytest.fixture(scope="module")
def municipios(tmp_path_factory):
    destino = tmp_path_factory.mktemp("data")
    exportar(destino)
    return json.loads((destino / "municipios.json").read_text(encoding="utf-8"))["municipios"]


def test_solo_los_sexos_sin_perfil_tienen_causa(municipios):
    for municipio in municipios:
        principal = municipio["perfil_principal"]
        sexos_sin_perfil = {sexo for sexo in SEXOS.values() if principal is None or principal[sexo] is None}
        assert set(municipio.get("sin_perfil", {})) == sexos_sin_perfil


@pytest.mark.parametrize("clave, causa", [
    (OXCHUC, {"causa": "sin_conteo", "elecciones": [2021]}),
    (SAN_ANDRES_DURAZNAL, {"causa": "fuera_de_los_conteos", "elecciones": [2012]}),
    (SAN_QUINTIN, {"causa": "fuera_de_los_conteos", "elecciones": [2009, 2012, 2015, 2018, 2021]}),
])
def test_la_causa_de_municipios_conocidos(municipios, clave, causa):
    municipio = next(m for m in municipios if (m["entidad"], m["municipio"]) == clave)
    assert municipio["sin_perfil"] == {"mujeres": causa, "hombres": causa}


def test_con_lista_nominal_chica_ningun_grupo_de_edad_llega_a_la_minima_en_las_seis_federales(municipios):
    minima_de_cada_celda = pd.DataFrame(
        {anio: cargar_celdas(f"{AGREGADOS}/agg_{anio}.csv").LN for anio in ANIOS}).min(axis=1)
    for municipio in municipios:
        for sexo, causa in municipio.get("sin_perfil", {}).items():
            if causa["causa"] == "lista_nominal_chica":
                clave = (municipio["entidad"], municipio["municipio"], CODIGO_DEL_SEXO[sexo])
                assert minima_de_cada_celda.loc[clave].max() < LISTA_NOMINAL_MINIMA
