import type { Perfil } from '../datos/datosDelMapa.ts'

// La judicial no entró al modelo: se compara contra la última federal para validar los perfiles
export const ULTIMA_FEDERAL = 2024
export const JUDICIAL = 2025
export const ELECCIONES_COMPARADAS: readonly string[] = [`Federal ${ULTIMA_FEDERAL}`, `Judicial ${JUDICIAL}`]

export function participacionFederal({ trayectoria }: Pick<Perfil, 'trayectoria'>): number | null {
  return trayectoria.find((punto) => punto.anio === ULTIMA_FEDERAL)?.participacion ?? null
}
