"""Segmentación de la ciudadanía en perfiles de participación, por separado para mujeres y para hombres,
para que cada perfil contenga un solo sexo.

Unidad de análisis: celda municipio × sexo × etapa de vida. Cada celda se describe con cinco variables
de su participación federal 2009–2024 y se agrupa con k-means ponderado por su lista nominal de 2024.
La elección judicial 2025 no entra al agrupamiento: solo sirve para validar los perfiles.
Lo usan scripts/perfiles_por_sexo.py y el notebook."""
from collections.abc import Iterator
from dataclasses import dataclass
from typing import NamedTuple

import numpy as np
import pandas as pd

MUJERES, HOMBRES = 1, 0
SEXOS = {MUJERES: "mujeres", HOMBRES: "hombres"}
ANIOS = [2009, 2012, 2015, 2018, 2021, 2024]
VARIABLES = ["nivel", "tendencia", "ciclo", "ventaja", "rural"]
ETAPAS = ["18-24", "25-34", "35-44", "45-59", "60-69", "70+"]
CLAVES_DE_CELDA = ["EDOCVE", "MPIOCVE", "SEXO", "ETAPA"]
# Grupo de edad (GEDAD) de los CCPC -> etapa de vida; los grupos que no aparecen aquí son 70+
ETAPA_POR_GEDAD = {"18": "18-24", "19": "18-24", "20-24": "18-24", "25-29": "25-34", "30-34": "25-34",
                   "35-39": "35-44", "40-44": "35-44", "45-49": "45-59", "50-54": "45-59", "55-59": "45-59",
                   "60-64": "60-69", "65-69": "60-69"}
LISTA_NOMINAL_MINIMA = 100
SEMILLAS_DE_INICIO = range(6)


@dataclass(frozen=True)
class Datos:
    """Celdas comparables entre 2009 y 2024: las que tienen participación en los seis años, de los dos sexos,
    y al menos LISTA_NOMINAL_MINIMA ciudadanos en cada año."""
    conteos: dict[int, pd.DataFrame]  # LN, SV, NV y LN_R de cada celda, por año
    variables: pd.DataFrame
    peso: pd.Series  # lista nominal 2024


@dataclass(frozen=True)
class Segmento:
    """Celdas de un solo sexo, listas para agrupar."""
    sexo: int
    variables: pd.DataFrame
    puntos: np.ndarray  # variables estandarizadas
    peso: pd.Series


class Ajuste(NamedTuple):
    etiquetas: np.ndarray
    centros: np.ndarray
    inercia: float


def cargar_datos(carpeta: str) -> Datos:
    conteos = {anio: cargar_celdas(f"{carpeta}/agg_{anio}.csv") for anio in ANIOS}
    participacion = pd.DataFrame({anio: tasa_de_participacion(c.SV, c.NV) for anio, c in conteos.items()})
    lista_nominal = pd.DataFrame({anio: c.LN for anio, c in conteos.items()})
    del_otro_sexo = participacion_del_otro_sexo(participacion)
    comparable = (participacion.notna().all(axis=1) & (lista_nominal.min(axis=1) >= LISTA_NOMINAL_MINIMA)
                  & del_otro_sexo.notna().all(axis=1))
    variables = calcular_variables(participacion[comparable], del_otro_sexo[comparable], conteos[2024])
    return Datos(conteos, variables, lista_nominal[comparable][2024])


def cargar_celdas(ruta: str) -> pd.DataFrame:
    """Suma LN, SV, NV y la lista nominal rural (LN_R) de cada celda. Excluye el sexo no binario."""
    d = pd.read_csv(ruta, low_memory=False)
    d = d[d.SEXO.isin([HOMBRES, MUJERES])].copy()
    d["ETAPA"] = d.GEDAD.astype(str).map(ETAPA_POR_GEDAD).fillna("70+")
    d["LN_R"] = np.where(d.TIPOSEC == "R", d.LN, 0)
    return d.groupby(CLAVES_DE_CELDA)[["LN", "SV", "NV", "LN_R"]].sum()


def tasa_de_participacion(sv, nv):
    """SV / (SV + NV), en porcentaje. Sirve para una celda o para la suma de varias."""
    return 100 * sv / (sv + nv)


def participacion_del_otro_sexo(participacion: pd.DataFrame) -> pd.DataFrame:
    """Alinea cada celda con la del otro sexo en el mismo municipio y etapa."""
    otro = participacion.copy()
    otro.index = otro.index.set_levels(otro.index.levels[2].map(lambda sexo: 1 - sexo), level=2)
    return otro.reindex(participacion.index)


