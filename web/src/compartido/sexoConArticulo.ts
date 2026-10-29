import type { Sexo } from '../datos/datosDelMapa.ts'

const CON_ARTICULO: Record<Sexo, string> = { mujeres: 'las mujeres', hombres: 'los hombres' }

export function sexoConArticulo(sexo: Sexo): string {
  return CON_ARTICULO[sexo]
}
