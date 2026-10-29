import { geoConicConformal, geoPath } from 'd3'
import type { FeatureCollection } from 'geojson'
import { feature, mesh } from 'topojson-client'
import type { TopologiaDeMexico } from '../datos/datosDelMapa.ts'
import type { Caja, Lienzo } from './encuadre.ts'

export const LIENZO: Lienzo = { ancho: 960, alto: 600 }

export interface MunicipioTrazado {
  entidad: number
  municipio: number
  trazo: string // atributo `d` del <path>
}

export interface GeometriaDelMapa {
  municipios: MunicipioTrazado[]
  bordesDeEntidad: string
  cajaDeEntidad: Map<number, Caja>
}

/** Proyecta la topología una sola vez: los trazos no cambian con el zoom, solo el transform de su grupo. */
export function prepararGeometria(topologia: TopologiaDeMexico): GeometriaDelMapa {
  const entidades = feature(topologia, topologia.objects.entidades)
  const trazar = geoPath(proyeccionDeMexico(entidades))
  return {
    municipios: feature(topologia, topologia.objects.municipios).features.map((municipio) => ({
      ...municipio.properties,
      trazo: trazar(municipio) ?? '',
    })),
    bordesDeEntidad: trazar(mesh(topologia, topologia.objects.entidades)) ?? '',
    cajaDeEntidad: new Map(entidades.features.map((entidad) => [entidad.properties.entidad, trazar.bounds(entidad)])),
  }
}

// La cónica conforme de Lambert del Marco Geográfico Seccional del INE: paralelos 17.5° y 29.5°, meridiano −102°
function proyeccionDeMexico(entidades: FeatureCollection) {
  return geoConicConformal()
    .parallels([17.5, 29.5])
    .rotate([102, 0])
    .fitSize([LIENZO.ancho, LIENZO.alto], entidades)
}
