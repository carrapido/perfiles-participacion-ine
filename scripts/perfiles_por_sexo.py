"""Segmentación estratificada por sexo: se agrupan por separado las celdas de mujeres y las de hombres,
para que cada perfil contenga un solo sexo. Mismas variables y algoritmo que piloto_perfiles.py.
El modelo vive en src/segmentacion.py; este script lo corre y guarda las salidas. Se corre desde la raíz.
Uso: python scripts/perfiles_por_sexo.py            -> métricas por k para cada sexo
     python scripts/perfiles_por_sexo.py 2 3        -> describe k=2 para mujeres y k=3 para hombres (modelo base)"""
import os
import sys
from pathlib import Path

import pandas as pd

# Python busca los módulos en sys.path, que al correr un script solo incluye la carpeta del script (scripts/)
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
from segmentacion import Datos, cargar_celdas, cargar_datos, describir_perfiles, metricas_por_k

AGREGADOS, SALIDA = "data/agregados", "data/resultados/por_sexo"


def main(argumentos: list[str]) -> None:
    os.makedirs(SALIDA, exist_ok=True)
    datos = cargar_datos(AGREGADOS)
    if argumentos:
        guardar_perfiles(datos, k_mujeres=int(argumentos[0]), k_hombres=int(argumentos[1]))
    else:
        guardar_metricas(datos)


def guardar_perfiles(datos: Datos, k_mujeres: int, k_hombres: int) -> None:
    judicial = cargar_celdas(f"{AGREGADOS}/agg_PJ2025.csv")
    resumen, asignacion = describir_perfiles(datos, k_mujeres, k_hombres, judicial)
    with pd.option_context("display.width", 320, "display.max_columns", 60):
        print(resumen.round(1).to_string(index=False))
    resumen.round(2).to_csv(f"{SALIDA}/perfiles_resumen_k{k_mujeres}_{k_hombres}.csv", index=False)
    asignacion.to_csv(f"{SALIDA}/celdas_k{k_mujeres}_{k_hombres}.csv", index=False)


def guardar_metricas(datos: Datos) -> None:
    filas = []
    for fila in metricas_por_k(datos):
        print(fila, flush=True)
        filas.append(fila)
    pd.DataFrame(filas).to_csv(f"{SALIDA}/metricas_k.csv", index=False)


if __name__ == "__main__":
    main(sys.argv[1:])
