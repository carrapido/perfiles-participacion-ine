# Perfiles de participación ciudadana

Proyecto del equipo **Utrinos** para el Reto 1 del hackatón del INE "Hackea la participación".

Agrupa a la ciudadanía en cinco perfiles de participación electoral con los Conteos Censales de Participación Ciudadana (CCPC) del INE de las elecciones federales de 2009 a 2024, y los valida con la elección judicial de 2025. Incluye un sitio web con un mapa de México por municipio, un panel que cambia con el zoom y una ficha por perfil.

**Sitio:** https://carrapido.github.io/perfiles-participacion-ine/

**Notebook:** [abrir en Google Colab](https://colab.research.google.com/github/carrapido/perfiles-participacion-ine/blob/main/notebooks/perfiles_participacion.ipynb). Con *Entorno de ejecución → Ejecutar todo* reproduce el análisis completo y comprueba sus cifras; no hay que preparar nada.

## Metodología en breve

- **Unidad de análisis:** la celda municipio × sexo × etapa de vida (18-24, 25-34, 35-44, 45-59, 60-69 y 70 o más).
- **Variables:** cinco medidas de la participación federal de cada celda entre 2009 y 2024: nivel, tendencia, ciclo presidencial, ventaja frente al otro sexo y porcentaje de lista nominal en secciones rurales.
- **Modelo:** k-means ponderado por la lista nominal de 2024, por separado para mujeres (k = 2) y para hombres (k = 3), para que cada perfil tenga un solo sexo.
- **Validación:** la elección judicial de 2025 no entra al agrupamiento; sirve para comprobar que los perfiles se comportan como se espera.
- **Perfiles:** Hombres en rezago persistente, Hombres de voto presidencial, Hombres mayores comprometidos, Mujeres urbanas en ascenso y Mujeres de voto constante.

El detalle de los datos, el método, los resultados y sus limitaciones está en el documento técnico.

## Qué hay en el repositorio

| Ruta | Contenido |
|---|---|
| `scripts/agregar_ccpc.py` | Suma los CSV crudos de los CCPC por entidad, municipio, distrito, tipo de sección, sexo y grupo de edad, y revisa su calidad. |
| `src/segmentacion.py` | El modelo: arma las celdas, calcula las cinco variables y agrupa con k-means ponderado. |
| `scripts/perfiles_por_sexo.py` | Corre el modelo y guarda los perfiles en `data/resultados/por_sexo/`. |
| `scripts/piloto_perfiles.py` | Primera corrida exploratoria, sin separar por sexo. |
| `scripts/resumen.py` | Resumen rápido de un archivo agregado: participación por sexo, edad y tipo de sección. |
| `scripts/exportar_web.py` | Exporta los JSON del sitio a `web/public/data/`. |
| `scripts/preparar_geometria.sh` | Genera el mapa (`web/public/data/mexico.topo.json`) desde el Marco Geográfico Seccional del INE. |
| `scripts/unir_en_pdf.py` | Reúne las fichas PNG en un PDF. |
| `data/agregados/` | CCPC agregados de cada elección y su control de calidad. |
| `data/resultados/por_sexo/` | Asignación de celdas, resumen de los perfiles, métricas por k y los textos de los perfiles (`textos_perfiles.json`, escritos por el equipo). |
| `web/` | Sitio web: Vite, React y TypeScript, con D3 para el mapa y ECharts para las gráficas. |
| `notebooks/perfiles_participacion.ipynb` | Notebook de Colab: reproduce el análisis importando `src/` y `scripts/`, y comprueba sus cifras. |
| `entregables/fichas/` | Las cinco fichas de perfil en PNG y el PDF que las reúne. |
| `tests/` | Pruebas de Python (pytest). Las del sitio están junto a su código, en `web/src/**/*.test.ts` (Vitest). |

## Cómo correrlo

### Requisitos

- Python 3.12.
- Node.js 20.19 o 22.12 en adelante (lo pide Vite 8).

### Análisis en Python

Desde la raíz del repositorio:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m pytest                          # pruebas
python scripts/perfiles_por_sexo.py 2 3   # perfiles: k = 2 para mujeres y k = 3 para hombres
python scripts/exportar_web.py            # datos del sitio en web/public/data/
```

### Sitio web

```bash
cd web
npm ci
npm run dev        # http://localhost:5173/perfiles-participacion-ine/
npx vitest run     # pruebas
npm run build      # sitio estático en web/dist/
```

### Datos crudos

Los CSV crudos pesan más de 2.5 GB y no están en el repositorio; `data/agregados/` sí está, así que solo hacen falta para volver a generarlo.

1. Descarga los conteos censales de cada elección desde la [plataforma de Conteos Censales de Participación Ciudadana del INE](https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/).
2. Pon cada uno en su carpeta: `GOOGLE_COLAB_HCKTN/DatosAbiertos_DECEyEC_ConteosCensales<elección>/`, donde `<elección>` es 2009, 2012, 2015, 2018, 2021, 2024 o PJ2025.
3. Corre `python scripts/agregar_ccpc.py --anio todos`.

### Geometría del mapa

`web/public/data/mexico.topo.json` ya está en el repositorio. Para volver a generarlo, después de `npm ci` en `web/`:

```bash
bash scripts/preparar_geometria.sh
```

El script descarga el Marco Geográfico Seccional del INE (unos 86 MB), verifica su suma SHA-256 y lo simplifica con mapshaper. Para abrir el `.7z` usa `tar`, así que necesita un `tar` que lea ese formato, como el bsdtar de macOS.

### Fichas de perfil

Cada ficha del sitio tiene el botón "Descargar PNG"; conviene generarlas desde una computadora, porque la imagen respeta el ancho de la pantalla. Para reunirlas en un PDF, en el orden de los perfiles:

```bash
F=entregables/fichas
python scripts/unir_en_pdf.py $F/fichas_de_perfil.pdf \
  $F/ficha-hombres-en-rezago-persistente.png $F/ficha-hombres-de-voto-presidencial.png \
  $F/ficha-hombres-mayores-comprometidos.png $F/ficha-mujeres-urbanas-en-ascenso.png \
  $F/ficha-mujeres-de-voto-constante.png
```

## Fuentes

- INE, [Conteos Censales de Participación Ciudadana](https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/).
- INE, [Marco Geográfico Seccional](https://cartografia.ine.mx/sige8/productosCartograficos/bases) (geometría simplificada de municipios y entidades).
