import type { LineSeriesOption } from 'echarts/charts'
import type { TooltipComponentOption } from 'echarts/components'
import type { OpcionDeGrafica } from './echarts.ts'

// Espacio sobre la rejilla para la leyenda de los cinco perfiles: a 360 px ocupa cinco renglones de unos 22 px
export const ARRIBA_DE_CINCO_PERFILES = 120

/** Tooltip (skill dataviz: la capa de hover va por omisión), leyenda y aria; el tooltip por eje pone una guía vertical. */
export function baseDeGrafica(
  formatear: (valor: number | null) => string,
  tooltip: TooltipComponentOption = { trigger: 'axis' },
): OpcionDeGrafica {
  return {
    aria: { enabled: true },
    legend: { top: 0, left: 0 },
    tooltip: { ...tooltip, valueFormatter: (valor) => formatear(typeof valor === 'number' ? valor : null) },
  }
}

export function linea(name: string, data: readonly (number | null)[], color: string): LineSeriesOption {
  return { type: 'line', name, data: [...data], color }
}

export interface Serie {
  nombre: string
  datos: readonly (number | null)[]
  color: string
}

const SEPARACION_DE_NOMBRES = 7 // px hacia arriba o hacia abajo: con letra de 12 px, dos nombres al mismo valor no chocan

/**
 * Dos líneas, cada una con su nombre al final además de la leyenda (skill dataviz: identidad nunca solo por color).
 * labelLayout no separa las endLabel que chocan: el nombre de la línea que termina más arriba sube y el de la otra baja.
 */
export function dosLineasConNombre(primera: Serie, segunda: Serie): LineSeriesOption[] {
  const primeraTerminaArriba = ultimoValor(primera) >= ultimoValor(segunda)
  return [
    lineaConNombre(primera, primeraTerminaArriba ? -SEPARACION_DE_NOMBRES : SEPARACION_DE_NOMBRES),
    lineaConNombre(segunda, primeraTerminaArriba ? SEPARACION_DE_NOMBRES : -SEPARACION_DE_NOMBRES),
  ]
}

function lineaConNombre(serie: Serie, desplazamientoVertical: number): LineSeriesOption {
  return { ...linea(serie.nombre, serie.datos, serie.color), endLabel: { show: true, formatter: '{a}', offset: [0, desplazamientoVertical] } }
}

// Una serie sin datos (la judicial de Campeche) no tiene nombre al final: queda abajo
function ultimoValor({ datos }: Serie): number {
  return datos.findLast((valor) => valor !== null) ?? Number.NEGATIVE_INFINITY
}
