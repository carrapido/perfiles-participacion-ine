export type NivelDeZoom =
  | { nivel: 'nacional' }
  | { nivel: 'entidad'; entidad: number }
  | { nivel: 'municipio'; entidad: number; municipio: number }

export const NACIONAL: NivelDeZoom = { nivel: 'nacional' }

/** En la entidad enfocada, el clic selecciona el municipio; fuera de ella, enfoca la entidad del municipio. */
export function alHacerClicEnMunicipio(nivelDeZoom: NivelDeZoom, entidad: number, municipio: number): NivelDeZoom {
  if (entidadEnfocada(nivelDeZoom) !== entidad) return { nivel: 'entidad', entidad }
  return { nivel: 'municipio', entidad, municipio }
}

/** Entidad que el mapa encuadra. Al elegir un municipio el zoom se queda en su entidad, para no perder el contexto. */
export function entidadEnfocada(nivelDeZoom: NivelDeZoom): number | null {
  return nivelDeZoom.nivel === 'nacional' ? null : nivelDeZoom.entidad
}
