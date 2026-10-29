"""Los JSON del sitio salen de data/agregados y data/resultados/por_sexo, y sus cifras coinciden con las del
documento técnico y con el control de calidad de los agregados."""
import json

import pytest

from exportar_web import exportar

ARCHIVOS = ["perfiles", "entidades", "brecha_edad", "nacional"]
ELECCIONES = [(2009, "federal"), (2012, "federal"), (2015, "federal"), (2018, "federal"),
              (2021, "federal"), (2024, "federal"), (2025, "judicial")]
CALIDAD_POR_ANIO = {2009: "2009", 2012: "2012", 2015: "2015", 2018: "2018", 2021: "2021", 2024: "2024",
                    2025: "PJ2025"}
# Nombre, color y (% de la lista nominal, votaron en 2024, judicial 2025), en el orden del documento técnico
PERFILES_DEL_DOCUMENTO = [
    ("Hombres en rezago persistente", "#2A78D6", (14.4, 48.2, 8.8)),
    ("Hombres de voto presidencial", "#E8693A", (22.3, 50.3, 9.3)),
    ("Hombres mayores comprometidos", "#1FB07A", (11.4, 71.7, 22.0)),
    ("Mujeres urbanas en ascenso", "#12366B", (28.5, 63.2, 13.4)),
    ("Mujeres de voto constante", "#D6517E", (23.5, 65.4, 14.0)),
]
CAMPOS_DE_TEXTO = ["resumen", "quienes", "como_votan", "donde", "lectura", "objetivo"]
GRUPOS_DE_EDAD = ["18", "19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59",
                  "60-64", "65-69", "70-74", "75-79", "80-84", "85+"]
CAMPECHE = 4  # el INE no publicó sus conteos de la elección judicial 2025


@pytest.fixture(scope="module")
def carpeta(tmp_path_factory):
    destino = tmp_path_factory.mktemp("data")
    exportar(destino)
    return destino


@pytest.fixture(scope="module")
def sitio(carpeta):
    return {nombre: json.loads((carpeta / f"{nombre}.json").read_text(encoding="utf-8")) for nombre in ARCHIVOS}


def perfil_llamado(sitio, nombre):
    return next(perfil for perfil in sitio["perfiles"] if perfil["nombre"] == nombre)


def test_los_cuatro_archivos_pesan_menos_de_2_mb(carpeta):
    assert sum((carpeta / f"{nombre}.json").stat().st_size for nombre in ARCHIVOS) < 2_000_000


def test_nacional_cubre_las_siete_elecciones(sitio):
    assert [(eleccion["anio"], eleccion["tipo"]) for eleccion in sitio["nacional"]] == ELECCIONES


@pytest.mark.parametrize("anio, sufijo", CALIDAD_POR_ANIO.items())
def test_nacional_coincide_con_el_control_de_calidad(sitio, anio, sufijo):
    with open(f"data/agregados/calidad_{sufijo}.json", encoding="utf-8") as archivo:
        calidad = json.load(archivo)
    eleccion = next(eleccion for eleccion in sitio["nacional"] if eleccion["anio"] == anio)
    # El sitio recibe el valor exacto; el control de calidad lo guarda redondeado a 2 decimales
    assert ((eleccion["mujeres"], eleccion["hombres"])
            == (pytest.approx(calidad["participacion_mujeres"], abs=0.005),
                pytest.approx(calidad["participacion_hombres"], abs=0.005)))


def test_la_brecha_es_mujeres_menos_hombres(sitio):
    for eleccion in sitio["nacional"]:
        assert eleccion["brecha"] == pytest.approx(eleccion["mujeres"] - eleccion["hombres"])


def test_los_perfiles_siguen_el_orden_y_los_colores_del_documento(sitio):
    assert ([(perfil["nombre"], perfil["color"]) for perfil in sitio["perfiles"]]
            == [(nombre, color) for nombre, color, _ in PERFILES_DEL_DOCUMENTO])


