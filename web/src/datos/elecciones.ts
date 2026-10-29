import type { ResultadoNacional } from './datosDelMapa.ts'

export interface OpcionDeEleccion {
  valor: number
  etiqueta: string
}

/** Las federales se nombran por su año; la judicial lleva su tipo, porque es la única de otra clase. */
export function opcionesDeEleccion(nacional: ResultadoNacional[]): OpcionDeEleccion[] {
  return nacional.map(({ anio, tipo }) => ({ valor: anio, etiqueta: tipo === 'judicial' ? `Judicial ${anio}` : `${anio}` }))
}

export function nombreDeEleccion(nacional: ResultadoNacional[], anio: number): string {
  const eleccion = nacional.find((resultado) => resultado.anio === anio)
  return eleccion ? `elección ${eleccion.tipo} ${anio}` : `elección ${anio}`
}
