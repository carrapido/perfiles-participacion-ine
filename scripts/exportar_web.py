"""Exporta los datos del sitio a web/public/data/: perfiles.json, entidades.json, brecha_edad.json, nacional.json
y municipios.json.
Única fuente: data/agregados/ y data/resultados/por_sexo/. El sitio solo lee y dibuja estos archivos,
así que ninguna cifra se escribe a mano en él. Los valores van sin redondear: el sitio los redondea al mostrarlos.
Uso: python scripts/exportar_web.py    (desde la raíz)"""
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

from agregar_ccpc import GRUPOS as GRUPOS_DE_EDAD

# Python busca los módulos en sys.path, que al correr un script solo incluye la carpeta del script (scripts/)
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
from segmentacion import (ANIOS, CLAVES_DE_CELDA, ETAPAS, HOMBRES, MUJERES, SEXOS, VARIABLES, cargar_celdas,
                          tasa_de_participacion)

AGREGADOS, RESULTADOS = "data/agregados", "data/resultados/por_sexo"
DESTINO = Path("web/public/data")
ULTIMA_FEDERAL, JUDICIAL = ANIOS[-1], 2025
ARCHIVO_POR_ELECCION = {**{anio: f"agg_{anio}.csv" for anio in ANIOS}, JUDICIAL: "agg_PJ2025.csv"}
CAMPOS_DE_TEXTO = ["resumen", "quienes", "como_votan", "donde", "lectura", "objetivo"]
ENTIDADES_PRINCIPALES = 5
POR_ENTIDAD_Y_EDAD = ["AELEC", "EDOCVE", "SEXO", "GEDAD"]
POR_MUNICIPIO = ["AELEC", "EDOCVE", "MPIOCVE", "SEXO"]
MUNICIPIO = ["EDOCVE", "MPIOCVE"]  # claves del INE, no las del INEGI
# Erratas de MPIONOM en los CCPC; el nombre correcto se cotejó con el Marco Geográfico Seccional del INE
NOMBRES_CORREGIDOS = {
    (4, 6): "Hopelchén",                           # CCPC: "Hopelche}én"
    (7, 38): "Huitiupán",                          # CCPC: "Huitiupaán"
    (13, 50): "San Agustín Metzquititlán",         # CCPC: "San Agustón Metzquititlán"
    (30, 10): "Alto Lucero de Gutiérrez Barrios",  # CCPC: "Alto Lucero de Gutiérrez Barios"
}
NACIONAL = 0  # clave del total nacional en el catálogo de entidades del INEGI
# Claves de entidad del INEGI, las mismas que usa el INE en EDOCVE
ENTIDADES = {1: "Aguascalientes", 2: "Baja California", 3: "Baja California Sur", 4: "Campeche", 5: "Coahuila",
             6: "Colima", 7: "Chiapas", 8: "Chihuahua", 9: "Ciudad de México", 10: "Durango", 11: "Guanajuato",
             12: "Guerrero", 13: "Hidalgo", 14: "Jalisco", 15: "Estado de México", 16: "Michoacán", 17: "Morelos",
             18: "Nayarit", 19: "Nuevo León", 20: "Oaxaca", 21: "Puebla", 22: "Querétaro", 23: "Quintana Roo",
             24: "San Luis Potosí", 25: "Sinaloa", 26: "Sonora", 27: "Tabasco", 28: "Tamaulipas", 29: "Tlaxcala",
             30: "Veracruz", 31: "Yucatán", 32: "Zacatecas"}


def main() -> None:
    exportar(DESTINO)
    print(f"JSON del sitio escritos en {DESTINO}/")


def exportar(destino: Path) -> None:
    conteos = cargar_conteos(POR_ENTIDAD_Y_EDAD)
    celdas = celdas_del_modelo()
    reparto = reparto_por(celdas, ["EDOCVE"])
    archivos = {
        "perfiles": perfiles(reparto),
        "entidades": entidades(conteos, reparto),
        "brecha_edad": brecha_por_edad(conteos),
        "nacional": por_eleccion(participacion_por_sexo(conteos, ["AELEC"])),
    }
    destino.mkdir(parents=True, exist_ok=True)
    for nombre, contenido in archivos.items():
        escribir_json(destino / f"{nombre}.json", contenido)
    # Sin sangría: son 2,477 municipios y el sitio los descarga todos al abrir
    escribir_json(destino / "municipios.json", municipios(celdas), sangria=None)


def cargar_conteos(claves: list[str]) -> pd.DataFrame:
    """SV y NV de cada elección por cada combinación de `claves` (que incluyen SEXO), sin el sexo no binario."""
    return pd.concat((cargar_eleccion(archivo, claves) for archivo in ARCHIVO_POR_ELECCION.values()),
                     ignore_index=True)