def calcular_variables(participacion: pd.DataFrame, del_otro_sexo: pd.DataFrame,
                       conteos_2024: pd.DataFrame) -> pd.DataFrame:
    anios = np.array(ANIOS, float)
    anios_centrados = anios - anios.mean()
    variables = pd.DataFrame(index=participacion.index)
    variables["nivel"] = participacion.mean(axis=1)
    # Pendiente de mínimos cuadrados (puntos por año) × 3: cambio por periodo, porque hay elección federal cada 3 años
    variables["tendencia"] = (3 * (participacion.sub(participacion.mean(axis=1), axis=0) * anios_centrados).sum(axis=1)
                              / (anios_centrados ** 2).sum())
    variables["ciclo"] = participacion[[2012, 2018, 2024]].mean(axis=1) - participacion[[2009, 2015, 2021]].mean(axis=1)
    variables["ventaja"] = (participacion - del_otro_sexo).mean(axis=1)
    variables["rural"] = (100 * conteos_2024.LN_R.reindex(variables.index)
                          / conteos_2024.LN.reindex(variables.index))
    return variables


def metricas_por_k(datos: Datos, valores_de_k=range(2, 6), semilla: int = 7) -> Iterator[dict]:
    """Inercia, silueta y estabilidad de cada k, primero para mujeres y luego para hombres.
    Un solo generador aleatorio recorre todo en este orden: cambiar el orden cambia las cifras."""
    rng = np.random.default_rng(semilla)
    for sexo in SEXOS:
        segmento = segmento_de(datos, sexo)
        for k in valores_de_k:
            yield medir_k(segmento, k, rng)


def segmento_de(datos: Datos, sexo: int) -> Segmento:
    variables = datos.variables[datos.variables.index.get_level_values(2) == sexo]
    peso = datos.peso.reindex(variables.index)
    # Media ponderada y desviación sin ponderar: así se fijó el modelo, y cambiarlo cambia los perfiles
    media = np.average(variables[VARIABLES], axis=0, weights=peso.to_numpy(float))
    desviacion = variables[VARIABLES].std().to_numpy()
    return Segmento(sexo, variables, (variables[VARIABLES].to_numpy() - media) / desviacion, peso)


def medir_k(segmento: Segmento, k: int, rng: np.random.Generator) -> dict:
    ajuste = mejor_ajuste(segmento, k)
    estabilidad = estabilidad_ari(segmento, k, ajuste.etiquetas, rng)  # usa rng antes que la silueta
    return {"sexo": SEXOS[segmento.sexo], "celdas": len(segmento.puntos), "k": k,
            "inercia": round(ajuste.inercia, 3),
            "silueta": round(silueta(segmento.puntos, ajuste.etiquetas, rng), 3),
            "estabilidad_ARI": round(estabilidad, 3)}


def mejor_ajuste(segmento: Segmento, k: int) -> Ajuste:
    """El de menor inercia entre varios inicios de k-means."""
    pesos = segmento.peso.to_numpy(float)
    return min((kmeans(segmento.puntos, pesos, k, semilla) for semilla in SEMILLAS_DE_INICIO),
               key=lambda ajuste: ajuste.inercia)


def kmeans(puntos: np.ndarray, pesos: np.ndarray, k: int, semilla: int, iteraciones: int = 200) -> Ajuste:
    rng = np.random.default_rng(semilla)
    centros = iniciar_centros(puntos, pesos, k, rng)
    for _ in range(iteraciones):
        etiquetas = distancias_cuadradas(puntos, centros).argmin(axis=1)
        nuevos = recalcular_centros(puntos, pesos, etiquetas, centros)
        if np.allclose(nuevos, centros):
            break
        centros = nuevos
    inercia = (pesos * ((puntos - centros[etiquetas]) ** 2).sum(axis=1)).sum() / pesos.sum()
    return Ajuste(etiquetas, centros, inercia)


def iniciar_centros(puntos: np.ndarray, pesos: np.ndarray, k: int, rng: np.random.Generator) -> np.ndarray:
    """k-means++ ponderado: cada centro nuevo se sortea con probabilidad proporcional a
    peso × distancia² al centro más cercano."""
    n = len(puntos)
    centros = [puntos[rng.choice(n, p=pesos / pesos.sum())]]
    for _ in range(k - 1):
        d2 = distancias_cuadradas(puntos, np.array(centros)).min(axis=1)
        centros.append(puntos[rng.choice(n, p=pesos * d2 / (pesos * d2).sum())])
    return np.array(centros)


def distancias_cuadradas(puntos: np.ndarray, centros: np.ndarray) -> np.ndarray:
    return ((puntos[:, None, :] - centros[None]) ** 2).sum(-1)


def recalcular_centros(puntos: np.ndarray, pesos: np.ndarray, etiquetas: np.ndarray,
                       centros: np.ndarray) -> np.ndarray:
    """Media ponderada de cada grupo; un grupo vacío conserva su centro."""
    return np.array([np.average(puntos[etiquetas == j], axis=0, weights=pesos[etiquetas == j])
                     if (etiquetas == j).any() else centros[j]
                     for j in range(len(centros))])


