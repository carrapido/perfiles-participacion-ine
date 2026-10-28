"""Agrega los Conteos Censales de Participacion Ciudadana (CCPC) del INE.

Entrada : CSV crudos en GOOGLE_COLAB_HCKTN/ (una fila = seccion x sexo x edad).
Salida  : data/agregados/agg_<anio>.csv, una fila por
          entidad x municipio x distrito federal x tipo de seccion x sexo x grupo de edad,
          con las sumas de LN, SV, NV y NS.
          data/agregados/calidad_<anio>.json con el control de calidad.

Uso:
    python3 scripts/agregar_ccpc.py --anio 2024
    python3 scripts/agregar_ccpc.py --anio todos
    python3 scripts/agregar_ccpc.py --anio 2012 --estados col,bcs    # prueba rapida
"""
import argparse
import glob
import json
import os
import sys

import pandas as pd

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CRUDOS = os.path.join(RAIZ, "GOOGLE_COLAB_HCKTN")
SALIDA = os.path.join(RAIZ, "data", "agregados")

ANIOS = ["2009", "2012", "2015", "2018", "2021", "2024", "PJ2025"]
CARPETA = {a: f"DatosAbiertos_DECEyEC_ConteosCensales{a}" for a in ANIOS}
# El ZIP oficial de PJ 2025 no incluye Campeche: se esperan 31 entidades.
ESPERADAS = {a: 32 for a in ANIOS}
ESPERADAS["PJ2025"] = 31

CORTES = [17, 18, 19, 24, 29, 34, 39, 44, 49, 54, 59, 64, 69, 74, 79, 84, 200]
GRUPOS = ["18", "19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54",
          "55-59", "60-64", "65-69", "70-74", "75-79", "80-84", "85+"]
COLS = ["AELEC", "EDOCVE", "MPIOCVE", "MPIONOM", "DEF", "TIPOSEC", "SEXO", "EDAD", "LN", "SV", "NV", "NS"]
LLAVES = ["AELEC", "EDOCVE", "MPIOCVE", "MPIONOM", "DEF", "TIPOSEC", "SEXO", "GEDAD"]
MEDIDAS = ["LN", "SV", "NV", "NS"]


def agregar(anio, estados=None):
    carpeta = os.path.join(CRUDOS, CARPETA[anio])
    archivos = sorted(glob.glob(os.path.join(carpeta, "*.csv")))
    if estados:
        archivos = [f for f in archivos if f.rsplit("_", 1)[-1][:-4] in estados]
    if not archivos:
        sys.exit(f"No hay CSV en {carpeta}")
    print(f"[{anio}] {len(archivos)} archivos", flush=True)

    partes = []
    for f in archivos:
        for ch in pd.read_csv(f, usecols=COLS, chunksize=1_000_000, encoding="utf-8-sig", low_memory=False):
            ch["GEDAD"] = pd.cut(ch["EDAD"], bins=CORTES, labels=GRUPOS)
            partes.append(ch.groupby(LLAVES, observed=True, dropna=False)[MEDIDAS].sum().reset_index())
        print(f"  ok {os.path.basename(f)}", flush=True)
    df = pd.concat(partes).groupby(LLAVES, observed=True, dropna=False)[MEDIDAS].sum().reset_index()

    os.makedirs(SALIDA, exist_ok=True)
    sufijo = "_prueba" if estados else ""
    ruta = os.path.join(SALIDA, f"agg_{anio}{sufijo}.csv")
    df.to_csv(ruta, index=False)

    # Control de calidad
    ents = sorted(int(e) for e in df["EDOCVE"].dropna().unique())
    faltan = sorted(set(range(1, 33)) - set(ents))
    tot = df[MEDIDAS].sum()
    bin_ = df[df["SEXO"].isin([0, 1])].groupby("SEXO")[["SV", "NV"]].sum()
    part = (100 * bin_["SV"] / (bin_["SV"] + bin_["NV"])).round(2)
    calidad = {
        "anio": anio,
        "archivo": os.path.relpath(ruta, RAIZ),
        "filas": int(len(df)),
        "entidades": len(ents),
        "entidades_esperadas": ESPERADAS[anio],
        "claves_faltantes": faltan,
        "completo": len(ents) >= ESPERADAS[anio],
        "LN": int(tot.LN), "SV": int(tot.SV), "NV": int(tot.NV), "NS": int(tot.NS),
        "NS_pct": round(100 * tot.NS / tot.LN, 2),
        "participacion_hombres": float(part.get(0, float("nan"))),
        "participacion_mujeres": float(part.get(1, float("nan"))),
        "registros_no_binario_LN": int(df.loc[df["SEXO"] == 2, "LN"].sum()),
        "filas_sin_grupo_edad": int(df["GEDAD"].isna().sum()),
        # En 2012 hay secciones sin distrito federal (ej. BCS, 7.8% de su LN): no usar DEF sin revisar esto.
        "DEF_vacio_LN_pct": round(100 * df.loc[df["DEF"].astype(str).str.strip().isin(["", "nan"]), "LN"].sum() / tot.LN, 2),
    }
    with open(os.path.join(SALIDA, f"calidad_{anio}{sufijo}.json"), "w", encoding="utf-8") as fh:
        json.dump(calidad, fh, ensure_ascii=False, indent=2)
    estado = "COMPLETO" if calidad["completo"] else f"INCOMPLETO, faltan claves {faltan}"
    print(f"[{anio}] {len(ents)}/{ESPERADAS[anio]} entidades: {estado}. Salida: {calidad['archivo']}", flush=True)
    return calidad


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--anio", required=True, help="2009, 2012, 2015, 2018, 2021, 2024, PJ2025 o todos")
    p.add_argument("--estados", help="abreviaturas separadas por coma (ags,bc,...) para una prueba rapida")
    a = p.parse_args()
    anios = ANIOS if a.anio == "todos" else [a.anio]
    estados = set(a.estados.split(",")) if a.estados else None
    resultados = [agregar(x, estados) for x in anios]
    incompletos = [r["anio"] for r in resultados if not r["completo"]]
    if incompletos and not estados:
        print(f"\nATENCION: anios incompletos {incompletos}. No analizar hasta completarlos.")
        sys.exit(2)


if __name__ == "__main__":
    main()