def cargar_eleccion(archivo: str, claves: list[str]) -> pd.DataFrame:
    d = pd.read_csv(f"{AGREGADOS}/{archivo}", usecols=[*claves, "SV", "NV"])
    d = d[d.SEXO.isin(list(SEXOS))]
    return d.groupby(claves, as_index=False)[["SV", "NV"]].sum()


def celdas_del_modelo() -> pd.DataFrame:
    """Las celdas que agrupó el modelo, con su perfil y su lista nominal 2024."""
    asignacion = pd.read_csv(f"{RESULTADOS}/celdas_k2_3.csv")
    lista_nominal = cargar_celdas(f"{AGREGADOS}/agg_{ULTIMA_FEDERAL}.csv").LN
    return asignacion.join(lista_nominal, on=CLAVES_DE_CELDA)


def reparto_por(celdas: pd.DataFrame, territorio: list[str]) -> pd.Series:
    """% de la lista nominal 2024 de cada sexo, en cada territorio, que pertenece a cada perfil.
    Cuenta solo las celdas que agrupó el modelo, igual que la columna `concentracion` del resumen."""
    peso = celdas.groupby([*territorio, "SEXO", "perfil_sexo"]).LN.sum()
    return 100 * peso / peso.groupby(level=[*territorio, "SEXO"]).transform("sum")


def perfiles(reparto: pd.Series) -> list[dict]:
    resumen = pd.read_csv(f"{RESULTADOS}/perfiles_resumen_k2_3.csv")
    resumen.index = resumen.sexo + "_" + resumen.grupo.astype(str)
    with open(f"{RESULTADOS}/textos_perfiles.json", encoding="utf-8") as archivo:
        textos = json.load(archivo)["perfiles"]
    return [describir_perfil(texto, resumen.loc[texto["grupo_csv"]], reparto)
            for texto in sorted(textos, key=lambda texto: texto["orden"])]


def describir_perfil(texto: dict, fila: pd.Series, reparto: pd.Series) -> dict:
    return {
        "id": texto["grupo_csv"],
        **{campo: texto[campo] for campo in ["orden", "nombre", "sexo", "color"]},
        "pct_lista_nominal": fila.pct_LN_total,
        "pct_de_su_sexo": fila.pct_de_su_sexo,
        "trayectoria": [{"anio": anio, "participacion": fila[f"p{anio}"]} for anio in ANIOS],
        "judicial_2025": fila.pPJ2025,
        **{variable: fila[variable] for variable in VARIABLES},
        "etapas": [{"etapa": etapa, "pct": fila[etapa]} for etapa in ETAPAS],
        "entidades_principales": entidades_principales(reparto, texto["grupo_csv"]),
        **{campo: texto[campo] for campo in CAMPOS_DE_TEXTO},
        "estrategias": texto["estrategias"],
    }


def entidades_principales(reparto: pd.Series, perfil: str) -> list[dict]:
    pct_por_entidad = reparto.xs(perfil, level="perfil_sexo").droplevel("SEXO")
    principales = pct_por_entidad.sort_values(ascending=False).head(ENTIDADES_PRINCIPALES)
    return [{"clave": clave, "nombre": ENTIDADES[clave], "pct": pct} for clave, pct in principales.items()]


def entidades(conteos: pd.DataFrame, reparto: pd.Series) -> list[dict]:
    participacion = participacion_por_sexo(conteos, ["EDOCVE", "AELEC"])
    return [{"clave": clave,
             "nombre": nombre,
             "participacion": por_eleccion(participacion.loc[clave]),
             "reparto": reparto_de(reparto, clave),
             "perfil_principal": perfil_principal(reparto.loc[clave])}
            for clave, nombre in ENTIDADES.items()]


def participacion_por_sexo(conteos: pd.DataFrame, por: list[str]) -> pd.DataFrame:
    """Participación de mujeres y de hombres y su brecha, para cada combinación de las columnas `por`."""
    sumas = conteos.groupby([*por, "SEXO"])[["SV", "NV"]].sum()
    tasa = tasa_de_participacion(sumas.SV, sumas.NV).unstack("SEXO")
    brecha = tasa[MUJERES] - tasa[HOMBRES]
    return pd.DataFrame({"mujeres": tasa[MUJERES], "hombres": tasa[HOMBRES], "brecha": brecha})


def por_eleccion(participacion: pd.DataFrame) -> list[dict]:
    """Una entrada por elección, a partir de una tabla indexada por año."""
    return [{"anio": anio, "tipo": "judicial" if anio == JUDICIAL else "federal", **valores}
            for anio, valores in participacion.to_dict("index").items()]


