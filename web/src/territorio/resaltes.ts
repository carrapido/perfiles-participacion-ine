import { claveDeMunicipio } from '../datos/datosDelMapa.ts'
import type { GeometriaDelMapa } from './geometriaDelMapa.ts'
import { entidadEnfocada, type NivelDeZoom } from './nivelDeZoom.ts'

/** Trazos que se dibujan encima del mapa para que se vea qué está enfocado (heurística 1 de Nielsen). */
export interface Resaltes {
  entidad: string | null
  municipio: string | null
}

export function resaltesDe(
  nivelDeZoom: NivelDeZoom,
  { municipios, trazoDeEntidad }: Pick<GeometriaDelMapa, 'municipios' | 'trazoDeEntidad'>,
): Resaltes {
  const entidad = entidadEnfocada(nivelDeZoom)
  return {
    entidad: entidad === null ? null : (trazoDeEntidad.get(entidad) ?? null),
    municipio: nivelDeZoom.nivel === 'municipio' ? trazoDelMunicipio(nivelDeZoom, municipios) : null,
  }
}

function trazoDelMunicipio(clave: { entidad: number; municipio: number }, municipios: GeometriaDelMapa['municipios']) {
  return municipios.find((municipio) => claveDeMunicipio(municipio) === claveDeMunicipio(clave))?.trazo ?? null
}
