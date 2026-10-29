import { NACIONAL, type NivelDeZoom } from './nivelDeZoom.ts'

export const NOMBRE_DEL_PAIS = 'México'

export interface PasoDeLaRuta {
  etiqueta: string
  destino: NivelDeZoom
}

/** México › entidad › municipio, según el nivel de zoom; cada paso lleva de regreso a su nivel. */
export function pasosDeLaRuta(
  nivelDeZoom: NivelDeZoom,
  nombreDeEntidad: (entidad: number) => string,
  nombreDeMunicipio: (entidad: number, municipio: number) => string,
): PasoDeLaRuta[] {
  const pasos: PasoDeLaRuta[] = [{ etiqueta: NOMBRE_DEL_PAIS, destino: NACIONAL }]
  if (nivelDeZoom.nivel === 'nacional') return pasos
  const { entidad } = nivelDeZoom
  pasos.push({ etiqueta: nombreDeEntidad(entidad), destino: { nivel: 'entidad', entidad } })
  if (nivelDeZoom.nivel === 'municipio') {
    pasos.push({ etiqueta: nombreDeMunicipio(entidad, nivelDeZoom.municipio), destino: nivelDeZoom })
  }
  return pasos
}