def reparto_de(reparto: pd.Series, clave: int) -> dict[str, float]:
    """% de su sexo en cada perfil; 0 en los perfiles que no tienen celdas en la entidad."""
    todos = sorted(reparto.index.unique("perfil_sexo"))
    return reparto.loc[clave].droplevel("SEXO").reindex(todos, fill_value=0).to_dict()


def perfil_principal(reparto_del_territorio: pd.Series) -> dict[str, str | None]:
    """El perfil con más lista nominal de cada sexo. None en el sexo sin celdas en el modelo: pasa en 31 municipios
    chicos, donde las celdas de ese sexo no llegan a la lista nominal mínima."""
    sexos_con_celdas = reparto_del_territorio.index.unique("SEXO")
    return {nombre: reparto_del_territorio.loc[sexo].idxmax() if sexo in sexos_con_celdas else None
            for sexo, nombre in SEXOS.items()}


def brecha_por_edad(conteos: pd.DataFrame) -> dict:
    """Brecha por grupo de edad en la última federal y en la judicial, nacional y por entidad."""
    recientes = conteos[conteos.AELEC.isin([ULTIMA_FEDERAL, JUDICIAL])]
    nacional = participacion_por_sexo(recientes, ["AELEC", "GEDAD"]).brecha
    por_entidad = participacion_por_sexo(recientes, ["EDOCVE", "AELEC", "GEDAD"]).brecha
    return {
        "grupos_de_edad": GRUPOS_DE_EDAD,
        "ambitos": [curvas_de_brecha(NACIONAL, "Nacional", nacional)]
                   + [curvas_de_brecha(clave, nombre, por_entidad.loc[clave]) for clave, nombre in ENTIDADES.items()],
    }


def curvas_de_brecha(clave: int, nombre: str, brecha: pd.Series) -> dict:
    """brecha está indexada por elección y grupo de edad; la elección que no tenga datos queda en None."""
    curvas = {anio: brecha.xs(anio).reindex(GRUPOS_DE_EDAD).tolist() for anio in brecha.index.unique("AELEC")}
    return {"clave": clave, "nombre": nombre,
            "federal_2024": curvas.get(ULTIMA_FEDERAL), "judicial_2025": curvas.get(JUDICIAL)}


def municipios(celdas: pd.DataFrame) -> dict:
    """Brecha por elección y perfil principal de cada municipio de la última federal."""
    brecha = brecha_por_eleccion(cargar_conteos(POR_MUNICIPIO))
    reparto = reparto_por(celdas, MUNICIPIO)
    return {"elecciones": list(ARCHIVO_POR_ELECCION),
            "municipios": [describir_municipio(clave, nombre, brecha, reparto)
                           for clave, nombre in nombres_de_municipios().items()]}


def brecha_por_eleccion(conteos: pd.DataFrame) -> pd.DataFrame:
    """Una fila por municipio y una columna por elección. Queda NaN donde el municipio no existía o no tuvo votos."""
    brecha = participacion_por_sexo(conteos, [*MUNICIPIO, "AELEC"]).brecha
    return brecha.unstack("AELEC").reindex(columns=list(ARCHIVO_POR_ELECCION))


def nombres_de_municipios() -> pd.Series:
    """El catálogo de la última federal: los municipios que existen hoy y que dibuja el mapa."""
    d = pd.read_csv(f"{AGREGADOS}/agg_{ULTIMA_FEDERAL}.csv", usecols=[*MUNICIPIO, "MPIONOM"])
    nombres = d.drop_duplicates().set_index(MUNICIPIO).MPIONOM
    nombres.update(pd.Series(NOMBRES_CORREGIDOS))
    return nombres


def describir_municipio(clave: tuple[int, int], nombre: str, brecha: pd.DataFrame, reparto: pd.Series) -> dict:
    entidad, municipio = clave
    tiene_perfil = clave in reparto.index  # 222 municipios no tienen ninguna celda en el modelo
    return {"entidad": entidad, "municipio": municipio, "nombre": nombre,
            "brecha": [None if pd.isna(valor) else valor for valor in brecha.loc[clave]],
            "perfil_principal": perfil_principal(reparto.loc[clave]) if tiene_perfil else None}


def escribir_json(ruta: Path, contenido: list | dict, sangria: int | None = 2) -> None:
    # allow_nan=False: NaN no es JSON válido y el sitio no podría leer el archivo; mejor fallar aquí
    texto = json.dumps(contenido, ensure_ascii=False, allow_nan=False, indent=sangria, default=a_tipo_nativo)
    ruta.write_text(texto + "\n", encoding="utf-8")


def a_tipo_nativo(valor: np.generic):
    """json no sabe escribir los enteros de numpy (np.int64)."""
    return valor.item()


if __name__ == "__main__":
    main()