def estabilidad_ari(segmento: Segmento, k: int, etiquetas: np.ndarray, rng: np.random.Generator,
                    repeticiones: int = 5, fraccion: float = 0.8) -> float:
    """ARI medio entre el ajuste completo y ajustes sobre submuestras de las celdas."""
    pesos, n = segmento.peso.to_numpy(float), len(segmento.puntos)
    valores = []
    for repeticion in range(repeticiones):
        i = rng.choice(n, size=int(fraccion * n), replace=False)
        submuestra = kmeans(segmento.puntos[i], pesos[i], k, semilla=100 + repeticion)
        valores.append(ari(etiquetas[i], submuestra.etiquetas))
    return float(np.mean(valores))


def ari(a: np.ndarray, b: np.ndarray) -> float:
    """Índice de Rand ajustado entre dos particiones de las mismas celdas."""
    tabla = pd.crosstab(a, b).to_numpy()
    iguales = pares(tabla).sum()
    en_a, en_b = pares(tabla.sum(axis=1)).sum(), pares(tabla.sum(axis=0)).sum()
    esperado = en_a * en_b / pares(tabla.sum())
    return (iguales - esperado) / ((en_a + en_b) / 2 - esperado)


def pares(n):
    return n * (n - 1) / 2


def silueta(puntos: np.ndarray, etiquetas: np.ndarray, rng: np.random.Generator, muestra: int = 2000) -> float:
    """Silueta media sobre una muestra de celdas: la exacta crece con el cuadrado del número de celdas."""
    i = rng.choice(len(puntos), size=min(muestra, len(puntos)), replace=False)
    etiquetas_muestra = etiquetas[i]
    distancias = np.sqrt(distancias_cuadradas(puntos[i], puntos[i]))
    valores = [silueta_de_punto(distancias[a], etiquetas_muestra, a) for a in range(len(i))]
    return float(np.mean([v for v in valores if v is not None]))


def silueta_de_punto(distancias: np.ndarray, etiquetas: np.ndarray, a: int) -> float | None:
    """None cuando el punto es el único de su grupo en la muestra."""
    mismo_grupo = etiquetas == etiquetas[a]
    mismo_grupo[a] = False
    if not mismo_grupo.any():
        return None
    separacion = min(distancias[etiquetas == j].mean() for j in set(etiquetas) if j != etiquetas[a])
    cohesion = distancias[mismo_grupo].mean()
    return (separacion - cohesion) / max(cohesion, separacion)


def describir_perfiles(datos: Datos, k_mujeres: int, k_hombres: int,
                       judicial: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Resumen de cada perfil y perfil asignado a cada celda.
    judicial son los conteos de la elección judicial 2025 (cargar_celdas): solo valida, no agrupa."""
    resumen, asignacion = [], []
    for sexo, k in ((MUJERES, k_mujeres), (HOMBRES, k_hombres)):
        segmento = segmento_de(datos, sexo)
        etiquetas = mejor_ajuste(segmento, k).etiquetas
        resumen += [describir_grupo(datos, segmento, etiquetas == grupo, grupo, judicial) for grupo in range(k)]
        asignacion.append(pd.DataFrame({"perfil_sexo": [f"{SEXOS[sexo]}_{e}" for e in etiquetas]},
                                       index=segmento.variables.index))
    return pd.DataFrame(resumen), pd.concat(asignacion).reset_index()


def describir_grupo(datos: Datos, segmento: Segmento, en_grupo: np.ndarray, grupo: int,
                    judicial: pd.DataFrame) -> dict:
    celdas = segmento.variables.index[en_grupo]
    peso = segmento.peso[en_grupo]
    return {
        "sexo": SEXOS[segmento.sexo],
        "grupo": grupo,
        "pct_LN_total": 100 * peso.sum() / datos.peso.sum(),
        "pct_de_su_sexo": 100 * peso.sum() / segmento.peso.sum(),
        "celdas": int(en_grupo.sum()),
        **{f"p{anio}": participacion_agregada(datos.conteos[anio], celdas) for anio in ANIOS},
        **{v: np.average(segmento.variables.loc[celdas, v], weights=peso) for v in VARIABLES},
        "pPJ2025": participacion_agregada(judicial, celdas),
        **{etapa: 100 * peso[celdas.get_level_values(3) == etapa].sum() / peso.sum() for etapa in ETAPAS},
        "concentracion": concentracion_por_entidad(peso, segmento.peso),
    }


def participacion_agregada(conteos: pd.DataFrame, celdas: pd.Index) -> float:
    seleccion = conteos.reindex(celdas)
    return tasa_de_participacion(seleccion.SV.sum(), seleccion.NV.sum())


def concentracion_por_entidad(peso_grupo: pd.Series, peso_sexo: pd.Series, entidades: int = 5) -> str:
    """Entidades donde el perfil abarca más de su sexo, como 'clave:porcentaje'."""
    por_entidad = 100 * peso_grupo.groupby(level=0).sum() / peso_sexo.groupby(level=0).sum()
    principales = por_entidad.sort_values(ascending=False).head(entidades)
    return ", ".join(f"{int(entidad)}:{pct:.0f}%" for entidad, pct in principales.items())
