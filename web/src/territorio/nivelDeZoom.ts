export type NivelDeZoom =
  | { nivel: 'nacional' }
  | { nivel: 'entidad'; entidad: number }
  | { nivel: 'municipio'; entidad: number; municipio: number }

export const NACIONAL: NivelDeZoom = { nivel: 'nacional' }

/** Entidad que el mapa encuadra. Al elegir un municipio el zoom se queda en su entidad, para no perder el contexto. */
export function entidadEnfocada(nivelDeZoom: NivelDeZoom): number | null {
  return nivelDeZoom.nivel === 'nacional' ? null : nivelDeZoom.entidad
}
