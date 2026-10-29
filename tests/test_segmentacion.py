"""Las cifras de los cinco perfiles no deben cambiar: el documento técnico las cita."""
import pandas as pd
import pytest

from segmentacion import cargar_celdas, cargar_datos, describir_perfiles, metricas_por_k

AGREGADOS = "data/agregados"

# Perfil (grupo en celdas_k2_3.csv) -> (% de la lista nominal, votaron en 2024, judicial 2025)
CIFRAS_DEL_DOCUMENTO = {
    "hombres_1": (14.4, 48.2, 8.8),
    "hombres_0": (22.3, 50.3, 9.3),
    "hombres_2": (11.4, 71.7, 22.0),
    "mujeres_1": (28.5, 63.2, 13.4),
    "mujeres_0": (23.5, 65.4, 14.0),
}


@pytest.fixture(scope="module")
def datos():
    return cargar_datos(AGREGADOS)


@pytest.fixture(scope="module")
def resumen(datos):
    judicial = cargar_celdas(f"{AGREGADOS}/agg_PJ2025.csv")
    resumen, _ = describir_perfiles(datos, k_mujeres=2, k_hombres=3, judicial=judicial)
    return resumen.set_index(resumen.sexo + "_" + resumen.grupo.astype(str))


@pytest.fixture(scope="module")
def metricas(datos):
    return pd.DataFrame(metricas_por_k(datos)).set_index(["sexo", "k"])


@pytest.mark.parametrize("perfil, cifras", CIFRAS_DEL_DOCUMENTO.items())
def test_cada_perfil_conserva_las_cifras_del_documento(resumen, perfil, cifras):
    fila = resumen.loc[perfil]
    assert (round(fila.pct_LN_total, 1), round(fila.p2024, 1), round(fila.pPJ2025, 1)) == cifras


@pytest.mark.parametrize("sexo, k, estabilidad", [("mujeres", 2, 0.96), ("hombres", 3, 0.97)])
def test_el_k_elegido_conserva_su_estabilidad(metricas, sexo, k, estabilidad):
    assert round(metricas.loc[(sexo, k), "estabilidad_ARI"], 2) == estabilidad