@pytest.mark.parametrize("nombre, cifras", [(nombre, cifras) for nombre, _, cifras in PERFILES_DEL_DOCUMENTO])
def test_cada_perfil_conserva_las_cifras_del_documento(sitio, nombre, cifras):
    perfil = perfil_llamado(sitio, nombre)
    votaron_2024 = next(punto["participacion"] for punto in perfil["trayectoria"] if punto["anio"] == 2024)
    assert (round(perfil["pct_lista_nominal"], 1), round(votaron_2024, 1), round(perfil["judicial_2025"], 1)) == cifras


def test_rezago_persistente_pesa_mas_en_colima_nuevo_leon_queretaro_sonora_y_campeche(sitio):
    perfil = perfil_llamado(sitio, "Hombres en rezago persistente")
    assert ([entidad["nombre"] for entidad in perfil["entidades_principales"]]
            == ["Colima", "Nuevo León", "Querétaro", "Sonora", "Campeche"])


def test_cada_perfil_trae_sus_textos_y_de_2_a_3_estrategias(sitio):
    for perfil in sitio["perfiles"]:
        assert all(perfil[campo] for campo in CAMPOS_DE_TEXTO)
        assert 2 <= len(perfil["estrategias"]) <= 3


def test_hay_32_entidades_y_solo_campeche_no_tiene_eleccion_judicial(sitio):
    anios_por_entidad = {entidad["clave"]: [e["anio"] for e in entidad["participacion"]]
                         for entidad in sitio["entidades"]}
    todas, sin_judicial = [anio for anio, _ in ELECCIONES], [anio for anio, _ in ELECCIONES[:-1]]
    assert len(anios_por_entidad) == 32
    assert all(anios == (sin_judicial if clave == CAMPECHE else todas) for clave, anios in anios_por_entidad.items())


def test_el_reparto_de_cada_sexo_suma_100_en_cada_entidad(sitio):
    for entidad in sitio["entidades"]:
        for sexo in ("mujeres", "hombres"):
            total = sum(pct for perfil, pct in entidad["reparto"].items() if perfil.startswith(sexo))
            assert total == pytest.approx(100, abs=0.05)


def test_el_perfil_principal_de_cada_sexo_es_el_que_mas_pesa(sitio):
    for entidad in sitio["entidades"]:
        for sexo, principal in entidad["perfil_principal"].items():
            del_sexo = {perfil: pct for perfil, pct in entidad["reparto"].items() if perfil.startswith(sexo)}
            assert principal == max(del_sexo, key=del_sexo.get)


def test_la_brecha_por_edad_usa_los_16_grupos_de_los_ccpc(sitio):
    assert sitio["brecha_edad"]["grupos_de_edad"] == GRUPOS_DE_EDAD


def test_la_brecha_por_edad_trae_el_nacional_y_las_32_entidades(sitio):
    ambitos = sitio["brecha_edad"]["ambitos"]
    assert (ambitos[0]["nombre"], len(ambitos)) == ("Nacional", 33)
    assert all(len(ambito["federal_2024"]) == 16 for ambito in ambitos)


def test_en_la_judicial_nacional_la_brecha_se_invierte_desde_los_60(sitio):
    nacional = sitio["brecha_edad"]["ambitos"][0]
    brecha = dict(zip(GRUPOS_DE_EDAD, nacional["judicial_2025"]))
    assert max(brecha, key=brecha.get) == "35-39"
    assert (round(brecha["35-39"], 1), round(brecha["60-64"], 1), round(brecha["75-79"], 1)) == (3.4, -0.3, -8.8)


def test_campeche_no_tiene_curva_judicial(sitio):
    campeche = next(ambito for ambito in sitio["brecha_edad"]["ambitos"] if ambito["clave"] == CAMPECHE)
    assert campeche["judicial_2025"] is None
