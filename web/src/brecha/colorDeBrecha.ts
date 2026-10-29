import { interpolatePuOr, scaleDiverging } from 'd3'

export const COLOR_SIN_DATOS = '#b8b8b8'

// La misma escala para todas las elecciones: un tono significa la misma brecha en 2009, en 2024 o en la judicial
export const BRECHA_MAXIMA = 20

// Dominio invertido: interpolatePuOr va del morado (0) al naranja café (1), y el morado es "las mujeres votan más"
const escala = scaleDiverging([BRECHA_MAXIMA, 0, -BRECHA_MAXIMA], interpolatePuOr)

/** Color de la brecha mujeres − hombres, en puntos; más allá de ±20 satura. */
export function colorDeBrecha(brecha: number | null): string {
  if (brecha === null) return COLOR_SIN_DATOS
  return escala(Math.max(-BRECHA_MAXIMA, Math.min(BRECHA_MAXIMA, brecha)))
}
