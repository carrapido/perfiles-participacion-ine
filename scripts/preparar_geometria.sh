#!/usr/bin/env bash
# Genera web/public/data/mexico.topo.json con los municipios y las entidades del Marco Geográfico Seccional (MGS)
# del INE. Usa las mismas claves que los CCPC (EDOCVE + MPIOCVE); las del INEGI no coinciden en el 55 % de los municipios.
# Fuente: https://cartografia.ine.mx/sige8/productosCartograficos/bases
# Uso: bash scripts/preparar_geometria.sh    (desde la raíz, después de `npm install` en web/)
set -euo pipefail

URL="https://cartografia.ine.mx/mapoteca/MGS_CCL/SHAPEFILE.7z"
SHA256="ca156dd14c83703706c310dabda1a906b952b071b7bb3c0b25ea25b6e09d176f"  # versión del 31 de enero de 2025
CARPETA="descargas/mgs"
ARCHIVO="$CARPETA/SHAPEFILE.7z"
DESTINO="web/public/data/mexico.topo.json"

main() {
  descargar_si_falta
  verificar_suma
  extraer_municipios
  convertir_a_topojson
}

descargar_si_falta() {
  mkdir -p "$CARPETA"
  [[ -f "$ARCHIVO" ]] || curl -fSL -o "$ARCHIVO" "$URL"
}

# Si el INE publica otra versión, la suma cambia: hay que volver a revisar que las claves unan con municipios.json
verificar_suma() {
  echo "$SHA256  $ARCHIVO" | shasum -a 256 -c -
}

extraer_municipios() {
  tar -xf "$ARCHIVO" -C "$CARPETA" MUNICIPIO.dbf MUNICIPIO.prj MUNICIPIO.shp MUNICIPIO.shx
}

# -clean: el MGS trae unas 9,800 rendijas de menos de 150 m entre municipios vecinos. Sin cerrarlas, los vecinos
#         no comparten bordes, la simplificación abre miles de cruces y el TopoJSON pesa casi el doble.
# -proj wgs84: d3-geo proyecta desde longitud y latitud.
# -simplify 4%: el mayor detalle que cabe en 1 MB (objetivos.md, fase 4).
# -dissolve: las entidades salen de los mismos municipios, así sus bordes coinciden.
# TopoJSON y no GeoJSON: d3-geo espera los anillos exteriores en el sentido del reloj, como TopoJSON;
# GeoJSON (RFC 7946) usa el contrario. https://d3js.org/d3-geo#d3-geo
convertir_a_topojson() {
  web/node_modules/.bin/mapshaper -i "$CARPETA/MUNICIPIO.shp" name=municipios \
    -clean \
    -proj wgs84 \
    -filter-fields ENTIDAD,MUNICIPIO \
    -rename-fields entidad=ENTIDAD,municipio=MUNICIPIO \
    -simplify 4% keep-shapes \
    -dissolve entidad + name=entidades \
    -o "$DESTINO" format=topojson 'target=*'
}

main "$@"
